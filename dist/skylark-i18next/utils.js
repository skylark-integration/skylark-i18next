/**
 * skylark-i18next - A version of i18next.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-i18next/
 * @license MIT
 */
define(function(){"use strict";function n(n,t,e){function o(n){return n&&n.indexOf("###")>-1?n.replace(/###/g,"."):n}function r(){return!n||"string"==typeof n}const i="string"!=typeof t?[].concat(t):t.split(".");for(;i.length>1;){if(r())return{};const t=o(i.shift());!n[t]&&e&&(n[t]=new e),n=n[t]}return r()?{}:{obj:n,k:o(i.shift())}}function t(t,e){const{obj:o,k:r}=n(t,e);if(o)return o[r]}var e={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return{defer:function(){let n,t;const e=new Promise((e,o)=>{n=e,t=o});return e.resolve=n,e.reject=t,e},makeString:function(n){return null==n?"":""+n},copy:function(n,t,e){n.forEach(n=>{t[n]&&(e[n]=t[n])})},setPath:function(t,e,o){const{obj:r,k:i}=n(t,e,Object);r[i]=o},pushPath:function(t,e,o,r){const{obj:i,k:c}=n(t,e,Object);i[c]=i[c]||[],r&&(i[c]=i[c].concat(o)),r||i[c].push(o)},getPath:t,getPathWithDefaults:function(n,e,o){const r=t(n,o);return void 0!==r?r:t(e,o)},deepExtend:function n(t,e,o){for(const r in e)"__proto__"!==r&&(r in t?"string"==typeof t[r]||t[r]instanceof String||"string"==typeof e[r]||e[r]instanceof String?o&&(t[r]=e[r]):n(t[r],e[r],o):t[r]=e[r]);return t},regexEscape:function(n){return n.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")},escape:function(n){return"string"==typeof n?n.replace(/[&<>"'\/]/g,n=>e[n]):n},isIE10:"undefined"!=typeof window&&window.navigator&&window.navigator.userAgent&&window.navigator.userAgent.indexOf("MSIE")>-1}});
//# sourceMappingURL=sourcemaps/utils.js.map
