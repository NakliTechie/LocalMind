#!/usr/bin/env python3
"""minicpmv-vision-ref.py — a float64 numpy pass of MiniCPM-V 4.7's vision encoder (mmproj, projector `minicpmv4_7`),
the reference the WebGPU encoder is gated against. It follows llama.cpp a0e6dc738 tools/mtmd/models/minicpmv.cpp
(clip_graph_minicpmv4_6::build) and the index tables in clip.cpp (case MINICPMV4_6/4_7), op for op.

  python3 scripts/minicpmv-vision-ref.py MMPROJ.gguf INPUT OUT.npz

INPUT: a synthetic image as llama-mtmd-debug builds it, `cb:448`, `gray:448`, `white:448`, `black:448`, `red:448`,
`green:448`, `blue:448` (floats fed to the encoder as they are, no normalisation), or a .npy float array [H, W, 3]
(already preprocessed, values as the encoder sees them). H and W must be multiples of 28 (patch 14 × the 2×2 merges).
OUT.npz: `patch` [N, 1152] (patch + position embedding), `l<insert>` [N, 1152] (after layer insert_layer_id),
`merger_attn` [N, 1152], `ds` [N/4, 1152], `last` [N/4, 1152] (after the last ViT layer), `post_ln`, `out` [N/16, 2048].
"""
import math, sys
import numpy as np
from gguf import GGUFReader
from gguf.quants import dequantize

mmproj, inp, out_path = sys.argv[1:4]
r = GGUFReader(mmproj)
kv = {k: f.contents() for k, f in r.fields.items()}
T = {t.name: t for t in r.tensors}

def W(name):
    t = T[name]
    a = dequantize(t.data, t.tensor_type).astype(np.float64)
    return a.reshape([int(d) for d in reversed(t.shape)])

eps = kv['clip.vision.attention.layer_norm_epsilon']
n_head = kv['clip.vision.attention.head_count']
n_layer = kv['clip.vision.block_count']
insert = kv['clip.vision.wa_layer_indexes'][0]
patch = kv['clip.vision.patch_size']
C = kv['clip.vision.embedding_length']
d_head = C // n_head
scale = 1.0 / math.sqrt(d_head)

if inp.endswith('.npy'):
    img = np.load(inp).astype(np.float64)
else:
    kind, n = inp.split(':'); n = int(n)
    img = np.zeros((n, n, 3))
    if kind == 'white': img[:] = 1.0
    elif kind == 'gray': img[:] = 0.5
    elif kind == 'cb':
        yy, xx = np.mgrid[0:n, 0:n]
        img[:] = (((xx + yy) % 2) == 0).astype(np.float64)[:, :, None]
    elif kind in ('red', 'green', 'blue'): img[:, :, ('red', 'green', 'blue').index(kind)] = 1.0
    elif kind != 'black': raise SystemExit(f'unknown input {inp}')
Hpx, Wpx, _ = img.shape
ph, pw = Hpx // patch, Wpx // patch
N = ph * pw

def ln(x, w, b):
    m = x.mean(-1, keepdims=True); v = ((x - m) ** 2).mean(-1, keepdims=True)
    return (x - m) / np.sqrt(v + eps) * w + b

def lin(x, prefix):
    return x @ W(prefix + '.weight').T + W(prefix + '.bias')

def gelu_tanh(x): return 0.5 * x * (1.0 + np.tanh(math.sqrt(2.0 / math.pi) * (x + 0.044715 * x ** 3)))
erf = np.vectorize(math.erf)
def gelu_erf(x): return 0.5 * x * (1.0 + erf(x / math.sqrt(2.0)))

