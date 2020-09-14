/**
 * skylark-i18next - A version of i18next.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-i18next/
 * @license MIT
 */
define(function(){"use strict";return class{constructor(){this.observers={}}on(s,r){return s.split(" ").forEach(s=>{this.observers[s]=this.observers[s]||[],this.observers[s].push(r)}),this}off(s,r){this.observers[s]&&(r?this.observers[s]=this.observers[s].filter(s=>s!==r):delete this.observers[s])}emit(s,...r){this.observers[s]&&[].concat(this.observers[s]).forEach(s=>{s(...r)}),this.observers["*"]&&[].concat(this.observers["*"]).forEach(e=>{e.apply(e,[s,...r])})}}});
//# sourceMappingURL=sourcemaps/EventEmitter.js.map
