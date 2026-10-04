// build-gemma-4-e2b.mjs
// Produce LocalMind's vendored `gemma-4-e2b.js` (exporting `Gemma4Mobile`) from the upstream
// webml-community/gemma-4-webgpu-kernels Space bundle plus LocalMind's patches. The upstream file
// is minified build output with no published source, so the patches are marker-guarded string
// surgery in the house style of scripts/extract-ternary-bonsai-2-27b.mjs: every marker must match
// exactly once, or the script throws and writes nothing.
//
//   node scripts/build-gemma-4-e2b.mjs            # fetches the pinned upstream revision
//   node scripts/build-gemma-4-e2b.mjs <file>     # or patches a local copy of it
//
// The patches add one optional load option, `Gemma4Mobile.load(id, { ple })`, which serves the
// per-layer embedding (PLE) table from OPFS instead of keeping it resident on the GPU (see
// ple-opfs.js). Without `ple` every graph is built exactly as upstream builds it.
//   (a) load() and fromSnapshot() pass `ple` through to the weight loader.
//   (b) the loader hands the PLE tensors' bytes to ple.attach(), which writes the OPFS file and
//       returns a small GPU row table; on null (no OPFS) it uploads the table resident as before.
//   (c) the decode, prefill-block and whole-sequence graphs gather PLE rows through their own ids
//       tensor (table slots) instead of the token ids; the gather kernel itself is unchanged.
//   (d) each prefill block looks its tokens up before it is submitted. Decode either looks each
//       token up on the CPU and runs one step at a time, or (with ple.mapT, a GPU copy of the
//       token->slot map) keeps two steps in flight: a one-thread kernel at the start of each step
//       maps the token to its slot, and a step whose token was not resident is replayed
//       (scripts/gemma-4-e2b-ple.inc.js, spliced in verbatim).
//   (e) dispose() closes the OPFS handles; pleMode / pleStats report the mode.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const UPSTREAM_REV = '158f16ae0f672943ca304d59c47c8e3a264e399e';
const UPSTREAM_URL = `https://huggingface.co/spaces/webml-community/gemma-4-webgpu-kernels/raw/${UPSTREAM_REV}/gemma-4-e2b.js`;
const UPSTREAM_SHA256 = '0234c0e866bfaa9623e938a7cfa7f5740cca22532cc1112dd4e8915b97f78d62';