def attn(q, k, v, groups=None):
    n = q.shape[0]
    q = q.reshape(n, n_head, d_head); k = k.reshape(n, n_head, d_head); v = v.reshape(n, n_head, d_head)
    s = np.einsum('ihd,jhd->hij', q, k) * scale
    if groups is not None:
        s = np.where(groups[None, :, None] == groups[None, None, :], s, -np.inf)
    s = s - s.max(-1, keepdims=True); p = np.exp(s); p /= p.sum(-1, keepdims=True)
    return np.einsum('hij,jhd->ihd', p, v).reshape(n, C)

def vit_layer(x, il):
    p = f'v.blk.{il}'
    h = ln(x, W(p + '.ln1.weight'), W(p + '.ln1.bias'))
    x = x + lin(attn(lin(h, p + '.attn_q'), lin(h, p + '.attn_k'), lin(h, p + '.attn_v')), p + '.attn_out')
    h = ln(x, W(p + '.ln2.weight'), W(p + '.ln2.bias'))
    return x + lin(gelu_tanh(lin(h, p + '.ffn_up')), p + '.ffn_down')

def ds_idx(H, Wd):
    # concat order p0 (0,0), p1 (0,1), p2 (1,0), p3 (1,1) on an H × Wd grid
    return [np.array([(2 * i + r) * Wd + (2 * j + c) for i in range(H // 2) for j in range(Wd // 2)]) for r, c in ((0, 0), (0, 1), (1, 0), (1, 1))]

# patch embedding (conv 14×14, stride 14; weight [out, c, ky, kx]) + learned position embedding (SigLIP 70×70 buckets)
wp = W('v.patch_embd.weight')
cols = img.reshape(ph, patch, pw, patch, 3).transpose(0, 2, 4, 1, 3).reshape(N, 3 * patch * patch)
x = cols @ wp.reshape(C, -1).T + W('v.patch_embd.bias')
pos = np.array([math.floor(70 * i / ph) * 70 + math.floor(70 * j / pw) for i in range(ph) for j in range(pw)])
x = x + W('v.position_embd.weight')[pos]
res = {'patch': x}

for il in range(insert + 1): x = vit_layer(x, il)
res[f'l{insert}'] = x

# ViT merger: 2×2 window attention (each window of 4 patches attends to itself), then the 2×2 downsample
win = np.array([(i // 2) * (pw // 2) + (j // 2) for i in range(ph) for j in range(pw)])
h = ln(x, W('v.vit_merger.ln1.weight'), W('v.vit_merger.ln1.bias'))
x = x + lin(attn(lin(h, 'v.vit_merger.attn_q'), lin(h, 'v.vit_merger.attn_k'), lin(h, 'v.vit_merger.attn_v'), groups=win), 'v.vit_merger.attn_out')
res['merger_attn'] = x
p = [x[i] for i in ds_idx(ph, pw)]
mean = (p[0] + p[1] + p[2] + p[3]) * 0.25
h = ln(np.concatenate(p, -1), W('v.vit_merger.ds_ln.weight'), W('v.vit_merger.ds_ln.bias'))
x = lin(gelu_tanh(lin(h, 'v.vit_merger.ds_ffn_up')), 'v.vit_merger.ds_ffn_down') + mean
res['ds'] = x

for il in range(insert + 1, n_layer): x = vit_layer(x, il)
res['last'] = x
x = ln(x, W('v.post_ln.weight'), W('v.post_ln.bias'))
res['post_ln'] = x

# final merger: 2×2 concat on the half grid → LayerNorm → MLP (erf GELU) → 2048
p = [x[i] for i in ds_idx(ph // 2, pw // 2)]
h = ln(np.concatenate(p, -1), W('mm.input_norm.weight'), W('mm.input_norm.bias'))
x = lin(gelu_erf(lin(h, 'mm.up')), 'mm.down')
res['out'] = x
np.savez(out_path, **{k: v.astype(np.float32) for k, v in res.items()})
print(f'{inp}: {N} patches → {x.shape[0]} tokens × {x.shape[1]}; out mean {x.mean():.6f} std {x.std():.6f} first {x[0, :4]}')
