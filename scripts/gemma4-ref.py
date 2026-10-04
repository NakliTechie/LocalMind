#!/usr/bin/env python3
"""gemma4-ref.py — a numpy forward pass of Gemma 4 26B-A4B (GGUF arch `gemma4`, MoE) for debugging the
WebGPU engine (gemma4_moe_ssd.js) layer by layer. It follows llama.cpp b9830's src/models/gemma4.cpp op for op
in f32, with the K/V cache rounded to f16 as llama.cpp stores it.

  PYTHONPATH=~/Code/llama.cpp-tokprobs/gguf-py python3 scripts/gemma4-ref.py MODEL.gguf IDS_JSON OUT.npz

IDS_JSON: a JSON list of token ids, or a llama-ref.mjs result file plus `#name` (e.g. ref.json#capital).
OUT.npz: `layers` [L, T, H] (each layer's output), `attn_out` [L, T, H] (after the attention residual),
`logits` [V] (last position, softcapped), `raw_logits` [V] (before the softcap), `sel` [L, T, 8] router picks, `margin` [L, T] the 8th pick's lead over the 9th (relative).
Prints the top 5 of the last position as log-probabilities, to set beside llama.cpp's `top` lists.
The whole prompt runs as one batch per layer, so each layer's weights are dequantized once.
"""
import json, sys
import numpy as np
from gguf import GGUFReader
from gguf.quants import dequantize

model, ids_arg, out_path = sys.argv[1:4]
if '#' in ids_arg:
    path, name = ids_arg.split('#')
    ids = next(r['ids'] for r in json.load(open(path))['results'] if r['name'] == name)
else:
    ids = json.load(open(ids_arg))

r = GGUFReader(model)
kv = {k: f.contents() for k, f in r.fields.items() if not k.startswith('tokenizer.')}
T = {t.name: t for t in r.tensors}
g = lambda k: kv[f'gemma4.{k}']
L, H = g('block_count'), g('embedding_length')
NH, eps, window = g('attention.head_count'), np.float32(g('attention.layer_norm_rms_epsilon')), g('attention.sliding_window')
swa = g('attention.sliding_window_pattern'); kvh = g('attention.head_count_kv')
if not isinstance(kvh, list): kvh = [kvh] * L
K = g('expert_used_count'); softcap = np.float32(g('final_logit_softcapping') or 0)

def W(name):
    t = T[name]
    return dequantize(np.asarray(t.data), t.tensor_type).astype(np.float32, copy=False)

def rms(x, w=None):
    s = np.float32(1) / np.sqrt(np.mean(x * x, axis=-1, keepdims=True, dtype=np.float32) + eps)
    y = (x * s).astype(np.float32)
    return y * w if w is not None else y

def gelu(x):
    return (np.float32(0.5) * x * (np.float32(1) + np.tanh(np.float32(np.sqrt(2 / np.pi)) * x * (np.float32(1) + np.float32(0.044715) * x * x)))).astype(np.float32)

def rope(x, pos, base, ff):
    # NeoX pairs (i, i + d/2); theta = pos · base^(-2i/d) / ff[i], f32 as llama.cpp's Metal kernel forms it.
    d = x.shape[-1]; half = d // 2
    i = np.arange(half, dtype=np.float32)
    inv = np.power(np.float32(base), np.float32(-1.0 / d) * (2 * i)).astype(np.float32)
    th = (pos[:, None].astype(np.float32) * inv[None, :]).astype(np.float32)
    if ff is not None: th = (th / ff[None, :]).astype(np.float32)
    c, s = np.cos(th)[:, None, :], np.sin(th)[:, None, :]
    a, b = x[..., :half], x[..., half:]
    return np.concatenate([a * c - b * s, a * s + b * c], axis=-1).astype(np.float32)

