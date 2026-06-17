var xy=Object.defineProperty;var Sy=(nt,st,Wt)=>st in nt?xy(nt,st,{enumerable:!0,configurable:!0,writable:!0,value:Wt}):nt[st]=Wt;var Of=(nt,st,Wt)=>Sy(nt,typeof st!="symbol"?st+"":st,Wt);(function(){"use strict";/*!
 * ONNX Runtime Web v1.26.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var nt=Object.defineProperty,st=Object.getOwnPropertyDescriptor,Wt=Object.getOwnPropertyNames,Mf=Object.prototype.hasOwnProperty,Nf=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),U=(e,t)=>()=>(e&&(t=e(e=0)),t),Vt=(e,t)=>{for(var r in t)nt(e,r,{get:t[r],enumerable:!0})},Df=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Wt(t))!Mf.call(e,a)&&a!==r&&nt(e,a,{get:()=>t[a],enumerable:!(i=st(t,a))||i.enumerable});return e},Yt=e=>Df(nt({},"__esModule",{value:!0}),e),Qt,ct,Gt,bn,$n,wn=U(()=>{Qt=new Map,ct=[],Gt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=Qt.get(e);if(i===void 0)Qt.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=ct.indexOf(e);a!==-1&&ct.splice(a,1);for(let n=0;n<ct.length;n++)if(Qt.get(ct[n]).priority<=r){ct.splice(n,0,e);return}ct.push(e)}return}throw new TypeError("not a valid backend")},bn=async e=>{let t=Qt.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},$n=async e=>{let t=e.executionProviders||[],r=t.map(l=>typeof l=="string"?l:l.name),i=r.length===0?ct:r,a,n=[],s=new Set;for(let l of i){let d=await bn(l);typeof d=="string"?n.push({name:l,err:d}):(a||(a=d),a===d&&s.add(l))}if(!a)throw new Error(`no available backend found. ERR: ${n.map(l=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:d}of n)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${d}`);let u=t.filter(l=>s.has(typeof l=="string"?l:l.name));return[a,new Proxy(e,{get:(l,d)=>d==="executionProviders"?u:Reflect.get(l,d)})]}}),Uf=U(()=>{wn()}),vn,Pf=U(()=>{vn="1.26.0"}),si,Ie,xn=U(()=>{Pf(),si="warning",Ie={wasm:{},webgl:{},webgpu:{},versions:{common:vn},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);si=e}},get logLevel(){return si}},Object.defineProperty(Ie,"logLevel",{enumerable:!0})}),_e,qf=U(()=>{xn(),_e=Ie}),Sn,kn,Lf=U(()=>{Sn=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,n;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[3]):(a=e.dims[3],n=e.dims[2]);let s=(t==null?void 0:t.format)!==void 0?t.format:"RGB",u=t==null?void 0:t.norm,l,d;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?d=[0,0,0,0]:typeof u.bias=="number"?d=[u.bias,u.bias,u.bias,u.bias]:(d=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(d[3]=u.bias[3]));let h=n*a,c=0,g=h,y=h*2,_=-1;s==="RGBA"?(c=0,g=h,y=h*2,_=h*3):s==="RGB"?(c=0,g=h,y=h*2):s==="RBG"&&(c=0,y=h,g=h*2);for(let b=0;b<n;b++)for(let S=0;S<a;S++){let x=(e.data[c++]-d[0])*l[0],$=(e.data[g++]-d[1])*l[1],I=(e.data[y++]-d[2])*l[2],k=_===-1?255:(e.data[_++]-d[3])*l[3];i.fillStyle="rgba("+x+","+$+","+I+","+k+")",i.fillRect(S,b,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},kn=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,n,s;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[1],s=e.dims[3]):(a=e.dims[3],n=e.dims[2],s=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t==null?void 0:t.norm,d,h;l===void 0||l.mean===void 0?d=[255,255,255,255]:typeof l.mean=="number"?d=[l.mean,l.mean,l.mean,l.mean]:(d=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(d[3]=l.mean[3])),l===void 0||l.bias===void 0?h=[0,0,0,0]:typeof l.bias=="number"?h=[l.bias,l.bias,l.bias,l.bias]:(h=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(h[3]=l.bias[3]));let c=n*a;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,y=0,_=1,b=2,S=3,x=0,$=c,I=c*2,k=-1;u==="RGBA"?(x=0,$=c,I=c*2,k=c*3):u==="RGB"?(x=0,$=c,I=c*2):u==="RBG"&&(x=0,I=c,$=c*2),i=r.createImageData(a,n);for(let E=0;E<n*a;y+=g,_+=g,b+=g,S+=g,E++)i.data[y]=(e.data[x++]-h[0])*d[0],i.data[_]=(e.data[$++]-h[1])*d[1],i.data[b]=(e.data[I++]-h[2])*d[2],i.data[S]=k===-1?255:(e.data[k++]-h[3])*d[3]}else throw new Error("Can not access image data");return i}}),br,Tn,In,En,zn,Cn,Wf=U(()=>{ui(),br=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},n,s;typeof a.mean=="number"?n=[a.mean,a.mean,a.mean,a.mean]:n=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?s=[a.bias,a.bias,a.bias,a.bias]:s=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",d=r*i,h=l==="RGBA"?new Float32Array(d*4):new Float32Array(d*3),c=4,g=0,y=1,_=2,b=3,S=0,x=d,$=d*2,I=-1;u==="RGB"&&(c=3,g=0,y=1,_=2,b=-1),l==="RGBA"?I=d*3:l==="RBG"?(S=0,$=d,x=d*2):l==="BGR"&&($=0,x=d,S=d*2);for(let k=0;k<d;k++,g+=c,_+=c,y+=c,b+=c)h[S++]=(e[g]+s[0])/n[0],h[x++]=(e[y]+s[1])/n[1],h[$++]=(e[_]+s[2])/n[2],I!==-1&&b!==-1&&(h[I++]=(e[b]+s[3])/n[3]);return l==="RGBA"?new Ne("float32",h,[1,4,r,i]):new Ne("float32",h,[1,3,r,i])},Tn=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,n=typeof e=="string",s,u=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},d=h=>typeof HTMLCanvasElement<"u"&&h instanceof HTMLCanvasElement||h instanceof OffscreenCanvas?h.getContext("2d"):null;if(r){let h=l();h.width=e.width,h.height=e.height;let c=d(h);if(c!=null){let g=e.height,y=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,y=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=y}else u.tensorFormat="RGBA",u.height=g,u.width=y;c.drawImage(e,0,0),s=c.getImageData(0,0,y,g).data}else throw new Error("Can not access image data")}else if(i){let h,c;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(h=t.resizedHeight,c=t.resizedWidth):(h=e.height,c=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=h,u.width=c,t!==void 0){let g=l();g.width=c,g.height=h;let y=d(g);if(y!=null)y.putImageData(e,0,0),s=y.getImageData(0,0,c,h).data;else throw new Error("Can not access image data")}else s=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let h=l();h.width=e.width,h.height=e.height;let c=d(h);if(c!=null){let g=e.height,y=e.width;return c.drawImage(e,0,0,y,g),s=c.getImageData(0,0,y,g).data,u.height=g,u.width=y,br(s,u)}else throw new Error("Can not access image data")}else{if(n)return new Promise((h,c)=>{let g=l(),y=d(g);if(!e||!y)return c();let _=new Image;_.crossOrigin="Anonymous",_.src=e,_.onload=()=>{g.width=_.width,g.height=_.height,y.drawImage(_,0,0,g.width,g.height);let b=y.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,h(br(b.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return br(s,u);throw new Error("Input data provided is not supported - aborted tensor creation")},In=(e,t)=>{let{width:r,height:i,download:a,dispose:n}=t,s=[1,i,r,4];return new Ne({location:"texture",type:"float32",texture:e,dims:s,download:a,dispose:n})},En=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Ne({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:n})},zn=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Ne({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:n})},Cn=(e,t,r)=>new Ne({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),St,Jt,oi,An,Vf=U(()=>{St=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),Jt=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),oi=!1,An=()=>{if(!oi){oi=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(St.set("int64",BigInt64Array),Jt.set(BigInt64Array,"int64")),t&&(St.set("uint64",BigUint64Array),Jt.set(BigUint64Array,"uint64")),i?(St.set("float16",r),Jt.set(r,"float16")):St.set("float16",Uint16Array)}}}),On,Rn,Gf=U(()=>{ui(),On=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},Rn=(e,t)=>{switch(e.location){case"cpu":return new Ne(e.type,e.data,t);case"cpu-pinned":return new Ne({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Ne({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Ne({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Ne({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Ne,ui=U(()=>{Lf(),Wf(),Vf(),Gf(),Ne=class{constructor(e,t,r){An();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let s=St.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let l=St.get(e);if(l===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?s=l.from(t,BigInt):s=l.from(t)}else if(t instanceof l)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${l}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")i="string",s=e;else if(l==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let l=Jt.get(e.constructor);if(l===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=l,s=e}if(u===void 0)u=[s.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");a=u,this.cpuData=s,this.dataLocation="cpu"}let n=On(a);if(this.cpuData&&n!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(n/2)===this.cpuData.length))throw new Error(`Tensor's size(${n}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=n}static async fromImage(e,t){return Tn(e,t)}static fromTexture(e,t){return In(e,t)}static fromGpuBuffer(e,t){return En(e,t)}static fromMLTensor(e,t){return zn(e,t)}static fromPinnedBuffer(e,t,r){return Cn(e,t,r)}toDataURL(e){return Sn(this,e)}toImageData(e){return kn(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return Rn(this,e)}}}),Ge,Bn=U(()=>{ui(),Ge=Ne}),$r,li,Je,He,kt,Tt,Mn=U(()=>{xn(),$r=(e,t)=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||console.timeStamp(`${e}::ORT::${t}`)},li=(e,t)=>{var a;let r=((a=new Error().stack)==null?void 0:a.split(/\r\n|\r|\n/g))||[],i=!1;for(let n=0;n<r.length;n++){if(i&&!r[n].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[n].trim().split(" ")[1]}`;t&&(s+=`::${t}`),$r("CPU",s);return}r[n].includes("TRACE_FUNC")&&(i=!0)}},Je=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||li("BEGIN",e)},He=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||li("END",e)},kt=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||console.time(`ORT::${e}`)},Tt=e=>{(typeof Ie.trace>"u"?!Ie.wasm.trace:!Ie.trace)||console.timeEnd(`ORT::${e}`)}}),Nn,Hf=U(()=>{wn(),Bn(),Mn(),Nn=class Rf{constructor(t){this.handler=t}async run(t,r,i){Je(),kt("InferenceSession.run");let a={},n={};if(typeof t!="object"||t===null||t instanceof Ge||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Ge)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let d of r){if(typeof d!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(d)===-1)throw new RangeError(`'fetches' contains invalid output name: ${d}.`);a[d]=null}if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let d=!1,h=Object.getOwnPropertyNames(r);for(let c of this.outputNames)if(h.indexOf(c)!==-1){let g=r[c];(g===null||g instanceof Ge)&&(d=!0,s=!1,a[c]=g)}if(d){if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else n=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let d of this.inputNames)if(typeof t[d]>"u")throw new Error(`input '${d}' is missing in 'feeds'.`);if(s)for(let d of this.outputNames)a[d]=null;let u=await this.handler.run(t,a,n),l={};for(let d in u)if(Object.hasOwnProperty.call(u,d)){let h=u[d];h instanceof Ge?l[d]=h:l[d]=new Ge(h.type,h.data,h.dims)}return Tt("InferenceSession.run"),He(),l}async release(){return this.handler.dispose()}static async create(t,r,i,a){Je(),kt("InferenceSession.create");let n,s={};if(typeof t=="string"){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let h=t,c=0,g=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(c=r,!Number.isSafeInteger(c))throw new RangeError("'byteOffset' must be an integer.");if(c<0||c>=h.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);if(g=t.byteLength-c,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||c+g>h.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${h.byteLength-c}].`);if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");n=new Uint8Array(h,c,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,l]=await $n(s),d=await u.createInferenceSessionHandler(n,l);return Tt("InferenceSession.create"),He(),new Rf(d)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),di,Ff=U(()=>{Hf(),di=Nn}),jf=U(()=>{}),Kf=U(()=>{}),Xf=U(()=>{}),Zf=U(()=>{}),Yf={};Vt(Yf,{InferenceSession:()=>di,TRACE:()=>$r,TRACE_EVENT_BEGIN:()=>kt,TRACE_EVENT_END:()=>Tt,TRACE_FUNC_BEGIN:()=>Je,TRACE_FUNC_END:()=>He,Tensor:()=>Ge,env:()=>_e,registerBackend:()=>Gt});var Le=U(()=>{Uf(),qf(),Ff(),Bn(),jf(),Kf(),Mn(),Xf(),Zf()}),pi=U(()=>{}),Dn={};Vt(Dn,{default:()=>Un});var ci,hi,Un,Qf=U(()=>{var e;bc(),It(),bi(),ci="ort-wasm-proxy-worker",hi=((e=globalThis.self)==null?void 0:e.name)===ci,hi&&(self.onmessage=t=>{let{type:r,in:i}=t.data;try{switch(r){case"init-wasm":vi(i.wasm).then(()=>{Ra(i).then(()=>{postMessage({type:r})},a=>{postMessage({type:r,err:a})})},a=>{postMessage({type:r,err:a})});break;case"init-ep":{let{epName:a,env:n}=i;Ba(n,a).then(()=>{postMessage({type:r})},s=>{postMessage({type:r,err:s})});break}case"copy-from":{let{buffer:a}=i,n=Pr(a);postMessage({type:r,out:n});break}case"create":{let{model:a,options:n}=i;Na(a,n).then(s=>{postMessage({type:r,out:s})},s=>{postMessage({type:r,err:s})});break}case"release":Da(i),postMessage({type:r});break;case"run":{let{sessionId:a,inputIndices:n,inputs:s,outputIndices:u,options:l}=i;Pa(a,n,s,u,new Array(u.length).fill(null),l).then(d=>{d.some(h=>h[3]!=="cpu")?postMessage({type:r,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:r,out:d},La([...s,...d]))},d=>{postMessage({type:r,err:d})});break}case"end-profiling":qa(i),postMessage({type:r});break;default:}}catch(a){postMessage({type:r,err:a})}}),Un=hi?null:t=>new Worker(t??De,{type:"module",name:ci})}),Pn={};Vt(Pn,{default:()=>Ln});async function qn(e={}){var Cf,Af;var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,a=i&&((Cf=self.name)==null?void 0:Cf.startsWith("em-pthread"));t.mountExternalData=(o,p)=>{o.startsWith("./")&&(o=o.substring(2)),(t.Xc||(t.Xc=new Map)).set(o,p)},t.unmountExternalData=()=>{delete t.Xc},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let n=o=>async(...p)=>{var m;try{if(t.Yc)throw Error("Session already started");let f=t.Yc={Kd:p[0],errors:[]},w=await o(...p);if(t.Yc!==f)throw Error("Session mismatch");(m=t.dd)==null||m.flush();let T=f.errors;if(0<T.length){let z=await Promise.all(T);if(z=z.filter(B=>B),0<z.length)throw Error(z.join(`
`))}return w}finally{t.Yc=null}};t.jsepInit=(o,p)=>{if(o==="webgpu"){[t.dd,t.Ad,t.Ed,t.ed,t.Dd,t.$b,t.Fd,t.Hd,t.Bd,t.Cd,t.Gd]=p;let m=t.dd;t.jsepRegisterBuffer=(f,w,T,z)=>m.registerBuffer(f,w,T,z),t.jsepGetBuffer=f=>m.getBuffer(f),t.jsepCreateDownloader=(f,w,T)=>m.createDownloader(f,w,T),t.jsepOnCreateSession=f=>{m.onCreateSession(f)},t.jsepOnReleaseSession=f=>{m.onReleaseSession(f)},t.jsepOnRunStart=f=>m.onRunStart(f),t.Id=(f,w)=>{m.upload(f,w)}}else if(o==="webnn"){let m=p[0];[t.Wd,t.sd,t.webnnEnsureTensor,t.td,t.webnnDownloadTensor,t.Rd,t.webnnEnableTraceEvent]=p.slice(1),t.webnnReleaseTensorId=t.sd,t.webnnUploadTensor=t.td,t.webnnRegisterMLContext=t.Rd,t.webnnOnRunStart=f=>m.onRunStart(f),t.webnnOnRunEnd=m.onRunEnd.bind(m),t.webnnOnReleaseSession=f=>{m.onReleaseSession(f)},t.webnnCreateMLTensorDownloader=(f,w)=>m.createMLTensorDownloader(f,w),t.webnnRegisterMLTensor=(f,w,T,z)=>m.registerMLTensor(f,w,T,z),t.webnnCreateMLContext=f=>m.createMLContext(f),t.webnnRegisterMLConstant=(f,w,T,z,B,L)=>m.registerMLConstant(f,w,T,z,B,t.Xc,L),t.webnnRegisterGraphInput=m.registerGraphInput.bind(m),t.webnnIsGraphInput=m.isGraphInput.bind(m),t.webnnRegisterGraphOutput=m.registerGraphOutput.bind(m),t.webnnIsGraphOutput=m.isGraphOutput.bind(m),t.webnnCreateTemporaryTensor=m.createTemporaryTensor.bind(m),t.webnnIsGraphInputOutputTypeSupported=m.isGraphInputOutputTypeSupported.bind(m)}};let s=()=>{let o=p=>(...m)=>{let f=it;return m=p(...m),it!=f?new Promise((w,T)=>{sn={resolve:w,reject:T}}):m};(()=>{for(let p of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[p]=o(t[p])})(),n!==void 0&&(t._OrtRun=n(t._OrtRun),t._OrtRunWithBinding=n(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s==null||s()};var u,l,d=(o,p)=>{throw p},h=self.location.href,c="";if(r||i){try{c=new URL(".",h).href}catch{}i&&(l=o=>{var p=new XMLHttpRequest;return p.open("GET",o,!1),p.responseType="arraybuffer",p.send(null),new Uint8Array(p.response)}),u=async o=>{if(A(o))return new Promise((m,f)=>{var w=new XMLHttpRequest;w.open("GET",o,!0),w.responseType="arraybuffer",w.onload=()=>{w.status==200||w.status==0&&w.response?m(w.response):f(w.status)},w.onerror=f,w.send(null)});var p=await fetch(o,{credentials:"same-origin"});if(p.ok)return p.arrayBuffer();throw Error(p.status+" : "+p.url)}}var g,y,_,b,S,x,$=console.log.bind(console),I=console.error.bind(console),k=$,E=I,C=!1,A=o=>o.startsWith("file://");function v(){$t.buffer!=D.buffer&&V()}if(a){let o=function(p){try{var m=p.data,f=m.Sc;if(f==="load"){let w=[];self.onmessage=T=>w.push(T),x=()=>{postMessage({Sc:"loaded"});for(let T of w)o(T);self.onmessage=o};for(let T of m.xd)t[T]&&!t[T].proxy||(t[T]=(...z)=>{postMessage({Sc:"callHandler",wd:T,args:z})},T=="print"&&(k=t[T]),T=="printErr"&&(E=t[T]));$t=m.Od,V(),y=m.Pd,We(),ai()}else if(f==="run"){(function(w){var T=(v(),K)[w+52>>>2>>>0];w=(v(),K)[w+56>>>2>>>0],Ph(T,T-w),se(T)})(m.Rc),pn(m.Rc,0,0,1,0,0),qc(),rn(m.Rc),N||(Rh(),N=!0);try{mg(m.Md,m.bd)}catch(w){if(w!="unwind")throw w}}else m.target!=="setimmediate"&&(f==="checkMailbox"?N&&Yr():f&&(E(`worker: received unknown command ${f}`),E(m)))}catch(w){throw Bh(),w}};var N=!1;self.onunhandledrejection=p=>{throw p.reason||p},self.onmessage=o}var D,H,F,j,R,K,X,ee,fe,W,ue,P=!1;function V(){var o=$t.buffer;t.HEAP8=D=new Int8Array(o),F=new Int16Array(o),t.HEAPU8=H=new Uint8Array(o),j=new Uint16Array(o),t.HEAP32=R=new Int32Array(o),t.HEAPU32=K=new Uint32Array(o),X=new Float32Array(o),ee=new Float64Array(o),fe=new BigInt64Array(o),W=new BigUint64Array(o)}function Z(){P=!0,a?x():pt.sb()}function q(o){throw E(o="Aborted("+o+")"),C=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),S==null||S(o),o}function ge(){return{a:{ma:U0,gb:D0,g:gg,J:yg,f:_g,o:bg,h:$g,ha:wg,b:vg,T:xg,Ha:Fc,n:Sg,$:Zc,Xa:Yc,Da:Qc,Fa:Jc,Ya:eh,Va:th,Oa:rh,Ua:ih,ka:ah,Ea:nh,Ba:sh,Wa:oh,Ca:uh,bb:kg,ea:Tg,wa:Ig,ua:zg,da:Ag,O:Og,H:Rg,va:Bg,_:Lg,xa:Wg,Ra:Vg,za:Hg,Ia:Fg,sa:jg,fa:Kg,Qa:rn,_a:Xg,R:Jg,r:a0,c:en,hb:n0,y:s0,M:o0,D:u0,l:l0,s:gh,ib:d0,I:p0,S:c0,j:h0,u:f0,q:m0,k:g0,La:y0,Ma:_0,Na:b0,Ja:$h,Ka:wh,ta:vh,db:w0,ab:x0,v:S0,aa:k0,ga:T0,$a:v0,W:I0,Za:E0,Aa:z0,F:$0,U:C0,la:ri,ya:O0,fb:A0,eb:R0,Sa:Th,Ta:Ih,Ga:hr,V:Eh,ja:zh,Pa:Ch,ia:Ah,kb:$y,na:my,lb:by,oa:fy,G:ny,d:W0,t:q0,w:P0,A:Q0,mb:py,K:ry,x:H0,pa:cy,Y:gy,ba:dy,nb:ly,ob:uy,P:J0,qa:oy,pb:sy,N:iy,Z:hy,e:L0,B:G0,m:V0,jb:wy,p:j0,z:K0,C:F0,E:X0,L:ey,qb:ay,Q:yy,ca:ty,X:_y,rb:Y0,ra:Z0,i:M0,a:$t,cb:qe}}}async function We(){function o(f,w){var T=pt=f.exports;f={};for(let[z,B]of Object.entries(T))typeof B=="function"?(T=Zg(B),f[z]=T):f[z]=B;return pt=f,pt=(function(){var z=pt,B=G=>ne=>G(ne)>>>0,L=G=>()=>G()>>>0;return(z=Object.assign({},z)).tb=B(z.tb),z.Xb=L(z.Xb),z.Zb=B(z.Zb),z.lc=B(z.lc),z.mc=L(z.mc),z.qc=B(z.qc),z})(),Uc.push(pt._b),Oh=(f=pt).tb,Rh=f.ub,t._OrtInit=f.vb,t._OrtGetLastError=f.wb,t._OrtCreateSessionOptions=f.xb,t._OrtAppendExecutionProvider=f.yb,t._OrtAddFreeDimensionOverride=f.zb,t._OrtAddSessionConfigEntry=f.Ab,t._OrtReleaseSessionOptions=f.Bb,t._OrtCreateSession=f.Cb,t._OrtReleaseSession=f.Db,t._OrtGetInputOutputCount=f.Eb,t._OrtGetInputOutputMetadata=f.Fb,t._OrtFree=f.Gb,t._OrtCreateTensor=f.Hb,t._OrtGetTensorData=f.Ib,t._OrtReleaseTensor=f.Jb,t._OrtCreateRunOptions=f.Kb,t._OrtAddRunConfigEntry=f.Lb,t._OrtReleaseRunOptions=f.Mb,t._OrtCreateBinding=f.Nb,t._OrtBindInput=f.Ob,t._OrtBindOutput=f.Pb,t._OrtClearBoundOutputs=f.Qb,t._OrtReleaseBinding=f.Rb,t._OrtRunWithBinding=f.Sb,t._OrtRun=f.Tb,t._OrtEndProfiling=f.Ub,t._JsepOutput=f.Vb,t._JsepGetNodeName=f.Wb,ii=f.Xb,at=t._free=f.Yb,gr=t._malloc=f.Zb,pn=f.ac,Bh=f.bc,Mh=f.cc,Nh=f.dc,cn=f.ec,Dh=f.fc,Uh=f.gc,le=f.hc,yr=f.ic,Ph=f.jc,se=f.kc,hn=f.lc,oe=f.mc,qh=f.nc,fn=f.oc,Lh=f.pc,Wh=f.qc,Vh=f.rc,mn=f.sc,Gh=f.tc,Hh=f.uc,Fh=f.vc,jh=f.wc,Kh=f.xc,Xh=f.yc,Zh=f.zc,Yh=f.Ac,Qh=f.Bc,Jh=f.Cc,ef=f.Dc,tf=f.Ec,rf=f.Fc,af=f.Gc,nf=f.Hc,sf=f.Ic,of=f.Jc,uf=f.Kc,lf=f.Lc,df=f.Mc,pf=f.Nc,cf=f.Pc,hf=f.Qc,ff=f.$c,mf=f.ad,gf=f.fd,yf=f.jd,_f=f.kd,bf=f.ld,$f=f.md,wf=f.nd,vf=f.od,xf=f.pd,Sf=f.qd,kf=f.vd,Tf=f.Sd,If=f.Td,Ef=f.Ud,zf=f.Vd,y=w,pt}var p,m=ge();return t.instantiateWasm?new Promise(f=>{t.instantiateWasm(m,(w,T)=>{f(o(w,T))})}):a?o(new WebAssembly.Instance(y,ge()),y):(ue??(ue=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",c):c+"ort-wasm-simd-threaded.jsep.wasm":new URL("/assets/ort-wasm-simd-threaded.jsep-CyqnNavA.wasm",self.location.href).href),p=await(async function(f){var w=ue;if(!g&&!A(w))try{var T=fetch(w,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(T,f)}catch(z){E(`wasm streaming compile failed: ${z}`),E("falling back to ArrayBuffer instantiation")}return(async function(z,B){try{var L=await(async function(G){if(!g)try{var ne=await u(G);return new Uint8Array(ne)}catch{}if(G==ue&&g)G=new Uint8Array(g);else{if(!l)throw"both async and sync fetching of the wasm failed";G=l(G)}return G})(z);return await WebAssembly.instantiate(L,B)}catch(G){E(`failed to asynchronously prepare wasm: ${G}`),q(G)}})(w,f)})(m),o(p.instance,p.module))}class Se{constructor(p){Of(this,"name","ExitStatus");this.message=`Program terminated with exit(${p})`,this.status=p}}var Re=o=>{o.terminate(),o.onmessage=()=>{}},Be=[],Pe=0,Me=null,_t=o=>{bt.length==0&&(Wc(),Lc(bt[0]));var p=bt.pop();if(!p)return 6;fr.push(p),Pt[o.Rc]=p,p.Rc=o.Rc;var m={Sc:"run",Md:o.Ld,bd:o.bd,Rc:o.Rc};return p.postMessage(m,o.rd),0},$e=0,ie=(o,p,...m)=>{var f,w=16*m.length,T=oe(),z=hn(w),B=z>>>3;for(f of m)typeof f=="bigint"?((v(),fe)[B++>>>0]=1n,(v(),fe)[B++>>>0]=f):((v(),fe)[B++>>>0]=0n,(v(),ee)[B++>>>0]=f);return o=Mh(o,0,w,z,p),se(T),o};function qe(o){if(a)return ie(0,1,o);if(_=o,!(0<$e)){for(var p of fr)Re(p);for(p of bt)Re(p);bt=[],fr=[],Pt={},C=!0}d(0,new Se(o))}function Fr(o){if(a)return ie(1,0,o);hr(o)}var hr=o=>{if(_=o,a)throw Fr(o),"unwind";qe(o)},bt=[],fr=[],Uc=[],Pt={},Pc=o=>{var p=o.Rc;delete Pt[p],bt.push(o),fr.splice(fr.indexOf(o),1),o.Rc=0,Nh(p)};function qc(){Uc.forEach(o=>o())}var Lc=o=>new Promise(p=>{o.onmessage=w=>{var T=w.data;if(w=T.Sc,T.Zc&&T.Zc!=ii()){var z=Pt[T.Zc];z?z.postMessage(T,T.rd):E(`Internal error! Worker sent a message "${w}" to target pthread ${T.Zc}, but that thread no longer exists!`)}else w==="checkMailbox"?Yr():w==="spawnThread"?_t(T):w==="cleanupThread"?Zr(()=>{Pc(Pt[T.Nd])}):w==="loaded"?(o.loaded=!0,p(o)):T.target==="setimmediate"?o.postMessage(T):w==="uncaughtException"?o.onerror(T.error):w==="callHandler"?t[T.wd](...T.args):w&&E(`worker sent an unknown command ${w}`)},o.onerror=w=>{throw E(`worker sent an error! ${w.filename}:${w.lineno}: ${w.message}`),w};var m,f=[];for(m of[])t.propertyIsEnumerable(m)&&f.push(m);o.postMessage({Sc:"load",xd:f,Od:$t,Pd:y})});function Wc(){var o=new Worker((()=>{let p=URL;return self.location.href>"file:"&&self.location.href<"file;"?new p("ort.bundle.min.mjs",self.location.href):new URL(self.location.href)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});bt.push(o)}var $t,mg=(o,p)=>{$e=0,o=mn(o,p),0<$e?_=o:cn(o)},jr=[],Kr=0;function gg(o){var p=new Za(o>>>=0);return(v(),D)[p.Tc+12>>>0]==0&&(Vc(p,!0),Kr--),Gc(p,!1),jr.push(p),Wh(o)}var Xt=0,yg=()=>{le(0,0);var o=jr.pop();qh(o.cd),Xt=0};function Vc(o,p){p=p?1:0,(v(),D)[o.Tc+12>>>0]=p}function Gc(o,p){p=p?1:0,(v(),D)[o.Tc+13>>>0]=p}class Za{constructor(p){this.cd=p,this.Tc=p-24}}var Ya=o=>{var p=Xt;if(!p)return yr(0),0;var m=new Za(p);(v(),K)[m.Tc+16>>>2>>>0]=p;var f=(v(),K)[m.Tc+4>>>2>>>0];if(!f)return yr(0),p;for(var w of o){if(w===0||w===f)break;if(Lh(w,f,m.Tc+16))return yr(w),p}return yr(f),p};function _g(){return Ya([])}function bg(o){return Ya([o>>>0])}function $g(o,p,m,f){return Ya([o>>>0,p>>>0,m>>>0,f>>>0])}var wg=()=>{var o=jr.pop();o||q("no exception to throw");var p=o.cd;throw(v(),D)[o.Tc+13>>>0]==0&&(jr.push(o),Gc(o,!0),Vc(o,!1),Kr++),fn(p),Xt=p};function vg(o,p,m){var f=new Za(o>>>=0);throw p>>>=0,m>>>=0,(v(),K)[f.Tc+16>>>2>>>0]=0,(v(),K)[f.Tc+4>>>2>>>0]=p,(v(),K)[f.Tc+8>>>2>>>0]=m,fn(o),Kr++,Xt=o}var xg=()=>Kr;function Hc(o,p,m,f){return a?ie(2,1,o,p,m,f):Fc(o,p,m,f)}function Fc(o,p,m,f){if(o>>>=0,p>>>=0,m>>>=0,f>>>=0,!globalThis.SharedArrayBuffer)return 6;var w=[];return a&&w.length===0?Hc(o,p,m,f):(o={Ld:m,Rc:o,bd:f,rd:w},a?(o.Sc="spawnThread",postMessage(o,w),0):_t(o))}function Sg(o){throw Xt||(Xt=o>>>0),Xt}var jc=globalThis.TextDecoder&&new TextDecoder,Kc=(o,p,m,f)=>{if(m=p+m,f)return m;for(;o[p]&&!(p>=m);)++p;return p},Xc=(o,p=0,m,f)=>{if(16<(m=Kc(o,p>>>=0,m,f))-p&&o.buffer&&jc)return jc.decode(o.buffer instanceof ArrayBuffer?o.subarray(p,m):o.slice(p,m));for(f="";p<m;){var w=o[p++];if(128&w){var T=63&o[p++];if((224&w)==192)f+=String.fromCharCode((31&w)<<6|T);else{var z=63&o[p++];65536>(w=(240&w)==224?(15&w)<<12|T<<6|z:(7&w)<<18|T<<12|z<<6|63&o[p++])?f+=String.fromCharCode(w):(w-=65536,f+=String.fromCharCode(55296|w>>10,56320|1023&w))}}else f+=String.fromCharCode(w)}return f},ke=(o,p,m)=>(o>>>=0)?Xc((v(),H),o,p,m):"";function Zc(o,p,m){return a?ie(3,1,o,p,m):0}function Yc(o,p){if(a)return ie(4,1,o,p)}function Qc(o,p){if(a)return ie(5,1,o,p)}function Jc(o,p,m){if(a)return ie(6,1,o,p,m)}function eh(o,p,m){return a?ie(7,1,o,p,m):0}function th(o,p){if(a)return ie(8,1,o,p)}function rh(o,p,m){if(a)return ie(9,1,o,p,m)}function ih(o,p,m,f){if(a)return ie(10,1,o,p,m,f)}function ah(o,p,m,f){if(a)return ie(11,1,o,p,m,f)}function nh(o,p,m,f){if(a)return ie(12,1,o,p,m,f)}function sh(o){if(a)return ie(13,1,o)}function oh(o,p){if(a)return ie(14,1,o,p)}function uh(o,p,m){if(a)return ie(15,1,o,p,m)}var kg=()=>q(""),rt=o=>{o>>>=0;for(var p="";;){var m=(v(),H)[o++>>>0];if(!m)return p;p+=String.fromCharCode(m)}},Qa={},Ja={},Zt=class extends Error{constructor(o){super(o),this.name="BindingError"}};function dt(o,p,m={}){return(function(f,w,T={}){var z=w.name;if(!f)throw new Zt(`type "${z}" must have a positive integer typeid pointer`);if(Ja.hasOwnProperty(f)){if(T.yd)return;throw new Zt(`Cannot register type '${z}' twice`)}Ja[f]=w,Qa.hasOwnProperty(f)&&(w=Qa[f],delete Qa[f],w.forEach(B=>B()))})(o,p,m)}var lh=(o,p,m)=>{switch(p){case 1:return m?f=>(v(),D)[f>>>0]:f=>(v(),H)[f>>>0];case 2:return m?f=>(v(),F)[f>>>1>>>0]:f=>(v(),j)[f>>>1>>>0];case 4:return m?f=>(v(),R)[f>>>2>>>0]:f=>(v(),K)[f>>>2>>>0];case 8:return m?f=>(v(),fe)[f>>>3>>>0]:f=>(v(),W)[f>>>3>>>0];default:throw new TypeError(`invalid integer width (${p}): ${o}`)}};function Tg(o,p,m,f,w){o>>>=0,m>>>=0,p=rt(p>>>0);let T=z=>z;if(f=f===0n){let z=8*m;T=B=>BigInt.asUintN(z,B),w=T(w)}dt(o,{name:p,Oc:T,Vc:(z,B)=>(typeof B=="number"&&(B=BigInt(B)),B),Uc:lh(p,m,!f),Wc:null})}function Ig(o,p,m,f){dt(o>>>=0,{name:p=rt(p>>>0),Oc:function(w){return!!w},Vc:function(w,T){return T?m:f},Uc:function(w){return this.Oc((v(),H)[w>>>0])},Wc:null})}var dh=[],qt=[0,1,,1,null,1,!0,1,!1,1];function en(o){9<(o>>>=0)&&--qt[o+1]==0&&(qt[o]=void 0,dh.push(o))}var Ve=o=>{if(!o)throw new Zt(`Cannot use deleted val. handle = ${o}`);return qt[o]},Qe=o=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let p=dh.pop()||qt.length;return qt[p]=o,qt[p+1]=1,p}};function tn(o){return this.Oc((v(),K)[o>>>2>>>0])}var Eg={name:"emscripten::val",Oc:o=>{var p=Ve(o);return en(o),p},Vc:(o,p)=>Qe(p),Uc:tn,Wc:null};function zg(o){return dt(o>>>0,Eg)}var Cg=(o,p)=>{switch(p){case 4:return function(m){return this.Oc((v(),X)[m>>>2>>>0])};case 8:return function(m){return this.Oc((v(),ee)[m>>>3>>>0])};default:throw new TypeError(`invalid float width (${p}): ${o}`)}};function Ag(o,p,m){m>>>=0,dt(o>>>=0,{name:p=rt(p>>>0),Oc:f=>f,Vc:(f,w)=>w,Uc:Cg(p,m),Wc:null})}function Og(o,p,m,f,w){o>>>=0,m>>>=0,p=rt(p>>>0);let T=B=>B;if(f===0){var z=32-8*m;T=B=>B<<z>>>z,w=T(w)}dt(o,{name:p,Oc:T,Vc:(B,L)=>L,Uc:lh(p,m,f!==0),Wc:null})}function Rg(o,p,m){function f(T){var z=(v(),K)[T>>>2>>>0];return T=(v(),K)[T+4>>>2>>>0],new w((v(),D).buffer,T,z)}var w=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][p];dt(o>>>=0,{name:m=rt(m>>>0),Oc:f,Uc:f},{yd:!0})}var wt=(o,p,m)=>{var f=(v(),H);if(p>>>=0,0<m){var w=p;m=p+m-1;for(var T=0;T<o.length;++T){var z=o.codePointAt(T);if(127>=z){if(p>=m)break;f[p++>>>0]=z}else if(2047>=z){if(p+1>=m)break;f[p++>>>0]=192|z>>6,f[p++>>>0]=128|63&z}else if(65535>=z){if(p+2>=m)break;f[p++>>>0]=224|z>>12,f[p++>>>0]=128|z>>6&63,f[p++>>>0]=128|63&z}else{if(p+3>=m)break;f[p++>>>0]=240|z>>18,f[p++>>>0]=128|z>>12&63,f[p++>>>0]=128|z>>6&63,f[p++>>>0]=128|63&z,T++}}f[p>>>0]=0,o=p-w}else o=0;return o},Xr=o=>{for(var p=0,m=0;m<o.length;++m){var f=o.charCodeAt(m);127>=f?p++:2047>=f?p+=2:55296<=f&&57343>=f?(p+=4,++m):p+=3}return p};function Bg(o,p){dt(o>>>=0,{name:p=rt(p>>>0),Oc(m){var f=(v(),K)[m>>>2>>>0];return f=ke(m+4,f,!0),at(m),f},Vc(m,f){f instanceof ArrayBuffer&&(f=new Uint8Array(f));var w=typeof f=="string";if(!(w||ArrayBuffer.isView(f)&&f.BYTES_PER_ELEMENT==1))throw new Zt("Cannot pass non-string to std::string");var T=w?Xr(f):f.length,z=gr(4+T+1),B=z+4;return(v(),K)[z>>>2>>>0]=T,w?wt(f,B,T+1):(v(),H).set(f,B>>>0),m!==null&&m.push(at,z),z},Uc:tn,Wc(m){at(m)}})}var ph=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,Mg=(o,p,m)=>{if(o>>>=1,16<(p=Kc((v(),j),o,p/2,m))-o&&ph)return ph.decode((v(),j).slice(o,p));for(m="";o<p;++o){var f=(v(),j)[o>>>0];m+=String.fromCharCode(f)}return m},Ng=(o,p,m)=>{if(m??(m=2147483647),2>m)return 0;var f=p;m=(m-=2)<2*o.length?m/2:o.length;for(var w=0;w<m;++w){var T=o.charCodeAt(w);(v(),F)[p>>>1>>>0]=T,p+=2}return(v(),F)[p>>>1>>>0]=0,p-f},Dg=o=>2*o.length,Ug=(o,p,m)=>{var f="";o>>>=2;for(var w=0;!(w>=p/4);w++){var T=(v(),K)[o+w>>>0];if(!T&&!m)break;f+=String.fromCodePoint(T)}return f},Pg=(o,p,m)=>{if(p>>>=0,m??(m=2147483647),4>m)return 0;var f=p;m=f+m-4;for(var w=0;w<o.length;++w){var T=o.codePointAt(w);if(65535<T&&w++,(v(),R)[p>>>2>>>0]=T,(p+=4)+4>m)break}return(v(),R)[p>>>2>>>0]=0,p-f},qg=o=>{for(var p=0,m=0;m<o.length;++m)65535<o.codePointAt(m)&&m++,p+=4;return p};function Lg(o,p,m){if(o>>>=0,p>>>=0,m=rt(m>>>=0),p===2)var f=Mg,w=Ng,T=Dg;else f=Ug,w=Pg,T=qg;dt(o,{name:m,Oc:z=>{var B=(v(),K)[z>>>2>>>0];return B=f(z+4,B*p,!0),at(z),B},Vc:(z,B)=>{if(typeof B!="string")throw new Zt(`Cannot pass non-string to C++ string type ${m}`);var L=T(B),G=gr(4+L+p);return(v(),K)[G>>>2>>>0]=L/p,w(B,G+4,L+p),z!==null&&z.push(at,G),G},Uc:tn,Wc(z){at(z)}})}function Wg(o,p){dt(o>>>=0,{zd:!0,name:p=rt(p>>>0),Oc:()=>{},Vc:()=>{}})}function Vg(o){pn(o>>>0,!i,1,!r,131072,!1),qc()}var Zr=o=>{if(!C)try{if(o(),!(0<$e))try{a?ii()&&cn(_):hr(_)}catch(p){p instanceof Se||p=="unwind"||d(0,p)}}catch(p){p instanceof Se||p=="unwind"||d(0,p)}},Gg=!Atomics.waitAsync||((Af=globalThis.navigator)==null?void 0:Af.userAgent)&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function rn(o){o>>>=0,Gg||(Atomics.waitAsync((v(),R),o>>>2,o).value.then(Yr),o+=128,Atomics.store((v(),R),o>>>2,1))}var Yr=()=>Zr(()=>{var o=ii();o&&(rn(o),Uh())});function Hg(o,p){(o>>>=0)==p>>>0?setTimeout(Yr):a?postMessage({Zc:o,Sc:"checkMailbox"}):(o=Pt[o])&&o.postMessage({Sc:"checkMailbox"})}var an=[];function Fg(o,p,m,f,w){for(p>>>=0,w>>>=0,an.length=0,m=w>>>3,f=w+f>>>3;m<f;){var T;T=(v(),fe)[m++>>>0]?(v(),fe)[m++>>>0]:(v(),ee)[m++>>>0],an.push(T)}return(p?gn[p]:N0[o])(...an)}var jg=()=>{$e=0};function Kg(o){o>>>=0,a?postMessage({Sc:"cleanupThread",Nd:o}):Pc(Pt[o])}function Xg(o){}var Qr=o=>{try{o()}catch(p){q(p)}};function Zg(o){var p=(...m)=>{Jr.push(o);try{return o(...m)}finally{C||(Jr.pop(),it&&vt===1&&Jr.length===0&&(vt=0,$e+=1,Qr(If),typeof Fibers<"u"&&Fibers.Zd()))}};return fh.set(o,p),p}var vt=0,it=null,ch=0,Jr=[],nn=new Map,hh=new Map,fh=new Map,Yg=0,sn=null,Qg=[],mh=o=>(function(p){if(!C){if(vt===0){var m=!1,f=!1;p((w=0)=>{if(!C&&(ch=w,m=!0,f)){vt=2,Qr(()=>Ef(it)),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.resume(),w=!1;try{var T=(function(){var L=(v(),R)[it+8>>>2>>>0];return L=hh.get(L),L=fh.get(L),--$e,L()})()}catch(L){T=L,w=!0}var z=!1;if(!it){var B=sn;B&&(sn=null,(w?B.reject:B.resolve)(T),z=!0)}if(w&&!z)throw T}}),f=!0,m||(vt=1,it=(function(){var w=gr(65548),T=w+12;if((v(),K)[w>>>2>>>0]=T,(v(),K)[w+4>>>2>>>0]=T+65536,T=Jr[0],!nn.has(T)){var z=Yg++;nn.set(T,z),hh.set(z,T)}return T=nn.get(T),(v(),R)[w+8>>>2>>>0]=T,w})(),typeof MainLoop<"u"&&MainLoop.ud&&MainLoop.pause(),Qr(()=>Tf(it)))}else vt===2?(vt=0,Qr(zf),at(it),it=null,Qg.forEach(Zr)):q(`invalid state: ${vt}`);return ch}})(p=>{o().then(p)});function Jg(o){return o>>>=0,mh(async()=>{var p=await Ve(o);return Qe(p)})}var on=[],e0=o=>{var p=on.length;return on.push(o),p},t0=(o,p)=>{for(var m=Array(o),f=0;f<o;++f){var w=f,T=(v(),K)[p+4*f>>>2>>>0],z=Ja[T];if(z===void 0)throw o=`parameter ${f}`,T=Oh(T),p=rt(T),at(T),new Zt(`${o} has unknown type ${p}`);m[w]=z}return m},r0=(o,p,m)=>{var f=[];return o=o(f,m),f.length&&((v(),K)[p>>>2>>>0]=Qe(f)),o},i0={},ei=o=>{var p=i0[o];return p===void 0?rt(o):p};function a0(o,p,m){var[f,...w]=t0(o,p>>>0);p=f.Vc.bind(f);var T=w.map(L=>L.Uc.bind(L));o--;var z={toValue:Ve};switch(o=T.map((L,G)=>{var ne=`argFromPtr${G}`;return z[ne]=L,`${ne}(args${G?"+"+8*G:""})`}),m){case 0:var B="toValue(handle)";break;case 2:B="new (toValue(handle))";break;case 3:B="";break;case 1:z.getStringOrSymbol=ei,B="toValue(handle)[getStringOrSymbol(methodName)]"}return B+=`(${o})`,f.zd||(z.toReturnWire=p,z.emval_returnValue=r0,B=`return emval_returnValue(toReturnWire, destructorsRef, ${B})`),B=`return function (handle, methodName, destructorsRef, args) {
  ${B}
  }`,m=new Function(Object.keys(z),B)(...Object.values(z)),B=`methodCaller<(${w.map(L=>L.name)}) => ${f.name}>`,e0(Object.defineProperty(m,"name",{value:B}))}function n0(o,p){return p>>>=0,(o=Ve(o>>>0))==Ve(p)}function s0(o){return(o>>>=0)?(o=ei(o),Qe(globalThis[o])):Qe(globalThis)}function o0(o){return o=ei(o>>>0),Qe(t[o])}function u0(o,p){return p>>>=0,o=Ve(o>>>0),p=Ve(p),Qe(o[p])}function l0(o){9<(o>>>=0)&&(qt[o+1]+=1)}function gh(o,p,m,f,w){return on[o>>>0](p>>>0,m>>>0,f>>>0,w>>>0)}function d0(o,p,m,f,w){return gh(o>>>0,p>>>0,m>>>0,f>>>0,w>>>0)}function p0(){return Qe([])}function c0(o){o=Ve(o>>>0);for(var p=Array(o.length),m=0;m<o.length;m++)p[m]=o[m];return Qe(p)}function h0(o){return Qe(ei(o>>>0))}function f0(){return Qe({})}function m0(o){for(var p=Ve(o>>>=0);p.length;){var m=p.pop();p.pop()(m)}en(o)}function g0(o,p,m){p>>>=0,m>>>=0,o=Ve(o>>>0),p=Ve(p),m=Ve(m),o[p]=m}function y0(o,p){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),p>>>=0,o=new Date(1e3*o),(v(),R)[p>>>2>>>0]=o.getUTCSeconds(),(v(),R)[p+4>>>2>>>0]=o.getUTCMinutes(),(v(),R)[p+8>>>2>>>0]=o.getUTCHours(),(v(),R)[p+12>>>2>>>0]=o.getUTCDate(),(v(),R)[p+16>>>2>>>0]=o.getUTCMonth(),(v(),R)[p+20>>>2>>>0]=o.getUTCFullYear()-1900,(v(),R)[p+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(v(),R)[p+28>>>2>>>0]=o}var yh=o=>o%4==0&&(o%100!=0||o%400==0),_h=[0,31,60,91,121,152,182,213,244,274,305,335],bh=[0,31,59,90,120,151,181,212,243,273,304,334];function _0(o,p){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),p>>>=0,o=new Date(1e3*o),(v(),R)[p>>>2>>>0]=o.getSeconds(),(v(),R)[p+4>>>2>>>0]=o.getMinutes(),(v(),R)[p+8>>>2>>>0]=o.getHours(),(v(),R)[p+12>>>2>>>0]=o.getDate(),(v(),R)[p+16>>>2>>>0]=o.getMonth(),(v(),R)[p+20>>>2>>>0]=o.getFullYear()-1900,(v(),R)[p+24>>>2>>>0]=o.getDay();var m=(yh(o.getFullYear())?_h:bh)[o.getMonth()]+o.getDate()-1|0;(v(),R)[p+28>>>2>>>0]=m,(v(),R)[p+36>>>2>>>0]=-60*o.getTimezoneOffset(),m=new Date(o.getFullYear(),6,1).getTimezoneOffset();var f=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(m!=f&&o.getTimezoneOffset()==Math.min(f,m)),(v(),R)[p+32>>>2>>>0]=o}function b0(o){o>>>=0;var p=new Date((v(),R)[o+20>>>2>>>0]+1900,(v(),R)[o+16>>>2>>>0],(v(),R)[o+12>>>2>>>0],(v(),R)[o+8>>>2>>>0],(v(),R)[o+4>>>2>>>0],(v(),R)[o>>>2>>>0],0),m=(v(),R)[o+32>>>2>>>0],f=p.getTimezoneOffset(),w=new Date(p.getFullYear(),6,1).getTimezoneOffset(),T=new Date(p.getFullYear(),0,1).getTimezoneOffset(),z=Math.min(T,w);return 0>m?(v(),R)[o+32>>>2>>>0]=+(w!=T&&z==f):0<m!=(z==f)&&(w=Math.max(T,w),p.setTime(p.getTime()+6e4*((0<m?z:w)-f))),(v(),R)[o+24>>>2>>>0]=p.getDay(),m=(yh(p.getFullYear())?_h:bh)[p.getMonth()]+p.getDate()-1|0,(v(),R)[o+28>>>2>>>0]=m,(v(),R)[o>>>2>>>0]=p.getSeconds(),(v(),R)[o+4>>>2>>>0]=p.getMinutes(),(v(),R)[o+8>>>2>>>0]=p.getHours(),(v(),R)[o+12>>>2>>>0]=p.getDate(),(v(),R)[o+16>>>2>>>0]=p.getMonth(),(v(),R)[o+20>>>2>>>0]=p.getYear(),o=p.getTime(),BigInt(isNaN(o)?-1:o/1e3)}function $h(o,p,m,f,w,T,z){return a?ie(16,1,o,p,m,f,w,T,z):-52}function wh(o,p,m,f,w,T){if(a)return ie(17,1,o,p,m,f,w,T)}var mr={},$0=()=>performance.timeOrigin+performance.now();function vh(o,p){if(a)return ie(18,1,o,p);if(mr[o]&&(clearTimeout(mr[o].id),delete mr[o]),!p)return 0;var m=setTimeout(()=>{delete mr[o],Zr(()=>Dh(o,performance.timeOrigin+performance.now()))},p);return mr[o]={id:m,Yd:p},0}function w0(o,p,m,f){o>>>=0,p>>>=0,m>>>=0,f>>>=0;var w=new Date().getFullYear(),T=new Date(w,0,1).getTimezoneOffset();w=new Date(w,6,1).getTimezoneOffset();var z=Math.max(T,w);(v(),K)[o>>>2>>>0]=60*z,(v(),R)[p>>>2>>>0]=+(T!=w),o=(p=B=>{var L=Math.abs(B);return`UTC${0<=B?"-":"+"}${String(Math.floor(L/60)).padStart(2,"0")}${String(L%60).padStart(2,"0")}`})(T),p=p(w),w<T?(wt(o,m,17),wt(p,f,17)):(wt(o,f,17),wt(p,m,17))}var v0=()=>Date.now();function x0(o,p,m){return m>>>=0,0<=o&&3>=o?(o===0?o=Date.now():o=performance.timeOrigin+performance.now(),o=Math.round(1e6*o),(v(),fe)[m>>>3>>>0]=BigInt(o),0):28}var un=[],xh=(o,p)=>{un.length=0;for(var m;m=(v(),H)[o++>>>0];){var f=m!=105;p+=(f&=m!=112)&&p%8?4:0,un.push(m==112?(v(),K)[p>>>2>>>0]:m==106?(v(),fe)[p>>>3>>>0]:m==105?(v(),R)[p>>>2>>>0]:(v(),ee)[p>>>3>>>0]),p+=f?8:4}return un};function S0(o,p,m){return o>>>=0,p=xh(p>>>0,m>>>0),gn[o](...p)}function k0(o,p,m){return o>>>=0,p=xh(p>>>0,m>>>0),gn[o](...p)}var T0=()=>{};function I0(o,p){return E(ke(o>>>0,p>>>0))}var E0=()=>{throw $e+=1,"unwind"};function z0(){return 4294901760}var C0=()=>navigator.hardwareConcurrency,Lt={},ti=o=>{var p;return(p=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+p[1]:(p=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+p[1]:0},Sh=o=>{for(var p of o)(o=ti(p))&&(Lt[o]=p)};function A0(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),Sh(o),Lt.gd=ti(o[3]),Lt.Jd=o,Lt.gd}function ri(o){if(!(o=Lt[o>>>0]))return 0;var p;if(p=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=p[1];else if(p=/^\s+at (.*) \(.*\)$/.exec(o))o=p[1];else{if(!(p=/^(.+?)@/.exec(o)))return 0;o=p[1]}at(ri.hd??0),p=Xr(o)+1;var m=gr(p);return m&&wt(o,m,p),ri.hd=m,ri.hd}function O0(o){o>>>=0;var p=(v(),H).length;if(o<=p||4294901760<o)return!1;for(var m=1;4>=m;m*=2){var f=p*(1+.2/m);f=Math.min(f,o+100663296);e:{f=(Math.min(4294901760,65536*Math.ceil(Math.max(o,f)/65536))-$t.buffer.byteLength+65535)/65536|0;try{$t.grow(f),V();var w=1;break e}catch{}w=void 0}if(w)return!0}return!1}function R0(o,p,m){if(o>>>=0,p>>>=0,Lt.gd==o)var f=Lt.Jd;else(f=Error().stack.toString().split(`
`))[0]=="Error"&&f.shift(),Sh(f);for(var w=3;f[w]&&ti(f[w])!=o;)++w;for(o=0;o<m&&f[o+w];++o)(v(),R)[p+4*o>>>2>>>0]=ti(f[o+w]);return o}var ln,dn={},kh=()=>{var f;if(!ln){var o,p={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(((f=globalThis.navigator)==null?void 0:f.language)??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in dn)dn[o]===void 0?delete p[o]:p[o]=dn[o];var m=[];for(o in p)m.push(`${o}=${p[o]}`);ln=m}return ln};function Th(o,p){if(a)return ie(19,1,o,p);o>>>=0,p>>>=0;var m,f=0,w=0;for(m of kh()){var T=p+f;(v(),K)[o+w>>>2>>>0]=T,f+=wt(m,T,1/0)+1,w+=4}return 0}function Ih(o,p){if(a)return ie(20,1,o,p);o>>>=0,p>>>=0;var m=kh();for(var f of((v(),K)[o>>>2>>>0]=m.length,o=0,m))o+=Xr(f)+1;return(v(),K)[p>>>2>>>0]=o,0}function Eh(o){return a?ie(21,1,o):52}function zh(o,p,m,f){return a?ie(22,1,o,p,m,f):52}function Ch(o,p,m,f){return a?ie(23,1,o,p,m,f):70}var B0=[null,[],[]];function Ah(o,p,m,f){if(a)return ie(24,1,o,p,m,f);p>>>=0,m>>>=0,f>>>=0;for(var w=0,T=0;T<m;T++){var z=(v(),K)[p>>>2>>>0],B=(v(),K)[p+4>>>2>>>0];p+=8;for(var L=0;L<B;L++){var G=o,ne=(v(),H)[z+L>>>0],pe=B0[G];ne===0||ne===10?((G===1?k:E)(Xc(pe)),pe.length=0):pe.push(ne)}w+=B}return(v(),K)[f>>>2>>>0]=w,0}function M0(o){return o>>>0}a||(function(){for(var o=t.numThreads-1;o--;)Wc();Be.push(async()=>{var p=(async function(){if(!a)return Promise.all(bt.map(Lc))})();Pe++,await p,--Pe==0&&Me&&(p=Me,Me=null,p())})})(),a||($t=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),V()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>oe(),t.stackRestore=o=>se(o),t.stackAlloc=o=>hn(o),t.setValue=function(o,p,m="i8"){switch(m.endsWith("*")&&(m="*"),m){case"i1":case"i8":(v(),D)[o>>>0]=p;break;case"i16":(v(),F)[o>>>1>>>0]=p;break;case"i32":(v(),R)[o>>>2>>>0]=p;break;case"i64":(v(),fe)[o>>>3>>>0]=BigInt(p);break;case"float":(v(),X)[o>>>2>>>0]=p;break;case"double":(v(),ee)[o>>>3>>>0]=p;break;case"*":(v(),K)[o>>>2>>>0]=p;break;default:q(`invalid type for setValue: ${m}`)}},t.getValue=function(o,p="i8"){switch(p.endsWith("*")&&(p="*"),p){case"i1":case"i8":return(v(),D)[o>>>0];case"i16":return(v(),F)[o>>>1>>>0];case"i32":return(v(),R)[o>>>2>>>0];case"i64":return(v(),fe)[o>>>3>>>0];case"float":return(v(),X)[o>>>2>>>0];case"double":return(v(),ee)[o>>>3>>>0];case"*":return(v(),K)[o>>>2>>>0];default:q(`invalid type for getValue: ${p}`)}},t.UTF8ToString=ke,t.stringToUTF8=wt,t.lengthBytesUTF8=Xr;var Oh,Rh,ii,at,gr,pn,Bh,Mh,Nh,cn,Dh,Uh,le,yr,Ph,se,hn,oe,qh,fn,Lh,Wh,Vh,mn,Gh,Hh,Fh,jh,Kh,Xh,Zh,Yh,Qh,Jh,ef,tf,rf,af,nf,sf,of,uf,lf,df,pf,cf,hf,ff,mf,gf,yf,_f,bf,$f,wf,vf,xf,Sf,kf,Tf,If,Ef,zf,pt,N0=[qe,Fr,Hc,Zc,Yc,Qc,Jc,eh,th,rh,ih,ah,nh,sh,oh,uh,$h,wh,vh,Th,Ih,Eh,zh,Ch,Ah],gn={973212:(o,p,m,f,w)=>{if(t===void 0||!t.Xc)return 1;if((o=ke(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.Xc.get(o)))return 2;if(p=Number(p>>>0),m=Number(m>>>0),f=Number(f>>>0),p+m>o.byteLength)return 3;try{let T=o.subarray(p,p+m);switch(w){case 0:(v(),H).set(T,f>>>0);break;case 1:t.Qd?t.Qd(f,T):t.Id(f,T);break;default:return 4}return 0}catch{return 4}},974036:(o,p,m)=>{t.td(o,(v(),H).subarray(p>>>0,p+m>>>0))},974100:()=>t.Wd(),974142:o=>{t.sd(o)},974179:()=>{t.Bd()},974210:()=>{t.Cd()},974239:()=>{t.Gd()},974264:o=>t.Ad(o),974297:o=>t.Ed(o),974329:(o,p,m)=>{t.ed(Number(o),Number(p),Number(m),!0)},974392:(o,p,m)=>{t.ed(Number(o),Number(p),Number(m))},974449:()=>typeof wasmOffsetConverter<"u",974506:o=>{t.$b("Abs",o,void 0)},974557:o=>{t.$b("Neg",o,void 0)},974608:o=>{t.$b("Floor",o,void 0)},974661:o=>{t.$b("Ceil",o,void 0)},974713:o=>{t.$b("Reciprocal",o,void 0)},974771:o=>{t.$b("Sqrt",o,void 0)},974823:o=>{t.$b("Exp",o,void 0)},974874:o=>{t.$b("Erf",o,void 0)},974925:o=>{t.$b("Sigmoid",o,void 0)},974980:(o,p,m)=>{t.$b("HardSigmoid",o,{alpha:p,beta:m})},975059:o=>{t.$b("Log",o,void 0)},975110:o=>{t.$b("Sin",o,void 0)},975161:o=>{t.$b("Cos",o,void 0)},975212:o=>{t.$b("Tan",o,void 0)},975263:o=>{t.$b("Asin",o,void 0)},975315:o=>{t.$b("Acos",o,void 0)},975367:o=>{t.$b("Atan",o,void 0)},975419:o=>{t.$b("Sinh",o,void 0)},975471:o=>{t.$b("Cosh",o,void 0)},975523:o=>{t.$b("Asinh",o,void 0)},975576:o=>{t.$b("Acosh",o,void 0)},975629:o=>{t.$b("Atanh",o,void 0)},975682:o=>{t.$b("Tanh",o,void 0)},975734:o=>{t.$b("Not",o,void 0)},975785:(o,p,m)=>{t.$b("Clip",o,{min:p,max:m})},975854:o=>{t.$b("Clip",o,void 0)},975906:(o,p)=>{t.$b("Elu",o,{alpha:p})},975964:o=>{t.$b("Gelu",o,void 0)},976016:o=>{t.$b("Relu",o,void 0)},976068:(o,p)=>{t.$b("LeakyRelu",o,{alpha:p})},976132:(o,p)=>{t.$b("ThresholdedRelu",o,{alpha:p})},976202:(o,p)=>{t.$b("Cast",o,{to:p})},976260:o=>{t.$b("Add",o,void 0)},976311:o=>{t.$b("Sub",o,void 0)},976362:o=>{t.$b("Mul",o,void 0)},976413:o=>{t.$b("Div",o,void 0)},976464:o=>{t.$b("Pow",o,void 0)},976515:o=>{t.$b("Equal",o,void 0)},976568:o=>{t.$b("Greater",o,void 0)},976623:o=>{t.$b("GreaterOrEqual",o,void 0)},976685:o=>{t.$b("Less",o,void 0)},976737:o=>{t.$b("LessOrEqual",o,void 0)},976796:(o,p,m,f,w)=>{t.$b("ReduceMean",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},976971:(o,p,m,f,w)=>{t.$b("ReduceMax",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},977145:(o,p,m,f,w)=>{t.$b("ReduceMin",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},977319:(o,p,m,f,w)=>{t.$b("ReduceProd",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},977494:(o,p,m,f,w)=>{t.$b("ReduceSum",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},977668:(o,p,m,f,w)=>{t.$b("ReduceL1",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},977841:(o,p,m,f,w)=>{t.$b("ReduceL2",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},978014:(o,p,m,f,w)=>{t.$b("ReduceLogSum",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},978191:(o,p,m,f,w)=>{t.$b("ReduceSumSquare",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},978371:(o,p,m,f,w)=>{t.$b("ReduceLogSumExp",o,{keepDims:!!p,noopWithEmptyAxes:!!m,axes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},978551:o=>{t.$b("Where",o,void 0)},978604:(o,p,m)=>{t.$b("Transpose",o,{perm:p?Array.from((v(),R).subarray(Number(p)>>>0,Number(m)>>>0)):[]})},978728:(o,p,m,f)=>{t.$b("DepthToSpace",o,{blocksize:p,mode:ke(m),format:f?"NHWC":"NCHW"})},978861:(o,p,m,f)=>{t.$b("DepthToSpace",o,{blocksize:p,mode:ke(m),format:f?"NHWC":"NCHW"})},978994:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we,xt)=>{t.$b("ConvTranspose",o,{format:L?"NHWC":"NCHW",autoPad:p,dilations:[m],group:f,kernelShape:[w],pads:[T,z],strides:[B],wIsConst:()=>!!(v(),D)[G>>>0],outputPadding:ne?Array.from((v(),R).subarray(Number(ne)>>>0,Number(pe)>>>0)):[],outputShape:ye?Array.from((v(),R).subarray(Number(ye)>>>0,Number(we)>>>0)):[],activation:ke(xt)})},979427:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we)=>{t.$b("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:p,dilations:Array.from((v(),R).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:f,kernelShape:Array.from((v(),R).subarray(Number(w)>>>0,2+(Number(w)>>>0)>>>0)),pads:Array.from((v(),R).subarray(Number(T)>>>0,4+(Number(T)>>>0)>>>0)),strides:Array.from((v(),R).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(v(),D)[L>>>0],outputPadding:G?Array.from((v(),R).subarray(Number(G)>>>0,Number(ne)>>>0)):[],outputShape:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ye)>>>0)):[],activation:ke(we)})},980088:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we,xt)=>{t.$b("ConvTranspose",o,{format:L?"NHWC":"NCHW",autoPad:p,dilations:[m],group:f,kernelShape:[w],pads:[T,z],strides:[B],wIsConst:()=>!!(v(),D)[G>>>0],outputPadding:ne?Array.from((v(),R).subarray(Number(ne)>>>0,Number(pe)>>>0)):[],outputShape:ye?Array.from((v(),R).subarray(Number(ye)>>>0,Number(we)>>>0)):[],activation:ke(xt)})},980521:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we)=>{t.$b("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:p,dilations:Array.from((v(),R).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:f,kernelShape:Array.from((v(),R).subarray(Number(w)>>>0,2+(Number(w)>>>0)>>>0)),pads:Array.from((v(),R).subarray(Number(T)>>>0,4+(Number(T)>>>0)>>>0)),strides:Array.from((v(),R).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(v(),D)[L>>>0],outputPadding:G?Array.from((v(),R).subarray(Number(G)>>>0,Number(ne)>>>0)):[],outputShape:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ye)>>>0)):[],activation:ke(we)})},981182:(o,p)=>{t.$b("GlobalAveragePool",o,{format:p?"NHWC":"NCHW"})},981273:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we)=>{t.$b("AveragePool",o,{format:we?"NHWC":"NCHW",auto_pad:p,ceil_mode:m,count_include_pad:f,storage_order:w,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:G?Array.from((v(),R).subarray(Number(G)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},981752:(o,p)=>{t.$b("GlobalAveragePool",o,{format:p?"NHWC":"NCHW"})},981843:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we)=>{t.$b("AveragePool",o,{format:we?"NHWC":"NCHW",auto_pad:p,ceil_mode:m,count_include_pad:f,storage_order:w,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:G?Array.from((v(),R).subarray(Number(G)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},982322:(o,p)=>{t.$b("GlobalMaxPool",o,{format:p?"NHWC":"NCHW"})},982409:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we)=>{t.$b("MaxPool",o,{format:we?"NHWC":"NCHW",auto_pad:p,ceil_mode:m,count_include_pad:f,storage_order:w,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:G?Array.from((v(),R).subarray(Number(G)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},982884:(o,p)=>{t.$b("GlobalMaxPool",o,{format:p?"NHWC":"NCHW"})},982971:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we)=>{t.$b("MaxPool",o,{format:we?"NHWC":"NCHW",auto_pad:p,ceil_mode:m,count_include_pad:f,storage_order:w,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:G?Array.from((v(),R).subarray(Number(G)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ye)>>>0)):[]})},983446:(o,p,m,f,w)=>{t.$b("Gemm",o,{alpha:p,beta:m,transA:f,transB:w})},983550:o=>{t.$b("MatMul",o,void 0)},983604:(o,p,m,f)=>{t.$b("ArgMax",o,{keepDims:!!p,selectLastIndex:!!m,axis:f})},983712:(o,p,m,f)=>{t.$b("ArgMin",o,{keepDims:!!p,selectLastIndex:!!m,axis:f})},983820:(o,p)=>{t.$b("Softmax",o,{axis:p})},983883:(o,p)=>{t.$b("Concat",o,{axis:p})},983943:(o,p,m,f,w)=>{t.$b("Split",o,{axis:p,numOutputs:m,splitSizes:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},984099:o=>{t.$b("Expand",o,void 0)},984153:(o,p)=>{t.$b("Gather",o,{axis:Number(p)})},984224:(o,p)=>{t.$b("GatherElements",o,{axis:Number(p)})},984303:(o,p)=>{t.$b("GatherND",o,{batch_dims:Number(p)})},984382:(o,p,m,f,w,T,z,B,L,G,ne)=>{t.$b("Resize",o,{antialias:p,axes:m?Array.from((v(),R).subarray(Number(m)>>>0,Number(f)>>>0)):[],coordinateTransformMode:ke(w),cubicCoeffA:T,excludeOutside:z,extrapolationValue:B,keepAspectRatioPolicy:ke(L),mode:ke(G),nearestMode:ke(ne)})},984744:(o,p,m,f,w,T,z)=>{t.$b("Slice",o,{starts:p?Array.from((v(),R).subarray(Number(p)>>>0,Number(m)>>>0)):[],ends:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[],axes:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[]})},985008:o=>{t.$b("Tile",o,void 0)},985060:(o,p,m)=>{t.$b("InstanceNormalization",o,{epsilon:p,format:m?"NHWC":"NCHW"})},985174:(o,p,m)=>{t.$b("InstanceNormalization",o,{epsilon:p,format:m?"NHWC":"NCHW"})},985288:o=>{t.$b("Range",o,void 0)},985341:(o,p)=>{t.$b("Einsum",o,{equation:ke(p)})},985422:(o,p,m,f,w)=>{t.$b("Pad",o,{mode:p,value:m,pads:f?Array.from((v(),R).subarray(Number(f)>>>0,Number(w)>>>0)):[]})},985565:(o,p,m,f,w,T)=>{t.$b("BatchNormalization",o,{epsilon:p,momentum:m,spatial:!!w,trainingMode:!!f,format:T?"NHWC":"NCHW"})},985734:(o,p,m,f,w,T)=>{t.$b("BatchNormalization",o,{epsilon:p,momentum:m,spatial:!!w,trainingMode:!!f,format:T?"NHWC":"NCHW"})},985903:(o,p,m)=>{t.$b("CumSum",o,{exclusive:Number(p),reverse:Number(m)})},986e3:(o,p,m)=>{t.$b("DequantizeLinear",o,{axis:p,blockSize:m})},986090:(o,p,m,f,w)=>{t.$b("GridSample",o,{align_corners:p,mode:ke(m),padding_mode:ke(f),format:w?"NHWC":"NCHW"})},986260:(o,p,m,f,w)=>{t.$b("GridSample",o,{align_corners:p,mode:ke(m),padding_mode:ke(f),format:w?"NHWC":"NCHW"})},986430:(o,p)=>{t.$b("ScatterND",o,{reduction:ke(p)})},986515:(o,p,m,f,w,T,z,B,L)=>{t.$b("Attention",o,{numHeads:p,isUnidirectional:m,maskFilterValue:f,scale:w,doRotary:T,qkvHiddenSizes:z?Array.from((v(),R).subarray(Number(B)>>>0,Number(B)+z>>>0)):[],pastPresentShareBuffer:!!L})},986787:o=>{t.$b("BiasAdd",o,void 0)},986842:o=>{t.$b("BiasSplitGelu",o,void 0)},986903:o=>{t.$b("FastGelu",o,void 0)},986959:(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we,xt,yn)=>{t.$b("Conv",o,{format:pe?"NHWC":"NCHW",auto_pad:p,dilations:m?Array.from((v(),R).subarray(Number(m)>>>0,Number(f)>>>0)):[],group:w,kernel_shape:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],pads:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],strides:G?Array.from((v(),R).subarray(Number(G)>>>0,Number(ne)>>>0)):[],w_is_const:()=>!!(v(),D)[Number(ye)>>>0],activation:ke(we),activation_params:xt?Array.from((v(),X).subarray(Number(xt)>>>0,Number(yn)>>>0)):[]})},987543:o=>{t.$b("Gelu",o,void 0)},987595:(o,p,m,f,w,T,z,B,L)=>{t.$b("GroupQueryAttention",o,{numHeads:p,kvNumHeads:m,scale:f,softcap:w,doRotary:T,rotaryInterleaved:z,smoothSoftmax:B,localWindowSize:L})},987812:(o,p,m,f)=>{t.$b("LayerNormalization",o,{axis:p,epsilon:m,simplified:!!f})},987923:(o,p,m,f)=>{t.$b("LayerNormalization",o,{axis:p,epsilon:m,simplified:!!f})},988034:(o,p,m,f,w,T)=>{t.$b("MatMulNBits",o,{k:p,n:m,accuracyLevel:f,bits:w,blockSize:T})},988161:(o,p,m,f,w,T)=>{t.$b("MultiHeadAttention",o,{numHeads:p,isUnidirectional:m,maskFilterValue:f,scale:w,doRotary:T})},988320:(o,p)=>{t.$b("QuickGelu",o,{alpha:p})},988384:(o,p,m,f,w)=>{t.$b("RotaryEmbedding",o,{interleaved:!!p,numHeads:m,rotaryEmbeddingDim:f,scale:w})},988523:(o,p,m)=>{t.$b("SkipLayerNormalization",o,{epsilon:p,simplified:!!m})},988625:(o,p,m)=>{t.$b("SkipLayerNormalization",o,{epsilon:p,simplified:!!m})},988727:(o,p,m,f)=>{t.$b("GatherBlockQuantized",o,{gatherAxis:p,quantizeAxis:m,blockSize:f})},988848:o=>{t.Fd(o)},988882:(o,p)=>t.Hd(Number(o),Number(p),t.Yc.Kd,t.Yc.errors)};function D0(o,p,m){return mh(async()=>{await t.Dd(Number(o),Number(p),Number(m))})}function U0(){return typeof wasmOffsetConverter<"u"}function P0(o,p,m,f){var w=oe();try{return Yh(o,p,m,f)}catch(T){if(se(w),T!==T+0)throw T;le(1,0)}}function q0(o,p,m){var f=oe();try{return jh(o,p,m)}catch(w){if(se(f),w!==w+0)throw w;le(1,0)}}function L0(o){var p=oe();try{Gh(o)}catch(m){if(se(p),m!==m+0)throw m;le(1,0)}}function W0(o,p){var m=oe();try{return mn(o,p)}catch(f){if(se(m),f!==f+0)throw f;le(1,0)}}function V0(o,p,m){var f=oe();try{Vh(o,p,m)}catch(w){if(se(f),w!==w+0)throw w;le(1,0)}}function G0(o,p){var m=oe();try{Qh(o,p)}catch(f){if(se(m),f!==f+0)throw f;le(1,0)}}function H0(o,p,m,f,w,T,z){var B=oe();try{return Xh(o,p,m,f,w,T,z)}catch(L){if(se(B),L!==L+0)throw L;le(1,0)}}function F0(o,p,m,f,w,T){var z=oe();try{Hh(o,p,m,f,w,T)}catch(B){if(se(z),B!==B+0)throw B;le(1,0)}}function j0(o,p,m,f){var w=oe();try{Zh(o,p,m,f)}catch(T){if(se(w),T!==T+0)throw T;le(1,0)}}function K0(o,p,m,f,w){var T=oe();try{Fh(o,p,m,f,w)}catch(z){if(se(T),z!==z+0)throw z;le(1,0)}}function X0(o,p,m,f,w,T,z){var B=oe();try{ef(o,p,m,f,w,T,z)}catch(L){if(se(B),L!==L+0)throw L;le(1,0)}}function Z0(o,p,m,f,w,T,z){var B=oe();try{tf(o,p,m,f,w,T,z)}catch(L){if(se(B),L!==L+0)throw L;le(1,0)}}function Y0(o,p,m,f,w,T,z,B){var L=oe();try{sf(o,p,m,f,w,T,z,B)}catch(G){if(se(L),G!==G+0)throw G;le(1,0)}}function Q0(o,p,m,f,w){var T=oe();try{return Jh(o,p,m,f,w)}catch(z){if(se(T),z!==z+0)throw z;le(1,0)}}function J0(o,p,m){var f=oe();try{return of(o,p,m)}catch(w){if(se(f),w!==w+0)throw w;le(1,0)}}function ey(o,p,m,f,w,T,z,B){var L=oe();try{uf(o,p,m,f,w,T,z,B)}catch(G){if(se(L),G!==G+0)throw G;le(1,0)}}function ty(o,p,m,f,w,T,z,B,L,G,ne,pe){var ye=oe();try{rf(o,p,m,f,w,T,z,B,L,G,ne,pe)}catch(we){if(se(ye),we!==we+0)throw we;le(1,0)}}function ry(o,p,m,f,w,T){var z=oe();try{return af(o,p,m,f,w,T)}catch(B){if(se(z),B!==B+0)throw B;le(1,0)}}function iy(o,p,m){var f=oe();try{return lf(o,p,m)}catch(w){if(se(f),w!==w+0)throw w;return le(1,0),0n}}function ay(o,p,m,f,w,T,z,B,L){var G=oe();try{Kh(o,p,m,f,w,T,z,B,L)}catch(ne){if(se(G),ne!==ne+0)throw ne;le(1,0)}}function ny(o){var p=oe();try{return df(o)}catch(m){if(se(p),m!==m+0)throw m;le(1,0)}}function sy(o,p){var m=oe();try{return kf(o,p)}catch(f){if(se(m),f!==f+0)throw f;return le(1,0),0n}}function oy(o){var p=oe();try{return pf(o)}catch(m){if(se(p),m!==m+0)throw m;return le(1,0),0n}}function uy(o,p,m,f){var w=oe();try{return yf(o,p,m,f)}catch(T){if(se(w),T!==T+0)throw T;le(1,0)}}function ly(o,p,m,f,w){var T=oe();try{return _f(o,p,m,f,w)}catch(z){if(se(T),z!==z+0)throw z;le(1,0)}}function dy(o,p,m,f,w,T){var z=oe();try{return bf(o,p,m,f,w,T)}catch(B){if(se(z),B!==B+0)throw B;le(1,0)}}function py(o,p,m,f,w,T){var z=oe();try{return $f(o,p,m,f,w,T)}catch(B){if(se(z),B!==B+0)throw B;le(1,0)}}function cy(o,p,m,f,w,T,z,B){var L=oe();try{return nf(o,p,m,f,w,T,z,B)}catch(G){if(se(L),G!==G+0)throw G;le(1,0)}}function hy(o,p,m,f,w){var T=oe();try{return wf(o,p,m,f,w)}catch(z){if(se(T),z!==z+0)throw z;return le(1,0),0n}}function fy(o,p,m,f){var w=oe();try{return vf(o,p,m,f)}catch(T){if(se(w),T!==T+0)throw T;le(1,0)}}function my(o,p,m,f){var w=oe();try{return xf(o,p,m,f)}catch(T){if(se(w),T!==T+0)throw T;le(1,0)}}function gy(o,p,m,f,w,T,z,B,L,G,ne,pe){var ye=oe();try{return Sf(o,p,m,f,w,T,z,B,L,G,ne,pe)}catch(we){if(se(ye),we!==we+0)throw we;le(1,0)}}function yy(o,p,m,f,w,T,z,B,L,G,ne){var pe=oe();try{mf(o,p,m,f,w,T,z,B,L,G,ne)}catch(ye){if(se(pe),ye!==ye+0)throw ye;le(1,0)}}function _y(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we,xt,yn){var vy=oe();try{gf(o,p,m,f,w,T,z,B,L,G,ne,pe,ye,we,xt,yn)}catch(_n){if(se(vy),_n!==_n+0)throw _n;le(1,0)}}function by(o,p,m){var f=oe();try{return cf(o,p,m)}catch(w){if(se(f),w!==w+0)throw w;le(1,0)}}function $y(o,p,m){var f=oe();try{return hf(o,p,m)}catch(w){if(se(f),w!==w+0)throw w;le(1,0)}}function wy(o,p,m,f){var w=oe();try{ff(o,p,m,f)}catch(T){if(se(w),T!==T+0)throw T;le(1,0)}}function ai(){if(0<Pe)Me=ai;else if(a)b==null||b(t),Z();else{for(var o=Be;0<o.length;)o.shift()(t);0<Pe?Me=ai:(t.calledRun=!0,C||(Z(),b==null||b(t)))}}return a||(pt=await We(),ai()),t.PTR_SIZE=4,P?t:new Promise((o,p)=>{b=o,S=p})}var Ln,Wn,Jf=U(()=>{var e,t;Ln=qn,Wn=(t=(e=globalThis.self)==null?void 0:e.name)==null?void 0:t.startsWith("em-pthread"),Wn&&qn()}),fi,mi,Vn,De,Gn,wr,Hn,Fn,gi,jn,yi,Kn,_i,Xn,bi=U(()=>{pi(),fi=typeof location>"u"?void 0:location.origin,mi=self.location.href>"file:"&&self.location.href<"file;",Vn=()=>{{if(mi){let e=URL;return new URL(new e("ort.bundle.min.mjs",self.location.href).href,fi).href}return self.location.href}},De=Vn(),Gn=()=>{if(De&&!De.startsWith("blob:"))return De.substring(0,De.lastIndexOf("/")+1)},wr=(e,t)=>{try{let r=t??De;return(r?new URL(e,r):new URL(e)).origin===fi}catch{return!1}},Hn=(e,t)=>{let r=t??De;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Fn=(e,t)=>`${t??"./"}${e}`,gi=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},jn=async e=>(await import(e)).default,yi=(Qf(),Yt(Dn)).default,Kn=async()=>{if(!De)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(wr(De))return[void 0,yi()];let e=await gi(De);return[e,yi(e)]},_i=(Jf(),Yt(Pn)).default,Xn=async(e,t,r,i)=>{let a=_i&&!(e||t);if(a)if(De)a=wr(De)||i&&!r;else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,_i];{let n="ort-wasm-simd-threaded.jsep.mjs",s=e??Hn(n,t),u=r&&s&&!wr(s,t),l=u?await gi(s):s??Fn(n,t);return[u?l:void 0,await jn(l)]}}}),$i,vr,er,wi,Zn,Yn,Qn,vi,be,It=U(()=>{bi(),vr=!1,er=!1,wi=!1,Zn=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Yn=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Qn=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},vi=async e=>{if(vr)return Promise.resolve();if(er)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(wi)throw new Error("previous call to 'initializeWebAssembly()' failed.");er=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Qn())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Yn())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=Zn();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,n=typeof a=="string"?a:void 0,s=a==null?void 0:a.mjs,u=(s==null?void 0:s.href)??s,l=a==null?void 0:a.wasm,d=(l==null?void 0:l.href)??l,h=e.wasmBinary,[c,g]=await Xn(u,n,r>1,!!h||!!d),y=!1,_=[];if(t>0&&_.push(new Promise(b=>{setTimeout(()=>{y=!0,b()},t)})),_.push(new Promise((b,S)=>{let x={numThreads:r};if(h)x.wasmBinary=h,x.locateFile=$=>$;else if(d||n)x.locateFile=$=>d??n+$;else if(u&&u.indexOf("blob:")!==0)x.locateFile=$=>new URL($,u).href;else if(c){let $=Gn();$&&(x.locateFile=I=>$+I)}g(x).then($=>{er=!1,vr=!0,$i=$,b(),c&&URL.revokeObjectURL(c)},$=>{er=!1,wi=!0,S($)})})),await Promise.race(_),y)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},be=()=>{if(vr&&$i)return $i;throw new Error("WebAssembly is not initialized yet.")}}),Fe,xr,me,xi=U(()=>{It(),Fe=(e,t)=>{let r=be(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},xr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,n])=>{let s=t?t+a:a;if(typeof n=="object")xr(n,s+".",r,i);else if(typeof n=="string"||typeof n=="number")i(s,n.toString());else if(typeof n=="boolean")i(s,n?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof n}`)})},me=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let n=Number(t.getValue(a,i===4?"i32":"i64")),s=t.getValue(a+i,"*"),u=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${n}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),Jn,em=U(()=>{It(),xi(),Jn=e=>{let t=be(),r=0,i=[],a=e||{};try{if((e==null?void 0:e.logSeverityLevel)===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if((e==null?void 0:e.logVerbosityLevel)===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);(e==null?void 0:e.terminate)===void 0&&(a.terminate=!1);let n=0;return(e==null?void 0:e.tag)!==void 0&&(n=Fe(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,n),r===0&&me("Can't create run options."),(e==null?void 0:e.extra)!==void 0&&xr(e.extra,"",new WeakSet,(s,u)=>{let l=Fe(s,i),d=Fe(u,i);t._OrtAddRunConfigEntry(r,l,d)!==0&&me(`Can't set a run config entry: ${s} - ${u}.`)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(s=>t._free(s)),n}}}),es,ts,rs,Et,is,as,tm=U(()=>{It(),xi(),es=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},ts=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},rs=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},Et=(e,t,r,i)=>{let a=Fe(t,i),n=Fe(r,i);be()._OrtAddSessionConfigEntry(e,a,n)!==0&&me(`Can't set a session config entry: ${t} - ${r}.`)},is=async(e,t,r)=>{let i=t.executionProviders;for(let a of i){let n=typeof a=="string"?a:a.name,s=[];switch(n){case"webnn":if(n="WEBNN",Et(e,"session.disable_quant_qdq","1",r),Et(e,"session.disable_qdq_constant_folding","1",r),typeof a!="string"){let c=a==null?void 0:a.deviceType;c&&Et(e,"deviceType",c,r)}break;case"webgpu":if(n="JS",typeof a!="string"){let c=a;if(c!=null&&c.preferredLayout){if(c.preferredLayout!=="NCHW"&&c.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${c.preferredLayout}`);Et(e,"preferredLayout",c.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${n}`)}let u=Fe(n,r),l=s.length,d=0,h=0;if(l>0){d=be()._malloc(l*be().PTR_SIZE),r.push(d),h=be()._malloc(l*be().PTR_SIZE),r.push(h);for(let c=0;c<l;c++)be().setValue(d+c*be().PTR_SIZE,s[c][0],"*"),be().setValue(h+c*be().PTR_SIZE,s[c][1],"*")}await be()._OrtAppendExecutionProvider(e,u,d,h,l)!==0&&me(`Can't append execution provider: ${n}.`)}},as=async e=>{let t=be(),r=0,i=[],a=e||{};rs(a);try{let n=es(a.graphOptimizationLevel??"all"),s=ts(a.executionMode??"sequential"),u=typeof a.logId=="string"?Fe(a.logId,i):0,l=a.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log severity level is not valid: ${l}`);let d=a.logVerbosityLevel??0;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log verbosity level is not valid: ${d}`);let h=typeof a.optimizedModelFilePath=="string"?Fe(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(n,!!a.enableCpuMemArena,!!a.enableMemPattern,s,!!a.enableProfiling,0,u,l,d,h),r===0&&me("Can't create session options."),a.executionProviders&&await is(r,a,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);Et(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[c,g]of Object.entries(a.freeDimensionOverrides)){if(typeof c!="string")throw new Error(`free dimension override name must be a string: ${c}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let y=Fe(c,i);t._OrtAddFreeDimensionOverride(r,y,g)!==0&&me(`Can't set a free dimension override: ${c} - ${g}.`)}return a.extra!==void 0&&xr(a.extra,"",new WeakSet,(c,g)=>{Et(r,c,g,i)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&me("Can't release session options."),i.forEach(s=>t._free(s)),n}}}),zt,ot,Ct,Sr,kr,Si,ki,Ti,te=U(()=>{zt=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},ot=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},Ct=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,n)=>a*n,1);return r>0?Math.ceil(i*r):void 0},Sr=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},kr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Si=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",ki=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ti=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Ii,ns=U(()=>{pi(),Ii=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),n;try{n=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let l=Math.ceil(i/65536);n=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw u}let s=0;for(;;){let{done:u,value:l}=await a.read();if(u)break;let d=l.byteLength;new Uint8Array(n,s,d).set(l),s+=d}return new Uint8Array(n,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),ss,os,us,ls,Ei,ds,de,ut=U(()=>{te(),ss=["V","I","W","E","F"],os=(e,t)=>{console.log(`[${ss[e]},${new Date().toISOString()}]${t}`)},Ei=(e,t)=>{us=e,ls=t},ds=(e,t)=>{let r=kr(e),i=kr(us);r>=i&&os(r,typeof t=="function"?t():t)},de=(...e)=>{ls&&ds(...e)}}),ps,Ht,O,Tr,cs,hs,fs,re=U(()=>{ps=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Ht=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let n=Math.max(e.length,t.length),s=new Array(n);if(r){if(i<2||a<2)return;let u=ps.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(u===void 0)return;[s[n-2],s[n-1]]=u}for(let u=r?3:1;u<=n;u++){let l=i-u<0?1:e[i-u],d=a-u<0?1:t[a-u];if(l!==d&&l>1&&d>1)return;let h=Math.max(l,d);if(l&&d)s[n-u]=Math.max(l,d);else{if(h>1)return;s[n-u]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},O=class ni{static size(t){return ni.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),n=i-1;for(;n>=0;){if(t[n]%r===0){a[n]=t[n]/r;break}if(r%t[n]!==0)throw new Error("cannot convert shape");a[n]=1,r/=t[n],n--}for(n--;n>=0;n--)a[n]=t[n];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return ni.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return ni.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let n=r;n<i;n++){if(t[n]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[n])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,n)=>a+r[n]+r[n+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Tr=class _r{static adjustPoolAttributes(t,r,i,a,n,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length;u++)if(u<n.length){if(n[u]<0)throw new Error("dilations should be greater than or equal to 1")}else n.push(1);for(let u=0;u<i.length*2;u++)if(u<s.length){if(s[u]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[u]>=i[u]||s[u+i.length]>=i[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,n,s,u){if(u){if(n.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)_r.adjustPadAndReturnShape(t[l+(s?1:2)],r[l],i[l],a[l],n,l,l+t.length-2,u)}}static computePoolOutputShape(t,r,i,a,n,s,u){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let l=[r[0],r[1]];return _r.computeShapeHelper(t,r,l,i,a,n,s,u),l}static computeConvOutputShape(t,r,i,a,n,s,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return _r.computeShapeHelper(!1,t,l,i,a,n,s,u),l}static computeShapeHelper(t,r,i,a,n,s,u,l){if(t)for(let d=0;d<r.length-2;d++)i.push(1);else for(let d=0;d<r.length-2;d++)i.push(_r.adjustPadAndReturnShape(r[d+2],a[d],n[d],s[d],u,d,d+r.length-2,l))}static adjustPadAndReturnShape(t,r,i,a,n,s,u,l){let d=i*(a-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return n[s]=0,n[u]=0,Math.floor((t-d)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let h=((t+r-1)/r-1)*r+a-t;return n[s]=Math.floor(l==="SAME_LOWER"?(h+1)/2:h/2),n[u]=h-n[s],Math.floor((t+h-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+n[s]+n[u]-d)/r+1)}},cs=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let n,s,u;t?(n=e[1],s=e[0]):(n=e[0],s=e[1]);let l=-1;if(i?(u=r[0],l=1):(u=r[1],l=0),r[l]!==s)throw new Error("dimension mismatch");if(n<=0||u<=0||s<=0)throw new Error("invalid shape specified");if(a&&!Ht.isValidBroadcast(a,[n,u]))throw new Error("gemm: invalid bias shape for broadcast");return[n,u,s]}},hs=-34028234663852886e22,fs=34028234663852886e22}),zi,ms=U(()=>{te(),zi=(e,t)=>new(Sr(t))(e)}),Ci,Ai,Oi,gs,Ri,ys,Bi,Mi,Ni,_s,bs,rm=U(()=>{te(),ut(),Ci=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),Ai=(e,t)=>{if(t==="int32")return e;let r=Ci.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,n=new(Sr(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let s=new Int32Array(a);for(let u=0;u<a;u++){let l=n[u];if(l>2147483647n||l<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[u]=Number(l)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&n.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(n,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Oi=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(n=>n<-128||n>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},gs=1,Ri=()=>gs++,ys=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Bi=(e,t)=>{let r=Ci.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},Mi=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:n,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=n,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Bi(this.dataType,this.tensorShape)}destroy(){de("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Oi(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},Ni=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),n=this.tensorManager.getMLOpSupportLimits(e),s;if(!(n!=null&&n.input.dataTypes.includes(t))){if(s=ys.get(t),!s||(n==null?void 0:n.input.dataTypes.includes(s)))throw new Error(`WebNN backend does not support data type: ${t}`);de("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Bi(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=Ai(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else de("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){var t,r;if(this.activeUpload){let i=(t=this.wrapper)!=null&&t.isDataConverted?Oi(this.activeUpload,(r=this.wrapper)==null?void 0:r.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(i):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(i);return}else return i.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},_s=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Ri();return this.tensorTrackersById.set(e,new Ni(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){de("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let n=this.tensorTrackersById.get(t);if(!n)throw new Error("Tensor not found.");return n.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){de("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t==null?void 0:t.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),n=Ri(),s=new Mi({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(n,new Ni(this,s)),this.externalTensors.add(s),n}async getCachedTensor(e,t,r,i,a,n,s){let u=this.getMLContext(e);for(let[d,h]of this.freeTensors.entries())if(h.canReuseTensor(u,t,r)){de("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let c=this.freeTensors.splice(d,1)[0];return c.sessionId=e,c}de("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let l=await u.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:a,readable:n});return new Mi({sessionId:e,context:u,tensor:l,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},bs=(...e)=>new _s(...e)}),tr,$s,ws,im=U(()=>{te(),It(),ms(),rm(),ut(),tr=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),$s=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,n)=>a===i[n]&&e[a]===t[a])},ws=class{constructor(e){this.tensorManager=bs(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,Ei(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){de("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){de("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)de("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>$s(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){de("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let n=tr.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,n,i,a)}async createTemporaryTensor(e,t,r){de("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=tr.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let n=this.temporarySessionTensorIds.get(e);return n?n.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!be().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");de("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return zi(r,t)}}registerMLTensor(e,t,r,i){let a=tr.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let n=this.tensorManager.registerTensor(e,t,a,i);return de("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${n}}`),n}registerMLConstant(e,t,r,i,a,n,s=!1){if(!n)throw new Error("External mounted files are not available.");let u=e;e.startsWith("./")&&(u=e.substring(2));let l=n.get(u);if(!l)throw new Error(`File with name ${u} not found in preloaded files.`);if(t+r>l.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let d=l.slice(t,t+r).buffer,h;switch(a.dataType){case"float32":h=new Float32Array(d);break;case"float16":h=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(d):new Uint16Array(d);break;case"int32":h=new Int32Array(d);break;case"uint32":h=new Uint32Array(d);break;case"int64":if(s){let c=Ai(new Uint8Array(d),"int64");h=new Int32Array(c.buffer),a.dataType="int32"}else h=new BigInt64Array(d);break;case"uint64":h=new BigUint64Array(d);break;case"int8":h=new Int8Array(d);break;case"int4":case"uint4":case"uint8":h=new Uint8Array(d);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return de("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${s?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,h)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=tr.get(zt(t)),a=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!(a!=null&&a.input.dataTypes.includes(i)):!!(a!=null&&a.output.dataTypes.includes(i))}flush(){}}}),Di=U(()=>{}),Ui,Ir,Er,vs,xs,Pi,qi,Ss,ks,am=U(()=>{ut(),Di(),Ui=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Ir=[],Er=e=>Math.ceil(Number(e)/16)*16,vs=e=>{for(let t=0;t<Ir.length;t++){let r=Ir[t];if(e<=r)return r}return Math.ceil(e/16)*16},xs=1,Pi=()=>xs++,qi=async(e,t,r,i)=>{let a=Er(r),n=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,n,0,a),e.flush(),await n.mapAsync(GPUMapMode.READ);let u=n.getMappedRange();if(i){let l=i();return l.set(new Uint8Array(u,0,r)),l}else return new Uint8Array(u.slice(0,r))}finally{n.destroy()}},Ss=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Ui)Ir.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,n=Er(a),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${a}`);let u=this.backend.device.createBuffer({mappedAtCreation:!0,size:n,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),l=u.getMappedRange();new Uint8Array(l).set(new Uint8Array(r,i,a)),u.unmap();let d=this.backend.device.createCommandEncoder();d.copyBufferToBuffer(u,0,s.gpuData.buffer,0,n),this.backend.device.queue.submit([d.finish()]),u.destroy(),de("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Er(r.originalSize),n=this.backend.getCommandEncoder();this.backend.endComputePass(),n.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return de("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Pi();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),de("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),de("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=vs(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,n=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||n){let u=(a?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Pi(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),de("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){var t;return(t=this.storageCache.get(e))==null?void 0:t.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return de("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await qi(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Ui.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(de("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},ks=(...e)=>new Ss(...e)}),Ts,he,xe=U(()=>{Ts=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},he=e=>new Ts(e)}),Ft,zr,Te,ze,J,ve,Li,jt,ht,Q,rr,M,Y,Is,Wi,Es,zs,ae=U(()=>{te(),re(),Ft=64,zr=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},Te=(e,t=1)=>{let r=zr(e,t);return typeof r=="string"?r:r[0]},ze=(e,t=1)=>{let r=zr(e,t);return typeof r=="string"?r:r[1]},J=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:O.computeStrides(r)})}),t},ve=e=>e%4===0?4:e%2===0?2:1,Li=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,jt=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,ht=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Q=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,rr=(e,t,r,i,a)=>{let n=typeof r=="number",s=n?r:r.length,u=[...new Array(s).keys()],l=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,d=zr(t,a),h=typeof d=="string"?d:d[1],c=typeof d=="string"?d:d[0],g={indices:l,value:h,storage:c,tensor:t},y=P=>typeof P=="string"?P:`${P}u`,_={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},b=n?"uniforms.":"",S=`${b}${e}_shape`,x=`${b}${e}_strides`,$="";for(let P=0;P<s-1;P++)$+=`
    let dim${P} = current / ${Q(x,P,s)};
    let rest${P} = current % ${Q(x,P,s)};
    indices[${P}] = dim${P};
    current = rest${P};
    `;$+=`indices[${s-1}] = current;`;let I=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${$}
    return indices;
  }`,k=P=>(_.offsetToIndices=!0,s<2?P:`o2i_${e}(${P})`),E=[];if(s>=2)for(let P=s-1;P>=0;P--)E.push(`${Q(x,P,s)} * (indices[${P}])`);let C=s<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${E.join("+")};
  }`,A=P=>(_.indicesToOffset=!0,s<2?P:`i2o_${e}(${P})`),v=(...P)=>s===0?"0u":`${g.indices}(${P.map(y).join(",")})`,N=(P,V)=>s<2?`${P}`:`${Q(P,V,s)}`,D=(P,V,Z)=>s<2?`${P}=${Z};`:`${Q(P,V,s)}=${Z};`,H={},F=(P,V)=>{_.broadcastedIndicesToOffset=!0;let Z=`${V.name}broadcastedIndicesTo${e}Offset`;if(Z in H)return`${Z}(${P})`;let q=[];for(let ge=s-1;ge>=0;ge--){let We=V.indicesGet("outputIndices",ge+V.rank-s);q.push(`${N(x,ge)} * (${We} % ${N(S,ge)})`)}return H[Z]=`fn ${Z}(outputIndices: ${V.type.indices}) -> u32 {
             return ${q.length>0?q.join("+"):"0u"};
           }`,`${Z}(${P})`},j=(P,V)=>(()=>{if(g.storage===g.value)return`${e}[${P}]=${V};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${P}]=vec2<u32>(u32(${V}), select(0u, 0xFFFFFFFFu, ${V} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${P}]=vec2<u32>(u32(${V}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${P}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${V}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),R=P=>(()=>{if(g.storage===g.value)return`${e}[${P}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${P}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${P}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${P}] & 0xFFu), bool(${e}[${P}] & 0xFF00u), bool(${e}[${P}] & 0xFF0000u), bool(${e}[${P}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),K=s<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${h} {
    return ${R(`i2o_${e}(indices)`)};
  }`,X=s<2?"":(()=>{let P=u.map(Z=>`d${Z}: u32`).join(", "),V=u.map(Z=>`d${Z}`).join(", ");return`
  fn get_${e}(${P}) -> ${h} {
    return get_${e}ByIndices(${v(V)});
  }`})(),ee=(...P)=>{if(P.length!==s)throw new Error(`indices length must be ${s}`);let V=P.map(y).join(",");return s===0?R("0u"):s===1?R(V[0]):(_.get=!0,_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}(${V})`)},fe=P=>s<2?R(P):(_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}ByIndices(${P})`),W=s<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${h}) {
    ${j(`i2o_${e}(indices)`,"value")}
  }`,ue=s<2?"":(()=>{let P=u.map(Z=>`d${Z}: u32`).join(", "),V=u.map(Z=>`d${Z}`).join(", ");return`
  fn set_${e}(${P}, value: ${h}) {
    set_${e}ByIndices(${v(V)}, value);
  }`})();return{impl:()=>{let P=[],V=!1;return _.offsetToIndices&&(P.push(I),V=!0),_.indicesToOffset&&(P.push(C),V=!0),_.broadcastedIndicesToOffset&&(Object.values(H).forEach(Z=>P.push(Z)),V=!0),_.set&&(P.push(ue),V=!0),_.setByIndices&&(P.push(W),V=!0),_.get&&(P.push(X),V=!0),_.getByIndices&&(P.push(K),V=!0),!n&&V&&P.unshift(`const ${S} = ${g.indices}(${r.join(",")});`,`const ${x} = ${g.indices}(${O.computeStrides(r).join(",")});`),P.join(`
`)},type:g,offsetToIndices:k,indicesToOffset:A,broadcastedIndicesToOffset:F,indices:v,indicesGet:N,indicesSet:D,set:(...P)=>{if(P.length!==s+1)throw new Error(`indices length must be ${s}`);let V=P[s];if(typeof V!="string")throw new Error("value must be string");let Z=P.slice(0,s).map(y).join(",");return s===0?j("0u",V):s===1?j(Z[0],V):(_.set=!0,_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}(${Z}, ${V})`)},setByOffset:j,setByIndices:(P,V)=>s<2?j(P,V):(_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}ByIndices(${P}, ${V});`),get:ee,getByOffset:R,getByIndices:fe,usage:i,name:e,strides:x,shape:S,rank:s}},M=(e,t,r,i=1)=>rr(e,t,r,"input",i),Y=(e,t,r,i=1)=>rr(e,t,r,"output",i),Is=(e,t,r)=>rr(e,t,r,"atomicOutput",1),Wi=(e,t,r,i=1)=>rr(e,t,r,"internal",i),Es=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Ft){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,n=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${n}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},zs=(e,t)=>new Es(e,t)}),Cs,Vi,As,Os,Rs,Bs,Ue,Ms,Ns,ft=U(()=>{te(),re(),xe(),ae(),Cs=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Vi=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),As=(e,t)=>O.sortBasedOnPerm(e,Vi(e.length,t)),Os=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let n=0;n<t;++n)a+=`a[${e[n]}]=i[${n}];`;return a+="return a;}"},Rs=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},Bs=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Ue=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Vi(i,t),n=As(e.dims,a),s=e.dims,u=n,l=i<2||Bs(a,e.dims),d;if(l)return d=_=>{let b=M("input",r,s,4),S=Y("output",r,u,4);return`
  ${_.registerUniform("output_size","u32").declareVariables(b,S)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64/4)},programUniforms:[{type:12,data:Math.ceil(_/4)}]}},getShaderSource:d};let{newShape:h,newPerm:c}=Rs(e.dims,a),g=O.areEqual(c,[2,3,1]),y=O.areEqual(c,[3,1,2]);if(h.length===2||g||y){s=g?[h[0],h[1]*h[2]]:y?[h[0]*h[1],h[2]]:h,u=[s[1],s[0]];let _=16;return d=b=>{let S=M("a",r,s.length),x=Y("output",r,u.length);return`
  ${b.registerUniform("output_size","u32").declareVariables(S,x)}
  var<workgroup> tile : array<array<${x.type.value}, ${_+1}>, ${_}>;
  ${b.mainStart([_,_,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${_} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${_}u + local_id.x;
    let input_row = workgroup_id_x * ${_}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${S.getByIndices(`${S.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${_}u + local_id.x;
    let output_row = workgroup_id_y * ${_}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${x.setByIndices(`${x.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let b=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/_),y:Math.ceil(u[0]/_)},programUniforms:[{type:12,data:b},...J(s,u)]}},getShaderSource:d}}return d=_=>{let b=M("a",r,s.length),S=Y("output",r,u.length);return`
  ${_.registerUniform("output_size","u32").declareVariables(b,S)}

  ${Os(a,i,b,S)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${S.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${S.setByOffset("global_idx",b.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let _=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...J(s,u)]}},getShaderSource:d}},Ms=(e,t)=>{Cs(e.inputs,t.perm),e.compute(Ue(e.inputs[0],t.perm))},Ns=e=>he({perm:e.perm})}),Ds,Us,Ps,qs,Ls,Ws,Vs,Gs,Hs,Fs,je,js,Ks,Xs,Zs,Ys,Qs,Js,eo,to,ro,nm=U(()=>{te(),re(),ae(),Hi(),ft(),Ds={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},Us={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},Ps={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},qs={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Ls=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},Ws=(e,t)=>{let r=[],i=e.length;for(let n=0;n<i;n++)t.indexOf(n)===-1&&r.push(e[n]);let a=t.map(n=>e[n]);return[r,a]},Vs=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let n=0;n<r;n++)t.indexOf(n)===-1?i.push(e[a++]):i.push(1);return i},Gs=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Hs=(e,t)=>{let r=[];if(!Gs(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},Fs=(e,t,r,i,a,n,s)=>{let u=r[0].dims,l=O.size(n),d=O.size(s),h=M("_A",r[0].dataType,u),c=Y("output",a,n),g=64;l===1&&(g=256);let y=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,_=b=>`
        ${b.registerUniform("reduceSize","u32").declareVariables(h,c)}
        ${y}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${b.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${Ps[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${h.getByOffset("offset + k")});
           bestValue = ${Ds[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${Us[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${c.setByOffset("outputIndex",`${i==="mean"?`${c.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${c.type.storage}(${qs[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:l},programUniforms:[{type:12,data:d}]})}},je=(e,t,r,i)=>{let a=e.inputs.length===1?r:Gi(e.inputs,r),n=a.axes;n.length===0&&!a.noopWithEmptyAxes&&(n=e.inputs[0].dims.map((y,_)=>_));let s=O.normalizeAxes(n,e.inputs[0].dims.length),u=s,l=e.inputs[0],d=Hs(u,e.inputs[0].dims.length);d.length>0&&(l=e.compute(Ue(e.inputs[0],d),{inputs:[0],outputs:[-1]})[0],u=Ls(u.length,l.dims.length));let[h,c]=Ws(l.dims,u),g=h;a.keepDims&&(g=Vs(h,s)),e.compute(Fs(t,a.cacheKey,[l],i,e.inputs[0].dataType,g,c),{inputs:[l]})},js=(e,t)=>{je(e,"ReduceMeanShared",t,"mean")},Ks=(e,t)=>{je(e,"ReduceL1Shared",t,"l1")},Xs=(e,t)=>{je(e,"ReduceL2Shared",t,"l2")},Zs=(e,t)=>{je(e,"ReduceLogSumExpShared",t,"logSumExp")},Ys=(e,t)=>{je(e,"ReduceMaxShared",t,"max")},Qs=(e,t)=>{je(e,"ReduceMinShared",t,"min")},Js=(e,t)=>{je(e,"ReduceProdShared",t,"prod")},eo=(e,t)=>{je(e,"ReduceSumShared",t,"sum")},to=(e,t)=>{je(e,"ReduceSumSquareShared",t,"sumSquare")},ro=(e,t)=>{je(e,"ReduceLogSumShared",t,"logSum")}}),Ke,io,Cr,Gi,Xe,ao,no,so,oo,uo,lo,po,co,ho,fo,Ze,mo,go,yo,_o,bo,$o,wo,vo,xo,So,Hi=U(()=>{te(),re(),xe(),ae(),nm(),Ke=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},io=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Cr=(e,t,r,i,a,n,s=!1,u=!1)=>{let l=[],d=r[0].dims,h=d.length,c=O.normalizeAxes(a,h),g=!u&&c.length===0;d.forEach((b,S)=>{g||c.indexOf(S)>=0?s&&l.push(1):l.push(b)});let y=l.length,_=O.size(l);return{name:e,shaderCache:t,getShaderSource:b=>{let S=[],x=M("_A",r[0].dataType,h),$=Y("output",n,y),I=i(x,$,c),k=I[2];for(let E=0,C=0;E<h;E++)g||c.indexOf(E)>=0?(s&&C++,k=`for(var j${E}: u32 = 0; j${E} < ${d[E]}; j${E}++) {
                  ${I[2].includes("last_index")?`let last_index = j${E};`:""}
                  ${x.indicesSet("input_indices",E,`j${E}`)}
                  ${k}
                }`):(S.push(`${x.indicesSet("input_indices",E,$.indicesGet("output_indices",C))};`),C++);return`

        ${b.registerUniform("output_size","u32").declareVariables(x,$)}

        ${b.mainStart()}
          ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${x.type.indices};
          let output_indices = ${$.offsetToIndices("global_idx")};

          ${S.join(`
`)}
          ${I[0]}       // init ops for reduce max/min
          ${I[1]}
          ${k}
          ${I[3]}
          ${I.length===4?$.setByOffset("global_idx","value"):I.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:n}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...J(d,l)]})}},Gi=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),he({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Xe=(e,t,r,i)=>{let a=e.inputs,n=a.length===1?r:Gi(a,r);e.compute(Cr(t,{hint:n.cacheKey,inputDependencies:["rank"]},[a[0]],n.noopWithEmptyAxes&&n.axes.length===0?io:i,n.axes,a[0].dataType,n.keepDims,n.noopWithEmptyAxes),{inputs:[0]})},ao=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},no=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},so=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},oo=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},uo=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceMax",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(r.indicesSet("input_indices",s,0));return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},lo=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceMean",t,(r,i,a)=>{let n=1;for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&(n*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${n});`]})},po=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceMin",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(`input_indices[${s}] = 0;`);return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},co=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},ho=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},fo=(e,t)=>{Ke(e.inputs),Xe(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Ze=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let n=0;n<t.length;n++)t.indexOf(n)===-1?i*=e[n]:a*=e[n];return a<32&&i>1024},mo=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?lo(e,t):js(e,t)},go=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?no(e,t):Ks(e,t)},yo=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?so(e,t):Xs(e,t)},_o=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?oo(e,t):Zs(e,t)},bo=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?uo(e,t):Ys(e,t)},$o=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?po(e,t):Qs(e,t)},wo=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?co(e,t):Js(e,t)},vo=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?ho(e,t):eo(e,t)},xo=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?fo(e,t):to(e,t)},So=(e,t)=>{Ze(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?ao(e,t):ro(e,t)}}),Fi,ko,To,ji,sm=U(()=>{te(),xe(),Hi(),Fi=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},ko=(e,t)=>{Fi(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Cr("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},To=(e,t)=>{Fi(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Cr("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},ji=e=>he(e)}),Io,Ar,Eo,zo,Co,ir,Ao,Oo,Ki=U(()=>{te(),re(),Di(),ae(),Io=(e,t)=>{let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4],u=e[5];if(s&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let l=r.dims[0],d=r.dims[1],h=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==h)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let c=a.dims[0]/3,g=c,y=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let I of t.qkvHiddenSizes)if(I%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");c=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],y=t.qkvHiddenSizes[2]}let _=d;if(c!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==c+g+y)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let b=0;if(s){if(g!==y)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==l)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(b=s.dims[3])}let S=_+b,x=-1,$=0;if(n)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==l||u.dims[1]!==t.numHeads||u.dims[2]!==d||u.dims[3]!==S)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:d,pastSequenceLength:b,kvSequenceLength:_,totalSequenceLength:S,maxSequenceLength:x,inputHiddenSize:h,hiddenSize:c,vHiddenSize:y,headSize:Math.floor(c/t.numHeads),vHeadSize:Math.floor(y/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:$,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Ar=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e==null?void 0:e.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,Eo=(e,t,r,i,a,n,s,u)=>{let l=ve(s?1:n),d=64,h=n/l;h<d&&(d=32);let c=Math.ceil(n/l/d),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:h},{type:12,data:c}],y=Te(e.dataType,l),_=ze(1,l),b=["type"];s&&b.push("type"),u&&b.push("type");let S=x=>{let $=Y("x",e.dataType,e.dims,l),I=[$],k=s?M("seq_lens",s.dataType,s.dims):void 0;k&&I.push(k);let E=u?M("total_sequence_length_input",u.dataType,u.dims):void 0;E&&I.push(E);let C=ze(e.dataType),A=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${d}>;
  var<workgroup> thread_sum: array<f32, ${d}>;
  ${x.registerUniforms(A).declareVariables(...I)}
  ${x.mainStart([d,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Ar(k,E,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${d}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${_}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${_}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${d}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${_}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${_}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${d}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${$.type.value}(${C}(1.0) / ${C}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${_}(x[offset + i]);
        x[offset + i] = ${$.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${$.type.value}(${C}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${d};${y};${l}`,inputDependencies:b},getShaderSource:S,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:g})}},zo=(e,t,r,i,a,n,s,u,l)=>{let d=s+n.kvSequenceLength,h=[n.batchSize,n.numHeads,n.sequenceLength,d],c=e>1&&i,g=n.kvNumHeads?n.kvNumHeads:n.numHeads,y=c?[n.batchSize,g,d,n.headSize]:void 0,_=n.nReps?n.nReps:1,b=n.scale===0?1/Math.sqrt(n.headSize):n.scale,S=ve(n.headSize),x=n.headSize/S,$=12,I={x:Math.ceil(d/$),y:Math.ceil(n.sequenceLength/$),z:n.batchSize*n.numHeads},k=[{type:12,data:n.sequenceLength},{type:12,data:x},{type:12,data:d},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:1,data:b},{type:12,data:s},{type:12,data:n.kvSequenceLength},{type:12,data:_}],E=c&&i&&O.size(i.dims)>0,C=["type","type"];E&&C.push("type"),a&&C.push("type"),u&&C.push("type"),l&&C.push("type");let A=[{dims:h,dataType:t.dataType,gpuDataType:0}];c&&A.push({dims:y,dataType:t.dataType,gpuDataType:0});let v=N=>{let D=M("q",t.dataType,t.dims,S),H=M("key",r.dataType,r.dims,S),F=[D,H];if(E){let W=M("past_key",i.dataType,i.dims,S);F.push(W)}a&&F.push(M("attention_bias",a.dataType,a.dims));let j=u?M("seq_lens",u.dataType,u.dims):void 0;j&&F.push(j);let R=l?M("total_sequence_length_input",l.dataType,l.dims):void 0;R&&F.push(R);let K=Y("output",t.dataType,h),X=[K];c&&X.push(Y("present_key",t.dataType,y,S));let ee=ze(1,S),fe=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${$}u;

  var<workgroup> tileQ: array<${D.type.storage}, ${$*$}>;
  var<workgroup> tileK: array<${D.type.storage}, ${$*$}>;
  ${N.registerUniforms(fe).declareVariables(...F,...X)}
  ${N.mainStart([$,$,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${_===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${_===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Ar(j,R,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E&&c?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${c?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${ee}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E&&c?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${c?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${ee}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(S){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${S}`)}})()};
        output[outputIdx] = ${K.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${S};${a!==void 0};${i!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:A,dispatchGroup:I,programUniforms:k}),getShaderSource:v}},Co=(e,t,r,i,a,n,s=void 0,u=void 0)=>{let l=n+a.kvSequenceLength,d=a.nReps?a.nReps:1,h=a.vHiddenSize*d,c=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,y=c?[a.batchSize,g,l,a.headSize]:void 0,_=[a.batchSize,a.sequenceLength,h],b=12,S={x:Math.ceil(a.vHeadSize/b),y:Math.ceil(a.sequenceLength/b),z:a.batchSize*a.numHeads},x=[{type:12,data:a.sequenceLength},{type:12,data:l},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:h},{type:12,data:n},{type:12,data:a.kvSequenceLength},{type:12,data:d}],$=c&&i&&O.size(i.dims)>0,I=["type","type"];$&&I.push("type"),s&&I.push("type"),u&&I.push("type");let k=[{dims:_,dataType:t.dataType,gpuDataType:0}];c&&k.push({dims:y,dataType:t.dataType,gpuDataType:0});let E=C=>{let A=M("probs",t.dataType,t.dims),v=M("v",r.dataType,r.dims),N=[A,v];$&&N.push(M("past_value",i.dataType,i.dims));let D=s?M("seq_lens",s.dataType,s.dims):void 0;s&&N.push(D);let H=u?M("total_sequence_length_input",u.dataType,u.dims):void 0;u&&N.push(H);let F=[Y("output",t.dataType,_)];c&&F.push(Y("present_value",t.dataType,y));let j=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${b}u;
  var<workgroup> tileQ: array<${A.type.value}, ${b*b}>;
  var<workgroup> tileV: array<${A.type.value}, ${b*b}>;
  ${C.registerUniforms(j).declareVariables(...N,...F)}
  ${C.mainStart([b,b,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${d===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${d===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Ar(D,H,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${$&&c?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${c?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${A.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${$&&c?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${c?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:I},getRunData:()=>({outputs:k,dispatchGroup:S,programUniforms:x}),getShaderSource:E}},ir=(e,t,r,i,a,n,s,u,l,d,h=void 0,c=void 0)=>{let g=Math.min(e.outputCount,1+(s?1:0)+(u?1:0)),y=g>1?s:void 0,_=g>1?u:void 0,b=g>1?d.pastSequenceLength:0,S=b+d.kvSequenceLength,x=l&&O.size(l.dims)>0?l:void 0,$=[t,r];y&&O.size(y.dims)>0&&$.push(y),x&&$.push(x),h&&$.push(h),c&&$.push(c);let I=e.compute(zo(g,t,r,y,x,d,b,h,c),{inputs:$,outputs:g>1?[-1,1]:[-1]})[0];e.compute(Eo(I,d.batchSize,d.numHeads,b,d.sequenceLength,S,h,c),{inputs:h&&c?[I,h,c]:[I],outputs:[]});let k=[I,i];_&&O.size(_.dims)>0&&k.push(_),h&&k.push(h),c&&k.push(c),e.compute(Co(g,I,i,_,d,b,h,c),{inputs:k,outputs:g>1?[0,2]:[0]})},Ao=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,n=t.headSize,s=12,u={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],d=[{type:12,data:i},{type:12,data:a},{type:12,data:n},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],h=c=>{let g=Y("output_q",l[0].dataType,r),y=Y("output_k",l[0].dataType,r),_=Y("output_v",l[0].dataType,r),b=M("input",l[0].dataType,l[0].dims),S=M("weight",l[1].dataType,l[1].dims),x=M("bias",l[2].dataType,l[2].dims),$=b.type.storage,I=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${$}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${$}, ${s*s}>;
  var<workgroup> tileWeightK: array<${$}, ${s*s}>;
  var<workgroup> tileWeightV: array<${$}, ${s*s}>;
  ${c.registerUniforms(I).declareVariables(b,S,x,g,y,_)}
  ${c.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${$}(0);
    var valueK = ${$}(0);
    var valueV = ${$}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:d}),getShaderSource:h},{inputs:l,outputs:[-1,-1,-1]})},Oo=(e,t)=>{let r=Io(e.inputs,t),[i,a,n]=Ao(e,r);return ir(e,i,a,n,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),Ro,Bo,Mo,No,om=U(()=>{Le(),te(),re(),xe(),ae(),Ro=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,n)=>{let s=a.length;if(s!==i.length)throw new Error(`${n}: num dimensions != ${s}`);a.forEach((u,l)=>{if(u!==i[l])throw new Error(`${n}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},Bo=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,n=e[0].dims,s=i?ve(n[n.length-1]):1,u=a==="NHWC"&&n.length>1?s:1,l=O.size(n)/s,d=i,h=d?n.length:n,c=M("x",e[0].dataType,e[0].dims,s),g=M("scale",e[1].dataType,e[1].dims,u),y=M("bias",e[2].dataType,e[2].dims,u),_=M("inputMean",e[3].dataType,e[3].dims,u),b=M("inputVar",e[4].dataType,e[4].dims,u),S=Y("y",e[0].dataType,h,s),x=()=>{let I="";if(i)I=`let cOffset = ${n.length===1?"0u":a==="NHWC"?`outputIndices[${n.length-1}] / ${s}`:"outputIndices[1]"};`;else if(a==="NCHW")I=`
            ${S.indicesSet("outputIndices","0","0")}
            let cOffset = ${S.indicesToOffset("outputIndices")};`;else{I=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${n.length-1}];`;for(let k=1;k<g.rank;k++)I+=`cIndices[${k}] = outputIndices[${k}];`;I+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return I},$=I=>`
  const epsilon = ${r};
  ${I.registerUniform("outputSize","u32").declareVariables(c,g,y,_,b,S)}
  ${I.mainStart()}
  ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${S.offsetToIndices(`global_idx * ${s}`)};
    ${x()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${y.getByOffset("cOffset")};
    let inputMean = ${_.getByOffset("cOffset")};
    let inputVar = ${b.getByOffset("cOffset")};
    let x = ${c.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${S.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:d?["rank","type","type","type","type"]:void 0},getShaderSource:$,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d?[{type:12,data:l},...J(n)]:[{type:12,data:l}]})}},Mo=e=>he(e),No=(e,t)=>{let{inputs:r,outputCount:i}=e,a=Mo({...t,outputCount:i});if(_e.webgpu.validateInputContent&&Ro(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(Bo(r,a))}}),Do,Uo,Po,um=U(()=>{re(),ae(),Do=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Uo=e=>{let t=e[0].dims,r=e[0].dims[2],i=O.size(t)/4,a=e[0].dataType,n=M("input",a,t,4),s=M("bias",a,[r],4),u=M("residual",a,t,4),l=Y("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:d=>`
  const channels = ${r}u / 4;
  ${d.declareVariables(n,s,u,l)}

  ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${n.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},Po=e=>{Do(e.inputs),e.compute(Uo(e.inputs))}}),qo,ce,Lo,Wo,Vo,Go,Ho,Fo,jo,Ko,Xo,Zo,Yo,Qo,Jo,eu,ar,tu,Or,ru,iu,au,nu,su,ou,uu,lu,du,pu,cu,hu,fu,mu,gu,yu,Xi,_u,Zi,Yi,bu,$u,wu,vu,xu,Su,Qi=U(()=>{te(),re(),xe(),ae(),qo=(e,t,r,i,a,n,s)=>{let u=Math.ceil(t/4),l="";typeof a=="string"?l=`${a}(a)`:l=a("a");let d=M("inputData",r,[u],4),h=Y("outputData",i,[u],4),c=[{name:"vec_size",type:"u32"}];return s&&c.push(...s),`
      ${e.registerUniforms(c).declareVariables(d,h)}

  ${n??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${d.getByOffset("global_idx")};
    ${h.setByOffset("global_idx",l)}
  }`},ce=(e,t,r,i,a,n=e.dataType,s,u)=>{let l=[{type:12,data:Math.ceil(O.size(e.dims)/4)}];return s&&l.push(...s),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:d=>qo(d,O.size(e.dims),e.dataType,n,r,i,u),getRunData:d=>({outputs:[{dims:e.dims,dataType:n}],dispatchGroup:{x:Math.ceil(O.size(d[0].dims)/64/4)},programUniforms:l})}},Lo=e=>{e.compute(ce(e.inputs[0],"Abs","abs"))},Wo=e=>{e.compute(ce(e.inputs[0],"Acos","acos"))},Vo=e=>{e.compute(ce(e.inputs[0],"Acosh","acosh"))},Go=e=>{e.compute(ce(e.inputs[0],"Asin","asin"))},Ho=e=>{e.compute(ce(e.inputs[0],"Asinh","asinh"))},Fo=e=>{e.compute(ce(e.inputs[0],"Atan","atan"))},jo=e=>{e.compute(ce(e.inputs[0],"Atanh","atanh"))},Ko=e=>he(e),Xo=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(ce(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},Zo=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return he({min:t,max:r})},Yo=(e,t)=>{let r=t||Zo(e.inputs),i=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},Qo=e=>{e.compute(ce(e.inputs[0],"Ceil","ceil"))},Jo=e=>{e.compute(ce(e.inputs[0],"Cos","cos"))},eu=e=>{e.compute(ce(e.inputs[0],"Cosh","cosh"))},ar=e=>he(e),tu=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Or=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,ru=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Or(t)))},iu=e=>{e.compute(ce(e.inputs[0],"Exp","exp"))},au=e=>{e.compute(ce(e.inputs[0],"Floor","floor"))},nu=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Or(t)))},su=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},ou=e=>{e.compute(ce(e.inputs[0],"Not",t=>`!${t}`))},uu=e=>{e.compute(ce(e.inputs[0],"Neg",t=>`-${t}`))},lu=e=>{e.compute(ce(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},du=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},pu=e=>{e.compute(ce(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},cu=e=>he(e),hu=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},fu=e=>{e.compute(ce(e.inputs[0],"Sin","sin"))},mu=e=>{e.compute(ce(e.inputs[0],"Sinh","sinh"))},gu=e=>{e.compute(ce(e.inputs[0],"Sqrt","sqrt"))},yu=e=>{e.compute(ce(e.inputs[0],"Tan","tan"))},Xi=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,_u=e=>{e.compute(ce(e.inputs[0],"Tanh",Xi))},Zi=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Xi("v")};
}
`,Yi=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,bu=e=>{let t=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"FastGelu",Yi,Zi(t),void 0,e.inputs[0].dataType))},$u=(e,t)=>{let r=ze(e.inputs[0].dataType);return e.compute(ce(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},wu=e=>{e.compute(ce(e.inputs[0],"Log","log"))},vu=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,xu=e=>`quick_gelu_impl(${e})`,Su=(e,t)=>{let r=ze(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"QuickGelu",xu,vu(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),ku,Tu,Iu,lm=U(()=>{re(),ae(),Qi(),ku=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Tu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=M("input",e[0].dataType,e[0].dims,4),i=M("bias",e[0].dataType,[e[0].dims[2]],4),a=Y("output",e[0].dataType,t,4),n=O.size(t)/4,s=Te(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,a)}

  ${Or(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(n)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Iu=e=>{ku(e.inputs),e.compute(Tu(e.inputs))}}),Eu,zu,Ye,Cu,Au,Ou,Ru,Bu,Mu,Nu,Du,Uu,Pu,dm=U(()=>{te(),re(),ae(),Eu=(e,t,r,i,a,n,s,u,l,d,h,c)=>{let g,y;typeof u=="string"?g=y=($,I)=>`${u}((${$}),(${I}))`:typeof u=="function"?g=y=u:(g=u.scalar,y=u.vector);let _=Y("outputData",h,i.length,4),b=M("aData",l,t.length,4),S=M("bData",d,r.length,4),x;if(a)if(n){let $=O.size(t)===1,I=O.size(r)===1,k=t.length>0&&t[t.length-1]%4===0,E=r.length>0&&r[r.length-1]%4===0;$||I?x=_.setByOffset("global_idx",y($?`${b.type.value}(${b.getByOffset("0")}.x)`:b.getByOffset("global_idx"),I?`${S.type.value}(${S.getByOffset("0")}.x)`:S.getByOffset("global_idx"))):x=`
            let outputIndices = ${_.offsetToIndices("global_idx * 4u")};
            let offsetA = ${b.broadcastedIndicesToOffset("outputIndices",_)};
            let offsetB = ${S.broadcastedIndicesToOffset("outputIndices",_)};
            ${_.setByOffset("global_idx",y(s||k?b.getByOffset("offsetA / 4u"):`${b.type.value}(${b.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||E?S.getByOffset("offsetB / 4u"):`${S.type.value}(${S.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else x=_.setByOffset("global_idx",y(b.getByOffset("global_idx"),S.getByOffset("global_idx")));else{if(!n)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let $=(I,k,E="")=>{let C=`aData[indexA${k}][componentA${k}]`,A=`bData[indexB${k}][componentB${k}]`;return`
            let outputIndices${k} = ${_.offsetToIndices(`global_idx * 4u + ${k}u`)};
            let offsetA${k} = ${b.broadcastedIndicesToOffset(`outputIndices${k}`,_)};
            let offsetB${k} = ${S.broadcastedIndicesToOffset(`outputIndices${k}`,_)};
            let indexA${k} = offsetA${k} / 4u;
            let indexB${k} = offsetB${k} / 4u;
            let componentA${k} = offsetA${k} % 4u;
            let componentB${k} = offsetB${k} % 4u;
            ${I}[${k}] = ${E}(${g(C,A)});
          `};h===9?x=`
            var data = vec4<u32>(0);
            ${$("data",0,"u32")}
            ${$("data",1,"u32")}
            ${$("data",2,"u32")}
            ${$("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:x=`
            ${$("outputData[global_idx]",0)}
            ${$("outputData[global_idx]",1)}
            ${$("outputData[global_idx]",2)}
            ${$("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(b,S,_)}

        ${c??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${x}
      }`},zu=(e,t,r,i,a,n,s=r.dataType)=>{let u=r.dims.map(Number),l=i.dims.map(Number),d=!O.areEqual(u,l),h=u,c=O.size(u),g=!1,y=!1,_=[d];if(d){let b=Ht.calcShape(u,l,!1);if(!b)throw new Error("Can't perform binary op on the given tensors");h=b.slice(),c=O.size(h);let S=O.size(u)===1,x=O.size(l)===1,$=u.length>0&&u[u.length-1]%4===0,I=l.length>0&&l[l.length-1]%4===0;_.push(S),_.push(x),_.push($),_.push(I);let k=1;for(let E=1;E<h.length;E++){let C=u[u.length-E],A=l[l.length-E];if(C===A)k*=C;else break}k%4===0?(y=!0,g=!0):(S||x||$||I)&&(g=!0)}else g=!0;return _.push(g),{name:e,shaderCache:{hint:t+_.map(b=>b.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:b=>Eu(b,u,l,h,g,d,y,a,r.dataType,i.dataType,s,n),getRunData:()=>({outputs:[{dims:h,dataType:s}],dispatchGroup:{x:Math.ceil(c/64/4)},programUniforms:[{type:12,data:Math.ceil(O.size(h)/4)},...J(u,l,h)]})}},Ye=(e,t,r,i,a,n)=>{e.compute(zu(t,a??"",e.inputs[0],e.inputs[1],r,i,n))},Cu=e=>{Ye(e,"Add",(t,r)=>`${t}+${r}`)},Au=e=>{Ye(e,"Div",(t,r)=>`${t}/${r}`)},Ou=e=>{Ye(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},Ru=e=>{Ye(e,"Mul",(t,r)=>`${t}*${r}`)},Bu=e=>{let t=M("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Ye(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},Mu=e=>{Ye(e,"Sub",(t,r)=>`${t}-${r}`)},Nu=e=>{Ye(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Du=e=>{Ye(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Uu=e=>{Ye(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},Pu=e=>{Ye(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),qu,Lu,Wu,Vu,Gu,Hu,pm=U(()=>{te(),re(),xe(),ae(),qu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,n=i.dims.length;e.forEach((s,u)=>{if(u!==r){if(s.dataType!==a)throw new Error("input tensors should be one type");if(s.dims.length!==n)throw new Error("input tensors should have the same shape");s.dims.forEach((l,d)=>{if(d!==t&&l!==i.dims[d])throw new Error("non concat dimensions must match")})}})},Lu=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,Wu=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let n=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(n):a===0?i.push(`if (inputIndex == ${a}u) { ${n} }`):a===r-1?i.push(`else { ${n} }`):i.push(`else if (inputIndex == ${a}) { ${n} }`)}return i.join(`
`)},Vu=(e,t,r,i)=>{let a=O.size(r),n=new Array(e.length),s=new Array(e.length),u=0,l=[],d=[],h=[{type:12,data:a}];for(let b=0;b<e.length;++b)u+=e[b].dims[t],n[b]=u,d.push(e[b].dims.length),s[b]=M(`input${b}`,i,d[b]),l.push("rank"),h.push({type:12,data:n[b]});for(let b=0;b<e.length;++b)h.push(...J(e[b].dims));h.push(...J(r));let c=Y("output",i,r.length),g=c.indicesGet("indices",t),y=Array.from(Array(n.length).keys()).map(b=>`uniforms.sizeInConcatAxis${b}`).join(","),_=b=>`

  ${(()=>{b.registerUniform("outputSize","u32");for(let S=0;S<e.length;S++)b.registerUniform(`sizeInConcatAxis${S}`,"u32");return b.declareVariables(...s,c)})()}

  ${Lu(n.length,y)}

  ${b.mainStart()}
    ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${c.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${n.length}u>(${y});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${Wu(s,c)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:h}),getShaderSource:_}},Gu=(e,t)=>{let r=e.inputs,i=r[0].dims,a=O.normalizeAxis(t.axis,i.length);qu(r,a);let n=i.slice();n[a]=r.reduce((u,l)=>u+(l.dims.length>a?l.dims[a]:0),0);let s=r.filter(u=>O.size(u.dims)>0);e.compute(Vu(s,a,n,r[0].dataType),{inputs:s})},Hu=e=>he({axis:e.axis})}),At,Ot,Rt,Ji,Bt=U(()=>{te(),re(),At=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Ot=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Rt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},Ji=e=>{let t=(e==null?void 0:e.activation)||"";if(t==="HardSigmoid"){let[r,i]=(e==null?void 0:e.activation_params)||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=(e==null?void 0:e.activation_params)||[hs,fs];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=(e==null?void 0:e.activation_params)||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ee,Fu,ea=U(()=>{Ee=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},Fu=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),ju,cm=U(()=>{ju=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),nr,ta,ra=U(()=>{te(),re(),ae(),Bt(),nr=(e,t,r,i,a)=>{let n=i-r;return`
      ${Array.from({length:r}).map((s,u)=>`
      if (${Q(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,Q(a,u+n,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},ta=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,l=s[s.length-2],d=u[u.length-1],h=s[s.length-1],c=ve(d),g=ve(h),y=ve(l),_=O.size(r)/c/y,b=e.length>2,S=i?i.slice(0,-2):r.slice(0,-2),x=[O.size(S),l,d],$=[{type:12,data:_},{type:12,data:l},{type:12,data:d},{type:12,data:h}];Ot(t,$),$.push(...J(S,s,u)),b&&$.push(...J(e[2].dims)),$.push(...J(x));let I=k=>{let E=Wi("batch_dims",e[0].dataType,S.length),C=M("a",e[0].dataType,s.length,g),A=M("b",e[1].dataType,u.length,c),v=Y("output",e[0].dataType,x.length,c),N=Te(v.type.tensor),D=At(t,v.type.value,N),H=[C,A],F="";if(b){let K=a?c:1;H.push(M("bias",e[2].dataType,e[2].dims.length,K)),F=`${a?`value += bias[col / ${K}];`:`value += ${v.type.value}(bias[row + i]);`}`}let j=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Rt(t,j);let R=()=>{let K=`var a_data: ${C.type.value};`;for(let X=0;X<g;X++)K+=`
              let b_data${X} = b[(b_offset + (k + ${X}) * uniforms.N + col) / ${c}];`;for(let X=0;X<y;X++){K+=`a_data = a[(a_offset + (row + ${X}) * uniforms.K + k) / ${g}];`;for(let ee=0;ee<g;ee++)K+=`
            values[${X}] = fma(${A.type.value}(a_data${g===1?"":`[${ee}]`}), b_data${ee}, values[${X}]);
`}return K};return`
  ${k.registerUniforms(j).registerInternalVariables(E).declareVariables(...H,v)}
  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${c})) * ${c};
    var index1 = global_idx / (uniforms.N / ${c});
    let stride1 = uniforms.M / ${y};
    let row = (index1 % stride1) * ${y};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${E.offsetToIndices("batch")};`}

    var a_indices: ${C.type.indices};
    ${nr("a_indices",C,C.rank-2,E.rank,"batch_indices")}
    ${C.indicesSet("a_indices",C.rank-2,0)}
    ${C.indicesSet("a_indices",C.rank-1,0)}
    let a_offset = ${C.indicesToOffset("a_indices")};

    var b_indices: ${A.type.indices};
    ${nr("b_indices",A,A.rank-2,E.rank,"batch_indices")}
    ${A.indicesSet("b_indices",A.rank-2,0)}
    ${A.indicesSet("b_indices",A.rank-1,0)}
    let b_offset = ${A.indicesToOffset("b_indices")};
    var values: array<${v.type.value}, ${y}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${R()}
    }
    for (var i = 0u; i < ${y}u; i++) {
      var value = values[i];
      ${F}
      ${D}
      let cur_indices = ${v.type.indices}(batch, row + i, col);
      let offset = ${v.indicesToOffset("cur_indices")};
      ${v.setByOffset(`offset / ${c}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${c};${g};${y};${a}`,inputDependencies:b?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:$}),getShaderSource:I}}}),Ku,Xu,ia,aa,Zu,na,Yu,Rr,sa=U(()=>{te(),re(),ae(),Bt(),ra(),ea(),Ku=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Xu=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,ia=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32)=>{let l=t[1]*e[1],d=t[0]*e[0],h=a?l:n,c=a?n:l,g=h/t[0],y=n/t[1];if(!((a&&g===4&&e[1]===4||!a&&(g===3||g===4))&&h%t[0]===0&&n%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}. tileInner ${n} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${h/g}>, ${c}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${d/e[0]}>, ${n}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${y};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Ku(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Xu(a,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},aa=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,Zu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",na=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32,l=!1)=>{let d=e[1]*t[1],h=e[0]*t[0],c=a?d:n,g=a?n:d;if(!(g%t[1]===0&&c%t[0]===0&&n%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${c} must be divisible by workgroupSize[0]${t[0]}, tileInner ${n} must be divisible by workgroupSize[1]${t[1]}`);let y=g/t[1],_=c/t[0],b=n/t[1],S=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${d};
    let globalColStart = i32(workgroupId.x) * ${h};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${c}; inputCol = inputCol + ${t[0]}) {
          ${aa(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${n}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${d};

let tileRowA = i32(localId.y) * ${y};
let tileColA = i32(localId.x) * ${_};
let tileRowB = i32(localId.y) * ${b};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${_}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${aa(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Zu(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${c}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${h}>, ${n}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${S}
  }
`},Yu=(e,t,r,i,a=!1)=>{let[n,s,u,l]=i,d=Te(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ee(e,d)} {
      var value = ${Ee(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${nr("aIndices",s,s.rank-2,n.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ee(e,d)} {
      var value = ${Ee(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${nr("bIndices",u,u.rank-2,n.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ee(e,d)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ee(e,d)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Rr=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,l=s.slice(0,-2),d=u.slice(0,-2),h=i?i.slice(0,-2):r.slice(0,-2),c=O.size(h),g=s[s.length-2],y=s[s.length-1],_=u[u.length-1],b=y%4===0&&_%4===0,S=g<=8?[4,1,1]:[4,4,1],x=[8,8,1],$=[Math.ceil(_/x[0]/S[0]),Math.ceil(g/x[1]/S[1]),Math.ceil(c/x[2]/S[2])],I=b?4:1,k=[...l,g,y/I],E=k.length,C=[...d,y,_/I],A=C.length,v=[c,g,_/I],N=[{type:6,data:g},{type:6,data:_},{type:6,data:y}];Ot(t,N),N.push(...J(h,k,C));let D=["rank","rank"],H=e.length>2;H&&(N.push(...J(e[2].dims)),D.push("rank")),N.push(...J(v));let F=j=>{let R=h.length,K=Wi("batchDims",e[0].dataType,R,1),X=Te(e[0].dataType),ee=M("a",e[0].dataType,E,I),fe=M("b",e[1].dataType,A,I),W=Y("result",e[0].dataType,v.length,I),ue=[ee,fe];if(H){let ge=a?I:1;ue.push(M("bias",e[2].dataType,e[2].dims.length,ge))}let P=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Rt(t,P);let V=Te(W.type.tensor),Z=At(t,W.type.value,V),q=Yu(I,H,Z,[K,ee,fe,W],a);return`
  ${j.registerUniforms(P).registerInternalVariables(K).declareVariables(...ue,W)}
  ${q}
  ${b?ia(S,x,X,K):na(S,x,X,K)}
                   `};return{name:"MatMul",shaderCache:{hint:`${S};${t.activation};${b};${a}`,inputDependencies:D},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:$[0],y:$[1],z:$[2]},programUniforms:N}),getShaderSource:F}}}),Qu,Ju,hm=U(()=>{te(),ut(),ae(),Bt(),ea(),cm(),sa(),Qu=(e,t,r,i,a=!1,n,s=4,u=4,l=4,d="f32")=>{let h=N=>{switch(N){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${d}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${N} is not supported.`)}},c=N=>{switch(N){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${N} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,y=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,_=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",b=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",S=e?"row":"col",x=e?"col":"row",$=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${S} / outWidth;
    let outCol = ${S} % outWidth;

    let WRow = ${x} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${x} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${x} % inChannels;
    var resData = ${Ee(s,d)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${_} && xCol >= 0 && xCol < ${b}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${h(s)}
    }
    return resData;`,I=e?t&&i?`
    let col = colIn * ${s};
    ${$}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${$}
    }
    return ${Ee(s,d)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${$}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${$}
    }
    return ${Ee(s,d)}(0.0);`,k=e?i&&r?c(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${c(u)}
    }
    return ${Ee(u,d)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${c(u)}
    }
    return ${Ee(u,d)}(0.0);`,E=Ee(l,d),C=Ee(e?s:u,d),A=Ee(e?u:s,d),v=At(n,E,d);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?I:k}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?k:I}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${y}
      ${Fu(a)}
      ${v}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},Ju=(e,t,r,i,a,n,s,u,l)=>{let d=t.format==="NHWC",h=d?e[0].dims[3]:e[0].dims[1],c=r[0],g=d?r[2]:r[3],y=d?r[1]:r[2],_=d?r[3]:r[1],b=d&&(h%4===0||h%3===0)&&_%4===0,S=d?_:g*y,x=d?g*y:_,$=[8,8,1],I=i<=8?[4,1,1]:[4,4,1],k=[Math.ceil(S/$[0]/I[0]),Math.ceil(x/$[1]/I[1]),Math.ceil(c/$[2]/I[2])];de("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${k}`);let E=b?d&&h%4!==0?3:4:1,C=$[1]*I[1],A=$[0]*I[0],v=Math.max($[0]*E,$[1]),N=i%C===0,D=a%A===0,H=n%v===0,F=b?[E,4,4]:[1,1,1],j=[{type:6,data:i},{type:6,data:a},{type:6,data:n},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Ot(t,j),j.push(...J(e[0].dims,e[1].dims));let R=["rank","rank"];s&&(j.push(...J(e[2].dims)),R.push("rank")),j.push(...J(r));let K=X=>{let ee=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Rt(t,ee);let fe=b?4:1,W=Te(e[0].dataType),ue=`
      fn setOutputAtIndex(flatIndex : i32, value : ${b?`vec4<${W}>`:W}) {
        result[flatIndex] = ${b?`vec4<${W}>`:W}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${b?`vec4<${W}>`:W}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${b?"/ 4":""}, value);
      }`,P=M("x",e[0].dataType,e[0].dims.length,E===3?1:E),V=M("w",e[1].dataType,e[1].dims.length,fe),Z=[P,V],q=Y("result",e[0].dataType,r.length,fe);if(s){let ge=M("bias",e[2].dataType,e[2].dims.length,fe);Z.push(ge),ue+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${b?`vec4<${W}>`:W} {
          return bias[coords.${d?"w":"y"}${b?"/ 4":""}];
        }`}return`
        ${ju("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${X.registerUniforms(ee).declareVariables(...Z,q)}
        ${ue}
        ${Qu(d,N,D,H,s,t,F[0],F[1],F[2],W)}
        ${b?ia(I,$,W,void 0,!d,v):na(I,$,W,void 0,!d,v,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${E};${b};${N};${D};${H};${C};${A};${v}`,inputDependencies:R},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:k[0],y:k[1],z:k[2]},programUniforms:j}),getShaderSource:K}}}),el,oa,sr,tl,ua,rl,il,al,fm=U(()=>{te(),ut(),re(),ae(),Bt(),ea(),el=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},oa=e=>typeof e=="number"?[e,e,e]:e,sr=(e,t)=>t<=1?e:e+(e-1)*(t-1),tl=(e,t,r,i=1)=>{let a=sr(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},ua=(e,t,r,i,a)=>{a==null&&(a=tl(e,t[0],i[0]));let n=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*a>=t[s]&&(n[s]=Math.trunc((e[s]-t[s]+2*a)/i[s]+1));return n},rl=(e,t,r,i,a,n,s,u,l,d)=>{let h,c,g,y;if(e==="VALID"&&(e=0),typeof e=="number"){h={top:e,bottom:e,left:e,right:e,front:e,back:e};let _=ua([t,r,i,1],[u,l,d],1,[a,n,s],e);c=_[0],g=_[1],y=_[2]}else if(Array.isArray(e)){if(!e.every((b,S,x)=>b===x[0]))throw Error(`Unsupported padding parameter: ${e}`);h={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let _=ua([t,r,i,1],[u,l,d],1,[a,n,s],e[0]);c=_[0],g=_[1],y=_[2]}else if(e==="SAME_UPPER"){c=Math.ceil(t/a),g=Math.ceil(r/n),y=Math.ceil(i/s);let _=(c-1)*a+u-t,b=(g-1)*n+l-r,S=(y-1)*s+d-i,x=Math.floor(_/2),$=_-x,I=Math.floor(b/2),k=b-I,E=Math.floor(S/2),C=S-E;h={top:I,bottom:k,left:E,right:C,front:x,back:$}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:h,outDepth:c,outHeight:g,outWidth:y}},il=(e,t,r,i,a,n=!1,s="channelsLast")=>{let u,l,d,h,c;if(s==="channelsLast")[u,l,d,h,c]=e;else if(s==="channelsFirst")[u,c,l,d,h]=e;else throw new Error(`Unknown dataFormat ${s}`);let[g,,y,_,b]=t,[S,x,$]=oa(r),[I,k,E]=oa(i),C=sr(y,I),A=sr(_,k),v=sr(b,E),{padInfo:N,outDepth:D,outHeight:H,outWidth:F}=rl(a,l,d,h,S,x,$,C,A,v),j=n?g*c:g,R=[0,0,0,0,0];return s==="channelsFirst"?R=[u,j,D,H,F]:s==="channelsLast"&&(R=[u,D,H,F,j]),{batchSize:u,dataFormat:s,inDepth:l,inHeight:d,inWidth:h,inChannels:c,outDepth:D,outHeight:H,outWidth:F,outChannels:j,padInfo:N,strideDepth:S,strideHeight:x,strideWidth:$,filterDepth:y,filterHeight:_,filterWidth:b,effectiveFilterDepth:C,effectiveFilterHeight:A,effectiveFilterWidth:v,dilationDepth:I,dilationHeight:k,dilationWidth:E,inShape:e,outShape:R,filterShape:t}},al=(e,t,r,i,a,n)=>{let s=n==="channelsLast";s?e[0].dims[3]:e[0].dims[1];let u=[64,1,1],l={x:r.map((S,x)=>x)},d=[Math.ceil(el(l.x.map(S=>r[S]))/u[0]),1,1];de("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${d}`);let h=1,c=O.size(r),g=[{type:12,data:c},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Ot(t,g),g.push(...J(e[0].dims,e[1].dims));let y=["rank","rank"],_=e.length===3;_&&(g.push(...J(e[2].dims)),y.push("rank")),g.push(...J(r));let b=S=>{let x=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Rt(t,x);let $=1,I=Te(e[0].dataType),k=M("x",e[0].dataType,e[0].dims.length,h),E=M("W",e[1].dataType,e[1].dims.length,$),C=[k,E],A=Y("result",e[0].dataType,r.length,$),v="";if(_){let H=M("bias",e[2].dataType,e[2].dims.length,$);C.push(H),v+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${I} {
          return bias[${s?Q("coords",4,5):Q("coords",1,5)}];
        }`}let N=Ee(h,I),D=At(t,N,I);return`
            ${v}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${k.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${E.getByIndices("aIndices")};
            }
          ${S.registerUniforms(x).declareVariables(...C,A)}
          ${S.mainStart()}
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${A.offsetToIndices("global_idx")};
              let batch = ${Q("coords",0,k.rank)};
              let d2 = ${s?Q("coords",k.rank-1,k.rank):Q("coords",1,k.rank)};
              let xFRCCorner = vec3<u32>(${s?Q("coords",1,k.rank):Q("coords",2,k.rank)},
              ${s?Q("coords",2,k.rank):Q("coords",3,k.rank)},
              ${s?Q("coords",3,k.rank):Q("coords",4,k.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Q("uniforms.x_shape",1,k.rank):Q("uniforms.x_shape",2,k.rank)};
              let xShapeZ = ${s?Q("uniforms.x_shape",2,k.rank):Q("uniforms.x_shape",3,k.rank)};
              let xShapeW = ${s?Q("uniforms.x_shape",3,k.rank):Q("uniforms.x_shape",4,k.rank)};
              let xShapeU = ${s?Q("uniforms.x_shape",4,k.rank):Q("uniforms.x_shape",1,k.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${_?"value = value + getBiasByOutputCoords(coords)":""};
              ${D}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${h};${_}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:d[0],y:d[1],z:d[2]},programUniforms:g}),getShaderSource:b}}}),nl,sl,mm=U(()=>{te(),re(),ae(),Bt(),nl=(e,t,r,i)=>{let a=e.length>2,n=a?"value += b[output_channel];":"",s=e[0].dims,u=e[1].dims,l=t.format==="NHWC",d=l?r[3]:r[1],h=d/t.group,c=l&&h>=4?ve(d):1,g=O.size(r)/c,y=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:h}];Ot(t,y),y.push(...J(s,[u[0],u[1],u[2],u[3]/c]));let _=a?["rank","rank","rank"]:["rank","rank"];y.push(...J([r[0],r[1],r[2],r[3]/c]));let b=S=>{let x=Y("output",e[0].dataType,r.length,c),$=Te(x.type.tensor),I=At(t,x.type.value,$),k=M("x",e[0].dataType,s.length),E=M("w",e[1].dataType,u.length,c),C=[k,E];a&&C.push(M("b",e[2].dataType,e[2].dims,c));let A=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Rt(t,A);let v=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${k.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${E.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${k.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${E.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${S.registerUniforms(A).declareVariables(...C,x)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${x.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${c} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${x.type.value} = ${x.type.value}(0);
    ${v}
    ${n}
    ${I}
    ${x.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${c}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:b}},sl=(e,t,r,i)=>{let a=e.length>2,n=ve(r[3]),s=ve(r[2]),u=O.size(r)/n/s,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/n],d=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/n],h=[r[0],r[1],r[2],r[3]/n],c=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Ot(t,c),c.push(...J(l,d,h));let g=(s-1)*t.strides[1]+d[1],y=_=>{let b=Y("output",e[0].dataType,h.length,n),S=Te(b.type.tensor),x=At(t,b.type.value,S),$=M("x",e[0].dataType,l.length,n),I=M("w",e[1].dataType,d.length,n),k=[$,I];a&&k.push(M("b",e[2].dataType,e[2].dims,n));let E=a?"value += b[output_channel];":"",C=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Rt(t,C),`
  ${_.registerUniforms(C).declareVariables(...k,b)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${$.type.value}, ${g}>;
    var values: array<${b.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${d[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${$.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${$.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${d[1]}; w_width++) {
          let w_val = ${I.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${E}
      ${x}
      ${b.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${n};${s};${g};${d[0]};${d[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:c}),getShaderSource:y}}}),ol,Br,ul,Mr,la,da,ll,dl,pa,gm=U(()=>{re(),hm(),fm(),sa(),mm(),Bt(),ra(),ft(),ol=(e,t,r,i,a,n)=>{let s=e[0],u=e.slice(n?1:2,n?3:4),l=u.length,d=t[0],h=t.slice(2).map((g,y)=>g+(g-1)*(r[y]-1)),c=u.map((g,y)=>g+i[y]+i[y+l]).map((g,y)=>Math.floor((g-h[y]+a[y])/a[y]));return c.splice(0,0,s),c.splice(n?3:1,0,d),c},Br=[2,3,1,0],ul=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Mr=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let n=2;n<t[1].dims.length;++n)r[n-2]===0&&(r[n-2]=t[1].dims[n]);let i=e.pads.slice();Tr.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},la=e=>{let t=Ji(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,n=e.group,s=e.kernel_shape,u=e.pads,l=e.strides,d=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,pads:u,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},da=(e,t,r,i)=>{let a=r.format==="NHWC",n=ol(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let C=[t[0]];if(a){let A=e.kernelCustomData.wT??e.compute(Ue(t[1],Br),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=A),C.push(A)}else C.push(t[1]);t.length===3&&C.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(sl(C,r,n,i),{inputs:C}):e.compute(nl(C,r,n,i),{inputs:C});return}let s=t.length===3,u=t[0].dims[a?1:2],l=t[0].dims[a?2:3],d=t[0].dims[a?3:1],h=t[1].dims[2],c=t[1].dims[3],g=n[a?1:2],y=n[a?2:3],_=n[a?3:1],b=a&&h===u&&c===l&&r.pads[0]===0&&r.pads[1]===0;if(b||h===1&&c===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let C=n[0],A,v,N,D=[];if(a){let j=e.kernelCustomData.wT??e.compute(Ue(t[1],Br),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=j),b){let R=u*l*d;A=t[0].reshape([1,C,R]),v=j.reshape([1,R,_]),N=[1,C,_]}else A=t[0].reshape([C,u*l,d]),v=j.reshape([1,d,_]),N=[C,g*y,_];D.push(A),D.push(v)}else A=t[0].reshape([C,d,u*l]),v=t[1].reshape([1,_,d]),N=[C,_,g*y],D.push(v),D.push(A);s&&D.push(t[2]);let H=N[2],F=D[0].dims[D[0].dims.length-1];H<8&&F<8?e.compute(ta(D,r,n,N,a,i),{inputs:D}):e.compute(Rr(D,r,n,N,a,i),{inputs:D});return}let S=!0,x=e.kernelCustomData.wT??e.compute(Ue(t[1],Br),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=x);let $=[t[0],x];s&&$.push(t[2]);let I=a?g*y:_,k=a?_:g*y,E=h*c*d;e.compute(Ju($,r,n,I,k,E,s,S,i),{inputs:$})},ll=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],n=[1].concat(t.strides),s=[1].concat(t.dilations),u=[1].concat(t.kernelShape),l=Mr({...t,pads:a,strides:n,dilations:s,kernelShape:u},i);da(e,i,l,d=>r?[d[0],d[2],d[3]]:[d[0],d[1],d[3]])},dl=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Mr(r,t),n=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=il(t[0].dims,t[1].dims,r.strides,r.dilations,n,!1,i);e.compute(al(t,a,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},pa=(e,t)=>{if(ul(e.inputs,t),e.inputs[0].dims.length===3)ll(e,t);else if(e.inputs[0].dims.length===5)dl(e,e.inputs,t);else{let r=Mr(t,e.inputs);da(e,e.inputs,r)}}}),pl,ym=U(()=>{te(),ut(),re(),ae(),pl=(e,t,r)=>{let i=e.length>2,a=t.outputShape,n=t.format==="NHWC",s=t.group,u=e[1].dims,l=u[2]/s,d=u[3],h=n?ve(l):1,c=n&&d===1&&l>=4,g=c?Math.floor(l/4)*4:Math.floor(l/h)*h,y=l-g,_=n?ve(d):1,b=n?d===1?h:_:1,S=O.size(a)/_,x=[Math.ceil(S/64),1,1];de("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${x}`);let $=["rank","rank"],I=[t.strides[0],t.strides[1]],k=[t.kernelShape[n?1:2],t.kernelShape[n?2:3]],E=[t.dilations[0],t.dilations[1]],C=[k[0]+(t.dilations[0]<=1?0:(t.kernelShape[n?1:2]-1)*(t.dilations[0]-1)),k[1]+(t.dilations[1]<=1?0:(t.kernelShape[n?2:3]-1)*(t.dilations[1]-1))],A=[C[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),C[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],v=[{type:12,data:S},{type:12,data:I},{type:12,data:k},{type:12,data:E},{type:12,data:C},{type:6,data:A},{type:12,data:g},{type:12,data:l},{type:12,data:d},...J(e[0].dims,e[1].dims)];i&&(v.push(...J(e[2].dims)),$.push("rank")),v.push(...J(a));let N=D=>{let H=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:I.length},{name:"filter_dims",type:"u32",length:k.length},{name:"dilations",type:"u32",length:k.length},{name:"effective_filter_dims",type:"u32",length:C.length},{name:"pads",type:"i32",length:A.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],F=Te(e[0].dataType),j=n?1:2,R=n?2:3,K=n?3:1,X=M("W",e[1].dataType,e[1].dims.length,b),ee=M("Dy",e[0].dataType,e[0].dims.length,h),fe=[ee,X];i&&fe.push(M("bias",e[2].dataType,[a[K]].length,_));let W=Y("result",e[0].dataType,a.length,_),ue=()=>{let Z="";if(c)h===4?Z+=`
        let xValue = ${ee.getByOffset("x_offset")};
        let wValue = ${X.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:h===2?Z+=`
          dotProd = dotProd + dot(vec4<${F}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}), vec4<${F}>(${X.getByOffset("w_offset")}, ${X.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:h===1&&(Z+=`
          dotProd = dotProd + dot(vec4<${F}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}, ${ee.getByOffset("x_offset + 2u")}, ${ee.getByOffset("x_offset + 3u")}), vec4<${F}>(${X.getByOffset("w_offset")}, ${X.getByOffset("w_offset + 1u")}, ${X.getByOffset("w_offset + 2u")}, ${X.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(Z+=`
                  let xValue = ${n?ee.getByOffset(`${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h}`):ee.get("batch","inputChannel","idyR","idyC")};
        `,h===1)Z+=`
          let w_offset = ${X.indicesToOffset(`${X.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${X.getByOffset(`w_offset / ${b}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let q=0;q<h;q++)Z+=`
            let wValue${q} = ${X.getByOffset(`${X.indicesToOffset(`${X.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${q}, wOutChannel)`)} / ${b}`)};
            dotProd = dotProd + xValue[${q}] * wValue${q};`;return Z},P=()=>{if(y===0)return"";if(!c)throw new Error(`packInputAs4 ${c} is not true.`);let Z="";if(h===1){Z+="dotProd = dotProd";for(let q=0;q<y;q++)Z+=`
            + ${ee.getByOffset(`x_offset + ${q}`)} * ${X.getByOffset(`w_offset + ${q}`)}`;Z+=";"}else if(h===2){if(y!==2)throw new Error(`Invalid inputChannelsRemainder ${y}.`);Z+=`
          let xValue = ${ee.getByOffset("x_offset")};
          let wValue = ${X.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return Z},V=`
            let outputIndices = ${W.offsetToIndices(`global_idx * ${_}`)};
            let batch = ${W.indicesGet("outputIndices",0)};
            let d1 = ${W.indicesGet("outputIndices",K)};
            let r = ${W.indicesGet("outputIndices",j)};
            let c = ${W.indicesGet("outputIndices",R)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${W.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${F}(dyRCorner) + ${F}(wR)) / ${F}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${F}(uniforms.Dy_shape[${j}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${F}(dyCCorner) + ${F}(wC)) / ${F}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${F}(uniforms.Dy_shape[${R}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${c?`
                var x_offset = ${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h};
                var w_offset = ${X.indicesToOffset(`${X.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${b};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${c?4:h}) {
                  ${ue()}
                  inputChannel = inputChannel + ${c?4:h};
                }
                ${P()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${_}]`:""};
            ${W.setByOffset("global_idx","value")};
          `;return`
    ${D.registerUniforms(H).declareVariables(...fe,W)}
      ${D.mainStart()}
      ${D.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${V}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${h}${b}${_}${c}${y}`,inputDependencies:$},getRunData:()=>({dispatchGroup:{x:x[0],y:x[1],z:x[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:v}),getShaderSource:N}}}),cl,hl,fl,ca,ml,gl,ha,yl,_l,_m=U(()=>{ym(),Bt(),ft(),cl=(e,t,r,i,a,n)=>(e-1)*t+r+(i-1)*a+1-n,hl=(e,t,r,i,a)=>{let n=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=n,r[a]=e-n):t==="SAME_LOWER"&&(r[i]=e-n,r[a]=n)},fl=(e,t,r,i,a,n,s,u,l,d)=>{let h=e.length-2,c=d.length===0;l.length<h&&l.push(...Array(h-l.length).fill(0));let g=e[0],y=t[u?3:1]*a;for(let _=0,b=e.length-h-(u?1:0);_<h;++_,++b){let S=e[b],x=c?S*s[_]:d[_],$=cl(S,s[_],n[_],t[b],r[_],x);hl($,i,n,_,_+h),c&&d.push(s[_]*(S-1)+l[_]+(t[b]-1)*r[_]+1-n[_]-n[_+h])}d.splice(0,0,g),d.splice(u?3:1,0,y)},ca=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((c,g)=>c*g,1)===0){r.length=0;for(let c=2;c<t[1].dims.length;++c)r.push(t[1].dims[c])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),n=e.outputShape.slice(),s=e.outputPadding.slice(),u=t[0].dims,l=e.dilations.slice();if(l.reduce((c,g)=>c+g,0)===0){let c=t[0].dims.length-2;l=new Array(c).fill(1)}let d=e.strides.slice();if(d.reduce((c,g)=>c+g,0)===0){let c=t[0].dims.length-2;d=new Array(c).fill(1)}fl(u,r,l,e.autoPad,e.group,a,d,i,s,n);let h=Object.assign({},e);return Object.assign(h,{kernelShape:r,pads:a,outputPadding:s,outputShape:n,dilations:l,strides:d}),h},ml=e=>{let t=Ji(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,n=e.group??1,s=e.kernelShape,u=e.pads,l=e.strides,d=e.wIsConst(),h=e.outputPadding,c=e.outputShape;return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,outputPadding:h,outputShape:c,pads:u,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},gl=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.reduce((s,u)=>s+u,0)>0&&t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.reduce((s,u)=>s+u,0)>0&&t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.reduce((s,u)=>s+u,0)>0&&t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.outputPadding.length!==n&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${n}D`);if(t.kernelShape.reduce((s,u)=>s+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},ha=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(Ue(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let n=[t[0],a];t.length===3&&n.push(t[2]),e.compute(pl(n,r,i),{inputs:n})},yl=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let n=t.dilations;(n.length===0||n[0]===0)&&(n=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],s=[1].concat(s),n=[1].concat(n),a=[1].concat(a);let l=t.outputPadding;l=[0].concat(l);let d=ca({...t,pads:u,strides:s,dilations:n,kernelShape:a,outputPadding:l},i);ha(e,i,d,h=>r?[h[0],h[2],h[3]]:[h[0],h[1],h[3]])},_l=(e,t)=>{if(gl(e.inputs,t),e.inputs[0].dims.length===3)yl(e,t);else{let r=ca(t,e.inputs);ha(e,e.inputs,r)}}}),bl,$l,wl,bm=U(()=>{te(),re(),xe(),ae(),bl=(e,t,r,i)=>{let a=O.size(t),n=t.length,s=M("input",e,n),u=Y("output",e,n),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),d=O.normalizeAxis(l,n),h=c=>{let g=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,y=Q("uniforms.input_shape","uniforms.axis",n),_=i.reverse?g+(i.exclusive?" + 1":""):"0",b=i.reverse?y:g+(i.exclusive?"":" + 1");return`
                ${c.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,u)}
                ${c.mainStart()}
                  ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${_};
                  let last : i32 = ${b};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:d},...J(t,t)]}),getShaderSource:h}},$l=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(bl(i,r,a,t),{inputs:[0]})},wl=e=>{let t=e.exclusive===1,r=e.reverse===1;return he({exclusive:t,reverse:r})}}),vl,xl,Sl,kl,Tl,$m=U(()=>{te(),re(),xe(),ae(),vl=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},xl=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let n=0;n<t;++n)a.push(r.indicesSet("a",e[n],`i[${n}]`));return a.push("return a;}"),a.join(`
`)},Sl=(e,t)=>{let r,i,a,n,s,u,l=t.format==="NHWC",d=t.blocksize,h=t.mode==="DCR";l?([r,i,a,n]=e.dims,s=h?[r,i,a,d,d,n/d**2]:[r,i,a,n/d**2,d,d],u=h?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,n]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=h?[r,d,d,n/d**2,i,a]:[r,n/d**2,d,d,i,a],u=h?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let c=e.reshape(s),g=c.dims.length,y=e.dataType,_=M("a",y,g),b=Y("output",y,g),S=x=>`
  ${x.registerUniform("output_size","u32").declareVariables(_,b)}

  ${xl(u,g,_,b)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${b.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${b.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:x=>{let $=l?[r,i*d,a*d,n/d**2]:[r,n/d**2,i*d,a*d],I=O.size($),k=c.dims,E=O.sortBasedOnPerm(k,u);return{outputs:[{dims:$,dataType:x[0].dataType}],dispatchGroup:{x:Math.ceil(I/64)},programUniforms:[{type:12,data:I},...J(k,E)]}},getShaderSource:S}},kl=(e,t)=>{vl(e.inputs),e.compute(Sl(e.inputs[0],t))},Tl=e=>he({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Nr,or,fa,Il,El,zl,Cl,ma,Al,Ol,Rl,wm=U(()=>{te(),re(),xe(),ae(),Nr="[a-zA-Z]|\\.\\.\\.",or="("+Nr+")+",fa="^"+or+"$",Il="("+or+",)*"+or,El="^"+Il+"$",zl=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},Cl=class{constructor(e,t){var a;this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(El)))throw new Error("Invalid LHS term");if(r.split(",").forEach((n,s)=>{let u=e[s].dims.slice();if(!n.match(RegExp(fa)))throw new Error("Invalid LHS term");let l=this.processTerm(n,!0,u,s);this.lhs.push(l)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([n,s])=>s.count===1||n==="...").map(([n])=>n).join("");else if(!i.match(RegExp(or)))throw new Error("Invalid RHS");(a=i.match(RegExp(Nr,"g")))==null||a.forEach(n=>{if(n==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(n);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,n=!1,s=[],u=0;if(!e.match(RegExp(fa))&&!t&&e!=="")throw new Error("Invalid LHS term");let l=e.match(RegExp(Nr,"g")),d=new zl(i);return l==null||l.forEach((h,c)=>{if(h==="..."){if(n)throw new Error("Only one ellipsis is allowed per input term");n=!0;let g=a-l.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let y=0;y<s.length;y++){let _=String.fromCharCode(48+y);d.addSymbol(_,c+y),this.addSymbol(_,r[u++],i)}}else d.addSymbol(h,c+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(h,r[u++],i)}),d}},ma=e=>e+"_max",Al=(e,t,r,i)=>{let a=e.map(d=>d.length).map((d,h)=>M(`input${h}`,t,d)),n=O.size(i),s=Y("output",t,i.length),u=[...r.symbolToInfo.keys()].filter(d=>!r.rhs.symbolToIndices.has(d)),l=d=>{let h=[],c="var prod = 1.0;",g="var sum = 0.0;",y="sum += prod;",_=[],b=[],S=[],x=[],$=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((k,E)=>{var C;if(r.rhs.symbolToIndices.has(E)){let A=(C=r.rhs.symbolToIndices.get(E))==null?void 0:C[0];A!==void 0&&r.lhs.forEach((v,N)=>{if(k.inputIndices.includes(N)){let D=v.symbolToIndices.get(E);if(D===void 0)throw new Error("Invalid symbol error");D.forEach(H=>{h.push(`${a[N].indicesSet(`input${N}Indices`,H,s.indicesGet("outputIndices",A))}`)})}})}else r.lhs.forEach((A,v)=>{if(k.inputIndices.includes(v)){let N=A.symbolToIndices.get(E);if(N===void 0)throw new Error("Invalid symbol error");N.forEach(D=>{_.push(`${a[v].indicesSet(`input${v}Indices`,D,`${E}`)}`)}),x.push(`prod *= ${a[v].getByIndices(`input${v}Indices`)};`)}}),b.push(`for(var ${E}: u32 = 0; ${E} < uniforms.${ma(E)}; ${E}++) {`),S.push("}")});let I=$?[...h,`let sum = ${a.map((k,E)=>k.getByIndices(`input${E}Indices`)).join(" * ")};`]:[...h,g,...b,..._,c,...x,y,...S];return`
            ${d.registerUniforms(u.map(k=>({name:`${ma(k)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,s)}

            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${a.map((k,E)=>`var input${E}Indices: ${a[E].type.indices};`).join(`
`)}
            ${I.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let d=u.filter(c=>r.symbolToInfo.has(c)).map(c=>{var g;return{type:12,data:((g=r.symbolToInfo.get(c))==null?void 0:g.dimValue)||0}});d.push({type:12,data:n});let h=e.map((c,g)=>[...J(c)]).reduce((c,g)=>c.concat(g),d);return h.push(...J(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:h}},getShaderSource:l}},Ol=(e,t)=>{let r=new Cl(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((n,s)=>n.dims);e.compute(Al(a,e.inputs[0].dataType,r,i))},Rl=e=>{let t=e.equation.replace(/\s+/g,"");return he({equation:t})}}),Bl,ga,Ml,Nl,Dl,vm=U(()=>{te(),re(),ae(),Bl=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},ga=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},Ml=(e,t)=>e.length>t.length?ga(e,t):ga(t,e),Nl=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=Ml(t,r),a=e[0].dataType,n=a===9||O.size(t)===1,s=a===9||t.length>0&&t[t.length-1]%4===0?4:1,u=n||i.length>0&&i[i.length-1]%4===0?4:1,l=Math.ceil(O.size(i)/u),d=c=>{let g=M("input",a,t.length,s),y=Y("output",a,i.length,u),_;if(a===9){let b=(S,x,$="")=>`
          let outputIndices${x} = ${y.offsetToIndices(`outputOffset + ${x}u`)};
          let offset${x} = ${g.broadcastedIndicesToOffset(`outputIndices${x}`,y)};
          let index${x} = offset${x} / 4u;
          let component${x} = offset${x} % 4u;
          ${S}[${x}] = ${$}(${g.getByOffset(`index${x}`)}[component${x}]);
        `;_=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${b("data",0,"u32")}
        ${b("data",1,"u32")}
        ${b("data",2,"u32")}
        ${b("data",3,"u32")}
        ${y.setByOffset("global_idx","data")}
      }`}else _=`
        let outputIndices = ${y.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",y)};
        let data = ${y.type.value}(${g.getByOffset(`inputOffset / ${s}`)});
        ${y.setByOffset("global_idx","data")}
      }`;return`
    ${c.registerUniform("vec_size","u32").declareVariables(g,y)}
    ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${_}`},h=[{type:12,data:l},...J(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${u}`,inputDependencies:["rank"]},getShaderSource:d,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:h})}},Dl=e=>{Bl(e.inputs),e.compute(Nl(e.inputs),{inputs:[0]})}}),Ul,Pl,xm=U(()=>{te(),re(),ae(),Qi(),Ul=e=>{let t=e[0].dataType,r=O.size(e[0].dims),i=O.size(e[1].dims),a=i%4===0,n=s=>{let u=M("x",t,[1],4),l=M("bias",t,[1],4),d=Y("y",t,[1],4),h=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],c=y=>`
      let bias${y}_offset: u32 = (global_idx * 4 + ${y}) % uniforms.bias_size;
      let bias${y} = ${l.getByOffset(`bias${y}_offset / 4`)}[bias${y}_offset % 4];`,g=a?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${c(0)}${c(1)}${c(2)}${c(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(h).declareVariables(u,l,d)}

    ${Zi(ze(t))}

    ${s.mainStart(Ft)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${d.setByOffset("global_idx",Yi("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:n,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/Ft/4)}})}},Pl=e=>{e.inputs.length<2||O.size(e.inputs[1].dims)===0?bu(e):e.compute(Ul(e.inputs))}}),ql,Ll,Wl,Vl,Sm=U(()=>{te(),re(),xe(),ae(),ql=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},Ll=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=O.normalizeAxis(t.axis,a),s=r.slice(0);s.splice(n,1,...i);let u=r[n],l=e[0].dataType===9?4:1,d=Math.ceil(O.size(s)/l),h=[{type:12,data:d},{type:6,data:u},{type:12,data:n},...J(e[0].dims,e[1].dims,s)],c=g=>{let y=M("data",e[0].dataType,e[0].dims.length,l),_=M("inputIndices",e[1].dataType,e[1].dims.length),b=Y("output",e[0].dataType,s.length,l),S=$=>{let I=i.length,k=`var indicesIndices${$}  = ${_.type.indices}(0);`;for(let E=0;E<I;E++)k+=`${I>1?`indicesIndices${$}[${E}]`:`indicesIndices${$}`} = ${s.length>1?`outputIndices${$}[uniforms.axis + ${E}]`:`outputIndices${$}`};`;k+=`
          var idx${$} = ${_.getByIndices(`indicesIndices${$}`)};
          if (idx${$} < 0) {
            idx${$} = idx${$} + uniforms.axisDimLimit;
          }
          var dataIndices${$} : ${y.type.indices};
        `;for(let E=0,C=0;E<a;E++)E===n?(k+=`${a>1?`dataIndices${$}[${E}]`:`dataIndices${$}`} = u32(idx${$});`,C+=I):(k+=`${a>1?`dataIndices${$}[${E}]`:`dataIndices${$}`} = ${s.length>1?`outputIndices${$}[${C}]`:`outputIndices${$}`};`,C++);return k},x;if(e[0].dataType===9){let $=(I,k,E="")=>`
          let outputIndices${k} = ${b.offsetToIndices(`outputOffset + ${k}u`)};
          ${S(k)};
          let offset${k} = ${y.indicesToOffset(`dataIndices${k}`)};
          let index${k} = offset${k} / 4u;
          let component${k} = offset${k} % 4u;
          ${I}[${k}] = ${E}(${y.getByOffset(`index${k}`)}[component${k}]);
        `;x=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${$("value",0,"u32")}
        ${$("value",1,"u32")}
        ${$("value",2,"u32")}
        ${$("value",3,"u32")}
        ${b.setByOffset("global_idx","value")}
      `}else x=`
      let outputIndices = ${b.offsetToIndices("global_idx")};
      ${S("")};
      let value = ${y.getByIndices("dataIndices")};
      ${b.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(y,_,b)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${x}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h}),getShaderSource:c}},Wl=e=>he({axis:e.axis}),Vl=(e,t)=>{let r=e.inputs;ql(r),e.compute(Ll(e.inputs,t))}}),Gl,Hl,Fl,km=U(()=>{te(),re(),ae(),Gl=(e,t,r,i,a,n,s,u,l)=>{let d=[{type:12,data:n},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:s},{type:12,data:u},{type:12,data:l}],h=[n];d.push(...J(t.dims,h));let c=g=>{let y=M("indices_data",t.dataType,t.dims.length),_=Y("input_slice_offsets_data",12,1,1),b=[y,_],S=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(S).declareVariables(...b)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:h,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:d}),getShaderSource:c},{inputs:[t],outputs:[-1]})[0]},Hl=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,n=r[1].dims,s=n[n.length-1],u=O.sizeToDimension(n,n.length-1),l=O.sizeFromDimension(i,t.batchDims+s),d=O.sizeToDimension(i,t.batchDims),h=O.sizeFromDimension(i,t.batchDims),c=u/d,g=new Array(s),y=l;for(let k=0;k<s;++k)g[s-1-k]=y,y*=i[t.batchDims+s-1-k];let _=Gl(e,r[1],g,t.batchDims,i,u,c,h,s),b=t.batchDims+s;if(b>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let S=n.slice(0,-1).concat(i.slice(b)),x=O.size(S),$=[{type:12,data:x},{type:12,data:l},...J(r[0].dims,_.dims,S)],I=k=>{let E=M("data",r[0].dataType,r[0].dims.length),C=M("slice_offsets",12,_.dims.length),A=Y("output",r[0].dataType,S.length);return`
          ${k.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(E,C,A)}
            ${k.mainStart()}
            ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:S,dataType:a}],dispatchGroup:{x:Math.ceil(x/64)},programUniforms:$}),getShaderSource:I},{inputs:[r[0],_]})},Fl=e=>({batchDims:e.batch_dims,cacheKey:""})}),jl,Kl,Xl,Zl,Tm=U(()=>{te(),re(),xe(),ae(),jl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=O.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],n=e[2],s=e.length===4?e[3]:void 0;if(n.dims.length!==a.dims.length||!a.dims.map((u,l)=>l===r?Math.ceil(u/i)===n.dims[l]:u===n.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==n.dims.length||!s.dims.map((u,l)=>u===n.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},Kl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=O.normalizeAxis(t.gatherAxis,a),s=O.normalizeAxis(t.quantizeAxis,a),u=r.slice(0);u.splice(n,1,...i);let l=O.size(u),d=e[2].dataType,h=e[0].dataType===22,c=[{type:12,data:l},{type:12,data:s},{type:12,data:n},{type:12,data:t.blockSize},...J(...e.map((y,_)=>y.dims),u)],g=y=>{let _=M("data",e[0].dataType,e[0].dims.length),b=M("inputIndices",e[1].dataType,e[1].dims.length),S=M("scales",e[2].dataType,e[2].dims.length),x=e.length>3?M("zeroPoint",e[3].dataType,e[3].dims.length):void 0,$=Y("output",d,u.length),I=[_,b,S];x&&I.push(x);let k=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${y.registerUniforms(k).declareVariables(...I,$)}
        ${y.mainStart()}
        let output_indices = ${$.offsetToIndices("global_idx")};
        var indices_indices = ${b.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${$.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${b.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${$.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${_.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${$.indicesGet("output_indices","i")};
          ${_.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${b.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[n]};
        }
        ${_.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${$.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${_.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${_.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${_.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${S.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${S.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${S.getByIndices("scale_indices")};
        ${x?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${x.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${x.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${ze(d)}(quantized_data - zero_point) * scale;
        ${$.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((y,_)=>_!==1).map(y=>y.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(y,_)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:d}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:c}),getShaderSource:g}},Xl=(e,t)=>{let r=e.inputs;jl(r,t),e.compute(Kl(e.inputs,t))},Zl=e=>he({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),Yl,Ql,Jl,ed,Im=U(()=>{te(),re(),xe(),ae(),Yl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Ql=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,n=e[1].dims,s=e[1].dataType,u=O.normalizeAxis(t.axis,a),l=r[u],d=n.slice(0),h=O.size(d),c=M("input",i,a),g=M("indicesInput",s,n.length),y=Y("output",i,d.length),_=[{type:12,data:h},{type:6,data:l},{type:12,data:u}];return _.push(...J(r,n,d)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:d,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:_}),getShaderSource:b=>`
      ${b.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(c,g,y)}
      ${b.mainStart()}
      ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${y.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${c.type.indices}(outputIndices);
      ${c.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${c.getByIndices("inputIndices")};

      ${y.setByOffset("global_idx","value")};
  }`}},Jl=e=>he({axis:e.axis}),ed=(e,t)=>{let r=e.inputs;Yl(r),e.compute(Ql(e.inputs,t))}}),td,rd,id,ad,Em=U(()=>{te(),re(),ae(),td=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},rd=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,n,s]=cs.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[a,n];if(!u)throw new Error("Can't use gemm on the given tensors");let l=16,d=Math.ceil(n/l),h=Math.ceil(a/l),c=!0,g=O.size(u),y=[{type:12,data:c?d:g},{type:12,data:a},{type:12,data:n},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],_=["type","type"];e.length===3&&(y.push(...J(e[2].dims)),_.push("rank")),y.push(...J(u));let b=x=>{let $="";t.transA&&t.transB?$="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?$="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?$="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&($="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let I=t.alpha===1?"":"value *= uniforms.alpha;",k=M("a",e[0].dataType,e[0].dims),E=M("b",e[1].dataType,e[1].dims),C=k.type.value,A=null,v=[k,E];e.length===3&&(A=M("c",e[2].dataType,e[2].dims.length),v.push(A));let N=Y("output",e[0].dataType,u.length);v.push(N);let D=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${x.registerUniforms(D).declareVariables(...v)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${C}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${$}
    }

    ${I}
    ${A!=null?`let cOffset = ${A.broadcastedIndicesToOffset("vec2(m, n)",N)}; value += ${C}(uniforms.beta) * ${A.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},S=x=>{let $=M("a",e[0].dataType,e[0].dims),I=M("b",e[1].dataType,e[1].dims),k=null,E=[$,I];e.length===3&&(k=M("c",e[2].dataType,e[2].dims.length),E.push(k));let C=Y("output",e[0].dataType,u.length);E.push(C);let A=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],v="",N="";t.transA&&t.transB?(N=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(N=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(N=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(N=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${$.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let D=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${x.registerUniforms(A).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${$.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${I.type.storage}, ${l}>, ${l}>;
  ${x.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${C.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${N}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${v}
      }
      workgroupBarrier();
    }

    ${D}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${k!=null?`let cOffset = ${k.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${C.type.value}(uniforms.beta) * ${k.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return c?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:d*h},programUniforms:y}),getShaderSource:S}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:b}},id=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},ad=(e,t)=>{td(e.inputs),e.compute(rd(e.inputs,t))}}),et,lt,Mt,Nt,nd,sd,od,ud,ld,dd,pd,cd,hd,fd,zm=U(()=>{te(),re(),xe(),ae(),[et,lt,Mt,Nt]=[0,1,2,3],nd=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},sd=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,od=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,ud=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,ld=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,dd=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${et}] = batch;
     indices[${lt}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${Mt}] = u32(r);
            indices[${Nt}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${Mt}] = u32(clamp(r, 0, H - 1));
          indices[${Nt}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${Mt}] = gs_reflect(r, border[1], border[3]);
          indices[${Nt}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,pd=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${et}], indices[${lt}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${et}], indices[${lt}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${et}], indices[${lt}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${et}], indices[${lt}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${et}], indices[${lt}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${et}], indices[${lt}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,cd=(e,t)=>{let r=M("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=M("grid",e[1].dataType,i.length,2),n=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(n=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[et,lt,Mt,Nt]=[0,3,1,2]);let s=Y("output",e[0].dataType,n.length),u=r.type.value,l=O.size(n),d=[{type:12,data:l},...J(e[0].dims,i,n)],h=c=>`
  ${c.registerUniform("output_size","u32").declareVariables(r,a,s)}
  ${sd}
  ${od(u)}
  ${ud(t)}
  ${ld(t)}
  ${dd(r,u,t)}

  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${Mt}]);
      let W_in = i32(uniforms.x_shape[${Nt}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${et}], indices[${Mt}], indices[${Nt}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${pd(s,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:c=>{let g=O.size(n);return{outputs:[{dims:n,dataType:c[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:d}},getShaderSource:h}},hd=(e,t)=>{nd(e.inputs),e.compute(cd(e.inputs,t))},fd=e=>he({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),Ae,md,gd,ya,yd,ur,_d,bd=U(()=>{te(),re(),xe(),Di(),Ki(),ae(),ft(),Ae=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,md=(e,t)=>{let r=e[0],i=Ae(e,1),a=Ae(e,2),n=Ae(e,3),s=Ae(e,4),u=Ae(e,5),l=Ae(e,6),d=Ae(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let h=r.dims[0],c=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],y=c,_=0,b=0,S=Math.floor(g/t.numHeads);if(l&&d&&O.size(l.dims)&&O.size(d.dims)){if(l.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==h||l.dims[1]!==t.numHeads||l.dims[3]!==S)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[0]!==h||d.dims[1]!==t.numHeads||d.dims[3]!==S)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==d.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(d.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');_=l.dims[2],b=l.dims[2]}else if(l&&O.size(l.dims)||d&&O.size(d.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let x;if(i&&O.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');x=2,y=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==S)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');x=5,y=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==S)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');x=0,y=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');x=3}if(n&&O.size(n.dims)>0){if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let $=_+y,I=0;if(s&&O.size(s.dims)>0){I=8;let A=s.dims;throw A.length===1?A[0]===h?I=1:A[0]===3*h+2&&(I=3):A.length===2&&A[0]===h&&A[1]===$&&(I=5),I===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let k=!1,E=g;if(a&&O.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(y!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');E=a.dims[2]}else{if(y!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');E=a.dims[1]*a.dims[3],k=!0}}let C=!1;if(s&&O.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(u&&O.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==h||u.dims[1]!==t.numHeads||u.dims[2]!==c||u.dims[3]!==$)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:h,sequenceLength:c,pastSequenceLength:_,kvSequenceLength:y,totalSequenceLength:$,maxSequenceLength:b,inputHiddenSize:0,hiddenSize:g,vHiddenSize:E,headSize:S,vHeadSize:Math.floor(E/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:I,scale:t.scale,broadcastResPosBias:C,passPastInKv:k,qkvFormat:x}},gd=e=>he({...e}),ya=he({perm:[0,2,1,3]}),yd=(e,t,r,i,a,n,s)=>{let u=[i,a,n],l=O.size(u),d=[{type:12,data:l},{type:12,data:s},{type:12,data:n}],h=c=>{let g=Y("qkv_with_bias",t.dataType,u),y=M("qkv",t.dataType,u),_=M("bias",r.dataType,u),b=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${c.registerUniforms(b).declareVariables(y,_,g)}
  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d}),getShaderSource:h},{inputs:[t,r],outputs:[-1]})[0]},ur=(e,t,r,i,a,n,s,u)=>{let l=n;if(s&&O.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=yd(e,n,s,t,i,r*a,u),l=l.reshape([t,i,r,a]),r===1||i===1?l:e.compute(Ue(l,ya.perm),{inputs:[l],outputs:[-1]})[0]}else return n.dims.length===3&&(l=n.reshape([t,i,r,a])),r===1||i===1?l:e.compute(Ue(l,ya.perm),{inputs:[l],outputs:[-1]})[0]},_d=(e,t)=>{let r=md(e.inputs,t),i=e.inputs[0],a=Ae(e.inputs,1),n=Ae(e.inputs,2),s=Ae(e.inputs,3),u=Ae(e.inputs,4),l=Ae(e.inputs,5),d=Ae(e.inputs,6),h=Ae(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if((a==null?void 0:a.dims.length)===5)throw new Error("Packed KV is not implemented");let c=a&&n&&a.dims.length===4&&n.dims.length===4,g=ur(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(c)return ir(e,g,a,n,u,void 0,d,h,l,r);if(!a||!n)throw new Error("key and value must be provided");let y=ur(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,s,r.hiddenSize),_=ur(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,n,s,2*r.hiddenSize);ir(e,g,y,_,u,void 0,d,h,l,r)}}),$d,wd,vd,xd,_a,Sd,kd,Td=U(()=>{te(),re(),xe(),ae(),$d=e=>{if(!e||e.length<1)throw new Error("too few inputs")},wd=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),he({numOutputs:i,axis:t.axis,splitSizes:r})},vd=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Q("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,xd=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},_a=(e,t)=>{let r=e[0].dims,i=O.size(r),a=e[0].dataType,n=O.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),u=M("input",a,r.length),l=new Array(t.numOutputs),d=[],h=[],c=0,g=[{type:12,data:i}];for(let _=0;_<t.numOutputs;_++){c+=t.splitSizes[_],l[_]=c;let b=r.slice();b[n]=t.splitSizes[_],h.push(b),s[_]=Y(`output${_}`,a,b.length),d.push({dims:h[_],dataType:e[0].dataType})}g.push({type:12,data:l},...J(r,...h));let y=_=>`
  ${_.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(u,...s)}
  ${vd(l.length)}
  ${xd(s)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",n)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Q("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${u.indicesSet("indices",n,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:y,getRunData:()=>({outputs:d,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},Sd=(e,t)=>{$d(e.inputs);let r=e.inputs.length===1?t:wd(e.inputs,t);e.compute(_a(e.inputs,r),{inputs:[0]})},kd=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return he({axis:t,numOutputs:i,splitSizes:r})}}),Id,Dr,Ed,zd=U(()=>{te(),re(),xe(),ae(),Id=(e,t)=>{let[r,i,a,n]=e,{numHeads:s,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!O.areEqual(i.dims,[])&&!O.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(!O.areEqual(a.dims,n.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],d=r.dims[r.dims.length-2],h=a.dims[0],c=O.sizeFromDimension(r.dims,1)/d,g=u===0?a.dims[1]*2:c/s;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(l!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(d!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(d>h)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(g/2!==a.dims[1]&&u/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`)},Dr=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:n}=t,s=e[0].dims[0],u=O.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],d=u/l,h=e[2].dims[1],c=a===0?h*2:d/i,g=new Array(s,l,d/c,c-h),y=O.computeStrides(g),_=[{type:1,data:n},{type:12,data:g},{type:12,data:y},...e[0].dims.length===3?new Array({type:12,data:[u,d,c,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,c,l*c,1]}):[],...J(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],b=S=>{let x=M("input",e[0].dataType,e[0].dims.length),$=M("position_ids",e[1].dataType,e[1].dims.length),I=M("cos_cache",e[2].dataType,e[2].dims.length),k=M("sin_cache",e[3].dataType,e[3].dims.length),E=Y("output",e[0].dataType,e[0].dims.length);return S.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:y.length},{name:"input_output_strides",type:"u32",length:y.length}]),`
        ${S.declareVariables(x,$,I,k,E)}

        ${S.mainStart(Ft)}
          let half_rotary_emb_dim = uniforms.${I.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${$.broadcastedIndicesToOffset("bsnh.xy",Y("",$.type.tensor,2))};
            let position_id =
                u32(${$.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${x.getByOffset("i")} * ${I.get("position_id","bsnh[3]")} -
                ${x.getByOffset("j")} * ${k.get("position_id","bsnh[3]")};
            ${E.setByOffset("i","re")}
            let im = ${x.getByOffset("i")} * ${k.get("position_id","bsnh[3]")} +
                ${x.getByOffset("j")} * ${I.get("position_id","bsnh[3]")};
            ${E.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k",x.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:he({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:b,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(g)/Ft)},programUniforms:_})}},Ed=(e,t)=>{Id(e.inputs,t),e.compute(Dr(e.inputs,t))}}),Cd,Ad,ba,Od,Rd,Cm=U(()=>{xe(),te(),Ki(),bd(),Td(),ft(),zd(),ae(),Cd=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,l=r.dims[0],d=r.dims[1],h=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],c=d,g=0,y=!i||i.dims.length===0,_=Math.floor(y?h/(t.numHeads+2*t.kvNumHeads):h/t.numHeads);y&&(h=_*t.numHeads);let b=n&&n.dims.length!==0,S=s&&s.dims.length!==0;if(b&&n.dims.length===4&&n.dims[0]===l&&n.dims[1]!==t.kvNumHeads&&n.dims[2]===t.kvNumHeads&&n.dims[3]===_)throw new Error("BSNH pastKey/pastValue is not supported");if(b&&S){if(n.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=n.dims[2]}else if(b||S)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let x=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');c=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==_)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');c=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==_)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');c=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');x=3}let $=0,I=!1,k=t.kvNumHeads?_*t.kvNumHeads:h;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(c!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');k=a.dims[2]}else{if(c!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');k=a.dims[1]*a.dims[3],I=!0}}let E=e.length>4?e[5]:void 0;if(E){if(E.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let C=E.dims.reduce((A,v)=>A*v,1);if(C!==l)throw new Error(`seqlens_k must have batch_size (${l}) elements, got ${C}.`);for(let A=0;A<E.dims.length;A++)if(E.dims[A]!==1&&E.dims[A]!==l)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${A}] = ${E.dims[A]}.`)}return{batchSize:l,sequenceLength:d,pastSequenceLength:g,kvSequenceLength:c,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:h,vHiddenSize:k,headSize:_,vHeadSize:Math.floor(k/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:$,scale:t.scale,broadcastResPosBias:!1,passPastInKv:I,qkvFormat:x}},Ad=he({perm:[0,2,1,3]}),ba=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(Ue(i,Ad.perm),{inputs:[i],outputs:[-1]})[0]),i},Od=(e,t,r,i)=>{let a=7,n=["type","type"],s=[e*t],u=e*t,l=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],d=h=>{let c=M("seq_lens",r.dataType,r.dims),g=M("total_seq_lens",i.dataType,i.dims),y=Y("pos_ids",a,s),_=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${h.registerUniforms(_).declareVariables(c,g,y)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${c.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${y.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:n},getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:d}},Rd=(e,t)=>{var k;let r=Cd(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(((k=e.inputs[1])==null?void 0:k.dims.length)===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,n=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,d=e.inputs.length>5?e.inputs[6]:void 0,h=r.kvNumHeads?r.kvNumHeads:r.numHeads,c=he({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,h*r.headSize,h*r.headSize]}),[g,y,_]=!a&&!n?e.compute(_a([i],c),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,n],b,S;if(t.doRotary){let E=e.compute(Od(r.batchSize,r.sequenceLength,l,d),{inputs:[l,d],outputs:[-1]})[0],C=e.inputs[7],A=e.inputs[8],v=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),N=[g,E,C,A],D=[-1];b=e.compute(Dr(N,v),{inputs:N,outputs:D})[0],N.splice(0,1,y);let H=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});S=e.compute(Dr(N,H),{inputs:N,outputs:D})[0]}let x=ur(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?b:g,void 0,0),$=ba(e,t.doRotary?S:y,r),I=ba(e,_,r);ir(e,x,$,I,void 0,void 0,s,u,void 0,r,l,d)}}),$a,Bd,Md,Nd,Am=U(()=>{te(),re(),ft(),ae(),$a=(e,t,r,i,a,n,s,u)=>{let l=ve(n),d=l===1?"f32":`vec${l}f`,h=l===1?"vec2f":`mat2x${l}f`,c=a*s,g=64;c===1&&(g=256);let y=[a,s,n/l],_=[a,s,2],b=["rank","type","type"],S=[];S.push(...J(y,_));let x=$=>{let I=M("x",t.dataType,3,l),k=M("scale",r.dataType,r.dims),E=M("bias",i.dataType,i.dims),C=Y("output",1,3,2),A=[I,k,E,C];return`
  var<workgroup> workgroup_shared : array<${h}, ${g}>;
  const workgroup_size = ${g}u;
  ${$.declareVariables(...A)}
  ${$.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${d}(0);
    var squared_sum = ${d}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${d}(${I.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${h}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${ht("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${ht("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${u};${g}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:_,dataType:1}],dispatchGroup:{x:c},programUniforms:S}),getShaderSource:x},{inputs:[t,r,i],outputs:[-1]})[0]},Bd=(e,t,r)=>{let i=t[0].dims,a=i,n=2,s=i[0],u=i[1],l=O.sizeFromDimension(i,n),d=ve(l),h=O.size(a)/d,c=$a(e,t[0],t[1],t[2],s,l,u,r.epsilon),g=[s,u,l/d],y=[s,u],_=["type","none"],b=S=>{let x=M("x",t[0].dataType,g.length,d),$=M("scale_shift",1,y.length,2),I=Y("output",t[0].dataType,g.length,d),k=[x,$,I];return`
  ${S.registerUniform("output_size","u32").declareVariables(...k)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${I.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${$.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${x.getByOffset("global_idx")} * ${I.type.value}(scale_shift.x) + ${I.type.value}(scale_shift.y);
      ${I.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${d}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},...J(g,y,g)]}),getShaderSource:b},{inputs:[t[0],c]})},Md=(e,t,r)=>{let i=t[0].dims,a=i,n=i[0],s=i[i.length-1],u=O.sizeFromDimension(i,1)/s,l=ve(s),d=O.size(a)/l,h=[{type:12,data:u},{type:12,data:Math.floor(s/l)}],c=["type","type"],g=!1,y=[0,i.length-1];for(let x=0;x<i.length-2;x++)g=g||i[x+1]!==1,y.push(x+1);g=g&&i[i.length-1]!==1;let _=g?e.compute(Ue(e.inputs[0],y),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(x,$)=>i[y[$]])),b=$a(e,_,t[1],t[2],n,u,s,r.epsilon),S=x=>{let $=Te(t[0].dataType),I=l===1?"vec2f":`mat${l}x2f`,k=A=>{let v=A===0?"x":"y",N=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${$}(${N}(scale.${v}))`;case 2:return`vec2<${$}>(${N}(scale[0].${v}, scale[1].${v}))`;case 4:return`vec4<${$}>(${N}(scale[0].${v}, scale[1].${v}, scale[2].${v}, scale[3].${v}))`;default:throw new Error(`Not supported compoents ${l}`)}},E=M("input",t[0].dataType,t[0].dims,l),C=Y("output",t[0].dataType,a,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${I}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${C.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${x.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${k(0)}, ${k(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:c},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h}),getShaderSource:S},{inputs:[t[0],b]})},Nd=(e,t)=>{t.format==="NHWC"?Md(e,e.inputs,t):Bd(e,e.inputs,t)}}),Dd,Ud,Pd,Om=U(()=>{te(),re(),ae(),Dd=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},Ud=(e,t,r)=>{let i=t.simplified,a=e[0].dims,n=e[1],s=!i&&e[2],u=a,l=O.normalizeAxis(t.axis,a.length),d=O.sizeToDimension(a,l),h=O.sizeFromDimension(a,l),c=O.size(n.dims),g=s?O.size(s.dims):0;if(c!==h||s&&g!==h)throw new Error(`Size of X.shape()[axis:] == ${h}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${c} and bias size of ${g}`);let y=[];for(let E=0;E<a.length;++E)E<l?y.push(a[E]):y.push(1);let _=ve(h),b=["type","type"],S=[{type:12,data:d},{type:1,data:h},{type:12,data:Math.floor(h/_)},{type:1,data:t.epsilon}];s&&b.push("type");let x=r>1,$=r>2,I=E=>{let C=Te(e[0].dataType),A=[M("x",e[0].dataType,e[0].dims,_),M("scale",n.dataType,n.dims,_)];s&&A.push(M("bias",s.dataType,s.dims,_)),A.push(Y("output",e[0].dataType,u,_)),x&&A.push(Y("mean_data_output",1,y)),$&&A.push(Y("inv_std_output",1,y));let v=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${E.registerUniforms(v).declareVariables(...A)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Li("f32",_)};
    var mean_square_vector = ${Li("f32",_)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${jt(C,_,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${ht("mean_vector",_)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${ht("mean_square_vector",_)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${jt(C,_,"x[j + offset]")};
      let f32scale = ${jt(C,_,"scale[j]")};
      output[j + offset] = ${A[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${jt(C,_,"bias[j]")}`:""}
      );
    }

    ${x?"mean_data_output[global_idx] = mean":""};
    ${$?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},k=[{dims:u,dataType:e[0].dataType}];return x&&k.push({dims:y,dataType:1}),$&&k.push({dims:y,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${_};${r};${i}`,inputDependencies:b},getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(d/64)},programUniforms:S}),getShaderSource:I}},Pd=(e,t)=>{Dd(e.inputs),e.compute(Ud(e.inputs,t,e.outputCount))}}),qd,Ld,Rm=U(()=>{re(),ra(),sa(),qd=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},Ld=e=>{qd(e.inputs);let t=Ht.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(ta(e.inputs,{activation:""},t));else{let a=t[t.length-2],n=O.size(e.inputs[0].dims.slice(0,-2)),s=O.size(e.inputs[1].dims.slice(0,-2));if(n!==1&&a===1&&s===1){let u=e.inputs[0].reshape([1,n,i]),l=e.inputs[1].reshape([1,i,r]),d=[1,n,r],h=[u,l];e.compute(Rr(h,{activation:""},t,d),{inputs:h})}else e.compute(Rr(e.inputs,{activation:""},t))}}}),Wd,Vd,Gd,Hd,Fd,Bm=U(()=>{te(),re(),xe(),ae(),Wd=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),n=t.blockSize/8*t.bits,s=e[1];if(!O.areEqual(s.dims,[t.n,a,n]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(O.size(u)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,d=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(O.size(l)!==d)throw new Error("zeroPoints input size error.")}},Vd=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),l=O.size(u),d=e[1].dims[2]/4,h=e[0].dataType,c=ve(t.k),g=ve(d),y=ve(s),_=u.concat([a,s]),b=a>1&&s/y%2===0?2:1,S=O.size(_)/y/b,x=64,$=[],I=[l,a,n/c],k=O.convertShape(e[1].dims).slice();k.splice(-1,1,d/g),$.push(...J(I)),$.push(...J(k)),$.push(...J(e[2].dims)),e.length===4&&$.push(...J(O.convertShape(e[3].dims)));let E=[l,a,s/y];$.push(...J(E));let C=A=>{let v=I.length,N=M("a",e[0].dataType,v,c),D=M("b",12,k.length,g),H=M("scales",e[2].dataType,e[2].dims.length),F=[N,D,H],j=e.length===4?M("zero_points",12,e[3].dims.length):void 0;j&&F.push(j);let R=E.length,K=Y("output",e[0].dataType,R,y),X=Te(e[0].dataType),ee=(()=>{switch(c){case 1:return`array<${X}, 8>`;case 2:return`mat4x2<${X}>`;case 4:return`mat2x4<${X}>`;default:throw new Error(`${c}-component is not supported.`)}})(),fe=Math.floor(32/t.bits),W=Math.floor(fe/8),ue=()=>{let Z="";for(let q=0;q<W;q++){let ge=q*t.bits*4,We=ge+t.bits;Z+=`
          // reuse a data (pass ${q})
            var input_offset${q>0?q:""} = ${q===0?N.indicesToOffset(`${N.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${q>0?q:""}: ${ee};
            for (var j${q>0?q:""}: u32 = 0; j${q>0?q:""} < ${8/c}; j${q>0?q:""}++) {
              a_data${q>0?q:""}[j${q>0?q:""}] = ${N.getByOffset(`input_offset${q>0?q:""}`)};
              input_offset${q>0?q:""}++;
            }
          `;for(let Se=0;Se<y*b;Se++)Z+=`
            b_value = ${g===1?`b${Se}_data`:`b${Se}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${q*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${ge}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${We}u) & b_mask);`}
            b_quantized_values = ${ee}(${Array.from({length:4},(Re,Be)=>`${X}(b_value_lower[${Be}]), ${X}(b_value_upper[${Be}])`).join(", ")});
            b_dequantized_values = ${c===1?`${ee}(${Array.from({length:8},(Re,Be)=>`(b_quantized_values[${Be}] - ${j?`zero_point${Se}`:"zero_point"}) * scale${Se}`).join(", ")});`:`(b_quantized_values - ${ee}(${Array(8).fill(`${j?`zero_point${Se}`:"zero_point"}`).join(",")})) * scale${Se};`};
            workgroup_shared[local_id.x * ${b} + ${Math.floor(Se/y)}]${y>1?`[${Se%y}]`:""} += ${Array.from({length:8/c},(Re,Be)=>`${c===1?`a_data${q>0?q:""}[${Be}] * b_dequantized_values[${Be}]`:`dot(a_data${q>0?q:""}[${Be}], b_dequantized_values[${Be}])`}`).join(" + ")};
          `}return Z},P=()=>{let Z=`
            var col_index = col * ${y};
            ${j?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${X}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let q=0;q<y*b;q++)Z+=`
            let scale${q} = ${H.getByOffset("col_index * nBlocksPerCol + block")};
            ${j?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${j.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${q} = ${X}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return Z},V=()=>{let Z=`col_index = col * ${y};`;for(let q=0;q<y*b;q++)Z+=`
            let b${q}_data = ${D.getByIndices(`${D.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return Z+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${ee};
            var b_dequantized_values: ${ee};`,Z};return`
        var<workgroup> workgroup_shared: array<${K.type.value}, ${b*x}>;
        ${A.declareVariables(...F,K)}
        ${A.mainStart([x,1,1])}
          let output_indices = ${K.offsetToIndices(`(global_idx / ${x}) * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${x}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/c};
            ${P()}
            for (var word: u32 = 0; word < ${d}; word += ${g}) {
              ${V()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${ue()}
                word_offset += ${fe/c};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${b}) {
            var output_value: ${K.type.value} = ${K.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${x}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${b};
            }
            ${K.setByIndices(`${K.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${c};${g};${y};${b};${x}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:h}],dispatchGroup:{x:S},programUniforms:$}),getShaderSource:C}},Gd=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),l=O.size(u),d=e[1].dims[2]/4,h=e[0].dataType,c=ve(t.k),g=ve(d),y=u.concat([a,s]),_=128,b=s%8===0?8:s%4===0?4:1,S=_/b,x=Math.floor(32/t.bits),$=S*g*x,I=$/c,k=$/t.blockSize,E=O.size(y)/b,C=[],A=[l,a,n/c],v=O.convertShape(e[1].dims).slice();v.splice(-1,1,d/g),C.push(...J(A)),C.push(...J(v)),C.push(...J(e[2].dims)),e.length===4&&C.push(...J(O.convertShape(e[3].dims)));let N=[l,a,s];C.push(...J(N));let D=H=>{let F=A.length,j=M("a",e[0].dataType,F,c),R=M("b",12,v.length,g),K=M("scales",e[2].dataType,e[2].dims.length),X=[j,R,K],ee=e.length===4?M("zero_points",12,e[3].dims.length):void 0;ee&&X.push(ee);let fe=N.length,W=Y("output",e[0].dataType,fe),ue=Te(e[0].dataType),P=()=>{switch(c){case 1:return`
          let a_data0 = vec4<${ue}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${ue}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${ue}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${ue}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${c}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${j.type.value}, ${I}>;
        var<workgroup> inter_results: array<array<${W.type.value}, ${S}>, ${b}>;
        ${H.declareVariables(...X,W)}
        ${H.mainStart([S,b,1])}
          let output_indices = ${W.offsetToIndices(`workgroup_index * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${k} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${I};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${I}; a_offset += ${_})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${j.getByIndices(`${j.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${j.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${k} + local_id.x;
            ${ee?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${ee.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${ue}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${ue}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${K.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${R.getByIndices(`${R.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/c};
            for (var i: u32 = 0; i < ${g}; i++) {
              let b_value = ${g===1?"b_data":"b_data[i]"};
              ${(()=>{let V=Math.floor(x/8),Z="";for(let q=0;q<V;q++){let ge=q*t.bits*4,We=ge+t.bits;Z+=`
              ${P()}
              {${t.bits===2?`
                let half_word = b_value >> ${q*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${ge}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${We}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${ue}>(${Array.from({length:4},(Se,Re)=>`${ue}(b_value_lower[${Re}]), ${ue}(b_value_upper[${Re}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${ue}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(Se,Re)=>`${`dot(a_data${Re}, b_dequantized_values[${Re}])`}`).join(" + ")};
              }
              word_offset += ${8/c};`}return Z})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${b}) {
            var output_value: ${W.type.value} = ${W.type.value}(0);
            for (var b = 0u; b < ${S}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${W.setByIndices(`${W.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${c};${g};${S};${b}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:h}],dispatchGroup:{x:E},programUniforms:C}),getShaderSource:D}},Hd=(e,t)=>{Wd(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Gd(e.inputs,t)):e.compute(Vd(e.inputs,t))},Fd=e=>he(e)}),jd,Kd,Xd,Zd,Yd,Qd,Jd,ep,tp,Mm=U(()=>{te(),re(),ae(),jd=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Kd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Q("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${Q("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},Xd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Q("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Q("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Q("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Zd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Q("uniforms.x_shape",a,t)})) {
                  k = i32(${Q("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${Q("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Yd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Q("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${Q("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${Q("uniforms.x_shape",a,t)})) {
                  k -= i32(${Q("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${Q("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Qd=(e,t,r)=>{switch(r.mode){case 0:return Kd(e,t,r.pads.length);case 1:return Xd(e,t,r.pads.length);case 2:return Zd(e,t,r.pads.length);case 3:return Yd(e,t,r.pads.length);default:throw new Error("Invalid mode")}},Jd=(e,t)=>{let r=O.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=O.size(r),n=[{type:12,data:a},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&n.push({type:s?e[2].dataType:1,data:t.value}),n.push(...J(e[0].dims,r));let u=["rank"],l=d=>{let h=Y("output",e[0].dataType,r.length),c=M("x",e[0].dataType,i.length),g=c.type.value,y=Qd(h,i.length,t),_=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&_.push({name:"constant_value",type:s?g:"f32"}),`
            ${d.registerUniforms(_).declareVariables(c,h)}
            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${h.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${y}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(r)/64)},programUniforms:n}),getShaderSource:l}},ep=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,n=new Int32Array(2*a).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let l=0;l<u.length;l++)n[Number(u[l])]=Number(r[l]),n[Number(u[l])+a]=Number(r[l+u.length])}else r.forEach((u,l)=>n[Number(l)]=Number(u));let s=[];return n.forEach(u=>s.push(u)),{mode:t.mode,value:i,pads:s}}else return t},tp=(e,t)=>{jd(e.inputs);let r=ep(e.inputs,t);e.compute(Jd(e.inputs,r),{inputs:[0]})}}),lr,wa,va,xa,Sa,rp,ip,ka,Ta,ap,np,Ia,sp,op,Ea,up,lp,dp,pp,Nm=U(()=>{Le(),te(),re(),ae(),lr=e=>{if(_e.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},wa=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let n=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),u=t.strides.slice(),l=n?t.dilations.slice():[],d=t.pads.slice();Tr.adjustPoolAttributes(r,a,s,u,l,d);let h=Tr.computePoolOutputShape(r,a,u,l,s,d,t.autoPad),c=Object.assign({},t);n?Object.assign(c,{kernelShape:s,strides:u,pads:d,dilations:l,cacheKey:t.cacheKey}):Object.assign(c,{kernelShape:s,strides:u,pads:d,cacheKey:t.cacheKey});let g=h.slice();return g.push(g.splice(1,1)[0]),[c,i?g:h]},va=(e,t)=>{let r=t.format==="NHWC",i=O.size(e),a=O.size(t.kernelShape),n=[{type:12,data:i},{type:12,data:a}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],d=t.pads[t.pads.length/2-1],h=t.pads[t.pads.length-1],c=!!(d+h);n.push({type:12,data:u},{type:12,data:l},{type:12,data:d},{type:12,data:h}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let y=t.kernelShape[t.kernelShape.length-2],_=t.strides[t.strides.length-2],b=t.pads[t.pads.length/2-2],S=t.pads[t.pads.length-2];g=!!(b+S),n.push({type:12,data:y},{type:12,data:_},{type:12,data:b},{type:12,data:S}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[n,s,!0,c,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=O.computeStrides(t.kernelShape);n.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((d,h)=>d+h);return[n,s,!!l,!1,!1]}},xa=(e,t,r,i,a,n,s,u,l,d,h,c)=>{let g=a.format==="NHWC",y=t.type.value,_=Y("output",t.type.tensor,i);if(a.kernelShape.length<=2){let b="",S="",x="",$=r-(g?2:1);if(h?b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${$}] = indices[${$}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${$}] < 0 || xIndices[${$}]
                      >= uniforms.x_shape[${$}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`:b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${$}] = indices[${$}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`,a.kernelShape.length===2){let I=r-(g?3:2);c?S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${I}] < 0 || xIndices[${I}] >= uniforms.x_shape[${I}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                `,x=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var value = ${y}(${u});
              var pad = 0;
              ${S}
              ${b}
              ${x}
              ${s}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let b=a.kernelShape.length,S=a.pads.length,x="";return d?x=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${n}
              }`:x=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${n}
            `,`
            ${e.registerUniforms(l).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var offsets: array<u32, ${b}>;

              var value = ${y}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${b-1}u; j++) {
                  offsets[j] = offset / ${Q("uniforms.kernelStrides","j",b)};
                  offset -= offsets[j] * ${Q("uniforms.kernelStrides","j",b)};
                }
                offsets[${b-1}] = offset;

                isPad = false;
                for (var j = ${r-b}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Q("uniforms.strides",`j - ${r-b}u`,b)}
                    + offsets[j - ${r-b}u] - ${Q("uniforms.pads","j - 2u",S)};
                  ${x}
              }
              ${s}

              output[global_idx] = value;
            }`}},Sa=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,rp=e=>`${Sa(e)};${e.countIncludePad}`,ip=e=>`${Sa(e)};${e.storageOrder};${e.dilations}`,ka=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),Ta=(e,t,r,i)=>{let[a,n]=wa(t,i,r),s=M("x",t.dataType,t.dims.length),u=s.type.value,l="value += x_val;",d="";a.countIncludePad?d+=`value /= ${u}(uniforms.kernelSize);`:d+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[h,c,g,y,_]=va(n,a);h.push(...J(t.dims,n));let b=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(n)/64)},programUniforms:h}),getShaderSource:S=>xa(S,s,t.dims.length,n.length,a,l,d,0,c,g,y,_)}},ap=e=>{let t=e.count_include_pad!==0,r=ka(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:rp(i)}},np=(e,t)=>{lr(e.inputs),e.compute(Ta("AveragePool",e.inputs[0],!1,t))},Ia={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},sp=e=>{let t=e.format;return{format:t,...Ia,cacheKey:t}},op=(e,t)=>{lr(e.inputs),e.compute(Ta("GlobalAveragePool",e.inputs[0],!0,t))},Ea=(e,t,r,i)=>{let[a,n]=wa(t,i,r),s=`
      value = max(x_val, value);
    `,u="",l=M("x",t.dataType,t.dims.length),d=["rank"],[h,c,g,y,_]=va(n,a);return h.push(...J(t.dims,n)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(n)/64)},programUniforms:h}),getShaderSource:b=>xa(b,l,t.dims.length,n.length,a,s,u,t.dataType===10?-65504:-1e5,c,g,y,_)}},up=(e,t)=>{lr(e.inputs),e.compute(Ea("MaxPool",e.inputs[0],!1,t))},lp=e=>{let t=e.storage_order,r=e.dilations,i=ka(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:ip(a)}},dp=e=>{let t=e.format;return{format:t,...Ia,cacheKey:t}},pp=(e,t)=>{lr(e.inputs),e.compute(Ea("GlobalMaxPool",e.inputs[0],!0,t))}}),cp,hp,fp,mp,Dm=U(()=>{te(),re(),xe(),ae(),cp=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,n)=>n===t.axis||a===e[0].dims[n]).reduce((a,n)=>a&&n,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},hp=(e,t)=>{let r=O.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,n=e[0].dims,s=e[1].dataType,u=O.size(n),l=i===3||i===2,d=l?[Math.ceil(O.size(e[0].dims)/4)]:e[0].dims,h=e[1].dims,c=e.length>2?e[2]:void 0,g=c?l?[Math.ceil(O.size(c.dims)/4)]:c.dims:void 0,y=h.length===0||h.length===1&&h[0]===1,_=y===!1&&h.length===1,b=ve(u),S=y&&(!l||b===4),x=S?b:1,$=S&&!l?b:1,I=M("input",l?12:i,d.length,$),k=M("scale",s,h.length),E=c?M("zero_point",l?12:i,g.length):void 0,C=Y("output",s,n.length,x),A=[I,k];E&&A.push(E);let v=[d,h];c&&v.push(g);let N=[{type:12,data:u/x},{type:12,data:r},{type:12,data:t.blockSize},...J(...v,n)],D=H=>{let F=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${H.registerUniforms(F).declareVariables(...A,C)}
      ${H.mainStart()}
          ${H.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${C.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${I.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${x===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${I.getByOffset("global_idx")};`};

          // Set scale input
          ${y?`let scale_value= ${k.getByOffset("0")}`:_?`
            let scale_index = ${C.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${k.getByOffset("scale_index")};`:`
            var scale_indices: ${k.type.indices} = output_indices;
            let index = ${k.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${k.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${k.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E?y?l?`
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${E.getByOffset("0")}`:_?l?`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${k.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${E.getByIndices("scale_indices")};`:`let zero_point_value = ${l?a?"i32":"u32":I.type.value}(0);`};
      // Compute and write output
      ${C.setByOffset("global_idx",`${C.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:E?["rank","rank","rank"]:["rank","rank"]},getShaderSource:D,getRunData:()=>({outputs:[{dims:n,dataType:s}],dispatchGroup:{x:Math.ceil(u/x/64),y:1,z:1},programUniforms:N})}},fp=(e,t)=>{cp(e.inputs,t),e.compute(hp(e.inputs,t))},mp=e=>he({axis:e.axis,blockSize:e.blockSize})}),gp,yp,_p,Um=U(()=>{Le(),te(),ae(),gp=(e,t,r)=>{let i=e===t,a=e<t&&r<0,n=e>t&&r>0;if(i||a||n)throw new Error("Range these inputs' contents are invalid.")},yp=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),n=[a],s=a,u=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...J(n)],l=d=>{let h=Y("output",i,n.length),c=h.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:c},{name:"delta",type:c}];return`
        ${d.registerUniforms(g).declareVariables(h)}
        ${d.mainStart()}
        ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${c}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:n,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:u})}},_p=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),_e.webgpu.validateInputContent&&gp(t,r,i),e.compute(yp(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),bp,$p,wp,vp,Pm=U(()=>{te(),re(),xe(),ae(),bp=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,n=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${n}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${n}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${n}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${n}`;default:throw new Error(`Reduction ${e} is not supported.`)}},$p=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,n=1,s=Math.ceil(O.sizeToDimension(i,i.length-1)/n),u=i[i.length-1],l=O.sizeFromDimension(r,u),d=[{type:12,data:s},{type:12,data:u},{type:12,data:l},...J(e[1].dims,e[2].dims,a)],h=c=>{let g=M("indices",e[1].dataType,e[1].dims.length),y=M("updates",e[2].dataType,e[2].dims.length,n),_=t.reduction!=="none"&&t.reduction!==""?Is("output",e[0].dataType,a.length):Y("output",e[0].dataType,a.length,n);return`
      ${c.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,y,_)}
      ${c.mainStart()}
        ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${bp(t.reduction,"output[data_offset + i]","value",_.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:d}),getShaderSource:h}},wp=e=>he({reduction:e.reduction}),vp=(e,t)=>{e.compute($p(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),xp,Sp,kp,za,Tp,Ip,Ep,zp,Cp,Ap,Op,Rp,Ca,Bp,Mp,Np,Dp,Up,Pp,qp,qm=U(()=>{te(),re(),xe(),ae(),xp=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Sp=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,n)=>i[a]=e[n]),i},kp=(e,t,r,i,a,n)=>{let[s,u,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],d=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(h=>n.push(h));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(h=>i.push(h)),i.length!==0&&i.length!==d&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");xp(i,t),t.axes.length>0&&Sp(i,t.axes,d).forEach((h,c)=>i[c]=h)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach(h=>a.push(Number(h))),a.length!==0&&a.length!==d&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>d)throw new Error("Resize requires only of scales or sizes to be specified")},za=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,Tp=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${za("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${za("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Ip=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";case"simple":default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Ep=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((n,s)=>{i[n]=a[s],i[s+r]=a[t.length+s]}),i):a},zp=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(n=>a.push(n)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((n,s)=>a[n]=r[s])}else r.forEach(n=>a.push(n));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((n,s)=>Math.round(n*t[s]))}return a},Cp=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(n=>t[n]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(n=>t[n]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(n=>t[n]=i),r.axes.forEach(n=>a[n]=Math.round(e[n]*t[n]))):(t.fill(i,0,t.length),a.forEach((n,s)=>a[s]=Math.round(n*t[s]))),a},Ap=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Q("uniforms.scales","i",i)};
        var roi_low = ${Q("uniforms.roi","i",a)};
        var roi_hi = ${Q("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Q("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Q("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Op=(e,t,r,i,a,n,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Q("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Q("uniforms.roi","i",n)};
          var roi_hi = ${Q("uniforms.roi",`i + ${r.length}`,n)};
          var input_shape_i = ${Q("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Q("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,Rp=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Q("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,Ca=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Bp=(e,t,r,i,a)=>{let[n,s,u,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],d=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${d} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${Ca(e,l,n,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${d} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${d} = originalIndices[${s}];
      var col:${d} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${n}])`:"0"};
      var x11: ${d} = getInputValue(batch, channel, row1, col1);
      var x12: ${d} = getInputValue(batch, channel, row1, col2);
      var x21: ${d} = getInputValue(batch, channel, row2, col1);
      var x22: ${d} = getInputValue(batch, channel, row2, col2);
      var dx1: ${d} = abs(row - ${d}(row1));
      var dx2: ${d} = abs(${d}(row2) - row);
      var dy1: ${d} = abs(col - ${d}(col1));
      var dy2: ${d} = abs(${d}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},Mp=(e,t,r,i,a,n,s,u,l,d)=>{let h=r.length===2,[c,g]=h?[0,1]:[2,3],y=e.type.value,_=b=>{let S=b===c?"row":"col";return`
      fn ${S}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${y} {
        var output_index = ${t.indicesGet("output_indices",b)};
        var originalIdx: ${y} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[b]},
        ${i[b]}, ${r[b]}, ${n[b]}, ${n[b]} + ${r.length});
        var fractOriginalIdx: ${y} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[b]} - 1))) {
          return ${l};
        }
        var data: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${S}: ${y} = originalIdx + ${y}(i);
          if (${S} < 0 || ${S} >= ${r[b]}) {
            ${d?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${l};`:`${S} = max(0, min(${S}, ${r[b]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",b,`u32(${S})`)};
          data[i + 1] = ${b===c?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${_(c)};
    ${_(g)};
  fn getCubicInterpolationCoefs(s: ${y}) -> array<${y}, 4> {
    var absS = abs(s);
    var coeffs: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${y} = 1.0 - absS;
    var twoMinusAbsS: ${y} = 2.0 - absS;
    var onePlusAbsS: ${y} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${y}, 4>, coefs: array<${y}, 4>) -> ${y} {
    var coefsSum: ${y} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${y} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},Np=(e,t,r,i,a)=>{let[n,s,u,l,d]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],h=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${h} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${Ca(e,d,n,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${h} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${h} = originalIndices[${s}];
      var height:${h} = originalIndices[${u}];
      var width:${h} = originalIndices[${l}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${n}])`:"0"};

      var x111: ${h} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${h} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${h} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${h} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${h} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${h} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${h} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${h} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${h} = abs(depth - ${h}(depth1));
      var dx2: ${h} = abs(${h}(depth2) - depth);
      var dy1: ${h} = abs(height - ${h}(height1));
      var dy2: ${h} = abs(${h}(height2) - height);
      var dz1: ${h} = abs(width - ${h}(width1));
      var dz2: ${h} = abs(${h}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},Dp=(e,t,r,i,a,n)=>{let s=e.dims,u=Ep(n,t.axes,s.length),l=zp(s,i,a,t.axes),d=i.slice();i.length===0&&(d=s.map(($,I)=>$===0?1:l[I]/$),t.keepAspectRatioPolicy!=="stretch"&&(l=Cp(s,d,t)));let h=Y("output",e.dataType,l.length),c=M("input",e.dataType,s.length),g=O.size(l),y=s.length===l.length&&s.every(($,I)=>$===l[I]),_=t.coordinateTransformMode==="tf_crop_and_resize",b=t.extrapolationValue,S=c.type.value,x=$=>`
      ${y?"":`
      ${Tp(t.coordinateTransformMode,S)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${Rp(c,s)};
              ${Ip(t.nearestMode,r,S)};
              ${Op(c,h,s,l,d.length,u.length,_)};
              `;case"linear":return`
              ${Ap(h,s,l,d.length,u.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${Bp(c,h,s,_,b)}`;if(s.length===3||s.length===5)return`${Np(c,h,s,_,b)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${Mp(c,h,s,l,d,u,t.cubicCoeffA,_,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${$.registerUniform("output_size","u32").registerUniform("scales","f32",d.length).registerUniform("roi","f32",u.length).declareVariables(c,h)}
      ${$.mainStart()}
        ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${y?"output[global_idx] = input[global_idx];":`
        let output_indices = ${h.offsetToIndices("global_idx")};
        var input_indices: ${c.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${c.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${d.length>0?t.mode==="cubic"?d:d.length:""}|${a.length>0?a:""}|${u.length>0?u:""}|${y}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:x,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:d},{type:1,data:u},...J(s,l)]})}},Up=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},Pp=(e,t)=>{let r=[],i=[],a=[],n=Up(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");kp(e.inputs,t,n,r,i,a),e.compute(Dp(e.inputs[0],t,n,r,i,a),{inputs:[0]})},qp=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,n=e.excludeOutside!==0,s=e.extrapolationValue,u=e.keepAspectRatioPolicy,l=e.mode,d=e.nearestMode===""?"simple":e.nearestMode;return he({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:n,extrapolationValue:s,keepAspectRatioPolicy:u,mode:l,nearestMode:d})}}),Lp,Wp,Vp,Lm=U(()=>{te(),re(),ae(),Lp=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],n=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==n)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},Wp=(e,t,r,i)=>{let a=t.simplified,n=e[0].dims,s=O.size(n),u=n,l=s,d=n.slice(-1)[0],h=i?n.slice(0,-1).concat(1):[],c=!a&&e.length>3,g=e.length>4,y=i&&r>1,_=i&&r>2,b=r>3,S=64,x=ve(d),$=[{type:12,data:l},{type:12,data:x},{type:12,data:d},{type:1,data:t.epsilon}],I=E=>{let C=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],A=[M("x",e[0].dataType,e[0].dims,x),M("skip",e[1].dataType,e[1].dims,x),M("gamma",e[2].dataType,e[2].dims,x)];c&&A.push(M("beta",e[3].dataType,e[3].dims,x)),g&&A.push(M("bias",e[4].dataType,e[4].dims,x)),A.push(Y("output",e[0].dataType,u,x)),y&&A.push(Y("mean_output",1,h)),_&&A.push(Y("inv_std_output",1,h)),b&&A.push(Y("input_skip_bias_sum",e[0].dataType,u,x));let v=Te(e[0].dataType),N=Te(1,x);return`

      ${E.registerUniforms(C).declareVariables(...A)}
      var<workgroup> sum_shared : array<${N}, ${S}>;
      var<workgroup> sum_squared_shared : array<${N}, ${S}>;

      ${E.mainStart([S,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${S};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${S};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${S-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":v+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${b?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${jt(v,x,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${S};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${ht("sum",x)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${ht("square_sum",x)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${y?"mean_output[global_idx] = mean;":""}
        ${_?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${v}(mean)`}) *
            ${v}(inv_std_dev) * gamma[offset1d + i]
            ${c?"+ beta[offset1d + i]":""};
        }
      }`},k=[{dims:u,dataType:e[0].dataType}];return r>1&&k.push({dims:h,dataType:1}),r>2&&k.push({dims:h,dataType:1}),r>3&&k.push({dims:n,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${x};${y};${_};${b}`,inputDependencies:e.map((E,C)=>"type")},getShaderSource:I,getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(l/d)},programUniforms:$})}},Vp=(e,t)=>{Lp(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(Wp(e.inputs,t,e.outputCount,!1),{outputs:r})}}),Gp,dr,Hp,Aa,Fp,jp,Kp,Xp,Wm=U(()=>{te(),re(),xe(),ae(),Gp=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},dr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},Hp=(e,t)=>{if(e.length>1){let r=dr(e,1),i=dr(e,2),a=dr(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),he({starts:r,ends:i,axes:a})}else return t},Aa=(e,t,r,i,a)=>{let n=e;return e<0&&(n+=r[i[t]]),a[t]<0?Math.max(0,Math.min(n,r[i[t]]-1)):Math.max(0,Math.min(n,r[i[t]]))},Fp=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Q("uniforms.input_shape","i",r.length)};
            let steps_i = ${Q("uniforms.steps","i",r.length)};
            let signs_i = ${Q("uniforms.signs","i",r.length)};
            let starts_i = ${Q("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,jp=(e,t)=>{let r=e[0].dims,i=O.size(r),a=t.axes.length>0?O.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],n=dr(e,4);n.forEach(x=>x!==0||(()=>{throw new Error("step cannot be 0")})),n.length===0&&(n=Array(a.length).fill(1));let s=t.starts.map((x,$)=>Aa(x,$,r,a,n)),u=t.ends.map((x,$)=>Aa(x,$,r,a,n));if(a.length!==s.length||a.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let x=0;x<r.length;++x)a.includes(x)||(s.splice(x,0,0),u.splice(x,0,r[x]),n.splice(x,0,1));let l=n.map(x=>Math.sign(x));n.forEach((x,$,I)=>{if(x<0){let k=(u[$]-s[$])/x,E=s[$],C=E+k*n[$];s[$]=C,u[$]=E,I[$]=-x}});let d=r.slice(0);a.forEach((x,$)=>{d[x]=Math.ceil((u[x]-s[x])/n[x])});let h={dims:d,dataType:e[0].dataType},c=Y("output",e[0].dataType,d.length),g=M("input",e[0].dataType,e[0].dims.length),y=O.size(d),_=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:n.length}],b=[{type:12,data:y},{type:12,data:s},{type:6,data:l},{type:12,data:n},...J(e[0].dims,d)],S=x=>`
      ${x.registerUniforms(_).declareVariables(g,c)}
        ${Fp(g,c,r)}
        ${x.mainStart()}
          ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${c.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${c.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${s.length}_${n.length}`,inputDependencies:["rank"]},getShaderSource:S,getRunData:()=>({outputs:[h],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:b})}},Kp=(e,t)=>{Gp(e.inputs,t);let r=Hp(e.inputs,t);e.compute(jp(e.inputs,r),{inputs:[0]})},Xp=e=>{let t=e.starts,r=e.ends,i=e.axes;return he({starts:t,ends:r,axes:i})}}),Zp,Yp,Qp,Jp,Vm=U(()=>{te(),re(),xe(),ft(),ae(),Zp=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},Yp=(e,t)=>{let r=e.inputs[0],i=r.dims,a=O.size(i),n=i.length,s=O.normalizeAxis(t.axis,n),u=s<i.length-1,l,d=[];u?(d=Array.from({length:n},(A,v)=>v),d[s]=n-1,d[n-1]=s,l=e.compute(Ue(r,d),{inputs:[r],outputs:[-1]})[0]):l=r;let h=l.dims,c=h[n-1],g=a/c,y=ve(c),_=c/y,b=64;g===1&&(b=256);let S=(A,v)=>v===4?`max(max(${A}.x, ${A}.y), max(${A}.z, ${A}.w))`:v===2?`max(${A}.x, ${A}.y)`:v===3?`max(max(${A}.x, ${A}.y), ${A}.z)`:A,x=M("x",l.dataType,l.dims,y),$=Y("result",l.dataType,l.dims,y),I=x.type.value,k=Te(l.dataType)==="f32"?`var threadMax = ${I}(-3.4028234663852886e+38f);`:`var threadMax = ${I}(-65504.0h);`,E=A=>`
      var<workgroup> rowMaxShared : ${I};
      var<workgroup> rowSumShared : ${I};
      var<workgroup> threadShared : array<${I}, ${b}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${I} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${I}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${A.registerUniform("packedCols","i32").declareVariables(x,$)}
      ${A.mainStart(b)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${b};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${k}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${I}(${S("threadShared[0]",y)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${I}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${I}(${ht("threadShared[0]",y)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${I}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,C=e.compute({name:"Softmax",shaderCache:{hint:`${y};${b}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:h,dataType:l.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:_}]}),getShaderSource:E},{inputs:[l],outputs:[u?-1:0]})[0];u&&e.compute(Ue(C,d),{inputs:[C]})},Qp=(e,t)=>{Zp(e.inputs),Yp(e,t)},Jp=e=>he({axis:e.axis})}),Oa,ec,tc,rc,ic,Gm=U(()=>{te(),re(),ae(),Oa=e=>Array.from(e.getBigInt64Array(),Number),ec=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(Oa(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},tc=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},rc=(e,t)=>{let r=e[0].dims,i=t??Oa(e[1]),a=tc(r,i),n=O.size(a),s=e[0].dataType,u=M("input",s,r.length),l=Y("output",s,a.length),d=h=>`
      const inputShape = ${u.indices(...r)};
      ${h.registerUniform("output_size","u32").declareVariables(u,l)}
      ${h.mainStart()}
      ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},...J(e[0].dims,a)]}),getShaderSource:d}},ic=e=>{ec(e.inputs),e.compute(rc(e.inputs),{inputs:[0]})}}),ac,nc,sc,Hm=U(()=>{te(),re(),ae(),ac=(e,t,r,i,a)=>{let n=Y("output_data",a,r.length,4),s=M("a_data",t[1].dataType,t[1].dims.length,4),u=M("b_data",t[2].dataType,t[2].dims.length,4),l=M("c_data",t[0].dataType,t[0].dims.length,4),d,h=(c,g,y)=>`select(${g}, ${c}, ${y})`;if(!i)d=n.setByOffset("global_idx",h(s.getByOffset("global_idx"),u.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let c=(g,y,_="")=>{let b=`a_data[index_a${y}][component_a${y}]`,S=`b_data[index_b${y}][component_b${y}]`,x=`bool(c_data[index_c${y}] & (0xffu << (component_c${y} * 8)))`;return`
            let output_indices${y} = ${n.offsetToIndices(`global_idx * 4u + ${y}u`)};
            let offset_a${y} = ${s.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let offset_b${y} = ${u.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let offset_c${y} = ${l.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let index_a${y} = offset_a${y} / 4u;
            let index_b${y} = offset_b${y} / 4u;
            let index_c${y} = offset_c${y} / 4u;
            let component_a${y} = offset_a${y} % 4u;
            let component_b${y} = offset_b${y} % 4u;
            let component_c${y} = offset_c${y} % 4u;
            ${g}[${y}] = ${_}(${h(b,S,x)});
          `};a===9?d=`
            var data = vec4<u32>(0);
            ${c("data",0,"u32")}
            ${c("data",1,"u32")}
            ${c("data",2,"u32")}
            ${c("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:d=`
            ${c("output_data[global_idx]",0)}
            ${c("output_data[global_idx]",1)}
            ${c("output_data[global_idx]",2)}
            ${c("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,s,u,n)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${d}
      }`},nc=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,n=!(O.areEqual(t,r)&&O.areEqual(r,i)),s=t,u=O.size(t);if(n){let d=Ht.calcShape(Ht.calcShape(t,r,!1),i,!1);if(!d)throw new Error("Can't perform where op on the given tensors");s=d,u=O.size(s)}let l=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:d=>ac(d,e,s,n,a),getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:l},...J(i,t,r,s)]})}},sc=e=>{e.compute(nc(e.inputs))}}),oc,Fm=U(()=>{sm(),Ki(),om(),um(),lm(),dm(),pm(),gm(),_m(),bm(),$m(),wm(),vm(),xm(),Sm(),km(),Tm(),Im(),Em(),zm(),Cm(),Am(),Om(),Rm(),Bm(),bd(),Mm(),Nm(),Dm(),Um(),Pm(),Hi(),qm(),zd(),Lm(),Wm(),Vm(),Td(),Gm(),ft(),Qi(),Hm(),oc=new Map([["Abs",[Lo]],["Acos",[Wo]],["Acosh",[Vo]],["Add",[Cu]],["ArgMax",[To,ji]],["ArgMin",[ko,ji]],["Asin",[Go]],["Asinh",[Ho]],["Atan",[Fo]],["Atanh",[jo]],["Attention",[Oo]],["AveragePool",[np,ap]],["BatchNormalization",[No]],["BiasAdd",[Po]],["BiasSplitGelu",[Iu]],["Cast",[Xo,Ko]],["Ceil",[Qo]],["Clip",[Yo]],["Concat",[Gu,Hu]],["Conv",[pa,la]],["ConvTranspose",[_l,ml]],["Cos",[Jo]],["Cosh",[eu]],["CumSum",[$l,wl]],["DepthToSpace",[kl,Tl]],["DequantizeLinear",[fp,mp]],["Div",[Au]],["Einsum",[Ol,Rl]],["Elu",[tu,ar]],["Equal",[Ou]],["Erf",[ru]],["Exp",[iu]],["Expand",[Dl]],["FastGelu",[Pl]],["Floor",[au]],["FusedConv",[pa,la]],["Gather",[Vl,Wl]],["GatherElements",[ed,Jl]],["GatherBlockQuantized",[Xl,Zl]],["GatherND",[Hl,Fl]],["Gelu",[nu]],["Gemm",[ad,id]],["GlobalAveragePool",[op,sp]],["GlobalMaxPool",[pp,dp]],["Greater",[Nu]],["GreaterOrEqual",[Uu]],["GridSample",[hd,fd]],["GroupQueryAttention",[Rd]],["HardSigmoid",[hu,cu]],["InstanceNormalization",[Nd]],["LayerNormalization",[Pd]],["LeakyRelu",[su,ar]],["Less",[Du]],["LessOrEqual",[Pu]],["Log",[wu]],["MatMul",[Ld]],["MatMulNBits",[Hd,Fd]],["MaxPool",[up,lp]],["Mul",[Ru]],["MultiHeadAttention",[_d,gd]],["Neg",[uu]],["Not",[ou]],["Pad",[tp]],["Pow",[Bu]],["QuickGelu",[Su,ar]],["Range",[_p]],["Reciprocal",[lu]],["ReduceMin",[$o]],["ReduceMean",[mo]],["ReduceMax",[bo]],["ReduceSum",[vo]],["ReduceProd",[wo]],["ReduceL1",[go]],["ReduceL2",[yo]],["ReduceLogSum",[So]],["ReduceLogSumExp",[_o]],["ReduceSumSquare",[xo]],["Relu",[du]],["Resize",[Pp,qp]],["RotaryEmbedding",[Ed]],["ScatterND",[vp,wp]],["Sigmoid",[pu]],["Sin",[fu]],["Sinh",[mu]],["Slice",[Kp,Xp]],["SkipLayerNormalization",[Vp]],["Split",[Sd,kd]],["Sqrt",[gu]],["Softmax",[Qp,Jp]],["Sub",[Mu]],["Tan",[yu]],["Tanh",[_u]],["ThresholdedRelu",[$u,ar]],["Tile",[ic]],["Transpose",[Ms,Ns]],["Where",[sc]]])}),uc,jm=U(()=>{Le(),ut(),ae(),uc=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){Je(e.programInfo.name);let n=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let d of t)u.push({binding:u.length,resource:{buffer:d.buffer}});for(let d of r)u.push({binding:u.length,resource:{buffer:d.buffer}});a&&u.push({binding:u.length,resource:a});let l=n.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let d={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(d)}s.setPipeline(e.computePipeline),s.setBindGroup(0,l),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),He(e.programInfo.name)}dispose(){}build(e,t){Je(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(d=>{r.features.has(d.feature)&&i.push(`enable ${d.extension};`)});let a=zs(t,this.backend.device.limits),n=e.getShaderSource(a),s=`${i.join(`
`)}
${a.additionalImplementations}
${n}`,u=r.createShaderModule({code:s,label:e.name});de("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let l=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return He(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let n=t*r*i,s=Math.ceil(Math.sqrt(n));if(s>a){if(s=Math.ceil(Math.cbrt(n)),s>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),lc={};Vt(lc,{WebGpuBackend:()=>hc});var dc,pc,cc,hc,Km=U(()=>{Le(),te(),ut(),ms(),am(),Fm(),jm(),dc=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let n=e[i].dims.length;r.push(`${a};${n}`);break}case"dims":{let n=e[i].dims.join(",");r.push(`${a};${n}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},pc=(e,t,r)=>{var a,n;let i=e.name;return(a=e.shaderCache)!=null&&a.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${dc(t,((n=e.shaderCache)==null?void 0:n.inputDependencies)??new Array(t.length).fill("dims"))}`,i},cc=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},hc=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=n=>t.features.has(n)&&r.push(n)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i),this.adapterInfo=new cc(t.info||await t.requestAdapterInfo()),this.gpuDataManager=ks(this),this.programManager=new uc(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Ei(e.logLevel,!!e.debug),this.device.onuncapturederror=n=>{n.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${n.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){var e;typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&((e=this.env)!=null&&e.webgpu)&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Je(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{var i;let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let a=0;a<t.length/2;a++){let n=r[a],s=n.kernelId,u=this.kernels.get(s),l=u.kernelType,d=u.kernelName,h=n.programName,c=n.inputTensorViews,g=n.outputTensorViews,y=t[a*2],_=t[a*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=y);let b=Number(y-this.queryTimeBase),S=Number(_-this.queryTimeBase);if(!Number.isSafeInteger(b)||!Number.isSafeInteger(S))throw new RangeError("incorrect timestamp range");if((i=this.env.webgpu.profiling)!=null&&i.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:c.map(x=>({dims:x.dims,dataType:ot(x.dataType)})),outputsMetadata:g.map(x=>({dims:x.dims,dataType:ot(x.dataType)})),kernelId:s,kernelType:l,kernelName:d,programName:h,startTime:b,endTime:S});else{let x="";c.forEach((I,k)=>{x+=`input[${k}]: [${I.dims}] | ${ot(I.dataType)}, `});let $="";g.forEach((I,k)=>{$+=`output[${k}]: [${I.dims}] | ${ot(I.dataType)}, `}),console.log(`[profiling] kernel "${s}|${l}|${d}|${h}" ${x}${$}start time: ${b} ns, execution time: ${S-b} ns`)}$r("GPU",`${h}::${y}::${_}`)}e.unmap(),this.pendingQueries.delete(e)}),He()}run(e,t,r,i,a,n){Je(e.name);let s=[];for(let $=0;$<t.length;++$){let I=t[$].data;if(I===0)continue;let k=this.gpuDataManager.get(I);if(!k)throw new Error(`no GPU data for input: ${I}`);s.push(k)}let{outputs:u,dispatchGroup:l,programUniforms:d}=e.getRunData(t),h=r.length===0?u.map(($,I)=>I):r;if(h.length!==u.length)throw new Error(`Output size ${h.length} must be equal to ${u.length}.`);let c=[],g=[];for(let $=0;$<u.length;++$){if(!Number.isInteger(h[$])||h[$]<-3||h[$]>=n)throw new Error(`Invalid output index: ${h[$]}`);if(h[$]===-3)continue;let I=h[$]===-1,k=h[$]===-2,E=I||k?a(u[$].dataType,u[$].dims):i(h[$],u[$].dataType,u[$].dims);if(c.push(E),E.data===0)continue;let C=this.gpuDataManager.get(E.data);if(!C)throw new Error(`no GPU data for output: ${E.data}`);if(I&&this.temporaryData.push(C),k){let A=this.kernelPersistentData.get(this.currentKernelId);A||(A=[],this.kernelPersistentData.set(this.currentKernelId,A)),A.push(C)}g.push(C)}if(s.length!==t.length||g.length!==c.length){if(g.length===0)return He(e.name),c;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let y;if(d){let $=0,I=[];d.forEach(A=>{let v=typeof A.data=="number"?[A.data]:A.data;if(v.length===0)return;let N=A.type===10?2:4,D,H;A.type===10?(H=v.length>4?16:v.length>2?8:v.length*N,D=v.length>4?16:N*v.length):(H=v.length<=2?v.length*N:16,D=16),$=Math.ceil($/H)*H,I.push($);let F=A.type===10?8:4;$+=v.length>4?Math.ceil(v.length/F)*D:v.length*N});let k=16;$=Math.ceil($/k)*k;let E=new ArrayBuffer($);d.forEach((A,v)=>{let N=I[v],D=typeof A.data=="number"?[A.data]:A.data;if(A.type===6)new Int32Array(E,N,D.length).set(D);else if(A.type===12)new Uint32Array(E,N,D.length).set(D);else if(A.type===10)new Uint16Array(E,N,D.length).set(D);else if(A.type===1)new Float32Array(E,N,D.length).set(D);else throw new Error(`Unsupported uniform type: ${ot(A.type)}`)});let C=this.gpuDataManager.create($,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(C.buffer,0,E,0,$),this.gpuDataManager.release(C.id),y={offset:0,size:$,buffer:C.buffer}}let _=this.programManager.normalizeDispatchGroupSize(l),b=_[1]===1&&_[2]===1,S=pc(e,t,b),x=this.programManager.getArtifact(S);if(x||(x=this.programManager.build(e,_),this.programManager.setArtifact(S,x),de("info",()=>`[artifact] key: ${S}, programName: ${e.name}`)),d&&x.uniformVariablesInfo){if(d.length!==x.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${x.uniformVariablesInfo.length}, got ${d.length} in program "${x.programInfo.name}".`);for(let $=0;$<d.length;$++){let I=d[$],k=I.type,E=typeof I.data=="number"?1:I.data.length,[C,A]=x.uniformVariablesInfo[$];if(k!==C||E!==A)throw new Error(`Uniform variable ${$} mismatch: expect type ${C} with size ${A}, got type ${k} with size ${E} in program "${x.programInfo.name}".`)}}if(de("info",()=>`[ProgramManager] run "${e.name}" (key=${S}) with ${_[0]}x${_[1]}x${_[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let $={kernelId:this.currentKernelId,programName:x.programInfo.name,inputTensorViews:t,outputTensorViews:c};this.pendingKernels.push($),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push($)}return this.programManager.run(x,s,g,_,y),He(e.name),c}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=oc.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let n={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,n)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,n=i.kernelName,s=i.kernelEntry,u=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${n}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),de("info",()=>`[WebGPU] Start to run kernel "[${a}] ${n}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),s(t,u[1]),0}catch(d){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${n}" failed. ${d}`)),1}finally{l&&r.push(this.device.popErrorScope().then(d=>d?`GPU validation error for kernel "[${a}] ${n}": ${d.message}`:null));for(let d of this.temporaryData)this.gpuDataManager.release(d.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let n=a.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,n);return a.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await qi(this,e,t);return zi(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){var e;this.queryType="none",(((e=this.env.webgpu.profiling)==null?void 0:e.mode)==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){de("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){de("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){de("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),n=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(n.computePipeline),a.setBindGroup(0,n.bindGroup),a.dispatchWorkgroups(...n.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),fc={};Vt(fc,{init:()=>gc});var Ur,mc,gc,Xm=U(()=>{te(),ut(),re(),im(),Ur=class Bf{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(O.size(t)!==O.size(this.dims))throw new Error("Invalid new shape");return new Bf(this.module,this.dataType,this.data,t)}},mc=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,n=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,n));let s=Number(e.getValue(i*a++,n));this.outputCount=Number(e.getValue(i*a++,n)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,n));let u=[];for(let l=0;l<s;l++){let d=Number(e.getValue(i*a++,n)),h=Number(e.getValue(i*a++,"*")),c=Number(e.getValue(i*a++,n)),g=[];for(let y=0;y<c;y++)g.push(Number(e.getValue(i*a++,n)));u.push(new Ur(e,d,h,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){var s;let r=((s=t==null?void 0:t.inputs)==null?void 0:s.map(u=>typeof u=="number"?this.inputs[u]:u))??this.inputs,i=(t==null?void 0:t.outputs)??[],a=(u,l,d)=>new Ur(this.module,l,this.output(u,d),d),n=(u,l)=>{let d=Ct(u,l);if(!d)throw new Error(`Unsupported data type: ${u}`);let h=d>0?this.backend.gpuDataManager.create(d).id:0;return new Ur(this.module,u,h,l)};return this.backend.run(e,r,i,a,n,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",n=this.module.stackAlloc((1+t.length)*i);this.module.setValue(n,t.length,a);for(let s=0;s<t.length;s++)this.module.setValue(n+i*(s+1),t[s],a);return this.module._JsepOutput(this.opKernelContext,e,n)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},gc=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let n=(Km(),Yt(lc)).WebGpuBackend,s=new n;await s.initialize(r,i),a("webgpu",[s,u=>s.alloc(Number(u)),u=>s.free(u),(u,l,d,h=!1)=>{if(h)de("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(l)}, size=${Number(d)}`),s.memcpy(Number(u),Number(l));else{de("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(l)}, size=${Number(d)}`);let c=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(d));s.upload(Number(l),c)}},async(u,l,d)=>{de("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${l}, size=${d}`),await s.download(Number(u),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+d)>>>0))},(u,l,d)=>s.createKernel(u,Number(l),d,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),u=>s.releaseKernel(u),(u,l,d,h)=>{de("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${d}, kernel=${u}, contextDataOffset=${l}`);let c=new mc(t,s,Number(l));return s.computeKernel(Number(u),c,h)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let n=new ws(r);a("webnn",[n,()=>n.reserveTensorId(),s=>n.releaseTensorId(s),async(s,u,l,d,h)=>n.ensureTensor(s,u,l,d,h),(s,u)=>{n.uploadTensor(s,u)},async(s,u)=>n.downloadTensor(s,u),(s,u)=>n.registerMLContext(s,u),!!r.trace])}}}),yc,Ra,Ba,mt,_c,Ma,Pr,Na,Da,Ua,Pa,qa,La,bc=U(()=>{Le(),em(),tm(),te(),It(),xi(),ns(),yc=(e,t)=>{be()._OrtInit(e,t)!==0&&me("Can't initialize onnxruntime.")},Ra=async e=>{yc(e.wasm.numThreads,kr(e.logLevel))},Ba=async(e,t)=>{var i,a;(a=(i=be()).asyncInit)==null||a.call(i);let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let n=e.webgpu.powerPreference;if(n!==void 0&&n!=="low-power"&&n!=="high-performance")throw new Error(`Invalid powerPreference setting: "${n}"`);let s=e.webgpu.forceFallbackAdapter;if(s!==void 0&&typeof s!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:n,forceFallbackAdapter:s}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let n=(Xm(),Yt(fc)).init;t==="webgpu"&&await n("webgpu",be(),e,r),t==="webnn"&&await n("webnn",be(),e)}},mt=new Map,_c=e=>{let t=be(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&me("Can't get session input/output count.");let n=i===4?"i32":"i64";return[Number(t.getValue(a,n)),Number(t.getValue(a+i,n))]}finally{t.stackRestore(r)}},Ma=(e,t)=>{let r=be(),i=r.stackSave(),a=0;try{let n=r.PTR_SIZE,s=r.stackAlloc(2*n);r._OrtGetInputOutputMetadata(e,t,s,s+n)!==0&&me("Can't get session input/output metadata.");let u=Number(r.getValue(s,"*"));a=Number(r.getValue(s+n,"*"));let l=r.HEAP32[a/4];if(l===0)return[u,0];let d=r.HEAPU32[a/4+1],h=[];for(let c=0;c<d;c++){let g=Number(r.getValue(a+8+c*n,"*"));h.push(g!==0?r.UTF8ToString(g):Number(r.getValue(a+8+(c+d)*n,"*")))}return[u,l,h]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},Pr=e=>{let t=be(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},Na=async(e,t)=>{var c,g,y,_;let r,i,a=be();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Pr(e);let n=0,s=0,u=0,l=[],d=[],h=[];try{if([s,l]=await as(t),(t==null?void 0:t.externalData)&&a.mountExternalData){let v=[];for(let N of t.externalData){let D=typeof N=="string"?N:N.path;v.push(Ii(typeof N=="string"?N:N.data).then(H=>{a.mountExternalData(D,H)}))}await Promise.all(v)}for(let v of(t==null?void 0:t.executionProviders)??[])if((typeof v=="string"?v:v.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof v!="string"){let N=v,D=N==null?void 0:N.context,H=N==null?void 0:N.gpuDevice,F=N==null?void 0:N.deviceType,j=N==null?void 0:N.powerPreference;D?a.currentContext=D:H?a.currentContext=await a.webnnCreateMLContext(H):a.currentContext=await a.webnnCreateMLContext({deviceType:F,powerPreference:j})}else a.currentContext=await a.webnnCreateMLContext();break}n=await a._OrtCreateSession(r,i,s),(c=a.webgpuOnCreateSession)==null||c.call(a,n),n===0&&me("Can't create a session."),(g=a.jsepOnCreateSession)==null||g.call(a),a.currentContext&&(a.webnnRegisterMLContext(n,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[b,S]=_c(n),x=!!(t!=null&&t.enableGraphCapture),$=[],I=[],k=[],E=[],C=[];for(let v=0;v<b;v++){let[N,D,H]=Ma(n,v);N===0&&me("Can't get an input name."),d.push(N);let F=a.UTF8ToString(N);$.push(F),k.push(D===0?{name:F,isTensor:!1}:{name:F,isTensor:!0,type:ot(D),shape:H})}for(let v=0;v<S;v++){let[N,D,H]=Ma(n,v+b);N===0&&me("Can't get an output name."),h.push(N);let F=a.UTF8ToString(N);I.push(F),E.push(D===0?{name:F,isTensor:!1}:{name:F,isTensor:!0,type:ot(D),shape:H});{if(x&&(t==null?void 0:t.preferredOutputLocation)===void 0){C.push("gpu-buffer");continue}let j=typeof(t==null?void 0:t.preferredOutputLocation)=="string"?t.preferredOutputLocation:((y=t==null?void 0:t.preferredOutputLocation)==null?void 0:y[F])??"cpu",R=a.webnnIsGraphOutput;if(j==="cpu"&&R&&R(n,F)){C.push("ml-tensor-cpu-output");continue}if(j!=="cpu"&&j!=="cpu-pinned"&&j!=="gpu-buffer"&&j!=="ml-tensor")throw new Error(`Not supported preferred output location: ${j}.`);if(x&&j!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${j}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);C.push(j)}}let A=null;return C.some(v=>v==="gpu-buffer"||v==="ml-tensor"||v==="ml-tensor-cpu-output")&&(u=a._OrtCreateBinding(n),u===0&&me("Can't create IO binding."),A={handle:u,outputPreferredLocations:C,outputPreferredLocationsEncoded:C.map(v=>v==="ml-tensor-cpu-output"?"ml-tensor":v).map(v=>Ti(v))}),mt.set(n,[n,d,h,A,x,!1]),[n,$,I,k,E]}catch(b){throw d.forEach(S=>a._OrtFree(S)),h.forEach(S=>a._OrtFree(S)),u!==0&&a._OrtReleaseBinding(u)!==0&&me("Can't release IO binding."),n!==0&&a._OrtReleaseSession(n)!==0&&me("Can't release session."),b}finally{a._free(r),s!==0&&a._OrtReleaseSessionOptions(s)!==0&&me("Can't release session options."),l.forEach(b=>a._free(b)),(_=a.unmountExternalData)==null||_.call(a)}},Da=e=>{var l,d,h;let t=be(),r=mt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,n,s,u]=r;s&&(u&&t._OrtClearBoundOutputs(s.handle)!==0&&me("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&me("Can't release IO binding.")),(l=t.jsepOnReleaseSession)==null||l.call(t,e),(d=t.webnnOnReleaseSession)==null||d.call(t,e),(h=t.webgpuOnReleaseSession)==null||h.call(t,e),a.forEach(c=>t._OrtFree(c)),n.forEach(c=>t._OrtFree(c)),t._OrtReleaseSession(i)!==0&&me("Can't release session."),mt.delete(e)},Ua=async(e,t,r,i,a,n,s=!1)=>{if(!e){t.push(0);return}let u=be(),l=u.PTR_SIZE,d=e[0],h=e[1],c=e[3],g=c,y,_;if(d==="string"&&(c==="gpu-buffer"||c==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&c!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${n} when enableGraphCapture is true.`);if(c==="gpu-buffer"){let x=e[2].gpuBuffer;_=Ct(zt(d),h);{let $=u.jsepRegisterBuffer;if(!$)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');y=$(i,n,x,_)}}else if(c==="ml-tensor"){let x=e[2].mlTensor;_=Ct(zt(d),h);let $=u.webnnRegisterMLTensor;if(!$)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');y=$(i,x,zt(d),h)}else{let x=e[2];if(Array.isArray(x)){_=l*x.length,y=u._malloc(_),r.push(y);for(let $=0;$<x.length;$++){if(typeof x[$]!="string")throw new TypeError(`tensor data at index ${$} is not a string`);u.setValue(y+$*l,Fe(x[$],r),"*")}}else{let $=u.webnnIsGraphInput,I=u.webnnIsGraphOutput;if(d!=="string"&&$&&I){let k=u.UTF8ToString(a);if($(i,k)||I(i,k)){let E=zt(d);_=Ct(E,h),g="ml-tensor";let C=u.webnnCreateTemporaryTensor,A=u.webnnUploadTensor;if(!C||!A)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let v=await C(i,E,h);A(v,new Uint8Array(x.buffer,x.byteOffset,x.byteLength)),y=v}else _=x.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(x.buffer,x.byteOffset,_),y)}else _=x.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(x.buffer,x.byteOffset,_),y)}}let b=u.stackSave(),S=u.stackAlloc(4*h.length);try{h.forEach(($,I)=>u.setValue(S+I*l,$,l===4?"i32":"i64"));let x=u._OrtCreateTensor(zt(d),y,_,S,h.length,Ti(g));x===0&&me(`Can't create tensor for input/output. session=${i}, index=${n}.`),t.push(x)}finally{u.stackRestore(b)}},Pa=async(e,t,r,i,a,n)=>{var F,j,R,K;let s=be(),u=s.PTR_SIZE,l=mt.get(e);if(!l)throw new Error(`cannot run inference. invalid session id: ${e}`);let d=l[0],h=l[1],c=l[2],g=l[3],y=l[4],_=l[5],b=t.length,S=i.length,x=0,$=[],I=[],k=[],E=[],C=[],A=s.stackSave(),v=s.stackAlloc(b*u),N=s.stackAlloc(b*u),D=s.stackAlloc(S*u),H=s.stackAlloc(S*u);try{[x,$]=Jn(n),kt("wasm prepareInputOutputTensor");for(let W=0;W<b;W++)await Ua(r[W],I,E,e,h[t[W]],t[W],y);for(let W=0;W<S;W++)await Ua(a[W],k,E,e,c[i[W]],b+i[W],y);Tt("wasm prepareInputOutputTensor");for(let W=0;W<b;W++)s.setValue(v+W*u,I[W],"*"),s.setValue(N+W*u,h[t[W]],"*");for(let W=0;W<S;W++)s.setValue(D+W*u,k[W],"*"),s.setValue(H+W*u,c[i[W]],"*");if(g&&!_){let{handle:W,outputPreferredLocations:ue,outputPreferredLocationsEncoded:P}=g;if(h.length!==b)throw new Error(`input count from feeds (${b}) is expected to be always equal to model's input count (${h.length}).`);kt("wasm bindInputsOutputs");for(let V=0;V<b;V++){let Z=t[V];await s._OrtBindInput(W,h[Z],I[V])!==0&&me(`Can't bind input[${V}] for session=${e}.`)}for(let V=0;V<S;V++){let Z=i[V];(F=a[V])!=null&&F[3]?(C.push(k[V]),s._OrtBindOutput(W,c[Z],k[V],0)!==0&&me(`Can't bind pre-allocated output[${V}] for session=${e}.`)):s._OrtBindOutput(W,c[Z],0,P[Z])!==0&&me(`Can't bind output[${V}] to ${ue[V]} for session=${e}.`)}Tt("wasm bindInputsOutputs"),mt.set(e,[d,h,c,g,y,!0])}(j=s.jsepOnRunStart)==null||j.call(s,d),(R=s.webnnOnRunStart)==null||R.call(s,d);let X;g?X=await s._OrtRunWithBinding(d,g.handle,S,D,x):X=await s._OrtRun(d,N,v,b,H,S,D,x),X!==0&&me("failed to call OrtRun().");let ee=[],fe=[];kt("wasm ProcessOutputTensor");for(let W=0;W<S;W++){let ue=Number(s.getValue(D+W*u,"*"));if(ue===k[W]||C.includes(k[W])){ee.push(a[W]),ue!==k[W]&&s._OrtReleaseTensor(ue)!==0&&me("Can't release tensor.");continue}let P=s.stackSave(),V=s.stackAlloc(4*u),Z=!1,q,ge=0;try{s._OrtGetTensorData(ue,V,V+u,V+2*u,V+3*u)!==0&&me(`Can't access output tensor data on index ${W}.`);let We=u===4?"i32":"i64",Se=Number(s.getValue(V,We));ge=s.getValue(V+u,"*");let Re=s.getValue(V+u*2,"*"),Be=Number(s.getValue(V+u*3,We)),Pe=[];for(let $e=0;$e<Be;$e++)Pe.push(Number(s.getValue(Re+$e*u,We)));s._OrtFree(Re)!==0&&me("Can't free memory for tensor dims.");let Me=Pe.reduce(($e,ie)=>$e*ie,1);q=ot(Se);let _t=g==null?void 0:g.outputPreferredLocations[i[W]];if(q==="string"){if(_t==="gpu-buffer"||_t==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let $e=[];for(let ie=0;ie<Me;ie++){let qe=s.getValue(ge+ie*u,"*"),Fr=s.getValue(ge+(ie+1)*u,"*"),hr=ie===Me-1?void 0:Fr-qe;$e.push(s.UTF8ToString(qe,hr))}ee.push([q,Pe,$e,"cpu"])}else if(_t==="gpu-buffer"&&Me>0){let $e=s.jsepGetBuffer;if(!$e)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let ie=$e(ge),qe=Ct(Se,Me);if(qe===void 0||!Si(q))throw new Error(`Unsupported data type: ${q}`);Z=!0,ee.push([q,Pe,{gpuBuffer:ie,download:s.jsepCreateDownloader(ie,qe,q),dispose:()=>{s._OrtReleaseTensor(ue)!==0&&me("Can't release tensor.")}},"gpu-buffer"])}else if(_t==="ml-tensor"&&Me>0){let $e=s.webnnEnsureTensor,ie=s.webnnIsGraphInputOutputTypeSupported;if(!$e||!ie)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(Ct(Se,Me)===void 0||!ki(q))throw new Error(`Unsupported data type: ${q}`);if(!ie(e,q,!1))throw new Error(`preferredLocation "ml-tensor" for ${q} output is not supported by current WebNN Context.`);let qe=await $e(e,ge,Se,Pe,!1);Z=!0,ee.push([q,Pe,{mlTensor:qe,download:s.webnnCreateMLTensorDownloader(ge,q),dispose:()=>{s.webnnReleaseTensorId(ge),s._OrtReleaseTensor(ue)}},"ml-tensor"])}else if(_t==="ml-tensor-cpu-output"&&Me>0){let $e=s.webnnCreateMLTensorDownloader(ge,q)(),ie=ee.length;Z=!0,fe.push((async()=>{let qe=[ie,await $e];return s.webnnReleaseTensorId(ge),s._OrtReleaseTensor(ue),qe})()),ee.push([q,Pe,[],"cpu"])}else{let $e=Sr(q),ie=new $e(Me);new Uint8Array(ie.buffer,ie.byteOffset,ie.byteLength).set(s.HEAPU8.subarray(ge,ge+ie.byteLength)),ee.push([q,Pe,ie,"cpu"])}}finally{s.stackRestore(P),q==="string"&&ge&&s._free(ge),Z||s._OrtReleaseTensor(ue)}}g&&!y&&(s._OrtClearBoundOutputs(g.handle)!==0&&me("Can't clear bound outputs."),mt.set(e,[d,h,c,g,y,!1]));for(let[W,ue]of await Promise.all(fe))ee[W][2]=ue;return Tt("wasm ProcessOutputTensor"),ee}finally{(K=s.webnnOnRunEnd)==null||K.call(s,d),s.stackRestore(A),I.forEach(X=>s._OrtReleaseTensor(X)),k.forEach(X=>s._OrtReleaseTensor(X)),E.forEach(X=>s._free(X)),x!==0&&s._OrtReleaseRunOptions(x),$.forEach(X=>s._free(X))}},qa=e=>{let t=be(),r=mt.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&me("Can't get an profile file name."),t._OrtFree(a)},La=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),gt,Oe,Kt,pr,cr,qr,Wa,Lr,Dt,Ut,$c,wc,vc,xc,Sc,kc,Tc,Ic,Ec=U(()=>{Le(),bc(),It(),bi(),gt=()=>!!_e.wasm.proxy&&typeof document<"u",Kt=!1,pr=!1,cr=!1,Lr=new Map,Dt=(e,t)=>{let r=Lr.get(e);r?r.push(t):Lr.set(e,[t])},Ut=()=>{if(Kt||!pr||cr||!Oe)throw new Error("worker not ready")},$c=e=>{switch(e.data.type){case"init-wasm":Kt=!1,e.data.err?(cr=!0,Wa[1](e.data.err)):(pr=!0,Wa[0]()),qr&&(URL.revokeObjectURL(qr),qr=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Lr.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}}},wc=async()=>{if(!pr){if(Kt)throw new Error("multiple calls to 'initWasm()' detected.");if(cr)throw new Error("previous call to 'initWasm()' failed.");if(Kt=!0,gt())return new Promise((e,t)=>{Oe==null||Oe.terminate(),Kn().then(([r,i])=>{try{Oe=i,Oe.onerror=n=>t(n),Oe.onmessage=$c,Wa=[e,t];let a={type:"init-wasm",in:_e};!a.in.wasm.wasmPaths&&(r||mi)&&(a.in.wasm.wasmPaths={wasm:new URL("/assets/ort-wasm-simd-threaded.jsep-CyqnNavA.wasm",self.location.href).href}),Oe.postMessage(a),qr=r}catch(a){t(a)}},t)});try{await vi(_e.wasm),await Ra(_e),pr=!0}catch(e){throw cr=!0,e}finally{Kt=!1}}},vc=async e=>{if(gt())return Ut(),new Promise((t,r)=>{Dt("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:_e}};Oe.postMessage(i)});await Ba(_e,e)},xc=async e=>gt()?(Ut(),new Promise((t,r)=>{Dt("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};Oe.postMessage(i,[e.buffer])})):Pr(e),Sc=async(e,t)=>{if(gt()){if(t!=null&&t.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Ut(),new Promise((r,i)=>{Dt("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},n=[];e instanceof Uint8Array&&n.push(e.buffer),Oe.postMessage(a,n)})}else return Na(e,t)},kc=async e=>{if(gt())return Ut(),new Promise((t,r)=>{Dt("release",[t,r]);let i={type:"release",in:e};Oe.postMessage(i)});Da(e)},Tc=async(e,t,r,i,a,n)=>{if(gt()){if(r.some(s=>s[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(s=>s))throw new Error("pre-allocated output tensor is not supported for proxy.");return Ut(),new Promise((s,u)=>{Dt("run",[s,u]);let l=r,d={type:"run",in:{sessionId:e,inputIndices:t,inputs:l,outputIndices:i,options:n}};Oe.postMessage(d,La(l))})}else return Pa(e,t,r,i,a,n)},Ic=async e=>{if(gt())return Ut(),new Promise((t,r)=>{Dt("end-profiling",[t,r]);let i={type:"end-profiling",in:e};Oe.postMessage(i)});qa(e)}}),Va,zc,Cc,Zm=U(()=>{Le(),Ec(),te(),pi(),ns(),Va=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},zc=e=>{switch(e[3]){case"cpu":return new Ge(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Si(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Ge.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!ki(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Ge.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},Cc=class{async fetchModelAndCopyToWasmMemory(e){return xc(await Ii(e))}async loadModel(e,t){Je();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Sc(r,t),He()}async dispose(){return kc(this.sessionId)}async run(e,t,r){Je();let i=[],a=[];Object.entries(e).forEach(c=>{let g=c[0],y=c[1],_=this.inputNames.indexOf(g);if(_===-1)throw new Error(`invalid input '${g}'`);i.push(y),a.push(_)});let n=[],s=[];Object.entries(t).forEach(c=>{let g=c[0],y=c[1],_=this.outputNames.indexOf(g);if(_===-1)throw new Error(`invalid output '${g}'`);n.push(y),s.push(_)});let u=i.map((c,g)=>Va(c,()=>`input "${this.inputNames[a[g]]}"`)),l=n.map((c,g)=>c?Va(c,()=>`output "${this.outputNames[s[g]]}"`):null),d=await Tc(this.sessionId,a,u,s,l,r),h={};for(let c=0;c<d.length;c++)h[this.outputNames[s[c]]]=n[c]??zc(d[c]);return He(),h}startProfiling(){}endProfiling(){Ic(this.sessionId)}}}),Ac={};Vt(Ac,{OnnxruntimeWebAssemblyBackend:()=>Ha,initializeFlags:()=>Ga,wasmBackend:()=>Oc});var Ga,Ha,Oc,Ym=U(()=>{Le(),Ec(),Zm(),Ga=()=>{(typeof _e.wasm.initTimeout!="number"||_e.wasm.initTimeout<0)&&(_e.wasm.initTimeout=0);let e=_e.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),_e.wasm.simd=!1),typeof _e.wasm.proxy!="boolean"&&(_e.wasm.proxy=!1),typeof _e.wasm.trace!="boolean"&&(_e.wasm.trace=!1),typeof _e.wasm.numThreads!="number"||!Number.isInteger(_e.wasm.numThreads)||_e.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)_e.wasm.numThreads=1;else{let t=typeof navigator>"u"?Nf("node:os").cpus().length:navigator.hardwareConcurrency;_e.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},Ha=class{async init(e){Ga(),await wc(),await vc(e)}async createInferenceSessionHandler(e,t){let r=new Cc;return await r.loadModel(e,t),r}},Oc=new Ha});Le(),Le(),Le();var Qm="1.26.0";{let e=(Ym(),Yt(Ac)).wasmBackend;Gt("webgpu",e,5),Gt("webnn",e,5),Gt("cpu",e,10),Gt("wasm",e,10)}Object.defineProperty(_e.versions,"web",{value:Qm,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */var Jm="/assets/ort-wasm-simd-threaded.jsep-CyqnNavA.wasm";_e.wasm.wasmPaths={wasm:Jm},_e.wasm.numThreads=1;const Rc=60;let yt=null,Bc=null,Wr=null;async function eg(e){const t=await e.arrayBuffer(),r=await di.create(t,{executionProviders:["wasm"],graphOptimizationLevel:"all"}),i=r.inputNames[0];if(!i)throw new Error("The model does not expose an input tensor.");const n=r.inputMetadata[i],s=(n==null?void 0:n.dimensions)??[],u=Dc(s[2],640),l=Dc(s[3],640);return{session:r,modelInfo:{inputName:i,inputWidth:l,inputHeight:u}}}async function tg({session:e,modelInfo:t,source:r,labels:i=[],confidenceThreshold:a,iouThreshold:n}){const{tensor:s,letterbox:u}=rg(r,t.inputWidth,t.inputHeight),l={[t.inputName]:s},d=await e.run(l),h=e.outputNames[0];if(!h||!d[h])throw new Error("The model did not return an output tensor.");const c=d[h],g=ag(c,i,a),y=ig(c,i,u,a),_=ug(y,n);return{detections:_,stats:{...g,detectionCount:_.length}}}function rg(e,t,r){const i=cg(e);if(!i.width||!i.height)throw new Error("The selected media is not ready yet.");const a=Math.min(t/i.width,r/i.height),n=Math.round(i.width*a),s=Math.round(i.height*a),u=Math.floor((t-n)/2),l=Math.floor((r-s)/2);dg(t,r);const d=Bc;if(!d)throw new Error("Could not prepare the image for inference.");d.fillStyle="rgb(114, 114, 114)",d.fillRect(0,0,t,r),d.drawImage(e,u,l,n,s);const h=d.getImageData(0,0,t,r).data,c=pg(t,r),g=t*r;for(let y=0;y<t*r;y+=1){const _=y*4;c[y]=h[_]/255,c[g+y]=h[_+1]/255,c[g*2+y]=h[_+2]/255}return{tensor:new Ge("float32",c,[1,3,r,t]),letterbox:{scale:a,padX:u,padY:l,sourceWidth:i.width,sourceHeight:i.height}}}function ig(e,t,r,i){const a=e.dims,n=e.data;if(a.length!==3)throw new Error(`Unsupported YOLO output rank ${a.length}. Expected a 3D output tensor.`);const s=a[1],u=a[2];if(u>=6&&s>u&&Gr(n,s,u))return sg(n,s,u,t,r,i);if(s>=6&&u>s&&Gr(n,u,s,!0))return og(n,s,u,t,r,i);if(u>=5&&s>u)return Mc(n,s,u,t,r,i);if(s>=5&&u>s)return ng(n,s,u,t,r,i);const l=Math.max(5,t.length+5);return Mc(n,Math.floor(n.length/l),l,t,r,i)}function ag(e,t,r){const i=e.dims,a=e.data,n={outputShape:[...i],confidenceThreshold:r,candidateCount:0,aboveThresholdCount:0,topScore:0,topClassId:-1,topLabel:"No candidate",detectionCount:0};if(i.length!==3)return n;const s=i[1],u=i[2],l=c=>{c.classId<0||(n.candidateCount+=1,c.score>=r&&(n.aboveThresholdCount+=1),c.score>n.topScore&&(n.topScore=c.score,n.topClassId=c.classId,n.topLabel=t[c.classId]??`Class ${c.classId}`))};if(u>=6&&s>u&&Gr(a,s,u)){for(let c=0;c<s;c+=1){const g=c*u;l({classId:Math.max(0,Math.round(a[g+5]??0)),score:tt(a[g+4])})}return n}if(s>=6&&u>s&&Gr(a,u,s,!0)){for(let c=0;c<u;c+=1)l({classId:Math.max(0,Math.round(a[u*5+c]??0)),score:tt(a[u*4+c])});return n}if(u>=5&&s>u){for(let c=0;c<s;c+=1)l(Fa(a,c*u,u,t.length));return n}if(s>=5&&u>s){for(let c=0;c<u;c+=1)l(Nc(a,c,u,s,t.length));return n}const d=Math.max(5,t.length+5),h=Math.floor(a.length/d);for(let c=0;c<h;c+=1)l(Fa(a,c*d,d,t.length));return n}function Mc(e,t,r,i,a,n){const s=[];for(let u=0;u<t;u+=1){const l=u*r,d=Fa(e,l,r,i.length);if(d.classId<0||d.score<n)continue;const h=e[l],c=e[l+1],g=e[l+2],y=e[l+3],_=(h-g/2-a.padX)/a.scale,b=(c-y/2-a.padY)/a.scale,S=g/a.scale,x=y/a.scale;s.push({classId:d.classId,label:i[d.classId]??`Class ${d.classId}`,score:d.score,box:{x:Ce(_,0,a.sourceWidth),y:Ce(b,0,a.sourceHeight),width:Ce(S,0,a.sourceWidth),height:Ce(x,0,a.sourceHeight)}})}return Vr(s)}function ng(e,t,r,i,a,n){const s=[];for(let u=0;u<r;u+=1){const l=Nc(e,u,r,t,i.length);if(l.classId<0||l.score<n)continue;const d=e[u],h=e[r+u],c=e[r*2+u],g=e[r*3+u],y=(d-c/2-a.padX)/a.scale,_=(h-g/2-a.padY)/a.scale,b=c/a.scale,S=g/a.scale;s.push({classId:l.classId,label:i[l.classId]??`Class ${l.classId}`,score:l.score,box:{x:Ce(y,0,a.sourceWidth),y:Ce(_,0,a.sourceHeight),width:Ce(b,0,a.sourceWidth),height:Ce(S,0,a.sourceHeight)}})}return Vr(s)}function sg(e,t,r,i,a,n){const s=[];for(let u=0;u<t;u+=1){const l=u*r,d=tt(e[l+4]),h=Math.max(0,Math.round(e[l+5]??0));if(d<n)continue;const c=(e[l]-a.padX)/a.scale,g=(e[l+1]-a.padY)/a.scale,y=(e[l+2]-a.padX)/a.scale,_=(e[l+3]-a.padY)/a.scale;s.push({classId:h,label:i[h]??`Class ${h}`,score:d,box:{x:Ce(Math.min(c,y),0,a.sourceWidth),y:Ce(Math.min(g,_),0,a.sourceHeight),width:Ce(Math.abs(y-c),0,a.sourceWidth),height:Ce(Math.abs(_-g),0,a.sourceHeight)}})}return Vr(s)}function og(e,t,r,i,a,n){const s=[];for(let u=0;u<r;u+=1){const l=tt(e[r*4+u]),d=Math.max(0,Math.round(e[r*5+u]??0));if(l<n)continue;const h=(e[u]-a.padX)/a.scale,c=(e[r+u]-a.padY)/a.scale,g=(e[r*2+u]-a.padX)/a.scale,y=(e[r*3+u]-a.padY)/a.scale;s.push({classId:d,label:i[d]??`Class ${d}`,score:l,box:{x:Ce(Math.min(h,g),0,a.sourceWidth),y:Ce(Math.min(c,y),0,a.sourceHeight),width:Ce(Math.abs(g-h),0,a.sourceWidth),height:Ce(Math.abs(y-c),0,a.sourceHeight)}})}return Vr(s)}function Fa(e,t,r,i){if(i>0){const u=r>=i+5,l=u?tt(e[t+4]):1,d=t+(u?5:4),h=ja(e,d,i);return{classId:h.classId,score:l*h.score}}const a=ja(e,t+4,r-4),n=ja(e,t+5,r-5),s=tt(e[t+4])*n.score;return n.classId>=0&&s>a.score?{classId:n.classId,score:s}:a}function Nc(e,t,r,i,a){if(a>0){const l=i>=a+5,d=l?tt(e[r*4+t]):1,c=Ka(e,t,r,l?5:4,a);return{classId:c.classId,score:d*c.score}}const n=Ka(e,t,r,4,i-4),s=Ka(e,t,r,5,i-5),u=tt(e[r*4+t])*s.score;return s.classId>=0&&u>n.score?{classId:s.classId,score:u}:n}function ug(e,t){const r=[...e].sort((a,n)=>n.score-a.score),i=[];for(;r.length>0;){const a=r.shift();i.push(a);for(let n=r.length-1;n>=0;n-=1)a.classId===r[n].classId&&lg(a.box,r[n].box)>t&&r.splice(n,1)}return i}function lg(e,t){const r=Math.max(e.x,t.x),i=Math.max(e.y,t.y),a=Math.min(e.x+e.width,t.x+t.width),n=Math.min(e.y+e.height,t.y+t.height),s=Math.max(0,a-r)*Math.max(0,n-i),u=e.width*e.height+t.width*t.height-s;return u<=0?0:s/u}function ja(e,t,r){let i=-1,a=0;for(let n=0;n<r;n+=1){const s=tt(e[t+n]);s>a&&(i=n,a=s)}return{classId:i,score:a}}function Ka(e,t,r,i,a){let n=-1,s=0;for(let u=0;u<a;u+=1){const l=tt(e[r*(i+u)+t]);l>s&&(n=u,s=l)}return{classId:n,score:s}}function Vr(e){return e.length<=Rc?e:e.sort((t,r)=>r.score-t.score).slice(0,Rc)}function Gr(e,t,r,i=!1){if(r<6||r>7)return!1;const a=Math.min(t,24);let n=0,s=0;for(let u=0;u<a;u+=1){const l=i?e[u]:e[u*r],d=i?e[t+u]:e[u*r+1],h=i?e[t*2+u]:e[u*r+2],c=i?e[t*3+u]:e[u*r+3],g=i?e[t*5+u]:e[u*r+5];Number.isFinite(g)&&Math.abs(g-Math.round(g))<.001&&g>=0&&(n+=1),Number.isFinite(l)&&Number.isFinite(d)&&Number.isFinite(h)&&Number.isFinite(c)&&h>l&&c>d&&(s+=1)}return n>=Math.ceil(a*.75)&&s>=Math.ceil(a*.6)}function tt(e){return Number.isFinite(e)?e>=0&&e<=1?e:e<=-20?0:e>=20?1:1/(1+Math.exp(-e)):0}function dg(e,t){return yt||(yt=typeof document>"u"?new OffscreenCanvas(e,t):document.createElement("canvas"),Bc=yt.getContext("2d",{willReadFrequently:!0})),(yt.width!==e||yt.height!==t)&&(yt.width=e,yt.height=t),yt}function pg(e,t){const r=3*e*t;return(!Wr||Wr.length!==r)&&(Wr=new Float32Array(r)),Wr}function cg(e){return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?{width:e.videoWidth,height:e.videoHeight}:typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement?{width:e.naturalWidth,height:e.naturalHeight}:typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas?{width:e.width,height:e.height}:e instanceof ImageBitmap?{width:e.width,height:e.height}:{width:0,height:0}}function Dc(e,t){return typeof e=="number"&&Number.isFinite(e)&&e>0?e:t}function Ce(e,t,r){return Math.min(Math.max(e,t),r)}let Hr=null;const hg=["pothole","crack"];self.onmessage=async e=>{const t=e.data;try{if(t.type==="load-model"){const i=await eg(t.modelFile);Hr={session:i.session,info:i.modelInfo},Xa({type:"model-ready",modelInfo:i.modelInfo});return}if(!Hr)throw new Error("Load a model before detection.");const r=await fg(t.frameUrl);try{const i=await tg({session:Hr.session,modelInfo:Hr.info,source:r,labels:hg,confidenceThreshold:t.confidenceThreshold,iouThreshold:t.iouThreshold});Xa({type:"detections",requestId:t.requestId,detections:i.detections,stats:i.stats})}finally{r.close()}}catch(r){Xa({type:"error",message:r instanceof Error?r.message:"An unexpected worker error occurred."})}};async function fg(e){const r=await(await fetch(e)).blob();return createImageBitmap(r)}function Xa(e){self.postMessage(e)}})();
