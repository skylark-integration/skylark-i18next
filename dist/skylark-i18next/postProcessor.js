/**
 * skylark-i18next - A version of i18next.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-i18next/
 * @license MIT
 */
define(function(){"use strict";return{processors:{},addPostProcessor(module){this.processors[module.name]=module},handle(s,r,o,e,c){return s.forEach(s=>{this.processors[s]&&(r=this.processors[s].process(r,o,e,c))}),r}}});
//# sourceMappingURL=sourcemaps/postProcessor.js.map
