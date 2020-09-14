define([
    './utils',
    './logger',
    './EventEmitter'
], function (utils, baseLogger, EventEmitter) {
    'use strict';
    function remove(arr, what) {
        let found = arr.indexOf(what);
        while (found !== -1) {
            arr.splice(found, 1);
            found = arr.indexOf(what);
        }
    }
    class Connector extends EventEmitter {
        constructor(backend, store, services, options = {}) {
            super();
            if (utils.isIE10) {
                EventEmitter.call(this);
            }
            this.backend = backend;
            this.store = store;
            this.services = services;
            this.languageUtils = services.languageUtils;
            this.options = options;
            this.logger = baseLogger.create('backendConnector');
            this.state = {};
            this.queue = [];
            if (this.backend && this.backend.init) {
                this.backend.init(services, options.backend, options);
            }
        }
        queueLoad(languages, namespaces, options, callback) {
            const toLoad = [];
            const pending = [];
            const toLoadLanguages = [];
            const toLoadNamespaces = [];
            languages.forEach(lng => {
                let hasAllNamespaces = true;
                namespaces.forEach(ns => {
                    const name = `${ lng }|${ ns }`;
                    if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
                        this.state[name] = 2;
                    } else if (this.state[name] < 0) {
                    } else if (this.state[name] === 1) {
                        if (pending.indexOf(name) < 0)
                            pending.push(name);
                    } else {
                        this.state[name] = 1;
                        hasAllNamespaces = false;
                        if (pending.indexOf(name) < 0)
                            pending.push(name);
                        if (toLoad.indexOf(name) < 0)
                            toLoad.push(name);
                        if (toLoadNamespaces.indexOf(ns) < 0)
                            toLoadNamespaces.push(ns);
                    }
                });
                if (!hasAllNamespaces)
                    toLoadLanguages.push(lng);
            });
            if (toLoad.length || pending.length) {
                this.queue.push({
                    pending,
                    loaded: {},
                    errors: [],
                    callback
                });
            }
            return {
                toLoad,
                pending,
                toLoadLanguages,
                toLoadNamespaces
            };
        }
        loaded(name, err, data) {
            const s = name.split('|');
            const lng = s[0];
            const ns = s[1];
            if (err)
                this.emit('failedLoading', lng, ns, err);
            if (data) {
                this.store.addResourceBundle(lng, ns, data);
            }
            this.state[name] = err ? -1 : 2;
            const loaded = {};
            this.queue.forEach(q => {
                utils.pushPath(q.loaded, [lng], ns);
                remove(q.pending, name);
                if (err)
                    q.errors.push(err);
                if (q.pending.length === 0 && !q.done) {
                    Object.keys(q.loaded).forEach(l => {
                        if (!loaded[l])
                            loaded[l] = [];
                        if (q.loaded[l].length) {
                            q.loaded[l].forEach(ns => {
                                if (loaded[l].indexOf(ns) < 0)
                                    loaded[l].push(ns);
                            });
                        }
                    });
                    q.done = true;
                    if (q.errors.length) {
                        q.callback(q.errors);
                    } else {
                        q.callback();
                    }
                }
            });
            this.emit('loaded', loaded);
            this.queue = this.queue.filter(q => !q.done);
        }
        read(lng, ns, fcName, tried = 0, wait = 350, callback) {
            if (!lng.length)
                return callback(null, {});
            return this.backend[fcName](lng, ns, (err, data) => {
                if (err && data && tried < 5) {
                    setTimeout(() => {
                        this.read.call(this, lng, ns, fcName, tried + 1, wait * 2, callback);
                    }, wait);
                    return;
                }
                callback(err, data);
            });
        }
        prepareLoading(languages, namespaces, options = {}, callback) {
            if (!this.backend) {
                this.logger.warn('No backend was added via i18next.use. Will not load resources.');
                return callback && callback();
            }
            if (typeof languages === 'string')
                languages = this.languageUtils.toResolveHierarchy(languages);
            if (typeof namespaces === 'string')
                namespaces = [namespaces];
            const toLoad = this.queueLoad(languages, namespaces, options, callback);
            if (!toLoad.toLoad.length) {
                if (!toLoad.pending.length)
                    callback();
                return null;
            }
            toLoad.toLoad.forEach(name => {
                this.loadOne(name);
            });
        }
        load(languages, namespaces, callback) {
            this.prepareLoading(languages, namespaces, {}, callback);
        }
        reload(languages, namespaces, callback) {
            this.prepareLoading(languages, namespaces, { reload: true }, callback);
        }
        loadOne(name, prefix = '') {
            const s = name.split('|');
            const lng = s[0];
            const ns = s[1];
            this.read(lng, ns, 'read', undefined, undefined, (err, data) => {
                if (err)
                    this.logger.warn(`${ prefix }loading namespace ${ ns } for language ${ lng } failed`, err);
                if (!err && data)
                    this.logger.log(`${ prefix }loaded namespace ${ ns } for language ${ lng }`, data);
                this.loaded(name, err, data);
            });
        }
        saveMissing(languages, namespace, key, fallbackValue, isUpdate, options = {}) {
            if (this.services.utils && this.services.utils.hasLoadedNamespace && !this.services.utils.hasLoadedNamespace(namespace)) {
                this.logger.warn(`did not save key "${ key }" as the namespace "${ namespace }" was not yet loaded`, 'This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!');
                return;
            }
            if (key === undefined || key === null || key === '')
                return;
            if (this.backend && this.backend.create) {
                this.backend.create(languages, namespace, key, fallbackValue, null, {
                    ...options,
                    isUpdate
                });
            }
            if (!languages || !languages[0])
                return;
            this.store.addResource(languages[0], namespace, key, fallbackValue);
        }
    }
    return Connector;
});