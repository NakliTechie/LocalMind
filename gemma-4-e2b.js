// Gemma-4 E2B (QAT mobile) WebGPU chat bundle. Import { Gemma4Mobile } from this file.
var ko=Object.defineProperty;var he=(e,n)=>()=>(e&&(n=e(e=0)),n);var Eo=(e,n)=>{for(var r in n)ko(e,r,{get:n[r],enumerable:!0})};function Lt(e){return/\w/.test(e)}function wn(e){return/[0-9]/.test(e)}function Ct(e){return/\s/.test(e)}function Wo(e,n={}){return e.endsWith(`
`)&&(e=e.slice(0,-1)),n.lstrip_blocks&&(e=e.replace(/^[ \t]*({[#%-])/gm,"$1")),n.trim_blocks&&(e=e.replace(/([#%-]})\n/g,"$1")),e.replace(/(\s*){%(-?)\s*(?:end)?generation\s*(-?)%}(\s*)/gs,(r,t,a,s,o)=>(a?"":t)+(s?"":o))}function $n(e,n={}){let r=[],t=Wo(e,n),a=0,s=0,o=l=>{let c="";for(;l(t[a]);){if(t[a]==="\\"){if(++a,a>=t.length)throw new SyntaxError("Unexpected end of input");let d=t[a++],p=Ro.get(d);if(p===void 0)throw new SyntaxError(`Unexpected escaped character: ${d}`);c+=p;continue}if(c+=t[a++],a>=t.length)throw new SyntaxError("Unexpected end of input")}return c},i=()=>{let l=r.at(-1);l&&l.type===h.Text&&(l.value=l.value.trimEnd(),l.value===""&&r.pop())},u=()=>{for(;a<t.length&&Ct(t[a]);)++a};e:for(;a<t.length;){let l=r.at(-1)?.type;if(l===void 0||l===h.CloseStatement||l===h.CloseExpression||l===h.Comment){let d="";for(;a<t.length&&!(t[a]==="{"&&(t[a+1]==="%"||t[a+1]==="{"||t[a+1]==="#"));)d+=t[a++];if(d.length>0){r.push(new Ge(d,h.Text));continue}}if(t[a]==="{"&&t[a+1]==="#"){a+=2;let d=t[a]==="-";d&&++a;let p="";for(;t[a]!=="#"||t[a+1]!=="}";){if(a+2>=t.length)throw new SyntaxError("Missing end of comment tag");p+=t[a++]}let f=p.endsWith("-");f&&(p=p.slice(0,-1)),d&&i(),r.push(new Ge(p,h.Comment)),a+=2,f&&u();continue}if(t.slice(a,a+3)==="{%-"){i(),r.push(new Ge("{%",h.OpenStatement)),a+=3;continue}if(t.slice(a,a+3)==="{{-"){i(),r.push(new Ge("{{",h.OpenExpression)),s=0,a+=3;continue}if(o(Ct),t.slice(a,a+3)==="-%}"){r.push(new Ge("%}",h.CloseStatement)),a+=3,u();continue}if(t.slice(a,a+3)==="-}}"){r.push(new Ge("}}",h.CloseExpression)),a+=3,u();continue}let c=t[a];if(c==="-"||c==="+"){let d=r.at(-1)?.type;if(d===h.Text||d===void 0)throw new SyntaxError(`Unexpected character: ${c}`);switch(d){case h.Identifier:case h.NumericLiteral:case h.StringLiteral:case h.CloseParen:case h.CloseSquareBracket:break;default:{++a;let p=o(wn);r.push(new Ge(`${c}${p}`,p.length>0?h.NumericLiteral:h.UnaryOperator));continue}}}for(let[d,p]of Oo){if(d==="}}"&&s>0)continue;if(t.slice(a,a+d.length)===d){r.push(new Ge(d,p)),p===h.OpenExpression?s=0:p===h.OpenCurlyBracket?++s:p===h.CloseCurlyBracket&&--s,a+=d.length;continue e}}if(c==="'"||c==='"'){++a;let d=o(p=>p!==c);r.push(new Ge(d,h.StringLiteral)),++a;continue}if(wn(c)){let d=o(wn);if(r.at(-1)?.type!==h.Dot&&t[a]==="."&&wn(t[a+1])){++a;let p=o(wn);d=`${d}.${p}`}r.push(new Ge(d,h.NumericLiteral));continue}if(Lt(c)){let d=o(Lt);r.push(new Ge(d,h.Identifier));continue}throw new SyntaxError(`Unexpected character: ${c}`)}return r}function Kn(e){let n=new Fo([]),r=0;function t(g,w){let T=e[r++];if(!T||T.type!==g)throw new Error(`Parser Error: ${w}. ${T.type} !== ${g}.`);return T}function a(g){if(!u(g))throw new SyntaxError(`Expected ${g}`);++r}function s(){switch(e[r].type){case h.Comment:return new Lo(e[r++].value);case h.Text:return l();case h.OpenStatement:return c();case h.OpenExpression:return d();default:throw new SyntaxError(`Unexpected token type: ${e[r].type}`)}}function o(...g){return r+g.length<=e.length&&g.every((w,T)=>w===e[r+T].type)}function i(...g){return e[r]?.type===h.OpenStatement&&e[r+1]?.type===h.Identifier&&g.includes(e[r+1]?.value)}function u(...g){return r+g.length<=e.length&&g.every((w,T)=>e[r+T].type==="Identifier"&&w===e[r+T].value)}function l(){return new zt(t(h.Text,"Expected text token").value)}function c(){if(t(h.OpenStatement,"Expected opening statement token"),e[r].type!==h.Identifier)throw new SyntaxError(`Unknown statement, got ${e[r].type}`);let g=e[r].value,w;switch(g){case"set":++r,w=p();break;case"if":++r,w=f(),t(h.OpenStatement,"Expected {% token"),a("endif"),t(h.CloseStatement,"Expected %} token");break;case"macro":++r,w=m(),t(h.OpenStatement,"Expected {% token"),a("endmacro"),t(h.CloseStatement,"Expected %} token");break;case"for":++r,w=E(),t(h.OpenStatement,"Expected {% token"),a("endfor"),t(h.CloseStatement,"Expected %} token");break;case"call":{++r;let T=null;o(h.OpenParen)&&(T=R());let X=Z();if(X.type!=="Identifier")throw new SyntaxError("Expected identifier following call statement");let Be=R();t(h.CloseStatement,"Expected closing statement token");let Te=[];for(;!i("endcall");)Te.push(s());t(h.OpenStatement,"Expected '{%'"),a("endcall"),t(h.CloseStatement,"Expected closing statement token");let Se=new Nt(X,Be);w=new ei(Se,T,Te);break}case"break":++r,t(h.CloseStatement,"Expected closing statement token"),w=new qo;break;case"continue":++r,t(h.CloseStatement,"Expected closing statement token"),w=new Io;break;case"filter":{++r;let T=Z();T instanceof sn&&o(h.OpenParen)&&(T=N(T)),t(h.CloseStatement,"Expected closing statement token");let X=[];for(;!i("endfilter");)X.push(s());t(h.OpenStatement,"Expected '{%'"),a("endfilter"),t(h.CloseStatement,"Expected '%}'"),w=new Ho(T,X);break}default:throw new SyntaxError(`Unknown statement type: ${g}`)}return w}function d(){t(h.OpenExpression,"Expected opening expression token");let g=b();return t(h.CloseExpression,"Expected closing expression token"),g}function p(){let g=_(),w=null,T=[];if(o(h.Equals))++r,w=_();else{for(t(h.CloseStatement,"Expected %} token");!i("endset");)T.push(s());t(h.OpenStatement,"Expected {% token"),a("endset")}return t(h.CloseStatement,"Expected closing statement token"),new Do(g,w,T)}function f(){let g=b();t(h.CloseStatement,"Expected closing statement token");let w=[],T=[];for(;!i("elif","else","endif");)w.push(s());if(i("elif")){++r,++r;let X=f();T.push(X)}else if(i("else"))for(++r,++r,t(h.CloseStatement,"Expected closing statement token");!i("endif");)T.push(s());return new Mo(g,w,T)}function m(){let g=Z();if(g.type!=="Identifier")throw new SyntaxError("Expected identifier following macro statement");let w=R();t(h.CloseStatement,"Expected closing statement token");let T=[];for(;!i("endmacro");)T.push(s());return new Uo(g,w,T)}function _(g=!1){let w=g?Z:b,T=[w()],X=o(h.Comma);for(;X&&(++r,T.push(w()),!!o(h.Comma)););return X?new jt(T):T[0]}function E(){let g=_(!0);if(!(g instanceof sn||g instanceof jt))throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${g.type} instead`);if(!u("in"))throw new SyntaxError("Expected `in` keyword following loop variable");++r;let w=b();t(h.CloseStatement,"Expected closing statement token");let T=[];for(;!i("endfor","else");)T.push(s());let X=[];if(i("else"))for(++r,++r,t(h.CloseStatement,"Expected closing statement token");!i("endfor");)X.push(s());return new Bo(g,w,T,X)}function b(){return W()}function W(){let g=q();if(u("if")){++r;let w=q();if(u("else")){++r;let T=W();return new ni(w,g,T)}else return new Vo(g,w)}return g}function q(){let g=G();for(;u("or");){let w=e[r];++r;let T=G();g=new _n(w,g,T)}return g}function G(){let g=C();for(;u("and");){let w=e[r];++r;let T=C();g=new _n(w,g,T)}return g}function C(){let g;for(;u("not");){let w=e[r];++r;let T=C();g=new Xo(w,T)}return g??S()}function S(){let g=D();for(;;){let w;if(u("not","in"))w=new Ge("not in",h.Identifier),r+=2;else if(u("in"))w=e[r++];else if(o(h.ComparisonBinaryOperator))w=e[r++];else break;let T=D();g=new _n(w,g,T)}return g}function D(){let g=ne();for(;o(h.AdditiveBinaryOperator);){let w=e[r];++r;let T=ne();g=new _n(w,g,T)}return g}function P(){let g=j(Z());return o(h.OpenParen)?N(g):g}function N(g){let w=new Nt(g,R());return w=j(w),o(h.OpenParen)&&(w=N(w)),w}function R(){t(h.OpenParen,"Expected opening parenthesis for arguments list");let g=V();return t(h.CloseParen,"Expected closing parenthesis for arguments list"),g}function V(){let g=[];for(;!o(h.CloseParen);){let w;if(e[r].type===h.MultiplicativeBinaryOperator&&e[r].value==="*"){++r;let T=b();w=new Jo(T)}else if(w=b(),o(h.Equals)){if(++r,!(w instanceof sn))throw new SyntaxError("Expected identifier for keyword argument");let T=b();w=new Yo(w,T)}g.push(w),o(h.Comma)&&++r}return g}function z(){let g=[],w=!1;for(;!o(h.CloseSquareBracket);)o(h.Colon)?(g.push(void 0),++r,w=!0):(g.push(b()),o(h.Colon)&&(++r,w=!0));if(g.length===0)throw new SyntaxError("Expected at least one argument for member/slice expression");if(w){if(g.length>3)throw new SyntaxError("Expected 0-3 arguments for slice expression");return new Zo(...g)}return g[0]}function j(g){for(;o(h.Dot)||o(h.OpenSquareBracket);){let w=e[r];++r;let T,X=w.type===h.OpenSquareBracket;if(X)T=z(),t(h.CloseSquareBracket,"Expected closing square bracket");else if(T=Z(),T.type!=="Identifier"&&T.type!=="IntegerLiteral")throw new SyntaxError("Expected identifier or integer following dot operator");g=new Co(g,T,X)}return g}function ne(){let g=Q();for(;o(h.MultiplicativeBinaryOperator);){let w=e[r++],T=Q();g=new _n(w,g,T)}return g}function Q(){let g=ve();for(;u("is");){++r;let w=u("not");w&&++r;let T=Z();if(!(T instanceof sn))throw new SyntaxError("Expected identifier for the test");g=new Qo(g,w,T)}return g}function ve(){let g=P();for(;o(h.Pipe);){++r;let w=Z();if(!(w instanceof sn))throw new SyntaxError("Expected identifier for the filter");o(h.OpenParen)&&(w=N(w)),g=new Ko(g,w)}return g}function Z(){let g=e[r++];switch(g.type){case h.NumericLiteral:{let w=g.value;return w.includes(".")?new zo(Number(w)):new No(Number(w))}case h.StringLiteral:{let w=g.value;for(;o(h.StringLiteral);)w+=e[r++].value;return new zt(w)}case h.Identifier:return new sn(g.value);case h.OpenParen:{let w=_();return t(h.CloseParen,"Expected closing parenthesis, got ${tokens[current].type} instead."),w}case h.OpenSquareBracket:{let w=[];for(;!o(h.CloseSquareBracket);)w.push(b()),o(h.Comma)&&++r;return++r,new jo(w)}case h.OpenCurlyBracket:{let w=new Map;for(;!o(h.CloseCurlyBracket);){let T=b();t(h.Colon,"Expected colon between key and value in object literal");let X=b();w.set(T,X),o(h.Comma)&&++r}return++r,new $o(w)}default:throw new SyntaxError(`Unexpected token: ${g.type}`)}}for(;r<e.length;)n.body.push(s());return n}function ri(e,n,r=1){if(n===void 0&&(n=e,e=0),r===0)throw new Error("range() step must not be zero");let t=[];if(r>0)for(let a=e;a<n;a+=r)t.push(a);else for(let a=e;a>n;a+=r)t.push(a);return t}function $t(e,n,r,t=1){let a=Math.sign(t);a>=0?(n=(n??=0)<0?Math.max(e.length+n,0):Math.min(n,e.length),r=(r??=e.length)<0?Math.max(e.length+r,0):Math.min(r,e.length)):(n=(n??=e.length-1)<0?Math.max(e.length+n,-1):Math.min(n,e.length-1),r=(r??=-1)<-1?Math.max(e.length+r,-1):Math.min(r,e.length-1));let s=[];for(let o=n;a*o<a*r;o+=t)s.push(e[o]);return s}function ti(e){return e.replace(/\b\w/g,n=>n.toUpperCase())}function ai(e){return si(new Date,e)}function si(e,n){let r=new Intl.DateTimeFormat(void 0,{month:"long"}),t=new Intl.DateTimeFormat(void 0,{month:"short"}),a=s=>s<10?"0"+s:s.toString();return n.replace(/%[YmdbBHM%]/g,s=>{switch(s){case"%Y":return e.getFullYear().toString();case"%m":return a(e.getMonth()+1);case"%d":return a(e.getDate());case"%b":return t.format(e);case"%B":return r.format(e);case"%H":return a(e.getHours());case"%M":return a(e.getMinutes());case"%%":return"%";default:return s}})}function oi(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function ii(e,n,r,t){if(t===0)return e;let a=t==null||t<0?1/0:t,s=n.length===0?new RegExp("(?=)","gu"):new RegExp(oi(n),"gu");return e.replaceAll(s,o=>a>0?(--a,r):o)}function Vt(e){return e.replace(li,n=>"\\u"+n.charCodeAt(0).toString(16).padStart(4,"0"))}function Ye(e,n={},r=0,t=!0){let{indent:a=null,ensureAscii:s=!1,separators:o=null,sortKeys:i=!1}=n,u,l;switch(o?[u,l]=o:a?(u=",",l=": "):(u=", ",l=": "),e.type){case"NullValue":return"null";case"UndefinedValue":return t?"null":"undefined";case"IntegerValue":case"FloatValue":case"BooleanValue":return JSON.stringify(e.value);case"StringValue":{let c=JSON.stringify(e.value);return s&&(c=Vt(c)),c}case"ArrayValue":case"ObjectValue":{let c=a?" ".repeat(a):"",d=`
`+c.repeat(r),p=d+c;if(e.type==="ArrayValue"){let f=e.value.map(m=>Ye(m,n,r+1,t));return a?`[${p}${f.join(`${u}${p}`)}${d}]`:`[${f.join(u)}]`}else{let f=Array.from(e.value.entries());i&&(f=f.sort(([_],[E])=>_.localeCompare(E)));let m=f.map(([_,E])=>{let b=JSON.stringify(_);s&&(b=Vt(b));let W=`${b}${l}${Ye(E,n,r+1,t)}`;return a?`${p}${W}`:W});return a?`{${m.join(u)}${d}}`:`{${m.join(u)}}`}}default:throw new Error(`Cannot convert to JSON: ${e.type}`)}}function ci(e){e.set("false",!1),e.set("true",!0),e.set("none",null),e.set("raise_exception",n=>{throw new Error(n)}),e.set("range",ri),e.set("strftime_now",ai),e.set("True",!0),e.set("False",!1),e.set("None",null)}function Xt(e,n){let r=n.split("."),t=e;for(let a of r)if(t instanceof ye)t=t.value.get(a)??new re;else if(t instanceof I){let s=parseInt(a,10);if(!isNaN(s)&&s>=0&&s<t.value.length)t=t.value[s];else return new re}else return new re;return t}function Fr(e,n,r=!1){if(e instanceof se&&n instanceof se)return 0;if(e instanceof se||n instanceof se)throw new Error(`Cannot compare ${e.type} with ${n.type}`);if(e instanceof re&&n instanceof re)return 0;if(e instanceof re||n instanceof re)throw new Error(`Cannot compare ${e.type} with ${n.type}`);let t=s=>s instanceof O||s instanceof ce||s instanceof A,a=s=>s instanceof A?s.value?1:0:s.value;if(t(e)&&t(n)){let s=a(e),o=a(n);return s<o?-1:s>o?1:0}if(e.type!==n.type)throw new Error(`Cannot compare different types: ${e.type} and ${n.type}`);if(e.type==="StringValue"){let s=e.value,o=n.value;return r||(s=s.toLowerCase(),o=o.toLowerCase()),s<o?-1:s>o?1:0}else throw new Error(`Cannot compare type: ${e.type}`)}function jn(e){switch(typeof e){case"number":return Number.isInteger(e)?new O(e):new ce(e);case"string":return new k(e);case"boolean":return new A(e);case"undefined":return new re;case"object":return e===null?new se:Array.isArray(e)?new I(e.map(jn)):new ye(new Map(Object.entries(e).map(([n,r])=>[n,jn(r)])));case"function":return new te((n,r)=>{let t=e(...n.map(a=>a.value))??null;return jn(t)});default:throw new Error(`Cannot convert to runtime value: ${e}`)}}function fi(e){switch(e.operator.type){case"MultiplicativeBinaryOperator":return 4;case"AdditiveBinaryOperator":return 3;case"ComparisonBinaryOperator":return 2;case"Identifier":return e.operator.value==="and"?1:e.operator.value==="in"||e.operator.value==="not in"?2:0}return 0}function mi(e,n="	"){let r=typeof n=="number"?" ".repeat(n):n;return Oe(e.body,0,r).replace(/\n$/,"")}function be(...e){return di+e.join(" ")+pi}function Oe(e,n,r){return e.map(t=>gi(t,n,r)).join(ge)}function gi(e,n,r){let t=r.repeat(n);switch(e.type){case"Program":return Oe(e.body,n,r);case"If":return hi(e,n,r);case"For":return yi(e,n,r);case"Set":return bi(e,n,r);case"Macro":return wi(e,n,r);case"Break":return t+be("break");case"Continue":return t+be("continue");case"CallStatement":return _i(e,n,r);case"FilterStatement":return vi(e,n,r);case"Comment":return t+"{# "+e.value+" #}";default:return t+"{{- "+U(e)+" -}}"}}function hi(e,n,r){let t=r.repeat(n),a=[],s=e;for(;s&&(a.push({test:s.test,body:s.body}),s.alternate.length===1&&s.alternate[0].type==="If");)s=s.alternate[0];let o=t+be("if",U(a[0].test))+ge+Oe(a[0].body,n+1,r);for(let i=1;i<a.length;++i)o+=ge+t+be("elif",U(a[i].test))+ge+Oe(a[i].body,n+1,r);return s&&s.alternate.length>0&&(o+=ge+t+be("else")+ge+Oe(s.alternate,n+1,r)),o+=ge+t+be("endif"),o}function yi(e,n,r){let t=r.repeat(n),a="";if(e.iterable.type==="SelectExpression"){let o=e.iterable;a=`${U(o.lhs)} if ${U(o.test)}`}else a=U(e.iterable);let s=t+be("for",U(e.loopvar),"in",a)+ge+Oe(e.body,n+1,r);return e.defaultBlock.length>0&&(s+=ge+t+be("else")+ge+Oe(e.defaultBlock,n+1,r)),s+=ge+t+be("endfor"),s}function bi(e,n,r){let t=r.repeat(n),a=U(e.assignee),s=e.value?U(e.value):"",o=t+be("set",`${a}${e.value?" = "+s:""}`);return e.body.length===0?o:o+ge+Oe(e.body,n+1,r)+ge+t+be("endset")}function wi(e,n,r){let t=r.repeat(n),a=e.args.map(U).join(", ");return t+be("macro",`${e.name.value}(${a})`)+ge+Oe(e.body,n+1,r)+ge+t+be("endmacro")}function _i(e,n,r){let t=r.repeat(n),a=e.callerArgs&&e.callerArgs.length>0?`(${e.callerArgs.map(U).join(", ")})`:"",s=U(e.call),o=t+be(`call${a}`,s)+ge;return o+=Oe(e.body,n+1,r)+ge,o+=t+be("endcall"),o}function vi(e,n,r){let t=r.repeat(n),a=e.filter.type==="Identifier"?e.filter.value:U(e.filter),s=t+be("filter",a)+ge;return s+=Oe(e.body,n+1,r)+ge,s+=t+be("endfilter"),s}function U(e,n=-1){switch(e.type){case"SpreadExpression":return`*${U(e.argument)}`;case"Identifier":return e.value;case"IntegerLiteral":return`${e.value}`;case"FloatLiteral":return`${e.value}`;case"StringLiteral":return JSON.stringify(e.value);case"BinaryExpression":{let r=e,t=fi(r),a=U(r.left,t),s=U(r.right,t+1),o=`${a} ${r.operator.value} ${s}`;return t<n?`(${o})`:o}case"UnaryExpression":{let r=e;return r.operator.value+(r.operator.value==="not"?" ":"")+U(r.argument,1/0)}case"CallExpression":{let r=e,t=r.args.map(U).join(", ");return`${U(r.callee)}(${t})`}case"MemberExpression":{let r=e,t=U(r.object);["Identifier","MemberExpression","CallExpression","StringLiteral","IntegerLiteral","FloatLiteral","ArrayLiteral","TupleLiteral","ObjectLiteral"].includes(r.object.type)||(t=`(${t})`);let a=U(r.property);return!r.computed&&r.property.type!=="Identifier"&&r.property.type!=="IntegerLiteral"&&(a=`(${a})`),r.computed?`${t}[${a}]`:`${t}.${a}`}case"FilterExpression":{let r=e,t=U(r.operand,1/0);return r.filter.type==="CallExpression"?`${t} | ${U(r.filter)}`:`${t} | ${r.filter.value}`}case"SelectExpression":{let r=e;return`${U(r.lhs)} if ${U(r.test)}`}case"TestExpression":{let r=e;return`${U(r.operand)} is${r.negate?" not":""} ${r.test.value}`}case"ArrayLiteral":case"TupleLiteral":{let r=e.value.map(U),t=e.type==="ArrayLiteral"?"[]":"()";return`${t[0]}${r.join(", ")}${t[1]}`}case"ObjectLiteral":return`{${Array.from(e.value.entries()).map(([t,a])=>`${U(t)}: ${U(a)}`).join(", ")}}`;case"SliceExpression":{let r=e,t=r.start?U(r.start):"",a=r.stop?U(r.stop):"",s=r.step?`:${U(r.step)}`:"";return`${t}:${a}${s}`}case"KeywordArgumentExpression":{let r=e;return`${r.key.value}=${U(r.value)}`}case"Ternary":{let r=e,t=`${U(r.trueExpr)} if ${U(r.condition,0)} else ${U(r.falseExpr)}`;return n>-1?`(${t})`:t}default:throw new Error(`Unknown expression type: ${e.type}`)}}var Po,Ao,Go,h,Ge,Oo,Ro,Re,Fo,Mo,Bo,qo,Io,Do,Uo,Lo,Pe,Co,Nt,sn,on,No,zo,zt,jo,jt,$o,_n,Ko,Ho,Vo,Qo,Xo,Zo,Yo,Jo,ei,ni,Kt,Ht,ui,De,O,ce,k,A,li,ye,vn,I,Qt,te,se,re,Zt,Ie,Mr,ge,di,pi,Hn,Br=he(()=>{Po=Object.defineProperty,Ao=(e,n,r)=>n in e?Po(e,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[n]=r,Go=(e,n,r)=>(Ao(e,typeof n!="symbol"?n+"":n,r),r),h=Object.freeze({Text:"Text",NumericLiteral:"NumericLiteral",StringLiteral:"StringLiteral",Identifier:"Identifier",Equals:"Equals",OpenParen:"OpenParen",CloseParen:"CloseParen",OpenStatement:"OpenStatement",CloseStatement:"CloseStatement",OpenExpression:"OpenExpression",CloseExpression:"CloseExpression",OpenSquareBracket:"OpenSquareBracket",CloseSquareBracket:"CloseSquareBracket",OpenCurlyBracket:"OpenCurlyBracket",CloseCurlyBracket:"CloseCurlyBracket",Comma:"Comma",Dot:"Dot",Colon:"Colon",Pipe:"Pipe",CallOperator:"CallOperator",AdditiveBinaryOperator:"AdditiveBinaryOperator",MultiplicativeBinaryOperator:"MultiplicativeBinaryOperator",ComparisonBinaryOperator:"ComparisonBinaryOperator",UnaryOperator:"UnaryOperator",Comment:"Comment"}),Ge=class{constructor(e,n){this.value=e,this.type=n}};Oo=[["{%",h.OpenStatement],["%}",h.CloseStatement],["{{",h.OpenExpression],["}}",h.CloseExpression],["(",h.OpenParen],[")",h.CloseParen],["{",h.OpenCurlyBracket],["}",h.CloseCurlyBracket],["[",h.OpenSquareBracket],["]",h.CloseSquareBracket],[",",h.Comma],[".",h.Dot],[":",h.Colon],["|",h.Pipe],["<=",h.ComparisonBinaryOperator],[">=",h.ComparisonBinaryOperator],["==",h.ComparisonBinaryOperator],["!=",h.ComparisonBinaryOperator],["<",h.ComparisonBinaryOperator],[">",h.ComparisonBinaryOperator],["+",h.AdditiveBinaryOperator],["-",h.AdditiveBinaryOperator],["~",h.AdditiveBinaryOperator],["*",h.MultiplicativeBinaryOperator],["/",h.MultiplicativeBinaryOperator],["%",h.MultiplicativeBinaryOperator],["=",h.Equals]],Ro=new Map([["n",`
`],["t","	"],["r","\r"],["b","\b"],["f","\f"],["v","\v"],["'","'"],['"','"'],["\\","\\"]]);Re=class{type="Statement"},Fo=class extends Re{constructor(e){super(),this.body=e}type="Program"},Mo=class extends Re{constructor(e,n,r){super(),this.test=e,this.body=n,this.alternate=r}type="If"},Bo=class extends Re{constructor(e,n,r,t){super(),this.loopvar=e,this.iterable=n,this.body=r,this.defaultBlock=t}type="For"},qo=class extends Re{type="Break"},Io=class extends Re{type="Continue"},Do=class extends Re{constructor(e,n,r){super(),this.assignee=e,this.value=n,this.body=r}type="Set"},Uo=class extends Re{constructor(e,n,r){super(),this.name=e,this.args=n,this.body=r}type="Macro"},Lo=class extends Re{constructor(e){super(),this.value=e}type="Comment"},Pe=class extends Re{type="Expression"},Co=class extends Pe{constructor(e,n,r){super(),this.object=e,this.property=n,this.computed=r}type="MemberExpression"},Nt=class extends Pe{constructor(e,n){super(),this.callee=e,this.args=n}type="CallExpression"},sn=class extends Pe{constructor(e){super(),this.value=e}type="Identifier"},on=class extends Pe{constructor(e){super(),this.value=e}type="Literal"},No=class extends on{type="IntegerLiteral"},zo=class extends on{type="FloatLiteral"},zt=class extends on{type="StringLiteral"},jo=class extends on{type="ArrayLiteral"},jt=class extends on{type="TupleLiteral"},$o=class extends on{type="ObjectLiteral"},_n=class extends Pe{constructor(e,n,r){super(),this.operator=e,this.left=n,this.right=r}type="BinaryExpression"},Ko=class extends Pe{constructor(e,n){super(),this.operand=e,this.filter=n}type="FilterExpression"},Ho=class extends Re{constructor(e,n){super(),this.filter=e,this.body=n}type="FilterStatement"},Vo=class extends Pe{constructor(e,n){super(),this.lhs=e,this.test=n}type="SelectExpression"},Qo=class extends Pe{constructor(e,n,r){super(),this.operand=e,this.negate=n,this.test=r}type="TestExpression"},Xo=class extends Pe{constructor(e,n){super(),this.operator=e,this.argument=n}type="UnaryExpression"},Zo=class extends Pe{constructor(e=void 0,n=void 0,r=void 0){super(),this.start=e,this.stop=n,this.step=r}type="SliceExpression"},Yo=class extends Pe{constructor(e,n){super(),this.key=e,this.value=n}type="KeywordArgumentExpression"},Jo=class extends Pe{constructor(e){super(),this.argument=e}type="SpreadExpression"},ei=class extends Re{constructor(e,n,r){super(),this.call=e,this.callerArgs=n,this.body=r}type="CallStatement"},ni=class extends Pe{constructor(e,n,r){super(),this.condition=e,this.trueExpr=n,this.falseExpr=r}type="Ternary"};Kt=class extends Error{},Ht=class extends Error{},ui=new Map,De=class{type="RuntimeValue";value;get builtins(){return ui}constructor(e=void 0){this.value=e}__bool__(){return new A(!!this.value)}toString(){return String(this.value)}},O=class extends De{type="IntegerValue"},ce=class extends De{type="FloatValue";toString(){return this.value%1===0?this.value.toFixed(1):this.value.toString()}},k=class extends De{type="StringValue";_builtins;get builtins(){return this._builtins??=new Map([["upper",new te(()=>new k(this.value.toUpperCase()))],["lower",new te(()=>new k(this.value.toLowerCase()))],["strip",new te(()=>new k(this.value.trim()))],["title",new te(()=>new k(ti(this.value)))],["capitalize",new te(()=>new k(this.value.charAt(0).toUpperCase()+this.value.slice(1)))],["length",new O(this.value.length)],["rstrip",new te(()=>new k(this.value.trimEnd()))],["lstrip",new te(()=>new k(this.value.trimStart()))],["startswith",new te(e=>{if(e.length===0)throw new Error("startswith() requires at least one argument");let n=e[0];if(n instanceof k)return new A(this.value.startsWith(n.value));if(n instanceof I){for(let r of n.value){if(!(r instanceof k))throw new Error("startswith() tuple elements must be strings");if(this.value.startsWith(r.value))return new A(!0)}return new A(!1)}throw new Error("startswith() argument must be a string or tuple of strings")})],["endswith",new te(e=>{if(e.length===0)throw new Error("endswith() requires at least one argument");let n=e[0];if(n instanceof k)return new A(this.value.endsWith(n.value));if(n instanceof I){for(let r of n.value){if(!(r instanceof k))throw new Error("endswith() tuple elements must be strings");if(this.value.endsWith(r.value))return new A(!0)}return new A(!1)}throw new Error("endswith() argument must be a string or tuple of strings")})],["split",new te(e=>{let n=e[0]??new se;if(!(n instanceof k||n instanceof se))throw new Error("sep argument must be a string or null");let r=e[1]??new O(-1);if(!(r instanceof O))throw new Error("maxsplit argument must be a number");let t=[];if(n instanceof se){let a=this.value.trimStart();for(let{0:s,index:o}of a.matchAll(/\S+/g)){if(r.value!==-1&&t.length>=r.value&&o!==void 0){t.push(s+a.slice(o+s.length));break}t.push(s)}}else{if(n.value==="")throw new Error("empty separator");t=this.value.split(n.value),r.value!==-1&&t.length>r.value&&t.push(t.splice(r.value).join(n.value))}return new I(t.map(a=>new k(a)))})],["replace",new te(e=>{if(e.length<2)throw new Error("replace() requires at least two arguments");let n=e[0],r=e[1];if(!(n instanceof k&&r instanceof k))throw new Error("replace() arguments must be strings");let t;if(e.length>2?e[2].type==="KeywordArgumentsValue"?t=e[2].value.get("count")??new se:t=e[2]:t=new se,!(t instanceof O||t instanceof se))throw new Error("replace() count argument must be a number or null");return new k(ii(this.value,n.value,r.value,t.value))})]])}},A=class extends De{type="BooleanValue"},li=/[\x7f-\uffff]/g;ye=class extends De{type="ObjectValue";_builtins;__bool__(){return new A(this.value.size>0)}get builtins(){return this._builtins??=new Map([["get",new te(([e,n])=>{if(!(e instanceof k))throw new Error(`Object key must be a string: got ${e.type}`);return this.value.get(e.value)??n??new se})],["items",new te(()=>this.items())],["keys",new te(()=>this.keys())],["values",new te(()=>this.values())],["dictsort",new te(e=>{let n=new Map,r=e.filter(i=>i instanceof vn?(n=i.value,!1):!0),t=r.at(0)??n.get("case_sensitive")??new A(!1);if(!(t instanceof A))throw new Error("case_sensitive must be a boolean");let a=r.at(1)??n.get("by")??new k("key");if(!(a instanceof k))throw new Error("by must be a string");if(!["key","value"].includes(a.value))throw new Error("by must be either 'key' or 'value'");let s=r.at(2)??n.get("reverse")??new A(!1);if(!(s instanceof A))throw new Error("reverse must be a boolean");let o=Array.from(this.value.entries()).map(([i,u])=>new I([new k(i),u])).sort((i,u)=>{let l=a.value==="key"?0:1,c=i.value[l],d=u.value[l],p=Fr(c,d,t.value);return s.value?-p:p});return new I(o)})]])}items(){return new I(Array.from(this.value.entries()).map(([e,n])=>new I([new k(e),n])))}keys(){return new I(Array.from(this.value.keys()).map(e=>new k(e)))}values(){return new I(Array.from(this.value.values()))}toString(){return Ye(this,{},0,!1)}},vn=class extends ye{type="KeywordArgumentsValue"},I=class extends De{type="ArrayValue";_builtins;get builtins(){return this._builtins??=new Map([["length",new O(this.value.length)]])}__bool__(){return new A(this.value.length>0)}toString(){return Ye(this,{},0,!1)}},Qt=class extends I{type="TupleValue"},te=class extends De{type="FunctionValue"},se=class extends De{type="NullValue"},re=class extends De{type="UndefinedValue"},Zt=class{constructor(e){this.parent=e}variables=new Map([["namespace",new te(e=>{if(e.length===0)return new ye(new Map);if(e.length!==1||!(e[0]instanceof ye))throw new Error("`namespace` expects either zero arguments or a single object argument");return e[0]})]]);tests=Zt.TESTS;set(e,n){return this.declareVariable(e,jn(n))}declareVariable(e,n){if(this.variables.has(e))throw new SyntaxError(`Variable already declared: ${e}`);return this.variables.set(e,n),n}setVariable(e,n){return this.variables.set(e,n),n}resolve(e){if(this.variables.has(e))return this;if(this.parent)return this.parent.resolve(e);throw new Error(`Unknown variable: ${e}`)}lookupVariable(e){try{return this.resolve(e).variables.get(e)??new re}catch{return new re}}},Ie=Zt;Go(Ie,"TESTS",new Map([["boolean",e=>e.type==="BooleanValue"],["callable",e=>e instanceof te],["odd",e=>{if(!(e instanceof O))throw new Error(`cannot odd on ${e.type}`);return e.value%2!==0}],["even",e=>{if(!(e instanceof O))throw new Error(`cannot even on ${e.type}`);return e.value%2===0}],["false",e=>e.type==="BooleanValue"&&!e.value],["true",e=>e.type==="BooleanValue"&&e.value],["none",e=>e.type==="NullValue"],["string",e=>e.type==="StringValue"],["number",e=>e instanceof O||e instanceof ce],["integer",e=>e instanceof O],["iterable",e=>e.type==="ArrayValue"||e.type==="StringValue"],["mapping",e=>e instanceof ye],["sequence",e=>e instanceof I||e instanceof ye||e instanceof k],["lower",e=>{let n=e.value;return e.type==="StringValue"&&n===n.toLowerCase()}],["upper",e=>{let n=e.value;return e.type==="StringValue"&&n===n.toUpperCase()}],["none",e=>e.type==="NullValue"],["defined",e=>e.type!=="UndefinedValue"],["undefined",e=>e.type==="UndefinedValue"],["equalto",(e,n)=>e.value===n.value],["eq",(e,n)=>e.value===n.value]]));Mr=class{global;constructor(e){this.global=e??new Ie}run(e){return this.evaluate(e,this.global)}evaluateBinaryExpression(e,n){let r=this.evaluate(e.left,n);switch(e.operator.value){case"and":return r.__bool__().value?this.evaluate(e.right,n):r;case"or":return r.__bool__().value?r:this.evaluate(e.right,n)}let t=this.evaluate(e.right,n);switch(e.operator.value){case"==":return new A(r.value==t.value);case"!=":return new A(r.value!=t.value)}if(r instanceof re||t instanceof re){if(t instanceof re&&["in","not in"].includes(e.operator.value))return new A(e.operator.value==="not in");throw new Error(`Cannot perform operation ${e.operator.value} on undefined values`)}else{if(r instanceof se||t instanceof se)throw new Error("Cannot perform operation on null values");if(e.operator.value==="~")return new k(r.value.toString()+t.value.toString());if((r instanceof O||r instanceof ce)&&(t instanceof O||t instanceof ce)){let a=r.value,s=t.value;switch(e.operator.value){case"+":case"-":case"*":{let o=e.operator.value==="+"?a+s:e.operator.value==="-"?a-s:a*s;return r instanceof ce||t instanceof ce?new ce(o):new O(o)}case"/":return new ce(a/s);case"%":{let o=a%s;return r instanceof ce||t instanceof ce?new ce(o):new O(o)}case"<":return new A(a<s);case">":return new A(a>s);case">=":return new A(a>=s);case"<=":return new A(a<=s)}}else if(r instanceof I&&t instanceof I){if(e.operator.value==="+")return new I(r.value.concat(t.value))}else if(t instanceof I){let a=t.value.find(s=>s.value===r.value)!==void 0;switch(e.operator.value){case"in":return new A(a);case"not in":return new A(!a)}}}if((r instanceof k||t instanceof k)&&e.operator.value==="+")return new k(r.value.toString()+t.value.toString());if(r instanceof k&&t instanceof k)switch(e.operator.value){case"in":return new A(t.value.includes(r.value));case"not in":return new A(!t.value.includes(r.value))}if(r instanceof k&&t instanceof ye)switch(e.operator.value){case"in":return new A(t.value.has(r.value));case"not in":return new A(!t.value.has(r.value))}throw new SyntaxError(`Unknown operator "${e.operator.value}" between ${r.type} and ${t.type}`)}evaluateArguments(e,n){let r=[],t=new Map;for(let a of e)if(a.type==="SpreadExpression"){let s=a,o=this.evaluate(s.argument,n);if(!(o instanceof I))throw new Error(`Cannot unpack non-iterable type: ${o.type}`);for(let i of o.value)r.push(i)}else if(a.type==="KeywordArgumentExpression"){let s=a;t.set(s.key.value,this.evaluate(s.value,n))}else{if(t.size>0)throw new Error("Positional arguments must come before keyword arguments");r.push(this.evaluate(a,n))}return[r,t]}applyFilter(e,n,r){if(n.type==="Identifier"){let t=n;if(t.value==="safe")return e;if(t.value==="tojson")return new k(Ye(e,{}));if(e instanceof I)switch(t.value){case"list":return e;case"first":return e.value[0];case"last":return e.value[e.value.length-1];case"length":return new O(e.value.length);case"reverse":return new I(e.value.slice().reverse());case"sort":return new I(e.value.slice().sort((a,s)=>Fr(a,s,!1)));case"join":return new k(e.value.map(a=>a.value).join(""));case"string":return new k(Ye(e,{},0,!1));case"unique":{let a=new Set,s=[];for(let o of e.value)a.has(o.value)||(a.add(o.value),s.push(o));return new I(s)}default:throw new Error(`Unknown ArrayValue filter: ${t.value}`)}else if(e instanceof k)switch(t.value){case"length":case"upper":case"lower":case"title":case"capitalize":{let a=e.builtins.get(t.value);if(a instanceof te)return a.value([],r);if(a instanceof O)return a;throw new Error(`Unknown StringValue filter: ${t.value}`)}case"trim":return new k(e.value.trim());case"indent":return new k(e.value.split(`
`).map((a,s)=>s===0||a.length===0?a:"    "+a).join(`
`));case"join":case"string":return e;case"int":{let a=parseInt(e.value,10);return new O(isNaN(a)?0:a)}case"float":{let a=parseFloat(e.value);return new ce(isNaN(a)?0:a)}default:throw new Error(`Unknown StringValue filter: ${t.value}`)}else if(e instanceof O||e instanceof ce)switch(t.value){case"abs":return e instanceof O?new O(Math.abs(e.value)):new ce(Math.abs(e.value));case"int":return new O(Math.floor(e.value));case"float":return new ce(e.value);case"string":return new k(e.toString());default:throw new Error(`Unknown NumericValue filter: ${t.value}`)}else if(e instanceof ye)switch(t.value){case"items":return new I(Array.from(e.value.entries()).map(([a,s])=>new I([new k(a),s])));case"length":return new O(e.value.size);default:{let a=e.builtins.get(t.value);if(a)return a instanceof te?a.value([],r):a;throw new Error(`Unknown ObjectValue filter: ${t.value}`)}}else if(e instanceof A)switch(t.value){case"bool":return new A(e.value);case"int":return new O(e.value?1:0);case"float":return new ce(e.value?1:0);case"string":return new k(e.value?"true":"false");default:throw new Error(`Unknown BooleanValue filter: ${t.value}`)}throw new Error(`Cannot apply filter "${t.value}" to type: ${e.type}`)}else if(n.type==="CallExpression"){let t=n;if(t.callee.type!=="Identifier")throw new Error(`Unknown filter: ${t.callee.type}`);let a=t.callee.value;if(a==="tojson"){let[,s]=this.evaluateArguments(t.args,r),o=s.get("indent")??new se;if(!(o instanceof O||o instanceof se))throw new Error("If set, indent must be a number");let i=s.get("ensure_ascii")??new A(!1);if(!(i instanceof A))throw new Error("If set, ensure_ascii must be a boolean");let u=s.get("sort_keys")??new A(!1);if(!(u instanceof A))throw new Error("If set, sort_keys must be a boolean");let l=s.get("separators")??new se,c=null;if(l instanceof I||l instanceof Qt){if(l.value.length!==2)throw new Error("separators must be a tuple of two strings");let[d,p]=l.value;if(!(d instanceof k)||!(p instanceof k))throw new Error("separators must be a tuple of two strings");c=[d.value,p.value]}else if(!(l instanceof se))throw new Error("If set, separators must be a tuple of two strings");return new k(Ye(e,{indent:o.value,ensureAscii:i.value,sortKeys:u.value,separators:c}))}else if(a==="join"){let s;if(e instanceof k)s=Array.from(e.value);else if(e instanceof I)s=e.value.map(l=>l.value);else throw new Error(`Cannot apply filter "${a}" to type: ${e.type}`);let[o,i]=this.evaluateArguments(t.args,r),u=o.at(0)??i.get("separator")??new k("");if(!(u instanceof k))throw new Error("separator must be a string");return new k(s.join(u.value))}else if(a==="int"||a==="float"){let[s,o]=this.evaluateArguments(t.args,r),i=s.at(0)??o.get("default")??(a==="int"?new O(0):new ce(0));if(e instanceof k){let u=a==="int"?parseInt(e.value,10):parseFloat(e.value);return isNaN(u)?i:a==="int"?new O(u):new ce(u)}else{if(e instanceof O||e instanceof ce)return e;if(e instanceof A)return a==="int"?new O(e.value?1:0):new ce(e.value?1:0);throw new Error(`Cannot apply filter "${a}" to type: ${e.type}`)}}else if(a==="default"){let[s,o]=this.evaluateArguments(t.args,r),i=s[0]??new k(""),u=s[1]??o.get("boolean")??new A(!1);if(!(u instanceof A))throw new Error("`default` filter flag must be a boolean");return e instanceof re||u.value&&!e.__bool__().value?i:e}if(e instanceof I){switch(a){case"sort":{let[s,o]=this.evaluateArguments(t.args,r),i=s.at(0)??o.get("reverse")??new A(!1);if(!(i instanceof A))throw new Error("reverse must be a boolean");let u=s.at(1)??o.get("case_sensitive")??new A(!1);if(!(u instanceof A))throw new Error("case_sensitive must be a boolean");let l=s.at(2)??o.get("attribute")??new se;if(!(l instanceof k||l instanceof O||l instanceof se))throw new Error("attribute must be a string, integer, or null");let c=d=>{if(l instanceof se)return d;let p=l instanceof O?String(l.value):l.value;return Xt(d,p)};return new I(e.value.slice().sort((d,p)=>{let f=c(d),m=c(p),_=Fr(f,m,u.value);return i.value?-_:_}))}case"selectattr":case"rejectattr":{let s=a==="selectattr";if(e.value.some(d=>!(d instanceof ye)))throw new Error(`\`${a}\` can only be applied to array of objects`);if(t.args.some(d=>d.type!=="StringLiteral"))throw new Error(`arguments of \`${a}\` must be strings`);let[o,i,u]=t.args.map(d=>this.evaluate(d,r)),l;if(i){let d=r.tests.get(i.value);if(!d)throw new Error(`Unknown test: ${i.value}`);l=d}else l=(...d)=>d[0].__bool__().value;let c=e.value.filter(d=>{let p=d.value.get(o.value),f=p?l(p,u):!1;return s?f:!f});return new I(c)}case"map":{let[,s]=this.evaluateArguments(t.args,r);if(s.has("attribute")){let o=s.get("attribute");if(!(o instanceof k))throw new Error("attribute must be a string");let i=s.get("default"),u=e.value.map(l=>{if(!(l instanceof ye))throw new Error("items in map must be an object");let c=Xt(l,o.value);return c instanceof re?i??new re:c});return new I(u)}else throw new Error("`map` expressions without `attribute` set are not currently supported.")}}throw new Error(`Unknown ArrayValue filter: ${a}`)}else if(e instanceof k){switch(a){case"indent":{let[s,o]=this.evaluateArguments(t.args,r),i=s.at(0)??o.get("width")??new O(4);if(!(i instanceof O))throw new Error("width must be a number");let u=s.at(1)??o.get("first")??new A(!1),l=s.at(2)??o.get("blank")??new A(!1),c=e.value.split(`
`),d=" ".repeat(i.value),p=c.map((f,m)=>!u.value&&m===0||!l.value&&f.length===0?f:d+f);return new k(p.join(`
`))}case"replace":{let s=e.builtins.get("replace");if(!(s instanceof te))throw new Error("replace filter not available");let[o,i]=this.evaluateArguments(t.args,r);return s.value([...o,new vn(i)],r)}}throw new Error(`Unknown StringValue filter: ${a}`)}else if(e instanceof ye){let s=e.builtins.get(a);if(s&&s instanceof te){let[o,i]=this.evaluateArguments(t.args,r);return i.size>0&&o.push(new vn(i)),s.value(o,r)}throw new Error(`Unknown ObjectValue filter: ${a}`)}else throw new Error(`Cannot apply filter "${a}" to type: ${e.type}`)}throw new Error(`Unknown filter: ${n.type}`)}evaluateFilterExpression(e,n){let r=this.evaluate(e.operand,n);return this.applyFilter(r,e.filter,n)}evaluateTestExpression(e,n){let r=this.evaluate(e.operand,n),t=n.tests.get(e.test.value);if(!t)throw new Error(`Unknown test: ${e.test.value}`);let a=t(r);return new A(e.negate?!a:a)}evaluateSelectExpression(e,n){return this.evaluate(e.test,n).__bool__().value?this.evaluate(e.lhs,n):new re}evaluateUnaryExpression(e,n){let r=this.evaluate(e.argument,n);if(e.operator.value==="not")return new A(!r.value);throw new SyntaxError(`Unknown operator: ${e.operator.value}`)}evaluateTernaryExpression(e,n){return this.evaluate(e.condition,n).__bool__().value?this.evaluate(e.trueExpr,n):this.evaluate(e.falseExpr,n)}evalProgram(e,n){return this.evaluateBlock(e.body,n)}evaluateBlock(e,n){let r="";for(let t of e){let a=this.evaluate(t,n);a.type!=="NullValue"&&a.type!=="UndefinedValue"&&(r+=a.toString())}return new k(r)}evaluateIdentifier(e,n){return n.lookupVariable(e.value)}evaluateCallExpression(e,n){let[r,t]=this.evaluateArguments(e.args,n);t.size>0&&r.push(new vn(t));let a=this.evaluate(e.callee,n);if(a.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${a.type}`);return a.value(r,n)}evaluateSliceExpression(e,n,r){if(!(e instanceof I||e instanceof k))throw new Error("Slice object must be an array or string");let t=this.evaluate(n.start,r),a=this.evaluate(n.stop,r),s=this.evaluate(n.step,r);if(!(t instanceof O||t instanceof re))throw new Error("Slice start must be numeric or undefined");if(!(a instanceof O||a instanceof re))throw new Error("Slice stop must be numeric or undefined");if(!(s instanceof O||s instanceof re))throw new Error("Slice step must be numeric or undefined");return e instanceof I?new I($t(e.value,t.value,a.value,s.value)):new k($t(Array.from(e.value),t.value,a.value,s.value).join(""))}evaluateMemberExpression(e,n){let r=this.evaluate(e.object,n),t;if(e.computed){if(e.property.type==="SliceExpression")return this.evaluateSliceExpression(r,e.property,n);t=this.evaluate(e.property,n)}else e.property.type==="IntegerLiteral"?t=new O(e.property.value):t=new k(e.property.value);let a;if(r instanceof ye){if(!(t instanceof k))throw new Error(`Cannot access property with non-string: got ${t.type}`);a=r.value.get(t.value)??r.builtins.get(t.value)}else if(r instanceof I||r instanceof k)if(t instanceof O)a=r.value.at(t.value),r instanceof k&&(a=new k(r.value.at(t.value)));else if(t instanceof k)a=r.builtins.get(t.value);else throw new Error(`Cannot access property with non-string/non-number: got ${t.type}`);else{if(!(t instanceof k))throw new Error(`Cannot access property with non-string: got ${t.type}`);a=r.builtins.get(t.value)}return a instanceof De?a:new re}evaluateSet(e,n){let r=e.value?this.evaluate(e.value,n):this.evaluateBlock(e.body,n);if(e.assignee.type==="Identifier"){let t=e.assignee.value;n.setVariable(t,r)}else if(e.assignee.type==="TupleLiteral"){let t=e.assignee;if(!(r instanceof I))throw new Error(`Cannot unpack non-iterable type in set: ${r.type}`);let a=r.value;if(a.length!==t.value.length)throw new Error(`Too ${t.value.length>a.length?"few":"many"} items to unpack in set`);for(let s=0;s<t.value.length;++s){let o=t.value[s];if(o.type!=="Identifier")throw new Error(`Cannot unpack to non-identifier in set: ${o.type}`);n.setVariable(o.value,a[s])}}else if(e.assignee.type==="MemberExpression"){let t=e.assignee,a=this.evaluate(t.object,n);if(!(a instanceof ye))throw new Error("Cannot assign to member of non-object");if(t.property.type!=="Identifier")throw new Error("Cannot assign to member with non-identifier property");a.value.set(t.property.value,r)}else throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(e.assignee)}`);return new se}evaluateIf(e,n){let r=this.evaluate(e.test,n);return this.evaluateBlock(r.__bool__().value?e.body:e.alternate,n)}evaluateFor(e,n){let r=new Ie(n),t,a;if(e.iterable.type==="SelectExpression"){let l=e.iterable;a=this.evaluate(l.lhs,r),t=l.test}else a=this.evaluate(e.iterable,r);if(!(a instanceof I||a instanceof ye))throw new Error(`Expected iterable or object type in for loop: got ${a.type}`);a instanceof ye&&(a=a.keys());let s=[],o=[];for(let l=0;l<a.value.length;++l){let c=new Ie(r),d=a.value[l],p;if(e.loopvar.type==="Identifier")p=f=>f.setVariable(e.loopvar.value,d);else if(e.loopvar.type==="TupleLiteral"){let f=e.loopvar;if(d.type!=="ArrayValue")throw new Error(`Cannot unpack non-iterable type: ${d.type}`);let m=d;if(f.value.length!==m.value.length)throw new Error(`Too ${f.value.length>m.value.length?"few":"many"} items to unpack`);p=_=>{for(let E=0;E<f.value.length;++E){if(f.value[E].type!=="Identifier")throw new Error(`Cannot unpack non-identifier type: ${f.value[E].type}`);_.setVariable(f.value[E].value,m.value[E])}}}else throw new Error(`Invalid loop variable(s): ${e.loopvar.type}`);t&&(p(c),!this.evaluate(t,c).__bool__().value)||(s.push(d),o.push(p))}let i="",u=!0;for(let l=0;l<s.length;++l){let c=new Map([["index",new O(l+1)],["index0",new O(l)],["revindex",new O(s.length-l)],["revindex0",new O(s.length-l-1)],["first",new A(l===0)],["last",new A(l===s.length-1)],["length",new O(s.length)],["previtem",l>0?s[l-1]:new re],["nextitem",l<s.length-1?s[l+1]:new re]]);r.setVariable("loop",new ye(c)),o[l](r);try{let d=this.evaluateBlock(e.body,r);i+=d.value}catch(d){if(d instanceof Ht)continue;if(d instanceof Kt)break;throw d}u=!1}if(u){let l=this.evaluateBlock(e.defaultBlock,r);i+=l.value}return new k(i)}evaluateMacro(e,n){return n.setVariable(e.name.value,new te((r,t)=>{let a=new Ie(t);r=r.slice();let s;r.at(-1)?.type==="KeywordArgumentsValue"&&(s=r.pop());for(let o=0;o<e.args.length;++o){let i=e.args[o],u=r[o];if(i.type==="Identifier"){let l=i;if(!u)throw new Error(`Missing positional argument: ${l.value}`);a.setVariable(l.value,u)}else if(i.type==="KeywordArgumentExpression"){let l=i,c=u??s?.value.get(l.key.value)??this.evaluate(l.value,a);a.setVariable(l.key.value,c)}else throw new Error(`Unknown argument type: ${i.type}`)}return this.evaluateBlock(e.body,a)})),new se}evaluateCallStatement(e,n){let r=new te((i,u)=>{let l=new Ie(u);if(e.callerArgs)for(let c=0;c<e.callerArgs.length;++c){let d=e.callerArgs[c];if(d.type!=="Identifier")throw new Error(`Caller parameter must be an identifier, got ${d.type}`);l.setVariable(d.value,i[c]??new re)}return this.evaluateBlock(e.body,l)}),[t,a]=this.evaluateArguments(e.call.args,n);t.push(new vn(a));let s=this.evaluate(e.call.callee,n);if(s.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${s.type}`);let o=new Ie(n);return o.setVariable("caller",r),s.value(t,o)}evaluateFilterStatement(e,n){let r=this.evaluateBlock(e.body,n);return this.applyFilter(r,e.filter,n)}evaluate(e,n){if(!e)return new re;switch(e.type){case"Program":return this.evalProgram(e,n);case"Set":return this.evaluateSet(e,n);case"If":return this.evaluateIf(e,n);case"For":return this.evaluateFor(e,n);case"Macro":return this.evaluateMacro(e,n);case"CallStatement":return this.evaluateCallStatement(e,n);case"Break":throw new Kt;case"Continue":throw new Ht;case"IntegerLiteral":return new O(e.value);case"FloatLiteral":return new ce(e.value);case"StringLiteral":return new k(e.value);case"ArrayLiteral":return new I(e.value.map(r=>this.evaluate(r,n)));case"TupleLiteral":return new Qt(e.value.map(r=>this.evaluate(r,n)));case"ObjectLiteral":{let r=new Map;for(let[t,a]of e.value){let s=this.evaluate(t,n);if(!(s instanceof k))throw new Error(`Object keys must be strings: got ${s.type}`);r.set(s.value,this.evaluate(a,n))}return new ye(r)}case"Identifier":return this.evaluateIdentifier(e,n);case"CallExpression":return this.evaluateCallExpression(e,n);case"MemberExpression":return this.evaluateMemberExpression(e,n);case"UnaryExpression":return this.evaluateUnaryExpression(e,n);case"BinaryExpression":return this.evaluateBinaryExpression(e,n);case"FilterExpression":return this.evaluateFilterExpression(e,n);case"FilterStatement":return this.evaluateFilterStatement(e,n);case"TestExpression":return this.evaluateTestExpression(e,n);case"SelectExpression":return this.evaluateSelectExpression(e,n);case"Ternary":return this.evaluateTernaryExpression(e,n);case"Comment":return new se;default:throw new SyntaxError(`Unknown node type: ${e.type}`)}}};ge=`
`,di="{%- ",pi=" -%}";Hn=class{parsed;constructor(e){let n=$n(e,{lstrip_blocks:!0,trim_blocks:!0});this.parsed=Kn(n)}render(e){let n=new Ie;if(ci(n),e)for(let[a,s]of Object.entries(e))n.set(a,s);return new Mr(n).run(this.parsed).value}format(e){return mi(this.parsed,e?.indent||"	")}}});function ze(e=null){if(e!==null&&typeof e=="object"&&ma.has(e))return e;let n=Lr(e)?e:{},r=Lr(n.adapterInfo)?n.adapterInfo:{},t=Lr(n.limits)?n.limits:{},a={adapterInfo:Bl(r),features:Yn(n.features),wgslLanguageFeatures:Jn(n.wgslLanguageFeatures),limits:er(t)};return ma.add(a),a}function ga(e){let n=new Set(e),r={size:n.size,has(t){return n.has(t)},entries(){return n.entries()},forEach(t,a){n.forEach(s=>t.call(a,s,s,r))},keys(){return n.keys()},values(){return n.values()},[Symbol.iterator](){return n[Symbol.iterator]()}};return r}function Yn(e=[]){return ga(ya(e))}function Jn(e=[]){return ga(ya(e))}function xn(e=null){let n=ze(e);return{adapterInfo:{...n.adapterInfo},features:Array.from(n.features.values()).sort(),wgslLanguageFeatures:Array.from(n.wgslLanguageFeatures.values()).sort(),limits:{...n.limits}}}function Cr(e,n){if(!e)return null;for(let r of e.requiredFeatures??[])if(!n.features.has(r))return`requires device.features.has("${r}")`;for(let r of e.requiredWGSLLanguageFeatures??[])if(!n.wgslLanguageFeatures.has(r))return`requires device.wgslLanguageFeatures.has("${r}")`;for(let[r,t]of Object.entries(e.requiredLimits??{})){if(t===void 0)continue;let a=n.limits[r];if(typeof a!="number"||a<t)return`requires device.limits.${r} >= ${t}`}if(e.requiredSubgroupMinSize!==void 0){let r=n.adapterInfo.subgroupMinSize;if(typeof r!="number")return`requires adapterInfo.subgroupMinSize >= ${e.requiredSubgroupMinSize} (adapter does not report subgroup sizes)`;if(r<e.requiredSubgroupMinSize)return`requires adapterInfo.subgroupMinSize >= ${e.requiredSubgroupMinSize}`}return null}function ha(e){let n=e.adapterInfo;return{vendor:typeof n.vendor=="string"?n.vendor.toLowerCase():"",architecture:typeof n.architecture=="string"?n.architecture.toLowerCase():"",...typeof n.subgroupMinSize=="number"?{subgroupMinSize:n.subgroupMinSize}:{},...typeof n.subgroupMaxSize=="number"?{subgroupMaxSize:n.subgroupMaxSize}:{},isFallbackAdapter:n.isFallbackAdapter===!0}}function Bl(e){return{...Wl,...e}}function er(e){let n={...Ml};for(let r of Fl){let t=ql(e,r);t!==void 0&&(n[r]=t)}for(let[r,t]of Object.entries(e))typeof t=="number"&&Number.isFinite(t)&&(n[r]=t);return n}function ya(e){return e==null?[]:Array.isArray(e)?e.filter(Ur):typeof e[Symbol.iterator]=="function"?Array.from(e).filter(Ur):typeof e.values=="function"?Array.from(e.values()).filter(Ur):[]}function ql(e,n){let r=e[n];return typeof r=="number"&&Number.isFinite(r)?r:void 0}function Ur(e){return typeof e=="string"}function Lr(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}var Wl,Fl,Ml,ma,kn=he(()=>{"use strict";Wl=Object.freeze({vendor:"",architecture:"",device:"",description:""}),Fl=Object.freeze(["maxTextureDimension1D","maxTextureDimension2D","maxTextureDimension3D","maxTextureArrayLayers","maxBindGroups","maxBindGroupsPlusVertexBuffers","maxBindingsPerBindGroup","maxDynamicUniformBuffersPerPipelineLayout","maxDynamicStorageBuffersPerPipelineLayout","maxSampledTexturesPerShaderStage","maxSamplersPerShaderStage","maxStorageBuffersPerShaderStage","maxStorageTexturesPerShaderStage","maxUniformBuffersPerShaderStage","maxUniformBufferBindingSize","maxStorageBufferBindingSize","minUniformBufferOffsetAlignment","minStorageBufferOffsetAlignment","maxVertexBuffers","maxBufferSize","maxVertexAttributes","maxVertexBufferArrayStride","maxInterStageShaderVariables","maxColorAttachments","maxColorAttachmentBytesPerSample","maxComputeWorkgroupStorageSize","maxComputeInvocationsPerWorkgroup","maxComputeWorkgroupSizeX","maxComputeWorkgroupSizeY","maxComputeWorkgroupSizeZ","maxComputeWorkgroupsPerDimension","maxImmediateSize","maxStorageBuffersInVertexStage","maxStorageBuffersInFragmentStage","maxStorageTexturesInVertexStage","maxStorageTexturesInFragmentStage"]),Ml=Object.freeze({maxTextureDimension1D:8192,maxTextureDimension2D:8192,maxTextureDimension3D:2048,maxTextureArrayLayers:256,maxBindGroups:4,maxBindGroupsPlusVertexBuffers:24,maxBindingsPerBindGroup:1e3,maxDynamicUniformBuffersPerPipelineLayout:8,maxDynamicStorageBuffersPerPipelineLayout:4,maxSampledTexturesPerShaderStage:16,maxSamplersPerShaderStage:16,maxStorageBuffersPerShaderStage:8,maxStorageTexturesPerShaderStage:4,maxUniformBuffersPerShaderStage:12,maxUniformBufferBindingSize:64*1024,maxStorageBufferBindingSize:128*1024*1024,minUniformBufferOffsetAlignment:256,minStorageBufferOffsetAlignment:256,maxVertexBuffers:8,maxBufferSize:256*1024*1024,maxVertexAttributes:16,maxVertexBufferArrayStride:2048,maxInterStageShaderVariables:16,maxColorAttachments:8,maxColorAttachmentBytesPerSample:32,maxComputeInvocationsPerWorkgroup:256,maxComputeWorkgroupSizeX:256,maxComputeWorkgroupSizeY:256,maxComputeWorkgroupSizeZ:64,maxComputeWorkgroupStorageSize:16*1024,maxComputeWorkgroupsPerDimension:65535,maxImmediateSize:64}),ma=new WeakSet});function ba(e){return Object.fromEntries(Object.entries(e).filter(([,n])=>n!==void 0))}var wa=he(()=>{"use strict"});function va(e){if(e==="u32"||e==="i32"||e==="f32")return{align:4,size:4,scalar:e,components:1};let n=Il.exec(e);if(!n)throw new Error(`Unsupported uniform field type: ${e}`);let r=Number(n[1]);return{align:r===2?8:16,size:r===3?12:r*4,scalar:n[2],components:r}}function Dl(e){return e==="u32"||e==="i32"||e==="f32"}function _a(e,n){return Math.ceil(e/n)*n}function Nr(e,n={}){return En(e,"u32",n)}function zr(e,n={}){return En(e,"i32",n)}function jr(e,n={}){return En(e,"f32",n)}function En(e,n,r={}){return ka(e,"uniform field"),va(n),Object.freeze({kind:"uniform-field",name:e,type:n,semantic:r.semantic,required:r.required??!r.internal,internal:!!r.internal,default:r.default,description:r.description})}function Pn(e,n,r={}){if(ka(e,"uniform struct"),!Array.isArray(n)||n.length===0)throw new Error(`uniform struct ${e} requires at least one field`);let t=n.map(a=>Cl(a,e));return Object.freeze({kind:"uniform-struct",name:e,fields:Object.freeze(Nl(t,r))})}function $r(e){Kr(e);let n=e.fields.map(r=>`${r.name}: ${r.type}`).join(", ");return`struct ${e.name} { ${n} };`}function Sa(e,n={}){if(Kr(e),!e.fields.every(i=>Dl(i.type)))return Ul(e,n);let r=Math.max(16,Math.ceil(e.fields.length*4/16)*16),t=new ArrayBuffer(r),a=new Uint32Array(t),s=new Int32Array(t),o=new Float32Array(t);return e.fields.forEach((i,u)=>{let l=n[i.name];if(l===void 0&&i.required)throw new Error(`Missing uniform field ${e.name}.${i.name}`);if(l===void 0&&(l=i.default??0),typeof l!="number")throw new Error(`Uniform ${e.name}.${i.name} expects a scalar number`);zl({field:i,index:u,value:l,u32View:a,i32View:s,f32View:o})}),new Uint32Array(t)}function Ul(e,n){let r=[],t=0;for(let u of e.fields){let l=va(u.type);t=_a(t,l.align),r.push({field:u,layout:l,offset:t}),t+=l.size}let a=new ArrayBuffer(Math.max(16,_a(t,16))),s=new Uint32Array(a),o=new Int32Array(a),i=new Float32Array(a);for(let{field:u,layout:l,offset:c}of r){let d=n[u.name];if(d===void 0&&u.required)throw new Error(`Missing uniform field ${e.name}.${u.name}`);d===void 0&&(d=u.default??(l.components===1?0:new Array(l.components).fill(0)));let p=typeof d=="number"?[d]:d;if(p.length!==l.components)throw new Error(`Uniform ${e.name}.${u.name} expects ${l.components} component(s), got ${p.length}`);for(let f=0;f<l.components;++f)Ll(l.scalar,(c+f*4)/4,p[f],`${e.name}.${u.name}[${f}]`,s,o,i)}return new Uint32Array(a)}function Ll(e,n,r,t,a,s,o){if(e==="u32"){if(!Number.isInteger(r)||r<0||r>4294967295)throw new Error(`Uniform ${t} must be an integer u32 in [0, 4294967295]`);a[n]=r;return}if(e==="i32"){if(!Number.isInteger(r)||r<-2147483648||r>2147483647)throw new Error(`Uniform ${t} must be an integer i32 in [-2147483648, 2147483647]`);s[n]=r;return}if(!Number.isFinite(r))throw new Error(`Uniform ${t} must be a finite f32`);o[n]=r}function Ta(e,n,r,t){return e.createUniformU32(Sa(n,r),t)}function xa(e){return Kr(e),{kind:e.kind,name:e.name,fields:e.fields.map(n=>ba({name:n.name,type:n.type,required:n.required,internal:n.internal,semantic:n.semantic,default:n.default,description:n.description}))}}function Cl(e,n){if(!e||e.kind!=="uniform-field")throw new Error(`uniform struct ${n} fields must be created with u32(), i32(), or f32()`);return e}function Nl(e,n){let r=n.alignFieldsTo??4;if(!Number.isInteger(r)||r<=0)throw new Error(`alignFieldsTo must be a positive integer, got ${r}`);let t=[...e],a=t.length%r;if(a===0)return Object.freeze(t);let s=r-a,o=0,i=new Set(t.map(u=>u.name));for(let u=0;u<s;++u){for(;i.has(`_pad${o}`);)o++;let l=`_pad${o++}`;i.add(l),t.push(En(l,"u32",{internal:!0,required:!1,default:0}))}return Object.freeze(t)}function zl({field:e,index:n,value:r,u32View:t,i32View:a,f32View:s}){if(e.type==="u32"){if(!Number.isInteger(r)||r<0||r>4294967295)throw new Error(`Uniform ${e.name} must be an integer u32 in [0, 4294967295]`);t[n]=r;return}if(e.type==="i32"){if(!Number.isInteger(r)||r<-2147483648||r>2147483647)throw new Error(`Uniform ${e.name} must be an integer i32 in [-2147483648, 2147483647]`);a[n]=r;return}if(e.type==="f32"){if(!Number.isFinite(r))throw new Error(`Uniform ${e.name} must be a finite f32`);s[n]=r;return}throw new Error(`Unsupported uniform field type: ${e.type}`)}function Kr(e){if(!e||e.kind!=="uniform-struct")throw new Error("Expected a uniform struct schema")}function ka(e,n){if(typeof e!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e))throw new Error(`${n} name must be a WGSL-compatible identifier, got ${e}`)}var Il,nr=he(()=>{"use strict";wa();Il=/^vec([234])<(u32|i32|f32)>$/});function Hr(e,n={}){Ga(e,"storage binding"),Oa(e,n.required);let r=n.access??"read";if(!(r in Ea))throw new Error(`storage binding ${e} has unsupported access ${r}`);return Object.freeze({kind:"storage",name:e,arg:n.arg,access:r,elementType:n.elementType??"f32",semantic:n.semantic,role:n.role,layout:n.layout,binding:n.binding,group:n.group})}function Vr(e,n,r={}){Ga(e,"uniform binding"),Oa(e,r.required);let t;if(Vl(n)?t=Pn(r.structName??Kl(e),n):t=n,!t||t.kind!=="uniform-struct")throw new Error(`uniform binding ${e} requires a uniformStruct schema or field array`);return Object.freeze({kind:"uniform",name:e,struct:t,semantic:r.semantic,binding:r.binding,group:r.group})}function un(e){if(!Array.isArray(e)||e.length===0)throw new Error("bindGroup requires at least one binding");let n=new Set,r=new Set;return Object.freeze(e.map((t,a)=>{if(!t||t.kind!=="storage"&&t.kind!=="uniform")throw new Error("bindGroup entries must be storage() or uniform() bindings");if(n.has(t.name))throw new Error(`duplicate bindGroup binding name: ${t.name}`);n.add(t.name);let s=t.binding??a;if(!Number.isInteger(s)||s<0)throw new Error(`binding ${t.name} has invalid binding index ${s}`);let o=t.group??0;if(!Number.isInteger(o)||o<0)throw new Error(`binding ${t.name} has invalid bind group index ${o}`);let i=`${o}:${s}`;if(r.has(i))throw new Error(`duplicate bindGroup binding index ${s} in @group(${o})`);return r.add(i),Object.freeze({...t,binding:s})}))}function Qr(e,n={}){return un(e).map(r=>jl(r,n)).join(`
`)}function Pa(e){let n=[],r=new Map;for(let t of un(e)){if(t.kind!=="uniform")continue;let a=JSON.stringify(xa(t.struct)),s=r.get(t.struct.name);if(s!==void 0){if(s!==a)throw new Error(`uniform struct ${t.struct.name} is declared with conflicting schemas`);continue}r.set(t.struct.name,a),n.push($r(t.struct))}return n.join(`
`)}function Aa(e,n,r,t={}){let a=un(n),s=t.labelPrefix??"kernel",o=[];return{bindings:a.map(u=>{let l=r?.[u.name];if(l==null)throw new Error(`Missing resource for binding ${u.name}`);if(u.kind==="uniform"){let f;return Xr(l)?f=l:(f=Ta(e,u.struct,l,`${s}-${u.name}`),typeof f.destroy=="function"&&o.push(()=>f.destroy?.())),{buffer:f,type:"uniform",binding:u.binding,...u.group?{group:u.group}:{}}}let c=l,d=typeof c.byteOffset=="number"?c.byteOffset:0,p=typeof c.byteLength=="number"?Hl(c.byteLength):void 0;return{tensor:l,type:Ea[u.access],binding:u.binding,...u.group?{group:u.group}:{},...d?{offset:d}:{},...p!==void 0?{size:p}:{}}}),cleanup:()=>{for(let u of o)u()}}}function jl(e,n){let r=e.group??0;if(e.kind==="storage"){let t=e.access==="read_write"?"read_write":"read",a=$l(e.elementType,n,`binding ${e.name} elementType`);return`@group(${r}) @binding(${e.binding}) var<storage, ${t}> ${e.name}: array<${a}>;`}return`@group(${r}) @binding(${e.binding}) var<uniform> ${e.name}: ${e.struct.name};`}function $l(e,n,r){if(typeof e!="string"||!e.startsWith("$"))return e;let t=e.slice(1),a=n[t];if(a==null)throw new Error(`Missing template value ${t} for ${r}`);return a}function Xr(e){return e!==null&&typeof e=="object"&&typeof e.destroy=="function"&&!("shape"in e)}function Kl(e){return e.length===0?e:e[0].toUpperCase()+e.slice(1)}function Ga(e,n){if(typeof e!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e))throw new Error(`${n} name must be a WGSL-compatible identifier, got ${e}`)}function Oa(e,n){if(n===!1)throw new Error(`binding ${e} cannot be optional; use separate variants for different resource layouts`)}function Hl(e){return Math.max(4,Math.ceil(e/4)*4)}function Vl(e){return Array.isArray(e)}var Ea,An=he(()=>{"use strict";nr();Ea=Object.freeze({read:"read-only-storage",read_write:"storage"})});function Gn(e){return e==null?e:Array.isArray(e)?e.map(Gn):e instanceof Map?Object.fromEntries([...e].map(([n,r])=>[n,Gn(r)])):typeof e=="object"&&"value"in e?e.type==="NullValue"?null:Gn(e.value):e}function de(e){return((...n)=>e(...n.map(Gn)))}function Zr(e){if(e==="float32"||e==="f32")return"f32";if(e==="float16"||e==="f16")return"f16";if(e==="uint32"||e==="u32"||e==="uint8")return"u32";if(e==="int32"||e==="i32"||e==="int8")return"i32";throw new Error(`Unsupported WebGPU dtype: ${e}`)}function On(e){return e==="f32"?"float32":e==="f16"?"float16":e==="u32"?"uint32":e==="i32"?"int32":e}function qa(e={}){let n=e,r=Yr(e.device),t=r.features.has("shader-f16");return{...Ba,f16Ok:de(a=>a!=="f16"&&a!=="float16"||t),f16Allowed:de(a=>a==="f32"||a==="float32"||(a==="f16"||a==="float16")&&t),op:e.op,variant:e.variant,pass:e.pass,device:r,attrs:e.attrs??{},args:e.args??{},source:e.sourceContext??{},present:e.present??{},shapes:e.shapes??{},ranks:e.ranks??{},tensorDtypes:e.tensorDtypes??{},dtypes:e.dtypes??{},...e.derived??{},tunables:e.tunables??{},constants:e.constants??{},...e.constants??{},...n.env!==void 0?{env:n.env}:{}}}function Yr(e){let n=ze(e),r=Wa.get(n);return r===void 0&&(r={features:n.features,wgslLanguageFeatures:n.wgslLanguageFeatures,limits:n.limits,adapterInfo:ha(n)},Wa.set(n,r)),r}function Le(e,n={}){if(typeof e!="string")return e;let r=qa(n),t=nc(e),a=t.freeIdentifiers.filter(o=>!(o in r));if(a.length>0)throw new Error(`Unknown identifier${a.length===1?"":"s"} ${a.map(o=>`"${o}"`).join(", ")} in WebGPU expression: ${e}
Identifiers resolve against the expression scope. Namespaces: args, attrs, shapes, ranks, dtypes, tensorDtypes, present, constants, tunables, source, device (plus the bare names declared in \`derive\`).
device sub-fields: features, wgslLanguageFeatures, limits, adapterInfo.
Helper functions: ${[...Object.keys(Ba),...Ql].join(", ")}.
If a string literal was intended, quote it (e.g. '"${a[0]}"' not '${a[0]}').`);if(t.statement===void 0)throw t.parseError??new Error(`Empty WebGPU expression: ${e}`);let s=new Ie;for(let[o,i]of Xl)s.set(o,i);for(let o of t.freeIdentifiers)s.set(o,r[o]);for(let o of t.probedIdentifiers)o in r&&s.set(o,r[o]);return Gn(new Mr(s).evaluate(t.statement,s))}function Jr(e,n={}){return Zl(e,qa(n))}function Zl(e,n){let r=Ra.get(e);r||(r=new Hn(e),Ra.set(e,r));let t=Jl(e),a=t?Yl(n,t):n;return r.render(a)}function Yl(e,n){let r={};for(let t of Object.keys(e))n.has(t)&&(r[t]=e[t]);return r}function Jl(e){let n=Fa.get(e);if(n!==void 0)return n;let r;try{let t=Kn($n(e,Ia)),a=new Set,s=o=>{if(!o||typeof o!="object")return;if(Array.isArray(o)){for(let u of o)s(u);return}if(o instanceof Map){for(let[u,l]of o)s(u),s(l);return}let i=o;i.type==="Identifier"&&typeof i.value=="string"&&a.add(i.value);for(let u of Object.keys(i))u!=="type"&&s(i[u])};s(t),r=a}catch{r=null}return Fa.set(e,r),r}function nc(e){let n=Ma.get(e);if(n!==void 0)return n;let r=new Set,t=new Set,a=i=>{if(!i||typeof i!="object")return;if(Array.isArray(i)){for(let l of i)a(l);return}if(i instanceof Map){for(let[l,c]of i)a(l),a(c);return}let u=i;switch(u.type){case"Identifier":ec.has(u.value)||r.add(u.value);return;case"MemberExpression":a(u.object),u.computed&&a(u.property);return;case"BinaryExpression":a(u.left),a(u.right);return;case"UnaryExpression":a(u.argument);return;case"FilterExpression":{a(u.operand);let l=u.filter;l?.type==="CallExpression"&&a(l.args);return}case"TestExpression":{let l=u.test,c=u.operand;(l?.value==="defined"||l?.value==="undefined")&&c?.type==="Identifier"?t.add(c.value):a(u.operand);return}case"CallExpression":a(u.callee),a(u.args);return;case"KeywordArgumentExpression":a(u.value);return;default:{for(let[l,c]of Object.entries(u))l!=="type"&&a(c);return}}},s,o;try{let i=Kn($n(`{{ ${e} }}`,Ia));s=i.body[0],a(i)}catch(i){o=i}for(let i of r)t.delete(i);return n=Object.freeze({statement:s,...o!==void 0?{parseError:o}:{},freeIdentifiers:Object.freeze([...r]),probedIdentifiers:Object.freeze([...t])}),Ma.set(e,n),n}function He(e,n){let r={};for(let[t,a]of Object.entries(e??{}))r[t]=je(a,n);return r}function je(e,n){return typeof e=="string"?Le(e,n):Array.isArray(e)?e.map(r=>je(r,n)):e&&typeof e=="object"?Object.fromEntries(Object.entries(e).map(([r,t])=>[r,je(t,n)])):e}var Ra,Ba,Ql,Wa,Xl,Fa,Ma,Ia,ec,rr=he(()=>{"use strict";Br();kn();Ra=new Map;Ba=Object.freeze({ceil:de(e=>Math.ceil(e)),floor:de(e=>Math.floor(e)),min:de((...e)=>Math.min(...e)),max:de((...e)=>Math.max(...e)),pow:de((e,n)=>Math.pow(e,n)),ceilDiv:de((e,n)=>Math.ceil(e/n)),pow2ceil:de(e=>e<=1?1:2**Math.ceil(Math.log2(e))),numel:de(e=>e.reduce((n,r)=>n*r,1)),rank:de(e=>e.length),dim:de((e,n)=>{let r=(n%e.length+e.length)%e.length;return e[r]}),rows:de((e,n)=>{let r=(n%e.length+e.length)%e.length;return e.reduce((t,a,s)=>s===r?t:t*a,1)}),cols:de((e,n)=>{let r=(n%e.length+e.length)%e.length;return e[r]}),outer:de((e,n)=>{let r=(n%e.length+e.length)%e.length;return e.slice(0,r).reduce((t,a)=>t*a,1)}),inner:de((e,n)=>{let r=(n%e.length+e.length)%e.length;return e.slice(r+1).reduce((t,a)=>t*a,1)}),broadcastable:de((e,n)=>{if(e.length>n.length)return!1;let r=n.length-e.length;return e.every((t,a)=>t===1||t===n[a+r])}),sameShape:de((e,n)=>e.length===n.length&&e.every((r,t)=>r===n[t])),hasAxis:de((e,n,r)=>{let t=(n%r+r)%r;return e.some(a=>(a%r+r)%r===t)}),has:de((e,n)=>e instanceof Map?e.has(n):!!(e&&Object.prototype.hasOwnProperty.call(e,n))),dtypeBytes:de(e=>{if(e==="float16"||e==="f16")return 2;if(e==="float32"||e==="f32"||e==="uint32"||e==="u32"||e==="uint8"||e==="int32"||e==="i32"||e==="int8")return 4;throw new Error(`Unsupported dtype for dtypeBytes(): ${e}`)}),pick:de((e,n)=>{if(!Array.isArray(e))throw new Error("pick() expects a list of [condition, value] pairs as its first argument");for(let r of e){if(!Array.isArray(r)||r.length<2)throw new Error("pick() entries must be [condition, value] pairs");if(r[0])return r[1]}return n})});Ql=["f16Ok","f16Allowed"];Wa=new WeakMap;Xl=[["true",!0],["false",!1],["none",null],["True",!0],["False",!1],["None",null]];Fa=new Map;Ma=new Map,Ia=Object.freeze({lstrip_blocks:!0,trim_blocks:!0}),ec=new Set(["true","false","none","True","False","None"])});function et(e,n){let r=[];for(let t of e.split(`
`)){let a=rc.exec(t);if(a)for(let s of a[1].split(",")){let o=s.trim();if(o.length===0)continue;let i=Da[o];i&&!n.has(i)&&r.push(`enable ${o}; (requires device feature "${i}")`)}}return r}var Da,rc,nt=he(()=>{"use strict";Da=Object.freeze({f16:"shader-f16",subgroups:"subgroups",chromium_experimental_subgroup_matrix:"chromium-experimental-subgroup-matrix"}),rc=/^\s*enable\s+([^;]+);/});function Je(e){let n=e instanceof Map?new Map(e):new Map(Object.entries(e));return Object.freeze({readText(r){let t=n.get(r);if(t===void 0)throw new Error(`WebGPU template asset is missing: ${r}`);return t},has(r){return n.has(r)}})}function rt(e){sr(e,"WebGPU manifest");let n=e.schemaVersion??1;if(n!==1)throw new Error(`Unsupported WebGPU manifest schemaVersion: ${n}`);let r=e.domain??"ai.onnx";hc(r,"WebGPU manifest domain");let t=e.name;if(typeof t!="string"||t.length===0)throw new Error("WebGPU manifest requires a non-empty name");if(!Array.isArray(e.inputs))throw new Error(`WebGPU manifest ${r}.${t} requires inputs`);if(!Array.isArray(e.outputs))throw new Error(`WebGPU manifest ${r}.${t} requires outputs`);if(!tt(e.args)||Object.keys(e.args).length===0)throw new Error(`WebGPU manifest ${r}.${t} requires explicit args`);gc(e.args,`${r}.${t}.args`);let a=sc(e,`${r}.${t}`),s=oc(e,a);return Object.freeze({schemaVersion:1,domain:r,name:t,id:`${r}.${t}`,sinceVersion:e.sinceVersion,inputs:Object.freeze([...e.inputs]),outputs:Object.freeze([...e.outputs]),args:Object.freeze({...e.args}),attributes:Object.freeze({...e.attributes??{}}),derive:Object.freeze({...e.derive??{}}),typeConstraints:Object.freeze({...e.typeConstraints??{}}),tunables:Object.freeze({...e.tunables??{}}),staticShapes:Object.freeze([...e.staticShapes??[]]),variants:Object.freeze(s)})}function Ua(e){return e.map(n=>{if(n.buffer.type==="uniform"){if(!n.struct)throw new Error(`WebGPU uniform binding ${n.name} requires struct`);return Vr(n.name,Pn(n.struct.name,n.struct.fields.map(mc)),{semantic:n.semantic,binding:n.binding,group:n.group})}return Hr(n.name,{arg:n.arg,access:n.buffer.type==="storage"?"read_write":"read",elementType:n.elementType,semantic:n.semantic??n.role,role:n.role,binding:n.binding,group:n.group})})}function sc(e,n){let r=new Map;for(let[t,a]of Object.entries(e.bindingSets??{})){if(!Array.isArray(a)||a.length===0)throw new Error(`WebGPU manifest ${n} bindingSet "${t}" must be a non-empty binding array`);r.set(t,a)}return r}function La(e,n,r){if(Array.isArray(e))return e;if(typeof e=="string"){let t=n.get(e);if(!t)throw new Error(`WebGPU ${r} references unknown bindingSet "${e}"`);return t}if(e&&typeof e=="object"&&typeof e.set=="string"){let t=e,a=n.get(t.set);if(!a)throw new Error(`WebGPU ${r} references unknown bindingSet "${t.set}"`);let s=t.overrides??{};for(let o of Object.keys(s))if(!a.some(i=>i.name===o))throw new Error(`WebGPU ${r} bindingSet "${t.set}" has no binding "${o}" to override`);return a.map(o=>{let i=o.name!==void 0?s[o.name]:void 0;return i?{...o,...i}:o})}throw new Error(`WebGPU ${r} bindings must be an array, a bindingSet name, or { set, overrides }`)}function oc(e,n){let r=`${e.domain??"ai.onnx"}.${e.name}`,t=ac.filter(s=>e[s]!==void 0);if(t.length>0)throw new Error(`WebGPU manifest ${r} uses the retired flattened dialect: top-level ${t.join(", ")} is no longer accepted. Declare ${t.length===1?"it":"them"} on variants[].passes[] instead (docs/kernel-authoring-framework.md \xA74).`);let a=ar(e,r);if(a.length===0)throw new Error(`WebGPU manifest ${r} requires a non-empty variants list`);return a.map((s,o)=>uc(s,o,n))}function ar(e,n){let r=[...e.variants??[]];for(let t of e.variantFamilies??[]){let a=Object.keys(t.axes??{});if(a.length===0)throw new Error(`WebGPU manifest ${n}: a variantFamily requires at least one axis`);if(!Array.isArray(t.variants)||t.variants.length===0)throw new Error(`WebGPU manifest ${n}: a variantFamily requires at least one base variant`);for(let s of a){let o=t.axes[s];if(!Array.isArray(o)||o.length===0)throw new Error(`WebGPU manifest ${n}: variantFamily axis "${s}" must be a non-empty array`)}for(let s of ic(a,t.axes))for(let o of t.variants)r.push(tr(o,s))}return r}function ic(e,n){let r=[{}];for(let t of e)r=r.flatMap(a=>n[t].map(s=>({...a,[t]:s})));return r}function tr(e,n){if(typeof e=="string")return e.replace(/\{([A-Za-z_]\w*)\}/g,(r,t)=>t in n?String(n[t]):r);if(Array.isArray(e))return e.map(r=>tr(r,n));if(e!==null&&typeof e=="object"){let r={};for(let[t,a]of Object.entries(e))r[tr(t,n)]=tr(a,n);return r}return e}function uc(e,n,r){sr(e,"WebGPU variant");let t=e.id??e.name??`variant_${n}`;if(!/^[A-Za-z0-9][A-Za-z0-9_]*$/.test(t))throw new Error(`WebGPU variant id must be stable, got ${t}`);let a=e.passes;if(!Array.isArray(a)||a.length===0)throw new Error(`WebGPU variant ${t} requires passes`);let s=e.bindings!==void 0?La(e.bindings,r,`variant ${t}`):void 0,o=e.version??1;if(!Number.isInteger(o)||o<1)throw new Error(`WebGPU variant ${t} version must be an integer >= 1`);return Object.freeze({id:t,name:e.name??t,version:o,default:!!e.default,priority:e.priority??0,when:pc(e.when,t),selectAbove:typeof e.selectAbove=="string"&&e.selectAbove.length>0?e.selectAbove:null,requires:fc(e),tunables:Object.freeze({...e.tunables??{}}),derive:Object.freeze({...e.derive??{}}),constants:Object.freeze({...e.constants??{}}),intermediates:Object.freeze([...e.intermediates??[]]),passes:Object.freeze(a.map((i,u)=>lc(i,s,u,r)))})}function lc(e,n,r,t){let a=cc(e,r);if(!e.dispatch)throw new Error(`WebGPU pass ${e.id??r} requires dispatch`);let s=e.bindings!==void 0?La(e.bindings,t,`pass ${e.id??r}`):n;if(!Array.isArray(s)||s.length===0)throw new Error(`WebGPU pass ${e.id??r} requires bindings`);return Object.freeze({id:e.id??`pass_${r}`,...e.name?{name:e.name}:{},shader:a.shader,source:a,entryPoint:e.entryPoint??"main",bindings:Object.freeze(s.map(dc)),constants:Object.freeze({...e.constants??{}}),uniforms:Object.freeze({...e.uniforms??{}}),dispatch:e.dispatch,profile:Object.freeze({...e.profile??{}}),metadata:Object.freeze({...e.metadata??{}}),reads:Object.freeze([...e.reads??[]]),writes:Object.freeze([...e.writes??[]])})}function cc(e,n){let r=`WebGPU pass ${e.id??n}`,t=e.source;if(t!==void 0){if(sr(t,`${r}.source`),t.kind==="template"){let a=t.shader??e.shader;if(typeof a!="string"||a.length===0)throw new Error(`${r} template source requires shader`);if(e.shader!==void 0&&e.shader!==a)throw new Error(`${r} has conflicting shader and source.shader`);if(t.version!==void 0&&typeof t.version!="string"&&typeof t.version!="number")throw new Error(`${r} template source version must be a string or number`);if(t.inputs!==void 0&&!tt(t.inputs))throw new Error(`${r} template source inputs must be an object`);return Object.freeze({kind:"template",shader:a,...t.version!==void 0?{version:t.version}:{},inputs:Object.freeze({...t.inputs??{}})})}throw new Error(`${r} source has unsupported kind ${t.kind}`)}if(typeof e.shader!="string"||e.shader.length===0)throw new Error(`${r} requires shader or source`);return Object.freeze({kind:"template",shader:e.shader,inputs:Object.freeze({})})}function dc(e,n){if(sr(e,`WebGPU binding ${n}`),e.optional===!0)throw new Error(`WebGPU binding ${e.name??e.role??n} cannot be optional; use a separate variant`);let r=e.buffer?.type;if(!r||!tc.has(r))throw new Error(`WebGPU binding ${e.name??e.role??n} has invalid buffer type`);let t=e.name??e.role??e.semantic;if(typeof t!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(t))throw new Error(`WebGPU binding requires a WGSL-compatible name, got ${String(t)}`);let a=Object.freeze({name:t,...e.role!==void 0?{role:e.role}:{},...e.semantic!==void 0?{semantic:e.semantic}:{},...e.arg!==void 0?{arg:e.arg}:{},buffer:{type:r},...e.elementType?{elementType:e.elementType}:{},...e.struct?{struct:e.struct}:{},...e.binding!==void 0?{binding:e.binding}:{},...e.group!==void 0?{group:e.group}:{}});if(r==="uniform"&&!a.struct)throw new Error(`WebGPU uniform binding ${t} requires struct`);if(r!=="uniform"&&!a.elementType)throw new Error(`WebGPU storage binding ${t} requires elementType`);return a}function pc(e,n){if(e===void 0)return!0;if(Array.isArray(e)){if(e.length===0)throw new Error(`WebGPU variant ${n} when[] must be a non-empty list of predicates`);for(let r of e)if(typeof r!="string"||r.length===0)throw new Error(`WebGPU variant ${n} when[] entries must be non-empty expression strings, got ${JSON.stringify(r)}`);return Object.freeze([...e])}if(typeof e!="string"&&typeof e!="boolean")throw new Error(`WebGPU variant ${n} when must be a string, boolean, or string[], got ${JSON.stringify(e)}`);return e}function fc(e){let n={...e.requiredFeatures?{requiredFeatures:e.requiredFeatures}:{},...e.requiredLimits?{requiredLimits:e.requiredLimits}:{},...e.requiredWGSLLanguageFeatures?{requiredWGSLLanguageFeatures:e.requiredWGSLLanguageFeatures}:{},...e.requiredSubgroupMinSize!==void 0?{requiredSubgroupMinSize:e.requiredSubgroupMinSize}:{}};if(n.requiredSubgroupMinSize!==void 0&&(!Number.isInteger(n.requiredSubgroupMinSize)||n.requiredSubgroupMinSize<1))throw new Error(`WebGPU variant ${e.id??e.name??"?"} requiredSubgroupMinSize must be a positive integer`);return Object.keys(n).length===0?null:n}function mc(e){if(e.type==="u32")return Nr(e.name,e);if(e.type==="i32")return zr(e.name,e);if(e.type==="f32")return jr(e.name,e);throw new Error(`Unsupported WebGPU uniform field type: ${e.type}`)}function gc(e,n){for(let[r,t]of Object.entries(e)){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(r))throw new Error(`${n}.${r} is not a valid arg name`);if(!["tensor","u32","i32","f32","bool","string"].includes(t.kind))throw new Error(`${n}.${r} has unsupported kind ${String(t.kind)}`)}}function hc(e,n){if(!/^[a-z][a-z0-9]*(?:\.[A-Za-z][A-Za-z0-9_]*)*$/.test(e))throw new Error(`${n} must be a dotted canonical domain, got ${e}`)}function sr(e,n){if(!tt(e))throw new Error(`${n} must be an object`)}function tt(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}var tc,ac,or=he(()=>{"use strict";An();nr();tc=new Set(["read-only-storage","storage","uniform"]);ac=["shader","entryPoint","bindings","constants","uniforms","profile","metadata","dispatch"]});function Rn(e){if(e===ee.float16)return 2;if(e===ee.float32||e===ee.int8||e===ee.int32||e===ee.uint8||e===ee.uint32)return 4;throw new Error(`Unsupported dtype: ${e}`)}function Ve(e){if(!Array.isArray(e))throw new Error("shape must be an array");let n=1;for(let r of e){if(!Number.isInteger(r)||r<0)throw new Error(`invalid shape dimension: ${r}`);n*=r}return n}function Ca(e){let n=new Array(e.length),r=1;for(let t=e.length-1;t>=0;--t)n[t]=r,r*=e[t];return n}function ir(e){return e!==null&&typeof e=="object"&&typeof e.dtype=="string"&&Array.isArray(e.shape)&&typeof e.size=="number"&&typeof e.byteLength=="number"&&"buffer"in e&&"runtime"in e}var ee,Wn=he(()=>{"use strict";ee=Object.freeze({float16:"float16",float32:"float32",int8:"int8",int32:"int32",uint8:"uint8",uint32:"uint32"})});function at(e){return{attrs:e.attrs,dtypes:e.dtypes,tensorDtypes:e.tensorDtypes,ranks:e.ranks,tunables:e.tunables}}function Na(e,n,r,t=null){return Qe({op:e.id,sinceVersion:e.sinceVersion,variant:n.id,variantVersion:n.version,...at(r),staticShapes:bc(r,e.staticShapes),specialization:t,device:xn(r.device),bindings:n.passes.map(a=>a.bindings.map(s=>({name:s.name,binding:s.binding,group:s.group,type:s.buffer.type,elementType:s.elementType,struct:yc(s.struct)})))})}function yc(e){return e&&{name:e.name,fields:e.fields.map(n=>({name:n.name,type:n.type}))}}function za(e){return Qe({shapes:e.shapes,args:e.args})}function ja(e,n){return`${e}|shapes=${n}`}function Qe(e){return Array.isArray(e)?`[${e.map(Qe).join(",")}]`:e&&typeof e=="object"?`{${Object.keys(e).sort().map(n=>`${JSON.stringify(n)}:${Qe(e[n])}`).join(",")}}`:JSON.stringify(e)}function bc(e,n){let r={};for(let t of n){let[a,s]=t.split("."),o=e.shapes[a];if(!o)continue;if(s===void 0||s==="*"){r[t]=o;continue}let i=Number(s);Number.isInteger(i)&&(r[t]=o[i])}return r}var ur,lr,cr,$a=he(()=>{"use strict";kn();ur=class{entries=new Map;hits=0;misses=0;get(n){let r=this.entries.get(n);if(r===void 0){this.misses+=1;return}return this.hits+=1,r}getOrCreate(n,r){let t=this.get(n);if(t!==void 0)return t;let a=r();return this.entries.set(n,a),a}clear(){this.entries.clear(),this.hits=0,this.misses=0}},lr=class extends ur{},cr=class extends ur{}});function Ka(e,n,r){return e.map(t=>{let a=je(t.shape,r),s=_c(a,t.id),o=On(t.dtype),i=wc(t.id,n);return Object.freeze({id:t.id,dtype:o,shape:s,firstWrite:i.firstWrite,lastRead:i.lastRead,byteLength:Ve(s)*Rn(o)})})}function wc(e,n){let r=Number.POSITIVE_INFINITY,t=-1;for(let a=0;a<n.length;++a)n[a].writes.includes(e)&&(r=Math.min(r,a)),n[a].reads.includes(e)&&(t=Math.max(t,a));return Number.isFinite(r)||(r=0),t<r&&(t=r),{firstWrite:r,lastRead:t}}function _c(e,n){let r=Array.isArray(e)?e:[e];if(r.length===0)throw new Error(`WebGPU scratch ${n} shape must not be empty`);return Object.freeze(r.map(t=>{if(!Number.isInteger(t)||Number(t)<0)throw new Error(`WebGPU scratch ${n} shape dimension must be a nonnegative integer, got ${String(t)}`);return Number(t)}))}var Ha=he(()=>{"use strict";Wn();rr()});var Za={};Eo(Za,{executeWebGpuPlan:()=>vc,materializeComputePassDescriptorTemplate:()=>Qa,materializeWebGpuExecutionPlan:()=>Fn});async function vc(e,n,r={}){let t=Fn(e,n);try{if(t.programs.length===0)return;if(typeof e.runProgramSequence=="function")await e.runProgramSequence(t.programs,r);else for(let a of t.programs)await e.runProgram(a,r)}finally{t.cleanup()}}function Fn(e,n){let r=Tc(e,n),t=[],a=[];for(let s=0;s<n.program.passes.length;++s){let o=n.program.passes[s],i=n.plan.passes[s],u=`${n.program.op} (variant ${n.program.variant}, pass ${o.id})`,l=xc(n,o.bindingSpecs,i.uniforms,r);if(Pc(u,o,l))continue;Xa(u,o.bindings,d=>l[d.name]);let c=Aa(e,o.bindings,l,{labelPrefix:o.name});t.push(c.cleanup),a.push({name:o.name,source:o.source,entryPoint:o.entryPoint,cacheKey:`webgpu:${n.program.key}:pass=${o.id}`,bindings:c.bindings,dispatchWorkgroups:i.dispatchWorkgroups,...o.profile?{profile:o.profile}:{},...o.semantic!==void 0?{semantic:o.semantic}:{},...o.metadata?{metadata:o.metadata}:{},plan:{webgpuPlanKey:n.plan.key,pass:i.id,scratches:n.plan.scratches}})}return{programs:a,cleanup:()=>{for(let s of t)s();for(let s of Object.values(r))typeof s.destroy=="function"&&s.destroy()}}}function Qa(e,n){return Xa(`${e.name} (program ${e.programKey}, pass ${e.id})`,e.bindingSpecs,r=>ot(r,n)),{name:e.name,source:e.source,entryPoint:e.entryPoint,cacheKey:e.cacheKey,bindings:e.bindingSpecs.map((r,t)=>Sc(e,r,n,t)),dispatchWorkgroups:e.dispatchWorkgroups,...e.profile?{profile:e.profile}:{},...e.metadata?{metadata:e.metadata}:{},plan:{webgpuProgramKey:e.programKey,webgpuPlanKey:e.planKey,pass:e.id}}}function Sc(e,n,r,t){let a=ot(n,r);if(a==null)throw new Error(`Missing resource for compute pass descriptor template binding ${n.name}`);let s=n.binding??t;if(n.buffer.type==="uniform"){if(!Xr(a))throw new Error(`Compute pass descriptor template ${e.name} requires caller-owned uniform buffer for ${n.name}`);return{buffer:a,type:"uniform",binding:s,...n.group?{group:n.group}:{}}}let o=a,i=typeof o.byteOffset=="number"?o.byteOffset:0,u=typeof o.byteLength=="number"?o.byteLength:void 0;return{tensor:a,type:n.buffer.type,binding:s,...n.group?{group:n.group}:{},...i?{offset:i}:{},...u!==void 0?{size:u}:{}}}function ot(e,n){return n[e.arg??""]??n[e.name]??n[e.role??""]??n[e.semantic??""]}function Tc(e,n){let r={};if(n.plan.scratches.length===0)return r;if(typeof e.empty!="function")throw new Error("WebGPU multi-pass plan requires a runtime with empty(dtype, shape)");for(let t of n.plan.scratches)r[t.id]=e.empty(t.dtype,t.shape,`webgpu-scratch-${t.id}`);return r}function xc(e,n,r,t){let a={};for(let s of n){if(s.buffer.type==="uniform"){let o=Va(e,s,t);a[s.name]=o??r[s.name];continue}a[s.name]=Va(e,s,t)}return a}function Va(e,n,r){return r[n.name]??r[n.role??""]??r[n.semantic??""]??ot(n,e.request.resources)}function Xa(e,n,r){let t=null;for(let a of n){let s=kc(a);if(s===null)continue;let o=st(r(a));if(o===null)continue;t===null&&(t=new Map);let i=t.get(o.buffer);if(i===void 0){t.set(o.buffer,{name:a.name,access:s,view:o});continue}if(i.access==="read"&&s==="read")continue;if(i.access==="read_write"&&s==="read_write"){if(!Ac(i.view.offset,i.view.end,o.offset,o.end))continue;throw new Error(`${e}: storage bindings "${i.name}" and "${a.name}" alias overlapping writable ranges of the same GPU buffer; overlapping storage aliases are unsafe when either binding is writable`)}let[u,l]=s==="read_write"?[i.name,a.name]:[a.name,i.name];throw new Error(`${e}: storage aliasing hazard \u2014 binding "${u}" (read-only-storage) and binding "${l}" (storage, read_write) resolve to the same GPU buffer. WebGPU usage scopes cover the whole buffer, so this poisons the entire command buffer and corrupts downstream results. Bind it once as storage (read_write) for intentional in-place, or use distinct buffers.`)}}function kc(e){if("buffer"in e&&e.buffer!==void 0)switch(e.buffer.type){case"read-only-storage":return"read";case"storage":return"read_write";default:return null}let n=e;return n.kind==="storage"?n.access:null}function Ec(e,n){let r=n.metadata?.viewAlias;if(r===void 0)return null;let t=r;if(t===null||typeof t!="object"||typeof t.input!="string"||typeof t.output!="string")throw new Error(`${e}: pass metadata.viewAlias must be an object naming two bindings, e.g. { "input": "\\"x\\"", "output": "\\"y\\"" } (values are expressions, so quote the binding names)`);return{input:t.input,output:t.output}}function Pc(e,n,r){let t=Ec(e,n);if(t===null)return!1;let a=n.bindingSpecs.find(u=>u.name===t.input),s=n.bindingSpecs.find(u=>u.name===t.output);if(!a||a.buffer.type!=="read-only-storage")throw new Error(`${e}: metadata.viewAlias.input "${t.input}" must name a read-only-storage binding of the pass`);if(!s||s.buffer.type!=="storage")throw new Error(`${e}: metadata.viewAlias.output "${t.output}" must name a storage (read_write) binding of the pass`);let o=st(r[t.input]),i=st(r[t.output]);return o===null||i===null?!1:o.buffer===i.buffer&&o.offset===i.offset&&o.end===i.end}function st(e){if(e===null||typeof e!="object")return null;let n=e,r=n.buffer??e;if(r===null||typeof r!="object"&&typeof r!="function")return null;let t=typeof n.byteOffset=="number"?n.byteOffset:0,a=typeof n.byteLength=="number"?n.byteLength:typeof n.size=="number"?n.size:Number.POSITIVE_INFINITY;return{buffer:r,offset:t,end:t+a}}function Ac(e,n,r,t){return e<t&&r<n}var it=he(()=>{"use strict";An()});function Ya(e,n,r,t,a,s){return Object.freeze({id:e.id,name:e.name,source:e.source,entryPoint:e.entryPoint,cacheKey:r,bindings:e.bindings,bindingSpecs:e.bindingSpecs,dispatchWorkgroups:n.dispatchWorkgroups,uniforms:n.uniforms,constants:n.constants,...e.profile?{profile:e.profile}:{},...e.metadata?{metadata:e.metadata}:{},programKey:t,planKey:a,passIndex:s})}function lt(e,n,r,t){let a=dr(e);if(t.has(a))throw new Error(`Circular WebGPU template include: ${[...t,a].join(" -> ")}`);t.add(a);let s=n.replace(Gc,(o,i)=>{let u=Oc(a,i);return lt(u,r(u),r,t)});return t.delete(a),s}function Oc(e,n){if(n.startsWith(".")){let r=e.slice(0,Math.max(0,e.lastIndexOf("/")));return dr(`${r}/${n}`)}return dr(n)}function dr(e){let n=[];for(let r of e.replaceAll("\\","/").split("/"))if(!(r===""||r===".")){if(r===".."){if(n.length===0)throw new Error(`WebGPU template path escapes package root: ${e}`);n.pop();continue}n.push(r)}return n.join("/")}function Rc(e,n,r){if(n.kind==="tensor"){if(!ir(r))throw new Error(`WebGPU arg ${e} must be a GPU tensor`);if(n.dtype&&r.dtype!==n.dtype)throw new Error(`WebGPU arg ${e} dtype ${r.dtype} does not match ${n.dtype}`);return}if(n.kind==="string"){if(typeof r!="string")throw new Error(`WebGPU arg ${e} must be a string`);if(n.oneOf&&!n.oneOf.includes(r))throw new Error(`WebGPU arg ${e} must be one of ${n.oneOf.join(", ")}`);return}if(n.kind==="bool"){if(typeof r!="boolean")throw new Error(`WebGPU arg ${e} must be a boolean`);return}if(typeof r!="number"||!Number.isFinite(r))throw new Error(`WebGPU arg ${e} must be a finite number`);if(n.kind==="u32"&&(!Number.isInteger(r)||r<0||r>4294967295))throw new Error(`WebGPU arg ${e} must be a u32`);if(n.kind==="i32"&&(!Number.isInteger(r)||r<-2147483648||r>2147483647))throw new Error(`WebGPU arg ${e} must be an i32`)}function Wc(e){return typeof e.readText=="function"?e:Je(e)}function Fc(e,n){return es(`WebGPU op ${e.program.op}`,e.program.passes,n)}function Mc(e,n,r){return es(`WebGPU op ${e} variant ${n.id}`,n.passes,r)}function es(e,n,r){if(r===void 0){if(n.length!==1)throw new Error(`${e} has ${n.length} passes; select a pass by id or index`);return 0}if(typeof r=="number"){if(!Number.isInteger(r)||r<0||r>=n.length)throw new Error(`${e} has no pass index ${r}`);return r}let t=n.findIndex(a=>a.id===r);if(t<0)throw new Error(`${e} has no pass ${r}`);return t}function Bc(e,n){if(!ns(e))throw new Error(`${n} must be a JSON object`);return ut(e,n)}function ut(e,n){if(e===null)return null;if(typeof e=="boolean"||typeof e=="string")return e;if(typeof e=="number"){if(!Number.isFinite(e))throw new Error(`${n} number must be finite`);return e}if(Array.isArray(e))return Object.freeze(e.map((r,t)=>ut(r,`${n}[${t}]`)));if(ns(e)){let r={};for(let[t,a]of Object.entries(e)){if(a===void 0)throw new Error(`${n}.${t} must be JSON; got undefined`);r[t]=ut(a,`${n}.${t}`)}return Object.freeze(r)}throw new Error(`${n} must be JSON-compatible`)}function ns(e){if(e===null||typeof e!="object"||Array.isArray(e))return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null}function qc(e,n){if(e&&typeof e=="object"){let r=Ja.get(e);return r===void 0&&(r=Qe(xn(n)),Ja.set(e,r)),r}return Qe(xn(n))}function Ic(e,n,r){return Qe({v:r??null,d:qc(e,n.device),...at(n),args:n.args,shapes:n.shapes,present:n.present,source:n.sourceContext})}function Uc(e){return e!==null&&typeof e=="object"&&typeof e.dtype=="string"&&Array.isArray(e.shape)}function Lc(e){let n=e.shape.reduce((r,t)=>r*t,1);return{dtype:e.dtype,shape:e.shape,size:n,byteLength:n*4,buffer:{},runtime:null}}var Mn,Gc,Ja,Dc,Bn=he(()=>{"use strict";An();Wn();$a();kn();rr();or();Ha();nt();Mn=class{manifest;assets;programCache;planCache;prepareCache=new Map;constructor(n,r={}){this.manifest=rt(n),this.assets=Wc(r.assets??{}),this.programCache=r.programCache??new lr,this.planCache=r.planCache??new cr}explain(n,r,t={}){let a=ze(n.device),s=this.applyManifestDerive(this.buildBaseScope(a,r)),o=this.variantCandidates(t.variant).map(i=>{let u=this.checkVariant(i,s);return{id:i.id,ok:u.ok,...!u.ok&&u.reason?{reason:u.reason}:{}}});return{op:this.manifest.id,selected:o.find(i=>i.ok)?.id??null,candidates:o}}prepare(n,r,t={}){this.validateRequest(r);let a=ze(n.device),s=this.buildBaseScope(a,r),o=Ic(n.device,s,t.variant),i=this.prepareCache.get(o);if(i)return{program:i.program,plan:i.plan,request:r};let u=this.applyManifestDerive(s),{variant:l,scope:c}=this.selectVariantAndScope(u,r,t.variant),d=Na(this.manifest,l,c,this.programSpecialization(l,c)),p=this.programCache.getOrCreate(d,()=>this.buildProgram(d,l,c)),f=za(c),m=ja(d,f),_=this.planCache.getOrCreate(m,()=>this.buildPlan(m,d,f,l,c));return this.prepareCache.set(o,{program:p,plan:_}),{program:p,plan:_,request:r}}clearPreparedState(){this.prepareCache.clear(),this.programCache.clear(),this.planCache.clear()}inferOutputs(n,r={}){let t={};for(let[u,l]of Object.entries(n))l!==void 0&&(t[u]=Uc(l)?Lc(l):l);let a={resources:t,...r.args?{args:r.args}:{},...r.attrs?{attrs:r.attrs}:{}},s=this.applyManifestDerive(this.buildBaseScope(ze(void 0),a)),o=new Map;for(let[u,l]of Object.entries(this.manifest.args))l.kind==="tensor"&&(l.role==="output"||l.role==="inout")&&l.semantic&&o.set(l.semantic,u);let i={};for(let u of this.manifest.outputs){let l=o.get(u.role)??u.role;if(u.shape===void 0)throw new Error(`${this.manifest.id}: output "${u.role}" has no shape expression \u2014 add outputs[].shape to ops/${this.manifest.id}/manifest.json (docs/model-graph-builder.md).`);let c=typeof u.shape=="string"?Le(u.shape,s):u.shape.map(d=>je(d,s));if(!Array.isArray(c)||!c.every(d=>Number.isInteger(d)&&d>=0))throw new Error(`${this.manifest.id}: output "${u.role}" shape evaluated to ${JSON.stringify(c)} (expected non-negative integers)`);i[l]={role:u.role,shape:c,dtype:this.resolveOutputDtype(u,s)}}return i}resolveOutputDtype(n,r){if(!n.dtype)return"float32";if(Dc.has(n.dtype))return n.dtype;let t=r.dtypes[n.dtype];if(typeof t=="string")return On(t);let a=this.manifest.typeConstraints[n.dtype],s=r.tensorDtypes;for(let o of this.manifest.inputs){let i=s[o.role];if(typeof i=="string"&&(!Array.isArray(a)||a.includes(i)))return i}throw new Error(`${this.manifest.id}: output "${n.role}" dtype "${n.dtype}" is a constraint var with no bound input \u2014 pass a dtype override or bind an input sharing the var.`)}async run(n,r,t={}){let a=this.prepare(n,r,t),{executeWebGpuPlan:s}=await Promise.resolve().then(()=>(it(),Za));return await s(n,a,t.runOptions??{}),a}prepareComputePassDescriptorTemplate(n,r,t={}){if(t.cacheKey!==void 0)return this.prepareDirectComputePassDescriptorTemplate(n,r,{...t,cacheKey:t.cacheKey});let a=this.prepare(n,r,t),s=Fc(a,t.pass),o=a.program.passes[s],i=a.plan.passes[s];if(!o||!i)throw new Error(`WebGPU op ${a.program.op} produced no compute pass descriptor template at index ${s}`);return Ya(o,i,`webgpu:${a.program.key}:pass=${o.id}`,a.program.key,a.plan.key,s)}prepareDirectComputePassDescriptorTemplate(n,r,t){this.validateRequest(r);let a=ze(n.device),s=this.applyManifestDerive(this.buildBaseScope(a,r)),{variant:o,scope:i}=this.selectVariantAndScope(s,r,t.variant),u=Mc(this.manifest.id,o,t.pass),l=o.passes[u],c=this.buildProgramPass(o,l,i),d=this.buildPlanPass(o,l,i,u);return Ya(c,d,t.cacheKey,t.cacheKey,t.cacheKey,u)}buildProgram(n,r,t){let a=r.passes.map(s=>this.buildProgramPass(r,s,t));return Object.freeze({key:n,op:this.manifest.id,variant:r.id,variantVersion:r.version,passes:Object.freeze(a)})}buildProgramPass(n,r,t){let a=this.passConstants(n,r,t),s={...t,variant:n,pass:r,constants:a},o=un(Ua(r.bindings)),i=[Pa(o),Qr(o,a)].filter(Boolean).join(`
`),u=this.passSourceInputs(r.source,s),l={...s,sourceContext:u},c=this.buildTemplateSource(n,r,l,i),d=He(r.profile,l),p=He(r.metadata,l);return Object.freeze({id:r.id,name:r.name??`${this.manifest.id}.${n.id}.${r.id}`,source:c,entryPoint:r.entryPoint,bindings:o,bindingSpecs:r.bindings,constants:a,...Object.keys(d).length>0?{profile:d}:{},...Object.keys(p).length>0?{metadata:p}:{},reads:r.reads,writes:r.writes})}buildTemplateSource(n,r,t,a){let s=lt(r.source.shader,this.assets.readText(r.source.shader),u=>this.assets.readText(u),new Set),o=Jr(s,{...t,env:{device:Yr(t.device),wgsl:{resourceDeclarations:a}}}),i=et(o,t.device.features);if(i.length>0)throw new Error(`WebGPU op ${this.manifest.id} variant ${n.id} pass ${r.id} rendered WGSL enable directives the device does not support: ${i.join(", ")}. Gate the directive in the template (env.device.features) or declare the feature in the variant's requires.requiredFeatures.`);return o}programSpecialization(n,r){return{variant:He(n.constants,{...r,variant:n}),passes:n.passes.map(t=>({id:t.id,constants:He(t.constants,{...r,variant:n,pass:t}),source:this.passSourceSpecialization(n,t,r)}))}}passSourceSpecialization(n,r,t){let a=this.passConstants(n,r,t),s={...t,variant:n,pass:r,constants:a};return{kind:"template",shader:r.source.shader,sourceVersion:r.source.version??1,inputs:this.passSourceInputs(r.source,s)}}buildPlan(n,r,t,a,s){let o=Ka(a.intermediates,a.passes,s),i=a.passes.map((u,l)=>this.buildPlanPass(a,u,s,l));return Object.freeze({key:n,programKey:r,shapeKey:t,scratches:o,passes:Object.freeze(i)})}buildPlanPass(n,r,t,a){let s=this.passConstants(n,r,t),o={...t,variant:n,pass:r,constants:s},i={...o,sourceContext:this.passSourceInputs(r.source,o)},u=r.bindings.filter(l=>l.buffer.type==="uniform").reduce((l,c)=>(l[c.name]=this.uniformValues(c,r.uniforms[c.name],i),l),{});return Object.freeze({id:r.id,dispatchWorkgroups:this.passDispatchWorkgroups(r,i),uniforms:u,constants:{...s,passIndex:a}})}passDispatchWorkgroups(n,r){let t=r.device.limits.maxComputeWorkgroupsPerDimension;return[Le(n.dispatch.x,r),Le(n.dispatch.y??1,r),Le(n.dispatch.z??1,r)].map((a,s)=>{if(!Number.isInteger(a)||Number(a)<0)throw new Error(`WebGPU pass ${n.id} dispatch axis ${s} must resolve to a nonnegative integer, got ${String(a)}`);if(Number(a)>t)throw new Error(`WebGPU pass ${n.id} dispatch axis ${s} = ${a} exceeds maxComputeWorkgroupsPerDimension (${t}); clamp the dispatch (min(..., ${t})) and grid-stride over the remainder, or fold into 2D/3D.`);return Number(a)})}uniformValues(n,r,t){let a=n.struct;if(!a)throw new Error(`WebGPU uniform binding ${n.name} requires struct`);let s={};for(let o of a.fields){let i=r?.[o.name]??o.value??t.args[o.name]??o.default;if(i===void 0)continue;let u=Le(i,t);if(typeof u!="number"||!Number.isFinite(u))throw new Error(`WebGPU uniform ${n.name}.${o.name} must resolve to a finite number`);s[o.name]=u}return s}passConstants(n,r,t){return{...t.dtypes,...He(n.constants,{...t,variant:n,pass:r}),...He(r.constants,{...t,variant:n,pass:r})}}passSourceInputs(n,r){return Bc(He(n.inputs,r),`WebGPU template source ${n.shader} inputs`)}selectVariantAndScope(n,r,t){let a=this.selectVariant(n,t),s=this.applyVariantDerive(n,r,a,void 0);return{variant:a,scope:s}}selectVariant(n,r){let t=[];for(let a of this.variantCandidates(r)){let s=this.checkVariant(a,n);if(s.ok)return a;t.push(`${a.id}: ${s.reason}`)}throw new Error(`No supported WebGPU variant for ${this.manifest.id}; rejected ${t.join("; ")}`)}variantCandidates(n){if(n!==void 0){let t=this.manifest.variants.find(a=>a.id===n);if(!t)throw new Error(`WebGPU op ${this.manifest.id} has no variant ${n}`);return[t]}return[...this.manifest.variants].sort((t,a)=>t.default!==a.default?t.default?-1:1:a.priority-t.priority)}checkVariant(n,r){let t=Cr(n.requires,r.device);if(t)return{ok:!1,reason:t};let a={...r,variant:n},s=Array.isArray(n.when)?n.when:[n.when],o=s.length>1;for(let i of s){let u;try{u=Le(i,a)}catch(l){return{ok:!1,reason:`when eval error in \`${typeof i=="string"?i:String(i)}\`: ${l.message}`}}if(u!==!0){let l=typeof i=="string"?i:String(i);return{ok:!1,reason:o?`when clause failed: \`${l}\` \u2192 ${String(u)}`:`when guard resolved to ${String(u)}`}}}if(n.selectAbove!==null){let i;try{i=Le(n.selectAbove,a)}catch(u){return{ok:!1,reason:`selectAbove eval error in \`${n.selectAbove}\`: ${u.message}`}}if(i!==!0)return{ok:!1,reason:`below perf floor: \`${n.selectAbove}\` \u2192 ${String(i)}`}}return{ok:!0}}buildBaseScope(n,r){let t={...r.resources},a={...this.manifest.attributes,...r.attrs??{}},s={...r.args??{}},o={...r.sourceContext??{}};for(let[f,m]of Object.entries(t))!ir(m)&&typeof m!="object"&&(s[f]=m);let i=Object.fromEntries(Object.keys({...this.manifest.args,...t}).map(f=>[f,t[f]!==void 0&&t[f]!==null])),u={},l={},c={},d={};for(let[f,m]of Object.entries(this.manifest.args)){let _=t[f];if(!ir(_))continue;let E=[f,m.semantic,m.role].filter(b=>typeof b=="string"&&b.length>0);for(let b of E)u[b]=_.shape,l[b]=_.shape.length,c[b]=_.dtype}for(let f of[...this.manifest.inputs,...this.manifest.outputs]){if(!f.dtype)continue;let m=c[f.role];m!==void 0&&(d[f.dtype]=Zr(m))}return{op:this.manifest,device:n,attrs:a,args:s,sourceContext:o,resources:t,present:i,shapes:u,ranks:l,tensorDtypes:c,dtypes:d,derived:{},tunables:{...this.manifest.tunables,...r.tunables??{}},constants:{}}}applyManifestDerive(n){let r={};for(let[t,a]of Object.entries(this.manifest.derive))r[t]=je(a,{...n,derived:r});return{...n,derived:r}}applyVariantDerive(n,r,t,a){let s={...n,variant:t,tunables:{...this.manifest.tunables,...t.tunables,...a??{},...r.tunables??{}}},o={...n.derived};for(let[i,u]of Object.entries(t.derive))o[i]=je(u,{...s,derived:o});return{...s,derived:o}}validateRequest(n){for(let[r,t]of Object.entries(this.manifest.args)){let a=n.resources[r]??n.args?.[r];if(a==null){if(t.required!==!1)throw new Error(`WebGPU op ${this.manifest.id} missing required arg ${r}`);continue}Rc(r,t,a)}}};Gc=/{%\s*include\s+["']([^"']+)["']\s*%}/g;Ja=new WeakMap;Dc=new Set(["float32","float16","uint32","int32","uint8","int8"])});var rs,ts,as=he(()=>{rs=new Map([["ops/_shared/norm-row-stats.wgsl.jinja",`{% if source.usesF16 %}
enable f16;
{% endif %}
enable subgroups;
{{ env.wgsl.resourceDeclarations }}

// Subgroup-parallel single-pass row statistics + fused normalize/affine.
//
// One workgroup owns one contiguous normalization span ("row": a last-axis
// row, an instance plane, or a channel group). Threads stride the row once,
// accumulating (sum, sum_sq) simultaneously; partials are reduced with
// subgroupAdd plus a single shared-memory combine, then every thread applies
// the fused normalize + affine write.
//
// Numerics: for mean/variance modes the accumulation is shifted by the row's
// first element, so a large common offset cannot catastrophically cancel in
// the E[x^2] - E[x]^2 identity (variance is unchanged by shifting). Epsilon
// placement and the variance formula follow each op's reference shader:
//   layer:    inverseSqrt(variance + EPSILON)
//   group:    (x - mean) / sqrt(variance + EPSILON)
//   instance: inverseSqrt(max(variance, 0) + EPSILON)
//   rms:      inverseSqrt(sum_sq / HIDDEN + EPSILON)   (no mean, no shift)
//   lp:       x / norm with norm == 0 -> 0             (no epsilon)
const HIDDEN: u32 = {{ source.hidden }}u;
{% if source.vec4 %}
const HIDDEN_V: u32 = {{ source.hiddenVec }}u;
{% endif %}
const WG: u32 = {{ source.wg }}u;
{% if source.mode != "lp" %}
const EPSILON: f32 = {{ source.epsilon }};
{% endif %}
{% if source.mode == "group" %}
const NUM_GROUPS: u32 = {{ source.numGroups }}u;
const CPG: u32 = {{ source.cpg }}u;
{% if source.vec4 %}
const SPATIAL_V: u32 = {{ source.spatialVec }}u;
{% else %}
const SPATIAL: u32 = {{ source.spatial }}u;
{% endif %}
{% endif %}
{% if source.mode == "instance" %}
const CHANNELS: u32 = {{ source.channels }}u;
{% endif %}

{% if source.wg > 32 %}
// One partial per subgroup (requiredSubgroupMinSize 32 bounds the count).
const MAX_SG: u32 = {{ source.maxSubgroups }}u;
{% if source.mode == "rms" %}
var<workgroup> sg_partials: array<f32, MAX_SG>;
{% else %}
var<workgroup> sg_partials: array<vec2<f32>, MAX_SG>;
{% endif %}
{% endif %}

{% if source.mode == "rms" %}
fn reduce_scalar(value: f32, tid: u32, sg_lane: u32, sg_size: u32) -> f32 {
  let s = subgroupAdd(value);
{% if source.wg > 32 %}
  if (sg_lane == 0u) {
    sg_partials[tid / sg_size] = s;
  }
  workgroupBarrier();
  let num_sg = (WG + sg_size - 1u) / sg_size;
  var total = 0.0;
  for (var i = 0u; i < num_sg; i = i + 1u) {
    total = total + sg_partials[i];
  }
  return total;
{% else %}
  return s;
{% endif %}
}
{% else %}
fn reduce_pair(value: vec2<f32>, tid: u32, sg_lane: u32, sg_size: u32) -> vec2<f32> {
  let s = vec2<f32>(subgroupAdd(value.x), subgroupAdd(value.y));
{% if source.wg > 32 %}
  if (sg_lane == 0u) {
    sg_partials[tid / sg_size] = s;
  }
  workgroupBarrier();
  let num_sg = (WG + sg_size - 1u) / sg_size;
  var total = vec2<f32>(0.0, 0.0);
  for (var i = 0u; i < num_sg; i = i + 1u) {
    total = total + sg_partials[i];
  }
  return total;
{% else %}
  return s;
{% endif %}
}
{% endif %}

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wg_id: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>,
  @builtin(subgroup_invocation_id) sg_lane: u32,
  @builtin(subgroup_size) sg_size: u32
) {
  let row = wg_id.x + wg_id.y * params.rowStride;
  if (row >= params.rows) {
    return;
  }
  let tid = lid.x;
{% if source.vec4 %}
  let base = row * HIDDEN_V;
{% else %}
  let base = row * HIDDEN;
{% endif %}

{% if source.mode == "layer" or source.mode == "group" or source.mode == "instance" %}
{% if source.vec4 %}
  let shift = f32(x[base].x);
{% else %}
  let shift = f32(x[base]);
{% endif %}
{% endif %}

{% if source.mode == "rms" %}
  var acc = 0.0;
{% else %}
  var acc = vec2<f32>(0.0, 0.0);
{% endif %}
{% if source.vec4 %}
  for (var i = tid; i < HIDDEN_V; i = i + WG) {
    let v = vec4<f32>(x[base + i]);
{% if source.mode == "layer" or source.mode == "group" or source.mode == "instance" %}
    let d = v - vec4<f32>(shift);
    acc.x = acc.x + d.x + d.y + d.z + d.w;
    acc.y = acc.y + dot(d, d);
{% elif source.mode == "rms" %}
    acc = acc + dot(v, v);
{% elif source.mode == "lp" %}
{% if source.p == 1 %}
    let a = abs(v);
    acc.y = acc.y + a.x + a.y + a.z + a.w;
{% else %}
    acc.y = acc.y + dot(v, v);
{% endif %}
{% endif %}
  }
{% else %}
  for (var i = tid; i < HIDDEN; i = i + WG) {
    let v = f32(x[base + i]);
{% if source.mode == "layer" or source.mode == "group" or source.mode == "instance" %}
    let d = v - shift;
    acc.x = acc.x + d;
    acc.y = acc.y + d * d;
{% elif source.mode == "rms" %}
    acc = acc + v * v;
{% elif source.mode == "lp" %}
{% if source.p == 1 %}
    acc.y = acc.y + abs(v);
{% else %}
    acc.y = acc.y + v * v;
{% endif %}
{% endif %}
  }
{% endif %}

{% if source.mode == "rms" %}
  let total = reduce_scalar(acc, tid, sg_lane, sg_size);
{% else %}
  let totals = reduce_pair(acc, tid, sg_lane, sg_size);
{% endif %}

{% if source.mode == "layer" %}
  let mean_d = totals.x / f32(HIDDEN);
  let variance = max(totals.y / f32(HIDDEN) - mean_d * mean_d, 0.0);
  let inv = inverseSqrt(variance + EPSILON);
  let row_mean = shift + mean_d;
{% if source.writeStats %}
  if (tid == 0u) {
    mean_out[row] = row_mean;
    inv_std_out[row] = inv;
  }
{% endif %}
{% elif source.mode == "group" %}
  let mean_d = totals.x / f32(HIDDEN);
  let variance = max(totals.y / f32(HIDDEN) - mean_d * mean_d, 0.0);
  let denom = sqrt(variance + EPSILON);
  let row_mean = shift + mean_d;
  let g_ch_base = (row % NUM_GROUPS) * CPG;
{% elif source.mode == "instance" %}
  let mean_d = totals.x / f32(HIDDEN);
  let variance = max(totals.y / f32(HIDDEN) - mean_d * mean_d, 0.0);
  let inv = inverseSqrt(variance + EPSILON);
  let row_mean = shift + mean_d;
  let c = row % CHANNELS;
  let ch_scale = f32(scale[c]);
  let ch_bias = f32(bias[c]);
{% elif source.mode == "rms" %}
  let inv = inverseSqrt(total / f32(HIDDEN) + EPSILON);
{% elif source.mode == "lp" %}
{% if source.p == 2 %}
  let norm = sqrt(totals.y);
{% else %}
  let norm = totals.y;
{% endif %}
{% endif %}

{% if source.vec4 %}
  for (var i = tid; i < HIDDEN_V; i = i + WG) {
    let idx = base + i;
    let v = vec4<f32>(x[idx]);
{% if source.mode == "layer" %}
    var value = (v - vec4<f32>(row_mean)) * inv * vec4<f32>(scale[i]);
{% if source.hasBias %}
    value = value + vec4<f32>(bias[i]);
{% endif %}
    y[idx] = {{ source.vecType }}(value);
{% elif source.mode == "group" %}
    let ch = g_ch_base + i / SPATIAL_V;
    let normed = (v - vec4<f32>(row_mean)) / vec4<f32>(denom);
    y[idx] = {{ source.vecType }}(normed * vec4<f32>(f32(scale[ch])) + vec4<f32>(f32(bias[ch])));
{% elif source.mode == "instance" %}
    y[idx] = {{ source.vecType }}((v - vec4<f32>(row_mean)) * inv * vec4<f32>(ch_scale) + vec4<f32>(ch_bias));
{% elif source.mode == "rms" %}
    y[idx] = {{ source.vecType }}(v * inv * vec4<f32>(scale[i]));
{% elif source.mode == "lp" %}
    let normalized = select(v / vec4<f32>(norm), vec4<f32>(0.0), vec4<bool>(norm == 0.0));
    y[idx] = {{ source.vecType }}(normalized);
{% endif %}
  }
{% else %}
  for (var i = tid; i < HIDDEN; i = i + WG) {
    let idx = base + i;
    let v = f32(x[idx]);
{% if source.mode == "layer" %}
    var value = (v - row_mean) * inv * f32(scale[i]);
{% if source.hasBias %}
    value = value + f32(bias[i]);
{% endif %}
    y[idx] = {{ source.scalar }}(value);
{% elif source.mode == "group" %}
    let ch = g_ch_base + i / SPATIAL;
    let normed = (v - row_mean) / denom;
    y[idx] = {{ source.scalar }}(normed * f32(scale[ch]) + f32(bias[ch]));
{% elif source.mode == "instance" %}
    y[idx] = {{ source.scalar }}((v - row_mean) * inv * ch_scale + ch_bias);
{% elif source.mode == "rms" %}
    y[idx] = {{ source.scalar }}(v * inv * f32(scale[i]));
{% elif source.mode == "lp" %}
    let normalized = select(v / norm, 0.0, norm == 0.0);
    y[idx] = {{ source.scalar }}(normalized);
{% endif %}
  }
{% endif %}
}
`]]),ts=new Map([["com.xenova.AddInPlace",{manifest:{schemaVersion:1,domain:"com.xenova",name:"AddInPlace",sinceVersion:1,inputs:[{role:"Y",dtype:"Y"},{role:"X",dtype:"X"}],outputs:[{role:"Y",dtype:"Y",shape:"shapes.yT"}],typeConstraints:{Y:["float32","float16"],X:["float32","float16"]},args:{yT:{kind:"tensor",semantic:"Y",role:"inout"},xT:{kind:"tensor",semantic:"X",role:"input"},count:{kind:"u32",semantic:"kernel.count"}},tunables:{WORKGROUP_SIZE:64,MAX_WORKGROUPS_X:1024},variants:[{id:"scalar",when:"args.count > 0 and numel(shapes.yT) >= args.count and numel(shapes.xT) >= args.count and (f16Ok(dtypes.Y) and f16Ok(dtypes.X))",passes:[{id:"main",name:"AddInPlace",shader:"add-in-place.wgsl.jinja",bindings:[{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$Y"},{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$X"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"count",type:"u32",value:"args.count"},{name:"wgY",type:"u32",value:"min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X)"}]}}],dispatch:{x:"min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X)",y:"ceil(ceil(args.count / tunables.WORKGROUP_SIZE) / min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X))",z:1},reads:["Y","X"],writes:["Y"]}]}]},assets:[["add-in-place.wgsl.jinja",`{% if Y == "f16" or X == "f16" %}
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
`]]}],["com.xenova.gemma4.ArgMax",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"ArgMax",sinceVersion:1,inputs:[{role:"X",dtype:"T",optional:!0},{role:"CandVal",dtype:"float32",optional:!0},{role:"CandIdx",dtype:"uint32",optional:!0}],outputs:[{role:"Out",dtype:"uint32",shape:[1]}],typeConstraints:{T:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input",required:!1},outT:{kind:"tensor",semantic:"Out",role:"output"},count:{kind:"u32",semantic:"count"},candValT:{kind:"tensor",semantic:"CandVal",role:"input",required:!1},candIdxT:{kind:"tensor",semantic:"CandIdx",role:"input",required:!1},finalize:{kind:"u32",semantic:"finalize_mode",required:!1}},variants:[{id:"finalize",priority:9,when:"args.finalize and present.candValT and present.candIdxT and args.count > 0 and numel(shapes.candValT) >= args.count and numel(shapes.candIdxT) >= args.count",constants:{NCAND:"args.count"},passes:[{id:"final",name:"Gemma4ArgMaxFinalize",shader:"argmax-final.wgsl.jinja",bindings:[{name:"cand_val",arg:"candValT",semantic:"CandVal",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"cand_idx",arg:"candIdxT",semantic:"CandIdx",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1,y:1,z:1},reads:["CandVal","CandIdx"],writes:["Out"]}]},{id:"twopass",priority:5,when:'(not args.finalize) and present.xT and (args.count >= 16384 and args.count > 0 and numel(shapes.xT) >= args.count and (tensorDtypes.xT == "float32" or tensorDtypes.xT == "float16") and (tensorDtypes.xT != "float16" or device.features.has("shader-f16")))',constants:{usesF16:'tensorDtypes.xT == "float16"',inputScalar:"dtypes.T",COUNT:"args.count",SLICE:"ceil(args.count / 256)",NCAND:256},intermediates:[{id:"cand_val",dtype:"float32",shape:"[256]"},{id:"cand_idx",dtype:"uint32",shape:"[256]"}],passes:[{id:"partial",name:"Gemma4ArgMaxPartial",shader:"argmax-partial.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"cand_val",semantic:"cand_val",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"cand_idx",semantic:"cand_idx",role:"scratch",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:256,y:1,z:1},reads:["X"],writes:["cand_val","cand_idx"]},{id:"final",name:"Gemma4ArgMaxFinal",shader:"argmax-final.wgsl.jinja",bindings:[{name:"cand_val",semantic:"cand_val",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"cand_idx",semantic:"cand_idx",role:"scratch",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1,y:1,z:1},reads:["cand_val","cand_idx"],writes:["Out"]}]},{id:"scalar",priority:0,when:'(not args.finalize) and present.xT and (args.count > 0 and numel(shapes.xT) >= args.count and (tensorDtypes.xT == "float32" or tensorDtypes.xT == "float16") and (tensorDtypes.xT != "float16" or device.features.has("shader-f16")))',constants:{usesF16:'tensorDtypes.xT == "float16"',inputScalar:"dtypes.T",COUNT:"args.count"},passes:[{id:"main",name:"ArgMax",shader:"argmax.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1,y:1,z:1},reads:["X"],writes:["Out"]}]}]},assets:[["argmax-final.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

// Two-pass argmax, pass 2: pick the winner among the per-slice candidates. Candidates are in
// slice order, so the index tie-break keeps first-on-ties semantics.

const NCAND: u32 = {{ NCAND }}u;
const WG: u32 = 256u;
const NEG_INF: f32 = -3.4028234663852886e38;

var<workgroup> wgVal: array<f32, WG>;
var<workgroup> wgIdx: array<u32, WG>;

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  var bestVal: f32 = NEG_INF;
  var bestIdx: u32 = 0u;
  var i: u32 = tid;
  loop {
    if (i >= NCAND) {
      break;
    }
    let v = cand_val[i];
    let idx = cand_idx[i];
    if (v > bestVal || (v == bestVal && idx < bestIdx)) {
      bestVal = v;
      bestIdx = idx;
    }
    i = i + WG;
  }
  wgVal[tid] = bestVal;
  wgIdx[tid] = bestIdx;
  workgroupBarrier();

  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (tid < stride) {
      let o = tid + stride;
      if (wgVal[o] > wgVal[tid] || (wgVal[o] == wgVal[tid] && wgIdx[o] < wgIdx[tid])) {
        wgVal[tid] = wgVal[o];
        wgIdx[tid] = wgIdx[o];
      }
    }
    stride = stride / 2u;
    workgroupBarrier();
  }

  if (tid == 0u) {
    out[0] = wgIdx[0];
  }
}
`],["argmax-partial.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Two-pass argmax, pass 1: each workgroup scans a contiguous slice of X and emits its local
// (max, index) candidate. Slices are contiguous and in order, and within a slice the strided
// scan + index tie-break keep first-on-ties semantics, so the final pass over candidates is
// exactly equivalent to the single-workgroup scan.

const COUNT: u32 = {{ COUNT }}u;
const SLICE: u32 = {{ SLICE }}u;
const WG: u32 = 256u;
const NEG_INF: f32 = -3.4028234663852886e38;

var<workgroup> wgVal: array<f32, WG>;
var<workgroup> wgIdx: array<u32, WG>;

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let base = wg.x * SLICE;
  let end = min(base + SLICE, COUNT);
  var bestVal: f32 = NEG_INF;
  var bestIdx: u32 = 0u;
  var i: u32 = base + tid;
  loop {
    if (i >= end) {
      break;
    }
    let v = f32(x[i]);
    if (v > bestVal) {
      bestVal = v;
      bestIdx = i;
    }
    i = i + WG;
  }
  wgVal[tid] = bestVal;
  wgIdx[tid] = bestIdx;
  workgroupBarrier();

  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (tid < stride) {
      let o = tid + stride;
      if (wgVal[o] > wgVal[tid] || (wgVal[o] == wgVal[tid] && wgIdx[o] < wgIdx[tid])) {
        wgVal[tid] = wgVal[o];
        wgIdx[tid] = wgIdx[o];
      }
    }
    stride = stride / 2u;
    workgroupBarrier();
  }

  if (tid == 0u) {
    cand_val[wg.x] = wgVal[0];
    cand_idx[wg.x] = wgIdx[0];
  }
}
`],["argmax.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Single-workgroup argmax over X[0..COUNT) -> out[0] = index of the max (first
// on ties, matching JS \`a[i] > a[best]\`). Greedy decode reads back only this
// u32 result.

const COUNT: u32 = {{ COUNT }}u;
const WG: u32 = 256u;

var<workgroup> wgVal: array<f32, WG>;
var<workgroup> wgIdx: array<u32, WG>;

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  var bestVal: f32 = -3.4028234663852886e38;
  var bestIdx: u32 = 0u;
  var i: u32 = tid;
  loop {
    if (i >= COUNT) {
      break;
    }
    let v = f32(x[i]);
    if (v > bestVal) {
      bestVal = v;
      bestIdx = i;
    }
    i = i + WG;
  }
  wgVal[tid] = bestVal;
  wgIdx[tid] = bestIdx;
  workgroupBarrier();

  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (tid < stride) {
      let o = tid + stride;
      if (wgVal[o] > wgVal[tid] || (wgVal[o] == wgVal[tid] && wgIdx[o] < wgIdx[tid])) {
        wgVal[tid] = wgVal[o];
        wgIdx[tid] = wgIdx[o];
      }
    }
    stride = stride / 2u;
    workgroupBarrier();
  }

  if (tid == 0u) {
    out[0] = wgIdx[0];
  }
}
`]]}],["com.xenova.gemma4.Attention",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"Attention",sinceVersion:1,inputs:[{role:"Q",dtype:"T"},{role:"K",dtype:"T"},{role:"V",dtype:"T"}],outputs:[{role:"Out",dtype:"U",shape:["args.seqQ","args.qHeads * args.headDim"]}],typeConstraints:{T:["float32","float16"],U:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"input"},kT:{kind:"tensor",semantic:"K",role:"input"},vT:{kind:"tensor",semantic:"V",role:"input"},outT:{kind:"tensor",semantic:"Out",role:"output"},seqQ:{kind:"u32",semantic:"seq_q"},keyLen:{kind:"u32",semantic:"key_len"},qOffset:{kind:"u32",semantic:"q_offset"},qHeads:{kind:"u32",semantic:"q_heads"},kvHeads:{kind:"u32",semantic:"kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},scale:{kind:"f32",semantic:"scale",required:!1},window:{kind:"u32",semantic:"window",required:!1},exact:{kind:"u32",semantic:"exact_reference_order",required:!1},maxKeyLen:{kind:"u32",semantic:"max_key_len",required:!1}},variants:[{id:"tiled",priority:5,when:["(not args.exact)",'(args.seqQ > 0 and args.keyLen > 0 and args.qHeads > 0 and args.kvHeads > 0 and args.headDim > 0 and args.qHeads % args.kvHeads == 0 and tensorDtypes.qT == tensorDtypes.kT and tensorDtypes.qT == tensorDtypes.vT and (tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.qT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16")) and numel(shapes.qT) >= args.seqQ * args.qHeads * args.headDim and numel(shapes.kT) >= args.keyLen * args.kvHeads * args.headDim and numel(shapes.vT) >= args.keyLen * args.kvHeads * args.headDim and numel(shapes.outT) >= args.seqQ * args.qHeads * args.headDim)',"args.seqQ >= 32","args.headDim % 32 == 0",'device.features.has("subgroups")','has(device.adapterInfo, "subgroupMinSize")',"device.adapterInfo.subgroupMinSize >= 32"],constants:{inputScalar:"dtypes.T",outputScalar:"dtypes.U",outputVec4:'"vec4<f16>" if dtypes.U == "f16" else "vec4<f32>"',inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',headDim:"args.headDim",TILE_Q:"32 if args.headDim >= 512 else 16",TILE_K:8,scale:"args.scale if args.scale else 1.0",usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.outT == "float16"',stageF16:'args.headDim >= 512 and device.features.has("shader-f16")'},passes:[{id:"main",name:"Gemma4Attention",shader:"gemma4-attention-tiled.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"k",arg:"kT",semantic:"K",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputVec4"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"seqQ",type:"u32",value:"args.seqQ"},{name:"keyLen",type:"u32",value:"args.keyLen"},{name:"qOffset",type:"u32",value:"args.qOffset"},{name:"qHeads",type:"u32",value:"args.qHeads"},{name:"kvHeads",type:"u32",value:"args.kvHeads"},{name:"window",type:"u32",value:"args.window if args.window else 0"}]}}],dispatch:{x:"ceil(args.seqQ / (32 if args.headDim >= 512 else 16))",y:"args.qHeads",z:1},reads:["Q","K","V"],writes:["Out"]}]},{id:"scalar",priority:0,when:["(not args.exact)",'(args.seqQ > 0 and args.keyLen > 0 and args.qHeads > 0 and args.kvHeads > 0 and args.headDim > 0 and args.qHeads % args.kvHeads == 0 and tensorDtypes.qT == tensorDtypes.kT and tensorDtypes.qT == tensorDtypes.vT and (tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.qT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16")) and numel(shapes.qT) >= args.seqQ * args.qHeads * args.headDim and numel(shapes.kT) >= args.keyLen * args.kvHeads * args.headDim and numel(shapes.vT) >= args.keyLen * args.kvHeads * args.headDim and numel(shapes.outT) >= args.seqQ * args.qHeads * args.headDim)'],constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.U",headDim:"args.headDim",workgroupSize:128,scale:"args.scale if args.scale else 1.0"},passes:[{id:"main",name:"Gemma4Attention",shader:"gemma4-attention.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"k",arg:"kT",semantic:"K",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"seqQ",type:"u32",value:"args.seqQ"},{name:"keyLen",type:"u32",value:"args.keyLen"},{name:"qOffset",type:"u32",value:"args.qOffset"},{name:"qHeads",type:"u32",value:"args.qHeads"},{name:"kvHeads",type:"u32",value:"args.kvHeads"},{name:"window",type:"u32",value:"args.window if args.window else 0"}]}}],dispatch:{x:"args.seqQ",y:"args.qHeads",z:1},reads:["Q","K","V"],writes:["Out"]}]}]},assets:[["gemma4-attention-tiled.wgsl.jinja",`{% if usesF16 or stageF16 %}
enable f16;
{% endif %}
enable subgroups;
{{ env.wgsl.resourceDeclarations }}
{% set ST = "f16" if stageF16 else "f32" %}

// Tiled flash prefill attention (seqQ >= 64): TILE_Q queries x LPQ-lane clusters per
// workgroup, K/V staged in workgroup memory once per tile for all TILE_Q queries.
//
// Each workgroup shares one K/V tile across TILE_Q queries and splits each query
// across an 8-lane subgroup cluster to fit f32/headDim register pressure:
//   - thread (qSub, lane8) holds q/o register slices of HEAD_DIM/8 = 32 dims (8 vec4s each)
//   - scores: per-lane partial dot + 3 subgroupShuffleXor adds (cluster-internal, no barriers)
//   - online softmax state (m, l) per thread, replicated across the cluster (identical values)
//   - V accumulate: o_slice += p_k * v_tile[k][slice] straight from workgroup memory
// K/V tiles are TILE_K=8 keys x HEAD_DIM, cooperatively loaded as vec4s.
//
// Causality/window are per-query masks; the key loop runs over the union range of the
// workgroup's queries (start at the first query's window floor, end at the last query's
// causal ceiling) \u2014 uniform trip count, masked probabilities for out-of-range (query, key)
// pairs. All bounds come from runtime uniforms, so replay can keep a stable
// dispatch shape.

const HEAD_DIM: u32 = {{ headDim }}u;
const TILE_Q: u32 = {{ TILE_Q }}u;
const LPQ: u32 = 8u;                      // lanes per query cluster
const SLICE: u32 = HEAD_DIM / (4u * LPQ); // vec4s per lane slice
const TILE_K: u32 = {{ TILE_K }}u;
const WG: u32 = TILE_Q * LPQ;
const SCALE: f32 = {{ scale }};
const NEG_INF: f32 = -3.4028234663852886e38;

// Staged K/V tile dtype: f16 halves workgroup storage at headDim=512.
// Scores/PV still accumulate in f32 (converted on read), so only K/V carry f16
// rounding.
var<workgroup> k_tile: array<vec4<{{ ST }}>, TILE_K * (HEAD_DIM / 4u)>;
var<workgroup> v_tile: array<vec4<{{ ST }}>, TILE_K * (HEAD_DIM / 4u)>;

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let h = wg.y;
  let tid = lid.x;
  let qSub = tid / LPQ;
  let lane8 = tid % LPQ;
  let qIdx = wg.x * TILE_Q + qSub;
  let qValid = qIdx < params.seqQ && h < params.qHeads;

  let groupSize = params.qHeads / params.kvHeads;
  let hKv = h / groupSize;
  let qPos = params.qOffset + min(qIdx, params.seqQ - 1u);

  // Per-thread q slice (8 vec4s) and output accumulator (8 vec4s) in registers.
  let qBase4 = (min(qIdx, params.seqQ - 1u) * params.qHeads + h) * (HEAD_DIM / 4u) + lane8 * SLICE;
  var qr: array<vec4<f32>, SLICE>;
  var o: array<vec4<f32>, SLICE>;
  for (var c: u32 = 0u; c < SLICE; c = c + 1u) {
    qr[c] = vec4<f32>(q[qBase4 + c]);
    o[c] = vec4<f32>(0.0);
  }
  var m: f32 = NEG_INF;
  var l: f32 = 0.0;

  // Per-query causal/window bounds + the workgroup's union key range.
  let maxKj = min(params.keyLen, qPos + 1u);
  var minKj: u32 = 0u;
  if (params.window > 0u && qPos + 1u > params.window) {
    minKj = qPos + 1u - params.window;
  }
  let lastQPos = params.qOffset + min(wg.x * TILE_Q + TILE_Q - 1u, params.seqQ - 1u);
  let wgEnd = min(params.keyLen, lastQPos + 1u);
  let firstQPos = params.qOffset + wg.x * TILE_Q;
  var wgStart: u32 = 0u;
  if (params.window > 0u && firstQPos + 1u > params.window) {
    wgStart = firstQPos + 1u - params.window;
  }

  var kStart: u32 = wgStart;
  loop {
    if (kStart >= wgEnd) { break; }

    // --- cooperative K/V tile load (vec4-coalesced; OOB keys zero-filled) ---
    workgroupBarrier();
    for (var i: u32 = tid; i < TILE_K * (HEAD_DIM / 4u); i = i + WG) {
      let slot = i / (HEAD_DIM / 4u);
      let d4 = i % (HEAD_DIM / 4u);
      let kj = kStart + slot;
      let base4 = (kj * params.kvHeads + hKv) * (HEAD_DIM / 4u) + d4;
      if (kj < wgEnd) {
        k_tile[i] = vec4<{{ ST }}>(k[base4]);
        v_tile[i] = vec4<{{ ST }}>(v[base4]);
      } else {
        k_tile[i] = vec4<{{ ST }}>(0.0);
        v_tile[i] = vec4<{{ ST }}>(0.0);
      }
    }
    workgroupBarrier();

    // --- scores for this tile's keys (per-thread registers; cluster shuffle combine) ---
{% for kk in range(TILE_K) %}
    var s{{ kk }}: f32 = NEG_INF;
    {
      let kj = kStart + {{ kk }}u;
      var part: f32 = 0.0;
      let kb = {{ kk }}u * (HEAD_DIM / 4u) + lane8 * SLICE;
      for (var c: u32 = 0u; c < SLICE; c = c + 1u) {
        part = part + dot(qr[c], vec4<f32>(k_tile[kb + c]));
      }
      part = part + subgroupShuffleXor(part, 1u);
      part = part + subgroupShuffleXor(part, 2u);
      part = part + subgroupShuffleXor(part, 4u);
      if (kj >= minKj && kj < maxKj) {
        s{{ kk }} = part * SCALE;
      }
    }
{% endfor %}

    // --- per-thread online softmax over the tile ---
    var tileMax: f32 = s0;
{% for kk in range(1, TILE_K) %}
    tileMax = max(tileMax, s{{ kk }});
{% endfor %}
    let newMax = max(m, tileMax);
    // All-masked tiles keep m = NEG_INF; exp(NEG_INF - NEG_INF) is NaN, so guard via select.
    let corr = select(exp(m - newMax), 0.0, m == NEG_INF);
{% for kk in range(TILE_K) %}
    let p{{ kk }} = select(0.0, exp(s{{ kk }} - newMax), s{{ kk }} != NEG_INF);
{% endfor %}
    l = l * corr + ({% for kk in range(TILE_K) %}{% if kk > 0 %} + {% endif %}p{{ kk }}{% endfor %});
    for (var c: u32 = 0u; c < SLICE; c = c + 1u) {
      var acc = o[c] * corr;
{% for kk in range(TILE_K) %}
      acc = acc + p{{ kk }} * vec4<f32>(v_tile[{{ kk }}u * (HEAD_DIM / 4u) + lane8 * SLICE + c]);
{% endfor %}
      o[c] = acc;
    }
    m = newMax;

    kStart = kStart + TILE_K;
  }

  if (qValid) {
    let outBase4 = (qIdx * params.qHeads + h) * (HEAD_DIM / 4u) + lane8 * SLICE;
    let inv = 1.0 / l;
    for (var c: u32 = 0u; c < SLICE; c = c + 1u) {
      out[outBase4 + c] = {{ outputVec4 }}(o[c] * inv);
    }
  }
}
`],["gemma4-attention.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}

{{ env.wgsl.resourceDeclarations }}

// Gemma4 attention: Q[seqQ, qHeads, headDim] over cached K/V[keyLen, kvHeads, headDim].
// Query qi has absolute position qOffset + qi. Always causal (keys 0..qPos), plus an
// optional sliding window (keys kj > qPos - window). GQA: each q head maps to head/groupSize.
//
// TILED FLASH softmax (one workgroup per (qi, h)): keys are processed in tiles of WG. Within
// a tile each thread owns one key and computes its full q\xB7k dot in registers (no per-key
// workgroup reduction). The whole tile uses two reductions (tile max + tile denom), while
// the running max/denominator and the headDim output accumulator stay in workgroup memory
// and are rescaled once per tile (online softmax).
// V reads in the accumulate loop are coalesced (adjacent threads read adjacent headDim cols).

const HEAD_DIM: u32 = {{ headDim }}u;
const WG: u32 = {{ workgroupSize }}u;
const TILE: u32 = {{ workgroupSize }}u;
const SCALE: f32 = {{ scale }};
const NEG_INF: f32 = -3.4028234663852886e38;

var<workgroup> q_sh: array<f32, {{ headDim }}>;
var<workgroup> out_acc: array<f32, {{ headDim }}>;
var<workgroup> probs: array<f32, {{ workgroupSize }}>;
var<workgroup> red: array<f32, {{ workgroupSize }}>;
var<workgroup> running_max: f32;
var<workgroup> running_denom: f32;

fn reduce_max(value: f32, tid: u32) -> f32 {
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = max(red[tid], red[tid + stride]); }
    stride = stride / 2u;
    workgroupBarrier();
  }
  return red[0];
}

fn reduce_sum(value: f32, tid: u32) -> f32 {
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  return red[0];
}

@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let qi = wg.x;
  let h  = wg.y;
  if (qi >= params.seqQ || h >= params.qHeads) {
    return;
  }

  let tid = lid.x;
  let groupSize = params.qHeads / params.kvHeads;
  let hKv = h / groupSize;
  let qPos = params.qOffset + qi;
  let qBase = (qi * params.qHeads + h) * HEAD_DIM;

  for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
    q_sh[d] = f32(q[qBase + d]);
    out_acc[d] = 0.0;
  }
  if (tid == 0u) {
    running_max = NEG_INF;
    running_denom = 0.0;
  }
  workgroupBarrier();

  let maxKj = min(params.keyLen, qPos + 1u);
  var minKj: u32 = 0u;
  if (params.window > 0u && qPos + 1u > params.window) {
    minKj = qPos + 1u - params.window;
  }

  var tile: u32 = minKj;
  loop {
    if (tile >= maxKj) { break; }
    let kj = tile + tid;

    // Each thread computes the full q\xB7k dot for its own key (no reduction here).
    var sval: f32 = NEG_INF;
    if (kj < maxKj) {
      let kBase = (kj * params.kvHeads + hKv) * HEAD_DIM;
      var acc: f32 = 0.0;
      for (var d: u32 = 0u; d < HEAD_DIM; d = d + 1u) {
        acc = acc + q_sh[d] * f32(k[kBase + d]);
      }
      sval = acc * SCALE;
    }

    let tileMax = reduce_max(sval, tid);
    let newMax = max(running_max, tileMax);
    let correction = exp(running_max - newMax);

    var p: f32 = 0.0;
    if (kj < maxKj) { p = exp(sval - newMax); }
    probs[tid] = p;
    let tileDenom = reduce_sum(p, tid);

    if (tid == 0u) {
      running_denom = running_denom * correction + tileDenom;
      running_max = newMax;
    }
    workgroupBarrier();

    // Accumulate weighted V into the headDim output accumulator (coalesced V reads).
    let tileCount = min(TILE, maxKj - tile);
    for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
      var a: f32 = out_acc[d] * correction;
      for (var j: u32 = 0u; j < tileCount; j = j + 1u) {
        let vBase = ((tile + j) * params.kvHeads + hKv) * HEAD_DIM;
        a = a + probs[j] * f32(v[vBase + d]);
      }
      out_acc[d] = a;
    }
    workgroupBarrier();

    tile = tile + TILE;
  }

  let outBase = (qi * params.qHeads + h) * HEAD_DIM;
  let inv = 1.0 / running_denom;
  for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
    out[outBase + d] = {{ outputScalar }}(out_acc[d] * inv);
  }
}
`]]}],["com.xenova.gemma4.DecodeAttention",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeAttention",sinceVersion:1,inputs:[{role:"Q",dtype:"T"},{role:"W",dtype:"float32",rank:1},{role:"Cos",dtype:"float32"},{role:"Sin",dtype:"float32"},{role:"K",dtype:"T"},{role:"V",dtype:"T"}],outputs:[{role:"Out",dtype:"U"}],typeConstraints:{T:["float32","float16"],U:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"input"},wT:{kind:"tensor",semantic:"W",role:"weights"},cosT:{kind:"tensor",semantic:"Cos",role:"input"},sinT:{kind:"tensor",semantic:"Sin",role:"input"},kT:{kind:"tensor",semantic:"K",role:"input"},vT:{kind:"tensor",semantic:"V",role:"input"},outT:{kind:"tensor",semantic:"Out",role:"output"},seqQ:{kind:"u32",semantic:"seq_q"},keyLen:{kind:"u32",semantic:"key_len"},qOffset:{kind:"u32",semantic:"q_offset"},qHeads:{kind:"u32",semantic:"q_heads"},kvHeads:{kind:"u32",semantic:"kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},eps:{kind:"f32",semantic:"eps",required:!1},scale:{kind:"f32",semantic:"scale",required:!1},window:{kind:"u32",semantic:"window",required:!1},outQuantScale:{kind:"f32",semantic:"out_quant_scale",required:!1}},variants:[{id:"split8_fused",priority:5,when:'args.seqQ == 1 and args.keyLen > 0 and args.qHeads > 0 and args.kvHeads > 0 and args.headDim > 0 and args.headDim % 2 == 0 and args.qHeads % args.kvHeads == 0 and tensorDtypes.qT == tensorDtypes.kT and tensorDtypes.qT == tensorDtypes.vT and (tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.qT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16")) and numel(shapes.qT) >= args.qHeads * args.headDim and dim(shapes.wT, 0) == args.headDim and numel(shapes.cosT) >= args.headDim / 2 and numel(shapes.sinT) >= args.headDim / 2 and numel(shapes.kT) >= args.keyLen * args.kvHeads * args.headDim and numel(shapes.vT) >= args.keyLen * args.kvHeads * args.headDim and numel(shapes.outT) >= args.qHeads * args.headDim and args.headDim % 4 == 0',constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.U",HEAD_DIM:"args.headDim",HALF_DIM:"args.headDim / 2",NCHUNK:32,WG:256,EPS:"args.eps if args.eps else 0.000001",scale:"args.scale if args.scale else 1.0",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",MERGE_WG:128,OUT_Q:"args.outQuantScale if args.outQuantScale else 0.0",qHeadsConst:"args.qHeads"},intermediates:[{id:"attn_partials",dtype:"uint32",shape:"[args.qHeads * 32 * (args.headDim + 2) + args.qHeads]"}],passes:[{id:"partial",name:"Gemma4DecodeAttentionPartial",shader:"decode-attention-partial.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"w",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"cosTbl",arg:"cosT",semantic:"Cos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sinTbl",arg:"sinT",semantic:"Sin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"partials",semantic:"attn_partials",role:"scratch",buffer:{type:"storage"},elementType:"atomic<u32>"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"seqQ",type:"u32",value:"args.seqQ"},{name:"keyLen",type:"u32",value:"args.keyLen"},{name:"qOffset",type:"u32",value:"args.qOffset"},{name:"qHeads",type:"u32",value:"args.qHeads"},{name:"kvHeads",type:"u32",value:"args.kvHeads"},{name:"window",type:"u32",value:"args.window if args.window else 0"}]}}],dispatch:{x:"args.qHeads",y:32,z:1},reads:["Q","W","Cos","Sin","K","V"],writes:["attn_partials","Out"]}]}]},assets:[["decode-attention-partial.wgsl.jinja",`{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Decode (seqQ==1) fused attention, pass 1 of 2: per-(head, key-chunk) flash partials.
//
// Fuses q-head RMSNorm + split-half RoPE into the attention kernel. Each
// (head, chunk) workgroup owns a normalized/rotated query copy in shared memory,
// so chunks can run independently over their key ranges.
//
// The active key range is split into chunks. Each workgroup owns one chunk and
// writes flash partials (running max m, denominator l, unnormalized
// V-accumulator acc[hd]) to scratch; the last-arriver merge combines them in
// the same dispatch. RoPE tables carry cos=1/sin=0 beyond the partial-rotary
// cutoff, so rotating every pair is exact.
//
// The dispatch launches NCHUNK chunk workgroups for replay stability, while
// nActive = clamp(ceil(activeKeys / 64), 8, NCHUNK) chooses how many chunks
// actually participate. Surplus workgroups return before touching the
// last-arriver ticket. Sliding-window layers cap activeKeys at the window, so
// only full-attention layers fan out at long context.

const HEAD_DIM: u32 = {{ HEAD_DIM }}u;
const HALF_DIM: u32 = {{ HALF_DIM }}u;
const NCHUNK: u32 = {{ NCHUNK }}u;
const WG: u32 = {{ WG }}u;
const EPS: f32 = {{ EPS }};
const SCALE: f32 = {{ scale }};
const NEG_INF: f32 = -3.4028234663852886e38;
const PP_COUNTER_BASE: u32 = {{ qHeadsConst }}u * NCHUNK * (HEAD_DIM + 2u);
// Pre-applies the o-projection's input SRQ at the merged output; this pass's
// uniform stays position-only.
const OUT_Q: f32 = {{ OUT_Q }};

var<workgroup> lastFlag: u32;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

var<workgroup> qn_sh: array<f32, HEAD_DIM>;
var<workgroup> out_acc: array<f32, HEAD_DIM>;
var<workgroup> probs: array<f32, WG>;
var<workgroup> sval_sh: array<f32, WG>;
var<workgroup> red: array<f32, WG>;
var<workgroup> wgt_sh: array<f32, NCHUNK>;
var<workgroup> vacc_sh: array<vec4<f32>, WG>;
var<workgroup> running_max: f32;
var<workgroup> running_denom: f32;

{% if useSubgroups %}
// Reductions over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroup ops; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently \u2014 correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64])
// where a plain subgroup op would span multiple 32-blocks.
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
fn sg_max(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupMax(value);
{% else %}
  var x = value;
  x = max(x, subgroupShuffleXor(x, 1u));
  x = max(x, subgroupShuffleXor(x, 2u));
  x = max(x, subgroupShuffleXor(x, 4u));
  x = max(x, subgroupShuffleXor(x, 8u));
  x = max(x, subgroupShuffleXor(x, 16u));
  return x;
{% endif %}
}

// Hybrid 2-barrier reductions: 32-block reduce, followed by a cross-block combine.
fn reduce_max(value: f32, tid: u32) -> f32 {
  let s = sg_max(value);
  if ((tid & 31u) == 0u) { red[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = NEG_INF;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = max(total, red[i]); }
  workgroupBarrier();
  return total;
}

fn reduce_sum(value: f32, tid: u32) -> f32 {
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { red[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + red[i]; }
  workgroupBarrier();
  return total;
}
{% else %}
fn reduce_max(value: f32, tid: u32) -> f32 {
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = max(red[tid], red[tid + stride]); }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
}

fn reduce_sum(value: f32, tid: u32) -> f32 {
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
}
{% endif %}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let h = wg.x;
  let ci = wg.y;
  if (h >= params.qHeads) { return; }

  let tid = lid.x;
  let groupSize = params.qHeads / params.kvHeads;
  let hKv = h / groupSize;
  let qPos = params.qOffset;
  let qBase = h * HEAD_DIM;

  // --- runtime chunk partition (uniform per workgroup: params + builtins only) ---
  let maxKj = min(params.keyLen, qPos + 1u);
  var minKj: u32 = 0u;
  if (params.window > 0u && qPos + 1u > params.window) {
    minKj = qPos + 1u - params.window;
  }
  let activeKeys = maxKj - minKj;
  let nActive = clamp((activeKeys + 63u) / 64u, 8u, NCHUNK);
  if (ci >= nActive) { return; }

  // --- fused q RMSNorm (matches DecodeQkNormRope: f32, WG-tree, eps after /dim) ---
  var ss: f32 = 0.0;
  var d: u32 = tid;
  loop {
    if (d >= HEAD_DIM) { break; }
    let v = f32(q[qBase + d]);
    ss = ss + v * v;
    d = d + WG;
  }
  let nscale = inverseSqrt(reduce_sum(ss, tid) / f32(HEAD_DIM) + EPS);

  // --- + split-half RoPE into shared qn ---
  var p: u32 = tid;
  loop {
    if (p >= HALF_DIM) { break; }
    let n0 = f32(q[qBase + p]) * nscale * f32(w[p]);
    let n1 = f32(q[qBase + p + HALF_DIM]) * nscale * f32(w[p + HALF_DIM]);
    let c = cosTbl[p];
    let s = sinTbl[p];
    qn_sh[p] = n0 * c - n1 * s;
    qn_sh[p + HALF_DIM] = n1 * c + n0 * s;
    p = p + WG;
  }
  for (var i: u32 = tid; i < HEAD_DIM; i = i + WG) {
    out_acc[i] = 0.0;
  }
  if (tid == 0u) {
    running_max = NEG_INF;
    running_denom = 0.0;
  }
  workgroupBarrier();

  // --- this chunk's key range ---
  let chunkLen = (activeKeys + nActive - 1u) / nActive;
  let start = minKj + ci * chunkLen;
  let end = min(start + chunkLen, maxKj);

  // --- flash loop over the chunk (tiles of WG keys) ---
  var tile: u32 = start;
  loop {
    if (tile >= end) { break; }
    let kj = tile + tid;

{% if useSubgroups %}
    // Cooperative Q.K: one 32-lane subgroup per key, lanes splitting HEAD_DIM.
    // The loop has a uniform trip count, so subgroupAdd stays in subgroup-uniform
    // flow while the head-dimension dot is reduced by the subgroup.
    let tileCountS = min(WG, end - tile);
    let sgRounds = (tileCountS + (WG / 32u) - 1u) / (WG / 32u);
    for (var rr: u32 = 0u; rr < sgRounds; rr = rr + 1u) {
      let j = rr * (WG / 32u) + (tid / 32u);
      var accS: f32 = 0.0;
      if (j < tileCountS) {
        let kBase4 = ((tile + j) * params.kvHeads + hKv) * (HEAD_DIM / 4u);
        for (var d4: u32 = (tid & 31u); d4 < HEAD_DIM / 4u; d4 = d4 + 32u) {
          let kv4 = vec4<f32>(k[kBase4 + d4]);
          accS = accS + dot(vec4<f32>(qn_sh[d4 * 4u], qn_sh[d4 * 4u + 1u], qn_sh[d4 * 4u + 2u], qn_sh[d4 * 4u + 3u]), kv4);
        }
      }
      let sj = sg_sum(accS);
      if ((tid & 31u) == 0u && j < tileCountS) { sval_sh[j] = sj * SCALE; }
    }
    workgroupBarrier();
    var sval: f32 = NEG_INF;
    if (kj < end) { sval = sval_sh[tid]; }
{% else %}
    var sval: f32 = NEG_INF;
    if (kj < end) {
      let kBase4 = (kj * params.kvHeads + hKv) * (HEAD_DIM / 4u);
      var acc: f32 = 0.0;
      for (var d4: u32 = 0u; d4 < HEAD_DIM / 4u; d4 = d4 + 1u) {
        let kv4 = vec4<f32>(k[kBase4 + d4]);
        acc = acc + dot(vec4<f32>(qn_sh[d4 * 4u], qn_sh[d4 * 4u + 1u], qn_sh[d4 * 4u + 2u], qn_sh[d4 * 4u + 3u]), kv4);
      }
      sval = acc * SCALE;
    }
{% endif %}

    let tileMax = reduce_max(sval, tid);
    let newMax = max(running_max, tileMax);
    let correction = exp(running_max - newMax);

    var pr: f32 = 0.0;
    if (kj < end) { pr = exp(sval - newMax); }
    probs[tid] = pr;
    let tileDenom = reduce_sum(pr, tid);

    if (tid == 0u) {
      running_denom = running_denom * correction + tileDenom;
      running_max = newMax;
    }
    workgroupBarrier();

    // V accumulation, j-split across the whole workgroup: thread (jg, d4)
    // accumulates keys j == jg mod J_GROUPS for dim block d4 into a register,
    // then the groups combine through shared memory. This keeps all lanes active
    // during the per-key V accumulation.
    let tileCount = min(WG, end - tile);
    let jg = tid / (HEAD_DIM / 4u);
    let d4v = tid % (HEAD_DIM / 4u);
    const J_GROUPS: u32 = WG / (HEAD_DIM / 4u);
    var vacc = vec4<f32>(0.0);
    var jj: u32 = jg;
    loop {
      if (jj >= tileCount) { break; }
      let vBase4 = ((tile + jj) * params.kvHeads + hKv) * (HEAD_DIM / 4u);
      vacc = vacc + probs[jj] * vec4<f32>(v[vBase4 + d4v]);
      jj = jj + J_GROUPS;
    }
    vacc_sh[tid] = vacc;
    workgroupBarrier();
    for (var d4: u32 = tid; d4 < HEAD_DIM / 4u; d4 = d4 + WG) {
      var a4 = vec4<f32>(out_acc[d4 * 4u], out_acc[d4 * 4u + 1u], out_acc[d4 * 4u + 2u], out_acc[d4 * 4u + 3u]) * correction;
      for (var g: u32 = 0u; g < J_GROUPS; g = g + 1u) {
        a4 = a4 + vacc_sh[g * (HEAD_DIM / 4u) + d4];
      }
      out_acc[d4 * 4u] = a4.x;
      out_acc[d4 * 4u + 1u] = a4.y;
      out_acc[d4 * 4u + 2u] = a4.z;
      out_acc[d4 * 4u + 3u] = a4.w;
    }
    workgroupBarrier();

    tile = tile + WG;
  }

  // --- write the flash partial (m, l, acc[hd]) via bitcast-atomics; WGSL only
  // guarantees cross-workgroup visibility for this same-dispatch merge through atomics. ---
  let pBase = (h * NCHUNK + ci) * (HEAD_DIM + 2u);
  for (var i: u32 = tid; i < HEAD_DIM; i = i + WG) {
    atomicStore(&partials[pBase + i], bitcast<u32>(out_acc[i]));
  }
  if (tid == 0u) {
    atomicStore(&partials[pBase + HEAD_DIM], bitcast<u32>(running_max));
    atomicStore(&partials[pBase + HEAD_DIM + 1u], bitcast<u32>(running_denom));
  }
  storageBarrier();

  // --- last-arriver merge: the final active chunk workgroup for head h combines
  // all chunk partials in this dispatch. ---
  if (tid == 0u) {
    let ticket = atomicAdd(&partials[PP_COUNTER_BASE + h], 1u);
    lastFlag = select(0u, 1u, ticket == nActive - 1u);
  }
  if (workgroupUniformLoad(&lastFlag) != 1u) {
    return;
  }
  if (tid == 0u) { atomicStore(&partials[PP_COUNTER_BASE + h], 0u); }

  // Parallel weight pass: thread c < nActive owns chunk c's (m, l). The chunk
  // weights live in workgroup memory so the accumulator loop can index them
  // dynamically without private-array spilling.
  var mloc: f32 = NEG_INF;
  var lloc: f32 = 0.0;
  if (tid < nActive) {
    let pb = (h * NCHUNK + tid) * (HEAD_DIM + 2u);
    mloc = bitcast<f32>(atomicLoad(&partials[pb + HEAD_DIM]));
    lloc = bitcast<f32>(atomicLoad(&partials[pb + HEAD_DIM + 1u]));
  }
  let newM = reduce_max(mloc, tid);
  var wloc: f32 = 0.0;
  if (tid < nActive) {
    wloc = exp(mloc - newM);
    wgt_sh[tid] = wloc;
  }
  let denom = reduce_sum(lloc * wloc, tid);
  let inv = 1.0 / denom;
  for (var d: u32 = tid; d < HEAD_DIM; d = d + WG) {
    var acc: f32 = 0.0;
    for (var c: u32 = 0u; c < nActive; c = c + 1u) {
      acc = acc + bitcast<f32>(atomicLoad(&partials[(h * NCHUNK + c) * (HEAD_DIM + 2u) + d])) * wgt_sh[c];
    }
    out[h * HEAD_DIM + d] = {{ outputScalar }}(srq(acc * inv, OUT_Q));
  }
}
`]]}],["com.xenova.gemma4.DecodeDownNormAdd",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeDownNormAdd",sinceVersion:1,inputs:[{role:"A",dtype:"T"},{role:"Bits",dtype:"uint32"},{role:"Scale",dtype:"float32"},{role:"Hidden",dtype:"H"},{role:"W",dtype:"float32",rank:1}],outputs:[{role:"Hidden",dtype:"H"}],typeConstraints:{T:["float32","float16"],H:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},bitsT:{kind:"tensor",semantic:"Bits",role:"weights"},scaleT:{kind:"tensor",semantic:"Scale",role:"weights"},hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},wT:{kind:"tensor",semantic:"W",role:"weights"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},bits:{kind:"u32",semantic:"bits"},zeroPoint:{kind:"u32",semantic:"zero_point"},mask:{kind:"u32",semantic:"mask"},inputScale:{kind:"f32",semantic:"input_activation_scale",required:!1},outputScale:{kind:"f32",semantic:"output_activation_scale",required:!1},eps:{kind:"f32",semantic:"eps",required:!1},codes:{kind:"u32",semantic:"input_is_codes",required:!1}},variants:[{id:"fused",priority:5,when:'(device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32 or args.codes) and (args.bits == 2 or args.bits == 4) and args.M == 1 and args.inFeatures > 0 and args.outFeatures > 0 and args.outFeatures <= 4096 and (args.inFeatures * args.bits / 32) % 4 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.hiddenT) >= args.outFeatures and dim(shapes.wT, 0) == args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.hiddenT != "float16") or device.features.has("shader-f16"))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.hiddenT == "float16"',inputScalar:"dtypes.T",xScalar:"dtypes.H",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",N_ROWS:4,TOTAL_WGS:"ceil(args.outFeatures / 4)",EPS:"args.eps if args.eps else 0.000001",WG:256,CODES:"1 if args.codes else 0",aVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"'},intermediates:[{id:"pp",dtype:"uint32",shape:"[args.outFeatures + 1]"}],passes:[{id:"main",name:"DecodeDownNormAddFused",shader:"down-fused.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aVec4"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"pp",semantic:"pp",role:"scratch",buffer:{type:"storage"},elementType:"atomic<u32>"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"nw",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"},{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}],dispatch:{x:"ceil(args.outFeatures / 4)",y:1,z:1},reads:["A","Bits","Scale","Hidden","W"],writes:["pp","Hidden"]}]},{id:"splitk",priority:0,when:'(not args.codes) and ((args.bits == 2 or args.bits == 4) and args.M == 1 and args.inFeatures > 0 and args.outFeatures > 0 and args.outFeatures <= 4096 and (args.inFeatures * args.bits / 32) % 4 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.hiddenT) >= args.outFeatures and dim(shapes.wT, 0) == args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.hiddenT != "float16") or device.features.has("shader-f16")))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.hiddenT == "float16"',inputScalar:"dtypes.T",xScalar:"dtypes.H",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",SPLIT:4,WG:32,N_ROWS:2,MERGE_WG:128,EPS:"args.eps if args.eps else 0.000001",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32',GRID_X:"min(ceil(args.outFeatures / 2), 65535)"},intermediates:[{id:"partial_qa",dtype:"float32",shape:"[args.outFeatures * 4]"},{id:"partial_a",dtype:"float32",shape:"[4]"}],passes:[{id:"partial",name:"DecodeDownNormAddPartial",shader:"down-partial.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"partial_qa",semantic:"partial_qa",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"partial_a",semantic:"partial_a",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"}]}}],dispatch:{x:"min(ceil(args.outFeatures / 2), 65535)",y:"ceil(ceil(args.outFeatures / 2) / min(ceil(args.outFeatures / 2), 65535))",z:4},reads:["A","Bits"],writes:["partial_qa","partial_a"]},{id:"merge",name:"DecodeDownNormAddMerge",shader:"down-merge-norm-add.wgsl.jinja",bindings:[{name:"partial_qa",semantic:"partial_qa",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"partial_a",semantic:"partial_a",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"w",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}],dispatch:{x:1,y:1,z:1},reads:["partial_qa","partial_a","Scale","Hidden","W"],writes:["Hidden"]}]}]},assets:[["down-fused.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Single-dispatch fused down-projection + post-FFN residual norm-add (M=1 decode).
// N_ROWS output rows per workgroup, each reducing the full K row (no K-split):
// threads stride the row's packed words (lane-coalesced), activation vec4 loads
// are amortized over all N_ROWS rows, and the per-row scale/ZP/SRQ epilogue
// runs in the GEMV phase (one subgroup tree per workgroup). The last-arriver
// tail re-reads only the final OUT_F d values.
//   - each workgroup bumps an atomic ticket counter (in \`pp\`); the last workgroup merges:
//     hidden = hidden + RMSNorm(d) * w  (d values re-read through the atomics)
// pp layout: [0 .. OUT_F)  final d values (bitcast f32 through atomic u32 \u2014 the WGSL memory
//                          model only guarantees cross-workgroup visibility through atomics)
//            [OUT_F]       ticket counter (reset by the merge for the next replay)

const OUT_F: u32 = {{ OUT_FEATURES }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const ZP: f32 = {{ ZP }}.0;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;
const TOTAL_WGS: u32 = {{ TOTAL_WGS }}u;
const EPS: f32 = {{ EPS }};
const COUNTER_IDX: u32 = OUT_F;

var<workgroup> dsh: array<f32, OUT_F>;
{% if useSubgroups %}
var<workgroup> sgq: array<vec4<f32>, WG / 32u>;
var<workgroup> sgs: array<f32, WG / 32u>;
{% else %}
// Subgroup-free fallback (device lacks subgroups or has a non-32 subgroup width):
// every thread parks its partial, the combine sums the full workgroup. Slower combine
// (a serial/tree pass over WG instead of WG/32), but correct on any subgroup size and
// only on the off-critical-path final-row epilogue.
var<workgroup> sgq: array<vec4<f32>, WG>;
var<workgroup> sgs: array<f32, WG>;
{% endif %}
var<workgroup> lastFlag: u32;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

{% if useSubgroups %}
// Sum over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently, correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64]).
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
fn sg_sum_v4(value: vec4<f32>) -> vec4<f32> {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
{% endif %}

fn reduce_sum(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  // Hybrid 2-barrier reduction (sg_sum within each 32-block + cross-block combine).
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgs[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgs[i]; }
  workgroupBarrier();
  return total;
{% else %}
  // Workgroup-memory tree reduction; total broadcast to every thread via sgs[0].
  sgs[tid] = value;
  workgroupBarrier();
  for (var s: u32 = WG / 2u; s > 0u; s = s >> 1u) {
    if (tid < s) { sgs[tid] = sgs[tid] + sgs[tid + s]; }
    workgroupBarrier();
  }
  let total = sgs[0];
  workgroupBarrier();
  return total;
{% endif %}
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let rowBase = wg.x * N_ROWS;
  let inScale = params.inScale;

{% for r in range(N_ROWS) %}
  var q{{ r }}: f32 = 0.0;
{% endfor %}
  var sumA: f32 = 0.0;
  var w: u32 = tid;
  loop {
    if (w >= WORDS_PER_ROW) { break; }
{% if CODES %}
    // Codes mode: \`a\` holds int8 SRQ codes (producer-quantized); the grid
    // scale is applied once per row in the epilogue. With the unorm weight
    // lanes below, the dot uses c/255-rounded lanes and has the same small
    // drift profile as the other presrq GEMVs.
{% for c in range(CHUNKS) %}
    let av{{ c }} = vec4<f32>(a[w * CHUNKS + {{ c }}u]);
{% endfor %}
{% else %}
{% for c in range(CHUNKS) %}
    let av{{ c }} = srq4(vec4<f32>(a[w * CHUNKS + {{ c }}u]), inScale);
{% endfor %}
{% endif %}
    sumA = sumA + {% for c in range(CHUNKS) %}{% if c > 0 %} + {% endif %}(av{{ c }}.x + av{{ c }}.y + av{{ c }}.z + av{{ c }}.w){% endfor %};
{% for r in range(N_ROWS) %}
    {
      let o = rowBase + {{ r }}u;
      if (o < OUT_F) {
        let p = bits_buf[o * WORDS_PER_ROW + w];
        // unorm cvt-fold: unpack4x8unorm gives fl(code/255); the x255 decode
        // is undone once per output row in the epilogue.
{% if BITS == 4 %}
        let lo = unpack4x8unorm(p & 0x0F0F0F0Fu);
        let hi = unpack4x8unorm((p >> 4u) & 0x0F0F0F0Fu);
        q{{ r }} = q{{ r }} + (dot(vec4<f32>(lo.x, hi.x, lo.y, hi.y), av0)
                             + dot(vec4<f32>(lo.z, hi.z, lo.w, hi.w), av1));
{% else %}
        let d0 = unpack4x8unorm(p & 0x03030303u);
        let d1 = unpack4x8unorm((p >> 2u) & 0x03030303u);
        let d2 = unpack4x8unorm((p >> 4u) & 0x03030303u);
        let d3 = unpack4x8unorm((p >> 6u) & 0x03030303u);
        q{{ r }} = q{{ r }} + ((dot(vec4<f32>(d0.x, d1.x, d2.x, d3.x), av0)
                              + dot(vec4<f32>(d0.y, d1.y, d2.y, d3.y), av1))
                             + (dot(vec4<f32>(d0.z, d1.z, d2.z, d3.z), av2)
                              + dot(vec4<f32>(d0.w, d1.w, d2.w, d3.w), av3)));
{% endif %}
      }
    }
{% endfor %}
    w = w + WG;
  }

{% if N_ROWS == 2 %}
{% if useSubgroups %}
  let red = sg_sum_v4(vec4<f32>(q0, q1, sumA, 0.0));
  if ((tid & 31u) == 0u) { sgq[tid >> 5u] = red; }
  workgroupBarrier();
  if (tid == 0u) {
    var tot = vec4<f32>(0.0);
    for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { tot = tot + sgq[i]; }
    let aSum = tot.z;
{% else %}
  // Parallel workgroup tree (shared barriers): O(log WG) instead of a serial sum by tid 0.
  sgq[tid] = vec4<f32>(q0, q1, sumA, 0.0);
  workgroupBarrier();
  for (var s: u32 = WG / 2u; s > 0u; s = s >> 1u) {
    if (tid < s) { sgq[tid] = sgq[tid] + sgq[tid + s]; }
    workgroupBarrier();
  }
  if (tid == 0u) {
    let tot = sgq[0];
    let aSum = tot.z;
{% endif %}
{% else %}
{% if useSubgroups %}
  let red = sg_sum_v4(vec4<f32>(q0, q1, q2, q3));
  let redA = sg_sum(sumA);
  if ((tid & 31u) == 0u) { sgq[tid >> 5u] = red; sgs[tid >> 5u] = redA; }
  workgroupBarrier();
  if (tid == 0u) {
    var tot = vec4<f32>(0.0);
    var aSum: f32 = 0.0;
    for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { tot = tot + sgq[i]; aSum = aSum + sgs[i]; }
{% else %}
  // Parallel workgroup tree (shared barriers): the q-vec and sumA reduce together, sharing
  // one barrier chain \u2014 O(log WG) vs a serial sum by tid 0 over all WG partials.
  sgq[tid] = vec4<f32>(q0, q1, q2, q3);
  sgs[tid] = sumA;
  workgroupBarrier();
  for (var s: u32 = WG / 2u; s > 0u; s = s >> 1u) {
    if (tid < s) { sgq[tid] = sgq[tid] + sgq[tid + s]; sgs[tid] = sgs[tid] + sgs[tid + s]; }
    workgroupBarrier();
  }
  if (tid == 0u) {
    let tot = sgq[0];
    let aSum = sgs[0];
{% endif %}
{% endif %}
    let outScale = params.outScale;
    let zpA = ZP * aSum;
{% for r in range(N_ROWS) %}
    {
      let o = rowBase + {{ r }}u;
      if (o < OUT_F) {
        // fma(q, 255, -zpA) undoes the partial phase's unorm 1/255 decode scale.
{% if CODES %}
        let d = srq(scale[o] * (inScale * fma(tot[{{ r }}u], 255.0, -zpA)), outScale);
{% else %}
        let d = srq(scale[o] * fma(tot[{{ r }}u], 255.0, -zpA), outScale);
{% endif %}
        atomicStore(&pp[o], bitcast<u32>(d));
      }
    }
{% endfor %}
  }
  storageBarrier();

  if (tid == 0u) {
    let ticket = atomicAdd(&pp[COUNTER_IDX], 1u);
    lastFlag = select(0u, 1u, ticket == TOTAL_WGS - 1u);
  }
  // workgroupUniformLoad = implicit barrier + a value the uniformity analysis accepts
  // (the merge tail below contains workgroupBarrier calls).
  if (workgroupUniformLoad(&lastFlag) != 1u) {
    return;
  }

  // ---- norm-add tail (last workgroup, all WG threads) ----
  if (tid == 0u) { atomicStore(&pp[COUNTER_IDX], 0u); }
  var acc: f32 = 0.0;
  var o2: u32 = tid;
  loop {
    if (o2 >= OUT_F) { break; }
    let d = bitcast<f32>(atomicLoad(&pp[o2]));
    dsh[o2] = d;
    acc = acc + d * d;
    o2 = o2 + WG;
  }
  let rms = inverseSqrt(reduce_sum(acc, tid) / f32(OUT_F) + EPS);

  o2 = tid;
  loop {
    if (o2 >= OUT_F) { break; }
    hidden[o2] = {{ xScalar }}(f32(hidden[o2]) + dsh[o2] * rms * f32(nw[o2]));
    o2 = o2 + WG;
  }
}
`],["down-merge-norm-add.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Merge pass of the fused down-projection + post-FFN residual norm-add (M=1 decode):
//   d[o]   = srq(scale[o] * (sum_z partial_qa[o, z] - ZP * sum_z partial_a[z]), outScale)
//   hidden = hidden + RMSNorm(d) * w
// One workgroup folds the split-K partials (OUT_F x SPLIT), then runs the RMS
// over d while d stays in workgroup memory between phases.

const OUT_F: u32 = {{ OUT_FEATURES }}u;
const SPLIT: u32 = {{ SPLIT }}u;
const ZP: f32 = {{ ZP }}.0;
const WG: u32 = {{ MERGE_WG }}u;
const EPS: f32 = {{ EPS }};

var<workgroup> dsh: array<f32, OUT_F>;

{% if useSubgroups %}
var<workgroup> sgp: array<f32, WG / 32u>;

fn reduce_sum(value: f32, tid: u32) -> f32 {
  let s = subgroupAdd(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
}
{% else %}
var<workgroup> partial: array<f32, WG>;

fn reduce_sum(value: f32, tid: u32) -> f32 {
  partial[tid] = value;
  workgroupBarrier();
  var stride = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { partial[tid] = partial[tid] + partial[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = partial[0];
  workgroupBarrier();
  return r;
}
{% endif %}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let outScale = params.outScale;

  var sumA: f32 = 0.0;
  for (var z: u32 = 0u; z < SPLIT; z = z + 1u) {
    sumA = sumA + partial_a[z];
  }

  var acc: f32 = 0.0;
  var o: u32 = tid;
  loop {
    if (o >= OUT_F) { break; }
    var qa: f32 = 0.0;
    for (var z: u32 = 0u; z < SPLIT; z = z + 1u) {
      qa = qa + partial_qa[o * SPLIT + z];
    }
    let d = srq(scale[o] * (qa - ZP * sumA), outScale);
    dsh[o] = d;
    acc = acc + d * d;
    o = o + WG;
  }
  let rms = inverseSqrt(reduce_sum(acc, tid) / f32(OUT_F) + EPS);

  o = tid;
  loop {
    if (o >= OUT_F) { break; }
    hidden[o] = {{ xScalar }}(f32(hidden[o]) + dsh[o] * rms * f32(w[o]));
    o = o + WG;
  }
}
`],["down-partial.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Split-K partial pass of QatMatMul (M=1 decode). The K reduction is split into
// SPLIT contiguous chunks, each handled by a separate workgroup per output group.
// Each (outputGroup, chunk) workgroup writes partial integer-ish sums; the merge
// pass sums over chunks and applies the per-row scale + ZP + SRQ. Bit-identical
// to the scalar path because the partial sums are exact.

const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const BITS: u32 = {{ BITS }}u;
const VALS_PER_WORD: u32 = {{ VALS_PER_WORD }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const WORDS_PER_CHUNK: u32 = {{ WORDS_PER_ROW }}u / {{ SPLIT }}u;
const MASK: u32 = {{ MASK }}u;
const SPLIT: u32 = {{ SPLIT }}u;
const GRID_X: u32 = {{ GRID_X }}u;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;

{% if not useSubgroups %}
var<workgroup> red: array<f32, WG>;
{% endif %}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn reduce(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
{% endif %}
}

@compute @workgroup_size({{ WG }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let g = wg.y * GRID_X + wg.x;       // output-row group
  let chunk = wg.z;                   // K chunk
  let rowBase = g * N_ROWS;
  if (rowBase >= OUT_FEATURES) { return; }
  let tid = lid.x;
  let inScale = params.inScale;

  let wStart = chunk * WORDS_PER_CHUNK;
  let wEnd = wStart + WORDS_PER_CHUNK;

  var sumQA: array<f32, N_ROWS>;
  for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { sumQA[r] = 0.0; }
  var sumA: f32 = 0.0;

  var w: u32 = wStart + tid;
  loop {
    if (w >= wEnd) { break; }
    let colBase: u32 = w * VALS_PER_WORD;
    var avc: array<vec4<f32>, CHUNKS>;
    for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
      let b = colBase + c * 4u;
      let a4 = vec4<f32>(
        srq(f32(a[b]), inScale),
        srq(f32(a[b + 1u]), inScale),
        srq(f32(a[b + 2u]), inScale),
        srq(f32(a[b + 3u]), inScale));
      avc[c] = a4;
      sumA = sumA + a4.x + a4.y + a4.z + a4.w;
    }
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let o = rowBase + r;
      if (o < OUT_FEATURES) {
        let packed: u32 = bits_buf[o * WORDS_PER_ROW + w];
        for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
          let sh = (vec4<u32>(0u, 1u, 2u, 3u) + c * 4u) * BITS;
          let q4 = vec4<f32>((vec4<u32>(packed) >> sh) & vec4<u32>(MASK));
          sumQA[r] = sumQA[r] + dot(q4, avc[c]);
        }
      }
    }
    w = w + WG;
  }

  let rA = reduce(sumA, tid);
  for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
    let rQA = reduce(sumQA[r], tid);
    let o = rowBase + r;
    if (tid == 0u && o < OUT_FEATURES) {
      partial_qa[o * SPLIT + chunk] = rQA;
    }
  }
  // sumA is independent of the output row; one workgroup per chunk records it.
  if (g == 0u && tid == 0u) {
    partial_a[chunk] = rA;
  }
}
`]]}],["com.xenova.gemma4.DecodeGateUpNorm",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeGateUpNorm",sinceVersion:1,inputs:[{role:"Hidden",dtype:"T"},{role:"GateBits",dtype:"uint32"},{role:"GateScale",dtype:"float32"},{role:"UpBits",dtype:"uint32"},{role:"UpScale",dtype:"float32"},{role:"SumA",dtype:"float32",optional:!0},{role:"GeluLut",dtype:"float32"}],outputs:[{role:"Out",dtype:"O",shape:["args.M","args.outFeatures"]}],typeConstraints:{T:["float32","float16"],O:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},gateBitsT:{kind:"tensor",semantic:"GateBits",role:"weights"},gateScaleT:{kind:"tensor",semantic:"GateScale",role:"weights"},upBitsT:{kind:"tensor",semantic:"UpBits",role:"weights"},upScaleT:{kind:"tensor",semantic:"UpScale",role:"weights"},sumAT:{kind:"tensor",semantic:"SumA",role:"input",required:!1},outT:{kind:"tensor",semantic:"Out",role:"output"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},bits:{kind:"u32",semantic:"bits"},zeroPoint:{kind:"u32",semantic:"zero_point"},mask:{kind:"u32",semantic:"mask"},inScale:{kind:"f32",semantic:"input_activation_scale",required:!1},gateOutScale:{kind:"f32",semantic:"gate_output_activation_scale",required:!1},upOutScale:{kind:"f32",semantic:"up_output_activation_scale",required:!1},outQuantScale:{kind:"f32",semantic:"out_quant_scale",required:!1},emitCodes:{kind:"u32",semantic:"emit_codes",required:!1},geluLutT:{kind:"tensor",semantic:"GeluLut",role:"weights"},exact:{kind:"u32",semantic:"exact_reference_order",required:!1}},bindingSets:{default:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"gate_bits",arg:"gateBitsT",semantic:"GateBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"gate_scale",arg:"gateScaleT",semantic:"GateScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"up_bits",arg:"upBitsT",semantic:"UpBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"up_scale",arg:"upScaleT",semantic:"UpScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"gelu_lut",arg:"geluLutT",semantic:"GeluLut",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"invInScale",type:"f32",value:"(1.0 / args.inScale) if args.inScale else 0.0"},{name:"gateOutScale",type:"f32",value:"args.gateOutScale if args.gateOutScale else 0.0"},{name:"invGateOutScale",type:"f32",value:"(1.0 / args.gateOutScale) if args.gateOutScale else 0.0"},{name:"upOutScale",type:"f32",value:"args.upOutScale if args.upOutScale else 0.0"},{name:"invUpOutScale",type:"f32",value:"(1.0 / args.upOutScale) if args.upOutScale else 0.0"}]}}],set1:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"gate_bits",arg:"gateBitsT",semantic:"GateBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"gate_scale",arg:"gateScaleT",semantic:"GateScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"up_bits",arg:"upBitsT",semantic:"UpBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"up_scale",arg:"upScaleT",semantic:"UpScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sum_a",arg:"sumAT",semantic:"SumA",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"gelu_lut",arg:"geluLutT",semantic:"GeluLut",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"gateOutScale",type:"f32",value:"args.gateOutScale if args.gateOutScale else 0.0"},{name:"upOutScale",type:"f32",value:"args.upOutScale if args.upOutScale else 0.0"},{name:"outQuantScale",type:"f32",value:"args.outQuantScale if args.outQuantScale else 0.0"}]}}],set2:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"gate_bits",arg:"gateBitsT",semantic:"GateBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"gate_scale",arg:"gateScaleT",semantic:"GateScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"up_bits",arg:"upBitsT",semantic:"UpBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"up_scale",arg:"upScaleT",semantic:"UpScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"gelu_lut",arg:"geluLutT",semantic:"GeluLut",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"gateOutScale",type:"f32",value:"args.gateOutScale if args.gateOutScale else 0.0"},{name:"upOutScale",type:"f32",value:"args.upOutScale if args.upOutScale else 0.0"}]}}],set3:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"gate_bits",arg:"gateBitsT",semantic:"GateBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"gate_scale",arg:"gateScaleT",semantic:"GateScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"up_bits",arg:"upBitsT",semantic:"UpBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"up_scale",arg:"upScaleT",semantic:"UpScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"gelu_lut",arg:"geluLutT",semantic:"GeluLut",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"gateOutScale",type:"f32",value:"args.gateOutScale if args.gateOutScale else 0.0"},{name:"upOutScale",type:"f32",value:"args.upOutScale if args.upOutScale else 0.0"}]}}]},variants:[{id:"gemm",priority:12,when:"(not args.exact) and (present.sumAT and (args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.inFeatures <= 4096 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.hiddenT) >= args.M * args.inFeatures and numel(shapes.sumAT) >= args.M and numel(shapes.gateBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.gateScaleT) >= args.outFeatures and numel(shapes.upBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.upScaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (f16Ok(dtypes.T)) and numel(shapes.geluLutT) >= 256) and args.M >= 16",constants:{usesF16:'dtypes.T == "f16"',scalar:"dtypes.T",M:"args.M",H:"args.inFeatures",INTER:"args.outFeatures",BITS:"args.bits",VPW:"32 / args.bits",CHUNKS:"8 / args.bits",WPR:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:64,N_ROWS:"2 if args.bits == 2 else 4",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32',GRID_X:"min(ceil(args.outFeatures / (32 if args.bits == 4 else 16)), 65535)",M_TILE:"2 if args.M > 2 else args.M",outScalar:"dtypes.O",SG_COUNT:2,hiddenVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',EMIT_CODES:"1 if args.emitCodes else 0",GEMM:1,THREADS_N:16,THREADS_M:16,N_PT:"2 if args.bits == 4 else 1",M_PT:2,PRESRQ:1},passes:[{id:"main",name:"DecodeGateUpNormPresrq",shader:"decode-gate-up-norm-presrq.wgsl.jinja",bindings:"set1",dispatch:{x:"min(ceil(args.outFeatures / (32 if args.bits == 4 else 16)), 65535)",y:"ceil(ceil(args.outFeatures / (32 if args.bits == 4 else 16)) / min(ceil(args.outFeatures / (32 if args.bits == 4 else 16)), 65535))",z:"ceil(args.M / 32)"},reads:["Hidden","GateBits","GateScale","UpBits","UpScale","SumA","GeluLut"],writes:["Out"]}]},{id:"presrq",priority:10,when:"(not args.exact) and (present.sumAT and (args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.inFeatures <= 4096 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.hiddenT) >= args.M * args.inFeatures and numel(shapes.sumAT) >= args.M and numel(shapes.gateBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.gateScaleT) >= args.outFeatures and numel(shapes.upBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.upScaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (f16Ok(dtypes.T)) and numel(shapes.geluLutT) >= 256)",constants:{usesF16:'dtypes.T == "f16"',scalar:"dtypes.T",M:"args.M",H:"args.inFeatures",INTER:"args.outFeatures",BITS:"args.bits",VPW:"32 / args.bits",CHUNKS:"8 / args.bits",WPR:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:64,N_ROWS:"2 if args.bits == 2 else 4",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",GRID_X:"min(ceil(args.outFeatures / ((2 if args.bits == 2 else 4) * 2)), 65535)",M_TILE:"2 if args.M > 2 else args.M",outScalar:"dtypes.O",SG_COUNT:2,hiddenVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',EMIT_CODES:"1 if args.emitCodes else 0",GEMM:0,PRESRQ:1},passes:[{id:"main",name:"DecodeGateUpNormPresrq",shader:"decode-gate-up-norm-presrq.wgsl.jinja",bindings:"set1",dispatch:{x:"min(ceil(args.outFeatures / ((2 if args.bits == 2 else 4) * 2)), 65535)",y:"ceil(ceil(args.outFeatures / ((2 if args.bits == 2 else 4) * 2)) / min(ceil(args.outFeatures / ((2 if args.bits == 2 else 4) * 2)), 65535))",z:"ceil(args.M / (2 if args.M > 2 else args.M))"},reads:["Hidden","GateBits","GateScale","UpBits","UpScale","SumA","GeluLut"],writes:["Out"]}]},{id:"gemm_sgmat",priority:13,when:'(not args.exact) and ((not args.emitCodes) and ((args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.inFeatures <= 4096 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.hiddenT) >= args.M * args.inFeatures and numel(shapes.gateBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.gateScaleT) >= args.outFeatures and numel(shapes.upBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.upScaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (f16Ok(dtypes.T))) and numel(shapes.geluLutT) >= 256) and args.M >= 16 and args.M >= 64 and args.inFeatures % 32 == 0 and args.outFeatures % 64 == 0 and args.inScale > 0 and device.features.has("shader-f16") and device.features.has("subgroups") and device.features.has("chromium-experimental-subgroup-matrix")',constants:{usesF16:'dtypes.T == "f16"',scalar:"dtypes.T",M:"args.M",H:"args.inFeatures",INTER:"args.outFeatures",BITS:"args.bits",CHUNKS:"8 / args.bits",WPR:"args.inFeatures * args.bits / 32",ZP:"args.zeroPoint",outScalar:"dtypes.O"},passes:[{id:"main",name:"DecodeGateUpNorm",shader:"decode-gate-up-norm-sgmat.wgsl.jinja",bindings:"set2",dispatch:{x:"ceil(args.outFeatures / 64)",y:"ceil(args.M / 32)",z:1},reads:["Hidden","GateBits","GateScale","UpBits","UpScale","GeluLut"],writes:["Out"]}]},{id:"gemm_staged",priority:8,when:"(not args.exact) and ((not args.emitCodes) and ((args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.inFeatures <= 4096 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.hiddenT) >= args.M * args.inFeatures and numel(shapes.gateBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.gateScaleT) >= args.outFeatures and numel(shapes.upBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.upScaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (f16Ok(dtypes.T))) and numel(shapes.geluLutT) >= 256) and args.M >= 16",constants:{usesF16:'dtypes.T == "f16"',scalar:"dtypes.T",M:"args.M",H:"args.inFeatures",INTER:"args.outFeatures",BITS:"args.bits",VPW:"32 / args.bits",CHUNKS:"8 / args.bits",WPR:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:32,N_ROWS:2,useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',GRID_X:"min(ceil(args.outFeatures / (32 if args.bits == 4 else 16)), 65535)",M_TILE:"2 if args.M > 2 else args.M",outScalar:"dtypes.O",hiddenVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',GEMM:1,PRESRQ:0,EMIT_CODES:0,THREADS_N:16,THREADS_M:16,N_PT:"2 if args.bits == 4 else 1",M_PT:2,SG_COUNT:1},passes:[{id:"main",name:"DecodeGateUpNorm",shader:"decode-gate-up-norm-presrq.wgsl.jinja",bindings:"set3",dispatch:{x:"min(ceil(args.outFeatures / (32 if args.bits == 4 else 16)), 65535)",y:"ceil(ceil(args.outFeatures / (32 if args.bits == 4 else 16)) / min(ceil(args.outFeatures / (32 if args.bits == 4 else 16)), 65535))",z:"ceil(args.M / 32)"},reads:["Hidden","GateBits","GateScale","UpBits","UpScale","GeluLut"],writes:["Out"]}]},{id:"staged",priority:0,when:"(not args.exact) and ((not args.emitCodes) and ((args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.inFeatures <= 4096 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.hiddenT) >= args.M * args.inFeatures and numel(shapes.gateBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.gateScaleT) >= args.outFeatures and numel(shapes.upBitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.upScaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (f16Ok(dtypes.T))) and numel(shapes.geluLutT) >= 256)",constants:{usesF16:'dtypes.T == "f16"',scalar:"dtypes.T",M:"args.M",H:"args.inFeatures",INTER:"args.outFeatures",BITS:"args.bits",VPW:"32 / args.bits",CHUNKS:"8 / args.bits",WPR:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:32,N_ROWS:2,useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',GRID_X:"min(ceil(args.outFeatures / 2), 65535)",M_TILE:"2 if args.M > 2 else args.M",outScalar:"dtypes.O",hiddenVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',GEMM:0,PRESRQ:0},passes:[{id:"main",name:"DecodeGateUpNorm",shader:"decode-gate-up-norm.wgsl.jinja",bindings:"set3",dispatch:{x:"min(ceil(args.outFeatures / 2), 65535)",y:"ceil(ceil(args.outFeatures / 2) / min(ceil(args.outFeatures / 2), 65535))",z:"ceil(args.M / (2 if args.M > 2 else args.M))"},reads:["Hidden","GateBits","GateScale","UpBits","UpScale","GeluLut"],writes:["Out"]}]}]},assets:[["decode-gate-up-norm-presrq.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// presrq path for the fused gate/up GEMV: \`hidden\` is already srq-quantized and \`sum_a[m]\`
// holds its per-row sum (both produced by com.xenova.gemma4.DecodeRmsSrq). This removes the
// per-workgroup srq() over activation elements and the per-workgroup sumA reduction.
//   g   = srq(gate_scale[o] * (sum_k qg*a - ZP*sum_a), gateOutScale)
//   u   = srq(up_scale[o]   * (sum_k qu*a - ZP*sum_a), upOutScale)
//   out[o] = gelu_tanh(g) * u

const M: u32 = {{ M }}u;
const M_TILE: u32 = {{ M_TILE }}u;
const H: u32 = {{ H }}u;
const INTER: u32 = {{ INTER }}u;
const BITS: u32 = {{ BITS }}u;
const VPW: u32 = {{ VPW }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WPR: u32 = {{ WPR }}u;
const MASK: u32 = {{ MASK }}u;
const ZP: f32 = {{ ZP }}.0;
const WG: u32 = {{ WG }}u;
const SG_COUNT: u32 = {{ SG_COUNT }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;
const GRID_X: u32 = {{ GRID_X }}u;

{% if not useSubgroups %}
var<workgroup> partial: array<f32, WG>;
{% endif %}

{% if useSubgroups %}
// Sum over each logical 32-lane virtual subgroup. sgExact32 (fixed 32-wide adapter) ->
// hardware subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each
// 32-block independently \u2014 correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128],
// AMD [32,64]) where a plain subgroupAdd over the WG would merge the virtual units.
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
{% endif %}

fn reduce_sum(value: f32, lidx: u32) -> f32 {
{% if useSubgroups %}
  return sg_sum(value);
{% else %}
  // Segment-local tree matching the virtual-subgroup layout: each 32-lane
  // unit reduces its own partial[base..base+31] slots. A whole-workgroup tree
  // here would race the units on partial[0..31] and read never-written upper
  // slots whenever WG > 32 (SG_COUNT > 1).
  partial[lidx] = value;
  workgroupBarrier();
  let base = (lidx / 32u) * 32u;
  let lane = lidx & 31u;
  var stride = 16u;
  loop {
    if (stride == 0u) { break; }
    if (lane < stride) { partial[base + lane] = partial[base + lane] + partial[base + lane + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = partial[base];
  workgroupBarrier();
  return r;
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn tanh_safe(x: f32) -> f32 {
  if (x > 10.0) { return 1.0; }
  if (x < -10.0) { return -1.0; }
  return tanh(x);
}

fn gelu_tanh(v: f32) -> f32 {
  return 0.5 * v * (1.0 + tanh_safe(0.7978845608028654 * (v + 0.044715 * v * v * v)));
}
// gelu over a grid input g = k * S (k in [-128,127]): the host-f64 table fixes
// the rounded activation value for every fused path.
fn gelu_grid(g: f32, s: f32) -> f32 {
  if (s == 0.0) { return gelu_tanh(g); }
  return gelu_lut[u32(clamp(round(g / s), -128.0, 127.0) + 128.0)];
}


{% if GEMM %}
// Register-blocked presrq GEMM tile for prefill (M >= 16): each thread owns an N_PT x M_PT
// (inter-row x token) accumulator block for both the gate and up streams and runs the full
// serial k-loop, so every gate/up weight word is loaded and dequantized once for all M token
// rows in the tile. Two weight streams double the live accumulator/register pressure, so the
// tile shape keeps the gate/up accumulator footprint bounded.
const THREADS_N: u32 = {{ THREADS_N }}u;
const THREADS_M: u32 = {{ THREADS_M }}u;
const N_PT: u32 = {{ N_PT }}u;
const M_PT: u32 = {{ M_PT }}u;
const TILE_N: u32 = THREADS_N * N_PT;
const TILE_M: u32 = THREADS_M * M_PT;

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

@compute @workgroup_size({{ THREADS_N * THREADS_M }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  let tid = lid.x;
  let nSub = tid % THREADS_N;
  let mSub = tid / THREADS_N;
  let nBase = wgId * TILE_N + nSub * N_PT;
  let mBase = wg.z * TILE_M + mSub * M_PT;
  let gOut = params.gateOutScale;
  let uOut = params.upOutScale;
{% if not PRESRQ %}
  let inScale = params.inScale;
{% endif %}

{% for n in range(N_PT) %}
  let ro{{ n }} = nBase + {{ n }}u;
{% endfor %}
{% for mi in range(M_PT) %}
  let mr{{ mi }} = mBase + {{ mi }}u;
  let hBase{{ mi }} = min(mr{{ mi }}, M - 1u) * (H / 4u);
{% endfor %}
{% for n in range(N_PT) %}{% for mi in range(M_PT) %}
  var gAcc_{{ n }}_{{ mi }}: f32 = 0.0;
  var uAcc_{{ n }}_{{ mi }}: f32 = 0.0;
{% endfor %}{% endfor %}
{% if not PRESRQ %}
{% for mi in range(M_PT) %}
  var sA_{{ mi }}: f32 = 0.0;
{% endfor %}
{% endif %}

  var w: u32 = 0u;
  loop {
    if (w >= WPR) { break; }
{% for n in range(N_PT) %}
    var pg{{ n }}: u32 = 0u;
    var pu{{ n }}: u32 = 0u;
    if (ro{{ n }} < INTER) {
      pg{{ n }} = gate_bits[ro{{ n }} * WPR + w];
      pu{{ n }} = up_bits[ro{{ n }} * WPR + w];
    }
{% if BITS == 4 %}
    let glo{{ n }} = unpack4x8unorm(pg{{ n }} & 0x0F0F0F0Fu);
    let ghi{{ n }} = unpack4x8unorm((pg{{ n }} >> 4u) & 0x0F0F0F0Fu);
    let qg{{ n }}_0 = vec4<f32>(glo{{ n }}.x, ghi{{ n }}.x, glo{{ n }}.y, ghi{{ n }}.y);
    let qg{{ n }}_1 = vec4<f32>(glo{{ n }}.z, ghi{{ n }}.z, glo{{ n }}.w, ghi{{ n }}.w);
    let ulo{{ n }} = unpack4x8unorm(pu{{ n }} & 0x0F0F0F0Fu);
    let uhi{{ n }} = unpack4x8unorm((pu{{ n }} >> 4u) & 0x0F0F0F0Fu);
    let qu{{ n }}_0 = vec4<f32>(ulo{{ n }}.x, uhi{{ n }}.x, ulo{{ n }}.y, uhi{{ n }}.y);
    let qu{{ n }}_1 = vec4<f32>(ulo{{ n }}.z, uhi{{ n }}.z, ulo{{ n }}.w, uhi{{ n }}.w);
{% else %}
    let g0{{ n }} = unpack4x8unorm(pg{{ n }} & 0x03030303u);
    let g1{{ n }} = unpack4x8unorm((pg{{ n }} >> 2u) & 0x03030303u);
    let g2{{ n }} = unpack4x8unorm((pg{{ n }} >> 4u) & 0x03030303u);
    let g3{{ n }} = unpack4x8unorm((pg{{ n }} >> 6u) & 0x03030303u);
    let qg{{ n }}_0 = vec4<f32>(g0{{ n }}.x, g1{{ n }}.x, g2{{ n }}.x, g3{{ n }}.x);
    let qg{{ n }}_1 = vec4<f32>(g0{{ n }}.y, g1{{ n }}.y, g2{{ n }}.y, g3{{ n }}.y);
    let qg{{ n }}_2 = vec4<f32>(g0{{ n }}.z, g1{{ n }}.z, g2{{ n }}.z, g3{{ n }}.z);
    let qg{{ n }}_3 = vec4<f32>(g0{{ n }}.w, g1{{ n }}.w, g2{{ n }}.w, g3{{ n }}.w);
    let u0{{ n }} = unpack4x8unorm(pu{{ n }} & 0x03030303u);
    let u1{{ n }} = unpack4x8unorm((pu{{ n }} >> 2u) & 0x03030303u);
    let u2{{ n }} = unpack4x8unorm((pu{{ n }} >> 4u) & 0x03030303u);
    let u3{{ n }} = unpack4x8unorm((pu{{ n }} >> 6u) & 0x03030303u);
    let qu{{ n }}_0 = vec4<f32>(u0{{ n }}.x, u1{{ n }}.x, u2{{ n }}.x, u3{{ n }}.x);
    let qu{{ n }}_1 = vec4<f32>(u0{{ n }}.y, u1{{ n }}.y, u2{{ n }}.y, u3{{ n }}.y);
    let qu{{ n }}_2 = vec4<f32>(u0{{ n }}.z, u1{{ n }}.z, u2{{ n }}.z, u3{{ n }}.z);
    let qu{{ n }}_3 = vec4<f32>(u0{{ n }}.w, u1{{ n }}.w, u2{{ n }}.w, u3{{ n }}.w);
{% endif %}
{% endfor %}
{% for mi in range(M_PT) %}
    {
{% if PRESRQ %}
{% for c in range(CHUNKS) %}
      let a{{ mi }}_{{ c }} = vec4<f32>(hidden[hBase{{ mi }} + w * CHUNKS + {{ c }}u]);
{% endfor %}
{% else %}
{% for c in range(CHUNKS) %}
      let a{{ mi }}_{{ c }} = srq4(vec4<f32>(hidden[hBase{{ mi }} + w * CHUNKS + {{ c }}u]), inScale);
      sA_{{ mi }} = sA_{{ mi }} + a{{ mi }}_{{ c }}.x + a{{ mi }}_{{ c }}.y + a{{ mi }}_{{ c }}.z + a{{ mi }}_{{ c }}.w;
{% endfor %}
{% endif %}
{% for n in range(N_PT) %}{% for c in range(CHUNKS) %}
      gAcc_{{ n }}_{{ mi }} = gAcc_{{ n }}_{{ mi }} + dot(qg{{ n }}_{{ c }}, a{{ mi }}_{{ c }});
      uAcc_{{ n }}_{{ mi }} = uAcc_{{ n }}_{{ mi }} + dot(qu{{ n }}_{{ c }}, a{{ mi }}_{{ c }});
{% endfor %}{% endfor %}
    }
{% endfor %}
    w = w + 1u;
  }

{% for mi in range(M_PT) %}
  if (mr{{ mi }} < M) {
{% if PRESRQ %}
    let zpA{{ mi }} = ZP * sum_a[mr{{ mi }}];
{% else %}
    let zpA{{ mi }} = ZP * sA_{{ mi }};
{% endif %}
{% for n in range(N_PT) %}
    if (ro{{ n }} < INTER) {
      // fma(x, 255, -zp*sum) undoes the unorm 1/255 decode scale once per (m,o).
      let g = srq(gate_scale[ro{{ n }}] * fma(gAcc_{{ n }}_{{ mi }}, 255.0, -zpA{{ mi }}), gOut);
      let u = srq(up_scale[ro{{ n }}] * fma(uAcc_{{ n }}_{{ mi }}, 255.0, -zpA{{ mi }}), uOut);
{% if not PRESRQ %}
      out[mr{{ mi }} * INTER + ro{{ n }}] = {{ outScalar }}(gelu_grid(g, gOut) * u);
{% elif EMIT_CODES %}
      let dq = gelu_grid(g, gOut) * u;
      let qs = params.outQuantScale;
      var code: f32;
      if (qs == 0.0) { code = dq; } else { code = clamp(round(dq / qs), -128.0, 127.0); }
      out[mr{{ mi }} * INTER + ro{{ n }}] = {{ outScalar }}(code);
{% else %}
      out[mr{{ mi }} * INTER + ro{{ n }}] = {{ outScalar }}(srq(gelu_grid(g, gOut) * u, params.outQuantScale));
{% endif %}
    }
{% endfor %}
  }
{% endfor %}
}
{% else %}
@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  // Virtual-subgroup mode: each 32-lane subgroup acts as an independent GEMV unit (own row
  // group), so the dispatch uses WG/32x fewer, wider workgroups. No early return (the
  // trailing barrier must stay in uniform control flow); OOB virtual units idle in guards.
  let sgId = lid.x / 32u;
  let tid = lid.x & 31u;
  let wgId = (wg.y * GRID_X + wg.x) * SG_COUNT + sgId;
  let rowBase = wgId * N_ROWS;
  let gOut = params.gateOutScale;
  let uOut = params.upOutScale;

  let mEnd = min((wg.z + 1u) * M_TILE, M);
  for (var m: u32 = wg.z * M_TILE; m < mEnd; m = m + 1u) {
    let hV4Base = m * (H / 4u);
    var gAcc: array<f32, N_ROWS>;
    var uAcc: array<f32, N_ROWS>;
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { gAcc[r] = 0.0; uAcc[r] = 0.0; }

    var wd: u32 = tid;
    loop {
      if (wd >= WPR) { break; }
      // The activation is already on the int8 grid: read it once (vec4), reuse
      // across rows, and upcast once per word to f32. The dots run against
      // unpack4x8unorm code lanes; the lanes are fl(code/255), and the x255
      // decode is undone once per output row in the epilogue.
      var avc: array<vec4<{{ "f16" if usesF16 else "f32" }}>, CHUNKS>;
      for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
        avc[c] = hidden[hV4Base + wd * CHUNKS + c];
      }
      var avcf: array<vec4<f32>, CHUNKS>;
      for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
        avcf[c] = vec4<f32>(avc[c]);
      }
      for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
        let o = rowBase + r;
        if (o < INTER) {
          let pg = gate_bits[o * WPR + wd];
          let pu = up_bits[o * WPR + wd];
{% if BITS == 4 %}
          let glo = unpack4x8unorm(pg & 0x0F0F0F0Fu);
          let ghi = unpack4x8unorm((pg >> 4u) & 0x0F0F0F0Fu);
          gAcc[r] = gAcc[r] + (dot(vec4<f32>(glo.x, ghi.x, glo.y, ghi.y), avcf[0])
                             + dot(vec4<f32>(glo.z, ghi.z, glo.w, ghi.w), avcf[1]));
          let ulo = unpack4x8unorm(pu & 0x0F0F0F0Fu);
          let uhi = unpack4x8unorm((pu >> 4u) & 0x0F0F0F0Fu);
          uAcc[r] = uAcc[r] + (dot(vec4<f32>(ulo.x, uhi.x, ulo.y, uhi.y), avcf[0])
                             + dot(vec4<f32>(ulo.z, uhi.z, ulo.w, uhi.w), avcf[1]));
{% else %}
          let g0 = unpack4x8unorm(pg & 0x03030303u);
          let g1 = unpack4x8unorm((pg >> 2u) & 0x03030303u);
          let g2 = unpack4x8unorm((pg >> 4u) & 0x03030303u);
          let g3 = unpack4x8unorm((pg >> 6u) & 0x03030303u);
          gAcc[r] = gAcc[r] + ((dot(vec4<f32>(g0.x, g1.x, g2.x, g3.x), avcf[0])
                              + dot(vec4<f32>(g0.y, g1.y, g2.y, g3.y), avcf[1]))
                             + (dot(vec4<f32>(g0.z, g1.z, g2.z, g3.z), avcf[2])
                              + dot(vec4<f32>(g0.w, g1.w, g2.w, g3.w), avcf[3])));
          let u0 = unpack4x8unorm(pu & 0x03030303u);
          let u1 = unpack4x8unorm((pu >> 2u) & 0x03030303u);
          let u2 = unpack4x8unorm((pu >> 4u) & 0x03030303u);
          let u3 = unpack4x8unorm((pu >> 6u) & 0x03030303u);
          uAcc[r] = uAcc[r] + ((dot(vec4<f32>(u0.x, u1.x, u2.x, u3.x), avcf[0])
                              + dot(vec4<f32>(u0.y, u1.y, u2.y, u3.y), avcf[1]))
                             + (dot(vec4<f32>(u0.z, u1.z, u2.z, u3.z), avcf[2])
                              + dot(vec4<f32>(u0.w, u1.w, u2.w, u3.w), avcf[3])));
{% endif %}
        }
      }
      wd = wd + 32u;
    }

    let aSum = sum_a[m];
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let gS = reduce_sum(gAcc[r], lid.x);
      let uS = reduce_sum(uAcc[r], lid.x);
      if (tid == 0u) {
        let o = rowBase + r;
        if (o < INTER) {
          // fma(x, 255, -zp*sum) undoes the unorm 1/255 decode scale once per output row.
          let g = srq(gate_scale[o] * fma(gS, 255.0, -(ZP * aSum)), gOut);
          let u = srq(up_scale[o] * fma(uS, 255.0, -(ZP * aSum)), uOut);
{% if EMIT_CODES %}
          // Codes mode: emit the down projection's int8 SRQ code
          // (clamp(round(x/s)), exactly representable in f16). The consumer
          // multiplies by the grid scale once per row after its integer-exact
          // reduction, avoiding per-element srq division in the down GEMV
          // without forcing an f32 buffer.
          let dq = gelu_grid(g, gOut) * u;
          let qs = params.outQuantScale;
          var code: f32;
          if (qs == 0.0) { code = dq; } else { code = clamp(round(dq / qs), -128.0, 127.0); }
          out[m * INTER + o] = {{ outScalar }}(code);
{% else %}
          // outQ: pre-apply the down projection's input SRQ here (idempotent:
          // srq(srq(x)) == srq(x)); the consumer then runs with inputScale=0.
          out[m * INTER + o] = {{ outScalar }}(srq(gelu_grid(g, gOut) * u, params.outQuantScale));
{% endif %}
        }
      }
    }
    workgroupBarrier();
  }
}
{% endif %}
`],["decode-gate-up-norm-sgmat.wgsl.jinja",`enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);

{{ env.wgsl.resourceDeclarations }}

// Subgroup-matrix (tensor-core) fused gate/up prefill GEMM (M >= 64), integer codes domain \u2014
// the QatMatMul gemm_sgmat structure with TWO weight streams sharing one A tile: per K-tile
// the loaders dequant gate AND up packed words to (code - ZP) f16 tiles, the A loader
// quantizes the activations to int8 codes (round(a / inScale), matching staged-path SRQ),
// and each subgroup accumulates 8 gate + 8 up 8x8 result matrices in f32 (integer-exact:
// |w-ZP| * 127 * K stays far inside 2^24). Epilogue per element:
//   g = srq(gate_scale[o] * (inScale * Cg), gateOut); u likewise; out = gelu_grid(g) * u.
// Tile geometry: 128-thread WG = 4 subgroups, each owning a 16x32 output
// subtile; TILE = 32 M x 64 N x 32 K.

const IN_F:      u32 = {{ H }}u;
const OUT_F:     u32 = {{ INTER }}u;
const M_TOTAL:   u32 = {{ M }}u;
const WPR:       u32 = {{ WPR }}u;
const ZP:        f32 = {{ ZP }}.0;
const TILE_COLS: u32 = 64u;
const TILE_ROWS: u32 = 32u;
const TILE_K:    u32 = 32u;
const SUB_COLS:  u32 = 32u;
const SUB_ROWS:  u32 = 16u;

var<workgroup> tile_A: array<f16, 32 * 32>;
var<workgroup> tile_G: array<f16, 64 * 32>;
var<workgroup> tile_U: array<f16, 64 * 32>;
var<workgroup> scratchG: array<array<f32, 64>, 4>;
var<workgroup> scratchU: array<array<f32, 64>, 4>;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn tanh_safe(x: f32) -> f32 {
  if (x > 10.0) { return 1.0; }
  if (x < -10.0) { return -1.0; }
  return tanh(x);
}

fn gelu_tanh(v: f32) -> f32 {
  return 0.5 * v * (1.0 + tanh_safe(0.7978845608028654 * (v + 0.044715 * v * v * v)));
}

// gelu over a grid input g = k * S: host-f64 table lookup gives every fused
// path a fixed rounded activation value.
fn gelu_grid(g: f32, s: f32) -> f32 {
  if (s == 0.0) { return gelu_tanh(g); }
  return gelu_lut[u32(clamp(round(g / s), -128.0, 127.0) + 128.0)];
}

fn loadSHMA(tile_base: u32, k_idx: u32, row: u32, c_idx: u32, invS: f32) {
  let a_global: u32 = tile_base + row;
  let col: u32 = c_idx * 8u;
  for (var col_offset: u32 = 0u; col_offset < 8u; col_offset++) {
    let k: u32 = k_idx + col + col_offset;
    var code: f32 = 0.0;
    if (a_global < M_TOTAL) {
      code = clamp(round(f32(hidden[a_global * IN_F + k]) * invS), -128.0, 127.0);
    }
    tile_A[row * TILE_K + col + col_offset] = f16(code);
  }
}

// Dequant BOTH weight tiles: gate and up words for the same (row, k-chunk) per visit.
fn loadSHMB(tile_base: u32, k_idx: u32, lin: u32) {
{% if BITS == 4 %}
  for (var i: u32 = 0u; i < 2u; i++) {
    let lin2 = lin + i * 128u;
    let r = lin2 / 4u;
    let w = lin2 % 4u;
    let wordIdx = (tile_base + r) * WPR + (k_idx / 8u) + w;
    let pg = gate_bits[wordIdx];
    let pu = up_bits[wordIdx];
    let kb = r * TILE_K + w * 8u;
    for (var j: u32 = 0u; j < 8u; j++) {
      let sh = 8u * (j >> 1u) + 4u * (j & 1u);
      tile_G[kb + j] = f16(f32((pg >> sh) & 0xFu) - ZP);
      tile_U[kb + j] = f16(f32((pu >> sh) & 0xFu) - ZP);
    }
  }
{% else %}
  let r = lin / 2u;
  let w = lin % 2u;
  let wordIdx = (tile_base + r) * WPR + (k_idx / 16u) + w;
  let pg = gate_bits[wordIdx];
  let pu = up_bits[wordIdx];
  let kb = r * TILE_K + w * 16u;
  for (var j: u32 = 0u; j < 16u; j++) {
    let sh = 8u * (j >> 2u) + 2u * (j & 3u);
    tile_G[kb + j] = f16(f32((pg >> sh) & 0x3u) - ZP);
    tile_U[kb + j] = f16(f32((pu >> sh) & 0x3u) - ZP);
  }
{% endif %}
}

fn storeOutput(offset: u32, row: u32, col: u32, src_slot: u32, row_limit: i32, col_base: u32, sEff: f32) {
  if (row_limit > 0 && row < u32(row_limit)) {
    let gOut = params.gateOutScale;
    let uOut = params.upOutScale;
    for (var cc: u32 = 0u; cc < 2u; cc++) {
      let o = col_base + col + cc;
      let g = srq(gate_scale[o] * (scratchG[src_slot][row * 8u + col + cc] * sEff), gOut);
      let u = srq(up_scale[o] * (scratchU[src_slot][row * 8u + col + cc] * sEff), uOut);
      out[offset + row * OUT_F + col + cc] = {{ outScalar }}(gelu_grid(g, gOut) * u);
    }
  }
}

@compute @workgroup_size(128, 1, 1)
fn main(
  @builtin(workgroup_id) workgroup_id: vec3<u32>,
  @builtin(local_invocation_index) local_idx: u32,
  @builtin(subgroup_invocation_id) sg_id: u32,
  @builtin(subgroup_size) sg_size: u32
) {
  let a_global_base: u32 = workgroup_id.y * TILE_ROWS;
  let w_global_base: u32 = workgroup_id.x * TILE_COLS;

  let sEff = params.inScale;
  let invS = 1.0 / sEff;

  let subtile_id: u32 = local_idx / sg_size;
  let subtile_idx: u32 = subtile_id / 2u;
  let subtile_idy: u32 = subtile_id % 2u;
  let base_A: u32 = subtile_idy * SUB_ROWS;
  let base_B: u32 = subtile_idx * SUB_COLS;

  var gC00: subgroup_matrix_result<f32, 8, 8>;
  var gC01: subgroup_matrix_result<f32, 8, 8>;
  var gC02: subgroup_matrix_result<f32, 8, 8>;
  var gC03: subgroup_matrix_result<f32, 8, 8>;
  var gC10: subgroup_matrix_result<f32, 8, 8>;
  var gC11: subgroup_matrix_result<f32, 8, 8>;
  var gC12: subgroup_matrix_result<f32, 8, 8>;
  var gC13: subgroup_matrix_result<f32, 8, 8>;
  var uC00: subgroup_matrix_result<f32, 8, 8>;
  var uC01: subgroup_matrix_result<f32, 8, 8>;
  var uC02: subgroup_matrix_result<f32, 8, 8>;
  var uC03: subgroup_matrix_result<f32, 8, 8>;
  var uC10: subgroup_matrix_result<f32, 8, 8>;
  var uC11: subgroup_matrix_result<f32, 8, 8>;
  var uC12: subgroup_matrix_result<f32, 8, 8>;
  var uC13: subgroup_matrix_result<f32, 8, 8>;

  for (var kidx: u32 = 0u; kidx < IN_F; kidx += TILE_K) {
    loadSHMA(a_global_base, kidx, local_idx / 4u, local_idx % 4u, invS);
    loadSHMB(w_global_base, kidx, local_idx);
    workgroupBarrier();

    for (var step: u32 = 0u; step < TILE_K; step += 8u) {
      let matrix_a_offset: u32 = subtile_idy * SUB_ROWS * TILE_K + step;
      var matA0: subgroup_matrix_left<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, matrix_a_offset, false, TILE_K);
      var matA1: subgroup_matrix_left<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, matrix_a_offset + 8u * TILE_K, false, TILE_K);

      let matrix_b_offset: u32 = subtile_idx * SUB_COLS * TILE_K + step;
      var gB0: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_G, matrix_b_offset, true, TILE_K);
      var gB1: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_G, matrix_b_offset +  8u * TILE_K, true, TILE_K);
      var gB2: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_G, matrix_b_offset + 16u * TILE_K, true, TILE_K);
      var gB3: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_G, matrix_b_offset + 24u * TILE_K, true, TILE_K);
      gC00 = subgroupMatrixMultiplyAccumulate(matA0, gB0, gC00);
      gC01 = subgroupMatrixMultiplyAccumulate(matA0, gB1, gC01);
      gC02 = subgroupMatrixMultiplyAccumulate(matA0, gB2, gC02);
      gC03 = subgroupMatrixMultiplyAccumulate(matA0, gB3, gC03);
      gC10 = subgroupMatrixMultiplyAccumulate(matA1, gB0, gC10);
      gC11 = subgroupMatrixMultiplyAccumulate(matA1, gB1, gC11);
      gC12 = subgroupMatrixMultiplyAccumulate(matA1, gB2, gC12);
      gC13 = subgroupMatrixMultiplyAccumulate(matA1, gB3, gC13);

      var uB0: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_U, matrix_b_offset, true, TILE_K);
      var uB1: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_U, matrix_b_offset +  8u * TILE_K, true, TILE_K);
      var uB2: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_U, matrix_b_offset + 16u * TILE_K, true, TILE_K);
      var uB3: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_U, matrix_b_offset + 24u * TILE_K, true, TILE_K);
      uC00 = subgroupMatrixMultiplyAccumulate(matA0, uB0, uC00);
      uC01 = subgroupMatrixMultiplyAccumulate(matA0, uB1, uC01);
      uC02 = subgroupMatrixMultiplyAccumulate(matA0, uB2, uC02);
      uC03 = subgroupMatrixMultiplyAccumulate(matA0, uB3, uC03);
      uC10 = subgroupMatrixMultiplyAccumulate(matA1, uB0, uC10);
      uC11 = subgroupMatrixMultiplyAccumulate(matA1, uB1, uC11);
      uC12 = subgroupMatrixMultiplyAccumulate(matA1, uB2, uC12);
      uC13 = subgroupMatrixMultiplyAccumulate(matA1, uB3, uC13);
    }
    workgroupBarrier();
  }

  let row: u32 = sg_id / 4u;
  let col: u32 = (sg_id % 4u) * 2u;
  var matrix_c_offset: u32 = (a_global_base + base_A) * OUT_F + w_global_base + base_B;
  var col_base: u32 = w_global_base + base_B;
  var row_limit: i32 = i32(M_TOTAL) - i32(a_global_base + base_A);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC00, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC00, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit, col_base, sEff);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC01, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC01, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit, col_base + 8u, sEff);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC02, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC02, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit, col_base + 16u, sEff);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC03, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC03, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit, col_base + 24u, sEff);

  matrix_c_offset = matrix_c_offset + 8u * OUT_F;
  row_limit = i32(M_TOTAL) - i32(a_global_base + base_A + 8u);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC10, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC10, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit, col_base, sEff);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC11, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC11, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit, col_base + 8u, sEff);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC12, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC12, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit, col_base + 16u, sEff);
  subgroupMatrixStore(&scratchG[subtile_id], 0u, gC13, false, 8u);
  subgroupMatrixStore(&scratchU[subtile_id], 0u, uC13, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit, col_base + 24u, sEff);
}
`],["decode-gate-up-norm.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused MLP gate/up half (decode GEMV):
//   n   = RMSNorm(hidden) * w                 (weighted, eps after /H, f32 reduction)
//   aq  = srq(n, inScale)                      (int8 activation grid; no-op when inScale==0)
//   g   = srq(gate_scale[o] * (sum_k qg*aq - ZP*sum_k aq), gateOutScale)
//   u   = srq(up_scale[o]   * (sum_k qu*aq - ZP*sum_k aq), upOutScale)
//   out[o] = gelu_tanh(g) * u
// One workgroup computes N_ROWS contiguous output rows; the normed+quantized activation slab
// \`sQ\` (H<=4096 elements) is computed once per workgroup and shared by all N_ROWS rows and by
// both gate and up. This fused path requires gate/up to share inScale. The RMS
// reduction, dequant + SRQ, and gelu_tanh choices preserve the rounding
// contracts of com.xenova.RMSNorm, com.xenova.gemma4.QatMatMul, and
// ai.onnx.Gelu(approximate="tanh").

const M: u32 = {{ M }}u;
const M_TILE: u32 = {{ M_TILE }}u;
const H: u32 = {{ H }}u;
const INTER: u32 = {{ INTER }}u;
const BITS: u32 = {{ BITS }}u;
const VPW: u32 = {{ VPW }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WPR: u32 = {{ WPR }}u;
const MASK: u32 = {{ MASK }}u;
const ZP: f32 = {{ ZP }}.0;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;
const GRID_X: u32 = {{ GRID_X }}u;

{% if not useSubgroups %}
var<workgroup> partial: array<f32, WG>;
{% endif %}

fn reduce_sum(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  partial[tid] = value;
  workgroupBarrier();
  var stride = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { partial[tid] = partial[tid] + partial[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  return partial[0];
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

fn tanh_safe(x: f32) -> f32 {
  if (x > 10.0) { return 1.0; }
  if (x < -10.0) { return -1.0; }
  return tanh(x);
}

fn gelu_tanh(v: f32) -> f32 {
  return 0.5 * v * (1.0 + tanh_safe(0.7978845608028654 * (v + 0.044715 * v * v * v)));
}
// gelu over a grid input g = k * S (k in [-128,127]): the host-f64 table fixes
// the rounded activation value for every fused path.
fn gelu_grid(g: f32, s: f32) -> f32 {
  if (s == 0.0) { return gelu_tanh(g); }
  return gelu_lut[u32(clamp(round(g / s), -128.0, 127.0) + 128.0)];
}


@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  let rowBase = wgId * N_ROWS;
  let tid = lid.x;
  let inScale = params.inScale;
  let gOut = params.gateOutScale;
  let uOut = params.upOutScale;
  if (rowBase >= INTER) { return; }

{% if M_TILE > 1 %}
  // Word-outer, m-unrolled GEMM tile (prefill): each gate/up weight word is read + unpacked
  // once and dotted against all M_TILE input rows. Named variables only (dynamically indexed
  // local arrays can spill). Per-(m,row) accumulation order matches the m-outer GEMV,
  // so results are bit-identical.
  let mStart = wg.z * M_TILE;
{% for mi in range(M_TILE) %}
  let mOk{{ mi }} = mStart + {{ mi }}u < M;
  var aAcc_{{ mi }}: f32 = 0.0;
{% for r in range(N_ROWS) %}
  var gAcc_{{ mi }}_{{ r }}: f32 = 0.0;
  var uAcc_{{ mi }}_{{ r }}: f32 = 0.0;
{% endfor %}
{% endfor %}

  var wd: u32 = tid;
  loop {
    if (wd >= WPR) { break; }
{% for r in range(N_ROWS) %}
    var pg{{ r }}: u32 = 0u;
    var pu{{ r }}: u32 = 0u;
    if (rowBase + {{ r }}u < INTER) {
      pg{{ r }} = gate_bits[(rowBase + {{ r }}u) * WPR + wd];
      pu{{ r }} = up_bits[(rowBase + {{ r }}u) * WPR + wd];
    }
{% for c in range(CHUNKS) %}
    let qg{{ r }}_{{ c }} = vec4<{{ "f16" if usesF16 else "f32" }}>(vec4<f32>((vec4<u32>(pg{{ r }}) >> ((vec4<u32>(0u, 1u, 2u, 3u) + {{ c * 4 }}u) * BITS)) & vec4<u32>(MASK)));
    let qu{{ r }}_{{ c }} = vec4<{{ "f16" if usesF16 else "f32" }}>(vec4<f32>((vec4<u32>(pu{{ r }}) >> ((vec4<u32>(0u, 1u, 2u, 3u) + {{ c * 4 }}u) * BITS)) & vec4<u32>(MASK)));
{% endfor %}
{% endfor %}
{% for mi in range(M_TILE) %}
    if (mOk{{ mi }}) {
      let hV4Base{{ mi }} = (mStart + {{ mi }}u) * (H / 4u) + wd * CHUNKS;
{% for c in range(CHUNKS) %}
      let af{{ mi }}_{{ c }} = srq4(vec4<f32>(hidden[hV4Base{{ mi }} + {{ c }}u]), inScale);
      let a{{ mi }}_{{ c }} = vec4<{{ "f16" if usesF16 else "f32" }}>(af{{ mi }}_{{ c }});
      aAcc_{{ mi }} = aAcc_{{ mi }} + f32(a{{ mi }}_{{ c }}.x) + f32(a{{ mi }}_{{ c }}.y) + f32(a{{ mi }}_{{ c }}.z) + f32(a{{ mi }}_{{ c }}.w);
{% for r in range(N_ROWS) %}
      gAcc_{{ mi }}_{{ r }} = gAcc_{{ mi }}_{{ r }} + f32(dot(qg{{ r }}_{{ c }}, a{{ mi }}_{{ c }}));
      uAcc_{{ mi }}_{{ r }} = uAcc_{{ mi }}_{{ r }} + f32(dot(qu{{ r }}_{{ c }}, a{{ mi }}_{{ c }}));
{% endfor %}
{% endfor %}
    }
{% endfor %}
    wd = wd + WG;
  }

{% for mi in range(M_TILE) %}
  if (mOk{{ mi }}) {
    let aSum{{ mi }} = reduce_sum(aAcc_{{ mi }}, tid);
{% for r in range(N_ROWS) %}
    {
      let gS = reduce_sum(gAcc_{{ mi }}_{{ r }}, tid);
      let uS = reduce_sum(uAcc_{{ mi }}_{{ r }}, tid);
      if (tid == 0u) {
        let o = rowBase + {{ r }}u;
        if (o < INTER) {
          let g = srq(gate_scale[o] * (gS - ZP * aSum{{ mi }}), gOut);
          let u = srq(up_scale[o] * (uS - ZP * aSum{{ mi }}), uOut);
          out[(mStart + {{ mi }}u) * INTER + o] = {{ outScalar }}(gelu_grid(g, gOut) * u);
        }
      }
    }
{% endfor %}
  }
{% endfor %}
}
{% else %}
  // M==1 (decode): m-outer GEMV. \`hidden\` is the PRE-NORMED activation = RMSNorm(residual)
  // * preFfLn. Reading it directly keeps the GEMV focused on quantized weight
  // dots, and avoids recomputing the same norm for each output-row group.
  let mEnd = min((wg.z + 1u) * M_TILE, M);
  for (var m: u32 = wg.z * M_TILE; m < mEnd; m = m + 1u) {
    let hV4Base = m * (H / 4u);
    var gAcc: array<f32, N_ROWS>;
    var uAcc: array<f32, N_ROWS>;
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { gAcc[r] = 0.0; uAcc[r] = 0.0; }
    var aAcc: f32 = 0.0;

    var wd: u32 = tid;
    loop {
      if (wd >= WPR) { break; }
      // Stage this word's activation as vec4 chunks (read once, reuse across
      // N_ROWS), then unpack 4 weight values per dot().
      // Dot in f16 where available with an f32 accumulator; the quantized code
      // x int8-activation products are small, so f16 keeps full precision.
      var avc: array<vec4<{{ "f16" if usesF16 else "f32" }}>, CHUNKS>;
      for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
        let a4f = srq4(vec4<f32>(hidden[hV4Base + wd * CHUNKS + c]), inScale);
        avc[c] = vec4<{{ "f16" if usesF16 else "f32" }}>(a4f);
        aAcc = aAcc + f32(avc[c].x) + f32(avc[c].y) + f32(avc[c].z) + f32(avc[c].w);
      }
      for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
        let o = rowBase + r;
        if (o < INTER) {
          let pg = gate_bits[o * WPR + wd];
          let pu = up_bits[o * WPR + wd];
          for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
            let sh = (vec4<u32>(0u, 1u, 2u, 3u) + c * 4u) * BITS;
            gAcc[r] = gAcc[r] + f32(dot(vec4<{{ "f16" if usesF16 else "f32" }}>(vec4<f32>((vec4<u32>(pg) >> sh) & vec4<u32>(MASK))), avc[c]));
            uAcc[r] = uAcc[r] + f32(dot(vec4<{{ "f16" if usesF16 else "f32" }}>(vec4<f32>((vec4<u32>(pu) >> sh) & vec4<u32>(MASK))), avc[c]));
          }
        }
      }
      wd = wd + WG;
    }

    let aSum = reduce_sum(aAcc, tid);
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let gS = reduce_sum(gAcc[r], tid);
      let uS = reduce_sum(uAcc[r], tid);
      if (tid == 0u) {
        let o = rowBase + r;
        if (o < INTER) {
          let g = srq(gate_scale[o] * (gS - ZP * aSum), gOut);
          let u = srq(up_scale[o] * (uS - ZP * aSum), uOut);
          out[m * INTER + o] = {{ outScalar }}(gelu_grid(g, gOut) * u);
        }
      }
    }
    workgroupBarrier();
  }
}
{% endif %}
`]]}],["com.xenova.gemma4.DecodeNormAdd",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeNormAdd",sinceVersion:1,inputs:[{role:"Hidden",dtype:"T"},{role:"Src",dtype:"T"},{role:"W",dtype:"W",rank:1},{role:"Scale",dtype:"float32",rank:1}],outputs:[{role:"Hidden",dtype:"T",shape:"shapes.hiddenT"}],typeConstraints:{T:["float32","float16"],W:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},srcT:{kind:"tensor",semantic:"Src",role:"input"},wT:{kind:"tensor",semantic:"W",role:"weights"},scaleT:{kind:"tensor",semantic:"Scale",role:"weights"},rows:{kind:"u32",semantic:"rows"},dim:{kind:"u32",semantic:"dim"},eps:{kind:"f32",semantic:"eps",required:!1}},variants:[{id:"scalar",priority:0,when:'args.rows > 0 and args.dim > 0 and numel(shapes.hiddenT) >= args.rows * args.dim and numel(shapes.srcT) >= args.rows * args.dim and dim(shapes.wT, 0) == args.dim and numel(shapes.scaleT) >= 1 and ((dtypes.T != "f16" and dtypes.W != "f16") or device.features.has("shader-f16"))',constants:{usesF16:'dtypes.T == "f16" or dtypes.W == "f16"',useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",WG:256,xScalar:"dtypes.T",wScalar:"dtypes.W",DIM:"args.dim",EPS:"args.eps if args.eps else 0.000001"},passes:[{id:"main",name:"DecodeNormAdd",shader:"decode-norm-add.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"src",arg:"srcT",semantic:"Src",role:"input",buffer:{type:"read-only-storage"},elementType:"$xScalar"},{name:"w",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"sc",arg:"scaleT",semantic:"Scale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"min(args.rows, 65535)"}]}}],dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.rows / min(args.rows, 65535))",z:1},reads:["Hidden","Src","W","Scale"],writes:["Hidden"]}]}]},assets:[["decode-norm-add.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused residual tail: hidden = (hidden + RMSNorm(src) * weight) * scale[0].
// Performs the weighted RMSNorm, residual add, and optional scalar multiply in
// one dispatch. The sum-of-squares reduction mirrors com.xenova.RMSNorm exactly
// (WG=64, same stride-halving tree, f32 accumulation, eps after the /DIM) so it
// stays bit-for-bit aligned.
// \`scale\` is a [1] tensor: 1.0 for post-attention / post-FFN norms, the per-layer scalar for
// the post-per-layer-input norm (which folds the trailing \`* layer_scalar\`).

const DIM: u32 = {{ DIM }}u;
const EPS: f32 = {{ EPS }};
const WG: u32 = {{ WG }}u;

{% if useSubgroups %}
// Hybrid 2-barrier reduction: subgroupAdd per subgroup + cross-subgroup combine via shared.
var<workgroup> sgp: array<f32, WG / 32u>;

// Sum over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently, correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64]).
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}

fn reduce_sum(value: f32, tid: u32) -> f32 {
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
}
{% else %}
var<workgroup> partial: array<f32, WG>;

fn reduce_sum(value: f32, tid: u32) -> f32 {
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
}
{% endif %}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let rowStride = select(params.rowStride, params.rows, params.rowStride == 0u);
  let row = wg.x + wg.y * rowStride;
  if (row >= params.rows) {
    return;
  }
  let tid = lid.x;
  let base = row * DIM;

  var acc: f32 = 0.0;
  var i: u32 = tid;
  loop {
    if (i >= DIM) {
      break;
    }
    let v = f32(src[base + i]);
    acc = acc + v * v;
    i = i + WG;
  }
  let rms = inverseSqrt(reduce_sum(acc, tid) / f32(DIM) + EPS);
  let sv = sc[0];

  var j: u32 = tid;
  loop {
    if (j >= DIM) {
      break;
    }
    let normed = f32(src[base + j]) * rms * f32(w[j]);
    hidden[base + j] = {{ xScalar }}((f32(hidden[base + j]) + normed) * sv);
    j = j + WG;
  }
}
`]]}],["com.xenova.gemma4.DecodeNormAddNorm",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeNormAddNorm",sinceVersion:1,inputs:[{role:"Hidden",dtype:"T"},{role:"Src",dtype:"T"},{role:"W1",dtype:"float32",rank:1},{role:"Scale",dtype:"float32",rank:1},{role:"W2",dtype:"float32",rank:1}],outputs:[{role:"Hidden",dtype:"T"},{role:"Y2",dtype:"Y"},{role:"Sum2",dtype:"float32"}],typeConstraints:{T:["float32","float16"],Y:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},srcT:{kind:"tensor",semantic:"Src",role:"input"},w1T:{kind:"tensor",semantic:"W1",role:"weights"},scaleT:{kind:"tensor",semantic:"Scale",role:"weights"},w2T:{kind:"tensor",semantic:"W2",role:"weights"},y2T:{kind:"tensor",semantic:"Y2",role:"output"},sum2T:{kind:"tensor",semantic:"Sum2",role:"output"},rows:{kind:"u32",semantic:"rows"},dim:{kind:"u32",semantic:"dim"},eps:{kind:"f32",semantic:"eps",required:!1},inScale:{kind:"f32",semantic:"input_activation_scale",required:!1}},variants:[{id:"main",priority:0,when:'args.rows > 0 and args.dim > 0 and args.dim <= 8192 and numel(shapes.hiddenT) >= args.rows * args.dim and numel(shapes.srcT) >= args.rows * args.dim and dim(shapes.w1T, 0) == args.dim and numel(shapes.scaleT) >= 1 and dim(shapes.w2T, 0) == args.dim and numel(shapes.y2T) >= args.rows * args.dim and numel(shapes.sum2T) >= args.rows and ((dtypes.T != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16"))',constants:{xScalar:"dtypes.T",yScalar:"dtypes.Y",usesF16:'dtypes.T == "f16" or dtypes.Y == "f16"',useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",WG:256,DIM:"args.dim",ELEMS:"ceil(args.dim / 256)",EPS:"args.eps if args.eps else 0.000001"},passes:[{id:"main",name:"DecodeNormAddNorm",shader:"decode-norm-add-norm.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"src",arg:"srcT",semantic:"Src",role:"input",buffer:{type:"read-only-storage"},elementType:"$xScalar"},{name:"w1",arg:"w1T",semantic:"W1",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sc",arg:"scaleT",semantic:"Scale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"w2",arg:"w2T",semantic:"W2",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y2",arg:"y2T",semantic:"Y2",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"sum2",arg:"sum2T",semantic:"Sum2",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"min(args.rows, 65535)"},{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"}]}}],dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.rows / min(args.rows, 65535))",z:1},reads:["Hidden","Src","W1","Scale","W2"],writes:["Hidden","Y2","Sum2"]}]}]},assets:[["decode-norm-add-norm.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused residual tail + next-norm + SRQ in one dispatch:
//   hidden = (hidden + RMSNorm(src) * w1) * sc[0]            (== com.xenova.gemma4.DecodeNormAdd)
//   y2     = toY(srq(f32(toY(RMSNorm(hidden') * w2)), inScale))  (== com.xenova.gemma4.DecodeRmsSrq
//   sum2[row] = sum_j f32(y2[row, j])                             over the UPDATED hidden)
// The updated hidden row is kept in registers between the two phases (DIM/WG values per
// thread), so the second norm pays no extra global reads. With subgroups,
// WG == one subgroup (32), so all three reductions are barrier-free subgroupAdd.

const DIM: u32 = {{ DIM }}u;
const EPS: f32 = {{ EPS }};
const WG: u32 = {{ WG }}u;
const ELEMS: u32 = {{ ELEMS }}u;

{% if useSubgroups %}
// Hybrid 2-barrier reduction: subgroupAdd within each subgroup, then combine the per-subgroup
// sums through shared slots.
var<workgroup> sgp: array<f32, WG / 32u>;

// Sum over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently, correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64]).
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}

fn reduce_sum(value: f32, tid: u32) -> f32 {
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
}
{% else %}
var<workgroup> partial: array<f32, WG>;

fn reduce_sum(value: f32, tid: u32) -> f32 {
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
  let r = partial[0];
  workgroupBarrier();
  return r;
}
{% endif %}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) {
    return x;
  }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let rowStride = select(params.rowStride, params.rows, params.rowStride == 0u);
  let row = wg.x + wg.y * rowStride;
  if (row >= params.rows) {
    return;
  }
  let tid = lid.x;
  let base = row * DIM;
  let inScale = params.inScale;

  // Phase 1: rms over src (matches DecodeNormAdd).
  var acc: f32 = 0.0;
  var i: u32 = tid;
  loop {
    if (i >= DIM) {
      break;
    }
    let v = f32(src[base + i]);
    acc = acc + v * v;
    i = i + WG;
  }
  let rms1 = inverseSqrt(reduce_sum(acc, tid) / f32(DIM) + EPS);
  let sv = sc[0];

  // Phase 2: update hidden in place, keep the stored values + their sum of squares.
  var hloc: array<f32, ELEMS>;
  var acc2: f32 = 0.0;
  var j: u32 = tid;
  var e: u32 = 0u;
  loop {
    if (j >= DIM) {
      break;
    }
    let normed = f32(src[base + j]) * rms1 * f32(w1[j]);
    let h = f32({{ xScalar }}((f32(hidden[base + j]) + normed) * sv));
    hidden[base + j] = {{ xScalar }}(h);
    hloc[e] = h;
    acc2 = acc2 + h * h;
    j = j + WG;
    e = e + 1u;
  }
  let rms2 = inverseSqrt(reduce_sum(acc2, tid) / f32(DIM) + EPS);

  // Phase 3: second norm + SRQ + quantized-sum over the updated hidden row.
  var qAcc: f32 = 0.0;
  j = tid;
  e = 0u;
  loop {
    if (j >= DIM) {
      break;
    }
    let n2 = hloc[e] * rms2 * f32(w2[j]);
    let q = {{ yScalar }}(srq(f32({{ yScalar }}(n2)), inScale));
    y2[base + j] = q;
    qAcc = qAcc + f32(q);
    j = j + WG;
    e = e + 1u;
  }
  let qSum = reduce_sum(qAcc, tid);
  if (tid == 0u) {
    sum2[row] = qSum;
  }
}
`]]}],["com.xenova.gemma4.DecodeOprojNorm",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeOprojNorm",sinceVersion:1,inputs:[{role:"A",dtype:"T"},{role:"Bits",dtype:"uint32"},{role:"Scale",dtype:"float32"},{role:"Hidden",dtype:"H"},{role:"W12",dtype:"float32"}],outputs:[{role:"Hidden",dtype:"H"},{role:"Y2",dtype:"Y"},{role:"Sum2",dtype:"float32"}],typeConstraints:{T:["float32"],H:["float32","float16"],Y:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},bitsT:{kind:"tensor",semantic:"Bits",role:"weights"},scaleT:{kind:"tensor",semantic:"Scale",role:"weights"},hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},w12T:{kind:"tensor",semantic:"W12",role:"weights"},y2T:{kind:"tensor",semantic:"Y2",role:"output"},sum2T:{kind:"tensor",semantic:"Sum2",role:"output"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},bits:{kind:"u32",semantic:"bits"},zeroPoint:{kind:"u32",semantic:"zero_point"},mask:{kind:"u32",semantic:"mask"},outputScale:{kind:"f32",semantic:"output_activation_scale",required:!1},eps:{kind:"f32",semantic:"eps",required:!1},inScale2:{kind:"f32",semantic:"next_input_activation_scale",required:!1},rows:{kind:"u32",semantic:"row_cooperative",required:!1}},bindingSets:{default:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"pp",semantic:"pp",role:"scratch",buffer:{type:"storage"},elementType:"atomic<u32>"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"w12",arg:"w12T",semantic:"W12",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y2",arg:"y2T",semantic:"Y2",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"sum2",arg:"sum2T",semantic:"Sum2",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"},{name:"inScale2",type:"f32",value:"args.inScale2 if args.inScale2 else 0.0"}]}}]},variants:[{id:"fused_rows",priority:10,when:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32 and (args.bits == 2 or args.bits == 4) and args.inFeatures > 0 and args.inFeatures % (32 / args.bits) == 0 and args.inFeatures % 4 == 0 and args.outFeatures > 0 and args.outFeatures <= 8192 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.hiddenT) >= args.outFeatures and numel(shapes.w12T) >= 2 * args.outFeatures and numel(shapes.y2T) >= args.outFeatures and numel(shapes.sum2T) >= 1 and ((dtypes.H != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16")) and args.rows == 1 and args.bits == 4 and args.outFeatures % 8 == 0',constants:{usesF16:'dtypes.H == "f16" or dtypes.Y == "f16"',xScalar:"dtypes.H",yScalar:"dtypes.Y",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:256,SG_ROWS:1,ROWS_PER_WG:8,ROWS_MODE:1,useSubgroups:!0,sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",N_ROWS:8,TOTAL_WGS:"ceil(args.outFeatures / 8)",ELEMS:"ceil(args.outFeatures / 256)",EPS:"args.eps if args.eps else 0.000001"},intermediates:[{id:"pp",dtype:"uint32",shape:"[args.outFeatures + 1]"}],passes:[{id:"main",name:"DecodeOprojNorm",shader:"oproj-norm.wgsl.jinja",bindings:"default",dispatch:{x:"ceil(args.outFeatures / 8)",y:1,z:1},reads:["A","Bits","Scale","Hidden","W12"],writes:["pp","Hidden","Y2","Sum2"]}]},{id:"fused",priority:0,when:'(args.bits == 2 or args.bits == 4) and args.inFeatures > 0 and args.inFeatures % (32 / args.bits) == 0 and args.inFeatures % 4 == 0 and args.outFeatures > 0 and args.outFeatures <= 8192 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.hiddenT) >= args.outFeatures and numel(shapes.w12T) >= 2 * args.outFeatures and numel(shapes.y2T) >= args.outFeatures and numel(shapes.sum2T) >= 1 and ((dtypes.H != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16"))',constants:{usesF16:'dtypes.H == "f16" or dtypes.Y == "f16"',xScalar:"dtypes.H",yScalar:"dtypes.Y",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:256,SG_ROWS:1,ROWS_PER_WG:8,ROWS_MODE:0,useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",N_ROWS:1,TOTAL_WGS:"ceil(args.outFeatures / 8)",ELEMS:"ceil(args.outFeatures / 256)",EPS:"args.eps if args.eps else 0.000001"},intermediates:[{id:"pp",dtype:"uint32",shape:"[args.outFeatures + 1]"}],passes:[{id:"main",name:"DecodeOprojNorm",shader:"oproj-norm.wgsl.jinja",bindings:"default",dispatch:{x:"ceil(args.outFeatures / 8)",y:1,z:1},reads:["A","Bits","Scale","Hidden","W12"],writes:["pp","Hidden","Y2","Sum2"]}]}]},assets:[["oproj-norm.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Single-dispatch fused o-projection (QAT GEMV) + post-attention residual norm-add + pre-FFN
// norm (M=1):
//   o[r]   = srq(scale[r] * (sum_k q[r,k]*a[k] - ZP * sum_k a[k]), outScale)
//   hidden = hidden + RMSNorm(o) * w1                       (post-attn scale is always 1.0)
//   y2     = toY(srq(f32(toY(RMSNorm(hidden') * w2)), inScale2));  sum2 = sum f32(y2)
// The GEMV phase and both normalization phases share one dispatch with a
// last-arriver tail. \`a\` (attnOut) is already SRQ-quantized by the attention merge, so the
// GEMV runs division-free (inScale handled upstream); the per-row ZP correction sum_k a[k]
// falls out of the activation staging. w12 = [w1 | w2] packed. Virtual-subgroup GEMV phase.
// pp layout: [0..OUT_F) o values (bitcast f32); [OUT_F] ticket counter.

const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_F: u32 = {{ OUT_FEATURES }}u;
const BITS: u32 = {{ BITS }}u;
const VALS_PER_WORD: u32 = {{ VALS_PER_WORD }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const MASK: u32 = {{ MASK }}u;
const ZP: f32 = {{ ZP }}.0;
const WG: u32 = {{ WG }}u;
const SG_ROWS: u32 = {{ SG_ROWS }}u;
const ROWS_PER_WG: u32 = {{ ROWS_PER_WG }}u;
const TOTAL_WGS: u32 = {{ TOTAL_WGS }}u;
const EPS: f32 = {{ EPS }};
const ELEMS: u32 = {{ ELEMS }}u;

var<workgroup> lastFlag: u32;
{% if useSubgroups %}
var<workgroup> sgp: array<f32, WG / 32u>;
{% else %}
var<workgroup> wred: array<f32, WG>;
var<workgroup> wred4: array<vec4<f32>, WG>;
{% endif %}
{% if ROWS_MODE %}
const N_ROWS: u32 = {{ N_ROWS }}u;
var<workgroup> sgq: array<vec4<f32>, WG / 32u>;
var<workgroup> sgq2: array<vec4<f32>, WG / 32u>;
var<workgroup> sgpA: array<f32, WG / 32u>;
{% endif %}

{% if not useSubgroups %}
// Subgroup-free fallback (device lacks subgroups or has a non-32 subgroup width).
// Segmented reduction within each 32-lane logical block: role-equivalent to subgroupAdd
// over a 32-wide subgroup, but driven entirely by workgroup memory so it is correct on any
// hardware subgroup size. Reduces a vec4 so the activation sum + up to 3 row dot-sums share
// ONE barrier chain (vs one chain each). All WG threads must call it uniformly.
fn block_reduce32_v4(value: vec4<f32>, tid: u32) -> vec4<f32> {
  wred4[tid] = value;
  workgroupBarrier();
  for (var s: u32 = 16u; s > 0u; s = s >> 1u) {
    if ((tid & 31u) < s) { wred4[tid] = wred4[tid] + wred4[tid + s]; }
    workgroupBarrier();
  }
  let r = wred4[(tid >> 5u) << 5u];
  workgroupBarrier();
  return r;
}
{% endif %}

{% if useSubgroups %}
// Sum over each logical 32-lane block. On a fixed 32-wide adapter (sgExact32) this is the
// hardware subgroupAdd. On adapters reporting a wider/ranged subgroup (NVIDIA D3D12 [32,128],
// AMD [32,64]/[64,64]) a plain subgroupAdd would span multiple 32-blocks, so we use a 32-lane
// subgroupShuffleXor butterfly (deltas 1,2,4,8,16) that reduces each block independently \u2014
// correct for ANY hardware subgroup width >= 32, which is exactly what the >=32 gate ensures.
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
{% if ROWS_MODE %}
fn sg_sum_v4(value: vec4<f32>) -> vec4<f32> {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
{% endif %}
{% endif %}

fn reduce_sum(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
{% else %}
  wred[tid] = value;
  workgroupBarrier();
  for (var s: u32 = WG / 2u; s > 0u; s = s >> 1u) {
    if (tid < s) { wred[tid] = wred[tid] + wred[tid + s]; }
    workgroupBarrier();
  }
  let total = wred[0];
  workgroupBarrier();
  return total;
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let sgId = tid / 32u;
  let lane = tid & 31u;
  let outScale = params.outScale;

{% if ROWS_MODE %}
  // --- row-cooperative QAT GEMV phase (4-bit): all WG threads stride one
  // row's words together (lane-coalesced), activation vec4 loads are amortized
  // over N_ROWS rows, and one subgroup tree reduces each workgroup. ---
  let rowBase = wg.x * N_ROWS;
{% for r in range(N_ROWS) %}
  var q{{ r }}: f32 = 0.0;
{% endfor %}
  var sumA: f32 = 0.0;
  var w: u32 = tid;
  loop {
    if (w >= WORDS_PER_ROW) { break; }
    let av0 = vec4<f32>(a[w * 2u]);
    let av1 = vec4<f32>(a[w * 2u + 1u]);
    sumA = sumA + (av0.x + av0.y + av0.z + av0.w) + (av1.x + av1.y + av1.z + av1.w);
{% for r in range(N_ROWS) %}
    {
      let o = rowBase + {{ r }}u;
      if (o < OUT_F) {
        let p = bits_buf[o * WORDS_PER_ROW + w];
        let lo = vec4<f32>(unpack4xU8(p & 0x0F0F0F0Fu));
        let hi = vec4<f32>(unpack4xU8((p >> 4u) & 0x0F0F0F0Fu));
        q{{ r }} = q{{ r }} + dot(vec4<f32>(lo.x, hi.x, lo.y, hi.y), av0) + dot(vec4<f32>(lo.z, hi.z, lo.w, hi.w), av1);
      }
    }
{% endfor %}
    w = w + WG;
  }
  let red = sg_sum_v4(vec4<f32>(q0, q1, q2, q3));
  let red2 = sg_sum_v4(vec4<f32>(q4, q5, q6, q7));
  let redA = sg_sum(sumA);
  if ((tid & 31u) == 0u) { sgq[tid >> 5u] = red; sgq2[tid >> 5u] = red2; sgpA[tid >> 5u] = redA; }
  workgroupBarrier();
  if (tid == 0u) {
    var tot = vec4<f32>(0.0);
    var tot2 = vec4<f32>(0.0);
    var totA: f32 = 0.0;
    for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { tot = tot + sgq[i]; tot2 = tot2 + sgq2[i]; totA = totA + sgpA[i]; }
{% for r in range(N_ROWS) %}
    {
      let o = rowBase + {{ r }}u;
      if (o < OUT_F) {
        atomicStore(&pp[o], bitcast<u32>(srq(scale[o] * ({{ "tot" if r < 4 else "tot2" }}[{{ r % 4 }}u] - ZP * totA), outScale)));
      }
    }
{% endfor %}
  }
{% else %}
  let rowBase = wg.x * ROWS_PER_WG + sgId * SG_ROWS;

  // --- QAT GEMV phase (per virtual subgroup; mirrors QatMatMul scalar, division-free) ---
  var sumQA: array<f32, SG_ROWS>;
  for (var r: u32 = 0u; r < SG_ROWS; r = r + 1u) { sumQA[r] = 0.0; }
  var sumA: f32 = 0.0;

  var w: u32 = lane;
  loop {
    if (w >= WORDS_PER_ROW) { break; }
    var avc: array<vec4<f32>, CHUNKS>;
    for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
      let a4 = vec4<f32>(a[w * CHUNKS + c]);
      avc[c] = a4;
      sumA = sumA + a4.x + a4.y + a4.z + a4.w;
    }
    for (var r: u32 = 0u; r < SG_ROWS; r = r + 1u) {
      let o = rowBase + r;
      if (o < OUT_F) {
        let packed: u32 = bits_buf[o * WORDS_PER_ROW + w];
{% if BITS == 4 %}
        let lo = vec4<f32>(unpack4xU8(packed & 0x0F0F0F0Fu));
        let hi = vec4<f32>(unpack4xU8((packed >> 4u) & 0x0F0F0F0Fu));
        sumQA[r] = sumQA[r] + dot(vec4<f32>(lo.x, hi.x, lo.y, hi.y), avc[0]) + dot(vec4<f32>(lo.z, hi.z, lo.w, hi.w), avc[1]);
{% else %}
        let d0 = vec4<f32>(unpack4xU8(packed & 0x03030303u));
        let d1 = vec4<f32>(unpack4xU8((packed >> 2u) & 0x03030303u));
        let d2 = vec4<f32>(unpack4xU8((packed >> 4u) & 0x03030303u));
        let d3 = vec4<f32>(unpack4xU8((packed >> 6u) & 0x03030303u));
        sumQA[r] = sumQA[r] + dot(vec4<f32>(d0.x, d1.x, d2.x, d3.x), avc[0]) + dot(vec4<f32>(d0.y, d1.y, d2.y, d3.y), avc[1]) + dot(vec4<f32>(d0.z, d1.z, d2.z, d3.z), avc[2]) + dot(vec4<f32>(d0.w, d1.w, d2.w, d3.w), avc[3]);
{% endif %}
      }
    }
    w = w + 32u;
  }

{% if useSubgroups %}
  let rA = sg_sum(sumA);
  for (var r: u32 = 0u; r < SG_ROWS; r = r + 1u) {
    let rQA = sg_sum(sumQA[r]);
    let o = rowBase + r;
    if (lane == 0u && o < OUT_F) {
      atomicStore(&pp[o], bitcast<u32>(srq(scale[o] * (rQA - ZP * rA), outScale)));
    }
  }
{% else %}
  // Batch the activation sum + the SG_ROWS row dot-sums into one segmented reduce
  // (SG_ROWS <= 3 here, so all fit a single vec4 -> one barrier chain instead of SG_ROWS+1).
  let red = block_reduce32_v4(vec4<f32>(sumA{% for r in range(SG_ROWS) %}, sumQA[{{ r }}u]{% endfor %}{% for _ in range(3 - SG_ROWS) %}, 0.0{% endfor %}), tid);
  let rA = red.x;
{% for r in range(SG_ROWS) %}
  {
    let o = rowBase + {{ r }}u;
    if (lane == 0u && o < OUT_F) {
      atomicStore(&pp[o], bitcast<u32>(srq(scale[o] * (red[{{ r + 1 }}u] - ZP * rA), outScale)));
    }
  }
{% endfor %}
{% endif %}
{% endif %}
  storageBarrier();

  // --- last-arriver norm tail (post-attn norm-add + pre-FFN norm + SRQ + sum) ---
  if (tid == 0u) {
    let ticket = atomicAdd(&pp[OUT_F], 1u);
    lastFlag = select(0u, 1u, ticket == TOTAL_WGS - 1u);
  }
  if (workgroupUniformLoad(&lastFlag) != 1u) {
    return;
  }
  if (tid == 0u) { atomicStore(&pp[OUT_F], 0u); }
  let inScale2 = params.inScale2;

  var acc1: f32 = 0.0;
  var i: u32 = tid;
  loop {
    if (i >= OUT_F) { break; }
    let v = bitcast<f32>(atomicLoad(&pp[i]));
    acc1 = acc1 + v * v;
    i = i + WG;
  }
  let rms1 = inverseSqrt(reduce_sum(acc1, tid) / f32(OUT_F) + EPS);

  var hloc: array<f32, ELEMS>;
  var acc2: f32 = 0.0;
  var j: u32 = tid;
  var e: u32 = 0u;
  loop {
    if (j >= OUT_F) { break; }
    let normed = bitcast<f32>(atomicLoad(&pp[j])) * rms1 * f32(w12[j]);
    let hv = f32({{ xScalar }}(f32(hidden[j]) + normed));
    hidden[j] = {{ xScalar }}(hv);
    hloc[e] = hv;
    acc2 = acc2 + hv * hv;
    j = j + WG;
    e = e + 1u;
  }
  let rms2 = inverseSqrt(reduce_sum(acc2, tid) / f32(OUT_F) + EPS);

  var qAcc: f32 = 0.0;
  j = tid;
  e = 0u;
  loop {
    if (j >= OUT_F) { break; }
    let n2 = hloc[e] * rms2 * f32(w12[OUT_F + j]);
    let qv = {{ yScalar }}(srq(f32({{ yScalar }}(n2)), inScale2));
    y2[j] = qv;
    qAcc = qAcc + f32(qv);
    j = j + WG;
    e = e + 1u;
  }
  let qSum = reduce_sum(qAcc, tid);
  if (tid == 0u) {
    sum2[0] = qSum;
  }
}
`]]}],["com.xenova.gemma4.DecodePleGate",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodePleGate",sinceVersion:1,inputs:[{role:"A",dtype:"T"},{role:"W",dtype:"Wt",optional:!0},{role:"Codes",dtype:"uint32",optional:!0},{role:"RowScale",dtype:"float32",optional:!0},{role:"Ple",dtype:"float32"},{role:"GeluLut",dtype:"float32"}],outputs:[{role:"Out",dtype:"T"}],typeConstraints:{T:["float32","float16"],Wt:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},wT:{kind:"tensor",semantic:"W",role:"weights",required:!1},codesT:{kind:"tensor",semantic:"Codes",role:"weights",required:!1},rowScaleT:{kind:"tensor",semantic:"RowScale",role:"weights",required:!1},codes:{kind:"u32",semantic:"codes_mode",required:!1},pleT:{kind:"tensor",semantic:"Ple",role:"input"},outT:{kind:"tensor",semantic:"Out",role:"output"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},pleOffset:{kind:"u32",semantic:"ple_offset"},inScale:{kind:"f32",semantic:"input_activation_scale",required:!1},linOutScale:{kind:"f32",semantic:"output_activation_scale",required:!1},geluLutT:{kind:"tensor",semantic:"GeluLut",role:"weights"}},variants:[{id:"codes",priority:1,when:'args.codes and present.codesT and present.rowScaleT and args.M > 0 and args.inFeatures > 0 and args.inFeatures % 4 == 0 and args.outFeatures > 0 and dtypes.T == "f32" and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.codesT) >= args.outFeatures * args.inFeatures / 4 and numel(shapes.rowScaleT) >= args.outFeatures and numel(shapes.pleT) >= args.pleOffset + args.M * args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and numel(shapes.geluLutT) >= 256',constants:{scalar:"dtypes.T",M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",WG:32,N_ROWS:"2 if args.outFeatures >= 1024 else 1",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',GRID_X:"min(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)), 65535)"},passes:[{id:"main",name:"DecodePleGateCodes",shader:"decode-ple-gate-codes.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"codes",arg:"codesT",semantic:"Codes",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"row_scale",arg:"rowScaleT",semantic:"RowScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"ple",arg:"pleT",semantic:"Ple",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$scalar"},{name:"gelu_lut",arg:"geluLutT",semantic:"GeluLut",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"linOutScale",type:"f32",value:"args.linOutScale if args.linOutScale else 0.0"},{name:"pleOffset",type:"u32",value:"args.pleOffset if args.pleOffset else 0"}]}}],dispatch:{x:"min(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)), 65535)",y:"ceil(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)) / min(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)), 65535))",z:1},reads:["A","Codes","RowScale","Ple","GeluLut"],writes:["Out"]}]},{id:"scalar",priority:0,when:"(not args.codes) and present.wT and args.M > 0 and args.inFeatures > 0 and args.inFeatures % 4 == 0 and args.outFeatures > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.wT) >= args.outFeatures * args.inFeatures and numel(shapes.pleT) >= args.pleOffset + args.M * args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (f16Ok(dtypes.T)) and (f16Ok(dtypes.Wt)) and numel(shapes.geluLutT) >= 256",constants:{usesF16:'dtypes.T == "f16" or dtypes.Wt == "f16"',scalar:"dtypes.T",wScalar:"dtypes.Wt",M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",WG:32,N_ROWS:"2 if args.outFeatures >= 1024 else 1",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',PLE_OFFSET:"args.pleOffset",GRID_X:"min(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)), 65535)"},passes:[{id:"main",name:"DecodePleGate",shader:"decode-ple-gate.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"wt",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"ple",arg:"pleT",semantic:"Ple",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$scalar"},{name:"gelu_lut",arg:"geluLutT",semantic:"GeluLut",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"linOutScale",type:"f32",value:"args.linOutScale if args.linOutScale else 0.0"}]}}],dispatch:{x:"min(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)), 65535)",y:"ceil(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)) / min(ceil(args.outFeatures / (2 if args.outFeatures >= 1024 else 1)), 65535))",z:1},reads:["A","W","Ple","GeluLut"],writes:["Out"]}]}]},assets:[["decode-ple-gate-codes.wgsl.jinja",`{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Codes path for the fused per-layer-input gate: the int8 dense weight streams
// as packed +128-biased u8 codes (4/u32) plus a per-row scale. unpack4x8unorm
// lanes decode as fl((c+128)/255); the bias and the x255 unorm decode are
// undone once per output row in the epilogue:
//   w\xB7a = row_scale[o] * (255*sum_k(u_k*a_k) - 128*sum_k(a_k))
// This matches the unorm decode fold used by the other presrq GEMV kernels.
//   out[m,o] = gelu_grid(srq(w\xB7a, linOutScale)) * ple[pleOffset + m*outF + o]

const M: u32 = {{ M }}u;
const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;
const WPR: u32 = {{ IN_FEATURES }}u / 4u;
const GRID_X: u32 = {{ GRID_X }}u;

{% if not useSubgroups %}
var<workgroup> red: array<f32, WG>;
{% endif %}

fn reduce(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

fn tanh_safe(x: f32) -> f32 {
  if (x > 10.0) { return 1.0; }
  if (x < -10.0) { return -1.0; }
  return tanh(x);
}
fn gelu_tanh(v: f32) -> f32 {
  return 0.5 * v * (1.0 + tanh_safe(0.7978845608028654 * (v + 0.044715 * v * v * v)));
}
// gelu over a grid input g = k * S (k in [-128,127]): the host-f64 table fixes
// the rounded activation value for every fused path.
fn gelu_grid(g: f32, s: f32) -> f32 {
  if (s == 0.0) { return gelu_tanh(g); }
  return gelu_lut[u32(clamp(round(g / s), -128.0, 127.0) + 128.0)];
}


@compute @workgroup_size({{ WG }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  let rowBase = wgId * N_ROWS;
  if (rowBase >= OUT_FEATURES) { return; }
  let tid = lid.x;

  for (var m: u32 = 0u; m < M; m = m + 1u) {
    let aBase = m * IN_FEATURES;
    var acc: array<f32, N_ROWS>;
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { acc[r] = 0.0; }
    var aAcc: f32 = 0.0;
    var wd: u32 = tid;
    loop {
      if (wd >= WPR) { break; }
      let kb = wd * 4u;
      // QAT wrapper: srq the gate linear's input (no-op when scale==0).
      let a4 = srq4(vec4<f32>(f32(a[aBase + kb]), f32(a[aBase + kb + 1u]), f32(a[aBase + kb + 2u]), f32(a[aBase + kb + 3u])), params.inScale);
      aAcc = aAcc + (a4.x + a4.y) + (a4.z + a4.w);
      for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
        let o = rowBase + r;
        if (o < OUT_FEATURES) {
          acc[r] = acc[r] + dot(unpack4x8unorm(codes[o * WPR + wd]), a4);
        }
      }
      wd = wd + WG;
    }
    let aSum = reduce(aAcc, tid);
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let s = reduce(acc[r], tid);
      let o = rowBase + r;
      if (tid == 0u && o < OUT_FEATURES) {
        // fma(s, 255, -128*aSum) undoes the unorm 1/255 decode and the +128 code bias.
        let v = row_scale[o] * fma(s, 255.0, -128.0 * aSum);
        out[m * OUT_FEATURES + o] = {{ scalar }}(gelu_grid(srq(v, params.linOutScale), params.linOutScale) * f32(ple[params.pleOffset + m * OUT_FEATURES + o]));
      }
    }
  }
}
`],["decode-ple-gate.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused per-layer-input gate: out[o] = gelu_tanh(sum_k W[o,k]*a[k]) * ple[pleOffset + o].
// Fuses the dense gate GEMV + ai.onnx.Gelu + the ple multiply into one op.
// Dense GEMV body mirrors com.xenova.gemma4.DenseGemv; gelu_tanh mirrors
// ai.onnx.Gelu(approximate="tanh") bit-for-bit.

const M: u32 = {{ M }}u;
const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;
const KV4: u32 = {{ IN_FEATURES }}u / 4u;
const GRID_X: u32 = {{ GRID_X }}u;
const PLE_OFFSET: u32 = {{ PLE_OFFSET }}u;

{% if not useSubgroups %}
var<workgroup> red: array<f32, WG>;
{% endif %}

fn reduce(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

fn tanh_safe(x: f32) -> f32 {
  if (x > 10.0) { return 1.0; }
  if (x < -10.0) { return -1.0; }
  return tanh(x);
}
fn gelu_tanh(v: f32) -> f32 {
  return 0.5 * v * (1.0 + tanh_safe(0.7978845608028654 * (v + 0.044715 * v * v * v)));
}
// gelu over a grid input g = k * S (k in [-128,127]): the host-f64 table fixes
// the rounded activation value for every fused path.
fn gelu_grid(g: f32, s: f32) -> f32 {
  if (s == 0.0) { return gelu_tanh(g); }
  return gelu_lut[u32(clamp(round(g / s), -128.0, 127.0) + 128.0)];
}


@compute @workgroup_size({{ WG }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  let rowBase = wgId * N_ROWS;
  if (rowBase >= OUT_FEATURES) { return; }
  let tid = lid.x;

  for (var m: u32 = 0u; m < M; m = m + 1u) {
    let aBase = m * IN_FEATURES;
    var acc: array<f32, N_ROWS>;
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { acc[r] = 0.0; }
    var k4: u32 = tid;
    loop {
      if (k4 >= KV4) { break; }
      let kb = k4 * 4u;
      // QAT wrapper: srq the gate linear's input (no-op when scale==0).
      let a4 = srq4(vec4<f32>(f32(a[aBase + kb]), f32(a[aBase + kb + 1u]), f32(a[aBase + kb + 2u]), f32(a[aBase + kb + 3u])), params.inScale);
      for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
        let o = rowBase + r;
        if (o < OUT_FEATURES) {
          let wb = o * IN_FEATURES + kb;
          acc[r] = acc[r] + dot(vec4<f32>(f32(wt[wb]), f32(wt[wb + 1u]), f32(wt[wb + 2u]), f32(wt[wb + 3u])), a4);
        }
      }
      k4 = k4 + WG;
    }
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let s = reduce(acc[r], tid);
      let o = rowBase + r;
      if (tid == 0u && o < OUT_FEATURES) {
        out[m * OUT_FEATURES + o] = {{ scalar }}(gelu_grid(srq(s, params.linOutScale), params.linOutScale) * f32(ple[PLE_OFFSET + m * OUT_FEATURES + o]));
      }
    }
  }
}
`]]}],["com.xenova.gemma4.DecodePleProjNorm",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodePleProjNorm",sinceVersion:1,inputs:[{role:"A",dtype:"T"},{role:"Wt",dtype:"Wt",optional:!0},{role:"Codes",dtype:"uint32",optional:!0},{role:"RowScale",dtype:"float32",optional:!0},{role:"Hidden",dtype:"H"},{role:"W12S",dtype:"float32"}],outputs:[{role:"Hidden",dtype:"H"},{role:"Y2",dtype:"Y"},{role:"Sum2",dtype:"float32"}],typeConstraints:{T:["float32","float16"],Wt:["float32","float16"],H:["float32","float16"],Y:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},wT:{kind:"tensor",semantic:"Wt",role:"weights",required:!1},codesT:{kind:"tensor",semantic:"Codes",role:"weights",required:!1},rowScaleT:{kind:"tensor",semantic:"RowScale",role:"weights",required:!1},codes:{kind:"u32",semantic:"codes_mode",required:!1},hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},w12sT:{kind:"tensor",semantic:"W12S",role:"weights"},y2T:{kind:"tensor",semantic:"Y2",role:"output"},sum2T:{kind:"tensor",semantic:"Sum2",role:"output"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},eps:{kind:"f32",semantic:"eps",required:!1},inScale:{kind:"f32",semantic:"input_activation_scale",required:!1},projInScale:{kind:"f32",semantic:"proj_input_activation_scale",required:!1},projOutScale:{kind:"f32",semantic:"proj_output_activation_scale",required:!1},codesCatT:{kind:"tensor",semantic:"CodesCat",role:"weights",required:!1},scaleCatT:{kind:"tensor",semantic:"ScaleCat",role:"weights",required:!1},pleT:{kind:"tensor",semantic:"Ple",role:"input",required:!1},gateInFeatures:{kind:"u32",semantic:"gate_in_features",required:!1},gateInScale:{kind:"f32",semantic:"gate_input_activation_scale",required:!1},gateOutScale:{kind:"f32",semantic:"gate_output_activation_scale",required:!1},pleOffset:{kind:"u32",semantic:"ple_offset",required:!1}},variants:[{id:"fused_codes",priority:1,when:'args.codes and present.codesT and present.rowScaleT and args.inFeatures > 0 and args.inFeatures % 4 == 0 and args.inFeatures <= 1024 and args.outFeatures > 0 and args.outFeatures <= 8192 and dtypes.T == "f32" and numel(shapes.aT) >= args.inFeatures and numel(shapes.codesT) >= args.outFeatures * args.inFeatures / 4 and numel(shapes.rowScaleT) >= args.outFeatures and numel(shapes.hiddenT) >= args.outFeatures and numel(shapes.w12sT) >= 2 * args.outFeatures + 1 and numel(shapes.y2T) >= args.outFeatures and numel(shapes.sum2T) >= 1 and ((dtypes.H != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16"))',constants:{usesF16:'dtypes.H == "f16" or dtypes.Y == "f16"',xScalar:"dtypes.H",yScalar:"dtypes.Y",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",K_ITER:"ceil(args.inFeatures / 128)",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",WG:256,SG_ROWS:2,ROWS_PER_WG:16,TOTAL_WGS:"ceil(args.outFeatures / 16)",ELEMS:"ceil(args.outFeatures / 256)",EPS:"args.eps if args.eps else 0.000001"},intermediates:[{id:"pp",dtype:"uint32",shape:"[args.outFeatures + 1]"}],passes:[{id:"main",name:"DecodePleProjNormCodes",shader:"ple-proj-norm-codes.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"codes",arg:"codesT",semantic:"Codes",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"row_scale",arg:"rowScaleT",semantic:"RowScale",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"pp",semantic:"pp",role:"scratch",buffer:{type:"storage"},elementType:"atomic<u32>"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"w12s",arg:"w12sT",semantic:"W12S",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y2",arg:"y2T",semantic:"Y2",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"sum2",arg:"sum2T",semantic:"Sum2",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"projInScale",type:"f32",value:"args.projInScale if args.projInScale else 0.0"},{name:"projOutScale",type:"f32",value:"args.projOutScale if args.projOutScale else 0.0"}]}}],dispatch:{x:"ceil(args.outFeatures / 16)",y:1,z:1},reads:["A","Codes","RowScale","Hidden","W12S"],writes:["pp","Hidden","Y2","Sum2"]}]},{id:"fused",priority:0,when:'(not args.codes) and present.wT and args.inFeatures > 0 and args.inFeatures % 4 == 0 and args.outFeatures > 0 and args.outFeatures <= 8192 and numel(shapes.aT) >= args.inFeatures and numel(shapes.wT) >= args.outFeatures * args.inFeatures and numel(shapes.hiddenT) >= args.outFeatures and numel(shapes.w12sT) >= 2 * args.outFeatures + 1 and numel(shapes.y2T) >= args.outFeatures and numel(shapes.sum2T) >= 1 and ((dtypes.T != "f16" and dtypes.Wt != "f16" and dtypes.H != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16"))',constants:{usesF16:'dtypes.T == "f16" or dtypes.Wt == "f16" or dtypes.H == "f16" or dtypes.Y == "f16"',aScalar:"dtypes.T",wScalar:"dtypes.Wt",xScalar:"dtypes.H",yScalar:"dtypes.Y",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",WG:256,SG_ROWS:2,ROWS_PER_WG:16,TOTAL_WGS:"ceil(args.outFeatures / 16)",ELEMS:"ceil(args.outFeatures / 256)",EPS:"args.eps if args.eps else 0.000001"},intermediates:[{id:"pp",dtype:"uint32",shape:"[args.outFeatures + 1]"}],passes:[{id:"main",name:"DecodePleProjNorm",shader:"ple-proj-norm.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aScalar"},{name:"wt",arg:"wT",semantic:"Wt",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"pp",semantic:"pp",role:"scratch",buffer:{type:"storage"},elementType:"atomic<u32>"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"w12s",arg:"w12sT",semantic:"W12S",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y2",arg:"y2T",semantic:"Y2",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"sum2",arg:"sum2T",semantic:"Sum2",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"projInScale",type:"f32",value:"args.projInScale if args.projInScale else 0.0"},{name:"projOutScale",type:"f32",value:"args.projOutScale if args.projOutScale else 0.0"}]}}],dispatch:{x:"ceil(args.outFeatures / 16)",y:1,z:1},reads:["A","Wt","Hidden","W12S"],writes:["pp","Hidden","Y2","Sum2"]}]}]},assets:[["ple-proj-norm-codes.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Codes path for the single-dispatch fused PLE projection + post-PLE residual
// norm-add + next-layer norm (M=1). The int8 dense projection weight streams as
// packed +128-biased u8 codes (4/u32) plus a per-row scale. unpack4x8unorm
// lanes decode as fl((c+128)/255); bias and unorm decode are undone once per output row:
//   proj[o] = srq(row_scale[o] * (255*sum_k(u_k*a_k) - 128*sum_k(a_k)), projOutScale)
// The a-words and their sum are hoisted per 32-lane subgroup (K_ITER registers) and reused
// across SG_ROWS rows. Norm tail unchanged (last-arriver over pp).
// pp layout: [0..OUT_F) proj values (bitcast f32); [OUT_F] ticket counter.

const IN_F: u32 = {{ IN_FEATURES }}u;
const OUT_F: u32 = {{ OUT_FEATURES }}u;
const KV4: u32 = {{ IN_FEATURES }}u / 4u;
const K_ITER: u32 = {{ K_ITER }}u;
const WG: u32 = {{ WG }}u;
const SG_ROWS: u32 = {{ SG_ROWS }}u;
const ROWS_PER_WG: u32 = {{ ROWS_PER_WG }}u;
const TOTAL_WGS: u32 = {{ TOTAL_WGS }}u;
const EPS: f32 = {{ EPS }};
const ELEMS: u32 = {{ ELEMS }}u;

var<workgroup> lastFlag: u32;
{% if useSubgroups %}
var<workgroup> sgp: array<f32, WG / 32u>;

// Sum over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently, correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64]).
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
{% else %}
var<workgroup> wred: array<f32, WG>;
var<workgroup> wred4: array<vec4<f32>, WG>;
{% endif %}

{% if not useSubgroups %}
// Subgroup-free fallback (device lacks subgroups or has a non-32 subgroup width).
// Segmented reduction within each 32-lane logical block: role-equivalent to subgroupAdd
// over a 32-wide subgroup, but driven entirely by workgroup memory so it is correct on any
// hardware subgroup size. Reduces a vec4 so the activation sum + up to 3 row dot-sums share
// ONE barrier chain. All WG threads must call it uniformly.
fn block_reduce32_v4(value: vec4<f32>, tid: u32) -> vec4<f32> {
  wred4[tid] = value;
  workgroupBarrier();
  for (var s: u32 = 16u; s > 0u; s = s >> 1u) {
    if ((tid & 31u) < s) { wred4[tid] = wred4[tid] + wred4[tid + s]; }
    workgroupBarrier();
  }
  let r = wred4[(tid >> 5u) << 5u];
  workgroupBarrier();
  return r;
}
{% endif %}

fn reduce_sum(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
{% else %}
  wred[tid] = value;
  workgroupBarrier();
  for (var s: u32 = WG / 2u; s > 0u; s = s >> 1u) {
    if (tid < s) { wred[tid] = wred[tid] + wred[tid + s]; }
    workgroupBarrier();
  }
  let total = wred[0];
  workgroupBarrier();
  return total;
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let sgId = tid / 32u;
  let lane = tid & 31u;
  let rowBase = wg.x * ROWS_PER_WG + sgId * SG_ROWS;

  // --- dense GEMV phase (per virtual subgroup) ---
  // Hoist the activation words (srq'd) + their sum once per subgroup; reuse across rows.
  var av: array<vec4<f32>, K_ITER>;
  var aAcc: f32 = 0.0;
  for (var ki: u32 = 0u; ki < K_ITER; ki = ki + 1u) {
    let k4 = lane + ki * 32u;
    av[ki] = vec4<f32>(0.0);
    if (k4 < KV4) {
      let kb = k4 * 4u;
      // QAT wrapper: srq the projection's input (no-op when scale==0).
      av[ki] = srq4(vec4<f32>(f32(a[kb]), f32(a[kb + 1u]), f32(a[kb + 2u]), f32(a[kb + 3u])), params.projInScale);
      aAcc = aAcc + (av[ki].x + av[ki].y) + (av[ki].z + av[ki].w);
    }
  }
  var accs: array<f32, SG_ROWS>;
  for (var r: u32 = 0u; r < SG_ROWS; r = r + 1u) {
    let o = rowBase + r;
    var acc: f32 = 0.0;
    if (o < OUT_F) {
      for (var ki: u32 = 0u; ki < K_ITER; ki = ki + 1u) {
        let k4 = lane + ki * 32u;
        if (k4 < KV4) {
          acc = acc + dot(unpack4x8unorm(codes[o * KV4 + k4]), av[ki]);
        }
      }
    }
    accs[r] = acc;
  }
{% if useSubgroups %}
  let aSum = sg_sum(aAcc);
  for (var r: u32 = 0u; r < SG_ROWS; r = r + 1u) {
    let s = sg_sum(accs[r]);
    let o = rowBase + r;
    if (lane == 0u && o < OUT_F) {
      // fma(s, 255, -128*aSum) undoes the unorm 1/255 decode and the +128 code bias.
      atomicStore(&pp[o], bitcast<u32>(srq(row_scale[o] * fma(s, 255.0, -128.0 * aSum), params.projOutScale)));
    }
  }
{% else %}
  // Batch the activation sum + the SG_ROWS row dot-sums into one segmented reduce
  // (SG_ROWS <= 3 here, so all fit a single vec4 -> one barrier chain).
  let red = block_reduce32_v4(vec4<f32>(aAcc{% for r in range(SG_ROWS) %}, accs[{{ r }}u]{% endfor %}{% for _ in range(3 - SG_ROWS) %}, 0.0{% endfor %}), tid);
  let aSum = red.x;
{% for r in range(SG_ROWS) %}
  {
    let o = rowBase + {{ r }}u;
    if (lane == 0u && o < OUT_F) {
      // fma(s, 255, -128*aSum) undoes the unorm 1/255 decode and the +128 code bias.
      atomicStore(&pp[o], bitcast<u32>(srq(row_scale[o] * fma(red[{{ r + 1 }}u], 255.0, -128.0 * aSum), params.projOutScale)));
    }
  }
{% endfor %}
{% endif %}
  storageBarrier();

  // --- last-arriver norm tail (all WG threads of the final workgroup) ---
  if (tid == 0u) {
    let ticket = atomicAdd(&pp[OUT_F], 1u);
    lastFlag = select(0u, 1u, ticket == TOTAL_WGS - 1u);
  }
  if (workgroupUniformLoad(&lastFlag) != 1u) {
    return;
  }
  if (tid == 0u) { atomicStore(&pp[OUT_F], 0u); }
  let inScale = params.inScale;
  let sv = w12s[2u * OUT_F];

  // rms over proj
  var acc1: f32 = 0.0;
  var i: u32 = tid;
  loop {
    if (i >= OUT_F) { break; }
    let v = bitcast<f32>(atomicLoad(&pp[i]));
    acc1 = acc1 + v * v;
    i = i + WG;
  }
  let rms1 = inverseSqrt(reduce_sum(acc1, tid) / f32(OUT_F) + EPS);

  // hidden update (kept in registers for the second norm)
  var hloc: array<f32, ELEMS>;
  var acc2: f32 = 0.0;
  var j: u32 = tid;
  var e: u32 = 0u;
  loop {
    if (j >= OUT_F) { break; }
    let normed = bitcast<f32>(atomicLoad(&pp[j])) * rms1 * f32(w12s[j]);
    let hv = f32({{ xScalar }}((f32(hidden[j]) + normed) * sv));
    hidden[j] = {{ xScalar }}(hv);
    hloc[e] = hv;
    acc2 = acc2 + hv * hv;
    j = j + WG;
    e = e + 1u;
  }
  let rms2 = inverseSqrt(reduce_sum(acc2, tid) / f32(OUT_F) + EPS);

  var qAcc: f32 = 0.0;
  j = tid;
  e = 0u;
  loop {
    if (j >= OUT_F) { break; }
    let n2 = hloc[e] * rms2 * f32(w12s[OUT_F + j]);
    let qv = {{ yScalar }}(srq(f32({{ yScalar }}(n2)), inScale));
    y2[j] = qv;
    qAcc = qAcc + f32(qv);
    j = j + WG;
    e = e + 1u;
  }
  let qSum = reduce_sum(qAcc, tid);
  if (tid == 0u) {
    sum2[0] = qSum;
  }
}
`],["ple-proj-norm.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Single-dispatch fused PLE projection + post-PLE residual norm-add + next-layer norm (M=1):
//   proj[o]  = sum_k W[o, k] * a[k]                       (dense, W may be f16)
//   hidden   = (hidden + RMSNorm(proj) * w1) * sc
//   y2       = toY(srq(f32(toY(RMSNorm(hidden') * w2)), inScale));  sum2 = sum f32(y2)
// GEMV phase workgroups write bitcast-atomic outputs and bump a ticket; the
// last workgroup runs the norm tail. w1/w2/sc are packed into one buffer
// (w12s = [w1 | w2 | sc]) to fit 8 storage bindings. Virtual-subgroup GEMV
// phase: each 32-lane subgroup computes SG_ROWS rows.
// pp layout: [0..OUT_F) proj values (bitcast f32); [OUT_F] ticket counter.

const IN_F: u32 = {{ IN_FEATURES }}u;
const OUT_F: u32 = {{ OUT_FEATURES }}u;
const KV4: u32 = {{ IN_FEATURES }}u / 4u;
const WG: u32 = {{ WG }}u;
const SG_ROWS: u32 = {{ SG_ROWS }}u;
const ROWS_PER_WG: u32 = {{ ROWS_PER_WG }}u;
const TOTAL_WGS: u32 = {{ TOTAL_WGS }}u;
const EPS: f32 = {{ EPS }};
const ELEMS: u32 = {{ ELEMS }}u;

var<workgroup> lastFlag: u32;
{% if useSubgroups %}
var<workgroup> sgp: array<f32, WG / 32u>;

// Sum over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently, correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64]).
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}
{% else %}
var<workgroup> wred: array<f32, WG>;
var<workgroup> wred4: array<vec4<f32>, WG>;
{% endif %}

{% if not useSubgroups %}
// Subgroup-free fallback (device lacks subgroups or has a non-32 subgroup width).
// Segmented reduction within each 32-lane logical block: role-equivalent to subgroupAdd
// over a 32-wide subgroup, but driven entirely by workgroup memory so it is correct on any
// hardware subgroup size. Reduces a vec4 so up to 4 row dot-sums share ONE barrier chain.
// All WG threads must call it uniformly.
fn block_reduce32_v4(value: vec4<f32>, tid: u32) -> vec4<f32> {
  wred4[tid] = value;
  workgroupBarrier();
  for (var s: u32 = 16u; s > 0u; s = s >> 1u) {
    if ((tid & 31u) < s) { wred4[tid] = wred4[tid] + wred4[tid + s]; }
    workgroupBarrier();
  }
  let r = wred4[(tid >> 5u) << 5u];
  workgroupBarrier();
  return r;
}
{% endif %}

fn reduce_sum(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
{% else %}
  wred[tid] = value;
  workgroupBarrier();
  for (var s: u32 = WG / 2u; s > 0u; s = s >> 1u) {
    if (tid < s) { wred[tid] = wred[tid] + wred[tid + s]; }
    workgroupBarrier();
  }
  let total = wred[0];
  workgroupBarrier();
  return total;
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let sgId = tid / 32u;
  let lane = tid & 31u;
  let rowBase = wg.x * ROWS_PER_WG + sgId * SG_ROWS;

  // --- dense GEMV phase (per virtual subgroup; mirrors DenseGemv's vec4 K-split) ---
  var accs: array<f32, SG_ROWS>;
  for (var r: u32 = 0u; r < SG_ROWS; r = r + 1u) {
    let o = rowBase + r;
    var acc: f32 = 0.0;
    if (o < OUT_F) {
      var k4: u32 = lane;
      loop {
        if (k4 >= KV4) { break; }
        let kb = k4 * 4u;
        // QAT wrapper: srq the projection's input (no-op when scale==0).
        let a4 = srq4(vec4<f32>(f32(a[kb]), f32(a[kb + 1u]), f32(a[kb + 2u]), f32(a[kb + 3u])), params.projInScale);
        let wb = o * IN_F + kb;
        let w4 = vec4<f32>(f32(wt[wb]), f32(wt[wb + 1u]), f32(wt[wb + 2u]), f32(wt[wb + 3u]));
        acc = acc + dot(w4, a4);
        k4 = k4 + 32u;
      }
    }
    accs[r] = acc;
  }
{% if useSubgroups %}
  for (var r: u32 = 0u; r < SG_ROWS; r = r + 1u) {
    let s = sg_sum(accs[r]);
    let o = rowBase + r;
    if (lane == 0u && o < OUT_F) {
      atomicStore(&pp[o], bitcast<u32>(srq(s, params.projOutScale)));
    }
  }
{% else %}
  // Batch the SG_ROWS row dot-sums into one segmented reduce (SG_ROWS <= 4 -> one vec4).
  let red = block_reduce32_v4(vec4<f32>({% for r in range(SG_ROWS) %}{% if r > 0 %}, {% endif %}accs[{{ r }}u]{% endfor %}{% for _ in range(4 - SG_ROWS) %}, 0.0{% endfor %}), tid);
{% for r in range(SG_ROWS) %}
  {
    let o = rowBase + {{ r }}u;
    if (lane == 0u && o < OUT_F) {
      atomicStore(&pp[o], bitcast<u32>(srq(red[{{ r }}u], params.projOutScale)));
    }
  }
{% endfor %}
{% endif %}
  storageBarrier();

  // --- last-arriver norm tail (all WG threads of the final workgroup) ---
  if (tid == 0u) {
    let ticket = atomicAdd(&pp[OUT_F], 1u);
    lastFlag = select(0u, 1u, ticket == TOTAL_WGS - 1u);
  }
  if (workgroupUniformLoad(&lastFlag) != 1u) {
    return;
  }
  if (tid == 0u) { atomicStore(&pp[OUT_F], 0u); }
  let inScale = params.inScale;
  let sv = w12s[2u * OUT_F];

  // rms over proj
  var acc1: f32 = 0.0;
  var i: u32 = tid;
  loop {
    if (i >= OUT_F) { break; }
    let v = bitcast<f32>(atomicLoad(&pp[i]));
    acc1 = acc1 + v * v;
    i = i + WG;
  }
  let rms1 = inverseSqrt(reduce_sum(acc1, tid) / f32(OUT_F) + EPS);

  // hidden update (kept in registers for the second norm)
  var hloc: array<f32, ELEMS>;
  var acc2: f32 = 0.0;
  var j: u32 = tid;
  var e: u32 = 0u;
  loop {
    if (j >= OUT_F) { break; }
    let normed = bitcast<f32>(atomicLoad(&pp[j])) * rms1 * f32(w12s[j]);
    let hv = f32({{ xScalar }}((f32(hidden[j]) + normed) * sv));
    hidden[j] = {{ xScalar }}(hv);
    hloc[e] = hv;
    acc2 = acc2 + hv * hv;
    j = j + WG;
    e = e + 1u;
  }
  let rms2 = inverseSqrt(reduce_sum(acc2, tid) / f32(OUT_F) + EPS);

  var qAcc: f32 = 0.0;
  j = tid;
  e = 0u;
  loop {
    if (j >= OUT_F) { break; }
    let n2 = hloc[e] * rms2 * f32(w12s[OUT_F + j]);
    let qv = {{ yScalar }}(srq(f32({{ yScalar }}(n2)), inScale));
    y2[j] = qv;
    qAcc = qAcc + f32(qv);
    j = j + WG;
    e = e + 1u;
  }
  let qSum = reduce_sum(qAcc, tid);
  if (tid == 0u) {
    sum2[0] = qSum;
  }
}
`]]}],["com.xenova.gemma4.DecodeQkNormRope",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeQkNormRope",sinceVersion:1,inputs:[{role:"X",dtype:"T"},{role:"W",dtype:"float32"},{role:"Cos",dtype:"float32"},{role:"Sin",dtype:"float32"}],outputs:[{role:"Yn",dtype:"T"}],typeConstraints:{T:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},wT:{kind:"tensor",semantic:"W",role:"input"},cosT:{kind:"tensor",semantic:"Cos",role:"input"},sinT:{kind:"tensor",semantic:"Sin",role:"input"},ynT:{kind:"tensor",semantic:"Yn",role:"output"},seq:{kind:"u32",semantic:"seq"},heads:{kind:"u32",semantic:"heads"},headDim:{kind:"u32",semantic:"head_dim"},eps:{kind:"f32",semantic:"eps"},dstOffset:{kind:"u32",semantic:"dst_offset",required:!1}},variants:[{id:"scalar",priority:0,when:"args.seq > 0 and args.heads > 0 and args.headDim > 0 and args.headDim % 2 == 0 and numel(shapes.xT) >= args.seq * args.heads * args.headDim and numel(shapes.wT) >= args.headDim and numel(shapes.cosT) >= args.seq * (args.headDim / 2) and numel(shapes.sinT) >= args.seq * (args.headDim / 2) and numel(shapes.ynT) >= (args.dstOffset if args.dstOffset else 0) + args.seq * args.heads * args.headDim and (f16Ok(dtypes.T))",constants:{usesF16:'dtypes.T == "f16"',scalar:"dtypes.T",HEAD_DIM:"args.headDim",HALF_DIM:"args.headDim / 2",WG:128,EPS:"args.eps"},passes:[{id:"main",name:"DecodeQkNormRope",shader:"qk-norm-rope.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"w",arg:"wT",semantic:"W",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"cosTbl",arg:"cosT",semantic:"Cos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sinTbl",arg:"sinT",semantic:"Sin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"yn",arg:"ynT",semantic:"Yn",role:"output",buffer:{type:"storage"},elementType:"$scalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"seq",type:"u32",value:"args.seq"},{name:"heads",type:"u32",value:"args.heads"},{name:"dstOffset",type:"u32",value:"args.dstOffset if args.dstOffset else 0"},{name:"_pad1",type:"u32",default:0}]}}],dispatch:{x:"args.seq",y:"args.heads",z:1},reads:["X","W","Cos","Sin"],writes:["Yn"]}]}]},assets:[["qk-norm-rope.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused q/k RMSNorm + split-half RoPE, one workgroup per (seq, head). The
// normalized q/k row is rotated and written directly to its destination without
// an intermediate buffer. Numerically identical to com.xenova.RMSNorm (f32
// reduction, weight is the full multiplier) followed by com.xenova.Rope1d
// (split-half): yn[d] = nd*cos - nh*sin ; yn[d+half] = nh*cos + nd*sin,
// n = x/sqrt(mean(x^2)+eps)*w.

const HEAD_DIM: u32 = {{ HEAD_DIM }}u;
const HALF_DIM: u32 = {{ HALF_DIM }}u;
const WG: u32 = {{ WG }}u;
const EPS: f32 = {{ EPS }};

var<workgroup> red: array<f32, WG>;

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let t = wg.x;
  let h = wg.y;
  if (t >= params.seq || h >= params.heads) { return; }
  let tid = lid.x;
  let base = (t * params.heads + h) * HEAD_DIM;
  // dstOffset lets the output land directly in the KV cache at the per-token position (folds the
  // separate strided cache-write op into this one). 0 for q (writes a plain qn buffer).
  let outBase = params.dstOffset + base;
  let csBase = t * HALF_DIM;

  // RMS reduction over the head dim (f32).
  var ss: f32 = 0.0;
  var d: u32 = tid;
  loop {
    if (d >= HEAD_DIM) { break; }
    let v = f32(x[base + d]);
    ss = ss + v * v;
    d = d + WG;
  }
  red[tid] = ss;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let scale = inverseSqrt(red[0] / f32(HEAD_DIM) + EPS);

  // Apply norm * weight, then split-half RoPE on pairs (k, k+half).
  var k: u32 = tid;
  loop {
    if (k >= HALF_DIM) { break; }
    let n0 = f32(x[base + k]) * scale * f32(w[k]);
    let n1 = f32(x[base + k + HALF_DIM]) * scale * f32(w[k + HALF_DIM]);
    let c = cosTbl[csBase + k];
    let s = sinTbl[csBase + k];
    yn[outBase + k] = {{ scalar }}(n0 * c - n1 * s);
    yn[outBase + k + HALF_DIM] = {{ scalar }}(n1 * c + n0 * s);
    k = k + WG;
  }
}
`]]}],["com.xenova.gemma4.DecodeQkvProj",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeQkvProj",sinceVersion:1,inputs:[{role:"A",dtype:"float32"},{role:"QBits",dtype:"uint32"},{role:"KBits",dtype:"uint32"},{role:"VBits",dtype:"uint32"},{role:"Scales",dtype:"float32"},{role:"SumA",dtype:"float32"}],outputs:[{role:"Q",dtype:"float32",shape:[1,"args.qOut"]},{role:"K",dtype:"float32",shape:[1,"args.kvOut"]},{role:"V",dtype:"float32",shape:[1,"args.kvOut"]}],args:{aT:{kind:"tensor",semantic:"A",role:"input"},qBitsT:{kind:"tensor",semantic:"QBits",role:"weights"},kBitsT:{kind:"tensor",semantic:"KBits",role:"weights"},vBitsT:{kind:"tensor",semantic:"VBits",role:"weights"},scalesT:{kind:"tensor",semantic:"Scales",role:"weights"},sumAT:{kind:"tensor",semantic:"SumA",role:"input"},qT:{kind:"tensor",semantic:"Q",role:"output"},kT:{kind:"tensor",semantic:"K",role:"output"},vT:{kind:"tensor",semantic:"V",role:"output"},inFeatures:{kind:"u32",semantic:"in_features"},qOut:{kind:"u32",semantic:"q_out_features"},kvOut:{kind:"u32",semantic:"kv_out_features"},bits:{kind:"u32",semantic:"bits"},zeroPoint:{kind:"u32",semantic:"zero_point"},mask:{kind:"u32",semantic:"mask"},qOutScale:{kind:"f32",semantic:"q_output_activation_scale",required:!1},kOutScale:{kind:"f32",semantic:"k_output_activation_scale",required:!1},vOutScale:{kind:"f32",semantic:"v_output_activation_scale",required:!1}},variants:[{id:"presrq",priority:0,when:"(args.bits == 2 or args.bits == 4) and args.inFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.inFeatures % 4 == 0 and args.qOut > 0 and args.kvOut > 0 and args.zeroPoint > 0 and args.mask > 0 and (ceil(args.qOut / 2) + 2 * ceil(args.kvOut / 2)) <= 65535 and numel(shapes.aT) >= args.inFeatures and numel(shapes.sumAT) >= 1 and numel(shapes.qBitsT) >= args.qOut * (args.inFeatures * args.bits / 32) and numel(shapes.kBitsT) >= args.kvOut * (args.inFeatures * args.bits / 32) and numel(shapes.vBitsT) >= args.kvOut * (args.inFeatures * args.bits / 32) and numel(shapes.scalesT) >= args.qOut + 2 * args.kvOut and numel(shapes.qT) >= args.qOut and numel(shapes.kT) >= args.kvOut and numel(shapes.vT) >= args.kvOut",constants:{IN_FEATURES:"args.inFeatures",Q_OUT:"args.qOut",KV_OUT:"args.kvOut",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:32,N_ROWS:2,Q_WGS:"ceil(args.qOut / 2)",KV_WGS:"ceil(args.kvOut / 2)",TOTAL_WGS:"ceil(args.qOut / 2) + 2 * ceil(args.kvOut / 2)",GRID_X:"ceil(args.qOut / 2) + 2 * ceil(args.kvOut / 2)",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32'},passes:[{id:"main",name:"DecodeQkvProj",shader:"decode-qkv-proj.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"q_bits",arg:"qBitsT",semantic:"QBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"k_bits",arg:"kBitsT",semantic:"KBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"v_bits",arg:"vBitsT",semantic:"VBits",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scales",arg:"scalesT",semantic:"Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sum_a",arg:"sumAT",semantic:"SumA",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out_q",arg:"qT",semantic:"Q",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"out_k",arg:"kT",semantic:"K",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"out_v",arg:"vT",semantic:"V",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"qOutScale",type:"f32",value:"args.qOutScale if args.qOutScale else 0.0"},{name:"kOutScale",type:"f32",value:"args.kOutScale if args.kOutScale else 0.0"},{name:"vOutScale",type:"f32",value:"args.vOutScale if args.vOutScale else 0.0"}]}}],dispatch:{x:"ceil(args.qOut / 2) + 2 * ceil(args.kvOut / 2)",y:1,z:1},reads:["A","QBits","KBits","VBits","Scales","SumA"],writes:["Q","K","V"]}]}]},assets:[["decode-qkv-proj.wgsl.jinja",`{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused decode (M=1) q/k/v projection: one dispatch computes all three QAT GEMVs over the
// same presrq'd activation (q/k/v share input_activation_scale; the producer norm already
// quantized \`a\` and staged its sum in sum_a). Workgroups are partitioned by output row:
//   [0, Q_WGS)                      -> q rows
//   [Q_WGS, Q_WGS+KV_WGS)           -> k rows
//   [Q_WGS+KV_WGS, TOTAL_WGS)       -> v rows
// Each per-row reduction follows QatMatMul scalar_presrq (WG=32 lane-strided
// words, same chunk/dot order, same subgroupAdd), so q/k/v preserve the
// per-projection rounding contract while sharing the presrq activation read and sum.
// Per-projection output_activation_scale (SRQ) comes from params; per-row weight scales are
// packed [qScale | kScale | vScale] in \`scales\`.

const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const Q_OUT: u32 = {{ Q_OUT }}u;
const KV_OUT: u32 = {{ KV_OUT }}u;
const BITS: u32 = {{ BITS }}u;
const VALS_PER_WORD: u32 = {{ VALS_PER_WORD }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const MASK: u32 = {{ MASK }}u;
const ZP: f32 = {{ ZP }}.0;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;
const Q_WGS: u32 = {{ Q_WGS }}u;
const KV_WGS: u32 = {{ KV_WGS }}u;
const TOTAL_WGS: u32 = {{ TOTAL_WGS }}u;
const GRID_X: u32 = {{ GRID_X }}u;

{% if not useSubgroups %}
var<workgroup> pQA: array<f32, WG>;
{% endif %}

// Static Range Quantization: round-trip through an int8 grid (no-op when scale==0).
fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) {
    return x;
  }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn reduce(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  pQA[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { pQA[tid] = pQA[tid] + pQA[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = pQA[0];
  workgroupBarrier();
  return r;
{% endif %}
}

{% macro gemv(bits_name, out_name, out_f, scale_off, out_scale) %}
    // Same structure as QatMatMul scalar_presrq M==1: lane-strided words, the word's
    // activation chunk read once and reused across N_ROWS rows, unpack4xU8 dequant.
    var sumQA: array<f32, N_ROWS>;
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { sumQA[r] = 0.0; }
    var w: u32 = tid;
    loop {
      if (w >= WORDS_PER_ROW) {
        break;
      }
      var avc: array<vec4<f32>, CHUNKS>;
      for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
        avc[c] = a[w * CHUNKS + c];
      }
      for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
        let o = rowBase + r;
        if (o < {{ out_f }}) {
          let packed: u32 = {{ bits_name }}[o * WORDS_PER_ROW + w];
{% if BITS == 4 %}
          let lo = vec4<f32>(unpack4xU8(packed & 0x0F0F0F0Fu));
          let hi = vec4<f32>(unpack4xU8((packed >> 4u) & 0x0F0F0F0Fu));
          sumQA[r] = sumQA[r] + dot(vec4<f32>(lo.x, hi.x, lo.y, hi.y), avc[0]) + dot(vec4<f32>(lo.z, hi.z, lo.w, hi.w), avc[1]);
{% else %}
          let d0 = vec4<f32>(unpack4xU8(packed & 0x03030303u));
          let d1 = vec4<f32>(unpack4xU8((packed >> 2u) & 0x03030303u));
          let d2 = vec4<f32>(unpack4xU8((packed >> 4u) & 0x03030303u));
          let d3 = vec4<f32>(unpack4xU8((packed >> 6u) & 0x03030303u));
          sumQA[r] = sumQA[r] + dot(vec4<f32>(d0.x, d1.x, d2.x, d3.x), avc[0]) + dot(vec4<f32>(d0.y, d1.y, d2.y, d3.y), avc[1]) + dot(vec4<f32>(d0.z, d1.z, d2.z, d3.z), avc[2]) + dot(vec4<f32>(d0.w, d1.w, d2.w, d3.w), avc[3]);
{% endif %}
        }
      }
      w = w + WG;
    }
    let rA = sum_a[0];
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let rQA = reduce(sumQA[r], tid);
      let o = rowBase + r;
      if (tid == 0u && o < {{ out_f }}) {
        {{ out_name }}[o] = srq(scales[{{ scale_off }} + o] * (rQA - ZP * rA), {{ out_scale }});
      }
    }
{% endmacro %}

@compute @workgroup_size({{ WG }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  if (wgId >= TOTAL_WGS) {
    return;
  }
  let tid = lid.x;
  if (wgId < Q_WGS) {
    let rowBase = wgId * N_ROWS;
{{ gemv("q_bits", "out_q", "Q_OUT", "0u", "params.qOutScale") }}
  } else if (wgId < Q_WGS + KV_WGS) {
    let rowBase = (wgId - Q_WGS) * N_ROWS;
{{ gemv("k_bits", "out_k", "KV_OUT", "Q_OUT", "params.kOutScale") }}
  } else {
    let rowBase = (wgId - Q_WGS - KV_WGS) * N_ROWS;
{{ gemv("v_bits", "out_v", "KV_OUT", "Q_OUT + KV_OUT", "params.vOutScale") }}
  }
}
`]]}],["com.xenova.gemma4.DecodeRmsSrq",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DecodeRmsSrq",sinceVersion:1,inputs:[{role:"X",dtype:"X"},{role:"W",dtype:"float32",rank:1}],outputs:[{role:"Y",dtype:"Y",shape:"shapes.xT"},{role:"SumA",dtype:"float32",shape:["args.rows"]}],typeConstraints:{X:["float32","float16"],Y:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},wT:{kind:"tensor",semantic:"W",role:"weights"},yT:{kind:"tensor",semantic:"Y",role:"output"},sumAT:{kind:"tensor",semantic:"SumA",role:"output"},rows:{kind:"u32",semantic:"rows"},dim:{kind:"u32",semantic:"dim"},eps:{kind:"f32",semantic:"eps",required:!1},inScale:{kind:"f32",semantic:"input_activation_scale",required:!1}},variants:[{id:"main",priority:0,when:'args.rows > 0 and args.dim > 0 and numel(shapes.xT) >= args.rows * args.dim and dim(shapes.wT, 0) == args.dim and numel(shapes.yT) >= args.rows * args.dim and numel(shapes.sumAT) >= args.rows and ((dtypes.X != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16"))',constants:{xScalar:"dtypes.X",yScalar:"dtypes.Y",usesF16:'dtypes.X == "f16" or dtypes.Y == "f16"',useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32",WG:256,dim:"args.dim",eps:"args.eps if args.eps else 0.000001"},passes:[{id:"main",name:"DecodeRmsSrq",shader:"decode-rms-srq.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xScalar"},{name:"w",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"sum_a",arg:"sumAT",semantic:"SumA",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"min(args.rows, 65535)"},{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"}]}}],dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.rows / min(args.rows, 65535))",z:1},reads:["X","W"],writes:["Y","SumA"]}]}]},assets:[["decode-rms-srq.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused weighted RMSNorm + SRQ activation quantization + sum-of-quantized-activations.
//   n[j]    = x[j] * inverseSqrt(mean(x^2) + eps) * w[j]        (mirrors com.xenova.RMSNorm)
//   y[j]    = toY(srq(f32(toY(n[j])), inScale))                  (the value a downstream QAT
//             GEMV would otherwise recompute per workgroup; toY = output dtype rounding,
//             applied BEFORE srq so the result is bit-identical to the GEMV reading a
//             toY-typed normed buffer and srq-ing it inline)
//   sum[row] = sum_j f32(y[j])                                   (the GEMV's ZP correction term)
// Produces srq'd activations and their per-row sums once, so downstream QAT
// GEMVs can consume both the quantized values and the ZP correction term directly.

const DIM: u32 = {{ dim }}u;
const EPS: f32 = {{ eps }};
const WG: u32 = {{ WG }}u;

{% if useSubgroups %}
// Hybrid 2-barrier reduction: subgroupAdd per subgroup + cross-subgroup combine via shared.
var<workgroup> sgp: array<f32, WG / 32u>;

// Sum over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently, correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64]).
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}

fn reduce_sum(value: f32, tid: u32) -> f32 {
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
}
{% else %}
var<workgroup> partial: array<f32, WG>;

fn reduce_sum(value: f32, tid: u32) -> f32 {
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
  let r = partial[0];
  workgroupBarrier();
  return r;
}
{% endif %}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) {
    return x;
  }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let rowStride = select(params.rowStride, params.rows, params.rowStride == 0u);
  let row = wg.x + wg.y * rowStride;
  if (row >= params.rows) {
    return;
  }
  let tid = lid.x;
  let base = row * DIM;
  let inScale = params.inScale;

  // Sum of squares (identical reduction shape to com.xenova.RMSNorm).
  var acc: f32 = 0.0;
  var i: u32 = tid;
  loop {
    if (i >= DIM) {
      break;
    }
    let v = f32(x[base + i]);
    acc = acc + v * v;
    i = i + WG;
  }
  let scale = inverseSqrt(reduce_sum(acc, tid) / f32(DIM) + EPS);

  // Normalize + weight + quantize; accumulate the quantized sum.
  var qAcc: f32 = 0.0;
  var j: u32 = tid;
  loop {
    if (j >= DIM) {
      break;
    }
    let n = f32(x[base + j]) * scale * f32(w[j]);
    let q = {{ yScalar }}(srq(f32({{ yScalar }}(n)), inScale));
    y[base + j] = q;
    qAcc = qAcc + f32(q);
    j = j + WG;
  }
  let qSum = reduce_sum(qAcc, tid);
  if (tid == 0u) {
    sum_a[row] = qSum;
  }
}
`]]}],["com.xenova.gemma4.DenseGemv",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"DenseGemv",sinceVersion:1,inputs:[{role:"A",dtype:"T"},{role:"W",dtype:"Wt"}],outputs:[{role:"Out",dtype:"T",shape:["args.M","args.outFeatures"]}],typeConstraints:{T:["float32","float16"],Wt:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},wT:{kind:"tensor",semantic:"W",role:"weights"},outT:{kind:"tensor",semantic:"Out",role:"output"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},inScale:{kind:"f32",semantic:"input_activation_scale",required:!1},outScale:{kind:"f32",semantic:"output_activation_scale",required:!1},exact:{kind:"u32",semantic:"exact_reference_order",required:!1}},variants:[{id:"sgmat",priority:5,when:'(not args.exact) and args.M >= 64 and args.inFeatures > 0 and args.inFeatures % 32 == 0 and args.outFeatures > 0 and args.outFeatures % 64 == 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.wT) >= args.outFeatures * args.inFeatures and numel(shapes.outT) >= args.M * args.outFeatures and device.features.has("shader-f16") and device.features.has("subgroups") and device.features.has("chromium-experimental-subgroup-matrix")',constants:{M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",outScalar:"dtypes.T",wScalar:"dtypes.Wt"},passes:[{id:"main",name:"DenseGemvSgmat",shader:"dense-gemv-sgmat.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$outScalar"},{name:"wt",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"outScale",type:"f32",value:"args.outScale if args.outScale else 0.0"}]}}],dispatch:{x:"ceil(args.outFeatures / 64)",y:"ceil(args.M / 32)",z:1},reads:["A","W"],writes:["Out"]}]},{id:"gemm",priority:3,when:'(not args.exact) and args.M >= 64 and args.inFeatures > 0 and args.inFeatures % 4 == 0 and args.outFeatures > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.wT) >= args.outFeatures * args.inFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (tensorDtypes.aT != "float16" or device.features.has("shader-f16")) and (tensorDtypes.wT != "float16" or device.features.has("shader-f16"))',constants:{usesF16:'dtypes.T == "f16" or dtypes.Wt == "f16"',M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",THREADS_N:16,THREADS_M:16,N_PT:2,M_PT:2,scalar:"dtypes.T",inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',weightVec4:'"vec4<f16>" if dtypes.Wt == "f16" else "vec4<f32>"',GRID_X:"ceil(args.outFeatures / 32)"},passes:[{id:"main",name:"DenseGemvGemm",shader:"dense-gemv-gemm.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"wt",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$scalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"outScale",type:"f32",value:"args.outScale if args.outScale else 0.0"}]}}],dispatch:{x:"ceil(args.outFeatures / 32)",y:1,z:"ceil(args.M / 32)"},reads:["A","W"],writes:["Out"]}]},{id:"scalar",priority:0,when:"(not args.exact) and (args.M > 0 and args.inFeatures > 0 and args.inFeatures % 4 == 0 and args.outFeatures > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.wT) >= args.outFeatures * args.inFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (f16Ok(dtypes.T)) and (f16Ok(dtypes.Wt)))",constants:{usesF16:'dtypes.T == "f16" or dtypes.Wt == "f16"',scalar:"dtypes.T",wScalar:"dtypes.Wt",M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",WG:32,N_ROWS:"8 if args.outFeatures >= 4096 else (2 if args.outFeatures >= 1024 else 1)",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',GRID_X:"min(ceil(args.outFeatures / (8 if args.outFeatures >= 4096 else (2 if args.outFeatures >= 1024 else 1))), 65535)"},passes:[{id:"main",name:"DenseGemv",shader:"dense-gemv.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"wt",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$scalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"},{name:"outScale",type:"f32",value:"args.outScale if args.outScale else 0.0"}]}}],dispatch:{x:"min(ceil(args.outFeatures / (8 if args.outFeatures >= 4096 else (2 if args.outFeatures >= 1024 else 1))), 65535)",y:"ceil(ceil(args.outFeatures / (8 if args.outFeatures >= 4096 else (2 if args.outFeatures >= 1024 else 1))) / min(ceil(args.outFeatures / (8 if args.outFeatures >= 4096 else (2 if args.outFeatures >= 1024 else 1))), 65535))",z:1},reads:["A","W"],writes:["Out"]}]}]},assets:[["dense-gemv-gemm.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Register-blocked dense GEMM for prefill per-layer-embedding projections
// (M >= 64) when subgroup-matrix support is unavailable. A 16x16 workgroup
// tiles N x M so each thread owns an N_PT x M_PT (out-row x token)
// accumulator block. Each weight vec4 is read once for all M_PT token rows.
// No subgroups, no tensor cores, no workgroup memory: pure registers. Per element:
//   out[m, o] = srq(sum_k W[o, k] * srq(a[m, k], inScale), outScale)   (srq no-op when scale == 0)

const M: u32 = {{ M }}u;
const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const KV4: u32 = IN_FEATURES / 4u;
const GRID_X: u32 = {{ GRID_X }}u;
const THREADS_N: u32 = {{ THREADS_N }}u;
const THREADS_M: u32 = {{ THREADS_M }}u;
const N_PT: u32 = {{ N_PT }}u;
const M_PT: u32 = {{ M_PT }}u;
const TILE_N: u32 = THREADS_N * N_PT;
const TILE_M: u32 = THREADS_M * M_PT;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

@compute @workgroup_size({{ THREADS_N * THREADS_M }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  let tid = lid.x;
  let nSub = tid % THREADS_N;
  let mSub = tid / THREADS_N;
  let nBase = wgId * TILE_N + nSub * N_PT;
  let mBase = wg.z * TILE_M + mSub * M_PT;
  let inScale = params.inScale;
  let outScale = params.outScale;

{% for n in range(N_PT) %}
  let ro{{ n }} = nBase + {{ n }}u;
  let wBase{{ n }} = min(ro{{ n }}, OUT_FEATURES - 1u) * KV4;
{% endfor %}
{% for mi in range(M_PT) %}
  let mr{{ mi }} = mBase + {{ mi }}u;
  let aBase{{ mi }} = min(mr{{ mi }}, M - 1u) * KV4;
{% endfor %}
{% for n in range(N_PT) %}{% for mi in range(M_PT) %}
  var acc_{{ n }}_{{ mi }}: f32 = 0.0;
{% endfor %}{% endfor %}

  var k4: u32 = 0u;
  loop {
    if (k4 >= KV4) { break; }
{% for n in range(N_PT) %}
    let w{{ n }} = vec4<f32>(wt[wBase{{ n }} + k4]);
{% endfor %}
{% for mi in range(M_PT) %}
    let a{{ mi }} = srq4(vec4<f32>(a[aBase{{ mi }} + k4]), inScale);
{% endfor %}
{% for n in range(N_PT) %}{% for mi in range(M_PT) %}
    acc_{{ n }}_{{ mi }} = acc_{{ n }}_{{ mi }} + dot(w{{ n }}, a{{ mi }});
{% endfor %}{% endfor %}
    k4 = k4 + 1u;
  }

{% for mi in range(M_PT) %}
  if (mr{{ mi }} < M) {
{% for n in range(N_PT) %}
    if (ro{{ n }} < OUT_FEATURES) {
      out[mr{{ mi }} * OUT_FEATURES + ro{{ n }}] = {{ scalar }}(srq(acc_{{ n }}_{{ mi }}, outScale));
    }
{% endfor %}
  }
{% endfor %}
}
`],["dense-gemv-sgmat.wgsl.jinja",`enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);

{{ env.wgsl.resourceDeclarations }}

// Subgroup-matrix f16 GEMM for prefill per-layer-embedding projections
// (M >= 64). A (the activation, SRQ-quantized per the QAT wrapper then cast to
// f16) and B (the dense weight cast to f16) are staged into workgroup memory,
// then multiplied with 8x8 f16 MMAs and f32 accumulation. Each weight tile is
// loaded once and reused across TILE_ROWS activation rows. Per element:
//   out = srq(sum_k srq(a[m,k], inScale) * w[o,k], outScale)   (srq is a no-op when scale == 0).
// Tile = 32 M x 64 N x 32 K, 128-thread workgroup = 4 subgroups, each owning a 16x32 subtile
// (2x4 of 8x8 result matrices), matching the QAT subgroup-matrix tile geometry.

const IN_F:      u32 = {{ IN_FEATURES }}u;
const OUT_F:     u32 = {{ OUT_FEATURES }}u;
const M_TOTAL:   u32 = {{ M }}u;
const TILE_COLS: u32 = 64u;
const TILE_ROWS: u32 = 32u;
const TILE_K:    u32 = 32u;
const SUB_COLS:  u32 = 32u;
const SUB_ROWS:  u32 = 16u;

var<workgroup> tile_A: array<f16, 32 * 32>;
var<workgroup> tile_B: array<f16, 64 * 32>;
var<workgroup> scratch: array<array<f32, 64>, 4>;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

// A tile: 32 m-rows x 32 k of f16(srq(activation, inScale)). One k-tile column-strip per thread.
fn loadSHMA(tile_base: u32, k_idx: u32, row: u32, c_idx: u32, inScale: f32) {
  let a_global: u32 = tile_base + row;
  let col: u32 = c_idx * 8u;
  for (var col_offset: u32 = 0u; col_offset < 8u; col_offset++) {
    let k: u32 = k_idx + col + col_offset;
    var v: f32 = 0.0;
    if (a_global < M_TOTAL) {
      v = srq(f32(a[a_global * IN_F + k]), inScale);
    }
    tile_A[row * TILE_K + col + col_offset] = f16(v);
  }
}

// B tile: 64 output rows x 32 k of f16(weight). 2048 f16 over 128 threads = 16 each.
fn loadSHMB(tile_base: u32, k_idx: u32, lin: u32) {
  for (var i: u32 = lin; i < TILE_COLS * TILE_K; i += 128u) {
    let r = i / TILE_K;
    let c = i % TILE_K;
    tile_B[i] = f16(f32(wt[(tile_base + r) * IN_F + k_idx + c]));
  }
}

fn storeOutput(offset: u32, row: u32, col: u32, src_slot: u32, row_limit: i32, col_base: u32, outScale: f32) {
  if (row_limit > 0 && row < u32(row_limit)) {
    let c1 = scratch[src_slot][row * 8u + col];
    let c2 = scratch[src_slot][row * 8u + col + 1u];
    out[offset + row * OUT_F + col] = {{ outScalar }}(srq(c1, outScale));
    out[offset + row * OUT_F + col + 1u] = {{ outScalar }}(srq(c2, outScale));
  }
}

@compute @workgroup_size(128, 1, 1)
fn main(
  @builtin(workgroup_id) workgroup_id: vec3<u32>,
  @builtin(local_invocation_index) local_idx: u32,
  @builtin(subgroup_invocation_id) sg_id: u32,
  @builtin(subgroup_size) sg_size: u32
) {
  let a_global_base: u32 = workgroup_id.y * TILE_ROWS;
  let w_global_base: u32 = workgroup_id.x * TILE_COLS;
  let inScale = params.inScale;
  let outScale = params.outScale;

  let subtile_id: u32 = local_idx / sg_size;
  let subtile_idx: u32 = subtile_id / 2u;
  let subtile_idy: u32 = subtile_id % 2u;
  let base_A: u32 = subtile_idy * SUB_ROWS;
  let base_B: u32 = subtile_idx * SUB_COLS;

  var matC00: subgroup_matrix_result<f32, 8, 8>;
  var matC01: subgroup_matrix_result<f32, 8, 8>;
  var matC02: subgroup_matrix_result<f32, 8, 8>;
  var matC03: subgroup_matrix_result<f32, 8, 8>;
  var matC10: subgroup_matrix_result<f32, 8, 8>;
  var matC11: subgroup_matrix_result<f32, 8, 8>;
  var matC12: subgroup_matrix_result<f32, 8, 8>;
  var matC13: subgroup_matrix_result<f32, 8, 8>;

  for (var kidx: u32 = 0u; kidx < IN_F; kidx += TILE_K) {
    loadSHMA(a_global_base, kidx, local_idx / 4u, local_idx % 4u, inScale);
    loadSHMB(w_global_base, kidx, local_idx);
    workgroupBarrier();

    for (var step: u32 = 0u; step < TILE_K; step += 8u) {
      let matrix_a_offset: u32 = subtile_idy * SUB_ROWS * TILE_K + step;
      var matA0: subgroup_matrix_left<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, matrix_a_offset, false, TILE_K);
      var matA1: subgroup_matrix_left<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, matrix_a_offset + 8u * TILE_K, false, TILE_K);

      let matrix_b_offset: u32 = subtile_idx * SUB_COLS * TILE_K + step;
      var matB0: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset, true, TILE_K);
      var matB1: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset +  8u * TILE_K, true, TILE_K);
      var matB2: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset + 16u * TILE_K, true, TILE_K);
      var matB3: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset + 24u * TILE_K, true, TILE_K);

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

  let row: u32 = sg_id / 4u;
  let col: u32 = (sg_id % 4u) * 2u;
  var matrix_c_offset: u32 = (a_global_base + base_A) * OUT_F + w_global_base + base_B;
  var row_limit: i32 = i32(M_TOTAL) - i32(a_global_base + base_A);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC00, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit, w_global_base + base_B, outScale);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC01, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit, w_global_base + base_B + 8u, outScale);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC02, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit, w_global_base + base_B + 16u, outScale);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC03, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit, w_global_base + base_B + 24u, outScale);

  matrix_c_offset = matrix_c_offset + 8u * OUT_F;
  row_limit = i32(M_TOTAL) - i32(a_global_base + base_A + 8u);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC10, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit, w_global_base + base_B, outScale);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC11, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit, w_global_base + base_B + 8u, outScale);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC12, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit, w_global_base + base_B + 16u, outScale);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC13, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit, w_global_base + base_B + 24u, outScale);
}
`],["dense-gemv.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Dense GEMV (no transpose): out[m, o] = sum_k W[o, k] * a[m, k]. Used for
// per-layer-embedding dense projections with small M. One workgroup (= one
// subgroup, WG=32) computes N_ROWS output rows; threads split K with coalesced
// vec4 weight reads + subgroupAdd reduction; the activation vec4 is read once
// per K-step and reused across the N_ROWS rows. W may be f16 with f32 activation.

const M: u32 = {{ M }}u;
const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;
const KV4: u32 = {{ IN_FEATURES }}u / 4u;

{% if not useSubgroups %}
var<workgroup> red: array<f32, WG>;
{% endif %}

fn reduce(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
{% endif %}
}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

@compute @workgroup_size({{ WG }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * {{ GRID_X }}u + wg.x;
  let rowBase = wgId * N_ROWS;
  if (rowBase >= OUT_FEATURES) {
    return;
  }
  let tid = lid.x;

  for (var m: u32 = 0u; m < M; m = m + 1u) {
    let aBase = m * IN_FEATURES;
    var acc: array<f32, N_ROWS>;
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { acc[r] = 0.0; }

    var k4: u32 = tid;
    loop {
      if (k4 >= KV4) { break; }
      let kb = k4 * 4u;
      // QAT wrapper semantics: srq the linear's input and output (no-op when scale==0).
      let a4 = srq4(vec4<f32>(f32(a[aBase + kb]), f32(a[aBase + kb + 1u]), f32(a[aBase + kb + 2u]), f32(a[aBase + kb + 3u])), params.inScale);
      for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
        let o = rowBase + r;
        if (o < OUT_FEATURES) {
          let wb = o * IN_FEATURES + kb;
          let w4 = vec4<f32>(f32(wt[wb]), f32(wt[wb + 1u]), f32(wt[wb + 2u]), f32(wt[wb + 3u]));
          acc[r] = acc[r] + dot(w4, a4);
        }
      }
      k4 = k4 + WG;
    }

    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let s = reduce(acc[r], tid);
      let o = rowBase + r;
      if (tid == 0u && o < OUT_FEATURES) {
        out[m * OUT_FEATURES + o] = {{ scalar }}(srq(s, params.outScale));
      }
    }
  }
}
`]]}],["com.xenova.gemma4.PleGate",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"PleGate",sinceVersion:1,inputs:[{role:"A",dtype:"T"},{role:"B",dtype:"T"},{role:"GeluLut",dtype:"float32"}],outputs:[{role:"Y",dtype:"T",shape:"shapes.aT"}],typeConstraints:{T:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},bT:{kind:"tensor",semantic:"B",role:"input"},yT:{kind:"tensor",semantic:"Y",role:"output"},count:{kind:"u32",semantic:"kernel.count"},bOffset:{kind:"u32",semantic:"kernel.b_offset",required:!1},geluLutT:{kind:"tensor",semantic:"GeluLut",role:"weights"},gridScale:{kind:"f32",semantic:"input_grid_scale",required:!1}},tunables:{WORKGROUP_SIZE:256,MAX_WORKGROUPS_X:65535},variants:[{id:"scalar",priority:0,when:'args.count > 0 and numel(shapes.aT) >= args.count and numel(shapes.bT) >= (args.bOffset if args.bOffset else 0) + args.count and numel(shapes.yT) >= args.count and ((dtypes.T != "f16") or device.features.has("shader-f16")) and numel(shapes.geluLutT) >= 256',constants:{usesF16:'dtypes.T == "f16"',scalar:"dtypes.T"},passes:[{id:"main",name:"PleGate",shader:"ple-gate.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"b",arg:"bT",semantic:"B",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$scalar"},{name:"gelu_lut",arg:"geluLutT",semantic:"GeluLut",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"count",type:"u32",value:"args.count"},{name:"wgY",type:"u32",value:"min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X)"},{name:"bOffset",type:"u32",value:"args.bOffset if args.bOffset else 0"},{name:"gridScale",type:"f32",value:"args.gridScale if args.gridScale else 0.0"}]}}],dispatch:{x:"min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X)",y:"ceil(ceil(args.count / tunables.WORKGROUP_SIZE) / min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X))",z:1},reads:["A","B","GeluLut"],writes:["Y"]}]}]},assets:[["ple-gate.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused GeGLU multiply: y = gelu_tanh(a) * b, used for both the main-MLP gate
// and the per-layer-input gate.
// gelu_tanh / tanh_safe match ai.onnx.Gelu (approximate="tanh"), including
// tanh clamping to +/-1 past |x| > 10.

const WG: u32 = {{ tunables.WORKGROUP_SIZE }}u;

fn tanh_safe(x: f32) -> f32 {
  if (x > 10.0) { return 1.0; }
  if (x < -10.0) { return -1.0; }
  return tanh(x);
}

fn gelu_tanh(v: f32) -> f32 {
  return 0.5 * v * (1.0 + tanh_safe(0.7978845608028654 * (v + 0.044715 * v * v * v)));
}

// gelu over a grid input g = k * S (k in [-128,127]): the host-f64 table fixes
// the rounded activation value for every fused path.
fn gelu_grid(g: f32, s: f32) -> f32 {
  if (s == 0.0) { return gelu_tanh(g); }
  return gelu_lut[u32(clamp(round(g / s), -128.0, 127.0) + 128.0)];
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wg_idx = wg.x + wg.y * params.wgY;
  let i = wg_idx * WG + lid.x;
  if (i >= params.count) {
    return;
  }
  // b may be a larger tensor read at a fixed offset, such as the per-layer
  // slice of pleNorm.
  y[i] = {{ scalar }}(gelu_grid(f32(a[i]), params.gridScale) * f32(b[params.bOffset + i]));
}
`]]}],["com.xenova.gemma4.QatEmbedGather",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"QatEmbedGather",sinceVersion:1,inputs:[{role:"Ids",dtype:"uint32"},{role:"Bits",dtype:"uint32"},{role:"Scale",dtype:"float32"},{role:"W",dtype:"float32",optional:!0}],outputs:[{role:"Out",dtype:"O",shape:["args.seq","args.hidden"]},{role:"Y2",dtype:"float32",optional:!0,shape:["args.seq","args.hidden"]},{role:"SumA",dtype:"float32",optional:!0,shape:["args.seq"]}],typeConstraints:{O:["float16","float32"]},args:{idsT:{kind:"tensor",semantic:"Ids",role:"input"},bitsT:{kind:"tensor",semantic:"Bits",role:"input"},scaleT:{kind:"tensor",semantic:"Scale",role:"input"},yT:{kind:"tensor",semantic:"Out",role:"output"},seq:{kind:"u32",semantic:"seq"},hidden:{kind:"u32",semantic:"hidden"},vocab:{kind:"u32",semantic:"vocab"},bits:{kind:"u32",semantic:"bits"},groupSize:{kind:"u32",semantic:"groupSize"},zeroPoint:{kind:"u32",semantic:"zero_point"},embedScale:{kind:"f32",semantic:"embed_scale"},wT:{kind:"tensor",semantic:"W",role:"weights",required:!1},y2T:{kind:"tensor",semantic:"Y2",role:"output",required:!1},sumAT:{kind:"tensor",semantic:"SumA",role:"output",required:!1},normSrq:{kind:"u32",semantic:"norm_srq_mode",required:!1},eps:{kind:"f32",semantic:"eps",required:!1},inScale:{kind:"f32",semantic:"input_activation_scale",required:!1}},variants:[{id:"norm_srq",priority:1,when:'args.normSrq and present.wT and present.y2T and present.sumAT and args.seq == 1 and (args.bits == 2 or args.bits == 4) and args.hidden > 0 and args.groupSize > 0 and args.hidden % args.groupSize == 0 and (args.hidden * args.bits) % 32 == 0 and args.zeroPoint > 0 and dtypes.O == "f32" and numel(shapes.wT) >= args.hidden and numel(shapes.y2T) >= args.hidden and numel(shapes.sumAT) >= 1',constants:{outputScalar:"dtypes.O",HIDDEN:"args.hidden",VOCAB:"args.vocab",GROUP_SIZE:"args.groupSize",NUM_GROUPS:"args.hidden / args.groupSize",WORDS_PER_ROW:"args.hidden * args.bits / 32",VALS_PER_WORD:"32 / args.bits",BITS:"args.bits",MASK:"15 if args.bits == 4 else 3",ZP:"args.zeroPoint",EMBED_SCALE:"args.embedScale",EPS:"args.eps if args.eps else 0.000001",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',sgExact32:"device.adapterInfo.subgroupMinSize == 32 and device.adapterInfo.subgroupMaxSize == 32"},passes:[{id:"main",name:"QatEmbedGatherNormSrq",shader:"qat-embed-gather-norm.wgsl.jinja",bindings:[{name:"ids",arg:"idsT",semantic:"Ids",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"wt",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y",arg:"yT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$O"},{name:"y2",arg:"y2T",semantic:"Y2",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"sum_a",arg:"sumAT",semantic:"SumA",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inScale if args.inScale else 0.0"}]}}],dispatch:{x:1,y:1,z:1},reads:["Ids","Bits","Scale","W"],writes:["Out","Y2","SumA"]}]},{id:"main",when:"(not args.normSrq) and ((args.bits == 2 or args.bits == 4) and args.seq > 0 and args.hidden > 0 and args.groupSize > 0 and args.hidden % args.groupSize == 0 and (args.hidden * args.bits) % 32 == 0 and args.zeroPoint > 0 and (f16Ok(dtypes.O)))",constants:{usesF16:'dtypes.O == "f16"',outputScalar:"dtypes.O",HIDDEN:"args.hidden",VOCAB:"args.vocab",GROUP_SIZE:"args.groupSize",NUM_GROUPS:"args.hidden / args.groupSize",WORDS_PER_ROW:"args.hidden * args.bits / 32",VALS_PER_WORD:"32 / args.bits",BITS:"args.bits",MASK:"15 if args.bits == 4 else 3",ZP:"args.zeroPoint",EMBED_SCALE:"args.embedScale"},passes:[{id:"main",name:"QatEmbedGather",shader:"qat-embed-gather.wgsl.jinja",bindings:[{name:"ids",arg:"idsT",semantic:"Ids",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"y",arg:"yT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$O"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"seq",type:"u32",value:"args.seq"}]}}],dispatch:{x:"args.seq",y:1,z:1},reads:["Ids","Bits","Scale"],writes:["Out"]}]}]},assets:[["qat-embed-gather-norm.wgsl.jinja",`{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Fused decode (seq=1) embed gather + the first input_layernorm:
//   y[c]   = EMBED_SCALE * scale[id, g] * (q - ZP)            (the residual-stream row)
//   y2[c]  = srq(y[c] * inverseSqrt(mean(y^2) + EPS) * w[c], inScale)
//   sum_a  = sum_c y2[c]
// One single-workgroup dispatch performs both phases while the row is still in
// registers, avoiding an intermediate residual-stream read before the norm.
// y is still fully written: the PLE model-projection (DenseGemv) reads it.

const HIDDEN:        u32 = {{ HIDDEN }}u;
const VOCAB:         u32 = {{ VOCAB }}u;
const GROUP_SIZE:    u32 = {{ GROUP_SIZE }}u;
const NUM_GROUPS:    u32 = {{ NUM_GROUPS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const VALS_PER_WORD: u32 = {{ VALS_PER_WORD }}u;
const BITS:          u32 = {{ BITS }}u;
const MASK:          u32 = {{ MASK }}u;
const ZP:            f32 = {{ ZP }}.0;
const EMBED_SCALE:   f32 = {{ EMBED_SCALE }};
const EPS:           f32 = {{ EPS }};
const WG:            u32 = 256u;
// words and dequantized values per thread (the row stays register-resident between phases)
const KW: u32 = ({{ WORDS_PER_ROW }}u + WG - 1u) / WG;
const ELEMS: u32 = KW * VALS_PER_WORD;

{% if useSubgroups %}
var<workgroup> sgp: array<f32, WG / 32u>;

// Sum over each logical 32-lane block. sgExact32 (fixed 32-wide adapter) -> hardware
// subgroupAdd; otherwise a 32-lane subgroupShuffleXor butterfly that reduces each block
// independently, correct for any subgroup width >= 32 (NVIDIA D3D12 [32,128], AMD [32,64]).
// A bare subgroupAdd here would span multiple 32-blocks on a wider subgroup, and this
// WG=256 hybrid then stores that spanning sum into every sgp slot -> 2x/4x overcount.
fn sg_sum(value: f32) -> f32 {
{% if sgExact32 %}
  return subgroupAdd(value);
{% else %}
  var x = value;
  x = x + subgroupShuffleXor(x, 1u);
  x = x + subgroupShuffleXor(x, 2u);
  x = x + subgroupShuffleXor(x, 4u);
  x = x + subgroupShuffleXor(x, 8u);
  x = x + subgroupShuffleXor(x, 16u);
  return x;
{% endif %}
}

fn reduce_sum(value: f32, tid: u32) -> f32 {
  let s = sg_sum(value);
  if ((tid & 31u) == 0u) { sgp[tid >> 5u] = s; }
  workgroupBarrier();
  var total: f32 = 0.0;
  for (var i: u32 = 0u; i < WG / 32u; i = i + 1u) { total = total + sgp[i]; }
  workgroupBarrier();
  return total;
}
{% else %}
var<workgroup> partial: array<f32, WG>;

fn reduce_sum(value: f32, tid: u32) -> f32 {
  partial[tid] = value;
  workgroupBarrier();
  var stride = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { partial[tid] = partial[tid] + partial[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = partial[0];
  workgroupBarrier();
  return r;
}
{% endif %}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let tid = lid.x;
  let id = min(ids[0], VOCAB - 1u);
  let row_words_base: u32 = id * WORDS_PER_ROW;
  let row_scale_base: u32 = id * NUM_GROUPS;

  // --- gather + dequant phase (row kept in registers); sum of squares alongside ---
  var hloc: array<f32, ELEMS>;
  var acc: f32 = 0.0;
  for (var kw: u32 = 0u; kw < KW; kw = kw + 1u) {
    let w = tid + kw * WG;
    for (var v: u32 = 0u; v < VALS_PER_WORD; v = v + 1u) {
      var val: f32 = 0.0;
      if (w < WORDS_PER_ROW) {
        let packed: u32 = bits_buf[row_words_base + w];
        let c: u32 = w * VALS_PER_WORD + v;
        let g: u32 = c / GROUP_SIZE;
        let s: f32 = scale[row_scale_base + g];
        let q: f32 = f32((packed >> (v * BITS)) & MASK);
        val = EMBED_SCALE * s * (q - ZP);
        y[c] = val;
      }
      hloc[kw * VALS_PER_WORD + v] = val;
      acc = acc + val * val;
    }
  }
  let rms = inverseSqrt(reduce_sum(acc, tid) / f32(HIDDEN) + EPS);

  // --- norm + srq + quantized-sum phase (mirrors DecodeRmsSrq) ---
  let inScale = params.inScale;
  var qAcc: f32 = 0.0;
  for (var kw: u32 = 0u; kw < KW; kw = kw + 1u) {
    let w = tid + kw * WG;
    if (w < WORDS_PER_ROW) {
      let cBase = w * VALS_PER_WORD;
      for (var v: u32 = 0u; v < VALS_PER_WORD; v = v + 1u) {
        let c = cBase + v;
        let qv = srq(hloc[kw * VALS_PER_WORD + v] * rms * f32(wt[c]), inScale);
        y2[c] = qv;
        qAcc = qAcc + qv;
      }
    }
  }
  let qSum = reduce_sum(qAcc, tid);
  if (tid == 0u) {
    sum_a[0] = qSum;
  }
}
`],["qat-embed-gather.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Gather + dequantize a QAT-packed embedding row:
//   y[t, c] = EMBED_SCALE * scale[id, g] * (q - ZP)
// where id = ids[t], q is the LSB-first unpacked code, g = c / GROUP_SIZE.
// scale is a plain per-(row, group) table [vocab, NUM_GROUPS] (scale-only; the
// symmetric zero point ZP and the sqrt(dim) embedding scale are applied here).

const HIDDEN:        u32 = {{ HIDDEN }}u;
const VOCAB:         u32 = {{ VOCAB }}u;
const GROUP_SIZE:    u32 = {{ GROUP_SIZE }}u;
const NUM_GROUPS:    u32 = {{ NUM_GROUPS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const VALS_PER_WORD: u32 = {{ VALS_PER_WORD }}u;
const BITS:          u32 = {{ BITS }}u;
const MASK:          u32 = {{ MASK }}u;
const ZP:            f32 = {{ ZP }}.0;
const EMBED_SCALE:   f32 = {{ EMBED_SCALE }};
const WG: u32 = 64u;

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let t = wg.x;
  if (t >= params.seq) {
    return;
  }
  let id = ids[t];
  if (id >= VOCAB) {
    return;
  }

  let row_words_base:  u32 = id * WORDS_PER_ROW;
  let row_scale_base:  u32 = id * NUM_GROUPS;

  var w: u32 = lid.x;
  loop {
    if (w >= WORDS_PER_ROW) {
      break;
    }
    let packed: u32 = bits_buf[row_words_base + w];
    let colBase: u32 = w * VALS_PER_WORD;
    for (var v: u32 = 0u; v < VALS_PER_WORD; v = v + 1u) {
      let c: u32 = colBase + v;
      let g: u32 = c / GROUP_SIZE;
      let s: f32 = scale[row_scale_base + g];
      let q: f32 = f32((packed >> (v * BITS)) & MASK);
      y[t * HIDDEN + c] = {{ outputScalar }}(EMBED_SCALE * s * (q - ZP));
    }
    w = w + WG;
  }
}
`]]}],["com.xenova.gemma4.QatMatMul",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"QatMatMul",sinceVersion:1,inputs:[{role:"A",dtype:"T"},{role:"Bits",dtype:"uint32"},{role:"Scale",dtype:"float32"},{role:"SumA",dtype:"float32",optional:!0}],outputs:[{role:"Out",dtype:"O",shape:["args.M","args.outFeatures"]},{role:"CandVal",dtype:"float32",optional:!0,shape:["ceil(args.outFeatures / 128)"]},{role:"CandIdx",dtype:"uint32",optional:!0,shape:["ceil(args.outFeatures / 128)"]}],typeConstraints:{T:["float32","float16"],O:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},bitsT:{kind:"tensor",semantic:"Bits",role:"input"},scaleT:{kind:"tensor",semantic:"Scale",role:"input"},sumAT:{kind:"tensor",semantic:"SumA",role:"input",required:!1},outT:{kind:"tensor",semantic:"Out",role:"output"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"},bits:{kind:"u32",semantic:"bits"},zeroPoint:{kind:"u32",semantic:"zero_point"},mask:{kind:"u32",semantic:"mask"},inputScale:{kind:"f32",semantic:"input_activation_scale",required:!1},outputScale:{kind:"f32",semantic:"output_activation_scale",required:!1},blockMajor:{kind:"u32",semantic:"block_major_weights",required:!1},exact:{kind:"u32",semantic:"exact_reference_order",required:!1},candValT:{kind:"tensor",semantic:"CandVal",role:"output",required:!1},candIdxT:{kind:"tensor",semantic:"CandIdx",role:"output",required:!1},emitArgmax:{kind:"u32",semantic:"emit_argmax",required:!1},aGridScale:{kind:"f32",semantic:"input_grid_scale",required:!1}},bindingSets:{default:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sum_a",arg:"sumAT",semantic:"SumA",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"cand_val",arg:"candValT",semantic:"CandVal",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"cand_idx",arg:"candIdxT",semantic:"CandIdx",role:"output",buffer:{type:"storage"},elementType:"u32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"},{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}],set1:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"},{name:"invOutScale",type:"f32",value:"(1.0 / args.outputScale) if args.outputScale else 0.0"}]}}],set2:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sum_a",arg:"sumAT",semantic:"SumA",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"},{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}],set3:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"},{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"},{name:"aGridScale",type:"f32",value:"args.aGridScale if args.aGridScale else 0.0"}]}}],set4:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sum_a",arg:"sumAT",semantic:"SumA",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"},{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}],set5:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"},{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}],set6:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputScalar"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"partial_qa",semantic:"partial_qa",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"partial_a",semantic:"partial_a",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"}]}}],set7:[{name:"partial_qa",semantic:"partial_qa",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"partial_a",semantic:"partial_a",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}],set8:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$inputVec4"},{name:"bits_buf",arg:"bitsT",semantic:"Bits",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"scale",arg:"scaleT",semantic:"Scale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"out",arg:"outT",semantic:"Out",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"inScale",type:"f32",value:"args.inputScale if args.inputScale else 0.0"},{name:"outScale",type:"f32",value:"args.outputScale if args.outputScale else 0.0"}]}}]},variants:[{id:"fast_presrq_argmax",priority:11,when:'args.emitArgmax and present.candValT and present.candIdxT and numel(shapes.candValT) >= ceil(args.outFeatures / 128) and numel(shapes.candIdxT) >= ceil(args.outFeatures / 128) and (args.blockMajor and (present.sumAT and (args.bits == 2 or args.bits == 4) and args.M == 1 and args.inFeatures > 0 and args.inFeatures % (128 / args.bits) == 0 and (args.inFeatures * args.bits / 32) % 4 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16"))))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',PRESRQ:!0,IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",ZP:"args.zeroPoint",WG:128,COLS:1,GRID_X:"min(ceil(args.outFeatures / 128), 65535)",EMIT_ARGMAX:!0},passes:[{id:"main",name:"QatMatMulFastPresrqArgmax",shader:"qat-matmul-fast.wgsl.jinja",bindings:"default",dispatch:{x:"min(ceil(args.outFeatures / 128), 65535)",y:"ceil(ceil(args.outFeatures / 128) / min(ceil(args.outFeatures / 128), 65535))",z:1},reads:["A","Bits","Scale","SumA"],writes:["Out","CandVal","CandIdx"]}]},{id:"fast_presrq",priority:9,when:'(not args.emitArgmax) and (args.blockMajor and (present.sumAT and (args.bits == 2 or args.bits == 4) and args.M == 1 and args.inFeatures > 0 and args.inFeatures % (128 / args.bits) == 0 and (args.inFeatures * args.bits / 32) % 4 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16"))))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',PRESRQ:!0,IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",ZP:"args.zeroPoint",WG:128,COLS:1,GRID_X:"min(ceil(args.outFeatures / 128), 65535)"},passes:[{id:"main",name:"QatMatMulFastPresrq",shader:"qat-matmul-fast.wgsl.jinja",bindings:"set2",dispatch:{x:"min(ceil(args.outFeatures / 128), 65535)",y:"ceil(ceil(args.outFeatures / 128) / min(ceil(args.outFeatures / 128), 65535))",z:1},reads:["A","Bits","Scale","SumA"],writes:["Out"]}]},{id:"gemm_sgmat",priority:8,when:'(not args.exact) and ((not args.emitArgmax) and ((not args.blockMajor) and ((args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16"))))) and args.M >= 64 and args.inFeatures % 32 == 0 and args.outFeatures % 64 == 0 and (args.inputScale > 0 or args.aGridScale > 0) and device.features.has("shader-f16") and device.features.has("subgroups") and device.features.has("chromium-experimental-subgroup-matrix")',constants:{inputScalar:"dtypes.T",outputScalar:"dtypes.O",M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",ZP:"args.zeroPoint"},passes:[{id:"main",name:"QatMatMul",shader:"qat-matmul-sgmat.wgsl.jinja",bindings:"set3",dispatch:{x:"ceil(args.outFeatures / 64)",y:"ceil(args.M / 32)",z:1},reads:["A","Bits","Scale"],writes:["Out"]}]},{id:"gemm_presrq",priority:7,when:'(not args.exact) and ((not args.emitArgmax) and ((not args.blockMajor) and (present.sumAT and (args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.sumAT) >= args.M and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16")))) and args.M >= 64)',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",PRESRQ:!0,M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",ZP:"args.zeroPoint",GRID_X:"min(ceil(args.outFeatures / 32), 65535)",inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',THREADS_N:16,THREADS_M:16,N_PT:2,M_PT:2},passes:[{id:"main",name:"QatMatMulPresrq",shader:"qat-matmul-gemm.wgsl.jinja",bindings:"set4",dispatch:{x:"min(ceil(args.outFeatures / 32), 65535)",y:"ceil(ceil(args.outFeatures / 32) / min(ceil(args.outFeatures / 32), 65535))",z:"ceil(args.M / 32)"},reads:["A","Bits","Scale","SumA"],writes:["Out"]}]},{id:"scalar_presrq",priority:6,when:'(not args.emitArgmax) and ((not args.blockMajor) and (present.sumAT and (args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.sumAT) >= args.M and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16"))))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",PRESRQ:!0,M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:32,N_ROWS:"8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1)",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',GRID_X:"min(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))), 65535)",M_TILE:"8 if args.M >= 8 else (2 if args.M > 2 else args.M)",inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"'},passes:[{id:"main",name:"QatMatMulPresrq",shader:"qat-matmul.wgsl.jinja",bindings:"set4",dispatch:{x:"min(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))), 65535)",y:"ceil(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))) / min(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))), 65535))",z:"ceil(args.M / (8 if args.M >= 8 else (2 if args.M > 2 else args.M)))"},reads:["A","Bits","Scale","SumA"],writes:["Out"]}]},{id:"fast",priority:8,when:'(not args.emitArgmax) and (args.blockMajor and ((args.bits == 2 or args.bits == 4) and args.M == 1 and args.inFeatures > 0 and args.inFeatures % (128 / args.bits) == 0 and (args.inFeatures * args.bits / 32) % 4 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16"))))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",ZP:"args.zeroPoint",WG:128,GRID_X:"min(ceil(args.outFeatures / 128), 65535)"},passes:[{id:"main",name:"QatMatMulFast",shader:"qat-matmul-fast.wgsl.jinja",bindings:"set5",dispatch:{x:"min(ceil(args.outFeatures / 128), 65535)",y:"ceil(ceil(args.outFeatures / 128) / min(ceil(args.outFeatures / 128), 65535))",z:1},reads:["A","Bits","Scale"],writes:["Out"]}]},{id:"splitk",priority:5,when:'(not args.emitArgmax) and ((not args.blockMajor) and (args.bits == 2 and args.M == 1 and args.inFeatures >= 8192 and args.outFeatures > 0 and args.outFeatures <= 4096 and (args.inFeatures * args.bits / 32) % 4 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16"))))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",SPLIT:4,WG:32,N_ROWS:2,useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',GRID_X:"min(ceil(args.outFeatures / 2), 65535)"},intermediates:[{id:"partial_qa",dtype:"float32",shape:"[args.outFeatures * 4]"},{id:"partial_a",dtype:"float32",shape:"[4]"}],passes:[{id:"partial",name:"QatMatMulSplitKPartial",shader:"qat-matmul-splitk-partial.wgsl.jinja",bindings:"set6",dispatch:{x:"min(ceil(args.outFeatures / 2), 65535)",y:"ceil(ceil(args.outFeatures / 2) / min(ceil(args.outFeatures / 2), 65535))",z:4},reads:["A","Bits"],writes:["partial_qa","partial_a"]},{id:"merge",name:"QatMatMulSplitKMerge",shader:"qat-matmul-splitk-merge.wgsl.jinja",bindings:"set7",dispatch:{x:"ceil(args.outFeatures / 256)",y:1,z:1},reads:["partial_qa","partial_a","Scale"],writes:["Out"]}]},{id:"gemm",priority:2,when:'(not args.exact) and ((not args.emitArgmax) and ((not args.blockMajor) and ((args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16")))) and args.M >= 64)',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",ZP:"args.zeroPoint",GRID_X:"min(ceil(args.outFeatures / 32), 65535)",inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"',PRESRQ:!1,THREADS_N:16,THREADS_M:16,N_PT:2,M_PT:2},passes:[{id:"main",name:"QatMatMul",shader:"qat-matmul-gemm.wgsl.jinja",bindings:"set8",dispatch:{x:"min(ceil(args.outFeatures / 32), 65535)",y:"ceil(ceil(args.outFeatures / 32) / min(ceil(args.outFeatures / 32), 65535))",z:"ceil(args.M / 32)"},reads:["A","Bits","Scale"],writes:["Out"]}]},{id:"scalar",priority:0,when:'(not args.emitArgmax) and ((not args.blockMajor) and ((args.bits == 2 or args.bits == 4) and args.M > 0 and args.inFeatures > 0 and args.outFeatures > 0 and (args.inFeatures * args.bits) % 32 == 0 and args.zeroPoint > 0 and args.mask > 0 and numel(shapes.aT) >= args.M * args.inFeatures and numel(shapes.bitsT) >= args.outFeatures * (args.inFeatures * args.bits / 32) and numel(shapes.scaleT) >= args.outFeatures and numel(shapes.outT) >= args.M * args.outFeatures and (tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16") and (tensorDtypes.outT == "float32" or tensorDtypes.outT == "float16") and ((tensorDtypes.aT != "float16" and tensorDtypes.outT != "float16") or device.features.has("shader-f16"))))',constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.outT == "float16"',inputScalar:"dtypes.T",outputScalar:"dtypes.O",M:"args.M",IN_FEATURES:"args.inFeatures",OUT_FEATURES:"args.outFeatures",BITS:"args.bits",VALS_PER_WORD:"32 / args.bits",CHUNKS:"8 / args.bits",WORDS_PER_ROW:"args.inFeatures * args.bits / 32",MASK:"args.mask",ZP:"args.zeroPoint",WG:32,N_ROWS:"8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1)",useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',GRID_X:"min(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))), 65535)",M_TILE:"8 if args.M >= 8 else (2 if args.M > 2 else args.M)",inputVec4:'"vec4<f16>" if dtypes.T == "f16" else "vec4<f32>"'},passes:[{id:"main",name:"QatMatMul",shader:"qat-matmul.wgsl.jinja",bindings:"set8",dispatch:{x:"min(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))), 65535)",y:"ceil(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))) / min(ceil(args.outFeatures / (8 if args.outFeatures >= 32768 else (2 if args.outFeatures >= 1024 else 1))), 65535))",z:"ceil(args.M / (8 if args.M >= 8 else (2 if args.M > 2 else args.M)))"},reads:["A","Bits","Scale"],writes:["Out"]}]}]},assets:[["qat-matmul-fast.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// QAT GEMV specialization (M=1 decode):
//   - thread-per-column: each thread computes COLS full output columns with f32 accumulators and
//     no cross-thread reduction;
//   - the packed weight is read as vec4<u32> (128-bit loads) and dequantized with unpack4xU8.
// Per-row scale (one scale per output column) and a fixed integer ZP, matching the QAT checkpoint.
//
// Presrq stream path:
//   - the activation arrives already srq'd with its row sum (sum_a), so the dot uses the
//     unsigned codes (no per-value -ZP vec subs); the ZP correction folds into the epilogue:
//     sum_k (q-ZP)*a = sum_k q*a - ZP*sum_a, matching the scalar presrq algebra;
//   - activations are read as vec4 directly from device memory, so no workgroup
//     activation tile is needed;
//   - the block dot is fully unrolled with per-word partial sums combined as a tree, which
//     shortens the serial FMA dependency chain.
const K: u32 = {{ IN_FEATURES }}u;
const N: u32 = {{ OUT_FEATURES }}u;
const BITS: u32 = {{ BITS }}u;
const ZP: f32 = {{ ZP }}.0;
const TILE_N: u32 = {{ WG }}u;                  // threads per workgroup
const VPV: u32 = 128u / {{ BITS }}u;            // weight values per vec4<u32> (32 for 4-bit, 64 for 2-bit)
const NUM_BLK: u32 = {{ WORDS_PER_ROW }}u / 4u; // vec4<u32> blocks per output row (== K / VPV)
const GRID_X: u32 = {{ GRID_X }}u;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

{% if PRESRQ %}
const COLS: u32 = {{ COLS }}u;                  // output columns per thread
const K4: u32 = K / 4u;

{% if EMIT_ARGMAX %}
// ArgMax fold (decode lm_head): each workgroup owns a contiguous TILE_N*COLS
// column range, so it can emit its local (max, first-index) candidate from the
// epilogue. The ArgMax finalize pass reduces these candidates.
// Tie semantics match the two-pass ArgMax exactly: ranges are contiguous and in order, the
// in-thread scan goes up in column order with strict >, and both trees tie-break on lower index.
const NEG_INF: f32 = -3.4028234663852886e38;
var<workgroup> wgVal: array<f32, TILE_N>;
var<workgroup> wgIdx: array<u32, TILE_N>;
{% endif %}

// Unsigned-code dot over one vec4<u32> weight block (VPV values) against vec4
// activation reads straight from device memory. No workgroup a_tile is used.
// aBase is in vec4 units (block * VPV/4).
//
// Unorm conversion fold: code lanes are produced by unpack4x8unorm, which yields
// fl(code / 255). The x255 decode is undone once per column in the epilogue.
// Lane values are c/255-rounded; reference-parity paths use the exact kernels.
fn block_dot(bv: vec4<u32>, aBase: u32) -> f32 {
{% if BITS == 4 %}
{% for j in range(4) %}
  let p{{ j }} = bv[{{ j }}u];
  let lo{{ j }} = unpack4x8unorm(p{{ j }} & 0x0F0F0F0Fu);
  let hi{{ j }} = unpack4x8unorm((p{{ j }} >> 4u) & 0x0F0F0F0Fu);
  let s{{ j }} = dot(vec4<f32>(lo{{ j }}.x, hi{{ j }}.x, lo{{ j }}.y, hi{{ j }}.y), vec4<f32>(a[aBase + {{ j * 2 }}u]))
               + dot(vec4<f32>(lo{{ j }}.z, hi{{ j }}.z, lo{{ j }}.w, hi{{ j }}.w), vec4<f32>(a[aBase + {{ j * 2 + 1 }}u]));
{% endfor %}
{% else %}
{% for j in range(4) %}
  let p{{ j }} = bv[{{ j }}u];
  let d0{{ j }} = unpack4x8unorm(p{{ j }} & 0x03030303u);
  let d1{{ j }} = unpack4x8unorm((p{{ j }} >> 2u) & 0x03030303u);
  let d2{{ j }} = unpack4x8unorm((p{{ j }} >> 4u) & 0x03030303u);
  let d3{{ j }} = unpack4x8unorm((p{{ j }} >> 6u) & 0x03030303u);
  let s{{ j }} = (dot(vec4<f32>(d0{{ j }}.x, d1{{ j }}.x, d2{{ j }}.x, d3{{ j }}.x), vec4<f32>(a[aBase + {{ j * 4 }}u]))
                + dot(vec4<f32>(d0{{ j }}.y, d1{{ j }}.y, d2{{ j }}.y, d3{{ j }}.y), vec4<f32>(a[aBase + {{ j * 4 + 1 }}u])))
               + (dot(vec4<f32>(d0{{ j }}.z, d1{{ j }}.z, d2{{ j }}.z, d3{{ j }}.z), vec4<f32>(a[aBase + {{ j * 4 + 2 }}u]))
                + dot(vec4<f32>(d0{{ j }}.w, d1{{ j }}.w, d2{{ j }}.w, d3{{ j }}.w), vec4<f32>(a[aBase + {{ j * 4 + 3 }}u])));
{% endfor %}
{% endif %}
  return (s0 + s1) + (s2 + s3);
}

@compute @workgroup_size(TILE_N, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let colBase = (wg.y * GRID_X + wg.x) * (TILE_N * COLS) + lid.x;

{% for c in range(COLS) %}
  let col{{ c }} = colBase + {{ c }}u * TILE_N;
  var acc{{ c }}: f32 = 0.0;
{% endfor %}

  // BLOCK-MAJOR weights (repacked at load): block b of every column is contiguous, so the
  // TILE_N threads of this workgroup read consecutive vec4<u32>s \u2014 fully coalesced (one
  // contiguous run per column slot).
  var blk: u32 = 0u;
  loop {
    if (blk >= NUM_BLK) { break; }
    let aBase = blk * (VPV / 4u);
{% for c in range(COLS) %}
    if (col{{ c }} < N) {
      acc{{ c }} = acc{{ c }} + block_dot(bits_buf[blk * N + col{{ c }}], aBase);
    }
{% endfor %}
    blk = blk + 1u;
  }

  let zpA = ZP * sum_a[0];
{% if EMIT_ARGMAX %}
  var bestVal: f32 = NEG_INF;
  var bestIdx: u32 = 0u;
{% endif %}
{% for c in range(COLS) %}
  if (col{{ c }} < N) {
    // x255 undoes the unorm 1/255 decode scale once per column.
    let v{{ c }} = {{ outputScalar }}(srq(scale[col{{ c }}] * fma(acc{{ c }}, 255.0, -zpA), params.outScale));
    out[col{{ c }}] = v{{ c }};
{% if EMIT_ARGMAX %}
    // Strict > over ascending columns keeps the FIRST index on ties (compare the stored
    // value so the candidate agrees bit-for-bit with the logits buffer).
    if (f32(v{{ c }}) > bestVal) {
      bestVal = f32(v{{ c }});
      bestIdx = col{{ c }};
    }
{% endif %}
  }
{% endfor %}
{% if EMIT_ARGMAX %}
  wgVal[lid.x] = bestVal;
  wgIdx[lid.x] = bestIdx;
  workgroupBarrier();
  var stride: u32 = TILE_N / 2u;
  loop {
    if (stride == 0u) { break; }
    if (lid.x < stride) {
      let o = lid.x + stride;
      if (wgVal[o] > wgVal[lid.x] || (wgVal[o] == wgVal[lid.x] && wgIdx[o] < wgIdx[lid.x])) {
        wgVal[lid.x] = wgVal[o];
        wgIdx[lid.x] = wgIdx[o];
      }
    }
    stride = stride / 2u;
    workgroupBarrier();
  }
  if (lid.x == 0u) {
    let wgId = wg.y * GRID_X + wg.x;
    cand_val[wgId] = wgVal[0];
    cand_idx[wgId] = wgIdx[0];
  }
{% endif %}
}
{% else %}
var<workgroup> a_tile: array<f32, K>;

fn block_dot(bv: vec4<u32>, aBase: u32) -> f32 {
  var s: f32 = 0.0;
  for (var j: u32 = 0u; j < 4u; j = j + 1u) {
    let packed = bv[j];
{% if BITS == 4 %}
    let lo = vec4<f32>(unpack4xU8(packed & 0x0F0F0F0Fu)) - vec4<f32>(ZP);
    let hi = vec4<f32>(unpack4xU8((packed >> 4u) & 0x0F0F0F0Fu)) - vec4<f32>(ZP);
    let base = aBase + j * 8u;
    s = s + dot(vec4<f32>(lo.x, hi.x, lo.y, hi.y), vec4<f32>(a_tile[base], a_tile[base + 1u], a_tile[base + 2u], a_tile[base + 3u]))
          + dot(vec4<f32>(lo.z, hi.z, lo.w, hi.w), vec4<f32>(a_tile[base + 4u], a_tile[base + 5u], a_tile[base + 6u], a_tile[base + 7u]));
{% else %}
    let d0 = vec4<f32>(unpack4xU8(packed & 0x03030303u)) - vec4<f32>(ZP);
    let d1 = vec4<f32>(unpack4xU8((packed >> 2u) & 0x03030303u)) - vec4<f32>(ZP);
    let d2 = vec4<f32>(unpack4xU8((packed >> 4u) & 0x03030303u)) - vec4<f32>(ZP);
    let d3 = vec4<f32>(unpack4xU8((packed >> 6u) & 0x03030303u)) - vec4<f32>(ZP);
    let base = aBase + j * 16u;
    s = s + dot(vec4<f32>(d0.x, d1.x, d2.x, d3.x), vec4<f32>(a_tile[base], a_tile[base + 1u], a_tile[base + 2u], a_tile[base + 3u]))
          + dot(vec4<f32>(d0.y, d1.y, d2.y, d3.y), vec4<f32>(a_tile[base + 4u], a_tile[base + 5u], a_tile[base + 6u], a_tile[base + 7u]))
          + dot(vec4<f32>(d0.z, d1.z, d2.z, d3.z), vec4<f32>(a_tile[base + 8u], a_tile[base + 9u], a_tile[base + 10u], a_tile[base + 11u]))
          + dot(vec4<f32>(d0.w, d1.w, d2.w, d3.w), vec4<f32>(a_tile[base + 12u], a_tile[base + 13u], a_tile[base + 14u], a_tile[base + 15u]));
{% endif %}
  }
  return s;
}

@compute @workgroup_size(TILE_N, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let col = (wg.y * GRID_X + wg.x) * TILE_N + lid.x;
  let inScale = params.inScale;

  var id: u32 = lid.x;
  loop {
    if (id >= K) { break; }
    a_tile[id] = srq(f32(a[id]), inScale);
    id = id + TILE_N;
  }
  workgroupBarrier();

  if (col < N) {
    // BLOCK-MAJOR weights (repacked at load): block b of every column is contiguous, so the
    // TILE_N threads of this workgroup read consecutive vec4<u32>s \u2014 fully coalesced.
    var acc: f32 = 0.0;
    var blk: u32 = 0u;
    loop {
      if (blk >= NUM_BLK) { break; }
      acc = acc + block_dot(bits_buf[blk * N + col], blk * VPV);
      blk = blk + 1u;
    }
    out[col] = {{ outputScalar }}(srq(scale[col] * acc, params.outScale));
  }
}
{% endif %}
`],["qat-matmul-gemm.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Register-blocked presrq GEMM tile for prefill (M >= 16): each thread owns an
// N_PT x M_PT accumulator block and runs the full serial k-loop, so every
// weight word is loaded and dequanted once for all M token rows. Weight lanes come from
// unpack4x8unorm (one packed conversion per 4 lanes = fl(code/255));
// the x255 decode is undone once per (m,o) in the epilogue: srq(scale*fma(acc,255,-ZP*sumA)).
// Geometry: 16x16 threads, 2n x 2m per thread -> 32n x 32m per workgroup.
// presrq contract: \`a\` already int8-grid values, sum_a[m] = its per-row sum (division-free).

const M: u32 = {{ M }}u;
const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const BITS: u32 = {{ BITS }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const ZP: f32 = {{ ZP }}.0;
const GRID_X: u32 = {{ GRID_X }}u;
const THREADS_N: u32 = {{ THREADS_N }}u;
const THREADS_M: u32 = {{ THREADS_M }}u;
const N_PT: u32 = {{ N_PT }}u;
const M_PT: u32 = {{ M_PT }}u;
const TILE_N: u32 = THREADS_N * N_PT;
const TILE_M: u32 = THREADS_M * M_PT;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

@compute @workgroup_size({{ THREADS_N * THREADS_M }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  let tid = lid.x;
  let nSub = tid % THREADS_N;
  let mSub = tid / THREADS_N;
  let nBase = wgId * TILE_N + nSub * N_PT;
  let mBase = wg.z * TILE_M + mSub * M_PT;
  let outScale = params.outScale;
{% if not PRESRQ %}
  let inScale = params.inScale;
{% endif %}

{% for n in range(N_PT) %}
  let ro{{ n }} = nBase + {{ n }}u;
{% endfor %}
{% for mi in range(M_PT) %}
  let mr{{ mi }} = mBase + {{ mi }}u;
  let aBase{{ mi }} = min(mr{{ mi }}, M - 1u) * (IN_FEATURES / 4u);
{% endfor %}
{% for n in range(N_PT) %}{% for mi in range(M_PT) %}
  var acc_{{ n }}_{{ mi }}: f32 = 0.0;
{% endfor %}{% endfor %}
{% if not PRESRQ %}
{% for mi in range(M_PT) %}
  var sA_{{ mi }}: f32 = 0.0;
{% endfor %}
{% endif %}

  var w: u32 = 0u;
  loop {
    if (w >= WORDS_PER_ROW) { break; }
{% for n in range(N_PT) %}
    var p{{ n }}: u32 = 0u;
    if (ro{{ n }} < OUT_FEATURES) { p{{ n }} = bits_buf[ro{{ n }} * WORDS_PER_ROW + w]; }
{% if BITS == 4 %}
    let lo{{ n }} = unpack4x8unorm(p{{ n }} & 0x0F0F0F0Fu);
    let hi{{ n }} = unpack4x8unorm((p{{ n }} >> 4u) & 0x0F0F0F0Fu);
    let q{{ n }}_0 = vec4<f32>(lo{{ n }}.x, hi{{ n }}.x, lo{{ n }}.y, hi{{ n }}.y);
    let q{{ n }}_1 = vec4<f32>(lo{{ n }}.z, hi{{ n }}.z, lo{{ n }}.w, hi{{ n }}.w);
{% else %}
    let e0{{ n }} = unpack4x8unorm(p{{ n }} & 0x03030303u);
    let e1{{ n }} = unpack4x8unorm((p{{ n }} >> 2u) & 0x03030303u);
    let e2{{ n }} = unpack4x8unorm((p{{ n }} >> 4u) & 0x03030303u);
    let e3{{ n }} = unpack4x8unorm((p{{ n }} >> 6u) & 0x03030303u);
    let q{{ n }}_0 = vec4<f32>(e0{{ n }}.x, e1{{ n }}.x, e2{{ n }}.x, e3{{ n }}.x);
    let q{{ n }}_1 = vec4<f32>(e0{{ n }}.y, e1{{ n }}.y, e2{{ n }}.y, e3{{ n }}.y);
    let q{{ n }}_2 = vec4<f32>(e0{{ n }}.z, e1{{ n }}.z, e2{{ n }}.z, e3{{ n }}.z);
    let q{{ n }}_3 = vec4<f32>(e0{{ n }}.w, e1{{ n }}.w, e2{{ n }}.w, e3{{ n }}.w);
{% endif %}
{% endfor %}
{% for mi in range(M_PT) %}
    {
{% if PRESRQ %}
{% for c in range(CHUNKS) %}
      let a{{ mi }}_{{ c }} = vec4<f32>(a[aBase{{ mi }} + w * CHUNKS + {{ c }}u]);
{% endfor %}
{% else %}
{% for c in range(CHUNKS) %}
      let a{{ mi }}_{{ c }} = srq4(vec4<f32>(a[aBase{{ mi }} + w * CHUNKS + {{ c }}u]), inScale);
      sA_{{ mi }} = sA_{{ mi }} + a{{ mi }}_{{ c }}.x + a{{ mi }}_{{ c }}.y + a{{ mi }}_{{ c }}.z + a{{ mi }}_{{ c }}.w;
{% endfor %}
{% endif %}
{% for n in range(N_PT) %}{% for c in range(CHUNKS) %}
      acc_{{ n }}_{{ mi }} = acc_{{ n }}_{{ mi }} + dot(q{{ n }}_{{ c }}, a{{ mi }}_{{ c }});
{% endfor %}{% endfor %}
    }
{% endfor %}
    w = w + 1u;
  }

{% for mi in range(M_PT) %}
  if (mr{{ mi }} < M) {
{% if PRESRQ %}
    let rA{{ mi }} = ZP * sum_a[mr{{ mi }}];
{% else %}
    let rA{{ mi }} = ZP * sA_{{ mi }};
{% endif %}
{% for n in range(N_PT) %}
    if (ro{{ n }} < OUT_FEATURES) {
      out[mr{{ mi }} * OUT_FEATURES + ro{{ n }}] = {{ outputScalar }}(srq(scale[ro{{ n }}] * fma(acc_{{ n }}_{{ mi }}, 255.0, -rA{{ mi }}), outScale));
    }
{% endfor %}
  }
{% endfor %}
}
`],["qat-matmul-sgmat.wgsl.jinja",`enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);

{{ env.wgsl.resourceDeclarations }}

// Subgroup-matrix quantized prefill GEMM (M >= 64), computed in the integer
// code domain: the B-tile loader dequants packed {{ BITS }}-bit words to
// (code - ZP) f16 values (small integers, exactly representable), the A-tile
// loader recovers int8 activation codes via round(a / s) (a is an SRQ grid
// value, so the rounding is exact), and 8x8 f16
// MMAs accumulate into f32. Products are bounded by |w-ZP| * 127 and K <= 12288,
// so the f32 accumulator stays inside the exact-integer range. The per-row
// weight scale and the activation grid scale fold into the epilogue:
// out = srq(scale[o] * (gridScale * acc), outScale). No sumA correction is
// needed since ZP is subtracted during dequant.
//
// Tile geometry: 128-thread workgroup = 4 subgroups, each owning a 16x32 output
// subtile (2x4 of 8x8 result matrices). TILE = 32 M x 64 N x 32 K; A/B tiles
// are staged in workgroup memory as f16.

const IN_F:      u32 = {{ IN_FEATURES }}u;
const OUT_F:     u32 = {{ OUT_FEATURES }}u;
const M_TOTAL:   u32 = {{ M }}u;
const WPR:       u32 = {{ WORDS_PER_ROW }}u;
const ZP:        f32 = {{ ZP }}.0;
const TILE_COLS: u32 = 64u;
const TILE_ROWS: u32 = 32u;
const TILE_K:    u32 = 32u;
const SUB_COLS:  u32 = 32u;
const SUB_ROWS:  u32 = 16u;

var<workgroup> tile_A: array<f16, 32 * 32>;
var<workgroup> tile_B: array<f16, 64 * 32>;
var<workgroup> scratch: array<array<f32, 64>, 4>;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

// A tile: 32 m-rows x 32 k of activation codes. \`a\` holds SRQ grid values (pre-quantized via
// SrqQuantize with grid scale aGridScale, or raw with in-kernel quantization via inScale);
// either way code = clamp(round(a / s), -128, 127), exact for grid inputs.
fn loadSHMA(tile_base: u32, k_idx: u32, row: u32, c_idx: u32, invS: f32) {
  let a_global: u32 = tile_base + row;
  let col: u32 = c_idx * 8u;
  for (var col_offset: u32 = 0u; col_offset < 8u; col_offset++) {
    let k: u32 = k_idx + col + col_offset;
    var code: f32 = 0.0;
    if (a_global < M_TOTAL) {
      code = clamp(round(f32(a[a_global * IN_F + k]) * invS), -128.0, 127.0);
    }
    tile_A[row * TILE_K + col + col_offset] = f16(code);
  }
}

// B tile: 64 output rows x 32 k of (code - ZP) f16 values dequanted from the packed words.
// Word w of row o covers k = w * VPW .. +VPW-1 in the kernel plane order.
fn loadSHMB(tile_base: u32, k_idx: u32, lin: u32) {
{% if BITS == 4 %}
  // 4 words per row-tile (32 k / 8 vals); 64 rows x 4 = 256 words over 128 threads = 2 each.
  for (var i: u32 = 0u; i < 2u; i++) {
    let lin2 = lin + i * 128u;
    let r = lin2 / 4u;
    let w = lin2 % 4u;
    let p = bits_buf[(tile_base + r) * WPR + (k_idx / 8u) + w];
    let kb = r * TILE_K + w * 8u;
    for (var j: u32 = 0u; j < 8u; j++) {
      let code = f32((p >> (8u * (j >> 1u) + 4u * (j & 1u))) & 0xFu);
      tile_B[kb + j] = f16(code - ZP);
    }
  }
{% else %}
  // 2 words per row-tile (32 k / 16 vals); 128 words over 128 threads = 1 each.
  let r = lin / 2u;
  let w = lin % 2u;
  let p = bits_buf[(tile_base + r) * WPR + (k_idx / 16u) + w];
  let kb = r * TILE_K + w * 16u;
  for (var j: u32 = 0u; j < 16u; j++) {
    let code = f32((p >> (8u * (j >> 2u) + 2u * (j & 3u))) & 0x3u);
    tile_B[kb + j] = f16(code - ZP);
  }
{% endif %}
}

fn storeOutput(offset: u32, row: u32, col: u32, src_slot: u32, row_limit: i32, col_base: u32, effScale: f32) {
  if (row_limit > 0 && row < u32(row_limit)) {
    let outScale = params.outScale;
    let c1 = scratch[src_slot][row * 8u + col];
    let c2 = scratch[src_slot][row * 8u + col + 1u];
    out[offset + row * OUT_F + col] = {{ outputScalar }}(srq(scale[col_base + col] * (c1 * effScale), outScale));
    out[offset + row * OUT_F + col + 1u] = {{ outputScalar }}(srq(scale[col_base + col + 1u] * (c2 * effScale), outScale));
  }
}

@compute @workgroup_size(128, 1, 1)
fn main(
  @builtin(workgroup_id) workgroup_id: vec3<u32>,
  @builtin(local_invocation_index) local_idx: u32,
  @builtin(subgroup_invocation_id) sg_id: u32,
  @builtin(subgroup_size) sg_size: u32
) {
  let a_global_base: u32 = workgroup_id.y * TILE_ROWS;
  let w_global_base: u32 = workgroup_id.x * TILE_COLS;

  // Activation code scale: in-kernel SRQ (inScale) or the producer's grid scale (aGridScale).
  let sEff = select(params.aGridScale, params.inScale, params.inScale != 0.0);
  let invS = 1.0 / sEff;

  let subtile_id: u32 = local_idx / sg_size;
  let subtile_idx: u32 = subtile_id / 2u;
  let subtile_idy: u32 = subtile_id % 2u;
  let base_A: u32 = subtile_idy * SUB_ROWS;
  let base_B: u32 = subtile_idx * SUB_COLS;

  var matC00: subgroup_matrix_result<f32, 8, 8>;
  var matC01: subgroup_matrix_result<f32, 8, 8>;
  var matC02: subgroup_matrix_result<f32, 8, 8>;
  var matC03: subgroup_matrix_result<f32, 8, 8>;
  var matC10: subgroup_matrix_result<f32, 8, 8>;
  var matC11: subgroup_matrix_result<f32, 8, 8>;
  var matC12: subgroup_matrix_result<f32, 8, 8>;
  var matC13: subgroup_matrix_result<f32, 8, 8>;

  for (var kidx: u32 = 0u; kidx < IN_F; kidx += TILE_K) {
    loadSHMA(a_global_base, kidx, local_idx / 4u, local_idx % 4u, invS);
    loadSHMB(w_global_base, kidx, local_idx);
    workgroupBarrier();

    for (var step: u32 = 0u; step < TILE_K; step += 8u) {
      let matrix_a_offset: u32 = subtile_idy * SUB_ROWS * TILE_K + step;
      var matA0: subgroup_matrix_left<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, matrix_a_offset, false, TILE_K);
      var matA1: subgroup_matrix_left<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_left<f16, 8, 8>>(&tile_A, matrix_a_offset + 8u * TILE_K, false, TILE_K);

      let matrix_b_offset: u32 = subtile_idx * SUB_COLS * TILE_K + step;
      var matB0: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset, true, TILE_K);
      var matB1: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset +  8u * TILE_K, true, TILE_K);
      var matB2: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset + 16u * TILE_K, true, TILE_K);
      var matB3: subgroup_matrix_right<f16, 8, 8> = subgroupMatrixLoad<subgroup_matrix_right<f16, 8, 8>>(&tile_B, matrix_b_offset + 24u * TILE_K, true, TILE_K);

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

  let row: u32 = sg_id / 4u;
  let col: u32 = (sg_id % 4u) * 2u;
  var matrix_c_offset: u32 = (a_global_base + base_A) * OUT_F + w_global_base + base_B;
  var col_base: u32 = w_global_base + base_B;
  var row_limit: i32 = i32(M_TOTAL) - i32(a_global_base + base_A);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC00, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit, col_base, sEff);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC01, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit, col_base + 8u, sEff);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC02, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit, col_base + 16u, sEff);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC03, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit, col_base + 24u, sEff);

  matrix_c_offset = matrix_c_offset + 8u * OUT_F;
  row_limit = i32(M_TOTAL) - i32(a_global_base + base_A + 8u);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC10, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit, col_base, sEff);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC11, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit, col_base + 8u, sEff);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC12, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit, col_base + 16u, sEff);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC13, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit, col_base + 24u, sEff);
}
`],["qat-matmul-splitk-merge.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Split-K merge pass: sum the SPLIT partial sums per output row, then apply scale[o], the ZP term
// and the output SRQ. One thread per output row.

const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const SPLIT: u32 = {{ SPLIT }}u;
const ZP: f32 = {{ ZP }}.0;
const WG: u32 = 256u;

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let o = gid.x;
  if (o >= OUT_FEATURES) { return; }

  var qSum: f32 = 0.0;
  for (var c: u32 = 0u; c < SPLIT; c = c + 1u) {
    qSum = qSum + partial_qa[o * SPLIT + c];
  }
  var aSum: f32 = 0.0;
  for (var c: u32 = 0u; c < SPLIT; c = c + 1u) {
    aSum = aSum + partial_a[c];
  }
  out[o] = {{ outputScalar }}(srq(scale[o] * (qSum - ZP * aSum), params.outScale));
}
`],["qat-matmul-splitk-partial.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Split-K partial pass of QatMatMul (M=1 decode). The K reduction is split into
// SPLIT contiguous chunks, each handled by a separate workgroup per output group.
// Each (outputGroup, chunk) workgroup writes partial integer-ish sums; the merge
// pass sums over chunks and applies the per-row scale + ZP + SRQ. Bit-identical
// to the scalar path because the partial sums are exact.

const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const BITS: u32 = {{ BITS }}u;
const VALS_PER_WORD: u32 = {{ VALS_PER_WORD }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const WORDS_PER_CHUNK: u32 = {{ WORDS_PER_ROW }}u / {{ SPLIT }}u;
const MASK: u32 = {{ MASK }}u;
const SPLIT: u32 = {{ SPLIT }}u;
const GRID_X: u32 = {{ GRID_X }}u;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;

{% if not useSubgroups %}
var<workgroup> red: array<f32, WG>;
{% endif %}

fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) { return x; }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

fn reduce(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  red[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { red[tid] = red[tid] + red[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = red[0];
  workgroupBarrier();
  return r;
{% endif %}
}

@compute @workgroup_size({{ WG }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let g = wg.y * GRID_X + wg.x;       // output-row group
  let chunk = wg.z;                   // K chunk
  let rowBase = g * N_ROWS;
  if (rowBase >= OUT_FEATURES) { return; }
  let tid = lid.x;
  let inScale = params.inScale;

  let wStart = chunk * WORDS_PER_CHUNK;
  let wEnd = wStart + WORDS_PER_CHUNK;

  var sumQA: array<f32, N_ROWS>;
  for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { sumQA[r] = 0.0; }
  var sumA: f32 = 0.0;

  var w: u32 = wStart + tid;
  loop {
    if (w >= wEnd) { break; }
    let colBase: u32 = w * VALS_PER_WORD;
    var avc: array<vec4<f32>, CHUNKS>;
    for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
      let b = colBase + c * 4u;
      let a4 = vec4<f32>(
        srq(f32(a[b]), inScale),
        srq(f32(a[b + 1u]), inScale),
        srq(f32(a[b + 2u]), inScale),
        srq(f32(a[b + 3u]), inScale));
      avc[c] = a4;
      sumA = sumA + a4.x + a4.y + a4.z + a4.w;
    }
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let o = rowBase + r;
      if (o < OUT_FEATURES) {
        let packed: u32 = bits_buf[o * WORDS_PER_ROW + w];
        for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
          let sh = (vec4<u32>(0u, 1u, 2u, 3u) + c * 4u) * BITS;
          let q4 = vec4<f32>((vec4<u32>(packed) >> sh) & vec4<u32>(MASK));
          sumQA[r] = sumQA[r] + dot(q4, avc[c]);
        }
      }
    }
    w = w + WG;
  }

  let rA = reduce(sumA, tid);
  for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
    let rQA = reduce(sumQA[r], tid);
    let o = rowBase + r;
    if (tid == 0u && o < OUT_FEATURES) {
      partial_qa[o * SPLIT + chunk] = rQA;
    }
  }
  // sumA is independent of the output row; one workgroup per chunk records it.
  if (g == 0u && tid == 0u) {
    partial_a[chunk] = rA;
  }
}
`],["qat-matmul.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{% if useSubgroups %}
enable subgroups;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Weight-only QAT matmul: out[m, o] = scale[o] * sum_k (q[o,k] - ZP) * a[m,k]
//   = scale[o] * (sum_k q[o,k]*a[m,k] - ZP * sum_k a[m,k])
// One workgroup (= one subgroup, WG=32) computes N_ROWS output rows. Threads
// split K so adjacent threads read adjacent packed weight words (coalesced);
// the K-reduction uses subgroupAdd (zero barriers). The activation value for
// each column is read once per word and reused across the N_ROWS rows in
// registers, without staging a workgroup activation tile.
// N_ROWS is specialized per output width: 1 for small-outF matmuls, >1 when
// the activation read can be shared across multiple output rows. vec4 unpack:
// 4 values per dot().

const M: u32 = {{ M }}u;
const M_TILE: u32 = {{ M_TILE }}u;
const IN_FEATURES: u32 = {{ IN_FEATURES }}u;
const OUT_FEATURES: u32 = {{ OUT_FEATURES }}u;
const BITS: u32 = {{ BITS }}u;
const VALS_PER_WORD: u32 = {{ VALS_PER_WORD }}u;
const CHUNKS: u32 = {{ CHUNKS }}u;
const WORDS_PER_ROW: u32 = {{ WORDS_PER_ROW }}u;
const MASK: u32 = {{ MASK }}u;
const ZP: f32 = {{ ZP }}.0;
const GRID_X: u32 = {{ GRID_X }}u;
const WG: u32 = {{ WG }}u;
const N_ROWS: u32 = {{ N_ROWS }}u;

{% if not useSubgroups %}
var<workgroup> pQA: array<f32, WG>;
var<workgroup> pA: array<f32, WG>;
{% endif %}

// Static Range Quantization: round-trip through an int8 grid (no-op when scale==0).
fn srq(x: f32, s: f32) -> f32 {
  if (s == 0.0) {
    return x;
  }
  return clamp(round(x / s), -128.0, 127.0) * s;
}

// Componentwise srq over a vec4 (bit-identical to 4 scalar srq calls).
fn srq4(x: vec4<f32>, s: f32) -> vec4<f32> {
  if (s == 0.0) {
    return x;
  }
  return clamp(round(x / s), vec4<f32>(-128.0), vec4<f32>(127.0)) * s;
}

fn reduce(value: f32, tid: u32) -> f32 {
{% if useSubgroups %}
  return subgroupAdd(value);
{% else %}
  pQA[tid] = value;
  workgroupBarrier();
  var stride: u32 = WG / 2u;
  loop {
    if (stride == 0u) { break; }
    if (tid < stride) { pQA[tid] = pQA[tid] + pQA[tid + stride]; }
    stride = stride / 2u;
    workgroupBarrier();
  }
  let r = pQA[0];
  workgroupBarrier();
  return r;
{% endif %}
}

@compute @workgroup_size({{ WG }}, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wgId = wg.y * GRID_X + wg.x;
  let rowBase = wgId * N_ROWS;
  if (rowBase >= OUT_FEATURES) {
    return;
  }
  let tid = lid.x;
  let inScale = params.inScale;
  let outScale = params.outScale;

{% if M_TILE > 1 %}
  // Word-outer, m-unrolled GEMM tile (prefill): each weight word is read + unpacked once and
  // dotted against all M_TILE input rows. Everything lives in NAMED variables \u2014 dynamically
  // indexed local arrays can spill to memory. Per-(m,row)
  // accumulation order is identical to the m-outer GEMV, so results are bit-identical.
  let mStart = wg.z * M_TILE;
{% for mi in range(M_TILE) %}
  let mOk{{ mi }} = mStart + {{ mi }}u < M;
  var sumA_{{ mi }}: f32 = 0.0;
{% for r in range(N_ROWS) %}
  var sumQA_{{ mi }}_{{ r }}: f32 = 0.0;
{% endfor %}
{% endfor %}

  var w: u32 = tid;
  loop {
    if (w >= WORDS_PER_ROW) {
      break;
    }
{% for r in range(N_ROWS) %}
    var packed{{ r }}: u32 = 0u;
    if (rowBase + {{ r }}u < OUT_FEATURES) { packed{{ r }} = bits_buf[(rowBase + {{ r }}u) * WORDS_PER_ROW + w]; }
{% if BITS == 4 %}
    let lo{{ r }} = vec4<f32>(unpack4xU8(packed{{ r }} & 0x0F0F0F0Fu));
    let hi{{ r }} = vec4<f32>(unpack4xU8((packed{{ r }} >> 4u) & 0x0F0F0F0Fu));
    let q{{ r }}_0 = vec4<f32>(lo{{ r }}.x, hi{{ r }}.x, lo{{ r }}.y, hi{{ r }}.y);
    let q{{ r }}_1 = vec4<f32>(lo{{ r }}.z, hi{{ r }}.z, lo{{ r }}.w, hi{{ r }}.w);
{% else %}
    let e0{{ r }} = vec4<f32>(unpack4xU8(packed{{ r }} & 0x03030303u));
    let e1{{ r }} = vec4<f32>(unpack4xU8((packed{{ r }} >> 2u) & 0x03030303u));
    let e2{{ r }} = vec4<f32>(unpack4xU8((packed{{ r }} >> 4u) & 0x03030303u));
    let e3{{ r }} = vec4<f32>(unpack4xU8((packed{{ r }} >> 6u) & 0x03030303u));
    let q{{ r }}_0 = vec4<f32>(e0{{ r }}.x, e1{{ r }}.x, e2{{ r }}.x, e3{{ r }}.x);
    let q{{ r }}_1 = vec4<f32>(e0{{ r }}.y, e1{{ r }}.y, e2{{ r }}.y, e3{{ r }}.y);
    let q{{ r }}_2 = vec4<f32>(e0{{ r }}.z, e1{{ r }}.z, e2{{ r }}.z, e3{{ r }}.z);
    let q{{ r }}_3 = vec4<f32>(e0{{ r }}.w, e1{{ r }}.w, e2{{ r }}.w, e3{{ r }}.w);
{% endif %}
{% endfor %}
{% for mi in range(M_TILE) %}
    if (mOk{{ mi }}) {
      let aV4Base{{ mi }} = (mStart + {{ mi }}u) * (IN_FEATURES / 4u) + w * CHUNKS;
{% for c in range(CHUNKS) %}
{% if PRESRQ %}
      let a{{ mi }}_{{ c }} = vec4<f32>(a[aV4Base{{ mi }} + {{ c }}u]);
{% else %}
      let a{{ mi }}_{{ c }} = srq4(vec4<f32>(a[aV4Base{{ mi }} + {{ c }}u]), inScale);
      sumA_{{ mi }} = sumA_{{ mi }} + a{{ mi }}_{{ c }}.x + a{{ mi }}_{{ c }}.y + a{{ mi }}_{{ c }}.z + a{{ mi }}_{{ c }}.w;
{% endif %}
{% for r in range(N_ROWS) %}
      sumQA_{{ mi }}_{{ r }} = sumQA_{{ mi }}_{{ r }} + dot(q{{ r }}_{{ c }}, a{{ mi }}_{{ c }});
{% endfor %}
{% endfor %}
    }
{% endfor %}
    w = w + WG;
  }

{% for mi in range(M_TILE) %}
  if (mOk{{ mi }}) {
{% if PRESRQ %}
    // Presrq producers provide the activation row sum alongside the quantized row.
    let rA{{ mi }} = sum_a[mStart + {{ mi }}u] + sumA_{{ mi }};
{% else %}
    let rA{{ mi }} = reduce(sumA_{{ mi }}, tid);
{% endif %}
{% for r in range(N_ROWS) %}
    {
      let rQA = reduce(sumQA_{{ mi }}_{{ r }}, tid);
      let o = rowBase + {{ r }}u;
      if (tid == 0u && o < OUT_FEATURES) {
        out[(mStart + {{ mi }}u) * OUT_FEATURES + o] = {{ outputScalar }}(srq(scale[o] * (rQA - ZP * rA{{ mi }}), outScale));
      }
    }
{% endfor %}
  }
{% endfor %}
}
{% else %}
  // M==1 (decode): m-outer GEMV. Hoisting the unpack into a register array
  // indexed in an inner loop is avoided because dynamically-indexed local
  // arrays can spill.
  let mEnd = min((wg.z + 1u) * M_TILE, M);
  for (var m: u32 = wg.z * M_TILE; m < mEnd; m = m + 1u) {
    let aV4Base = m * (IN_FEATURES / 4u);
    var sumQA: array<f32, N_ROWS>;
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) { sumQA[r] = 0.0; }
    var sumA: f32 = 0.0;

    var w: u32 = tid;
    loop {
      if (w >= WORDS_PER_ROW) {
        break;
      }
      let colBase: u32 = w * VALS_PER_WORD;
{% if PRESRQ %}
      // presrq: the activation is already srq-quantized (DecodeRmsSrq / DecodeNormAddNorm)
      // and its sum arrives via sum_a \u2014 no per-workgroup srq divisions, no sumA reduction.
      var avc: array<vec4<f32>, CHUNKS>;
      for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
        avc[c] = vec4<f32>(a[aV4Base + w * CHUNKS + c]);
      }
{% else %}
      // Read + SRQ this word's activation values once, then reuse them across all N_ROWS rows.
      var avc: array<vec4<f32>, CHUNKS>;
      for (var c: u32 = 0u; c < CHUNKS; c = c + 1u) {
        let a4 = srq4(vec4<f32>(a[aV4Base + w * CHUNKS + c]), inScale);
        avc[c] = a4;
        sumA = sumA + a4.x + a4.y + a4.z + a4.w;
      }
{% endif %}
      for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
        let o = rowBase + r;
        if (o < OUT_FEATURES) {
          let packed: u32 = bits_buf[o * WORDS_PER_ROW + w];
          // Dequant via unpack4xU8, which splits one u32 into 4 u8 lanes.
{% if BITS == 4 %}
          let lo = vec4<f32>(unpack4xU8(packed & 0x0F0F0F0Fu));
          let hi = vec4<f32>(unpack4xU8((packed >> 4u) & 0x0F0F0F0Fu));
          sumQA[r] = sumQA[r] + dot(vec4<f32>(lo.x, hi.x, lo.y, hi.y), avc[0]) + dot(vec4<f32>(lo.z, hi.z, lo.w, hi.w), avc[1]);
{% else %}
          let d0 = vec4<f32>(unpack4xU8(packed & 0x03030303u));
          let d1 = vec4<f32>(unpack4xU8((packed >> 2u) & 0x03030303u));
          let d2 = vec4<f32>(unpack4xU8((packed >> 4u) & 0x03030303u));
          let d3 = vec4<f32>(unpack4xU8((packed >> 6u) & 0x03030303u));
          sumQA[r] = sumQA[r] + dot(vec4<f32>(d0.x, d1.x, d2.x, d3.x), avc[0]) + dot(vec4<f32>(d0.y, d1.y, d2.y, d3.y), avc[1]) + dot(vec4<f32>(d0.z, d1.z, d2.z, d3.z), avc[2]) + dot(vec4<f32>(d0.w, d1.w, d2.w, d3.w), avc[3]);
{% endif %}
        }
      }
      w = w + WG;
    }

{% if PRESRQ %}
    // Presrq producers provide the activation row sum alongside the quantized row.
    let rA = sum_a[m] + sumA;
{% else %}
    let rA = reduce(sumA, tid);
{% endif %}
    for (var r: u32 = 0u; r < N_ROWS; r = r + 1u) {
      let rQA = reduce(sumQA[r], tid);
      let o = rowBase + r;
      if (tid == 0u && o < OUT_FEATURES) {
        out[m * OUT_FEATURES + o] = {{ outputScalar }}(srq(scale[o] * (rQA - ZP * rA), outScale));
      }
    }
  }
}
{% endif %}
`]]}],["com.xenova.gemma4.SrqQuantize",{manifest:{schemaVersion:1,domain:"com.xenova.gemma4",name:"SrqQuantize",sinceVersion:1,inputs:[{role:"X",dtype:"T"}],outputs:[{role:"Y",dtype:"T",shape:"shapes.xT"}],typeConstraints:{T:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},yT:{kind:"tensor",semantic:"Y",role:"output"},count:{kind:"u32",semantic:"count"},scale:{kind:"f32",semantic:"scale"}},variants:[{id:"scalar",priority:0,when:'args.count > 0 and numel(shapes.xT) >= args.count and numel(shapes.yT) >= args.count and (tensorDtypes.xT != "float16" or device.features.has("shader-f16"))',constants:{usesF16:'tensorDtypes.xT == "float16"',scalar:"dtypes.T",COUNT:"args.count"},passes:[{id:"main",name:"SrqQuantize",shader:"srq-quantize.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$scalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$scalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"scale",type:"f32",value:"args.scale"},{name:"invScale",type:"f32",value:"(1.0 / args.scale) if args.scale else 0.0"}]}}],dispatch:{x:"ceil(args.count / 256)",y:1,z:1},reads:["X"],writes:["Y"]}]}]},assets:[["srq-quantize.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

// Elementwise SRQ: y = clamp(round(x/scale), -128, 127) * scale (no-op when scale==0).
// Applied once per activation element so the downstream QatMatMul can skip per-output SRQ.
// The division is a Markstein sequence seeded with the host-computed fl(1/scale);
// native f32 division can be off by ulps and flip round() at exact-.5 grid ties.
const COUNT: u32 = {{ COUNT }}u;

fn div_exact(x: f32, s: f32, t: f32) -> f32 {
  let q0 = x * t;
  let r = fma(-s, q0, x);
  return fma(r, t, q0);
}

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= COUNT) { return; }
  let s = params.scale;
  let v = f32(x[i]);
  let q = select(v, clamp(round(div_exact(v, s, params.invScale)), -128.0, 127.0) * s, s != 0.0);
  y[i] = {{ scalar }}(q);
}
`]]}],["com.xenova.MulBroadcast",{manifest:{schemaVersion:1,domain:"com.xenova",name:"MulBroadcast",sinceVersion:1,inputs:[{role:"X",dtype:"X"},{role:"Factor",dtype:"F"}],outputs:[{role:"X",dtype:"X",shape:"shapes.xT"}],typeConstraints:{X:["float32","float16"],F:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"inout"},factorT:{kind:"tensor",semantic:"Factor",role:"input"},count:{kind:"u32",semantic:"count"},period:{kind:"u32",semantic:"period",required:!1}},variants:[{id:"scalar",when:'numel(shapes.xT) >= args.count and numel(shapes.factorT) >= (args.period if args.period else args.count) and ((dtypes.X != "f16" and dtypes.F != "f16") or device.features.has("shader-f16"))',constants:{xScalar:"dtypes.X",factorScalar:"dtypes.F",usesF16:'dtypes.X == "f16" or dtypes.F == "f16"'},passes:[{id:"main",name:"MulBroadcast",shader:"mul-broadcast.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"inout",buffer:{type:"storage"},elementType:"$xScalar"},{name:"factor",arg:"factorT",semantic:"Factor",role:"input",buffer:{type:"read-only-storage"},elementType:"$factorScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"count",type:"u32",value:"args.count"},{name:"period",type:"u32",value:"args.period if args.period else 0"},{name:"wgY",type:"u32",value:"min(ceil(args.count / 64), 1024)"}]}}],dispatch:{x:"min(ceil(args.count / 64), 1024)",y:"ceil(ceil(args.count / 64) / min(ceil(args.count / 64), 1024))",z:1},reads:["X","Factor"],writes:["X"]}]}]},assets:[["mul-broadcast.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}
const WG: u32 = 64u;
@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let wg_idx = wg.x + wg.y * params.wgY;
  let i = wg_idx * WG + lid.x;
  if (i >= params.count) {
    return;
  }
  var pIdx = i;
  if (params.period > 0u) {
    pIdx = i % params.period;
  }
  x[i] = {{ xScalar }}(f32(x[i]) * f32(factor[pIdx]));
}
`]]}],["com.xenova.RMSNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"RMSNorm",sinceVersion:1,inputs:[{role:"X",dtype:"X"},{role:"W",dtype:"W",rank:1,optional:!0}],outputs:[{role:"Y",dtype:"Y",shape:"shapes.xT"}],typeConstraints:{X:["float32","float16"],W:["float32","float16"],Y:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},wT:{kind:"tensor",semantic:"W",role:"weights",required:!1},yT:{kind:"tensor",semantic:"Y",role:"output"},rows:{kind:"u32",semantic:"rows"},dim:{kind:"u32",semantic:"dim"},eps:{kind:"f32",semantic:"eps",required:!1},exact:{kind:"u32",semantic:"exact_reference_order",required:!1}},variants:[{id:"exact_weighted",priority:30,when:'args.exact and present.wT and ranks.wT == 1 and dim(shapes.wT, 0) == args.dim and tensorDtypes.wT == "float32" and args.rows > 0 and args.dim > 0 and args.dim % 4 == 0 and args.dim < 4194304 and numel(shapes.xT) >= args.rows * args.dim and numel(shapes.yT) >= args.rows * args.dim and tensorDtypes.xT == "float32" and tensorDtypes.yT == "float32"',constants:{hasWeight:!0,usesF16:!1,dim:"args.dim",INV_DIM:"1.0 / args.dim",eps:"args.eps if args.eps else 0.000001"},passes:[{id:"main",name:"RMSNormExactW",shader:"rms-norm-exact.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"w",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"vec4<f32>"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"min(args.rows, 65535)"}]}}],dispatch:{x:"ceil(args.rows / 64)",y:1,z:1},reads:["X","W"],writes:["Y"]}]},{id:"exact_unweighted",priority:20,when:'args.exact and (not present.wT) and args.rows > 0 and args.dim > 0 and args.dim % 4 == 0 and args.dim < 4194304 and numel(shapes.xT) >= args.rows * args.dim and numel(shapes.yT) >= args.rows * args.dim and tensorDtypes.xT == "float32" and tensorDtypes.yT == "float32"',constants:{hasWeight:!1,usesF16:!1,dim:"args.dim",INV_DIM:"1.0 / args.dim",eps:"args.eps if args.eps else 0.000001"},passes:[{id:"main",name:"RMSNormExact",shader:"rms-norm-exact.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"vec4<f32>"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"min(args.rows, 65535)"}]}}],dispatch:{x:"ceil(args.rows / 64)",y:1,z:1},reads:["X"],writes:["Y"]}]},{id:"weighted_subgroup_vec4",priority:15,requiredFeatures:["subgroups"],requiredSubgroupMinSize:32,when:'(not args.exact) and present.wT and ranks.wT == 1 and dim(shapes.wT, 0) == args.dim and args.rows > 0 and args.dim > 0 and args.dim % 4 == 0 and numel(shapes.xT) >= args.rows * args.dim and numel(shapes.yT) >= args.rows * args.dim and ((dtypes.X != "f16" and dtypes.W != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16"))',constants:{xVec4:'"vec4<f16>" if dtypes.X == "f16" else "vec4<f32>"',wVec4:'"vec4<f16>" if dtypes.W == "f16" else "vec4<f32>"',yVec4:'"vec4<f16>" if dtypes.Y == "f16" else "vec4<f32>"'},passes:[{id:"main",name:"RMSNorm",source:{kind:"template",shader:"ops/_shared/norm-row-stats.wgsl.jinja",inputs:{mode:'"rms"',vec4:!0,scalar:"dtypes.Y",usesF16:'dtypes.X == "f16" or dtypes.W == "f16" or dtypes.Y == "f16"',hidden:"args.dim",hiddenVec:"args.dim / 4",wg:"min(256, pow2ceil(args.dim / 4))",maxSubgroups:"max(1, min(256, pow2ceil(args.dim / 4)) / 32)",epsilon:"args.eps if args.eps else 0.000001",vecType:'"vec4<" ~ dtypes.Y ~ ">"'}},bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xVec4"},{name:"scale",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wVec4"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yVec4"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"max(1, min(args.rows, 65535))"}]}}],dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.rows / max(1, min(args.rows, 65535)))",z:1},reads:["X","W"],writes:["Y"]}]},{id:"unweighted",priority:0,when:'(not args.exact) and (not present.wT and args.rows > 0 and args.dim > 0 and numel(shapes.xT) >= args.rows * args.dim and numel(shapes.yT) >= args.rows * args.dim and ((dtypes.X != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16")))',constants:{hasWeight:!1,xScalar:"dtypes.X",wScalar:'"f32"',yScalar:"dtypes.Y",usesF16:'dtypes.X == "f16" or dtypes.Y == "f16"',dim:"args.dim",eps:"args.eps if args.eps else 0.000001"},passes:[{id:"main",name:"RMSNorm",shader:"rms-norm.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xScalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"min(args.rows, 65535)"}]}}],dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.rows / min(args.rows, 65535))",z:1},reads:["X"],writes:["Y"]}]},{id:"weighted",priority:10,when:'(not args.exact) and (present.wT and ranks.wT == 1 and args.rows > 0 and args.dim > 0 and numel(shapes.xT) >= args.rows * args.dim and dim(shapes.wT, 0) == args.dim and numel(shapes.yT) >= args.rows * args.dim and ((dtypes.X != "f16" and dtypes.W != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16")))',constants:{hasWeight:!0,xScalar:"dtypes.X",wScalar:"dtypes.W",yScalar:"dtypes.Y",usesF16:'dtypes.X == "f16" or dtypes.W == "f16" or dtypes.Y == "f16"',dim:"args.dim",eps:"args.eps if args.eps else 0.000001"},passes:[{id:"main",name:"RMSNorm",shader:"rms-norm.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xScalar"},{name:"w",arg:"wT",semantic:"W",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"rowStride",type:"u32",value:"min(args.rows, 65535)"}]}}],dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.rows / min(args.rows, 65535))",z:1},reads:["X","W"],writes:["Y"]}]}]},assets:[["rms-norm-exact.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

// Reference-exact RMSNorm for the host f32 reduction contract:
//   y = x * pow(mean(x^2) + eps, -0.5) [* w]
// - mean's sum uses a cascade reduction: the row is read as vec4s, 4 ILP streams
//   (vector index % 4), a 4-level binary-counter cascade with
//   level_step 16 (exact for any dim < 2^22), stream combine 0+=1,2,3 sequential, scalar
//   tail first, then lanes folded x,y,z,w sequentially;
// - mean = sum / dim with a correctly rounded (Markstein) division;
// - pow(y, -0.5) dispatches to rsqrt = fl(1/fl(sqrt(y))): both steps correctly rounded
//   in-shader (ALTSQRT sequence + NR reciprocal; native sqrt/divide may not be
//   correctly rounded);
// - products that the reference rounds separately are written fma(a, b, 0.0) so the MSL
//   compiler cannot contract them into the following add.
// One thread per row (the cascade is inherently sequential). Parity path only.

const DIM: u32 = {{ dim }}u;
const DIM_F: f32 = {{ dim }}.0;
const INV_DIM: f32 = {{ INV_DIM }};
const EPS: f32 = {{ eps }};
const VEC_SIZE: u32 = DIM / 4u;
const SIZE_ILP: u32 = VEC_SIZE / 4u;
const WG: u32 = 64u;

fn div_exact(x: f32, s: f32, t: f32) -> f32 {
  let q0 = x * t;
  let r = fma(-s, q0, x);
  return fma(r, t, q0);
}

fn recip_exact(s: f32) -> f32 {
  let t0 = 1.0 / s;
  let t1 = fma(fma(-s, t0, 1.0), t0, t0);
  return fma(fma(-s, t1, 1.0), t1, t1);
}

fn sqrt_exact(d: f32) -> f32 {
  var y = inverseSqrt(d);
  var x = d * y;
  var w = 0.5 * y;
  y = fma(-x, w, 0.5);
  x = fma(x, y, x); w = fma(w, y, w);
  y = fma(-x, w, 1.5); w = w + w;
  w = w * y;
  x = w * d;
  y = fma(w, d, -x);
  var z = fma(-w, x, 1.0);
  z = fma(-w, y, z);
  w = 0.5 * x;
  w = fma(w, z, y);
  w = w + x;
  return w;
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let row = gid.x;
  if (row >= params.rows) { return; }
  let base = row * VEC_SIZE; // x is bound as vec4

  // sum of squares, exact aten cascade (level_power = 4 for any dim < 2^22)
  var a0_0 = vec4<f32>(0.0); var a0_1 = vec4<f32>(0.0); var a0_2 = vec4<f32>(0.0); var a0_3 = vec4<f32>(0.0);
  var a1_0 = vec4<f32>(0.0); var a1_1 = vec4<f32>(0.0); var a1_2 = vec4<f32>(0.0); var a1_3 = vec4<f32>(0.0);
  var a2_0 = vec4<f32>(0.0); var a2_1 = vec4<f32>(0.0); var a2_2 = vec4<f32>(0.0); var a2_3 = vec4<f32>(0.0);
  var a3_0 = vec4<f32>(0.0); var a3_1 = vec4<f32>(0.0); var a3_2 = vec4<f32>(0.0); var a3_3 = vec4<f32>(0.0);

  var i: u32 = 0u;
  loop {
    if (i + 16u > SIZE_ILP) { break; }
    for (var b: u32 = 0u; b < 16u; b = b + 1u) {
      let vb = base + (i + b) * 4u;
      let v0 = vec4<f32>(x[vb]); let v1 = vec4<f32>(x[vb + 1u]);
      let v2 = vec4<f32>(x[vb + 2u]); let v3 = vec4<f32>(x[vb + 3u]);
      a0_0 = fma(fma(v0, v0, vec4<f32>(0.0)), vec4<f32>(1.0), a0_0);
      a0_1 = fma(fma(v1, v1, vec4<f32>(0.0)), vec4<f32>(1.0), a0_1);
      a0_2 = fma(fma(v2, v2, vec4<f32>(0.0)), vec4<f32>(1.0), a0_2);
      a0_3 = fma(fma(v3, v3, vec4<f32>(0.0)), vec4<f32>(1.0), a0_3);
    }
    i = i + 16u;
    // cascade promotion (binary counter, base 16)
    a1_0 = fma(a0_0, vec4<f32>(1.0), a1_0); a1_1 = fma(a0_1, vec4<f32>(1.0), a1_1); a1_2 = fma(a0_2, vec4<f32>(1.0), a1_2); a1_3 = fma(a0_3, vec4<f32>(1.0), a1_3);
    a0_0 = vec4<f32>(0.0); a0_1 = vec4<f32>(0.0); a0_2 = vec4<f32>(0.0); a0_3 = vec4<f32>(0.0);
    if ((i & 0xF0u) == 0u) {
      a2_0 = fma(a1_0, vec4<f32>(1.0), a2_0); a2_1 = fma(a1_1, vec4<f32>(1.0), a2_1); a2_2 = fma(a1_2, vec4<f32>(1.0), a2_2); a2_3 = fma(a1_3, vec4<f32>(1.0), a2_3);
      a1_0 = vec4<f32>(0.0); a1_1 = vec4<f32>(0.0); a1_2 = vec4<f32>(0.0); a1_3 = vec4<f32>(0.0);
      if ((i & 0xF00u) == 0u) {
        a3_0 = fma(a2_0, vec4<f32>(1.0), a3_0); a3_1 = fma(a2_1, vec4<f32>(1.0), a3_1); a3_2 = fma(a2_2, vec4<f32>(1.0), a3_2); a3_3 = fma(a2_3, vec4<f32>(1.0), a3_3);
        a2_0 = vec4<f32>(0.0); a2_1 = vec4<f32>(0.0); a2_2 = vec4<f32>(0.0); a2_3 = vec4<f32>(0.0);
      }
    }
  }
  // tail groups
  loop {
    if (i >= SIZE_ILP) { break; }
    let vb = base + i * 4u;
    let v0 = vec4<f32>(x[vb]); let v1 = vec4<f32>(x[vb + 1u]);
    let v2 = vec4<f32>(x[vb + 2u]); let v3 = vec4<f32>(x[vb + 3u]);
    a0_0 = fma(fma(v0, v0, vec4<f32>(0.0)), vec4<f32>(1.0), a0_0);
    a0_1 = fma(fma(v1, v1, vec4<f32>(0.0)), vec4<f32>(1.0), a0_1);
    a0_2 = fma(fma(v2, v2, vec4<f32>(0.0)), vec4<f32>(1.0), a0_2);
    a0_3 = fma(fma(v3, v3, vec4<f32>(0.0)), vec4<f32>(1.0), a0_3);
    i = i + 1u;
  }
  // combine levels into stream accumulators (j = 1, 2, 3 in order)
  a0_0 = fma(a1_0, vec4<f32>(1.0), a0_0); a0_1 = fma(a1_1, vec4<f32>(1.0), a0_1); a0_2 = fma(a1_2, vec4<f32>(1.0), a0_2); a0_3 = fma(a1_3, vec4<f32>(1.0), a0_3);
  a0_0 = fma(a2_0, vec4<f32>(1.0), a0_0); a0_1 = fma(a2_1, vec4<f32>(1.0), a0_1); a0_2 = fma(a2_2, vec4<f32>(1.0), a0_2); a0_3 = fma(a2_3, vec4<f32>(1.0), a0_3);
  a0_0 = fma(a3_0, vec4<f32>(1.0), a0_0); a0_1 = fma(a3_1, vec4<f32>(1.0), a0_1); a0_2 = fma(a3_2, vec4<f32>(1.0), a0_2); a0_3 = fma(a3_3, vec4<f32>(1.0), a0_3);
  // leftover whole vectors (vec_size % 4) into stream 0, then stream fold 0+=1,2,3
  var vi: u32 = SIZE_ILP * 4u;
  loop {
    if (vi >= VEC_SIZE) { break; }
    let v = vec4<f32>(x[base + vi]);
    a0_0 = fma(fma(v, v, vec4<f32>(0.0)), vec4<f32>(1.0), a0_0);
    vi = vi + 1u;
  }
  a0_0 = fma(a0_1, vec4<f32>(1.0), a0_0);
  a0_0 = fma(a0_2, vec4<f32>(1.0), a0_0);
  a0_0 = fma(a0_3, vec4<f32>(1.0), a0_0);
  // No scalar tail: this path requires dim % 4 == 0.
  // lane fold x, y, z, w in order
  var s: f32 = a0_0.x;
  s = fma(a0_0.y, 1.0, s);
  s = fma(a0_0.z, 1.0, s);
  s = fma(a0_0.w, 1.0, s);

  let ms = div_exact(s, DIM_F, INV_DIM) + EPS;
  let rinv = recip_exact(sqrt_exact(ms));

  // plain muls (store-only consumers \u2014 no contraction risk, and they preserve -0)
  for (var v: u32 = 0u; v < VEC_SIZE; v = v + 1u) {
    let xv = vec4<f32>(x[base + v]);
    let n = xv * vec4<f32>(rinv);
{% if hasWeight %}
    let wv = vec4<f32>(w[v]);
    y[base + v] = n * wv;
{% else %}
    y[base + v] = n;
{% endif %}
  }
}
`],["rms-norm.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

const DIM: u32 = {{ dim }}u;
const EPS: f32 = {{ eps }};
const WG: u32 = 64u;

var<workgroup> partial: array<f32, WG>;

fn reduce_sum(value: f32, tid: u32) -> f32 {
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
}

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let rowStride = select(params.rowStride, params.rows, params.rowStride == 0u);
  let row = wg.x + wg.y * rowStride;
  if (row >= params.rows) {
    return;
  }
  let tid = lid.x;
  let base = row * DIM;

  // Compute sum of squares.
  var acc: f32 = 0.0;
  var i: u32 = tid;
  loop {
    if (i >= DIM) {
      break;
    }
    let v = f32(x[base + i]);
    acc = acc + v * v;
    i = i + WG;
  }
  let scale = inverseSqrt(reduce_sum(acc, tid) / f32(DIM) + EPS);

  // Apply normalization (+ optional weight).
  var j: u32 = tid;
  loop {
    if (j >= DIM) {
      break;
    }
    let xv = f32(x[base + j]);
{% if hasWeight %}
    let wv = f32(w[j]);
    y[base + j] = {{ yScalar }}(xv * scale * wv);
{% else %}
    y[base + j] = {{ yScalar }}(xv * scale);
{% endif %}
    j = j + WG;
  }
}
`]]}],["com.xenova.Rope1d",{manifest:{schemaVersion:1,domain:"com.xenova",name:"Rope1d",sinceVersion:1,inputs:[{role:"X",dtype:"T"},{role:"Cos",dtype:"float32",rank:2},{role:"Sin",dtype:"float32",rank:2}],outputs:[{role:"X",dtype:"T",shape:"shapes.xT"}],typeConstraints:{T:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"inout"},cosT:{kind:"tensor",semantic:"Cos",role:"input"},sinT:{kind:"tensor",semantic:"Sin",role:"input"},seq:{kind:"u32",semantic:"seq"},heads:{kind:"u32",semantic:"heads"},headDim:{kind:"u32",semantic:"headDim"},exact:{kind:"u32",semantic:"exact_reference_order",required:!1}},bindingSets:{default:[{name:"q",arg:"xT",semantic:"X",role:"inout",buffer:{type:"storage"},elementType:"$T"},{name:"cosTbl",arg:"cosT",semantic:"Cos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"sinTbl",arg:"sinT",semantic:"Sin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"seq",type:"u32",value:"args.seq"},{name:"heads",type:"u32",value:"args.heads"}]}}]},variants:[{id:"split_half_exact",when:'args.exact and ranks.cosT == 2 and ranks.sinT == 2 and args.seq > 0 and args.heads > 0 and args.headDim > 0 and args.headDim % 2 == 0 and numel(shapes.xT) >= args.seq * args.heads * args.headDim and dim(shapes.cosT, 0) >= args.seq and dim(shapes.sinT, 0) >= args.seq and dim(shapes.cosT, 1) == args.headDim / 2 and dim(shapes.sinT, 1) == args.headDim / 2 and tensorDtypes.xT == "float32"',constants:{layout:'"split-half"',activationScalar:"dtypes.T",usesF16:'dtypes.T == "f16"',headDim:"args.headDim",halfDim:"args.headDim / 2",workgroupSize:"min(64, args.headDim / 2)",EXACT:1},passes:[{id:"main",name:"Rope1d",shader:"rope.wgsl.jinja",bindings:"default",dispatch:{x:"args.seq",y:"args.heads",z:1},reads:["X","Cos","Sin"],writes:["X"]}],priority:10},{id:"split_half",when:'(not args.exact) and (ranks.cosT == 2 and ranks.sinT == 2 and args.seq > 0 and args.heads > 0 and args.headDim > 0 and args.headDim % 2 == 0 and numel(shapes.xT) >= args.seq * args.heads * args.headDim and dim(shapes.cosT, 0) >= args.seq and dim(shapes.sinT, 0) >= args.seq and dim(shapes.cosT, 1) == args.headDim / 2 and dim(shapes.sinT, 1) == args.headDim / 2 and tensorDtypes.cosT == "float32" and tensorDtypes.sinT == "float32" and (f16Ok(dtypes.T)))',constants:{layout:'"split-half"',activationScalar:"dtypes.T",usesF16:'dtypes.T == "f16"',headDim:"args.headDim",halfDim:"args.headDim / 2",workgroupSize:"min(64, args.headDim / 2)",EXACT:0},passes:[{id:"main",name:"Rope1d",shader:"rope.wgsl.jinja",bindings:"default",dispatch:{x:"args.seq",y:"args.heads",z:1},reads:["X","Cos","Sin"],writes:["X"]}]}]},assets:[["rope.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}

const HEAD_DIM: u32 = {{ headDim }}u;
const HALF_DIM: u32 = {{ halfDim }}u;
const WG: u32 = {{ workgroupSize }}u;

@compute @workgroup_size(WG, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let t = wg.x;
  let h = wg.y;
  if (t >= params.seq || h >= params.heads) {
    return;
  }
  let tid = lid.x;
  let qBase = (t * params.heads + h) * HEAD_DIM;
{% if layout == "split-half" %}
  let csBase = t * HALF_DIM;
{% else %}
  let csBase = t * HEAD_DIM;
{% endif %}

  var k: u32 = tid;
  loop {
    if (k >= HALF_DIM) {
      break;
    }
{% if layout == "split-half" %}
    let c = cosTbl[csBase + k];
    let s = sinTbl[csBase + k];
    let x0 = f32(q[qBase + k]);
    let x1 = f32(q[qBase + k + HALF_DIM]);
{% if EXACT %}
    // Reference-exact path: round q*cos and rotate_half(q)*sin separately before
    // the add. fma(a, b, 0.0) yields the separately-rounded product and prevents
    // contraction into the following add.
    q[qBase + k] = {{ activationScalar }}(fma(x0, c, 0.0) + fma(-x1, s, 0.0));
    q[qBase + k + HALF_DIM] = {{ activationScalar }}(fma(x1, c, 0.0) + fma(x0, s, 0.0));
{% else %}
    q[qBase + k] = {{ activationScalar }}(x0 * c - x1 * s);
    q[qBase + k + HALF_DIM] = {{ activationScalar }}(x1 * c + x0 * s);
{% endif %}
{% else %}
    let idx = 2u * k;
    let c = cosTbl[csBase + idx];
    let s = sinTbl[csBase + idx];
    let xe = {{ firstLoad }};
    let xo = {{ secondLoad }};
    q[qBase + idx] = {{ firstStore }};
    q[qBase + idx + 1u] = {{ secondStore }};
{% endif %}
    k = k + WG;
  }
}
`]]}],["com.xenova.StridedCopy",{manifest:{schemaVersion:1,domain:"com.xenova",name:"StridedCopy",sinceVersion:1,inputs:[{role:"Src",dtype:"S"}],outputs:[{role:"Dst",dtype:"D",shape:"shapes.dstT"}],typeConstraints:{S:["float32","float16"],D:["float32","float16"]},args:{srcT:{kind:"tensor",semantic:"Src",role:"input"},dstT:{kind:"tensor",semantic:"Dst",role:"output"},rows:{kind:"u32",semantic:"rows"},srcStride:{kind:"u32",semantic:"srcStride"},srcStart:{kind:"u32",semantic:"srcStart",required:!1},dstStride:{kind:"u32",semantic:"dstStride"},dstStart:{kind:"u32",semantic:"dstStart",required:!1},copyCols:{kind:"u32",semantic:"copyCols"}},variants:[{id:"vec4_f16",priority:10,when:'dtypes.S == "f16" and dtypes.D == "f16" and device.features.has("shader-f16") and args.srcStride % 4 == 0 and (args.srcStart if args.srcStart else 0) % 4 == 0 and args.dstStride % 4 == 0 and (args.dstStart if args.dstStart else 0) % 4 == 0 and args.copyCols % 4 == 0',constants:{vectorized:!0,usesF16:!0,sourceElement:'"vec4<f16>"',destElement:'"vec4<f16>"',destScalar:'"f16"'},passes:[{id:"main",name:"StridedCopy",shader:"strided-copy.wgsl.jinja",bindings:[{name:"s",arg:"srcT",semantic:"Src",role:"input",buffer:{type:"read-only-storage"},elementType:"$sourceElement"},{name:"d",arg:"dstT",semantic:"Dst",role:"output",buffer:{type:"storage"},elementType:"$destElement"},{name:"p",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"copyCols",type:"u32",value:"args.copyCols / 4"},{name:"srcStride",type:"u32",value:"args.srcStride / 4"},{name:"srcStart",type:"u32",value:"(args.srcStart if args.srcStart else 0) / 4"},{name:"dstStride",type:"u32",value:"args.dstStride / 4"},{name:"dstStart",type:"u32",value:"(args.dstStart if args.dstStart else 0) / 4"}]}}],dispatch:{x:"args.rows",y:1,z:1},reads:["Src"],writes:["Dst"]}]},{id:"scalar",priority:0,when:'(dtypes.S != "f16" and dtypes.D != "f16") or device.features.has("shader-f16")',constants:{vectorized:!1,usesF16:'dtypes.S == "f16" or dtypes.D == "f16"',sourceElement:"dtypes.S",destElement:"dtypes.D",destScalar:"dtypes.D"},passes:[{id:"main",name:"StridedCopy",shader:"strided-copy.wgsl.jinja",bindings:[{name:"s",arg:"srcT",semantic:"Src",role:"input",buffer:{type:"read-only-storage"},elementType:"$sourceElement"},{name:"d",arg:"dstT",semantic:"Dst",role:"output",buffer:{type:"storage"},elementType:"$destElement"},{name:"p",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"},{name:"copyCols",type:"u32",value:"args.copyCols"},{name:"srcStride",type:"u32",value:"args.srcStride"},{name:"srcStart",type:"u32",value:"args.srcStart if args.srcStart else 0"},{name:"dstStride",type:"u32",value:"args.dstStride"},{name:"dstStart",type:"u32",value:"args.dstStart if args.dstStart else 0"}]}}],dispatch:{x:"args.rows",y:1,z:1},reads:["Src"],writes:["Dst"]}]}]},assets:[["strided-copy.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}
{{ env.wgsl.resourceDeclarations }}
@compute @workgroup_size(64, 1, 1)
fn main(@builtin(workgroup_id) wg: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let r = wg.x;
  if (r >= p.rows) {
    return;
  }
  var i: u32 = lid.x;
  loop {
    if (i >= p.copyCols) {
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
`]]}]])});function ae(e,n={}){let r=ss(e);return new Mn(r.manifest,{...n,assets:r.assets})}function ss(e){let n=Nc.get(e);if(n){let t=new Map(Cc);for(let[a,s]of n.assets)t.set(a,s);return{manifest:n.manifest,assets:Je(t)}}let r=ts.get(e);if(r){let t=new Map(rs);for(let[a,s]of r.assets)t.set(a,s);return{manifest:r.manifest,assets:Je(t)}}return jc(e)}function os(e){let n=new Set;for(let r of ar(e,"<op-package>"))for(let t of is(r))n.add(t);return n}function is(e){let n=new Set;for(let r of e.passes??[])zc(n,r);return n}function zc(e,n){if(n.source!==void 0){n.source.kind==="template"&&n.source.shader&&e.add(n.source.shader);return}n.shader&&e.add(n.shader)}function jc(e){throw new Error(`WebGPU op package ${e} is not embedded in this runtime`)}function ct(e,n){let r=[],t=a=>{let s=new URL(a,e);for(let o of n(s,{withFileTypes:!0})){let i=`${a}${o.name}`;o.isDirectory()?t(`${i}/`):o.isFile()&&$c(i)&&r.push(i)}};return t(""),r.sort((a,s)=>a.localeCompare(s))}function us(e,n){let r=new URL(pr,e);return ct(r,n).map(t=>`${pr}${t}`)}function ls(e){return e.replaceAll("\\","/").startsWith(pr)}function $c(e){return e.endsWith(".wgsl")||e.endsWith(".wgsl.jinja")}var pr,Cc,Nc,cs=he(()=>{"use strict";or();Bn();as();pr="ops/_shared/",Cc=new Map,Nc=new Map});var ds=he(()=>{"use strict";Bn()});var fr=he(()=>{"use strict";kn();An();nr();rr();nt();or();cs();ds();Bn();Bn();it()});function ps(e,n=[]){let r=new Set(Hc(n));return Kc.filter(t=>e.features.has(t)&&!r.has(t)).map(t=>t)}function Hc(e){return typeof e=="string"?e.split(",").map(n=>n.trim()).filter(Boolean):Array.isArray(e)?[...e]:e instanceof Set?[...e]:[]}function fs(e,n,r,t){let a=n.info,s=r?.wgslLanguageFeatures??globalThis.navigator?.gpu?.wgslLanguageFeatures,o=t?t.min:a.subgroupMinSize,i=t?t.max:a.subgroupMaxSize;return{adapterInfo:{vendor:a.vendor,architecture:a.architecture,device:a.device,description:a.description,isFallbackAdapter:a.isFallbackAdapter===!0,...typeof o=="number"?{subgroupMinSize:o}:{},...typeof i=="number"?{subgroupMaxSize:i}:{}},features:Yn(e.features),wgslLanguageFeatures:Jn(s),limits:er(e.limits)}}function ms(e){return{maxBufferSize:Number(e.limits.maxBufferSize),maxStorageBufferBindingSize:Number(e.limits.maxStorageBufferBindingSize),maxStorageBuffersPerShaderStage:Number(e.limits.maxStorageBuffersPerShaderStage),maxComputeWorkgroupStorageSize:Number(e.limits.maxComputeWorkgroupStorageSize)}}function gs({adapter:e,device:n,deviceInfo:r,destroy:t,gpu:a,syncPipelineCreation:s}){return{gpu:a,adapter:e,device:n,deviceInfo:r,createShaderModule:(i,u)=>n.createShaderModule({code:i,label:u}),createComputePipeline:s?async i=>{n.pushErrorScope("validation");let u=n.createComputePipeline(i),l=await n.popErrorScope();if(l)throw new Error(`createComputePipeline failed: ${l.message}`);return u}:i=>n.createComputePipelineAsync(i),createBuffer:i=>n.createBuffer(i),writeBuffer:(i,u,l)=>n.queue.writeBuffer(i,u,l),submit:async(i,u)=>{n.queue.submit(i),u.wait&&await n.queue.onSubmittedWorkDone()},mapRead:async(i,u,l)=>{await i.mapAsync(GPUMapMode.READ,u,l);let c=i.getMappedRange(u,l).slice(0);return i.unmap(),c},pushErrorScope:i=>n.pushErrorScope(i),popErrorScope:()=>n.popErrorScope(),destroy:t}}var Kc,hs=he(()=>{"use strict";fr();Kc=["shader-f16","subgroups","chromium-experimental-subgroup-matrix","timestamp-query","texture-formats-tier1","texture-formats-tier2"]});Br();var Si=class{constructor(e){this.trie=this._build_trie(e)}_build_trie(e){let n=Object.create(null);for(let r of e){let t=n;for(let a=0;a<r.length;++a){let s=r[a];t=t[s]??=Object.create(null)}t.end=r}return n}split(e){let n=[],r=e.length,t=0,a=0;for(;a<r;){let s=this.trie,o=null,i=a;for(;i<r&&(s=s[e[i]]);)s.end&&(o=s.end),++i;o?(a>t&&n.push(e.slice(t,a)),n.push(o),a+=o.length,t=a):++a}return t<r&&n.push(e.slice(t)),n}},Yt=Si,Ti=class{constructor(e){this.content=e.content,this.id=e.id,this.single_word=e.single_word??!1,this.lstrip=e.lstrip??!1,this.rstrip=e.rstrip??!1,this.special=e.special??!1,this.normalized=e.normalized??!this.special}},xi=Ti,sa=(()=>{let e=[...Array.from({length:94},(a,s)=>s+33),...Array.from({length:12},(a,s)=>s+161),...Array.from({length:82},(a,s)=>s+174)],n=e.slice(),r=0;for(let a=0;a<256;++a)e.includes(a)||(e.push(a),n.push(256+r),r+=1);let t=n.map(a=>String.fromCharCode(a));return Object.fromEntries(e.map((a,s)=>[a,t[s]]))})(),ki=e=>Object.fromEntries(Object.entries(e).map(([n,r])=>[r,n])),Ei=ki(sa),Jt=".,!?\u2026\u3002\uFF0C\u3001\u0964\u06D4\u060C",Pi=new Map([["(?i:'s|'t|'re|'ve|'m|'ll|'d)","(?:'([sS]|[tT]|[rR][eE]|[vV][eE]|[mM]|[lL][lL]|[dD]))"],["(?i:[sdmt]|ll|ve|re)","(?:[sS]|[dD]|[mM]|[tT]|[lL][lL]|[vV][eE]|[rR][eE])"],["[^\\r\\n\\p{L}\\p{N}]?+","[^\\r\\n\\p{L}\\p{N}]?"],["[^\\s\\p{L}\\p{N}]++","[^\\s\\p{L}\\p{N}]+"],["(?>\\p{Nd}{510})","(?:\\p{Nd}{510})"],["\\p{Nd}{3}+","(?:\\p{Nd}{3})+"],["\\G",""],[` ?[^(\\s|[${Jt}])]+`,` ?[^\\s${Jt}]+`]]),Vn="\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E",Ir=e=>e.replace(/ \./g,".").replace(/ \?/g,"?").replace(/ \!/g,"!").replace(/ ,/g,",").replace(/ \' /g,"'").replace(/ n't/g,"n't").replace(/ 'm/g,"'m").replace(/ 's/g,"'s").replace(/ 've/g,"'ve").replace(/ 're/g,"'re"),Qn=(e,n=!0)=>{if(e.Regex!==void 0){let r=e.Regex.replace(/\\([#&~])/g,"$1");r=r.replace(/\\A/g,"^").replace(/\\z/g,"$").replace(/\\Z/g,"(?=\\r?\\n?$)");for(let[t,a]of Pi)r=r.replaceAll(t,a);try{return new RegExp(r,"gu")}catch(t){if(!(t instanceof SyntaxError)||!t.message.toLowerCase().includes("invalid property name"))throw t;let a=!1,s=r.replace(/(\\[pP])\{([^}=]+)\}/g,(o,i,u)=>{try{return new RegExp(`\\p{${u}}`,"u"),`${i}{${u}}`}catch{return a=!0,`${i}{Script=${u}}`}});if(!a)throw t;try{return new RegExp(s,"gu")}catch{throw t}}}else if(e.String!==void 0){let r=Ai(e.String);return new RegExp(n?r:`(${r})`,"gu")}else return console.warn("Unknown pattern type:",e),null},Ai=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),Gi=(e,n,r)=>{let t=[],a=0;for(;a<e.length;){if(t.push(e[a]),(n.get(e[a])??r)!==r){++a;continue}for(;++a<e.length&&(n.get(e[a])??r)===r;)n.get(t.at(-1))!==r&&(t[t.length-1]+=e[a])}return t},Oi=e=>e>=19968&&e<=40959||e>=13312&&e<=19903||e>=131072&&e<=173791||e>=173824&&e<=177983||e>=177984&&e<=178207||e>=178208&&e<=183983||e>=63744&&e<=64255||e>=194560&&e<=195103,Ri=e=>Number.isInteger(e)||typeof e=="bigint",Wi=e=>{let n=0;for(let r of e)++n;return n},Fi=e=>oa(e.toLowerCase()),We=(...e)=>Array.prototype.concat.apply([],e),Dr=e=>new Map(Object.entries(e)),Mi=(e,n)=>{let r=[],t=0;for(let a of e.matchAll(n)){let s=a[0];t<a.index&&r.push(e.slice(t,a.index)),s.length>0&&r.push(s),t=a.index+s.length}return t<e.length&&r.push(e.slice(t)),r},oa=e=>e.replace(/\p{M}/gu,""),ea=(e,n,r=[])=>{if(!e||Array.isArray(e)||typeof e!="object")return`${n} must be a valid object`;for(let t of r)if(!(t in e))return`${n} must contain a "${t}" property`;return null},Bi=e=>e.match(/\S+/g)||[],qi=class{constructor(){let e=function(...n){return e._call(...n)};return Object.setPrototypeOf(e,new.target.prototype)}},Sn=qi,Ii=class extends Sn{constructor(e){super(),this.config=e}_call(e){return this.normalize(e)}},Ne=Ii,Di=class extends Ne{tokenize_chinese_chars(e){let n=[];for(let r=0;r<e.length;++r){let t=e[r],a=t.charCodeAt(0);Oi(a)?(n.push(" "),n.push(t),n.push(" ")):n.push(t)}return n.join("")}strip_accents(e){return e.normalize("NFD").replace(/\p{Mn}/gu,"")}is_control(e){switch(e){case"	":case`
`:case"\r":return!1;default:return/^\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}$/u.test(e)}}clean_text(e){let n=[];for(let r of e){let t=r.charCodeAt(0);t===0||t===65533||this.is_control(r)||(/^\s$/.test(r)?n.push(" "):n.push(r))}return n.join("")}normalize(e){return this.config.clean_text&&(e=this.clean_text(e)),this.config.handle_chinese_chars&&(e=this.tokenize_chinese_chars(e)),this.config.lowercase?(e=e.toLowerCase(),this.config.strip_accents!==!1&&(e=this.strip_accents(e))):this.config.strip_accents&&(e=this.strip_accents(e)),e}},Ui=Di,Li=class extends Ne{constructor(e){super(e),this.charsmap=e.precompiled_charsmap??null}normalize(e){return e=e.replace(/[\u0001-\u0008\u000B\u000E-\u001F\u007F\u008F\u009F]/gm,""),e=e.replace(/[\u0009\u000A\u000C\u000D\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u2581\u3000\uFEFF\uFFFD]/gm," "),e.includes("\uFF5E")?e=e.split("\uFF5E").map(r=>r.normalize("NFKC")).join("\uFF5E"):e=e.normalize("NFKC"),e}},Ci=Li,Ni=class extends Ne{constructor(e){super(e),this.normalizers=(e.normalizers??[]).map(n=>ia(n))}normalize(e){return this.normalizers.reduce((n,r)=>r?r.normalize(n):n,e)}},zi=Ni,ji=class extends Ne{normalize(e){let n=Qn(this.config.pattern??{});return n===null?e:e.replaceAll(n,this.config.content??"")}},$i=ji,Ki=class extends Ne{constructor(){super(...arguments),this.form="NFC"}normalize(e){return e=e.normalize(this.form),e}},Xn=Ki,Hi=class extends Xn{constructor(){super(...arguments),this.form="NFC"}},Vi=Hi,Qi=class extends Xn{constructor(){super(...arguments),this.form="NFD"}},Xi=Qi,Zi=class extends Xn{constructor(){super(...arguments),this.form="NFKC"}},Yi=Zi,Ji=class extends Xn{constructor(){super(...arguments),this.form="NFKD"}},eu=Ji,nu=class extends Ne{normalize(e){return this.config.strip_left&&this.config.strip_right?e=e.trim():(this.config.strip_left&&(e=e.trimStart()),this.config.strip_right&&(e=e.trimEnd())),e}},ru=nu,tu=class extends Ne{normalize(e){return oa(e)}},au=tu,su=class extends Ne{normalize(e){return e.toLowerCase()}},ou=su,iu=class extends Ne{normalize(e){return e=this.config.prepend+e,e}},uu=iu;function lu(e){if(e===null)return null;switch(e.type){case"BertNormalizer":return new Ui(e);case"Precompiled":return new Ci(e);case"Sequence":return new zi(e);case"Replace":return new $i(e);case"NFC":return new Vi(e);case"NFD":return new Xi(e);case"NFKC":return new Yi(e);case"NFKD":return new eu(e);case"Strip":return new ru(e);case"StripAccents":return new au(e);case"Lowercase":return new ou(e);case"Prepend":return new uu(e);default:throw new Error(`Unknown Normalizer type: ${e.type}`)}}var ia=lu,cu=class extends Sn{pre_tokenize(e,n){return(Array.isArray(e)?e.map(r=>this.pre_tokenize_text(r,n)):this.pre_tokenize_text(e,n)).flat()}_call(e,n){return this.pre_tokenize(e,n)}},Fe=cu,du=class extends Fe{constructor(e){super(),this.config=e,this.add_prefix_space=this.config.add_prefix_space??!1,this.trim_offsets=this.config.trim_offsets??!1,this.use_regex=this.config.use_regex??!0,this.pattern=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,this.byte_encoder=sa,this.text_encoder=new TextEncoder}pre_tokenize_text(e,n){return this.add_prefix_space&&!e.startsWith(" ")&&(e=" "+e),(this.use_regex?e.match(this.pattern)||[]:[e]).map(t=>Array.from(this.text_encoder.encode(t),a=>this.byte_encoder[a]).join(""))}},pu=du,fu=class extends Fe{pre_tokenize_text(e,n){return e.match(/\w+|[^\w\s]+/g)||[]}},mu=fu,gu=class extends Fe{constructor(e){super(),this.replacement=e.replacement??"\u2581",this.str_rep=e.str_rep||this.replacement,this.prepend_scheme=e.prepend_scheme??"always"}pre_tokenize_text(e,n){let{section_index:r=void 0}=n??{},t=e.replaceAll(" ",this.str_rep);return!t.startsWith(this.replacement)&&(this.prepend_scheme==="always"||this.prepend_scheme==="first"&&r===0)&&(t=this.str_rep+t),[t]}},hu=gu,yu=class extends Fe{constructor(e){super(),this.config=e,this.pattern=Qn(this.config.pattern??{},this.config.invert??!0)}pre_tokenize_text(e){return this.pattern===null?[]:this.config.invert?e.match(this.pattern)||[]:this.config.behavior?.toLowerCase()==="removed"?e.split(this.pattern).filter(n=>n):Mi(e,this.pattern)}},bu=yu,wu=class extends Fe{constructor(e){super(),this.config=e,this.pattern=new RegExp(`[^${Vn}]+|[${Vn}]+`,"gu")}pre_tokenize_text(e){return e.match(this.pattern)||[]}},_u=wu,vu=class extends Fe{constructor(e){super(),this.config=e;let n=`[^\\d]+|\\d${this.config.individual_digits?"":"+"}`;this.pattern=new RegExp(n,"gu")}pre_tokenize_text(e){return e.match(this.pattern)||[]}},Su=vu,Tu=class extends Fe{constructor(){super(),this.pattern=new RegExp(`[^\\s${Vn}]+|[${Vn}]`,"gu")}pre_tokenize_text(e,n){return e.trim().match(this.pattern)||[]}},xu=Tu,ku=class extends Fe{constructor(e){super(),this.config=e,this.pattern=Qn(this.config.pattern??{}),this.content=this.config.content??""}pre_tokenize_text(e){return this.pattern===null?[e]:[e.replaceAll(this.pattern,this.config.content??"")]}},Eu=ku,Pu=class extends Fe{constructor(e){super(),this.tokenizers=(e.pretokenizers??[]).map(n=>ua(n))}pre_tokenize_text(e,n){return this.tokenizers.reduce((r,t)=>t?t.pre_tokenize(r,n):r,[e])}},Au=Pu,Gu=class extends Fe{pre_tokenize_text(e){return Bi(e)}},Ou=Gu,Ru=class extends Fe{constructor(e){super(),this.config=e,this._length=e.length}pre_tokenize_text(e){let n=[];for(let r=0;r<e.length;r+=this._length)n.push(e.slice(r,r+this._length));return n}},Wu=Ru;function Fu(e){if(e===null)return null;switch(e.type){case"BertPreTokenizer":return new xu;case"Sequence":return new Au(e);case"Whitespace":return new mu;case"WhitespaceSplit":return new Ou;case"Metaspace":return new hu(e);case"ByteLevel":return new pu(e);case"Split":return new bu(e);case"Punctuation":return new _u(e);case"Digits":return new Su(e);case"Replace":return new Eu(e);case"FixedLength":return new Wu(e);default:throw new Error(`Unknown PreTokenizer type: ${e.type}`)}}var ua=Fu,Mu=class extends Sn{constructor(e){super(),this.config=e,this.vocab=[],this.tokens_to_ids=new Map,this.unk_token_id=void 0,this.unk_token=void 0,this.end_of_word_suffix=void 0,this.fuse_unk=this.config.fuse_unk??!1}_call(e){let n=this.encode(e);return this.fuse_unk&&(n=Gi(n,this.tokens_to_ids,this.unk_token_id)),n}},Zn=Mu,Bu=class extends Zn{constructor(e){super(e),this.max_input_chars_per_word=100,this.tokens_to_ids=Dr(e.vocab),this.unk_token_id=this.tokens_to_ids.get(e.unk_token),this.unk_token=e.unk_token,this.max_input_chars_per_word=e.max_input_chars_per_word??100,this.vocab=new Array(this.tokens_to_ids.size);for(let[n,r]of this.tokens_to_ids)this.vocab[r]=n}encode(e){let n=[];for(let r of e){let t=[...r];if(t.length>this.max_input_chars_per_word){n.push(this.unk_token);continue}let a=!1,s=0,o=[];for(;s<t.length;){let i=t.length,u=null;for(;s<i;){let l=t.slice(s,i).join("");if(s>0&&(l=this.config.continuing_subword_prefix+l),this.tokens_to_ids.has(l)){u=l;break}--i}if(u===null){a=!0;break}o.push(u),s=i}a?n.push(this.unk_token):n.push(...o)}return n}},na=Bu,ra=class la{constructor(n,r){this.is_leaf=n,this.children=r}static default(){return new la(!1,new Map)}},qu=class{constructor(){this.root=ra.default()}extend(e){for(let n of e)this.push(n)}push(e){let n=this.root;for(let r of e){let t=n.children.get(r);t===void 0&&(t=ra.default(),n.children.set(r,t)),n=t}n.is_leaf=!0}*common_prefix_search(e){let n=this.root;if(n===void 0)return;let r="";for(let t of e){if(r+=t,n=n.children.get(t),n===void 0)return;n.is_leaf&&(yield r)}}},Iu=qu,qr=class ca{constructor(n,r,t,a,s){this.token_id=n,this.node_id=r,this.pos=t,this.length=a,this.score=s,this.prev=null,this.backtrace_score=0}clone(){let n=new ca(this.token_id,this.node_id,this.pos,this.length,this.score);return n.prev=this.prev,n.backtrace_score=this.backtrace_score,n}},Du=class{constructor(e,n,r){this.chars=Array.from(e),this.len=this.chars.length,this.bos_token_id=n,this.eos_token_id=r,this.nodes=[],this.begin_nodes=Array.from({length:this.len+1},()=>[]),this.end_nodes=Array.from({length:this.len+1},()=>[]);let t=new qr(this.bos_token_id??0,0,0,0,0),a=new qr(this.eos_token_id??0,1,this.len,0,0);this.nodes.push(t.clone()),this.nodes.push(a.clone()),this.begin_nodes[this.len].push(a),this.end_nodes[0].push(t)}insert(e,n,r,t){let a=this.nodes.length,s=new qr(t,a,e,n,r);this.begin_nodes[e].push(s),this.end_nodes[e+n].push(s),this.nodes.push(s)}viterbi(){let e=this.len,n=0;for(;n<=e;){if(this.begin_nodes[n].length==0)return[];for(let o of this.begin_nodes[n]){o.prev=null;let i=0,u=null;for(let l of this.end_nodes[n]){let c=l.backtrace_score+o.score;(u===null||c>i)&&(u=l.clone(),i=c)}if(u!==null)o.prev=u,o.backtrace_score=i;else return[]}++n}let r=[],a=this.begin_nodes[e][0].prev;if(a===null)return[];let s=a.clone();for(;s.prev!==null;)r.push(s.clone()),s=s.clone().prev.clone();return r.reverse(),r}piece(e){return this.chars.slice(e.pos,e.pos+e.length).join("")}tokens(){return this.viterbi().map(n=>this.piece(n))}token_ids(){return this.viterbi().map(n=>n.token_id)}},Uu=Du;function Lu(e){if(e.length===0)throw new Error("Array must not be empty");let n=e[0],r=0;for(let t=1;t<e.length;++t)e[t]<n&&(n=e[t],r=t);return[n,r]}var Cu=class extends Zn{constructor(e,n){super(e);let r=e.vocab.length;this.vocab=new Array(r),this.scores=new Array(r);for(let t=0;t<r;++t)[this.vocab[t],this.scores[t]]=e.vocab[t];this.unk_token_id=e.unk_id,this.unk_token=this.vocab[e.unk_id],this.tokens_to_ids=new Map(this.vocab.map((t,a)=>[t,a])),this.bos_token=" ",this.bos_token_id=this.tokens_to_ids.get(this.bos_token),this.eos_token=n,this.eos_token_id=this.tokens_to_ids.get(this.eos_token),this.unk_token=this.vocab[this.unk_token_id],this.min_score=Lu(this.scores)[0],this.unk_score=this.min_score-10,this.scores[this.unk_token_id]=this.unk_score,this.trie=new Iu,this.trie.extend(this.vocab),this.fuse_unk=!0}populate_nodes(e){let n=e.chars,r=1,t=0;for(;t<n.length;){let a=!1,s=[],o=n.slice(t).join(""),i=this.trie.common_prefix_search(o);for(let u of i){s.push(u);let l=this.tokens_to_ids.get(u),c=this.scores[l],d=Wi(u);e.insert(t,d,c,l),!a&&d===r&&(a=!0)}a||e.insert(t,r,this.unk_score,this.unk_token_id),t+=r}}tokenize(e){let n=new Uu(e,this.bos_token_id,this.eos_token_id);return this.populate_nodes(n),n.tokens()}encode(e){let n=[];for(let r of e){let t=this.tokenize(r);n.push(...t)}return n}},ta=Cu,Nu=class{constructor(e=(r,t)=>r>t,n=1/0){this._heap=[],this._comparator=e,this._max_size=n}get size(){return this._heap.length}is_empty(){return this.size===0}peek(){return this._heap[0]}push(...e){return this.extend(e)}extend(e){for(let n of e)if(this.size<this._max_size)this._heap.push(n),this._sift_up();else{let r=this._smallest();this._comparator(n,this._heap[r])&&(this._heap[r]=n,this._sift_up_from(r))}return this.size}pop(){let e=this.peek(),n=this.size-1;return n>0&&this._swap(0,n),this._heap.pop(),this._sift_down(),e}replace(e){let n=this.peek();return this._heap[0]=e,this._sift_down(),n}_parent(e){return(e+1>>>1)-1}_left(e){return(e<<1)+1}_right(e){return e+1<<1}_greater(e,n){return this._comparator(this._heap[e],this._heap[n])}_swap(e,n){let r=this._heap[e];this._heap[e]=this._heap[n],this._heap[n]=r}_sift_up(){this._sift_up_from(this.size-1)}_sift_up_from(e){for(;e>0&&this._greater(e,this._parent(e));)this._swap(e,this._parent(e)),e=this._parent(e)}_sift_down(){let e=0;for(;this._left(e)<this.size&&this._greater(this._left(e),e)||this._right(e)<this.size&&this._greater(this._right(e),e);){let n=this._right(e)<this.size&&this._greater(this._right(e),this._left(e))?this._right(e):this._left(e);this._swap(e,n),e=n}}_smallest(){return 2**Math.floor(Math.log2(this.size))-1}},zu=Nu,ju=class{constructor(e){this.capacity=e,this.cache=new Map}get(e){if(!this.cache.has(e))return;let n=this.cache.get(e);return this.cache.delete(e),this.cache.set(e,n),n}put(e,n){this.cache.has(e)&&this.cache.delete(e),this.cache.set(e,n),this.cache.size>this.capacity&&this.cache.delete(this.cache.keys().next().value)}clear(){this.cache.clear()}},$u=ju,Ku=class extends Zn{constructor(e){super(e),this.tokens_to_ids=Dr(e.vocab),this.unk_token_id=this.tokens_to_ids.get(e.unk_token),this.unk_token=e.unk_token,this.vocab=new Array(this.tokens_to_ids.size);for(let[r,t]of this.tokens_to_ids)this.vocab[t]=r;let n=Array.isArray(e.merges[0]);this.merges=n?e.merges:e.merges.map(r=>r.split(" ",2)),this.bpe_ranks=new Map(this.merges.map((r,t)=>[JSON.stringify(r),t])),this.end_of_word_suffix=e.end_of_word_suffix,this.continuing_subword_suffix=e.continuing_subword_suffix??null,this.byte_fallback=this.config.byte_fallback??!1,this.byte_fallback&&(this.text_encoder=new TextEncoder),this.ignore_merges=this.config.ignore_merges??!1,this.max_length_to_cache=256,this.cache_capacity=1e4,this.cache=new $u(this.cache_capacity)}clear_cache(){this.cache.clear()}bpe(e){if(e.length===0)return[];let n=this.cache.get(e);if(n!==void 0)return n;let r=Array.from(e);this.end_of_word_suffix&&(r[r.length-1]+=this.end_of_word_suffix);let t=[];if(r.length>1){let a=new zu((i,u)=>i.score<u.score),s={token:r[0],bias:0,prev:null,next:null},o=s;for(let i=1;i<r.length;++i){let u={bias:i/r.length,token:r[i],prev:o,next:null};o.next=u,this.add_node(a,o),o=u}for(;!a.is_empty();){let i=a.pop();if(i.deleted||!i.next||i.next.deleted)continue;if(i.deleted=!0,i.next.deleted=!0,i.prev){let l={...i.prev};i.prev.deleted=!0,i.prev=l,l.prev?l.prev.next=l:s=l}let u={token:i.token+i.next.token,bias:i.bias,prev:i.prev,next:i.next.next};u.prev?(u.prev.next=u,this.add_node(a,u.prev)):s=u,u.next&&(u.next.prev=u,this.add_node(a,u))}for(let i=s;i!==null;i=i.next)t.push(i.token)}else t=r;if(this.continuing_subword_suffix)for(let a=0;a<t.length-1;++a)t[a]+=this.continuing_subword_suffix;return e.length<this.max_length_to_cache&&this.cache.put(e,t),t}add_node(e,n){let r=this.bpe_ranks.get(JSON.stringify([n.token,n.next.token]));r!==void 0&&(n.score=r+n.bias,e.push(n))}encode(e){let n=[];for(let r of e){if(this.ignore_merges&&this.tokens_to_ids.has(r)){n.push(r);continue}let t=this.bpe(r);for(let a of t)if(this.tokens_to_ids.has(a))n.push(a);else if(this.byte_fallback){let s=Array.from(this.text_encoder.encode(a)).map(o=>`<0x${o.toString(16).toUpperCase().padStart(2,"0")}>`);s.every(o=>this.tokens_to_ids.has(o))?n.push(...s):this.unk_token!=null&&n.push(this.unk_token)}else this.unk_token!=null&&n.push(this.unk_token)}return n}},aa=Ku,Hu=class extends Zn{constructor(e,n){super(e);let r=e.vocab;this.tokens_to_ids=Dr(n.target_lang?r[n.target_lang]:r),this.bos_token=n.bos_token,this.bos_token_id=this.tokens_to_ids.get(this.bos_token),this.eos_token=n.eos_token,this.eos_token_id=this.tokens_to_ids.get(this.eos_token),this.pad_token=n.pad_token,this.pad_token_id=this.tokens_to_ids.get(this.pad_token),this.unk_token=n.unk_token,this.unk_token_id=this.tokens_to_ids.get(this.unk_token),this.vocab=new Array(this.tokens_to_ids.size);for(let[t,a]of this.tokens_to_ids)this.vocab[a]=t}encode(e){return e}},Vu=Hu;function Qu(e,n){switch(e.type){case"WordPiece":return new na(e);case"Unigram":return new ta(e,n.eos_token);case"BPE":return new aa(e);default:if(e.vocab)return Array.isArray(e.vocab)?new ta(e,n.eos_token):Object.hasOwn(e,"continuing_subword_prefix")&&Object.hasOwn(e,"unk_token")?Object.hasOwn(e,"merges")?new aa(e):new na(e):new Vu(e,{target_lang:n.target_lang,bos_token:n.bos_token,eos_token:n.eos_token,pad_token:n.pad_token,unk_token:n.unk_token});throw new Error(`Unknown TokenizerModel type: ${e?.type}`)}}var Xu=Qu,Zu=class extends Sn{constructor(e){super(),this.config=e}_call(e,...n){return this.post_process(e,...n)}},Tn=Zu,Yu=class extends Tn{post_process(e,n=null,r=!0){let t=n===null?this.config.single:this.config.pair,a=[],s=[];for(let o of t)"SpecialToken"in o?r&&(a.push(o.SpecialToken.id),s.push(o.SpecialToken.type_id)):"Sequence"in o&&(o.Sequence.id==="A"?(a=We(a,e),s=We(s,new Array(e.length).fill(o.Sequence.type_id))):o.Sequence.id==="B"&&(a=We(a,n),s=We(s,new Array(n.length).fill(o.Sequence.type_id))));return{tokens:a,token_type_ids:s}}},Ju=Yu,el=class extends Tn{post_process(e,n=null){return{tokens:e,tokens_pair:n}}},nl=el,rl=class extends Tn{constructor(e){super(e),this.sep=e.sep,this.cls=e.cls}post_process(e,n=null,r=!0){r&&(e=We([this.cls[0]],e,[this.sep[0]]));let t=new Array(e.length).fill(0);if(n){let a=[],s=r?[this.sep[0]]:[];e=We(e,a,n,s),t=We(t,new Array(n.length+a.length+s.length).fill(1))}return{tokens:e,token_type_ids:t}}},tl=rl,al=class extends Tn{constructor(e){super(e),this.sep=e.sep,this.cls=e.cls}post_process(e,n,r=!0){r&&(e=We([this.cls[0]],e,[this.sep[0]]));let t=new Array(e.length).fill(0);if(n){let a=r?[this.sep[0]]:[],s=r?[this.sep[0]]:[];e=We(e,a,n,s),t=We(t,new Array(n.length+a.length+s.length).fill(1))}return{tokens:e,token_type_ids:t}}},sl=al,ol=class extends Tn{constructor(e){super(e),this.processors=(e.processors??[]).map(n=>da(n))}post_process(e,n=null,r=!0){let t={tokens:e,tokens_pair:n};for(let a of this.processors)t=a.post_process(t.tokens,t.tokens_pair,r);return t}},il=ol;function ul(e){if(e===null)return null;switch(e.type){case"TemplateProcessing":return new Ju(e);case"ByteLevel":return new nl(e);case"BertProcessing":return new tl(e);case"RobertaProcessing":return new sl(e);case"Sequence":return new il(e);default:throw new Error(`Unknown PostProcessor type: ${e.type}`)}}var da=ul,ll=class extends Sn{constructor(e){super(),this.config=e,this.added_tokens=[],this.end_of_word_suffix=null,this.trim_offsets="trim_offsets"in e?e.trim_offsets:!1}_call(e){return this.decode(e)}decode(e){return this.decode_chain(e).join("")}},Ue=ll,cl=class extends Ue{constructor(e){super(e),this.byte_decoder=Ei,this.text_decoder=new TextDecoder("utf-8",{fatal:!1,ignoreBOM:!0}),this.end_of_word_suffix=null}convert_tokens_to_string(e){let n=e.join(""),r=new Uint8Array([...n].map(t=>this.byte_decoder[t]));return this.text_decoder.decode(r)}decode_chain(e){let n=[],r=[];for(let t of e)this.added_tokens.find(a=>a.content===t)!==void 0?(r.length>0&&(n.push(this.convert_tokens_to_string(r)),r=[]),n.push(t)):r.push(t);return r.length>0&&n.push(this.convert_tokens_to_string(r)),n}},dl=cl,pl=class extends Ue{constructor(e){super(e),this.cleanup=e.cleanup}decode_chain(e){return e.map((n,r)=>{if(r!==0){let t=this.config.prefix;t&&n.startsWith(t)?n=n.replace(t,""):n=" "+n}return this.cleanup&&(n=Ir(n)),n})}},fl=pl,ml=class extends Ue{constructor(e){super(e),this.replacement=e.replacement??"\u2581"}decode_chain(e){let n=[];for(let r=0;r<e.length;++r){let t=e[r].replaceAll(this.replacement," ");r==0&&t.startsWith(" ")&&(t=t.substring(1)),n.push(t)}return n}},gl=ml,hl=class extends Ue{constructor(e){super(e),this.suffix=e.suffix??""}decode_chain(e){return e.map((n,r)=>n.replaceAll(this.suffix,r===e.length-1?"":" "))}},yl=hl,bl=class extends Ue{constructor(e){super(e),this.pad_token=e.pad_token??"",this.word_delimiter_token=e.word_delimiter_token??"",this.cleanup=e.cleanup}convert_tokens_to_string(e){if(e.length===0)return"";let n=[e[0]];for(let a=1;a<e.length;++a)e[a]!==n.at(-1)&&n.push(e[a]);let t=n.filter(a=>a!==this.pad_token).join("");return this.cleanup&&(t=Ir(t).replaceAll(this.word_delimiter_token," ").trim()),t}decode_chain(e){return[this.convert_tokens_to_string(e)]}},wl=bl,_l=class extends Ue{constructor(e){super(e),this.decoders=(e.decoders??[]).map(n=>pa(n))}decode_chain(e){return this.decoders.reduce((n,r)=>r.decode_chain(n),e)}},vl=_l,Sl=class extends Ue{decode_chain(e){let n=Qn(this.config.pattern),r=this.config.content??"";return n===null?e:e.map(t=>t.replaceAll(n,r))}},Tl=Sl,xl=class extends Ue{decode_chain(e){return[e.join("")]}},kl=xl,El=class extends Ue{constructor(e){super(e),this.content=e.content??"",this.start=e.start??0,this.stop=e.stop??0}decode_chain(e){return e.map(n=>{let r=0;for(let a=0;a<this.start&&n[a]===this.content;++a){r=a+1;continue}let t=n.length;for(let a=0;a<this.stop;++a){let s=n.length-a-1;if(n[s]===this.content){t=s;continue}else break}return n.slice(r,t)})}},Pl=El,Al=class extends Ue{constructor(e){super(e),this.text_decoder=new TextDecoder}decode_chain(e){let n=[],r=[];for(let t of e){let a=null;if(t.length===6&&t.startsWith("<0x")&&t.endsWith(">")){let s=parseInt(t.slice(3,5),16);isNaN(s)||(a=s)}if(a!==null)r.push(a);else{if(r.length>0){let s=this.text_decoder.decode(Uint8Array.from(r));n.push(s),r=[]}n.push(t)}}if(r.length>0){let t=this.text_decoder.decode(Uint8Array.from(r));n.push(t),r=[]}return n}},Gl=Al;function Ol(e){if(e===null)return null;switch(e.type){case"ByteLevel":return new dl(e);case"WordPiece":return new fl(e);case"Metaspace":return new gl(e);case"BPEDecoder":return new yl(e);case"CTC":return new wl(e);case"Sequence":return new vl(e);case"Replace":return new Tl(e);case"Fuse":return new kl(e);case"Strip":return new Pl(e);case"ByteFallback":return new Gl(e);default:throw new Error(`Unknown Decoder type: ${e.type}`)}}var pa=Ol,Rl=class{constructor(e,n){let r=ea(e,"Tokenizer",["model","decoder","post_processor","pre_tokenizer","normalizer"]);if(r)throw new Error(r);let t=ea(n,"Config");if(t)throw new Error(t);this.tokenizer=e,this.config=n,this.normalizer=ia(this.tokenizer.normalizer),this.pre_tokenizer=ua(this.tokenizer.pre_tokenizer),this.model=Xu(this.tokenizer.model,this.config),this.post_processor=da(this.tokenizer.post_processor),this.decoder=pa(this.tokenizer.decoder),this.special_tokens=[],this.all_special_ids=[],this.added_tokens=[];let a=[],s=[];this.added_tokens_map=new Map;for(let o of this.tokenizer.added_tokens){let i=new xi(o);if(this.added_tokens.push(i),this.model.tokens_to_ids.set(i.content,i.id),this.model.vocab[i.id]=i.content,i.special&&(this.special_tokens.push(i.content),this.all_special_ids.push(i.id)),this.added_tokens_map.set(i.content,i),i.normalized&&this.normalizer!==null){let u=this.normalizer(i.content);s.push(u),this.added_tokens_map.set(u,i)}else a.push(i.content)}(this.config.additional_special_tokens??[]).forEach(o=>{this.special_tokens.includes(o)||this.special_tokens.push(o)}),this.decoder&&(this.decoder.added_tokens=this.added_tokens,this.decoder.end_of_word_suffix=this.model.end_of_word_suffix),this.splitter_unnormalized=new Yt(a),this.splitter_normalized=new Yt(s),this.remove_space=this.config.remove_space,this.clean_up_tokenization_spaces=this.config.clean_up_tokenization_spaces??!0,this.do_lowercase_and_remove_accent=this.config.do_lowercase_and_remove_accent??!1}encode(e,{text_pair:n=null,add_special_tokens:r=!0,return_token_type_ids:t=null}={}){let{tokens:a,token_type_ids:s}=this.tokenize_helper(e,{text_pair:n,add_special_tokens:r}),o=a.map(u=>this.added_tokens_map.get(u)?.id??this.model.tokens_to_ids.get(u)??this.model.unk_token_id),i={ids:o,tokens:a,attention_mask:new Array(o.length).fill(1)};return t&&s&&(i.token_type_ids=s),i}decode(e,n={}){if(!Array.isArray(e)||e.length===0||!Ri(e[0]))throw Error("token_ids must be a non-empty array of integers.");let r=e.map(a=>this.model.vocab[Number(a)]??this.model.unk_token);n.skip_special_tokens&&(r=r.filter(a=>!this.special_tokens.includes(a)));let t=this.decoder?this.decoder(r):r.join(" ");return this.decoder&&this.decoder.end_of_word_suffix&&(t=t.replaceAll(this.decoder.end_of_word_suffix," "),n.skip_special_tokens&&(t=t.trim())),(n.clean_up_tokenization_spaces??this.clean_up_tokenization_spaces)&&(t=Ir(t)),t}tokenize(e,{text_pair:n=null,add_special_tokens:r=!1}={}){return this.tokenize_helper(e,{text_pair:n,add_special_tokens:r}).tokens}encode_text(e){if(e===null)return null;let n=this.splitter_unnormalized.split(e);return n.forEach((r,t)=>{let a=this.added_tokens_map.get(r);a&&(a.lstrip&&t>0&&(n[t-1]=n[t-1].trimEnd()),a.rstrip&&t<n.length-1&&(n[t+1]=n[t+1].trimStart()))}),n.flatMap((r,t)=>{if(r.length===0)return[];if(this.added_tokens_map.has(r))return[r];if(this.remove_space===!0&&(r=r.trim().split(/\s+/).join(" ")),this.do_lowercase_and_remove_accent&&(r=Fi(r)),this.normalizer!==null&&(r=this.normalizer(r)),r.length===0)return[];let a=this.splitter_normalized.split(r);return a.forEach((s,o)=>{let i=this.added_tokens_map.get(s);i&&(i.lstrip&&o>0&&(a[o-1]=a[o-1].trimEnd()),i.rstrip&&o<a.length-1&&(a[o+1]=a[o+1].trimStart()))}),a.flatMap(s=>{if(s.length===0)return[];if(this.added_tokens_map.has(s))return[s];let o=this.pre_tokenizer!==null?this.pre_tokenizer(s,{section_index:t}):[s];return this.model(o)})})}tokenize_helper(e,{text_pair:n=null,add_special_tokens:r=!0}){let t=this.encode_text(e),a=this.encode_text(n||null);return this.post_processor?this.post_processor(t,a,r):{tokens:We(t??[],a??[])}}token_to_id(e){return this.model.tokens_to_ids.get(e)}id_to_token(e){return this.model.vocab[e]}get_added_tokens_decoder(){let e=new Map;for(let n of this.added_tokens)e.set(n.id,n);return e}get_vocab(e=!0){let n=new Map;for(let r=0;r<this.model.vocab.length;++r){let t=this.model.vocab[r];(e||!this.added_tokens_map.has(t))&&n.set(t,r)}return n}},fa=Rl;hs();async function dt(e={}){let n=globalThis.navigator?.gpu;if(!n)throw new Error("WebGPU is not available in this browser context");let r=await n.requestAdapter({powerPreference:e.powerPreference??"high-performance"});if(!r)throw new Error("No WebGPU adapter was returned");let t=await r.requestDevice({requiredFeatures:ps(r,e.disabledFeatures),requiredLimits:e.requiredLimits??ms(r),label:e.label??"webgpu-ml-runtime"});return t.addEventListener("uncapturederror",a=>{console.error("WebGPU uncaptured error:",a.error)}),gs({gpu:n,adapter:r,device:t,deviceInfo:fs(t,r,n),destroy:()=>t.destroy()})}Wn();var Vc=Object.freeze(["embed","qkv","qk_norm","rope_cache","attention","o_proj","conv","rms_norm","mlp","lm_head","other"]),Qc=new Set(Vc);function bs({label:e="profile",events:n=[],timestampUnit:r="ns"}={}){let t=n.map((i,u)=>Xc(i,u)),a=t.reduce((i,u)=>i+u.durationMs,0),s=ys(t,i=>i.group,a),o=ys(t.filter(i=>i.layer!==void 0),i=>`layer.${i.layer}`,a);return{label:e,timestampUnit:r,totalGpuMs:a,dispatchCount:t.length,groups:s,layers:o,events:t}}function pt({name:e="",cacheKey:n="",profile:r=null}={}){let t=Zc(n),a={model:r?.model??t.config?.model_type,phase:r?.phase??Yc(e,t),layer:r?.layer??t.layer,part:r?.part??t.part??Jc(e),...r};return a.group=nd(a.group??ed(a.part,e)),Object.fromEntries(Object.entries(a).filter(([,s])=>s!==void 0))}function Xc(e,n){let r=pt(e);return{index:n,name:e.name,cacheKey:e.cacheKey,dispatchWorkgroups:e.dispatchWorkgroups,startTimestamp:e.startTimestamp,endTimestamp:e.endTimestamp,durationMs:e.durationMs??0,model:r.model,phase:r.phase,layer:r.layer,part:r.part,group:r.group}}function ys(e,n,r){let t=new Map;for(let a of e){let s=n(a),o=t.get(s)??{group:s,dispatches:0,totalGpuMs:0};o.dispatches+=1,o.totalGpuMs+=a.durationMs,t.set(s,o)}return Array.from(t.values()).map(a=>({...a,meanGpuMs:a.dispatches>0?a.totalGpuMs/a.dispatches:0,percent:r>0?a.totalGpuMs/r*100:0})).sort((a,s)=>s.totalGpuMs-a.totalGpuMs)}function Zc(e){if(typeof e!="string")return{};let n=e.split("|weights:")[0],r=n.indexOf("{"),t=n.lastIndexOf("}"),a=r>=0&&t>r?n.slice(r,t+1):n;try{return JSON.parse(a)}catch{return{}}}function Yc(e,n){if(n.kind?.includes("decode")||e.includes("decode"))return"decode";if(n.kind?.includes("megakernel")||e.includes("causal_lm"))return"forward"}function Jc(e){return e.replace(/^llama_decode_/,"").replace(/^lfm2_decode_/,"").replace(/^llama_/,"")}function ed(e="",n=""){let r=`${e} ${n}`.toLowerCase();return r.includes("embed")?"embed":r.includes("qkv")?"qkv":r.includes("qk_head_norm")||r.includes("qk_norm")?"qk_norm":r.includes("rope_cache")?"rope_cache":r.includes("attention")?"attention":r.includes("o_proj")||r.includes("out_proj")?"o_proj":r.includes("conv")?"conv":r.includes("lm_head")||r.includes("argmax")||r.includes("final")?"lm_head":r.includes("gate")||r.includes("up")||r.includes("down_proj")?"mlp":r.includes("norm")?"rms_norm":"other"}function nd(e){return typeof e=="string"&&Qc.has(e)?e:"other"}var ln=class{runtime;dtype;shape;strides;byteOffset;layout;encoding;components;storage;buffer;size;byteLength;destroyed;constructor({runtime:n,dtype:r,shape:t,buffer:a,strides:s=Ca(t),byteOffset:o=0,layout:i,encoding:u,components:l,storage:c="buffer"}){this.runtime=n,this.dtype=r,this.shape=t,this.strides=s,this.byteOffset=o,this.layout=i,this.encoding=u,this.components=l,this.storage=c,this.buffer=a,this.size=Ve(t),this.byteLength=this.size*Rn(r),this.destroyed=!1}destroy(){this.destroyed||(this.buffer.destroy(),this.destroyed=!0)}},gr=class{host;pipelineCache;bindGroupCache;maxBindGroupCacheEntries;bufferIds;nextBufferId;profileSession;readbackPool;readbackPoolBytes;maxReadbackPoolBytes;destroyed;captureShaders;capturedShaders;constructor({host:n}){this.host=n,this.captureShaders=!1,this.capturedShaders=new Map,this.pipelineCache=new Map,this.bindGroupCache=new Map,this.maxBindGroupCacheEntries=4096,this.bufferIds=new WeakMap,this.nextBufferId=1,this.profileSession=null,this.readbackPool=new Map,this.readbackPoolBytes=0,this.maxReadbackPoolBytes=64*1024*1024,this.destroyed=!1}get device(){return this.host.deviceInfo}getRenderedShaders(){return[...this.capturedShaders].map(([n,r])=>({name:n,source:r}))}async destroy(){this.destroyed||(this.destroyed=!0,this.clearTransientCaches(),this.clearReadbackPool(),await this.host.destroy())}clearReadbackPool(){let n=0;for(let r of this.readbackPool.values())for(let t of r)t.destroy(),n++;return this.readbackPool.clear(),this.readbackPoolBytes=0,n}clearTransientCaches(){return{bindGroups:this.clearBindGroupCache()}}clearBindGroupCache(){let n=this.bindGroupCache.size;return this.bindGroupCache.clear(),n}startProfiling(n={}){if(this.profileSession!==null)throw new Error("A profiling session is already active");if(!this.device.features.has("timestamp-query"))throw new Error("Kernel profiling requires the WebGPU timestamp-query feature");this.profileSession={label:n.label??"kernel-profile",events:[]}}async stopProfiling(){if(this.profileSession===null)throw new Error("No profiling session is active");let n=this.profileSession;return this.profileSession=null,bs({label:n.label,events:n.events,timestampUnit:"ns"})}tensorFromTypedArray(n,r,t){if(!rd(n,t))throw new Error("Only float16/Uint16Array, float32/Float32Array and uint32/Uint32Array tensors are supported");let a=Ve(r);if(t.length!==a)throw new Error(`tensor data length ${t.length} does not match shape element count ${a}`);let s=this.host.createBuffer({label:"tensor",size:ft(t.byteLength),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC,mappedAtCreation:!0}),o=s.getMappedRange();return t instanceof Float32Array?new Float32Array(o).set(t):t instanceof Uint16Array?new Uint16Array(o).set(t):t instanceof Int32Array?new Int32Array(o).set(t):new Uint32Array(o).set(t),s.unmap(),new ln({runtime:this,dtype:n,shape:r,buffer:s})}allocateWeightsBuffer({byteLength:n,dtype:r,shape:t,label:a="weights"}){if(!ws(r))throw new Error(`Unsupported dtype: ${r}`);if(!Number.isInteger(n)||n<0)throw new Error(`byteLength must be a nonnegative integer, got ${n}`);let s=this.host.createBuffer({label:a,size:n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC});return new ln({runtime:this,dtype:r,shape:t,buffer:s})}writeWeightsRange(n,r,t){if(!(n instanceof ln))throw new Error("writeWeightsRange expects a WebGpuTensor");if(!Number.isInteger(r)||r<0)throw new Error(`byteOffset must be a nonnegative integer, got ${r}`);if(r+t.byteLength>n.byteLength)throw new Error(`write range [${r}, ${r+t.byteLength}] exceeds tensor byteLength ${n.byteLength}`);this.host.writeBuffer(n.buffer,r,t)}async copyBufferToBuffer({src:n,dst:r,srcOffset:t=0,dstOffset:a=0,byteLength:s,wait:o=!1}){if(s===0)return;let i=cn(n),u=cn(r),l=this.host.device.createCommandEncoder({label:"copyBufferToBuffer"});l.copyBufferToBuffer(i,t,u,a,s),await this.host.submit([l.finish()],{wait:o})}async queueIdle(){await this.host.device.queue.onSubmittedWorkDone()}empty(n,r,t="tensor-output"){if(!ws(n))throw new Error(`Unsupported dtype: ${n}`);let a=Ve(r)*Rn(n),s=this.host.createBuffer({label:t,size:ft(a),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});return new ln({runtime:this,dtype:n,shape:r,buffer:s})}readTensor(n){if(n.byteLength===0)return n.dtype===ee.float32?Promise.resolve(new Float32Array(0)):n.dtype===ee.float16?Promise.resolve(new Uint16Array(0)):n.dtype===ee.int8?Promise.resolve(new Int32Array(0)):n.dtype===ee.int32?Promise.resolve(new Int32Array(0)):n.dtype===ee.uint8?Promise.resolve(new Uint32Array(0)):n.dtype===ee.uint32?Promise.resolve(new Uint32Array(0)):Promise.reject(new Error(`Unsupported dtype: ${n.dtype}`));let r=ft(n.byteLength),t=this.#e(r),a=this.host.device.createCommandEncoder({label:"readTensor"});a.copyBufferToBuffer(n.buffer,0,t,0,r),this.host.device.queue.submit([a.finish()]);let{dtype:s,byteLength:o}=n;return(async()=>{let i;try{i=await this.host.mapRead(t,0,r)}catch(u){throw this.#r(r,t),u}if(this.#r(r,t),r!==o&&(i=i.slice(0,o)),s===ee.float32)return new Float32Array(i);if(s===ee.float16)return new Uint16Array(i);if(s===ee.int8)return new Int32Array(i);if(s===ee.int32)return new Int32Array(i);if(s===ee.uint8)return new Uint32Array(i);if(s===ee.uint32)return new Uint32Array(i);throw new Error(`Unsupported dtype: ${s}`)})()}#e(n){let r=this.readbackPool.get(n);return r&&r.length>0?(this.readbackPoolBytes-=n,r.pop()):this.host.createBuffer({label:"tensor-readback",size:n,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ})}#r(n,r){if(this.readbackPoolBytes+n>this.maxReadbackPoolBytes){r.destroy();return}let t=this.readbackPool.get(n);t||(t=[],this.readbackPool.set(n,t)),t.push(r),this.readbackPoolBytes+=n}async runProgram(n,r={}){await this.runProgramSequence([n],r)}async runProgramSequence(n,r={}){let t=await this.prepareProgramSequence(n);await this.executePreparedProgramSequence(t,r)}async prepareProgramSequence(n){if(!Array.isArray(n)||n.length===0)throw new Error("prepareProgramSequence requires at least one program");let r=[];for(let t of n){if(td(t)){r.push(ad(t));continue}let{name:a,source:s,entryPoint:o="main",cacheKey:i=a,bindings:u,dispatchWorkgroups:l,profile:c}=t;if(typeof s!="string"||s.length===0)throw new Error("program requires WGSL source");if(!Array.isArray(u)||u.length===0)throw new Error("program requires bindings");if(!Array.isArray(l)||l.length!==3)throw new Error("program requires a 3D dispatchWorkgroups array");let d=await this.programPipeline({name:a,source:s,entryPoint:o,cacheKey:i,layoutFactory:()=>this.pipelineLayout(a,u)}),{bindGroup:p,extraBindGroups:f}=this.cachedBindGroups({name:a,cacheKey:i,pipeline:d,bindings:u});r.push({pipeline:d,bindGroup:p,...f?{extraBindGroups:f}:{},dispatchWorkgroups:l,name:a,cacheKey:i,profile:c})}return r}async executePreparedProgramSequence(n,r={}){if(!Array.isArray(n)||n.length===0)throw new Error("executePreparedProgramSequence requires at least one prepared step");let t=r.wait??!1;await this._runSteps(n,{wait:t,mergePass:!this.profileSession})}enqueuePreparedProgramSequence(n){if(!Array.isArray(n)||n.length===0)throw new Error("enqueuePreparedProgramSequence requires at least one prepared step");if(this.profileSession)throw new Error("enqueuePreparedProgramSequence cannot be used while profiling");let r=this.host.device.createCommandEncoder({label:"compute-dispatch"});_s(r,n),this.host.device.queue.submit([r.finish()])}async measurePreparedSequenceGpuMs(n){if(!this.host.device.features.has("timestamp-query"))return null;let r=this.createTimestampResources(2);try{let t=this.host.device.createCommandEncoder({label:"gpu-time-measure"});for(let l of n)l.kind==="copy"&&l.byteLength>0&&t.copyBufferToBuffer(l.src,l.srcOffset,l.dst,l.dstOffset,l.byteLength);let a=t.beginComputePass({label:"gpu-time-pass",timestampWrites:{querySet:r.querySet,beginningOfPassWriteIndex:0,endOfPassWriteIndex:1}}),s=!1,o=null,i=null;for(let l of n)if(!(l.kind==="copy"||mr(l.dispatchWorkgroups))){if(l.pipeline!==o&&(a.setPipeline(l.pipeline),o=l.pipeline),l.bindGroup!==i&&(a.setBindGroup(0,l.bindGroup),i=l.bindGroup),l.extraBindGroups)for(let c of l.extraBindGroups)a.setBindGroup(c.group,c.bindGroup),c.group===0&&(i=c.bindGroup);a.dispatchWorkgroups(l.dispatchWorkgroups[0],l.dispatchWorkgroups[1],l.dispatchWorkgroups[2]),s=!0}if(a.end(),!s)return null;t.resolveQuerySet(r.querySet,0,2,r.resolveBuffer,0),t.copyBufferToBuffer(r.resolveBuffer,0,r.readbackBuffer,0,16),await this.host.submit([t.finish()],{wait:!0});let u=await this.readTimestampBuffer(r.readbackBuffer,2);return Number(u[1]-u[0])/1e6}finally{r.querySet.destroy(),r.resolveBuffer.destroy(),r.readbackBuffer.destroy()}}createUniformU32(n,r){let t=new Uint32Array(n),a=this.host.createBuffer({label:r,size:t.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});return this.host.writeBuffer(a,0,t),a}async _runSteps(n,{wait:r=!1,mergePass:t}){let a=!!this.profileSession,s=this.host.device.createCommandEncoder({label:a?"profiled-compute-dispatch":"compute-dispatch"});if(!a&&t){_s(s,n),await this.host.submit([s.finish()],{wait:r});return}let o=n.map((c,d)=>c.kind==="copy"||mr(c.dispatchWorkgroups)?-1:d).filter(c=>c>=0),i=a?o.length*2:0,u=a&&i>0?this.createTimestampResources(i):void 0,l=0;for(let c of n){if(c.kind==="copy"){c.byteLength>0&&s.copyBufferToBuffer(c.src,c.srcOffset,c.dst,c.dstOffset,c.byteLength);continue}if(mr(c.dispatchWorkgroups))continue;let d=s.beginComputePass({label:a?`${c.name??"compute"}-profile-pass`:"compute-pass",...a?{timestampWrites:{querySet:u.querySet,beginningOfPassWriteIndex:l*2,endOfPassWriteIndex:l*2+1}}:{}});if(d.setPipeline(c.pipeline),d.setBindGroup(0,c.bindGroup),c.extraBindGroups)for(let p of c.extraBindGroups)d.setBindGroup(p.group,p.bindGroup);d.dispatchWorkgroups(c.dispatchWorkgroups[0],c.dispatchWorkgroups[1],c.dispatchWorkgroups[2]),d.end(),l+=1}if(!a||u===void 0){await this.host.submit([s.finish()],{wait:r});return}try{s.resolveQuerySet(u.querySet,0,i,u.resolveBuffer,0),s.copyBufferToBuffer(u.resolveBuffer,0,u.readbackBuffer,0,i*8),await this.host.submit([s.finish()],{wait:r});let c=await this.readTimestampBuffer(u.readbackBuffer,i);for(let d=0;d<o.length;++d){let p=n[o[d]];!p||p.kind==="copy"||this.recordProfileEvent(p,c[d*2],c[d*2+1])}}finally{u.querySet.destroy(),u.resolveBuffer.destroy(),u.readbackBuffer.destroy()}}async programPipeline({name:n,source:r,entryPoint:t,cacheKey:a,layoutFactory:s}){return this._buildPipeline({cacheKey:a,name:n,entryPoint:t,layoutFactory:s,sourceFactory:()=>r})}async _buildPipeline({cacheKey:n,name:r,entryPoint:t,layoutFactory:a,sourceFactory:s}){let o=this.pipelineCache.get(n);if(o)return o;let i=await s();this.captureShaders&&!this.capturedShaders.has(r)&&this.capturedShaders.set(r,i);let u=this.host.createShaderModule(i,r),l=await this.host.createComputePipeline({label:r,layout:a(),compute:{module:u,entryPoint:t}});return this.pipelineCache.set(n,l),l}cachedBindGroups({name:n,cacheKey:r,pipeline:t,bindings:a}){let s=new Map;for(let l of a){let c=l.group??0,d=s.get(c);d?d.push(l):s.set(c,[l])}let o=[...s.keys()].sort((l,c)=>l-c),i=this.buildGroupBindGroup(n,r,t,0,s.get(0)??[]),u=o.filter(l=>l!==0).map(l=>({group:l,bindGroup:this.buildGroupBindGroup(n,r,t,l,s.get(l))}));return u.length>0?{bindGroup:i,extraBindGroups:u}:{bindGroup:i}}buildGroupBindGroup(n,r,t,a,s){let o=s.map((l,c)=>{let d=sd(l),p={buffer:d,offset:l.offset??0};return l.size!==void 0&&l.size>0&&(p.size=l.size),{binding:l.binding??c,resource:p,cachePart:`${l.binding??c}:${this.bufferId(d)}:${p.offset}:${p.size??""}`}}),i=`${r}|g${a}|${o.map(l=>l.cachePart).join("|")}`,u=this.bindGroupCache.get(i);if(u===void 0&&(u=this.host.device.createBindGroup({label:`${n}-bind-group-${a}`,layout:t.getBindGroupLayout(a),entries:o.map(({binding:l,resource:c})=>({binding:l,resource:c}))}),this.bindGroupCache.set(i,u),this.bindGroupCache.size>this.maxBindGroupCacheEntries)){let l=this.bindGroupCache.keys().next().value;l!==void 0&&this.bindGroupCache.delete(l)}return u}bufferId(n){let r=this.bufferIds.get(n);return r===void 0&&(r=this.nextBufferId++,this.bufferIds.set(n,r)),r}pipelineLayout(n,r){let t=r.map((i,u)=>typeof i=="string"?{group:0,binding:u,type:i}:{group:i.group??0,binding:i.binding??u,type:i.type}),a=new Set,s=0;for(let i of t){if(!Number.isInteger(i.binding)||i.binding<0)throw new Error(`pipeline layout ${n} has invalid binding index ${i.binding}`);if(!Number.isInteger(i.group)||i.group<0)throw new Error(`pipeline layout ${n} has invalid bind group index ${i.group}`);let u=`${i.group}:${i.binding}`;if(a.has(u))throw new Error(`pipeline layout ${n} has duplicate binding index ${i.binding} in @group(${i.group})`);if(typeof i.type!="string"||i.type.length===0)throw new Error(`pipeline layout ${n} binding ${i.binding} is missing a buffer type`);a.add(u),s=Math.max(s,i.group)}let o=[];for(let i=0;i<=s;++i)o.push(this.host.device.createBindGroupLayout({label:`${n}-bgl${i}`,entries:t.filter(u=>u.group===i).map(u=>({binding:u.binding,visibility:GPUShaderStage.COMPUTE,buffer:{type:u.type}}))}));return this.host.device.createPipelineLayout({label:`${n}-layout`,bindGroupLayouts:o})}createTimestampResources(n){let r=n*8,t=this.host.device.createQuerySet({type:"timestamp",count:n}),a=this.host.createBuffer({label:"kernel-profile-timestamp-resolve",size:r,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),s=this.host.createBuffer({label:"kernel-profile-timestamp-readback",size:r,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});return{querySet:t,resolveBuffer:a,readbackBuffer:s}}async readTimestampBuffer(n,r){let t=await this.host.mapRead(n,0,r*8),a=new BigUint64Array(t);return Array.from(a,s=>s)}recordProfileEvent(n,r,t){if(!this.profileSession)return;let a=t>r?t-r:0n,s=pt(n);this.profileSession.events.push({name:n.name,cacheKey:n.cacheKey,dispatchWorkgroups:n.dispatchWorkgroups,profile:n.profile,...s,startTimestamp:r.toString(),endTimestamp:t.toString(),durationMs:Number(a)/1e6})}};function rd(e,n){return e===ee.float16&&n instanceof Uint16Array||e===ee.float32&&n instanceof Float32Array||(e===ee.int8||e===ee.int32)&&n instanceof Int32Array||(e===ee.uint8||e===ee.uint32)&&n instanceof Uint32Array}function ws(e){return Object.values(ee).includes(e)}function ft(e){return Math.max(4,Math.ceil(e/4)*4)}function td(e){return e.kind==="copy"}function ad(e){if(!e.src||!e.dst)throw new Error("copy step requires src and dst (buffer or tensor)");let n=cn(e.src),r=cn(e.dst),t=e.srcOffset??0,a=e.dstOffset??0,s=e.byteLength;if(!Number.isInteger(s)||s<=0)throw new Error("copy step requires positive integer byteLength");return{kind:"copy",src:n,dst:r,srcOffset:t,dstOffset:a,byteLength:s,name:e.name??"copy"}}function sd(e){if(e.tensor!==void 0&&e.tensor!==null)return cn(e.tensor);if(e.buffer!==void 0&&e.buffer!==null)return cn(e.buffer);throw new Error(`binding ${e.binding??"?"} is missing tensor or buffer`)}function cn(e){return od(e)?e:e.buffer}function od(e){return e===null||typeof e!="object"?!1:"destroy"in e&&"mapAsync"in e&&"getMappedRange"in e&&!("buffer"in e)}function _s(e,n){let r=null,t=null,a=null,s=()=>{r!==null&&(r.end(),r=null),t=null,a=null};for(let o of n){if(o.kind==="copy"){s(),o.byteLength>0&&e.copyBufferToBuffer(o.src,o.srcOffset,o.dst,o.dstOffset,o.byteLength);continue}if(!mr(o.dispatchWorkgroups)){if(r===null&&(r=e.beginComputePass({label:"compute-sequence-pass"})),o.pipeline!==t&&(r.setPipeline(o.pipeline),t=o.pipeline),o.bindGroup!==a&&(r.setBindGroup(0,o.bindGroup),a=o.bindGroup),o.extraBindGroups)for(let i of o.extraBindGroups)r.setBindGroup(i.group,i.bindGroup),i.group===0&&(a=i.bindGroup);r.dispatchWorkgroups(o.dispatchWorkgroups[0],o.dispatchWorkgroups[1],o.dispatchWorkgroups[2])}}s()}function mr(e){return e[0]===0||e[1]===0||e[2]===0}async function vs(e={}){let n=e.host??await dt(e);return new gr({host:n})}var id=BigInt(1e8),ud=new TextDecoder("utf-8",{fatal:!0}),Ss=Object.freeze({BOOL:8,F4:4,F6_E2M3:6,F6_E3M2:6,U8:8,I8:8,F8_E5M2:8,F8_E4M3:8,F8_E8M0:8,F8_E4M3FNUZ:8,F8_E5M2FNUZ:8,I16:16,U16:16,F16:16,BF16:16,I32:32,U32:32,F32:32,F64:64,I64:64,U64:64,C64:64}),ld=Object.freeze({U8:Uint8Array,I8:Int8Array,I16:Int16Array,U16:Uint16Array,I32:Int32Array,U32:Uint32Array,F32:Float32Array,F64:Float64Array,I64:BigInt64Array,U64:BigUint64Array});function cd(e){let n=Ss[e];if(!n)throw new B(`Unknown dtype: ${e}`);return n}function Ts(e){return ld[e]??null}function xs(e,n){let r=n.BYTES_PER_ELEMENT;if(e.byteLength%r!==0)throw new B(`Byte length ${e.byteLength} not divisible by ${n.name} element size`);if(e.byteOffset%r===0)return new n(e.buffer,e.byteOffset,e.byteLength/r);let t=new ArrayBuffer(e.byteLength);return new Uint8Array(t).set(e),new n(t)}var B=class extends Error{constructor(n){super(n),this.name="SafeTensorsError"}};function ks(e){if(e.byteLength<8)throw new B(`File too small: ${e.byteLength} bytes < 8 byte header prefix`);let r=new DataView(e.buffer,e.byteOffset,e.byteLength).getBigUint64(0,!0);if(r>id)throw new B(`Header length ${r} exceeds maximum 100000000`);let t=Number(r),a=8+t;if(a>e.byteLength)throw new B(`Header length ${t} exceeds buffer size`);let s=e.subarray(8,a),o;try{o=ud.decode(s)}catch{throw new B("Header is not valid UTF-8")}let i;try{i=JSON.parse(o)}catch(u){let l=u instanceof Error?u.message:String(u);throw new B(`Header is not valid JSON: ${l}`)}if(i===null||typeof i!="object"||Array.isArray(i))throw new B("Header must be a JSON object");return{headerByteLength:t,dataStart:a,header:i}}function mt(e,n){let r=e.__metadata__;if(r!==void 0&&!pd(r))throw new B("__metadata__ must be a {string: string} map");let t=[];for(let[s,o]of Object.entries(e))s!=="__metadata__"&&t.push([s,dd(s,o)]);t.sort((s,o)=>s[1].dataOffsets[0]-o[1].dataOffsets[0]);let a=0;for(let[s,o]of t){let[i,u]=o.dataOffsets;if(i!==a)throw new B(`Invalid offset for tensor ${s}: expected ${a}, got ${i}`);let l=o.elementCount*cd(o.dtype);if(l%8!==0)throw new B(`Tensor ${s} has subbyte size ${l} bits not divisible by 8`);if(u-i!==l/8)throw new B(`Tensor ${s} byte length ${u-i} does not match shape*dtype ${l/8}`);a=u}if(n!==null&&a!==n)throw new B(`Data length mismatch: header expects ${a} bytes, got ${n}`);return{metadata:r??null,tensors:new Map(t),dataByteLength:a}}function dd(e,n){if(n===null||typeof n!="object"||Array.isArray(n))throw new B(`Tensor ${e}: info must be an object`);let{dtype:r,shape:t,data_offsets:a}=n;if(typeof r!="string"||!(r in Ss))throw new B(`Tensor ${e}: unknown dtype ${r}`);if(!Array.isArray(t)||!t.every(u=>Number.isInteger(u)&&u>=0))throw new B(`Tensor ${e}: shape must be an array of nonnegative integers`);if(!Array.isArray(a)||a.length!==2||!a.every(u=>Number.isInteger(u)&&u>=0))throw new B(`Tensor ${e}: data_offsets must be a 2-element array of nonnegative integers`);let[s,o]=a;if(o<s)throw new B(`Tensor ${e}: data_offsets end < begin`);let i=1;for(let u of t)if(i*=u,!Number.isSafeInteger(i))throw new B(`Tensor ${e}: shape product exceeds Number.MAX_SAFE_INTEGER`);return{dtype:r,shape:[...t],dataOffsets:[s,o],elementCount:i}}function pd(e){if(e===null||typeof e!="object"||Array.isArray(e))return!1;for(let n of Object.values(e))if(typeof n!="string")return!1;return!0}async function Ps(e,n={},r={}){let t=e instanceof URL?e.toString():String(e);if(!/^https?:/i.test(t))throw new B(`Expected http(s) safetensors URL, got: ${t}`);return fd(t,n,r)}async function fd(e,n,{requireRangeRequests:r=!1,knownSize:t=void 0,knownAcceptsRanges:a=void 0}={}){let s=n.fetch??globalThis.fetch;if(typeof s!="function")throw new B("No fetch implementation available; pass options.fetch");let o=t,i=a;if(o===void 0){let u=await s(e,{method:"HEAD",signal:n.signal});if(!u.ok)throw new B(`HEAD ${e} failed: ${u.status} ${u.statusText}`);let l=u.headers.get("content-length");if(i=(u.headers.get("accept-ranges")??"").toLowerCase().includes("bytes"),o=l===null?null:Number(l),l!==null&&!Number.isFinite(o))throw new B(`Invalid content-length header: ${l}`)}else i=i!==!1;if(r&&!i)throw new B(`Range requests are required for ${e}, but the server did not advertise Accept-Ranges: bytes`);return{url:e,size:o??null,acceptsRanges:i,async readRange(u,l,c={}){if(u===l)return new Uint8Array(0);let d=c.signal??n.signal,p=c.onByteProgress??null;if(i){let _=await s(e,{headers:{Range:`bytes=${u}-${l-1}`},signal:d});if(_.status!==206&&_.status!==200)throw new B(`Range ${u}-${l-1} of ${e} failed: ${_.status}`);if(_.status===200&&r)throw new B(`Range ${u}-${l-1} of ${e} returned 200 instead of 206; refusing full-response fallback`);let E=await gt(_,{expectedLength:_.status===206?l-u:null,onByteProgress:p});if(_.status===200)return E.subarray(u,l);if(E.byteLength!==l-u)throw new B(`Range ${u}-${l-1} returned ${E.byteLength} bytes`);return E}let f=await s(e,{signal:d});if(!f.ok)throw new B(`GET ${e} failed: ${f.status}`);return(await gt(f,{onByteProgress:p})).subarray(u,l)},async readAll(u={}){let l=u.signal??n.signal,c=u.onProgress??n.onProgress,d=await s(e,{signal:l});if(!d.ok)throw new B(`GET ${e} failed: ${d.status}`);return gt(d,{expectedLength:Number.isFinite(o)?o:null,onProgress:c,progressTotal:Number.isFinite(o)?o:null,fromCache:!1})},async readTensor(){return null},async writeTensor(){},async close(){}}}async function gt(e,{expectedLength:n=null,onByteProgress:r=null,onProgress:t=null,progressTotal:a=null,fromCache:s=!1}={}){if(!e.body?.getReader){let c=await e.arrayBuffer(),d=new Uint8Array(c);return ht({onByteProgress:r,onProgress:t,loaded:d.byteLength,delta:d.byteLength,total:a??n,fromCache:s}),d}let o=e.body.getReader(),i=a??n??null,u=0;if(typeof n=="number"&&Number.isFinite(n)&&n>0){let c=new Uint8Array(n),d=[];for(;;){let{done:p,value:f}=await o.read();if(p)break;f&&(u+f.byteLength<=c.byteLength&&d.length===0?c.set(f,u):(d.length===0&&d.push(c.subarray(0,u)),d.push(f)),u+=f.byteLength,ht({onByteProgress:r,onProgress:t,loaded:u,delta:f.byteLength,total:i,fromCache:s}))}return d.length===0?u===n?c:c.subarray(0,u):Es(d,u)}let l=[];for(;;){let{done:c,value:d}=await o.read();if(c)break;d&&(l.push(d),u+=d.byteLength,ht({onByteProgress:r,onProgress:t,loaded:u,delta:d.byteLength,total:i,fromCache:s}))}return Es(l,u)}function ht({onByteProgress:e,onProgress:n,loaded:r,delta:t,total:a,fromCache:s}){e?.(t),n?.({loaded:r,total:a??null,fromCache:s})}function Es(e,n){if(e.length===0)return new Uint8Array(0);if(e.length===1&&e[0].byteLength===n)return e[0];let r=new Uint8Array(n),t=0;for(let a of e)r.set(a,t),t+=a.byteLength;return r}var md=128<<20,gd=1<<20,hd=4,qn=class{#e;#r;#n;metadata;url;totalSize;headerByteLength;dataByteLength;constructor({source:n,dataStart:r,metadata:t,tensors:a,headerByteLength:s,dataLength:o}){this.#e=n,this.#r=r,this.#n=a,this.metadata=t,this.url=n.url,this.totalSize=n.size,this.headerByteLength=s,this.dataByteLength=o??(n.size==null?null:n.size-r)}names(){return[...this.#n.keys()]}has(n){return this.#n.has(n)}info(n){let r=this.#t(n);return{dtype:r.dtype,shape:[...r.shape],dataOffsets:[...r.dataOffsets]}}byteLength(n){let r=this.#t(n);return r.dataOffsets[1]-r.dataOffsets[0]}async tensorBytes(n,r){let t=this.#t(n),[a,s]=t.dataOffsets,o=this.#r+a,i=this.#r+s,u=await this.#e.readTensor(o,i);if(u)return u;let l=await this.#e.readRange(o,i,r);return await this.#e.writeTensor(o,i,l),l}async tensorAs(n,r){let t=this.#t(n),a=Ts(t.dtype);if(!a)throw new B(`No native typed-array for dtype ${t.dtype}; use tensorBytes()`);return xs(await this.tensorBytes(n,r),a)}async batchBytes(n,r){if(n.length===0)return new Map;let t=n.map(u=>[u,this.#t(u)]),a=1/0,s=0;for(let[,u]of t)u.dataOffsets[0]<a&&(a=u.dataOffsets[0]),u.dataOffsets[1]>s&&(s=u.dataOffsets[1]);let o=await this.#e.readRange(this.#r+a,this.#r+s,r),i=new Map;for(let[u,l]of t)i.set(u,o.subarray(l.dataOffsets[0]-a,l.dataOffsets[1]-a));return i}async streamAll(n,{concurrency:r=hd,chunkMaxBytes:t=md,chunkMaxGap:a=gd,names:s=null,onProgress:o,signal:i}={}){let u=this.#a(s);if(u.length===0)return;let l=yd(u,{maxBytes:t,maxGap:a}),c=l.reduce((G,C)=>G+(C.end-C.begin),0),d=0,p=new Map,f=(G={})=>{if(!o)return;let C=d;for(let S of p.values())C+=S;o({loaded:C,total:c,...G})},m=this.#r,_=this.#e,E=0,b=async G=>{let{begin:C,end:S,tensors:D}=l[G],P=m+C,N=m+S,R=S-C,V,z=!0,j=await Promise.all(D.map(g=>_.readTensor(m+g.begin,m+g.end)));for(let g of j)if(!g){z=!1;break}if(z){V=new Uint8Array(R);for(let g=0;g<D.length;++g){let w=j[g];w&&V.set(w,D[g].begin-C)}}else p.set(G,0),V=await _.readRange(P,N,{signal:i,onByteProgress:g=>{p.set(G,(p.get(G)??0)+g),f({fromCache:!1,range:[P,N],inFlight:!0})}});let ne=z,Q=D.map(g=>({name:g.name,offset:g.begin-C,length:g.end-g.begin})),ve=Promise.resolve(n({begin:P,end:N,bytes:V,tensors:Q})),Z=ne?Promise.resolve():Promise.all(D.map((g,w)=>{if(j[w])return null;let T=V.subarray(g.begin-C,g.end-C);return _.writeTensor(m+g.begin,m+g.end,T).catch(()=>{})})).catch(()=>{});await Promise.all([ve,Z]),p.delete(G),d+=R,f({fromCache:ne,range:[P,N]})},W=async()=>{for(;;){if(i?.aborted)throw i.reason??new Error("aborted");let G=E++;if(G>=l.length)return;await b(G)}},q=[];for(let G=0;G<Math.min(r,l.length);++G)q.push(W());await Promise.all(q)}async close(){await this.#e.close()}#a(n){let r=n==null?null:new Set(n);if(r&&r.size===0)return[];if(r){for(let a of r)if(!this.#n.has(a))throw new B(`Unknown tensor: ${a}`)}let t=[];for(let[a,s]of this.#n){if(r&&!r.has(a))continue;let[o,i]=s.dataOffsets;i>o&&t.push({name:a,begin:o,end:i})}return t.sort((a,s)=>a.begin-s.begin),t}#t(n){let r=this.#n.get(n);if(!r)throw new B(`Unknown tensor: ${n}`);return r}};function yd(e,{maxBytes:n,maxGap:r}){let t=[],a=null;for(let s of e){if(!a){a={begin:s.begin,end:s.end,tensors:[s]};continue}let o=s.begin-a.end,i=s.end-a.begin;o<=r&&i<=n?(a.end=s.end,a.tensors.push(s)):(t.push(a),a={begin:s.begin,end:s.end,tensors:[s]})}return a&&t.push(a),t}async function Gs(e,{headerProbeBytes:n}){let r=e.size==null?n:Math.min(n,e.size),t=await e.readRange(0,r);if(t.byteLength<8)throw new B(`Probe returned ${t.byteLength} bytes; need at least ${8}`);let a=new DataView(t.buffer,t.byteOffset,t.byteLength).getBigUint64(0,!0);if(a>BigInt(1e8))throw new B(`Header length ${a} exceeds maximum ${1e8}`);let s=Number(a),o=8+s,i;if(t.byteLength>=o)i=t.subarray(0,o);else{let l=await e.readRange(t.byteLength,o);i=new Uint8Array(o),i.set(t),i.set(l,t.byteLength)}let{header:u}=ks(i);return{header:u,headerByteLength:s,dataStart:o,dataLength:e.size==null?null:e.size-o}}function dn(e){return e instanceof Error?e.message:String(e)}function Os(e){return e.byteOffset===0&&e.byteLength===e.buffer.byteLength&&e.buffer instanceof ArrayBuffer?e.buffer:e.slice().buffer}var bd=262144,wd="safetensors-cache-v1",pn="chunks",fn="meta";async function Ws(e,n={},r){let t=n.cacheKey??(typeof e=="string"?e:e.toString()),a=n.cache===!1,s=!!n.force,o=a||n.source?null:n.chunkCache??_d(n.cacheName??wd);if(o&&!s)try{let m=await o.getMeta(t);if(m&&m.header&&Number.isFinite(m.size)&&Number.isFinite(m.dataStart)){let _=await r(e,{...n,chunkCache:o,knownSize:m.size,knownAcceptsRanges:m.acceptsRanges??!0}),E=m.size-m.dataStart,{metadata:b,tensors:W}=mt(m.header,E);return new qn({source:_,dataStart:m.dataStart,metadata:b,tensors:W,headerByteLength:m.dataStart-8,dataLength:E})}}catch(m){typeof console<"u"&&console.warn(`safetensors meta cache read failed: ${dn(m)}`)}let i=await r(e,{...n,chunkCache:o}),{header:u,headerByteLength:l,dataStart:c,dataLength:d}=await Gs(i,{headerProbeBytes:n.headerProbeBytes??bd}),{metadata:p,tensors:f}=mt(u,d);return o&&!s&&i.size!=null&&o.putMeta(t,{size:i.size,dataStart:c,header:u,acceptsRanges:i.acceptsRanges}).catch(()=>{}),new qn({source:i,dataStart:c,metadata:p,tensors:f,headerByteLength:l,dataLength:d})}function Fs(e){return{requireRangeRequests:!!(e.requireRangeRequests??e.requireRanges??!1),knownSize:e.knownSize,knownAcceptsRanges:e.knownAcceptsRanges}}function Ms(e,n){let{chunkCache:r}=n,t=n.cacheKey??e.url,a=!!n.force;return{...e,async readTensor(s,o){if(a)return null;try{return await r.get(t,s,o)}catch(i){return typeof console<"u"&&console.warn(`safetensors cache read failed: ${dn(i)}`),null}},async writeTensor(s,o,i){try{let u=i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i:new Uint8Array(i);await r.put(t,s,o,u)}catch(u){typeof console<"u"&&console.warn(`safetensors cache write failed: ${dn(u)}`)}}}}var Rs=new Map;function _d(e){return typeof indexedDB>"u"?null:{async get(n,r,t){let a=await hr(e);return new Promise((s,o)=>{let u=a.transaction(pn,"readonly").objectStore(pn).get([n,r,t]);u.onsuccess=async()=>{let l=u.result;if(!l)return s(null);s(new Uint8Array(await l.arrayBuffer()))},u.onerror=()=>o(u.error)})},async put(n,r,t,a){let s=await hr(e);return new Promise((o,i)=>{let l=s.transaction(pn,"readwrite").objectStore(pn).put(new Blob([Os(a)]),[n,r,t]);l.onsuccess=()=>o(),l.onerror=()=>i(l.error)})},async getMeta(n){let r=await hr(e);return new Promise((t,a)=>{let o=r.transaction(fn,"readonly").objectStore(fn).get(n);o.onsuccess=()=>t(o.result??null),o.onerror=()=>a(o.error)})},async putMeta(n,r){let t=await hr(e);return new Promise((a,s)=>{let i=t.transaction(fn,"readwrite").objectStore(fn).put(r,n);i.onsuccess=()=>a(),i.onerror=()=>s(i.error)})}}}function hr(e){let n=Rs.get(e);if(n)return n;let r=new Promise((t,a)=>{let s=indexedDB.open(e,2);s.onupgradeneeded=()=>{let o=s.result;o.objectStoreNames.contains(pn)||o.createObjectStore(pn),o.objectStoreNames.contains(fn)||o.createObjectStore(fn)},s.onsuccess=()=>t(s.result),s.onerror=()=>a(s.error),s.onblocked=()=>a(new Error("indexedDB open blocked"))});return Rs.set(e,r),r}var Bs=(e,n={})=>Ws(e,n,vd);async function vd(e,n){let r=await Ps(e,n,Fs(n));return n.chunkCache?Ms(r,{...n,chunkCache:n.chunkCache}):r}function Is({readTextResource:e,openSafeTensorsResource:n}){async function r(s,o,i){return JSON.parse(await e(s,o,i))}async function t(s,o,i){return qs(()=>r(s,o,i))}async function a(s,o,i){return qs(()=>e(s,o,i))}return Object.freeze({readJsonResource:r,readJsonResourceOptional:t,readTextResource:e,readTextResourceOptional:a,openSafeTensorsResource:n})}var yt=class extends Error{url;status;statusText;constructor(n,r){super(`GET ${n} failed: ${r.status} ${r.statusText}`),this.name="ResourceFetchError",this.url=n,this.status=r.status,this.statusText=r.statusText}};function bt(e,n){let r=e instanceof URL?e.toString():String(e),t=new URL(Sd(r),globalThis.location?.href);return new URL(n,t).toString()}async function Ds(e,n={}){let r=n.fetch??globalThis.fetch;if(typeof r!="function")throw new Error("No fetch implementation available");let t=await xd(n);if(t&&!n.force){let s=await t.match(e);if(s)return s.text()}let a=await r(e,{signal:n.signal});if(!a.ok)throw new yt(e,a);if(t)try{await t.put(e,a.clone())}catch(s){typeof console<"u"&&console.warn(`resource cache write failed: ${dn(s)}`)}return a.text()}function Sd(e){return e.endsWith("/")?e:`${e}/`}async function qs(e){try{return await e()}catch(n){if(!Td(n))throw n;return null}}function Td(e){return typeof e=="object"&&e!==null&&(e.code==="ENOENT"||e.status===404)}async function xd(e={}){if(e.cache===!1)return null;let n=e.cacheStorage??globalThis.caches;return n?.open?n.open(e.cacheName??"bonsai-pipeline-v1"):null}var mn=Is({readTextResource:kd,openSafeTensorsResource:Ed});async function kd(e,n,r={}){return Ds(bt(e,n),r)}async function Ed(e,n,r={}){return Bs(bt(e,n),r)}var Pd={tensor:e=>e.destroy(),buffer:e=>e.destroy(),map:e=>e.clear(),set:e=>e.clear()};function en(e,n=new Set){yr(e,n,Pd)}function yr(e,n,r){if(!(e==null||typeof e!="object")&&!n.has(e)&&(n.add(e),!(ArrayBuffer.isView(e)||e instanceof ArrayBuffer))){if(Ad(e)){r.tensor(e);return}if(Gd(e)){r.buffer(e);return}if(e instanceof Map){for(let t of e.values())yr(t,n,r);r.map(e);return}if(e instanceof Set){for(let t of e.values())yr(t,n,r);r.set(e);return}for(let t of Object.keys(e))yr(e[t],n,r)}}function Ad(e){let n=e;return Array.isArray(n.shape)&&typeof n.dtype=="string"&&typeof n.destroy=="function"&&n.buffer!=null&&typeof n.buffer.destroy=="function"}function Gd(e){let n=e;return typeof n.destroy=="function"&&typeof n.mapAsync=="function"&&typeof n.getMappedRange=="function"}var wt="sliding_attention",_t="full_attention";function Od(e){return e&&typeof e=="object"&&e.text_config&&typeof e.text_config=="object"?{...e.text_config}:e??{}}function Ae(e,n,r){let t=e[n];if(t==null){if(r!==void 0)return r;throw new Error(`Gemma4Config: missing required integer field "${n}"`)}let a=Number(t);if(!Number.isInteger(a))throw new Error(`Gemma4Config: field "${n}" must be an integer, got ${t}`);return a}var Dn=class{model_type="gemma4_text";vocab_size;vocab_size_per_layer_input;hidden_size;intermediate_size;num_hidden_layers;num_attention_heads;num_key_value_heads;head_dim;global_head_dim;hidden_size_per_layer_input;num_kv_shared_layers;sliding_window;rms_norm_eps;final_logit_softcapping;use_double_wide_mlp;tie_word_embeddings;max_position_embeddings;layer_types;firstKvSharedLayer;layers;slidingRopeTheta;fullRopeTheta;fullPartialRotaryFactor;embedScale;perLayerEmbedScale;constructor(n={}){let r=Od(n);this.vocab_size=Ae(r,"vocab_size"),this.vocab_size_per_layer_input=Ae(r,"vocab_size_per_layer_input",this.vocab_size),this.hidden_size=Ae(r,"hidden_size"),this.intermediate_size=Ae(r,"intermediate_size"),this.num_hidden_layers=Ae(r,"num_hidden_layers"),this.num_attention_heads=Ae(r,"num_attention_heads"),this.num_key_value_heads=Ae(r,"num_key_value_heads"),this.head_dim=Ae(r,"head_dim"),this.global_head_dim=Ae(r,"global_head_dim",this.head_dim),this.hidden_size_per_layer_input=Ae(r,"hidden_size_per_layer_input"),this.num_kv_shared_layers=Ae(r,"num_kv_shared_layers",0),this.sliding_window=Ae(r,"sliding_window"),this.rms_norm_eps=Number(r.rms_norm_eps??1e-6),this.final_logit_softcapping=Number(r.final_logit_softcapping??0)||0,this.use_double_wide_mlp=!!r.use_double_wide_mlp,this.tie_word_embeddings=!!(r.tie_word_embeddings??!1),this.max_position_embeddings=Ae(r,"max_position_embeddings",131072);let t=r.rope_parameters??{};this.slidingRopeTheta=Number(t?.[wt]?.rope_theta??1e4),this.fullRopeTheta=Number(t?.[_t]?.rope_theta??1e6),this.fullPartialRotaryFactor=Number(t?.[_t]?.partial_rotary_factor??.25);let a=Array.isArray(r.layer_types)?r.layer_types:null;if(this.layer_types=a?a.slice():Array.from({length:this.num_hidden_layers},(o,i)=>(i+1)%5===0?_t:wt),this.layer_types.length!==this.num_hidden_layers)throw new Error(`Gemma4Config: layer_types length ${this.layer_types.length} != num_hidden_layers ${this.num_hidden_layers}`);this.firstKvSharedLayer=this.num_hidden_layers-this.num_kv_shared_layers;let s={};for(let o=0;o<this.firstKvSharedLayer;++o)s[this.layer_types[o]]=o;this.layers=this.layer_types.map((o,i)=>{let u=o===wt,l=u?this.head_dim:this.global_head_dim,c=i>=this.firstKvSharedLayer&&this.firstKvSharedLayer>=0,d=this.use_double_wide_mlp&&c;return{index:i,layerType:o,isSliding:u,headDim:l,qOut:this.num_attention_heads*l,kvOut:this.num_key_value_heads*l,attnBits:4,mlpBits:c?2:4,intermediate:d?this.intermediate_size*2:this.intermediate_size,slidingWindow:u?this.sliding_window:0,ropeTheta:u?this.slidingRopeTheta:this.fullRopeTheta,partialRotaryFactor:u?1:this.fullPartialRotaryFactor,isKvShared:c,kvSourceLayer:c?s[o]:i}}),this.embedScale=Math.sqrt(this.hidden_size),this.perLayerEmbedScale=Math.sqrt(this.hidden_size_per_layer_input),this.validate()}validate(){if(this.num_attention_heads%this.num_key_value_heads!==0)throw new Error("Gemma4Config: num_attention_heads must be divisible by num_key_value_heads");for(let n of this.layers)if(n.isKvShared&&(n.kvSourceLayer===void 0||n.kvSourceLayer<0))throw new Error(`Gemma4Config: no KV source layer for shared layer ${n.index} (${n.layerType})`)}};var Us=8192,Un=class e{batchSize=1;maxLength;seqLength=0;keys;values;constructor(n,r,t){this.maxLength=n,this.keys=r,this.values=t}static defaultCapacity(n){return Math.max(1,Math.min(Us,n.max_position_embeddings))}static allocate(n,r,t){let a=Math.max(1,Math.min(t??Us,r.max_position_embeddings)),s=new Array(r.num_hidden_layers).fill(null),o=new Array(r.num_hidden_layers).fill(null);for(let i of r.layers)i.isKvShared||(s[i.index]=n.empty("float32",[a,i.kvOut],`gemma4-cache-k-${i.index}`),o[i.index]=n.empty("float32",[a,i.kvOut],`gemma4-cache-v-${i.index}`));return new e(a,s,o)}keyT(n){let r=this.keys[n];if(!r)throw new Error(`Gemma4DynamicCache: layer ${n} has no KV storage (is it a shared layer?)`);return r}valueT(n){let r=this.values[n];if(!r)throw new Error(`Gemma4DynamicCache: layer ${n} has no KV storage (is it a shared layer?)`);return r}get_seq_length(){return this.seqLength}advance(n){if(!Number.isInteger(n)||n<0)throw new Error(`advance(${n}) invalid`);if(this.seqLength+n>this.maxLength)throw new Error(`KV cache overflow: ${this.seqLength}+${n} > ${this.maxLength}`);this.seqLength+=n}truncate(n){if(!Number.isInteger(n)||n<0||n>this.maxLength)throw new Error(`truncate(${n}) invalid`);this.seqLength=n}dispose(){for(let n of this.keys)en(n);for(let n of this.values)en(n);this.keys.fill(null),this.values.fill(null)}};function Ls(e){let n=e&32768?-1:1,r=e>>>10&31,t=e&1023;return r===31?t===0?n*(1/0):NaN:r===0?n*2**-14*(t/1024):n*2**(r-15)*(1+t/1024)}function vt(e){let n=new Uint16Array(e.length);for(let r=0;r<e.length;++r)n[r]=St(e[r]);return n}var Cs=new Float32Array(1),Rd=new Uint32Array(Cs.buffer);function St(e){if(Number.isNaN(e))return 32256;Cs[0]=e;let n=Rd[0],r=n>>>16&32768,t=n>>>23&255,a=n&8388607;if(t===255)return a!==0?r|32256:r|31744;let s=t-127+15;if(s>=31)return r|31743;if(s<=0){if(s<-10)return r;let c=a|8388608,d=14-s,p=1<<d-1,f=c&(1<<d)-1,m=c>>>d;return(f>p||f===p&&(m&1)===1)&&(m+=1),r|m}let o=4096,i=a&8191,u=a>>>13,l=s;return(i>o||i===o&&(u&1)===1)&&(u+=1,u===1024&&(u=0,l+=1)),l>=31?r|31743:r|l<<10|u}var Wd=new Set(["F32","BF16","F16"]),Fd=new Set(["float32","float16"]);function zs(e,n,r){Id(e,n);let t=Dd(e);if(r.byteLength%t!==0)throw new Error(`source byte length ${r.byteLength} not divisible by ${t}`);return e==="F32"&&n==="float32"?Ns(r,Float32Array,4):e==="F16"&&n==="float16"?Ns(r,Uint16Array,2):Ud(e,n)(r)}function Md(e){return typeof e=="string"&&Wd.has(e)}function Bd(e){return typeof e=="string"&&Fd.has(e)}function xt(e){if(!Md(e))throw new Error(`Unsupported source dtype: ${e}`)}function qd(e){if(!Bd(e))throw new Error(`Unsupported target dtype: ${e}`)}function Id(e,n){xt(e),qd(n)}function Dd(e){if(e==="F32")return 4;if(e==="BF16"||e==="F16")return 2;throw new Error(`Unsupported source dtype: ${e}`)}function Ud(e,n){if(e==="BF16"&&n==="float32")return Ld;if(e==="BF16"&&n==="float16")return Cd;if(e==="F16"&&n==="float32")return jd;if(e==="F32"&&n==="float16")return zd;throw new Error(`No converter for ${e} -> ${n}`)}function Ns(e,n,r){let t=new n(e.byteLength/r);return new Uint8Array(t.buffer).set(e),t}function Ld(e){let n=e.byteLength/2,r=new Float32Array(n),t=new Uint32Array(r.buffer);if(e.byteOffset%2===0){let a=new Uint16Array(e.buffer,e.byteOffset,n);for(let s=0;s<n;++s)t[s]=a[s]<<16}else for(let a=0;a<n;++a){let s=e[a*2],o=e[a*2+1];t[a]=(o<<8|s)<<16}return r}function Cd(e){let n=e.byteLength/2,r=new Uint16Array(n);return Nd(e,r),r}function Nd(e,n,r=0,t=1){let a=e.byteLength/2,s=Hd();if(e.byteOffset%2===0){let o=new Uint16Array(e.buffer,e.byteOffset,a);for(let i=0,u=r;i<a;++i,u+=t)n[u]=s[o[i]]}else for(let o=0,i=r;o<a;++o,i+=t){let u=e[o*2],l=e[o*2+1];n[i]=s[l<<8|u]}return n}function zd(e){let n=e.byteLength/4;if(e.byteOffset%4===0)return vt(new Float32Array(e.buffer,e.byteOffset,n));let r=new Float32Array(n);return new Uint8Array(r.buffer).set(e),vt(r)}function jd(e){let n=e.byteLength/2,r=new Float32Array(n),t=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let a=0;a<n;++a)r[a]=Ls(t.getUint16(a*2,!0));return r}var js=new Uint32Array(1),$d=new Float32Array(js.buffer);function Kd(e){return js[0]=e<<16>>>0,St($d[0])}var Tt=null;function Hd(){if(Tt)return Tt;let e=new Uint16Array(65536);for(let n=0;n<65536;++n)e[n]=Kd(n);return Tt=e,e}var br=class{specs;handlers;pending;constructor(n=[]){this.specs=n.map(wr),this.handlers=new Map,this.pending=new Set}add(n){return this.specs.push(wr(n)),this}tensor(n){return this.add(Qs(n))}group(n){return this.add(Ln(n))}prepare({reader:n,context:r={}}){this.handlers.clear(),this.pending.clear();for(let t of this.specs)if(t.type==="tensor")this.#e(t,n,r);else if(t.type==="group")this.#r(t,n,r);else throw new Error(`Unsupported weight plan spec type: ${t.type}`);return this}names(){return[...this.handlers.keys()]}async onChunk({bytes:n,tensors:r},t={}){let a=[];for(let s of r){let o=this.handlers.get(s.name);if(!o)continue;let i=n.subarray(s.offset,s.offset+s.length);a.push($s(o,i,t))}a.length&&await Promise.all(a)}async readSequential(n,r={}){for(let t of this.names()){let a=await n.read(t),s=this.handlers.get(t);s&&await $s(s,a,r)}}assertComplete(){if(this.pending.size>0){let n=[...this.pending].slice(0,5).join(", ");throw new Error(`WeightPlan incomplete - ${this.pending.size} tensor(s) never arrived (first: ${n})`)}}#e(n,r,t){let a=Ks(r,n.name);if(!a){Vs(n,t);return}Hs(n,a),this.#n(n.name,async(s,o)=>{this.pending.delete(n.name),await Xd(n,s,{...t,...o,description:a})},n.progressLabel??n.name)}#r(n,r,t){let a={},s=n.names.filter(u=>{let l=Ks(r,u);return l&&(a[u]=l),!l});if(s.length>0){Vs(n,t,s);return}for(let u of n.names)Hs(n,a[u],u);let o={},i=n.names.length;for(let u of n.names)this.#n(u,async(l,c)=>{if(this.pending.delete(u),o[u]=l,--i===0)try{await Zd(n,o,{...t,...c,descriptions:a})}finally{for(let d of n.names)delete o[d]}},n.progressLabel??u)}#n(n,r,t=n){if(this.handlers.has(n))throw new Error(`Duplicate WeightPlan handler for tensor: ${n}`);this.handlers.set(n,{name:n,progressLabel:t,receive:r}),this.pending.add(n)}};function Qs(e){return wr({type:"tensor",required:!0,...e})}function Ln(e){return wr({type:"group",required:!0,...e})}function Xs({name:e,required:n=!0,sourceDtype:r=null,targetDtype:t,shape:a=null,label:s=e,progressLabel:o=e,assign:i=null,missing:u=null,transform:l=null,upload:c=null,cleanup:d=null}){return Qs({name:e,required:n,sourceDtype:r,targetDtype:t,shape:a,label:s,progressLabel:o,transform:l??((p,{description:f})=>{if(!f)throw new Error(`WeightPlan tensor ${e} is missing a description`);let m=r??f.dtype;return xt(m),zs(m,t,p)}),upload:c??((p,{rt:f,description:m})=>{if(!f)throw new Error(`WeightPlan tensor ${e} upload requires context.rt`);if(!m)throw new Error(`WeightPlan tensor ${e} is missing a description`);let _=Ys(a,p.length,m);return f.tensorFromTypedArray(t,_,p)}),assign:i,missing:u,cleanup:d})}async function Zs(e,{source:n=null,reader:r,context:t={},concurrency:a,chunkMaxBytes:s,onProgress:o=null,signal:i}={}){let u=e instanceof br?e:new br(e);if(!r)throw new Error("WeightPlan execution requires a reader");try{u.prepare({reader:r,context:t});let l={...t,onTensorProgress:Vd(u,o)};return n?await n.streamAll(c=>u.onChunk(c,l),{concurrency:a,chunkMaxBytes:s,names:u.names(),onProgress:o,signal:i}):await u.readSequential(r,l),u.assertComplete(),u}finally{await Qd(n,r)}}async function $s(e,n,r){await e.receive(n,r),r.onTensorProgress?.({name:e.name,label:e.progressLabel})}function Vd(e,n){if(!n)return null;let r=0,t=e.names().length;return({name:a,label:s})=>{n({phase:"tensor",processed:++r,total:t,name:a,label:s})}}async function Qd(e,n){let r=new Set,t=e?[n,e]:[n];for(let a of t){let s=a.closeTarget??a;r.has(s)||(r.add(s),await a.close())}}function wr(e){if(!e||typeof e!="object")throw new Error("WeightPlan spec must be an object");if(e.type==="tensor"){if(typeof e.name!="string"||e.name.length===0)throw new Error("WeightPlan tensor spec requires a name");return{required:!0,...e}}if(e.type==="group"){if(!Array.isArray(e.names)||e.names.length===0)throw new Error("WeightPlan group spec requires a non-empty names array");for(let n of e.names)if(typeof n!="string"||n.length===0)throw new Error("WeightPlan group tensor names must be non-empty strings");return{required:!0,...e}}throw new Error(`Unknown WeightPlan spec type: ${e.type}`)}async function Xd(e,n,r){let t=e.transform?await e.transform(n,r):n,a=e.upload?await e.upload(t,r):t;e.run&&await e.run(a,r),e.assign?.(a,r),await e.cleanup?.(a,r)}async function Zd(e,n,r){let t=e.transform?await e.transform(n,r):n,a=e.upload?await e.upload(t,r):t;e.run&&await e.run(a,r),e.assign?.(a,r),await e.cleanup?.(a,r)}function Ks(e,n){return e.has(n)?e.describe(n):null}function Hs(e,n,r=e.type==="tensor"?e.name:"group"){if(e.sourceDtype&&n.dtype!==e.sourceDtype)throw new Error(`${r} has dtype ${n.dtype}; expected ${e.sourceDtype}`);if(e.shape){let t=Ys(e.shape,n.elementCount,n);if(t.length!==n.shape.length||t.some((a,s)=>a!==n.shape[s]))throw new Error(`${r} has shape [${n.shape}]; expected [${t}]`)}}function Vs(e,n,r=e.type==="tensor"?[e.name]:[...e.names]){if(e.required===!1){e.missing?.(r,n);return}throw new Error(`Missing required tensor${r.length===1?"":"s"}: ${r.join(", ")}`)}function Ys(e,n,r){return typeof e=="function"?e({valueLength:n,description:r}):Array.isArray(e)?e:r.shape?r.shape:[n]}Wn();function Js(e){return{has:r=>e.has(r),describe(r){let t=e.info(r),a=[...t.shape];return{dtype:t.dtype,shape:a,elementCount:Ve(a)}},async read(r){return e.tensorBytes(r)},async close(){await e.close()},closeTarget:e}}var v=Math.fround,Yd=v(1.4426950408889634),Jd=v(-.693145751953125),ep=v(-1428606765330187e-21),np=v(.0001980960224),rp=v(.001394256484),tp=v(.008333456703),ap=v(.04166637361),eo=v(.16666665941423425),sp=v(8.664339742),Me=(e,n,r)=>v(e*n+r),Cn=(e,n,r)=>v(e*n-r),_r=(e,n,r)=>v(r-e*n);function op(e){let n=Math.floor(e),r=e-n;return r>.5?n+1:r<.5||(n&1)===0?n:n+1}function no(e,n){let r=n>>1;return v(v(e*2**r)*2**(n-r))}function ip(e){let n=Math.abs(e);if(!(n<=sp))return e<0?-1:1;let r=op(v(n*Yd)),t=r,a=v(t*Jd),s=v(n+a),o=v(s-n),i=v(v(v(n-v(s-o))+v(a-o))+0);a=v(t*ep);let u=v(s+a);o=v(u-s);let l=v(v(v(s-v(u-o))+v(a-o))+i);s=u,i=l;let c=np;c=Me(c,s,rp),c=Me(c,s,tp),c=Me(c,s,ap);let d=v(s*c),p=Me(i,c,Cn(s,c,d)),f=v(d+eo);o=v(f-d),p=v(v(v(d-v(f-o))+v(eo-o))+p),d=f;let m=v(s*d),_=Me(s,p,Me(i,d,Cn(s,d,m)));f=v(m+.5),o=v(f-m),p=v(v(v(m-v(f-o))+v(.5-o))+_),d=f;let E=v(s*s),b=Me(v(s+s),i,Cn(s,s,E));m=v(E*d),_=Me(E,p,Me(b,d,Cn(E,d,m))),f=v(s+m),o=v(f-s),p=v(v(v(s-v(f-o))+v(m-o))+v(i+_)),d=f,f=v(1+d),p=v(v(v(1-f)+d)+p),d=f,d=no(d,r),p=no(p,r);let W=v(1/d),q=v(W*_r(p,W,_r(d,W,1))),G=v(d-W),C=v(v(v(v(d-G)-W)+p)-q),S=v(d+W),D=v(v(v(v(d-S)+W)+p)+q),P=v(1/S),N=v(G*P),R=Cn(P,G,N),V=_r(D,P,_r(S,P,1)),z=Me(N,V,Me(C,P,R)),j=v(N+z);return e<0?-j:j}function kt(e){let n=v(.7978845608028654),r=v(.044715),t=v(e),a=new Float32Array(256);for(let s=-128;s<128;++s){let o=v(s*t),i=v(v(o*o)*o),u=v(n*v(o+v(r*i))),l=ip(u);a[s+128]=v(v(.5*o)*v(1+l))}return a}function $e(e){let n=e.slice();return new Float32Array(n.buffer,n.byteOffset,n.byteLength>>>2)}var gn="model.language_model";async function ro(e,n,r,t={}){let a=[],s=(c,d,p,f,m,_=!1)=>{a.push(Ln({names:[`${c}.weight`,`${c}.weight_scale`,`${c}.input_activation_scale`,`${c}.output_activation_scale`],progressLabel:c,run:async E=>{let b=E[`${c}.weight`],W=E[`${c}.weight_scale`];if(!b||!W)throw new Error(`Missing tensors for ${c}`);let q=b.byteLength*8/(d*p);if(q!==2&&q!==4&&q!==8)throw new Error(`${c}: derived ${q}-bit from ${b.byteLength} bytes for [${d}, ${p}]`);if(_){let P=p*q/32,N=new Uint32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)),R=new Uint32Array(N.length),V=P/4;for(let z=0;z<d;++z)for(let j=0;j<V;++j){let ne=(j*d+z)*4,Q=z*P+j*4;R[ne]=N[Q],R[ne+1]=N[Q+1],R[ne+2]=N[Q+2],R[ne+3]=N[Q+3]}b=new Uint8Array(R.buffer)}let G=e.allocateWeightsBuffer({byteLength:b.byteLength,dtype:"uint32",shape:[d,p*q/32],label:`${c}.bits`});e.writeWeightsRange(G,0,b);let C=e.tensorFromTypedArray("float32",[d],$e(W)),S=$e(E[`${c}.input_activation_scale`])[0],D=$e(E[`${c}.output_activation_scale`])[0];m({bitsT:G,scaleT:C,bits:q,inFeatures:p,outFeatures:d,inScale:S,outScale:D,blockMajor:_})}}))},o=(c,d,p,f,m,_)=>{a.push(Ln({names:[`${c}.embedding_quantized`,`${c}.embedding_scale`],progressLabel:c,run:async E=>{let b=E[`${c}.embedding_quantized`],W=E[`${c}.embedding_scale`];if(!b||!W)throw new Error(`Missing tensors for ${c}`);let q=b.byteLength*8/(d*p);if(q!==2&&q!==4&&q!==8)throw new Error(`${c}: derived ${q}-bit from ${b.byteLength} bytes for [${d}, ${p}]`);let G=e.allocateWeightsBuffer({byteLength:b.byteLength,dtype:"uint32",shape:[d,p*q/32],label:`${c}.bits`});e.writeWeightsRange(G,0,b);let C=e.tensorFromTypedArray("float32",[d,m],$e(W));_({bitsT:G,scaleT:C,bits:q})}}))},i=(c,d,p,f)=>{a.push(Ln({names:[`${c}.weight`,`${c}.weight_scale`,`${c}.input_activation_scale`,`${c}.output_activation_scale`],progressLabel:c,run:async m=>{let _=m[`${c}.weight`],E=m[`${c}.weight_scale`];if(!_||!E)throw new Error(`Missing tensors for ${c}`);let b=new Int8Array(_.buffer,_.byteOffset,_.byteLength),W=$e(E),q=new Float32Array(d*p);for(let D=0;D<d;++D){let P=W[D],N=D*p;for(let R=0;R<p;++R)q[N+R]=b[N+R]*P}let G=e.tensorFromTypedArray("float32",[d,p],q);if(p%4===0){let D=new Uint32Array(d*p/4);for(let z=0;z<D.length;++z){let j=z*4;D[z]=b[j]+128|b[j+1]+128<<8|b[j+2]+128<<16|b[j+3]+128<<24}let P=e.tensorFromTypedArray("uint32",[d,p/4],D),N=e.tensorFromTypedArray("float32",[d],W.slice(0,d)),R=$e(m[`${c}.input_activation_scale`])[0],V=$e(m[`${c}.output_activation_scale`])[0];f({weightT:G,codesT:P,rowScaleT:N,inFeatures:p,outFeatures:d,inScale:R,outScale:V});return}let C=$e(m[`${c}.input_activation_scale`])[0],S=$e(m[`${c}.output_activation_scale`])[0];f({weightT:G,inFeatures:p,outFeatures:d,inScale:C,outScale:S})}}))},u=(c,d,p,f="float32")=>{a.push(Xs({name:c,sourceDtype:"BF16",targetDtype:f,shape:d??void 0,assign:m=>p(m)}))},l={layers:n.layers.map(()=>({}))};o(`${gn}.embed_tokens`,n.vocab_size,n.hidden_size,2,1,c=>{l.embedTokens=c}),o(`${gn}.embed_tokens_per_layer`,n.vocab_size_per_layer_input,n.num_hidden_layers*n.hidden_size_per_layer_input,4,n.num_hidden_layers,c=>{l.embedTokensPerLayer=c}),u(`${gn}.per_layer_model_projection.weight`,[n.num_hidden_layers*n.hidden_size_per_layer_input,n.hidden_size],c=>{l.perLayerModelProjection=c},"float16"),u(`${gn}.per_layer_projection_norm.weight`,[n.hidden_size_per_layer_input],c=>{l.perLayerProjectionNorm=c}),u(`${gn}.norm.weight`,[n.hidden_size],c=>{l.finalNorm=c}),s("lm_head",n.vocab_size,n.hidden_size,2,c=>{l.lmHead=c},!0);for(let c of n.layers){let d=c.index,p=`${gn}.layers.${d}`,f=l.layers[d];u(`${p}.input_layernorm.weight`,[n.hidden_size],m=>{f.inputLn=m}),u(`${p}.post_attention_layernorm.weight`,[n.hidden_size],m=>{f.postAttnLn=m}),u(`${p}.pre_feedforward_layernorm.weight`,[n.hidden_size],m=>{f.preFfLn=m}),u(`${p}.post_feedforward_layernorm.weight`,[n.hidden_size],m=>{f.postFfLn=m}),u(`${p}.post_per_layer_input_norm.weight`,[n.hidden_size],m=>{f.postPleLn=m}),u(`${p}.layer_scalar`,[1],m=>{f.layerScalarT=m}),s(`${p}.self_attn.q_proj`,c.qOut,n.hidden_size,c.attnBits,m=>{f.qProj=m}),u(`${p}.self_attn.q_norm.weight`,[c.headDim],m=>{f.qNorm=m}),c.isKvShared?(f.kProj=null,f.vProj=null,f.kNorm=null):(s(`${p}.self_attn.k_proj`,c.kvOut,n.hidden_size,c.attnBits,m=>{f.kProj=m}),s(`${p}.self_attn.v_proj`,c.kvOut,n.hidden_size,c.attnBits,m=>{f.vProj=m}),u(`${p}.self_attn.k_norm.weight`,[c.headDim],m=>{f.kNorm=m})),s(`${p}.self_attn.o_proj`,n.hidden_size,c.qOut,c.attnBits,m=>{f.oProj=m}),s(`${p}.mlp.gate_proj`,c.intermediate,n.hidden_size,c.mlpBits,m=>{f.gateProj=m}),s(`${p}.mlp.up_proj`,c.intermediate,n.hidden_size,c.mlpBits,m=>{f.upProj=m}),s(`${p}.mlp.down_proj`,n.hidden_size,c.intermediate,c.mlpBits,m=>{f.downProj=m}),i(`${p}.per_layer_input_gate`,n.hidden_size_per_layer_input,n.hidden_size,m=>{f.perLayerInputGate=m}),i(`${p}.per_layer_projection`,n.hidden_size,n.hidden_size_per_layer_input,m=>{f.perLayerProjection=m})}await Zs(a,{source:r,reader:Js(r),context:{rt:e},concurrency:t.concurrency,chunkMaxBytes:t.chunkMaxBytes,onProgress:t.onProgress??null,signal:t.signal});for(let c of l.layers)c.gateGeluLutT=e.tensorFromTypedArray("float32",[256],kt(c.gateProj.outScale)),c.pleGeluLutT=e.tensorFromTypedArray("float32",[256],kt(c.perLayerInputGate.outScale));return l}var y=Math.fround,Y=(e,n,r)=>y(e*n+r);function vr(e,n){let r=y(e+n),t=y(r-e);return{x:r,y:y(y(e-y(r-t))+y(n-t))}}function Sr(e,n){let r=y(e.x+n),t=y(r-e.x);return{x:r,y:y(y(y(e.x-y(r-t))+y(n-t))+e.y)}}function up(e,n){let r=y(e.x+n.x),t=y(r-e.x),a=y(y(e.x-y(r-t))+y(n.x-t));return{x:r,y:y(a+y(e.y+n.y))}}function to(e,n){let r=y(e+n);return{x:r,y:y(y(e-r)+n)}}function At(e,n){let r=y(e+n.x);return{x:r,y:y(y(y(e-r)+n.x)+n.y)}}function lp(e,n){let r=y(e.x+n);return{x:r,y:y(y(y(e.x-r)+n)+e.y)}}function Et(e,n){let r=y(e.x+n.x);return{x:r,y:y(y(y(y(e.x-r)+n.x)+e.y)+n.y)}}function Tr(e,n){let r=y(e.x*n);return{x:r,y:Y(e.y,n,Y(e.x,n,-r))}}function xr(e,n){let r=y(e.x*n.x);return{x:r,y:Y(e.x,n.y,Y(e.y,n.x,Y(e.x,n.x,-r)))}}function ao(e,n){return Y(e.x,n.x,Y(e.y,n.x,y(e.x*n.y)))}function Er(e){let n=y(e.x*e.x);return{x:n,y:Y(y(e.x+e.x),e.y,Y(e.x,e.x,-n))}}function cp(e,n){let r=y(1/n.x),t=y(e.x*r),a=Y(r,e.x,-t),s=Y(-n.y,r,Y(-n.x,r,1));return{x:t,y:Y(t,s,Y(e.y,r,a))}}function dp(e){let n=y(e.x+e.y);return{x:n,y:y(y(e.x-n)+e.y)}}function pp(e,n){return{x:y(e.x*n),y:y(e.y*n)}}var Gt=new Float32Array(1),so=new Uint32Array(Gt.buffer);function oo(e){return Gt[0]=e,so[0]}function Pt(e){return so[0]=e>>>0,Gt[0]}function fp(e){let n=oo(e);return n=n>>>23&255,n-127}function mp(e,n){return Pt(oo(e)+(n<<23)|0)}function gp(e,n){let r=n>>31;r=(r+n>>6)-r<<4,n=n-(r<<2),r+=127,r=r>0?r:0,r=r>255?255:r;let t=Pt(r<<23>>>0);return e=y(y(y(y(e*t)*t)*t)*t),t=Pt(n+127<<23>>>0),y(e*t)}function kr(e){let n=Math.floor(e),r=e-n;return r>.5?n+1:r<.5||n%2===0?n:n+1}var hp=y(1.4426950408889634),yp=y(.693145751953125),bp=y(1428606765330187e-21),io=y(.3183098861837907),uo=y(3.1414794921875),lo=y(.0001131594181060791),co=y(1984187258941006e-24),wp=11754943508222875e-54;function _p(e){let n=e<wp;n&&(e=y(e*y(2**32)*y(2**32)));let r=fp(y(e*y(1/.75))),t=mp(e,-r);n&&(r-=64);let a=cp(vr(-1,t),vr(1,t)),s=Er(a),o=y(.2403203547000885);o=Y(o,s.x,y(.2851126790046692)),o=Y(o,s.x,y(.4000079929828644));let i={x:y(.6666666269302368),y:y(36918386125961433e-25)},u=Tr({x:y(.6931471824645996),y:y(-1904654323148236e-24)},r);return u=Et(u,pp(a,2)),u=Et(u,xr(xr(s,a),up(Tr(s,o),i))),u}function vp(e){let n=kr(y(y(e.x+e.y)*hp)),r=n|0,t=Sr(e,y(n*-yp));t=Sr(t,y(n*-bp)),t=dp(t);let a=y(.0013632464688271284);a=Y(a,t.x,y(.00836596917361021)),a=Y(a,t.x,y(.04167108237743378)),a=Y(a,t.x,y(.16666552424430847)),a=Y(a,t.x,y(.49999985098838806));let s=Et(t,Tr(Er(t),a));s=At(1,s);let o=y(s.x+s.y);return o=gp(o,r),e.x<-104&&(o=0),o}function po(e,n){return n===0||e===1?1:vp(Tr(_p(Math.abs(y(e))),y(n)))}function fo(e){if(e=y(e),!(Math.abs(e)<125))return y(Math.sin(e));let n=kr(y(e*io)),r=n|0,t=Y(n,-uo,e),a=vr(t,y(n*-lo));a=lp(a,y(n*-co));let s=a,o=Er(a),i=y(26083159809786594e-22);i=Y(i,o.x,y(-.00019810690719168633)),i=Y(i,o.x,y(.00833307858556509));let u=At(1,xr(to(y(-.16666659712791443),y(i*o.x)),o)),l=ao(s,u);return(r&1)===1&&(l=-l),e===0&&1/e===-1/0&&(l=e),l}function mo(e){if(e=y(e),!(Math.abs(e)<125))return y(Math.cos(e));let n=Y(kr(Y(e,io,-.5)),2,1),r=kr(n)|0,t=vr(e,y(n*y(-uo*.5)));t=Sr(t,y(n*y(-lo*.5))),t=Sr(t,y(n*y(-co*.5)));let a=t,s=Er(t),o=y(26083159809786594e-22);o=Y(o,s.x,y(-.00019810690719168633)),o=Y(o,s.x,y(.00833307858556509));let i=At(1,xr(to(y(-.16666659712791443),y(o*s.x)),s)),u=ao(a,i);return(r&2)===0&&(u=-u),u}fr();fr();var Pr=class{programs=[];cleanups=[];rt;timing;collectMs=0;flushMs=0;constructor(n,r={}){this.rt=n,this.timing=r.timing===!0}capture=null;attnUniforms=[];cacheUniforms=[];captureNext(n){this.capture=n}add(n,r){let t=this.timing?performance.now():0,a=n.prepare(this.rt,r),s=Fn(this.rt,a),o=this.capture;this.capture=null;for(let i of s.programs)if(this.programs.push(i),o){let u=i.bindings.find(l=>l.type==="uniform");u?.buffer&&(o==="attn"?this.attnUniforms:this.cacheUniforms).push(u.buffer)}this.cleanups.push(s.cleanup),this.timing&&(this.collectMs+=performance.now()-t)}async buildSteps(){return this.rt.prepareProgramSequence(this.programs)}prependCopies(n){this.programs.unshift(...n.map(r=>({kind:"copy",src:r.src,dst:r.dst,srcOffset:r.srcOffset,dstOffset:0,byteLength:r.byteLength})))}enqueue(n){this.rt.enqueuePreparedProgramSequence(n)}disposeBuild(){for(let n of this.cleanups)n();this.programs=[],this.cleanups=[]}async flush(n=!0){if(this.programs.length===0)return;let r=this.timing?performance.now():0;await this.rt.runProgramSequence(this.programs,{wait:n}),this.timing&&(this.flushMs+=performance.now()-r);for(let t of this.cleanups)t();this.programs=[],this.cleanups=[]}};var oe={rms:ae("com.xenova.RMSNorm"),rope:ae("com.xenova.Rope1d"),mul:ae("com.xenova.MulBroadcast"),strided:ae("com.xenova.StridedCopy"),add:ae("com.xenova.AddInPlace"),qatMatmul:ae("com.xenova.gemma4.QatMatMul"),qatEmbed:ae("com.xenova.gemma4.QatEmbedGather"),attn:ae("com.xenova.gemma4.Attention"),argmax:ae("com.xenova.gemma4.ArgMax"),srq:ae("com.xenova.gemma4.SrqQuantize"),normAdd:ae("com.xenova.gemma4.DecodeNormAdd"),pleGate:ae("com.xenova.gemma4.PleGate"),gateUpNorm:ae("com.xenova.gemma4.DecodeGateUpNorm"),denseGemv:ae("com.xenova.gemma4.DenseGemv"),qkNormRope:ae("com.xenova.gemma4.DecodeQkNormRope"),pleGateFused:ae("com.xenova.gemma4.DecodePleGate"),rmsSrq:ae("com.xenova.gemma4.DecodeRmsSrq"),normAddNorm:ae("com.xenova.gemma4.DecodeNormAddNorm"),decodeAttn:ae("com.xenova.gemma4.DecodeAttention"),downNormAdd:ae("com.xenova.gemma4.DecodeDownNormAdd"),pleProjNorm:ae("com.xenova.gemma4.DecodePleProjNorm"),oprojNorm:ae("com.xenova.gemma4.DecodeOprojNorm"),qkvProj:ae("com.xenova.gemma4.DecodeQkvProj")},hn=e=>1<<e-1,Nn=e=>(1<<e)-1,Sp=!1,Xe=class extends Pr{constructor(n){super(n,{timing:Sp})}rms(n){this.add(oe.rms,{resources:{xT:n.xT,...n.wT?{wT:n.wT}:{},yT:n.yT},args:{rows:n.rows,dim:n.dim,eps:n.eps,exact:n.exact?1:0}})}rmsSrq(n){this.add(oe.rmsSrq,{resources:{xT:n.xT,wT:n.wT,yT:n.yT,sumAT:n.sumAT},args:{rows:n.rows,dim:n.dim,eps:n.eps,inScale:n.inScale}})}rope(n){this.add(oe.rope,{resources:{xT:n.xT,cosT:n.cosT,sinT:n.sinT},args:{seq:n.seq,heads:n.heads,headDim:n.headDim,exact:n.exact?1:0}})}qkNormRope(n){this.add(oe.qkNormRope,{resources:{xT:n.xT,wT:n.wT,cosT:n.cosT,sinT:n.sinT,ynT:n.ynT},args:{seq:n.seq,heads:n.heads,headDim:n.headDim,eps:n.eps,dstOffset:n.dstOffset??0}})}decodePleGate(n){let r=n.codesT&&n.rowScaleT;this.add(oe.pleGateFused,{resources:{aT:n.aT,...r?{codesT:n.codesT,rowScaleT:n.rowScaleT}:{wT:n.wT},pleT:n.pleT,geluLutT:n.geluLutT,outT:n.outT},args:{M:n.M,inFeatures:n.inFeatures,outFeatures:n.outFeatures,pleOffset:n.pleOffset,inScale:n.inScale??0,linOutScale:n.linOutScale??0,codes:r?1:0}})}mul(n){this.add(oe.mul,{resources:{xT:n.xT,factorT:n.factorT},args:{count:n.count,period:n.period??0}})}strided(n){this.add(oe.strided,{resources:{srcT:n.srcT,dstT:n.dstT,...n.uniformT?{p:n.uniformT}:{}},args:{rows:n.rows,srcStride:n.srcStride,srcStart:n.srcStart??0,dstStride:n.dstStride,dstStart:n.dstStart??0,copyCols:n.copyCols}})}addInPlace(n){this.add(oe.add,{resources:{yT:n.yT,xT:n.xT},args:{count:n.count}})}qatMatmul(n){let r=n.candValT&&n.candIdxT;this.add(oe.qatMatmul,{resources:{aT:n.aT,bitsT:n.bitsT,scaleT:n.scaleT,...n.sumAT?{sumAT:n.sumAT}:{},outT:n.outT,...r?{candValT:n.candValT,candIdxT:n.candIdxT}:{}},args:{M:n.M,inFeatures:n.inFeatures,outFeatures:n.outFeatures,bits:n.bits,zeroPoint:hn(n.bits),mask:Nn(n.bits),inputScale:n.inputScale??0,outputScale:n.outputScale??0,blockMajor:n.blockMajor?1:0,exact:n.exact?1:0,emitArgmax:r?1:0,aGridScale:n.aGridScale??0}})}qmm(n,r,t,a,s,o,i,u,l){let c=n;a.inScale!==0&&(this.srqQuantize({xT:n,yT:r,count:u*t,scale:a.inScale}),c=r),this.qatMatmul({aT:c,bitsT:a.bitsT,scaleT:a.scaleT,outT:o,M:u,inFeatures:t,outFeatures:s,bits:i,inputScale:0,outputScale:a.outScale,blockMajor:a.blockMajor,exact:l,aGridScale:a.inScale})}qkvProj(n){this.add(oe.qkvProj,{resources:{aT:n.aT,qBitsT:n.qBitsT,kBitsT:n.kBitsT,vBitsT:n.vBitsT,scalesT:n.scalesT,sumAT:n.sumAT,qT:n.qT,kT:n.kT,vT:n.vT},args:{inFeatures:n.inFeatures,qOut:n.qOut,kvOut:n.kvOut,bits:n.bits,zeroPoint:hn(n.bits),mask:Nn(n.bits),qOutScale:n.qOutScale,kOutScale:n.kOutScale,vOutScale:n.vOutScale}})}qatEmbed(n){let r=n.wT&&n.y2T&&n.sumAT;this.add(oe.qatEmbed,{resources:{idsT:n.idsT,bitsT:n.bitsT,scaleT:n.scaleT,yT:n.yT,...r?{wT:n.wT,y2T:n.y2T,sumAT:n.sumAT}:{}},args:{seq:n.seq,hidden:n.hidden,vocab:n.vocab,bits:n.bits,groupSize:n.groupSize,zeroPoint:hn(n.bits),embedScale:n.embedScale,normSrq:r?1:0,eps:n.eps??0,inScale:n.inScale??0}})}attn(n){this.add(oe.attn,{resources:{qT:n.qT,kT:n.kT,vT:n.vT,outT:n.outT},args:{seqQ:n.seqQ,keyLen:n.keyLen,qOffset:n.qOffset,qHeads:n.qHeads,kvHeads:n.kvHeads,headDim:n.headDim,scale:n.scale,window:n.window,exact:n.exact?1:0,maxKeyLen:n.maxKeyLen??0}})}decodeAttn(n){this.add(oe.decodeAttn,{resources:{qT:n.qT,wT:n.wT,cosT:n.cosT,sinT:n.sinT,kT:n.kT,vT:n.vT,outT:n.outT,...n.uniformT?{params:n.uniformT}:{}},args:{seqQ:n.seqQ,keyLen:n.keyLen,qOffset:n.qOffset,qHeads:n.qHeads,kvHeads:n.kvHeads,headDim:n.headDim,eps:n.eps,scale:n.scale,window:n.window,outQuantScale:n.outQuantScale??0}})}argmax(n){let r=n.candValT&&n.candIdxT;this.add(oe.argmax,{resources:{...r?{candValT:n.candValT,candIdxT:n.candIdxT}:{xT:n.xT},outT:n.outT},args:{count:n.count,finalize:r?1:0}})}srqQuantize(n){this.add(oe.srq,{resources:{xT:n.xT,yT:n.yT},args:{count:n.count,scale:n.scale}})}decodeNormAdd(n){this.add(oe.normAdd,{resources:{hiddenT:n.hiddenT,srcT:n.srcT,wT:n.wT,scaleT:n.scaleT},args:{rows:n.rows,dim:n.dim,eps:n.eps}})}downNormAdd(n){this.add(oe.downNormAdd,{resources:{aT:n.aT,bitsT:n.bitsT,scaleT:n.scaleT,hiddenT:n.hiddenT,wT:n.wT},args:{M:n.M,inFeatures:n.inFeatures,outFeatures:n.outFeatures,bits:n.bits,zeroPoint:hn(n.bits),mask:Nn(n.bits),inputScale:n.inputScale??0,outputScale:n.outputScale??0,eps:n.eps,codes:n.codes?1:0}})}oprojNorm(n){this.add(oe.oprojNorm,{resources:{aT:n.aT,bitsT:n.bitsT,scaleT:n.scaleT,hiddenT:n.hiddenT,w12T:n.w12T,y2T:n.y2T,sum2T:n.sum2T},args:{inFeatures:n.inFeatures,outFeatures:n.outFeatures,bits:n.bits,zeroPoint:hn(n.bits),mask:Nn(n.bits),outputScale:n.outputScale??0,eps:n.eps,inScale2:n.inScale2,rows:n.rows??0}})}pleProjNorm(n){let r=n.codesT&&n.rowScaleT;this.add(oe.pleProjNorm,{resources:{aT:n.aT,...r?{codesT:n.codesT,rowScaleT:n.rowScaleT}:{wT:n.wT},hiddenT:n.hiddenT,w12sT:n.w12sT,y2T:n.y2T,sum2T:n.sum2T},args:{inFeatures:n.inFeatures,outFeatures:n.outFeatures,eps:n.eps,inScale:n.inScale,projInScale:n.projInScale??0,projOutScale:n.projOutScale??0,codes:r?1:0}})}normAddNorm(n){this.add(oe.normAddNorm,{resources:{hiddenT:n.hiddenT,srcT:n.srcT,w1T:n.w1T,scaleT:n.scaleT,w2T:n.w2T,y2T:n.y2T,sum2T:n.sum2T},args:{rows:n.rows,dim:n.dim,eps:n.eps,inScale:n.inScale}})}pleGate(n){this.add(oe.pleGate,{resources:{aT:n.aT,bT:n.bT,geluLutT:n.geluLutT,yT:n.yT},args:{count:n.count,bOffset:n.bOffset??0,gridScale:n.gridScale??0}})}denseGemv(n){this.add(oe.denseGemv,{resources:{aT:n.aT,wT:n.wT,outT:n.outT},args:{M:n.M,inFeatures:n.inFeatures,outFeatures:n.outFeatures,inScale:n.inScale??0,outScale:n.outScale??0,exact:n.exact?1:0}})}decodeGateUpNorm(n){this.add(oe.gateUpNorm,{resources:{hiddenT:n.hiddenT,gateBitsT:n.gateBitsT,gateScaleT:n.gateScaleT,upBitsT:n.upBitsT,upScaleT:n.upScaleT,...n.sumAT?{sumAT:n.sumAT}:{},geluLutT:n.geluLutT,outT:n.outT},args:{M:n.M,inFeatures:n.inFeatures,outFeatures:n.outFeatures,bits:n.bits,zeroPoint:hn(n.bits),mask:Nn(n.bits),inScale:n.inScale,gateOutScale:n.gateOutScale,upOutScale:n.upOutScale,outQuantScale:n.outQuantScale??0,emitCodes:n.emitCodes?1:0,exact:n.exact?1:0}})}};function go(e,n,r,t,a){let s=Math.fround,o=r>>1,i=new Float32Array(n*o),u=new Float32Array(n*o),l=new Float32Array(o);for(let c=0;c<o;++c)l[c]=c<a?s(1/po(t,s(s(2*c)/s(r)))):0;for(let c=0;c<n;++c){let d=e+c;for(let p=0;p<o;++p){let f=s(d*l[p]);i[c*o+p]=mo(f),u[c*o+p]=fo(f)}}return{cos:i,sin:u}}var rn={create(e,n,r,t=0){let{sliding:a,full:s}=ho(n,t,r),o=n.head_dim>>1,i=n.global_head_dim>>1;return{cosSlidingT:e.tensorFromTypedArray("float32",[r,o],a.cos),sinSlidingT:e.tensorFromTypedArray("float32",[r,o],a.sin),cosFullT:e.tensorFromTypedArray("float32",[r,i],s.cos),sinFullT:e.tensorFromTypedArray("float32",[r,i],s.sin)}},write(e,n,r,t,a){let{sliding:s,full:o}=ho(n,t,a);e.writeBuffer(r.cosSlidingT.buffer,0,s.cos),e.writeBuffer(r.sinSlidingT.buffer,0,s.sin),e.writeBuffer(r.cosFullT.buffer,0,o.cos),e.writeBuffer(r.sinFullT.buffer,0,o.sin)}};function ho(e,n,r){let t=e.head_dim>>1,a=Math.trunc(e.fullPartialRotaryFactor*e.global_head_dim/2);return{sliding:go(n,r,e.head_dim,e.slidingRopeTheta,t),full:go(n,r,e.global_head_dim,e.fullRopeTheta,a)}}async function nn(e,n){let r=await e.readTensor(n);return r instanceof Float32Array?new Float32Array(r):Float32Array.from(r)}async function Ot(e,n,r,t,a=!1,s,o=!0){let{rt:i,config:u,weights:l}=e,c=n.length,d=u.hidden_size,p=u.num_hidden_layers,f=u.hidden_size_per_layer_input,m=p*f,_=u.rms_norm_eps,E=u.num_attention_heads,b=u.vocab_size,W=E*u.global_head_dim,q=u.num_key_value_heads,G=q*u.global_head_dim,C=u.intermediate_size*2,S=new Xe(i),D=[],P=(z,j)=>{let ne=i.empty("float32",z,j);return D.push(ne),ne},N=(z,j)=>{let ne=i.tensorFromTypedArray(j instanceof Uint32Array?"uint32":"float32",z,j);return D.push(ne),ne},R=a?{hiddenStates:[],perLayerInputs:new Float32Array(0),lastHidden:new Float32Array(0),allLogits:new Float32Array(0)}:void 0,V=s?async(z,j)=>{await S.flush(),s.set(z,await nn(i,j))}:null;try{let z=N([1],new Float32Array([1/Math.sqrt(d)])),j=N([1],new Float32Array([Math.SQRT1_2])),ne=N([c],n),Q=P([c,d],"g4-hidden"),ve=P([c,m],"g4-ple"),Z=P([c,d],"g4-normed"),g=P([c,W],"g4-q"),w=P([c,W],"g4-qn"),T=P([c,G],"g4-k"),X=P([c,G],"g4-kn"),Be=P([c,G],"g4-v"),Te=P([c,G],"g4-vn"),Se=P([c,W],"g4-attn"),Ke=P([c,d],"g4-oproj"),Ze=P([c,d],"g4-ffnormed"),xe=P([c,C],"g4-gelu"),$=P([c,d],"g4-down"),K=P([c,f],"g4-ple-slice"),M=P([c,f],"g4-ple-gate"),J=P([c,f],"g4-ple-gelu"),ke=P([c,d],"g4-ple-projout"),x=P([c,d],"g4-aqH"),fe=P([c,W],"g4-aqQ"),pe=P([c,C],"g4-aqI"),ue=P([c,d],"g4-nrm-tail");S.qatEmbed({idsT:ne,bitsT:l.embedTokens.bitsT,scaleT:l.embedTokens.scaleT,yT:Q,seq:c,hidden:d,vocab:b,bits:l.embedTokens.bits,groupSize:d,embedScale:u.embedScale}),R&&(await S.flush(),R.hiddenStates.push(await nn(i,Q)));{let we=P([c,m],"g4-ple-id"),H=P([c,m],"g4-ple-proj");S.qatEmbed({idsT:ne,bitsT:l.embedTokensPerLayer.bitsT,scaleT:l.embedTokensPerLayer.scaleT,yT:we,seq:c,hidden:m,vocab:u.vocab_size_per_layer_input,bits:l.embedTokensPerLayer.bits,groupSize:f,embedScale:u.perLayerEmbedScale}),S.denseGemv({aT:Q,wT:l.perLayerModelProjection,outT:H,M:c,inFeatures:d,outFeatures:m,exact:o}),S.mul({xT:H,factorT:z,count:c*m,period:1}),S.rms({xT:H,wT:l.perLayerProjectionNorm,yT:ve,rows:c*p,dim:f,eps:_,exact:o}),S.addInPlace({yT:ve,xT:we,count:c*m}),S.mul({xT:ve,factorT:j,count:c*m,period:1})}R&&(await S.flush(),R.perLayerInputs=await nn(i,ve));let me=rn.create(i,u,c,r);D.push(me.cosSlidingT,me.sinSlidingT,me.cosFullT,me.sinFullT);for(let we=0;we<p;++we){let H=u.layers[we],an=H.headDim,Bt=H.qOut,qt=H.intermediate,L=l.layers[we],It=H.isSliding?me.cosSlidingT:me.cosFullT,Dt=H.isSliding?me.sinSlidingT:me.sinFullT;if(S.rms({xT:Q,wT:L.inputLn,yT:Z,rows:c,dim:d,eps:_,exact:o}),V&&await V(`L${we}.input_layernorm`,Z),S.qmm(Z,x,d,L.qProj,Bt,g,L.qProj.bits,c,!0),S.rms({xT:g,wT:L.qNorm,yT:w,rows:c*E,dim:an,eps:_,exact:o}),V&&await V(`L${we}.q_norm`,w),S.rope({xT:w,cosT:It,sinT:Dt,seq:c,heads:E,headDim:an,exact:o}),!H.isKvShared){let qe=H.kvOut;S.qmm(Z,x,d,L.kProj,qe,T,L.kProj.bits,c,!0),S.rms({xT:T,wT:L.kNorm,yT:X,rows:c*q,dim:an,eps:_,exact:o}),S.rope({xT:X,cosT:It,sinT:Dt,seq:c,heads:q,headDim:an,exact:o}),S.qmm(Z,x,d,L.vProj,qe,Be,L.vProj.bits,c,!0),S.rms({xT:Be,yT:Te,rows:c*q,dim:an,eps:_,exact:o}),S.strided({srcT:X,dstT:t.keyT(we),rows:c,srcStride:qe,srcStart:0,dstStride:qe,dstStart:r*qe,copyCols:qe}),S.strided({srcT:Te,dstT:t.valueT(we),rows:c,srcStride:qe,srcStart:0,dstStride:qe,dstStart:r*qe,copyCols:qe})}let Ut=H.kvSourceLayer,xo=r+c;S.attn({qT:w,kT:t.keyT(Ut),vT:t.valueT(Ut),outT:Se,seqQ:c,keyLen:xo,qOffset:r,qHeads:E,kvHeads:q,headDim:an,scale:1,window:H.slidingWindow,exact:o}),S.qmm(Se,fe,Bt,L.oProj,d,Ke,L.oProj.bits,c,!0),V&&await V(`L${we}.self_attn`,Ke),S.rms({xT:Ke,wT:L.postAttnLn,yT:ue,rows:c,dim:d,eps:_,exact:o}),S.addInPlace({yT:Q,xT:ue,count:c*d}),S.rms({xT:Q,wT:L.preFfLn,yT:Ze,rows:c,dim:d,eps:_,exact:o}),S.decodeGateUpNorm({hiddenT:Ze,gateBitsT:L.gateProj.bitsT,gateScaleT:L.gateProj.scaleT,upBitsT:L.upProj.bitsT,upScaleT:L.upProj.scaleT,geluLutT:L.gateGeluLutT,outT:xe,M:c,inFeatures:d,outFeatures:qt,bits:L.gateProj.bits,inScale:L.gateProj.inScale,gateOutScale:L.gateProj.outScale,upOutScale:L.upProj.outScale,exact:o}),S.qmm(xe,pe,qt,L.downProj,d,$,L.downProj.bits,c,!0),V&&await V(`L${we}.mlp`,$),S.rms({xT:$,wT:L.postFfLn,yT:ue,rows:c,dim:d,eps:_,exact:o}),S.addInPlace({yT:Q,xT:ue,count:c*d}),S.strided({srcT:ve,dstT:K,rows:c,srcStride:m,srcStart:we*f,dstStride:f,dstStart:0,copyCols:f}),S.denseGemv({aT:Q,wT:L.perLayerInputGate.weightT,outT:M,M:c,inFeatures:d,outFeatures:f,inScale:L.perLayerInputGate.inScale,outScale:L.perLayerInputGate.outScale,exact:o}),S.pleGate({aT:M,bT:K,geluLutT:L.pleGeluLutT,yT:J,count:c*f,gridScale:L.perLayerInputGate.outScale}),S.denseGemv({aT:J,wT:L.perLayerProjection.weightT,outT:ke,M:c,inFeatures:f,outFeatures:d,inScale:L.perLayerProjection.inScale,outScale:L.perLayerProjection.outScale,exact:o}),S.rms({xT:ke,wT:L.postPleLn,yT:ue,rows:c,dim:d,eps:_,exact:o}),S.addInPlace({yT:Q,xT:ue,count:c*d}),S.mul({xT:Q,factorT:L.layerScalarT,count:c*d,period:1}),R&&(await S.flush(),R.hiddenStates.push(await nn(i,Q)))}let Ee=P([c,d],"g4-final-norm");S.rms({xT:Q,wT:l.finalNorm,yT:Ee,rows:c,dim:d,eps:_,exact:o}),R&&(await S.flush(),R.lastHidden=await nn(i,Ee));let F=P([1,d],"g4-last-row");S.strided({srcT:Ee,dstT:F,rows:1,srcStride:d,srcStart:(c-1)*d,dstStride:d,dstStart:0,copyCols:d});let le=P([1,b],"g4-logits");S.qmm(F,x,d,l.lmHead,b,le,l.lmHead.bits,1,!0);let Ce=i.tensorFromTypedArray("uint32",[1],new Uint32Array(1));D.push(Ce),S.argmax({xT:le,outT:Ce,count:b}),await S.flush(),R&&(R.allLogits=await nn(i,le));let zn=(await i.readTensor(Ce))[0];return R?{nextToken:zn,lastLogits:await nn(i,le),debug:R}:{nextToken:zn}}finally{for(let z of D)en(z)}}var yn=class{steps=[];owned=[];col;constructor(n){this.col=n}allocOwned(n,r,t="float32"){let a=this.col.rt.empty(t,n,r);return this.owned.push(a),a}uploadOwned(n,r){let t=this.col.rt.tensorFromTypedArray(r instanceof Uint32Array?"uint32":"float32",n,r);return this.owned.push(t),t}dispose(){this.col.disposeBuild();for(let n of this.owned){let r=n.destroy;typeof r=="function"&&r.call(n)}this.owned.length=0,this.steps=[]}};var yo=!1,Ar=[],Rt=[],Wt=[],bo=!0,_e=new Set("".split(",").filter(Boolean));function Ft(e){if(e.length===0)return 0;let n=[...e].sort((r,t)=>r-t);return n[n.length>>1]}var Gr=class extends yn{model;cache;idsT;rope;attnUni=new Map;cacheUni=new Map;constructor(n,r){super(new Xe(n.rt)),this.model=n,this.cache=r}async build(n){let{rt:r,config:t,weights:a}=this.model,s=this.col,o=t.hidden_size,i=t.num_hidden_layers,u=t.hidden_size_per_layer_input,l=i*u,c=t.rms_norm_eps,d=t.num_attention_heads,p=t.vocab_size,f=d*t.global_head_dim,m=t.num_key_value_heads,_=m*t.global_head_dim,E=t.intermediate_size*2,b=1,W=this.uploadOwned([1],new Float32Array([1/Math.sqrt(o)])),q=this.uploadOwned([1],new Float32Array([Math.SQRT1_2]));this.idsT=this.uploadOwned([b],new Uint32Array([0])),this.rope=rn.create(r,t,b,n),this.owned.push(this.rope.cosSlidingT,this.rope.sinSlidingT,this.rope.cosFullT,this.rope.sinFullT);let G=this.allocOwned([b,o],"g4d-hidden"),C=this.allocOwned([b,l],"g4d-ple"),S=this.allocOwned([b,o],"g4d-normed"),D=this.allocOwned([b,f],"g4d-q"),P=this.allocOwned([b,_],"g4d-k"),N=this.allocOwned([b,_],"g4d-kn"),R=this.allocOwned([b,_],"g4d-v"),V=this.allocOwned([b,_],"g4d-vn"),z=this.allocOwned([b,f],"g4d-attn"),j=this.allocOwned([b,o],"g4d-ffnormed","float16"),ne=this.allocOwned([b,E],"g4d-gelu","float16"),Q=this.allocOwned([b,u],"g4d-ple-gelu"),ve=this.allocOwned([b],"g4d-ff-suma"),Z=this.allocOwned([b],"g4d-n-suma"),g=this.allocOwned([b,o],"g4d-final-norm"),w=this.allocOwned([b,l],"g4d-ple-id"),T=this.allocOwned([b,l],"g4d-ple-proj"),X=this.allocOwned([1,p],"g4d-logits"),Be=($,K,M)=>{let J=$.get(K);return J||(J=r.createUniformU32(new Uint32Array(8),`${M}-${K}`),$.set(K,J)),J},Te=($,K,M,J,ke,x,fe=b,pe)=>{s.qatMatmul({aT:$,bitsT:M.bitsT,scaleT:M.scaleT,sumAT:pe,outT:ke,M:fe,inFeatures:K,outFeatures:J,bits:x,inputScale:M.inScale,outputScale:M.outScale,blockMajor:M.blockMajor})},Se=t.layers.map(($,K)=>{let M=a.layers[K];return!$.isKvShared&&!!M.kProj&&!!M.vProj&&M.kProj.bits===M.qProj.bits&&M.vProj.bits===M.qProj.bits&&!M.qProj.blockMajor&&!_e.has("qproj")&&!_e.has("kv")}),Ke=[],Ze=[],xe=[];{let $=[],K=(M,J,ke,x)=>$.push({kind:"copy",name:"g4d-weight-pack",src:M,dst:J,srcOffset:0,dstOffset:ke,byteLength:x});for(let M=0;M<i;++M){let J=a.layers[M],x=M===i-1?a.finalNorm:a.layers[M+1].inputLn,fe=this.allocOwned([2*o+1],`g4d-w12s-${M}`);K(J.postPleLn,fe,0,o*4),K(x,fe,o*4,o*4),K(J.layerScalarT,fe,2*o*4,4),Ke.push(fe);let pe=this.allocOwned([2*o],`g4d-wattn12-${M}`);if(K(J.postAttnLn,pe,0,o*4),K(J.preFfLn,pe,o*4,o*4),Ze.push(pe),Se[M]){let{qOut:ue,kvOut:me}=t.layers[M],Ee=this.allocOwned([ue+2*me],`g4d-qkvscales-${M}`);K(J.qProj.scaleT,Ee,0,ue*4),K(J.kProj.scaleT,Ee,ue*4,me*4),K(J.vProj.scaleT,Ee,(ue+me)*4,me*4),xe.push(Ee)}else xe.push(null)}await r.runProgramSequence($)}s.qatEmbed({idsT:this.idsT,bitsT:a.embedTokens.bitsT,scaleT:a.embedTokens.scaleT,yT:G,seq:b,hidden:o,vocab:p,bits:a.embedTokens.bits,groupSize:o,embedScale:t.embedScale}),s.qatEmbed({idsT:this.idsT,bitsT:a.embedTokensPerLayer.bitsT,scaleT:a.embedTokensPerLayer.scaleT,yT:w,seq:b,hidden:l,vocab:t.vocab_size_per_layer_input,bits:a.embedTokensPerLayer.bits,groupSize:u,embedScale:t.perLayerEmbedScale}),s.denseGemv({aT:G,wT:a.perLayerModelProjection,outT:T,M:b,inFeatures:o,outFeatures:l}),s.mul({xT:T,factorT:W,count:b*l,period:1}),s.rms({xT:T,wT:a.perLayerProjectionNorm,yT:C,rows:b*i,dim:u,eps:c}),s.addInPlace({yT:C,xT:w,count:b*l}),s.mul({xT:C,factorT:q,count:b*l,period:1});for(let $=0;$<i;++$){let K=t.layers[$],M=K.headDim,J=K.qOut,ke=K.intermediate,x=a.layers[$],fe=K.isSliding?this.rope.cosSlidingT:this.rope.cosFullT,pe=K.isSliding?this.rope.sinSlidingT:this.rope.sinFullT,ue=x.qProj.inScale;if(x.gateProj.bits!==x.upProj.bits)throw new Error(`layer ${$}: gate/up bit-width mismatch`);if(x.kProj&&(x.kProj.inScale!==ue||x.vProj.inScale!==ue))throw new Error(`layer ${$}: q/k/v input_activation_scale mismatch`);if($===0&&!_e.has("inorm")&&s.rmsSrq({xT:G,wT:x.inputLn,yT:S,sumAT:Z,rows:b,dim:o,eps:c,inScale:ue}),Se[$]?s.qkvProj({aT:S,qBitsT:x.qProj.bitsT,kBitsT:x.kProj.bitsT,vBitsT:x.vProj.bitsT,scalesT:xe[$],sumAT:Z,qT:D,kT:P,vT:R,inFeatures:o,qOut:J,kvOut:K.kvOut,bits:x.qProj.bits,qOutScale:x.qProj.outScale,kOutScale:x.kProj.outScale,vOutScale:x.vProj.outScale}):_e.has("qproj")||Te(S,o,x.qProj,J,D,x.qProj.bits,b,Z),!K.isKvShared&&!_e.has("kv")){let le=K.kvOut;Se[$]||Te(S,o,x.kProj,le,P,x.kProj.bits,b,Z),s.qkNormRope({xT:P,wT:x.kNorm,cosT:fe,sinT:pe,ynT:N,seq:b,heads:m,headDim:M,eps:c}),Se[$]||Te(S,o,x.vProj,le,R,x.vProj.bits,b,Z),s.rms({xT:R,yT:V,rows:b*m,dim:M,eps:c});let Ce=n*le,tn=Be(this.cacheUni,le,"g4d-cache-uni");s.strided({srcT:N,dstT:this.cache.keyT($),rows:b,srcStride:le,srcStart:0,dstStride:le,dstStart:Ce,copyCols:le,uniformT:tn}),s.strided({srcT:V,dstT:this.cache.valueT($),rows:b,srcStride:le,srcStart:0,dstStride:le,dstStart:Ce,copyCols:le,uniformT:tn})}let me=K.kvSourceLayer,Ee=n+b;if(_e.has("attnop")||s.decodeAttn({qT:D,wT:x.qNorm,cosT:fe,sinT:pe,kT:this.cache.keyT(me),vT:this.cache.valueT(me),outT:z,seqQ:b,keyLen:Ee,qOffset:n,qHeads:d,kvHeads:m,headDim:M,eps:c,scale:1,window:K.slidingWindow,outQuantScale:x.oProj.inScale,uniformT:Be(this.attnUni,K.slidingWindow,"g4d-attn-uni")}),!_e.has("oproj")&&!_e.has("postattnnorm")&&s.oprojNorm({aT:z,bitsT:x.oProj.bitsT,scaleT:x.oProj.scaleT,hiddenT:G,w12T:Ze[$],y2T:j,sum2T:ve,inFeatures:J,outFeatures:o,bits:x.oProj.bits,outputScale:x.oProj.outScale,eps:c,inScale2:x.gateProj.inScale,rows:0}),_e.has("mlp")||(_e.has("gateup")||s.decodeGateUpNorm({hiddenT:j,gateBitsT:x.gateProj.bitsT,gateScaleT:x.gateProj.scaleT,upBitsT:x.upProj.bitsT,upScaleT:x.upProj.scaleT,sumAT:ve,geluLutT:x.gateGeluLutT,outT:ne,M:b,inFeatures:o,outFeatures:ke,bits:x.gateProj.bits,inScale:x.gateProj.inScale,gateOutScale:x.gateProj.outScale,upOutScale:x.upProj.outScale,outQuantScale:x.downProj.inScale,emitCodes:!0}),_e.has("down")||s.downNormAdd({aT:ne,bitsT:x.downProj.bitsT,scaleT:x.downProj.scaleT,hiddenT:G,wT:x.postFfLn,M:b,inFeatures:ke,outFeatures:o,bits:x.downProj.bits,inputScale:x.downProj.inScale,outputScale:x.downProj.outScale,eps:c,codes:!0})),!_e.has("ple")&&!_e.has("plegate")){let le=bo&&x.perLayerInputGate.codesT&&x.perLayerInputGate.rowScaleT;s.decodePleGate({aT:G,wT:x.perLayerInputGate.weightT,...le?{codesT:x.perLayerInputGate.codesT,rowScaleT:x.perLayerInputGate.rowScaleT}:{},pleT:C,geluLutT:x.pleGeluLutT,outT:Q,M:b,inFeatures:o,outFeatures:u,pleOffset:$*u,inScale:x.perLayerInputGate.inScale,linOutScale:x.perLayerInputGate.outScale})}let F=$===i-1;if(!_e.has("pleproj")&&!_e.has("plenormadd")){let le=bo&&x.perLayerProjection.codesT&&x.perLayerProjection.rowScaleT;s.pleProjNorm({aT:Q,wT:x.perLayerProjection.weightT,...le?{codesT:x.perLayerProjection.codesT,rowScaleT:x.perLayerProjection.rowScaleT}:{},hiddenT:G,w12sT:Ke[$],y2T:F?g:S,sum2T:Z,inFeatures:u,outFeatures:o,eps:c,projInScale:x.perLayerProjection.inScale,projOutScale:x.perLayerProjection.outScale,inScale:F?a.lmHead.inScale:a.layers[$+1].qProj.inScale})}}_e.has("lmhead")||Te(g,o,a.lmHead,p,X,a.lmHead.bits,1,Z),s.argmax({xT:X,outT:this.idsT,count:p}),this.steps=await s.buildSteps()}writeStepInputs(n,r){let{rt:t,config:a}=this.model,s=t.host,o=1;n!==null&&s.writeBuffer(this.idsT.buffer,0,new Uint32Array([n])),rn.write(s,a,this.rope,r,o);let i=r+o,u=a.num_attention_heads,l=a.num_key_value_heads;for(let[c,d]of this.attnUni)s.writeBuffer(d,0,new Uint32Array([1,i,r,u,l,c,0,0]));for(let[c,d]of this.cacheUni)s.writeBuffer(d,0,new Uint32Array([1,c,c,0,c,r*c,0,0]))}submitStep(n,r){return this.writeStepInputs(n,r),this.col.enqueue(this.steps),this.model.rt.readTensor(this.idsT).then(t=>t[0])}async step(n,r){let{rt:t}=this.model;if(this.writeStepInputs(n,r),yo){let s=performance.now();this.col.enqueue(this.steps);let o=performance.now();await t.queueIdle();let i=performance.now(),u=await t.readTensor(this.idsT),l=performance.now();return Ar.push(o-s),Rt.push(i-o),Wt.push(l-i),u[0]}return this.col.enqueue(this.steps),(await t.readTensor(this.idsT))[0]}get _diagnostics(){return{rt:this.model.rt,idsT:this.idsT,steps:this.steps,writeStepInputs:(n,r)=>this.writeStepInputs(n,r),enqueue:()=>this.col.enqueue(this.steps),measureGpuMs:()=>this.model.rt.measurePreparedSequenceGpuMs?this.model.rt.measurePreparedSequenceGpuMs(this.steps):Promise.resolve(null)}}reportTiming(){if(!yo||Ar.length===0)return;let n=Ar.slice(2),r=Rt.slice(2),t=Wt.slice(2);console.error(`[g4d] per-token median: cpu-encode=${Ft(n).toFixed(2)}ms gpu-compute=${Ft(r).toFixed(2)}ms readback=${Ft(t).toFixed(2)}ms (n=${n.length})`),Ar.length=0,Rt.length=0,Wt.length=0}dispose(){this.reportTiming(),super.dispose();for(let n of[...this.attnUni.values(),...this.cacheUni.values()])n.destroy?.();this.attnUni.clear(),this.cacheUni.clear()}};var Tp=()=>!1,ie=new Set("".split(",").filter(Boolean)),Or=class extends yn{model;cache;blockLen;idsT;tokenIdT;lastRowUniform=null;rope;attn=[];cacheWrites=[];hiddenSize;constructor(n,r,t){super(new Xe(n.rt)),this.model=n,this.cache=r,this.blockLen=t,this.hiddenSize=n.config.hidden_size}async build(){let n=Tp(),{rt:r,config:t,weights:a}=this.model,s=this.col,o=this.cache,i=this.blockLen,u=0,l=t.hidden_size,c=t.num_hidden_layers,d=t.hidden_size_per_layer_input,p=c*d,f=t.rms_norm_eps,m=t.num_attention_heads,_=t.vocab_size,E=m*t.global_head_dim,b=t.num_key_value_heads,W=b*t.global_head_dim,q=t.intermediate_size*2,G=this.uploadOwned([1],new Float32Array([1/Math.sqrt(l)])),C=this.uploadOwned([1],new Float32Array([Math.SQRT1_2]));this.idsT=this.uploadOwned([i],new Uint32Array(i)),this.tokenIdT=this.uploadOwned([1],new Uint32Array(1));let S=this.allocOwned([i,l],"g4p-hidden"),D=this.allocOwned([i,p],"g4p-ple"),P=this.allocOwned([i,l],"g4p-normed"),N=this.allocOwned([i,E],"g4p-q"),R=this.allocOwned([i,E],"g4p-qn"),V=this.allocOwned([i,W],"g4p-k"),z=this.allocOwned([i,W],"g4p-kn"),j=this.allocOwned([i,W],"g4p-v"),ne=this.allocOwned([i,W],"g4p-vn"),Q=this.allocOwned([i,E],"g4p-attn"),ve=this.allocOwned([i,l],"g4p-oproj"),Z=this.allocOwned([i,l],"g4p-ffnormed"),g=this.allocOwned([i,q],"g4p-gelu"),w=this.allocOwned([i,l],"g4p-down"),T=this.allocOwned([i,d],"g4p-ple-slice"),X=this.allocOwned([i,d],"g4p-ple-gate"),Be=this.allocOwned([i,d],"g4p-ple-gelu"),Te=this.allocOwned([i,l],"g4p-ple-projout"),Se=this.allocOwned([i,l],"g4p-aqH"),Ke=this.allocOwned([i,E],"g4p-aqQ"),Ze=this.allocOwned([i,q],"g4p-aqI"),xe=this.allocOwned([i,l],"g4p-nrm-tail"),$=this.allocOwned([1,_],"g4p-logits");s.qatEmbed({idsT:this.idsT,bitsT:a.embedTokens.bitsT,scaleT:a.embedTokens.scaleT,yT:S,seq:i,hidden:l,vocab:_,bits:a.embedTokens.bits,groupSize:l,embedScale:t.embedScale});let K=this.allocOwned([i,p],"g4p-ple-id"),M=this.allocOwned([i,p],"g4p-ple-proj");s.qatEmbed({idsT:this.idsT,bitsT:a.embedTokensPerLayer.bitsT,scaleT:a.embedTokensPerLayer.scaleT,yT:K,seq:i,hidden:p,vocab:t.vocab_size_per_layer_input,bits:a.embedTokensPerLayer.bits,groupSize:d,embedScale:t.perLayerEmbedScale}),ie.has("ple")||s.denseGemv({aT:S,wT:a.perLayerModelProjection,outT:M,M:i,inFeatures:l,outFeatures:p,exact:n}),s.mul({xT:M,factorT:G,count:i*p,period:1}),ie.has("rms")||s.rms({xT:M,wT:a.perLayerProjectionNorm,yT:D,rows:i*c,dim:d,eps:f,exact:n}),s.addInPlace({yT:D,xT:K,count:i*p}),s.mul({xT:D,factorT:C,count:i*p,period:1}),this.rope=rn.create(r,t,i,u),this.owned.push(this.rope.cosSlidingT,this.rope.sinSlidingT,this.rope.cosFullT,this.rope.sinFullT);for(let fe=0;fe<c;++fe){let pe=t.layers[fe],ue=pe.headDim,me=pe.qOut,Ee=pe.intermediate,F=a.layers[fe],le=pe.isSliding?this.rope.cosSlidingT:this.rope.cosFullT,Ce=pe.isSliding?this.rope.sinSlidingT:this.rope.sinFullT;if(ie.has("rms")||s.rms({xT:S,wT:F.inputLn,yT:P,rows:i,dim:l,eps:f,exact:n}),!ie.has("qmm")&&!ie.has("qkv")&&s.qmm(P,Se,l,F.qProj,me,N,F.qProj.bits,i,n),ie.has("rms")||s.rms({xT:N,wT:F.qNorm,yT:R,rows:i*m,dim:ue,eps:f,exact:n}),s.rope({xT:R,cosT:le,sinT:Ce,seq:i,heads:m,headDim:ue,exact:n}),!pe.isKvShared){let H=pe.kvOut;!ie.has("qmm")&&!ie.has("qkv")&&s.qmm(P,Se,l,F.kProj,H,V,F.kProj.bits,i,n),ie.has("rms")||s.rms({xT:V,wT:F.kNorm,yT:z,rows:i*b,dim:ue,eps:f,exact:n}),s.rope({xT:z,cosT:le,sinT:Ce,seq:i,heads:b,headDim:ue,exact:n}),!ie.has("qmm")&&!ie.has("qkv")&&s.qmm(P,Se,l,F.vProj,H,j,F.vProj.bits,i,n),ie.has("rms")||s.rms({xT:j,yT:ne,rows:i*b,dim:ue,eps:f,exact:n}),s.captureNext("cache"),s.strided({srcT:z,dstT:o.keyT(fe),rows:i,srcStride:H,srcStart:0,dstStride:H,dstStart:u*H,copyCols:H}),this.cacheWrites.push({buffer:s.cacheUniforms[s.cacheUniforms.length-1],kv:H}),s.captureNext("cache"),s.strided({srcT:ne,dstT:o.valueT(fe),rows:i,srcStride:H,srcStart:0,dstStride:H,dstStart:u*H,copyCols:H}),this.cacheWrites.push({buffer:s.cacheUniforms[s.cacheUniforms.length-1],kv:H})}let tn=pe.kvSourceLayer,zn=u+i,we=s.attnUniforms.length;s.captureNext("attn"),ie.has("attn")||s.attn({qT:R,kT:o.keyT(tn),vT:o.valueT(tn),outT:Q,seqQ:i,keyLen:zn,qOffset:u,qHeads:m,kvHeads:b,headDim:ue,scale:1,window:pe.slidingWindow,exact:n,maxKeyLen:o.maxLength});for(let H=we;H<s.attnUniforms.length;++H)this.attn.push({buffer:s.attnUniforms[H],window:pe.slidingWindow});ie.has("qmm")||s.qmm(Q,Ke,me,F.oProj,l,ve,F.oProj.bits,i,n),ie.has("rms")||s.rms({xT:ve,wT:F.postAttnLn,yT:xe,rows:i,dim:l,eps:f,exact:n}),s.addInPlace({yT:S,xT:xe,count:i*l}),ie.has("rms")||s.rms({xT:S,wT:F.preFfLn,yT:Z,rows:i,dim:l,eps:f,exact:n}),ie.has("gateup")||s.decodeGateUpNorm({hiddenT:Z,gateBitsT:F.gateProj.bitsT,gateScaleT:F.gateProj.scaleT,upBitsT:F.upProj.bitsT,upScaleT:F.upProj.scaleT,geluLutT:F.gateGeluLutT,outT:g,M:i,inFeatures:l,outFeatures:Ee,bits:F.gateProj.bits,inScale:F.gateProj.inScale,gateOutScale:F.gateProj.outScale,upOutScale:F.upProj.outScale,exact:n}),ie.has("qmm")||s.qmm(g,Ze,Ee,F.downProj,l,w,F.downProj.bits,i,n),ie.has("rms")||s.rms({xT:w,wT:F.postFfLn,yT:xe,rows:i,dim:l,eps:f,exact:n}),s.addInPlace({yT:S,xT:xe,count:i*l}),s.strided({srcT:D,dstT:T,rows:i,srcStride:p,srcStart:fe*d,dstStart:0,dstStride:d,copyCols:d}),ie.has("ple")||s.denseGemv({aT:S,wT:F.perLayerInputGate.weightT,outT:X,M:i,inFeatures:l,outFeatures:d,inScale:F.perLayerInputGate.inScale,outScale:F.perLayerInputGate.outScale,exact:n}),s.pleGate({aT:X,bT:T,geluLutT:F.pleGeluLutT,yT:Be,count:i*d,gridScale:F.perLayerInputGate.outScale}),ie.has("ple")||s.denseGemv({aT:Be,wT:F.perLayerProjection.weightT,outT:Te,M:i,inFeatures:d,outFeatures:l,inScale:F.perLayerProjection.inScale,outScale:F.perLayerProjection.outScale,exact:n}),ie.has("rms")||s.rms({xT:Te,wT:F.postPleLn,yT:xe,rows:i,dim:l,eps:f,exact:n}),s.addInPlace({yT:S,xT:xe,count:i*l}),s.mul({xT:S,factorT:F.layerScalarT,count:i*l,period:1})}let J=this.allocOwned([i,l],"g4p-final-norm");ie.has("rms")||s.rms({xT:S,wT:a.finalNorm,yT:J,rows:i,dim:l,eps:f,exact:n});let ke=this.allocOwned([1,l],"g4p-last-row");s.captureNext("cache"),s.strided({srcT:J,dstT:ke,rows:1,srcStride:l,srcStart:(i-1)*l,dstStride:l,dstStart:0,copyCols:l}),this.lastRowUniform=s.cacheUniforms[s.cacheUniforms.length-1];let x=$;s.qmm(ke,Se,l,a.lmHead,_,x,a.lmHead.bits,1,n),s.argmax({xT:x,outT:this.tokenIdT,count:_}),this.steps=await s.buildSteps()}async run(n,r=0){if(n.length===0||n.length>this.blockLen)throw new Error(`prefill block ${this.blockLen} cannot run ${n.length} tokens`);let{rt:t,config:a}=this.model,s=t.host,o=this.blockLen,i=new Uint32Array(o);i.set(n),s.writeBuffer(this.idsT.buffer,0,i),rn.write(s,a,this.rope,r,o);let u=a.num_attention_heads,l=a.num_key_value_heads,c=r+o;for(let f of this.attn)s.writeBuffer(f.buffer,0,new Uint32Array([o,c,r,u,l,f.window,0,0]));for(let f of this.cacheWrites)s.writeBuffer(f.buffer,0,new Uint32Array([o,f.kv,f.kv,0,f.kv,r*f.kv,0,0]));let d=this.hiddenSize;return s.writeBuffer(this.lastRowUniform,0,new Uint32Array([1,d,d,(n.length-1)*d,d,0,0,0])),this.col.enqueue(this.steps),(await t.readTensor(this.tokenIdT))[0]}};async function*wo(e){let n=[];for(;n.length<e.depth&&e.shouldSubmit();)n.push(await e.submit());try{for(;n.length>0;){let r=n.shift();e.shouldSubmit()&&n.length<e.depth&&n.push(await e.submit());let t=await r.result;if(yield*e.accept(r,t))return}}finally{for(let r of n)try{await r.result}catch{}}}function _o(e,n={}){return{maxNewTokens:Number(e.max_new_tokens??e.maxNewTokens??0),eosTokenId:e.eos_token_id??e.eosTokenId??n.eosTokenId??null,stopOnEos:e.stop_on_eos!==!1&&e.stopOnEos!==!1,onPrefillDone:e.on_prefill_done??e.onPrefillDone??null}}function Rr(e,n){return n==null?!1:Array.isArray(n)?n.includes(e):e===n}var vo=4;function So(e){let n=Array.isArray(e)&&Array.isArray(e[0])?e[0]:e;return Uint32Array.from(n)}var Wr=class e{static ConfigClass=Dn;static MODEL_NAME="Gemma4";rt;config;weights;constructor(n){this.rt=n.runtime,this.config=n.config,this.weights=n.weights}static async fromSnapshot(n,r,t,a={}){let s={};a.cache!==void 0&&(s.cache=a.cache),a.force!==void 0&&(s.force=a.force),a.cacheName!==void 0&&(s.cacheName=a.cacheName),a.cacheStorage!==void 0&&(s.cacheStorage=a.cacheStorage),a.fetch!==void 0&&(s.fetch=a.fetch),a.signal!==void 0&&(s.signal=a.signal);let o=await t.readJsonResource(r,"config.json",s),i=new Dn(o),u=await t.openSafeTensorsResource(r,a.weightsFile??"model.safetensors",s);try{let l=await ro(n,i,u,{onProgress:a.onProgress??null,signal:a.signal});return new e({runtime:n,config:i,weights:l})}finally{await u.close?.()}}#e=[];#r=new WeakMap;#n=[];#a=new WeakMap;#t=[];createGenerationState(n={}){let r=n.maxLength??n.max_length??null;if(r===null){let t=this.#e.pop();if(t)return t.truncate(0),{cache:t}}return{cache:Un.allocate(this.rt,this.config,r)}}async _prepareDecodeProbe(n){let r=this.createGenerationState({}).cache;try{let t=r.get_seq_length(),a=await this.#o(r,n,t);return r.advance(n.length),t=r.get_seq_length(),{session:await this.#s(r,t),cache:r,positionOffset:t,firstToken:a,release:()=>this.#i(r)}}catch(t){throw this.#i(r),t}}#i(n){if(n.maxLength===Un.defaultCapacity(this.config)&&this.#e.length<2){this.#e.push(n);return}n.dispose()}async#s(n,r){let t=this.#r.get(n);return t||(t=new Gr(this,n),await t.build(r),this.#r.set(n,t),this.#n.push(t)),t}async#o(n,r,t){if(t+r.length<=n.maxLength){let u=this.#a.get(n);if(!u){u=new Map,this.#a.set(n,u);let p=256;for(let f of[32,128,256]){if(f>n.maxLength||f>p)continue;let m=new Or(this,n,f);await m.build(),u.set(f,m),this.#t.push(m)}}let l=0,c=t,d=0;for(;l<r.length;){let p=r.length-l,f=p>192&&u.has(256)?256:p>96&&u.has(128)?128:32,m=Math.min(p,f);if(c+f>n.maxLength||!u.has(f))return(await Ot(this,r.subarray(l),c,n)).nextToken;let _=0;d=await u.get(f).run(r.subarray(l,l+m),c),l+=m,c+=m}return d}return(await Ot(this,r,t,n)).nextToken}async*streamTokenIdsFromCache(n){let r=n.generation_state;if(!r?.cache)throw new Error("streamTokenIdsFromCache requires generation_state.cache");yield*this.#u(So(n.input_ids),r.cache,n)}async*streamTokenIds(n){let r=this.createGenerationState(n.generation_state??{});try{yield*this.#u(So(n.input_ids),r.cache,n)}finally{this.#i(r.cache)}}async*#u(n,r,t){let{maxNewTokens:a,eosTokenId:s,stopOnEos:o,onPrefillDone:i}=_o(t);if(n.length===0)throw new Error("streamTokenIds requires at least one input token");let u=r.get_seq_length(),l=0,c=await this.#o(r,n,u);l&&console.error(`[ttft] #prefill total ${(performance.now()-l).toFixed(2)}ms (tokens=${n.length})`),r.advance(n.length),u=r.get_seq_length(),i?.({tokens:n.length,cache_length:u});let d=c,p=0,f=null;try{if(vo>1){if(o&&Rr(d,s)||(yield d,p+=1,p>=a))return;let m=f=await this.#s(r,u),_=a-p,E=0;yield*wo({depth:vo,shouldSubmit:()=>E<_,submit:()=>{let b={result:m.submitStep(E===0?d:null,u+E)};return E+=1,b},accept:function*(b,W){return r.advance(1),o&&Rr(W,s)?!0:(yield W,p+=1,p>=a)}});return}for(;p<a&&!(o&&Rr(d,s)||(yield d,p+=1,p>=a));){f||(f=await this.#s(r,u));let m=await f.step(d,u);r.advance(1),u=r.get_seq_length(),d=m}}finally{f?.reportTiming()}}dispose(){for(let n of this.#n)n.dispose();for(let n of this.#t)n.dispose();for(let n of this.#e)n.dispose();this.#e.length=0,en(this.weights)}};var To="google/gemma-4-E2B-it-qat-mobile-transformers",xp="https://huggingface.co",kp=[1,106];function Ep(e,n="main"){let r=e??To;return/^https?:/i.test(r)||r.startsWith("/")||r.startsWith(".")?r:`${xp}/${r}/resolve/${n}`}var Mt=class e{static DEFAULT_MODEL_ID=To;#e;#r;#n;#a;#t;#i;#s;#o;#u=[];#l=!1;constructor(n){this.#e=n.runtime,this.#r=n.ownsRuntime,this.#n=n.model,this.#a=n.tokenizer,this.#t=n.chatTemplate,this.#i=n.tokenizerConfig,this.#s=n.eosTokenIds,this.#o=n.model.createGenerationState({})}static async load(n=null,r={}){let t=r.onProgress??(()=>{}),a=Ep(n,r.revision??"main"),s=r.fetch??(r.accessToken?Op(r.accessToken):void 0),o={cache:r.cache,force:r.force,cacheName:r.cacheName,fetch:s,signal:r.signal};t({status:"init",message:"Requesting WebGPU device"});let i=r.runtime??await vs(r.runtimeOptions??{}),u=!r.runtime;i.captureShaders=!0;try{t({status:"tokenizer",message:"Loading tokenizer"});let{tokenizer:l,chatTemplate:c,tokenizerConfig:d}=await Pp(a,o),p=await Ap(a,o);t({status:"weights",kind:"bytes",message:"Downloading weights",loaded:0,total:void 0});let f=await Wr.fromSnapshot(i,a,mn,{cache:r.cache,force:r.force,cacheName:r.cacheName,fetch:s,signal:r.signal,onProgress:m=>{let _=m;if(bn(_.processed)){t({status:"weights",kind:"tensors",loaded:_.processed,total:bn(_.total)?_.total:void 0,fraction:bn(_.total)&&_.total>0?_.processed/_.total:void 0,message:_.label});return}bn(_.loaded)&&t({status:"weights",kind:"bytes",loaded:_.loaded,total:bn(_.total)?_.total:null,fraction:bn(_.total)&&_.total>0?_.loaded/_.total:void 0,fromCache:_.fromCache,message:_.fromCache?"Loading cached weights":"Downloading weights"})}});return t({status:"ready",message:"Ready",fraction:1}),new e({runtime:i,ownsRuntime:u,model:f,tokenizer:l,chatTemplate:c,tokenizerConfig:d,eosTokenIds:p})}catch(l){throw u&&await i.destroy(),l}}get runtime(){return this.#e}encodePrompt(n){let r=this.#t.render({messages:n,tools:null,bos_token:this.#i.bos_token,eos_token:this.#i.eos_token,add_generation_prompt:!0});return this.#a.encode(r,{add_special_tokens:!1}).ids}async*generate(n,r={}){if(this.#l)throw new Error("Gemma4Mobile has been disposed");let t=r.maxNewTokens??512,a=r.eosTokenId??this.#s,s=this.encodePrompt(n),o=Gp(this.#u,s);o!==this.#u.length&&(this.#c(),o=0);let i=s.slice(o);i.length===0&&(this.#c(),i=s.slice());let u=[],l="",c=!1;try{for await(let d of this.#n.streamTokenIdsFromCache({input_ids:[i],generation_state:this.#o,max_new_tokens:t,eos_token_id:a,stop_on_eos:!0})){if(r.signal?.aborted){c=!0;break}u.push(d);let p=this.#a.decode(u,{skip_special_tokens:!0}),f=p.startsWith(l)?p.slice(l.length):this.#a.decode([d],{skip_special_tokens:!0});l=p,yield{token:d,delta:f,text:l}}}finally{if(c)this.#c();else{let d=u.length<t;this.#u=s.concat(d?u:u.slice(0,-1))}}}async complete(n,r={}){let t="";for await(let a of this.generate(n,r))t=a.text;return t}async warmup(){if(this.#l)return;let n=this.encodePrompt([{role:"user",content:"Hello"}]);for(let r of[6,8]){for await(let t of this.#n.streamTokenIdsFromCache({input_ids:[n],generation_state:this.#o,max_new_tokens:r,eos_token_id:this.#s,stop_on_eos:!1}));this.#c()}}deviceInfo(){let n=this.#e.device,r=n.adapterInfo,t=a=>{try{return n.features.has(a)}catch{return!1}};return{vendor:r.vendor??"",architecture:r.architecture??"",device:r.device??"",description:r.description??"",isFallbackAdapter:r.isFallbackAdapter===!0,subgroupMinSize:r.subgroupMinSize,subgroupMaxSize:r.subgroupMaxSize,features:{shaderF16:t("shader-f16"),subgroups:t("subgroups"),subgroupMatrix:t("chromium-experimental-subgroup-matrix"),timestampQuery:t("timestamp-query")}}}get _model(){return this.#n}get _generationState(){return this.#o}get _eosTokenIds(){return this.#s}get _disposed(){return this.#l}reset(){this.#c()}#c(){this.#o.cache.truncate(0),this.#u=[]}dispose(){this.#l||(this.#l=!0,this.#n.dispose(),this.#r&&this.#e.destroy())}};async function Pp(e,n){let r=await mn.readJsonResource(e,"tokenizer.json",n),t=await mn.readJsonResource(e,"tokenizer_config.json",n),a=new fa(r,t),s=typeof t.chat_template=="string"?t.chat_template:await mn.readTextResourceOptional(e,"chat_template.jinja",n);if(!s)throw new Error("Gemma4 tokenizer is missing a chat_template (tokenizer_config.json / chat_template.jinja)");return{tokenizer:a,chatTemplate:new Hn(s),tokenizerConfig:t}}async function Ap(e,n){let t=(await mn.readJsonResourceOptional(e,"generation_config.json",n))?.eos_token_id;return typeof t=="number"?[t]:Array.isArray(t)&&t.length>0?t:[...kp]}function Gp(e,n){let r=Math.min(e.length,n.length),t=0;for(;t<r&&e[t]===n[t];)t+=1;return t}function bn(e){return typeof e=="number"&&Number.isFinite(e)}function Op(e){return(n,r={})=>{let t=new Headers(r.headers);return t.set("Authorization",`Bearer ${e}`),globalThis.fetch(n,{...r,headers:t})}}var gy=Mt;export{To as DEFAULT_MODEL_ID,Mt as Gemma4Mobile,gy as default,Ep as resolveModelRoot};