n = len(ids); pos = np.arange(n)
emb = T['token_embd.weight']
x = dequantize(np.asarray(emb.data)[ids], emb.tensor_type).astype(np.float32) * np.float32(np.sqrt(H))
ropefreqs = np.asarray(T['rope_freqs.weight'].data, dtype=np.float32) if 'rope_freqs.weight' in T else None
layers, attn_outs, sels, margins = [], [], [], []
for l in range(L):
    p = lambda s: f'blk.{l}.{s}'
    is_swa = bool(swa[l]) if isinstance(swa, list) else bool(swa)
    hd = g('attention.key_length_swa') if is_swa else g('attention.key_length')
    base = g('rope.freq_base_swa') if is_swa else g('rope.freq_base')
    ff = None if is_swa else ropefreqs
    nk = kvh[l]
    xn = rms(x, W(p('attn_norm.weight')))
    q = (xn @ W(p('attn_q.weight')).T).reshape(n, NH, hd)
    kraw = (xn @ W(p('attn_k.weight')).T).reshape(n, nk, hd)
    vraw = (xn @ W(p('attn_v.weight')).T).reshape(n, nk, hd) if p('attn_v.weight') in T else kraw
    q = rope(rms(q, W(p('attn_q_norm.weight'))), pos, base, ff)
    k = rope(rms(kraw, W(p('attn_k_norm.weight'))), pos, base, ff)
    v = rms(vraw)
    k16, v16 = k.astype(np.float16).astype(np.float32), v.astype(np.float16).astype(np.float32)
    att = np.zeros((n, NH, hd), np.float32)
    grp = NH // nk
    for h in range(NH):
        sc = q[:, h, :] @ k16[:, h // grp, :].T                         # scale 1.0
        mask = pos[None, :] > pos[:, None]
        if is_swa: mask |= (pos[:, None] - pos[None, :]) >= window
        sc = np.where(mask, -np.inf, sc).astype(np.float32)
        sc = np.exp(sc - sc.max(axis=1, keepdims=True)); sc /= sc.sum(axis=1, keepdims=True)
        att[:, h, :] = sc @ v16[:, h // grp, :]
    o = att.reshape(n, NH * hd) @ W(p('attn_output.weight')).T
    x = (rms(o, W(p('post_attention_norm.weight'))) + x).astype(np.float32)   # attn_out
    attn_outs.append(x.copy())
    # dense MLP (the shared expert)
    m = rms(x, W(p('ffn_norm.weight')))
    m = (gelu(m @ W(p('ffn_gate.weight')).T) * (m @ W(p('ffn_up.weight')).T)) @ W(p('ffn_down.weight')).T
    m = rms(m, W(p('post_ffw_norm_1.weight')))
    # router on attn_out
    tmp = rms(x) * np.float32(1 / np.sqrt(H)) * W(p('ffn_gate_inp.scale'))
    lg = tmp @ W(p('ffn_gate_inp.weight')).T                            # [n, E]
    pr = np.exp(lg - lg.max(axis=1, keepdims=True)); pr /= pr.sum(axis=1, keepdims=True)
    sel = np.argsort(-pr, axis=1, kind='stable')[:, :K]
    wts = np.take_along_axis(pr, sel, axis=1); wts = wts / wts.sum(axis=1, keepdims=True)
    sels.append(sel)
    srt = np.sort(pr, axis=1)[:, ::-1]
    margins.append((srt[:, K - 1] - srt[:, K]) / srt[:, K - 1])          # 8th vs 9th pick, relative
    xm = rms(x, W(p('pre_ffw_norm_2.weight')))
    gu_t, dn_t = T[p('ffn_gate_up_exps.weight')], T[p('ffn_down_exps.weight')]
    gu_raw, dn_raw = np.asarray(gu_t.data), np.asarray(dn_t.data)
    dscale = W(p('ffn_down_exps.scale'))
    moe = np.zeros((n, H), np.float32)
    cache = {}
    for t in range(n):
        acc = None
        for j in range(K):
            e = int(sel[t, j])
            if e not in cache:
                cache[e] = (dequantize(gu_raw[e], gu_t.tensor_type).astype(np.float32), dequantize(dn_raw[e], dn_t.tensor_type).astype(np.float32))
            gu, dn = cache[e]
            h2 = gu @ xm[t]                                              # [2F]: gate | up
            F = h2.shape[0] // 2
            y = ((dn @ (gelu(h2[:F]) * h2[F:])) * dscale[e] * wts[t, j]).astype(np.float32)
            acc = y if acc is None else (acc + y).astype(np.float32)
        moe[t] = acc
    moe = rms(moe, W(p('post_ffw_norm_2.weight')))
    cur = rms((m + moe).astype(np.float32), W(p('post_ffw_norm.weight')))
    x = ((cur + x) * W(p('layer_output_scale.weight'))[0]).astype(np.float32)
    layers.append(x.copy())
    print(f'layer {l}: swa={is_swa} hd={hd} kv={nk} |x|={np.abs(x[-1]).max():.3f} sel[-1]={sel[-1].tolist()}', file=sys.stderr)

h = rms(x[-1], W('output_norm.weight'))
V = int(emb.shape[-1]); raw = np.empty(V, np.float32)
data = np.asarray(emb.data)
for r0 in range(0, V, 16384):
    raw[r0:r0 + 16384] = dequantize(data[r0:r0 + 16384], emb.tensor_type).astype(np.float32) @ h
logits = (np.tanh(raw / softcap) * softcap).astype(np.float32) if softcap else raw
lse = logits.max() + np.log(np.exp(logits - logits.max()).sum())
top = np.argsort(-logits, kind='stable')[:5]
print(json.dumps({'top': [[int(i), round(float(logits[i] - lse), 5)] for i in top], 'raw_top': [[int(i), round(float(raw[i]), 4)] for i in top]}))
np.savez(out_path, layers=np.stack(layers), attn_out=np.stack(attn_outs), logits=logits, raw_logits=raw, sel=np.stack(sels), margin=np.stack(margins), ids=np.array(ids))
