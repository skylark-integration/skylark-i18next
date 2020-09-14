define(function () {
    'use strict';
    function get() {
        return {
            debug: false,
            initImmediate: true,
            ns: ['translation'],
            defaultNS: ['translation'],
            fallbackLng: ['dev'],
            fallbackNS: false,
            whitelist: false,
            nonExplicitWhitelist: false,
            supportedLngs: false,
            nonExplicitSupportedLngs: false,
            load: 'all',
            preload: false,
            simplifyPluralSuffix: true,
            keySeparator: '.',
            nsSeparator: ':',
            pluralSeparator: '_',
            contextSeparator: '_',
            partialBundledLanguages: false,
            saveMissing: false,
            updateMissing: false,
            saveMissingTo: 'fallback',
            saveMissingPlurals: true,
            missingKeyHandler: false,
            missingInterpolationHandler: false,
            postProcess: false,
            postProcessPassResolved: false,
            returnNull: true,
            returnEmptyString: true,
            returnObjects: false,
            joinArrays: false,
            returnedObjectHandler: false,
            parseMissingKeyHandler: false,
            appendNamespaceToMissingKey: false,
            appendNamespaceToCIMode: false,
            overloadTranslationOptionHandler: function handle(args) {
                var ret = {};
                if (typeof args[1] === 'object')
                    ret = args[1];
                if (typeof args[1] === 'string')
                    ret.defaultValue = args[1];
                if (typeof args[2] === 'string')
                    ret.tDescription = args[2];
                if (typeof args[2] === 'object' || typeof args[3] === 'object') {
                    var options = args[3] || args[2];
                    Object.keys(options).forEach(function (key) {
                        ret[key] = options[key];
                    });
                }
                return ret;
            },
            interpolation: {
                escapeValue: true,
                format: (value, format, lng, options) => value,
                prefix: '{{',
                suffix: '}}',
                formatSeparator: ',',
                unescapePrefix: '-',
                nestingPrefix: '$t(',
                nestingSuffix: ')',
                nestingOptionsSeparator: ',',
                maxReplaces: 1000,
                skipOnVariables: false
            }
        };
    }
    
    function transformOptions(options) {
        if (typeof options.ns === 'string')
            options.ns = [options.ns];
        if (typeof options.fallbackLng === 'string')
            options.fallbackLng = [options.fallbackLng];
        if (typeof options.fallbackNS === 'string')
            options.fallbackNS = [options.fallbackNS];
        if (options.whitelist) {
            if (options.whitelist && options.whitelist.indexOf('cimode') < 0) {
                options.whitelist = options.whitelist.concat(['cimode']);
            }
            options.supportedLngs = options.whitelist;
        }
        if (options.nonExplicitWhitelist) {
            options.nonExplicitSupportedLngs = options.nonExplicitWhitelist;
        }
        if (options.supportedLngs && options.supportedLngs.indexOf('cimode') < 0) {
            options.supportedLngs = options.supportedLngs.concat(['cimode']);
        }
        return options;
    }

    return {
        get: get,
        transformOptions: transformOptions
    };
});