/**
 * skylark-i18next - A version of i18next.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-i18next/
 * @license MIT
 */
define(function(){"use strict";const r={type:"logger",log(r){this.output("log",r)},warn(r){this.output("warn",r)},error(r){this.output("error",r)},output(r,t){console&&console[r]&&console[r].apply(console,t)}};class t{constructor(r,t={}){this.init(r,t)}init(t,e={}){this.prefix=e.prefix||"i18next:",this.logger=t||r,this.options=e,this.debug=e.debug}setDebug(r){this.debug=r}log(...r){return this.forward(r,"log","",!0)}warn(...r){return this.forward(r,"warn","",!0)}error(...r){return this.forward(r,"error","")}deprecate(...r){return this.forward(r,"warn","WARNING DEPRECATED: ",!0)}forward(r,t,e,o){return o&&!this.debug?null:("string"==typeof r[0]&&(r[0]=`${e}${this.prefix} ${r[0]}`),this.logger[t](r))}create(r){return new t(this.logger,{...{prefix:`${this.prefix}:${r}:`},...this.options})}}return new t});
//# sourceMappingURL=sourcemaps/logger.js.map
