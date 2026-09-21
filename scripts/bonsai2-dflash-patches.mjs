// bonsai2-dflash-patches.mjs
// DFlash 2 speculative-decoding patches for the vendored Ternary Bonsai 2 engine
// (ternary_bonsai_2_27b.js). Applied by scripts/extract-ternary-bonsai-2-27b.mjs
// after its own patches; marker-guarded like that script (every marker must match
// exactly once, or the extractor throws and nothing is written).
//
// What they add (worked out in NakliTechie/dflash-mlx-bonsai2 lab/webgpu, see its
// RESULTS-verify-qwen35.md):
//   (a) `dspark.features` becomes a readable graph output where the Llama builder
//       already declares `verify_tokens`.
//   (b) `TernaryBonsai2.__dflashInternals`: getters onto the engine's internal graph
//       classes/functions (lazy-init wrappers resolved at access time) so the runner
//       module can build sessions on the engine's own compile stack.
//   (c) the seam: `specDecodeRunner()` returns `this.dflashRunner` (set by the
//       worker) instead of null; the engine's generate path already routes through it.
//   (d) qwen35 verify mode: `lh(model, cache, T, opts)` gains an optional 4th arg
//       {tapLayers, allRowsHead, smallM, teeRecurrence}; without it the emitted graph
//       is byte-identical to upstream's.
//   (e) `com.xenova.Lut2SmallMGemm` (M<=8 ternary GEMM, bonsai2-smallm-op.mjs) as
//       the verify-time projection + head path — the engine's own small-batch path
//       costs 8 decode steps for an 8-token block.
//   (f) recurrence tee + `RewindSession`: after a rollback, recompute only the
//       linear-attention conv/recurrent state for the accepted rows (7–10 ms) instead
//       of replaying them through the full model (50–118 ms).
import { smallMOpPackage, SMALLM_OP_ID } from './bonsai2-smallm-op.mjs';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function applyDFlashPatches(src) {
  let out = src;
  const once = (re, what) => {
    const m = out.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'));
    if (!m || m.length !== 1) throw new Error(`bonsai2 dflash patch: ${what}: expected 1 match, got ${m ? m.length : 0}`);
  };
  const lit = (s) => new RegExp(esc(s));
  const replaceOnce = (marker, repl, what) => { once(lit(marker), what); out = out.replace(marker, repl); };

  // (a) dspark.features output at the Llama all-rows head site.
  replaceOnce('B.output(L,"verify_tokens"),we={tokens:L,', 'B.output(L,"verify_tokens"),ne&&B.output(ne,"dspark.features"),we={tokens:L,', 'verify_tokens output site');

  // (c) the seam.
  replaceOnce('specDecodeRunner(){return null}', 'specDecodeRunner(){return this.dflashRunner??null}', 'specDecodeRunner seam');

  // (b) internals hook, inserted before the export line (same module scope).
  const exportLine = 'export{Cl as DEFAULT_GGUF_FILE,Ri as DEFAULT_MODEL_ID,zl as TernaryBonsai2,';
  once(lit(exportLine), 'export line');
  for (const id of ['I0', 'X2']) once(new RegExp(`function ${id}\\(`), `internal function ${id}`);
  for (const id of ['M0', 'K2', 'f0', 'ch']) once(new RegExp(`\\b${id}=class`), `internal class ${id}`);
  once(/function lh\(e,t,r\)\{/, 'internal function lh (qwen35 prefill emission)');
  once(/var ch,dh=A\(/, 'lazy init wrapper dh for ch');
  once(/var u0,ba,wi=A\(/, 'lazy init wrapper wi for ba');
  for (const id of ['_i', 'fi', 'bi', 's0', 'Xs', 'et', 'Cu', 'pi', 'a0', 'N2', 'dc', 'fc', 'ht', 'f2', 'o0', 'ki', 'E0', 'r2']) once(new RegExp(`function ${id}\\(`), `internal function ${id}`);
  const internals = 'zl.__dflashInternals={get I0(){return I0},get X2(){return X2},get M0(){return M0},get K2(){return K2},get f0(){return f0},get ch(){dh();return ch},get lh(){return lh},get ba(){wi();return ba},get _i(){return _i},get fi(){return fi},get bi(){return bi},get s0(){return s0},get Xs(){return Xs},get et(){return et},get Cu(){return Cu},get pi(){return pi},get a0(){return a0},get N2(){return N2},get dc(){return dc},get fc(){return fc},get r2(){return r2},get ht(){return ht},get RewindSession(){return $RewindSession}};';

  // (d) qwen35 verify mode.
  replaceOnce('function lh(e,t,r){', 'function lh(e,t,r,$v){', 'lh signature');
  replaceOnce(
    'Je=Se(T0({g:J,w:re,weights:ke,model:e,ids:Oe,act:G,H:s,vocab:o,T:a,embedOffset:ie.embed_tokens}),"embed_tokens",!0);for(let te=0;te<i;++te){let ge=e.offsets.layers[te],',
    'Je=Se(T0({g:J,w:re,weights:ke,model:e,ids:Oe,act:G,H:s,vocab:o,T:a,embedOffset:ie.embed_tokens}),"embed_tokens",!0);' +
    'let $n=$v?.tapLayers?.length??0,$f=$n>0?J.scratch("dspark.features",k,[a,$n*s]):null;' +
    'for(let te=0;te<i;++te){if($f){let $i=$v.tapLayers.indexOf(te);$i>=0&&J.op("com.xenova.StridedCopy",{srcT:Je,dstT:$f},{args:{rows:a,srcStride:s,srcStart:0,dstStride:$n*s,dstStart:$i*s,copyCols:s}})}let ge=e.offsets.layers[te],',
    'lh embed + layer-loop head');
  const kiLoop = 'for(let $r=0;$r<a;++$r)ki(J,{w:re,model:e,hidden:J.view(Je,$r*s,G,[s],`V.row${$r}`),weights:ke,ids:$t,hiddenSize:s,vocabSize:o,rmsEps:l,finalNormOffset:ie.model_norm,lmHeadOffset:ie.lm_head,q1:O,normedDtype:O&&S?"float16":"float32",nameSuffix:`V.r${$r}.`,outputOffset:$r});';
  const smallMHead =
    'let $sm=$v.smallM??globalThis.__dflashSmallM;' +
    'if($sm&&e.lmHeadQ4&&e.lmHeadQ4Scales&&e.lmHeadLut===9&&e.config.prismHadamard?.weights.includes("output.weight")){' +
    'let $nrm=s0(J,e,re)(Je,"lm_head",{weights:ke,eps:l,offset:ie.model_norm},"V.head.normed"),$lg=J.scratch("V.head.logits","float32",[a,o]);' +
    'J.op("com.xenova.Lut2SmallMGemm",{aT:J.view($nrm,0,"float32",[a,s],"V.head.input"),bitsT:re("V.head.bits",e.lmHeadQ4),scalesT:re("V.head.scales",e.lmHeadQ4Scales),yT:$lg},{args:{M:a,inFeatures:s,outFeatures:o,blockOffset:0,outStride:o,dstColStart:0,lut:9,precision:$sm.headPrecision??$sm.precision??"f16",kSplits:1}});' +
    'let $am=J.op("ai.onnx.ArgMax",{x:$lg},{attrs:{axis:1,keepdims:0}}).y;' +
    'J.op("com.xenova.StridedCopy",{srcT:J.storageView($am,{dtype:"uint32",shape:[a],name:"V.head.tokens"}),dstT:$t},{args:{rows:a,srcStride:1,dstStride:1,copyCols:1}});' +
    'J.output($lg,"verify_logits")}else ' + kiLoop;
  replaceOnce(
    'Ee(te,ge,Je)}let Ze=J.nodeCount,st=E0({g:J,w:re,weights:ke,model:e,hidden:Je,act:G,H:s,vocab:o,T:a,eps:l,finalNormOffset:ie.model_norm,lmHeadOffset:ie.lm_head});return{graph:J.finish({name:"qwen35-prefill",params:{T:a}}),weights:me,states:ne,paramsName:"params",lastRowUniform:st,...L?{realRowsInput:L.name}:{},nextTokenTailNodeCount:J.nodeCount-Ze}}',
    'Ee(te,ge,Je)}$f&&J.output($f,"dspark.features");let Ze=J.nodeCount,$p;' +
    'if($v?.allRowsHead){let $t=J.scratch("verify_tokens","uint32",[a]);' + smallMHead +
    'J.output($t,"verify_tokens"),$p={tokens:$t,uni:J.uniform("next_token_pick_uni",32)}}' +
    'let st=E0({g:J,w:re,weights:ke,model:e,hidden:Je,act:G,H:s,vocab:o,T:a,eps:l,finalNormOffset:ie.model_norm,lmHeadOffset:ie.lm_head,...$p?{nextTokenPick:$p}:{}});' +
    'return{graph:J.finish({name:"qwen35-prefill",params:{T:a}}),weights:me,states:ne,paramsName:"params",lastRowUniform:st,...$p?{nextTokenPickUniform:$p.uni.name}:{},...L?{realRowsInput:L.name}:{},nextTokenTailNodeCount:J.nodeCount-Ze}}',
    'lh tail (E0 + return)');

  // (e) small-M GEMM op: register the package in the op override map and route the packed projections.
  once(lit('var Ds,Lf,Df=A('), 'lazy init wrapper Df for the op override map Lf');
  const g2Sig = 'function G2({g:e,model:t,denseW:r,q4w:u,q1w:a,q1RealLenT:s,realRowsT:i,T:n,H:o,inter:l,eps:c,actGemm:d,fusedQ4:f,q1Activation:p,transformInput:h}){';
  replaceOnce(g2Sig, g2Sig.replace('transformInput:h}){', 'transformInput:h,smallM:$smallM}){'), 'G2 signature');
  replaceOnce('R=(k,b,T,I,$,X,Q,V)=>{let K=',
    'R=(k,b,T,I,$,X,Q,V)=>{let $sm=$smallM??globalThis.__dflashSmallM;' +
    'if($sm&&x(b)&&b.lut===9&&n>=1&&n<=8&&$%256===0&&I%64===0&&T%8===0){' +
    'let $tiles=Math.ceil(I/64),$ch=$/256,$ks=1;for(const $d of[1,2,4,5,8,10,16,20]){if($ch%$d===0){$ks=$d;if($tiles*$d>=256)break}}' +
    'return e.op("com.xenova.Lut2SmallMGemm",{aT:k,bitsT:b.bitsT,scalesT:b.scalesT,yT:X},{args:{M:n,inFeatures:$,outFeatures:I,blockOffset:T,outStride:Q,dstColStart:V,lut:b.lut,precision:$sm.precision??"f16",kSplits:$sm.kSplits??$ks}}).yT}' +
    'let K=', 'G2 packed projection emitter R');
  replaceOnce('{projInto:ce,proj:ae,mlpInto:Ee}=G2({transformInput:Se,g:J,', '{projInto:ce,proj:ae,mlpInto:Ee}=G2({transformInput:Se,smallM:$v?.smallM,g:J,', 'lh call into G2');

  // (f) recurrence tee + RewindSession.
  replaceOnce('let jt=J.op("com.xenova.Qwen35LinearAttention",{stateT:xe,qT:It,kT:it,vT:St,gateT:qt,',
    '$v?.teeRecurrence&&(J.output(Ae,`rw.bcx.${te}`),J.output(xt,`rw.gate.${te}`));let jt=J.op("com.xenova.Qwen35LinearAttention",{stateT:xe,qT:It,kT:it,vT:St,gateT:qt,',
    'lh linear-attention op site (tee)');
  once(/,su=e=>Number\(Math\.pow\(e,-\.5\)\.toPrecision\(9\)\),/, 'su (linear-attention scale helper)');
  const rewindClass = 'class $RewindSession{constructor(e,t,r,u){this.model=e,this.cache=t,this.T=r,this.verify=u,this.steps=[],this.compiled=null,this.emission=null,this.pack=null}' +
    'async build(){wi();let e=this.model,t=this.cache,a=this.T,u=e.config,v=u.layer_types,g=u.linear_key_dim,w=u.linear_value_dim,M=u.linear_conv_dim,D=u.linear_conv_kernel_dim,q=D-1,x=u.linear_num_key_heads,y=u.linear_num_value_heads,P=u.linear_key_head_dim,R=u.linear_value_head_dim,W=su(P),U=Math.max(64,ku(P)),B=Math.max(64,ku(P)),' +
    'J=new ba,{w:re,state:H,boundWeights:me,states:ne}=_i(J),ee=pi(re,e),Z=J.uniform("params",16),ins={},layers=[];' +
    'for(let te=0;te<u.num_hidden_layers;++te){if(v[te]!=="linear_attention")continue;if(!t.linearConvStates?.[te]||!t.linearRecurrentStates?.[te])throw new Error(`RewindSession: linear layer ${te} is missing conv/recurrent state`);layers.push(te);let ge=e.offsets.layers[te],' +
    'Be=H(`linear.conv.${te}`,ht(t.linearConvStates[te],0,M*q)),xe=H(`linear.rec.${te}`,ht(t.linearRecurrentStates[te],0,y*P*R)),' +
    'bcx=J.input(`rw.bcx.${te}`,"float32",[a,M]),gate=J.input(`rw.gate.${te}`,"float32",[a,2*y]);' +
    'ins[`rw.bcx.${te}`]=this.verify.compiled.tensor(`rw.bcx.${te}`),ins[`rw.gate.${te}`]=this.verify.compiled.tensor(`rw.gate.${te}`);' +
    'let It=J.scratch(`L${te}.lq`,"float32",[a,g]),it=J.scratch(`L${te}.lk`,"float32",[a,g]),St=J.scratch(`L${te}.lv`,"float32",[a,w]);' +
    'J.op("com.xenova.Qwen35PrefillConv",{bcxT:bcx,weightsT:ee(te),convStatesT:Be,qT:It,kT:it,vT:St,params:Z},{args:{keyDim:g,valueDim:w,convDim:M,convKernel:D,convWeightOffset:ge.linear_conv_weight,seqLen:a}});' +
    'J.op("com.xenova.Qwen35LinearAttention",{stateT:xe,qT:It,kT:it,vT:St,gateT:gate,outT:J.scratch(`L${te}.lattn`,"float32",[a,w]),params:Z},{args:{numHeads:y,numKeyHeads:x,headDimK:P,headDimV:R,scale:W,seqLen:a,workgroupSize:B,l2WorkgroupSize:U}})}' +
    'this.layers=layers,this.dims={convDim:M,convState:q,numHeads:y,headDimK:P,headDimV:R},this.emission={graph:J.finish({name:"qwen35-rewind",params:{T:a}}),weights:me,states:ne,inputs:ins,paramsName:"params"};' +
    'let c=Xs(this.emission.graph,e.runtime,{weights:me,states:ne,inputs:ins});this.compiled=c;try{this.steps=await c.buildSteps()}catch(err){this.steps=[],this.compiled=null,o0(err,c)}this.pack=f2(this.emission.graph,"params",c.nodeVariants);return this}' +
    'run(n){if(!this.compiled)throw new Error("RewindSession is not built");if(!Number.isInteger(n)||n<1||n>this.T)throw new Error(`RewindSession.run: rows ${n} outside 1..${this.T}`);' +
    'this.model.runtime.host.writeBuffer(this.compiled.uniformBuffer("params"),0,this.pack({past_len:0,cache_len:this.cache.maxLength,seq_len:this.T,real_len:n})),this.compiled.collector.enqueue(this.steps)}' +
    'dispose(){this.compiled?.dispose(),this.compiled=null,this.steps=[]}}';
  once(/function ku\(/, 'ku (workgroup size helper)');

  // Registration + hook + class, all before the export line.
  const pkg = smallMOpPackage();
  out = out.replace(exportLine, `Df();Lf.set(${JSON.stringify(SMALLM_OP_ID)},${JSON.stringify(pkg)});` + rewindClass + internals + exportLine);
  return out;
}
