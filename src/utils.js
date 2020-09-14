define(function () {
    'use strict';
    function defer() {
        let res;
        let rej;
        const promise = new Promise((resolve, reject) => {
            res = resolve;
            rej = reject;
        });
        promise.resolve = res;
        promise.reject = rej;
        return promise;
    }
    function makeString(object) {
        if (object == null)
            return '';
        return '' + object;
    }
    function copy(a, s, t) {
        a.forEach(m => {
            if (s[m])
                t[m] = s[m];
        });
    }
    function getLastOfPath(object, path, Empty) {
        function cleanKey(key) {
            return key && key.indexOf('###') > -1 ? key.replace(/###/g, '.') : key;
        }
        function canNotTraverseDeeper() {
            return !object || typeof object === 'string';
        }
        const stack = typeof path !== 'string' ? [].concat(path) : path.split('.');
        while (stack.length > 1) {
            if (canNotTraverseDeeper())
                return {};
            const key = cleanKey(stack.shift());
            if (!object[key] && Empty)
                object[key] = new Empty();
            object = object[key];
        }
        if (canNotTraverseDeeper())
            return {};
        return {
            obj: object,
            k: cleanKey(stack.shift())
        };
    }
    function setPath(object, path, newValue) {
        const {obj, k} = getLastOfPath(object, path, Object);
        obj[k] = newValue;
    }
    function pushPath(object, path, newValue, concat) {
        const {obj, k} = getLastOfPath(object, path, Object);
        obj[k] = obj[k] || [];
        if (concat)
            obj[k] = obj[k].concat(newValue);
        if (!concat)
            obj[k].push(newValue);
    }
    function getPath(object, path) {
        const {obj, k} = getLastOfPath(object, path);
        if (!obj)
            return undefined;
        return obj[k];
    }
    function getPathWithDefaults(data, defaultData, key) {
        const value = getPath(data, key);
        if (value !== undefined) {
            return value;
        }
        return getPath(defaultData, key);
    }
    function deepExtend(target, source, overwrite) {
        for (const prop in source) {
            if (prop !== '__proto__') {
                if (prop in target) {
                    if (typeof target[prop] === 'string' || target[prop] instanceof String || typeof source[prop] === 'string' || source[prop] instanceof String) {
                        if (overwrite)
                            target[prop] = source[prop];
                    } else {
                        deepExtend(target[prop], source[prop], overwrite);
                    }
                } else {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }
    function regexEscape(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
    var _entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    function escape(data) {
        if (typeof data === 'string') {
            return data.replace(/[&<>"'\/]/g, s => _entityMap[s]);
        }
        return data;
    }
    const isIE10 = typeof window !== 'undefined' && window.navigator && window.navigator.userAgent && window.navigator.userAgent.indexOf('MSIE') > -1;
    return {
        defer: defer,
        makeString: makeString,
        copy: copy,
        setPath: setPath,
        pushPath: pushPath,
        getPath: getPath,
        getPathWithDefaults: getPathWithDefaults,
        deepExtend: deepExtend,
        regexEscape: regexEscape,
        escape: escape,
        isIE10: isIE10
    };
});