export function applyGemmaPatches(src, helpers) {
  let out = src;
  const replaceOnce = (marker, repl, what) => {
    const n = out.split(marker).length - 1;
    if (n !== 1) throw new Error(`gemma-4-e2b patch: ${what}: expected 1 match, got ${n}`);
    out = out.replace(marker, () => repl);
  };

  replaceOnce(
    '// Gemma-4 E2B (QAT mobile) WebGPU chat bundle. Import { Gemma4Mobile } from this file.\n',
    '// Gemma-4 E2B (QAT mobile) WebGPU chat bundle. Import { Gemma4Mobile } from this file.\n' +
      `// Built by LocalMind scripts/build-gemma-4-e2b.mjs from webml-community/gemma-4-webgpu-kernels@${UPSTREAM_REV.slice(0, 7)}:\n` +
      '// adds load(id, { ple }) to serve the per-layer embedding table from OPFS (see ple-opfs.js).\n',
    'header line',
  );

  // (a) thread `ple` through load() -> fromSnapshot() -> the weight loader ro().
  replaceOnce('let f=await Wr.fromSnapshot(i,a,mn,{cache:r.cache,', 'let f=await Wr.fromSnapshot(i,a,mn,{ple:r.ple,cache:r.cache,', 'load() -> fromSnapshot()');
  replaceOnce('let l=await ro(n,i,u,{onProgress:a.onProgress??null,signal:a.signal});', 'let l=await ro(n,i,u,{ple:a.ple,onProgress:a.onProgress??null,signal:a.signal});', 'fromSnapshot() -> ro()');

  // (b) the PLE tensors go to ple.attach(); the resident upload is the fallback.
  const pleLoad = 'o(`${gn}.embed_tokens_per_layer`,n.vocab_size_per_layer_input,n.num_hidden_layers*n.hidden_size_per_layer_input,4,n.num_hidden_layers,c=>{l.embedTokensPerLayer=c}),';
  replaceOnce(
    pleLoad,
    '(t.ple?a.push(Ln({names:[`${gn}.embed_tokens_per_layer.embedding_quantized`,`${gn}.embed_tokens_per_layer.embedding_scale`],progressLabel:`${gn}.embed_tokens_per_layer`,run:async E=>{' +
      'let $c=`${gn}.embed_tokens_per_layer`,b=E[`${$c}.embedding_quantized`],W=E[`${$c}.embedding_scale`];if(!b||!W)throw new Error(`Missing tensors for ${$c}`);' +
      'let d=n.vocab_size_per_layer_input,p=n.num_hidden_layers*n.hidden_size_per_layer_input,m=n.num_hidden_layers,q=b.byteLength*8/(d*p);' +
      'let P=q===4?await t.ple.attach({bits:new Uint8Array(b.buffer,b.byteOffset,b.byteLength),scale:new Uint8Array(W.buffer,W.byteOffset,W.byteLength),vocab:d,hidden:p,groups:m,codeBits:q,device:e.host.device,' +
      'alloc:(B,T,S,L)=>e.allocateWeightsBuffer({byteLength:B,dtype:T,shape:S,label:L})}):null;' +
      'if(P){l.embedTokensPerLayer={bitsT:P.bitsT,scaleT:P.scaleT,bits:q,ple:P};return}' +
      'let G=e.allocateWeightsBuffer({byteLength:b.byteLength,dtype:"uint32",shape:[d,p*q/32],label:`${$c}.bits`});e.writeWeightsRange(G,0,b);' +
      'let C=e.tensorFromTypedArray("float32",[d,m],$e(W));l.embedTokensPerLayer={bitsT:G,scaleT:C,bits:q}}})):' +
      pleLoad.slice(0, -1) + '),',
    'PLE loader',
  );

  // (c) decode graph: its own [1] slot-ids tensor.
  replaceOnce(
    's.qatEmbed({idsT:this.idsT,bitsT:a.embedTokensPerLayer.bitsT,scaleT:a.embedTokensPerLayer.scaleT,yT:w,seq:b,hidden:l,vocab:t.vocab_size_per_layer_input,',
    's.qatEmbed({idsT:a.embedTokensPerLayer.ple?(this.pleIdsT=this.uploadOwned([b],new Uint32Array(b))):this.idsT,bitsT:a.embedTokensPerLayer.bitsT,scaleT:a.embedTokensPerLayer.scaleT,yT:w,seq:b,hidden:l,vocab:a.embedTokensPerLayer.ple?a.embedTokensPerLayer.ple.slots:t.vocab_size_per_layer_input,',
    'decode graph PLE gather',
  );
  // (c) prefill-block graph: its own [blockLen] slot-ids tensor.
  replaceOnce(
    's.qatEmbed({idsT:this.idsT,bitsT:a.embedTokensPerLayer.bitsT,scaleT:a.embedTokensPerLayer.scaleT,yT:K,seq:i,hidden:p,vocab:t.vocab_size_per_layer_input,',
    's.qatEmbed({idsT:a.embedTokensPerLayer.ple?(this.pleIdsT=this.uploadOwned([i],new Uint32Array(i))):this.idsT,bitsT:a.embedTokensPerLayer.bitsT,scaleT:a.embedTokensPerLayer.scaleT,yT:K,seq:i,hidden:p,vocab:a.embedTokensPerLayer.ple?a.embedTokensPerLayer.ple.slots:t.vocab_size_per_layer_input,',
    'prefill-block graph PLE gather',
  );
  // (c) whole-sequence fallback graph: its own rows for these ids, gathered with iota ids.
  replaceOnce(
    'H=P([c,m],"g4-ple-proj");S.qatEmbed({idsT:ne,bitsT:l.embedTokensPerLayer.bitsT,scaleT:l.embedTokensPerLayer.scaleT,yT:we,seq:c,hidden:m,vocab:u.vocab_size_per_layer_input,',
    'H=P([c,m],"g4-ple-proj"),$g=l.embedTokensPerLayer.ple?l.embedTokensPerLayer.ple.gather(n):null;' +
      'S.qatEmbed({idsT:$g?N([c],Uint32Array.from({length:c},(x,k)=>k)):ne,bitsT:$g?N([c,$g.bits.length/c],$g.bits):l.embedTokensPerLayer.bitsT,scaleT:$g?N([c,$g.scale.length/c],$g.scale):l.embedTokensPerLayer.scaleT,yT:we,seq:c,hidden:m,vocab:$g?c:u.vocab_size_per_layer_input,',
    'whole-sequence graph PLE gather',
  );

  // (d) look the step's tokens up before the step is submitted.
  replaceOnce(
    'n!==null&&s.writeBuffer(this.idsT.buffer,0,new Uint32Array([n])),rn.write(s,a,this.rope,r,o);',
    'n!==null&&s.writeBuffer(this.idsT.buffer,0,new Uint32Array([n])),this.pleIdsT&&$pleStepIds(this,s,n),rn.write(s,a,this.rope,r,o);',
    'decode step inputs',
  );
  replaceOnce(
    'i.set(n),s.writeBuffer(this.idsT.buffer,0,i),rn.write(s,a,this.rope,r,o);',
    'i.set(n),s.writeBuffer(this.idsT.buffer,0,i),this.pleIdsT&&s.writeBuffer(this.pleIdsT.buffer,0,this.model.weights.embedTokensPerLayer.ple.lookup(i)),rn.write(s,a,this.rope,r,o);',
    'prefill-block inputs',
  );
  replaceOnce(
    'if(vo>1){if(o&&Rr(d,s)',
    'if(this.weights.embedTokensPerLayer.ple?.mapT){if(o&&Rr(d,s)||(yield d,p+=1,p>=a))return;f=await this.#s(r,u);yield*$plePipelined(f,r,this.weights.embedTokensPerLayer.ple,d,u,a-p,W=>o&&Rr(W,s));return}' +
      'if(vo>1&&!this.weights.embedTokensPerLayer.ple){if(o&&Rr(d,s)',
    'decode loop: replayed pipeline with a GPU map, one step at a time without',
  );
  replaceOnce(
    's.argmax({xT:X,outT:this.idsT,count:p}),this.steps=await s.buildSteps()',
    's.argmax({xT:X,outT:this.idsT,count:p}),this.steps=await s.buildSteps(),this.pleIdsT&&a.embedTokensPerLayer.ple.mapT&&this.steps.unshift($pleLookupStep(r,this.idsT,a.embedTokensPerLayer.ple.mapT,this.pleIdsT))',
    'decode program: slot lookup first',
  );
  replaceOnce('var vo=4;', 'var vo=4;\n' + helpers.replace(/^\/\/.*\n/gm, '').trim() + '\n', 'module-scope helpers');

  // (e) close the OPFS handles; report the mode.
  replaceOnce('this.#e.length=0,en(this.weights)}', 'this.#e.length=0,this.weights.embedTokensPerLayer?.ple?.close(),en(this.weights)}', 'dispose closes OPFS');
  replaceOnce(
    'get _model(){return this.#n}',
    'get pleMode(){return this.#n.weights.embedTokensPerLayer?.ple?"opfs":"resident"}' +
      'get pleStats(){let P=this.#n.weights.embedTokensPerLayer?.ple;return P?{...P.cache.stats,slots:P.slots,wroteMs:P.wroteMs,warmMs:P.warmMs}:null}' +
      'get _model(){return this.#n}',
    'pleMode / pleStats getters',
  );
  return out;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const arg = process.argv[2];
  const src = arg ? await readFile(arg, 'utf8') : await (await fetch(UPSTREAM_URL)).text();
  const sha = createHash('sha256').update(src).digest('hex');
  if (sha !== UPSTREAM_SHA256) console.error(`warning: upstream sha256 ${sha} != pinned ${UPSTREAM_SHA256}; markers still guard the patches`);
  const helpers = await readFile(fileURLToPath(new URL('./gemma-4-e2b-ple.inc.js', import.meta.url)), 'utf8');
  const out = applyGemmaPatches(src, helpers);
  const dest = new URL('../gemma-4-e2b.js', import.meta.url);
  await writeFile(dest, out);
  console.error(`wrote ${dest.pathname} (${out.length} bytes, +${out.length - src.length} over upstream)`);
}
