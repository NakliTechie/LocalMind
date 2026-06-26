// LFM2.5-350M (Q4_0 GGUF) WebGPU chat bundle. Import { Lfm2Mobile } from this file.
var Iu=Object.defineProperty;var re=(e,n)=>()=>(e&&(n=e(e=0)),n);var bt=(e,n)=>{for(var t in n)Iu(e,t,{get:n[t],enumerable:!0})};function ta(e){return/\w/.test(e)}function Gn(e){return/[0-9]/.test(e)}function ra(e){return/\s/.test(e)}function Hu(e,n={}){return e.endsWith(`
`)&&(e=e.slice(0,-1)),n.lstrip_blocks&&(e=e.replace(/^[ \t]*({[#%-])/gm,"$1")),n.trim_blocks&&(e=e.replace(/([#%-]})\n/g,"$1")),e.replace(/(\s*){%(-?)\s*(?:end)?generation\s*(-?)%}(\s*)/gs,(t,r,s,a,i)=>(s?"":r)+(a?"":i))}function vt(e,n={}){let t=[],r=Hu(e,n),s=0,a=0,i=l=>{let d="";for(;l(r[s]);){if(r[s]==="\\"){if(++s,s>=r.length)throw new SyntaxError("Unexpected end of input");let c=r[s++],p=Nu.get(c);if(p===void 0)throw new SyntaxError(`Unexpected escaped character: ${c}`);d+=p;continue}if(d+=r[s++],s>=r.length)throw new SyntaxError("Unexpected end of input")}return d},o=()=>{let l=t.at(-1);l&&l.type===y.Text&&(l.value=l.value.trimEnd(),l.value===""&&t.pop())},u=()=>{for(;s<r.length&&ra(r[s]);)++s};e:for(;s<r.length;){let l=t.at(-1)?.type;if(l===void 0||l===y.CloseStatement||l===y.CloseExpression||l===y.Comment){let c="";for(;s<r.length&&!(r[s]==="{"&&(r[s+1]==="%"||r[s+1]==="{"||r[s+1]==="#"));)c+=r[s++];if(c.length>0){t.push(new Oe(c,y.Text));continue}}if(r[s]==="{"&&r[s+1]==="#"){s+=2;let c=r[s]==="-";c&&++s;let p="";for(;r[s]!=="#"||r[s+1]!=="}";){if(s+2>=r.length)throw new SyntaxError("Missing end of comment tag");p+=r[s++]}let f=p.endsWith("-");f&&(p=p.slice(0,-1)),c&&o(),t.push(new Oe(p,y.Comment)),s+=2,f&&u();continue}if(r.slice(s,s+3)==="{%-"){o(),t.push(new Oe("{%",y.OpenStatement)),s+=3;continue}if(r.slice(s,s+3)==="{{-"){o(),t.push(new Oe("{{",y.OpenExpression)),a=0,s+=3;continue}if(i(ra),r.slice(s,s+3)==="-%}"){t.push(new Oe("%}",y.CloseStatement)),s+=3,u();continue}if(r.slice(s,s+3)==="-}}"){t.push(new Oe("}}",y.CloseExpression)),s+=3,u();continue}let d=r[s];if(d==="-"||d==="+"){let c=t.at(-1)?.type;if(c===y.Text||c===void 0)throw new SyntaxError(`Unexpected character: ${d}`);switch(c){case y.Identifier:case y.NumericLiteral:case y.StringLiteral:case y.CloseParen:case y.CloseSquareBracket:break;default:{++s;let p=i(Gn);t.push(new Oe(`${d}${p}`,p.length>0?y.NumericLiteral:y.UnaryOperator));continue}}}for(let[c,p]of Bu){if(c==="}}"&&a>0)continue;if(r.slice(s,s+c.length)===c){t.push(new Oe(c,p)),p===y.OpenExpression?a=0:p===y.OpenCurlyBracket?++a:p===y.CloseCurlyBracket&&--a,s+=c.length;continue e}}if(d==="'"||d==='"'){++s;let c=i(p=>p!==d);t.push(new Oe(c,y.StringLiteral)),++s;continue}if(Gn(d)){let c=i(Gn);if(t.at(-1)?.type!==y.Dot&&r[s]==="."&&Gn(r[s+1])){++s;let p=i(Gn);c=`${c}.${p}`}t.push(new Oe(c,y.NumericLiteral));continue}if(ta(d)){let c=i(ta);t.push(new Oe(c,y.Identifier));continue}throw new SyntaxError(`Unexpected character: ${d}`)}return t}function kt(e){let n=new Uu([]),t=0;function r(_,b){let v=e[t++];if(!v||v.type!==_)throw new Error(`Parser Error: ${b}. ${v.type} !== ${_}.`);return v}function s(_){if(!u(_))throw new SyntaxError(`Expected ${_}`);++t}function a(){switch(e[t].type){case y.Comment:return new Zu(e[t++].value);case y.Text:return l();case y.OpenStatement:return d();case y.OpenExpression:return c();default:throw new SyntaxError(`Unexpected token type: ${e[t].type}`)}}function i(..._){return t+_.length<=e.length&&_.every((b,v)=>b===e[t+v].type)}function o(..._){return e[t]?.type===y.OpenStatement&&e[t+1]?.type===y.Identifier&&_.includes(e[t+1]?.value)}function u(..._){return t+_.length<=e.length&&_.every((b,v)=>e[t+v].type==="Identifier"&&b===e[t+v].value)}function l(){return new aa(r(y.Text,"Expected text token").value)}function d(){if(r(y.OpenStatement,"Expected opening statement token"),e[t].type!==y.Identifier)throw new SyntaxError(`Unknown statement, got ${e[t].type}`);let _=e[t].value,b;switch(_){case"set":++t,b=p();break;case"if":++t,b=f(),r(y.OpenStatement,"Expected {% token"),s("endif"),r(y.CloseStatement,"Expected %} token");break;case"macro":++t,b=h(),r(y.OpenStatement,"Expected {% token"),s("endmacro"),r(y.CloseStatement,"Expected %} token");break;case"for":++t,b=g(),r(y.OpenStatement,"Expected {% token"),s("endfor"),r(y.CloseStatement,"Expected %} token");break;case"call":{++t;let v=null;i(y.OpenParen)&&(v=ae());let A=O();if(A.type!=="Identifier")throw new SyntaxError("Expected identifier following call statement");let me=ae();r(y.CloseStatement,"Expected closing statement token");let oe=[];for(;!o("endcall");)oe.push(a());r(y.OpenStatement,"Expected '{%'"),s("endcall"),r(y.CloseStatement,"Expected closing statement token");let gt=new sa(A,me);b=new dl(gt,v,oe);break}case"break":++t,r(y.CloseStatement,"Expected closing statement token"),b=new Vu;break;case"continue":++t,r(y.CloseStatement,"Expected closing statement token"),b=new $u;break;case"filter":{++t;let v=O();v instanceof qn&&i(y.OpenParen)&&(v=H(v)),r(y.CloseStatement,"Expected closing statement token");let A=[];for(;!o("endfilter");)A.push(a());r(y.OpenStatement,"Expected '{%'"),s("endfilter"),r(y.CloseStatement,"Expected '%}'"),b=new rl(v,A);break}default:throw new SyntaxError(`Unknown statement type: ${_}`)}return b}function c(){r(y.OpenExpression,"Expected opening expression token");let _=w();return r(y.CloseExpression,"Expected closing expression token"),_}function p(){let _=m(),b=null,v=[];if(i(y.Equals))++t,b=m();else{for(r(y.CloseStatement,"Expected %} token");!o("endset");)v.push(a());r(y.OpenStatement,"Expected {% token"),s("endset")}return r(y.CloseStatement,"Expected closing statement token"),new ju(_,b,v)}function f(){let _=w();r(y.CloseStatement,"Expected closing statement token");let b=[],v=[];for(;!o("elif","else","endif");)b.push(a());if(o("elif")){++t,++t;let A=f();v.push(A)}else if(o("else"))for(++t,++t,r(y.CloseStatement,"Expected closing statement token");!o("endif");)v.push(a());return new Fu(_,b,v)}function h(){let _=O();if(_.type!=="Identifier")throw new SyntaxError("Expected identifier following macro statement");let b=ae();r(y.CloseStatement,"Expected closing statement token");let v=[];for(;!o("endmacro");)v.push(a());return new Qu(_,b,v)}function m(_=!1){let b=_?O:w,v=[b()],A=i(y.Comma);for(;A&&(++t,v.push(b()),!!i(y.Comma)););return A?new ia(v):v[0]}function g(){let _=m(!0);if(!(_ instanceof qn||_ instanceof ia))throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${_.type} instead`);if(!u("in"))throw new SyntaxError("Expected `in` keyword following loop variable");++t;let b=w();r(y.CloseStatement,"Expected closing statement token");let v=[];for(;!o("endfor","else");)v.push(a());let A=[];if(o("else"))for(++t,++t,r(y.CloseStatement,"Expected closing statement token");!o("endfor");)A.push(a());return new Ku(_,b,v,A)}function w(){return T()}function T(){let _=x();if(u("if")){++t;let b=x();if(u("else")){++t;let v=T();return new cl(b,_,v)}else return new sl(_,b)}return _}function x(){let _=q();for(;u("or");){let b=e[t];++t;let v=q();_=new In(b,_,v)}return _}function q(){let _=k();for(;u("and");){let b=e[t];++t;let v=k();_=new In(b,_,v)}return _}function k(){let _;for(;u("not");){let b=e[t];++t;let v=k();_=new il(b,v)}return _??B()}function B(){let _=V();for(;;){let b;if(u("not","in"))b=new Oe("not in",y.Identifier),t+=2;else if(u("in"))b=e[t++];else if(i(y.ComparisonBinaryOperator))b=e[t++];else break;let v=V();_=new In(b,_,v)}return _}function V(){let _=I();for(;i(y.AdditiveBinaryOperator);){let b=e[t];++t;let v=I();_=new In(b,_,v)}return _}function S(){let _=fe(O());return i(y.OpenParen)?H(_):_}function H(_){let b=new sa(_,ae());return b=fe(b),i(y.OpenParen)&&(b=H(b)),b}function ae(){r(y.OpenParen,"Expected opening parenthesis for arguments list");let _=ie();return r(y.CloseParen,"Expected closing parenthesis for arguments list"),_}function ie(){let _=[];for(;!i(y.CloseParen);){let b;if(e[t].type===y.MultiplicativeBinaryOperator&&e[t].value==="*"){++t;let v=w();b=new ll(v)}else if(b=w(),i(y.Equals)){if(++t,!(b instanceof qn))throw new SyntaxError("Expected identifier for keyword argument");let v=w();b=new ul(b,v)}_.push(b),i(y.Comma)&&++t}return _}function U(){let _=[],b=!1;for(;!i(y.CloseSquareBracket);)i(y.Colon)?(_.push(void 0),++t,b=!0):(_.push(w()),i(y.Colon)&&(++t,b=!0));if(_.length===0)throw new SyntaxError("Expected at least one argument for member/slice expression");if(b){if(_.length>3)throw new SyntaxError("Expected 0-3 arguments for slice expression");return new ol(..._)}return _[0]}function fe(_){for(;i(y.Dot)||i(y.OpenSquareBracket);){let b=e[t];++t;let v,A=b.type===y.OpenSquareBracket;if(A)v=U(),r(y.CloseSquareBracket,"Expected closing square bracket");else if(v=O(),v.type!=="Identifier"&&v.type!=="IntegerLiteral")throw new SyntaxError("Expected identifier or integer following dot operator");_=new Yu(_,v,A)}return _}function I(){let _=te();for(;i(y.MultiplicativeBinaryOperator);){let b=e[t++],v=te();_=new In(b,_,v)}return _}function te(){let _=ye();for(;u("is");){++t;let b=u("not");b&&++t;let v=O();if(!(v instanceof qn))throw new SyntaxError("Expected identifier for the test");_=new al(_,b,v)}return _}function ye(){let _=S();for(;i(y.Pipe);){++t;let b=O();if(!(b instanceof qn))throw new SyntaxError("Expected identifier for the filter");i(y.OpenParen)&&(b=H(b)),_=new tl(_,b)}return _}function O(){let _=e[t++];switch(_.type){case y.NumericLiteral:{let b=_.value;return b.includes(".")?new Ju(Number(b)):new Xu(Number(b))}case y.StringLiteral:{let b=_.value;for(;i(y.StringLiteral);)b+=e[t++].value;return new aa(b)}case y.Identifier:return new qn(_.value);case y.OpenParen:{let b=m();return r(y.CloseParen,"Expected closing parenthesis, got ${tokens[current].type} instead."),b}case y.OpenSquareBracket:{let b=[];for(;!i(y.CloseSquareBracket);)b.push(w()),i(y.Comma)&&++t;return++t,new el(b)}case y.OpenCurlyBracket:{let b=new Map;for(;!i(y.CloseCurlyBracket);){let v=w();r(y.Colon,"Expected colon between key and value in object literal");let A=w();b.set(v,A),i(y.Comma)&&++t}return++t,new nl(b)}default:throw new SyntaxError(`Unexpected token: ${_.type}`)}}for(;t<e.length;)n.body.push(a());return n}function pl(e,n,t=1){if(n===void 0&&(n=e,e=0),t===0)throw new Error("range() step must not be zero");let r=[];if(t>0)for(let s=e;s<n;s+=t)r.push(s);else for(let s=e;s>n;s+=t)r.push(s);return r}function oa(e,n,t,r=1){let s=Math.sign(r);s>=0?(n=(n??=0)<0?Math.max(e.length+n,0):Math.min(n,e.length),t=(t??=e.length)<0?Math.max(e.length+t,0):Math.min(t,e.length)):(n=(n??=e.length-1)<0?Math.max(e.length+n,-1):Math.min(n,e.length-1),t=(t??=-1)<-1?Math.max(e.length+t,-1):Math.min(t,e.length-1));let a=[];for(let i=n;s*i<s*t;i+=r)a.push(e[i]);return a}function fl(e){return e.replace(/\b\w/g,n=>n.toUpperCase())}function ml(e){return hl(new Date,e)}function hl(e,n){let t=new Intl.DateTimeFormat(void 0,{month:"long"}),r=new Intl.DateTimeFormat(void 0,{month:"short"}),s=a=>a<10?"0"+a:a.toString();return n.replace(/%[YmdbBHM%]/g,a=>{switch(a){case"%Y":return e.getFullYear().toString();case"%m":return s(e.getMonth()+1);case"%d":return s(e.getDate());case"%b":return r.format(e);case"%B":return t.format(e);case"%H":return s(e.getHours());case"%M":return s(e.getMinutes());case"%%":return"%";default:return a}})}function gl(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function _l(e,n,t,r){if(r===0)return e;let s=r==null||r<0?1/0:r,a=n.length===0?new RegExp("(?=)","gu"):new RegExp(gl(n),"gu");return e.replaceAll(a,i=>s>0?(--s,t):i)}function da(e){return e.replace(bl,n=>"\\u"+n.charCodeAt(0).toString(16).padStart(4,"0"))}function mn(e,n={},t=0,r=!0){let{indent:s=null,ensureAscii:a=!1,separators:i=null,sortKeys:o=!1}=n,u,l;switch(i?[u,l]=i:s?(u=",",l=": "):(u=", ",l=": "),e.type){case"NullValue":return"null";case"UndefinedValue":return r?"null":"undefined";case"IntegerValue":case"FloatValue":case"BooleanValue":return JSON.stringify(e.value);case"StringValue":{let d=JSON.stringify(e.value);return a&&(d=da(d)),d}case"ArrayValue":case"ObjectValue":{let d=s?" ".repeat(s):"",c=`
`+d.repeat(t),p=c+d;if(e.type==="ArrayValue"){let f=e.value.map(h=>mn(h,n,t+1,r));return s?`[${p}${f.join(`${u}${p}`)}${c}]`:`[${f.join(u)}]`}else{let f=Array.from(e.value.entries());o&&(f=f.sort(([m],[g])=>m.localeCompare(g)));let h=f.map(([m,g])=>{let w=JSON.stringify(m);a&&(w=da(w));let T=`${w}${l}${mn(g,n,t+1,r)}`;return s?`${p}${T}`:T});return s?`{${h.join(u)}${c}}`:`{${h.join(u)}}`}}default:throw new Error(`Cannot convert to JSON: ${e.type}`)}}function wl(e){e.set("false",!1),e.set("true",!0),e.set("none",null),e.set("raise_exception",n=>{throw new Error(n)}),e.set("range",pl),e.set("strftime_now",ml),e.set("True",!0),e.set("False",!1),e.set("None",null)}function pa(e,n){let t=n.split("."),r=e;for(let s of t)if(r instanceof ce)r=r.value.get(s)??new $;else if(r instanceof R){let a=parseInt(s,10);if(!isNaN(a)&&a>=0&&a<r.value.length)r=r.value[a];else return new $}else return new $;return r}function Pr(e,n,t=!1){if(e instanceof Z&&n instanceof Z)return 0;if(e instanceof Z||n instanceof Z)throw new Error(`Cannot compare ${e.type} with ${n.type}`);if(e instanceof $&&n instanceof $)return 0;if(e instanceof $||n instanceof $)throw new Error(`Cannot compare ${e.type} with ${n.type}`);let r=a=>a instanceof P||a instanceof ee||a instanceof C,s=a=>a instanceof C?a.value?1:0:a.value;if(r(e)&&r(n)){let a=s(e),i=s(n);return a<i?-1:a>i?1:0}if(e.type!==n.type)throw new Error(`Cannot compare different types: ${e.type} and ${n.type}`);if(e.type==="StringValue"){let a=e.value,i=n.value;return t||(a=a.toLowerCase(),i=i.toLowerCase()),a<i?-1:a>i?1:0}else throw new Error(`Cannot compare type: ${e.type}`)}function wt(e){switch(typeof e){case"number":return Number.isInteger(e)?new P(e):new ee(e);case"string":return new E(e);case"boolean":return new C(e);case"undefined":return new $;case"object":return e===null?new Z:Array.isArray(e)?new R(e.map(wt)):new ce(new Map(Object.entries(e).map(([n,t])=>[n,wt(t)])));case"function":return new j((n,t)=>{let r=e(...n.map(s=>s.value))??null;return wt(r)});default:throw new Error(`Cannot convert to runtime value: ${e}`)}}function Sl(e){switch(e.operator.type){case"MultiplicativeBinaryOperator":return 4;case"AdditiveBinaryOperator":return 3;case"ComparisonBinaryOperator":return 2;case"Identifier":return e.operator.value==="and"?1:e.operator.value==="in"||e.operator.value==="not in"?2:0}return 0}function Tl(e,n="	"){let t=typeof n=="number"?" ".repeat(n):n;return Pe(e.body,0,t).replace(/\n$/,"")}function he(...e){return vl+e.join(" ")+kl}function Pe(e,n,t){return e.map(r=>xl(r,n,t)).join(le)}function xl(e,n,t){let r=t.repeat(n);switch(e.type){case"Program":return Pe(e.body,n,t);case"If":return Dl(e,n,t);case"For":return El(e,n,t);case"Set":return ql(e,n,t);case"Macro":return Ll(e,n,t);case"Break":return r+he("break");case"Continue":return r+he("continue");case"CallStatement":return Ol(e,n,t);case"FilterStatement":return Cl(e,n,t);case"Comment":return r+"{# "+e.value+" #}";default:return r+"{{- "+W(e)+" -}}"}}function Dl(e,n,t){let r=t.repeat(n),s=[],a=e;for(;a&&(s.push({test:a.test,body:a.body}),a.alternate.length===1&&a.alternate[0].type==="If");)a=a.alternate[0];let i=r+he("if",W(s[0].test))+le+Pe(s[0].body,n+1,t);for(let o=1;o<s.length;++o)i+=le+r+he("elif",W(s[o].test))+le+Pe(s[o].body,n+1,t);return a&&a.alternate.length>0&&(i+=le+r+he("else")+le+Pe(a.alternate,n+1,t)),i+=le+r+he("endif"),i}function El(e,n,t){let r=t.repeat(n),s="";if(e.iterable.type==="SelectExpression"){let i=e.iterable;s=`${W(i.lhs)} if ${W(i.test)}`}else s=W(e.iterable);let a=r+he("for",W(e.loopvar),"in",s)+le+Pe(e.body,n+1,t);return e.defaultBlock.length>0&&(a+=le+r+he("else")+le+Pe(e.defaultBlock,n+1,t)),a+=le+r+he("endfor"),a}function ql(e,n,t){let r=t.repeat(n),s=W(e.assignee),a=e.value?W(e.value):"",i=r+he("set",`${s}${e.value?" = "+a:""}`);return e.body.length===0?i:i+le+Pe(e.body,n+1,t)+le+r+he("endset")}function Ll(e,n,t){let r=t.repeat(n),s=e.args.map(W).join(", ");return r+he("macro",`${e.name.value}(${s})`)+le+Pe(e.body,n+1,t)+le+r+he("endmacro")}function Ol(e,n,t){let r=t.repeat(n),s=e.callerArgs&&e.callerArgs.length>0?`(${e.callerArgs.map(W).join(", ")})`:"",a=W(e.call),i=r+he(`call${s}`,a)+le;return i+=Pe(e.body,n+1,t)+le,i+=r+he("endcall"),i}function Cl(e,n,t){let r=t.repeat(n),s=e.filter.type==="Identifier"?e.filter.value:W(e.filter),a=r+he("filter",s)+le;return a+=Pe(e.body,n+1,t)+le,a+=r+he("endfilter"),a}function W(e,n=-1){switch(e.type){case"SpreadExpression":return`*${W(e.argument)}`;case"Identifier":return e.value;case"IntegerLiteral":return`${e.value}`;case"FloatLiteral":return`${e.value}`;case"StringLiteral":return JSON.stringify(e.value);case"BinaryExpression":{let t=e,r=Sl(t),s=W(t.left,r),a=W(t.right,r+1),i=`${s} ${t.operator.value} ${a}`;return r<n?`(${i})`:i}case"UnaryExpression":{let t=e;return t.operator.value+(t.operator.value==="not"?" ":"")+W(t.argument,1/0)}case"CallExpression":{let t=e,r=t.args.map(W).join(", ");return`${W(t.callee)}(${r})`}case"MemberExpression":{let t=e,r=W(t.object);["Identifier","MemberExpression","CallExpression","StringLiteral","IntegerLiteral","FloatLiteral","ArrayLiteral","TupleLiteral","ObjectLiteral"].includes(t.object.type)||(r=`(${r})`);let s=W(t.property);return!t.computed&&t.property.type!=="Identifier"&&t.property.type!=="IntegerLiteral"&&(s=`(${s})`),t.computed?`${r}[${s}]`:`${r}.${s}`}case"FilterExpression":{let t=e,r=W(t.operand,1/0);return t.filter.type==="CallExpression"?`${r} | ${W(t.filter)}`:`${r} | ${t.filter.value}`}case"SelectExpression":{let t=e;return`${W(t.lhs)} if ${W(t.test)}`}case"TestExpression":{let t=e;return`${W(t.operand)} is${t.negate?" not":""} ${t.test.value}`}case"ArrayLiteral":case"TupleLiteral":{let t=e.value.map(W),r=e.type==="ArrayLiteral"?"[]":"()";return`${r[0]}${t.join(", ")}${r[1]}`}case"ObjectLiteral":return`{${Array.from(e.value.entries()).map(([r,s])=>`${W(r)}: ${W(s)}`).join(", ")}}`;case"SliceExpression":{let t=e,r=t.start?W(t.start):"",s=t.stop?W(t.stop):"",a=t.step?`:${W(t.step)}`:"";return`${r}:${s}${a}`}case"KeywordArgumentExpression":{let t=e;return`${t.key.value}=${W(t.value)}`}case"Ternary":{let t=e,r=`${W(t.trueExpr)} if ${W(t.condition,0)} else ${W(t.falseExpr)}`;return n>-1?`(${r})`:r}default:throw new Error(`Unknown expression type: ${e.type}`)}}var Ru,Wu,Mu,y,Oe,Bu,Nu,ze,Uu,Fu,Ku,Vu,$u,ju,Qu,Zu,De,Yu,sa,qn,Ln,Xu,Ju,aa,el,ia,nl,In,tl,rl,sl,al,il,ol,ul,ll,dl,cl,ua,la,yl,Ne,P,ee,E,C,bl,ce,Rn,R,ca,j,Z,$,fa,Be,zr,le,vl,kl,St,Ar=re(()=>{Ru=Object.defineProperty,Wu=(e,n,t)=>n in e?Ru(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t,Mu=(e,n,t)=>(Wu(e,typeof n!="symbol"?n+"":n,t),t),y=Object.freeze({Text:"Text",NumericLiteral:"NumericLiteral",StringLiteral:"StringLiteral",Identifier:"Identifier",Equals:"Equals",OpenParen:"OpenParen",CloseParen:"CloseParen",OpenStatement:"OpenStatement",CloseStatement:"CloseStatement",OpenExpression:"OpenExpression",CloseExpression:"CloseExpression",OpenSquareBracket:"OpenSquareBracket",CloseSquareBracket:"CloseSquareBracket",OpenCurlyBracket:"OpenCurlyBracket",CloseCurlyBracket:"CloseCurlyBracket",Comma:"Comma",Dot:"Dot",Colon:"Colon",Pipe:"Pipe",CallOperator:"CallOperator",AdditiveBinaryOperator:"AdditiveBinaryOperator",MultiplicativeBinaryOperator:"MultiplicativeBinaryOperator",ComparisonBinaryOperator:"ComparisonBinaryOperator",UnaryOperator:"UnaryOperator",Comment:"Comment"}),Oe=class{constructor(e,n){this.value=e,this.type=n}};Bu=[["{%",y.OpenStatement],["%}",y.CloseStatement],["{{",y.OpenExpression],["}}",y.CloseExpression],["(",y.OpenParen],[")",y.CloseParen],["{",y.OpenCurlyBracket],["}",y.CloseCurlyBracket],["[",y.OpenSquareBracket],["]",y.CloseSquareBracket],[",",y.Comma],[".",y.Dot],[":",y.Colon],["|",y.Pipe],["<=",y.ComparisonBinaryOperator],[">=",y.ComparisonBinaryOperator],["==",y.ComparisonBinaryOperator],["!=",y.ComparisonBinaryOperator],["<",y.ComparisonBinaryOperator],[">",y.ComparisonBinaryOperator],["+",y.AdditiveBinaryOperator],["-",y.AdditiveBinaryOperator],["~",y.AdditiveBinaryOperator],["*",y.MultiplicativeBinaryOperator],["/",y.MultiplicativeBinaryOperator],["%",y.MultiplicativeBinaryOperator],["=",y.Equals]],Nu=new Map([["n",`
`],["t","	"],["r","\r"],["b","\b"],["f","\f"],["v","\v"],["'","'"],['"','"'],["\\","\\"]]);ze=class{type="Statement"},Uu=class extends ze{constructor(e){super(),this.body=e}type="Program"},Fu=class extends ze{constructor(e,n,t){super(),this.test=e,this.body=n,this.alternate=t}type="If"},Ku=class extends ze{constructor(e,n,t,r){super(),this.loopvar=e,this.iterable=n,this.body=t,this.defaultBlock=r}type="For"},Vu=class extends ze{type="Break"},$u=class extends ze{type="Continue"},ju=class extends ze{constructor(e,n,t){super(),this.assignee=e,this.value=n,this.body=t}type="Set"},Qu=class extends ze{constructor(e,n,t){super(),this.name=e,this.args=n,this.body=t}type="Macro"},Zu=class extends ze{constructor(e){super(),this.value=e}type="Comment"},De=class extends ze{type="Expression"},Yu=class extends De{constructor(e,n,t){super(),this.object=e,this.property=n,this.computed=t}type="MemberExpression"},sa=class extends De{constructor(e,n){super(),this.callee=e,this.args=n}type="CallExpression"},qn=class extends De{constructor(e){super(),this.value=e}type="Identifier"},Ln=class extends De{constructor(e){super(),this.value=e}type="Literal"},Xu=class extends Ln{type="IntegerLiteral"},Ju=class extends Ln{type="FloatLiteral"},aa=class extends Ln{type="StringLiteral"},el=class extends Ln{type="ArrayLiteral"},ia=class extends Ln{type="TupleLiteral"},nl=class extends Ln{type="ObjectLiteral"},In=class extends De{constructor(e,n,t){super(),this.operator=e,this.left=n,this.right=t}type="BinaryExpression"},tl=class extends De{constructor(e,n){super(),this.operand=e,this.filter=n}type="FilterExpression"},rl=class extends ze{constructor(e,n){super(),this.filter=e,this.body=n}type="FilterStatement"},sl=class extends De{constructor(e,n){super(),this.lhs=e,this.test=n}type="SelectExpression"},al=class extends De{constructor(e,n,t){super(),this.operand=e,this.negate=n,this.test=t}type="TestExpression"},il=class extends De{constructor(e,n){super(),this.operator=e,this.argument=n}type="UnaryExpression"},ol=class extends De{constructor(e=void 0,n=void 0,t=void 0){super(),this.start=e,this.stop=n,this.step=t}type="SliceExpression"},ul=class extends De{constructor(e,n){super(),this.key=e,this.value=n}type="KeywordArgumentExpression"},ll=class extends De{constructor(e){super(),this.argument=e}type="SpreadExpression"},dl=class extends ze{constructor(e,n,t){super(),this.call=e,this.callerArgs=n,this.body=t}type="CallStatement"},cl=class extends De{constructor(e,n,t){super(),this.condition=e,this.trueExpr=n,this.falseExpr=t}type="Ternary"};ua=class extends Error{},la=class extends Error{},yl=new Map,Ne=class{type="RuntimeValue";value;get builtins(){return yl}constructor(e=void 0){this.value=e}__bool__(){return new C(!!this.value)}toString(){return String(this.value)}},P=class extends Ne{type="IntegerValue"},ee=class extends Ne{type="FloatValue";toString(){return this.value%1===0?this.value.toFixed(1):this.value.toString()}},E=class extends Ne{type="StringValue";_builtins;get builtins(){return this._builtins??=new Map([["upper",new j(()=>new E(this.value.toUpperCase()))],["lower",new j(()=>new E(this.value.toLowerCase()))],["strip",new j(()=>new E(this.value.trim()))],["title",new j(()=>new E(fl(this.value)))],["capitalize",new j(()=>new E(this.value.charAt(0).toUpperCase()+this.value.slice(1)))],["length",new P(this.value.length)],["rstrip",new j(()=>new E(this.value.trimEnd()))],["lstrip",new j(()=>new E(this.value.trimStart()))],["startswith",new j(e=>{if(e.length===0)throw new Error("startswith() requires at least one argument");let n=e[0];if(n instanceof E)return new C(this.value.startsWith(n.value));if(n instanceof R){for(let t of n.value){if(!(t instanceof E))throw new Error("startswith() tuple elements must be strings");if(this.value.startsWith(t.value))return new C(!0)}return new C(!1)}throw new Error("startswith() argument must be a string or tuple of strings")})],["endswith",new j(e=>{if(e.length===0)throw new Error("endswith() requires at least one argument");let n=e[0];if(n instanceof E)return new C(this.value.endsWith(n.value));if(n instanceof R){for(let t of n.value){if(!(t instanceof E))throw new Error("endswith() tuple elements must be strings");if(this.value.endsWith(t.value))return new C(!0)}return new C(!1)}throw new Error("endswith() argument must be a string or tuple of strings")})],["split",new j(e=>{let n=e[0]??new Z;if(!(n instanceof E||n instanceof Z))throw new Error("sep argument must be a string or null");let t=e[1]??new P(-1);if(!(t instanceof P))throw new Error("maxsplit argument must be a number");let r=[];if(n instanceof Z){let s=this.value.trimStart();for(let{0:a,index:i}of s.matchAll(/\S+/g)){if(t.value!==-1&&r.length>=t.value&&i!==void 0){r.push(a+s.slice(i+a.length));break}r.push(a)}}else{if(n.value==="")throw new Error("empty separator");r=this.value.split(n.value),t.value!==-1&&r.length>t.value&&r.push(r.splice(t.value).join(n.value))}return new R(r.map(s=>new E(s)))})],["replace",new j(e=>{if(e.length<2)throw new Error("replace() requires at least two arguments");let n=e[0],t=e[1];if(!(n instanceof E&&t instanceof E))throw new Error("replace() arguments must be strings");let r;if(e.length>2?e[2].type==="KeywordArgumentsValue"?r=e[2].value.get("count")??new Z:r=e[2]:r=new Z,!(r instanceof P||r instanceof Z))throw new Error("replace() count argument must be a number or null");return new E(_l(this.value,n.value,t.value,r.value))})]])}},C=class extends Ne{type="BooleanValue"},bl=/[\x7f-\uffff]/g;ce=class extends Ne{type="ObjectValue";_builtins;__bool__(){return new C(this.value.size>0)}get builtins(){return this._builtins??=new Map([["get",new j(([e,n])=>{if(!(e instanceof E))throw new Error(`Object key must be a string: got ${e.type}`);return this.value.get(e.value)??n??new Z})],["items",new j(()=>this.items())],["keys",new j(()=>this.keys())],["values",new j(()=>this.values())],["dictsort",new j(e=>{let n=new Map,t=e.filter(o=>o instanceof Rn?(n=o.value,!1):!0),r=t.at(0)??n.get("case_sensitive")??new C(!1);if(!(r instanceof C))throw new Error("case_sensitive must be a boolean");let s=t.at(1)??n.get("by")??new E("key");if(!(s instanceof E))throw new Error("by must be a string");if(!["key","value"].includes(s.value))throw new Error("by must be either 'key' or 'value'");let a=t.at(2)??n.get("reverse")??new C(!1);if(!(a instanceof C))throw new Error("reverse must be a boolean");let i=Array.from(this.value.entries()).map(([o,u])=>new R([new E(o),u])).sort((o,u)=>{let l=s.value==="key"?0:1,d=o.value[l],c=u.value[l],p=Pr(d,c,r.value);return a.value?-p:p});return new R(i)})]])}items(){return new R(Array.from(this.value.entries()).map(([e,n])=>new R([new E(e),n])))}keys(){return new R(Array.from(this.value.keys()).map(e=>new E(e)))}values(){return new R(Array.from(this.value.values()))}toString(){return mn(this,{},0,!1)}},Rn=class extends ce{type="KeywordArgumentsValue"},R=class extends Ne{type="ArrayValue";_builtins;get builtins(){return this._builtins??=new Map([["length",new P(this.value.length)]])}__bool__(){return new C(this.value.length>0)}toString(){return mn(this,{},0,!1)}},ca=class extends R{type="TupleValue"},j=class extends Ne{type="FunctionValue"},Z=class extends Ne{type="NullValue"},$=class extends Ne{type="UndefinedValue"},fa=class{constructor(e){this.parent=e}variables=new Map([["namespace",new j(e=>{if(e.length===0)return new ce(new Map);if(e.length!==1||!(e[0]instanceof ce))throw new Error("`namespace` expects either zero arguments or a single object argument");return e[0]})]]);tests=fa.TESTS;set(e,n){return this.declareVariable(e,wt(n))}declareVariable(e,n){if(this.variables.has(e))throw new SyntaxError(`Variable already declared: ${e}`);return this.variables.set(e,n),n}setVariable(e,n){return this.variables.set(e,n),n}resolve(e){if(this.variables.has(e))return this;if(this.parent)return this.parent.resolve(e);throw new Error(`Unknown variable: ${e}`)}lookupVariable(e){try{return this.resolve(e).variables.get(e)??new $}catch{return new $}}},Be=fa;Mu(Be,"TESTS",new Map([["boolean",e=>e.type==="BooleanValue"],["callable",e=>e instanceof j],["odd",e=>{if(!(e instanceof P))throw new Error(`cannot odd on ${e.type}`);return e.value%2!==0}],["even",e=>{if(!(e instanceof P))throw new Error(`cannot even on ${e.type}`);return e.value%2===0}],["false",e=>e.type==="BooleanValue"&&!e.value],["true",e=>e.type==="BooleanValue"&&e.value],["none",e=>e.type==="NullValue"],["string",e=>e.type==="StringValue"],["number",e=>e instanceof P||e instanceof ee],["integer",e=>e instanceof P],["iterable",e=>e.type==="ArrayValue"||e.type==="StringValue"],["mapping",e=>e instanceof ce],["sequence",e=>e instanceof R||e instanceof ce||e instanceof E],["lower",e=>{let n=e.value;return e.type==="StringValue"&&n===n.toLowerCase()}],["upper",e=>{let n=e.value;return e.type==="StringValue"&&n===n.toUpperCase()}],["none",e=>e.type==="NullValue"],["defined",e=>e.type!=="UndefinedValue"],["undefined",e=>e.type==="UndefinedValue"],["equalto",(e,n)=>e.value===n.value],["eq",(e,n)=>e.value===n.value]]));zr=class{global;constructor(e){this.global=e??new Be}run(e){return this.evaluate(e,this.global)}evaluateBinaryExpression(e,n){let t=this.evaluate(e.left,n);switch(e.operator.value){case"and":return t.__bool__().value?this.evaluate(e.right,n):t;case"or":return t.__bool__().value?t:this.evaluate(e.right,n)}let r=this.evaluate(e.right,n);switch(e.operator.value){case"==":return new C(t.value==r.value);case"!=":return new C(t.value!=r.value)}if(t instanceof $||r instanceof $){if(r instanceof $&&["in","not in"].includes(e.operator.value))return new C(e.operator.value==="not in");throw new Error(`Cannot perform operation ${e.operator.value} on undefined values`)}else{if(t instanceof Z||r instanceof Z)throw new Error("Cannot perform operation on null values");if(e.operator.value==="~")return new E(t.value.toString()+r.value.toString());if((t instanceof P||t instanceof ee)&&(r instanceof P||r instanceof ee)){let s=t.value,a=r.value;switch(e.operator.value){case"+":case"-":case"*":{let i=e.operator.value==="+"?s+a:e.operator.value==="-"?s-a:s*a;return t instanceof ee||r instanceof ee?new ee(i):new P(i)}case"/":return new ee(s/a);case"%":{let i=s%a;return t instanceof ee||r instanceof ee?new ee(i):new P(i)}case"<":return new C(s<a);case">":return new C(s>a);case">=":return new C(s>=a);case"<=":return new C(s<=a)}}else if(t instanceof R&&r instanceof R){if(e.operator.value==="+")return new R(t.value.concat(r.value))}else if(r instanceof R){let s=r.value.find(a=>a.value===t.value)!==void 0;switch(e.operator.value){case"in":return new C(s);case"not in":return new C(!s)}}}if((t instanceof E||r instanceof E)&&e.operator.value==="+")return new E(t.value.toString()+r.value.toString());if(t instanceof E&&r instanceof E)switch(e.operator.value){case"in":return new C(r.value.includes(t.value));case"not in":return new C(!r.value.includes(t.value))}if(t instanceof E&&r instanceof ce)switch(e.operator.value){case"in":return new C(r.value.has(t.value));case"not in":return new C(!r.value.has(t.value))}throw new SyntaxError(`Unknown operator "${e.operator.value}" between ${t.type} and ${r.type}`)}evaluateArguments(e,n){let t=[],r=new Map;for(let s of e)if(s.type==="SpreadExpression"){let a=s,i=this.evaluate(a.argument,n);if(!(i instanceof R))throw new Error(`Cannot unpack non-iterable type: ${i.type}`);for(let o of i.value)t.push(o)}else if(s.type==="KeywordArgumentExpression"){let a=s;r.set(a.key.value,this.evaluate(a.value,n))}else{if(r.size>0)throw new Error("Positional arguments must come before keyword arguments");t.push(this.evaluate(s,n))}return[t,r]}applyFilter(e,n,t){if(n.type==="Identifier"){let r=n;if(r.value==="safe")return e;if(r.value==="tojson")return new E(mn(e,{}));if(e instanceof R)switch(r.value){case"list":return e;case"first":return e.value[0];case"last":return e.value[e.value.length-1];case"length":return new P(e.value.length);case"reverse":return new R(e.value.slice().reverse());case"sort":return new R(e.value.slice().sort((s,a)=>Pr(s,a,!1)));case"join":return new E(e.value.map(s=>s.value).join(""));case"string":return new E(mn(e,{},0,!1));case"unique":{let s=new Set,a=[];for(let i of e.value)s.has(i.value)||(s.add(i.value),a.push(i));return new R(a)}default:throw new Error(`Unknown ArrayValue filter: ${r.value}`)}else if(e instanceof E)switch(r.value){case"length":case"upper":case"lower":case"title":case"capitalize":{let s=e.builtins.get(r.value);if(s instanceof j)return s.value([],t);if(s instanceof P)return s;throw new Error(`Unknown StringValue filter: ${r.value}`)}case"trim":return new E(e.value.trim());case"indent":return new E(e.value.split(`
`).map((s,a)=>a===0||s.length===0?s:"    "+s).join(`
`));case"join":case"string":return e;case"int":{let s=parseInt(e.value,10);return new P(isNaN(s)?0:s)}case"float":{let s=parseFloat(e.value);return new ee(isNaN(s)?0:s)}default:throw new Error(`Unknown StringValue filter: ${r.value}`)}else if(e instanceof P||e instanceof ee)switch(r.value){case"abs":return e instanceof P?new P(Math.abs(e.value)):new ee(Math.abs(e.value));case"int":return new P(Math.floor(e.value));case"float":return new ee(e.value);case"string":return new E(e.toString());default:throw new Error(`Unknown NumericValue filter: ${r.value}`)}else if(e instanceof ce)switch(r.value){case"items":return new R(Array.from(e.value.entries()).map(([s,a])=>new R([new E(s),a])));case"length":return new P(e.value.size);default:{let s=e.builtins.get(r.value);if(s)return s instanceof j?s.value([],t):s;throw new Error(`Unknown ObjectValue filter: ${r.value}`)}}else if(e instanceof C)switch(r.value){case"bool":return new C(e.value);case"int":return new P(e.value?1:0);case"float":return new ee(e.value?1:0);case"string":return new E(e.value?"true":"false");default:throw new Error(`Unknown BooleanValue filter: ${r.value}`)}throw new Error(`Cannot apply filter "${r.value}" to type: ${e.type}`)}else if(n.type==="CallExpression"){let r=n;if(r.callee.type!=="Identifier")throw new Error(`Unknown filter: ${r.callee.type}`);let s=r.callee.value;if(s==="tojson"){let[,a]=this.evaluateArguments(r.args,t),i=a.get("indent")??new Z;if(!(i instanceof P||i instanceof Z))throw new Error("If set, indent must be a number");let o=a.get("ensure_ascii")??new C(!1);if(!(o instanceof C))throw new Error("If set, ensure_ascii must be a boolean");let u=a.get("sort_keys")??new C(!1);if(!(u instanceof C))throw new Error("If set, sort_keys must be a boolean");let l=a.get("separators")??new Z,d=null;if(l instanceof R||l instanceof ca){if(l.value.length!==2)throw new Error("separators must be a tuple of two strings");let[c,p]=l.value;if(!(c instanceof E)||!(p instanceof E))throw new Error("separators must be a tuple of two strings");d=[c.value,p.value]}else if(!(l instanceof Z))throw new Error("If set, separators must be a tuple of two strings");return new E(mn(e,{indent:i.value,ensureAscii:o.value,sortKeys:u.value,separators:d}))}else if(s==="join"){let a;if(e instanceof E)a=Array.from(e.value);else if(e instanceof R)a=e.value.map(l=>l.value);else throw new Error(`Cannot apply filter "${s}" to type: ${e.type}`);let[i,o]=this.evaluateArguments(r.args,t),u=i.at(0)??o.get("separator")??new E("");if(!(u instanceof E))throw new Error("separator must be a string");return new E(a.join(u.value))}else if(s==="int"||s==="float"){let[a,i]=this.evaluateArguments(r.args,t),o=a.at(0)??i.get("default")??(s==="int"?new P(0):new ee(0));if(e instanceof E){let u=s==="int"?parseInt(e.value,10):parseFloat(e.value);return isNaN(u)?o:s==="int"?new P(u):new ee(u)}else{if(e instanceof P||e instanceof ee)return e;if(e instanceof C)return s==="int"?new P(e.value?1:0):new ee(e.value?1:0);throw new Error(`Cannot apply filter "${s}" to type: ${e.type}`)}}else if(s==="default"){let[a,i]=this.evaluateArguments(r.args,t),o=a[0]??new E(""),u=a[1]??i.get("boolean")??new C(!1);if(!(u instanceof C))throw new Error("`default` filter flag must be a boolean");return e instanceof $||u.value&&!e.__bool__().value?o:e}if(e instanceof R){switch(s){case"sort":{let[a,i]=this.evaluateArguments(r.args,t),o=a.at(0)??i.get("reverse")??new C(!1);if(!(o instanceof C))throw new Error("reverse must be a boolean");let u=a.at(1)??i.get("case_sensitive")??new C(!1);if(!(u instanceof C))throw new Error("case_sensitive must be a boolean");let l=a.at(2)??i.get("attribute")??new Z;if(!(l instanceof E||l instanceof P||l instanceof Z))throw new Error("attribute must be a string, integer, or null");let d=c=>{if(l instanceof Z)return c;let p=l instanceof P?String(l.value):l.value;return pa(c,p)};return new R(e.value.slice().sort((c,p)=>{let f=d(c),h=d(p),m=Pr(f,h,u.value);return o.value?-m:m}))}case"selectattr":case"rejectattr":{let a=s==="selectattr";if(e.value.some(c=>!(c instanceof ce)))throw new Error(`\`${s}\` can only be applied to array of objects`);if(r.args.some(c=>c.type!=="StringLiteral"))throw new Error(`arguments of \`${s}\` must be strings`);let[i,o,u]=r.args.map(c=>this.evaluate(c,t)),l;if(o){let c=t.tests.get(o.value);if(!c)throw new Error(`Unknown test: ${o.value}`);l=c}else l=(...c)=>c[0].__bool__().value;let d=e.value.filter(c=>{let p=c.value.get(i.value),f=p?l(p,u):!1;return a?f:!f});return new R(d)}case"map":{let[,a]=this.evaluateArguments(r.args,t);if(a.has("attribute")){let i=a.get("attribute");if(!(i instanceof E))throw new Error("attribute must be a string");let o=a.get("default"),u=e.value.map(l=>{if(!(l instanceof ce))throw new Error("items in map must be an object");let d=pa(l,i.value);return d instanceof $?o??new $:d});return new R(u)}else throw new Error("`map` expressions without `attribute` set are not currently supported.")}}throw new Error(`Unknown ArrayValue filter: ${s}`)}else if(e instanceof E){switch(s){case"indent":{let[a,i]=this.evaluateArguments(r.args,t),o=a.at(0)??i.get("width")??new P(4);if(!(o instanceof P))throw new Error("width must be a number");let u=a.at(1)??i.get("first")??new C(!1),l=a.at(2)??i.get("blank")??new C(!1),d=e.value.split(`
`),c=" ".repeat(o.value),p=d.map((f,h)=>!u.value&&h===0||!l.value&&f.length===0?f:c+f);return new E(p.join(`
`))}case"replace":{let a=e.builtins.get("replace");if(!(a instanceof j))throw new Error("replace filter not available");let[i,o]=this.evaluateArguments(r.args,t);return a.value([...i,new Rn(o)],t)}}throw new Error(`Unknown StringValue filter: ${s}`)}else if(e instanceof ce){let a=e.builtins.get(s);if(a&&a instanceof j){let[i,o]=this.evaluateArguments(r.args,t);return o.size>0&&i.push(new Rn(o)),a.value(i,t)}throw new Error(`Unknown ObjectValue filter: ${s}`)}else throw new Error(`Cannot apply filter "${s}" to type: ${e.type}`)}throw new Error(`Unknown filter: ${n.type}`)}evaluateFilterExpression(e,n){let t=this.evaluate(e.operand,n);return this.applyFilter(t,e.filter,n)}evaluateTestExpression(e,n){let t=this.evaluate(e.operand,n),r=n.tests.get(e.test.value);if(!r)throw new Error(`Unknown test: ${e.test.value}`);let s=r(t);return new C(e.negate?!s:s)}evaluateSelectExpression(e,n){return this.evaluate(e.test,n).__bool__().value?this.evaluate(e.lhs,n):new $}evaluateUnaryExpression(e,n){let t=this.evaluate(e.argument,n);if(e.operator.value==="not")return new C(!t.value);throw new SyntaxError(`Unknown operator: ${e.operator.value}`)}evaluateTernaryExpression(e,n){return this.evaluate(e.condition,n).__bool__().value?this.evaluate(e.trueExpr,n):this.evaluate(e.falseExpr,n)}evalProgram(e,n){return this.evaluateBlock(e.body,n)}evaluateBlock(e,n){let t="";for(let r of e){let s=this.evaluate(r,n);s.type!=="NullValue"&&s.type!=="UndefinedValue"&&(t+=s.toString())}return new E(t)}evaluateIdentifier(e,n){return n.lookupVariable(e.value)}evaluateCallExpression(e,n){let[t,r]=this.evaluateArguments(e.args,n);r.size>0&&t.push(new Rn(r));let s=this.evaluate(e.callee,n);if(s.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${s.type}`);return s.value(t,n)}evaluateSliceExpression(e,n,t){if(!(e instanceof R||e instanceof E))throw new Error("Slice object must be an array or string");let r=this.evaluate(n.start,t),s=this.evaluate(n.stop,t),a=this.evaluate(n.step,t);if(!(r instanceof P||r instanceof $))throw new Error("Slice start must be numeric or undefined");if(!(s instanceof P||s instanceof $))throw new Error("Slice stop must be numeric or undefined");if(!(a instanceof P||a instanceof $))throw new Error("Slice step must be numeric or undefined");return e instanceof R?new R(oa(e.value,r.value,s.value,a.value)):new E(oa(Array.from(e.value),r.value,s.value,a.value).join(""))}evaluateMemberExpression(e,n){let t=this.evaluate(e.object,n),r;if(e.computed){if(e.property.type==="SliceExpression")return this.evaluateSliceExpression(t,e.property,n);r=this.evaluate(e.property,n)}else e.property.type==="IntegerLiteral"?r=new P(e.property.value):r=new E(e.property.value);let s;if(t instanceof ce){if(!(r instanceof E))throw new Error(`Cannot access property with non-string: got ${r.type}`);s=t.value.get(r.value)??t.builtins.get(r.value)}else if(t instanceof R||t instanceof E)if(r instanceof P)s=t.value.at(r.value),t instanceof E&&(s=new E(t.value.at(r.value)));else if(r instanceof E)s=t.builtins.get(r.value);else throw new Error(`Cannot access property with non-string/non-number: got ${r.type}`);else{if(!(r instanceof E))throw new Error(`Cannot access property with non-string: got ${r.type}`);s=t.builtins.get(r.value)}return s instanceof Ne?s:new $}evaluateSet(e,n){let t=e.value?this.evaluate(e.value,n):this.evaluateBlock(e.body,n);if(e.assignee.type==="Identifier"){let r=e.assignee.value;n.setVariable(r,t)}else if(e.assignee.type==="TupleLiteral"){let r=e.assignee;if(!(t instanceof R))throw new Error(`Cannot unpack non-iterable type in set: ${t.type}`);let s=t.value;if(s.length!==r.value.length)throw new Error(`Too ${r.value.length>s.length?"few":"many"} items to unpack in set`);for(let a=0;a<r.value.length;++a){let i=r.value[a];if(i.type!=="Identifier")throw new Error(`Cannot unpack to non-identifier in set: ${i.type}`);n.setVariable(i.value,s[a])}}else if(e.assignee.type==="MemberExpression"){let r=e.assignee,s=this.evaluate(r.object,n);if(!(s instanceof ce))throw new Error("Cannot assign to member of non-object");if(r.property.type!=="Identifier")throw new Error("Cannot assign to member with non-identifier property");s.value.set(r.property.value,t)}else throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(e.assignee)}`);return new Z}evaluateIf(e,n){let t=this.evaluate(e.test,n);return this.evaluateBlock(t.__bool__().value?e.body:e.alternate,n)}evaluateFor(e,n){let t=new Be(n),r,s;if(e.iterable.type==="SelectExpression"){let l=e.iterable;s=this.evaluate(l.lhs,t),r=l.test}else s=this.evaluate(e.iterable,t);if(!(s instanceof R||s instanceof ce))throw new Error(`Expected iterable or object type in for loop: got ${s.type}`);s instanceof ce&&(s=s.keys());let a=[],i=[];for(let l=0;l<s.value.length;++l){let d=new Be(t),c=s.value[l],p;if(e.loopvar.type==="Identifier")p=f=>f.setVariable(e.loopvar.value,c);else if(e.loopvar.type==="TupleLiteral"){let f=e.loopvar;if(c.type!=="ArrayValue")throw new Error(`Cannot unpack non-iterable type: ${c.type}`);let h=c;if(f.value.length!==h.value.length)throw new Error(`Too ${f.value.length>h.value.length?"few":"many"} items to unpack`);p=m=>{for(let g=0;g<f.value.length;++g){if(f.value[g].type!=="Identifier")throw new Error(`Cannot unpack non-identifier type: ${f.value[g].type}`);m.setVariable(f.value[g].value,h.value[g])}}}else throw new Error(`Invalid loop variable(s): ${e.loopvar.type}`);r&&(p(d),!this.evaluate(r,d).__bool__().value)||(a.push(c),i.push(p))}let o="",u=!0;for(let l=0;l<a.length;++l){let d=new Map([["index",new P(l+1)],["index0",new P(l)],["revindex",new P(a.length-l)],["revindex0",new P(a.length-l-1)],["first",new C(l===0)],["last",new C(l===a.length-1)],["length",new P(a.length)],["previtem",l>0?a[l-1]:new $],["nextitem",l<a.length-1?a[l+1]:new $]]);t.setVariable("loop",new ce(d)),i[l](t);try{let c=this.evaluateBlock(e.body,t);o+=c.value}catch(c){if(c instanceof la)continue;if(c instanceof ua)break;throw c}u=!1}if(u){let l=this.evaluateBlock(e.defaultBlock,t);o+=l.value}return new E(o)}evaluateMacro(e,n){return n.setVariable(e.name.value,new j((t,r)=>{let s=new Be(r);t=t.slice();let a;t.at(-1)?.type==="KeywordArgumentsValue"&&(a=t.pop());for(let i=0;i<e.args.length;++i){let o=e.args[i],u=t[i];if(o.type==="Identifier"){let l=o;if(!u)throw new Error(`Missing positional argument: ${l.value}`);s.setVariable(l.value,u)}else if(o.type==="KeywordArgumentExpression"){let l=o,d=u??a?.value.get(l.key.value)??this.evaluate(l.value,s);s.setVariable(l.key.value,d)}else throw new Error(`Unknown argument type: ${o.type}`)}return this.evaluateBlock(e.body,s)})),new Z}evaluateCallStatement(e,n){let t=new j((o,u)=>{let l=new Be(u);if(e.callerArgs)for(let d=0;d<e.callerArgs.length;++d){let c=e.callerArgs[d];if(c.type!=="Identifier")throw new Error(`Caller parameter must be an identifier, got ${c.type}`);l.setVariable(c.value,o[d]??new $)}return this.evaluateBlock(e.body,l)}),[r,s]=this.evaluateArguments(e.call.args,n);r.push(new Rn(s));let a=this.evaluate(e.call.callee,n);if(a.type!=="FunctionValue")throw new Error(`Cannot call something that is not a function: got ${a.type}`);let i=new Be(n);return i.setVariable("caller",t),a.value(r,i)}evaluateFilterStatement(e,n){let t=this.evaluateBlock(e.body,n);return this.applyFilter(t,e.filter,n)}evaluate(e,n){if(!e)return new $;switch(e.type){case"Program":return this.evalProgram(e,n);case"Set":return this.evaluateSet(e,n);case"If":return this.evaluateIf(e,n);case"For":return this.evaluateFor(e,n);case"Macro":return this.evaluateMacro(e,n);case"CallStatement":return this.evaluateCallStatement(e,n);case"Break":throw new ua;case"Continue":throw new la;case"IntegerLiteral":return new P(e.value);case"FloatLiteral":return new ee(e.value);case"StringLiteral":return new E(e.value);case"ArrayLiteral":return new R(e.value.map(t=>this.evaluate(t,n)));case"TupleLiteral":return new ca(e.value.map(t=>this.evaluate(t,n)));case"ObjectLiteral":{let t=new Map;for(let[r,s]of e.value){let a=this.evaluate(r,n);if(!(a instanceof E))throw new Error(`Object keys must be strings: got ${a.type}`);t.set(a.value,this.evaluate(s,n))}return new ce(t)}case"Identifier":return this.evaluateIdentifier(e,n);case"CallExpression":return this.evaluateCallExpression(e,n);case"MemberExpression":return this.evaluateMemberExpression(e,n);case"UnaryExpression":return this.evaluateUnaryExpression(e,n);case"BinaryExpression":return this.evaluateBinaryExpression(e,n);case"FilterExpression":return this.evaluateFilterExpression(e,n);case"FilterStatement":return this.evaluateFilterStatement(e,n);case"TestExpression":return this.evaluateTestExpression(e,n);case"SelectExpression":return this.evaluateSelectExpression(e,n);case"Ternary":return this.evaluateTernaryExpression(e,n);case"Comment":return new Z;default:throw new SyntaxError(`Unknown node type: ${e.type}`)}}};le=`
`,vl="{%- ",kl=" -%}";St=class{parsed;constructor(e){let n=vt(e,{lstrip_blocks:!0,trim_blocks:!0});this.parsed=kt(n)}render(e){let n=new Be;if(wl(n),e)for(let[s,a]of Object.entries(e))n.set(s,a);return new zr(n).run(this.parsed).value}format(e){return Tl(this.parsed,e?.indent||"	")}}});function Ee(e=null){if(e!==null&&typeof e=="object"&&Oa.has(e))return e;let n=Mr(e)?e:{},t=Mr(n.adapterInfo)?n.adapterInfo:{},r=Mr(n.limits)?n.limits:{},s={adapterInfo:Kc(t),features:qt(n.features),wgslLanguageFeatures:Lt(n.wgslLanguageFeatures),limits:Ot(r)};return Oa.add(s),s}function Ca(e){let n=new Set(e),t={size:n.size,has(r){return n.has(r)},entries(){return n.entries()},forEach(r,s){n.forEach(a=>r.call(s,a,a,t))},keys(){return n.keys()},values(){return n.values()},[Symbol.iterator](){return n[Symbol.iterator]()}};return t}function qt(e=[]){return Ca(za(e))}function Lt(e=[]){return Ca(za(e))}function tn(e=null){let n=Ee(e);return{adapterInfo:{...n.adapterInfo},features:Array.from(n.features.values()).sort(),wgslLanguageFeatures:Array.from(n.wgslLanguageFeatures.values()).sort(),limits:{...n.limits}}}function Br(e,n){if(!e)return null;for(let t of e.requiredFeatures??[])if(!n.features.has(t))return`requires device.features.has("${t}")`;for(let t of e.requiredWGSLLanguageFeatures??[])if(!n.wgslLanguageFeatures.has(t))return`requires device.wgslLanguageFeatures.has("${t}")`;for(let[t,r]of Object.entries(e.requiredLimits??{})){if(r===void 0)continue;let s=n.limits[t];if(typeof s!="number"||s<r)return`requires device.limits.${t} >= ${r}`}if(e.requiredSubgroupMinSize!==void 0){let t=n.adapterInfo.subgroupMinSize;if(typeof t!="number")return`requires adapterInfo.subgroupMinSize >= ${e.requiredSubgroupMinSize} (adapter does not report subgroup sizes)`;if(t<e.requiredSubgroupMinSize)return`requires adapterInfo.subgroupMinSize >= ${e.requiredSubgroupMinSize}`}return null}function Pa(e){let n=e.adapterInfo;return{vendor:typeof n.vendor=="string"?n.vendor.toLowerCase():"",architecture:typeof n.architecture=="string"?n.architecture.toLowerCase():"",...typeof n.subgroupMinSize=="number"?{subgroupMinSize:n.subgroupMinSize}:{},...typeof n.subgroupMaxSize=="number"?{subgroupMaxSize:n.subgroupMaxSize}:{},isFallbackAdapter:n.isFallbackAdapter===!0}}function Kc(e){return{...Hc,...e}}function Ot(e){let n={...Fc};for(let t of Uc){let r=Vc(e,t);r!==void 0&&(n[t]=r)}for(let[t,r]of Object.entries(e))typeof r=="number"&&Number.isFinite(r)&&(n[t]=r);return n}function za(e){return e==null?[]:Array.isArray(e)?e.filter(Wr):typeof e[Symbol.iterator]=="function"?Array.from(e).filter(Wr):typeof e.values=="function"?Array.from(e.values()).filter(Wr):[]}function Vc(e,n){let t=e[n];return typeof t=="number"&&Number.isFinite(t)?t:void 0}function Wr(e){return typeof e=="string"}function Mr(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}var Hc,Uc,Bn,Fc,Oa,Nn=re(()=>{"use strict";Hc=Object.freeze({vendor:"",architecture:"",device:"",description:""}),Uc=Object.freeze(["maxTextureDimension1D","maxTextureDimension2D","maxTextureDimension3D","maxTextureArrayLayers","maxBindGroups","maxBindGroupsPlusVertexBuffers","maxBindingsPerBindGroup","maxDynamicUniformBuffersPerPipelineLayout","maxDynamicStorageBuffersPerPipelineLayout","maxSampledTexturesPerShaderStage","maxSamplersPerShaderStage","maxStorageBuffersPerShaderStage","maxStorageTexturesPerShaderStage","maxUniformBuffersPerShaderStage","maxUniformBufferBindingSize","maxStorageBufferBindingSize","minUniformBufferOffsetAlignment","minStorageBufferOffsetAlignment","maxVertexBuffers","maxBufferSize","maxVertexAttributes","maxVertexBufferArrayStride","maxInterStageShaderVariables","maxColorAttachments","maxColorAttachmentBytesPerSample","maxComputeWorkgroupStorageSize","maxComputeInvocationsPerWorkgroup","maxComputeWorkgroupSizeX","maxComputeWorkgroupSizeY","maxComputeWorkgroupSizeZ","maxComputeWorkgroupsPerDimension","maxImmediateSize","maxStorageBuffersInVertexStage","maxStorageBuffersInFragmentStage","maxStorageTexturesInVertexStage","maxStorageTexturesInFragmentStage"]),Bn=Object.freeze(["shader-f16","subgroups","chromium-experimental-subgroup-matrix","timestamp-query","texture-formats-tier1","texture-formats-tier2"]),Fc=Object.freeze({maxTextureDimension1D:8192,maxTextureDimension2D:8192,maxTextureDimension3D:2048,maxTextureArrayLayers:256,maxBindGroups:4,maxBindGroupsPlusVertexBuffers:24,maxBindingsPerBindGroup:1e3,maxDynamicUniformBuffersPerPipelineLayout:8,maxDynamicStorageBuffersPerPipelineLayout:4,maxSampledTexturesPerShaderStage:16,maxSamplersPerShaderStage:16,maxStorageBuffersPerShaderStage:10,maxStorageTexturesPerShaderStage:4,maxUniformBuffersPerShaderStage:12,maxUniformBufferBindingSize:64*1024,maxStorageBufferBindingSize:128*1024*1024,minUniformBufferOffsetAlignment:256,minStorageBufferOffsetAlignment:256,maxVertexBuffers:8,maxBufferSize:256*1024*1024,maxVertexAttributes:16,maxVertexBufferArrayStride:2048,maxInterStageShaderVariables:16,maxColorAttachments:8,maxColorAttachmentBytesPerSample:32,maxComputeInvocationsPerWorkgroup:256,maxComputeWorkgroupSizeX:256,maxComputeWorkgroupSizeY:256,maxComputeWorkgroupSizeZ:64,maxComputeWorkgroupStorageSize:16*1024,maxComputeWorkgroupsPerDimension:65535,maxImmediateSize:64}),Oa=new WeakSet});function Aa(e){return Object.fromEntries(Object.entries(e).filter(([,n])=>n!==void 0))}var Ga=re(()=>{"use strict"});function Ra(e){if(e==="u32"||e==="i32"||e==="f32")return{align:4,size:4,scalar:e,components:1};let n=$c.exec(e);if(!n)throw new Error(`Unsupported uniform field type: ${e}`);let t=Number(n[1]);return{align:t===2?8:16,size:t===3?12:t*4,scalar:n[2],components:t}}function jc(e){return e==="u32"||e==="i32"||e==="f32"}function Ia(e,n){return Math.ceil(e/n)*n}function Nr(e,n={}){return Hn(e,"u32",n)}function Hr(e,n={}){return Hn(e,"i32",n)}function Ur(e,n={}){return Hn(e,"f32",n)}function Hn(e,n,t={}){return Na(e,"uniform field"),Ra(n),Object.freeze({kind:"uniform-field",name:e,type:n,semantic:t.semantic,required:t.required??!t.internal,internal:!!t.internal,default:t.default,description:t.description})}function Un(e,n,t={}){if(Na(e,"uniform struct"),!Array.isArray(n)||n.length===0)throw new Error(`uniform struct ${e} requires at least one field`);let r=n.map(s=>Yc(s,e));return Object.freeze({kind:"uniform-struct",name:e,fields:Object.freeze(Xc(r,t))})}function Fr(e){Kr(e);let n=e.fields.map(t=>`${t.name}: ${t.type}`).join(", ");return`struct ${e.name} { ${n} };`}function Wa(e,n={}){if(Kr(e),!e.fields.every(o=>jc(o.type)))return Qc(e,n);let t=Math.max(16,Math.ceil(e.fields.length*4/16)*16),r=new ArrayBuffer(t),s=new Uint32Array(r),a=new Int32Array(r),i=new Float32Array(r);return e.fields.forEach((o,u)=>{let l=n[o.name];if(l===void 0&&o.required)throw new Error(`Missing uniform field ${e.name}.${o.name}`);if(l===void 0&&(l=o.default??0),typeof l!="number")throw new Error(`Uniform ${e.name}.${o.name} expects a scalar number`);Jc({field:o,index:u,value:l,u32View:s,i32View:a,f32View:i})}),new Uint32Array(r)}function Qc(e,n){let t=[],r=0;for(let u of e.fields){let l=Ra(u.type);r=Ia(r,l.align),t.push({field:u,layout:l,offset:r}),r+=l.size}let s=new ArrayBuffer(Math.max(16,Ia(r,16))),a=new Uint32Array(s),i=new Int32Array(s),o=new Float32Array(s);for(let{field:u,layout:l,offset:d}of t){let c=n[u.name];if(c===void 0&&u.required)throw new Error(`Missing uniform field ${e.name}.${u.name}`);c===void 0&&(c=u.default??(l.components===1?0:new Array(l.components).fill(0)));let p=typeof c=="number"?[c]:c;if(p.length!==l.components)throw new Error(`Uniform ${e.name}.${u.name} expects ${l.components} component(s), got ${p.length}`);for(let f=0;f<l.components;++f)Zc(l.scalar,(d+f*4)/4,p[f],`${e.name}.${u.name}[${f}]`,a,i,o)}return new Uint32Array(s)}function Zc(e,n,t,r,s,a,i){if(e==="u32"){if(!Number.isInteger(t)||t<0||t>4294967295)throw new Error(`Uniform ${r} must be an integer u32 in [0, 4294967295]`);s[n]=t;return}if(e==="i32"){if(!Number.isInteger(t)||t<-2147483648||t>2147483647)throw new Error(`Uniform ${r} must be an integer i32 in [-2147483648, 2147483647]`);a[n]=t;return}if(!Number.isFinite(t))throw new Error(`Uniform ${r} must be a finite f32`);i[n]=t}function Ma(e,n,t,r){return e.createUniformU32(Wa(n,t),r)}function Ba(e){return Kr(e),{kind:e.kind,name:e.name,fields:e.fields.map(n=>Aa({name:n.name,type:n.type,required:n.required,internal:n.internal,semantic:n.semantic,default:n.default,description:n.description}))}}function Yc(e,n){if(!e||e.kind!=="uniform-field")throw new Error(`uniform struct ${n} fields must be created with u32(), i32(), or f32()`);return e}function Xc(e,n){let t=n.alignFieldsTo??4;if(!Number.isInteger(t)||t<=0)throw new Error(`alignFieldsTo must be a positive integer, got ${t}`);let r=[...e],s=r.length%t;if(s===0)return Object.freeze(r);let a=t-s,i=0,o=new Set(r.map(u=>u.name));for(let u=0;u<a;++u){for(;o.has(`_pad${i}`);)i++;let l=`_pad${i++}`;o.add(l),r.push(Hn(l,"u32",{internal:!0,required:!1,default:0}))}return Object.freeze(r)}function Jc({field:e,index:n,value:t,u32View:r,i32View:s,f32View:a}){if(e.type==="u32"){if(!Number.isInteger(t)||t<0||t>4294967295)throw new Error(`Uniform ${e.name} must be an integer u32 in [0, 4294967295]`);r[n]=t;return}if(e.type==="i32"){if(!Number.isInteger(t)||t<-2147483648||t>2147483647)throw new Error(`Uniform ${e.name} must be an integer i32 in [-2147483648, 2147483647]`);s[n]=t;return}if(e.type==="f32"){if(!Number.isFinite(t))throw new Error(`Uniform ${e.name} must be a finite f32`);a[n]=t;return}throw new Error(`Unsupported uniform field type: ${e.type}`)}function Kr(e){if(!e||e.kind!=="uniform-struct")throw new Error("Expected a uniform struct schema")}function Na(e,n){if(typeof e!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e))throw new Error(`${n} name must be a WGSL-compatible identifier, got ${e}`)}var $c,Ct=re(()=>{"use strict";Ga();$c=/^vec([234])<(u32|i32|f32)>$/});function Vr(e,n={}){Ka(e,"storage binding");let t=n.access??"read";if(!(t in Ha))throw new Error(`storage binding ${e} has unsupported access ${t}`);return Object.freeze({kind:"storage",name:e,arg:n.arg,access:t,elementType:n.elementType??"f32",semantic:n.semantic,role:n.role,binding:n.binding,group:n.group})}function $r(e,n,t={}){Ka(e,"uniform binding");let r;if(sp(n)?r=Un(t.structName??tp(e),n):r=n,!r||r.kind!=="uniform-struct")throw new Error(`uniform binding ${e} requires a uniformStruct schema or field array`);return Object.freeze({kind:"uniform",name:e,struct:r,semantic:t.semantic,binding:t.binding,group:t.group})}function On(e){if(!Array.isArray(e)||e.length===0)throw new Error("bindGroup requires at least one binding");let n=new Set,t=new Set;return Object.freeze(e.map((r,s)=>{if(!r||r.kind!=="storage"&&r.kind!=="uniform")throw new Error("bindGroup entries must be storage() or uniform() bindings");if(n.has(r.name))throw new Error(`duplicate bindGroup binding name: ${r.name}`);n.add(r.name);let a=r.binding??s;if(!Number.isInteger(a)||a<0)throw new Error(`binding ${r.name} has invalid binding index ${a}`);let i=r.group??0;if(!Number.isInteger(i)||i<0)throw new Error(`binding ${r.name} has invalid bind group index ${i}`);let o=`${i}:${a}`;if(t.has(o))throw new Error(`duplicate bindGroup binding index ${a} in @group(${i})`);return t.add(o),Object.freeze({...r,binding:a})}))}function jr(e,n={}){return On(e).map(t=>ep(t,n)).join(`
`)}function Ua(e){let n=[],t=new Map;for(let r of On(e)){if(r.kind!=="uniform")continue;let s=JSON.stringify(Ba(r.struct)),a=t.get(r.struct.name);if(a!==void 0){if(a!==s)throw new Error(`uniform struct ${r.struct.name} is declared with conflicting schemas`);continue}t.set(r.struct.name,s),n.push(Fr(r.struct))}return n.join(`
`)}function Fa(e,n,t,r={}){let s=On(n),a=r.labelPrefix??"kernel",i=[];return{bindings:s.map(u=>{let l=t?.[u.name];if(l==null)throw new Error(`Missing resource for binding ${u.name}`);if(u.kind==="uniform"){let f;return Qr(l)?f=l:(f=Ma(e,u.struct,l,`${a}-${u.name}`),typeof f.destroy=="function"&&i.push(()=>f.destroy?.())),{buffer:f,type:"uniform",binding:u.binding,...u.group?{group:u.group}:{}}}let d=l,c=typeof d.byteOffset=="number"?d.byteOffset:0,p=typeof d.byteLength=="number"?rp(d.byteLength):void 0;return{tensor:l,type:Ha[u.access],binding:u.binding,...u.group?{group:u.group}:{},...c?{offset:c}:{},...p!==void 0?{size:p}:{}}}),cleanup:()=>{for(let u of i)u()}}}function ep(e,n){let t=e.group??0;if(e.kind==="storage"){let r=e.access==="read_write"?"read_write":"read",s=np(e.elementType,n,`binding ${e.name} elementType`);return`@group(${t}) @binding(${e.binding}) var<storage, ${r}> ${e.name}: array<${s}>;`}return`@group(${t}) @binding(${e.binding}) var<uniform> ${e.name}: ${e.struct.name};`}function np(e,n,t){if(typeof e!="string"||!e.startsWith("$"))return e;let r=e.slice(1),s=n[r];if(s==null)throw new Error(`Missing template value ${r} for ${t}`);return s}function Qr(e){return e!==null&&typeof e=="object"&&typeof e.destroy=="function"&&!("shape"in e)}function tp(e){return e.length===0?e:e[0].toUpperCase()+e.slice(1)}function Ka(e,n){if(typeof e!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e))throw new Error(`${n} name must be a WGSL-compatible identifier, got ${e}`)}function rp(e){return Math.max(4,Math.ceil(e/4)*4)}function sp(e){return Array.isArray(e)}var Ha,Fn=re(()=>{"use strict";Ct();Ha=Object.freeze({read:"read-only-storage",read_write:"storage"})});function se(e){let n=Ie[e];if(!n)throw new Error(`Unsupported dtype: ${e}`);return n.storageByteSize}function Y(e){if(!Array.isArray(e))throw new Error("shape must be an array");let n=1;for(let t of e){if(!Number.isInteger(t)||t<0)throw new Error(`invalid shape dimension: ${t}`);n*=t}return n}function Ve(e){return e!==null&&typeof e=="object"&&typeof e.dtype=="string"&&Array.isArray(e.shape)&&typeof e.size=="number"&&typeof e.byteLength=="number"&&"buffer"in e&&"runtime"in e}function be(e,n){let t=Y([...n]);return{dtype:e,shape:[...n],size:t,byteLength:t*se(e),byteOffset:0,buffer:{destroy(){}},runtime:null,destroy(){}}}var Py,Ie,we=re(()=>{"use strict";Py=Object.freeze({float16:"float16",float32:"float32",int8:"int8",int16:"int16",int32:"int32",uint8:"uint8",uint32:"uint32",bool:"bool"}),Ie=Object.freeze({float16:{storageByteSize:2,onDiskByteSize:2,wgslScalar:"f16",arrayCtor:Uint16Array},float32:{storageByteSize:4,onDiskByteSize:4,wgslScalar:"f32",arrayCtor:Float32Array},int8:{storageByteSize:4,onDiskByteSize:1,wgslScalar:"i32",arrayCtor:Int32Array},int16:{storageByteSize:4,onDiskByteSize:2,wgslScalar:"i32",arrayCtor:Int32Array},int32:{storageByteSize:4,onDiskByteSize:4,wgslScalar:"i32",arrayCtor:Int32Array},uint8:{storageByteSize:4,onDiskByteSize:1,wgslScalar:"u32",arrayCtor:Uint32Array},uint32:{storageByteSize:4,onDiskByteSize:4,wgslScalar:"u32",arrayCtor:Uint32Array},bool:{storageByteSize:4,onDiskByteSize:1,wgslScalar:"u32",arrayCtor:Uint32Array}})});function Kn(e){return e==null?e:Array.isArray(e)?e.map(Kn):e instanceof Map?Object.fromEntries([...e].map(([n,t])=>[n,Kn(t)])):typeof e=="object"&&"value"in e?e.type==="NullValue"?null:Kn(e.value):e}function ne(e){return((...n)=>e(...n.map(Kn)))}function Vn(e){let n=Ie[hn(e)];if(!n)throw new Error(`Unsupported WebGPU dtype: ${e}`);return n.wgslScalar}function hn(e){return e==="f32"?"float32":e==="f16"?"float16":e==="u32"?"uint32":e==="i32"?"int32":e}function Ya(e={}){let n=e,t=Zr(e.device),r=t.features.has("shader-f16");return{...Za,f16Ok:ne(s=>s!=="f16"&&s!=="float16"||r),f16Allowed:ne(s=>s==="f32"||s==="float32"||(s==="f16"||s==="float16")&&r),op:e.op,variant:e.variant,pass:e.pass,device:t,attrs:e.attrs??{},args:e.args??{},source:e.sourceContext??{},present:e.present??{},shapes:e.shapes??{},ranks:e.ranks??{},tensorDtypes:e.tensorDtypes??{},dtypes:e.dtypes??{},...e.derived??{},tunables:e.tunables??{},constants:e.constants??{},...e.constants??{},...n.env!==void 0?{env:n.env}:{}}}function Zr(e){let n=Ee(e),t=$a.get(n);return t===void 0&&(t={features:n.features,wgslLanguageFeatures:n.wgslLanguageFeatures,limits:n.limits,adapterInfo:Pa(n)},$a.set(n,t)),t}function Ue(e,n={}){if(typeof e!="string")return e;let t=Ya(n),r=cp(e),s=r.freeIdentifiers.filter(i=>!(i in t));if(s.length>0)throw new Error(`Unknown identifier${s.length===1?"":"s"} ${s.map(i=>`"${i}"`).join(", ")} in WebGPU expression: ${e}
Identifiers resolve against the expression scope. Namespaces: args, attrs, shapes, ranks, dtypes, tensorDtypes, present, constants, tunables, source, device (plus the bare names declared in \`derive\`).
device sub-fields: features, wgslLanguageFeatures, limits, adapterInfo.
Helper functions: ${[...Object.keys(Za),...ap].join(", ")}.
If a string literal was intended, quote it (e.g. '"${s[0]}"' not '${s[0]}').`);if(r.statement===void 0)throw r.parseError??new Error(`Empty WebGPU expression: ${e}`);let a=new Be;for(let[i,o]of ip)a.set(i,o);for(let i of r.freeIdentifiers)a.set(i,t[i]);for(let i of r.probedIdentifiers)i in t&&a.set(i,t[i]);return Kn(new zr(a).evaluate(r.statement,a))}function Yr(e,n={}){return op(e,Ya(n))}function op(e,n){let t=Va.get(e);t||(t=new St(e),Va.set(e,t));let r=lp(e),s=r?up(n,r):n;return t.render(s)}function up(e,n){let t={};for(let r of Object.keys(e))n.has(r)&&(t[r]=e[r]);return t}function lp(e){let n=ja.get(e);if(n!==void 0)return n;let t;try{let r=kt(vt(e,Xa)),s=new Set,a=i=>{if(!i||typeof i!="object")return;if(Array.isArray(i)){for(let u of i)a(u);return}if(i instanceof Map){for(let[u,l]of i)a(u),a(l);return}let o=i;o.type==="Identifier"&&typeof o.value=="string"&&s.add(o.value);for(let u of Object.keys(o))u!=="type"&&a(o[u])};a(r),t=s}catch{t=null}return ja.set(e,t),t}function cp(e){let n=Qa.get(e);if(n!==void 0)return n;let t=new Set,r=new Set,s=o=>{if(!o||typeof o!="object")return;if(Array.isArray(o)){for(let l of o)s(l);return}if(o instanceof Map){for(let[l,d]of o)s(l),s(d);return}let u=o;switch(u.type){case"Identifier":dp.has(u.value)||t.add(u.value);return;case"MemberExpression":s(u.object),u.computed&&s(u.property);return;case"BinaryExpression":s(u.left),s(u.right);return;case"UnaryExpression":s(u.argument);return;case"FilterExpression":{s(u.operand);let l=u.filter;l?.type==="CallExpression"&&s(l.args);return}case"TestExpression":{let l=u.test,d=u.operand;(l?.value==="defined"||l?.value==="undefined")&&d?.type==="Identifier"?r.add(d.value):s(u.operand);return}case"CallExpression":s(u.callee),s(u.args);return;case"KeywordArgumentExpression":s(u.value);return;default:{for(let[l,d]of Object.entries(u))l!=="type"&&s(d);return}}},a,i;try{let o=kt(vt(`{{ ${e} }}`,Xa));a=o.body[0],s(o)}catch(o){i=o}for(let o of t)r.delete(o);return n=Object.freeze({statement:a,...i!==void 0?{parseError:i}:{},freeIdentifiers:Object.freeze([...t]),probedIdentifiers:Object.freeze([...r])}),Qa.set(e,n),n}function gn(e,n){let t={};for(let[r,s]of Object.entries(e??{}))t[r]=$e(s,n);return t}function $e(e,n){return typeof e=="string"?Ue(e,n):Array.isArray(e)?e.map(t=>$e(t,n)):e&&typeof e=="object"?Object.fromEntries(Object.entries(e).map(([t,r])=>[t,$e(r,n)])):e}var Va,Za,ap,$a,ip,ja,Qa,Xa,dp,$n=re(()=>{"use strict";Ar();Nn();we();Va=new Map;Za=Object.freeze({ceil:ne(e=>Math.ceil(e)),floor:ne(e=>Math.floor(e)),min:ne((...e)=>Math.min(...e)),max:ne((...e)=>Math.max(...e)),pow:ne((e,n)=>Math.pow(e,n)),ceilDiv:ne((e,n)=>Math.ceil(e/n)),pow2ceil:ne(e=>e<=1?1:2**Math.ceil(Math.log2(e))),numel:ne(e=>e.reduce((n,t)=>n*t,1)),rank:ne(e=>e.length),dim:ne((e,n)=>{let t=(n%e.length+e.length)%e.length;return e[t]}),rows:ne((e,n)=>{let t=(n%e.length+e.length)%e.length;return e.reduce((r,s,a)=>a===t?r:r*s,1)}),cols:ne((e,n)=>{let t=(n%e.length+e.length)%e.length;return e[t]}),outer:ne((e,n)=>{let t=(n%e.length+e.length)%e.length;return e.slice(0,t).reduce((r,s)=>r*s,1)}),inner:ne((e,n)=>{let t=(n%e.length+e.length)%e.length;return e.slice(t+1).reduce((r,s)=>r*s,1)}),broadcastable:ne((e,n)=>{if(e.length>n.length)return!1;let t=n.length-e.length;return e.every((r,s)=>r===1||r===n[s+t])}),sameShape:ne((e,n)=>e.length===n.length&&e.every((t,r)=>t===n[r])),hasAxis:ne((e,n,t)=>{let r=(n%t+t)%t;return e.some(s=>(s%t+t)%t===r)}),has:ne((e,n)=>e instanceof Map?e.has(n):!!(e&&Object.prototype.hasOwnProperty.call(e,n))),dtypeBytes:ne(e=>{let n=Ie[hn(e)];if(!n)throw new Error(`Unsupported dtype for dtypeBytes(): ${e}`);return n.storageByteSize}),pick:ne((e,n)=>{if(!Array.isArray(e))throw new Error("pick() expects a list of [condition, value] pairs as its first argument");for(let t of e){if(!Array.isArray(t)||t.length<2)throw new Error("pick() entries must be [condition, value] pairs");if(t[0])return t[1]}return n})});ap=["f16Ok","f16Allowed"];$a=new WeakMap;ip=[["true",!0],["false",!1],["none",null],["True",!0],["False",!1],["None",null]];ja=new Map;Qa=new Map,Xa=Object.freeze({lstrip_blocks:!0,trim_blocks:!0}),dp=new Set(["true","false","none","True","False","None"])});function Xr(e,n){let t=[];for(let r of e.split(`
`)){let s=pp.exec(r);if(s)for(let a of s[1].split(",")){let i=a.trim();if(i.length===0)continue;let o=Ja[i];o&&!n.has(o)&&t.push(`enable ${i}; (requires device feature "${o}")`)}}return t}var Ja,pp,Jr=re(()=>{"use strict";Ja=Object.freeze({f16:"shader-f16",subgroups:"subgroups",chromium_experimental_subgroup_matrix:"chromium-experimental-subgroup-matrix"}),pp=/^\s*enable\s+([^;]+);/});function _n(e){let n=e instanceof Map?new Map(e):new Map(Object.entries(e));return Object.freeze({readText(t){let r=n.get(t);if(r===void 0)throw new Error(`WebGPU template asset is missing: ${t}`);return r},has(t){return n.has(t)}})}function es(e){At(e,"WebGPU manifest");let n=e.schemaVersion??1;if(n!==1)throw new Error(`Unsupported WebGPU manifest schemaVersion: ${n}`);let t=e.domain??"ai.onnx";Ep(t,"WebGPU manifest domain");let r=e.name;if(typeof r!="string"||r.length===0)throw new Error("WebGPU manifest requires a non-empty name");if(!Array.isArray(e.inputs))throw new Error(`WebGPU manifest ${t}.${r} requires inputs`);if(!Array.isArray(e.outputs))throw new Error(`WebGPU manifest ${t}.${r} requires outputs`);if(!ns(e.args)||Object.keys(e.args).length===0)throw new Error(`WebGPU manifest ${t}.${r} requires explicit args`);Dp(e.args,`${t}.${r}.args`);let s=hp(e,`${t}.${r}`),a=gp(e,s);return Object.freeze({schemaVersion:1,domain:t,name:r,id:`${t}.${r}`,sinceVersion:e.sinceVersion,inputs:Object.freeze([...e.inputs]),outputs:Object.freeze([...e.outputs]),args:Object.freeze({...e.args}),attributes:Object.freeze({...e.attributes??{}}),derive:Object.freeze({...e.derive??{}}),typeConstraints:Object.freeze({...e.typeConstraints??{}}),tunables:Object.freeze({...e.tunables??{}}),staticShapes:Object.freeze([...e.staticShapes??[]]),variants:Object.freeze(a)})}function ei(e){return e.map(n=>{if(n.buffer.type==="uniform"){if(!n.struct)throw new Error(`WebGPU uniform binding ${n.name} requires struct`);return $r(n.name,Un(n.struct.name,n.struct.fields.map(xp)),{semantic:n.semantic,binding:n.binding,group:n.group})}return Vr(n.name,{arg:n.arg,access:n.buffer.type==="storage"?"read_write":"read",elementType:n.elementType,semantic:n.semantic??n.role,role:n.role,binding:n.binding,group:n.group})})}function hp(e,n){let t=new Map;for(let[r,s]of Object.entries(e.bindingSets??{})){if(!Array.isArray(s)||s.length===0)throw new Error(`WebGPU manifest ${n} bindingSet "${r}" must be a non-empty binding array`);t.set(r,s)}return t}function ni(e,n,t){if(Array.isArray(e))return e;if(typeof e=="string"){let r=n.get(e);if(!r)throw new Error(`WebGPU ${t} references unknown bindingSet "${e}"`);return r}throw new Error(`WebGPU ${t} bindings must be an array or a bindingSet name`)}function gp(e,n){let t=`${e.domain??"ai.onnx"}.${e.name}`,r=mp.filter(a=>e[a]!==void 0);if(r.length>0)throw new Error(`WebGPU manifest ${t} uses the retired flattened dialect: top-level ${r.join(", ")} is no longer accepted. Declare ${r.length===1?"it":"them"} on variants[].passes[] instead (docs/kernel-authoring-framework.md \xA74).`);let s=zt(e,t);if(s.length===0)throw new Error(`WebGPU manifest ${t} requires a non-empty variants list`);return s.map((a,i)=>yp(a,i,n))}function zt(e,n){let t=[...e.variants??[]];for(let r of e.variantFamilies??[]){let s=Object.keys(r.axes??{});if(s.length===0)throw new Error(`WebGPU manifest ${n}: a variantFamily requires at least one axis`);if(!Array.isArray(r.variants)||r.variants.length===0)throw new Error(`WebGPU manifest ${n}: a variantFamily requires at least one base variant`);for(let a of s){let i=r.axes[a];if(!Array.isArray(i)||i.length===0)throw new Error(`WebGPU manifest ${n}: variantFamily axis "${a}" must be a non-empty array`)}for(let a of _p(s,r.axes))for(let i of r.variants)t.push(Pt(i,a))}return t}function _p(e,n){let t=[{}];for(let r of e)t=t.flatMap(s=>n[r].map(a=>({...s,[r]:a})));return t}function Pt(e,n){if(typeof e=="string")return e.replace(/\{([A-Za-z_]\w*)\}/g,(t,r)=>r in n?String(n[r]):t);if(Array.isArray(e))return e.map(t=>Pt(t,n));if(e!==null&&typeof e=="object"){let t={};for(let[r,s]of Object.entries(e))t[Pt(r,n)]=Pt(s,n);return t}return e}function yp(e,n,t){At(e,"WebGPU variant");let r=e.id??e.name??`variant_${n}`;if(!/^[A-Za-z0-9][A-Za-z0-9_]*$/.test(r))throw new Error(`WebGPU variant id must be stable, got ${r}`);let s=e.passes;if(!Array.isArray(s)||s.length===0)throw new Error(`WebGPU variant ${r} requires passes`);let a=e.bindings!==void 0?ni(e.bindings,t,`variant ${r}`):void 0,i=e.version??1;if(!Number.isInteger(i)||i<1)throw new Error(`WebGPU variant ${r} version must be an integer >= 1`);return Object.freeze({id:r,name:e.name??r,version:i,default:!!e.default,priority:e.priority??0,when:Sp(e.when,r),selectAbove:typeof e.selectAbove=="string"&&e.selectAbove.length>0?e.selectAbove:null,requires:Tp(e),tunables:Object.freeze({...e.tunables??{}}),derive:Object.freeze({...e.derive??{}}),constants:Object.freeze({...e.constants??{}}),intermediates:Object.freeze([...e.intermediates??[]]),passes:Object.freeze(s.map((o,u)=>bp(o,a,u,t)))})}function bp(e,n,t,r){let s=vp(e,t);if(!e.dispatch)throw new Error(`WebGPU pass ${e.id??t} requires dispatch`);let a=e.bindings!==void 0?ni(e.bindings,r,`pass ${e.id??t}`):n;if(!Array.isArray(a)||a.length===0)throw new Error(`WebGPU pass ${e.id??t} requires bindings`);return Object.freeze({id:e.id??`pass_${t}`,...e.name?{name:e.name}:{},source:s,entryPoint:e.entryPoint??"main",bindings:Object.freeze(a.map(kp)),constants:Object.freeze({...e.constants??{}}),uniforms:Object.freeze({...e.uniforms??{}}),dispatch:e.dispatch,profile:Object.freeze({...e.profile??{}}),...e.viewAlias?{viewAlias:wp(e.viewAlias,a,`pass ${e.id??t}`)}:{},reads:Object.freeze([...e.reads??[]]),writes:Object.freeze([...e.writes??[]])})}function wp(e,n,t){if(!Array.isArray(e)||e.length===0)throw new Error(`WebGPU ${t} viewAlias must be a non-empty array of { input, output } binding-name pairs`);let r=a=>n.find(i=>i.name===a)?.buffer.type,s=e.map(a=>{if(typeof a?.input!="string"||typeof a?.output!="string")throw new Error(`WebGPU ${t} viewAlias pair must be { "input": <binding>, "output": <binding> }`);if(r(a.input)!=="read-only-storage")throw new Error(`WebGPU ${t} viewAlias.input "${a.input}" must name a read-only-storage binding of the pass`);if(r(a.output)!=="storage")throw new Error(`WebGPU ${t} viewAlias.output "${a.output}" must name a storage (read_write) binding of the pass`);return Object.freeze({input:a.input,output:a.output})});return Object.freeze(s)}function vp(e,n){let t=`WebGPU pass ${e.id??n}`,r=e.source;if(r!==void 0){if(At(r,`${t}.source`),r.kind==="template"){let s=r.shader??e.shader;if(typeof s!="string"||s.length===0)throw new Error(`${t} template source requires shader`);if(e.shader!==void 0&&e.shader!==s)throw new Error(`${t} has conflicting shader and source.shader`);if(r.version!==void 0&&typeof r.version!="string"&&typeof r.version!="number")throw new Error(`${t} template source version must be a string or number`);if(r.inputs!==void 0&&!ns(r.inputs))throw new Error(`${t} template source inputs must be an object`);return Object.freeze({kind:"template",shader:s,...r.version!==void 0?{version:r.version}:{},inputs:Object.freeze({...r.inputs??{}})})}throw new Error(`${t} source has unsupported kind ${r.kind}`)}if(typeof e.shader!="string"||e.shader.length===0)throw new Error(`${t} requires shader or source`);return Object.freeze({kind:"template",shader:e.shader,inputs:Object.freeze({})})}function kp(e,n){if(At(e,`WebGPU binding ${n}`),e.optional===!0)throw new Error(`WebGPU binding ${e.name??e.role??n} cannot be optional; use a separate variant`);let t=e.buffer?.type;if(!t||!fp.has(t))throw new Error(`WebGPU binding ${e.name??e.role??n} has invalid buffer type`);let r=e.name??e.role??e.semantic;if(typeof r!="string"||!/^[A-Za-z_][A-Za-z0-9_]*$/.test(r))throw new Error(`WebGPU binding requires a WGSL-compatible name, got ${String(r)}`);let s=Object.freeze({name:r,...e.role!==void 0?{role:e.role}:{},...e.semantic!==void 0?{semantic:e.semantic}:{},...e.arg!==void 0?{arg:e.arg}:{},buffer:{type:t},...e.elementType?{elementType:e.elementType}:{},...e.struct?{struct:e.struct}:{},...e.binding!==void 0?{binding:e.binding}:{},...e.group!==void 0?{group:e.group}:{}});if(t==="uniform"&&!s.struct)throw new Error(`WebGPU uniform binding ${r} requires struct`);if(t!=="uniform"&&!s.elementType)throw new Error(`WebGPU storage binding ${r} requires elementType`);return s}function Sp(e,n){if(e===void 0)return!0;if(Array.isArray(e)){if(e.length===0)throw new Error(`WebGPU variant ${n} when[] must be a non-empty list of predicates`);for(let t of e)if(typeof t!="string"||t.length===0)throw new Error(`WebGPU variant ${n} when[] entries must be non-empty expression strings, got ${JSON.stringify(t)}`);return Object.freeze([...e])}if(typeof e!="string"&&typeof e!="boolean")throw new Error(`WebGPU variant ${n} when must be a string, boolean, or string[], got ${JSON.stringify(e)}`);return e}function Tp(e){let n={...e.requiredFeatures?{requiredFeatures:e.requiredFeatures}:{},...e.requiredLimits?{requiredLimits:e.requiredLimits}:{},...e.requiredWGSLLanguageFeatures?{requiredWGSLLanguageFeatures:e.requiredWGSLLanguageFeatures}:{},...e.requiredSubgroupMinSize!==void 0?{requiredSubgroupMinSize:e.requiredSubgroupMinSize}:{}};if(n.requiredSubgroupMinSize!==void 0&&(!Number.isInteger(n.requiredSubgroupMinSize)||n.requiredSubgroupMinSize<1))throw new Error(`WebGPU variant ${e.id??e.name??"?"} requiredSubgroupMinSize must be a positive integer`);return Object.keys(n).length===0?null:n}function xp(e){if(e.type==="u32")return Nr(e.name,e);if(e.type==="i32")return Hr(e.name,e);if(e.type==="f32")return Ur(e.name,e);throw new Error(`Unsupported WebGPU uniform field type: ${e.type}`)}function Dp(e,n){for(let[t,r]of Object.entries(e)){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(t))throw new Error(`${n}.${t} is not a valid arg name`);if(!["tensor","u32","i32","f32","bool","string"].includes(r.kind))throw new Error(`${n}.${t} has unsupported kind ${String(r.kind)}`)}}function Ep(e,n){if(!/^[a-z][a-z0-9]*(?:\.[A-Za-z][A-Za-z0-9_]*)*$/.test(e))throw new Error(`${n} must be a dotted canonical domain, got ${e}`)}function At(e,n){if(!ns(e))throw new Error(`${n} must be an object`)}function ns(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)}var fp,mp,Gt=re(()=>{"use strict";Fn();Ct();fp=new Set(["read-only-storage","storage","uniform"]);mp=["shader","entryPoint","bindings","constants","uniforms","profile","dispatch"]});function ts(e){return{attrs:e.attrs,dtypes:e.dtypes,tensorDtypes:e.tensorDtypes,ranks:e.ranks,tunables:e.tunables}}function ti(e,n,t,r=null){return rn({op:e.id,sinceVersion:e.sinceVersion,variant:n.id,variantVersion:n.version,...ts(t),staticShapes:Lp(t,e.staticShapes),specialization:r,device:tn(t.device),bindings:n.passes.map(s=>s.bindings.map(a=>({name:a.name,binding:a.binding,group:a.group,type:a.buffer.type,elementType:a.elementType,struct:qp(a.struct)})))})}function qp(e){return e&&{name:e.name,fields:e.fields.map(n=>({name:n.name,type:n.type}))}}function ri(e){return rn({shapes:e.shapes,args:e.args})}function si(e,n){return`${e}|shapes=${n}`}function rn(e){return Array.isArray(e)?`[${e.map(rn).join(",")}]`:e&&typeof e=="object"?`{${Object.keys(e).sort().map(n=>`${JSON.stringify(n)}:${rn(e[n])}`).join(",")}}`:JSON.stringify(e)}function Lp(e,n){let t={};for(let r of n){let[s,a]=r.split("."),i=e.shapes[s];if(!i)continue;if(a===void 0||a==="*"){t[r]=i;continue}let o=Number(a);Number.isInteger(o)&&(t[r]=i[o])}return t}var It,Rt,Wt,ai=re(()=>{"use strict";Nn();It=class{entries=new Map;hits=0;misses=0;get(n){let t=this.entries.get(n);if(t===void 0){this.misses+=1;return}return this.hits+=1,t}getOrCreate(n,t){let r=this.get(n);if(r!==void 0)return r;let s=t();return this.entries.set(n,s),s}clear(){this.entries.clear(),this.hits=0,this.misses=0}},Rt=class extends It{},Wt=class extends It{}});function ii(e,n,t,r=!1){return e.map(s=>{let a=r?[0]:Cp($e(s.shape,t),s.id),i=hn(s.dtype),o=Op(s.id,n);return Object.freeze({id:s.id,dtype:i,shape:a,firstWrite:o.firstWrite,lastRead:o.lastRead,byteLength:Y(a)*se(i)})})}function Op(e,n){let t=Number.POSITIVE_INFINITY,r=-1;for(let s=0;s<n.length;++s)n[s].writes.includes(e)&&(t=Math.min(t,s)),n[s].reads.includes(e)&&(r=Math.max(r,s));return Number.isFinite(t)||(t=0),r<t&&(r=t),{firstWrite:t,lastRead:r}}function Cp(e,n){let t=Array.isArray(e)?e:[e];if(t.length===0)throw new Error(`WebGPU scratch ${n} shape must not be empty`);return Object.freeze(t.map(r=>{if(!Number.isInteger(r)||Number(r)<0)throw new Error(`WebGPU scratch ${n} shape dimension must be a nonnegative integer, got ${String(r)}`);return Number(r)}))}var oi=re(()=>{"use strict";we();$n()});var pi={};bt(pi,{executeWebGpuPlan:()=>Pp,materializeComputePassDescriptorTemplate:()=>Mt,materializeWebGpuExecutionPlan:()=>jn});function li(e){let n=0;for(let t of e){if(t.type!=="storage"&&t.type!=="read-only-storage")continue;let r=t,s=typeof r.size=="number"?r.size:typeof r.tensor?.byteLength=="number"?r.tensor.byteLength:void 0;typeof s=="number"&&Number.isFinite(s)&&s>0&&(n+=s)}return n}function di(e,n){return n<=0?e?{profile:e}:{}:{profile:{...e??{},bytesMoved:n}}}async function Pp(e,n,t={}){let r=jn(e,n);try{if(r.programs.length===0)return;if(typeof e.runProgramSequence=="function")await e.runProgramSequence(r.programs,t);else for(let s of r.programs)await e.runProgram(s,t)}finally{r.cleanup()}}function jn(e,n){let t=Ap(e,n),r=[],s=[];for(let a=0;a<n.program.passes.length;++a){let i=n.program.passes[a],o=n.plan.passes[a],u=`${n.program.op} (variant ${n.program.variant}, pass ${i.id})`,l=Gp(n,i.bindingSpecs,o.uniforms,t);if(Rp(i,l))continue;ci(u,i.bindings,c=>l[c.name]);let d=Fa(e,i.bindings,l,{labelPrefix:i.name});r.push(d.cleanup),s.push({name:i.name,source:i.source,entryPoint:i.entryPoint,cacheKey:`webgpu:${n.program.key}:pass=${i.id}`,bindings:d.bindings,dispatchWorkgroups:o.dispatchWorkgroups,...di(i.profile,li(d.bindings)),plan:{webgpuPlanKey:n.plan.key,pass:o.id,scratches:n.plan.scratches}})}return{programs:s,cleanup:()=>{for(let a of r)a();for(let a of Object.values(t))typeof a.destroy=="function"&&a.destroy()}}}function Mt(e,n){ci(`${e.name} (program ${e.programKey}, pass ${e.id})`,e.bindingSpecs,r=>ss(r,n));let t=e.bindingSpecs.map((r,s)=>zp(e,r,n,s));return{name:e.name,source:e.source,entryPoint:e.entryPoint,cacheKey:e.cacheKey,bindings:t,dispatchWorkgroups:e.dispatchWorkgroups,...di(e.profile,li(t)),plan:{webgpuProgramKey:e.programKey,webgpuPlanKey:e.planKey,pass:e.id}}}function zp(e,n,t,r){let s=ss(n,t);if(s==null)throw new Error(`Missing resource for compute pass descriptor template binding ${n.name}`);let a=n.binding??r;if(n.buffer.type==="uniform"){if(!Qr(s))throw new Error(`Compute pass descriptor template ${e.name} requires caller-owned uniform buffer for ${n.name}`);return{buffer:s,type:"uniform",binding:a,...n.group?{group:n.group}:{}}}let i=s,o=typeof i.byteOffset=="number"?i.byteOffset:0,u=typeof i.byteLength=="number"?i.byteLength:void 0;return{tensor:s,type:n.buffer.type,binding:a,...n.group?{group:n.group}:{},...o?{offset:o}:{},...u!==void 0?{size:u}:{}}}function ss(e,n){return n[e.arg??""]??n[e.name]??n[e.role??""]??n[e.semantic??""]}function Ap(e,n){let t={};if(n.plan.scratches.length===0)return t;if(typeof e.empty!="function")throw new Error("WebGPU multi-pass plan requires a runtime with empty(dtype, shape)");for(let r of n.plan.scratches)t[r.id]=e.empty(r.dtype,r.shape,`webgpu-scratch-${r.id}`);return t}function Gp(e,n,t,r){let s={};for(let a of n){if(a.buffer.type==="uniform"){let i=ui(e,a,r);s[a.name]=i??t[a.name];continue}s[a.name]=ui(e,a,r)}return s}function ui(e,n,t){return t[n.name]??t[n.role??""]??t[n.semantic??""]??ss(n,e.request.resources)}function ci(e,n,t){let r=null;for(let s of n){let a=Ip(s);if(a===null)continue;let i=rs(t(s));if(i===null)continue;r===null&&(r=new Map);let o=r.get(i.buffer);if(o===void 0){r.set(i.buffer,{name:s.name,access:a,view:i});continue}if(o.access==="read"&&a==="read")continue;if(o.access==="read_write"&&a==="read_write"){if(!Wp(o.view.offset,o.view.end,i.offset,i.end))continue;throw new Error(`${e}: storage bindings "${o.name}" and "${s.name}" alias overlapping writable ranges of the same GPU buffer; overlapping storage aliases are unsafe when either binding is writable`)}let[u,l]=a==="read_write"?[o.name,s.name]:[s.name,o.name];throw new Error(`${e}: storage aliasing hazard \u2014 binding "${u}" (read-only-storage) and binding "${l}" (storage, read_write) resolve to the same GPU buffer. WebGPU usage scopes cover the whole buffer, so this poisons the entire command buffer and corrupts downstream results. Bind it once as storage (read_write) for intentional in-place, or use distinct buffers.`)}}function Ip(e){if("buffer"in e&&e.buffer!==void 0)switch(e.buffer.type){case"read-only-storage":return"read";case"storage":return"read_write";default:return null}let n=e;return n.kind==="storage"?n.access:null}function Rp(e,n){let t=e.viewAlias;if(t===void 0)return!1;for(let{input:r,output:s}of t){let a=rs(n[r]),i=rs(n[s]);if(a===null||i===null||!(a.buffer===i.buffer&&a.offset===i.offset&&a.end===i.end)||a.dtype!==i.dtype)return!1}return!0}function rs(e){if(e===null||typeof e!="object")return null;let n=e,t=n.buffer??e;if(t===null||typeof t!="object"&&typeof t!="function")return null;let r=typeof n.byteOffset=="number"?n.byteOffset:0,s=typeof n.byteLength=="number"?n.byteLength:typeof n.size=="number"?n.size:Number.POSITIVE_INFINITY,a=typeof n.dtype=="string"?n.dtype:void 0;return{buffer:t,offset:r,end:r+s,dtype:a}}function Wp(e,n,t,r){return e<r&&t<n}var as=re(()=>{"use strict";Fn()});function Mp(e,n){let t=0,r=0;for(let s of e.passes){let a=0,i=0;for(let o of s.bindings){let u=o.buffer?.type;u&&(o.optional&&o.arg&&!n?.[o.arg]||(u==="uniform"?i+=1:a+=1))}t=Math.max(t,a),r=Math.max(r,i)}return{storage:t,uniform:r}}function Bp(e,n,t){let{storage:r,uniform:s}=Mp(e,t),a=n.limits.maxStorageBuffersPerShaderStage;if(typeof a=="number"&&r>a)return`needs ${r} storage buffers per shader stage, device allows ${a} (maxStorageBuffersPerShaderStage)`;let i=n.limits.maxUniformBuffersPerShaderStage;return typeof i=="number"&&s>i?`needs ${s} uniform buffers per shader stage, device allows ${i} (maxUniformBuffersPerShaderStage)`:null}function fi(e,n,t,r,s,a){return Object.freeze({id:e.id,name:e.name,source:e.source,entryPoint:e.entryPoint,cacheKey:t,bindings:e.bindings,bindingSpecs:e.bindingSpecs,dispatchWorkgroups:n.dispatchWorkgroups,uniforms:n.uniforms,...e.profile?{profile:e.profile}:{},programKey:r,planKey:s,passIndex:a})}function os(e,n,t,r){let s=Bt(e);if(r.has(s))throw new Error(`Circular WebGPU template include: ${[...r,s].join(" -> ")}`);r.add(s);let a=n.replace(Np,(i,o)=>{let u=Hp(s,o);return os(u,t(u),t,r)});return r.delete(s),a}function Hp(e,n){if(n.startsWith(".")){let t=e.slice(0,Math.max(0,e.lastIndexOf("/")));return Bt(`${t}/${n}`)}return Bt(n)}function Bt(e){let n=[];for(let t of e.replaceAll("\\","/").split("/"))if(!(t===""||t===".")){if(t===".."){if(n.length===0)throw new Error(`WebGPU template path escapes package root: ${e}`);n.pop();continue}n.push(t)}return n.join("/")}function Up(e,n,t){if(n.kind==="tensor"){if(!Ve(t))throw new Error(`WebGPU arg ${e} must be a GPU tensor`);if(n.dtype&&t.dtype!==n.dtype)throw new Error(`WebGPU arg ${e} dtype ${t.dtype} does not match ${n.dtype}`);return}if(n.kind==="string"){if(typeof t!="string")throw new Error(`WebGPU arg ${e} must be a string`);if(n.oneOf&&!n.oneOf.includes(t))throw new Error(`WebGPU arg ${e} must be one of ${n.oneOf.join(", ")}`);return}if(n.kind==="bool"){if(typeof t!="boolean")throw new Error(`WebGPU arg ${e} must be a boolean`);return}if(typeof t!="number"||!Number.isFinite(t))throw new Error(`WebGPU arg ${e} must be a finite number`);if(n.kind==="u32"&&(!Number.isInteger(t)||t<0||t>4294967295))throw new Error(`WebGPU arg ${e} must be a u32`);if(n.kind==="i32"&&(!Number.isInteger(t)||t<-2147483648||t>2147483647))throw new Error(`WebGPU arg ${e} must be an i32`)}function Fp(e){return typeof e.readText=="function"?e:_n(e)}function Kp(e,n){return hi(`WebGPU op ${e.program.op}`,e.program.passes,n)}function Vp(e,n,t){return hi(`WebGPU op ${e} variant ${n.id}`,n.passes,t)}function hi(e,n,t){if(t===void 0){if(n.length!==1)throw new Error(`${e} has ${n.length} passes; select a pass by id or index`);return 0}if(typeof t=="number"){if(!Number.isInteger(t)||t<0||t>=n.length)throw new Error(`${e} has no pass index ${t}`);return t}let r=n.findIndex(s=>s.id===t);if(r<0)throw new Error(`${e} has no pass ${t}`);return r}function $p(e,n){if(!gi(e))throw new Error(`${n} must be a JSON object`);return is(e,n)}function is(e,n){if(e===null)return null;if(typeof e=="boolean"||typeof e=="string")return e;if(typeof e=="number"){if(!Number.isFinite(e))throw new Error(`${n} number must be finite`);return e}if(Array.isArray(e))return Object.freeze(e.map((t,r)=>is(t,`${n}[${r}]`)));if(gi(e)){let t={};for(let[r,s]of Object.entries(e)){if(s===void 0)throw new Error(`${n}.${r} must be JSON; got undefined`);t[r]=is(s,`${n}.${r}`)}return Object.freeze(t)}throw new Error(`${n} must be JSON-compatible`)}function gi(e){if(e===null||typeof e!="object"||Array.isArray(e))return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null}function jp(e,n){if(e&&typeof e=="object"){let t=mi.get(e);return t===void 0&&(t=rn(tn(n)),mi.set(e,t)),t}return rn(tn(n))}function Qp(e,n,t){return rn({v:t??null,d:jp(e,n.device),...ts(n),args:n.args,shapes:n.shapes,present:n.present,source:n.sourceContext})}function Yp(e){return e!==null&&typeof e=="object"&&typeof e.dtype=="string"&&Array.isArray(e.shape)}function Xp(e){let n=e.shape.reduce((t,r)=>t*r,1);return{dtype:e.dtype,shape:e.shape,size:n,byteLength:n*4,buffer:{},runtime:null}}var Qn,Np,mi,Zp,Zn=re(()=>{"use strict";Fn();we();ai();Nn();$n();Gt();oi();Jr();Qn=class{manifest;assets;programCache;planCache;prepareCache=new Map;constructor(n,t={}){this.manifest=es(n),this.assets=Fp(t.assets??{}),this.programCache=t.programCache??new Rt,this.planCache=t.planCache??new Wt}explain(n,t,r={}){let s=Ee(n.device),a=this.applyManifestDerive(this.buildBaseScope(s,t)),i=this.variantCandidates(r.variant).map(o=>{let u=this.checkVariant(o,a);return{id:o.id,ok:u.ok,...!u.ok&&u.reason?{reason:u.reason}:{}}});return{op:this.manifest.id,selected:i.find(o=>o.ok)?.id??null,candidates:i}}prepare(n,t,r={}){this.validateRequest(t);let s=Ee(n.device),a=this.buildBaseScope(s,t),i=Qp(n.device,a,r.variant),o=this.prepareCache.get(i);if(o)return{program:o.program,plan:o.plan,request:t};let u=this.applyManifestDerive(a),{variant:l,scope:d}=this.selectVariantAndScope(u,t,r.variant),c=ti(this.manifest,l,d,this.programSpecialization(l,d)),p=this.programCache.getOrCreate(c,()=>this.buildProgram(c,l,d)),f=ri(d),h=si(c,f),m=this.planCache.getOrCreate(h,()=>this.buildPlan(h,c,f,l,d));return this.prepareCache.set(i,{program:p,plan:m}),{program:p,plan:m,request:t}}clearPreparedState(){this.prepareCache.clear(),this.programCache.clear(),this.planCache.clear()}inferOutputs(n,t={}){let r={};for(let[u,l]of Object.entries(n))l!==void 0&&(r[u]=Yp(l)?Xp(l):l);let s={resources:r,...t.args?{args:t.args}:{},...t.attrs?{attrs:t.attrs}:{}},a=this.applyManifestDerive(this.buildBaseScope(Ee(void 0),s)),i=new Map;for(let[u,l]of Object.entries(this.manifest.args))l.kind==="tensor"&&(l.role==="output"||l.role==="inout")&&l.semantic&&i.set(l.semantic,u);let o={};for(let u of this.manifest.outputs){let l=i.get(u.role)??u.role;if(u.shape===void 0)throw new Error(`${this.manifest.id}: output "${u.role}" has no shape expression \u2014 add outputs[].shape to ops/${this.manifest.id}/manifest.json (docs/model-graph-builder.md).`);let d=typeof u.shape=="string"?Ue(u.shape,a):u.shape.map(c=>$e(c,a));if(!Array.isArray(d)||!d.every(c=>Number.isInteger(c)&&c>=0))throw new Error(`${this.manifest.id}: output "${u.role}" shape evaluated to ${JSON.stringify(d)} (expected non-negative integers)`);o[l]={role:u.role,shape:d,dtype:this.resolveOutputDtype(u,a)}}return o}resolveOutputDtype(n,t){if(!n.dtype)return"float32";if(Zp.has(n.dtype))return n.dtype;let r=t.dtypes[n.dtype];if(typeof r=="string")return hn(r);let s=this.manifest.typeConstraints[n.dtype],a=t.tensorDtypes;for(let i of this.manifest.inputs){let o=a[i.role];if(typeof o=="string"&&(!Array.isArray(s)||s.includes(o)))return o}throw new Error(`${this.manifest.id}: output "${n.role}" dtype "${n.dtype}" is a constraint var with no bound input \u2014 pass a dtype override or bind an input sharing the var.`)}async run(n,t,r={}){let s=this.prepare(n,t,r),{executeWebGpuPlan:a}=await Promise.resolve().then(()=>(as(),pi));return await a(n,s,r.runOptions??{}),s}prepareComputePassDescriptorTemplate(n,t,r={}){if(r.cacheKey!==void 0)return this.prepareDirectComputePassDescriptorTemplate(n,t,{...r,cacheKey:r.cacheKey});let s=this.prepare(n,t,r),a=Kp(s,r.pass),i=s.program.passes[a],o=s.plan.passes[a];if(!i||!o)throw new Error(`WebGPU op ${s.program.op} produced no compute pass descriptor template at index ${a}`);return fi(i,o,`webgpu:${s.program.key}:pass=${i.id}`,s.program.key,s.plan.key,a)}prepareDirectComputePassDescriptorTemplate(n,t,r){this.validateRequest(t);let s=Ee(n.device),a=this.applyManifestDerive(this.buildBaseScope(s,t)),{variant:i,scope:o}=this.selectVariantAndScope(a,t,r.variant),u=Vp(this.manifest.id,i,r.pass),l=i.passes[u],d=this.buildProgramPass(i,l,o),c=this.buildPlanPass(i,l,o,u,this.allOutputsEmpty(o));return fi(d,c,r.cacheKey,r.cacheKey,r.cacheKey,u)}buildProgram(n,t,r){let s=t.passes.map(a=>this.buildProgramPass(t,a,r));return Object.freeze({key:n,op:this.manifest.id,variant:t.id,variantVersion:t.version,passes:Object.freeze(s)})}buildProgramPass(n,t,r){let s=this.passConstants(n,t,r),a={...r,variant:n,pass:t,constants:s},i=On(ei(t.bindings)),o=[Ua(i),jr(i,s)].filter(Boolean).join(`
`),u=this.passSourceInputs(t.source,a),l={...a,sourceContext:u},d=this.buildTemplateSource(n,t,l,o),c=gn(t.profile,l);return Object.freeze({id:t.id,name:t.name??`${this.manifest.id}.${n.id}.${t.id}`,source:d,entryPoint:t.entryPoint,bindings:i,bindingSpecs:t.bindings,...Object.keys(c).length>0?{profile:c}:{},...t.viewAlias?{viewAlias:t.viewAlias}:{},reads:t.reads,writes:t.writes})}buildTemplateSource(n,t,r,s){let a=os(t.source.shader,this.assets.readText(t.source.shader),u=>this.assets.readText(u),new Set),i=Yr(a,{...r,env:{device:Zr(r.device),wgsl:{resourceDeclarations:s}}}),o=Xr(i,r.device.features);if(o.length>0)throw new Error(`WebGPU op ${this.manifest.id} variant ${n.id} pass ${t.id} rendered WGSL enable directives the device does not support: ${o.join(", ")}. Gate the directive in the template (env.device.features) or declare the feature in the variant's requires.requiredFeatures.`);return i}programSpecialization(n,t){return{variant:gn(n.constants,{...t,variant:n}),passes:n.passes.map(r=>({id:r.id,constants:gn(r.constants,{...t,variant:n,pass:r}),source:this.passSourceSpecialization(n,r,t)}))}}passSourceSpecialization(n,t,r){let s=this.passConstants(n,t,r),a={...r,variant:n,pass:t,constants:s};return{kind:"template",shader:t.source.shader,sourceVersion:t.source.version??1,inputs:this.passSourceInputs(t.source,a)}}buildPlan(n,t,r,s,a){let i=this.allOutputsEmpty(a),o=ii(s.intermediates,s.passes,a,i),u=s.passes.map((l,d)=>this.buildPlanPass(s,l,a,d,i));return Object.freeze({key:n,programKey:t,shapeKey:r,scratches:o,passes:Object.freeze(u)})}allOutputsEmpty(n){let t=0;for(let[r,s]of Object.entries(this.manifest.args)){if(s.role!=="output"&&s.role!=="inout")continue;let a=n.resources[r];if(!Ve(a)||(t+=1,a.shape.reduce((i,o)=>i*o,1)!==0))return!1}return t>0}buildPlanPass(n,t,r,s,a){let i=this.passConstants(n,t,r);if(a)return Object.freeze({id:t.id,dispatchWorkgroups:[0,0,0],uniforms:this.zeroFilledUniforms(t)});let o={...r,variant:n,pass:t,constants:i},u={...o,sourceContext:this.passSourceInputs(t.source,o)},l=t.bindings.filter(d=>d.buffer.type==="uniform").reduce((d,c)=>(d[c.name]=this.uniformValues(c,t.uniforms[c.name],u),d),{});return Object.freeze({id:t.id,dispatchWorkgroups:this.passDispatchWorkgroups(t,u),uniforms:l})}zeroFilledUniforms(n){let t={};for(let r of n.bindings)r.buffer.type!=="uniform"||!r.struct||(t[r.name]=Object.fromEntries(r.struct.fields.map(s=>[s.name,0])));return t}passDispatchWorkgroups(n,t){let r=t.device.limits.maxComputeWorkgroupsPerDimension;return[Ue(n.dispatch.x,t),Ue(n.dispatch.y??1,t),Ue(n.dispatch.z??1,t)].map((s,a)=>{if(!Number.isInteger(s)||Number(s)<0)throw new Error(`WebGPU pass ${n.id} dispatch axis ${a} must resolve to a nonnegative integer, got ${String(s)}`);if(Number(s)>r)throw new Error(`WebGPU pass ${n.id} dispatch axis ${a} = ${s} exceeds maxComputeWorkgroupsPerDimension (${r}); clamp the dispatch (min(..., ${r})) and grid-stride over the remainder, or fold into 2D/3D.`);return Number(s)})}uniformValues(n,t,r){let s=n.struct;if(!s)throw new Error(`WebGPU uniform binding ${n.name} requires struct`);let a={};for(let i of s.fields){let o=t?.[i.name]??i.value??r.args[i.name]??i.default;if(o===void 0)continue;let u=Ue(o,r);if(typeof u!="number"||!Number.isFinite(u))throw new Error(`WebGPU uniform ${n.name}.${i.name} must resolve to a finite number`);a[i.name]=u}return a}passConstants(n,t,r){return{...r.dtypes,...gn(n.constants,{...r,variant:n,pass:t}),...gn(t.constants,{...r,variant:n,pass:t})}}passSourceInputs(n,t){return $p(gn(n.inputs,t),`WebGPU template source ${n.shader} inputs`)}selectVariantAndScope(n,t,r){let s=this.selectVariant(n,r),a=this.applyVariantDerive(n,t,s);return{variant:s,scope:a}}selectVariant(n,t){let r=[];for(let s of this.variantCandidates(t)){let a=this.checkVariant(s,n);if(a.ok)return s;r.push(`${s.id}: ${a.reason}`)}throw new Error(`No supported WebGPU variant for ${this.manifest.id}; rejected ${r.join("; ")}`)}variantCandidates(n){if(n!==void 0){let r=this.manifest.variants.find(s=>s.id===n);if(!r)throw new Error(`WebGPU op ${this.manifest.id} has no variant ${n}`);return[r]}return[...this.manifest.variants].sort((r,s)=>r.default!==s.default?r.default?-1:1:s.priority-r.priority)}checkVariant(n,t){let r=Br(n.requires,t.device);if(r)return{ok:!1,reason:r};let s=Bp(n,t.device,t.present);if(s)return{ok:!1,reason:s};let a={...t,variant:n},i=Array.isArray(n.when)?n.when:[n.when],o=i.length>1;for(let u of i){let l;try{l=Ue(u,a)}catch(d){return{ok:!1,reason:`when eval error in \`${typeof u=="string"?u:String(u)}\`: ${d.message}`}}if(l!==!0){let d=typeof u=="string"?u:String(u);return{ok:!1,reason:o?`when clause failed: \`${d}\` \u2192 ${String(l)}`:`when guard resolved to ${String(l)}`}}}if(n.selectAbove!==null){let u;try{u=Ue(n.selectAbove,a)}catch(l){return{ok:!1,reason:`selectAbove eval error in \`${n.selectAbove}\`: ${l.message}`}}if(u!==!0)return{ok:!1,reason:`below perf floor: \`${n.selectAbove}\` \u2192 ${String(u)}`}}return{ok:!0}}buildBaseScope(n,t){let r={...t.resources},s={...this.manifest.attributes,...t.attrs??{}},a={...t.args??{}},i={...t.sourceContext??{}};for(let[f,h]of Object.entries(r))!Ve(h)&&typeof h!="object"&&(a[f]=h);let o=Object.fromEntries(Object.keys({...this.manifest.args,...r}).map(f=>[f,r[f]!==void 0&&r[f]!==null])),u={},l={},d={},c={};for(let[f,h]of Object.entries(this.manifest.args)){let m=r[f];if(!Ve(m))continue;let g=[f,h.semantic,h.role].filter(w=>typeof w=="string"&&w.length>0);for(let w of g)u[w]=m.shape,l[w]=m.shape.length,d[w]=m.dtype}for(let f of[...this.manifest.inputs,...this.manifest.outputs]){if(!f.dtype)continue;let h=d[f.role];h!==void 0&&(c[f.dtype]=Vn(h))}return this.validateInputDtypes(d),{op:this.manifest,device:n,attrs:s,args:a,sourceContext:i,resources:r,present:o,shapes:u,ranks:l,tensorDtypes:d,dtypes:c,derived:{},tunables:{...this.manifest.tunables,...t.tunables??{}},constants:{}}}validateInputDtypes(n){for(let t of this.manifest.inputs){let r=t.dtype;if(!r)continue;let s=n[t.role];if(s===void 0)continue;let a=this.manifest.typeConstraints[r];if(Array.isArray(a)&&a.length>0&&!a.includes(s))throw new Error(`${this.manifest.id}: input "${t.role}" has dtype ${s}, not allowed by type constraint ${r} = [${a.join(", ")}]`)}}applyManifestDerive(n){let t={};for(let[r,s]of Object.entries(this.manifest.derive))t[r]=$e(s,{...n,derived:t});return{...n,derived:t}}applyVariantDerive(n,t,r){let s={...n,variant:r,tunables:{...this.manifest.tunables,...r.tunables,...t.tunables??{}}},a={...n.derived};for(let[i,o]of Object.entries(r.derive))a[i]=$e(o,{...s,derived:a});return{...s,derived:a}}validateRequest(n){for(let[t,r]of Object.entries(this.manifest.args)){let s=n.resources[t]??n.args?.[t];if(s==null){if(r.required!==!1)throw new Error(`WebGPU op ${this.manifest.id} missing required arg ${t}`);continue}Up(t,r,s)}}};Np=/{%\s*include\s+["']([^"']+)["']\s*%}/g;mi=new WeakMap;Zp=new Set(Object.keys(Ie))});var _i,yi,bi=re(()=>{_i=new Map([]),yi=new Map([["com.xenova.AddInPlace",{manifest:{schemaVersion:1,domain:"com.xenova",name:"AddInPlace",sinceVersion:1,inputs:[{role:"Y",dtype:"Y"},{role:"X",dtype:"X"}],outputs:[{role:"Y",dtype:"Y",shape:"shapes.yT"}],typeConstraints:{Y:["float32","float16"],X:["float32","float16"]},args:{yT:{kind:"tensor",semantic:"Y",role:"inout"},xT:{kind:"tensor",semantic:"X",role:"input"},count:{kind:"u32",semantic:"kernel.count"}},tunables:{WORKGROUP_SIZE:64,MAX_WORKGROUPS_X:1024},variants:[{id:"scalar",when:["args.count >= 0","numel(shapes.yT) >= args.count","numel(shapes.xT) >= args.count","f16Ok(dtypes.Y)","f16Ok(dtypes.X)"],passes:[{id:"main",name:"AddInPlace",shader:"add-in-place.wgsl.jinja",bindings:[{name:"y",arg:"yT",semantic:"Y",role:"inout",buffer:{type:"storage"},elementType:"$Y"},{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$X"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"count",type:"u32",value:"args.count"},{name:"wgY",type:"u32",value:"min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X)"}]}}],dispatch:{x:"min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X)",y:"ceil(ceil(args.count / tunables.WORKGROUP_SIZE) / min(ceil(args.count / tunables.WORKGROUP_SIZE), tunables.MAX_WORKGROUPS_X))",z:1},reads:["Y","X"],writes:["Y"]}]}]},assets:[["add-in-place.wgsl.jinja",`{% if Y == "f16" or X == "f16" %}
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
`]]}],["com.xenova.llama.ForwardMegakernel",{manifest:{schemaVersion:1,domain:"com.xenova.llama",name:"ForwardMegakernel",sinceVersion:1,inputs:[{role:"InputIds",dtype:"uint32",rank:2},{role:"PositionIds",dtype:"uint32",rank:2},{role:"Weights",dtype:"float32",rank:1},{role:"CacheKeys",dtype:"float32"},{role:"CacheValues",dtype:"float32"}],outputs:[{role:"Logits",dtype:"float32"},{role:"CacheKeys",dtype:"float32"},{role:"CacheValues",dtype:"float32"}],args:{inputIdsT:{kind:"tensor",semantic:"InputIds",role:"input"},positionIdsT:{kind:"tensor",semantic:"PositionIds",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},logitsT:{kind:"tensor",semantic:"Logits",role:"output"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},batchSize:{kind:"u32",semantic:"batch_size"},seqLen:{kind:"u32",semantic:"seq_len"},pastLen:{kind:"u32",semantic:"past_len"},logitsLen:{kind:"u32",semantic:"logits_len"},maxSeq:{kind:"u32",semantic:"max_seq_len"},embedOffset:{kind:"u32",semantic:"embed_offset"},modelNormOffset:{kind:"u32",semantic:"model_norm_offset"},lmHeadOffset:{kind:"u32",semantic:"lm_head_offset"},hiddenArraySize:{kind:"u32",semantic:"hidden_array_size"},qArraySize:{kind:"u32",semantic:"q_array_size"},kvArraySize:{kind:"u32",semantic:"kv_array_size"},interSize:{kind:"u32",semantic:"inter_size"},consts:{kind:"string",semantic:"shape_consts"},layerOffsets:{kind:"string",semantic:"layer_offsets_wgsl"},qkNormBlock:{kind:"string",semantic:"qk_norm_block"},siluFn:{kind:"string",semantic:"silu_wgsl"},f32Min:{kind:"string",semantic:"f32_min_literal"},ropeTheta:{kind:"string",semantic:"rope_theta"},rmsEps:{kind:"string",semantic:"rms_eps"},scaling:{kind:"string",semantic:"attention_scaling"}},variants:[{id:"generated",priority:0,when:["args.batchSize > 0","args.seqLen > 0","args.hiddenArraySize > 0","ranks.inputIdsT == 2",'tensorDtypes.inputIdsT == "uint32"','tensorDtypes.weightsT == "float32"','tensorDtypes.logitsT == "float32"'],constants:{maxSeq:"args.maxSeq",consts:"args.consts",ropeTheta:"args.ropeTheta",rmsEps:"args.rmsEps",scaling:"args.scaling",embedOffset:"args.embedOffset",modelNormOffset:"args.modelNormOffset",lmHeadOffset:"args.lmHeadOffset",layerOffsets:"args.layerOffsets",qkNormBlock:"args.qkNormBlock",siluFn:"args.siluFn",f32Min:"args.f32Min",hiddenArraySize:"args.hiddenArraySize",qArraySize:"args.qArraySize",kvArraySize:"args.kvArraySize",interSize:"args.interSize"},passes:[{id:"main",name:"ForwardMegakernel",shader:"forward-megakernel.wgsl.jinja",bindings:[{name:"input_ids",arg:"inputIdsT",semantic:"InputIds",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"position_ids",arg:"positionIdsT",semantic:"PositionIds",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"logits",arg:"logitsT",semantic:"Logits",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"batch_size",type:"u32",value:"args.batchSize"},{name:"seq_len",type:"u32",value:"args.seqLen"},{name:"past_len",type:"u32",value:"args.pastLen"},{name:"logits_len",type:"u32",value:"args.logitsLen"}]}}],dispatch:{x:"min(args.batchSize, device.limits.maxComputeWorkgroupsPerDimension)",y:"ceilDiv(args.batchSize, device.limits.maxComputeWorkgroupsPerDimension)",z:1},reads:["InputIds","PositionIds","Weights","CacheKeys","CacheValues"],writes:["Logits","CacheKeys","CacheValues"]}]}]},assets:[["forward-megakernel.wgsl.jinja",`struct Params {
  batch_size: u32,
  seq_len: u32,
  past_len: u32,
  logits_len: u32,
}

@group(0) @binding(0) var<storage, read> input_ids: array<u32>;
@group(0) @binding(1) var<storage, read> position_ids: array<u32>;
@group(0) @binding(2) var<storage, read> weights: array<f32>;
@group(0) @binding(3) var<storage, read_write> logits: array<f32>;
@group(0) @binding(4) var<storage, read_write> cache_keys: array<f32>;
@group(0) @binding(5) var<storage, read_write> cache_values: array<f32>;
@group(0) @binding(6) var<uniform> params: Params;

const MAX_SEQ_LEN: u32 = {{ maxSeq }}u;
{{ consts }}
const ROPE_THETA: f32 = {{ ropeTheta }};
const RMS_EPS: f32 = {{ rmsEps }};
const ATTN_SCALING: f32 = {{ scaling }};

const W_EMBED: u32 = {{ embedOffset }}u;
const W_FINAL_NORM: u32 = {{ modelNormOffset }}u;
const W_LM_HEAD: u32 = {{ lmHeadOffset }}u;

{{ layerOffsets }}

fn hidden_index(t: u32, dim: u32) -> u32 {
  return t * HIDDEN_SIZE + dim;
}

fn q_index(t: u32, head: u32, dim: u32) -> u32 {
  return (t * NUM_HEADS + head) * HEAD_DIM + dim;
}

fn kv_index(t: u32, head: u32, dim: u32) -> u32 {
  return (t * NUM_KV_HEADS + head) * HEAD_DIM + dim;
}

fn cache_index(layer: u32, batch: u32, pos: u32, head: u32, dim: u32) -> u32 {
  return ((((layer * params.batch_size + batch) * MAX_SEQ_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

{{ siluFn }}

@compute @workgroup_size(1)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  // 2D-fold of the batch axis: when batch_size exceeds the per-dimension dispatch
  // limit it is split across x (clamped) and y, so the flat batch index is
  // wid.x + wid.y * nwg.x. With y == 1 (batch_size within the limit) this reduces
  // to wid.x, bit-identically. The guard below drops the over-dispatched tail.
  let batch = wid.x + wid.y * nwg.x;
  if (batch >= params.batch_size || params.seq_len > MAX_SEQ_LEN || params.past_len + params.seq_len > MAX_SEQ_LEN) {
    return;
  }

  var hidden: array<f32, {{ hiddenArraySize }}>;
  var residual: array<f32, {{ hiddenArraySize }}>;
  var normed: array<f32, {{ hiddenArraySize }}>;
  var q: array<f32, {{ qArraySize }}>;
  var k: array<f32, {{ kvArraySize }}>;
  var v: array<f32, {{ kvArraySize }}>;
  var attn_out: array<f32, {{ hiddenArraySize }}>;
  var gate: array<f32, {{ interSize }}>;
  var up: array<f32, {{ interSize }}>;

  for (var t = 0u; t < params.seq_len; t = t + 1u) {
    let token = input_ids[batch * params.seq_len + t];
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      hidden[hidden_index(t, dim)] = weights[W_EMBED + token * HIDDEN_SIZE + dim];
    }
  }

  for (var layer = 0u; layer < NUM_LAYERS; layer = layer + 1u) {
    for (var i = 0u; i < params.seq_len * HIDDEN_SIZE; i = i + 1u) {
      residual[i] = hidden[i];
    }

    for (var t = 0u; t < params.seq_len; t = t + 1u) {
      var variance = 0.0;
      for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
        let value = hidden[hidden_index(t, dim)];
        variance = variance + value * value;
      }
      let scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);
      for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
        normed[hidden_index(t, dim)] =
          hidden[hidden_index(t, dim)] * scale * weights[input_norm_offset(layer) + dim];
      }
    }

    for (var t = 0u; t < params.seq_len; t = t + 1u) {
      for (var head = 0u; head < NUM_HEADS; head = head + 1u) {
        for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
          let out_dim = head * HEAD_DIM + d;
          var acc = 0.0;
          for (var in_dim = 0u; in_dim < HIDDEN_SIZE; in_dim = in_dim + 1u) {
            acc = acc + normed[hidden_index(t, in_dim)] *
              weights[q_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
          }
          q[q_index(t, head, d)] = acc;
        }
      }
      for (var head = 0u; head < NUM_KV_HEADS; head = head + 1u) {
        for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
          let out_dim = head * HEAD_DIM + d;
          var k_acc = 0.0;
          var v_acc = 0.0;
          for (var in_dim = 0u; in_dim < HIDDEN_SIZE; in_dim = in_dim + 1u) {
            let x = normed[hidden_index(t, in_dim)];
            k_acc = k_acc + x * weights[k_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
            v_acc = v_acc + x * weights[v_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
          }
          k[kv_index(t, head, d)] = k_acc;
          v[kv_index(t, head, d)] = v_acc;
        }
      }
    }
{{ qkNormBlock }}

    for (var t = 0u; t < params.seq_len; t = t + 1u) {
      let pos = f32(position_ids[batch * params.seq_len + t]);
      for (var head = 0u; head < NUM_HEADS; head = head + 1u) {
        for (var d = 0u; d < HEAD_DIM_HALF; d = d + 1u) {
          let inv_freq = 1.0 / pow(ROPE_THETA, f32(d * 2u) / f32(HEAD_DIM));
          let angle = pos * inv_freq;
          let c = cos(angle);
          let s = sin(angle);
          let first = q[q_index(t, head, d)];
          let second = q[q_index(t, head, d + HEAD_DIM_HALF)];
          q[q_index(t, head, d)] = first * c - second * s;
          q[q_index(t, head, d + HEAD_DIM_HALF)] = second * c + first * s;
        }
      }
      for (var head = 0u; head < NUM_KV_HEADS; head = head + 1u) {
        for (var d = 0u; d < HEAD_DIM_HALF; d = d + 1u) {
          let inv_freq = 1.0 / pow(ROPE_THETA, f32(d * 2u) / f32(HEAD_DIM));
          let angle = pos * inv_freq;
          let c = cos(angle);
          let s = sin(angle);
          let first = k[kv_index(t, head, d)];
          let second = k[kv_index(t, head, d + HEAD_DIM_HALF)];
          k[kv_index(t, head, d)] = first * c - second * s;
          k[kv_index(t, head, d + HEAD_DIM_HALF)] = second * c + first * s;
        }
      }
      for (var head = 0u; head < NUM_KV_HEADS; head = head + 1u) {
        for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
          let pos_index = params.past_len + t;
          cache_keys[cache_index(layer, batch, pos_index, head, d)] = k[kv_index(t, head, d)];
          cache_values[cache_index(layer, batch, pos_index, head, d)] = v[kv_index(t, head, d)];
        }
      }
    }

    for (var t = 0u; t < params.seq_len; t = t + 1u) {
      for (var head = 0u; head < NUM_HEADS; head = head + 1u) {
        let kv_head = head / NUM_KV_GROUPS;
        var max_score = {{ f32Min }};
        for (var src = 0u; src <= params.past_len + t; src = src + 1u) {
          var score = 0.0;
          for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
            score = score + q[q_index(t, head, d)] * cache_keys[cache_index(layer, batch, src, kv_head, d)];
          }
          score = score * ATTN_SCALING;
          max_score = max(max_score, score);
        }
        var denom = 0.0;
        for (var src = 0u; src <= params.past_len + t; src = src + 1u) {
          var score = 0.0;
          for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
            score = score + q[q_index(t, head, d)] * cache_keys[cache_index(layer, batch, src, kv_head, d)];
          }
          denom = denom + exp(score * ATTN_SCALING - max_score);
        }
        for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
          var value = 0.0;
          for (var src = 0u; src <= params.past_len + t; src = src + 1u) {
            var score = 0.0;
            for (var kd = 0u; kd < HEAD_DIM; kd = kd + 1u) {
              score = score + q[q_index(t, head, kd)] * cache_keys[cache_index(layer, batch, src, kv_head, kd)];
            }
            let prob = exp(score * ATTN_SCALING - max_score) / denom;
            value = value + prob * cache_values[cache_index(layer, batch, src, kv_head, d)];
          }
          attn_out[hidden_index(t, head * HEAD_DIM + d)] = value;
        }
      }
    }

    for (var t = 0u; t < params.seq_len; t = t + 1u) {
      for (var out_dim = 0u; out_dim < HIDDEN_SIZE; out_dim = out_dim + 1u) {
        var acc = 0.0;
        for (var in_dim = 0u; in_dim < HIDDEN_SIZE; in_dim = in_dim + 1u) {
          acc = acc + attn_out[hidden_index(t, in_dim)] *
            weights[o_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
        }
        hidden[hidden_index(t, out_dim)] = residual[hidden_index(t, out_dim)] + acc;
      }
    }

    for (var i = 0u; i < params.seq_len * HIDDEN_SIZE; i = i + 1u) {
      residual[i] = hidden[i];
    }

    for (var t = 0u; t < params.seq_len; t = t + 1u) {
      var variance = 0.0;
      for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
        let value = hidden[hidden_index(t, dim)];
        variance = variance + value * value;
      }
      let scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);
      for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
        normed[hidden_index(t, dim)] =
          hidden[hidden_index(t, dim)] * scale * weights[post_norm_offset(layer) + dim];
      }

      for (var j = 0u; j < INTERMEDIATE_SIZE; j = j + 1u) {
        var gate_acc = 0.0;
        var up_acc = 0.0;
        for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
          let x = normed[hidden_index(t, dim)];
          gate_acc = gate_acc + x * weights[gate_offset(layer) + j * HIDDEN_SIZE + dim];
          up_acc = up_acc + x * weights[up_offset(layer) + j * HIDDEN_SIZE + dim];
        }
        gate[j] = silu(gate_acc);
        up[j] = up_acc;
      }

      for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
        var acc = 0.0;
        for (var j = 0u; j < INTERMEDIATE_SIZE; j = j + 1u) {
          acc = acc + gate[j] * up[j] * weights[down_offset(layer) + dim * INTERMEDIATE_SIZE + j];
        }
        hidden[hidden_index(t, dim)] = residual[hidden_index(t, dim)] + acc;
      }
    }
  }

  for (var t = 0u; t < params.seq_len; t = t + 1u) {
    var variance = 0.0;
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      let value = hidden[hidden_index(t, dim)];
      variance = variance + value * value;
    }
    let scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      normed[hidden_index(t, dim)] = hidden[hidden_index(t, dim)] * scale * weights[W_FINAL_NORM + dim];
    }
  }

  for (var out_t = 0u; out_t < params.logits_len; out_t = out_t + 1u) {
    let t = params.seq_len - params.logits_len + out_t;
    for (var vocab = 0u; vocab < VOCAB_SIZE; vocab = vocab + 1u) {
      var acc = 0.0;
      for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
        acc = acc + normed[hidden_index(t, dim)] * weights[W_LM_HEAD + vocab * HIDDEN_SIZE + dim];
      }
      logits[(batch * params.logits_len + out_t) * VOCAB_SIZE + vocab] = acc;
    }
  }
}
`]]}],["com.xenova.LlamaDecodeAttention",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeAttention",sinceVersion:1,inputs:[{role:"Q",dtype:"Q",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],outputs:[{role:"Attn",dtype:"O",rank:1}],typeConstraints:{Q:["float32","float16"],C:["float32","float16"],O:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"input"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"input"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"input"},attnT:{kind:"tensor",semantic:"Attn",role:"output"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},scale:{kind:"f32",semantic:"scale"},workgroupSize:{kind:"u32",semantic:"workgroup_size"}},variants:[{id:"scalar",priority:0,when:["ranks.qT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","ranks.attnT == 1",'(tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16")',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','(tensorDtypes.attnT == "float32" or tensorDtypes.attnT == "float16")','((tensorDtypes.qT != "float16" and tensorDtypes.cacheKeysT != "float16" and tensorDtypes.attnT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.numHeads % args.numKvHeads == 0","args.headDim > 0","(args.workgroupSize == 4 or args.workgroupSize == 8 or args.workgroupSize == 16 or args.workgroupSize == 32 or args.workgroupSize == 64 or args.workgroupSize == 128 or args.workgroupSize == 256)","numel(shapes.qT) >= args.numHeads * args.headDim","dim(shapes.attnT, 0) == args.numHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim"],constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.cacheKeysT == "float16" or tensorDtypes.attnT == "float16"',qScalar:"dtypes.Q",cacheScalar:"dtypes.C",outScalar:"dtypes.O",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",numKvGroups:"args.numHeads / args.numKvHeads",headDim:"args.headDim",scaling:"args.scale",workgroupSize:"args.workgroupSize",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeAttention",shader:"decode-attention.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"$qScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads",y:1,z:1},reads:["Q","CacheKeys","CacheValues"],writes:["Attn"]}]}]},assets:[["decode-attention.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const NUM_KV_GROUPS: u32 = {{ numKvGroups }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const ATTN_SCALING: f32 = {{ scaling }};
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;

var<workgroup> scores: array<f32, {{ cacheLen }}>;
var<workgroup> partials: array<f32, {{ workgroupSize }}>;

fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

fn load_q(value: {{ qScalar }}) -> f32 {
  return f32(value);
}

fn load_cache(value: {{ cacheScalar }}) -> f32 {
  return f32(value);
}

fn store_attn(value: f32) -> {{ outScalar }} {
  return {{ outScalar }}(value);
}

@compute @workgroup_size({{ workgroupSize }})
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let head = wid.x;
  let lid = lid3.x;
  if (head >= NUM_HEADS || params.past_len >= CACHE_LEN) {
    return;
  }
  let kv_head = head / NUM_KV_GROUPS;
  let q_base = head * HEAD_DIM;

  var local_max = {{ f32Min }};
  for (var src = lid; src <= params.past_len; src = src + WORKGROUP_SIZE) {
    var score = 0.0;
    for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
      score = fma(load_q(q[q_base + d]), load_cache(cache_keys[cache_index(src, kv_head, d)]), score);
    }
    score = score * ATTN_SCALING;
    scores[src] = score;
    local_max = max(local_max, score);
  }
  partials[lid] = local_max;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = max(partials[lid], partials[lid + stride]);
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
  let max_score = partials[0];
  workgroupBarrier();

  var local_denom = 0.0;
  for (var src = lid; src <= params.past_len; src = src + WORKGROUP_SIZE) {
    local_denom = local_denom + exp(scores[src] - max_score);
  }
  partials[lid] = local_denom;
  workgroupBarrier();

  stride = WORKGROUP_SIZE / 2u;
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
  let denom = partials[0];
  workgroupBarrier();

  if (lid < HEAD_DIM) {
    let d = lid;
    var value = 0.0;
    for (var src = 0u; src <= params.past_len; src = src + 1u) {
      let prob = exp(scores[src] - max_score) / denom;
      value = fma(prob, load_cache(cache_values[cache_index(src, kv_head, d)]), value);
    }
    attn_out[q_base + d] = store_attn(value);
  }
}
`]]}],["com.xenova.LlamaDecodeAttentionSplitK",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeAttentionSplitK",sinceVersion:1,inputs:[{role:"Q",dtype:"Q",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],outputs:[{role:"PartialOut",dtype:"float32",rank:1,shape:["args.numKvChunks * args.numHeads * args.headDim"]},{role:"PartialMeta",dtype:"float32",rank:1,shape:["args.numKvChunks * args.numHeads * 2"]}],typeConstraints:{Q:["float32","float16"],C:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"input"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"input"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"input"},partialOutT:{kind:"tensor",semantic:"PartialOut",role:"output"},partialMetaT:{kind:"tensor",semantic:"PartialMeta",role:"output"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},scale:{kind:"f32",semantic:"scale"},workgroupSize:{kind:"u32",semantic:"workgroup_size"},tileSize:{kind:"u32",semantic:"tile_size"},numKvChunks:{kind:"u32",semantic:"num_kv_chunks"},minKeysPerChunk:{kind:"u32",semantic:"min_keys_per_chunk"}},variants:[{id:"split",priority:0,when:["ranks.qT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","ranks.partialOutT == 1","ranks.partialMetaT == 1",'(tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16")',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','tensorDtypes.partialOutT == "float32"','tensorDtypes.partialMetaT == "float32"','((tensorDtypes.qT != "float16" and tensorDtypes.cacheKeysT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.numHeads % args.numKvHeads == 0","args.headDim > 0","args.headDim % 4 == 0","args.tileSize > 0","args.workgroupSize >= args.tileSize","args.numKvChunks > 0","args.minKeysPerChunk > 0","(args.workgroupSize == 4 or args.workgroupSize == 8 or args.workgroupSize == 16 or args.workgroupSize == 32 or args.workgroupSize == 64 or args.workgroupSize == 128 or args.workgroupSize == 256)","numel(shapes.qT) >= args.numHeads * args.headDim","dim(shapes.partialOutT, 0) == args.numHeads * args.numKvChunks * args.headDim","dim(shapes.partialMetaT, 0) == args.numHeads * args.numKvChunks * 2","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim"],constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.cacheKeysT == "float16"',useSubgroups:'device.features.has("subgroups") and args.workgroupSize >= 32',qVec4:'"vec4<f16>" if tensorDtypes.qT == "float16" else "vec4<f32>"',cacheVec4:'"vec4<f16>" if tensorDtypes.cacheKeysT == "float16" else "vec4<f32>"',cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",numKvGroups:"args.numHeads / args.numKvHeads",headDim:"args.headDim",headDimVec4:"args.headDim / 4",scale:"args.scale",workgroupSize:"args.workgroupSize",tileSize:"args.tileSize",numKvChunks:"args.numKvChunks",minKeysPerChunk:"args.minKeysPerChunk",dualOutput:"args.headDim == args.workgroupSize * 2",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeAttentionSplitK",source:{kind:"template",shader:"decode-flash-attention-split-k.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"q",arg:"qT",semantic:"Q",role:"input",buffer:{type:"read-only-storage"},elementType:"$qVec4"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheVec4"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"partial_out",arg:"partialOutT",semantic:"PartialOut",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"partial_meta",arg:"partialMetaT",semantic:"PartialMeta",role:"output",buffer:{type:"storage"},elementType:"vec2<f32>"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads",y:"args.numKvChunks",z:1},reads:["Q","CacheKeys","CacheValues"],writes:["PartialOut","PartialMeta"]}]}]},assets:[["decode-flash-attention-split-k.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const NUM_KV_GROUPS: u32 = {{ numKvGroups }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_VEC4: u32 = {{ headDimVec4 }}u;
const ATTN_SCALING: f32 = {{ scale }};
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;
const TILE_SIZE: u32 = {{ tileSize }}u;
const NUM_KV_CHUNKS: u32 = {{ numKvChunks }}u;
const MIN_KEYS_PER_CHUNK: u32 = {{ minKeysPerChunk }}u;
const F32_MIN: f32 = {{ f32Min }};

var<workgroup> partials: array<f32, {{ workgroupSize }}>;
var<workgroup> tile_scores: array<f32, {{ tileSize }}>;
var<workgroup> shared_q: array<vec4<f32>, {{ headDimVec4 }}>;

fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

fn cache_index_vec4(pos: u32, head: u32, dim4: u32) -> u32 {
  return ((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM_VEC4 + dim4;
}

fn load_q(value: {{ qVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

fn load_key(value: {{ cacheVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

fn load_value(value: {{ cacheScalar }}) -> f32 {
  return f32(value);
}

fn exp_fast(value: f32) -> f32 {
  return exp2(value * 1.4426950408889634);
}

fn reduce_sum(
  value: f32,
  lid: u32
{%- if useSubgroups %},
  sg_lid: u32,
  sg_size: u32
{%- endif %}
) -> f32 {
{%- if useSubgroups %}
  let subgroup_sum = subgroupAdd(value);
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
  partials[lid] = value;
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
{%- endif %}
  // Trailing barrier so back-to-back reductions can't race: reduce_max and reduce_sum share
  // \`partials\`, so the next reduction's stores must wait until every invocation has read slot 0
  // here. Without it, a fast lane's next-reduction write to partials[0] can clobber a slow lane's
  // read of this result \u2014 benign when the workgroup advances in lockstep, but a wrong-result race
  // under GPU scheduling pressure (concurrent decode).
  let reduced_sum = partials[0];
  workgroupBarrier();
  return reduced_sum;
}

fn reduce_max(
  value: f32,
  lid: u32
{%- if useSubgroups %},
  sg_lid: u32,
  sg_size: u32
{%- endif %}
) -> f32 {
{%- if useSubgroups %}
  let subgroup_max = subgroupMax(value);
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials[0] = subgroup_max;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      partials[lid / sg_size] = subgroup_max;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total = F32_MIN;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total = max(total, partials[i]);
      }
      partials[0] = total;
    }
    workgroupBarrier();
  }
{%- else %}
  partials[lid] = value;
  workgroupBarrier();
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = max(partials[lid], partials[lid + stride]);
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}
  // Trailing barrier (see reduce_sum): reduce_max's result is read by every lane here, and the
  // immediately-following reduce_sum reuses \`partials\`, so its stores must not run until this read
  // completes for all lanes.
  let reduced_max = partials[0];
  workgroupBarrier();
  return reduced_max;
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
  let chunk = wid.y;
  let lid = lid3.x;
  if (head >= NUM_HEADS || chunk >= NUM_KV_CHUNKS || params.past_len >= CACHE_LEN) {
    return;
  }
  let total_len = params.past_len + 1u;
  let even = (total_len + NUM_KV_CHUNKS - 1u) / NUM_KV_CHUNKS;
  let chunk_size = max(even, MIN_KEYS_PER_CHUNK);
  let chunk_start = chunk * chunk_size;
  let chunk_end = min(chunk_start + chunk_size, total_len);

  let kv_head = head / NUM_KV_GROUPS;
  let q_base_vec4 = head * HEAD_DIM_VEC4;
  for (var dim4 = lid; dim4 < HEAD_DIM_VEC4; dim4 = dim4 + WORKGROUP_SIZE) {
    shared_q[dim4] = load_q(q[q_base_vec4 + dim4]);
  }
  workgroupBarrier();

  var running_max = F32_MIN;
  var running_denom = 0.0;
  {%- if dualOutput %}
  var output0 = 0.0;
  var output1 = 0.0;
  {%- else %}
  var output = 0.0;
  {%- endif %}

  if (chunk_start < chunk_end) {
    for (var tile_start = chunk_start; tile_start < chunk_end; tile_start = tile_start + TILE_SIZE) {
      let score_src = tile_start + lid;
      var score = F32_MIN;
      if (lid < TILE_SIZE && score_src < chunk_end) {
        var acc = 0.0;
        for (var dim4 = 0u; dim4 < HEAD_DIM_VEC4; dim4 = dim4 + 1u) {
          let q_v = shared_q[dim4];
          let k_v = load_key(cache_keys[cache_index_vec4(score_src, kv_head, dim4)]);
          acc = acc + dot(q_v, k_v);
        }
        score = acc * ATTN_SCALING;
      }
      if (lid < TILE_SIZE) {
        tile_scores[lid] = score;
      }
      let tile_max = reduce_max(score, lid{% if useSubgroups %}, sg_lid, sg_size{% endif %});
      var exp_score = 0.0;
      if (lid < TILE_SIZE) {
        exp_score = select(0.0, exp_fast(tile_scores[lid] - tile_max), tile_start + lid < chunk_end);
      }
      let tile_denom = reduce_sum(exp_score, lid{% if useSubgroups %}, sg_lid, sg_size{% endif %});
      let next_max = max(running_max, tile_max);
      let previous_scale = select(0.0, exp_fast(running_max - next_max), running_denom > 0.0);
      let tile_scale = exp_fast(tile_max - next_max);
      let next_denom = running_denom * previous_scale + tile_denom * tile_scale;
      {%- if dualOutput %}
      if (lid < WORKGROUP_SIZE) {
        var tile_output0 = 0.0;
        var tile_output1 = 0.0;
        for (var offset = 0u; offset < TILE_SIZE; offset = offset + 1u) {
          let value_src = tile_start + offset;
          if (value_src < chunk_end) {
            let prob = exp_fast(tile_scores[offset] - tile_max);
            let value0 = load_value(cache_values[cache_index(value_src, kv_head, lid)]);
            let value1 = load_value(cache_values[cache_index(value_src, kv_head, lid + WORKGROUP_SIZE)]);
            tile_output0 = fma(prob, value0, tile_output0);
            tile_output1 = fma(prob, value1, tile_output1);
          }
        }
        output0 = output0 * previous_scale + tile_scale * tile_output0;
        output1 = output1 * previous_scale + tile_scale * tile_output1;
      }
      {%- else %}
      if (lid < HEAD_DIM) {
        var tile_output = 0.0;
        for (var offset = 0u; offset < TILE_SIZE; offset = offset + 1u) {
          let value_src = tile_start + offset;
          if (value_src < chunk_end) {
            let value = load_value(cache_values[cache_index(value_src, kv_head, lid)]);
            tile_output = fma(exp_fast(tile_scores[offset] - tile_max), value, tile_output);
          }
        }
        output = output * previous_scale + tile_scale * tile_output;
      }
      {%- endif %}
      running_max = next_max;
      running_denom = next_denom;
      workgroupBarrier();
    }
  }

  let partial_out_base = (head * NUM_KV_CHUNKS + chunk) * HEAD_DIM;
  {%- if dualOutput %}
  if (lid < WORKGROUP_SIZE) {
    partial_out[partial_out_base + lid] = output0;
    partial_out[partial_out_base + lid + WORKGROUP_SIZE] = output1;
  }
  {%- else %}
  if (lid < HEAD_DIM) {
    partial_out[partial_out_base + lid] = output;
  }
  {%- endif %}
  if (lid == 0u) {
    let meta_idx = head * NUM_KV_CHUNKS + chunk;
    partial_meta[meta_idx] = vec2<f32>(running_max, running_denom);
  }
}
`]]}],["com.xenova.LlamaDecodeAttentionSplitKMerge",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeAttentionSplitKMerge",sinceVersion:1,inputs:[{role:"PartialOut",dtype:"float32",rank:1},{role:"PartialMeta",dtype:"float32",rank:1}],outputs:[{role:"Attn",dtype:"O",rank:1,shape:["args.numHeads * args.headDim"]}],typeConstraints:{O:["float32","float16"]},args:{partialOutT:{kind:"tensor",semantic:"PartialOut",role:"input"},partialMetaT:{kind:"tensor",semantic:"PartialMeta",role:"input"},attnT:{kind:"tensor",semantic:"Attn",role:"output"},numHeads:{kind:"u32",semantic:"num_heads"},headDim:{kind:"u32",semantic:"head_dim"},numKvChunks:{kind:"u32",semantic:"num_kv_chunks"}},variants:[{id:"merge",priority:0,when:["ranks.partialOutT == 1","ranks.partialMetaT == 1","ranks.attnT == 1",'tensorDtypes.partialOutT == "float32"','tensorDtypes.partialMetaT == "float32"','(tensorDtypes.attnT == "float32" or tensorDtypes.attnT == "float16")','(tensorDtypes.attnT != "float16" or device.features.has("shader-f16"))',"args.numHeads > 0","args.headDim > 0","args.numKvChunks > 0","(args.headDim == 4 or args.headDim == 8 or args.headDim == 16 or args.headDim == 32 or args.headDim == 64 or args.headDim == 128 or args.headDim == 256)","dim(shapes.partialOutT, 0) == args.numHeads * args.numKvChunks * args.headDim","dim(shapes.partialMetaT, 0) == args.numHeads * args.numKvChunks * 2","dim(shapes.attnT, 0) == args.numHeads * args.headDim"],constants:{usesF16:'tensorDtypes.attnT == "float16"',useSubgroups:'device.features.has("subgroups")',outScalar:"dtypes.O",numHeads:"args.numHeads",headDim:"args.headDim",numKvChunks:"args.numKvChunks",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeAttentionSplitKMerge",source:{kind:"template",shader:"decode-flash-attention-merge.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"partial_out",arg:"partialOutT",semantic:"PartialOut",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"partial_meta",arg:"partialMetaT",semantic:"PartialMeta",role:"input",buffer:{type:"read-only-storage"},elementType:"vec2<f32>"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"output",buffer:{type:"storage"},elementType:"$outScalar"}],dispatch:{x:"args.numHeads",y:1,z:1},reads:["PartialOut","PartialMeta"],writes:["Attn"]}]}]},assets:[["decode-flash-attention-merge.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const NUM_HEADS: u32 = {{ numHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const NUM_KV_CHUNKS: u32 = {{ numKvChunks }}u;
const F32_MIN: f32 = {{ f32Min }};

fn exp_fast(value: f32) -> f32 {
  return exp2(value * 1.4426950408889634);
}

fn store_attn(value: f32) -> {{ outScalar }} {
  return {{ outScalar }}(value);
}

@compute @workgroup_size({{ headDim }})
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let head = wid.x;
  let lid = lid3.x;
  if (head >= NUM_HEADS) {
    return;
  }

  var global_max = F32_MIN;
  for (var c = 0u; c < NUM_KV_CHUNKS; c = c + 1u) {
    let m = partial_meta[head * NUM_KV_CHUNKS + c].x;
    global_max = max(global_max, m);
  }

  var combined_output = 0.0;
  var combined_denom = 0.0;
  for (var c = 0u; c < NUM_KV_CHUNKS; c = c + 1u) {
    let chunk_meta = partial_meta[head * NUM_KV_CHUNKS + c];
    let m = chunk_meta.x;
    let d = chunk_meta.y;
    if (d > 0.0) {
      let rescale = exp_fast(m - global_max);
      let partial = partial_out[(head * NUM_KV_CHUNKS + c) * HEAD_DIM + lid];
      combined_output = combined_output + rescale * partial;
      combined_denom = combined_denom + rescale * d;
    }
  }
  let denom = max(combined_denom, 1.0e-20);
  attn_out[head * HEAD_DIM + lid] = store_attn(combined_output / denom);
}
`]]}],["com.xenova.LlamaDecodeBestArgmax",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeBestArgmax",sinceVersion:1,inputs:[{role:"BestValues",dtype:"float32",rank:1},{role:"BestIds",dtype:"uint32",rank:1}],outputs:[{role:"Output",dtype:"uint32",rank:1,shape:[1]}],args:{bestValuesT:{kind:"tensor",semantic:"BestValues",role:"input"},bestIdsT:{kind:"tensor",semantic:"BestIds",role:"input"},outputT:{kind:"tensor",semantic:"Output",role:"output"},outputOffset:{kind:"u32",semantic:"output_offset",required:!1},workgroupSize:{kind:"u32",semantic:"workgroup_size"},inputCount:{kind:"u32",semantic:"input_count",required:!1}},variants:[{id:"reduce",priority:0,when:["ranks.bestValuesT == 1","ranks.bestIdsT == 1","ranks.outputT == 1",'tensorDtypes.bestValuesT == "float32"','tensorDtypes.bestIdsT == "uint32"','tensorDtypes.outputT == "uint32"',"args.workgroupSize > 0","args.workgroupSize <= 256","(args.workgroupSize == 1 or args.workgroupSize == 2 or args.workgroupSize == 4 or args.workgroupSize == 8 or args.workgroupSize == 16 or args.workgroupSize == 32 or args.workgroupSize == 64 or args.workgroupSize == 128 or args.workgroupSize == 256)","(args.inputCount if args.inputCount else args.workgroupSize) > 0","(args.inputCount if args.inputCount else args.workgroupSize) <= dim(shapes.bestValuesT, 0)","dim(shapes.bestIdsT, 0) >= (args.inputCount if args.inputCount else args.workgroupSize)","dim(shapes.outputT, 0) > (args.outputOffset if args.outputOffset else 0)"],constants:{workgroupSize:"args.workgroupSize",inputCount:"args.inputCount if args.inputCount else args.workgroupSize",outputOffset:"args.outputOffset if args.outputOffset else 0",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeBestArgmax",shader:"decode-best-argmax.wgsl.jinja",bindings:[{name:"best_values_in",arg:"bestValuesT",semantic:"BestValues",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"best_ids_in",arg:"bestIdsT",semantic:"BestIds",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"output",arg:"outputT",semantic:"Output",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1,y:1,z:1},reads:["BestValues","BestIds"],writes:["Output"]}]}]},assets:[["decode-best-argmax.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

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
`]]}],["com.xenova.LlamaDecodeConvDepthwise",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeConvDepthwise",sinceVersion:1,inputs:[{role:"ConvProj",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"ConvStates",dtype:"float32",rank:1}],outputs:[{role:"ConvStates",dtype:"float32",rank:1,shape:["args.hiddenSize * args.convLCache"]},{role:"ConvY",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{W:["float32","float16"]},args:{convProjT:{kind:"tensor",semantic:"ConvProj",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},convStatesT:{kind:"tensor",semantic:"ConvStates",role:"inout"},convYT:{kind:"tensor",semantic:"ConvY",role:"output"},layer:{kind:"u32",semantic:"layer"},hiddenSize:{kind:"u32",semantic:"hidden_size"},convLCache:{kind:"u32",semantic:"conv_l_cache"},convWeightOffset:{kind:"u32",semantic:"conv_weight_offset"}},variants:[{id:"main",priority:0,when:["ranks.convProjT == 1","ranks.weightsT == 1","ranks.convStatesT == 1","ranks.convYT == 1",'tensorDtypes.convProjT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.convStatesT == "float32"','tensorDtypes.convYT == "float32"','(tensorDtypes.weightsT != "float16" or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.convLCache > 0","args.convWeightOffset % 4 == 0","dim(shapes.convProjT, 0) == 3 * args.hiddenSize","dim(shapes.convYT, 0) == args.hiddenSize","dim(shapes.convStatesT, 0) >= (args.layer + 1) * args.hiddenSize * args.convLCache","dim(shapes.weightsT, 0) >= args.convWeightOffset + args.hiddenSize * args.convLCache"],constants:{usesF16:'tensorDtypes.weightsT == "float16"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',layer:"args.layer",hiddenSize:"args.hiddenSize",convLCache:"args.convLCache",convWeightOffsetVec4:"args.convWeightOffset / 4"},passes:[{id:"main",name:"LlamaDecodeConvDepthwise",shader:"decode-conv-depthwise.wgsl.jinja",bindings:[{name:"conv_proj",arg:"convProjT",semantic:"ConvProj",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"conv_states",arg:"convStatesT",semantic:"ConvStates",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"conv_y",arg:"convYT",semantic:"ConvY",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"ceil(args.hiddenSize / 256)",y:1,z:1},reads:["ConvProj","Weights","ConvStates"],writes:["ConvStates","ConvY"]}]}]},assets:[["decode-conv-depthwise.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const CONV_L_CACHE: u32 = {{ convLCache }}u;
const W_CONV_VEC4: u32 = {{ convWeightOffsetVec4 }}u; // conv depthwise weight (dense f16/f32)

fn state_index(dim: u32, tap: u32) -> u32 {
  return (LAYER * HIDDEN_SIZE + dim) * CONV_L_CACHE + tap;
}

fn conv_weight(dim: u32, tap: u32) -> f32 {
  let packed = vec4<f32>(weights[W_CONV_VEC4 + (dim * CONV_L_CACHE + tap) / 4u]);
  let lane = (dim * CONV_L_CACHE + tap) % 4u;
  if (lane == 0u) { return packed.x; }
  if (lane == 1u) { return packed.y; }
  if (lane == 2u) { return packed.z; }
  return packed.w;
}

// LFM2 short-conv depthwise + gating tail. The in_proj GEMV (decode-conv-in-proj-norm-q4) has
// already written the rms-scaled B|C|x gates to conv_proj ([B(hidden) | C(hidden) | x(hidden)]).
// One thread per channel computes bx = B*x, the causal depthwise conv over the per-channel state
// (newest tap holds the current bx), shifts the state, and gates by C. Cheap and memory-light, so it
// runs as its own pass with no cooperation/reduction \u2014 one lane per channel, all lanes busy.
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let dim_out = gid.x;
  if (dim_out >= HIDDEN_SIZE) {
    return;
  }

  let proj_b = conv_proj[dim_out];
  let proj_c = conv_proj[HIDDEN_SIZE + dim_out];
  let proj_x = conv_proj[2u * HIDDEN_SIZE + dim_out];

  let bx = proj_b * proj_x;
  var conv_out = bx * conv_weight(dim_out, CONV_L_CACHE - 1u);
  for (var tap = 0u; tap + 1u < CONV_L_CACHE; tap = tap + 1u) {
    let next = conv_states[state_index(dim_out, tap + 1u)];
    conv_states[state_index(dim_out, tap)] = next;
    conv_out = fma(next, conv_weight(dim_out, tap), conv_out);
  }
  conv_states[state_index(dim_out, CONV_L_CACHE - 1u)] = bx;
  conv_y[dim_out] = proj_c * conv_out;
}
`]]}],["com.xenova.LlamaDecodeConvInProjNormQ4",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeConvInProjNormQ4",sinceVersion:1,inputs:[{role:"Hidden",dtype:"H",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1},{role:"Q4Scales",dtype:"S",rank:1},{role:"NormWeights",dtype:"W",rank:1}],outputs:[{role:"ConvProj",dtype:"float32",rank:1,shape:["3 * args.hiddenSize"]}],typeConstraints:{H:["float32","float16"],S:["float32","float16"],W:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights"},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights"},weightsT:{kind:"tensor",semantic:"NormWeights",role:"weights"},convProjT:{kind:"tensor",semantic:"ConvProj",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"input_norm_offset"},convInOffset:{kind:"u32",semantic:"conv_in_q4_block_offset"},quantBits:{kind:"u32",semantic:"packed_quant_bits"},hasMin:{kind:"u32",semantic:"kquant_has_min",required:!1}},variants:[{id:"q4",priority:0,when:["ranks.hiddenT == 1","ranks.q4BitsT == 1","ranks.q4ScalesT == 1","ranks.weightsT == 1","ranks.convProjT == 1",'(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','tensorDtypes.q4BitsT == "uint32"','(tensorDtypes.q4ScalesT == "float32" or tensorDtypes.q4ScalesT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.convProjT == "float32"','((tensorDtypes.hiddenT != "float16" and tensorDtypes.q4ScalesT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 32 == 0","args.normOffset % 4 == 0","(args.quantBits == 4 or args.quantBits == 8)","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.convProjT, 0) == 3 * args.hiddenSize","dim(shapes.weightsT, 0) >= args.normOffset + args.hiddenSize","dim(shapes.q4BitsT, 0) >= (args.convInOffset + 3 * args.hiddenSize * (args.hiddenSize / 32)) * args.quantBits","dim(shapes.q4ScalesT, 0) >= (args.convInOffset + 3 * args.hiddenSize * (args.hiddenSize / 32)) * (2 if args.hasMin else 1)"],constants:{useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',usesF16:'tensorDtypes.hiddenT == "float16" or tensorDtypes.q4ScalesT == "float16" or tensorDtypes.weightsT == "float16"',scaleScalar:"dtypes.S",hiddenVec4:'"vec4<f16>" if tensorDtypes.hiddenT == "float16" else "vec4<f32>"',normWeightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",blocksPerRow:"args.hiddenSize / 32",totalOutputs:"3 * args.hiddenSize",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4",convInOffset:"args.convInOffset",quantBits:"args.quantBits",hasMin:"args.hasMin if args.hasMin else 0"},passes:[{id:"main",name:"LlamaDecodeConvInProjNormQ4",shader:"decode-conv-in-proj-norm-q4.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"norm_weight",arg:"weightsT",semantic:"NormWeights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$normWeightVec4"},{name:"conv_proj",arg:"convProjT",semantic:"ConvProj",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"3 * args.hiddenSize",y:1,z:1},reads:["Hidden","Q4Bits","Q4Scales","NormWeights"],writes:["ConvProj"]}]}]},assets:[["decode-conv-in-proj-norm-q4.wgsl.jinja",`{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const BPR: u32 = {{ blocksPerRow }}u;          // Q4_0 blocks per weight row (hidden / 32)
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u; // 3 * hidden (B | C | x rows of conv in_proj)
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const W_IN_Q4: u32 = {{ convInOffset }}u;
const WORKGROUP_SIZE: u32 = 32u;

{%- if not useSubgroups %}
var<workgroup> partials: array<f32, 32>;
var<workgroup> partials_ss: array<f32, 32>;
{% endif %}

{%- if quantBits == 8 %}
// Q8_0 dequant: a u32 word holds 4 signed int8 in contiguous element order (one block = 32 elements
// = 2 vec4<u32>); dequant = q (scale applied once per block by the caller).
fn q8dot(word: u32, xv: vec4<f32>) -> f32 {
  return dot(vec4<f32>(unpack4xI8(word)), xv);
}
{%- else %}
fn q4_lo(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8(word & 0x0F0F0F0Fu)) - 8.0;
}
fn q4_hi(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8((word >> 4u) & 0x0F0F0F0Fu)) - 8.0;
}
fn q4wp(word: u32, lo: vec4<f32>, hi: vec4<f32>) -> f32 {
  return dot(lo, q4_lo(word)) + dot(hi, q4_hi(word));
}
{%- endif %}

// Fused input RMSNorm + LFM2 conv in_proj GEMV (Q4_0). The conv in_proj is [3*hidden, hidden]
// (B | C | x rows); this computes one rms-scaled output row per workgroup over the concatenated
// 3*hidden space and writes B/C/x to the conv_proj scratch \u2014 high parallelism (3*hidden workgroups,
// like gate/up), unlike the single-channel-per-workgroup fused kernel. The cheap nonlinear
// depthwise+gating runs as a separate pass (decode-conv-depthwise) over conv_proj. The RMS scale
// is a per-token scalar that factors out of the linear GEMV (GEMV on hidden*norm_weight, accumulate
// sum(hidden^2), apply inverseSqrt(ss/H+eps) at the end). One subgroupAdd reduces each row.
@compute @workgroup_size(32)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let index = wid.x;
  let lid = lid3.x;
  if (index >= TOTAL_OUTPUTS) {
    return;
  }
  let row_block_base = W_IN_Q4 + index * BPR;

  var acc = 0.0;
  var ss = 0.0;
  for (var b = lid; b < BPR; b = b + WORKGROUP_SIZE) {
    let hbase = b * 8u;
    let h0 = vec4<f32>(hidden[hbase]);
    let h1 = vec4<f32>(hidden[hbase + 1u]);
    let h2 = vec4<f32>(hidden[hbase + 2u]);
    let h3 = vec4<f32>(hidden[hbase + 3u]);
    let h4 = vec4<f32>(hidden[hbase + 4u]);
    let h5 = vec4<f32>(hidden[hbase + 5u]);
    let h6 = vec4<f32>(hidden[hbase + 6u]);
    let h7 = vec4<f32>(hidden[hbase + 7u]);
    ss = ss + dot(h0, h0) + dot(h1, h1) + dot(h2, h2) + dot(h3, h3) +
      dot(h4, h4) + dot(h5, h5) + dot(h6, h6) + dot(h7, h7);

    let nb = W_NORM_VEC4 + hbase;
    let n0 = h0 * vec4<f32>(norm_weight[nb]);
    let n1 = h1 * vec4<f32>(norm_weight[nb + 1u]);
    let n2 = h2 * vec4<f32>(norm_weight[nb + 2u]);
    let n3 = h3 * vec4<f32>(norm_weight[nb + 3u]);
    let n4 = h4 * vec4<f32>(norm_weight[nb + 4u]);
    let n5 = h5 * vec4<f32>(norm_weight[nb + 5u]);
    let n6 = h6 * vec4<f32>(norm_weight[nb + 6u]);
    let n7 = h7 * vec4<f32>(norm_weight[nb + 7u]);

    let scale = f32(q4_scales[{% if hasMin %}(row_block_base + b) * 2u{% else %}row_block_base + b{% endif %}]);
{%- if hasMin %}
    let bias = f32(q4_scales[(row_block_base + b) * 2u + 1u]);
    let sn = dot(n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7, vec4<f32>(1.0));
    let words = q4_bits[row_block_base + b];
    acc = acc + scale * (
      q4wp(words.x, n0, n4) + q4wp(words.y, n1, n5) + q4wp(words.z, n2, n6) + q4wp(words.w, n3, n7)) + bias * sn;
{%- elif quantBits == 8 %}
    let w0 = q4_bits[(row_block_base + b) * 2u];
    let w1 = q4_bits[(row_block_base + b) * 2u + 1u];
    acc = acc + scale * (
      q8dot(w0.x, n0) + q8dot(w0.y, n1) + q8dot(w0.z, n2) + q8dot(w0.w, n3) +
      q8dot(w1.x, n4) + q8dot(w1.y, n5) + q8dot(w1.z, n6) + q8dot(w1.w, n7));
{%- else %}
    let words = q4_bits[row_block_base + b];
    acc = acc + scale * (
      q4wp(words.x, n0, n4) + q4wp(words.y, n1, n5) + q4wp(words.z, n2, n6) + q4wp(words.w, n3, n7));
{%- endif %}
  }

{%- if useSubgroups %}
  let acc_total = subgroupAdd(acc);
  let ss_total = subgroupAdd(ss);
{% else %}
  partials[lid] = acc;
  partials_ss[lid] = ss;
  workgroupBarrier();
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = partials[lid] + partials[lid + stride];
      partials_ss[lid] = partials_ss[lid] + partials_ss[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) { break; }
    stride = stride / 2u;
  }
  let acc_total = partials[0];
  let ss_total = partials_ss[0];
{% endif %}

  if (lid == 0u) {
    conv_proj[index] = acc_total * inverseSqrt(ss_total / f32(HIDDEN_SIZE) + RMS_EPS);
  }
}
`]]}],["com.xenova.LlamaDecodeConvInUpdate",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeConvInUpdate",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"ConvStates",dtype:"float32",rank:1}],outputs:[{role:"ConvStates",dtype:"float32",rank:1,shape:["args.hiddenSize * args.convLCache"]},{role:"ConvY",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{N:["float32","float16"],W:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},convStatesT:{kind:"tensor",semantic:"ConvStates",role:"inout"},convYT:{kind:"tensor",semantic:"ConvY",role:"output"},layer:{kind:"u32",semantic:"layer"},hiddenSize:{kind:"u32",semantic:"hidden_size"},convLCache:{kind:"u32",semantic:"conv_l_cache"},convInOffset:{kind:"u32",semantic:"conv_in_offset"},convWeightOffset:{kind:"u32",semantic:"conv_weight_offset"}},variants:[{id:"dense",priority:0,when:["ranks.normedT == 1","ranks.weightsT == 1","ranks.convStatesT == 1","ranks.convYT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.convStatesT == "float32"','tensorDtypes.convYT == "float32"','((tensorDtypes.normedT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.convLCache > 0","args.convInOffset % 4 == 0","args.convWeightOffset % 4 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.convYT, 0) == args.hiddenSize","dim(shapes.convStatesT, 0) >= (args.layer + 1) * args.hiddenSize * args.convLCache","dim(shapes.weightsT, 0) >= max(args.convInOffset + 3 * args.hiddenSize * args.hiddenSize, args.convWeightOffset + args.hiddenSize * args.convLCache)"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.weightsT == "float16"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",layer:"args.layer",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",convLCache:"args.convLCache",convInOffsetVec4:"args.convInOffset / 4",convWeightOffsetVec4:"args.convWeightOffset / 4"},passes:[{id:"main",name:"LlamaDecodeConvInUpdate",shader:"decode-conv-in-update.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"conv_states",arg:"convStatesT",semantic:"ConvStates",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"conv_y",arg:"convYT",semantic:"ConvY",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"args.hiddenSize",y:1,z:1},reads:["Normed","Weights","ConvStates"],writes:["ConvStates","ConvY"]}]}]},assets:[["decode-conv-in-update.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const CONV_L_CACHE: u32 = {{ convLCache }}u;
const W_IN_VEC4: u32 = {{ convInOffsetVec4 }}u;
const W_CONV_VEC4: u32 = {{ convWeightOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 32u;

var<workgroup> partials0: array<f32, 32>;
var<workgroup> partials1: array<f32, 32>;
var<workgroup> partials2: array<f32, 32>;

fn state_index(dim: u32, tap: u32) -> u32 {
  return (LAYER * HIDDEN_SIZE + dim) * CONV_L_CACHE + tap;
}

fn load_normed(value: {{ normedVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

fn conv_weight(dim: u32, tap: u32) -> f32 {
  let packed = vec4<f32>(weights[W_CONV_VEC4 + (dim * CONV_L_CACHE + tap) / 4u]);
  let lane = (dim * CONV_L_CACHE + tap) % 4u;
  if (lane == 0u) {
    return packed.x;
  }
  if (lane == 1u) {
    return packed.y;
  }
  if (lane == 2u) {
    return packed.z;
  }
  return packed.w;
}

fn dot_weight(x: vec4<f32>, w: {{ weightVec4 }}) -> f32 {
  {%- if weightScalar == "f16" %}
  return f32(dot(vec4<f16>(x), w));
  {%- else %}
  return dot(x, w);
  {%- endif %}
}

fn reduce_three(lid: u32, acc0: f32, acc1: f32, acc2: f32) {
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials2[lid] = acc2;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials2[lid] = partials2[lid] + partials2[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
}

@compute @workgroup_size(32)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let dim_out = wid.x;
  let lid = lid3.x;
  if (dim_out >= HIDDEN_SIZE) {
    return;
  }

  let weight_base_b = W_IN_VEC4 + dim_out * HIDDEN_SIZE_VEC4;
  let weight_base_c = W_IN_VEC4 + (HIDDEN_SIZE + dim_out) * HIDDEN_SIZE_VEC4;
  let weight_base_x = W_IN_VEC4 + (2u * HIDDEN_SIZE + dim_out) * HIDDEN_SIZE_VEC4;
  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let x = load_normed(normed[dim]);
    acc0 = acc0 + dot_weight(x, weights[weight_base_b + dim]);
    acc1 = acc1 + dot_weight(x, weights[weight_base_c + dim]);
    acc2 = acc2 + dot_weight(x, weights[weight_base_x + dim]);
  }
  reduce_three(lid, acc0, acc1, acc2);

  if (lid == 0u) {
    let bx = partials0[0] * partials2[0];
    var conv_out = bx * conv_weight(dim_out, CONV_L_CACHE - 1u);
    for (var tap = 0u; tap + 1u < CONV_L_CACHE; tap = tap + 1u) {
      let next = conv_states[state_index(dim_out, tap + 1u)];
      conv_states[state_index(dim_out, tap)] = next;
      conv_out = fma(next, conv_weight(dim_out, tap), conv_out);
    }
    conv_states[state_index(dim_out, CONV_L_CACHE - 1u)] = bx;
    conv_y[dim_out] = partials1[0] * conv_out;
  }
}
`]]}],["com.xenova.LlamaDecodeDownProj",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeDownProj",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"Intermediate",dtype:"I",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],tunables:{OUTPUTS_PER_WG:2},typeConstraints:{W:["float32","float16"],I:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},downOffset:{kind:"u32",semantic:"down_proj_offset"}},variants:[{id:"dense",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.intermediateT == 1",'tensorDtypes.hiddenT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.weightsT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.intermediateSize > 0","args.intermediateSize % 4 == 0","args.downOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.weightsT, 0) >= args.downOffset + args.hiddenSize * args.intermediateSize"],constants:{usesF16:'tensorDtypes.weightsT == "float16" or tensorDtypes.intermediateT == "float16"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",intermediateVec4:'"vec4<f16>" if tensorDtypes.intermediateT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",intermediateSize:"args.intermediateSize",intermediateSizeVec4:"args.intermediateSize / 4",downOffsetVec4:"args.downOffset / 4",outputsPerWg:"tunables.OUTPUTS_PER_WG",assumeFullBlocks:"args.hiddenSize % tunables.OUTPUTS_PER_WG == 0"},passes:[{id:"main",name:"LlamaDecodeDownProj",shader:"decode-down-proj.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"input",buffer:{type:"read-only-storage"},elementType:"$intermediateVec4"}],dispatch:{x:"ceilDiv(args.hiddenSize, tunables.OUTPUTS_PER_WG)",y:1,z:1},reads:["Hidden","Weights","Intermediate"],writes:["Hidden"]}]}]},assets:[["decode-down-proj.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

{%- if not assumeFullBlocks %}
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
{%- endif %}
const INTERMEDIATE_SIZE_VEC4: u32 = {{ intermediateSizeVec4 }}u;
const W_DOWN_VEC4: u32 = {{ downOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;
// Output rows computed per workgroup. Each thread reads the shared intermediate (activation)
// vec4 once per k-step and dots it against N_ROWS contiguous weight rows, so the activation
// re-read and the workgroup/reduction count both drop by N_ROWS.
const N_ROWS: u32 = {{ outputsPerWg }}u;

var<workgroup> partials: array<f32, WORKGROUP_SIZE * N_ROWS>;

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let dim0 = wid.x * N_ROWS;
  let lid = lid3.x;
{%- if not assumeFullBlocks %}
  if (dim0 >= HIDDEN_SIZE) {
    return;
  }
{%- endif %}

  var acc: array<f32, N_ROWS>;
  for (var n = 0u; n < N_ROWS; n = n + 1u) {
    acc[n] = 0.0;
  }

  for (var j = lid; j < INTERMEDIATE_SIZE_VEC4; j = j + WORKGROUP_SIZE) {
    let x = vec4<f32>(intermediate[j]);
{%- if weightScalar == "f16" %}
    let xh = vec4<f16>(x);
    for (var n = 0u; n < N_ROWS; n = n + 1u) {
{%- if not assumeFullBlocks %}
      if (dim0 + n < HIDDEN_SIZE) {
{%- endif %}
        acc[n] = acc[n] + f32(dot(xh, weights[W_DOWN_VEC4 + (dim0 + n) * INTERMEDIATE_SIZE_VEC4 + j]));
{%- if not assumeFullBlocks %}
      }
{%- endif %}
    }
{%- else %}
    for (var n = 0u; n < N_ROWS; n = n + 1u) {
{%- if not assumeFullBlocks %}
      if (dim0 + n < HIDDEN_SIZE) {
{%- endif %}
        acc[n] = acc[n] + dot(x, weights[W_DOWN_VEC4 + (dim0 + n) * INTERMEDIATE_SIZE_VEC4 + j]);
{%- if not assumeFullBlocks %}
      }
{%- endif %}
    }
{%- endif %}
  }

  for (var n = 0u; n < N_ROWS; n = n + 1u) {
    partials[lid * N_ROWS + n] = acc[n];
  }
  workgroupBarrier();

  // Tree reduction over the 64 lanes for all N_ROWS outputs at once (the 6 barriers are
  // shared across the rows, so each output costs a fraction of a reduction).
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      for (var n = 0u; n < N_ROWS; n = n + 1u) {
        partials[lid * N_ROWS + n] = partials[lid * N_ROWS + n] + partials[(lid + stride) * N_ROWS + n];
      }
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  // Lanes 0..N_ROWS-1 each emit one output row; partials[n] holds row n's total.
  if (lid < N_ROWS) {
    let dim = dim0 + lid;
{%- if not assumeFullBlocks %}
    if (dim < HIDDEN_SIZE) {
      hidden[dim] = hidden[dim] + partials[lid];
    }
{%- else %}
    hidden[dim] = hidden[dim] + partials[lid];
{%- endif %}
  }
}
`]]}],["com.xenova.LlamaDecodeDownProjQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeDownProjQ1",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1},{role:"Intermediate",dtype:"I",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{I:["float32","float16"],S:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},downOffset:{kind:"u32",semantic:"down_proj_q1_block_offset"}},variants:[{id:"q1",priority:0,when:["ranks.hiddenT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.intermediateT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.q1ScalesT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.intermediateSize > 0","args.intermediateSize % 128 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.q1BitsT, 0) >= (args.downOffset + args.hiddenSize * (args.intermediateSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.downOffset + args.hiddenSize * (args.intermediateSize / 128)"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16" or tensorDtypes.intermediateT == "float16"',useSubgroups:'device.features.has("subgroups")',intermediateVec4:'"vec4<f16>" if tensorDtypes.intermediateT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",intermediateSizeQ1Words:"args.intermediateSize / 32",blocksPerRow:"args.intermediateSize / 128",downOffset:"args.downOffset"},passes:[{id:"main",name:"LlamaDecodeDownProjQ1",source:{kind:"template",shader:"decode-down-proj-q1.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"input",buffer:{type:"read-only-storage"},elementType:"$intermediateVec4"}],dispatch:{x:"ceil(args.hiddenSize / 4)",y:1,z:1},reads:["Hidden","Q1Bits","Q1Scales","Intermediate"],writes:["Hidden"]}]}]},assets:[["decode-down-proj-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const INTERMEDIATE_SIZE_Q1_WORDS: u32 = {{ intermediateSizeQ1Words }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const W_DOWN_Q1: u32 = {{ downOffset }}u;
const WORKGROUP_SIZE: u32 = 64u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, 64>;
var<workgroup> partials1: array<f32, 64>;
var<workgroup> partials2: array<f32, 64>;
var<workgroup> partials3: array<f32, 64>;

fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}

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

@compute @workgroup_size(64)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let dim0 = wid.x * TILE_ROWS;
  let lid = lid3.x;
  if (dim0 >= HIDDEN_SIZE) {
    return;
  }

  let tile = dim0 / TILE_ROWS;
  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  for (var word_index = lid; word_index < INTERMEDIATE_SIZE_Q1_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
{%- if intermediateVec4 == "vec4<f32>" %}
    let v0 = intermediate[base4];
    let v1 = intermediate[base4 + 1u];
    let v2 = intermediate[base4 + 2u];
    let v3 = intermediate[base4 + 3u];
    let v4 = intermediate[base4 + 4u];
    let v5 = intermediate[base4 + 5u];
    let v6 = intermediate[base4 + 6u];
    let v7 = intermediate[base4 + 7u];
{%- else %}
    let v0 = vec4<f32>(intermediate[base4]);
    let v1 = vec4<f32>(intermediate[base4 + 1u]);
    let v2 = vec4<f32>(intermediate[base4 + 2u]);
    let v3 = vec4<f32>(intermediate[base4 + 3u]);
    let v4 = vec4<f32>(intermediate[base4 + 4u]);
    let v5 = vec4<f32>(intermediate[base4 + 5u]);
    let v6 = vec4<f32>(intermediate[base4 + 6u]);
    let v7 = vec4<f32>(intermediate[base4 + 7u]);
{%- endif %}
    let dot4 = q1_dot_word_t4(W_DOWN_Q1, tile, BPR, col_block, word_id, v0, v1, v2, v3, v4, v5, v6, v7);
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

  if (lid == 0u) {
    hidden[dim0 + 0u] = hidden[dim0 + 0u] + partials0[0];
    hidden[dim0 + 1u] = hidden[dim0 + 1u] + partials1[0];
    hidden[dim0 + 2u] = hidden[dim0 + 2u] + partials2[0];
    hidden[dim0 + 3u] = hidden[dim0 + 3u] + partials3[0];
  }
}
`]]}],["com.xenova.LlamaDecodeDownProjQ4",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeDownProjQ4",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1},{role:"Q4Scales",dtype:"S",rank:1},{role:"Intermediate",dtype:"I",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{S:["float32","float16"],I:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights"},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},downOffset:{kind:"u32",semantic:"down_proj_q4_block_offset"},quantBits:{kind:"u32",semantic:"packed_quant_bits"},hasMin:{kind:"u32",semantic:"kquant_has_min",required:!1}},variants:[{id:"q4",priority:0,when:["ranks.hiddenT == 1","ranks.q4BitsT == 1","ranks.q4ScalesT == 1","ranks.intermediateT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.q4BitsT == "uint32"','(tensorDtypes.q4ScalesT == "float32" or tensorDtypes.q4ScalesT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.q4ScalesT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.intermediateSize > 0","args.intermediateSize % 32 == 0","(args.quantBits == 4 or args.quantBits == 8)","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.q4BitsT, 0) >= (args.downOffset + args.hiddenSize * (args.intermediateSize / 32)) * args.quantBits","dim(shapes.q4ScalesT, 0) >= (args.downOffset + args.hiddenSize * (args.intermediateSize / 32)) * (2 if args.hasMin else 1)"],constants:{useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',usesF16:'tensorDtypes.q4ScalesT == "float16" or tensorDtypes.intermediateT == "float16"',scaleScalar:"dtypes.S",intermediateVec4:'"vec4<f16>" if tensorDtypes.intermediateT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",intermediateSize:"args.intermediateSize",blocksPerRow:"args.intermediateSize / 32",downOffset:"args.downOffset",quantBits:"args.quantBits",hasMin:"args.hasMin if args.hasMin else 0"},passes:[{id:"main",name:"LlamaDecodeDownProjQ4",shader:"decode-down-proj-q4.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"input",buffer:{type:"read-only-storage"},elementType:"$intermediateVec4"}],dispatch:{x:"args.hiddenSize",y:1,z:1},reads:["Hidden","Q4Bits","Q4Scales","Intermediate"],writes:["Hidden"]}]}]},assets:[["decode-down-proj-q4.wgsl.jinja",`{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const BPR: u32 = {{ blocksPerRow }}u;          // Q4_0 blocks per weight row (intermediate / 32)
const W_DOWN_Q4: u32 = {{ downOffset }}u;       // block offset of down_proj in the packed buffer
const WORKGROUP_SIZE: u32 = 32u;

{%- if not useSubgroups %}
var<workgroup> partials: array<f32, 32>;
{% endif %}

{%- if quantBits == 8 %}
// Q8_0 dequant: a u32 word holds 4 signed int8 in contiguous element order; dequant = q (scale
// applied once per block by the caller). One block = 32 elements = 2 vec4<u32> = 8 int8 words.
fn q8dot(word: u32, xv: vec4<f32>) -> f32 {
  return dot(vec4<f32>(unpack4xI8(word)), xv);
}
{%- else %}
// Q4_0 nibble dequant: a u32 word holds 4 low nibbles (byte k -> value k) and 4 high nibbles
// (byte k -> value k+16); dequant = nibble - 8 (scale applied once per block by the caller).
fn q4_lo(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8(word & 0x0F0F0F0Fu)) - 8.0;
}
fn q4_hi(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8((word >> 4u) & 0x0F0F0F0Fu)) - 8.0;
}
fn q4wp(word: u32, lo: vec4<f32>, hi: vec4<f32>) -> f32 {
  return dot(lo, q4_lo(word)) + dot(hi, q4_hi(word));
}
{%- endif %}

// down_proj GEMV with in-kernel Q4_0 dequant: one output (hidden) row per workgroup, threads
// stride over the row's 32-element blocks, dot the dequantized weights against the activation,
// reduce, and add into the residual. Mirrors decode-down-proj (f16) but reads packed weights.
// WG=32 = one subgroup so a single subgroupAdd reduces the row (no barrier tree).
@compute @workgroup_size(32)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let dim = wid.x;
  let lid = lid3.x;
  if (dim >= HIDDEN_SIZE) {
    return;
  }
  let row_block_base = W_DOWN_Q4 + dim * BPR;

  var acc = 0.0;
  for (var b = lid; b < BPR; b = b + WORKGROUP_SIZE) {
    let blk = row_block_base + b;
    let scale = f32(q4_scales[{% if hasMin %}blk * 2u{% else %}blk{% endif %}]);
    let hbase = b * 8u; // intermediate vec4 base for this block's 32 elements
    let x0 = vec4<f32>(intermediate[hbase]);
    let x1 = vec4<f32>(intermediate[hbase + 1u]);
    let x2 = vec4<f32>(intermediate[hbase + 2u]);
    let x3 = vec4<f32>(intermediate[hbase + 3u]);
    let x4 = vec4<f32>(intermediate[hbase + 4u]);
    let x5 = vec4<f32>(intermediate[hbase + 5u]);
    let x6 = vec4<f32>(intermediate[hbase + 6u]);
    let x7 = vec4<f32>(intermediate[hbase + 7u]);
{%- if hasMin %}
    let bias = f32(q4_scales[blk * 2u + 1u]); // Q4_K: scale=d1, bias=8*d1 - dmin*m (interleaved)
    let words = q4_bits[blk];
    let sa = dot(x0 + x1 + x2 + x3 + x4 + x5 + x6 + x7, vec4<f32>(1.0));
    acc = acc + scale * (
      q4wp(words.x, x0, x4) +
      q4wp(words.y, x1, x5) +
      q4wp(words.z, x2, x6) +
      q4wp(words.w, x3, x7)) + bias * sa;
{%- elif quantBits == 8 %}
    let w0 = q4_bits[blk * 2u];
    let w1 = q4_bits[blk * 2u + 1u];
    acc = acc + scale * (
      q8dot(w0.x, x0) + q8dot(w0.y, x1) + q8dot(w0.z, x2) + q8dot(w0.w, x3) +
      q8dot(w1.x, x4) + q8dot(w1.y, x5) + q8dot(w1.z, x6) + q8dot(w1.w, x7));
{%- else %}
    let words = q4_bits[blk];
    acc = acc + scale * (
      q4wp(words.x, x0, x4) +
      q4wp(words.y, x1, x5) +
      q4wp(words.z, x2, x6) +
      q4wp(words.w, x3, x7));
{%- endif %}
  }

{%- if useSubgroups %}
  let total = subgroupAdd(acc);
{% else %}
  partials[lid] = acc;
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
  let total = partials[0];
{% endif %}

  if (lid == 0u) {
    hidden[dim] = hidden[dim] + total;
  }
}
`]]}],["com.xenova.LlamaDecodeFinal",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeFinal",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"float32",rank:1}],outputs:[{role:"Logits",dtype:"float32",rank:1}],args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},outputT:{kind:"tensor",semantic:"Logits",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},finalNormOffset:{kind:"u32",semantic:"final_norm_offset"},lmHeadOffset:{kind:"u32",semantic:"lm_head_offset"}},variants:[{id:"logits_tiled",priority:10,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.outputT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.weightsT == "float32"','tensorDtypes.outputT == "float32"',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.vocabSize > 0","args.finalNormOffset % 4 == 0","args.lmHeadOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.outputT, 0) == args.vocabSize","dim(shapes.weightsT, 0) >= max(args.finalNormOffset + args.hiddenSize, args.lmHeadOffset + args.vocabSize * args.hiddenSize)"],constants:{hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",vocabSize:"args.vocabSize",rmsEps:"args.rmsEps",finalNormOffsetVec4:"args.finalNormOffset / 4",lmHeadOffsetVec4:"args.lmHeadOffset / 4",numBlocks:"256",unroll4:"(args.hiddenSize / 4) % 4 == 0"},passes:[{id:"main",name:"LlamaDecodeFinal",shader:"decode-final-logits-tiled.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"output",arg:"outputT",semantic:"Logits",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:256,y:1,z:1},reads:["Hidden","Weights"],writes:["Logits"]}]},{id:"logits",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.outputT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.weightsT == "float32"','tensorDtypes.outputT == "float32"',"args.hiddenSize > 0","args.vocabSize > 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.outputT, 0) == args.vocabSize","dim(shapes.weightsT, 0) >= max(args.finalNormOffset + args.hiddenSize, args.lmHeadOffset + args.vocabSize * args.hiddenSize)"],constants:{hiddenSize:"args.hiddenSize",vocabSize:"args.vocabSize",rmsEps:"args.rmsEps",wFinalNorm:"args.finalNormOffset",wLmHead:"args.lmHeadOffset"},passes:[{id:"main",name:"LlamaDecodeFinal",shader:"decode-final.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"output",arg:"outputT",semantic:"Logits",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:1,y:1,z:1},reads:["Hidden","Weights"],writes:["Logits"]}]}]},assets:[["decode-final-logits-tiled.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

// Grid-parallel logits projection: every workgroup cooperatively recomputes the
// (cheap) RMS norm of the 1xH hidden row, then the WORKGROUP_SIZE * NUM_BLOCKS
// threads stride over the vocabulary, each writing one logit as a vec4 dot over
// the H-wide hidden row.
const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_FINAL_NORM_VEC4: u32 = {{ finalNormOffsetVec4 }}u;
const W_LM_HEAD_VEC4: u32 = {{ lmHeadOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 256u;
const NUM_BLOCKS: u32 = {{ numBlocks }}u;

var<workgroup> norm_partials: array<f32, 256>;

fn hidden4(dim4: u32) -> vec4<f32> {
  let base = dim4 * 4u;
  return vec4<f32>(hidden[base], hidden[base + 1u], hidden[base + 2u], hidden[base + 3u]);
}

fn vocab_dot_part(dim: u32, scale: f32, weight_base: u32) -> f32 {
  let normed = hidden4(dim) * vec4<f32>(scale) * weights[W_FINAL_NORM_VEC4 + dim];
  return dot(normed, weights[weight_base + dim]);
}

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let block = wid.x;
  let lid = lid3.x;

  var sum = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE; dim = dim + WORKGROUP_SIZE) {
    let value = hidden[dim];
    sum = fma(value, value, sum);
  }
  norm_partials[lid] = sum;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      norm_partials[lid] = norm_partials[lid] + norm_partials[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
  let scale = inverseSqrt(norm_partials[0] / f32(HIDDEN_SIZE) + RMS_EPS);
  workgroupBarrier();

  for (var vocab = block * WORKGROUP_SIZE + lid; vocab < VOCAB_SIZE; vocab = vocab + WORKGROUP_SIZE * NUM_BLOCKS) {
    let weight_base = W_LM_HEAD_VEC4 + vocab * HIDDEN_SIZE_VEC4;
    var acc = 0.0;
    {%- if unroll4 %}
    for (var dim = 0u; dim < HIDDEN_SIZE_VEC4; dim = dim + 4u) {
      acc = acc + vocab_dot_part(dim, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 1u, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 2u, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 3u, scale, weight_base);
    }
    {%- else %}
    for (var dim = 0u; dim < HIDDEN_SIZE_VEC4; dim = dim + 1u) {
      acc = acc + vocab_dot_part(dim, scale, weight_base);
    }
    {%- endif %}
    output[vocab] = acc;
  }
}
`],["decode-final.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_FINAL_NORM: u32 = {{ wFinalNorm }}u;
const W_LM_HEAD: u32 = {{ wLmHead }}u;

@compute @workgroup_size(1)
fn main() {
  var normed: array<f32, {{ hiddenSize }}>;
  var variance = 0.0;
  for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
    let value = hidden[dim];
    variance = variance + value * value;
  }
  let scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);
  for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
    normed[dim] = hidden[dim] * scale * weights[W_FINAL_NORM + dim];
  }

  for (var vocab = 0u; vocab < VOCAB_SIZE; vocab = vocab + 1u) {
    var acc = 0.0;
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      acc = acc + normed[dim] * weights[W_LM_HEAD + vocab * HIDDEN_SIZE + dim];
    }
    output[vocab] = acc;
  }
}
`]]}],["com.xenova.LlamaDecodeFinalArgmax",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeFinalArgmax",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"float32",rank:1}],outputs:[{role:"Token",dtype:"uint32",rank:1}],args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},outputT:{kind:"tensor",semantic:"Token",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},finalNormOffset:{kind:"u32",semantic:"final_norm_offset"},lmHeadOffset:{kind:"u32",semantic:"lm_head_offset"}},variants:[{id:"argmax_tiled",priority:10,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.outputT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.weightsT == "float32"','tensorDtypes.outputT == "uint32"',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.vocabSize > 0","args.finalNormOffset % 4 == 0","args.lmHeadOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.outputT, 0) >= 1","dim(shapes.weightsT, 0) >= max(args.finalNormOffset + args.hiddenSize, args.lmHeadOffset + args.vocabSize * args.hiddenSize)"],constants:{hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",vocabSize:"args.vocabSize",rmsEps:"args.rmsEps",finalNormOffsetVec4:"args.finalNormOffset / 4",lmHeadOffsetVec4:"args.lmHeadOffset / 4",numBlocks:"256",unroll4:"(args.hiddenSize / 4) % 4 == 0",f32Min:'"-3.4028234663852886e38"'},intermediates:[{id:"block_values",dtype:"float32",shape:"[256]"},{id:"block_ids",dtype:"uint32",shape:"[256]"}],passes:[{id:"scan",name:"LlamaDecodeFinalArgmax.Scan",shader:"decode-final-argmax-scan.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"block_values",semantic:"block_values",role:"scratch",buffer:{type:"storage"},elementType:"f32"},{name:"block_ids",semantic:"block_ids",role:"scratch",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:256,y:1,z:1},reads:["Hidden","Weights"],writes:["block_values","block_ids"]},{id:"reduce",name:"LlamaDecodeFinalArgmax.Reduce",shader:"decode-final-argmax-reduce.wgsl.jinja",bindings:[{name:"block_values",semantic:"block_values",role:"scratch",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"block_ids",semantic:"block_ids",role:"scratch",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"output",arg:"outputT",semantic:"Token",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1,y:1,z:1},reads:["block_values","block_ids"],writes:["Token"]}]},{id:"argmax",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.outputT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.weightsT == "float32"','tensorDtypes.outputT == "uint32"',"args.hiddenSize > 0","args.vocabSize > 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.outputT, 0) >= 1","dim(shapes.weightsT, 0) >= max(args.finalNormOffset + args.hiddenSize, args.lmHeadOffset + args.vocabSize * args.hiddenSize)"],constants:{hiddenSize:"args.hiddenSize",vocabSize:"args.vocabSize",rmsEps:"args.rmsEps",wFinalNorm:"args.finalNormOffset",wLmHead:"args.lmHeadOffset",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeFinalArgmax",shader:"decode-final-argmax.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"output",arg:"outputT",semantic:"Token",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1,y:1,z:1},reads:["Hidden","Weights"],writes:["Token"]}]}]},assets:[["decode-final-argmax-reduce.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

// Pass 2 of the grid-parallel argmax: a single workgroup reduces the NUM_BLOCKS
// per-block (value, id) candidates from pass 1 down to the final winning token.
const NUM_BLOCKS: u32 = {{ numBlocks }}u;
const F32_MIN: f32 = {{ f32Min }};

var<workgroup> best_values: array<f32, 256>;
var<workgroup> best_indices: array<u32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_id) lid3: vec3<u32>) {
  let lid = lid3.x;
  if (lid < NUM_BLOCKS) {
    best_values[lid] = block_values[lid];
    best_indices[lid] = block_ids[lid];
  } else {
    best_values[lid] = F32_MIN;
    best_indices[lid] = 0u;
  }
  workgroupBarrier();

  var stride = 128u;
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
    output[0] = best_indices[0];
  }
}
`],["decode-final-argmax-scan.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

// Pass 1 of the grid-parallel argmax: NUM_BLOCKS workgroups each cooperatively
// recompute the RMS norm, then stride over the vocabulary computing logits via a
// vec4 dot and keep a per-block (best value, best id). Each block writes its
// winner to the block_values/block_ids scratch buffers.
const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_FINAL_NORM_VEC4: u32 = {{ finalNormOffsetVec4 }}u;
const W_LM_HEAD_VEC4: u32 = {{ lmHeadOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 256u;
const NUM_BLOCKS: u32 = {{ numBlocks }}u;
const F32_MIN: f32 = {{ f32Min }};

var<workgroup> norm_partials: array<f32, 256>;
var<workgroup> best_values: array<f32, 256>;
var<workgroup> best_indices: array<u32, 256>;

fn hidden4(dim4: u32) -> vec4<f32> {
  let base = dim4 * 4u;
  return vec4<f32>(hidden[base], hidden[base + 1u], hidden[base + 2u], hidden[base + 3u]);
}

fn vocab_dot_part(dim: u32, scale: f32, weight_base: u32) -> f32 {
  let normed = hidden4(dim) * vec4<f32>(scale) * weights[W_FINAL_NORM_VEC4 + dim];
  return dot(normed, weights[weight_base + dim]);
}

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let block = wid.x;
  let lid = lid3.x;

  var sum = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE; dim = dim + WORKGROUP_SIZE) {
    let value = hidden[dim];
    sum = fma(value, value, sum);
  }
  norm_partials[lid] = sum;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      norm_partials[lid] = norm_partials[lid] + norm_partials[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
  let scale = inverseSqrt(norm_partials[0] / f32(HIDDEN_SIZE) + RMS_EPS);
  workgroupBarrier();

  var best_token = 0u;
  var best_value = F32_MIN;
  for (var vocab = block * WORKGROUP_SIZE + lid; vocab < VOCAB_SIZE; vocab = vocab + WORKGROUP_SIZE * NUM_BLOCKS) {
    let weight_base = W_LM_HEAD_VEC4 + vocab * HIDDEN_SIZE_VEC4;
    var acc = 0.0;
    {%- if unroll4 %}
    for (var dim = 0u; dim < HIDDEN_SIZE_VEC4; dim = dim + 4u) {
      acc = acc + vocab_dot_part(dim, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 1u, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 2u, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 3u, scale, weight_base);
    }
    {%- else %}
    for (var dim = 0u; dim < HIDDEN_SIZE_VEC4; dim = dim + 1u) {
      acc = acc + vocab_dot_part(dim, scale, weight_base);
    }
    {%- endif %}
    if (acc > best_value) {
      best_value = acc;
      best_token = vocab;
    }
  }

  best_values[lid] = best_value;
  best_indices[lid] = best_token;
  workgroupBarrier();

  stride = WORKGROUP_SIZE / 2u;
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
    block_values[block] = best_values[0];
    block_ids[block] = best_indices[0];
  }
}
`],["decode-final-argmax.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_FINAL_NORM: u32 = {{ wFinalNorm }}u;
const W_LM_HEAD: u32 = {{ wLmHead }}u;
const WORKGROUP_SIZE: u32 = 256u;

var<workgroup> best_values: array<f32, 256>;
var<workgroup> best_indices: array<u32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_id) lid3: vec3<u32>) {
  let lid = lid3.x;
  var variance = 0.0;
  for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
    let value = hidden[dim];
    variance = variance + value * value;
  }
  let scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);

  var best_token = lid;
  var best_value = {{ f32Min }};
  for (var vocab = lid; vocab < VOCAB_SIZE; vocab = vocab + WORKGROUP_SIZE) {
    var acc = 0.0;
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      let normed = hidden[dim] * scale * weights[W_FINAL_NORM + dim];
      acc = acc + normed * weights[W_LM_HEAD + vocab * HIDDEN_SIZE + dim];
    }
    if (acc > best_value) {
      best_value = acc;
      best_token = vocab;
    }
  }

  best_values[lid] = best_value;
  best_indices[lid] = best_token;
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
    output[0] = best_indices[0];
  }
}
`]]}],["com.xenova.LlamaDecodeFinalNormLmHeadArgmaxTiled",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeFinalNormLmHeadArgmaxTiled",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"BestValues",dtype:"float32",rank:1,shape:["args.numBlocks"]},{role:"BestIds",dtype:"uint32",rank:1,shape:["args.numBlocks"]}],typeConstraints:{W:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},bestValuesT:{kind:"tensor",semantic:"BestValues",role:"output"},bestIdsT:{kind:"tensor",semantic:"BestIds",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},rmsEps:{kind:"f32",semantic:"rms_epsilon"},finalNormOffset:{kind:"u32",semantic:"final_norm_offset"},lmHeadOffset:{kind:"u32",semantic:"lm_head_offset"},numBlocks:{kind:"u32",semantic:"num_blocks",required:!1}},variants:[{id:"dense",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.bestValuesT == 1","ranks.bestIdsT == 1",'tensorDtypes.hiddenT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.bestValuesT == "float32"','tensorDtypes.bestIdsT == "uint32"','(tensorDtypes.weightsT != "float16" or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.vocabSize > 0","args.finalNormOffset % 4 == 0","args.lmHeadOffset % 4 == 0","(not args.numBlocks or args.numBlocks > 0)","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.bestValuesT, 0) >= (args.numBlocks if args.numBlocks else 256)","dim(shapes.bestIdsT, 0) >= (args.numBlocks if args.numBlocks else 256)","dim(shapes.weightsT, 0) >= max(args.finalNormOffset + args.hiddenSize, args.lmHeadOffset + args.vocabSize * args.hiddenSize)"],constants:{usesF16:'tensorDtypes.weightsT == "float16"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",vocabSize:"args.vocabSize",rmsEps:"args.rmsEps",finalNormOffsetVec4:"args.finalNormOffset / 4",lmHeadOffsetVec4:"args.lmHeadOffset / 4",numBlocks:"args.numBlocks if args.numBlocks else 256",unroll4:"(args.hiddenSize / 4) % 4 == 0",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeFinalNormLmHeadArgmaxTiled",shader:"decode-final-norm-lm-head-argmax-tiled.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"best_values_out",arg:"bestValuesT",semantic:"BestValues",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"best_ids_out",arg:"bestIdsT",semantic:"BestIds",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:"args.numBlocks if args.numBlocks else 256",y:1,z:1},reads:["Hidden","Weights"],writes:["BestValues","BestIds"]}]}]},assets:[["decode-final-norm-lm-head-argmax-tiled.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_FINAL_NORM_VEC4: u32 = {{ finalNormOffsetVec4 }}u;
const W_LM_HEAD_VEC4: u32 = {{ lmHeadOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 256u;
const NUM_BLOCKS: u32 = {{ numBlocks }}u;
const F32_MIN: f32 = {{ f32Min }};

var<workgroup> norm_partials: array<f32, 256>;
var<workgroup> best_values: array<f32, 256>;
var<workgroup> best_indices: array<u32, 256>;

fn hidden4(dim4: u32) -> vec4<f32> {
  let base = dim4 * 4u;
  return vec4<f32>(hidden[base], hidden[base + 1u], hidden[base + 2u], hidden[base + 3u]);
}

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let block = wid.x;
  let lid = lid3.x;

  var sum = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE; dim = dim + WORKGROUP_SIZE) {
    let value = hidden[dim];
    sum = fma(value, value, sum);
  }
  norm_partials[lid] = sum;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      norm_partials[lid] = norm_partials[lid] + norm_partials[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
  let scale = inverseSqrt(norm_partials[0] / f32(HIDDEN_SIZE) + RMS_EPS);
  workgroupBarrier();

  var best_token = 0u;
  var best_value = F32_MIN;

  for (var vocab = block * WORKGROUP_SIZE + lid; vocab < VOCAB_SIZE; vocab = vocab + WORKGROUP_SIZE * NUM_BLOCKS) {
    let weight_base = W_LM_HEAD_VEC4 + vocab * HIDDEN_SIZE_VEC4;
    var acc = 0.0;
    {%- if unroll4 %}
    for (var dim = 0u; dim < HIDDEN_SIZE_VEC4; dim = dim + 4u) {
      acc = acc + vocab_dot_part(dim, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 1u, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 2u, scale, weight_base);
      acc = acc + vocab_dot_part(dim + 3u, scale, weight_base);
    }
    {%- else %}
    for (var dim = 0u; dim < HIDDEN_SIZE_VEC4; dim = dim + 1u) {
      acc = acc + vocab_dot_part(dim, scale, weight_base);
    }
    {%- endif %}
    if (acc > best_value) {
      best_value = acc;
      best_token = vocab;
    }
  }

  best_values[lid] = best_value;
  best_indices[lid] = best_token;
  workgroupBarrier();

  stride = WORKGROUP_SIZE / 2u;
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
    best_values_out[block] = best_values[0];
    best_ids_out[block] = best_indices[0];
  }
}

fn vocab_dot_part(dim: u32, scale: f32, weight_base: u32) -> f32 {
  {%- if weightScalar == "f16" %}
  let normed = vec4<f16>(hidden4(dim) * vec4<f32>(scale)) * weights[W_FINAL_NORM_VEC4 + dim];
  return f32(dot(normed, weights[weight_base + dim]));
  {%- else %}
  let normed = hidden4(dim) * vec4<f32>(scale) * weights[W_FINAL_NORM_VEC4 + dim];
  return dot(normed, weights[weight_base + dim]);
  {%- endif %}
}
`]]}],["com.xenova.LlamaDecodeFinalNormQuantizeQ8",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeFinalNormQuantizeQ8",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"NormQ8",dtype:"uint32",rank:1},{role:"NormScale",dtype:"float32",rank:1}],typeConstraints:{W:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},normQ8T:{kind:"tensor",semantic:"NormQ8",role:"output"},normScaleT:{kind:"tensor",semantic:"NormScale",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},finalNormOffset:{kind:"u32",semantic:"final_norm_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.normQ8T == 1","ranks.normScaleT == 1",'tensorDtypes.hiddenT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.normQ8T == "uint32"','tensorDtypes.normScaleT == "float32"',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.finalNormOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.weightsT, 0) >= args.finalNormOffset + args.hiddenSize","dim(shapes.normQ8T, 0) == args.hiddenSize / 4","dim(shapes.normScaleT, 0) == 1",'(tensorDtypes.weightsT != "float16" or device.features.has("shader-f16"))'],constants:{usesF16:'tensorDtypes.weightsT == "float16"',wScalar:"dtypes.W",wVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",rmsEps:"args.rmsEps",wFinalNormVec4:"args.finalNormOffset / 4",weightLoad:'"vec4<f32>(weights[W_FINAL_NORM_VEC4 + dim])" if tensorDtypes.weightsT == "float16" else "weights[W_FINAL_NORM_VEC4 + dim]"'},passes:[{id:"main",name:"LlamaDecodeFinalNormQuantizeQ8",shader:"decode-final-norm-quantize-q8.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wVec4"},{name:"norm_q8",arg:"normQ8T",semantic:"NormQ8",role:"output",buffer:{type:"storage"},elementType:"u32"},{name:"norm_scale_out",arg:"normScaleT",semantic:"NormScale",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:1,y:1,z:1},reads:["Hidden","Weights"],writes:["NormQ8","NormScale"]}]}]},assets:[["decode-final-norm-quantize-q8.wgsl.jinja",`{% if usesF16 %}
enable f16;
{% endif %}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_FINAL_NORM_VEC4: u32 = {{ wFinalNormVec4 }}u;
const WORKGROUP_SIZE: u32 = 256u;

var<workgroup> partials: array<f32, 256>;

fn sum4(value: vec4<f32>) -> f32 {
  return value.x + value.y + value.z + value.w;
}

fn max4(value: vec4<f32>) -> f32 {
  return max(max(abs(value.x), abs(value.y)), max(abs(value.z), abs(value.w)));
}

fn quantize4(value: vec4<f32>, scale: f32) -> u32 {
  let q = vec4<i32>(round(clamp(value / vec4<f32>(scale), vec4<f32>(-127.0), vec4<f32>(127.0))));
  return pack4xI8(q);
}

fn reduce_sum(value: f32, lid: u32) -> f32 {
  partials[lid] = value;
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
  return partials[0];
}

fn reduce_max(value: f32, lid: u32) -> f32 {
  partials[lid] = value;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = max(partials[lid], partials[lid + stride]);
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
  return partials[0];
}

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_id) lid3: vec3<u32>) {
  let lid = lid3.x;
  var sum = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let value = hidden[dim];
    sum = sum + sum4(value * value);
  }
  let total_sum = reduce_sum(sum, lid);
  let rms_scale = inverseSqrt(total_sum / f32(HIDDEN_SIZE) + RMS_EPS);
  workgroupBarrier();

  var local_max = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let normed = hidden[dim] * vec4<f32>(rms_scale) * {{ weightLoad }};
    local_max = max(local_max, max4(normed));
  }
  let max_abs = reduce_max(local_max, lid);
  let q_scale = max(max_abs / 127.0, 1.0e-12);
  if (lid == 0u) {
    norm_scale_out[0] = q_scale;
  }
  workgroupBarrier();

  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let normed = hidden[dim] * vec4<f32>(rms_scale) * {{ weightLoad }};
    norm_q8[dim] = quantize4(normed, q_scale);
  }
}
`]]}],["com.xenova.LlamaDecodeGateUp",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeGateUp",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Intermediate",dtype:"I",rank:1,shape:["args.intermediateSize"]}],typeConstraints:{N:["float32","float16"],W:["float32","float16"],I:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},gateOffset:{kind:"u32",semantic:"gate_proj_offset"},upOffset:{kind:"u32",semantic:"up_proj_offset"}},variants:[{id:"dense",priority:0,when:["ranks.normedT == 1","ranks.weightsT == 1","ranks.intermediateT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.normedT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.intermediateSize > 0","args.gateOffset % 4 == 0","args.upOffset % 4 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.weightsT, 0) >= max(args.gateOffset + args.intermediateSize * args.hiddenSize, args.upOffset + args.intermediateSize * args.hiddenSize)"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.intermediateT == "float16"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",intermediateScalar:"dtypes.I",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",intermediateSize:"args.intermediateSize",gateOffsetVec4:"args.gateOffset / 4",upOffsetVec4:"args.upOffset / 4"},passes:[{id:"main",name:"LlamaDecodeGateUp",shader:"decode-gate-up.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"output",buffer:{type:"storage"},elementType:"$intermediateScalar"}],dispatch:{x:"args.intermediateSize",y:1,z:1},reads:["Normed","Weights"],writes:["Intermediate"]}]}]},assets:[["decode-gate-up.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const INTERMEDIATE_SIZE: u32 = {{ intermediateSize }}u;
const W_GATE_VEC4: u32 = {{ gateOffsetVec4 }}u;
const W_UP_VEC4: u32 = {{ upOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials0: array<f32, 64>;
var<workgroup> partials1: array<f32, 64>;

fn silu(x: f32) -> f32 {
  return x / (1.0 + exp(-x));
}

fn load_normed(value: {{ normedVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

fn store_intermediate(value: f32) -> {{ intermediateScalar }} {
  return {{ intermediateScalar }}(value);
}

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let j = wid.x;
  let lid = lid3.x;
  if (j >= INTERMEDIATE_SIZE) {
    return;
  }
  let gate_base = W_GATE_VEC4 + j * HIDDEN_SIZE_VEC4;
  let up_base = W_UP_VEC4 + j * HIDDEN_SIZE_VEC4;

  var acc0 = 0.0;
  var acc1 = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let n = load_normed(normed[dim]);
    {%- if weightScalar == "f16" %}
    acc0 = acc0 + f32(dot(vec4<f16>(n), weights[gate_base + dim]));
    acc1 = acc1 + f32(dot(vec4<f16>(n), weights[up_base + dim]));
    {%- else %}
    acc0 = acc0 + dot(n, weights[gate_base + dim]);
    acc1 = acc1 + dot(n, weights[up_base + dim]);
    {%- endif %}
  }
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  if (lid == 0u) {
    intermediate[j] = store_intermediate(silu(partials0[0]) * partials1[0]);
  }
}
`]]}],["com.xenova.LlamaDecodeGateUpNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeGateUpNorm",sinceVersion:1,inputs:[{role:"Hidden",dtype:"H",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Intermediate",dtype:"I",rank:1,shape:["args.intermediateSize"]}],typeConstraints:{H:["float32","float16"],W:["float32","float16"],I:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"post_attention_norm_offset"},gateOffset:{kind:"u32",semantic:"gate_proj_offset"},upOffset:{kind:"u32",semantic:"up_proj_offset"}},variants:[{id:"dense",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.intermediateT == 1",'(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.hiddenT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.intermediateSize > 0","args.normOffset % 4 == 0","args.gateOffset % 4 == 0","args.upOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.weightsT, 0) >= max(args.normOffset + args.hiddenSize, max(args.gateOffset + args.intermediateSize * args.hiddenSize, args.upOffset + args.intermediateSize * args.hiddenSize))"],constants:{usesF16:'tensorDtypes.hiddenT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.intermediateT == "float16"',hiddenVec4:'"vec4<f16>" if tensorDtypes.hiddenT == "float16" else "vec4<f32>"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",intermediateScalar:"dtypes.I",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",intermediateSize:"args.intermediateSize",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4",gateOffsetVec4:"args.gateOffset / 4",upOffsetVec4:"args.upOffset / 4"},passes:[{id:"main",name:"LlamaDecodeGateUpNorm",shader:"decode-gate-up-norm.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"output",buffer:{type:"storage"},elementType:"$intermediateScalar"}],dispatch:{x:"args.intermediateSize",y:1,z:1},reads:["Hidden","Weights"],writes:["Intermediate"]}]}]},assets:[["decode-gate-up-norm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const INTERMEDIATE_SIZE: u32 = {{ intermediateSize }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const W_GATE_VEC4: u32 = {{ gateOffsetVec4 }}u;
const W_UP_VEC4: u32 = {{ upOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;

// Fused post-attention RMSNorm + gate/up GEMV (decode, M == 1). The RMSNorm scale is a per-token
// scalar that factors out of the linear GEMV, so we GEMV on hidden*norm_weight, accumulate
// sum(hidden^2) in the same loop, and apply inverseSqrt(ss/H+eps) to the gate/up sums at the end.
// One output row per workgroup with a simple WG + tree reduction: the M==1 decode GEMV is already at
// its achievable peak for this access pattern.
var<workgroup> partials0: array<f32, 64>;
var<workgroup> partials1: array<f32, 64>;
var<workgroup> partials_ss: array<f32, 64>;

fn silu(x: f32) -> f32 {
  return x / (1.0 + exp(-x));
}

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let j = wid.x;
  let lid = lid3.x;
  if (j >= INTERMEDIATE_SIZE) {
    return;
  }
  let gate_base = W_GATE_VEC4 + j * HIDDEN_SIZE_VEC4;
  let up_base = W_UP_VEC4 + j * HIDDEN_SIZE_VEC4;

  var acc0 = 0.0;
  var acc1 = 0.0;
  var ss = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let h = vec4<f32>(hidden[dim]);
    ss = ss + dot(h, h);
    let n = h * vec4<f32>(weights[W_NORM_VEC4 + dim]);
    {%- if weightScalar == "f16" %}
    let nh = vec4<f16>(n);
    acc0 = acc0 + f32(dot(nh, weights[gate_base + dim]));
    acc1 = acc1 + f32(dot(nh, weights[up_base + dim]));
    {%- else %}
    acc0 = acc0 + dot(n, weights[gate_base + dim]);
    acc1 = acc1 + dot(n, weights[up_base + dim]);
    {%- endif %}
  }
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials_ss[lid] = ss;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials_ss[lid] = partials_ss[lid] + partials_ss[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  if (lid == 0u) {
    let scale = inverseSqrt(partials_ss[0] / f32(HIDDEN_SIZE) + RMS_EPS);
    intermediate[j] = {{ intermediateScalar }}(silu(partials0[0] * scale) * (partials1[0] * scale));
  }
}
`]]}],["com.xenova.LlamaDecodeGateUpNormQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeGateUpNormQ1",sinceVersion:1,inputs:[{role:"Hidden",dtype:"H",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1},{role:"NormWeights",dtype:"W",rank:1}],outputs:[{role:"Intermediate",dtype:"I",rank:1,shape:["args.intermediateSize"]}],typeConstraints:{H:["float32","float16"],S:["float32","float16"],W:["float32","float16"],I:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"output"},weightsT:{kind:"tensor",semantic:"NormWeights",role:"weights"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"post_attention_norm_offset"},gateOffset:{kind:"u32",semantic:"gate_proj_q1_block_offset"},upOffset:{kind:"u32",semantic:"up_proj_q1_block_offset"}},variants:[{id:"q1",priority:0,when:["ranks.hiddenT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.intermediateT == 1","ranks.weightsT == 1",'(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.hiddenT != "float16" and tensorDtypes.q1ScalesT != "float16" and tensorDtypes.intermediateT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.intermediateSize > 0","args.intermediateSize % 4 == 0","args.normOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.weightsT, 0) >= args.normOffset + args.hiddenSize","dim(shapes.q1BitsT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 128), args.upOffset + args.intermediateSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 128), args.upOffset + args.intermediateSize * (args.hiddenSize / 128))"],constants:{usesF16:'tensorDtypes.hiddenT == "float16" or tensorDtypes.q1ScalesT == "float16" or tensorDtypes.intermediateT == "float16" or tensorDtypes.weightsT == "float16"',useSubgroups:'device.features.has("subgroups")',hiddenVec4:'"vec4<f16>" if tensorDtypes.hiddenT == "float16" else "vec4<f32>"',normWeightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",intermediateScalar:"dtypes.I",hiddenSize:"args.hiddenSize",hiddenSizeQ1Words:"args.hiddenSize / 32",blocksPerRow:"args.hiddenSize / 128",intermediateSize:"args.intermediateSize",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4",gateOffset:"args.gateOffset",upOffset:"args.upOffset"},passes:[{id:"main",name:"LlamaDecodeGateUpNormQ1",source:{kind:"template",shader:"decode-gate-up-norm-q1.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"output",buffer:{type:"storage"},elementType:"$intermediateScalar"},{name:"norm_weight",arg:"weightsT",semantic:"NormWeights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$normWeightVec4"}],dispatch:{x:"ceil(args.intermediateSize / 4)",y:1,z:1},reads:["Hidden","Q1Bits","Q1Scales","NormWeights"],writes:["Intermediate"]}]}]},assets:[["decode-gate-up-norm-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_Q1_WORDS: u32 = {{ hiddenSizeQ1Words }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const INTERMEDIATE_SIZE: u32 = {{ intermediateSize }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const W_GATE_Q1: u32 = {{ gateOffset }}u;
const W_UP_Q1: u32 = {{ upOffset }}u;
const WORKGROUP_SIZE: u32 = 64u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials_g0: array<f32, 64>;
var<workgroup> partials_g1: array<f32, 64>;
var<workgroup> partials_g2: array<f32, 64>;
var<workgroup> partials_g3: array<f32, 64>;
var<workgroup> partials_u0: array<f32, 64>;
var<workgroup> partials_u1: array<f32, 64>;
var<workgroup> partials_u2: array<f32, 64>;
var<workgroup> partials_u3: array<f32, 64>;
var<workgroup> partials_ss: array<f32, 64>;

fn silu(x: f32) -> f32 {
  let sigmoid = 0.5 + 0.5 * x / (1.0 + abs(x));
  return x * sigmoid;
}

fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}

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
  var ss = 0.0;
  for (var word_index = lid; word_index < HIDDEN_SIZE_Q1_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
{%- if hiddenVec4 == "vec4<f32>" %}
    let h0 = hidden[base4];
    let h1 = hidden[base4 + 1u];
    let h2 = hidden[base4 + 2u];
    let h3 = hidden[base4 + 3u];
    let h4 = hidden[base4 + 4u];
    let h5 = hidden[base4 + 5u];
    let h6 = hidden[base4 + 6u];
    let h7 = hidden[base4 + 7u];
{%- else %}
    let h0 = vec4<f32>(hidden[base4]);
    let h1 = vec4<f32>(hidden[base4 + 1u]);
    let h2 = vec4<f32>(hidden[base4 + 2u]);
    let h3 = vec4<f32>(hidden[base4 + 3u]);
    let h4 = vec4<f32>(hidden[base4 + 4u]);
    let h5 = vec4<f32>(hidden[base4 + 5u]);
    let h6 = vec4<f32>(hidden[base4 + 6u]);
    let h7 = vec4<f32>(hidden[base4 + 7u]);
{%- endif %}
    ss += dot(h0, h0) + dot(h1, h1) + dot(h2, h2) + dot(h3, h3) +
      dot(h4, h4) + dot(h5, h5) + dot(h6, h6) + dot(h7, h7);

    let g_base = W_NORM_VEC4 + base4;
{%- if normWeightVec4 == "vec4<f32>" %}
    let n0 = h0 * norm_weight[g_base];
    let n1 = h1 * norm_weight[g_base + 1u];
    let n2 = h2 * norm_weight[g_base + 2u];
    let n3 = h3 * norm_weight[g_base + 3u];
    let n4 = h4 * norm_weight[g_base + 4u];
    let n5 = h5 * norm_weight[g_base + 5u];
    let n6 = h6 * norm_weight[g_base + 6u];
    let n7 = h7 * norm_weight[g_base + 7u];
{%- else %}
    let n0 = h0 * vec4<f32>(norm_weight[g_base]);
    let n1 = h1 * vec4<f32>(norm_weight[g_base + 1u]);
    let n2 = h2 * vec4<f32>(norm_weight[g_base + 2u]);
    let n3 = h3 * vec4<f32>(norm_weight[g_base + 3u]);
    let n4 = h4 * vec4<f32>(norm_weight[g_base + 4u]);
    let n5 = h5 * vec4<f32>(norm_weight[g_base + 5u]);
    let n6 = h6 * vec4<f32>(norm_weight[g_base + 6u]);
    let n7 = h7 * vec4<f32>(norm_weight[g_base + 7u]);
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
  let subgroup_sum0 = subgroupAdd(acc0);
  let subgroup_sum1 = subgroupAdd(acc_u0);
  let subgroup_sum2 = subgroupAdd(acc1);
  let subgroup_sum3 = subgroupAdd(acc_u1);
  let subgroup_sum4 = subgroupAdd(acc2);
  let subgroup_sum5 = subgroupAdd(acc_u2);
  let subgroup_sum6 = subgroupAdd(acc3);
  let subgroup_sum7 = subgroupAdd(acc_u3);
  let subgroup_sum8 = subgroupAdd(ss);
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials_g0[0] = subgroup_sum0;
      partials_u0[0] = subgroup_sum1;
      partials_g1[0] = subgroup_sum2;
      partials_u1[0] = subgroup_sum3;
      partials_g2[0] = subgroup_sum4;
      partials_u2[0] = subgroup_sum5;
      partials_g3[0] = subgroup_sum6;
      partials_u3[0] = subgroup_sum7;
      partials_ss[0] = subgroup_sum8;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      let subgroup_index = lid / sg_size;
      partials_g0[subgroup_index] = subgroup_sum0;
      partials_u0[subgroup_index] = subgroup_sum1;
      partials_g1[subgroup_index] = subgroup_sum2;
      partials_u1[subgroup_index] = subgroup_sum3;
      partials_g2[subgroup_index] = subgroup_sum4;
      partials_u2[subgroup_index] = subgroup_sum5;
      partials_g3[subgroup_index] = subgroup_sum6;
      partials_u3[subgroup_index] = subgroup_sum7;
      partials_ss[subgroup_index] = subgroup_sum8;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total0 = 0.0;
      var total1 = 0.0;
      var total2 = 0.0;
      var total3 = 0.0;
      var total4 = 0.0;
      var total5 = 0.0;
      var total6 = 0.0;
      var total7 = 0.0;
      var total8 = 0.0;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total0 = total0 + partials_g0[i];
        total1 = total1 + partials_u0[i];
        total2 = total2 + partials_g1[i];
        total3 = total3 + partials_u1[i];
        total4 = total4 + partials_g2[i];
        total5 = total5 + partials_u2[i];
        total6 = total6 + partials_g3[i];
        total7 = total7 + partials_u3[i];
        total8 = total8 + partials_ss[i];
      }
      partials_g0[0] = total0;
      partials_u0[0] = total1;
      partials_g1[0] = total2;
      partials_u1[0] = total3;
      partials_g2[0] = total4;
      partials_u2[0] = total5;
      partials_g3[0] = total6;
      partials_u3[0] = total7;
      partials_ss[0] = total8;
    }
    workgroupBarrier();
  }
{%- else %}
  partials_g0[lid] = acc0;
  partials_u0[lid] = acc_u0;
  partials_g1[lid] = acc1;
  partials_u1[lid] = acc_u1;
  partials_g2[lid] = acc2;
  partials_u2[lid] = acc_u2;
  partials_g3[lid] = acc3;
  partials_u3[lid] = acc_u3;
  partials_ss[lid] = ss;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials_g0[lid] = partials_g0[lid] + partials_g0[lid + stride];
      partials_u0[lid] = partials_u0[lid] + partials_u0[lid + stride];
      partials_g1[lid] = partials_g1[lid] + partials_g1[lid + stride];
      partials_u1[lid] = partials_u1[lid] + partials_u1[lid + stride];
      partials_g2[lid] = partials_g2[lid] + partials_g2[lid + stride];
      partials_u2[lid] = partials_u2[lid] + partials_u2[lid + stride];
      partials_g3[lid] = partials_g3[lid] + partials_g3[lid + stride];
      partials_u3[lid] = partials_u3[lid] + partials_u3[lid + stride];
      partials_ss[lid] = partials_ss[lid] + partials_ss[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid == 0u) {
    let scale = inverseSqrt(partials_ss[0] / f32(HIDDEN_SIZE) + RMS_EPS);
{%- if intermediateScalar == "f32" %}
    intermediate[j0 + 0u] = silu(partials_g0[0] * scale) * (partials_u0[0] * scale);
    intermediate[j0 + 1u] = silu(partials_g1[0] * scale) * (partials_u1[0] * scale);
    intermediate[j0 + 2u] = silu(partials_g2[0] * scale) * (partials_u2[0] * scale);
    intermediate[j0 + 3u] = silu(partials_g3[0] * scale) * (partials_u3[0] * scale);
{%- else %}
    intermediate[j0 + 0u] = {{ intermediateScalar }}(silu(partials_g0[0] * scale) * (partials_u0[0] * scale));
    intermediate[j0 + 1u] = {{ intermediateScalar }}(silu(partials_g1[0] * scale) * (partials_u1[0] * scale));
    intermediate[j0 + 2u] = {{ intermediateScalar }}(silu(partials_g2[0] * scale) * (partials_u2[0] * scale));
    intermediate[j0 + 3u] = {{ intermediateScalar }}(silu(partials_g3[0] * scale) * (partials_u3[0] * scale));
{%- endif %}
  }
}
`]]}],["com.xenova.LlamaDecodeGateUpNormQ4",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeGateUpNormQ4",sinceVersion:1,inputs:[{role:"Hidden",dtype:"H",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1},{role:"Q4Scales",dtype:"S",rank:1},{role:"NormWeights",dtype:"W",rank:1}],outputs:[{role:"Intermediate",dtype:"I",rank:1,shape:["args.intermediateSize"]}],typeConstraints:{H:["float32","float16"],S:["float32","float16"],W:["float32","float16"],I:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights"},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"output"},weightsT:{kind:"tensor",semantic:"NormWeights",role:"weights"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"post_attention_norm_offset"},gateOffset:{kind:"u32",semantic:"gate_proj_q4_block_offset"},upOffset:{kind:"u32",semantic:"up_proj_q4_block_offset"},quantBits:{kind:"u32",semantic:"packed_quant_bits"},hasMin:{kind:"u32",semantic:"kquant_has_min",required:!1}},variants:[{id:"q4",priority:0,when:["ranks.hiddenT == 1","ranks.q4BitsT == 1","ranks.q4ScalesT == 1","ranks.intermediateT == 1","ranks.weightsT == 1",'(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','tensorDtypes.q4BitsT == "uint32"','(tensorDtypes.q4ScalesT == "float32" or tensorDtypes.q4ScalesT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.hiddenT != "float16" and tensorDtypes.q4ScalesT != "float16" and tensorDtypes.intermediateT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 32 == 0","args.intermediateSize > 0","args.normOffset % 4 == 0","(args.quantBits == 4 or args.quantBits == 8)","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.weightsT, 0) >= args.normOffset + args.hiddenSize","dim(shapes.q4BitsT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 32), args.upOffset + args.intermediateSize * (args.hiddenSize / 32)) * args.quantBits","dim(shapes.q4ScalesT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 32), args.upOffset + args.intermediateSize * (args.hiddenSize / 32)) * (2 if args.hasMin else 1)"],constants:{useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',usesF16:'tensorDtypes.hiddenT == "float16" or tensorDtypes.q4ScalesT == "float16" or tensorDtypes.intermediateT == "float16" or tensorDtypes.weightsT == "float16"',scaleScalar:"dtypes.S",hiddenVec4:'"vec4<f16>" if tensorDtypes.hiddenT == "float16" else "vec4<f32>"',normWeightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',intermediateScalar:"dtypes.I",hiddenSize:"args.hiddenSize",blocksPerRow:"args.hiddenSize / 32",intermediateSize:"args.intermediateSize",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4",gateOffset:"args.gateOffset",upOffset:"args.upOffset",quantBits:"args.quantBits",hasMin:"args.hasMin if args.hasMin else 0"},passes:[{id:"main",name:"LlamaDecodeGateUpNormQ4",shader:"decode-gate-up-norm-q4.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"output",buffer:{type:"storage"},elementType:"$intermediateScalar"},{name:"norm_weight",arg:"weightsT",semantic:"NormWeights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$normWeightVec4"}],dispatch:{x:"args.intermediateSize",y:1,z:1},reads:["Hidden","Q4Bits","Q4Scales","NormWeights"],writes:["Intermediate"]}]}]},assets:[["decode-gate-up-norm-q4.wgsl.jinja",`{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const BPR: u32 = {{ blocksPerRow }}u;          // Q4_0 blocks per weight row (hidden / 32)
const INTERMEDIATE_SIZE: u32 = {{ intermediateSize }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const W_GATE_Q4: u32 = {{ gateOffset }}u;
const W_UP_Q4: u32 = {{ upOffset }}u;
const WORKGROUP_SIZE: u32 = 32u;

{%- if not useSubgroups %}
var<workgroup> partials_g: array<f32, 32>;
var<workgroup> partials_u: array<f32, 32>;
var<workgroup> partials_ss: array<f32, 32>;
{% endif %}

fn silu(x: f32) -> f32 {
  return x / (1.0 + exp(-x));
}

{%- if quantBits == 8 %}
// Q8_0 dequant: a u32 word holds 4 signed int8 in contiguous element order (one block = 32 elements
// = 2 vec4<u32>); dequant = q (scale applied once per block by the caller).
fn q8dot(word: u32, xv: vec4<f32>) -> f32 {
  return dot(vec4<f32>(unpack4xI8(word)), xv);
}
{%- else %}
fn q4_lo(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8(word & 0x0F0F0F0Fu)) - 8.0;
}
fn q4_hi(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8((word >> 4u) & 0x0F0F0F0Fu)) - 8.0;
}
fn q4wp(word: u32, lo: vec4<f32>, hi: vec4<f32>) -> f32 {
  return dot(lo, q4_lo(word)) + dot(hi, q4_hi(word));
}
{%- endif %}

// Fused post-attention RMSNorm + gate/up GEMV with in-kernel Q4_0 dequant. The RMSNorm scale is
// a per-token scalar that factors out of the linear GEMV, so we GEMV on (hidden*norm_weight),
// accumulate sum(hidden^2), and apply inverseSqrt(ss/H+eps) at the end. One intermediate row per
// workgroup (WG=32 = one subgroup); threads stride over the row's 32-element weight blocks and a
// single subgroupAdd does the reduction (this GEMV reduces over only hidden/32 blocks, so the
// barrier-tree reduction dominated \u2014 subgroupAdd removes it). Mirrors decode-gate-up-norm (f16).
@compute @workgroup_size(32)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let j = wid.x;
  let lid = lid3.x;
  if (j >= INTERMEDIATE_SIZE) {
    return;
  }
  let gate_block_base = W_GATE_Q4 + j * BPR;
  let up_block_base = W_UP_Q4 + j * BPR;

  var acc_g = 0.0;
  var acc_u = 0.0;
  var ss = 0.0;
  for (var b = lid; b < BPR; b = b + WORKGROUP_SIZE) {
    let hbase = b * 8u; // hidden vec4 base for this block's 32 elements
    let h0 = vec4<f32>(hidden[hbase]);
    let h1 = vec4<f32>(hidden[hbase + 1u]);
    let h2 = vec4<f32>(hidden[hbase + 2u]);
    let h3 = vec4<f32>(hidden[hbase + 3u]);
    let h4 = vec4<f32>(hidden[hbase + 4u]);
    let h5 = vec4<f32>(hidden[hbase + 5u]);
    let h6 = vec4<f32>(hidden[hbase + 6u]);
    let h7 = vec4<f32>(hidden[hbase + 7u]);
    ss = ss + dot(h0, h0) + dot(h1, h1) + dot(h2, h2) + dot(h3, h3) +
      dot(h4, h4) + dot(h5, h5) + dot(h6, h6) + dot(h7, h7);

    let nb = W_NORM_VEC4 + hbase;
    let n0 = h0 * vec4<f32>(norm_weight[nb]);
    let n1 = h1 * vec4<f32>(norm_weight[nb + 1u]);
    let n2 = h2 * vec4<f32>(norm_weight[nb + 2u]);
    let n3 = h3 * vec4<f32>(norm_weight[nb + 3u]);
    let n4 = h4 * vec4<f32>(norm_weight[nb + 4u]);
    let n5 = h5 * vec4<f32>(norm_weight[nb + 5u]);
    let n6 = h6 * vec4<f32>(norm_weight[nb + 6u]);
    let n7 = h7 * vec4<f32>(norm_weight[nb + 7u]);

{%- if hasMin %}
    let gs = f32(q4_scales[(gate_block_base + b) * 2u]);
    let us = f32(q4_scales[(up_block_base + b) * 2u]);
    let gbias = f32(q4_scales[(gate_block_base + b) * 2u + 1u]);
    let ubias = f32(q4_scales[(up_block_base + b) * 2u + 1u]);
    let sn = dot(n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7, vec4<f32>(1.0));
    let gw = q4_bits[gate_block_base + b];
    acc_g = acc_g + gs * (
      q4wp(gw.x, n0, n4) + q4wp(gw.y, n1, n5) + q4wp(gw.z, n2, n6) + q4wp(gw.w, n3, n7)) + gbias * sn;
    let uw = q4_bits[up_block_base + b];
    acc_u = acc_u + us * (
      q4wp(uw.x, n0, n4) + q4wp(uw.y, n1, n5) + q4wp(uw.z, n2, n6) + q4wp(uw.w, n3, n7)) + ubias * sn;
{%- elif quantBits == 8 %}
    let gs = f32(q4_scales[gate_block_base + b]);
    let us = f32(q4_scales[up_block_base + b]);
    let gw0 = q4_bits[(gate_block_base + b) * 2u];
    let gw1 = q4_bits[(gate_block_base + b) * 2u + 1u];
    acc_g = acc_g + gs * (
      q8dot(gw0.x, n0) + q8dot(gw0.y, n1) + q8dot(gw0.z, n2) + q8dot(gw0.w, n3) +
      q8dot(gw1.x, n4) + q8dot(gw1.y, n5) + q8dot(gw1.z, n6) + q8dot(gw1.w, n7));
    let uw0 = q4_bits[(up_block_base + b) * 2u];
    let uw1 = q4_bits[(up_block_base + b) * 2u + 1u];
    acc_u = acc_u + us * (
      q8dot(uw0.x, n0) + q8dot(uw0.y, n1) + q8dot(uw0.z, n2) + q8dot(uw0.w, n3) +
      q8dot(uw1.x, n4) + q8dot(uw1.y, n5) + q8dot(uw1.z, n6) + q8dot(uw1.w, n7));
{%- else %}
    let gs = f32(q4_scales[gate_block_base + b]);
    let us = f32(q4_scales[up_block_base + b]);
    let gw = q4_bits[gate_block_base + b];
    acc_g = acc_g + gs * (
      q4wp(gw.x, n0, n4) + q4wp(gw.y, n1, n5) + q4wp(gw.z, n2, n6) + q4wp(gw.w, n3, n7));

    let uw = q4_bits[up_block_base + b];
    acc_u = acc_u + us * (
      q4wp(uw.x, n0, n4) + q4wp(uw.y, n1, n5) + q4wp(uw.z, n2, n6) + q4wp(uw.w, n3, n7));
{%- endif %}
  }

{%- if useSubgroups %}
  let g = subgroupAdd(acc_g);
  let u = subgroupAdd(acc_u);
  let s = subgroupAdd(ss);
{% else %}
  partials_g[lid] = acc_g;
  partials_u[lid] = acc_u;
  partials_ss[lid] = ss;
  workgroupBarrier();
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials_g[lid] = partials_g[lid] + partials_g[lid + stride];
      partials_u[lid] = partials_u[lid] + partials_u[lid + stride];
      partials_ss[lid] = partials_ss[lid] + partials_ss[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) { break; }
    stride = stride / 2u;
  }
  let g = partials_g[0];
  let u = partials_u[0];
  let s = partials_ss[0];
{% endif %}

  if (lid == 0u) {
    let scale = inverseSqrt(s / f32(HIDDEN_SIZE) + RMS_EPS);
    intermediate[j] = {{ intermediateScalar }}(silu(g * scale) * (u * scale));
  }
}
`]]}],["com.xenova.LlamaDecodeGateUpQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeGateUpQ1",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1}],outputs:[{role:"Intermediate",dtype:"I",rank:1}],typeConstraints:{N:["float32","float16"],S:["float32","float16"],I:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},intermediateT:{kind:"tensor",semantic:"Intermediate",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},gateOffset:{kind:"u32",semantic:"gate_proj_q1_block_offset"},upOffset:{kind:"u32",semantic:"up_proj_q1_block_offset"}},variants:[{id:"q1",priority:0,when:["ranks.normedT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.intermediateT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.intermediateT == "float32" or tensorDtypes.intermediateT == "float16")','((tensorDtypes.normedT != "float16" and tensorDtypes.q1ScalesT != "float16" and tensorDtypes.intermediateT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.intermediateSize > 0","args.intermediateSize % 4 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.intermediateT, 0) == args.intermediateSize","dim(shapes.q1BitsT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 128), args.upOffset + args.intermediateSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= max(args.gateOffset + args.intermediateSize * (args.hiddenSize / 128), args.upOffset + args.intermediateSize * (args.hiddenSize / 128))"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.q1ScalesT == "float16" or tensorDtypes.intermediateT == "float16"',useSubgroups:'device.features.has("subgroups")',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",intermediateScalar:"dtypes.I",hiddenSizeQ1Words:"args.hiddenSize / 32",blocksPerRow:"args.hiddenSize / 128",intermediateSize:"args.intermediateSize",gateOffset:"args.gateOffset",upOffset:"args.upOffset"},passes:[{id:"main",name:"LlamaDecodeGateUpQ1",source:{kind:"template",shader:"decode-gate-up-q1.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"intermediate",arg:"intermediateT",semantic:"Intermediate",role:"output",buffer:{type:"storage"},elementType:"$intermediateScalar"}],dispatch:{x:"ceil(args.intermediateSize / 4)",y:1,z:1},reads:["Normed","Q1Bits","Q1Scales"],writes:["Intermediate"]}]}]},assets:[["decode-gate-up-q1.wgsl.jinja",`{%- if usesF16 %}
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

var<workgroup> partials_g0: array<f32, 64>;
var<workgroup> partials_g1: array<f32, 64>;
var<workgroup> partials_g2: array<f32, 64>;
var<workgroup> partials_g3: array<f32, 64>;
var<workgroup> partials_u0: array<f32, 64>;
var<workgroup> partials_u1: array<f32, 64>;
var<workgroup> partials_u2: array<f32, 64>;
var<workgroup> partials_u3: array<f32, 64>;

fn silu(x: f32) -> f32 {
  let sigmoid = 0.5 + 0.5 * x / (1.0 + abs(x));
  return x * sigmoid;
}


fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}

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
  let subgroup_sum0 = subgroupAdd(acc0);
  let subgroup_sum1 = subgroupAdd(acc_u0);
  let subgroup_sum2 = subgroupAdd(acc1);
  let subgroup_sum3 = subgroupAdd(acc_u1);
  let subgroup_sum4 = subgroupAdd(acc2);
  let subgroup_sum5 = subgroupAdd(acc_u2);
  let subgroup_sum6 = subgroupAdd(acc3);
  let subgroup_sum7 = subgroupAdd(acc_u3);
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials_g0[0] = subgroup_sum0;
      partials_u0[0] = subgroup_sum1;
      partials_g1[0] = subgroup_sum2;
      partials_u1[0] = subgroup_sum3;
      partials_g2[0] = subgroup_sum4;
      partials_u2[0] = subgroup_sum5;
      partials_g3[0] = subgroup_sum6;
      partials_u3[0] = subgroup_sum7;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      let subgroup_index = lid / sg_size;
      partials_g0[subgroup_index] = subgroup_sum0;
      partials_u0[subgroup_index] = subgroup_sum1;
      partials_g1[subgroup_index] = subgroup_sum2;
      partials_u1[subgroup_index] = subgroup_sum3;
      partials_g2[subgroup_index] = subgroup_sum4;
      partials_u2[subgroup_index] = subgroup_sum5;
      partials_g3[subgroup_index] = subgroup_sum6;
      partials_u3[subgroup_index] = subgroup_sum7;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total0 = 0.0;
      var total1 = 0.0;
      var total2 = 0.0;
      var total3 = 0.0;
      var total4 = 0.0;
      var total5 = 0.0;
      var total6 = 0.0;
      var total7 = 0.0;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total0 = total0 + partials_g0[i];
        total1 = total1 + partials_u0[i];
        total2 = total2 + partials_g1[i];
        total3 = total3 + partials_u1[i];
        total4 = total4 + partials_g2[i];
        total5 = total5 + partials_u2[i];
        total6 = total6 + partials_g3[i];
        total7 = total7 + partials_u3[i];
      }
      partials_g0[0] = total0;
      partials_u0[0] = total1;
      partials_g1[0] = total2;
      partials_u1[0] = total3;
      partials_g2[0] = total4;
      partials_u2[0] = total5;
      partials_g3[0] = total6;
      partials_u3[0] = total7;
    }
    workgroupBarrier();
  }
{%- else %}
  partials_g0[lid] = acc0;
  partials_u0[lid] = acc_u0;
  partials_g1[lid] = acc1;
  partials_u1[lid] = acc_u1;
  partials_g2[lid] = acc2;
  partials_u2[lid] = acc_u2;
  partials_g3[lid] = acc3;
  partials_u3[lid] = acc_u3;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials_g0[lid] = partials_g0[lid] + partials_g0[lid + stride];
      partials_u0[lid] = partials_u0[lid] + partials_u0[lid + stride];
      partials_g1[lid] = partials_g1[lid] + partials_g1[lid + stride];
      partials_u1[lid] = partials_u1[lid] + partials_u1[lid + stride];
      partials_g2[lid] = partials_g2[lid] + partials_g2[lid + stride];
      partials_u2[lid] = partials_u2[lid] + partials_u2[lid + stride];
      partials_g3[lid] = partials_g3[lid] + partials_g3[lid + stride];
      partials_u3[lid] = partials_u3[lid] + partials_u3[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid == 0u) {
{%- if intermediateScalar == "f32" %}
    intermediate[j0 + 0u] = silu(partials_g0[0]) * partials_u0[0];
    intermediate[j0 + 1u] = silu(partials_g1[0]) * partials_u1[0];
    intermediate[j0 + 2u] = silu(partials_g2[0]) * partials_u2[0];
    intermediate[j0 + 3u] = silu(partials_g3[0]) * partials_u3[0];
{%- else %}
    intermediate[j0 + 0u] = {{ intermediateScalar }}(silu(partials_g0[0]) * partials_u0[0]);
    intermediate[j0 + 1u] = {{ intermediateScalar }}(silu(partials_g1[0]) * partials_u1[0]);
    intermediate[j0 + 2u] = {{ intermediateScalar }}(silu(partials_g2[0]) * partials_u2[0]);
    intermediate[j0 + 3u] = {{ intermediateScalar }}(silu(partials_g3[0]) * partials_u3[0]);
{%- endif %}
  }
}
`]]}],["com.xenova.LlamaDecodeLmHeadQ1ArgmaxTiled",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeLmHeadQ1ArgmaxTiled",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1}],outputs:[{role:"BestValues",dtype:"float32",rank:1,shape:["args.numBlocks"]},{role:"BestIds",dtype:"uint32",rank:1,shape:["args.numBlocks"]}],typeConstraints:{N:["float32","float16"],S:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},bestValuesT:{kind:"tensor",semantic:"BestValues",role:"output"},bestIdsT:{kind:"tensor",semantic:"BestIds",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},lmHeadOffset:{kind:"u32",semantic:"lm_head_q1_block_offset"},numBlocks:{kind:"u32",semantic:"num_blocks",required:!1}},variants:[{id:"q1",priority:0,when:["ranks.normedT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.bestValuesT == 1","ranks.bestIdsT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','tensorDtypes.bestValuesT == "float32"','tensorDtypes.bestIdsT == "uint32"','((tensorDtypes.normedT != "float16" and tensorDtypes.q1ScalesT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.vocabSize > 0","(not args.numBlocks or args.numBlocks > 0)","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.bestValuesT, 0) >= (args.numBlocks if args.numBlocks else 256)","dim(shapes.bestIdsT, 0) >= (args.numBlocks if args.numBlocks else 256)","dim(shapes.q1BitsT, 0) >= (args.lmHeadOffset + args.vocabSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.lmHeadOffset + args.vocabSize * (args.hiddenSize / 128)"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.q1ScalesT == "float16"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",hiddenSizeBlocks:"args.hiddenSize / 128",vocabSize:"args.vocabSize",lmHeadOffset:"args.lmHeadOffset",numBlocks:"args.numBlocks if args.numBlocks else 256",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeLmHeadQ1ArgmaxTiled",source:{kind:"template",shader:"decode-lm-head-q1-argmax-tiled.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"best_values_out",arg:"bestValuesT",semantic:"BestValues",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"best_ids_out",arg:"bestIdsT",semantic:"BestIds",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:"args.numBlocks if args.numBlocks else 256",y:1,z:1},reads:["Normed","Q1Bits","Q1Scales"],writes:["BestValues","BestIds"]}]}]},assets:[["decode-lm-head-q1-argmax-tiled.wgsl.jinja",`{%- if usesF16 %}
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

fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}

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
      let block_idx = row_block_base + cb;
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

  best_values[lid] = best_value;
  best_indices[lid] = best_token;
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
    best_values_out[block] = best_values[0];
    best_ids_out[block] = best_indices[0];
  }
}
`]]}],["com.xenova.LlamaDecodeLmHeadQ4ArgmaxTiled",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeLmHeadQ4ArgmaxTiled",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1},{role:"Q4Scales",dtype:"S",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"BestValues",dtype:"float32",rank:1,shape:["args.numBlocks"]},{role:"BestIds",dtype:"uint32",rank:1,shape:["args.numBlocks"]}],typeConstraints:{S:["float32","float16"],W:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights"},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},bestValuesT:{kind:"tensor",semantic:"BestValues",role:"output"},bestIdsT:{kind:"tensor",semantic:"BestIds",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},lmHeadOffset:{kind:"u32",semantic:"lm_head_q4_block_offset"},finalNormOffset:{kind:"u32",semantic:"final_norm_offset"},numBlocks:{kind:"u32",semantic:"num_blocks",required:!1}},variants:[{id:"q4",priority:0,when:["ranks.hiddenT == 1","ranks.q4BitsT == 1","ranks.q4ScalesT == 1","ranks.weightsT == 1","ranks.bestValuesT == 1","ranks.bestIdsT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.q4BitsT == "uint32"','(tensorDtypes.q4ScalesT == "float32" or tensorDtypes.q4ScalesT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.bestValuesT == "float32"','tensorDtypes.bestIdsT == "uint32"','((tensorDtypes.weightsT != "float16" and tensorDtypes.q4ScalesT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 32 == 0","args.finalNormOffset % 4 == 0","args.vocabSize > 0","(not args.numBlocks or args.numBlocks > 0)","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.weightsT, 0) >= args.finalNormOffset + args.hiddenSize","dim(shapes.bestValuesT, 0) >= (args.numBlocks if args.numBlocks else 512)","dim(shapes.bestIdsT, 0) >= (args.numBlocks if args.numBlocks else 512)","dim(shapes.q4BitsT, 0) >= (args.lmHeadOffset + args.vocabSize * (args.hiddenSize / 32)) * 4","dim(shapes.q4ScalesT, 0) >= args.lmHeadOffset + args.vocabSize * (args.hiddenSize / 32)"],constants:{usesF16:'tensorDtypes.weightsT == "float16" or tensorDtypes.q4ScalesT == "float16"',normWeightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",hiddenSizeBlocks:"args.hiddenSize / 32",vocabSize:"args.vocabSize",lmHeadOffset:"args.lmHeadOffset",finalNormOffsetVec4:"args.finalNormOffset / 4",numBlocks:"args.numBlocks if args.numBlocks else 512",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeLmHeadQ4ArgmaxTiled",source:{kind:"template",shader:"decode-lm-head-q4-argmax-tiled.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"norm_weight",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$normWeightVec4"},{name:"best_values_out",arg:"bestValuesT",semantic:"BestValues",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"best_ids_out",arg:"bestIdsT",semantic:"BestIds",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:"args.numBlocks if args.numBlocks else 512",y:1,z:1},reads:["Hidden","Q4Bits","Q4Scales","Weights"],writes:["BestValues","BestIds"]}]}]},assets:[["decode-lm-head-q4-argmax-tiled.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;     // hidden / 4 (activation vec4 count)
const HIDDEN_SIZE_BLOCKS: u32 = {{ hiddenSizeBlocks }}u; // hidden / 32 (Q4_0 blocks per vocab row)
const W_LM_HEAD_Q4: u32 = {{ lmHeadOffset }}u;
const W_NORM_VEC4: u32 = {{ finalNormOffsetVec4 }}u;     // final RMSNorm weight base (vec4 units)
const WORKGROUP_SIZE: u32 = 256u;
const NUM_BLOCKS: u32 = {{ numBlocks }}u;
const F32_MIN: f32 = {{ f32Min }};

var<workgroup> best_values: array<f32, 256>;
var<workgroup> best_indices: array<u32, 256>;
var<workgroup> shared_acts: array<vec4<f32>, {{ hiddenSizeVec4 }}>;

// Q4_0 nibble dequant (matches the linear Q4 GEMVs / unpackQ4_0Blocks): word holds 4 low nibbles
// (byte k -> value k) and 4 high nibbles (byte k -> value k+16); value = nibble - 8, scaled per block.
fn q4_lo(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8(word & 0x0F0F0F0Fu)) - 8.0;
}
fn q4_hi(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8((word >> 4u) & 0x0F0F0F0Fu)) - 8.0;
}
fn q4wp(word: u32, lo: vec4<f32>, hi: vec4<f32>) -> f32 {
  return dot(lo, q4_lo(word)) + dot(hi, q4_hi(word));
}

// Read 4 contiguous f32 hidden values as a vec4 (hidden is bound as scalar f32).
fn hidden4(i: u32) -> vec4<f32> {
  let base = i * 4u;
  return vec4<f32>(hidden[base], hidden[base + 1u], hidden[base + 2u], hidden[base + 3u]);
}

// Tiled lm_head GEMV + argmax with in-kernel Q4_0 dequant + FOLDED final RMSNorm. NUM_BLOCKS workgroups
// stripe the vocab; each WG=256 thread accumulates the dot of its vocab rows against the shared
// activation, tracks its local argmax, then a tree-reduce emits one (best value, best id) per workgroup
// for argmaxReduce to combine. The final RMSNorm folds in as the elementwise weight multiply on the
// shared activation; its per-token inverse-RMS SCALAR is dropped \u2014 argmax over the vocab is invariant to
// any positive scale, so logit[v] = scale * sum_h W[v,h]*hidden[h]*g[h] argmaxes the same as without it.
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let block = wid.x;
  let lid = lid3.x;

  for (var i = lid; i < HIDDEN_SIZE_VEC4; i = i + WORKGROUP_SIZE) {
    shared_acts[i] = hidden4(i) * vec4<f32>(norm_weight[W_NORM_VEC4 + i]);
  }
  workgroupBarrier();

  var best_token = 0u;
  var best_value = F32_MIN;
  for (var vocab = block * WORKGROUP_SIZE + lid; vocab < VOCAB_SIZE; vocab = vocab + WORKGROUP_SIZE * NUM_BLOCKS) {
    var acc = 0.0;
    let row_block_base = W_LM_HEAD_Q4 + vocab * HIDDEN_SIZE_BLOCKS;
    for (var cb = 0u; cb < HIDDEN_SIZE_BLOCKS; cb = cb + 1u) {
      let bw = q4_bits[row_block_base + cb];
      let s = f32(q4_scales[row_block_base + cb]);
      let act_base = cb * 8u; // 8 activation vec4 = 32 elements per block
      acc = acc + s * (
        q4wp(bw.x, shared_acts[act_base + 0u], shared_acts[act_base + 4u]) +
        q4wp(bw.y, shared_acts[act_base + 1u], shared_acts[act_base + 5u]) +
        q4wp(bw.z, shared_acts[act_base + 2u], shared_acts[act_base + 6u]) +
        q4wp(bw.w, shared_acts[act_base + 3u], shared_acts[act_base + 7u]));
    }
    if (acc > best_value) {
      best_value = acc;
      best_token = vocab;
    }
  }

  best_values[lid] = best_value;
  best_indices[lid] = best_token;
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
    best_values_out[block] = best_values[0];
    best_ids_out[block] = best_indices[0];
  }
}
`]]}],["com.xenova.LlamaDecodeLmHeadQ8ArgmaxTiled",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeLmHeadQ8ArgmaxTiled",sinceVersion:1,inputs:[{role:"NormQ8",dtype:"uint32",rank:1},{role:"NormScale",dtype:"float32",rank:1},{role:"LmHeadQ8",dtype:"uint32",rank:1},{role:"LmHeadScales",dtype:"float32",rank:1}],outputs:[{role:"BestValues",dtype:"float32",rank:1},{role:"BestIds",dtype:"uint32",rank:1}],args:{normQ8T:{kind:"tensor",semantic:"NormQ8",role:"input"},normScaleT:{kind:"tensor",semantic:"NormScale",role:"input"},lmHeadQ8T:{kind:"tensor",semantic:"LmHeadQ8",role:"weights"},lmHeadScalesT:{kind:"tensor",semantic:"LmHeadScales",role:"weights"},bestValuesT:{kind:"tensor",semantic:"BestValues",role:"output"},bestIdsT:{kind:"tensor",semantic:"BestIds",role:"output"},vocabSize:{kind:"u32",semantic:"vocab_size"},hiddenSize:{kind:"u32",semantic:"hidden_size"},numBlocks:{kind:"u32",semantic:"num_blocks",required:!1}},variants:[{id:"tiled",priority:0,when:["ranks.normQ8T == 1","ranks.normScaleT == 1","ranks.lmHeadQ8T == 1","ranks.lmHeadScalesT == 1","ranks.bestValuesT == 1","ranks.bestIdsT == 1",'tensorDtypes.normQ8T == "uint32"','tensorDtypes.normScaleT == "float32"','tensorDtypes.lmHeadQ8T == "uint32"','tensorDtypes.lmHeadScalesT == "float32"','tensorDtypes.bestValuesT == "float32"','tensorDtypes.bestIdsT == "uint32"',"args.vocabSize > 0","args.hiddenSize > 0","args.hiddenSize % 4 == 0","(args.numBlocks if args.numBlocks else 256) > 0","dim(shapes.normQ8T, 0) == args.hiddenSize / 4","dim(shapes.normScaleT, 0) == 1","dim(shapes.lmHeadQ8T, 0) >= args.vocabSize * (args.hiddenSize / 4)","dim(shapes.lmHeadScalesT, 0) >= args.vocabSize","dim(shapes.bestValuesT, 0) >= (args.numBlocks if args.numBlocks else 256)","dim(shapes.bestIdsT, 0) >= (args.numBlocks if args.numBlocks else 256)"],constants:{vocabSize:"args.vocabSize",hiddenSizeVec4:"args.hiddenSize / 4",numBlocks:"args.numBlocks if args.numBlocks else 256",f32Min:'"-3.4028234663852886e38"'},passes:[{id:"main",name:"LlamaDecodeLmHeadQ8ArgmaxTiled",shader:"decode-lm-head-q8-argmax-tiled.wgsl.jinja",bindings:[{name:"norm_q8",arg:"normQ8T",semantic:"NormQ8",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"norm_scale",arg:"normScaleT",semantic:"NormScale",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"lm_head_q8",arg:"lmHeadQ8T",semantic:"LmHeadQ8",role:"weights",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"lm_head_scales",arg:"lmHeadScalesT",semantic:"LmHeadScales",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"best_values_out",arg:"bestValuesT",semantic:"BestValues",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"best_ids_out",arg:"bestIdsT",semantic:"BestIds",role:"output",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:"args.numBlocks if args.numBlocks else 256",y:1,z:1},reads:["NormQ8","NormScale","LmHeadQ8","LmHeadScales"],writes:["BestValues","BestIds"]}]}]},assets:[["decode-lm-head-q8-argmax-tiled.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

const VOCAB_SIZE: u32 = {{ vocabSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const WORKGROUP_SIZE: u32 = 256u;
const NUM_BLOCKS: u32 = {{ numBlocks }}u;

var<workgroup> best_values: array<f32, 256>;
var<workgroup> best_indices: array<u32, 256>;

@compute @workgroup_size(256)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
) {
  let block = wid.x;
  let lid = lid3.x;
  let activation_scale = norm_scale[0];
  var best_token = 0u;
  var best_value = {{ f32Min }};

  for (var vocab = block * WORKGROUP_SIZE + lid; vocab < VOCAB_SIZE; vocab = vocab + WORKGROUP_SIZE * NUM_BLOCKS) {
    let weight_base = vocab * HIDDEN_SIZE_VEC4;
    var acc = 0i;
    for (var dim = 0u; dim < HIDDEN_SIZE_VEC4; dim = dim + 1u) {
      acc = acc + dot4I8Packed(norm_q8[dim], lm_head_q8[weight_base + dim]);
    }
    let value = f32(acc) * activation_scale * lm_head_scales[vocab];
    if (value > best_value) {
      best_value = value;
      best_token = vocab;
    }
  }

  best_values[lid] = best_value;
  best_indices[lid] = best_token;
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
    best_values_out[block] = best_values[0];
    best_ids_out[block] = best_indices[0];
  }
}
`]]}],["com.xenova.LlamaDecodeOProj",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeOProj",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"Attn",dtype:"float32",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],tunables:{OUTPUTS_PER_WG:2},typeConstraints:{W:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},attnT:{kind:"tensor",semantic:"Attn",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},oOffset:{kind:"u32",semantic:"o_proj_offset"}},variants:[{id:"dense",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.attnT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.attnT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.weightsT != "float16" or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.oOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.attnT, 0) == args.hiddenSize","dim(shapes.weightsT, 0) >= args.oOffset + args.hiddenSize * args.hiddenSize"],constants:{usesF16:'tensorDtypes.weightsT == "float16"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",oOffsetVec4:"args.oOffset / 4",outputsPerWg:"tunables.OUTPUTS_PER_WG",assumeFullBlocks:"args.hiddenSize % tunables.OUTPUTS_PER_WG == 0"},passes:[{id:"main",name:"LlamaDecodeOProj",shader:"decode-o-proj.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"}],dispatch:{x:"ceilDiv(args.hiddenSize, tunables.OUTPUTS_PER_WG)",y:1,z:1},reads:["Hidden","Weights","Attn"],writes:["Hidden"]}]}]},assets:[["decode-o-proj.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

{%- if not assumeFullBlocks %}
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
{%- endif %}
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const W_O_VEC4: u32 = {{ oOffsetVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;
// Output rows per workgroup: read the shared attn_out (activation) vec4 once per k-step and
// dot it against N_ROWS contiguous weight rows, so the activation re-read and the
// workgroup/reduction count drop by N_ROWS.
const N_ROWS: u32 = {{ outputsPerWg }}u;

var<workgroup> partials: array<f32, WORKGROUP_SIZE * N_ROWS>;

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let out0 = wid.x * N_ROWS;
  let lid = lid3.x;
{%- if not assumeFullBlocks %}
  if (out0 >= HIDDEN_SIZE) {
    return;
  }
{%- endif %}

  var acc: array<f32, N_ROWS>;
  for (var n = 0u; n < N_ROWS; n = n + 1u) {
    acc[n] = 0.0;
  }

  for (var in_dim = lid; in_dim < HIDDEN_SIZE_VEC4; in_dim = in_dim + WORKGROUP_SIZE) {
    let a = attn_out[in_dim];
{%- if weightScalar == "f16" %}
    let ah = vec4<f16>(a);
    for (var n = 0u; n < N_ROWS; n = n + 1u) {
{%- if not assumeFullBlocks %}
      if (out0 + n < HIDDEN_SIZE) {
{%- endif %}
        acc[n] = acc[n] + f32(dot(ah, weights[W_O_VEC4 + (out0 + n) * HIDDEN_SIZE_VEC4 + in_dim]));
{%- if not assumeFullBlocks %}
      }
{%- endif %}
    }
{%- else %}
    for (var n = 0u; n < N_ROWS; n = n + 1u) {
{%- if not assumeFullBlocks %}
      if (out0 + n < HIDDEN_SIZE) {
{%- endif %}
        acc[n] = acc[n] + dot(a, weights[W_O_VEC4 + (out0 + n) * HIDDEN_SIZE_VEC4 + in_dim]);
{%- if not assumeFullBlocks %}
      }
{%- endif %}
    }
{%- endif %}
  }

  for (var n = 0u; n < N_ROWS; n = n + 1u) {
    partials[lid * N_ROWS + n] = acc[n];
  }
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      for (var n = 0u; n < N_ROWS; n = n + 1u) {
        partials[lid * N_ROWS + n] = partials[lid * N_ROWS + n] + partials[(lid + stride) * N_ROWS + n];
      }
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  if (lid < N_ROWS) {
    let out_dim = out0 + lid;
{%- if not assumeFullBlocks %}
    if (out_dim < HIDDEN_SIZE) {
      hidden[out_dim] = hidden[out_dim] + partials[lid];
    }
{%- else %}
    hidden[out_dim] = hidden[out_dim] + partials[lid];
{%- endif %}
  }
}
`]]}],["com.xenova.LlamaDecodeOProjQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeOProjQ1",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1},{role:"Attn",dtype:"A",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{A:["float32","float16"],S:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},attnT:{kind:"tensor",semantic:"Attn",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},oOffset:{kind:"u32",semantic:"o_proj_q1_block_offset"}},variants:[{id:"q1",priority:0,when:["ranks.hiddenT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.attnT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.attnT == "float32" or tensorDtypes.attnT == "float16")','((tensorDtypes.q1ScalesT != "float16" and tensorDtypes.attnT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.attnT, 0) == args.hiddenSize","dim(shapes.q1BitsT, 0) >= (args.oOffset + args.hiddenSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.oOffset + args.hiddenSize * (args.hiddenSize / 128)"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16" or tensorDtypes.attnT == "float16"',useSubgroups:'device.features.has("subgroups")',attnVec4:'"vec4<f16>" if tensorDtypes.attnT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",hiddenSizeQ1Words:"args.hiddenSize / 32",blocksPerRow:"args.hiddenSize / 128",oOffset:"args.oOffset"},passes:[{id:"main",name:"LlamaDecodeOProjQ1",source:{kind:"template",shader:"decode-o-proj-q1.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"input",buffer:{type:"read-only-storage"},elementType:"$attnVec4"}],dispatch:{x:"ceil(args.hiddenSize / 4)",y:1,z:1},reads:["Hidden","Q1Bits","Q1Scales","Attn"],writes:["Hidden"]}]}]},assets:[["decode-o-proj-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_Q1_WORDS: u32 = {{ hiddenSizeQ1Words }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const W_O_Q1: u32 = {{ oOffset }}u;
const WORKGROUP_SIZE: u32 = 32u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, 32>;
var<workgroup> partials1: array<f32, 32>;
var<workgroup> partials2: array<f32, 32>;
var<workgroup> partials3: array<f32, 32>;


fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}

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

@compute @workgroup_size(32)
fn main(
  @builtin(workgroup_id) wid: vec3<u32>,
  @builtin(local_invocation_id) lid3: vec3<u32>
{%- if useSubgroups %},
  @builtin(subgroup_invocation_id) sg_lid: u32,
  @builtin(subgroup_size) sg_size: u32
{%- endif %}
) {
  let dim0 = wid.x * TILE_ROWS;
  let lid = lid3.x;
  if (dim0 >= HIDDEN_SIZE) {
    return;
  }

  let tile = dim0 / TILE_ROWS;
  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  for (var word_index = lid; word_index < HIDDEN_SIZE_Q1_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
{%- if attnVec4 == "vec4<f32>" %}
    let a0 = attn_out[base4];
    let a1 = attn_out[base4 + 1u];
    let a2 = attn_out[base4 + 2u];
    let a3 = attn_out[base4 + 3u];
    let a4 = attn_out[base4 + 4u];
    let a5 = attn_out[base4 + 5u];
    let a6 = attn_out[base4 + 6u];
    let a7 = attn_out[base4 + 7u];
{%- else %}
    let a0 = vec4<f32>(attn_out[base4]);
    let a1 = vec4<f32>(attn_out[base4 + 1u]);
    let a2 = vec4<f32>(attn_out[base4 + 2u]);
    let a3 = vec4<f32>(attn_out[base4 + 3u]);
    let a4 = vec4<f32>(attn_out[base4 + 4u]);
    let a5 = vec4<f32>(attn_out[base4 + 5u]);
    let a6 = vec4<f32>(attn_out[base4 + 6u]);
    let a7 = vec4<f32>(attn_out[base4 + 7u]);
{%- endif %}
    let dot4 = q1_dot_word_t4(W_O_Q1, tile, BPR, col_block, word_id, a0, a1, a2, a3, a4, a5, a6, a7);
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

  if (lid == 0u) {
    hidden[dim0 + 0u] = hidden[dim0 + 0u] + partials0[0];
    hidden[dim0 + 1u] = hidden[dim0 + 1u] + partials1[0];
    hidden[dim0 + 2u] = hidden[dim0 + 2u] + partials2[0];
    hidden[dim0 + 3u] = hidden[dim0 + 3u] + partials3[0];
  }
}
`]]}],["com.xenova.LlamaDecodeOProjQ4",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeOProjQ4",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1},{role:"Q4Scales",dtype:"S",rank:1},{role:"Attn",dtype:"float32",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{S:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"inout"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights"},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights"},attnT:{kind:"tensor",semantic:"Attn",role:"input"},hiddenSize:{kind:"u32",semantic:"hidden_size"},oOffset:{kind:"u32",semantic:"o_proj_q4_block_offset"},quantBits:{kind:"u32",semantic:"packed_quant_bits"},hasMin:{kind:"u32",semantic:"kquant_has_min",required:!1}},variants:[{id:"q4",priority:0,when:["ranks.hiddenT == 1","ranks.q4BitsT == 1","ranks.q4ScalesT == 1","ranks.attnT == 1",'tensorDtypes.hiddenT == "float32"','tensorDtypes.attnT == "float32"','tensorDtypes.q4BitsT == "uint32"','(tensorDtypes.q4ScalesT == "float32" or tensorDtypes.q4ScalesT == "float16")','(tensorDtypes.q4ScalesT != "float16" or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 32 == 0","(args.quantBits == 4 or args.quantBits == 8)","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.attnT, 0) == args.hiddenSize","dim(shapes.q4BitsT, 0) >= (args.oOffset + args.hiddenSize * (args.hiddenSize / 32)) * args.quantBits","dim(shapes.q4ScalesT, 0) >= (args.oOffset + args.hiddenSize * (args.hiddenSize / 32)) * (2 if args.hasMin else 1)"],constants:{useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',usesF16:'tensorDtypes.q4ScalesT == "float16"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",blocksPerRow:"args.hiddenSize / 32",oOffset:"args.oOffset",quantBits:"args.quantBits",hasMin:"args.hasMin if args.hasMin else 0"},passes:[{id:"main",name:"LlamaDecodeOProjQ4",shader:"decode-o-proj-q4.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"}],dispatch:{x:"args.hiddenSize",y:1,z:1},reads:["Hidden","Q4Bits","Q4Scales","Attn"],writes:["Hidden"]}]}]},assets:[["decode-o-proj-q4.wgsl.jinja",`{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const BPR: u32 = {{ blocksPerRow }}u;          // Q4_0 blocks per weight row (hidden / 32)
const W_O_Q4: u32 = {{ oOffset }}u;             // block offset of o_proj/conv_out_proj
const WORKGROUP_SIZE: u32 = 32u;

{%- if not useSubgroups %}
var<workgroup> partials: array<f32, 32>;
{% endif %}

{%- if quantBits == 8 %}
// Q8_0 dequant: a u32 word holds 4 signed int8 in contiguous element order (one block = 32 elements
// = 2 vec4<u32>); dequant = q (scale applied once per block by the caller).
fn q8dot(word: u32, xv: vec4<f32>) -> f32 {
  return dot(vec4<f32>(unpack4xI8(word)), xv);
}
{%- else %}
fn q4_lo(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8(word & 0x0F0F0F0Fu)) - 8.0;
}
fn q4_hi(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8((word >> 4u) & 0x0F0F0F0Fu)) - 8.0;
}
fn q4wp(word: u32, lo: vec4<f32>, hi: vec4<f32>) -> f32 {
  return dot(lo, q4_lo(word)) + dot(hi, q4_hi(word));
}
{%- endif %}

// o_proj / conv_out_proj GEMV with in-kernel Q4_0 dequant: one output (hidden) row per workgroup,
// dot the dequantized weights against the attention/conv output, reduce, add into the residual.
// Square (in == out == hidden), so BPR = hidden/32. Mirrors decode-o-proj (f16). WG=32 = one
// subgroup so a single subgroupAdd reduces the row (BPR=32 makes the barrier tree dominate).
// One row per workgroup: this GEMV is occupancy-bound at batch-1 decode, so it wants the maximum
// workgroup count rather than more work per (fatter) workgroup.
@compute @workgroup_size(32)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let dim = wid.x;
  let lid = lid3.x;
  if (dim >= HIDDEN_SIZE) {
    return;
  }
  let row_block_base = W_O_Q4 + dim * BPR;

  var acc = 0.0;
  for (var b = lid; b < BPR; b = b + WORKGROUP_SIZE) {
    let blk = row_block_base + b;
    let scale = f32(q4_scales[{% if hasMin %}blk * 2u{% else %}blk{% endif %}]);
    let hbase = b * 8u;
    let x0 = attn_out[hbase];
    let x1 = attn_out[hbase + 1u];
    let x2 = attn_out[hbase + 2u];
    let x3 = attn_out[hbase + 3u];
    let x4 = attn_out[hbase + 4u];
    let x5 = attn_out[hbase + 5u];
    let x6 = attn_out[hbase + 6u];
    let x7 = attn_out[hbase + 7u];
{%- if hasMin %}
    let bias = f32(q4_scales[blk * 2u + 1u]); // Q4_K: scale=d1, bias=8*d1 - dmin*m (interleaved)
    let words = q4_bits[blk];
    let sa = dot(x0 + x1 + x2 + x3 + x4 + x5 + x6 + x7, vec4<f32>(1.0));
    acc = acc + scale * (
      q4wp(words.x, x0, x4) +
      q4wp(words.y, x1, x5) +
      q4wp(words.z, x2, x6) +
      q4wp(words.w, x3, x7)) + bias * sa;
{%- elif quantBits == 8 %}
    let w0 = q4_bits[blk * 2u];
    let w1 = q4_bits[blk * 2u + 1u];
    acc = acc + scale * (
      q8dot(w0.x, x0) + q8dot(w0.y, x1) + q8dot(w0.z, x2) + q8dot(w0.w, x3) +
      q8dot(w1.x, x4) + q8dot(w1.y, x5) + q8dot(w1.z, x6) + q8dot(w1.w, x7));
{%- else %}
    let words = q4_bits[blk];
    acc = acc + scale * (
      q4wp(words.x, x0, x4) +
      q4wp(words.y, x1, x5) +
      q4wp(words.z, x2, x6) +
      q4wp(words.w, x3, x7));
{%- endif %}
  }

{%- if useSubgroups %}
  let total = subgroupAdd(acc);
{% else %}
  partials[lid] = acc;
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
  let total = partials[0];
{% endif %}

  if (lid == 0u) {
    hidden[dim] = hidden[dim] + total;
  }
}
`]]}],["com.xenova.LlamaDecodeQkNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkNorm",sinceVersion:1,inputs:[{role:"Q",dtype:"A",rank:1},{role:"K",dtype:"A",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Q",dtype:"A",rank:1,shape:["args.numHeads * args.headDim"]},{role:"K",dtype:"A",rank:1,shape:["args.numKvHeads * args.headDim"]}],typeConstraints:{A:["float32","float16"],W:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"inout"},kT:{kind:"tensor",semantic:"K",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rmsEps:{kind:"f32",semantic:"rms_eps"},qNormOffset:{kind:"u32",semantic:"q_norm_offset"},kNormOffset:{kind:"u32",semantic:"k_norm_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.qT == 1","ranks.kT == 1","ranks.weightsT == 1","tensorDtypes.qT == tensorDtypes.kT",'(tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.qT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","dim(shapes.qT, 0) >= args.numHeads * args.headDim","dim(shapes.kT, 0) >= args.numKvHeads * args.headDim","dim(shapes.weightsT, 0) >= max(args.qNormOffset + args.headDim, args.kNormOffset + args.headDim)"],constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.weightsT == "float16"',activationScalar:"dtypes.A",weightScalar:"dtypes.W",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",headDim:"args.headDim",rmsEps:"args.rmsEps",qNormOffset:"args.qNormOffset",kNormOffset:"args.kNormOffset"},passes:[{id:"main",name:"LlamaDecodeQkNorm",shader:"decode-qk-norm.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"k",arg:"kT",semantic:"K",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"}],dispatch:{x:"args.numHeads + args.numKvHeads",y:1,z:1},reads:["Q","K","Weights"],writes:["Q","K"]}]}]},assets:[["decode-qk-norm.wgsl.jinja",`{%- if usesF16 %}
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
`]]}],["com.xenova.LlamaDecodeQkNormRopeCacheKv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkNormRopeCacheKv",sinceVersion:1,inputs:[{role:"Q",dtype:"A",rank:1},{role:"K",dtype:"A",rank:1},{role:"V",dtype:"A",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32",rank:1},{role:"RopeSin",dtype:"float32",rank:1}],outputs:[{role:"Q",dtype:"A",rank:1,shape:["args.numHeads * args.headDim"]},{role:"K",dtype:"A",rank:1,shape:["args.numKvHeads * args.headDim"]},{role:"CacheKeys",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]},{role:"CacheValues",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]}],typeConstraints:{A:["float32","float16"],C:["float32","float16"],W:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"inout"},kT:{kind:"tensor",semantic:"K",role:"inout"},vT:{kind:"tensor",semantic:"V",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rmsEps:{kind:"f32",semantic:"rms_eps"},qNormOffset:{kind:"u32",semantic:"q_norm_offset"},kNormOffset:{kind:"u32",semantic:"k_norm_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.qT == 1","ranks.kT == 1","ranks.vT == 1","ranks.weightsT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","(ranks.cosT == 1 or ranks.cosT == 2)","(ranks.sinT == 1 or ranks.sinT == 2)","tensorDtypes.qT == tensorDtypes.kT","tensorDtypes.qT == tensorDtypes.vT","tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16")','(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.qT != "float16" and tensorDtypes.cacheKeysT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.headDim % 2 == 0","args.headDim <= 128","dim(shapes.qT, 0) == args.numHeads * args.headDim","dim(shapes.kT, 0) == args.numKvHeads * args.headDim","dim(shapes.vT, 0) == args.numKvHeads * args.headDim","dim(shapes.weightsT, 0) >= max(args.qNormOffset + args.headDim, args.kNormOffset + args.headDim)","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.cosT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.sinT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))"],constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.cacheKeysT == "float16" or tensorDtypes.weightsT == "float16"',activationScalar:"dtypes.A",cacheScalar:"dtypes.C",weightScalar:"dtypes.W",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",headDim:"args.headDim",headDimHalf:"args.headDim / 2",rmsEps:"args.rmsEps",qNormOffset:"args.qNormOffset",kNormOffset:"args.kNormOffset"},passes:[{id:"main",name:"LlamaDecodeQkNormRopeCacheKv",shader:"decode-qk-norm-rope-cache-kv.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"k",arg:"kT",semantic:"K",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads + args.numKvHeads",y:1,z:1},reads:["Q","K","V","Weights","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Q","K","CacheKeys","CacheValues"]}]}]},assets:[["decode-qk-norm-rope-cache-kv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_HALF: u32 = {{ headDimHalf }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_Q_NORM: u32 = {{ qNormOffset }}u;
const W_K_NORM: u32 = {{ kNormOffset }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials: array<f32, 64>;

fn load_activation(value: {{ activationScalar }}) -> f32 { return f32(value); }
fn store_activation(value: f32) -> {{ activationScalar }} { return {{ activationScalar }}(value); }
fn load_weight(value: {{ weightScalar }}) -> f32 { return f32(value); }
fn store_cache(value: f32) -> {{ cacheScalar }} { return {{ cacheScalar }}(value); }

fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}
fn rope_index(pos: u32, d: u32) -> u32 {
  return pos * HEAD_DIM_HALF + d;
}

// Fused per-head qk-RMSNorm + RoPE + KV-cache write over separate q/k/v buffers. One workgroup per
// head (the q heads, then the k heads): reduce that head's sum-of-squares for the RMSNorm scale, then
// normalize + rotate each rotary pair entirely in registers (no normalized q/k round-trip through
// global memory), writing q/k back and \u2014 for k heads \u2014 the roped key + the (norm/rope-free) value into
// the cache. Fusing these saves a dispatch and a q/k global write+read per attention layer.
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  if (params.past_len >= CACHE_LEN) { return; }
  let pos = params.past_len;
  let index = wid.x;
  let lid = lid3.x;
  let is_k = index >= NUM_HEADS;
  let head = select(index, index - NUM_HEADS, is_k);
  if ((!is_k && head >= NUM_HEADS) || (is_k && head >= NUM_KV_HEADS)) { return; }
  let base = head * HEAD_DIM;
  let norm_off = select(W_Q_NORM, W_K_NORM, is_k);

  // Phase 1: this head's sum of squares (RMSNorm denominator).
  var sum = 0.0;
  for (var d = lid; d < HEAD_DIM; d = d + WORKGROUP_SIZE) {
    var value = 0.0;
    if (is_k) { value = load_activation(k[base + d]); } else { value = load_activation(q[base + d]); }
    sum = fma(value, value, sum);
  }
  partials[lid] = sum;
  workgroupBarrier();
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) { partials[lid] = partials[lid] + partials[lid + stride]; }
    workgroupBarrier();
    if (stride == 1u) { break; }
    stride = stride / 2u;
  }
  let scale = inverseSqrt(partials[0] / f32(HEAD_DIM) + RMS_EPS);

  // Phase 2: normalize (\xD7 scale \xD7 norm_weight) + RoPE each rotary pair (d, d+HEAD_DIM_HALF), in registers.
  for (var d = lid; d < HEAD_DIM_HALF; d = d + WORKGROUP_SIZE) {
    let wd0 = load_weight(weights[norm_off + d]);
    let wd1 = load_weight(weights[norm_off + d + HEAD_DIM_HALF]);
    let rope = rope_index(pos, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    var first = 0.0;
    var second = 0.0;
    if (is_k) {
      first = load_activation(k[base + d]) * scale * wd0;
      second = load_activation(k[base + d + HEAD_DIM_HALF]) * scale * wd1;
    } else {
      first = load_activation(q[base + d]) * scale * wd0;
      second = load_activation(q[base + d + HEAD_DIM_HALF]) * scale * wd1;
    }
    let out_first = first * c - second * s;
    let out_second = second * c + first * s;
    if (is_k) {
      k[base + d] = store_activation(out_first);
      k[base + d + HEAD_DIM_HALF] = store_activation(out_second);
      cache_keys[cache_index(pos, head, d)] = store_cache(out_first);
      cache_keys[cache_index(pos, head, d + HEAD_DIM_HALF)] = store_cache(out_second);
    } else {
      q[base + d] = store_activation(out_first);
      q[base + d + HEAD_DIM_HALF] = store_activation(out_second);
    }
  }

  // Phase 3: copy this k-head's value (no norm/rope) into the cache.
  if (is_k) {
    for (var dim = lid; dim < HEAD_DIM; dim = dim + WORKGROUP_SIZE) {
      cache_values[cache_index(pos, head, dim)] = store_cache(load_activation(v[base + dim]));
    }
  }
}
`]]}],["com.xenova.LlamaDecodeQkNormRopeCacheKvPacked",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkNormRopeCacheKvPacked",sinceVersion:1,inputs:[{role:"Qkv",dtype:"A",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32",rank:1},{role:"RopeSin",dtype:"float32",rank:1}],outputs:[{role:"Qkv",dtype:"A",rank:1,shape:["args.hiddenSize + 2 * args.numKvHeads * args.headDim"]},{role:"CacheKeys",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]},{role:"CacheValues",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]}],typeConstraints:{A:["float32","float16"],W:["float32","float16"],C:["float32","float16"]},args:{qkvT:{kind:"tensor",semantic:"Qkv",role:"inout"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},hiddenSize:{kind:"u32",semantic:"hidden_size"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rmsEps:{kind:"f32",semantic:"rms_eps"},qNormOffset:{kind:"u32",semantic:"q_norm_offset"},kNormOffset:{kind:"u32",semantic:"k_norm_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.qkvT == 1","ranks.weightsT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","(ranks.cosT == 1 or ranks.cosT == 2)","(ranks.sinT == 1 or ranks.sinT == 2)",'(tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','((tensorDtypes.qkvT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.cacheKeysT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.hiddenSize > 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.headDim % 2 == 0","args.headDim <= 256","args.hiddenSize == args.numHeads * args.headDim","dim(shapes.qkvT, 0) == args.hiddenSize + 2 * args.numKvHeads * args.headDim","dim(shapes.weightsT, 0) >= max(args.qNormOffset + args.headDim, args.kNormOffset + args.headDim)","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.cosT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.sinT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.cacheKeysT == "float16"',useSubgroups:'device.features.has("subgroups") and args.headDim >= 32',activationScalar:"dtypes.A",weightScalar:"dtypes.W",cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",hiddenSize:"args.hiddenSize",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",headDim:"args.headDim",headDimHalf:"args.headDim / 2",kvSize:"args.numKvHeads * args.headDim",rmsEps:"args.rmsEps",qNormOffset:"args.qNormOffset",kNormOffset:"args.kNormOffset",workgroupSize:"args.headDim"},passes:[{id:"main",name:"LlamaDecodeQkNormRopeCacheKvPacked",source:{kind:"template",shader:"decode-qk-norm-rope-cache-kv-packed.wgsl.jinja",version:1},bindings:[{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads + args.numKvHeads",y:1,z:1},reads:["Qkv","Weights","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Qkv","CacheKeys","CacheValues"]}]}]},assets:[["decode-qk-norm-rope-cache-kv-packed.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const NUM_HEADS: u32 = {{ numHeads }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_HALF: u32 = {{ headDimHalf }}u;
const KV_SIZE: u32 = {{ kvSize }}u;
const K_OFFSET: u32 = HIDDEN_SIZE;
const V_OFFSET: u32 = HIDDEN_SIZE + KV_SIZE;
const RMS_EPS: f32 = {{ rmsEps }};
const W_Q_NORM: u32 = {{ qNormOffset }}u;
const W_K_NORM: u32 = {{ kNormOffset }}u;
const WORKGROUP_SIZE: u32 = {{ workgroupSize }}u;

var<workgroup> partials: array<f32, {{ workgroupSize }}>;

fn load_activation(value: {{ activationScalar }}) -> f32 {
  return f32(value);
}

fn store_activation(value: f32) -> {{ activationScalar }} {
  return {{ activationScalar }}(value);
}

fn load_weight(value: {{ weightScalar }}) -> f32 {
  return f32(value);
}

fn store_cache(value: f32) -> {{ cacheScalar }} {
  return {{ cacheScalar }}(value);
}

fn rope_index(pos: u32, d: u32) -> u32 {
  return pos * HEAD_DIM_HALF + d;
}

fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

fn q_value(index: u32) -> f32 {
  return load_activation(qkv[index]);
}

fn k_value(index: u32) -> f32 {
  return load_activation(qkv[K_OFFSET + index]);
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
  let group = wid.x;
  let lid = lid3.x;
  if (params.past_len >= CACHE_LEN) {
    return;
  }
  let is_k = group >= NUM_HEADS;
  let head = select(group, group - NUM_HEADS, is_k);
  if ((!is_k && head >= NUM_HEADS) || (is_k && head >= NUM_KV_HEADS)) {
    return;
  }
  let base = head * HEAD_DIM;
  let source = select(W_Q_NORM, W_K_NORM, is_k);

  var sum = 0.0;
  for (var dim = lid; dim < HEAD_DIM; dim = dim + WORKGROUP_SIZE) {
    let value = select(q_value(base + dim), k_value(base + dim), is_k);
    sum = fma(value, value, sum);
  }
{%- if useSubgroups %}
  let subgroup_sum = subgroupAdd(sum);
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
{%- endif %}

  let scale = inverseSqrt(partials[0] / f32(HEAD_DIM) + RMS_EPS);
  if (lid < HEAD_DIM_HALF) {
    let d = lid;
    let weight0 = load_weight(weights[source + d]);
    let weight1 = load_weight(weights[source + d + HEAD_DIM_HALF]);
    let first = select(q_value(base + d), k_value(base + d), is_k) * scale * weight0;
    let second = select(q_value(base + d + HEAD_DIM_HALF), k_value(base + d + HEAD_DIM_HALF), is_k) * scale * weight1;
    let rope = rope_index(params.past_len, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    let out_first = first * c - second * s;
    let out_second = second * c + first * s;
    if (is_k) {
      cache_keys[cache_index(params.past_len, head, d)] = store_cache(out_first);
      cache_keys[cache_index(params.past_len, head, d + HEAD_DIM_HALF)] = store_cache(out_second);
    } else {
      qkv[base + d] = store_activation(out_first);
      qkv[base + d + HEAD_DIM_HALF] = store_activation(out_second);
    }
  }
  if (is_k && lid < HEAD_DIM) {
    cache_values[cache_index(params.past_len, head, lid)] = store_cache(load_activation(qkv[V_OFFSET + base + lid]));
  }
}
`]]}],["com.xenova.LlamaDecodeQkv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkv",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Q",dtype:"float32",rank:1,shape:["args.hiddenSize"]},{role:"K",dtype:"float32",rank:1,shape:["args.numKvHeads * args.headDim"]},{role:"V",dtype:"float32",rank:1,shape:["args.numKvHeads * args.headDim"]}],typeConstraints:{N:["float32","float16"],W:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},qT:{kind:"tensor",semantic:"Q",role:"output"},kT:{kind:"tensor",semantic:"K",role:"output"},vT:{kind:"tensor",semantic:"V",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},qOffset:{kind:"u32",semantic:"q_proj_offset"},kOffset:{kind:"u32",semantic:"k_proj_offset"},vOffset:{kind:"u32",semantic:"v_proj_offset"}},variants:[{id:"dense",priority:0,when:["ranks.normedT == 1","ranks.weightsT == 1","ranks.qT == 1","ranks.kT == 1","ranks.vT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','((tensorDtypes.normedT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.numKvHeads > 0","args.headDim > 0","args.qOffset % 4 == 0","args.kOffset % 4 == 0","args.vOffset % 4 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.qT, 0) == args.hiddenSize","dim(shapes.kT, 0) == args.numKvHeads * args.headDim","dim(shapes.vT, 0) == args.numKvHeads * args.headDim","dim(shapes.weightsT, 0) >= max(args.qOffset + args.hiddenSize * args.hiddenSize, args.kOffset + args.numKvHeads * args.headDim * args.hiddenSize, args.vOffset + args.numKvHeads * args.headDim * args.hiddenSize)"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.weightsT == "float16"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",kvSize:"args.numKvHeads * args.headDim",totalOutputs:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",wQVec4:"args.qOffset / 4",wKVec4:"args.kOffset / 4",wVVec4:"args.vOffset / 4"},passes:[{id:"main",name:"LlamaDecodeQkv",shader:"decode-qkv.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"q",arg:"qT",semantic:"Q",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",y:1,z:1},reads:["Normed","Weights"],writes:["Q","K","V"]}]}]},assets:[["decode-qkv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const KV_SIZE: u32 = {{ kvSize }}u;
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u;
const W_Q_VEC4: u32 = {{ wQVec4 }}u;
const W_K_VEC4: u32 = {{ wKVec4 }}u;
const W_V_VEC4: u32 = {{ wVVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials: array<f32, 64>;

fn load_normed(value: {{ normedVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let index = wid.x;
  let lid = lid3.x;
  if (index >= TOTAL_OUTPUTS) {
    return;
  }

  var weight_base = W_Q_VEC4 + index * HIDDEN_SIZE_VEC4;
  var output_index = index;
  if (index >= HIDDEN_SIZE && index < HIDDEN_SIZE + KV_SIZE) {
    output_index = index - HIDDEN_SIZE;
    weight_base = W_K_VEC4 + output_index * HIDDEN_SIZE_VEC4;
  } else if (index >= HIDDEN_SIZE + KV_SIZE) {
    output_index = index - HIDDEN_SIZE - KV_SIZE;
    weight_base = W_V_VEC4 + output_index * HIDDEN_SIZE_VEC4;
  }

  var acc = 0.0;
  for (var in_dim = lid; in_dim < HIDDEN_SIZE_VEC4; in_dim = in_dim + WORKGROUP_SIZE) {
    let n = load_normed(normed[in_dim]);
    {%- if weightScalar == "f16" %}
    acc = acc + f32(dot(vec4<f16>(n), weights[weight_base + in_dim]));
    {%- else %}
    acc = acc + dot(n, weights[weight_base + in_dim]);
    {%- endif %}
  }
  partials[lid] = acc;
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

  if (lid == 0u) {
    if (index < HIDDEN_SIZE) {
      q[output_index] = partials[0];
    } else if (index < HIDDEN_SIZE + KV_SIZE) {
      k[output_index] = partials[0];
    } else {
      v[output_index] = partials[0];
    }
  }
}
`]]}],["com.xenova.LlamaDecodeQkvNormQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkvNormQ1",sinceVersion:1,inputs:[{role:"Hidden",dtype:"H",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1},{role:"NormWeights",dtype:"W",rank:1}],outputs:[{role:"QKV",dtype:"O",rank:1,shape:["args.hiddenSize + 2 * args.numKvHeads * args.headDim"]}],typeConstraints:{H:["float32","float16"],S:["float32","float16"],W:["float32","float16"],O:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},qkvT:{kind:"tensor",semantic:"QKV",role:"output"},weightsT:{kind:"tensor",semantic:"NormWeights",role:"weights"},hiddenSize:{kind:"u32",semantic:"hidden_size"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"input_norm_offset"},qOffset:{kind:"u32",semantic:"q_proj_q1_block_offset"},kOffset:{kind:"u32",semantic:"k_proj_q1_block_offset"},vOffset:{kind:"u32",semantic:"v_proj_q1_block_offset"}},variants:[{id:"q1",priority:0,when:["ranks.hiddenT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.qkvT == 1","ranks.weightsT == 1",'(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','((tensorDtypes.hiddenT != "float16" and tensorDtypes.q1ScalesT != "float16" and tensorDtypes.qkvT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.numKvHeads > 0","args.headDim > 0","(args.numKvHeads * args.headDim) % 4 == 0","args.normOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.qkvT, 0) == args.hiddenSize + 2 * args.numKvHeads * args.headDim","dim(shapes.weightsT, 0) >= args.normOffset + args.hiddenSize","dim(shapes.q1BitsT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 128), args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 128), args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128))"],constants:{usesF16:'tensorDtypes.hiddenT == "float16" or tensorDtypes.q1ScalesT == "float16" or tensorDtypes.qkvT == "float16" or tensorDtypes.weightsT == "float16"',useSubgroups:'device.features.has("subgroups")',hiddenVec4:'"vec4<f16>" if tensorDtypes.hiddenT == "float16" else "vec4<f32>"',normWeightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",outputScalar:"dtypes.O",hiddenSize:"args.hiddenSize",hiddenSizeQ1Words:"args.hiddenSize / 32",blocksPerRow:"args.hiddenSize / 128",kvSize:"args.numKvHeads * args.headDim",totalOutputs:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4",qOffset:"args.qOffset",kOffset:"args.kOffset",vOffset:"args.vOffset"},passes:[{id:"main",name:"LlamaDecodeQkvNormQ1",source:{kind:"template",shader:"decode-qkv-norm-q1.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"qkv",arg:"qkvT",semantic:"QKV",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"},{name:"norm_weight",arg:"weightsT",semantic:"NormWeights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$normWeightVec4"}],dispatch:{x:"ceil((args.hiddenSize + 2 * args.numKvHeads * args.headDim) / 4)",y:1,z:1},reads:["Hidden","Q1Bits","Q1Scales","NormWeights"],writes:["QKV"]}]}]},assets:[["decode-qkv-norm-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_Q1_WORDS: u32 = {{ hiddenSizeQ1Words }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const KV_SIZE: u32 = {{ kvSize }}u;
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const W_Q_Q1: u32 = {{ qOffset }}u;
const W_K_Q1: u32 = {{ kOffset }}u;
const W_V_Q1: u32 = {{ vOffset }}u;
const WORKGROUP_SIZE: u32 = 32u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, 32>;
var<workgroup> partials1: array<f32, 32>;
var<workgroup> partials2: array<f32, 32>;
var<workgroup> partials3: array<f32, 32>;
var<workgroup> partials_ss: array<f32, 32>;


fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}

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

@compute @workgroup_size(32)
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
  if (index0 >= TOTAL_OUTPUTS) {
    return;
  }

  var block_offset = W_Q_Q1;
  var tile = index0 / TILE_ROWS;
  let out_base = index0;
  if (index0 >= HIDDEN_SIZE && index0 < HIDDEN_SIZE + KV_SIZE) {
    block_offset = W_K_Q1;
    tile = (index0 - HIDDEN_SIZE) / TILE_ROWS;
  } else if (index0 >= HIDDEN_SIZE + KV_SIZE) {
    block_offset = W_V_Q1;
    tile = (index0 - HIDDEN_SIZE - KV_SIZE) / TILE_ROWS;
  }

  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
  var ss = 0.0;
  for (var word_index = lid; word_index < HIDDEN_SIZE_Q1_WORDS; word_index = word_index + WORKGROUP_SIZE) {
    let col_block = word_index / 4u;
    let word_id = word_index % 4u;
    let base4 = word_index * 8u;
{%- if hiddenVec4 == "vec4<f32>" %}
    let h0 = hidden[base4];
    let h1 = hidden[base4 + 1u];
    let h2 = hidden[base4 + 2u];
    let h3 = hidden[base4 + 3u];
    let h4 = hidden[base4 + 4u];
    let h5 = hidden[base4 + 5u];
    let h6 = hidden[base4 + 6u];
    let h7 = hidden[base4 + 7u];
{%- else %}
    let h0 = vec4<f32>(hidden[base4]);
    let h1 = vec4<f32>(hidden[base4 + 1u]);
    let h2 = vec4<f32>(hidden[base4 + 2u]);
    let h3 = vec4<f32>(hidden[base4 + 3u]);
    let h4 = vec4<f32>(hidden[base4 + 4u]);
    let h5 = vec4<f32>(hidden[base4 + 5u]);
    let h6 = vec4<f32>(hidden[base4 + 6u]);
    let h7 = vec4<f32>(hidden[base4 + 7u]);
{%- endif %}
    ss += dot(h0, h0) + dot(h1, h1) + dot(h2, h2) + dot(h3, h3) +
      dot(h4, h4) + dot(h5, h5) + dot(h6, h6) + dot(h7, h7);

    let g_base = W_NORM_VEC4 + base4;
{%- if normWeightVec4 == "vec4<f32>" %}
    let n0 = h0 * norm_weight[g_base];
    let n1 = h1 * norm_weight[g_base + 1u];
    let n2 = h2 * norm_weight[g_base + 2u];
    let n3 = h3 * norm_weight[g_base + 3u];
    let n4 = h4 * norm_weight[g_base + 4u];
    let n5 = h5 * norm_weight[g_base + 5u];
    let n6 = h6 * norm_weight[g_base + 6u];
    let n7 = h7 * norm_weight[g_base + 7u];
{%- else %}
    let n0 = h0 * vec4<f32>(norm_weight[g_base]);
    let n1 = h1 * vec4<f32>(norm_weight[g_base + 1u]);
    let n2 = h2 * vec4<f32>(norm_weight[g_base + 2u]);
    let n3 = h3 * vec4<f32>(norm_weight[g_base + 3u]);
    let n4 = h4 * vec4<f32>(norm_weight[g_base + 4u]);
    let n5 = h5 * vec4<f32>(norm_weight[g_base + 5u]);
    let n6 = h6 * vec4<f32>(norm_weight[g_base + 6u]);
    let n7 = h7 * vec4<f32>(norm_weight[g_base + 7u]);
{%- endif %}
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
  let subgroup_ss = subgroupAdd(ss);
  if (WORKGROUP_SIZE == sg_size) {
    if (lid == 0u) {
      partials0[0] = subgroup_sum0;
      partials1[0] = subgroup_sum1;
      partials2[0] = subgroup_sum2;
      partials3[0] = subgroup_sum3;
      partials_ss[0] = subgroup_ss;
    }
    workgroupBarrier();
  } else {
    if (sg_lid == 0u) {
      let subgroup_index = lid / sg_size;
      partials0[subgroup_index] = subgroup_sum0;
      partials1[subgroup_index] = subgroup_sum1;
      partials2[subgroup_index] = subgroup_sum2;
      partials3[subgroup_index] = subgroup_sum3;
      partials_ss[subgroup_index] = subgroup_ss;
    }
    workgroupBarrier();
    if (lid == 0u) {
      var total0 = 0.0;
      var total1 = 0.0;
      var total2 = 0.0;
      var total3 = 0.0;
      var total_ss = 0.0;
      let subgroup_count = WORKGROUP_SIZE / sg_size;
      for (var i = 0u; i < subgroup_count; i = i + 1u) {
        total0 = total0 + partials0[i];
        total1 = total1 + partials1[i];
        total2 = total2 + partials2[i];
        total3 = total3 + partials3[i];
        total_ss = total_ss + partials_ss[i];
      }
      partials0[0] = total0;
      partials1[0] = total1;
      partials2[0] = total2;
      partials3[0] = total3;
      partials_ss[0] = total_ss;
    }
    workgroupBarrier();
  }
{%- else %}
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials2[lid] = acc2;
  partials3[lid] = acc3;
  partials_ss[lid] = ss;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials2[lid] = partials2[lid] + partials2[lid + stride];
      partials3[lid] = partials3[lid] + partials3[lid + stride];
      partials_ss[lid] = partials_ss[lid] + partials_ss[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
{%- endif %}

  if (lid == 0u) {
    let scale = inverseSqrt(partials_ss[0] / f32(HIDDEN_SIZE) + RMS_EPS);
{%- if outputScalar == "f32" %}
    qkv[out_base + 0u] = partials0[0] * scale;
    qkv[out_base + 1u] = partials1[0] * scale;
    qkv[out_base + 2u] = partials2[0] * scale;
    qkv[out_base + 3u] = partials3[0] * scale;
{%- else %}
    qkv[out_base + 0u] = {{ outputScalar }}(partials0[0] * scale);
    qkv[out_base + 1u] = {{ outputScalar }}(partials1[0] * scale);
    qkv[out_base + 2u] = {{ outputScalar }}(partials2[0] * scale);
    qkv[out_base + 3u] = {{ outputScalar }}(partials3[0] * scale);
{%- endif %}
  }
}
`]]}],["com.xenova.LlamaDecodeQkvNormQ4",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkvNormQ4",sinceVersion:1,inputs:[{role:"Hidden",dtype:"H",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1},{role:"Q4Scales",dtype:"S",rank:1},{role:"NormWeights",dtype:"W",rank:1}],outputs:[{role:"Q",dtype:"float32",rank:1,shape:["args.hiddenSize"]},{role:"K",dtype:"float32",rank:1,shape:["args.numKvHeads * args.headDim"]},{role:"V",dtype:"float32",rank:1,shape:["args.numKvHeads * args.headDim"]}],typeConstraints:{H:["float32","float16"],S:["float32","float16"],W:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights"},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights"},weightsT:{kind:"tensor",semantic:"NormWeights",role:"weights"},qT:{kind:"tensor",semantic:"Q",role:"output"},kT:{kind:"tensor",semantic:"K",role:"output"},vT:{kind:"tensor",semantic:"V",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"input_norm_offset"},qOffset:{kind:"u32",semantic:"q_proj_q4_block_offset"},kOffset:{kind:"u32",semantic:"k_proj_q4_block_offset"},vOffset:{kind:"u32",semantic:"v_proj_q4_block_offset"},quantBits:{kind:"u32",semantic:"packed_quant_bits"},hasMin:{kind:"u32",semantic:"kquant_has_min",required:!1}},variants:[{id:"q4",priority:0,when:["ranks.hiddenT == 1","ranks.q4BitsT == 1","ranks.q4ScalesT == 1","ranks.weightsT == 1","ranks.qT == 1","ranks.kT == 1","ranks.vT == 1",'(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','tensorDtypes.q4BitsT == "uint32"','(tensorDtypes.q4ScalesT == "float32" or tensorDtypes.q4ScalesT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','((tensorDtypes.hiddenT != "float16" and tensorDtypes.q4ScalesT != "float16" and tensorDtypes.weightsT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 32 == 0","args.numKvHeads > 0","args.headDim > 0","args.normOffset % 4 == 0","(args.quantBits == 4 or args.quantBits == 8)","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.qT, 0) == args.hiddenSize","dim(shapes.kT, 0) == args.numKvHeads * args.headDim","dim(shapes.vT, 0) == args.numKvHeads * args.headDim","dim(shapes.weightsT, 0) >= args.normOffset + args.hiddenSize","dim(shapes.q4BitsT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 32), max(args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32))) * args.quantBits","dim(shapes.q4ScalesT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 32), max(args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32))) * (2 if args.hasMin else 1)"],constants:{useSubgroups:'device.features.has("subgroups") and has(device.adapterInfo, "subgroupMinSize") and device.adapterInfo.subgroupMinSize >= 32',usesF16:'tensorDtypes.hiddenT == "float16" or tensorDtypes.q4ScalesT == "float16" or tensorDtypes.weightsT == "float16"',scaleScalar:"dtypes.S",hiddenVec4:'"vec4<f16>" if tensorDtypes.hiddenT == "float16" else "vec4<f32>"',normWeightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",blocksPerRow:"args.hiddenSize / 32",kvSize:"args.numKvHeads * args.headDim",totalOutputs:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4",wQ:"args.qOffset",wK:"args.kOffset",wV:"args.vOffset",quantBits:"args.quantBits",hasMin:"args.hasMin if args.hasMin else 0"},passes:[{id:"main",name:"LlamaDecodeQkvNormQ4",shader:"decode-qkv-norm-q4.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"norm_weight",arg:"weightsT",semantic:"NormWeights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$normWeightVec4"},{name:"q",arg:"qT",semantic:"Q",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",y:1,z:1},reads:["Hidden","Q4Bits","Q4Scales","NormWeights"],writes:["Q","K","V"]}]}]},assets:[["decode-qkv-norm-q4.wgsl.jinja",`{%- if useSubgroups %}
enable subgroups;
{% endif -%}
{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const BPR: u32 = {{ blocksPerRow }}u;          // Q4_0 blocks per weight row (hidden / 32)
const KV_SIZE: u32 = {{ kvSize }}u;
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const W_Q_Q4: u32 = {{ wQ }}u;
const W_K_Q4: u32 = {{ wK }}u;
const W_V_Q4: u32 = {{ wV }}u;
const WORKGROUP_SIZE: u32 = 32u;

{%- if not useSubgroups %}
var<workgroup> partials: array<f32, 32>;
var<workgroup> partials_ss: array<f32, 32>;
{% endif %}

{%- if quantBits == 8 %}
// Q8_0 dequant: a u32 word holds 4 signed int8 in contiguous element order (one block = 32 elements
// = 2 vec4<u32>); dequant = q (scale applied once per block by the caller).
fn q8dot(word: u32, xv: vec4<f32>) -> f32 {
  return dot(vec4<f32>(unpack4xI8(word)), xv);
}
{%- else %}
fn q4_lo(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8(word & 0x0F0F0F0Fu)) - 8.0;
}
fn q4_hi(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8((word >> 4u) & 0x0F0F0F0Fu)) - 8.0;
}
fn q4wp(word: u32, lo: vec4<f32>, hi: vec4<f32>) -> f32 {
  return dot(lo, q4_lo(word)) + dot(hi, q4_hi(word));
}
{%- endif %}

// Fused input RMSNorm + q/k/v GEMV with in-kernel Q4_0 dequant. The RMSNorm scale is a per-token
// scalar that factors out of the linear GEMV, so we GEMV on (hidden*norm_weight), accumulate
// sum(hidden^2), and apply inverseSqrt(ss/H+eps) to every output at the end. (For q/k the scale is
// divided back out by the later per-head qk-norm; for v it is the real normalization \u2014 applying it
// to all three matches the standalone rmsNorm -> qkv path.) One output row per workgroup over the
// concatenated q|k|v space. Mirrors decode-qkv-q4 + decode-gate-up-norm-q4.
@compute @workgroup_size(32)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let index = wid.x;
  let lid = lid3.x;
  if (index >= TOTAL_OUTPUTS) {
    return;
  }

  var output_index = index;
  var row_block_base = W_Q_Q4 + index * BPR;
  if (index >= HIDDEN_SIZE && index < HIDDEN_SIZE + KV_SIZE) {
    output_index = index - HIDDEN_SIZE;
    row_block_base = W_K_Q4 + output_index * BPR;
  } else if (index >= HIDDEN_SIZE + KV_SIZE) {
    output_index = index - HIDDEN_SIZE - KV_SIZE;
    row_block_base = W_V_Q4 + output_index * BPR;
  }

  var acc = 0.0;
  var ss = 0.0;
  for (var b = lid; b < BPR; b = b + WORKGROUP_SIZE) {
    let hbase = b * 8u;
    let h0 = vec4<f32>(hidden[hbase]);
    let h1 = vec4<f32>(hidden[hbase + 1u]);
    let h2 = vec4<f32>(hidden[hbase + 2u]);
    let h3 = vec4<f32>(hidden[hbase + 3u]);
    let h4 = vec4<f32>(hidden[hbase + 4u]);
    let h5 = vec4<f32>(hidden[hbase + 5u]);
    let h6 = vec4<f32>(hidden[hbase + 6u]);
    let h7 = vec4<f32>(hidden[hbase + 7u]);
    ss = ss + dot(h0, h0) + dot(h1, h1) + dot(h2, h2) + dot(h3, h3) +
      dot(h4, h4) + dot(h5, h5) + dot(h6, h6) + dot(h7, h7);

    let nb = W_NORM_VEC4 + hbase;
    let n0 = h0 * vec4<f32>(norm_weight[nb]);
    let n1 = h1 * vec4<f32>(norm_weight[nb + 1u]);
    let n2 = h2 * vec4<f32>(norm_weight[nb + 2u]);
    let n3 = h3 * vec4<f32>(norm_weight[nb + 3u]);
    let n4 = h4 * vec4<f32>(norm_weight[nb + 4u]);
    let n5 = h5 * vec4<f32>(norm_weight[nb + 5u]);
    let n6 = h6 * vec4<f32>(norm_weight[nb + 6u]);
    let n7 = h7 * vec4<f32>(norm_weight[nb + 7u]);

    let scale = f32(q4_scales[{% if hasMin %}(row_block_base + b) * 2u{% else %}row_block_base + b{% endif %}]);
{%- if hasMin %}
    let bias = f32(q4_scales[(row_block_base + b) * 2u + 1u]);
    let sn = dot(n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7, vec4<f32>(1.0));
    let words = q4_bits[row_block_base + b];
    acc = acc + scale * (
      q4wp(words.x, n0, n4) +
      q4wp(words.y, n1, n5) +
      q4wp(words.z, n2, n6) +
      q4wp(words.w, n3, n7)) + bias * sn;
{%- elif quantBits == 8 %}
    let w0 = q4_bits[(row_block_base + b) * 2u];
    let w1 = q4_bits[(row_block_base + b) * 2u + 1u];
    acc = acc + scale * (
      q8dot(w0.x, n0) + q8dot(w0.y, n1) + q8dot(w0.z, n2) + q8dot(w0.w, n3) +
      q8dot(w1.x, n4) + q8dot(w1.y, n5) + q8dot(w1.z, n6) + q8dot(w1.w, n7));
{%- else %}
    let words = q4_bits[row_block_base + b];
    acc = acc + scale * (
      q4wp(words.x, n0, n4) +
      q4wp(words.y, n1, n5) +
      q4wp(words.z, n2, n6) +
      q4wp(words.w, n3, n7));
{%- endif %}
  }

{%- if useSubgroups %}
  let acc_total = subgroupAdd(acc);
  let ss_total = subgroupAdd(ss);
{% else %}
  partials[lid] = acc;
  partials_ss[lid] = ss;
  workgroupBarrier();
  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials[lid] = partials[lid] + partials[lid + stride];
      partials_ss[lid] = partials_ss[lid] + partials_ss[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }
  let acc_total = partials[0];
  let ss_total = partials_ss[0];
{% endif %}

  if (lid == 0u) {
    let out = acc_total * inverseSqrt(ss_total / f32(HIDDEN_SIZE) + RMS_EPS);
    if (index < HIDDEN_SIZE) {
      q[output_index] = out;
    } else if (index < HIDDEN_SIZE + KV_SIZE) {
      k[output_index] = out;
    } else {
      v[output_index] = out;
    }
  }
}
`]]}],["com.xenova.LlamaDecodeQkvQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkvQ1",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1}],outputs:[{role:"QKV",dtype:"O",rank:1}],typeConstraints:{N:["float32","float16"],S:["float32","float16"],O:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},qkvT:{kind:"tensor",semantic:"QKV",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},qOffset:{kind:"u32",semantic:"q_proj_q1_block_offset"},kOffset:{kind:"u32",semantic:"k_proj_q1_block_offset"},vOffset:{kind:"u32",semantic:"v_proj_q1_block_offset"}},variants:[{id:"q1",priority:0,when:["ranks.normedT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.qkvT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','(tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16")','((tensorDtypes.normedT != "float16" and tensorDtypes.q1ScalesT != "float16" and tensorDtypes.qkvT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.numKvHeads > 0","args.headDim > 0","(args.numKvHeads * args.headDim) % 4 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.qkvT, 0) == args.hiddenSize + 2 * args.numKvHeads * args.headDim","dim(shapes.q1BitsT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 128), args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 128), args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 128))"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.q1ScalesT == "float16" or tensorDtypes.qkvT == "float16"',useSubgroups:'device.features.has("subgroups")',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',scaleScalar:"dtypes.S",outputScalar:"dtypes.O",hiddenSize:"args.hiddenSize",hiddenSizeQ1Words:"args.hiddenSize / 32",blocksPerRow:"args.hiddenSize / 128",kvSize:"args.numKvHeads * args.headDim",totalOutputs:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",qOffset:"args.qOffset",kOffset:"args.kOffset",vOffset:"args.vOffset"},passes:[{id:"main",name:"LlamaDecodeQkvQ1",source:{kind:"template",shader:"decode-qkv-q1.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"qkv",arg:"qkvT",semantic:"QKV",role:"output",buffer:{type:"storage"},elementType:"$outputScalar"}],dispatch:{x:"ceil((args.hiddenSize + 2 * args.numKvHeads * args.headDim) / 4)",y:1,z:1},reads:["Normed","Q1Bits","Q1Scales"],writes:["QKV"]}]}]},assets:[["decode-qkv-q1.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}
{%- if useSubgroups %}
enable subgroups;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_Q1_WORDS: u32 = {{ hiddenSizeQ1Words }}u;
const BPR: u32 = {{ blocksPerRow }}u;
const KV_SIZE: u32 = {{ kvSize }}u;
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u;
const W_Q_Q1: u32 = {{ qOffset }}u;
const W_K_Q1: u32 = {{ kOffset }}u;
const W_V_Q1: u32 = {{ vOffset }}u;
const WORKGROUP_SIZE: u32 = 32u;
const TILE_ROWS: u32 = 4u;

var<workgroup> partials0: array<f32, 32>;
var<workgroup> partials1: array<f32, 32>;
var<workgroup> partials2: array<f32, 32>;
var<workgroup> partials3: array<f32, 32>;


fn q1_signs4_unit(word: u32, shift: u32) -> vec4<f32> {
  let bits = (vec4<u32>(word) >> vec4<u32>(shift, shift + 1u, shift + 2u, shift + 3u)) & vec4<u32>(1u);
  return select(vec4<f32>(-1.0), vec4<f32>(1.0), bits == vec4<u32>(1u));
}

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

@compute @workgroup_size(32)
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
  if (index0 >= TOTAL_OUTPUTS) {
    return;
  }

  var block_offset = W_Q_Q1;
  var tile = index0 / 4u;
  let out_base = index0;
  if (index0 >= HIDDEN_SIZE && index0 < HIDDEN_SIZE + KV_SIZE) {
    block_offset = W_K_Q1;
    tile = (index0 - HIDDEN_SIZE) / 4u;
  } else if (index0 >= HIDDEN_SIZE + KV_SIZE) {
    block_offset = W_V_Q1;
    tile = (index0 - HIDDEN_SIZE - KV_SIZE) / 4u;
  }

  var acc0 = 0.0;
  var acc1 = 0.0;
  var acc2 = 0.0;
  var acc3 = 0.0;
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

  if (lid == 0u) {
{%- if outputScalar == "f32" %}
    qkv[out_base + 0u] = partials0[0];
    qkv[out_base + 1u] = partials1[0];
    qkv[out_base + 2u] = partials2[0];
    qkv[out_base + 3u] = partials3[0];
{%- else %}
    qkv[out_base + 0u] = {{ outputScalar }}(partials0[0]);
    qkv[out_base + 1u] = {{ outputScalar }}(partials1[0]);
    qkv[out_base + 2u] = {{ outputScalar }}(partials2[0]);
    qkv[out_base + 3u] = {{ outputScalar }}(partials3[0]);
{%- endif %}
  }
}
`]]}],["com.xenova.LlamaDecodeQkvQ4",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkvQ4",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Q4Bits",dtype:"uint32",rank:1},{role:"Q4Scales",dtype:"S",rank:1}],outputs:[{role:"Q",dtype:"float32",rank:1},{role:"K",dtype:"float32",rank:1},{role:"V",dtype:"float32",rank:1}],typeConstraints:{N:["float32","float16"],S:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},q4BitsT:{kind:"tensor",semantic:"Q4Bits",role:"weights"},q4ScalesT:{kind:"tensor",semantic:"Q4Scales",role:"weights"},qT:{kind:"tensor",semantic:"Q",role:"output"},kT:{kind:"tensor",semantic:"K",role:"output"},vT:{kind:"tensor",semantic:"V",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},qOffset:{kind:"u32",semantic:"q_proj_q4_block_offset"},kOffset:{kind:"u32",semantic:"k_proj_q4_block_offset"},vOffset:{kind:"u32",semantic:"v_proj_q4_block_offset"},quantBits:{kind:"u32",semantic:"packed_quant_bits"},hasMin:{kind:"u32",semantic:"kquant_has_min",required:!1}},variants:[{id:"q4",priority:0,when:["ranks.normedT == 1","ranks.q4BitsT == 1","ranks.q4ScalesT == 1","ranks.qT == 1","ranks.kT == 1","ranks.vT == 1",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','tensorDtypes.q4BitsT == "uint32"','(tensorDtypes.q4ScalesT == "float32" or tensorDtypes.q4ScalesT == "float16")','tensorDtypes.qT == "float32"','tensorDtypes.kT == "float32"','tensorDtypes.vT == "float32"','((tensorDtypes.normedT != "float16" and tensorDtypes.q4ScalesT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 32 == 0","args.numKvHeads > 0","args.headDim > 0","(args.quantBits == 4 or args.quantBits == 8)","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.qT, 0) == args.hiddenSize","dim(shapes.kT, 0) == args.numKvHeads * args.headDim","dim(shapes.vT, 0) == args.numKvHeads * args.headDim","dim(shapes.q4BitsT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 32), max(args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32))) * args.quantBits","dim(shapes.q4ScalesT, 0) >= max(args.qOffset + args.hiddenSize * (args.hiddenSize / 32), max(args.kOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32), args.vOffset + args.numKvHeads * args.headDim * (args.hiddenSize / 32))) * (2 if args.hasMin else 1)"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.q4ScalesT == "float16"',scaleScalar:"dtypes.S",normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",blocksPerRow:"args.hiddenSize / 32",kvSize:"args.numKvHeads * args.headDim",totalOutputs:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",wQ:"args.qOffset",wK:"args.kOffset",wV:"args.vOffset",quantBits:"args.quantBits",hasMin:"args.hasMin if args.hasMin else 0"},passes:[{id:"main",name:"LlamaDecodeQkvQ4",shader:"decode-qkv-q4.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"q4_bits",arg:"q4BitsT",semantic:"Q4Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q4_scales",arg:"q4ScalesT",semantic:"Q4Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"q",arg:"qT",semantic:"Q",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"k",arg:"kT",semantic:"K",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"v",arg:"vT",semantic:"V",role:"output",buffer:{type:"storage"},elementType:"f32"}],dispatch:{x:"args.hiddenSize + 2 * args.numKvHeads * args.headDim",y:1,z:1},reads:["Normed","Q4Bits","Q4Scales"],writes:["Q","K","V"]}]}]},assets:[["decode-qkv-q4.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const BPR: u32 = {{ blocksPerRow }}u;          // Q4_0 blocks per weight row (hidden / 32)
const KV_SIZE: u32 = {{ kvSize }}u;
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u;
const W_Q_Q4: u32 = {{ wQ }}u;
const W_K_Q4: u32 = {{ wK }}u;
const W_V_Q4: u32 = {{ wV }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials: array<f32, 64>;

{%- if quantBits == 8 %}
// Q8_0 dequant: a u32 word holds 4 signed int8 in contiguous element order (one block = 32 elements
// = 2 vec4<u32>); dequant = q (scale applied once per block by the caller).
fn q8dot(word: u32, xv: vec4<f32>) -> f32 {
  return dot(vec4<f32>(unpack4xI8(word)), xv);
}
{%- else %}
fn q4_lo(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8(word & 0x0F0F0F0Fu)) - 8.0;
}
fn q4_hi(word: u32) -> vec4<f32> {
  return vec4<f32>(unpack4xU8((word >> 4u) & 0x0F0F0F0Fu)) - 8.0;
}
fn q4wp(word: u32, lo: vec4<f32>, hi: vec4<f32>) -> f32 {
  return dot(lo, q4_lo(word)) + dot(hi, q4_hi(word));
}
{%- endif %}

// Fused q/k/v GEMV with in-kernel Q4_0 dequant: one output row per workgroup over the concatenated
// q|k|v space; the index range picks which packed matrix + row.
@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let index = wid.x;
  let lid = lid3.x;
  if (index >= TOTAL_OUTPUTS) {
    return;
  }

  var output_index = index;
  var row_block_base = W_Q_Q4 + index * BPR;
  if (index >= HIDDEN_SIZE && index < HIDDEN_SIZE + KV_SIZE) {
    output_index = index - HIDDEN_SIZE;
    row_block_base = W_K_Q4 + output_index * BPR;
  } else if (index >= HIDDEN_SIZE + KV_SIZE) {
    output_index = index - HIDDEN_SIZE - KV_SIZE;
    row_block_base = W_V_Q4 + output_index * BPR;
  }

  var acc = 0.0;
  for (var b = lid; b < BPR; b = b + WORKGROUP_SIZE) {
    let blk = row_block_base + b;
    let scale = f32(q4_scales[{% if hasMin %}blk * 2u{% else %}blk{% endif %}]);
    let hbase = b * 8u;
    let n0 = vec4<f32>(normed[hbase]);
    let n1 = vec4<f32>(normed[hbase + 1u]);
    let n2 = vec4<f32>(normed[hbase + 2u]);
    let n3 = vec4<f32>(normed[hbase + 3u]);
    let n4 = vec4<f32>(normed[hbase + 4u]);
    let n5 = vec4<f32>(normed[hbase + 5u]);
    let n6 = vec4<f32>(normed[hbase + 6u]);
    let n7 = vec4<f32>(normed[hbase + 7u]);
{%- if hasMin %}
    let bias = f32(q4_scales[blk * 2u + 1u]);
    let sn = dot(n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7, vec4<f32>(1.0));
    let words = q4_bits[blk];
    acc = acc + scale * (
      q4wp(words.x, n0, n4) +
      q4wp(words.y, n1, n5) +
      q4wp(words.z, n2, n6) +
      q4wp(words.w, n3, n7)) + bias * sn;
{%- elif quantBits == 8 %}
    let w0 = q4_bits[blk * 2u];
    let w1 = q4_bits[blk * 2u + 1u];
    acc = acc + scale * (
      q8dot(w0.x, n0) + q8dot(w0.y, n1) + q8dot(w0.z, n2) + q8dot(w0.w, n3) +
      q8dot(w1.x, n4) + q8dot(w1.y, n5) + q8dot(w1.z, n6) + q8dot(w1.w, n7));
{%- else %}
    let words = q4_bits[blk];
    acc = acc + scale * (
      q4wp(words.x, n0, n4) +
      q4wp(words.y, n1, n5) +
      q4wp(words.z, n2, n6) +
      q4wp(words.w, n3, n7));
{%- endif %}
  }

  partials[lid] = acc;
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

  if (lid == 0u) {
    if (index < HIDDEN_SIZE) {
      q[output_index] = partials[0];
    } else if (index < HIDDEN_SIZE + KV_SIZE) {
      k[output_index] = partials[0];
    } else {
      v[output_index] = partials[0];
    }
  }
}
`]]}],["com.xenova.LlamaDecodeQkvRopeCache",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkvRopeCache",sinceVersion:1,inputs:[{role:"Normed",dtype:"N",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"Q",dtype:"float32",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32",rank:1},{role:"RopeSin",dtype:"float32",rank:1}],outputs:[{role:"Q",dtype:"float32",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],typeConstraints:{N:["float32","float16"],W:["float32","float16"],C:["float32","float16"]},args:{normedT:{kind:"tensor",semantic:"Normed",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},qT:{kind:"tensor",semantic:"Q",role:"inout"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},hiddenSize:{kind:"u32",semantic:"hidden_size"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},qOffset:{kind:"u32",semantic:"q_proj_offset"},kOffset:{kind:"u32",semantic:"k_proj_offset"},vOffset:{kind:"u32",semantic:"v_proj_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.normedT == 1","ranks.weightsT == 1","ranks.qT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","(ranks.cosT == 1 or ranks.cosT == 2)","(ranks.sinT == 1 or ranks.sinT == 2)",'(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.qT == "float32"',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','((tensorDtypes.normedT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.cacheKeysT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.headDim % 2 == 0","args.qOffset % 4 == 0","args.kOffset % 4 == 0","args.vOffset % 4 == 0","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.qT, 0) == args.numHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.cosT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.sinT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))","dim(shapes.weightsT, 0) >= max(args.qOffset + args.numHeads * args.headDim * args.hiddenSize, args.kOffset + args.numKvHeads * args.headDim * args.hiddenSize, args.vOffset + args.numKvHeads * args.headDim * args.hiddenSize)"],constants:{usesF16:'tensorDtypes.normedT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.cacheKeysT == "float16"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",hiddenSizeVec4:"args.hiddenSize / 4",numKvHeads:"args.numKvHeads",headDim:"args.headDim",headDimHalf:"args.headDim / 2",qPairs:"args.numHeads * (args.headDim / 2)",kPairs:"args.numKvHeads * (args.headDim / 2)",vOffset:"args.numHeads * (args.headDim / 2) + args.numKvHeads * (args.headDim / 2)",totalOutputs:"args.numHeads * (args.headDim / 2) + args.numKvHeads * (args.headDim / 2) + args.numKvHeads * args.headDim",wQVec4:"args.qOffset / 4",wKVec4:"args.kOffset / 4",wVVec4:"args.vOffset / 4"},passes:[{id:"main",name:"LlamaDecodeQkvRopeCache",shader:"decode-qkv-rope-cache.wgsl.jinja",bindings:[{name:"normed",arg:"normedT",semantic:"Normed",role:"input",buffer:{type:"read-only-storage"},elementType:"$normedVec4"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads * (args.headDim / 2) + args.numKvHeads * (args.headDim / 2) + args.numKvHeads * args.headDim",y:1,z:1},reads:["Normed","Weights","Q","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Q","CacheKeys","CacheValues"]}]}]},assets:[["decode-qkv-rope-cache.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_HALF: u32 = {{ headDimHalf }}u;
const Q_PAIRS: u32 = {{ qPairs }}u;
const V_OFFSET: u32 = {{ vOffset }}u;
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u;
const W_Q_VEC4: u32 = {{ wQVec4 }}u;
const W_K_VEC4: u32 = {{ wKVec4 }}u;
const W_V_VEC4: u32 = {{ wVVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;

var<workgroup> partials0: array<f32, 64>;
var<workgroup> partials1: array<f32, 64>;

fn load_normed(value: {{ normedVec4 }}) -> vec4<f32> {
  return vec4<f32>(value);
}

fn store_cache(value: f32) -> {{ cacheScalar }} {
  return {{ cacheScalar }}(value);
}

fn rope_index(pos: u32, d: u32) -> u32 {
  return pos * HEAD_DIM_HALF + d;
}

fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let index = wid.x;
  let lid = lid3.x;
  if (index >= TOTAL_OUTPUTS || params.past_len >= CACHE_LEN) {
    return;
  }

  let is_q = index < Q_PAIRS;
  let is_k = index >= Q_PAIRS && index < V_OFFSET;
  var pair_index = index;
  var row0 = 0u;
  var row1 = 0u;
  var weight_base0 = W_V_VEC4;
  var weight_base1 = W_V_VEC4;

  if (is_q) {
    let head = pair_index / HEAD_DIM_HALF;
    let d = pair_index % HEAD_DIM_HALF;
    row0 = head * HEAD_DIM + d;
    row1 = row0 + HEAD_DIM_HALF;
    weight_base0 = W_Q_VEC4 + row0 * HIDDEN_SIZE_VEC4;
    weight_base1 = W_Q_VEC4 + row1 * HIDDEN_SIZE_VEC4;
  } else if (is_k) {
    pair_index = index - Q_PAIRS;
    let head = pair_index / HEAD_DIM_HALF;
    let d = pair_index % HEAD_DIM_HALF;
    row0 = head * HEAD_DIM + d;
    row1 = row0 + HEAD_DIM_HALF;
    weight_base0 = W_K_VEC4 + row0 * HIDDEN_SIZE_VEC4;
    weight_base1 = W_K_VEC4 + row1 * HIDDEN_SIZE_VEC4;
  } else {
    row0 = index - V_OFFSET;
    weight_base0 = W_V_VEC4 + row0 * HIDDEN_SIZE_VEC4;
  }

  var acc0 = 0.0;
  var acc1 = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let x = load_normed(normed[dim]);
    {%- if weightScalar == "f16" %}
    acc0 = acc0 + f32(dot(vec4<f16>(x), weights[weight_base0 + dim]));
    {%- else %}
    acc0 = acc0 + dot(x, weights[weight_base0 + dim]);
    {%- endif %}
    if (is_q || is_k) {
      {%- if weightScalar == "f16" %}
      acc1 = acc1 + f32(dot(vec4<f16>(x), weights[weight_base1 + dim]));
      {%- else %}
      acc1 = acc1 + dot(x, weights[weight_base1 + dim]);
      {%- endif %}
    }
  }
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  if (lid == 0u) {
    if (is_q || is_k) {
      let d = row0 % HEAD_DIM;
      let head = row0 / HEAD_DIM;
      let rope = rope_index(params.past_len, d);
      let c = rope_cos[rope];
      let s = rope_sin[rope];
      let out0 = partials0[0] * c - partials1[0] * s;
      let out1 = partials1[0] * c + partials0[0] * s;
      if (is_q) {
        q[row0] = out0;
        q[row1] = out1;
      } else {
        cache_keys[cache_index(params.past_len, head, d)] = store_cache(out0);
        cache_keys[cache_index(params.past_len, head, d + HEAD_DIM_HALF)] = store_cache(out1);
      }
    } else {
      let head = row0 / HEAD_DIM;
      let d = row0 % HEAD_DIM;
      cache_values[cache_index(params.past_len, head, d)] = store_cache(partials0[0]);
    }
  }
}
`]]}],["com.xenova.LlamaDecodeQkvRopeCacheNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeQkvRopeCacheNorm",sinceVersion:1,inputs:[{role:"Hidden",dtype:"N",rank:1},{role:"Weights",dtype:"W",rank:1},{role:"Q",dtype:"float32",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32",rank:1},{role:"RopeSin",dtype:"float32",rank:1}],outputs:[{role:"Q",dtype:"float32",rank:1,shape:["args.hiddenSize"]},{role:"CacheKeys",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]},{role:"CacheValues",dtype:"C",rank:1,shape:["args.cacheLen * args.numKvHeads * args.headDim"]}],typeConstraints:{N:["float32","float16"],W:["float32","float16"],C:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},qT:{kind:"tensor",semantic:"Q",role:"inout"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},hiddenSize:{kind:"u32",semantic:"hidden_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"input_norm_offset"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},qOffset:{kind:"u32",semantic:"q_proj_offset"},kOffset:{kind:"u32",semantic:"k_proj_offset"},vOffset:{kind:"u32",semantic:"v_proj_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.qT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","(ranks.cosT == 1 or ranks.cosT == 2)","(ranks.sinT == 1 or ranks.sinT == 2)",'(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.qT == "float32"',"tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','((tensorDtypes.hiddenT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.cacheKeysT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.normOffset % 4 == 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.headDim % 2 == 0","args.qOffset % 4 == 0","args.kOffset % 4 == 0","args.vOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.qT, 0) == args.numHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.cosT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.sinT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))","dim(shapes.weightsT, 0) >= max(args.normOffset + args.hiddenSize, max(args.qOffset + args.numHeads * args.headDim * args.hiddenSize, max(args.kOffset + args.numKvHeads * args.headDim * args.hiddenSize, args.vOffset + args.numKvHeads * args.headDim * args.hiddenSize)))"],constants:{usesF16:'tensorDtypes.hiddenT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.cacheKeysT == "float16"',hiddenVec4:'"vec4<f16>" if tensorDtypes.hiddenT == "float16" else "vec4<f32>"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',weightScalar:"dtypes.W",cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4",numKvHeads:"args.numKvHeads",headDim:"args.headDim",headDimHalf:"args.headDim / 2",qPairs:"args.numHeads * (args.headDim / 2)",kPairs:"args.numKvHeads * (args.headDim / 2)",vOffset:"args.numHeads * (args.headDim / 2) + args.numKvHeads * (args.headDim / 2)",totalOutputs:"args.numHeads * (args.headDim / 2) + args.numKvHeads * (args.headDim / 2) + args.numKvHeads * args.headDim",wQVec4:"args.qOffset / 4",wKVec4:"args.kOffset / 4",wVVec4:"args.vOffset / 4"},passes:[{id:"main",name:"LlamaDecodeQkvRopeCacheNorm",shader:"decode-qkv-rope-cache-norm.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"$hiddenVec4"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads * (args.headDim / 2) + args.numKvHeads * (args.headDim / 2) + args.numKvHeads * args.headDim",y:1,z:1},reads:["Hidden","Weights","Q","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Q","CacheKeys","CacheValues"]}]}]},assets:[["decode-qkv-rope-cache-norm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const HIDDEN_SIZE_VEC4: u32 = {{ hiddenSizeVec4 }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_HALF: u32 = {{ headDimHalf }}u;
const Q_PAIRS: u32 = {{ qPairs }}u;
const V_OFFSET: u32 = {{ vOffset }}u;
const TOTAL_OUTPUTS: u32 = {{ totalOutputs }}u;
const RMS_EPS: f32 = {{ rmsEps }};
const W_NORM_VEC4: u32 = {{ normOffsetVec4 }}u;
const W_Q_VEC4: u32 = {{ wQVec4 }}u;
const W_K_VEC4: u32 = {{ wKVec4 }}u;
const W_V_VEC4: u32 = {{ wVVec4 }}u;
const WORKGROUP_SIZE: u32 = 64u;

// Fused input RMSNorm + qkv GEMV + RoPE + KV-cache write (decode, M == 1). As in the
// gate/up-norm fusion, the RMSNorm scale is a per-token scalar that factors out of the
// linear GEMV (and through the RoPE rotation), so we GEMV on hidden * norm_weight, accumulate
// sum(hidden^2) in the same loop, and apply inverseSqrt(ss/H + eps) to q/k/v before RoPE/store.
// Fusing the input RMSNorm in here removes one dispatch per layer from the decode chain.
var<workgroup> partials0: array<f32, 64>;
var<workgroup> partials1: array<f32, 64>;
var<workgroup> partials_ss: array<f32, 64>;

fn store_cache(value: f32) -> {{ cacheScalar }} {
  return {{ cacheScalar }}(value);
}

fn rope_index(pos: u32, d: u32) -> u32 {
  return pos * HEAD_DIM_HALF + d;
}

fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

@compute @workgroup_size(64)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  let index = wid.x;
  let lid = lid3.x;
  if (index >= TOTAL_OUTPUTS || params.past_len >= CACHE_LEN) {
    return;
  }

  let is_q = index < Q_PAIRS;
  let is_k = index >= Q_PAIRS && index < V_OFFSET;
  var pair_index = index;
  var row0 = 0u;
  var row1 = 0u;
  var weight_base0 = W_V_VEC4;
  var weight_base1 = W_V_VEC4;

  if (is_q) {
    let head = pair_index / HEAD_DIM_HALF;
    let d = pair_index % HEAD_DIM_HALF;
    row0 = head * HEAD_DIM + d;
    row1 = row0 + HEAD_DIM_HALF;
    weight_base0 = W_Q_VEC4 + row0 * HIDDEN_SIZE_VEC4;
    weight_base1 = W_Q_VEC4 + row1 * HIDDEN_SIZE_VEC4;
  } else if (is_k) {
    pair_index = index - Q_PAIRS;
    let head = pair_index / HEAD_DIM_HALF;
    let d = pair_index % HEAD_DIM_HALF;
    row0 = head * HEAD_DIM + d;
    row1 = row0 + HEAD_DIM_HALF;
    weight_base0 = W_K_VEC4 + row0 * HIDDEN_SIZE_VEC4;
    weight_base1 = W_K_VEC4 + row1 * HIDDEN_SIZE_VEC4;
  } else {
    row0 = index - V_OFFSET;
    weight_base0 = W_V_VEC4 + row0 * HIDDEN_SIZE_VEC4;
  }

  var acc0 = 0.0;
  var acc1 = 0.0;
  var ss = 0.0;
  for (var dim = lid; dim < HIDDEN_SIZE_VEC4; dim = dim + WORKGROUP_SIZE) {
    let h = vec4<f32>(hidden[dim]);
    ss = ss + dot(h, h);
    let x = h * vec4<f32>(weights[W_NORM_VEC4 + dim]);
    {%- if weightScalar == "f16" %}
    let xh = vec4<f16>(x);
    acc0 = acc0 + f32(dot(xh, weights[weight_base0 + dim]));
    if (is_q || is_k) {
      acc1 = acc1 + f32(dot(xh, weights[weight_base1 + dim]));
    }
    {%- else %}
    acc0 = acc0 + dot(x, weights[weight_base0 + dim]);
    if (is_q || is_k) {
      acc1 = acc1 + dot(x, weights[weight_base1 + dim]);
    }
    {%- endif %}
  }
  partials0[lid] = acc0;
  partials1[lid] = acc1;
  partials_ss[lid] = ss;
  workgroupBarrier();

  var stride = WORKGROUP_SIZE / 2u;
  loop {
    if (lid < stride) {
      partials0[lid] = partials0[lid] + partials0[lid + stride];
      partials1[lid] = partials1[lid] + partials1[lid + stride];
      partials_ss[lid] = partials_ss[lid] + partials_ss[lid + stride];
    }
    workgroupBarrier();
    if (stride == 1u) {
      break;
    }
    stride = stride / 2u;
  }

  if (lid == 0u) {
    let scale = inverseSqrt(partials_ss[0] / f32(HIDDEN_SIZE) + RMS_EPS);
    let a0 = partials0[0] * scale;
    let a1 = partials1[0] * scale;
    if (is_q || is_k) {
      let d = row0 % HEAD_DIM;
      let head = row0 / HEAD_DIM;
      let rope = rope_index(params.past_len, d);
      let c = rope_cos[rope];
      let s = rope_sin[rope];
      let out0 = a0 * c - a1 * s;
      let out1 = a1 * c + a0 * s;
      if (is_q) {
        q[row0] = out0;
        q[row1] = out1;
      } else {
        cache_keys[cache_index(params.past_len, head, d)] = store_cache(out0);
        cache_keys[cache_index(params.past_len, head, d + HEAD_DIM_HALF)] = store_cache(out1);
      }
    } else {
      let head = row0 / HEAD_DIM;
      let d = row0 % HEAD_DIM;
      cache_values[cache_index(params.past_len, head, d)] = store_cache(a0);
    }
  }
}
`]]}],["com.xenova.LlamaDecodeRmsNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeRmsNorm",sinceVersion:1,inputs:[{role:"Hidden",dtype:"float32",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Normed",dtype:"Y",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{W:["float32","float16"],Y:["float32","float16"]},args:{hiddenT:{kind:"tensor",semantic:"Hidden",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},normedT:{kind:"tensor",semantic:"Normed",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},rmsEps:{kind:"f32",semantic:"rms_eps"},normOffset:{kind:"u32",semantic:"norm_offset"}},variants:[{id:"scalar",priority:0,when:["ranks.hiddenT == 1","ranks.weightsT == 1","ranks.normedT == 1",'tensorDtypes.hiddenT == "float32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.normedT == "float32" or tensorDtypes.normedT == "float16")','((tensorDtypes.weightsT != "float16" and tensorDtypes.normedT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 4 == 0","args.normOffset % 4 == 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.normedT, 0) == args.hiddenSize","dim(shapes.weightsT, 0) >= args.normOffset + args.hiddenSize"],constants:{usesF16:'tensorDtypes.weightsT == "float16" or tensorDtypes.normedT == "float16"',weightVec4:'"vec4<f16>" if tensorDtypes.weightsT == "float16" else "vec4<f32>"',normedVec4:'"vec4<f16>" if tensorDtypes.normedT == "float16" else "vec4<f32>"',hiddenSize:"args.hiddenSize",hiddenSizeVec4:"args.hiddenSize / 4",rmsEps:"args.rmsEps",normOffsetVec4:"args.normOffset / 4"},passes:[{id:"main",name:"LlamaDecodeRmsNorm",shader:"decode-rms-norm.wgsl.jinja",bindings:[{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"input",buffer:{type:"read-only-storage"},elementType:"vec4<f32>"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightVec4"},{name:"normed",arg:"normedT",semantic:"Normed",role:"output",buffer:{type:"storage"},elementType:"$normedVec4"}],dispatch:{x:1,y:1,z:1},reads:["Hidden","Weights"],writes:["Normed"]}]}]},assets:[["decode-rms-norm.wgsl.jinja",`{%- if usesF16 %}
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
`]]}],["com.xenova.LlamaDecodeRopeCacheKv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeRopeCacheKv",sinceVersion:1,inputs:[{role:"Q",dtype:"A",rank:1},{role:"K",dtype:"A",rank:1},{role:"V",dtype:"A",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32",rank:1},{role:"RopeSin",dtype:"float32",rank:1}],outputs:[{role:"Q",dtype:"A",rank:1},{role:"K",dtype:"A",rank:1},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],typeConstraints:{A:["float32","float16"],C:["float32","float16"]},args:{qT:{kind:"tensor",semantic:"Q",role:"inout"},kT:{kind:"tensor",semantic:"K",role:"inout"},vT:{kind:"tensor",semantic:"V",role:"input"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"}},variants:[{id:"scalar",priority:0,when:["ranks.qT == 1","ranks.kT == 1","ranks.vT == 1","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","(ranks.cosT == 1 or ranks.cosT == 2)","(ranks.sinT == 1 or ranks.sinT == 2)","tensorDtypes.qT == tensorDtypes.kT","tensorDtypes.qT == tensorDtypes.vT","tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.qT == "float32" or tensorDtypes.qT == "float16")','(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','((tensorDtypes.qT != "float16" and tensorDtypes.cacheKeysT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.headDim % 2 == 0","args.headDim <= 128","dim(shapes.qT, 0) == args.numHeads * args.headDim","dim(shapes.kT, 0) == args.numKvHeads * args.headDim","dim(shapes.vT, 0) == args.numKvHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.cosT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))","((args.pastLen if args.pastLen else 0) >= args.cacheLen or numel(shapes.sinT) >= ((args.pastLen if args.pastLen else 0) + 1) * (args.headDim / 2))"],constants:{usesF16:'tensorDtypes.qT == "float16" or tensorDtypes.cacheKeysT == "float16"',activationScalar:"dtypes.A",cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",headDim:"args.headDim",headDimHalf:"args.headDim / 2",qPairs:"args.numHeads * (args.headDim / 2)",kvPairs:"args.numKvHeads * (args.headDim / 2)",totalPairs:"(args.numHeads + args.numKvHeads) * (args.headDim / 2)",kvSize:"args.numKvHeads * args.headDim"},passes:[{id:"main",name:"LlamaDecodeRopeCacheKv",shader:"decode-rope-cache-kv.wgsl.jinja",bindings:[{name:"q",arg:"qT",semantic:"Q",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"k",arg:"kT",semantic:"K",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"v",arg:"vT",semantic:"V",role:"input",buffer:{type:"read-only-storage"},elementType:"$activationScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"}]}}],dispatch:{x:"args.numHeads + args.numKvHeads",y:1,z:1},reads:["Q","K","V","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Q","K","CacheKeys","CacheValues"]}]}]},assets:[["decode-rope-cache-kv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_HALF: u32 = {{ headDimHalf }}u;
const Q_PAIRS: u32 = {{ qPairs }}u;
const TOTAL_PAIRS: u32 = {{ totalPairs }}u;
const KV_SIZE: u32 = {{ kvSize }}u;

fn rope_index(pos: u32, d: u32) -> u32 {
  return pos * HEAD_DIM_HALF + d;
}

fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

fn load_activation(value: {{ activationScalar }}) -> f32 {
  return f32(value);
}

fn store_activation(value: f32) -> {{ activationScalar }} {
  return {{ activationScalar }}(value);
}

fn store_cache(value: f32) -> {{ cacheScalar }} {
  return {{ cacheScalar }}(value);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let index = gid.x;
  if (params.past_len >= CACHE_LEN) {
    return;
  }
  let pos = params.past_len;
  if (index < Q_PAIRS) {
    let head = index / HEAD_DIM_HALF;
    let d = index % HEAD_DIM_HALF;
    let base = head * HEAD_DIM;
    let rope = rope_index(pos, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    let first = load_activation(q[base + d]);
    let second = load_activation(q[base + d + HEAD_DIM_HALF]);
    q[base + d] = store_activation(first * c - second * s);
    q[base + d + HEAD_DIM_HALF] = store_activation(second * c + first * s);
  }
  if (index >= Q_PAIRS && index < TOTAL_PAIRS) {
    let k_index = index - Q_PAIRS;
    let head = k_index / HEAD_DIM_HALF;
    let d = k_index % HEAD_DIM_HALF;
    let base = head * HEAD_DIM;
    let rope = rope_index(pos, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    let first = load_activation(k[base + d]);
    let second = load_activation(k[base + d + HEAD_DIM_HALF]);
    let out_first = first * c - second * s;
    let out_second = second * c + first * s;
    k[base + d] = store_activation(out_first);
    k[base + d + HEAD_DIM_HALF] = store_activation(out_second);
    cache_keys[cache_index(pos, head, d)] = store_cache(out_first);
    cache_keys[cache_index(pos, head, d + HEAD_DIM_HALF)] = store_cache(out_second);
  }
  if (index < KV_SIZE) {
    let head = index / HEAD_DIM;
    let dim = index % HEAD_DIM;
    cache_values[cache_index(pos, head, dim)] = store_cache(load_activation(v[index]));
  }
}
`]]}],["com.xenova.LlamaDecodeTokenForward",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaDecodeTokenForward",sinceVersion:1,inputs:[{role:"Tokens",dtype:"uint32",rank:1}],outputs:[{role:"Tokens",dtype:"uint32",rank:1}],args:{tokensT:{kind:"tensor",semantic:"Tokens",role:"inout"},srcIndex:{kind:"u32",semantic:"src_index"}},variants:[{id:"main",priority:0,when:["ranks.tokensT == 1",'tensorDtypes.tokensT == "uint32"',"dim(shapes.tokensT, 0) > args.srcIndex"],constants:{srcIndex:"args.srcIndex"},passes:[{id:"main",name:"LlamaDecodeTokenForward",shader:"token-forward.wgsl.jinja",bindings:[{name:"tokens",arg:"tokensT",semantic:"Tokens",role:"inout",buffer:{type:"storage"},elementType:"u32"}],dispatch:{x:1,y:1,z:1},reads:["Tokens"],writes:["Tokens"]}]}]},assets:[["token-forward.wgsl.jinja",`{{ env.wgsl.resourceDeclarations }}

@compute @workgroup_size(1)
fn main() {
  tokens[0] = tokens[{{ srcIndex }}u];
}
`]]}],["com.xenova.LlamaEmbed",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaEmbed",sinceVersion:1,inputs:[{role:"InputToken",dtype:"uint32",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{W:["float32","float16"]},args:{inputT:{kind:"tensor",semantic:"InputToken",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},hiddenT:{kind:"tensor",semantic:"Hidden",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},embedOffset:{kind:"u32",semantic:"embed_offset"},tokenOffset:{kind:"u32",semantic:"token_offset",required:!1},pastLen:{kind:"u32",semantic:"past_len",required:!1},cacheLen:{kind:"u32",semantic:"cache_len",required:!1}},variants:[{id:"dense",priority:0,when:["ranks.inputT == 1","ranks.weightsT == 1","ranks.hiddenT == 1",'tensorDtypes.inputT == "uint32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','tensorDtypes.hiddenT == "float32"','(tensorDtypes.weightsT != "float16" or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.vocabSize > 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.inputT, 0) > (args.tokenOffset if args.tokenOffset else 0)","dim(shapes.weightsT, 0) >= args.embedOffset + args.vocabSize * args.hiddenSize"],constants:{usesF16:'tensorDtypes.weightsT == "float16"',weightScalar:"dtypes.W",hiddenSize:"args.hiddenSize",embedOffset:"args.embedOffset"},passes:[{id:"main",name:"LlamaEmbed",shader:"embed.wgsl.jinja",bindings:[{name:"input_token",arg:"inputT",semantic:"InputToken",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen if args.cacheLen else 0"},{name:"token_offset",type:"u32",value:"args.tokenOffset if args.tokenOffset else 0"}]}}],dispatch:{x:"ceil(args.hiddenSize / 64)",y:1,z:1},reads:["InputToken","Weights"],writes:["Hidden"]}]}]},assets:[["embed.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;
const W_EMBED: u32 = {{ embedOffset }}u;

fn load_weight(value: {{ weightScalar }}) -> f32 {
  return f32(value);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let dim = gid.x;
  if (dim >= HIDDEN_SIZE) {
    return;
  }
  let token = input_token[params.token_offset];
  hidden[dim] = load_weight(weights[W_EMBED + token * HIDDEN_SIZE + dim]);
}
`]]}],["com.xenova.LlamaEmbedQ1",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaEmbedQ1",sinceVersion:1,inputs:[{role:"InputToken",dtype:"uint32",rank:1},{role:"Q1Bits",dtype:"uint32",rank:1},{role:"Q1Scales",dtype:"S",rank:1}],outputs:[{role:"Hidden",dtype:"float32",rank:1,shape:["args.hiddenSize"]}],typeConstraints:{S:["float32","float16"]},args:{inputT:{kind:"tensor",semantic:"InputToken",role:"input"},q1BitsT:{kind:"tensor",semantic:"Q1Bits",role:"weights"},q1ScalesT:{kind:"tensor",semantic:"Q1Scales",role:"weights"},hiddenT:{kind:"tensor",semantic:"Hidden",role:"output"},hiddenSize:{kind:"u32",semantic:"hidden_size"},vocabSize:{kind:"u32",semantic:"vocab_size"},embedOffset:{kind:"u32",semantic:"embed_q1_block_offset"},tokenOffset:{kind:"u32",semantic:"token_offset",required:!1},pastLen:{kind:"u32",semantic:"past_len",required:!1},cacheLen:{kind:"u32",semantic:"cache_len",required:!1}},variants:[{id:"q1",priority:0,when:["ranks.inputT == 1","ranks.q1BitsT == 1","ranks.q1ScalesT == 1","ranks.hiddenT == 1",'tensorDtypes.inputT == "uint32"','tensorDtypes.q1BitsT == "uint32"','(tensorDtypes.q1ScalesT == "float32" or tensorDtypes.q1ScalesT == "float16")','tensorDtypes.hiddenT == "float32"','(tensorDtypes.q1ScalesT != "float16" or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.hiddenSize % 128 == 0","args.vocabSize > 0","dim(shapes.hiddenT, 0) == args.hiddenSize","dim(shapes.inputT, 0) > (args.tokenOffset if args.tokenOffset else 0)","dim(shapes.q1BitsT, 0) >= (args.embedOffset + args.vocabSize * (args.hiddenSize / 128)) * 4","dim(shapes.q1ScalesT, 0) >= args.embedOffset + args.vocabSize * (args.hiddenSize / 128)"],constants:{usesF16:'tensorDtypes.q1ScalesT == "float16"',scaleScalar:"dtypes.S",hiddenSize:"args.hiddenSize",embedOffset:"args.embedOffset"},passes:[{id:"main",name:"LlamaEmbedQ1",source:{kind:"template",shader:"embed-q1.wgsl.jinja",version:1,inputs:{optimized:!0}},bindings:[{name:"input_token",arg:"inputT",semantic:"InputToken",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"q1_bits",arg:"q1BitsT",semantic:"Q1Bits",role:"weights",buffer:{type:"read-only-storage"},elementType:"vec4<u32>"},{name:"q1_scales",arg:"q1ScalesT",semantic:"Q1Scales",role:"weights",buffer:{type:"read-only-storage"},elementType:"$scaleScalar"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"output",buffer:{type:"storage"},elementType:"f32"},{name:"params",arg:"paramsT",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen if args.cacheLen else 0"},{name:"token_offset",type:"u32",value:"args.tokenOffset if args.tokenOffset else 0"}]}}],dispatch:{x:"ceil(args.hiddenSize / 64)",y:1,z:1},reads:["InputToken","Q1Bits","Q1Scales"],writes:["Hidden"]}]}]},assets:[["embed-q1.wgsl.jinja",`{%- if usesF16 %}
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
`]]}],["com.xenova.LlamaNextToken",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaNextToken",sinceVersion:1,inputs:[{role:"InputToken",dtype:"uint32",rank:1},{role:"Weights",dtype:"float32",rank:1},{role:"CacheKeys",dtype:"float32",rank:4},{role:"CacheValues",dtype:"float32",rank:4}],outputs:[{role:"Output",dtype:"O",rank:1},{role:"CacheKeys",dtype:"float32",rank:4},{role:"CacheValues",dtype:"float32",rank:4}],typeConstraints:{O:["uint32","float32"]},args:{inputT:{kind:"tensor",semantic:"InputToken",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},outputT:{kind:"tensor",semantic:"Output",role:"output"},pastLen:{kind:"u32",semantic:"past_len"},cacheLenArg:{kind:"u32",semantic:"cache_len_param"},cacheLen:{kind:"u32",semantic:"cache_len"},vocabSize:{kind:"u32",semantic:"vocab_size"},hiddenSize:{kind:"u32",semantic:"hidden_size"},intermediateSize:{kind:"u32",semantic:"intermediate_size"},numLayers:{kind:"u32",semantic:"num_layers"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},numKvGroups:{kind:"u32",semantic:"num_kv_groups"},headDim:{kind:"u32",semantic:"head_dim"},headDimHalf:{kind:"u32",semantic:"head_dim_half"},kvSize:{kind:"u32",semantic:"kv_size"},ropeTheta:{kind:"f32",semantic:"rope_theta"},rmsEps:{kind:"f32",semantic:"rms_eps"},scaling:{kind:"f32",semantic:"attention_scaling"},embedOffset:{kind:"u32",semantic:"embed_offset"},modelNormOffset:{kind:"u32",semantic:"model_norm_offset"},lmHeadOffset:{kind:"u32",semantic:"lm_head_offset"},paramsDecl:{kind:"string",semantic:"params_decl"},consts:{kind:"string",semantic:"shape_consts"},layerOffsets:{kind:"string",semantic:"layer_offsets_wgsl"},qkvIndex:{kind:"string",semantic:"qkv_index_wgsl"},siluFn:{kind:"string",semantic:"silu_wgsl"},f32Min:{kind:"string",semantic:"f32_min_literal"},qkNormBlock:{kind:"string",semantic:"qk_norm_block"}},variants:[{id:"generated",priority:0,when:["ranks.inputT == 1","ranks.weightsT == 1","(ranks.cacheKeysT == 4 or ranks.cacheKeysT == 5)","ranks.cacheValuesT == ranks.cacheKeysT","ranks.outputT == 1",'tensorDtypes.inputT == "uint32"','tensorDtypes.weightsT == "float32"','tensorDtypes.cacheKeysT == "float32"','tensorDtypes.cacheValuesT == "float32"','(tensorDtypes.outputT == "uint32" or tensorDtypes.outputT == "float32")',"args.cacheLen > 0","args.pastLen <= args.cacheLen","args.hiddenSize > 0","args.intermediateSize > 0","args.numLayers > 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","dim(shapes.inputT, 0) >= 1","((ranks.cacheKeysT == 4 and dim(shapes.cacheKeysT, 0) == args.numLayers and dim(shapes.cacheKeysT, 1) == args.cacheLen and dim(shapes.cacheKeysT, 2) == args.numKvHeads and dim(shapes.cacheKeysT, 3) == args.headDim and dim(shapes.cacheValuesT, 0) == args.numLayers and dim(shapes.cacheValuesT, 1) == args.cacheLen and dim(shapes.cacheValuesT, 2) == args.numKvHeads and dim(shapes.cacheValuesT, 3) == args.headDim) or (ranks.cacheKeysT == 5 and dim(shapes.cacheKeysT, 0) == args.numLayers and dim(shapes.cacheKeysT, 1) == 1 and dim(shapes.cacheKeysT, 2) == args.cacheLen and dim(shapes.cacheKeysT, 3) == args.numKvHeads and dim(shapes.cacheKeysT, 4) == args.headDim and dim(shapes.cacheValuesT, 0) == args.numLayers and dim(shapes.cacheValuesT, 1) == 1 and dim(shapes.cacheValuesT, 2) == args.cacheLen and dim(shapes.cacheValuesT, 3) == args.numKvHeads and dim(shapes.cacheValuesT, 4) == args.headDim))"],constants:{paramsDecl:"args.paramsDecl",cacheLen:"args.cacheLen",consts:"args.consts",ropeTheta:"args.ropeTheta",rmsEps:"args.rmsEps",scaling:"args.scaling",oEmbed:"args.embedOffset",oModelNorm:"args.modelNormOffset",oLmHead:"args.lmHeadOffset",layerOffsets:"args.layerOffsets",qkvIndex:"args.qkvIndex",siluFn:"args.siluFn",f32Min:"args.f32Min",qkNormBlock:"args.qkNormBlock",h:"args.hiddenSize",inter:"args.intermediateSize",kvSize:"args.kvSize",outputType:'"f32" if tensorDtypes.outputT == "float32" else "u32"',logitsWrite:'"    output[vocab] = acc;" if tensorDtypes.outputT == "float32" else ""',argmaxWrite:'"" if tensorDtypes.outputT == "float32" else "  output[0] = best_token;"'},passes:[{id:"main",name:"LlamaNextToken",shader:"next-token.wgsl.jinja",bindings:[{name:"input_token",arg:"inputT",semantic:"InputToken",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"f32"},{name:"output",arg:"outputT",semantic:"Output",role:"output",buffer:{type:"storage"},elementType:"$outputType"},{name:"params",arg:"paramsT",semantic:"Params",role:"params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen"},{name:"cache_len",type:"u32",value:"args.cacheLenArg"}]}}],dispatch:{x:1,y:1,z:1},reads:["InputToken","Weights","CacheKeys","CacheValues"],writes:["Output","CacheKeys","CacheValues"]}]}]},assets:[["next-token.wgsl.jinja",`{{ paramsDecl }}

@group(0) @binding(0) var<storage, read> input_token: array<u32>;
@group(0) @binding(1) var<storage, read> weights: array<f32>;
@group(0) @binding(2) var<storage, read_write> cache_keys: array<f32>;
@group(0) @binding(3) var<storage, read_write> cache_values: array<f32>;
@group(0) @binding(4) var<storage, read_write> output: array<{{ outputType }}>;
@group(0) @binding(5) var<uniform> params: Params;

const CACHE_LEN: u32 = {{ cacheLen }}u;
{{ consts }}
const ROPE_THETA: f32 = {{ ropeTheta }};
const RMS_EPS: f32 = {{ rmsEps }};
const ATTN_SCALING: f32 = {{ scaling }};

const W_EMBED: u32 = {{ oEmbed }}u;
const W_FINAL_NORM: u32 = {{ oModelNorm }}u;
const W_LM_HEAD: u32 = {{ oLmHead }}u;

{{ layerOffsets }}

{{ qkvIndex }}

fn cache_index(layer: u32, pos: u32, head: u32, dim: u32) -> u32 {
  return (((layer * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

{{ siluFn }}

@compute @workgroup_size(1)
fn main() {
  if (params.past_len >= CACHE_LEN) {
    return;
  }

  var hidden: array<f32, {{ h }}>;
  var residual: array<f32, {{ h }}>;
  var normed: array<f32, {{ h }}>;
  var q: array<f32, {{ h }}>;
  var k: array<f32, {{ kvSize }}>;
  var v: array<f32, {{ kvSize }}>;
  var attn_out: array<f32, {{ h }}>;
  var gate: array<f32, {{ inter }}>;
  var up: array<f32, {{ inter }}>;

  let token = input_token[0];
  for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
    hidden[dim] = weights[W_EMBED + token * HIDDEN_SIZE + dim];
  }

  for (var layer = 0u; layer < NUM_LAYERS; layer = layer + 1u) {
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      residual[dim] = hidden[dim];
    }

    var variance = 0.0;
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      let value = hidden[dim];
      variance = variance + value * value;
    }
    let input_scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      normed[dim] = hidden[dim] * input_scale * weights[input_norm_offset(layer) + dim];
    }

    for (var head = 0u; head < NUM_HEADS; head = head + 1u) {
      for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
        let out_dim = head * HEAD_DIM + d;
        var acc = 0.0;
        for (var in_dim = 0u; in_dim < HIDDEN_SIZE; in_dim = in_dim + 1u) {
          acc = acc + normed[in_dim] * weights[q_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
        }
        q[q_index(head, d)] = acc;
      }
    }
    for (var head = 0u; head < NUM_KV_HEADS; head = head + 1u) {
      for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
        let out_dim = head * HEAD_DIM + d;
        var k_acc = 0.0;
        var v_acc = 0.0;
        for (var in_dim = 0u; in_dim < HIDDEN_SIZE; in_dim = in_dim + 1u) {
          let x = normed[in_dim];
          k_acc = k_acc + x * weights[k_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
          v_acc = v_acc + x * weights[v_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
        }
        k[kv_index(head, d)] = k_acc;
        v[kv_index(head, d)] = v_acc;
      }
    }
{{ qkNormBlock }}

    let pos = f32(params.past_len);
    for (var head = 0u; head < NUM_HEADS; head = head + 1u) {
      for (var d = 0u; d < HEAD_DIM_HALF; d = d + 1u) {
        let inv_freq = 1.0 / pow(ROPE_THETA, f32(d * 2u) / f32(HEAD_DIM));
        let angle = pos * inv_freq;
        let c = cos(angle);
        let s = sin(angle);
        let first = q[q_index(head, d)];
        let second = q[q_index(head, d + HEAD_DIM_HALF)];
        q[q_index(head, d)] = first * c - second * s;
        q[q_index(head, d + HEAD_DIM_HALF)] = second * c + first * s;
      }
    }
    for (var head = 0u; head < NUM_KV_HEADS; head = head + 1u) {
      for (var d = 0u; d < HEAD_DIM_HALF; d = d + 1u) {
        let inv_freq = 1.0 / pow(ROPE_THETA, f32(d * 2u) / f32(HEAD_DIM));
        let angle = pos * inv_freq;
        let c = cos(angle);
        let s = sin(angle);
        let first = k[kv_index(head, d)];
        let second = k[kv_index(head, d + HEAD_DIM_HALF)];
        k[kv_index(head, d)] = first * c - second * s;
        k[kv_index(head, d + HEAD_DIM_HALF)] = second * c + first * s;
      }
    }
    for (var head = 0u; head < NUM_KV_HEADS; head = head + 1u) {
      for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
        cache_keys[cache_index(layer, params.past_len, head, d)] = k[kv_index(head, d)];
        cache_values[cache_index(layer, params.past_len, head, d)] = v[kv_index(head, d)];
      }
    }

    for (var head = 0u; head < NUM_HEADS; head = head + 1u) {
      let kv_head = head / NUM_KV_GROUPS;
      var max_score = {{ f32Min }};
      for (var src = 0u; src <= params.past_len; src = src + 1u) {
        var score = 0.0;
        for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
          score = score + q[q_index(head, d)] * cache_keys[cache_index(layer, src, kv_head, d)];
        }
        score = score * ATTN_SCALING;
        max_score = max(max_score, score);
      }
      var denom = 0.0;
      for (var src = 0u; src <= params.past_len; src = src + 1u) {
        var score = 0.0;
        for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
          score = score + q[q_index(head, d)] * cache_keys[cache_index(layer, src, kv_head, d)];
        }
        denom = denom + exp(score * ATTN_SCALING - max_score);
      }
      for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
        var value = 0.0;
        for (var src = 0u; src <= params.past_len; src = src + 1u) {
          var score = 0.0;
          for (var kd = 0u; kd < HEAD_DIM; kd = kd + 1u) {
            score = score + q[q_index(head, kd)] * cache_keys[cache_index(layer, src, kv_head, kd)];
          }
          let prob = exp(score * ATTN_SCALING - max_score) / denom;
          value = value + prob * cache_values[cache_index(layer, src, kv_head, d)];
        }
        attn_out[head * HEAD_DIM + d] = value;
      }
    }

    for (var out_dim = 0u; out_dim < HIDDEN_SIZE; out_dim = out_dim + 1u) {
      var acc = 0.0;
      for (var in_dim = 0u; in_dim < HIDDEN_SIZE; in_dim = in_dim + 1u) {
        acc = acc + attn_out[in_dim] * weights[o_offset(layer) + out_dim * HIDDEN_SIZE + in_dim];
      }
      hidden[out_dim] = residual[out_dim] + acc;
    }

    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      residual[dim] = hidden[dim];
    }

    variance = 0.0;
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      let value = hidden[dim];
      variance = variance + value * value;
    }
    let post_scale = inverseSqrt(variance / f32(HIDDEN_SIZE) + RMS_EPS);
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      normed[dim] = hidden[dim] * post_scale * weights[post_norm_offset(layer) + dim];
    }

    for (var j = 0u; j < INTERMEDIATE_SIZE; j = j + 1u) {
      var gate_acc = 0.0;
      var up_acc = 0.0;
      for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
        let x = normed[dim];
        gate_acc = gate_acc + x * weights[gate_offset(layer) + j * HIDDEN_SIZE + dim];
        up_acc = up_acc + x * weights[up_offset(layer) + j * HIDDEN_SIZE + dim];
      }
      gate[j] = silu(gate_acc);
      up[j] = up_acc;
    }

    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      var acc = 0.0;
      for (var j = 0u; j < INTERMEDIATE_SIZE; j = j + 1u) {
        acc = acc + gate[j] * up[j] * weights[down_offset(layer) + dim * INTERMEDIATE_SIZE + j];
      }
      hidden[dim] = residual[dim] + acc;
    }
  }

  var final_variance = 0.0;
  for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
    let value = hidden[dim];
    final_variance = final_variance + value * value;
  }
  let final_scale = inverseSqrt(final_variance / f32(HIDDEN_SIZE) + RMS_EPS);
  for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
    normed[dim] = hidden[dim] * final_scale * weights[W_FINAL_NORM + dim];
  }

  var best_token = 0u;
  var best_value = {{ f32Min }};
  for (var vocab = 0u; vocab < VOCAB_SIZE; vocab = vocab + 1u) {
    var acc = 0.0;
    for (var dim = 0u; dim < HIDDEN_SIZE; dim = dim + 1u) {
      acc = acc + normed[dim] * weights[W_LM_HEAD + vocab * HIDDEN_SIZE + dim];
    }
{{ logitsWrite }}
    if (acc > best_value) {
      best_value = acc;
      best_token = vocab;
    }
  }
{{ argmaxWrite }}
}
`]]}],["com.xenova.LlamaPrefillAttention",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillAttention",sinceVersion:1,inputs:[{role:"Qkv",dtype:"Q",rank:2},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],outputs:[{role:"Attn",dtype:"O",rank:2}],typeConstraints:{Q:["float32","float16"],C:["float32","float16"],O:["float32","float16"]},args:{qkvT:{kind:"tensor",semantic:"Qkv",role:"input"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"input"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"input"},attnT:{kind:"tensor",semantic:"Attn",role:"output"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},seqLen:{kind:"u32",semantic:"seq_len"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"},scale:{kind:"f32",semantic:"scale"},workgroupSize:{kind:"u32",semantic:"workgroup_size"}},variants:[{id:"scalar",priority:0,when:["ranks.qkvT == 2","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","ranks.attnT == 2","tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16")','(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','(tensorDtypes.attnT == "float32" or tensorDtypes.attnT == "float16")','((tensorDtypes.qkvT != "float16" and tensorDtypes.cacheKeysT != "float16" and tensorDtypes.attnT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.seqLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.numHeads % args.numKvHeads == 0","args.headDim > 0","(args.workgroupSize == 8 or args.workgroupSize == 16 or args.workgroupSize == 32 or args.workgroupSize == 64 or args.workgroupSize == 128 or args.workgroupSize == 256)","dim(shapes.qkvT, 1) == (args.numHeads + 2 * args.numKvHeads) * args.headDim","numel(shapes.qkvT) >= args.seqLen * (args.numHeads + 2 * args.numKvHeads) * args.headDim","dim(shapes.attnT, 1) == args.numHeads * args.headDim","numel(shapes.attnT) >= args.seqLen * args.numHeads * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.cacheKeysT == "float16" or tensorDtypes.attnT == "float16"',qScalar:"dtypes.Q",cacheScalar:"dtypes.C",outScalar:"dtypes.O",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",numKvGroups:"args.numHeads / args.numKvHeads",headDim:"args.headDim",qHidden:"args.numHeads * args.headDim",qkvStride:"(args.numHeads + 2 * args.numKvHeads) * args.headDim",scaling:"args.scale",workgroupSize:"args.workgroupSize"},passes:[{id:"main",name:"LlamaPrefillAttention",shader:"prefill-attention.wgsl.jinja",bindings:[{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"input",buffer:{type:"read-only-storage"},elementType:"$qScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"input",buffer:{type:"read-only-storage"},elementType:"$cacheScalar"},{name:"attn_out",arg:"attnT",semantic:"Attn",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"},{name:"seq_len",type:"u32",value:"args.seqLen"}]}}],dispatch:{x:"args.numHeads",y:"min(args.seqLen, 65535)",z:1},reads:["Qkv","CacheKeys","CacheValues"],writes:["Attn"]}]}]},assets:[["prefill-attention.wgsl.jinja",`{%- if usesF16 %}
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

// Per-layer cache views are bound at the layer's byte offset, so LAYER is 0.
fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

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

// One workgroup per (query token, head). WG threads cooperate on each key via an
// online (flash) softmax \u2014 no full score array, so cache length is unbounded.
// Causal: query at absolute position past_len+query_token attends keys 0..that position.
@compute @workgroup_size(WG, 1, 1)
fn main(
  @builtin(workgroup_id) wg: vec3<u32>,
  @builtin(num_workgroups) ngroups: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  // 2D dispatch (x = head, y = query token) keeps each axis under the per-dimension
  // workgroup limit; the two axes reproduce the flat token_head = query_token * NUM_HEADS
  // + head index exactly. The y axis is clamped to
  // <= 65535; when seq_len exceeds that, each workgroup grid-strides over the remaining
  // query tokens. Each iteration re-initializes ALL workgroup state, so it is independent
  // of and bit-identical to a fresh workgroup processing that token.
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
    // The final store loop above and the running_out re-init at the top of the next
    // iteration both touch running_out, so the reuse must be barrier-separated.
    workgroupBarrier();
  }
}
`]]}],["com.xenova.LlamaPrefillEmbed",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillEmbed",sinceVersion:1,inputs:[{role:"Tokens",dtype:"uint32",rank:1},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Hidden",dtype:"Y",rank:2}],typeConstraints:{W:["float32","float16"],Y:["float32","float16"]},args:{tokensT:{kind:"tensor",semantic:"Tokens",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},hiddenT:{kind:"tensor",semantic:"Hidden",role:"output"},embedOffset:{kind:"u32",semantic:"embed_offset"},hiddenSize:{kind:"u32",semantic:"hidden_size"},seqLen:{kind:"u32",semantic:"seq_len"}},variants:[{id:"scalar",priority:0,when:["ranks.tokensT == 1","ranks.weightsT == 1","ranks.hiddenT == 2",'tensorDtypes.tokensT == "uint32"','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.hiddenT == "float32" or tensorDtypes.hiddenT == "float16")','((tensorDtypes.weightsT != "float16" and tensorDtypes.hiddenT != "float16") or device.features.has("shader-f16"))',"args.hiddenSize > 0","args.seqLen > 0","dim(shapes.hiddenT, 1) == args.hiddenSize","numel(shapes.hiddenT) >= args.seqLen * args.hiddenSize","numel(shapes.tokensT) >= args.seqLen"],constants:{usesF16:'tensorDtypes.weightsT == "float16" or tensorDtypes.hiddenT == "float16"',weightScalar:"dtypes.W",outScalar:"dtypes.Y",hiddenSize:"args.hiddenSize"},passes:[{id:"main",name:"LlamaPrefillEmbed",shader:"prefill-embed.wgsl.jinja",bindings:[{name:"tokens",arg:"tokensT",semantic:"Tokens",role:"input",buffer:{type:"read-only-storage"},elementType:"u32"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$weightScalar"},{name:"hidden",arg:"hiddenT",semantic:"Hidden",role:"output",buffer:{type:"storage"},elementType:"$outScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"embed_offset",type:"u32",value:"args.embedOffset"},{name:"seq_len",type:"u32",value:"args.seqLen"}]}}],dispatch:{x:"min(ceilDiv(args.seqLen * args.hiddenSize, 64), 65535)",y:"ceilDiv(ceilDiv(args.seqLen * args.hiddenSize, 64), 65535)",z:1},reads:["Tokens","Weights"],writes:["Hidden"]}]}]},assets:[["prefill-embed.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const HIDDEN_SIZE: u32 = {{ hiddenSize }}u;

// One thread per (token, hidden dim): gather row tokens[t] from the embedding
// table (a slice of the flat weights buffer at params.embed_offset).
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  // 2D-folded element index: gid.y carries the high bits past the 65535 dispatch
  // limit (seq_len*HIDDEN > 65535*64, i.e. long-context prefill). Reduces to gid.x
  // when nwg.y == 1; the g >= total guard drops the over-dispatched tail.
  let g = gid.x + gid.y * nwg.x * 64u;
  let total = params.seq_len * HIDDEN_SIZE;
  if (g >= total) {
    return;
  }
  let t = g / HIDDEN_SIZE;
  let d = g % HIDDEN_SIZE;
  let token = tokens[t];
  hidden[g] = {{ outScalar }}(weights[params.embed_offset + token * HIDDEN_SIZE + d]);
}
`]]}],["com.xenova.LlamaPrefillMatmul",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillMatmul",sinceVersion:1,inputs:[{role:"A",dtype:"A",rank:2},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Y",dtype:"Y",rank:2}],typeConstraints:{A:["float32","float16"],W:["float32","float16"],Y:["float32","float16"]},args:{aT:{kind:"tensor",semantic:"A",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},yT:{kind:"tensor",semantic:"Y",role:"output"},weightOffset:{kind:"u32",semantic:"weight_offset"},M:{kind:"u32",semantic:"M"},inFeatures:{kind:"u32",semantic:"in_features"},outFeatures:{kind:"u32",semantic:"out_features"}},variants:[{id:"subgroup_matrix",priority:100,requiredFeatures:["shader-f16","subgroups","chromium-experimental-subgroup-matrix"],when:["ranks.aT == 2","ranks.weightsT == 1","ranks.yT == 2",'tensorDtypes.aT == "float16"','tensorDtypes.weightsT == "float16"','tensorDtypes.yT == "float16"','device.features.has("shader-f16")','device.features.has("subgroups")','device.features.has("chromium-experimental-subgroup-matrix")',"args.M > 0","args.inFeatures > 0","args.outFeatures > 0","args.inFeatures % 32 == 0","args.outFeatures % 64 == 0","numel(shapes.aT) >= args.M * args.inFeatures","numel(shapes.yT) >= args.M * args.outFeatures"],constants:{inFeatures:"args.inFeatures",outFeatures:"args.outFeatures"},passes:[{id:"main",name:"LlamaPrefillMatmulSubgroup",shader:"prefill-matmul-subgroup.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"f16"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"f16"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"f16"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"weight_offset",type:"u32",value:"args.weightOffset"},{name:"m",type:"u32",value:"args.M"},{name:"in_features",type:"u32",value:"args.inFeatures"},{name:"out_features",type:"u32",value:"args.outFeatures"}]}}],dispatch:{x:"ceil(args.outFeatures / 64)",y:"ceil(args.M / 32)",z:1},reads:["A","Weights"],writes:["Y"]}]},{id:"scalar",priority:0,when:["ranks.aT == 2","ranks.weightsT == 1","ranks.yT == 2",'(tensorDtypes.aT == "float32" or tensorDtypes.aT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.yT == "float32" or tensorDtypes.yT == "float16")','((tensorDtypes.aT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.yT != "float16") or device.features.has("shader-f16"))',"args.M > 0","args.inFeatures > 0","args.outFeatures > 0","numel(shapes.aT) >= args.M * args.inFeatures","numel(shapes.yT) >= args.M * args.outFeatures"],constants:{usesF16:'tensorDtypes.aT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.yT == "float16"',aScalar:"dtypes.A",wScalar:"dtypes.W",yScalar:"dtypes.Y"},passes:[{id:"main",name:"LlamaPrefillMatmul",shader:"prefill-matmul.wgsl.jinja",bindings:[{name:"a",arg:"aT",semantic:"A",role:"input",buffer:{type:"read-only-storage"},elementType:"$aScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"weight_offset",type:"u32",value:"args.weightOffset"},{name:"m",type:"u32",value:"args.M"},{name:"in_features",type:"u32",value:"args.inFeatures"},{name:"out_features",type:"u32",value:"args.outFeatures"}]}}],dispatch:{x:"min(ceilDiv(args.M * args.outFeatures, 64), 65535)",y:"ceilDiv(ceilDiv(args.M * args.outFeatures, 64), 65535)",z:1},reads:["A","Weights"],writes:["Y"]}]}]},assets:[["prefill-matmul-subgroup.wgsl.jinja",`enable f16;
enable subgroups;
enable chromium_experimental_subgroup_matrix;
diagnostic(off, chromium.subgroup_matrix_uniformity);

{{ env.wgsl.resourceDeclarations }}

// y[m, n] = sum_k a[m, k] * weights[weight_offset + n * IN_F + k]  (B stored row-major as
// [OUT_F, IN_F] at params.weight_offset). Subgroup-matrix tiled GEMM, f16 throughout. The
// weight-side wrinkle is the in-shader offset in loadSHMB; subgroupMatrixLoad reads the
// shared-memory tile, so it is unaffected.
const IN_F:      u32 = {{ inFeatures }}u;
const OUT_F:     u32 = {{ outFeatures }}u;
const TILE_COLS: u32 = 64u;
const TILE_ROWS: u32 = 32u;
const TILE_K:    u32 = 32u;
const SUB_COLS:  u32 = 32u;
const SUB_ROWS:  u32 = 16u;

var<workgroup> tile_A: array<f16, 32 * 32>;
var<workgroup> tile_B: array<f16, 64 * 32>;
var<workgroup> scratch: array<array<f32, 64>, 4>;

fn loadSHMA(tile_base: u32, k_idx: u32, row: u32, c_idx: u32) {
  let a_global: u32 = tile_base + row;
  let col: u32 = c_idx * 8u;
  for (var col_offset: u32 = 0u; col_offset < 8u; col_offset++) {
    let k: u32 = k_idx + col + col_offset;
    if (a_global < params.m) {
      tile_A[row * TILE_K + col + col_offset] = a[a_global * IN_F + k];
    } else {
      tile_A[row * TILE_K + col + col_offset] = 0.0h;
    }
  }
}

fn loadSHMB(tile_base: u32, k_idx: u32, row: u32, c_idx: u32) {
  let w_global: u32 = tile_base + row;
  let col: u32 = c_idx * 16u;
  for (var i: u32 = 0u; i < 16u; i++) {
    let k: u32 = k_idx + col + i;
    tile_B[row * TILE_K + col + i] = weights[params.weight_offset + w_global * IN_F + k];
  }
}

fn storeOutput(offset: u32, row: u32, col: u32, src_slot: u32, row_limit: i32) {
  if (row_limit > 0 && row < u32(row_limit)) {
    let col2: u32 = col + 1u;
    y[offset + row * OUT_F + col]  = f16(scratch[src_slot][row * 8u + col]);
    y[offset + row * OUT_F + col2] = f16(scratch[src_slot][row * 8u + col2]);
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
    loadSHMA(a_global_base, kidx, local_idx / 4u, local_idx % 4u);
    loadSHMB(w_global_base, kidx, local_idx / 2u, local_idx % 2u);
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
  var row_limit: i32 = i32(params.m) - i32(a_global_base + base_A);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC00, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC01, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC02, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC03, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit);

  matrix_c_offset = matrix_c_offset + 8u * OUT_F;
  row_limit = i32(params.m) - i32(a_global_base + base_A + 8u);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC10, false, 8u);
  storeOutput(matrix_c_offset, row, col, subtile_id, row_limit);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC11, false, 8u);
  storeOutput(matrix_c_offset + 8u, row, col, subtile_id, row_limit);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC12, false, 8u);
  storeOutput(matrix_c_offset + 16u, row, col, subtile_id, row_limit);
  subgroupMatrixStore(&scratch[subtile_id], 0u, matC13, false, 8u);
  storeOutput(matrix_c_offset + 24u, row, col, subtile_id, row_limit);
}
`],["prefill-matmul.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

// y[m, n] = sum_k a[m, k] * weights[weight_offset + n * in_features + k]
// Weights are the whole flat buffer indexed in-shader (the matrix is stored row-major
// as [out_features, in_features] at params.weight_offset), avoiding storage-buffer
// binding-offset alignment limits. One thread per output element.
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  // 2D-folded output-element index: gid.y carries the high bits past the 65535
  // dispatch limit (m*out_features > 65535*64, long-context prefill). Reduces to
  // gid.x when nwg.y == 1; the g >= total guard drops the over-dispatched tail.
  let g = gid.x + gid.y * nwg.x * 64u;
  let total = params.m * params.out_features;
  if (g >= total) {
    return;
  }
  let row = g / params.out_features;
  let col = g % params.out_features;
  let a_base = row * params.in_features;
  let w_base = params.weight_offset + col * params.in_features;
  var acc = 0.0;
  for (var k = 0u; k < params.in_features; k = k + 1u) {
    acc = acc + f32(a[a_base + k]) * f32(weights[w_base + k]);
  }
  y[g] = {{ yScalar }}(acc);
}
`]]}],["com.xenova.LlamaPrefillRmsNorm",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillRmsNorm",sinceVersion:1,inputs:[{role:"X",dtype:"X",rank:2},{role:"Weights",dtype:"W",rank:1}],outputs:[{role:"Y",dtype:"Y",rank:2}],typeConstraints:{X:["float32","float16"],W:["float32","float16"],Y:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},weightsT:{kind:"tensor",semantic:"Weights",role:"weights"},yT:{kind:"tensor",semantic:"Y",role:"output"},normOffset:{kind:"u32",semantic:"norm_offset"},rows:{kind:"u32",semantic:"rows"},dim:{kind:"u32",semantic:"dim"},eps:{kind:"f32",semantic:"eps"}},variants:[{id:"scalar",priority:0,when:["ranks.xT == 2","ranks.weightsT == 1","ranks.yT == 2",'(tensorDtypes.xT == "float32" or tensorDtypes.xT == "float16")','(tensorDtypes.weightsT == "float32" or tensorDtypes.weightsT == "float16")','(tensorDtypes.yT == "float32" or tensorDtypes.yT == "float16")','((tensorDtypes.xT != "float16" and tensorDtypes.weightsT != "float16" and tensorDtypes.yT != "float16") or device.features.has("shader-f16"))',"args.rows > 0","args.dim > 0","numel(shapes.xT) >= args.rows * args.dim","numel(shapes.yT) >= args.rows * args.dim"],constants:{usesF16:'tensorDtypes.xT == "float16" or tensorDtypes.weightsT == "float16" or tensorDtypes.yT == "float16"',xScalar:"dtypes.X",wScalar:"dtypes.W",yScalar:"dtypes.Y",dim:"args.dim"},passes:[{id:"main",name:"LlamaPrefillRmsNorm",shader:"prefill-rms-norm.wgsl.jinja",bindings:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xScalar"},{name:"weights",arg:"weightsT",semantic:"Weights",role:"weights",buffer:{type:"read-only-storage"},elementType:"$wScalar"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yScalar"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"norm_offset",type:"u32",value:"args.normOffset"},{name:"rows",type:"u32",value:"args.rows"},{name:"eps",type:"f32",value:"args.eps"}]}}],dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.rows / 65535)",z:1},reads:["X","Weights"],writes:["Y"]}]}]},assets:[["prefill-rms-norm.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const DIM: u32 = {{ dim }}u;
const WG: u32 = 256u;

var<workgroup> partials: array<f32, 256>;

// One workgroup per token row. RMSNorm over the last axis (DIM), scaled by the weight
// vector at params.norm_offset (indexed in-shader from the flat weights buffer).
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) wid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>, @builtin(local_invocation_id) lid3: vec3<u32>) {
  // 2D-fold the row axis (x) into the free y axis to stay under the 65535
  // per-dimension dispatch limit. Reduces to wid.x when y == 1 (nwg.y back-multiplies).
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
`]]}],["com.xenova.LlamaPrefillRopeCacheKv",{manifest:{schemaVersion:1,domain:"com.xenova",name:"LlamaPrefillRopeCacheKv",sinceVersion:1,inputs:[{role:"Qkv",dtype:"A",rank:2},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1},{role:"RopeCos",dtype:"float32"},{role:"RopeSin",dtype:"float32"}],outputs:[{role:"Qkv",dtype:"A",rank:2},{role:"CacheKeys",dtype:"C",rank:1},{role:"CacheValues",dtype:"C",rank:1}],typeConstraints:{A:["float32","float16"],C:["float32","float16"]},args:{qkvT:{kind:"tensor",semantic:"Qkv",role:"inout"},cacheKeysT:{kind:"tensor",semantic:"CacheKeys",role:"inout"},cacheValuesT:{kind:"tensor",semantic:"CacheValues",role:"inout"},cosT:{kind:"tensor",semantic:"RopeCos",role:"input"},sinT:{kind:"tensor",semantic:"RopeSin",role:"input"},layer:{kind:"u32",semantic:"layer"},cacheLen:{kind:"u32",semantic:"cache_len"},pastLen:{kind:"u32",semantic:"past_len",required:!1},seqLen:{kind:"u32",semantic:"seq_len"},numHeads:{kind:"u32",semantic:"num_heads"},numKvHeads:{kind:"u32",semantic:"num_kv_heads"},headDim:{kind:"u32",semantic:"head_dim"}},variants:[{id:"scalar",priority:0,when:["ranks.qkvT == 2","(ranks.cacheKeysT == 1 or ranks.cacheKeysT == 5)","(ranks.cacheValuesT == 1 or ranks.cacheValuesT == 5)","tensorDtypes.cacheKeysT == tensorDtypes.cacheValuesT",'(tensorDtypes.qkvT == "float32" or tensorDtypes.qkvT == "float16")','(tensorDtypes.cacheKeysT == "float32" or tensorDtypes.cacheKeysT == "float16")','((tensorDtypes.qkvT != "float16" and tensorDtypes.cacheKeysT != "float16") or device.features.has("shader-f16"))',"args.cacheLen > 0","args.seqLen > 0","args.numHeads > 0","args.numKvHeads > 0","args.headDim > 0","args.headDim % 2 == 0","dim(shapes.qkvT, 1) == (args.numHeads + 2 * args.numKvHeads) * args.headDim","numel(shapes.qkvT) >= args.seqLen * (args.numHeads + 2 * args.numKvHeads) * args.headDim","numel(shapes.cacheKeysT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim","numel(shapes.cacheValuesT) >= (args.layer + 1) * args.cacheLen * args.numKvHeads * args.headDim"],constants:{usesF16:'tensorDtypes.qkvT == "float16" or tensorDtypes.cacheKeysT == "float16"',activationScalar:"dtypes.A",cacheScalar:"dtypes.C",layer:"args.layer",cacheLen:"args.cacheLen",numHeads:"args.numHeads",numKvHeads:"args.numKvHeads",headDim:"args.headDim",headDimHalf:"args.headDim / 2",qHidden:"args.numHeads * args.headDim",kvHidden:"args.numKvHeads * args.headDim",qkvStride:"(args.numHeads + 2 * args.numKvHeads) * args.headDim",qPairs:"args.numHeads * (args.headDim / 2)",kvPairs:"args.numKvHeads * (args.headDim / 2)",kvSize:"args.numKvHeads * args.headDim",workPerToken:"args.numHeads * (args.headDim / 2) + args.numKvHeads * (args.headDim / 2) + args.numKvHeads * args.headDim"},passes:[{id:"main",name:"LlamaPrefillRopeCacheKv",shader:"prefill-rope-cache-kv.wgsl.jinja",bindings:[{name:"qkv",arg:"qkvT",semantic:"Qkv",role:"inout",buffer:{type:"storage"},elementType:"$activationScalar"},{name:"cache_keys",arg:"cacheKeysT",semantic:"CacheKeys",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"cache_values",arg:"cacheValuesT",semantic:"CacheValues",role:"inout",buffer:{type:"storage"},elementType:"$cacheScalar"},{name:"rope_cos",arg:"cosT",semantic:"RopeCos",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"rope_sin",arg:"sinT",semantic:"RopeSin",role:"input",buffer:{type:"read-only-storage"},elementType:"f32"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"past_len",type:"u32",value:"args.pastLen if args.pastLen else 0"},{name:"cache_len",type:"u32",value:"args.cacheLen"},{name:"seq_len",type:"u32",value:"args.seqLen"}]}}],dispatch:{x:"min(ceilDiv(args.seqLen * constants.workPerToken, 64), 65535)",y:"ceilDiv(ceilDiv(args.seqLen * constants.workPerToken, 64), 65535)",z:1},reads:["Qkv","CacheKeys","CacheValues","RopeCos","RopeSin"],writes:["Qkv","CacheKeys","CacheValues"]}]}]},assets:[["prefill-rope-cache-kv.wgsl.jinja",`{%- if usesF16 %}
enable f16;
{% endif -%}

{{ env.wgsl.resourceDeclarations }}

const LAYER: u32 = {{ layer }}u;
const CACHE_LEN: u32 = {{ cacheLen }}u;
const NUM_KV_HEADS: u32 = {{ numKvHeads }}u;
const HEAD_DIM: u32 = {{ headDim }}u;
const HEAD_DIM_HALF: u32 = {{ headDimHalf }}u;
const Q_HIDDEN: u32 = {{ qHidden }}u;
const KV_HIDDEN: u32 = {{ kvHidden }}u;
const QKV_STRIDE: u32 = {{ qkvStride }}u;
const Q_PAIRS: u32 = {{ qPairs }}u;
const KV_PAIRS: u32 = {{ kvPairs }}u;
const WORK_PER_TOKEN: u32 = {{ workPerToken }}u;

fn rope_index(pos: u32, d: u32) -> u32 {
  return pos * HEAD_DIM_HALF + d;
}

// Per-layer cache views are bound at the layer's byte offset, so LAYER is 0.
fn cache_index(pos: u32, head: u32, dim: u32) -> u32 {
  return (((LAYER * CACHE_LEN + pos) * NUM_KV_HEADS + head) * HEAD_DIM + dim);
}

fn load_act(value: {{ activationScalar }}) -> f32 {
  return f32(value);
}

fn store_act(value: f32) -> {{ activationScalar }} {
  return {{ activationScalar }}(value);
}

fn store_cache(value: f32) -> {{ cacheScalar }} {
  return {{ cacheScalar }}(value);
}

// One thread per (token, work-item). Work-items per token are laid out as:
//   [0, Q_PAIRS)            -> RoPE a Q rotate-half pair (in place)
//   [Q_PAIRS, +KV_PAIRS)    -> RoPE a K pair (in place) + write both halves to the key cache
//   [.., +KV_SIZE)          -> copy one V element into the value cache
// Q occupies qkv columns [0, Q_HIDDEN); K [Q_HIDDEN, Q_HIDDEN+KV_HIDDEN); V the remainder.
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(num_workgroups) nwg: vec3<u32>) {
  // 2D-folded work index: gid.y carries the high bits past the 65535 dispatch
  // limit (seq_len*WORK_PER_TOKEN > 65535*64, long-context prefill). Reduces to
  // gid.x when nwg.y == 1; the token >= seq_len guard drops the over-dispatched tail.
  let g = gid.x + gid.y * nwg.x * 64u;
  let token = g / WORK_PER_TOKEN;
  if (token >= params.seq_len) {
    return;
  }
  let pos = params.past_len + token;
  if (pos >= CACHE_LEN) {
    return;
  }
  let local = g % WORK_PER_TOKEN;
  let row = token * QKV_STRIDE;

  if (local < Q_PAIRS) {
    let head = local / HEAD_DIM_HALF;
    let d = local % HEAD_DIM_HALF;
    let base = row + head * HEAD_DIM;
    let rope = rope_index(pos, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    let first = load_act(qkv[base + d]);
    let second = load_act(qkv[base + d + HEAD_DIM_HALF]);
    qkv[base + d] = store_act(first * c - second * s);
    qkv[base + d + HEAD_DIM_HALF] = store_act(second * c + first * s);
    return;
  }

  let after_q = local - Q_PAIRS;
  if (after_q < KV_PAIRS) {
    let head = after_q / HEAD_DIM_HALF;
    let d = after_q % HEAD_DIM_HALF;
    let base = row + Q_HIDDEN + head * HEAD_DIM;
    let rope = rope_index(pos, d);
    let c = rope_cos[rope];
    let s = rope_sin[rope];
    let first = load_act(qkv[base + d]);
    let second = load_act(qkv[base + d + HEAD_DIM_HALF]);
    let out_first = first * c - second * s;
    let out_second = second * c + first * s;
    qkv[base + d] = store_act(out_first);
    qkv[base + d + HEAD_DIM_HALF] = store_act(out_second);
    cache_keys[cache_index(pos, head, d)] = store_cache(out_first);
    cache_keys[cache_index(pos, head, d + HEAD_DIM_HALF)] = store_cache(out_second);
    return;
  }

  let v_local = after_q - KV_PAIRS;
  let head = v_local / HEAD_DIM;
  let dim = v_local % HEAD_DIM;
  let vbase = row + Q_HIDDEN + KV_HIDDEN + head * HEAD_DIM;
  cache_values[cache_index(pos, head, dim)] = store_cache(load_act(qkv[vbase + dim]));
}
`]]}],["com.xenova.SwiGlu",{manifest:{schemaVersion:1,domain:"com.xenova",name:"SwiGlu",sinceVersion:1,inputs:[{role:"X",dtype:"X",rank:2}],outputs:[{role:"Y",dtype:"Y",rank:2}],typeConstraints:{X:["float32","float16"],Y:["float32","float16"]},args:{xT:{kind:"tensor",semantic:"X",role:"input"},yT:{kind:"tensor",semantic:"Y",role:"output"},rows:{kind:"u32",semantic:"rows"},mlpInner:{kind:"u32",semantic:"mlpInner"}},bindingSets:{default:[{name:"x",arg:"xT",semantic:"X",role:"input",buffer:{type:"read-only-storage"},elementType:"$xElement"},{name:"y",arg:"yT",semantic:"Y",role:"output",buffer:{type:"storage"},elementType:"$yElement"},{name:"params",semantic:"kernel.params",buffer:{type:"uniform"},struct:{name:"Params",fields:[{name:"rows",type:"u32",value:"args.rows"}]}}]},variants:[{id:"vec4_f16",priority:10,when:['dtypes.X == "f16"','dtypes.Y == "f16"','device.features.has("shader-f16")',"args.mlpInner % 4 == 0","ranks.xT == 2","ranks.yT == 2","args.rows == dim(shapes.xT, 0)","dim(shapes.xT, 1) == args.mlpInner * 2","dim(shapes.yT, 0) == args.rows","dim(shapes.yT, 1) == args.mlpInner"],constants:{vectorized:!0,usesF16:!0,xElement:'"vec4<f16>"',yElement:'"vec4<f16>"',yScalar:'"f16"',mlpInnerV4:"args.mlpInner / 4"},passes:[{id:"main",name:"SwiGlu",shader:"swiglu.wgsl.jinja",bindings:"default",dispatch:{x:"min(args.rows, 65535)",y:"ceil((args.mlpInner / 4) / 64)",z:"ceilDiv(args.rows, 65535)"},reads:["X"],writes:["Y"]}]},{id:"vec4_f32",priority:10,when:['dtypes.X == "f32"','dtypes.Y == "f32"',"args.mlpInner % 4 == 0","ranks.xT == 2","ranks.yT == 2","args.rows == dim(shapes.xT, 0)","dim(shapes.xT, 1) == args.mlpInner * 2","dim(shapes.yT, 0) == args.rows","dim(shapes.yT, 1) == args.mlpInner"],constants:{vectorized:!0,usesF16:!1,xElement:'"vec4<f32>"',yElement:'"vec4<f32>"',yScalar:'"f32"',mlpInnerV4:"args.mlpInner / 4"},passes:[{id:"main",name:"SwiGlu",shader:"swiglu.wgsl.jinja",bindings:"default",dispatch:{x:"min(args.rows, 65535)",y:"ceil((args.mlpInner / 4) / 64)",z:"ceilDiv(args.rows, 65535)"},reads:["X"],writes:["Y"]}]},{id:"scalar",priority:0,when:["ranks.xT == 2","ranks.yT == 2","args.rows == dim(shapes.xT, 0)","dim(shapes.xT, 1) == args.mlpInner * 2","dim(shapes.yT, 0) == args.rows","dim(shapes.yT, 1) == args.mlpInner",'((dtypes.X != "f16" and dtypes.Y != "f16") or device.features.has("shader-f16"))'],constants:{vectorized:!1,usesF16:'dtypes.X == "f16" or dtypes.Y == "f16"',xElement:"dtypes.X",yElement:"dtypes.Y",yScalar:"dtypes.Y",mlpInner:"args.mlpInner"},passes:[{id:"main",name:"SwiGlu",shader:"swiglu.wgsl.jinja",bindings:"default",dispatch:{x:"min(args.rows, 65535)",y:"ceil(args.mlpInner / 64)",z:"ceilDiv(args.rows, 65535)"},reads:["X"],writes:["Y"]}]}]},assets:[["swiglu.wgsl.jinja",`{% if usesF16 %}
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
  // 2d-fold: the row dispatch axis (x) is clamped to 65535 and the overflow is
  // spilled into z. Recover the true row; for rows <= 65535 the dispatch is z=1
  // so wg.z*nwg.x == 0 and this is bit-identical to plain \`wg.x\`. The \`r >= rows\`
  // guard below drops the over-dispatched tail.
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
  y[r * MLP_V4 + i0] = {{ yElement }}((x1 / (vec4<f32>(1.0) + exp(-x1))) * x2);
{% else %}
  if (i0 >= MLP) {
    return;
  }
  let x1 = f32(x[r * 2u * MLP + i0]);
  let x2 = f32(x[r * 2u * MLP + MLP + i0]);
  y[r * MLP + i0] = {{ yScalar }}((x1 / (1.0 + exp(-x1))) * x2);
{% endif %}
}
`]]}]])});function je(e,n={}){let t=wi(e);return new Qn(t.manifest,{...n,assets:t.assets})}function Ht(e,n={}){return Object.fromEntries(Object.entries(e).map(([t,r])=>[t,je(r,n)]))}function wi(e){let n=ef.get(e);if(n){let r=new Map(Jp);for(let[s,a]of n.assets)r.set(s,a);return{manifest:n.manifest,assets:_n(r)}}let t=yi.get(e);if(t){let r=new Map(_i);for(let[s,a]of t.assets)r.set(s,a);return{manifest:t.manifest,assets:_n(r)}}return tf(e)}function vi(e){let n=new Set;for(let t of zt(e,"<op-package>"))for(let r of ki(t))n.add(r);return n}function ki(e){let n=new Set;for(let t of e.passes??[])nf(n,t);return n}function nf(e,n){if(n.source!==void 0){n.source.kind==="template"&&n.source.shader&&e.add(n.source.shader);return}n.shader&&e.add(n.shader)}function tf(e){throw new Error(`WebGPU op package ${e} is not embedded in this runtime`)}function us(e,n){let t=[],r=s=>{let a=new URL(s,e);for(let i of n(a,{withFileTypes:!0})){let o=`${s}${i.name}`;i.isDirectory()?r(`${o}/`):i.isFile()&&rf(o)&&t.push(o)}};return r(""),t.sort((s,a)=>s.localeCompare(a))}function Si(e,n){let t=new URL(Nt,e);return us(t,n).map(r=>`${Nt}${r}`)}function Ti(e){return e.replaceAll("\\","/").startsWith(Nt)}function rf(e){return e.endsWith(".wgsl")||e.endsWith(".wgsl.jinja")}var Nt,Jp,ef,ls=re(()=>{"use strict";Gt();Zn();bi();Nt="ops/_shared/",Jp=new Map,ef=new Map});function ds({op:e,toRequest:n}){let t=Object.freeze(e.manifest.variants.map(r=>Object.freeze({id:r.id,name:r.name,version:r.version,default:r.default,priority:r.priority,requires:r.requires,passCount:r.passes.length,shaders:Object.freeze(r.passes.map(s=>s.source.shader))})));return{id:e.manifest.id,name:e.manifest.name,op:e,manifest:e.manifest,variants:t,toRequest:n,explain(r,s,a={}){return e.explain(r,n(s,a),{variant:a.variant})},prepareExecutionPlan(r,s,a={}){return e.prepare(r,n(s,a),{variant:a.variant})},run(r,s,a={}){return e.run(r,n(s,a),{variant:a.variant,runOptions:a.runOptions})},clearPreparedState(){e.clearPreparedState()}}}var xi=re(()=>{"use strict";Zn()});var sn=re(()=>{"use strict";Nn();Fn();Ct();$n();Jr();Gt();ls();xi();Zn();Zn();as()});function Di(e,n=[]){let t=new Set(af(n));return sf.filter(r=>e.features.has(r)&&!t.has(r)).map(r=>r)}function af(e){return typeof e=="string"?e.split(",").map(n=>n.trim()).filter(Boolean):Array.isArray(e)?[...e]:e instanceof Set?[...e]:[]}function Ei(e,n,t,r){let s=n.info,a=t?.wgslLanguageFeatures??globalThis.navigator?.gpu?.wgslLanguageFeatures,i=r?r.min:s.subgroupMinSize,o=r?r.max:s.subgroupMaxSize;return{adapterInfo:{vendor:s.vendor,architecture:s.architecture,device:s.device,description:s.description,isFallbackAdapter:s.isFallbackAdapter===!0,...typeof i=="number"?{subgroupMinSize:i}:{},...typeof o=="number"?{subgroupMaxSize:o}:{}},features:qt(e.features),wgslLanguageFeatures:Lt(a),limits:Ot(e.limits)}}function qi(e){return{maxBufferSize:Number(e.limits.maxBufferSize),maxStorageBufferBindingSize:Number(e.limits.maxStorageBufferBindingSize),maxStorageBuffersPerShaderStage:Number(e.limits.maxStorageBuffersPerShaderStage),maxComputeWorkgroupStorageSize:Number(e.limits.maxComputeWorkgroupStorageSize)}}function Li({adapter:e,device:n,deviceInfo:t,destroy:r,gpu:s,syncPipelineCreation:a}){return{gpu:s,adapter:e,device:n,deviceInfo:t,createShaderModule:(o,u)=>n.createShaderModule({code:o,label:u}),createComputePipeline:a?async o=>{n.pushErrorScope("validation");let u=n.createComputePipeline(o),l=await n.popErrorScope();if(l)throw new Error(`createComputePipeline failed: ${l.message}`);return u}:o=>n.createComputePipelineAsync(o),createBuffer:o=>{let u=t.limits?.maxBufferSize,l=Number(o.size);if(typeof u=="number"&&l>u){let d=c=>`${(c/1048576).toFixed(1)} MB`;throw new Error(`WebGPU buffer${o.label?` "${o.label}"`:""} of ${d(l)} exceeds this device's maxBufferSize of ${d(u)}. This model is too large to run on this GPU/browser.`)}return n.createBuffer(o)},writeBuffer:(o,u,l)=>n.queue.writeBuffer(o,u,l),submit:async(o,u)=>{n.queue.submit(o),u.wait&&await n.queue.onSubmittedWorkDone()},mapRead:async(o,u,l)=>{await o.mapAsync(GPUMapMode.READ,u,l);let d=o.getMappedRange(u,l).slice(0);return o.unmap(),d},pushErrorScope:o=>n.pushErrorScope(o),popErrorScope:()=>n.popErrorScope(),destroy:r}}var sf,Oi=re(()=>{"use strict";sn();sf=Bn});var et={};bt(et,{default:()=>Mf,fileURLToPath:()=>Wf,join:()=>Rf,open:()=>Gf,readFile:()=>Af,stat:()=>If});var Jn,Af,Gf,If,Rf,Wf,Mf,nt=re(()=>{Jn=e=>()=>{throw new Error("Node built-in node:fs/promises."+e+" is unavailable in the browser LFM2 bundle (node-only code path).")},Af=Jn("readFile"),Gf=Jn("open"),If=Jn("stat"),Rf=Jn("join"),Wf=Jn("fileURLToPath"),Mf={}});var no={};bt(no,{default:()=>Kf,fileURLToPath:()=>Ff,join:()=>Uf,open:()=>Nf,readFile:()=>Bf,stat:()=>Hf});var tt,Bf,Nf,Hf,Uf,Ff,Kf,to=re(()=>{tt=e=>()=>{throw new Error("Node built-in node:url."+e+" is unavailable in the browser LFM2 bundle (node-only code path).")},Bf=tt("readFile"),Nf=tt("open"),Hf=tt("stat"),Uf=tt("join"),Ff=tt("fileURLToPath"),Kf={}});var Ls={};bt(Ls,{default:()=>ym,fileURLToPath:()=>_m,join:()=>gm,open:()=>mm,readFile:()=>fm,stat:()=>hm});var ot,fm,mm,hm,gm,_m,ym,Os=re(()=>{ot=e=>()=>{throw new Error("Node built-in node:path."+e+" is unavailable in the browser LFM2 bundle (node-only code path).")},fm=ot("readFile"),mm=ot("open"),hm=ot("stat"),gm=ot("join"),_m=ot("fileURLToPath"),ym={}});Ar();var Pl=class{constructor(e){this.trie=this._build_trie(e)}_build_trie(e){let n=Object.create(null);for(let t of e){let r=n;for(let s=0;s<t.length;++s){let a=t[s];r=r[a]??=Object.create(null)}r.end=t}return n}split(e){let n=[],t=e.length,r=0,s=0;for(;s<t;){let a=this.trie,i=null,o=s;for(;o<t&&(a=a[e[o]]);)a.end&&(i=a.end),++o;i?(s>r&&n.push(e.slice(r,s)),n.push(i),s+=i.length,r=s):++s}return r<t&&n.push(e.slice(r)),n}},ma=Pl,zl=class{constructor(e){this.content=e.content,this.id=e.id,this.single_word=e.single_word??!1,this.lstrip=e.lstrip??!1,this.rstrip=e.rstrip??!1,this.special=e.special??!1,this.normalized=e.normalized??!this.special}},Al=zl,va=(()=>{let e=[...Array.from({length:94},(s,a)=>a+33),...Array.from({length:12},(s,a)=>a+161),...Array.from({length:82},(s,a)=>a+174)],n=e.slice(),t=0;for(let s=0;s<256;++s)e.includes(s)||(e.push(s),n.push(256+t),t+=1);let r=n.map(s=>String.fromCharCode(s));return Object.fromEntries(e.map((s,a)=>[s,r[a]]))})(),Gl=e=>Object.fromEntries(Object.entries(e).map(([n,t])=>[t,n])),Il=Gl(va),ha=".,!?\u2026\u3002\uFF0C\u3001\u0964\u06D4\u060C",Rl=new Map([["(?i:'s|'t|'re|'ve|'m|'ll|'d)","(?:'([sS]|[tT]|[rR][eE]|[vV][eE]|[mM]|[lL][lL]|[dD]))"],["(?i:[sdmt]|ll|ve|re)","(?:[sS]|[dD]|[mM]|[tT]|[lL][lL]|[vV][eE]|[rR][eE])"],["[^\\r\\n\\p{L}\\p{N}]?+","[^\\r\\n\\p{L}\\p{N}]?"],["[^\\s\\p{L}\\p{N}]++","[^\\s\\p{L}\\p{N}]+"],["(?>\\p{Nd}{510})","(?:\\p{Nd}{510})"],["\\p{Nd}{3}+","(?:\\p{Nd}{3})+"],["\\G",""],[` ?[^(\\s|[${ha}])]+`,` ?[^\\s${ha}]+`]]),Tt="\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E",Ir=e=>e.replace(/ \./g,".").replace(/ \?/g,"?").replace(/ \!/g,"!").replace(/ ,/g,",").replace(/ \' /g,"'").replace(/ n't/g,"n't").replace(/ 'm/g,"'m").replace(/ 's/g,"'s").replace(/ 've/g,"'ve").replace(/ 're/g,"'re"),xt=(e,n=!0)=>{if(e.Regex!==void 0){let t=e.Regex.replace(/\\([#&~])/g,"$1");t=t.replace(/\\A/g,"^").replace(/\\z/g,"$").replace(/\\Z/g,"(?=\\r?\\n?$)");for(let[r,s]of Rl)t=t.replaceAll(r,s);try{return new RegExp(t,"gu")}catch(r){if(!(r instanceof SyntaxError)||!r.message.toLowerCase().includes("invalid property name"))throw r;let s=!1,a=t.replace(/(\\[pP])\{([^}=]+)\}/g,(i,o,u)=>{try{return new RegExp(`\\p{${u}}`,"u"),`${o}{${u}}`}catch{return s=!0,`${o}{Script=${u}}`}});if(!s)throw r;try{return new RegExp(a,"gu")}catch{throw r}}}else if(e.String!==void 0){let t=Wl(e.String);return new RegExp(n?t:`(${t})`,"gu")}else return console.warn("Unknown pattern type:",e),null},Wl=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),Ml=(e,n,t)=>{let r=[],s=0;for(;s<e.length;){if(r.push(e[s]),(n.get(e[s])??t)!==t){++s;continue}for(;++s<e.length&&(n.get(e[s])??t)===t;)n.get(r.at(-1))!==t&&(r[r.length-1]+=e[s])}return r},Bl=e=>e>=19968&&e<=40959||e>=13312&&e<=19903||e>=131072&&e<=173791||e>=173824&&e<=177983||e>=177984&&e<=178207||e>=178208&&e<=183983||e>=63744&&e<=64255||e>=194560&&e<=195103,Nl=e=>Number.isInteger(e)||typeof e=="bigint",Hl=e=>{let n=0;for(let t of e)++n;return n},Ul=e=>ka(e.toLowerCase()),Ae=(...e)=>Array.prototype.concat.apply([],e),Rr=e=>new Map(Object.entries(e)),Fl=(e,n)=>{let t=[],r=0;for(let s of e.matchAll(n)){let a=s[0];r<s.index&&t.push(e.slice(r,s.index)),a.length>0&&t.push(a),r=s.index+a.length}return r<e.length&&t.push(e.slice(r)),t},ka=e=>e.replace(/\p{M}/gu,""),ga=(e,n,t=[])=>{if(!e||Array.isArray(e)||typeof e!="object")return`${n} must be a valid object`;for(let r of t)if(!(r in e))return`${n} must contain a "${r}" property`;return null},Kl=e=>e.match(/\S+/g)||[],Vl=class{constructor(){let e=function(...n){return e._call(...n)};return Object.setPrototypeOf(e,new.target.prototype)}},Wn=Vl,$l=class extends Wn{constructor(e){super(),this.config=e}_call(e){return this.normalize(e)}},Ke=$l,jl=class extends Ke{tokenize_chinese_chars(e){let n=[];for(let t=0;t<e.length;++t){let r=e[t],s=r.charCodeAt(0);Bl(s)?(n.push(" "),n.push(r),n.push(" ")):n.push(r)}return n.join("")}strip_accents(e){return e.normalize("NFD").replace(/\p{Mn}/gu,"")}is_control(e){switch(e){case"	":case`
`:case"\r":return!1;default:return/^\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}$/u.test(e)}}clean_text(e){let n=[];for(let t of e){let r=t.charCodeAt(0);r===0||r===65533||this.is_control(t)||(/^\s$/.test(t)?n.push(" "):n.push(t))}return n.join("")}normalize(e){return this.config.clean_text&&(e=this.clean_text(e)),this.config.handle_chinese_chars&&(e=this.tokenize_chinese_chars(e)),this.config.lowercase?(e=e.toLowerCase(),this.config.strip_accents!==!1&&(e=this.strip_accents(e))):this.config.strip_accents&&(e=this.strip_accents(e)),e}},Ql=jl,Zl=class extends Ke{constructor(e){super(e),this.charsmap=e.precompiled_charsmap??null}normalize(e){return e=e.replace(/[\u0001-\u0008\u000B\u000E-\u001F\u007F\u008F\u009F]/gm,""),e=e.replace(/[\u0009\u000A\u000C\u000D\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u2581\u3000\uFEFF\uFFFD]/gm," "),e.includes("\uFF5E")?e=e.split("\uFF5E").map(t=>t.normalize("NFKC")).join("\uFF5E"):e=e.normalize("NFKC"),e}},Yl=Zl,Xl=class extends Ke{constructor(e){super(e),this.normalizers=(e.normalizers??[]).map(n=>Sa(n))}normalize(e){return this.normalizers.reduce((n,t)=>t?t.normalize(n):n,e)}},Jl=Xl,ed=class extends Ke{normalize(e){let n=xt(this.config.pattern??{});return n===null?e:e.replaceAll(n,this.config.content??"")}},nd=ed,td=class extends Ke{constructor(){super(...arguments),this.form="NFC"}normalize(e){return e=e.normalize(this.form),e}},Dt=td,rd=class extends Dt{constructor(){super(...arguments),this.form="NFC"}},sd=rd,ad=class extends Dt{constructor(){super(...arguments),this.form="NFD"}},id=ad,od=class extends Dt{constructor(){super(...arguments),this.form="NFKC"}},ud=od,ld=class extends Dt{constructor(){super(...arguments),this.form="NFKD"}},dd=ld,cd=class extends Ke{normalize(e){return this.config.strip_left&&this.config.strip_right?e=e.trim():(this.config.strip_left&&(e=e.trimStart()),this.config.strip_right&&(e=e.trimEnd())),e}},pd=cd,fd=class extends Ke{normalize(e){return ka(e)}},md=fd,hd=class extends Ke{normalize(e){return e.toLowerCase()}},gd=hd,_d=class extends Ke{normalize(e){return e=this.config.prepend+e,e}},yd=_d;function bd(e){if(e===null)return null;switch(e.type){case"BertNormalizer":return new Ql(e);case"Precompiled":return new Yl(e);case"Sequence":return new Jl(e);case"Replace":return new nd(e);case"NFC":return new sd(e);case"NFD":return new id(e);case"NFKC":return new ud(e);case"NFKD":return new dd(e);case"Strip":return new pd(e);case"StripAccents":return new md(e);case"Lowercase":return new gd(e);case"Prepend":return new yd(e);default:throw new Error(`Unknown Normalizer type: ${e.type}`)}}var Sa=bd,wd=class extends Wn{pre_tokenize(e,n){return(Array.isArray(e)?e.map(t=>this.pre_tokenize_text(t,n)):this.pre_tokenize_text(e,n)).flat()}_call(e,n){return this.pre_tokenize(e,n)}},Ge=wd,vd=class extends Ge{constructor(e){super(),this.config=e,this.add_prefix_space=this.config.add_prefix_space??!1,this.trim_offsets=this.config.trim_offsets??!1,this.use_regex=this.config.use_regex??!0,this.pattern=/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,this.byte_encoder=va,this.text_encoder=new TextEncoder}pre_tokenize_text(e,n){return this.add_prefix_space&&!e.startsWith(" ")&&(e=" "+e),(this.use_regex?e.match(this.pattern)||[]:[e]).map(r=>Array.from(this.text_encoder.encode(r),s=>this.byte_encoder[s]).join(""))}},kd=vd,Sd=class extends Ge{pre_tokenize_text(e,n){return e.match(/\w+|[^\w\s]+/g)||[]}},Td=Sd,xd=class extends Ge{constructor(e){super(),this.replacement=e.replacement??"\u2581",this.str_rep=e.str_rep||this.replacement,this.prepend_scheme=e.prepend_scheme??"always"}pre_tokenize_text(e,n){let{section_index:t=void 0}=n??{},r=e.replaceAll(" ",this.str_rep);return!r.startsWith(this.replacement)&&(this.prepend_scheme==="always"||this.prepend_scheme==="first"&&t===0)&&(r=this.str_rep+r),[r]}},Dd=xd,Ed=class extends Ge{constructor(e){super(),this.config=e,this.pattern=xt(this.config.pattern??{},this.config.invert??!0)}pre_tokenize_text(e){return this.pattern===null?[]:this.config.invert?e.match(this.pattern)||[]:this.config.behavior?.toLowerCase()==="removed"?e.split(this.pattern).filter(n=>n):Fl(e,this.pattern)}},qd=Ed,Ld=class extends Ge{constructor(e){super(),this.config=e,this.pattern=new RegExp(`[^${Tt}]+|[${Tt}]+`,"gu")}pre_tokenize_text(e){return e.match(this.pattern)||[]}},Od=Ld,Cd=class extends Ge{constructor(e){super(),this.config=e;let n=`[^\\d]+|\\d${this.config.individual_digits?"":"+"}`;this.pattern=new RegExp(n,"gu")}pre_tokenize_text(e){return e.match(this.pattern)||[]}},Pd=Cd,zd=class extends Ge{constructor(){super(),this.pattern=new RegExp(`[^\\s${Tt}]+|[${Tt}]`,"gu")}pre_tokenize_text(e,n){return e.trim().match(this.pattern)||[]}},Ad=zd,Gd=class extends Ge{constructor(e){super(),this.config=e,this.pattern=xt(this.config.pattern??{}),this.content=this.config.content??""}pre_tokenize_text(e){return this.pattern===null?[e]:[e.replaceAll(this.pattern,this.config.content??"")]}},Id=Gd,Rd=class extends Ge{constructor(e){super(),this.tokenizers=(e.pretokenizers??[]).map(n=>Ta(n))}pre_tokenize_text(e,n){return this.tokenizers.reduce((t,r)=>r?r.pre_tokenize(t,n):t,[e])}},Wd=Rd,Md=class extends Ge{pre_tokenize_text(e){return Kl(e)}},Bd=Md,Nd=class extends Ge{constructor(e){super(),this.config=e,this._length=e.length}pre_tokenize_text(e){let n=[];for(let t=0;t<e.length;t+=this._length)n.push(e.slice(t,t+this._length));return n}},Hd=Nd;function Ud(e){if(e===null)return null;switch(e.type){case"BertPreTokenizer":return new Ad;case"Sequence":return new Wd(e);case"Whitespace":return new Td;case"WhitespaceSplit":return new Bd;case"Metaspace":return new Dd(e);case"ByteLevel":return new kd(e);case"Split":return new qd(e);case"Punctuation":return new Od(e);case"Digits":return new Pd(e);case"Replace":return new Id(e);case"FixedLength":return new Hd(e);default:throw new Error(`Unknown PreTokenizer type: ${e.type}`)}}var Ta=Ud,Fd=class extends Wn{constructor(e){super(),this.config=e,this.vocab=[],this.tokens_to_ids=new Map,this.unk_token_id=void 0,this.unk_token=void 0,this.end_of_word_suffix=void 0,this.fuse_unk=this.config.fuse_unk??!1}_call(e){let n=this.encode(e);return this.fuse_unk&&(n=Ml(n,this.tokens_to_ids,this.unk_token_id)),n}},Et=Fd,Kd=class extends Et{constructor(e){super(e),this.max_input_chars_per_word=100,this.tokens_to_ids=Rr(e.vocab),this.unk_token_id=this.tokens_to_ids.get(e.unk_token),this.unk_token=e.unk_token,this.max_input_chars_per_word=e.max_input_chars_per_word??100,this.vocab=new Array(this.tokens_to_ids.size);for(let[n,t]of this.tokens_to_ids)this.vocab[t]=n}encode(e){let n=[];for(let t of e){let r=[...t];if(r.length>this.max_input_chars_per_word){n.push(this.unk_token);continue}let s=!1,a=0,i=[];for(;a<r.length;){let o=r.length,u=null;for(;a<o;){let l=r.slice(a,o).join("");if(a>0&&(l=this.config.continuing_subword_prefix+l),this.tokens_to_ids.has(l)){u=l;break}--o}if(u===null){s=!0;break}i.push(u),a=o}s?n.push(this.unk_token):n.push(...i)}return n}},_a=Kd,ya=class xa{constructor(n,t){this.is_leaf=n,this.children=t}static default(){return new xa(!1,new Map)}},Vd=class{constructor(){this.root=ya.default()}extend(e){for(let n of e)this.push(n)}push(e){let n=this.root;for(let t of e){let r=n.children.get(t);r===void 0&&(r=ya.default(),n.children.set(t,r)),n=r}n.is_leaf=!0}*common_prefix_search(e){let n=this.root;if(n===void 0)return;let t="";for(let r of e){if(t+=r,n=n.children.get(r),n===void 0)return;n.is_leaf&&(yield t)}}},$d=Vd,Gr=class Da{constructor(n,t,r,s,a){this.token_id=n,this.node_id=t,this.pos=r,this.length=s,this.score=a,this.prev=null,this.backtrace_score=0}clone(){let n=new Da(this.token_id,this.node_id,this.pos,this.length,this.score);return n.prev=this.prev,n.backtrace_score=this.backtrace_score,n}},jd=class{constructor(e,n,t){this.chars=Array.from(e),this.len=this.chars.length,this.bos_token_id=n,this.eos_token_id=t,this.nodes=[],this.begin_nodes=Array.from({length:this.len+1},()=>[]),this.end_nodes=Array.from({length:this.len+1},()=>[]);let r=new Gr(this.bos_token_id??0,0,0,0,0),s=new Gr(this.eos_token_id??0,1,this.len,0,0);this.nodes.push(r.clone()),this.nodes.push(s.clone()),this.begin_nodes[this.len].push(s),this.end_nodes[0].push(r)}insert(e,n,t,r){let s=this.nodes.length,a=new Gr(r,s,e,n,t);this.begin_nodes[e].push(a),this.end_nodes[e+n].push(a),this.nodes.push(a)}viterbi(){let e=this.len,n=0;for(;n<=e;){if(this.begin_nodes[n].length==0)return[];for(let i of this.begin_nodes[n]){i.prev=null;let o=0,u=null;for(let l of this.end_nodes[n]){let d=l.backtrace_score+i.score;(u===null||d>o)&&(u=l.clone(),o=d)}if(u!==null)i.prev=u,i.backtrace_score=o;else return[]}++n}let t=[],s=this.begin_nodes[e][0].prev;if(s===null)return[];let a=s.clone();for(;a.prev!==null;)t.push(a.clone()),a=a.clone().prev.clone();return t.reverse(),t}piece(e){return this.chars.slice(e.pos,e.pos+e.length).join("")}tokens(){return this.viterbi().map(n=>this.piece(n))}token_ids(){return this.viterbi().map(n=>n.token_id)}},Qd=jd;function Zd(e){if(e.length===0)throw new Error("Array must not be empty");let n=e[0],t=0;for(let r=1;r<e.length;++r)e[r]<n&&(n=e[r],t=r);return[n,t]}var Yd=class extends Et{constructor(e,n){super(e);let t=e.vocab.length;this.vocab=new Array(t),this.scores=new Array(t);for(let r=0;r<t;++r)[this.vocab[r],this.scores[r]]=e.vocab[r];this.unk_token_id=e.unk_id,this.unk_token=this.vocab[e.unk_id],this.tokens_to_ids=new Map(this.vocab.map((r,s)=>[r,s])),this.bos_token=" ",this.bos_token_id=this.tokens_to_ids.get(this.bos_token),this.eos_token=n,this.eos_token_id=this.tokens_to_ids.get(this.eos_token),this.unk_token=this.vocab[this.unk_token_id],this.min_score=Zd(this.scores)[0],this.unk_score=this.min_score-10,this.scores[this.unk_token_id]=this.unk_score,this.trie=new $d,this.trie.extend(this.vocab),this.fuse_unk=!0}populate_nodes(e){let n=e.chars,t=1,r=0;for(;r<n.length;){let s=!1,a=[],i=n.slice(r).join(""),o=this.trie.common_prefix_search(i);for(let u of o){a.push(u);let l=this.tokens_to_ids.get(u),d=this.scores[l],c=Hl(u);e.insert(r,c,d,l),!s&&c===t&&(s=!0)}s||e.insert(r,t,this.unk_score,this.unk_token_id),r+=t}}tokenize(e){let n=new Qd(e,this.bos_token_id,this.eos_token_id);return this.populate_nodes(n),n.tokens()}encode(e){let n=[];for(let t of e){let r=this.tokenize(t);n.push(...r)}return n}},ba=Yd,Xd=class{constructor(e=(t,r)=>t>r,n=1/0){this._heap=[],this._comparator=e,this._max_size=n}get size(){return this._heap.length}is_empty(){return this.size===0}peek(){return this._heap[0]}push(...e){return this.extend(e)}extend(e){for(let n of e)if(this.size<this._max_size)this._heap.push(n),this._sift_up();else{let t=this._smallest();this._comparator(n,this._heap[t])&&(this._heap[t]=n,this._sift_up_from(t))}return this.size}pop(){let e=this.peek(),n=this.size-1;return n>0&&this._swap(0,n),this._heap.pop(),this._sift_down(),e}replace(e){let n=this.peek();return this._heap[0]=e,this._sift_down(),n}_parent(e){return(e+1>>>1)-1}_left(e){return(e<<1)+1}_right(e){return e+1<<1}_greater(e,n){return this._comparator(this._heap[e],this._heap[n])}_swap(e,n){let t=this._heap[e];this._heap[e]=this._heap[n],this._heap[n]=t}_sift_up(){this._sift_up_from(this.size-1)}_sift_up_from(e){for(;e>0&&this._greater(e,this._parent(e));)this._swap(e,this._parent(e)),e=this._parent(e)}_sift_down(){let e=0;for(;this._left(e)<this.size&&this._greater(this._left(e),e)||this._right(e)<this.size&&this._greater(this._right(e),e);){let n=this._right(e)<this.size&&this._greater(this._right(e),this._left(e))?this._right(e):this._left(e);this._swap(e,n),e=n}}_smallest(){return 2**Math.floor(Math.log2(this.size))-1}},Jd=Xd,ec=class{constructor(e){this.capacity=e,this.cache=new Map}get(e){if(!this.cache.has(e))return;let n=this.cache.get(e);return this.cache.delete(e),this.cache.set(e,n),n}put(e,n){this.cache.has(e)&&this.cache.delete(e),this.cache.set(e,n),this.cache.size>this.capacity&&this.cache.delete(this.cache.keys().next().value)}clear(){this.cache.clear()}},nc=ec,tc=class extends Et{constructor(e){super(e),this.tokens_to_ids=Rr(e.vocab),this.unk_token_id=this.tokens_to_ids.get(e.unk_token),this.unk_token=e.unk_token,this.vocab=new Array(this.tokens_to_ids.size);for(let[t,r]of this.tokens_to_ids)this.vocab[r]=t;let n=Array.isArray(e.merges[0]);this.merges=n?e.merges:e.merges.map(t=>t.split(" ",2)),this.bpe_ranks=new Map(this.merges.map((t,r)=>[JSON.stringify(t),r])),this.end_of_word_suffix=e.end_of_word_suffix,this.continuing_subword_suffix=e.continuing_subword_suffix??null,this.byte_fallback=this.config.byte_fallback??!1,this.byte_fallback&&(this.text_encoder=new TextEncoder),this.ignore_merges=this.config.ignore_merges??!1,this.max_length_to_cache=256,this.cache_capacity=1e4,this.cache=new nc(this.cache_capacity)}clear_cache(){this.cache.clear()}bpe(e){if(e.length===0)return[];let n=this.cache.get(e);if(n!==void 0)return n;let t=Array.from(e);this.end_of_word_suffix&&(t[t.length-1]+=this.end_of_word_suffix);let r=[];if(t.length>1){let s=new Jd((o,u)=>o.score<u.score),a={token:t[0],bias:0,prev:null,next:null},i=a;for(let o=1;o<t.length;++o){let u={bias:o/t.length,token:t[o],prev:i,next:null};i.next=u,this.add_node(s,i),i=u}for(;!s.is_empty();){let o=s.pop();if(o.deleted||!o.next||o.next.deleted)continue;if(o.deleted=!0,o.next.deleted=!0,o.prev){let l={...o.prev};o.prev.deleted=!0,o.prev=l,l.prev?l.prev.next=l:a=l}let u={token:o.token+o.next.token,bias:o.bias,prev:o.prev,next:o.next.next};u.prev?(u.prev.next=u,this.add_node(s,u.prev)):a=u,u.next&&(u.next.prev=u,this.add_node(s,u))}for(let o=a;o!==null;o=o.next)r.push(o.token)}else r=t;if(this.continuing_subword_suffix)for(let s=0;s<r.length-1;++s)r[s]+=this.continuing_subword_suffix;return e.length<this.max_length_to_cache&&this.cache.put(e,r),r}add_node(e,n){let t=this.bpe_ranks.get(JSON.stringify([n.token,n.next.token]));t!==void 0&&(n.score=t+n.bias,e.push(n))}encode(e){let n=[];for(let t of e){if(this.ignore_merges&&this.tokens_to_ids.has(t)){n.push(t);continue}let r=this.bpe(t);for(let s of r)if(this.tokens_to_ids.has(s))n.push(s);else if(this.byte_fallback){let a=Array.from(this.text_encoder.encode(s)).map(i=>`<0x${i.toString(16).toUpperCase().padStart(2,"0")}>`);a.every(i=>this.tokens_to_ids.has(i))?n.push(...a):this.unk_token!=null&&n.push(this.unk_token)}else this.unk_token!=null&&n.push(this.unk_token)}return n}},wa=tc,rc=class extends Et{constructor(e,n){super(e);let t=e.vocab;this.tokens_to_ids=Rr(n.target_lang?t[n.target_lang]:t),this.bos_token=n.bos_token,this.bos_token_id=this.tokens_to_ids.get(this.bos_token),this.eos_token=n.eos_token,this.eos_token_id=this.tokens_to_ids.get(this.eos_token),this.pad_token=n.pad_token,this.pad_token_id=this.tokens_to_ids.get(this.pad_token),this.unk_token=n.unk_token,this.unk_token_id=this.tokens_to_ids.get(this.unk_token),this.vocab=new Array(this.tokens_to_ids.size);for(let[r,s]of this.tokens_to_ids)this.vocab[s]=r}encode(e){return e}},sc=rc;function ac(e,n){switch(e.type){case"WordPiece":return new _a(e);case"Unigram":return new ba(e,n.eos_token);case"BPE":return new wa(e);default:if(e.vocab)return Array.isArray(e.vocab)?new ba(e,n.eos_token):Object.hasOwn(e,"continuing_subword_prefix")&&Object.hasOwn(e,"unk_token")?Object.hasOwn(e,"merges")?new wa(e):new _a(e):new sc(e,{target_lang:n.target_lang,bos_token:n.bos_token,eos_token:n.eos_token,pad_token:n.pad_token,unk_token:n.unk_token});throw new Error(`Unknown TokenizerModel type: ${e?.type}`)}}var ic=ac,oc=class extends Wn{constructor(e){super(),this.config=e}_call(e,...n){return this.post_process(e,...n)}},Mn=oc,uc=class extends Mn{post_process(e,n=null,t=!0){let r=n===null?this.config.single:this.config.pair,s=[],a=[];for(let i of r)"SpecialToken"in i?t&&(s.push(i.SpecialToken.id),a.push(i.SpecialToken.type_id)):"Sequence"in i&&(i.Sequence.id==="A"?(s=Ae(s,e),a=Ae(a,new Array(e.length).fill(i.Sequence.type_id))):i.Sequence.id==="B"&&(s=Ae(s,n),a=Ae(a,new Array(n.length).fill(i.Sequence.type_id))));return{tokens:s,token_type_ids:a}}},lc=uc,dc=class extends Mn{post_process(e,n=null){return{tokens:e,tokens_pair:n}}},cc=dc,pc=class extends Mn{constructor(e){super(e),this.sep=e.sep,this.cls=e.cls}post_process(e,n=null,t=!0){t&&(e=Ae([this.cls[0]],e,[this.sep[0]]));let r=new Array(e.length).fill(0);if(n){let s=[],a=t?[this.sep[0]]:[];e=Ae(e,s,n,a),r=Ae(r,new Array(n.length+s.length+a.length).fill(1))}return{tokens:e,token_type_ids:r}}},fc=pc,mc=class extends Mn{constructor(e){super(e),this.sep=e.sep,this.cls=e.cls}post_process(e,n,t=!0){t&&(e=Ae([this.cls[0]],e,[this.sep[0]]));let r=new Array(e.length).fill(0);if(n){let s=t?[this.sep[0]]:[],a=t?[this.sep[0]]:[];e=Ae(e,s,n,a),r=Ae(r,new Array(n.length+s.length+a.length).fill(1))}return{tokens:e,token_type_ids:r}}},hc=mc,gc=class extends Mn{constructor(e){super(e),this.processors=(e.processors??[]).map(n=>Ea(n))}post_process(e,n=null,t=!0){let r={tokens:e,tokens_pair:n};for(let s of this.processors)r=s.post_process(r.tokens,r.tokens_pair,t);return r}},_c=gc;function yc(e){if(e===null)return null;switch(e.type){case"TemplateProcessing":return new lc(e);case"ByteLevel":return new cc(e);case"BertProcessing":return new fc(e);case"RobertaProcessing":return new hc(e);case"Sequence":return new _c(e);default:throw new Error(`Unknown PostProcessor type: ${e.type}`)}}var Ea=yc,bc=class extends Wn{constructor(e){super(),this.config=e,this.added_tokens=[],this.end_of_word_suffix=null,this.trim_offsets="trim_offsets"in e?e.trim_offsets:!1}_call(e){return this.decode(e)}decode(e){return this.decode_chain(e).join("")}},He=bc,wc=class extends He{constructor(e){super(e),this.byte_decoder=Il,this.text_decoder=new TextDecoder("utf-8",{fatal:!1,ignoreBOM:!0}),this.end_of_word_suffix=null}convert_tokens_to_string(e){let n=e.join(""),t=new Uint8Array([...n].map(r=>this.byte_decoder[r]));return this.text_decoder.decode(t)}decode_chain(e){let n=[],t=[];for(let r of e)this.added_tokens.find(s=>s.content===r)!==void 0?(t.length>0&&(n.push(this.convert_tokens_to_string(t)),t=[]),n.push(r)):t.push(r);return t.length>0&&n.push(this.convert_tokens_to_string(t)),n}},vc=wc,kc=class extends He{constructor(e){super(e),this.cleanup=e.cleanup}decode_chain(e){return e.map((n,t)=>{if(t!==0){let r=this.config.prefix;r&&n.startsWith(r)?n=n.replace(r,""):n=" "+n}return this.cleanup&&(n=Ir(n)),n})}},Sc=kc,Tc=class extends He{constructor(e){super(e),this.replacement=e.replacement??"\u2581"}decode_chain(e){let n=[];for(let t=0;t<e.length;++t){let r=e[t].replaceAll(this.replacement," ");t==0&&r.startsWith(" ")&&(r=r.substring(1)),n.push(r)}return n}},xc=Tc,Dc=class extends He{constructor(e){super(e),this.suffix=e.suffix??""}decode_chain(e){return e.map((n,t)=>n.replaceAll(this.suffix,t===e.length-1?"":" "))}},Ec=Dc,qc=class extends He{constructor(e){super(e),this.pad_token=e.pad_token??"",this.word_delimiter_token=e.word_delimiter_token??"",this.cleanup=e.cleanup}convert_tokens_to_string(e){if(e.length===0)return"";let n=[e[0]];for(let s=1;s<e.length;++s)e[s]!==n.at(-1)&&n.push(e[s]);let r=n.filter(s=>s!==this.pad_token).join("");return this.cleanup&&(r=Ir(r).replaceAll(this.word_delimiter_token," ").trim()),r}decode_chain(e){return[this.convert_tokens_to_string(e)]}},Lc=qc,Oc=class extends He{constructor(e){super(e),this.decoders=(e.decoders??[]).map(n=>qa(n))}decode_chain(e){return this.decoders.reduce((n,t)=>t.decode_chain(n),e)}},Cc=Oc,Pc=class extends He{decode_chain(e){let n=xt(this.config.pattern),t=this.config.content??"";return n===null?e:e.map(r=>r.replaceAll(n,t))}},zc=Pc,Ac=class extends He{decode_chain(e){return[e.join("")]}},Gc=Ac,Ic=class extends He{constructor(e){super(e),this.content=e.content??"",this.start=e.start??0,this.stop=e.stop??0}decode_chain(e){return e.map(n=>{let t=0;for(let s=0;s<this.start&&n[s]===this.content;++s){t=s+1;continue}let r=n.length;for(let s=0;s<this.stop;++s){let a=n.length-s-1;if(n[a]===this.content){r=a;continue}else break}return n.slice(t,r)})}},Rc=Ic,Wc=class extends He{constructor(e){super(e),this.text_decoder=new TextDecoder}decode_chain(e){let n=[],t=[];for(let r of e){let s=null;if(r.length===6&&r.startsWith("<0x")&&r.endsWith(">")){let a=parseInt(r.slice(3,5),16);isNaN(a)||(s=a)}if(s!==null)t.push(s);else{if(t.length>0){let a=this.text_decoder.decode(Uint8Array.from(t));n.push(a),t=[]}n.push(r)}}if(t.length>0){let r=this.text_decoder.decode(Uint8Array.from(t));n.push(r),t=[]}return n}},Mc=Wc;function Bc(e){if(e===null)return null;switch(e.type){case"ByteLevel":return new vc(e);case"WordPiece":return new Sc(e);case"Metaspace":return new xc(e);case"BPEDecoder":return new Ec(e);case"CTC":return new Lc(e);case"Sequence":return new Cc(e);case"Replace":return new zc(e);case"Fuse":return new Gc(e);case"Strip":return new Rc(e);case"ByteFallback":return new Mc(e);default:throw new Error(`Unknown Decoder type: ${e.type}`)}}var qa=Bc,Nc=class{constructor(e,n){let t=ga(e,"Tokenizer",["model","decoder","post_processor","pre_tokenizer","normalizer"]);if(t)throw new Error(t);let r=ga(n,"Config");if(r)throw new Error(r);this.tokenizer=e,this.config=n,this.normalizer=Sa(this.tokenizer.normalizer),this.pre_tokenizer=Ta(this.tokenizer.pre_tokenizer),this.model=ic(this.tokenizer.model,this.config),this.post_processor=Ea(this.tokenizer.post_processor),this.decoder=qa(this.tokenizer.decoder),this.special_tokens=[],this.all_special_ids=[],this.added_tokens=[];let s=[],a=[];this.added_tokens_map=new Map;for(let i of this.tokenizer.added_tokens){let o=new Al(i);if(this.added_tokens.push(o),this.model.tokens_to_ids.set(o.content,o.id),this.model.vocab[o.id]=o.content,o.special&&(this.special_tokens.push(o.content),this.all_special_ids.push(o.id)),this.added_tokens_map.set(o.content,o),o.normalized&&this.normalizer!==null){let u=this.normalizer(o.content);a.push(u),this.added_tokens_map.set(u,o)}else s.push(o.content)}(this.config.additional_special_tokens??[]).forEach(i=>{this.special_tokens.includes(i)||this.special_tokens.push(i)}),this.decoder&&(this.decoder.added_tokens=this.added_tokens,this.decoder.end_of_word_suffix=this.model.end_of_word_suffix),this.splitter_unnormalized=new ma(s),this.splitter_normalized=new ma(a),this.remove_space=this.config.remove_space,this.clean_up_tokenization_spaces=this.config.clean_up_tokenization_spaces??!0,this.do_lowercase_and_remove_accent=this.config.do_lowercase_and_remove_accent??!1}encode(e,{text_pair:n=null,add_special_tokens:t=!0,return_token_type_ids:r=null}={}){let{tokens:s,token_type_ids:a}=this.tokenize_helper(e,{text_pair:n,add_special_tokens:t}),i=s.map(u=>this.added_tokens_map.get(u)?.id??this.model.tokens_to_ids.get(u)??this.model.unk_token_id),o={ids:i,tokens:s,attention_mask:new Array(i.length).fill(1)};return r&&a&&(o.token_type_ids=a),o}decode(e,n={}){if(!Array.isArray(e)||e.length===0||!Nl(e[0]))throw Error("token_ids must be a non-empty array of integers.");let t=e.map(s=>this.model.vocab[Number(s)]??this.model.unk_token);n.skip_special_tokens&&(t=t.filter(s=>!this.special_tokens.includes(s)));let r=this.decoder?this.decoder(t):t.join(" ");return this.decoder&&this.decoder.end_of_word_suffix&&(r=r.replaceAll(this.decoder.end_of_word_suffix," "),n.skip_special_tokens&&(r=r.trim())),(n.clean_up_tokenization_spaces??this.clean_up_tokenization_spaces)&&(r=Ir(r)),r}tokenize(e,{text_pair:n=null,add_special_tokens:t=!1}={}){return this.tokenize_helper(e,{text_pair:n,add_special_tokens:t}).tokens}encode_text(e){if(e===null)return null;let n=this.splitter_unnormalized.split(e);return n.forEach((t,r)=>{let s=this.added_tokens_map.get(t);s&&(s.lstrip&&r>0&&(n[r-1]=n[r-1].trimEnd()),s.rstrip&&r<n.length-1&&(n[r+1]=n[r+1].trimStart()))}),n.flatMap((t,r)=>{if(t.length===0)return[];if(this.added_tokens_map.has(t))return[t];if(this.remove_space===!0&&(t=t.trim().split(/\s+/).join(" ")),this.do_lowercase_and_remove_accent&&(t=Ul(t)),this.normalizer!==null&&(t=this.normalizer(t)),t.length===0)return[];let s=this.splitter_normalized.split(t);return s.forEach((a,i)=>{let o=this.added_tokens_map.get(a);o&&(o.lstrip&&i>0&&(s[i-1]=s[i-1].trimEnd()),o.rstrip&&i<s.length-1&&(s[i+1]=s[i+1].trimStart()))}),s.flatMap(a=>{if(a.length===0)return[];if(this.added_tokens_map.has(a))return[a];let i=this.pre_tokenizer!==null?this.pre_tokenizer(a,{section_index:r}):[a];return this.model(i)})})}tokenize_helper(e,{text_pair:n=null,add_special_tokens:t=!0}){let r=this.encode_text(e),s=this.encode_text(n||null);return this.post_processor?this.post_processor(r,s,t):{tokens:Ae(r??[],s??[])}}token_to_id(e){return this.model.tokens_to_ids.get(e)}id_to_token(e){return this.model.vocab[e]}get_added_tokens_decoder(){let e=new Map;for(let n of this.added_tokens)e.set(n.id,n);return e}get_vocab(e=!0){let n=new Map;for(let t=0;t<this.model.vocab.length;++t){let r=this.model.vocab[t];(e||!this.added_tokens_map.has(r))&&n.set(r,t)}return n}},La=Nc;Oi();async function cs(e={}){let n=globalThis.navigator?.gpu;if(!n)throw new Error("WebGPU is not available in this browser context");let t=await n.requestAdapter({powerPreference:e.powerPreference??"high-performance"});if(!t)throw new Error("No WebGPU adapter was returned");let r=await t.requestDevice({requiredFeatures:Di(t,e.disabledFeatures),requiredLimits:e.requiredLimits??qi(t),label:e.label??"webgpu-ml-runtime"});return r.addEventListener("uncapturederror",s=>{console.error("WebGPU uncaptured error:",s.error)}),Li({gpu:n,adapter:t,device:r,deviceInfo:Ei(r,t,n),destroy:()=>r.destroy()})}we();function of(e){return e===null||typeof e!="object"?!1:"destroy"in e&&"mapAsync"in e&&"getMappedRange"in e&&!("buffer"in e)}function yn(e){return of(e)?e:e.buffer}function Ci(e){if(e.tensor!==void 0&&e.tensor!==null)return yn(e.tensor);if(e.buffer!==void 0&&e.buffer!==null)return yn(e.buffer);throw new Error(`binding ${e.binding??"?"} is missing tensor or buffer`)}var Ut=class{pipelines=new Map;bindGroups=new Map;maxBindGroupEntries=4096;bufferIds=new WeakMap;#n=1;captureShaders=!1;capturedShaders=new Map;#e;constructor(n){this.#e=n}async programPipeline({name:n,source:t,entryPoint:r,cacheKey:s,layoutFactory:a}){return this.buildPipeline({cacheKey:s,name:n,entryPoint:r,layoutFactory:a,sourceFactory:()=>t})}async buildPipeline({cacheKey:n,name:t,entryPoint:r,layoutFactory:s,sourceFactory:a}){let i=this.pipelines.get(n);if(i)return i;let o=await a();this.captureShaders&&!this.capturedShaders.has(t)&&this.capturedShaders.set(t,o);let u=this.#e.createShaderModule(o,t),l=await this.#e.createComputePipeline({label:t,layout:s(),compute:{module:u,entryPoint:r}});return this.pipelines.set(n,l),l}cachedBindGroups({name:n,cacheKey:t,pipeline:r,bindings:s}){let a=new Map;for(let l of s){let d=l.group??0,c=a.get(d);c?c.push(l):a.set(d,[l])}let i=[...a.keys()].sort((l,d)=>l-d),o=this.buildGroupBindGroup(n,t,r,0,a.get(0)??[]),u=i.filter(l=>l!==0).map(l=>({group:l,bindGroup:this.buildGroupBindGroup(n,t,r,l,a.get(l))}));return u.length>0?{bindGroup:o,extraBindGroups:u}:{bindGroup:o}}buildGroupBindGroup(n,t,r,s,a){let i=a.map((l,d)=>{let c=Ci(l),p={buffer:c,offset:l.offset??0};return l.size!==void 0&&l.size>0&&(p.size=l.size),{binding:l.binding??d,resource:p,cachePart:`${l.binding??d}:${this.bufferId(c)}:${p.offset}:${p.size??""}`}}),o=`${t}|g${s}|${i.map(l=>l.cachePart).join("|")}`,u=this.bindGroups.get(o);if(u===void 0&&(u=this.#e.device.createBindGroup({label:`${n}-bind-group-${s}`,layout:r.getBindGroupLayout(s),entries:i.map(({binding:l,resource:d})=>({binding:l,resource:d}))}),this.bindGroups.set(o,u),this.bindGroups.size>this.maxBindGroupEntries)){let l=this.bindGroups.keys().next().value;l!==void 0&&this.bindGroups.delete(l)}return u}bufferId(n){let t=this.bufferIds.get(n);return t===void 0&&(t=this.#n++,this.bufferIds.set(n,t)),t}pipelineLayout(n,t){let r=t.map((o,u)=>typeof o=="string"?{group:0,binding:u,type:o}:{group:o.group??0,binding:o.binding??u,type:o.type}),s=new Set,a=0;for(let o of r){if(!Number.isInteger(o.binding)||o.binding<0)throw new Error(`pipeline layout ${n} has invalid binding index ${o.binding}`);if(!Number.isInteger(o.group)||o.group<0)throw new Error(`pipeline layout ${n} has invalid bind group index ${o.group}`);let u=`${o.group}:${o.binding}`;if(s.has(u))throw new Error(`pipeline layout ${n} has duplicate binding index ${o.binding} in @group(${o.group})`);if(typeof o.type!="string"||o.type.length===0)throw new Error(`pipeline layout ${n} binding ${o.binding} is missing a buffer type`);s.add(u),a=Math.max(a,o.group)}let i=[];for(let o=0;o<=a;++o)i.push(this.#e.device.createBindGroupLayout({label:`${n}-bgl${o}`,entries:r.filter(u=>u.group===o).map(u=>({binding:u.binding,visibility:GPUShaderStage.COMPUTE,buffer:{type:u.type}}))}));return this.#e.device.createPipelineLayout({label:`${n}-layout`,bindGroupLayouts:i})}clearBindGroups(){let n=this.bindGroups.size;return this.bindGroups.clear(),n}getRenderedShaders(){return[...this.capturedShaders].map(([n,t])=>({name:n,source:t}))}};var Ft=class{pool=new Map;bytes=0;maxBytes;constructor(n=64*1024*1024){this.maxBytes=n}acquire(n,t){let r=this.pool.get(t);return r&&r.length>0?(this.bytes-=t,r.pop()):n.createBuffer({label:"tensor-readback",size:t,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ})}release(n,t){if(this.bytes+n>this.maxBytes){t.destroy();return}let r=this.pool.get(n);r||(r=[],this.pool.set(n,r)),r.push(t),this.bytes+=n}clear(){let n=0;for(let t of this.pool.values())for(let r of t)r.destroy(),n++;return this.pool.clear(),this.bytes=0,n}};var bn=class{runtime;dtype;shape;byteOffset;buffer;size;byteLength;destroyed;constructor({runtime:n,dtype:t,shape:r,buffer:s,byteOffset:a=0}){this.runtime=n,this.dtype=t,this.shape=r,this.byteOffset=a,this.buffer=s,this.size=Y(r),this.byteLength=this.size*se(t),this.destroyed=!1}destroy(){this.destroyed||(this.buffer.destroy(),this.destroyed=!0)}},Vt=class{host;pipelines;profileSession;pendingProfileRuns;readback;destroyed;constructor({host:n}){this.host=n,this.pipelines=new Ut(n),this.profileSession=null,this.pendingProfileRuns=[],this.readback=new Ft,this.destroyed=!1}get device(){return this.host.deviceInfo}get captureShaders(){return this.pipelines.captureShaders}set captureShaders(n){this.pipelines.captureShaders=n}getRenderedShaders(){return this.pipelines.getRenderedShaders()}async destroy(){this.destroyed||(this.destroyed=!0,this.clearTransientCaches(),this.clearReadbackPool(),await this.host.destroy())}clearReadbackPool(){return this.readback.clear()}clearTransientCaches(){return{bindGroups:this.clearBindGroupCache()}}clearBindGroupCache(){return this.pipelines.clearBindGroups()}tensorFromTypedArray(n,t,r){if(!uf(n,r))throw new Error("Only float16/Uint16Array, float32/Float32Array and uint32/Uint32Array tensors are supported");let s=Y(t);if(r.length!==s)throw new Error(`tensor data length ${r.length} does not match shape element count ${s}`);let a=this.host.createBuffer({label:"tensor",size:ps(r.byteLength),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC,mappedAtCreation:!0}),i=a.getMappedRange();return r instanceof Float32Array?new Float32Array(i).set(r):r instanceof Uint16Array?new Uint16Array(i).set(r):r instanceof Int32Array?new Int32Array(i).set(r):new Uint32Array(i).set(r),a.unmap(),new bn({runtime:this,dtype:n,shape:t,buffer:a})}allocateWeightsBuffer({byteLength:n,dtype:t,shape:r,label:s="weights"}){if(!Pi(t))throw new Error(`Unsupported dtype: ${t}`);if(!Number.isInteger(n)||n<0)throw new Error(`byteLength must be a nonnegative integer, got ${n}`);let a=this.host.createBuffer({label:s,size:n,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC});return new bn({runtime:this,dtype:t,shape:r,buffer:a})}writeWeightsRange(n,t,r){if(!(n instanceof bn))throw new Error("writeWeightsRange expects a WebGpuTensor");if(!Number.isInteger(t)||t<0)throw new Error(`byteOffset must be a nonnegative integer, got ${t}`);if(t+r.byteLength>n.byteLength)throw new Error(`write range [${t}, ${t+r.byteLength}] exceeds tensor byteLength ${n.byteLength}`);this.host.writeBuffer(n.buffer,t,r)}async copyBufferToBuffer({src:n,dst:t,srcOffset:r=0,dstOffset:s=0,byteLength:a,wait:i=!1}){if(a===0)return;let o=yn(n),u=yn(t),l=this.host.device.createCommandEncoder({label:"copyBufferToBuffer"});l.copyBufferToBuffer(o,r,u,s,a),await this.host.submit([l.finish()],{wait:i})}async queueIdle(){await this.host.device.queue.onSubmittedWorkDone()}empty(n,t,r="tensor-output"){if(!Pi(n))throw new Error(`Unsupported dtype: ${n}`);let s=Y(t)*se(n),a=this.host.createBuffer({label:r,size:ps(s),usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});return new bn({runtime:this,dtype:n,shape:t,buffer:a})}readTensor(n){if(n.byteLength===0){let o=Ie[n.dtype]?.arrayCtor;return o?Promise.resolve(new o(0)):Promise.reject(new Error(`Unsupported dtype: ${n.dtype}`))}let t=ps(n.byteLength),r=this.readback.acquire(this.host,t),s=this.host.device.createCommandEncoder({label:"readTensor"});s.copyBufferToBuffer(n.buffer,0,r,0,t),this.host.device.queue.submit([s.finish()]);let{dtype:a,byteLength:i}=n;return(async()=>{let o;try{o=await this.host.mapRead(r,0,t)}catch(l){throw this.readback.release(t,r),l}this.readback.release(t,r),t!==i&&(o=o.slice(0,i));let u=Ie[a]?.arrayCtor;if(!u)throw new Error(`Unsupported dtype: ${a}`);return new u(o)})()}async runProgram(n,t={}){await this.runProgramSequence([n],t)}async runProgramSequence(n,t={}){let r=await this.prepareProgramSequence(n);await this.executePreparedProgramSequence(r,t)}async prepareProgramSequence(n){if(!Array.isArray(n)||n.length===0)throw new Error("prepareProgramSequence requires at least one program");let t=[];for(let r of n){if(lf(r)){t.push(df(r));continue}let{name:s,source:a,entryPoint:i="main",cacheKey:o=s,bindings:u,dispatchWorkgroups:l,profile:d}=r;if(typeof a!="string"||a.length===0)throw new Error("program requires WGSL source");if(!Array.isArray(u)||u.length===0)throw new Error("program requires bindings");if(!Array.isArray(l)||l.length!==3)throw new Error("program requires a 3D dispatchWorkgroups array");let c=await this.pipelines.programPipeline({name:s,source:a,entryPoint:i,cacheKey:o,layoutFactory:()=>this.pipelines.pipelineLayout(s,u)}),{bindGroup:p,extraBindGroups:f}=this.pipelines.cachedBindGroups({name:s,cacheKey:o,pipeline:c,bindings:u});t.push({pipeline:c,bindGroup:p,...f?{extraBindGroups:f}:{},dispatchWorkgroups:l,name:s,cacheKey:o,profile:d})}return t}async executePreparedProgramSequence(n,t={}){if(!Array.isArray(n)||n.length===0)throw new Error("executePreparedProgramSequence requires at least one prepared step");let r=t.wait??!1;await this._runSteps(n,{wait:r,mergePass:!this.profileSession})}enqueuePreparedProgramSequence(n){if(!Array.isArray(n)||n.length===0)throw new Error("enqueuePreparedProgramSequence requires at least one prepared step");if(this.profileSession){this.pendingProfileRuns.push(this._runSteps(n,{wait:!1,mergePass:!1}));return}let t=this.host.device.createCommandEncoder({label:"compute-dispatch"});zi(t,n),this.host.device.queue.submit([t.finish()])}async flushDeferredProfile(){let n=this.pendingProfileRuns;this.pendingProfileRuns=[],await Promise.all(n)}async measurePreparedSequenceGpuMs(n){if(!this.host.device.features.has("timestamp-query"))return null;let t=this.createTimestampResources(2);try{let r=this.host.device.createCommandEncoder({label:"gpu-time-measure"});for(let l of n)l.kind==="copy"&&l.byteLength>0&&r.copyBufferToBuffer(l.src,l.srcOffset,l.dst,l.dstOffset,l.byteLength);let s=r.beginComputePass({label:"gpu-time-pass",timestampWrites:{querySet:t.querySet,beginningOfPassWriteIndex:0,endOfPassWriteIndex:1}}),a=!1,i=null,o=null;for(let l of n)if(!(l.kind==="copy"||Kt(l.dispatchWorkgroups))){if(l.pipeline!==i&&(s.setPipeline(l.pipeline),i=l.pipeline),l.bindGroup!==o&&(s.setBindGroup(0,l.bindGroup),o=l.bindGroup),l.extraBindGroups)for(let d of l.extraBindGroups)s.setBindGroup(d.group,d.bindGroup),d.group===0&&(o=d.bindGroup);s.dispatchWorkgroups(l.dispatchWorkgroups[0],l.dispatchWorkgroups[1],l.dispatchWorkgroups[2]),a=!0}if(s.end(),!a)return null;r.resolveQuerySet(t.querySet,0,2,t.resolveBuffer,0),r.copyBufferToBuffer(t.resolveBuffer,0,t.readbackBuffer,0,16),await this.host.submit([r.finish()],{wait:!0});let u=await this.readTimestampBuffer(t.readbackBuffer,2);return Number(u[1]-u[0])/1e6}finally{t.querySet.destroy(),t.resolveBuffer.destroy(),t.readbackBuffer.destroy()}}createUniformU32(n,t){let r=new Uint32Array(n),s=this.host.createBuffer({label:t,size:r.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});return this.host.writeBuffer(s,0,r),s}async _runSteps(n,{wait:t=!1,mergePass:r}){let s=!!this.profileSession,a=this.host.device.createCommandEncoder({label:s?"profiled-compute-dispatch":"compute-dispatch"});if(!s&&r){zi(a,n),await this.host.submit([a.finish()],{wait:t});return}let i=n.map((d,c)=>d.kind==="copy"||Kt(d.dispatchWorkgroups)?-1:c).filter(d=>d>=0),o=s?i.length*2:0,u=s&&o>0?this.createTimestampResources(o):void 0,l=0;for(let d of n){if(d.kind==="copy"){d.byteLength>0&&a.copyBufferToBuffer(d.src,d.srcOffset,d.dst,d.dstOffset,d.byteLength);continue}if(Kt(d.dispatchWorkgroups))continue;let c=a.beginComputePass({label:s?`${d.name??"compute"}-profile-pass`:"compute-pass",...s?{timestampWrites:{querySet:u.querySet,beginningOfPassWriteIndex:l*2,endOfPassWriteIndex:l*2+1}}:{}});if(c.setPipeline(d.pipeline),c.setBindGroup(0,d.bindGroup),d.extraBindGroups)for(let p of d.extraBindGroups)c.setBindGroup(p.group,p.bindGroup);c.dispatchWorkgroups(d.dispatchWorkgroups[0],d.dispatchWorkgroups[1],d.dispatchWorkgroups[2]),c.end(),l+=1}if(!s||u===void 0){await this.host.submit([a.finish()],{wait:t});return}try{a.resolveQuerySet(u.querySet,0,o,u.resolveBuffer,0),a.copyBufferToBuffer(u.resolveBuffer,0,u.readbackBuffer,0,o*8),await this.host.submit([a.finish()],{wait:t});let d=await this.readTimestampBuffer(u.readbackBuffer,o);for(let c=0;c<i.length;++c){let p=n[i[c]];!p||p.kind==="copy"||this.profileSession?.record(p,d[c*2],d[c*2+1])}}finally{u.querySet.destroy(),u.resolveBuffer.destroy(),u.readbackBuffer.destroy()}}createTimestampResources(n){let t=n*8,r=this.host.device.createQuerySet({type:"timestamp",count:n}),s=this.host.createBuffer({label:"timestamp-resolve",size:t,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),a=this.host.createBuffer({label:"timestamp-readback",size:t,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});return{querySet:r,resolveBuffer:s,readbackBuffer:a}}async readTimestampBuffer(n,t){let r=await this.host.mapRead(n,0,t*8),s=new BigUint64Array(r);return Array.from(s,a=>a)}};function uf(e,n){let t=Ie[e]?.arrayCtor;return t!==void 0&&n instanceof t}function Pi(e){return Ie[e]!==void 0}function ps(e){return Math.max(4,Math.ceil(e/4)*4)}function lf(e){return e.kind==="copy"}function df(e){if(!e.src||!e.dst)throw new Error("copy step requires src and dst (buffer or tensor)");let n=yn(e.src),t=yn(e.dst),r=e.srcOffset??0,s=e.dstOffset??0,a=e.byteLength;if(!Number.isInteger(a)||a<=0)throw new Error("copy step requires positive integer byteLength");return{kind:"copy",src:n,dst:t,srcOffset:r,dstOffset:s,byteLength:a,name:e.name??"copy"}}function zi(e,n){let t=null,r=null,s=null,a=()=>{t!==null&&(t.end(),t=null),r=null,s=null};for(let i of n){if(i.kind==="copy"){a(),i.byteLength>0&&e.copyBufferToBuffer(i.src,i.srcOffset,i.dst,i.dstOffset,i.byteLength);continue}if(!Kt(i.dispatchWorkgroups)){if(t===null&&(t=e.beginComputePass({label:"compute-sequence-pass"})),i.pipeline!==r&&(t.setPipeline(i.pipeline),r=i.pipeline),i.bindGroup!==s&&(t.setBindGroup(0,i.bindGroup),s=i.bindGroup),i.extraBindGroups)for(let o of i.extraBindGroups)t.setBindGroup(o.group,o.bindGroup),o.group===0&&(s=o.bindGroup);t.dispatchWorkgroups(i.dispatchWorkgroups[0],i.dispatchWorkgroups[1],i.dispatchWorkgroups[2])}}a()}function Kt(e){return e[0]===0||e[1]===0||e[2]===0}async function Ai(e={}){let n=e.host??await cs(e);return new Vt({host:n})}function fs(e){return e instanceof Error?e.message:String(e)}function ms(e){return e.byteOffset===0&&e.byteLength===e.buffer.byteLength&&e.buffer instanceof ArrayBuffer?e.buffer:e.slice().buffer}function ve(e){let n=e&32768?-1:1,t=e>>>10&31,r=e&1023;return t===31?r===0?n*(1/0):NaN:t===0?n*2**-14*(r/1024):n*2**(t-15)*(1+r/1024)}function an(e){let n=new Uint16Array(e.length);for(let t=0;t<e.length;++t)n[t]=hs(e[t]);return n}var Gi=new Float32Array(1),cf=new Uint32Array(Gi.buffer);function hs(e){if(Number.isNaN(e))return 32256;Gi[0]=e;let n=cf[0],t=n>>>16&32768,r=n>>>23&255,s=n&8388607;if(r===255)return s!==0?t|32256:t|31744;let a=r-127+15;if(a>=31)return t|31743;if(a<=0){if(a<-10)return t;let d=s|8388608,c=14-a,p=1<<c-1,f=d&(1<<c)-1,h=d>>>c;return(f>p||f===p&&(h&1)===1)&&(h+=1),t|h}let i=4096,o=s&8191,u=s>>>13,l=a;return(o>i||o===i&&(u&1)===1)&&(u+=1,u===1024&&(u=0,l+=1)),l>=31?t|31743:t|l<<10|u}var pf=new Set(["F32","BF16","F16"]),ff=new Set(["float32","float16"]);function mf(e){return typeof e=="string"&&pf.has(e)}function hf(e){return typeof e=="string"&&ff.has(e)}function $t(e){if(!mf(e))throw new Error(`Unsupported source dtype: ${e}`)}function gf(e){if(!hf(e))throw new Error(`Unsupported target dtype: ${e}`)}function _s(e,n){if(e==="F32")return _f(n);if(e==="BF16")return Ni(n);if(e==="F16")return Hi(n);throw new Error(`Unsupported source dtype for float32 copy: ${e}`)}function Ii(e,n){$t(e),gf(n)}function Ri(e){if(e==="F32")return 4;if(e==="BF16"||e==="F16")return 2;throw new Error(`Unsupported source dtype: ${e}`)}function Wi(e){if(e==="float32")return 4;if(e==="float16")return 2;throw new Error(`Unsupported target dtype: ${e}`)}function Mi(e){return new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}function _f(e){let n=e.byteLength/4;return e.byteOffset%4===0?new Float32Array(e.buffer,e.byteOffset,n):yf(e,Float32Array,4)}function Bi(e,n){if(e==="BF16"&&n==="float32")return Ni;if(e==="BF16"&&n==="float16")return bf;if(e==="F16"&&n==="float32")return Hi;if(e==="F32"&&n==="float16")return vf;throw new Error(`No converter for ${e} -> ${n}`)}function yf(e,n,t){let r=new n(e.byteLength/t);return new Uint8Array(r.buffer).set(e),r}function Ni(e){let n=e.byteLength/2,t=new Float32Array(n),r=new Uint32Array(t.buffer);if(e.byteOffset%2===0){let s=new Uint16Array(e.buffer,e.byteOffset,n);for(let a=0;a<n;++a)r[a]=s[a]<<16}else for(let s=0;s<n;++s){let a=e[s*2],i=e[s*2+1];r[s]=(i<<8|a)<<16}return t}function bf(e){let n=e.byteLength/2,t=new Uint16Array(n);return wf(e,t),t}function wf(e,n,t=0,r=1){let s=e.byteLength/2,a=Tf();if(e.byteOffset%2===0){let i=new Uint16Array(e.buffer,e.byteOffset,s);for(let o=0,u=t;o<s;++o,u+=r)n[u]=a[i[o]]}else for(let i=0,o=t;i<s;++i,o+=r){let u=e[i*2],l=e[i*2+1];n[o]=a[l<<8|u]}return n}function vf(e){let n=e.byteLength/4;if(e.byteOffset%4===0)return an(new Float32Array(e.buffer,e.byteOffset,n));let t=new Float32Array(n);return new Uint8Array(t.buffer).set(e),an(t)}function Hi(e){let n=e.byteLength/2,t=new Float32Array(n),r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let s=0;s<n;++s)t[s]=ve(r.getUint16(s*2,!0));return t}var Ui=new Uint32Array(1),kf=new Float32Array(Ui.buffer);function Sf(e){return Ui[0]=e<<16>>>0,hs(kf[0])}var gs=null;function Tf(){if(gs)return gs;let e=new Uint16Array(65536);for(let n=0;n<65536;++n)e[n]=Sf(n);return gs=e,e}var xf=1179993927,Df=32,Ef=new TextDecoder("utf-8",{fatal:!0}),ke=Object.freeze({UINT8:0,INT8:1,UINT16:2,INT16:3,UINT32:4,INT32:5,FLOAT32:6,BOOL:7,STRING:8,ARRAY:9,UINT64:10,INT64:11,FLOAT64:12}),K=Object.freeze({F32:0,F16:1,Q4_0:2,Q4_1:3,Q5_0:6,Q5_1:7,Q8_0:8,Q8_1:9,Q2_K:10,Q3_K:11,Q4_K:12,Q5_K:13,Q6_K:14,Q8_K:15,IQ2_XXS:16,IQ2_XS:17,IQ3_XXS:18,IQ1_S:19,IQ4_NL:20,IQ3_S:21,IQ2_S:22,IQ4_XS:23,I8:24,I16:25,I32:26,I64:27,F64:28,IQ1_M:29,BF16:30,TQ1_0:34,TQ2_0:35,MXFP4:39,NVFP4:40,Q1_0:41}),ws=Object.freeze(Object.fromEntries(Object.entries(K).map(([e,n])=>[n,e]))),ys=128,qf=18,Ze=32,on=18,Cn=32,jt=34,Fi=256,Qt=210,Ki=256,Qe=144,Vi=256,Zt=176,X=class extends Error{constructor(n){super(n),this.name="GGUFError"}},Ce=class{#n;#e;version;tensorCount;metadataCount;metadata;alignment;dataStart;constructor(n,t={}){this.#n=Cf(n);let r=new bs(this.#n);if(r.u32()!==xf)throw new X("Invalid GGUF magic");this.version=r.u32(),this.tensorCount=wn(r.u64(),"tensor count"),this.metadataCount=wn(r.u64(),"metadata count"),this.metadata={};for(let o=0;o<this.metadataCount;++o){let u=r.string();this.metadata[u]=r.metadataValue()}let a=new Map;for(let o=0;o<this.tensorCount;++o){let u=r.string(),l=Array.from({length:r.u32()},()=>wn(r.u64(),`${u} dimension`)),d=r.u32(),c=wn(r.u64(),`${u} offset`),p=l.reduce((f,h)=>f*h,1);a.set(u,{name:u,dims:l,shape:[...l].reverse(),type:d,typeName:ws[d]??`UNKNOWN_${d}`,offset:c,elementCount:p,byteLength:Lf(d,p),dataOffsets:[0,0]})}let i=this.metadata["general.alignment"]??Df;if(typeof i!="number"||!Number.isInteger(i)||i<=0)throw new X(`Invalid general.alignment: ${i}`);if(this.alignment=i,this.dataStart=zf(r.offset,i),!t.headerOnly){if(this.dataStart>this.#n.byteLength)throw new X("GGUF header exceeds file size");for(let o of a.values()){let u=this.dataStart+o.offset,l=u+o.byteLength;if(l>this.#n.byteLength)throw new X(`Tensor ${o.name} exceeds file size`);o.dataOffsets=[u,l]}}this.#e=a}names(){return[...this.#e.keys()]}has(n){return this.#e.has(n)}info(n){return Of(this.#t(n))}tensorBytes(n){let t=this.#t(n),[r,s]=t.dataOffsets;return this.#n.subarray(r,s)}async streamTensors(n,t){for(let r of n)await t(r,this.tensorBytes(r))}#t(n){let t=this.#e.get(n);if(!t)throw new X(`Unknown tensor: ${n}`);return t}};function Lf(e,n){if(!Number.isInteger(n)||n<0)throw new X(`Invalid tensor element count: ${n}`);if(e===K.F32)return n*4;if(e===K.F16||e===K.BF16)return n*2;if(e===K.Q1_0){if(n%ys!==0)throw new X(`Q1_0 tensor element count must be divisible by ${ys}`);return n/ys*qf}if(e===K.Q4_0)return Yn(e,n,32,18);if(e===K.Q8_0)return Yn(e,n,32,34);if(e===K.Q4_K)return Yn(e,n,256,144);if(e===K.Q5_K)return Yn(e,n,256,176);if(e===K.Q6_K)return Yn(e,n,256,210);throw new X(`Unsupported GGML tensor type ${ws[e]??e}`)}function Yn(e,n,t,r){if(n%t!==0)throw new X(`${ws[e]??e} tensor element count ${n} must be divisible by ${t}`);return n/t*r}function $i(e){if(e.byteLength%on!==0)throw new X(`Q4_0 byte length ${e.byteLength} is not a multiple of ${on}`);let n=e.byteLength/on,t=new Float32Array(n*Ze),r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let s=0;s<n;++s){let a=s*on,i=ve(r.getUint16(a,!0)),o=s*Ze;for(let u=0;u<16;++u){let l=e[a+2+u];t[o+u]=((l&15)-8)*i,t[o+u+16]=((l>>4)-8)*i}}return t}function ji(e){if(e.byteLength%on!==0)throw new X(`Q4_0 byte length ${e.byteLength} is not a multiple of ${on}`);let n=e.byteLength/on,t=new Uint32Array(n*4),r=new Float32Array(n),s=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let a=0;a<n;++a){let i=a*on;r[a]=ve(s.getUint16(i,!0));for(let o=0;o<4;++o)t[a*4+o]=s.getUint32(i+2+o*4,!0)}return{bits:t,scales:r,blockCount:n}}function Qi(e){if(e.byteLength%jt!==0)throw new X(`Q8_0 byte length ${e.byteLength} is not a multiple of ${jt}`);let n=e.byteLength/jt,t=new Float32Array(n*Cn),r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let s=0;s<n;++s){let a=s*jt,i=ve(r.getUint16(a,!0)),o=s*Cn;for(let u=0;u<32;++u)t[o+u]=r.getInt8(a+2+u)*i}return t}function Zi(e){if(e.byteLength%Qt!==0)throw new X(`Q6_K byte length ${e.byteLength} is not a multiple of ${Qt}`);let n=e.byteLength/Qt,t=new Float32Array(n*Fi),r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let s=0;s<n;++s){let a=s*Qt,i=ve(r.getUint16(a+208,!0)),o=s*Fi;for(let u=0;u<2;++u){let l=a+u*64,d=a+128+u*32,c=a+192+u*8,p=o+u*128;for(let f=0;f<32;++f){let h=f>>4,m=e[d+f],g=(e[l+f]&15|(m>>0&3)<<4)-32,w=(e[l+f+32]&15|(m>>2&3)<<4)-32,T=(e[l+f]>>4|(m>>4&3)<<4)-32,x=(e[l+f+32]>>4|(m>>6&3)<<4)-32;t[p+f]=i*r.getInt8(c+h+0)*g,t[p+f+32]=i*r.getInt8(c+h+2)*w,t[p+f+64]=i*r.getInt8(c+h+4)*T,t[p+f+96]=i*r.getInt8(c+h+6)*x}}}return t}function Pn(e,n,t){if(e<4)return[n[t+e]&63,n[t+e+4]&63];let r=n[t+e+4]&15|n[t+e-4]>>6<<4,s=n[t+e+4]>>4|n[t+e-0]>>6<<4;return[r,s]}function Yi(e){if(e.byteLength%Qe!==0)throw new X(`Q4_K byte length ${e.byteLength} is not a multiple of ${Qe}`);let n=e.byteLength/Qe,t=new Float32Array(n*Ki),r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let s=0;s<n;++s){let a=s*Qe,i=ve(r.getUint16(a,!0)),o=ve(r.getUint16(a+2,!0)),u=a+4,l=a+16,d=s*Ki,c=0;for(let p=0;p<256;p+=64){let[f,h]=Pn(c+0,e,u),m=i*f,g=o*h,[w,T]=Pn(c+1,e,u),x=i*w,q=o*T;for(let k=0;k<32;++k)t[d++]=m*(e[l+k]&15)-g;for(let k=0;k<32;++k)t[d++]=x*(e[l+k]>>4)-q;l+=32,c+=2}}return t}function Xi(e){if(e.byteLength%Zt!==0)throw new X(`Q5_K byte length ${e.byteLength} is not a multiple of ${Zt}`);let n=e.byteLength/Zt,t=new Float32Array(n*Vi),r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let s=0;s<n;++s){let a=s*Zt,i=ve(r.getUint16(a,!0)),o=ve(r.getUint16(a+2,!0)),u=a+4,l=a+16,d=a+48,c=s*Vi,p=0,f=1,h=2;for(let m=0;m<256;m+=64){let[g,w]=Pn(p+0,e,u),T=i*g,x=o*w,[q,k]=Pn(p+1,e,u),B=i*q,V=o*k;for(let S=0;S<32;++S){let H=e[l+S]&f?16:0;t[c++]=T*((e[d+S]&15)+H)-x}for(let S=0;S<32;++S){let H=e[l+S]&h?16:0;t[c++]=B*((e[d+S]>>4)+H)-V}d+=32,p+=2,f<<=2,h<<=2}}return t}function Of(e){return{name:e.name,dims:[...e.dims],shape:[...e.shape],type:e.type,typeName:e.typeName,offset:e.offset,elementCount:e.elementCount,byteLength:e.byteLength,dataOffsets:[...e.dataOffsets]}}var bs=class{bytes;view;offset;constructor(n){this.bytes=n,this.view=new DataView(n.buffer,n.byteOffset,n.byteLength),this.offset=0}u8(){this.#e(1);let n=this.view.getUint8(this.offset);return this.offset+=1,n}i8(){this.#e(1);let n=this.view.getInt8(this.offset);return this.offset+=1,n}u16(){this.#e(2);let n=this.view.getUint16(this.offset,!0);return this.offset+=2,n}i16(){this.#e(2);let n=this.view.getInt16(this.offset,!0);return this.offset+=2,n}u32(){this.#e(4);let n=this.view.getUint32(this.offset,!0);return this.offset+=4,n}i32(){this.#e(4);let n=this.view.getInt32(this.offset,!0);return this.offset+=4,n}u64(){this.#e(8);let n=this.view.getBigUint64(this.offset,!0);return this.offset+=8,n}i64(){this.#e(8);let n=this.view.getBigInt64(this.offset,!0);return this.offset+=8,n}f32(){this.#e(4);let n=this.view.getFloat32(this.offset,!0);return this.offset+=4,n}f64(){this.#e(8);let n=this.view.getFloat64(this.offset,!0);return this.offset+=8,n}string(){let n=wn(this.u64(),"string length");this.#e(n);let t=this.bytes.subarray(this.offset,this.offset+n);return this.offset+=n,Ef.decode(t)}metadataValue(){let n=this.u32();return this.#n(n)}#n(n){switch(n){case ke.UINT8:return this.u8();case ke.INT8:return this.i8();case ke.UINT16:return this.u16();case ke.INT16:return this.i16();case ke.UINT32:return this.u32();case ke.INT32:return this.i32();case ke.FLOAT32:return this.f32();case ke.BOOL:return!!this.u8();case ke.STRING:return this.string();case ke.UINT64:return wn(this.u64(),"metadata uint64");case ke.INT64:return Pf(this.i64(),"metadata int64");case ke.FLOAT64:return this.f64();case ke.ARRAY:{let t=this.u32();if(t===ke.ARRAY)throw new X("Nested metadata arrays are not supported");let r=wn(this.u64(),"metadata array length");return Array.from({length:r},()=>this.#n(t))}default:throw new X(`Unsupported GGUF metadata type ${n}`)}}#e(n){if(this.offset+n>this.bytes.byteLength)throw new X("Unexpected end of GGUF file")}};function Cf(e){if(e instanceof Uint8Array)return e;if(ArrayBuffer.isView(e))return new Uint8Array(e.buffer,e.byteOffset,e.byteLength);if(e instanceof ArrayBuffer)return new Uint8Array(e);throw new X("GGUF input must be an ArrayBuffer or Uint8Array")}function wn(e,n){if(e>BigInt(Number.MAX_SAFE_INTEGER))throw new X(`${n} ${e} exceeds JavaScript safe integer range`);return Number(e)}function Pf(e,n){if(e>BigInt(Number.MAX_SAFE_INTEGER)||e<BigInt(Number.MIN_SAFE_INTEGER))throw new X(`${n} ${e} exceeds JavaScript safe integer range`);return Number(e)}function zf(e,n){return Math.ceil(e/n)*n}async function ks(e,n,{requireRangeRequests:t=!1,knownSize:r=void 0,knownAcceptsRanges:s=void 0}={}){let a=n.fetch??globalThis.fetch;if(typeof a!="function")throw new Error("No fetch implementation available; pass options.fetch");let i=r,o=s;if(i===void 0){let u=await a(e,{method:"HEAD",signal:n.signal});if(!u.ok)throw new Error(`HEAD ${e} failed: ${u.status} ${u.statusText}`);let l=u.headers.get("content-length");if(o=(u.headers.get("accept-ranges")??"").toLowerCase().includes("bytes"),i=l===null?null:Number(l),l!==null&&!Number.isFinite(i))throw new Error(`Invalid content-length header: ${l}`)}else o=o!==!1;if(t&&!o)throw new Error(`Range requests are required for ${e}, but the server did not advertise Accept-Ranges: bytes`);return{url:e,size:i??null,acceptsRanges:o,async readRange(u,l,d={}){if(u===l)return new Uint8Array(0);let c=d.signal??n.signal,p=d.onByteProgress??null;if(o){let m=await a(e,{headers:{Range:`bytes=${u}-${l-1}`},signal:c});if(m.status!==206&&m.status!==200)throw new Error(`Range ${u}-${l-1} of ${e} failed: ${m.status}`);if(m.status===200&&t)throw new Error(`Range ${u}-${l-1} of ${e} returned 200 instead of 206; refusing full-response fallback`);let g=await Xn(m,{expectedLength:m.status===206?l-u:null,onByteProgress:p});if(m.status===200)return g.subarray(u,l);if(g.byteLength!==l-u)throw new Error(`Range ${u}-${l-1} returned ${g.byteLength} bytes`);return g}let f=await a(e,{signal:c});if(!f.ok)throw new Error(`GET ${e} failed: ${f.status}`);return(await Xn(f,{onByteProgress:p})).subarray(u,l)},async readAll(u={}){let l=u.signal??n.signal,d=u.onProgress??n.onProgress,c=await a(e,{signal:l});if(!c.ok)throw new Error(`GET ${e} failed: ${c.status}`);return Xn(c,{expectedLength:Number.isFinite(i)?i:null,onProgress:d,progressTotal:Number.isFinite(i)?i:null,fromCache:!1})},async readTensor(){return null},async writeTensor(){},async close(){}}}async function Xn(e,{expectedLength:n=null,onByteProgress:t=null,onProgress:r=null,progressTotal:s=null,fromCache:a=!1,yieldEveryBytes:i=null}={}){if(!e.body?.getReader){let p=await e.arrayBuffer(),f=new Uint8Array(p);return vs({onByteProgress:t,onProgress:r,loaded:f.byteLength,delta:f.byteLength,total:s??n,fromCache:a}),f}let o=e.body.getReader(),u=s??n??null,l=0;if(typeof n=="number"&&Number.isFinite(n)&&n>0){let p=new Uint8Array(n),f=[],h=0;for(;;){let{done:m,value:g}=await o.read();if(m)break;g&&(l+g.byteLength<=p.byteLength&&f.length===0?p.set(g,l):(f.length===0&&f.push(p.subarray(0,l)),f.push(g)),l+=g.byteLength,vs({onByteProgress:t,onProgress:r,loaded:l,delta:g.byteLength,total:u,fromCache:a}),i&&(h+=g.byteLength)>=i&&(h=0,await Ji()))}return f.length===0?l===n?p:p.subarray(0,l):eo(f,l)}let d=[],c=0;for(;;){let{done:p,value:f}=await o.read();if(p)break;f&&(d.push(f),l+=f.byteLength,vs({onByteProgress:t,onProgress:r,loaded:l,delta:f.byteLength,total:u,fromCache:a}),i&&(c+=f.byteLength)>=i&&(c=0,await Ji()))}return eo(d,l)}function Ji(){return new Promise(e=>setTimeout(e,0))}function vs({onByteProgress:e,onProgress:n,loaded:t,delta:r,total:s,fromCache:a}){e?.(r),n?.({loaded:t,total:s??null,fromCache:a})}function eo(e,n){if(e.length===0)return new Uint8Array(0);if(e.length===1&&e[0].byteLength===n)return e[0];let t=new Uint8Array(n),r=0;for(let s of e)t.set(s,r),r+=s.byteLength;return t}async function rt(e,n={},t={}){if(n.source)return n.source;if(typeof e=="string"&&/^https?:/i.test(e))return ks(e,n,t);if(typeof e=="string"&&e.startsWith("file:"))return Ss(new URL(e),n);if(e instanceof URL){if(e.protocol==="http:"||e.protocol==="https:")return ks(e.toString(),n,t);if(e.protocol==="file:")return Ss(e,n);throw new Error(`Unsupported URL protocol: ${e.protocol}`)}if(typeof e=="string")return Ss(e,n);throw new Error("url must be a string or URL")}async function Ss(e,n={}){let{open:t,stat:r}=await Promise.resolve().then(()=>(nt(),et)),s=e instanceof URL?(await Promise.resolve().then(()=>(to(),no))).fileURLToPath(e):e,a=await r(s),i=await t(s,"r");return{url:e.toString(),size:a.size,acceptsRanges:!0,async readRange(o,u){if(o===u)return new Uint8Array(0);let l=u-o,d=new Uint8Array(l),{bytesRead:c}=await i.read(d,0,l,o);if(c!==l)throw new Error(`Short read at ${o}: expected ${l} bytes, got ${c}`);return d},async readAll(o={}){let u=o.onProgress??n.onProgress,l=new Uint8Array(a.size),d=0,c=1<<22;for(;d<a.size;){let p=Math.min(c,a.size-d),{bytesRead:f}=await i.read(l,d,p,d);if(f===0)break;d+=f,u?.({loaded:d,total:a.size,fromCache:!1})}if(d!==a.size)throw new Error(`Short read on ${s}: read ${d}/${a.size} bytes`);return l},async readTensor(){return null},async writeTensor(){},async close(){await i.close()}}}var so="gguf-v1";async function ao(e,n={}){return new Ce(await Vf(e,n))}async function Ts(e,n={}){let t=uo(e),r=await jf(t,n);if(r)return r;let s=await Zf(t,n);if(s)return s;let a=await rt(e,{fetch:n.fetch,signal:n.signal});try{let{gguf:i,bytes:o}=await oo(a,n.signal);return await Yf(t,o,n),i}finally{await a.close()}}async function io(e,n){return(await oo(e,n)).gguf}async function oo(e,n){if(!e.acceptsRanges||!e.readRange){if(!e.readAll)throw new Error(`GGUF source ${e.url} supports neither ranges nor readAll()`);let s=await e.readAll({signal:n});return{gguf:new Ce(s,{headerOnly:!0}),bytes:s}}let t=64*1024*1024,r=e.size;for(let s=4*1024*1024;;s*=2){let a=r!=null&&s>=r,i=r!=null?Math.min(s,r):s,o=await e.readRange(0,i,{signal:n});try{return{gguf:new Ce(o,{headerOnly:!0}),bytes:o}}catch(u){if(a||o.byteLength<i||s>=t)throw u}}}async function Vf(e,n={}){let t=await $f(uo(e),n);if(t)return t;let r=await rt(e,{fetch:n.fetch,signal:n.signal});try{if(!r.readAll)throw new Error(`GGUF source ${r.url} does not support readAll()`);let s=await r.readAll({onProgress:n.onProgress,signal:n.signal});return await Xf(r.url,s,n),s}finally{await r.close()}}async function $f(e,n){if(n.force||n.cache===!1)return null;let t=await xs(n);if(!t)return null;let r=await t.match(e);if(!r)return null;let s=Number(r.headers.get("content-length")),a=Number.isFinite(s)&&s>0?s:null;return Xn(r,{expectedLength:a,progressTotal:a,onProgress:n.onProgress,fromCache:!0,yieldEveryBytes:8*1024*1024})}function uo(e){return e instanceof URL?e.toString():String(e)}async function jf(e,n){if(n.force||n.cache===!1)return null;let t=await xs(n);if(!t)return null;let r=await t.match(e);if(!r)return null;let s=r.body?.getReader?.();if(!s)return new Ce(new Uint8Array(await r.arrayBuffer()),{headerOnly:!0});let a=64*1024*1024,i=[],o=0,u=4*1024*1024;try{for(;o<a;){let{done:l,value:d}=await s.read();if(l)break;if(d&&(i.push(d),o+=d.byteLength,o>=u))try{return new Ce(ro(i,o),{headerOnly:!0})}catch{u=o*2}}return new Ce(ro(i,o),{headerOnly:!0})}finally{await s.cancel().catch(()=>{})}}function ro(e,n){if(e.length===1)return e[0];let t=new Uint8Array(n),r=0;for(let s of e)t.set(s,r),r+=s.byteLength;return t}var Qf="-headers";async function lo(e){let n=e.cacheStorage??globalThis.caches;return n?.open?n.open((e.cacheName??so)+Qf):null}async function Zf(e,n){if(n.force||n.cache===!1)return null;let t=await lo(n);if(!t)return null;let r=await t.match(e);if(!r)return null;try{return new Ce(new Uint8Array(await r.arrayBuffer()),{headerOnly:!0})}catch{return null}}async function Yf(e,n,t){if(t.cache===!1||n.byteLength>32*1024*1024)return;let r=await lo(t);if(!r)return;let s=new Response(ms(n),{headers:{"content-type":"application/octet-stream","content-length":String(n.byteLength)}});try{await r.put(e,s)}catch(a){typeof console<"u"&&console.warn(`gguf header cache write failed: ${fs(a)}`)}}async function Xf(e,n,t){if(t.cache===!1)return;let r=await xs(t);if(!r)return;let s=new Response(ms(n),{headers:{"content-type":"application/octet-stream","content-length":String(n.byteLength)}});try{await r.put(e,s)}catch(a){typeof console<"u"&&console.warn(`gguf cache write failed: ${fs(a)}`)}}async function xs(e){let n=e.cacheStorage??globalThis.caches;return n?.open?n.open(e.cacheName??so):null}var Jf="https://huggingface.co";function em(e){return typeof e=="string"&&/^https?:/i.test(e)}function nm(e){return em(e)||e.startsWith("/")||e.startsWith(".")}function co(e,n={}){let{revision:t="main",file:r}=n,s=r?r.slice(r.lastIndexOf(".")).toLowerCase():"";if(s&&e.toLowerCase().endsWith(s))return e;if(nm(e))return r?`${tm(e)}/${r}`:e;let a=`${Jf}/${e}/resolve/${t}`;return r?`${a}/${r}`:a}function tm(e){return e.endsWith("/")?e.slice(0,-1):e}function Ds(e){return(n,t={})=>{let r=new Headers(t.headers);return r.set("Authorization",`Bearer ${e}`),globalThis.fetch(n,{...t,headers:r})}}function po(e,n){let t=Math.min(e.length,n.length),r=0;for(;r<t&&e[r]===n[r];)r+=1;return r}function un(e){return typeof e=="number"&&Number.isFinite(e)}var rm="(?i:'s|'t|'re|'ve|'m|'ll|'d)|[^\\r\\n\\p{L}\\p{N}]?\\p{L}+|\\p{N}| ?[^\\s\\p{L}\\p{N}]+[\\r\\n]*|\\s*[\\r\\n]+|\\s+(?!\\S)|\\s+",sm=`{% for message in messages %}<|im_start|>{{ message['role'] }}
{{ message['content'] }}<|im_end|>
{% endfor %}{% if add_generation_prompt %}<|im_start|>assistant
{% endif %}`;function fo(e){let n=go(e,"tokenizer.ggml.tokens"),t=e["tokenizer.ggml.merges"]??[],r={};return n.forEach((s,a)=>{r[s]=a}),{version:"1.0",truncation:null,padding:null,added_tokens:ho(e,n),normalizer:{type:"NFC"},pre_tokenizer:am(e),post_processor:om(),decoder:im(),model:{type:"BPE",dropout:null,unk_token:st(n,e["tokenizer.ggml.unknown_token_id"])??null,continuing_subword_prefix:null,end_of_word_suffix:null,fuse_unk:!1,byte_fallback:!!e["tokenizer.ggml.byte_fallback"],ignore_merges:!1,vocab:r,merges:lm(t)}}}function mo(e){let n=go(e,"tokenizer.ggml.tokens"),t=e["tokenizer.ggml.bos_token_id"],r=e["tokenizer.ggml.eos_token_id"],s=e["tokenizer.ggml.unknown_token_id"],a=e["tokenizer.ggml.padding_token_id"],i=Object.fromEntries(ho(e,n).map(o=>[o.id,{content:o.content,single_word:o.single_word,lstrip:o.lstrip,rstrip:o.rstrip,normalized:o.normalized,special:o.special}]));return{tokenizer_class:"Qwen2Tokenizer",model_max_length:e["qwen3.context_length"]??e["general.context_length"]??32768,bos_token:st(n,t),eos_token:st(n,r),unk_token:st(n,s),pad_token:st(n,a),bos_token_id:Number.isInteger(t)?t:void 0,eos_token_id:Number.isInteger(r)?r:void 0,unk_token_id:Number.isInteger(s)?s:void 0,pad_token_id:Number.isInteger(a)?a:void 0,chat_template:Es(e,n),added_tokens_decoder:i}}function Es(e,n=dm(e)){let t=e["tokenizer.chat_template"];if(typeof t=="string")return t;let r=e["tokenizer.ggml.chat_template"];return typeof r=="string"?r:n.includes("<|im_start|>")&&n.includes("<|im_end|>")?sm:null}function am(e){let n=e["tokenizer.ggml.pre"];return n==="qwen2"||n==="qwen3"||e["general.architecture"]==="qwen3"?{type:"Sequence",pretokenizers:[{type:"Split",pattern:{Regex:rm},behavior:"Isolated",invert:!1},{type:"ByteLevel",add_prefix_space:!1,trim_offsets:!1,use_regex:!1}]}:{type:"ByteLevel",add_prefix_space:!1,trim_offsets:!0,use_regex:!0}}function im(){return{type:"ByteLevel",add_prefix_space:!1,trim_offsets:!1,use_regex:!1}}function om(){return{type:"ByteLevel",add_prefix_space:!1,trim_offsets:!1,use_regex:!1}}function ho(e,n){let t=Array.isArray(e["tokenizer.ggml.token_type"])?e["tokenizer.ggml.token_type"]:[],r=new Set;for(let s of[e["tokenizer.ggml.bos_token_id"],e["tokenizer.ggml.eos_token_id"],e["tokenizer.ggml.unknown_token_id"],e["tokenizer.ggml.padding_token_id"]])Number.isInteger(s)&&r.add(s);for(let s=0;s<t.length;++s)um(t[s])&&r.add(s);return[...r].filter(s=>s>=0&&s<n.length).sort((s,a)=>s-a).map(s=>({id:s,content:n[s],single_word:!1,lstrip:!1,rstrip:!1,normalized:!1,special:!0}))}function um(e){return Number.isInteger(e)&&e!==1&&e!==6}function lm(e){return Array.isArray(e)?e.map(n=>Array.isArray(n)?n.join(" "):String(n)):[]}function st(e,n){return typeof n=="number"&&Number.isInteger(n)&&n>=0&&n<e.length?e[n]:void 0}function go(e,n){let t=e[n];if(!Array.isArray(t)||t.some(r=>typeof r!="string"))throw new Error(`GGUF metadata ${n} must be a string array`);return t}function dm(e){let n=e["tokenizer.ggml.tokens"];return Array.isArray(n)&&n.every(t=>typeof t=="string")?n:[]}function Se(e,n,t="Config"){let r=e[n];if(typeof r!="number"||!Number.isInteger(r)||r<=0)throw new Error(`${t}.${n} must be a positive integer`);return r}function _o(e,n,t="Config"){for(let r of n){let s=e[r];if(typeof s!="number"||!Number.isInteger(s)||s<=0)throw new Error(`${t}.${r} must be a positive integer`)}}function cm(e){if(e.rope_theta===void 0&&e.rope_scaling==null)return;let n=e.rope_scaling;return{rope_type:n?.rope_type??n?.type??"default",rope_theta:e.rope_theta}}var ln=class{vocab_size;hidden_size;intermediate_size;num_hidden_layers;num_attention_heads;num_key_value_heads;hidden_act;max_position_embeddings;initializer_range;rms_norm_eps;use_cache;pad_token_id;bos_token_id;eos_token_id;pretraining_tp;tie_word_embeddings;rope_parameters;attention_bias;attention_dropout;mlp_bias;head_dim;model_type;constructor(n={}){this.vocab_size=Se(n,"vocab_size","LlamaConfig"),this.hidden_size=Se(n,"hidden_size","LlamaConfig"),this.intermediate_size=Se(n,"intermediate_size","LlamaConfig"),this.num_hidden_layers=Se(n,"num_hidden_layers","LlamaConfig"),this.num_attention_heads=Se(n,"num_attention_heads","LlamaConfig"),this.num_key_value_heads=n.num_key_value_heads??this.num_attention_heads,this.hidden_act=n.hidden_act,this.max_position_embeddings=Se(n,"max_position_embeddings","LlamaConfig"),this.initializer_range=n.initializer_range,this.rms_norm_eps=n.rms_norm_eps,this.use_cache=n.use_cache,this.pad_token_id=n.pad_token_id,this.bos_token_id=n.bos_token_id,this.eos_token_id=n.eos_token_id,this.pretraining_tp=n.pretraining_tp,this.tie_word_embeddings=n.tie_word_embeddings,this.rope_parameters=n.rope_parameters??cm(n),this.attention_bias=n.attention_bias,this.attention_dropout=n.attention_dropout,this.mlp_bias=n.mlp_bias,this.head_dim=n.head_dim??Math.floor(this.hidden_size/this.num_attention_heads),this.model_type="llama",this.validate()}validate(){if(qs(this,"LlamaConfig",["vocab_size","hidden_size","intermediate_size","num_hidden_layers","num_attention_heads","num_key_value_heads","max_position_embeddings","head_dim"]),this.hidden_act!=="silu")throw new Error(`Unsupported Llama hidden_act for V1: ${this.hidden_act}`);if(this.attention_bias||this.mlp_bias)throw new Error("Llama megakernel V1 does not support attention_bias or mlp_bias");if(this.attention_dropout!==0)throw new Error("Llama megakernel V1 only supports attention_dropout=0");if(this.rope_parameters?.rope_type!=="default")throw new Error("Llama megakernel V1 only supports default RoPE")}toJSON(){return{...this,rope_parameters:{...this.rope_parameters}}}};function at(e){if(!e||typeof e!="object")throw new Error("Llama-like config must be an object");if(e instanceof ln)return e;let n=e;if(n.model_type==="llama")return new ln(n);if(n.model_type){if(typeof n.validate!="function")throw new Error("Llama-like configs with model_type must be constructed by their Config class");return e}return new ln(n)}function ge(e){return Array.isArray(e.layer_types)&&e.layer_types.some(n=>n==="conv")}function qe(e){return Array.isArray(e.layer_types)&&e.layer_types.some(n=>n==="linear_attention")}function Yt(e){if(!Array.isArray(e.layer_types))throw new Error("linear attention config requires layer_types");return e.layer_types}function ue(e,n){if(typeof e!="number")throw new Error(`${n} must be a number`);return e}function qs(e,n,t){if(_o(e,t,n),e.hidden_size!==e.num_attention_heads*e.head_dim)throw new Error(`${n} hidden_size must equal num_attention_heads * head_dim for V1`);if(e.num_attention_heads%e.num_key_value_heads!==0)throw new Error(`${n} num_attention_heads must be divisible by num_key_value_heads`);if(e.head_dim%2!==0)throw new Error(`${n} head_dim must be even for RoPE`)}function yo(e){let n=e.hidden_size,t=e.intermediate_size,r=e.num_attention_heads*e.head_dim,s=e.num_key_value_heads*e.head_dim,a=[{id:"embed_tokens",name:"model.embed_tokens.weight",length:e.vocab_size*n}];for(let i=0;i<e.num_hidden_layers;++i)a.push({id:`layers.${i}.q_proj`,name:`model.layers.${i}.self_attn.q_proj.weight`,length:r*n},{id:`layers.${i}.k_proj`,name:`model.layers.${i}.self_attn.k_proj.weight`,length:s*n},{id:`layers.${i}.v_proj`,name:`model.layers.${i}.self_attn.v_proj.weight`,length:s*n},{id:`layers.${i}.o_proj`,name:`model.layers.${i}.self_attn.o_proj.weight`,length:n*r},{id:`layers.${i}.gate_proj`,name:`model.layers.${i}.mlp.gate_proj.weight`,length:t*n},{id:`layers.${i}.up_proj`,name:`model.layers.${i}.mlp.up_proj.weight`,length:t*n},{id:`layers.${i}.down_proj`,name:`model.layers.${i}.mlp.down_proj.weight`,length:n*t},{id:`layers.${i}.input_layernorm`,name:`model.layers.${i}.input_layernorm.weight`,length:n},{id:`layers.${i}.post_attention_layernorm`,name:`model.layers.${i}.post_attention_layernorm.weight`,length:n});return a.push({id:"model_norm",name:"model.norm.weight",length:n},{id:"lm_head",name:"lm_head.weight",length:e.vocab_size*n}),a}var pm=64*1024,it=class{runtime;tensor;chunkBytes;constructor({runtime:n,tensor:t,chunkBytes:r=pm}){this.runtime=n,this.tensor=t,this.chunkBytes=r}writeTensor({sourceDtype:n,targetDtype:t,sourceBytes:r,targetElementOffset:s}){Ii(n,t);let a=Ri(n),i=Wi(t);if(r.byteLength%a!==0)throw new Error(`source byte length ${r.byteLength} not divisible by ${a}`);let o=r.byteLength/a,u=s*i;if(n==="F32"&&t==="float32")return this.runtime.writeWeightsRange(this.tensor,u,r),s+o;if(n==="F16"&&t==="float16")return this.runtime.writeWeightsRange(this.tensor,u,r),s+o;let l=Math.max(1,Math.floor(this.chunkBytes/i)),d=Bi(n,t);for(let c=0;c<o;c+=l){let p=Math.min(l,o-c),f=r.subarray(c*a,(c+p)*a),h=d(f),m=u+c*i;this.runtime.writeWeightsRange(this.tensor,m,Mi(h))}return s+o}};we();function bo(e){return{has:t=>e.has(t),describe(t){let r=e.info(t),s=[...r.shape];return{dtype:r.dtype,shape:s,elementCount:Y(s)}},async read(t){return e.tensorBytes(t)},async close(){await e.close()},closeTarget:e}}async function wo(e,{modelName:n="model"}={}){let{readFile:t}=await Promise.resolve().then(()=>(nt(),et)),{join:r}=await Promise.resolve().then(()=>(Os(),Ls)),s=JSON.parse(await t(r(e,"manifest.json"),"utf8")),a=new Map(s.tensors.map(i=>[i.name,i]));return{has:i=>a.has(i),describe(i){let o=a.get(i);if(!o)throw new Error(`Missing prepared ${n} tensor: ${i}`);if(o.dtype!=="float32")throw new Error(`Prepared tensor ${i} must be float32`);return{dtype:"F32",shape:[...o.shape],elementCount:Y(o.shape)}},async read(i){let o=a.get(i);if(!o)throw new Error(`Missing prepared ${n} tensor: ${i}`);let u=await t(r(e,o.file));return new Uint8Array(u.buffer,u.byteOffset,u.byteLength)},async close(){}}}var Xt=class{specs;handlers;pending;constructor(n=[]){this.specs=n.map(Jt),this.handlers=new Map,this.pending=new Set}add(n){return this.specs.push(Jt(n)),this}tensor(n){return this.add(Cs(n))}group(n){return this.add(bm(n))}prepare({reader:n,context:t={}}){this.handlers.clear(),this.pending.clear();for(let r of this.specs)if(r.type==="tensor")this.#n(r,n,t);else if(r.type==="group")this.#e(r,n,t);else throw new Error(`Unsupported weight plan spec type: ${r.type}`);return this}names(){return[...this.handlers.keys()]}async onChunk({bytes:n,tensors:t},r={}){let s=[];for(let a of t){let i=this.handlers.get(a.name);if(!i)continue;let o=n.subarray(a.offset,a.offset+a.length);s.push(vo(i,o,r))}s.length&&await Promise.all(s)}async readSequential(n,t={}){for(let r of this.names()){let s=await n.read(r),a=this.handlers.get(r);a&&await vo(a,s,t)}}assertComplete(){if(this.pending.size>0){let n=[...this.pending].slice(0,5).join(", ");throw new Error(`WeightPlan incomplete - ${this.pending.size} tensor(s) never arrived (first: ${n})`)}}#n(n,t,r){let s=ko(t,n.name);if(!s){To(n,r);return}So(n,s),this.#t(n.name,async(a,i)=>{this.pending.delete(n.name),await km(n,a,{...r,...i,description:s})},n.progressLabel??n.name)}#e(n,t,r){let s={},a=n.names.filter(u=>{let l=ko(t,u);return l&&(s[u]=l),!l});if(a.length>0){To(n,r,a);return}for(let u of n.names)So(n,s[u],u);let i={},o=n.names.length;for(let u of n.names)this.#t(u,async(l,d)=>{if(this.pending.delete(u),i[u]=l,--o===0)try{await Sm(n,i,{...r,...d,descriptions:s})}finally{for(let c of n.names)delete i[c]}},n.progressLabel??u)}#t(n,t,r=n){if(this.handlers.has(n))throw new Error(`Duplicate WeightPlan handler for tensor: ${n}`);this.handlers.set(n,{name:n,progressLabel:r,receive:t}),this.pending.add(n)}};function Cs(e){return Jt({type:"tensor",required:!0,...e})}function bm(e){return Jt({type:"group",required:!0,...e})}async function xo(e,{source:n=null,reader:t,context:r={},concurrency:s,chunkMaxBytes:a,onProgress:i=null,signal:o}={}){let u=e instanceof Xt?e:new Xt(e);if(!t)throw new Error("WeightPlan execution requires a reader");try{u.prepare({reader:t,context:r});let l={...r,onTensorProgress:wm(u,i)};return n?await n.streamAll(d=>u.onChunk(d,l),{concurrency:s,chunkMaxBytes:a,names:u.names(),signal:o}):await u.readSequential(t,l),u.assertComplete(),u}finally{await vm(n,t)}}async function vo(e,n,t){await e.receive(n,t),t.onTensorProgress?.({name:e.name,label:e.progressLabel})}function wm(e,n){if(!n)return null;let t=0,r=e.names().length;return({name:s,label:a})=>{n({phase:"tensor",processed:++t,total:r,name:s,label:a})}}async function vm(e,n){let t=new Set,r=e?[n,e]:[n];for(let s of r){let a=s.closeTarget??s;t.has(a)||(t.add(a),await s.close())}}function Jt(e){if(!e||typeof e!="object")throw new Error("WeightPlan spec must be an object");if(e.type==="tensor"){if(typeof e.name!="string"||e.name.length===0)throw new Error("WeightPlan tensor spec requires a name");return{required:!0,...e}}if(e.type==="group"){if(!Array.isArray(e.names)||e.names.length===0)throw new Error("WeightPlan group spec requires a non-empty names array");for(let n of e.names)if(typeof n!="string"||n.length===0)throw new Error("WeightPlan group tensor names must be non-empty strings");return{required:!0,...e}}throw new Error(`Unknown WeightPlan spec type: ${e.type}`)}function Do(e){return e.rt?.metadataOnly===!0}async function km(e,n,t){let r=e.transform&&!Do(t)?await e.transform(n,t):n,s=e.upload?await e.upload(r,t):r;e.run&&await e.run(s,t),e.assign?.(s,t),await e.cleanup?.(s,t)}async function Sm(e,n,t){let r=e.transform&&!Do(t)?await e.transform(n,t):n,s=e.upload?await e.upload(r,t):r;e.run&&await e.run(s,t),e.assign?.(s,t),await e.cleanup?.(s,t)}function ko(e,n){return e.has(n)?e.describe(n):null}function So(e,n,t=e.type==="tensor"?e.name:"group"){if(e.sourceDtype&&n.dtype!==e.sourceDtype)throw new Error(`${t} has dtype ${n.dtype}; expected ${e.sourceDtype}`);if(e.shape){let r=Tm(e.shape,n.elementCount,n);if(e.reshape){let s=r.reduce((a,i)=>a*i,1);if(s!==n.elementCount)throw new Error(`${t} has ${n.elementCount} elements; expected ${s} for reshape [${r}]`)}else if(r.length!==n.shape.length||r.some((s,a)=>s!==n.shape[a]))throw new Error(`${t} has shape [${n.shape}]; expected [${r}]`)}}function To(e,n,t=e.type==="tensor"?[e.name]:[...e.names]){if(e.required===!1){e.missing?.(t,n);return}throw new Error(`Missing required tensor${t.length===1?"":"s"}: ${t.join(", ")}`)}function Tm(e,n,t){return typeof e=="function"?e({valueLength:n,description:t}):Array.isArray(e)?e:t.shape?t.shape:[n]}function ut(e,n){let t=e.find(r=>r.id==="lm_head");return t?!n(t.name):!1}function qo({runtime:e,entries:n,stateDict:t,tieWordEmbeddings:r=!1,modelName:s="model"}){let a=Re(),i=[],o=0;for(let l of n){let d=t[l.name];if(d===void 0&&l.id==="lm_head"&&r){if(a.top.embed_tokens===void 0)throw new Error(`${s}: tied lm_head requires embed_tokens to come first in entries`);Te(a,l.id,a.top.embed_tokens);continue}if(d===void 0)throw new Error(`Missing ${s} state dict weight: ${l.name}`);let c=Dm(d,l.name);if(l.transform&&(c=l.transform(c,l.shape)),c.length!==l.length)throw new Error(`Weight ${l.name} length ${c.length} does not match expected ${l.length}`);Te(a,l.id,o),i.push(c),o+=c.length}let u=Lm(i,o,Float32Array);return{weights:e.tensorFromTypedArray("float32",[u.length],u),offsets:a}}function nr(e=8*1024*1024){let n=0;return t=>(n+=t,n<e?Promise.resolve():(n=0,new Promise(r=>setTimeout(r,0))))}async function lt({runtime:e,config:n,entries:t,reader:r,source:s=null,canUseFloat16:a=vn,canUseQ8LmHead:i=zn,canUseQ4LmHead:o=Ps,modelName:u="model",onProgress:l=null,signal:d,skipDenseIds:c}){let p=!!e.device.features.has("shader-f16")&&a(n),f=p?"float16":"float32",h=p?2:4,m=ut(t,O=>r.has(O)),g=Re(),w=[],T=0;for(let O of t){if(c?.has(O.id))continue;if(O.id==="lm_head"&&m){if(g.top.embed_tokens===void 0)throw new Error(`${u}: tied lm_head requires embed_tokens to come first in entries`);Te(g,O.id,g.top.embed_tokens),w.push({entry:O,tied:!0});continue}let _=r.describe(O.name);if($t(_.dtype),_.elementCount!==O.length)throw new Error(`${u} tensor ${O.name} length ${_.elementCount} does not match expected ${O.length}`);Te(g,O.id,T),w.push({entry:O,tied:!1,sourceDtype:_.dtype,sourceShape:_.shape,elementOffset:T}),T+=O.length}let x=e.allocateWeightsBuffer({byteLength:T*h,dtype:f,shape:[T],label:`${u}-weights`}),q=new it({runtime:e,tensor:x}),k=p&&o(n),B=p&&!k&&i(n),V=k||B,S=null,H=null,ae=w.filter(O=>!O.tied),ie=0,U=nr(),fe=[];for(let O of ae)fe.push(Cs({name:O.entry.name,sourceDtype:O.sourceDtype,run:async _=>{let b=O.sourceDtype,v=_;if(O.entry.transform){let A=_s(O.sourceDtype,_),me=O.entry.transform(A,O.sourceShape);b="F32",v=new Uint8Array(me.buffer,me.byteOffset,me.byteLength)}if(q.writeTensor({sourceDtype:b,targetDtype:f,sourceBytes:v,targetElementOffset:O.elementOffset}),V&&(O.entry.id==="embed_tokens"||O.entry.id==="lm_head")){let A=_s(O.sourceDtype,_);O.entry.id==="embed_tokens"?S=A:H=A}ie+=1,l?.({processed:ie,total:ae.length,name:O.entry.name}),await U(_.byteLength)}}));await xo(fe,{reader:r,source:s,signal:d});for(let O of w)O.tied&&V&&O.entry.id==="lm_head"&&(H=S);V&&H&&await U(1/0);let I=k&&H?Em(H,n.vocab_size,n.hidden_size):null,te=B&&H?qm(H,n.vocab_size,n.hidden_size):null,ye=e.device.features.has("shader-f16");return{weights:x,offsets:g,lmHeadQ4:I?e.tensorFromTypedArray("uint32",[I.bits.length],I.bits):null,lmHeadQ4Scales:I?ye?e.tensorFromTypedArray("float16",[I.scales.length],an(I.scales)):e.tensorFromTypedArray("float32",[I.scales.length],I.scales):null,lmHeadQ8:te?e.tensorFromTypedArray("uint32",[te.packed.length],te.packed):null,lmHeadQ8Scales:te?e.tensorFromTypedArray("float32",[te.scales.length],te.scales):null,cacheDtype:f}}async function Lo({runtime:e,config:n,entries:t,safeTensors:r,...s}){return lt({runtime:e,config:n,entries:t,reader:bo(r),source:xm(r),...s})}function xm(e){return typeof e.streamAll=="function"?e:null}function Dm(e,n){if(e instanceof Float32Array)return e;if(Om(e))return Float32Array.from(e);if(Array.isArray(e))return Float32Array.from(e.flat(1/0));throw new Error(`Weight ${n} must be a Float32Array or array`)}function Re(){return{top:{},layers:[]}}function Te(e,n,t){let r=/^layers\.(\d+)\.(.+)$/.exec(n);if(!r){e.top[n]=t;return}let s=Number(r[1]);(e.layers[s]??={})[r[2]]=t}function tr(e,n){let t=/^layers\.(\d+)\.(.+)$/.exec(n);return t?e.layers[Number(t[1])]?.[t[2]]:e.top[n]}function vn(e){return e.hidden_size%4===0&&e.intermediate_size%4===0}function zn(e){return e.hidden_size%4===0}function Ps(e){return e.hidden_size%32===0}function Em(e,n,t){let r=t/32,s=n*r,a=new Uint32Array(s*4),i=new Float32Array(s);for(let o=0;o<n;++o)for(let u=0;u<r;++u){let l=o*t+u*32,d=0,c=0;for(let m=0;m<32;++m){let g=e[l+m];Math.abs(g)>d&&(d=Math.abs(g),c=g)}let p=c/-8,f=p!==0?1/p:0,h=o*r+u;i[h]=p;for(let m=0;m<4;++m){let g=0;for(let w=0;w<4;++w){let T=m*4+w,x=Eo(Math.round(e[l+T]*f)+8),q=Eo(Math.round(e[l+T+16]*f)+8);g|=((x|q<<4)&255)<<w*8}a[h*4+m]=g>>>0}}return{bits:a,scales:i}}function Eo(e){return e<0?0:e>15?15:e}function qm(e,n,t){let r=t/4,s=new Uint32Array(n*r),a=new Float32Array(n);for(let i=0;i<n;++i){let o=i*t,u=0;for(let d=0;d<t;++d)u=Math.max(u,Math.abs(e[o+d]));let l=u>0?u/127:1;a[i]=l;for(let d=0;d<r;++d){let c=o+d*4,p=er(e[c]/l),f=er(e[c+1]/l),h=er(e[c+2]/l),m=er(e[c+3]/l);s[i*r+d]=p&255|(f&255)<<8|(h&255)<<16|(m&255)<<24}}return{packed:s,scales:a}}function Lm(e,n,t){let r=new t(n),s=0;for(let a of e)r.set(a,s),s+=a.length;return r}function er(e){return Math.max(-127,Math.min(127,Math.round(e)))}function Om(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)&&"length"in e}var Cm={tensor:e=>e.destroy(),buffer:e=>e.destroy(),map:e=>e.clear(),set:e=>e.clear()};function J(e,n=new Set){rr(e,n,Cm)}function rr(e,n,t){if(!(e==null||typeof e!="object")&&!n.has(e)&&(n.add(e),!(ArrayBuffer.isView(e)||e instanceof ArrayBuffer))){if(Pm(e)){t.tensor(e);return}if(zm(e)){t.buffer(e);return}if(e instanceof Map){for(let r of e.values())rr(r,n,t);t.map(e);return}if(e instanceof Set){for(let r of e.values())rr(r,n,t);t.set(e);return}for(let r of Object.keys(e))rr(e[r],n,t)}}function Pm(e){let n=e;return Array.isArray(n.shape)&&typeof n.dtype=="string"&&typeof n.destroy=="function"&&n.buffer!=null&&typeof n.buffer.destroy=="function"}function zm(e){let n=e;return typeof n.destroy=="function"&&typeof n.mapAsync=="function"&&typeof n.getMappedRange=="function"}var We=class e{runtime;config;batchSize;maxLength;seqLength;keyStates;valueStates;convStates;linearConvStates;linearRecurrentStates;constructor({runtime:n,config:t,batchSize:r,maxLength:s,keyStates:a,valueStates:i,convStates:o=null,linearConvStates:u=null,linearRecurrentStates:l=null,seqLength:d=0}){this.runtime=n,this.config=at(t),this.batchSize=r,this.maxLength=s,this.seqLength=d,this.keyStates=a,this.valueStates=i,this.convStates=o,this.linearConvStates=u,this.linearRecurrentStates=l}static allocate(n,t,r,s,a="float32"){let i=at(t),o=[i.num_hidden_layers,r,s??i.max_position_embeddings,i.num_key_value_heads,i.head_dim];return new e({runtime:n,config:i,batchSize:r,maxLength:o[2],keyStates:n.empty(a,o,"llama-cache-keys"),valueStates:n.empty(a,o,"llama-cache-values"),convStates:ge(i)?n.tensorFromTypedArray("float32",[i.num_hidden_layers*r*i.hidden_size*ue(i.conv_L_cache,"config.conv_L_cache")],new Float32Array(i.num_hidden_layers*r*i.hidden_size*ue(i.conv_L_cache,"config.conv_L_cache"))):null,...Am(n,i,r)})}get_seq_length(){return this.seqLength}advance(n){if(!Number.isInteger(n)||n<0)throw new Error(`cache advance expects a non-negative integer, got ${n}`);let t=this.seqLength+n;if(t>this.maxLength)throw new Error(`cache length ${t} exceeds maxLength ${this.maxLength}`);this.seqLength=t}truncate(n){if(!Number.isInteger(n)||n<0||n>this.maxLength)throw new Error(`cache truncate expects an integer in [0, ${this.maxLength}], got ${n}`);this.seqLength=n,n===0&&this.convStates&&this.runtime.host.writeBuffer(this.convStates.buffer,0,new Float32Array(this.convStates.shape.reduce((t,r)=>t*r,1))),n===0&&(Oo(this.runtime,this.linearConvStates),Oo(this.runtime,this.linearRecurrentStates))}dispose(){J(this.keyStates),J(this.valueStates),J(this.convStates),J(this.linearConvStates),J(this.linearRecurrentStates),this.convStates=null,this.linearConvStates=null,this.linearRecurrentStates=null}};function Am(e,n,t){if(!qe(n))return{};let r=Yt(n),s=ue(n.linear_conv_dim,"config.linear_conv_dim"),a=ue(n.linear_conv_kernel_dim,"config.linear_conv_kernel_dim")-1,i=[t,ue(n.linear_num_value_heads,"config.linear_num_value_heads"),ue(n.linear_key_head_dim,"config.linear_key_head_dim"),ue(n.linear_value_head_dim,"config.linear_value_head_dim")],o=Array.from({length:n.num_hidden_layers},(l,d)=>r[d]==="linear_attention"?e.tensorFromTypedArray("float32",[t,s,a],new Float32Array(t*s*a)):null),u=Array.from({length:n.num_hidden_layers},(l,d)=>r[d]==="linear_attention"?e.tensorFromTypedArray("float32",i,new Float32Array(i.reduce((c,p)=>c*p,1))):null);return{linearConvStates:o,linearRecurrentStates:u}}function Oo(e,n){if(Array.isArray(n))for(let t of n)t&&e.host.writeBuffer(t.buffer,0,new Float32Array(t.shape.reduce((r,s)=>r*s,1)))}sn();$n();var zs="-3.4028234663852886e+38";var As=`fn silu(x: f32) -> f32 {
  return x / (1.0 + exp(-x));
}`;var Co=`fn q_index(head: u32, dim: u32) -> u32 {
  return head * HEAD_DIM + dim;
}

fn kv_index(head: u32, dim: u32) -> u32 {
  return head * HEAD_DIM + dim;
}`,Po=`struct Params {
  past_len: u32,
  cache_len: u32,
  _pad0: u32,
  _pad1: u32,
}`;var Gm={HIDDEN_SIZE:e=>e.hidden_size,HIDDEN_SIZE_VEC4:e=>e.hidden_size/4,INTERMEDIATE_SIZE:e=>e.intermediate_size,INTERMEDIATE_SIZE_VEC4:e=>e.intermediate_size/4,VOCAB_SIZE:e=>e.vocab_size,NUM_LAYERS:e=>e.num_hidden_layers,NUM_HEADS:e=>e.num_attention_heads,NUM_KV_HEADS:e=>e.num_key_value_heads,NUM_KV_GROUPS:e=>e.num_attention_heads/e.num_key_value_heads,HEAD_DIM:e=>e.head_dim,HEAD_DIM_HALF:e=>e.head_dim/2,KV_SIZE:e=>e.num_key_value_heads*e.head_dim,Q_PAIRS:e=>e.num_attention_heads*(e.head_dim/2),KV_PAIRS:e=>e.num_key_value_heads*(e.head_dim/2),TOTAL_PAIRS:e=>(e.num_attention_heads+e.num_key_value_heads)*(e.head_dim/2)};function Gs(e,n){return n.map(t=>`const ${t}: u32 = ${Gm[t](e)}u;`).join(`
`)}function sr(e,n,t){let r=[];for(let s=0;s<n;++s)r.push(`    case ${s}u: { return ${t(s)}u; }`);return`fn ${e}(layer: u32) -> u32 {
  switch layer {
${r.join(`
`)}
    default: { return 0u; }
  }
}`}var Ye=32,ar=8;function Ao({config:e,offsets:n}){let t=e,r=t.hidden_size,s=t.intermediate_size,a=t.num_attention_heads,i=t.num_key_value_heads,o=t.head_dim,u=t.max_position_embeddings;return{maxSeq:u,consts:Gs(t,["VOCAB_SIZE","HIDDEN_SIZE","INTERMEDIATE_SIZE","NUM_LAYERS","NUM_HEADS","NUM_KV_HEADS","NUM_KV_GROUPS","HEAD_DIM","HEAD_DIM_HALF"]),ropeTheta:Io(t),rmsEps:Ro(t),scaling:Wo(o),embedOffset:n.top.embed_tokens,modelNormOffset:n.top.model_norm,lmHeadOffset:n.top.lm_head,layerOffsets:Mo(t,n),qkNormBlock:Mm(t),siluFn:As,f32Min:zs,hiddenArraySize:u*r,qArraySize:u*a*o,kvArraySize:u*i*o,interSize:s}}function Go({config:e,offsets:n,maxCacheLength:t,outputLogits:r=!1}){let s=e,a=s.hidden_size,i=s.intermediate_size,o=s.head_dim,u=s.num_key_value_heads*o,l=Io(s),d=Ro(s),c=Wo(o);return{paramsDecl:Po,qkvIndex:Co,siluFn:As,f32Min:zs,cacheLen:t,cacheLenArg:t,consts:Gs(s,["VOCAB_SIZE","HIDDEN_SIZE","INTERMEDIATE_SIZE","NUM_LAYERS","NUM_HEADS","NUM_KV_HEADS","NUM_KV_GROUPS","HEAD_DIM","HEAD_DIM_HALF"]),ropeTheta:Number(l),rmsEps:Number(d),scaling:Number(c),vocabSize:s.vocab_size,hiddenSize:a,intermediateSize:i,numLayers:s.num_hidden_layers,numHeads:s.num_attention_heads,numKvHeads:s.num_key_value_heads,numKvGroups:s.num_attention_heads/s.num_key_value_heads,headDim:o,headDimHalf:o/2,kvSize:u,embedOffset:n.top.embed_tokens,modelNormOffset:n.top.model_norm,lmHeadOffset:n.top.lm_head,qkNormBlock:Bm(s),layerOffsets:Mo(s,n),outputLogits:r?1:0}}function An(e){return e.head_dim<=128&&Im(e.head_dim)}function kn(e){return e.head_dim<=64?64:128}function ir(e){return Math.min(kn(e),128)}function Im(e){return Number.isInteger(e)&&e>0&&(e&e-1)===0}var Io=e=>Number(e.rope_parameters?.rope_theta).toPrecision(9),Ro=e=>Number(e.rms_norm_eps).toPrecision(9),Wo=e=>Math.pow(e,-.5).toPrecision(9);function or(e,n){return e.layer_types?e.layer_types[n]:"full_attention"}function xe(e){return!!e.attention_qk_norm}function Rm(e,n){return xe(e)?`${sr("q_layernorm_offset",e.num_hidden_layers,t=>n.layers[t].q_layernorm)}
${sr("k_layernorm_offset",e.num_hidden_layers,t=>n.layers[t].k_layernorm)}`:""}var Wm=[["q_offset","q_proj"],["k_offset","k_proj"],["v_offset","v_proj"],["o_offset","o_proj"],["gate_offset","gate_proj"],["up_offset","up_proj"],["down_offset","down_proj"],["input_norm_offset","input_layernorm"],["post_norm_offset","post_attention_layernorm"]];function Mo(e,n){let t=Wm.map(([r,s])=>sr(r,e.num_hidden_layers,a=>n.layers[a][s]));return t.push(Rm(e,n)),t.join(`
`)}function zo({buffer:e,indexFn:n,headCount:t,weightBase:r,indent:s}){let a=" ".repeat(s);return`${a}for (var head = 0u; head < ${t}; head = head + 1u) {
${a}  var variance = 0.0;
${a}  for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
${a}    let value = ${e}[${n("d")}];
${a}    variance = variance + value * value;
${a}  }
${a}  let scale = inverseSqrt(variance / f32(HEAD_DIM) + RMS_EPS);
${a}  for (var d = 0u; d < HEAD_DIM; d = d + 1u) {
${a}    ${e}[${n("d")}] = ${e}[${n("d")}] * scale * weights[${r} + d];
${a}  }
${a}}`}function Bo(e,{wrapInTimeLoop:n=!1,useLayerOffsets:t=!0,indent:r=4}={}){if(!xe(e))return"";let s=n?r+2:r,a=n?c=>`q_index(t, head, ${c})`:c=>`q_index(head, ${c})`,i=n?c=>`kv_index(t, head, ${c})`:c=>`kv_index(head, ${c})`,o=t?"q_layernorm_offset(layer)":"W_Q_NORM",u=t?"k_layernorm_offset(layer)":"W_K_NORM",l=zo({buffer:"q",indexFn:a,headCount:"NUM_HEADS",weightBase:o,indent:s}),d=zo({buffer:"k",indexFn:i,headCount:"NUM_KV_HEADS",weightBase:u,indent:s});if(n){let c=" ".repeat(r);return`
${c}for (var t = 0u; t < params.seq_len; t = t + 1u) {
${l}
${d}
${c}}`}return`
${l}
${d}`}var Mm=e=>Bo(e,{wrapInTimeLoop:!0,useLayerOffsets:!0,indent:4}),Bm=e=>Bo(e,{wrapInTimeLoop:!1,useLayerOffsets:!0,indent:4});function _e(e){return!!(e.q1Bits&&e.q1Scales&&e.q1Offsets)}sn();we();function Is(e,n,t){try{return e.explain({device:n},t).selected!==null}catch{return!1}}function No(e,n){return{...e,features:[...e.features,...n]}}function Nm(e,n,t){let r=new Set(n.features),s=Bn.filter(i=>!r.has(i));for(let i of s)if(Is(e,No(n,[i]),t))return[i];let a=[];for(let i of s)if(a.push(i),Is(e,No(n,a),t))return a;return[]}function ur(e){let n=e/1048576;return`${n.toFixed(n<1e4?1:0)} MB`}function Rs(e,n){let t=Ee(n),r=tn(t),s=[],a=new Set,i=new Set;for(let{op:l,request:d,id:c}of e.opRequests??[]){let p=c??l.manifest.id,f=`${p}|${JSON.stringify(d)}`;if(a.has(f)||(a.add(f),Is(l,r,d)))continue;let h=Nm(l,r,d),m=`${p}|${h.join(",")}`;if(i.has(m))continue;i.add(m);let g=h.map(w=>`"${w}"`).join(", ");s.push({kind:"feature",op:p,missingFeatures:h,message:h.length>0?`${p} needs WebGPU feature${h.length>1?"s":""} ${g}, which this device lacks`:`${p} has no runnable variant on this device`})}let o=t.limits.maxBufferSize;if(typeof o=="number"){let l=new Set;for(let d of e.tensors??[]){let c=Y(d.shape)*se(d.dtype);c<=o||l.has(c)||(l.add(c),s.push({kind:"buffer",tensor:d.name,bytes:c,limitBytes:o,message:`tensor ${d.name} needs a ${ur(c)} buffer, over this device's ${ur(o)} maxBufferSize`}))}}let u=t.limits.maxStorageBufferBindingSize;if(typeof u=="number"){let l=new Set;for(let d of e.tensors??[]){if(!d.boundWhole)continue;let c=Y(d.shape)*se(d.dtype);c<=u||l.has(c)||typeof o=="number"&&c>o||(l.add(c),s.push({kind:"binding",tensor:d.name,bytes:c,limitBytes:u,message:`tensor ${d.name} needs a ${ur(c)} storage binding, over this device's ${ur(u)} maxStorageBufferBindingSize`}))}}return{ok:s.length===0,problems:s,reason:s.length>0?Hm(s):null}}function Hm(e){let n=[...new Set(e.flatMap(a=>a.missingFeatures??[]))],t=n.length>0?`This GPU/browser is missing WebGPU feature${n.length>1?"s":""} ${n.map(a=>`"${a}"`).join(", ")} that the model needs`:e[0].message,r=e.filter(a=>a.kind==="buffer"||a.kind==="binding"),s=n.length>0&&r.length>0?" Some weights also exceed the device's buffer limits.":"";return`${t} \u2014 it can't run here.${s} Try Chrome or Edge with up-to-date GPU drivers.`}we();function lr(e,n,t){let r=e.recordSupportOp;return r?(r.call(e,n,t),!0):!1}we();var Ko=1,Ho=new WeakMap,Uo=new WeakMap,Fo=new WeakMap,Um=1,z=Ht({nextToken:"com.xenova.LlamaNextToken",decodeBestArgmax:"com.xenova.LlamaDecodeBestArgmax",decodeTokenForward:"com.xenova.LlamaDecodeTokenForward",embed:"com.xenova.LlamaEmbed",embedQ1:"com.xenova.LlamaEmbedQ1",decodeRmsNorm:"com.xenova.LlamaDecodeRmsNorm",decodeQkv:"com.xenova.LlamaDecodeQkv",decodeQkvQ1:"com.xenova.LlamaDecodeQkvQ1",decodeQkvQ4:"com.xenova.LlamaDecodeQkvQ4",decodeQkvNormQ1:"com.xenova.LlamaDecodeQkvNormQ1",decodeQkvNormQ4:"com.xenova.LlamaDecodeQkvNormQ4",decodeOProj:"com.xenova.LlamaDecodeOProj",decodeOProjQ1:"com.xenova.LlamaDecodeOProjQ1",decodeOProjQ4:"com.xenova.LlamaDecodeOProjQ4",decodeGateUp:"com.xenova.LlamaDecodeGateUp",decodeGateUpQ1:"com.xenova.LlamaDecodeGateUpQ1",decodeGateUpNormQ1:"com.xenova.LlamaDecodeGateUpNormQ1",decodeGateUpNormQ4:"com.xenova.LlamaDecodeGateUpNormQ4",decodeGateUpNorm:"com.xenova.LlamaDecodeGateUpNorm",decodeDownProj:"com.xenova.LlamaDecodeDownProj",decodeDownProjQ1:"com.xenova.LlamaDecodeDownProjQ1",decodeDownProjQ4:"com.xenova.LlamaDecodeDownProjQ4",decodeFinalNormQuantizeQ8:"com.xenova.LlamaDecodeFinalNormQuantizeQ8",decodeFinal:"com.xenova.LlamaDecodeFinal",decodeFinalArgmax:"com.xenova.LlamaDecodeFinalArgmax",decodeQkNorm:"com.xenova.LlamaDecodeQkNorm",decodeRopeCacheKv:"com.xenova.LlamaDecodeRopeCacheKv",decodeQkNormRopeCacheKv:"com.xenova.LlamaDecodeQkNormRopeCacheKv",decodeQkvRopeCache:"com.xenova.LlamaDecodeQkvRopeCache",decodeQkvRopeCacheNorm:"com.xenova.LlamaDecodeQkvRopeCacheNorm",decodeQkNormRopeCacheKvPacked:"com.xenova.LlamaDecodeQkNormRopeCacheKvPacked",decodeAttention:"com.xenova.LlamaDecodeAttention",decodeAttentionSplitK:"com.xenova.LlamaDecodeAttentionSplitK",decodeAttentionSplitKMerge:"com.xenova.LlamaDecodeAttentionSplitKMerge",decodeConvInUpdate:"com.xenova.LlamaDecodeConvInUpdate",decodeConvInProjNormQ4:"com.xenova.LlamaDecodeConvInProjNormQ4",decodeConvDepthwise:"com.xenova.LlamaDecodeConvDepthwise",decodeLmHeadQ8ArgmaxTiled:"com.xenova.LlamaDecodeLmHeadQ8ArgmaxTiled",decodeLmHeadQ4ArgmaxTiled:"com.xenova.LlamaDecodeLmHeadQ4ArgmaxTiled",decodeLmHeadQ1ArgmaxTiled:"com.xenova.LlamaDecodeLmHeadQ1ArgmaxTiled",decodeFinalNormLmHeadArgmaxTiled:"com.xenova.LlamaDecodeFinalNormLmHeadArgmaxTiled"});function Fm(e,n,t){let r=`op=${n.manifest.id}|v=${Ko}|hint=${t}`;return Vm(e,r)}function Km(e){let n=Ho.get(e);return n===void 0&&(n=Um++,Ho.set(e,n)),n}function Vm(e,n){let t=Uo.get(e);t||(t=new Map,Uo.set(e,t));let r=t.get(n);return r===void 0&&(r=`m${Km(e)}s${t.size+1}`,t.set(n,r)),r}function Ws(e,n){return Vo(e,n.normOffset,n.hidden,n.normed)}function pe(e,n,t){let r=$m[n];if(r)return r(e,t);throw new Error(`no manifest-backed llama generic kernel op for "${n}"`)}var $m={tokenForward:Qm,argmaxReduce:jm,decodeFinal:Zm,finalNormQuantizeQ8:lh,qkNorm:Ym,ropeCacheKv:Xm,qkNormRopeCacheKv:Jm,qkvRopeCache:eh,qkvRopeCacheNorm:nh,qkNormRopeCacheKvPacked:th,attention:rh,attentionSplitK:sh,attentionSplitKMerge:ah,convInUpdate:ih,convInProjNorm:oh,convDepthwise:uh};function jm(e,n){let t=n.workgroupSize??256,r={resources:{bestValuesT:n.scratch.finalBestValues,bestIdsT:n.scratch.finalBestIds,outputT:n.output},args:{outputOffset:n.outputOffset??0,workgroupSize:t,inputCount:n.inputCount??t}};return G(e,z.decodeBestArgmax,r)}function Qm(e,n){let t={resources:{tokensT:n.tokens},args:{srcIndex:n.srcIndex}};return G(e,z.decodeTokenForward,t)}function Zm(e,n){let t=n.outputLogits?z.decodeFinal:z.decodeFinalArgmax,r={resources:{hiddenT:n.hidden,weightsT:e.weights,outputT:n.output},args:{hiddenSize:e.config.hidden_size,vocabSize:e.config.vocab_size,rmsEps:Number(e.config.rms_norm_eps),finalNormOffset:e.offsets.top.model_norm,lmHeadOffset:e.offsets.top.lm_head}};return G(e,t,r)}function Ym(e,n){let t=e.offsets.layers[n.layer],r=t.q_layernorm,s=t.k_layernorm,a=Math.min(r,s),i=Math.max(r,s)+e.config.head_dim,o=$o(e.weights,a,i-a),u={resources:{qT:n.q,kT:n.k,weightsT:o.tensor},args:{numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,rmsEps:Number(e.config.rms_norm_eps),qNormOffset:r-o.baseElement,kNormOffset:s-o.baseElement}};return G(e,z.decodeQkNorm,u)}function Xm(e,n){let t=dn(e,n.cache,n.layer),r={resources:{qT:n.q,kT:n.k,vT:n.v,cacheKeysT:t.cacheKeysT,cacheValuesT:t.cacheValuesT,cosT:n.ropeCache.cos,sinT:n.ropeCache.sin,paramsT:n.params},args:{layer:0,cacheLen:n.cache.maxLength,pastLen:Tn(n.cache),numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim}};return G(e,z.decodeRopeCacheKv,r)}function Jm(e,n){let t=e.offsets.layers[n.layer],r=t.q_layernorm,s=t.k_layernorm,a=Math.min(r,s),i=Math.max(r,s)+e.config.head_dim,o=$o(e.weights,a,i-a),u=dn(e,n.cache,n.layer),l={resources:{qT:n.q,kT:n.k,vT:n.v,weightsT:o.tensor,cacheKeysT:u.cacheKeysT,cacheValuesT:u.cacheValuesT,cosT:n.ropeCache.cos,sinT:n.ropeCache.sin,paramsT:n.params},args:{layer:0,cacheLen:n.cache.maxLength,pastLen:Tn(n.cache),numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,rmsEps:Number(e.config.rms_norm_eps),qNormOffset:r-o.baseElement,kNormOffset:s-o.baseElement}};return G(e,z.decodeQkNormRopeCacheKv,l,{sourceHint:`layer=${n.layer}`})}function eh(e,n){let t=e.offsets.layers[n.layer],r=dn(e,n.cache,n.layer),s={resources:{normedT:n.normed,weightsT:e.weights,qT:n.q,cacheKeysT:r.cacheKeysT,cacheValuesT:r.cacheValuesT,cosT:n.ropeCache.cos,sinT:n.ropeCache.sin,paramsT:n.params},args:{layer:0,cacheLen:n.cache.maxLength,pastLen:Tn(n.cache),hiddenSize:e.config.hidden_size,numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,qOffset:t.q_proj,kOffset:t.k_proj,vOffset:t.v_proj}};return G(e,z.decodeQkvRopeCache,s)}function nh(e,n){let t=e.offsets.layers[n.layer],r=dn(e,n.cache,n.layer),s={resources:{hiddenT:n.hidden,weightsT:e.weights,qT:n.q,cacheKeysT:r.cacheKeysT,cacheValuesT:r.cacheValuesT,cosT:n.ropeCache.cos,sinT:n.ropeCache.sin,paramsT:n.params},args:{layer:0,cacheLen:n.cache.maxLength,pastLen:Tn(n.cache),hiddenSize:e.config.hidden_size,rmsEps:Number(e.config.rms_norm_eps),normOffset:t.input_layernorm,numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,qOffset:t.q_proj,kOffset:t.k_proj,vOffset:t.v_proj}};return G(e,z.decodeQkvRopeCacheNorm,s)}function th(e,n){let t=e.offsets.layers[n.layer],r=t.q_layernorm,s=t.k_layernorm,a={resources:{qkvT:n.qkv,weightsT:e.weights,cacheKeysT:n.cache.keyStates,cacheValuesT:n.cache.valueStates,cosT:n.ropeCache.cos,sinT:n.ropeCache.sin,paramsT:n.params},args:{layer:n.layer,cacheLen:n.cache.maxLength,pastLen:Tn(n.cache),hiddenSize:e.config.hidden_size,numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,rmsEps:Number(e.config.rms_norm_eps),qNormOffset:r,kNormOffset:s}};return G(e,z.decodeQkNormRopeCacheKvPacked,a,{sourceHint:`layer=${n.layer}`})}function rh(e,n){let t=dn(e,n.cache,n.layer),r={resources:{qT:n.q,cacheKeysT:t.cacheKeysT,cacheValuesT:t.cacheValuesT,attnT:n.attn,paramsT:n.params},args:{layer:0,cacheLen:n.cache.maxLength,pastLen:Tn(n.cache),numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,scale:Ms(e),workgroupSize:n.workgroupSize}};return G(e,z.decodeAttention,r)}function sh(e,n){let t={resources:{qT:n.q,cacheKeysT:n.cache.keyStates,cacheValuesT:n.cache.valueStates,partialOutT:n.splitOut,partialMetaT:n.splitMeta,paramsT:n.params},args:{layer:n.layer,cacheLen:n.cache.maxLength,pastLen:Tn(n.cache),numHeads:e.config.num_attention_heads,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,scale:Ms(e),workgroupSize:n.workgroupSize,tileSize:n.tileSize,numKvChunks:Ye,minKeysPerChunk:ar}};return G(e,z.decodeAttentionSplitK,t,{sourceHint:`layer=${n.layer};wg=${n.workgroupSize};tile=${n.tileSize}`})}function ah(e,n){let t={resources:{partialOutT:n.splitOut,partialMetaT:n.splitMeta,attnT:n.attn},args:{numHeads:e.config.num_attention_heads,headDim:e.config.head_dim,numKvChunks:Ye}};return G(e,z.decodeAttentionSplitKMerge,t,{sourceHint:"main"})}function ih(e,n){let t=e.offsets.layers[n.layer],r=Number(e.config.conv_L_cache),s={resources:{normedT:n.normed,weightsT:e.weights,convStatesT:n.cache.convStates,convYT:n.attn},args:{layer:n.layer,hiddenSize:e.config.hidden_size,convLCache:r,convInOffset:t.conv_in_proj,convWeightOffset:t.conv_weight}};return G(e,z.decodeConvInUpdate,s)}function oh(e,n){let t=e.offsets.layers[n.layer],r=pn(e,n.layer,["conv_in_proj"]);if(!n.scratch.convProj)throw new Error("conv split requires scratch.convProj");let s={resources:{hiddenT:n.hidden,q4BitsT:r.q4BitsT,q4ScalesT:r.q4ScalesT,weightsT:e.weights,convProjT:n.scratch.convProj},args:{hiddenSize:e.config.hidden_size,rmsEps:Number(e.config.rms_norm_eps),normOffset:t.input_layernorm,convInOffset:r.offset(`layers.${n.layer}.conv_in_proj`),quantBits:r.quantBits,hasMin:r.hasMin}};return G(e,z.decodeConvInProjNormQ4,s,{sourceHint:`layer=${n.layer}`})}function uh(e,n){let t=e.offsets.layers[n.layer],r=Number(e.config.conv_L_cache);if(!n.scratch.convProj)throw new Error("conv split requires scratch.convProj");let s={resources:{convProjT:n.scratch.convProj,weightsT:e.weights,convStatesT:n.cache.convStates,convYT:n.attn},args:{layer:n.layer,hiddenSize:e.config.hidden_size,convLCache:r,convWeightOffset:t.conv_weight}};return G(e,z.decodeConvDepthwise,s,{sourceHint:`layer=${n.layer}`})}function Vo(e,n,t,r){let s={resources:{hiddenT:t,weightsT:e.weights,normedT:r},args:{hiddenSize:e.config.hidden_size,rmsEps:Number(e.config.rms_norm_eps),normOffset:n}};return G(e,z.decodeRmsNorm,s)}function lh(e,n){let t={resources:{hiddenT:n.hidden,weightsT:e.weights,normQ8T:n.scratch.normQ8,normScaleT:n.scratch.normQ8Scale},args:{hiddenSize:e.config.hidden_size,rmsEps:Number(e.config.rms_norm_eps),finalNormOffset:e.offsets.top.model_norm}};return G(e,z.decodeFinalNormQuantizeQ8,t)}var dh={};function G(e,n,t,r={}){if(lr(e.runtime,n,t))return dh;let s=r.sourceHint===void 0?n.prepareComputePassDescriptorTemplate(e.runtime,t):ch(e,n,t,Fm(e,n,r.sourceHint)),a=Mt(s,t.resources);return{...a,profile:{...ph(e,t),...a.profile}}}function ch(e,n,t,r){let s=Fo.get(e);s||(s=new Map,Fo.set(e,s));let a=`${n.manifest.id}:${Ko}:${r}`,i=s.get(a);if(i)return i;let o=n.prepareComputePassDescriptorTemplate(e.runtime,t,{cacheKey:`webgpu-template:${a}`});return s.set(a,o),o}function ph(e,n){let t=n.args?.layer;return{model:e.config.model_type,...Number.isInteger(t)?{layer:t}:{}}}function Tn(e){return typeof e.get_seq_length=="function"?e.get_seq_length():0}function Ms(e){return Number(Math.pow(e.config.head_dim,-.5).toPrecision(9))}function dn(e,n,t){let r=n.maxLength*e.config.num_key_value_heads*e.config.head_dim,s=t*r;return{cacheKeysT:Xe(n.keyStates,s,r),cacheValuesT:Xe(n.valueStates,s,r)}}function $o(e,n,t,r=256){let s=se(e.dtype),a=r/s;if(!Number.isInteger(a)||a<=0)throw new Error(`Cannot align dtype ${e.dtype} to ${r} bytes`);let i=Math.floor(n/a)*a,o=n-i;return{tensor:Xe(e,i,o+t),baseElement:i}}function ct(e,n){return jo(e,n)}function cn(e,n,t){return jo(e,t.map(r=>`layers.${n}.${r}`))}function jo(e,n){let t=fh(e,n);return{q1BitsT:Xe(e.q1Bits,t.baseBlock*4,t.blockCount*4),q1ScalesT:Xe(e.q1Scales,t.baseBlock,t.blockCount),offset:r=>Qo(e,r)-t.baseBlock}}function fh(e,n){let t=Number.POSITIVE_INFINITY,r=0;for(let o of n){let u=Qo(e,o),l=mh(e,o);t=Math.min(t,u),r=Math.max(r,u+l)}let a=se(e.q1Scales.dtype)===2?128:64,i=Math.floor(t/a)*a;return{baseBlock:i,blockCount:r-i}}function Qo(e,n){return dt(e.q1Offsets,n,"offset")}function mh(e,n){return dt(e.q1BlockCounts,n,"block count")}function pn(e,n,t){return hh(e,t.map(r=>`layers.${n}.${r}`))}function hh(e,n){let t=Zo(e,n[0]),r=t?e.kq4Bits:e.q4Bits,s=t?e.kq4Scales:e.q4Scales,a=t?e.kq4Offsets:e.q4Offsets,i=t?e.kq4BlockCounts:e.q4BlockCounts,o=t?4:e.packedQuantBits??4,u=t?2:1,l=gh(s,a,i,n);return{q4BitsT:Xe(r,l.baseBlock*o,l.blockCount*o),q4ScalesT:Xe(s,l.baseBlock*u,l.blockCount*u),offset:d=>dt(a,d,"offset")-l.baseBlock,hasMin:t?1:0,quantBits:o}}function gh(e,n,t,r){let s=Number.POSITIVE_INFINITY,a=0;for(let l of r){let d=dt(n,l,"offset"),c=dt(t,l,"block count");s=Math.min(s,d),a=Math.max(a,d+c)}let o=se(e.dtype)===2?128:64,u=Math.floor(s/o)*o;return{baseBlock:u,blockCount:a-u}}function Le(e,n){return!!(e.q4Bits&&e.q4Scales)&&e.q4Offsets!=null&&tr(e.q4Offsets,n)!==void 0||Zo(e,n)}function Zo(e,n){return!!(e.kq4Bits&&e.kq4Scales)&&e.kq4Offsets!=null&&tr(e.kq4Offsets,n)!==void 0}function dt(e,n,t){let r=e!=null?tr(e,n):void 0;if(r===void 0||!Number.isInteger(r)||r<0)throw new Error(`Missing Q1 weight ${t} for ${n}`);return r}function Xe(e,n,t){if(!Number.isInteger(n)||n<0)throw new Error(`tensor view elementOffset must be a non-negative integer, got ${n}`);if(!Number.isInteger(t)||t<=0)throw new Error(`tensor view elementCount must be a positive integer, got ${t}`);let r=se(e.dtype),s=e.byteOffset??0,a=s+n*r,i=t*r;if(a+i>s+e.byteLength)throw new Error(`tensor view range exceeds tensor byteLength for dtype ${e.dtype}`);return{...e,shape:[t],size:t,byteOffset:a,byteLength:i}}function de(e,n,t){let r=_e(e);switch(n){case"lmHeadQ8ArgmaxTiled":return Gh(e,t);case"lmHeadQ4ArgmaxTiled":return Ih(e,t);case"lmHeadQ1ArgmaxTiled":if(r)return Rh(e,t);break;case"embed":return r?yh(e,t):_h(e,t);case"qkvNorm":if(Le(e,`layers.${t.layer}.q_proj`))return Ph(e,t);if(r)return Ah(e,t);break;case"qkv":return Le(e,`layers.${t.layer}.q_proj`)?Ch(e,t):r?zh(e,t):Oh(e,t);case"oProj":return Le(e,`layers.${t.layer}.${t.weightId??"o_proj"}`)?vh(e,t):r?wh(e,t):bh(e,t);case"gateUpNorm":return Le(e,`layers.${t.layer}.gate_proj`)?qh(e,t):r?xh(e,t):Sh(e,t);case"gateUp":return r?Th(e,t):kh(e,t);case"downProj":return Le(e,`layers.${t.layer}.down_proj`)?Lh(e,t):r?Eh(e,t):Dh(e,t);case"finalNormLmHeadArgmaxTiled":if(!r)return Wh(e,t);break}throw new Error(`no manifest-backed llama model kernel op for "${n}"`)}function _h(e,n){let t={resources:{inputT:n.input,weightsT:e.weights,hiddenT:n.hidden,paramsT:n.params},args:{hiddenSize:e.config.hidden_size,vocabSize:e.config.vocab_size,embedOffset:e.offsets.top.embed_tokens,tokenOffset:0}};return G(e,z.embed,t)}function yh(e,n){let t=ct(e,["embed_tokens"]),r={resources:{inputT:n.input,q1BitsT:t.q1BitsT,q1ScalesT:t.q1ScalesT,hiddenT:n.hidden,paramsT:n.params},args:{hiddenSize:e.config.hidden_size,vocabSize:e.config.vocab_size,embedOffset:t.offset("embed_tokens"),tokenOffset:0}};return G(e,z.embedQ1,r,{sourceHint:"main"})}function bh(e,n){let t={resources:{hiddenT:n.hidden,weightsT:e.weights,attnT:n.attn},args:{hiddenSize:e.config.hidden_size,oOffset:n.offset}};return G(e,z.decodeOProj,t)}function wh(e,n){let t=cn(e,n.layer,["o_proj"]),r={resources:{hiddenT:n.hidden,q1BitsT:t.q1BitsT,q1ScalesT:t.q1ScalesT,attnT:n.attn},args:{hiddenSize:e.config.hidden_size,oOffset:t.offset(`layers.${n.layer}.o_proj`)}};return G(e,z.decodeOProjQ1,r,{sourceHint:`layer=${n.layer}`})}function vh(e,n){let t=n.weightId??"o_proj",r=pn(e,n.layer,[t]),s={resources:{hiddenT:n.hidden,q4BitsT:r.q4BitsT,q4ScalesT:r.q4ScalesT,attnT:n.attn},args:{hiddenSize:e.config.hidden_size,oOffset:r.offset(`layers.${n.layer}.${t}`),quantBits:r.quantBits,hasMin:r.hasMin}};return G(e,z.decodeOProjQ4,s,{sourceHint:`layer=${n.layer}`})}function kh(e,n){let t=e.offsets.layers[n.layer],r={resources:{normedT:n.normed,weightsT:e.weights,intermediateT:n.intermediate},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,gateOffset:t.gate_proj,upOffset:t.up_proj}};return G(e,z.decodeGateUp,r)}function Sh(e,n){let t=e.offsets.layers[n.layer],r={resources:{hiddenT:n.hidden,weightsT:e.weights,intermediateT:n.intermediate},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,rmsEps:Number(e.config.rms_norm_eps),normOffset:t.post_attention_layernorm,gateOffset:t.gate_proj,upOffset:t.up_proj}};return G(e,z.decodeGateUpNorm,r)}function Th(e,n){let t=cn(e,n.layer,["gate_proj","up_proj"]),r={resources:{normedT:n.normed,q1BitsT:t.q1BitsT,q1ScalesT:t.q1ScalesT,intermediateT:n.intermediate},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,gateOffset:t.offset(`layers.${n.layer}.gate_proj`),upOffset:t.offset(`layers.${n.layer}.up_proj`)}};return G(e,z.decodeGateUpQ1,r,{sourceHint:`layer=${n.layer}`})}function xh(e,n){let t=cn(e,n.layer,["gate_proj","up_proj"]),r=e.offsets.layers[n.layer],s={resources:{hiddenT:n.hidden,q1BitsT:t.q1BitsT,q1ScalesT:t.q1ScalesT,intermediateT:n.intermediate,weightsT:e.weights},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,rmsEps:Number(e.config.rms_norm_eps),normOffset:r.post_attention_layernorm,gateOffset:t.offset(`layers.${n.layer}.gate_proj`),upOffset:t.offset(`layers.${n.layer}.up_proj`)}};return G(e,z.decodeGateUpNormQ1,s,{sourceHint:`layer=${n.layer}`})}function Dh(e,n){let t=e.offsets.layers[n.layer],r={resources:{hiddenT:n.hidden,weightsT:e.weights,intermediateT:n.intermediate},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,downOffset:t.down_proj}};return G(e,z.decodeDownProj,r)}function Eh(e,n){let t=cn(e,n.layer,["down_proj"]),r={resources:{hiddenT:n.hidden,q1BitsT:t.q1BitsT,q1ScalesT:t.q1ScalesT,intermediateT:n.intermediate},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,downOffset:t.offset(`layers.${n.layer}.down_proj`)}};return G(e,z.decodeDownProjQ1,r,{sourceHint:`layer=${n.layer}`})}function qh(e,n){let t=pn(e,n.layer,["gate_proj","up_proj"]),r=e.offsets.layers[n.layer],s={resources:{hiddenT:n.hidden,q4BitsT:t.q4BitsT,q4ScalesT:t.q4ScalesT,intermediateT:n.intermediate,weightsT:e.weights},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,rmsEps:Number(e.config.rms_norm_eps),normOffset:r.post_attention_layernorm,gateOffset:t.offset(`layers.${n.layer}.gate_proj`),upOffset:t.offset(`layers.${n.layer}.up_proj`),quantBits:t.quantBits,hasMin:t.hasMin}};return G(e,z.decodeGateUpNormQ4,s,{sourceHint:`layer=${n.layer}`})}function Lh(e,n){let t=pn(e,n.layer,["down_proj"]),r={resources:{hiddenT:n.hidden,q4BitsT:t.q4BitsT,q4ScalesT:t.q4ScalesT,intermediateT:n.intermediate},args:{hiddenSize:e.config.hidden_size,intermediateSize:e.config.intermediate_size,downOffset:t.offset(`layers.${n.layer}.down_proj`),quantBits:t.quantBits,hasMin:t.hasMin}};return G(e,z.decodeDownProjQ4,r,{sourceHint:`layer=${n.layer}`})}function Oh(e,n){let t=e.offsets.layers[n.layer],r={resources:{normedT:n.normed,weightsT:e.weights,qT:n.q,kT:n.k,vT:n.v},args:{hiddenSize:e.config.hidden_size,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,qOffset:t.q_proj,kOffset:t.k_proj,vOffset:t.v_proj}};return G(e,z.decodeQkv,r)}function Ch(e,n){let t=pn(e,n.layer,["q_proj","k_proj","v_proj"]),r={resources:{normedT:n.normed,q4BitsT:t.q4BitsT,q4ScalesT:t.q4ScalesT,qT:n.q,kT:n.k,vT:n.v},args:{hiddenSize:e.config.hidden_size,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,qOffset:t.offset(`layers.${n.layer}.q_proj`),kOffset:t.offset(`layers.${n.layer}.k_proj`),vOffset:t.offset(`layers.${n.layer}.v_proj`),quantBits:t.quantBits,hasMin:t.hasMin}};return G(e,z.decodeQkvQ4,r,{sourceHint:`layer=${n.layer}`})}function Ph(e,n){let t=pn(e,n.layer,["q_proj","k_proj","v_proj"]),r=e.offsets.layers[n.layer],s={resources:{hiddenT:n.hidden,q4BitsT:t.q4BitsT,q4ScalesT:t.q4ScalesT,weightsT:e.weights,qT:n.q,kT:n.k,vT:n.v},args:{hiddenSize:e.config.hidden_size,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,rmsEps:Number(e.config.rms_norm_eps),normOffset:r.input_layernorm,qOffset:t.offset(`layers.${n.layer}.q_proj`),kOffset:t.offset(`layers.${n.layer}.k_proj`),vOffset:t.offset(`layers.${n.layer}.v_proj`),quantBits:t.quantBits,hasMin:t.hasMin}};return G(e,z.decodeQkvNormQ4,s,{sourceHint:`layer=${n.layer}`})}function zh(e,n){let t=cn(e,n.layer,["q_proj","k_proj","v_proj"]),r={resources:{normedT:n.normed,q1BitsT:t.q1BitsT,q1ScalesT:t.q1ScalesT,qkvT:n.qkv},args:{hiddenSize:e.config.hidden_size,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,qOffset:t.offset(`layers.${n.layer}.q_proj`),kOffset:t.offset(`layers.${n.layer}.k_proj`),vOffset:t.offset(`layers.${n.layer}.v_proj`)}};return G(e,z.decodeQkvQ1,r,{sourceHint:`layer=${n.layer}`})}function Ah(e,n){let t=cn(e,n.layer,["q_proj","k_proj","v_proj"]),r=e.offsets.layers[n.layer],s={resources:{hiddenT:n.hidden,q1BitsT:t.q1BitsT,q1ScalesT:t.q1ScalesT,qkvT:n.qkv,weightsT:e.weights},args:{hiddenSize:e.config.hidden_size,numKvHeads:e.config.num_key_value_heads,headDim:e.config.head_dim,rmsEps:Number(e.config.rms_norm_eps),normOffset:r.input_layernorm,qOffset:t.offset(`layers.${n.layer}.q_proj`),kOffset:t.offset(`layers.${n.layer}.k_proj`),vOffset:t.offset(`layers.${n.layer}.v_proj`)}};return G(e,z.decodeQkvNormQ1,s,{sourceHint:`layer=${n.layer}`})}function Gh(e,n){if(!e.lmHeadQ8||!e.lmHeadQ8Scales)throw new Error("LlamaDecodeLmHeadQ8ArgmaxTiled requires q8 lm_head tensors");let t={resources:{normQ8T:n.scratch.normQ8,normScaleT:n.scratch.normQ8Scale,lmHeadQ8T:e.lmHeadQ8,lmHeadScalesT:e.lmHeadQ8Scales,bestValuesT:n.scratch.finalBestValues,bestIdsT:n.scratch.finalBestIds},args:{vocabSize:e.config.vocab_size,hiddenSize:e.config.hidden_size,numBlocks:256}};return G(e,z.decodeLmHeadQ8ArgmaxTiled,t)}function Ih(e,n){let t=n.numBlocks??512;if(!e.lmHeadQ4||!e.lmHeadQ4Scales)throw new Error("lmHeadQ4ArgmaxTiled requires the Q4 lm_head buffers");let r={resources:{hiddenT:n.hidden,q4BitsT:e.lmHeadQ4,q4ScalesT:e.lmHeadQ4Scales,weightsT:e.weights,bestValuesT:n.scratch.finalBestValues,bestIdsT:n.scratch.finalBestIds},args:{hiddenSize:e.config.hidden_size,vocabSize:e.config.vocab_size,lmHeadOffset:0,finalNormOffset:e.offsets.top.model_norm,numBlocks:t}};return G(e,z.decodeLmHeadQ4ArgmaxTiled,r,{sourceHint:`numBlocks=${t}`})}function Rh(e,n){let t=n.numBlocks??256,r=ct(e,["lm_head"]),s={resources:{normedT:n.normed,q1BitsT:r.q1BitsT,q1ScalesT:r.q1ScalesT,bestValuesT:n.scratch.finalBestValues,bestIdsT:n.scratch.finalBestIds},args:{hiddenSize:e.config.hidden_size,vocabSize:e.config.vocab_size,lmHeadOffset:r.offset("lm_head"),numBlocks:t}};return G(e,z.decodeLmHeadQ1ArgmaxTiled,s,{sourceHint:`numBlocks=${t}`})}function Wh(e,n){let t=n.numBlocks??256,r={resources:{hiddenT:n.hidden,weightsT:e.weights,bestValuesT:n.scratch.finalBestValues,bestIdsT:n.scratch.finalBestIds},args:{hiddenSize:e.config.hidden_size,vocabSize:e.config.vocab_size,rmsEps:Number(e.config.rms_norm_eps),finalNormOffset:e.offsets.top.model_norm,lmHeadOffset:e.offsets.top.lm_head,numBlocks:t}};return G(e,z.decodeFinalNormLmHeadArgmaxTiled,r)}function Yo(e,n){return Vo(e,e.offsets.top.model_norm,n.hidden,n.normed)}function pt(e){if(e.ropeCache)return e.ropeCache;let n=e.config.head_dim/2,t=e.config.max_position_embeddings*n,r=new Float32Array(t),s=new Float32Array(t),a=e.config.rope_parameters?.rope_theta;if(typeof a!="number")throw new Error("RoPE cache requires config.rope_parameters.rope_theta");for(let i=0;i<e.config.max_position_embeddings;++i)for(let o=0;o<n;++o){let u=1/Math.pow(a,o*2/e.config.head_dim),l=i*u,d=i*n+o;r[d]=Math.cos(l),s[d]=Math.sin(l)}return e.ropeCache={cos:e.runtime.tensorFromTypedArray("float32",[e.config.max_position_embeddings,n],r),sin:e.runtime.tensorFromTypedArray("float32",[e.config.max_position_embeddings,n],s)},e.ropeCache}async function Xo(e,{tokenId:n,cache:t,outputDtype:r,outputShape:s,outputLabel:a,outputLogits:i=!1}){let o=e.runtime.tensorFromTypedArray("uint32",[1],new Uint32Array([n])),u=e.runtime.empty(r,s,a),l={resources:{inputT:o,weightsT:e.weights,cacheKeysT:t.keyStates,cacheValuesT:t.valueStates,outputT:u},args:{...Go({config:e.config,offsets:e.offsets,maxCacheLength:t.maxLength,outputLogits:i}),pastLen:t.get_seq_length(),cacheLenArg:t.maxLength}};return await z.nextToken.run(e.runtime,l,{runOptions:{namespace:"com.xenova.llama.NextTokenMegakernel",label:"llama_next_token_megakernel"}}),u}var Sn=Ht({embed:"com.xenova.LlamaPrefillEmbed",rmsNorm:"com.xenova.LlamaPrefillRmsNorm",matmul:"com.xenova.LlamaPrefillMatmul",ropeCacheKv:"com.xenova.LlamaPrefillRopeCacheKv",attention:"com.xenova.LlamaPrefillAttention",swiglu:"com.xenova.SwiGlu",addInPlace:"com.xenova.AddInPlace"});function Jo(e){let n=e.config;if(_e(e)||xe(n)||ge(n)||qe(n))return!1;let t=e.offsets.layers;if(!t||t.length!==n.num_hidden_layers)return!1;let r=n.hidden_size,s=n.intermediate_size,a=n.num_attention_heads*n.head_dim*r,i=n.num_key_value_heads*n.head_dim*r,o=s*r;for(let u of t)if(u.q_proj===void 0||u.k_proj===void 0||u.v_proj===void 0||u.o_proj===void 0||u.gate_proj===void 0||u.up_proj===void 0||u.down_proj===void 0||u.input_layernorm===void 0||u.post_attention_layernorm===void 0||u.k_proj!==u.q_proj+a||u.v_proj!==u.k_proj+i||u.up_proj!==u.gate_proj+o)return!1;return!0}function Mh(e,n){let t=e.config,r=t.hidden_size,s=t.intermediate_size,a=(t.num_attention_heads+2*t.num_key_value_heads)*t.head_dim,i=e.weights.dtype;return{hidden:e.runtime.empty(i,[n,r],"llama-prefill-hidden"),normed:e.runtime.empty(i,[n,r],"llama-prefill-normed"),qkv:e.runtime.empty(i,[n,a],"llama-prefill-qkv"),attn:e.runtime.empty(i,[n,r],"llama-prefill-attn"),mlp:e.runtime.empty(i,[n,2*s],"llama-prefill-mlp"),inter:e.runtime.empty(i,[n,s],"llama-prefill-inter")}}function Bh(e){let n=new Float32Array(1);return n[0]=e,new Uint32Array(n.buffer)[0]}var eu=64;async function Nh(e,n,t){let r=t.prefillReplay,s=t.preparedChunks.get("prefill");if(r&&s)return{meta:r,prepared:s};let a=e.runtime,i=e.config,o=i.hidden_size,u=i.intermediate_size,l=i.num_attention_heads,d=i.num_key_value_heads,c=i.head_dim,p=(l+2*d)*c,f=eu,h=n.maxLength,m=Bh(Number(i.rms_norm_eps)),g=Ms(e),w=kn(i),T=pt(e),x=e.offsets.layers,q=(_,b)=>Math.ceil(_/b),k=Mh(e,f),B=a.empty("uint32",[f],"llama-prefill-tokens"),V=[],S=_=>{let b=a.createUniformU32(_);return V.push(b),b},H=S([0,h,f,0]),ae=[],ie=(_,b,v,A)=>{ae.push(G(e,_,{resources:b,args:v},{sourceHint:A}))},U=(_,b,v,A,me)=>ie(Sn.matmul,{aT:_,weightsT:e.weights,yT:v,params:S([b,f,A,me])},{weightOffset:b,M:f,inFeatures:A,outFeatures:me},`matmul-${A}-${me}`),fe=(_,b,v)=>ie(Sn.rmsNorm,{xT:_,weightsT:e.weights,yT:v,params:S([b,f,m,0])},{normOffset:b,rows:f,dim:o,eps:Number(i.rms_norm_eps)},"rmsNorm"),I=Math.min(q(f*o,64),1024),te=(_,b)=>ie(Sn.addInPlace,{yT:_,xT:b,params:S([f*o,I,0,0])},{count:f*o},"addInPlace");ie(Sn.embed,{tokensT:B,weightsT:e.weights,hiddenT:k.hidden,params:S([e.offsets.top.embed_tokens,f,0,0])},{embedOffset:e.offsets.top.embed_tokens,hiddenSize:o,seqLen:f},"embed");for(let _=0;_<i.num_hidden_layers;++_){let b=x[_],v=dn(e,n,_);fe(k.hidden,b.input_layernorm,k.normed),U(k.normed,b.q_proj,k.qkv,o,p),ie(Sn.ropeCacheKv,{qkvT:k.qkv,cacheKeysT:v.cacheKeysT,cacheValuesT:v.cacheValuesT,cosT:T.cos,sinT:T.sin,params:H},{layer:0,cacheLen:h,pastLen:0,seqLen:f,numHeads:l,numKvHeads:d,headDim:c},"ropeCacheKv"),ie(Sn.attention,{qkvT:k.qkv,cacheKeysT:v.cacheKeysT,cacheValuesT:v.cacheValuesT,attnT:k.attn,params:H},{layer:0,cacheLen:h,pastLen:0,seqLen:f,numHeads:l,numKvHeads:d,headDim:c,scale:g,workgroupSize:w},"attention"),U(k.attn,b.o_proj,k.normed,o,o),te(k.hidden,k.normed),fe(k.hidden,b.post_attention_layernorm,k.normed),U(k.normed,b.gate_proj,k.mlp,o,2*u),ie(Sn.swiglu,{xT:k.mlp,yT:k.inter,params:S([f,0,0,0])},{rows:f,mlpInner:u},"swiglu"),U(k.inter,b.down_proj,k.normed,u,o),te(k.hidden,k.normed)}let ye=await a.prepareProgramSequence(ae),O={tokens:B,pastLenU:H,cacheLen:h,buffers:k,uniforms:V};return t.prefillReplay=O,t.preparedChunks.set("prefill",ye),{meta:O,prepared:ye}}async function nu(e,{tokenIds:n,count:t,cache:r,scratch:s}){let{meta:a,prepared:i}=await Nh(e,r,s),o=e.runtime,u=eu,l=r.get_seq_length(),d=Math.ceil(t/u),c=new Uint32Array(u);for(let p=0;p<d;++p){let f=p*u,h=Math.min(u,t-f);c.fill(0);for(let m=0;m<h;++m)c[m]=n[f+m];o.host.writeBuffer(a.tokens.buffer,0,c),o.host.writeBuffer(a.pastLenU,0,new Uint32Array([l+f,a.cacheLen,u,0])),o.enqueuePreparedProgramSequence(i)}r.advance(t)}sn();we();var Hh=32,Uh=2048;function Fh(){return{}}function Kh(e,n){return{device:e,recordSupportOp:n,empty:(t,r)=>be(t,r),tensorFromTypedArray:(t,r)=>be(t,r),createUniformU32:()=>Fh(),host:{writeBuffer:()=>{}}}}function Vh(e,n,t){let r=Re(),s=Re(),a=new Set,i=0;for(let l of e){if(!n(l))continue;let d=l.length/Hh;Te(r,l.id,i),Te(s,l.id,d),a.add(l.id),i+=d}let o=Re(),u=0;for(let l of e)if(!a.has(l.id)){if(l.id==="lm_head"&&t){Te(o,l.id,o.top.embed_tokens??0);continue}Te(o,l.id,u),u+=l.length}return{offsets:o,q4Offsets:r,q4BlockCounts:s,totalBlocks:i,denseElements:u}}function $h({config:e,entries:n,isPacked:t=()=>!1,packedQuantBits:r=4,tieWordEmbeddings:s,canUseFloat16:a=vn,canUseQ8LmHead:i=zn,canUseQ4LmHead:o=Ps,descriptors:u,device:l}){let d=Ee(l),c=d.features.has("shader-f16"),p=c&&a(e),f=p?"float16":"float32",h=p?"float16":"float32",m=c?"float16":"float32",g=p&&o(e),w=p&&!g&&i(e),{offsets:T,q4Offsets:x,q4BlockCounts:q,totalBlocks:k,denseElements:B}=Vh(n,t,s),V=[],S=Kh(d,(A,me)=>V.push({op:A,request:me})),H=be(f,[Math.max(1,B)]),ae=k>0?be("uint32",[k*r]):null,ie=k>0?be(m,[k]):null,U=g?be("uint32",[e.vocab_size*(e.hidden_size/32)*4]):null,fe=g?be(m,[e.vocab_size*(e.hidden_size/32)]):null,I=w?be("uint32",[e.vocab_size*(e.hidden_size/4)]):null,te=w?be("float32",[e.vocab_size]):null,ye={runtime:S,config:e,weights:H,offsets:T,q4Bits:ae,q4Scales:ie,q4Offsets:x,q4BlockCounts:q,packedQuantBits:r,q1Bits:null,q1Scales:null,q1Offsets:null,q1BlockCounts:null,lmHeadQ4:U,lmHeadQ4Scales:fe,lmHeadQ8:I,lmHeadQ8Scales:te,cacheDtype:h,programCache:new Map,defaultPositionIdsCache:new Map,ropeCache:{cos:be("float32",[e.max_position_embeddings,e.head_dim>>1]),sin:be("float32",[e.max_position_embeddings,e.head_dim>>1])},qwen35RopeCache:null,createGenerationScratch:()=>u.createGenerationScratch(ye)},O=We.allocate(S,e,1,Uh,h),_=ye.createGenerationScratch();de(ye,"embed",{input:_.input,hidden:_.hidden,params:_.params});for(let A=0;A<e.num_hidden_layers;++A)u.decodeLayerDescriptors(ye,{layer:A,cache:O,scratch:_,params:_.params,hidden:_.hidden});u.finalDescriptors(ye,{hidden:_.hidden,scratch:_,output:be("uint32",[1])});let b=V.map(({op:A,request:me})=>({op:A,request:me,id:A.manifest.id})),v=[{name:"weights",dtype:f,shape:H.shape,boundWhole:!0}];return ae&&v.push({name:"q4Bits",dtype:ae.dtype,shape:ae.shape}),ie&&v.push({name:"q4Scales",dtype:ie.dtype,shape:ie.shape}),U&&v.push({name:"lmHeadQ4",dtype:U.dtype,shape:U.shape,boundWhole:!0}),fe&&v.push({name:"lmHeadQ4Scales",dtype:fe.dtype,shape:fe.shape,boundWhole:!0}),I&&v.push({name:"lmHeadQ8",dtype:I.dtype,shape:I.shape,boundWhole:!0}),te&&v.push({name:"lmHeadQ8Scales",dtype:te.dtype,shape:te.shape,boundWhole:!0}),{opRequests:b,tensors:v}}function dr({config:e,device:n,...t}){return Rs($h({config:e,device:n,...t}),n)}var ft=class{#n=!1;#e;constructor(n){this.#e=n}get config(){return this.#e.config}async checkDeviceSupport(n){return await this.#e.checkSupport(n)}async unsupportedReason(n){return(await this.#e.checkSupport(n)).reason}async load(n,t={}){if(this.#n)throw new Error("prepared model has already been loaded or closed");this.#n=!0;try{let r=(await this.#e.checkSupport(n.device)).reason;if(r)throw new Error(r);return await this.#e.loadWeights(n,t)}finally{await this.#e.closeSource()}}async close(){this.#n||(this.#n=!0,await this.#e.closeSource())}};function tu(e){return new ft({...e,closeSource:e.closeSource??(async()=>{})})}function cr(e,n){return n instanceof e.ConfigClass?n:new e.ConfigClass(n)}function ru(e,n,t,r,s,a){let i=e.DECODE_DESCRIPTORS,o=ut(r,s);return tu({config:t,checkSupport:u=>dr({config:t,device:u,entries:r,descriptors:i,tieWordEmbeddings:o}),loadWeights:async u=>new e({runtime:u,config:t,...await a(u)})}).load(n)}function su(e,n,t,r){let s=cr(e,t),{weights:a,offsets:i}=qo({runtime:n,entries:e.expectedWeightEntries(s),stateDict:r,tieWordEmbeddings:s.tie_word_embeddings,modelName:e.MODEL_NAME});return new e({runtime:n,config:s,weights:a,offsets:i})}async function au(e,n,t){let{readFile:r}=await Promise.resolve().then(()=>(nt(),et)),{join:s}=await Promise.resolve().then(()=>(Os(),Ls)),a=new e.ConfigClass(JSON.parse(await r(s(t,"config.json"),"utf8"))),i=e.expectedWeightEntries(a),o=await wo(t,{modelName:e.MODEL_NAME});return ru(e,n,a,i,u=>o.has(u),u=>lt({runtime:u,config:a,reader:o,entries:i,canUseFloat16:vn,canUseQ8LmHead:zn,modelName:e.MODEL_NAME}))}async function Bs(e,n,{config:t,safeTensors:r,onProgress:s}){let a=cr(e,t),i=e.expectedWeightEntries(a);return ru(e,n,a,i,o=>r.has(o),o=>Lo({runtime:o,config:a,safeTensors:r,entries:i,canUseFloat16:vn,canUseQ8LmHead:zn,modelName:e.MODEL_NAME,onProgress:s}))}function iu(e,n,{config:t,lazySafeTensors:r,onProgress:s}){return Bs(e,n,{config:t,safeTensors:r,onProgress:s})}we();var Ns=2,ht=32;function Hs(e,n){if(typeof e!="number"||!Number.isInteger(e)||e<0)throw new Error(`${n} requires a non-negative integer max_new_tokens`)}function Us(e,n){if(e)throw new Error(`${n} V1 only supports greedy decoding`)}function Fs(e){if(typeof e!="number"||!Number.isInteger(e)||e<1||e>ht)throw new Error(`decode_chunk_size must be an integer in [1, ${ht}]`)}function pr(e,n,t,r){if(!(e instanceof We))throw new Error("past_key_values must be a LlamaDynamicCache");if(e.runtime!==n)throw new Error("past_key_values does not belong to this runtime");if(e.batchSize!==r)throw new Error(`past_key_values batch size ${e.batchSize} does not match input batch size ${r}`);let s=[t.num_hidden_layers,r,e.maxLength,t.num_key_value_heads,t.head_dim];if(mt(e.keyStates,s,"past_key_values.keyStates"),mt(e.valueStates,s,"past_key_values.valueStates"),ge(t)&&mt(e.convStates,[t.num_hidden_layers*r*t.hidden_size*ue(t.conv_L_cache,"config.conv_L_cache")],"past_key_values.convStates"),qe(t)){if(!Array.isArray(e.linearConvStates)||!Array.isArray(e.linearRecurrentStates))throw new Error("past_key_values linear attention states are required");let a=Yt(t);for(let i=0;i<t.num_hidden_layers;++i)a[i]==="linear_attention"&&(mt(e.linearConvStates[i],[r,ue(t.linear_conv_dim,"config.linear_conv_dim"),ue(t.linear_conv_kernel_dim,"config.linear_conv_kernel_dim")-1],`past_key_values.linearConvStates[${i}]`),mt(e.linearRecurrentStates[i],[r,ue(t.linear_num_value_heads,"config.linear_num_value_heads"),ue(t.linear_key_head_dim,"config.linear_key_head_dim"),ue(t.linear_value_head_dim,"config.linear_value_head_dim")],`past_key_values.linearRecurrentStates[${i}]`))}}function mt(e,n,t){if(!Ve(e)||e.dtype!=="float32"&&e.dtype!=="float16")throw new Error(`${t} must be a float32 or float16 WebGpuTensor`);if(e.shape.length!==n.length||e.shape.some((r,s)=>r!==n[s]))throw new Error(`${t} shape [${e.shape}] does not match expected [${n}]`)}function Ks(e,n,t){let r=0,s=e[n];for(let a=1;a<t;++a){let i=e[n+a];i>s&&(s=i,r=a)}return r}var Vs=2,fr=Vs+1;function mr(e,n){return{cache:We.allocate(e.runtime,e.config,1,n,e.cacheDtype),scratch:fn(e.config)?e.createGenerationScratch():null}}function hr(e){let{runtime:n,config:t}=e,r=t.num_key_value_heads*t.head_dim,s=n.device.features.has("shader-f16"),a=_e(e)&&s,o=s&&(e.weights.dtype==="float16"||a)?"float16":"float32",u=_e(e)&&n.device.features.has("shader-f16")?"float16":"float32",l=ge(t)?t.num_hidden_layers*t.hidden_size*ue(t.conv_L_cache,"config.conv_L_cache"):0;return{input:n.tensorFromTypedArray("uint32",[1],new Uint32Array([0])),hidden:n.empty("float32",[t.hidden_size],"llama-hidden"),normed:n.empty(u,[t.hidden_size],"llama-normed"),qkv:n.empty("float32",[t.hidden_size+2*r],"llama-qkv-packed"),q:n.empty("float32",[t.hidden_size],"llama-q"),k:n.empty("float32",[r],"llama-k"),v:n.empty("float32",[r],"llama-v"),attn:n.empty("float32",[t.hidden_size],"llama-attn"),attnSplitOut:n.empty("float32",[Ye*t.num_attention_heads*t.head_dim],"llama-attn-split-out"),attnSplitMeta:n.empty("float32",[Ye*t.num_attention_heads*2],"llama-attn-split-meta"),intermediate:n.empty(o,[t.intermediate_size],"llama-intermediate"),convProj:ge(t)?n.empty("float32",[3*t.hidden_size],"llama-conv-proj"):null,logits:n.empty("float32",[t.vocab_size],"llama-next-token-logits-scratch"),normQ8:n.empty("uint32",[t.hidden_size/4],"llama-final-norm-q8"),normQ8Scale:n.empty("float32",[1],"llama-final-norm-q8-scale"),finalBestValues:n.empty("float32",[1024],"llama-final-best-values"),finalBestIds:n.empty("uint32",[1024],"llama-final-best-ids"),nextToken:n.empty("uint32",[1],"llama-next-token"),tokens:n.empty("uint32",[ht+1],"llama-decode-chunk-tokens"),params:n.createUniformU32([0,0,0,0],"llama-layered-params"),chunkParamLanes:Array.from({length:fr},(d,c)=>Array.from({length:ht},(p,f)=>n.createUniformU32([0,0,0,0],`llama-chunk-params-l${c}-${f}`))),convSnapshots:l>0?n.empty("float32",[fr,l],"llama-conv-snapshots"):null,convSnapshotByteStride:l*4,preparedChunks:new Map}}function gr(e){e&&(e.preparedChunks.clear(),J(e))}function fn(e){return qe(e)||e.hidden_size>128||e.num_hidden_layers>4||e.vocab_size>4096}function _r(e){let{config:n,runtime:t,cacheDtype:r}=e;if(!fn(n))return n.max_position_embeddings;let s=t.device.limits;if(!s)return n.max_position_embeddings;let a=ue(s.maxComputeWorkgroupStorageSize,"limits.maxComputeWorkgroupStorageSize"),i=kn(n)*4,u=Math.floor((a-i)/4),l=typeof s.maxStorageBufferBindingSize=="number"?s.maxStorageBufferBindingSize:1/0,d=r==="float16"?2:4,c=n.num_hidden_layers*n.num_key_value_heads*n.head_dim,p=Number.isFinite(l)?Math.max(1,Math.floor(l/(c*d))):n.max_position_embeddings,f=qe(n)?4096:n.max_position_embeddings;return Math.max(1,Math.min(n.max_position_embeddings,u,p,f))}function ou(e,n){return Le(e,n)}function uu(e,{hidden:n,scratch:t,output:r,outputOffset:s=0}){return e.lmHeadQ4&&e.lmHeadQ4Scales?[de(e,"lmHeadQ4ArgmaxTiled",{hidden:n,scratch:t,numBlocks:512}),pe(e,"argmaxReduce",{outputOffset:s,scratch:t,output:r,inputCount:512})]:e.lmHeadQ8&&e.lmHeadQ8Scales?[pe(e,"finalNormQuantizeQ8",{hidden:n,scratch:t}),de(e,"lmHeadQ8ArgmaxTiled",{scratch:t}),pe(e,"argmaxReduce",{outputOffset:s,scratch:t,output:r})]:_e(e)?[Yo(e,{hidden:n,normed:t.normed}),de(e,"lmHeadQ1ArgmaxTiled",{normed:t.normed,scratch:t,numBlocks:512}),pe(e,"argmaxReduce",{outputOffset:s,scratch:t,output:r,inputCount:512})]:[de(e,"finalNormLmHeadArgmaxTiled",{hidden:n,scratch:t}),pe(e,"argmaxReduce",{outputOffset:s,scratch:t,output:r})]}function lu(e,{layer:n,cache:t,scratch:r,params:s,hidden:a}){return[...or(e.config,n)==="conv"?Zh(e,{layer:n,cache:t,scratch:r,params:s,hidden:a}):jh(e,{layer:n,cache:t,scratch:r,params:s,hidden:a}),de(e,"gateUpNorm",{layer:n,hidden:a,intermediate:r.intermediate}),de(e,"downProj",{layer:n,hidden:a,intermediate:r.intermediate})]}function jh(e,{layer:n,cache:t,scratch:r,params:s,hidden:a}){let i=du(e,n),o=pt(e),u=_e(e)&&xe(e.config),l=!_e(e)&&!xe(e.config),d=!_e(e)&&xe(e.config)&&ou(e,`layers.${n}.q_proj`),c=u||l||d,f=!c?[Ws(e,{normOffset:i.input_layernorm,hidden:a,normed:r.normed})]:[],h=u?[c?de(e,"qkvNorm",{layer:n,hidden:a,qkv:r.qkv}):de(e,"qkv",{layer:n,normed:r.normed,qkv:r.qkv}),pe(e,"qkNormRopeCacheKvPacked",{layer:n,cache:t,qkv:r.qkv,ropeCache:o,params:s})]:xe(e.config)?[d?de(e,"qkvNorm",{layer:n,hidden:a,q:r.q,k:r.k,v:r.v}):de(e,"qkv",{layer:n,normed:r.normed,q:r.q,k:r.k,v:r.v}),pe(e,"qkNormRopeCacheKv",{layer:n,cache:t,q:r.q,k:r.k,v:r.v,ropeCache:o,params:s})]:[c?pe(e,"qkvRopeCacheNorm",{layer:n,cache:t,hidden:a,q:r.q,ropeCache:o,params:s}):pe(e,"qkvRopeCache",{layer:n,cache:t,normed:r.normed,q:r.q,ropeCache:o,params:s})];return[...f,...h,...Qh(e,{layer:n,cache:t,scratch:r,params:s,q:u?r.qkv:r.q}),de(e,"oProj",{layer:n,offset:i.o_proj,weightId:"o_proj",hidden:a,attn:r.attn})]}function Qh(e,{layer:n,cache:t,scratch:r,params:s,q:a=r.q}){if(!An(e.config))return[pe(e,"attention",{layer:n,cache:t,workgroupSize:kn(e.config),q:a,attn:r.attn,params:s})];let i=e.config.head_dim===128?64:ir(e.config);return[pe(e,"attentionSplitK",{layer:n,cache:t,workgroupSize:i,tileSize:16,q:a,splitOut:r.attnSplitOut,splitMeta:r.attnSplitMeta,params:s}),pe(e,"attentionSplitKMerge",{splitOut:r.attnSplitOut,splitMeta:r.attnSplitMeta,attn:r.attn})]}function Zh(e,{layer:n,cache:t,scratch:r,params:s,hidden:a}){let i=du(e,n);if(!t.convStates)throw new Error("conv cache state is required for LFM2 conv layers");return[...ou(e,`layers.${n}.conv_in_proj`)?[pe(e,"convInProjNorm",{layer:n,hidden:a,scratch:r}),pe(e,"convDepthwise",{layer:n,cache:t,scratch:r,attn:r.attn})]:[Ws(e,{normOffset:i.input_layernorm,hidden:a,normed:r.normed}),pe(e,"convInUpdate",{layer:n,cache:t,normed:r.normed,attn:r.attn,params:s})],de(e,"oProj",{layer:n,offset:i.conv_out_proj,weightId:"conv_out_proj",hidden:a,attn:r.attn})]}function du(e,n){let t=e.offsets.layers?.[n];if(!t)throw new Error(`Missing offsets for layer ${n}`);return t}we();ls();var Yh=new Set(["intermediate","output"]),yr=class{tensors=[];nodes=[];aliases=[];boundNames=new Map;ops=new Map;input(n,t,r){return this.declareTensor("input",n,t,r)}weight(n,t,r){return this.declareTensor("weight",n,t,r)}state(n,t,r){return this.declareTensor("state",n,t,r)}stepInput(n,t,r){return this.declareTensor("stepInput",n,t,r)}uniform(n,t){if(t<=0||t%4!==0)throw new Error(`graph uniform "${n}" needs a positive multiple-of-4 byte length (got ${t})`);return this.declareTensor("uniform",n,"uint32",[t/4])}scratch(n,t,r){return this.declareTensor("intermediate",n,t,r)}op(n,t,r={}){let s=this.opFor(n),a={},i={};for(let[d,c]of Object.entries(t))if(c!==void 0){if(!Xh(c))throw new Error(`${n}: binding "${d}" is not a graph tensor \u2014 scalars belong in options.args`);a[d]=c,i[d]=c.id}let o=s.inferOutputs(a,{args:r.args,attrs:r.attrs}),u={},l={};for(let[d,c]of Object.entries(o)){let p=t[d],f=c.dtype;if(p!==void 0){if(!Jh(p.shape,c.shape))throw new Error(`${n}: output "${d}" bound to tensor "${p.name}" of shape [${p.shape}] but the manifest infers [${c.shape}]`);u[d]=p,l[d]=p.id;continue}let h=this.allocate("intermediate",`${n.split(".").pop()}.${d}#${this.nodes.length}`,f,c.shape);u[d]=h,l[d]=h.id}return this.nodes.push({op:n,inputs:i,outputs:l,...r.args?{args:{...r.args}}:{},...r.attrs?{attrs:{...r.attrs}}:{}}),u}alias(n,t){if(n.id===t.id)throw new Error(`alias: a tensor cannot alias itself ("${n.name}")`);for(let[a,i]of[["from",n],["to",t]])if(!Yh.has(i.kind))throw new Error(`alias: ${a} tensor "${i.name}" is ${i.kind}; only intermediate/output tensors can share a buffer`);if(n.dtype!==t.dtype)throw new Error(`alias("${n.name}","${t.name}"): dtype mismatch (${n.dtype} vs ${t.dtype})`);let r=Y(n.shape)*se(n.dtype),s=Y(t.shape)*se(t.dtype);if(r!==s)throw new Error(`alias("${n.name}","${t.name}"): byte-length mismatch (${r} vs ${s}); a shared buffer needs an exact-size fit`);this.aliases.push({from:n.id,to:t.id})}output(n,t){let r={...n,kind:"output",name:t??n.name};return this.tensors[n.id]=r,r}finish(n){return Object.freeze({name:n.name,params:Object.freeze({...n.params??{}}),tensors:Object.freeze([...this.tensors]),nodes:Object.freeze([...this.nodes]),...this.aliases.length>0?{aliases:Object.freeze([...this.aliases])}:{}})}opFor(n){let t=this.ops.get(n);return t||(t=je(n),this.ops.set(n,t)),t}declareTensor(n,t,r,s){let a=this.boundNames.get(t);if(a)throw new Error(`graph tensor name "${t}" already declared (${a.kind})`);let i=this.allocate(n,t,r,s);return this.boundNames.set(t,i),i}allocate(n,t,r,s){if(!s.every(i=>Number.isInteger(i)&&i>=0))throw new Error(`graph tensor "${t}" has a non-integer shape [${s}]`);let a={id:this.tensors.length,kind:n,dtype:r,shape:[...s],name:t};return this.tensors.push(a),a}};function Xh(e){return e!==null&&typeof e=="object"&&typeof e.id=="number"&&typeof e.dtype=="string"&&Array.isArray(e.shape)}function Jh(e,n){return e.length===n.length&&e.every((t,r)=>t===n[r])}sn();we();we();function cu(e){let n=new Map;for(let h of e.tensors)n.set(h.id,h);let t=new Map;for(let h of e.tensors)h.kind==="intermediate"&&t.set(h.id,h);let r=new Map,s=new Map,a=eg(e,n,r,s),i=new Map,o=new Map,u=new Map;e.nodes.forEach((h,m)=>{for(let g of Object.values(h.inputs))t.has(g)&&(o.has(g)||o.set(g,m),u.set(g,m));for(let g of Object.values(h.outputs))t.has(g)&&(i.has(g)||i.set(g,m),u.set(g,m))});let l=[],d=0,c=new Map;for(let h of t.values()){d+=xn(h);let m=i.get(h.id),g=o.get(h.id);if(m===void 0&&g!==void 0)throw new Error(`graph "${e.name}": intermediate "${h.name}" (id ${h.id}) is read by node ${g} but no node produces it`);if(a.has(h.id))continue;if(m===void 0){l.push(h.name);continue}if(g!==void 0&&g<m)throw new Error(`graph "${e.name}": intermediate "${h.name}" (id ${h.id}) is read by node ${g} before it is produced by node ${m}; pooling cannot order that lifetime`);let w=u.get(h.id),T=c.get(w);T?T.push(h.id):c.set(w,[h.id])}let p=new Map;for(let h=0;h<e.nodes.length;++h){let m=c.get(h-1);if(m)for(let g of m){let w=r.get(g),T=s.get(w),x=p.get(T);x?x.push(w):p.set(T,[w])}for(let g of Object.values(e.nodes[h].outputs)){let w=t.get(g);if(!w||r.has(g))continue;let T=xn(w),x=p.get(T)?.pop()??pu(s,T);r.set(g,x)}}let f=0;for(let h of s.values())f+=h;return{slots:r,slotByteLengths:s,diagnostics:{intermediateCount:t.size,slotCount:s.size,naiveBytes:d,pooledBytes:f,deadTensors:l}}}function pu(e,n){let t=e.size;return e.set(t,n),t}function eg(e,n,t,r){let s=new Set,a=e.aliases??[];if(a.length===0)return s;let i=new Map,o=d=>{let c=d;for(;i.get(c)!==c;)c=i.get(c);let p=d;for(;i.get(p)!==c;){let f=i.get(p);i.set(p,c),p=f}return c},u=d=>{i.has(d)||i.set(d,d)};for(let{from:d,to:c}of a){for(let[p,f]of[["from",d],["to",c]]){let h=n.get(f);if(!h)throw new Error(`graph "${e.name}": alias ${p} tensor id ${f} does not exist`);if(h.kind!=="intermediate"&&h.kind!=="output")throw new Error(`graph "${e.name}": alias ${p} tensor "${h.name}" is ${h.kind}; only intermediate/output tensors can share a buffer`)}u(d),u(c),i.set(o(d),o(c))}let l=new Map;for(let d of i.keys()){let c=o(d),p=l.get(c);p?p.push(d):l.set(c,[d])}for(let d of l.values()){let c=n.get(d[0]);for(let f of d){let h=n.get(f);if(h.dtype!==c.dtype)throw new Error(`graph "${e.name}": aliased tensors "${c.name}" (${c.dtype}) and "${h.name}" (${h.dtype}) must be the same dtype to share a buffer`);if(xn(h)!==xn(c))throw new Error(`graph "${e.name}": aliased tensors "${c.name}" (${xn(c)} B) and "${h.name}" (${xn(h)} B) must be the same byte length to share a buffer`)}let p=pu(r,xn(c));for(let f of d)t.set(f,p),s.add(f)}return s}function xn(e){return Y(e.shape)*se(e.dtype)}sn();var br=class{programs=[];cleanups=[];rt;timing;collectMs=0;flushMs=0;constructor(n,t={}){this.rt=n,this.timing=t.timing===!0}capture=null;attnUniforms=[];cacheUniforms=[];knormUniforms=[];vcacheUniforms=[];captureNext(n){this.capture=n}add(n,t){if(lr(this.rt,n,t))return;let r=this.timing?performance.now():0,s=n.prepare(this.rt,t),a=jn(this.rt,s),i=this.capture;this.capture=null;for(let o of a.programs)if(this.programs.push(o),i){let u=o.bindings.find(l=>l.type==="uniform");u?.buffer&&(i==="attn"?this.attnUniforms:i==="cache"?this.cacheUniforms:i==="knorm"?this.knormUniforms:this.vcacheUniforms).push(u.buffer)}this.cleanups.push(a.cleanup),this.timing&&(this.collectMs+=performance.now()-r)}async buildSteps(){return this.rt.prepareProgramSequence(this.programs)}enqueue(n){this.rt.enqueuePreparedProgramSequence(n)}disposeBuild(){for(let n of this.cleanups)n();this.programs=[],this.cleanups=[]}async flush(n=!0){if(this.programs.length===0)return;let t=this.timing?performance.now():0;await this.rt.runProgramSequence(this.programs,{wait:n}),this.timing&&(this.flushMs+=performance.now()-t);for(let r of this.cleanups)r();this.programs=[],this.cleanups=[]}};function fu(e,n,t={},r={}){let s=r.pooling!==!1,a=cu(e),i=s?{plan:a,slotTensors:new Map}:null,o=new Map,u=new Map,l=new Map,d=new Map,c=[],p=[];for(let g of e.tensors){if(g.kind==="uniform"){let T=n.createUniformU32(new Uint32Array(Y(g.shape)),`graph-uniform-${g.name}`);p.push(T),l.set(g.id,T),d.set(g.name,T);continue}let w=ng(g,n,t,c,i);w!==null&&(o.set(g.id,w),g.kind!=="intermediate"&&u.set(g.name,w))}let f=new br(n),h=new Map;for(let g of e.nodes){let w=h.get(g.op);w||(w=je(g.op),h.set(g.op,w));let T={};for(let[x,q]of Object.entries(g.inputs))T[x]=o.get(q)??l.get(q);for(let[x,q]of Object.entries(g.outputs))T[x]=o.get(q);try{f.add(w,{resources:T,...g.args?{args:{...g.args}}:{},...g.attrs?{attrs:{...g.attrs}}:{}})}catch(x){let q=Object.entries(T).map(([k,B])=>`${k}=[${B?.shape??"?"}]`).join(" ");throw new Error(`graph node ${g.op} (args ${JSON.stringify(g.args??{})}; ${q}): ${x.message}`,{cause:x})}}let m=s?a.diagnostics:{...a.diagnostics,slotCount:a.diagnostics.intermediateCount,pooledBytes:a.diagnostics.naiveBytes};return{collector:f,tensors:o,allocation:m,tensor(g){let w=u.get(g);if(!w)throw new Error(`graph "${e.name}" has no bound tensor named "${g}"`);return w},uniformBuffer(g){let w=d.get(g);if(!w)throw new Error(`graph "${e.name}" has no uniform named "${g}"`);return w},async runEager(){await f.flush(!0)},buildSteps(){return f.buildSteps()},dispose(){f.disposeBuild();for(let g of c){let w=g.destroy;typeof w=="function"&&w.call(g)}c.length=0;for(let g of p)g.destroy?.();p.length=0}}}function ng(e,n,t,r,s){if(s){let i=s.plan.slots.get(e.id);if(i!==void 0){let o=s.slotTensors.get(i);return o||(o=n.empty(e.dtype,e.shape,`graph-slot-${i}`),r.push(o),s.slotTensors.set(i,o)),tg(o,e,s.plan.slotByteLengths.get(i))}if(e.kind==="intermediate")return null}switch(e.kind){case"weight":case"state":{let o=(e.kind==="weight"?t.weights:t.states)?.[e.name];if(!o)throw new Error(`graph ${e.kind} "${e.name}" has no binding`);return o}case"input":{let i=t.inputs?.[e.name];if(i===void 0)throw new Error(`graph input "${e.name}" has no binding`);if(rg(i))return i;let o=n.tensorFromTypedArray(e.dtype,e.shape,i);return r.push(o),o}case"intermediate":case"stepInput":case"output":break}let a=n.empty(e.dtype,e.shape,`graph-${e.name}`);return r.push(a),a}function tg(e,n,t){let r=Y(n.shape),s=r*se(n.dtype);if(s!==t)throw new Error(`graph tensor "${n.name}" (${s} bytes) does not exactly fit slot of ${t} bytes`);return{runtime:e.runtime,dtype:n.dtype,shape:n.shape,size:r,byteLength:s,buffer:e.buffer}}function rg(e){return e!==null&&typeof e=="object"&&"buffer"in e&&"shape"in e}var sg=256,ag=256;function ig(e){let n=e.config;if(qe(n))throw new Error("emitLlamaDecode: linear-attention layers not yet supported (Qwen3.5 stage)");if(_e(e)&&ge(n))throw new Error("emitLlamaDecode: Q1 conv layers not yet supported");if(_e(e)&&!xe(n))throw new Error("emitLlamaDecode: Q1 without qk-norm not yet supported (the packed path needs qk-norm)");if(e.lmHeadQ8)throw new Error("emitLlamaDecode: Q8 lm_head not yet supported (use Q4 or dense)");if(!An(n))throw new Error("emitLlamaDecode: single-pass (non-flash) attention not yet supported")}var og=e=>Number(Math.pow(e,-.5).toPrecision(9));function ug(e,n,t){ig(e);let r=e.config,s=xe(r),a=_e(e),i=r.hidden_size,o=r.num_hidden_layers,u=r.num_attention_heads,l=r.num_key_value_heads,d=r.head_dim,c=l*d,p=ge(r)?ue(r.conv_L_cache,"config.conv_L_cache"):0,f=r.intermediate_size,h=r.vocab_size,m=Number(r.rms_norm_eps),g=n.maxLength,w=og(d),T=d===128?64:ir(r),x=pt(e),q=e.offsets.top,k=e.runtime.device.features.has("shader-f16"),B=k&&(e.weights.dtype==="float16"||a)?"float16":"float32",V=a&&k?"float16":"float32",S=new yr,H={},ae={},ie=new Map,U=(D,L)=>{let F=ie.get(D);if(F)return F;H[D]=L;let N=S.weight(D,L.dtype,L.shape);return ie.set(D,N),N},fe=(D,L)=>(ae[D]=L,S.state(D,L.dtype,L.shape)),I=U("weights",e.weights),te=U("rope.cos",x.cos),ye=U("rope.sin",x.sin),O=S.uniform("params",16),_=(D,L,F)=>{let N=pn(e,D,L);return{bitsT:U(`L${D}.q4bits.${F}`,N.q4BitsT),scalesT:U(`L${D}.q4scales.${F}`,N.q4ScalesT),offset:M=>N.offset(M),quantBits:N.quantBits,hasMin:N.hasMin}},b=(D,L,F)=>{let N=cn(e,D,L);return{bitsT:U(`L${D}.q1bits.${F}`,N.q1BitsT),scalesT:U(`L${D}.q1scales.${F}`,N.q1ScalesT),offset:M=>N.offset(M)}},v=(D,L,F,N)=>{let M=`layers.${L}.${F}`;if(a){let Q=b(L,[F],`o.${F}`);return S.op("com.xenova.LlamaDecodeOProjQ1",{hiddenT:D,q1BitsT:Q.bitsT,q1ScalesT:Q.scalesT,attnT:N},{args:{hiddenSize:i,oOffset:Q.offset(M)}}).hiddenT}if(Le(e,M)){let Q=_(L,[F],`o.${F}`);return S.op("com.xenova.LlamaDecodeOProjQ4",{hiddenT:D,q4BitsT:Q.bitsT,q4ScalesT:Q.scalesT,attnT:N},{args:{hiddenSize:i,oOffset:Q.offset(M),quantBits:Q.quantBits,hasMin:Q.hasMin}}).hiddenT}return S.op("com.xenova.LlamaDecodeOProj",{hiddenT:D,weightsT:I,attnT:N},{args:{hiddenSize:i,oOffset:e.offsets.layers[L][F]}}).hiddenT},A=(D,L)=>{let F=e.offsets.layers[L],N=S.scratch(`L${L}.intermediate`,B,[f]);if(a){let M=b(L,["gate_proj","up_proj"],"gateup");S.op("com.xenova.LlamaDecodeGateUpNormQ1",{hiddenT:D,q1BitsT:M.bitsT,q1ScalesT:M.scalesT,intermediateT:N,weightsT:I},{args:{hiddenSize:i,intermediateSize:f,rmsEps:m,normOffset:F.post_attention_layernorm,gateOffset:M.offset(`layers.${L}.gate_proj`),upOffset:M.offset(`layers.${L}.up_proj`)}});let Q=b(L,["down_proj"],"down");return S.op("com.xenova.LlamaDecodeDownProjQ1",{hiddenT:D,q1BitsT:Q.bitsT,q1ScalesT:Q.scalesT,intermediateT:N},{args:{hiddenSize:i,intermediateSize:f,downOffset:Q.offset(`layers.${L}.down_proj`)}}).hiddenT}if(Le(e,`layers.${L}.gate_proj`)){let M=_(L,["gate_proj","up_proj"],"gateup");S.op("com.xenova.LlamaDecodeGateUpNormQ4",{hiddenT:D,q4BitsT:M.bitsT,q4ScalesT:M.scalesT,intermediateT:N,weightsT:I},{args:{hiddenSize:i,intermediateSize:f,rmsEps:m,normOffset:F.post_attention_layernorm,gateOffset:M.offset(`layers.${L}.gate_proj`),upOffset:M.offset(`layers.${L}.up_proj`),quantBits:M.quantBits,hasMin:M.hasMin}})}else S.op("com.xenova.LlamaDecodeGateUpNorm",{hiddenT:D,weightsT:I,intermediateT:N},{args:{hiddenSize:i,intermediateSize:f,rmsEps:m,normOffset:F.post_attention_layernorm,gateOffset:F.gate_proj,upOffset:F.up_proj}});if(Le(e,`layers.${L}.down_proj`)){let M=_(L,["down_proj"],"down");return S.op("com.xenova.LlamaDecodeDownProjQ4",{hiddenT:D,q4BitsT:M.bitsT,q4ScalesT:M.scalesT,intermediateT:N},{args:{hiddenSize:i,intermediateSize:f,downOffset:M.offset(`layers.${L}.down_proj`),quantBits:M.quantBits,hasMin:M.hasMin}}).hiddenT}return S.op("com.xenova.LlamaDecodeDownProj",{hiddenT:D,weightsT:I,intermediateT:N},{args:{hiddenSize:i,intermediateSize:f,downOffset:F.down_proj}}).hiddenT},me=S.stepInput("input_ids","uint32",[1]),oe;if(a){let D=ct(e,["embed_tokens"]);oe=S.op("com.xenova.LlamaEmbedQ1",{inputT:me,q1BitsT:U("embed.q1bits",D.q1BitsT),q1ScalesT:U("embed.q1scales",D.q1ScalesT),paramsT:O},{args:{hiddenSize:i,vocabSize:h,embedOffset:D.offset("embed_tokens"),tokenOffset:0}}).hiddenT}else oe=S.op("com.xenova.LlamaEmbed",{inputT:me,weightsT:I,paramsT:O},{args:{hiddenSize:i,vocabSize:h,embedOffset:q.embed_tokens,tokenOffset:0}}).hiddenT;for(let D=0;D<o;++D){let L=e.offsets.layers[D];if(or(r,D)==="conv"){if(!n.convStates)throw new Error("emitLlamaDecode: conv layer requires cache.convStates");let F=Xe(n.convStates,D*i*p,i*p),N=fe(`conv.state.${D}`,F),M=S.scratch(`L${D}.convY`,"float32",[i]);if(Le(e,`layers.${D}.conv_in_proj`)){let Q=S.scratch(`L${D}.convProj`,"float32",[3*i]),en=_(D,["conv_in_proj"],"convin");S.op("com.xenova.LlamaDecodeConvInProjNormQ4",{hiddenT:oe,q4BitsT:en.bitsT,q4ScalesT:en.scalesT,weightsT:I,convProjT:Q},{args:{hiddenSize:i,rmsEps:m,normOffset:L.input_layernorm,convInOffset:en.offset(`layers.${D}.conv_in_proj`),quantBits:en.quantBits,hasMin:en.hasMin}}),S.op("com.xenova.LlamaDecodeConvDepthwise",{convProjT:Q,weightsT:I,convStatesT:N,convYT:M},{args:{layer:0,hiddenSize:i,convLCache:p,convWeightOffset:L.conv_weight}})}else{let Q=S.scratch(`L${D}.normed`,"float32",[i]);S.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:oe,weightsT:I,normedT:Q},{args:{hiddenSize:i,rmsEps:m,normOffset:L.input_layernorm}}),S.op("com.xenova.LlamaDecodeConvInUpdate",{normedT:Q,weightsT:I,convStatesT:N,convYT:M},{args:{layer:0,hiddenSize:i,convLCache:p,convInOffset:L.conv_in_proj,convWeightOffset:L.conv_weight}})}oe=v(oe,D,"conv_out_proj",M)}else{let F=dn(e,n,D),N=fe(`cache.key.${D}`,F.cacheKeysT),M=fe(`cache.value.${D}`,F.cacheValuesT),Q;if(a){let nn=S.scratch(`L${D}.qkv`,"float32",[i+2*c]),Fe=b(D,["q_proj","k_proj","v_proj"],"qkv");S.op("com.xenova.LlamaDecodeQkvNormQ1",{hiddenT:oe,q1BitsT:Fe.bitsT,q1ScalesT:Fe.scalesT,qkvT:nn,weightsT:I},{args:{hiddenSize:i,numKvHeads:l,headDim:d,rmsEps:m,normOffset:L.input_layernorm,qOffset:Fe.offset(`layers.${D}.q_proj`),kOffset:Fe.offset(`layers.${D}.k_proj`),vOffset:Fe.offset(`layers.${D}.v_proj`)}}),Q=S.op("com.xenova.LlamaDecodeQkNormRopeCacheKvPacked",{qkvT:nn,weightsT:I,cacheKeysT:N,cacheValuesT:M,cosT:te,sinT:ye,paramsT:O},{args:{layer:0,cacheLen:g,pastLen:t,hiddenSize:i,numHeads:u,numKvHeads:l,headDim:d,rmsEps:m,qNormOffset:L.q_layernorm,kNormOffset:L.k_layernorm}}).qkvT}else if(s){let nn=S.scratch(`L${D}.q`,"float32",[i]),Fe=S.scratch(`L${D}.k`,"float32",[c]),Cr=S.scratch(`L${D}.v`,"float32",[c]);if(Le(e,`layers.${D}.q_proj`)){let Me=_(D,["q_proj","k_proj","v_proj"],"qkv");S.op("com.xenova.LlamaDecodeQkvNormQ4",{hiddenT:oe,q4BitsT:Me.bitsT,q4ScalesT:Me.scalesT,weightsT:I,qT:nn,kT:Fe,vT:Cr},{args:{hiddenSize:i,numKvHeads:l,headDim:d,rmsEps:m,normOffset:L.input_layernorm,qOffset:Me.offset(`layers.${D}.q_proj`),kOffset:Me.offset(`layers.${D}.k_proj`),vOffset:Me.offset(`layers.${D}.v_proj`),quantBits:Me.quantBits,hasMin:Me.hasMin}})}else{let Me=S.scratch(`L${D}.normed`,"float32",[i]);S.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:oe,weightsT:I,normedT:Me},{args:{hiddenSize:i,rmsEps:m,normOffset:L.input_layernorm}}),S.op("com.xenova.LlamaDecodeQkv",{normedT:Me,weightsT:I,qT:nn,kT:Fe,vT:Cr},{args:{hiddenSize:i,numKvHeads:l,headDim:d,qOffset:L.q_proj,kOffset:L.k_proj,vOffset:L.v_proj}})}Q=S.op("com.xenova.LlamaDecodeQkNormRopeCacheKv",{qT:nn,kT:Fe,vT:Cr,weightsT:I,cacheKeysT:N,cacheValuesT:M,cosT:te,sinT:ye,paramsT:O},{args:{layer:0,cacheLen:g,pastLen:t,numHeads:u,numKvHeads:l,headDim:d,rmsEps:m,qNormOffset:L.q_layernorm,kNormOffset:L.k_layernorm}}).qT}else{let nn=S.scratch(`L${D}.q`,"float32",[i]);Q=S.op("com.xenova.LlamaDecodeQkvRopeCacheNorm",{hiddenT:oe,weightsT:I,qT:nn,cacheKeysT:N,cacheValuesT:M,cosT:te,sinT:ye,paramsT:O},{args:{layer:0,cacheLen:g,pastLen:t,hiddenSize:i,rmsEps:m,normOffset:L.input_layernorm,numHeads:u,numKvHeads:l,headDim:d,qOffset:L.q_proj,kOffset:L.k_proj,vOffset:L.v_proj}}).qT}let en=S.op("com.xenova.LlamaDecodeAttentionSplitK",{qT:Q,cacheKeysT:N,cacheValuesT:M,paramsT:O},{args:{layer:0,cacheLen:g,pastLen:t,numHeads:u,numKvHeads:l,headDim:d,scale:w,workgroupSize:T,tileSize:16,numKvChunks:Ye,minKeysPerChunk:ar}}),Gu=S.op("com.xenova.LlamaDecodeAttentionSplitKMerge",{partialOutT:en.partialOutT,partialMetaT:en.partialMetaT},{args:{numHeads:u,headDim:d,numKvChunks:Ye}});oe=v(oe,D,"o_proj",Gu.attnT)}oe=A(oe,D)}let gt=!!(e.lmHeadQ4&&e.lmHeadQ4Scales),En=a||gt?512:sg,_t=S.scratch("bestValues","float32",[En]),yt=S.scratch("bestIds","uint32",[En]);if(a){let D=S.scratch("final.normed",V,[i]);S.op("com.xenova.LlamaDecodeRmsNorm",{hiddenT:oe,weightsT:I,normedT:D},{args:{hiddenSize:i,rmsEps:m,normOffset:q.model_norm}});let L=ct(e,["lm_head"]);S.op("com.xenova.LlamaDecodeLmHeadQ1ArgmaxTiled",{normedT:D,q1BitsT:U("lmhead.q1bits",L.q1BitsT),q1ScalesT:U("lmhead.q1scales",L.q1ScalesT),bestValuesT:_t,bestIdsT:yt},{args:{hiddenSize:i,vocabSize:h,lmHeadOffset:L.offset("lm_head"),numBlocks:En}})}else gt?S.op("com.xenova.LlamaDecodeLmHeadQ4ArgmaxTiled",{hiddenT:oe,q4BitsT:U("lmhead.q4bits",e.lmHeadQ4),q4ScalesT:U("lmhead.q4scales",e.lmHeadQ4Scales),weightsT:I,bestValuesT:_t,bestIdsT:yt},{args:{hiddenSize:i,vocabSize:h,lmHeadOffset:0,finalNormOffset:q.model_norm,numBlocks:En}}):S.op("com.xenova.LlamaDecodeFinalNormLmHeadArgmaxTiled",{hiddenT:oe,weightsT:I,bestValuesT:_t,bestIdsT:yt},{args:{hiddenSize:i,vocabSize:h,rmsEps:m,finalNormOffset:q.model_norm,lmHeadOffset:q.lm_head,numBlocks:En}});return S.op("com.xenova.LlamaDecodeBestArgmax",{bestValuesT:_t,bestIdsT:yt,outputT:me},{args:{outputOffset:0,workgroupSize:ag,inputCount:En}}),{graph:S.finish({name:"llama-decode",params:{positionOffset:t}}),weights:H,states:ae,paramsName:"params"}}function lg(e){let n="com.xenova.LlamaDecodeRmsNorm",t="com.xenova.LlamaDecodeQkv",r=new Map,s=l=>{r.set(l,(r.get(l)??0)+1)};for(let l of e.nodes){let d=new Set(Object.values(l.outputs));for(let c of Object.values(l.inputs))d.has(c)||s(c)}for(let l of e.tensors)l.kind==="output"&&s(l.id);let a=new Map;e.nodes.forEach((l,d)=>{if(l.op!==t)return;let c=l.inputs.normedT;c!==void 0&&a.set(c,a.has(c)?-1:d)});let i=new Map,o=new Set;if(e.nodes.forEach((l,d)=>{if(l.op!==n)return;let c=l.outputs.normedT;if(c===void 0||(r.get(c)??0)!==1)return;let p=a.get(c);if(p===void 0||p<0)return;let f=e.nodes[p],h=l.args??{},m=f.args??{};i.set(p,{op:"com.xenova.LlamaDecodeQkvNorm",inputs:{hiddenT:l.inputs.hiddenT,weightsT:l.inputs.weightsT},outputs:{...f.outputs},args:{hiddenSize:h.hiddenSize,numKvHeads:m.numKvHeads,headDim:m.headDim,rmsEps:h.rmsEps,normOffset:h.normOffset,qOffset:m.qOffset,kOffset:m.kOffset,vOffset:m.vOffset}}),o.add(d)}),i.size===0)return e;let u=[];return e.nodes.forEach((l,d)=>{o.has(d)||u.push(i.get(d)??l)}),Object.freeze({...e,nodes:Object.freeze(u)})}var wr=class{model;cache;emission;compiled;steps=[];constructor(n,t){this.model=n,this.cache=t}async build(n,{fuse:t=!1}={}){this.emission=ug(this.model,this.cache,n);let r=t?lg(this.emission.graph):this.emission.graph;this.compiled=fu(r,this.model.runtime,{weights:this.emission.weights,states:this.emission.states}),this.steps=await this.compiled.buildSteps()}get stepCount(){return this.steps.length}writeStepInputs(n,t){let r=this.model.runtime.host;n!==null&&r.writeBuffer(this.compiled.tensor("input_ids").buffer,0,new Uint32Array([n])),r.writeBuffer(this.compiled.uniformBuffer(this.emission.paramsName),0,new Uint32Array([t,this.cache.maxLength,0,0]))}async step(n,t){return this.writeStepInputs(n,t),this.compiled.collector.enqueue(this.steps),(await this.model.runtime.readTensor(this.compiled.tensor("input_ids")))[0]}submitStep(n,t){return this.writeStepInputs(n,t),this.compiled.collector.enqueue(this.steps),this.model.runtime.readTensor(this.compiled.tensor("input_ids")).then(r=>r[0])}enqueueStep(n,t){this.writeStepInputs(n,t),this.compiled.collector.enqueue(this.steps)}finish(){}measureGpuMs(){let n=this.model.runtime;return n.measurePreparedSequenceGpuMs?n.measurePreparedSequenceGpuMs(this.steps):Promise.resolve(null)}dispose(){this.compiled?.dispose()}};sn();we();function js(e,n,t){if(Ve(n)){if(n.runtime!==e.runtime)throw new Error(`${t} tensor does not belong to this runtime`);if(n.dtype!=="uint32")throw new Error(`${t} tensor must have dtype uint32`);return n}let{shape:r,data:s}=vr(n,t);return e.runtime.tensorFromTypedArray("uint32",r,s)}function mu(e,n,t,r){let s=`${n}x${t}x${r}`,a=e.defaultPositionIdsCache.get(s);if(a)return a;let i=new Uint32Array(n*t);for(let u=0;u<n;++u)for(let l=0;l<t;++l)i[u*t+l]=r+l;let o=e.runtime.tensorFromTypedArray("uint32",[n,t],i);return e.defaultPositionIdsCache.set(s,o),o}function hu(e,n){let t=e.config,r=4*t.max_position_embeddings*t.hidden_size+t.max_position_embeddings*t.num_attention_heads*t.head_dim+2*t.max_position_embeddings*t.num_key_value_heads*t.head_dim+2*t.intermediate_size;if(n<1)throw new Error("batch size must be positive");if(r>8192)throw new Error(`Llama megakernel V1 shape is too large for the tiny sequential kernel scratch budget: ${r} elements`)}function vr(e,n){if(e instanceof Uint32Array)return{shape:[1,e.length],data:e};if(!Array.isArray(e))throw new Error(`${n} must be a uint32 tensor, Uint32Array, or array`);let t=$s(e,n);if(t.length===1&&t.unshift(1),t.length!==2)throw new Error(`${n} must be rank 1 or rank 2`);let r=new Uint32Array(Y(t)),s=0,a=i=>{if(Array.isArray(i)){for(let o of i)a(o);return}if(typeof i!="number"||!Number.isInteger(i)||i<0)throw new Error("token ids must be non-negative integers");r[s++]=i};return a(e),{shape:t,data:r}}function $s(e,n){if(!Array.isArray(e))return[];let t=e.length;if(t===0)throw new Error(`${n} arrays must not be empty`);let r=Array.isArray(e[0])?$s(e[0],n):[];for(let s=1;s<e.length;++s){let a=Array.isArray(e[s])?$s(e[s],n):[];if(a.length!==r.length||a.some((i,o)=>i!==r[o]))throw new Error(`${n} must be a rectangular array`)}return[t,...r]}var dg=ds({op:je("com.xenova.llama.ForwardMegakernel"),toRequest:e=>{let{inputIdsT:n,positionIdsT:t,weightsT:r,logitsT:s,cacheKeysT:a,cacheValuesT:i,...o}=e;return{resources:{inputIdsT:n,positionIdsT:t,weightsT:r,logitsT:s,cacheKeysT:a,cacheValuesT:i},args:o}}});async function gu(e,n={}){let{input_ids:t,attention_mask:r=null,position_ids:s=null,past_key_values:a=null,inputs_embeds:i=null,labels:o=null,use_cache:u=!1,logits_to_keep:l=0}=n;if(r!==null)throw new Error("LlamaForCausalLM V1 does not support attention_mask");if(i!==null)throw new Error("LlamaForCausalLM V1 does not support inputs_embeds");if(o!==null)throw new Error("LlamaForCausalLM V1 does not support labels/loss");if(t==null)throw new Error("LlamaForCausalLM.forward requires input_ids");let d=js(e,t,"input_ids");if(d.shape.length!==2)throw new Error("LlamaForCausalLM.forward expects input_ids shape [batch, sequence]");let[c,p]=d.shape;if(p>e.config.max_position_embeddings)throw new Error(`sequence length ${p} exceeds max_position_embeddings ${e.config.max_position_embeddings}`);if(!Number.isInteger(l)||l<0||l>p)throw new Error("logits_to_keep must be an integer in [0, sequence length]");hu(e,c);let f=l===0?p:l,h=u||a!==null,m=a??We.allocate(e.runtime,e.config,c,e.config.max_position_embeddings,e.cacheDtype);pr(m,e.runtime,e.config,c);let g=m.get_seq_length();if(g+p>m.maxLength)throw new Error(`past length ${g} + sequence length ${p} exceeds cache maxLength ${m.maxLength}`);let w=s===null?mu(e,c,p,g):js(e,s,"position_ids");if(w.shape.length!==2||w.shape[0]!==c||w.shape[1]!==p)throw new Error("position_ids must have the same [batch, sequence] shape as input_ids");let T=e.runtime.empty("float32",[c,f,e.config.vocab_size],"llama-logits");return await dg.run(e.runtime,{inputIdsT:d,positionIdsT:w,weightsT:e.weights,logitsT:T,cacheKeysT:m.keyStates,cacheValuesT:m.valueStates,batchSize:c,seqLen:p,pastLen:g,logitsLen:f,...Ao({config:e.config,offsets:e.offsets})},{runOptions:{namespace:"com.xenova.llama.ForwardMegakernel",label:"llama_for_causal_lm_megakernel"}}),m.advance(p),{loss:null,logits:T,past_key_values:h?m:null,hidden_states:void 0,attentions:void 0}}function kr(e,n={}){return{maxNewTokens:Number(e.max_new_tokens??0),eosTokenId:e.eos_token_id??n.eosTokenId??null,stopOnEos:e.stop_on_eos!==!1,onPrefillDone:e.on_prefill_done??null}}function Sr(e,n){return n==null?!1:Array.isArray(n)?n.includes(e):e===n}async function*_u(e){let n=[];for(;n.length<e.depth&&e.shouldSubmit();)n.push(await e.submit());try{for(;n.length>0;){let t=n.shift();e.shouldSubmit()&&n.length<e.depth&&n.push(await e.submit());let r=await t.result;if(yield*e.accept(t,r))return}}finally{for(let t of n)try{await t.result}catch{}}}function yu(e,n){let t=e.decode_pipeline_depth;return typeof t!="number"||!Number.isFinite(t)?n:Math.max(1,Math.min(Math.floor(t),n))}async function*bu(e,n,t){if(n.length===0)throw new Error("generation requires at least one input token");let{maxNewTokens:r,eosTokenId:s,stopOnEos:a,onPrefillDone:i}=kr(t,e.eosTokenId!==void 0?{eosTokenId:e.eosTokenId}:{}),o=e.cache,u=f=>a&&Sr(f,s),l=await e.prefill(n,i);if(r<=0||u(l))return;yield l;let d=1;if(d>=r)return;async function*c(f,h){for(let m=0;m<f.count;++m){e.onToken();let g=h[m];if(u(g))return await e.discard(f,m+1),!0;if(yield g,d+=1,d>=r)return!0}return e.chain?.(h[f.count-1]),!1}let p=o.get_seq_length();try{if(e.pipelineDepth>1){let m=r-d,g=p,w=0,T=!0;yield*_u({depth:e.pipelineDepth,shouldSubmit:()=>w<m&&g<o.maxLength,submit:async()=>{let x=await e.submit(T?l:null,g,m-w);return g+=x.count,w+=x.count,T=!1,x},accept:c});return}let f=l,h=p;for(;d<r&&h<o.maxLength;){let m=await e.submit(f,h,r-d),g=await m.result;if(yield*c(m,g))break;f=g[m.count-1],h=o.get_seq_length()}}finally{e.finish()}}function wu(e){let n=e.cache,t=null,r=e.pipelineDepth>1;return{cache:n,eosTokenId:e.eosTokenId,pipelineDepth:e.pipelineDepth,prefill:async(s,a)=>{let i=n.get_seq_length(),o=await e.prefill(s,i);return n.advance(s.length),a?.({tokens:s.length,cache_length:n.get_seq_length()}),o},submit:async(s,a,i)=>(t||(t=await e.beginDecode(a,i)),{result:(r?t.submitStep(s,a):t.step(s,a)).then(u=>[u]),count:1}),onToken:()=>n.advance(1),discard:()=>{},finish:()=>t?.finish()}}var cg=4,Tr=class{runtime;config;weights;offsets;lmHeadQ8;lmHeadQ8Scales;lmHeadQ4;lmHeadQ4Scales;q1Bits;q1Scales;q1Offsets;q1BlockCounts;q4Bits;q4Scales;q4Offsets;q4BlockCounts;packedQuantBits;kq4Bits;kq4Scales;kq4Offsets;kq4BlockCounts;cacheDtype;programCache;defaultPositionIdsCache;ropeCache;qwen35RopeCache;#n=new WeakMap;#e=[];constructor({runtime:n,config:t,weights:r,offsets:s,lmHeadQ8:a=null,lmHeadQ8Scales:i=null,lmHeadQ4:o=null,lmHeadQ4Scales:u=null,cacheDtype:l="float32",q1Bits:d=null,q1Scales:c=null,q1Offsets:p=null,q1BlockCounts:f=null,q4Bits:h=null,q4Scales:m=null,q4Offsets:g=null,q4BlockCounts:w=null,packedQuantBits:T=null,kq4Bits:x=null,kq4Scales:q=null,kq4Offsets:k=null,kq4BlockCounts:B=null}){this.runtime=n,this.config=at(t),this.weights=r,this.offsets=s,this.lmHeadQ8=a,this.lmHeadQ8Scales=i,this.lmHeadQ4=o,this.lmHeadQ4Scales=u,this.q1Bits=d,this.q1Scales=c,this.q1Offsets=p,this.q1BlockCounts=f,this.q4Bits=h,this.q4Scales=m,this.q4Offsets=g,this.q4BlockCounts=w,this.packedQuantBits=T,this.kq4Bits=x,this.kq4Scales=q,this.kq4Offsets=k,this.kq4BlockCounts=B,this.cacheDtype=l,this.programCache=new Map,this.defaultPositionIdsCache=new Map,this.ropeCache=null}static ConfigClass=ln;static MODEL_NAME="Llama";static expectedWeightEntries=yo;static DECODE_DESCRIPTORS={createGenerationScratch:hr,decodeLayerDescriptors:lu,finalDescriptors:uu};static _coerceConfig(n){return cr(this,n)}static loadStateDict(n,t,r){return su(this,n,t,r)}static async loadTensorFolder(n,t){return au(this,n,t)}static async loadSafeTensors(n,t){return Bs(this,n,t)}static async loadLazySafeTensors(n,t){return iu(this,n,t)}dispose(){for(let n of this.#e)n.dispose();this.#e.length=0,J(this.weights),J(this.lmHeadQ8),J(this.lmHeadQ8Scales),J(this.lmHeadQ4),J(this.lmHeadQ4Scales),J(this.q1Bits),J(this.q1Scales),J(this.q4Bits),J(this.q4Scales),J(this.kq4Bits),J(this.kq4Scales),J(this.ropeCache),J(this.qwen35RopeCache),J(this.defaultPositionIdsCache),this.programCache.clear(),this.ropeCache=null,this.qwen35RopeCache=null,this.lmHeadQ8=null,this.lmHeadQ8Scales=null,this.lmHeadQ4=null,this.lmHeadQ4Scales=null,this.q1Bits=null,this.q1Scales=null,this.q4Bits=null,this.q4Scales=null,this.kq4Bits=null,this.kq4Scales=null}async forward(n={}){return gu(this,n)}async generate(n={}){let{input_ids:t,max_new_tokens:r,do_sample:s=!1,force_token_path:a=!1,decode_chunk_size:i=Ns}=n;Hs(r,"generate"),Us(s,"LlamaForCausalLM.generate"),Fs(i);let{shape:o,data:u}=vr(t,"input_ids");if(o.length!==2)throw new Error("generate expects input_ids shape [batch, sequence]");let[l,d]=o,c=d+r;if(c>this.config.max_position_embeddings)throw new Error(`generated length ${c} exceeds max_position_embeddings ${this.config.max_position_embeddings}`);let p=new Uint32Array(l*c);for(let m=0;m<l;++m)for(let g=0;g<d;++g)p[m*c+g]=u[m*d+g];if(r===0)return this.runtime.tensorFromTypedArray("uint32",[l,c],p);if(a||fn(this.config))return this.#d({data:u,batchSize:l,promptLength:d,totalLength:c,maxNewTokens:r,decodeChunkSize:i});let f=null,h=this.runtime.tensorFromTypedArray("uint32",[l,d],u);for(let m=0;m<r;++m){let g=await this.forward({input_ids:h,past_key_values:f,use_cache:!0,logits_to_keep:1});f=g.past_key_values;let w=await this.runtime.readTensor(g.logits),T=g.logits.shape[1],x=new Uint32Array(l);for(let q=0;q<l;++q){let k=(q*T+T-1)*this.config.vocab_size,B=Ks(w,k,this.config.vocab_size);x[q]=B,p[q*c+d+m]=B}h=this.runtime.tensorFromTypedArray("uint32",[l,1],x)}return this.runtime.tensorFromTypedArray("uint32",[l,c],p)}async*streamTokenIds(n={}){yield*this.#r(n,{fromCache:!1})}createGenerationState(n={}){let t=n.batchSize??n.batch_size??1,r=_r(this),s=n.maxLength??n.max_length??r;if(t!==1)throw new Error("createGenerationState V1 supports batch size 1");if(!Number.isInteger(s)||s<1||s>r)throw new Error(`maxLength must be an integer in [1, ${r}]`);return mr(this,s)}#t(){return this.constructor.DECODE_DESCRIPTORS}createGenerationScratch(){return this.#t().createGenerationScratch(this)}decodeLayerDescriptors({layer:n,cache:t,scratch:r,params:s,hidden:a}){return this.#t().decodeLayerDescriptors(this,{layer:n,cache:t,scratch:r,params:s,hidden:a})}finalDescriptors({hidden:n,scratch:t,output:r,outputOffset:s=0}){return this.#t().finalDescriptors(this,{hidden:n,scratch:t,output:r,outputOffset:s})}async*streamTokenIdsFromCache(n={}){yield*this.#r(n,{fromCache:!0})}async*#r(n,{fromCache:t}){let r=t?"streamTokenIdsFromCache":"streamTokenIds",{input_ids:s,max_new_tokens:a,generation_state:i=null,past_key_values:o=null,do_sample:u=!1,force_token_path:l=!1,decode_chunk_size:d=Ns}=n,c=t?i?.cache??o:null,p=t?i?.scratch??null:null;Hs(a,r);let{eosTokenId:f,stopOnEos:h,onPrefillDone:m}=kr(n,{eosTokenId:this.config.eos_token_id});if(Us(u,`LlamaForCausalLM.${r}`),Fs(d),t&&c==null)throw new Error("streamTokenIdsFromCache requires generation_state, cache, or past_key_values");let{shape:g,data:w}=vr(s,"input_ids");if(g.length!==2)throw new Error(`${r} expects input_ids shape [batch, sequence]`);let[T,x]=g;if(T!==1)throw new Error(`${r} V1 supports batch size 1`);if(t){if(x<1)throw new Error("streamTokenIdsFromCache requires at least one input token");if(pr(c,this.runtime,this.config,T),c.get_seq_length()+x+a>c.maxLength)throw new Error(`cache length ${c.get_seq_length()} + input length ${x} + max_new_tokens ${a} exceeds maxLength ${c.maxLength}`)}else{let k=x+a;if(k>this.config.max_position_embeddings)throw new Error(`generated length ${k} exceeds max_position_embeddings ${this.config.max_position_embeddings}`)}if(a===0)return;if(!l&&!fn(this.config)){yield*this.#l({tokenIds:w,inputLength:x,cache:c,maxNewTokens:a,eosTokenId:f,stopOnEos:h});return}let q=!t;if(t)p??=fn(this.config)?hr(this):null;else{let k=mr(this,x+a);c=k.cache,p=k.scratch}if(!c)throw new Error(`${r} requires a generation cache`);try{yield*this.#i({tokenIds:w,inputLength:x,cache:c,scratch:p,maxNewTokens:a,eosTokenId:f,stopOnEos:h,decodeChunkSize:d,truncateOnEos:t,onPrefillDone:m,generationArgs:n})}finally{q&&(c.dispose(),gr(p))}}async#d({data:n,batchSize:t,promptLength:r,totalLength:s,maxNewTokens:a,decodeChunkSize:i}){if(t!==1)throw new Error("large-model generation V1 supports batch size 1");let o=new Uint32Array(s);if(o.set(n),a===0)return this.runtime.tensorFromTypedArray("uint32",[1,s],o);let u=mr(this,s),l=0;try{for await(let d of this.#i({tokenIds:o,inputLength:r,cache:u.cache,scratch:u.scratch,maxNewTokens:a,stopOnEos:!1,decodeChunkSize:i}))o[r+l]=d,l+=1}finally{u.cache.dispose(),gr(u.scratch)}return this.runtime.tensorFromTypedArray("uint32",[1,s],o)}async*#l({tokenIds:n,inputLength:t,cache:r=null,maxNewTokens:s,eosTokenId:a,stopOnEos:i}){let o=this.runtime.tensorFromTypedArray("uint32",[1,t],n);for(let u=0;u<s;++u){let l=await this.forward({input_ids:o,past_key_values:r,use_cache:!0,logits_to_keep:1});r=l.past_key_values;let d=await this.runtime.readTensor(l.logits),c=l.logits.shape[1],p=Ks(d,(c-1)*this.config.vocab_size,this.config.vocab_size);if(i&&Sr(p,a))return;yield p,o=this.runtime.tensorFromTypedArray("uint32",[1,1],new Uint32Array([p]))}}async*#i({tokenIds:n,inputLength:t,cache:r,scratch:s,maxNewTokens:a,eosTokenId:i,stopOnEos:o,decodeChunkSize:u,truncateOnEos:l=!1,onPrefillDone:d=null,generationArgs:c={}}){let p=this.#o()?this.#u(r,{eosTokenId:i,pipelineDepth:yu(c,cg)}):this.#a(r,s,{decodeChunkSize:u,truncateOnEos:l,stopOnEos:o});yield*bu(p,n.subarray(0,t),{max_new_tokens:a,eos_token_id:i,stop_on_eos:o,on_prefill_done:d})}#o(){return void 0!=="0"&&this.supportsDecodeGraph()}supportsDecodeGraph(){let n=_e(this);return!qe(this.config)&&!(n&&ge(this.config))&&!(n&&!xe(this.config))&&!this.lmHeadQ8&&An(this.config)}makeGraphDecodeSession(n){return new wr(this,n)}async#s(n){let t=this.#n.get(n);return t||(t=this.makeGraphDecodeSession(n),await t.build(n.get_seq_length(),{fuse:!0}),this.#n.set(n,t),this.#e.push(t)),t}#u(n,{eosTokenId:t,pipelineDepth:r}){return wu({cache:n,eosTokenId:t,pipelineDepth:r,prefill:async(s,a)=>{let i=await this.#s(n),o=s.length-1;for(let u=0;u<o;++u)i.enqueueStep(s[u],a+u);return i.submitStep(s[o],a+o)},beginDecode:async()=>{let s=await this.#s(n);return{step:(a,i)=>s.step(a,i),submitStep:(a,i)=>s.submitStep(a,i),finish:()=>s.finish()}}})}#a(n,t,{decodeChunkSize:r,truncateOnEos:s,stopOnEos:a}){let i=ge(this.config),o=!!t&&!this.runtime.profileSession,u=i&&a&&s,l=0,d=0;return{cache:n,pipelineDepth:o?Vs:1,prefill:async(c,p)=>{let f=c.length,h=f-1;await this.#g(c,h,n,t),p?.({tokens:Math.max(h,0),cache_length:n.get_seq_length()});let m=c[f-1],g;if(t&&!i&&!this.runtime.profileSession){let w=await this.#f(n,t,1,!1,0);g=(await this.#p(w,m,n,t,1,{writeFirstToken:!0,lane:0}))[1]}else g=await this.#c(m,n,t);return l=g,g},submit:async(c,p,f)=>{if(o){let g=Math.min(r,f),w=d,T=n.get_seq_length(),x=await this.#f(n,t,g,u,w),q=c!==null,k=this.#p(x,q?c:0,n,t,g,{writeFirstToken:q,lane:w});return d=(d+1)%fr,{result:Promise.resolve(k).then(V=>Array.from({length:g},(S,H)=>V[H+1])),count:g,startLength:T,lane:w}}let h=await this.#c(c,n,t);return{result:Promise.resolve([h]),count:1,startLength:n.get_seq_length()-1,lane:0}},onToken:()=>{},discard:async(c,p)=>{if(!o)return;let f=c;u?await this.#_(n,t,f.lane,l,p,f.startLength):s&&n.truncate(f.startLength+p)},chain:c=>{l=c},finish:()=>{}}}async debugNextTokenLogits(n,t){return this.#m({tokenId:n,cache:t,outputLogits:!0})}async#m({tokenId:n,cache:t,outputLogits:r,scratch:s=null}){if(fn(this.config))return await this.#h({tokenId:n,cache:t,outputLogits:r,scratch:s});let a=await Xo(this,{tokenId:n,cache:t,outputDtype:r?"float32":"uint32",outputShape:r?[this.config.vocab_size]:[1],outputLabel:r?"llama-next-token-logits":"llama-next-token",outputLogits:r});return t.advance(1),a}async#c(n,t,r=null){let s=await this.#m({tokenId:n,cache:t,outputLogits:!1,scratch:r});return(await this.runtime.readTensor(s))[0]}async#g(n,t,r,s=null){if(t<=0)return;let a=fn(this.config);if(!a||!s){for(let l=0;l<t;++l)a?await this.#h({tokenId:n[l],cache:r,outputLogits:!1,skipOutput:!0,scratch:s}):await this.#c(n[l],r);return}if(Jo(this)&&!this.runtime.profileSession){await nu(this,{tokenIds:n,count:t,cache:r,scratch:s});return}let i=this.runtime.tensorFromTypedArray("uint32",[t],Uint32Array.from(n.slice(0,t))),o=Array.from({length:t},(l,d)=>this.runtime.createUniformU32([r.get_seq_length()+d,r.maxLength,d,0],`llama-prefill-params-${d}`)),u=[];for(let l=0;l<t;++l){let d=o[l];u.push(de(this,"embed",{input:i,hidden:s.hidden,params:d}));for(let c=0;c<this.config.num_hidden_layers;++c)u.push(...this.decodeLayerDescriptors({layer:c,cache:r,scratch:s,params:d,hidden:s.hidden}))}await this.runtime.runProgramSequence(u,{wait:!1}),r.advance(t)}#p(n,t,r,s,a,{writeFirstToken:i=!0,lane:o=0}={}){i&&this.runtime.host.writeBuffer(s.tokens.buffer,0,new Uint32Array([t]));let u=r.get_seq_length(),l=s.chunkParamLanes[o];for(let d=0;d<a;++d)this.runtime.host.writeBuffer(l[d],0,new Uint32Array([u+d,r.maxLength,d,0]));return r.advance(a),this.runtime.enqueuePreparedProgramSequence(n),this.runtime.readTensor(s.tokens)}async#f(n,t,r,s,a){let i=s&&n.convStates&&t.convSnapshots,o=`${r}/${a}${i?"#snap":""}`,u=t.preparedChunks.get(o);if(u)return u;let l=t.chunkParamLanes[a],d=[];i&&d.push({kind:"copy",name:`conv-snapshot-start-l${a}`,src:n.convStates.buffer,dst:t.convSnapshots.buffer,srcOffset:0,dstOffset:a*t.convSnapshotByteStride,byteLength:t.convSnapshotByteStride});for(let p=0;p<r;++p){let f=l[p];d.push(de(this,"embed",{input:t.tokens,hidden:t.hidden,params:f}));for(let h=0;h<this.config.num_hidden_layers;++h)d.push(...this.decodeLayerDescriptors({layer:h,cache:n,scratch:t,params:f,hidden:t.hidden}));d.push(...this.finalDescriptors({hidden:t.hidden,scratch:t,output:t.tokens,outputOffset:p+1}))}d.push(pe(this,"tokenForward",{tokens:t.tokens,srcIndex:r}));let c=await this.runtime.prepareProgramSequence(d);return t.preparedChunks.set(o,c),c}async#_(n,t,r,s,a,i){if(!n.convStates||!t.convSnapshots){n.truncate(i+a);return}if(this.runtime.copyBufferToBuffer({src:t.convSnapshots.buffer,dst:n.convStates.buffer,srcOffset:r*t.convSnapshotByteStride,byteLength:t.convSnapshotByteStride,wait:!1}),n.truncate(i),a>0){let o=await this.#f(n,t,a,!1,0);await this.#p(o,s,n,t,a,{writeFirstToken:!0,lane:0})}}async#h({tokenId:n,cache:t,outputLogits:r,skipOutput:s=!1,scratch:a=null}){let i=a?null:hr(this),o=a??i,u=o.input,l=o.hidden,d=o.params;try{this.runtime.host.writeBuffer(u.buffer,0,new Uint32Array([n])),this.runtime.host.writeBuffer(d,0,new Uint32Array([t.get_seq_length(),t.maxLength,0,0]));let c=[de(this,"embed",{input:u,hidden:l,params:d})];for(let f=0;f<this.config.num_hidden_layers;++f)c.push(...this.decodeLayerDescriptors({layer:f,cache:t,scratch:o,params:d,hidden:l}));if(s)return await this.runtime.runProgramSequence(c,{wait:!!i}),t.advance(1),null;let p=r?this.runtime.empty("float32",[this.config.vocab_size],"llama-next-token-logits"):a?.nextToken??this.runtime.empty("uint32",[1],"llama-next-token");return c.push(...this.finalDescriptors({hidden:l,scratch:o,output:p})),await this.runtime.runProgramSequence(c,{wait:!!i}),t.advance(1),p}finally{gr(i)}}};function pg(e){if(e===0)return"F32";if(e===1)return"F16";if(e===30)return"BF16";throw new Error(`Unsupported GGUF scalar type ${e}; quantized types must be handled separately`)}function Qs(e,n){return e===K.Q4_0?$i(n):e===K.Q8_0?Qi(n):e===K.Q4_K?Yi(n):e===K.Q5_K?Xi(n):e===K.Q6_K?Zi(n):null}function fg(e){return e===K.Q4_0||e===K.Q8_0||e===K.Q4_K||e===K.Q5_K||e===K.Q6_K}function vu(e,n){return{has:t=>e.has(n(t)),describe(t){let r=e.info(n(t));return{dtype:fg(r.type)?"F32":pg(r.type),shape:[...r.shape],elementCount:r.elementCount}},async read(t){let r=n(t),s=e.info(r),a=await e.tensorBytes(r),i=Qs(s.type,a);return i?new Uint8Array(i.buffer,i.byteOffset,i.byteLength):a},async close(){}}}function ku(e,n){return{async streamAll(t,{concurrency:r,chunkMaxBytes:s,names:a=null,signal:i}={}){if(!a)throw new Error("makeGGUFWeightSource.streamAll requires the plan's tensor names");let o=new Map(a.map(u=>[n(u),u]));await e.streamTensors([...o.keys()],async(u,l)=>{let d=Qs(e.info(u).type,l),c=d?new Uint8Array(d.buffer,d.byteOffset,d.byteLength):l;await t({bytes:c,tensors:[{name:o.get(u),offset:0,length:c.byteLength}]})},{concurrency:r,chunkMaxBytes:s,signal:i})},close(){}}}function Je(e){if(e==="model.embed_tokens.weight")return"token_embd.weight";if(e==="model.embedding_norm.weight")return"token_embd_norm.weight";if(e==="lm_head.weight")return"output.weight";let n=/^model\.layers\.(\d+)\.(.+)\.weight$/.exec(e);if(!n)return e;let[,t,r]=n,s=mg[r];return s?`blk.${t}.${s}.weight`:e}var mg={"self_attn.q_proj":"attn_q","self_attn.k_proj":"attn_k","self_attn.v_proj":"attn_v","self_attn.out_proj":"attn_output","self_attn.q_layernorm":"attn_q_norm","self_attn.k_layernorm":"attn_k_norm","conv.in_proj":"shortconv.in_proj","conv.conv":"shortconv.conv","conv.out_proj":"shortconv.out_proj","feed_forward.w1":"ffn_gate","feed_forward.w3":"ffn_up","feed_forward.w2":"ffn_down",operator_norm:"attn_norm",ffn_norm:"ffn_norm"};function Su(e){return e===K.Q4_0?4:e===K.Q8_0||e===K.Q6_K||e===K.Q5_K||e===K.Q4_K?8:null}var hg={q_proj:["q_proj","k_proj","v_proj"],k_proj:["q_proj","k_proj","v_proj"],v_proj:["q_proj","k_proj","v_proj"],gate_proj:["gate_proj","up_proj"],up_proj:["gate_proj","up_proj"]};function Tu(e,n,t,r){let s=new Map(e.map(o=>[o.id,o])),a=o=>{let u=s.get(o);if(!u||!r.has(o.split(".").pop()??""))return!1;let l=t(u.name);return n.has(l)&&n.info(l).type===K.Q4_K},i=new Set;for(let o of e){let u=o.id.split(".").pop()??"";if(!r.has(u)||!a(o.id))continue;let l=hg[u]??[u],d=o.id.slice(0,o.id.length-u.length);l.every(c=>a(d+c))&&i.add(o.id)}return i}function xr(e,n,t,r,s){let a=e.id.split(".").pop()??"";if(!r.has(a)||s?.has(e.id))return!1;let i=t(e.name);return n.has(i)&&Su(n.info(i).type)!==null}function Zs(e,n,t,r,s){let a=!1,i=!0;for(let o of e)xr(o,n,t,r,s)&&(a=!0,Su(n.info(t(o.name)).type)!==4&&(i=!1));return a?i?4:8:null}function gg(e){let n=e.length/Cn,t=new Uint32Array(n*8),r=new Float32Array(n);for(let s=0;s<n;++s){let a=s*Cn,i=0;for(let l=0;l<Cn;++l){let d=Math.abs(e[a+l]);d>i&&(i=d)}let o=i/127,u=o>0?1/o:0;r[s]=o;for(let l=0;l<8;++l){let d=0;for(let c=0;c<4;++c){let p=Math.round(e[a+l*4+c]*u);p>127?p=127:p<-127&&(p=-127),d|=(p&255)<<c*8}t[s*8+l]=d>>>0}}return{bits:t,scales:r}}async function xu({runtime:e,entries:n,gguf:t,nameToGGUF:r,packSuffixes:s,excludeKq4Ids:a,signal:i}){let o=Zs(n,t,r,s,a);if(o===null)return null;let u=o,l=Re(),d=Re(),c=new Set,p=[],f=0;for(let x of n){if(!xr(x,t,r,s,a))continue;let q=r(x.name),k=t.info(q);if(k.elementCount%Ze!==0)throw new Error(`packed tensor ${q} element count ${k.elementCount} not divisible by ${Ze}`);let B=k.elementCount/Ze;Te(l,x.id,f),Te(d,x.id,B),c.add(x.id),p.push({gname:q,type:k.type,baseBlock:f}),f+=B}let h=new Uint32Array(f*u),m=new Float32Array(f),g=new Map(p.map(x=>[x.gname,x])),w=nr();await t.streamTensors([...g.keys()],async(x,q)=>{let k=g.get(x);if(o===4){let B=ji(q);h.set(B.bits,k.baseBlock*4),m.set(B.scales,k.baseBlock)}else{let B=Qs(k.type,q);if(!B)throw new Error(`packQ4GGUFWeights: ${x} type ${k.type} is not dequantizable`);let V=gg(B);h.set(V.bits,k.baseBlock*8),m.set(V.scales,k.baseBlock)}await w(q.byteLength)},{signal:i});let T=e.device.features.has("shader-f16");return{q4Bits:e.tensorFromTypedArray("uint32",[h.length],h),q4Scales:T?e.tensorFromTypedArray("float16",[m.length],an(m)):e.tensorFromTypedArray("float32",[m.length],m),q4Offsets:l,q4BlockCounts:d,q4PackedIds:c,packedQuantBits:o}}function _g(e){if(e.byteLength%Qe!==0)throw new Error(`Q4_K byte length ${e.byteLength} is not a multiple of ${Qe}`);let n=e.byteLength/Qe,t=n*8,r=new Uint32Array(t*4),s=new Float32Array(t),a=new Float32Array(t),i=new DataView(e.buffer,e.byteOffset,e.byteLength);for(let o=0;o<n;++o){let u=o*Qe,l=ve(i.getUint16(u,!0)),d=ve(i.getUint16(u+2,!0)),c=u+4,p=u+16;for(let f=0;f<8;++f){let[h,m]=Pn(f,e,c),g=l*h,w=d*m,T=o*8+f;s[T]=g,a[T]=8*g-w;let x=p+(f>>1)*32,q=(f&1)===1;for(let k=0;k<4;++k){let B=0;for(let V=0;V<4;++V){let S=k*4+V,H=q?e[x+S]>>4:e[x+S]&15,ae=q?e[x+S+16]>>4:e[x+S+16]&15;B|=((H|ae<<4)&255)<<V*8}r[T*4+k]=B>>>0}}}return{bits:r,scales:s,bias:a}}async function Du({runtime:e,entries:n,gguf:t,nameToGGUF:r,kq4Ids:s,signal:a}){let i=Re(),o=Re(),u=new Set,l=[],d=0;for(let g of n){if(!s.has(g.id))continue;let w=r(g.name),T=t.info(w);if(T.elementCount%Ze!==0)throw new Error(`Q4_K tensor ${w} element count ${T.elementCount} not divisible by ${Ze}`);let x=T.elementCount/Ze;Te(i,g.id,d),Te(o,g.id,x),u.add(g.id),l.push({gname:w,baseBlock:d}),d+=x}if(l.length===0)return null;let c=new Uint32Array(d*4),p=new Float32Array(d*2),f=new Map(l.map(g=>[g.gname,g])),h=nr();await t.streamTensors([...f.keys()],async(g,w)=>{let T=f.get(g),x=_g(w);c.set(x.bits,T.baseBlock*4);for(let q=0;q<x.scales.length;++q)p[(T.baseBlock+q)*2]=x.scales[q],p[(T.baseBlock+q)*2+1]=x.bias[q];await h(w.byteLength)},{signal:a});let m=e.device.features.has("shader-f16");return{kq4Bits:e.tensorFromTypedArray("uint32",[c.length],c),kq4Scales:m?e.tensorFromTypedArray("float16",[p.length],an(p)):e.tensorFromTypedArray("float32",[p.length],p),kq4Offsets:i,kq4BlockCounts:o,kq4PackedIds:u}}function Eu(e,{maxBytes:n,maxGap:t}){let r=[...e].sort((i,o)=>i.begin-o.begin),s=[],a=null;for(let i of r){if(!a){a={begin:i.begin,end:i.end,tensors:[i]};continue}let o=i.begin-a.end,u=i.end-a.begin;o<=t&&u<=n?(a.end=Math.max(a.end,i.end),a.tensors.push(i)):(s.push(a),a={begin:i.begin,end:i.end,tensors:[i]})}return a&&s.push(a),s}var yg=128<<20,bg=1<<20,wg=4,Dr=class e{#n;#e;constructor(n,t){this.#n=n,this.#e=t}static async open(n,t={}){let r=await rt(n,{source:t.source,fetch:t.fetch,signal:t.signal});try{let s=await io(r,t.signal);return new e(s,r)}catch(s){throw await r.close(),s}}get metadata(){return this.#n.metadata}names(){return this.#n.names()}has(n){return this.#n.has(n)}info(n){return this.#n.info(n)}async tensorBytes(n,t={}){let r=this.#n.info(n),s=this.#n.dataStart+r.offset;return this.#e.readRange(s,s+r.byteLength,{signal:t.signal})}async streamTensors(n,t,r={}){let{concurrency:s=wg,chunkMaxBytes:a=yg,chunkMaxGap:i=bg,signal:o}=r,u=n.map(p=>{let f=this.#n.info(p),h=this.#n.dataStart+f.offset;return{name:p,begin:h,end:h+f.byteLength}});if(u.length===0)return;let l=Eu(u,{maxBytes:a,maxGap:i}),d=0,c=async()=>{for(;;){if(o?.aborted)throw o.reason??new Error("aborted");let p=d++;if(p>=l.length)return;let f=l[p],h=await this.#e.readRange(f.begin,f.end,{signal:o});for(let m of f.tensors)await t(m.name,h.subarray(m.begin-f.begin,m.end-f.begin))}};await Promise.all(Array.from({length:Math.min(s,l.length)},()=>c()))}async close(){await this.#e.close()}};function qu(e,n,t,r){let s=n.configFromGGUF(e);return new ft({config:s,checkSupport:a=>n.checkSupport(s,a,e),loadWeights:(a,{signal:i})=>n.loadWeights(a,e,s,{onProgress:t,signal:i}),closeSource:r})}async function Ys(e,n,t){let r=await Dr.open(e,n);try{return qu(r,t,n.onProgress??null,()=>r.close())}catch(s){throw await r.close(),s}}function Lu(e,n,t){return qu(e,t,n.onProgress??null,async()=>{})}async function Ou(e){let{readFile:n}=await Promise.resolve().then(()=>(nt(),et));return new Ce(await n(e))}var Er=new Set(["gate_proj","up_proj","down_proj","o_proj","conv_out_proj","q_proj","k_proj","v_proj","conv_in_proj"]),qr=class{vocab_size;hidden_size;intermediate_size;num_hidden_layers;num_attention_heads;num_key_value_heads;max_position_embeddings;initializer_range;norm_eps;rms_norm_eps;use_cache;pad_token_id;bos_token_id;eos_token_id;tie_word_embeddings;rope_parameters;conv_bias;conv_L_cache;block_multiple_of;block_ffn_dim_multiplier;block_auto_adjust_ff_dim;full_attn_idxs;layer_types;head_dim;attention_qk_norm;model_type;constructor(n={}){this.vocab_size=Se(n,"vocab_size","Lfm2Config"),this.hidden_size=Se(n,"hidden_size","Lfm2Config"),this.intermediate_size=Se(n,"intermediate_size","Lfm2Config"),this.num_hidden_layers=Se(n,"num_hidden_layers","Lfm2Config"),this.num_attention_heads=Se(n,"num_attention_heads","Lfm2Config"),this.num_key_value_heads=n.num_key_value_heads,this.max_position_embeddings=Se(n,"max_position_embeddings","Lfm2Config"),this.initializer_range=n.initializer_range,this.norm_eps=n.norm_eps,this.rms_norm_eps=this.norm_eps,this.use_cache=n.use_cache,this.pad_token_id=n.pad_token_id,this.bos_token_id=n.bos_token_id,this.eos_token_id=n.eos_token_id,this.tie_word_embeddings=n.tie_word_embeddings??!0,this.rope_parameters=n.rope_parameters,this.conv_bias=n.conv_bias,this.conv_L_cache=n.conv_L_cache,this.block_multiple_of=n.block_multiple_of,this.block_ffn_dim_multiplier=n.block_ffn_dim_multiplier,this.block_auto_adjust_ff_dim=n.block_auto_adjust_ff_dim,this.full_attn_idxs=n.full_attn_idxs,this.layer_types=n.layer_types,this.head_dim=n.head_dim??Math.trunc(this.hidden_size/this.num_attention_heads),this.attention_qk_norm=!0,this.model_type="lfm2",this.validate(),this.intermediate_size=kg(this)}validate(){if(qs(this,"Lfm2Config",["vocab_size","hidden_size","intermediate_size","num_hidden_layers","num_attention_heads","num_key_value_heads","max_position_embeddings","head_dim"]),this.rope_parameters.rope_type!=="default")throw new Error("Lfm2 megakernel V1 only supports default RoPE");if(this.layer_types.length!==this.num_hidden_layers)throw new Error("Lfm2Config.layer_types length must match num_hidden_layers");if(this.layer_types.some(n=>n!=="full_attention"&&n!=="conv"))throw new Error("Lfm2Config.layer_types entries must be full_attention or conv")}toJSON(){return{...this,rope_parameters:{...this.rope_parameters}}}},Dn=class extends Tr{static ConfigClass=qr;static MODEL_NAME="Lfm2";static expectedWeightEntries=ea;static prepare(n,t={}){return Ys(n,t,Xs)}static async load(n,t,r={}){return(await Ys(t,r,Xs)).load(n,{signal:r.signal})}static async loadGGUFFile(n,t,r={}){return this.loadGGUF(n,{gguf:await Ou(t),onProgress:r.onProgress??null})}static loadGGUF(n,{gguf:t,onProgress:r}){return Lu(t,{onProgress:r??null},Xs).load(n)}async forward(n={}){if(ge(this.config))throw new Error("Lfm2ForCausalLM.forward for conv layers is not supported yet; use generate/streamTokenIds for LFM2.5");return super.forward(n)}};var Xs={configFromGGUF:Lr,checkSupport:Cu,loadWeights:vg};async function vg(e,n,t,{onProgress:r,signal:s}){let a=ea(t),i=vu(n,Je),o=ku(n,Je),u=Tu(a,n,Je,Er),l=await xu({runtime:e,entries:a,gguf:n,nameToGGUF:Je,packSuffixes:Er,excludeKq4Ids:u,signal:s}),d=await Du({runtime:e,entries:a,gguf:n,nameToGGUF:Je,kq4Ids:u,signal:s}),c=new Set([...l?.q4PackedIds??[],...d?.kq4PackedIds??[]]),p=await lt({runtime:e,config:t,entries:a,reader:i,source:o,modelName:Dn.MODEL_NAME,onProgress:r,signal:s,skipDenseIds:c});return new Dn({runtime:e,config:t,...p,...l??{},...d??{}})}function Cu(e,n,t){let r=ea(e);return dr({config:e,device:n,entries:r,descriptors:Dn.DECODE_DESCRIPTORS,isPacked:s=>xr(s,t,Je,Er),packedQuantBits:Zs(r,t,Je,Er)??4,tieWordEmbeddings:ut(r,s=>t.has(Je(s)))})}function Js(e,n,t){return Cu(e,n,t).reason}function ea(e){let n=e.hidden_size,t=e.intermediate_size,r=e.num_attention_heads*e.head_dim,s=e.num_key_value_heads*e.head_dim,a=[{id:"embed_tokens",name:"model.embed_tokens.weight",length:e.vocab_size*n}];for(let i=0;i<e.num_hidden_layers;++i)e.layer_types[i]==="full_attention"?a.push({id:`layers.${i}.q_proj`,name:`model.layers.${i}.self_attn.q_proj.weight`,length:r*n},{id:`layers.${i}.k_proj`,name:`model.layers.${i}.self_attn.k_proj.weight`,length:s*n},{id:`layers.${i}.v_proj`,name:`model.layers.${i}.self_attn.v_proj.weight`,length:s*n},{id:`layers.${i}.o_proj`,name:`model.layers.${i}.self_attn.out_proj.weight`,length:n*r},{id:`layers.${i}.q_layernorm`,name:`model.layers.${i}.self_attn.q_layernorm.weight`,length:e.head_dim},{id:`layers.${i}.k_layernorm`,name:`model.layers.${i}.self_attn.k_layernorm.weight`,length:e.head_dim}):(a.push({id:`layers.${i}.conv_in_proj`,name:`model.layers.${i}.conv.in_proj.weight`,length:3*n*n},{id:`layers.${i}.conv_weight`,name:`model.layers.${i}.conv.conv.weight`,length:n*e.conv_L_cache},{id:`layers.${i}.conv_out_proj`,name:`model.layers.${i}.conv.out_proj.weight`,length:n*n}),e.conv_bias&&a.push({id:`layers.${i}.conv_in_proj_bias`,name:`model.layers.${i}.conv.in_proj.bias`,length:3*n},{id:`layers.${i}.conv_bias`,name:`model.layers.${i}.conv.conv.bias`,length:n},{id:`layers.${i}.conv_out_proj_bias`,name:`model.layers.${i}.conv.out_proj.bias`,length:n})),a.push({id:`layers.${i}.gate_proj`,name:`model.layers.${i}.feed_forward.w1.weight`,length:t*n},{id:`layers.${i}.up_proj`,name:`model.layers.${i}.feed_forward.w3.weight`,length:t*n},{id:`layers.${i}.down_proj`,name:`model.layers.${i}.feed_forward.w2.weight`,length:n*t},{id:`layers.${i}.input_layernorm`,name:`model.layers.${i}.operator_norm.weight`,length:n},{id:`layers.${i}.post_attention_layernorm`,name:`model.layers.${i}.ffn_norm.weight`,length:n});return a.push({id:"model_norm",name:"model.embedding_norm.weight",length:n},{id:"lm_head",name:"lm_head.weight",length:e.vocab_size*n}),a}function Lr(e){let n=e.metadata,t=n["general.architecture"];if(t!=="lfm2")throw new Error(`Expected lfm2 GGUF architecture, got ${JSON.stringify(t)}`);let r=Number(n["lfm2.block_count"]),s=n["lfm2.attention.head_count_kv"],a=Array.isArray(s)?s.map(Number):Array.from({length:r},()=>Number(s));if(a.length!==r)throw new Error(`lfm2.attention.head_count_kv length ${a.length} != block_count ${r}`);let i=a.map(u=>u>0?"full_attention":"conv"),o=Math.max(...a);if(!(o>0))throw new Error("lfm2 GGUF has no attention layers (all head_count_kv are 0)");return new qr({vocab_size:Number(n["lfm2.vocab_size"]??e.info("token_embd.weight").shape[0]),hidden_size:Number(n["lfm2.embedding_length"]),intermediate_size:Number(n["lfm2.feed_forward_length"]),num_hidden_layers:r,num_attention_heads:Number(n["lfm2.attention.head_count"]),num_key_value_heads:o,max_position_embeddings:Number(n["lfm2.context_length"]),norm_eps:Number(n["lfm2.attention.layer_norm_rms_epsilon"]),rope_parameters:{rope_theta:Number(n["lfm2.rope.freq_base"]),rope_type:"default"},conv_L_cache:Number(n["lfm2.shortconv.l_cache"]),conv_bias:!1,block_auto_adjust_ff_dim:!1,block_multiple_of:1,block_ffn_dim_multiplier:1,layer_types:i,eos_token_id:n["tokenizer.ggml.eos_token_id"],bos_token_id:n["tokenizer.ggml.bos_token_id"],pad_token_id:n["tokenizer.ggml.padding_token_id"],tie_word_embeddings:!0})}function kg(e){if(!e.block_auto_adjust_ff_dim)return e.intermediate_size;let n=Math.trunc(2*e.intermediate_size/3);return n=Math.trunc(e.block_ffn_dim_multiplier*n),e.block_multiple_of*Math.ceil(n/e.block_multiple_of)}var Au="LiquidAI/LFM2.5-350M-GGUF",l2="LFM2.5-350M-Q4_0.gguf",Or=.9;function Pu(e,n,t="main"){let r=e??Au;return co(r,{revision:t,file:n??Sg(r)})}function Sg(e){return e.toLowerCase().endsWith(".gguf")?void 0:`${(e.split("/").pop()??e).replace(/-GGUF$/i,"")}-Q4_0.gguf`}var na=class e{static DEFAULT_MODEL_ID=Au;#n;#e;#t;#r;#d;#l;#i;#o;#s=[];#u=!1;constructor(n){this.#n=n.runtime,this.#e=n.ownsRuntime,this.#t=n.model,this.#r=n.tokenizer,this.#d=n.chatTemplate,this.#l=n.tokenizerConfig,this.#i=n.eosTokenIds;let t=_r(n.model),r=Math.max(1,Math.min(n.maxLength??t,t));this.#o=n.model.createGenerationState({maxLength:r})}static async checkAvailability(n=null,t={}){let r=globalThis.navigator?.gpu;if(!r)return{ok:!1,reason:"WebGPU isn't available in this browser. Try a recent Chrome or Edge."};let s=null;try{s=await r.requestAdapter({powerPreference:"high-performance"})}catch{}if(!s)return{ok:!1,reason:"No WebGPU adapter is available on this device."};let a=Pu(n,t.file,t.revision??"main"),i=t.fetch??(t.accessToken?Ds(t.accessToken):void 0);try{let o=await Ts(a,{fetch:i,signal:t.signal}),u=Js(Lr(o),s,o);return u?{ok:!1,reason:u}:{ok:!0}}catch{return{ok:!0}}}static async load(n=null,t={}){let r=t.onProgress??(()=>{}),s=Pu(n,t.file,t.revision??"main"),a=t.fetch??(t.accessToken?Ds(t.accessToken):void 0);r({status:"init",message:"Requesting WebGPU device"});let i=t.runtime??await Ai(t.runtimeOptions??{}),o=!t.runtime;i.captureShaders=!0;try{r({status:"init",message:"Checking device support"});let u=null;try{u=await Ts(s,{fetch:a,signal:t.signal})}catch{}if(u){let m=Js(Lr(u),i.device,u);if(m)throw new Error(m)}r({status:"weights",kind:"bytes",message:"Downloading model",loaded:0,total:null});let l=await ao(s,{fetch:a,signal:t.signal,cache:t.cache,force:t.force,cacheName:t.cacheName,onProgress:m=>{let g=un(m.total)&&m.total>0?m.loaded/m.total*Or:void 0;r({status:"weights",kind:"bytes",loaded:m.loaded,total:un(m.total)?m.total:null,fraction:g,fromCache:m.fromCache,message:m.fromCache?"Loading cached model":"Downloading model"})}});r({status:"tokenizer",message:"Loading tokenizer"}),await zu();let{tokenizer:d,chatTemplate:c,tokenizerConfig:p,eosTokenIds:f}=Tg(l);await zu(),r({status:"weights",kind:"tensors",message:"Preparing GPU weights",fraction:Or});let h=await Dn.loadGGUF(i,{gguf:l,onProgress:m=>{let g=un(m.total)&&m.total>0?m.processed/m.total:void 0;r({status:"weights",kind:"tensors",loaded:m.processed,total:un(m.total)?m.total:null,fraction:un(g)?Or+(1-Or)*g:void 0,message:"Preparing GPU weights"})}});return r({status:"ready",message:"Ready",fraction:1}),new e({runtime:i,ownsRuntime:o,model:h,tokenizer:d,chatTemplate:c,tokenizerConfig:p,eosTokenIds:f,maxLength:t.maxLength})}catch(u){throw o&&await i.destroy(),u}}get runtime(){return this.#n}encodePrompt(n){let t=this.#d.render({messages:n,tools:null,bos_token:this.#l.bos_token,eos_token:this.#l.eos_token,add_generation_prompt:!0});return this.#r.encode(t,{add_special_tokens:!1}).ids}async*generate(n,t={}){if(this.#u)throw new Error("Lfm2Mobile has been disposed");let r=t.maxNewTokens??1024,s=t.eosTokenId??this.#i,a=this.encodePrompt(n),i=po(this.#s,a);i!==this.#s.length&&(this.#a(),i=0);let o=a.slice(i);o.length===0&&(this.#a(),o=a.slice());let u=[],l="",d=!1;try{for await(let c of this.#t.streamTokenIdsFromCache({input_ids:[o],generation_state:this.#o,max_new_tokens:r,eos_token_id:s,stop_on_eos:!0})){if(t.signal?.aborted){d=!0;break}u.push(c);let p=this.#r.decode(u,{skip_special_tokens:!0}),f=p.startsWith(l)?p.slice(l.length):this.#r.decode([c],{skip_special_tokens:!0});l=p,yield{token:c,delta:f,text:l}}}finally{if(d)this.#a();else{let c=u.length<r;this.#s=a.concat(c?u:u.slice(0,-1))}}}async complete(n,t={}){let r="";for await(let s of this.generate(n,t))r=s.text;return r}async warmup(){if(this.#u)return;let n=this.encodePrompt([{role:"user",content:"Hello"}]);for(let t of[6,8,128]){for await(let r of this.#t.streamTokenIdsFromCache({input_ids:[n],generation_state:this.#o,max_new_tokens:t,eos_token_id:this.#i,stop_on_eos:!1}));this.#a()}}deviceInfo(){let n=this.#n.device,t=n.adapterInfo,r=s=>{try{return n.features.has(s)}catch{return!1}};return{vendor:t.vendor??"",architecture:t.architecture??"",device:t.device??"",description:t.description??"",isFallbackAdapter:t.isFallbackAdapter===!0,subgroupMinSize:t.subgroupMinSize,subgroupMaxSize:t.subgroupMaxSize,features:{shaderF16:r("shader-f16"),subgroups:r("subgroups"),timestampQuery:r("timestamp-query")}}}reset(){this.#a()}#a(){this.#o.cache.truncate(0),this.#s=[]}dispose(){this.#u||(this.#u=!0,this.#t.dispose(),this.#e&&this.#n.destroy())}};function zu(){return typeof requestAnimationFrame=="function"?new Promise(e=>requestAnimationFrame(()=>e())):new Promise(e=>setTimeout(e,0))}function Tg(e){let n=e.metadata,t=mo(n),r=fo(n),s=new La(r,t),a=typeof t.chat_template=="string"?t.chat_template:Es(n);if(!a)throw new Error("LFM2 GGUF metadata is missing a chat_template");let i=xg(t,s);return{tokenizer:s,chatTemplate:new St(a),tokenizerConfig:t,eosTokenIds:i}}function xg(e,n){let t=new Set,r=e.eos_token_id;if(un(r)&&t.add(r),typeof e.eos_token=="string"){let s=n.token_to_id(e.eos_token);un(s)&&t.add(s)}if(t.size===0)throw new Error("LFM2 GGUF metadata has no eos token id");return[...t]}var d2=na;export{l2 as DEFAULT_GGUF_FILE,Au as DEFAULT_MODEL_ID,na as Lfm2Mobile,d2 as default,Pu as resolveGGUFUrl};
