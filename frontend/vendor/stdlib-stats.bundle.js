var stdlib=(()=>{var uk=Object.create;var ha=Object.defineProperty;var sk=Object.getOwnPropertyDescriptor;var ok=Object.getOwnPropertyNames;var vk=Object.getPrototypeOf,fk=Object.prototype.hasOwnProperty;var u=(r,e)=>()=>{try{return e||r((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}},lk=(r,e)=>{for(var t in e)ha(r,t,{get:e[t],enumerable:!0})},lf=(r,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of ok(e))!fk.call(r,a)&&a!==t&&ha(r,a,{get:()=>e[a],enumerable:!(i=sk(e,a))||i.enumerable});return r};var Oe=(r,e,t)=>(t=r!=null?uk(vk(r)):{},lf(e||!r||!r.__esModule?ha(t,"default",{value:r,enumerable:!0}):t,r)),ck=r=>lf(ha({},"__esModule",{value:!0}),r);var pf=u((awr,cf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pk=typeof Object.defineProperty=="function"?Object.defineProperty:null;cf.exports=pk});var hf=u((nwr,mf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mk=pf();function hk(){try{return mk({},"x",{}),!0}catch{return!1}}mf.exports=hk});var yf=u((uwr,gf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gk=Object.defineProperty;gf.exports=gk});var d0=u((swr,qf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function yk(r){return typeof r=="number"}qf.exports=yk});var b0=u((owr,df)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function qk(r){return r[0]==="-"}function wf(r){var e="",t;for(t=0;t<r;t++)e+="0";return e}function wk(r,e,t){var i=!1,a=e-r.length;return a<0||(qk(r)&&(i=!0,r=r.substr(1)),r=t?r+wf(a):wf(a)+r,i&&(r="-"+r)),r}df.exports=wk});var Tf=u((vwr,Ef)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dk=d0(),bf=b0(),bk=String.prototype.toLowerCase,_f=String.prototype.toUpperCase;function _k(r){var e,t,i;switch(r.specifier){case"b":e=2;break;case"o":e=8;break;case"x":case"X":e=16;break;default:e=10;break}if(t=r.arg,i=parseInt(t,10),!isFinite(i)){if(!dk(t))throw new Error("invalid integer. Value: "+t);i=0}return i<0&&(r.specifier==="u"||e!==10)&&(i=4294967295+i+1),i<0?(t=(-i).toString(e),r.precision&&(t=bf(t,r.precision,r.padRight)),t="-"+t):(t=i.toString(e),!i&&!r.precision?t="":r.precision&&(t=bf(t,r.precision,r.padRight)),r.sign&&(t=r.sign+t)),e===16&&(r.alternate&&(t="0x"+t),t=r.specifier===_f.call(r.specifier)?_f.call(t):bk.call(t)),e===8&&r.alternate&&t.charAt(0)!=="0"&&(t="0"+t),t}Ef.exports=_k});var Of=u((fwr,Af)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Ek(r){return typeof r=="string"}Af.exports=Ek});var Nf=u((lwr,Sf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Tk=Math.abs,Ak=String.prototype.toLowerCase,If=String.prototype.toUpperCase,lt=String.prototype.replace,Ok=/e\+(\d)$/,Ik=/e-(\d)$/,Sk=/^(\d+)$/,Nk=/^(\d+)e/,Lk=/\.0$/,Fk=/\.0*e/,Pk=/(\..*[^0])0*e/;function Rk(r,e){var t,i;switch(e.specifier){case"e":case"E":i=r.toExponential(e.precision);break;case"f":case"F":i=r.toFixed(e.precision);break;case"g":case"G":Tk(r)<1e-4?(t=e.precision,t>0&&(t-=1),i=r.toExponential(t)):i=r.toPrecision(e.precision),e.alternate||(i=lt.call(i,Pk,"$1e"),i=lt.call(i,Fk,"e"),i=lt.call(i,Lk,""));break;default:throw new Error("invalid double notation. Value: "+e.specifier)}return i=lt.call(i,Ok,"e+0$1"),i=lt.call(i,Ik,"e-0$1"),e.alternate&&(i=lt.call(i,Sk,"$1."),i=lt.call(i,Nk,"$1.e")),r>=0&&e.sign&&(i=e.sign+i),i=e.specifier===If.call(e.specifier)?If.call(i):Ak.call(i),i}Sf.exports=Rk});var Pf=u((cwr,Ff)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Lf(r){var e="",t;for(t=0;t<r;t++)e+=" ";return e}function Vk(r,e,t){var i=e-r.length;return i<0||(r=t?r+Lf(i):Lf(i)+r),r}Ff.exports=Vk});var Vf=u((pwr,Rf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mk=Tf(),Ck=Of(),jk=d0(),Bk=Nf(),kk=Pf(),Gk=b0(),Hk=String.fromCharCode,Uk=Array.isArray;function ga(r){return r!==r}function Dk(r){var e={};return e.specifier=r.specifier,e.precision=r.precision===void 0?1:r.precision,e.width=r.width,e.flags=r.flags||"",e.mapping=r.mapping,e}function Wk(r){var e,t,i,a,n,s,o,v,l,f;if(!Uk(r))throw new TypeError("invalid argument. First argument must be an array. Value: `"+r+"`.");for(s="",o=1,l=0;l<r.length;l++)if(i=r[l],Ck(i))s+=i;else{if(e=i.precision!==void 0,i=Dk(i),!i.specifier)throw new TypeError("invalid argument. Token is missing `specifier` property. Index: `"+l+"`. Value: `"+i+"`.");for(i.mapping&&(o=i.mapping),t=i.flags,f=0;f<t.length;f++)switch(a=t.charAt(f),a){case" ":i.sign=" ";break;case"+":i.sign="+";break;case"-":i.padRight=!0,i.padZeros=!1;break;case"0":i.padZeros=t.indexOf("-")<0;break;case"#":i.alternate=!0;break;default:throw new Error("invalid flag: "+a)}if(i.width==="*"){if(i.width=parseInt(arguments[o],10),o+=1,ga(i.width))throw new TypeError("the argument for * width at position "+o+" is not a number. Value: `"+i.width+"`.");i.width<0&&(i.padRight=!0,i.width=-i.width)}if(e&&i.precision==="*"){if(i.precision=parseInt(arguments[o],10),o+=1,ga(i.precision))throw new TypeError("the argument for * precision at position "+o+" is not a number. Value: `"+i.precision+"`.");i.precision<0&&(i.precision=1,e=!1)}switch(i.arg=arguments[o],i.specifier){case"b":case"o":case"x":case"X":case"d":case"i":case"u":e&&(i.padZeros=!1),i.arg=Mk(i);break;case"s":i.maxWidth=e?i.precision:-1,i.arg=String(i.arg);break;case"c":if(!ga(i.arg)){if(n=parseInt(i.arg,10),n<0||n>127)throw new Error("invalid character code. Value: "+i.arg);i.arg=ga(n)?String(i.arg):Hk(n)}break;case"e":case"E":case"f":case"F":case"g":case"G":if(e||(i.precision=6),v=parseFloat(i.arg),!isFinite(v)){if(!jk(i.arg))throw new Error("invalid floating-point number. Value: "+s);v=i.arg,i.padZeros=!1}i.arg=Bk(v,i);break;default:throw new Error("invalid specifier: "+i.specifier)}i.maxWidth>=0&&i.arg.length>i.maxWidth&&(i.arg=i.arg.substring(0,i.maxWidth)),i.padZeros?i.arg=Gk(i.arg,i.width||i.precision,i.padRight):i.width&&(i.arg=kk(i.arg,i.width,i.padRight)),s+=i.arg||"",o+=1}return s}Rf.exports=Wk});var Cf=u((mwr,Mf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Yk=Vf();Mf.exports=Yk});var Bf=u((hwr,jf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ya=/%(?:([1-9]\d*)\$)?([0 +\-#]*)(\*|\d+)?(?:(\.)(\*|\d+)?)?[hlL]?([%A-Za-z])/g;function Kk(r){var e={mapping:r[1]?parseInt(r[1],10):void 0,flags:r[2],width:r[3],precision:r[5],specifier:r[6]};return r[4]==="."&&r[5]===void 0&&(e.precision="1"),e}function Qk(r){var e,t,i,a;for(t=[],a=0,i=ya.exec(r);i;)e=r.slice(a,ya.lastIndex-i[0].length),e.length&&t.push(e),i[6]==="%"?t.push("%"):t.push(Kk(i)),a=ya.lastIndex,i=ya.exec(r);return e=r.slice(a),e.length&&t.push(e),t}jf.exports=Qk});var Gf=u((gwr,kf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zk=Bf();kf.exports=Zk});var Uf=u((ywr,Hf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Jk(r){return typeof r=="string"}Hf.exports=Jk});var Yf=u((qwr,Wf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xk=Cf(),$k=Gf(),zk=Uf();function Df(r){var e,t;if(!zk(r))throw new TypeError(Df("invalid argument. First argument must be a string. Value: `%s`.",r));for(e=[$k(r)],t=1;t<arguments.length;t++)e.push(arguments[t]);return Xk.apply(null,e)}Wf.exports=Df});var S=u((wwr,Kf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xk=Yf();Kf.exports=xk});var zf=u((dwr,$f)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qf=S(),Lt=Object.prototype,Zf=Lt.toString,Jf=Lt.__defineGetter__,Xf=Lt.__defineSetter__,rG=Lt.__lookupGetter__,eG=Lt.__lookupSetter__;function tG(r,e,t){var i,a,n,s;if(typeof r!="object"||r===null||Zf.call(r)==="[object Array]")throw new TypeError(Qf("invalid argument. First argument must be an object. Value: `%s`.",r));if(typeof t!="object"||t===null||Zf.call(t)==="[object Array]")throw new TypeError(Qf("invalid argument. Property descriptor must be an object. Value: `%s`.",t));if(a="value"in t,a&&(rG.call(r,e)||eG.call(r,e)?(i=r.__proto__,r.__proto__=Lt,delete r[e],r[e]=t.value,r.__proto__=i):r[e]=t.value),n="get"in t,s="set"in t,a&&(n||s))throw new Error("invalid argument. Cannot specify one or more accessors and a value or writable attribute in the property descriptor.");return n&&Jf&&Jf.call(r,e,t.get),s&&Xf&&Xf.call(r,e,t.set),r}$f.exports=tG});var oi=u((bwr,xf)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iG=hf(),aG=yf(),nG=zf(),_0;iG()?_0=aG:_0=nG;xf.exports=_0});var e1=u((_wr,r1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uG=oi();function sG(r,e,t){uG(r,e,{configurable:!1,enumerable:!1,writable:!1,value:t})}r1.exports=sG});var N=u((Ewr,t1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oG=e1();t1.exports=oG});var a1=u((Twr,i1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vG=Math.floor;i1.exports=vG});var vr=u((Awr,n1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fG=a1();n1.exports=fG});var s1=u((Owr,u1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lG=vr();function cG(r){return lG(r)===r}u1.exports=cG});var Ir=u((Iwr,o1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pG=s1();o1.exports=pG});var E0=u((Swr,v1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mG=4294967295;v1.exports=mG});var l1=u((Nwr,f1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hG=Ir(),gG=E0();function yG(r){return r!=null&&typeof r!="function"&&typeof r.length=="number"&&hG(r.length)&&r.length>=0&&r.length<=gG}f1.exports=yG});var p1=u((Lwr,c1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qG=l1();c1.exports=qG});var h1=u((Fwr,m1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wG=p1(),dG=S();function bG(r){if(typeof r!="function")throw new TypeError(dG("invalid argument. Must provide a function. Value: `%s`.",r));return e;function e(t){var i,a;if(!wG(t)||(i=t.length,i===0))return!1;for(a=0;a<i;a++)if(r(t[a])===!1)return!1;return!0}}m1.exports=bG});var qa=u((Pwr,g1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _G=h1();g1.exports=_G});var T0=u((Rwr,y1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function EG(r){return typeof r=="number"}y1.exports=EG});var w1=u((Vwr,q1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function TG(){return typeof Symbol=="function"&&typeof Symbol("foo")=="symbol"}q1.exports=TG});var b1=u((Mwr,d1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var AG=w1();d1.exports=AG});var E1=u((Cwr,_1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var OG=b1(),IG=OG();function SG(){return IG&&typeof Symbol.toStringTag=="symbol"}_1.exports=SG});var Ft=u((jwr,T1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var NG=E1();T1.exports=NG});var A0=u((Bwr,A1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var LG=Object.prototype.toString;A1.exports=LG});var I1=u((kwr,O1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var FG=A0();function PG(r){return FG.call(r)}O1.exports=PG});var N1=u((Gwr,S1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var RG=Object.prototype.hasOwnProperty;function VG(r,e){return r==null?!1:RG.call(r,e)}S1.exports=VG});var er=u((Hwr,L1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var MG=N1();L1.exports=MG});var P1=u((Uwr,F1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CG=typeof Symbol=="function"?Symbol:void 0;F1.exports=CG});var O0=u((Dwr,R1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jG=P1();R1.exports=jG});var C1=u((Wwr,M1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var V1=O0(),BG=typeof V1=="function"?V1.toStringTag:"";M1.exports=BG});var B1=u((Ywr,j1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kG=er(),vi=C1(),I0=A0();function GG(r){var e,t,i;if(r==null)return I0.call(r);t=r[vi],e=kG(r,vi);try{r[vi]=void 0}catch{return I0.call(r)}return i=I0.call(r),e?r[vi]=t:delete r[vi],i}j1.exports=GG});var ur=u((Kwr,k1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HG=Ft(),UG=I1(),DG=B1(),S0;HG()?S0=DG:S0=UG;k1.exports=S0});var H1=u((Qwr,G1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/G1.exports=Number});var wa=u((Zwr,U1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var WG=H1();U1.exports=WG});var W1=u((Jwr,D1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YG=wa(),KG=YG.prototype.toString;D1.exports=KG});var K1=u((Xwr,Y1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var QG=W1();function ZG(r){try{return QG.call(r),!0}catch{return!1}}Y1.exports=ZG});var N0=u(($wr,Q1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var JG=Ft(),XG=ur(),$G=wa(),zG=K1(),xG=JG();function rH(r){return typeof r=="object"?r instanceof $G?!0:xG?zG(r):XG(r)==="[object Number]":!1}Q1.exports=rH});var J1=u((zwr,Z1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eH=T0(),tH=N0();function iH(r){return eH(r)||tH(r)}Z1.exports=iH});var Er=u((xwr,$1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var X1=N(),L0=J1(),aH=T0(),nH=N0();X1(L0,"isPrimitive",aH);X1(L0,"isObject",nH);$1.exports=L0});var da=u((rdr,x1)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var z1=N(),F0=qa(),P0=Er(),uH=F0(P0.isPrimitive),sH=F0(P0.isObject),R0=F0(P0);z1(R0,"primitives",uH);z1(R0,"objects",sH);x1.exports=R0});var X=u((edr,rl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oH=Number.POSITIVE_INFINITY;rl.exports=oH});var mr=u((tdr,el)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vH=wa(),fH=vH.NEGATIVE_INFINITY;el.exports=fH});var V0=u((idr,tl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lH=X(),cH=mr(),pH=Ir();function mH(r){return r<lH&&r>cH&&pH(r)}tl.exports=mH});var M0=u((adr,il)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hH=Er().isPrimitive,gH=V0();function yH(r){return hH(r)&&gH(r)}il.exports=yH});var C0=u((ndr,al)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qH=Er().isObject,wH=V0();function dH(r){return qH(r)&&wH(r.valueOf())}al.exports=dH});var ul=u((udr,nl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bH=M0(),_H=C0();function EH(r){return bH(r)||_H(r)}nl.exports=EH});var dr=u((sdr,ol)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var sl=N(),j0=ul(),TH=M0(),AH=C0();sl(j0,"isPrimitive",TH);sl(j0,"isObject",AH);ol.exports=j0});var B0=u((odr,vl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var OH=dr().isPrimitive;function IH(r){return OH(r)&&r>=0}vl.exports=IH});var k0=u((vdr,fl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var SH=dr().isObject;function NH(r){return SH(r)&&r.valueOf()>=0}fl.exports=NH});var cl=u((fdr,ll)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var LH=B0(),FH=k0();function PH(r){return LH(r)||FH(r)}ll.exports=PH});var ke=u((ldr,ml)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pl=N(),G0=cl(),RH=B0(),VH=k0();pl(G0,"isPrimitive",RH);pl(G0,"isObject",VH);ml.exports=G0});var H0=u((cdr,hl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var MH=9007199254740991;hl.exports=MH});var yl=u((pdr,gl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CH=ke().isPrimitive,jH=H0();function BH(r){return r!==null&&typeof r=="object"&&CH(r.length)&&r.length<=jH&&typeof r.BYTES_PER_ELEMENT=="number"&&typeof r.byteOffset=="number"&&typeof r.byteLength=="number"}gl.exports=BH});var ba=u((mdr,ql)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kH=yl();ql.exports=kH});var dl=u((hdr,wl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var GH=oi();function HH(r,e,t){GH(r,e,{configurable:!1,enumerable:!0,writable:!1,value:t})}wl.exports=HH});var ct=u((gdr,bl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var UH=dl();bl.exports=UH});var El=u((ydr,_l)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function DH(r){return r!==r}_l.exports=DH});var B=u((qdr,Tl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var WH=El();Tl.exports=WH});var Ol=u((wdr,Al)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YH=ur(),KH=typeof Uint32Array=="function";function QH(r){return KH&&r instanceof Uint32Array||YH(r)==="[object Uint32Array]"}Al.exports=QH});var Sl=u((ddr,Il)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ZH=Ol();Il.exports=ZH});var U0=u((bdr,Nl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var JH=4294967295;Nl.exports=JH});var Fl=u((_dr,Ll)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var XH=typeof Uint32Array=="function"?Uint32Array:null;Ll.exports=XH});var Vl=u((Edr,Rl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $H=Sl(),D0=U0(),Pl=Fl();function zH(){var r,e;if(typeof Pl!="function")return!1;try{e=[1,3.14,-3.14,D0+1,D0+2],e=new Pl(e),r=$H(e)&&e[0]===1&&e[1]===3&&e[2]===D0-2&&e[3]===0&&e[4]===1}catch{r=!1}return r}Rl.exports=zH});var Cl=u((Tdr,Ml)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xH=Vl();Ml.exports=xH});var Bl=u((Adr,jl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rU=typeof Uint32Array=="function"?Uint32Array:void 0;jl.exports=rU});var Gl=u((Odr,kl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function eU(){throw new Error("not implemented")}kl.exports=eU});var Ge=u((Idr,Hl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tU=Cl(),iU=Bl(),aU=Gl(),W0;tU()?W0=iU:W0=aU;Hl.exports=W0});var Dl=u((Sdr,Ul)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nU=ur(),uU=typeof Float64Array=="function";function sU(r){return uU&&r instanceof Float64Array||nU(r)==="[object Float64Array]"}Ul.exports=sU});var Yl=u((Ndr,Wl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oU=Dl();Wl.exports=oU});var Ql=u((Ldr,Kl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vU=typeof Float64Array=="function"?Float64Array:null;Kl.exports=vU});var Xl=u((Fdr,Jl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fU=Yl(),Zl=Ql();function lU(){var r,e;if(typeof Zl!="function")return!1;try{e=new Zl([1,3.14,-3.14,NaN]),r=fU(e)&&e[0]===1&&e[1]===3.14&&e[2]===-3.14&&e[3]!==e[3]}catch{r=!1}return r}Jl.exports=lU});var zl=u((Pdr,$l)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cU=Xl();$l.exports=cU});var rc=u((Rdr,xl)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pU=typeof Float64Array=="function"?Float64Array:void 0;xl.exports=pU});var tc=u((Vdr,ec)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function mU(){throw new Error("not implemented")}ec.exports=mU});var Tr=u((Mdr,ic)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hU=zl(),gU=rc(),yU=tc(),Y0;hU()?Y0=gU:Y0=yU;ic.exports=Y0});var nc=u((Cdr,ac)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qU=ur(),wU=typeof Uint8Array=="function";function dU(r){return wU&&r instanceof Uint8Array||qU(r)==="[object Uint8Array]"}ac.exports=dU});var sc=u((jdr,uc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bU=nc();uc.exports=bU});var vc=u((Bdr,oc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _U=255;oc.exports=_U});var lc=u((kdr,fc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var EU=typeof Uint8Array=="function"?Uint8Array:null;fc.exports=EU});var mc=u((Gdr,pc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var TU=sc(),K0=vc(),cc=lc();function AU(){var r,e;if(typeof cc!="function")return!1;try{e=[1,3.14,-3.14,K0+1,K0+2],e=new cc(e),r=TU(e)&&e[0]===1&&e[1]===3&&e[2]===K0-2&&e[3]===0&&e[4]===1}catch{r=!1}return r}pc.exports=AU});var gc=u((Hdr,hc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var OU=mc();hc.exports=OU});var qc=u((Udr,yc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var IU=typeof Uint8Array=="function"?Uint8Array:void 0;yc.exports=IU});var dc=u((Ddr,wc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function SU(){throw new Error("not implemented")}wc.exports=SU});var He=u((Wdr,bc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var NU=gc(),LU=qc(),FU=dc(),Q0;NU()?Q0=LU:Q0=FU;bc.exports=Q0});var Ec=u((Ydr,_c)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var PU=ur(),RU=typeof Uint16Array=="function";function VU(r){return RU&&r instanceof Uint16Array||PU(r)==="[object Uint16Array]"}_c.exports=VU});var Ac=u((Kdr,Tc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var MU=Ec();Tc.exports=MU});var Ic=u((Qdr,Oc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CU=65535;Oc.exports=CU});var Nc=u((Zdr,Sc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jU=typeof Uint16Array=="function"?Uint16Array:null;Sc.exports=jU});var Pc=u((Jdr,Fc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var BU=Ac(),Z0=Ic(),Lc=Nc();function kU(){var r,e;if(typeof Lc!="function")return!1;try{e=[1,3.14,-3.14,Z0+1,Z0+2],e=new Lc(e),r=BU(e)&&e[0]===1&&e[1]===3&&e[2]===Z0-2&&e[3]===0&&e[4]===1}catch{r=!1}return r}Fc.exports=kU});var Vc=u((Xdr,Rc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var GU=Pc();Rc.exports=GU});var Cc=u(($dr,Mc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HU=typeof Uint16Array=="function"?Uint16Array:void 0;Mc.exports=HU});var Bc=u((zdr,jc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function UU(){throw new Error("not implemented")}jc.exports=UU});var X0=u((xdr,kc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DU=Vc(),WU=Cc(),YU=Bc(),J0;DU()?J0=WU:J0=YU;kc.exports=J0});var Hc=u((rbr,Gc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var KU=He(),QU=X0(),ZU={uint16:QU,uint8:KU};Gc.exports=ZU});var Yc=u((ebr,Wc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Uc=Hc(),Dc;function JU(){var r,e;return r=new Uc.uint16(1),r[0]=4660,e=new Uc.uint8(r.buffer),e[0]===52}Dc=JU();Wc.exports=Dc});var $r=u((tbr,Kc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var XU=Yc();Kc.exports=XU});var Zc=u((ibr,Qc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $U=$r(),$0;$U===!0?$0=1:$0=0;Qc.exports=$0});var $c=u((abr,Xc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zU=Ge(),xU=Tr(),rD=Zc(),Jc=new xU(1),eD=new zU(Jc.buffer);function tD(r){return Jc[0]=r,eD[rD]}Xc.exports=tD});var Pr=u((nbr,zc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iD=$c();zc.exports=iD});var r2=u((ubr,xc)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var aD=$r(),z0;aD===!0?z0=1:z0=0;xc.exports=z0});var t2=u((sbr,e2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nD=Ge(),uD=Tr(),sD=r2(),x0=new uD(1),oD=new nD(x0.buffer);function vD(r,e){return x0[0]=r,oD[sD]=e>>>0,x0[0]}e2.exports=vD});var Pt=u((obr,i2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fD=t2();i2.exports=fD});var u2=u((vbr,n2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lD=$r(),a2,ru,eu;lD===!0?(ru=1,eu=0):(ru=0,eu=1);a2={HIGH:ru,LOW:eu};n2.exports=a2});var l2=u((fbr,f2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cD=Ge(),pD=Tr(),o2=u2(),v2=new pD(1),s2=new cD(v2.buffer),mD=o2.HIGH,hD=o2.LOW;function gD(r,e){return s2[mD]=r,s2[hD]=e,v2[0]}f2.exports=gD});var fi=u((lbr,c2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yD=l2();c2.exports=yD});var Ue=u((cbr,p2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qD=1023;p2.exports=qD});var h2=u((pbr,m2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wD=.34657359027997264;m2.exports=wD});var y2=u((mbr,g2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function dD(r){return r===0?-.03333333333333313:-.03333333333333313+r*(.0015873015872548146+r*(-793650757867488e-19+r*(4008217827329362e-21+r*-20109921818362437e-23)))}g2.exports=dD});var E2=u((hbr,_2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FDLIBM]{@link http://www.netlib.org/fdlibm/s_expm1.c} and [FreeBSD]{@link https://svnweb.freebsd.org/base/release/12.2.0/lib/msun/src/s_expm1.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var bD=B(),q2=Pr(),tu=Pt(),_D=fi(),w2=X(),ED=mr(),d2=Ue(),TD=h2(),AD=y2(),OD=709.782712893384,iu=.6931471803691238,au=19082149292705877e-26,b2=1.4426950408889634,ID=38.816242111356935,SD=1.0397207708399179;function ND(r){var e,t,i,a,n,s,o,v,l,f,c,p,m;if(r===w2||bD(r))return r;if(r===ED)return-1;if(r===0)return r;if(r<0?(i=!0,v=-r):(i=!1,v=r),v>=ID){if(i)return-1;if(v>=OD)return w2}if(s=q2(v)|0,v>TD)v<SD?i?(a=r+iu,n=-au,m=-1):(a=r-iu,n=au,m=1):(i?m=b2*r-.5:m=b2*r+.5,m|=0,c=m,a=r-c*iu,n=c*au),r=a-n,f=a-r-n;else{if(s<1016070144)return r;m=0}return e=.5*r,l=r*e,o=1+l*AD(l),c=3-o*e,p=l*((o-c)/(6-r*c)),m===0?r-(r*p-l):(t=_D(d2+m<<20,0),p=r*(p-f)-f,p-=l,m===-1?.5*(r-p)-.5:m===1?r<-.25?-2*(p-(r+.5)):1+2*(r-p):m<=-2||m>56?(v=1-(p-r),m===1024?(a=q2(v)+(m<<20)|0,v=tu(v,a)):v*=t,v-1):(c=1,m<20?(a=1072693248-(2097152>>m)|0,c=tu(c,a),v=c-(p-r)):(a=d2-m<<20|0,c=tu(c,a),v=r-(p+c),v+=1),v*=t,v))}_2.exports=ND});var pt=u((gbr,T2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var LD=E2();T2.exports=LD});var O2=u((ybr,A2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function FD(r){return r===0?.6666666666666735:.6666666666666735+r*(.3999999999940942+r*(.2857142874366239+r*(.22222198432149784+r*(.1818357216161805+r*(.15313837699209373+r*.14798198605116586)))))}A2.exports=FD});var F2=u((qbr,L2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FDLIBM]{@link http://www.netlib.org/fdlibm/s_log1p.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var PD=B(),I2=Pr(),S2=Pt(),RD=X(),VD=mr(),N2=Ue(),MD=O2(),nu=.6931471803691238,uu=19082149292705877e-26,CD=.41421356237309503,jD=-.2928932188134525,BD=1862645149230957e-24,kD=5551115123125783e-32,GD=9007199254740992,HD=.6666666666666666;function UD(r){var e,t,i,a,n,s,o,v,l,f;if(r<-1||PD(r))return NaN;if(r===-1)return VD;if(r===RD||r===0)return r;if(r<0?i=-r:i=r,f=1,i<CD){if(i<BD)return i<kD?r:r-r*r*.5;r>jD&&(f=0,a=r,t=1)}return f!==0&&(i<GD?(l=1+r,t=I2(l),f=(t>>20)-N2,f>0?n=1-(l-r):n=r-(l-1),n/=l):(l=r,t=I2(l),f=(t>>20)-N2,n=0),t&=1048575,t<434334?l=S2(l,t|1072693248):(f+=1,l=S2(l,t|1071644672),t=1048576-t>>2),a=l-1),e=.5*a*a,t===0?a===0?(n+=f*uu,f*nu+n):(v=e*(1-HD*a),f*nu-(v-(f*uu+n)-a)):(s=a/(2+a),o=s*s,v=o*MD(o),f===0?a-(e-s*(e+v)):f*nu-(e-(s*(e+v)+(f*uu+n))-a))}L2.exports=UD});var oe=u((wbr,P2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DD=F2();P2.exports=DD});var V2=u((dbr,R2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var WD=Math.sqrt;R2.exports=WD});var Q=u((bbr,M2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YD=V2();M2.exports=YD});var su=u((_br,C2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var KD=.7853981633974483;C2.exports=KD});var B2=u((Ebr,j2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function QD(r){var e,t,i;return r===0?.16666666666666713:(r<0?e=-r:e=r,e<=1?(t=-8.198089802484825+r*(19.562619833175948+r*(-16.262479672107002+r*(5.444622390564711+r*(-.6019598008014124+r*.004253011369004428)))),i=-49.18853881490881+r*(139.51056146574857+r*(-147.1791292232726+r*(70.49610280856842+r*(-14.740913729888538+r*1))))):(r=1/r,t=.004253011369004428+r*(-.6019598008014124+r*(5.444622390564711+r*(-16.262479672107002+r*(19.562619833175948+r*-8.198089802484825)))),i=1+r*(-14.740913729888538+r*(70.49610280856842+r*(-147.1791292232726+r*(139.51056146574857+r*-49.18853881490881))))),t/i)}j2.exports=QD});var G2=u((Tbr,k2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function ZD(r){var e,t,i;return r===0?.08333333333333809:(r<0?e=-r:e=r,e<=1?(t=28.536655482610616+r*(-25.56901049652825+r*(6.968710824104713+r*(-.5634242780008963+r*.002967721961301243))),i=342.43986579130785+r*(-383.8770957603691+r*(147.0656354026815+r*(-21.947795316429207+r*1)))):(r=1/r,t=.002967721961301243+r*(-.5634242780008963+r*(6.968710824104713+r*(-25.56901049652825+r*28.536655482610616))),i=1+r*(-21.947795316429207+r*(147.0656354026815+r*(-383.8770957603691+r*342.43986579130785)))),t/i)}k2.exports=ZD});var D2=u((Abr,U2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, long comment, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1995, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var JD=B(),XD=Q(),H2=su(),$D=B2(),zD=G2(),xD=6123233995736766e-32;function rW(r){var e,t,i,a,n;if(JD(r))return NaN;if(r>0?i=r:(e=!0,i=-r),i>1)return NaN;if(i>.625)t=1-i,a=t*zD(t),t=XD(t+t),n=H2-t,t=t*a-xD,n-=t,n+=H2;else{if(i<1e-8)return r;t=i*i,n=t*$D(t),n=i*n+i}return e?-n:n}U2.exports=rW});var _a=u((Obr,W2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eW=D2();W2.exports=eW});var K2=u((Ibr,Y2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function tW(r){return Math.abs(r)}Y2.exports=tW});var k=u((Sbr,Q2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iW=K2();Q2.exports=iW});var J2=u((Nbr,Z2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var aW=Math.ceil;Z2.exports=aW});var $2=u((Lbr,X2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nW=J2();X2.exports=nW});var x2=u((Fbr,z2)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uW=vr(),sW=$2();function oW(r){return r<0?sW(r):uW(r)}z2.exports=oW});var li=u((Pbr,r3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vW=x2();r3.exports=vW});var t3=u((Rbr,e3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fW=1023;e3.exports=fW});var a3=u((Vbr,i3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lW=-1023;i3.exports=lW});var u3=u((Mbr,n3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cW=-1074;n3.exports=cW});var o3=u((Cbr,s3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pW=X(),mW=mr();function hW(r){return r===pW||r===mW}s3.exports=hW});var De=u((jbr,v3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gW=o3();v3.exports=gW});var l3=u((Bbr,f3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yW=2147483648;f3.exports=yW});var We=u((kbr,c3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qW=2147483647;c3.exports=qW});var h3=u((Gbr,m3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wW=$r(),p3,ou,vu;wW===!0?(ou=1,vu=0):(ou=0,vu=1);p3={HIGH:ou,LOW:vu};m3.exports=p3});var fu=u((Hbr,w3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dW=Ge(),bW=Tr(),y3=h3(),q3=new bW(1),g3=new dW(q3.buffer),_W=y3.HIGH,EW=y3.LOW;function TW(r,e,t,i){return q3[0]=r,e[i]=g3[_W],e[i+t]=g3[EW],e}w3.exports=TW});var b3=u((Ubr,d3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var AW=fu();function OW(r){return AW(r,[0,0],1,0)}d3.exports=OW});var Ea=u((Dbr,E3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var IW=N(),_3=b3(),SW=fu();IW(_3,"assign",SW);E3.exports=_3});var A3=u((Wbr,T3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var NW=l3(),LW=We(),FW=Ea(),PW=Pr(),RW=fi(),lu=[0,0];function VW(r,e){var t,i;return FW.assign(r,lu,1,0),t=lu[0],t&=LW,i=PW(e),i&=NW,t|=i,RW(t,lu[1])}T3.exports=VW});var Ta=u((Ybr,O3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var MW=A3();O3.exports=MW});var Ye=u((Kbr,I3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CW=22250738585072014e-324;I3.exports=CW});var cu=u((Qbr,S3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jW=Ye(),BW=De(),kW=B(),GW=k(),HW=4503599627370496;function UW(r,e,t,i){return kW(r)||BW(r)?(e[i]=r,e[i+t]=0,e):r!==0&&GW(r)<jW?(e[i]=r*HW,e[i+t]=-52,e):(e[i]=r,e[i+t]=0,e)}S3.exports=UW});var L3=u((Zbr,N3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DW=cu();function WW(r){return DW(r,[0,0],1,0)}N3.exports=WW});var R3=u((Jbr,P3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YW=N(),F3=L3(),KW=cu();YW(F3,"assign",KW);P3.exports=F3});var ci=u((Xbr,V3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var QW=2146435072;V3.exports=QW});var C3=u(($br,M3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ZW=Pr(),JW=ci(),XW=Ue();function $W(r){var e=ZW(r);return e=(e&JW)>>>20,e-XW|0}M3.exports=$W});var B3=u((zbr,j3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zW=C3();j3.exports=zW});var G3=u((xbr,k3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xW=X(),rY=mr(),eY=Ue(),tY=t3(),iY=a3(),aY=u3(),nY=B(),uY=De(),sY=Ta(),oY=R3().assign,vY=B3(),fY=Ea(),lY=fi(),cY=2220446049250313e-31,pY=2148532223,pu=[0,0],mu=[0,0];function mY(r,e){var t,i;return e===0||r===0||nY(r)||uY(r)?r:(oY(r,pu,1,0),r=pu[0],e+=pu[1],e+=vY(r),e<aY?sY(0,r):e>tY?r<0?rY:xW:(e<=iY?(e+=52,i=cY):i=1,fY.assign(r,mu,1,0),t=mu[0],t&=pY,t|=e+eY<<20,i*lY(t,mu[1])))}k3.exports=mY});var mt=u((r_r,H3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hY=G3();H3.exports=hY});var D3=u((e_r,U3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function gY(r){return r===0?.16666666666666602:.16666666666666602+r*(-.0027777777777015593+r*(6613756321437934e-20+r*(-16533902205465252e-22+r*41381367970572385e-24)))}U3.exports=gY});var Y3=u((t_r,W3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyrights, licenses, and long comment were part of the original implementation available as part of [Go]{@link https://github.com/golang/go/blob/cb07765045aed5104a3df31507564ac99e6ddce8/src/math/exp.go}, which in turn was based on an implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_exp.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (c) 2009 The Go Authors. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
*    * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*    * Redistributions in binary form must reproduce the above
* copyright notice, this list of conditions and the following disclaimer
* in the documentation and/or other materials provided with the
* distribution.
*    * Neither the name of Google Inc. nor the names of its
* contributors may be used to endorse or promote products derived from
* this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* ```
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var yY=mt(),qY=D3();function wY(r,e,t){var i,a,n,s;return i=r-e,a=i*i,n=i-a*qY(a),s=1-(e-i*n/(2-n)-r),yY(s,t)}W3.exports=wY});var $3=u((i_r,X3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyrights, licenses, and long comment were part of the original implementation available as part of [Go]{@link https://github.com/golang/go/blob/cb07765045aed5104a3df31507564ac99e6ddce8/src/math/exp.go}, which in turn was based on an implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_exp.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (c) 2009 The Go Authors. All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are
* met:
*
*    * Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.
*    * Redistributions in binary form must reproduce the above
* copyright notice, this list of conditions and the following disclaimer
* in the documentation and/or other materials provided with the
* distribution.
*    * Neither the name of Google Inc. nor the names of its
* contributors may be used to endorse or promote products derived from
* this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
* "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
* LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
* A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
* OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
* LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
* THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
* ```
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var dY=B(),K3=li(),bY=mr(),Q3=X(),_Y=Y3(),EY=.6931471803691238,TY=19082149292705877e-26,Z3=1.4426950408889634,AY=709.782712893384,OY=-745.1332191019411,J3=1/(1<<28),IY=-J3;function SY(r){var e,t,i;return dY(r)||r===Q3?r:r===bY?0:r>AY?Q3:r<OY?0:r>IY&&r<J3?1+r:(r<0?i=K3(Z3*r-.5):i=K3(Z3*r+.5),e=r-i*EY,t=i*TY,_Y(e,t,i))}X3.exports=SY});var rr=u((a_r,z3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var NY=$3();z3.exports=NY});var rp=u((n_r,x3)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var LY=Ir();function FY(r){return LY(r/2)}x3.exports=FY});var Aa=u((u_r,ep)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var PY=rp();ep.exports=PY});var ap=u((s_r,ip)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tp=Aa();function RY(r){return r>0?tp(r-1):tp(r+1)}ip.exports=RY});var Oa=u((o_r,np)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var VY=ap();np.exports=VY});var sp=u((v_r,up)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var MY=$r(),hu;MY===!0?hu=0:hu=1;up.exports=hu});var vp=u((f_r,op)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var CY=Ge(),jY=Tr(),BY=sp(),gu=new jY(1),kY=new CY(gu.buffer);function GY(r,e){return gu[0]=r,kY[BY]=e>>>0,gu[0]}op.exports=GY});var Rt=u((l_r,fp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HY=vp();fp.exports=HY});var cp=u((c_r,lp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function UY(r){return r|0}lp.exports=UY});var yu=u((p_r,pp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DY=cp();pp.exports=DY});var gp=u((m_r,hp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var mp=Oa(),WY=Ta(),YY=mr(),Ia=X();function KY(r,e){return e===YY?Ia:e===Ia?0:e>0?mp(e)?r:0:mp(e)?WY(Ia,r):Ia}hp.exports=KY});var qp=u((h_r,yp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var QY=We(),ZY=Pr(),JY=1072693247,Sa=1e300,Na=1e-300;function XY(r,e){var t,i;return i=ZY(r),t=i&QY,t<=JY?e<0?Sa*Sa:Na*Na:e>0?Sa*Sa:Na*Na}yp.exports=XY});var bp=u((g_r,dp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $Y=k(),wp=X();function zY(r,e){return r===-1?(r-r)/(r-r):r===1?1:$Y(r)<1==(e===wp)?0:wp}dp.exports=zY});var qu=u((y_r,_p)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xY=20;_p.exports=xY});var Tp=u((q_r,Ep)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function rK(r){return r===0?.5999999999999946:.5999999999999946+r*(.4285714285785502+r*(.33333332981837743+r*(.272728123808534+r*(.23066074577556175+r*.20697501780033842))))}Ep.exports=rK});var Sp=u((w_r,Ip)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var eK=Pr(),La=Rt(),Ap=Pt(),tK=Ue(),iK=qu(),aK=Tp(),nK=1048575,Op=1048576,uK=1072693248,sK=536870912,oK=524288,vK=9007199254740992,fK=.9617966939259756,lK=.9617967009544373,cK=-7028461650952758e-24,pK=[1,1.5],mK=[0,.5849624872207642],hK=[0,1350039202129749e-23];function gK(r,e,t){var i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E,d,C;return E=0,t<Op&&(e*=vK,E-=53,t=eK(e)),E+=(t>>iK)-tK|0,d=t&nK|0,t=d|uK|0,d<=235662?C=0:d<767610?C=1:(C=0,E+=1,t-=Op),e=Ap(e,t),f=pK[C],A=e-f,_=1/(e+f),a=A*_,s=La(a,0),i=(t>>1|sK)+oK,i+=C<<18,v=Ap(0,i),l=e-(v-f),o=_*(A-s*v-s*l),n=a*a,q=n*n*aK(n),q+=o*(s+a),n=s*s,v=3+n+q,v=La(v,0),l=q-(v-3-n),A=s*v,_=o*v+l*a,p=A+_,p=La(p,0),m=_-(p-A),h=lK*p,g=cK*p+m*fK+hK[C],c=mK[C],b=E,w=h+g+c+b,w=La(w,0),y=g-(w-b-c-h),r[0]=w,r[1]=y,r}Ip.exports=gK});var Lp=u((d_r,Np)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function yK(r){return r===0?.5:.5+r*(-.3333333333333333+r*.25)}Np.exports=yK});var Pp=u((b_r,Fp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var qK=Rt(),wK=Lp(),dK=1.4426950408889634,bK=1.4426950216293335,_K=19259629911266175e-24;function EK(r,e){var t,i,a,n,s,o;return a=e-1,n=a*a*wK(a),s=bK*a,o=a*_K-n*dK,i=s+o,i=qK(i,0),t=o-(i-s),r[0]=i,r[1]=t,r}Fp.exports=EK});var Fa=u((__r,Rp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var TK=.6931471805599453;Rp.exports=TK});var wu=u((E_r,Vp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var AK=1048575;Vp.exports=AK});var Cp=u((T_r,Mp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function OK(r){return r===0?.16666666666666602:.16666666666666602+r*(-.0027777777777015593+r*(6613756321437934e-20+r*(-16533902205465252e-22+r*41381367970572385e-24)))}Mp.exports=OK});var Dp=u((A_r,Up)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var IK=Pr(),jp=Pt(),SK=Rt(),NK=yu(),LK=mt(),FK=Fa(),Bp=Ue(),kp=We(),Gp=wu(),pi=qu(),PK=Cp(),Hp=1048576,RK=1071644672,VK=.6931471824645996,MK=-1904654299957768e-24;function CK(r,e,t){var i,a,n,s,o,v,l,f,c,p,m;return p=r&kp|0,m=(p>>pi)-Bp|0,c=0,p>RK&&(c=r+(Hp>>m+1)>>>0,m=((c&kp)>>pi)-Bp|0,i=(c&~(Gp>>m))>>>0,n=jp(0,i),c=(c&Gp|Hp)>>pi-m>>>0,r<0&&(c=-c),e-=n),n=t+e,n=SK(n,0),o=n*VK,v=(t-(n-e))*FK+n*MK,f=o+v,l=v-(f-o),n=f*f,a=f-n*PK(n),s=f*a/(a-2)-(l+f*l),f=1-(s-f),r=IK(f),r=NK(r),r+=c<<pi>>>0,r>>pi<=0?f=LK(f,c):f=jp(f,r),f}Up.exports=CK});var r6=u((O_r,xp)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_pow.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var Wp=B(),Yp=Oa(),Kp=De(),jK=Ir(),Qp=Q(),BK=k(),du=Ea(),kK=Rt(),Zp=yu(),GK=mr(),HK=X(),bu=We(),UK=gp(),DK=qp(),WK=bp(),YK=Sp(),KK=Pp(),QK=Dp(),ZK=1072693247,JK=1105199104,XK=1139802112,Jp=1083179008,$K=1072693248,zK=1083231232,xK=3230714880,Xp=31,Ke=1e300,Qe=1e-300,rQ=8008566259537294e-32,Ie=[0,0],$p=[0,0];function zp(r,e){var t,i,a,n,s,o,v,l,f,c,p,m,h,g,w,y;if(Wp(r)||Wp(e))return NaN;if(du.assign(e,Ie,1,0),o=Ie[0],v=Ie[1],v===0){if(e===0)return 1;if(e===1)return r;if(e===-1)return 1/r;if(e===.5)return Qp(r);if(e===-.5)return 1/Qp(r);if(e===2)return r*r;if(e===3)return r*r*r;if(e===4)return r*=r,r*r;if(Kp(e))return WK(r,e)}if(du.assign(r,Ie,1,0),n=Ie[0],s=Ie[1],s===0){if(n===0)return UK(r,e);if(r===1)return 1;if(r===-1&&Yp(e))return-1;if(Kp(r))return r===GK?zp(-0,-e):e<0?0:HK}if(r<0&&jK(e)===!1)return(r-r)/(r-r);if(a=BK(r),t=n&bu|0,i=o&bu|0,l=n>>>Xp|0,f=o>>>Xp|0,l&&Yp(e)?l=-1:l=1,i>JK){if(i>XK)return DK(r,e);if(t<ZK)return f===1?l*Ke*Ke:l*Qe*Qe;if(t>$K)return f===0?l*Ke*Ke:l*Qe*Qe;h=KK($p,a)}else h=YK($p,a,t);if(c=kK(e,0),m=(e-c)*h[0]+e*h[1],p=c*h[0],g=m+p,du.assign(g,Ie,1,0),w=Zp(Ie[0]),y=Zp(Ie[1]),w>=Jp){if((w-Jp|y)!==0||m+rQ>g-p)return l*Ke*Ke}else if((w&bu)>=zK&&((w-xK|y)!==0||m<=g-p))return l*Qe*Qe;return g=QK(w,p,m),l*g}xp.exports=zp});var tr=u((I_r,e6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eQ=r6();e6.exports=eQ});var ht=u((S_r,t6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tQ=2.718281828459045;t6.exports=tQ});var zr=u((N_r,i6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iQ=2220446049250313e-31;i6.exports=iQ});var n6=u((L_r,a6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function aQ(r){var e,t,i;return r===0?1/0:(r<0?e=-r:e=r,e<=1?(t=709811.662581658+r*(679979.8474157227+r*(293136.7857211597+r*(74887.54032914672+r*(12555.290582413863+r*(1443.4299244417066+r*(115.24194596137347+r*(6.309239205732627+r*(.22668404630224365+r*(.004826466289237662+r*4624429436045379e-20))))))))),i=0+r*(362880+r*(1026576+r*(1172700+r*(723680+r*(269325+r*(63273+r*(9450+r*(870+r*(45+r*1)))))))))):(r=1/r,t=4624429436045379e-20+r*(.004826466289237662+r*(.22668404630224365+r*(6.309239205732627+r*(115.24194596137347+r*(1443.4299244417066+r*(12555.290582413863+r*(74887.54032914672+r*(293136.7857211597+r*(679979.8474157227+r*709811.662581658))))))))),i=1+r*(45+r*(870+r*(9450+r*(63273+r*(269325+r*(723680+r*(1172700+r*(1026576+r*(362880+r*0)))))))))),t/i)}a6.exports=aQ});var o6=u((F_r,s6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{http://www.boost.org/doc/libs/1_85_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var u6=B(),nQ=oe(),uQ=Q(),sQ=k(),oQ=rr(),_u=tr(),vQ=ht(),Eu=zr(),Tu=n6(),Au=10.900511;function fQ(r,e){var t,i,a,n,s,o,v;return u6(r)||u6(e)?NaN:r<0||e<0?NaN:e===1?1/r:r===1?1/e:(v=r+e,v<Eu?(s=v/r,s/=e,s):v===r&&e<Eu?1/e:v===e&&r<Eu?1/r:(r<e&&(o=e,e=r,r=o),i=r+Au-.5,a=e+Au-.5,n=v+Au-.5,s=Tu(r)*(Tu(e)/Tu(v)),t=r-.5-e,sQ(e*t)<n*100&&r>100?s*=oQ(t*nQ(-e/n)):s*=_u(i/n,t),n>1e10?s*=_u(i/n*(a/n),e):s*=_u(i*a/(n*n),e),s*=uQ(vQ/a),s))}s6.exports=fQ});var Ou=u((P_r,v6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lQ=o6();v6.exports=lQ});var l6=u((R_r,f6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cQ=X();function pQ(r){return r===0&&1/r===cQ}f6.exports=pQ});var p6=u((V_r,c6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mQ=l6();c6.exports=mQ});var g6=u((M_r,h6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hQ=p6(),m6=B(),Iu=X();function gQ(r,e){return m6(r)||m6(e)?NaN:r===Iu||e===Iu?Iu:r===e&&r===0?hQ(r)?r:e:r>e?r:e}h6.exports=gQ});var gt=u((C_r,y6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yQ=g6();y6.exports=yQ});var w6=u((j_r,q6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qQ=mr();function wQ(r){return r===0&&1/r===qQ}q6.exports=wQ});var Pa=u((B_r,d6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dQ=w6();d6.exports=dQ});var E6=u((k_r,_6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bQ=Pa(),b6=B(),Su=mr();function _Q(r,e){return b6(r)||b6(e)?NaN:r===Su||e===Su?Su:r===e&&r===0?bQ(r)?r:e:r<e?r:e}_6.exports=_Q});var Se=u((G_r,T6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var EQ=E6();T6.exports=EQ});var Ze=u((H_r,A6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var TQ=17976931348623157e292;A6.exports=TQ});var Ra=u((U_r,O6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var AQ=2147483647;O6.exports=AQ});var Va=u((D_r,I6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var OQ=1.5707963267948966;I6.exports=OQ});var Ne=u((W_r,S6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var IQ=3.141592653589793;S6.exports=IQ});var L6=u((Y_r,N6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function SQ(r){return r===0?.0416666666666666:.0416666666666666+r*(-.001388888888887411+r*2480158728947673e-20)}N6.exports=SQ});var P6=u((K_r,F6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function NQ(r){return r===0?-27557314351390663e-23:-27557314351390663e-23+r*(2087572321298175e-24+r*-11359647557788195e-27)}F6.exports=NQ});var V6=u((Q_r,R6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/12.2.0/lib/msun/src/k_cos.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var LQ=L6(),FQ=P6();function PQ(r,e){var t,i,a,n;return n=r*r,a=n*n,i=n*LQ(n),i+=a*a*FQ(n),t=.5*n,a=1-t,a+(1-a-t+(n*i-r*e))}R6.exports=PQ});var Nu=u((Z_r,M6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var RQ=V6();M6.exports=RQ});var B6=u((J_r,j6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_sin.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var C6=-.16666666666666632,VQ=.00833333333332249,MQ=-.0001984126982985795,CQ=27557313707070068e-22,jQ=-25050760253406863e-24,BQ=158969099521155e-24;function kQ(r,e){var t,i,a,n;return n=r*r,a=n*n,t=VQ+n*(MQ+n*CQ)+n*a*(jQ+n*BQ),i=n*r,e===0?r+i*(C6+n*t):r-(n*(.5*e-i*t)-e-i*C6)}j6.exports=kQ});var Lu=u((X_r,k6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var GQ=B6();k6.exports=GQ});var H6=u(($_r,G6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HQ=$r(),Fu;HQ===!0?Fu=0:Fu=1;G6.exports=Fu});var W6=u((z_r,D6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var UQ=Ge(),DQ=Tr(),WQ=H6(),U6=new DQ(1),YQ=new UQ(U6.buffer);function KQ(r){return U6[0]=r,YQ[WQ]}D6.exports=KQ});var K6=u((x_r,Y6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var QQ=W6();Y6.exports=QQ});var Z6=u((rEr,Q6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function ZQ(r,e){var t,i;for(t=[],i=0;i<e;i++)t.push(r);return t}Q6.exports=ZQ});var Pu=u((eEr,J6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var JQ=Z6();J6.exports=JQ});var $6=u((tEr,X6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var XQ=Pu();function $Q(r){return XQ(0,r)}X6.exports=$Q});var Ma=u((iEr,z6)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zQ=$6();z6.exports=zQ});var i4=u((aEr,t4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var xQ=vr(),Ca=mt(),ka=Ma(),r4=[10680707,7228996,1387004,2578385,16069853,12639074,9804092,4427841,16666979,11263675,12935607,2387514,4345298,14681673,3074569,13734428,16653803,1880361,10960616,8533493,3062596,8710556,7349940,6258241,3772886,3769171,3798172,8675211,12450088,3874808,9961438,366607,15675153,9132554,7151469,3571407,2607881,12013382,4155038,6285869,7677882,13102053,15825725,473591,9065106,15363067,6271263,9264392,5636912,4652155,7056368,13614112,10155062,1944035,9527646,15080200,6658437,6231200,6832269,16767104,5075751,3212806,1398474,7579849,6349435,12618859],rZ=[1.570796251296997,7549789415861596e-23,5390302529957765e-30,3282003415807913e-37,1270655753080676e-44,12293330898111133e-52,27337005381646456e-60,21674168387780482e-67],Ru=16777216,Vu=5960464477539063e-23,ja=ka(20),x6=ka(20),Ba=ka(20),yr=ka(20);function e4(r,e,t,i,a,n,s,o,v){var l,f,c,p,m,h,g,w,y;for(p=n,y=i[t],w=t,m=0;w>0;m++)f=Vu*y|0,yr[m]=y-Ru*f|0,y=i[w-1]+f,w-=1;if(y=Ca(y,a),y-=8*xQ(y*.125),g=y|0,y-=g,c=0,a>0?(m=yr[t-1]>>24-a,g+=m,yr[t-1]-=m<<24-a,c=yr[t-1]>>23-a):a===0?c=yr[t-1]>>23:y>=.5&&(c=2),c>0){for(g+=1,l=0,m=0;m<t;m++)w=yr[m],l===0?w!==0&&(l=1,yr[m]=16777216-w):yr[m]=16777215-w;if(a>0)switch(a){case 1:yr[t-1]&=8388607;break;case 2:yr[t-1]&=4194303;break}c===2&&(y=1-y,l!==0&&(y-=Ca(1,a)))}if(y===0){for(w=0,m=t-1;m>=n;m--)w|=yr[m];if(w===0){for(h=1;yr[n-h]===0;h++);for(m=t+1;m<=t+h;m++){for(v[o+m]=r4[s+m],f=0,w=0;w<=o;w++)f+=r[w]*v[o+(m-w)];i[m]=f}return t+=h,e4(r,e,t,i,a,n,s,o,v)}for(t-=1,a-=24;yr[t]===0;)t-=1,a-=24}else y=Ca(y,-a),y>=Ru?(f=Vu*y|0,yr[t]=y-Ru*f|0,t+=1,a+=24,yr[t]=f):yr[t]=y|0;for(f=Ca(1,a),m=t;m>=0;m--)i[m]=f*yr[m],f*=Vu;for(m=t;m>=0;m--){for(f=0,h=0;h<=p&&h<=t-m;h++)f+=rZ[h]*i[m+h];Ba[t-m]=f}for(f=0,m=t;m>=0;m--)f+=Ba[m];for(c===0?e[0]=f:e[0]=-f,f=Ba[0]-f,m=1;m<=t;m++)f+=Ba[m];return c===0?e[1]=f:e[1]=-f,g&7}function eZ(r,e,t,i){var a,n,s,o,v,l,f,c,p;for(n=4,o=i-1,s=(t-3)/24|0,s<0&&(s=0),l=t-24*(s+1),c=s-o,p=o+n,f=0;f<=p;f++)c<0?ja[f]=0:ja[f]=r4[c],c+=1;for(f=0;f<=n;f++){for(a=0,c=0;c<=o;c++)a+=r[c]*ja[o+(f-c)];x6[f]=a}return v=n,e4(r,e,v,x6,l,n,s,o,ja)}t4.exports=eZ});var n4=u((nEr,a4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tZ=Math.round;a4.exports=tZ});var Vt=u((uEr,u4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iZ=n4();u4.exports=iZ});var f4=u((sEr,v4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/k_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var aZ=Vt(),s4=Pr(),nZ=.6366197723675814,uZ=1.5707963267341256,sZ=6077100506506192e-26,oZ=6077100506303966e-26,vZ=20222662487959506e-37,fZ=20222662487111665e-37,lZ=84784276603689e-45,o4=2047;function cZ(r,e,t){var i,a,n,s,o,v,l;return a=aZ(r*nZ),s=r-a*uZ,o=a*sZ,l=e>>20|0,t[0]=s-o,i=s4(t[0]),v=l-(i>>20&o4),v>16&&(n=s,o=a*oZ,s=n-o,o=a*vZ-(n-s-o),t[0]=s-o,i=s4(t[0]),v=l-(i>>20&o4),v>49&&(n=s,o=a*fZ,s=n-o,o=a*lZ-(n-s-o),t[0]=s-o)),t[1]=s-t[0]-o,a}v4.exports=cZ});var c4=u((oEr,l4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_rem_pio2.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
*
* Optimized by Bruce D. Evans.
* ```
*/var pZ=We(),mZ=ci(),hZ=wu(),gZ=Pr(),yZ=K6(),qZ=fi(),wZ=i4(),Ga=f4(),dZ=0,bZ=16777216,Je=1.5707963267341256,yt=6077100506506192e-26,Ha=2*yt,Ua=3*yt,Da=4*yt,_Z=598523,EZ=1072243195,TZ=1073928572,AZ=1074752122,OZ=1074977148,IZ=1075183036,SZ=1075388923,NZ=1075594811,LZ=1094263291,mi=[0,0,0],hi=[0,0];function FZ(r,e){var t,i,a,n,s,o,v,l;if(a=gZ(r)|0,n=a&pZ|0,n<=EZ)return e[0]=r,e[1]=0,0;if(n<=AZ)return(n&hZ)===_Z?Ga(r,n,e):n<=TZ?a>0?(l=r-Je,e[0]=l-yt,e[1]=l-e[0]-yt,1):(l=r+Je,e[0]=l+yt,e[1]=l-e[0]+yt,-1):a>0?(l=r-2*Je,e[0]=l-Ha,e[1]=l-e[0]-Ha,2):(l=r+2*Je,e[0]=l+Ha,e[1]=l-e[0]+Ha,-2);if(n<=NZ)return n<=IZ?n===OZ?Ga(r,n,e):a>0?(l=r-3*Je,e[0]=l-Ua,e[1]=l-e[0]-Ua,3):(l=r+3*Je,e[0]=l+Ua,e[1]=l-e[0]+Ua,-3):n===SZ?Ga(r,n,e):a>0?(l=r-4*Je,e[0]=l-Da,e[1]=l-e[0]-Da,4):(l=r+4*Je,e[0]=l+Da,e[1]=l-e[0]+Da,-4);if(n<LZ)return Ga(r,n,e);if(n>=mZ)return e[0]=NaN,e[1]=NaN,0;for(t=yZ(r),i=(n>>20)-1046,l=qZ(n-(i<<20|0),t),o=0;o<2;o++)mi[o]=l|0,l=(l-mi[o])*bZ;for(mi[2]=l,s=3;mi[s-1]===dZ;)s-=1;return v=wZ(mi,hi,i,s,1),a<0?(e[0]=-hi[0],e[1]=-hi[1],-v):(e[0]=hi[0],e[1]=hi[1],v)}l4.exports=FZ});var Mu=u((vEr,p4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var PZ=c4();p4.exports=PZ});var g4=u((fEr,h4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_sin.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var RZ=We(),VZ=ci(),MZ=Pr(),m4=Nu(),Cu=Lu(),CZ=Mu(),jZ=1072243195,BZ=1045430272,Le=[0,0];function kZ(r){var e,t;if(e=MZ(r),e&=RZ,e<=jZ)return e<BZ?r:Cu(r,0);if(e>=VZ)return NaN;switch(t=CZ(r,Le),t&3){case 0:return Cu(Le[0],Le[1]);case 1:return m4(Le[0],Le[1]);case 2:return-Cu(Le[0],Le[1]);default:return-m4(Le[0],Le[1])}}h4.exports=kZ});var Mt=u((lEr,y4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var GZ=g4();y4.exports=GZ});var gi=u((cEr,q4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HZ=2.5066282746310007;q4.exports=HZ});var d4=u((pEr,w4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function UZ(r){return r===0?.08333333333334822:.08333333333334822+r*(.0034722222160545866+r*(-.0026813261780578124+r*(-.00022954996161337813+r*.0007873113957930937)))}w4.exports=UZ});var E4=u((mEr,_4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var DZ=gi(),b4=tr(),WZ=rr(),YZ=d4(),KZ=143.01608;function QZ(r){var e,t,i;return e=1/r,e=1+e*YZ(e),t=WZ(r),r>KZ?(i=b4(r,.5*r-.25),t=i*(i/t)):t=b4(r,r-.5)/t,DZ*t*e}_4.exports=QZ});var A4=u((hEr,T4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ZZ=.5772156649015329;T4.exports=ZZ});var I4=u((gEr,O4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var JZ=A4();function XZ(r,e){return e/((1+JZ*r)*r)}O4.exports=XZ});var N4=u((yEr,S4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function $Z(r){var e,t,i;return r===0?1:(r<0?e=-r:e=r,e<=1?(t=1+r*(.4942148268014971+r*(.20744822764843598+r*(.04763678004571372+r*(.010421379756176158+r*(.0011913514700658638+r*(.00016011952247675185+r*0)))))),i=1+r*(.0714304917030273+r*(-.23459179571824335+r*(.035823639860549865+r*(.011813978522206043+r*(-.004456419138517973+r*(.0005396055804933034+r*-23158187332412014e-21))))))):(r=1/r,t=0+r*(.00016011952247675185+r*(.0011913514700658638+r*(.010421379756176158+r*(.04763678004571372+r*(.20744822764843598+r*(.4942148268014971+r*1)))))),i=-23158187332412014e-21+r*(.0005396055804933034+r*(-.004456419138517973+r*(.011813978522206043+r*(.035823639860549865+r*(-.23459179571824335+r*(.0714304917030273+r*1))))))),t/i)}S4.exports=$Z});var j4=u((qEr,C4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, long comment, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1987, 1989, 1992, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var zZ=B(),xZ=Ir(),rJ=Pa(),L4=k(),eJ=vr(),tJ=Mt(),F4=X(),P4=mr(),R4=Ne(),V4=E4(),M4=I4(),iJ=N4();function aJ(r){var e,t,i,a;if(xZ(r)&&r<0||r===P4||zZ(r))return NaN;if(r===0)return rJ(r)?P4:F4;if(r>171.61447887182297)return F4;if(r<-170.5674972726612)return 0;if(t=L4(r),t>33)return r>=0?V4(r):(i=eJ(t),(i&1)===0?e=-1:e=1,a=t-i,a>.5&&(i+=1,a=t-i),a=t*tJ(R4*a),e*R4/(L4(a)*V4(t)));for(a=1;r>=3;)r-=1,a*=r;for(;r<0;){if(r>-1e-9)return M4(r,a);a/=r,r+=1}for(;r<2;){if(r<1e-9)return M4(r,a);a/=r,r+=1}return r===2?a:(r-=2,a*iJ(r))}C4.exports=aJ});var ve=u((wEr,B4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nJ=j4();B4.exports=nJ});var yi=u((dEr,k4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uJ=170;k4.exports=uJ});var G4=u((bEr,sJ)=>{sJ.exports=[1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600,6227020800,87178291200,1307674368e3,20922789888e3,355687428096e3,6402373705728e3,121645100408832e3,243290200817664e4,5109094217170944e4,11240007277776077e5,2585201673888498e7,6204484017332394e8,15511210043330986e9,40329146112660565e10,10888869450418352e12,30488834461171387e13,8841761993739702e15,26525285981219107e16,8222838654177922e18,2631308369336935e20,8683317618811886e21,29523279903960416e22,10333147966386145e24,37199332678990125e25,13763753091226346e27,5230226174666011e29,20397882081197444e30,8159152832478977e32,3345252661316381e34,140500611775288e37,6041526306337383e37,2658271574788449e39,11962222086548019e40,5502622159812089e42,25862324151116818e43,12413915592536073e45,6082818640342675e47,30414093201713376e48,15511187532873822e50,8065817517094388e52,42748832840600255e53,2308436973392414e56,12696403353658276e57,7109985878048635e59,40526919504877214e60,23505613312828785e62,13868311854568984e64,832098711274139e67,5075802138772248e68,3146997326038794e70,198260831540444e73,12688693218588417e73,8247650592082472e75,5443449390774431e77,3647111091818868e79,24800355424368305e80,1711224524281413e83,11978571669969892e84,8504785885678623e86,61234458376886085e87,44701154615126844e89,3307885441519386e92,248091408113954e95,18854947016660504e95,14518309202828587e97,11324281178206297e99,8946182130782976e101,7156945704626381e103,5797126020747368e105,4753643337012842e107,3945523969720659e109,3314240134565353e111,281710411438055e114,24227095383672734e114,2107757298379528e117,18548264225739844e118,1650795516090846e121,14857159644817615e122,1352001527678403e125,12438414054641308e126,11567725070816416e128,1087366156656743e131,1032997848823906e133,9916779348709496e134,9619275968248212e136,9426890448883248e138,9332621544394415e140,9332621544394415e142,942594775983836e145,9614466715035127e146,990290071648618e149,10299016745145628e150,1081396758240291e153,11462805637347084e154,1226520203196138e157,1324641819451829e159,14438595832024937e160,1588245541522743e163,17629525510902446e164,1974506857221074e167,22311927486598138e168,25435597334721877e170,2925093693493016e173,3393108684451898e175,3969937160808721e177,4684525849754291e179,5574585761207606e181,6689502913449127e183,8094298525273444e185,9875044200833601e187,1214630436702533e190,1506141741511141e192,1882677176888926e194,2372173242880047e196,30126600184576594e197,3856204823625804e200,4974504222477287e202,6466855489220474e204,847158069087882e207,11182486511960043e208,14872707060906857e210,19929427461615188e212,26904727073180504e214,3659042881952549e217,5012888748274992e219,6917786472619489e221,9615723196941089e223,13462012475717526e225,1898143759076171e228,2695364137888163e230,3854370717180073e232,55502938327393044e233,8047926057471992e236,11749972043909107e238,1727245890454639e241,25563239178728654e242,380892263763057e246,5713383956445855e247,862720977423324e250,13113358856834524e251,20063439050956823e253,30897696138473508e255,4789142901463394e258,7471062926282894e260,11729568794264145e262,1853271869493735e265,29467022724950384e266,47147236359920616e268,7590705053947219e271,12296942187394494e273,20044015765453026e275,3287218585534296e278,5423910666131589e280,9003691705778438e282,1503616514864999e285,25260757449731984e286,4269068009004705e289,7257415615307999e291]});var U4=u((_Er,H4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oJ=B(),vJ=Ir(),fJ=ve(),lJ=X(),cJ=yi(),pJ=G4();function mJ(r){return oJ(r)?NaN:vJ(r)?r<0?NaN:r<=cJ?pJ[r]:lJ:fJ(r+1)}H4.exports=mJ});var ju=u((EEr,D4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hJ=U4();D4.exports=hJ});var Y4=u((TEr,W4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function gJ(r){var e,t,i;return r===0?1/0:(r<0?e=-r:e=r,e<=1?(t=3847467039331777e-5+r*(3685766504351951e-5+r*(1588920245372942e-5+r*(4059208354298835e-6+r*(6805476611834733e-7+r*(7823975500312005e-8+r*(6246580776401795e-9+r*(341986.3488721347+r*(12287.194511824551+r*(261.61404416416684+r*2.5066282746310007))))))))),i=0+r*(362880+r*(1026576+r*(1172700+r*(723680+r*(269325+r*(63273+r*(9450+r*(870+r*(45+r*1)))))))))):(r=1/r,t=2.5066282746310007+r*(261.61404416416684+r*(12287.194511824551+r*(341986.3488721347+r*(6246580776401795e-9+r*(7823975500312005e-8+r*(6805476611834733e-7+r*(4059208354298835e-6+r*(1588920245372942e-5+r*(3685766504351951e-5+r*3847467039331777e-5))))))))),i=1+r*(45+r*(870+r*(9450+r*(63273+r*(269325+r*(723680+r*(1172700+r*(1026576+r*(362880+r*0)))))))))),t/i)}W4.exports=gJ});var Q4=u((AEr,K4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/lanczos.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var yJ=Y4();K4.exports=yJ});var J4=u((OEr,Z4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qJ=Q4();Z4.exports=qJ});var Ct=u((IEr,X4)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wJ=10.900511;X4.exports=wJ});var n5=u((SEr,a5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_85_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006-7, 2013-14.
* Copyright Paul A. Bristow 2007, 2013-14.
* Copyright Nikhar Agrawal 2013-14.
* Copyright Christopher Kormanyos 2013-14.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var $4=J4(),dJ=ve(),bJ=oe(),z4=k(),x4=rr(),r5=tr(),e5=zr(),_J=ht(),EJ=Ct(),t5=yi(),TJ=4269068009004705e289;function i5(r,e){var t,i,a;return r<e5?e>=t5?(i=i5(e,t5-e),i*=r,i*=TJ,1/i):1/(r*dJ(r+e)):(a=r+EJ-.5,r+e===r?z4(e/a)<e5?t=x4(-e):t=1:(z4(e)<10?t=x4((.5-r)*bJ(e/a)):t=r5(a/(a+e),r-.5),t*=$4(r)/$4(r+e)),t*=r5(_J/(a+e),e),t)}a5.exports=i5});var l5=u((NEr,f5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_85_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006-7, 2013-14.
* Copyright Paul A. Bristow 2007, 2013-14.
* Copyright Nikhar Agrawal 2013-14.
* Copyright Christopher Kormanyos 2013-14.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var AJ=k(),u5=vr(),s5=ve(),o5=ju(),v5=yi(),OJ=n5();function IJ(r,e){var t,i,a;if(r<=0||r+e<=0)return s5(r)/s5(r+e);if(i=u5(e),i===e){if(a=u5(r),a===r&&r<=v5&&r+e<=v5)return o5(a-1)/o5(i+a-1);if(AJ(e)<20){if(e===0)return 1;if(e<0){for(r-=1,t=r,e+=1;e!==0;)r-=1,t*=r,e+=1;return t}for(t=1/r,e-=1;e!==0;)r+=1,t/=r,e-=1;return t}}return OJ(r,e)}f5.exports=IJ});var Wa=u((LEr,c5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var SJ=l5();c5.exports=SJ});var m5=u((FEr,p5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function NJ(r){return r===0?.3999999999940942:.3999999999940942+r*(.22222198432149784+r*.15313837699209373)}p5.exports=NJ});var g5=u((PEr,h5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function LJ(r){return r===0?.6666666666666735:.6666666666666735+r*(.2857142874366239+r*(.1818357216161805+r*.14798198605116586))}h5.exports=LJ});var d5=u((REr,w5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_log.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var y5=Pr(),FJ=Pt(),PJ=B(),RJ=Ue(),VJ=mr(),MJ=m5(),CJ=g5(),Ya=.6931471803691238,Ka=19082149292705877e-26,jJ=0x40000000000000,BJ=.3333333333333333,q5=1048575,kJ=2146435072,GJ=1048576,HJ=1072693248;function UJ(r){var e,t,i,a,n,s,o,v,l,f,c,p;return r===0?VJ:PJ(r)||r<0?NaN:(t=y5(r),n=0,t<GJ&&(n-=54,r*=jJ,t=y5(r)),t>=kJ?r+r:(n+=(t>>20)-RJ|0,t&=q5,v=t+614244&1048576|0,r=FJ(r,t|v^HJ),n+=v>>20|0,o=r-1,(q5&2+t)<3?o===0?n===0?0:n*Ya+n*Ka:(s=o*o*(.5-BJ*o),n===0?o-s:n*Ya-(s-n*Ka-o)):(f=o/(2+o),p=f*f,v=t-398458|0,c=p*p,l=440401-t|0,a=c*MJ(c),i=p*CJ(c),v|=l,s=i+a,v>0?(e=.5*o*o,n===0?o-(e-f*(e+s)):n*Ya-(e-(f*(e+s)+n*Ka)-o)):n===0?o-f*(o-s):n*Ya-(f*(o-s)-n*Ka-o))))}w5.exports=UJ});var J=u((VEr,b5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DJ=d5();b5.exports=DJ});var T5=u((MEr,E5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_cos.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var WJ=Pr(),Bu=Nu(),_5=Lu(),YJ=Mu(),KJ=We(),QJ=ci(),Fe=[0,0],ZJ=1072243195,JJ=1044381696;function XJ(r){var e,t;if(e=WJ(r),e&=KJ,e<=ZJ)return e<JJ?1:Bu(r,0);if(e>=QJ)return NaN;switch(t=YJ(r,Fe),t&3){case 0:return Bu(Fe[0],Fe[1]);case 1:return-_5(Fe[0],Fe[1]);case 2:return-Bu(Fe[0],Fe[1]);default:return _5(Fe[0],Fe[1])}}E5.exports=XJ});var Qa=u((CEr,A5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $J=T5();A5.exports=$J});var S5=u((jEr,I5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zJ=B(),xJ=De(),O5=Qa(),ku=Mt(),rX=k(),qi=Ta(),wi=Ne();function eX(r){var e,t;return zJ(r)?NaN:xJ(r)?NaN:(t=r%2,e=rX(t),e===0||e===1?qi(0,t):e<.25?ku(wi*t):e<.75?(e=.5-e,qi(O5(wi*e),t)):e<1.25?(t=qi(1,t)-t,ku(wi*t)):e<1.75?(e-=1.5,-qi(O5(wi*e),t)):(t-=qi(2,t),ku(wi*t)))}I5.exports=eX});var L5=u((BEr,N5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tX=S5();N5.exports=tX});var P5=u((kEr,F5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function iX(r){return r===0?.06735230105312927:.06735230105312927+r*(.007385550860814029+r*(.0011927076318336207+r*(.00022086279071390839+r*25214456545125733e-21)))}F5.exports=iX});var V5=u((GEr,R5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function aX(r){return r===0?.020580808432516733:.020580808432516733+r*(.0028905138367341563+r*(.0005100697921535113+r*(.00010801156724758394+r*44864094961891516e-21)))}R5.exports=aX});var C5=u((HEr,M5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function nX(r){return r===0?1.3920053346762105:1.3920053346762105+r*(.7219355475671381+r*(.17193386563280308+r*(.01864591917156529+r*(.0007779424963818936+r*7326684307446256e-21))))}M5.exports=nX});var B5=u((UEr,j5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function uX(r){return r===0?.21498241596060885:.21498241596060885+r*(.325778796408931+r*(.14635047265246445+r*(.02664227030336386+r*(.0018402845140733772+r*3194753265841009e-20))))}j5.exports=uX});var G5=u((DEr,k5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function sX(r){return r===0?-.032788541075985965:-.032788541075985965+r*(.006100538702462913+r*(-.0014034646998923284+r*.00031563207090362595))}k5.exports=sX});var U5=u((WEr,H5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function oX(r){return r===0?.01797067508118204:.01797067508118204+r*(-.0036845201678113826+r*(.000881081882437654+r*-.00031275416837512086))}H5.exports=oX});var W5=u((YEr,D5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function vX(r){return r===0?-.010314224129834144:-.010314224129834144+r*(.0022596478090061247+r*(-.0005385953053567405+r*.0003355291926355191))}D5.exports=vX});var K5=u((KEr,Y5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function fX(r){return r===0?.6328270640250934:.6328270640250934+r*(1.4549225013723477+r*(.9777175279633727+r*(.22896372806469245+r*.013381091853678766)))}Y5.exports=fX});var Z5=u((QEr,Q5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function lX(r){return r===0?2.4559779371304113:2.4559779371304113+r*(2.128489763798934+r*(.7692851504566728+r*(.10422264559336913+r*.003217092422824239)))}Q5.exports=lX});var X5=u((ZEr,J5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function cX(r){return r===0?.08333333333333297:.08333333333333297+r*(-.0027777777772877554+r*(.0007936505586430196+r*(-.00059518755745034+r*(.0008363399189962821+r*-.0016309293409657527))))}J5.exports=cX});var x5=u((JEr,z5)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/12.2.0/lib/msun/src/e_lgamma_r.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var pX=B(),mX=De(),hX=k(),jt=J(),gX=li(),yX=L5(),qX=Ne(),Gu=X(),wX=P5(),dX=V5(),bX=C5(),_X=B5(),EX=G5(),TX=U5(),AX=W5(),OX=K5(),IX=Z5(),SX=X5(),NX=.07721566490153287,LX=.3224670334241136,FX=1,PX=-.07721566490153287,RX=.48383612272381005,VX=-.1475877229945939,MX=.06462494023913339,CX=-.07721566490153287,jX=1,BX=.4189385332046727,Za=1.4616321449683622,kX=4503599627370496,GX=72057594037927940,HX=13877787807814457e-33,$5=1.4616321449683622,UX=-.12148629053584961,DX=-3638676997039505e-33;function WX(r){var e,t,i,a,n,s,o,v,l,f,c,p,m;if(pX(r)||mX(r))return r;if(r===0)return Gu;if(r<0?(e=!0,r=-r):e=!1,r<HX)return-jt(r);if(e){if(r>=kX||(l=yX(r),l===0))return Gu;t=jt(qX/hX(l*r))}if(r===1||r===2)return 0;if(r<2)switch(r<=.9?(m=-jt(r),r>=Za-1+.27?(c=1-r,i=0):r>=Za-1-.27?(c=r-($5-1),i=1):(c=r,i=2)):(m=0,r>=Za+.27?(c=2-r,i=0):r>=Za-.27?(c=r-$5,i=1):(c=r-1,i=2)),i){case 0:p=c*c,s=NX+p*wX(p),n=p*(LX+p*dX(p)),o=c*s+n,m+=o-.5*c;break;case 1:p=c*c,f=p*c,s=RX+f*EX(f),n=VX+f*TX(f),a=MX+f*AX(f),o=p*s-(DX-f*(n+c*a)),m+=UX+o;break;case 2:s=c*(CX+c*OX(c)),n=jX+c*IX(c),m+=-.5*c+s/n;break}else if(r<8)switch(i=gX(r),c=r-i,o=c*(PX+c*_X(c)),v=FX+c*bX(c),m=.5*c+o/v,p=1,i){case 7:p*=c+6;case 6:p*=c+5;case 5:p*=c+4;case 4:p*=c+3;case 3:p*=c+2,m+=jt(p)}else r<GX?(l=jt(r),p=1/r,c=p*p,f=BX+p*SX(c),m=(r-.5)*(l-1)+f):m=r*(jt(r)-1);return e&&(m=t-m),m}z5.exports=WX});var Bt=u((XEr,r8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YX=x5();r8.exports=YX});var Pe=u(($Er,e8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var KX=709.782712893384;e8.exports=KX});var i8=u((zEr,t8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var QX=14901161193847656e-24;t8.exports=QX});var n8=u((xEr,a8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ZX=eval;a8.exports=ZX});var s8=u((rTr,u8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var JX=n8();function XX(){var r;try{JX('"use strict"; (function* () {})'),r=!0}catch{r=!1}return r}u8.exports=XX});var Hu=u((eTr,o8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $X=s8();o8.exports=$X});var f8=u((tTr,v8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ja=k(),zX=zr(),xX=1e6;function r$(r,e){var t,i,a,n,s,o;if(o={},arguments.length>1&&(o=e),i=o.tolerance||zX,n=o.maxTerms||xX,s=o.initialValue||0,t=typeof r.next=="function",t===!0){for(a of r)if(s+=a,Ja(i*s)>=Ja(a)||--n===0)break}else do a=r(),s+=a;while(Ja(i*s)<Ja(a)&&--n);return s}v8.exports=r$});var p8=u((iTr,c8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var l8=k(),e$=zr(),t$=1e6;function i$(r,e){var t,i,a,n,s;s={},arguments.length>1&&(s=e),t=s.tolerance||e$,a=s.maxTerms||t$,n=s.initialValue||0;do i=r(),n+=i;while(l8(t*n)<l8(i)&&--a);return n}c8.exports=i$});var kt=u((aTr,m8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var a$=Hu(),n$=f8(),u$=p8(),Uu;a$()?Uu=n$:Uu=u$;m8.exports=Uu});var g8=u((nTr,h8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/function s$(r,e){var t=1,i=r,a=e;return n;function n(){var s=t;return t*=i/a,i-=1,s}}h8.exports=s$});var q8=u((uTr,y8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var o$=kt(),v$=g8();function f$(r,e){var t,i;return i=v$(r,e),t=o$(i),t}y8.exports=f$});var d8=u((sTr,w8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var l$=rr();function c$(r,e){var t,i,a,n;if(a=l$(-e),i=a,i!==0)for(t=i,n=1;n<r;++n)t/=n,t*=e,i+=t;return i}w8.exports=c$});var _8=u((oTr,b8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function p$(r){return r===0?-.3250421072470015:-.3250421072470015+r*(-.02848174957559851+r*(-.005770270296489442+r*-23763016656650163e-21))}b8.exports=p$});var T8=u((vTr,E8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function m$(r){return r===0?.39791722395915535:.39791722395915535+r*(.0650222499887673+r*(.005081306281875766+r*(.00013249473800432164+r*-3960228278775368e-21)))}E8.exports=m$});var O8=u((fTr,A8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function h$(r){return r===0?.41485611868374833:.41485611868374833+r*(-.3722078760357013+r*(.31834661990116175+r*(-.11089469428239668+r*(.035478304325618236+r*-.002166375594868791))))}A8.exports=h$});var S8=u((lTr,I8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function g$(r){return r===0?.10642088040084423:.10642088040084423+r*(.540397917702171+r*(.07182865441419627+r*(.12617121980876164+r*(.01363708391202905+r*.011984499846799107))))}I8.exports=g$});var L8=u((cTr,N8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function y$(r){return r===0?-.6938585727071818:-.6938585727071818+r*(-10.558626225323291+r*(-62.375332450326006+r*(-162.39666946257347+r*(-184.60509290671104+r*(-81.2874355063066+r*-9.814329344169145)))))}N8.exports=y$});var P8=u((pTr,F8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function q$(r){return r===0?19.651271667439257:19.651271667439257+r*(137.65775414351904+r*(434.56587747522923+r*(645.3872717332679+r*(429.00814002756783+r*(108.63500554177944+r*(6.570249770319282+r*-.0604244152148581))))))}F8.exports=q$});var V8=u((mTr,R8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function w$(r){return r===0?-.799283237680523:-.799283237680523+r*(-17.757954917754752+r*(-160.63638485582192+r*(-637.5664433683896+r*(-1025.0951316110772+r*-483.5191916086514))))}R8.exports=w$});var C8=u((hTr,M8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function d$(r){return r===0?30.33806074348246:30.33806074348246+r*(325.7925129965739+r*(1536.729586084437+r*(3199.8582195085955+r*(2553.0504064331644+r*(474.52854120695537+r*-22.44095244658582)))))}M8.exports=d$});var G8=u((gTr,k8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_erf.c}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
*
* Developed at SunPro, a Sun Microsystems, Inc. business.
* Permission to use, copy, modify, and distribute this
* software is freely granted, provided that this notice
* is preserved.
* ```
*/var b$=B(),j8=rr(),_$=Rt(),E$=X(),T$=mr(),A$=_8(),O$=T8(),I$=O8(),S$=S8(),N$=L8(),L$=P8(),F$=V8(),P$=C8(),Xa=1e-300,R$=13877787807814457e-33,B8=.8450629115104675,V$=.12837916709551256,M$=1,C$=-.0023621185607526594,j$=1,B$=-.009864944034847148,k$=1,G$=-.0098649429247001,H$=1;function U$(r){var e,t,i,a,n,s,o,v;if(b$(r))return NaN;if(r===E$)return 0;if(r===T$)return 2;if(r===0)return 1;if(r<0?(e=!0,t=-r):(e=!1,t=r),t<.84375)return t<R$?1-r:(i=r*r,a=V$+i*A$(i),n=M$+i*O$(i),s=a/n,r<.25?1-(r+r*s):(a=r*s,a+=r-.5,.5-a));if(t<1.25)return n=t-1,o=C$+n*I$(n),v=j$+n*S$(n),e?1+B8+o/v:1-B8-o/v;if(t<28){if(n=1/(t*t),t<2.857142857142857)a=B$+n*N$(n),n=k$+n*L$(n);else{if(r<-6)return 2-Xa;a=G$+n*F$(n),n=H$+n*P$(n)}return i=_$(t,0),a=j8(-(i*i)-.5625)*j8((i-t)*(i+t)+a/n),e?2-a/t:a/t}return e?2-Xa:Xa*Xa}k8.exports=U$});var di=u((yTr,H8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var D$=G8();H8.exports=D$});var W8=u((qTr,D8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var W$=di(),U8=Q(),Y$=rr(),K$=Ne();function Q$(r,e){var t,i,a,n,s;if(n=W$(U8(e)),n!==0&&r>1){for(i=Y$(-e)/U8(K$*e),i*=e,t=.5,i/=t,a=i,s=2;s<r;++s)i/=s-t,i*=e,a+=i;n+=a}return n}D8.exports=Q$});var qt=u((wTr,Y8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Z$=-708.3964185322641;Y8.exports=Z$});var J8=u((dTr,Z8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Gt=rr(),$a=tr(),J$=J(),K8=Pe(),Q8=qt();function X$(r,e){var t,i;return i=r*J$(e),e>=1?i<K8&&-e>Q8?t=$a(e,r)*Gt(-e):r>=1?t=$a(e/Gt(e/r),r):t=Gt(i-e):i>Q8?t=$a(e,r)*Gt(-e):e/r<K8?t=$a(e/Gt(e/r),r):t=Gt(i-e),t}Z8.exports=X$});var Du=u((bTr,X8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function $$(r,e){var t,i;if(i=r.length,i<2||e===0)return i===0?0:r[0];for(i-=1,t=r[i]*e+r[i-1],i-=2;i>=0;)t=t*e+r[i],i-=1;return t}X8.exports=$$});var z8=u((_Tr,$8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var z$=Function;$8.exports=z$});var rm=u((ETr,x8)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var x$=z8();x8.exports=x$});var tm=u((TTr,em)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rz=rm(),ez=Du();function tz(r){var e,t,i,a;if(r.length>500)return n;if(e="return function evalpoly(x){",t=r.length,t===0)e+="return 0.0;";else if(t===1)e+="return "+r[0]+";";else{for(e+="if(x===0.0){return "+r[0]+";}",e+="return "+r[0],i=t-1,a=1;a<t;a++)e+="+x*",a<i&&(e+="("),e+=r[a];for(a=0;a<i-1;a++)e+=")";e+=";"}return e+="}",e+="//# sourceURL=evalpoly.factory.js",new rz(e)();function n(s){return ez(r,s)}}em.exports=tz});var Re=u((ATr,am)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iz=N(),im=Du(),az=tm();iz(im,"factory",az);am.exports=im});var um=u((OTr,nm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_83_0/boost/math/special_functions/log1p.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2005-2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
*/function nz(r){var e=-r,t=-1,i=0;return a;function a(){return t*=e,i+=1,t/i}}nm.exports=nz});var om=u((ITr,sm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_83_0/boost/math/special_functions/log1p.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2005-2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var uz=k(),sz=J(),oz=zr(),vz=kt(),fz=um();function lz(r){var e,t;return r<=-1?NaN:(t=uz(r),t>.95?sz(1+r)-r:t<oz?-r*r/2:(e={initialValue:-r},vz(fz(r),e)))}sm.exports=lz});var Wu=u((STr,vm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cz=om();vm.exports=cz});var Yu=u((NTr,fm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pz=6.283185307179586;fm.exports=pz});var cm=u((LTr,lm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function mz(r){return r===0?-.3333333333333333:-.3333333333333333+r*(.08333333333333333+r*(-.014814814814814815+r*(.0011574074074074073+r*(.0003527336860670194+r*(-.0001787551440329218+r*(3919263178522438e-20+r*(-21854485106799924e-22+r*(-185406221071516e-20+r*(8296711340953087e-22+r*(-17665952736826078e-23+r*(6707853543401498e-24+r*(10261809784240309e-24+r*(-4382036018453353e-24+r*914769958223679e-24)))))))))))))}lm.exports=mz});var mm=u((FTr,pm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function hz(r){return r===0?-.001851851851851852:-.001851851851851852+r*(-.003472222222222222+r*(.0026455026455026454+r*(-.0009902263374485596+r*(.00020576131687242798+r*(-4018775720164609e-22+r*(-18098550334489977e-21+r*(764916091608111e-20+r*(-16120900894563446e-22+r*(4647127802807434e-24+r*(1378633446915721e-22+r*(-5752545603517705e-23+r*11951628599778148e-24)))))))))))}pm.exports=hz});var gm=u((PTr,hm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function gz(r){return r===0?.004133597883597883:.004133597883597883+r*(-.0026813271604938273+r*(.0007716049382716049+r*(20093878600823047e-22+r*(-.00010736653226365161+r*(52923448829120125e-21+r*(-12760635188618728e-21+r*(3423578734096138e-23+r*(13721957309062932e-22+r*(-6298992138380055e-22+r*14280614206064242e-23)))))))))}hm.exports=gz});var qm=u((RTr,ym)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function yz(r){return r===0?.0006494341563786008:.0006494341563786008+r*(.00022947209362139917+r*(-.0004691894943952557+r*(.00026772063206283885+r*(-7561801671883977e-20+r*(-2396505113867297e-22+r*(11082654115347302e-21+r*(-56749528269915965e-22+r*14230900732435883e-22)))))))}ym.exports=yz});var dm=u((VTr,wm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function qz(r){return r===0?-.0008618882909167117:-.0008618882909167117+r*(.0007840392217200666+r*(-.0002990724803031902+r*(-14638452578843418e-22+r*(6641498215465122e-20+r*(-3968365047179435e-20+r*11375726970678419e-21)))))}wm.exports=qz});var _m=u((MTr,bm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function wz(r){return r===0?-.00033679855336635813:-.00033679855336635813+r*(-6972813758365858e-20+r*(.0002772753244959392+r*(-.00019932570516188847+r*(6797780477937208e-20+r*(1419062920643967e-22+r*(-13594048189768693e-21+r*(8018470256334202e-21+r*-2291481176508095e-21)))))))}bm.exports=wz});var Tm=u((CTr,Em)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function dz(r){return r===0?.0005313079364639922:.0005313079364639922+r*(-.0005921664373536939+r*(.0002708782096718045+r*(7902353232660328e-22+r*(-8153969367561969e-20+r*(561168275310625e-19+r*-18329116582843375e-21)))))}Em.exports=dz});var Om=u((jTr,Am)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function bz(r){return r===0?.00034436760689237765:.00034436760689237765+r*(5171790908260592e-20+r*(-.00033493161081142234+r*(.0002812695154763237+r*-.00010976582244684731)))}Am.exports=bz});var Sm=u((BTr,Im)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function _z(r){return r===0?-.0006526239185953094:-.0006526239185953094+r*(.0008394987206720873+r*-.000438297098541721)}Im.exports=_z});var Lm=u((kTr,Nm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Ez=Re(),Tz=Wu(),Az=di(),Ku=Q(),Oz=rr(),Iz=Yu(),Sz=cm(),Nz=mm(),Lz=gm(),Fz=qm(),Pz=dm(),Rz=_m(),Vz=Tm(),Mz=Om(),Cz=Sm(),xr=[0,0,0,0,0,0,0,0,0,0];function jz(r,e){var t,i,a,n,s;return i=(e-r)/r,a=-Tz(i),n=r*a,s=Ku(2*a),e<r&&(s=-s),xr[0]=Sz(s),xr[1]=Nz(s),xr[2]=Lz(s),xr[3]=Fz(s),xr[4]=Pz(s),xr[5]=Rz(s),xr[6]=Vz(s),xr[7]=Mz(s),xr[8]=Cz(s),xr[9]=-.0005967612901927463,t=Ez(xr,1/r),t*=Oz(-n)/Ku(Iz*r),e<r&&(t=-t),t+=Az(Ku(n))/2,t}Nm.exports=jz});var Pm=u((GTr,Fm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/function Bz(r,e){var t=1,i=r,a=e;return n;function n(){var s=t;return i+=1,t*=a/i,s}}Fm.exports=Bz});var Qu=u((HTr,Rm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var kz=kt(),Gz=Pm();function Hz(r,e,t){var i,a;return t=t||0,a=Gz(r,e),i=kz(a,{initialValue:t}),i}Rm.exports=Hz});var Mm=u((UTr,Vm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Uz(r){var e,t,i;return r===0?1/0:(r<0?e=-r:e=r,e<=1?(t=709811.662581658+r*(679979.8474157227+r*(293136.7857211597+r*(74887.54032914672+r*(12555.290582413863+r*(1443.4299244417066+r*(115.24194596137347+r*(6.309239205732627+r*(.22668404630224365+r*(.004826466289237662+r*4624429436045379e-20))))))))),i=0+r*(362880+r*(1026576+r*(1172700+r*(723680+r*(269325+r*(63273+r*(9450+r*(870+r*(45+r*1)))))))))):(r=1/r,t=4624429436045379e-20+r*(.004826466289237662+r*(.22668404630224365+r*(6.309239205732627+r*(115.24194596137347+r*(1443.4299244417066+r*(12555.290582413863+r*(74887.54032914672+r*(293136.7857211597+r*(679979.8474157227+r*709811.662581658))))))))),i=1+r*(45+r*(870+r*(9450+r*(63273+r*(269325+r*(723680+r*(1172700+r*(1026576+r*(362880+r*0)))))))))),t/i)}Vm.exports=Uz});var jm=u((DTr,Cm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/lanczos.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Dz=Mm();Cm.exports=Dz});var bi=u((WTr,Bm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Wz=jm();Bm.exports=Wz});var Hm=u((YTr,Gm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006-7, 2013-14.
* Copyright Paul A. Bristow 2007, 2013-14.
* Copyright Nikhar Agrawal 2013-14.
* Copyright Christopher Kormanyos 2013-14.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Yz=bi(),Kz=Bt(),Qz=ve(),Zz=Wu(),Jz=Q(),Xz=k(),Xe=rr(),_i=tr(),Zu=gt(),Ju=Se(),km=J(),$z=Ze(),za=Pe(),Ei=qt(),Xu=Ct(),zz=ht();function xz(r,e){var t,i,a,n,s,o,v;return a=r+Xu-.5,v=(e-r-Xu+.5)/a,r<1?e<=Ei||r<1/$z?Xe(r*km(e)-e-Kz(r)):_i(e,r)*Xe(-e)/Qz(r):(Xz(v*v*r)<=100&&r>150?(t=r*Zz(v)+e*(.5-Xu)/a,t=Xe(t)):(n=r*km(e/a),s=r-e,Ju(n,s)<=Ei||Zu(n,s)>=za?(i=s/r,Ju(n,s)/2>Ei&&Zu(n,s)/2<za?(o=_i(e/a,r/2)*Xe(s/2),t=o*o):Ju(n,s)/4>Ei&&Zu(n,s)/4<za&&e>r?(o=_i(e/a,r/4)*Xe(s/4),t=o*o,t*=t):i>Ei&&i<za?t=_i(e*Xe(i)/a,r):t=Xe(n+s)):t=_i(e/a,r)*Xe(s)),t*=Jz(a/zz)/Yz(r),t)}Gm.exports=xz});var Wm=u((KTr,Dm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_85_0/boost/math/special_functions/powm1.hpp}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var $u=B(),rx=De(),Um=k(),ex=pt(),tx=J(),ix=tr(),ax=li();function nx(r,e){var t,i;if($u(r)||$u(e))return NaN;if(e===0)return 0;if(r===0)return-1;if(r<0&&e%2===0&&(r=-r),r>0){if((Um(e*(r-1))<.5||Um(e)<.2)&&(i=tx(r)*e,i<.5))return ex(i)}else if(ax(e)!==e)return NaN;return t=ix(r,e)-1,rx(t)||$u(t)?NaN:t}Dm.exports=nx});var Km=u((QTr,Ym)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ux=Wm();Ym.exports=ux});var Zm=u((ZTr,Qm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function sx(r){var e,t,i;return r===0?-.01803556856784494:(r<0?e=-r:e=r,e<=1?(t=-.01803556856784494+r*(.02512664961998968+r*(.049410315156753225+r*(.0172491608709614+r*(-.0002594535632054381+r*(-.0005410098692152044+r*(-3245886498259485e-20+r*0)))))),i=1+r*(1.962029871977952+r*(1.4801966942423133+r*(.5413914320717209+r*(.09885042511280101+r*(.008213096746488934+r*(.00022493629192211576+r*-22335276320861708e-23))))))):(r=1/r,t=0+r*(-3245886498259485e-20+r*(-.0005410098692152044+r*(-.0002594535632054381+r*(.0172491608709614+r*(.049410315156753225+r*(.02512664961998968+r*-.01803556856784494)))))),i=-22335276320861708e-23+r*(.00022493629192211576+r*(.008213096746488934+r*(.09885042511280101+r*(.5413914320717209+r*(1.4801966942423133+r*(1.962029871977952+r*1))))))),t/i)}Qm.exports=sx});var Xm=u((JTr,Jm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function ox(r){var e,t,i;return r===0?.04906224540690395:(r<0?e=-r:e=r,e<=1?(t=.04906224540690395+r*(-.09691175301595212+r*(-.4149833583594954+r*(-.4065671242119384+r*(-.1584135863906922+r*(-.024014982064857155+r*-.0010034668769627955))))),i=1+r*(3.0234982984646304+r*(3.4873958536072385+r*(1.9141558827442668+r*(.5071377386143635+r*(.05770397226904519+r*.001957681026011072)))))):(r=1/r,t=-.0010034668769627955+r*(-.024014982064857155+r*(-.1584135863906922+r*(-.4065671242119384+r*(-.4149833583594954+r*(-.09691175301595212+r*.04906224540690395))))),i=.001957681026011072+r*(.05770397226904519+r*(.5071377386143635+r*(1.9141558827442668+r*(3.4873958536072385+r*(3.0234982984646304+r*1)))))),t/i)}Jm.exports=ox});var zm=u((XTr,$m)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function vx(r){var e,t,i;return r===0?-.029232972183027003:(r<0?e=-r:e=r,e<=1?(t=-.029232972183027003+r*(.14421626775719232+r*(-.14244039073863127+r*(.05428096940550536+r*(-.008505359768683364+r*(.0004311713426792973+r*0))))),i=1+r*(-1.5016935605448505+r*(.846973248876495+r*(-.22009515181499575+r*(.02558279715597587+r*(-.0010066679553914337+r*-8271935218912905e-22)))))):(r=1/r,t=0+r*(.0004311713426792973+r*(-.008505359768683364+r*(.05428096940550536+r*(-.14244039073863127+r*(.14421626775719232+r*-.029232972183027003))))),i=-8271935218912905e-22+r*(-.0010066679553914337+r*(.02558279715597587+r*(-.22009515181499575+r*(.846973248876495+r*(-1.5016935605448505+r*1)))))),t/i)}$m.exports=vx});var r7=u(($Tr,xm)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_85_0/boost/math/special_functions/detail/lgamma_small.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006-7, 2013-14.
* (C) Copyright Paul A. Bristow 2007, 2013-14.
* (C) Copyright Nikhar Agrawal 2013-14.
* (C) Copyright Christopher Kormanyos 2013-14.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var zu=J(),fx=zr(),lx=Zm(),cx=Xm(),px=zm(),mx=.15896368026733398,hx=.5281534194946289,gx=.45201730728149414;function yx(r,e,t){var i,a,n,s;if(r<fx)return-zu(r);if(e===0||t===0)return 0;if(a=0,r>2){if(r>=3){do r-=1,t-=1,a+=zu(r);while(r>=3);t=r-2}return n=t*(r+1),s=lx(t),a+=n*mx+n*s,a}return r<1&&(a+=-zu(r),t=e,e=r,r+=1),r<=1.5?(n=cx(e),i=e*t,a+=i*hx+i*n,a):(n=t*e,s=px(-t),a+=n*gx+n*s,a)}xm.exports=yx});var n7=u((zTr,a7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_85_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006-7, 2013-14.
* (C) Copyright Paul A. Bristow 2007, 2013-14.
* (C) Copyright Nikhar Agrawal 2013-14.
* (C) Copyright Christopher Kormanyos 2013-14.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var e7=ve(),t7=pt(),qx=oe(),wx=B(),i7=r7();function dx(r){return wx(r)?NaN:r<0?r<-.5?e7(1+r)-1:t7(-qx(r)+i7(r+2,r+1,r)):r<2?t7(i7(r+1,r,r-1)):e7(1+r)-1}a7.exports=dx});var s7=u((xTr,u7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bx=n7();u7.exports=bx});var v7=u((rAr,o7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/function _x(r,e){var t,i,a,n;return t=-e,e=-e,i=r+1,a=1,s;function s(){return n=t/i,t*=e,a+=1,t/=a,i+=1,n}}o7.exports=_x});var l7=u((eAr,f7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Ex=Km(),Tx=kt(),Ax=s7(),Ox=v7();function Ix(r,e,t){var i,a,n,s,o;return a=Ax(r),n=(a+1)/r,s=Ex(e,r),a-=s,a/=r,o=Ox(r,e),s+=1,i=t?n:0,a=-s*Tx(o,{initialValue:(i-a)/s}),t&&(a=-a),[a,n]}f7.exports=Ix});var Ti=u((tAr,c7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Sx=11754943508222875e-54;c7.exports=Sx});var m7=u((iAr,p7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xa=k(),fe=Ti(),Nx=zr(),Lx=1e6;function Fx(r,e,t){var i,a,n,s,o,v,l;if(i=typeof r.next=="function",l=i?r.next().value:r(),s=l[1],n=l[0],s===0&&(s=fe),o=s,v=0,i===!0)do l=r.next().value,l&&(v=l[1]+l[0]*v,v===0&&(v=fe),o=l[1]+l[0]/o,o===0&&(o=fe),v=1/v,a=o*v,s*=a);while(xa(a-1)>e&&--t);else do l=r(),l&&(v=l[1]+l[0]*v,v===0&&(v=fe),o=l[1]+l[0]/o,o===0&&(o=fe),v=1/v,a=o*v,s*=a);while(l&&xa(a-1)>e&&--t);return n/s}function Px(r,e,t){var i,a,n,s,o,v;if(i=typeof r.next=="function",v=i?r.next().value:r(),n=v[1],n===0&&(n=fe),s=n,o=0,i===!0)do v=r.next().value,v&&(o=v[1]+v[0]*o,o===0&&(o=fe),s=v[1]+v[0]/s,s===0&&(s=fe),o=1/o,a=s*o,n*=a);while(v&&xa(a-1)>e&&--t);else do v=r(),v&&(o=v[1]+v[0]*o,o===0&&(o=fe),s=v[1]+v[0]/s,s===0&&(s=fe),o=1/o,a=s*o,n*=a);while(v&&xa(a-1)>e&&--t);return n}function Rx(r,e){var t,i,a;return i={},arguments.length>1&&(i=e),t=i.maxIter||Lx,a=i.tolerance||Nx,i.keep?Px(r,a,t):Fx(r,a,t)}p7.exports=Rx});var y7=u((aAr,g7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var h7=k(),Vx=zr(),Ht=Ti(),Mx=1e6;function Cx(r,e,t){var i,a,n,s,o,v;v=r(),o=v[1],a=v[0],o===0&&(o=Ht),n=o,s=0;do v=r(),v&&(s=v[1]+v[0]*s,s===0&&(s=Ht),n=v[1]+v[0]/n,n===0&&(n=Ht),s=1/s,i=n*s,o*=i);while(v&&h7(i-1)>e&&--t);return a/o}function jx(r,e,t){var i,a,n,s,o;o=r(),s=o[1],s===0&&(s=Ht),a=s,n=0;do o=r(),o&&(n=o[1]+o[0]*n,n===0&&(n=Ht),a=o[1]+o[0]/a,a===0&&(a=Ht),n=1/n,i=a*n,s*=i);while(o&&h7(i-1)>e&&--t);return s}function Bx(r,e){var t,i,a;return i={},arguments.length>1&&(i=e),a=i.tolerance||Vx,t=i.maxIter||Mx,i.keep?jx(r,a,t):Cx(r,a,t)}g7.exports=Bx});var rs=u((nAr,q7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kx=Hu(),Gx=m7(),Hx=y7(),xu;kx()?xu=Gx:xu=Hx;q7.exports=xu});var d7=u((uAr,w7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/function Ux(r,e){var t=e-r+1,i=r,a=0;return n;function n(){return a+=1,t+=2,[a*(i-a),t]}}w7.exports=Ux});var es=u((sAr,b7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Dx=rs(),Wx=d7();function Yx(r,e){var t=Wx(r,e);return 1/(e-r+1+Dx(t))}b7.exports=Yx});var A7=u((oAr,T7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Kx=vr(),Ai=ve(),ts=k(),_7=tr(),Qx=J(),Zx=i8(),E7=Ze(),Jx=Pe(),Xx=q8(),$x=d8(),zx=W8(),is=J8(),xx=Lm(),rrr=Qu(),as=Hm(),err=l7(),trr=es();function irr(r,e,t,i){var a,n,s,o,v,l,f,c,p,m,h,g,w,y;switch(f=0,c=i,l=e<30&&e<=r+1&&r<Jx,l?(w=Kx(e),p=w===e,s=p?!1:ts(w-e)===.5):(p=!1,s=!1),p&&r>.6?(c=!c,n=0):s&&r>.2?(c=!c,n=1):r<Zx&&e>1?n=6:r>1e3&&(e<r||ts(e-50)/r<1)?(c=!c,n=7):r<.5?-.4/Qx(r)<e?n=2:n=3:r<1.1?r*.75<e?n=2:n=3:(v=!1,t&&e>20&&(m=ts((r-e)/e),e>200?20/e>m*m&&(v=!0):m<.4&&(v=!0)),v?n=5:r-1/(3*r)<e?n=2:(n=4,c=!c)),n){case 0:f=$x(e,r),t===!1&&(f*=Ai(e));break;case 1:f=zx(e,r),t===!1&&(f*=Ai(e));break;case 2:f=t?as(e,r):is(e,r),f!==0&&(o=0,a=!1,c&&(o=t?1:Ai(e),t||f>=1||E7*f>o?(o/=f,t||e<1||E7/e>o?(o*=-e,a=!0):o=0):o=0),f*=rrr(e,r,o)/e,a&&(c=!1,f=-f));break;case 3:c=!c,h=err(e,r,c),f=h[0],y=h[1],c=!1,t&&(f/=y);break;case 4:f=t?as(e,r):is(e,r),f!==0&&(f*=trr(e,r));break;case 5:f=xx(e,r),r>=e&&(c=!c);break;case 6:f=t?_7(r,e)/Ai(e+1):_7(r,e)/e,f*=1-e*r/(e+1);break;case 7:f=t?as(e,r):is(e,r),f/=r,f!==0&&(f*=Xx(e,r));break}return t&&f>1&&(f=1),c&&(g=t?1:Ai(e),f=g-f),f}T7.exports=irr});var N7=u((vAr,S7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link https://www.boost.org/doc/libs/1_88_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006-7, 2013-14.
* (C) Copyright Paul A. Bristow 2007, 2013-14.
* (C) Copyright Nikhar Agrawal 2013-14.
* (C) Christopher Kormanyos 2013-14.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var arr=Bt(),nrr=rr(),le=J(),urr=gi(),srr=Pe(),orr=X(),vrr=yi(),O7=A7(),I7=Qu(),frr=es();function lrr(r,e,t,i){var a,n,s,o;return r<0||e<=0?NaN:(a=t===void 0?!0:t,s=i,e>=vrr&&!a?(s&&e*4<r?(o=e*le(r)-r,o+=le(frr(e,r))):!s&&e>4*r?(o=e*le(r)-r,n=0,o+=le(I7(e,r,n)/e)):(o=O7(r,e,!0,s),o===0?s?(o=1+1/(12*e)+1/(288*e*e),o=le(o)-e+(e-.5)*le(e),o+=le(urr)):(o=e*le(r)-r,n=0,o+=le(I7(e,r,n)/e)):o=le(o)+arr(e)),o>srr?orr:nrr(o)):O7(r,e,a,s))}S7.exports=lrr});var Oi=u((fAr,L7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var crr=N7();L7.exports=crr});var V7=u((lAr,R7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_37_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Ut=rr(),rn=tr(),prr=J(),F7=Pe(),P7=qt();function mrr(r,e){var t,i;return i=r*prr(e),e>=1?i<F7&&-e>P7?t=rn(e,r)*Ut(-e):r>=1?t=rn(e/Ut(e/r),r):t=Ut(i-e):i>P7?t=rn(e,r)*Ut(-e):e/r<F7?t=rn(e/Ut(e/r),r):t=Ut(i-e),t}R7.exports=mrr});var j7=u((cAr,C7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/gamma.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006-7, 2013-14.
* Copyright Paul A. Bristow 2007, 2013-14.
* Copyright Nikhar Agrawal 2013-14.
* Copyright Christopher Kormanyos 2013-14.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var hrr=bi(),grr=Bt(),yrr=ve(),qrr=oe(),wrr=Q(),drr=k(),$e=rr(),Ii=tr(),ns=gt(),us=Se(),M7=J(),en=Pe(),Si=qt(),ss=Ct(),brr=ht();function _rr(r,e){var t,i,a,n,s,o,v;return a=r+ss-.5,v=(e-r-ss+.5)/a,r<1?e<=Si?$e(r*M7(e)-e-grr(r)):Ii(e,r)*$e(-e)/yrr(r):(drr(v*v*r)<=100&&r>150?(t=r*(qrr(v)-v)+e*(.5-ss)/a,t=$e(t)):(n=r*M7(e/a),s=r-e,us(n,s)<=Si||ns(n,s)>=en?(i=s/r,us(n,s)/2>Si&&ns(n,s)/2<en?(o=Ii(e/a,r/2)*$e(s/2),t=o*o):us(n,s)/4>Si&&ns(n,s)/4<en&&e>r?(o=Ii(e/a,r/4)*$e(s/4),t=o*o,t*=t):i>Si&&i<en?t=Ii(e*$e(i)/a,r):t=$e(n+s)):t=Ii(e/a,r)*$e(s)),t*=wrr(a/brr)/hrr(r),t)}C7.exports=_rr});var U7=u((pAr,H7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_61_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Err=Wa(),B7=ju(),Trr=Oi(),Arr=oe(),tn=k(),k7=tr(),Orr=J(),Irr=Ye(),G7=zr(),Srr=V7(),Nrr=j7(),ze=new Array(30);function Lrr(r,e,t,i,a,n,s){var o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E,d,C;if(p=e-1,d=r+p/2,i<.35?w=Arr(-i):w=Orr(t),C=-d*w,b=Nrr(e,C),b<=Irr)return a;for(s?(o=b/Err(r,e),o/=k7(d,e)):o=Srr(e,C)/k7(d,e),o*=n,ze[0]=1,q=Trr(C,e,!0,!0),q/=b,f=a+o*q,l=1,m=w/2,m*=m,h=1,y=4*d*d,c=e,_=1;_<ze.length;++_){for(l+=2,ze[_]=0,g=e-_,v=3,A=1;A<_;++A)g=A*e-_,ze[_]+=g*ze[_-A]/B7(v),v+=2;if(ze[_]/=_,ze[_]+=p/B7(l),q=(c*(c+1)*q+(C+c+1)*h)/y,h*=m,c+=2,E=o*ze[_]*q,f+=E,E>1){if(tn(E)<tn(G7*f))break}else if(tn(E/G7)<tn(f))break}return f}H7.exports=Lrr});var W7=u((mAr,D7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_37_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/function Frr(r,e,t){var i,a;if(t===0)return 1;for(i=1,a=0;a<t;a++)i*=(r+a)/(e+a);return i}D7.exports=Frr});var Q7=u((hAr,K7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Y7=k(),Prr=gt();function Rrr(r,e){return Prr(Y7(r),Y7(e))}K7.exports=Rrr});var J7=u((gAr,Z7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Vrr=Q7();Z7.exports=Vrr});var z7=u((yAr,$7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var X7=k(),Mrr=Se();function Crr(r,e){return Mrr(X7(r),X7(e))}$7.exports=Crr});var rh=u((qAr,x7)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jrr=z7();x7.exports=jrr});var nn=u((wAr,ih)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var os=bi(),Brr=J7(),krr=rh(),eh=pt(),xe=oe(),th=Q(),an=k(),ce=rr(),pe=tr(),Grr=Se(),jr=J(),me=Pe(),Dt=qt(),vs=Ct(),Hrr=ht();function Urr(r,e,t,i,a){var n,s,o,v,l,f,c,p,m,h,g,w,y,b;if(!a)return pe(t,r)*pe(i,e);if(y=r+e,v=r+vs-.5,l=e+vs-.5,f=y+vs-.5,n=os(y),n/=os(r)*os(e),n*=th(l/Hrr),n*=th(v/f),c=(t*e-i*v)/v,p=(i*r-t*l)/l,krr(c,p)<.2)if(c*p>0||Grr(r,e)<1)an(c)<.1?n*=ce(r*xe(c)):n*=pe(t*f/v,r),an(p)<.1?n*=ce(e*xe(p)):n*=pe(i*f/l,e);else if(Brr(c,p)<.5)s=r<e,o=e/r,s&&o*p<.1||!s&&c/o>.1?(m=eh(o*xe(p)),m=c+m+m*c,m=r*xe(m),n*=ce(m)):(m=eh(xe(c)/o),m=p+m+m*p,m=e*xe(m),n*=ce(m));else if(an(c)<an(p))if(b=r*xe(c)+e*jr(i*f/l),b<=Dt||b>=me){if(b+=jr(n),b>=me)return NaN;n=ce(b)}else n*=ce(b);else if(b=e*xe(p)+r*jr(t*f/v),b<=Dt||b>=me){if(b+=jr(n),b>=me)return NaN;n=ce(b)}else n*=ce(b);else if(g=t*f/v,w=i*f/l,c=r*jr(g),p=e*jr(w),c>=me||c<=Dt||p>=me||p<=Dt)if(r<e)if(h=pe(w,e/r),m=r*(jr(g)+jr(h)),m<me&&m>Dt)n*=pe(h*g,r);else{if(p+=c+jr(n),p>=me)return NaN;n=ce(p)}else if(h=pe(g,r/e),m=(jr(h)+jr(w))*e,m<me&&m>Dt)n*=pe(h*w,e);else{if(p+=c+jr(n),p>=me)return NaN;n=ce(p)}else n*=pe(g,r)*pe(w,e);return n}ih.exports=Urr});var nh=u((dAr,ah)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_61_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Drr=rs(),Wrr=nn(),Yrr={keep:!0,maxIter:1e3};function Krr(r,e,t,i){var a=0;return n;function n(){var s,o,v;return o=(r+a-1)*(r+e+a-1)*a*(e-a)*t*t,s=r+2*a-1,o/=s*s,v=a,v+=a*(e-a)*t/(r+2*a-1),v+=(r+a)*(r*i-e*t+1+a*(2-t))/(r+2*a+1),a+=1,[o,v]}}function Qrr(r,e,t,i,a,n){var s,o,v;return s=Wrr(r,e,t,i,a),n&&(n[1]=s),s===0?s:(v=Krr(r,e,t,i),o=Drr(v,Yrr),s/o)}ah.exports=Qrr});var fs=u((bAr,uh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zrr=9007199254740991;uh.exports=Zrr});var oh=u((_Ar,sh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Jrr(r,e){var t=0,i;if(r===0)return e;if(e===0)return r;for(;(r&1)===0&&(e&1)===0;)r>>>=1,e>>>=1,t+=1;for(;(r&1)===0;)r>>>=1;for(;e;){for(;(e&1)===0;)e>>>=1;r>e&&(i=e,e=r,r=i),e-=r}return r<<t}sh.exports=Jrr});var fh=u((EAr,vh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Xrr(r,e){var t=1,i;if(r===0)return e;if(e===0)return r;for(;r%2===0&&e%2===0;)r/=2,e/=2,t*=2;for(;r%2===0;)r/=2;for(;e;){for(;e%2===0;)e/=2;r>e&&(i=e,e=r,r=i),e-=r}return t*r}vh.exports=Xrr});var yh=u((TAr,gh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lh=B(),ch=Ir(),ph=X(),mh=mr(),hh=Ra(),$rr=oh(),zrr=fh();function xrr(r,e){return lh(r)||lh(e)?NaN:r===ph||e===ph||r===mh||e===mh?NaN:ch(r)&&ch(e)?(r<0&&(r=-r),e<0&&(e=-e),r<=hh&&e<=hh?$rr(r,e):zrr(r,e)):NaN}gh.exports=xrr});var wh=u((AAr,qh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rer=yh();qh.exports=rer});var Eh=u((OAr,_h)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eer=fs(),ter=X(),dh=Ir(),bh=B(),ier=Oa(),aer=vr(),ner=wh();function ls(r,e){var t,i,a,n,s,o,v;if(bh(r)||bh(e))return NaN;if(!dh(r)||!dh(e))return NaN;if(e<0||(i=1,r<0&&(r=-r+e-1,ier(e)&&(i*=-1)),e>r))return 0;if(e===0||e===r)return i;if(e===1||e===r-1)return i*r;for(r-e<e&&(e=r-e),v=aer(eer/r),t=1,s=1;s<=e&&!(t>v);s++)t*=r,t/=s,r-=1;return s>e?i*t:(a=ls(r,e-s+1),a===ter?i*a:(n=ls(e,e-s+1),o=ner(a,n),a/=o,n/=o,t/=n,i*t*a))}_h.exports=ls});var Ah=u((IAr,Th)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uer=Eh();Th.exports=uer});var Sh=u((SAr,Ih)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_61_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Oh=Ah(),wt=vr(),Ni=tr(),ser=Ye();function oer(r,e,t,i){var a,n,s,o,v;if(n=Ni(t,r),n>ser)for(o=n,v=wt(r-1);v>e;v--)o*=(v+1)*i/((r-v)*t),n+=o;else if(s=wt(r*t),s<=e+1&&(s=wt(e+2)),n=Ni(t,s)*Ni(i,r-s),n*=Oh(wt(r),wt(s)),n===0)for(v=s-1;v>e;v--)n+=Ni(t,v)*Ni(i,r-v),n*=Oh(wt(r),wt(v));else{for(o=n,a=n,v=s-1;v>e;v--)o*=(v+1)*i/((r-v)*t),n+=o;for(o=a,v=s+1;v<=r;v++)o*=(r-v+1)*t/(v*i),n+=o}return n}Ih.exports=oer});var Lh=u((NAr,Nh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_61_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var ver=nn();function fer(r,e,t,i,a,n,s){var o,v,l,f;if(o=ver(r,e,t,i,n),s&&(s[1]=o),o/=r,o===0)return o;for(l=1,v=1,f=0;f<a-1;++f)v*=(r+e+f)*t/(r+f+1),l+=v;return o*=l,o}Nh.exports=fer});var Mh=u((LAr,Vh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var cs=bi(),ler=kt(),cer=oe(),per=Q(),ps=rr(),un=tr(),Li=J(),mer=Ye(),Fh=Pe(),Ph=qt(),ms=Ct(),her=ht(),Rh={maxTerms:100};function ger(r,e,t,i){var a=1-e,n=1;return s;function s(){var o=i/r;return r+=1,i*=a*t/n,n+=1,a+=1,o}}function yer(r,e,t,i,a,n,s){var o,v,l,f,c,p,m,h;return a?(m=r+e,v=r+ms-.5,l=e+ms-.5,f=m+ms-.5,o=cs(m)/(cs(r)*cs(e)),c=Li(f/l)*(e-.5),p=Li(t*f/v)*r,c>Ph&&c<Fh&&p>Ph&&p<Fh?(r*e<l*10?o*=ps((e-.5)*cer(r/l)):o*=un(f/l,e-.5),o*=un(t*f/v,r),o*=per(v/her),n&&(n[1]=o*un(s,e))):(o=Li(o)+c+p+(Li(v)-1)/2,n&&(n[1]=ps(o+e*Li(s))),o=ps(o))):o=un(t,r),o<mer?i:(h=ger(r,e,t,o),Rh.initialValue=i,ler(h,Rh))}Vh.exports=yer});var ys=u((FAr,Uh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_61_0/boost/math/special_functions/beta.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
* (C) Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var qer=B(),wer=pt(),sn=vr(),Ch=oe(),jh=_a(),Br=Ou(),hs=Q(),der=rr(),Fi=tr(),ber=gt(),Bh=Se(),on=Ze(),kh=Ye(),_er=Ra(),Eer=Va(),Hh=Ne(),rt=U7(),gs=W7(),Ter=nn(),Gh=nh(),Aer=Sh(),Pi=Lh(),he=Mh(),Oer=1/Hh;function Ier(r,e,t,i,a,n,s,o){var v,l,f,c,p,m,h,g,w,y,b,q;if(q=1-r,h=o,g=o+s,n[g]=-1,qer(r)||r<0||r>1)return n[h]=NaN,n[g]=NaN,n;if(i){if(e<0||t<0)return n[h]=NaN,n[g]=NaN,n;if(e===0){if(t===0)return n[h]=NaN,n[g]=NaN,n;if(t>0)return n[h]=a?0:1,n}else if(t===0&&e>0)return n[h]=a?1:0,n}else if(e<=0||t<=0)return n[h]=NaN,n[g]=NaN,n;return r===0?(e===1?n[g]=1:n[g]=e<1?on/2:kh*2,a?(n[h]=i?1:Br(e,t),n):(n[h]=0,n)):r===1?(t===1?n[g]=1:n[g]=t<1?on/2:kh*2,a?n[h]=0:n[h]=i?1:Br(e,t),n):e===.5&&t===.5?(n[g]=Oer*hs(q*r),b=jh(hs(a?q:r)),b/=Eer,i||(b*=Hh),n[h]=b,n):(e===1&&(m=t,t=e,e=m,m=q,q=r,r=m,a=!a),t===1?e===1?(n[h]=a?q:r,n[g]=1,n):(n[g]=e*Fi(r,e-1),q<.5?b=a?-wer(e*Ch(-q)):der(e*Ch(-q)):b=a?-(Fi(r,e)-1):Fi(r,e),i||(b/=e),n[h]=b,n):(Bh(e,t)<=1?(r>.5&&(m=t,t=e,e=m,m=q,q=r,r=m,a=!a),ber(e,t)<=1?e>=Bh(.2,t)||Fi(r,e)<=.9?a?(f=-(i?1:Br(e,t)),a=!1,f=-he(e,t,r,f,i,n,q)):f=he(e,t,r,0,i,n,q):(m=t,t=e,e=m,m=q,q=r,r=m,a=!a,q>=.3?a?(f=-(i?1:Br(e,t)),a=!1,f=-he(e,t,r,f,i,n,q)):f=he(e,t,r,0,i,n,q):(i?l=1:l=gs(e+t,e,20),f=Pi(e,t,r,q,20,i,n),a?(f-=i?1:Br(e,t),a=!1,f=-rt(e+20,t,r,q,f,l,i)):f=rt(e+20,t,r,q,f,l,i))):t<=1||r<.1&&Fi(t*r,e)<=.7?a?(f=-(i?1:Br(e,t)),a=!1,f=-he(e,t,r,f,i,n,q)):f=he(e,t,r,0,i,n,q):(m=t,t=e,e=m,m=q,q=r,r=m,a=!a,q>=.3?a?(f=-(i?1:Br(e,t)),a=!1,f=-he(e,t,r,f,i,n,q)):f=he(e,t,r,0,i,n,q):e>=15?a?(f=-(i?1:Br(e,t)),a=!1,f=-rt(e,t,r,q,f,1,i)):f=rt(e,t,r,q,0,1,i):(i?l=1:l=gs(e+t,e,20),f=Pi(e,t,r,q,20,i,n),a?(f-=i?1:Br(e,t),a=!1,f=-rt(e+20,t,r,q,f,l,i)):f=rt(e+20,t,r,q,f,l,i)))):(e<t?v=e-(e+t)*r:v=(e+t)*q-t,v<0&&(m=t,t=e,e=m,m=q,q=r,r=m,a=!a),t<40?sn(e)===e&&sn(t)===t&&e<_er-100?(w=e-1,y=t+w,f=Aer(y,w,r,q),i||(f*=Br(e,t))):t*r<=.7?a?(f=-(i?1:Br(e,t)),a=!1,f=-he(e,t,r,f,i,n,q)):f=he(e,t,r,0,i,n,q):e>15?(y=sn(t),y===t&&(y-=1),c=t-y,i?l=1:l=gs(e+c,c,y),f=Pi(c,e,q,r,y,i),f=rt(e,c,r,q,f,1,i),f/=l):i?(y=sn(t),c=t-y,c<=0&&(y-=1,c+=1),f=Pi(c,e,q,r,y,i),f+=Pi(e,c,r,q,20,i),a&&(f-=1),f=rt(e+20,c,r,q,f,1,i),a&&(f=-f,a=!1)):f=Gh(e,t,r,q,i,n):f=Gh(e,t,r,q,i,n)),n[g]<0&&(n[g]=Ter(e,t,r,q,!0)),p=q*r,n[g]!==0&&(on*p<n[g]?n[g]=on/2:n[g]/=p),n[h]=a?(i?1:Br(e,t))-f:f,n))}Uh.exports=Ier});var Wh=u((PAr,Dh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ser=ys();function Ner(r,e,t,i,a){return Ser(r,e,t,i,a,[0,0],1,0)}Dh.exports=Ner});var qs=u((RAr,Kh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ler=N(),Yh=Wh(),Fer=ys();Ler(Yh,"assign",Fer);Kh.exports=Yh});var Zh=u((VAr,Qh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Per=qs().assign;function Rer(r,e,t,i,a){var n=[0,0];return i=i!==!1,a=a===!0,Per(r,e,t,i,a,n,1,0),n[0]}Qh.exports=Rer});var vn=u((MAr,Jh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ver=Zh();Jh.exports=Ver});var xh=u((CAr,zh)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xh=vn(),$h=B(),Mer=tr();function Cer(r,e){var t,i,a;return $h(r)||$h(e)||e<=0?NaN:r===0?.5:(t=Mer(r,2),e>2*t?(a=t/(e+t),i=Xh(a,.5,e/2,!0,!0)/2):(a=e/(e+t),i=Xh(a,e/2,.5,!0,!1)/2),r>0?1-i:i)}zh.exports=Cer});var e9=u((jAr,r9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function jer(r){return e;function e(){return r}}r9.exports=jer});var dt=u((BAr,t9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ber=e9();t9.exports=Ber});var u9=u((kAr,n9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ker=dt(),i9=vn(),a9=B(),Ger=tr();function Her(r){if(a9(r)||r<=0)return ker(NaN);return e;function e(t){var i,a,n;return a9(t)?NaN:t===0?.5:(i=Ger(t,2),r>2*i?(n=i/(r+i),a=i9(n,.5,r/2,!0,!0)/2):(n=r/(r+i),a=i9(n,r/2,.5,!0,!1)/2),t>0?1-a:a)}}n9.exports=Her});var fn=u((GAr,o9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Uer=N(),s9=xh(),Der=u9();Uer(s9,"factory",Der);o9.exports=s9});var f9=u((HAr,v9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Wer(r){var e,t,i;return r===0?-.0005087819496582806:(r<0?e=-r:e=r,e<=1?(t=-.0005087819496582806+r*(-.008368748197417368+r*(.03348066254097446+r*(-.012692614766297404+r*(-.03656379714117627+r*(.02198786811111689+r*(.008226878746769157+r*(-.005387729650712429+r*(0+r*0)))))))),i=1+r*(-.9700050433032906+r*(-1.5657455823417585+r*(1.5622155839842302+r*(.662328840472003+r*(-.7122890234154284+r*(-.05273963823400997+r*(.07952836873415717+r*(-.0023339375937419+r*.0008862163904564247))))))))):(r=1/r,t=0+r*(0+r*(-.005387729650712429+r*(.008226878746769157+r*(.02198786811111689+r*(-.03656379714117627+r*(-.012692614766297404+r*(.03348066254097446+r*(-.008368748197417368+r*-.0005087819496582806)))))))),i=.0008862163904564247+r*(-.0023339375937419+r*(.07952836873415717+r*(-.05273963823400997+r*(-.7122890234154284+r*(.662328840472003+r*(1.5622155839842302+r*(-1.5657455823417585+r*(-.9700050433032906+r*1))))))))),t/i)}v9.exports=Wer});var c9=u((UAr,l9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Yer(r){var e,t,i;return r===0?-.20243350835593876:(r<0?e=-r:e=r,e<=1?(t=-.20243350835593876+r*(.10526468069939171+r*(8.3705032834312+r*(17.644729840837403+r*(-18.851064805871424+r*(-44.6382324441787+r*(17.445385985570866+r*(21.12946554483405+r*-3.6719225470772936))))))),i=1+r*(6.242641248542475+r*(3.971343795334387+r*(-28.66081804998+r*(-20.14326346804852+r*(48.560921310873994+r*(10.826866735546016+r*(-22.643693341313973+r*1.7211476576120028)))))))):(r=1/r,t=-3.6719225470772936+r*(21.12946554483405+r*(17.445385985570866+r*(-44.6382324441787+r*(-18.851064805871424+r*(17.644729840837403+r*(8.3705032834312+r*(.10526468069939171+r*-.20243350835593876))))))),i=1.7211476576120028+r*(-22.643693341313973+r*(10.826866735546016+r*(48.560921310873994+r*(-20.14326346804852+r*(-28.66081804998+r*(3.971343795334387+r*(6.242641248542475+r*1)))))))),t/i)}l9.exports=Yer});var m9=u((DAr,p9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Ker(r){var e,t,i;return r===0?-.1311027816799519:(r<0?e=-r:e=r,e<=1?(t=-.1311027816799519+r*(-.16379404719331705+r*(.11703015634199525+r*(.38707973897260434+r*(.3377855389120359+r*(.14286953440815717+r*(.029015791000532906+r*(.0021455899538880526+r*(-6794655751811263e-22+r*(28522533178221704e-24+r*-681149956853777e-24))))))))),i=1+r*(3.4662540724256723+r*(5.381683457070069+r*(4.778465929458438+r*(2.5930192162362027+r*(.848854343457902+r*(.15226433829533179+r*(.011059242293464892+r*(0+r*(0+r*0)))))))))):(r=1/r,t=-681149956853777e-24+r*(28522533178221704e-24+r*(-6794655751811263e-22+r*(.0021455899538880526+r*(.029015791000532906+r*(.14286953440815717+r*(.3377855389120359+r*(.38707973897260434+r*(.11703015634199525+r*(-.16379404719331705+r*-.1311027816799519))))))))),i=0+r*(0+r*(0+r*(.011059242293464892+r*(.15226433829533179+r*(.848854343457902+r*(2.5930192162362027+r*(4.778465929458438+r*(5.381683457070069+r*(3.4662540724256723+r*1)))))))))),t/i)}p9.exports=Ker});var g9=u((WAr,h9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Qer(r){var e,t,i;return r===0?-.0350353787183178:(r<0?e=-r:e=r,e<=1?(t=-.0350353787183178+r*(-.0022242652921344794+r*(.018557330651423107+r*(.009508047013259196+r*(.0018712349281955923+r*(.00015754461742496055+r*(460469890584318e-20+r*(-2304047769118826e-25+r*26633922742578204e-28))))))),i=1+r*(1.3653349817554064+r*(.7620591645536234+r*(.22009110576413124+r*(.03415891436709477+r*(.00263861676657016+r*(7646752923027944e-20+r*(0+r*0)))))))):(r=1/r,t=26633922742578204e-28+r*(-2304047769118826e-25+r*(460469890584318e-20+r*(.00015754461742496055+r*(.0018712349281955923+r*(.009508047013259196+r*(.018557330651423107+r*(-.0022242652921344794+r*-.0350353787183178))))))),i=0+r*(0+r*(7646752923027944e-20+r*(.00263861676657016+r*(.03415891436709477+r*(.22009110576413124+r*(.7620591645536234+r*(1.3653349817554064+r*1)))))))),t/i)}h9.exports=Qer});var q9=u((YAr,y9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Zer(r){var e,t,i;return r===0?-.016743100507663373:(r<0?e=-r:e=r,e<=1?(t=-.016743100507663373+r*(-.0011295143874558028+r*(.001056288621524929+r*(.00020938631748758808+r*(14962478375834237e-21+r*(44969678992770644e-23+r*(4625961635228786e-24+r*(-2811287356288318e-29+r*9905570997331033e-32))))))),i=1+r*(.5914293448864175+r*(.1381518657490833+r*(.016074608709367652+r*(.0009640118070051656+r*(27533547476472603e-21+r*(282243172016108e-21+r*(0+r*0)))))))):(r=1/r,t=9905570997331033e-32+r*(-2811287356288318e-29+r*(4625961635228786e-24+r*(44969678992770644e-23+r*(14962478375834237e-21+r*(.00020938631748758808+r*(.001056288621524929+r*(-.0011295143874558028+r*-.016743100507663373))))))),i=0+r*(0+r*(282243172016108e-21+r*(27533547476472603e-21+r*(.0009640118070051656+r*(.016074608709367652+r*(.1381518657490833+r*(.5914293448864175+r*1)))))))),t/i)}y9.exports=Zer});var _9=u((KAr,b9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_81_0/boost/math/special_functions/detail/erf_inv.hpp}. This implementation follows the original, but has been modified for JavaScript.
*
* ```text
* (C) Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Jer=B(),w9=Q(),d9=J(),Xer=X(),$er=mr(),zer=f9(),xer=c9(),rtr=m9(),etr=g9(),ttr=q9(),itr=.08913147449493408,atr=2.249481201171875,ntr=.807220458984375,utr=.9399557113647461,str=.9836282730102539;function otr(r){var e,t,i,a,n;return Jer(r)?NaN:r===0?Xer:r===2?$er:r===1?0:r>2||r<0?NaN:(r>1?(e=-1,i=2-r):(e=1,i=r),r=1-i,r<=.5?(a=r*(r+10),n=zer(r),e*(a*itr+a*n)):i>=.25?(a=w9(-2*d9(i)),i-=.25,n=xer(i),e*(a/(atr+n))):(i=w9(-d9(i)),i<3?(t=i-1.125,n=rtr(t),e*(ntr*i+n*i)):i<6?(t=i-3,n=etr(t),e*(utr*i+n*i)):(t=i-6,n=ttr(t),e*(str*i+n*i))))}b9.exports=otr});var Wt=u((QAr,E9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vtr=_9();E9.exports=vtr});var I9=u((ZAr,O9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C code, long comment, copyright, license, and constants are from [Cephes]{@link http://www.netlib.org/cephes}. The implementation follows the original, but has been modified for JavaScript.
*
* ```text
* Copyright 1984, 1995, 2000 by Stephen L. Moshier
*
* Some software in this archive may be from the book _Methods and Programs for Mathematical Functions_ (Prentice-Hall or Simon & Schuster International, 1989) or from the Cephes Mathematical Library, a commercial product. In either event, it is copyrighted by the author. What you see here may be used freely but it comes with no support or guarantee.
*
* Stephen L. Moshier
* moshier@na-net.ornl.gov
* ```
*/var ftr=B(),T9=_a(),ltr=Q(),A9=su(),ctr=6123233995736766e-32;function ptr(r){var e;return ftr(r)?NaN:r<-1||r>1?NaN:r>.5?2*T9(ltr(.5-.5*r)):(e=A9-T9(r),e+=ctr,e+=A9,e)}O9.exports=ptr});var N9=u((JAr,S9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mtr=I9();S9.exports=mtr});var ln=u((XAr,L9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var htr=1.4142135623730951;L9.exports=htr});var P9=u(($Ar,F9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function gtr(r){return r===0?.16666666666666666:.16666666666666666+r*.16666666666666666}F9.exports=gtr});var V9=u((zAr,R9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function ytr(r){return r===0?.058333333333333334:.058333333333333334+r*(.06666666666666667+r*.008333333333333333)}R9.exports=ytr});var C9=u((xAr,M9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function qtr(r){return r===0?.0251984126984127:.0251984126984127+r*(.026785714285714284+r*(.0017857142857142857+r*.0001984126984126984))}M9.exports=qtr});var B9=u((rOr,j9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function wtr(r){return r===0?.012039792768959435:.012039792768959435+r*(.010559964726631394+r*(-.0011078042328042327+r*(.0003747795414462081+r*27557319223985893e-22)))}j9.exports=wtr});var G9=u((eOr,k9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function dtr(r){return r===0?.003837005972422639:.003837005972422639+r*(.00610392115600449+r*(-.0016095979637646305+r*(.0005945867404200738+r*(-6270542728876062e-20+r*2505210838544172e-23))))}k9.exports=dtr});var U9=u((tOr,H9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function btr(r){return r===0?.0032177478835464946:.0032177478835464946+r*(.0010898206731540065+r*(-.0012579159844784845+r*(.0006908420797309686+r*(-.00016376804137220805+r*(154012654012654e-19+r*16059043836821613e-26)))))}H9.exports=btr});var W9=u((iOr,D9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function _tr(r){return r===0?.001743826229834001:.001743826229834001+r*(3353097688001788e-20+r*(-.0007624513544032393+r*(.0006451304695145635+r*(-.000249472580470431+r*(49255746366361444e-21+r*(-39851014346715405e-22+r*7647163731819816e-28))))))}D9.exports=_tr});var K9=u((aOr,Y9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Etr(r){return r===0?.0009647274732138864:.0009647274732138864+r*(-.0003110108632631878+r*(-.00036307660358786886+r*(.0005140660578834113+r*(-.00029133414466938067+r*(9086710793521991e-20+r*(-15303004486655377e-21+r*(10914179173496788e-22+r*28114572543455206e-31)))))))}Y9.exports=Etr});var Z9=u((nOr,Q9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Ttr(r){return r===0?.0005422926281312969:.0005422926281312969+r*(-.0003694266780000966+r*(-.00010230378073700413+r*(.00035764655430568635+r*(-.00028690924218514614+r*(.00012645437628698076+r*(-33202652391372056e-21+r*(4890304529197534e-21+r*(-3123956959982987e-22+r*822063524662433e-32))))))))}Q9.exports=Ttr});var X9=u((uOr,J9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/special_functions/detail/t_distribution_inv.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Atr=Wa(),Otr=Re(),Itr=Q(),Str=Ne(),Ntr=P9(),Ltr=V9(),Ftr=C9(),Ptr=B9(),Rtr=G9(),Vtr=U9(),Mtr=W9(),Ctr=K9(),jtr=Z9(),Btr=0,ge=[1,0,0,0,0,0,0,0,0,0];function ktr(r,e){var t,i;return i=Atr(r/2,.5)*Itr(r*Str)*(e-.5),t=1/r,ge[1]=Ntr(t),ge[2]=Ltr(t),ge[3]=Ftr(t),ge[4]=Ptr(t),ge[5]=Rtr(t),ge[6]=Vtr(t),ge[7]=Mtr(t),ge[8]=Ctr(t),ge[9]=jtr(t),Btr+i*Otr(ge,i*i)}J9.exports=ktr});var x9=u((sOr,z9)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_61_0/boost/math/special_functions/detail/t_distribution_inv.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Gtr=Wa(),Htr=Re(),$9=Q(),Utr=tr(),Dtr=Ne(),et=[0,0,0,0,0,0,0];function Wtr(r,e){var t,i,a,n,s,o,v,l;return l=Gtr(r/2,.5)*$9(r*Dtr)*e,n=r+2,s=r+4,o=r+6,et[0]=1,et[1]=-(r+1)/(2*n),n*=r+2,et[2]=-r*(r+1)*(r+3)/(8*n*s),n*=r+2,et[3]=-r*(r+1)*(r+5)*((3*r+7)*r-2)/(48*n*s*o),n*=r+2,s*=r+4,et[4]=-r*(r+1)*(r+7)*(((((15*r+154)*r+465)*r+286)*r-336)*r+64)/(384*n*s*o*(r+8)),n*=r+2,et[5]=-r*(r+1)*(r+3)*(r+9)*((((((35*r+452)*r+1573)*r+600)*r-2020)*r+928)*r-128)/(1280*n*s*o*(r+8)*(r+10)),n*=r+2,s*=r+4,o*=r+6,et[6]=-r*(r+1)*(r+11)*(((((((((((945*r+31506)*r+425858)*r+2980236)*r+11266745)*r+20675018)*r+7747124)*r-22574632)*r-8565600)*r+18108416)*r-7099392)*r+884736)/(46080*n*s*o*(r+8)*(r+10)*(r+12)),v=$9(r),a=Utr(v*l,1/r),i=a*a,t=Htr(et,i),t*=v,t/=a,-t}z9.exports=Wtr});var ag=u((oOr,ig)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_61_0/boost/math/special_functions/detail/t_distribution_inv.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var rg=Wt(),Ytr=pt(),eg=Q(),Ktr=tr(),Qtr=Va(),tg=ln();function Ztr(r,e){var t,i,a,n,s,o,v;return r>1e20?-rg(2*e)*tg:(t=1/(r-.5),i=48/(t*t),a=((20700*t/i-98)*t-16)*t+96.36,n=((94.5/(i+a)-3)/i+1)*eg(t*Qtr)*r,v=Ktr(n*2*e,2/r),v>.05+t?(o=-rg(2*e)*tg,v=o*o,r<5&&(a+=.3*(r-4.5)*(o+.6)),a+=(((.05*n*o-5)*o-7)*o-2)*o+i,v=(((((.4*v+6.3)*v+36)*v+94.5)/a-v-3)/i+1)*o,v=Ytr(t*v*v)):v=((1/(((r+6)/(r*v)-.089*n-.822)*(r+2)*3)+.5/(r+4))*v-1)*(r+1)/(r+2)+1/v,s=eg(r*v),-s)}ig.exports=Ztr});var mg=u((vOr,pg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/special_functions/detail/t_distribution_inv.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var ng=Wt(),ug=vr(),ws=mt(),sg=Vt(),Jtr=N9(),cn=Q(),Xtr=k(),og=Qa(),$tr=tr(),ztr=Mt(),vg=ln(),fg=Ne(),lg=X9(),pn=x9(),ds=ag(),cg=268435456,xtr=1/3,rir=106/3,eir=.8549879733383485;function tir(r,e,t){var i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b;if(o=0,e>t?(l=t,t=e,e=l,s=!0):s=!1,ug(r)===r&&r<20)switch(a=ws(1,rir),ug(r)){case 1:e===.5?o=0:o=-og(fg*e)/ztr(fg*e);break;case 2:o=(2*e-1)/cn(2*e*t);break;case 4:v=4*e*t,n=cn(v),g=4*og(Jtr(n)/3)/n,w=cn(g-4),o=e-.5<0?-w:w;break;case 6:if(e<1e-150)return(s?-1:1)*ds(r,e);y=4*(e-e*e),b=$tr(y,xtr),h=6*(1+eir*(1/b-1));do c=h*h,p=c*c,m=h*p,f=h,h=2*(8*y*m-270*c+2187)/(5*(4*y*p-216*h-243));while(Xtr((h-f)/h)>a);h=cn(h-r),o=e-.5<0?-h:h;break;default:r>cg?o=ng(2*e)*vg:r<3?(i=.2742-r*.0242143,e>i?o=lg(r,e):o=pn(r,e)):(i=ws(1,sg(r/-.654)),e>i?o=ds(r,e):o=pn(r,e))}else r>cg?o=-ng(2*e)*vg:r<3?(i=.2742-r*.0242143,e>i?o=lg(r,e):o=pn(r,e)):(i=ws(1,sg(r/-.654)),e>i?o=ds(r,e):o=pn(r,e));return s?-o:o}pg.exports=tir});var gg=u((fOr,hg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/special_functions/detail/t_distribution_inv.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var iir=mg();function air(r,e,t){var i,a,n,s;return a=e/2,n=1-a,i=r*2,s=iir(i,a,n),t&&(t.value=s*s/(i+s*s)),i/(i+s*s)}hg.exports=air});var wg=u((lOr,qg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/detail/ibeta_inverse.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var mn=Re(),nir=Wt(),yg=Q(),uir=rr(),Ve=ln(),ir=[0,0,0,0,0,0,0],Ri=[0,0,0,0];function sir(r,e,t){var i,a,n,s,o,v,l;return i=nir(2*t),i/=-yg(r/2),Ri[0]=i,v=e-r,s=v*v,o=s*v,ir[0]=-v*Ve/2,ir[1]=(1-2*v)/8,ir[2]=-(v*Ve/48),ir[3]=-1/192,ir[4]=-v*Ve/3840,ir[5]=0,ir[6]=0,Ri[1]=mn(ir,i),ir[0]=v*Ve*(3*v-2)/12,ir[1]=(20*s-12*v+1)/128,ir[2]=v*Ve*(20*v-1)/960,ir[3]=(16*s+30*v-15)/4608,ir[4]=v*Ve*(21*v+32)/53760,ir[5]=(-(32*s)+63)/368640,ir[6]=-v*Ve*(120*v+17)/25804480,Ri[2]=mn(ir,i),ir[0]=v*Ve*(-75*s+80*v-16)/480,ir[1]=(-1080*o+868*s-90*v-45)/9216,ir[2]=v*Ve*(-1190*s+84*v+373)/53760,ir[3]=(-2240*o-2508*s+2100*v-165)/368640,ir[4]=0,ir[5]=0,ir[6]=0,Ri[3]=mn(ir,i),n=mn(Ri,1/r),a=n*n,l=-uir(-a/2),a===0?.5:(1+n*yg((1+l)/a))/2}qg.exports=sir});var bs=u((cOr,bg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/special_functions/detail/ibeta_inverse.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var dg=J(),oir=Ze(),hn=oir/4;function vir(r,e){return t;function t(i){var a,n,s;return s=1-i,s===0?[-hn,-hn]:i===0?[-hn,-hn]:(n=dg(i)+e*dg(s)+r,a=1/i-e/s,[n,a])}}bg.exports=vir});var Eg=u((pOr,_g)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fir=B();function lir(r){return r===0||fir(r)?r:r<0?-1:1}_g.exports=lir});var Yt=u((mOr,Tg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cir=Eg();Tg.exports=cir});var Es=u((hOr,Og)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/tools/roots.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Ag=Yt(),gn=k(),pir=mt(),_s=Ze();function mir(r,e,t,i,a,n){var s,o,v,l,f,c,p,m,h,g;h=0,s=0,f=e,l=pir(1,1-a),p=_s,o=_s,v=_s,c=n;do{if(s=h,v=o,o=p,m=r(f),h=m[0],g=m[1],c-=1,h===0)break;if(g===0?(s===0&&(f===t?e=i:e=t,s=r(e),p=e-f),Ag(s)*Ag(h)<0?p<0?p=(f-t)/2:p=(f-i)/2:p<0?p=(f-i)/2:p=(f-t)/2):p=h/g,gn(p*2)>gn(v)&&(p=p>0?(f-t)/2:(f-i)/2),e=f,f-=p,f<=t){if(p=.5*(e-t),f=e-p,f===t||f===i)break}else if(f>=i&&(p=.5*(e-i),f=e-p,f===t||f===i))break;p>0?i=e:t=e}while(c&&gn(f*l)<gn(p));return f}Og.exports=mir});var Sg=u((gOr,Ig)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function hir(r){return r===0?-1:-1+r*(-5+r*5)}Ig.exports=hir});var Lg=u((yOr,Ng)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function gir(r){return r===0?1:1+r*(21+r*(-69+r*46))}Ng.exports=gir});var Pg=u((qOr,Fg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function yir(r){return r===0?7:7+r*(-2+r*(33+r*(-62+r*31)))}Fg.exports=yir});var Vg=u((wOr,Rg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function qir(r){return r===0?25:25+r*(-52+r*(-17+r*(88+r*(-115+r*46))))}Rg.exports=qir});var Cg=u((dOr,Mg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function wir(r){return r===0?7:7+r*(12+r*(-78+r*52))}Mg.exports=wir});var Bg=u((bOr,jg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function dir(r){return r===0?-7:-7+r*(2+r*(183+r*(-370+r*185)))}jg.exports=dir});var Gg=u((_Or,kg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function bir(r){return r===0?-533:-533+r*(776+r*(-1835+r*(10240+r*(-13525+r*5410))))}kg.exports=bir});var Ug=u((EOr,Hg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function _ir(r){return r===0?-1579:-1579+r*(3747+r*(-3372+r*(-15821+r*(45588+r*(-45213+r*15071)))))}Hg.exports=_ir});var Wg=u((TOr,Dg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Eir(r){return r===0?449:449+r*(-1259+r*(-769+r*(6686+r*(-9260+r*3704))))}Dg.exports=Eir});var Kg=u((AOr,Yg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Tir(r){return r===0?63149:63149+r*(-151557+r*(140052+r*(-727469+r*(2239932+r*(-2251437+r*750479)))))}Yg.exports=Tir});var Zg=u((OOr,Qg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Air(r){return r===0?29233:29233+r*(-78755+r*(105222+r*(146879+r*(-1602610+r*(3195183+r*(-2554139+r*729754))))))}Qg.exports=Air});var Xg=u((IOr,Jg)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Oir(r){return r===0?1:1+r*(-13+r*13)}Jg.exports=Oir});var zg=u((SOr,$g)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Iir(r){return r===0?1:1+r*(21+r*(-69+r*46))}$g.exports=Iir});var ey=u((NOr,ry)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/detail/ibeta_inverse.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Kt=Re(),Sir=Wt(),Nir=k(),Lir=rr(),xg=J(),Fir=Q(),Pir=Mt(),Rir=Qa(),Vir=bs(),Mir=Es(),Cir=Sg(),jir=Lg(),Bir=Pg(),kir=Vg(),Gir=Cg(),Hir=Bg(),Uir=Gg(),Dir=Ug(),Wir=Wg(),Yir=Kg(),Kir=Zg(),Qir=Xg(),Zir=zg(),H=[0,0,0,0,0,0],Vi=[0,0,0,0];function Jir(r,e,t){var i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E;return o=Sir(2*r)/-Fir(e/2),A=Pir(t),q=Rir(t),Vi[0]=o,y=A*A,b=q*q,g=A*q,h=g*g,m=h*g,p=h*h,c=h*m,f=m*m,l=p*m,H[0]=(2*y-1)/(3*g),H[1]=-Cir(y)/(36*h),H[2]=jir(y)/(1620*m),H[3]=Bir(y)/(6480*p),H[4]=kir(y)/(90720*c),H[5]=0,Vi[1]=Kt(H,o),H[0]=-Gir(y)/(405*m),H[1]=Hir(y)/(2592*p),H[2]=-Uir(y)/(204120*c),H[3]=-Dir(y)/(2099520*f),H[4]=0,H[5]=0,Vi[2]=Kt(H,o),H[0]=Wir(y)/(102060*c),H[1]=-Yir(y)/(20995200*f),H[2]=Kir(y)/(36741600*l),H[3]=0,H[4]=0,H[5]=0,Vi[3]=Kt(H,o),v=Kt(Vi,1/e),n=q/A,n*=n,w=-(v*v)/(2*y)+xg(y)+b*xg(b)/y,Nir(v)<.7?(H[0]=y,H[1]=g,H[2]=(1-2*y)/3,H[3]=Qir(y)/(36*g),H[4]=Zir(y)/(270*h),H[5]=0,E=Kt(H,v)):(_=Lir(w),H[0]=_,H[1]=n,H[2]=0,H[3]=3*n*(3*n+1)/6,H[4]=4*n*(4*n+1)*(4*n+2)/24,H[5]=5*n*(5*n+1)*(5*n+2)*(5*n+3)/120,E=Kt(H,_),(E-y)*v<0&&(E=1-E)),v<0?(a=0,i=y):(a=y,i=1),(E<a||E>i)&&(E=(a+i)/2),s=Vir(-w,n),E=Mir(s,E,a,i,32,100),E}ry.exports=Jir});var iy=u((LOr,ty)=>{var Mi=1e3,Ci=Mi*60,ji=Ci*60,Bi=ji*24,Xir=Bi*365.25;ty.exports=function(r,e){e=e||{};var t=typeof r;if(t==="string"&&r.length>0)return $ir(r);if(t==="number"&&isNaN(r)===!1)return e.long?xir(r):zir(r);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(r))};function $ir(r){if(r=String(r),!(r.length>100)){var e=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(r);if(e){var t=parseFloat(e[1]),i=(e[2]||"ms").toLowerCase();switch(i){case"years":case"year":case"yrs":case"yr":case"y":return t*Xir;case"days":case"day":case"d":return t*Bi;case"hours":case"hour":case"hrs":case"hr":case"h":return t*ji;case"minutes":case"minute":case"mins":case"min":case"m":return t*Ci;case"seconds":case"second":case"secs":case"sec":case"s":return t*Mi;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return t;default:return}}}}function zir(r){return r>=Bi?Math.round(r/Bi)+"d":r>=ji?Math.round(r/ji)+"h":r>=Ci?Math.round(r/Ci)+"m":r>=Mi?Math.round(r/Mi)+"s":r+"ms"}function xir(r){return yn(r,Bi,"day")||yn(r,ji,"hour")||yn(r,Ci,"minute")||yn(r,Mi,"second")||r+" ms"}function yn(r,e,t){if(!(r<e))return r<e*1.5?Math.floor(r/e)+" "+t:Math.ceil(r/e)+" "+t+"s"}});var ny=u((K,ay)=>{K=ay.exports=As.debug=As.default=As;K.coerce=aar;K.disable=tar;K.enable=ear;K.enabled=iar;K.humanize=iy();K.names=[];K.skips=[];K.formatters={};var Ts;function rar(r){var e=0,t;for(t in r)e=(e<<5)-e+r.charCodeAt(t),e|=0;return K.colors[Math.abs(e)%K.colors.length]}function As(r){function e(){if(e.enabled){var t=e,i=+new Date,a=i-(Ts||i);t.diff=a,t.prev=Ts,t.curr=i,Ts=i;for(var n=new Array(arguments.length),s=0;s<n.length;s++)n[s]=arguments[s];n[0]=K.coerce(n[0]),typeof n[0]!="string"&&n.unshift("%O");var o=0;n[0]=n[0].replace(/%([a-zA-Z%])/g,function(l,f){if(l==="%%")return l;o++;var c=K.formatters[f];if(typeof c=="function"){var p=n[o];l=c.call(t,p),n.splice(o,1),o--}return l}),K.formatArgs.call(t,n);var v=e.log||K.log||console.log.bind(console);v.apply(t,n)}}return e.namespace=r,e.enabled=K.enabled(r),e.useColors=K.useColors(),e.color=rar(r),typeof K.init=="function"&&K.init(e),e}function ear(r){K.save(r),K.names=[],K.skips=[];for(var e=(typeof r=="string"?r:"").split(/[\s,]+/),t=e.length,i=0;i<t;i++)e[i]&&(r=e[i].replace(/\*/g,".*?"),r[0]==="-"?K.skips.push(new RegExp("^"+r.substr(1)+"$")):K.names.push(new RegExp("^"+r+"$")))}function tar(){K.enable("")}function iar(r){var e,t;for(e=0,t=K.skips.length;e<t;e++)if(K.skips[e].test(r))return!1;for(e=0,t=K.names.length;e<t;e++)if(K.names[e].test(r))return!0;return!1}function aar(r){return r instanceof Error?r.stack||r.message:r}});var Os=u((Ar,sy)=>{Ar=sy.exports=ny();Ar.log=sar;Ar.formatArgs=uar;Ar.save=oar;Ar.load=uy;Ar.useColors=nar;Ar.storage=typeof chrome<"u"&&typeof chrome.storage<"u"?chrome.storage.local:far();Ar.colors=["lightseagreen","forestgreen","goldenrod","dodgerblue","darkorchid","crimson"];function nar(){return typeof window<"u"&&window.process&&window.process.type==="renderer"?!0:typeof document<"u"&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||typeof window<"u"&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||typeof navigator<"u"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||typeof navigator<"u"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)}Ar.formatters.j=function(r){try{return JSON.stringify(r)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}};function uar(r){var e=this.useColors;if(r[0]=(e?"%c":"")+this.namespace+(e?" %c":" ")+r[0]+(e?"%c ":" ")+"+"+Ar.humanize(this.diff),!!e){var t="color: "+this.color;r.splice(1,0,t,"color: inherit");var i=0,a=0;r[0].replace(/%[a-zA-Z%]/g,function(n){n!=="%%"&&(i++,n==="%c"&&(a=i))}),r.splice(a,0,t)}}function sar(){return typeof console=="object"&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}function oar(r){try{r==null?Ar.storage.removeItem("debug"):Ar.storage.debug=r}catch{}}function uy(){var r;try{r=Ar.storage.debug}catch{}return!r&&typeof process<"u"&&"env"in process&&(r=process.env.DEBUG),r}Ar.enable(uy());function far(){try{return window.localStorage}catch{}}});var ki=u((FOr,oy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lar=34028234663852886e22;oy.exports=lar});var py=u((POr,cy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var car=Os(),vy=Oi(),par=k(),mar=rr(),fy=J(),har=ki(),ly=car("gammaincinv:higher_newton");function gar(r,e,t,i,a,n,s,o){var v,l,f,c,p,m,h,g,w,y,b,q,A,_;_=r,b=1,q=1,m=e*e,l=r;do{if(_=r,h=_*_,t===0){if(v=(1-e)*fy(_)+_+n,v>fy(har))return ly("Warning: overflow problems in one or more steps of the computation. The initial approximation to the root is returned."),l;A=mar(v)}else A=-s*_;o?(g=vy(_,e,!0,!1),f=-A*(g-i)):(w=vy(_,e,!0,!0),f=A*(w-a)),A=f,i>1e-120||q>1?(c=.5*(_-e+1)/_,p=(2*h-4*_*e+4*_+2*m-3*e+1)/h,p/=6,r=_+A*(1+A*(c+A*p))):r=_+A,b=par(_/r-1),q+=1,_=r,_<0&&(_=l,q=100)}while(b>2e-14&&q<35);return(b>2e-14||q>99)&&ly("Warning: the number of iterations in the Newton method reached the upper limit N=35. The last value obtained for the root is given as output."),y=_||0,y}cy.exports=gar});var hy=u((ROr,my)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function yar(r){return r===0?0:0+r*(1+r*(1+r*(1.5+r*(2.6666666666666665+r*(5.208333333333333+r*10.8)))))}my.exports=yar});var yy=u((VOr,gy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function qar(r){return r===0?1:1+r*(1+r*(.3333333333333333+r*(.027777777777777776+r*(-.003703703703703704+r*(.0002314814814814815+r*5878894767783657e-20)))))}gy.exports=qar});var Is=u((MOr,wy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var war=k(),dar=rr(),qy=J(),bar=Re(),_ar=hy(),Ear=yy(),Tar=1e-8,Aar=.08333333333333333,Oar=.008333333333333333,Qt=[1,0,0,0,0,0];function Iar(r){var e,t,i,a,n,s,o,v,l;if(l=r*r*.5,r===0?n=0:r<-1?(v=dar(-1-l),n=_ar(v)):r<1?(v=r,n=Ear(v)):(v=11+l,s=qy(v),n=v+s,v=1/v,e=s*s,t=e*s,i=t*s,a=i*s,Qt[1]=(2-s)*.5,Qt[2]=(-9*s+6+2*e)/6,Qt[3]=-(3*t+36*s-22*e-12)*Aar,Qt[4]=(60+350*e-300*s-125*t+12*i)/60,Qt[5]=-(-120-274*i+900*s-1700*e+1125*t+20*a)*Oar,n+=s*v*bar(Qt,v)),v=1,r>-3.5&&r<-.03||r>.03&&r<40){v=1,o=n;do n=o*(l+qy(o))/(o-1),v=war(o/n-1),o=n;while(v>Tar)}return n}wy.exports=Iar});var by=u((COr,dy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Sar=.9189385332046728;dy.exports=Sar});var Ey=u((jOr,_y)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Nar=[1.9963790515900766,-.0017971032528832887,13129285796384672e-21,-2340875228178749e-22,72291210671127e-22,-3280997607821e-22,19875070901e-21,-1509214183e-21,1375340084e-22,-145728923e-22,17532367e-22,-2351465e-22,346551e-22,-55471e-22,9548e-22,-1748e-22,332e-22,-58e-22];function Lar(r,e){var t,i,a,n,s;i=0,a=0,t=e+e,s=r;do n=a,a=i,i=t*a-n+Nar[s],s-=1;while(s>=0);return(i-n)/2}_y.exports=Lar});var Ay=u((BOr,Ty)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Far(r){return r===0?.025721014990011306:.025721014990011306+r*(.08247596616699963+r*(-.0025328157302663564+r*(.0006099292666946337+r*(-.00033543297638406+r*.000250505279903))))}Ty.exports=Far});var Iy=u((kOr,Oy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Par(r){return r===0?.08333333333333333:.08333333333333333+r*(-.002777777777777778+r*(.0007936507936507937+r*-.0005952380952380953))}Oy.exports=Par});var Ny=u((GOr,Sy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ss=Bt(),qn=J(),Ns=by(),Rar=Ti(),Var=ki(),Mar=Ey(),Car=Ay(),jar=Iy(),Bar=.30865217988013566;function kar(r){var e;return r<Rar?Var:r<1?Ss(r+1)-(r+.5)*qn(r)+r-Ns:r<2?Ss(r)-(r-.5)*qn(r)+r-Ns:r<3?Ss(r-1)-(r-.5)*qn(r)+r-Ns+qn(r-1):r<12?(e=18/(r*r)-1,Mar(17,e)/(12*r)):(e=1/(r*r),r<1e3?Car(e)/(Bar+e)/r:jar(e)/r)}Sy.exports=kar});var Py=u((HOr,Fy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ly=rr(),Gar=ve(),Har=J(),Uar=ki(),Dar=gi(),War=Ny();function Yar(r){return r>=3?Ly(War(r)):r>0?Gar(r)/(Ly(-r+(r-.5)*Har(r))*Dar):Uar}Fy.exports=Yar});var Vy=u((UOr,Ry)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Kar(r){var e,t,i;return r===0?-.3333333333438:(r<0?e=-r:e=r,e<=1?(t=-.3333333333438+r*(-.2070740359969+r*(-.05041806657154+r*(-.004923635739372+r*-4293658292782e-17))),i=1+r*(.7045554412463+r*(.2118190062224+r*(.03048648397436+r*.001605037988091)))):(r=1/r,t=-4293658292782e-17+r*(-.004923635739372+r*(-.05041806657154+r*(-.2070740359969+r*-.3333333333438))),i=.001605037988091+r*(.03048648397436+r*(.2118190062224+r*(.7045554412463+r*1)))),t/i)}Ry.exports=Kar});var Cy=u((DOr,My)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qar=k(),Zar=J(),Jar=Is(),Xar=Vy();function $ar(r){var e;return Qar(r)<1?Xar(r):(e=Jar(r),Zar(r/(e-1))/r)}My.exports=$ar});var By=u((WOr,jy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function zar(r){var e,t,i;return r===0?-.0172847633523:(r<0?e=-r:e=r,e<=1?(t=-.0172847633523+r*(-.0159372646475+r*(-.00464910887221+r*(-.00060683488776+r*-614830384279e-17))),i=1+r*(.764050615669+r*(.297143406325+r*(.0579490176079+r*.00574558524851)))):(r=1/r,t=-614830384279e-17+r*(-.00060683488776+r*(-.00464910887221+r*(-.0159372646475+r*-.0172847633523))),i=.00574558524851+r*(.0579490176079+r*(.297143406325+r*(.764050615669+r*1)))),t/i)}jy.exports=zar});var Gy=u((YOr,ky)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function xar(r){var e,t,i;return r===0?-.0172839517431:(r<0?e=-r:e=r,e<=1?(t=-.0172839517431+r*(-.0146362417966+r*(-.00357406772616+r*(-.000391032032692+r*249634036069e-17))),i=1+r*(.690560400696+r*(.249962384741+r*(.0443843438769+r*.00424073217211)))):(r=1/r,t=249634036069e-17+r*(-.000391032032692+r*(-.00357406772616+r*(-.0146362417966+r*-.0172839517431))),i=.00424073217211+r*(.0443843438769+r*(.249962384741+r*(.690560400696+r*1)))),t/i)}ky.exports=xar});var Uy=u((KOr,Hy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function rnr(r){var e,t,i;return r===0?.99994466948:(r<0?e=-r:e=r,e<=1?(t=.99994466948+r*(104.649839762+r*(857.204033806+r*(731.901559577+r*45.5174411671))),i=1+r*(104.526456943+r*(823.313447808+r*(3119.93802124+r*3970.03311219)))):(r=1/r,t=45.5174411671+r*(731.901559577+r*(857.204033806+r*(104.649839762+r*.99994466948))),i=3970.03311219+r*(3119.93802124+r*(823.313447808+r*(104.526456943+r*1)))),t/i)}Hy.exports=rnr});var Wy=u((QOr,Dy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var enr=J(),tnr=By(),inr=Gy(),anr=Uy();function nnr(r){var e,t;return r<-5?(t=r*r,e=enr(-r),(12-t-6*(e*e))/(12*t*r)):r<-2?tnr(r):r<2?inr(r):r<1e3?(t=1/r,anr(r)/(-12*r)):-1/(12*r)}Dy.exports=nnr});var Ky=u((ZOr,Yy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function unr(r){var e,t,i;return r===0?.0495346498136:(r<0?e=-r:e=r,e<=1?(t=.0495346498136+r*(.0299521337141+r*(.00688296911516+r*(.000512634846317+r*-201411722031e-16))),i=1+r*(.759803615283+r*(.261547111595+r*(.0464854522477+r*.00403751193496)))):(r=1/r,t=-201411722031e-16+r*(.000512634846317+r*(.00688296911516+r*(.0299521337141+r*.0495346498136))),i=.00403751193496+r*(.0464854522477+r*(.261547111595+r*(.759803615283+r*1)))),t/i)}Yy.exports=unr});var Zy=u((JOr,Qy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function snr(r){var e,t,i;return r===0?.00452313583942:(r<0?e=-r:e=r,e<=1?(t=.00452313583942+r*(.00120744920113+r*(-789724156582e-16+r*(-504476066942e-16+r*-535770949796e-17))),i=1+r*(.912203410349+r*(.405368773071+r*(.0901638932349+r*.00948935714996)))):(r=1/r,t=-535770949796e-17+r*(-504476066942e-16+r*(-789724156582e-16+r*(.00120744920113+r*.00452313583942))),i=.00948935714996+r*(.0901638932349+r*(.405368773071+r*(.912203410349+r*1)))),t/i)}Qy.exports=snr});var Xy=u((XOr,Jy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function onr(r){var e,t,i;return r===0?.00439937562904:(r<0?e=-r:e=r,e<=1?(t=.00439937562904+r*(.000487225670639+r*(-.000128470657374+r*(529110969589e-17+r*15716677175e-17))),i=1+r*(.794435257415+r*(.333094721709+r*(.0703527806143+r*.00806110846078)))):(r=1/r,t=15716677175e-17+r*(529110969589e-17+r*(-.000128470657374+r*(.000487225670639+r*.00439937562904))),i=.00806110846078+r*(.0703527806143+r*(.333094721709+r*(.794435257415+r*1)))),t/i)}Jy.exports=onr});var zy=u(($Or,$y)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function vnr(r){var e,t,i;return r===0?-.0011481191232:(r<0?e=-r:e=r,e<=1?(t=-.0011481191232+r*(-.112850923276+r*(1.51623048511+r*(-.218472031183+r*.0730002451555))),i=1+r*(14.2482206905+r*(69.7360396285+r*(218.938950816+r*277.067027185)))):(r=1/r,t=.0730002451555+r*(-.218472031183+r*(1.51623048511+r*(-.112850923276+r*-.0011481191232))),i=277.067027185+r*(218.938950816+r*(69.7360396285+r*(14.2482206905+r*1)))),t/i)}$y.exports=vnr});var rq=u((zOr,xy)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function fnr(r){var e,t,i;return r===0?-.000145727889667:(r<0?e=-r:e=r,e<=1?(t=-.000145727889667+r*(-.290806748131+r*(-13.308504545+r*(199.722374056+r*-11.4311378756))),i=1+r*(139.612587808+r*(2189.01116348+r*(7115.24019009+r*45574.6081453)))):(r=1/r,t=-11.4311378756+r*(199.722374056+r*(-13.308504545+r*(-.290806748131+r*-.000145727889667))),i=45574.6081453+r*(7115.24019009+r*(2189.01116348+r*(139.612587808+r*1)))),t/i)}xy.exports=fnr});var iq=u((xOr,tq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eq=J(),lnr=Ky(),cnr=Zy(),pnr=Xy(),mnr=zy(),hnr=rq();function gnr(r){var e,t;return r<-8?(e=r*r,t=eq(-r)/r,(-30+r*t*(6*e*t*t-12+e))/(12*r*e*e)):r<-4?lnr(r)/(r*r):r<-2?cnr(r):r<2?pnr(r):r<10?(e=1/r,mnr(e)/(r*r)):r<100?(e=1/r,hnr(e)/(r*r)):-eq(r)/(12*r*r*r)}tq.exports=gnr});var cq=u((rIr,lq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ynr=Os(),aq=Re(),re=Bt(),qnr=Wt(),nq=ve(),wn=Q(),uq=k(),Zt=rr(),wnr=Se(),dnr=tr(),kr=J(),bnr=gi(),_nr=ki(),Enr=Yu(),Tnr=py(),sq=Is(),oq=Py(),Anr=Cy(),Onr=Wy(),Inr=iq(),Snr=ynr("gammaincinv:compute"),tt=.5,Ls=.3333333333333333,Nnr=.25,vq=.2,fq=.16666666666666666,Lnr=.08333333333333333,Fnr=.041666666666666664,Gr=[0,0,0,0,0];function Pnr(r,e,t){var i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E,d,C,G,z,x,Z,Fr,Or,T,W,Nt,p0,m0,h0,ff,br,or,g0,_r,Ae,Xr,y0,q0,w0;if(e<tt?(s=!0,o=e,y0=-1):(s=!1,o=t,y0=1),_r=0,uq(r-1)<1e-4&&(Ae=0,s?e<.001?(p0=e*e,Or=p0*e,Nt=Or*e,E=Nt*e,_=E*e,d=e+p0*tt+Or*Ls+Nt*Nnr+E*vq+_*fq):d=-kr(1-e):d=-kr(t),r===1?(_r=2,h0=d):(n=re(r),_r=1)),t<1e-30&&r<tt&&(Ae=0,d=-kr(t*nq(r))+(r-1)*kr(-kr(t*nq(r))),_r=1,n=re(r)),r>1&&r<500&&e<1e-80){for(Ae=0,v=1/r,i=1/(r+1),d=(re(r+1)+kr(e))*v,d=Zt(d),w=d,g0=0;g0<10;g0++)d=w*Zt(d*v)*dnr(1-d*i,v);_r=1,n=re(r)}if(l=1/r*(kr(e)+re(r+1)),l<kr(vq*(1+r))&&_r===0&&(Xr=Zt(l),Ae=0,C=r*r,m0=C*r,T=m0*r,y=r+1,m=y*y,p=y*m,c=m*m,b=r+2,f=b*b,q=r+3,Gr[0]=1,Gr[1]=1/y,Gr[2]=tt*(3*r+5)/(m*b),Gr[3]=Ls*(31+8*C+33*r)/(p*b*q),Gr[4]=Fnr*(2888+1179*m0+125*T+3971*C+5661*r)/(c*f*q*(r+4)),d=Xr*aq(Gr,Xr),n=re(r),_r=1),r<10&&_r===0&&(h=wn(r)/(oq(r)*bnr),g=wnr(.02,h),t<g&&(Ae=0,br=1-r,Z=br*br,Fr=Z*br,A=wn(-2/r*kr(t/h)),d=r*sq(A),or=kr(d),d>5?(G=or*or,z=G*or,x=z*or,Xr=1/d,Gr[0]=or-1,Gr[1]=(3*br-2*br*or+G-2*or+2)*tt,Gr[2]=(24*br*or-11*Z-24*br-6*G+12*or-12-9*br*G+6*Z*or+2*z)*fq,Gr[3]=(-12*Fr*or+8.04*br*G-114*Z*or+(72+36*G)+(3*x-72*or+162)*(br-168*br*or)-(12*z+25*Fr)-(22*br*z+36*Z*G+120*Z))*Lnr,Gr[4]=0,d=d-or+br*Xr*aq(Gr,Xr)):(Xr=1/d,G=or*or,ff=or-1,q0=or-br*Xr*ff,q0<d&&(d-=q0)),n=re(r),_r=1)),uq(o-tt)<1e-5&&_r===0&&(Ae=0,v=1/r,d=r-Ls+(.019753086419753086+.007211444248481286*v)*v,n=re(r),_r=1),r<1&&_r===0&&(Ae=0,s?d=Zt(1/r*(kr(o)+re(r+1))):d=Zt(1/r*(kr(1-o)+re(r+1))),n=re(r),_r=1),_r===0)if(Ae=1,v=1/r,Xr=qnr(2*o),A=y0*Xr/wn(r*tt),Xr<_nr)A+=(Anr(A)+(Onr(A)+Inr(A)*v)*v)*v,d=r*sq(A),w0=A,W=-wn(r/Enr)*Zt(-tt*r*w0*w0)/oq(r),a=1/W;else return Snr("Warning: Overflow problems in one or more steps of the computation."),NaN;return _r<2&&(h0=Tnr(d,r,Ae,e,t,n,a,s)),h0}lq.exports=Pnr});var yq=u((eIr,gq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pq=B(),Rnr=Ti(),mq=X(),hq=cq();function Vnr(r,e,t){return pq(r)||pq(e)?NaN:e<Rnr?NaN:r>1||r<0?NaN:t===!0?r===0?mq:r===1?0:hq(e,1-r,r):r===0?0:r===1?mq:hq(e,r,1-r)}gq.exports=Vnr});var wq=u((tIr,qq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mnr=yq();qq.exports=Mnr});var bq=u((iIr,dq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cnr=5e-324;dq.exports=Cnr});var Aq=u((aIr,Tq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/detail/ibeta_inverse.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var _q=wq(),Eq=J(),jnr=Q(),Bnr=bq(),knr=bs(),Gnr=Es();function Hnr(r,e,t,i){var a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E,d,C,G,z,x,Z,Fr,Or,T,W,Nt;return t<i?v=_q(t,e,!0):v=_q(i,e,!1),v/=r,y=e/r,T=jnr(1+y),_=T*T,E=_*T,d=_*_,C=E*_,G=E*E,z=d*E,x=d*d,Z=C*d,f=C*C,Or=v-y,b=Or*Or,q=b*Or,A=b*b,Fr=T+1,c=Fr*Fr,p=Fr*c,m=c*c,h=(T+2)*(T-1)/(3*T),h+=(E+9*_+21*T+5)*Or/(36*_*Fr),h-=(d-13*E+69*_+167*T+46)*b/(1620*c*E),h-=(7*C+21*d+70*E+26*_-93*T-31)*q/(6480*p*d),h-=(75*G+202*C+188*d-888*E-1345*_+118*T+138)*A/(272160*m*C),g=(28*d+131*E+402*_+581*T+208)*(T-1)/(1620*Fr*E),g-=(35*G-154*C-623*d-1636*E-3983*_-3514*T-925)*Or/(12960*c*d),g-=(2132*z+7915*G+16821*C+35066*d+87490*E+141183*_+95993*T+21640)*b/(816480*C*p),g-=(11053*x+53308*z+117010*G+163924*C+116188*d-258428*E-677042*_-481940*T-105497)*q/(14696640*m*G),w=-((3592*z+8375*G-1323*C-29198*d-89578*E-154413*_-116063*T-29632)*(T-1))/(816480*C*c),w-=(442043*Z+2054169*x+3803094*z+3470754*G+2141568*C-2393568*d-19904934*E-34714674*_-23128299*T-5253353)*Or/(146966400*G*p),w-=(116932*f+819281*Z+2378172*x+4341330*z+6806004*G+10622748*C+18739500*d+30651894*E+30869976*_+15431867*T+2919016)*b/(146966400*m*z),l=v+h/r+g/(r*r)+w/(r*r*r),l<=0&&(l=Bnr),W=l-y*Eq(l)+(1+y)*Eq(1+y)-y,a=1/(1+y),s=l<y?a:0,o=l<y?1:a,Nt=(s+o)/2,n=knr(W,y),Gnr(n,Nt,s,o,32,100)}Tq.exports=Hnr});var Iq=u((nIr,Oq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/tools/roots.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var fr=k(),Unr=mt(),Fs=Yt(),Dnr=gt(),Ps=Ze();function Wnr(r,e,t,i,a,n){var s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_;q=0,o=!1,c=e,f=Unr(1,1-a),h=Dnr(1e7*e,1e7),p=0,v=h,l=h,m=n;do{if(p=q,l=v,v=h,b=r(c),q=b[0],A=b[1],_=b[2],m-=1,q===0)break;if(A===0?(p===0&&(c===t?e=i:e=t,p=r(e),h=e-c),Fs(p)*Fs(q)<0?h<0?h=(c-t)/2:h=(c-i)/2:h<0?h=(c-i)/2:h=(c-t)/2):_===0?h=q/A:(g=2*q,y=2*A-q*(_/A),fr(y)<1&&fr(g)>=fr(y)*Ps?h=q/A:h=g/y,h*A/q<0&&(h=q/A,fr(h)>2*fr(e)&&(h=(h<0?-1:1)*2*fr(e)))),s=fr(h/l),s>.8&&s<2&&(h=h>0?(c-t)/2:(c-i)/2,fr(h)>c&&(h=Fs(h)*c),l=h*3),e=c,c-=h,c<t){if(fr(t)<1&&fr(c)>1&&Ps/fr(c)<fr(t)?w=1e3:w=c/t,fr(w)<1&&(w=1/w),!o&&w>0&&w<3)h=.99*(e-t),c=e-h,o=!0;else if(h=(e-t)/2,c=e-h,c===t||c===i)break}else if(c>i){if(fr(i)<1&&fr(c)>1&&Ps/fr(c)<fr(i)?w=1e3:w=c/i,fr(w)<1&&(w=1/w),!o&&w>0&&w<3)h=.99*(e-i),c=e-h,o=!0;else if(h=(e-i)/2,c=e-h,c===t||c===i)break}h>0?i=e:t=e}while(m&&fr(c*f)<fr(h));return c}Oq.exports=Wnr});var Nq=u((uIr,Sq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_64_0/boost/math/special_functions/detail/ibeta_inverse.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Ynr=qs().assign,Knr=k(),Qnr=Ze(),Rs=Ye();function Znr(r,e,t,i){return a;function a(n){var s,o,v,l,f;return f=1-n,s=[0,0],Ynr(n,r,e,!0,i,s,1,0),l=s[0]-t,o=s[1],i&&(o=-o),f===0&&(f=Rs*64),n===0&&(n=Rs*64),v=o*(-(f*r)+(e-2)*n+1),Knr(v)<f*n*Qnr&&(v/=f*n),i&&(v=-v),o===0&&(o=(i?-1:1)*Rs*64),[l,o,v]}}Sq.exports=Znr});var kq=u((sIr,Bq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*
* ## Notice
*
* The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_62_0/boost/math/special_functions/detail/ibeta_inverse.hpp}. The implementation has been modified for JavaScript.
*
* ```text
* Copyright John Maddock 2006.
* Copyright Paul A. Bristow 2007.
*
* Use, modification and distribution are subject to the
* Boost Software License, Version 1.0. (See accompanying file
* LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
* ```
*/var Jnr=Re(),Lq=vn(),Vs=pt(),Fq=oe(),Xnr=_a(),Jt=Ou(),Pq=Q(),$nr=k(),Rq=rr(),ye=tr(),Vq=Mt(),znr=gt(),xnr=Se(),Mq=J(),Ms=Ye(),Cq=Va(),jq=zr(),r0r=gg(),e0r=wg(),t0r=ey(),i0r=Aq(),a0r=Iq(),n0r=Nq(),u0r=32,s0r=1e3,bt=[0,0,0,0,0];function o0r(r,e,t,i){var a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E,d,C,G,z,x,Z,Fr,Or,T,W;if(n=!1,i===0)return[1,0];if(t===0)return[0,1];if(r===1){if(e===1)return[t,1-t];g=e,e=r,r=g,g=i,i=t,t=g,n=!0}if(T=0,o=0,l=1,r===.5){if(e===.5)return T=Vq(t*Cq),T*=T,W=Vq(i*Cq),W*=W,[T,W];e>.5&&(g=e,e=r,r=g,g=i,i=t,t=g,n=!n)}if(e===.5&&r>=.5&&t!==1)C={},T=r0r(r,t,C),W=C.value;else{if(e===1)return t<i?r>1?(T=ye(t,1/r),W=-Vs(Mq(t)/r)):(T=ye(t,1/r),W=1-T):(T=Rq(Fq(-i)/r),W=-Vs(Fq(-i)/r)),n&&(g=W,W=T,T=g),[T,W];if(r+e>5)t>.5&&(g=e,e=r,r=g,g=i,i=t,t=g,n=!n),p=xnr(r,e),c=znr(r,e),Pq(p)>c-p&&p>5?(T=e0r(r,e,t),W=1-T):(Z=r+e,v=Xnr(Pq(r/Z)),s=p/Z,s>=.2&&s<=.8&&Z>=10?(h=ye(t,1/r),h<.0025&&r+e<200?T=h*ye(r*Jt(r,e),1/r):T=t0r(t,Z,v),W=1-T):(r<e&&(g=e,e=r,r=g,g=i,i=t,t=g,n=!n),m=0,e<2&&(m=Jt(r,e)),m===0?W=1:(W=ye(e*i*m,1/e),T=1-W)),W>1e-5&&(T=i0r(r,e,t,i),W=1-T));else if(r<1&&e<1){if(d=(1-r)/(2-r-e),q=Lq(d,r,e)-t,$nr(q)/t<jq*3)return n?[1-d,d]:[d,1-d];q<0&&(g=e,e=r,r=g,g=i,i=t,t=g,n=!n,d=1-d),E=ye(r*t*Jt(r,e),1/r),T=E/(1+E),W=1/(1+E),T>d&&(T=d),l=d}else r>1&&e>1?(d=(r-1)/(r+e-2),w=(e-1)/(r+e-2),_=Lq(d,r,e)-t,_<0&&(g=e,e=r,r=g,g=i,i=t,t=g,g=w,w=d,d=g,n=!n),A=Mq(t*r*Jt(r,e))/r,T=Rq(A),W=T<.9?1-T:-Vs(A),e<r&&T<.2&&(y=r-1,b=e-1,G=r*r,z=r*G,x=e*e,bt[0]=0,bt[1]=1,bt[2]=b/y,y*=y,bt[3]=b*(3*r*e+5*e+G-r-4)/(2*(r+2)*y),y*=r+1,bt[4]=b*(33*r*x+31*x+8*G*x-30*r*e-47*e+11*G*e+6*z*e+18+4*r-z+G*G-10*G),bt[4]/=3*(r+3)*(r+2)*y,T=Jnr(bt,T)),T>d&&(T=d),l=d):(e<r&&(g=e,e=r,r=g,g=i,i=t,t=g,n=!n),ye(t,1/r)<.5?(T=ye(t*r*Jt(r,e),1/r),T===0&&(T=Ms),W=1-T):(W=ye(1-ye(t,e*Jt(r,e)),1/e),W===0&&(W=Ms),T=1-W))}return T>.5&&(g=e,e=r,r=g,g=i,i=t,t=g,g=W,W=T,T=g,n=!n,Fr=1-l,Or=1-o,o=Fr,l=Or),o===0&&(n?(o=jq,T<o&&(T=o)):o=Ms,T<o&&(T=o)),a=u0r,T<1e-50&&(r<1||e<1)&&(a*=3,a/=2),f=n0r(r,e,t<i?t:i,t>=i),T=a0r(f,T,o,l,a,s0r),T===o&&(T=0),n?[1-T,T]:[T,1-T]}Bq.exports=o0r});var Cs=u((oIr,Gq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var v0r=kq();Gq.exports=v0r});var Dq=u((vIr,Uq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var f0r=Cs(),Hq=B(),l0r=Yt(),c0r=Q();function p0r(r,e){var t,i;return Hq(e)||Hq(r)||e<=0||r<0||r>1?NaN:(t=r>.5?1-r:r,i=f0r(e/2,.5,2*t,1-2*t),l0r(r-.5)*c0r(e*i[1]/i[0]))}Uq.exports=p0r});var Kq=u((fIr,Yq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var m0r=dt(),h0r=Cs(),Wq=B(),g0r=Yt(),y0r=Q();function q0r(r){if(Wq(r)||r<=0)return m0r(NaN);return e;function e(t){var i,a;return Wq(t)||t<0||t>1?NaN:(i=t>.5?1-t:t,a=h0r(r/2,.5,2*i,1-2*i),g0r(t-.5)*y0r(r*a[1]/a[0]))}}Yq.exports=q0r});var js=u((lIr,Zq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var w0r=N(),Qq=Dq(),d0r=Kq();w0r(Qq,"factory",d0r);Zq.exports=Qq});var Xq=u((cIr,Jq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function b0r(r,e){return e>0?0:(1-r)*e}Jq.exports=b0r});var Me=u((pIr,$q)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _0r=Xq();$q.exports=_0r});var rw=u((mIr,xq)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zq="function";function E0r(r){return typeof r.get===zq&&typeof r.set===zq}xq.exports=E0r});var Gi=u((hIr,ew)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var T0r=rw();ew.exports=T0r});var aw=u((gIr,iw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tw={float64:A0r,float32:O0r,int32:I0r,int16:S0r,int8:N0r,uint32:L0r,uint16:F0r,uint8:P0r,uint8c:R0r,generic:V0r,default:M0r};function A0r(r,e){return r[e]}function O0r(r,e){return r[e]}function I0r(r,e){return r[e]}function S0r(r,e){return r[e]}function N0r(r,e){return r[e]}function L0r(r,e){return r[e]}function F0r(r,e){return r[e]}function P0r(r,e){return r[e]}function R0r(r,e){return r[e]}function V0r(r,e){return r[e]}function M0r(r,e){return r[e]}function C0r(r){var e=tw[r];return typeof e=="function"?e:tw.default}iw.exports=C0r});var _t=u((yIr,nw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var j0r=aw();nw.exports=j0r});var ow=u((qIr,sw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uw={float64:B0r,float32:k0r,int32:G0r,int16:H0r,int8:U0r,uint32:D0r,uint16:W0r,uint8:Y0r,uint8c:K0r,generic:Q0r,default:Z0r};function B0r(r,e,t){r[e]=t}function k0r(r,e,t){r[e]=t}function G0r(r,e,t){r[e]=t}function H0r(r,e,t){r[e]=t}function U0r(r,e,t){r[e]=t}function D0r(r,e,t){r[e]=t}function W0r(r,e,t){r[e]=t}function Y0r(r,e,t){r[e]=t}function K0r(r,e,t){r[e]=t}function Q0r(r,e,t){r[e]=t}function Z0r(r,e,t){r[e]=t}function J0r(r){var e=uw[r];return typeof e=="function"?e:uw.default}sw.exports=J0r});var fw=u((wIr,vw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var X0r=ow();vw.exports=X0r});var pw=u((dIr,cw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lw={complex128:$0r,complex64:z0r,default:x0r};function $0r(r,e){return r.get(e)}function z0r(r,e){return r.get(e)}function x0r(r,e){return r.get(e)}function rur(r){var e=lw[r];return typeof e=="function"?e:lw.default}cw.exports=rur});var it=u((bIr,mw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eur=pw();mw.exports=eur});var yw=u((_Ir,gw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hw={complex128:tur,complex64:iur,default:aur};function tur(r,e,t){r.set(t,e)}function iur(r,e,t){r.set(t,e)}function aur(r,e,t){r.set(t,e)}function nur(r){var e=hw[r];return typeof e=="function"?e:hw.default}gw.exports=nur});var ww=u((EIr,qw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uur=yw();qw.exports=uur});var bw=u((TIr,dw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var sur=ur(),Bs;function our(r){return sur(r)==="[object Array]"}Array.isArray?Bs=Array.isArray:Bs=our;dw.exports=Bs});var Rr=u((AIr,_w)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vur=bw();_w.exports=vur});var Tw=u((OIr,Ew)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fur=Rr(),lur=S();function cur(r){if(typeof r!="function")throw new TypeError(lur("invalid argument. Must provide a function. Value: `%s`.",r));return e;function e(t){var i,a;if(!fur(t)||(i=t.length,i===0))return!1;for(a=0;a<i;a++)if(r(t[a])===!1)return!1;return!0}}Ew.exports=cur});var ks=u((IIr,Aw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pur=Tw();Aw.exports=pur});var Iw=u((SIr,Ow)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function mur(r){return r!==null&&typeof r=="object"}Ow.exports=mur});var dn=u((NIr,Sw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hur=N(),gur=ks(),Gs=Iw(),yur=gur(Gs);hur(Gs,"isObjectLikeArray",yur);Sw.exports=Gs});var Lw=u((LIr,Nw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qur=dn();function wur(r){return qur(r)&&(r._isBuffer||r.constructor&&typeof r.constructor.isBuffer=="function"&&r.constructor.isBuffer(r))}Nw.exports=wur});var Hs=u((FIr,Fw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dur=Lw();Fw.exports=dur});var Us=u((PIr,Pw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function bur(){return/^\s*function\s*([^(]*)/i}Pw.exports=bur});var Vw=u((RIr,Rw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _ur=Us(),Eur=_ur();Rw.exports=Eur});var jw=u((VIr,Cw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Tur=N(),Mw=Us(),Aur=Vw();Tur(Mw,"REGEXP",Aur);Cw.exports=Mw});var kw=u((MIr,Bw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Our=ur(),Iur=jw().REGEXP,Sur=Hs();function Nur(r){var e,t,i;if(t=Our(r).slice(8,-1),(t==="Object"||t==="Error")&&r.constructor){if(i=r.constructor,typeof i.name=="string")return i.name;if(e=Iur.exec(i.toString()),e)return e[1]}return Sur(r)?"Buffer":t}Bw.exports=Nur});var bn=u((CIr,Gw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Lur=kw();Gw.exports=Lur});var Uw=u((jIr,Hw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Fur={Float32Array:"float32",Float64Array:"float64",Array:"generic",Int16Array:"int16",Int32Array:"int32",Int8Array:"int8",Uint16Array:"uint16",Uint32Array:"uint32",Uint8Array:"uint8",Uint8ClampedArray:"uint8c",Complex64Array:"complex64",Complex128Array:"complex128",BooleanArray:"bool"};Hw.exports=Fur});var Ww=u((BIr,Dw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pur=ur(),Rur=typeof Float32Array=="function";function Vur(r){return Rur&&r instanceof Float32Array||Pur(r)==="[object Float32Array]"}Dw.exports=Vur});var Kw=u((kIr,Yw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mur=Ww();Yw.exports=Mur});var Zw=u((GIr,Qw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cur=typeof Float32Array=="function"?Float32Array:null;Qw.exports=Cur});var $w=u((HIr,Xw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jur=Kw(),Bur=X(),Jw=Zw();function kur(){var r,e;if(typeof Jw!="function")return!1;try{e=new Jw([1,3.14,-3.14,5e40]),r=jur(e)&&e[0]===1&&e[1]===3.140000104904175&&e[2]===-3.140000104904175&&e[3]===Bur}catch{r=!1}return r}Xw.exports=kur});var xw=u((UIr,zw)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Gur=$w();zw.exports=Gur});var ed=u((DIr,rd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hur=typeof Float32Array=="function"?Float32Array:void 0;rd.exports=Hur});var id=u((WIr,td)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Uur(){throw new Error("not implemented")}td.exports=Uur});var Hi=u((YIr,ad)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dur=xw(),Wur=ed(),Yur=id(),Ds;Dur()?Ds=Wur:Ds=Yur;ad.exports=Ds});var ud=u((KIr,nd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kur=ur(),Qur=typeof Int32Array=="function";function Zur(r){return Qur&&r instanceof Int32Array||Kur(r)==="[object Int32Array]"}nd.exports=Zur});var od=u((QIr,sd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jur=ud();sd.exports=Jur});var fd=u((ZIr,vd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xur=-2147483648;vd.exports=Xur});var cd=u((JIr,ld)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $ur=typeof Int32Array=="function"?Int32Array:null;ld.exports=$ur});var hd=u((XIr,md)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zur=od(),xur=Ra(),rsr=fd(),pd=cd();function esr(){var r,e;if(typeof pd!="function")return!1;try{e=new pd([1,3.14,-3.14,xur+1]),r=zur(e)&&e[0]===1&&e[1]===3&&e[2]===-3&&e[3]===rsr}catch{r=!1}return r}md.exports=esr});var yd=u(($Ir,gd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tsr=hd();gd.exports=tsr});var wd=u((zIr,qd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var isr=typeof Int32Array=="function"?Int32Array:void 0;qd.exports=isr});var bd=u((xIr,dd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function asr(){throw new Error("not implemented")}dd.exports=asr});var Ed=u((rSr,_d)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nsr=yd(),usr=wd(),ssr=bd(),Ws;nsr()?Ws=usr:Ws=ssr;_d.exports=Ws});var Ad=u((eSr,Td)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var osr=ur(),vsr=typeof Int16Array=="function";function fsr(r){return vsr&&r instanceof Int16Array||osr(r)==="[object Int16Array]"}Td.exports=fsr});var Id=u((tSr,Od)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lsr=Ad();Od.exports=lsr});var Nd=u((iSr,Sd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var csr=32767;Sd.exports=csr});var Fd=u((aSr,Ld)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var psr=-32768;Ld.exports=psr});var Rd=u((nSr,Pd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var msr=typeof Int16Array=="function"?Int16Array:null;Pd.exports=msr});var Cd=u((uSr,Md)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hsr=Id(),gsr=Nd(),ysr=Fd(),Vd=Rd();function qsr(){var r,e;if(typeof Vd!="function")return!1;try{e=new Vd([1,3.14,-3.14,gsr+1]),r=hsr(e)&&e[0]===1&&e[1]===3&&e[2]===-3&&e[3]===ysr}catch{r=!1}return r}Md.exports=qsr});var Bd=u((sSr,jd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wsr=Cd();jd.exports=wsr});var Gd=u((oSr,kd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dsr=typeof Int16Array=="function"?Int16Array:void 0;kd.exports=dsr});var Ud=u((vSr,Hd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function bsr(){throw new Error("not implemented")}Hd.exports=bsr});var Wd=u((fSr,Dd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _sr=Bd(),Esr=Gd(),Tsr=Ud(),Ys;_sr()?Ys=Esr:Ys=Tsr;Dd.exports=Ys});var Kd=u((lSr,Yd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Asr=ur(),Osr=typeof Uint8ClampedArray=="function";function Isr(r){return Osr&&r instanceof Uint8ClampedArray||Asr(r)==="[object Uint8ClampedArray]"}Yd.exports=Isr});var Zd=u((cSr,Qd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ssr=Kd();Qd.exports=Ssr});var Xd=u((pSr,Jd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Nsr=typeof Uint8ClampedArray=="function"?Uint8ClampedArray:null;Jd.exports=Nsr});var xd=u((mSr,zd)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Lsr=Zd(),$d=Xd();function Fsr(){var r,e;if(typeof $d!="function")return!1;try{e=new $d([-1,0,1,3.14,4.99,255,256]),r=Lsr(e)&&e[0]===0&&e[1]===0&&e[2]===1&&e[3]===3&&e[4]===5&&e[5]===255&&e[6]===255}catch{r=!1}return r}zd.exports=Fsr});var eb=u((hSr,rb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Psr=xd();rb.exports=Psr});var ib=u((gSr,tb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Rsr=typeof Uint8ClampedArray=="function"?Uint8ClampedArray:void 0;tb.exports=Rsr});var nb=u((ySr,ab)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Vsr(){throw new Error("not implemented")}ab.exports=Vsr});var sb=u((qSr,ub)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Msr=eb(),Csr=ib(),jsr=nb(),Ks;Msr()?Ks=Csr:Ks=jsr;ub.exports=Ks});var vb=u((wSr,ob)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Bsr=ur(),ksr=typeof Int8Array=="function";function Gsr(r){return ksr&&r instanceof Int8Array||Bsr(r)==="[object Int8Array]"}ob.exports=Gsr});var lb=u((dSr,fb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hsr=vb();fb.exports=Hsr});var pb=u((bSr,cb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Usr=127;cb.exports=Usr});var hb=u((_Sr,mb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dsr=-128;mb.exports=Dsr});var yb=u((ESr,gb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Wsr=typeof Int8Array=="function"?Int8Array:null;gb.exports=Wsr});var db=u((TSr,wb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ysr=lb(),Ksr=pb(),Qsr=hb(),qb=yb();function Zsr(){var r,e;if(typeof qb!="function")return!1;try{e=new qb([1,3.14,-3.14,Ksr+1]),r=Ysr(e)&&e[0]===1&&e[1]===3&&e[2]===-3&&e[3]===Qsr}catch{r=!1}return r}wb.exports=Zsr});var _b=u((ASr,bb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jsr=db();bb.exports=Jsr});var Tb=u((OSr,Eb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xsr=typeof Int8Array=="function"?Int8Array:void 0;Eb.exports=Xsr});var Ob=u((ISr,Ab)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function $sr(){throw new Error("not implemented")}Ab.exports=$sr});var Sb=u((SSr,Ib)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zsr=_b(),xsr=Tb(),ror=Ob(),Qs;zsr()?Qs=xsr:Qs=ror;Ib.exports=Qs});var Lb=u((NSr,Nb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eor=Ir(),tor=E0();function ior(r){return typeof r=="object"&&r!==null&&typeof r.length=="number"&&eor(r.length)&&r.length>=0&&r.length<=tor}Nb.exports=ior});var Ce=u((LSr,Fb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var aor=Lb();Fb.exports=aor});var Rb=u((FSr,Pb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nor=Ir(),uor=H0();function sor(r){return typeof r=="object"&&r!==null&&typeof r.length=="number"&&nor(r.length)&&r.length>=0&&r.length<=uor}Pb.exports=sor});var Sr=u((PSr,Vb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oor=Rb();Vb.exports=oor});var Cb=u((RSr,Mb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vor=ur(),lor=typeof ArrayBuffer=="function";function cor(r){return lor&&r instanceof ArrayBuffer||vor(r)==="[object ArrayBuffer]"}Mb.exports=cor});var Ui=u((VSr,jb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var por=Cb();jb.exports=por});var kb=u((MSr,Bb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mor=Rr();function hor(r){return typeof r=="object"&&r!==null&&!mor(r)}Bb.exports=hor});var Xt=u((CSr,Gb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gor=kb();Gb.exports=gor});var Zs=u((jSr,Hb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function yor(r){return typeof r=="string"}Hb.exports=yor});var Db=u((BSr,Ub)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qor=String.prototype.valueOf;Ub.exports=qor});var Yb=u((kSr,Wb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wor=Db();function dor(r){try{return wor.call(r),!0}catch{return!1}}Wb.exports=dor});var Js=u((GSr,Kb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bor=Ft(),_or=ur(),Eor=Yb(),Tor=bor();function Aor(r){return typeof r=="object"?r instanceof String?!0:Tor?Eor(r):_or(r)==="[object String]":!1}Kb.exports=Aor});var Zb=u((HSr,Qb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Oor=Zs(),Ior=Js();function Sor(r){return Oor(r)||Ior(r)}Qb.exports=Sor});var hr=u((USr,Xb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jb=N(),Xs=Zb(),Nor=Zs(),Lor=Js();Jb(Xs,"isPrimitive",Nor);Jb(Xs,"isObject",Lor);Xb.exports=Xs});var _n=u((DSr,zb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $b=N(),$s=ks(),zs=hr(),For=$s(zs.isPrimitive),Por=$s(zs.isObject),xs=$s(zs);$b(xs,"primitives",For);$b(xs,"objects",Por);zb.exports=xs});var r_=u((WSr,xb)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ror=/./;xb.exports=Ror});var ro=u((YSr,e_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Vor(r){return typeof r=="boolean"}e_.exports=Vor});var i_=u((KSr,t_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mor=Boolean;t_.exports=Mor});var Et=u((QSr,a_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cor=i_();a_.exports=Cor});var u_=u((ZSr,n_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jor=Boolean.prototype.toString;n_.exports=jor});var o_=u((JSr,s_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Bor=u_();function kor(r){try{return Bor.call(r),!0}catch{return!1}}s_.exports=kor});var eo=u((XSr,v_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Gor=Ft(),Hor=ur(),Uor=Et(),Dor=o_(),Wor=Gor();function Yor(r){return typeof r=="object"?r instanceof Uor?!0:Wor?Dor(r):Hor(r)==="[object Boolean]":!1}v_.exports=Yor});var l_=u(($Sr,f_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kor=ro(),Qor=eo();function Zor(r){return Kor(r)||Qor(r)}f_.exports=Zor});var Vr=u((zSr,p_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var c_=N(),to=l_(),Jor=ro(),Xor=eo();c_(to,"isPrimitive",Jor);c_(to,"isObject",Xor);p_.exports=to});var h_=u((xSr,m_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function $or(){return new Function("return this;")()}m_.exports=$or});var y_=u((rNr,g_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zor=typeof self=="object"?self:null;g_.exports=zor});var w_=u((eNr,q_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xor=typeof window=="object"?window:null;q_.exports=xor});var b_=u((tNr,d_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rvr=typeof globalThis=="object"?globalThis:null;d_.exports=rvr});var io=u((iNr,A_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var evr=Vr().isPrimitive,tvr=S(),ivr=h_(),__=y_(),E_=w_(),T_=b_();function avr(r){if(arguments.length){if(!evr(r))throw new TypeError(tvr("invalid argument. Must provide a boolean. Value: `%s`.",r));if(r)return ivr()}if(T_)return T_;if(__)return __;if(E_)return E_;throw new Error("unexpected error. Unable to resolve global object.")}A_.exports=avr});var S_=u((aNr,I_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nvr=io(),O_=nvr(),uvr=O_.document&&O_.document.childNodes;I_.exports=uvr});var L_=u((nNr,N_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var svr=Int8Array;N_.exports=svr});var P_=u((uNr,F_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ovr=r_(),vvr=S_(),fvr=L_();function lvr(){return typeof ovr=="function"||typeof fvr=="object"||typeof vvr=="function"}F_.exports=lvr});var V_=u((sNr,R_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cvr=bn();function pvr(r){var e;return r===null?"null":(e=typeof r,e==="object"?cvr(r).toLowerCase():e)}R_.exports=pvr});var C_=u((oNr,M_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mvr=bn();function hvr(r){return mvr(r).toLowerCase()}M_.exports=hvr});var ao=u((vNr,j_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gvr=P_(),yvr=V_(),qvr=C_(),wvr=gvr()?qvr:yvr;j_.exports=wvr});var k_=u((fNr,B_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dvr=ao();function bvr(r){return dvr(r)==="function"}B_.exports=bvr});var Hr=u((lNr,G_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _vr=k_();G_.exports=_vr});var U_=u((cNr,H_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Evr(){var r=""+this.re;return this.im<0?r+=" - "+-this.im:r+=" + "+this.im,r+="i",r}H_.exports=Evr});var W_=u((pNr,D_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Tvr(){var r={};return r.type="Complex128",r.re=this.re,r.im=this.im,r}D_.exports=Tvr});var J_=u((mNr,Z_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Y_=Er().isPrimitive,K_=ct(),$t=N(),Q_=S(),Avr=U_(),Ovr=W_();function at(r,e){if(!(this instanceof at))throw new TypeError("invalid invocation. Constructor must be called with the `new` keyword.");if(!Y_(r))throw new TypeError(Q_("invalid argument. Real component must be a number. Value: `%s`.",r));if(!Y_(e))throw new TypeError(Q_("invalid argument. Imaginary component must be a number. Value: `%s`.",e));return K_(this,"re",r),K_(this,"im",e),this}$t(at,"name","Complex128");$t(at,"BYTES_PER_ELEMENT",8);$t(at.prototype,"BYTES_PER_ELEMENT",8);$t(at.prototype,"byteLength",16);$t(at.prototype,"toString",Avr);$t(at.prototype,"toJSON",Ovr);Z_.exports=at});var no=u((hNr,X_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ivr=J_();X_.exports=Ivr});var z_=u((gNr,$_)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Svr=typeof Math.fround=="function"?Math.fround:null;$_.exports=Svr});var eE=u((yNr,rE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Nvr=Hi(),x_=new Nvr(1);function Lvr(r){return x_[0]=r,x_[0]}rE.exports=Lvr});var aE=u((qNr,iE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tE=z_(),Fvr=eE(),uo;typeof tE=="function"?uo=tE:uo=Fvr;iE.exports=uo});var uE=u((wNr,nE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Pvr(){var r=""+this.re;return this.im<0?r+=" - "+-this.im:r+=" + "+this.im,r+="i",r}nE.exports=Pvr});var oE=u((dNr,sE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Rvr(){var r={};return r.type="Complex64",r.re=this.re,r.im=this.im,r}sE.exports=Rvr});var mE=u((bNr,pE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vE=Er().isPrimitive,fE=ct(),zt=N(),lE=aE(),cE=S(),Vvr=uE(),Mvr=oE();function nt(r,e){if(!(this instanceof nt))throw new TypeError("invalid invocation. Constructor must be called with the `new` keyword.");if(!vE(r))throw new TypeError(cE("invalid argument. Real component must be a number. Value: `%s`.",r));if(!vE(e))throw new TypeError(cE("invalid argument. Imaginary component must be a number. Value: `%s`.",e));return fE(this,"re",lE(r)),fE(this,"im",lE(e)),this}zt(nt,"name","Complex64");zt(nt,"BYTES_PER_ELEMENT",4);zt(nt.prototype,"BYTES_PER_ELEMENT",4);zt(nt.prototype,"byteLength",8);zt(nt.prototype,"toString",Vvr);zt(nt.prototype,"toJSON",Mvr);pE.exports=nt});var so=u((_Nr,hE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cvr=mE();hE.exports=Cvr});var yE=u((ENr,gE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jvr=no(),Bvr=so();function kvr(r){return r instanceof jvr||r instanceof Bvr?!0:typeof r=="object"&&r!==null&&typeof r.re=="number"&&typeof r.im=="number"}gE.exports=kvr});var ee=u((TNr,qE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Gvr=yE();qE.exports=Gvr});var dE=u((ANr,wE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hvr=8;function Uvr(r){return typeof r=="object"&&r!==null&&r.constructor.name==="Complex64Array"&&r.BYTES_PER_ELEMENT===Hvr}wE.exports=Uvr});var En=u((ONr,bE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dvr=dE();bE.exports=Dvr});var EE=u((INr,_E)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Wvr=16;function Yvr(r){return typeof r=="object"&&r!==null&&r.constructor.name==="Complex128Array"&&r.BYTES_PER_ELEMENT===Wvr}_E.exports=Yvr});var Tn=u((SNr,TE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kvr=EE();TE.exports=Kvr});var OE=u((NNr,AE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qvr=er(),An=O0();function Zvr(){return typeof An=="function"&&typeof An("foo")=="symbol"&&Qvr(An,"iterator")&&typeof An.iterator=="symbol"}AE.exports=Zvr});var Di=u((LNr,IE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jvr=OE();IE.exports=Jvr});var NE=u((FNr,SE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xvr=Di(),$vr=Xvr()?Symbol.iterator:null;SE.exports=$vr});var On=u((PNr,LE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zvr=NE();LE.exports=zvr});var PE=u((RNr,FE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xvr=oi();function rfr(r,e,t){xvr(r,e,{configurable:!1,enumerable:!1,get:t})}FE.exports=rfr});var Tt=u((VNr,RE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var efr=PE();RE.exports=efr});var ME=u((MNr,VE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function tfr(r){return r.re}VE.exports=tfr});var Wi=u((CNr,CE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ifr=ME();CE.exports=ifr});var BE=u((jNr,jE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function afr(r){return r.im}jE.exports=afr});var Yi=u((BNr,kE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nfr=BE();kE.exports=nfr});var HE=u((kNr,GE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ufr=Hi();function sfr(r,e){return new ufr(r.buffer,r.byteOffset+r.BYTES_PER_ELEMENT*e,2*(r.length-e))}GE.exports=sfr});var In=u((GNr,UE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ofr=HE();UE.exports=ofr});var WE=u((HNr,DE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vfr=Tr();function ffr(r,e){return new vfr(r.buffer,r.byteOffset+r.BYTES_PER_ELEMENT*e,2*(r.length-e))}DE.exports=ffr});var Sn=u((UNr,YE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lfr=WE();YE.exports=lfr});var QE=u((DNr,KE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cfr=Ce(),pfr=ee(),mfr=Wi(),hfr=Yi(),gfr=S();function yfr(r){var e,t,i;for(e=[];t=r.next(),!t.done;)if(i=t.value,cfr(i)&&i.length>=2)e.push(i[0],i[1]);else if(pfr(i))e.push(mfr(i),hfr(i));else return new TypeError(gfr("invalid argument. An iterator must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",i));return e}KE.exports=yfr});var JE=u((WNr,ZE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qfr=Ce(),wfr=ee(),dfr=Wi(),bfr=Yi(),_fr=S();function Efr(r,e,t){var i,a,n,s;for(i=[],s=-1;a=r.next(),!a.done;)if(s+=1,n=e.call(t,a.value,s),qfr(n)&&n.length>=2)i.push(n[0],n[1]);else if(wfr(n))i.push(dfr(n),bfr(n));else return new TypeError(_fr("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",n));return i}ZE.exports=Efr});var $E=u((YNr,XE)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Tfr=ee(),Afr=Wi(),Ofr=Yi();function Ifr(r,e){var t,i,a,n;for(t=e.length,n=0,a=0;a<t;a++){if(i=e[a],!Tfr(i))return null;r[n]=Afr(i),r[n+1]=Ofr(i),n+=2}return r}XE.exports=Ifr});var aT=u((KNr,iT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ki=ke().isPrimitive,oo=Ce(),vo=Sr(),zE=Ui(),fo=Xt(),Sfr=Rr(),Nfr=_n().primitives,xE=hr().isPrimitive,lr=Hr(),Dr=ee(),Nn=Aa(),Nr=Ir(),Lfr=En(),Ffr=Tn(),Pfr=Di(),qe=On(),R=N(),Ln=Tt(),Ur=Hi(),Rfr=so(),O=S(),te=Wi(),ie=Yi(),Vfr=vr(),Mfr=In(),Cfr=Sn(),jfr=_t(),Bfr=it(),rT=QE(),kfr=JE(),Gfr=$E(),Mr=Ur.BYTES_PER_ELEMENT*2,eT=Pfr();function U(r){return r instanceof L||typeof r=="object"&&r!==null&&(r.constructor.name==="Complex64Array"||r.constructor.name==="Complex128Array")&&typeof r._length=="number"&&typeof r._buffer=="object"}function tT(r){return r===L||r.name==="Complex128Array"}function nr(r,e){return e*=2,new Rfr(r[e],r[e+1])}function L(){var r,e,t,i;if(e=arguments.length,!(this instanceof L))return e===0?new L:e===1?new L(arguments[0]):e===2?new L(arguments[0],arguments[1]):new L(arguments[0],arguments[1],arguments[2]);if(e===0)t=new Ur(0);else if(e===1)if(Ki(arguments[0]))t=new Ur(arguments[0]*2);else if(vo(arguments[0]))if(t=arguments[0],i=t.length,i&&Sfr(t)&&Dr(t[0])){if(t=Gfr(new Ur(i*2),t),t===null){if(!Nn(i))throw new RangeError(O("invalid argument. Array-like object arguments must have a length which is a multiple of two. Length: `%u`.",i));t=new Ur(arguments[0])}}else{if(Lfr(t))t=Mfr(t,0);else if(Ffr(t))t=Cfr(t,0);else if(!Nn(i))throw new RangeError(O("invalid argument. Array-like object and typed array arguments must have a length which is a multiple of two. Length: `%u`.",i));t=new Ur(t)}else if(zE(arguments[0])){if(t=arguments[0],!Nr(t.byteLength/Mr))throw new RangeError(O("invalid argument. ArrayBuffer byte length must be a multiple of %u. Byte length: `%u`.",Mr,t.byteLength));t=new Ur(t)}else if(fo(arguments[0])){if(t=arguments[0],eT===!1)throw new TypeError(O("invalid argument. Environment lacks Symbol.iterator support. Must provide a length, ArrayBuffer, typed array, or array-like object. Value: `%s`.",t));if(!lr(t[qe]))throw new TypeError(O("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",t));if(t=t[qe](),!lr(t.next))throw new TypeError(O("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",t));if(t=rT(t),t instanceof Error)throw t;t=new Ur(t)}else throw new TypeError(O("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",arguments[0]));else{if(t=arguments[0],!zE(t))throw new TypeError(O("invalid argument. First argument must be an ArrayBuffer. Value: `%s`.",t));if(r=arguments[1],!Ki(r))throw new TypeError(O("invalid argument. Byte offset must be a nonnegative integer. Value: `%s`.",r));if(!Nr(r/Mr))throw new RangeError(O("invalid argument. Byte offset must be a multiple of %u. Value: `%u`.",Mr,r));if(e===2){if(i=t.byteLength-r,!Nr(i/Mr))throw new RangeError(O("invalid arguments. ArrayBuffer view byte length must be a multiple of %u. View byte length: `%u`.",Mr,i));t=new Ur(t,r)}else{if(i=arguments[2],!Ki(i))throw new TypeError(O("invalid argument. Length must be a nonnegative integer. Value: `%s`.",i));if(i*Mr>t.byteLength-r)throw new RangeError(O("invalid arguments. ArrayBuffer has insufficient capacity. Either decrease the array length or provide a bigger buffer. Minimum capacity: `%u`.",i*Mr));t=new Ur(t,r,i*2)}}return R(this,"_buffer",t),R(this,"_length",t.length/2),this}R(L,"BYTES_PER_ELEMENT",Mr);R(L,"name","Complex64Array");R(L,"from",function(e){var t,i,a,n,s,o,v,l,f,c,p,m;if(!lr(this))throw new TypeError("invalid invocation. `this` context must be a constructor.");if(!tT(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(i=arguments.length,i>1){if(a=arguments[1],!lr(a))throw new TypeError(O("invalid argument. Second argument must be a function. Value: `%s`.",a));i>2&&(t=arguments[2])}if(U(e)){if(l=e.length,a){for(n=new this(l),s=n._buffer,m=0,p=0;p<l;p++){if(c=a.call(t,e.get(p),p),Dr(c))s[m]=te(c),s[m+1]=ie(c);else if(oo(c)&&c.length>=2)s[m]=c[0],s[m+1]=c[1];else throw new TypeError(O("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",c));m+=2}return n}return new this(e)}if(vo(e)){if(a){for(l=e.length,e.get&&e.set?v=Bfr("default"):v=jfr("default"),p=0;p<l;p++)if(!Dr(v(e,p))){f=!0;break}if(f){if(!Nn(l))throw new RangeError(O("invalid argument. First argument must have a length which is a multiple of %u. Length: `%u`.",2,l));for(n=new this(l/2),s=n._buffer,p=0;p<l;p++)s[p]=a.call(t,v(e,p),p);return n}for(n=new this(l),s=n._buffer,m=0,p=0;p<l;p++){if(c=a.call(t,v(e,p),p),Dr(c))s[m]=te(c),s[m+1]=ie(c);else if(oo(c)&&c.length>=2)s[m]=c[0],s[m+1]=c[1];else throw new TypeError(O("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",c));m+=2}return n}return new this(e)}if(fo(e)&&eT&&lr(e[qe])){if(s=e[qe](),!lr(s.next))throw new TypeError(O("invalid argument. First argument must be an array-like object or an iterable. Value: `%s`.",e));if(a?o=kfr(s,a,t):o=rT(s),o instanceof Error)throw o;for(l=o.length/2,n=new this(l),s=n._buffer,p=0;p<l;p++)s[p]=o[p];return n}throw new TypeError(O("invalid argument. First argument must be an array-like object or an iterable. Value: `%s`.",e))});R(L,"of",function(){var e,t;if(!lr(this))throw new TypeError("invalid invocation. `this` context must be a constructor.");if(!tT(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);return new this(e)});R(L.prototype,"at",function(e){if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Nr(e))throw new TypeError(O("invalid argument. Must provide an integer. Value: `%s`.",e));if(e<0&&(e+=this._length),!(e<0||e>=this._length))return nr(this._buffer,e)});Ln(L.prototype,"buffer",function(){return this._buffer.buffer});Ln(L.prototype,"byteLength",function(){return this._buffer.byteLength});Ln(L.prototype,"byteOffset",function(){return this._buffer.byteOffset});R(L.prototype,"BYTES_PER_ELEMENT",L.BYTES_PER_ELEMENT);R(L.prototype,"copyWithin",function(e,t){if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return arguments.length===2?this._buffer.copyWithin(e*2,t*2):this._buffer.copyWithin(e*2,t*2,arguments[2]*2),this});R(L.prototype,"entries",function(){var e,t,i,a,n,s;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return e=this,a=this._buffer,i=this._length,s=-1,t={},R(t,"next",o),R(t,"return",v),qe&&R(t,qe,l),t;function o(){return s+=1,n||s>=i?{done:!0}:{value:[s,nr(a,s)],done:!1}}function v(f){return n=!0,arguments.length?{value:f,done:!0}:{done:!0}}function l(){return e.entries()}});R(L.prototype,"every",function(e,t){var i,a;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(!e.call(t,nr(i,a),a,this))return!1;return!0});R(L.prototype,"fill",function(e,t,i){var a,n,s,o,v,l;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Dr(e))throw new TypeError(O("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(a=this._buffer,n=this._length,arguments.length>1){if(!Nr(t))throw new TypeError(O("invalid argument. Second argument must be an integer. Value: `%s`.",t));if(t<0&&(t+=n,t<0&&(t=0)),arguments.length>2){if(!Nr(i))throw new TypeError(O("invalid argument. Third argument must be an integer. Value: `%s`.",i));i<0&&(i+=n,i<0&&(i=0)),i>n&&(i=n)}else i=n}else t=0,i=n;for(o=te(e),v=ie(e),l=t;l<i;l++)s=2*l,a[s]=o,a[s+1]=v;return this});R(L.prototype,"filter",function(e,t){var i,a,n,s;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=[],n=0;n<this._length;n++)s=nr(i,n),e.call(t,s,n,this)&&a.push(s);return new this.constructor(a)});R(L.prototype,"find",function(e,t){var i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(n=nr(i,a),e.call(t,n,a,this))return n});R(L.prototype,"findIndex",function(e,t){var i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(n=nr(i,a),e.call(t,n,a,this))return a;return-1});R(L.prototype,"findLast",function(e,t){var i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length-1;a>=0;a--)if(n=nr(i,a),e.call(t,n,a,this))return n});R(L.prototype,"findLastIndex",function(e,t){var i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length-1;a>=0;a--)if(n=nr(i,a),e.call(t,n,a,this))return a;return-1});R(L.prototype,"forEach",function(e,t){var i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)n=nr(i,a),e.call(t,n,a,this)});R(L.prototype,"get",function(e){if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Ki(e))throw new TypeError(O("invalid argument. Must provide a nonnegative integer. Value: `%s`.",e));if(!(e>=this._length))return nr(this._buffer,e)});R(L.prototype,"includes",function(e,t){var i,a,n,s,o;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Dr(e))throw new TypeError(O("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(arguments.length>1){if(!Nr(t))throw new TypeError(O("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0&&(t+=this._length,t<0&&(t=0))}else t=0;for(n=te(e),s=ie(e),i=this._buffer,o=t;o<this._length;o++)if(a=2*o,n===i[a]&&s===i[a+1])return!0;return!1});R(L.prototype,"indexOf",function(e,t){var i,a,n,s,o;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Dr(e))throw new TypeError(O("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(arguments.length>1){if(!Nr(t))throw new TypeError(O("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0&&(t+=this._length,t<0&&(t=0))}else t=0;for(n=te(e),s=ie(e),i=this._buffer,o=t;o<this._length;o++)if(a=2*o,n===i[a]&&s===i[a+1])return o;return-1});R(L.prototype,"join",function(e){var t,i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(arguments.length===0)a=",";else if(xE(e))a=e;else throw new TypeError(O("invalid argument. First argument must be a string. Value: `%s`.",e));for(t=[],i=this._buffer,n=0;n<this._length;n++)t.push(nr(i,n).toString());return t.join(a)});R(L.prototype,"keys",function(){var e,t,i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return e=this,i=this._length,n=-1,t={},R(t,"next",s),R(t,"return",o),qe&&R(t,qe,v),t;function s(){return n+=1,a||n>=i?{done:!0}:{value:n,done:!1}}function o(l){return a=!0,arguments.length?{value:l,done:!0}:{done:!0}}function v(){return e.keys()}});R(L.prototype,"lastIndexOf",function(e,t){var i,a,n,s,o;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Dr(e))throw new TypeError(O("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(arguments.length>1){if(!Nr(t))throw new TypeError(O("invalid argument. Second argument must be an integer. Value: `%s`.",t));t>=this._length?t=this._length-1:t<0&&(t+=this._length)}else t=this._length-1;for(n=te(e),s=ie(e),i=this._buffer,o=t;o>=0;o--)if(a=2*o,n===i[a]&&s===i[a+1])return o;return-1});Ln(L.prototype,"length",function(){return this._length});R(L.prototype,"map",function(e,t){var i,a,n,s,o;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(a=this._buffer,n=new this.constructor(this._length),i=n._buffer,s=0;s<this._length;s++)if(o=e.call(t,nr(a,s),s,this),Dr(o))i[2*s]=te(o),i[2*s+1]=ie(o);else if(oo(o)&&o.length===2)i[2*s]=o[0],i[2*s+1]=o[1];else throw new TypeError(O("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",o));return n});R(L.prototype,"reduce",function(e,t){var i,a,n,s,o;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));if(i=this._buffer,n=this._length,arguments.length>1)a=t,o=0;else{if(n===0)throw new Error("invalid operation. If not provided an initial value, an array must contain at least one element.");a=nr(i,0),o=1}for(;o<n;o++)s=nr(i,o),a=e(a,s,o,this);return a});R(L.prototype,"reduceRight",function(e,t){var i,a,n,s,o;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));if(i=this._buffer,n=this._length,arguments.length>1)a=t,o=n-1;else{if(n===0)throw new Error("invalid operation. If not provided an initial value, an array must contain at least one element.");a=nr(i,n-1),o=n-2}for(;o>=0;o--)s=nr(i,o),a=e(a,s,o,this);return a});R(L.prototype,"reverse",function(){var e,t,i,a,n,s;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(i=this._length,e=this._buffer,a=Vfr(i/2),n=0;n<a;n++)s=i-n-1,t=e[2*n],e[2*n]=e[2*s],e[2*s]=t,t=e[2*n+1],e[2*n+1]=e[2*s+1],e[2*s+1]=t;return this});R(L.prototype,"set",function(e){var t,i,a,n,s,o,v,l,f;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(a=this._buffer,arguments.length>1){if(i=arguments[1],!Ki(i))throw new TypeError(O("invalid argument. Index argument must be a nonnegative integer. Value: `%s`.",i))}else i=0;if(Dr(e)){if(i>=this._length)throw new RangeError(O("invalid argument. Index argument is out-of-bounds. Value: `%u`.",i));i*=2,a[i]=te(e),a[i+1]=ie(e);return}if(U(e)){if(o=e._length,i+o>this._length)throw new RangeError("invalid arguments. Target array lacks sufficient storage to accommodate source values.");if(t=e._buffer,f=a.byteOffset+i*Mr,t.buffer===a.buffer&&t.byteOffset<f&&t.byteOffset+t.byteLength>f){for(n=new Ur(t.length),l=0;l<t.length;l++)n[l]=t[l];t=n}for(i*=2,f=0,l=0;l<o;l++)a[i]=t[f],a[i+1]=t[f+1],i+=2,f+=2;return}if(vo(e)){for(o=e.length,l=0;l<o;l++)if(!Dr(e[l])){s=!0;break}if(s){if(!Nn(o))throw new RangeError(O("invalid argument. Array-like object arguments must have a length which is a multiple of two. Length: `%u`.",o));if(i+o/2>this._length)throw new RangeError("invalid arguments. Target array lacks sufficient storage to accommodate source values.");if(t=e,f=a.byteOffset+i*Mr,t.buffer===a.buffer&&t.byteOffset<f&&t.byteOffset+t.byteLength>f){for(n=new Ur(o),l=0;l<o;l++)n[l]=t[l];t=n}for(i*=2,o/=2,f=0,l=0;l<o;l++)a[i]=t[f],a[i+1]=t[f+1],i+=2,f+=2;return}if(i+o>this._length)throw new RangeError("invalid arguments. Target array lacks sufficient storage to accommodate source values.");for(i*=2,l=0;l<o;l++)v=e[l],a[i]=te(v),a[i+1]=ie(v),i+=2;return}throw new TypeError(O("invalid argument. First argument must be either a complex number, an array-like object, or a complex number array. Value: `%s`.",e))});R(L.prototype,"slice",function(e,t){var i,a,n,s,o,v,l;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(o=this._buffer,v=this._length,arguments.length===0)e=0,t=v;else{if(!Nr(e))throw new TypeError(O("invalid argument. First argument must be an integer. Value: `%s`.",e));if(e<0&&(e+=v,e<0&&(e=0)),arguments.length===1)t=v;else{if(!Nr(t))throw new TypeError(O("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0?(t+=v,t<0&&(t=0)):t>v&&(t=v)}}for(e<t?i=t-e:i=0,n=new this.constructor(i),a=n._buffer,l=0;l<i;l++)s=2*(l+e),a[2*l]=o[s],a[2*l+1]=o[s+1];return n});R(L.prototype,"some",function(e,t){var i,a;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(e.call(t,nr(i,a),a,this))return!0;return!1});R(L.prototype,"sort",function(e){var t,i,a,n,s;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length,t=[],n=0;n<a;n++)t.push(nr(i,n));for(t.sort(e),n=0;n<a;n++)s=2*n,i[s]=te(t[n]),i[s+1]=ie(t[n]);return this});R(L.prototype,"subarray",function(e,t){var i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(a=this._buffer,n=this._length,arguments.length===0)e=0,t=n;else{if(!Nr(e))throw new TypeError(O("invalid argument. First argument must be an integer. Value: `%s`.",e));if(e<0&&(e+=n,e<0&&(e=0)),arguments.length===1)t=n;else{if(!Nr(t))throw new TypeError(O("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0?(t+=n,t<0&&(t=0)):t>n&&(t=n)}}return e>=n?(n=0,i=a.byteLength):e>=t?(n=0,i=a.byteOffset+e*Mr):(n=t-e,i=a.byteOffset+e*Mr),new this.constructor(a.buffer,i,n<0?0:n)});R(L.prototype,"toLocaleString",function(e,t){var i,a,n,s,o;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(arguments.length===0)a=[];else if(xE(e)||Nfr(e))a=e;else throw new TypeError(O("invalid argument. First argument must be a string or an array of strings. Value: `%s`.",e));if(arguments.length<2)i={};else if(fo(t))i=t;else throw new TypeError(O("invalid argument. Options argument must be an object. Value: `%s`.",t));for(s=this._buffer,n=[],o=0;o<this._length;o++)n.push(nr(s,o).toLocaleString(a,i));return n.join(",")});R(L.prototype,"toReversed",function(){var e,t,i,a,n,s;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(i=this._length,t=new this.constructor(i),a=this._buffer,e=t._buffer,n=0;n<i;n++)s=i-n-1,e[2*n]=a[2*s],e[2*n+1]=a[2*s+1];return t});R(L.prototype,"toSorted",function(e){var t,i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!lr(e))throw new TypeError(O("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length,t=[],n=0;n<a;n++)t.push(nr(i,n));return t.sort(e),new L(t)});R(L.prototype,"toString",function(){var e,t,i;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(e=[],t=this._buffer,i=0;i<this._length;i++)e.push(nr(t,i).toString());return e.join(",")});R(L.prototype,"values",function(){var e,t,i,a,n,s;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return t=this,n=this._buffer,i=this._length,s=-1,e={},R(e,"next",o),R(e,"return",v),qe&&R(e,qe,l),e;function o(){return s+=1,a||s>=i?{done:!0}:{value:nr(n,s),done:!1}}function v(f){return a=!0,arguments.length?{value:f,done:!0}:{done:!0}}function l(){return t.values()}});R(L.prototype,"with",function(e,t){var i,a,n;if(!U(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Nr(e))throw new TypeError(O("invalid argument. First argument must be an integer. Value: `%s`.",e));if(n=this._length,e<0&&(e+=n),e<0||e>=n)throw new RangeError(O("invalid argument. Index argument is out-of-bounds. Value: `%s`.",e));if(!Dr(t))throw new TypeError(O("invalid argument. Second argument must be a complex number. Value: `%s`.",t));return a=new this.constructor(this._buffer),i=a._buffer,i[2*e]=te(t),i[2*e+1]=ie(t),a});iT.exports=L});var uT=u((QNr,nT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hfr=aT();nT.exports=Hfr});var oT=u((ZNr,sT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Ufr(r){return r.re}sT.exports=Ufr});var ut=u((JNr,vT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dfr=oT();vT.exports=Dfr});var lT=u((XNr,fT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Wfr(r){return r.im}fT.exports=Wfr});var st=u(($Nr,cT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Yfr=lT();cT.exports=Yfr});var mT=u((zNr,pT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kfr=Ce(),Qfr=ee(),Zfr=S(),Jfr=ut(),Xfr=st();function $fr(r){var e,t,i;for(e=[];t=r.next(),!t.done;)if(i=t.value,Kfr(i)&&i.length>=2)e.push(i[0],i[1]);else if(Qfr(i))e.push(Jfr(i),Xfr(i));else return new TypeError(Zfr("invalid argument. An iterator must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",i));return e}pT.exports=$fr});var gT=u((xNr,hT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zfr=Ce(),xfr=ee(),r1r=S(),e1r=ut(),t1r=st();function i1r(r,e,t){var i,a,n,s;for(i=[],s=-1;a=r.next(),!a.done;)if(s+=1,n=e.call(t,a.value,s),zfr(n)&&n.length>=2)i.push(n[0],n[1]);else if(xfr(n))i.push(e1r(n),t1r(n));else return new TypeError(r1r("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",n));return i}hT.exports=i1r});var qT=u((rLr,yT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var a1r=ee(),n1r=ut(),u1r=st();function s1r(r,e){var t,i,a,n;for(t=e.length,n=0,a=0;a<t;a++){if(i=e[a],!a1r(i))return null;r[n]=n1r(i),r[n+1]=u1r(i),n+=2}return r}yT.exports=s1r});var OT=u((eLr,AT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qi=ke().isPrimitive,lo=Ce(),co=Sr(),wT=Ui(),po=Xt(),o1r=Rr(),v1r=_n().primitives,dT=hr(),cr=Hr(),Yr=ee(),Fn=Aa(),Lr=Ir(),f1r=En(),l1r=Tn(),c1r=Di(),we=On(),V=N(),Pn=Tt(),Wr=Tr(),bT=no(),ae=ut(),ne=st(),p1r=vr(),m1r=In(),h1r=Sn(),g1r=_t(),y1r=it(),I=S(),_T=mT(),q1r=gT(),w1r=qT(),Cr=Wr.BYTES_PER_ELEMENT*2,ET=c1r();function D(r){return r instanceof F||typeof r=="object"&&r!==null&&(r.constructor.name==="Complex64Array"||r.constructor.name==="Complex128Array")&&typeof r._length=="number"&&typeof r._buffer=="object"}function TT(r){return r===F||r.name==="Complex64Array"}function sr(r,e){return e*=2,new bT(r[e],r[e+1])}function F(){var r,e,t,i;if(e=arguments.length,!(this instanceof F))return e===0?new F:e===1?new F(arguments[0]):e===2?new F(arguments[0],arguments[1]):new F(arguments[0],arguments[1],arguments[2]);if(e===0)t=new Wr(0);else if(e===1)if(Qi(arguments[0]))t=new Wr(arguments[0]*2);else if(co(arguments[0]))if(t=arguments[0],i=t.length,i&&o1r(t)&&Yr(t[0])){if(t=w1r(new Wr(i*2),t),t===null){if(!Fn(i))throw new RangeError(I("invalid argument. Array-like object arguments must have a length which is a multiple of two. Length: `%u`.",i));t=new Wr(arguments[0])}}else{if(f1r(t))t=m1r(t,0);else if(l1r(t))t=h1r(t,0);else if(!Fn(i))throw new RangeError(I("invalid argument. Array-like object and typed array arguments must have a length which is a multiple of two. Length: `%u`.",i));t=new Wr(t)}else if(wT(arguments[0])){if(t=arguments[0],!Lr(t.byteLength/Cr))throw new RangeError(I("invalid argument. ArrayBuffer byte length must be a multiple of %u. Byte length: `%u`.",Cr,t.byteLength));t=new Wr(t)}else if(po(arguments[0])){if(t=arguments[0],ET===!1)throw new TypeError(I("invalid argument. Environment lacks Symbol.iterator support. Must provide a length, ArrayBuffer, typed array, or array-like object. Value: `%s`.",t));if(!cr(t[we]))throw new TypeError(I("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",t));if(t=t[we](),!cr(t.next))throw new TypeError(I("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",t));if(t=_T(t),t instanceof Error)throw t;t=new Wr(t)}else throw new TypeError(I("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",arguments[0]));else{if(t=arguments[0],!wT(t))throw new TypeError(I("invalid argument. First argument must be an ArrayBuffer. Value: `%s`.",t));if(r=arguments[1],!Qi(r))throw new TypeError(I("invalid argument. Byte offset must be a nonnegative integer. Value: `%s`.",r));if(!Lr(r/Cr))throw new RangeError(I("invalid argument. Byte offset must be a multiple of %u. Value: `%u`.",Cr,r));if(e===2){if(i=t.byteLength-r,!Lr(i/Cr))throw new RangeError(I("invalid arguments. ArrayBuffer view byte length must be a multiple of %u. View byte length: `%u`.",Cr,i));t=new Wr(t,r)}else{if(i=arguments[2],!Qi(i))throw new TypeError(I("invalid argument. Length must be a nonnegative integer. Value: `%s`.",i));if(i*Cr>t.byteLength-r)throw new RangeError(I("invalid arguments. ArrayBuffer has insufficient capacity. Either decrease the array length or provide a bigger buffer. Minimum capacity: `%u`.",i*Cr));t=new Wr(t,r,i*2)}}return V(this,"_buffer",t),V(this,"_length",t.length/2),this}V(F,"BYTES_PER_ELEMENT",Cr);V(F,"name","Complex128Array");V(F,"from",function(e){var t,i,a,n,s,o,v,l,f,c,p,m;if(!cr(this))throw new TypeError("invalid invocation. `this` context must be a constructor.");if(!TT(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(i=arguments.length,i>1){if(a=arguments[1],!cr(a))throw new TypeError(I("invalid argument. Second argument must be a function. Value: `%s`.",a));i>2&&(t=arguments[2])}if(D(e)){if(l=e.length,a){for(n=new this(l),s=n._buffer,m=0,p=0;p<l;p++){if(c=a.call(t,e.get(p),p),Yr(c))s[m]=ae(c),s[m+1]=ne(c);else if(lo(c)&&c.length>=2)s[m]=c[0],s[m+1]=c[1];else throw new TypeError(I("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",c));m+=2}return n}return new this(e)}if(co(e)){if(a){for(l=e.length,e.get&&e.set?v=y1r("default"):v=g1r("default"),p=0;p<l;p++)if(!Yr(v(e,p))){f=!0;break}if(f){if(!Fn(l))throw new RangeError(I("invalid argument. First argument must have a length which is a multiple of two. Length: `%u`.",l));for(n=new this(l/2),s=n._buffer,p=0;p<l;p++)s[p]=a.call(t,v(e,p),p);return n}for(n=new this(l),s=n._buffer,m=0,p=0;p<l;p++){if(c=a.call(t,v(e,p),p),Yr(c))s[m]=ae(c),s[m+1]=ne(c);else if(lo(c)&&c.length>=2)s[m]=c[0],s[m+1]=c[1];else throw new TypeError(I("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",c));m+=2}return n}return new this(e)}if(po(e)&&ET&&cr(e[we])){if(s=e[we](),!cr(s.next))throw new TypeError(I("invalid argument. First argument must be an array-like object or an iterable. Value: `%s`.",e));if(a?o=q1r(s,a,t):o=_T(s),o instanceof Error)throw o;for(l=o.length/2,n=new this(l),s=n._buffer,p=0;p<l;p++)s[p]=o[p];return n}throw new TypeError(I("invalid argument. First argument must be an array-like object or an iterable. Value: `%s`.",e))});V(F,"of",function(){var e,t;if(!cr(this))throw new TypeError("invalid invocation. `this` context must be a constructor.");if(!TT(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);return new this(e)});V(F.prototype,"at",function(e){if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Lr(e))throw new TypeError(I("invalid argument. Must provide an integer. Value: `%s`.",e));if(e<0&&(e+=this._length),!(e<0||e>=this._length))return sr(this._buffer,e)});Pn(F.prototype,"buffer",function(){return this._buffer.buffer});Pn(F.prototype,"byteLength",function(){return this._buffer.byteLength});Pn(F.prototype,"byteOffset",function(){return this._buffer.byteOffset});V(F.prototype,"BYTES_PER_ELEMENT",F.BYTES_PER_ELEMENT);V(F.prototype,"copyWithin",function(e,t){if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return arguments.length===2?this._buffer.copyWithin(e*2,t*2):this._buffer.copyWithin(e*2,t*2,arguments[2]*2),this});V(F.prototype,"entries",function(){var e,t,i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return t=this,e=this._buffer,a=this._length,s=-1,o=-2,i={},V(i,"next",v),V(i,"return",l),we&&V(i,we,f),i;function v(){var c;return s+=1,n||s>=a?{done:!0}:(o+=2,c=new bT(e[o],e[o+1]),{value:[s,c],done:!1})}function l(c){return n=!0,arguments.length?{value:c,done:!0}:{done:!0}}function f(){return t.entries()}});V(F.prototype,"every",function(e,t){var i,a;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(!e.call(t,sr(i,a),a,this))return!1;return!0});V(F.prototype,"fill",function(e,t,i){var a,n,s,o,v,l;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Yr(e))throw new TypeError(I("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(a=this._buffer,n=this._length,arguments.length>1){if(!Lr(t))throw new TypeError(I("invalid argument. Second argument must be an integer. Value: `%s`.",t));if(t<0&&(t+=n,t<0&&(t=0)),arguments.length>2){if(!Lr(i))throw new TypeError(I("invalid argument. Third argument must be an integer. Value: `%s`.",i));i<0&&(i+=n,i<0&&(i=0)),i>n&&(i=n)}else i=n}else t=0,i=n;for(o=ae(e),v=ne(e),l=t;l<i;l++)s=2*l,a[s]=o,a[s+1]=v;return this});V(F.prototype,"filter",function(e,t){var i,a,n,s;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=[],n=0;n<this._length;n++)s=sr(i,n),e.call(t,s,n,this)&&a.push(s);return new this.constructor(a)});V(F.prototype,"find",function(e,t){var i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(n=sr(i,a),e.call(t,n,a,this))return n});V(F.prototype,"findIndex",function(e,t){var i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(n=sr(i,a),e.call(t,n,a,this))return a;return-1});V(F.prototype,"findLast",function(e,t){var i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length-1;a>=0;a--)if(n=sr(i,a),e.call(t,n,a,this))return n});V(F.prototype,"findLastIndex",function(e,t){var i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length-1;a>=0;a--)if(n=sr(i,a),e.call(t,n,a,this))return a;return-1});V(F.prototype,"forEach",function(e,t){var i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)n=sr(i,a),e.call(t,n,a,this)});V(F.prototype,"get",function(e){if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Qi(e))throw new TypeError(I("invalid argument. Must provide a nonnegative integer. Value: `%s`.",e));if(!(e>=this._length))return sr(this._buffer,e)});Pn(F.prototype,"length",function(){return this._length});V(F.prototype,"includes",function(e,t){var i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Yr(e))throw new TypeError(I("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(arguments.length>1){if(!Lr(t))throw new TypeError(I("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0&&(t+=this._length,t<0&&(t=0))}else t=0;for(n=ae(e),s=ne(e),i=this._buffer,o=t;o<this._length;o++)if(a=2*o,n===i[a]&&s===i[a+1])return!0;return!1});V(F.prototype,"indexOf",function(e,t){var i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Yr(e))throw new TypeError(I("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(arguments.length>1){if(!Lr(t))throw new TypeError(I("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0&&(t+=this._length,t<0&&(t=0))}else t=0;for(n=ae(e),s=ne(e),i=this._buffer,o=t;o<this._length;o++)if(a=2*o,n===i[a]&&s===i[a+1])return o;return-1});V(F.prototype,"join",function(e){var t,i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(arguments.length===0)a=",";else if(dT(e))a=e;else throw new TypeError(I("invalid argument. First argument must be a string. Value: `%s`.",e));for(t=[],i=this._buffer,n=0;n<this._length;n++)t.push(sr(i,n).toString());return t.join(a)});V(F.prototype,"keys",function(){var e,t,i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return e=this,i=this._length,n=-1,t={},V(t,"next",s),V(t,"return",o),we&&V(t,we,v),t;function s(){return n+=1,a||n>=i?{done:!0}:{value:n,done:!1}}function o(l){return a=!0,arguments.length?{value:l,done:!0}:{done:!0}}function v(){return e.keys()}});V(F.prototype,"lastIndexOf",function(e,t){var i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Yr(e))throw new TypeError(I("invalid argument. First argument must be a complex number. Value: `%s`.",e));if(arguments.length>1){if(!Lr(t))throw new TypeError(I("invalid argument. Second argument must be an integer. Value: `%s`.",t));t>=this._length?t=this._length-1:t<0&&(t+=this._length)}else t=this._length-1;for(n=ae(e),s=ne(e),i=this._buffer,o=t;o>=0;o--)if(a=2*o,n===i[a]&&s===i[a+1])return o;return-1});V(F.prototype,"map",function(e,t){var i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(a=this._buffer,n=new this.constructor(this._length),i=n._buffer,s=0;s<this._length;s++)if(o=e.call(t,sr(a,s),s,this),Yr(o))i[2*s]=ae(o),i[2*s+1]=ne(o);else if(lo(o)&&o.length===2)i[2*s]=o[0],i[2*s+1]=o[1];else throw new TypeError(I("invalid argument. Callback must return either a two-element array containing real and imaginary components or a complex number. Value: `%s`.",o));return n});V(F.prototype,"reduce",function(e,t){var i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));if(i=this._buffer,n=this._length,arguments.length>1)a=t,o=0;else{if(n===0)throw new Error("invalid operation. If not provided an initial value, an array must contain at least one element.");a=sr(i,0),o=1}for(;o<n;o++)s=sr(i,o),a=e(a,s,o,this);return a});V(F.prototype,"reduceRight",function(e,t){var i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));if(i=this._buffer,n=this._length,arguments.length>1)a=t,o=n-1;else{if(n===0)throw new Error("invalid operation. If not provided an initial value, an array must contain at least one element.");a=sr(i,n-1),o=n-2}for(;o>=0;o--)s=sr(i,o),a=e(a,s,o,this);return a});V(F.prototype,"reverse",function(){var e,t,i,a,n,s;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(i=this._length,e=this._buffer,a=p1r(i/2),n=0;n<a;n++)s=i-n-1,t=e[2*n],e[2*n]=e[2*s],e[2*s]=t,t=e[2*n+1],e[2*n+1]=e[2*s+1],e[2*s+1]=t;return this});V(F.prototype,"set",function(e){var t,i,a,n,s,o,v,l,f;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(a=this._buffer,arguments.length>1){if(i=arguments[1],!Qi(i))throw new TypeError(I("invalid argument. Index argument must be a nonnegative integer. Value: `%s`.",i))}else i=0;if(Yr(e)){if(i>=this._length)throw new RangeError(I("invalid argument. Index argument is out-of-bounds. Value: `%u`.",i));i*=2,a[i]=ae(e),a[i+1]=ne(e);return}if(D(e)){if(o=e._length,i+o>this._length)throw new RangeError("invalid arguments. Target array lacks sufficient storage to accommodate source values.");if(t=e._buffer,f=a.byteOffset+i*Cr,t.buffer===a.buffer&&t.byteOffset<f&&t.byteOffset+t.byteLength>f){for(n=new Wr(t.length),l=0;l<t.length;l++)n[l]=t[l];t=n}for(i*=2,f=0,l=0;l<o;l++)a[i]=t[f],a[i+1]=t[f+1],i+=2,f+=2;return}if(co(e)){for(o=e.length,l=0;l<o;l++)if(!Yr(e[l])){s=!0;break}if(s){if(!Fn(o))throw new RangeError(I("invalid argument. Array-like object arguments must have a length which is a multiple of two. Length: `%u`.",o));if(i+o/2>this._length)throw new RangeError("invalid arguments. Target array lacks sufficient storage to accommodate source values.");if(t=e,f=a.byteOffset+i*Cr,t.buffer===a.buffer&&t.byteOffset<f&&t.byteOffset+t.byteLength>f){for(n=new Wr(o),l=0;l<o;l++)n[l]=t[l];t=n}for(i*=2,o/=2,f=0,l=0;l<o;l++)a[i]=t[f],a[i+1]=t[f+1],i+=2,f+=2;return}if(i+o>this._length)throw new RangeError("invalid arguments. Target array lacks sufficient storage to accommodate source values.");for(i*=2,l=0;l<o;l++)v=e[l],a[i]=ae(v),a[i+1]=ne(v),i+=2;return}throw new TypeError(I("invalid argument. First argument must be either a complex number, an array-like object, or a complex number array. Value: `%s`.",e))});V(F.prototype,"slice",function(e,t){var i,a,n,s,o,v,l;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(o=this._buffer,v=this._length,arguments.length===0)e=0,t=v;else{if(!Lr(e))throw new TypeError(I("invalid argument. First argument must be an integer. Value: `%s`.",e));if(e<0&&(e+=v,e<0&&(e=0)),arguments.length===1)t=v;else{if(!Lr(t))throw new TypeError(I("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0?(t+=v,t<0&&(t=0)):t>v&&(t=v)}}for(e<t?i=t-e:i=0,n=new this.constructor(i),a=n._buffer,l=0;l<i;l++)s=2*(l+e),a[2*l]=o[s],a[2*l+1]=o[s+1];return n});V(F.prototype,"some",function(e,t){var i,a;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(e.call(t,sr(i,a),a,this))return!0;return!1});V(F.prototype,"sort",function(e){var t,i,a,n,s;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length,t=[],n=0;n<a;n++)t.push(sr(i,n));for(t.sort(e),n=0;n<a;n++)s=2*n,i[s]=ae(t[n]),i[s+1]=ne(t[n]);return this});V(F.prototype,"subarray",function(e,t){var i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(a=this._buffer,n=this._length,arguments.length===0)e=0,t=n;else{if(!Lr(e))throw new TypeError(I("invalid argument. First argument must be an integer. Value: `%s`.",e));if(e<0&&(e+=n,e<0&&(e=0)),arguments.length===1)t=n;else{if(!Lr(t))throw new TypeError(I("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0?(t+=n,t<0&&(t=0)):t>n&&(t=n)}}return e>=n?(n=0,i=a.byteLength):e>=t?(n=0,i=a.byteOffset+e*Cr):(n=t-e,i=a.byteOffset+e*Cr),new this.constructor(a.buffer,i,n<0?0:n)});V(F.prototype,"toLocaleString",function(e,t){var i,a,n,s,o;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(arguments.length===0)a=[];else if(dT(e)||v1r(e))a=e;else throw new TypeError(I("invalid argument. First argument must be a string or an array of strings. Value: `%s`.",e));if(arguments.length<2)i={};else if(po(t))i=t;else throw new TypeError(I("invalid argument. Options argument must be an object. Value: `%s`.",t));for(s=this._buffer,n=[],o=0;o<this._length;o++)n.push(sr(s,o).toLocaleString(a,i));return n.join(",")});V(F.prototype,"toReversed",function(){var e,t,i,a,n,s;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(i=this._length,t=new this.constructor(i),a=this._buffer,e=t._buffer,n=0;n<i;n++)s=i-n-1,e[2*n]=a[2*s],e[2*n+1]=a[2*s+1];return t});V(F.prototype,"toSorted",function(e){var t,i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!cr(e))throw new TypeError(I("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=this._length,t=[],n=0;n<a;n++)t.push(sr(i,n));return t.sort(e),new F(t)});V(F.prototype,"toString",function(){var e,t,i;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");for(e=[],t=this._buffer,i=0;i<this._length;i++)e.push(sr(t,i).toString());return e.join(",")});V(F.prototype,"values",function(){var e,t,i,a,n,s;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");return t=this,n=this._buffer,i=this._length,s=-1,e={},V(e,"next",o),V(e,"return",v),we&&V(e,we,l),e;function o(){return s+=1,a||s>=i?{done:!0}:{value:sr(n,s),done:!1}}function v(f){return a=!0,arguments.length?{value:f,done:!0}:{done:!0}}function l(){return t.values()}});V(F.prototype,"with",function(e,t){var i,a,n;if(!D(this))throw new TypeError("invalid invocation. `this` is not a complex number array.");if(!Lr(e))throw new TypeError(I("invalid argument. First argument must be an integer. Value: `%s`.",e));if(n=this._length,e<0&&(e+=n),e<0||e>=n)throw new RangeError(I("invalid argument. Index argument is out-of-bounds. Value: `%s`.",e));if(!Yr(t))throw new TypeError(I("invalid argument. Second argument must be a complex number. Value: `%s`.",t));return a=new this.constructor(this._buffer),i=a._buffer,i[2*e]=ae(t),i[2*e+1]=ne(t),a});AT.exports=F});var ST=u((tLr,IT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var d1r=OT();IT.exports=d1r});var LT=u((iLr,NT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var b1r=Et();function _1r(r){var e,t;for(e=[];t=r.next(),!t.done;)e.push(b1r(t.value));return e}NT.exports=_1r});var PT=u((aLr,FT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var E1r=Et();function T1r(r,e,t){var i,a,n;for(i=[],n=-1;a=r.next(),!a.done;)n+=1,i.push(E1r(e.call(t,a.value,n)));return i}FT.exports=T1r});var VT=u((nLr,RT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var A1r=Et();function O1r(r,e){var t,i;for(t=e.length,i=0;i<t;i++)r[i]=A1r(e[i]);return r}RT.exports=O1r});var HT=u((uLr,GT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zi=ke().isPrimitive,mo=Sr(),MT=Ui(),ho=Xt(),pr=Hr(),Ji=Vr().isPrimitive,ue=dr().isPrimitive,CT=hr().isPrimitive,I1r=_n().primitives,S1r=Di(),de=On(),M=N(),Rn=Tt(),je=He(),$=Et(),N1r=_t(),L1r=vr(),F1r=it(),j=S(),jT=LT(),P1r=PT(),R1r=VT(),At=je.BYTES_PER_ELEMENT,BT=S1r();function Y(r){return typeof r=="object"&&r!==null&&r.constructor.name==="BooleanArray"&&r.BYTES_PER_ELEMENT===At}function kT(r){return r===P}function P(){var r,e,t,i,a;if(e=arguments.length,!(this instanceof P))return e===0?new P:e===1?new P(arguments[0]):e===2?new P(arguments[0],arguments[1]):new P(arguments[0],arguments[1],arguments[2]);if(e===0)t=new je(0);else if(e===1)if(a=arguments[0],Zi(a))t=new je(a);else if(mo(a))t=R1r(new je(a.length),a);else if(MT(a))t=new je(a);else if(ho(a)){if(BT===!1)throw new TypeError(j("invalid argument. Environment lacks Symbol.iterator support. Must provide a length, ArrayBuffer, typed array, or array-like object. Value: `%s`.",a));if(!pr(a[de]))throw new TypeError(j("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",a));if(t=a[de](),!pr(t.next))throw new TypeError(j("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",a));t=new je(jT(t))}else throw new TypeError(j("invalid argument. Must provide a length, ArrayBuffer, typed array, array-like object, or an iterable. Value: `%s`.",a));else{if(t=arguments[0],!MT(t))throw new TypeError(j("invalid argument. First argument must be an ArrayBuffer. Value: `%s`.",t));if(r=arguments[1],!Zi(r))throw new TypeError(j("invalid argument. Byte offset must be a nonnegative integer. Value: `%s`.",r));if(e===2)t=new je(t,r);else{if(i=arguments[2],!Zi(i))throw new TypeError(j("invalid argument. Length must be a nonnegative integer. Value: `%s`.",i));if(i*At>t.byteLength-r)throw new RangeError(j("invalid arguments. ArrayBuffer has insufficient capacity. Either decrease the array length or provide a bigger buffer. Minimum capacity: `%u`.",i*At));t=new je(t,r,i)}}return M(this,"_buffer",t),M(this,"_length",t.length),this}M(P,"BYTES_PER_ELEMENT",At);M(P,"name","BooleanArray");M(P,"from",function(e){var t,i,a,n,s,o,v,l,f;if(!pr(this))throw new TypeError("invalid invocation. `this` context must be a constructor.");if(!kT(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(i=arguments.length,i>1){if(a=arguments[1],!pr(a))throw new TypeError(j("invalid argument. Second argument must be a function. Value: `%s`.",a));i>2&&(t=arguments[2])}if(mo(e)){if(a){for(l=e.length,e.get&&e.set?v=F1r("default"):v=N1r("default"),n=new this(l),s=n._buffer,f=0;f<l;f++)s[f]=$(a.call(t,v(e,f),f));return n}return new this(e)}if(ho(e)&&BT&&pr(e[de])){if(s=e[de](),!pr(s.next))throw new TypeError(j("invalid argument. First argument must be an array-like object or an iterable. Value: `%s`.",e));for(a?o=P1r(s,a,t):o=jT(s),l=o.length,n=new this(l),s=n._buffer,f=0;f<l;f++)s[f]=o[f];return n}throw new TypeError(j("invalid argument. First argument must be an array-like object or an iterable. Value: `%s`.",e))});M(P,"of",function(){var e,t;if(!pr(this))throw new TypeError("invalid invocation. `this` context must be a constructor.");if(!kT(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");for(e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);return new this(e)});M(P.prototype,"at",function(e){var t,i;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!ue(e))throw new TypeError(j("invalid argument. Must provide an integer. Value: `%s`.",e));if(i=this._length,t=this._buffer,e<0&&(e+=i),!(e<0||e>=i))return $(t[e])});Rn(P.prototype,"buffer",function(){return this._buffer.buffer});Rn(P.prototype,"byteLength",function(){return this._buffer.byteLength});Rn(P.prototype,"byteOffset",function(){return this._buffer.byteOffset});M(P.prototype,"BYTES_PER_ELEMENT",P.BYTES_PER_ELEMENT);M(P.prototype,"copyWithin",function(e,t){if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");return arguments.length===2?this._buffer.copyWithin(e,t):this._buffer.copyWithin(e,t,arguments[2]),this});M(P.prototype,"entries",function(){var e,t,i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");return e=this,a=this._buffer,i=this._length,s=-1,t={},M(t,"next",o),M(t,"return",v),de&&M(t,de,l),t;function o(){return s+=1,n||s>=i?{done:!0}:{value:[s,$(a[s])],done:!1}}function v(f){return n=!0,arguments.length?{value:f,done:!0}:{done:!0}}function l(){return e.entries()}});M(P.prototype,"every",function(e,t){var i,a;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(!e.call(t,$(i[a]),a,this))return!1;return!0});M(P.prototype,"fill",function(e,t,i){var a,n,s,o;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!Ji(e))throw new TypeError(j("invalid argument. First argument must be a boolean. Value: `%s`.",e));if(a=this._buffer,n=this._length,arguments.length>1){if(!ue(t))throw new TypeError(j("invalid argument. Second argument must be an integer. Value: `%s`.",t));if(t<0&&(t+=n,t<0&&(t=0)),arguments.length>2){if(!ue(i))throw new TypeError(j("invalid argument. Third argument must be an integer. Value: `%s`.",i));i<0&&(i+=n,i<0&&(i=0)),i>n&&(i=n)}else i=n}else t=0,i=n;for(e?s=1:s=0,o=t;o<i;o++)a[o]=s;return this});M(P.prototype,"filter",function(e,t){var i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=[],n=0;n<this._length;n++)s=$(i[n]),e.call(t,s,n,this)&&a.push(s);return new this.constructor(a)});M(P.prototype,"find",function(e,t){var i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,n=0;n<this._length;n++)if(a=$(i[n]),e.call(t,a,n,this))return a});M(P.prototype,"findIndex",function(e,t){var i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,n=0;n<this._length;n++)if(a=$(i[n]),e.call(t,a,n,this))return n;return-1});M(P.prototype,"findLast",function(e,t){var i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,n=this._length-1;n>=0;n--)if(a=$(i[n]),e.call(t,a,n,this))return a});M(P.prototype,"findLastIndex",function(e,t){var i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,n=this._length-1;n>=0;n--)if(a=$(i[n]),e.call(t,a,n,this))return n;return-1});M(P.prototype,"forEach",function(e,t){var i,a;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)e.call(t,$(i[a]),a,this)});M(P.prototype,"get",function(e){if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!Zi(e))throw new TypeError(j("invalid argument. Must provide a nonnegative integer. Value: `%s`.",e));if(!(e>=this._length))return $(this._buffer[e])});M(P.prototype,"includes",function(e,t){var i,a;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!Ji(e))throw new TypeError(j("invalid argument. First argument must be a boolean. Value: `%s`.",e));if(arguments.length>1){if(!ue(t))throw new TypeError(j("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0&&(t+=this._length,t<0&&(t=0))}else t=0;for(i=this._buffer,a=t;a<this._length;a++)if(e===$(i[a]))return!0;return!1});M(P.prototype,"indexOf",function(e,t){var i,a;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!Ji(e))throw new TypeError(j("invalid argument. First argument must be a boolean. Value: `%s`.",e));if(arguments.length>1){if(!ue(t))throw new TypeError(j("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0&&(t+=this._length,t<0&&(t=0))}else t=0;for(i=this._buffer,a=t;a<this._length;a++)if(e===$(i[a]))return a;return-1});M(P.prototype,"join",function(e){var t,i,a;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(arguments.length>0){if(!CT(e))throw new TypeError(j("invalid argument. First argument must be a string. Value: `%s`.",e))}else e=",";for(t=this._buffer,i=[],a=0;a<this._length;a++)t[a]?i.push("true"):i.push("false");return i.join(e)});M(P.prototype,"keys",function(){var e,t,i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");return e=this,i=this._length,n=-1,t={},M(t,"next",s),M(t,"return",o),de&&M(t,de,v),t;function s(){return n+=1,a||n>=i?{done:!0}:{value:n,done:!1}}function o(l){return a=!0,arguments.length?{value:l,done:!0}:{done:!0}}function v(){return e.keys()}});M(P.prototype,"lastIndexOf",function(e,t){var i,a;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!Ji(e))throw new TypeError(j("invalid argument. First argument must be a boolean. Value: `%s`.",e));if(arguments.length>1){if(!ue(t))throw new TypeError(j("invalid argument. Second argument must be an integer. Value: `%s`.",t));t>=this._length?t=this._length-1:t<0&&(t+=this._length)}else t=this._length-1;for(i=this._buffer,a=t;a>=0;a--)if(e===$(i[a]))return a;return-1});Rn(P.prototype,"length",function(){return this._length});M(P.prototype,"map",function(e,t){var i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError("invalid argument. First argument must be a function. Value: `%s`.",e);for(n=this._buffer,a=new this.constructor(this._length),i=a._buffer,s=0;s<this._length;s++)i[s]=$(e.call(t,$(n[s]),s,this));return a});M(P.prototype,"reduce",function(e,t){var i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));if(i=this._buffer,a=this._length,arguments.length>1)n=t,s=0;else{if(a===0)throw new Error("invalid operation. If not provided an initial value, an array must contain at least one element.");n=$(i[0]),s=1}for(;s<a;s++)n=e(n,$(i[s]),s,this);return n});M(P.prototype,"reduceRight",function(e,t){var i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));if(i=this._buffer,a=this._length,arguments.length>1)n=t,s=a-1;else{if(a===0)throw new Error("invalid operation. If not provided an initial value, an array must contain at least one element.");n=$(i[a-1]),s=a-2}for(;s>=0;s--)n=e(n,$(i[s]),s,this);return n});M(P.prototype,"reverse",function(){var e,t,i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");for(e=this._buffer,i=this._length,a=L1r(i/2),n=0;n<a;n++)s=i-n-1,t=e[n],e[n]=e[s],e[s]=t;return this});M(P.prototype,"set",function(e){var t,i,a,n,s,o,v;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(a=this._buffer,arguments.length>1){if(i=arguments[1],!Zi(i))throw new TypeError(j("invalid argument. Index argument must be a nonnegative integer. Value: `%s`.",i))}else i=0;if(mo(e)){if(s=e.length,i+s>this._length)throw new RangeError("invalid arguments. Target array lacks sufficient storage to accommodate source values.");if(Y(e)?t=e._buffer:t=e,v=a.byteOffset+i*At,t.buffer===a.buffer&&t.byteOffset<v&&t.byteOffset+t.byteLength>v){for(n=new je(t.length),o=0;o<t.length;o++)n[o]=t[o];t=n}for(o=0;o<s;i++,o++)a[i]=t[o]?1:0;return}if(i>=this._length)throw new RangeError(j("invalid argument. Index argument is out-of-bounds. Value: `%u`.",i));a[i]=e?1:0});M(P.prototype,"slice",function(e,t){var i,a,n,s,o,v;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(s=this._buffer,o=this._length,arguments.length===0)e=0,t=o;else{if(!ue(e))throw new TypeError(j("invalid argument. First argument must be an integer. Value: `%s`.",e));if(e<0&&(e+=o,e<0&&(e=0)),arguments.length===1)t=o;else{if(!ue(t))throw new TypeError(j("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0?(t+=o,t<0&&(t=0)):t>o&&(t=o)}}for(e<t?i=t-e:i=0,n=new this.constructor(i),a=n._buffer,v=0;v<i;v++)a[v]=s[v+e];return n});M(P.prototype,"some",function(e,t){var i,a;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));for(i=this._buffer,a=0;a<this._length;a++)if(e.call(t,$(i[a]),a,this))return!0;return!1});M(P.prototype,"sort",function(e){var t;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(t=this._buffer,arguments.length===0)return t.sort(),this;if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));return t.sort(i),this;function i(a,n){return e($(a),$(n))}});M(P.prototype,"subarray",function(e,t){var i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(a=this._buffer,n=this._length,arguments.length===0)e=0,t=n;else{if(!ue(e))throw new TypeError(j("invalid argument. First argument must be an integer. Value: `%s`.",e));if(e<0&&(e+=n,e<0&&(e=0)),arguments.length===1)t=n;else{if(!ue(t))throw new TypeError(j("invalid argument. Second argument must be an integer. Value: `%s`.",t));t<0?(t+=n,t<0&&(t=0)):t>n&&(t=n)}}return e>=n?(n=0,i=a.byteLength):e>=t?(n=0,i=a.byteOffset+e*At):(n=t-e,i=a.byteOffset+e*At),new this.constructor(a.buffer,i,n<0?0:n)});M(P.prototype,"toLocaleString",function(e,t){var i,a,n,s,o;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(arguments.length===0)a=[];else if(CT(e)||I1r(e))a=e;else throw new TypeError(j("invalid argument. First argument must be a string or an array of strings. Value: `%s`.",e));if(arguments.length<2)i={};else if(ho(t))i=t;else throw new TypeError(j("invalid argument. Options argument must be an object. Value: `%s`.",t));for(s=this._buffer,n=[],o=0;o<this._length;o++)n.push($(s[o]).toLocaleString(a,i));return n.join(",")});M(P.prototype,"toReversed",function(){var e,t,i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");for(i=this._length,t=new this.constructor(i),a=this._buffer,e=t._buffer,n=0;n<i;n++)e[n]=a[i-n-1];return t});M(P.prototype,"toSorted",function(e){var t,i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");for(a=this._length,i=new this.constructor(a),n=this._buffer,t=i._buffer,s=0;s<a;s++)t[s]=n[s];if(arguments.length===0)return t.sort(),i;if(!pr(e))throw new TypeError(j("invalid argument. First argument must be a function. Value: `%s`.",e));return t.sort(o),i;function o(v,l){return e($(v),$(l))}});M(P.prototype,"toString",function(){var e,t,i;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");for(e=[],t=this._buffer,i=0;i<this._length;i++)t[i]?e.push("true"):e.push("false");return e.join(",")});M(P.prototype,"values",function(){var e,t,i,a,n,s;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");return t=this,n=this._buffer,i=this._length,s=-1,e={},M(e,"next",o),M(e,"return",v),de&&M(e,de,l),e;function o(){return s+=1,a||s>=i?{done:!0}:{value:$(n[s]),done:!1}}function v(f){return a=!0,arguments.length?{value:f,done:!0}:{done:!0}}function l(){return t.values()}});M(P.prototype,"with",function(e,t){var i,a,n;if(!Y(this))throw new TypeError("invalid invocation. `this` is not a boolean array.");if(!ue(e))throw new TypeError(j("invalid argument. First argument must be an integer. Value: `%s`.",e));if(n=this._length,e<0&&(e+=n),e<0||e>=n)throw new RangeError(j("invalid argument. Index argument is out-of-bounds. Value: `%s`.",e));if(!Ji(t))throw new TypeError(j("invalid argument. Second argument must be a boolean. Value: `%s`.",t));return a=new this.constructor(this._buffer),i=a._buffer,t?i[e]=1:i[e]=0,a});GT.exports=P});var DT=u((sLr,UT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var V1r=HT();UT.exports=V1r});var YT=u((oLr,WT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var M1r=Tr(),C1r=Hi(),j1r=Ge(),B1r=Ed(),k1r=X0(),G1r=Wd(),H1r=He(),U1r=sb(),D1r=Sb(),W1r=uT(),Y1r=ST(),K1r=DT(),Q1r=[M1r,C1r,B1r,j1r,G1r,k1r,D1r,H1r,U1r,W1r,Y1r,K1r];WT.exports=Q1r});var QT=u((vLr,KT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Z1r=["float64","float32","int32","uint32","int16","uint16","int8","uint8","uint8c","complex64","complex128","bool"];KT.exports=Z1r});var XT=u((fLr,JT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var J1r=Hs(),X1r=Rr(),$1r=bn(),z1r=Uw(),x1r=YT(),ZT=QT(),rlr=ZT.length;function elr(r){var e;if(X1r(r))return"generic";if(J1r(r))return null;for(e=0;e<rlr;e++)if(r instanceof x1r[e])return ZT[e];return z1r[$1r(r)]||null}JT.exports=elr});var Xi=u((lLr,$T)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tlr=XT();$T.exports=tlr});var xT=u((cLr,zT)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ilr=Gi(),alr=_t(),nlr=fw(),ulr=it(),slr=ww(),olr=Xi();function vlr(r){var e=olr(r);return ilr(r)?{data:r,dtype:e,accessorProtocol:!0,accessors:[ulr(e),slr(e)]}:{data:r,dtype:e,accessorProtocol:!1,accessors:[alr(e),nlr(e)]}}zT.exports=vlr});var ot=u((pLr,rA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var flr=xT();rA.exports=flr});var tA=u((mLr,eA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var llr=vr(),clr=128;function go(r,e,t,i){var a,n,s,o,v,l,f,c,p,m,h,g,w,y,b;if(a=e.data,n=e.accessors[0],s=i,t===0)return r*n(a,s);if(r<=8){for(y=n(a,s),s+=t,b=1;b<r;b++)y+=n(a,s),s+=t;return y}if(r<=clr){for(o=n(a,s),v=n(a,s+t),l=n(a,s+2*t),f=n(a,s+3*t),c=n(a,s+4*t),p=n(a,s+5*t),m=n(a,s+6*t),h=n(a,s+7*t),s+=8*t,g=r%8,b=8;b<r-g;b+=8)o+=n(a,s),v+=n(a,s+t),l+=n(a,s+2*t),f+=n(a,s+3*t),c+=n(a,s+4*t),p+=n(a,s+5*t),m+=n(a,s+6*t),h+=n(a,s+7*t),s+=8*t;for(y=o+v+(l+f)+(c+p+(m+h)),b;b<r;b++)y+=n(a,s),s+=t;return y}return w=llr(r/2),w-=w%8,go(w,e,t,s)+go(r-w,e,t,s+w*t)}eA.exports=go});var qo=u((hLr,iA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var plr=vr(),mlr=ot(),hlr=tA(),glr=128;function yo(r,e,t,i){var a,n,s,o,v,l,f,c,p,m,h,g,w,y;if(r<=0)return 0;if(g=mlr(e),g.accessorProtocol)return hlr(r,g,t,i);if(a=i,t===0)return r*e[a];if(r<8){for(h=e[a],a+=t,y=1;y<r;y++)h+=e[a],a+=t;return h}if(r<=glr){for(n=e[a],s=e[a+t],o=e[a+2*t],v=e[a+3*t],l=e[a+4*t],f=e[a+5*t],c=e[a+6*t],p=e[a+7*t],a+=8*t,m=r%8,y=8;y<r-m;y+=8)n+=e[a],s+=e[a+t],o+=e[a+2*t],v+=e[a+3*t],l+=e[a+4*t],f+=e[a+5*t],c+=e[a+6*t],p+=e[a+7*t],a+=8*t;for(h=n+s+(o+v)+(l+f+(c+p)),y;y<r;y++)h+=e[a],a+=t;return h}return w=plr(r/2),w-=w%8,yo(w,e,t,a)+yo(r-w,e,t,a+w*t)}iA.exports=yo});var nA=u((gLr,aA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ylr=Me(),qlr=qo();function wlr(r,e,t){return qlr(r,e,t,ylr(r,t))}aA.exports=wlr});var xt=u((yLr,sA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var dlr=N(),uA=nA(),blr=qo();dlr(uA,"ndarray",blr);sA.exports=uA});var wo=u((qLr,oA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _lr=xt().ndarray;function Elr(r,e,t,i,a){return r<=0?0:r*e+_lr(r,t,i,a)}oA.exports=Elr});var fA=u((wLr,vA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Tlr=Me(),Alr=wo();function Olr(r,e,t,i){return Alr(r,e,t,i,Tlr(r,i))}vA.exports=Olr});var bo=u((dLr,cA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ilr=N(),lA=fA(),Slr=wo();Ilr(lA,"ndarray",Slr);cA.exports=lA});var mA=u((bLr,pA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Nlr=xt().ndarray,Llr=bo().ndarray;function Flr(r,e,t,i){var a,n,s,o;return a=e.data,n=e.accessors[0],r===1||t===0?n(a,i):(s=Nlr(r,a,t,i)/r,o=Llr(r,-s,a,t,i)/r,s+o)}pA.exports=Flr});var _o=u((_Lr,hA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Plr=xt().ndarray,Rlr=bo().ndarray,Vlr=ot(),Mlr=mA();function Clr(r,e,t,i){var a,n,s;return r<=0?NaN:(s=Vlr(e),s.accessorProtocol?Mlr(r,s,t,i):r===1||t===0?e[i]:(a=Plr(r,e,t,i)/r,n=Rlr(r,-a,e,t,i)/r,a+n))}hA.exports=Clr});var yA=u((ELr,gA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var jlr=Me(),Blr=_o();function klr(r,e,t){return Blr(r,e,t,jlr(r,t))}gA.exports=klr});var dA=u((TLr,wA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Glr=N(),qA=yA(),Hlr=_o();Glr(qA,"ndarray",Hlr);wA.exports=qA});var Eo=u((ALr,bA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ulr=dA();bA.exports=Ulr});var EA=u((OLr,_A)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dlr=Eo();function Wlr(r,e,t){return Dlr(r,e,t)}_A.exports=Wlr});var AA=u((ILr,TA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ylr=Eo().ndarray;function Klr(r,e,t,i){return Ylr(r,e,t,i)}TA.exports=Klr});var SA=u((SLr,IA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qlr=N(),OA=EA(),Zlr=AA();Qlr(OA,"ndarray",Zlr);IA.exports=OA});var To=u((NLr,NA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jlr=SA();NA.exports=Jlr});var FA=u((LLr,LA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xlr=xt().ndarray;function $lr(r,e,t,i,a){var n,s,o,v,l,f,c,p,m;for(n=t.data,s=t.accessors[0],o=Xlr(r,n,i,a)/r,p=r-e,v=a,l=0,f=0,m=0;m<r;m++)c=s(n,v)-o,l+=c*c,f+=c,v+=i;return l/p-f/r*(f/p)}LA.exports=$lr});var Ao=u((FLr,PA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zlr=xt().ndarray,xlr=ot(),rcr=FA();function ecr(r,e,t,i,a){var n,s,o,v,l,f,c,p;if(c=r-e,r<=0||c<=0)return NaN;if(r===1||i===0)return 0;if(v=xlr(t),v.accessorProtocol)return rcr(r,e,v,i,a);for(n=zlr(r,t,i,a)/r,s=a,o=0,l=0,p=0;p<r;p++)f=t[s]-n,o+=f*f,l+=f,s+=i;return o/c-l/r*(l/c)}PA.exports=ecr});var VA=u((PLr,RA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tcr=Me(),icr=Ao();function acr(r,e,t,i){return icr(r,e,t,i,tcr(r,i))}RA.exports=acr});var Oo=u((RLr,CA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ncr=N(),MA=VA(),ucr=Ao();ncr(MA,"ndarray",ucr);CA.exports=MA});var BA=u((VLr,jA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var scr=Oo();function ocr(r,e,t,i){return scr(r,e,t,i)}jA.exports=ocr});var GA=u((MLr,kA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vcr=Oo().ndarray;function fcr(r,e,t,i,a){return vcr(r,e,t,i,a)}kA.exports=fcr});var DA=u((CLr,UA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lcr=N(),HA=BA(),ccr=GA();lcr(HA,"ndarray",ccr);UA.exports=HA});var Io=u((jLr,WA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pcr=DA();WA.exports=pcr});var KA=u((BLr,YA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var mcr=Object;YA.exports=mcr});var So=u((kLr,QA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hcr=KA();QA.exports=hcr});var JA=u((GLr,ZA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gcr=Object.getPrototypeOf;ZA.exports=gcr});var $A=u((HLr,XA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function ycr(r){return r.__proto__}XA.exports=ycr});var rO=u((ULr,xA)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qcr=ur(),zA=So(),wcr=$A();function dcr(r){var e=wcr(r);return e||e===null?e:qcr(r.constructor)==="[object Function]"?r.constructor.prototype:r instanceof zA?zA.prototype:null}xA.exports=dcr});var tO=u((DLr,eO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bcr=Hr(),_cr=JA(),Ecr=rO(),No;bcr(Object.getPrototypeOf)?No=_cr:No=Ecr;eO.exports=No});var aO=u((WLr,iO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Tcr=So(),Acr=tO();function Ocr(r){return r==null?null:(r=Tcr(r),Acr(r))}iO.exports=Ocr});var uO=u((YLr,nO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Icr=aO();nO.exports=Icr});var vO=u((KLr,oO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Scr=Xt(),sO=Hr(),Ncr=uO(),Vn=er(),Lcr=ur(),Fcr=Object.prototype;function Pcr(r){var e;for(e in r)if(!Vn(r,e))return!1;return!0}function Rcr(r){var e;return Scr(r)?(e=Ncr(r),e?!Vn(r,"constructor")&&Vn(e,"constructor")&&sO(e.constructor)&&Lcr(e.constructor)==="[object Function]"&&Vn(e,"isPrototypeOf")&&sO(e.isPrototypeOf)&&(e===Fcr||Pcr(r)):!0):!1}oO.exports=Rcr});var gr=u((QLr,fO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Vcr=vO();fO.exports=Vcr});var Lo=u((ZLr,lO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mcr=Er().isPrimitive,Ccr=B();function jcr(r){return Mcr(r)&&Ccr(r)}lO.exports=jcr});var Fo=u((JLr,cO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Bcr=Er().isObject,kcr=B();function Gcr(r){return Bcr(r)&&kcr(r.valueOf())}cO.exports=Gcr});var mO=u((XLr,pO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hcr=Lo(),Ucr=Fo();function Dcr(r){return Hcr(r)||Ucr(r)}pO.exports=Dcr});var Ot=u(($Lr,gO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hO=N(),Po=mO(),Wcr=Lo(),Ycr=Fo();hO(Po,"isPrimitive",Wcr);hO(Po,"isObject",Ycr);gO.exports=Po});var bO=u((zLr,dO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yO=Er().isPrimitive,Kcr=gr(),qO=hr().isPrimitive,wO=Ot(),Mn=er(),$i=S();function Qcr(r,e){return Kcr(e)?Mn(e,"alpha")&&(r.alpha=e.alpha,!yO(r.alpha)||wO(r.alpha))?new TypeError($i("invalid option. `%s` option must be a number. Option: `%s`.","alpha",r.alpha)):Mn(e,"alternative")&&(r.alternative=e.alternative,!qO(r.alternative))?new TypeError($i("invalid option. `%s` option must be a string. Option: `%s`.","alternative",r.alternative)):Mn(e,"difference")&&(r.difference=e.difference,!yO(r.difference)||wO(r.difference))?new TypeError($i("invalid option. `%s` option must be a number. Option: `%s`.","difference",r.difference)):Mn(e,"variance")&&(r.variance=e.variance,!qO(r.variance))?new TypeError($i("invalid option. `%s` option must be a string. Option: `%s`.","variance",r.variance)):null:new TypeError($i("invalid argument. Options argument must be an object. Value: `%s`.",e))}dO.exports=Qcr});var Ro=u((xLr,_O)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Zcr=dr().isPrimitive;function Jcr(r){return Zcr(r)&&r>0}_O.exports=Jcr});var Vo=u((rFr,EO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xcr=dr().isObject;function $cr(r){return Xcr(r)&&r.valueOf()>0}EO.exports=$cr});var AO=u((eFr,TO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zcr=Ro(),xcr=Vo();function r2r(r){return zcr(r)||xcr(r)}TO.exports=r2r});var be=u((tFr,IO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var OO=N(),Mo=AO(),e2r=Ro(),t2r=Vo();OO(Mo,"isPrimitive",e2r);OO(Mo,"isObject",t2r);IO.exports=Mo});var NO=u((iFr,SO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var i2r=308;SO.exports=i2r});var FO=u((aFr,LO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var a2r=-308;LO.exports=a2r});var RO=u((nFr,PO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var n2r=-324;PO.exports=n2r});var GO=u((uFr,kO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var VO=B(),Cn=De(),MO=tr(),u2r=k(),CO=Vt(),s2r=fs(),jO=NO(),o2r=FO(),v2r=RO(),f2r=s2r+1,BO=1e308;function l2r(r,e){var t,i;return VO(r)||VO(e)||Cn(e)?NaN:Cn(r)||r===0||e<v2r||u2r(r)>f2r&&e<=0?r:e>jO?0*r:e<o2r?(t=MO(10,-(e+jO)),i=r*BO*t,Cn(i)?r:CO(i)/BO/t):(t=MO(10,-e),i=r*t,Cn(i)?r:CO(i)/t)}kO.exports=l2r});var ri=u((sFr,HO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var c2r=GO();HO.exports=c2r});var WO=u((oFr,DO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var p2r=be(),m2r=gr(),h2r=Vr().isPrimitive,UO=er(),zi=ri(),Co=S();function g2r(r){var e,t,i;if(t=4,e=!0,arguments.length>0){if(!m2r(r))throw new TypeError(Co("invalid argument. First argument must be an object. Value: `%s`.",r));if(UO(r,"digits")){if(!p2r(r.digits))throw new TypeError(Co("invalid option. `%s` option must be a positive integer. Option: `%s`.","digits",r.digits));t=r.digits}if(UO(r,"decision")){if(!h2r(r.decision))throw new TypeError(Co("invalid option. `%s` option must be a boolean. Option: `%s`.","decision",r.decision));e=r.decision}}switch(i="",i+=this.method,i+=`

`,i+="Alternative hypothesis: ",i+="True difference in means is ",this.alternative){case"less":i+="less than ";break;case"greater":i+="greater than ";break;default:i+="not equal to ";break}return i+=this.nullValue,i+=`

`,i+="    pValue: "+zi(this.pValue,-t)+`
`,i+="    statistic: "+zi(this.statistic,-t)+`
`,i+="    df: "+zi(this.df,-t)+`
`,i+="    "+(1-this.alpha)*100+"% confidence interval: ["+zi(this.ci[0],-t)+","+zi(this.ci[1],-t)+"]",i+=`

`,e&&(i+="Test Decision: ",this.rejected?i+="Reject null in favor of alternative at "+this.alpha*100+"% significance level":i+="Fail to reject null in favor of alternative at "+this.alpha*100+"% significance level",i+=`
`),i}DO.exports=g2r});var XO=u((vFr,JO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YO=da().primitives,KO=ba(),Kr=ct(),jo=fn(),jn=js(),Bn=Q(),y2r=k(),Bo=tr(),QO=To(),ZO=Io(),xi=S(),q2r=mr(),w2r=X(),d2r=bO(),b2r=WO();function _2r(r,e,t){var i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E,d;if(!KO(r)&&!YO(r))throw new TypeError(xi("invalid argument. First argument must be a numeric array. Value: `%s`.",r));if(!KO(e)&&!YO(e))throw new TypeError(xi("invalid argument. Second argument must be a numeric array. Value: `%s`.",e));if(f={},t&&(b=d2r(f,t),b))throw b;if(l=f.difference||0,f.alpha===void 0?a=.05:a=f.alpha,a<0||a>1)throw new RangeError(xi("invalid option. `%s` option must be a number on the interval: [0, 1]. Option: `%f`.","alpha",a));if(A=r.length,_=e.length,p=ZO(A,1,r,1),m=ZO(_,1,e,1),o=f.variance||"unequal",o==="equal")E=A+_-2,d=(A-1)*p+(_-1)*m,d/=E,i=Bn(d*(1/A+1/_));else if(o==="unequal")g=Bn(p/A),w=Bn(m/_),i=Bn(g*g+w*w),d=Bo(g,4)/(A-1),d+=Bo(w,4)/(_-1),E=Bo(i,4)/d;else throw new Error(xi('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"variance",["equal","unequal"].join('", "'),o));switch(n=QO(A,r,1),s=QO(_,e,1),h=(n-s-l)/i,y=f.alternative||"two-sided",y){case"two-sided":c=2*jo(-y2r(h),E),v=[h-jn(1-a/2,E),h+jn(1-a/2,E)],v[0]=l+v[0]*i,v[1]=l+v[1]*i;break;case"greater":c=1-jo(h,E),v=[h-jn(1-a,E),w2r],v[0]=l+v[0]*i;break;case"less":c=jo(h,E),v=[q2r,h+jn(1-a,E)],v[1]=l+v[1]*i;break;default:throw new Error(xi('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"alternative",["two-sided","less","greater"].join('", "'),y))}return q={},Kr(q,"rejected",c<=a),Kr(q,"alpha",a),Kr(q,"pValue",c),Kr(q,"statistic",h),Kr(q,"ci",v),Kr(q,"alternative",y),Kr(q,"df",E),Kr(q,"method",o==="equal"?"Two-sample t-test":"Welch two-sample t-test"),Kr(q,"nullValue",l),Kr(q,"xmean",n),Kr(q,"ymean",s),Kr(q,"print",b2r),q}JO.exports=_2r});var zO=u((fFr,$O)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var E2r=XO();$O.exports=E2r});var ko=u((lFr,xO)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function T2r(r,e,t,i,a,n,s){var o,v,l,f,c,p,m;for(o=e.data,v=a.data,f=e.accessors[0],l=a.accessors[1],c=i,p=s,m=0;m<r;m++)l(v,p,f(o,c)),c+=t,p+=n;return a}xO.exports=T2r});var tI=u((cFr,eI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rI=ot(),A2r=ko(),Go=8;function O2r(r,e,t,i,a){var n,s,o,v,l,f;if(r<=0)return i;if(o=rI(e),v=rI(i),o.accessorProtocol||v.accessorProtocol)return t<0?n=(1-r)*t:n=0,a<0?s=(1-r)*a:s=0,A2r(r,o,t,n,v,a,s),v.data;if(t===1&&a===1){if(l=r%Go,l>0)for(f=0;f<l;f++)i[f]=e[f];if(r<Go)return i;for(f=l;f<r;f+=Go)i[f]=e[f],i[f+1]=e[f+1],i[f+2]=e[f+2],i[f+3]=e[f+3],i[f+4]=e[f+4],i[f+5]=e[f+5],i[f+6]=e[f+6],i[f+7]=e[f+7];return i}for(t<0?n=(1-r)*t:n=0,a<0?s=(1-r)*a:s=0,f=0;f<r;f++)i[s]=e[n],n+=t,s+=a;return i}eI.exports=O2r});var nI=u((pFr,aI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iI=ot(),I2r=ko(),ra=8;function S2r(r,e,t,i,a,n,s){var o,v,l,f,c,p;if(r<=0)return a;if(l=iI(e),f=iI(a),l.accessorProtocol||f.accessorProtocol)return I2r(r,l,t,i,f,n,s),f.data;if(o=i,v=s,t===1&&n===1){if(c=r%ra,c>0)for(p=0;p<c;p++)a[v]=e[o],o+=t,v+=n;if(r<ra)return a;for(p=c;p<r;p+=ra)a[v]=e[o],a[v+1]=e[o+1],a[v+2]=e[o+2],a[v+3]=e[o+3],a[v+4]=e[o+4],a[v+5]=e[o+5],a[v+6]=e[o+6],a[v+7]=e[o+7],o+=ra,v+=ra;return a}for(p=0;p<r;p++)a[v]=e[o],o+=t,v+=n;return a}aI.exports=S2r});var oI=u((mFr,sI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var N2r=N(),uI=tI(),L2r=nI();N2r(uI,"ndarray",L2r);sI.exports=uI});var lI=u((hFr,fI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var F2r=Sr(),vI=Hr();function P2r(r){return F2r(r)&&vI(r.get)&&vI(r.set)}fI.exports=P2r});var pI=u((gFr,cI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var R2r=lI();cI.exports=R2r});var hI=u((yFr,mI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var V2r=Tn(),M2r=En(),C2r=Sn(),j2r=In(),B2r=S();function k2r(r,e){if(V2r(r))return C2r(r,e);if(M2r(r))return j2r(r,e);throw new TypeError(B2r("invalid argument. First argument must be a complex-valued floating-point array. Value: `%s`.",r))}mI.exports=k2r});var yI=u((qFr,gI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var G2r=hI();gI.exports=G2r});var wI=u((wFr,qI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var H2r=He();function U2r(r,e){return new H2r(r.buffer,r.byteOffset+r.BYTES_PER_ELEMENT*e,r.length-e)}qI.exports=U2r});var bI=u((dFr,dI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var D2r=wI();dI.exports=D2r});var EI=u((bFr,_I)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var W2r=8,Y2r=16;function K2r(r){return typeof r=="object"&&r!==null&&(r.constructor.name==="Complex128Array"&&r.BYTES_PER_ELEMENT===Y2r||r.constructor.name==="Complex64Array"&&r.BYTES_PER_ELEMENT===W2r)}_I.exports=K2r});var AI=u((_Fr,TI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Q2r=EI();TI.exports=Q2r});var II=u((EFr,OI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Z2r=1;function J2r(r){return typeof r=="object"&&r!==null&&r.constructor.name==="BooleanArray"&&r.BYTES_PER_ELEMENT===Z2r}OI.exports=J2r});var NI=u((TFr,SI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var X2r=II();SI.exports=X2r});var FI=u((AFr,LI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $2r=Gi(),z2r=it(),x2r=_t(),r3r=Xi();function e3r(r){var e=r3r(r);return $2r(r)?z2r(e):x2r(e)}LI.exports=e3r});var ea=u((OFr,PI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var t3r=FI();PI.exports=t3r});var VI=u((IFr,RI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function i3r(r,e){return r===e?r===0?1/r===1/e:!0:r!==r&&e!==e}RI.exports=i3r});var CI=u((SFr,MI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var a3r=VI();MI.exports=a3r});var BI=u((NFr,jI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var n3r=Tr();function u3r(r){var e=new n3r(2);return e[0]=r.re,e[1]=r.im,e}jI.exports=u3r});var GI=u((LFr,kI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var s3r=BI();kI.exports=s3r});var WI=u((FFr,DI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var HI=CI(),UI=GI();function o3r(r,e){var t=UI(r),i=UI(e);return HI(t[0],i[0])&&HI(t[1],i[1])}DI.exports=o3r});var KI=u((PFr,YI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var v3r=WI();YI.exports=v3r});var JI=u((RFr,ZI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var f3r=KI(),QI=ee();function l3r(r,e){return r===e?r===0?1/r===1/e:!0:r!==r&&e!==e?!0:QI(r)&&QI(e)?f3r(r,e):!1}ZI.exports=l3r});var $I=u((VFr,XI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var c3r=JI();XI.exports=c3r});var xI=u((MFr,zI)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var p3r=pI(),m3r=ee(),h3r=Vr().isPrimitive,g3r=yI(),y3r=bI(),q3r=AI(),w3r=NI(),d3r=ea(),kn=$I(),b3r=ut(),_3r=st();function E3r(r,e,t){var i;for(i=t;i<r.length;i++)if(kn(e,r[i]))return i;return-1}function T3r(r,e,t){var i,a;for(i=d3r(r),a=t;a<r.length;a++)if(kn(e,i(r,a)))return a;return-1}function A3r(r,e,t){var i,a,n,s;if(!m3r(e))return-1;for(i=g3r(r,0),a=b3r(e),n=_3r(e),s=t*2;s<i.length;s+=2)if(kn(i[s],a)&&kn(i[s+1],n))return s/2;return-1}function O3r(r,e,t){var i,a,n;if(!h3r(e))return-1;for(i=y3r(r,0),a=e?1:0,n=t;n<i.length;n++)if(i[n]===a)return n;return-1}function I3r(r,e,t){return t<0&&(t+=r.length,t<0&&(t=0)),p3r(r)?q3r(r)?A3r(r,e,t):w3r(r)?O3r(r,e,t):T3r(r,e,t):E3r(r,e,t)}zI.exports=I3r});var eS=u((CFr,rS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var S3r=xI();rS.exports=S3r});var aS=u((jFr,iS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var N3r=Sr(),L3r=dr().isPrimitive,tS=hr().isPrimitive,F3r=eS(),Ho=S();function P3r(r,e,t){var i,a;if(i=tS(r),!N3r(r)&&!i)throw new TypeError(Ho("invalid argument. First argument must be array-like. Value: `%s`.",r));if(arguments.length<2)throw new Error("insufficient arguments. Must provide a search value.");if(arguments.length>2){if(!L3r(t))throw new TypeError(Ho("invalid argument. Third argument must be an integer. Value: `%s`.",t));a=t,a<0&&(a=0)}else a=0;if(i){if(!tS(e))throw new TypeError(Ho("invalid argument. Second argument must be a string. Value: `%s`.",e));return r.indexOf(e,a)!==-1}return F3r(r,e,a)!==-1}iS.exports=P3r});var Gn=u((BFr,nS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var R3r=aS();nS.exports=R3r});var fS=u((kFr,vS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uS=Er().isPrimitive,V3r=gr(),M3r=hr().isPrimitive,sS=B(),Uo=er(),C3r=Gn(),ei=S(),oS=["two-sided","less","greater"];function j3r(r,e){if(!V3r(e))return new TypeError(ei("invalid argument. Options argument must be an object. Value: `%s`.",e));if(Uo(e,"alpha")){if(r.alpha=e.alpha,!uS(r.alpha)||sS(r.alpha))return new TypeError(ei("invalid option. `%s` option must be a number. Option: `%s`.","alpha",r.alpha));if(r.alpha<0||r.alpha>1)return new RangeError(ei("invalid option. `%s` option must be a number on the interval: [0, 1]. Option: `%f`.","alpha",r.alpha))}if(Uo(e,"alternative")){if(r.alternative=e.alternative,!M3r(r.alternative))return new TypeError(ei("invalid option. `%s` option must be a string. Option: `%s`.","alternative",r.alternative));if(!C3r(oS,r.alternative))return new Error(ei('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"alternative",oS.join('", "'),r.alternative))}return Uo(e,"mu")&&(r.mu=e.mu,!uS(r.mu)||sS(r.mu))?new TypeError(ei("invalid option. `%s` option must be a number. Option: `%s`.","mu",r.mu)):null}vS.exports=j3r});var pS=u((GFr,cS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var B3r=be(),k3r=gr(),G3r=Vr().isPrimitive,lS=er(),Hn=ri(),Do=S();function H3r(r){var e,t,i;if(t=4,e=!0,arguments.length>0){if(!k3r(r))throw new TypeError(Do("invalid argument. First argument must be an object. Value: `%s`.",r));if(lS(r,"digits")){if(!B3r(r.digits))throw new TypeError(Do("invalid option. `%s` option must be a positive integer. Option: `%s`.","digits",r.digits));t=r.digits}if(lS(r,"decision")){if(!G3r(r.decision))throw new TypeError(Do("invalid option. `%s` option must be a boolean. Option: `%s`.","decision",r.decision));e=r.decision}}switch(i="",i+=this.method,i+=`

`,i+="Alternative hypothesis: ",this.method==="Paired t-test"?i+="True difference in means is ":i+="True mean is ",this.alternative){case"less":i+="less than ";break;case"greater":i+="greater than ";break;default:i+="not equal to ";break}return i+=this.nullValue,i+=`

`,i+="    pValue: "+Hn(this.pValue,-t)+`
`,i+="    statistic: "+Hn(this.statistic,-t)+`
`,i+="    df: "+this.df+`
`,i+="    "+(1-this.alpha)*100+"% confidence interval: ["+Hn(this.ci[0],-t)+","+Hn(this.ci[1],-t)+"]",i+=`

`,e&&(i+="Test Decision: ",this.rejected?i+="Reject null in favor of alternative at "+this.alpha*100+"% significance level":i+="Fail to reject null in favor of alternative at "+this.alpha*100+"% significance level",i+=`
`),i}cS.exports=H3r});var gS=u((HFr,hS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Wo=da().primitives,Yo=ba(),Qr=ct(),U3r=gr(),Ko=fn(),Qo=js(),Un=S(),D3r=Q(),W3r=k(),Y3r=To(),K3r=Io(),Q3r=oI(),Z3r=mr(),J3r=X(),X3r=Tr(),mS=fS(),$3r=pS();function z3r(r){var e,t,i,a,n,s,o,v,l,f,c,p,m;if(!Yo(r)&&!Wo(r))throw new TypeError(Un("invalid argument. First argument must be a numeric array. Value: `%s`.",r));if(v=r.length,v<2)throw new Error(Un("invalid argument. First argument must contain at least two elements. Value: `%s`.",r));if(n={mu:0,alpha:.05,alternative:"two-sided"},arguments.length===2){if(U3r(arguments[1])){if(o=mS(n,arguments[1]),o)throw o}else if(p=arguments[1],!Yo(p)&&!Wo(p))throw new TypeError(Un("invalid argument. Second argument must be either a numeric array or an options object. Value: `%s`.",p))}else if(arguments.length>2){if(p=arguments[1],!Yo(p)&&!Wo(p))throw new TypeError(Un("invalid argument. Second argument must be a numeric array. Value: `%s`.",p));if(o=mS(n,arguments[2]),o)throw o}if(p){if(p.length!==v)throw new Error("invalid arguments. First and second arguments must have the same length.");for(r=Q3r(v,r,1,new X3r(v),1),m=0;m<v;m++)r[m]-=p[m]}return e=D3r(K3r(v,1,r,1)/v),t=Y3r(v,r,1),s=(t-n.mu)/e,f=v-1,n.alternative==="two-sided"?(a=2*Ko(-W3r(s),f),c=Qo(1-n.alpha/2,f),i=[n.mu+(s-c)*e,n.mu+(s+c)*e]):n.alternative==="greater"?(a=1-Ko(s,f),c=Qo(1-n.alpha,f),i=[n.mu+(s-c)*e,J3r]):(a=Ko(s,f),c=Qo(1-n.alpha,f),i=[Z3r,n.mu+(s+c)*e]),l={},Qr(l,"rejected",a<=n.alpha),Qr(l,"alpha",n.alpha),Qr(l,"pValue",a),Qr(l,"statistic",s),Qr(l,"ci",i),Qr(l,"df",f),Qr(l,"nullValue",n.mu),Qr(l,"mean",t),Qr(l,"sd",e),Qr(l,"alternative",n.alternative),Qr(l,"method",p?"Paired t-test":"One-sample t-test"),Qr(l,"print",$3r),l}hS.exports=z3r});var qS=u((UFr,yS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var x3r=gS();yS.exports=x3r});var bS=u((DFr,dS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rpr=io(),wS=rpr();function epr(){return typeof wS.BigInt=="function"&&typeof BigInt=="function"&&typeof wS.BigInt("1")=="bigint"&&typeof BigInt("1")=="bigint"}dS.exports=epr});var ES=u((WFr,_S)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tpr=bS();_S.exports=tpr});var Dn=u((YFr,TS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function ipr(r){return Object.keys(Object(r))}TS.exports=ipr});var OS=u((KFr,AS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var apr=Dn();function npr(){return(apr(arguments)||"").length!==2}function upr(){return npr(1,2)}AS.exports=upr});var SS=u((QFr,IS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var spr=typeof Object.keys<"u";IS.exports=spr});var Zo=u((ZFr,NS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var opr=ur();function vpr(r){return opr(r)==="[object Arguments]"}NS.exports=vpr});var PS=u((JFr,FS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fpr=Zo(),LS;function lpr(){return fpr(arguments)}LS=lpr();FS.exports=LS});var Jo=u((XFr,RS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cpr=Object.prototype.propertyIsEnumerable;RS.exports=cpr});var CS=u(($Fr,MS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ppr=Jo(),VS;function mpr(){return!ppr.call("beep","0")}VS=mpr();MS.exports=VS});var BS=u((zFr,jS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hpr=hr(),gpr=Ot().isPrimitive,ypr=dr().isPrimitive,qpr=Jo(),wpr=CS();function dpr(r,e){var t;return r==null?!1:(t=qpr.call(r,e),!t&&wpr&&hpr(r)?(e=+e,!gpr(e)&&ypr(e)&&e>=0&&e<r.length):t)}jS.exports=dpr});var Wn=u((xFr,kS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var bpr=BS();kS.exports=bpr});var HS=u((rPr,GS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _pr=er(),Epr=Wn(),Tpr=Rr(),Apr=Ir(),Opr=U0();function Ipr(r){return r!==null&&typeof r=="object"&&!Tpr(r)&&typeof r.length=="number"&&Apr(r.length)&&r.length>=0&&r.length<=Opr&&_pr(r,"callee")&&!Epr(r,"callee")}GS.exports=Ipr});var $o=u((ePr,US)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Spr=PS(),Npr=Zo(),Lpr=HS(),Xo;Spr?Xo=Npr:Xo=Lpr;US.exports=Xo});var YS=u((tPr,WS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Fpr=$o(),DS=Dn(),Ppr=Array.prototype.slice;function Rpr(r){return Fpr(r)?DS(Ppr.call(r)):DS(r)}WS.exports=Rpr});var QS=u((iPr,KS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Vpr(){}KS.exports=Vpr});var JS=u((aPr,ZS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mpr=QS();ZS.exports=Mpr});var $S=u((nPr,XS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cpr=Wn(),jpr=JS(),Bpr=Cpr(jpr,"prototype");XS.exports=Bpr});var xS=u((uPr,zS)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kpr=Wn(),Gpr={toString:null},Hpr=!kpr(Gpr,"toString");zS.exports=Hpr});var iN=u((sPr,tN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rN=Ot(),Upr=Sr(),Dpr=hr().isPrimitive,Wpr=dr().isPrimitive,eN=S();function Ypr(r,e,t){var i,a;if(!Upr(r)&&!Dpr(r))throw new TypeError(eN("invalid argument. First argument must be an array-like object. Value: `%s`.",r));if(i=r.length,i===0)return-1;if(arguments.length===3){if(!Wpr(t))throw new TypeError(eN("invalid argument. Third argument must be an integer. Value: `%s`.",t));if(t>=0){if(t>=i)return-1;a=t}else a=i+t,a<0&&(a=0)}else a=0;if(rN(e)){for(;a<i;a++)if(rN(r[a]))return a}else for(;a<i;a++)if(r[a]===e)return a;return-1}tN.exports=Ypr});var Yn=u((oPr,aN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kpr=iN();aN.exports=Kpr});var zo=u((vPr,nN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Qpr(r){return r.constructor&&r.constructor.prototype===r}nN.exports=Qpr});var uN=u((fPr,Zpr)=>{Zpr.exports=["console","external","frame","frameElement","frames","innerHeight","innerWidth","outerHeight","outerWidth","pageXOffset","pageYOffset","parent","scrollLeft","scrollTop","scrollX","scrollY","self","webkitIndexedDB","webkitStorageInfo","window"]});var oN=u((lPr,sN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jpr=typeof window>"u"?void 0:window;sN.exports=Jpr});var cN=u((cPr,lN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xpr=er(),$pr=Yn(),vN=ao(),zpr=zo(),xpr=uN(),ti=oN(),fN;function r6r(){var r;if(vN(ti)==="undefined")return!1;for(r in ti)try{$pr(xpr,r)===-1&&Xpr(ti,r)&&ti[r]!==null&&vN(ti[r])==="object"&&zpr(ti[r])}catch{return!0}return!1}fN=r6r();lN.exports=fN});var mN=u((pPr,pN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var e6r=typeof window<"u";pN.exports=e6r});var yN=u((mPr,gN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var t6r=cN(),hN=zo(),i6r=mN();function a6r(r){if(i6r===!1&&!t6r)return hN(r);try{return hN(r)}catch{return!1}}gN.exports=a6r});var qN=u((hPr,n6r)=>{n6r.exports=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"]});var bN=u((gPr,dN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var u6r=dn(),xo=er(),s6r=$o(),o6r=$S(),v6r=xS(),f6r=yN(),wN=qN();function l6r(r){var e,t,i,a,n,s,o;if(a=[],s6r(r)){for(o=0;o<r.length;o++)a.push(o.toString());return a}if(typeof r=="string"){if(r.length>0&&!xo(r,"0"))for(o=0;o<r.length;o++)a.push(o.toString())}else{if(i=typeof r=="function",i===!1&&!u6r(r))return a;t=o6r&&i}for(n in r)!(t&&n==="prototype")&&xo(r,n)&&a.push(String(n));if(v6r)for(e=f6r(r),o=0;o<wN.length;o++)s=wN[o],!(e&&s==="constructor")&&xo(r,s)&&a.push(String(s));return a}dN.exports=l6r});var EN=u((yPr,_N)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var c6r=OS(),p6r=SS(),m6r=Dn(),h6r=YS(),g6r=bN(),Kn;p6r?c6r()?Kn=h6r:Kn=m6r:Kn=g6r;_N.exports=Kn});var rv=u((qPr,TN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var y6r=EN();TN.exports=y6r});var IN=u((wPr,ON)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var q6r=rv(),w6r=Rr(),d6r=gr(),b6r=dn(),_6r=Vr().isPrimitive,AN=er(),ev=S();function E6r(r,e){var t=!0,i,a,n,s,o,v,l;if(!b6r(r))throw new TypeError(ev("invalid argument. First argument must be an object (except null). Value: `%s`.",r));if(arguments.length>1){if(!d6r(e))throw new TypeError(ev("invalid argument. Options argument must be an object. Value: `%s`.",e));if(AN(e,"duplicates")&&(t=e.duplicates,!_6r(t)))throw new TypeError(ev("invalid option. `%s` option must be a boolean. Option: `%s`.","duplicates",t))}if(i=q6r(r),a=i.length,o={},t)for(l=0;l<a;l++){if(n=i[l],s=r[n],!AN(o,s)){o[s]=n;continue}v=o[s],w6r(v)?o[s].push(n):o[s]=[v,n]}else for(l=0;l<a;l++)n=i[l],o[r[n]]=n;return o}ON.exports=E6r});var NN=u((dPr,SN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var T6r=IN();SN.exports=T6r});var FN=u((bPr,LN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function A6r(){return{bool:0,int8:1,uint8:2,uint8c:3,int16:4,uint16:5,int32:6,uint32:7,int64:8,uint64:9,float16:10,float32:11,float64:12,complex32:13,complex64:14,complex128:15,binary:16,generic:17,notype:18,userdefined_type:256}}LN.exports=A6r});var ta=u((_Pr,PN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var O6r=FN();PN.exports=O6r});var VN=u((EPr,RN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var I6r=hr().isPrimitive,S6r=NN(),N6r=ta(),L6r=S6r(N6r(),{duplicates:!1});function F6r(r){var e=L6r[r];return I6r(e)?e:null}RN.exports=F6r});var Qn=u((TPr,MN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var P6r=VN();MN.exports=P6r});var CN=u((APr,R6r)=>{R6r.exports={binary:1,bool:1,complex64:8,complex128:16,float16:2,bfloat16:2,float32:4,float64:8,float128:16,generic:null,int8:1,int16:2,int32:4,int64:8,int128:16,int256:32,uint8:1,uint8c:1,uint16:2,uint32:4,uint64:8,uint128:16,uint256:32}});var kN=u((OPr,BN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var V6r=hr().isPrimitive,M6r=Er().isPrimitive,C6r=be().isPrimitive,j6r=Qn(),jN=CN();function B6r(r){var e;return V6r(r)?jN[r]||null:M6r(r)?jN[j6r(r)]||null:r&&(e=r.byteLength,C6r(e))?e:null}BN.exports=B6r});var tv=u((IPr,GN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var k6r=kN();GN.exports=k6r});var UN=u((SPr,HN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function G6r(r){var e,t;for(e=0,t=0;t<r.length;t++)r[t]<0&&(e+=1);return e===0?1:e===r.length?-1:0}HN.exports=G6r});var WN=u((NPr,DN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var H6r=UN();DN.exports=H6r});var QN=u((LPr,KN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YN=k();function U6r(r){var e,t,i,a,n,s;if(t=r.length,t===0)return 0;for(e=!0,i=!0,a=YN(r[0]),s=1;s<t;s++)if(n=YN(r[s]),e&&n<a?e=!1:i&&n>a&&(i=!1),i||e)a=n;else return 0;return i&&e?3:i?1:2}KN.exports=U6r});var JN=u((FPr,ZN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var D6r=QN();ZN.exports=D6r});var $N=u((PPr,XN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var W6r=ot(),Y6r=Array.prototype.slice;function K6r(r,e){return typeof r[e]=="function"}function Q6r(r,e,t){return Y6r.call(r,e,t)}function Z6r(r,e,t){var i,a,n,s;for(i=r.data,a=r.accessors[0],n=[],s=e;s<t;s++)n.push(a(i,s));return n}function J6r(r,e,t){var i;return K6r(r,"slice")?r.slice(e,t):(i=W6r(r),i.accessorProtocol?Z6r(i,e,t):Q6r(r,e,t))}XN.exports=J6r});var xN=u((RPr,zN)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var X6r=$N();zN.exports=X6r});var eL=u((VPr,rL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function $6r(r,e){return e&&(r===2||r===3)}rL.exports=$6r});var iL=u((MPr,tL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function z6r(r,e){return e&&(r===1||r===3)}tL.exports=z6r});var nL=u((CPr,aL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function x6r(r,e,t){var i,a,n,s,o;for(i=r.length,a=t,n=t,o=0;o<i;o++){if(r[o]===0)return[t,t];s=e[o],s>0?n+=s*(r[o]-1):s<0&&(a+=s*(r[o]-1))}return[a,n]}aL.exports=x6r});var sL=u((jPr,uL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function r4r(r,e,t,i){var a,n,s,o,v;for(a=r.length,n=t,s=t,v=0;v<a;v++){if(r[v]===0)return i[0]=t,i[1]=t,i;o=e[v],o>0?s+=o*(r[v]-1):o<0&&(n+=o*(r[v]-1))}return i[0]=n,i[1]=s,i}uL.exports=r4r});var iv=u((BPr,vL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var e4r=N(),oL=nL(),t4r=sL();e4r(oL,"assign",t4r);vL.exports=oL});var lL=u((kPr,fL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var i4r=iv();function a4r(r,e,t,i,a){var n;return r===0||a===0?!1:(n=i4r(e,t,i),r===n[1]-n[0]+1)}fL.exports=a4r});var pL=u((GPr,cL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function n4r(r){return{ROW_MAJOR_CONTIGUOUS:r.ROW_MAJOR_CONTIGUOUS,COLUMN_MAJOR_CONTIGUOUS:r.COLUMN_MAJOR_CONTIGUOUS,READONLY:r.READONLY}}cL.exports=n4r});var hL=u((HPr,mL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function u4r(r){return r==="column-major"}mL.exports=u4r});var ia=u((UPr,gL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var s4r=hL();gL.exports=s4r});var qL=u((DPr,yL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var o4r=ia();function v4r(r){var e,t,i,a,n,s;if(i=this._ndims,i===0)return this._accessors?this._buffer.get(this._offset):this._buffer[this._offset];if(this._flags.ROW_MAJOR_CONTIGUOUS||this._flags.COLUMN_MAJOR_CONTIGUOUS){if(this._iterationOrder===1)return this._accessors?this._buffer.get(this._offset+r):this._buffer[this._offset+r];if(this._iterationOrder===-1)return this._accessors?this._buffer.get(this.offset-r):this._buffer[this._offset-r]}if(t=this._shape,e=this._strides,a=this._offset,o4r(this._order)){for(s=0;s<i;s++)n=r%t[s],r-=n,r/=t[s],a+=n*e[s];return this._accessors?this._buffer.get(a):this._buffer[a]}for(s=i-1;s>=0;s--)n=r%t[s],r-=n,r/=t[s],a+=n*e[s];return this._accessors?this._buffer.get(a):this._buffer[a]}yL.exports=v4r});var dL=u((WPr,wL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var f4r=ia();function l4r(r,e){var t,i,a,n,s,o;if(a=this._ndims,a===0)return this._accessors?this._buffer.set(r,this._offset):this._buffer[this._offset]=r,this;if(this._flags.ROW_MAJOR_CONTIGUOUS||this._flags.COLUMN_MAJOR_CONTIGUOUS){if(this._iterationOrder===1)return this._accessors?this._buffer.set(e,this._offset+r):this._buffer[this._offset+r]=e,this;if(this._iterationOrder===-1)return this._accessors?this._buffer.set(e,this._offset-r):this._buffer[this._offset-r]=e,this}if(i=this._shape,t=this._strides,n=this._offset,f4r(this._order)){for(o=0;o<a;o++)s=r%i[o],r-=s,r/=i[o],n+=s*t[o];return this._accessors?this._buffer.set(e,n):this._buffer[n]=e,this}for(o=a-1;o>=0;o--)s=r%i[o],r-=s,r/=i[o],n+=s*t[o];return this._accessors?this._buffer.set(e,n):this._buffer[n]=e,this}wL.exports=l4r});var _L=u((YPr,bL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function c4r(){var r,e;for(r=this._offset,e=0;e<arguments.length-1;e++)r+=this._strides[e]*arguments[e];return this._accessors?this._buffer.set(arguments[e],r):this._buffer[r]=arguments[e],this}bL.exports=c4r});var TL=u((KPr,EL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function p4r(){var r,e;for(r=this._offset,e=0;e<arguments.length;e++)r+=this._strides[e]*arguments[e];return this._accessors?this._buffer.get(r):this._buffer[r]}EL.exports=p4r});var OL=u((QPr,AL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function m4r(){return this._ndims===0?this.iget():this}AL.exports=m4r});var SL=u((ZPr,IL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var h4r=ut(),g4r=st();function y4r(){var r,e,t,i;for(e=this._length,r={},r.type="ndarray",r.dtype=this.dtype,r.flags={READONLY:this._flags.READONLY},r.order=this._order,r.shape=this._shape.slice(),r.strides=this._strides.slice(),i=0;i<r.strides.length;i++)r.strides[i]<0&&(r.strides[i]*=-1);if(r.data=[],r.dtype==="complex64"||r.dtype==="complex128")for(i=0;i<e;i++)t=this.iget(i),r.data.push(h4r(t),g4r(t));else for(i=0;i<e;i++)r.data.push(this.iget(i));return r}IL.exports=y4r});var FL=u((JPr,LL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var q4r=hr().isPrimitive,w4r=S(),NL=/[-\/\\^$*+?.()|[\]{}]/g;function d4r(r){var e,t,i;if(!q4r(r))throw new TypeError(w4r("invalid argument. Must provide a regular expression string. Value: `%s`.",r));if(r[0]==="/")for(e=r.length,i=e-1;i>=0&&r[i]!=="/";i--);return i===void 0||i<=0?r.replace(NL,"\\$&"):(t=r.substring(1,i),t=t.replace(NL,"\\$&"),r=r[0]+t+r.substring(i),r)}LL.exports=d4r});var RL=u((XPr,PL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var b4r=FL();PL.exports=b4r});var ML=u(($Pr,VL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _4r=RegExp.prototype.exec;VL.exports=_4r});var jL=u((zPr,CL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var E4r=ML();function T4r(r){try{return E4r.call(r),!0}catch{return!1}}CL.exports=T4r});var kL=u((xPr,BL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var A4r=Ft(),O4r=ur(),I4r=jL(),S4r=A4r();function N4r(r){return typeof r=="object"?r instanceof RegExp?!0:S4r?I4r(r):O4r(r)==="[object RegExp]":!1}BL.exports=N4r});var HL=u((rRr,GL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var L4r=kL();GL.exports=L4r});var DL=u((eRr,UL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function F4r(r,e,t){return r.replace(e,t)}UL.exports=F4r});var av=u((tRr,WL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2022 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var P4r=DL();WL.exports=P4r});var KL=u((iRr,YL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var R4r=RL(),V4r=Hr(),nv=hr().isPrimitive,M4r=HL(),uv=S(),C4r=av();function j4r(r,e,t){if(!nv(r))throw new TypeError(uv("invalid argument. First argument must be a string. Value: `%s`.",r));if(nv(e))e=new RegExp(R4r(e),"g");else if(!M4r(e))throw new TypeError(uv("invalid argument. Second argument must be a string or regular expression. Value: `%s`.",e));if(!nv(t)&&!V4r(t))throw new TypeError(uv("invalid argument. Third argument must be a string or replacement function. Value: `%s`.",t));return C4r(r,e,t)}YL.exports=j4r});var ZL=u((aRr,QL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var B4r=KL();QL.exports=B4r});var XL=u((nRr,JL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var k4r=ZL(),sv=ut(),ov=st(),G4r={int8:"new Int8Array( [ {{data}} ] )",uint8:"new Uint8Array( [ {{data}} ] )",uint8c:"new Uint8ClampedArray( [ {{data}} ] )",int16:"new Int16Array( [ {{data}} ] )",uint16:"new Uint16Array( [ {{data}} ] )",int32:"new Int32Array( [ {{data}} ] )",uint32:"new Uint32Array( [ {{data}} ] )",float32:"new Float32Array( [ {{data}} ] )",float64:"new Float64Array( [ {{data}} ] )",generic:"[ {{data}} ]",binary:"new Buffer( [ {{data}} ] )",complex64:"new Complex64Array( [ {{data}} ] )",complex128:"new Complex128Array( [ {{data}} ] )",bool:"new BooleanArray( [ {{data}} ] )"};function H4r(){var r,e,t,i,a,n,s;if(e=this._shape.length,a=this._dtype,i="ndarray( '"+a+"', ",r="",this._length<=100)if(a==="complex64"||a==="complex128")for(s=0;s<this._length;s++)n=this.iget(s),r+=sv(n)+", "+ov(n),s<this._length-1&&(r+=", ");else for(s=0;s<this._length;s++)r+=this.iget(s),s<this._length-1&&(r+=", ");else{if(a==="complex64"||a==="complex128")for(s=0;s<3;s++)n=this.iget(s),r+=sv(n)+", "+ov(n),s<2&&(r+=", ");else for(s=0;s<3;s++)r+=this.iget(s),s<2&&(r+=", ");if(r+=", ..., ",a==="complex64"||a==="complex128")for(s=2;s>=0;s--)n=this.iget(this._length-1-s),r+=sv(n)+", "+ov(n),s>0&&(r+=", ");else for(s=2;s>=0;s--)r+=this.iget(this._length-1-s),s>0&&(r+=", ")}if(t=G4r[this.dtype],i+=k4r(t,"{{data}}",r),i+=", ",e===0?i+="[]":i+="[ "+this._shape.join(", ")+" ]",i+=", ",i+="[ ",e===0)i+="0";else for(s=0;s<e;s++)this._strides[s]<0?i+=-this._strides[s]:i+=this._strides[s],s<e-1&&(i+=", ");return i+=" ]",i+=", ",i+="0",i+=", ",i+="'"+this._order+"'",i+=" )",i}JL.exports=H4r});var zL=u((uRr,$L)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var U4r=typeof ArrayBuffer=="function"?ArrayBuffer:null;$L.exports=U4r});var rF=u((sRr,xL)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var D4r=Ui(),W4r=Tr(),Zn=zL();function Y4r(){var r,e,t;if(typeof Zn!="function")return!1;try{t=new Zn(16),r=D4r(t)&&typeof Zn.isView=="function",r&&(e=new W4r(t),e[0]=-3.14,e[1]=NaN,r=r&&Zn.isView(e)&&t.byteLength===16&&e[0]===-3.14&&e[1]!==e[1])}catch{r=!1}return r}xL.exports=Y4r});var tF=u((oRr,eF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var K4r=rF();eF.exports=K4r});var aF=u((vRr,iF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Q4r=typeof ArrayBuffer=="function"?ArrayBuffer:void 0;iF.exports=Q4r});var uF=u((fRr,nF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Z4r(){throw new Error("not implemented")}nF.exports=Z4r});var Jn=u((lRr,sF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var J4r=tF(),X4r=aF(),$4r=uF(),vv;J4r()?vv=X4r:vv=$4r;sF.exports=vv});var vF=u((cRr,oF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var z4r=ur(),x4r=typeof DataView=="function";function r5r(r){return x4r&&r instanceof DataView||z4r(r)==="[object DataView]"}oF.exports=r5r});var lF=u((pRr,fF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var e5r=vF();fF.exports=e5r});var pF=u((mRr,cF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var t5r=typeof DataView=="function"?DataView:null;cF.exports=t5r});var gF=u((hRr,hF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var i5r=lF(),a5r=Jn(),mF=pF();function n5r(){var r,e,t;if(typeof mF!="function")return!1;try{t=new a5r(24),e=new mF(t,8),r=i5r(e)&&typeof e.getFloat64=="function"&&typeof e.setFloat64=="function",r&&(e.setFloat64(0,-3.14),e.setFloat64(8,NaN),r=r&&e.buffer===t&&e.byteLength===16&&e.byteOffset===8&&e.getFloat64(0)===-3.14&&e.getFloat64(8)!==e.getFloat64(8))}catch{r=!1}return r}hF.exports=n5r});var qF=u((gRr,yF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var u5r=gF();yF.exports=u5r});var dF=u((yRr,wF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var s5r=typeof DataView=="function"?DataView:void 0;wF.exports=s5r});var _F=u((qRr,bF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function o5r(){throw new Error("not implemented")}bF.exports=o5r});var aa=u((wRr,EF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var v5r=qF(),f5r=dF(),l5r=_F(),fv;v5r()?fv=f5r:fv=l5r;EF.exports=fv});var AF=u((dRr,TF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var c5r=typeof BigInt=="function"?BigInt:void 0;TF.exports=c5r});var IF=u((bRr,OF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var p5r=AF();OF.exports=p5r});var SF=u((_Rr,m5r)=>{m5r.exports=["row-major","column-major"]});var LF=u((ERr,NF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var h5r=SF();function g5r(){return h5r.slice()}NF.exports=g5r});var FF=u((TRr,y5r)=>{y5r.exports=["row-major","column-major"]});var RF=u((ARr,PF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var q5r=FF();function w5r(){return q5r.slice()}PF.exports=w5r});var MF=u((ORr,VF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function d5r(){return{"row-major":101,"column-major":102}}VF.exports=d5r});var BF=u((IRr,jF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var b5r=N(),CF=RF(),_5r=MF();b5r(CF,"enum",_5r);jF.exports=CF});var HF=u((SRr,GF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var E5r=BF().enum,kF=E5r();function T5r(){return{"row-major":kF["row-major"],"column-major":kF["column-major"]}}GF.exports=T5r});var Xn=u((NRr,DF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var A5r=N(),UF=LF(),O5r=HF();A5r(UF,"enum",O5r);DF.exports=UF});var WF=u((LRr,I5r)=>{I5r.exports=["throw","normalize","clamp","wrap"]});var KF=u((FRr,YF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var S5r=WF();function N5r(){return S5r.slice()}YF.exports=N5r});var ZF=u((PRr,QF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function L5r(){return{throw:1,clamp:2,wrap:3,normalize:4}}QF.exports=L5r});var $n=u((RRr,XF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var F5r=N(),JF=KF(),P5r=ZF();F5r(JF,"enum",P5r);XF.exports=JF});var xF=u((VRr,zF)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vt=$r(),R5r=Jn(),V5r=aa(),na=IF(),M5r=ta(),C5r=Xn().enum,j5r=$n().enum,B5r=M5r(),k5r=C5r(),$F=j5r();function G5r(){var r,e,t,i,a,n,s,o,v,l,f,c,p,m;if(v=this._mode||"throw",s=this._submode||[v],c=this._ndims,p=s.length,t=33+c*16+p,o=this.__meta_dataview__,o&&o.byteLength===t)return o;for(o=new V5r(new R5r(t)),a=this._shape,n=this._strides,i=this._dtype,r=this._bytesPerElement,l=0,o.setInt8(l,vt?1:0),l+=1,o.setInt16(l,B5r[i],vt),l+=2,o.setBigInt64(l,na(c),vt),f=c*8,l+=8,m=0;m<c;m++)o.setBigInt64(l,na(a[m]),vt),o.setBigInt64(l+f,na(n[m]*r),vt),l+=8;for(l+=f,o.setBigInt64(l,na(this._offset*r),vt),l+=8,o.setInt8(l,k5r[this._order]),l+=1,o.setInt8(l,$F[v]),l+=1,o.setBigInt64(l,na(p),vt),l+=8,m=0;m<p;m++)o.setInt8(l,$F[s[m]]),l+=1;return e=0,e|=this._flags.READONLY?4:0,o.setInt32(l,e,vt),this.__meta_dataview__=o,o}zF.exports=G5r});var eP=u((MRr,rP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ua=$r(),H5r=He(),U5r=aa(),D5r=vr(),W5r=4294967295,Y5r=4294967296;function K5r(r){var e,t,i,a;return e=new H5r(8),r===0||(a=(r&W5r)>>>0,i=D5r(r/Y5r),t=new U5r(e.buffer),ua?(t.setUint32(0,a,ua),t.setUint32(4,i,ua)):(t.setUint32(0,i,ua),t.setUint32(4,a,ua))),e}rP.exports=K5r});var iP=u((CRr,tP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var sa=$r(),Q5r=He(),Z5r=aa(),J5r=vr(),X5r=4294967295,$5r=4294967296,xn=new Q5r(8),zn=new Z5r(xn.buffer);function z5r(r,e,t,i){var a,n,s;if(r===0){for(s=0;s<xn.length;s++)e[i]=0,i+=t;return e}for(n=(r&X5r)>>>0,a=J5r(r/$5r),sa?(zn.setUint32(0,n,sa),zn.setUint32(4,a,sa)):(zn.setUint32(0,a,sa),zn.setUint32(4,n,sa)),s=0;s<xn.length;s++)e[i]=xn[s],i+=t;return e}tP.exports=z5r});var uP=u((jRr,nP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var x5r=N(),aP=eP(),r8r=iP();x5r(aP,"assign",r8r);nP.exports=aP});var vP=u((BRr,oP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lv=$r(),e8r=Jn(),t8r=aa(),i8r=He(),a8r=ta(),n8r=Xn().enum,u8r=$n().enum,oa=uP().assign,s8r=a8r(),o8r=n8r(),sP=u8r();function v8r(){var r,e,t,i,a,n,s,o,v,l,f,c,p,m,h;if(l=this._mode||"throw",o=this._submode||[l],p=this._ndims,m=o.length,i=33+p*16+m,v=this.__meta_dataview__,v&&v.byteLength===i)return v;for(v=new t8r(new e8r(i)),e=new i8r(v.buffer),n=this._shape,s=this._strides,a=this._dtype,r=this._bytesPerElement,f=0,v.setInt8(f,lv?1:0),f+=1,v.setInt16(f,s8r[a],lv),f+=2,oa(p,e,1,f),c=p*8,f+=8,h=0;h<p;h++)oa(n[h],e,1,f),oa(s[h]*r,e,1,f+c),f+=8;for(f+=c,oa(this._offset*r,e,1,f),f+=8,v.setInt8(f,o8r[this._order]),f+=1,v.setInt8(f,sP[l]),f+=1,oa(m,e,1,f),f+=8,h=0;h<m;h++)v.setInt8(f,sP[o[h]]),f+=1;return t=0,t|=this._flags.READONLY?4:0,v.setInt32(f,t,lv),this.__meta_dataview__=v,v}oP.exports=v8r});var cP=u((kRr,lP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var f8r=ES(),Be=N(),se=Tt(),l8r=tv(),c8r=WN(),p8r=JN(),fP=xN(),m8r=Et(),h8r=eL(),g8r=iL(),y8r=lL(),q8r=pL(),w8r=qL(),d8r=dL(),b8r=_L(),_8r=TL(),E8r=OL(),T8r=SL(),A8r=XL(),O8r=xF(),I8r=vP();function ar(r,e,t,i,a,n){var s,o,v,l,f;if(!(this instanceof ar))return new ar(r,e,t,i,a,n);for(l=1,f=0;f<t.length;f++)l*=t[f];return e.BYTES_PER_ELEMENT?o=e.BYTES_PER_ELEMENT*l:o=null,this._byteLength=o,this._bytesPerElement=l8r(r),this._buffer=e,this._dtype=r,this._length=l,this._ndims=t.length,this._offset=a,this._order=n,this._shape=t,this._strides=i,this._accessors=m8r(e.get&&e.set),this._iterationOrder=c8r(i),s=y8r(l,t,i,a,this._iterationOrder),v=p8r(i),this._flags={ROW_MAJOR_CONTIGUOUS:g8r(v,s),COLUMN_MAJOR_CONTIGUOUS:h8r(v,s),READONLY:!1},this.__meta_dataview__=null,this}Be(ar,"name","ndarray");se(ar.prototype,"byteLength",function(){return this._byteLength});se(ar.prototype,"BYTES_PER_ELEMENT",function(){return this._bytesPerElement});se(ar.prototype,"data",function(){return this._buffer});se(ar.prototype,"dtype",function(){return this._dtype});se(ar.prototype,"flags",function(){return q8r(this._flags)});se(ar.prototype,"length",function(){return this._length});se(ar.prototype,"ndims",function(){return this._ndims});se(ar.prototype,"offset",function(){return this._offset});se(ar.prototype,"order",function(){return this._order});se(ar.prototype,"shape",function(){return fP(this._shape,0,this._shape.length)});se(ar.prototype,"strides",function(){return fP(this._strides,0,this._strides.length)});Be(ar.prototype,"get",_8r);Be(ar.prototype,"iget",w8r);Be(ar.prototype,"set",b8r);Be(ar.prototype,"iset",d8r);Be(ar.prototype,"toString",A8r);Be(ar.prototype,"toJSON",T8r);Be(ar.prototype,"valueOf",E8r);Be(ar.prototype,"__array_meta_dataview__",f8r()?O8r:I8r);lP.exports=ar});var va=u((GRr,pP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var S8r=cP();pP.exports=S8r});var hP=u((HRr,mP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var N8r=va();function L8r(r){return r instanceof N8r||r!==null&&typeof r=="object"&&typeof r.data=="object"&&typeof r.shape=="object"&&typeof r.strides=="object"&&typeof r.offset=="number"&&typeof r.order=="string"&&typeof r.ndims=="number"&&r.dtype&&typeof r.length=="number"&&typeof r.flags=="object"&&typeof r.get=="function"&&typeof r.set=="function"}mP.exports=L8r});var yP=u((URr,gP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var F8r=hP();gP.exports=F8r});var wP=u((DRr,qP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function P8r(r,e,t,i,a){var n,s,o,v,l,f;if(s=e[1],o=e[0],n=[],t){for(v=0;v<s;v++)for(l=0;l<o;l++)n.push(i.call(a,r[l][v],[l,v],r));return n}for(l=0;l<o;l++)for(f=r[l],v=0;v<s;v++)n.push(i.call(a,f[v],[l,v],r));return n}qP.exports=P8r});var bP=u((WRr,dP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function R8r(r,e,t,i,a,n,s,o){var v,l,f,c,p,m;if(v=e[1],l=e[0],m=n,t){for(f=0;f<v;f++)for(c=0;c<l;c++)i[m]=s.call(o,r[c][f],[c,f],r),m+=a;return i}for(c=0;c<l;c++)for(p=r[c],f=0;f<v;f++)i[m]=s.call(o,p[f],[c,f],r),m+=a;return i}dP.exports=R8r});var TP=u((YRr,EP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var V8r=N(),_P=wP(),M8r=bP();V8r(_P,"assign",M8r);EP.exports=_P});var SP=u((KRr,IP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var cv=Ce(),C8r=S();function AP(r,e){var t=e[0];return cv(t)&&(r.push(t.length),AP(r,t)),r}function OP(r,e,t,i,a){var n,s,o;for(n=e[t],o=0;o<i.length;o++){if(s=i[o],!cv(s)||s.length!==n)return t;if(a&&(s=OP(r,e,t+1,s,t+1<r-1),s<r))return s}return r}function j8r(r){var e,t;if(!cv(r))throw new TypeError(C8r("invalid argument. Must provide an array-like object. Value: `%s`.",r));return e=[r.length],AP(e,r),t=e.length,t>1&&(e.length=OP(t,e,1,r,t>2)),e}IP.exports=j8r});var LP=u((QRr,NP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var B8r=SP();NP.exports=B8r});var RP=u((ZRr,PP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pv=ke(),FP=N(),mv=qa(),k8r=mv(pv.isPrimitive),G8r=mv(pv.isObject),hv=mv(pv);FP(hv,"primitives",k8r);FP(hv,"objects",G8r);PP.exports=hv});var CP=u((JRr,MP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var gv=dr(),VP=N(),yv=qa(),H8r=yv(gv.isPrimitive),U8r=yv(gv.isObject),qv=yv(gv);VP(qv,"primitives",H8r);VP(qv,"objects",U8r);MP.exports=qv});var BP=u((XRr,jP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var D8r=Gi(),W8r=it(),Y8r=_t(),K8r=Xi();function Q8r(r,e){var t,i,a,n;for(a=K8r(r),D8r(r)?i=W8r(a):i=Y8r(a),t=r.length,n=0;n<t;n++)if(i(r,n)===e)return!0;return!1}jP.exports=Q8r});var GP=u(($Rr,kP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Z8r=Sr(),J8r=Gi(),X8r=it(),$8r=Xi(),z8r=S();function x8r(r){var e,t,i;if(!Z8r(r))throw new TypeError(z8r("invalid argument. Must provide an array-like object. Value: `%s`.",r));return i=$8r(r),J8r(r)&&(e=X8r(i)),t=r.length,e===void 0?a:n;function a(s){var o;for(o=0;o<t;o++)if(r[o]===s)return!0;return!1}function n(s){var o;for(o=0;o<t;o++)if(e(r,o)===s)return!0;return!1}}kP.exports=x8r});var ii=u((zRr,UP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var rmr=N(),HP=BP(),emr=GP();rmr(HP,"factory",emr);UP.exports=HP});var WP=u((xRr,DP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var tmr=ii().factory,imr=Xn(),amr=tmr(imr());DP.exports=amr});var KP=u((rVr,YP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var nmr=WP();YP.exports=nmr});var QP=u((eVr,umr)=>{umr.exports={all:["binary","bool","complex32","complex64","complex128","float16","float32","float64","generic","int16","int32","int8","uint16","uint32","uint8","uint8c"],typed:["binary","bool","complex32","complex64","complex128","float16","float32","float64","int16","int32","int8","uint16","uint32","uint8","uint8c"],floating_point:["complex32","complex64","complex128","float16","float32","float64"],real_floating_point:["float16","float32","float64"],complex_floating_point:["complex32","complex64","complex128"],boolean:["bool"],integer:["int16","int32","int8","uint16","uint32","uint8","uint8c"],signed_integer:["int16","int32","int8"],unsigned_integer:["uint16","uint32","uint8","uint8c"],real:["float16","float32","float64","int16","int32","int8","uint16","uint32","uint8","uint8c"],numeric:["complex32","complex64","complex128","float16","float32","float64","int16","int32","int8","uint16","uint32","uint8","uint8c"],index:["int32","uint8","bool","generic"],integer_index:["int32"],boolean_index:["bool"],mask_index:["uint8"],typed_index:["int32","uint8","bool"]}});var $P=u((tVr,XP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var smr=av(),ZP=QP(),JP=/_and_generic$/;function omr(){var r,e,t;return arguments.length===0?ZP.all.slice():(t=!1,r=arguments[0],JP.test(r)&&(r=smr(r,JP,""),r!=="all"&&r!=="index"&&(t=!0)),e=ZP[r],e=e?e.slice():[],t&&e.length>0&&e.push("generic"),e)}XP.exports=omr});var xP=u((iVr,zP)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vmr=$P();zP.exports=vmr});var eR=u((aVr,rR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var fmr=ii().factory,lmr=xP(),cmr=fmr(lmr());rR.exports=cmr});var wv=u((nVr,tR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var pmr=eR();tR.exports=pmr});var aR=u((uVr,iR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function mmr(r,e){return r==null?!1:typeof e=="symbol"?e in Object(r):String(e)in Object(r)}iR.exports=mmr});var dv=u((sVr,nR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hmr=aR();nR.exports=hmr});var vR=u((oVr,oR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uR=be().isPrimitive,ai=Hr(),sR=er();function gmr(r){return ai(r)&&uR(r.alignment)&&uR(r.byteLength)&&ai(r.byteLengthOf)&&ai(r.byteOffsetOf)&&ai(r.bufferOf)&&ai(r.isStruct)&&ai(r.viewOf)&&sR(r,"fields")&&sR(r,"layout")}oR.exports=gmr});var r0=u((vVr,fR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ymr=vR();fR.exports=ymr});var cR=u((fVr,lR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var qmr=Er().isPrimitive,wmr=ta(),dmr=wmr();function bmr(r){var e=dmr[r];return qmr(e)?e:null}lR.exports=bmr});var bv=u((lVr,pR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var _mr=cR();pR.exports=_mr});var gR=u((cVr,hR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Emr=r0(),Tmr=dr().isPrimitive,Amr=Qn(),mR=bv();function Omr(r){var e=typeof r;return e==="number"?Amr(r)?r:null:e==="string"?mR(r):e==="object"&&r&&Tmr(r.enum)?r.enum:Emr(r)?mR("userdefined_type"):null}hR.exports=Omr});var qR=u((pVr,yR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Imr=gR();yR.exports=Imr});var dR=u((mVr,wR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Smr=r0(),Nmr=Qn(),Lmr=bv();function Fmr(r){var e=typeof r;return e==="string"?Lmr(r)===null?null:r:e==="number"?Nmr(r):e==="object"&&r?String(r):Smr(r)?r.layout:null}wR.exports=Fmr});var e0=u((hVr,bR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pmr=dR();bR.exports=Pmr});var ER=u((gVr,_R)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Rmr(){return{binary:"byte",bool:"boolean",complex32:"half-precision floating-point complex number",complex64:"single-precision floating-point complex number",complex128:"double-precision floating-point complex number",float16:"half-precision floating-point number",bfloat16:"brain floating-point number",float32:"single-precision floating-point number",float64:"double-precision floating-point number",float128:"quadruple-precision floating-point number",generic:"generic array value",int8:"signed 8-bit integer",int16:"signed 16-bit integer",int32:"signed 32-bit integer",int64:"signed 64-bit integer",int128:"signed 128-bit integer",int256:"signed 256-bit integer",uint8:"unsigned 8-bit integer",uint8c:"unsigned 8-bit integer (clamped)",uint16:"unsigned 16-bit integer",uint32:"unsigned 32-bit integer",uint64:"unsigned 64-bit integer",uint128:"unsigned 128-bit integer",uint256:"unsigned 256-bit integer"}}_R.exports=Rmr});var OR=u((yVr,AR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Vmr=e0(),TR=ER(),_v;function Mmr(r){return arguments.length===0?TR():(_v===void 0&&(_v=TR()),_v[Vmr(r)]||null)}AR.exports=Mmr});var SR=u((qVr,IR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Cmr=OR();IR.exports=Cmr});var LR=u((wVr,NR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2021 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function jmr(){return{binary:"r",bool:"x",complex32:"j",complex64:"c",complex128:"z",float16:"h",bfloat16:"e",float32:"f",float64:"d",float128:"g",generic:"o",int8:"s",int16:"k",int32:"i",int64:"l",int128:"m",int256:"n",uint8:"b",uint8c:"a",uint16:"t",uint32:"u",uint64:"v",uint128:"w",uint256:"y"}}NR.exports=jmr});var RR=u((dVr,PR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Bmr=e0(),FR=LR(),Ev;function kmr(r){return arguments.length===0?FR():(Ev===void 0&&(Ev=FR()),Ev[Bmr(r)]||null)}PR.exports=kmr});var MR=u((bVr,VR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Gmr=RR();VR.exports=Gmr});var jR=u((_Vr,CR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function Hmr(){return{binary:1,bool:1,complex32:2,complex64:4,complex128:8,float16:2,bfloat16:2,float32:4,float64:8,float128:16,generic:null,int8:1,int16:2,int32:4,int64:8,int128:16,int256:32,uint8:1,uint8c:1,uint16:2,uint32:4,uint64:8,uint128:16,uint256:32}}CR.exports=Hmr});var GR=u((EVr,kR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Umr=be().isPrimitive,Dmr=e0(),BR=jR(),Tv;function Wmr(r){var e;return arguments.length===0?BR():(Tv===void 0&&(Tv=BR()),r?(e=r.alignment,Umr(e)?e:Tv[Dmr(r)]||null):null)}kR.exports=Wmr});var UR=u((TVr,HR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ymr=GR();HR.exports=Ymr});var WR=u((AVr,DR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Kmr=r0(),Qmr=gr(),t0=hr().isPrimitive,Zmr=wv(),Jmr=er(),Xmr=dv(),It=Tt(),Zr=N(),$mr=qR(),zmr=SR(),xmr=MR(),r7r=UR(),e7r=tv(),Av=S();function t7r(r){return r instanceof qr||typeof r=="object"&&r!==null&&r.constructor.name==="DataType"&&t0(r.char)&&t0(r.description)&&t0(r.byteOrder)&&Xmr(r,"value")}function qr(r,e){var t,i,a;if(t=arguments.length,!(this instanceof qr))return t<2?new qr(r):new qr(r,e);if(Zmr(r))i="builtin";else{if(t7r(r))return new qr(r.value,{description:r.description});if(Kmr(r))i="struct";else throw new TypeError(Av("invalid argument. First argument must be either a supported data type string, a struct constructor, or another data type instance. Value: `%s`.",r))}if(t>1){if(a=e,!Qmr(a))throw new TypeError(Av("invalid argument. Options argument must be an object. Value: `%s`.",a));if(Jmr(a,"description")&&!t0(a.description))throw new TypeError(Av("invalid option. `%s` option must be a string. Option: `%s`.","description",a.description))}else a={};return Zr(this,"_value",r),Zr(this,"_description",a.description||zmr(r)||""),Zr(this,"_char",xmr(r)||""),Zr(this,"_enum",$mr(r)||-1),Zr(this,"_alignment",r7r(r)||-1),Zr(this,"_byteLength",e7r(r)||-1),Zr(this,"_byteOrder","host"),Zr(this,"_type",i),this}Zr(qr,"name","DataType");It(qr.prototype,"alignment",function(){return this._alignment});It(qr.prototype,"byteLength",function(){return this._byteLength});It(qr.prototype,"byteOrder",function(){return this._byteOrder});It(qr.prototype,"char",function(){return this._char});It(qr.prototype,"description",function(){return this._description});It(qr.prototype,"enum",function(){return this._enum});It(qr.prototype,"value",function(){return this._value});Zr(qr.prototype,"toJSON",function(){return{type:"DataType",value:this.toString(),byteOrder:this._byteOrder,description:this._description}});Zr(qr.prototype,"toString",function(){return this._type==="struct"?this._value.layout:String(this._value)});Zr(qr.prototype,"valueOf",function(){return this.toString()});DR.exports=qr});var KR=u((OVr,YR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var i7r=WR();YR.exports=i7r});var JR=u((IVr,ZR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ov=dr().isPrimitive,QR=hr().isPrimitive,a7r=dv(),n7r=KR();function u7r(r){return r instanceof n7r||typeof r=="object"&&r!==null&&Ov(r.alignment)&&Ov(r.byteLength)&&QR(r.byteOrder)&&QR(r.char)&&Ov(r.enum)&&a7r(r,"value")}ZR.exports=u7r});var Iv=u((SVr,XR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var s7r=JR();XR.exports=s7r});var rV=u((NVr,xR)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var o7r=Iv(),$R=be().isPrimitive,fa=Hr();function zR(r){return fa(r)&&$R(r.alignment)&&$R(r.byteLength)&&fa(r.byteLengthOf)&&fa(r.byteOffsetOf)&&fa(r.bufferOf)&&fa(r.viewOf)||o7r(r)&&zR(r.value)}xR.exports=zR});var tV=u((LVr,eV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var v7r=rV();eV.exports=v7r});var aV=u((FVr,iV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var f7r=wv(),l7r=Iv(),c7r=tV();function p7r(r){return f7r(r)||l7r(r)||c7r(r)}iV.exports=p7r});var uV=u((PVr,nV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var m7r=aV();nV.exports=m7r});var oV=u((RVr,sV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var h7r=iv();function g7r(r,e,t,i){var a=h7r(e,t,i);return a[0]>=0&&a[1]<r}sV.exports=g7r});var fV=u((VVr,vV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var y7r=oV();vV.exports=y7r});var cV=u((MVr,lV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function q7r(r){var e,t,i;if(e=r.length,e===0)return 0;for(t=1,i=0;i<e;i++)t*=r[i];return t}lV.exports=q7r});var Sv=u((CVr,pV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var w7r=cV();pV.exports=w7r});var Nv=u((jVr,mV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function d7r(){return{dtypes:{default:"float64",numeric:"float64",real:"float64",floating_point:"float64",real_floating_point:"float64",complex_floating_point:"complex128",integer:"int32",signed_integer:"int32",unsigned_integer:"uint32",boolean:"bool",index:"int32",integer_index:"int32",boolean_index:"bool",mask_index:"uint8"},order:"row-major",casting:"safe",index_mode:"throw"}}mV.exports=d7r});var gV=u((BVr,hV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2024 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var b7r=Nv(),wr=b7r(),_7r={"dtypes.default":wr.dtypes.default,"dtypes.numeric":wr.dtypes.numeric,"dtypes.real":wr.dtypes.real,"dtypes.floating_point":wr.dtypes.floating_point,"dtypes.real_floating_point":wr.dtypes.real_floating_point,"dtypes.complex_floating_point":wr.dtypes.complex_floating_point,"dtypes.integer":wr.dtypes.integer,"dtypes.signed_integer":wr.dtypes.signed_integer,"dtypes.unsigned_integer":wr.dtypes.unsigned_integer,"dtypes.boolean":wr.dtypes.boolean,"dtypes.index":wr.dtypes.index,"dtypes.integer_index":wr.dtypes.integer_index,"dtypes.boolean_index":wr.dtypes.boolean_index,"dtypes.mask_index":wr.dtypes.mask_index,order:wr.order,casting:wr.casting,index_mode:wr.index_mode};function E7r(r){var e=_7r[r];return e===void 0?null:e}hV.exports=E7r});var wV=u((kVr,qV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var T7r=N(),yV=Nv(),A7r=gV();T7r(yV,"get",A7r);qV.exports=yV});var bV=u((GVr,dV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var O7r=S();function I7r(r){var e=typeof r;return r===null||e!=="object"&&e!=="function"?new TypeError(O7r("invalid argument. A provided constructor must be either an object (except null) or a function. Value: `%s`.",r)):null}dV.exports=I7r});var EV=u((HVr,_V)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/_V.exports=Object.create});var OV=u((UVr,AV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function TV(){}function S7r(r){return TV.prototype=r,new TV}AV.exports=S7r});var NV=u((DVr,SV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var IV=EV(),N7r=OV(),Lv;typeof IV=="function"?Lv=IV:Lv=N7r;SV.exports=Lv});var PV=u((WVr,FV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var L7r=oi(),F7r=S(),LV=bV(),P7r=NV();function R7r(r,e){var t=LV(r);if(t||(t=LV(e),t))throw t;if(typeof e.prototype>"u")throw new TypeError(F7r("invalid argument. Second argument must have a prototype from which another object can inherit. Value: `%s`.",e.prototype));return r.prototype=P7r(e.prototype),L7r(r.prototype,"constructor",{configurable:!0,enumerable:!1,writable:!0,value:r}),r}FV.exports=R7r});var VV=u((YVr,RV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var V7r=PV();RV.exports=V7r});var CV=u((KVr,MV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function M7r(r,e){return r<0?0:r>e?e:r}MV.exports=M7r});var Fv=u((QVr,jV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var C7r=CV();jV.exports=C7r});var kV=u((ZVr,BV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function j7r(r,e){var t=e+1;return r<0?(r+=t,r<0&&(r%=t,r!==0&&(r+=t)),r):(r>e&&(r-=t,r>e&&(r%=t)),r)}BV.exports=j7r});var Pv=u((JVr,GV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var B7r=kV();GV.exports=B7r});var UV=u((XVr,HV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function k7r(r,e){return r<0?(r+=e+1,r<0?-1:r):r>e?-1:r}HV.exports=k7r});var Rv=u(($Vr,DV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var G7r=UV();DV.exports=G7r});var YV=u((zVr,WV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var H7r=ii().factory,U7r=$n(),D7r=H7r(U7r());WV.exports=D7r});var Vv=u((xVr,KV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var W7r=YV();KV.exports=W7r});var ZV=u((rMr,QV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Y7r=Fv(),K7r=Pv(),Q7r=Rv(),Z7r=Vv(),Mv=S(),J7r={wrap:K7r,clamp:Y7r,normalize:$7r,throw:X7r};function X7r(r,e){if(r<0||r>e)throw new RangeError(Mv("invalid argument. Index must resolve to a value on the interval: [0, %d]. Value: `%d`.",e,r));return r}function $7r(r,e){var t=Q7r(r,e);if(t<0||t>e)throw new RangeError(Mv("invalid argument. Index must resolve to a value on the interval: [0, %d]. Value: `%d`.",e,r));return t}function z7r(r){if(!Z7r(r))throw new TypeError(Mv("invalid argument. First argument must be a recognized index mode. Value: `%s`.",r));return J7r[r]}QV.exports=z7r});var XV=u((eMr,JV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var x7r=Fv(),rhr=Pv(),ehr=Rv(),thr=S();function ihr(r,e,t){var i;if(t==="clamp")return x7r(r,e);if(t==="wrap")return rhr(r,e);if(i=r,t==="normalize"&&(i=ehr(i,e)),i<0||i>e)throw new RangeError(thr("invalid argument. Index must resolve to a value on the interval: [0, %d]. Value: `%d`.",e,r));return i}JV.exports=ihr});var la=u((tMr,zV)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ahr=N(),nhr=ZV(),$V=XV();ahr($V,"factory",nhr);zV.exports=$V});var eM=u((iMr,rM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var uhr=dr().isPrimitive,shr=la(),ohr=va(),vhr=S(),xV=ohr.prototype.iget;function fhr(r){if(this._ndims>0){if(!uhr(r))throw new TypeError(vhr("invalid argument. Index must be an integer. Value: `%s`.",r));return r=shr(r,this._length-1,this._mode),xV.call(this,r)}return xV.call(this)}rM.exports=fhr});var aM=u((aMr,iM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lhr=dr().isPrimitive,chr=la(),phr=va(),mhr=S(),tM=phr.prototype.iset;function hhr(r,e){if(this._flags.READONLY)throw new Error("invalid invocation. Cannot write to a read-only array.");if(this._ndims>0){if(!lhr(r))throw new TypeError(mhr("invalid argument. Index must be an integer. Value: `%s`.",r));r=chr(r,this._length-1,this._mode),tM.call(this,r,e)}else tM.call(this,r);return this}iM.exports=hhr});var sM=u((nMr,uM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ghr=dr().isPrimitive,yhr=la(),nM=S();function qhr(){var r,e,t,i;if(arguments.length!==this._ndims)throw new RangeError(nM("invalid arguments. Number of indices must match the number of dimensions. ndims: `%u`. nargs: `%u`.",this._ndims,arguments.length));for(r=this._offset,t=this._submode.length,i=0;i<arguments.length;i++){if(!ghr(arguments[i]))throw new TypeError(nM("invalid argument. Indices must be integer valued. Argument: `%u`. Value: `%s`.",i,arguments[i]));e=yhr(arguments[i],this._shape[i]-1,this._submode[i%t]),r+=this._strides[i]*e}return this._accessors?this._buffer.get(r):this._buffer[r]}uM.exports=qhr});var fM=u((uMr,vM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var whr=dr().isPrimitive,dhr=la(),oM=S();function bhr(){var r,e,t,i;if(this._flags.READONLY)throw new Error("invalid invocation. Cannot write to a read-only array.");if(arguments.length!==this._ndims+1)throw new RangeError(oM("invalid arguments. Number of indices must match the number of dimensions. ndims: `%u`. nargs: `%u`.",this._ndims,arguments.length));for(r=this._offset,t=this._submode.length,i=0;i<arguments.length-1;i++){if(!whr(arguments[i]))throw new TypeError(oM("invalid argument. Indices must be integer valued. Argument: `%i`. Value: `%s`.",i,arguments[i]));e=dhr(arguments[i],this._shape[i]-1,this._submode[i%t]),r+=this._strides[i]*e}return this._accessors?this._buffer.set(arguments[i],r):this._buffer[r]=arguments[i],this}vM.exports=bhr});var cM=u((sMr,lM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function _hr(r,e){var t,i;for(t=[],i=0;i<e;i++)t.push(r[i]);return t}lM.exports=_hr});var hM=u((oMr,mM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ehr=gr(),Cv=er(),Thr=Ce(),pM=Vv(),Ahr=Vr().isPrimitive,ni=S();function Ohr(r,e){var t;if(!Ehr(e))return new TypeError(ni("invalid argument. Options argument must be an object. Value: `%s`.",e));if(Cv(e,"mode")&&(r.mode=e.mode,!pM(r.mode)))return new TypeError(ni("invalid option. `%s` option must be a recognized mode. Option: `%s`.","mode",r.mode));if(Cv(e,"submode")){if(r.submode=e.submode,!Thr(r.submode))return new TypeError(ni("invalid option. `%s` option must be an array containing recognized modes. Option: `%s`.","submode",r.submode));if(r.submode.length===0)return new TypeError(ni("invalid option. `%s` option must be an array containing recognized modes. Option: `%s`.","submode",r.submode.join(",")));for(t=0;t<r.submode.length;t++)if(!pM(r.submode[t]))return new TypeError(ni("invalid option. Each submode must be a recognized mode. Option: `%s`.",r.submode[t]));r.submode=r.submode.slice()}return Cv(e,"readonly")&&(r.readonly=e.readonly,!Ahr(r.readonly))?new TypeError(ni("invalid option. `%s` option must be a boolean. Option: `%s`.","readonly",r.readonly)):null}mM.exports=Ohr});var _M=u((vMr,bM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ca=N(),gM=Sr(),Ihr=RP().primitives,Shr=ke().isPrimitive,Nhr=CP().primitives,yM=Hr(),Lhr=KP(),Fhr=uV(),Phr=fV(),Rhr=Sv(),dM=va(),Vhr=wV(),Mhr=VV(),_e=S(),Chr=eM(),jhr=aM(),Bhr=sM(),khr=fM(),qM=cM(),Ghr=hM(),wM=32767,Hhr=Vhr.get("index_mode"),Uhr=!1;function Ee(r,e,t,i,a,n,s){var o,v,l,f,c;if(!(this instanceof Ee))return arguments.length<7?new Ee(r,e,t,i,a,n):new Ee(r,e,t,i,a,n,s);if(!Fhr(r))throw new TypeError(_e("invalid argument. First argument must be a supported ndarray data type. Value: `%s`.",r));if(gM(e)){if(e.get&&e.set&&(!yM(e.get)||!yM(e.set)))throw new TypeError(_e("invalid argument. Second argument `get` and `set` properties must be functions. Value: `%s`.",e))}else throw new TypeError(_e("invalid argument. Second argument must be an array-like object, typed-array-like, or a Buffer. Value: `%s`.",e));if(!Ihr(t)&&(!gM(t)||t.length>0))throw new TypeError(_e("invalid argument. Third argument must be an array-like object containing nonnegative integers. Value: `%s`.",t));if(o=t.length,o>wM)throw new RangeError(_e("invalid argument. Number of dimensions must not exceed %u due to stack limits. Value: `%u`.",wM,o));if(!Nhr(i))throw new TypeError(_e("invalid argument. Fourth argument must be an array-like object containing integers. Value: `%s`.",i));if(o>0){if(i.length!==o)throw new RangeError(_e("invalid argument. Fourth argument length must match the number of dimensions. Expected number of dimensions: `%u`. Strides length: `%u`.",o,i.length))}else{if(i.length!==1)throw new RangeError("invalid argument. Fourth argument length must be equal to 1 when creating a zero-dimensional ndarray.");if(i[0]!==0)throw new RangeError(_e("invalid argument. Fourth argument must contain a single element equal to 0. Value: `%d`.",i[0]))}if(!Shr(a))throw new TypeError(_e("invalid argument. Fifth argument must be a nonnegative integer. Value: `%s`.",a));if(!Lhr(n))throw new TypeError(_e("invalid argument. Sixth argument must be a supported order. Value: `%s`.",n));if(o>0&&!Phr(e.length,t,i,a)&&Rhr(t)>0)throw new Error("invalid arguments. Input buffer is incompatible with the specified meta data. Ensure that the offset is valid with regard to the strides array and that the buffer has enough elements to satisfy the desired array shape.");if(v={},v.mode=Hhr,v.readonly=Uhr,arguments.length>6&&(l=Ghr(v,s),l))throw l;return this._mode=v.mode,v.submode===void 0&&(v.submode=[this._mode]),this._submode=v.submode,f=qM(t,o),c=qM(i,o||1),dM.call(this,r,e,f,c,a,n),this._flags.READONLY=v.readonly,this}Mhr(Ee,dM);ca(Ee,"name","ndarray");ca(Ee.prototype,"get",Bhr);ca(Ee.prototype,"iget",Chr);ca(Ee.prototype,"set",khr);ca(Ee.prototype,"iset",jhr);bM.exports=Ee});var TM=u((fMr,EM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Dhr=_M();EM.exports=Dhr});var OM=u((lMr,AM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Whr=ia(),Yhr=S();function Khr(r,e,t,i,a,n){var s,o,v,l,f;for(s=r.length,o=1,f=0;f<s;f++)o*=r[f];if(n==="clamp")a<0?a=0:a>=o&&(a=o-1);else if(n==="wrap")a<0?(a+=o,a<0&&(a%=o,a!==0&&(a+=o))):a>=o&&(a-=o,a>=o&&(a%=o));else if(n==="normalize"&&a<0&&(a+=o),a<0||a>=o)throw new RangeError(Yhr("invalid argument. Linear index must not exceed array dimensions. Number of array elements: `%u`. Value: `%d`.",o,a));if(v=t,Whr(i)){for(f=0;f<s;f++)l=a%r[f],a-=l,a/=r[f],v+=l*e[f];return v}for(f=s-1;f>=0;f--)l=a%r[f],a-=l,a/=r[f],v+=l*e[f];return v}AM.exports=Khr});var SM=u((cMr,IM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qhr=OM();IM.exports=Qhr});var jv=u((pMr,LM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var NM=ia(),i0=li(),Zhr=S();function Jhr(r,e,t,i,a,n,s){var o,v,l,f,c;for(o=r.length,v=1,c=0;c<o;c++)v*=r[c];if(n==="clamp")a<0?a=0:a>=v&&(a=v-1);else if(n==="wrap")a<0?(a+=v,a<0&&(a%=v,a!==0&&(a+=v))):a>=v&&(a-=v,a>=v&&(a%=v));else if(n==="normalize"&&a<0&&(a+=v),a<0||a>=v)throw new RangeError(Zhr("invalid argument. Linear index must not exceed array dimensions. Number of array elements: `%u`. Value: `%d`.",v,a));if(t===0){if(NM(i)){for(c=0;c<o;c++)f=a%r[c],a-=f,a/=r[c],s[c]=f;return s}for(c=o-1;c>=0;c--)f=a%r[c],a-=f,a/=r[c],s[c]=f;return s}if(NM(i)){for(c=o-1;c>=0;c--)f=e[c],f<0?(l=i0(a/f),a-=l*f,s[c]=r[c]-1+l):(l=i0(a/f),a-=l*f,s[c]=l);return s}for(c=0;c<o;c++)f=e[c],f<0?(l=i0(a/f),a-=l*f,s[c]=r[c]-1+l):(l=i0(a/f),a-=l*f,s[c]=l);return s}LM.exports=Jhr});var PM=u((mMr,FM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Xhr=Ma(),$hr=jv();function zhr(r,e,t,i,a,n){return $hr(r,e,t,i,a,n,Xhr(r.length))}FM.exports=zhr});var MM=u((hMr,VM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xhr=N(),RM=PM(),r9r=jv();xhr(RM,"assign",r9r);VM.exports=RM});var kv=u((gMr,CM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var e9r=vr(),t9r=128;function Bv(r,e,t,i){var a,n,s,o,v,l,f,c,p,m,h,g,w;if(r<=0)return 0;if(a=i,t===0)return r*e[a];if(r<8){for(h=e[a],a+=t,w=1;w<r;w++)h+=e[a],a+=t;return h}if(r<=t9r){for(n=e[a],s=e[a+t],o=e[a+2*t],v=e[a+3*t],l=e[a+4*t],f=e[a+5*t],c=e[a+6*t],p=e[a+7*t],a+=8*t,m=r%8,w=8;w<r-m;w+=8)n+=e[a],s+=e[a+t],o+=e[a+2*t],v+=e[a+3*t],l+=e[a+4*t],f+=e[a+5*t],c+=e[a+6*t],p+=e[a+7*t],a+=8*t;for(h=n+s+(o+v)+(l+f+(c+p));w<r;w++)h+=e[a],a+=t;return h}return g=e9r(r/2),g-=g%8,Bv(g,e,t,a)+Bv(r-g,e,t,a+g*t)}CM.exports=Bv});var BM=u((yMr,jM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var i9r=Me(),a9r=kv();function n9r(r,e,t){return a9r(r,e,t,i9r(r,t))}jM.exports=n9r});var HM=u((qMr,GM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var u9r=N(),kM=BM(),s9r=kv();u9r(kM,"ndarray",s9r);GM.exports=kM});var Gv=u((wMr,UM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var a0=5;function o9r(r,e,t,i,a){var n,s,o;if(r<=0||e===1)return t;if(n=a,i===1){if(s=r%a0,s>0)for(o=0;o<s;o++)t[n]*=e,n+=i;if(r<a0)return t;for(o=s;o<r;o+=a0)t[n]*=e,t[n+1]*=e,t[n+2]*=e,t[n+3]*=e,t[n+4]*=e,n+=a0;return t}for(o=0;o<r;o++)t[n]*=e,n+=i;return t}UM.exports=o9r});var WM=u((dMr,DM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var v9r=Me(),f9r=Gv();function l9r(r,e,t,i){var a=v9r(r,i);return f9r(r,e,t,i,a)}DM.exports=l9r});var QM=u((bMr,KM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var c9r=N(),YM=WM(),p9r=Gv();c9r(YM,"ndarray",p9r);KM.exports=YM});var Hv=u((_Mr,ZM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var n0=5;function m9r(r,e,t,i,a){var n,s,o;if(r<=0||e===0)return t;if(n=a,i===1){if(s=r%n0,s>0)for(o=0;o<s;o++)t[n]+=e,n+=i;if(r<n0)return t;for(o=s;o<r;o+=n0)t[n]+=e,t[n+1]+=e,t[n+2]+=e,t[n+3]+=e,t[n+4]+=e,n+=n0;return t}for(o=0;o<r;o++)t[n]+=e,n+=i;return t}ZM.exports=m9r});var XM=u((EMr,JM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var h9r=Me(),g9r=Hv();function y9r(r,e,t,i){return g9r(r,e,t,i,h9r(r,i))}JM.exports=y9r});var xM=u((TMr,zM)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var q9r=N(),$M=XM(),w9r=Hv();q9r($M,"ndarray",w9r);zM.exports=$M});var Uv=u((AMr,rC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var d9r=B(),b9r=Pa();function _9r(r,e,t,i){var a,n,s,o;if(r<=0)return NaN;if(r===1||t===0)return e[i];for(n=i,a=e[n],o=1;o<r;o++){if(n+=t,s=e[n],d9r(s))return s;(s<a||s===a&&b9r(s))&&(a=s)}return a}rC.exports=_9r});var tC=u((OMr,eC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var E9r=Me(),T9r=Uv();function A9r(r,e,t){return T9r(r,e,t,E9r(r,t))}eC.exports=A9r});var nC=u((IMr,aC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var O9r=N(),iC=tC(),I9r=Uv();O9r(iC,"ndarray",I9r);aC.exports=iC});var sC=u((SMr,uC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var S9r=Oi(),Dv=B(),N9r=X();function L9r(r,e,t){return Dv(r)||Dv(e)||Dv(t)||e<0||t<=0?NaN:e===0?r<0?0:1:r<=0?0:r===N9r?1:S9r(r*t,e)}uC.exports=L9r});var fC=u((NMr,vC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oC=B();function F9r(r,e){return oC(r)||oC(e)?NaN:r<e?0:1}vC.exports=F9r});var pC=u((LMr,cC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var P9r=dt(),lC=B();function R9r(r){if(lC(r))return P9r(NaN);return e;function e(t){return lC(t)?NaN:t<r?0:1}}cC.exports=R9r});var Wv=u((FMr,hC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var V9r=N(),mC=fC(),M9r=pC();V9r(mC,"factory",M9r);hC.exports=mC});var qC=u((PMr,yC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var C9r=dt(),j9r=Wv().factory,B9r=Oi(),gC=B(),k9r=X();function G9r(r,e){if(gC(r)||gC(e)||r<0||e<=0)return C9r(NaN);if(r===0)return j9r(0);return t;function t(i){return i<=0?0:i===k9r?1:B9r(i*e,r)}}yC.exports=G9r});var Yv=u((RMr,dC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var H9r=N(),wC=sC(),U9r=qC();H9r(wC,"factory",U9r);dC.exports=wC});var _C=u((VMr,bC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var D9r=Yv();function W9r(r,e){return D9r(r,e/2,.5)}bC.exports=W9r});var TC=u((MMr,EC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Y9r=Yv().factory;function K9r(r){return Y9r(r/2,.5)}EC.exports=K9r});var u0=u((CMr,OC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Q9r=N(),AC=_C(),Z9r=TC();Q9r(AC,"factory",Z9r);OC.exports=AC});var SC=u((jMr,IC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function J9r(){return{alpha:.05,correct:!0}}IC.exports=J9r});var FC=u((BMr,LC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var X9r=Vr().isPrimitive,$9r=Er().isPrimitive,z9r=gr(),x9r=Ot(),NC=er(),s0=S();function rgr(r,e){if(!z9r(e))return new TypeError(s0("invalid argument. Options argument must be an object. Value: `%s`.",e));if(NC(e,"alpha")){if(r.alpha=e.alpha,!$9r(r.alpha)||x9r(r.alpha))return new TypeError(s0("invalid option. `%s` option must be a number. Option: `%s`.","alpha",r.alpha));if(r.alpha<0||r.alpha>1)return new RangeError(s0("invalid option. `%s` option must be a number on the interval: [0, 1]. Value: `%s`.","alpha",r.alpha))}return NC(e,"correct")&&(r.correct=e.correct,!X9r(r.correct))?new TypeError(s0("invalid option. `%s` option must be a boolean. Option: `%s`.","correct",r.simulate)):null}LC.exports=rgr});var VC=u((kMr,RC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function PC(r,e,t,i,a,n){var s,o,v,l,f;if(n>=e.length)return r.accessors[0](r.data,i);for(v=[],l=e[n],s=t[n],f=0;f<l;f++)o=PC(r,e,t,i,a,n+1),v.push(o),i+=s;return v}RC.exports=PC});var CC=u((GMr,MC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var egr=ot(),tgr=VC();function igr(r,e,t,i,a){var n;if(e.length===0)return[];for(n=0;n<e.length;n++)if(e[n]===0)return[];return tgr(egr(r),e,t,i,a,0)}MC.exports=igr});var BC=u((HMr,jC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var agr=CC();jC.exports=agr});var UC=u((UMr,HC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ngr=be(),ugr=gr(),sgr=Vr().isPrimitive,kC=er(),GC=ri(),Qv=N(),ui=Tt(),ogr=BC(),Kv=S();function Jr(r,e,t,i,a){return this instanceof Jr?(this._pValue=r,this._alpha=e,this._statistic=t,this._df=i,this._expected=a,this):new Jr(r,e,t,i,a)}ui(Jr.prototype,"alpha",function(){return this._alpha});ui(Jr.prototype,"df",function(){return this._df});ui(Jr.prototype,"expected",function(){return this._expected});Qv(Jr.prototype,"method","Chi-square independence test");ui(Jr.prototype,"pValue",function(){return this._pValue});ui(Jr.prototype,"rejected",function(){return this._pValue<=this._alpha});ui(Jr.prototype,"statistic",function(){return this._statistic});Qv(Jr.prototype,"toString",function(e){var t,i,a;if(i=4,t=!0,arguments.length>0){if(!ugr(e))throw new TypeError(Kv("invalid argument. Must provide an object. Value: `%s`.",e));if(kC(e,"digits")){if(!ngr(e.digits))throw new TypeError(Kv("invalid option. `%s` option must be a positive integer. Option: `%s`.","digits",e.digits));i=e.digits}if(kC(e,"decision")){if(!sgr(e.decision))throw new TypeError(Kv("invalid option. `%s` option must be a boolean. Option: `%s`.","decision",e.decision));t=e.decision}}return a=[this.method,"","","Null hypothesis: the two variables are independent","","","    pValue: "+GC(this._pValue,-i),"    statistic: "+GC(this._statistic,-i),"    degrees of freedom: "+this._df,""],t&&(a.push("Test Decision: "+(this.rejected?"Reject":"Fail to reject")+" null in favor of alternative at "+this._alpha*100+"% significance level"),a.push("")),a.join(`
`)});Qv(Jr.prototype,"toJSON",function(){var e=this._expected;return{rejected:this.rejected,alpha:this._alpha,pValue:this._pValue,df:this._df,statistic:this._statistic,expected:ogr(e.data,e.shape,e.strides,e.offset,e.order),method:this.method}});HC.exports=Jr});var ZC=u((DMr,QC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var YC=ke().isPrimitive,vgr=yP(),fgr=Sr(),lgr=TP().assign,ma=Tr(),cgr=LP(),pgr=TM(),KC=Sv(),mgr=SM(),hgr=MM(),Zv=HM(),ggr=QM(),ygr=xM(),qgr=nC(),wgr=k(),dgr=Se(),pa=S(),bgr=u0(),_gr=SC(),Egr=FC(),Tgr=UC(),DC="throw";function Agr(r,e){if(!YC(r))throw new TypeError(pa("invalid argument. First argument must contain nonnegative integers. Indices: (%s). Value: `%s`.",e.join(", "),String(r)));return r}function Ogr(r,e){var t,i,a,n,s,o,v,l,f;for(i=r.data,n=r.order,s=r.strides,o=r.offset,v=KC(e),t=new ma(v),f=0;f<v;f++){if(a=mgr(e,s,o,n,f,DC),l=i[a],!YC(l))throw new TypeError(pa("invalid argument. First argument must contain nonnegative integers. Indices: (%s). Value: `%s`.",hgr(e,s,o,n,f,DC),String(l)));t[f]=l}return t}function WC(r,e,t,i){var a,n,s,o,v,l,f;for(i===0?(v=t,l=e,s=1,o=t):(v=e,l=t,s=t,o=1),n=new ma(l),a=0,f=0;f<l;f++)n[f]=Zv.ndarray(v,r,s,a),a+=o;return n}function Igr(r,e){var t,i,a,n,s,o,v;for(a=r.length,n=e.length,t=new ma(a*n),i=0,o=0;o<a;o++)for(s=r[o],v=0;v<n;v++)t[i]=s*e[v],i+=1;return t}function Sgr(r,e){var t,i;for(t=new ma(r.length),i=0;i<r.length;i++)t[i]=wgr(r[i]-e[i]);return t}function Ngr(r,e){var t;for(t=0;t<r.length;t++)r[t]=r[t]*r[t]/e[t];return Zv(r.length,r,1)}function Lgr(r,e){var t,i,a,n,s,o,v,l,f,c,p,m,h,g,w;if(vgr(r)){if(h=r.shape,h.length!==2)throw new TypeError(pa("invalid argument. First argument must be an array of arrays or a two-dimensional ndarray-like object. Number of input array dimensions: %u.",h.length));p=Ogr(r,h)}else if(fgr(r)){if(h=cgr(r),h.length!==2)throw new TypeError(pa("invalid argument. First argument must be an array of arrays or a two-dimensional ndarray-like object. Number of input array dimensions: %u.",h.length));p=new ma(KC(h)),lgr(r,h,!1,p,1,0,Agr)}else throw new TypeError(pa("invalid argument. First argument must be an array of arrays or a two-dimensional ndarray-like object. Value: `%s`.",r));if(o=_gr(),arguments.length>1&&(f=Egr(o,e),f))throw f;return g=h[0],w=h[1],c=Zv(g*w,p,1),n=WC(p,g,w,0),a=WC(p,g,w,1),s=Igr(n,a),s=ggr(s.length,1/c,s,1),i=Sgr(p,s),g===2&&w===2&&o.correct&&(t=dgr(.5,qgr(i.length,i,1)),ygr(i.length,-t,i,1)),l=Ngr(i,s),m=(g-1)*(w-1),v=1-bgr(l,m),s=new pgr("float64",s,[g,w],[w,1],0,"row-major",{readonly:!0}),new Tgr(v,o.alpha,l,m,s)}QC.exports=Lgr});var XC=u((WMr,JC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Fgr=ZC();JC.exports=Fgr});var xC=u((YMr,zC)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Pgr=Rr(),$C=ea();function Rgr(r,e){var t,i,a,n,s,o,v,l;if(a=r.length,e.length!==a)throw new RangeError("invalid argument. The first and second arguments must have the same length.");for(t=$C(r),i=$C(e),n={},l=0;l<a;l++)v=t(r,l),s=i(e,l).toString(),o=n[s],Pgr(o)?o.push(v):n[s]=[v];return n}zC.exports=Rgr});var ej=u((KMr,rj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Vgr=xC();rj.exports=Vgr});var ij=u((QMr,tj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Mgr=Rr(),Cgr=ea();function jgr(r,e){var t,i,a,n,s,o;if(i=r.length,e.length!==i)throw new RangeError("invalid argument. The first and second arguments must have the same length.");for(t=Cgr(e),a={},o=0;o<i;o++)n=t(e,o).toString(),s=a[n],Mgr(s)?s.push(o):a[n]=[o];return a}tj.exports=jgr});var nj=u((ZMr,aj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Bgr=ij();aj.exports=Bgr});var oj=u((JMr,sj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kgr=Rr(),uj=ea();function Ggr(r,e){var t,i,a,n,s,o,v,l;if(a=r.length,e.length!==a)throw new RangeError("invalid argument. The first and second arguments must have the same length.");for(t=uj(r),i=uj(e),n={},l=0;l<a;l++)v=t(r,l),s=i(e,l).toString(),o=n[s],kgr(o)?o.push([l,v]):n[s]=[[l,v]];return n}sj.exports=Ggr});var fj=u((XMr,vj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2023 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hgr=oj();vj.exports=Hgr});var mj=u(($Mr,pj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Ugr=gr(),Dgr=er(),Wgr=Yn(),lj=S(),cj=["values","indices","*"];function Ygr(r,e){return Ugr(e)?Dgr(e,"returns")&&(r.returns=e.returns,Wgr(cj,r.returns)===-1)?new TypeError(lj('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"returns",cj.join('", "'),r.returns)):null:new TypeError(lj("invalid argument. Options argument must be an object. Value: `%s`.",e))}pj.exports=Ygr});var qj=u((zMr,yj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var hj=Sr(),Kgr=ej(),Qgr=nj(),Zgr=fj(),gj=S(),Jgr=mj();function Xgr(r,e,t){var i,a,n;if(!hj(r))throw new TypeError(gj("invalid argument. First argument must be a collection. Value: `%s`.",r));if(i={returns:"values"},arguments.length===2)n=e;else{if(a=Jgr(i,e),a)throw a;n=t}if(!hj(n))throw new TypeError(gj("invalid argument. Last argument must be a collection. Value: `%s`.",n));if(r.length!==n.length)throw new RangeError("invalid arguments. First and last arguments must be the same length.");return i.returns==="values"?Kgr(r,n):i.returns==="indices"?Qgr(r,n):Zgr(r,n)}yj.exports=Xgr});var dj=u((xMr,wj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $gr=qj();wj.exports=$gr});var _j=u((rCr,bj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function zgr(r){var e,t,i,a,n,s;for(e=0,t=0,a=0,i=r.length,n=0;n<i;n++)s=r[n],e=s-t,t+=e/(n+1),a+=e*(s-t);return a/(n-1)}bj.exports=zgr});var Aj=u((eCr,Tj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var xgr=Rr(),ryr=Er().isPrimitive,eyr=gr(),tyr=Ot(),Ej=er(),Jv=S();function iyr(r,e){return eyr(e)?Ej(e,"alpha")&&(r.alpha=e.alpha,!ryr(r.alpha)||tyr(r.alpha))?new TypeError(Jv("invalid option. `%s` option must be a number. Option: `%s`.","alpha",r.alpha)):Ej(e,"groups")&&(r.groups=e.groups,!xgr(r.groups))?new TypeError(Jv("invalid option. `%s` option must be an array. Option: `%s`.","groups",r.groups)):null:new TypeError(Jv("invalid argument. Options argument must be an object. Value: `%s`.",e))}Tj.exports=iyr});var Sj=u((tCr,Ij)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ayr=be(),nyr=gr(),uyr=Vr().isPrimitive,Oj=er(),Xv=S(),$v=ri();function syr(r){var e,t,i;if(t=4,e=!0,arguments.length>0){if(!nyr(r))throw new TypeError(Xv("invalid argument. First argument must be an object. Value: `%s`.",r));if(Oj(r,"digits")){if(!ayr(r.digits))throw new TypeError(Xv("invalid option. `%s` option must be a positive integer. Option: `%s`.","digits",r.digits));t=r.digits}if(Oj(r,"decision")){if(!uyr(r.decision))throw new TypeError(Xv("invalid option. `%s` option must be a boolean. Option: `%s`.","decision",r.decision));e=r.decision}}return i="",i+=this.method,i+=`

`,i+="Null hypothesis: The variances in all groups are the same.",i+=`

`,i+="    pValue: "+$v(this.pValue,-t)+`
`,i+="    statistic: "+$v(this.statistic,-t)+`
`,i+="    df: "+$v(this.df,-t),i+=`

`,e&&(i+="Test Decision: ",this.rejected?i+="Reject null in favor of alternative at "+this.alpha*100+"% significance level":i+="Fail to reject null in favor of alternative at "+this.alpha*100+"% significance level",i+=`
`),i}Ij.exports=syr});var Fj=u((iCr,Lj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oyr=Sr(),vyr=gr(),St=ct(),fyr=rv(),o0=S(),lyr=u0(),cyr=dj(),Nj=J(),pyr=_j(),myr=Aj(),hyr=Sj();function gyr(){var r,e,t,i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q;if(v=[],e=arguments.length,l={},vyr(arguments[e-1])&&(r=arguments[e-1],e-=1,m=myr(l,r),m))throw m;if(l.groups){if(a=cyr(arguments[0],l.groups),i=fyr(a),e=i.length,e<2)throw new Error(o0("invalid option. `%s` option must be an array containing at least two unique elements. Option: `%s`.","groups",i));for(q=0;q<e;q++)v.push(a[i[q]])}else for(q=0;q<e;q++)v.push(arguments[q]);for(s=0,t=0,o=0,h=0,y=new Array(e),b=y.slice(),q=0;q<e;q++){if(p=v[q],!oyr(p))throw new TypeError(o0("invalid argument. Must provide array-like arguments. Value: `%s`.",p));if(p.length===0)throw new Error(o0("invalid argument. Supplied arrays cannot be empty. Value: `%s`.",p));y[q]=p.length-1,s+=y[q],t+=1/y[q],b[q]=pyr(p),o+=y[q]*b[q],h+=y[q]*Nj(b[q])}if(o/=s,l.alpha===void 0?n=.05:n=l.alpha,n<0||n>1)throw new RangeError(o0("invalid option. `%s` option must be a number on the interval: [0, 1]. Option: `%f`.","alpha",n));return c=s*Nj(o)-h,c/=1+(t-1/s)/(3*(e-1)),w=e-1,f=1-lyr(c,w),g={},St(g,"rejected",f<=n),St(g,"alpha",n),St(g,"pValue",f),St(g,"statistic",c),St(g,"df",w),St(g,"method","Bartlett's test of equal variances"),St(g,"print",hyr),g}Lj.exports=gyr});var Rj=u((aCr,Pj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var yyr=Fj();Pj.exports=yyr});var Mj=u((nCr,Vj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function qyr(r){var e,t,i;for(e=r.length,t=0,i=0;i<e;i++)t+=r[i];return t}Vj.exports=qyr});var jj=u((uCr,Cj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function wyr(r,e){return r<e?-1:r>e?1:0}function dyr(r){var e,t;for(e=[],t=0;t<r.length;t++)e.push(t);return e.sort(i);function i(a,n){return wyr(r[a],r[n])}}Cj.exports=dyr});var kj=u((sCr,Bj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var byr=Gn(),_yr=Pu();function Eyr(r,e){var t,i,a;for(t=r.length,i=_yr(!1,t),a=0;a<t;a++)i[a]=byr(e,r[a]);return i}Bj.exports=Eyr});var Yj=u((oCr,Wj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hj=ii().factory,Tyr=Rr(),Ayr=Xt(),Gj=hr().isPrimitive,zv=er(),v0=S(),Uj=["min","max","average","dense","ordinal"],Dj=["last","first","remove"],Oyr=Hj(Uj),Iyr=Hj(Dj);function Syr(r,e){return Ayr(e)?zv(e,"encoding")&&(r.encoding=e.encoding,!Tyr(r.encoding))?new TypeError(v0("invalid option. `%s` option must be an array. Option: `%s`.","encoding",r.encoding)):zv(e,"method")&&(r.method=e.method,!Gj(r.method)||!Oyr(r.method))?new TypeError(v0('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"method",Uj.join('", "'),r.method)):zv(e,"missing")&&(r.missing=e.missing,!Gj(r.missing)||!Iyr(r.missing))?new TypeError(v0('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"missing",Dj.join('", "'),r.missing)):null:new TypeError(v0("invalid argument. Options argument must be an object. Value: `%s`.",e))}Wj.exports=Syr});var Qj=u((vCr,Kj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Nyr=Sr(),Lyr=Gn(),Fyr=Ma(),Pyr=S(),Ryr=Mj(),Vyr=jj(),Myr=kj(),Cyr=Yj();function jyr(r,e){var t,i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q;if(!Nyr(r))throw new TypeError(Pyr("invalid argument. First argument must be an array-like object. Value: `%s`.",r));if(h={},arguments.length>1&&(w=Cyr(h,e),w))throw w;for(p=h.method||"average",o=h.encoding||[null,NaN],f=h.missing||"last",y=r.length,g=[],b=0;b<y;b++)Lyr(o,r[b])||g.push(r[b]);if(t=Myr(r,o),y=g.length,n=0,l=Vyr(g),m=Fyr(y),p==="ordinal")for(b=0;b<y;b++)m[l[b]]=b+1;else for(i=0,b=0;b<y;b++)if(v=b+1,b===y-1||g[l[b]]!==g[l[v]]){switch(p){case"min":c=v-i;break;case"max":c=v;break;case"dense":c=v-i-n,n+=i;break;default:c=v-.5*i;break}for(q=b-i;q<v;q++)m[l[q]]=c;i=0}else i+=1;if(f==="first"){for(a=Ryr(t),q=1,s=[],b=0;b<t.length;b++)t[b]?(s.push(q),q+=1):s.push(m.shift()+a);return s}if(f==="last"){for(s=[],b=0;b<t.length;b++)t[b]?s.push(b+m.length+1):s.push(m.shift());return s}return m}Kj.exports=jyr});var xv=u((fCr,Zj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Byr=Qj();Zj.exports=Byr});var Xj=u((lCr,Jj)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var kyr=di(),Gyr=Q(),rf=B();function Hyr(r,e,t){var i,a;return rf(r)||rf(e)||rf(t)||t<0?NaN:t===0?r<e?0:1:(i=t*Gyr(2),a=r-e,.5*kyr(-a/i))}Jj.exports=Hyr});var zj=u((cCr,$j)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Uyr=dt(),Dyr=Wv().factory,ef=B(),Wyr=Q(),Yyr=di();function Kyr(r,e){var t;if(ef(r)||ef(e)||e<0)return Uyr(NaN);if(e===0)return Dyr(r);return t=e*Wyr(2),i;function i(a){var n;return ef(a)?NaN:(n=a-r,.5*Yyr(-n/t))}}$j.exports=Kyr});var tf=u((pCr,rB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Qyr=N(),xj=Xj(),Zyr=zj();Qyr(xj,"factory",Zyr);rB.exports=xj});var tB=u((mCr,eB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Jyr=vr();function Xyr(r){return Jyr(r)===r&&r>0}eB.exports=Xyr});var af=u((hCr,iB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var $yr=tB();iB.exports=$yr});var nB=u((gCr,aB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var zyr=X(),xyr=mr();function rqr(r){return r===r&&r>xyr&&r<zyr}aB.exports=rqr});var nf=u((yCr,uB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var eqr=nB();uB.exports=eqr});var oB=u((qCr,sB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function tqr(r){return r}sB.exports=tqr});var fB=u((wCr,vB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var iqr=oB();vB.exports=iqr});var mB=u((dCr,pB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lB=Hr(),aqr=N(),nqr=fB(),uqr=er(),cB=S();function sqr(r,e){var t,i;if(!lB(r))throw new TypeError(cB("invalid argument. First argument must be a function. Value: `%s`.",r));if(arguments.length<2)t=nqr;else if(t=e,!lB(t))throw new TypeError(cB("invalid argument. Hash function argument must be a function. Value: `%s`.",t));return i={},aqr(a,"cache",i),a;function a(){var n,s,o,v;for(n=new Array(arguments.length),v=0;v<arguments.length;v++)n[v]=arguments[v];return o=t(n).toString(),uqr(i,o)?i[o]:(s=r.apply(null,n),i[o]=s,s)}}pB.exports=sqr});var gB=u((bCr,hB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var oqr=mB();hB.exports=oqr});var uf=u((_Cr,yB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var vqr=gB(),f0;function fqr(r,e){var t;return e===0?r===0?1:0:(t=e*(e+1)/2,r<0||r>t?0:(r>t/2&&(r=t-r),f0(r-e,e-1)+f0(r,e-1)))}f0=vqr(fqr);yB.exports=f0});var wB=u((ECr,qB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var lqr=af(),cqr=nf(),pqr=B(),mqr=Vt(),hqr=rr(),gqr=Fa(),yqr=uf();function qqr(r,e){var t,i,a,n;if(pqr(r)||!lqr(e)||!cqr(e))return NaN;if(r<0)return 0;if(r=mqr(r),t=e*(e+1)/2,r>=t)return 1;for(i=hqr(-e*gqr),n=0,a=0;a<=r;a++)n+=yqr(a,e)*i;return n}qB.exports=qqr});var bB=u((TCr,dB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var wqr=af(),dqr=dt(),bqr=nf(),_qr=Vt(),Eqr=B(),Tqr=rr(),Aqr=Fa(),Oqr=uf();function Iqr(r){var e,t;if(!wqr(r)||!bqr(r))return dqr(NaN);return t=Tqr(-r*Aqr),e=r*(r+1)/2,i;function i(a){var n,s;if(Eqr(a))return NaN;if(a<0)return 0;if(a=_qr(a),a>=e)return 1;for(s=0,n=0;n<=a;n++)s+=Oqr(n,r)*t;return s}}dB.exports=Iqr});var TB=u((ACr,EB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Sqr=N(),_B=wB(),Nqr=bB();Sqr(_B,"factory",Nqr);EB.exports=_B});var OB=u((OCr,AB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Lqr=Sr(),Fqr=Yn(),Pqr=S();function Rqr(r){var e,t,i,a,n,s,o;if(!Lqr(r))throw new TypeError(Pqr("invalid argument. First argument must be a collection. Value: `%s`.",r));for(e=0,t=[],a=[],i=r.length,s=0;s<i;s++)n=r[s],e+=1,o=Fqr(t,n),o===-1?(t.push(n),a.push([n,1,0])):a[o][1]+=1;for(i=a.length,s=0;s<i;s++)a[s][2]=a[s][1]/e;return a}AB.exports=Rqr});var SB=u((ICr,IB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2018 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Vqr=OB();IB.exports=Vqr});var CB=u((SCr,MB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var PB=ii().factory,NB=Vr().isPrimitive,LB=Er().isPrimitive,Mqr=gr(),FB=hr().isPrimitive,l0=Ot(),si=er(),Te=S(),RB=["two-sided","less","greater"],VB=["pratt","wilcox","zsplit"],Cqr=PB(RB),jqr=PB(VB);function Bqr(r,e){if(!Mqr(e))return new TypeError(Te("invalid argument. Options argument must be an object. Value: `%s`.",e));if(si(e,"alpha")){if(r.alpha=e.alpha,!LB(r.alpha)||l0(r.alpha))return new TypeError(Te("invalid option. `%s` option must be a number. Option: `%s`.","alpha",r.alpha));if(r.alpha<0||r.alpha>1)return new RangeError(Te("invalid option. `%s` option must be a number on the interval: [0, 1]. Option: `%f`.","alpha",r.alpha))}if(si(e,"alternative")){if(r.alternative=e.alternative,!FB(r.alternative))return new TypeError(Te("invalid option. `%s` option must be a string. Option: `%s`.","alternative",r.alternative));if(!Cqr(r.alternative))return new Error(Te('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"alternative",RB.join('", "'),r.alternative))}if(si(e,"correction")&&(r.correction=e.correction,!NB(r.correction)||l0(r.correction)))return new TypeError(Te("invalid option. `%s` option must be a boolean. Option: `%s`.","correction",r.alpha));if(si(e,"exact")&&(r.exact=e.exact,!NB(r.exact)||l0(r.exact)))return new TypeError(Te("invalid option. `%s` option must be a boolean. Option: `%s`.","exact",r.alpha));if(si(e,"mu")&&(r.mu=e.mu,!LB(r.mu)||l0(r.mu)))return new TypeError(Te("invalid option. `%s` option must be a number. Option: `%s`.","mu",r.mu));if(si(e,"zeroMethod")){if(r.zeroMethod=e.zeroMethod,!FB(r.zeroMethod))return new TypeError(Te("invalid option. `%s` option must be a string. Option: `%s`.","zeroMethod",r.alternative));if(!jqr(r.zeroMethod))return new Error(Te('invalid option. `%s` option must be one of the following: "%s". Option: `%s`.',"zeroMethod",VB.join('", "'),r.zeroMethod))}return null}MB.exports=Bqr});var BB=u((NCr,jB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/function kqr(r,e){return r-e}function Gqr(r){var e,t,i,a;for(r=r.slice(),r.sort(kqr),e=r.length,i=1,a=0;i<e;i++)t=r[i],r[a]!==t&&(a+=1,r[a]=t);return r.length=a+1,r}jB.exports=Gqr});var UB=u((LCr,HB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var Hqr=be(),Uqr=gr(),Dqr=Vr().isPrimitive,kB=er(),GB=ri(),sf=S();function Wqr(r){var e,t,i;if(t=4,e=!0,arguments.length>0){if(!Uqr(r))throw new TypeError(sf("invalid argument. First argument must be an object. Value: `%s`.",r));if(kB(r,"digits")){if(!Hqr(r.digits))throw new TypeError(sf("invalid option. `%s` option must be a positive integer. Option: `%s`.","digits",r.digits));t=r.digits}if(kB(r,"decision")){if(!Dqr(r.decision))throw new TypeError(sf("invalid option. `%s` option must be a boolean. Option: `%s`.","decision",r.decision));e=r.decision}}switch(i="",i+=this.method,i+=`

`,i+="Alternative hypothesis: ",this.method==="Paired Wilcoxon signed rank test"?i+="Median of the difference `x - y` is ":i+="Median of `x` is ",this.alternative){case"less":i+="less than ";break;case"greater":i+="greater than ";break;default:i+="not equal to ";break}return i+=this.nullValue,i+=`

`,i+="    pValue: "+GB(this.pValue,-t)+`
`,i+="    statistic: "+GB(this.statistic,-t)+`
`,i+=`
`,e&&(i+="Test Decision: ",this.rejected?i+="Reject null in favor of alternative at "+this.alpha*100+"% significance level":i+="Fail to reject null in favor of alternative at "+this.alpha*100+"% significance level",i+=`
`),i}HB.exports=Wqr});var ZB=u((FCr,QB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var DB=da().primitives,WB=ba(),ft=ct(),Yqr=gr(),Kqr=xv(),Qqr=tf().factory,c0=TB(),Zqr=SB(),Jqr=Yt(),Xqr=Q(),YB=k(),KB=Tr(),of=S(),$qr=CB(),zqr=BB(),xqr=UB(),vf=Qqr(0,1);function rwr(){var r,e,t,i,a,n,s,o,v,l,f,c,p,m,h,g,w,y,b,q,A,_,E,d,C,G,z,x,Z;if(x=arguments[0],!WB(x)&&!DB(x))throw new TypeError(of("invalid argument. First argument must be a numeric array. Value: `%s`.",x));if(g=x.length,arguments.length>1)if(Yqr(arguments[1]))t=arguments[1];else{if(Z=arguments[1],!WB(Z)&&!DB(Z))throw new TypeError(of("invalid argument. `%s` argument must be a numeric array. Value: `%s`.","y",Z));if(g!==Z.length)throw new Error("invalid arguments. First and second arguments must have the same length.");arguments.length>2&&(t=arguments[2])}if(c={},t&&(h=$qr(c,t),h))throw h;if(q=c.mu||0,c.correction===void 0?r=!0:r=c.correction,c.alpha===void 0?l=.05:l=c.alpha,g<2)throw new Error(of("invalid argument. First argument must contain at least two elements. Value: `%s`.",x));if(m=c.alternative||"two-sided",e=c.zeroMethod||"wilcox",e==="wilcox"){if(E=[],Z)for(d=0;d<g;d++)z=x[d]-Z[d]-q,z!==0&&E.push(z);else for(d=0;d<g;d++)x[d]!==0&&E.push(x[d]-q);o=x.length-E.length}else if(E=new KB(g),o=0,Z)for(d=0;d<g;d++)E[d]=x[d]-Z[d]-q,E[d]===0&&(o+=1);else for(d=0;d<g;d++)E[d]=x[d]-q,E[d]===0&&(o+=1);if(o===g)throw new Error("`x` or `x - y` cannot be zero for all elements.");for(g=E.length,b=new KB(g),d=0;d<g;d++)b[d]=YB(E[d]);for(C=Kqr(b),s=0,v=0,d=0;d<g;d++)E[d]>0?s+=C[d]:E[d]===0&&(v+=C[d]);if(i=zqr(C).length!==C.length,e==="zsplit"&&(s+=v/2),G=s,A=g*(g+1)*.25,_=g*(g+1)*(2*g+1),e==="pratt"){for(w=[],d=0;d<g;d++)E[d]!==0&&w.push(C[d]);C=w,A-=o*(o+1)*.25,_-=o*(o+1)*(2*o+1)}for(a=Zqr(C),n=0,d=0;d<a.length;d++)a[d][1]>1&&(z=a[d][1],n+=z*(z*z-1));if(n>0&&(_-=.5*n),_=Xqr(_/24),g>50&&!c.exact||o>0||i){if(E=0,r)switch(m){case"two-sided":E=.5*Jqr(G-A);break;case"less":E=-.5;break;default:E=.5;break}p=(G-A-E)/_,m==="two-sided"?f=2*(1-vf(YB(p))):m==="greater"?f=1-vf(p):f=vf(p)}else p=G,m==="two-sided"?p>g*(g+1)/4?f=2*(1-c0(p-1,g)):f=2*c0(p,g):m==="greater"?f=1-c0(p-1,g):f=c0(p,g);return y={},ft(y,"rejected",f<=l),ft(y,"alpha",l),ft(y,"pValue",f),ft(y,"statistic",G),ft(y,"nullValue",q),ft(y,"alternative",m),ft(y,"method",(Z?"Paired":"One-Sample")+" Wilcoxon signed rank test"),ft(y,"print",xqr),y}QB.exports=rwr});var XB=u((PCr,JB)=>{"use strict";/**
* @license Apache-2.0
*
* Copyright (c) 2020 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/var ewr=ZB();JB.exports=ewr});var twr={};lk(twr,{bartlettTest:()=>rk.default,chi2test:()=>xB.default,chisquareCdf:()=>nk.default,normalCdf:()=>ik.default,ranks:()=>tk.default,tCdf:()=>ak.default,ttest:()=>zB.default,ttest2:()=>$B.default,wilcoxon:()=>ek.default});var $B=Oe(zO(),1),zB=Oe(qS(),1),xB=Oe(XC(),1),rk=Oe(Rj(),1),ek=Oe(XB(),1),tk=Oe(xv(),1),ik=Oe(tf(),1),ak=Oe(fn(),1),nk=Oe(u0(),1);return ck(twr);})();
