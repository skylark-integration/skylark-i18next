/**
 * skylark-i18next - A version of i18next.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-i18next/
 * @license MIT
 */
define(["./utils","./logger","./EventEmitter"],function(e,t,s){"use strict";return class extends s{constructor(a,i,n,o={}){super(),e.isIE10&&s.call(this),this.backend=a,this.store=i,this.services=n,this.languageUtils=n.languageUtils,this.options=o,this.logger=t.create("backendConnector"),this.state={},this.queue=[],this.backend&&this.backend.init&&this.backend.init(n,o.backend,o)}queueLoad(e,t,s,a){const i=[],n=[],o=[],d=[];return e.forEach(e=>{let a=!0;t.forEach(t=>{const o=`${e}|${t}`;!s.reload&&this.store.hasResourceBundle(e,t)?this.state[o]=2:this.state[o]<0||(1===this.state[o]?n.indexOf(o)<0&&n.push(o):(this.state[o]=1,a=!1,n.indexOf(o)<0&&n.push(o),i.indexOf(o)<0&&i.push(o),d.indexOf(t)<0&&d.push(t)))}),a||o.push(e)}),(i.length||n.length)&&this.queue.push({pending:n,loaded:{},errors:[],callback:a}),{toLoad:i,pending:n,toLoadLanguages:o,toLoadNamespaces:d}}loaded(t,s,a){const i=t.split("|"),n=i[0],o=i[1];s&&this.emit("failedLoading",n,o,s),a&&this.store.addResourceBundle(n,o,a),this.state[t]=s?-1:2;const d={};this.queue.forEach(a=>{e.pushPath(a.loaded,[n],o),function(e,t){let s=e.indexOf(t);for(;-1!==s;)e.splice(s,1),s=e.indexOf(t)}(a.pending,t),s&&a.errors.push(s),0!==a.pending.length||a.done||(Object.keys(a.loaded).forEach(e=>{d[e]||(d[e]=[]),a.loaded[e].length&&a.loaded[e].forEach(t=>{d[e].indexOf(t)<0&&d[e].push(t)})}),a.done=!0,a.errors.length?a.callback(a.errors):a.callback())}),this.emit("loaded",d),this.queue=this.queue.filter(e=>!e.done)}read(e,t,s,a=0,i=350,n){return e.length?this.backend[s](e,t,(o,d)=>{o&&d&&a<5?setTimeout(()=>{this.read.call(this,e,t,s,a+1,2*i,n)},i):n(o,d)}):n(null,{})}prepareLoading(e,t,s={},a){if(!this.backend)return this.logger.warn("No backend was added via i18next.use. Will not load resources."),a&&a();"string"==typeof e&&(e=this.languageUtils.toResolveHierarchy(e)),"string"==typeof t&&(t=[t]);const i=this.queueLoad(e,t,s,a);if(!i.toLoad.length)return i.pending.length||a(),null;i.toLoad.forEach(e=>{this.loadOne(e)})}load(e,t,s){this.prepareLoading(e,t,{},s)}reload(e,t,s){this.prepareLoading(e,t,{reload:!0},s)}loadOne(e,t=""){const s=e.split("|"),a=s[0],i=s[1];this.read(a,i,"read",void 0,void 0,(s,n)=>{s&&this.logger.warn(`${t}loading namespace ${i} for language ${a} failed`,s),!s&&n&&this.logger.log(`${t}loaded namespace ${i} for language ${a}`,n),this.loaded(e,s,n)})}saveMissing(e,t,s,a,i,n={}){this.services.utils&&this.services.utils.hasLoadedNamespace&&!this.services.utils.hasLoadedNamespace(t)?this.logger.warn(`did not save key "${s}" as the namespace "${t}" was not yet loaded`,"This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!"):void 0!==s&&null!==s&&""!==s&&(this.backend&&this.backend.create&&this.backend.create(e,t,s,a,null,{...n,isUpdate:i}),e&&e[0]&&this.store.addResource(e[0],t,s,a))}}});
//# sourceMappingURL=sourcemaps/BackendConnector.js.map