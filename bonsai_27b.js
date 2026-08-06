/* bonsai_27b.js — vendored engine, extracted near-verbatim from the
   webml-community/bonsai-webgpu-kernels HF Space (custom-WGSL Qwen3.6 / Bonsai
   1-bit engine). Upstream ships NO explicit license; vendored consistent with
   LocalMind's other webml-community engines (lfm2_5.js, gemma-4-e2b.js).
   Space UI (three.js / marked / katex) stripped; export renamed di->Bonsai27bMobile;
   DEFAULT_MODEL_ID pointed at the ungated lmstudio-community/Bonsai-27B-GGUF mirror.
   Model weights are Apache-2.0 (prism-ml Bonsai, Qwen3.6 backbone).
   Regenerate with scripts/extract-bonsai-27b.mjs. */
var Kd=Object.defineProperty;var P=(e2,t,n)=>()=>{if(n)throw n[0];try{return e2&&(t=e2(e2=0)),t}catch(r){throw n=[r],r}};var bn=(e2,t)=>{for(var n in t)Kd(e2,n,{get:t[n],enumerable:true})};function pi(e2){return/\w/.test(e2)}function kn(e2){return/[0-9]/.test(e2)}function fi(e2){return/\s/.test(e2)}function Fd(e2,t={}){return e2.endsWith(`
`)&&(e2=e2.slice(0,-1)),t.lstrip_blocks&&(e2=e2.replace(/^[ \t]*({[#%-])/gm,"$1")),t.trim_blocks&&(e2=e2.replace(/([#%-]})\n/g,"$1")),e2.replace(/(\s*){%(-?)\s*(?:end)?generation\s*(-?)%}(\s*)/gs,(n,r,s,a,o)=>(s?"":r)+(a?"":o))}function dr(e2,t={}){let n=[],r=Fd(e2,t),s=0,a=0,o=l=>{let c="";for(;l(r[s]);){if(r[s]==="\\"){if(++s,s>=r.length)throw new SyntaxError("Unexpected end of input");let d=r[s++],p=Ud.get(d);if(p===void 0)throw new SyntaxError(`Unexpected escaped character: ${d}`);c+=p;continue}if(c+=r[s++],s>=r.length)throw new SyntaxError("Unexpected end of input")}return c},i=()=>{let l=n.at(-1);l&&l.type===B.Text&&(l.value=l.value.trimEnd(),l.value===""&&n.pop())},u=()=>{for(;s<r.length&&fi(r[s]);)++s};e:for(;s<r.length;){let l=n.at(-1)?.type;if(l===void 0||l===B.CloseStatement||l===B.CloseExpression||l===B.Comment){let d="";for(;s<r.length&&!(r[s]==="{"&&(r[s+1]==="%"||r[s+1]==="{"||r[s+1]==="#"));)d+=r[s++];if(d.length>0){n.push(new Ze(d,B.Text));continue}}if(r[s]==="{"&&r[s+1]==="#"){s+=2;let d=r[s]==="-";d&&++s;let p="";for(;r[s]!=="#"||r[s+1]!=="}";){if(s+2>=r.length)throw new SyntaxError("Missing end of comment tag");p+=r[s++]}let f=p.endsWith("-");f&&(p=p.slice(0,-1)),d&&i(),n.push(new Ze(p,B.Comment)),s+=2,f&&u();continue}if(r.slice(s,s+3)==="{%-"){i(),n.push(new Ze("{%",B.OpenStatement)),s+=3;continue}if(r.slice(s,s+3)==="{{-"){i(),n.push(new Ze("{{",B.OpenExpression)),a=0,s+=3;continue}if(o(fi),r.slice(s,s+3)==="-%}"){n.push(new Ze("%}",B.CloseStatement)),s+=3,u();continue}if(r.slice(s,s+3)==="-}}"){n.push(new Ze("}}",B.CloseExpression)),s+=3,u();continue}let c=r[s];if(c==="-"||c==="+"){let d=n.at(-1)?.type;if(d===B.Text||d===void 0)throw new SyntaxError(`Unexpected character: ${c}`);switch(d){case B.Identifier:case B.NumericLiteral:case B.StringLiteral:case B.CloseParen:case B.CloseSquareBracket:break;default:{++s;let p=o(kn);n.push(new Ze(`${c}${p}`,p.length>0?B.NumericLiteral:B.UnaryOperator));continue}}}for(let[d,p]of Hd){if(d==="}}"&&a>0)continue;if(r.slice(s,s+d.length)===d){n.push(new Ze(d,p)),p===B.OpenExpression?a=0:p===B.OpenCurlyBracket?++a:p===B.CloseCurlyBracket&&--a,s+=d.length;continue e}}if(c==="'"||c==='"'){++s;let d=o(p=>p!==c);n.push(new Ze(d,B.StringLiteral)),++s;continue}if(kn(c)){let d=o(kn);if(n.at(-1)?.type!==B.Dot&&r[s]==="."&&kn(r[s+1])){++s;let p=o(kn);d=`${d}.${p}`}n.push(new Ze(d,B.NumericLiteral));continue}if(pi(c)){let d=o(pi);n.push(new Ze(d,B.Identifier));continue}throw new SyntaxError(`Unexpected character: ${c}`)}return n}function pr(e2){let t=new Zd([]),n=0;function r(_,k){let v=e2[n++];if(!v||v.type!==_)throw new Error(`Parser Error: ${k}. ${v.type} !== ${_}.`);return v}function s(_){if(!u(_))throw new SyntaxError(`Expected ${_}`);++n}function a(){switch(e2[n].type){case B.Comment:return new Jd(e2[n++].value);case B.Text:return l();case B.OpenStatement:return c();case B.OpenExpression:return d();default:throw new SyntaxError(`Unexpected token type: ${e2[n].type}`)}}function o(..._){return n+_.length<=e2.length&&_.every((k,v)=>k===e2[n+v].type)}function i(..._){return e2[n]?.type===B.OpenStatement&&e2[n+1]?.type===B.Identifier&&_.includes(e2[n+1]?.value)}function u(..._){return n+_.length<=e2.length&&_.every((k,v)=>e2[n+v].type==="Identifier"&&k===e2[n+v].value)}function l(){return new gi(r(B.Text,"Expected text token").value)}function c(){if(r(B.OpenStatement,"Expected opening statement token"),e2[n].type!==B.Identifier)throw new SyntaxError(`Unknown statement, got ${e2[n].type}`);let _=e2[n].value,k;switch(_){case"set":++n,k=p();break;case"if":++n,k=f(),r(B.OpenStatement,"Expected {% token"),s("endif"),r(B.CloseStatement,"Expected %} token");break;case"macro":++n,k=g(),r(B.OpenStatement,"Expected {% token"),s("endmacro"),r(B.CloseStatement,"Expected %} token");break;case"for":++n,k=A(),r(B.OpenStatement,"Expected {% token"),s("endfor"),r(B.CloseStatement,"Expected %} token");break;case"call":{++n;let v=null;o(B.OpenParen)&&(v=I());let V=h();if(V.type!=="Identifier")throw new SyntaxError("Expected identifier following call statement");let j=I();r(B.CloseStatement,"Expected closing statement token");let N=[];for(;!i("endcall");)N.push(a());r(B.OpenStatement,"Expected '{%'"),s("endcall"),r(B.CloseStatement,"Expected closing statement token");let re=new mi(V,j);k=new fp(re,v,N);break}case"break":++n,r(B.CloseStatement,"Expected closing statement token"),k=new jd;break;case"continue":++n,r(B.CloseStatement,"Expected closing statement token"),k=new Vd;break;case"filter":{++n;let v=h();v instanceof jt&&o(B.OpenParen)&&(v=y(v)),r(B.CloseStatement,"Expected closing statement token");let V=[];for(;!i("endfilter");)V.push(a());r(B.OpenStatement,"Expected '{%'"),s("endfilter"),r(B.CloseStatement,"Expected '%}'"),k=new op(v,V);break}default:throw new SyntaxError(`Unknown statement type: ${_}`)}return k}function d(){r(B.OpenExpression,"Expected opening expression token");let _=w();return r(B.CloseExpression,"Expected closing expression token"),_}function p(){let _=m(),k=null,v=[];if(o(B.Equals))++n,k=m();else{for(r(B.CloseStatement,"Expected %} token");!i("endset");)v.push(a());r(B.OpenStatement,"Expected {% token"),s("endset")}return r(B.CloseStatement,"Expected closing statement token"),new Yd(_,k,v)}function f(){let _=w();r(B.CloseStatement,"Expected closing statement token");let k=[],v=[];for(;!i("elif","else","endif");)k.push(a());if(i("elif")){++n,++n;let V=f();v.push(V)}else if(i("else"))for(++n,++n,r(B.CloseStatement,"Expected closing statement token");!i("endif");)v.push(a());return new $d(_,k,v)}function g(){let _=h();if(_.type!=="Identifier")throw new SyntaxError("Expected identifier following macro statement");let k=I();r(B.CloseStatement,"Expected closing statement token");let v=[];for(;!i("endmacro");)v.push(a());return new Xd(_,k,v)}function m(_=false){let k=_?h:w,v=[k()],V=o(B.Comma);for(;V&&(++n,v.push(k()),!!o(B.Comma)););return V?new Ai(v):v[0]}function A(){let _=m(true);if(!(_ instanceof jt||_ instanceof Ai))throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${_.type} instead`);if(!u("in"))throw new SyntaxError("Expected `in` keyword following loop variable");++n;let k=w();r(B.CloseStatement,"Expected closing statement token");let v=[];for(;!i("endfor","else");)v.push(a());let V=[];if(i("else"))for(++n,++n,r(B.CloseStatement,"Expected closing statement token");!i("endfor");)V.push(a());return new Nd(_,k,v,V)}function w(){return C()}function C(){let _=G();if(u("if")){++n;let k=G();if(u("else")){++n;let v=C();return new mp(k,_,v)}else return new ip(_,k)}return _}function G(){let _=L();for(;u("or");){let k=e2[n];++n;let v=L();_=new vn(k,_,v)}return _}function L(){let _=Z();for(;u("and");){let k=e2[n];++n;let v=Z();_=new vn(k,_,v)}return _}function Z(){let _;for(;u("not");){let k=e2[n];++n;let v=Z();_=new lp(k,v)}return _??O()}function O(){let _=b();for(;;){let k;if(u("not","in"))k=new Ze("not in",B.Identifier),n+=2;else if(u("in"))k=e2[n++];else if(o(B.ComparisonBinaryOperator))k=e2[n++];else break;let v=b();_=new vn(k,_,v)}return _}function b(){let _=q();for(;o(B.AdditiveBinaryOperator);){let k=e2[n];++n;let v=q();_=new vn(k,_,v)}return _}function S(){let _=x(h());return o(B.OpenParen)?y(_):_}function y(_){let k=new mi(_,I());return k=x(k),o(B.OpenParen)&&(k=y(k)),k}function I(){r(B.OpenParen,"Expected opening parenthesis for arguments list");let _=H();return r(B.CloseParen,"Expected closing parenthesis for arguments list"),_}function H(){let _=[];for(;!o(B.CloseParen);){let k;if(e2[n].type===B.MultiplicativeBinaryOperator&&e2[n].value==="*"){++n;let v=w();k=new pp(v)}else if(k=w(),o(B.Equals)){if(++n,!(k instanceof jt))throw new SyntaxError("Expected identifier for keyword argument");let v=w();k=new dp(k,v)}_.push(k),o(B.Comma)&&++n}return _}function W(){let _=[],k=false;for(;!o(B.CloseSquareBracket);)o(B.Colon)?(_.push(void 0),++n,k=true):(_.push(w()),o(B.Colon)&&(++n,k=true));if(_.length===0)throw new SyntaxError("Expected at least one argument for member/slice expression");if(k){if(_.length>3)throw new SyntaxError("Expected 0-3 arguments for slice expression");return new cp(..._)}return _[0]}function x(_){for(;o(B.Dot)||o(B.OpenSquareBracket);){let k=e2[n];++n;let v,V=k.type===B.OpenSquareBracket;if(V)v=W(),r(B.CloseSquareBracket,"Expected closing square bracket");else if(v=h(),v.type!=="Identifier"&&v.type!=="IntegerLiteral")throw new SyntaxError("Expected identifier or integer following dot operator");_=new ep(_,v,V)}return _}function q(){let _=R();for(;o(B.MultiplicativeBinaryOperator);){let k=e2[n++],v=R();_=new vn(k,_,v)}return _}function R(){let _=D();for(;u("is");){++n;let k=u("not");k&&++n;let v=h();if(!(v instanceof jt))throw new SyntaxError("Expected identifier for the test");_=new up(_,k,v)}return _}function D(){let _=S();for(;o(B.Pipe);){++n;let k=h();if(!(k instanceof jt))throw new SyntaxError("Expected identifier for the filter");o(B.OpenParen)&&(k=y(k)),_=new ap(_,k)}return _}function h(){let _=e2[n++];switch(_.type){case B.NumericLiteral:{let k=_.value;return k.includes(".")?new np(Number(k)):new tp(Number(k))}case B.StringLiteral:{let k=_.value;for(;o(B.StringLiteral);)k+=e2[n++].value;return new gi(k)}case B.Identifier:return new jt(_.value);case B.OpenParen:{let k=m();return r(B.CloseParen,"Expected closing parenthesis, got ${tokens[current].type} instead."),k}case B.OpenSquareBracket:{let k=[];for(;!o(B.CloseSquareBracket);)k.push(w()),o(B.Comma)&&++n;return++n,new rp(k)}case B.OpenCurlyBracket:{let k=new Map;for(;!o(B.CloseCurlyBracket);){let v=w();r(B.Colon,"Expected colon between key and value in object literal");let V=w();k.set(v,V),o(B.Comma)&&++n}return++n,new sp(k)}default:throw new SyntaxError(`Unexpected token: ${_.type}`)}}for(;n<e2.length;)t.body.push(a());return t}function gp(e2,t,n=1){if(t===void 0&&(t=e2,e2=0),n===0)throw new Error("range() step must not be zero");let r=[];if(n>0)for(let s=e2;s<t;s+=n)r.push(s);else for(let s=e2;s>t;s+=n)r.push(s);return r}function hi(e2,t,n,r=1){let s=Math.sign(r);s>=0?(t=(t??=0)<0?Math.max(e2.length+t,0):Math.min(t,e2.length),n=(n??=e2.length)<0?Math.max(e2.length+n,0):Math.min(n,e2.length)):(t=(t??=e2.length-1)<0?Math.max(e2.length+t,-1):Math.min(t,e2.length-1),n=(n??=-1)<-1?Math.max(e2.length+n,-1):Math.min(n,e2.length-1));let a=[];for(let o=t;s*o<s*n;o+=r)a.push(e2[o]);return a}function Ap(e2){return e2.replace(/\b\w/g,t=>t.toUpperCase())}function hp(e2){return _p(new Date,e2)}function _p(e2,t){let n=new Intl.DateTimeFormat(void 0,{month:"long"}),r=new Intl.DateTimeFormat(void 0,{month:"short"}),s=a=>a<10?"0"+a:a.toString();return t.replace(/%[YmdbBHM%]/g,a=>{switch(a){case"%Y":return e2.getFullYear().toString();case"%m":return s(e2.getMonth()+1);case"%d":return s(e2.getDate());case"%b":return r.format(e2);case"%B":return n.format(e2);case"%H":return s(e2.getHours());case"%M":return s(e2.getMinutes());case"%%":return"%";default:return a}})}function wp(e2){return e2.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function yp(e2,t,n,r){if(r===0)return e2;let s=r==null||r<0?1/0:r,a=t.length===0?new RegExp("(?=)","gu"):new RegExp(wp(t),"gu");return e2.replaceAll(a,o=>s>0?(--s,n):o)}function yi(e2){return e2.replace(kp,t=>"\\u"+t.charCodeAt(0).toString(16).padStart(4,"0"))}function Lt(e2,t={},n=0,r=true){let{indent:s=null,ensureAscii:a=false,separators:o=null,sortKeys:i=false}=t,u,l;switch(o?[u,l]=o:s?(u=",",l=": "):(u=", ",l=": "),e2.type){case"NullValue":return"null";case"UndefinedValue":return r?"null":"undefined";case"IntegerValue":case"FloatValue":case"BooleanValue":return JSON.stringify(e2.value);case"StringValue":{let c=JSON.stringify(e2.value);return a&&(c=yi(c)),c}case"ArrayValue":case"ObjectValue":{let c=s?" ".repeat(s):"",d=`
`+c.repeat(n),p=d+c;if(e2.type==="ArrayValue"){let f=e2.value.map(g=>Lt(g,t,n+1,r));return s?`[${p}${f.join(`${u}${p}`)}${d}]`:`[${f.join(u)}]`}else{let f=Array.from(e2.value.entries());i&&(f=f.sort(([m],[A])=>m.localeCompare(A)));let g=f.map(([m,A])=>{let w=JSON.stringify(m);a&&(w=yi(w));let C=`${w}${l}${Lt(A,t,n+1,r)}`;return s?`${p}${C}`:C});return s?`{${g.join(u)}${d}}`:`{${g.join(u)}}`}}default:throw new Error(`Cannot convert to JSON: ${e2.type}`)}}function vp(e2){e2.set("false",false),e2.set("true",true),e2.set("none",null),e2.set("raise_exception",t=>{throw new Error(t)}),e2.set("range",gp),e2.set("strftime_now",hp),e2.set("True",true),e2.set("False",false),e2.set("None",null)}function ki(e2,t){let n=t.split("."),r=e2;for(let s of n)if(r instanceof Qe)r=r.value.get(s)??new fe;else if(r instanceof oe){let a=parseInt(s,10);if(!isNaN(a)&&a>=0&&a<r.value.length)r=r.value[a];else return new fe}else return new fe;return r}function Ws(e2,t,n=false){if(e2 instanceof he&&t instanceof he)return 0;if(e2 instanceof he||t instanceof he)throw new Error(`Cannot compare ${e2.type} with ${t.type}`);if(e2 instanceof fe&&t instanceof fe)return 0;if(e2 instanceof fe||t instanceof fe)throw new Error(`Cannot compare ${e2.type} with ${t.type}`);let r=a=>a instanceof ee||a instanceof we||a instanceof X,s=a=>a instanceof X?a.value?1:0:a.value;if(r(e2)&&r(t)){let a=s(e2),o=s(t);return a<o?-1:a>o?1:0}if(e2.type!==t.type)throw new Error(`Cannot compare different types: ${e2.type} and ${t.type}`);if(e2.type==="StringValue"){let a=e2.value,o=t.value;return n||(a=a.toLowerCase(),o=o.toLowerCase()),a<o?-1:a>o?1:0}else throw new Error(`Cannot compare type: ${e2.type}`)}function cr(e2){switch(typeof e2){case"number":return Number.isInteger(e2)?new ee(e2):new we(e2);case"string":return new F(e2);case"boolean":return new X(e2);case"undefined":return new fe;case"object":return e2===null?new he:Array.isArray(e2)?new oe(e2.map(cr)):new Qe(new Map(Object.entries(e2).map(([t,n])=>[t,cr(n)])));case"function":return new me((t,n)=>{let r=e2(...t.map(s=>s.value))??null;return cr(r)});default:throw new Error(`Cannot convert to runtime value: ${e2}`)}}function Bp(e2){switch(e2.operator.type){case"MultiplicativeBinaryOperator":return 4;case"AdditiveBinaryOperator":return 3;case"ComparisonBinaryOperator":return 2;case"Identifier":return e2.operator.value==="and"?1:e2.operator.value==="in"||e2.operator.value==="not in"?2:0}return 0}function Ip(e2,t="	"){let n=typeof t=="number"?" ".repeat(t):t;return Ve(e2.body,0,n).replace(/\n$/,"")}function Pe(...e2){return Cp+e2.join(" ")+Sp}function Ve(e2,t,n){return e2.map(r=>Tp(r,t,n)).join(Ge)}function Tp(e2,t,n){let r=n.repeat(t);switch(e2.type){case"Program":return Ve(e2.body,t,n);case"If":return Ep(e2,t,n);case"For":return Gp(e2,t,n);case"Set":return xp(e2,t,n);case"Macro":return Qp(e2,t,n);case"Break":return r+Pe("break");case"Continue":return r+Pe("continue");case"CallStatement":return Dp(e2,t,n);case"FilterStatement":return Pp(e2,t,n);case"Comment":return r+"{# "+e2.value+" #}";default:return r+"{{- "+ue(e2)+" -}}"}}function Ep(e2,t,n){let r=n.repeat(t),s=[],a=e2;for(;a&&(s.push({test:a.test,body:a.body}),a.alternate.length===1&&a.alternate[0].type==="If");)a=a.alternate[0];let o=r+Pe("if",ue(s[0].test))+Ge+Ve(s[0].body,t+1,n);for(let i=1;i<s.length;++i)o+=Ge+r+Pe("elif",ue(s[i].test))+Ge+Ve(s[i].body,t+1,n);return a&&a.alternate.length>0&&(o+=Ge+r+Pe("else")+Ge+Ve(a.alternate,t+1,n)),o+=Ge+r+Pe("endif"),o}function Gp(e2,t,n){let r=n.repeat(t),s="";if(e2.iterable.type==="SelectExpression"){let o=e2.iterable;s=`${ue(o.lhs)} if ${ue(o.test)}`}else s=ue(e2.iterable);let a=r+Pe("for",ue(e2.loopvar),"in",s)+Ge+Ve(e2.body,t+1,n);return e2.defaultBlock.length>0&&(a+=Ge+r+Pe("else")+Ge+Ve(e2.defaultBlock,t+1,n)),a+=Ge+r+Pe("endfor"),a}function xp(e2,t,n){let r=n.repeat(t),s=ue(e2.assignee),a=e2.value?ue(e2.value):"",o=r+Pe("set",`${s}${e2.value?" = "+a:""}`);return e2.body.length===0?o:o+Ge+Ve(e2.body,t+1,n)+Ge+r+Pe("endset")}function Qp(e2,t,n){let r=n.repeat(t),s=e2.args.map(ue).join(", ");return r+Pe("macro",`${e2.name.value}(${s})`)+Ge+Ve(e2.body,t+1,n)+Ge+r+Pe("endmacro")}function Dp(e2,t,n){let r=n.repeat(t),s=e2.callerArgs&&e2.callerArgs.length>0?`(${e2.callerArgs.map(ue).join(", ")})`:"",a=ue(e2.call),o=r+Pe(`call${s}`,a)+Ge;return o+=Ve(e2.body,t+1,n)+Ge,o+=r+Pe("endcall"),o}function Pp(e2,t,n){let r=n.repeat(t),s=e2.filter.type==="Identifier"?e2.filter.value:ue(e2.filter),a=r+Pe("filter",s)+Ge;return a+=Ve(e2.body,t+1,n)+Ge,a+=r+Pe("endfilter"),a}function ue(e2,t=-1){switch(e2.type){case"SpreadExpression":return`*${ue(e2.argument)}`;case"Identifier":return e2.value;case"IntegerLiteral":return`${e2.value}`;case"FloatLiteral":return`${e2.value}`;case"StringLiteral":return JSON.stringify(e2.value);case"BinaryExpression":{let n=e2,r=Bp(n),s=ue(n.left,r),a=ue(n.right,r+1),o=`${s} ${n.operator.value} ${a}`;return r<t?`(${o})`:o}case"UnaryExpression":{let n=e2;return n.operator.value+(n.operator.value==="not"?" ":"")+ue(n.argument,1/0)}case"CallExpression":{let n=e2,r=n.args.map(ue).join(", ");return`${ue(n.callee)}(${r})`}case"MemberExpression":{let n=e2,r=ue(n.object);["Identifier","MemberExpression","CallExpression","StringLiteral","IntegerLiteral","FloatLiteral","ArrayLiteral","TupleLiteral","ObjectLiteral"].includes(n.object.type)||(r=`(${r})`);let s=ue(n.property);return!n.computed&&n.property.type!=="Identifier"&&n.property.type!=="IntegerLiteral"&&(s=`(${s})`),n.computed?`${r}[${s}]`:`${r}.${s}`}case"FilterExpression":{let n=e2,r=ue(n.operand,1/0);return n.filter.type==="CallExpression"?`${r} | ${ue(n.filter)}`:`${r} | ${n.filter.value}`}case"SelectExpression":{let n=e2;return`${ue(n.lhs)} if ${ue(n.test)}`}case"TestExpression":{let n=e2;return`${ue(n.operand)} is${n.negate?" not":""} ${n.test.value}`}case"ArrayLiteral":case"TupleLiteral":{let n=e2.value.map(ue),r=e2.type==="ArrayLiteral"?"[]":"()";return`${r[0]}${n.join(", ")}${r[1]}`}case"ObjectLiteral":return`{${Array.from(e2.value.entries()).map(([r,s])=>`${ue(r)}: ${ue(s)}`).join(", ")}}`;case"SliceExpression":{let n=e2,r=n.start?ue(n.start):"",s=n.stop?ue(n.stop):"",a=n.step?`:${ue(n.step)}`:"";return`${r}:${s}${a}`}case"KeywordArgumentExpression":{let n=e2;return`${n.key.value}=${ue(n.value)}`}case"Ternary":{let n=e2,r=`${ue(n.trueExpr)} if ${ue(n.condition,0)} else ${ue(n.falseExpr)}`;return t>-1?`(${r})`:r}default:throw new Error(`Unknown expression type: ${e2.type}`)}}var Od,Wd,zd,B,Ze,Hd,Ud,Ye,Zd,$d,Nd,jd,Vd,Yd,Xd,Jd,ze,ep,mi,jt,Vt,tp,np,gi,rp,Ai,sp,vn,ap,op,ip,up,lp,cp,dp,pp,fp,mp,_i,wi,bp,ot,ee,we,F,X,kp,Qe,Cn,oe,bi,me,he,fe,vi,at,zs,Ge,Cp,Sp,fr,Hs=P(()=>{Od=Object.defineProperty,Wd=(e2,t,n)=>t in e2?Od(e2,t,{enumerable:true,configurable:true,writable:true,value:n}):e2[t]=n,zd=(e2,t,n)=>(Wd(e2,typeof t!="symbol"?t+"":t,n),n),B=Object.freeze({Text:"Text",NumericLiteral:"NumericLiteral",StringLiteral:"StringLiteral",Identifier:"Identifier",Equals:"Equals",OpenParen:"OpenParen",CloseParen:"CloseParen",OpenStatement:"OpenStatement",CloseStatement:"CloseStatement",OpenExpression:"OpenExpression",CloseExpression:"CloseExpression",OpenSquareBracket:"OpenSquareBracket",CloseSquareBracket:"CloseSquareBracket",OpenCurlyBracket:"OpenCurlyBracket",CloseCurlyBracket:"CloseCurlyBracket",Comma:"Comma",Dot:"Dot",Colon:"Colon",Pipe:"Pipe",CallOperator:"CallOperator",AdditiveBinaryOperator:"AdditiveBinaryOperator",MultiplicativeBinaryOperator:"MultiplicativeBinaryOperator",ComparisonBinaryOperator:"ComparisonBinaryOperator",UnaryOperator:"UnaryOperator",Comment:"Comment"}),Ze=class{constructor(e2,t){this.value=e2,this.type=t}};Hd=[["{%",B.OpenStatement],["%}",B.CloseStatement],["{{",B.OpenExpression],["}}",B.CloseExpression],["(",B.OpenParen],[")",B.CloseParen],["{",B.OpenCurlyBracket],["}",B.CloseCurlyBracket],["[",B.OpenSquareBracket],["]",B.CloseSquareBracket],[",",B.Comma],[".",B.Dot],[":",B.Colon],["|",B.Pipe],["<=",B.ComparisonBinaryOperator],[">=",B.ComparisonBinaryOperator],["==",B.ComparisonBinaryOperator],["!=",B.ComparisonBinaryOperator],["<",B.ComparisonBinaryOperator],[">",B.ComparisonBinaryOperator],["+",B.AdditiveBinaryOperator],["-",B.AdditiveBinaryOperator],["~",B.AdditiveBinaryOperator],["*",B.MultiplicativeBinaryOperator],["/",B.MultiplicativeBinaryOperator],["%",B.MultiplicativeBinaryOperator],["=",B.Equals]],Ud=new Map([["n",`
`],["t","	"],["r","\r"],["b","\b"],["f","\f"],["v","\v"],["'","'"],['"','"'],["\\","\\"]]);Ye=class{type="Statement"},Zd=class extends Ye{constructor(e2){super(),this.body=e2}type="Program"},$d=class extends Ye{constructor(e2,t,n){super(),this.test=e2,this.body=t,this.alternate=n}type="If"},Nd=class extends Ye{constructor(e2,t,n,r){super(),this.loopvar=e2,this.iterable=t,this.body=n,this.defaultBlock=r}type="For"},jd=class extends Ye{type="Break"},Vd=class extends Ye{type="Continue"},Yd=class extends Ye{constructor(e2,t,n){super(),this.assignee=e2,this.value=t,this.body=n}type="Set"},Xd=class extends Ye{constructor(e2,t,n){super(),this.name=e2,this.args=t,this.body=n}type="Macro"},Jd=class extends Ye{constructor(e2){super(),this.value=e2}type="Comment"},ze=class extends Ye{type="Expression"},ep=class extends ze{constructor(e2,t,n){super(),this.object=e2,this.property=t,this.computed=n}type="MemberExpression"},mi=class extends ze{constructor(e2,t){super(),this.callee=e2,this.args=t}type="CallExpression"},jt=class extends ze{constructor(e2){super(),this.value=e2}type="Identifier"},Vt=class extends ze{constructor(e2){super(),this.value=e2}type="Literal"},tp=class extends Vt{type="IntegerLiteral"},np=class extends Vt{type="FloatLiteral"},gi=class extends Vt{type="StringLiteral"},rp=class extends Vt{type="ArrayLiteral"},Ai=class extends Vt{type="TupleLiteral"},sp=class extends Vt{type="ObjectLiteral"},vn=class extends ze{constructor(e2,t,n){super(),this.operator=e2,this.left=t,this.right=n}type="BinaryExpression"},ap=class extends ze{constructor(e2,t){super(),this.operand=e2,this.filter=t}type="FilterExpression"},op=class extends Ye{constructor(e2,t){super(),this.filter=e2,this.body=t}type="FilterStatement"},ip=class extends ze{constructor(e2,t){super(),this.lhs=e2,this.test=t}type="SelectExpression"},up=class extends ze{constructor(e2,t,n){super(),this.operand=e2,this.negate=t,this.test=n}type="TestExpression"},lp=class extends ze{constructor(e2,t){super(),this.operator=e2,this.argument=t}type="UnaryExpression"},cp=class extends ze{constructor(e2=void 0,t=void 0,n=void 0){super(),this.start=e2,this.stop=t,this.step=n}type="SliceExpression"},dp=class extends ze{constructor(e2,t){super(),this.key=e2,this.value=t}type="KeywordArgumentExpression"},pp=class extends ze{constructor(e2){super(),this.argument=e2}type="SpreadExpression"},fp=class extends Ye{constructor(e2,t,n){super(),this.call=e2,this.callerArgs=t,this.body=n}type="CallStatement"},mp=class extends ze{constructor(e2,t,n){super(),this.condition=e2,this.trueExpr=t,this.falseExpr=n}type="Ternary"};_i=class extends Error{},wi=class extends Error{},bp=new Map,ot=class{type="RuntimeValue";value;get builtins(){return bp}constructor(e2=void 0){this.value=e2}__bool__(){return new X(!!this.value)}toString(){return String(this.value)}},ee=class extends ot{type="IntegerValue"},we=class extends ot{type="FloatValue";toString(){return this.value%1===0?this.value.toFixed(1):this.value.toString()}},F=class extends ot{type="StringValue";_builtins;get builtins(){return this._builtins??=new Map([["upper",new me(()=>new F(this.value.toUpperCase()))],["lower",new me(()=>new F(this.value.toLowerCase()))],["strip",new me(()=>new F(this.value.trim()))],["title",new me(()=>new F(Ap(this.value)))],["capitalize",new me(()=>new F(this.value.charAt(0).toUpperCase()+this.value.slice(1)))],["length",new ee(this.value.length)],["rstrip",new me(()=>new F(this.value.trimEnd()))],["lstrip",new me(()=>new F(this.value.trimStart()))],["startswith",new me(e2=>{if(e2.length===0)throw new Error("startswith() requires at least one argument");let t=e2[0];if(t instanceof F)return new X(this.value.startsWith(t.value));if(t instanceof oe){for(let n of t.value){if(!(n instanceof F))throw new Error("startswith() tuple elements must be strings");if(this.value.startsWith(n.value))return new X(true)}return new X(false)}throw new Error("startswith() argument must be a string or tuple of strings")})],["endswith",new me(e2=>{if(e2.length===0)throw new Error("endswith() requires at least one argument");let t=e2[0];if(t instanceof F)return new X(this.value.endsWith(t.value));if(t instanceof oe){for(let n of t.value){if(!(n instanceof F))throw new Error("endswith() tuple elements must be strings");if(this.value.endsWith(n.value))return new X(true)}return new X(false)}throw new Error("endswith() argument must be a string or tuple of strings")})],["split",new me(e2=>{let t=e2[0]??new he;if(!(t instanceof F||t instanceof he))throw new Error("sep argument must be a string or null");let n=e2[1]??new ee(-1);if(!(n instanceof ee))throw new Error("maxsplit argument must be a number");let r=[];if(t instanceof he){let s=this.value.trimStart();for(let{0:a,index:o}of s.matchAll(/\S+/g)){if(n.value!==-1&&r.length>=n.value&&o!==void 0){r.push(a+s.slice(o+a.length));break}r.push(a)}}else{if(t.value==="")throw new Error("empty separator");r=this.value.split(t.value),n.value!==-1&&r.length>n.value&&r.push(r.splice(n.value).join(t.value))}return new oe(r.map(s=>new F(s)))})],["replace",new me(e2=>{if(e2.length<2)throw new Error("replace() requires at least two arguments");let t=e2[0],n=e2[1];if(!(t instanceof F&&n instanceof F))throw new Error("replace() arguments must be strings");let r;if(e2.length>2?e2[2].type==="KeywordArgumentsValue"?r=e2[2].value.get("count")??new he:r=e2[2]:r=new he,!(r instanceof ee||r instanceof he))throw new Error("replace() count argument must be a number or null");return new F(yp(this.value,t.value,n.value,r.value))})]])}},X=class extends ot{type="BooleanValue"},kp=/[\x7f-\uffff]/g;Qe=class extends ot{type="ObjectValue";_builtins;__bool__(){return new X(this.value.size>0)}get builtins(){return this._builtins??=new Map([["get",new me(([e2,t])=>{if(!(e2 instanceof F))throw new Error(`Object key must be a string: got ${e2.type}`);return this.value.get(e2.value)??t??new he})],["items",new me(()=>this.items())],["keys",new me(()=>this.keys())],["values",new me(()=>this.values())],["dictsort",new me(e2=>{let t=new Map,n=e2.filter(i=>i instanceof Cn?(t=i.value,false):true),r=n.at(0)??t.get("case_sensitive")??new X(false);if(!(r instanceof X))throw new Error("case_sensitive must be a boolean");let s=n.at(1)??t.get("by")??new F("key");if(!(s instanceof F))throw new Error("by must be a string");if(!["key","value"].includes(s.value))throw new Error("by must be either 'key' or 'value'");let a=n.at(2)??t.get("reverse")??new X(false);if(!(a instanceof X))throw new Error("reverse must be a boolean");let o=Array.from(this.value.entries()).map(([i,u])=>new oe([new F(i),u])).sort((i,u)=>{let l=s.value==="key"?0:1,c=i.value[l],d=u.value[l],p=Ws(c,d,r.value);return a.value?-p:p});return new oe(o)})]])}items(){return new oe(Array.from(this.value.entries()).map(([e2,t])=>new oe([new F(e2),t])))}keys(){return new oe(Array.from(this.value.keys()).map(e2=>new F(e2)))}values(){return new oe(Array.from(this.value.values()))}toString(){return Lt(this,{},0,false)}},Cn=class extends Qe{type="KeywordArgumentsValue"},oe=class extends ot{type="ArrayValue";_builtins;get builtins(){return this._builtins??=new Map([["length",new ee(this.value.length)]])}__bool__(){return new X(this.value.length>0)}toString(){return Lt(this,{},0,false)}},bi=class extends oe{type="TupleValue"},me=class extends ot{type="FunctionValue"},he=class extends ot{type="NullValue"},fe=class extends ot{type="UndefinedValue"},vi=class{constructor(e2){this.parent=e2}variables=new Map([["namespace",new me(e2=>{if(e2.length===0)return new Qe(new Map);if(e2.length!==1||!(e2[0]instanceof Qe))throw new Error("`namespace` expects either zero arguments or a single object argument");return e2[0]})]]);tests=vi.TESTS;set(e2,t){return this.declareVariable(e2,cr(t))}declareVariable(e2,t){if(this.variables.has(e2))throw new SyntaxError(`Variable already declared: ${e2}`);return this.variables.set(e2,t),t}setVariable(e2,t){return this.variables.set(e2,t),t}resolve(e2){if(this.variables.has(e2))return this;if(this.parent)return this.parent.resolve(e2);throw new Error(`Unknown variable: ${e2}`)}lookupVariable(e2){try{return this.resolve(e2).variables.get(e2)??new fe}catch{return new fe}}},at=vi;zd(at,"TESTS",new Map([["boolean",e2=>e2.type==="BooleanValue"],["callable",e2=>e2 instanceof me],["odd",e2=>{if(!(e2 instanceof ee))throw new Error(`cannot odd on ${e2.type}`);return e2.value%2!==0}],["even",e2=>{if(!(e2 instanceof ee))throw new Error(`cannot even on ${e2.type}`);return e2.value%2===0}],["false",e2=>e2.type==="BooleanValue"&&!e2.value],["true",e2=>e2.type==="BooleanValue"&&e2.value],["none",e2=>e2.type==="NullValue"],["string",e2=>e2.type==="StringValue"],["number",e2=>e2 instanceof ee||e2 instanceof we],["integer",e2=>e2 instanceof ee],["iterable",e2=>e2.type==="ArrayValue"||e2.type==="StringValue"],["mapping",e2=>e2 instanceof Qe],["sequence",e2=>e2 instanceof oe||e2 instanceof Qe||e2 instanceof F],["lower",e2=>{let t=e2.value;return e2.type==="StringValue"&&t===t.toLowerCase()}],["upper",e2=>{let t=e2.value;return e2.type==="StringValue"&&t===t.toUpperCase()}],["none",e2=>e2.type==="NullValue"],["defined",e2=>e2.type!=="UndefinedValue"],["undefined",e2=>e2.type==="UndefinedValue"],["equalto",(e2,t)=>e2.value===t.value],["eq",(e2,t)=>e2.value===t.value]]));zs=class{global;constructor(e2){this.global=e2??new at}run(e2){return this.evaluate(e2,this.global)}evaluateBinaryExpression(e2,t){let n=this.evaluate(e2.left,t);switch(e2.operator.value){case"and":return n.__bool__().value?this.evaluate(e2.right,t):n;case"or":return n.__bool__().value?n:this.evaluate(e2.right,t)}let r=this.evaluate(e2.right,t);switch(e2.operator.value){case"==":return new X(n.value==r.value);case"!=":return new X(n.value!=r.value)}if(n instanceof fe||r instanceof fe){if(r instanceof fe&&["in","not in"].includes(e2.operator.value))return new X(e2.operator.value==="not in");throw new Error(`Cannot perform operation ${e2.operator.value} on undefined values`)}else{if(n instanceof he||r instanceof he)throw new Error("Cannot perform operation on null values");if(e2.operator.value==="~")return new F(n.value.toString()+r.value.toString());if((n instanceof ee||n instanceof we)&&(r instanceof ee||r instanceof we)){let s=n.value,a=r.value;switch(e2.operator.value){case"+":case"-":case"*":{let o=e2.operator.value==="+"?s+a:e2.operator.value==="-"?s-a:s*a;return n instanceof we||r instanceof we?new we(o):new ee(o)}case"/":return new we(s/a);case"%":{let o=s%a;return n instanceof we||r instanceof we?new we(o):new ee(o)}case"<":return new X(s<a);case">":return new X(s>a);case">=":return new X(s>=a);case"<=":return new X(s<=a)}}else if(n instanceof oe&&r instanceof oe){if(e2.operator.value==="+")return new oe(n.value.concat(r.value))}else if(r instanceof oe){let s=r.value.find(a=>a.value===n.value)!==void 0;switch(e2.operator.value){case"in":return new X(s);case"not in":return new X(!s)}}}if((n instanceof F||r instanceof F)&&e2.operator.value==="+")return new F(n.value.toString()+r.value.toString());if(n instanceof F&&r instanceof F)switch(e2.operator.value){case"in":return new X(r.value.includes(n.value));case"not in":return new X(!r.value.includes(n.value))}if(n instanceof F&&r instanceof Qe)switch(e2.operator.value){case"in":return new X(r.value.has(n.value));case"not in":return new X(!r.value.has(n.value))}throw new SyntaxError(`Unknown operator "${e2.operator.value}" between ${n.type} and ${r.type}`)}evaluateArguments(e2,t){let n=[],r=new Map;for(let s of e2)if(s.type==="SpreadExpression"){let a=s,o=this.evaluate(a.argument,t);if(!(o instanceof oe))throw new Error(`Cannot unpack non-iterable type: ${o.type}`);for(let i of o.value)n.push(i)}else if(s.type==="KeywordArgumentExpression"){let a=s;r.set(a.key.value,this.evaluate(a.value,t))}else{if(r.size>0)throw new Error("Positional arguments must come before keyword arguments");n.push(this.evaluate(s,t))}return[n,r]}applyFilter(e2,t,n){if(t.type==="Identifier"){let r=t;if(r.value==="safe")return e2;if(r.value==="tojson")return new F(Lt(e2,{}));if(e2 instanceof oe)switch(r.value){case"list":return e2;case"first":return e2.value[0];case"last":return e2.value[e2.value.length-1];case"length":return new ee(e2.value.length);case"reverse":return new oe(e2.value.slice().reverse());case"sort":return new oe(e2.value.slice().sort((s,a)=>Ws(s,a,false)));case"join":return new F(e2.value.map(s=>s.value).join(""));case"string":return new F(Lt(e2,{},0,false));case"unique":{let s=new Set,a=[];for(let o of e2.value)s.has(o.value)||(s.add(o.value),a.push(o));return new oe(a)}default:throw new Error(`Unknown ArrayValue filter: ${r.value}`)}else if(e2 instanceof F)switch(r.value){case"length":case"upper":case"lower":case"title":case"capitalize":{let s=e2.builtins.get(r.value);if(s instanceof me)return s.value([],n);if(s instanceof ee)return s;throw new Error(`Unknown StringValue filter: ${r.value}`)}case"trim":return new F(e2.value.trim());case"indent":return new F(e2.value.split(`
`).map((s,a)=>a===0||s.length===0?s:"    "+s).join(`
`));case"join":case"string":return e2;case"int":{let s=parseInt(e2.value,10);return new ee(isNaN(s)?0:s)}case"float":{let s=parseFloat(e2.value);return new we(isNaN(s)?0:s)}default:throw new Error(`Unknown StringValue filter: ${r.value}`)}else if(e2 instanceof ee||e2 instanceof we)switch(r.value){case"abs":return e2 instanceof ee?new ee(Math.abs(e2.value)):new we(Math.abs(e2.value));case"int":return new ee(Math.floor(e2.value));case"float":return new we(e2.value);case"string":return new F(e2.toString());default:throw new Error(`Unknown NumericValue filter: ${r.value}`)}else if(e2 instanceof Qe)switch(r.value){case"items":return new oe(Array.from(e2.value.entries()).map(([s,a])=>new oe([new F(s),a])));case"length":return new ee(e2.value.size);default:{let s=e2.builtins.get(r.value);if(s)return s instanceof me?s.value([],n):s;throw new Error(`Unknown ObjectValue filter: ${r.value}`)}}else if(e2 instanceof X)switch(r.value){case"bool":return new X(e2.value);case"int":return new ee(e2.value?1:0);case"float":return new we(e2.value?1:0);case"string":return new F(e2.value?"true":"false");default:throw new Error(`Unknown BooleanValue filter: ${r.value}`)}throw new Error(`Cannot apply filter "${r.value}" to type: ${e2.type}`)}else if(t.type==="CallExpression"){let r=t;if(r.callee.type!=="Identifier")throw new Error(`Unknown filter: ${r.callee.type}`);let s=r.callee.value;if(s==="tojson"){let[,a]=this.evaluateArguments(r.args,n),o=a.get("indent")??new he;if(!(o instanceof ee||o instanceof he))throw new Error("If set, indent must be a number");let i=a.get("ensure_ascii")??new X(false);if(!(i instanceof X))throw new Error("If set, ensure_ascii must be a boolean");let u=a.get("sort_keys")??new X(false);if(!(u instanceof X))throw new Error("If set, sort_keys must be a boolean");let l=a.get("separators")??new he,c=null;if(l instanceof oe||l instanceof bi){if(l.value.length!==2)throw new Error("separators must be a tuple of two strings");let[d,p]=l.value;if(!(d instanceof F)||!(p instanceof F))throw new Error("separators must be a tuple of two strings");c=[d.value,p.value]}else if(!(l instanceof he))throw new Error("If set, separators must be a tuple of two strings");return new F(Lt(e2,{indent:o.value,ensureAscii:i.value,sortKeys:u.value,separators:c}))}else if(s==="join"){let a;if(e2 instanceof F)a=Array.from(e2.value);else if(e2 instanceof oe)a=e2.value.map(l=>l.value);else throw new Error(`Cannot apply filter "${s}" to type: ${e2.type}`);let[o,i]=this.evaluateArguments(r.args,n),u=o.at(0)??i.get("separator")??new F("");if(!(u instanceof F))throw new Error("separator must be a string");return new F(a.join(u.value))}else if(s==="int"||s==="float"){let[a,o]=this.evaluateArguments(r.args,n),i=a.at(0)??o.get("default")??(s==="int"?new ee(0):new we(0));if(e2 instanceof F){let u=s==="int"?parseInt(e2.value,10):parseFloat(e2.value);return isNaN(u)?i:s==="int"?new ee(u):new we(u)}else{if(e2 instanceof ee||e2 instanceof we)return e2;if(e2 instanceof X)return s==="int"?new ee(e2.value?1:0):new we(e2.value?1:0);throw new Error(`Cannot apply filter "${s}" to type: ${e2.type}`)}}else if(s==="default"){let[a,o]=this.evaluateArguments(r.args,n),i=a[0]??new F(""),u=a[1]??o.get("boolean")??new X(false);if(!(u instanceof X))throw new Error("`default` filter flag must be a boolean");return e2 instanceof fe||u.value&&!e2.__bool__().value?i:e2}if(e2 instanceof oe){switch(s){case"sort":{let[a,o]=this.evaluateArguments(r.args,n),i=a.at(0)??o.get("reverse")??new X(false);if(!(i instanceof X))throw new Error("reverse must be a boolean");let u=a.at(1)??o.get("case_sensitive")??new X(false);if(!(u instanceof X))throw new Error("case_sensitive must be a boolean");let l=a.at(2)??o.get("attribute")??new he;if(!(l instanceof F||l instanceof ee||l instanceof he))throw new Error("attribute must be a string, integer, or null");let c=d=>{if(l instanceof he)return d;let p=l instanceof ee?String(l.value):l.value;return ki(d,p)};return new oe(e2.value.slice().sort((d,p)=>{let f=c(d),g=c(p),m=Ws(f,g,u.value);return i.value?-m:m}))}case"selectattr":case"rejectattr":{let a=s==="selectattr";if(e2.value.some(d=>!(d instanceof Qe)))throw new Error(`\`${s}\` can only be applied to array of objects`);if(r.args.some(d=>d.type!=="StringLiteral"))throw new Error(`arguments of \`${s}\` must be strings`);let[o,i,u]=r.args.map(d=>this.evaluate(d,n)),l;if(i){let d=n.tests.get(i.value);if(!d)throw new Error(`Unknown test: ${i.value}`);l=d}else l=(...d)=>d[0].__bool__().value;let c=e2.value.filter(d=>{let p=d.value.get(o.value),f=p?l(p,u):false;return a?f:!f});return new oe(c)}case"map":{let[,a]=this.evaluateArguments(r.args,n);if(a.has("attribute")){let o=a.get("attribute");if(!(o instanceof F))throw new Error("attribute must be a string");let i=a.get("default"),u=e2.value.map(l=>{if(!(l instanceof Qe))throw new Error("items in map must be an object");let c=ki(l,o.value);return c instanceof fe?i??new fe:c});return new oe(u)}else throw new Error("`map` expressions without `attribute` set are not currently supported.")}}throw new Error(`Unknown ArrayValue filter: ${s}`)}else if(e2 instanceof F){switch(s){case"indent":{let[a,o]=this.evaluateArguments(r.args,n),i=a.at(0)??o.get("width")??new ee(4);if(!(i instanceof ee))throw new Error("width must be a number");let u=a.at(1)??o.get("first")??new X(false),l=a.at(2)??o.get("blank")??new X(false),c=e2.value.split(`
`),d=" ".repeat(i.value),p=c.map((f,g)=>!u.value&&g===0||!l.value&&f.length===0?f:d+f);return new F(p.join(`
`))}case"replace":{let a=e2.builtins.get("replace");if(!(a instanceof me))throw new Error("replace filter not available");let[o,i]=this.evaluateArguments(r.args,n);return a.value([...o,new Cn(i)],n)}}throw new Error(`Unknown StringValue filter: ${s}`)}else if(e2 instanceof Qe){let a=e2.builtins.get(s);if(a&&a instanceof me){let[o,i]=this.evaluateArguments(r.args,n);return i.size>0&&o.push(new Cn(i)),a.value(o,n)}throw new Error(`Unknown ObjectValue filter: ${s}`)}else throw new Error(`Cannot apply filter "${s}" to type: ${e2.type}`)}throw new Error(`Unknown filter: ${t.type}`)}evaluateFilterExpression(e2,t){let n=this.evaluate(e2.operand,t);return this.applyFilter(n,e2.filter,t)}evaluateTestExpression(e2,t){let n=this.evaluate(e2.operand,t),r=t.tests.get(e2.test.value);if(!r)throw new Error(`Unknown test: ${e2.test.value}`);let s=r(n);return new X(e2.negate?!s:s)}evaluateSelectExpression(e2,t){return this.evaluate(e2.test,t).__bool__().value?this.evaluate(e2.lhs,t):new fe}evaluateUnaryExpression(e2,t){let n=this.evaluate(e2.argument,t);if(e2.operator.value==="not")return new X(!n.value);throw new SyntaxError(`Unknown operator: ${e2.operator.value}`)}evaluateTernaryExpression(e2,t){return this.evaluate(e2.condition,t).__bool__().value?this.evaluate(e2.trueExpr,t):this.evaluate(e2.falseExpr,t)}evalProgram(e2,t){return this.evaluateBlock(e2.body,t)}evaluateBlock(e2,t){let n="";for(let r of e2){let s=this.evaluate(r,t);s.type!=="NullValue"&&s.type!=="UndefinedValue"&&(n+=s.toString())}return new F(n)}evaluateIdentifier(e2,t){return t.lookupVariable(e2.value)}evaluateCallExpression(e2,t){let[n,r]=this.evaluateArguments(e2.args,t);r.size>0&&n.push(new Cn(r));let s=this.evaluate(e2.callee,t);if(s.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${s.type}`);return s.value(n,t)}evaluateSliceExpression(e2,t,n){if(!(e2 instanceof oe||e2 instanceof F))throw new Error("Slice object must be an array or string");let r=this.evaluate(t.start,n),s=this.evaluate(t.stop,n),a=this.evaluate(t.step,n);if(!(r instanceof ee||r instanceof fe))throw new Error("Slice start must be numeric or undefined");if(!(s instanceof ee||s instanceof fe))throw new Error("Slice stop must be numeric or undefined");if(!(a instanceof ee||a instanceof fe))throw new Error("Slice step must be numeric or undefined");return e2 instanceof oe?new oe(hi(e2.value,r.value,s.value,a.value)):new F(hi(Array.from(e2.value),r.value,s.value,a.value).join(""))}evaluateMemberExpression(e2,t){let n=this.evaluate(e2.object,t),r;if(e2.computed){if(e2.property.type==="SliceExpression")return this.evaluateSliceExpression(n,e2.property,t);r=this.evaluate(e2.property,t)}else e2.property.type==="IntegerLiteral"?r=new ee(e2.property.value):r=new F(e2.property.value);let s;if(n instanceof Qe){if(!(r instanceof F))throw new Error(`Cannot access property with non-string: got ${r.type}`);s=n.value.get(r.value)??n.builtins.get(r.value)}else if(n instanceof oe||n instanceof F)if(r instanceof ee)s=n.value.at(r.value),n instanceof F&&(s=new F(n.value.at(r.value)));else if(r instanceof F)s=n.builtins.get(r.value);else throw new Error(`Cannot access property with non-string/non-number: got ${r.type}`);else{if(!(r instanceof F))throw new Error(`Cannot access property with non-string: got ${r.type}`);s=n.builtins.get(r.value)}return s instanceof ot?s:new fe}evaluateSet(e2,t){let n=e2.value?this.evaluate(e2.value,t):this.evaluateBlock(e2.body,t);if(e2.assignee.type==="Identifier"){let r=e2.assignee.value;t.setVariable(r,n)}else if(e2.assignee.type==="TupleLiteral"){let r=e2.assignee;if(!(n instanceof oe))throw new Error(`Cannot unpack non-iterable type in set: ${n.type}`);let s=n.value;if(s.length!==r.value.length)throw new Error(`Too ${r.value.length>s.length?"few":"many"} items to unpack in set`);for(let a=0;a<r.value.length;++a){let o=r.value[a];if(o.type!=="Identifier")throw new Error(`Cannot unpack to non-identifier in set: ${o.type}`);t.setVariable(o.value,s[a])}}else if(e2.assignee.type==="MemberExpression"){let r=e2.assignee,s=this.evaluate(r.object,t);if(!(s instanceof Qe))throw new Error("Cannot assign to member of non-object");if(r.property.type!=="Identifier")throw new Error("Cannot assign to member with non-identifier property");s.value.set(r.property.value,n)}else throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(e2.assignee)}`);return new he}evaluateIf(e2,t){let n=this.evaluate(e2.test,t);return this.evaluateBlock(n.__bool__().value?e2.body:e2.alternate,t)}evaluateFor(e2,t){let n=new at(t),r,s;if(e2.iterable.type==="SelectExpression"){let l=e2.iterable;s=this.evaluate(l.lhs,n),r=l.test}else s=this.evaluate(e2.iterable,n);if(!(s instanceof oe||s instanceof Qe))throw new Error(`Expected iterable or object type in for loop: got ${s.type}`);s instanceof Qe&&(s=s.keys());let a=[],o=[];for(let l=0;l<s.value.length;++l){let c=new at(n),d=s.value[l],p;if(e2.loopvar.type==="Identifier")p=f=>f.setVariable(e2.loopvar.value,d);else if(e2.loopvar.type==="TupleLiteral"){let f=e2.loopvar;if(d.type!=="ArrayValue")throw new Error(`Cannot unpack non-iterable type: ${d.type}`);let g=d;if(f.value.length!==g.value.length)throw new Error(`Too ${f.value.length>g.value.length?"few":"many"} items to unpack`);p=m=>{for(let A=0;A<f.value.length;++A){if(f.value[A].type!=="Identifier")throw new Error(`Cannot unpack non-identifier type: ${f.value[A].type}`);m.setVariable(f.value[A].value,g.value[A])}}}else throw new Error(`Invalid loop variable(s): ${e2.loopvar.type}`);r&&(p(c),!this.evaluate(r,c).__bool__().value)||(a.push(d),o.push(p))}let i="",u=true;for(let l=0;l<a.length;++l){let c=new Map([["index",new ee(l+1)],["index0",new ee(l)],["revindex",new ee(a.length-l)],["revindex0",new ee(a.length-l-1)],["first",new X(l===0)],["last",new X(l===a.length-1)],["length",new ee(a.length)],["previtem",l>0?a[l-1]:new fe],["nextitem",l<a.length-1?a[l+1]:new fe]]);n.setVariable("loop",new Qe(c)),o[l](n);try{let d=this.evaluateBlock(e2.body,n);i+=d.value}catch(d){if(d instanceof wi)continue;if(d instanceof _i)break;throw d}u=false}if(u){let l=this.evaluateBlock(e2.defaultBlock,n);i+=l.value}return new F(i)}evaluateMacro(e2,t){return t.setVariable(e2.name.value,new me((n,r)=>{let s=new at(r);n=n.slice();let a;n.at(-1)?.type==="KeywordArgumentsValue"&&(a=n.pop());for(let o=0;o<e2.args.length;++o){let i=e2.args[o],u=n[o];if(i.type==="Identifier"){let l=i;if(!u)throw new Error(`Missing positional argument: ${l.value}`);s.setVariable(l.value,u)}else if(i.type==="KeywordArgumentExpression"){let l=i,c=u??a?.value.get(l.key.value)??this.evaluate(l.value,s);s.setVariable(l.key.value,c)}else throw new Error(`Unknown argument type: ${i.type}`)}return this.evaluateBlock(e2.body,s)})),new he}evaluateCallStatement(e2,t){let n=new me((i,u)=>{let l=new at(u);if(e2.callerArgs)for(let c=0;c<e2.callerArgs.length;++c){let d=e2.callerArgs[c];if(d.type!=="Identifier")throw new Error(`Caller parameter must be an identifier, got ${d.type}`);l.setVariable(d.value,i[c]??new fe)}return this.evaluateBlock(e2.body,l)}),[r,s]=this.evaluateArguments(e2.call.args,t);r.push(new Cn(s));let a=this.evaluate(e2.call.callee,t);if(a.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${a.type}`);let o=new at(t);return o.setVariable("caller",n),a.value(r,o)}evaluateFilterStatement(e2,t){let n=this.evaluateBlock(e2.body,t);return this.applyFilter(n,e2.filter,t)}evaluate(e2,t){if(!e2)return new fe;switch(e2.type){case"Program":return this.evalProgram(e2,t);case"Set":return this.evaluateSet(e2,t);case"If":return this.evaluateIf(e2,t);case"For":return this.evaluateFor(e2,t);case"Macro":return this.evaluateMacro(e2,t);case"CallStatement":return this.evaluateCallStatement(e2,t);case"Break":throw new _i;case"Continue":throw new wi;case"IntegerLiteral":return new ee(e2.value);case"FloatLiteral":return new we(e2.value);case"StringLiteral":return new F(e2.value);case"ArrayLiteral":return new oe(e2.value.map(n=>this.evaluate(n,t)));case"TupleLiteral":return new bi(e2.value.map(n=>this.evaluate(n,t)));case"ObjectLiteral":{let n=new Map;for(let[r,s]of e2.value){let a=this.evaluate(r,t);if(!(a instanceof F))throw new Error(`Object keys must be strings: got ${a.type}`);n.set(a.value,this.evaluate(s,t))}return new Qe(n)}case"Identifier":return this.evaluateIdentifier(e2,t);case"CallExpression":return this.evaluateCallExpression(e2,t);case"MemberExpression":return this.evaluateMemberExpression(e2,t);case"UnaryExpression":return this.evaluateUnaryExpression(e2,t);case"BinaryExpression":return this.evaluateBinaryExpression(e2,t);case"FilterExpression":return this.evaluateFilterExpression(e2,t);case"FilterStatement":return this.evaluateFilterStatement(e2,t);case"TestExpression":return this.evaluateTestExpression(e2,t);case"SelectExpression":return this.evaluateSelectExpression(e2,t);case"Ternary":return this.evaluateTernaryExpression(e2,t);case"Comment":return new he;default:throw new SyntaxError(`Unknown node type: ${e2.type}`)}}};Ge=`
`,Cp="{%- ",Sp=" -%}";fr=class{parsed;constructor(e2){let t=dr(e2,{lstrip_blocks:true,trim_blocks:true});this.parsed=pr(t)}render(e2){let t=new at;if(vp(t),e2)for(let[s,a]of Object.entries(e2))t.set(s,a);return new zs(t).run(this.parsed).value}format(e2){return Ip(this.parsed,e2?.indent||"	")}}});function Me(e2=null){if(e2!==null&&typeof e2=="object"&&Oi.has(e2))return e2;let t=Ns(e2)?e2:{},n=Ns(t.adapterInfo)?t.adapterInfo:{},r={adapterInfo:jm(n),features:_r(t.features),wgslLanguageFeatures:wr(t.wgslLanguageFeatures),limits:yr(t.limits)};return Oi.add(r),r}function Wi(e2){let t=new Set(e2),n={size:t.size,has(r){return t.has(r)},entries(){return t.entries()},forEach(r,s){t.forEach(a=>r.call(s,a,a,n))},keys(){return t.keys()},values(){return t.values()},[Symbol.iterator](){return t[Symbol.iterator]()}};return n}function _r(e2=[]){return Wi(Hi(e2))}function wr(e2=[]){return Wi(Hi(e2))}function vt(e2=null){let t=Me(e2);return{adapterInfo:{...t.adapterInfo},features:Array.from(t.features.values()).sort(),wgslLanguageFeatures:Array.from(t.wgslLanguageFeatures.values()).sort(),limits:{...t.limits}}}function js(e2,t){if(!e2)return null;for(let n of e2.requiredFeatures??[])if(!t.features.has(n))return`requires device.features.has("${n}")`;for(let n of e2.requiredWGSLLanguageFeatures??[])if(!t.wgslLanguageFeatures.has(n))return`requires device.wgslLanguageFeatures.has("${n}")`;for(let[n,r]of Object.entries(e2.requiredLimits??{})){if(r===void 0)continue;let s=t.limits[n];if(typeof s!="number"||s<r)return`requires device.limits.${n} >= ${r}`}if(e2.requiredSubgroupMinSize!==void 0){let n=t.adapterInfo.subgroupMinSize;if(typeof n!="number")return`requires adapterInfo.subgroupMinSize >= ${e2.requiredSubgroupMinSize} (adapter does not report subgroup sizes)`;if(n<e2.requiredSubgroupMinSize)return`requires adapterInfo.subgroupMinSize >= ${e2.requiredSubgroupMinSize}`}return null}function zi(e2){let t=e2.adapterInfo;return{vendor:typeof t.vendor=="string"?t.vendor.toLowerCase():"",architecture:typeof t.architecture=="string"?t.architecture.toLowerCase():"",...typeof t.subgroupMinSize=="number"?{subgroupMinSize:t.subgroupMinSize}:{},...typeof t.subgroupMaxSize=="number"?{subgroupMaxSize:t.subgroupMaxSize}:{},isFallbackAdapter:t.isFallbackAdapter===true}}function jm(e2){return{...Zm,...e2}}function yr(e2){let t=Ns(e2)?e2:{},n={...Nm};for(let r of $m){let s=Vm(t,r);s!==void 0&&(n[r]=s)}for(let[r,s]of Object.entries(t))typeof s=="number"&&Number.isFinite(s)&&(n[r]=s);return n}function Hi(e2){return e2==null?[]:Array.isArray(e2)?e2.filter($s):typeof e2[Symbol.iterator]=="function"?Array.from(e2).filter($s):typeof e2.values=="function"?Array.from(e2.values()).filter($s):[]}function Vm(e2,t){let n=e2[t];return typeof n=="number"&&Number.isFinite(n)?n:void 0}function $s(e2){return typeof e2=="string"}function Ns(e2){return e2!==null&&typeof e2=="object"&&!Array.isArray(e2)}var Zm,$m,In,Nm,Oi,Tn=P(()=>{"use strict";Zm=Object.freeze({vendor:"",architecture:"",device:"",description:""}),$m=Object.freeze(["maxTextureDimension1D","maxTextureDimension2D","maxTextureDimension3D","maxTextureArrayLayers","maxBindGroups","maxBindGroupsPlusVertexBuffers","maxBindingsPerBindGroup","maxDynamicUniformBuffersPerPipelineLayout","maxDynamicStorageBuffersPerPipelineLayout","maxSampledTexturesPerShaderStage","maxSamplersPerShaderStage","maxStorageBuffersPerShaderStage","maxStorageTexturesPerShaderStage","maxUniformBuffersPerShaderStage","maxUniformBufferBindingSize","maxStorageBufferBindingSize","minUniformBufferOffsetAlignment","minStorageBufferOffsetAlignment","maxVertexBuffers","maxBufferSize","maxVertexAttributes","maxVertexBufferArrayStride","maxInterStageShaderVariables","maxColorAttachments","maxColorAttachmentBytesPerSample","maxComputeWorkgroupStorageSize","maxComputeInvocationsPerWorkgroup","maxComputeWorkgroupSizeX","maxComputeWorkgroupSizeY","maxComputeWorkgroupSizeZ","maxComputeWorkgroupsPerDimension","maxImmediateSize","maxStorageBuffersInVertexStage","maxStorageBuffersInFragmentStage","maxStorageTexturesInVertexStage","maxStorageTexturesInFragmentStage"]),In=Object.freeze(["shader-f16","subgroups","chromium-experimental-subgroup-matrix","timestamp-query","texture-formats-tier1","texture-formats-tier2"]),Nm=Object.freeze({maxTextureDimension1D:8192,maxTextureDimension2D:8192,maxTextureDimension3D:2048,maxTextureArrayLayers:256,maxBindGroups:4,maxBindGroupsPlusVertexBuffers:24,maxBindingsPerBindGroup:1e3,maxDynamicUniformBuffersPerPipelineLayout:8,maxDynamicStorageBuffersPerPipelineLayout:4,maxSampledTexturesPerShaderStage:16,maxSamplersPerShaderStage:16,maxStorageBuffersPerShaderStage:10,maxStorageTexturesPerShaderStage:4,maxUniformBuffersPerShaderStage:12,maxUniformBufferBindingSize:64*1024,maxStorageBufferBindingSize:128*1024*1024,minUniformBufferOffsetAlignment:256,minStorageBufferOffsetAlignment:256,maxVertexBuffers:8,maxBufferSize:256*1024*1024,maxVertexAttributes:16,maxVertexBufferArrayStride:2048,maxInterStageShaderVariables:16,maxColorAttachments:8,maxColorAttachmentBytesPerSample:32,maxComputeInvocationsPerWorkgroup:256,maxComputeWorkgroupSizeX:256,maxComputeWorkgroupSizeY:256,maxComputeWorkgroupSizeZ:64,maxComputeWorkgroupStorageSize:16*1024,maxComputeWorkgroupsPerDimension:65535,maxImmediateSize:64}),Oi=new WeakSet});function Ym(e2){return Object.fromEntries(Object.entries(e2).filter(([,t])=>t!==void 0))}function Fi(e2){if(e2==="u32"||e2==="i32"||e2==="f32")return{align:4,size:4,scalar:e2,components:1};let t=Xm.exec(e2);if(!t)throw new Error(`Unsupported uniform field type: ${e2}`);let n=Number(t[1]);return{align:n===2?8:16,size:n===3?12:n*4,scalar:t[2],components:n}}function Jm(e2){return e2==="u32"||e2==="i32"||e2==="f32"}function Ui(e2,t){return Math.ceil(e2/t)*t}function Vs(e2,t={}){return En(e2,"u32",t)}function Ys(e2,t={}){return En(e2,"i32",t)}function Xs(e2,t={}){return En(e2,"f32",t)}function En(e2,t,n={}){return Gn(e2,"uniform field"),Fi(t),Object.freeze({kind:"uniform-field",name:e2,type:t,semantic:n.semantic,required:n.required??!n.internal,internal:!!n.internal,default:n.default,description:n.description})}function br(e2,t,n={}){if(Gn(e2,"uniform struct"),!Array.isArray(t)||t.length===0)throw new Error(`uniform struct ${e2} requires at least one field`);let r=t.map(s=>tg(s,e2));return Object.freeze({kind:"uniform-struct",name:e2,fields:Object.freeze(ng(r,n))})}function Js(e2){ea(e2);let t=e2.fields.map(n=>`${n.name}: ${n.type}`).join(", ");return`struct ${e2.name} { ${t} };`}function Zi(e2,t={}){if(ea(e2),!e2.fields.every(i=>Jm(i.type)))return eg(e2,t);let n=Math.max(16,Math.ceil(e2.fields.length*4/16)*16),r=new ArrayBuffer(n),s=new Uint32Array(r),a=new Int32Array(r),o=new Float32Array(r);return e2.fields.forEach((i,u)=>{let l=t[i.name];if(l===void 0&&i.required)throw new Error(`Missing uniform field ${e2.name}.${i.name}`);if(l===void 0&&(l=i.default??0),typeof l!="number")throw new Error(`Uniform ${e2.name}.${i.name} expects a scalar number`);$i(i.type,u,l,`${e2.name}.${i.name}`,s,a,o)}),new Uint32Array(r)}function eg(e2,t){let n=[],r=0;for(let u of e2.fields){let l=Fi(u.type);r=Ui(r,l.align),n.push({field:u,layout:l,offset:r}),r+=l.size}let s=new ArrayBuffer(Math.max(16,Ui(r,16))),a=new Uint32Array(s),o=new Int32Array(s),i=new Float32Array(s);for(let{field:u,layout:l,offset:c}of n){let d=t[u.name];if(d===void 0&&u.required)throw new Error(`Missing uniform field ${e2.name}.${u.name}`);d===void 0&&(d=u.default??(l.components===1?0:new Array(l.components).fill(0)));let p=typeof d=="number"?[d]:d;if(p.length!==l.components)throw new Error(`Uniform ${e2.name}.${u.name} expects ${l.components} component(s), got ${p.length}`);for(let f=0;f<l.components;++f)$i(l.scalar,(c+f*4)/4,p[f],`${e2.name}.${u.name}[${f}]`,a,o,i)}return new Uint32Array(s)}function $i(e2,t,n,r,s,a,o){if(e2==="u32"){if(!Number.isInteger(n)||n<0||n>4294967295)throw new Error(`Uniform ${r} must be an integer u32 in [0, 4294967295]`);s[t]=n;return}if(e2==="i32"){if(!Number.isInteger(n)||n<-2147483648||n>2147483647)throw new Error(`Uniform ${r} must be an integer i32 in [-2147483648, 2147483647]`);a[t]=n;return}if(Number.isNaN(n))throw new Error(`Uniform ${r} must not be NaN (f32)`);o[t]=n}function Ni(e2,t,n,r){return e2.createUniformU32(Zi(t,n),r)}function ji(e2){return ea(e2),{kind:e2.kind,name:e2.name,fields:e2.fields.map(t=>Ym({name:t.name,type:t.type,required:t.required,internal:t.internal,semantic:t.semantic,default:t.default,description:t.description}))}}function tg(e2,t){if(!e2||e2.kind!=="uniform-field")throw new Error(`uniform struct ${t} fields must be created with u32(), i32(), or f32()`);return e2}function ng(e2,t){let n=t.alignFieldsTo??4;if(!Number.isInteger(n)||n<=0)throw new Error(`alignFieldsTo must be a positive integer, got ${n}`);let r=[...e2],s=r.length%n;if(s===0)return Object.freeze(r);let a=n-s,o=0,i=new Set(r.map(u=>u.name));for(let u=0;u<a;++u){for(;i.has(`_pad${o}`);)o++;let l=`_pad${o++}`;i.add(l),r.push(En(l,"u32",{internal:true,required:false,default:0}))}return Object.freeze(r)}function ea(e2){if(!e2||e2.kind!=="uniform-struct")throw new Error("Expected a uniform struct schema")}function Gn(e2,t){if(typeof e2!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e2))throw new Error(`${t} name must be a WGSL-compatible identifier, got ${e2}`)}var Xm,kr=P(()=>{"use strict";Xm=/^vec([234])<(u32|i32|f32)>$/});function ta(e2,t={}){Gn(e2,"storage binding");let n=t.access??"read";if(!(n in Vi))throw new Error(`storage binding ${e2} has unsupported access ${n}`);return Object.freeze({kind:"storage",name:e2,arg:t.arg,access:n,elementType:t.elementType??"f32",semantic:t.semantic,role:t.role,binding:t.binding,group:t.group})}function na(e2,t,n={}){Gn(e2,"uniform binding");let r;if(ig(t)?r=br(n.structName??ag(e2),t):r=t,!r||r.kind!=="uniform-struct")throw new Error(`uniform binding ${e2} requires a uniformStruct schema or field array`);return Object.freeze({kind:"uniform",name:e2,struct:r,semantic:n.semantic,binding:n.binding,group:n.group})}function Yt(e2){if(!Array.isArray(e2)||e2.length===0)throw new Error("bindGroup requires at least one binding");let t=new Set,n=new Set;return Object.freeze(e2.map((r,s)=>{if(!r||r.kind!=="storage"&&r.kind!=="uniform")throw new Error("bindGroup entries must be storage() or uniform() bindings");if(t.has(r.name))throw new Error(`duplicate bindGroup binding name: ${r.name}`);t.add(r.name);let a=r.binding??s;if(!Number.isInteger(a)||a<0)throw new Error(`binding ${r.name} has invalid binding index ${a}`);let o=r.group??0;if(!Number.isInteger(o)||o<0)throw new Error(`binding ${r.name} has invalid bind group index ${o}`);let i=`${o}:${a}`;if(n.has(i))throw new Error(`duplicate bindGroup binding index ${a} in @group(${o})`);return n.add(i),Object.freeze({...r,binding:a})}))}function ra(e2,t={}){return Yt(e2).map(n=>rg(n,t)).join(`
`)}function Yi(e2){let t=[],n=new Map;for(let r of Yt(e2)){if(r.kind!=="uniform")continue;let s=JSON.stringify(ji(r.struct)),a=n.get(r.struct.name);if(a!==void 0){if(a!==s)throw new Error(`uniform struct ${r.struct.name} is declared with conflicting schemas`);continue}n.set(r.struct.name,s),t.push(Js(r.struct))}return t.join(`
`)}function Xi(e2,t,n,r={}){let s=Yt(t),a=r.labelPrefix??"kernel",o=[];return{bindings:s.map(u=>{let l=n?.[u.name];if(l==null)throw new Error(`Missing resource for binding ${u.name}`);if(u.kind==="uniform"){let f;return sa(l)?f=l:(f=Ni(e2,u.struct,l,`${a}-${u.name}`),typeof f.destroy=="function"&&o.push(()=>f.destroy?.())),{buffer:f,type:"uniform",binding:u.binding,...u.group?{group:u.group}:{}}}let c=l,d=typeof c.byteOffset=="number"?c.byteOffset:0,p=typeof c.byteLength=="number"?og(c.byteLength):void 0;return{tensor:l,type:Vi[u.access],binding:u.binding,...u.group?{group:u.group}:{},...d?{offset:d}:{},...p!==void 0?{size:p}:{}}}),cleanup:()=>{for(let u of o)u()}}}function rg(e2,t){let n=e2.group??0;if(e2.kind==="storage"){let r=e2.access==="read_write"?"read_write":"read",s=sg(e2.elementType,t,`binding ${e2.name} elementType`);return`@group(${n}) @binding(${e2.binding}) var<storage, ${r}> ${e2.name}: array<${s}>;`}return`@group(${n}) @binding(${e2.binding}) var<uniform> ${e2.name}: ${e2.struct.name};`}function sg(e2,t,n){if(typeof e2!="string"||!e2.startsWith("$"))return e2;let r=e2.slice(1),s=t[r];if(s==null)throw new Error(`Missing template value ${r} for ${n}`);return s}function sa(e2){return e2!==null&&typeof e2=="object"&&typeof e2.destroy=="function"&&!("shape"in e2)}function ag(e2){return e2.length===0?e2:e2[0].toUpperCase()+e2.slice(1)}function og(e2){return Math.max(4,Math.ceil(e2/4)*4)}function ig(e2){return Array.isArray(e2)}var Vi,xn=P(()=>{"use strict";kr();Vi=Object.freeze({read:"read-only-storage",read_write:"storage"})});function ge(e2){let t=et[e2];if(!t)throw new Error(`Unsupported dtype: ${e2}`);return t.storageByteSize}function ye(e2){if(!Array.isArray(e2))throw new Error("shape must be an array");let t=1;for(let n of e2){if(!Number.isInteger(n)||n<0)throw new Error(`invalid shape dimension: ${n}`);t*=n}return t}function tt(e2){return e2!==null&&typeof e2=="object"&&typeof e2.dtype=="string"&&Array.isArray(e2.shape)&&typeof e2.size=="number"&&typeof e2.byteLength=="number"&&"buffer"in e2&&"runtime"in e2}function De(e2,t){let n=ye([...t]);return{dtype:e2,shape:[...t],size:n,byteLength:n*ge(e2),byteOffset:0,buffer:{destroy(){}},runtime:null,destroy(){}}}var Wb,et,Le=P(()=>{"use strict";Wb=Object.freeze({float16:"float16",float32:"float32",int8:"int8",int16:"int16",int32:"int32",uint8:"uint8",uint32:"uint32",bool:"bool"}),et=Object.freeze({float16:{storageByteSize:2,onDiskByteSize:2,wgslScalar:"f16",arrayCtor:Uint16Array},float32:{storageByteSize:4,onDiskByteSize:4,wgslScalar:"f32",arrayCtor:Float32Array},int8:{storageByteSize:4,onDiskByteSize:1,wgslScalar:"i32",arrayCtor:Int32Array},int16:{storageByteSize:4,onDiskByteSize:2,wgslScalar:"i32",arrayCtor:Int32Array},int32:{storageByteSize:4,onDiskByteSize:4,wgslScalar:"i32",arrayCtor:Int32Array},uint8:{storageByteSize:4,onDiskByteSize:1,wgslScalar:"u32",arrayCtor:Uint32Array},uint32:{storageByteSize:4,onDiskByteSize:4,wgslScalar:"u32",arrayCtor:Uint32Array},bool:{storageByteSize:4,onDiskByteSize:1,wgslScalar:"u32",arrayCtor:Uint32Array}})});function Qn(e2){return e2==null?e2:Array.isArray(e2)?e2.map(Qn):e2 instanceof Map?Object.fromEntries([...e2].map(([t,n])=>[t,Qn(n)])):typeof e2=="object"&&"value"in e2?e2.type==="NullValue"?null:Qn(e2.value):e2}function be(e2){return((...t)=>e2(...t.map(Qn)))}function aa(e2){let t=et[Xt(e2)];if(!t)throw new Error(`Unsupported WebGPU dtype: ${e2}`);return t.wgslScalar}function Xt(e2){return e2==="f32"?"float32":e2==="f16"?"float16":e2==="u32"?"uint32":e2==="i32"?"int32":e2}function su(e2={}){let t=e2,n=oa(e2.device),r=n.features.has("shader-f16");return{...ru,f16Ok:be(s=>s!=="f16"&&s!=="float16"||r),f16Allowed:be(s=>s==="f32"||s==="float32"||(s==="f16"||s==="float16")&&r),op:e2.op,variant:e2.variant,pass:e2.pass,device:n,attrs:e2.attrs??{},args:e2.args??{},source:e2.sourceContext??{},present:e2.present??{},shapes:e2.shapes??{},ranks:e2.ranks??{},tensorDtypes:e2.tensorDtypes??{},dtypes:e2.dtypes??{},...e2.derived??{},tunables:e2.tunables??{},constants:e2.constants??{},repeat:e2.repeat??{},...e2.constants??{},...t.env!==void 0?{env:t.env}:{}}}function oa(e2){let t=Me(e2),n=eu.get(t);return n===void 0&&(n={features:t.features,wgslLanguageFeatures:t.wgslLanguageFeatures,limits:t.limits,adapterInfo:zi(t)},eu.set(t,n)),n}function $e(e2,t={}){if(typeof e2!="string")return e2;let n=su(t),r=mg(e2),s=r.freeIdentifiers.filter(o=>!(o in n));if(s.length>0)throw new Error(`Unknown identifier${s.length===1?"":"s"} ${s.map(o=>`"${o}"`).join(", ")} in WebGPU expression: ${e2}
Identifiers resolve against the expression scope. Namespaces: args, attrs, shapes, ranks, dtypes, tensorDtypes, present, constants, tunables, source, repeat, device (plus the bare names declared in \`derive\`).
device sub-fields: features, wgslLanguageFeatures, limits, adapterInfo.
Helper functions: ${[...Object.keys(ru),...ug].join(", ")}.
If a string literal was intended, quote it (e.g. '"${s[0]}"' not '${s[0]}').`);if(r.statement===void 0)throw r.parseError??new Error(`Empty WebGPU expression: ${e2}`);let a=new at;for(let[o,i]of lg)a.set(o,i);for(let o of r.freeIdentifiers)a.set(o,n[o]);for(let o of r.probedIdentifiers)o in n&&a.set(o,n[o]);return Qn(new zs(a).evaluate(r.statement,a))}function ia(e2,t={}){return cg(e2,su(t))}function cg(e2,t){let n=Ji.get(e2);n||(n=new fr(e2),Ji.set(e2,n));let r=pg(e2),s=r?dg(t,r):t;return n.render(s)}function dg(e2,t){let n={};for(let r of Object.keys(e2))t.has(r)&&(n[r]=e2[r]);return n}function pg(e2){let t=tu.get(e2);if(t!==void 0)return t;let n;try{let r=pr(dr(e2,au)),s=new Set,a=o=>{if(!o||typeof o!="object")return;if(Array.isArray(o)){for(let u of o)a(u);return}if(o instanceof Map){for(let[u,l]of o)a(u),a(l);return}let i=o;i.type==="Identifier"&&typeof i.value=="string"&&s.add(i.value);for(let u of Object.keys(i))u!=="type"&&a(i[u])};a(r),n=s}catch{n=null}return tu.set(e2,n),n}function mg(e2){let t=nu.get(e2);if(t!==void 0)return t;let n=new Set,r=new Set,s=i=>{if(!i||typeof i!="object")return;if(Array.isArray(i)){for(let l of i)s(l);return}if(i instanceof Map){for(let[l,c]of i)s(l),s(c);return}let u=i;switch(u.type){case"Identifier":fg.has(u.value)||n.add(u.value);return;case"MemberExpression":s(u.object),u.computed&&s(u.property);return;case"BinaryExpression":s(u.left),s(u.right);return;case"UnaryExpression":s(u.argument);return;case"FilterExpression":{s(u.operand);let l=u.filter;l?.type==="CallExpression"&&s(l.args);return}case"TestExpression":{let l=u.test,c=u.operand;(l?.value==="defined"||l?.value==="undefined")&&c?.type==="Identifier"?r.add(c.value):s(u.operand);return}case"CallExpression":s(u.callee),s(u.args);return;case"KeywordArgumentExpression":s(u.value);return;default:{for(let[l,c]of Object.entries(u))l!=="type"&&s(c);return}}},a,o;try{let i=pr(dr(`{{ ${e2} }}`,au));a=i.body[0],s(i)}catch(i){o=i}for(let i of n)r.delete(i);return t=Object.freeze({statement:a,...o!==void 0?{parseError:o}:{},freeIdentifiers:Object.freeze([...n]),probedIdentifiers:Object.freeze([...r])}),nu.set(e2,t),t}function ht(e2,t){let n={};for(let[r,s]of Object.entries(e2??{}))n[r]=At(s,t);return n}function At(e2,t){return typeof e2=="string"?$e(e2,t):Array.isArray(e2)?e2.map(n=>At(n,t)):e2&&typeof e2=="object"?Object.fromEntries(Object.entries(e2).map(([n,r])=>[n,At(r,t)])):e2}var Ji,ru,ug,eu,lg,tu,nu,au,fg,Dn=P(()=>{"use strict";Hs();Tn();Le();Ji=new Map;ru=Object.freeze({ceil:be(e2=>Math.ceil(e2)),floor:be(e2=>Math.floor(e2)),min:be((...e2)=>Math.min(...e2)),max:be((...e2)=>Math.max(...e2)),pow:be((e2,t)=>Math.pow(e2,t)),ceilDiv:be((e2,t)=>Math.ceil(e2/t)),pow2ceil:be(e2=>e2<=1?1:2**Math.ceil(Math.log2(e2))),numel:be(e2=>e2.reduce((t,n)=>t*n,1)),rank:be(e2=>e2.length),dim:be((e2,t)=>{let n=(t%e2.length+e2.length)%e2.length;return e2[n]}),rows:be((e2,t)=>{let n=(t%e2.length+e2.length)%e2.length;return e2.reduce((r,s,a)=>a===n?r:r*s,1)}),cols:be((e2,t)=>{let n=(t%e2.length+e2.length)%e2.length;return e2[n]}),outer:be((e2,t)=>{let n=(t%e2.length+e2.length)%e2.length;return e2.slice(0,n).reduce((r,s)=>r*s,1)}),inner:be((e2,t)=>{let n=(t%e2.length+e2.length)%e2.length;return e2.slice(n+1).reduce((r,s)=>r*s,1)}),broadcastable:be((e2,t)=>{if(e2.length>t.length)return false;let n=t.length-e2.length;return e2.every((r,s)=>r===1||r===t[s+n])}),sameShape:be((e2,t)=>e2.length===t.length&&e2.every((n,r)=>n===t[r])),hasAxis:be((e2,t,n)=>{let r=(t%n+n)%n;return e2.some(s=>(s%n+n)%n===r)}),has:be((e2,t)=>e2 instanceof Map?e2.has(t):!!(e2&&Object.prototype.hasOwnProperty.call(e2,t))),dtypeBytes:be(e2=>{let t=et[Xt(e2)];if(!t)throw new Error(`Unsupported dtype for dtypeBytes(): ${e2}`);return t.storageByteSize}),pick:be((e2,t)=>{if(!Array.isArray(e2))throw new Error("pick() expects a list of [condition, value] pairs as its first argument");for(let n of e2){if(!Array.isArray(n)||n.length<2)throw new Error("pick() entries must be [condition, value] pairs");if(n[0])return n[1]}return t})});ug=["f16Ok","f16Allowed"];eu=new WeakMap;lg=[["true",true],["false",false],["none",null],["True",true],["False",false],["None",null]];tu=new Map;nu=new Map,au=Object.freeze({lstrip_blocks:true,trim_blocks:true}),fg=new Set(["true","false","none","True","False","None"])});function Rt(e2){let t=e2 instanceof Map?new Map(e2):new Map(Object.entries(e2));return Object.freeze({readText(n){let r=t.get(n);if(r===void 0)throw new Error(`WebGPU template asset is missing: ${n}`);return r},has(n){return t.has(n)}})}function la(e2){Pn(e2,"WebGPU manifest");let t=e2.schemaVersion??1;if(t!==1)throw new Error(`Unsupported WebGPU manifest schemaVersion: ${t}`);let n=e2.domain??"ai.onnx";Dg(n,"WebGPU manifest domain");let r=e2.name;if(typeof r!="string"||r.length===0)throw new Error("WebGPU manifest requires a non-empty name");if(!Array.isArray(e2.inputs))throw new Error(`WebGPU manifest ${n}.${r} requires inputs`);if(!Array.isArray(e2.outputs))throw new Error(`WebGPU manifest ${n}.${r} requires outputs`);if(!Sr(e2.args)||Object.keys(e2.args).length===0)throw new Error(`WebGPU manifest ${n}.${r} requires explicit args`);Qg(e2.args,`${n}.${r}.args`);let s=_g(e2,`${n}.${r}`),a=wg(e2,s);return Object.freeze({schemaVersion:1,domain:n,name:r,id:`${n}.${r}`,sinceVersion:e2.sinceVersion,inputs:Object.freeze([...e2.inputs]),outputs:Object.freeze([...e2.outputs]),args:Object.freeze({...e2.args}),attributes:Object.freeze({...e2.attributes??{}}),derive:Object.freeze({...e2.derive??{}}),typeConstraints:Object.freeze({...e2.typeConstraints??{}}),tunables:Object.freeze({...e2.tunables??{}}),staticShapes:Object.freeze([...e2.staticShapes??[]]),variants:Object.freeze(a)})}function Ag(e2){let t=new Map;for(let[n,r]of Object.entries(e2)){if(r.kind!=="tensor")continue;let s=new Set([n,r.semantic,r.role].filter(a=>typeof a=="string"&&a.length>0));for(let a of s){let o=t.get(a);o?o.push(n):t.set(a,[n])}}for(let[n,r]of t)r.length<2&&t.delete(n);return t}function iu(e2){let t=Ag(e2),n=new Map;for(let[r,s]of Object.entries(e2)){if(s.kind!=="tensor")continue;let a=new Set([r,s.semantic,s.role].filter(o=>typeof o=="string"&&o.length>0));n.set(r,[...a].filter(o=>!t.has(o)))}return n}function uu(e2){return e2.map(t=>{if(t.buffer.type==="uniform"){if(!t.struct)throw new Error(`WebGPU uniform binding ${t.name} requires struct`);return na(t.name,br(t.struct.name,t.struct.fields.map(xg)),{semantic:t.semantic,binding:t.binding,group:t.group})}return ta(t.name,{arg:t.arg,access:t.buffer.type==="storage"?"read_write":"read",elementType:t.elementType,semantic:t.semantic??t.role,role:t.role,binding:t.binding,group:t.group})})}function _g(e2,t){let n=new Map;for(let[r,s]of Object.entries(e2.bindingSets??{})){if(!Array.isArray(s)||s.length===0)throw new Error(`WebGPU manifest ${t} bindingSet "${r}" must be a non-empty binding array`);n.set(r,s)}return n}function lu(e2,t,n){if(Array.isArray(e2))return e2;if(typeof e2=="string"){let r=t.get(e2);if(!r)throw new Error(`WebGPU ${n} references unknown bindingSet "${e2}"`);return r}throw new Error(`WebGPU ${n} bindings must be an array or a bindingSet name`)}function wg(e2,t){let n=`${e2.domain??"ai.onnx"}.${e2.name}`,r=hg.filter(a=>e2[a]!==void 0);if(r.length>0)throw new Error(`WebGPU manifest ${n} has pass field${r.length===1?"":"s"} at the top level: ${r.join(", ")}. Declare ${r.length===1?"it":"them"} on variants[].passes[] (kernel-authoring framework, §4).`);let s=Cr(e2,n);if(s.length===0)throw new Error(`WebGPU manifest ${n} requires a non-empty variants list`);return s.map((a,o)=>bg(a,o,t))}function Cr(e2,t){let n=[...e2.variants??[]];for(let r of e2.variantFamilies??[]){let s=Object.keys(r.axes??{});if(s.length===0)throw new Error(`WebGPU manifest ${t}: a variantFamily requires at least one axis`);if(!Array.isArray(r.variants)||r.variants.length===0)throw new Error(`WebGPU manifest ${t}: a variantFamily requires at least one base variant`);for(let a of s){let o=r.axes[a];if(!Array.isArray(o)||o.length===0)throw new Error(`WebGPU manifest ${t}: variantFamily axis "${a}" must be a non-empty array`)}for(let a of yg(s,r.axes))for(let o of r.variants)n.push(vr(o,a))}return n}function yg(e2,t){let n=[{}];for(let r of e2)n=n.flatMap(s=>t[r].map(a=>({...s,[r]:a})));return n}function vr(e2,t){if(typeof e2=="string")return e2.replace(/\{([A-Za-z_]\w*)\}/g,(n,r)=>r in t?String(t[r]):n);if(Array.isArray(e2))return e2.map(n=>vr(n,t));if(e2!==null&&typeof e2=="object"){let n={};for(let[r,s]of Object.entries(e2))n[vr(r,t)]=vr(s,t);return n}return e2}function bg(e2,t,n){Pn(e2,"WebGPU variant");let r=e2.id??e2.name??`variant_${t}`;if(!/^[A-Za-z0-9][A-Za-z0-9_]*$/.test(r))throw new Error(`WebGPU variant id must be stable, got ${r}`);let s=e2.passes;if(!Array.isArray(s)||s.length===0)throw new Error(`WebGPU variant ${r} requires passes`);let a=e2.bindings!==void 0?lu(e2.bindings,n,`variant ${r}`):void 0,o=cu(s,a,n,r),i=du(o),u=e2.version??1;if(!Number.isInteger(u)||u<1)throw new Error(`WebGPU variant ${r} version must be an integer >= 1`);return Object.freeze({id:r,name:e2.name??r,version:u,default:!!e2.default,priority:e2.priority??0,when:Eg(e2.when,r),selectAbove:typeof e2.selectAbove=="string"&&e2.selectAbove.length>0?e2.selectAbove:null,requires:Gg(e2),tunables:Object.freeze({...e2.tunables??{}}),derive:Object.freeze({...e2.derive??{}}),constants:Object.freeze({...e2.constants??{}}),intermediates:Object.freeze([...e2.intermediates??[]]),passes:Object.freeze(i),passSequence:Object.freeze(o)})}function cu(e2,t,n,r,s=new Set){return e2.map((a,o)=>{if(!kg(a))return Sg(a,t,o,n);let i=a.id??`repeat_${o}`;if(!/^[A-Za-z0-9][A-Za-z0-9_]*$/.test(i))throw new Error(`WebGPU variant ${r} repeat group id must be stable, got ${i}`);Pn(a.repeat,`WebGPU repeat group ${i}.repeat`);let u=a.repeat.index;if(typeof u!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(u))throw new Error(`WebGPU repeat group ${i} index must be an identifier, got ${String(u)}`);if(u==="index"||u==="count")throw new Error(`WebGPU repeat group ${i} index cannot use reserved repeat member ${u}`);if(s.has(u))throw new Error(`WebGPU repeat group ${i} index ${u} shadows an outer repeat index`);if(a.repeat.count===void 0)throw new Error(`WebGPU repeat group ${i} requires repeat.count`);if(!Array.isArray(a.passes)||a.passes.length===0)throw new Error(`WebGPU repeat group ${i} requires passes`);let l=new Set(s);return l.add(u),Object.freeze({kind:"repeat",id:i,count:a.repeat.count,index:u,passes:Object.freeze(cu(a.passes,t,n,r,l))})})}function kg(e2){return Sr(e2)&&"repeat"in e2}function du(e2){let t=[];for(let n of e2)vg(n)?t.push(...du(n.passes)):t.push(n);return t}function vg(e2){return"kind"in e2&&e2.kind==="repeat"}function Cg(e2,t){if(!e2||typeof e2!="object")return e2;let n=e2,r="threads"in e2,s="workgroups"in e2,a="gridStride"in e2,o=Number(r)+Number(s)+Number(a);if(o===0)return e2;if(o>1)throw new Error(`WebGPU pass ${t} dispatch must use exactly one of 'threads'+'workgroupSize', 'workgroups', or 'gridStride'[+'workgroupSize']`);let i=["x","y","z"].filter(l=>n[l]!==void 0);if(a){if(i.length)throw new Error(`WebGPU pass ${t} dispatch 'gridStride' shorthand takes no 'x'/'y'/'z' axis (it clamps without folding)`);let l=n.workgroupSize!==void 0?`ceilDiv((${qt(n.gridStride,t)}), (${qt(n.workgroupSize,t)}))`:qt(n.gridStride,t);return ua(l,false)}if(i.length>1)throw new Error(`WebGPU pass ${t} dispatch shorthand may pin at most one axis ('x', 'y', or 'z'); the overflow fold needs two free axes`);let u={};for(let l of i)u[l]=qt(n[l],t);if(r){if(n.workgroupSize===void 0)throw new Error(`WebGPU pass ${t} dispatch shorthand requires both 'threads' and 'workgroupSize'`);return ua(`ceilDiv((${qt(n.threads,t)}), (${qt(n.workgroupSize,t)}))`,true,u)}if(n.workgroupSize!==void 0)throw new Error(`WebGPU pass ${t} dispatch 'workgroups' shorthand takes no 'workgroupSize' (use 'threads'+'workgroupSize' instead)`);return ua(qt(n.workgroups,t),true,u)}function ua(e2,t,n={}){let r=`min(${e2}, ${ou})`;if(!t)return Object.freeze({x:r,y:1,z:1});let s=`ceilDiv(${e2}, ${ou})`,a=["x","y","z"],o={x:1,y:1,z:1};for(let u of a)n[u]!==void 0&&(o[u]=n[u]);let i=a.filter(u=>n[u]===void 0);return o[i[0]]=r,o[i[1]]=s,Object.freeze(o)}function qt(e2,t){if(typeof e2=="string")return e2;if(typeof e2=="number"&&Number.isFinite(e2))return String(e2);throw new Error(`WebGPU pass ${t} dispatch threads/workgroupSize must be an expression string or finite number, got ${typeof e2}`)}function Sg(e2,t,n,r){if(e2.submitAfter!==void 0&&typeof e2.submitAfter!="boolean")throw new Error(`WebGPU pass ${e2.id??n} submitAfter must be a boolean`);let s=Ig(e2,n);if(!e2.dispatch)throw new Error(`WebGPU pass ${e2.id??n} requires dispatch`);let a=Cg(e2.dispatch,e2.id??n),o=e2.bindings!==void 0?lu(e2.bindings,r,`pass ${e2.id??n}`):t;if(!Array.isArray(o)||o.length===0)throw new Error(`WebGPU pass ${e2.id??n} requires bindings`);return Object.freeze({id:e2.id??`pass_${n}`,...e2.name?{name:e2.name}:{},source:s,entryPoint:e2.entryPoint??"main",bindings:Object.freeze(o.map(Tg)),constants:Object.freeze({...e2.constants??{}}),uniforms:Object.freeze({...e2.uniforms??{}}),dispatch:a,profile:Object.freeze({...e2.profile??{}}),submitAfter:e2.submitAfter===true,...e2.viewAlias?{viewAlias:Bg(e2.viewAlias,o,`pass ${e2.id??n}`)}:{},reads:Object.freeze([...e2.reads??[]]),writes:Object.freeze([...e2.writes??[]])})}function Bg(e2,t,n){if(!Array.isArray(e2)||e2.length===0)throw new Error(`WebGPU ${n} viewAlias must be a non-empty array of { input, output } binding-name pairs`);let r=a=>t.find(o=>o.name===a)?.buffer.type,s=e2.map(a=>{if(typeof a?.input!="string"||typeof a?.output!="string")throw new Error(`WebGPU ${n} viewAlias pair must be { "input": <binding>, "output": <binding> }`);if(r(a.input)!=="read-only-storage")throw new Error(`WebGPU ${n} viewAlias.input "${a.input}" must name a read-only-storage binding of the pass`);if(r(a.output)!=="storage")throw new Error(`WebGPU ${n} viewAlias.output "${a.output}" must name a storage (read_write) binding of the pass`);return Object.freeze({input:a.input,output:a.output})});return Object.freeze(s)}function Ig(e2,t){let n=`WebGPU pass ${e2.id??t}`,r=e2.source;if(r!==void 0){if(Pn(r,`${n}.source`),r.kind==="template"){let s=r.shader??e2.shader;if(typeof s!="string"||s.length===0)throw new Error(`${n} template source requires shader`);if(e2.shader!==void 0&&e2.shader!==s)throw new Error(`${n} has conflicting shader and source.shader`);if(r.version!==void 0&&typeof r.version!="string"&&typeof r.version!="number")throw new Error(`${n} template source version must be a string or number`);if(r.inputs!==void 0&&!Sr(r.inputs))throw new Error(`${n} template source inputs must be an object`);return Object.freeze({kind:"template",shader:s,...r.version!==void 0?{version:r.version}:{},inputs:Object.freeze({...r.inputs??{}})})}throw new Error(`${n} source has unsupported kind ${r.kind}`)}if(typeof e2.shader!="string"||e2.shader.length===0)throw new Error(`${n} requires shader or source`);return Object.freeze({kind:"template",shader:e2.shader,inputs:Object.freeze({})})}function Tg(e2,t){if(Pn(e2,`WebGPU binding ${t}`),e2.optional===true)throw new Error(`WebGPU binding ${e2.name??e2.role??t} cannot be optional; use a separate variant`);let n=e2.buffer?.type;if(!n||!gg.has(n))throw new Error(`WebGPU binding ${e2.name??e2.role??t} has invalid buffer type`);let r=e2.name??e2.role??e2.semantic;if(typeof r!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(r))throw new Error(`WebGPU binding requires a WGSL-compatible name, got ${String(r)}`);let s=Object.freeze({name:r,...e2.role!==void 0?{role:e2.role}:{},...e2.semantic!==void 0?{semantic:e2.semantic}:{},...e2.arg!==void 0?{arg:e2.arg}:{},buffer:{type:n},...e2.elementType?{elementType:e2.elementType}:{},...e2.struct?{struct:e2.struct}:{},...e2.binding!==void 0?{binding:e2.binding}:{},...e2.group!==void 0?{group:e2.group}:{}});if(n==="uniform"&&!s.struct)throw new Error(`WebGPU uniform binding ${r} requires struct`);if(n!=="uniform"&&!s.elementType)throw new Error(`WebGPU storage binding ${r} requires elementType`);return s}function Eg(e2,t){if(e2===void 0)return true;if(Array.isArray(e2)){if(e2.length===0)throw new Error(`WebGPU variant ${t} when[] must be a non-empty list of predicates`);for(let n of e2)if(typeof n!="string"||n.length===0)throw new Error(`WebGPU variant ${t} when[] entries must be non-empty expression strings, got ${JSON.stringify(n)}`);return Object.freeze([...e2])}if(typeof e2!="string"&&typeof e2!="boolean")throw new Error(`WebGPU variant ${t} when must be a string, boolean, or string[], got ${JSON.stringify(e2)}`);return e2}function Gg(e2){let t={...e2.requiredFeatures?{requiredFeatures:e2.requiredFeatures}:{},...e2.requiredLimits?{requiredLimits:e2.requiredLimits}:{},...e2.requiredWGSLLanguageFeatures?{requiredWGSLLanguageFeatures:e2.requiredWGSLLanguageFeatures}:{},...e2.requiredSubgroupMinSize!==void 0?{requiredSubgroupMinSize:e2.requiredSubgroupMinSize}:{}};if(t.requiredSubgroupMinSize!==void 0&&(!Number.isInteger(t.requiredSubgroupMinSize)||t.requiredSubgroupMinSize<1))throw new Error(`WebGPU variant ${e2.id??e2.name??"?"} requiredSubgroupMinSize must be a positive integer`);return Object.keys(t).length===0?null:t}function xg(e2){if(e2.type==="u32")return Vs(e2.name,e2);if(e2.type==="i32")return Ys(e2.name,e2);if(e2.type==="f32")return Xs(e2.name,e2);throw new Error(`Unsupported WebGPU uniform field type: ${e2.type}`)}function Qg(e2,t){for(let[n,r]of Object.entries(e2)){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(n))throw new Error(`${t}.${n} is not a valid arg name`);if(!["tensor","u32","i32","f32","bool","string"].includes(r.kind))throw new Error(`${t}.${n} has unsupported kind ${String(r.kind)}`)}}function Dg(e2,t){if(!/^[a-z][a-z0-9]*(?:\.[A-Za-z][A-Za-z0-9_]*)*$/.test(e2))throw new Error(`${t} must be a dotted canonical domain, got ${e2}`)}function Pn(e2,t){if(!Sr(e2))throw new Error(`${t} must be an object`)}function Sr(e2){return e2!==null&&typeof e2=="object"&&!Array.isArray(e2)}var gg,hg,ou,Br=P(()=>{"use strict";xn();kr();gg=new Set(["read-only-storage","storage","uniform"]);hg=["shader","entryPoint","bindings","constants","uniforms","profile","submitAfter","dispatch"];ou="device.limits.maxComputeWorkgroupsPerDimension"});function ca(e2){return{attrs:e2.attrs,dtypes:e2.dtypes,tensorDtypes:e2.tensorDtypes,ranks:e2.ranks,tunables:e2.tunables}}function pu(e2,t,n,r=null){return Ct({op:e2.id,sinceVersion:e2.sinceVersion,variant:t.id,variantVersion:t.version,...ca(n),staticShapes:Lg(n,e2.staticShapes),specialization:r,device:vt(n.device),bindings:t.passes.map(s=>s.bindings.map(a=>({name:a.name,binding:a.binding,group:a.group,type:a.buffer.type,elementType:a.elementType,struct:Pg(a.struct)})))})}function Pg(e2){return e2&&{name:e2.name,fields:e2.fields.map(t=>({name:t.name,type:t.type}))}}function fu(e2){return Ct({shapes:e2.shapes,args:e2.args})}function mu(e2,t){return`${e2}|shapes=${t}`}function Ct(e2){return Array.isArray(e2)?`[${e2.map(Ct).join(",")}]`:e2&&typeof e2=="object"?`{${Object.keys(e2).sort().map(t=>`${JSON.stringify(t)}:${Ct(e2[t])}`).join(",")}}`:JSON.stringify(e2)}function Lg(e2,t){let n={};for(let r of t){let[s,a]=r.split("."),o=e2.shapes[s];if(!o)continue;if(a===void 0||a==="*"){n[r]=o;continue}let i=Number(a);Number.isInteger(i)&&(n[r]=o[i])}return n}var Ir,Tr,Er,gu=P(()=>{"use strict";Tn();Ir=class{entries=new Map;hits=0;misses=0;get(t){let n=this.entries.get(t);if(n===void 0){this.misses+=1;return}return this.hits+=1,n}getOrCreate(t,n){let r=this.get(t);if(r!==void 0)return r;let s=n();return this.entries.set(t,s),s}clear(){this.entries.clear(),this.hits=0,this.misses=0}},Tr=class extends Ir{},Er=class extends Ir{}});function Au(e2,t,n,r=false){return e2.map(s=>{let a=r?[0]:Rg(At(s.shape,n),s.id),o=Xt(s.dtype),i=qg(s.id,t);return Object.freeze({id:s.id,dtype:o,shape:a,firstWrite:i.firstWrite,lastRead:i.lastRead,byteLength:ye(a)*ge(o)})})}function qg(e2,t){let n=Number.POSITIVE_INFINITY,r=-1;for(let s=0;s<t.length;++s)t[s].writes.includes(e2)&&(n=Math.min(n,s)),t[s].reads.includes(e2)&&(r=Math.max(r,s));return Number.isFinite(n)||(n=0),r<n&&(r=n),{firstWrite:n,lastRead:r}}function Rg(e2,t){let n=Array.isArray(e2)?e2:[e2];if(n.length===0)throw new Error(`WebGPU scratch ${t} shape must not be empty`);return Object.freeze(n.map(r=>{if(!Number.isInteger(r)||Number(r)<0)throw new Error(`WebGPU scratch ${t} shape dimension must be a nonnegative integer, got ${String(r)}`);return Number(r)}))}var hu=P(()=>{"use strict";Le();Dn()});function wu(e2,t){if(!da(e2.passSequence))return Object.freeze(e2.passes.map(a=>Object.freeze({pass:a,id:a.id,pipelineBaseId:a.id,repeat:t.repeat,repeated:false})));let r=[];if(yu(e2.passSequence,t,t.repeat,"","",false,r),r.length>Gr)throw new Error(`WebGPU variant ${e2.id} expands to ${r.length} passes; maximum is ${Gr}`);let s=new Set;for(let a of r){if(s.has(a.id))throw new Error(`WebGPU variant ${e2.id} expands duplicate pass id ${a.id}`);s.add(a.id)}return Object.freeze(r)}function da(e2){return e2.some(bu)}function yu(e2,t,n,r,s,a,o){for(let i of e2){if(!bu(i)){if(o.push(Object.freeze({pass:i,id:`${r}${i.id}`,pipelineBaseId:`${s}${i.id}`,repeat:n,repeated:a})),o.length>Gr)return;continue}let u=$e(i.count,{...t,repeat:n});if(!Number.isInteger(u)||Number(u)<0||Number(u)>_u)throw new Error(`WebGPU repeat group ${i.id} count must resolve to an integer in [0, ${_u}], got ${String(u)}`);let l=Number(u);for(let c=0;c<l;++c){let d=Object.freeze({...n,index:c,count:l,[i.index]:c,[`${i.index}_count`]:l});if(yu(i.passes,t,d,`${r}${i.id}[${c}].`,`${s}${i.id}.`,true,o),o.length>Gr)return}}}function bu(e2){return"kind"in e2&&e2.kind==="repeat"}var _u,Gr,ku=P(()=>{"use strict";Dn();_u=65535,Gr=131072});function vu(e2,t){let n=[];for(let r of e2.split(`
`)){let s=Kg.exec(r);if(s)for(let a of s[1].split(",")){let o=a.trim();if(o.length===0)continue;let i=Mg[o];i&&!t.has(i)&&n.push(`enable ${o}; (requires device feature "${i}")`)}}return n}var Mg,Kg,Cu=P(()=>{"use strict";Mg=Object.freeze({f16:"shader-f16",subgroups:"subgroups",chromium_experimental_subgroup_matrix:"chromium-experimental-subgroup-matrix"}),Kg=/^\s*enable\s+([^;]+);/});var xu={};bn(xu,{executeWebGpuPlan:()=>Og,materializeComputePassDescriptorTemplate:()=>Tu,materializeWebGpuExecutionPlan:()=>Ln});function Bu(e2){let t=0;for(let n of e2){if(n.type!=="storage"&&n.type!=="read-only-storage")continue;let r=n,s=typeof r.size=="number"?r.size:typeof r.tensor?.byteLength=="number"?r.tensor.byteLength:void 0;typeof s=="number"&&Number.isFinite(s)&&s>0&&(t+=s)}return t}function Iu(e2,t){return t<=0?e2?{profile:e2}:{}:{profile:{...e2??{},bytesMoved:t}}}async function Og(e2,t,n={}){let r=Ln(e2,t);try{if(r.programs.length===0)return;if(typeof e2.runProgramSequence=="function")await e2.runProgramSequence(r.programs,n);else for(let s of r.programs)await e2.runProgram(s,n)}finally{r.cleanup()}}function Ln(e2,t,n={}){let r=n.scratchResources,s=r===void 0,a=r===void 0?zg(e2,t):Hg(t,r),o=[],i=[],u=false,l=()=>{if(u)return;u=true;let c;for(let d of o)try{d()}catch(p){c??=p}if(s)try{Eu(a)}catch(d){c??=d}if(c!==void 0)throw c};try{for(let c=0;c<t.program.passes.length;++c){let d=t.program.passes[c],p=t.plan.passes[c],f=`${t.program.op} (variant ${t.program.variant}, pass ${d.id})`,g=Fg(t,d.bindingSpecs,p.uniforms,a);if($g(d,g))continue;Gu(f,d.bindings,A=>g[A.name]);let m=Xi(e2,d.bindings,g,{labelPrefix:d.name});o.push(m.cleanup),i.push({name:d.name,source:d.source,entryPoint:d.entryPoint,cacheKey:`webgpu:${t.program.key}:pass=${d.pipelineCacheId}`,bindings:m.bindings,dispatchWorkgroups:p.dispatchWorkgroups,...d.submitAfter?{submitAfter:true}:{},...Iu(d.profile,Bu(m.bindings))})}return{programs:i,cleanup:l}}catch(c){try{l()}catch(d){throw new AggregateError([c,d],"WebGPU plan materialization and cleanup both failed")}throw c}}function Tu(e2,t){Gu(`${e2.name} (program ${e2.programKey}, pass ${e2.id})`,e2.bindingSpecs,r=>fa(r,t));let n=e2.bindingSpecs.map((r,s)=>Wg(e2,r,t,s));return{name:e2.name,source:e2.source,entryPoint:e2.entryPoint,cacheKey:e2.cacheKey,bindings:n,dispatchWorkgroups:e2.dispatchWorkgroups,...e2.submitAfter?{submitAfter:true}:{},...Iu(e2.profile,Bu(n))}}function Wg(e2,t,n,r){let s=fa(t,n);if(s==null)throw new Error(`Missing resource for compute pass descriptor template binding ${t.name}`);let a=t.binding??r;if(t.buffer.type==="uniform"){if(!sa(s))throw new Error(`Compute pass descriptor template ${e2.name} requires caller-owned uniform buffer for ${t.name}`);return{buffer:s,type:"uniform",binding:a,...t.group?{group:t.group}:{}}}let o=s,i=typeof o.byteOffset=="number"?o.byteOffset:0,u=typeof o.byteLength=="number"?o.byteLength:void 0;return{tensor:s,type:t.buffer.type,binding:a,...t.group?{group:t.group}:{},...i?{offset:i}:{},...u!==void 0?{size:u}:{}}}function fa(e2,t){return t[e2.arg??""]??t[e2.name]}function zg(e2,t){let n={};if(t.plan.scratches.length===0)return n;if(typeof e2.empty!="function")throw new Error("WebGPU multi-pass plan requires a runtime with empty(dtype, shape)");try{for(let r of t.plan.scratches)n[r.id]=e2.empty(r.dtype,r.shape,`webgpu-scratch-${r.id}`)}catch(r){try{Eu(n)}catch(s){throw new AggregateError([r,s],"WebGPU scratch allocation and cleanup both failed")}throw r}return n}function Hg(e2,t){let n={};for(let r of e2.plan.scratches){let s=t[r.id];if(s==null)throw new Error(`Missing caller-owned WebGPU scratch resource ${r.id}`);let a=s;if(a.dtype!==r.dtype||!Ug(a.shape,r.shape)){let o=Array.isArray(a.shape)?`[${a.shape.join(",")}]`:String(a.shape);throw new Error(`Caller-owned WebGPU scratch ${r.id} must be ${r.dtype}[${r.shape.join(",")}], got ${String(a.dtype)}${o}`)}n[r.id]=s}return n}function Ug(e2,t){return Array.isArray(e2)&&e2.length===t.length&&e2.every((n,r)=>n===t[r])}function Eu(e2){let t;for(let n of Object.values(e2))if(typeof n.destroy=="function")try{n.destroy()}catch(r){t??=r}if(t!==void 0)throw t}function Fg(e2,t,n,r){let s={};for(let a of t){if(a.buffer.type==="uniform"){let o=Su(e2,a,r);s[a.name]=o??n[a.name];continue}s[a.name]=Su(e2,a,r)}return s}function Su(e2,t,n){return n[t.name]??n[t.semantic??""]??fa(t,e2.request.resources)}function Gu(e2,t,n){let r=null;for(let s of t){let a=Zg(s);if(a===null)continue;let o=pa(n(s));if(o===null)continue;r===null&&(r=new Map);let i=r.get(o.buffer);if(i===void 0){r.set(o.buffer,{name:s.name,access:a,view:o});continue}if(i.access==="read"&&a==="read")continue;if(i.access==="read_write"&&a==="read_write"){if(!Ng(i.view.offset,i.view.end,o.offset,o.end))continue;throw new Error(`${e2}: storage bindings "${i.name}" and "${s.name}" alias overlapping writable ranges of the same GPU buffer; overlapping storage aliases are unsafe when either binding is writable`)}let[u,l]=a==="read_write"?[i.name,s.name]:[s.name,i.name];throw new Error(`${e2}: storage aliasing hazard — binding "${u}" (read-only-storage) and binding "${l}" (storage, read_write) resolve to the same GPU buffer. WebGPU usage scopes cover the whole buffer, so this poisons the entire command buffer and corrupts downstream results. Bind it once as storage (read_write) for intentional in-place, or use distinct buffers.`)}}function Zg(e2){if("buffer"in e2&&e2.buffer!==void 0)switch(e2.buffer.type){case"read-only-storage":return"read";case"storage":return"read_write";default:return null}let t=e2;return t.kind==="storage"?t.access:null}function $g(e2,t){let n=e2.viewAlias;if(n===void 0)return false;for(let{input:r,output:s}of n){let a=pa(t[r]),o=pa(t[s]);if(a===null||o===null||!(a.buffer===o.buffer&&a.offset===o.offset&&a.end===o.end)||a.dtype!==o.dtype)return false}return true}function pa(e2){if(e2===null||typeof e2!="object")return null;let t=e2,n=t.buffer??e2;if(n===null||typeof n!="object"&&typeof n!="function")return null;let r=typeof t.byteOffset=="number"?t.byteOffset:0,s=typeof t.byteLength=="number"?t.byteLength:typeof t.size=="number"?t.size:Number.POSITIVE_INFINITY,a=typeof t.dtype=="string"?t.dtype:void 0;return{buffer:n,offset:r,end:r+s,dtype:a}}function Ng(e2,t,n,r){return e2<r&&n<t}var ma=P(()=>{"use strict";xn()});function jg(e2,t){let n=0,r=0;for(let s of e2.passes){let a=0,o=0;for(let i of s.bindings){let u=i.buffer?.type;u&&(i.optional&&i.arg&&!t?.[i.arg]||(u==="uniform"?o+=1:a+=1))}n=Math.max(n,a),r=Math.max(r,o)}return{storage:n,uniform:r}}function Vg(e2,t,n){let{storage:r,uniform:s}=jg(e2,n),a=t.limits.maxStorageBuffersPerShaderStage;if(typeof a=="number"&&r>a)return`needs ${r} storage buffers per shader stage, device allows ${a} (maxStorageBuffersPerShaderStage)`;let o=t.limits.maxUniformBuffersPerShaderStage;return typeof o=="number"&&s>o?`needs ${s} uniform buffers per shader stage, device allows ${o} (maxUniformBuffersPerShaderStage)`:null}function Yg(e2,t){let n=[];for(let r of Object.keys(e2).sort()){let s=e2[r];s!==void 0&&(xr(s)?n.push(`${r}:[${s.shape.join(",")}]:${s.dtype}`):n.push(`${r}=${String(s)}`))}return n.push(`a:${JSON.stringify(t.args??{})}`),n.push(`t:${JSON.stringify(t.attrs??{})}`),n.join("|")}function Xg(e2,t,n,r,s,a){return Object.freeze({id:e2.id,name:e2.name,source:e2.source,entryPoint:e2.entryPoint,cacheKey:n,bindings:e2.bindings,bindingSpecs:e2.bindingSpecs,dispatchWorkgroups:t.dispatchWorkgroups,uniforms:t.uniforms,...e2.profile?{profile:e2.profile}:{},...e2.submitAfter?{submitAfter:true}:{},programKey:r,planKey:s,passIndex:a})}function Aa(e2,t,n,r){let s=Qr(e2);if(r.has(s))throw new Error(`Circular WebGPU template include: ${[...r,s].join(" -> ")}`);r.add(s);let a=t.replace(Jg,(o,i)=>{let u=eA(s,i);return Aa(u,n(u),n,r)});return r.delete(s),a}function eA(e2,t){if(t.startsWith(".")){let n=e2.slice(0,Math.max(0,e2.lastIndexOf("/")));return Qr(`${n}/${t}`)}return Qr(t)}function Qr(e2){let t=[];for(let n of e2.replaceAll("\\","/").split("/"))if(!(n===""||n===".")){if(n===".."){if(t.length===0)throw new Error(`WebGPU template path escapes package root: ${e2}`);t.pop();continue}t.push(n)}return t.join("/")}function tA(e2,t,n){if(t.kind==="tensor"){if(!tt(n))throw new Error(`WebGPU arg ${e2} must be a GPU tensor`);if(t.dtype&&n.dtype!==t.dtype)throw new Error(`WebGPU arg ${e2} dtype ${n.dtype} does not match ${t.dtype}`);return}if(t.kind==="string"){if(typeof n!="string")throw new Error(`WebGPU arg ${e2} must be a string`);if(t.oneOf&&!t.oneOf.includes(n))throw new Error(`WebGPU arg ${e2} must be one of ${t.oneOf.join(", ")}`);return}if(t.kind==="bool"){if(typeof n!="boolean")throw new Error(`WebGPU arg ${e2} must be a boolean`);return}if(typeof n!="number"||!Number.isFinite(n))throw new Error(`WebGPU arg ${e2} must be a finite number`);if(t.kind==="u32"&&(!Number.isInteger(n)||n<0||n>4294967295))throw new Error(`WebGPU arg ${e2} must be a u32`);if(t.kind==="i32"&&(!Number.isInteger(n)||n<-2147483648||n>2147483647))throw new Error(`WebGPU arg ${e2} must be an i32`)}function nA(e2){return typeof e2.readText=="function"?e2:Rt(e2)}function rA(e2,t){return sA(`WebGPU op ${e2.program.op}`,e2.program.passes,t)}function sA(e2,t,n){if(n===void 0){if(t.length!==1)throw new Error(`${e2} has ${t.length} passes; select a pass by id or index`);return 0}if(typeof n=="number"){if(!Number.isInteger(n)||n<0||n>=t.length)throw new Error(`${e2} has no pass index ${n}`);return n}let r=t.findIndex(s=>s.id===n);if(r<0)throw new Error(`${e2} has no pass ${n}`);return r}function aA(e2,t){if(!Du(e2))throw new Error(`${t} must be a JSON object`);return ga(e2,t)}function ga(e2,t){if(e2===null)return null;if(typeof e2=="boolean"||typeof e2=="string")return e2;if(typeof e2=="number"){if(!Number.isFinite(e2))throw new Error(`${t} number must be finite`);return e2}if(Array.isArray(e2))return Object.freeze(e2.map((n,r)=>ga(n,`${t}[${r}]`)));if(Du(e2)){let n={};for(let[r,s]of Object.entries(e2)){if(s===void 0)throw new Error(`${t}.${r} must be JSON; got undefined`);n[r]=ga(s,`${t}.${r}`)}return Object.freeze(n)}throw new Error(`${t} must be JSON-compatible`)}function Du(e2){if(e2===null||typeof e2!="object"||Array.isArray(e2))return false;let t=Object.getPrototypeOf(e2);return t===Object.prototype||t===null}function oA(e2,t){if(e2&&typeof e2=="object"){let n=Qu.get(e2);return n===void 0&&(n=Ct(vt(t)),Qu.set(e2,n)),n}return Ct(vt(t))}function iA(e2,t,n){return Ct({v:n??null,d:oA(e2,t.device),...ca(t),args:t.args,shapes:t.shapes,present:t.present,source:t.sourceContext})}function xr(e2){return e2!==null&&typeof e2=="object"&&typeof e2.dtype=="string"&&Array.isArray(e2.shape)}function lA(e2){let t=e2.shape.reduce((n,r)=>n*r,1);return{dtype:e2.dtype,shape:e2.shape,size:t,byteLength:t*4,buffer:{},runtime:null}}var qn,Jg,Qu,uA,Rn=P(()=>{"use strict";xn();Le();gu();Tn();Dn();Br();hu();ku();Cu();qn=class{manifest;assets;programCache;planCache;prepareCache=new Map;inferCache=new Map;scopeNamesByArg;acceptedArgKeys;acceptedResourceKeys;constructor(t,n={}){this.manifest=la(t),this.assets=nA(n.assets??{}),this.programCache=n.programCache??new Tr,this.planCache=n.planCache??new Er,this.scopeNamesByArg=iu(this.manifest.args),this.acceptedArgKeys=new Set(Object.keys(this.manifest.args));let r=new Set(this.acceptedArgKeys);for(let s of this.manifest.variants)for(let a of s.passes)for(let o of a.bindings)r.add(o.name),o.arg&&r.add(o.arg);this.acceptedResourceKeys=r}get prepareCacheSize(){return this.prepareCache.size}explain(t,n,r={}){let s=Me(t.device),a=this.applyManifestDerive(this.buildBaseScope(s,n)),o=this.variantCandidates(r.variant).map(i=>{let u=this.checkVariant(i,a);return{id:i.id,ok:u.ok,...!u.ok&&u.reason?{reason:u.reason}:{}}});return{op:this.manifest.id,selected:o.find(i=>i.ok)?.id??null,candidates:o}}prepare(t,n,r={}){this.validateRequest(n);let s=Me(t.device),a=this.buildBaseScope(s,n),o=iA(t.device,a,r.variant),i=this.prepareCache.get(o);if(i)return{program:i.program,plan:i.plan,request:n};let u=this.applyManifestDerive(a),{variant:l,scope:c}=this.selectVariantAndScope(u,n,r.variant),d=wu(l,c),p=pu(this.manifest,l,c,this.programSpecialization(l,c,d)),f=this.programCache.getOrCreate(p,()=>this.buildProgram(p,l,c,d)),g=fu(c),m=mu(p,g),A=this.planCache.getOrCreate(m,()=>this.buildPlan(m,p,g,l,c,d));return this.prepareCache.set(o,{program:f,plan:A}),{program:f,plan:A,request:n}}clearPreparedState(){this.prepareCache.clear(),this.programCache.clear(),this.planCache.clear()}inferOutputs(t,n={}){let r=Yg(t,n),s=this.inferCache.get(r);if(s)return s;this.rejectUnknownKeys(this.manifest.id,"binding",t,n.args);let a=new Map;for(let[c,d]of Object.entries(this.manifest.args))d.kind==="tensor"&&(d.role==="output"||d.role==="inout")&&d.semantic&&a.set(d.semantic,c);for(let c of this.manifest.outputs){if(c.shape!==void 0||c.optional)continue;let d=a.get(c.role)??c.role,p=t[d];if(p===void 0||!xr(p))throw new Error(`${this.manifest.id}: output "${c.role}" has no shape expression — add outputs[].shape to ops/${this.manifest.id}/manifest.json, or pass "${d}" as an explicit destination.`)}let o={};for(let[c,d]of Object.entries(t))d!==void 0&&(o[c]=xr(d)?lA(d):d);let i={resources:o,...n.args?{args:n.args}:{},...n.attrs?{attrs:n.attrs}:{}},u=this.applyManifestDerive(this.buildBaseScope(Me(void 0),i)),l={};for(let c of this.manifest.outputs){let d=a.get(c.role)??c.role;if(c.shape===void 0){let f=t[d];if(f!==void 0&&xr(f)){l[d]={role:c.role,shape:[...f.shape],dtype:this.resolveOutputDtype(c,u)};continue}if(c.optional)continue;throw new Error(`${this.manifest.id}: output "${c.role}" has no shape expression — add outputs[].shape to ops/${this.manifest.id}/manifest.json, or pass "${d}" as an explicit destination.`)}let p=typeof c.shape=="string"?$e(c.shape,u):c.shape.map(f=>At(f,u));if(!Array.isArray(p)||!p.every(f=>Number.isInteger(f)&&f>=0))throw new Error(`${this.manifest.id}: output "${c.role}" shape evaluated to ${JSON.stringify(p)} (expected non-negative integers)`);l[d]={role:c.role,shape:p,dtype:this.resolveOutputDtype(c,u)}}return this.inferCache.set(r,l),l}resolveOutputDtype(t,n){if(!t.dtype)return"float32";if(uA.has(t.dtype))return t.dtype;let r=n.dtypes[t.dtype];if(typeof r=="string")return Xt(r);let s=this.manifest.typeConstraints[t.dtype],a=n.tensorDtypes;for(let o of this.manifest.inputs){let i=a[o.role];if(typeof i=="string"&&(!Array.isArray(s)||s.includes(i)))return i}throw new Error(`${this.manifest.id}: output "${t.role}" dtype "${t.dtype}" is a constraint var with no bound input — pass a dtype override or bind an input sharing the var.`)}async run(t,n,r={}){let s=this.prepare(t,n,r),{executeWebGpuPlan:a}=await Promise.resolve().then(()=>(ma(),xu));return await a(t,s,r.runOptions??{}),s}prepareComputePassDescriptorTemplate(t,n,r={}){let s=this.prepare(t,n,r),a=rA(s,r.pass),o=s.program.passes[a],i=s.plan.passes[a];if(!o||!i)throw new Error(`WebGPU op ${s.program.op} produced no compute pass descriptor template at index ${a}`);return Xg(o,i,`webgpu:${s.program.key}:pass=${o.pipelineCacheId}`,s.program.key,s.plan.key,a)}buildProgram(t,n,r,s){let a=new Map,o=s.map(i=>this.buildProgramPass(n,i,r,a));return Object.freeze({key:t,op:this.manifest.id,variant:n.id,variantVersion:n.version,passes:Object.freeze(o)})}buildProgramPass(t,n,r,s){let a=n.pass,o={...r,repeat:n.repeat},i=this.passConstants(t,a,o),u={...o,variant:t,pass:a,constants:i},l=Yt(uu(a.bindings)),c=[Yi(l),ra(l,i)].filter(Boolean).join(`
`),d=this.passSourceInputs(a.source,u),p={...u,sourceContext:d},f=this.buildTemplateSource(t,a,p,c),g=n.pipelineBaseId;if(n.repeated){let A=s.get(n.pipelineBaseId);A===void 0&&(A=new Map,s.set(n.pipelineBaseId,A));let w=A.get(f);w!==void 0?(f=w.source,g=w.pipelineCacheId):(g=`${n.pipelineBaseId}|source=${A.size}`,A.set(f,{source:f,pipelineCacheId:g}))}let m=ht(a.profile,p);return Object.freeze({id:n.id,pipelineCacheId:g,name:a.name??`${this.manifest.id}.${t.id}.${a.id}`,source:f,entryPoint:a.entryPoint,bindings:l,bindingSpecs:a.bindings,...Object.keys(m).length>0?{profile:m}:{},...a.submitAfter?{submitAfter:true}:{},...a.viewAlias?{viewAlias:a.viewAlias}:{},reads:a.reads,writes:a.writes})}buildTemplateSource(t,n,r,s){let a=Aa(n.source.shader,this.assets.readText(n.source.shader),u=>this.assets.readText(u),new Set),o=ia(a,{...r,env:{device:oa(r.device),wgsl:{resourceDeclarations:s}}}),i=vu(o,r.device.features);if(i.length>0)throw new Error(`WebGPU op ${this.manifest.id} variant ${t.id} pass ${n.id} rendered WGSL enable directives the device does not support: ${i.join(", ")}. Gate the directive in the template (env.device.features) or declare the feature in the variant's requires.requiredFeatures.`);return o}programSpecialization(t,n,r){return da(t.passSequence)?{variant:ht(t.constants,{...n,variant:t}),passes:r.map(s=>{let a=s.pass,o={...n,repeat:s.repeat};return{id:s.id,pipelineBaseId:s.pipelineBaseId,constants:ht(a.constants,{...o,variant:t,pass:a}),source:this.passSourceSpecialization(t,a,o),...a.submitAfter?{submitAfter:true}:{}}})}:{variant:ht(t.constants,{...n,variant:t}),passes:t.passes.map(s=>({id:s.id,constants:ht(s.constants,{...n,variant:t,pass:s}),source:this.passSourceSpecialization(t,s,n),...s.submitAfter?{submitAfter:true}:{}}))}}passSourceSpecialization(t,n,r){let s=this.passConstants(t,n,r),a={...r,variant:t,pass:n,constants:s};return{kind:"template",shader:n.source.shader,sourceVersion:n.source.version??1,inputs:this.passSourceInputs(n.source,a)}}buildPlan(t,n,r,s,a,o){let i=this.allOutputsEmpty(a),u=o.map(d=>d.pass),l=Au(s.intermediates,u,a,i),c=o.map(d=>this.buildPlanPass(s,d,a,i));return Object.freeze({key:t,programKey:n,shapeKey:r,scratches:l,passes:Object.freeze(c)})}allOutputsEmpty(t){let n=0;for(let[r,s]of Object.entries(this.manifest.args)){if(s.role!=="output"&&s.role!=="inout")continue;let a=t.resources[r];if(!tt(a)||(n+=1,a.shape.reduce((o,i)=>o*i,1)!==0))return false}return n>0}buildPlanPass(t,n,r,s){let a=n.pass,o={...r,repeat:n.repeat},i=this.passConstants(t,a,o);if(s)return Object.freeze({id:n.id,dispatchWorkgroups:[0,0,0],uniforms:this.zeroFilledUniforms(a)});let u={...o,variant:t,pass:a,constants:i},l={...u,sourceContext:this.passSourceInputs(a.source,u)},c=a.bindings.filter(d=>d.buffer.type==="uniform").reduce((d,p)=>(d[p.name]=this.uniformValues(p,a.uniforms[p.name],l),d),{});return Object.freeze({id:n.id,dispatchWorkgroups:this.passDispatchWorkgroups(a,l),uniforms:c})}zeroFilledUniforms(t){let n={};for(let r of t.bindings)r.buffer.type!=="uniform"||!r.struct||(n[r.name]=Object.fromEntries(r.struct.fields.map(s=>[s.name,0])));return n}passDispatchWorkgroups(t,n){let r=n.device.limits.maxComputeWorkgroupsPerDimension;return[$e(t.dispatch.x,n),$e(t.dispatch.y??1,n),$e(t.dispatch.z??1,n)].map((s,a)=>{if(!Number.isInteger(s)||Number(s)<0)throw new Error(`WebGPU pass ${t.id} dispatch axis ${a} must resolve to a nonnegative integer, got ${String(s)}`);if(Number(s)>r)throw new Error(`WebGPU pass ${t.id} dispatch axis ${a} = ${s} exceeds maxComputeWorkgroupsPerDimension (${r}); clamp the dispatch (min(..., ${r})) and grid-stride over the remainder, or fold into 2D/3D.`);return Number(s)})}uniformValues(t,n,r){let s=t.struct;if(!s)throw new Error(`WebGPU uniform binding ${t.name} requires struct`);let a={};for(let o of s.fields){let i=n?.[o.name]??o.value??r.args[o.name]??o.default;if(i===void 0)continue;let u=$e(i,r),l=o.type==="f32";if(typeof u!="number"||Number.isNaN(u)||!Number.isFinite(u)&&!l)throw new Error(`WebGPU uniform ${t.name}.${o.name} must resolve to a finite number`);a[o.name]=u}return a}passConstants(t,n,r){return{...r.dtypes,...ht(t.constants,{...r,variant:t,pass:n}),...ht(n.constants,{...r,variant:t,pass:n})}}passSourceInputs(t,n){return aA(ht(t.inputs,n),`WebGPU template source ${t.shader} inputs`)}selectVariantAndScope(t,n,r){let s=this.selectVariant(t,r),a=this.applyVariantDerive(t,n,s);return{variant:s,scope:a}}selectVariant(t,n){let r=[];for(let s of this.variantCandidates(n)){let a=this.checkVariant(s,t);if(a.ok)return s;r.push(`${s.id}: ${a.reason}`)}throw new Error(`No supported WebGPU variant for ${this.manifest.id}; rejected ${r.join("; ")}`)}variantCandidates(t){if(t!==void 0){let r=this.manifest.variants.find(s=>s.id===t);if(!r)throw new Error(`WebGPU op ${this.manifest.id} has no variant ${t}`);return[r]}return[...this.manifest.variants].sort((r,s)=>r.default!==s.default?r.default?-1:1:s.priority-r.priority)}checkVariant(t,n){let r=js(t.requires,n.device);if(r)return{ok:false,reason:r};let s=Vg(t,n.device,n.present);if(s)return{ok:false,reason:s};let a={...n,variant:t},o=Array.isArray(t.when)?t.when:[t.when],i=o.length>1;for(let u of o){let l;try{l=$e(u,a)}catch(c){return{ok:false,reason:`when eval error in \`${typeof u=="string"?u:String(u)}\`: ${c.message}`}}if(l!==true){let c=typeof u=="string"?u:String(u);return{ok:false,reason:i?`when clause failed: \`${c}\` → ${String(l)}`:`when guard resolved to ${String(l)}`}}}if(t.selectAbove!==null){let u;try{u=$e(t.selectAbove,a)}catch(l){return{ok:false,reason:`selectAbove eval error in \`${t.selectAbove}\`: ${l.message}`}}if(u!==true)return{ok:false,reason:`below perf floor: \`${t.selectAbove}\` → ${String(u)}`}}return{ok:true}}buildBaseScope(t,n){let r={...n.resources},s={...this.manifest.attributes,...n.attrs??{}},a={...n.args??{}},o={...n.sourceContext??{}};for(let[f,g]of Object.entries(r))!tt(g)&&typeof g!="object"&&(a[f]=g);let i=Object.fromEntries(Object.keys({...this.manifest.args,...r}).map(f=>[f,r[f]!==void 0&&r[f]!==null])),u={},l={},c={},d={};for(let f of this.scopeNamesByArg.keys()){let g=r[f];if(tt(g))for(let m of this.scopeNamesByArg.get(f))u[m]=g.shape,l[m]=g.shape.length,c[m]=g.dtype}for(let f of[...this.manifest.inputs,...this.manifest.outputs]){if(!f.dtype)continue;let g=c[f.role];g!==void 0&&(d[f.dtype]=aa(g))}return this.validateInputDtypes(c),{op:this.manifest,device:t,attrs:s,args:a,sourceContext:o,resources:r,present:i,shapes:u,ranks:l,tensorDtypes:c,dtypes:d,derived:{},tunables:{...this.manifest.tunables,...n.tunables??{}},constants:{},repeat:{}}}validateInputDtypes(t){for(let n of this.manifest.inputs){let r=n.dtype;if(!r)continue;let s=t[n.role];if(s===void 0)continue;let a=this.manifest.typeConstraints[r];if(Array.isArray(a)&&a.length>0&&!a.includes(s))throw new Error(`${this.manifest.id}: input "${n.role}" has dtype ${s}, not allowed by type constraint ${r} = [${a.join(", ")}]`)}}applyManifestDerive(t){let n={};for(let[r,s]of Object.entries(this.manifest.derive))n[r]=At(s,{...t,derived:n});return{...t,derived:n}}applyVariantDerive(t,n,r){let s={...t,variant:r,tunables:{...this.manifest.tunables,...r.tunables,...n.tunables??{}}},a={...t.derived};for(let[o,i]of Object.entries(r.derive))a[o]=At(i,{...s,derived:a});return{...s,derived:a}}rejectUnknownKeys(t,n,r,s){for(let a of Object.keys(r))if(!this.acceptedResourceKeys.has(a))throw new Error(`${t}: unknown ${n} "${a}" — not a declared arg or binding name (known: ${[...this.acceptedResourceKeys].sort().join(", ")})`);for(let a of Object.keys(s??{}))if(!this.acceptedArgKeys.has(a))throw new Error(`${t}: unknown arg "${a}" — not declared in manifest.args (known: ${[...this.acceptedArgKeys].sort().join(", ")})`)}validateRequest(t){this.rejectUnknownKeys(`WebGPU op ${this.manifest.id}`,"resource",t.resources,t.args);for(let[n,r]of Object.entries(this.manifest.args)){let s=t.resources[n]??t.args?.[n];if(s==null){if(r.required!==false)throw new Error(`WebGPU op ${this.manifest.id} missing required arg ${n}`);continue}tA(n,r,s)}}};Jg=/{%\s*include\s+["']([^"']+)["']\s*%}/g;Qu=new WeakMap;uA=new Set(Object.keys(et))});var Pu,Lu,qu=P(()=>{Pu=new Map([["ops/_shared/llama-decode-q1-proj.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const OUTPUT_SIZE: u32 = {{ outputSize }}u;
const INPUT_SIZE_Q1_WORDS: u32 = {{ inputSizeQ1Words }}u;
const BLOCKS_PER_ROW: u32 = {{ blocksPerRow }}u;
const WEIGHT_OFFSET: u32 = {{ weightOffset }}u;
const WG: u32 = {{ q1WorkgroupSize }}u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, WG>;
var<workgroup> partials1: array<f32, WG>;
var<workgroup> partials2: array<f32, WG>;
var<workgroup> partials3: array<f32, WG>;

{% include "ops/_shared/q1-dot-helpers.wgsl.jinja" %}

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) subgroup_lane: u32,
  @builtin(subgroup_size) subgroup_size: u32
{%- endif %}
) {
  let output_base = wid.x * TILE_ROWS;
  let lid = lid3.x;
  if (output_base >= OUTPUT_SIZE) {
    return;
  }

  let tile = output_base / TILE_ROWS;
  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  for (var word_index = lid; word_index < INPUT_SIZE_Q1_WORDS; word_index = word_index + WG) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let activation_base = word_index * 8u;
{%- if activationVec4 == "vec4<f32>" %}
    let v0 = activation[activation_base];
    let v1 = activation[activation_base + 1u];
    let v2 = activation[activation_base + 2u];
    let v3 = activation[activation_base + 3u];
    let v4 = activation[activation_base + 4u];
    let v5 = activation[activation_base + 5u];
    let v6 = activation[activation_base + 6u];
    let v7 = activation[activation_base + 7u];
{%- else %}
    let v0 = vec4<f32>(activation[activation_base]);
    let v1 = vec4<f32>(activation[activation_base + 1u]);
    let v2 = vec4<f32>(activation[activation_base + 2u]);
    let v3 = vec4<f32>(activation[activation_base + 3u]);
    let v4 = vec4<f32>(activation[activation_base + 4u]);
    let v5 = vec4<f32>(activation[activation_base + 5u]);
    let v6 = vec4<f32>(activation[activation_base + 6u]);
    let v7 = vec4<f32>(activation[activation_base + 7u]);
{%- endif %}
    let dot4 = q1_dot_word_t4(
      WEIGHT_OFFSET, tile, BLOCKS_PER_ROW, col_block, word_id,
      v0, v1, v2, v3, v4, v5, v6, v7
    );
    acc0 = acc0 + dot4.x;
    acc1 = acc1 + dot4.y;
    acc2 = acc2 + dot4.z;
    acc3 = acc3 + dot4.w;
  }
{%- if useSubgroups %}
  let subgroup_sum0 = subgroupAdd(acc0);
  let subgroup_sum1 = subgroupAdd(acc1);
  let subgroup_sum2 = subgroupAdd(acc2);
  let subgroup_sum3 = subgroupAdd(acc3);
  if (WG == subgroup_size) {
    if (lid == 0u) {
      partials0[0] = subgroup_sum0;
      partials1[0] = subgroup_sum1;
      partials2[0] = subgroup_sum2;
      partials3[0] = subgroup_sum3;
    }
    workgroupBarrier();
  } else {
    if (subgroup_lane == 0u) {
      let subgroup_index = lid / subgroup_size;
      partials0[subgroup_index] = subgroup_sum0;
      partials1[subgroup_index] = subgroup_sum1;
      partials2[subgroup_index] = subgroup_sum2;
      partials3[subgroup_index] = subgroup_sum3;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total0 = 0.0;
      var total1 = 0.0;
      var total2 = 0.0;
      var total3 = 0.0;
      let subgroup_count = WG / subgroup_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total0 = total0 + partials0[i];
        total1 = total1 + partials1[i];
        total2 = total2 + partials2[i];
        total3 = total3 + partials3[i];
      }
      partials0[0] = total0;
      partials1[0] = total1;
      partials2[0] = total2;
      partials3[0] = total3;
    }
    workgroupBarrier();
  }
{%- else %}
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials2[lid] = acc2;
  partials3[lid] = acc3;
  workgroupBarrier();

  var stride = WG / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials2[lid] = partials2[lid] + partials2[lid + stride];
      partials3[lid] = partials3[lid] + partials3[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid == 0u) {
    hidden[output_base] = hidden[output_base] + partials0[0];
    hidden[output_base + 1u] = hidden[output_base + 1u] + partials1[0];
    hidden[output_base + 2u] = hidden[output_base + 2u] + partials2[0];
    hidden[output_base + 3u] = hidden[output_base + 3u] + partials3[0];
  }
}
`],["ops/_shared/q1-dot-helpers.wgsl.jinja",`{% include "ops/_shared/q1-signs.wgsl.jinja" %}

fn q1_dot_word_t4(
  block_offset: u32,
  tile: u32,
  blocks_per_row: u32,
  col_block: u32,
  word_id: u32,
  a0: vec4<f32>,
  a1: vec4<f32>,
  a2: vec4<f32>,
  a3: vec4<f32>,
  a4: vec4<f32>,
  a5: vec4<f32>,
  a6: vec4<f32>,
  a7: vec4<f32>
) -> vec4<f32> {
  let group_idx = tile * blocks_per_row + col_block;
  let bit_vec = q1_bits[block_offset + group_idx * 4u + word_id];
{%- if scaleScalar == "f32" %}
  let s0 = q1_scales[block_offset + group_idx * 4u + 0u];
  let s1 = q1_scales[block_offset + group_idx * 4u + 1u];
  let s2 = q1_scales[block_offset + group_idx * 4u + 2u];
  let s3 = q1_scales[block_offset + group_idx * 4u + 3u];
{%- else %}
  let s0 = f32(q1_scales[block_offset + group_idx * 4u + 0u]);
  let s1 = f32(q1_scales[block_offset + group_idx * 4u + 1u]);
  let s2 = f32(q1_scales[block_offset + group_idx * 4u + 2u]);
  let s3 = f32(q1_scales[block_offset + group_idx * 4u + 3u]);
{%- endif %}
  let unscaled0 = dot(a0, q1_signs4_unit(bit_vec.x, 0u)) +
    dot(a1, q1_signs4_unit(bit_vec.x, 4u)) +
    dot(a2, q1_signs4_unit(bit_vec.x, 8u)) +
    dot(a3, q1_signs4_unit(bit_vec.x, 12u)) +
    dot(a4, q1_signs4_unit(bit_vec.x, 16u)) +
    dot(a5, q1_signs4_unit(bit_vec.x, 20u)) +
    dot(a6, q1_signs4_unit(bit_vec.x, 24u)) +
    dot(a7, q1_signs4_unit(bit_vec.x, 28u));
  let unscaled1 = dot(a0, q1_signs4_unit(bit_vec.y, 0u)) +
    dot(a1, q1_signs4_unit(bit_vec.y, 4u)) +
    dot(a2, q1_signs4_unit(bit_vec.y, 8u)) +
    dot(a3, q1_signs4_unit(bit_vec.y, 12u)) +
    dot(a4, q1_signs4_unit(bit_vec.y, 16u)) +
    dot(a5, q1_signs4_unit(bit_vec.y, 20u)) +
    dot(a6, q1_signs4_unit(bit_vec.y, 24u)) +
    dot(a7, q1_signs4_unit(bit_vec.y, 28u));
  let unscaled2 = dot(a0, q1_signs4_unit(bit_vec.z, 0u)) +
    dot(a1, q1_signs4_unit(bit_vec.z, 4u)) +
    dot(a2, q1_signs4_unit(bit_vec.z, 8u)) +
    dot(a3, q1_signs4_unit(bit_vec.z, 12u)) +
    dot(a4, q1_signs4_unit(bit_vec.z, 16u)) +
    dot(a5, q1_signs4_unit(bit_vec.z, 20u)) +
    dot(a6, q1_signs4_unit(bit_vec.z, 24u)) +
    dot(a7, q1_signs4_unit(bit_vec.z, 28u));
  let unscaled3 = dot(a0, q1_signs4_unit(bit_vec.w, 0u)) +
    dot(a1, q1_signs4_unit(bit_vec.w, 4u)) +
    dot(a2, q1_signs4_unit(bit_vec.w, 8u)) +
    dot(a3, q1_signs4_unit(bit_vec.w, 12u)) +
    dot(a4, q1_signs4_unit(bit_vec.w, 16u)) +
    dot(a5, q1_signs4_unit(bit_vec.w, 20u)) +
    dot(a6, q1_signs4_unit(bit_vec.w, 24u)) +
    dot(a7, q1_signs4_unit(bit_vec.w, 28u));
  return vec4<f32>(s0 * unscaled0, s1 * unscaled1, s2 * unscaled2, s3 * unscaled3);
}
`],["ops/_shared/q1-signs.wgsl.jinja",`fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}
`],["ops/_shared/argmax-wg-tree.wgsl.jinja",`{% if argmaxTieLowId %}

{% endif %}
  best_values[lid] = best_value;
  best_indices[lid] = best_token;
  workgroupBarrier();

  var am_stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < am_stride) {
      let other_value = best_values[lid + am_stride];
      let other_index = best_indices[lid + am_stride];
{% if argmaxTieLowId %}
      if (other_value > best_values[lid] || (other_value == best_values[lid] && other_index < best_indices[lid])) {
{% else %}
      if (other_value > best_values[lid]) {
{% endif %}
        best_values[lid] = other_value;
        best_indices[lid] = other_index;
      }
    }
    workgroupBarrier();
    if (am_stride == 1u) {
      break;
    }
    am_stride = am_stride / 2u;
  }

  if (lid == 0u) {
    best_values_out[block] = best_values[0];
    best_ids_out[block] = best_indices[0];
  }
`],["ops/_shared/kv-cache-index.wgsl.jinja",`fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}
`],["ops/_shared/reduce-sum-wg.wgsl.jinja",`fn reduce_sum(value: f32, tid: u32) -> f32 {
  partial[tid] = value;
  workgroupBarrier();
  var stride = WG / 2u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (tid < stride) {
      partial[tid] = partial[tid] + partial[tid + stride];
    }
    stride = stride / 2u;
    workgroupBarrier();
  }
  return partial[0];
}`],["ops/_shared/binary-lut4-matmul.wgsl.jinja",`{%- if lutScalar == "f16" %}
enable f16;
{% endif -%}

{% set M_VECTOR_WIDTH = source.mVectorWidth if source.mVectorWidth is defined else 1 %}

{{ env.wgsl.resourceDeclarations }}

const IN_FEATURES: u32 = {{ inFeatures }}u;
const OUT_FEATURES: u32 = {{ outFeatures }}u;
const M_TILE: u32 = {{ tileM }}u;
const N_TILE: u32 = {{ tileN }}u;
const N_PER_THREAD: u32 = {{ nPerThread }}u;
const IN_FEATURES_V4: u32 = IN_FEATURES / 4u;
const NUM_GROUPS: u32 = IN_FEATURES / 128u;
const WG_SIZE: u32 = N_TILE / N_PER_THREAD;
const LUT_M_ROWS: u32 = M_TILE / {{ M_VECTOR_WIDTH }}u;
const LUT_ENTRIES: u32 = LUT_M_ROWS * 32u * 16u;
const LUT_NIBBLES: u32 = LUT_M_ROWS * 32u;
{%- if source.layout == "q1_row4" %}
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;
{%- endif %}

{%- if M_VECTOR_WIDTH == 4 %}

alias LutValue = vec4<{{ lutScalar }}>;
alias AccValue = vec4<f32>;
{%- else %}
alias LutValue = {{ lutScalar }};
alias AccValue = f32;
{%- endif %}
var<workgroup> lut: array<LutValue, LUT_ENTRIES>;
{% if not assumeBiasNegHalfScale %}
var<workgroup> sumA: array<AccValue, LUT_M_ROWS>;
{% endif %}

fn lutIndex(m_row: u32, nibble: u32, mask: u32) -> u32 {
  return (m_row * 32u + nibble) * 16u + mask;
}

{%- if source.layout == "q1_row4" %}

fn q1RowWord(vec_index: u32, row_lane: u32) -> u32 {
  return q1_bits[vec_index * 4u + row_lane];
}

fn q1Scale(index: u32) -> f32 {
{%- if scaleScalar == "f32" %}
  return q1_scales[index];
{%- else %}
  return f32(q1_scales[index]);
{%- endif %}
}
{%- endif %}

@compute @workgroup_size({{ workgroupSize }}, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(num_workgroups) nwg: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let tid = lid.x;
  let n_block = wg.x * N_TILE;

  let m_block = (wg.y + wg.z * nwg.y) * M_TILE;
{%- if source.layout == "q1_row4" and source.dynamicM is defined and source.dynamicM %}

  let active_m = min(real_len[0], params.m);
  if (m_block >= active_m) { return; }
{%- elif source.layout == "q1_row4" %}
  let active_m = params.m;
{%- else %}
  let active_m = params.M;
{%- endif %}
  let n_base = n_block + tid;

{% for nn in range(nPerThread) %}
  let n{{ nn }} = n_base + {{ nn }}u * WG_SIZE;
  let n{{ nn }}_valid = n{{ nn }} < OUT_FEATURES;
{% endfor %}

{% for nn in range(nPerThread) %}
{% for m in range(0, tileM, M_VECTOR_WIDTH) %}
  var acc{{ nn }}_{{ m }} = AccValue(0.0);
{% endfor %}
{% endfor %}

  for (var g = 0u; g < NUM_GROUPS; g = g + 1u) {
    for (var i = tid; i < LUT_NIBBLES; i = i + WG_SIZE) {
      let nibble = i & 31u;
      let m_local = i >> 5u;
{%- if M_VECTOR_WIDTH == 4 %}
      let m = m_block + m_local * 4u;
      var v0 = {{ aVec4 }}(0.0);
      var v1 = {{ aVec4 }}(0.0);
      var v2 = {{ aVec4 }}(0.0);
      var v3 = {{ aVec4 }}(0.0);
{%- if source.layout == "q1_row4" %}
      if (m < active_m) { v0 = a[m * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 1u < active_m) { v1 = a[(m + 1u) * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 2u < active_m) { v2 = a[(m + 2u) * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 3u < active_m) { v3 = a[(m + 3u) * IN_FEATURES_V4 + g * 32u + nibble]; }
{%- else %}
      if (m < params.M) { v0 = a[m * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 1u < params.M) { v1 = a[(m + 1u) * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 2u < params.M) { v2 = a[(m + 2u) * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 3u < params.M) { v3 = a[(m + 3u) * IN_FEATURES_V4 + g * 32u + nibble]; }
{%- endif %}
      let x = vec4<f32>(f32(v0.x), f32(v1.x), f32(v2.x), f32(v3.x));
      let yv = vec4<f32>(f32(v0.y), f32(v1.y), f32(v2.y), f32(v3.y));
      let z = vec4<f32>(f32(v0.z), f32(v1.z), f32(v2.z), f32(v3.z));
      let wv = vec4<f32>(f32(v0.w), f32(v1.w), f32(v2.w), f32(v3.w));
{%- else %}
      let m = m_block + m_local;
      var v = {{ aVec4 }}(0.0);
{%- if source.layout == "q1_row4" %}
      if (m < active_m) {
{%- else %}
      if (m < params.M) {
{%- endif %}
        v = a[m * IN_FEATURES_V4 + g * 32u + nibble];
      }
      let x = f32(v.x);
      let yv = f32(v.y);
      let z = f32(v.z);
      let wv = f32(v.w);
{%- endif %}
      let xy = x + yv;
      let xz = x + z;
      let yz = yv + z;
      let xyz = xy + z;
      let base = (m_local * 32u + nibble) * 16u;

{% if assumeBiasNegHalfScale %}

      let c = 0.5 * (x + yv + z + wv);
      lut[base] = LutValue(-c);
      lut[base + 1u] = LutValue(x - c);
      lut[base + 2u] = LutValue(yv - c);
      lut[base + 3u] = LutValue(xy - c);
      lut[base + 4u] = LutValue(z - c);
      lut[base + 5u] = LutValue(xz - c);
      lut[base + 6u] = LutValue(yz - c);
      lut[base + 7u] = LutValue(xyz - c);
      lut[base + 8u] = LutValue(wv - c);
      lut[base + 9u] = LutValue(x + wv - c);
      lut[base + 10u] = LutValue(yv + wv - c);
      lut[base + 11u] = LutValue(xy + wv - c);
      lut[base + 12u] = LutValue(z + wv - c);
      lut[base + 13u] = LutValue(xz + wv - c);
      lut[base + 14u] = LutValue(yz + wv - c);
      lut[base + 15u] = LutValue(xyz + wv - c);
{% else %}
      lut[base] = LutValue(0.0);
      lut[base + 1u] = LutValue(x);
      lut[base + 2u] = LutValue(yv);
      lut[base + 3u] = LutValue(xy);
      lut[base + 4u] = LutValue(z);
      lut[base + 5u] = LutValue(xz);
      lut[base + 6u] = LutValue(yz);
      lut[base + 7u] = LutValue(xyz);
      lut[base + 8u] = LutValue(wv);
      lut[base + 9u] = LutValue(x + wv);
      lut[base + 10u] = LutValue(yv + wv);
      lut[base + 11u] = LutValue(xy + wv);
      lut[base + 12u] = LutValue(z + wv);
      lut[base + 13u] = LutValue(xz + wv);
      lut[base + 14u] = LutValue(yz + wv);
      lut[base + 15u] = LutValue(xyz + wv);
{% endif %}
    }
    workgroupBarrier();

{% if not assumeBiasNegHalfScale %}
    for (var mi = tid; mi < LUT_M_ROWS; mi = mi + WG_SIZE) {
      var s = AccValue(0.0);
      for (var nibble = 0u; nibble < 32u; nibble = nibble + 1u) {
        s = s + AccValue(lut[lutIndex(mi, nibble, 15u)]);
      }
      sumA[mi] = s;
    }
    workgroupBarrier();
{% endif %}

{% for nn in range(nPerThread) %}
    if (n{{ nn }}_valid) {
{%- if source.layout == "q1_row4" %}
      let row_tile{{ nn }} = n{{ nn }} / 4u;
      let row_lane{{ nn }} = n{{ nn }} & 3u;
      let group_base{{ nn }} = params.block_offset + (row_tile{{ nn }} * NUM_GROUPS + g) * 4u;
      let p0{{ nn }} = q1RowWord(group_base{{ nn }}, row_lane{{ nn }});
      let p1{{ nn }} = q1RowWord(group_base{{ nn }} + 1u, row_lane{{ nn }});
      let p2{{ nn }} = q1RowWord(group_base{{ nn }} + 2u, row_lane{{ nn }});
      let p3{{ nn }} = q1RowWord(group_base{{ nn }} + 3u, row_lane{{ nn }});
      let scale{{ nn }} = 2.0 * q1Scale(group_base{{ nn }} + row_lane{{ nn }});
{%- else %}
      let packed{{ nn }} = bits_buf[n{{ nn }} * NUM_GROUPS + g];
      let p0{{ nn }} = packed{{ nn }}.x;
      let p1{{ nn }} = packed{{ nn }}.y;
      let p2{{ nn }} = packed{{ nn }}.z;
      let p3{{ nn }} = packed{{ nn }}.w;
      let sb{{ nn }} = (n{{ nn }} * NUM_GROUPS + g) * 2u;
{% if assumeBiasNegHalfScale %}
{% if scaleOnly %}
      let scale{{ nn }} = f32(scaleBias[n{{ nn }} * NUM_GROUPS + g]);
{% else %}
      let scale{{ nn }} = f32(scaleBias[sb{{ nn }}]);
{% endif %}
{% else %}
      let scale{{ nn }} = f32(scaleBias[sb{{ nn }}]);
      let bias{{ nn }} = f32(scaleBias[sb{{ nn }} + 1u]);
{% endif %}
{%- endif %}
{% for m in range(0, tileM, M_VECTOR_WIDTH) %}
      var qa{{ nn }}_{{ m }} = AccValue(0.0);
{% endfor %}
{% for w in range(4) %}
{% for b in range(4) %}
      {
        let byte{{ nn }}_{{ w }}_{{ b }} = (p{{ w }}{{ nn }} >> {{ b * 8 }}u) & 0xffu;
        let lo{{ nn }}_{{ w }}_{{ b }} = byte{{ nn }}_{{ w }}_{{ b }} & 0x0fu;
        let hi{{ nn }}_{{ w }}_{{ b }} = byte{{ nn }}_{{ w }}_{{ b }} >> 4u;
{% for m in range(0, tileM, M_VECTOR_WIDTH) %}
        qa{{ nn }}_{{ m }} = qa{{ nn }}_{{ m }}
          + AccValue(lut[lutIndex({{ m }}u / {{ M_VECTOR_WIDTH }}u, {{ w * 8 + b * 2 }}u, lo{{ nn }}_{{ w }}_{{ b }})])
          + AccValue(lut[lutIndex({{ m }}u / {{ M_VECTOR_WIDTH }}u, {{ w * 8 + b * 2 + 1 }}u, hi{{ nn }}_{{ w }}_{{ b }})]);
{% endfor %}
      }
{% endfor %}
{% endfor %}
{% for m in range(0, tileM, M_VECTOR_WIDTH) %}
{% if assumeBiasNegHalfScale %}
      acc{{ nn }}_{{ m }} = acc{{ nn }}_{{ m }} + scale{{ nn }} * qa{{ nn }}_{{ m }};
{% else %}
      acc{{ nn }}_{{ m }} = acc{{ nn }}_{{ m }} + scale{{ nn }} * qa{{ nn }}_{{ m }} + bias{{ nn }} * sumA[{{ m }}u / {{ M_VECTOR_WIDTH }}u];
{% endif %}
{% endfor %}
    }
{% endfor %}
    workgroupBarrier();
  }

{% for nn in range(nPerThread) %}
  if (n{{ nn }}_valid) {
{% if M_VECTOR_WIDTH == 4 %}
{% for m in range(0, tileM, 4) %}
{% for lane in range(4) %}
    {
      let mr = m_block + {{ m + lane }}u;
{%- if source.layout == "q1_row4" %}
      if (mr < active_m) {
        y[mr * OUT_STRIDE + DST_COL + n{{ nn }}] = {{ yScalar }}(acc{{ nn }}_{{ m }}[{{ lane }}u]);
      }
{%- else %}
      if (mr < params.M) {
        y[mr * OUT_FEATURES + n{{ nn }}] = {{ yScalar }}(acc{{ nn }}_{{ m }}[{{ lane }}u]);
      }
{%- endif %}
    }
{% endfor %}
{% endfor %}
{% else %}
{% for m in range(tileM) %}
    {
      let mr = m_block + {{ m }}u;
{%- if source.layout == "q1_row4" %}
      if (mr < active_m) {
        y[mr * OUT_STRIDE + DST_COL + n{{ nn }}] = {{ yScalar }}(acc{{ nn }}_{{ m }});
      }
{%- else %}
      if (mr < params.M) {
        y[mr * OUT_FEATURES + n{{ nn }}] = {{ yScalar }}(acc{{ nn }}_{{ m }});
      }
{%- endif %}
    }
{% endfor %}
{% endif %}
  }
{% endfor %}
}
`],["ops/_shared/prefill-matmul-q1-tiled.wgsl.jinja",`enable f16;

{{ env.wgsl.resourceDeclarations }}

const K: u32 = {{ inFeatures }}u;
const N: u32 = {{ outFeatures }}u;
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;
const BLOCK_OFFSET: u32 = {{ blockOffset }}u;
const BPR: u32 = K / 128u;
const K_V4: u32 = K / 4u;
const BM: u32 = {{ bm }}u;
const BN: u32 = 32u;
const BK_V4: u32 = 32u;
const N_TILE: u32 = {{ nTile }}u;
const WG: u32 = 128u;

var<workgroup> a_tile: array<vec4<f16>, {{ bm * 32 }}>;
var<workgroup> b_tile: array<vec4<f16>, 1024>;

{% include "ops/_shared/q1-signs.wgsl.jinja" %}

fn q1_scale(index: u32) -> f32 {
{%- if scaleScalar == "f32" %}
  return q1_scales[index];
{%- else %}
  return f32(q1_scales[index]);
{%- endif %}
}

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>,
  @builtin(num_workgroups) nwg: vec3<u32>
) {
  let tid = lid3.x;
  let m_local = tid / N_TILE;
  let n_local = tid - m_local * N_TILE;
  let n_tiles = (N + BN - 1u) / BN;
  let m_tiles = (params.m + BM - 1u) / BM;

  for (var tile_n = wid.x; tile_n < n_tiles; tile_n = tile_n + nwg.x) {
    let n_base = tile_n * BN;
    for (var tile_m = wid.y; tile_m < m_tiles; tile_m = tile_m + nwg.y) {
      let m_base = tile_m * BM;
      let m = m_base + m_local;
{% for nn in range(accs) %}
      var acc{{ nn }} = 0.0;
{% endfor %}

      for (var kb = 0u; kb < BPR; kb = kb + 1u) {
        let kv_base = kb * BK_V4;
        for (var i = tid; i < BM * BK_V4; i = i + WG) {
          let tm = i / BK_V4;
          let kv = i - tm * BK_V4;
          let gm = m_base + tm;
          if (gm < params.m) {
            a_tile[i] = vec4<f16>(a[gm * K_V4 + kv_base + kv]);
          } else {
            a_tile[i] = vec4<f16>(0.0h);
          }
        }

        for (var i = tid; i < BN * BK_V4; i = i + WG) {
          let tn = i / BK_V4;
          let kv = i - tn * BK_V4;
          let row = n_base + tn;
          var decoded = vec4<f32>(0.0);
          if (row < N) {
            let row_tile = row / 4u;
            let row_lane = row & 3u;
            let word_id = kv / 8u;
            let shift = (kv & 7u) * 4u;
            let group = row_tile * BPR + kb;
            let sign_word = q1_bits[(BLOCK_OFFSET + group * 4u + word_id) * 4u + row_lane];
            let scale_index = BLOCK_OFFSET + group * 4u + row_lane;
            decoded = q1_signs4_unit(sign_word, shift) * q1_scale(scale_index);
          }
          b_tile[i] = vec4<f16>(decoded);
        }
        workgroupBarrier();

        if (m < params.m) {
          for (var kv = 0u; kv < BK_V4; kv = kv + 1u) {
            let av = vec4<f32>(a_tile[m_local * BK_V4 + kv]);
{% for nn in range(accs) %}
            acc{{ nn }} += dot(av, vec4<f32>(b_tile[(n_local + {{ nn * nTile }}u) * BK_V4 + kv]));
{% endfor %}
          }
        }
        workgroupBarrier();
      }

      if (m < params.m) {
        let y_base = m * OUT_STRIDE + DST_COL + n_base + n_local;
{% for nn in range(accs) %}
        if (n_base + n_local + {{ nn * nTile }}u < N) { y[y_base + {{ nn * nTile }}u] = {{ yScalar }}(acc{{ nn }}); }
{% endfor %}
      }
    }
  }
}
`],["ops/_shared/attn-flash-decode-splitk-merge.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if splitQueries is not defined %}{% set splitQueries = false %}{% endif %}
{% if hasGate is not defined %}{% set hasGate = false %}{% endif %}
{{ env.wgsl.resourceDeclarations }}

{% if source.layout == "bhsd" %}

{% elif source.layout == "layer_cache" %}

{% else %}

{% endif %}
const HEAD_DIM_V4: u32 = {{ headDimV4 }}u;
const Q_HEADS: u32 = {{ qNumHeads }}u;
const NUM_SPLITS: u32 = {{ numSplits }}u;
{% if splitQueries %}
const Q_SEQ: u32 = {{ qSeq }}u;
{% endif %}
{% if source.layout == "bsh" %}
const Q_HIDDEN_V4: u32 = {{ qHiddenV4 }}u;
{% endif %}
{% if hasBias %}

const HEAD_DIM: u32 = {{ headDim }}u;
const Q_HIDDEN: u32 = {{ qHidden }}u;
{% endif %}
{% include "ops/_shared/softmax-stable-helpers.wgsl.jinja" %}

@compute @workgroup_size(HEAD_DIM_V4, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
{% if splitQueries %}
  let queryToken = wg.x;
{% endif %}
  let h = wg.y;
  let b = wg.z;
  let d4 = lid.x;
  if (h >= Q_HEADS || d4 >= HEAD_DIM_V4{% if splitQueries %} || queryToken >= Q_SEQ{% endif %}) {
    return;
  }

{% if splitQueries %}
  let mdBase = ((b * Q_SEQ + queryToken) * Q_HEADS + h) * NUM_SPLITS;
{% else %}
  let mdBase = (b * Q_HEADS + h) * NUM_SPLITS;
{% endif %}
  var globalMax = -FLT_MAX;
  for (var s: u32 = 0u; s < NUM_SPLITS; s = s + 1u) {
    globalMax = max(globalMax, partial_max[mdBase + s]);
  }
  var globalDenom = 0.0;
  var outV = vec4<f32>(0.0);
  for (var s: u32 = 0u; s < NUM_SPLITS; s = s + 1u) {
    let w = exp_shift(partial_max[mdBase + s], globalMax);
    globalDenom = globalDenom + partial_denom[mdBase + s] * w;
{% if splitQueries %}
    let pBase = (((b * Q_SEQ + queryToken) * Q_HEADS + h) * NUM_SPLITS + s) * HEAD_DIM_V4;
{% else %}
    let pBase = ((b * Q_HEADS + h) * NUM_SPLITS + s) * HEAD_DIM_V4;
{% endif %}
    outV = outV + partial_out[pBase + d4] * w;
  }

{% if source.layout == "bsh" %}
{% if splitQueries %}
  let qBaseV4 = (b * Q_SEQ + queryToken) * Q_HIDDEN_V4 + h * HEAD_DIM_V4;
{% else %}
  let qBaseV4 = b * Q_HIDDEN_V4 + h * HEAD_DIM_V4;
{% endif %}
{% elif source.layout == "layer_cache" %}
  let qBaseV4 = h * HEAD_DIM_V4;
{% else %}
  let qBaseV4 = (b * Q_HEADS + h) * HEAD_DIM_V4;
{% endif %}
  var outValue = outV / globalDenom;
{% if hasBias %}

  let vBiasBase = 2u * Q_HIDDEN + h * HEAD_DIM + d4 * 4u;
  outValue = outValue + vec4<f32>(bias[vBiasBase], bias[vBiasBase + 1u], bias[vBiasBase + 2u], bias[vBiasBase + 3u]);
{% endif %}
{% if hasGate %}

  let gateV = vec4<f32>(gate[qBaseV4 + d4]);
  outValue = outValue * (vec4<f32>(1.0) / (vec4<f32>(1.0) + exp(-gateV)));
{% endif %}
  output[qBaseV4 + d4] = vec4<{{ scalar }}>(outValue);
}
`],["ops/_shared/attn-flash-decode-splitk.wgsl.jinja",`{% if useSubgroups is not defined %}{% set useSubgroups = true %}{% endif %}
{% if splitQueries is not defined %}{% set splitQueries = false %}{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

{% if source.layout == "bhsd" %}

{% elif source.layout == "layer_cache" %}

{% else %}

{% endif %}
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_V4: u32 = {{ headDimV4 }}u;
const Q_HEADS: u32 = {{ qNumHeads }}u;
const KV_HEADS: u32 = {{ kvNumHeads }}u;
{% if source.layout == "bsh" %}
const Q_HIDDEN_V4: u32 = {{ qHiddenV4 }}u;
const KV_HIDDEN_V4: u32 = {{ kvHiddenV4 }}u;
{% elif source.layout == "layer_cache" %}
const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const ATTN_SCALE: f32 = {{ scale }};
{% endif %}
const WG: u32 = {{ tunables.WORKGROUP_SIZE }}u;
const NUM_SPLITS: u32 = {{ numSplits }}u;
{% if splitQueries %}
const Q_SEQ: u32 = {{ qSeq }}u;
{% endif %}

{% set coopQk = useSubgroups and headDimV4 >= 8 and not (usesF16 and headDimV4 <= 32) %}
{% set jGroups = (tunables.WORKGROUP_SIZE / headDimV4)|int %}
{% set jSplitV = (tunables.WORKGROUP_SIZE % headDimV4 == 0) and (jGroups >= 2) %}
{% include "ops/_shared/softmax-stable-helpers.wgsl.jinja" %}

var<workgroup> q_shared: array<vec4<f32>, HEAD_DIM_V4>;
var<workgroup> running_out: array<vec4<f32>, HEAD_DIM_V4>;
var<workgroup> probs: array<f32, WG>;
{% if coopQk %}
var<workgroup> sval_sh: array<f32, WG>;
{% endif %}
{% if jSplitV %}
var<workgroup> vacc_sh: array<vec4<f32>, WG>;
{% endif %}
{% set combineSubgroups = useSubgroups %}
{% include "ops/_shared/softmax-md-combine.wgsl.jinja" %}

fn scale_value() -> f32 {
{% if source.layout == "layer_cache" %}
  return ATTN_SCALE;
{% else %}
  if (params.scale != 0.0) { return params.scale; }
  return inverseSqrt(f32(HEAD_DIM));
{% endif %}
}

{% if hasBias %}

fn load_bias4(base: u32, d4: u32) -> vec4<f32> {
  let offset = base + d4 * 4u;
  return vec4<f32>(bias[offset], bias[offset + 1u], bias[offset + 2u], bias[offset + 3u]);
}
{% endif %}

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>{% if useSubgroups %},
  @builtin(subgroup_size) sgSize: u32{% endif %}
) {
{% if useSubgroups %}

  if (sgSize == 0u || sgSize > WG || WG % sgSize != 0u) { return; }
{% endif %}
{% if splitQueries %}
  let queryToken = wg.x / NUM_SPLITS;
  let split = wg.x % NUM_SPLITS;
{% else %}
  let split = wg.x;
{% endif %}
  let h = wg.y;
  let b = wg.z;
  if (h >= Q_HEADS || split >= NUM_SPLITS{% if splitQueries %} || queryToken >= Q_SEQ{% endif %}{% if source.layout == "layer_cache" %} || params.past_len >= CACHE_LEN{% endif %}) {
    return;
  }
  let tid = lid.x;
  let hKv = h / (Q_HEADS / KV_HEADS);
{% if source.layout == "layer_cache" %}
  let kvSeq = params.past_len + 1u;
{% else %}
  let kvSeq = params.kvSeq;
{% endif %}

{% if source.layout == "bsh" %}
{% if splitQueries %}
  let qBaseV4 = (b * Q_SEQ + queryToken) * Q_HIDDEN_V4 + h * HEAD_DIM_V4;
{% else %}
  let qBaseV4 = b * Q_HIDDEN_V4 + h * HEAD_DIM_V4;
{% endif %}
  let kvBaseV4 = b * kvSeq * KV_HIDDEN_V4 + hKv * HEAD_DIM_V4;
  let kvTokenStrideV4 = KV_HIDDEN_V4;
{% elif source.layout == "layer_cache" %}
  let qBaseV4 = h * HEAD_DIM_V4;
  let kvBaseV4 = (LAYER * CACHE_LEN * KV_HEADS + hKv) * HEAD_DIM_V4;
  let kvTokenStrideV4 = KV_HEADS * HEAD_DIM_V4;
{% else %}
  let qBaseV4 = (b * Q_HEADS + h) * HEAD_DIM_V4;
  let kvBaseV4 = (b * KV_HEADS + hKv) * kvSeq * HEAD_DIM_V4;
  let kvTokenStrideV4 = HEAD_DIM_V4;
{% endif %}

{% if hasWindow %}

  var windowStart: u32 = 0u;
  if (kvSeq > params.windowSize) {
    windowStart = kvSeq - params.windowSize;
  }
  let activeKeys = kvSeq - windowStart;
  let keysPerSplit = (activeKeys + NUM_SPLITS - 1u) / NUM_SPLITS;
  let splitStart = windowStart + split * keysPerSplit;
{% else %}
  let keysPerSplit = (kvSeq + NUM_SPLITS - 1u) / NUM_SPLITS;
  let splitStart = split * keysPerSplit;
{% endif %}
  var splitEnd = splitStart + keysPerSplit;
  if (splitEnd > kvSeq) {
    splitEnd = kvSeq;
  }

  for (var d4 = tid; d4 < HEAD_DIM_V4; d4 = d4 + WG) {
    var qv = vec4<f32>(query[qBaseV4 + d4]);
{% if hasBias %}
    qv = qv + load_bias4(h * HEAD_DIM, d4);
{% endif %}
    q_shared[d4] = qv;
    running_out[d4] = vec4<f32>(0.0);
  }
  workgroupBarrier();

  let scale = scale_value();
  var runningMax = -FLT_MAX;
  var runningDenom = 0.0;

  var kjBase = splitStart;
  loop {
    if (kjBase >= splitEnd) {
      break;
    }
    let kj = kjBase + tid;
    let keyAllowed = kj < splitEnd;
    let tileCount = min(WG, splitEnd - kjBase);

    var score = -FLT_MAX;
    var m = -FLT_MAX;
    var dPart = 0.0;
{% if coopQk %}

    let sgPerWg = WG / sgSize;
    let qkRounds = (tileCount + sgPerWg - 1u) / sgPerWg;
    let lane = tid % sgSize;
    let sgInWg = tid / sgSize;
    for (var rr: u32 = 0u; rr < qkRounds; rr = rr + 1u) {
      let j = rr * sgPerWg + sgInWg;
      var accS: f32 = 0.0;
      if (j < tileCount) {
        let kRowV4 = kvBaseV4 + (kjBase + j) * kvTokenStrideV4;
        for (var d4: u32 = lane; d4 < HEAD_DIM_V4; d4 = d4 + sgSize) {
          accS = accS + dot(q_shared[d4], vec4<f32>(key[kRowV4 + d4]));
        }
      }
      let sj = subgroupAdd(accS);
      if (lane == 0u && j < tileCount) {
        sval_sh[j] = sj;
      }
    }
    workgroupBarrier();
    if (keyAllowed) {
      score = sval_sh[tid] * scale;
      m = score;
      dPart = 1.0;
    }
{% else %}
    if (keyAllowed) {
      let kRowV4 = kvBaseV4 + kj * kvTokenStrideV4;
      var acc: f32 = 0.0;
      for (var d4: u32 = 0u; d4 < HEAD_DIM_V4; d4 = d4 + 1u) {
        acc = acc + dot(q_shared[d4], vec4<f32>(key[kRowV4 + d4]));
      }
      score = acc * scale;
      m = score;
      dPart = 1.0;
    }
{% endif %}
    let tile = combine_partials(m, dPart, tid{% if useSubgroups %}, sgSize{% endif %});

    let newMax = max(runningMax, tile.x);
    let correction = exp_shift(runningMax, newMax);
    runningDenom = runningDenom * correction + tile.y * exp_shift(tile.x, newMax);
    runningMax = newMax;

    var prob = 0.0;
    if (keyAllowed) {
      prob = exp_shift(score, newMax);
    }
    probs[tid] = prob;
    workgroupBarrier();

{% if jSplitV %}

    const J_GROUPS: u32 = {{ jGroups }}u;
    let jg = tid / HEAD_DIM_V4;
    let d4v = tid % HEAD_DIM_V4;
    var vacc = vec4<f32>(0.0);
    var jj = jg;
    loop {
      if (jj >= tileCount) { break; }
      vacc = vacc + probs[jj] * vec4<f32>(value[kvBaseV4 + (kjBase + jj) * kvTokenStrideV4 + d4v]);
      jj = jj + J_GROUPS;
    }
    vacc_sh[tid] = vacc;
    workgroupBarrier();
    for (var d4: u32 = tid; d4 < HEAD_DIM_V4; d4 = d4 + WG) {
      var a4 = running_out[d4] * correction;
      for (var g: u32 = 0u; g < J_GROUPS; g = g + 1u) {
        a4 = a4 + vacc_sh[g * HEAD_DIM_V4 + d4];
      }
      running_out[d4] = a4;
    }
    workgroupBarrier();
{% else %}
    for (var d4: u32 = tid; d4 < HEAD_DIM_V4; d4 = d4 + WG) {
      var vSum = vec4<f32>(0.0);
      for (var i: u32 = 0u; i < tileCount; i = i + 1u) {
        vSum = vSum + probs[i] * vec4<f32>(value[kvBaseV4 + (kjBase + i) * kvTokenStrideV4 + d4]);
      }
      running_out[d4] = running_out[d4] * correction + vSum;
    }
    workgroupBarrier();
{% endif %}

    kjBase = kjBase + WG;
  }

{% if splitQueries %}
  let partialBase = (((b * Q_SEQ + queryToken) * Q_HEADS + h) * NUM_SPLITS + split) * HEAD_DIM_V4;
{% else %}
  let partialBase = ((b * Q_HEADS + h) * NUM_SPLITS + split) * HEAD_DIM_V4;
{% endif %}
  for (var d4: u32 = tid; d4 < HEAD_DIM_V4; d4 = d4 + WG) {
    partial_out[partialBase + d4] = running_out[d4];
  }
  if (tid == 0u) {
{% if splitQueries %}
    let mdBase = ((b * Q_SEQ + queryToken) * Q_HEADS + h) * NUM_SPLITS + split;
{% else %}
    let mdBase = (b * Q_HEADS + h) * NUM_SPLITS + split;
{% endif %}
    partial_max[mdBase] = runningMax;
    partial_denom[mdBase] = runningDenom;
  }
}
`],["ops/_shared/softmax-md-combine.wgsl.jinja",`{% if combineSubgroups %}

var<workgroup> partialM: array<f32, WG>;
var<workgroup> partialD: array<f32, WG>;
var<workgroup> combinedMD: vec2<f32>;

fn combine_partials(m: f32, d: f32, lidx: u32, sgSize: u32) -> vec2<f32> {
  let sgM = subgroupMax(m);

  let sgD = subgroupAdd(d * exp_shift(m, sgM));
  if (sgSize == WG) {
    return vec2<f32>(sgM, sgD);
  }
  let subgroupCount = (WG + sgSize - 1u) / sgSize;

  if (lidx < subgroupCount) {
    partialM[lidx] = -FLT_MAX;
    partialD[lidx] = 0.0;
  }
  workgroupBarrier();
  if (subgroupElect()) {
    let slot = lidx / sgSize;
    partialM[slot] = sgM;
    partialD[slot] = sgD;
  }
  workgroupBarrier();
  if (lidx == 0u) {
    var accM = -FLT_MAX;
    var accD = 0.0;
    for (var i = 0u; i < subgroupCount; i = i + 1u) {
      let mNew = max(accM, partialM[i]);
      accD = accD * exp_shift(accM, mNew) + partialD[i] * exp_shift(partialM[i], mNew);
      accM = mNew;
    }
    combinedMD = vec2<f32>(accM, accD);
  }
  workgroupBarrier();
  return combinedMD;
}
{% else %}
var<workgroup> partialM: array<f32, WG>;
var<workgroup> partialD: array<f32, WG>;

fn combine_partials(m: f32, d: f32, lidx: u32) -> vec2<f32> {
  partialM[lidx] = m;
  partialD[lidx] = d;
  workgroupBarrier();
  var stride = WG / 2u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (lidx < stride) {
      let m1 = partialM[lidx];
      let d1 = partialD[lidx];
      let m2 = partialM[lidx + stride];
      let d2 = partialD[lidx + stride];
      let mNew = max(m1, m2);
      partialD[lidx] = d1 * exp_shift(m1, mNew) + d2 * exp_shift(m2, mNew);
      partialM[lidx] = mNew;
    }
    workgroupBarrier();
    stride = stride / 2u;
  }
  let merged = vec2<f32>(partialM[0], partialD[0]);

  workgroupBarrier();
  return merged;
}
{% endif %}
`],["ops/_shared/softmax-stable-helpers.wgsl.jinja",`const FLT_MAX: f32 = 3.4028234663852886e38;

fn is_finite_f32(value: f32) -> bool {
  return select(false, value <= FLT_MAX, value >= -FLT_MAX);
}

fn shifted_value(value: f32, maxValue: f32) -> f32 {
  let equalFiniteMax = select(false, value == maxValue, is_finite_f32(maxValue));
  return select(value - maxValue, 0.0, equalFiniteMax);
}

fn exp_shift(value: f32, maxValue: f32) -> f32 {
  return exp(shifted_value(value, maxValue));
}

fn is_nan_f32(value: f32) -> bool {
  let bits = bitcast<u32>(value);
  return (bits & 0x7f800000u) == 0x7f800000u && (bits & 0x007fffffu) != 0u;
}
`],["ops/_shared/linear-attention-common.wgsl.jinja",`{%- macro read_scalar(name, index, dtype) -%}
{%- if dtype == "float16" -%}
f32({{ name }}[{{ index }}]){%- else -%}{{ name }}[{{ index }}]{%- endif -%}
{%- endmacro -%}
{%- macro write_scalar(expr, dtype) -%}
{%- if dtype == "float16" -%}
f16({{ expr }}){%- else -%}{{ expr }}{%- endif -%}
{%- endmacro -%}

{%- macro emit_qwen35_stable_decay() %}
{% if stateF16 %}
fn qwen35_stable_decay(gate_value: f32) -> f32 {

  if (gate_value != gate_value) { return gate_value; }

  if (gate_value > 89.0) { return exp(gate_value); }
  if (gate_value < -104.0) { return 0.0; }

  let exponent_f = floor(fma(gate_value, 1.4426950408889634, 0.5));
  var remainder = fma(-exponent_f, 0.693145751953125, gate_value);
  remainder = fma(-exponent_f, 1.428606765330187e-6, remainder);

  var polynomial = 0.0000248015873015873;
  polynomial = fma(polynomial, remainder, 0.0001984126984126984);
  polynomial = fma(polynomial, remainder, 0.001388888888888889);
  polynomial = fma(polynomial, remainder, 0.008333333333333333);
  polynomial = fma(polynomial, remainder, 0.041666666666666664);
  polynomial = fma(polynomial, remainder, 0.16666666666666666);
  polynomial = fma(polynomial, remainder, 0.5);
  polynomial = fma(polynomial, remainder, 1.0);
  polynomial = fma(polynomial, remainder, 1.0);

  let exponent = i32(exponent_f);
  if (exponent > 127) {

    return (polynomial * 2.0) * bitcast<f32>(0x7f000000u);
  }
  if (exponent >= -126) {
    let scale = bitcast<f32>(u32(exponent + 127) << 23u);
    return polynomial * scale;
  }
  if (exponent >= -149) {

    let scale = bitcast<f32>(1u << u32(exponent + 149));
    return polynomial * scale;
  }
  return 0.0;
}
{% endif %}
{%- endmacro -%}

{%- macro qwen35_decay(expr) -%}
{%- if stateF16 -%}qwen35_stable_decay({{ expr }}){%- else -%}exp({{ expr }}){%- endif -%}
{%- endmacro -%}

{%- macro emit_qwen35_state_rounding() %}
{% if stateF16 %}
fn qwen35_round_state(x: f32) -> f32 {
  return unpack2x16float(pack2x16float(vec2<f32>(x, 0.0))).x;
}

fn qwen35_round_state4(x: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(
    unpack2x16float(pack2x16float(x.xy)),
    unpack2x16float(pack2x16float(x.zw)),
  );
}
{% endif %}
{%- endmacro -%}

{%- macro emit_tiled_setup() %}
  let head_dim_k = params.qPackedDim / params.qNumHeads;
  let head_dim_v = params.vPackedDim / params.kvNumHeads;
  let n_key_heads = params.kPackedDim / head_dim_k;
  let heads_per_group = params.qNumHeads / params.kvNumHeads;
  let kv_per_key_head = params.kvNumHeads / n_key_heads;
  let dv_tiles = (head_dim_v + TILE_V - 1u) / TILE_V;
  let scale = select(inverseSqrt(f32(head_dim_k)), params.scale, params.scale != 0.0);

  let workgroup_idx = wg.x + wg.y * nwg.x;
  let dv_tile_idx = workgroup_idx % dv_tiles;
  let bh = workgroup_idx / dv_tiles;
  let head_idx = bh % params.kvNumHeads;
  let batch_idx = bh / params.kvNumHeads;
  if (batch_idx >= params.batchSize) {
    return;
  }

  let dv_start = dv_tile_idx * TILE_V;
  let packed_out = params.qNumHeads * head_dim_v;
  let key_head_idx = head_idx / kv_per_key_head;
{%- endmacro -%}

{%- macro emit_serial_query_groups(first_group) %}
    for (var qg = {{ first_group }}u; qg < heads_per_group; qg = qg + 1u) {
      let q_head = head_idx * heads_per_group + qg;
      let q_base = bt * params.qPackedDim + q_head * HEAD_DIM_K;
      var q_out = 0.0;
      for (var d = 0u; d < HEAD_DIM_K; d = d + 1u) {
        q_out = q_out + state[d] * {{ read_scalar("query", "q_base + d", queryDtype) }};
      }
      let out_idx = bt * packed_out + q_head * head_dim_v + dv_idx;
      output[out_idx] = {{ write_scalar("q_out * scale", outputDtype) }};
    }
{%- endmacro -%}

{%- macro emit_qwen35_decode_header() %}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if stateF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KEY_HEADS: u32 = {{ numKeyHeads }}u;

const HEAD_DIM_K: u32 = {{ headDimK }}u;
const HEAD_DIM_V: u32 = {{ headDimV }}u;
const TILE_V: u32 = {{ tileV }}u;
const WG: u32 = {{ workgroupSize }}u;
{% endmacro -%}

{%- macro emit_decode_tile_setup() %}
  let head = wid.x / ((HEAD_DIM_V + TILE_V - 1u) / TILE_V);
  let tile = wid.x % ((HEAD_DIM_V + TILE_V - 1u) / TILE_V);
  let dv_start = tile * TILE_V;
  if (head >= NUM_HEADS) { return; }
{%- endmacro -%}

{%- macro emit_gather_function(name, value_type, buffer, has_base, zero) %}
fn {{ name }}({% if has_base %}base: u32{% endif %}) -> {{ value_type }} {
  var s0 = {{ zero }};
  var s1 = {{ zero }};
  var s2 = {{ zero }};
  var s3 = {{ zero }};
  var i = 0u;
  for (; i + 3u < WG; i = i + 4u) {
    s0 = s0 + {{ buffer }}[{% if has_base %}base + {% endif %}i];
    s1 = s1 + {{ buffer }}[{% if has_base %}base + {% endif %}i + 1u];
    s2 = s2 + {{ buffer }}[{% if has_base %}base + {% endif %}i + 2u];
    s3 = s3 + {{ buffer }}[{% if has_base %}base + {% endif %}i + 3u];
  }
  var total = (s0 + s1) + (s2 + s3);
  for (; i < WG; i = i + 1u) { total = total + {{ buffer }}[{% if has_base %}base + {% endif %}i]; }
  return total;
}
{%- endmacro -%}

{%- macro emit_pair_gather(explain) %}
    for (var j = tid; j < TILE_V; j = j + WG) {
{% if explain %}

{% endif %}
      var rp0 = vec2<f32>(0.0);
      var rp1 = vec2<f32>(0.0);
      var rp2 = vec2<f32>(0.0);
      var rp3 = vec2<f32>(0.0);
      var rp4 = vec2<f32>(0.0);
      var rp5 = vec2<f32>(0.0);
      var rp6 = vec2<f32>(0.0);
      var rp7 = vec2<f32>(0.0);
      var i = 0u;
      for (; i + 7u < WG; i = i + 8u) {
        let base = j * WG + i;
        rp0 = rp0 + red_rp[base + 0u];
        rp1 = rp1 + red_rp[base + 1u];
        rp2 = rp2 + red_rp[base + 2u];
        rp3 = rp3 + red_rp[base + 3u];
        rp4 = rp4 + red_rp[base + 4u];
        rp5 = rp5 + red_rp[base + 5u];
        rp6 = rp6 + red_rp[base + 6u];
        rp7 = rp7 + red_rp[base + 7u];
      }
      var rp_total = rp0 + rp1 + rp2 + rp3 + rp4 + rp5 + rp6 + rp7;
      for (; i < WG; i = i + 1u) {
        rp_total = rp_total + red_rp[j * WG + i];
      }
      red_rp[j * WG] = rp_total;
    }
{%- endmacro -%}

{%- macro emit_kq_gather() %}
      var kq0 = vec4<f32>(0.0);
      var kq1 = vec4<f32>(0.0);
      var kq2 = vec4<f32>(0.0);
      var kq3 = vec4<f32>(0.0);
      var i = 0u;
      for (; i + 15u < WG; i = i + 16u) {
        kq0 = kq0 + vec4<f32>(red_kq[i + 0u], red_kq[i + 1u], red_kq[i + 2u], red_kq[i + 3u]);
        kq1 = kq1 + vec4<f32>(red_kq[i + 4u], red_kq[i + 5u], red_kq[i + 6u], red_kq[i + 7u]);
        kq2 = kq2 + vec4<f32>(red_kq[i + 8u], red_kq[i + 9u], red_kq[i + 10u], red_kq[i + 11u]);
        kq3 = kq3 + vec4<f32>(red_kq[i + 12u], red_kq[i + 13u], red_kq[i + 14u], red_kq[i + 15u]);
      }
      var kq4 = kq0 + kq1 + kq2 + kq3;
      for (; i + 3u < WG; i = i + 4u) {
        kq4 = kq4 + vec4<f32>(red_kq[i + 0u], red_kq[i + 1u], red_kq[i + 2u], red_kq[i + 3u]);
      }
      var kq_total = dot(kq4, vec4<f32>(1.0));
      for (; i < WG; i = i + 1u) {
        kq_total = kq_total + red_kq[i];
      }
      red_kq[0] = kq_total;
{%- endmacro -%}
`],["ops/_shared/reduce-tree.wgsl.jinja",`{% macro wgsl_tree_reduce_f32(name, mode, buffer="partial", wg="WG", trailingBarrier=true) %}
fn {{ name }}(value: f32, tid: u32) -> f32 {
  {{ buffer }}[tid] = value;
  workgroupBarrier();

  var n: u32 = {{ wg }};
  loop {
    let half = (n + 1u) / 2u;
    if (tid < n - half) {
{% if mode == "max" %}
      {{ buffer }}[tid] = max({{ buffer }}[tid], {{ buffer }}[tid + half]);
{% else %}
      {{ buffer }}[tid] = {{ buffer }}[tid] + {{ buffer }}[tid + half];
{% endif %}
    }
    workgroupBarrier();
    n = half;
    if (n == 1u) {
      break;
    }
  }

  let reduced = {{ buffer }}[0];
{% if trailingBarrier %}
  workgroupBarrier();
{% endif %}
  return reduced;
}
{% endmacro %}
`]]),Lu=new Map([["com.xenova.AddInPlace",{manifest:{schemaVersion:1,domain:"com.xenova",name:"AddInPlace",sinceVersion:1,inputs:[{role:"Y",dtype:"Y"},{role:"X",dtype:"X"}],outputs:[{role:"Y",dtype:"Y",shape:"shapes.yT"}],typeConstraints:{Y:["float32","float16"],X:["float32","float16"]},args:{yT:{kind:"tensor",semantic:"Y",role:"inout"},xT:{kind:"tensor",semantic:"X",role:"input"},count:{kind:"u32",semantic:"kernel.count"}},tunables:{WORKGROUP_SIZE:64},variants:[{id:"scalar",when:["args.count >= 0","numel(shapes.yT) >= args.count","numel(shapes.xT) >= args.count","f16Ok(dtypes.Y)","f16Ok(dtypes.X)"],passes:[{id:"main",name:"AddInPlace",shader:"add-in-place.wgsl.jinja",bindings:[{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$Y"},{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$X"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"count",type:"u32",value:"args.count"},{name:"wgY",type:"u32",value:"min(ceil(args.count / tunables.WORKGROUP_SIZE), device.limits.maxComputeWorkgroupsPerDimension)"}]}}],dispatch:{threads:"args.count",workgroupSize:"tunables.WORKGROUP_SIZE"},reads:["Y","X"],writes:["Y"]}]}]},assets:[["add-in-place.wgsl.jinja",`{% if Y == "f16" or X == "f16" %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

const WG: u32 = {{ tunables.WORKGROUP_SIZE }}u;

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wg_idx = wg.x + wg.y * params.wgY;
  let i = wg_idx * WG + lid.x;
  if (i >= params.count) {
    return;
  }

  let yv = f32(y[i]);
  let xv = f32(x[i]);
  y[i] = {{ "f16(yv + xv)" if dtypes.Y == "f16" else "yv + xv" }};
}
`]]}],["com.xenova.LlamaDecodeBestArgmax",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeBestArgmax",sinceVersion:1,inputs:[{role:"BestValues",dtype:"float32",rank:1},{role:"BestIds",dtype:"uint32",rank:1}],outputs:[{role:"Output",dtype:"uint32",rank:1,shape:[1]}],args:{bestValuesT:{kind:"tensor",semantic:"BestValues",role:"input"},bestIdsT:{kind:"tensor",semantic:"BestIds",role:"input"},outputT:{kind:"tensor",semantic:"Output",role:"output"},outputOffset:{kind:"u32",semantic:"output_offset",required:false},workgroupSize:{kind:"u32",semantic:"workgroup_size"},inputCount:{kind:"u32",semantic:"input_count",required:false}},derive:{effInputCount:"args.inputCount if args.inputCount else args.workgroupSize"},variants:[{id:"reduce",priority:0,when:["ranks.bestValuesT == 1","ranks.bestIdsT == 1","ranks.outputT == 1",'tensorDtypes.bestValuesT == "float32"','tensorDtypes.bestIdsT == "uint32"','tensorDtypes.outputT == "uint32"',"args.workgroupSize > 0","args.workgroupSize <= 256","(args.workgroupSize == 1 or args.workgroupSize == 2 or args.workgroupSize == 4 or args.workgroupSize == 8 or args.workgroupSize == 16 or args.workgroupSize == 32 or args.workgroupSize == 64 or args.workgroupSize == 128 or args.workgroupSize == 256)","effInputCount > 0","effInputCount <= dim(shapes.bestValuesT, 0)","dim(shapes.bestIdsT, 0) >= effInputCount","dim(shapes.outputT, 0) > (args.outputOffset if args.outputOffset else 0)"],constants:{workgroupSize:"args.workgroupSize",inputCount:"effInputCount",outputOffset:"args.outputOffset if args.outputOffset else 0",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeBestArgmax",shader:"decode-best-argmax.wgsl.jinja",bindings:[{name:"best_values_in",arg:"bestValuesT",semantic:"BestValues",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"best_ids_in",arg:"bestIdsT",semantic:"BestIds",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"output",arg:"outputT",semantic:"Output",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1},reads:["BestValues","BestIds"],writes:["Output"]}]}]},assets:[["decode-best-argmax.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
const INPUT_COUNT: u32 = {{ inputCount }}u;
const OUTPUT_OFFSET: u32 = {{ outputOffset }}u;

var<workgroup> best_values: array<f32, {{ workgroupSize }}>;
var<workgroup> best_indices: array<u32, {{ workgroupSize }}>;

@compute @workgroup_size({{ workgroupSize }})
fn main(@builtin(local_invocation_id) lid3: vec3<u32>) {
  let lid = lid3.x;
  var value = {{ f32Min }};
  var index = 0u;
  for (var input = lid; input < INPUT_COUNT; input = input + WORKGROUP_SIZE) {
    let candidate = best_values_in[input];
    if (candidate > value) {
      value = candidate;
      index = best_ids_in[input];
    }
  }
  best_values[lid] = value;
  best_indices[lid] = index;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      let other_value = best_values[lid + stride];
      let other_index = best_indices[lid + stride];
      if (other_value > best_values[lid]) {
        best_values[lid] = other_value;
        best_indices[lid] = other_index;
      }
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  if (lid == 0u) {
    output[OUTPUT_OFFSET] = best_indices[0];
  }
}
`]]}],["com.xenova.LlamaDecodeDownProj",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeDownProj",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1,optional:true},{role:"Intermediate",dtype:"I",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1,optional:true},{role:"Q4Scales",dtype:"S",rank:1,optional:true},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],tunables:{OUTPUTS_PER_WG:2,DENSE_WORKGROUP_SIZE:64,Q1_WORKGROUP_SIZE:64},typeConstraints:{W:["float32","float16"],I:["float32","float16"],S:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights",required:false},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},downOffset:{kind:"u32",semantic:"down_proj_offset"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights",required:false},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights",required:false},format:{kind:"string",semantic:"packed_quant_format",required:false,oneOf:["q4_0","q4_k","q8_0","iq","lut32","lut16","q2k","q6k"]},actRelu2:{kind:"u32",semantic:"activation_relu_squared",required:false},lut:{kind:"u32",semantic:"dequant_lut_id",required:false},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false}},bindingSets:{dense:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"activation",arg:"intermediateT",semantic:"Intermediate",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationVec4"}],q1:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"activation",arg:"intermediateT",semantic:"Intermediate",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationVec4"}],q4:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"input",buffer:{type:"read-only-storage"},elementType:"$intermediateVec4"}]},derive:{fmt:'args.format if args.format else "q4_0"',quantBits:'8 if (fmt == "q8_0" or fmt == "iq") else 4',hasMin:'1 if fmt == "q4_k" else 0',iq:'1 if fmt == "iq" else 0',lut16:'1 if fmt == "lut16" else 0',q2k:'1 if fmt == "q2k" else 0',q6k:'1 if fmt == "q6k" else 0',portableMr4Preferred:'not device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and has(device.adapterInfo, "subgroupMaxSize") and device.adapterInfo.subgroupMinSize < device.adapterInfo.subgroupMaxSize and device.adapterInfo.subgroupMaxSize <= 32',deviceWorkgroupCap:"min(device.limits.maxComputeInvocationsPerWorkgroup, device.limits.maxComputeWorkgroupSizeX)",denseWorkgroupLimit:"min(tunables.DENSE_WORKGROUP_SIZE, deviceWorkgroupCap)",denseWorkgroupSize:"max(1, pow2ceil(denseWorkgroupLimit + 1) / 2)",denseWorkgroupBytes:"denseWorkgroupSize * tunables.OUTPUTS_PER_WG * 4",denseDeviceOk:"tunables.OUTPUTS_PER_WG >= 1 and tunables.OUTPUTS_PER_WG <= denseWorkgroupSize and denseWorkgroupBytes <= device.limits.maxComputeWorkgroupStorageSize",q1WorkgroupLimit:"min(tunables.Q1_WORKGROUP_SIZE, deviceWorkgroupCap)",q1WorkgroupSize:"max(1, pow2ceil(q1WorkgroupLimit + 1) / 2)",q1WorkgroupBytes:"q1WorkgroupSize * 4 * 4",q1DeviceOk:"q1WorkgroupBytes <= device.limits.maxComputeWorkgroupStorageSize"},variants:[{id:"q1",priority:0,when:["present.q1BitsT","q1DeviceOk","ranks.hiddenT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.intermediateT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.q1ScalesT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.intermediateSize > 0","args.intermediateSize % 128 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.q1BitsT, 0) >= (args.downOffset + args.hiddenSize * (args.intermediateSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.downOffset + args.hiddenSize * (args.intermediateSize / 128)"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16" or tensorDtypes.intermediateT == "float16"',useSubgroups:'device.features.has("subgroups")',activationVec4:'"vec4<f16>" if tensorDtypes.intermediateT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",outputSize:"args.hiddenSize",inputSizeQ1Words:"args.intermediateSize / 32",blocksPerRow:"args.intermediateSize / 128",weightOffset:"args.downOffset",q1WorkgroupSize:"q1WorkgroupSize"},passes:[{id:"main",name:"LlamaDecodeDownProjQ1",shader:"ops/_shared/llama-decode-q1-proj.wgsl.jinja",bindings:"q1",dispatch:{x:"ceil(args.hiddenSize / 4)"},reads:["Hidden","Q1Bits","Q1Scales","Intermediate"],writes:["Hidden"]}]}]},assets:[]}],["com.xenova.LlamaDecodeGateUp",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeGateUp",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Weights",dtype:"W",rank:1,optional:true},{role:"Q4Bits",dtype:"uint32",rank:1,optional:true},{role:"Q4Scales",dtype:"S",rank:1,optional:true},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"Intermediate",dtype:"I",rank:1,shape:["args.intermediateSize"]}],typeConstraints:{N:["float32","float16"],W:["float32","float16"],I:["float32","float16"],S:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights",required:false},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},gateOffset:{kind:"u32",semantic:"gate_proj_offset"},upOffset:{kind:"u32",semantic:"up_proj_offset"},activation:{kind:"string",semantic:"activation",required:false,oneOf:["silu","fast_silu"]},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights",required:false},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights",required:false},format:{kind:"string",semantic:"packed_quant_format",required:false,oneOf:["q4_0","q4_k","q8_0","iq","lut32","lut16"]},lut:{kind:"u32",semantic:"dequant_lut_id",required:false},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false}},derive:{fmt:'args.format if args.format else "q4_0"',quantBits:'8 if (fmt == "q8_0" or fmt == "iq") else 4',hasMin:'1 if fmt == "q4_k" else 0',iq:'1 if fmt == "iq" else 0',lut16:'1 if fmt == "lut16" else 0'},variants:[{id:"q1",priority:0,when:["present.q1BitsT","ranks.normedT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.intermediateT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.normedT != "float16" and tensorDtypes.q1ScalesT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.intermediateSize > 0","args.intermediateSize % 4 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.q1BitsT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 128), args.upOffset + args.intermediateSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 128), args.upOffset + args.intermediateSize * (args.hiddenSize / 128))"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.q1ScalesT == "float16" or tensorDtypes.intermediateT == "float16"',useSubgroups:'device.features.has("subgroups")',fastSilu:'args.activation == "fast_silu"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",intermediateScalar:"dtypes.I",hiddenSizeQ1Words:"args.hiddenSize / 32",blocksPerRow:"args.hiddenSize / 128",intermediateSize:"args.intermediateSize",gateOffset:"args.gateOffset",upOffset:"args.upOffset"},passes:[{id:"main",name:"LlamaDecodeGateUpQ1",source:{kind:"template",shader:"decode-gate-up-q1.wgsl.jinja",version:2,inputs:{optimized:true}},bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"output",buffer:{type:"storage"},elementType:"$intermediateScalar"}],dispatch:{x:"ceil(args.intermediateSize / 4)"},reads:["Normed","Q1Bits","Q1Scales"],writes:["Intermediate"]}]}]},assets:[["decode-gate-up-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE_Q1_WORDS: u32 = {{ hiddenSizeQ1Words }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const INTERMEDIATE_SIZE: u32 = {{ intermediateSize }}u;
const W_GATE_Q1: u32 = {{ gateOffset }}u;
const W_UP_Q1: u32 = {{ upOffset }}u;
const WORKGROUP_SIZE: u32 = 64u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials_gate: array<vec4<f32>, 64>;
var<workgroup> partials_up: array<vec4<f32>, 64>;

fn silu(x: f32) -> f32 {
{%- if fastSilu %}
  let sigmoid = 0.5 + 0.5 * x / (1.0 + abs(x));
  return x * sigmoid;
{%- else %}
  return x / (1.0 + exp(-x));
{%- endif %}
}

{% include "ops/_shared/q1-dot-helpers.wgsl.jinja" %}

@compute @workgroup_size(64)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let j0 = wid.x * TILE_ROWS;
  let lid = lid3.x;
  if (j0 >= INTERMEDIATE_SIZE) {
    return;
  }

  let tile = j0 / TILE_ROWS;
  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  var acc_u0 = 0.0;
  var acc_u1 = 0.0;
  var acc_u2 = 0.0;
  var acc_u3 = 0.0;
  for (var word_index = lid; word_index < HIDDEN_SIZE_Q1_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
{%- if normedVec4 == "vec4<f32>" %}
    let n0 = normed[base4];
    let n1 = normed[base4 + 1u];
    let n2 = normed[base4 + 2u];
    let n3 = normed[base4 + 3u];
    let n4 = normed[base4 + 4u];
    let n5 = normed[base4 + 5u];
    let n6 = normed[base4 + 6u];
    let n7 = normed[base4 + 7u];
{%- else %}
    let n0 = vec4<f32>(normed[base4]);
    let n1 = vec4<f32>(normed[base4 + 1u]);
    let n2 = vec4<f32>(normed[base4 + 2u]);
    let n3 = vec4<f32>(normed[base4 + 3u]);
    let n4 = vec4<f32>(normed[base4 + 4u]);
    let n5 = vec4<f32>(normed[base4 + 5u]);
    let n6 = vec4<f32>(normed[base4 + 6u]);
    let n7 = vec4<f32>(normed[base4 + 7u]);
{%- endif %}
    let gate4 = q1_dot_word_t4(W_GATE_Q1, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
    let up4 = q1_dot_word_t4(W_UP_Q1, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
    acc0 += gate4.x;
    acc1 += gate4.y;
    acc2 += gate4.z;
    acc3 += gate4.w;
    acc_u0 += up4.x;
    acc_u1 += up4.y;
    acc_u2 += up4.z;
    acc_u3 += up4.w;
  }
{%- if useSubgroups %}

  let subgroup_gate = subgroupAdd(vec4<f32>(acc0, acc1, acc2, acc3));
  let subgroup_up = subgroupAdd(vec4<f32>(acc_u0, acc_u1, acc_u2, acc_u3));
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials_gate[0] = subgroup_gate;
      partials_up[0] = subgroup_up;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      let subgroup_index = lid / sg_size;
      partials_gate[subgroup_index] = subgroup_gate;
      partials_up[subgroup_index] = subgroup_up;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total_gate = vec4<f32>(0.0);
      var total_up = vec4<f32>(0.0);
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total_gate += partials_gate[i];
        total_up += partials_up[i];
      }
      partials_gate[0] = total_gate;
      partials_up[0] = total_up;
    }
    workgroupBarrier();
  }
{%- else %}
  partials_gate[lid] = vec4<f32>(acc0, acc1, acc2, acc3);
  partials_up[lid] = vec4<f32>(acc_u0, acc_u1, acc_u2, acc_u3);
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials_gate[lid] += partials_gate[lid + stride];
      partials_up[lid] += partials_up[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid == 0u) {
    let gate = partials_gate[0];
    let up = partials_up[0];
{%- if intermediateScalar == "f32" %}
    intermediate[j0 + 0u] = silu(gate.x) * up.x;
    intermediate[j0 + 1u] = silu(gate.y) * up.y;
    intermediate[j0 + 2u] = silu(gate.z) * up.z;
    intermediate[j0 + 3u] = silu(gate.w) * up.w;
{%- else %}
    intermediate[j0 + 0u] = {{ intermediateScalar }}(silu(gate.x) * up.x);
    intermediate[j0 + 1u] = {{ intermediateScalar }}(silu(gate.y) * up.y);
    intermediate[j0 + 2u] = {{ intermediateScalar }}(silu(gate.z) * up.z);
    intermediate[j0 + 3u] = {{ intermediateScalar }}(silu(gate.w) * up.w);
{%- endif %}
  }
}
`]]}],["com.xenova.LlamaDecodeLmHeadQ1ArgmaxTiled",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeLmHeadQ1ArgmaxTiled",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1}],outputs:[{role:"BestValues",dtype:"float32",rank:1,shape:["args.numBlocks"]},{role:"BestIds",dtype:"uint32",rank:1,shape:["args.numBlocks"]}],typeConstraints:{N:["float32","float16"],S:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},bestValuesT:{kind:"tensor",semantic:"BestValues",role:"output"},bestIdsT:{kind:"tensor",semantic:"BestIds",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},lmHeadOffset:{kind:"u32",semantic:"lm_head_q1_block_offset"},numBlocks:{kind:"u32",semantic:"num_blocks",required:false},colMajor:{kind:"u32",semantic:"block_col_major_pack",required:false}},tunables:{COL_MAJOR:-1},variants:[{id:"q1",priority:0,when:["ranks.normedT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.bestValuesT == 1","ranks.bestIdsT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','tensorDtypes.bestValuesT == "float32"','tensorDtypes.bestIdsT == "uint32"',"f16Ok(dtypes.N) and f16Ok(dtypes.S)","args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.vocabSize > 0","(not args.numBlocks or args.numBlocks > 0)","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.bestValuesT, 0) >= (args.numBlocks if args.numBlocks else 256)","dim(shapes.bestIdsT, 0) >= (args.numBlocks if args.numBlocks else 256)","dim(shapes.q1BitsT, 0) >= (args.lmHeadOffset + args.vocabSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.lmHeadOffset + args.vocabSize * (args.hiddenSize / 128)"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.q1ScalesT == "float16"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",hiddenSizeBlocks:"args.hiddenSize / 128",vocabSize:"args.vocabSize",lmHeadOffset:"args.lmHeadOffset",numBlocks:"args.numBlocks if args.numBlocks else 256",colMajor:"1 if (tunables.COL_MAJOR if tunables.COL_MAJOR >= 0 else args.colMajor) else 0",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeLmHeadQ1ArgmaxTiled",source:{kind:"template",shader:"decode-lm-head-q1-argmax-tiled.wgsl.jinja",version:2,inputs:{optimized:true}},bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"best_values_out",arg:"bestValuesT",semantic:"BestValues",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"best_ids_out",arg:"bestIdsT",semantic:"BestIds",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:"args.numBlocks if args.numBlocks else 256"},reads:["Normed","Q1Bits","Q1Scales"],writes:["BestValues","BestIds"]}]}]},assets:[["decode-lm-head-q1-argmax-tiled.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const HIDDEN_SIZE_BLOCKS: u32 = {{ hiddenSizeBlocks }}u;
const W_LM_HEAD_Q1: u32 = {{ lmHeadOffset }}u;
const WORKGROUP_SIZE: u32 = 256u;
const NUM_BLOCKS: u32 = {{ numBlocks }}u;
const F32_MIN: f32 = {{ f32Min }};

var<workgroup> best_values: array<f32, 256>;
var<workgroup> best_indices: array<u32, 256>;
var<workgroup> shared_acts: array<vec4<f32>, {{ hiddenSizeVec4 }}>;

fn q1_scale(block: u32) -> f32 {
  return f32(q1_scales[block]);
}

{% include "ops/_shared/q1-signs.wgsl.jinja" %}

fn load_normed(value: {{ normedVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let block = wid.x;
  let lid = lid3.x;

  for (var i = lid; i < HIDDEN_SIZE_VEC4; i = i + WORKGROUP_SIZE) {
    shared_acts[i] = load_normed(normed[i]);
  }
  workgroupBarrier();

  var best_token = 0u;
  var best_value = F32_MIN;
  for (var vocab = block * WORKGROUP_SIZE + lid; vocab < VOCAB_SIZE; vocab = vocab + WORKGROUP_SIZE * NUM_BLOCKS) {
    var acc = 0.0;
    let row_block_base = W_LM_HEAD_Q1 + vocab * HIDDEN_SIZE_BLOCKS;
    for (var cb = 0u; cb < HIDDEN_SIZE_BLOCKS; cb = cb + 1u) {
      let block_idx = {% if colMajor %}W_LM_HEAD_Q1 + cb * VOCAB_SIZE + vocab{% else %}row_block_base + cb{% endif %};
      let bw = q1_bits[block_idx];
      let s = q1_scale(block_idx);
      let act_base = cb * 32u;
      let unscaled =
        dot(shared_acts[act_base + 0u],  q1_signs4_unit(bw.x, 0u))  +
        dot(shared_acts[act_base + 1u],  q1_signs4_unit(bw.x, 4u))  +
        dot(shared_acts[act_base + 2u],  q1_signs4_unit(bw.x, 8u))  +
        dot(shared_acts[act_base + 3u],  q1_signs4_unit(bw.x, 12u)) +
        dot(shared_acts[act_base + 4u],  q1_signs4_unit(bw.x, 16u)) +
        dot(shared_acts[act_base + 5u],  q1_signs4_unit(bw.x, 20u)) +
        dot(shared_acts[act_base + 6u],  q1_signs4_unit(bw.x, 24u)) +
        dot(shared_acts[act_base + 7u],  q1_signs4_unit(bw.x, 28u)) +
        dot(shared_acts[act_base + 8u],  q1_signs4_unit(bw.y, 0u))  +
        dot(shared_acts[act_base + 9u],  q1_signs4_unit(bw.y, 4u))  +
        dot(shared_acts[act_base + 10u], q1_signs4_unit(bw.y, 8u))  +
        dot(shared_acts[act_base + 11u], q1_signs4_unit(bw.y, 12u)) +
        dot(shared_acts[act_base + 12u], q1_signs4_unit(bw.y, 16u)) +
        dot(shared_acts[act_base + 13u], q1_signs4_unit(bw.y, 20u)) +
        dot(shared_acts[act_base + 14u], q1_signs4_unit(bw.y, 24u)) +
        dot(shared_acts[act_base + 15u], q1_signs4_unit(bw.y, 28u)) +
        dot(shared_acts[act_base + 16u], q1_signs4_unit(bw.z, 0u))  +
        dot(shared_acts[act_base + 17u], q1_signs4_unit(bw.z, 4u))  +
        dot(shared_acts[act_base + 18u], q1_signs4_unit(bw.z, 8u))  +
        dot(shared_acts[act_base + 19u], q1_signs4_unit(bw.z, 12u)) +
        dot(shared_acts[act_base + 20u], q1_signs4_unit(bw.z, 16u)) +
        dot(shared_acts[act_base + 21u], q1_signs4_unit(bw.z, 20u)) +
        dot(shared_acts[act_base + 22u], q1_signs4_unit(bw.z, 24u)) +
        dot(shared_acts[act_base + 23u], q1_signs4_unit(bw.z, 28u)) +
        dot(shared_acts[act_base + 24u], q1_signs4_unit(bw.w, 0u))  +
        dot(shared_acts[act_base + 25u], q1_signs4_unit(bw.w, 4u))  +
        dot(shared_acts[act_base + 26u], q1_signs4_unit(bw.w, 8u))  +
        dot(shared_acts[act_base + 27u], q1_signs4_unit(bw.w, 12u)) +
        dot(shared_acts[act_base + 28u], q1_signs4_unit(bw.w, 16u)) +
        dot(shared_acts[act_base + 29u], q1_signs4_unit(bw.w, 20u)) +
        dot(shared_acts[act_base + 30u], q1_signs4_unit(bw.w, 24u)) +
        dot(shared_acts[act_base + 31u], q1_signs4_unit(bw.w, 28u));
      acc = acc + s * unscaled;
    }
    if (acc > best_value) {
      best_value = acc;
      best_token = vocab;
    }
  }

{% include "ops/_shared/argmax-wg-tree.wgsl.jinja" %}
}
`]]}],["com.xenova.LlamaDecodeQkNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkNorm",sinceVersion:1,inputs:[{role:"Q",dtype:"A",rank:1},{role:"K",dtype:"A",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Q",dtype:"A",rank:1,shape:["args.numHeads * args.headDim"]},{role:"K",dtype:"A",rank:1,shape:["args.numKvHeads * args.headDim"]}],typeConstraints:{A:["float32","float16"],W:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"inout"},kT:{kind:"tensor",semantic:"K",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rmsEps:{kind:"f32",semantic:"rms_eps"},qNormOffset:{kind:"u32",semantic:"q_norm_offset"},kNormOffset:{kind:"u32",semantic:"k_norm_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.qT == 1","ranks.kT == 1","ranks.weightsT == 1","tensorDtypes.qT == tensorDtypes.kT",'(tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")',"f16Ok(dtypes.A) and f16Ok(dtypes.W)","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","dim(shapes.qT, 0) >= args.numHeads * args.headDim","dim(shapes.kT, 0) >= args.numKvHeads * args.headDim","dim(shapes.weightsT, 0) >= max(args.qNormOffset + args.headDim, args.kNormOffset + args.headDim)"],constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.weightsT == "float16"',activationScalar:"dtypes.A",weightScalar:"dtypes.W",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",headDim:"args.headDim",rmsEps:"args.rmsEps",qNormOffset:"args.qNormOffset",kNormOffset:"args.kNormOffset"},passes:[{id:"main",name:"LlamaDecodeQkNorm",shader:"decode-qk-norm.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"k",arg:"kT",semantic:"K",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"}],dispatch:{x:"args.numHeads + args.numKvHeads"},reads:["Q","K","Weights"],writes:["Q","K"]}]}]},assets:[["decode-qk-norm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_Q_NORM: u32 = {{ qNormOffset }}u;
const W_K_NORM: u32 = {{ kNormOffset }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials: array<f32, 64>;

fn load_activation(value: {{ activationScalar }}) -> f32 {
  return f32(value);
}

fn load_weight(value: {{ weightScalar }}) -> f32 {
  return f32(value);
}

fn store_activation(value: f32) -> {{ activationScalar }} {
  return {{ activationScalar }}(value);
}

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let index = wid.x;
  let lid = lid3.x;
  let is_k = index >= NUM_HEADS;
  let head = select(index, index - NUM_HEADS, is_k);
  if ((!is_k && head >= NUM_HEADS) || (is_k && head >= NUM_KV_HEADS)) {
    return;
  }

  var sum = 0.0;
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let offset = head * HEAD_DIM + d;
    var value = 0.0;
    if (is_k) {
      value = load_activation(k[offset]);
    } else {
      value = load_activation(q[offset]);
    }
    sum = fma(value, value, sum);
  }
  partials[lid] = sum;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = partials[lid] + partials[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  let scale = inverseSqrt(partials[0] / f32(HEAD_DIM) + RMS_EPS);

  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let offset = head * HEAD_DIM + d;
    let weight_offset = select(W_Q_NORM, W_K_NORM, is_k) + d;
    let weight = load_weight(weights[weight_offset]);
    if (is_k) {
      k[offset] = store_activation(load_activation(k[offset]) * scale * weight);
    } else {
      q[offset] = store_activation(load_activation(q[offset]) * scale * weight);
    }
  }
}
`]]}],["com.xenova.LlamaDecodeRmsNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeRmsNorm",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Normed",dtype:"Y",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{W:["float32","float16"],Y:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},normedT:{kind:"tensor",semantic:"Normed",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"norm_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.normedT == 1",'tensorDtypes.hiddenT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")',"f16Ok(dtypes.W) and f16Ok(dtypes.Y)","args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.normOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.weightsT, 0) >= args.normOffset + args.hiddenSize"],constants:{usesF16:'tensorDtypes.weightsT == "float16" or tensorDtypes.normedT == "float16"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4"},passes:[{id:"main",name:"LlamaDecodeRmsNorm",shader:"decode-rms-norm.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"normed",arg:"normedT",semantic:"Normed",role:"output",buffer:{type:"storage"},elementType:"$normedVec4"}],dispatch:{x:1},reads:["Hidden","Weights"],writes:["Normed"]}]}]},assets:[["decode-rms-norm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 256u;

var<workgroup> partials: array<f32, 256>;

fn sum4(value: vec4<f32>) -> f32 {
  return value.x + value.y + value.z + value.w;
}

fn load_weight(value: {{ weightVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

fn store_normed(value: vec4<f32>) -> {{ normedVec4 }} {
  return {{ normedVec4 }}(value);
}

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_id) lid3: vec3<u32>) {
  let lid = lid3.x;
  var sum = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let value = hidden[dim];
    sum = sum + sum4(value * value);
  }
  partials[lid] = sum;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = partials[lid] + partials[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  let variance = partials[0];
  let scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    normed[dim] = store_normed(hidden[dim] * vec4<f32>(scale) * load_weight(weights[W_NORM_VEC4 + dim]));
  }
}
`]]}],["com.xenova.LlamaEmbed",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaEmbed",sinceVersion:1,inputs:[{role:"InputToken",dtype:"uint32",rank:1},{role:"Weights",dtype:"W",rank:1,optional:true},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true},{role:"EmbedQ8",dtype:"uint32",rank:1,optional:true},{role:"EmbedQ8Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{W:["float32","float16"],S:["float32","float16"]},args:{inputT:{kind:"tensor",semantic:"InputToken",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights",required:false},hiddenT:{kind:"tensor",semantic:"Hidden",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},embedOffset:{kind:"u32",semantic:"embed_offset",required:false},tokenOffset:{kind:"u32",semantic:"token_offset",required:false},pastLen:{kind:"u32",semantic:"past_len",required:false},cacheLen:{kind:"u32",semantic:"cache_len",required:false},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false},embedQ8T:{kind:"tensor",semantic:"EmbedQ8",role:"weights",required:false},embedQ8ScalesT:{kind:"tensor",semantic:"EmbedQ8Scales",role:"weights",required:false}},variants:[{id:"q1",priority:0,when:["present.q1BitsT","ranks.inputT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.hiddenT == 1",'tensorDtypes.inputT == "uint32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','tensorDtypes.hiddenT == "float32"',"f16Ok(dtypes.S)","args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.vocabSize > 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.inputT, 0) > (args.tokenOffset if args.tokenOffset else 0)","dim(shapes.q1BitsT, 0) >= (args.embedOffset + args.vocabSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.embedOffset + args.vocabSize * (args.hiddenSize / 128)"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",embedOffset:"args.embedOffset"},passes:[{id:"main",name:"LlamaEmbedQ1",source:{kind:"template",shader:"embed-q1.wgsl.jinja",version:1,inputs:{optimized:true}},bindings:[{name:"input_token",arg:"inputT",semantic:"InputToken",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen if args.cacheLen else 0"},{name:"token_offset",type:"u32",value:"args.tokenOffset if args.tokenOffset else 0"}]}}],dispatch:{x:"ceil(args.hiddenSize / 64)"},reads:["InputToken","Q1Bits","Q1Scales"],writes:["Hidden"]}]}]},assets:[["embed-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const W_EMBED_Q1: u32 = {{ embedOffset }}u;

fn q1_scale(block: u32) -> f32 {
  return f32(q1_scales[block]);
}

fn q1_weight(block_offset: u32, row: u32, cols: u32, col: u32) -> f32 {
  let blocks_per_row = cols / 128u;
  let block = block_offset + row * blocks_per_row + col / 128u;
  let bit_index = col % 128u;
  let block_words = q1_bits[block];
  let word = block_words[bit_index / 32u];
  let bit = (word >> (bit_index % 32u)) & 1u;
  let scale = q1_scale(block);
  return select(-scale, scale, bit == 1u);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let dim = gid.x;
  if (dim >= HIDDEN_SIZE) {
    return;
  }
  let token = input_token[params.token_offset];
  hidden[dim] = q1_weight(W_EMBED_Q1, token, HIDDEN_SIZE, dim);
}
`]]}],["com.xenova.LlamaPrefillAttention",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillAttention",sinceVersion:1,inputs:[{role:"Qkv",dtype:"Q",rank:2},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],outputs:[{role:"Attn",dtype:"O",rank:2,shape:["args.seqLen","args.numHeads * args.headDim"]}],typeConstraints:{Q:["float32","float16"],C:["float32","float16"],O:["float32","float16"]},args:{qkvT:{kind:"tensor",semantic:"Qkv",role:"input"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"input"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"input"},attnT:{kind:"tensor",semantic:"Attn",role:"output"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:false},seqLen:{kind:"u32",semantic:"seq_len"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},scale:{kind:"f32",semantic:"scale"},workgroupSize:{kind:"u32",semantic:"workgroup_size"}},derive:{qkvStride:"(args.numHeads + 2 * args.numKvHeads) * args.headDim",qHidden:"args.numHeads * args.headDim",cacheElements:"(args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim",baseContract:'ranks.qkvT == 2 and (ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5) and (ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5) and ranks.attnT == 2 and tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT and (tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16") and (tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16") and (tensorDtypes.attnT == "float32" or tensorDtypes.attnT == "float16") and ((tensorDtypes.qkvT != "float16" and tensorDtypes.cacheKeysT != "float16" and tensorDtypes.attnT != "float16") or device.features.has("shader-f16")) and args.cacheLen > 0 and args.seqLen > 0 and args.numHeads > 0 and args.numKvHeads > 0 and args.numHeads % args.numKvHeads == 0 and args.headDim > 0 and dim(shapes.qkvT, 1) == qkvStride and numel(shapes.qkvT) >= args.seqLen * qkvStride and dim(shapes.attnT, 1) == qHidden and numel(shapes.attnT) >= args.seqLen * qHidden and numel(shapes.cacheKeysT) >= cacheElements and numel(shapes.cacheValuesT) >= cacheElements',flashContract:"baseContract and args.headDim % 32 == 0",flashDispatchFits:"ceilDiv(args.seqLen, 16) <= device.limits.maxComputeWorkgroupsPerDimension and args.numHeads <= device.limits.maxComputeWorkgroupsPerDimension"},bindingSets:{scalarAttention:[{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"input",buffer:{type:"read-only-storage"},elementType:"$qScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"},{name:"seq_len",type:"u32",value:"args.seqLen"}]}}],flashAttention:[{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"input",buffer:{type:"read-only-storage"},elementType:"$qVec4"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheVec4"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheVec4"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"output",buffer:{type:"storage"},elementType:"$outVec4"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"},{name:"seq_len",type:"u32",value:"args.seqLen"}]}}]},variants:[{id:"scalar",priority:0,when:["baseContract","args.workgroupSize == 8 or args.workgroupSize == 16 or args.workgroupSize == 32 or args.workgroupSize == 64 or args.workgroupSize == 128 or args.workgroupSize == 256"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.cacheKeysT == "float16" or tensorDtypes.attnT == "float16"',qScalar:"dtypes.Q",cacheScalar:"dtypes.C",outScalar:"dtypes.O",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",numKvGroups:"args.numHeads / args.numKvHeads",headDim:"args.headDim",qHidden:"qHidden",qkvStride:"qkvStride",scaling:"args.scale",workgroupSize:"args.workgroupSize"},passes:[{id:"main",name:"LlamaPrefillAttention",shader:"prefill-attention.wgsl.jinja",bindings:"scalarAttention",dispatch:{x:"args.numHeads",y:"min(args.seqLen, device.limits.maxComputeWorkgroupsPerDimension)"},reads:["Qkv","CacheKeys","CacheValues"],writes:["Attn"]}]},{id:"flash",priority:2,when:["flashContract",'device.features.has("subgroups")','has(device.adapterInfo, "subgroupMinSize")',"device.adapterInfo.subgroupMinSize >= 32","flashDispatchFits"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.cacheKeysT == "float16" or tensorDtypes.attnT == "float16"',outScalar:"dtypes.O",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",numKvGroups:"args.numHeads / args.numKvHeads",headDim:"args.headDim",qHidden:"qHidden",qkvStride:"qkvStride",scaling:"args.scale",tileQ:"16",tileK:"16",lpq:"8",qVec4:'"vec4<f16>" if tensorDtypes.qkvT == "float16" else "vec4<f32>"',cacheVec4:'"vec4<f16>" if tensorDtypes.cacheKeysT == "float16" else "vec4<f32>"',outVec4:'"vec4<f16>" if tensorDtypes.attnT == "float16" else "vec4<f32>"',useSubgroups:"1"},passes:[{id:"main",name:"LlamaPrefillAttention",shader:"prefill-attention-flash.wgsl.jinja",bindings:"flashAttention",dispatch:{x:"ceilDiv(args.seqLen, 16)",y:"args.numHeads"},reads:["Qkv","CacheKeys","CacheValues"],writes:["Attn"]}],requiredFeatures:["subgroups"]},{id:"flash_nosg",priority:1,when:["flashContract","flashDispatchFits"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.cacheKeysT == "float16" or tensorDtypes.attnT == "float16"',outScalar:"dtypes.O",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",numKvGroups:"args.numHeads / args.numKvHeads",headDim:"args.headDim",qHidden:"qHidden",qkvStride:"qkvStride",scaling:"args.scale",tileQ:"16",tileK:'15 if tensorDtypes.qkvT == "float32" and tensorDtypes.cacheKeysT == "float32" and tensorDtypes.attnT == "float32" else 16',lpq:"8",qVec4:'"vec4<f16>" if tensorDtypes.qkvT == "float16" else "vec4<f32>"',cacheVec4:'"vec4<f16>" if tensorDtypes.cacheKeysT == "float16" else "vec4<f32>"',outVec4:'"vec4<f16>" if tensorDtypes.attnT == "float16" else "vec4<f32>"',useSubgroups:"0"},passes:[{id:"main",name:"LlamaPrefillAttention",shader:"prefill-attention-flash.wgsl.jinja",bindings:"flashAttention",dispatch:{x:"ceilDiv(args.seqLen, 16)",y:"args.numHeads"},reads:["Qkv","CacheKeys","CacheValues"],writes:["Attn"]}]}]},assets:[["prefill-attention-flash.wgsl.jinja",`{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const NUM_KV_GROUPS: u32 = {{ numKvGroups }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_V4: u32 = HEAD_DIM / 4u;
const Q_HIDDEN_V4: u32 = {{ qHidden }}u / 4u;
const QKV_STRIDE_V4: u32 = {{ qkvStride }}u / 4u;
const KV_HIDDEN_V4: u32 = NUM_KV_HEADS * HEAD_DIM / 4u;
const ATTN_SCALING: f32 = {{ scaling }};
const TILE_Q: u32 = {{ tileQ }}u;
const TILE_K: u32 = {{ tileK }}u;
const LPQ: u32 = {{ lpq }}u;
const SLICE: u32 = HEAD_DIM / (4u * LPQ);
const WG: u32 = TILE_Q * LPQ;
const NEG_INF: f32 = -3.4028234663852886e38;

{%- if usesF16 %}
var<workgroup> k_tile: array<vec4<f16>, TILE_K * HEAD_DIM_V4>;
var<workgroup> v_tile: array<vec4<f16>, TILE_K * HEAD_DIM_V4>;
{%- else %}
var<workgroup> k_tile: array<vec4<f32>, TILE_K * HEAD_DIM_V4>;
var<workgroup> v_tile: array<vec4<f32>, TILE_K * HEAD_DIM_V4>;
{%- endif %}
{%- if not useSubgroups %}

var<workgroup> red: array<f32, WG>;
{%- endif %}

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>{%- if useSubgroups %},
  @builtin(subgroup_size) sgSize: u32
{%- endif %}
) {

  if (wg.x * TILE_Q >= params.seq_len) {
    return;
  }
{%- if useSubgroups %}

  if (sgSize < LPQ) {
    return;
  }
{%- endif %}
  let h = wg.y;
  let tid = lid.x;
  let qSub = tid / LPQ;
  let lane = tid % LPQ;
  let qIdx = wg.x * TILE_Q + qSub;
  let absPos = params.past_len + qIdx;
  let qValid = qIdx < params.seq_len && absPos < CACHE_LEN;
  let hKv = h / NUM_KV_GROUPS;

  let qClamped = min(qIdx, params.seq_len - 1u);
  let qBase4 = qClamped * QKV_STRIDE_V4 + h * HEAD_DIM_V4 + lane * SLICE;
  var qr: array<vec4<f32>, SLICE>;
  var o: array<vec4<f32>, SLICE>;
  for (var c = 0u; c < SLICE; c = c + 1u) {
    qr[c] = vec4<f32>(qkv[qBase4 + c]);
    o[c] = vec4<f32>(0.0);
  }
  var m = NEG_INF;
  var l = 0.0;

  let maxKj = min(params.past_len + qClamped + 1u, CACHE_LEN);
  let lastQ = min(wg.x * TILE_Q + TILE_Q - 1u, params.seq_len - 1u);
  let wgEnd = min(params.past_len + lastQ + 1u, CACHE_LEN);
  let kvHeadBase4 = hKv * HEAD_DIM_V4;

  var kStart = 0u;
  loop {
    if (kStart >= wgEnd) {
      break;
    }

    workgroupBarrier();
    for (var i = tid; i < TILE_K * HEAD_DIM_V4; i = i + WG) {
      let slot = i / HEAD_DIM_V4;
      let d4 = i % HEAD_DIM_V4;
      let kj = kStart + slot;
      if (kj < wgEnd) {
        let base4 = kj * KV_HIDDEN_V4 + kvHeadBase4 + d4;
{%- if usesF16 %}
        k_tile[i] = vec4<f16>(cache_keys[base4]);
        v_tile[i] = vec4<f16>(cache_values[base4]);
      } else {
        k_tile[i] = vec4<f16>(0.0);
        v_tile[i] = vec4<f16>(0.0);
      }
{%- else %}
        k_tile[i] = vec4<f32>(cache_keys[base4]);
        v_tile[i] = vec4<f32>(cache_values[base4]);
      } else {
        k_tile[i] = vec4<f32>(0.0);
        v_tile[i] = vec4<f32>(0.0);
      }
{%- endif %}
    }
    workgroupBarrier();

{%- for kk in range(tileK) %}

    var s{{ kk }} = NEG_INF;
    {
      let kj = kStart + {{ kk }}u;
      var part = 0.0;
      let kb = {{ kk }}u * HEAD_DIM_V4 + lane * SLICE;
      for (var c = 0u; c < SLICE; c = c + 1u) {
        part = part + dot(qr[c], vec4<f32>(k_tile[kb + c]));
      }
{%- if useSubgroups %}
      part = part + subgroupShuffleXor(part, 1u);
{%- if lpq >= 4 %}
      part = part + subgroupShuffleXor(part, 2u);
{%- endif %}
{%- if lpq >= 8 %}
      part = part + subgroupShuffleXor(part, 4u);
{%- endif %}
{%- else %}

      red[tid] = part;
      workgroupBarrier();
      let cbase = tid - lane;
      part = 0.0;
      for (var j = 0u; j < LPQ; j = j + 1u) {
        part = part + red[cbase + j];
      }
      workgroupBarrier();
{%- endif %}
      if (kj < maxKj) {
        s{{ kk }} = part * ATTN_SCALING;
      }
    }
{%- endfor %}

    var tileMax = s0;
{%- for kk in range(1, tileK) %}
    tileMax = max(tileMax, s{{ kk }});
{%- endfor %}
    let newMax = max(m, tileMax);
    let corr = select(exp(m - newMax), 0.0, m == NEG_INF);
{%- for kk in range(tileK) %}
    let p{{ kk }} = select(0.0, exp(s{{ kk }} - newMax), s{{ kk }} != NEG_INF);
{%- endfor %}
    l = l * corr + ({% for kk in range(tileK) %}{% if kk > 0 %} + {% endif %}p{{ kk }}{% endfor %});
    for (var c = 0u; c < SLICE; c = c + 1u) {
      var acc = o[c] * corr;
{%- for kk in range(tileK) %}
      acc = acc + p{{ kk }} * vec4<f32>(v_tile[{{ kk }}u * HEAD_DIM_V4 + lane * SLICE + c]);
{%- endfor %}
      o[c] = acc;
    }
    m = newMax;

    kStart = kStart + TILE_K;
  }

  if (qValid) {
    let outBase4 = qIdx * Q_HIDDEN_V4 + h * HEAD_DIM_V4 + lane * SLICE;
    let inv = 1.0 / l;
    for (var c = 0u; c < SLICE; c = c + 1u) {
      attn_out[outBase4 + c] = vec4<{{ outScalar }}>(o[c] * inv);
    }
  }
}
`],["prefill-attention.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const NUM_KV_GROUPS: u32 = {{ numKvGroups }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const Q_HIDDEN: u32 = {{ qHidden }}u;
const QKV_STRIDE: u32 = {{ qkvStride }}u;
const ATTN_SCALING: f32 = {{ scaling }};
const WG: u32 = {{ workgroupSize }}u;

var<workgroup> partial: array<f32, WG>;
var<workgroup> running_max: f32;
var<workgroup> running_denom: f32;
var<workgroup> running_out: array<f32, HEAD_DIM>;
var<workgroup> previous_scale: f32;
var<workgroup> current_score: f32;

{% include "ops/_shared/kv-cache-index.wgsl.jinja" %}

{% include "ops/_shared/reduce-sum-wg.wgsl.jinja" %}

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(num_workgroups) ngroups: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {

  let head = wg.x;
  if (head >= NUM_HEADS) {
    return;
  }
  let kv_head = head / NUM_KV_GROUPS;
  let tid = lid.x;

  for (var query_token: u32 = wg.y; query_token < params.seq_len; query_token = query_token + ngroups.y) {
    let abs_pos = params.past_len + query_token;
    if (abs_pos >= CACHE_LEN) {
      continue;
    }

    if (tid == 0u) {
      running_max = -3.4028234663852886e38;
      running_denom = 0.0;
    }
    for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
      running_out[d] = 0.0;
    }
    workgroupBarrier();

    let q_row = query_token * QKV_STRIDE + head * HEAD_DIM;
    for (var key_token: u32 = 0u; key_token <= abs_pos; key_token = key_token + 1u) {
      var partial_dot = 0.0;
      for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
        partial_dot = partial_dot + f32(qkv[q_row + d]) * f32(cache_keys[cache_index(key_token, kv_head, d)]);
      }
      let score = reduce_sum(partial_dot, tid) * ATTN_SCALING;
      if (tid == 0u) {
        current_score = score;
        let next_max = max(running_max, score);
        let old_factor = exp(running_max - next_max);
        let new_factor = exp(score - next_max);
        previous_scale = old_factor;
        running_max = next_max;
        running_denom = running_denom * old_factor + new_factor;
      }
      workgroupBarrier();

      let probability_numerator = exp(current_score - running_max);
      for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
        running_out[d] = running_out[d] * previous_scale + probability_numerator * f32(cache_values[cache_index(key_token, kv_head, d)]);
      }
      workgroupBarrier();
    }

    let inv_denom = 1.0 / running_denom;
    for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
      let out_index = query_token * Q_HIDDEN + head * HEAD_DIM + d;
      attn_out[out_index] = {{ outScalar }}(running_out[d] * inv_denom);
    }

    workgroupBarrier();
  }
}
`]]}],["com.xenova.LlamaPrefillEmbed",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillEmbed",sinceVersion:1,inputs:[{role:"Tokens",dtype:"uint32",rank:1},{role:"Weights",dtype:"W",rank:1,optional:true},{role:"EmbedQ8",dtype:"uint32",rank:1,optional:true},{role:"EmbedQ8Scales",dtype:"S",rank:1,optional:true},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"Hidden",dtype:"Y",rank:2,shape:["args.seqLen","args.hiddenSize"]}],typeConstraints:{W:["float32","float16"],Y:["float32","float16"],S:["float32","float16"]},args:{tokensT:{kind:"tensor",semantic:"Tokens",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights",required:false},hiddenT:{kind:"tensor",semantic:"Hidden",role:"output"},embedOffset:{kind:"u32",semantic:"embed_offset",required:false},hiddenSize:{kind:"u32",semantic:"hidden_size"},seqLen:{kind:"u32",semantic:"seq_len"},embedQ8T:{kind:"tensor",semantic:"EmbedQ8",role:"weights",required:false},embedQ8ScalesT:{kind:"tensor",semantic:"EmbedQ8Scales",role:"weights",required:false},vocabSize:{kind:"u32",semantic:"vocab_size",required:false},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false}},variants:[{id:"q1",priority:0,when:["present.q1BitsT","ranks.tokensT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.hiddenT == 2",'tensorDtypes.tokensT == "uint32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','((tensorDtypes.q1ScalesT != "float16" and tensorDtypes.hiddenT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.vocabSize > 0","args.seqLen > 0","args.hiddenSize % 128 == 0","dim(shapes.hiddenT, 1) == args.hiddenSize","numel(shapes.hiddenT) >= args.seqLen * args.hiddenSize","numel(shapes.tokensT) >= args.seqLen","dim(shapes.q1BitsT, 0) >= (args.embedOffset + args.vocabSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.embedOffset + args.vocabSize * (args.hiddenSize / 128)"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16" or tensorDtypes.hiddenT == "float16"',scaleScalar:"dtypes.S",outScalar:"dtypes.Y",hiddenSize:"args.hiddenSize",embedOffset:"args.embedOffset if args.embedOffset else 0",blocksPerRow:"args.hiddenSize / 128"},passes:[{id:"main",name:"LlamaPrefillEmbedQ1",shader:"prefill-embed-q1.wgsl.jinja",bindings:[{name:"tokens",arg:"tokensT",semantic:"Tokens",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"seq_len",type:"u32",value:"args.seqLen"}]}}],dispatch:{threads:"args.seqLen * args.hiddenSize",workgroupSize:"64"},reads:["Tokens","Q1Bits","Q1Scales"],writes:["Hidden"]}]}]},assets:[["prefill-embed-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const W_EMBED_Q1: u32 = {{ embedOffset }}u;
const BPR: u32 = {{ blocksPerRow }}u;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let gi = gid.x + gid.y * nwg.x * 64u;
  let total = params.seq_len * HIDDEN_SIZE;
  if (gi >= total) {
    return;
  }
  let t = gi / HIDDEN_SIZE;
  let d = gi % HIDDEN_SIZE;
  let token = tokens[t];
  let block = W_EMBED_Q1 + token * BPR + d / 128u;
  let bit_index = d % 128u;
  let block_words = q1_bits[block];
  let word = block_words[bit_index / 32u];
  let bit = (word >> (bit_index % 32u)) & 1u;
  let scale = f32(q1_scales[block]);
  hidden[gi] = {{ outScalar }}(select(-scale, scale, bit == 1u));
}
`]]}],["com.xenova.LlamaPrefillGateUpQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillGateUpQ1",sinceVersion:1,inputs:[{role:"A",dtype:"A",rank:2},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1},{role:"RealLen",dtype:"uint32",rank:1,optional:true},{role:"Y",dtype:"Y",rank:2}],outputs:[{role:"Y",dtype:"Y",rank:2,shape:["args.M","args.intermediateSize"]}],typeConstraints:{A:["float32","float16"],S:["float32","float16"],Y:["float32","float16"]},tunables:{PORTABLE_LUT4_MVEC:4},derive:{q1Blocks:"max(args.gateOffset, args.upOffset) + args.intermediateSize * (args.inFeatures / 128)",baseContract:'ranks.aT == 2 and ranks.q1BitsT == 1 and ranks.q1ScalesT == 1 and ranks.yT == 2 and tensorDtypes.q1BitsT == "uint32" and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16") and (tensorDtypes.yT == "float32" or tensorDtypes.yT == "float16") and args.M > 0 and args.inFeatures > 0 and args.inFeatures % 128 == 0 and args.intermediateSize > 0 and args.intermediateSize % 64 == 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.yT) >= args.M * args.intermediateSize and numel(shapes.q1BitsT) >= q1Blocks * 4 and numel(shapes.q1ScalesT) >= q1Blocks'},args:{aT:{kind:"tensor",semantic:"A",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},realLenT:{kind:"tensor",semantic:"RealLen",role:"input",required:false},yT:{kind:"tensor",semantic:"Y",role:"inout"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},gateOffset:{kind:"u32",semantic:"gate_block_offset"},upOffset:{kind:"u32",semantic:"up_block_offset"},activation:{kind:"string",semantic:"activation",required:false,oneOf:["silu","fast_silu"]}},bindingSets:{static:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"gate_offset",type:"u32",value:"args.gateOffset"},{name:"up_offset",type:"u32",value:"args.upOffset"},{name:"m",type:"u32",value:"args.M"}]}}],dynamic:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"real_len",arg:"realLenT",semantic:"RealLen",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"gate_offset",type:"u32",value:"args.gateOffset"},{name:"up_offset",type:"u32",value:"args.upOffset"},{name:"m",type:"u32",value:"args.M"}]}}]},variants:[{id:"portable_lut4_f16_dynamic_m",priority:110,requiredFeatures:["shader-f16"],when:["present.realLenT",'ranks.realLenT == 1 and numel(shapes.realLenT) >= 1 and tensorDtypes.realLenT == "uint32"','device.features.has("shader-f16")',"baseContract"],derive:{lutM:"16 if (args.M >= 128 or (args.M >= 16 and args.inFeatures <= 5120 and args.intermediateSize > 1024)) else (1 if args.intermediateSize <= 1024 else (4 if args.M >= 4 else args.M))",lutN:"256"},constants:{usesF16:true,dynamicM:true,fastSilu:'args.activation == "fast_silu"',roundProjectionF16:'tensorDtypes.yT == "float16"',scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",intermediateSize:"args.intermediateSize",tileM:"lutM",tileN:"lutN",workgroupSize:"lutN",mVectorWidth:"4 if tunables.PORTABLE_LUT4_MVEC == 4 and lutM % 4 == 0 and args.intermediateSize >= args.inFeatures else 1",lutScalar:'"f16"',yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillGateUpQ1PortableLut4F16DynamicM",shader:"prefill-gate-up-q1-lut4.wgsl.jinja",bindings:"dynamic",dispatch:{workgroups:"ceilDiv(args.M, lutM)",x:"ceilDiv(args.intermediateSize, lutN)"},reads:["A","Q1Bits","Q1Scales","RealLen"],writes:["Y"]}]},{id:"portable_lut4_f16",priority:100,requiredFeatures:["shader-f16"],when:["not present.realLenT",'device.features.has("shader-f16")',"baseContract"],derive:{lutM:"16 if (args.M >= 128 or (args.M >= 16 and args.inFeatures <= 5120 and args.intermediateSize > 1024)) else (1 if args.intermediateSize <= 1024 else (4 if args.M >= 4 else args.M))",lutN:"256"},constants:{usesF16:true,dynamicM:false,fastSilu:'args.activation == "fast_silu"',roundProjectionF16:'tensorDtypes.yT == "float16"',scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",intermediateSize:"args.intermediateSize",tileM:"lutM",tileN:"lutN",workgroupSize:"lutN",mVectorWidth:"4 if tunables.PORTABLE_LUT4_MVEC == 4 and lutM % 4 == 0 and args.intermediateSize >= args.inFeatures else 1",lutScalar:'"f16"',yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillGateUpQ1PortableLut4F16",shader:"prefill-gate-up-q1-lut4.wgsl.jinja",bindings:"static",dispatch:{workgroups:"ceilDiv(args.M, lutM)",x:"ceilDiv(args.intermediateSize, lutN)"},reads:["A","Q1Bits","Q1Scales"],writes:["Y"]}]}]},assets:[["prefill-gate-up-q1-lut4.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const IN_FEATURES: u32 = {{ inFeatures }}u;
const INTERMEDIATE_SIZE: u32 = {{ intermediateSize }}u;
const M_TILE: u32 = {{ tileM }}u;
const N_TILE: u32 = {{ tileN }}u;
const WG_SIZE: u32 = {{ workgroupSize }}u;
const M_VECTOR_WIDTH: u32 = {{ mVectorWidth }}u;
const IN_FEATURES_V4: u32 = IN_FEATURES / 4u;
const NUM_GROUPS: u32 = IN_FEATURES / 128u;
const LUT_M_ROWS: u32 = M_TILE / M_VECTOR_WIDTH;
const LUT_ENTRIES: u32 = LUT_M_ROWS * 32u * 16u;
const LUT_NIBBLES: u32 = LUT_M_ROWS * 32u;

{%- if mVectorWidth == 4 %}
alias LutValue = vec4<{{ lutScalar }}>;
alias AccValue = vec4<f32>;
{%- else %}
alias LutValue = {{ lutScalar }};
alias AccValue = f32;
{%- endif %}

var<workgroup> lut: array<LutValue, LUT_ENTRIES>;

fn lutIndex(m_row: u32, nibble: u32, mask: u32) -> u32 {
  return (m_row * 32u + nibble) * 16u + mask;
}

fn q1RowWord(vec_index: u32, row_lane: u32) -> u32 {
  return q1_bits[vec_index * 4u + row_lane];
}

fn q1Scale(index: u32) -> f32 {
{%- if scaleScalar == "f32" %}
  return q1_scales[index];
{%- else %}
  return f32(q1_scales[index]);
{%- endif %}
}

@compute @workgroup_size({{ workgroupSize }}, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(num_workgroups) nwg: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let tid = lid.x;
  let n = wg.x * N_TILE + tid;
  let n_valid = n < INTERMEDIATE_SIZE;

  let m_block = (wg.y + wg.z * nwg.y) * M_TILE;
{%- if dynamicM %}
  let active_m = min(real_len[0], params.m);
  if (m_block >= active_m) { return; }
{%- else %}
  let active_m = params.m;
{%- endif %}

{% for m in range(0, tileM, mVectorWidth) %}
  var gate_acc_{{ m }} = AccValue(0.0);
  var up_acc_{{ m }} = AccValue(0.0);
{% endfor %}

  for (var g = 0u; g < NUM_GROUPS; g = g + 1u) {

    for (var i = tid; i < LUT_NIBBLES; i = i + WG_SIZE) {
      let nibble = i & 31u;
      let m_local = i >> 5u;
{%- if mVectorWidth == 4 %}
      let m = m_block + m_local * 4u;
      var v0 = {{ aVec4 }}(0.0);
      var v1 = {{ aVec4 }}(0.0);
      var v2 = {{ aVec4 }}(0.0);
      var v3 = {{ aVec4 }}(0.0);
      if (m < active_m) { v0 = a[m * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 1u < active_m) { v1 = a[(m + 1u) * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 2u < active_m) { v2 = a[(m + 2u) * IN_FEATURES_V4 + g * 32u + nibble]; }
      if (m + 3u < active_m) { v3 = a[(m + 3u) * IN_FEATURES_V4 + g * 32u + nibble]; }
      let x = vec4<f32>(f32(v0.x), f32(v1.x), f32(v2.x), f32(v3.x));
      let yv = vec4<f32>(f32(v0.y), f32(v1.y), f32(v2.y), f32(v3.y));
      let z = vec4<f32>(f32(v0.z), f32(v1.z), f32(v2.z), f32(v3.z));
      let wv = vec4<f32>(f32(v0.w), f32(v1.w), f32(v2.w), f32(v3.w));
{%- else %}
      let m = m_block + m_local;
      var v = {{ aVec4 }}(0.0);
      if (m < active_m) {
        v = a[m * IN_FEATURES_V4 + g * 32u + nibble];
      }
      let x = f32(v.x);
      let yv = f32(v.y);
      let z = f32(v.z);
      let wv = f32(v.w);
{%- endif %}
      let xy = x + yv;
      let xz = x + z;
      let yz = yv + z;
      let xyz = xy + z;
      let c = 0.5 * (x + yv + z + wv);
      let base = (m_local * 32u + nibble) * 16u;

      lut[base] = LutValue(-c);
      lut[base + 1u] = LutValue(x - c);
      lut[base + 2u] = LutValue(yv - c);
      lut[base + 3u] = LutValue(xy - c);
      lut[base + 4u] = LutValue(z - c);
      lut[base + 5u] = LutValue(xz - c);
      lut[base + 6u] = LutValue(yz - c);
      lut[base + 7u] = LutValue(xyz - c);
      lut[base + 8u] = LutValue(wv - c);
      lut[base + 9u] = LutValue(x + wv - c);
      lut[base + 10u] = LutValue(yv + wv - c);
      lut[base + 11u] = LutValue(xy + wv - c);
      lut[base + 12u] = LutValue(z + wv - c);
      lut[base + 13u] = LutValue(xz + wv - c);
      lut[base + 14u] = LutValue(yz + wv - c);
      lut[base + 15u] = LutValue(xyz + wv - c);
    }
    workgroupBarrier();

    if (n_valid) {
      let row_tile = n / 4u;
      let row_lane = n & 3u;
{% for stream in ["gate", "up"] %}
      let {{ stream }}_group_base = params.{{ stream }}_offset + (row_tile * NUM_GROUPS + g) * 4u;
      let {{ stream }}_p0 = q1RowWord({{ stream }}_group_base, row_lane);
      let {{ stream }}_p1 = q1RowWord({{ stream }}_group_base + 1u, row_lane);
      let {{ stream }}_p2 = q1RowWord({{ stream }}_group_base + 2u, row_lane);
      let {{ stream }}_p3 = q1RowWord({{ stream }}_group_base + 3u, row_lane);
      let {{ stream }}_scale = 2.0 * q1Scale({{ stream }}_group_base + row_lane);
{% for m in range(0, tileM, mVectorWidth) %}
      var {{ stream }}_qa_{{ m }} = AccValue(0.0);
{% endfor %}
{% for word in range(4) %}
{% for byte in range(4) %}
      {
        let packed_byte = ({{ stream }}_p{{ word }} >> {{ byte * 8 }}u) & 0xffu;
        let lo = packed_byte & 0x0fu;
        let hi = packed_byte >> 4u;
{% for m in range(0, tileM, mVectorWidth) %}
        {{ stream }}_qa_{{ m }} = {{ stream }}_qa_{{ m }}
          + AccValue(lut[lutIndex({{ m }}u / M_VECTOR_WIDTH, {{ word * 8 + byte * 2 }}u, lo)])
          + AccValue(lut[lutIndex({{ m }}u / M_VECTOR_WIDTH, {{ word * 8 + byte * 2 + 1 }}u, hi)]);
{% endfor %}
      }
{% endfor %}
{% endfor %}
{% for m in range(0, tileM, mVectorWidth) %}
      {{ stream }}_acc_{{ m }} = {{ stream }}_acc_{{ m }} + {{ stream }}_scale * {{ stream }}_qa_{{ m }};
{% endfor %}
{% endfor %}
    }

    workgroupBarrier();
  }

  if (n_valid) {
{% for m in range(0, tileM, mVectorWidth) %}
{%- if mVectorWidth == 4 %}
{%- if roundProjectionF16 %}
    let gate_{{ m }} = vec4<f32>(vec4<f16>(gate_acc_{{ m }}));
    let up_{{ m }} = vec4<f32>(vec4<f16>(up_acc_{{ m }}));
{%- else %}
    let gate_{{ m }} = gate_acc_{{ m }};
    let up_{{ m }} = up_acc_{{ m }};
{%- endif %}
{%- if fastSilu %}
    let sigmoid_{{ m }} = vec4<f32>(0.5) + vec4<f32>(0.5) * gate_{{ m }} / (vec4<f32>(1.0) + abs(gate_{{ m }}));
    let activated_{{ m }} = (gate_{{ m }} * sigmoid_{{ m }}) * up_{{ m }};
{%- else %}
    let activated_{{ m }} = (gate_{{ m }} / (vec4<f32>(1.0) + exp(-gate_{{ m }}))) * up_{{ m }};
{%- endif %}
{% for lane in range(4) %}
    {
      let mr = m_block + {{ m + lane }}u;
      if (mr < active_m) {
        y[mr * INTERMEDIATE_SIZE + n] = {{ yScalar }}(activated_{{ m }}[{{ lane }}u]);
      }
    }
{% endfor %}
{%- else %}
{%- if roundProjectionF16 %}
    let gate_{{ m }} = f32(f16(gate_acc_{{ m }}));
    let up_{{ m }} = f32(f16(up_acc_{{ m }}));
{%- else %}
    let gate_{{ m }} = gate_acc_{{ m }};
    let up_{{ m }} = up_acc_{{ m }};
{%- endif %}
{%- if fastSilu %}
    let sigmoid_{{ m }} = 0.5 + 0.5 * gate_{{ m }} / (1.0 + abs(gate_{{ m }}));
    let activated_{{ m }} = gate_{{ m }} * sigmoid_{{ m }};
{%- else %}
    let activated_{{ m }} = gate_{{ m }} / (1.0 + exp(-gate_{{ m }}));
{%- endif %}
    let mr_{{ m }} = m_block + {{ m }}u;
    if (mr_{{ m }} < active_m) {
      y[mr_{{ m }} * INTERMEDIATE_SIZE + n] = {{ yScalar }}(activated_{{ m }} * up_{{ m }});
    }
{%- endif %}
{% endfor %}
  }
}
`]]}],["com.xenova.LlamaPrefillMatmulQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillMatmulQ1",sinceVersion:1,inputs:[{role:"A",dtype:"A",rank:2},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1},{role:"RealLen",dtype:"uint32",rank:1,optional:true},{role:"Y",dtype:"Y",rank:2}],outputs:[{role:"Y",dtype:"Y",rank:2,shape:["args.M","args.outStride"]}],tunables:{PORTABLE_LUT4_MVEC:4,SMALL_M_SPLIT_K:1,SMALL_M_N128_SPLIT_K:1,SMALL_M_SPLIT_K_VALUE:4,SMALL_M_DEEP_SPLIT_K:16,SMALL_M_N128_EXPAND_SPLIT_K:4,SMALL_M_N128_NARROW_SPLIT_K:16},derive:{sgmatSubgroup32:'has(device.adapterInfo, "subgroupMinSize") and has(device.adapterInfo, "subgroupMaxSize") and device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32',q1Blocks:"args.blockOffset + args.outFeatures * (args.inFeatures / 128)",baseContract:'ranks.aT == 2 and ranks.q1BitsT == 1 and ranks.q1ScalesT == 1 and ranks.yT == 2 and tensorDtypes.q1BitsT == "uint32" and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16") and (tensorDtypes.yT == "float32" or tensorDtypes.yT == "float16") and args.M > 0 and args.inFeatures > 0 and args.inFeatures % 128 == 0 and args.outFeatures > 0 and args.dstColStart + args.outFeatures <= args.outStride and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.yT) >= args.M * args.outStride and numel(shapes.q1BitsT) >= q1Blocks * 4 and numel(shapes.q1ScalesT) >= q1Blocks'},typeConstraints:{A:["float32","float16"],S:["float32","float16"],Y:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},realLenT:{kind:"tensor",semantic:"RealLen",role:"input",required:false},yT:{kind:"tensor",semantic:"Y",role:"inout"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},blockOffset:{kind:"u32",semantic:"block_offset"},outStride:{kind:"u32",semantic:"out_stride"},dstColStart:{kind:"u32",semantic:"dst_col_start"}},bindingSets:{portableQ1:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"block_offset",type:"u32",value:"args.blockOffset"},{name:"m",type:"u32",value:"args.M"}]}}],rowTile4Q1:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"block_offset",type:"u32",value:"args.blockOffset"},{name:"m",type:"u32",value:"args.M"}]}}],portableQ1Dynamic:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"real_len",arg:"realLenT",semantic:"RealLen",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"block_offset",type:"u32",value:"args.blockOffset"},{name:"m",type:"u32",value:"args.M"}]}}],splitKPartials:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"partials",semantic:"partials",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"block_offset",type:"u32",value:"args.blockOffset"},{name:"m",type:"u32",value:"args.M"}]}}],splitKReduce:[{name:"partials",semantic:"partials",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$yScalar"}]},variants:[{id:"narrow",priority:50,when:["baseContract","f16Ok(dtypes.A) and f16Ok(dtypes.S) and f16Ok(dtypes.Y)","args.M <= device.limits.maxComputeWorkgroupsPerDimension","args.outFeatures % 4 == 0","args.outFeatures % 64 != 0"],constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.q1ScalesT == "float16" or tensorDtypes.yT == "float16"',useSubgroups:'device.features.has("subgroups")',scaleScalar:"dtypes.S",inWords:"args.inFeatures / 32",blocksPerRow:"args.inFeatures / 128",outTiles:"args.outFeatures / 4",inVec4:"args.inFeatures / 4",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillMatmulQ1Narrow",shader:"prefill-matmul-q1-narrow.wgsl.jinja",bindings:"rowTile4Q1",dispatch:{x:"args.M"},reads:["A","Q1Bits","Q1Scales"],writes:["Y"]}]},{id:"portable_lut4_f16_dynamic_m",priority:116,requiredFeatures:["shader-f16"],when:["present.realLenT",'ranks.realLenT == 1 and numel(shapes.realLenT) >= 1 and tensorDtypes.realLenT == "uint32"','device.features.has("shader-f16")',"args.M >= 64","baseContract","args.outFeatures % 64 == 0"],derive:{lutM:"16 if (args.M >= 128 or (args.M >= 16 and args.inFeatures <= 5120 and args.outFeatures > 1024)) else (1 if args.outFeatures <= 1024 else (4 if args.M >= 4 else args.M))",lutN:"256"},constants:{usesF16:true,scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",outFeatures:"args.outFeatures",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",tileM:"lutM",tileN:"lutN",nPerThread:1,workgroupSize:"lutN",assumeBiasNegHalfScale:true,scaleOnly:true,lutScalar:'"f16"',yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillMatmulQ1PortableLut4F16DynamicM",source:{kind:"template",shader:"ops/_shared/binary-lut4-matmul.wgsl.jinja",version:3,inputs:{layout:'"q1_row4"',mVectorWidth:"4 if tunables.PORTABLE_LUT4_MVEC == 4 and lutM % 4 == 0 and args.outFeatures >= args.inFeatures else 1",dynamicM:true}},bindings:"portableQ1Dynamic",dispatch:{workgroups:"ceilDiv(args.M, lutM)",x:"ceilDiv(args.outFeatures, lutN)"},reads:["A","Q1Bits","Q1Scales","RealLen"],writes:["Y"]}]},{id:"portable_lut4_f16",priority:115,requiredFeatures:["shader-f16"],when:["not present.realLenT",'device.features.has("shader-f16")','args.M >= 64 or not (device.features.has("subgroups") and device.features.has("chromium-experimental-subgroup-matrix")) or (args.M == 16 and (2 * args.inFeatures <= args.outFeatures or (3 * args.inFeatures <= 2 * args.outFeatures and args.outFeatures <= 2 * args.inFeatures) or (args.outFeatures < args.inFeatures and args.inFeatures < 4 * args.outFeatures)))',"baseContract","args.outFeatures % 64 == 0"],derive:{lutM:"16 if (args.M >= 128 or (args.M >= 16 and args.inFeatures <= 5120 and args.outFeatures > 1024)) else (1 if args.outFeatures <= 1024 else (4 if args.M >= 4 else args.M))",lutN:"256"},constants:{usesF16:true,scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",outFeatures:"args.outFeatures",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",tileM:"lutM",tileN:"lutN",nPerThread:1,workgroupSize:"lutN",assumeBiasNegHalfScale:true,scaleOnly:true,lutScalar:'"f16"',yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillMatmulQ1PortableLut4F16",source:{kind:"template",shader:"ops/_shared/binary-lut4-matmul.wgsl.jinja",version:3,inputs:{layout:'"q1_row4"',mVectorWidth:"4 if tunables.PORTABLE_LUT4_MVEC == 4 and lutM % 4 == 0 and args.outFeatures >= args.inFeatures else 1"}},bindings:"portableQ1",dispatch:{workgroups:"ceilDiv(args.M, lutM)",x:"ceilDiv(args.outFeatures, lutN)"},reads:["A","Q1Bits","Q1Scales"],writes:["Y"]}]},{id:"portable_lut4_f32",priority:70,when:["baseContract",'tensorDtypes.aT == "float32"','tensorDtypes.q1ScalesT == "float32"','tensorDtypes.yT == "float32"',"args.outFeatures % 64 == 0"],derive:{lutM:"16 if (args.M >= 16 and device.limits.maxComputeWorkgroupStorageSize >= 32768) else (8 if args.M >= 8 else args.M)",lutN:"256"},constants:{usesF16:false,scaleScalar:'"f32"',inFeatures:"args.inFeatures",outFeatures:"args.outFeatures",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",tileM:"lutM",tileN:"lutN",nPerThread:1,workgroupSize:"lutN",assumeBiasNegHalfScale:true,scaleOnly:true,lutScalar:'"f32"',yScalar:'"f32"',aVec4:'"vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillMatmulQ1PortableLut4F32",source:{kind:"template",shader:"ops/_shared/binary-lut4-matmul.wgsl.jinja",version:3,inputs:{layout:'"q1_row4"',mVectorWidth:1}},bindings:"portableQ1",dispatch:{workgroups:"ceilDiv(args.M, lutM)",x:"ceilDiv(args.outFeatures, lutN)"},reads:["A","Q1Bits","Q1Scales"],writes:["Y"]}]},{id:"portable_tiled",priority:75,requiredFeatures:["shader-f16"],when:["not present.realLenT",'device.features.has("shader-f16")',"baseContract","args.outFeatures % 64 == 0"],derive:{portableBM:"16 if args.M <= 16 else 32"},constants:{scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",outFeatures:"args.outFeatures",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",blockOffset:"args.blockOffset",bm:"portableBM",nTile:"128 / portableBM",accs:"portableBM / 4",yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillMatmulQ1PortableTiled",source:{kind:"template",shader:"ops/_shared/prefill-matmul-q1-tiled.wgsl.jinja",version:2,inputs:{portable:true}},bindings:"portableQ1",dispatch:{x:"min(ceilDiv(args.outFeatures, 32), device.limits.maxComputeWorkgroupsPerDimension)",y:"min(ceilDiv(args.M, portableBM), device.limits.maxComputeWorkgroupsPerDimension)"},reads:["A","Q1Bits","Q1Scales"],writes:["Y"]}]},{id:"subgroup_matrix_small_m_splitk_wg64_n64",priority:113,when:["not present.realLenT","tunables.SMALL_M_SPLIT_K == 1",'device.features.has("shader-f16")','device.features.has("subgroups")','device.features.has("chromium-experimental-subgroup-matrix")',"sgmatSubgroup32","baseContract","args.M <= 16","args.inFeatures % 512 == 0","args.outFeatures % 64 == 0","ceilDiv(args.outFeatures, 64) <= device.limits.maxComputeWorkgroupsPerDimension","ceilDiv(args.M * args.outFeatures, 256) <= device.limits.maxComputeWorkgroupsPerDimension","ceilDiv(args.M, 16) <= device.limits.maxComputeWorkgroupsPerDimension"],derive:{effectiveSmallMSplitK:"tunables.SMALL_M_DEEP_SPLIT_K if args.inFeatures >= 8192 and 2 * args.outFeatures <= args.inFeatures else tunables.SMALL_M_SPLIT_K_VALUE"},constants:{usesF16:true,scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",outFeatures:"args.outFeatures",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"',mSize:"args.M",splitK:"effectiveSmallMSplitK",writePartials:true},intermediates:[{id:"partials",dtype:"float32",shape:"[effectiveSmallMSplitK * args.M * args.outFeatures]"}],passes:[{id:"partials",name:"LlamaPrefillMatmulQ1SmallMSplitKPartials",shader:"prefill-matmul-q1-sg-small-m-wg64-n64.wgsl.jinja",bindings:"splitKPartials",dispatch:{x:"ceilDiv(args.outFeatures, 64)",y:"ceilDiv(args.M, 16)",z:"effectiveSmallMSplitK"},reads:["A","Q1Bits","Q1Scales"],writes:["partials"]},{id:"reduce",name:"LlamaPrefillMatmulQ1SmallMSplitKReduce",shader:"prefill-matmul-q1-small-m-splitk-reduce.wgsl.jinja",bindings:"splitKReduce",dispatch:{x:"ceilDiv(args.M * args.outFeatures, 256)"},reads:["partials"],writes:["Y"]}],requiredFeatures:["shader-f16","subgroups","chromium-experimental-subgroup-matrix"]},{id:"subgroup_matrix_small_m_n128_splitk_wg128",priority:114,when:["not present.realLenT","tunables.SMALL_M_N128_SPLIT_K == 1 and (args.outFeatures >= args.inFeatures or 4 * args.outFeatures <= args.inFeatures)",'device.features.has("shader-f16")','device.features.has("subgroups")','device.features.has("chromium-experimental-subgroup-matrix")',"sgmatSubgroup32","baseContract","args.M <= 16","args.inFeatures % (512 if args.outFeatures >= args.inFeatures else 1024) == 0","args.outFeatures % 128 == 0","ceilDiv(args.outFeatures, 128) <= device.limits.maxComputeWorkgroupsPerDimension","ceilDiv(args.M * args.outFeatures, 256) <= device.limits.maxComputeWorkgroupsPerDimension","ceilDiv(args.M, 16) <= device.limits.maxComputeWorkgroupsPerDimension"],derive:{effectiveN128SplitK:"tunables.SMALL_M_N128_EXPAND_SPLIT_K if args.outFeatures >= args.inFeatures else (tunables.SMALL_M_N128_NARROW_SPLIT_K if args.inFeatures >= 5120 else 8)"},constants:{usesF16:true,scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",outFeatures:"args.outFeatures",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"',mSize:"args.M",splitK:"effectiveN128SplitK"},intermediates:[{id:"partials",dtype:"float32",shape:"[effectiveN128SplitK * args.M * args.outFeatures]"}],passes:[{id:"partials",name:"LlamaPrefillMatmulQ1SmallMN128SplitKPartials",shader:"prefill-matmul-q1-sg-m16-n128-wg128.wgsl.jinja",bindings:"splitKPartials",dispatch:{x:"ceilDiv(args.outFeatures, 128)",y:"ceilDiv(args.M, 16)",z:"effectiveN128SplitK"},reads:["A","Q1Bits","Q1Scales"],writes:["partials"]},{id:"reduce",name:"LlamaPrefillMatmulQ1SmallMN128SplitKReduce",shader:"prefill-matmul-q1-small-m-splitk-reduce.wgsl.jinja",bindings:"splitKReduce",dispatch:{x:"ceilDiv(args.M * args.outFeatures, 256)"},reads:["partials"],writes:["Y"]}],requiredFeatures:["shader-f16","subgroups","chromium-experimental-subgroup-matrix"]},{id:"subgroup_matrix",priority:100,when:["not present.realLenT",'device.features.has("shader-f16")','device.features.has("subgroups")','device.features.has("chromium-experimental-subgroup-matrix")',"sgmatSubgroup32","baseContract","args.M > 8","args.outFeatures % 64 == 0","ceilDiv(args.outFeatures, 64) <= device.limits.maxComputeWorkgroupsPerDimension","ceilDiv(args.M, 32) <= device.limits.maxComputeWorkgroupsPerDimension"],constants:{scaleScalar:"dtypes.S",inFeatures:"args.inFeatures",outFeatures:"args.outFeatures",outStride:"args.outStride",dstColStart:"args.dstColStart if args.dstColStart else 0",yScalar:'"f16" if tensorDtypes.yT == "float16" else "f32"',aVec4:'"vec4<f16>" if tensorDtypes.aT == "float16" else "vec4<f32>"'},passes:[{id:"main",name:"LlamaPrefillMatmulQ1",shader:"prefill-matmul-q1-sg.wgsl.jinja",bindings:"portableQ1",dispatch:{x:"ceilDiv(args.outFeatures, 64)",y:"ceilDiv(args.M, 32)"},reads:["A","Q1Bits","Q1Scales"],writes:["Y"]}],requiredFeatures:["shader-f16","subgroups","chromium-experimental-subgroup-matrix"]}]},assets:[["prefill-matmul-q1-narrow.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const IN_WORDS: u32 = {{ inWords }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const OUT_TILES: u32 = {{ outTiles }}u;
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;
const IN_VEC4: u32 = {{ inVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials0: array<f32, 64>;
var<workgroup> partials1: array<f32, 64>;
var<workgroup> partials2: array<f32, 64>;
var<workgroup> partials3: array<f32, 64>;

{% include "ops/_shared/q1-dot-helpers.wgsl.jinja" %}

@compute @workgroup_size(64)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let t = wid.x;
  let lid = lid3.x;
  if (t >= params.m) {
    return;
  }
  let aBase = t * IN_VEC4;

  for (var tile = 0u; tile < OUT_TILES; tile = tile + 1u) {
    var acc0 = 0.0;
    var acc1 = 0.0;
    var acc2 = 0.0;
    var acc3 = 0.0;
    for (var word_index = lid; word_index < IN_WORDS; word_index = word_index + WORKGROUP_SIZE) {
      let col_block = word_index / 4u;
      let word_id = word_index % 4u;
      let base4 = aBase + word_index * 8u;
      let n0 = vec4<f32>(a[base4]);
      let n1 = vec4<f32>(a[base4 + 1u]);
      let n2 = vec4<f32>(a[base4 + 2u]);
      let n3 = vec4<f32>(a[base4 + 3u]);
      let n4 = vec4<f32>(a[base4 + 4u]);
      let n5 = vec4<f32>(a[base4 + 5u]);
      let n6 = vec4<f32>(a[base4 + 6u]);
      let n7 = vec4<f32>(a[base4 + 7u]);
      let dot4 = q1_dot_word_t4(params.block_offset, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
      acc0 += dot4.x;
      acc1 += dot4.y;
      acc2 += dot4.z;
      acc3 += dot4.w;
    }
{%- if useSubgroups %}
    let ss = subgroupAdd(vec4<f32>(acc0, acc1, acc2, acc3));
    if (WORKGROUP_SIZE == sg_size) {
      if (lid == 0u) {
        partials0[0] = ss.x;
        partials1[0] = ss.y;
        partials2[0] = ss.z;
        partials3[0] = ss.w;
      }
      workgroupBarrier();
    } else {
      if (sg_lid == 0u) {
        let subgroup_index = lid / sg_size;
        partials0[subgroup_index] = ss.x;
        partials1[subgroup_index] = ss.y;
        partials2[subgroup_index] = ss.z;
        partials3[subgroup_index] = ss.w;
      }
      workgroupBarrier();
      if (lid == 0u) {
        var total0 = 0.0;
        var total1 = 0.0;
        var total2 = 0.0;
        var total3 = 0.0;
        let subgroup_count = WORKGROUP_SIZE / sg_size;
        for (var i = 0u; i < subgroup_count; i = i + 1u) {
          total0 = total0 + partials0[i];
          total1 = total1 + partials1[i];
          total2 = total2 + partials2[i];
          total3 = total3 + partials3[i];
        }
        partials0[0] = total0;
        partials1[0] = total1;
        partials2[0] = total2;
        partials3[0] = total3;
      }
      workgroupBarrier();
    }
{%- else %}
    partials0[lid] = acc0;
    partials1[lid] = acc1;
    partials2[lid] = acc2;
    partials3[lid] = acc3;
    workgroupBarrier();

    var stride = WORKGROUP_SIZE / 2u;
    loop {
      if (lid < stride) {
        partials0[lid] = partials0[lid] + partials0[lid + stride];
        partials1[lid] = partials1[lid] + partials1[lid + stride];
        partials2[lid] = partials2[lid] + partials2[lid + stride];
        partials3[lid] = partials3[lid] + partials3[lid + stride];
      }
      workgroupBarrier();
      if (stride == 1u) {
        break;
      }
      stride = stride / 2u;
    }
{%- endif %}

    if (lid == 0u) {
      let yBase = t * OUT_STRIDE + DST_COL + tile * 4u;
      y[yBase + 0u] = {{ yScalar }}(partials0[0]);
      y[yBase + 1u] = {{ yScalar }}(partials1[0]);
      y[yBase + 2u] = {{ yScalar }}(partials2[0]);
      y[yBase + 3u] = {{ yScalar }}(partials3[0]);
    }

    workgroupBarrier();
  }
}
`],["prefill-matmul-q1-sg-m16-n128-wg128.wgsl.jinja",`enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);

{{ env.wgsl.resourceDeclarations }}

const K: u32 = {{ inFeatures }}u;
const K_V4: u32 = K / 4u;
const BPR_W: u32 = K / 32u;
const BPR128: u32 = K / 128u;
const SPLIT_K: u32 = {{ splitK }}u;
const WORDS_PER_SPLIT: u32 = BPR_W / SPLIT_K;
const TILE_ROWS: u32 = 16u;
const TILE_COLS: u32 = 128u;
const TILE_K: u32 = 32u;
const SG_SIZE: u32 = 32u;

var<workgroup> tile_A: array<f16, 16 * 32>;
var<workgroup> tile_B: array<f16, 128 * 32>;

var<workgroup> scratch: array<array<f32, 64>, 16>;

@compute @workgroup_size(128, 1, 1)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_index) local_idx: u32
) {
  let n0 = wid.x * TILE_COLS;
  let m0 = wid.y * TILE_ROWS;
  let subgroup_id = local_idx / SG_SIZE;
  let subgroup_col = subgroup_id * 32u;
  let split_id = wid.z;
  let first_word = split_id * WORDS_PER_SPLIT;

  var matC00: subgroup_matrix_result<f32, 8, 8>;
  var matC01: subgroup_matrix_result<f32, 8, 8>;
  var matC02: subgroup_matrix_result<f32, 8, 8>;
  var matC03: subgroup_matrix_result<f32, 8, 8>;
  var matC10: subgroup_matrix_result<f32, 8, 8>;
  var matC11: subgroup_matrix_result<f32, 8, 8>;
  var matC12: subgroup_matrix_result<f32, 8, 8>;
  var matC13: subgroup_matrix_result<f32, 8, 8>;

  let a_row = local_idx / 8u;
  let a_quad = local_idx % 8u;

  let row = n0 + local_idx;
  let tile = row / 4u;
  let rit = row % 4u;
  let group_base = params.block_offset + tile * BPR128 * 4u;

  for (var slice_word = 0u; slice_word < WORDS_PER_SPLIT; slice_word = slice_word + 1u) {
    let kb = first_word + slice_word;
    var av = vec4<f32>(0.0);
    if (m0 + a_row < params.m) {
      av = vec4<f32>(a[(m0 + a_row) * K_V4 + kb * 8u + a_quad]);
    }
    let abase = a_row * TILE_K + a_quad * 4u;
    tile_A[abase] = f16(av.x);
    tile_A[abase + 1u] = f16(av.y);
    tile_A[abase + 2u] = f16(av.z);
    tile_A[abase + 3u] = f16(av.w);

    let col_block = kb / 4u;
    let word_id = kb % 4u;
    let idx = group_base + col_block * 4u + word_id;
    let sign_word = q1_bits[idx * 4u + rit];
    let scale = f16(f32(q1_scales[group_base + col_block * 4u + rit]));
    let neg = -scale;
    let bbase = local_idx * TILE_K;
    for (var j = 0u; j < TILE_K; j = j + 1u) {
      tile_B[bbase + j] = select(neg, scale, ((sign_word >> j) & 1u) == 1u);
    }
    workgroupBarrier();

    for (var step = 0u; step < TILE_K; step = step + 8u) {
      let matA0 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, step, false, TILE_K);
      let matA1 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, 8u * TILE_K + step, false, TILE_K);
      let boff = subgroup_col * TILE_K + step;
      let matB0 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff, true, TILE_K);
      let matB1 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 8u * TILE_K, true, TILE_K);
      let matB2 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 16u * TILE_K, true, TILE_K);
      let matB3 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 24u * TILE_K, true, TILE_K);
      matC00 = subgroupMatrixMultiplyAccumulate(matA0, matB0, matC00);
      matC01 = subgroupMatrixMultiplyAccumulate(matA0, matB1, matC01);
      matC02 = subgroupMatrixMultiplyAccumulate(matA0, matB2, matC02);
      matC03 = subgroupMatrixMultiplyAccumulate(matA0, matB3, matC03);
      matC10 = subgroupMatrixMultiplyAccumulate(matA1, matB0, matC10);
      matC11 = subgroupMatrixMultiplyAccumulate(matA1, matB1, matC11);
      matC12 = subgroupMatrixMultiplyAccumulate(matA1, matB2, matC12);
      matC13 = subgroupMatrixMultiplyAccumulate(matA1, matB3, matC13);
    }
    workgroupBarrier();
  }

  if (subgroup_id < 2u) {
    let bank = subgroup_id * 8u;
    subgroupMatrixStore(&scratch[bank], 0u, matC00, false, 8u);
    subgroupMatrixStore(&scratch[bank + 1u], 0u, matC01, false, 8u);
    subgroupMatrixStore(&scratch[bank + 2u], 0u, matC02, false, 8u);
    subgroupMatrixStore(&scratch[bank + 3u], 0u, matC03, false, 8u);
    subgroupMatrixStore(&scratch[bank + 4u], 0u, matC10, false, 8u);
    subgroupMatrixStore(&scratch[bank + 5u], 0u, matC11, false, 8u);
    subgroupMatrixStore(&scratch[bank + 6u], 0u, matC12, false, 8u);
    subgroupMatrixStore(&scratch[bank + 7u], 0u, matC13, false, 8u);
  }
  workgroupBarrier();

  for (var i = local_idx; i < TILE_ROWS * 64u; i = i + 128u) {
    let r = i / 64u;
    let c = i % 64u;
    if (m0 + r < params.m) {
      let b = (c / 32u) * 8u + (r / 8u) * 4u + ((c % 32u) / 8u);
      let e = (r % 8u) * 8u + (c % 8u);
      partials[(split_id * params.m + m0 + r) * {{ outFeatures }}u + n0 + c] = scratch[b][e];
    }
  }
  workgroupBarrier();

  if (subgroup_id >= 2u) {
    let bank = (subgroup_id - 2u) * 8u;
    subgroupMatrixStore(&scratch[bank], 0u, matC00, false, 8u);
    subgroupMatrixStore(&scratch[bank + 1u], 0u, matC01, false, 8u);
    subgroupMatrixStore(&scratch[bank + 2u], 0u, matC02, false, 8u);
    subgroupMatrixStore(&scratch[bank + 3u], 0u, matC03, false, 8u);
    subgroupMatrixStore(&scratch[bank + 4u], 0u, matC10, false, 8u);
    subgroupMatrixStore(&scratch[bank + 5u], 0u, matC11, false, 8u);
    subgroupMatrixStore(&scratch[bank + 6u], 0u, matC12, false, 8u);
    subgroupMatrixStore(&scratch[bank + 7u], 0u, matC13, false, 8u);
  }
  workgroupBarrier();

  for (var i = local_idx; i < TILE_ROWS * 64u; i = i + 128u) {
    let r = i / 64u;
    let c = i % 64u;
    let out_c = 64u + c;
    if (m0 + r < params.m) {
      let b = (c / 32u) * 8u + (r / 8u) * 4u + ((c % 32u) / 8u);
      let e = (r % 8u) * 8u + (c % 8u);
      partials[(split_id * params.m + m0 + r) * {{ outFeatures }}u + n0 + out_c] = scratch[b][e];
    }
  }
}
`],["prefill-matmul-q1-sg-small-m-wg64-n64.wgsl.jinja",`enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);

{{ env.wgsl.resourceDeclarations }}

const K: u32 = {{ inFeatures }}u;
const K_V4: u32 = K / 4u;
const BPR_W: u32 = K / 32u;
const BPR128: u32 = K / 128u;
const SPLIT_K: u32 = {{ splitK }}u;
const WORDS_PER_SPLIT: u32 = BPR_W / SPLIT_K;
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;
const TILE_ROWS: u32 = 16u;
const TILE_COLS: u32 = 64u;
const TILE_K: u32 = 32u;
const SG_SIZE: u32 = 32u;

var<workgroup> tile_A: array<f16, 16 * 32>;
var<workgroup> tile_B: array<f16, 64 * 32>;

var<workgroup> scratch: array<array<f32, 64>, 16>;

@compute @workgroup_size(64, 1, 1)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_index) local_idx: u32
) {
  let n0 = wid.x * TILE_COLS;
  let m0 = wid.y * TILE_ROWS;
  let subgroup_id = local_idx / SG_SIZE;
  let subgroup_col = subgroup_id * 32u;
  let split_id = wid.z;
  let first_word = split_id * WORDS_PER_SPLIT;

  var matC00: subgroup_matrix_result<f32, 8, 8>;
  var matC01: subgroup_matrix_result<f32, 8, 8>;
  var matC02: subgroup_matrix_result<f32, 8, 8>;
  var matC03: subgroup_matrix_result<f32, 8, 8>;
  var matC10: subgroup_matrix_result<f32, 8, 8>;
  var matC11: subgroup_matrix_result<f32, 8, 8>;
  var matC12: subgroup_matrix_result<f32, 8, 8>;
  var matC13: subgroup_matrix_result<f32, 8, 8>;

  let a_row = local_idx / 4u;
  let a_quad = (local_idx % 4u) * 2u;

  let row = n0 + local_idx;
  let tile = row / 4u;
  let rit = row % 4u;
  let group_base = params.block_offset + tile * BPR128 * 4u;

  for (var slice_word = 0u; slice_word < WORDS_PER_SPLIT; slice_word = slice_word + 1u) {
    let kb = first_word + slice_word;
    var av0 = vec4<f32>(0.0);
    var av1 = vec4<f32>(0.0);
    if (m0 + a_row < params.m) {
      av0 = vec4<f32>(a[(m0 + a_row) * K_V4 + kb * 8u + a_quad]);
      av1 = vec4<f32>(a[(m0 + a_row) * K_V4 + kb * 8u + a_quad + 1u]);
    }
    let abase = a_row * TILE_K + a_quad * 4u;
    tile_A[abase] = f16(av0.x);
    tile_A[abase + 1u] = f16(av0.y);
    tile_A[abase + 2u] = f16(av0.z);
    tile_A[abase + 3u] = f16(av0.w);
    tile_A[abase + 4u] = f16(av1.x);
    tile_A[abase + 5u] = f16(av1.y);
    tile_A[abase + 6u] = f16(av1.z);
    tile_A[abase + 7u] = f16(av1.w);

    let col_block = kb / 4u;
    let word_id = kb % 4u;
    let idx = group_base + col_block * 4u + word_id;
    let sign_word = q1_bits[idx * 4u + rit];
    let scale = f16(f32(q1_scales[group_base + col_block * 4u + rit]));
    let neg = -scale;
    let bbase = local_idx * TILE_K;
    for (var j = 0u; j < TILE_K; j = j + 1u) {
      tile_B[bbase + j] = select(neg, scale, ((sign_word >> j) & 1u) == 1u);
    }
    workgroupBarrier();

    for (var step = 0u; step < TILE_K; step = step + 8u) {
      let matA0 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, step, false, TILE_K);
      let matA1 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, 8u * TILE_K + step, false, TILE_K);
      let boff = subgroup_col * TILE_K + step;
      let matB0 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff, true, TILE_K);
      let matB1 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 8u * TILE_K, true, TILE_K);
      let matB2 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 16u * TILE_K, true, TILE_K);
      let matB3 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 24u * TILE_K, true, TILE_K);
      matC00 = subgroupMatrixMultiplyAccumulate(matA0, matB0, matC00);
      matC01 = subgroupMatrixMultiplyAccumulate(matA0, matB1, matC01);
      matC02 = subgroupMatrixMultiplyAccumulate(matA0, matB2, matC02);
      matC03 = subgroupMatrixMultiplyAccumulate(matA0, matB3, matC03);
      matC10 = subgroupMatrixMultiplyAccumulate(matA1, matB0, matC10);
      matC11 = subgroupMatrixMultiplyAccumulate(matA1, matB1, matC11);
      matC12 = subgroupMatrixMultiplyAccumulate(matA1, matB2, matC12);
      matC13 = subgroupMatrixMultiplyAccumulate(matA1, matB3, matC13);
    }
    workgroupBarrier();
  }

  let bank = subgroup_id * 8u;
  subgroupMatrixStore(&scratch[bank], 0u, matC00, false, 8u);
  subgroupMatrixStore(&scratch[bank + 1u], 0u, matC01, false, 8u);
  subgroupMatrixStore(&scratch[bank + 2u], 0u, matC02, false, 8u);
  subgroupMatrixStore(&scratch[bank + 3u], 0u, matC03, false, 8u);
  subgroupMatrixStore(&scratch[bank + 4u], 0u, matC10, false, 8u);
  subgroupMatrixStore(&scratch[bank + 5u], 0u, matC11, false, 8u);
  subgroupMatrixStore(&scratch[bank + 6u], 0u, matC12, false, 8u);
  subgroupMatrixStore(&scratch[bank + 7u], 0u, matC13, false, 8u);
  workgroupBarrier();

  for (var i = local_idx; i < TILE_ROWS * TILE_COLS; i = i + 64u) {
    let r = i / TILE_COLS;
    let c = i % TILE_COLS;
    if (m0 + r < params.m) {
      let b = (c / 32u) * 8u + (r / 8u) * 4u + ((c % 32u) / 8u);
      let e = (r % 8u) * 8u + (c % 8u);
{%- if writePartials %}
      partials[(split_id * params.m + m0 + r) * {{ outFeatures }}u + n0 + c] = scratch[b][e];
{%- else %}
      y[(m0 + r) * OUT_STRIDE + DST_COL + n0 + c] = {{ yScalar }}(scratch[b][e]);
{%- endif %}
    }
  }
}
`],["prefill-matmul-q1-sg.wgsl.jinja",`enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);

{{ env.wgsl.resourceDeclarations }}

const K: u32 = {{ inFeatures }}u;
const K_V4: u32 = K / 4u;
const N: u32 = {{ outFeatures }}u;
const BPR_W: u32 = K / 32u;
const BPR128: u32 = K / 128u;
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;
const TILE_ROWS: u32 = 32u;
const TILE_COLS: u32 = 64u;
const TILE_K: u32 = 32u;
const SUB_ROWS: u32 = 16u;
const SUB_COLS: u32 = 32u;

var<workgroup> tile_A: array<f16, 32 * 32>;
var<workgroup> tile_B: array<f16, 64 * 32>;

var<workgroup> scratch: array<array<f32, 64>, 32>;

@compute @workgroup_size(128, 1, 1)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_index) local_idx: u32,
  @builtin(subgroup_size) sg_size: u32
) {
  let m0 = wid.y * TILE_ROWS;
  let n0 = wid.x * TILE_COLS;

  let subtile_id = local_idx / sg_size;
  let subtile_idx = subtile_id / 2u;
  let subtile_idy = subtile_id % 2u;
  let base_A = subtile_idy * SUB_ROWS;
  let base_B = subtile_idx * SUB_COLS;

  var matC00: subgroup_matrix_result<f32, 8, 8>;
  var matC01: subgroup_matrix_result<f32, 8, 8>;
  var matC02: subgroup_matrix_result<f32, 8, 8>;
  var matC03: subgroup_matrix_result<f32, 8, 8>;
  var matC10: subgroup_matrix_result<f32, 8, 8>;
  var matC11: subgroup_matrix_result<f32, 8, 8>;
  var matC12: subgroup_matrix_result<f32, 8, 8>;
  var matC13: subgroup_matrix_result<f32, 8, 8>;

  let am = local_idx / 4u;
  let aq = (local_idx % 4u) * 2u;

  let l = local_idx & 63u;
  let row = n0 + l;
  let tile = row / 4u;
  let rit = row % 4u;
  let group_base = params.block_offset + tile * BPR128 * 4u;

  for (var kb = 0u; kb < BPR_W; kb = kb + 1u) {

    var av0 = vec4<f32>(0.0);
    var av1 = vec4<f32>(0.0);
    if (m0 + am < params.m) {
      av0 = vec4<f32>(a[(m0 + am) * K_V4 + kb * 8u + aq]);
      av1 = vec4<f32>(a[(m0 + am) * K_V4 + kb * 8u + aq + 1u]);
    }
    let abase = am * TILE_K + aq * 4u;
    tile_A[abase] = f16(av0.x);
    tile_A[abase + 1u] = f16(av0.y);
    tile_A[abase + 2u] = f16(av0.z);
    tile_A[abase + 3u] = f16(av0.w);
    tile_A[abase + 4u] = f16(av1.x);
    tile_A[abase + 5u] = f16(av1.y);
    tile_A[abase + 6u] = f16(av1.z);
    tile_A[abase + 7u] = f16(av1.w);

    if (local_idx < 64u) {
      let col_block = kb / 4u;
      let word_id = kb % 4u;
      let idx = group_base + col_block * 4u + word_id;
      let sign_word = q1_bits[idx * 4u + rit];
      let scale = f16(f32(q1_scales[group_base + col_block * 4u + rit]));
      let neg = -scale;
      let bbase = l * TILE_K;

      for (var j = 0u; j < 32u; j = j + 1u) {
        tile_B[bbase + j] = select(neg, scale, ((sign_word >> j) & 1u) == 1u);
      }
    }
    workgroupBarrier();

    for (var step = 0u; step < TILE_K; step = step + 8u) {
      let matA0 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, (base_A + 0u) * TILE_K + step, false, TILE_K);
      let matA1 = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, (base_A + 8u) * TILE_K + step, false, TILE_K);
      let boff = base_B * TILE_K + step;
      let matB0 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff, true, TILE_K);
      let matB1 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 8u * TILE_K, true, TILE_K);
      let matB2 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 16u * TILE_K, true, TILE_K);
      let matB3 = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, boff + 24u * TILE_K, true, TILE_K);
      matC00 = subgroupMatrixMultiplyAccumulate(matA0, matB0, matC00);
      matC01 = subgroupMatrixMultiplyAccumulate(matA0, matB1, matC01);
      matC02 = subgroupMatrixMultiplyAccumulate(matA0, matB2, matC02);
      matC03 = subgroupMatrixMultiplyAccumulate(matA0, matB3, matC03);
      matC10 = subgroupMatrixMultiplyAccumulate(matA1, matB0, matC10);
      matC11 = subgroupMatrixMultiplyAccumulate(matA1, matB1, matC11);
      matC12 = subgroupMatrixMultiplyAccumulate(matA1, matB2, matC12);
      matC13 = subgroupMatrixMultiplyAccumulate(matA1, matB3, matC13);
    }
    workgroupBarrier();
  }

  let bank = subtile_id * 8u;
  subgroupMatrixStore(&scratch[bank + 0u], 0u, matC00, false, 8u);
  subgroupMatrixStore(&scratch[bank + 1u], 0u, matC01, false, 8u);
  subgroupMatrixStore(&scratch[bank + 2u], 0u, matC02, false, 8u);
  subgroupMatrixStore(&scratch[bank + 3u], 0u, matC03, false, 8u);
  subgroupMatrixStore(&scratch[bank + 4u], 0u, matC10, false, 8u);
  subgroupMatrixStore(&scratch[bank + 5u], 0u, matC11, false, 8u);
  subgroupMatrixStore(&scratch[bank + 6u], 0u, matC12, false, 8u);
  subgroupMatrixStore(&scratch[bank + 7u], 0u, matC13, false, 8u);
  workgroupBarrier();

  for (var i = local_idx; i < TILE_ROWS * TILE_COLS; i = i + 128u) {
    let r = i / TILE_COLS;
    let c = i % TILE_COLS;
    if (m0 + r < params.m) {

      let b = (c / 32u) * 16u + (r / 16u) * 8u + ((r % 16u) / 8u) * 4u + ((c % 32u) / 8u);
      let e = (r % 8u) * 8u + (c % 8u);
      y[(m0 + r) * OUT_STRIDE + DST_COL + n0 + c] = {{ yScalar }}(scratch[b][e]);
    }
  }
}
`],["prefill-matmul-q1-small-m-splitk-reduce.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const M: u32 = {{ mSize }}u;
const N: u32 = {{ outFeatures }}u;
const SPLIT_K: u32 = {{ splitK }}u;
const OUT_STRIDE: u32 = {{ outStride }}u;
const DST_COL: u32 = {{ dstColStart }}u;

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let output_index = gid.x;
  if (output_index >= M * N) {
    return;
  }

  var sum = 0.0;
  for (var split = 0u; split < SPLIT_K; split = split + 1u) {
    sum += partials[split * M * N + output_index];
  }

  let row = output_index / N;
  let col = output_index % N;
  y[row * OUT_STRIDE + DST_COL + col] = {{ yScalar }}(sum);
}
`]]}],["com.xenova.LlamaPrefillQkNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillQkNorm",sinceVersion:1,inputs:[{role:"Qkv",dtype:"A",rank:2},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Qkv",dtype:"A",rank:2,shape:["args.seqLen","args.qkvStride"]}],typeConstraints:{A:["float32","float16"],W:["float32","float16"]},args:{qkvT:{kind:"tensor",semantic:"Qkv",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},qNormOffset:{kind:"u32",semantic:"q_norm_offset"},kNormOffset:{kind:"u32",semantic:"k_norm_offset"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},seqLen:{kind:"u32",semantic:"seq_len"},qkvStride:{kind:"u32",semantic:"qkv_stride"},rmsEps:{kind:"f32",semantic:"rms_eps"}},variants:[{id:"scalar",priority:0,when:["ranks.qkvT == 2","ranks.weightsT == 1",'(tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.qkvT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.seqLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.qkvStride == (args.numHeads + 2 * args.numKvHeads) * args.headDim","dim(shapes.qkvT, 1) == args.qkvStride","numel(shapes.qkvT) >= args.seqLen * args.qkvStride","numel(shapes.weightsT) >= args.qNormOffset + args.headDim","numel(shapes.weightsT) >= args.kNormOffset + args.headDim"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.weightsT == "float16"',activationScalar:"dtypes.A",weightScalar:"dtypes.W",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",headDim:"args.headDim",qHidden:"args.numHeads * args.headDim",qkvStride:"args.qkvStride",seqLen:"args.seqLen",rmsEps:"args.rmsEps",qNormOffset:"args.qNormOffset",kNormOffset:"args.kNormOffset"},passes:[{id:"main",name:"LlamaPrefillQkNorm",shader:"prefill-qk-norm.wgsl.jinja",bindings:[{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"}],dispatch:{x:"args.numHeads + args.numKvHeads",y:"args.seqLen"},reads:["Qkv","Weights"],writes:["Qkv"]}]}]},assets:[["prefill-qk-norm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const Q_HIDDEN: u32 = {{ qHidden }}u;
const QKV_STRIDE: u32 = {{ qkvStride }}u;
const SEQ_LEN: u32 = {{ seqLen }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_Q_NORM: u32 = {{ qNormOffset }}u;
const W_K_NORM: u32 = {{ kNormOffset }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials: array<f32, 64>;

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let t = wid.y;
  if (t >= SEQ_LEN) {
    return;
  }
  let head_index = wid.x;
  let lid = lid3.x;
  let is_k = head_index >= NUM_HEADS;
  let head = select(head_index, head_index - NUM_HEADS, is_k);
  if (is_k && head >= NUM_KV_HEADS) {
    return;
  }
  let region = select(0u, Q_HIDDEN, is_k);
  let base = t * QKV_STRIDE + region + head * HEAD_DIM;
  let norm_off = select(W_Q_NORM, W_K_NORM, is_k);

  var sum = 0.0;
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let x = f32(qkv[base + d]);
    sum = fma(x, x, sum);
  }
  partials[lid] = sum;
  workgroupBarrier();
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = partials[lid] + partials[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
  let scale = inverseSqrt(partials[0] / f32(HEAD_DIM) + RMS_EPS);

  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let x = f32(qkv[base + d]);
    qkv[base + d] = {{ activationScalar }}(x * scale * f32(weights[norm_off + d]));
  }
}
`]]}],["com.xenova.LlamaPrefillRmsNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillRmsNorm",sinceVersion:1,inputs:[{role:"X",dtype:"X",rank:2},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Y",dtype:"Y",rank:2,shape:["args.rows","args.dim"]}],typeConstraints:{X:["float32","float16"],W:["float32","float16"],Y:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},yT:{kind:"tensor",semantic:"Y",role:"output"},normOffset:{kind:"u32",semantic:"norm_offset"},rows:{kind:"u32",semantic:"rows"},dim:{kind:"u32",semantic:"dim"},eps:{kind:"f32",semantic:"eps"}},variants:[{id:"scalar",priority:0,when:["ranks.xT == 2","ranks.weightsT == 1","ranks.yT == 2",'(tensorDtypes.xT == "float32" or tensorDtypes.xT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.yT == "float32" or tensorDtypes.yT == "float16")','((tensorDtypes.xT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.yT != "float16") or device.features.has("shader-f16"))',"args.rows > 0","args.dim > 0","numel(shapes.xT) >= args.rows * args.dim","numel(shapes.yT) >= args.rows * args.dim"],constants:{usesF16:'tensorDtypes.xT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.yT == "float16"',xScalar:"dtypes.X",wScalar:"dtypes.W",yScalar:"dtypes.Y",dim:"args.dim"},passes:[{id:"main",name:"LlamaPrefillRmsNorm",shader:"prefill-rms-norm.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"norm_offset",type:"u32",value:"args.normOffset"},{name:"rows",type:"u32",value:"args.rows"},{name:"eps",type:"f32",value:"args.eps"}]}}],dispatch:{workgroups:"args.rows"},reads:["X","Weights"],writes:["Y"]}]}]},assets:[["prefill-rms-norm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const DIM: u32 = {{ dim }}u;
const WG: u32 = 256u;

var<workgroup> partials: array<f32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {

  let row = wid.x + wid.y * nwg.x;
  if (row >= params.rows) {
    return;
  }
  let lid = lid3.x;
  let base = row * DIM;

  var sum = 0.0;
  for (var d = lid; d < DIM; d = d + WG) {
    let v = f32(x[base + d]);
    sum = sum + v * v;
  }
  partials[lid] = sum;
  workgroupBarrier();

  var stride = WG / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = partials[lid] + partials[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  let scale = inverseSqrt(partials[0] / f32(DIM) + params.eps);
  for (var d = lid; d < DIM; d = d + WG) {
    y[base + d] = {{ yScalar }}(f32(x[base + d]) * scale * f32(weights[params.norm_offset + d]));
  }
}
`]]}],["com.xenova.Qwen35DecodeFullAttention",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35DecodeFullAttention",sinceVersion:1,inputs:[{role:"Q",dtype:"float32",rank:1},{role:"Gate",dtype:"float32",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],outputs:[{role:"Attn",dtype:"float32",rank:1,shape:["args.numHeads * args.headDim"]}],typeConstraints:{C:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"input"},gateT:{kind:"tensor",semantic:"Gate",role:"input"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"input"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"input"},attnT:{kind:"tensor",semantic:"Attn",role:"output"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:false},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},scale:{kind:"f32",semantic:"scale"}},tunables:{WORKGROUP_SIZE:256},variants:[{id:"splitk",priority:20,when:["ranks.qT == 1","ranks.gateT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","ranks.attnT == 1",'tensorDtypes.qT == "float32"','tensorDtypes.gateT == "float32"','tensorDtypes.attnT == "float32"',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")',"f16Ok(tensorDtypes.cacheKeysT)","args.cacheLen > 0","(args.pastLen if args.pastLen else 0) < args.cacheLen","args.numHeads > 0","args.numKvHeads > 0","args.numHeads % args.numKvHeads == 0","args.headDim > 0","args.headDim % 4 == 0","args.headDim <= 1024","dim(shapes.qT, 0) == args.numHeads * args.headDim","dim(shapes.gateT, 0) == args.numHeads * args.headDim","dim(shapes.attnT, 0) == args.numHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim"],derive:{numSplits:"8"},constants:{usesF16:'tensorDtypes.cacheKeysT == "float16"',cacheVec4:'"vec4<f16>" if tensorDtypes.cacheKeysT == "float16" else "vec4<f32>"',scalar:'"f32"',qNumHeads:"args.numHeads",kvNumHeads:"args.numKvHeads",headDim:"args.headDim",headDimV4:"args.headDim / 4",numSplits:"numSplits",layer:"args.layer",cacheLen:"args.cacheLen",scale:"args.scale",hasBias:false,hasGate:true,hasWindow:false,useSubgroups:false,combineSubgroups:false},intermediates:[{id:"partialOut",dtype:"float32",shape:"[args.numHeads * numSplits * args.headDim]"},{id:"partialMax",dtype:"float32",shape:"[args.numHeads * numSplits]"},{id:"partialDenom",dtype:"float32",shape:"[args.numHeads * numSplits]"}],passes:[{id:"partial",name:"Qwen35DecodeFullAttention.SplitK",source:{kind:"template",shader:"ops/_shared/attn-flash-decode-splitk.wgsl.jinja",inputs:{layout:'"layer_cache"'}},bindings:[{name:"query",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"key",arg:"cacheKeysT",semantic:"CacheKeys",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheVec4"},{name:"value",arg:"cacheValuesT",semantic:"CacheValues",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheVec4"},{name:"partial_out",semantic:"partialOut",role:"scratch",buffer:{type:"storage"},elementType:"vec4<f32>"},{name:"partial_max",semantic:"partialMax",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"partial_denom",semantic:"partialDenom",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"numSplits",y:"args.numHeads",z:1},reads:["Q","CacheKeys","CacheValues"],writes:["partialOut","partialMax","partialDenom"]},{id:"merge",name:"Qwen35DecodeFullAttention.SplitKMerge",source:{kind:"template",shader:"ops/_shared/attn-flash-decode-splitk-merge.wgsl.jinja",inputs:{layout:'"layer_cache"'}},bindings:[{name:"partial_out",semantic:"partialOut",role:"scratch",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"partial_max",semantic:"partialMax",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"partial_denom",semantic:"partialDenom",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"gate",arg:"gateT",semantic:"Gate",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"output",arg:"attnT",semantic:"Attn",role:"output",buffer:{type:"storage"},elementType:"vec4<f32>"}],dispatch:{x:1,y:"args.numHeads",z:1},reads:["partialOut","partialMax","partialDenom","Gate"],writes:["Attn"]}]},{id:"scalar",priority:0,when:["ranks.qT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)",'tensorDtypes.qT == "float32"',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")',"f16Ok(tensorDtypes.cacheKeysT)","args.cacheLen > 0","(args.pastLen if args.pastLen else 0) < args.cacheLen","args.numHeads > 0","args.numKvHeads > 0","args.numHeads % args.numKvHeads == 0","args.headDim > 0","dim(shapes.qT, 0) == args.numHeads * args.headDim","dim(shapes.gateT, 0) == args.numHeads * args.headDim","dim(shapes.attnT, 0) == args.numHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim"],constants:{usesF16:'tensorDtypes.cacheKeysT == "float16"',cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",numKvGroups:"args.numHeads / args.numKvHeads",headDim:"args.headDim",scale:"args.scale"},passes:[{id:"main",name:"Qwen35DecodeFullAttention",shader:"decode-full-attention.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"gate",arg:"gateT",semantic:"Gate",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads"},reads:["Q","Gate","CacheKeys","CacheValues"],writes:["Attn"]}]}]},assets:[["decode-full-attention.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const NUM_KV_GROUPS: u32 = {{ numKvGroups }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const ATTN_SCALING: f32 = {{ scale }};
const WORKGROUP_SIZE: u32 = 128u;

const SCORE_TILE: u32 = {{ cacheLen if cacheLen < 4096 else 4096 }}u;
var<workgroup> scores: array<f32, {{ cacheLen if cacheLen < 4096 else 4096 }}>;
var<workgroup> partials: array<f32, 128>;
var<workgroup> run_m: f32;
var<workgroup> run_l: f32;

{% include "ops/_shared/kv-cache-index.wgsl.jinja" %}

@compute @workgroup_size(128)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let head = wid.x;
  let lid = lid3.x;
  if (head >= NUM_HEADS || params.past_len >= CACHE_LEN) { return; }
  let kv_head = head / NUM_KV_GROUPS;
  let q_base = head * HEAD_DIM;

  if (lid == 0u) { run_m = -3.4028234663852886e+38; run_l = 0.0; }
  var acc: array<f32, {{ ((headDim + 127) / 128) | int }}>;
  for (var a = 0u; a < {{ ((headDim + 127) / 128) | int }}u; a = a + 1u) { acc[a] = 0.0; }
  workgroupBarrier();

  let total = params.past_len + 1u;
  var tile_start = 0u;
  loop {
    if (tile_start >= total) { break; }
    let tile_len = min(SCORE_TILE, total - tile_start);

    var local_max = -3.4028234663852886e+38;
    for (var i = lid; i < tile_len; i = i + WORKGROUP_SIZE) {
      let src = tile_start + i;
      var score = 0.0;
      for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
        score = fma(q[q_base + d], f32(cache_keys[cache_index(src, kv_head, d)]), score);
      }
      score = score * ATTN_SCALING;
      scores[i] = score;
      local_max = max(local_max, score);
    }
    partials[lid] = local_max;
    workgroupBarrier();
    var stride = WORKGROUP_SIZE / 2u;
    loop {
      if (lid < stride) { partials[lid] = max(partials[lid], partials[lid + stride]); }
      workgroupBarrier();
      if (stride == 1u) { break; }
      stride = stride / 2u;
    }
    let tile_max = partials[0];
    workgroupBarrier();

    let m_old = run_m;
    let new_m = max(m_old, tile_max);
    let corr = exp(m_old - new_m);

    var local_denom = 0.0;
    for (var i = lid; i < tile_len; i = i + WORKGROUP_SIZE) {
      let e = exp(scores[i] - new_m);
      scores[i] = e;
      local_denom = local_denom + e;
    }
    partials[lid] = local_denom;
    workgroupBarrier();
    stride = WORKGROUP_SIZE / 2u;
    loop {
      if (lid < stride) { partials[lid] = partials[lid] + partials[lid + stride]; }
      workgroupBarrier();
      if (stride == 1u) { break; }
      stride = stride / 2u;
    }
    let tile_denom = partials[0];
    workgroupBarrier();

{% for a in range(((headDim + 127) / 128) | int) %}
    {
      let d = lid + {{ a * 128 }}u;
      if (d < HEAD_DIM) {
        var s = 0.0;
        for (var i = 0u; i < tile_len; i = i + 1u) {
          s = fma(scores[i], f32(cache_values[cache_index(tile_start + i, kv_head, d)]), s);
        }
        acc[{{ a }}] = acc[{{ a }}] * corr + s;
      }
    }
{% endfor %}
    if (lid == 0u) {
      run_l = run_l * corr + tile_denom;
      run_m = new_m;
    }
    workgroupBarrier();
    tile_start = tile_start + SCORE_TILE;
  }

  let denom = run_l;
{% for a in range(((headDim + 127) / 128) | int) %}
  {
    let d = lid + {{ a * 128 }}u;
    if (d < HEAD_DIM) {

      attn_out[q_base + d] = (acc[{{ a }}] / denom) * (1.0 / (1.0 + exp(-gate[q_base + d])));
    }
  }
{% endfor %}
}
`]]}],["com.xenova.Qwen35DecodeFullQkv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35DecodeFullQkv",sinceVersion:1,inputs:[{role:"Normed",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1,optional:true},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true},{role:"Q4Bits",dtype:"uint32",rank:1,optional:true},{role:"Q4Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"Q",dtype:"float32",rank:1,shape:["args.qSize"]},{role:"QGate",dtype:"float32",rank:1,shape:["args.qSize"]},{role:"K",dtype:"float32",rank:1,shape:["args.kvSize"]},{role:"V",dtype:"float32",rank:1,shape:["args.kvSize"]}],tunables:{DENSE_WORKGROUP_SIZE:64,Q4_WORKGROUP_SIZE:32,Q1_WORKGROUP_SIZE:64},typeConstraints:{W:["float32","float16"],S:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights",required:false},qT:{kind:"tensor",semantic:"Q",role:"output"},qGateT:{kind:"tensor",semantic:"QGate",role:"output"},kT:{kind:"tensor",semantic:"K",role:"output"},vT:{kind:"tensor",semantic:"V",role:"output"},qSize:{kind:"u32",semantic:"attention_size"},kvSize:{kind:"u32",semantic:"kv_size"},headDim:{kind:"u32",semantic:"head_dim"},hiddenSize:{kind:"u32",semantic:"hidden_size"},qOffset:{kind:"u32",semantic:"q_proj_offset"},kOffset:{kind:"u32",semantic:"k_proj_offset"},vOffset:{kind:"u32",semantic:"v_proj_offset"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights",required:false},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights",required:false},format:{kind:"string",semantic:"packed_quant_format",required:false,oneOf:["q4_0","q4_k","q8_0","iq","lut32","lut16"]},lut:{kind:"u32",semantic:"dequant_lut_id",required:false}},derive:{fmt:'args.format if args.format else "q4_0"',quantBits:'8 if (fmt == "q8_0" or fmt == "iq") else 4',hasMin:'1 if fmt == "q4_k" else 0',iq:'1 if fmt == "iq" else 0',lut16:'1 if fmt == "lut16" else 0',deviceWorkgroupCap:"min(device.limits.maxComputeInvocationsPerWorkgroup, device.limits.maxComputeWorkgroupSizeX)",denseWorkgroupLimit:"min(tunables.DENSE_WORKGROUP_SIZE, deviceWorkgroupCap)",denseWorkgroupSize:"max(1, pow2ceil(denseWorkgroupLimit + 1) / 2)",q4WorkgroupLimit:"min(tunables.Q4_WORKGROUP_SIZE, deviceWorkgroupCap)",q4WorkgroupSize:"max(1, pow2ceil(q4WorkgroupLimit + 1) / 2)",q1WorkgroupLimit:"min(tunables.Q1_WORKGROUP_SIZE, deviceWorkgroupCap)",q1WorkgroupSize:"max(1, pow2ceil(q1WorkgroupLimit + 1) / 2)",denseResourcesFit:"denseWorkgroupSize * 4 <= device.limits.maxComputeWorkgroupStorageSize and 2 * args.qSize + 2 * args.kvSize <= device.limits.maxComputeWorkgroupsPerDimension",q4ResourcesFit:"q4WorkgroupSize * 4 <= device.limits.maxComputeWorkgroupStorageSize and 2 * args.qSize + 2 * args.kvSize <= device.limits.maxComputeWorkgroupsPerDimension",q1ResourcesFit:"q1WorkgroupSize * 16 <= device.limits.maxComputeWorkgroupStorageSize and ceilDiv(2 * args.qSize + 2 * args.kvSize, 4) <= device.limits.maxComputeWorkgroupsPerDimension"},variants:[{id:"q1",priority:0,when:["present.q1BitsT","ranks.normedT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1",'tensorDtypes.normedT == "float32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")',"f16Ok(tensorDtypes.q1ScalesT)","q1ResourcesFit","args.qSize > 0","args.kvSize > 0","args.headDim > 0","args.qSize % args.headDim == 0","args.headDim % 4 == 0","args.kvSize % 4 == 0","args.hiddenSize > 0","args.hiddenSize % 128 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.qT, 0) == args.qSize","dim(shapes.qGateT, 0) == args.qSize","dim(shapes.kT, 0) == args.kvSize","dim(shapes.vT, 0) == args.kvSize","dim(shapes.q1BitsT, 0) >= max(args.qOffset + 2 * args.qSize * (args.hiddenSize / 128), args.kOffset + args.kvSize * (args.hiddenSize / 128), args.vOffset + args.kvSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= max(args.qOffset + 2 * args.qSize * (args.hiddenSize / 128), args.kOffset + args.kvSize * (args.hiddenSize / 128), args.vOffset + args.kvSize * (args.hiddenSize / 128))"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16"',useSubgroups:'device.features.has("subgroups")',scaleScalar:"dtypes.S",workgroupSize:"q1WorkgroupSize",blocksPerRow:"args.hiddenSize / 128",inWords:"args.hiddenSize / 32",qSize:"args.qSize",kvSize:"args.kvSize",headDim:"args.headDim",total:"2 * args.qSize + 2 * args.kvSize",qOffset:"args.qOffset",kOffset:"args.kOffset",vOffset:"args.vOffset"},passes:[{id:"main",name:"Qwen35DecodeFullQkvQ1",shader:"decode-full-qkv-q1.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"q",arg:"qT",semantic:"Q",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"q_gate",arg:"qGateT",semantic:"QGate",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"ceil((2 * args.qSize + 2 * args.kvSize) / 4)"},reads:["Normed","Q1Bits","Q1Scales"],writes:["Q","QGate","K","V"]}]}]},assets:[["decode-full-qkv-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const BPR: u32 = {{ blocksPerRow }}u;
const IN_WORDS: u32 = {{ inWords }}u;
const Q_SIZE: u32 = {{ qSize }}u;
const KV_SIZE: u32 = {{ kvSize }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const TOTAL: u32 = {{ total }}u;
const W_Q_Q1: u32 = {{ qOffset }}u;
const W_K_Q1: u32 = {{ kOffset }}u;
const W_V_Q1: u32 = {{ vOffset }}u;
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, {{ workgroupSize }}>;
var<workgroup> partials1: array<f32, {{ workgroupSize }}>;
var<workgroup> partials2: array<f32, {{ workgroupSize }}>;
var<workgroup> partials3: array<f32, {{ workgroupSize }}>;

{% include "ops/_shared/q1-dot-helpers.wgsl.jinja" %}

@compute @workgroup_size({{ workgroupSize }})
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let index0 = wid.x * TILE_ROWS;
  let lid = lid3.x;
  if (index0 >= TOTAL) {
    return;
  }

  var block_offset = W_Q_Q1;
  var row0 = index0;
  if (index0 < Q_SIZE) {
    let head = index0 / HEAD_DIM;
    let d = index0 % HEAD_DIM;
    row0 = head * (2u * HEAD_DIM) + d;
  } else if (index0 < 2u * Q_SIZE) {
    let qg = index0 - Q_SIZE;
    let head = qg / HEAD_DIM;
    let d = qg % HEAD_DIM;
    row0 = head * (2u * HEAD_DIM) + HEAD_DIM + d;
  } else if (index0 < 2u * Q_SIZE + KV_SIZE) {
    block_offset = W_K_Q1;
    row0 = index0 - 2u * Q_SIZE;
  } else {
    block_offset = W_V_Q1;
    row0 = index0 - 2u * Q_SIZE - KV_SIZE;
  }
  let tile = row0 / 4u;

  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  for (var word_index = lid; word_index < IN_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
    let n0 = normed[base4];
    let n1 = normed[base4 + 1u];
    let n2 = normed[base4 + 2u];
    let n3 = normed[base4 + 3u];
    let n4 = normed[base4 + 4u];
    let n5 = normed[base4 + 5u];
    let n6 = normed[base4 + 6u];
    let n7 = normed[base4 + 7u];
    let dot4 = q1_dot_word_t4(block_offset, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
    acc0 += dot4.x;
    acc1 += dot4.y;
    acc2 += dot4.z;
    acc3 += dot4.w;
  }
{%- if useSubgroups %}

  let ss = subgroupAdd(vec4<f32>(acc0, acc1, acc2, acc3));
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials0[0] = ss.x;
      partials1[0] = ss.y;
      partials2[0] = ss.z;
      partials3[0] = ss.w;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      let subgroup_index = lid / sg_size;
      partials0[subgroup_index] = ss.x;
      partials1[subgroup_index] = ss.y;
      partials2[subgroup_index] = ss.z;
      partials3[subgroup_index] = ss.w;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total0 = 0.0;
      var total1 = 0.0;
      var total2 = 0.0;
      var total3 = 0.0;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total0 = total0 + partials0[i];
        total1 = total1 + partials1[i];
        total2 = total2 + partials2[i];
        total3 = total3 + partials3[i];
      }
      partials0[0] = total0;
      partials1[0] = total1;
      partials2[0] = total2;
      partials3[0] = total3;
    }
    workgroupBarrier();
  }
{%- else %}
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials2[lid] = acc2;
  partials3[lid] = acc3;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials2[lid] = partials2[lid] + partials2[lid + stride];
      partials3[lid] = partials3[lid] + partials3[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid == 0u) {
    let v0 = partials0[0];
    let v1 = partials1[0];
    let v2 = partials2[0];
    let v3 = partials3[0];
    if (index0 < Q_SIZE) {
      q[index0 + 0u] = v0;
      q[index0 + 1u] = v1;
      q[index0 + 2u] = v2;
      q[index0 + 3u] = v3;
    } else if (index0 < 2u * Q_SIZE) {
      let qg = index0 - Q_SIZE;
      q_gate[qg + 0u] = v0;
      q_gate[qg + 1u] = v1;
      q_gate[qg + 2u] = v2;
      q_gate[qg + 3u] = v3;
    } else if (index0 < 2u * Q_SIZE + KV_SIZE) {
      let kIdx = index0 - 2u * Q_SIZE;
      k[kIdx + 0u] = v0;
      k[kIdx + 1u] = v1;
      k[kIdx + 2u] = v2;
      k[kIdx + 3u] = v3;
    } else {
      let vIdx = index0 - 2u * Q_SIZE - KV_SIZE;
      v[vIdx + 0u] = v0;
      v[vIdx + 1u] = v1;
      v[vIdx + 2u] = v2;
      v[vIdx + 3u] = v3;
    }
  }
}
`]]}],["com.xenova.Qwen35DecodeGatedRmsNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35DecodeGatedRmsNorm",sinceVersion:1,inputs:[{role:"X",dtype:"float32",rank:1},{role:"Z",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Y",dtype:"float32",rank:1,shape:["args.numValueHeads * args.valueHeadDim"]}],typeConstraints:{W:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},zT:{kind:"tensor",semantic:"Z",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},yT:{kind:"tensor",semantic:"Y",role:"output"},numValueHeads:{kind:"u32",semantic:"num_value_heads"},valueHeadDim:{kind:"u32",semantic:"value_head_dim"},normOffset:{kind:"u32",semantic:"norm_offset"},rmsEps:{kind:"f32",semantic:"rms_eps"},workgroupSize:{kind:"u32",semantic:"workgroup_size"}},variants:[{id:"dense",priority:0,when:["ranks.xT == 1","ranks.zT == 1","ranks.weightsT == 1","ranks.yT == 1",'tensorDtypes.xT == "float32"','tensorDtypes.zT == "float32"','tensorDtypes.yT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")',"f16Ok(tensorDtypes.weightsT)","args.numValueHeads > 0","args.valueHeadDim > 0","args.workgroupSize >= args.valueHeadDim","dim(shapes.xT, 0) >= args.numValueHeads * args.valueHeadDim","dim(shapes.zT, 0) >= args.numValueHeads * args.valueHeadDim","dim(shapes.yT, 0) == args.numValueHeads * args.valueHeadDim","dim(shapes.weightsT, 0) >= args.normOffset + args.valueHeadDim"],constants:{usesF16:'tensorDtypes.weightsT == "float16"',useSubgroups:'device.features.has("subgroups")',weightScalar:"dtypes.W",numHeads:"args.numValueHeads",headDim:"args.valueHeadDim",normOffset:"args.normOffset",rmsEps:"args.rmsEps",workgroupSize:"args.workgroupSize"},passes:[{id:"main",name:"Qwen35DecodeGatedRmsNorm",shader:"decode-gated-rmsnorm.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"z",arg:"zT",semantic:"Z",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"args.numValueHeads"},reads:["X","Z","Weights"],writes:["Y"]}]}]},assets:[["decode-gated-rmsnorm.wgsl.jinja",`{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const W_NORM: u32 = {{ normOffset }}u;
const EPS: f32 = {{ rmsEps }};
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
var<workgroup> partials: array<f32, {{ workgroupSize }}>;

fn silu(x: f32) -> f32 {
  return x / (1.0 + exp(-x));
}

@compute @workgroup_size({{ workgroupSize }})
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let head = wid.x;
  let lid = lid3.x;
  if (head >= NUM_HEADS) { return; }
  let base = head * HEAD_DIM;
  var acc = 0.0;
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let value = x[base + d];
    acc = fma(value, value, acc);
  }
{%- if useSubgroups %}
  let subgroup_sum = subgroupAdd(acc);
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials[0] = subgroup_sum;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      partials[lid / sg_size] = subgroup_sum;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total = 0.0;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total = total + partials[i];
      }
      partials[0] = total;
    }
    workgroupBarrier();
  }
{%- else %}
  partials[lid] = acc;
  workgroupBarrier();

  var n = WORKGROUP_SIZE;
  loop {
    let half = (n + 1u) / 2u;
    if (lid < n - half) {
      partials[lid] = partials[lid] + partials[lid + half];
    }
    workgroupBarrier();
    n = half;
    if (n == 1u) {
      break;
    }
  }
{%- endif %}
  let scale = inverseSqrt(partials[0] / f32(HEAD_DIM) + EPS);
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let idx = base + d;
{%- if weightScalar == "f16" %}
    let weight = f32(weights[W_NORM + d]);
{%- else %}
    let weight = weights[W_NORM + d];
{%- endif %}
    y[idx] = x[idx] * scale * weight * silu(z[idx]);
  }
}
`]]}],["com.xenova.Qwen35DecodeLinearAttention",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35DecodeLinearAttention",sinceVersion:1,inputs:[{role:"State",dtype:"float32",rank:1},{role:"Q",dtype:"float32",rank:1},{role:"K",dtype:"float32",rank:1},{role:"V",dtype:"float32",rank:1},{role:"Gate",dtype:"float32",rank:1}],outputs:[{role:"State",dtype:"float32",rank:1,shape:["args.numHeads * args.headDimK * args.headDimV"]},{role:"Out",dtype:"float32",rank:1,shape:["args.numHeads * args.headDimV"]}],typeConstraints:{},args:{stateT:{kind:"tensor",semantic:"State",role:"inout"},qT:{kind:"tensor",semantic:"Q",role:"input"},kT:{kind:"tensor",semantic:"K",role:"input"},vT:{kind:"tensor",semantic:"V",role:"input"},gateT:{kind:"tensor",semantic:"Gate",role:"input"},outT:{kind:"tensor",semantic:"Out",role:"output"},numHeads:{kind:"u32",semantic:"linear_num_value_heads"},numKeyHeads:{kind:"u32",semantic:"linear_num_key_heads"},headDimK:{kind:"u32",semantic:"linear_key_head_dim"},headDimV:{kind:"u32",semantic:"linear_value_head_dim"},scale:{kind:"f32",semantic:"scale"},workgroupSizeVec4:{kind:"u32",semantic:"workgroup_size_vec4"},workgroupSizeScalar:{kind:"u32",semantic:"workgroup_size_scalar"}},bindingSets:{laState:[{name:"state_buf",arg:"stateT",semantic:"State",role:"inout",buffer:{type:"storage"},elementType:"$stateElem"},{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"gate",arg:"gateT",semantic:"Gate",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"f32"}]},variants:[{id:"vec4",priority:2,when:["ranks.stateT == 1","ranks.qT == 1","ranks.kT == 1","ranks.vT == 1","ranks.gateT == 1","f16Allowed(tensorDtypes.stateT)",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','tensorDtypes.gateT == "float32"','device.features.has("subgroups")','has(device.adapterInfo, "subgroupMinSize")',"args.numHeads > 0","args.numKeyHeads > 0","args.numHeads % args.numKeyHeads == 0","args.headDimK > 0","args.headDimK % 4 == 0","args.headDimV > 0","args.workgroupSizeVec4 >= ceilDiv(args.headDimK, 4)","args.workgroupSizeVec4 <= device.adapterInfo.subgroupMinSize","args.workgroupSizeVec4 <= device.limits.maxComputeInvocationsPerWorkgroup","args.workgroupSizeVec4 <= device.limits.maxComputeWorkgroupSizeX","dim(shapes.qT, 0) >= args.numKeyHeads * args.headDimK","dim(shapes.kT, 0) >= args.numKeyHeads * args.headDimK","dim(shapes.vT, 0) >= args.numHeads * args.headDimV","dim(shapes.gateT, 0) >= 2 * args.numHeads","dim(shapes.stateT, 0) == args.numHeads * args.headDimK * args.headDimV","dim(shapes.outT, 0) == args.numHeads * args.headDimV"],constants:{numHeads:"args.numHeads",numKeyHeads:"args.numKeyHeads",headDimK:"args.headDimK",headDimV:"args.headDimV",tileV:4,workgroupSize:"args.workgroupSizeVec4",scale:"args.scale",useSubgroups:true,stateF16:'tensorDtypes.stateT == "float16"',stateElem:'"f16" if tensorDtypes.stateT == "float16" else "f32"'},passes:[{id:"main",name:"Qwen35DecodeLinearAttention",shader:"decode-linear-attention-vec4.wgsl.jinja",bindings:"laState",dispatch:{x:"args.numHeads * ceilDiv(args.headDimV, 4)"},reads:["State","Q","K","V","Gate"],writes:["State","Out"]}]},{id:"vec4_gather",priority:3,when:["ranks.stateT == 1","ranks.qT == 1","ranks.kT == 1","ranks.vT == 1","ranks.gateT == 1","f16Allowed(tensorDtypes.stateT)",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','tensorDtypes.gateT == "float32"','not device.features.has("subgroups") or not has(device.adapterInfo, "subgroupMinSize") or args.workgroupSizeVec4 > device.adapterInfo.subgroupMinSize or (tensorDtypes.stateT == "float32" and args.numHeads == 16 and args.numKeyHeads == 16 and args.headDimK == 128 and args.headDimV == 128 and args.workgroupSizeVec4 == 32)',"args.numHeads > 0","args.numKeyHeads > 0","args.numHeads % args.numKeyHeads == 0","args.headDimK > 0","args.headDimK % 4 == 0","args.headDimV > 0","args.workgroupSizeVec4 >= ceilDiv(args.headDimK, 4)","args.workgroupSizeVec4 <= device.limits.maxComputeInvocationsPerWorkgroup","args.workgroupSizeVec4 <= device.limits.maxComputeWorkgroupSizeX","args.workgroupSizeVec4 * 36 + 8 <= device.limits.maxComputeWorkgroupStorageSize","dim(shapes.qT, 0) >= args.numKeyHeads * args.headDimK","dim(shapes.kT, 0) >= args.numKeyHeads * args.headDimK","dim(shapes.vT, 0) >= args.numHeads * args.headDimV","dim(shapes.gateT, 0) >= 2 * args.numHeads","dim(shapes.stateT, 0) == args.numHeads * args.headDimK * args.headDimV","dim(shapes.outT, 0) == args.numHeads * args.headDimV"],constants:{numHeads:"args.numHeads",numKeyHeads:"args.numKeyHeads",headDimK:"args.headDimK",headDimV:"args.headDimV",tileV:4,workgroupSize:"args.workgroupSizeVec4",scale:"args.scale",useSubgroups:false,stateF16:'tensorDtypes.stateT == "float16"',stateElem:'"f16" if tensorDtypes.stateT == "float16" else "f32"'},passes:[{id:"main",name:"Qwen35DecodeLinearAttention.Gather",shader:"decode-linear-attention-vec4.wgsl.jinja",bindings:"laState",dispatch:{x:"args.numHeads * ceilDiv(args.headDimV, 4)"},reads:["State","Q","K","V","Gate"],writes:["State","Out"]}]},{id:"scalar",priority:0,when:["ranks.stateT == 1","ranks.qT == 1","ranks.kT == 1","ranks.vT == 1","ranks.gateT == 1","f16Allowed(tensorDtypes.stateT)",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','tensorDtypes.gateT == "float32"',"args.numHeads > 0","args.numKeyHeads > 0","args.numHeads % args.numKeyHeads == 0","args.headDimK > 0","args.headDimV > 0","args.workgroupSizeScalar >= args.headDimK","dim(shapes.qT, 0) >= args.numKeyHeads * args.headDimK","dim(shapes.kT, 0) >= args.numKeyHeads * args.headDimK","dim(shapes.vT, 0) >= args.numHeads * args.headDimV","dim(shapes.gateT, 0) >= 2 * args.numHeads","dim(shapes.stateT, 0) == args.numHeads * args.headDimK * args.headDimV","dim(shapes.outT, 0) == args.numHeads * args.headDimV"],constants:{useSubgroups:'device.features.has("subgroups")',numHeads:"args.numHeads",numKeyHeads:"args.numKeyHeads",headDimK:"args.headDimK",headDimV:"args.headDimV",tileV:8,workgroupSize:"args.workgroupSizeScalar",scale:"args.scale",stateF16:'tensorDtypes.stateT == "float16"',stateElem:'"f16" if tensorDtypes.stateT == "float16" else "f32"'},passes:[{id:"main",name:"Qwen35DecodeLinearAttention",shader:"decode-linear-attention.wgsl.jinja",bindings:"laState",dispatch:{x:"args.numHeads * ceilDiv(args.headDimV, 8)"},reads:["State","Q","K","V","Gate"],writes:["State","Out"]}]}]},assets:[["decode-linear-attention-vec4.wgsl.jinja",`{% include "ops/_shared/linear-attention-common.wgsl.jinja" %}{{ emit_qwen35_decode_header() }}{{ emit_qwen35_stable_decay() }}const VEC4_LANES: u32 = 4u;
const SCALE: f32 = {{ scale }};
{%- if not useSubgroups %}

var<workgroup> red_pair: array<vec2<f32>, WG * TILE_V>;
var<workgroup> red_kq: array<f32, WG>;
var<workgroup> red_l2: vec2<f32>;

{{ emit_gather_function("gather_pair", "vec2<f32>", "red_pair", true, "vec2<f32>(0.0)") }}

{{ emit_gather_function("gather_scalar", "f32", "red_kq", false, "0.0") }}
{% endif %}

@compute @workgroup_size({{ workgroupSize }})
fn main(@builtin(workgroup_id) wid: vec3<u32>,
        @builtin(local_invocation_id) lid3: vec3<u32>{% if useSubgroups %},
        @builtin(subgroup_invocation_id) sg_lid: u32,
        @builtin(subgroup_size) sg_size: u32
{% endif %}) {
  let tid = lid3.x;
  let dk_base = tid * VEC4_LANES;
{{ emit_decode_tile_setup() }}
  let lane_active = dk_base < HEAD_DIM_K;
  let exp_g = {{ qwen35_decay("gate[NUM_HEADS + head]") }};
  let beta_val = gate[head];

  var k_vec = vec4<f32>(0.0);
  var q_vec = vec4<f32>(0.0);
  if (lane_active) {
    let kq_base = (head % NUM_KEY_HEADS) * HEAD_DIM_K + dk_base;
    k_vec = vec4<f32>(k[kq_base + 0u], k[kq_base + 1u], k[kq_base + 2u], k[kq_base + 3u]);
    q_vec = vec4<f32>(q[kq_base + 0u], q[kq_base + 1u], q[kq_base + 2u], q[kq_base + 3u]);
  }

{% if useSubgroups %}
  let l2 = subgroupAdd(vec2<f32>(dot(k_vec, k_vec), dot(q_vec, q_vec)));
{% else %}
  red_pair[tid] = vec2<f32>(dot(k_vec, k_vec), dot(q_vec, q_vec));
  workgroupBarrier();
  if (tid == 0u) {
    red_l2 = gather_pair(0u);
  }
  workgroupBarrier();

  let l2 = red_l2;
{% endif %}
  k_vec = k_vec * inverseSqrt(l2.x + 1e-6);
  q_vec = q_vec * inverseSqrt(l2.y + 1e-6);

  var state: array<vec4<f32>, TILE_V>;
  for (var j = 0u; j < TILE_V; j = j + 1u) { state[j] = vec4<f32>(0.0); }
  if (lane_active) {
    for (var j = 0u; j < TILE_V; j = j + 1u) {
      let dv = dv_start + j;
      if (dv < HEAD_DIM_V) {

        let base = (head * HEAD_DIM_V + dv) * HEAD_DIM_K + dk_base;

        state[j] = vec4<f32>(
          f32(state_buf[base + 0u]) * exp_g,
          f32(state_buf[base + 1u]) * exp_g,
          f32(state_buf[base + 2u]) * exp_g,
          f32(state_buf[base + 3u]) * exp_g,
        );
      }
    }
  }

{% if useSubgroups %}
  let kq_dot = subgroupAdd(dot(k_vec, q_vec));
  var ret_vals: array<f32, TILE_V>;
  var pre_vals: array<f32, TILE_V>;
  for (var j = 0u; j < TILE_V; j = j + 1u) {

    let rp = subgroupAdd(vec2<f32>(dot(state[j], k_vec), dot(state[j], q_vec)));
    ret_vals[j] = rp.x;
    pre_vals[j] = rp.y;
  }
{% else %}

  for (var j = 0u; j < TILE_V; j = j + 1u) {
    red_pair[j * WG + tid] = vec2<f32>(dot(state[j], k_vec), dot(state[j], q_vec));
  }
  red_kq[tid] = dot(k_vec, q_vec);
  workgroupBarrier();
  for (var j = tid; j < TILE_V; j = j + WG) {
    red_pair[j * WG] = gather_pair(j * WG);
  }

  let kq_gather_lane = min(TILE_V, WG - 1u);
  if (tid == kq_gather_lane) {
    red_kq[0] = gather_scalar();
  }
  workgroupBarrier();
  let kq_dot = red_kq[0];
  var ret_vals: array<f32, TILE_V>;
  var pre_vals: array<f32, TILE_V>;
  for (var j = 0u; j < TILE_V; j = j + 1u) {
    let rp = red_pair[j * WG];
    ret_vals[j] = rp.x;
    pre_vals[j] = rp.y;
  }
{% endif %}

  var deltas: array<f32, TILE_V>;
  for (var j = 0u; j < TILE_V; j = j + 1u) {
    let dv = dv_start + j;
    if (dv < HEAD_DIM_V) {
      let v_val = v[head * HEAD_DIM_V + dv];
      let delta = beta_val * (v_val - ret_vals[j]);
      deltas[j] = delta;
      if (tid == 0u) {
        out[head * HEAD_DIM_V + dv] = (pre_vals[j] + delta * kq_dot) * SCALE;
      }
    } else {
      deltas[j] = 0.0;
    }
  }

  if (lane_active) {
    for (var j = 0u; j < TILE_V; j = j + 1u) {
      let dv = dv_start + j;
      if (dv < HEAD_DIM_V) {
        let updated = state[j] + k_vec * deltas[j];

        let base = (head * HEAD_DIM_V + dv) * HEAD_DIM_K + dk_base;
        state_buf[base + 0u] = {% if stateF16 %}f16(updated.x){% else %}updated.x{% endif %};
        state_buf[base + 1u] = {% if stateF16 %}f16(updated.y){% else %}updated.y{% endif %};
        state_buf[base + 2u] = {% if stateF16 %}f16(updated.z){% else %}updated.z{% endif %};
        state_buf[base + 3u] = {% if stateF16 %}f16(updated.w){% else %}updated.w{% endif %};
      }
    }
  }
}
`],["decode-linear-attention.wgsl.jinja",`{% include "ops/_shared/linear-attention-common.wgsl.jinja" %}{{ emit_qwen35_decode_header() }}{{ emit_qwen35_stable_decay() }}const SCALE: f32 = {{ scale }};
var<workgroup> red_retrieved: array<f32, WG * TILE_V>;
var<workgroup> red_preout: array<f32, WG * TILE_V>;
var<workgroup> red_kq: array<f32, WG>;
var<workgroup> red_kk: array<f32, WG>;
var<workgroup> red_qq: array<f32, WG>;
var<workgroup> delta_buf: array<f32, TILE_V>;

@compute @workgroup_size({{ workgroupSize }})
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let tid = lid3.x;
{{ emit_decode_tile_setup() }}
  var state: array<f32, TILE_V>;
  let exp_g = {{ qwen35_decay("gate[NUM_HEADS + head]") }};
  let beta_val = gate[head];
  var k_val = 0.0;
  var q_val = 0.0;
  if (tid < HEAD_DIM_K) {
    k_val = k[(head % NUM_KEY_HEADS) * HEAD_DIM_K + tid];
    q_val = q[(head % NUM_KEY_HEADS) * HEAD_DIM_K + tid];
  }

  red_kk[tid] = k_val * k_val;
  red_qq[tid] = q_val * q_val;
  workgroupBarrier();

  var n_kk = WG;
  loop {
    let half_kk = (n_kk + 1u) >> 1u;
    if (tid < n_kk - half_kk) {
      red_kk[tid] = red_kk[tid] + red_kk[tid + half_kk];
      red_qq[tid] = red_qq[tid] + red_qq[tid + half_kk];
    }
    workgroupBarrier();
    n_kk = half_kk;
    if (n_kk == 1u) { break; }
  }
  k_val = k_val * inverseSqrt(red_kk[0] + 1e-6);
  q_val = q_val * inverseSqrt(red_qq[0] + 1e-6);
  workgroupBarrier();
  for (var j = 0u; j < TILE_V; j = j + 1u) {
    let dv = dv_start + j;
    if (tid < HEAD_DIM_K && dv < HEAD_DIM_V) {

      let idx = (head * HEAD_DIM_V + dv) * HEAD_DIM_K + tid;
      state[j] = f32(state_buf[idx]) * exp_g;
    } else {
      state[j] = 0.0;
    }
  }
{%- if useSubgroups %}
  let subgroup_index = tid / sg_size;
  let subgroup_count = WG / sg_size;
  for (var j = 0u; j < TILE_V; j = j + 1u) {
    let sg_ret = subgroupAdd(state[j] * k_val);
    let sg_pre = subgroupAdd(state[j] * q_val);
    if (sg_lid == 0u) {
      red_retrieved[j * WG + subgroup_index] = sg_ret;
      red_preout[j * WG + subgroup_index] = sg_pre;
    }
  }
  let sg_kq = subgroupAdd(k_val * q_val);
  if (sg_lid == 0u) {
    red_kq[subgroup_index] = sg_kq;
  }
  workgroupBarrier();
  if (WG != sg_size) {
    if (tid < TILE_V) {
      var ret_total = 0.0;
      var pre_total = 0.0;
      for (var i = 1u; i < subgroup_count; i = i + 1u) {
        ret_total = ret_total + red_retrieved[tid * WG + i];
        pre_total = pre_total + red_preout[tid * WG + i];
      }
      red_retrieved[tid * WG] = red_retrieved[tid * WG] + ret_total;
      red_preout[tid * WG] = red_preout[tid * WG] + pre_total;
    }
    if (tid == TILE_V) {
      var kq_total = 0.0;
      for (var i = 1u; i < subgroup_count; i = i + 1u) {
        kq_total = kq_total + red_kq[i];
      }
      red_kq[0] = red_kq[0] + kq_total;
    }
    workgroupBarrier();
  }
{%- else %}
  for (var j = 0u; j < TILE_V; j = j + 1u) {
    red_retrieved[j * WG + tid] = state[j] * k_val;
    red_preout[j * WG + tid] = state[j] * q_val;
  }
  red_kq[tid] = k_val * q_val;
  workgroupBarrier();
  var n_out = WG;
  loop {
    let half_out = (n_out + 1u) >> 1u;
    if (tid < n_out - half_out) {
      for (var j = 0u; j < TILE_V; j = j + 1u) {
        red_retrieved[j * WG + tid] = red_retrieved[j * WG + tid] + red_retrieved[j * WG + tid + half_out];
        red_preout[j * WG + tid] = red_preout[j * WG + tid] + red_preout[j * WG + tid + half_out];
      }
      red_kq[tid] = red_kq[tid] + red_kq[tid + half_out];
    }
    workgroupBarrier();
    n_out = half_out;
    if (n_out == 1u) { break; }
  }
{%- endif %}
  if (tid == 0u) {
    for (var j = 0u; j < TILE_V; j = j + 1u) {
      let dv = dv_start + j;
      if (dv < HEAD_DIM_V) {
        let v_val = v[head * HEAD_DIM_V + dv];
        let delta = beta_val * (v_val - red_retrieved[j * WG]);
        delta_buf[j] = delta;
        out[head * HEAD_DIM_V + dv] = (red_preout[j * WG] + delta * red_kq[0]) * SCALE;
      } else {
        delta_buf[j] = 0.0;
      }
    }
  }
  workgroupBarrier();
  if (tid < HEAD_DIM_K) {
    for (var j = 0u; j < TILE_V; j = j + 1u) {
      let dv = dv_start + j;
      if (dv < HEAD_DIM_V) {
        let idx = (head * HEAD_DIM_V + dv) * HEAD_DIM_K + tid;
        state_buf[idx] = {% if stateF16 %}f16(state[j] + k_val * delta_buf[j]){% else %}state[j] + k_val * delta_buf[j]{% endif %};
      }
    }
  }
}
`]]}],["com.xenova.Qwen35DecodeLinearInProjConv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35DecodeLinearInProjConv",sinceVersion:1,inputs:[{role:"Normed",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true},{role:"ConvState",dtype:"float32",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1,optional:true},{role:"Q4Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"ConvState",dtype:"float32",rank:1,shape:["args.convDim * (args.convKernel - 1)"]},{role:"Q",dtype:"float32",rank:1,shape:["args.keyDim"]},{role:"K",dtype:"float32",rank:1,shape:["args.keyDim"]},{role:"V",dtype:"float32",rank:1,shape:["args.valueDim"]},{role:"Z",dtype:"float32",rank:1,shape:["args.valueDim"]},{role:"Gate",dtype:"float32",rank:1,shape:["2 * args.numHeads"]}],typeConstraints:{W:["float32","float16"],S:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},convStateT:{kind:"tensor",semantic:"ConvState",role:"inout"},qT:{kind:"tensor",semantic:"Q",role:"output"},kT:{kind:"tensor",semantic:"K",role:"output"},vT:{kind:"tensor",semantic:"V",role:"output"},zT:{kind:"tensor",semantic:"Z",role:"output"},gateT:{kind:"tensor",semantic:"Gate",role:"output"},keyDim:{kind:"u32",semantic:"linear_key_dim"},valueDim:{kind:"u32",semantic:"linear_value_dim"},convDim:{kind:"u32",semantic:"linear_conv_dim"},numHeads:{kind:"u32",semantic:"linear_num_value_heads"},convKernel:{kind:"u32",semantic:"linear_conv_kernel_dim"},hiddenSize:{kind:"u32",semantic:"hidden_size"},qkvOffset:{kind:"u32",semantic:"linear_in_proj_qkv_offset"},zOffset:{kind:"u32",semantic:"linear_in_proj_z_offset"},bOffset:{kind:"u32",semantic:"linear_in_proj_b_offset"},aOffset:{kind:"u32",semantic:"linear_in_proj_a_offset"},convWeightOffset:{kind:"u32",semantic:"linear_conv_weight_offset"},aNegExpOffset:{kind:"u32",semantic:"linear_a_neg_exp_offset"},dtBiasOffset:{kind:"u32",semantic:"linear_dt_bias_offset"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights",required:false},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights",required:false},format:{kind:"string",semantic:"packed_quant_format",required:false,oneOf:["q4_0","q4_k","q8_0","iq","lut32","lut16"]},lut:{kind:"u32",semantic:"dequant_lut_id",required:false}},derive:{fmt:'args.format if args.format else "q4_0"',quantBits:'8 if (fmt == "q8_0" or fmt == "iq") else 4',hasMin:'1 if fmt == "q4_k" else 0',iq:'1 if fmt == "iq" else 0',lut16:'1 if fmt == "lut16" else 0',deviceWorkgroupCap:"min(device.limits.maxComputeInvocationsPerWorkgroup, device.limits.maxComputeWorkgroupSizeX)",denseWorkgroupLimit:"min(tunables.DENSE_WORKGROUP_SIZE, deviceWorkgroupCap)",denseWorkgroupSize:"max(1, pow2ceil(denseWorkgroupLimit + 1) / 2)",q4WorkgroupLimit:"min(tunables.Q4_WORKGROUP_SIZE, deviceWorkgroupCap)",q4WorkgroupSize:"max(1, pow2ceil(q4WorkgroupLimit + 1) / 2)",q1WorkgroupCandidate:'(min(tunables.Q1_LARGE_WORKGROUP_SIZE, tunables.Q1_PORTABLE_WORKGROUP_CAP) if not device.features.has("subgroups") else tunables.Q1_LARGE_WORKGROUP_SIZE) if args.hiddenSize >= 4096 else 32',q1WorkgroupLimit:"min(q1WorkgroupCandidate, deviceWorkgroupCap)",q1WorkgroupSize:"max(1, pow2ceil(q1WorkgroupLimit + 1) / 2)",outputRows:"args.convDim + args.valueDim + 2 * args.numHeads",denseResourcesFit:"denseWorkgroupSize * 4 <= device.limits.maxComputeWorkgroupStorageSize and outputRows <= device.limits.maxComputeWorkgroupsPerDimension",q4ResourcesFit:"q4WorkgroupSize * 4 <= device.limits.maxComputeWorkgroupStorageSize and outputRows <= device.limits.maxComputeWorkgroupsPerDimension",q1ResourcesFit:"q1WorkgroupSize * 16 <= device.limits.maxComputeWorkgroupStorageSize and ceilDiv(outputRows, 4) <= device.limits.maxComputeWorkgroupsPerDimension"},tunables:{DENSE_WORKGROUP_SIZE:64,Q4_WORKGROUP_SIZE:32,Q1_LARGE_WORKGROUP_SIZE:128,Q1_PORTABLE_WORKGROUP_CAP:64},variants:[{id:"q1",priority:0,when:["present.q1BitsT","ranks.normedT == 1","ranks.weightsT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.convStateT == 1",'tensorDtypes.normedT == "float32"','tensorDtypes.convStateT == "float32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")',"f16Ok(tensorDtypes.weightsT) and f16Ok(tensorDtypes.q1ScalesT)","q1ResourcesFit","args.keyDim > 0","args.valueDim > 0","args.valueDim % 4 == 0","args.numHeads > 0","args.numHeads % 4 == 0","args.convKernel > 1","args.convDim == 2 * args.keyDim + args.valueDim","args.convDim % 4 == 0","args.hiddenSize > 0","args.hiddenSize % 128 == 0","tunables.Q1_LARGE_WORKGROUP_SIZE == 32 or tunables.Q1_LARGE_WORKGROUP_SIZE == 64 or tunables.Q1_LARGE_WORKGROUP_SIZE == 128","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.convStateT, 0) == args.convDim * (args.convKernel - 1)","dim(shapes.qT, 0) == args.keyDim","dim(shapes.kT, 0) == args.keyDim","dim(shapes.vT, 0) == args.valueDim","dim(shapes.zT, 0) == args.valueDim","dim(shapes.gateT, 0) == 2 * args.numHeads","dim(shapes.q1BitsT, 0) >= max(args.qkvOffset + args.convDim * (args.hiddenSize / 128), args.zOffset + args.valueDim * (args.hiddenSize / 128), args.bOffset + args.numHeads * (args.hiddenSize / 128), args.aOffset + args.numHeads * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= max(args.qkvOffset + args.convDim * (args.hiddenSize / 128), args.zOffset + args.valueDim * (args.hiddenSize / 128), args.bOffset + args.numHeads * (args.hiddenSize / 128), args.aOffset + args.numHeads * (args.hiddenSize / 128))","dim(shapes.weightsT, 0) >= args.convWeightOffset + args.convDim * args.convKernel","dim(shapes.weightsT, 0) >= args.aNegExpOffset + args.numHeads","dim(shapes.weightsT, 0) >= args.dtBiasOffset + args.numHeads"],constants:{usesF16:'tensorDtypes.weightsT == "float16" or tensorDtypes.q1ScalesT == "float16"',useSubgroups:'device.features.has("subgroups")',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",scaleScalar:"dtypes.S",workgroupSize:"q1WorkgroupSize",blocksPerRow:"args.hiddenSize / 128",inWords:"args.hiddenSize / 32",keyDim:"args.keyDim",valueDim:"args.valueDim",convDim:"args.convDim",numHeads:"args.numHeads",convKernel:"args.convKernel",convState:"args.convKernel - 1",total:"args.convDim + args.valueDim + 2 * args.numHeads",qkvOffset:"args.qkvOffset",zOffset:"args.zOffset",bOffset:"args.bOffset",aOffset:"args.aOffset",convWeightOffset:"args.convWeightOffset",aNegExpOffset:"args.aNegExpOffset",dtBiasOffset:"args.dtBiasOffset"},passes:[{id:"main",name:"Qwen35DecodeLinearInProjConvQ1",shader:"decode-linear-in-proj-conv-q1.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"conv_state",arg:"convStateT",semantic:"ConvState",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q",arg:"qT",semantic:"Q",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"z",arg:"zT",semantic:"Z",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"gate",arg:"gateT",semantic:"Gate",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"ceil((args.convDim + args.valueDim + 2 * args.numHeads) / 4)"},reads:["Normed","Weights","Q1Bits","Q1Scales","ConvState"],writes:["ConvState","Q","K","V","Z","Gate"]}]}]},assets:[["decode-linear-in-proj-conv-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const BPR: u32 = {{ blocksPerRow }}u;
const IN_WORDS: u32 = {{ inWords }}u;
const KEY_DIM: u32 = {{ keyDim }}u;
const VALUE_DIM: u32 = {{ valueDim }}u;
const CONV_DIM: u32 = {{ convDim }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const CONV_KERNEL: u32 = {{ convKernel }}u;
const CONV_STATE: u32 = {{ convState }}u;
const TOTAL: u32 = {{ total }}u;
const W_QKV_Q1: u32 = {{ qkvOffset }}u;
const W_Z_Q1: u32 = {{ zOffset }}u;
const W_B_Q1: u32 = {{ bOffset }}u;
const W_A_Q1: u32 = {{ aOffset }}u;
const W_CONV: u32 = {{ convWeightOffset }}u;
const W_A_NEG_EXP: u32 = {{ aNegExpOffset }}u;
const W_DT_BIAS: u32 = {{ dtBiasOffset }}u;
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, {{ workgroupSize }}>;
var<workgroup> partials1: array<f32, {{ workgroupSize }}>;
var<workgroup> partials2: array<f32, {{ workgroupSize }}>;
var<workgroup> partials3: array<f32, {{ workgroupSize }}>;

fn silu(x: f32) -> f32 { return x / (1.0 + exp(-x)); }
fn softplus(x: f32) -> f32 { return log(1.0 + exp(-abs(x))) + max(x, 0.0); }

fn weight_at(element: u32) -> f32 {
  let packed = weights[element / 4u];
  let lane = element % 4u;
{%- if weightScalar == "f16" %}
  if (lane == 0u) { return f32(packed.x); }
  if (lane == 1u) { return f32(packed.y); }
  if (lane == 2u) { return f32(packed.z); }
  return f32(packed.w);
{%- else %}
  if (lane == 0u) { return packed.x; }
  if (lane == 1u) { return packed.y; }
  if (lane == 2u) { return packed.z; }
  return packed.w;
{%- endif %}
}

{% include "ops/_shared/q1-dot-helpers.wgsl.jinja" %}

@compute @workgroup_size({{ workgroupSize }})
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let index0 = wid.x * TILE_ROWS;
  let lid = lid3.x;
  if (index0 >= TOTAL) {
    return;
  }

  var block_offset = W_QKV_Q1;
  var row0 = index0;
  if (index0 >= CONV_DIM && index0 < CONV_DIM + VALUE_DIM) {
    row0 = index0 - CONV_DIM;
    block_offset = W_Z_Q1;
  } else if (index0 >= CONV_DIM + VALUE_DIM && index0 < CONV_DIM + VALUE_DIM + NUM_HEADS) {
    row0 = index0 - CONV_DIM - VALUE_DIM;
    block_offset = W_B_Q1;
  } else if (index0 >= CONV_DIM + VALUE_DIM + NUM_HEADS) {
    row0 = index0 - CONV_DIM - VALUE_DIM - NUM_HEADS;
    block_offset = W_A_Q1;
  }
  let tile = row0 / 4u;

  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  for (var word_index = lid; word_index < IN_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
    let n0 = normed[base4];
    let n1 = normed[base4 + 1u];
    let n2 = normed[base4 + 2u];
    let n3 = normed[base4 + 3u];
    let n4 = normed[base4 + 4u];
    let n5 = normed[base4 + 5u];
    let n6 = normed[base4 + 6u];
    let n7 = normed[base4 + 7u];
    let dot4 = q1_dot_word_t4(block_offset, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
    acc0 += dot4.x;
    acc1 += dot4.y;
    acc2 += dot4.z;
    acc3 += dot4.w;
  }
{%- if useSubgroups %}
  let subgroup_sum0 = subgroupAdd(acc0);
  let subgroup_sum1 = subgroupAdd(acc1);
  let subgroup_sum2 = subgroupAdd(acc2);
  let subgroup_sum3 = subgroupAdd(acc3);
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials0[0] = subgroup_sum0;
      partials1[0] = subgroup_sum1;
      partials2[0] = subgroup_sum2;
      partials3[0] = subgroup_sum3;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      let subgroup_index = lid / sg_size;
      partials0[subgroup_index] = subgroup_sum0;
      partials1[subgroup_index] = subgroup_sum1;
      partials2[subgroup_index] = subgroup_sum2;
      partials3[subgroup_index] = subgroup_sum3;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total0 = 0.0;
      var total1 = 0.0;
      var total2 = 0.0;
      var total3 = 0.0;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total0 = total0 + partials0[i];
        total1 = total1 + partials1[i];
        total2 = total2 + partials2[i];
        total3 = total3 + partials3[i];
      }
      partials0[0] = total0;
      partials1[0] = total1;
      partials2[0] = total2;
      partials3[0] = total3;
    }
    workgroupBarrier();
  }
{%- else %}
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials2[lid] = acc2;
  partials3[lid] = acc3;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials2[lid] = partials2[lid] + partials2[lid + stride];
      partials3[lid] = partials3[lid] + partials3[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid < TILE_ROWS) {
    var value = partials0[0];
    if (lid == 1u) { value = partials1[0]; }
    if (lid == 2u) { value = partials2[0]; }
    if (lid == 3u) { value = partials3[0]; }
    let index = index0 + lid;
    let row = row0 + lid;
    if (index < CONV_DIM) {
      var conv_out = value * weight_at(W_CONV + row * CONV_KERNEL + CONV_STATE);
      for (var tap = 0u; tap < CONV_STATE; tap = tap + 1u) {
        let state_index = row * CONV_STATE + tap;
        let prev = conv_state[state_index];
        conv_out = fma(prev, weight_at(W_CONV + row * CONV_KERNEL + tap), conv_out);
        if (tap + 1u < CONV_STATE) {
          conv_state[state_index] = conv_state[state_index + 1u];
        }
      }
      conv_state[row * CONV_STATE + CONV_STATE - 1u] = value;
      let y = silu(conv_out);
      if (row < KEY_DIM) { q[row] = y; }
      else if (row < 2u * KEY_DIM) { k[row - KEY_DIM] = y; }
      else { v[row - 2u * KEY_DIM] = y; }
    } else if (index < CONV_DIM + VALUE_DIM) {
      z[row] = value;
    } else if (index < CONV_DIM + VALUE_DIM + NUM_HEADS) {
      gate[row] = 1.0 / (1.0 + exp(-value));
    } else {
      gate[NUM_HEADS + row] = weight_at(W_A_NEG_EXP + row) * softplus(value + weight_at(W_DT_BIAS + row));
    }
  }
}
`]]}],["com.xenova.Qwen35DecodeOProj",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35DecodeOProj",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1,optional:true},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true},{role:"Attn",dtype:"float32",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1,optional:true},{role:"Q4Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],tunables:{DENSE_WORKGROUP_SIZE:64,Q1_WORKGROUP_SIZE:64},typeConstraints:{W:["float32","float16"],S:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights",required:false},attnT:{kind:"tensor",semantic:"Attn",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},inFeatures:{kind:"u32",semantic:"in_features"},oOffset:{kind:"u32",semantic:"o_proj_offset"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights",required:false},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights",required:false},format:{kind:"string",semantic:"packed_quant_format",required:false,oneOf:["q4_0","q4_k","q8_0","iq","lut32","lut16"]},lut:{kind:"u32",semantic:"dequant_lut_id",required:false}},bindingSets:{q4io:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"}]},derive:{fmt:'args.format if args.format else "q4_0"',quantBits:'8 if (fmt == "q8_0" or fmt == "iq") else 4',hasMin:'1 if fmt == "q4_k" else 0',iq:'1 if fmt == "iq" else 0',lut16:'1 if fmt == "lut16" else 0',portableMr4Preferred:'not device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and has(device.adapterInfo, "subgroupMaxSize") and device.adapterInfo.subgroupMinSize < device.adapterInfo.subgroupMaxSize and device.adapterInfo.subgroupMaxSize <= 32',deviceWorkgroupCap:"min(device.limits.maxComputeInvocationsPerWorkgroup, device.limits.maxComputeWorkgroupSizeX)",denseWorkgroupLimit:"min(tunables.DENSE_WORKGROUP_SIZE, deviceWorkgroupCap)",denseWorkgroupSize:"max(1, pow2ceil(denseWorkgroupLimit + 1) / 2)",q1WorkgroupLimit:"min(tunables.Q1_WORKGROUP_SIZE, deviceWorkgroupCap)",q1WorkgroupSize:"max(1, pow2ceil(q1WorkgroupLimit + 1) / 2)",q4WorkgroupSize:"32",q4MultiRowWorkgroupSize:"q4WorkgroupSize * 4",denseResourcesFit:"denseWorkgroupSize * 4 <= device.limits.maxComputeWorkgroupStorageSize and args.hiddenSize <= device.limits.maxComputeWorkgroupsPerDimension",q1ResourcesFit:"q1WorkgroupSize * 16 <= device.limits.maxComputeWorkgroupStorageSize and ceilDiv(args.hiddenSize, 4) <= device.limits.maxComputeWorkgroupsPerDimension",q4WorkgroupFits:"q4WorkgroupSize == 32 and q4WorkgroupSize <= deviceWorkgroupCap and q4WorkgroupSize * 4 <= device.limits.maxComputeWorkgroupStorageSize",q4ResourcesFit:"q4WorkgroupFits and args.hiddenSize <= device.limits.maxComputeWorkgroupsPerDimension",q4MultiRowResourcesFit:"q4WorkgroupFits and q4MultiRowWorkgroupSize <= deviceWorkgroupCap and q4MultiRowWorkgroupSize * 4 <= device.limits.maxComputeWorkgroupStorageSize"},variants:[{id:"q1",priority:0,when:["present.q1BitsT","ranks.hiddenT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.attnT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.attnT == "float32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")',"f16Ok(tensorDtypes.q1ScalesT)","q1ResourcesFit","args.hiddenSize > 0","args.inFeatures > 0","args.inFeatures % 128 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.attnT, 0) == args.inFeatures","dim(shapes.q1BitsT, 0) >= (args.oOffset + args.hiddenSize * (args.inFeatures / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.oOffset + args.hiddenSize * (args.inFeatures / 128)","args.hiddenSize % 4 == 0"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16"',useSubgroups:'device.features.has("subgroups")',scaleScalar:"dtypes.S",workgroupSize:"q1WorkgroupSize",hiddenSize:"args.hiddenSize",blocksPerRow:"args.inFeatures / 128",inWords:"args.inFeatures / 32",oOffset:"args.oOffset"},passes:[{id:"main",name:"Qwen35DecodeOProjQ1",shader:"decode-o-proj-q1.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"}],dispatch:{x:"ceil(args.hiddenSize / 4)"},reads:["Hidden","Q1Bits","Q1Scales","Attn"],writes:["Hidden"]}]}]},assets:[["decode-o-proj-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const IN_WORDS: u32 = {{ inWords }}u;
const W_O_Q1: u32 = {{ oOffset }}u;
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, {{ workgroupSize }}>;
var<workgroup> partials1: array<f32, {{ workgroupSize }}>;
var<workgroup> partials2: array<f32, {{ workgroupSize }}>;
var<workgroup> partials3: array<f32, {{ workgroupSize }}>;

{% include "ops/_shared/q1-dot-helpers.wgsl.jinja" %}

@compute @workgroup_size({{ workgroupSize }})
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let index0 = wid.x * TILE_ROWS;
  let lid = lid3.x;
  if (index0 >= HIDDEN_SIZE) {
    return;
  }
  let tile = index0 / 4u;

  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  for (var word_index = lid; word_index < IN_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
    let n0 = attn_out[base4];
    let n1 = attn_out[base4 + 1u];
    let n2 = attn_out[base4 + 2u];
    let n3 = attn_out[base4 + 3u];
    let n4 = attn_out[base4 + 4u];
    let n5 = attn_out[base4 + 5u];
    let n6 = attn_out[base4 + 6u];
    let n7 = attn_out[base4 + 7u];
    let dot4 = q1_dot_word_t4(W_O_Q1, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
    acc0 += dot4.x;
    acc1 += dot4.y;
    acc2 += dot4.z;
    acc3 += dot4.w;
  }
{%- if useSubgroups %}

  let ss = subgroupAdd(vec4<f32>(acc0, acc1, acc2, acc3));
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials0[0] = ss.x;
      partials1[0] = ss.y;
      partials2[0] = ss.z;
      partials3[0] = ss.w;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      let subgroup_index = lid / sg_size;
      partials0[subgroup_index] = ss.x;
      partials1[subgroup_index] = ss.y;
      partials2[subgroup_index] = ss.z;
      partials3[subgroup_index] = ss.w;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total0 = 0.0;
      var total1 = 0.0;
      var total2 = 0.0;
      var total3 = 0.0;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total0 = total0 + partials0[i];
        total1 = total1 + partials1[i];
        total2 = total2 + partials2[i];
        total3 = total3 + partials3[i];
      }
      partials0[0] = total0;
      partials1[0] = total1;
      partials2[0] = total2;
      partials3[0] = total3;
    }
    workgroupBarrier();
  }
{%- else %}
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials2[lid] = acc2;
  partials3[lid] = acc3;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials2[lid] = partials2[lid] + partials2[lid + stride];
      partials3[lid] = partials3[lid] + partials3[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid == 0u) {
    hidden[index0 + 0u] = hidden[index0 + 0u] + partials0[0];
    hidden[index0 + 1u] = hidden[index0 + 1u] + partials1[0];
    hidden[index0 + 2u] = hidden[index0 + 2u] + partials2[0];
    hidden[index0 + 3u] = hidden[index0 + 3u] + partials3[0];
  }
}
`]]}],["com.xenova.Qwen35DecodePartialRopeCacheKv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35DecodePartialRopeCacheKv",sinceVersion:1,inputs:[{role:"Q",dtype:"float32",rank:1},{role:"K",dtype:"float32",rank:1},{role:"V",dtype:"float32",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32",rank:1},{role:"RopeSin",dtype:"float32",rank:1}],outputs:[{role:"Q",dtype:"float32",rank:1,shape:["args.numHeads * args.headDim"]},{role:"CacheKeys",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]},{role:"CacheValues",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]}],typeConstraints:{C:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"inout"},kT:{kind:"tensor",semantic:"K",role:"input"},vT:{kind:"tensor",semantic:"V",role:"input"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:false},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rotaryDim:{kind:"u32",semantic:"rotary_dim"}},variants:[{id:"scalar",priority:0,when:["ranks.qT == 1","ranks.kT == 1","ranks.vT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","(ranks.cosT == 1 or ranks.cosT == 2)","(ranks.sinT == 1 or ranks.sinT == 2)",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")',"f16Ok(tensorDtypes.cacheKeysT)","args.cacheLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.headDim % 2 == 0","args.rotaryDim % 2 == 0","args.rotaryDim <= args.headDim","dim(shapes.qT, 0) == args.numHeads * args.headDim","dim(shapes.kT, 0) == args.numKvHeads * args.headDim","dim(shapes.vT, 0) == args.numKvHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.cosT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.rotaryDim / 2))","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.sinT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.rotaryDim / 2))"],constants:{usesF16:'tensorDtypes.cacheKeysT == "float16"',cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",numKvHeads:"args.numKvHeads",headDim:"args.headDim",rotaryDim:"args.rotaryDim",rotaryHalf:"args.rotaryDim / 2",qSize:"args.numHeads * args.headDim",kvSize:"args.numKvHeads * args.headDim"},passes:[{id:"main",name:"Qwen35DecodePartialRopeCacheKv",shader:"decode-partial-rope-cache-kv.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"ceilDiv(max(args.numHeads * args.headDim, args.numKvHeads * args.headDim), 64)"},reads:["Q","K","V","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Q","CacheKeys","CacheValues"]}]}]},assets:[["decode-partial-rope-cache-kv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const ROTARY_DIM: u32 = {{ rotaryDim }}u;
const ROTARY_HALF: u32 = {{ rotaryHalf }}u;
const Q_SIZE: u32 = {{ qSize }}u;
const KV_SIZE: u32 = {{ kvSize }}u;

fn rope_index(pos: u32, d: u32) -> u32 {
  return pos * ROTARY_HALF + d;
}

{% include "ops/_shared/kv-cache-index.wgsl.jinja" %}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let index = gid.x;
  if (params.past_len >= CACHE_LEN) { return; }
  let pos = params.past_len;
  if (index < Q_SIZE) {
    let head = index / HEAD_DIM;
    let d = index % HEAD_DIM;
    if (d < ROTARY_HALF) {
      let base = head * HEAD_DIM;
      let c = rope_cos[rope_index(pos, d)];
      let s = rope_sin[rope_index(pos, d)];
      let first = q[base + d];
      let second = q[base + d + ROTARY_HALF];
      q[base + d] = first * c - second * s;
      q[base + d + ROTARY_HALF] = second * c + first * s;
    }
  }
  if (index < KV_SIZE) {
    let head = index / HEAD_DIM;
    let d = index % HEAD_DIM;
    if (d < ROTARY_HALF) {
      let base = head * HEAD_DIM;
      let c = rope_cos[rope_index(pos, d)];
      let s = rope_sin[rope_index(pos, d)];
      let first = k[base + d];
      let second = k[base + d + ROTARY_HALF];
      cache_keys[cache_index(pos, head, d)] = {{ cacheScalar }}(first * c - second * s);
      cache_keys[cache_index(pos, head, d + ROTARY_HALF)] = {{ cacheScalar }}(second * c + first * s);
    } else if (d >= ROTARY_DIM) {
      cache_keys[cache_index(pos, head, d)] = {{ cacheScalar }}(k[index]);
    }
    cache_values[cache_index(pos, head, d)] = {{ cacheScalar }}(v[index]);
  }
}
`]]}],["com.xenova.Qwen35PrefillAssembleQkv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillAssembleQkv",sinceVersion:1,inputs:[{role:"Qg",dtype:"A",rank:2},{role:"K",dtype:"A",rank:2},{role:"V",dtype:"A",rank:2}],outputs:[{role:"Qkv",dtype:"A",rank:2,shape:["args.seqLen","args.qSize + 2 * args.kvSize"]},{role:"Gate",dtype:"A",rank:2,shape:["args.seqLen","args.qSize"]}],typeConstraints:{A:["float32","float16"]},args:{qgT:{kind:"tensor",semantic:"Qg",role:"input"},kT:{kind:"tensor",semantic:"K",role:"input"},vT:{kind:"tensor",semantic:"V",role:"input"},qkvT:{kind:"tensor",semantic:"Qkv",role:"output"},gateT:{kind:"tensor",semantic:"Gate",role:"output"},qSize:{kind:"u32",semantic:"attention_size"},kvSize:{kind:"u32",semantic:"kv_size"},headDim:{kind:"u32",semantic:"head_dim"},seqLen:{kind:"u32",semantic:"seq_len"}},variants:[{id:"scalar",priority:0,when:["ranks.qgT == 2","ranks.kT == 2","ranks.vT == 2","ranks.qkvT == 2","ranks.gateT == 2",'(tensorDtypes.qgT == "float32" or tensorDtypes.qgT == "float16")',"tensorDtypes.kT == tensorDtypes.qgT","tensorDtypes.vT == tensorDtypes.qgT","tensorDtypes.qkvT == tensorDtypes.qgT","tensorDtypes.gateT == tensorDtypes.qgT","f16Ok(tensorDtypes.qgT)","args.qSize > 0","args.kvSize > 0","args.headDim > 0","args.seqLen > 0","args.qSize % args.headDim == 0","numel(shapes.qgT) >= args.seqLen * 2 * args.qSize","numel(shapes.kT) >= args.seqLen * args.kvSize","numel(shapes.vT) >= args.seqLen * args.kvSize","numel(shapes.qkvT) >= args.seqLen * (args.qSize + 2 * args.kvSize)","numel(shapes.gateT) >= args.seqLen * args.qSize"],constants:{usesF16:'tensorDtypes.qgT == "float16"',activationScalar:"dtypes.A",qSize:"args.qSize",kvSize:"args.kvSize",headDim:"args.headDim",qkvStride:"args.qSize + 2 * args.kvSize",seqLen:"args.seqLen"},passes:[{id:"main",name:"Qwen35PrefillAssembleQkv",shader:"prefill-assemble-qkv.wgsl.jinja",bindings:[{name:"qg",arg:"qgT",semantic:"Qg",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"k_in",arg:"kT",semantic:"K",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"v_in",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"output",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"gate",arg:"gateT",semantic:"Gate",role:"output",buffer:{type:"storage"},elementType:"$activationScalar"}],dispatch:{threads:"args.seqLen * (args.qSize + 2 * args.kvSize)",workgroupSize:"64"},reads:["Qg","K","V"],writes:["Qkv","Gate"]}]}]},assets:[["prefill-assemble-qkv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const Q_SIZE: u32 = {{ qSize }}u;
const KV_SIZE: u32 = {{ kvSize }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const QKV_STRIDE: u32 = {{ qkvStride }}u;
const SEQ_LEN: u32 = {{ seqLen }}u;

fn store_act(value: f32) -> {{ activationScalar }} { return {{ activationScalar }}(value); }

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let g = gid.x + gid.y * nwg.x * 64u;
  if (g >= SEQ_LEN * QKV_STRIDE) { return; }
  let t = g / QKV_STRIDE;
  let c = g % QKV_STRIDE;
  if (c < Q_SIZE) {
    let head = c / HEAD_DIM;
    let d = c % HEAD_DIM;
    let qg_base = t * 2u * Q_SIZE + head * 2u * HEAD_DIM + d;
    qkv[g] = store_act(f32(qg[qg_base]));
    gate[t * Q_SIZE + c] = store_act(f32(qg[qg_base + HEAD_DIM]));
  } else if (c < Q_SIZE + KV_SIZE) {
    qkv[g] = store_act(f32(k_in[t * KV_SIZE + (c - Q_SIZE)]));
  } else {
    qkv[g] = store_act(f32(v_in[t * KV_SIZE + (c - Q_SIZE - KV_SIZE)]));
  }
}
`]]}],["com.xenova.Qwen35PrefillAttentionGate",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillAttentionGate",sinceVersion:1,inputs:[{role:"Attn",dtype:"A",rank:2},{role:"Gate",dtype:"A",rank:2}],outputs:[{role:"Attn",dtype:"A",rank:2,shape:["args.seqLen","args.qSize"]}],typeConstraints:{A:["float32","float16"]},args:{attnT:{kind:"tensor",semantic:"Attn",role:"inout"},gateT:{kind:"tensor",semantic:"Gate",role:"input"},seqLen:{kind:"u32",semantic:"seq_len"},qSize:{kind:"u32",semantic:"attention_size"}},variants:[{id:"scalar",priority:0,when:["ranks.attnT == 2","ranks.gateT == 2",'(tensorDtypes.attnT == "float32" or tensorDtypes.attnT == "float16")',"tensorDtypes.gateT == tensorDtypes.attnT","f16Ok(tensorDtypes.attnT)","args.seqLen > 0","args.qSize > 0","numel(shapes.attnT) >= args.seqLen * args.qSize","numel(shapes.gateT) >= args.seqLen * args.qSize"],constants:{usesF16:'tensorDtypes.attnT == "float16"',activationScalar:"dtypes.A",count:"args.seqLen * args.qSize"},passes:[{id:"main",name:"Qwen35PrefillAttentionGate",shader:"prefill-attention-gate.wgsl.jinja",bindings:[{name:"attn",arg:"attnT",semantic:"Attn",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"gate",arg:"gateT",semantic:"Gate",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"}],dispatch:{threads:"args.seqLen * args.qSize",workgroupSize:"64"},reads:["Attn","Gate"],writes:["Attn"]}]}]},assets:[["prefill-attention-gate.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const COUNT: u32 = {{ count }}u;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let i = gid.x + gid.y * nwg.x * 64u;
  if (i >= COUNT) { return; }
  attn[i] = {{ activationScalar }}(f32(attn[i]) * (1.0 / (1.0 + exp(-f32(gate[i])))));
}
`]]}],["com.xenova.Qwen35PrefillConv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillConv",sinceVersion:1,inputs:[{role:"Bcx",dtype:"A",rank:2},{role:"Weights",dtype:"W",rank:1},{role:"ConvStates",dtype:"float32",rank:1}],outputs:[{role:"Q",dtype:"float32",rank:2,shape:["args.seqLen","args.keyDim"]},{role:"K",dtype:"float32",rank:2,shape:["args.seqLen","args.keyDim"]},{role:"V",dtype:"float32",rank:2,shape:["args.seqLen","args.valueDim"]},{role:"ConvStates",dtype:"float32",rank:1,shape:["args.convDim * (args.convKernel - 1)"]}],typeConstraints:{A:["float32","float16"],W:["float32","float16"]},args:{bcxT:{kind:"tensor",semantic:"Bcx",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},convStatesT:{kind:"tensor",semantic:"ConvStates",role:"inout"},qT:{kind:"tensor",semantic:"Q",role:"output"},kT:{kind:"tensor",semantic:"K",role:"output"},vT:{kind:"tensor",semantic:"V",role:"output"},keyDim:{kind:"u32",semantic:"linear_key_dim"},valueDim:{kind:"u32",semantic:"linear_value_dim"},convDim:{kind:"u32",semantic:"linear_conv_dim"},convKernel:{kind:"u32",semantic:"linear_conv_kernel_dim"},convWeightOffset:{kind:"u32",semantic:"linear_conv_weight_offset"},seqLen:{kind:"u32",semantic:"seq_len"},realLen:{kind:"u32",semantic:"real_len",required:false}},variants:[{id:"scalar",priority:0,when:["ranks.bcxT == 2","ranks.weightsT == 1","ranks.convStatesT == 1","ranks.qT == 2","ranks.kT == 2","ranks.vT == 2",'(tensorDtypes.bcxT == "float32" or tensorDtypes.bcxT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.convStatesT == "float32"','((tensorDtypes.bcxT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.keyDim > 0","args.valueDim > 0","args.seqLen > 0","args.convKernel > 1","args.convKernel <= 64","args.convDim == 2 * args.keyDim + args.valueDim","dim(shapes.bcxT, 1) == args.convDim","numel(shapes.bcxT) >= args.seqLen * args.convDim","numel(shapes.qT) >= args.seqLen * args.keyDim","numel(shapes.kT) >= args.seqLen * args.keyDim","numel(shapes.vT) >= args.seqLen * args.valueDim","numel(shapes.convStatesT) >= args.convDim * (args.convKernel - 1)","numel(shapes.weightsT) >= args.convWeightOffset + args.convDim * args.convKernel"],constants:{usesF16:'tensorDtypes.bcxT == "float16" or tensorDtypes.weightsT == "float16"',activationScalar:"dtypes.A",weightScalar:"dtypes.W",keyDim:"args.keyDim",valueDim:"args.valueDim",convDim:"args.convDim",convKernel:"args.convKernel",convState:"args.convKernel - 1",seqLen:"args.seqLen",convWeightOffset:"args.convWeightOffset"},passes:[{id:"main",name:"Qwen35PrefillConv",shader:"prefill-conv.wgsl.jinja",bindings:[{name:"bcx",arg:"bcxT",semantic:"Bcx",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"conv_states",arg:"convStatesT",semantic:"ConvStates",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q",arg:"qT",semantic:"Q",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"0"},{name:"cache_len",type:"u32",value:"0"},{name:"seq_len",type:"u32",value:"args.seqLen"},{name:"real_len",type:"u32",value:"args.realLen if args.realLen else args.seqLen"}]}}],dispatch:{x:"args.convDim"},reads:["Bcx","Weights","ConvStates"],writes:["Q","K","V","ConvStates"]}]}]},assets:[["prefill-conv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const KEY_DIM: u32 = {{ keyDim }}u;
const VALUE_DIM: u32 = {{ valueDim }}u;
const CONV_DIM: u32 = {{ convDim }}u;
const CONV_KERNEL: u32 = {{ convKernel }}u;
const CONV_STATE: u32 = {{ convState }}u;
const SEQ_LEN: u32 = {{ seqLen }}u;
const W_CONV: u32 = {{ convWeightOffset }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> in_buf: array<f32, {{ seqLen }}>;
var<workgroup> old_state: array<f32, {{ convState }}>;

fn conv_w(c: u32, tap: u32) -> f32 { return f32(weights[W_CONV + c * CONV_KERNEL + tap]); }

fn silu(x: f32) -> f32 { return x / (1.0 + exp(-x)); }

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let c = wid.x;
  if (c >= CONV_DIM) { return; }
  let lid = lid3.x;

  if (lid < CONV_STATE) {
    old_state[lid] = conv_states[c * CONV_STATE + lid];
  }
  workgroupBarrier();

  for (var t = lid; t < SEQ_LEN; t = t + WORKGROUP_SIZE) {
    in_buf[t] = f32(bcx[t * CONV_DIM + c]);
  }
  workgroupBarrier();

  for (var t = lid; t < SEQ_LEN; t = t + WORKGROUP_SIZE) {
    var acc = 0.0;
    for (var k = 0u; k < CONV_KERNEL; k = k + 1u) {
      let j = i32(t) - i32(CONV_KERNEL - 1u) + i32(k);
      var inp = 0.0;
      if (j >= 0) {
        inp = in_buf[u32(j)];
      } else {
        inp = old_state[u32(i32(CONV_STATE) + j)];
      }
      acc = fma(conv_w(c, k), inp, acc);
    }
    let y = silu(acc);
    if (c < KEY_DIM) {
      q[t * KEY_DIM + c] = y;
    } else if (c < 2u * KEY_DIM) {
      k[t * KEY_DIM + (c - KEY_DIM)] = y;
    } else {
      v[t * VALUE_DIM + (c - 2u * KEY_DIM)] = y;
    }
  }

  if (lid < CONV_STATE) {
    let j = i32(params.real_len) - i32(CONV_STATE) + i32(lid);
    var inp = 0.0;
    if (j >= 0) {
      inp = in_buf[u32(j)];
    } else {
      inp = old_state[u32(i32(CONV_STATE) + j)];
    }
    conv_states[c * CONV_STATE + lid] = inp;
  }
}
`]]}],["com.xenova.Qwen35PrefillGatedRmsNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillGatedRmsNorm",sinceVersion:1,inputs:[{role:"X",dtype:"float32",rank:2},{role:"Z",dtype:"A",rank:2},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Y",dtype:"A",rank:2,shape:["args.seqLen","args.numValueHeads * args.valueHeadDim"]}],typeConstraints:{A:["float32","float16"],W:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},zT:{kind:"tensor",semantic:"Z",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},yT:{kind:"tensor",semantic:"Y",role:"output"},numValueHeads:{kind:"u32",semantic:"linear_num_value_heads"},valueHeadDim:{kind:"u32",semantic:"linear_value_head_dim"},normOffset:{kind:"u32",semantic:"linear_norm_offset"},rmsEps:{kind:"f32",semantic:"rms_eps"},seqLen:{kind:"u32",semantic:"seq_len"},workgroupSize:{kind:"u32",semantic:"workgroup_size"}},variants:[{id:"scalar",priority:0,when:["ranks.xT == 2","ranks.zT == 2","ranks.weightsT == 1","ranks.yT == 2",'tensorDtypes.xT == "float32"','(tensorDtypes.zT == "float32" or tensorDtypes.zT == "float16")',"tensorDtypes.yT == tensorDtypes.zT",'(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.zT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.numValueHeads > 0","args.valueHeadDim > 0","args.seqLen > 0","args.workgroupSize >= args.valueHeadDim","numel(shapes.xT) >= args.seqLen * args.numValueHeads * args.valueHeadDim","numel(shapes.zT) >= args.seqLen * args.numValueHeads * args.valueHeadDim","numel(shapes.yT) >= args.seqLen * args.numValueHeads * args.valueHeadDim","numel(shapes.weightsT) >= args.normOffset + args.valueHeadDim"],constants:{usesF16:'tensorDtypes.zT == "float16" or tensorDtypes.weightsT == "float16"',activationScalar:"dtypes.A",weightScalar:"dtypes.W",numHeads:"args.numValueHeads",headDim:"args.valueHeadDim",valueDim:"args.numValueHeads * args.valueHeadDim",normOffset:"args.normOffset",rmsEps:"args.rmsEps",workgroupSize:"args.workgroupSize"},passes:[{id:"main",name:"Qwen35PrefillGatedRmsNorm",shader:"prefill-gated-rmsnorm.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"z",arg:"zT",semantic:"Z",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$activationScalar"}],dispatch:{x:"args.numValueHeads",y:"args.seqLen"},reads:["X","Z","Weights"],writes:["Y"]}]}]},assets:[["prefill-gated-rmsnorm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HEAD_DIM: u32 = {{ headDim }}u;
const VALUE_DIM: u32 = {{ valueDim }}u;
const W_NORM: u32 = {{ normOffset }}u;
const EPS: f32 = {{ rmsEps }};
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
var<workgroup> partials: array<f32, {{ workgroupSize }}>;
{% include "ops/_shared/reduce-tree.wgsl.jinja" %}
{{ wgsl_tree_reduce_f32("reduce_sum", "sum", "partials", "WORKGROUP_SIZE") }}

fn silu(x: f32) -> f32 { return x / (1.0 + exp(-x)); }

@compute @workgroup_size({{ workgroupSize }})
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let head = wid.x;
  let token = wid.y;
  let lid = lid3.x;
  let base = token * VALUE_DIM + head * HEAD_DIM;
  var acc = 0.0;
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let value = x[base + d];
    acc = fma(value, value, acc);
  }
  let sum_sq = reduce_sum(acc, lid);
  let scale = inverseSqrt(sum_sq / f32(HEAD_DIM) + EPS);
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let idx = base + d;
    let weight = f32(weights[W_NORM + d]);
    y[idx] = {{ activationScalar }}(x[idx] * scale * weight * silu(f32(z[idx])));
  }
}
`]]}],["com.xenova.Qwen35PrefillGates",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillGates",sinceVersion:1,inputs:[{role:"Braw",dtype:"A",rank:2,optional:true},{role:"Araw",dtype:"A",rank:2,optional:true},{role:"Normed",dtype:"A",rank:2,optional:true},{role:"Weights",dtype:"W",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1,optional:true},{role:"Q1Scales",dtype:"S",rank:1,optional:true}],outputs:[{role:"Gate",dtype:"float32",rank:2,shape:["args.seqLen","2 * args.numHeads"]}],tunables:{SCALAR_WORKGROUP_SIZE:64,Q1_WORKGROUP_SIZE:64},typeConstraints:{A:["float32","float16"],W:["float32","float16"],S:["float32","float16"]},args:{brawT:{kind:"tensor",semantic:"Braw",role:"input",required:false},arawT:{kind:"tensor",semantic:"Araw",role:"input",required:false},normedT:{kind:"tensor",semantic:"Normed",role:"input",required:false},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights",required:false},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights",required:false},gateT:{kind:"tensor",semantic:"Gate",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size",required:false},bOffset:{kind:"u32",semantic:"linear_in_proj_b_q1_block_offset",required:false},aOffset:{kind:"u32",semantic:"linear_in_proj_a_q1_block_offset",required:false},numHeads:{kind:"u32",semantic:"linear_num_value_heads"},aNegExpOffset:{kind:"u32",semantic:"linear_a_neg_exp_offset"},dtBiasOffset:{kind:"u32",semantic:"linear_dt_bias_offset"},seqLen:{kind:"u32",semantic:"seq_len"}},derive:{deviceWorkgroupCap:"min(device.limits.maxComputeInvocationsPerWorkgroup, device.limits.maxComputeWorkgroupSizeX)",scalarWorkgroupLimit:"min(tunables.SCALAR_WORKGROUP_SIZE, deviceWorkgroupCap)",scalarWorkgroupSize:"max(1, pow2ceil(scalarWorkgroupLimit + 1) / 2)",q1WorkgroupLimit:"min(tunables.Q1_WORKGROUP_SIZE, deviceWorkgroupCap)",q1WorkgroupSize:"max(1, pow2ceil(q1WorkgroupLimit + 1) / 2)",foldedDispatchCapacity:"device.limits.maxComputeWorkgroupsPerDimension * device.limits.maxComputeWorkgroupsPerDimension",scalarDispatchFits:"ceilDiv(args.seqLen * args.numHeads, scalarWorkgroupSize) <= foldedDispatchCapacity",q1ResourcesFit:"q1WorkgroupSize * 32 <= device.limits.maxComputeWorkgroupStorageSize and args.seqLen * ceilDiv(args.numHeads, 4) <= device.limits.maxComputeWorkgroupsPerDimension"},variants:[{id:"scalar",priority:0,when:["present.brawT","present.arawT","not present.q1BitsT","ranks.brawT == 2","ranks.arawT == 2","ranks.weightsT == 1","ranks.gateT == 2",'(tensorDtypes.brawT == "float32" or tensorDtypes.brawT == "float16")','(tensorDtypes.arawT == "float32" or tensorDtypes.arawT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.brawT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"scalarDispatchFits","args.numHeads > 0","args.seqLen > 0","numel(shapes.brawT) >= args.seqLen * args.numHeads","numel(shapes.arawT) >= args.seqLen * args.numHeads","numel(shapes.gateT) >= args.seqLen * 2 * args.numHeads","numel(shapes.weightsT) >= args.aNegExpOffset + args.numHeads","numel(shapes.weightsT) >= args.dtBiasOffset + args.numHeads"],constants:{usesF16:'tensorDtypes.brawT == "float16" or tensorDtypes.weightsT == "float16"',activationScalar:"dtypes.A",weightScalar:"dtypes.W",workgroupSize:"scalarWorkgroupSize",numHeads:"args.numHeads",seqLen:"args.seqLen",aNegExpOffset:"args.aNegExpOffset",dtBiasOffset:"args.dtBiasOffset"},passes:[{id:"main",name:"Qwen35PrefillGates",shader:"prefill-gates.wgsl.jinja",bindings:[{name:"braw",arg:"brawT",semantic:"Braw",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"araw",arg:"arawT",semantic:"Araw",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"gate",arg:"gateT",semantic:"Gate",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{threads:"args.seqLen * args.numHeads",workgroupSize:"scalarWorkgroupSize"},reads:["Braw","Araw","Weights"],writes:["Gate"]}]},{id:"q1_fused_short",priority:10,when:["not present.brawT","not present.arawT","present.normedT","present.q1BitsT","present.q1ScalesT","ranks.normedT == 2","ranks.weightsT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.gateT == 2",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")',"f16Ok(dtypes.A) and f16Ok(dtypes.W) and f16Ok(dtypes.S)","q1ResourcesFit","args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.numHeads > 0","args.numHeads % 4 == 0","args.seqLen > 0","args.seqLen <= 16","numel(shapes.normedT) >= args.seqLen * args.hiddenSize","numel(shapes.q1BitsT) >= (args.bOffset + args.numHeads * (args.hiddenSize / 128)) * 4","numel(shapes.q1BitsT) >= (args.aOffset + args.numHeads * (args.hiddenSize / 128)) * 4","numel(shapes.q1ScalesT) >= args.bOffset + args.numHeads * (args.hiddenSize / 128)","numel(shapes.q1ScalesT) >= args.aOffset + args.numHeads * (args.hiddenSize / 128)","numel(shapes.gateT) >= args.seqLen * 2 * args.numHeads","numel(shapes.weightsT) >= args.aNegExpOffset + args.numHeads","numel(shapes.weightsT) >= args.dtBiasOffset + args.numHeads"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.q1ScalesT == "float16"',roundProjectionF16:'tensorDtypes.normedT == "float16"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",scaleScalar:"dtypes.S",workgroupSize:"q1WorkgroupSize",hiddenSize:"args.hiddenSize",inWords:"args.hiddenSize / 32",blocksPerRow:"args.hiddenSize / 128",numHeads:"args.numHeads",seqLen:"args.seqLen",bOffset:"args.bOffset",aOffset:"args.aOffset",aNegExpOffset:"args.aNegExpOffset",dtBiasOffset:"args.dtBiasOffset"},passes:[{id:"main",name:"Qwen35PrefillGatesQ1FusedShort",shader:"prefill-gates-q1-fused-short.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"gate",arg:"gateT",semantic:"Gate",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"args.seqLen * ceilDiv(args.numHeads, 4)"},reads:["Normed","Weights","Q1Bits","Q1Scales"],writes:["Gate"]}]}]},assets:[["prefill-gates-q1-fused-short.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const IN_WORDS: u32 = {{ inWords }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const HEAD_TILES: u32 = NUM_HEADS / 4u;
const SEQ_LEN: u32 = {{ seqLen }}u;
const B_OFFSET: u32 = {{ bOffset }}u;
const A_OFFSET: u32 = {{ aOffset }}u;
const W_A_NEG_EXP: u32 = {{ aNegExpOffset }}u;
const W_DT_BIAS: u32 = {{ dtBiasOffset }}u;
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;

var<workgroup> partial_b: array<vec4<f32>, {{ workgroupSize }}>;
var<workgroup> partial_a: array<vec4<f32>, {{ workgroupSize }}>;

fn softplus(x: f32) -> f32 { return log(1.0 + exp(-abs(x))) + max(x, 0.0); }

{% include "ops/_shared/q1-dot-helpers.wgsl.jinja" %}

@compute @workgroup_size({{ workgroupSize }})
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
) {
  let t = wid.x / HEAD_TILES;
  let tile = wid.x % HEAD_TILES;
  let lid = lid3.x;
  if (t >= SEQ_LEN) { return; }
  let input_base = t * (HIDDEN_SIZE / 4u);

  var b_acc = vec4<f32>(0.0);
  var a_acc = vec4<f32>(0.0);
  for (var word_index = lid; word_index < IN_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = input_base + word_index * 8u;
    let n0 = vec4<f32>(normed[base4 + 0u]);
    let n1 = vec4<f32>(normed[base4 + 1u]);
    let n2 = vec4<f32>(normed[base4 + 2u]);
    let n3 = vec4<f32>(normed[base4 + 3u]);
    let n4 = vec4<f32>(normed[base4 + 4u]);
    let n5 = vec4<f32>(normed[base4 + 5u]);
    let n6 = vec4<f32>(normed[base4 + 6u]);
    let n7 = vec4<f32>(normed[base4 + 7u]);
    b_acc += q1_dot_word_t4(B_OFFSET, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
    a_acc += q1_dot_word_t4(A_OFFSET, tile, BPR, col_block, word_id, n0, n1, n2, n3, n4, n5, n6, n7);
  }

  partial_b[lid] = b_acc;
  partial_a[lid] = a_acc;
  workgroupBarrier();
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partial_b[lid] += partial_b[lid + stride];
      partial_a[lid] += partial_a[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) { break; }
    stride = stride / 2u;
  }

  if (lid < 4u) {
    let h = tile * 4u + lid;
    let b_raw = {% if roundProjectionF16 %}f32(f16(partial_b[0][lid])){% else %}partial_b[0][lid]{% endif %};
    let a_raw = {% if roundProjectionF16 %}f32(f16(partial_a[0][lid])){% else %}partial_a[0][lid]{% endif %};
    let row = t * 2u * NUM_HEADS;
    gate[row + h] = 1.0 / (1.0 + exp(-b_raw));
    gate[row + NUM_HEADS + h] = f32(weights[W_A_NEG_EXP + h]) *
      softplus(a_raw + f32(weights[W_DT_BIAS + h]));
  }
}
`],["prefill-gates.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const SEQ_LEN: u32 = {{ seqLen }}u;
const W_A_NEG_EXP: u32 = {{ aNegExpOffset }}u;
const W_DT_BIAS: u32 = {{ dtBiasOffset }}u;

fn softplus(x: f32) -> f32 { return log(1.0 + exp(-abs(x))) + max(x, 0.0); }

@compute @workgroup_size({{ workgroupSize }})
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let g = gid.x + gid.y * nwg.x * {{ workgroupSize }}u;
  if (g >= SEQ_LEN * NUM_HEADS) { return; }
  let t = g / NUM_HEADS;
  let h = g % NUM_HEADS;
  let row = t * 2u * NUM_HEADS;
  gate[row + h] = 1.0 / (1.0 + exp(-f32(braw[t * NUM_HEADS + h])));
  gate[row + NUM_HEADS + h] = f32(weights[W_A_NEG_EXP + h]) * softplus(f32(araw[t * NUM_HEADS + h]) + f32(weights[W_DT_BIAS + h]));
}
`]]}],["com.xenova.Qwen35PrefillL2Norm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillL2Norm",sinceVersion:1,inputs:[{role:"Q",dtype:"float32",rank:2},{role:"K",dtype:"float32",rank:2}],outputs:[{role:"Q",dtype:"float32",rank:2,shape:["args.seqLen","args.numKeyHeads * args.keyHeadDim"]},{role:"K",dtype:"float32",rank:2,shape:["args.seqLen","args.numKeyHeads * args.keyHeadDim"]}],typeConstraints:{},args:{qT:{kind:"tensor",semantic:"Q",role:"inout"},kT:{kind:"tensor",semantic:"K",role:"inout"},numKeyHeads:{kind:"u32",semantic:"linear_num_key_heads"},keyHeadDim:{kind:"u32",semantic:"linear_key_head_dim"},seqLen:{kind:"u32",semantic:"seq_len"},workgroupSize:{kind:"u32",semantic:"workgroup_size"}},variants:[{id:"scalar",priority:0,when:["ranks.qT == 2","ranks.kT == 2",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"',"args.numKeyHeads > 0","args.keyHeadDim > 0","args.seqLen > 0","args.workgroupSize >= args.keyHeadDim","numel(shapes.qT) >= args.seqLen * args.numKeyHeads * args.keyHeadDim","numel(shapes.kT) >= args.seqLen * args.numKeyHeads * args.keyHeadDim"],constants:{numHeads:"args.numKeyHeads",headDim:"args.keyHeadDim",workgroupSize:"args.workgroupSize"},passes:[{id:"main",name:"Qwen35PrefillL2Norm",shader:"prefill-l2norm.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"inout",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"2 * args.numKeyHeads",y:"args.seqLen"},reads:["Q","K"],writes:["Q","K"]}]}]},assets:[["prefill-l2norm.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const KEY_DIM: u32 = {{ numHeads }}u * {{ headDim }}u;
const EPS: f32 = 1e-6;
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
var<workgroup> partials: array<f32, {{ workgroupSize }}>;
{% include "ops/_shared/reduce-tree.wgsl.jinja" %}
{{ wgsl_tree_reduce_f32("reduce_sum", "sum", "partials", "WORKGROUP_SIZE") }}

@compute @workgroup_size({{ workgroupSize }})
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let group = wid.x;
  let token = wid.y;
  let lid = lid3.x;
  let is_k = group >= NUM_HEADS;
  let head = select(group, group - NUM_HEADS, is_k);
  let base = token * KEY_DIM + head * HEAD_DIM;
  var acc = 0.0;
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    let value = select(q[base + d], k[base + d], is_k);
    acc = fma(value, value, acc);
  }
  let sum_sq = reduce_sum(acc, lid);
  let scale = inverseSqrt(sum_sq + EPS);
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    if (is_k) { k[base + d] = k[base + d] * scale; }
    else { q[base + d] = q[base + d] * scale; }
  }
}
`]]}],["com.xenova.Qwen35PrefillLinearAttention",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillLinearAttention",sinceVersion:1,inputs:[{role:"State",dtype:"float32",rank:1},{role:"Q",dtype:"float32",rank:2},{role:"K",dtype:"float32",rank:2},{role:"V",dtype:"float32",rank:2},{role:"Gate",dtype:"float32",rank:2}],outputs:[{role:"State",dtype:"float32",rank:1,shape:["args.numHeads * args.headDimK * args.headDimV"]},{role:"Out",dtype:"float32",rank:2,shape:["args.seqLen","args.numHeads * args.headDimV"]}],typeConstraints:{},args:{stateT:{kind:"tensor",semantic:"State",role:"inout"},qT:{kind:"tensor",semantic:"Q",role:"input"},kT:{kind:"tensor",semantic:"K",role:"input"},vT:{kind:"tensor",semantic:"V",role:"input"},gateT:{kind:"tensor",semantic:"Gate",role:"input"},outT:{kind:"tensor",semantic:"Out",role:"output"},numHeads:{kind:"u32",semantic:"linear_num_value_heads"},numKeyHeads:{kind:"u32",semantic:"linear_num_key_heads"},headDimK:{kind:"u32",semantic:"linear_key_head_dim"},headDimV:{kind:"u32",semantic:"linear_value_head_dim"},scale:{kind:"f32",semantic:"scale"},seqLen:{kind:"u32",semantic:"seq_len"},workgroupSize:{kind:"u32",semantic:"workgroup_size"},realLen:{kind:"u32",semantic:"real_len",required:false}},bindingSets:{laState:[{name:"state_buf",arg:"stateT",semantic:"State",role:"inout",buffer:{type:"storage"},elementType:"$stateElem"},{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"gate",arg:"gateT",semantic:"Gate",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"0"},{name:"cache_len",type:"u32",value:"0"},{name:"seq_len",type:"u32",value:"args.seqLen"},{name:"real_len",type:"u32",value:"args.realLen if args.realLen else args.seqLen"}]}}]},variants:[{id:"vec4_subgroup",priority:2,when:["ranks.stateT == 1","ranks.qT == 2","ranks.kT == 2","ranks.vT == 2","ranks.gateT == 2","f16Allowed(tensorDtypes.stateT)",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','tensorDtypes.gateT == "float32"','device.features.has("subgroups")','has(device.adapterInfo, "subgroupMinSize")',"args.seqLen >= 16","args.numHeads > 0","args.numKeyHeads > 0","args.numHeads % args.numKeyHeads == 0","args.headDimK == 128","args.headDimV > 0","args.seqLen > 0","args.realLen <= args.seqLen if args.realLen else true","ceilDiv(args.headDimK, 4) <= device.adapterInfo.subgroupMinSize","ceilDiv(args.headDimK, 4) <= device.limits.maxComputeInvocationsPerWorkgroup","ceilDiv(args.headDimK, 4) <= device.limits.maxComputeWorkgroupSizeX","numel(shapes.qT) >= args.seqLen * args.numKeyHeads * args.headDimK","numel(shapes.kT) >= args.seqLen * args.numKeyHeads * args.headDimK","numel(shapes.vT) >= args.seqLen * args.numHeads * args.headDimV","numel(shapes.gateT) >= args.seqLen * 2 * args.numHeads","dim(shapes.stateT, 0) == args.numHeads * args.headDimK * args.headDimV","numel(shapes.outT) >= args.seqLen * args.numHeads * args.headDimV"],requiredFeatures:["subgroups"],requiredSubgroupMinSize:32,constants:{numHeads:"args.numHeads",numKeyHeads:"args.numKeyHeads",headDimK:"args.headDimK",headDimV:"args.headDimV",seqLen:"args.seqLen",tileV:4,workgroupSize:"ceilDiv(args.headDimK, 4)",scale:"args.scale",stateF16:'tensorDtypes.stateT == "float16"',stateElem:'"f16" if tensorDtypes.stateT == "float16" else "f32"',useSubgroups:true},passes:[{id:"main",name:"Qwen35PrefillLinearAttention.Vec4Subgroup",shader:"prefill-linear-attention-vec4-gather.wgsl.jinja",bindings:"laState",dispatch:{x:"args.numHeads * ceilDiv(args.headDimV, 4)"},reads:["State","Q","K","V","Gate"],writes:["State","Out"]}]},{id:"vec4_gather",priority:1,when:["ranks.stateT == 1","ranks.qT == 2","ranks.kT == 2","ranks.vT == 2","ranks.gateT == 2","f16Allowed(tensorDtypes.stateT)",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','tensorDtypes.gateT == "float32"','not device.features.has("subgroups") or (tensorDtypes.stateT == "float16" and args.seqLen == 16 and (not args.realLen or args.realLen == 16) and args.numHeads == 48 and args.numKeyHeads == 16 and args.headDimK == 128 and args.headDimV == 128)',"args.numHeads > 0","args.numKeyHeads > 0","args.numHeads % args.numKeyHeads == 0","args.headDimK > 0","args.headDimK % 4 == 0","args.headDimV > 0","args.seqLen > 0","args.realLen <= args.seqLen if args.realLen else true","ceilDiv(args.headDimK, 4) <= device.limits.maxComputeInvocationsPerWorkgroup","ceilDiv(args.headDimK, 4) <= device.limits.maxComputeWorkgroupSizeX","ceilDiv(args.headDimK, 4) * 68 + 32 <= device.limits.maxComputeWorkgroupStorageSize","numel(shapes.qT) >= args.seqLen * args.numKeyHeads * args.headDimK","numel(shapes.kT) >= args.seqLen * args.numKeyHeads * args.headDimK","numel(shapes.vT) >= args.seqLen * args.numHeads * args.headDimV","numel(shapes.gateT) >= args.seqLen * 2 * args.numHeads","dim(shapes.stateT, 0) == args.numHeads * args.headDimK * args.headDimV","numel(shapes.outT) >= args.seqLen * args.numHeads * args.headDimV"],constants:{numHeads:"args.numHeads",numKeyHeads:"args.numKeyHeads",headDimK:"args.headDimK",headDimV:"args.headDimV",seqLen:"args.seqLen",tileV:8,workgroupSize:"ceilDiv(args.headDimK, 4)",scale:"args.scale",stateF16:'tensorDtypes.stateT == "float16"',stateElem:'"f16" if tensorDtypes.stateT == "float16" else "f32"',useSubgroups:false},passes:[{id:"main",name:"Qwen35PrefillLinearAttention.Vec4Gather",shader:"prefill-linear-attention-vec4-gather.wgsl.jinja",bindings:"laState",dispatch:{x:"args.numHeads * ceilDiv(args.headDimV, 8)"},reads:["State","Q","K","V","Gate"],writes:["State","Out"]}]},{id:"scalar",priority:0,when:["ranks.stateT == 1","ranks.qT == 2","ranks.kT == 2","ranks.vT == 2","ranks.gateT == 2","f16Allowed(tensorDtypes.stateT)",'tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','tensorDtypes.gateT == "float32"',"args.numHeads > 0","args.numKeyHeads > 0","args.numHeads % args.numKeyHeads == 0","args.headDimK > 0","args.headDimV > 0","args.seqLen > 0","args.realLen <= args.seqLen if args.realLen else true","args.workgroupSize >= args.headDimK","numel(shapes.qT) >= args.seqLen * args.numKeyHeads * args.headDimK","numel(shapes.kT) >= args.seqLen * args.numKeyHeads * args.headDimK","numel(shapes.vT) >= args.seqLen * args.numHeads * args.headDimV","numel(shapes.gateT) >= args.seqLen * 2 * args.numHeads","dim(shapes.stateT, 0) == args.numHeads * args.headDimK * args.headDimV","numel(shapes.outT) >= args.seqLen * args.numHeads * args.headDimV"],constants:{numHeads:"args.numHeads",numKeyHeads:"args.numKeyHeads",headDimK:"args.headDimK",headDimV:"args.headDimV",seqLen:"args.seqLen",workgroupSize:"args.workgroupSize",scale:"args.scale",stateF16:'tensorDtypes.stateT == "float16"',stateElem:'"f16" if tensorDtypes.stateT == "float16" else "f32"',useSubgroups:'device.features.has("subgroups")'},passes:[{id:"main",name:"Qwen35PrefillLinearAttention",shader:"prefill-linear-attention.wgsl.jinja",bindings:"laState",dispatch:{x:"args.numHeads * ceilDiv(args.headDimV, 8)"},reads:["State","Q","K","V","Gate"],writes:["State","Out"]}]}]},assets:[["prefill-linear-attention-vec4-gather.wgsl.jinja",`{% include "ops/_shared/linear-attention-common.wgsl.jinja" %}{% if useSubgroups %}
enable subgroups;
{% endif %}{% if stateF16 %}
enable f16;
{% endif -%}
{{ env.wgsl.resourceDeclarations }}
{{ emit_qwen35_stable_decay() }}
{{ emit_qwen35_state_rounding() }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KEY_HEADS: u32 = {{ numKeyHeads }}u;
const HEAD_DIM_K: u32 = {{ headDimK }}u;
const HEAD_DIM_V: u32 = {{ headDimV }}u;
const KEY_DIM: u32 = {{ numKeyHeads }}u * {{ headDimK }}u;
const VALUE_DIM: u32 = {{ numHeads }}u * {{ headDimV }}u;
const TILE_V: u32 = {{ tileV }}u;
const WG: u32 = {{ workgroupSize }}u;
const SCALE: f32 = {{ scale }};

{% if not useSubgroups %}
var<workgroup> red_rp: array<vec2<f32>, WG * TILE_V>;
var<workgroup> red_kq: array<f32, WG>;
{% endif %}

@compute @workgroup_size(WG)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>{% if useSubgroups %},
  @builtin(subgroup_size) sg_size: u32{% endif %}
) {
  let tid = lid3.x;
  let dk_base = tid * 4u;
  let tiles_per_head = (HEAD_DIM_V + TILE_V - 1u) / TILE_V;
  let head = wid.x / tiles_per_head;
  let tile = wid.x % tiles_per_head;
  let dv_start = tile * TILE_V;
  if (head >= NUM_HEADS) { return; }
{% if useSubgroups %}
  if (sg_size < WG) { return; }
{% endif %}

  var state: array<vec4<f32>, TILE_V>;
  for (var j = 0u; j < TILE_V; j = j + 1u) {
    let dv = dv_start + j;
    if (dv < HEAD_DIM_V) {
      let base = (head * HEAD_DIM_V + dv) * HEAD_DIM_K + dk_base;
      state[j] = vec4<f32>(
        f32(state_buf[base + 0u]), f32(state_buf[base + 1u]),
        f32(state_buf[base + 2u]), f32(state_buf[base + 3u]),
      );
    } else {
      state[j] = vec4<f32>(0.0);
    }
  }

  let real_len = params.real_len;
  for (var t = 0u; t < real_len; t = t + 1u) {
    let exp_g = {{ qwen35_decay("gate[t * 2u * NUM_HEADS + NUM_HEADS + head]") }};
    let beta_val = gate[t * 2u * NUM_HEADS + head];
    let kq_base = t * KEY_DIM + (head % NUM_KEY_HEADS) * HEAD_DIM_K + dk_base;
    let k_vec = vec4<f32>(k[kq_base + 0u], k[kq_base + 1u], k[kq_base + 2u], k[kq_base + 3u]);
    let q_vec = vec4<f32>(q[kq_base + 0u], q[kq_base + 1u], q[kq_base + 2u], q[kq_base + 3u]);

    for (var j = 0u; j < TILE_V; j = j + 1u) {
      state[j] = state[j] * exp_g;
    }
    var deltas: array<f32, TILE_V>;
{% if useSubgroups %}
    let kq_dot = subgroupAdd(dot(k_vec, q_vec));
    for (var j = 0u; j < TILE_V; j = j + 1u) {
      let dv = dv_start + j;
      let rp = subgroupAdd(vec2<f32>(dot(state[j], k_vec), dot(state[j], q_vec)));
      if (dv < HEAD_DIM_V) {
        let v_val = v[t * VALUE_DIM + head * HEAD_DIM_V + dv];
        let delta = beta_val * (v_val - rp.x);
        deltas[j] = delta;
        if (tid == 0u) {
          out[t * VALUE_DIM + head * HEAD_DIM_V + dv] = (rp.y + delta * kq_dot) * SCALE;
        }
      } else {
        deltas[j] = 0.0;
      }
    }
{% else %}
    for (var j = 0u; j < TILE_V; j = j + 1u) {
      red_rp[j * WG + tid] = vec2<f32>(dot(state[j], k_vec), dot(state[j], q_vec));
    }
    red_kq[tid] = dot(k_vec, q_vec);
    workgroupBarrier();

    if (WG == 32u && TILE_V == 8u) {
      let gather_j = tid / 4u;
      let gather_lane = tid % 4u;
      var rp0 = vec2<f32>(0.0);
      var rp1 = vec2<f32>(0.0);
      var i = gather_lane;
      for (; i + 4u < WG; i = i + 8u) {
        rp0 += red_rp[gather_j * WG + i];
        rp1 += red_rp[gather_j * WG + i + 4u];
      }
      for (; i < WG; i = i + 4u) {
        rp0 += red_rp[gather_j * WG + i];
      }
      red_rp[gather_j * WG + gather_lane] = rp0 + rp1;
      if (tid == 0u) {
{{ emit_kq_gather() }}
      }
      workgroupBarrier();
      if (tid < TILE_V) {
        let base = tid * WG;
        red_rp[base] = (red_rp[base] + red_rp[base + 1u]) +
          (red_rp[base + 2u] + red_rp[base + 3u]);
      }
    } else {

{{ emit_pair_gather(false) }}

      let kq_gather_lane = min(TILE_V, WG - 1u);
      if (tid == kq_gather_lane) {
{{ emit_kq_gather() }}
      }
    }
    workgroupBarrier();

    let kq_dot = red_kq[0];
    for (var j = 0u; j < TILE_V; j = j + 1u) {
      let dv = dv_start + j;
      if (dv < HEAD_DIM_V) {
        let rp = red_rp[j * WG];
        let v_val = v[t * VALUE_DIM + head * HEAD_DIM_V + dv];
        let delta = beta_val * (v_val - rp.x);
        deltas[j] = delta;
        if (tid == 0u) {
          out[t * VALUE_DIM + head * HEAD_DIM_V + dv] = (rp.y + delta * kq_dot) * SCALE;
        }
      } else {
        deltas[j] = 0.0;
      }
    }
{% endif %}

    for (var j = 0u; j < TILE_V; j = j + 1u) {
      let dv = dv_start + j;
      if (dv < HEAD_DIM_V) {
        let updated = state[j] + k_vec * deltas[j];
{%- if stateF16 %}
        state[j] = updated;
        if (t + 1u < real_len) {
          state[j] = qwen35_round_state4(updated);
        }
{% else %}
        state[j] = updated;
{% endif %}
        if (t + 1u == real_len) {
          let base = (head * HEAD_DIM_V + dv) * HEAD_DIM_K + dk_base;
          state_buf[base + 0u] = {% if stateF16 %}f16(state[j].x){% else %}state[j].x{% endif %};
          state_buf[base + 1u] = {% if stateF16 %}f16(state[j].y){% else %}state[j].y{% endif %};
          state_buf[base + 2u] = {% if stateF16 %}f16(state[j].z){% else %}state[j].z{% endif %};
          state_buf[base + 3u] = {% if stateF16 %}f16(state[j].w){% else %}state[j].w{% endif %};
        }
      }
    }

  }
}
`],["prefill-linear-attention.wgsl.jinja",`{% include "ops/_shared/linear-attention-common.wgsl.jinja" %}{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{% if stateF16 %}
enable f16;
{% endif -%}
{{ env.wgsl.resourceDeclarations }}
{{ emit_qwen35_stable_decay() }}
{{ emit_qwen35_state_rounding() }}

const NUM_HEADS: u32 = {{ numHeads }}u;

const NUM_KEY_HEADS: u32 = {{ numKeyHeads }}u;
const HEAD_DIM_K: u32 = {{ headDimK }}u;
const HEAD_DIM_V: u32 = {{ headDimV }}u;
const KEY_DIM: u32 = {{ numKeyHeads }}u * {{ headDimK }}u;
const VALUE_DIM: u32 = {{ numHeads }}u * {{ headDimV }}u;
const TILE_V: u32 = 8u;
const WG: u32 = {{ workgroupSize }}u;
const SCALE: f32 = {{ scale }};
var<workgroup> red_rp: array<vec2<f32>, WG * TILE_V>;
var<workgroup> red_kq: array<f32, WG>;
var<workgroup> delta_buf: array<f32, TILE_V>;

@compute @workgroup_size({{ workgroupSize }})
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let tid = lid3.x;
  let tiles_per_head = (HEAD_DIM_V + TILE_V - 1u) / TILE_V;
  let head = wid.x / tiles_per_head;
  let tile = wid.x % tiles_per_head;
  let dv_start = tile * TILE_V;
  if (head >= NUM_HEADS) { return; }

  var state: array<f32, TILE_V>;
  for (var j = 0u; j < TILE_V; j = j + 1u) {
    let dv = dv_start + j;
    if (tid < HEAD_DIM_K && dv < HEAD_DIM_V) {

      state[j] = f32(state_buf[(head * HEAD_DIM_V + dv) * HEAD_DIM_K + tid]);
    } else {
      state[j] = 0.0;
    }
  }

  let real_len = params.real_len;

  for (var t = 0u; t < real_len; t = t + 1u) {
    let exp_g = {{ qwen35_decay("gate[t * 2u * NUM_HEADS + NUM_HEADS + head]") }};
    let beta_val = gate[t * 2u * NUM_HEADS + head];
    var k_val = 0.0;
    var q_val = 0.0;
    if (tid < HEAD_DIM_K) {
      let kq_base = t * KEY_DIM + (head % NUM_KEY_HEADS) * HEAD_DIM_K + tid;
      k_val = k[kq_base];
      q_val = q[kq_base];
    }

    for (var j = 0u; j < TILE_V; j = j + 1u) {
      state[j] = state[j] * exp_g;
    }
{%- if useSubgroups %}

    let subgroup_index = tid / sg_size;
    let subgroup_count = (WG + sg_size - 1u) / sg_size;
    for (var j = 0u; j < TILE_V; j = j + 1u) {

      let sg_rp = subgroupAdd(vec2<f32>(state[j] * k_val, state[j] * q_val));
      if (sg_lid == 0u) {
        red_rp[j * WG + subgroup_index] = sg_rp;
      }
    }
    let sg_kq = subgroupAdd(k_val * q_val);
    if (sg_lid == 0u) {
      red_kq[subgroup_index] = sg_kq;
    }
    workgroupBarrier();
    if (WG != sg_size) {
      for (var j = tid; j < TILE_V; j = j + WG) {
        var rp_total = vec2<f32>(0.0);
        for (var i = 1u; i < subgroup_count; i = i + 1u) {
          rp_total = rp_total + red_rp[j * WG + i];
        }
        red_rp[j * WG] = red_rp[j * WG] + rp_total;
      }
      if (tid == 0u) {
        var kq_total = 0.0;
        for (var i = 1u; i < subgroup_count; i = i + 1u) {
          kq_total = kq_total + red_kq[i];
        }
        red_kq[0] = red_kq[0] + kq_total;
      }
      workgroupBarrier();
    }
{%- else %}

    for (var j = 0u; j < TILE_V; j = j + 1u) {
      red_rp[j * WG + tid] = vec2<f32>(state[j] * k_val, state[j] * q_val);
    }
    red_kq[tid] = k_val * q_val;
    workgroupBarrier();

{{ emit_pair_gather(true) }}
    if (tid == 0u) {
{{ emit_kq_gather() }}
    }
    workgroupBarrier();
{%- endif %}
    if (tid == 0u) {
      let kq = red_kq[0];
      for (var j = 0u; j < TILE_V; j = j + 1u) {
        let dv = dv_start + j;
        if (dv < HEAD_DIM_V) {
          let v_val = v[t * VALUE_DIM + head * HEAD_DIM_V + dv];
          let rp = red_rp[j * WG];
          let delta = beta_val * (v_val - rp.x);
          delta_buf[j] = delta;
          out[t * VALUE_DIM + head * HEAD_DIM_V + dv] = (rp.y + delta * kq) * SCALE;
        } else {
          delta_buf[j] = 0.0;
        }
      }
    }
    workgroupBarrier();

    if (tid < HEAD_DIM_K) {
      for (var j = 0u; j < TILE_V; j = j + 1u) {
        let dv = dv_start + j;
        if (dv < HEAD_DIM_V) {
          let updated = state[j] + k_val * delta_buf[j];
{%- if stateF16 %}

          state[j] = updated;
          if (t + 1u < real_len) {
            state[j] = qwen35_round_state(updated);
          }
{% else %}
          state[j] = updated;
{% endif %}
        }
      }

      if (t + 1u == real_len) {
        for (var j = 0u; j < TILE_V; j = j + 1u) {
          let dv = dv_start + j;
          if (dv < HEAD_DIM_V) {
            state_buf[(head * HEAD_DIM_V + dv) * HEAD_DIM_K + tid] = {% if stateF16 %}f16(state[j]){% else %}state[j]{% endif %};
          }
        }
      }
    }

  }
}
`]]}],["com.xenova.Qwen35PrefillPartialRopeCacheKv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Qwen35PrefillPartialRopeCacheKv",sinceVersion:1,inputs:[{role:"Qkv",dtype:"A",rank:2},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32"},{role:"RopeSin",dtype:"float32"}],outputs:[{role:"Qkv",dtype:"A",rank:2,shape:"shapes.qkvT"},{role:"CacheKeys",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]},{role:"CacheValues",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]}],typeConstraints:{A:["float32","float16"],C:["float32","float16"]},args:{qkvT:{kind:"tensor",semantic:"Qkv",role:"inout"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:false},seqLen:{kind:"u32",semantic:"seq_len"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rotaryDim:{kind:"u32",semantic:"rotary_dim"}},variants:[{id:"scalar",priority:0,when:["ranks.qkvT == 2","ranks.cacheKeysT == 1","ranks.cacheValuesT == 1",'(tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16")','(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','((tensorDtypes.qkvT != "float16" and tensorDtypes.cacheKeysT != "float16") or device.features.has("shader-f16"))',"args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.seqLen > 0","args.rotaryDim > 0","args.rotaryDim % 2 == 0","args.rotaryDim <= args.headDim","dim(shapes.qkvT, 1) == (args.numHeads + 2 * args.numKvHeads) * args.headDim","numel(shapes.cosT) >= (args.pastLen + args.seqLen) * (args.rotaryDim / 2)","numel(shapes.sinT) >= (args.pastLen + args.seqLen) * (args.rotaryDim / 2)","numel(shapes.cacheKeysT) >= args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= args.cacheLen * args.numKvHeads * args.headDim"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.cacheKeysT == "float16"',activationScalar:"dtypes.A",cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",numKvHeads:"args.numKvHeads",headDim:"args.headDim",rotaryDim:"args.rotaryDim",rotaryHalf:"args.rotaryDim / 2",qHidden:"args.numHeads * args.headDim",kvHidden:"args.numKvHeads * args.headDim",qkvStride:"(args.numHeads + 2 * args.numKvHeads) * args.headDim",qPairs:"args.numHeads * (args.rotaryDim / 2)",kvPairs:"args.numKvHeads * (args.rotaryDim / 2)",kvPass:"args.numKvHeads * (args.headDim - args.rotaryDim)",workPerToken:"args.numHeads * (args.rotaryDim / 2) + args.numKvHeads * (args.rotaryDim / 2) + args.numKvHeads * (args.headDim - args.rotaryDim) + args.numKvHeads * args.headDim"},passes:[{id:"main",name:"Qwen35PrefillPartialRopeCacheKv",shader:"prefill-partial-rope-cache-kv.wgsl.jinja",bindings:[{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"},{name:"seq_len",type:"u32",value:"args.seqLen"}]}}],dispatch:{threads:"args.seqLen * constants.workPerToken",workgroupSize:"64"},reads:["Qkv","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Qkv","CacheKeys","CacheValues"]}]}]},assets:[["prefill-partial-rope-cache-kv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const ROTARY_DIM: u32 = {{ rotaryDim }}u;
const ROTARY_HALF: u32 = {{ rotaryHalf }}u;
const Q_HIDDEN: u32 = {{ qHidden }}u;
const KV_HIDDEN: u32 = {{ kvHidden }}u;
const QKV_STRIDE: u32 = {{ qkvStride }}u;
const Q_PAIRS: u32 = {{ qPairs }}u;
const KV_PAIRS: u32 = {{ kvPairs }}u;
const KV_PASS: u32 = {{ kvPass }}u;
const PASS_PER_HEAD: u32 = {{ headDim }}u - {{ rotaryDim }}u;
const WORK_PER_TOKEN: u32 = {{ workPerToken }}u;

fn rope_index(pos: u32, d: u32) -> u32 { return pos * ROTARY_HALF + d; }

{% include "ops/_shared/kv-cache-index.wgsl.jinja" %}

fn store_cache(value: f32) -> {{ cacheScalar }} { return {{ cacheScalar }}(value); }
fn store_act(value: f32) -> {{ activationScalar }} { return {{ activationScalar }}(value); }

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let g = gid.x + gid.y * nwg.x * 64u;
  let token = g / WORK_PER_TOKEN;
  if (token >= params.seq_len) { return; }
  let pos = params.past_len + token;
  if (pos >= CACHE_LEN) { return; }
  let local = g % WORK_PER_TOKEN;
  let row = token * QKV_STRIDE;

  if (local < Q_PAIRS) {
    let head = local / ROTARY_HALF;
    let d = local % ROTARY_HALF;
    let base = row + head * HEAD_DIM;
    let rope = rope_index(pos, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    let first = f32(qkv[base + d]);
    let second = f32(qkv[base + d + ROTARY_HALF]);
    qkv[base + d] = store_act(first * c - second * s);
    qkv[base + d + ROTARY_HALF] = store_act(second * c + first * s);
    return;
  }

  var after = local - Q_PAIRS;
  if (after < KV_PAIRS) {
    let head = after / ROTARY_HALF;
    let d = after % ROTARY_HALF;
    let base = row + Q_HIDDEN + head * HEAD_DIM;
    let rope = rope_index(pos, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    let first = f32(qkv[base + d]);
    let second = f32(qkv[base + d + ROTARY_HALF]);
    cache_keys[cache_index(pos, head, d)] = store_cache(first * c - second * s);
    cache_keys[cache_index(pos, head, d + ROTARY_HALF)] = store_cache(second * c + first * s);
    return;
  }

  after = after - KV_PAIRS;
  if (after < KV_PASS) {
    let head = after / PASS_PER_HEAD;
    let d = ROTARY_DIM + (after % PASS_PER_HEAD);
    let base = row + Q_HIDDEN + head * HEAD_DIM;
    cache_keys[cache_index(pos, head, d)] = store_cache(f32(qkv[base + d]));
    return;
  }

  let v_local = after - KV_PASS;
  let head = v_local / HEAD_DIM;
  let dim = v_local % HEAD_DIM;
  let vbase = row + Q_HIDDEN + KV_HIDDEN + head * HEAD_DIM;
  cache_values[cache_index(pos, head, dim)] = store_cache(f32(qkv[vbase + dim]));
}
`]]}],["com.xenova.StridedCopy",{manifest:{schemaVersion:1,domain:"com.xenova",name:"StridedCopy",sinceVersion:1,inputs:[{role:"Src",dtype:"S"}],outputs:[{role:"Dst",dtype:"D",shape:"shapes.dstT"}],typeConstraints:{S:["float32","float16","uint32","int32"],D:["float32","float16","uint32","int32"]},args:{srcT:{kind:"tensor",semantic:"Src",role:"input"},dstT:{kind:"tensor",semantic:"Dst",role:"output"},rows:{kind:"u32",semantic:"rows"},srcStride:{kind:"u32",semantic:"srcStride"},srcStart:{kind:"u32",semantic:"srcStart",required:false},dstStride:{kind:"u32",semantic:"dstStride"},dstStart:{kind:"u32",semantic:"dstStart",required:false},copyCols:{kind:"u32",semantic:"copyCols"}},variants:[{id:"scalar",priority:0,when:"f16Ok(dtypes.S) and f16Ok(dtypes.D)",constants:{vectorized:false,usesF16:'dtypes.S == "f16" or dtypes.D == "f16"',sourceElement:"dtypes.S",destElement:"dtypes.D",destScalar:"dtypes.D",colChunk:4096},passes:[{id:"main",name:"StridedCopy",shader:"strided-copy.wgsl.jinja",bindings:[{name:"s",arg:"srcT",semantic:"Src",role:"input",buffer:{type:"read-only-storage"},elementType:"$sourceElement"},{name:"d",arg:"dstT",semantic:"Dst",role:"output",buffer:{type:"storage"},elementType:"$destElement"},{name:"p",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"copyCols",type:"u32",value:"args.copyCols"},{name:"srcStride",type:"u32",value:"args.srcStride"},{name:"srcStart",type:"u32",value:"args.srcStart if args.srcStart else 0"},{name:"dstStride",type:"u32",value:"args.dstStride"},{name:"dstStart",type:"u32",value:"args.dstStart if args.dstStart else 0"}]}}],dispatch:{workgroups:"args.rows * ceil(args.copyCols / 4096)"},reads:["Src"],writes:["Dst"]}]}]},assets:[["strided-copy.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

const COL_CHUNK: u32 = {{ colChunk }}u;
@compute @workgroup_size(64, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let colTiles = max((p.copyCols + COL_CHUNK - 1u) / COL_CHUNK, 1u);
  let flat = wg.x + wg.y * nwg.x;
  if (flat >= p.rows * colTiles) {
    return;
  }
  let r = flat / colTiles;
  let col_base = (flat - r * colTiles) * COL_CHUNK;
  let col_end = min(col_base + COL_CHUNK, p.copyCols);
  var i: u32 = col_base + lid.x;
  loop {
    if (i >= col_end) {
      break;
    }
{% if vectorized %}
    d[r * p.dstStride + p.dstStart + i] = s[r * p.srcStride + p.srcStart + i];
{% else %}
    d[r * p.dstStride + p.dstStart + i] = {{ destScalar }}(f32(s[r * p.srcStride + p.srcStart + i]));
{% endif %}
    i = i + 64u;
  }
}
`]]}],["com.xenova.SwiGlu",{manifest:{schemaVersion:1,domain:"com.xenova",name:"SwiGlu",sinceVersion:1,inputs:[{role:"X",dtype:"X",rank:2}],outputs:[{role:"Y",dtype:"Y",rank:2,shape:["args.rows","args.mlpInner"]}],typeConstraints:{X:["float32","float16"],Y:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},yT:{kind:"tensor",semantic:"Y",role:"output"},rows:{kind:"u32",semantic:"rows"},mlpInner:{kind:"u32",semantic:"mlpInner"},activation:{kind:"string",semantic:"activation",required:false,oneOf:["silu","fast_silu"]}},bindingSets:{activation:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xElement"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yElement"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"}]}}]},variants:[{id:"vec4_f16",priority:10,when:['dtypes.X == "f16"','dtypes.Y == "f16"','device.features.has("shader-f16")',"args.mlpInner % 4 == 0","ranks.xT == 2","ranks.yT == 2","args.rows == dim(shapes.xT, 0)","dim(shapes.xT, 1) == args.mlpInner * 2","dim(shapes.yT, 0) == args.rows","dim(shapes.yT, 1) == args.mlpInner"],constants:{vectorized:true,usesF16:true,fastSilu:'args.activation == "fast_silu"',xElement:'"vec4<f16>"',yElement:'"vec4<f16>"',yScalar:'"f16"',mlpInnerV4:"args.mlpInner / 4"},passes:[{id:"main",name:"SwiGlu",shader:"swiglu.wgsl.jinja",bindings:"activation",dispatch:{workgroups:"args.rows",y:"ceil((args.mlpInner / 4) / 64)"},reads:["X"],writes:["Y"]}]},{id:"vec4_f32",priority:10,when:['dtypes.X == "f32"','dtypes.Y == "f32"',"args.mlpInner % 4 == 0","ranks.xT == 2","ranks.yT == 2","args.rows == dim(shapes.xT, 0)","dim(shapes.xT, 1) == args.mlpInner * 2","dim(shapes.yT, 0) == args.rows","dim(shapes.yT, 1) == args.mlpInner"],constants:{vectorized:true,usesF16:false,fastSilu:'args.activation == "fast_silu"',xElement:'"vec4<f32>"',yElement:'"vec4<f32>"',yScalar:'"f32"',mlpInnerV4:"args.mlpInner / 4"},passes:[{id:"main",name:"SwiGlu",shader:"swiglu.wgsl.jinja",bindings:"activation",dispatch:{workgroups:"args.rows",y:"ceil((args.mlpInner / 4) / 64)"},reads:["X"],writes:["Y"]}]},{id:"scalar",priority:0,when:["ranks.xT == 2","ranks.yT == 2","args.rows == dim(shapes.xT, 0)","dim(shapes.xT, 1) == args.mlpInner * 2","dim(shapes.yT, 0) == args.rows","dim(shapes.yT, 1) == args.mlpInner","f16Ok(dtypes.X) and f16Ok(dtypes.Y)"],constants:{vectorized:false,usesF16:'dtypes.X == "f16" or dtypes.Y == "f16"',fastSilu:'args.activation == "fast_silu"',xElement:"dtypes.X",yElement:"dtypes.Y",yScalar:"dtypes.Y",mlpInner:"args.mlpInner"},passes:[{id:"main",name:"SwiGlu",shader:"swiglu.wgsl.jinja",bindings:"activation",dispatch:{workgroups:"args.rows",y:"ceil(args.mlpInner / 64)"},reads:["X"],writes:["Y"]}]}]},assets:[["swiglu.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}
{% if vectorized %}
const MLP_V4: u32 = {{ mlpInnerV4 }}u;
{% else %}
const MLP: u32 = {{ mlpInner }}u;
{% endif %}
const WG: u32 = 64u;
@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {

  let r = wg.x + wg.z * nwg.x;
  if (r >= params.rows) {
    return;
  }
  let i0 = wg.y * WG + lid.x;
{% if vectorized %}
  if (i0 >= MLP_V4) {
    return;
  }
  let row_base = r * 2u * MLP_V4;
  let x1 = vec4<f32>(x[row_base + i0]);
  let x2 = vec4<f32>(x[row_base + MLP_V4 + i0]);
{% if fastSilu %}
  let sigmoid = vec4<f32>(0.5) + vec4<f32>(0.5) * x1 / (vec4<f32>(1.0) + abs(x1));
  y[r * MLP_V4 + i0] = {{ yElement }}((x1 * sigmoid) * x2);
{% else %}
  y[r * MLP_V4 + i0] = {{ yElement }}((x1 / (vec4<f32>(1.0) + exp(-x1))) * x2);
{% endif %}
{% else %}
  if (i0 >= MLP) {
    return;
  }
  let x1 = f32(x[r * 2u * MLP + i0]);
  let x2 = f32(x[r * 2u * MLP + MLP + i0]);
{% if fastSilu %}
  let sigmoid = 0.5 + 0.5 * x1 / (1.0 + abs(x1));
  y[r * MLP + i0] = {{ yScalar }}((x1 * sigmoid) * x2);
{% else %}
  y[r * MLP + i0] = {{ yScalar }}((x1 / (1.0 + exp(-x1))) * x2);
{% endif %}
{% endif %}
}
`]]}]])});function ut(e2,t={}){let n=Ru(e2);return new qn(n.manifest,{...t,assets:n.assets})}function Ru(e2){let t=dA.get(e2);if(t){let r=new Map(cA);for(let[s,a]of t.assets)r.set(s,a);return{manifest:t.manifest,assets:Rt(r)}}let n=Lu.get(e2);if(n){let r=new Map(Pu);for(let[s,a]of n.assets)r.set(s,a);return{manifest:n.manifest,assets:Rt(r)}}return fA(e2)}function Mu(e2){let t=new Set;for(let n of Cr(e2,"<op-package>"))for(let r of Ku(n))t.add(r);return t}function Ku(e2){let t=new Set;return Ou(t,e2.passes??[]),t}function Ou(e2,t){for(let n of t)n.repeat!==void 0?Ou(e2,n.passes??[]):pA(e2,n)}function pA(e2,t){if(t.source!==void 0){t.source.kind==="template"&&t.source.shader&&e2.add(t.source.shader);return}t.shader&&e2.add(t.shader)}function fA(e2){throw new Error(`WebGPU op package ${e2} is not embedded in this runtime`)}function _a(e2,t){let n=[],r=s=>{let a=new URL(s,e2);for(let o of t(a,{withFileTypes:true})){let i=`${s}${o.name}`;o.isDirectory()?r(`${i}/`):o.isFile()&&mA(i)&&n.push(i)}};return r(""),n.sort((s,a)=>s.localeCompare(a))}function Wu(e2,t){let n=new URL(ha,e2);return _a(n,t).map(r=>`${ha}${r}`)}function zu(e2){return e2.replaceAll("\\","/").startsWith(ha)}function mA(e2){return e2.endsWith(".wgsl")||e2.endsWith(".wgsl.jinja")}var ha,cA,dA,wa=P(()=>{"use strict";Br();Rn();qu();ha="ops/_shared/",cA=new Map,dA=new Map});function ya({op:e2,toRequest:t}){let n=Object.freeze(e2.manifest.variants.map(r=>Object.freeze({id:r.id,name:r.name,version:r.version,default:r.default,priority:r.priority,requires:r.requires,passCount:r.passes.length,shaders:Object.freeze(r.passes.map(s=>s.source.shader))})));return{id:e2.manifest.id,name:e2.manifest.name,op:e2,manifest:e2.manifest,variants:n,toRequest:t,explain(r,s,a={}){return e2.explain(r,t(s,a),{variant:a.variant})},prepareExecutionPlan(r,s,a={}){return e2.prepare(r,t(s,a),{variant:a.variant})},run(r,s,a={}){return e2.run(r,t(s,a),{variant:a.variant,runOptions:a.runOptions})},clearPreparedState(){e2.clearPreparedState()}}}var Hu=P(()=>{"use strict";Rn()});var _t=P(()=>{"use strict";Tn();xn();kr();Dn();Br();wa();Hu();Rn();Rn();ma()});function Uu(e2,t=[]){let n=new Set(AA(t));return gA.filter(r=>e2.features.has(r)&&!n.has(r)).map(r=>r)}function AA(e2){return typeof e2=="string"?e2.split(",").map(t=>t.trim()).filter(Boolean):Array.isArray(e2)?[...e2]:e2 instanceof Set?[...e2]:[]}function Fu(e2,t,n,r){let s=t.info,a=n?.wgslLanguageFeatures??globalThis.navigator?.gpu?.wgslLanguageFeatures,o=r?r.min:s.subgroupMinSize,i=r?r.max:s.subgroupMaxSize;return{adapterInfo:{vendor:s.vendor,architecture:s.architecture,device:s.device,description:s.description,isFallbackAdapter:s.isFallbackAdapter===true,...typeof o=="number"?{subgroupMinSize:o}:{},...typeof i=="number"?{subgroupMaxSize:i}:{}},features:_r(e2.features),wgslLanguageFeatures:wr(a),limits:yr(e2.limits)}}function Zu(e2){return{maxBufferSize:Number(e2.limits.maxBufferSize),maxStorageBufferBindingSize:Number(e2.limits.maxStorageBufferBindingSize),maxStorageBuffersPerShaderStage:Number(e2.limits.maxStorageBuffersPerShaderStage),maxComputeWorkgroupStorageSize:Number(e2.limits.maxComputeWorkgroupStorageSize)}}function $u({adapter:e2,device:t,deviceInfo:n,destroy:r,gpu:s,syncPipelineCreation:a}){let o=a?async c=>{t.pushErrorScope("validation");let d=t.createComputePipeline(c),p=await t.popErrorScope();if(p)throw new Error(`createComputePipeline failed: ${p.message}`);return d}:c=>t.createComputePipelineAsync(c),i=0,u=0;return{gpu:s,adapter:e2,device:t,deviceInfo:n,createShaderModule:(c,d)=>t.createShaderModule({code:c,label:d}),createComputePipeline:o,createBuffer:c=>{let d=n.limits?.maxBufferSize,p=Number(c.size);if(typeof d=="number"&&p>d){let A=w=>`${(w/1048576).toFixed(1)} MB`;throw new Error(`WebGPU buffer${c.label?` "${c.label}"`:""} of ${A(p)} exceeds this device's maxBufferSize of ${A(d)}. This model is too large to run on this GPU/browser.`)}let f=t.createBuffer(c);i+=p,i>u&&(u=i);let g=f.destroy.bind(f),m=true;return f.destroy=()=>{m&&(m=false,i-=p),g()},f},memory:{get liveBytes(){return i},get peakBytes(){return u},markPeak(){u=i}},writeBuffer:(c,d,p)=>t.queue.writeBuffer(c,d,p),submit:async(c,d)=>{t.queue.submit(c),d.wait&&await t.queue.onSubmittedWorkDone()},mapRead:async(c,d,p)=>{await c.mapAsync(GPUMapMode.READ,d,p);let f=c.getMappedRange(d,p).slice(0);return c.unmap(),f},destroy:r}}var gA,Nu=P(()=>{"use strict";_t();gA=In});var wt=P(()=>{"use strict"});function Mn(e2){return e2 instanceof Error?e2.message:String(e2)}function Rr(e2){return e2.byteOffset===0&&e2.byteLength===e2.buffer.byteLength&&e2.buffer instanceof ArrayBuffer?e2.buffer:e2.slice().buffer}function Jt(e2,t){if(e2.length===0)return new Uint8Array(0);if(e2.length===1&&e2[0].byteLength===t)return e2[0];let n=new Uint8Array(t),r=0;for(let s of e2)n.set(s,r),r+=s.byteLength;return n}var Mr=P(()=>{"use strict"});function Ne(e2){let t=e2&32768?-1:1,n=e2>>>10&31,r=e2&1023;return n===31?r===0?t*(1/0):NaN:n===0?t*2**-14*(r/1024):t*2**(n-15)*(1+r/1024)}function nl(){if(!Ca){let e2=new Float32Array(65536);for(let t=0;t<e2.length;++t)e2[t]=Ne(t);Ca=e2}return Ca}function Mt(e2){let t=new Uint16Array(e2.length);if(e2 instanceof Float32Array){let n=new Uint32Array(e2.buffer,e2.byteOffset,e2.length);for(let r=0;r<e2.length;++r){let s=n[r],a=(s>>>23&255)-112;if(a>0&&a<31){let o=s&8388607,i=o&8191,u=o>>>13;(i>4096||i===4096&&(u&1)===1)&&(u+=1,u===1024&&(u=0,a+=1)),t[r]=a>=31?s>>>16&32768|31743:s>>>16&32768|a<<10|u}else t[r]=sl(s)}}else for(let n=0;n<e2.length;++n)t[n]=Sa(e2[n]);return t}function Sa(e2){return Number.isNaN(e2)?32256:(rl[0]=e2,sl(vA[0]))}function sl(e2){let t=e2>>>16&32768,n=e2>>>23&255,r=e2&8388607;if(n===255)return r!==0?32256:t|31744;let s=n-127+15;if(s>=31)return t|31743;if(s<=0){if(s<-10)return t;let l=r|8388608,c=14-s,d=1<<c-1,p=l&(1<<c)-1,f=l>>>c;return(p>d||p===d&&(f&1)===1)&&(f+=1),t|f}let a=4096,o=r&8191,i=r>>>13,u=s;return(o>a||o===a&&(i&1)===1)&&(i+=1,i===1024&&(i=0,u+=1)),u>=31?t|31743:t|u<<10|i}var Ca,rl,vA,al=P(()=>{"use strict";Ca=null;rl=new Float32Array(1),vA=new Uint32Array(rl.buffer)});function BA(e2){return typeof e2=="string"&&CA.has(e2)}function IA(e2){return typeof e2=="string"&&SA.has(e2)}function Kr(e2){if(!BA(e2))throw new Error(`Unsupported source dtype: ${e2}`)}function TA(e2){if(!IA(e2))throw new Error(`Unsupported target dtype: ${e2}`)}function Kn(e2,t){if(e2==="F32")return EA(t);if(e2==="BF16")return dl(t);if(e2==="F16")return pl(t);throw new Error(`Unsupported source dtype for float32 copy: ${e2}`)}function ol(e2,t){Kr(e2),TA(t)}function il(e2){if(e2==="F32")return 4;if(e2==="BF16"||e2==="F16")return 2;throw new Error(`Unsupported source dtype: ${e2}`)}function ul(e2){if(e2==="float32")return 4;if(e2==="float16")return 2;throw new Error(`Unsupported target dtype: ${e2}`)}function ll(e2){return new Uint8Array(e2.buffer,e2.byteOffset,e2.byteLength)}function EA(e2){let t=e2.byteLength/4;return e2.byteOffset%4===0?new Float32Array(e2.buffer,e2.byteOffset,t):GA(e2,Float32Array,4)}function cl(e2,t){if(e2==="BF16"&&t==="float32")return dl;if(e2==="BF16"&&t==="float16")return xA;if(e2==="F16"&&t==="float32")return pl;if(e2==="F32"&&t==="float16")return DA;throw new Error(`No converter for ${e2} -> ${t}`)}function GA(e2,t,n){let r=new t(e2.byteLength/n);return new Uint8Array(r.buffer).set(e2),r}function dl(e2){let t=e2.byteLength/2,n=new Float32Array(t),r=new Uint32Array(n.buffer);if(e2.byteOffset%2===0){let s=new Uint16Array(e2.buffer,e2.byteOffset,t);for(let a=0;a<t;++a)r[a]=s[a]<<16}else for(let s=0;s<t;++s){let a=e2[s*2],o=e2[s*2+1];r[s]=(o<<8|a)<<16}return n}function xA(e2){let t=e2.byteLength/2,n=new Uint16Array(t);return QA(e2,n),n}function QA(e2,t,n=0,r=1){let s=e2.byteLength/2,a=qA();if(e2.byteOffset%2===0){let o=new Uint16Array(e2.buffer,e2.byteOffset,s);for(let i=0,u=n;i<s;++i,u+=r)t[u]=a[o[i]]}else for(let o=0,i=n;o<s;++o,i+=r){let u=e2[o*2],l=e2[o*2+1];t[i]=a[l<<8|u]}return t}function DA(e2){let t=e2.byteLength/4;if(e2.byteOffset%4===0)return Mt(new Float32Array(e2.buffer,e2.byteOffset,t));let n=new Float32Array(t);return new Uint8Array(n.buffer).set(e2),Mt(n)}function pl(e2){let t=e2.byteLength/2,n=new Float32Array(t),r=nl();if(e2.byteOffset%2===0){let s=new Uint16Array(e2.buffer,e2.byteOffset,t);for(let a=0;a<t;++a)n[a]=r[s[a]]}else{let s=new DataView(e2.buffer,e2.byteOffset,e2.byteLength);for(let a=0;a<t;++a)n[a]=r[s.getUint16(a*2,true)]}return n}function LA(e2){return fl[0]=e2<<16>>>0,Sa(PA[0])}function qA(){if(Ba)return Ba;let e2=new Uint16Array(65536);for(let t=0;t<65536;++t)e2[t]=LA(t);return Ba=e2,e2}var CA,SA,fl,PA,Ba,en=P(()=>{"use strict";al();CA=new Set(["F32","BF16","F16"]),SA=new Set(["float32","float16"]);fl=new Uint32Array(1),PA=new Float32Array(fl.buffer);Ba=null});var ml=P(()=>{"use strict"});var E,tn,gl=P(()=>{"use strict";E=Object.freeze({F32:0,F16:1,Q4_0:2,Q4_1:3,Q5_0:6,Q5_1:7,Q8_0:8,Q8_1:9,Q2_K:10,Q3_K:11,Q4_K:12,Q5_K:13,Q6_K:14,Q8_K:15,IQ2_XXS:16,IQ2_XS:17,IQ3_XXS:18,IQ1_S:19,IQ4_NL:20,IQ3_S:21,IQ2_S:22,IQ4_XS:23,I8:24,I16:25,I32:26,I64:27,F64:28,IQ1_M:29,BF16:30,TQ1_0:34,TQ2_0:35,MXFP4:39,NVFP4:40,Q1_0:41}),tn=Object.freeze(Object.fromEntries(Object.entries(E).map(([e2,t])=>[t,e2])))});var Al,Ia,hl=P(()=>{Al={},Ia=new Set([2,3,6,7,8,10,11,12,13,14,16,17,18,19,20,21,22,23,29,35,39])});function yl(e2,t,n,r){let s=e2[t];if(typeof s=="number")return s;if(r!==void 0)return r;throw new Error(`${n} GGUF: missing numeric metadata "${t}"`)}function xa(e2,t){if(!Number.isInteger(t)||t<0)throw new Se(`Invalid tensor element count: ${t}`);if(e2===E.F32)return t*4;if(e2===E.F16||e2===E.BF16)return t*2;if(e2===E.Q1_0){if(t%Ta!==0)throw new Se(`Q1_0 tensor element count must be divisible by ${Ta}`);return t/Ta*OA}if(e2===E.Q4_0)return Ce(e2,t,32,18);if(e2===E.Q4_1)return Ce(e2,t,32,20);if(e2===E.Q5_0)return Ce(e2,t,32,22);if(e2===E.Q5_1)return Ce(e2,t,32,24);if(e2===E.Q8_0)return Ce(e2,t,32,34);if(e2===E.Q2_K)return Ce(e2,t,256,84);if(e2===E.Q3_K)return Ce(e2,t,256,110);if(e2===E.Q4_K)return Ce(e2,t,256,144);if(e2===E.Q5_K)return Ce(e2,t,256,176);if(e2===E.Q6_K)return Ce(e2,t,256,210);if(e2===E.IQ4_NL)return Ce(e2,t,32,18);if(e2===E.IQ4_XS)return Ce(e2,t,256,136);if(e2===E.IQ2_XXS)return Ce(e2,t,256,66);if(e2===E.IQ2_XS)return Ce(e2,t,256,74);if(e2===E.IQ2_S)return Ce(e2,t,256,82);if(e2===E.IQ3_XXS)return Ce(e2,t,256,98);if(e2===E.IQ3_S)return Ce(e2,t,256,110);if(e2===E.TQ2_0)return Ce(e2,t,WA,zA);if(e2===E.MXFP4)return Ce(e2,t,HA,UA);if(e2===E.IQ1_S)return Ce(e2,t,256,_l);if(e2===E.IQ1_M)return Ce(e2,t,256,wl);throw new Se(`Unsupported GGML tensor type ${tn[e2]??e2}`)}function Ce(e2,t,n,r){if(t%n!==0)throw new Se(`${tn[e2]??e2} tensor element count ${t} must be divisible by ${n}`);return t/n*r}function Qa(e2){return FA.has(e2)}function ZA(e2,t){let n=new DataView(t.buffer,t.byteOffset,t.byteLength);switch(e2){case E.IQ2_XXS:return r=>{let s=r>>3,a=r&7,o=s*66,i=Ne(n.getUint16(o,true)),u=n.getUint32(o+2+8*a+4,true)>>>0,l=i*(.5+(u>>>28))*.25;return[l,l]};case E.IQ2_XS:case E.IQ2_S:{let r=e2===E.IQ2_XS?74:82,s=e2===E.IQ2_XS?66:74;return a=>{let o=a>>3,i=a&7,u=o*r,l=Ne(n.getUint16(u,true)),c=t[u+s+i];return[l*(.5+(c&15))*.25,l*(.5+(c>>4))*.25]}}case E.IQ3_XXS:return r=>{let s=r>>3,a=r&7,o=s*98,i=Ne(n.getUint16(o,true)),u=n.getUint32(o+2+64+4*a,true)>>>0,l=i*(.5+(u>>>28))*.5;return[l,l]};case E.IQ3_S:return r=>{let s=r>>3,a=r&7,o=s*110,i=Ne(n.getUint16(o,true)),u=t[o+106+(a>>1)],l=(a&1)===0?i*(1+2*(u&15)):i*(1+2*(u>>4));return[l,l]};case E.TQ2_0:return r=>{let s=Ne(n.getUint16((r>>3)*66+64,true));return[s,s]};case E.IQ1_S:return r=>{let s=r>>3,a=r&7,o=s*_l,i=Ne(n.getUint16(o,true)),u=n.getUint16(o+34+2*a,true),l=i*(2*(u>>12&7)+1)/8;return[l,l]};case E.IQ1_M:return r=>{let s=r>>3,a=r&7,i=s*wl+48,u=[n.getUint16(i,true),n.getUint16(i+2,true),n.getUint16(i+4,true),n.getUint16(i+6,true)],l=Ne((u[0]>>12|u[1]>>8&240|u[2]>>4&3840|u[3]&61440)&65535),c=l*(2*(u[a>>1]>>6*(a%2)+0&7)+1),d=l*(2*(u[a>>1]>>6*(a%2)+3&7)+1);return[c/8,d/8]};default:throw new Se(`iqBlockScales: type ${e2} is not an exact-repack IQ type`)}}function bl(e2,t){if(!Qa(e2))throw new Se(`repackIQToExactInt8: type ${e2} is not an exact-repack IQ type`);let n=nn(e2,t),r=n.length/32,s=ZA(e2,t),a=new Uint32Array(r*8),o=new Float32Array(r*2);for(let i=0;i<r;++i){let[u,l]=s(i);o[i*2]=u,o[i*2+1]=l;for(let c=0;c<8;++c){let d=c<4?u:l,p=0;for(let f=0;f<4;++f){let g=i*32+c*4+f,m=d!==0?Math.round(n[g]/d):0;m>127?m=127:m<-127&&(m=-127),p|=(m&255)<<f*8}a[i*8+c]=p>>>0}}return{bits:a,scales:o}}function nn(e2,t){let n=Al[e2];if(n)return n(t);if(Ia.has(e2))throw new Se(`CPU dequantizer for ${tn[e2]??e2} is not in this bundle (built for the shipped model's weight formats — load that model's own GGUF, or rebuild)`);return null}function Wr(e2){return Ia.has(e2)}function kl(e2){return Wr(e2)||e2===E.F32||e2===E.F16||e2===E.BF16}function zr(e2){if(e2===E.F32)return"F32";if(e2===E.F16)return"F16";if(e2===E.BF16)return"BF16";throw new Se(`Unsupported GGUF scalar type ${tn[e2]??e2}; quantized types dequantize separately`)}function vl(e2,t){return nn(e2,t)??Kn(zr(e2),t)}function $A(e2){return{name:e2.name,dims:[...e2.dims],shape:[...e2.shape],type:e2.type,typeName:e2.typeName,offset:e2.offset,elementCount:e2.elementCount,byteLength:e2.byteLength,dataOffsets:[...e2.dataOffsets]}}function NA(e2){if(e2 instanceof Uint8Array)return e2;if(ArrayBuffer.isView(e2))return new Uint8Array(e2.buffer,e2.byteOffset,e2.byteLength);if(e2 instanceof ArrayBuffer)return new Uint8Array(e2);throw new Se("GGUF input must be an ArrayBuffer or Uint8Array")}function Kt(e2,t){if(e2>BigInt(Number.MAX_SAFE_INTEGER))throw new Se(`${t} ${e2} exceeds JavaScript safe integer range`);return Number(e2)}function jA(e2,t){if(e2>BigInt(Number.MAX_SAFE_INTEGER)||e2<BigInt(Number.MIN_SAFE_INTEGER))throw new Se(`${t} ${e2} exceeds JavaScript safe integer range`);return Number(e2)}function VA(e2,t){return Math.ceil(e2/t)*t}var RA,MA,KA,Ke,Ta,OA,Ga,Or,On,WA,zA,HA,UA,_l,wl,Se,He,Tv,Ev,Gv,FA,Ea,It=P(()=>{"use strict";en();ml();gl();hl();RA=1179993927,MA=32,KA=new TextDecoder("utf-8",{fatal:true}),Ke=Object.freeze({UINT8:0,INT8:1,UINT16:2,INT16:3,UINT32:4,INT32:5,FLOAT32:6,BOOL:7,STRING:8,ARRAY:9,UINT64:10,INT64:11,FLOAT64:12}),Ta=128,OA=18,Ga=32,Or=32,On=34,WA=256,zA=66,HA=32,UA=17,_l=50,wl=56;Se=class extends Error{constructor(t){super(t),this.name="GGUFError"}},He=class{#t;#e;version;tensorCount;metadataCount;metadata;alignment;dataStart;constructor(t,n={}){this.#t=NA(t);let r=new Ea(this.#t);if(r.u32()!==RA)throw new Se("Invalid GGUF magic");this.version=r.u32(),this.tensorCount=Kt(r.u64(),"tensor count"),this.metadataCount=Kt(r.u64(),"metadata count"),this.metadata={};for(let i=0;i<this.metadataCount;++i){let u=r.string();this.metadata[u]=r.metadataValue()}let a=new Map;for(let i=0;i<this.tensorCount;++i){let u=r.string(),l=Array.from({length:r.u32()},()=>Kt(r.u64(),`${u} dimension`)),c=r.u32(),d=Kt(r.u64(),`${u} offset`),p=l.reduce((f,g)=>f*g,1);a.set(u,{name:u,dims:l,shape:[...l].reverse(),type:c,typeName:tn[c]??`UNKNOWN_${c}`,offset:d,elementCount:p,byteLength:xa(c,p),dataOffsets:[0,0]})}let o=this.metadata["general.alignment"]??MA;if(typeof o!="number"||!Number.isInteger(o)||o<=0)throw new Se(`Invalid general.alignment: ${o}`);if(this.alignment=o,this.dataStart=VA(r.offset,o),!n.headerOnly){if(this.dataStart>this.#t.byteLength)throw new Se("GGUF header exceeds file size");for(let i of a.values()){let u=this.dataStart+i.offset,l=u+i.byteLength;if(l>this.#t.byteLength)throw new Se(`Tensor ${i.name} exceeds file size`);i.dataOffsets=[u,l]}}this.#e=a}names(){return[...this.#e.keys()]}has(t){return this.#e.has(t)}info(t){return $A(this.#n(t))}tensorBytes(t){let n=this.#n(t),[r,s]=n.dataOffsets;return this.#t.subarray(r,s)}tensorByteRange(t,n,r){let[s]=this.#n(t).dataOffsets;return this.#t.subarray(s+n,s+r)}async streamTensors(t,n){for(let r of t)await n(r,this.tensorBytes(r))}#n(t){let n=this.#e.get(t);if(!n)throw new Se(`Unknown tensor: ${t}`);return n}};Tv=Int8Array.from([-127,-104,-83,-65,-49,-35,-22,-10,1,13,25,38,53,69,89,113]),Ev=Int8Array.from([0,1,2,3,4,6,8,12,0,-1,-2,-3,-4,-6,-8,-12]),Gv=new DataView(new ArrayBuffer(4)),FA=new Set([E.IQ2_XXS,E.IQ2_XS,E.IQ2_S,E.IQ3_XXS,E.IQ3_S,E.TQ2_0,E.IQ1_S,E.IQ1_M]);Ea=class{bytes;view;offset;constructor(t){this.bytes=t,this.view=new DataView(t.buffer,t.byteOffset,t.byteLength),this.offset=0}u8(){this.#e(1);let t=this.view.getUint8(this.offset);return this.offset+=1,t}i8(){this.#e(1);let t=this.view.getInt8(this.offset);return this.offset+=1,t}u16(){this.#e(2);let t=this.view.getUint16(this.offset,true);return this.offset+=2,t}i16(){this.#e(2);let t=this.view.getInt16(this.offset,true);return this.offset+=2,t}u32(){this.#e(4);let t=this.view.getUint32(this.offset,true);return this.offset+=4,t}i32(){this.#e(4);let t=this.view.getInt32(this.offset,true);return this.offset+=4,t}u64(){this.#e(8);let t=this.view.getBigUint64(this.offset,true);return this.offset+=8,t}i64(){this.#e(8);let t=this.view.getBigInt64(this.offset,true);return this.offset+=8,t}f32(){this.#e(4);let t=this.view.getFloat32(this.offset,true);return this.offset+=4,t}f64(){this.#e(8);let t=this.view.getFloat64(this.offset,true);return this.offset+=8,t}string(){let t=Kt(this.u64(),"string length");this.#e(t);let n=this.bytes.subarray(this.offset,this.offset+t);return this.offset+=t,KA.decode(n)}metadataValue(){let t=this.u32();return this.#t(t)}#t(t){switch(t){case Ke.UINT8:return this.u8();case Ke.INT8:return this.i8();case Ke.UINT16:return this.u16();case Ke.INT16:return this.i16();case Ke.UINT32:return this.u32();case Ke.INT32:return this.i32();case Ke.FLOAT32:return this.f32();case Ke.BOOL:return!!this.u8();case Ke.STRING:return this.string();case Ke.UINT64:return Kt(this.u64(),"metadata uint64");case Ke.INT64:return jA(this.i64(),"metadata int64");case Ke.FLOAT64:return this.f64();case Ke.ARRAY:{let n=this.u32();if(n===Ke.ARRAY)throw new Se("Nested metadata arrays are not supported");let r=Kt(this.u64(),"metadata array length");return Array.from({length:r},()=>this.#t(n))}default:throw new Se(`Unsupported GGUF metadata type ${t}`)}}#e(t){if(this.offset+t>this.bytes.byteLength)throw new Se("Unexpected end of GGUF file")}}});async function YA(e2,t,n){let r=null;try{r=await t(e2,{method:"HEAD",signal:n})}catch{}if(r?.ok){let a=r.headers.get("content-length"),o=a===null?null:Number(a);if(a!==null&&!Number.isFinite(o))throw new Error(`Invalid content-length header: ${a}`);return{size:o,acceptsRanges:(r.headers.get("accept-ranges")??"").toLowerCase().includes("bytes")}}let s=await t(e2,{headers:{Range:"bytes=0-0"},signal:n});if(s.status===206){await s.arrayBuffer();let a=Number(s.headers.get("content-range")?.split("/").pop());return{size:Number.isFinite(a)?a:null,acceptsRanges:true}}if(s.ok){await s.body?.cancel().catch(()=>{});let a=s.headers.get("content-length"),o=a===null?null:Number(a);return{size:Number.isFinite(o??NaN)?o:null,acceptsRanges:false}}throw new Error(`HEAD ${e2} failed${r?` (${r.status} ${r.statusText})`:""} and the range probe returned ${s.status}`)}async function Pa(e2,t,{requireRangeRequests:n=false,knownSize:r=void 0,knownAcceptsRanges:s=void 0}={}){let a=t.fetch??globalThis.fetch;if(typeof a!="function")throw new Error("No fetch implementation available; pass options.fetch");let o=r,i=s;if(o===void 0){let u=await YA(e2,a,t.signal);o=u.size,i=u.acceptsRanges}else i=i!==false;if(n&&!i)throw new Error(`Range requests are required for ${e2}, but the server did not advertise Accept-Ranges: bytes`);return{url:e2,size:o??null,acceptsRanges:i,async readRange(u,l,c={}){if(u===l)return new Uint8Array(0);let d=c.signal??t.signal,p=c.onByteProgress??null;if(i){let m=await a(e2,{headers:{Range:`bytes=${u}-${l-1}`},signal:d});if(m.status!==206&&m.status!==200)throw new Error(`Range ${u}-${l-1} of ${e2} failed: ${m.status}`);if(m.status===200&&n)throw new Error(`Range ${u}-${l-1} of ${e2} returned 200 instead of 206; refusing full-response fallback`);let A=await Hr(m,{expectedLength:m.status===206?l-u:null,onByteProgress:p});if(m.status===200)return A.subarray(u,l);if(A.byteLength!==l-u)throw new Error(`Range ${u}-${l-1} returned ${A.byteLength} bytes`);return A}let f=await a(e2,{signal:d});if(!f.ok)throw new Error(`GET ${e2} failed: ${f.status}`);return(await Hr(f,{onByteProgress:p})).subarray(u,l)},async readAll(u={}){let l=u.signal??t.signal,c=u.onProgress??t.onProgress,d=await a(e2,{signal:l});if(!d.ok)throw new Error(`GET ${e2} failed: ${d.status}`);return Hr(d,{expectedLength:Number.isFinite(o)?o:null,onProgress:c,progressTotal:Number.isFinite(o)?o:null,fromCache:false})},async readTensor(){return null},async writeTensor(){},async close(){}}}async function Hr(e2,{expectedLength:t=null,onByteProgress:n=null,onProgress:r=null,progressTotal:s=null,fromCache:a=false,yieldEveryBytes:o=null}={}){if(!e2.body?.getReader){let p=await e2.arrayBuffer(),f=new Uint8Array(p);return Da({onByteProgress:n,onProgress:r,loaded:f.byteLength,delta:f.byteLength,total:s??t,fromCache:a}),f}let i=e2.body.getReader(),u=s??t??null,l=0;if(typeof t=="number"&&Number.isFinite(t)&&t>0){let p=new Uint8Array(t),f=[],g=0;for(;;){let{done:m,value:A}=await i.read();if(m)break;A&&(l+A.byteLength<=p.byteLength&&f.length===0?p.set(A,l):(f.length===0&&f.push(p.subarray(0,l)),f.push(A)),l+=A.byteLength,Da({onByteProgress:n,onProgress:r,loaded:l,delta:A.byteLength,total:u,fromCache:a}),o&&(g+=A.byteLength)>=o&&(g=0,await Cl()))}return f.length===0?l===t?p:p.subarray(0,l):Jt(f,l)}let c=[],d=0;for(;;){let{done:p,value:f}=await i.read();if(p)break;f&&(c.push(f),l+=f.byteLength,Da({onByteProgress:n,onProgress:r,loaded:l,delta:f.byteLength,total:u,fromCache:a}),o&&(d+=f.byteLength)>=o&&(d=0,await Cl()))}return Jt(c,l)}function Cl(){return new Promise(e2=>setTimeout(e2,0))}function Da({onByteProgress:e2,onProgress:t,loaded:n,delta:r,total:s,fromCache:a}){e2?.(r),t?.({loaded:n,total:s??null,fromCache:a})}var La=P(()=>{"use strict";Mr()});var qa={};bn(qa,{default:()=>rh,fileURLToPath:()=>nh,join:()=>th,open:()=>JA,readFile:()=>XA,stat:()=>eh});var Wn,XA,JA,eh,th,nh,rh,Ra=P(()=>{Wn=e2=>()=>{throw new Error("Node built-in node:fs/promises."+e2+" is unavailable in this browser bundle (node-only code path).")},XA=Wn("readFile"),JA=Wn("open"),eh=Wn("stat"),th=Wn("join"),nh=Wn("fileURLToPath"),rh={}});var Sl={};bn(Sl,{default:()=>lh,fileURLToPath:()=>uh,join:()=>ih,open:()=>ah,readFile:()=>sh,stat:()=>oh});var zn,sh,ah,oh,ih,uh,lh,Bl=P(()=>{zn=e2=>()=>{throw new Error("Node built-in node:url."+e2+" is unavailable in this browser bundle (node-only code path).")},sh=zn("readFile"),ah=zn("open"),oh=zn("stat"),ih=zn("join"),uh=zn("fileURLToPath"),lh={}});async function Hn(e2,t={},n={}){if(t.source)return t.source;if(typeof e2=="string"&&/^https?:/i.test(e2))return Pa(e2,t,n);if(typeof e2=="string"&&e2.startsWith("file:"))return Ma(new URL(e2),t);if(e2 instanceof URL){if(e2.protocol==="http:"||e2.protocol==="https:")return Pa(e2.toString(),t,n);if(e2.protocol==="file:")return Ma(e2,t);throw new Error(`Unsupported URL protocol: ${e2.protocol}`)}if(typeof e2=="string")return Ma(e2,t);throw new Error("url must be a string or URL")}async function Ma(e2,t={}){let{open:n,stat:r}=await Promise.resolve().then(()=>(Ra(),qa)),s=e2 instanceof URL?(await Promise.resolve().then(()=>(Bl(),Sl))).fileURLToPath(e2):e2,a=await r(s),o=await n(s,"r");return{url:e2.toString(),size:a.size,acceptsRanges:true,async readRange(i,u){if(i===u)return new Uint8Array(0);let l=u-i,c=new Uint8Array(l),{bytesRead:d}=await o.read(c,0,l,i);if(d!==l)throw new Error(`Short read at ${i}: expected ${l} bytes, got ${d}`);return c},async readAll(i={}){let u=i.onProgress??t.onProgress,l=new Uint8Array(a.size),c=0,d=1<<22;for(;c<a.size;){let p=Math.min(d,a.size-c),{bytesRead:f}=await o.read(l,c,p,c);if(f===0)break;c+=f,u?.({loaded:c,total:a.size,fromCache:false})}if(c!==a.size)throw new Error(`Short read on ${s}: read ${c}/${a.size} bytes`);return l},async readTensor(){return null},async writeTensor(){},async close(){await o.close()}}}var Ka=P(()=>{"use strict";La()});async function Tl(e2,t={}){let n=ch(e2),r=await dh(n,t);if(r)return r;let s=await fh(n,t);if(s)return s;let a=await Hn(e2,{fetch:t.fetch,signal:t.signal});try{let{gguf:o,bytes:i}=await Oa(a,t.signal);return await mh(n,i,t),o}finally{await a.close()}}async function Oa(e2,t){if(!e2.acceptsRanges||!e2.readRange){if(!e2.readAll)throw new Error(`GGUF source ${e2.url} supports neither ranges nor readAll()`);let a=await e2.readAll({signal:t});return{gguf:new He(a,{headerOnly:true}),bytes:a}}let n=64*1024*1024,r=e2.size,s=/^https?:/i.test(String(e2.url));for(let a=4*1024*1024;;a=s?a*2:n){let o=r!=null&&a>=r,i=r!=null?Math.min(a,r):a,u=await e2.readRange(0,i,{signal:t});try{return{gguf:new He(u,{headerOnly:true}),bytes:u}}catch(l){if(o||u.byteLength<i||a>=n)throw l}}}function ch(e2){return e2 instanceof URL?e2.toString():String(e2)}async function dh(e2,t){if(t.force||t.cache===false)return null;let n=await gh(t);if(!n)return null;let r=await n.match(e2);if(!r)return null;let s=r.body?.getReader?.();if(!s)return new He(new Uint8Array(await r.arrayBuffer()),{headerOnly:true});let a=64*1024*1024,o=[],i=0,u=4*1024*1024;try{for(;i<a;){let{done:l,value:c}=await s.read();if(l)break;if(c&&(o.push(c),i+=c.byteLength,i>=u))try{return new He(Jt(o,i),{headerOnly:true})}catch{u=i*2}}return new He(Jt(o,i),{headerOnly:true})}finally{await s.cancel().catch(()=>{})}}async function El(e2){let t=e2.cacheStorage??globalThis.caches;return t?.open?t.open((e2.cacheName??Il)+ph):null}async function fh(e2,t){if(t.force||t.cache===false)return null;let n=await El(t);if(!n)return null;let r=await n.match(e2);if(!r)return null;try{return new He(new Uint8Array(await r.arrayBuffer()),{headerOnly:true})}catch{return null}}async function mh(e2,t,n){if(n.cache===false||t.byteLength>32*1024*1024)return;let r=await El(n);if(!r)return;let s=new Response(Rr(t),{headers:{"content-type":"application/octet-stream","content-length":String(t.byteLength)}});try{await r.put(e2,s)}catch(a){typeof console<"u"&&console.warn(`gguf header cache write failed: ${Mn(a)}`)}}async function gh(e2){let t=e2.cacheStorage??globalThis.caches;return t?.open?t.open(e2.cacheName??Il):null}var Il,ph,Wa=P(()=>{"use strict";Mr();It();Ka();La();Il="gguf-v1";ph="-headers"});function za(e2,{cache:t,cacheKey:n=e2.url,force:r=false}){return{...e2,async readTensor(s,a){if(r)return null;try{return await t.get(n,s,a)}catch(o){return typeof console<"u"&&console.warn(`byte-range cache read failed: ${Mn(o)}`),null}},async writeTensor(s,a,o){try{let i=o.byteOffset===0&&o.byteLength===o.buffer.byteLength?o:new Uint8Array(o);await t.put(n,s,a,i)}catch(i){typeof console<"u"&&console.warn(`byte-range cache write failed: ${Mn(i)}`)}}}}function xl(e2){return typeof indexedDB>"u"?null:{async get(t,n,r){let s=await Ur(e2);return new Promise((a,o)=>{let i=s.transaction(rn,"readonly").objectStore(rn).get([t,n,r]);i.onsuccess=async()=>{let u=i.result;a(u?new Uint8Array(await u.arrayBuffer()):null)},i.onerror=()=>o(i.error)})},async put(t,n,r,s){let a=await Ur(e2);return new Promise((o,i)=>{let u=a.transaction(rn,"readwrite").objectStore(rn).put(new Blob([Rr(s)]),[t,n,r]);u.onsuccess=()=>o(),u.onerror=()=>i(u.error)})},async getMeta(t){let n=await Ur(e2);return new Promise((r,s)=>{let a=n.transaction(sn,"readonly").objectStore(sn).get(t);a.onsuccess=()=>r(a.result??null),a.onerror=()=>s(a.error)})},async putMeta(t,n){let r=await Ur(e2);return new Promise((s,a)=>{let o=r.transaction(sn,"readwrite").objectStore(sn).put(n,t);o.onsuccess=()=>s(),o.onerror=()=>a(o.error)})}}}function Ur(e2){let t=Gl.get(e2);if(t)return t;let n=new Promise((r,s)=>{let a=indexedDB.open(e2,2);a.onupgradeneeded=()=>{let o=a.result;o.objectStoreNames.contains(rn)||o.createObjectStore(rn),o.objectStoreNames.contains(sn)||o.createObjectStore(sn)},a.onsuccess=()=>r(a.result),a.onerror=()=>s(a.error),a.onblocked=()=>s(new Error("indexedDB open blocked"))});return Gl.set(e2,n),n}var rn,sn,Gl,Ql=P(()=>{"use strict";Mr();rn="chunks",sn="meta";Gl=new Map});function Dl(e2,{maxBytes:t,maxGap:n}){let r=[...e2].sort((o,i)=>o.begin-i.begin),s=[],a=null;for(let o of r){if(!a){a={begin:o.begin,end:o.end,tensors:[o]};continue}let i=o.begin-a.end,u=o.end-a.begin;i<=n&&u<=t?(a.end=Math.max(a.end,o.end),a.tensors.push(o)):(s.push(a),a={begin:o.begin,end:o.end,tensors:[o]})}return a&&s.push(a),s}var Pl=P(()=>{"use strict"});async function Ll(e2,t,n,{concurrency:r=wh,byteBudget:s=_h,chunkMaxBytes:a=Ah,chunkMaxGap:o=hh,signal:i,onProgress:u,onByteProgress:l}={}){if(t.length===0)return;let c=Dl(t,{maxBytes:a,maxGap:o}),d=c.reduce((A,w)=>A+(w.end-w.begin),0),p=0,f=new Map,g=(A={})=>{if(!u)return;let w=p;for(let C of f.values())w+=C;u({loaded:w,total:d,...A})},m=async A=>{let{begin:w,end:C,tensors:G}=c[A],L=C-w,Z=await Promise.all(G.map(I=>e2.readTensor(I.begin,I.end))),O=Z.every(I=>I!=null),b;if(O){b=new Uint8Array(L);for(let I=0;I<G.length;++I)b.set(Z[I],G[I].begin-w);l?.(L)}else f.set(A,0),b=await e2.readRange(w,C,{signal:i,onByteProgress:I=>{f.set(A,(f.get(A)??0)+I),l?.(I),g({fromCache:false,range:[w,C],inFlight:true})}});let S=Promise.resolve(n({begin:w,end:C,bytes:b,tensors:G})),y=O?Promise.resolve():Promise.all(G.map((I,H)=>Z[H]?null:e2.writeTensor(I.begin,I.end,b.subarray(I.begin-w,I.end-w)).catch(()=>{}))).then(()=>{});await Promise.all([S,y]),f.delete(A),p+=L,g({fromCache:O,range:[w,C]})};await new Promise((A,w)=>{let C=0,G=0,L=0,Z=c.length,O=false,b=y=>{O||(O=true,w(y))},S=()=>{if(!O){if(i?.aborted)return b(i.reason??new Error("aborted"));for(;C<c.length&&G<r;){let y=c[C].end-c[C].begin;if(G>0&&L+y>s)break;let I=C++;G++,L+=y,m(I).then(()=>{G--,L-=y,--Z===0?O||(O=true,A()):S()},b)}}};S()})}var Ah,hh,_h,wh,ql=P(()=>{"use strict";Pl();Ah=24<<20,hh=1<<20,_h=96<<20,wh=32});var yh,bh,an,Ha=P(()=>{"use strict";It();Wa();Ka();Ql();ql();yh="gguf-cache-v1",bh=32<<20,an=class e2{#t;#e;onByteProgress=null;constructor(t,n){this.#t=t,this.#e=n}static async open(t,n={}){let r=n.cacheKey??(typeof t=="string"?t:t.toString()),s=n.cache===false||n.source?null:n.chunkCache??xl(n.cacheName??yh),a=!!n.force,o={source:n.source,fetch:n.fetch,signal:n.signal};if(s&&!a)try{let u=await s.getMeta(r);if(u?.headerBytes&&Number.isFinite(u.size)){let l=new He(u.headerBytes,{headerOnly:true}),c=await Hn(t,o,{knownSize:u.size,knownAcceptsRanges:u.acceptsRanges??true});return new e2(l,za(c,{cache:s,cacheKey:r,force:a}))}}catch{}let i=await Hn(t,o);try{let{gguf:u,bytes:l}=await Oa(i,n.signal);return s&&i.size!=null&&i.acceptsRanges&&l.byteLength<=bh&&s.putMeta(r,{size:i.size,headerBytes:l,acceptsRanges:i.acceptsRanges}).catch(()=>{}),new e2(u,s?za(i,{cache:s,cacheKey:r,force:a}):i)}catch(u){throw await i.close(),u}}get metadata(){return this.#t.metadata}names(){return this.#t.names()}has(t){return this.#t.has(t)}info(t){return this.#t.info(t)}async tensorBytes(t,n={}){let r=this.#t.info(t),s=this.#t.dataStart+r.offset;return this.#n(s,s+r.byteLength,n.signal)}async tensorByteRange(t,n,r,s={}){let a=this.#t.dataStart+this.#t.info(t).offset;return this.#n(a+n,a+r,s.signal)}async#n(t,n,r){let s=await this.#e.readTensor(t,n);if(s)return this.onByteProgress?.(s.byteLength),s;let a=await this.#e.readRange(t,n,{signal:r,onByteProgress:this.onByteProgress??void 0});return await this.#e.writeTensor(t,n,a),a}async streamTensors(t,n,r={}){let s=t.map(a=>{let o=this.#t.info(a),i=this.#t.dataStart+o.offset;return{name:a,begin:i,end:i+o.byteLength}});await Ll(this.#e,s,async a=>{for(let o of a.tensors)await n(o.name,a.bytes.subarray(o.begin-a.begin,o.end-a.begin))},{concurrency:r.concurrency,chunkMaxBytes:r.chunkMaxBytes,chunkMaxGap:r.chunkMaxGap,signal:r.signal,onByteProgress:this.onByteProgress??void 0})}async close(){await this.#e.close()}}});function Ie(e2,t,n="Config"){let r=e2[t];if(typeof r!="number"||!Number.isInteger(r)||r<=0)throw new Error(`${n}.${t} must be a positive integer`);return r}function Vr(e2,t,n="Config"){for(let r of t)Ie(e2,r,n)}var Na=P(()=>{"use strict"});function Kh(e2){if(e2.rope_theta===void 0&&e2.rope_scaling==null)return;let t=e2.rope_scaling;return{rope_type:t?.rope_type??t?.type??"default",rope_theta:e2.rope_theta}}function Fn(e2){if(!e2||typeof e2!="object")throw new Error("Llama-like config must be an object");if(e2 instanceof yt)return e2;let t=e2;if(t.model_type==="llama")return new yt(t);if(t.model_type){if(typeof t.validate!="function")throw new Error("Llama-like configs with model_type must be constructed by their Config class");return e2}return new yt(t)}function ct(e2){return Array.isArray(e2.layer_types)&&e2.layer_types.some(t=>t==="conv")}function Ue(e2){return Array.isArray(e2.layer_types)&&e2.layer_types.some(t=>t==="linear_attention")}function Yr(e2){if(!Array.isArray(e2.layer_types))throw new Error("linear attention config requires layer_types");return e2.layer_types}function _e(e2,t){if(typeof e2!="number")throw new Error(`${t} must be a number`);return e2}function Xr(e2){let t=e2.num_experts;return typeof t!="number"||t<=0?null:{numExperts:t,topK:_e(e2.num_experts_per_tok,"config.num_experts_per_tok"),moeIntermediateSize:_e(e2.moe_intermediate_size,"config.moe_intermediate_size"),numDenseLayers:_e(e2.num_dense_layers,"config.num_dense_layers"),normTopkProb:e2.norm_topk_prob!==false,routedScale:typeof e2.routed_scaling_factor=="number"?e2.routed_scaling_factor:1,useExpertBias:!!e2.use_expert_bias}}function un(e2,t){return e2!==null&&t>=e2.numDenseLayers}function Tt(e2){let t=1;for(;t<e2;)t*=2;return t}function Oh(e2,t,n){if(Vr(e2,n,t),e2.hidden_size!==e2.num_attention_heads*e2.head_dim)throw new Error(`${t} hidden_size must equal num_attention_heads * head_dim for V1`);if(e2.num_attention_heads%e2.num_key_value_heads!==0)throw new Error(`${t} num_attention_heads must be divisible by num_key_value_heads`);if(e2.head_dim%2!==0)throw new Error(`${t} head_dim must be even for RoPE`)}var yt,dt=P(()=>{"use strict";Na();yt=class{vocab_size;hidden_size;intermediate_size;num_hidden_layers;num_attention_heads;num_key_value_heads;hidden_act;max_position_embeddings;initializer_range;rms_norm_eps;use_cache;pad_token_id;bos_token_id;eos_token_id;pretraining_tp;tie_word_embeddings;rope_parameters;attention_bias;attention_dropout;mlp_bias;head_dim;model_type;constructor(t={}){this.vocab_size=Ie(t,"vocab_size","LlamaConfig"),this.hidden_size=Ie(t,"hidden_size","LlamaConfig"),this.intermediate_size=Ie(t,"intermediate_size","LlamaConfig"),this.num_hidden_layers=Ie(t,"num_hidden_layers","LlamaConfig"),this.num_attention_heads=Ie(t,"num_attention_heads","LlamaConfig"),this.num_key_value_heads=t.num_key_value_heads??this.num_attention_heads,this.hidden_act=t.hidden_act,this.max_position_embeddings=Ie(t,"max_position_embeddings","LlamaConfig"),this.initializer_range=t.initializer_range,this.rms_norm_eps=t.rms_norm_eps,this.use_cache=t.use_cache,this.pad_token_id=t.pad_token_id,this.bos_token_id=t.bos_token_id,this.eos_token_id=t.eos_token_id,this.pretraining_tp=t.pretraining_tp,this.tie_word_embeddings=t.tie_word_embeddings,this.rope_parameters=t.rope_parameters??Kh(t),this.attention_bias=t.attention_bias,this.attention_dropout=t.attention_dropout,this.mlp_bias=t.mlp_bias,this.head_dim=t.head_dim??Math.floor(this.hidden_size/this.num_attention_heads),this.model_type="llama",this.validate()}validate(){if(Oh(this,"LlamaConfig",["vocab_size","hidden_size","intermediate_size","num_hidden_layers","num_attention_heads","num_key_value_heads","max_position_embeddings","head_dim"]),this.hidden_act!=="silu")throw new Error(`Unsupported Llama hidden_act for V1: ${this.hidden_act}`);if(this.attention_bias||this.mlp_bias)throw new Error("Llama megakernel V1 does not support attention_bias or mlp_bias");if(this.attention_dropout!==0)throw new Error("Llama megakernel V1 only supports attention_dropout=0");if(this.rope_parameters?.rope_type!=="default")throw new Error("Llama megakernel V1 only supports default RoPE")}toJSON(){return{...this,rope_parameters:{...this.rope_parameters}}}}});function ja(e2){let t=e2.hidden_size,n=e2.intermediate_size,r=e2.num_attention_heads*e2.head_dim,s=e2.num_key_value_heads*e2.head_dim,a=[{id:"embed_tokens",name:"model.embed_tokens.weight",length:e2.vocab_size*t}];for(let o=0;o<e2.num_hidden_layers;++o){let i=`L${o}.attn.qkv`,u=`L${o}.mlp.gate_up`;a.push({id:`layers.${o}.q_proj`,name:`model.layers.${o}.self_attn.q_proj.weight`,length:r*t,packedGroup:i},{id:`layers.${o}.k_proj`,name:`model.layers.${o}.self_attn.k_proj.weight`,length:s*t,packedGroup:i},{id:`layers.${o}.v_proj`,name:`model.layers.${o}.self_attn.v_proj.weight`,length:s*t,packedGroup:i},{id:`layers.${o}.o_proj`,name:`model.layers.${o}.self_attn.o_proj.weight`,length:t*r},{id:`layers.${o}.gate_proj`,name:`model.layers.${o}.mlp.gate_proj.weight`,length:n*t,packedGroup:u},{id:`layers.${o}.up_proj`,name:`model.layers.${o}.mlp.up_proj.weight`,length:n*t,packedGroup:u},{id:`layers.${o}.down_proj`,name:`model.layers.${o}.mlp.down_proj.weight`,length:t*n},{id:`layers.${o}.input_layernorm`,name:`model.layers.${o}.input_layernorm.weight`,length:t},{id:`layers.${o}.post_attention_layernorm`,name:`model.layers.${o}.post_attention_layernorm.weight`,length:t})}return a.push({id:"model_norm",name:"model.norm.weight",length:t},{id:"lm_head",name:"lm_head.weight",length:e2.vocab_size*t}),a}var Yl=P(()=>{"use strict"});var Wh,ln,Va=P(()=>{"use strict";en();Wh=64*1024,ln=class{runtime;tensor;constructor({runtime:t,tensor:n}){this.runtime=t,this.tensor=n}writeTensor({sourceDtype:t,targetDtype:n,sourceBytes:r,targetElementOffset:s}){ol(t,n);let a=il(t),o=ul(n);if(r.byteLength%a!==0)throw new Error(`source byte length ${r.byteLength} not divisible by ${a}`);let i=r.byteLength/a,u=s*o;if(t==="F32"&&n==="float32")return this.runtime.writeWeightsRange(this.tensor,u,r),s+i;if(t==="F16"&&n==="float16")return this.runtime.writeWeightsRange(this.tensor,u,r),s+i;let l=Math.max(1,Math.floor(Wh/o)),c=cl(t,n);for(let d=0;d<i;d+=l){let p=Math.min(l,i-d),f=r.subarray(d*a,(d+p)*a),g=c(f),m=u+d*o;this.runtime.writeWeightsRange(this.tensor,m,ll(g))}return s+i}}});var Ya=P(()=>{"use strict";Le()});function nc(e2){return sc({type:"tensor",required:true,...e2})}async function rc(e2,{source:t=null,reader:n,context:r={},concurrency:s,chunkMaxBytes:a,onProgress:o=null,signal:i}={}){let u=e2 instanceof Jr?e2:new Jr(e2);if(!n)throw new Error("WeightPlan execution requires a reader");try{u.prepare({reader:n,context:r});let l={...r,onTensorProgress:zh(u,o)};return t?await t.streamAll(c=>u.onChunk(c,l),{concurrency:s,chunkMaxBytes:a,names:u.names(),signal:i}):await u.readSequential(n,l),u.assertComplete(),u}finally{await Hh(t,n)}}async function Xl(e2,t,n){await e2.receive(t,n),n.onTensorProgress?.({name:e2.name,label:e2.progressLabel})}function zh(e2,t){if(!t)return null;let n=0,r=e2.names().length;return({name:s,label:a})=>{t({phase:"tensor",processed:++n,total:r,name:s,label:a})}}async function Hh(e2,t){let n=new Set,r=e2?[t,e2]:[t];for(let s of r){let a=s.closeTarget??s;n.has(a)||(n.add(a),await s.close())}}function sc(e2){if(!e2||typeof e2!="object")throw new Error("WeightPlan spec must be an object");if(e2.type==="tensor"){if(typeof e2.name!="string"||e2.name.length===0)throw new Error("WeightPlan tensor spec requires a name");return{required:true,...e2}}if(e2.type==="group"){if(!Array.isArray(e2.names)||e2.names.length===0)throw new Error("WeightPlan group spec requires a non-empty names array");for(let t of e2.names)if(typeof t!="string"||t.length===0)throw new Error("WeightPlan group tensor names must be non-empty strings");return{required:true,...e2}}throw new Error(`Unknown WeightPlan spec type: ${e2.type}`)}function ac(e2){return e2.rt?.metadataOnly===true}async function Uh(e2,t,n){let r=e2.transform&&!ac(n)?await e2.transform(t,n):t,s=e2.upload?await e2.upload(r,n):r;e2.run&&await e2.run(s,n),e2.assign?.(s,n),await e2.cleanup?.(s,n)}async function Fh(e2,t,n){let r=e2.transform&&!ac(n)?await e2.transform(t,n):t,s=e2.upload?await e2.upload(r,n):r;e2.run&&await e2.run(s,n),e2.assign?.(s,n),await e2.cleanup?.(s,n)}function Jl(e2,t){return e2.has(t)?e2.describe(t):null}function ec(e2,t,n=e2.type==="tensor"?e2.name:"group"){if(e2.sourceDtype&&t.dtype!==e2.sourceDtype)throw new Error(`${n} has dtype ${t.dtype}; expected ${e2.sourceDtype}`);if(e2.shape){let r=Zh(e2.shape,t.elementCount,t);if(e2.reshape){let s=r.reduce((a,o)=>a*o,1);if(s!==t.elementCount)throw new Error(`${n} has ${t.elementCount} elements; expected ${s} for reshape [${r}]`)}else if(r.length!==t.shape.length||r.some((s,a)=>s!==t.shape[a]))throw new Error(`${n} has shape [${t.shape}]; expected [${r}]`)}}function tc(e2,t,n=e2.type==="tensor"?[e2.name]:[...e2.names]){if(e2.required===false){e2.missing?.(n,t);return}throw new Error(`Missing required tensor${n.length===1?"":"s"}: ${n.join(", ")}`)}function Zh(e2,t,n){return typeof e2=="function"?e2({valueLength:t,description:n}):Array.isArray(e2)?e2:n.shape?n.shape:[t]}var Jr,oc=P(()=>{"use strict";en();Jr=class{specs;handlers;pending;constructor(t=[]){this.specs=t.map(sc),this.handlers=new Map,this.pending=new Set}prepare({reader:t,context:n={}}){this.handlers.clear(),this.pending.clear();for(let r of this.specs)if(r.type==="tensor")this.#t(r,t,n);else if(r.type==="group")this.#e(r,t,n);else throw new Error(`Unsupported weight plan spec type: ${r.type}`);return this}names(){return[...this.handlers.keys()]}async onChunk({bytes:t,tensors:n},r={}){let s=[];for(let a of n){let o=this.handlers.get(a.name);if(!o)continue;let i=t.subarray(a.offset,a.offset+a.length);s.push(Xl(o,i,r))}s.length&&await Promise.all(s)}async readSequential(t,n={}){for(let r of this.names()){let s=await t.read(r),a=this.handlers.get(r);a&&await Xl(a,s,n)}}assertComplete(){if(this.pending.size>0){let t=[...this.pending].slice(0,5).join(", ");throw new Error(`WeightPlan incomplete - ${this.pending.size} tensor(s) never arrived (first: ${t})`)}}#t(t,n,r){let s=Jl(n,t.name);if(!s){tc(t,r);return}ec(t,s),this.#n(t.name,async(a,o)=>{this.pending.delete(t.name),await Uh(t,a,{...r,...o,description:s})},t.progressLabel??t.name)}#e(t,n,r){let s={},a=t.names.filter(u=>{let l=Jl(n,u);return l&&(s[u]=l),!l});if(a.length>0){tc(t,r,a);return}for(let u of t.names)ec(t,s[u],u);let o={},i=t.names.length;for(let u of t.names)this.#n(u,async(l,c)=>{if(this.pending.delete(u),o[u]=l,--i===0)try{await Fh(t,o,{...r,...c,descriptions:s})}finally{for(let d of t.names)delete o[d]}},t.progressLabel??u)}#n(t,n,r=t){if(this.handlers.has(t))throw new Error(`Duplicate WeightPlan handler for tensor: ${t}`);this.handlers.set(t,{name:t,progressLabel:r,receive:n}),this.pending.add(t)}}});function Xa(e2){return e2.replace(/[ \t]*\/\/.*$/gm,"").replace(/\n{2,}/g,`
`).trim()}function $h(e2,t,n,r,s,a,o,i,u,l=[0,0]){let c=Math.ceil(o/t.workgroupSize),d=e2.device.limits.maxComputeWorkgroupsPerDimension,p=[{tensor:n,type:"read-only-storage",binding:0},{tensor:r,type:"storage",binding:1},{tensor:s,type:"storage",binding:2},{buffer:e2.createUniformU32([o,a,l[0],l[1]],`${t.id}-params`),type:"uniform",binding:3}];u&&p.push({tensor:u,type:"read-only-storage",binding:4});let f={name:`com.xenova.transcode.${t.id}`,source:t.buildWgsl(i),entryPoint:"main",cacheKey:`com.xenova.transcode:${t.id}:${i?"f16":"f32"}`,bindings:p,dispatchWorkgroups:[Math.min(c,d),Math.ceil(c/d),1]};return e2.runProgram(f)}function Nh(e2,t,n){let r=n.get(t.name);if(!r){let s=new Uint8Array(Math.ceil(t.data.byteLength/4)*4);s.set(t.data),r=e2.tensorFromTypedArray("uint32",[s.byteLength/4],new Uint32Array(s.buffer)),n.set(t.name,r)}return r}function es(e2,t,n,r,s,a,o,i,u,l,c=[0,0]){if(!t)throw new Error("transcode kernel for this weight format is not in this bundle (built for the shipped model's weight formats — load that model's own GGUF, or rebuild)");let d=n.byteLength%4===0&&n.byteOffset%4===0,p;if(d)p=new Uint32Array(n.buffer,n.byteOffset,n.byteLength/4);else{let m=new Uint8Array(Math.ceil(n.byteLength/4)*4);m.set(n),p=new Uint32Array(m.buffer)}let f=e2.tensorFromTypedArray("uint32",[p.length],p);l?.track(f);let g=t.grid?Nh(e2,t.grid,u):void 0;return $h(e2,t,f,r,s,a,o,i,g,c)}var cn,Ja=P(()=>{"use strict";cn=class{#t=[];track(t){this.#t.push(t)}destroyAll(){for(let t of this.#t)t.destroy?.();this.#t.length=0}}});var Oe,nt,eo,Fe,Zn,ic=P(()=>{Oe={Q1_0:{id:"q1_0_to_q1",workgroupSize:64,buildWgsl:e2=>e2?`enable f16;
@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> out_bits: array<u32>;
@group(0) @binding(2) var<storage, read_write> out_scales: array<f16>;
struct Params { numBlocks: u32, blockOffset: u32, aux0: u32, aux1: u32 }
@group(0) @binding(3) var<uniform> params: Params;
fn ss(i: u32, v: f32) { out_scales[i] = f16(v); }
fn sbyte(wordBase: u32, j: u32) -> u32 { return (src[wordBase + (j >> 2u)] >> (8u * (j & 3u))) & 0xFFu; }
fn gbyte(j: u32) -> u32 { return (src[j >> 2u] >> (8u * (j & 3u))) & 0xFFu; }
fn f16at(j: u32) -> f32 { return unpack2x16float(gbyte(j) | (gbyte(j + 1u) << 8u)).x; }
fn word32at(j: u32) -> u32 { return gbyte(j) | (gbyte(j + 1u) << 8u) | (gbyte(j + 2u) << 16u) | (gbyte(j + 3u) << 24u); }
fn load16(B: u32, out: ptr<function, array<u32, 4>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 4u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 4u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn load32(B: u32, out: ptr<function, array<u32, 8>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 8u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 8u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn b4(w: ptr<function, array<u32, 4>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
fn b8(w: ptr<function, array<u32, 8>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let bi = gid.x + gid.y * nwg.x * 64u;
  if (bi >= params.numBlocks) { return; }
  let ob = params.blockOffset + bi;
  let base = bi * 18u;
  ss(ob, f16at(base));
  var q: array<u32, 4>; load16(base + 2u, &q);
  for (var w = 0u; w < 4u; w = w + 1u) { out_bits[ob * 4u + w] = q[w]; }
}`:`@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> out_bits: array<u32>;
@group(0) @binding(2) var<storage, read_write> out_scales: array<f32>;
struct Params { numBlocks: u32, blockOffset: u32, aux0: u32, aux1: u32 }
@group(0) @binding(3) var<uniform> params: Params;
fn ss(i: u32, v: f32) { out_scales[i] = v; }
fn sbyte(wordBase: u32, j: u32) -> u32 { return (src[wordBase + (j >> 2u)] >> (8u * (j & 3u))) & 0xFFu; }
fn gbyte(j: u32) -> u32 { return (src[j >> 2u] >> (8u * (j & 3u))) & 0xFFu; }
fn f16at(j: u32) -> f32 { return unpack2x16float(gbyte(j) | (gbyte(j + 1u) << 8u)).x; }
fn word32at(j: u32) -> u32 { return gbyte(j) | (gbyte(j + 1u) << 8u) | (gbyte(j + 2u) << 16u) | (gbyte(j + 3u) << 24u); }
fn load16(B: u32, out: ptr<function, array<u32, 4>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 4u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 4u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn load32(B: u32, out: ptr<function, array<u32, 8>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 8u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 8u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn b4(w: ptr<function, array<u32, 4>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
fn b8(w: ptr<function, array<u32, 8>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let bi = gid.x + gid.y * nwg.x * 64u;
  if (bi >= params.numBlocks) { return; }
  let ob = params.blockOffset + bi;
  let base = bi * 18u;
  ss(ob, f16at(base));
  var q: array<u32, 4>; load16(base + 2u, &q);
  for (var w = 0u; w < 4u; w = w + 1u) { out_bits[ob * 4u + w] = q[w]; }
}`},Q1_0CM:{id:"q1_0_to_q1_colmajor",workgroupSize:64,buildWgsl:e2=>e2?`enable f16;
@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> out_bits: array<u32>;
@group(0) @binding(2) var<storage, read_write> out_scales: array<f16>;
struct Params { numBlocks: u32, blockOffset: u32, aux0: u32, aux1: u32 }
@group(0) @binding(3) var<uniform> params: Params;
fn ss(i: u32, v: f32) { out_scales[i] = f16(v); }
fn sbyte(wordBase: u32, j: u32) -> u32 { return (src[wordBase + (j >> 2u)] >> (8u * (j & 3u))) & 0xFFu; }
fn gbyte(j: u32) -> u32 { return (src[j >> 2u] >> (8u * (j & 3u))) & 0xFFu; }
fn f16at(j: u32) -> f32 { return unpack2x16float(gbyte(j) | (gbyte(j + 1u) << 8u)).x; }
fn word32at(j: u32) -> u32 { return gbyte(j) | (gbyte(j + 1u) << 8u) | (gbyte(j + 2u) << 16u) | (gbyte(j + 3u) << 24u); }
fn load16(B: u32, out: ptr<function, array<u32, 4>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 4u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 4u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn load32(B: u32, out: ptr<function, array<u32, 8>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 8u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 8u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn b4(w: ptr<function, array<u32, 4>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
fn b8(w: ptr<function, array<u32, 8>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let bi = gid.x + gid.y * nwg.x * 64u;
  if (bi >= params.numBlocks) { return; }
  let ob = params.blockOffset + bi;
  let base = bi * 18u;
  let bpr = params.aux0;
  let row = bi / bpr;
  let cb = bi - row * bpr;
  let dst = params.blockOffset + cb * params.aux1 + row;
  ss(dst, f16at(base));
  var q: array<u32, 4>; load16(base + 2u, &q);
  for (var w = 0u; w < 4u; w = w + 1u) { out_bits[dst * 4u + w] = q[w]; }
}`:`@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> out_bits: array<u32>;
@group(0) @binding(2) var<storage, read_write> out_scales: array<f32>;
struct Params { numBlocks: u32, blockOffset: u32, aux0: u32, aux1: u32 }
@group(0) @binding(3) var<uniform> params: Params;
fn ss(i: u32, v: f32) { out_scales[i] = v; }
fn sbyte(wordBase: u32, j: u32) -> u32 { return (src[wordBase + (j >> 2u)] >> (8u * (j & 3u))) & 0xFFu; }
fn gbyte(j: u32) -> u32 { return (src[j >> 2u] >> (8u * (j & 3u))) & 0xFFu; }
fn f16at(j: u32) -> f32 { return unpack2x16float(gbyte(j) | (gbyte(j + 1u) << 8u)).x; }
fn word32at(j: u32) -> u32 { return gbyte(j) | (gbyte(j + 1u) << 8u) | (gbyte(j + 2u) << 16u) | (gbyte(j + 3u) << 24u); }
fn load16(B: u32, out: ptr<function, array<u32, 4>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 4u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 4u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn load32(B: u32, out: ptr<function, array<u32, 8>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 8u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 8u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn b4(w: ptr<function, array<u32, 4>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
fn b8(w: ptr<function, array<u32, 8>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let bi = gid.x + gid.y * nwg.x * 64u;
  if (bi >= params.numBlocks) { return; }
  let ob = params.blockOffset + bi;
  let base = bi * 18u;
  let bpr = params.aux0;
  let row = bi / bpr;
  let cb = bi - row * bpr;
  let dst = params.blockOffset + cb * params.aux1 + row;
  ss(dst, f16at(base));
  var q: array<u32, 4>; load16(base + 2u, &q);
  for (var w = 0u; w < 4u; w = w + 1u) { out_bits[dst * 4u + w] = q[w]; }
}`},Q1_0RT:{id:"q1_0_to_q1_rowtile",workgroupSize:64,buildWgsl:e2=>e2?`enable f16;
@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> out_bits: array<u32>;
@group(0) @binding(2) var<storage, read_write> out_scales: array<f16>;
struct Params { numBlocks: u32, blockOffset: u32, aux0: u32, aux1: u32 }
@group(0) @binding(3) var<uniform> params: Params;
fn ss(i: u32, v: f32) { out_scales[i] = f16(v); }
fn sbyte(wordBase: u32, j: u32) -> u32 { return (src[wordBase + (j >> 2u)] >> (8u * (j & 3u))) & 0xFFu; }
fn gbyte(j: u32) -> u32 { return (src[j >> 2u] >> (8u * (j & 3u))) & 0xFFu; }
fn f16at(j: u32) -> f32 { return unpack2x16float(gbyte(j) | (gbyte(j + 1u) << 8u)).x; }
fn word32at(j: u32) -> u32 { return gbyte(j) | (gbyte(j + 1u) << 8u) | (gbyte(j + 2u) << 16u) | (gbyte(j + 3u) << 24u); }
fn load16(B: u32, out: ptr<function, array<u32, 4>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 4u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 4u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn load32(B: u32, out: ptr<function, array<u32, 8>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 8u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 8u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn b4(w: ptr<function, array<u32, 4>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
fn b8(w: ptr<function, array<u32, 8>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let bi = gid.x + gid.y * nwg.x * 64u;
  if (bi >= params.numBlocks) { return; }
  let ob = params.blockOffset + bi;
  let base = bi * 18u;
  let bpr = params.aux0;
  let row = bi / bpr;
  let cb = bi - row * bpr;
  let grp = (row >> 2u) * bpr + cb;
  let r = row & 3u;
  ss(params.blockOffset + grp * 4u + r, f16at(base));
  var q: array<u32, 4>; load16(base + 2u, &q);
  let dstBase = params.blockOffset * 4u + grp * 16u + r;
  for (var w = 0u; w < 4u; w = w + 1u) { out_bits[dstBase + w * 4u] = q[w]; }
}`:`@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> out_bits: array<u32>;
@group(0) @binding(2) var<storage, read_write> out_scales: array<f32>;
struct Params { numBlocks: u32, blockOffset: u32, aux0: u32, aux1: u32 }
@group(0) @binding(3) var<uniform> params: Params;
fn ss(i: u32, v: f32) { out_scales[i] = v; }
fn sbyte(wordBase: u32, j: u32) -> u32 { return (src[wordBase + (j >> 2u)] >> (8u * (j & 3u))) & 0xFFu; }
fn gbyte(j: u32) -> u32 { return (src[j >> 2u] >> (8u * (j & 3u))) & 0xFFu; }
fn f16at(j: u32) -> f32 { return unpack2x16float(gbyte(j) | (gbyte(j + 1u) << 8u)).x; }
fn word32at(j: u32) -> u32 { return gbyte(j) | (gbyte(j + 1u) << 8u) | (gbyte(j + 2u) << 16u) | (gbyte(j + 3u) << 24u); }
fn load16(B: u32, out: ptr<function, array<u32, 4>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 4u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 4u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn load32(B: u32, out: ptr<function, array<u32, 8>>) {
  let wb = B >> 2u; let sh = (B & 3u) * 8u;
  if (sh == 0u) { for (var w = 0u; w < 8u; w = w + 1u) { (*out)[w] = src[wb + w]; } }
  else { let inv = 32u - sh; var prev = src[wb]; for (var w = 0u; w < 8u; w = w + 1u) { let cur = src[wb + 1u + w]; (*out)[w] = (prev >> sh) | (cur << inv); prev = cur; } }
}
fn b4(w: ptr<function, array<u32, 4>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
fn b8(w: ptr<function, array<u32, 8>>, k: u32) -> u32 { return ((*w)[k >> 2u] >> ((k & 3u) * 8u)) & 0xFFu; }
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let bi = gid.x + gid.y * nwg.x * 64u;
  if (bi >= params.numBlocks) { return; }
  let ob = params.blockOffset + bi;
  let base = bi * 18u;
  let bpr = params.aux0;
  let row = bi / bpr;
  let cb = bi - row * bpr;
  let grp = (row >> 2u) * bpr + cb;
  let r = row & 3u;
  ss(params.blockOffset + grp * 4u + r, f16at(base));
  var q: array<u32, 4>; load16(base + 2u, &q);
  let dstBase = params.blockOffset * 4u + grp * 16u + r;
  for (var w = 0u; w < 4u; w = w + 1u) { out_bits[dstBase + w * 4u] = q[w]; }
}`}},nt={},eo={},Fe={},Zn={}});var uc,lc=P(()=>{"use strict";uc=`
fn div_exact(x: f32, s: f32, t: f32) -> f32 { let q0 = x * t; let r = fma(-s, q0, x); return fma(r, t, q0); }
fn recip_exact(s: f32) -> f32 { let t0 = 1.0 / s; let t1 = fma(fma(-s, t0, 1.0), t0, t0); return fma(fma(-s, t1, 1.0), t1, t1); }`});function jh(e2){return Xa(`${e2?`enable f16;
`:""}@group(0) @binding(0) var<storage, read> emb: array<f32>;
@group(0) @binding(1) var<storage, read_write> packed: array<u32>;
@group(0) @binding(2) var<storage, read_write> scales: array<${e2?"f16":"f32"}>;
struct P { chunkRows: u32, cols: u32, rowOffset: u32 }
@group(0) @binding(3) var<uniform> params: P;
${cc}
fn qi8(x: f32) -> i32 { return clamp(i32(r_half_up(x)), -127, 127); }
var<workgroup> wmax: array<f32, 256>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let localRow = wid.x + wid.y * nwg.x;
  if (localRow >= params.chunkRows) { return; }
  let row = params.rowOffset + localRow;
  let lid = lid3.x; let cols = params.cols; let rowOff = localRow * cols;
  var m = 0.0;
  for (var c = lid; c < cols; c = c + 256u) { m = max(m, abs(emb[rowOff + c])); }
  wmax[lid] = m; workgroupBarrier();
  for (var s = 128u; s > 0u; s = s >> 1u) { if (lid < s) { wmax[lid] = max(wmax[lid], wmax[lid + s]); } workgroupBarrier(); }
  let maxAbs = wmax[0];
  let scale = select(1.0, div_exact(maxAbs, 127.0, recip_exact(127.0)), maxAbs > 0.0);
  let inv = recip_exact(scale);
  if (lid == 0u) { scales[row] = ${e2?"f16(scale)":"scale"}; }
  let cols4 = cols >> 2u;
  for (var c4 = lid; c4 < cols4; c4 = c4 + 256u) {
    let base = rowOff + c4 * 4u;
    let q0 = qi8(emb[base] * inv); let q1 = qi8(emb[base + 1u] * inv);
    let q2 = qi8(emb[base + 2u] * inv); let q3 = qi8(emb[base + 3u] * inv);
    packed[row * cols4 + c4] = (u32(q0) & 0xFFu) | ((u32(q1) & 0xFFu) << 8u) | ((u32(q2) & 0xFFu) << 16u) | ((u32(q3) & 0xFFu) << 24u);
  }
}`)}function Vh(e2){return Xa(`${e2?`enable f16;
`:""}@group(0) @binding(0) var<storage, read> emb: array<f32>;
@group(0) @binding(1) var<storage, read_write> bits: array<u32>;
@group(0) @binding(2) var<storage, read_write> scales: array<${e2?"f16":"f32"}>;
struct P { chunkBlocks: u32, cols: u32, blkOffset: u32 }
@group(0) @binding(3) var<uniform> params: P;
${cc}
fn nib(q: i32) -> u32 { return u32(clamp(q, 0, 15)); }
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  let localBlk = gid.x + gid.y * nwg.x * 64u;
  if (localBlk >= params.chunkBlocks) { return; }
  let blk = params.blkOffset + localBlk;
  let blocksPerRow = params.cols >> 5u;
  let base = (localBlk / blocksPerRow) * params.cols + (localBlk % blocksPerRow) * 32u;
  var amax = 0.0; var vmax = 0.0;
  for (var j = 0u; j < 32u; j = j + 1u) { let v = emb[base + j]; let a = abs(v); if (a > amax) { amax = a; vmax = v; } }
  let d = vmax * -0.125;
  let id = select(0.0, recip_exact(d), d != 0.0);
  scales[blk] = ${e2?"f16(d)":"d"};
  for (var w = 0u; w < 4u; w = w + 1u) {
    var word = 0u;
    for (var bb = 0u; bb < 4u; bb = bb + 1u) {
      let k = w * 4u + bb;
      let xlo = emb[base + k] * id; let xhi = emb[base + k + 16u] * id;
      let qlo = nib(i32(r_half_up(xlo)) + 8);
      let qhi = nib(i32(r_half_up(xhi)) + 8);
      word = word | (((qlo | (qhi << 4u)) & 0xFFu) << (bb * 8u));
    }
    bits[blk * 4u + w] = word;
  }
}`)}async function to(e2,t,n,r,s,a){let o=e2.device.limits.maxComputeWorkgroupsPerDimension,i=r/4,u=r/32,l=e2.empty("uint32",[n*i]),c=e2.empty("float32",[n]),d=e2.empty("uint32",[n*u*4]),p=e2.empty(s?"float16":"float32",[n*u]),f=Math.max(1,Math.min(n,a??(Math.floor(Yh/(r*4))||1)));for(let g=0;g<n;g+=f){let m=Math.min(f,n-g),A=await t(g,m),w=A instanceof Float32Array?e2.tensorFromTypedArray("float32",[m*r],A):A;await e2.runProgram({name:"com.xenova.transcode.embedQ8Rows",source:jh(false),entryPoint:"main",cacheKey:"com.xenova.transcode:embedQ8Rows:f32",bindings:[{tensor:w,type:"read-only-storage",binding:0},{tensor:l,type:"storage",binding:1},{tensor:c,type:"storage",binding:2},{buffer:e2.createUniformU32([m,r,g,0],"embedQ8-params"),type:"uniform",binding:3}],dispatchWorkgroups:[Math.min(m,o),Math.ceil(m/o),1]});let C=m*u,G=Math.ceil(C/64);await e2.runProgram({name:"com.xenova.transcode.embedQ4Rows",source:Vh(s),entryPoint:"main",cacheKey:`com.xenova.transcode:embedQ4Rows:${s?"f16":"f32"}`,bindings:[{tensor:w,type:"read-only-storage",binding:0},{tensor:d,type:"storage",binding:1},{tensor:p,type:"storage",binding:2},{buffer:e2.createUniformU32([C,r,g*u,0],"embedQ4-params"),type:"uniform",binding:3}],dispatchWorkgroups:[Math.min(G,o),Math.ceil(G/o),1]}),await e2.queueIdle(),w.destroy?.()}return{embedQ8:l,embedQ8Scales:c,lmHeadQ4:d,lmHeadQ4Scales:p}}var cc,Yh,dc=P(()=>{"use strict";Ja();lc();cc=`${uc}
fn r_half_up(x: f32) -> f32 { return floor(x + 0.5); }`;Yh=32*1024*1024});var no=P(()=>{"use strict";Ja();ic();dc()});function dn(e2,t){let n=e2.find(r=>r.id==="lm_head");return n?!t(n.name):false}function fc({runtime:e2,entries:t,stateDict:n,tieWordEmbeddings:r=false,modelName:s="model"}){let a=pt(),o=[],i=0;for(let l of t){let c=n[l.name];if(c===void 0&&l.id==="lm_head"&&r){if(a.top.embed_tokens===void 0)throw new Error(`${s}: tied lm_head requires embed_tokens to come first in entries`);We(a,l.id,a.top.embed_tokens);continue}if(c===void 0)throw new Error(`Missing ${s} state dict weight: ${l.name}`);let d=Xh(c,l.name);if(l.transform&&(d=l.transform(d,l.shape)),d.length!==l.length)throw new Error(`Weight ${l.name} length ${d.length} does not match expected ${l.length}`);We(a,l.id,i),o.push(d),i+=d.length}let u=t_(o,i,Float32Array);return{weights:e2.tensorFromTypedArray("float32",[u.length],u),offsets:a}}function ns(e2=8*1024*1024){let t=0;return n=>(t+=n,t<e2?Promise.resolve():(t=0,new Promise(r=>setTimeout(r,0))))}async function ro({runtime:e2,config:t,entries:n,reader:r,source:s=null,canUseFloat16:a=pn,canUseQ8LmHead:o=so,canUseQ4LmHead:i=ao,modelName:u="model",onProgress:l=null,signal:c,skipDenseIds:d}){let p=!!e2.device.features.has("shader-f16")&&a(t),f=p?"float16":"float32",g=p?2:4,m=dn(n,h=>r.has(h)),A=pt(),w=[],C=0;for(let h of n){if(d?.has(h.id))continue;if(h.id==="lm_head"&&m){if(A.top.embed_tokens===void 0)throw new Error(`${u}: tied lm_head requires embed_tokens to come first in entries`);We(A,h.id,A.top.embed_tokens),w.push({entry:h,tied:true});continue}let _=r.describe(h.name);if(Kr(_.dtype),_.elementCount!==h.length)throw new Error(`${u} tensor ${h.name} length ${_.elementCount} does not match expected ${h.length}`);We(A,h.id,C),w.push({entry:h,tied:false,sourceDtype:_.dtype,sourceShape:_.shape,elementOffset:C}),C+=h.length}let G=e2.allocateWeightsBuffer({byteLength:C*g,dtype:f,shape:[C],label:`${u}-weights`}),L=new ln({runtime:e2,tensor:G}),Z=p&&i(t),O=p&&!Z&&o(t),b=Z||O,S=null,y=null,I=w.filter(h=>!h.tied),H=0,W=ns(),x=[];for(let h of I)x.push(nc({name:h.entry.name,sourceDtype:h.sourceDtype,run:async _=>{let k=h.sourceDtype,v=_;if(h.entry.transform){let V=Kn(h.sourceDtype,_),j=h.entry.transform(V,h.sourceShape);k="F32",v=new Uint8Array(j.buffer,j.byteOffset,j.byteLength)}if(L.writeTensor({sourceDtype:k,targetDtype:f,sourceBytes:v,targetElementOffset:h.elementOffset}),b&&(h.entry.id==="embed_tokens"||h.entry.id==="lm_head")){let V=Kn(h.sourceDtype,_);h.entry.id==="embed_tokens"?S=V:y=V}H+=1,l?.({processed:H,total:I.length,name:h.entry.name}),await W(_.byteLength)}}));await rc(x,{reader:r,source:s,signal:c});for(let h of w)h.tied&&b&&h.entry.id==="lm_head"&&(y=S);b&&y&&await W(1/0);let q=Z&&y?Jh(y,t.vocab_size,t.hidden_size):null,R=O&&y?e_(y,t.vocab_size,t.hidden_size):null,D=e2.device.features.has("shader-f16");return{weights:G,offsets:A,lmHeadQ4:q?e2.tensorFromTypedArray("uint32",[q.bits.length],q.bits):null,lmHeadQ4Scales:q?D?e2.tensorFromTypedArray("float16",[q.scales.length],Mt(q.scales)):e2.tensorFromTypedArray("float32",[q.scales.length],q.scales):null,lmHeadQ8:R?e2.tensorFromTypedArray("uint32",[R.packed.length],R.packed):null,lmHeadQ8Scales:R?e2.tensorFromTypedArray("float32",[R.scales.length],R.scales):null,packs:{},cacheDtype:f}}function Xh(e2,t){if(e2 instanceof Float32Array)return e2;if(n_(e2))return Float32Array.from(e2);if(Array.isArray(e2))return Float32Array.from(e2.flat(1/0));throw new Error(`Weight ${t} must be a Float32Array or array`)}function pt(){return{top:{},layers:[]}}function We(e2,t,n){let r=/^layers\.(\d+)\.(.+)$/.exec(t);if(!r){e2.top[t]=n;return}let s=Number(r[1]);(e2.layers[s]??={})[r[2]]=n}function ft(e2,t){let n=/^layers\.(\d+)\.(.+)$/.exec(t);return n?e2.layers[Number(n[1])]?.[n[2]]:e2.top[t]}function pn(e2){return e2.hidden_size%4===0&&e2.intermediate_size%4===0}function so(e2){return e2.hidden_size%4===0}function ao(e2){return e2.hidden_size%32===0}function Jh(e2,t,n){let r=n/32,s=t*r,a=new Uint32Array(s*4),o=new Float32Array(s);for(let i=0;i<t;++i)for(let u=0;u<r;++u){let l=i*n+u*32,c=0,d=0;for(let m=0;m<32;++m){let A=e2[l+m];Math.abs(A)>c&&(c=Math.abs(A),d=A)}let p=d/-8,f=p!==0?1/p:0,g=i*r+u;o[g]=p;for(let m=0;m<4;++m){let A=0;for(let w=0;w<4;++w){let C=m*4+w,G=pc(Math.round(e2[l+C]*f)+8),L=pc(Math.round(e2[l+C+16]*f)+8);A|=((G|L<<4)&255)<<w*8}a[g*4+m]=A>>>0}}return{bits:a,scales:o}}function pc(e2){return e2<0?0:e2>15?15:e2}function e_(e2,t,n){let r=n/4,s=new Uint32Array(t*r),a=new Float32Array(t);for(let o=0;o<t;++o){let i=o*n,u=0;for(let c=0;c<n;++c)u=Math.max(u,Math.abs(e2[i+c]));let l=u>0?u/127:1;a[o]=l;for(let c=0;c<r;++c){let d=i+c*4,p=ts(e2[d]/l),f=ts(e2[d+1]/l),g=ts(e2[d+2]/l),m=ts(e2[d+3]/l);s[o*r+c]=p&255|(f&255)<<8|(g&255)<<16|(m&255)<<24}}return{packed:s,scales:a}}async function mc(e2,t,n,r,s,a){let o=!!e2.device.features.has("shader-f16")&&pn(r),i=r.hidden_size,u=r.vocab_size;if(!s||!o||i%32!==0)return null;let l=a.find(A=>A.id==="embed_tokens");if(!l)return null;let c=n(l.name);if(!t.has(c))return null;let d=t.info(c);if(!kl(d.type))return null;let p=xa(d.type,i),f=null,g=t.tensorByteRange?(A,w)=>t.tensorByteRange(c,A*p,(A+w)*p):async(A,w)=>(f??=await t.tensorBytes(c),f.subarray(A*p,(A+w)*p));return to(e2,async(A,w)=>vl(d.type,await g(A,w)),u,i,true)}function gc(e2,t){if(!Array.isArray(t)||t.length!==2)throw new Error("transpose2d requires source shape [rows, cols]");let[n,r]=t;if(e2.length!==n*r)throw new Error(`transpose2d shape [${t}] does not match ${e2.length} values`);let s=new Float32Array(e2.length);for(let a=0;a<n;++a)for(let o=0;o<r;++o)s[o*n+a]=e2[a*r+o];return s}function t_(e2,t,n){let r=new n(t),s=0;for(let a of e2)r.set(a,s),s+=a.length;return r}function ts(e2){return Math.max(-127,Math.min(127,Math.round(e2)))}function n_(e2){return ArrayBuffer.isView(e2)&&!(e2 instanceof DataView)&&"length"in e2}var Ot=P(()=>{"use strict";en();Va();Ya();oc();no();It()});function Ae(e2,t=new Set){rs(e2,t,true)}function rs(e2,t,n){if(!(e2==null||typeof e2!="object")&&!t.has(e2)&&(t.add(e2),!(ArrayBuffer.isView(e2)||e2 instanceof ArrayBuffer))){if(r_(e2)){n&&e2.destroy();return}if(s_(e2)){n&&e2.destroy();return}if(e2 instanceof Map){for(let r of e2.values())rs(r,t,n);n&&e2.clear();return}if(e2 instanceof Set){for(let r of e2.values())rs(r,t,n);n&&e2.clear();return}for(let r of Object.keys(e2))rs(e2[r],t,n)}}function r_(e2){let t=e2;return Array.isArray(t.shape)&&typeof t.dtype=="string"&&typeof t.destroy=="function"&&t.buffer!=null&&typeof t.buffer.destroy=="function"}function s_(e2){let t=e2;return typeof t.destroy=="function"&&typeof t.mapAsync=="function"&&typeof t.getMappedRange=="function"}var ss=P(()=>{"use strict"});function a_(e2,t){for(;t;)[e2,t]=[t,e2%t];return e2}function o_(e2,t,n,r){let s=t*n*r;if(s<=0)return e2;let a=oo/a_(s,oo);return Math.ceil(e2/a)*a}function i_(e2,t,n){if(!Ue(t))return{linearConvStates:null,linearRecurrentStates:null,linearConvStatesBacking:null,linearRecurrentStatesBacking:null};let r=Yr(t),s=_e(t.linear_conv_dim,"config.linear_conv_dim"),a=_e(t.linear_conv_kernel_dim,"config.linear_conv_kernel_dim")-1,o=[n,_e(t.linear_num_value_heads,"config.linear_num_value_heads"),_e(t.linear_key_head_dim,"config.linear_key_head_dim"),_e(t.linear_value_head_dim,"config.linear_value_head_dim")],i=Ac(e2,r,"float32",[n,s,a],"llama-cache-linear-conv"),u=e2.device.features.has("shader-f16")&&false,l=Ac(e2,r,u?"float16":"float32",o,"llama-cache-linear-recurrent");return{linearConvStates:i.states,linearRecurrentStates:l.states,linearConvStatesBacking:i.backing,linearRecurrentStatesBacking:l.backing}}function Ac(e2,t,n,r,s){let a=t.reduce((m,A)=>m+(A==="linear_attention"?1:0),0);if(a===0)return{states:Array(t.length).fill(null),backing:null};let o=r.reduce((m,A)=>m*A,1),i=ge(n),u=o*i,l=Cc(u,oo),c=a*l,d=e2.device.limits.maxBufferSize;if(Number.isFinite(d)&&d>0&&c>d)return{states:t.map((A,w)=>A==="linear_attention"?e2.empty(n,r,`${s}-${w}`):null),backing:null};let p=e2.empty(n,[c/i],s),f=0;return{states:t.map(m=>{if(m!=="linear_attention")return null;let A=Sc(p,r,f*l);return f+=1,A}),backing:p}}function Cc(e2,t){return Math.ceil(e2/t)*t}function Sc(e2,t,n){let r=t.reduce((a,o)=>a*o,1),s=r*ge(e2.dtype);if(n<0||n+s>e2.byteLength)throw new Error("mutable-state tensor view exceeds its backing buffer");return{dtype:e2.dtype,shape:[...t],byteOffset:(e2.byteOffset??0)+n,size:r,byteLength:s,buffer:e2.buffer,runtime:e2.runtime}}function u_(e2){let t=[];return io(t,e2.convStates,e2.standaloneStateBuffersPadded),hc(t,e2.linearConvStates,e2.linearConvStatesBacking,e2.standaloneStateBuffersPadded),hc(t,e2.linearRecurrentStates,e2.linearRecurrentStatesBacking,e2.standaloneStateBuffersPadded),t}function hc(e2,t,n,r){if(n){io(e2,n,true);return}if(Array.isArray(t))for(let s of t)io(e2,s,r)}function io(e2,t,n){t&&e2.push({dst:t,dstOffset:t.byteOffset??0,byteLength:Bc(t,n,"clear")})}function Bc(e2,t,n){if(e2.byteLength%4===0)return e2.byteLength;if(!t)throw new Error(`cannot ${n} ${e2.byteLength}-byte mutable-state tensor safely: its backing allocation is not known to include 4-byte padding`);return Cc(e2.byteLength,4)}function _c(e2){return e2.convStates!==null||wc(e2.linearConvStates)||wc(e2.linearRecurrentStates)}function wc(e2){return Array.isArray(e2)&&e2.some(t=>t!==null)}function l_(e2,t){let n=yc(e2,t.linearConvStates,t.linearConvStatesBacking,"llama-cache-checkpoint-linear-conv"),r=yc(e2,t.linearRecurrentStates,t.linearRecurrentStatesBacking,"llama-cache-checkpoint-linear-recurrent");return{convStates:Ic(e2,t.convStates,"llama-cache-checkpoint-conv"),linearConvStates:n.states,linearRecurrentStates:r.states,linearConvStatesBacking:n.backing,linearRecurrentStatesBacking:r.backing,standaloneStateBuffersPadded:true}}function Ic(e2,t,n){return t?e2.empty(t.dtype,t.shape,n):null}function yc(e2,t,n,r){if(!Array.isArray(t)){if(n!==null)throw new Error("mutable-state backing has no tensor views");return{states:null,backing:null}}if(!n)return{states:t.map((i,u)=>Ic(e2,i,`${r}-${u}`)),backing:null};let s=e2.empty(n.dtype,n.shape,r),a=n.byteOffset??0;return{states:t.map(i=>{if(!i)return null;if(i.buffer!==n.buffer||i.dtype!==n.dtype)throw new Error("mutable-state tensor views do not match their backing buffer");return Sc(s,i.shape,(i.byteOffset??0)-a)}),backing:s}}function bc(e2,t,n){let r=[],s=e2.standaloneStateBuffersPadded&&t.standaloneStateBuffersPadded;return uo(r,e2.convStates,t.convStates,`llama-cache-${n}-conv`,s),kc(r,e2.linearConvStates,t.linearConvStates,e2.linearConvStatesBacking,t.linearConvStatesBacking,`llama-cache-${n}-linear-conv`,s),kc(r,e2.linearRecurrentStates,t.linearRecurrentStates,e2.linearRecurrentStatesBacking,t.linearRecurrentStatesBacking,`llama-cache-${n}-linear-recurrent`,s),r}function kc(e2,t,n,r,s,a,o){if(r||s){if(!r||!s)throw new Error("mutable-state checkpoint packed backings do not match");uo(e2,r,s,a,true);return}if(!Array.isArray(t)||!Array.isArray(n)||t.length!==n.length){if(t===null&&n===null)return;throw new Error("mutable-state checkpoint tensor arrays do not match")}for(let i=0;i<t.length;++i)uo(e2,t[i],n[i],`${a}-${i}`,o)}function uo(e2,t,n,r,s){if(!t||!n){if(t===null&&n===null)return;throw new Error("mutable-state checkpoint tensors do not match")}if(t.dtype!==n.dtype||t.byteLength!==n.byteLength)throw new Error("mutable-state checkpoint tensor shape or dtype changed");let a=Bc(t,s,"copy");e2.push({kind:"copy",name:r,src:t,dst:n,srcOffset:t.byteOffset??0,dstOffset:n.byteOffset??0,byteLength:a})}function vc(e2){e2&&(Ae(e2.convStates),as(e2.linearConvStates,e2.linearConvStatesBacking),as(e2.linearRecurrentStates,e2.linearRecurrentStatesBacking))}function as(e2,t){if(t){Ae(t);return}Ae(e2)}var oo,rt,mn=P(()=>{"use strict";dt();ss();wt();Le();oo=256;rt=class e2{runtime;config;batchSize;maxLength;seqLength;keyStates;valueStates;convStates;linearConvStates;linearRecurrentStates;mutableStateCheckpoint;linearConvStatesBacking=null;linearRecurrentStatesBacking=null;standaloneStateBuffersPadded=false;mutableStateCheckpointStorage=null;mutableStateCheckpointPromise=null;constructor({runtime:t,config:n,batchSize:r,maxLength:s,keyStates:a,valueStates:o,convStates:i=null,linearConvStates:u=null,linearRecurrentStates:l=null,seqLength:c=0}){this.runtime=t,this.config=Fn(n),this.batchSize=r,this.maxLength=s,this.seqLength=c,this.keyStates=a,this.valueStates=o,this.convStates=i,this.linearConvStates=u,this.linearRecurrentStates=l,_c(this)&&(this.mutableStateCheckpoint=()=>this.mutableStateCheckpointPromise??=this.buildMutableStateCheckpoint())}static allocate(t,n,r,s,a="float32"){let o=Fn(n),i=[o.num_hidden_layers,r,o_(s??o.max_position_embeddings,o.num_key_value_heads,o.head_dim,ge(a)),o.num_key_value_heads,o.head_dim],u=i_(t,o,r),l=o.num_hidden_layers*r*o.hidden_size*(ct(o)?_e(o.conv_L_cache,"config.conv_L_cache"):0),c=new e2({runtime:t,config:o,batchSize:r,maxLength:i[2],keyStates:t.empty(a,i,"llama-cache-keys"),valueStates:t.empty(a,i,"llama-cache-values"),convStates:ct(o)?t.empty("float32",[l],"llama-cache-conv"):null,linearConvStates:u.linearConvStates,linearRecurrentStates:u.linearRecurrentStates});return c.linearConvStatesBacking=u.linearConvStatesBacking,c.linearRecurrentStatesBacking=u.linearRecurrentStatesBacking,c.standaloneStateBuffersPadded=true,c.clearMutableState(),c}get_seq_length(){return this.seqLength}advance(t){if(!Number.isInteger(t)||t<0)throw new Error(`cache advance expects a non-negative integer, got ${t}`);let n=this.seqLength+t;if(n>this.maxLength)throw new Error(`cache length ${n} exceeds maxLength ${this.maxLength}`);this.seqLength=n}async buildMutableStateCheckpoint(){let t=this.mutableStateSource(),n=l_(this.runtime,t);this.mutableStateCheckpointStorage=n;try{let r=await this.runtime.prepareProgramSequence(bc(t,n,"capture")),s=await this.runtime.prepareProgramSequence(bc(n,t,"restore"));return{capture:()=>this.runtime.enqueuePreparedProgramSequence(r),restore:()=>this.runtime.enqueuePreparedProgramSequence(s)}}catch(r){throw vc(n),this.mutableStateCheckpointStorage===n&&(this.mutableStateCheckpointStorage=null),this.mutableStateCheckpointPromise=null,r}}mutableStateSource(){return{convStates:this.convStates,linearConvStates:this.linearConvStates,linearRecurrentStates:this.linearRecurrentStates,linearConvStatesBacking:this.linearConvStatesBacking,linearRecurrentStatesBacking:this.linearRecurrentStatesBacking,standaloneStateBuffersPadded:this.standaloneStateBuffersPadded}}clearMutableState(){let t=u_(this.mutableStateSource());t.length>0&&this.runtime.clearBuffers(t)}truncate(t){if(!Number.isInteger(t)||t<0||t>this.maxLength)throw new Error(`cache truncate expects an integer in [0, ${this.maxLength}], got ${t}`);if(t>this.seqLength)throw new Error(`cache truncate cannot extend length from ${this.seqLength} to ${t}; use advance()`);if(t!==0&&t!==this.seqLength&&_c(this))throw new Error(`cache with mutable conv/recurrent state cannot rewind from ${this.seqLength} to ${t}; reset to 0 instead`);t===0&&this.clearMutableState(),this.seqLength=t}dispose(){vc(this.mutableStateCheckpointStorage),Ae(this.keyStates),Ae(this.valueStates),Ae(this.convStates),as(this.linearConvStates,this.linearConvStatesBacking),as(this.linearRecurrentStates,this.linearRecurrentStatesBacking),this.convStates=null,this.linearConvStates=null,this.linearRecurrentStates=null,this.linearConvStatesBacking=null,this.linearRecurrentStatesBacking=null,this.standaloneStateBuffersPadded=false,this.mutableStateCheckpointStorage=null,this.mutableStateCheckpointPromise=null}}});function co(e2){for(let t of lo)if(e2<=t)return t;return Tc}function po(e2){return e2>0?[{kind:"replay",tokenCount:e2}]:[]}function Gc({tokenCount:e2,position:t,maxLength:n,minGraphTokens:r}){if(e2<=0)return[];if(e2<r||t+e2>n)return po(e2);let s=[],a=e2,o=t;for(;a>0;){let i=co(a);if(o+i>n){s.push({kind:"replay",tokenCount:a});break}let u=Math.min(a,i);s.push({kind:"graph",blockLen:i,tokenCount:u}),a-=u,o+=u}return s}function xc({tokenCount:e2,position:t,maxLength:n,shortBlock:r,normalMinTokens:s}){if(e2<=0)return[];if(r<=0||s<=r)throw new Error(`invalid short-prefill bucket: block=${r}, normalMin=${s}`);if(e2<r||t+e2>n)return po(e2);let a=[],o=e2,i=t;for(;o>0;){if(o<r){a.push({kind:"replay",tokenCount:o});break}let u=o<s?r:co(o);if(i+u>n){a.push({kind:"replay",tokenCount:o});break}let l=o<s?r:Math.min(o,u);a.push({kind:"graph",blockLen:u,tokenCount:l}),o-=l,i+=l}return a}function Qc({tokenCount:e2,position:t,maxLength:n,shortBlock:r,normalMinTokens:s,bucketMinTokens:a,bucketMaxTokens:o,bucketBlock:i}){if(e2<=0)return[];if(r<=0||s<=r||a<=r||o<a||o>s||i<o)throw new Error(`invalid bucketed short-prefill geometry: short=${r}, normalMin=${s}, bucket=${a}..${o}->${i}`);if(e2<r||t+e2>n)return po(e2);let u=[],l=e2,c=t;for(;l>0;){if(l<r){u.push({kind:"replay",tokenCount:l});break}if(l>=a&&l<=o&&c+i<=n){u.push({kind:"graph",blockLen:i,tokenCount:l});break}let d=l<s?r:co(l);if(c+d>n){u.push({kind:"replay",tokenCount:l});break}let p=l<s?r:Math.min(l,d);u.push({kind:"graph",blockLen:d,tokenCount:p}),l-=p,c+=p}return u}function fo(e2){let t=new Set;for(let n of e2)n.kind==="graph"&&t.add(n.blockLen);return[...t].sort((n,r)=>n-r)}function Dc(e2,t){let n=new Set,r=Math.min(t,2*Tc);for(let s=1;s<=r;++s)for(let a of fo(e2(s,0,t)))n.add(a);return[...n].sort((s,a)=>s-a)}var lo,Tc,Ec,os=P(()=>{"use strict";lo=[64,128,256,512],Tc=512,Ec=64});function Pc(e2){let t=new Map;for(let m of e2.tensors)t.set(m.id,m);let n=m=>t.get(m)?.view?.parent??m,r=new Map;for(let m of e2.tensors)m.kind==="intermediate"&&!m.view&&r.set(m.id,m);let s=new Map,a=new Map,o=c_(e2,t,s,a),i=new Map,u=new Map,l=new Map;e2.nodes.forEach((m,A)=>{for(let w of Object.values(m.inputs)){let C=n(w);r.has(C)&&(u.has(C)||u.set(C,A),l.set(C,A))}for(let w of Object.values(m.outputs)){let C=n(w);r.has(C)&&(i.has(C)||i.set(C,A),l.set(C,A))}});let c=[],d=0,p=new Map;for(let m of r.values()){d+=Wt(m);let A=i.get(m.id),w=u.get(m.id);if(A===void 0&&w!==void 0)throw new Error(`graph "${e2.name}": intermediate "${m.name}" (id ${m.id}) is read by node ${w} but no node produces it`);if(o.has(m.id))continue;if(A===void 0){c.push(m.name);continue}if(w!==void 0&&w<A)throw new Error(`graph "${e2.name}": intermediate "${m.name}" (id ${m.id}) is read by node ${w} before it is produced by node ${A}; pooling cannot order that lifetime`);let C=l.get(m.id),G=p.get(C);G?G.push(m.id):p.set(C,[m.id])}let f=new Map;for(let m=0;m<e2.nodes.length;++m){let A=p.get(m-1);if(A)for(let w of A){let C=s.get(w),G=a.get(C),L=f.get(G);L?L.push(C):f.set(G,[C])}for(let w of Object.values(e2.nodes[m].outputs)){let C=n(w),G=r.get(C);if(!G||s.has(C))continue;let L=Wt(G),Z=f.get(L)?.pop()??Lc(a,L);s.set(C,Z)}}let g=0;for(let m of a.values())g+=m;return{slots:s,slotByteLengths:a,diagnostics:{intermediateCount:r.size,slotCount:a.size,naiveBytes:d,pooledBytes:g,deadTensors:c}}}function Lc(e2,t){let n=e2.size;return e2.set(n,t),n}function c_(e2,t,n,r){let s=new Set,a=e2.aliases??[];if(a.length===0)return s;let o=new Map,i=c=>{let d=c;for(;o.get(d)!==d;)d=o.get(d);let p=c;for(;o.get(p)!==d;){let f=o.get(p);o.set(p,d),p=f}return d},u=c=>{o.has(c)||o.set(c,c)};for(let{from:c,to:d}of a){for(let[p,f]of[["from",c],["to",d]]){let g=t.get(f);if(!g)throw new Error(`graph "${e2.name}": alias ${p} tensor id ${f} does not exist`);if(g.kind!=="intermediate"&&g.kind!=="output")throw new Error(`graph "${e2.name}": alias ${p} tensor "${g.name}" is ${g.kind}; only intermediate/output tensors can share a buffer`)}u(c),u(d),o.set(i(c),i(d))}let l=new Map;for(let c of o.keys()){let d=i(c),p=l.get(d);p?p.push(c):l.set(d,[c])}for(let c of l.values()){let d=t.get(c[0]);for(let f of c){let g=t.get(f);if(g.dtype!==d.dtype)throw new Error(`graph "${e2.name}": aliased tensors "${d.name}" (${d.dtype}) and "${g.name}" (${g.dtype}) must be the same dtype to share a buffer`);if(Wt(g)!==Wt(d))throw new Error(`graph "${e2.name}": aliased tensors "${d.name}" (${Wt(d)} B) and "${g.name}" (${Wt(g)} B) must be the same byte length to share a buffer`)}let p=Lc(r,Wt(d));for(let f of c)n.set(f,p),s.add(f)}return s}function Wt(e2){return ye(e2.shape)*ge(e2.dtype)}var qc=P(()=>{"use strict";Le()});function Rc(e2,t,n){return Kc(e2,t,n).selected!==null}function Kc(e2,t,n){try{let r=e2.explain({device:t},n);return{selected:r.selected,runnable:r.candidates.filter(s=>s.ok).map(s=>s.id)}}catch{return{selected:null,runnable:[]}}}function Mc(e2,t){return{...e2,features:[...e2.features,...t]}}function d_(e2,t,n){let r=new Set(t.features),s=In.filter(o=>!r.has(o));for(let o of s)if(Rc(e2,Mc(t,[o]),n))return[o];let a=[];for(let o of s)if(a.push(o),Rc(e2,Mc(t,a),n))return a;return[]}function is(e2){let t=e2/1048576;return`${t.toFixed(t<1e4?1:0)} MB`}function mo(e2,t){let n=Me(t),r=vt(n),s=[],a=new Set,o=new Set,i=new Set,u=new Set;for(let{op:d,request:p,id:f}of e2.opRequests??[]){let g=f??d.manifest.id;i.add(g);let m=`${g}|${JSON.stringify(p)}`;if(a.has(m))continue;a.add(m);let{selected:A,runnable:w}=Kc(d,r,p);for(let Z of w)u.add(`${g}#${Z}`);if(A!==null)continue;let C=d_(d,r,p),G=`${g}|${C.join(",")}`;if(o.has(G))continue;o.add(G);let L=C.map(Z=>`"${Z}"`).join(", ");s.push({kind:"feature",op:g,missingFeatures:C,message:C.length>0?`${g} needs WebGPU feature${C.length>1?"s":""} ${L}, which this device lacks`:`${g} has no runnable variant on this device`})}let l=n.limits.maxBufferSize;if(typeof l=="number"){let d=new Set;for(let p of e2.tensors??[]){let f=ye(p.shape)*ge(p.dtype);f<=l||d.has(f)||(d.add(f),s.push({kind:"buffer",tensor:p.name,bytes:f,limitBytes:l,message:`tensor ${p.name} needs a ${is(f)} buffer, over this device's ${is(l)} maxBufferSize`}))}}let c=n.limits.maxStorageBufferBindingSize;if(typeof c=="number"){let d=new Set;for(let p of e2.tensors??[]){if(!p.boundWhole)continue;let f=ye(p.shape)*ge(p.dtype);f<=c||d.has(f)||typeof l=="number"&&f>l||(d.add(f),s.push({kind:"binding",tensor:p.name,bytes:f,limitBytes:c,message:`tensor ${p.name} needs a ${is(f)} storage binding, over this device's ${is(c)} maxStorageBufferBindingSize`}))}}return{ok:s.length===0,problems:s,reason:s.length>0?p_(s):null,opIds:[...i],selectableVariants:[...u]}}function p_(e2){let t=[...new Set(e2.flatMap(a=>a.missingFeatures??[]))],n=t.length>0?`This GPU/browser is missing WebGPU feature${t.length>1?"s":""} ${t.map(a=>`"${a}"`).join(", ")} that the model needs`:e2[0].message,r=e2.filter(a=>a.kind==="buffer"||a.kind==="binding"),s=t.length>0&&r.length>0?" Some weights also exceed the device's buffer limits.":"";return`${n} — it can't run here.${s} Try Chrome or Edge with up-to-date GPU drivers.`}var go=P(()=>{"use strict";_t();Le()});function Oc(e2,t,n){let r=e2.recordSupportOp;return r?(r.call(e2,t,n),true):false}var Wc=P(()=>{"use strict";go();Le()});function f_(e2,t){let n=[e2.manifest.id];for(let r of Object.keys(t.resources).sort()){let s=t.resources[r];if(s!==null&&typeof s=="object"&&"shape"in s&&"dtype"in s){let a=s;n.push(`${r}:[${a.shape.join(",")}]:${a.dtype}`)}else s==null?n.push(`${r}:-`):n.push(`${r}=${String(s)}`)}return n.push(`a:${JSON.stringify(t.args??{})}`),n.push(`t:${JSON.stringify(t.attrs??{})}`),n.push(`s:${JSON.stringify(t.sourceContext??{})}`),n.push(`u:${JSON.stringify(t.tunables??{})}`),n.join("|")}var zc,Ao,us,Hc=P(()=>{"use strict";_t();Wc();zc=new WeakMap,Ao=class{slots=new Map;rt;constructor(t){this.rt=t}resourcesForPlan(t){if(t.length===0)return{};if(typeof this.rt.empty!="function")throw new Error("WebGPU multi-pass plan requires a runtime with empty(dtype, shape)");let n=new Map,r={};for(let s of t){let a=JSON.stringify([s.dtype,s.shape]),o=n.get(a)??0;n.set(a,o+1);let i=this.slots.get(a);i||(i=[],this.slots.set(a,i));let u=i[o];u===void 0&&(u=this.rt.empty(s.dtype,s.shape,`webgpu-scratch-${s.id}`),i.push(u)),r[s.id]=u}return r}clear(){let t=[...this.slots.values()].flat();this.slots.clear();let n;for(let r of t)if(typeof r.destroy=="function")try{r.destroy()}catch(s){n??=s}if(n!==void 0)throw n}};us=class{programs=[];cleanups=[];scratchPool;rt;timing;preparedCache;collectMs=0;flushMs=0;constructor(t,n={}){if(this.rt=t,this.scratchPool=new Ao(t),this.timing=n.timing===true,n.cachePrepared){let r=zc.get(t);r||(r=new Map,zc.set(t,r)),this.preparedCache=r}else this.preparedCache=null}add(t,n){if(Oc(this.rt,t,n))return;let r=this.timing?performance.now():0,s;if(this.preparedCache){let o=f_(t,n),i=this.preparedCache.get(o);i?s={program:i.program,plan:i.plan,request:n}:(s=t.prepare(this.rt,n),this.preparedCache.set(o,{program:s.program,plan:s.plan}))}else s=t.prepare(this.rt,n);let a=this.materialize(s);for(let o of a.programs)this.programs.push(o);return this.cleanups.push(a.cleanup),this.timing&&(this.collectMs+=performance.now()-r),s}get programCount(){return this.programs.length}programSlice(t,n){return this.programs.slice(t,n)}addPrepared(t,n,r){let s=this.materialize({program:t,plan:n,request:r});for(let a of s.programs)this.programs.push(a);this.cleanups.push(s.cleanup)}adoptMaterialized(t){for(let n of t)this.programs.push(n)}async buildSteps(){return this.rt.prepareProgramSequence(this.programs)}enqueue(t){this.rt.enqueuePreparedProgramSequence(t)}disposeBuild(){this.clearBuildResources()}async flush(t=true){if(this.programs.length===0){this.clearBuildResources();return}let n=this.timing?performance.now():0;try{await this.rt.runProgramSequence(this.programs,{wait:t})}finally{this.timing&&(this.flushMs+=performance.now()-n),this.clearBuildResources()}}materialize(t){let n=this.scratchPool.resourcesForPlan(t.plan.scratches);return Ln(this.rt,t,{scratchResources:n})}clearBuildResources(){let t=this.cleanups;this.programs=[],this.cleanups=[];let n;for(let r of t)try{r()}catch(s){n??=s}try{this.scratchPool.clear()}catch(r){n??=r}if(n!==void 0)throw n}}});function m_(e2,t){let n=Object.keys(e2);if(n.length!==Object.keys(t).length)return false;for(let r of n)if(e2[r]!==t[r])return false;return true}function g_(e2,t){if(!e2)return null;let n=Uc.get(e2);if(!n)throw new Error(`graph "${t.name}": sibling compile has no reusable plans (support-record compiles cannot seed siblings)`);if(n.graph!==t)throw new Error(`graph "${t.name}": sibling compiled a DIFFERENT graph object ("${n.graph.name}") — siblings must share one emitted graph`);return n}function gn(e2,t,n={},r={}){let s=r.pooling!==false,a=g_(r.sibling,e2),o=a?.plan??Pc(e2),i=s?{plan:o,slotTensors:new Map,shared:r.scratch??null}:null,u=new Map,l=new Map,c=new Map,d=new Map,p=[],f=[];for(let b of e2.tensors){if(b.view){let y=u.get(b.view.parent);if(!y)throw new Error(`graph view "${b.name}" references unrealized parent id ${b.view.parent}`);let I=a&&a.realized.get(b.view.parent)===y?a.realized.get(b.id):__(y,b);u.set(b.id,I);continue}if(b.kind==="uniform"){let y=a?a.uniformById.get(b.id):t.createUniformU32(new Uint32Array(ye(b.shape)),`graph-uniform-${b.name}`);a||f.push(y),c.set(b.id,y),d.set(b.name,y);continue}let S=a&&b.kind!=="weight"&&b.kind!=="state"?a.realized.get(b.id)??null:h_(b,e2.name,t,n,p,i);S!==null&&(u.set(b.id,S),b.kind!=="intermediate"&&l.set(b.name,S))}let g=new us(t,{cachePrepared:true}),m=new Map(e2.tensors.map(b=>[b.id,b])),A=new Map,w=[],C=[],G=[],L=[];e2.nodes.forEach((b,S)=>{let y=A.get(b.op);y||(y=ut(b.op),A.set(b.op,y));let I={};for(let[R,D]of Object.entries(b.inputs))I[R]=u.get(D)??c.get(D);for(let[R,D]of Object.entries(b.outputs))I[R]=u.get(D);let H={resources:I,...b.args?{args:{...b.args}}:{},...b.attrs?{attrs:{...b.attrs}}:{}},W=g.programCount;try{if(a){let R=a.nodePlans[S];m_(a.nodeResources[S],I)?g.adoptMaterialized(a.nodePrograms[S]):g.addPrepared(R.program,R.plan,H),C.push(R),w.push(R.program.variant)}else{let R=g.add(y,H);C.push(R?{program:R.program,plan:R.plan}:null),w.push(R?.program.variant??null)}}catch(R){let D=Object.entries(I).map(([h,_])=>`${h}=[${_?.shape??"?"}]`).join(" ");throw new Error(`graph node ${b.op} (args ${JSON.stringify(b.args??{})}; ${D}): ${R.message}`,{cause:R})}G.push(I);let x=g.programSlice(W,g.programCount),q=A_(e2.name,b.op,b,m,S);for(let R of x){if(!("source"in R))continue;let D=R;D.profile={...D.profile,...q}}L.push(x)});let Z=s?o.diagnostics:{...o.diagnostics,slotCount:o.diagnostics.intermediateCount,pooledBytes:o.diagnostics.naiveBytes},O={collector:g,tensors:u,allocation:Z,nodeVariants:w,tensor(b){let S=l.get(b);if(!S)throw new Error(`graph "${e2.name}" has no bound tensor named "${b}"`);return S},uniformBuffer(b){let S=d.get(b);if(!S)throw new Error(`graph "${e2.name}" has no uniform named "${b}"`);return S},async runEager(){await g.flush(true)},buildSteps(b){if(!b)return g.buildSteps();let S=b.startNode??0,y=b.endNode??e2.nodes.length;if(!Number.isInteger(S)||!Number.isInteger(y)||S<0||y<S||y>e2.nodes.length)throw new Error(`graph "${e2.name}": invalid node range [${S}, ${y}) for ${e2.nodes.length} nodes`);let I=[];for(let H=S;H<y;++H)I.push(...L[H]);return I.length>0?t.prepareProgramSequence(I):Promise.resolve([])},dispose(){g.disposeBuild();for(let b of p)b.destroy?.();p.length=0;for(let b of f)b.destroy?.();f.length=0}};return C.every(b=>b!==null)&&Uc.set(O,{graph:e2,plan:o,nodePlans:C,nodeResources:G,nodePrograms:L,realized:u,uniformById:c,uniformByName:d}),O}function A_(e2,t,n,r,s){let a=null;for(let u of Object.values(n.inputs)){let l=r.get(u);if(l?.kind==="weight"){a=l.name.replace(/\.[^.]+$/,"");break}}if(!a){let u=Object.values(n.outputs)[0];a=u!==void 0?r.get(u)?.name??t:t}let o=a.match(/(?:^|\.)(\d+)(?:\.|$)/),i={phase:e2,node:a,part:o?a.replace(/(^|\.)\d+(\.|$)/,(u,l,c)=>l&&c?".":""):a,graphNode:s};return o&&(i.layer=Number(o[1])),i}function h_(e2,t,n,r,s,a){if(a){let i=a.plan.slots.get(e2.id);if(i!==void 0){let u=a.slotTensors.get(i);if(!u){let l=a.plan.slotByteLengths.get(i),c=()=>n.empty(e2.dtype,e2.shape,`graph-slot-${i}`);a.shared?u=a.shared.acquire(i,l,t,c):(u=c(),s.push(u)),a.slotTensors.set(i,u)}return w_(u,e2,a.plan.slotByteLengths.get(i))}if(e2.kind==="intermediate")return null}switch(e2.kind){case"weight":case"state":{let u=(e2.kind==="weight"?r.weights:r.states)?.[e2.name];if(!u)throw new Error(`graph ${e2.kind} "${e2.name}" has no binding`);return u}case"input":{let i=r.inputs?.[e2.name];if(i===void 0)throw new Error(`graph input "${e2.name}" has no binding`);if(tt(i))return i;let u=n.tensorFromTypedArray(e2.dtype,e2.shape,i);return s.push(u),u}case"intermediate":case"stepInput":case"output":break}let o=n.empty(e2.dtype,e2.shape,`graph-${e2.name}`);return s.push(o),o}function __(e2,t){let n=ye(t.shape),r=ge(t.dtype),s=(e2.byteOffset??0)+t.view.elementOffset*r,a=n*r;if(s+a>(e2.byteOffset??0)+e2.byteLength)throw new Error(`graph view "${t.name}" exceeds its parent's range (${s}+${a} > ${e2.byteLength})`);return{runtime:e2.runtime,dtype:t.dtype,shape:t.shape,size:n,byteLength:a,byteOffset:s,buffer:e2.buffer}}function w_(e2,t,n){let r=ye(t.shape),s=r*ge(t.dtype);if(s!==n)throw new Error(`graph tensor "${t.name}" (${s} bytes) does not exactly fit slot of ${n} bytes`);return{runtime:e2.runtime,dtype:t.dtype,shape:t.shape,size:r,byteLength:s,buffer:e2.buffer}}var Uc,ho=P(()=>{"use strict";_t();Le();qc();Hc();Uc=new WeakMap});function ls(e2){return Math.ceil(e2*y_/Uint32Array.BYTES_PER_ELEMENT)*Uint32Array.BYTES_PER_ELEMENT}function cs(e2){return Math.max(0,Math.floor(Math.min(e2.maxBufferSize,e2.maxStorageBufferBindingSize)))}function ds(e2,t){if(!Number.isFinite(t)||t<0)throw new Error(`Q1 shard byte limit must be a finite non-negative number, got ${t}`);let n=[],r=new Map,s=new Set;for(let c of e2){if(s.has(c.id))throw new Error(`Duplicate Q1 packed weight id: ${c.id}`);if(s.add(c.id),!Number.isSafeInteger(c.blockCount)||c.blockCount<=0)throw new Error(`Q1 packed weight ${c.id} has invalid block count ${c.blockCount}`);let d=c.packedGroup===void 0?`id:${c.id}`:`group:${c.packedGroup}`,p=r.get(d);if(p||(p={entries:[],blockCount:0},r.set(d,p),n.push(p)),p.entries.push(c),p.blockCount+=c.blockCount,!Number.isSafeInteger(p.blockCount))throw new Error(`Q1 allocation unit containing ${c.id} exceeds safe integer range`)}let a=Math.floor(t/_o),o=[],i=new Map,u=0,l=()=>{u!==0&&(o.push(u),u=0)};for(let c=0;c<n.length;++c){let d=n[c];u>0&&u+d.blockCount>a&&l();let p=o.length;for(let f of d.entries)i.set(f.id,{shardIndex:p,groupIndex:c,blockOffset:u,blockCount:f.blockCount}),u+=f.blockCount;u>a&&l()}return l(),{shardBlockCounts:o,locations:i}}var _o,y_,wo=P(()=>{"use strict";_o=4*Uint32Array.BYTES_PER_ELEMENT,y_=18});function v_(){return{}}function C_(e2,t){return{device:e2,recordSupportOp:t,empty:(n,r)=>De(n,r),tensorFromTypedArray:(n,r)=>De(n,r),createUniformU32:()=>v_(),host:{writeBuffer:()=>{}},clearBuffers:()=>{}}}function S_(e2,t,n,r,s,a){let o=new Set,i=[];for(let A of e2){if(A.id==="lm_head"&&r||!n(A))continue;let w=A.length/128;if(!Number.isSafeInteger(w)||w<=0)throw new Error(`Q1 weight ${A.id} length ${A.length} is not a positive multiple of ${128}`);i.push({id:A.id,blockCount:w,packedGroup:A.packedGroup}),o.add(A.id)}let u=ds(i,a),l=new Map(u.locations),c=pt(),d=pt(),p=new Set,f=0;for(let A of e2){if(o.has(A.id)||!t(A))continue;let w=A.length/Fc;We(c,A.id,f),We(d,A.id,w),p.add(A.id),f+=w}let g=pt(),m=0;for(let A of e2)if(!o.has(A.id)&&!p.has(A.id)&&!(s&&A.id==="embed_tokens")){if(A.id==="lm_head"&&r){if(o.has("embed_tokens")){let w=l.get("embed_tokens");if(!w)throw new Error("Q1 support layout is missing tied embed_tokens");l.set(A.id,w)}else We(g,A.id,g.top.embed_tokens??0);continue}We(g,A.id,m),m+=A.length}return{offsets:g,q4Offsets:c,q4BlockCounts:d,totalBlocks:f,denseElements:m,q1Locations:l,q1PackedIds:o,q1ShardBlockCounts:u.shardBlockCounts,maxQ1SourceBlocks:i.reduce((A,w)=>Math.max(A,w.blockCount),0)}}function B_({config:e2,entries:t,isPacked:n=()=>false,isQ1:r=()=>false,packedQuantBits:s=4,packSlots:a,tieWordEmbeddings:o,canUseFloat16:i=pn,canUseQ8LmHead:u=so,canUseQ4LmHead:l=ao,packEmbedQ8:c=false,emitGraph:d,emitPrefillGraph:p,device:f}){let g=Me(f),m=g.features.has("shader-f16"),A=m&&i(e2),w=A?"float16":"float32",C=A?"float16":"float32",G=m?"float16":"float32",L=t.some(Q=>r(Q)),Z=!L&&A&&l(e2),O=!L&&A&&!Z&&u(e2),b=!L&&c&&A&&o,{offsets:S,q4Offsets:y,q4BlockCounts:I,totalBlocks:H,denseElements:W,q1Locations:x,q1PackedIds:q,q1ShardBlockCounts:R,maxQ1SourceBlocks:D}=S_(t,n,r,o,b,cs(g.limits)),h=[],_=C_(g,(Q,U)=>h.push({op:Q,request:U})),k=De(w,[Math.max(1,W)]),v=H>0?{bits:De("uint32",[H*s]),scales:De(G,[H]),offsets:y,blockCounts:I,packedIds:new Set(t.filter(Q=>n(Q)&&!q.has(Q.id)).map(Q=>Q.id)),packedQuantBits:s}:null,V=R.length>0?{shards:R.map(Q=>({bits:De("uint32",[Q*4]),scales:De(G,[Q]),blockCount:Q})),locations:x,colMajorIds:!o&&e2.hidden_size%128===0&&q.has("lm_head")?new Set(["lm_head"]):new Set}:null,j=Z?De("uint32",[e2.vocab_size*(e2.hidden_size/32)*4]):null,N=Z?De(G,[e2.vocab_size*(e2.hidden_size/32)]):null,re=O?De("uint32",[e2.vocab_size*(e2.hidden_size/4)]):null,ke=O?De("float32",[e2.vocab_size]):null,M=b?De("uint32",[e2.vocab_size*(e2.hidden_size/4)]):null,K=b?De("float32",[e2.vocab_size]):null,J={runtime:_,config:e2,weights:k,offsets:S,packs:{q4:v,q1:V},lmHeadQ4:j,lmHeadQ4Scales:N,lmHeadQ8:re,lmHeadQ8Scales:ke,embedQ8:M,embedQ8Scales:K,cacheDtype:C,programCache:new Map,defaultPositionIdsCache:new Map,ropeCache:{cos:De("float32",[e2.max_position_embeddings,e2.head_dim>>1]),sin:De("float32",[e2.max_position_embeddings,e2.head_dim>>1])},qwen35RopeCache:null},ie=rt.allocate(_,e2,1,b_,C),Y=d(J,ie);if(gn(Y.graph,_,{weights:Y.weights,states:Y.states}),p)for(let Q of k_){let U=p(J,ie,Q);if(!U)break;gn(U.graph,_,{weights:U.weights,states:U.states,...U.inputs?{inputs:U.inputs}:{}})}let ne=h.map(({op:Q,request:U})=>({op:Q,request:U,id:Q.manifest.id})),ae=[{name:"weights",dtype:w,shape:k.shape,boundWhole:true}];if(a){let Q=new Map;for(let U of t){let T=a(U);if(!T)continue;let z=U.length/Fc,te=Q.get(T.buffer)??{words:0,scales:0,scalesF32:!!T.scalesF32};te.words+=z*T.wordsPerBlock,te.scales+=z*T.scalesPerBlock,te.scalesF32=te.scalesF32||!!T.scalesF32,Q.set(T.buffer,te)}for(let[U,T]of Q)ae.push({name:`${U}Bits`,dtype:"uint32",shape:[T.words]}),ae.push({name:`${U}Scales`,dtype:T.scalesF32?"float32":G,shape:[T.scales]})}else v&&(ae.push({name:"q4Bits",dtype:v.bits.dtype,shape:v.bits.shape}),ae.push({name:"q4Scales",dtype:v.scales.dtype,shape:v.scales.shape}));if(V){for(let U=0;U<V.shards.length;++U){let T=V.shards[U];ae.push({name:`q1Bits.${U}`,dtype:T.bits.dtype,shape:T.bits.shape,boundWhole:true}),ae.push({name:`q1Scales.${U}`,dtype:T.scales.dtype,shape:T.scales.shape,boundWhole:true})}let Q=ls(D);ae.push({name:"q1TranscodeSource",dtype:"uint32",shape:[Q/4],boundWhole:true})}return j&&ae.push({name:"lmHeadQ4",dtype:j.dtype,shape:j.shape,boundWhole:true}),N&&ae.push({name:"lmHeadQ4Scales",dtype:N.dtype,shape:N.shape,boundWhole:true}),re&&ae.push({name:"lmHeadQ8",dtype:re.dtype,shape:re.shape,boundWhole:true}),ke&&ae.push({name:"lmHeadQ8Scales",dtype:ke.dtype,shape:ke.shape,boundWhole:true}),M&&ae.push({name:"embedQ8",dtype:M.dtype,shape:M.shape,boundWhole:true}),K&&ae.push({name:"embedQ8Scales",dtype:K.dtype,shape:K.shape,boundWhole:true}),{opRequests:ne,tensors:ae}}function ps({config:e2,device:t,...n}){return mo(B_({config:e2,device:t,...n}),t)}var Fc,b_,k_,fs=P(()=>{"use strict";mn();os();ho();Ot();wo();_t();wt();Le();go();Fc=32,b_=2048,k_=[16,32,...lo]});var ms,yo=P(()=>{"use strict";ms=class{#t=false;#e;constructor(t){this.#e=t}get config(){return this.#e.config}async checkDeviceSupport(t){return await this.#e.checkSupport(t)}async unsupportedReason(t){return(await this.#e.checkSupport(t)).reason}async load(t,n={}){if(this.#t)throw new Error("prepared model has already been loaded or closed");this.#t=true;try{let r=this.#e.loadWeights(t,n),s=Promise.resolve(this.#e.checkSupport(t.device)),[a,o]=await Promise.allSettled([s,r]);if(a.status==="fulfilled"&&a.value.reason)throw o.status==="fulfilled"&&o.value?.dispose?.(),new Error(a.value.reason);if(o.status==="rejected")throw o.reason;if(a.status==="rejected")throw o.value?.dispose?.(),a.reason;return o.value}finally{await this.#e.closeSource()}}async close(){this.#t||(this.#t=true,await this.#e.closeSource())}}});function bo(e2,t){return t instanceof e2.ConfigClass?t:new e2.ConfigClass(t)}function Zc(e2,t,n,r){let s=bo(e2,n),{weights:a,offsets:o}=fc({runtime:t,entries:e2.expectedWeightEntries(s),stateDict:r,tieWordEmbeddings:s.tie_word_embeddings,modelName:e2.MODEL_NAME});return new e2({runtime:t,config:s,weights:a,offsets:o})}var $c=P(()=>{"use strict";Ot();Ya();fs();yo()});function Et(e2){return e2.slice(e2.lastIndexOf(".")+1)}function jc(e2){if(e2==="model.embed_tokens.weight")return"token_embd.weight";if(e2==="model.norm.weight")return"output_norm.weight";if(e2==="lm_head.weight")return"output.weight";let t=/^model\.layers\.(\d+)\.(.+)\.weight$/.exec(e2);if(!t)return e2;let[,n,r]=t,s=I_[r];return s?`blk.${n}.${s}.weight`:e2}function Vc(e2,t){return{has:n=>e2.has(t(n)),describe(n){let r=e2.info(t(n));return{dtype:Wr(r.type)?"F32":zr(r.type),shape:[...r.shape],elementCount:r.elementCount}},async read(n){let r=t(n),s=e2.info(r),a=await e2.tensorBytes(r),o=nn(s.type,a);return o?new Uint8Array(o.buffer,o.byteOffset,o.byteLength):a},async close(){}}}function Yc(e2,t){return{async streamAll(n,{concurrency:r,chunkMaxBytes:s,names:a=null,signal:o}={}){if(!a)throw new Error("makeGGUFWeightSource.streamAll requires the plan's tensor names");let i=new Map(a.map(u=>[t(u),u]));await e2.streamTensors([...i.keys()],async(u,l)=>{let c=nn(e2.info(u).type,l),d=c?new Uint8Array(c.buffer,c.byteOffset,c.byteLength):l;await n({bytes:d,tensors:[{name:i.get(u),offset:0,length:d.byteLength}]})},{concurrency:r,chunkMaxBytes:s,signal:o})},close(){}}}function Xc(e2,t,n){return t.some(r=>r.id==="lm_head"&&n&&!e2.has(r.name)?e2.info("token_embd.weight").type===E.Q1_0:e2.has(r.name)&&e2.info(r.name).type===E.Q1_0)}async function Jc({runtime:e2,config:t,entries:n,gguf:r,tieWordEmbeddings:s=false,modelName:a="model",onProgress:o=null}){let i=!!e2.device.features.has("shader-f16")&&pn(t),u=i?"float16":"float32",l=i?2:4,c=[],d=[],p=pt(),f=0,g=false;for(let h of n){if(h.id==="lm_head"&&s&&!r.has(h.name)){g=true;continue}if(!r.has(h.name))throw new Error(`Missing ${a} GGUF tensor: ${h.name}`);let _=r.info(h.name);if(_.elementCount!==h.length)throw new Error(`${a} tensor ${h.name} length ${_.elementCount} does not match expected ${h.length}`);if(_.type===E.Q1_0){let k=h.length/128;if(!Number.isSafeInteger(k)||k<=0)throw new Error(`${a} Q1 tensor ${h.name} length ${h.length} is not a positive multiple of ${128}`);d.push({entry:h,blockCount:k})}else We(p,h.id,f),c.push({entry:h,sourceDtype:zr(_.type),elementOffset:f}),f+=h.length}let m=Me(e2.device),A=cs(m.limits),w=ds(d.map(({entry:h,blockCount:_})=>({id:h.id,blockCount:_,packedGroup:h.packedGroup})),A),C=d.map(({entry:h,blockCount:_})=>{let k=w.locations.get(h.id);return{entry:h,shardIndex:k.shardIndex,blockOffset:k.blockOffset,blockCount:_}}),G=new Map(w.locations);if(g){let h=w.locations.get("embed_tokens");if(h)G.set("lm_head",h);else if(p.top.embed_tokens!==void 0)We(p,"lm_head",p.top.embed_tokens);else throw new Error(`${a}: tied GGUF lm_head requires token_embd.weight`)}for(let h of w.shardBlockCounts){let _=h*_o;if(_>A)throw new Error(`${a}: a Q1 packed group needs a ${_}-byte bits buffer, over this device's ${A}-byte allocation/binding limit`)}for(let{entry:h,blockCount:_}of d){let k=ls(_);if(k>A)throw new Error(`${a}: Q1 tensor ${h.name} needs a ${k}-byte transcode source buffer, over this device's ${A}-byte allocation/binding limit`)}let L=e2.allocateWeightsBuffer({byteLength:f*l,dtype:u,shape:[Math.max(f,1)],label:`${a}-scalar-weights`}),Z=new ln({runtime:e2,tensor:L}),O=0,b=c.length+C.length,S=e2.device.features.has("shader-f16"),y=[];try{for(let h of w.shardBlockCounts){let _=e2.empty("uint32",[h*4]);try{y.push({bits:_,scales:e2.empty(S?"float16":"float32",[h]),blockCount:h})}catch(k){throw Ae(_),k}}}catch(h){throw Ae(y),Ae(L),h}let I=new Set;!s&&t.hidden_size%128===0&&C.some(h=>h.entry.id==="lm_head")&&I.add("lm_head");let H=new Map,W=new cn,x=ns(),q=new Map(C.map(h=>[h.entry.name,h])),R=new Map(c.map(h=>[h.entry.name,h])),D=0;try{await r.streamTensors([...R.keys(),...q.keys()],async(h,_)=>{let k=R.get(h);if(k){Z.writeTensor({sourceDtype:k.sourceDtype,targetDtype:u,sourceBytes:_,targetElementOffset:k.elementOffset}),O+=1,o?.({processed:O,total:b,name:h});return}let v=q.get(h),V=r.info(h),j=V.shape[1],N=V.shape[0],re=j/128,ke=T_.has(Et(v.entry.id))&&N%E_===0&&j%128===0,M=I.has(v.entry.id),K=y[v.shardIndex];await es(e2,M?Oe.Q1_0CM:ke?Oe.Q1_0RT:Oe.Q1_0,_,K.bits,K.scales,v.blockOffset,v.blockCount,S,H,W,[re,M?N:0]),D+=_.byteLength,D>=768*1024*1024&&(await e2.queueIdle(),W.destroyAll(),D=0),O+=1,o?.({processed:O,total:b,name:h}),await x(_.byteLength)}),await e2.queueIdle()}catch(h){try{await e2.queueIdle()}catch{}throw Ae(y),Ae(L),h}finally{W.destroyAll()}return{weights:L,offsets:p,packs:{q1:{shards:y,locations:G,colMajorIds:I}},lmHeadQ8:null,lmHeadQ8Scales:null,cacheDtype:u}}function vo(e2){return e2===E.Q4_0?4:G_.has(e2)?null:Wr(e2)?8:null}function hs(e2,t,n){let r=new Set;for(let s of e2){let a=Et(s.id);if(!t.has(a))continue;let o=n(s.id);if(o===null)continue;let i=ed[a]??[a],u=s.id.slice(0,s.id.length-a.length);i.every(l=>n(u+l)===o)&&r.add(s.id)}return r}function td(e2,t,n,r,s){let a=new Map(e2.map(o=>[o.id,o]));return o=>{let i=a.get(o);if(!i||s&&!s.has(Et(o)))return null;let u=n(i.name);return t.has(u)&&r(t.info(u).type)?"1":null}}function Co(e2,t,n,r){return hs(e2,r,td(e2,t,n,s=>x_.has(s),r))}function So(e2,t,n,r){let s=new Map(e2.map(i=>[i.id,i])),a=i=>{let u=s.get(i);if(!u||!r.has(Et(i)))return false;let l=n(u.name);return t.has(l)&&vo(t.info(l).type)!==null},o=new Set;for(let i of e2){let u=Et(i.id),l=ed[u];if(!l||!a(i.id))continue;let c=i.id.slice(0,i.id.length-u.length);l.every(d=>a(c+d))||o.add(i.id)}return o}function _s(e2,t,n,r,s,a){let o=Et(e2.id);if(!r.has(o)||s?.has(e2.id)||a?.has(e2.id))return false;let i=n(e2.name);return t.has(i)&&vo(t.info(i).type)!==null}function Bo(e2,t,n,r,s,a){let o=false,i=true;for(let u of e2)_s(u,t,n,r,s,a)&&(o=true,vo(t.info(n(u.name)).type)!==4&&(i=false));return o?i?4:8:null}function Q_(e2,t,n,r){if(e2.byteLength%On!==0)throw new Error(`Q8_0 byte length ${e2.byteLength} is not a multiple of ${On}`);let s=e2.byteLength/On,a=new DataView(e2.buffer,e2.byteOffset,e2.byteLength);for(let o=0;o<s;++o){let i=o*On;n[r+o]=Ne(a.getUint16(i,true));let u=i+2;for(let l=0;l<8;++l){let c=0;for(let d=0;d<4;++d)c|=(e2[u+l*4+d]&255)<<d*8;t[(r+o)*8+l]=c>>>0}}}function D_(e2){let t=e2.length/Or,n=new Uint32Array(t*8),r=new Float32Array(t);for(let s=0;s<t;++s){let a=s*Or,o=0;for(let l=0;l<Or;++l){let c=Math.abs(e2[a+l]);c>o&&(o=c)}let i=o/127,u=i>0?1/i:0;r[s]=i;for(let l=0;l<8;++l){let c=0;for(let d=0;d<4;++d){let p=Math.round(e2[a+l*4+d]*u);p>127?p=127:p<-127&&(p=-127),c|=(p&255)<<d*8}n[s*8+l]=c>>>0}}return{bits:n,scales:r}}function P_(e2){switch(e2){case E.Q4_K:return nt.Q4_K;case E.Q6_K:return nt.Q6_K;case E.Q5_K:return nt.Q5_K;case E.Q3_K:return nt.Q3_K;case E.Q2_K:return nt.Q2_K;case E.IQ4_XS:return nt.IQ4_XS;case E.IQ4_NL:return nt.IQ4_NL;case E.Q5_0:return nt.Q5_0;case E.Q5_1:return nt.Q5_1;default:return null}}function L_(e2,t){return e2===4?Oe.Q4_0:t===E.Q8_0?Oe.Q8_0:P_(t)}async function Nn({runtime:e2,entries:t,gguf:n,nameToGGUF:r,signal:s},{routeName:a,include:o,guardElements:i=Ga,bitsLength:u,scalesLength:l,scalesF16:c,specForSlot:d,cpuFallback:p}){let f=pt(),g=pt(),m=new Set,A=[],w=0;for(let b of t){if(!o(b))continue;let S=r(b.name),y=n.info(S);if(y.elementCount%i!==0)throw new Error(`${a} tensor ${S} element count ${y.elementCount} not divisible by ${i}`);let I=y.elementCount/Ga;We(f,b.id,w),We(g,b.id,I),m.add(b.id),A.push({gname:S,baseBlock:w,blocks:I,type:y.type}),w+=I}if(A.length===0)return null;let C=c(A),G=new Map(A.map(b=>[b.gname,b])),L=ns();if(A.every(b=>d(b)!==null)){let b=e2.empty("uint32",[u(w)]),S=e2.empty(C?"float16":"float32",[l(w)]),y=new Map,I=new cn;return await n.streamTensors([...G.keys()],async(H,W)=>{let x=G.get(H);await es(e2,d(x),W,b,S,x.baseBlock,x.blocks,C,y,I),await L(W.byteLength)},{signal:s}),await e2.queueIdle(),I.destroyAll(),{bits:b,scales:S,offsets:f,blockCounts:g,packedIds:m,layout:A}}if(!p){let b=A.find(S=>d(S)===null);throw new Error(`${a}: no transcode kernel for ${b.gname} (type ${b.type})`)}let Z=new Uint32Array(u(w)),O=new Float32Array(l(w));return await n.streamTensors([...G.keys()],async(b,S)=>{p(G.get(b),S,Z,O),await L(S.byteLength)},{signal:s}),{bits:e2.tensorFromTypedArray("uint32",[Z.length],Z),scales:C?e2.tensorFromTypedArray("float16",[O.length],Mt(O)):e2.tensorFromTypedArray("float32",[O.length],O),offsets:f,blockCounts:g,packedIds:m,layout:A}}async function q_(e2,{packSuffixes:t,excludeKq4Ids:n,forceDenseIds:r}){let{runtime:s,entries:a,gguf:o,nameToGGUF:i}=e2,u=Bo(a,o,i,t,n,r);if(u===null)return null;let l=u,c=await Nn(e2,{routeName:"packed",include:d=>_s(d,o,i,t,n,r),bitsLength:d=>d*l,scalesLength:d=>d,scalesF16:()=>s.device.features.has("shader-f16"),specForSlot:d=>L_(u,d.type),cpuFallback:(d,p,f,g)=>{if(d.type===E.Q8_0)Q_(p,f,g,d.baseBlock);else{let m=nn(d.type,p);if(!m)throw new Error(`packQ4GGUFWeights: ${d.gname} type ${d.type} is not dequantizable`);let A=D_(m);f.set(A.bits,d.baseBlock*8),g.set(A.scales,d.baseBlock)}}});return c&&{...c,packedQuantBits:u}}async function R_(e2,{kq4Ids:t}){return await Nn(e2,{routeName:"kq4",include:r=>t.has(r.id),bitsLength:r=>r*4,scalesLength:r=>r*2,scalesF16:()=>e2.runtime.device.features.has("shader-f16"),specForSlot:r=>r.type===E.Q4_1?Oe.Q4_1:r.type===E.Q5_K?eo.Q5_K_TO_KQ4:Oe.Q4_K})}function Io(e2,t,n,r){return hs(e2,r,td(e2,t,n,Qa,r))}async function M_(e2,{iqIds:t}){return await Nn(e2,{routeName:"IQ",include:r=>t.has(r.id),bitsLength:r=>r*8,scalesLength:r=>r*2,scalesF16:()=>e2.runtime.device.features.has("shader-f16"),specForSlot:r=>K_(r.type),cpuFallback:(r,s,a,o)=>{let i=bl(r.type,s);a.set(i.bits,r.baseBlock*8),o.set(i.scales,r.baseBlock*2)}})}function K_(e2){return e2===E.IQ2_XXS?Oe.IQ2_XXS:e2===E.IQ2_XS?Oe.IQ2_XS:e2===E.IQ2_S?Oe.IQ2_S:e2===E.IQ3_S?Oe.IQ3_S:e2===E.IQ3_XXS?Oe.IQ3_XXS:null}function To(e2,t,n,r){if(globalThis.process?.env?.LUT_PACKS==="0")return{lut32Ids:new Set,lut16Ids:new Set};let s=new Map(e2.map(l=>[l.id,l])),a=l=>{let c=s.get(l);if(!c||!r.has(Et(l)))return null;let d=n(c.name);return t.has(d)?As.get(t.info(d).type)??null:null},o=hs(e2,r,l=>{let c=a(l);return c?`${c.lutId}|${c.per16?16:32}`:null}),i=new Set,u=new Set;for(let l of o)(a(l).per16?u:i).add(l);return{lut32Ids:i,lut16Ids:u}}async function Nc(e2,{lutIds:t,per16:n}){let{runtime:r,entries:s,gguf:a,nameToGGUF:o}=e2,i=await Nn(e2,{routeName:"LUT",include:l=>{if(!t.has(l.id))return false;let c=o(l.name),d=a.info(c),p=As.get(d.type);if(!p||p.per16!==n)throw new Error(`packLutGGUFWeights: ${c} type ${d.type} is not a per${n?16:32} LUT route`);return true},bitsLength:l=>l*4,scalesLength:l=>l*(n?2:1),scalesF16:l=>r.device.features.has("shader-f16")&&l.every(c=>c.type===E.IQ4_NL),specForSlot:l=>As.get(l.type).spec});if(i===null)return null;let u=new Map;for(let l of s)i.packedIds.has(l.id)&&u.set(l.id,As.get(a.info(o(l.name)).type).lutId);return{...i,lutIds:u,lut16:n?1:0}}function Eo(e2,t,n,r,s){let a=globalThis.process?.env,o=new Map(e2.map(l=>[l.id,l])),i=new Map;for(let l of ko)i.set(l.key,a?.[l.env]==="0"?new Set:hs(e2,r,c=>{let d=Et(c);if(!O_.has(d)||!r.has(d))return null;let p=o.get(c);if(!p)return null;let f=n(p.name);return t.has(f)&&t.info(f).type===l.ggmlType?`${l.key}raw`:null}));let u=ko.filter(l=>l.key!=="iq1"&&a?.[l.env]!=="1"&&a?.[l.env]!=="0");if(u.length>0){let l=u.flatMap(c=>[...i.get(c.key)]).reduce((c,d)=>{let p=o.get(d);if(!p)return c;let f=n(p.name);return t.has(f)?c+t.info(f).elementCount/32*16:c},0);if(!(s?.maxBufferSize!==void 0&&l>s.maxBufferSize))for(let c of u)i.set(c.key,new Set)}return i}async function W_(e2,t,n){let{runtime:r}=e2,s=t.pack;if(!s)throw new Error(`raw-IQ pack for ${t.key} is not in this bundle (built for the shipped model's weight formats — load that model's own GGUF, or rebuild)`);let a=await Nn(e2,{routeName:`${t.key}-raw`,include:l=>n.has(l.id),guardElements:256,bitsLength:l=>l*t.wordsPerBlock,scalesLength:l=>l/8,scalesF16:()=>r.device.features.has("shader-f16"),specForSlot:()=>s.spec});if(!a)return null;let o=s.gemvGrid.data,i=new Uint32Array(o.buffer,o.byteOffset,o.length/4),u=r.tensorFromTypedArray("uint32",[i.length],i.slice());return{...a,grid:u}}async function nd(e2,{packSuffixes:t}){let{entries:n,gguf:r,nameToGGUF:s}=e2,a=Co(n,r,s,t),o=Eo(n,r,s,t,{maxBufferSize:e2.runtime.device.limits.maxBufferSize}),i=new Set([...o.values()].flatMap(m=>[...m])),{lut32Ids:u,lut16Ids:l}=To(n,r,s,t);for(let m of i)u.delete(m),l.delete(m);let c=new Set([...u,...l]),d=So(n,r,s,t),p=new Set([...Io(n,r,s,t)].filter(m=>!c.has(m)&&!i.has(m))),f={q4:await q_(e2,{packSuffixes:t,excludeKq4Ids:new Set([...a,...c,...i]),forceDenseIds:d}),kq4:await R_(e2,{kq4Ids:a}),lut32:await Nc(e2,{lutIds:u,per16:false}),lut16:await Nc(e2,{lutIds:l,per16:true}),iq:await M_(e2,{iqIds:p})};for(let m of ko)f[m.key]=await W_(e2,m,o.get(m.key));let g=new Set([f.q4,f.kq4,f.iq,f.lut32,f.lut16,f.iq1,f.iq2xxs,f.iq3xxs].flatMap(m=>m?[...m.packedIds]:[]));return{packs:f,skipDenseIds:g}}var I_,T_,E_,G_,gs,ed,x_,As,O_,ko,Go=P(()=>{"use strict";It();en();wt();ss();_t();Va();Ot();wo();no();I_={"self_attn.q_proj":"attn_q","self_attn.k_proj":"attn_k","self_attn.v_proj":"attn_v","self_attn.o_proj":"attn_output","self_attn.q_norm":"attn_q_norm","self_attn.k_norm":"attn_k_norm","mlp.gate_proj":"ffn_gate","mlp.up_proj":"ffn_up","mlp.down_proj":"ffn_down",input_layernorm:"attn_norm",post_attention_layernorm:"ffn_norm"};T_=new Set(["gate_proj","up_proj","down_proj","q_proj","k_proj","v_proj","o_proj","linear_in_proj_qkv","linear_in_proj_z","linear_in_proj_b","linear_in_proj_a","linear_out_proj"]),E_=4;G_=new Set([E.IQ2_XXS,E.IQ2_XS,E.IQ2_S,E.IQ3_XXS,E.IQ3_S,E.IQ1_S,E.IQ1_M]);gs=["linear_in_proj_qkv","linear_in_proj_z","linear_in_proj_b","linear_in_proj_a"],ed={q_proj:["q_proj","k_proj","v_proj"],k_proj:["q_proj","k_proj","v_proj"],v_proj:["q_proj","k_proj","v_proj"],gate_proj:["gate_proj","up_proj"],up_proj:["gate_proj","up_proj"],linear_in_proj_qkv:gs,linear_in_proj_z:gs,linear_in_proj_b:gs,linear_in_proj_a:gs,attn_q:["attn_q","attn_k","attn_v"],attn_k:["attn_q","attn_k","attn_v"],attn_v:["attn_q","attn_k","attn_v"],gate_exps:["gate_exps","up_exps"],up_exps:["gate_exps","up_exps"]},x_=new Set([E.Q4_K,E.Q4_1]);As=new Map([[E.IQ2_XXS,Fe.IQ2_XXS],[E.IQ2_XS,Fe.IQ2_XS],[E.IQ2_S,Fe.IQ2_S],[E.IQ3_XXS,Fe.IQ3_XXS],[E.IQ3_S,Fe.IQ3_S],[E.IQ4_NL,Fe.IQ4_NL],[E.IQ4_XS,Fe.IQ4_XS],[E.Q3_K,Fe.Q3_K],[E.MXFP4,Fe.MXFP4],[E.IQ1_S,Fe.IQ1_S],[E.IQ1_M,Fe.IQ1_M]].filter(e2=>e2[1]!==void 0));O_=new Set(["gate_exps","up_exps","down_exps"]),ko=[{key:"iq1",iqRaw:1,ggmlType:E.IQ1_M,env:"IQ1_RAW",wordsPerBlock:2,pack:Zn.IQ1_M},{key:"iq2xxs",iqRaw:2,ggmlType:E.IQ2_XXS,env:"IQ2_RAW",wordsPerBlock:2,pack:Zn.IQ2_XXS},{key:"iq3xxs",iqRaw:3,ggmlType:E.IQ3_XXS,env:"IQ3_RAW",wordsPerBlock:3,pack:Zn.IQ3_XXS}]});var jn,rd=P(()=>{"use strict";jn=class{#t=new WeakMap;#e=[];#n;constructor(t=n=>n.dispose()){this.#n=t}async getOrBuild(t,n){let r=this.#t.get(t);return r||(r=await n(),this.#t.set(t,r),this.#e.push(r)),r}release(t){let n=this.#t.get(t);if(!n)return;this.#t.delete(t);let r=this.#e.indexOf(n);r>=0&&this.#e.splice(r,1),this.#n(n)}disposeAll(){for(let t of this.#e)this.#n(t);this.#e.length=0,this.#t=new WeakMap}}});function ws(e2){let{entriesFor:t,nameToGGUF:n,packSuffixes:r}=e2;function s(o,i,u){let l=t(o),c=b=>{let S=n(b.name);return b.id==="lm_head"&&!u.has(S)?u.has("token_embd.weight")&&u.info("token_embd.weight").type===E.Q1_0:u.has(S)&&u.info(S).type===E.Q1_0},d=So(l,u,n,r),p=Co(l,u,n,r),f=i?.limits,g=Eo(l,u,n,r,{maxBufferSize:f?.maxBufferSize}),m=new Set([...g.values()].flatMap(b=>[...b])),{lut32Ids:A,lut16Ids:w}=To(l,u,n,r);for(let b of m)A.delete(b),w.delete(b);let C=new Set([...A,...w]),G=new Set([...Io(l,u,n,r)].filter(b=>!C.has(b)&&!m.has(b))),L=new Set([...p,...C,...m]),Z=Bo(l,u,n,r,L,d)??4,O=b=>g.get("iq1").has(b.id)?{buffer:"iq1",wordsPerBlock:2,scalesPerBlock:.125}:g.get("iq2xxs").has(b.id)?{buffer:"iq2xxs",wordsPerBlock:2,scalesPerBlock:.125}:g.get("iq3xxs").has(b.id)?{buffer:"iq3xxs",wordsPerBlock:3,scalesPerBlock:.125}:p.has(b.id)?{buffer:"kq4",wordsPerBlock:4,scalesPerBlock:2}:A.has(b.id)?{buffer:"lut32",wordsPerBlock:4,scalesPerBlock:1,scalesF32:true}:w.has(b.id)?{buffer:"lut16",wordsPerBlock:4,scalesPerBlock:2,scalesF32:true}:G.has(b.id)?{buffer:"iq",wordsPerBlock:8,scalesPerBlock:2}:_s(b,u,n,r,L,d)?{buffer:"q4",wordsPerBlock:Z,scalesPerBlock:1}:null;return ps({config:o,device:i,entries:l,emitGraph:e2.emitGraph,emitPrefillGraph:e2.emitPrefillGraph,isPacked:b=>O(b)!==null,isQ1:c,packedQuantBits:Z,packSlots:O,tieWordEmbeddings:dn(l,b=>u.has(n(b))),packEmbedQ8:o.hidden_size%32===0})}async function a(o,i,u,{onProgress:l,signal:c}){let d=t(u),p=d.map(Z=>({...Z,name:n(Z.name)})),f=dn(d,Z=>i.has(n(Z)));if(Xc(i,p,f)){let Z=await Jc({runtime:o,config:u,entries:p,gguf:i,tieWordEmbeddings:f,modelName:e2.modelName,onProgress:l});return e2.construct({...Z,runtime:o,config:u})}let g=Vc(i,n),m=Yc(i,n),{packs:A,skipDenseIds:w}=await nd({runtime:o,entries:d,gguf:i,nameToGGUF:n,signal:c},{packSuffixes:r}),C=dn(d,Z=>i.has(n(Z))),G=await mc(o,i,n,u,C,d);G&&(w.add("embed_tokens"),w.add("lm_head"));let L=await ro({runtime:o,config:u,entries:d,reader:g,source:m,modelName:e2.modelName,onProgress:l,signal:c,skipDenseIds:w,...G?{canUseQ4LmHead:()=>false,canUseQ8LmHead:()=>false}:{}});return e2.construct({...L,runtime:o,config:u,packs:A,...G??{}})}return{configFromGGUF:e2.configFromGGUF,checkSupport:s,loadWeights:a}}var xo=P(()=>{"use strict";fs();Ot();Go();It()});var Do={};bn(Do,{eagerGGUFModel:()=>od,ggufModelStatics:()=>Qo,prepareGGUFModel:()=>ad,readGGUFFile:()=>id});function sd(e2,t,n,r){let s=t.configFromGGUF(e2);return new ms({config:s,checkSupport:a=>t.checkSupport(s,a,e2),loadWeights:(a,{signal:o})=>t.loadWeights(a,e2,s,{onProgress:n,signal:o}),closeSource:r})}async function ad(e2,t,n){let r=await an.open(e2,t);try{return sd(r,n,t.onProgress??null,()=>r.close())}catch(s){throw await r.close(),s}}function od(e2,t,n){return sd(e2,n,t.onProgress??null,async()=>{})}async function id(e2){let{readFile:t}=await Promise.resolve().then(()=>(Ra(),qa));return new He(await t(e2))}function Qo(e2){let t=(r,s={})=>ad(r,s,e2()),n=(r,{gguf:s,onProgress:a})=>od(s,{onProgress:a},e2()).load(r);return{prepare:t,async load(r,s,a={}){return(await t(s,a)).load(r,{signal:a.signal})},async loadGGUFFile(r,s,a={}){return n(r,{gguf:await id(s),onProgress:a.onProgress})},loadGGUF:n}}var ys=P(()=>{"use strict";It();Ha();yo()});function F_(e2,t){return t.map(n=>`const ${n}: u32 = ${U_[n](e2)}u;`).join(`
`)}function Po(e2,t,n){let r=[];for(let s=0;s<t;++s)r.push(`    case ${s}u: { return ${n(s)}u; }`);return`fn ${e2}(layer: u32) -> u32 {
  switch layer {
${r.join(`
`)}
    default: { return 0u; }
  }
}`}function cd({config:e2,offsets:t}){let n=e2,r=n.hidden_size,s=n.intermediate_size,a=n.num_attention_heads,o=n.num_key_value_heads,i=n.head_dim,u=n.max_position_embeddings;return{maxSeq:u,consts:F_(n,["VOCAB_SIZE","HIDDEN_SIZE","INTERMEDIATE_SIZE","NUM_LAYERS","NUM_HEADS","NUM_KV_HEADS","NUM_KV_GROUPS","HEAD_DIM","HEAD_DIM_HALF"]),ropeTheta:$_(n),rmsEps:N_(n),scaling:j_(i),embedOffset:t.top.embed_tokens,modelNormOffset:t.top.model_norm,lmHeadOffset:t.top.lm_head,layerOffsets:X_(n,t),qkNormBlock:ew(n),siluFn:H_,f32Min:z_,hiddenArraySize:u*r,qArraySize:u*a*i,kvArraySize:u*o*i,interSize:s}}function dd(e2){return e2.head_dim<=128&&Z_(e2.head_dim)}function Vn(e2){return e2.head_dim<=64?64:128}function pd(e2){return Math.min(Vn(e2),128)}function Z_(e2){return Number.isInteger(e2)&&e2>0&&(e2&e2-1)===0}function An(e2,t){return e2.layer_types?e2.layer_types[t]:"full_attention"}function zt(e2){return!!e2.attention_qk_norm}function V_(e2,t){return zt(e2)?`${Po("q_layernorm_offset",e2.num_hidden_layers,n=>t.layers[n].q_layernorm)}
${Po("k_layernorm_offset",e2.num_hidden_layers,n=>t.layers[n].k_layernorm)}`:""}function X_(e2,t){let n=Y_.map(([r,s])=>Po(r,e2.num_hidden_layers,a=>t.layers[a][s]));return n.push(V_(e2,t)),n.join(`
`)}function ud({buffer:e2,indexFn:t,headCount:n,weightBase:r,indent:s}){let a=" ".repeat(s);return`${a}for (var head = 0u; head < ${n}; head = head + 1u) {
${a}  var variance = 0.0;
${a}  for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
${a}    let value = ${e2}[${t("d")}];
${a}    variance = variance + value * value;
${a}  }
${a}  let scale = inverseSqrt(variance / f32(HEAD_DIM) + RMS_EPS);
${a}  for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
${a}    ${e2}[${t("d")}] = ${e2}[${t("d")}] * scale * weights[${r} + d];
${a}  }
${a}}`}function J_(e2,{wrapInTimeLoop:t=false,useLayerOffsets:n=true,indent:r=4}={}){if(!zt(e2))return"";let s=t?r+2:r,a=t?d=>`q_index(t, head, ${d})`:d=>`q_index(head, ${d})`,o=t?d=>`kv_index(t, head, ${d})`:d=>`kv_index(head, ${d})`,i=n?"q_layernorm_offset(layer)":"W_Q_NORM",u=n?"k_layernorm_offset(layer)":"W_K_NORM",l=ud({buffer:"q",indexFn:a,headCount:"NUM_HEADS",weightBase:i,indent:s}),c=ud({buffer:"k",indexFn:o,headCount:"NUM_KV_HEADS",weightBase:u,indent:s});if(t){let d=" ".repeat(r);return`
${d}for (var t = 0u; t < params.seq_len; t = t + 1u) {
${l}
${c}
${d}}`}return`
${l}
${c}`}function qe(e2){return e2.packs.q1!=null}var z_,H_,U_,Lo,ld,$_,N_,j_,Y_,ew,Gt=P(()=>{"use strict";z_="-3.4028234663852886e+38",H_=`fn silu(x: f32) -> f32 {
  return x / (1.0 + exp(-x));
}`,U_={HIDDEN_SIZE:e2=>e2.hidden_size,HIDDEN_SIZE_VEC4:e2=>e2.hidden_size/4,INTERMEDIATE_SIZE:e2=>e2.intermediate_size,INTERMEDIATE_SIZE_VEC4:e2=>e2.intermediate_size/4,VOCAB_SIZE:e2=>e2.vocab_size,NUM_LAYERS:e2=>e2.num_hidden_layers,NUM_HEADS:e2=>e2.num_attention_heads,NUM_KV_HEADS:e2=>e2.num_key_value_heads,NUM_KV_GROUPS:e2=>e2.num_attention_heads/e2.num_key_value_heads,HEAD_DIM:e2=>e2.head_dim,HEAD_DIM_HALF:e2=>e2.head_dim/2,KV_SIZE:e2=>e2.num_key_value_heads*e2.head_dim,Q_PAIRS:e2=>e2.num_attention_heads*(e2.head_dim/2),KV_PAIRS:e2=>e2.num_key_value_heads*(e2.head_dim/2),TOTAL_PAIRS:e2=>(e2.num_attention_heads+e2.num_key_value_heads)*(e2.head_dim/2)};Lo=32,ld=8;$_=e2=>Number(e2.rope_parameters?.rope_theta).toPrecision(9),N_=e2=>Number(e2.rms_norm_eps).toPrecision(9),j_=e2=>Math.pow(e2,-.5).toPrecision(9);Y_=[["q_offset","q_proj"],["k_offset","k_proj"],["v_offset","v_proj"],["o_offset","o_proj"],["gate_offset","gate_proj"],["up_offset","up_proj"],["down_offset","down_proj"],["input_norm_offset","input_layernorm"],["post_norm_offset","post_attention_layernorm"]];ew=e2=>J_(e2,{wrapInTimeLoop:true,useLayerOffsets:true,indent:4})});function bs(e2,t){return{cache:rt.allocate(e2.runtime,e2.config,1,t,e2.cacheDtype)}}function ks(e2){return Ue(e2)||e2.hidden_size>128||e2.num_hidden_layers>4||e2.vocab_size>4096}function vs(e2){let{config:t,runtime:n,cacheDtype:r}=e2;if(!ks(t))return t.max_position_embeddings;let s=n.device.limits;if(!s)return t.max_position_embeddings;let a=r==="float16"?2:4,o=t.num_key_value_heads*t.head_dim*a,i=_e(s.maxComputeWorkgroupStorageSize,"limits.maxComputeWorkgroupStorageSize"),u=Vn(t)*4,l=Ue(t)?t.max_position_embeddings:Math.floor((i-u)/4),c=typeof s.maxStorageBufferBindingSize=="number"&&s.maxStorageBufferBindingSize>0?s.maxStorageBufferBindingSize:1/0,d=Number.isFinite(c)?Math.max(1,Math.floor(c/o)):t.max_position_embeddings,p=typeof s.maxBufferSize=="number"&&s.maxBufferSize>0?s.maxBufferSize:1/0,f=Number.isFinite(p)?Math.max(1,Math.floor(p/(t.num_hidden_layers*o))):t.max_position_embeddings;return Math.max(1,Math.min(t.max_position_embeddings,l,d,f))}var qo=P(()=>{"use strict";mn();dt();Gt()});function xt(e2){let t={},n={},r=new Map;return{w:(o,i)=>{let u=r.get(o);if(u)return u;t[o]=i;let l=e2.weight(o,i.dtype,i.shape);return r.set(o,l),l},state:(o,i)=>(n[o]=i,e2.state(o,i.dtype,i.shape)),boundWeights:t,states:n}}function nw(e2){return e2!==null&&typeof e2=="object"&&typeof e2.id=="number"&&typeof e2.dtype=="string"&&Array.isArray(e2.shape)}function rw(e2,t){return e2.length===t.length&&e2.every((n,r)=>n===t[r])}var tw,mt,Yn=P(()=>{"use strict";Le();wa();tw=new Set(["intermediate","output"]),mt=class{tensors=[];nodes=[];aliases=[];boundNames=new Map;ops=new Map;get nodeCount(){return this.nodes.length}input(t,n,r){return this.declareTensor("input",t,n,r)}weight(t,n,r){return this.declareTensor("weight",t,n,r)}state(t,n,r){return this.declareTensor("state",t,n,r)}stepInput(t,n,r){return this.declareTensor("stepInput",t,n,r)}uniform(t,n){if(n<=0||n%4!==0)throw new Error(`graph uniform "${t}" needs a positive multiple-of-4 byte length (got ${n})`);return this.declareTensor("uniform",t,"uint32",[n/4])}scratch(t,n,r){return this.declareTensor("intermediate",t,n,r)}view(t,n,r,s,a){if(t.view)throw new Error(`graph view "${t.name}" cannot itself be viewed (one level only)`);if(t.kind==="uniform")throw new Error(`graph uniform "${t.name}" cannot be viewed`);if(!Number.isInteger(n)||n<0)throw new Error(`graph view of "${t.name}" needs a non-negative integer elementOffset (got ${n})`);let o={id:this.tensors.length,kind:"intermediate",dtype:r,shape:[...s],name:a??`${t.name}.view@${n}`,view:{parent:t.id,elementOffset:n}};return this.tensors.push(o),o}op(t,n,r={}){let s=this.opFor(t),a={},o={};for(let[c,d]of Object.entries(n))if(d!==void 0){if(!nw(d))throw new Error(`${t}: binding "${c}" is not a graph tensor — scalars belong in options.args`);a[c]=d,o[c]=d.id}let i=s.inferOutputs(a,{args:r.args,attrs:r.attrs}),u={},l={};for(let[c,d]of Object.entries(i)){let p=n[c],f=d.dtype;if(p!==void 0){if(!rw(p.shape,d.shape))throw new Error(`${t}: output "${c}" bound to tensor "${p.name}" of shape [${p.shape}] but the manifest infers [${d.shape}]`);u[c]=p,l[c]=p.id;continue}let g=this.allocate("intermediate",`${t.split(".").pop()}.${c}#${this.nodes.length}`,f,d.shape);u[c]=g,l[c]=g.id}return this.nodes.push({op:t,inputs:o,outputs:l,...r.args?{args:{...r.args}}:{},...r.attrs?{attrs:{...r.attrs}}:{}}),u}alias(t,n){if(t.id===n.id)throw new Error(`alias: a tensor cannot alias itself ("${t.name}")`);for(let[a,o]of[["from",t],["to",n]])if(!tw.has(o.kind))throw new Error(`alias: ${a} tensor "${o.name}" is ${o.kind}; only intermediate/output tensors can share a buffer`);if(t.dtype!==n.dtype)throw new Error(`alias("${t.name}","${n.name}"): dtype mismatch (${t.dtype} vs ${n.dtype})`);let r=ye(t.shape)*ge(t.dtype),s=ye(n.shape)*ge(n.dtype);if(r!==s)throw new Error(`alias("${t.name}","${n.name}"): byte-length mismatch (${r} vs ${s}); a shared buffer needs an exact-size fit`);this.aliases.push({from:t.id,to:n.id})}output(t,n){let r={...t,kind:"output",name:n??t.name};return this.tensors[t.id]=r,r}finish(t){return Object.freeze({name:t.name,params:Object.freeze({...t.params??{}}),tensors:Object.freeze([...this.tensors]),nodes:Object.freeze([...this.nodes]),...this.aliases.length>0?{aliases:Object.freeze([...this.aliases])}:{}})}opFor(t){let n=this.ops.get(t);return n||(n=ut(t),this.ops.set(t,n)),n}declareTensor(t,n,r,s){let a=this.boundNames.get(n);if(a)throw new Error(`graph tensor name "${n}" already declared (${a.kind})`);let o=this.allocate(t,n,r,s);return this.boundNames.set(n,o),o}allocate(t,n,r,s){if(!s.every(o=>Number.isInteger(o)&&o>=0))throw new Error(`graph tensor "${n}" has a non-integer shape [${s}]`);let a={id:this.tensors.length,kind:t,dtype:r,shape:[...s],name:n};return this.tensors.push(a),a}}});function fd(e2,t){let n=e2;for(let r of t)n=sw(n,r);return n}function sw(e2,t){let n=new Map,r=u=>{n.set(u,(n.get(u)??0)+1)};for(let u of e2.nodes){let l=new Set(Object.values(u.outputs));for(let c of Object.values(u.inputs))l.has(c)||r(c)}for(let u of e2.tensors)u.kind==="output"&&r(u.id);let s=new Map;e2.nodes.forEach((u,l)=>{if(u.op!==t.consumer)return;let c=u.inputs[t.consumerInput];c!==void 0&&s.set(c,s.has(c)?-1:l)});let a=new Map,o=new Set;if(e2.nodes.forEach((u,l)=>{if(u.op!==t.producer)return;let c=u.outputs[t.producerOutput];if(c===void 0||(n.get(c)??0)!==1)return;let d=s.get(c);if(d===void 0||d<0)return;let p=t.fuse(u,e2.nodes[d]);p!==null&&(a.set(d,p),o.add(l))}),a.size===0)return e2;let i=[];return e2.nodes.forEach((u,l)=>{o.has(l)||i.push(a.get(l)??u)}),Object.freeze({...e2,nodes:Object.freeze(i)})}var md=P(()=>{"use strict"});function Ro(e2,t,n){let r=e2.tensors.find(a=>a.kind==="uniform"&&a.name===t);if(!r)throw new Error(`graphUniformPacker: graph "${e2.name}" has no uniform "${t}"`);let s=[];if(e2.nodes.forEach((a,o)=>{for(let[i,u]of Object.entries(a.inputs))u===r.id&&s.push(...aw(a.op,i,n?.[o]??null))}),s.length===0)throw new Error(`graphUniformPacker: no op reads uniform "${t}" in graph "${e2.name}"`);return ow(s,`${e2.name}.${t}`,r.shape[0])}function aw(e2,t,n=null){let r=`${e2}\0${t}\0${n??""}`,s=gd.get(r);if(s)return s;let a=ut(e2),o=[];for(let i of a.manifest.variants)if(!(n!==null&&i.id!==n))for(let u of i.passes)for(let l of u.bindings){if(l.buffer?.type!=="uniform"||!l.struct||l.arg!==t&&l.name!==t)continue;let c=l.struct.fields.map(d=>{if(d.type!=="u32"&&d.type!=="i32"&&d.type!=="f32")throw new Error(`${e2}#${i.id}: uniform field ${d.name} has non-scalar type ${d.type} — step packers cover scalar structs only`);return{name:d.name,kind:d.type}});o.push({source:`${e2}#${i.id}/${u.id}`,fields:c})}return gd.set(r,o),o}function ow(e2,t,n){let r=e2[0];for(let f of e2)f.fields.length>r.fields.length&&(r=f);for(let f of e2)f.fields.forEach((g,m)=>{let A=r.fields[m];if(g.name!==A.name||g.kind!==A.kind)throw new Error(`stepUniformPacker(${t}): ${f.source} declares field ${m} "${g.name}: ${g.kind}" but ${r.source} declares "${A.name}: ${A.kind}" — ops sharing one override buffer must agree on a common field prefix`)});let s=Math.max(4,Math.ceil(r.fields.length/4)*4);if(n!==void 0&&n!==s)throw new Error(`stepUniformPacker(${t}): g.uniform declares ${n*4} bytes but the struct (${r.fields.map(f=>f.name).join(", ")}) packs to ${s*4}`);let a=new ArrayBuffer(s*4),o=new Uint32Array(a),i=new Int32Array(a),u=new Float32Array(a),l=new Map(r.fields.map((f,g)=>[f.name,{...f,index:g}])),c=r.fields.filter(f=>!f.name.startsWith("_")).length,d=()=>r.fields.map(f=>f.name).join(", ");return Object.assign(f=>{let g=0;for(let m of Object.keys(f)){let A=l.get(m);if(!A)throw new Error(`stepUniformPacker(${t}): unknown field "${m}" (struct: ${d()})`);A.kind==="f32"?u[A.index]=f[m]:A.kind==="i32"?i[A.index]=f[m]:o[A.index]=f[m],g+=1}if(g!==c){let m=r.fields.filter(A=>!A.name.startsWith("_")&&!(A.name in f)).map(A=>A.name);throw new Error(`stepUniformPacker(${t}): missing field(s) ${m.join(", ")} (struct: ${d()})`)}return o},{fields:new Set(r.fields.map(f=>f.name))})}var gd,Ad=P(()=>{"use strict";_t();gd=new Map});var Mo,Ko,Cs,Ss,Oo=P(()=>{"use strict";ho();Ad();Mo=class{steps=[];prefillSteps=null;get stepCount(){return this.steps.length}get prefillStepCount(){return(this.prefillSteps??this.steps).length}async step(t,n){return this.writeStepInputs(t,n),this.collector.enqueue(this.steps),(await this.runtime.readTensor(this.idsTensor))[0]}submitStep(t,n){return this.writeStepInputs(t,n),this.collector.enqueue(this.steps),this.runtime.readTensor(this.idsTensor).then(r=>r[0])}enqueueStep(t,n,{full:r=false}={}){this.writeStepInputs(t,n),this.collector.enqueue(r?this.steps:this.prefillSteps??this.steps)}async replayKnownInputs(t,n){for(let r=0;r<t.length;++r)this.enqueueStep(t[r],n+r);await this.runtime.queueIdle()}finish(){}measureGpuMs(){return this.runtime.measurePreparedSequenceGpuMs?this.runtime.measurePreparedSequenceGpuMs(this.steps):Promise.resolve(null)}},Ko=class extends Mo{compiled;get collector(){return this.compiled.collector}get idsTensor(){return this.compiled.tensor("input_ids")}dispose(){this.compiled?.dispose()}},Cs=class extends Ko{model;cache;emission;#t;#e=new Map;constructor(t,n){super(),this.model=t,this.cache=n}stepUniformPack(t){let n=this.#e.get(t);return n||(n=Ro(this.#t,t,this.compiled.nodeVariants),this.#e.set(t,n)),n}get runtime(){return this.model.runtime}async prepareBuild(){}onCompiled(){}async build(t,{fuse:n=false}={}){await this.prepareBuild();let{emission:r,graph:s}=this.buildGraph(t,n);this.emission=r,this.#t=s,this.#e.clear();let a=r.nextTokenTailNodeCount,o=a===void 0?null:s.nodes.length-a;if(a!==void 0&&(!Number.isInteger(a)||a<=0||o===null||o<=0))throw new Error(`graph "${s.name}": next-token tail must be a positive proper suffix (got ${a} of ${s.nodes.length} nodes)`);if(this.compiled=gn(s,this.runtime,{weights:r.weights,states:r.states,...r.inputs?{inputs:r.inputs}:{}}),o===null)this.prefillSteps=null,this.steps=await this.compiled.buildSteps();else{let i=await this.compiled.buildSteps({endNode:o}),u=await this.compiled.buildSteps({startNode:o});if(i.length===0||u.length===0)throw new Error(`graph "${s.name}": next-token tail split produced an empty prepared sequence`);this.prefillSteps=i,this.steps=[...i,...u]}this.onCompiled()}writeStepInputs(t,n){t!==null&&this.runtime.host.writeBuffer(this.compiled.tensor("input_ids").buffer,0,new Uint32Array([t])),this.writeStepUniforms(n)}},Ss=class{model;cache;blockLen;emission;compiled;steps=[];bodySteps=null;#t=new Map;constructor(t,n,r){this.model=t,this.cache=n,this.blockLen=r}stepUniformPack(t){let n=this.#t.get(t);return n||(n=Ro(this.emission.graph,t,this.compiled.nodeVariants),this.#t.set(t,n)),n}get runtime(){return this.model.runtime}async prepareBuild(){}onCompiled(){}async build(){await this.prepareBuild(),this.emission=this.buildEmission(),this.#t.clear(),this.compiled=gn(this.emission.graph,this.runtime,{weights:this.emission.weights,states:this.emission.states,...this.emission.inputs?{inputs:this.emission.inputs}:{}});let t=this.emission.nextTokenTailNodeCount,n=t===void 0?null:this.emission.graph.nodes.length-t;if(t!==void 0&&(!Number.isInteger(t)||t<=0||n===null||n<=0))throw new Error(`graph "${this.emission.graph.name}": next-token tail must be a positive proper suffix (got ${t} of ${this.emission.graph.nodes.length} nodes)`);if(n===null)this.bodySteps=null,this.steps=await this.compiled.buildSteps();else{let r=await this.compiled.buildSteps({endNode:n}),s=await this.compiled.buildSteps({startNode:n});if(r.length===0||s.length===0)throw new Error(`graph "${this.emission.graph.name}": next-token tail split produced an empty prepared sequence`);this.bodySteps=r,this.steps=[...r,...s]}this.onCompiled()}writeInputs(t,n){if(t.length===0||t.length>this.blockLen)throw new Error(`prefill block ${this.blockLen} cannot run ${t.length} tokens`);let r=new Uint32Array(this.blockLen);r.set(t),this.runtime.host.writeBuffer(this.compiled.tensor("input_ids").buffer,0,r),this.writeRunInputs(t.length,n)}enqueueBody(t,n=0){if(!this.bodySteps)throw new Error(`prefill graph "${this.emission.graph.name}" has no removable next-token tail`);this.writeInputs(t,n),this.compiled.collector.enqueue(this.bodySteps)}async run(t,n=0){return this.writeInputs(t,n),this.compiled.collector.enqueue(this.steps),(await this.runtime.readTensor(this.compiled.tensor("next_token")))[0]}dispose(){this.compiled?.dispose()}}});function Qt(e2,t,n){let r=t.maxLength*e2.config.num_key_value_heads*e2.config.head_dim,s=n*r;return{cacheKeysT:Te(t.keyStates,s,r),cacheValuesT:Te(t.valueStates,s,r)}}function Ut(e2,t){return _d(e2,t)}function iw(e2,t,n){return _d(e2,n.map(r=>`layers.${t}.${r}`))}function _d(e2,t){let n=e2.packs.q1;if(!n)throw new Error("Q1 resource views requested but no q1 pack is loaded");if(t.length===0)throw new Error("Q1 resource views require at least one weight id");let r=Bs(n,t[0]);for(let u of t.slice(1)){let l=Bs(n,u);if(l.groupIndex!==r.groupIndex)throw new Error(`Q1 co-bound weights must declare one packedGroup: ${t.join(", ")}`);if(l.shardIndex!==r.shardIndex)throw new Error(`Q1 co-bound weights resolved to different shards: ${t.join(", ")}`)}let s=n.shards[r.shardIndex];if(!s)throw new Error(`Missing Q1 shard ${r.shardIndex} for ${t[0]}`);let a=cw(n,s,t),o=new Set(t),i=u=>{if(!o.has(u))throw new Error(`Q1 packed weight ${u} is not part of this bound view`);let l=Bs(n,u);if(l.groupIndex!==r.groupIndex||l.shardIndex!==r.shardIndex)throw new Error(`Q1 packed weight ${u} is outside the requested group`);return l.blockOffset-a.baseBlock};return{q1BitsT:Te(s.bits,a.baseBlock*4,a.blockCount*4),q1ScalesT:Te(s.scales,a.baseBlock,a.blockCount),offset:i,colMajor:u=>n.colMajorIds.has(u)?1:0}}function Dt(e2,t){return(n,r,s)=>{let a=iw(t,n,r);return{bitsT:e2(`L${n}.q1bits.${s}`,a.q1BitsT),scalesT:e2(`L${n}.q1scales.${s}`,a.q1ScalesT),offset:o=>a.offset(o)}}}function uw(e2,t,n){return lw(e2,n.map(r=>`layers.${t}.${r}`))}function Pt(e2,t){return(n,r,s)=>{let a=uw(t,n,r);return{bitsT:e2(`L${n}.q4bits.${s}`,a.q4BitsT),scalesT:e2(`L${n}.q4scales.${s}`,a.q4ScalesT),offset:o=>a.offset(o),format:a.format,quantBits:a.quantBits,hasMin:a.hasMin,iq:a.iq,lut:a.lut,lut16:a.lut16,iqRaw:a.iqRaw,gridT:a.gridT?e2(`iqgrid${a.iqRaw}.${s}`,a.gridT):null}}}function lw(e2,t){let n=[{pack:e2.packs.iq1,iqRaw:1,wordsPerBlock:2},{pack:e2.packs.iq2xxs,iqRaw:2,wordsPerBlock:2},{pack:e2.packs.iq3xxs,iqRaw:3,wordsPerBlock:3}];for(let p of n){let f=p.pack;if(!f||ft(f.offsets,t[0])===void 0)continue;let g=Number.POSITIVE_INFINITY,m=0;for(let C of t){let G=Ht(f.offsets,C,"offset"),L=Ht(f.blockCounts,C,"block count");g=Math.min(g,G),m=Math.max(m,G+L)}let A=Math.floor(g/1024)*1024,w=m-A;return{q4BitsT:Te(f.bits,A*p.wordsPerBlock,w*p.wordsPerBlock),q4ScalesT:Te(f.scales,A/8,Math.ceil(w/8)),offset:C=>Ht(f.offsets,C,"offset")-A,format:"q4_0",hasMin:0,iq:0,lut:0,lut16:0,quantBits:4,iqRaw:p.iqRaw,gridT:f.grid}}let r=wd(e2,t[0]);if(r){let p=r.lutIds.get(t[0])??0;for(let m of t)if(r.lutIds.get(m)!==p)throw new Error(`co-bound LUT weights disagree on lutId: ${t.join(", ")}`);let f=r.lut16?2:1,g=hd(r,t);return{q4BitsT:Te(r.bits,g.baseBlock*4,g.blockCount*4),q4ScalesT:Te(r.scales,g.baseBlock*f,g.blockCount*f),offset:m=>Ht(r.offsets,m,"offset")-g.baseBlock,format:r.lut16?"lut16":"lut32",hasMin:0,iq:0,lut:p,lut16:r.lut16,quantBits:4,iqRaw:0,gridT:null}}let{iq:s,kq4:a,q4:o}=e2.packs,i=s&&ft(s.offsets,t[0])!==void 0?{pack:s,wordsPerBlock:8,scalesPerBlock:2,hasMin:0,iqFlag:1,format:"iq"}:a&&ft(a.offsets,t[0])!==void 0?{pack:a,wordsPerBlock:4,scalesPerBlock:2,hasMin:1,iqFlag:0,format:"q4_k"}:o?{pack:o,wordsPerBlock:o.packedQuantBits,scalesPerBlock:1,hasMin:0,iqFlag:0,format:o.packedQuantBits===8?"q8_0":"q4_0"}:null;if(!i)throw new Error(`No packed-quant route holds ${t[0]}`);let{pack:u,wordsPerBlock:l,scalesPerBlock:c}=i,d=hd(u,t);return{q4BitsT:Te(u.bits,d.baseBlock*l,d.blockCount*l),q4ScalesT:Te(u.scales,d.baseBlock*c,d.blockCount*c),offset:p=>Ht(u.offsets,p,"offset")-d.baseBlock,format:i.format,hasMin:i.hasMin,iq:i.iqFlag,lut:0,lut16:0,quantBits:l,iqRaw:0,gridT:null}}function hd(e2,t){let n=Number.POSITIVE_INFINITY,r=0;for(let i of t){let u=Ht(e2.offsets,i,"offset"),l=Ht(e2.blockCounts,i,"block count");n=Math.min(n,u),r=Math.max(r,u+l)}let a=ge(e2.scales.dtype)===2?128:64,o=Math.floor(n/a)*a;return{baseBlock:o,blockCount:r-o}}function Bs(e2,t){let n=e2.locations.get(t);if(!n)throw new Error(`Missing Q1 packed weight location for ${t}`);return n}function cw(e2,t,n){let r=Number.POSITIVE_INFINITY,s=0;for(let u of n){let l=Bs(e2,u);if(l.blockOffset+l.blockCount>t.blockCount)throw new Error(`Q1 packed weight ${u} exceeds shard ${l.shardIndex}`);r=Math.min(r,l.blockOffset),s=Math.max(s,l.blockOffset+l.blockCount)}let o=ge(t.scales.dtype)===2?128:64,i=Math.floor(r/o)*o;return{baseBlock:i,blockCount:s-i}}function Ee(e2,t){let{q4:n,iq1:r,iq2xxs:s,iq3xxs:a}=e2.packs;return n!=null&&ft(n.offsets,t)!==void 0||dw(e2,t)||pw(e2,t)||wd(e2,t)!==null||[r,s,a].some(o=>o!=null&&ft(o.offsets,t)!==void 0)}function dw(e2,t){let{kq4:n}=e2.packs;return n!=null&&ft(n.offsets,t)!==void 0}function pw(e2,t){let{iq:n}=e2.packs;return n!=null&&ft(n.offsets,t)!==void 0}function wd(e2,t){for(let n of[e2.packs.lut32,e2.packs.lut16])if(n&&ft(n.offsets,t)!==void 0)return n;return null}function Ht(e2,t,n){let r=ft(e2,t);if(r===void 0||!Number.isInteger(r)||r<0)throw new Error(`Missing packed weight ${n} for ${t}`);return r}function Te(e2,t,n){if(!Number.isInteger(t)||t<0)throw new Error(`tensor view elementOffset must be a non-negative integer, got ${t}`);if(!Number.isInteger(n)||n<=0)throw new Error(`tensor view elementCount must be a positive integer, got ${n}`);let r=ge(e2.dtype),s=e2.byteOffset??0,a=s+t*r,o=n*r;if(a+o>s+e2.byteLength)throw new Error(`tensor view range exceeds tensor byteLength for dtype ${e2.dtype}`);return{...e2,shape:[n],size:n,byteOffset:a,byteLength:o}}function Wo(e2,t,n){let r=t/2,s=new Float32Array(e2*r),a=new Float32Array(e2*r);for(let o=0;o<e2;++o)for(let i=0;i<r;++i){let u=1/Math.pow(n,i*2/t),l=o*u,c=o*r+i;s[c]=Math.cos(l),a[c]=Math.sin(l)}return{cos:s,sin:a}}function hn(e2){if(e2.ropeCache)return e2.ropeCache;let t=e2.config.rope_parameters?.rope_theta;if(typeof t!="number")throw new Error("RoPE cache requires config.rope_parameters.rope_theta");let n=e2.config.max_position_embeddings,r=e2.config.head_dim/2,{cos:s,sin:a}=Wo(n,e2.config.head_dim,t);return e2.ropeCache={cos:e2.runtime.tensorFromTypedArray("float32",[n,r],s),sin:e2.runtime.tensorFromTypedArray("float32",[n,r],a)},e2.ropeCache}var _n=P(()=>{"use strict";Ot();Le()});function gw(e2){let t=e2.config;if(Ue(t))throw new Error("emitLlamaDecode: linear-attention layers not yet supported (Qwen3.5 stage)");if(qe(e2)&&ct(t))throw new Error("emitLlamaDecode: Q1 conv layers not yet supported");if(qe(e2)&&!zt(t))throw new Error("emitLlamaDecode: Q1 without qk-norm not yet supported (the packed path needs qk-norm)")}function Jn(e2,t){let n=e2.nodeCount,r=!!(t.model.lmHeadQ4&&t.model.lmHeadQ4Scales),s=!!(t.model.lmHeadQ8&&t.model.lmHeadQ8Scales),a=t.q1||r?512:fw,o=e2.scratch("bestValues","float32",[a]),i=e2.scratch("bestIds","uint32",[a]);if(t.q1){let u=e2.scratch("final.normed",t.normedDtype,[t.hiddenSize]);e2.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:t.hidden,weightsT:t.weights,normedT:u},{args:{hiddenSize:t.hiddenSize,rmsEps:t.rmsEps,normOffset:t.finalNormOffset}});let l=Ut(t.model,["lm_head"]);e2.op("com.xenova.LlamaDecodeLmHeadQ1ArgmaxTiled",{normedT:u,q1BitsT:t.w("lmhead.q1bits",l.q1BitsT),q1ScalesT:t.w("lmhead.q1scales",l.q1ScalesT),bestValuesT:o,bestIdsT:i},{args:{hiddenSize:t.hiddenSize,vocabSize:t.vocabSize,lmHeadOffset:l.offset("lm_head"),numBlocks:a,colMajor:l.colMajor("lm_head")}})}else if(r)e2.op("com.xenova.LlamaDecodeLmHeadQ4ArgmaxTiled",{hiddenT:t.hidden,q4BitsT:t.w("lmhead.q4bits",t.model.lmHeadQ4),q4ScalesT:t.w("lmhead.q4scales",t.model.lmHeadQ4Scales),weightsT:t.weights,bestValuesT:o,bestIdsT:i},{args:{hiddenSize:t.hiddenSize,vocabSize:t.vocabSize,lmHeadOffset:0,finalNormOffset:t.finalNormOffset,numBlocks:a}});else if(s){let u=e2.scratch("final.normQ8","uint32",[t.hiddenSize/4]),l=e2.scratch("final.normQ8Scale","float32",[1]);e2.op("com.xenova.LlamaDecodeFinalNormQuantizeQ8",{hiddenT:t.hidden,weightsT:t.weights,normQ8T:u,normScaleT:l},{args:{hiddenSize:t.hiddenSize,rmsEps:t.rmsEps,finalNormOffset:t.finalNormOffset}}),e2.op("com.xenova.LlamaDecodeLmHeadQ8ArgmaxTiled",{normQ8T:u,normScaleT:l,lmHeadQ8T:t.w("lmhead.q8bits",t.model.lmHeadQ8),lmHeadScalesT:t.w("lmhead.q8scales",t.model.lmHeadQ8Scales),bestValuesT:o,bestIdsT:i},{args:{vocabSize:t.vocabSize,hiddenSize:t.hiddenSize,numBlocks:a}})}else e2.op("com.xenova.LlamaDecodeFinalNormLmHeadArgmaxTiled",{hiddenT:t.hidden,weightsT:t.weights,bestValuesT:o,bestIdsT:i},{args:{hiddenSize:t.hiddenSize,vocabSize:t.vocabSize,rmsEps:t.rmsEps,finalNormOffset:t.finalNormOffset,lmHeadOffset:t.lmHeadOffset,numBlocks:a}});return e2.op("com.xenova.LlamaDecodeBestArgmax",{bestValuesT:o,bestIdsT:i,outputT:t.ids},{args:{outputOffset:0,workgroupSize:mw,inputCount:a}}),e2.nodeCount-n}function zo(e2,t,n){gw(e2);let r=e2.config,s=zt(r),a=qe(e2),o=r.hidden_size,i=r.num_hidden_layers,u=r.num_attention_heads,l=r.num_key_value_heads,c=r.head_dim,d=l*c,p=ct(r)?_e(r.conv_L_cache,"config.conv_L_cache"):0,f=r.intermediate_size,g=r.vocab_size,m=Number(r.rms_norm_eps),A=t.maxLength,w=bt(c),C=c===128?64:pd(r),G=hn(e2),L=e2.offsets.top,Z=e2.runtime.device.features.has("shader-f16"),O=Z&&(e2.weights.dtype==="float16"||a)?"float16":"float32",b=a&&Z?"float16":"float32",S=new mt,{w:y,state:I,boundWeights:H,states:W}=xt(S),x=y("weights",e2.weights),q=y("rope.cos",G.cos),R=y("rope.sin",G.sin),D=S.uniform("params",16),h=Pt(y,e2),_=Dt(y,e2),k=(M,K,J,ie)=>{let Y=`layers.${K}.${J}`;if(a){let ne=_(K,[J],`o.${J}`);return S.op("com.xenova.LlamaDecodeOProj",{hiddenT:M,q1BitsT:ne.bitsT,q1ScalesT:ne.scalesT,attnT:ie},{args:{hiddenSize:o,oOffset:ne.offset(Y)}}).hiddenT}if(Ee(e2,Y)){let ne=h(K,[J],`o.${J}`);return S.op("com.xenova.LlamaDecodeOProj",{hiddenT:M,q4BitsT:ne.bitsT,q4ScalesT:ne.scalesT,attnT:ie},{args:{hiddenSize:o,oOffset:ne.offset(Y),format:ne.format,lut:ne.lut}}).hiddenT}return S.op("com.xenova.LlamaDecodeOProj",{hiddenT:M,weightsT:x,attnT:ie},{args:{hiddenSize:o,oOffset:e2.offsets.layers[K][J]}}).hiddenT},v=Xr(r),V=(M,K)=>{if(!un(v,K))throw new Error(`moeMlpInto: layer ${K} is not a MoE layer`);let J=e2.offsets.layers[K],ie=S.scratch(`L${K}.moeProbs`,"float32",[v.numExperts]),Y=S.scratch(`L${K}.moeRouteIdx`,"uint32",[v.topK]),ne=S.scratch(`L${K}.moeRouteW`,"float32",[v.topK]);S.op("com.xenova.LlamaDecodeMoeRoute",{hiddenT:M,weightsT:x,probsT:ie},{args:{hiddenSize:o,numExperts:v.numExperts,rmsEps:m,normOffset:J.post_attention_layernorm,routerOffset:J.moe_router}});let ae={hasBias:v.useExpertBias?1:0,biasOffset:v.useExpertBias?J.moe_bias:0,normTopk:v.normTopkProb?1:0,routedScale:v.routedScale},Q=S.scratch(`L${K}.moeInter`,O,[v.topK*v.moeIntermediateSize]);if(Ee(e2,`layers.${K}.gate_exps`)){let U=h(K,["gate_exps","up_exps"],"moegateup");S.op("com.xenova.LlamaDecodeMoeGateUpNorm",{hiddenT:M,q4BitsT:U.bitsT,q4ScalesT:U.scalesT,probsT:ie,routeIdxT:Y,routeWT:ne,intermediateT:Q,weightsT:x,...U.gridT?{gridT:U.gridT}:{}},{args:{hiddenSize:o,moeIntermediateSize:v.moeIntermediateSize,numExperts:v.numExperts,topK:v.topK,rmsEps:m,normOffset:J.post_attention_layernorm,...ae,gateOffset:U.offset(`layers.${K}.gate_exps`),upOffset:U.offset(`layers.${K}.up_exps`),format:U.format,lut:U.lut,iqRaw:U.iqRaw}})}else S.op("com.xenova.LlamaDecodeMoeGateUpNorm",{hiddenT:M,weightsT:x,probsT:ie,routeIdxT:Y,routeWT:ne,intermediateT:Q},{args:{hiddenSize:o,moeIntermediateSize:v.moeIntermediateSize,numExperts:v.numExperts,topK:v.topK,rmsEps:m,normOffset:J.post_attention_layernorm,...ae,gateOffset:J.gate_exps,upOffset:J.up_exps}});if(Ee(e2,`layers.${K}.down_exps`)){let U=h(K,["down_exps"],"moedown");return S.op("com.xenova.LlamaDecodeMoeDownProj",{hiddenT:M,q4BitsT:U.bitsT,q4ScalesT:U.scalesT,intermediateT:Q,routeIdxT:Y,routeWT:ne,...U.gridT?{gridT:U.gridT}:{}},{args:{hiddenSize:o,moeIntermediateSize:v.moeIntermediateSize,numExperts:v.numExperts,topK:v.topK,downOffset:U.offset(`layers.${K}.down_exps`),format:U.format,lut:U.lut,iqRaw:U.iqRaw}}).hiddenT}return S.op("com.xenova.LlamaDecodeMoeDownProj",{hiddenT:M,weightsT:x,intermediateT:Q,routeIdxT:Y,routeWT:ne},{args:{hiddenSize:o,moeIntermediateSize:v.moeIntermediateSize,numExperts:v.numExperts,topK:v.topK,downOffset:J.down_exps}}).hiddenT},j=(M,K)=>{if(un(v,K))return V(M,K);let J=e2.offsets.layers[K],ie=S.scratch(`L${K}.intermediate`,O,[f]);if(a){let Y=_(K,["gate_proj","up_proj"],"gateup");S.op("com.xenova.LlamaDecodeGateUpNorm",{hiddenT:M,q1BitsT:Y.bitsT,q1ScalesT:Y.scalesT,intermediateT:ie,weightsT:x},{args:{hiddenSize:o,intermediateSize:f,rmsEps:m,normOffset:J.post_attention_layernorm,gateOffset:Y.offset(`layers.${K}.gate_proj`),upOffset:Y.offset(`layers.${K}.up_proj`)}});let ne=_(K,["down_proj"],"down");return S.op("com.xenova.LlamaDecodeDownProj",{hiddenT:M,q1BitsT:ne.bitsT,q1ScalesT:ne.scalesT,intermediateT:ie},{args:{hiddenSize:o,intermediateSize:f,downOffset:ne.offset(`layers.${K}.down_proj`)}}).hiddenT}if(Ee(e2,`layers.${K}.gate_proj`)){let Y=h(K,["gate_proj","up_proj"],"gateup");S.op("com.xenova.LlamaDecodeGateUpNorm",{hiddenT:M,q4BitsT:Y.bitsT,q4ScalesT:Y.scalesT,intermediateT:ie,weightsT:x},{args:{hiddenSize:o,intermediateSize:f,rmsEps:m,normOffset:J.post_attention_layernorm,gateOffset:Y.offset(`layers.${K}.gate_proj`),upOffset:Y.offset(`layers.${K}.up_proj`),format:Y.format,lut:Y.lut}})}else S.op("com.xenova.LlamaDecodeGateUpNorm",{hiddenT:M,weightsT:x,intermediateT:ie},{args:{hiddenSize:o,intermediateSize:f,rmsEps:m,normOffset:J.post_attention_layernorm,gateOffset:J.gate_proj,upOffset:J.up_proj}});if(Ee(e2,`layers.${K}.down_proj`)){let Y=h(K,["down_proj"],"down");return S.op("com.xenova.LlamaDecodeDownProj",{hiddenT:M,q4BitsT:Y.bitsT,q4ScalesT:Y.scalesT,intermediateT:ie},{args:{hiddenSize:o,intermediateSize:f,downOffset:Y.offset(`layers.${K}.down_proj`),format:Y.format,lut:Y.lut}}).hiddenT}return S.op("com.xenova.LlamaDecodeDownProj",{hiddenT:M,weightsT:x,intermediateT:ie},{args:{hiddenSize:o,intermediateSize:f,downOffset:J.down_proj}}).hiddenT},N=S.stepInput("input_ids","uint32",[1]),re;if(a){let M=Ut(e2,["embed_tokens"]);re=S.op("com.xenova.LlamaEmbed",{inputT:N,q1BitsT:y("embed.q1bits",M.q1BitsT),q1ScalesT:y("embed.q1scales",M.q1ScalesT),paramsT:D},{args:{hiddenSize:o,vocabSize:g,embedOffset:M.offset("embed_tokens"),tokenOffset:0}}).hiddenT}else e2.embedQ8&&e2.embedQ8Scales?re=S.op("com.xenova.LlamaEmbed",{inputT:N,embedQ8T:y("embed.q8bits",e2.embedQ8),embedQ8ScalesT:y("embed.q8scales",e2.embedQ8Scales),paramsT:D},{args:{hiddenSize:o,vocabSize:g,tokenOffset:0}}).hiddenT:re=S.op("com.xenova.LlamaEmbed",{inputT:N,weightsT:x,paramsT:D},{args:{hiddenSize:o,vocabSize:g,embedOffset:L.embed_tokens,tokenOffset:0}}).hiddenT;for(let M=0;M<i;++M){let K=e2.offsets.layers[M];if(An(r,M)==="conv"){if(!t.convStates)throw new Error("emitLlamaDecode: conv layer requires cache.convStates");let J=Te(t.convStates,M*o*p,o*p),ie=I(`conv.state.${M}`,J),Y=S.scratch(`L${M}.convY`,"float32",[o]);if(Ee(e2,`layers.${M}.conv_in_proj`)){let ne=S.scratch(`L${M}.convProj`,"float32",[3*o]),ae=h(M,["conv_in_proj"],"convin");S.op("com.xenova.LlamaDecodeConvInProjNormQ4",{hiddenT:re,q4BitsT:ae.bitsT,q4ScalesT:ae.scalesT,weightsT:x,convProjT:ne},{args:{hiddenSize:o,rmsEps:m,normOffset:K.input_layernorm,convInOffset:ae.offset(`layers.${M}.conv_in_proj`),format:ae.format,lut:ae.lut}}),S.op("com.xenova.LlamaDecodeConvDepthwise",{convProjT:ne,weightsT:x,convStatesT:ie,convYT:Y},{args:{layer:0,hiddenSize:o,convLCache:p,convWeightOffset:K.conv_weight}})}else{let ne=S.scratch(`L${M}.normed`,"float32",[o]);S.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:re,weightsT:x,normedT:ne},{args:{hiddenSize:o,rmsEps:m,normOffset:K.input_layernorm}}),S.op("com.xenova.LlamaDecodeConvInUpdate",{normedT:ne,weightsT:x,convStatesT:ie,convYT:Y},{args:{layer:0,hiddenSize:o,convLCache:p,convInOffset:K.conv_in_proj,convWeightOffset:K.conv_weight}})}re=k(re,M,"conv_out_proj",Y)}else{let J=Qt(e2,t,M),ie=I(`cache.key.${M}`,J.cacheKeysT),Y=I(`cache.value.${M}`,J.cacheValuesT),ne;if(a){let Q=S.scratch(`L${M}.qkv`,"float32",[o+2*d]),U=_(M,["q_proj","k_proj","v_proj"],"qkv");S.op("com.xenova.LlamaDecodeQkvNormQ1",{hiddenT:re,q1BitsT:U.bitsT,q1ScalesT:U.scalesT,qkvT:Q,weightsT:x},{args:{hiddenSize:o,numKvHeads:l,headDim:c,rmsEps:m,normOffset:K.input_layernorm,qOffset:U.offset(`layers.${M}.q_proj`),kOffset:U.offset(`layers.${M}.k_proj`),vOffset:U.offset(`layers.${M}.v_proj`)}}),ne=S.op("com.xenova.LlamaDecodeQkNormRopeCacheKvPacked",{qkvT:Q,weightsT:x,cacheKeysT:ie,cacheValuesT:Y,cosT:q,sinT:R,paramsT:D},{args:{layer:0,cacheLen:A,pastLen:n,hiddenSize:o,numHeads:u,numKvHeads:l,headDim:c,rmsEps:m,qNormOffset:K.q_layernorm,kNormOffset:K.k_layernorm}}).qkvT}else if(s){let Q=S.scratch(`L${M}.q`,"float32",[o]),U=S.scratch(`L${M}.k`,"float32",[d]),T=S.scratch(`L${M}.v`,"float32",[d]);if(Ee(e2,`layers.${M}.q_proj`)){let z=h(M,["q_proj","k_proj","v_proj"],"qkv");S.op("com.xenova.LlamaDecodeQkvNormQ4",{hiddenT:re,q4BitsT:z.bitsT,q4ScalesT:z.scalesT,weightsT:x,qT:Q,kT:U,vT:T},{args:{hiddenSize:o,numKvHeads:l,headDim:c,rmsEps:m,normOffset:K.input_layernorm,qOffset:z.offset(`layers.${M}.q_proj`),kOffset:z.offset(`layers.${M}.k_proj`),vOffset:z.offset(`layers.${M}.v_proj`),format:z.format,lut:z.lut}})}else{let z=S.scratch(`L${M}.normed`,"float32",[o]);S.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:re,weightsT:x,normedT:z},{args:{hiddenSize:o,rmsEps:m,normOffset:K.input_layernorm}}),S.op("com.xenova.LlamaDecodeQkv",{normedT:z,weightsT:x,qT:Q,kT:U,vT:T},{args:{hiddenSize:o,numKvHeads:l,headDim:c,qOffset:K.q_proj,kOffset:K.k_proj,vOffset:K.v_proj}})}ne=S.op("com.xenova.LlamaDecodeQkNormRopeCacheKv",{qT:Q,kT:U,vT:T,weightsT:x,cacheKeysT:ie,cacheValuesT:Y,cosT:q,sinT:R,paramsT:D},{args:{layer:0,cacheLen:A,pastLen:n,numHeads:u,numKvHeads:l,headDim:c,rmsEps:m,qNormOffset:K.q_layernorm,kNormOffset:K.k_layernorm}}).qT}else{let Q=S.scratch(`L${M}.q`,"float32",[o]);ne=S.op("com.xenova.LlamaDecodeQkvRopeCacheNorm",{hiddenT:re,weightsT:x,qT:Q,cacheKeysT:ie,cacheValuesT:Y,cosT:q,sinT:R,paramsT:D},{args:{layer:0,cacheLen:A,pastLen:n,hiddenSize:o,rmsEps:m,normOffset:K.input_layernorm,numHeads:u,numKvHeads:l,headDim:c,qOffset:K.q_proj,kOffset:K.k_proj,vOffset:K.v_proj}}).qT}let ae;if(dd(r)){let Q=S.op("com.xenova.LlamaDecodeAttentionSplitK",{qT:ne,cacheKeysT:ie,cacheValuesT:Y,paramsT:D},{args:{layer:0,cacheLen:A,pastLen:n,numHeads:u,numKvHeads:l,headDim:c,scale:w,workgroupSize:C,tileSize:16,numKvChunks:Lo,minKeysPerChunk:ld}});ae=S.op("com.xenova.LlamaDecodeAttentionSplitKMerge",{partialOutT:Q.partialOutT,partialMetaT:Q.partialMetaT},{args:{numHeads:u,headDim:c,numKvChunks:Lo}}).attnT}else{let Q=S.scratch(`L${M}.attn`,"float32",[u*c]);ae=S.op("com.xenova.LlamaDecodeAttention",{qT:ne,cacheKeysT:ie,cacheValuesT:Y,attnT:Q,paramsT:D},{args:{layer:0,cacheLen:A,pastLen:n,numHeads:u,numKvHeads:l,headDim:c,scale:w,workgroupSize:Vn(r)}}).attnT}re=k(re,M,"o_proj",ae)}re=j(re,M)}let ke=Jn(S,{w:y,model:e2,hidden:re,weights:x,ids:N,hiddenSize:o,vocabSize:g,rmsEps:m,finalNormOffset:L.model_norm,lmHeadOffset:L.lm_head,q1:a,normedDtype:b});return{graph:S.finish({name:"llama-decode",params:{positionOffset:n}}),weights:H,states:W,paramsName:"params",nextTokenTailNodeCount:ke}}var fw,mw,bt,Aw,hw,Xn,Is,er=P(()=>{"use strict";Yn();md();Oo();_n();Gt();dt();fw=256,mw=256;bt=e2=>Number(Math.pow(e2,-.5).toPrecision(9));Aw={id:"rms-qkv",producer:"com.xenova.LlamaDecodeRmsNorm",producerOutput:"normedT",consumer:"com.xenova.LlamaDecodeQkv",consumerInput:"normedT",fuse:(e2,t)=>{let n=e2.args??{},r=t.args??{};return{op:"com.xenova.LlamaDecodeQkvNorm",inputs:{hiddenT:e2.inputs.hiddenT,weightsT:e2.inputs.weightsT},outputs:{...t.outputs},args:{hiddenSize:n.hiddenSize,numKvHeads:r.numKvHeads,headDim:r.headDim,rmsEps:n.rmsEps,normOffset:n.normOffset,qOffset:r.qOffset,kOffset:r.kOffset,vOffset:r.vOffset}}}},hw=[Aw],Xn=class extends Cs{writeStepUniforms(t){let n=this.stepUniformPack(this.emission.paramsName)({past_len:t,cache_len:this.cache.maxLength,token_offset:0});this.runtime.host.writeBuffer(this.compiled.uniformBuffer(this.emission.paramsName),0,n)}},Is=class extends Xn{buildGraph(t,n){let r=zo(this.model,this.cache,t);return{emission:r,graph:n?fd(r.graph,hw):r.graph}}}});function Ho(e2){let t=e2.config;return!(qe(e2)||Ue(t))}function _w({packedQ1:e2,activationDtype:t,rows:n,inFeatures:r,intermediateSize:s}){return e2&&t==="float16"&&r%128===0&&s%64===0&&s>=r&&(n>=64||n===16&&2*s>=3*r)}function Uo({g:e2,model:t,weights:n,q4w:r,q1w:s,q1RealLenT:a,T:o,H:i,inter:u,eps:l,actGemm:c,fusedQ4:d,q1Activation:p}){let f=qe(t),g=(y,I,H,W,x,q,R)=>e2.op("com.xenova.LlamaPrefillDequant",{q1BitsT:H.bitsT,q1ScalesT:H.scalesT,denseT:y},{args:{denseElems:I,blockOffset:W,outRows:x,inFeatures:q,dstElemOffset:R}}).denseT,m=(y,I,H,W,x,q,R,D)=>e2.op("com.xenova.LlamaPrefillMatmulQ1",{aT:y,q1BitsT:I.bitsT,q1ScalesT:I.scalesT,yT:q,...a&&W%64===0?{realLenT:a}:{}},{args:{M:o,inFeatures:x,outFeatures:W,blockOffset:H,outStride:R,dstColStart:D}}).yT,A=(y,I)=>y%4===0&&I%128===0&&o<=65535,w=(y,I,H,W,x,q,R,D)=>e2.op("com.xenova.LlamaPrefillMatmulQ4",{aT:y,q4BitsT:I.bitsT,q4ScalesT:I.scalesT,yT:q},{args:{M:o,inFeatures:x,outFeatures:W,blockOffset:H,outStride:R,dstColStart:D,format:I.format,lut:I.lut}}).yT,C=(y,I,H)=>d&&!y.iqRaw&&I%64===0&&H%32===0,G=(y,I,H,W,x,q,R)=>e2.op("com.xenova.LlamaPrefillDequant",{q4BitsT:H.bitsT,q4ScalesT:H.scalesT,denseT:y},{args:{denseElems:I,blockOffset:W,outRows:x,inFeatures:q,dstElemOffset:R,format:H.format,lut:H.lut}}).denseT,L=(y,I,H,W,x,q,R)=>{let D=e2.scratch(R,c,[o,x]);if(f){let h=s(y,[H],H),_=h.offset(`layers.${y}.${H}`);if(A(x,q))return m(I,h,_,x,q,D,x,0);let k=x*q,v=g(e2.scratch(`${R}.w`,c,[k]),k,h,_,x,q,0);return e2.op("com.xenova.LlamaPrefillMatmul",{aT:I,weightsT:v,yT:D},{args:{weightOffset:0,M:o,inFeatures:q,outFeatures:x}}).yT}if(Ee(t,`layers.${y}.${H}`)){let h=r(y,[H],H);if(C(h,x,q))return w(I,h,h.offset(`layers.${y}.${H}`),x,q,D,x,0);let _=x*q,k=G(e2.scratch(`${R}.w`,c,[_]),_,h,h.offset(`layers.${y}.${H}`),x,q,0);return e2.op("com.xenova.LlamaPrefillMatmul",{aT:I,weightsT:k,yT:D},{args:{weightOffset:0,M:o,inFeatures:q,outFeatures:x}}).yT}return e2.op("com.xenova.LlamaPrefillMatmul",{aT:I,weightsT:n,yT:D},{args:{weightOffset:W,M:o,inFeatures:q,outFeatures:x}}).yT},Z=(y,I,H,W)=>{let x=e2.scratch(W,c,[o,2*u]);if(f){let q=s(y,["gate_proj","up_proj"],"gateup");if(A(u,i)){let h=m(I,q,q.offset(`layers.${y}.gate_proj`),u,i,x,2*u,0);return m(I,q,q.offset(`layers.${y}.up_proj`),u,i,h,2*u,u)}let R=2*u*i,D=e2.scratch(`${W}.w`,c,[R]);return D=g(D,R,q,q.offset(`layers.${y}.gate_proj`),u,i,0),D=g(D,R,q,q.offset(`layers.${y}.up_proj`),u,i,u*i),e2.op("com.xenova.LlamaPrefillMatmul",{aT:I,weightsT:D,yT:x},{args:{weightOffset:0,M:o,inFeatures:i,outFeatures:2*u}}).yT}if(Ee(t,`layers.${y}.gate_proj`)){let q=r(y,["gate_proj","up_proj"],"gateup");if(C(q,u,i)){let h=w(I,q,q.offset(`layers.${y}.gate_proj`),u,i,x,2*u,0);return w(I,q,q.offset(`layers.${y}.up_proj`),u,i,h,2*u,u)}let R=2*u*i,D=e2.scratch(`${W}.w`,c,[R]);return D=G(D,R,q,q.offset(`layers.${y}.gate_proj`),u,i,0),D=G(D,R,q,q.offset(`layers.${y}.up_proj`),u,i,u*i),e2.op("com.xenova.LlamaPrefillMatmul",{aT:I,weightsT:D,yT:x},{args:{weightOffset:0,M:o,inFeatures:i,outFeatures:2*u}}).yT}return e2.op("com.xenova.LlamaPrefillMatmul",{aT:I,weightsT:n,yT:x},{args:{weightOffset:H,M:o,inFeatures:i,outFeatures:2*u}}).yT},O=Xr(t.config),b=(y,I,H)=>{if(!un(O,y))throw new Error(`moeMlpInto: layer ${y} is not a MoE layer`);let W=e2.op("com.xenova.LlamaPrefillRmsNorm",{xT:H,weightsT:n,yT:e2.scratch(`L${y}.ffnorm`,c,[o,i])},{args:{normOffset:I.post_attention_layernorm,rows:o,dim:i,eps:l}}).yT,x=e2.scratch(`L${y}.moeRouteIdx`,"uint32",[o*O.topK]),q=e2.scratch(`L${y}.moeRouteW`,"float32",[o*O.topK]);e2.op("com.xenova.LlamaPrefillMoeRoute",{normedT:W,weightsT:n,routeIdxT:x,routeWT:q},{args:{hiddenSize:i,seqLen:o,numExperts:O.numExperts,topK:O.topK,routerOffset:I.moe_router,hasBias:O.useExpertBias?1:0,biasOffset:O.useExpertBias?I.moe_bias:0,normTopk:O.normTopkProb?1:0,routedScale:O.routedScale}});let R=O.moeIntermediateSize,D=e2.scratch(`L${y}.moeInter`,c,[o,O.topK*R]),h=Ee(t,`layers.${y}.gate_exps`),_=Ee(t,`layers.${y}.down_exps`),k=o*O.topK,v=null;if(h||_){let j=Math.ceil(k/16)+O.numExperts;v={list:e2.scratch(`L${y}.moeSlotList`,"uint32",[k]),tiles:e2.scratch(`L${y}.moeTiles`,"uint32",[j*3]),tileCount:e2.scratch(`L${y}.moeTileCount`,"uint32",[1])},e2.op("com.xenova.LlamaPrefillMoeGroup",{routeIdxT:x,listT:v.list,tilesT:v.tiles,tileCountT:v.tileCount},{args:{seqLen:o,numExperts:O.numExperts,topK:O.topK}})}if(h&&v){let j=r(y,["gate_exps","up_exps"],"moegateup");e2.op("com.xenova.LlamaPrefillMoeGateUpGrouped",{normedT:W,q4BitsT:j.bitsT,q4ScalesT:j.scalesT,listT:v.list,tilesT:v.tiles,tileCountT:v.tileCount,intermediateT:D,...j.gridT?{gridT:j.gridT}:{}},{args:{hiddenSize:i,moeIntermediateSize:R,seqLen:o,numExperts:O.numExperts,topK:O.topK,gateOffset:j.offset(`layers.${y}.gate_exps`),upOffset:j.offset(`layers.${y}.up_exps`),format:j.format,lut:j.lut,iqRaw:j.iqRaw}})}else e2.op("com.xenova.LlamaPrefillMoeGateUp",{normedT:W,weightsT:n,routeIdxT:x,intermediateT:D},{args:{hiddenSize:i,moeIntermediateSize:R,seqLen:o,numExperts:O.numExperts,topK:O.topK,gateOffset:I.gate_exps,upOffset:I.up_exps}});let V=e2.scratch(`L${y}.moedown`,c,[o,i]);if(_&&v){let j=r(y,["down_exps"],"moedown"),N=e2.scratch(`L${y}.moeSlotY`,"float32",[k*i]);e2.op("com.xenova.LlamaPrefillMoeDownGrouped",{intermediateT:D,q4BitsT:j.bitsT,q4ScalesT:j.scalesT,listT:v.list,tilesT:v.tiles,tileCountT:v.tileCount,routeWT:q,slotYT:N,...j.gridT?{gridT:j.gridT}:{}},{args:{hiddenSize:i,moeIntermediateSize:R,seqLen:o,numExperts:O.numExperts,topK:O.topK,downOffset:j.offset(`layers.${y}.down_exps`),format:j.format,lut:j.lut,iqRaw:j.iqRaw}}),e2.op("com.xenova.LlamaPrefillMoeDownReduce",{slotYT:N,yT:V},{args:{hiddenSize:i,seqLen:o,topK:O.topK}})}else e2.op("com.xenova.LlamaPrefillMoeDown",{intermediateT:D,weightsT:n,routeIdxT:x,routeWT:q,yT:V},{args:{hiddenSize:i,moeIntermediateSize:R,seqLen:o,numExperts:O.numExperts,topK:O.topK,downOffset:I.down_exps}});e2.op("com.xenova.AddInPlace",{yT:H,xT:V},{args:{count:o*i}})};return{dequant:G,fused:w,canFuse:C,proj:L,gateUp:Z,mlpInto:(y,I,H)=>{if(un(O,y)){b(y,I,H);return}let W=e2.op("com.xenova.LlamaPrefillRmsNorm",{xT:H,weightsT:n,yT:e2.scratch(`L${y}.ffnorm`,c,[o,i])},{args:{normOffset:I.post_attention_layernorm,rows:o,dim:i,eps:l}}).yT,x=e2.scratch(`L${y}.mlpact`,c,[o,u]),q;if(_w({packedQ1:f,activationDtype:c,rows:o,inFeatures:i,intermediateSize:u})){let D=s(y,["gate_proj","up_proj"],"gateup");q=e2.op("com.xenova.LlamaPrefillGateUpQ1",{aT:W,q1BitsT:D.bitsT,q1ScalesT:D.scalesT,yT:x,...a?{realLenT:a}:{}},{args:{M:o,inFeatures:i,intermediateSize:u,gateOffset:D.offset(`layers.${y}.gate_proj`),upOffset:D.offset(`layers.${y}.up_proj`),...p?{activation:p}:{}}}).yT}else{let D=Z(y,W,I.gate_proj,`L${y}.gateup`);q=e2.op("com.xenova.SwiGlu",{xT:D,yT:x},{args:{rows:o,mlpInner:u,...p?{activation:p}:{}}}).yT}let R=L(y,q,"down_proj",I.down_proj,i,u,`L${y}.down`);e2.op("com.xenova.AddInPlace",{yT:H,xT:R},{args:{count:o*i}})}}}function Fo(e2){let{g:t,w:n,weights:r,model:s,ids:a,act:o,H:i,vocab:u,T:l,embedOffset:c}=e2;if(qe(s)){let d=Ut(s,["embed_tokens"]);return t.op("com.xenova.LlamaPrefillEmbed",{tokensT:a,q1BitsT:n("embed.q1bits",d.q1BitsT),q1ScalesT:n("embed.q1scales",d.q1ScalesT),hiddenT:t.scratch("embed.hidden",o,[l,i])},{args:{hiddenSize:i,vocabSize:u,seqLen:l,embedOffset:d.offset("embed_tokens")}}).hiddenT}return s.embedQ8&&s.embedQ8Scales?t.op("com.xenova.LlamaPrefillEmbed",{tokensT:a,embedQ8T:n("embed.q8bits",s.embedQ8),embedQ8ScalesT:n("embed.q8scales",s.embedQ8Scales),hiddenT:t.scratch("embed.hidden",o,[l,i])},{args:{hiddenSize:i,vocabSize:u,seqLen:l}}).hiddenT:t.op("com.xenova.LlamaPrefillEmbed",{tokensT:a,weightsT:r,hiddenT:t.scratch("embed.hidden",o,[l,i])},{args:{embedOffset:c,hiddenSize:i,seqLen:l}}).hiddenT}function Zo(e2){let{g:t,w:n,weights:r,model:s,hidden:a,act:o,H:i,vocab:u,T:l,eps:c,finalNormOffset:d,lmHeadOffset:p}=e2,f=t.scratch("last_row",o,[i]),g=t.uniform("last_row_uni",32);t.op("com.xenova.StridedCopy",{srcT:a,dstT:f,p:g},{args:{rows:1,srcStride:i,srcStart:(l-1)*i,dstStride:i,dstStart:0,copyCols:i}});let m=t.scratch("next_token","uint32",[1]),A=qe(s),w=s.runtime.device.features.has("shader-f16");return Jn(t,{w:n,model:s,hidden:f,weights:r,ids:m,hiddenSize:i,vocabSize:u,rmsEps:c,finalNormOffset:d,lmHeadOffset:p,q1:A,normedDtype:A&&w?"float16":"float32"}),t.output(m,"next_token"),g.name}function ww(e2,t,n){if(!Ho(e2))throw new Error("emitLlamaPrefill: only full-causal attention models (plain or dense qk-norm; dense or Q8/Q4/Q4_K/IQ packed o_proj+MLP) are supported");let r=e2.config,s=zt(r),a=ct(r),o=a?_e(r.conv_L_cache,"config.conv_L_cache"):0,i=n,u=r.hidden_size,l=r.num_hidden_layers,c=r.num_attention_heads,d=r.num_key_value_heads,p=r.head_dim,f=c*p,g=d*p,m=f+2*g,A=r.intermediate_size,w=r.vocab_size,C=Number(r.rms_norm_eps),G=t.maxLength,L=bt(p),Z=64,O="float32",b=e2.runtime.device.features.has("shader-f16"),S=b&&e2.weights.dtype==="float16"?"float16":"float32",y=b&&e2.runtime.device.features.has("subgroups")&&e2.runtime.device.features.has("chromium-experimental-subgroup-matrix"),I=hn(e2),H=e2.offsets.top,W=new mt,{w:x,state:q,boundWeights:R,states:D}=xt(W),h=x("weights",e2.weights),_=x("rope.cos",I.cos),k=x("rope.sin",I.sin),v=W.uniform("params",16),V=Pt(x,e2),j=Dt(x,e2),{dequant:N,fused:re,canFuse:ke,proj:M,mlpInto:K}=Uo({g:W,model:e2,weights:h,q4w:V,q1w:j,T:i,H:u,inter:A,eps:C,actGemm:S,fusedQ4:y}),J=(Q,U,T)=>{let z=W.scratch(`L${Q}.qkv`,S,[i,m]);if(Ee(e2,`layers.${Q}.q_proj`)){let te=V(Q,["q_proj","k_proj","v_proj"],"qkv");if(ke(te,f,u)&&g%64===0){let se=re(T,te,te.offset(`layers.${Q}.q_proj`),f,u,z,m,0);return se=re(T,te,te.offset(`layers.${Q}.k_proj`),g,u,se,m,f),re(T,te,te.offset(`layers.${Q}.v_proj`),g,u,se,m,f+g)}let pe=m*u,le=W.scratch(`L${Q}.qkvDense`,S,[pe]);return le=N(le,pe,te,te.offset(`layers.${Q}.q_proj`),f,u,0),le=N(le,pe,te,te.offset(`layers.${Q}.k_proj`),g,u,f*u),le=N(le,pe,te,te.offset(`layers.${Q}.v_proj`),g,u,(f+g)*u),W.op("com.xenova.LlamaPrefillMatmul",{aT:T,weightsT:le,yT:z},{args:{weightOffset:0,M:i,inFeatures:u,outFeatures:m}}).yT}return W.op("com.xenova.LlamaPrefillMatmul",{aT:T,weightsT:h,yT:z},{args:{weightOffset:U.q_proj,M:i,inFeatures:u,outFeatures:m}}).yT},ie=W.stepInput("input_ids","uint32",[i]),Y=Fo({g:W,w:x,weights:h,model:e2,ids:ie,act:O,H:u,vocab:w,T:i,embedOffset:H.embed_tokens});for(let Q=0;Q<l;++Q){let U=e2.offsets.layers[Q];if(a&&An(r,Q)==="conv"){if(!t.convStates)throw new Error("emitLlamaPrefill: conv layer requires cache.convStates");let T=Te(t.convStates,Q*u*o,u*o),z=q(`conv.state.${Q}`,T),te=W.op("com.xenova.LlamaPrefillRmsNorm",{xT:Y,weightsT:h,yT:W.scratch(`L${Q}.convnorm`,S,[i,u])},{args:{normOffset:U.input_layernorm,rows:i,dim:u,eps:C}}).yT,pe=M(Q,te,"conv_in_proj",U.conv_in_proj,3*u,u,`L${Q}.bcx`),le=W.op("com.xenova.LlamaPrefillConv",{bcxT:pe,weightsT:h,convStatesT:z,convYT:W.scratch(`L${Q}.convY`,S,[i,u]),params:v},{args:{hiddenSize:u,convLCache:o,convWeightOffset:U.conv_weight,seqLen:i}}).convYT,se=M(Q,le,"conv_out_proj",U.conv_out_proj,u,u,`L${Q}.convout`);W.op("com.xenova.AddInPlace",{yT:Y,xT:se},{args:{count:i*u}})}else{let T=Qt(e2,t,Q),z=q(`cache.key.${Q}`,T.cacheKeysT),te=q(`cache.value.${Q}`,T.cacheValuesT),pe=W.op("com.xenova.LlamaPrefillRmsNorm",{xT:Y,weightsT:h,yT:W.scratch(`L${Q}.normed`,S,[i,u])},{args:{normOffset:U.input_layernorm,rows:i,dim:u,eps:C}}).yT,le=J(Q,U,pe);s&&(le=W.op("com.xenova.LlamaPrefillQkNorm",{qkvT:le,weightsT:h},{args:{qNormOffset:U.q_layernorm,kNormOffset:U.k_layernorm,numHeads:c,numKvHeads:d,headDim:p,seqLen:i,qkvStride:m,rmsEps:C}}).qkvT),W.op("com.xenova.LlamaPrefillRopeCacheKv",{qkvT:le,cacheKeysT:z,cacheValuesT:te,cosT:_,sinT:k,params:v},{args:{layer:0,cacheLen:G,pastLen:0,seqLen:i,numHeads:c,numKvHeads:d,headDim:p}});let se=W.op("com.xenova.LlamaPrefillAttention",{qkvT:le,cacheKeysT:z,cacheValuesT:te,attnT:W.scratch(`L${Q}.attn`,S,[i,f]),params:v},{args:{layer:0,cacheLen:G,pastLen:0,seqLen:i,numHeads:c,numKvHeads:d,headDim:p,scale:L,workgroupSize:Z}}).attnT,de=M(Q,se,"o_proj",U.o_proj,u,f,`L${Q}.oproj`);W.op("com.xenova.AddInPlace",{yT:Y,xT:de},{args:{count:i*u}})}K(Q,U,Y)}let ne=W.nodeCount,ae=Zo({g:W,w:x,weights:h,model:e2,hidden:Y,act:O,H:u,vocab:w,T:i,eps:C,finalNormOffset:H.model_norm,lmHeadOffset:H.lm_head});return{graph:W.finish({name:"llama-prefill",params:{T:i}}),weights:R,states:D,paramsName:"params",lastRowUniform:ae,nextTokenTailNodeCount:W.nodeCount-ne}}var tr,Ts,$o=P(()=>{"use strict";Yn();_n();Gt();dt();er();Oo();tr=class extends Ss{writeRunInputs(t,n){let r=this.runtime.host,s=this.model.config.hidden_size,a=this.stepUniformPack(this.emission.paramsName);r.writeBuffer(this.compiled.uniformBuffer(this.emission.paramsName),0,a({past_len:n,cache_len:this.cache.maxLength,seq_len:this.blockLen,...a.fields.has("real_len")?{real_len:t}:{}})),r.writeBuffer(this.compiled.uniformBuffer(this.emission.lastRowUniform),0,this.stepUniformPack(this.emission.lastRowUniform)({rows:1,copyCols:s,srcStride:s,srcStart:(t-1)*s,dstStride:s,dstStart:0})),this.emission.q1RealLenInput&&r.writeBuffer(this.compiled.tensor(this.emission.q1RealLenInput).buffer,0,new Uint32Array([t]))}},Ts=class extends tr{buildEmission(){return ww(this.model,this.cache,this.blockLen)}}});function jo(e2,t,n){if(tt(t)){if(t.runtime!==e2.runtime)throw new Error(`${n} tensor does not belong to this runtime`);if(t.dtype!=="uint32")throw new Error(`${n} tensor must have dtype uint32`);return t}let{shape:r,data:s}=Es(t,n);return e2.runtime.tensorFromTypedArray("uint32",r,s)}function yd(e2,t,n,r){let s=`${t}x${n}x${r}`,a=e2.defaultPositionIdsCache.get(s);if(a)return a;let o=new Uint32Array(t*n);for(let u=0;u<t;++u)for(let l=0;l<n;++l)o[u*n+l]=r+l;let i=e2.runtime.tensorFromTypedArray("uint32",[t,n],o);return e2.defaultPositionIdsCache.set(s,i),i}function bd(e2,t){let n=e2.config,r=4*n.max_position_embeddings*n.hidden_size+n.max_position_embeddings*n.num_attention_heads*n.head_dim+2*n.max_position_embeddings*n.num_key_value_heads*n.head_dim+2*n.intermediate_size;if(t<1)throw new Error("batch size must be positive");if(r>8192)throw new Error(`Llama megakernel V1 shape is too large for the tiny sequential kernel scratch budget: ${r} elements`)}function Es(e2,t){if(e2 instanceof Uint32Array)return{shape:[1,e2.length],data:e2};if(!Array.isArray(e2))throw new Error(`${t} must be a uint32 tensor, Uint32Array, or array`);let n=No(e2,t);if(n.length===1&&n.unshift(1),n.length!==2)throw new Error(`${t} must be rank 1 or rank 2`);let r=new Uint32Array(ye(n)),s=0,a=o=>{if(Array.isArray(o)){for(let i of o)a(i);return}if(typeof o!="number"||!Number.isInteger(o)||o<0)throw new Error("token ids must be non-negative integers");r[s++]=o};return a(e2),{shape:n,data:r}}function No(e2,t){if(!Array.isArray(e2))return[];let n=e2.length;if(n===0)throw new Error(`${t} arrays must not be empty`);let r=Array.isArray(e2[0])?No(e2[0],t):[];for(let s=1;s<e2.length;++s){let a=Array.isArray(e2[s])?No(e2[s],t):[];if(a.length!==r.length||a.some((o,i)=>o!==r[i]))throw new Error(`${t} must be a rectangular array`)}return[n,...r]}var Vo=P(()=>{"use strict";Le()});function Yo(e2,t){if(typeof e2!="number"||!Number.isInteger(e2)||e2<0)throw new Error(`${t} requires a non-negative integer max_new_tokens`)}function Xo(e2,t){if(e2)throw new Error(`${t} V1 only supports greedy decoding`)}function Gs(e2,t,n,r){if(!(e2 instanceof rt))throw new Error("past_key_values must be a LlamaDynamicCache");if(e2.runtime!==t)throw new Error("past_key_values does not belong to this runtime");if(e2.batchSize!==r)throw new Error(`past_key_values batch size ${e2.batchSize} does not match input batch size ${r}`);let s=[n.num_hidden_layers,r,e2.maxLength,n.num_key_value_heads,n.head_dim];if(nr(e2.keyStates,s,"past_key_values.keyStates"),nr(e2.valueStates,s,"past_key_values.valueStates"),ct(n)&&nr(e2.convStates,[n.num_hidden_layers*r*n.hidden_size*_e(n.conv_L_cache,"config.conv_L_cache")],"past_key_values.convStates"),Ue(n)){if(!Array.isArray(e2.linearConvStates)||!Array.isArray(e2.linearRecurrentStates))throw new Error("past_key_values linear attention states are required");let a=Yr(n);for(let o=0;o<n.num_hidden_layers;++o)a[o]==="linear_attention"&&(nr(e2.linearConvStates[o],[r,_e(n.linear_conv_dim,"config.linear_conv_dim"),_e(n.linear_conv_kernel_dim,"config.linear_conv_kernel_dim")-1],`past_key_values.linearConvStates[${o}]`),nr(e2.linearRecurrentStates[o],[r,_e(n.linear_num_value_heads,"config.linear_num_value_heads"),_e(n.linear_key_head_dim,"config.linear_key_head_dim"),_e(n.linear_value_head_dim,"config.linear_value_head_dim")],`past_key_values.linearRecurrentStates[${o}]`))}}function nr(e2,t,n){if(!tt(e2)||e2.dtype!=="float32"&&e2.dtype!=="float16")throw new Error(`${n} must be a float32 or float16 WebGpuTensor`);if(e2.shape.length!==t.length||e2.shape.some((r,s)=>r!==t[s]))throw new Error(`${n} shape [${e2.shape}] does not match expected [${t}]`)}function Jo(e2,t,n){let r=0,s=e2[t];for(let a=1;a<n;++a){let o=e2[t+a];o>s&&(s=o,r=a)}return r}var ei=P(()=>{"use strict";mn();dt();Le()});function yw(){return kd??=ya({op:ut("com.xenova.llama.ForwardMegakernel"),toRequest:e2=>{let{inputIdsT:t,positionIdsT:n,weightsT:r,logitsT:s,cacheKeysT:a,cacheValuesT:o,...i}=e2;return{resources:{inputIdsT:t,positionIdsT:n,weightsT:r,logitsT:s,cacheKeysT:a,cacheValuesT:o},args:i}}}),kd}async function vd(e2,t={}){let{input_ids:n,attention_mask:r=null,position_ids:s=null,past_key_values:a=null,inputs_embeds:o=null,labels:i=null,use_cache:u=false,logits_to_keep:l=0}=t;if(r!==null)throw new Error("LlamaForCausalLM V1 does not support attention_mask");if(o!==null)throw new Error("LlamaForCausalLM V1 does not support inputs_embeds");if(i!==null)throw new Error("LlamaForCausalLM V1 does not support labels/loss");if(n==null)throw new Error("LlamaForCausalLM.forward requires input_ids");let c=jo(e2,n,"input_ids");if(c.shape.length!==2)throw new Error("LlamaForCausalLM.forward expects input_ids shape [batch, sequence]");let[d,p]=c.shape;if(p>e2.config.max_position_embeddings)throw new Error(`sequence length ${p} exceeds max_position_embeddings ${e2.config.max_position_embeddings}`);if(!Number.isInteger(l)||l<0||l>p)throw new Error("logits_to_keep must be an integer in [0, sequence length]");bd(e2,d);let f=l===0?p:l,g=u||a!==null,m=a??rt.allocate(e2.runtime,e2.config,d,e2.config.max_position_embeddings,e2.cacheDtype);Gs(m,e2.runtime,e2.config,d);let A=m.get_seq_length();if(A+p>m.maxLength)throw new Error(`past length ${A} + sequence length ${p} exceeds cache maxLength ${m.maxLength}`);let w=s===null?yd(e2,d,p,A):jo(e2,s,"position_ids");if(w.shape.length!==2||w.shape[0]!==d||w.shape[1]!==p)throw new Error("position_ids must have the same [batch, sequence] shape as input_ids");let C=e2.runtime.empty("float32",[d,f,e2.config.vocab_size],"llama-logits");return await yw().run(e2.runtime,{inputIdsT:c,positionIdsT:w,weightsT:e2.weights,logitsT:C,cacheKeysT:m.keyStates,cacheValuesT:m.valueStates,batchSize:d,seqLen:p,pastLen:A,logitsLen:f,...cd({config:e2.config,offsets:e2.offsets})},{runOptions:{namespace:"com.xenova.llama.ForwardMegakernel",label:"llama_for_causal_lm_megakernel"}}),m.advance(p),{loss:null,logits:C,past_key_values:g?m:null,hidden_states:void 0,attentions:void 0}}var kd,Cd=P(()=>{"use strict";_t();mn();Gt();Vo();ei();kd=null});function xs(e2,t={}){return{maxNewTokens:Number(e2.max_new_tokens??0),eosTokenId:e2.eos_token_id??t.eosTokenId??null,stopOnEos:e2.stop_on_eos!==false,onPrefillDone:e2.on_prefill_done??null}}function Qs(e2,t){return t==null?false:Array.isArray(t)?t.includes(e2):e2===t}var ti=P(()=>{"use strict"});async function*bw(e2){let t=[];for(;t.length<e2.depth&&e2.shouldSubmit();)t.push(await e2.submit());try{for(;t.length>0;){let n=t.shift();e2.shouldSubmit()&&t.length<e2.depth&&t.push(await e2.submit());let r=await n.result;if(yield*e2.accept(n,r))return}}finally{for(let n of t)try{await n.result}catch{}}}function vw(e2){return Math.max(e2,Math.min(Ft,e2*kw))}function rr(e2,t,n=t){let r=e2.decode_pipeline_depth;return typeof r!="number"||!Number.isFinite(r)||t<=1?t:Math.max(1,Math.min(Math.floor(r),n))}async function ni(e2,t,n){for(let r of n){for await(let s of e2.streamTokenIdsFromCache({input_ids:[new Array(r).fill(0)],generation_state:{cache:t},max_new_tokens:2,stop_on_eos:false}));t.truncate(0)}}async function*Sd(e2,t,n){if(t.length===0)throw new Error("generation requires at least one input token");let{maxNewTokens:r,eosTokenId:s,stopOnEos:a,onPrefillDone:o}=xs(n,e2.eosTokenId!==void 0?{eosTokenId:e2.eosTokenId}:{}),i=e2.cache,u=A=>a&&Qs(A,s),l=i.get_seq_length(),c=await e2.prefill(t,l);if(i.advance(t.length),o?.({tokens:t.length,cache_length:i.get_seq_length()}),r<=0||u(c))return;yield c;let d=1;if(d>=r)return;let p={value:null},f=async A=>p.value??=await e2.beginDecode(A,r-d),g=async function*(A){return i.advance(1),u(A)?true:(yield A,d+=1,d>=r)},m=i.get_seq_length();try{if(e2.pipelineDepth>1){let C=await i.mutableStateCheckpoint?.()??null;if(C){let b=await f(m),S=vw(e2.pipelineDepth),y=c,I=m;for(;d<r&&I<i.maxLength;){let H=Math.min(S,r-d,i.maxLength-I),W=I,x=[y],q=[],R=[],D=0,h=0,_=false,k=()=>{let v={result:b.submitStep(D===0?y:null,W+D)};return D+=1,q.push(v),v};C.capture();try{for(;R.length<e2.pipelineDepth&&D<H;)R.push(k());for(;R.length>0;){let v=R.shift();D<H&&R.length<e2.pipelineDepth&&R.push(k());let V=await v.result;if(i.advance(1),h+=1,u(V)){_=true;break}yield V,d+=1,y=V,x.push(V)}}finally{if(await Promise.allSettled(q.map(({result:v})=>v)),h<D){C.restore();let v=x.slice(0,h);if(b.replayKnownInputs)await b.replayKnownInputs(v,W);else for(let V=0;V<v.length;++V)await b.step(v[V],W+V)}}if(_)return;I=i.get_seq_length()}return}let G=r-d,L=m,Z=0,O=true;yield*bw({depth:e2.pipelineDepth,shouldSubmit:()=>Z<G&&L<i.maxLength,submit:async()=>{let S=(await f(L)).submitStep(O?c:null,L);return L+=1,Z+=1,O=false,{result:S}},accept:(b,S)=>g(S)});return}let A=c,w=m;for(;d<r&&w<i.maxLength;){let G=await(await f(w)).step(A,w);if(yield*g(G))break;A=G,w=i.get_seq_length()}}finally{p.value?.finish()}}var Ft,kw,ri=P(()=>{"use strict";ti();Ft=64,kw=4});function Bw(e2){let t=e2.metadata["llama.vocab_size"];if(typeof t=="number"&&t>0)return t;if(e2.has("token_embd.weight")){let r=e2.info("token_embd.weight").shape[0];if(Number.isInteger(r)&&r>0)return r}let n=e2.metadata["tokenizer.ggml.tokens"];if(Array.isArray(n)&&n.length>0)return n.length}function Iw(e2){let t=e2.metadata,n=t["general.architecture"];if(n!=="llama")throw new Error(`Expected llama GGUF architecture, got ${JSON.stringify(n)}`);let r=Number(t["llama.attention.head_count"]),s=Number(t["llama.embedding_length"]),a=Number(t["llama.block_count"]);return new yt({vocab_size:Bw(e2),hidden_size:s,intermediate_size:t["llama.feed_forward_length"],num_hidden_layers:a,num_attention_heads:r,num_key_value_heads:t["llama.attention.head_count_kv"]??r,head_dim:t["llama.attention.key_length"]??Math.floor(s/r),max_position_embeddings:t["llama.context_length"],rms_norm_eps:t["llama.attention.layer_norm_rms_epsilon"],rope_parameters:{rope_theta:t["llama.rope.freq_base"]??1e4,rope_type:"default"},hidden_act:"silu",use_cache:true,attention_bias:false,attention_dropout:0,mlp_bias:false,layer_types:Array.from({length:a},()=>"full_attention"),eos_token_id:t["tokenizer.ggml.eos_token_id"],bos_token_id:t["tokenizer.ggml.bos_token_id"],pad_token_id:t["tokenizer.ggml.padding_token_id"]??null,tie_word_embeddings:!e2.has("output.weight")})}var Cw,Bd,Zt,Sw,Tw,Id=P(()=>{"use strict";dt();Yl();$c();Go();rd();xo();ys();qo();er();$o();os();Cd();ei();wt();ti();ri();Vo();ss();dt();mn();Cw=4,Bd=Qo(()=>Tw),Zt=class{runtime;config;weights;offsets;lmHeadQ8;lmHeadQ8Scales;lmHeadQ4;lmHeadQ4Scales;embedQ8;embedQ8Scales;packs;cacheDtype;programCache;defaultPositionIdsCache;ropeCache;qwen35RopeCache;#t=new jn;#e=new jn(t=>{for(let n of t.values())n.dispose()});#n;constructor({runtime:t,config:n,weights:r,offsets:s,lmHeadQ8:a=null,lmHeadQ8Scales:o=null,lmHeadQ4:i=null,lmHeadQ4Scales:u=null,embedQ8:l=null,embedQ8Scales:c=null,cacheDtype:d="float32",packs:p={}}){this.runtime=t,this.config=Fn(n),this.weights=r,this.offsets=s,this.lmHeadQ8=a,this.lmHeadQ8Scales=o,this.lmHeadQ4=i,this.lmHeadQ4Scales=u,this.embedQ8=l,this.embedQ8Scales=c,this.packs=p,this.cacheDtype=d,this.programCache=new Map,this.defaultPositionIdsCache=new Map,this.ropeCache=null}static ConfigClass=yt;static MODEL_NAME="Llama";static expectedWeightEntries=ja;static DECODE_GRAPH_EMIT=(t,n)=>zo(t,n,0);static _coerceConfig(t){return bo(this,t)}static loadStateDict(t,n,r){return Zc(this,t,n,r)}static loadGGUFFile=Bd.loadGGUFFile;static loadGGUF=Bd.loadGGUF;dispose(){this.#t.disposeAll(),this.#e.disposeAll(),Ae(this.weights),Ae(this.lmHeadQ8),Ae(this.lmHeadQ8Scales),Ae(this.lmHeadQ4),Ae(this.lmHeadQ4Scales),Ae(this.embedQ8),Ae(this.embedQ8Scales),Ae(this.packs),Ae(this.ropeCache),Ae(this.qwen35RopeCache),Ae(this.defaultPositionIdsCache),this.programCache.clear(),this.ropeCache=null,this.qwen35RopeCache=null,this.lmHeadQ8=null,this.lmHeadQ8Scales=null,this.lmHeadQ4=null,this.lmHeadQ4Scales=null,this.embedQ8=null,this.embedQ8Scales=null,this.packs={}}async forward(t={}){return vd(this,t)}async generate(t){let{input_ids:n,max_new_tokens:r,do_sample:s=false,force_token_path:a=false}=t;Yo(r,"generate"),Xo(s,"LlamaForCausalLM.generate");let{shape:o,data:i}=Es(n,"input_ids");if(o.length!==2)throw new Error("generate expects input_ids shape [batch, sequence]");let[u,l]=o,c=l+r;if(c>this.config.max_position_embeddings)throw new Error(`generated length ${c} exceeds max_position_embeddings ${this.config.max_position_embeddings}`);let d=new Uint32Array(u*c);for(let g=0;g<u;++g)for(let m=0;m<l;++m)d[g*c+m]=i[g*l+m];if(r===0)return this.runtime.tensorFromTypedArray("uint32",[u,c],d);if(a||ks(this.config))return this.#a({data:i,batchSize:u,promptLength:l,totalLength:c,maxNewTokens:r});let p=null,f=this.runtime.tensorFromTypedArray("uint32",[u,l],i);for(let g=0;g<r;++g){let m=await this.forward({input_ids:f,past_key_values:p,use_cache:true,logits_to_keep:1});p=m.past_key_values;let A=await this.runtime.readTensor(m.logits),w=m.logits.shape[1],C=new Uint32Array(u);for(let G=0;G<u;++G){let L=(G*w+w-1)*this.config.vocab_size,Z=Jo(A,L,this.config.vocab_size);C[G]=Z,d[G*c+l+g]=Z}f=this.runtime.tensorFromTypedArray("uint32",[u,1],C)}return this.runtime.tensorFromTypedArray("uint32",[u,c],d)}async*streamTokenIds(t){yield*this.#r(t,{fromCache:false})}createGenerationState(t={}){let n=t.batchSize??t.batch_size??1,r=vs(this),s=t.maxLength??t.max_length??r;if(n!==1)throw new Error("createGenerationState V1 supports batch size 1");if(!Number.isInteger(s)||s<1||s>r)throw new Error(`maxLength must be an integer in [1, ${r}]`);return bs(this,s)}async*streamTokenIdsFromCache(t){yield*this.#r(t,{fromCache:true})}async*#r(t,{fromCache:n}){let r=n?"streamTokenIdsFromCache":"streamTokenIds",{input_ids:s,max_new_tokens:a,generation_state:o=null,past_key_values:i=null,do_sample:u=false,force_token_path:l=false}=t,c=n?o?.cache??i:null;Yo(a,r);let{eosTokenId:d,stopOnEos:p}=xs(t,{eosTokenId:this.config.eos_token_id});if(Xo(u,`LlamaForCausalLM.${r}`),n&&c==null)throw new Error("streamTokenIdsFromCache requires generation_state, cache, or past_key_values");let{shape:f,data:g}=Es(s,"input_ids");if(f.length!==2)throw new Error(`${r} expects input_ids shape [batch, sequence]`);let[m,A]=f;if(m!==1)throw new Error(`${r} V1 supports batch size 1`);if(n){if(A<1)throw new Error("streamTokenIdsFromCache requires at least one input token");if(Gs(c,this.runtime,this.config,m),c.get_seq_length()+A+a>c.maxLength)throw new Error(`cache length ${c.get_seq_length()} + input length ${A} + max_new_tokens ${a} exceeds maxLength ${c.maxLength}`)}else{let C=A+a;if(C>this.config.max_position_embeddings)throw new Error(`generated length ${C} exceeds max_position_embeddings ${this.config.max_position_embeddings}`)}if(a===0)return;if(!l&&!ks(this.config)){yield*this.#s({tokenIds:g,inputLength:A,cache:c,maxNewTokens:a,eosTokenId:d,stopOnEos:p});return}let w=!n;if(n||(c=bs(this,A+a).cache),!c)throw new Error(`${r} requires a generation cache`);try{yield*this.#l({tokenIds:g,inputLength:A,cache:c,eosTokenId:d,generationArgs:t})}finally{w&&c.dispose()}}async#a({data:t,batchSize:n,promptLength:r,totalLength:s,maxNewTokens:a}){if(n!==1)throw new Error("large-model generation V1 supports batch size 1");let o=new Uint32Array(s);if(o.set(t),a===0)return this.runtime.tensorFromTypedArray("uint32",[1,s],o);let i=bs(this,s),u=0;try{for await(let l of this.#l({tokenIds:o,inputLength:r,cache:i.cache,generationArgs:{max_new_tokens:a,stop_on_eos:false}}))o[r+u]=l,u+=1}finally{i.cache.dispose()}return this.runtime.tensorFromTypedArray("uint32",[1,s],o)}async*#s({tokenIds:t,inputLength:n,cache:r=null,maxNewTokens:s,eosTokenId:a,stopOnEos:o}){let i=this.runtime.tensorFromTypedArray("uint32",[1,n],t);for(let u=0;u<s;++u){let l=await this.forward({input_ids:i,past_key_values:r,use_cache:true,logits_to_keep:1});r=l.past_key_values;let c=await this.runtime.readTensor(l.logits),d=l.logits.shape[1],p=Jo(c,(d-1)*this.config.vocab_size,this.config.vocab_size);if(o&&Qs(p,a))return;yield p,i=this.runtime.tensorFromTypedArray("uint32",[1,1],new Uint32Array([p]))}}async*#l({tokenIds:t,inputLength:n,cache:r,eosTokenId:s,generationArgs:a}){let o=this.#f(r,{eosTokenId:s,pipelineDepth:rr(a,Cw,Ft)});yield*Sd(o,t.subarray(0,n),a)}makeGraphDecodeSession(t){return new Is(this,t)}#o(t){return this.#t.getOrBuild(t,async()=>{let n=this.makeGraphDecodeSession(t);return await n.build(t.get_seq_length(),{fuse:true}),n})}prefillSupported(){return Ho(this)}makeGraphPrefillSession(t,n){return new Ts(this,t,n)}#u(){return false?false:this.#n??=this.prefillSupported()}async#i(t,n){let r=await this.#e.getOrBuild(t,()=>new Map),s=r.get(n);return s||(s=this.makeGraphPrefillSession(t,n),await s.build(),r.set(n,s)),s}async warmup(t,n){if(await t.mutableStateCheckpoint?.(),!this.#u()){await ni(this,t,[1]);return}let r=n?.promptTokens!==void 0?this.#d(n.promptTokens,t):Dc((a,o,i)=>this.planPrefillChunks(a,o,i),t.maxLength),s=r.find(a=>a+2<=t.maxLength);await ni(this,t,[s??1]);for(let a of r)a!==s&&await this.#i(t,a)}#d(t,n){return fo(this.planPrefillChunks(t,0,n.maxLength))}async#c(t,n,r){let s=await this.#o(t),a=n.length-1,o=false;for(let i=0;i<a;++i)s.enqueueStep(n[i],r+i,{full:o});return s.submitStep(n[a],r+a)}prefillMinTokens(){return Ec/2}planPrefillChunks(t,n,r){return Gc({tokenCount:t,position:n,maxLength:r,minGraphTokens:this.prefillMinTokens()})}async#p(t,n,r){if(!this.#u())return this.#c(t,n,r);let s=this.planPrefillChunks(n.length,r,t.maxLength),a=0,o=r,i=0;for(let u=0;u<s.length;++u){let l=s[u],c=n.subarray(a,a+l.tokenCount);if(l.kind==="graph"){let d=await this.#i(t,l.blockLen);!(u===s.length-1)&&true?d.enqueueBody(c,o):i=await d.run(c,o)}else i=await this.#c(t,c,o);a+=l.tokenCount,o+=l.tokenCount}return i}#f(t,{eosTokenId:n,pipelineDepth:r}){return{cache:t,eosTokenId:n,pipelineDepth:r,prefill:(s,a)=>this.#p(t,s,a),beginDecode:()=>this.#o(t)}}},Sw=new Set(["o_proj","gate_proj","up_proj","down_proj"]);Tw=ws({configFromGGUF:Iw,entriesFor:ja,nameToGGUF:jc,packSuffixes:Sw,emitGraph:Zt.DECODE_GRAPH_EMIT,modelName:Zt.MODEL_NAME,construct:e2=>new Zt(e2)})});function Ps(e2){if(!Ds(e2).qwen35_partial_rotary)return hn(e2);if(e2.qwen35RopeCache)return e2.qwen35RopeCache;let t=Ds(e2).rotary_dim,n=t/2,r=Ds(e2).max_position_embeddings,s=Number(Ds(e2).rope_parameters.rope_theta),{cos:a,sin:o}=Wo(r,t,s);return e2.qwen35RopeCache={cos:e2.runtime.tensorFromTypedArray("float32",[r,n],a),sin:e2.runtime.tensorFromTypedArray("float32",[r,n],o)},e2.qwen35RopeCache}var Ds,si=P(()=>{"use strict";_n();Ds=e2=>e2.config});function sr(e2,t,n){let r=e2.config,s=r.hidden_size,a=r.num_hidden_layers,o=r.num_attention_heads,i=r.num_key_value_heads,u=r.head_dim,l=r.attention_size,c=r.kv_size,d=r.rotary_dim,p=r.intermediate_size,f=r.vocab_size,g=Number(r.rms_norm_eps),m=t.maxLength,A=r.layer_types,w=r.linear_key_dim,C=r.linear_value_dim,G=r.linear_conv_dim,L=r.linear_conv_kernel_dim,Z=L-1,O=r.linear_num_key_heads,b=r.linear_num_value_heads,S=r.linear_key_head_dim,y=r.linear_value_head_dim,I=bt(u),H=bt(S),W=Math.max(64,Tt(y)),x=Tt(Math.ceil(S/4)),q=Tt(S),R=Ps(e2),D=e2.offsets.top,h=new mt,{w:_,state:k,boundWeights:v,states:V}=xt(h),j=_("weights",e2.weights),N=_("rope.cos",R.cos),re=_("rope.sin",R.sin),ke=h.uniform("params",16),M=Pt(_,e2),K=qe(e2),J=!!e2.runtime.device.features.has("shader-f16"),ie=Dt(_,e2),Y=(T,z,te,pe,le,se)=>{if(K){let de=ie(T,[pe],`o.${pe}`);return h.op("com.xenova.Qwen35DecodeOProj",{hiddenT:z,q1BitsT:de.bitsT,q1ScalesT:de.scalesT,attnT:te},{args:{hiddenSize:s,inFeatures:se,oOffset:de.offset(`layers.${T}.${pe}`)}}).hiddenT}if(Ee(e2,`layers.${T}.${pe}`)){let de=M(T,[pe],`o.${pe}`);return h.op("com.xenova.Qwen35DecodeOProj",{hiddenT:z,q4BitsT:de.bitsT,q4ScalesT:de.scalesT,attnT:te},{args:{hiddenSize:s,inFeatures:se,oOffset:de.offset(`layers.${T}.${pe}`),format:de.format,lut:de.lut}}).hiddenT}return h.op("com.xenova.Qwen35DecodeOProj",{hiddenT:z,weightsT:j,attnT:te},{args:{hiddenSize:s,inFeatures:se,oOffset:le}}).hiddenT},ne=(T,z,te)=>{if(K){let se=h.scratch(`L${z}.intermediate`,J?"float16":"float32",[p]),de=h.scratch(`L${z}.postNormed`,"float32",[s]);h.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:T,weightsT:j,normedT:de},{args:{hiddenSize:s,rmsEps:g,normOffset:te.post_attention_layernorm}});let $2=ie(z,["gate_proj","up_proj"],"gateup");h.op("com.xenova.LlamaDecodeGateUp",{normedT:de,q1BitsT:$2.bitsT,q1ScalesT:$2.scalesT,intermediateT:se},{args:{hiddenSize:s,intermediateSize:p,gateOffset:$2.offset(`layers.${z}.gate_proj`),upOffset:$2.offset(`layers.${z}.up_proj`),...false?{activation:"fast_silu"}:{}}});let ce=ie(z,["down_proj"],"down");return h.op("com.xenova.LlamaDecodeDownProj",{hiddenT:T,q1BitsT:ce.bitsT,q1ScalesT:ce.scalesT,intermediateT:se},{args:{hiddenSize:s,intermediateSize:p,downOffset:ce.offset(`layers.${z}.down_proj`)}}).hiddenT}let pe=h.scratch(`L${z}.postNormed`,"float32",[s]);h.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:T,weightsT:j,normedT:pe},{args:{hiddenSize:s,rmsEps:g,normOffset:te.post_attention_layernorm}});let le=h.scratch(`L${z}.intermediate`,"float32",[p]);if(Ee(e2,`layers.${z}.gate_proj`)){let se=M(z,["gate_proj","up_proj"],"gateup");h.op("com.xenova.LlamaDecodeGateUp",{normedT:pe,q4BitsT:se.bitsT,q4ScalesT:se.scalesT,intermediateT:le},{args:{hiddenSize:s,intermediateSize:p,gateOffset:se.offset(`layers.${z}.gate_proj`),upOffset:se.offset(`layers.${z}.up_proj`),format:se.format,lut:se.lut}})}else h.op("com.xenova.LlamaDecodeGateUp",{normedT:pe,weightsT:j,intermediateT:le},{args:{hiddenSize:s,intermediateSize:p,gateOffset:te.gate_proj,upOffset:te.up_proj}});if(Ee(e2,`layers.${z}.down_proj`)){let se=M(z,["down_proj"],"down");return h.op("com.xenova.LlamaDecodeDownProj",{hiddenT:T,q4BitsT:se.bitsT,q4ScalesT:se.scalesT,intermediateT:le},{args:{hiddenSize:s,intermediateSize:p,downOffset:se.offset(`layers.${z}.down_proj`),format:se.format,lut:se.lut}}).hiddenT}return h.op("com.xenova.LlamaDecodeDownProj",{hiddenT:T,weightsT:j,intermediateT:le},{args:{hiddenSize:s,intermediateSize:p,downOffset:te.down_proj}}).hiddenT},ae=h.stepInput("input_ids","uint32",[1]),Q;if(K){let T=Ut(e2,["embed_tokens"]);Q=h.op("com.xenova.LlamaEmbed",{inputT:ae,q1BitsT:_("embed.q1bits",T.q1BitsT),q1ScalesT:_("embed.q1scales",T.q1ScalesT),paramsT:ke},{args:{hiddenSize:s,vocabSize:f,embedOffset:T.offset("embed_tokens"),tokenOffset:0}}).hiddenT}else e2.embedQ8&&e2.embedQ8Scales?Q=h.op("com.xenova.LlamaEmbed",{inputT:ae,embedQ8T:_("embed.q8bits",e2.embedQ8),embedQ8ScalesT:_("embed.q8scales",e2.embedQ8Scales),paramsT:ke},{args:{hiddenSize:s,vocabSize:f,tokenOffset:0}}).hiddenT:Q=h.op("com.xenova.LlamaEmbed",{inputT:ae,weightsT:j,paramsT:ke},{args:{hiddenSize:s,vocabSize:f,embedOffset:D.embed_tokens,tokenOffset:0}}).hiddenT;for(let T=0;T<a;++T){let z=e2.offsets.layers[T];if(A[T]==="full_attention"){let te=Qt(e2,t,T),pe=k(`cache.key.${T}`,te.cacheKeysT),le=k(`cache.value.${T}`,te.cacheValuesT),se=h.scratch(`L${T}.normed`,"float32",[s]);h.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:Q,weightsT:j,normedT:se},{args:{hiddenSize:s,rmsEps:g,normOffset:z.input_layernorm}});let de=h.scratch(`L${T}.q`,"float32",[l]),$2=h.scratch(`L${T}.qGate`,"float32",[l]),ce=h.scratch(`L${T}.k`,"float32",[c]),xe=h.scratch(`L${T}.v`,"float32",[c]);if(K){let ve=ie(T,["q_proj","k_proj","v_proj"],"qkv");h.op("com.xenova.Qwen35DecodeFullQkv",{normedT:se,q1BitsT:ve.bitsT,q1ScalesT:ve.scalesT,qT:de,qGateT:$2,kT:ce,vT:xe},{args:{qSize:l,kvSize:c,headDim:u,hiddenSize:s,qOffset:ve.offset(`layers.${T}.q_proj`),kOffset:ve.offset(`layers.${T}.k_proj`),vOffset:ve.offset(`layers.${T}.v_proj`)}})}else if(Ee(e2,`layers.${T}.q_proj`)){let ve=M(T,["q_proj","k_proj","v_proj"],"qkv");h.op("com.xenova.Qwen35DecodeFullQkv",{normedT:se,q4BitsT:ve.bitsT,q4ScalesT:ve.scalesT,qT:de,qGateT:$2,kT:ce,vT:xe},{args:{qSize:l,kvSize:c,headDim:u,hiddenSize:s,qOffset:ve.offset(`layers.${T}.q_proj`),kOffset:ve.offset(`layers.${T}.k_proj`),vOffset:ve.offset(`layers.${T}.v_proj`),format:ve.format,lut:ve.lut}})}else h.op("com.xenova.Qwen35DecodeFullQkv",{normedT:se,weightsT:j,qT:de,qGateT:$2,kT:ce,vT:xe},{args:{qSize:l,kvSize:c,headDim:u,hiddenSize:s,qOffset:z.q_proj,kOffset:z.k_proj,vOffset:z.v_proj}});h.op("com.xenova.LlamaDecodeQkNorm",{qT:de,kT:ce,weightsT:j},{args:{numHeads:o,numKvHeads:i,headDim:u,rmsEps:g,qNormOffset:z.q_layernorm,kNormOffset:z.k_layernorm}}),h.op("com.xenova.Qwen35DecodePartialRopeCacheKv",{qT:de,kT:ce,vT:xe,cacheKeysT:pe,cacheValuesT:le,cosT:N,sinT:re,paramsT:ke},{args:{layer:0,cacheLen:m,pastLen:n,numHeads:o,numKvHeads:i,headDim:u,rotaryDim:d}});let st=h.scratch(`L${T}.attn`,"float32",[l]);h.op("com.xenova.Qwen35DecodeFullAttention",{qT:de,gateT:$2,cacheKeysT:pe,cacheValuesT:le,attnT:st,paramsT:ke},{args:{layer:0,cacheLen:m,pastLen:n,numHeads:o,numKvHeads:i,headDim:u,scale:I}}),Q=Y(T,Q,st,"o_proj",z.o_proj,l)}else{if(!t.linearConvStates?.[T]||!t.linearRecurrentStates?.[T])throw new Error(`emitQwen35Decode: linear layer ${T} is missing conv/recurrent state`);let te=k(`linear.conv.${T}`,Te(t.linearConvStates[T],0,G*Z)),pe=k(`linear.rec.${T}`,Te(t.linearRecurrentStates[T],0,b*S*y)),le=h.scratch(`L${T}.normed`,"float32",[s]);h.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:Q,weightsT:j,normedT:le},{args:{hiddenSize:s,rmsEps:g,normOffset:z.input_layernorm}});let se=h.scratch(`L${T}.lq`,"float32",[w]),de=h.scratch(`L${T}.lk`,"float32",[w]),$2=h.scratch(`L${T}.lv`,"float32",[C]),ce=h.scratch(`L${T}.lz`,"float32",[C]),xe=h.scratch(`L${T}.lgate`,"float32",[2*b]);if(K){let Be=ie(T,["linear_in_proj_qkv","linear_in_proj_z","linear_in_proj_b","linear_in_proj_a"],"inproj");h.op("com.xenova.Qwen35DecodeLinearInProjConv",{normedT:le,weightsT:j,q1BitsT:Be.bitsT,q1ScalesT:Be.scalesT,convStateT:te,qT:se,kT:de,vT:$2,zT:ce,gateT:xe},{args:{keyDim:w,valueDim:C,convDim:G,numHeads:b,convKernel:L,hiddenSize:s,qkvOffset:Be.offset(`layers.${T}.linear_in_proj_qkv`),zOffset:Be.offset(`layers.${T}.linear_in_proj_z`),bOffset:Be.offset(`layers.${T}.linear_in_proj_b`),aOffset:Be.offset(`layers.${T}.linear_in_proj_a`),convWeightOffset:z.linear_conv_weight,aNegExpOffset:z.linear_a_neg_exp,dtBiasOffset:z.linear_dt_bias}})}else if(Ee(e2,`layers.${T}.linear_in_proj_qkv`)){let Be=M(T,["linear_in_proj_qkv","linear_in_proj_z","linear_in_proj_b","linear_in_proj_a"],"inproj");h.op("com.xenova.Qwen35DecodeLinearInProjConv",{normedT:le,weightsT:j,q4BitsT:Be.bitsT,q4ScalesT:Be.scalesT,convStateT:te,qT:se,kT:de,vT:$2,zT:ce,gateT:xe},{args:{keyDim:w,valueDim:C,convDim:G,numHeads:b,convKernel:L,hiddenSize:s,qkvOffset:Be.offset(`layers.${T}.linear_in_proj_qkv`),zOffset:Be.offset(`layers.${T}.linear_in_proj_z`),bOffset:Be.offset(`layers.${T}.linear_in_proj_b`),aOffset:Be.offset(`layers.${T}.linear_in_proj_a`),convWeightOffset:z.linear_conv_weight,aNegExpOffset:z.linear_a_neg_exp,dtBiasOffset:z.linear_dt_bias,format:Be.format,lut:Be.lut}})}else h.op("com.xenova.Qwen35DecodeLinearInProjConv",{normedT:le,weightsT:j,convStateT:te,qT:se,kT:de,vT:$2,zT:ce,gateT:xe},{args:{keyDim:w,valueDim:C,convDim:G,numHeads:b,convKernel:L,hiddenSize:s,qkvOffset:z.linear_in_proj_qkv,zOffset:z.linear_in_proj_z,bOffset:z.linear_in_proj_b,aOffset:z.linear_in_proj_a,convWeightOffset:z.linear_conv_weight,aNegExpOffset:z.linear_a_neg_exp,dtBiasOffset:z.linear_dt_bias}});let st=h.scratch(`L${T}.lattn`,"float32",[C]);h.op("com.xenova.Qwen35DecodeLinearAttention",{stateT:pe,qT:se,kT:de,vT:$2,gateT:xe,outT:st},{args:{numHeads:b,numKeyHeads:O,headDimK:S,headDimV:y,scale:H,workgroupSizeVec4:x,workgroupSizeScalar:q}});let ve=h.scratch(`L${T}.lnormed`,"float32",[C]);h.op("com.xenova.Qwen35DecodeGatedRmsNorm",{xT:st,zT:ce,weightsT:j,yT:ve},{args:{numValueHeads:b,valueHeadDim:y,normOffset:z.linear_norm,rmsEps:g,workgroupSize:W}}),Q=Y(T,Q,ve,"linear_out_proj",z.linear_out_proj,C)}Q=ne(Q,T,z)}let U=Jn(h,{w:_,model:e2,hidden:Q,weights:j,ids:ae,hiddenSize:s,vocabSize:f,rmsEps:g,finalNormOffset:D.model_norm,lmHeadOffset:D.lm_head,q1:K,normedDtype:K&&J?"float16":"float32"});return{graph:h.finish({name:"qwen35-decode",params:{positionOffset:n}}),weights:v,states:V,paramsName:"params",nextTokenTailNodeCount:U}}var Ls,ai=P(()=>{"use strict";Yn();er();_n();Gt();si();dt();wt();Ls=class extends Xn{buildGraph(t){let n=sr(this.model,this.cache,t);return{emission:n,graph:n.graph}}}});function ar(e2){return Ue(e2.config)}function oi(e2,t,n){if(!ar(e2))throw new Error("emitQwen35Prefill: only Qwen3.5 (mixed full/linear-attention) models are supported");let r=e2.config,s=n,a=r.hidden_size,o=r.num_hidden_layers,i=r.intermediate_size,u=r.vocab_size,l=Number(r.rms_norm_eps),c=t.maxLength,d=r.num_attention_heads,p=r.num_key_value_heads,f=r.head_dim,g=r.attention_size,m=r.kv_size,A=r.rotary_dim,w=g+2*m,C=bt(f),G=r.linear_key_dim,L=r.linear_value_dim,Z=r.linear_conv_dim,O=r.linear_conv_kernel_dim,b=O-1,S=r.linear_num_key_heads,y=r.linear_num_value_heads,I=r.linear_key_head_dim,H=r.linear_value_head_dim,W=bt(I),x=Math.max(64,Tt(I)),q=Math.max(64,Tt(I)),R=Math.max(64,Tt(H)),D="float32",h=e2.runtime.device.features.has("shader-f16"),_=qe(e2),k=h&&(_||e2.weights.dtype==="float16")?"float16":"float32",v=h&&e2.runtime.device.features.has("subgroups")&&e2.runtime.device.features.has("chromium-experimental-subgroup-matrix"),V=Ps(e2),j=e2.offsets.top,N=new mt,{w:re,state:ke,boundWeights:M,states:K}=xt(N),J=re("weights",e2.weights),ie=re("rope.cos",V.cos),Y=re("rope.sin",V.sin),ne=N.uniform("params",16),ae=_&&h&&s>=64?N.stepInput("q1_real_len","uint32",[1]):void 0,Q=Pt(re,e2),U=Dt(re,e2),{proj:T,mlpInto:z}=Uo({g:N,model:e2,weights:J,q4w:Q,q1w:U,q1RealLenT:ae,T:s,H:a,inter:i,eps:l,actGemm:k,fusedQ4:v,..._&&false?{q1Activation:"fast_silu"}:{}}),te=_&&s<=16&&a%128===0&&y%4===0,pe=N.stepInput("input_ids","uint32",[s]),le=Fo({g:N,w:re,weights:J,model:e2,ids:pe,act:D,H:a,vocab:u,T:s,embedOffset:j.embed_tokens});for(let $2=0;$2<o;++$2){let ce=e2.offsets.layers[$2],xe=N.op("com.xenova.LlamaPrefillRmsNorm",{xT:le,weightsT:J,yT:N.scratch(`L${$2}.normed`,k,[s,a])},{args:{normOffset:ce.input_layernorm,rows:s,dim:a,eps:l}}).yT;if(An(r,$2)==="full_attention"){let st=Qt(e2,t,$2),ve=ke(`cache.key.${$2}`,st.cacheKeysT),Be=ke(`cache.value.${$2}`,st.cacheValuesT),Ms=T($2,xe,"q_proj",ce.q_proj,2*g,a,`L${$2}.qg`),ur=T($2,xe,"k_proj",ce.k_proj,m,a,`L${$2}.k`),Ks=T($2,xe,"v_proj",ce.v_proj,m,a,`L${$2}.v`),kt=N.scratch(`L${$2}.qkv`,k,[s,w]),Nt=N.scratch(`L${$2}.gate`,k,[s,g]);N.op("com.xenova.Qwen35PrefillAssembleQkv",{qgT:Ms,kT:ur,vT:Ks,qkvT:kt,gateT:Nt},{args:{qSize:g,kvSize:m,headDim:f,seqLen:s}}),N.op("com.xenova.LlamaPrefillQkNorm",{qkvT:kt,weightsT:J},{args:{qNormOffset:ce.q_layernorm,kNormOffset:ce.k_layernorm,numHeads:d,numKvHeads:p,headDim:f,seqLen:s,qkvStride:w,rmsEps:l}}),N.op("com.xenova.Qwen35PrefillPartialRopeCacheKv",{qkvT:kt,cacheKeysT:ve,cacheValuesT:Be,cosT:ie,sinT:Y,params:ne},{args:{layer:0,cacheLen:c,pastLen:0,seqLen:s,numHeads:d,numKvHeads:p,headDim:f,rotaryDim:A}});let yn=N.op("com.xenova.LlamaPrefillAttention",{qkvT:kt,cacheKeysT:ve,cacheValuesT:Be,attnT:N.scratch(`L${$2}.attn`,k,[s,g]),params:ne},{args:{layer:0,cacheLen:c,pastLen:0,seqLen:s,numHeads:d,numKvHeads:p,headDim:f,scale:C,workgroupSize:64}}).attnT;N.op("com.xenova.Qwen35PrefillAttentionGate",{attnT:yn,gateT:Nt},{args:{seqLen:s,qSize:g}});let Os=T($2,yn,"o_proj",ce.o_proj,a,g,`L${$2}.oproj`);N.op("com.xenova.AddInPlace",{yT:le,xT:Os},{args:{count:s*a}})}else{if(!t.linearConvStates?.[$2]||!t.linearRecurrentStates?.[$2])throw new Error(`emitQwen35Prefill: linear layer ${$2} is missing conv/recurrent state`);let st=ke(`linear.conv.${$2}`,Te(t.linearConvStates[$2],0,Z*b)),ve=ke(`linear.rec.${$2}`,Te(t.linearRecurrentStates[$2],0,y*I*H)),Be=T($2,xe,"linear_in_proj_qkv",ce.linear_in_proj_qkv,Z,a,`L${$2}.bcx`),Ms=T($2,xe,"linear_in_proj_z",ce.linear_in_proj_z,L,a,`L${$2}.z`),ur=N.scratch(`L${$2}.lgate`,D,[s,2*y]),Ks=(()=>{if(te){let lr=U($2,["linear_in_proj_b","linear_in_proj_a"],"gates");return N.op("com.xenova.Qwen35PrefillGates",{normedT:xe,weightsT:J,q1BitsT:lr.bitsT,q1ScalesT:lr.scalesT,gateT:ur},{args:{hiddenSize:a,numHeads:y,bOffset:lr.offset(`layers.${$2}.linear_in_proj_b`),aOffset:lr.offset(`layers.${$2}.linear_in_proj_a`),aNegExpOffset:ce.linear_a_neg_exp,dtBiasOffset:ce.linear_dt_bias,seqLen:s}}).gateT}let Rd=T($2,xe,"linear_in_proj_b",ce.linear_in_proj_b,y,a,`L${$2}.braw`),Md=T($2,xe,"linear_in_proj_a",ce.linear_in_proj_a,y,a,`L${$2}.araw`);return N.op("com.xenova.Qwen35PrefillGates",{brawT:Rd,arawT:Md,weightsT:J,gateT:ur},{args:{numHeads:y,aNegExpOffset:ce.linear_a_neg_exp,dtBiasOffset:ce.linear_dt_bias,seqLen:s}}).gateT})(),kt=N.scratch(`L${$2}.lq`,D,[s,G]),Nt=N.scratch(`L${$2}.lk`,D,[s,G]),yn=N.scratch(`L${$2}.lv`,D,[s,L]);N.op("com.xenova.Qwen35PrefillConv",{bcxT:Be,weightsT:J,convStatesT:st,qT:kt,kT:Nt,vT:yn,params:ne},{args:{keyDim:G,valueDim:L,convDim:Z,convKernel:O,convWeightOffset:ce.linear_conv_weight,seqLen:s}}),N.op("com.xenova.Qwen35PrefillL2Norm",{qT:kt,kT:Nt},{args:{numKeyHeads:S,keyHeadDim:I,seqLen:s,workgroupSize:x}});let Os=N.op("com.xenova.Qwen35PrefillLinearAttention",{stateT:ve,qT:kt,kT:Nt,vT:yn,gateT:Ks,outT:N.scratch(`L${$2}.lattn`,D,[s,L]),params:ne},{args:{numHeads:y,numKeyHeads:S,headDimK:I,headDimV:H,scale:W,seqLen:s,workgroupSize:q}}).outT,Ld=N.op("com.xenova.Qwen35PrefillGatedRmsNorm",{xT:Os,zT:Ms,weightsT:J,yT:N.scratch(`L${$2}.lnormed`,k,[s,L])},{args:{numValueHeads:y,valueHeadDim:H,normOffset:ce.linear_norm,rmsEps:l,seqLen:s,workgroupSize:R}}).yT,qd=T($2,Ld,"linear_out_proj",ce.linear_out_proj,a,L,`L${$2}.loproj`);N.op("com.xenova.AddInPlace",{yT:le,xT:qd},{args:{count:s*a}})}z($2,ce,le)}let se=N.nodeCount,de=Zo({g:N,w:re,weights:J,model:e2,hidden:le,act:D,H:a,vocab:u,T:s,eps:l,finalNormOffset:j.model_norm,lmHeadOffset:j.lm_head});return{graph:N.finish({name:"qwen35-prefill",params:{T:s}}),weights:M,states:K,paramsName:"params",lastRowUniform:de,...ae?{q1RealLenInput:ae.name}:{},nextTokenTailNodeCount:N.nodeCount-se}}var qs,ii=P(()=>{"use strict";Yn();_n();er();dt();Gt();si();$o();wt();qs=class extends tr{buildEmission(){return oi(this.model,this.cache,this.blockLen)}}});var xd={};bn(xd,{QWEN35_GGUF_LIFECYCLE:()=>Gd,qwen35ConfigFromGGUF:()=>or,qwen35GgufCheckSupport:()=>Ed,qwen35GgufUnsupportedReason:()=>Rs,qwen35GgufWeightEntries:()=>Td});function or(e2){let t=e2.metadata,n=typeof t["qwen35.nextn_predict_layers"]=="number"?t["qwen35.nextn_predict_layers"]:0,r=Re(t,"qwen35.block_count")-n,s=Re(t,"qwen35.attention.key_length"),a=Re(t,"qwen35.rope.dimension_count"),o=Re(t,"qwen35.full_attention_interval"),i=Re(t,"qwen35.ssm.group_count"),u=Re(t,"qwen35.ssm.inner_size"),l=Re(t,"qwen35.ssm.state_size"),c=typeof t["qwen35.ssm.time_step_rank"]=="number"?t["qwen35.ssm.time_step_rank"]:i,d=e2.info("token_embd.weight").shape[0],p=Array.from({length:r},(m,A)=>(A+1)%o===0?"full_attention":"linear_attention"),f=typeof t["tokenizer.ggml.eos_token_id"]=="number"?t["tokenizer.ggml.eos_token_id"]:null,g=typeof t["tokenizer.ggml.padding_token_id"]=="number"?t["tokenizer.ggml.padding_token_id"]:null;return new ir({vocab_size:d,hidden_size:Re(t,"qwen35.embedding_length"),intermediate_size:Re(t,"qwen35.feed_forward_length"),num_hidden_layers:r,num_attention_heads:Re(t,"qwen35.attention.head_count"),num_key_value_heads:Re(t,"qwen35.attention.head_count_kv"),head_dim:s,hidden_act:"silu",max_position_embeddings:Re(t,"qwen35.context_length"),rms_norm_eps:Re(t,"qwen35.attention.layer_norm_rms_epsilon"),use_cache:true,tie_word_embeddings:!e2.has("output.weight"),attention_bias:false,attention_dropout:0,mlp_bias:false,linear_conv_kernel_dim:Re(t,"qwen35.ssm.conv_kernel"),linear_key_head_dim:l,linear_value_head_dim:u/c,linear_num_key_heads:i,linear_num_value_heads:c,full_attention_interval:o,layer_types:p,rotary_dim:a,rope_parameters:{rope_type:"default",rope_theta:Re(t,"qwen35.rope.freq_base"),partial_rotary_factor:a/s},eos_token_id:f,bos_token_id:null,pad_token_id:g})}function Td(e2){let t=e2.hidden_size,n=e2.intermediate_size,r=e2.attention_size,s=e2.kv_size,a=e2.linear_value_dim,o=e2.linear_conv_dim,i=e2.linear_num_value_heads,u=[{id:"embed_tokens",name:"token_embd.weight",length:e2.vocab_size*t}];for(let l=0;l<e2.num_hidden_layers;++l){let c=`L${l}.attn.qkv`,d=`L${l}.linear.in_proj`,p=`L${l}.mlp.gate_up`;u.push({id:`layers.${l}.input_layernorm`,name:`blk.${l}.attn_norm.weight`,length:t}),e2.layer_types[l]==="full_attention"?u.push({id:`layers.${l}.q_proj`,name:`blk.${l}.attn_q.weight`,length:2*r*t,packedGroup:c},{id:`layers.${l}.k_proj`,name:`blk.${l}.attn_k.weight`,length:s*t,packedGroup:c},{id:`layers.${l}.v_proj`,name:`blk.${l}.attn_v.weight`,length:s*t,packedGroup:c},{id:`layers.${l}.o_proj`,name:`blk.${l}.attn_output.weight`,length:t*r},{id:`layers.${l}.q_layernorm`,name:`blk.${l}.attn_q_norm.weight`,length:e2.head_dim},{id:`layers.${l}.k_layernorm`,name:`blk.${l}.attn_k_norm.weight`,length:e2.head_dim}):u.push({id:`layers.${l}.linear_in_proj_qkv`,name:`blk.${l}.attn_qkv.weight`,length:o*t,packedGroup:d},{id:`layers.${l}.linear_in_proj_z`,name:`blk.${l}.attn_gate.weight`,length:a*t,packedGroup:d},{id:`layers.${l}.linear_in_proj_b`,name:`blk.${l}.ssm_beta.weight`,length:i*t,packedGroup:d},{id:`layers.${l}.linear_in_proj_a`,name:`blk.${l}.ssm_alpha.weight`,length:i*t,packedGroup:d},{id:`layers.${l}.linear_out_proj`,name:`blk.${l}.ssm_out.weight`,length:t*a},{id:`layers.${l}.linear_conv_weight`,name:`blk.${l}.ssm_conv1d.weight`,length:o*e2.linear_conv_kernel_dim},{id:`layers.${l}.linear_a_neg_exp`,name:`blk.${l}.ssm_a`,length:i},{id:`layers.${l}.linear_dt_bias`,name:`blk.${l}.ssm_dt.bias`,length:i},{id:`layers.${l}.linear_norm`,name:`blk.${l}.ssm_norm.weight`,length:e2.linear_value_head_dim}),u.push({id:`layers.${l}.gate_proj`,name:`blk.${l}.ffn_gate.weight`,length:n*t,packedGroup:p},{id:`layers.${l}.up_proj`,name:`blk.${l}.ffn_up.weight`,length:n*t,packedGroup:p},{id:`layers.${l}.down_proj`,name:`blk.${l}.ffn_down.weight`,length:t*n},{id:`layers.${l}.post_attention_layernorm`,name:`blk.${l}.post_attention_norm.weight`,length:t})}return u.push({id:"model_norm",name:"output_norm.weight",length:t},{id:"lm_head",name:"output.weight",length:e2.vocab_size*t}),u}function Ed(e2,t,n){return Gd.checkSupport(e2,t,n)}function Rs(e2,t,n){return Ed(e2,t,n).reason}var Re,Ew,Gw,Gd,ui=P(()=>{"use strict";li();ai();ii();xo();It();Re=(e2,t)=>yl(e2,t,"Qwen3.5");Ew=e2=>e2,Gw=new Set(["gate_proj","up_proj","down_proj","o_proj","linear_out_proj","linear_in_proj_qkv","linear_in_proj_z","linear_in_proj_b","linear_in_proj_a","q_proj","k_proj","v_proj"]);Gd=ws({configFromGGUF:or,entriesFor:Td,nameToGGUF:Ew,packSuffixes:Gw,emitGraph:(e2,t)=>sr(e2,t,0),emitPrefillGraph:(e2,t,n)=>ar(e2)?oi(e2,t,n):null,modelName:$t.MODEL_NAME,construct:e2=>new $t(e2)})});function xw(e2){let t=e2.hidden_size,n=e2.intermediate_size,r=e2.attention_size,s=e2.kv_size,a=e2.linear_value_dim,o=e2.linear_conv_dim,i=[{id:"embed_tokens",name:"model.embed_tokens.weight",length:e2.vocab_size*t}];for(let u=0;u<e2.num_hidden_layers;++u){let l=`L${u}.attn.qkv`,c=`L${u}.linear.in_proj`,d=`L${u}.mlp.gate_up`;i.push({id:`layers.${u}.input_layernorm`,name:`model.layers.${u}.input_layernorm.weight`,length:t}),e2.layer_types[u]==="full_attention"?i.push(je(`layers.${u}.q_proj`,`model.layers.${u}.attn.q_proj.MatMul.weight`,t,2*r,l),je(`layers.${u}.k_proj`,`model.layers.${u}.attn.k_proj.MatMul.weight`,t,s,l),je(`layers.${u}.v_proj`,`model.layers.${u}.attn.v_proj.MatMul.weight`,t,s,l),je(`layers.${u}.o_proj`,`model.layers.${u}.attn.o_proj.MatMul.weight`,r,t),{id:`layers.${u}.q_layernorm`,name:`model.layers.${u}.attn.q_norm.layernorm.weight`,length:e2.head_dim},{id:`layers.${u}.k_layernorm`,name:`model.layers.${u}.attn.k_norm.layernorm.weight`,length:e2.head_dim}):i.push(je(`layers.${u}.linear_in_proj_qkv`,`model.layers.${u}.gdn.in_proj_qkv.MatMul.weight`,t,o,c),je(`layers.${u}.linear_in_proj_z`,`model.layers.${u}.gdn.in_proj_z.MatMul.weight`,t,a,c),je(`layers.${u}.linear_in_proj_b`,`model.layers.${u}.gdn.in_proj_b.MatMul.weight`,t,e2.linear_num_value_heads,c),je(`layers.${u}.linear_in_proj_a`,`model.layers.${u}.gdn.in_proj_a.MatMul.weight`,t,e2.linear_num_value_heads,c),je(`layers.${u}.linear_out_proj`,`model.layers.${u}.gdn.out_proj.MatMul.weight`,a,t),{id:`layers.${u}.linear_conv_weight`,name:`model.layers.${u}.gdn.conv1d.weight_3d`,length:o*e2.linear_conv_kernel_dim},{id:`layers.${u}.linear_a_neg_exp`,name:`model.layers.${u}.gdn.A_neg_exp`,length:e2.linear_num_value_heads},{id:`layers.${u}.linear_dt_bias`,name:`model.layers.${u}.gdn.dt_bias`,length:e2.linear_num_value_heads},{id:`layers.${u}.linear_norm`,name:`model.layers.${u}.gdn.norm.weight`,length:e2.linear_value_head_dim}),i.push(je(`layers.${u}.gate_proj`,`model.layers.${u}.mlp.gate_proj.MatMul.weight`,t,n,d),je(`layers.${u}.up_proj`,`model.layers.${u}.mlp.up_proj.MatMul.weight`,t,n,d),je(`layers.${u}.down_proj`,`model.layers.${u}.mlp.down_proj.MatMul.weight`,n,t),{id:`layers.${u}.post_attention_layernorm`,name:`model.layers.${u}.post_attention_layernorm.weight`,length:t})}return i.push({id:"model_norm",name:`model.layers.${e2.num_hidden_layers}.final_norm_layernorm.weight`,length:t},{id:"lm_head",name:"lm_head.weight",length:e2.vocab_size*t}),i}function je(e2,t,n,r,s){return{id:e2,name:t,length:n*r,packedGroup:s,shape:[n,r],transform:gc}}function Qw(e2){if(!Object.hasOwn(e2,"text_config"))return e2;if(!e2.text_config||typeof e2.text_config!="object")throw new Error("Qwen3_5Config.text_config must be an object");let t=e2.text_config;return{...t,architectures:e2.architectures??t.architectures,eos_token_id:e2.eos_token_id??t.eos_token_id,bos_token_id:e2.bos_token_id??t.bos_token_id,pad_token_id:e2.pad_token_id??t.pad_token_id}}function Dw(e2){let t=e2.rope_parameters;return{rope_theta:t.rope_theta,rope_type:t.rope_type,partial_rotary_factor:t.partial_rotary_factor,mrope_interleaved:t.mrope_interleaved,mrope_section:t.mrope_section}}var ir,$t,li=P(()=>{"use strict";Id();Na();Ot();wt();fs();ai();ii();Gt();os();ir=class{vocab_size;hidden_size;intermediate_size;num_hidden_layers;num_attention_heads;num_key_value_heads;head_dim;linear_conv_kernel_dim;linear_key_head_dim;linear_value_head_dim;linear_num_key_heads;linear_num_value_heads;hidden_act;max_position_embeddings;initializer_range;rms_norm_eps;use_cache;tie_word_embeddings;attention_bias;attention_dropout;mlp_bias;rope_parameters;full_attention_interval;layer_types;pad_token_id;bos_token_id;eos_token_id;attention_qk_norm;attn_output_gate;model_type;attention_size;kv_size;linear_key_dim;linear_value_dim;linear_conv_dim;rotary_dim;qwen35_partial_rotary;constructor(t={}){let n=Qw(t);this.vocab_size=Ie(n,"vocab_size","Qwen3_5Config"),this.hidden_size=Ie(n,"hidden_size","Qwen3_5Config"),this.intermediate_size=Ie(n,"intermediate_size","Qwen3_5Config"),this.num_hidden_layers=Ie(n,"num_hidden_layers","Qwen3_5Config"),this.num_attention_heads=Ie(n,"num_attention_heads","Qwen3_5Config"),this.num_key_value_heads=n.num_key_value_heads,this.head_dim=n.head_dim,this.linear_conv_kernel_dim=Ie(n,"linear_conv_kernel_dim","Qwen3_5Config"),this.linear_key_head_dim=Ie(n,"linear_key_head_dim","Qwen3_5Config"),this.linear_value_head_dim=Ie(n,"linear_value_head_dim","Qwen3_5Config"),this.linear_num_key_heads=Ie(n,"linear_num_key_heads","Qwen3_5Config"),this.linear_num_value_heads=Ie(n,"linear_num_value_heads","Qwen3_5Config"),this.hidden_act=n.hidden_act,this.max_position_embeddings=Ie(n,"max_position_embeddings","Qwen3_5Config"),this.initializer_range=n.initializer_range,this.rms_norm_eps=n.rms_norm_eps,this.use_cache=n.use_cache,this.tie_word_embeddings=n.tie_word_embeddings,this.attention_bias=n.attention_bias,this.attention_dropout=n.attention_dropout,this.mlp_bias=n.mlp_bias,this.rope_parameters=Dw(n),this.full_attention_interval=n.full_attention_interval,this.layer_types=n.layer_types,this.pad_token_id=n.pad_token_id,this.bos_token_id=n.bos_token_id,this.eos_token_id=n.eos_token_id,this.attention_qk_norm=true,this.attn_output_gate=true,this.model_type="qwen3_5_text",this.attention_size=this.num_attention_heads*this.head_dim,this.kv_size=this.num_key_value_heads*this.head_dim,this.linear_key_dim=this.linear_num_key_heads*this.linear_key_head_dim,this.linear_value_dim=this.linear_num_value_heads*this.linear_value_head_dim,this.linear_conv_dim=2*this.linear_key_dim+this.linear_value_dim,this.rotary_dim=n.rotary_dim,this.qwen35_partial_rotary=true,this.validate()}validate(){if(Vr(this,["vocab_size","hidden_size","intermediate_size","num_hidden_layers","num_attention_heads","num_key_value_heads","head_dim","max_position_embeddings","linear_conv_kernel_dim","linear_key_head_dim","linear_value_head_dim","linear_num_key_heads","linear_num_value_heads","attention_size","kv_size","linear_key_dim","linear_value_dim","linear_conv_dim","rotary_dim"],"Qwen3_5Config"),this.hidden_act!=="silu")throw new Error(`Unsupported Qwen3_5 hidden_act for V1: ${this.hidden_act}`);if(this.attention_bias||this.mlp_bias)throw new Error("Qwen3_5 V1 does not support attention_bias or mlp_bias");if(this.attention_dropout!==0)throw new Error("Qwen3_5 V1 only supports attention_dropout=0");if(this.rope_parameters.rope_type!=="default")throw new Error("Qwen3_5 V1 only supports default RoPE");if(this.num_attention_heads%this.num_key_value_heads!==0)throw new Error("Qwen3_5Config num_attention_heads must be divisible by num_key_value_heads");if(this.head_dim%2!==0)throw new Error("Qwen3_5Config head_dim must be even for RoPE");if(this.rotary_dim%2!==0||this.rotary_dim>this.head_dim)throw new Error("Qwen3_5Config rotary_dim must be even and <= head_dim");if(this.linear_num_value_heads%this.linear_num_key_heads!==0)throw new Error("Qwen3_5Config linear_num_value_heads must be a multiple of linear_num_key_heads");if(this.linear_conv_kernel_dim<2)throw new Error("Qwen3_5Config linear_conv_kernel_dim must be >= 2");if(!Array.isArray(this.layer_types)||this.layer_types.length!==this.num_hidden_layers)throw new Error("Qwen3_5Config.layer_types length must match num_hidden_layers");if(this.layer_types.some(t=>t!=="linear_attention"&&t!=="full_attention"))throw new Error("Qwen3_5Config.layer_types entries must be linear_attention or full_attention");for(let[t,n]of[["hidden_size",this.hidden_size],["intermediate_size",this.intermediate_size],["attention_size",this.attention_size],["linear_value_dim",this.linear_value_dim]])if(n%4!==0)throw new Error(`Qwen3_5Config.${t} must be divisible by 4`)}toJSON(){return{...this,rope_parameters:{...this.rope_parameters}}}},$t=class extends Zt{static ConfigClass=ir;static MODEL_NAME="Qwen3_5";static expectedWeightEntries=xw;static DECODE_GRAPH_EMIT=(t,n)=>sr(t,n,0);static async loadGGUFFile(t,n,r={}){let{readGGUFFile:s}=await Promise.resolve().then(()=>(ys(),Do));return this.loadGGUF(t,{gguf:await s(n),onProgress:r.onProgress})}static async loadGGUF(t,{gguf:n,onProgress:r}){let{eagerGGUFModel:s}=await Promise.resolve().then(()=>(ys(),Do)),{QWEN35_GGUF_LIFECYCLE:a}=await Promise.resolve().then(()=>(ui(),xd));return s(n,{onProgress:r},a).load(t)}async forward(){throw new Error("Qwen3_5ForCausalLM.forward is not supported yet; use generate/streamTokenIds")}async generate(t){return super.generate({...t,force_token_path:true})}async*streamTokenIds(t){yield*super.streamTokenIds({...t,force_token_path:true})}async*streamTokenIdsFromCache(t){yield*super.streamTokenIdsFromCache({...t,force_token_path:true})}makeGraphDecodeSession(t){return new Ls(this,t)}prefillSupported(){return false?false:ar(this)}makeGraphPrefillSession(t,n){return new qs(this,t,n)}prefillMinTokens(){let t=this.runtime.device.features;return qe(this)?super.prefillMinTokens():t.has("shader-f16")&&this.weights.dtype==="float16"?0:257}planPrefillChunks(t,n,r){let s=this.runtime.device,a=s.adapterInfo,o=s.features.has("shader-f16")&&s.features.has("subgroups")&&s.features.has("chromium-experimental-subgroup-matrix")&&a.subgroupMinSize===32&&a.subgroupMaxSize===32,i=!o,u=void 0;return u!=="0"&&qe(this)&&(i||o)?u===void 0||u==="m32"?Qc({tokenCount:t,position:n,maxLength:r,shortBlock:16,normalMinTokens:super.prefillMinTokens(),bucketMinTokens:27,bucketMaxTokens:32,bucketBlock:32}):xc({tokenCount:t,position:n,maxLength:r,shortBlock:16,normalMinTokens:super.prefillMinTokens()}):super.planPrefillChunks(t,n,r)}}});Hs();var Lp=class{constructor(e2){this.trie=this._build_trie(e2)}_build_trie(e2){let t=Object.create(null);for(let n of e2){let r=t;for(let s=0;s<n.length;++s){let a=n[s];r=r[a]??=Object.create(null)}r.end=n}return t}split(e2){let t=[],n=e2.length,r=0,s=0;for(;s<n;){let a=this.trie,o=null,i=s;for(;i<n&&(a=a[e2[i]]);)a.end&&(o=a.end),++i;o?(s>r&&t.push(e2.slice(r,s)),t.push(o),s+=o.length,r=s):++s}return r<n&&t.push(e2.slice(r)),t}},Ci=Lp,qp=class{constructor(e2){this.content=e2.content,this.id=e2.id,this.single_word=e2.single_word??false,this.lstrip=e2.lstrip??false,this.rstrip=e2.rstrip??false,this.special=e2.special??false,this.normalized=e2.normalized??!this.special}},Rp=qp,xi=(()=>{let e2=[...Array.from({length:94},(s,a)=>a+33),...Array.from({length:12},(s,a)=>a+161),...Array.from({length:82},(s,a)=>a+174)],t=e2.slice(),n=0;for(let s=0;s<256;++s)e2.includes(s)||(e2.push(s),t.push(256+n),n+=1);let r=t.map(s=>String.fromCharCode(s));return Object.fromEntries(e2.map((s,a)=>[s,r[a]]))})(),Mp=e2=>Object.fromEntries(Object.entries(e2).map(([t,n])=>[n,t])),Kp=Mp(xi),Si=".,!?…。，、।۔،",Op=new Map([["(?i:'s|'t|'re|'ve|'m|'ll|'d)","(?:'([sS]|[tT]|[rR][eE]|[vV][eE]|[mM]|[lL][lL]|[dD]))"],["(?i:[sdmt]|ll|ve|re)","(?:[sS]|[dD]|[mM]|[tT]|[lL][lL]|[vV][eE]|[rR][eE])"],["[^\\r\\n\\p{L}\\p{N}]?+","[^\\r\\n\\p{L}\\p{N}]?"],["[^\\s\\p{L}\\p{N}]++","[^\\s\\p{L}\\p{N}]+"],["(?>\\p{Nd}{510})","(?:\\p{Nd}{510})"],["\\p{Nd}{3}+","(?:\\p{Nd}{3})+"],["\\G",""],[` ?[^(\\s|[${Si}])]+`,` ?[^\\s${Si}]+`]]),mr="\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E",Fs=e2=>e2.replace(/ \./g,".").replace(/ \?/g,"?").replace(/ \!/g,"!").replace(/ ,/g,",").replace(/ \' /g,"'").replace(/ n't/g,"n't").replace(/ 'm/g,"'m").replace(/ 's/g,"'s").replace(/ 've/g,"'ve").replace(/ 're/g,"'re"),gr=(e2,t=true)=>{if(e2.Regex!==void 0){let n=e2.Regex.replace(/\\([#&~])/g,"$1");n=n.replace(/\\A/g,"^").replace(/\\z/g,"$").replace(/\\Z/g,"(?=\\r?\\n?$)");for(let[r,s]of Op)n=n.replaceAll(r,s);try{return new RegExp(n,"gu")}catch(r){if(!(r instanceof SyntaxError)||!r.message.toLowerCase().includes("invalid property name"))throw r;let s=false,a=n.replace(/(\\[pP])\{([^}=]+)\}/g,(o,i,u)=>{try{return new RegExp(`\\p{${u}}`,"u"),`${i}{${u}}`}catch{return s=true,`${i}{Script=${u}}`}});if(!s)throw r;try{return new RegExp(a,"gu")}catch{throw r}}}else if(e2.String!==void 0){let n=Wp(e2.String);return new RegExp(t?n:`(${n})`,"gu")}else return console.warn("Unknown pattern type:",e2),null},Wp=e2=>e2.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),zp=(e2,t,n)=>{let r=[],s=0;for(;s<e2.length;){if(r.push(e2[s]),(t.get(e2[s])??n)!==n){++s;continue}for(;++s<e2.length&&(t.get(e2[s])??n)===n;)t.get(r.at(-1))!==n&&(r[r.length-1]+=e2[s])}return r},Hp=e2=>e2>=19968&&e2<=40959||e2>=13312&&e2<=19903||e2>=131072&&e2<=173791||e2>=173824&&e2<=177983||e2>=177984&&e2<=178207||e2>=178208&&e2<=183983||e2>=63744&&e2<=64255||e2>=194560&&e2<=195103,Up=e2=>Number.isInteger(e2)||typeof e2=="bigint",Fp=e2=>{let t=0;for(let n of e2)++t;return t},Zp=e2=>Qi(e2.toLowerCase()),Xe=(...e2)=>Array.prototype.concat.apply([],e2),Zs=e2=>new Map(Object.entries(e2)),$p=(e2,t)=>{let n=[],r=0;for(let s of e2.matchAll(t)){let a=s[0];r<s.index&&n.push(e2.slice(r,s.index)),a.length>0&&n.push(a),r=s.index+a.length}return r<e2.length&&n.push(e2.slice(r)),n},Qi=e2=>e2.replace(/\p{M}/gu,""),Bi=(e2,t,n=[])=>{if(!e2||Array.isArray(e2)||typeof e2!="object")return`${t} must be a valid object`;for(let r of n)if(!(r in e2))return`${t} must contain a "${r}" property`;return null},Np=e2=>e2.match(/\S+/g)||[],jp=class{constructor(){let e2=function(...t){return e2._call(...t)};return Object.setPrototypeOf(e2,new.target.prototype)}},Sn=jp,Vp=class extends Sn{constructor(e2){super(),this.config=e2}_call(e2){return this.normalize(e2)}},gt=Vp,Yp=class extends gt{tokenize_chinese_chars(e2){let t=[];for(let n=0;n<e2.length;++n){let r=e2[n],s=r.charCodeAt(0);Hp(s)?(t.push(" "),t.push(r),t.push(" ")):t.push(r)}return t.join("")}strip_accents(e2){return e2.normalize("NFD").replace(/\p{Mn}/gu,"")}is_control(e2){switch(e2){case"	":case`
`:case"\r":return false;default:return/^\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}$/u.test(e2)}}clean_text(e2){let t=[];for(let n of e2){let r=n.charCodeAt(0);r===0||r===65533||this.is_control(n)||(/^\s$/.test(n)?t.push(" "):t.push(n))}return t.join("")}normalize(e2){return this.config.clean_text&&(e2=this.clean_text(e2)),this.config.handle_chinese_chars&&(e2=this.tokenize_chinese_chars(e2)),this.config.lowercase?(e2=e2.toLowerCase(),this.config.strip_accents!==false&&(e2=this.strip_accents(e2))):this.config.strip_accents&&(e2=this.strip_accents(e2)),e2}},Xp=Yp,Jp=class extends gt{constructor(e2){super(e2),this.charsmap=e2.precompiled_charsmap??null}normalize(e2){return e2=e2.replace(/[\u0001-\u0008\u000B\u000E-\u001F\u007F\u008F\u009F]/gm,""),e2=e2.replace(/[\u0009\u000A\u000C\u000D\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u2581\u3000\uFEFF\uFFFD]/gm," "),e2.includes("～")?e2=e2.split("～").map(n=>n.normalize("NFKC")).join("～"):e2=e2.normalize("NFKC"),e2}},ef=Jp,tf=class extends gt{constructor(e2){super(e2),this.normalizers=(e2.normalizers??[]).map(t=>Di(t))}normalize(e2){return this.normalizers.reduce((t,n)=>n?n.normalize(t):t,e2)}},nf=tf,rf=class extends gt{normalize(e2){let t=gr(this.config.pattern??{});return t===null?e2:e2.replaceAll(t,this.config.content??"")}},sf=rf,af=class extends gt{constructor(){super(...arguments),this.form="NFC"}normalize(e2){return e2=e2.normalize(this.form),e2}},Ar=af,of=class extends Ar{constructor(){super(...arguments),this.form="NFC"}},uf=of,lf=class extends Ar{constructor(){super(...arguments),this.form="NFD"}},cf=lf,df=class extends Ar{constructor(){super(...arguments),this.form="NFKC"}},pf=df,ff=class extends Ar{constructor(){super(...arguments),this.form="NFKD"}},mf=ff,gf=class extends gt{normalize(e2){return this.config.strip_left&&this.config.strip_right?e2=e2.trim():(this.config.strip_left&&(e2=e2.trimStart()),this.config.strip_right&&(e2=e2.trimEnd())),e2}},Af=gf,hf=class extends gt{normalize(e2){return Qi(e2)}},_f=hf,wf=class extends gt{normalize(e2){return e2.toLowerCase()}},yf=wf,bf=class extends gt{normalize(e2){return e2=this.config.prepend+e2,e2}},kf=bf;function vf(e2){if(e2===null)return null;switch(e2.type){case"BertNormalizer":return new Xp(e2);case"Precompiled":return new ef(e2);case"Sequence":return new nf(e2);case"Replace":return new sf(e2);case"NFC":return new uf(e2);case"NFD":return new cf(e2);case"NFKC":return new pf(e2);case"NFKD":return new mf(e2);case"Strip":return new Af(e2);case"StripAccents":return new _f(e2);case"Lowercase":return new yf(e2);case"Prepend":return new kf(e2);default:throw new Error(`Unknown Normalizer type: ${e2.type}`)}}var Di=vf,Cf=class extends Sn{pre_tokenize(e2,t){return(Array.isArray(e2)?e2.map(n=>this.pre_tokenize_text(n,t)):this.pre_tokenize_text(e2,t)).flat()}_call(e2,t){return this.pre_tokenize(e2,t)}},Je=Cf,Sf=class extends Je{constructor(e2){super(),this.config=e2,this.add_prefix_space=this.config.add_prefix_space??false,this.trim_offsets=this.config.trim_offsets??false,this.use_regex=this.config.use_regex??true,this.pattern=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,this.byte_encoder=xi,this.text_encoder=new TextEncoder}pre_tokenize_text(e2,t){return this.add_prefix_space&&!e2.startsWith(" ")&&(e2=" "+e2),(this.use_regex?e2.match(this.pattern)||[]:[e2]).map(r=>Array.from(this.text_encoder.encode(r),s=>this.byte_encoder[s]).join(""))}},Bf=Sf,If=class extends Je{pre_tokenize_text(e2,t){return e2.match(/\w+|[^\w\s]+/g)||[]}},Tf=If,Ef=class extends Je{constructor(e2){super(),this.replacement=e2.replacement??"▁",this.str_rep=e2.str_rep||this.replacement,this.prepend_scheme=e2.prepend_scheme??"always"}pre_tokenize_text(e2,t){let{section_index:n=void 0}=t??{},r=e2.replaceAll(" ",this.str_rep);return!r.startsWith(this.replacement)&&(this.prepend_scheme==="always"||this.prepend_scheme==="first"&&n===0)&&(r=this.str_rep+r),[r]}},Gf=Ef,xf=class extends Je{constructor(e2){super(),this.config=e2,this.pattern=gr(this.config.pattern??{},this.config.invert??true)}pre_tokenize_text(e2){return this.pattern===null?[]:this.config.invert?e2.match(this.pattern)||[]:this.config.behavior?.toLowerCase()==="removed"?e2.split(this.pattern).filter(t=>t):$p(e2,this.pattern)}},Qf=xf,Df=class extends Je{constructor(e2){super(),this.config=e2,this.pattern=new RegExp(`[^${mr}]+|[${mr}]+`,"gu")}pre_tokenize_text(e2){return e2.match(this.pattern)||[]}},Pf=Df,Lf=class extends Je{constructor(e2){super(),this.config=e2;let t=`[^\\d]+|\\d${this.config.individual_digits?"":"+"}`;this.pattern=new RegExp(t,"gu")}pre_tokenize_text(e2){return e2.match(this.pattern)||[]}},qf=Lf,Rf=class extends Je{constructor(){super(),this.pattern=new RegExp(`[^\\s${mr}]+|[${mr}]`,"gu")}pre_tokenize_text(e2,t){return e2.trim().match(this.pattern)||[]}},Mf=Rf,Kf=class extends Je{constructor(e2){super(),this.config=e2,this.pattern=gr(this.config.pattern??{}),this.content=this.config.content??""}pre_tokenize_text(e2){return this.pattern===null?[e2]:[e2.replaceAll(this.pattern,this.config.content??"")]}},Of=Kf,Wf=class extends Je{constructor(e2){super(),this.tokenizers=(e2.pretokenizers??[]).map(t=>Pi(t))}pre_tokenize_text(e2,t){return this.tokenizers.reduce((n,r)=>r?r.pre_tokenize(n,t):n,[e2])}},zf=Wf,Hf=class extends Je{pre_tokenize_text(e2){return Np(e2)}},Uf=Hf,Ff=class extends Je{constructor(e2){super(),this.config=e2,this._length=e2.length}pre_tokenize_text(e2){let t=[];for(let n=0;n<e2.length;n+=this._length)t.push(e2.slice(n,n+this._length));return t}},Zf=Ff;function $f(e2){if(e2===null)return null;switch(e2.type){case"BertPreTokenizer":return new Mf;case"Sequence":return new zf(e2);case"Whitespace":return new Tf;case"WhitespaceSplit":return new Uf;case"Metaspace":return new Gf(e2);case"ByteLevel":return new Bf(e2);case"Split":return new Qf(e2);case"Punctuation":return new Pf(e2);case"Digits":return new qf(e2);case"Replace":return new Of(e2);case"FixedLength":return new Zf(e2);default:throw new Error(`Unknown PreTokenizer type: ${e2.type}`)}}var Pi=$f,Nf=class extends Sn{constructor(e2){super(),this.config=e2,this.vocab=[],this.tokens_to_ids=new Map,this.unk_token_id=void 0,this.unk_token=void 0,this.end_of_word_suffix=void 0,this.fuse_unk=this.config.fuse_unk??false}_call(e2){let t=this.encode(e2);return this.fuse_unk&&(t=zp(t,this.tokens_to_ids,this.unk_token_id)),t}},hr=Nf,jf=class extends hr{constructor(e2){super(e2),this.max_input_chars_per_word=100,this.tokens_to_ids=Zs(e2.vocab),this.unk_token_id=this.tokens_to_ids.get(e2.unk_token),this.unk_token=e2.unk_token,this.max_input_chars_per_word=e2.max_input_chars_per_word??100,this.vocab=new Array(this.tokens_to_ids.size);for(let[t,n]of this.tokens_to_ids)this.vocab[n]=t}encode(e2){let t=[];for(let n of e2){let r=[...n];if(r.length>this.max_input_chars_per_word){t.push(this.unk_token);continue}let s=false,a=0,o=[];for(;a<r.length;){let i=r.length,u=null;for(;a<i;){let l=r.slice(a,i).join("");if(a>0&&(l=this.config.continuing_subword_prefix+l),this.tokens_to_ids.has(l)){u=l;break}--i}if(u===null){s=true;break}o.push(u),a=i}s?t.push(this.unk_token):t.push(...o)}return t}},Ii=jf,Ti=class Li{constructor(t,n){this.is_leaf=t,this.children=n}static default(){return new Li(false,new Map)}},Vf=class{constructor(){this.root=Ti.default()}extend(e2){for(let t of e2)this.push(t)}push(e2){let t=this.root;for(let n of e2){let r=t.children.get(n);r===void 0&&(r=Ti.default(),t.children.set(n,r)),t=r}t.is_leaf=true}*common_prefix_search(e2){let t=this.root;if(t===void 0)return;let n="";for(let r of e2){if(n+=r,t=t.children.get(r),t===void 0)return;t.is_leaf&&(yield n)}}},Yf=Vf,Us=class qi{constructor(t,n,r,s,a){this.token_id=t,this.node_id=n,this.pos=r,this.length=s,this.score=a,this.prev=null,this.backtrace_score=0}clone(){let t=new qi(this.token_id,this.node_id,this.pos,this.length,this.score);return t.prev=this.prev,t.backtrace_score=this.backtrace_score,t}},Xf=class{constructor(e2,t,n){this.chars=Array.from(e2),this.len=this.chars.length,this.bos_token_id=t,this.eos_token_id=n,this.nodes=[],this.begin_nodes=Array.from({length:this.len+1},()=>[]),this.end_nodes=Array.from({length:this.len+1},()=>[]);let r=new Us(this.bos_token_id??0,0,0,0,0),s=new Us(this.eos_token_id??0,1,this.len,0,0);this.nodes.push(r.clone()),this.nodes.push(s.clone()),this.begin_nodes[this.len].push(s),this.end_nodes[0].push(r)}insert(e2,t,n,r){let s=this.nodes.length,a=new Us(r,s,e2,t,n);this.begin_nodes[e2].push(a),this.end_nodes[e2+t].push(a),this.nodes.push(a)}viterbi(){let e2=this.len,t=0;for(;t<=e2;){if(this.begin_nodes[t].length==0)return[];for(let o of this.begin_nodes[t]){o.prev=null;let i=0,u=null;for(let l of this.end_nodes[t]){let c=l.backtrace_score+o.score;(u===null||c>i)&&(u=l.clone(),i=c)}if(u!==null)o.prev=u,o.backtrace_score=i;else return[]}++t}let n=[],s=this.begin_nodes[e2][0].prev;if(s===null)return[];let a=s.clone();for(;a.prev!==null;)n.push(a.clone()),a=a.clone().prev.clone();return n.reverse(),n}piece(e2){return this.chars.slice(e2.pos,e2.pos+e2.length).join("")}tokens(){return this.viterbi().map(t=>this.piece(t))}token_ids(){return this.viterbi().map(t=>t.token_id)}},Jf=Xf;function em(e2){if(e2.length===0)throw new Error("Array must not be empty");let t=e2[0],n=0;for(let r=1;r<e2.length;++r)e2[r]<t&&(t=e2[r],n=r);return[t,n]}var tm=class extends hr{constructor(e2,t){super(e2);let n=e2.vocab.length;this.vocab=new Array(n),this.scores=new Array(n);for(let r=0;r<n;++r)[this.vocab[r],this.scores[r]]=e2.vocab[r];this.unk_token_id=e2.unk_id,this.unk_token=this.vocab[e2.unk_id],this.tokens_to_ids=new Map(this.vocab.map((r,s)=>[r,s])),this.bos_token=" ",this.bos_token_id=this.tokens_to_ids.get(this.bos_token),this.eos_token=t,this.eos_token_id=this.tokens_to_ids.get(this.eos_token),this.unk_token=this.vocab[this.unk_token_id],this.min_score=em(this.scores)[0],this.unk_score=this.min_score-10,this.scores[this.unk_token_id]=this.unk_score,this.trie=new Yf,this.trie.extend(this.vocab),this.fuse_unk=true}populate_nodes(e2){let t=e2.chars,n=1,r=0;for(;r<t.length;){let s=false,a=[],o=t.slice(r).join(""),i=this.trie.common_prefix_search(o);for(let u of i){a.push(u);let l=this.tokens_to_ids.get(u),c=this.scores[l],d=Fp(u);e2.insert(r,d,c,l),!s&&d===n&&(s=true)}s||e2.insert(r,n,this.unk_score,this.unk_token_id),r+=n}}tokenize(e2){let t=new Jf(e2,this.bos_token_id,this.eos_token_id);return this.populate_nodes(t),t.tokens()}encode(e2){let t=[];for(let n of e2){let r=this.tokenize(n);t.push(...r)}return t}},Ei=tm,nm=class{constructor(e2=(n,r)=>n>r,t=1/0){this._heap=[],this._comparator=e2,this._max_size=t}get size(){return this._heap.length}is_empty(){return this.size===0}peek(){return this._heap[0]}push(...e2){return this.extend(e2)}extend(e2){for(let t of e2)if(this.size<this._max_size)this._heap.push(t),this._sift_up();else{let n=this._smallest();this._comparator(t,this._heap[n])&&(this._heap[n]=t,this._sift_up_from(n))}return this.size}pop(){let e2=this.peek(),t=this.size-1;return t>0&&this._swap(0,t),this._heap.pop(),this._sift_down(),e2}replace(e2){let t=this.peek();return this._heap[0]=e2,this._sift_down(),t}_parent(e2){return(e2+1>>>1)-1}_left(e2){return(e2<<1)+1}_right(e2){return e2+1<<1}_greater(e2,t){return this._comparator(this._heap[e2],this._heap[t])}_swap(e2,t){let n=this._heap[e2];this._heap[e2]=this._heap[t],this._heap[t]=n}_sift_up(){this._sift_up_from(this.size-1)}_sift_up_from(e2){for(;e2>0&&this._greater(e2,this._parent(e2));)this._swap(e2,this._parent(e2)),e2=this._parent(e2)}_sift_down(){let e2=0;for(;this._left(e2)<this.size&&this._greater(this._left(e2),e2)||this._right(e2)<this.size&&this._greater(this._right(e2),e2);){let t=this._right(e2)<this.size&&this._greater(this._right(e2),this._left(e2))?this._right(e2):this._left(e2);this._swap(e2,t),e2=t}}_smallest(){return 2**Math.floor(Math.log2(this.size))-1}},rm=nm,sm=class{constructor(e2){this.capacity=e2,this.cache=new Map}get(e2){if(!this.cache.has(e2))return;let t=this.cache.get(e2);return this.cache.delete(e2),this.cache.set(e2,t),t}put(e2,t){this.cache.has(e2)&&this.cache.delete(e2),this.cache.set(e2,t),this.cache.size>this.capacity&&this.cache.delete(this.cache.keys().next().value)}clear(){this.cache.clear()}},am=sm,om=class extends hr{constructor(e2){super(e2),this.tokens_to_ids=Zs(e2.vocab),this.unk_token_id=this.tokens_to_ids.get(e2.unk_token),this.unk_token=e2.unk_token,this.vocab=new Array(this.tokens_to_ids.size);for(let[n,r]of this.tokens_to_ids)this.vocab[r]=n;let t=Array.isArray(e2.merges[0]);this.merges=t?e2.merges:e2.merges.map(n=>n.split(" ",2)),this.bpe_ranks=new Map(this.merges.map((n,r)=>[JSON.stringify(n),r])),this.end_of_word_suffix=e2.end_of_word_suffix,this.continuing_subword_suffix=e2.continuing_subword_suffix??null,this.byte_fallback=this.config.byte_fallback??false,this.byte_fallback&&(this.text_encoder=new TextEncoder),this.ignore_merges=this.config.ignore_merges??false,this.max_length_to_cache=256,this.cache_capacity=1e4,this.cache=new am(this.cache_capacity)}clear_cache(){this.cache.clear()}bpe(e2){if(e2.length===0)return[];let t=this.cache.get(e2);if(t!==void 0)return t;let n=Array.from(e2);this.end_of_word_suffix&&(n[n.length-1]+=this.end_of_word_suffix);let r=[];if(n.length>1){let s=new rm((i,u)=>i.score<u.score),a={token:n[0],bias:0,prev:null,next:null},o=a;for(let i=1;i<n.length;++i){let u={bias:i/n.length,token:n[i],prev:o,next:null};o.next=u,this.add_node(s,o),o=u}for(;!s.is_empty();){let i=s.pop();if(i.deleted||!i.next||i.next.deleted)continue;if(i.deleted=true,i.next.deleted=true,i.prev){let l={...i.prev};i.prev.deleted=true,i.prev=l,l.prev?l.prev.next=l:a=l}let u={token:i.token+i.next.token,bias:i.bias,prev:i.prev,next:i.next.next};u.prev?(u.prev.next=u,this.add_node(s,u.prev)):a=u,u.next&&(u.next.prev=u,this.add_node(s,u))}for(let i=a;i!==null;i=i.next)r.push(i.token)}else r=n;if(this.continuing_subword_suffix)for(let s=0;s<r.length-1;++s)r[s]+=this.continuing_subword_suffix;return e2.length<this.max_length_to_cache&&this.cache.put(e2,r),r}add_node(e2,t){let n=this.bpe_ranks.get(JSON.stringify([t.token,t.next.token]));n!==void 0&&(t.score=n+t.bias,e2.push(t))}encode(e2){let t=[];for(let n of e2){if(this.ignore_merges&&this.tokens_to_ids.has(n)){t.push(n);continue}let r=this.bpe(n);for(let s of r)if(this.tokens_to_ids.has(s))t.push(s);else if(this.byte_fallback){let a=Array.from(this.text_encoder.encode(s)).map(o=>`<0x${o.toString(16).toUpperCase().padStart(2,"0")}>`);a.every(o=>this.tokens_to_ids.has(o))?t.push(...a):this.unk_token!=null&&t.push(this.unk_token)}else this.unk_token!=null&&t.push(this.unk_token)}return t}},Gi=om,im=class extends hr{constructor(e2,t){super(e2);let n=e2.vocab;this.tokens_to_ids=Zs(t.target_lang?n[t.target_lang]:n),this.bos_token=t.bos_token,this.bos_token_id=this.tokens_to_ids.get(this.bos_token),this.eos_token=t.eos_token,this.eos_token_id=this.tokens_to_ids.get(this.eos_token),this.pad_token=t.pad_token,this.pad_token_id=this.tokens_to_ids.get(this.pad_token),this.unk_token=t.unk_token,this.unk_token_id=this.tokens_to_ids.get(this.unk_token),this.vocab=new Array(this.tokens_to_ids.size);for(let[r,s]of this.tokens_to_ids)this.vocab[s]=r}encode(e2){return e2}},um=im;function lm(e2,t){switch(e2.type){case"WordPiece":return new Ii(e2);case"Unigram":return new Ei(e2,t.eos_token);case"BPE":return new Gi(e2);default:if(e2.vocab)return Array.isArray(e2.vocab)?new Ei(e2,t.eos_token):Object.hasOwn(e2,"continuing_subword_prefix")&&Object.hasOwn(e2,"unk_token")?Object.hasOwn(e2,"merges")?new Gi(e2):new Ii(e2):new um(e2,{target_lang:t.target_lang,bos_token:t.bos_token,eos_token:t.eos_token,pad_token:t.pad_token,unk_token:t.unk_token});throw new Error(`Unknown TokenizerModel type: ${e2?.type}`)}}var cm=lm,dm=class extends Sn{constructor(e2){super(),this.config=e2}_call(e2,...t){return this.post_process(e2,...t)}},Bn=dm,pm=class extends Bn{post_process(e2,t=null,n=true){let r=t===null?this.config.single:this.config.pair,s=[],a=[];for(let o of r)"SpecialToken"in o?n&&(s.push(o.SpecialToken.id),a.push(o.SpecialToken.type_id)):"Sequence"in o&&(o.Sequence.id==="A"?(s=Xe(s,e2),a=Xe(a,new Array(e2.length).fill(o.Sequence.type_id))):o.Sequence.id==="B"&&(s=Xe(s,t),a=Xe(a,new Array(t.length).fill(o.Sequence.type_id))));return{tokens:s,token_type_ids:a}}},fm=pm,mm=class extends Bn{post_process(e2,t=null){return{tokens:e2,tokens_pair:t}}},gm=mm,Am=class extends Bn{constructor(e2){super(e2),this.sep=e2.sep,this.cls=e2.cls}post_process(e2,t=null,n=true){n&&(e2=Xe([this.cls[0]],e2,[this.sep[0]]));let r=new Array(e2.length).fill(0);if(t){let s=[],a=n?[this.sep[0]]:[];e2=Xe(e2,s,t,a),r=Xe(r,new Array(t.length+s.length+a.length).fill(1))}return{tokens:e2,token_type_ids:r}}},hm=Am,_m=class extends Bn{constructor(e2){super(e2),this.sep=e2.sep,this.cls=e2.cls}post_process(e2,t,n=true){n&&(e2=Xe([this.cls[0]],e2,[this.sep[0]]));let r=new Array(e2.length).fill(0);if(t){let s=n?[this.sep[0]]:[],a=n?[this.sep[0]]:[];e2=Xe(e2,s,t,a),r=Xe(r,new Array(t.length+s.length+a.length).fill(1))}return{tokens:e2,token_type_ids:r}}},wm=_m,ym=class extends Bn{constructor(e2){super(e2),this.processors=(e2.processors??[]).map(t=>Ri(t))}post_process(e2,t=null,n=true){let r={tokens:e2,tokens_pair:t};for(let s of this.processors)r=s.post_process(r.tokens,r.tokens_pair,n);return r}},bm=ym;function km(e2){if(e2===null)return null;switch(e2.type){case"TemplateProcessing":return new fm(e2);case"ByteLevel":return new gm(e2);case"BertProcessing":return new hm(e2);case"RobertaProcessing":return new wm(e2);case"Sequence":return new bm(e2);default:throw new Error(`Unknown PostProcessor type: ${e2.type}`)}}var Ri=km,vm=class extends Sn{constructor(e2){super(),this.config=e2,this.added_tokens=[],this.end_of_word_suffix=null,this.trim_offsets="trim_offsets"in e2?e2.trim_offsets:false}_call(e2){return this.decode(e2)}decode(e2){return this.decode_chain(e2).join("")}},it=vm,Cm=class extends it{constructor(e2){super(e2),this.byte_decoder=Kp,this.text_decoder=new TextDecoder("utf-8",{fatal:false,ignoreBOM:true}),this.end_of_word_suffix=null}convert_tokens_to_string(e2){let t=e2.join(""),n=new Uint8Array([...t].map(r=>this.byte_decoder[r]));return this.text_decoder.decode(n)}decode_chain(e2){let t=[],n=[];for(let r of e2)this.added_tokens.find(s=>s.content===r)!==void 0?(n.length>0&&(t.push(this.convert_tokens_to_string(n)),n=[]),t.push(r)):n.push(r);return n.length>0&&t.push(this.convert_tokens_to_string(n)),t}},Sm=Cm,Bm=class extends it{constructor(e2){super(e2),this.cleanup=e2.cleanup}decode_chain(e2){return e2.map((t,n)=>{if(n!==0){let r=this.config.prefix;r&&t.startsWith(r)?t=t.replace(r,""):t=" "+t}return this.cleanup&&(t=Fs(t)),t})}},Im=Bm,Tm=class extends it{constructor(e2){super(e2),this.replacement=e2.replacement??"▁"}decode_chain(e2){let t=[];for(let n=0;n<e2.length;++n){let r=e2[n].replaceAll(this.replacement," ");n==0&&r.startsWith(" ")&&(r=r.substring(1)),t.push(r)}return t}},Em=Tm,Gm=class extends it{constructor(e2){super(e2),this.suffix=e2.suffix??""}decode_chain(e2){return e2.map((t,n)=>t.replaceAll(this.suffix,n===e2.length-1?"":" "))}},xm=Gm,Qm=class extends it{constructor(e2){super(e2),this.pad_token=e2.pad_token??"",this.word_delimiter_token=e2.word_delimiter_token??"",this.cleanup=e2.cleanup}convert_tokens_to_string(e2){if(e2.length===0)return"";let t=[e2[0]];for(let s=1;s<e2.length;++s)e2[s]!==t.at(-1)&&t.push(e2[s]);let r=t.filter(s=>s!==this.pad_token).join("");return this.cleanup&&(r=Fs(r).replaceAll(this.word_delimiter_token," ").trim()),r}decode_chain(e2){return[this.convert_tokens_to_string(e2)]}},Dm=Qm,Pm=class extends it{constructor(e2){super(e2),this.decoders=(e2.decoders??[]).map(t=>Mi(t))}decode_chain(e2){return this.decoders.reduce((t,n)=>n.decode_chain(t),e2)}},Lm=Pm,qm=class extends it{decode_chain(e2){let t=gr(this.config.pattern),n=this.config.content??"";return t===null?e2:e2.map(r=>r.replaceAll(t,n))}},Rm=qm,Mm=class extends it{decode_chain(e2){return[e2.join("")]}},Km=Mm,Om=class extends it{constructor(e2){super(e2),this.content=e2.content??"",this.start=e2.start??0,this.stop=e2.stop??0}decode_chain(e2){return e2.map(t=>{let n=0;for(let s=0;s<this.start&&t[s]===this.content;++s){n=s+1;continue}let r=t.length;for(let s=0;s<this.stop;++s){let a=t.length-s-1;if(t[a]===this.content){r=a;continue}else break}return t.slice(n,r)})}},Wm=Om,zm=class extends it{constructor(e2){super(e2),this.text_decoder=new TextDecoder}decode_chain(e2){let t=[],n=[];for(let r of e2){let s=null;if(r.length===6&&r.startsWith("<0x")&&r.endsWith(">")){let a=parseInt(r.slice(3,5),16);isNaN(a)||(s=a)}if(s!==null)n.push(s);else{if(n.length>0){let a=this.text_decoder.decode(Uint8Array.from(n));t.push(a),n=[]}t.push(r)}}if(n.length>0){let r=this.text_decoder.decode(Uint8Array.from(n));t.push(r),n=[]}return t}},Hm=zm;function Um(e2){if(e2===null)return null;switch(e2.type){case"ByteLevel":return new Sm(e2);case"WordPiece":return new Im(e2);case"Metaspace":return new Em(e2);case"BPEDecoder":return new xm(e2);case"CTC":return new Dm(e2);case"Sequence":return new Lm(e2);case"Replace":return new Rm(e2);case"Fuse":return new Km(e2);case"Strip":return new Wm(e2);case"ByteFallback":return new Hm(e2);default:throw new Error(`Unknown Decoder type: ${e2.type}`)}}var Mi=Um,Fm=class{constructor(e2,t){let n=Bi(e2,"Tokenizer",["model","decoder","post_processor","pre_tokenizer","normalizer"]);if(n)throw new Error(n);let r=Bi(t,"Config");if(r)throw new Error(r);this.tokenizer=e2,this.config=t,this.normalizer=Di(this.tokenizer.normalizer),this.pre_tokenizer=Pi(this.tokenizer.pre_tokenizer),this.model=cm(this.tokenizer.model,this.config),this.post_processor=Ri(this.tokenizer.post_processor),this.decoder=Mi(this.tokenizer.decoder),this.special_tokens=[],this.all_special_ids=[],this.added_tokens=[];let s=[],a=[];this.added_tokens_map=new Map;for(let o of this.tokenizer.added_tokens){let i=new Rp(o);if(this.added_tokens.push(i),this.model.tokens_to_ids.set(i.content,i.id),this.model.vocab[i.id]=i.content,i.special&&(this.special_tokens.push(i.content),this.all_special_ids.push(i.id)),this.added_tokens_map.set(i.content,i),i.normalized&&this.normalizer!==null){let u=this.normalizer(i.content);a.push(u),this.added_tokens_map.set(u,i)}else s.push(i.content)}(this.config.additional_special_tokens??[]).forEach(o=>{this.special_tokens.includes(o)||this.special_tokens.push(o)}),this.decoder&&(this.decoder.added_tokens=this.added_tokens,this.decoder.end_of_word_suffix=this.model.end_of_word_suffix),this.splitter_unnormalized=new Ci(s),this.splitter_normalized=new Ci(a),this.remove_space=this.config.remove_space,this.clean_up_tokenization_spaces=this.config.clean_up_tokenization_spaces??true,this.do_lowercase_and_remove_accent=this.config.do_lowercase_and_remove_accent??false}encode(e2,{text_pair:t=null,add_special_tokens:n=true,return_token_type_ids:r=null}={}){let{tokens:s,token_type_ids:a}=this.tokenize_helper(e2,{text_pair:t,add_special_tokens:n}),o=s.map(u=>this.added_tokens_map.get(u)?.id??this.model.tokens_to_ids.get(u)??this.model.unk_token_id),i={ids:o,tokens:s,attention_mask:new Array(o.length).fill(1)};return r&&a&&(i.token_type_ids=a),i}decode(e2,t={}){if(!Array.isArray(e2)||e2.length===0||!Up(e2[0]))throw Error("token_ids must be a non-empty array of integers.");let n=e2.map(s=>this.model.vocab[Number(s)]??this.model.unk_token);t.skip_special_tokens&&(n=n.filter(s=>!this.special_tokens.includes(s)));let r=this.decoder?this.decoder(n):n.join(" ");return this.decoder&&this.decoder.end_of_word_suffix&&(r=r.replaceAll(this.decoder.end_of_word_suffix," "),t.skip_special_tokens&&(r=r.trim())),(t.clean_up_tokenization_spaces??this.clean_up_tokenization_spaces)&&(r=Fs(r)),r}tokenize(e2,{text_pair:t=null,add_special_tokens:n=false}={}){return this.tokenize_helper(e2,{text_pair:t,add_special_tokens:n}).tokens}encode_text(e2){if(e2===null)return null;let t=this.splitter_unnormalized.split(e2);return t.forEach((n,r)=>{let s=this.added_tokens_map.get(n);s&&(s.lstrip&&r>0&&(t[r-1]=t[r-1].trimEnd()),s.rstrip&&r<t.length-1&&(t[r+1]=t[r+1].trimStart()))}),t.flatMap((n,r)=>{if(n.length===0)return[];if(this.added_tokens_map.has(n))return[n];if(this.remove_space===true&&(n=n.trim().split(/\s+/).join(" ")),this.do_lowercase_and_remove_accent&&(n=Zp(n)),this.normalizer!==null&&(n=this.normalizer(n)),n.length===0)return[];let s=this.splitter_normalized.split(n);return s.forEach((a,o)=>{let i=this.added_tokens_map.get(a);i&&(i.lstrip&&o>0&&(s[o-1]=s[o-1].trimEnd()),i.rstrip&&o<s.length-1&&(s[o+1]=s[o+1].trimStart()))}),s.flatMap(a=>{if(a.length===0)return[];if(this.added_tokens_map.has(a))return[a];let o=this.pre_tokenizer!==null?this.pre_tokenizer(a,{section_index:r}):[a];return this.model(o)})})}tokenize_helper(e2,{text_pair:t=null,add_special_tokens:n=true}){let r=this.encode_text(e2),s=this.encode_text(t||null);return this.post_processor?this.post_processor(r,s,n):{tokens:Xe(r??[],s??[])}}token_to_id(e2){return this.model.tokens_to_ids.get(e2)}id_to_token(e2){return this.model.vocab[e2]}get_added_tokens_decoder(){let e2=new Map;for(let t of this.added_tokens)e2.set(t.id,t);return e2}get_vocab(e2=true){let t=new Map;for(let n=0;n<this.model.vocab.length;++n){let r=this.model.vocab[n];(e2||!this.added_tokens_map.has(r))&&t.set(r,n)}return t}},Ki=Fm;Nu();async function ba(e2={}){let t=globalThis.navigator?.gpu;if(!t)throw new Error("WebGPU is not available in this browser context");let n=await t.requestAdapter({powerPreference:e2.powerPreference??"high-performance"});if(!n)throw new Error("No WebGPU adapter was returned");let r=await n.requestDevice({requiredFeatures:Uu(n,e2.disabledFeatures),requiredLimits:e2.requiredLimits??Zu(n),label:e2.label??"webgpu-ml-runtime"});return r.addEventListener("uncapturederror",s=>{console.error("WebGPU uncaptured error:",s.error)}),$u({gpu:t,adapter:n,device:r,deviceInfo:Fu(r,n,t),destroy:()=>r.destroy()})}wt();Le();function hA(e2){return e2===null||typeof e2!="object"?false:"destroy"in e2&&"mapAsync"in e2&&"getMappedRange"in e2&&!("buffer"in e2)}function St(e2){return hA(e2)?e2:e2.buffer}function ju(e2){if(e2.tensor!==void 0&&e2.tensor!==null)return St(e2.tensor);if(e2.buffer!==void 0&&e2.buffer!==null)return St(e2.buffer);throw new Error(`binding ${e2.binding??"?"} is missing tensor or buffer`)}var Dr=class{pipelines=new Map;physicalPipelines=new Map;pipelineLayouts=new Map;bindGroupLayouts=new Map;bindGroups=new Map;maxBindGroupEntries=4096;bufferIds=new WeakMap;#t=1;captureShaders=false;capturedShaders=new Map;compileCount=0;compileTotalMs=0;#e;constructor(t){this.#e=t}async buildPipeline({cacheKey:t,name:n,entryPoint:r,layoutSignature:s,layoutFactory:a,sourceFactory:o}){let i=this.pipelines.get(t);if(i)return i;let u=await o();this.captureShaders&&!this.capturedShaders.has(n)&&this.capturedShaders.set(n,u);let l=s?this.physicalPipeline(u,r,s):void 0;if(l)return this.pipelines.set(t,l),l;let c=performance.now(),d=this.#e.createShaderModule(u,n),p=a(),f=await this.#e.createComputePipeline({label:n,layout:p,compute:{module:d,entryPoint:r}});return this.compileCount+=1,this.compileTotalMs+=performance.now()-c,this.pipelines.set(t,f),s&&this.setPhysicalPipeline(u,r,s,f),f}cachedBindGroups({name:t,cacheKey:n,pipeline:r,bindings:s}){let a=new Map;for(let l of s){let c=l.group??0,d=a.get(c);d?d.push(l):a.set(c,[l])}let o=[...a.keys()].sort((l,c)=>l-c),i=this.buildGroupBindGroup(t,n,r,0,a.get(0)??[]),u=o.filter(l=>l!==0).map(l=>({group:l,bindGroup:this.buildGroupBindGroup(t,n,r,l,a.get(l))}));return u.length>0?{bindGroup:i,extraBindGroups:u}:{bindGroup:i}}buildGroupBindGroup(t,n,r,s,a){let o=a.map((l,c)=>{let d=ju(l),p={buffer:d,offset:l.offset??0};return l.size!==void 0&&l.size>0&&(p.size=l.size),{binding:l.binding??c,resource:p,cachePart:`${l.binding??c}:${this.bufferId(d)}:${p.offset}:${p.size??""}`}}),i=`${n}|g${s}|${o.map(l=>l.cachePart).join("|")}`,u=this.bindGroups.get(i);if(u===void 0&&(u=this.#e.device.createBindGroup({label:`${t}-bind-group-${s}`,layout:r.getBindGroupLayout(s),entries:o.map(({binding:l,resource:c})=>({binding:l,resource:c}))}),this.bindGroups.set(i,u),this.bindGroups.size>this.maxBindGroupEntries)){let l=this.bindGroups.keys().next().value;l!==void 0&&this.bindGroups.delete(l)}return u}bufferId(t){let n=this.bufferIds.get(t);return n===void 0&&(n=this.#t++,this.bufferIds.set(t,n)),n}pipelineLayout(t,n){let r=Vu(t,n),s=this.pipelineLayouts.get(r.signature);if(s)return s;let a=[];for(let i=0;i<=r.maxGroup;++i)a.push(this.bindGroupLayout(t,i,r.entries));let o=this.#e.device.createPipelineLayout({label:`${t}-layout`,bindGroupLayouts:a});return this.pipelineLayouts.set(r.signature,o),o}pipelineLayoutSignature(t,n){return Vu(t,n).signature}bindGroupLayout(t,n,r){let s=r.filter(u=>u.group===n).map(u=>({binding:u.binding,visibility:GPUShaderStage.COMPUTE,buffer:{type:u.type}})),a=s.map(u=>`${u.binding}:${u.buffer.type}`).sort().join("|"),o=this.bindGroupLayouts.get(a);if(o)return o;let i=this.#e.device.createBindGroupLayout({label:`${t}-bgl${n}`,entries:s});return this.bindGroupLayouts.set(a,i),i}clearBindGroups(){let t=this.bindGroups.size;return this.bindGroups.clear(),t}clearPrograms(){let t=this.pipelines.size;return this.bindGroups.clear(),this.pipelines.clear(),this.physicalPipelines.clear(),this.pipelineLayouts.clear(),this.bindGroupLayouts.clear(),this.captureShaders||this.capturedShaders.clear(),t}getRenderedShaders(){return[...this.capturedShaders].map(([t,n])=>({name:t,source:n}))}physicalPipeline(t,n,r){return this.physicalPipelines.get(Yu(t,n,r))?.find(a=>a.entryPoint===n&&a.layoutSignature===r&&a.source===t)?.pipeline}setPhysicalPipeline(t,n,r,s){let a=Yu(t,n,r),o=this.physicalPipelines.get(a),i={source:t,entryPoint:n,layoutSignature:r,pipeline:s};o?o.push(i):this.physicalPipelines.set(a,[i])}};function Vu(e2,t){let n=t.map((o,i)=>typeof o=="string"?{group:0,binding:i,type:o}:{group:o.group??0,binding:o.binding??i,type:o.type}),r=new Set,s=0;for(let o of n){if(!Number.isInteger(o.binding)||o.binding<0)throw new Error(`pipeline layout ${e2} has invalid binding index ${o.binding}`);if(!Number.isInteger(o.group)||o.group<0)throw new Error(`pipeline layout ${e2} has invalid bind group index ${o.group}`);let i=`${o.group}:${o.binding}`;if(r.has(i))throw new Error(`pipeline layout ${e2} has duplicate binding index ${o.binding} in @group(${o.group})`);if(typeof o.type!="string"||o.type.length===0)throw new Error(`pipeline layout ${e2} binding ${o.binding} is missing a buffer type`);r.add(i),s=Math.max(s,o.group)}let a=n.map(o=>`${o.group}:${o.binding}:${o.type}`).sort();return{signature:`maxGroup=${s}|${a.join("|")}`,maxGroup:s,entries:n}}function Yu(e2,t,n){return`${_A(e2)}:${e2.length}|entry=${t}|layout=${n}`}function _A(e2){let t=2166136261;for(let n=0;n<e2.length;++n)t^=e2.charCodeAt(n),t=Math.imul(t,16777619);return(t>>>0).toString(16).padStart(8,"0")}var Pr=class{pool=new Map;bytes=0;maxBytes;constructor(t=64*1024*1024){this.maxBytes=t}acquire(t,n){let r=this.pool.get(n);return r&&r.length>0?(this.bytes-=n,r.pop()):t.createBuffer({label:"tensor-readback",size:n,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ})}release(t,n){if(this.bytes+t>this.maxBytes){n.destroy();return}let r=this.pool.get(t);r||(r=[],this.pool.set(t,r)),r.push(n),this.bytes+=t}discard(t){try{t.destroy()}catch{}}clear(){let t=0;for(let n of this.pool.values())for(let r of n)r.destroy(),t++;return this.pool.clear(),this.bytes=0,t}};var wA=64*1024,Bt=class{runtime;dtype;shape;byteOffset;buffer;size;byteLength;destroyed;constructor({runtime:t,dtype:n,shape:r,buffer:s,byteOffset:a=0}){this.runtime=t,this.dtype=n,this.shape=r,this.byteOffset=a,this.buffer=s,this.size=ye(r),this.byteLength=this.size*ge(n),this.destroyed=false}destroy(){this.destroyed||(this.buffer.destroy(),this.destroyed=true)}},qr=class{host;pipelines;profileSession;pendingProfileRuns;readback;destroyed;mappedTensorUploadsAvailable;#t=null;#e=Promise.resolve();#n=false;constructor({host:t}){this.host=t,this.pipelines=new Dr(t),this.profileSession=null,this.pendingProfileRuns=[],this.readback=new Pr,this.destroyed=false,this.mappedTensorUploadsAvailable=true}get device(){return this.host.deviceInfo}get captureShaders(){return this.pipelines.captureShaders}set captureShaders(t){this.pipelines.captureShaders=t}getRenderedShaders(){return this.pipelines.getRenderedShaders()}async destroy(){this.destroyed||(this.destroyed=true,this.clearBindGroupCache(),this.clearReadbackPool(),await this.#e,this.#i(),await this.host.destroy())}clearReadbackPool(){return this.readback.clear()}clearBindGroupCache(){return this.pipelines.clearBindGroups()}clearKernelCaches(){return this.pipelines.clearPrograms()}tensorFromTypedArray(t,n,r){if(!yA(t,r))throw new Error("Only float16/Uint16Array, float32/Float32Array and uint32/Uint32Array tensors are supported");let s=ye(n);if(r.length!==s)throw new Error(`tensor data length ${r.length} does not match shape element count ${s}`);let a={label:"tensor",size:Lr(r.byteLength),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC};if(this.mappedTensorUploadsAvailable&&r.byteLength>=wA){let u=null;try{u=this.host.createBuffer({...a,mappedAtCreation:true});let l=u.getMappedRange();return r instanceof Float32Array?new Float32Array(l).set(r):r instanceof Uint16Array?new Uint16Array(l).set(r):r instanceof Int32Array?new Int32Array(l).set(r):new Uint32Array(l).set(r),u.unmap(),new Bt({runtime:this,dtype:t,shape:n,buffer:u})}catch{try{u?.destroy()}catch{}this.mappedTensorUploadsAvailable=false}}let o=this.host.createBuffer(a),i=r;if(r.byteLength%4!==0){let u=new Uint8Array(Lr(r.byteLength));u.set(new Uint8Array(r.buffer,r.byteOffset,r.byteLength)),i=u}return this.host.writeBuffer(o,0,i),new Bt({runtime:this,dtype:t,shape:n,buffer:o})}allocateWeightsBuffer({byteLength:t,dtype:n,shape:r,label:s="weights"}){if(!Xu(n))throw new Error(`Unsupported dtype: ${n}`);if(!Number.isInteger(t)||t<0)throw new Error(`byteLength must be a nonnegative integer, got ${t}`);let a=this.host.createBuffer({label:s,size:t,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC});return new Bt({runtime:this,dtype:n,shape:r,buffer:a})}writeWeightsRange(t,n,r){if(!(t instanceof Bt))throw new Error("writeWeightsRange expects a WebGpuTensor");if(!Number.isInteger(n)||n<0)throw new Error(`byteOffset must be a nonnegative integer, got ${n}`);if(n+r.byteLength>t.byteLength)throw new Error(`write range [${n}, ${n+r.byteLength}] exceeds tensor byteLength ${t.byteLength}`);this.host.writeBuffer(t.buffer,n,r)}async copyBufferToBuffer({src:t,dst:n,srcOffset:r=0,dstOffset:s=0,byteLength:a,wait:o=false}){if(a===0)return;let i=St(t),u=St(n),l=this.host.device.createCommandEncoder({label:"copyBufferToBuffer"});l.copyBufferToBuffer(i,r,u,s,a),await this.host.submit([l.finish()],{wait:o})}clearBuffers(t){let n=null;for(let{dst:r,dstOffset:s=0,byteLength:a}of t){if(!Number.isInteger(s)||s<0||s%4!==0)throw new Error(`clear buffer offset must be a non-negative multiple of 4, got ${s}`);if(!Number.isInteger(a)||a<0||a%4!==0)throw new Error(`clear buffer byteLength must be a non-negative multiple of 4, got ${a}`);a!==0&&(n??=this.host.device.createCommandEncoder({label:"clear-buffers"}),n.clearBuffer(St(r),s,a))}n&&this.host.device.queue.submit([n.finish()])}async queueIdle(){await this.host.device.queue.onSubmittedWorkDone()}empty(t,n,r="tensor-output"){if(!Xu(t))throw new Error(`Unsupported dtype: ${t}`);let s=ye(n)*ge(t),a=this.host.createBuffer({label:r,size:Lr(s),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});return new Bt({runtime:this,dtype:t,shape:n,buffer:a})}readTensor(t){if(t.byteLength===0){let i=et[t.dtype]?.arrayCtor;return i?Promise.resolve(new i(0)):Promise.reject(new Error(`Unsupported dtype: ${t.dtype}`))}let n=Lr(t.byteLength),r=this.readback.acquire(this.host,n),s=this.host.device.createCommandEncoder({label:"readTensor"});s.copyBufferToBuffer(t.buffer,t.byteOffset,r,0,n),this.host.device.queue.submit([s.finish()]);let{dtype:a,byteLength:o}=t;return(async()=>{let i;try{i=await this.host.mapRead(r,0,n)}catch(l){throw this.readback.discard(r),l}this.readback.release(n,r),n!==o&&(i=i.slice(0,o));let u=et[a]?.arrayCtor;if(!u)throw new Error(`Unsupported dtype: ${a}`);return new u(i)})()}async runProgram(t,n={}){await this.runProgramSequence([t],n)}async runProgramSequence(t,n={}){let r=await this.prepareProgramSequence(t);await this.executePreparedProgramSequence(r,n)}async prepareProgramSequence(t){if(!Array.isArray(t)||t.length===0)throw new Error("prepareProgramSequence requires at least one program");let n=[];for(let r of t){if(bA(r)){n.push(kA(r));continue}let{name:s,source:a,entryPoint:o="main",cacheKey:i=s,bindings:u,dispatchWorkgroups:l,profile:c,submitAfter:d}=r;if(typeof a!="string"||a.length===0)throw new Error("program requires WGSL source");if(!Array.isArray(u)||u.length===0)throw new Error("program requires bindings");if(!Array.isArray(l)||l.length!==3)throw new Error("program requires a 3D dispatchWorkgroups array");let p=this.pipelines.pipelineLayoutSignature(s,u),f=await this.pipelines.buildPipeline({name:s,entryPoint:o,cacheKey:i,layoutSignature:p,layoutFactory:()=>this.pipelines.pipelineLayout(s,u),sourceFactory:()=>a}),{bindGroup:g,extraBindGroups:m}=this.pipelines.cachedBindGroups({name:s,cacheKey:i,pipeline:f,bindings:u});n.push({pipeline:f,bindGroup:g,...m?{extraBindGroups:m}:{},dispatchWorkgroups:l,name:s,cacheKey:i,profile:c,...d?{submitAfter:true}:{}})}return n}async executePreparedProgramSequence(t,n={}){if(!Array.isArray(t)||t.length===0)throw new Error("executePreparedProgramSequence requires at least one prepared step");let r=n.wait??false;if(this.profileSession){await this.#s();try{await this._runSteps(t,{wait:r,mergePass:false})}finally{this.#o()}return}await this._runSteps(t,{wait:r,mergePass:true})}preparedProgramSequenceRequiresCompletionFences(t){return t.some(n=>n.kind!=="copy"&&n.submitAfter===true&&!lt(n.dispatchWorkgroups))}#r=8;#a=[];async#s(){for(;this.#r<=0;)await new Promise(t=>this.#a.push(t));this.#r-=1}#l(){return this.#r<=0?false:(this.#r-=1,true)}#o(){this.#r+=1,this.#a.shift()?.()}enqueuePreparedProgramSequence(t){if(!Array.isArray(t)||t.length===0)throw new Error("enqueuePreparedProgramSequence requires at least one prepared step");let n=ka(t);if(this.profileSession&&n.length===1&&this.#l()){let r=this._runSteps(t,{wait:false,mergePass:false});this.pendingProfileRuns.push(r.finally(()=>this.#o()));return}for(let r of n){let s=this.host.device.createCommandEncoder({label:"compute-dispatch"});va(s,r),this.host.device.queue.submit([s.finish()])}}async flushDeferredProfile(){let t=this.pendingProfileRuns;this.pendingProfileRuns=[],await Promise.all(t)}async measurePreparedSequenceGpuMs(t,n=1){if(this.destroyed||!this.host.device.features.has("timestamp-query")||this.#n)return null;let r=this.#e,s;this.#e=new Promise(a=>{s=a}),await r;try{if(this.destroyed||this.#n)return null;let a=this.#t??=this.createTimestampResources(2),o=ka(t);if(o.length>1)return await this.#u(o,n,a);let i=this.host.device.createCommandEncoder({label:"gpu-time-measure"});for(let f of t)f.kind==="copy"&&f.byteLength>0&&i.copyBufferToBuffer(f.src,f.srcOffset,f.dst,f.dstOffset,f.byteLength);let u=i.beginComputePass({label:"gpu-time-pass",timestampWrites:{querySet:a.querySet,beginningOfPassWriteIndex:0,endOfPassWriteIndex:1}}),l=false,c=null,d=null;for(let f=0;f<n;++f)for(let g of t)if(!(g.kind==="copy"||lt(g.dispatchWorkgroups))){if(g.pipeline!==c&&(u.setPipeline(g.pipeline),c=g.pipeline),g.bindGroup!==d&&(u.setBindGroup(0,g.bindGroup),d=g.bindGroup),g.extraBindGroups)for(let m of g.extraBindGroups)u.setBindGroup(m.group,m.bindGroup),m.group===0&&(d=m.bindGroup);u.dispatchWorkgroups(g.dispatchWorkgroups[0],g.dispatchWorkgroups[1],g.dispatchWorkgroups[2]),l=true}if(u.end(),!l)return null;i.resolveQuerySet(a.querySet,0,2,a.resolveBuffer,0),i.copyBufferToBuffer(a.resolveBuffer,0,a.readbackBuffer,0,16),await this.host.submit([i.finish()],{wait:true});let p;try{p=await this.readTimestampBuffer(a.readbackBuffer,2)}catch{return this.#n=true,this.#i(),null}return Number(p[1]-p[0])/1e6}finally{s()}}async#u(t,n,r){if(!Number.isInteger(n)||n<=0)return null;let s=t.findIndex(Ju),a=-1;for(let u=t.length-1;u>=0;--u)if(Ju(t[u])){a=u;break}if(s<0||a<0)return null;let o=[];for(let u=0;u<n;++u)for(let l=0;l<t.length;++l){let c=this.host.device.createCommandEncoder({label:"gpu-time-measure-boundary"}),d=u===0&&l===s,p=u===n-1&&l===a;va(c,t[l],{querySet:r.querySet,...d?{beginningOfSequenceWriteIndex:0}:{},...p?{endOfSequenceWriteIndex:1}:{}}),u===n-1&&l===t.length-1&&(c.resolveQuerySet(r.querySet,0,2,r.resolveBuffer,0),c.copyBufferToBuffer(r.resolveBuffer,0,r.readbackBuffer,0,16)),o.push(c.finish())}for(let u of o)await this.host.submit([u],{wait:true});let i;try{i=await this.readTimestampBuffer(r.readbackBuffer,2)}catch{return this.#n=true,this.#i(),null}return Number(i[1]-i[0])/1e6}#i(){let t=this.#t;this.#t=null,t&&(t.querySet.destroy(),t.resolveBuffer.destroy(),t.readbackBuffer.destroy())}pipelineCompileStats(){return{count:this.pipelines.compileCount,totalMs:this.pipelines.compileTotalMs}}memoryStats(){let t=this.host.memory;return t?{liveBytes:t.liveBytes,peakBytes:t.peakBytes}:null}markMemoryPeak(){this.host.memory?.markPeak()}createUniformU32(t,n){let r=new Uint32Array(t),s=this.host.createBuffer({label:n,size:r.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});return this.host.writeBuffer(s,0,r),s}async _runSteps(t,{wait:n=false,mergePass:r}){let s=!!this.profileSession,a=ka(t);if(!s&&r){let d=a.map(p=>{let f=this.host.device.createCommandEncoder({label:"compute-dispatch"});return va(f,p),f.finish()});for(let p=0;p+1<d.length;++p)await this.host.submit([d[p]],{wait:true});await this.host.submit([d[d.length-1]],{wait:n||el(a[a.length-1])});return}let o=t.map((d,p)=>d.kind==="copy"||lt(d.dispatchWorkgroups)?-1:p).filter(d=>d>=0),i=s?o.length*2:0,u=s&&i>0?this.createTimestampResources(i):void 0,l=0,c=[];for(let d=0;d<a.length;++d){let p=this.host.device.createCommandEncoder({label:s?"profiled-compute-dispatch":"compute-dispatch"});for(let f of a[d]){if(f.kind==="copy"){f.byteLength>0&&p.copyBufferToBuffer(f.src,f.srcOffset,f.dst,f.dstOffset,f.byteLength);continue}if(lt(f.dispatchWorkgroups))continue;let g=p.beginComputePass({label:s?`${f.name??"compute"}-profile-pass`:"compute-pass",...u?{timestampWrites:{querySet:u.querySet,beginningOfPassWriteIndex:l*2,endOfPassWriteIndex:l*2+1}}:{}});if(g.setPipeline(f.pipeline),g.setBindGroup(0,f.bindGroup),f.extraBindGroups)for(let m of f.extraBindGroups)g.setBindGroup(m.group,m.bindGroup);g.dispatchWorkgroups(f.dispatchWorkgroups[0],f.dispatchWorkgroups[1],f.dispatchWorkgroups[2]),g.end(),l+=1}d===a.length-1&&u!==void 0&&(p.resolveQuerySet(u.querySet,0,i,u.resolveBuffer,0),p.copyBufferToBuffer(u.resolveBuffer,0,u.readbackBuffer,0,i*8)),c.push(p.finish())}for(let d=0;d+1<c.length;++d)await this.host.submit([c[d]],{wait:true});if(!s||u===void 0){await this.host.submit([c[c.length-1]],{wait:n||el(a[a.length-1])});return}try{await this.host.submit([c[c.length-1]],{wait:n});let d=await this.readTimestampBuffer(u.readbackBuffer,i);for(let p=0;p<o.length;++p){let f=t[o[p]];!f||f.kind==="copy"||this.profileSession?.record(f,d[p*2],d[p*2+1])}}finally{u.querySet.destroy(),u.resolveBuffer.destroy(),u.readbackBuffer.destroy()}}createTimestampResources(t){let n=t*8,r=this.host.device.createQuerySet({type:"timestamp",count:t}),s=this.host.createBuffer({label:"timestamp-resolve",size:n,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),a=this.host.createBuffer({label:"timestamp-readback",size:n,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});return{querySet:r,resolveBuffer:s,readbackBuffer:a}}async readTimestampBuffer(t,n){let r=await this.host.mapRead(t,0,n*8),s=new BigUint64Array(r);return Array.from(s,a=>a)}};function yA(e2,t){let n=et[e2]?.arrayCtor;return n!==void 0&&t instanceof n}function Xu(e2){return et[e2]!==void 0}function Lr(e2){return Math.max(4,Math.ceil(e2/4)*4)}function bA(e2){return e2.kind==="copy"}function kA(e2){if(!e2.src||!e2.dst)throw new Error("copy step requires src and dst (buffer or tensor)");let t=St(e2.src),n=St(e2.dst),r=e2.srcOffset??0,s=e2.dstOffset??0,a=e2.byteLength;if(!Number.isInteger(a)||a<=0)throw new Error("copy step requires positive integer byteLength");return{kind:"copy",src:t,dst:n,srcOffset:r,dstOffset:s,byteLength:a,name:e2.name??"copy"}}function ka(e2){let t=[],n=0;for(let r=0;r<e2.length;++r){let s=e2[r];s.kind!=="copy"&&s.submitAfter&&!lt(s.dispatchWorkgroups)&&(t.push(e2.slice(n,r+1)),n=r+1)}return n<e2.length&&t.push(e2.slice(n)),t}function Ju(e2){return e2.some(t=>t.kind!=="copy"&&!lt(t.dispatchWorkgroups))}function el(e2){let t=e2[e2.length-1];return t?.kind!=="copy"&&t?.submitAfter===true&&!lt(t.dispatchWorkgroups)}function va(e2,t,n){let r=null,s=t.findIndex(c=>c.kind!=="copy"&&!lt(c.dispatchWorkgroups)),a=s,o=false;for(let c=s+1;c<t.length;++c){let d=t[c];d.kind==="copy"?o=true:!lt(d.dispatchWorkgroups)&&o&&(a=c,o=false)}let i=null,u=null,l=()=>{r!==null&&(r.end(),r=null),i=null,u=null};for(let c=0;c<t.length;++c){let d=t[c];if(d.kind==="copy"){l(),d.byteLength>0&&e2.copyBufferToBuffer(d.src,d.srcOffset,d.dst,d.dstOffset,d.byteLength);continue}if(!lt(d.dispatchWorkgroups)){if(r===null){let p=c===s?n?.beginningOfSequenceWriteIndex:void 0,f=c===a?n?.endOfSequenceWriteIndex:void 0,g=p!==void 0||f!==void 0;r=e2.beginComputePass({label:"compute-sequence-pass",...g?{timestampWrites:{querySet:n.querySet,...p!==void 0?{beginningOfPassWriteIndex:p}:{},...f!==void 0?{endOfPassWriteIndex:f}:{}}}:{}})}if(d.pipeline!==i&&(r.setPipeline(d.pipeline),i=d.pipeline),d.bindGroup!==u&&(r.setBindGroup(0,d.bindGroup),u=d.bindGroup),d.extraBindGroups)for(let p of d.extraBindGroups)r.setBindGroup(p.group,p.bindGroup),p.group===0&&(u=p.bindGroup);r.dispatchWorkgroups(d.dispatchWorkgroups[0],d.dispatchWorkgroups[1],d.dispatchWorkgroups[2])}}l()}function lt(e2){return e2[0]===0||e2[1]===0||e2[2]===0}async function tl(e2={}){let t=e2.host??await ba(e2);return new qr({host:t})}Wa();Ha();var kh="https://huggingface.co";function vh(e2){return typeof e2=="string"&&/^https?:/i.test(e2)}function Ch(e2){return vh(e2)||e2.startsWith("/")||e2.startsWith(".")}function Rl(e2,t={}){let{revision:n="main",file:r}=t,s=r?r.slice(r.lastIndexOf(".")).toLowerCase():"";if(s&&e2.toLowerCase().endsWith(s))return e2;if(Ch(e2))return r?`${Sh(e2)}/${r}`:e2;let a=`${kh}/${e2}/resolve/${n}`;return r?`${a}/${r}`:a}function Sh(e2){return e2.endsWith("/")?e2.slice(0,-1):e2}function Ua(e2){return(t,n={})=>{let r=new Headers(n.headers);return r.set("Authorization",`Bearer ${e2}`),globalThis.fetch(t,{...n,headers:r})}}function Bh(e2,t){let n=Math.min(e2.length,t.length),r=0;for(;r<n&&e2[r]===t[r];)r+=1;return r}function Fr(e2,t,n){return t.length===0?"":e2.decode(t,n)}function Ih(e2,t,n,r=[]){for(let a=r.length;a>=0;--a){let o=[...n,...r.slice(0,a)];if(o.length===0)continue;let i=Fr(e2,o,{skip_special_tokens:false});if(!t.startsWith(i))continue;let u=e2.encode(t.slice(i.length),{add_special_tokens:false}).ids,l=[...o,...u];if(Fr(e2,l,{skip_special_tokens:false})===t)return{fullyEncodedIds:l,inputIds:l,prefixLength:n.length}}let s=e2.encode(t,{add_special_tokens:false}).ids;return{fullyEncodedIds:s,inputIds:s,prefixLength:Bh(n,s)}}var Zr=class{#t;#e=[];#n=[];constructor(t){this.#t=t}get cacheLength(){return this.#e.length}prepare(t){return Ih(this.#t,t,this.#e,this.#n)}commit(t,n,r){let s=[...t,...n];if(!Number.isInteger(r)||r<t.length||r>s.length)throw new Error(`chat token ledger cannot commit cache length ${r} for ${t.length} input + ${n.length} generated tokens`);this.#e=s.slice(0,r),this.#n=s.slice(r)}clear(){this.#e=[],this.#n=[]}};function Ml(e2,t){return e2?.assistantContent?.(t)??t.visibleText}function $r(e2){return typeof e2=="number"&&Number.isFinite(e2)}function Kl(e2){let t=[],n="",r=0,s=0,a=o=>{if(!o.startsWith(n))return"";let i=o.slice(n.length);return n=o,i};return{push(o){t.push(o);let i=e2(t),u=i.length;for(;u>0&&i[u-1]==="�";)u--;let l=u!==i.length;return r=!l||u>s?0:r+1,s=u,a(l?r>3?i:i.slice(0,u):i)},flush(){if(t.length===0)return"";let o=e2(t);if(r=0,o.startsWith(n))return a(o);let i=0;for(;i<n.length&&i<o.length&&n[i]===o[i];)i+=1;let u=o.slice(i);return n=o,u},get text(){return n}}}var Ol=`<think>
`,Wl=`<think>

</think>

`,Th="webgpu-template-policy-probe";function Nr({rawText:e2,templateArgs:t}){let n=t.enable_thinking===false?Wl:Ol;return n.includes("</think>")||e2.includes("</think>")?n+e2:n+e2+(e2.endsWith(`
`)?"":`
`)+`</think>

`}var Eh=Object.freeze({templateArgs:Object.freeze({preserve_thinking:true}),assistantContent:Nr});function Un(e2,t,n,r,s){return e2.render({...s,messages:n,tools:null,bos_token:t.bos_token,eos_token:t.eos_token,add_generation_prompt:r})}function zl(e2,t){let n={role:"user",content:Th},r=Object.freeze({preserve_thinking:true,enable_thinking:true}),s=Object.freeze({preserve_thinking:true,enable_thinking:false});try{let a=Un(e2,t,[n],true,r),o=Un(e2,t,[n],true,s);if(!a.endsWith(Ol)||!o.endsWith(Wl))return;let i=`reasoning
</think>

answer`;if(!Un(e2,t,[n,{role:"assistant",content:Nr({visibleText:`reasoning
answer`,rawText:i,templateArgs:r})}],false,r).startsWith(a+i))return;let l="unfinished reasoning";if(!Un(e2,t,[n,{role:"assistant",content:Nr({visibleText:l,rawText:l,templateArgs:r})}],false,r).startsWith(a+l))return;let d="answer";return Un(e2,t,[n,{role:"assistant",content:Nr({visibleText:d,rawText:d,templateArgs:s})}],false,s).startsWith(o+d)?Eh:void 0}catch{return}}function Hl(e2,t){return zl(e2,t)}async function Fl(e2,t){let n=Math.max(1,Math.floor(t.baseDepth)),r=Math.max(n,Math.floor(t.maxDepth)),s=Ul(t.minSampleTokens,24,2),a=Number.isFinite(t.saturationRatio)?Math.max(.5,Math.min(1,t.saturationRatio)):.97,o=Ul(t.maxProbes,5,1),i=[n];for(;i.length<o&&i.at(-1)<r;){let d=i.at(-1);i.push(Math.min(r,d*2))}let u=[],l=null,c=0;for(let d of i){let p=Math.max(s,d+1),f=await e2(d,p);if(!Number.isFinite(f.tokensPerSecond)||f.tokensPerSecond<=0)throw new Error(`decode calibration at depth ${d} returned invalid throughput`);if(f.tokenIds.length!==p)throw new Error(`decode calibration at depth ${d} produced ${f.tokenIds.length}/${p} tokens`);let g=l===null||Gh(l,f.tokenIds);if(u.push({depth:d,sampleTokens:p,tokensPerSecond:f.tokensPerSecond,outputMatchesReference:g}),!g)return Fa(u,a,"output-mismatch");if((l===null||f.tokenIds.length>l.length)&&(l=f.tokenIds),c>0&&f.tokensPerSecond<=c/a)return Fa(u,a,"saturated");c=f.tokensPerSecond}return Fa(u,a,"max-depth")}function Fa(e2,t,n){let r=e2.filter(o=>o.outputMatchesReference),s=Math.max(...r.map(o=>o.tokensPerSecond));return{depth:r.find(o=>o.tokensPerSecond>=s*t)?.depth??r[0]?.depth??1,samples:e2,totalSampleTokens:e2.reduce((o,i)=>o+i.sampleTokens,0),stoppedBecause:n}}function Gh(e2,t){let n=Math.min(e2.length,t.length);for(let r=0;r<n;++r)if(e2[r]!==t[r])return false;return true}function Ul(e2,t,n){return Number.isFinite(e2)?Math.max(n,Math.floor(e2)):t}async function Zl(e2,t=6){let n=Math.max(1,Math.floor(t)),r=e2.tensorFromTypedArray("uint32",[1,1],new Uint32Array([0]));try{await e2.readTensor(r);let s=[];for(let a=0;a<n;++a){let o=performance.now();await e2.readTensor(r),s.push(performance.now()-o)}return s.sort((a,o)=>a-o),s[s.length>>1]}finally{r.destroy?.()}}var jr=class{#t;#e;model;tokenizer;#n;#r;#a;#s;eosTokenIds;#l;generationState;#o=null;#u=false;destroyed=false;chatTemplateArgs={};constructor(t){this.#t=t.runtime,this.#e=t.ownsRuntime,this.model=t.model,this.tokenizer=t.tokenizer,this.#n=t.chatTemplate,this.#r=t.tokenizerConfig,this.#a=t.chatTemplatePolicy===null?void 0:t.chatTemplatePolicy??Hl(t.chatTemplate,t.tokenizerConfig),this.#s=new Zr(t.tokenizer),this.eosTokenIds=t.eosTokenIds,this.generationState=t.generationState,this.#l=t.defaultMaxNewTokens}get runtime(){return this.#t}acquireGenerationLease(){if(this.destroyed)throw new Error(`${this.constructor.name} has been disposed`);if(this.#u)throw new Error(`${this.constructor.name} is already generating`);this.#u=true;let t=true;return()=>{t&&(t=false,this.#u=false)}}get lastAssistantContent(){return this.#o}get contextLength(){return this.generationState.cache.maxLength}get contextFull(){return this.generationState.cache.get_seq_length()>=this.generationState.cache.maxLength}#i(){return Object.freeze({...this.#a?.templateArgs??{},...this.chatTemplateArgs})}#d(t,n,r){return this.#n.render({...r,messages:t,tools:null,bos_token:this.#r.bos_token,eos_token:this.#r.eos_token,add_generation_prompt:n})}renderPrompt(t,n=true){return this.#d(t,n,this.#i())}encodePrompt(t){return this.tokenizer.encode(this.renderPrompt(t),{add_special_tokens:false}).ids}async*generate(t,n={}){let r=this.acquireGenerationLease();this.#o=null;let s=this.#i(),a=[],o="",i=false;try{this.generationState.cache.get_seq_length()!==this.#s.cacheLength&&this.resetCache();let u=n.maxNewTokens??this.#l,l=n.eosTokenId??this.eosTokenIds,c=this.#d(t,true,s),d=this.#s.prepare(c),{inputIds:p,prefixLength:f}=d;f!==this.#s.cacheLength&&(this.resetCache(),f=0,p=d.fullyEncodedIds);let g=p.slice(f);g.length===0&&(this.resetCache(),p=d.fullyEncodedIds,g=p.slice());let m=this.generationState.cache.maxLength-this.generationState.cache.get_seq_length()-g.length;if(m<1)throw new Error(g.length>=this.generationState.cache.maxLength?`message is too long for the context window (${g.length} tokens; window is ${this.generationState.cache.maxLength})`:`context window is full (${this.generationState.cache.maxLength} tokens) — clear the chat to continue`);let A=Math.min(u,m),w=Kl(L=>this.tokenizer.decode(L,{skip_special_tokens:true}));for await(let L of this.streamTokens({suffixIds:g,maxNewTokens:A,eosTokenId:l,stopOnEos:true},n)){if(n.signal?.aborted)return;a.push(L);let Z=w.push(L);o=w.text,yield{token:L,delta:Z,text:o}}let C=w.flush();C!==""&&(o=w.text,yield{token:null,delta:C,text:o});let G=Fr(this.tokenizer,a,{skip_special_tokens:false});this.#o=Ml(this.#a,{visibleText:o,rawText:G,templateArgs:s}),this.#s.commit(p,a,this.generationState.cache.get_seq_length()),i=true}finally{i||this.resetCache(),r()}}async complete(t,n={}){let r="";for await(let s of this.generate(t,n))r=s.text;return r}async benchmarkFixedTokenIds(t,n,r){let s=this.acquireGenerationLease();try{return await this.#c(t,n,r)}finally{s()}}async calibrateDecodePipeline(t,n,r=[0]){let s=this.acquireGenerationLease();try{return await Fl(async(a,o)=>{let i=await this.#c(r,o,n(a));return{tokensPerSecond:i.decodeTps,tokenIds:i.ids}},t)}finally{s()}}async#c(t,n,r){this.resetCache();let s=[],a=0,o=0,i=performance.now();try{for await(let u of this.streamTokens({suffixIds:[...t],maxNewTokens:n,eosTokenId:r.eosTokenId??this.eosTokenIds,stopOnEos:false},r))s.length===0&&(a=performance.now()),s.push(u);o=performance.now()}finally{this.resetCache()}return{ttftMs:s.length>0?a-i:NaN,decodeTps:s.length>1?(s.length-1)/((o-a)/1e3):0,tokens:s.length,ids:s}}deviceInfo(){let t=this.#t.device,n=t.adapterInfo,r=s=>{try{return t.features.has(s)}catch{return false}};return{vendor:n.vendor??"",architecture:n.architecture??"",device:n.device??"",description:n.description??"",isFallbackAdapter:n.isFallbackAdapter===true,subgroupMinSize:n.subgroupMinSize,subgroupMaxSize:n.subgroupMaxSize,features:{shaderF16:r("shader-f16"),subgroups:r("subgroups"),subgroupMatrix:r("chromium-experimental-subgroup-matrix"),timestampQuery:r("timestamp-query")}}}reset(){this.resetCache()}resetCache(){this.generationState.cache.truncate(0),this.#s.clear(),this.#o=null}dispose(){this.destroyed||(this.destroyed=true,this.model.dispose(),this.#e&&this.#t.destroy())}};var xh="(?i:'s|'t|'re|'ve|'m|'ll|'d)|[^\\r\\n\\p{L}\\p{N}]?\\p{L}+|\\p{N}| ?[^\\s\\p{L}\\p{N}]+[\\r\\n]*|\\s*[\\r\\n]+|\\s+(?!\\S)|\\s+",Qh=`{% for message in messages %}<|im_start|>{{ message['role'] }}
{{ message['content'] }}<|im_end|>
{% endfor %}{% if add_generation_prompt %}<|im_start|>assistant
{% endif %}`;function Nl(e2){let t=Vl(e2,"tokenizer.ggml.tokens"),n=e2["tokenizer.ggml.merges"]??[],r={};return t.forEach((s,a)=>{r[s]=a}),Dh(e2)?{version:"1.0",truncation:null,padding:null,added_tokens:Za(e2,t),normalizer:{type:"Replace",pattern:{String:" "},content:"▁"},pre_tokenizer:{type:"Split",pattern:{String:" "},behavior:"MergedWithPrevious",invert:false},post_processor:null,decoder:{type:"Sequence",decoders:[{type:"Replace",pattern:{String:"▁"},content:" "},{type:"ByteFallback"},{type:"Fuse"}]},model:{type:"BPE",dropout:null,unk_token:on(t,e2["tokenizer.ggml.unknown_token_id"])??null,continuing_subword_prefix:null,end_of_word_suffix:null,fuse_unk:true,byte_fallback:true,ignore_merges:false,vocab:r,merges:$l(n)}}:{version:"1.0",truncation:null,padding:null,added_tokens:Za(e2,t),normalizer:{type:"NFC"},pre_tokenizer:Ph(e2),post_processor:qh(),decoder:Lh(),model:{type:"BPE",dropout:null,unk_token:on(t,e2["tokenizer.ggml.unknown_token_id"])??null,continuing_subword_prefix:null,end_of_word_suffix:null,fuse_unk:false,byte_fallback:!!e2["tokenizer.ggml.byte_fallback"],ignore_merges:false,vocab:r,merges:$l(n)}}}function Dh(e2){let t=e2["tokenizer.ggml.model"];return typeof t!="string"?false:t==="llama"||t==="spm"||t.startsWith("gemma")||t.startsWith("llama")}function jl(e2){let t=Vl(e2,"tokenizer.ggml.tokens"),n=e2["tokenizer.ggml.bos_token_id"],r=e2["tokenizer.ggml.eos_token_id"],s=e2["tokenizer.ggml.unknown_token_id"],a=e2["tokenizer.ggml.padding_token_id"],o=Object.fromEntries(Za(e2,t).map(i=>[i.id,{content:i.content,single_word:i.single_word,lstrip:i.lstrip,rstrip:i.rstrip,normalized:i.normalized,special:i.special}]));return{tokenizer_class:"Qwen2Tokenizer",model_max_length:e2["qwen3.context_length"]??e2["general.context_length"]??32768,bos_token:on(t,n),eos_token:on(t,r),unk_token:on(t,s),pad_token:on(t,a),bos_token_id:Number.isInteger(n)?n:void 0,eos_token_id:Number.isInteger(r)?r:void 0,unk_token_id:Number.isInteger(s)?s:void 0,pad_token_id:Number.isInteger(a)?a:void 0,chat_template:$a(e2,t),added_tokens_decoder:o}}function $a(e2,t=Mh(e2)){let n=e2["tokenizer.chat_template"];if(typeof n=="string")return n;let r=e2["tokenizer.ggml.chat_template"];return typeof r=="string"?r:t.includes("<|im_start|>")&&t.includes("<|im_end|>")?Qh:null}function Ph(e2){let t=e2["tokenizer.ggml.pre"];return t==="qwen2"||t==="qwen3"||e2["general.architecture"]==="qwen3"?{type:"Sequence",pretokenizers:[{type:"Split",pattern:{Regex:xh},behavior:"Isolated",invert:false},{type:"ByteLevel",add_prefix_space:false,trim_offsets:false,use_regex:false}]}:{type:"ByteLevel",add_prefix_space:false,trim_offsets:true,use_regex:true}}function Lh(){return{type:"ByteLevel",add_prefix_space:false,trim_offsets:false,use_regex:false}}function qh(){return{type:"ByteLevel",add_prefix_space:false,trim_offsets:false,use_regex:false}}function Za(e2,t){let n=Array.isArray(e2["tokenizer.ggml.token_type"])?e2["tokenizer.ggml.token_type"]:[],r=new Set;for(let s of[e2["tokenizer.ggml.bos_token_id"],e2["tokenizer.ggml.eos_token_id"],e2["tokenizer.ggml.unknown_token_id"],e2["tokenizer.ggml.padding_token_id"]])Number.isInteger(s)&&r.add(s);for(let s=0;s<n.length;++s)Rh(n[s])&&r.add(s);return[...r].filter(s=>s>=0&&s<t.length).sort((s,a)=>s-a).map(s=>({id:s,content:t[s],single_word:false,lstrip:false,rstrip:false,normalized:false,special:true}))}function Rh(e2){return Number.isInteger(e2)&&e2!==1&&e2!==6}function $l(e2){return Array.isArray(e2)?e2.map(t=>Array.isArray(t)?t.join(" "):String(t)):[]}function on(e2,t){return typeof t=="number"&&Number.isInteger(t)&&t>=0&&t<e2.length?e2[t]:void 0}function Vl(e2,t){let n=e2[t];if(!Array.isArray(n)||n.some(r=>typeof r!="string"))throw new Error(`GGUF metadata ${t} must be a string array`);return n}function Mh(e2){let t=e2["tokenizer.ggml.tokens"];return Array.isArray(t)&&t.every(n=>typeof n=="string")?t:[]}li();ui();qo();ri();var Pd="lmstudio-community/Bonsai-27B-GGUF",Pw="Bonsai-27B-Q1_0.gguf",wn=4,Qd=4096;function Dd(e2,t,n="main"){let r=e2??Pd;return r.toLowerCase().endsWith(".gguf")?!/^https?:/i.test(r)&&typeof location<"u"?new URL(r,location.href).href:r:Rl(r,{revision:n,file:t??Pw})}var di=class e extends jr{static DEFAULT_MODEL_ID=Pd;#t;#e;#n;#r=wn;#a=0;constructor(t){let n=vs(t.model),r=Math.max(1,Math.min(t.maxLength??Math.min(n,Qd),n)),s=t.model.createGenerationState({maxLength:r});super({...t,generationState:s,defaultMaxNewTokens:Qd}),this.#t=s,this.#e=t.tokenizer.token_to_id("<think>")??null,this.#n=t.tokenizer.token_to_id("</think>")??null}get thinkOpenTokenId(){return this.#e}get thinkCloseTokenId(){return this.#n}streamTokens(t,n){return this.model.streamTokenIdsFromCache({input_ids:[t.suffixIds],generation_state:this.#t,max_new_tokens:t.maxNewTokens,eos_token_id:t.eosTokenId,stop_on_eos:t.stopOnEos,decode_pipeline_depth:n.decodePipelineDepth??this.#r})}get contextLength(){return this.#t.cache.maxLength}static async checkAvailability(t=null,n={}){let r=globalThis.navigator?.gpu;if(!r)return{ok:false,reason:"WebGPU isn't available in this browser. Try a recent Chrome or Edge."};let s=null;try{s=await r.requestAdapter({powerPreference:"high-performance"})}catch{}if(!s)return{ok:false,reason:"No WebGPU adapter is available on this device."};let a=Dd(t,n.file,n.revision??"main"),o=n.fetch??(n.accessToken?Ua(n.accessToken):void 0);try{let i=await Tl(a,{fetch:o,signal:n.signal}),u=Rs(or(i),s,i);return u?{ok:false,reason:u}:{ok:true}}catch{return{ok:true}}}static async load(t=null,n={}){let r=n.onProgress??(()=>{}),s=Dd(t,n.file,n.revision??"main"),a=n.fetch??(n.accessToken?Ua(n.accessToken):void 0);r({status:"init",message:"Requesting WebGPU device"});let o=n.runtime??await tl(n.runtimeOptions??{}),i=!n.runtime;o.captureShaders=true;let u=async()=>{};try{r({status:"init",message:"Checking device support"});let l=await an.open(s,{fetch:a,signal:n.signal,cache:n.cache,force:n.force,cacheName:n.cacheName});u=()=>l.close();let c=Rs(or(l),o.device,l);if(c)throw new Error(c);r({status:"tokenizer",message:"Loading tokenizer"}),await ci();let{tokenizer:d,chatTemplate:p,tokenizerConfig:f,eosTokenIds:g}=Lw(l);await ci();let m=l.names().reduce((G,L)=>G+l.info(L).byteLength,0),A=0;l.onByteProgress=G=>{A+=G,r({status:"weights",kind:"bytes",loaded:A,total:m||null,fraction:m?Math.min(1,A/m):void 0,message:"Streaming weights"})};let w=await $t.loadGGUF(o,{gguf:l,onProgress:G=>{!$r(G.total)||G.total<=0||r({status:"weights",kind:"tensors",loaded:G.processed,total:G.total,message:"Uploading to GPU"})}});await u();let C=new e({runtime:o,ownsRuntime:i,model:w,tokenizer:d,chatTemplate:p,tokenizerConfig:f,eosTokenIds:g,maxLength:n.maxLength});return r({status:"weights",kind:"tensors",message:"Compiling kernels (warmup)"}),await ci(),await w.warmup(C.#t.cache),C.#a=await Zl(o),n.decodePipelineDepth!==void 0?C.#r=rr({decode_pipeline_depth:n.decodePipelineDepth},wn,Ft):(r({status:"weights",kind:"tensors",message:"Tuning decode pipeline"}),C.#r=await C.#s()),r({status:"ready",message:"Ready",fraction:1}),C}catch(l){throw await u().catch(()=>{}),i&&await o.destroy(),l}}get decodePipelineDepth(){return this.#r}get readbackLatencyMs(){return this.#a}async#s(){let t=Math.min(Ft,this.contextLength-1);return t<=wn?wn:(await this.calibrateDecodePipeline({baseDepth:wn,maxDepth:t,minSampleTokens:Math.min(24,this.contextLength)},r=>({decodePipelineDepth:r}))).depth}async benchmark(t,n={}){let r=n.maxNewTokens??64,s=rr({decode_pipeline_depth:n.decodePipelineDepth??this.#r},wn,Ft);return{...await this.benchmarkFixedTokenIds(this.encodePrompt(t),r,{decodePipelineDepth:s}),depth:s}}};function ci(){return typeof requestAnimationFrame=="function"?new Promise(e2=>requestAnimationFrame(()=>e2())):new Promise(e2=>setTimeout(e2,0))}function Lw(e2){let t=e2.metadata,n=jl(t),r=Nl(t),s=new Ki(r,n),a=typeof n.chat_template=="string"?n.chat_template:$a(t);if(!a)throw new Error("Bonsai GGUF metadata is missing a chat_template");let o=qw(n,s);return{tokenizer:s,chatTemplate:new fr(a),tokenizerConfig:n,eosTokenIds:o}}function qw(e2,t){let n=new Set,r=e2.eos_token_id;if($r(r)&&n.add(r),typeof e2.eos_token=="string"){let s=t.token_to_id(e2.eos_token);$r(s)&&n.add(s)}if(n.size===0)throw new Error("Bonsai GGUF metadata has no eos token id");return[...n]}var oT=di;export{di as Bonsai27bMobile,Pw as DEFAULT_GGUF_FILE,Pd as DEFAULT_MODEL_ID,oT as default,Dd as resolveGGUFUrl}
