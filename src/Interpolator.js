define([
    './utils',
    './logger'
], function (utils, baseLogger) {
    'use strict';
    class Interpolator {
        constructor(options = {}) {
            this.logger = baseLogger.create('interpolator');
            this.options = options;
            this.format = options.interpolation && options.interpolation.format || (value => value);
            this.init(options);
        }
        init(options = {}) {
            if (!options.interpolation)
                options.interpolation = { escapeValue: true };
            const iOpts = options.interpolation;
            this.escape = iOpts.escape !== undefined ? iOpts.escape : utils.escape;
            this.escapeValue = iOpts.escapeValue !== undefined ? iOpts.escapeValue : true;
            this.useRawValueToEscape = iOpts.useRawValueToEscape !== undefined ? iOpts.useRawValueToEscape : false;
            this.prefix = iOpts.prefix ? utils.regexEscape(iOpts.prefix) : iOpts.prefixEscaped || '{{';
            this.suffix = iOpts.suffix ? utils.regexEscape(iOpts.suffix) : iOpts.suffixEscaped || '}}';
            this.formatSeparator = iOpts.formatSeparator ? iOpts.formatSeparator : iOpts.formatSeparator || ',';
            this.unescapePrefix = iOpts.unescapeSuffix ? '' : iOpts.unescapePrefix || '-';
            this.unescapeSuffix = this.unescapePrefix ? '' : iOpts.unescapeSuffix || '';
            this.nestingPrefix = iOpts.nestingPrefix ? utils.regexEscape(iOpts.nestingPrefix) : iOpts.nestingPrefixEscaped || utils.regexEscape('$t(');
            this.nestingSuffix = iOpts.nestingSuffix ? utils.regexEscape(iOpts.nestingSuffix) : iOpts.nestingSuffixEscaped || utils.regexEscape(')');
            this.nestingOptionsSeparator = iOpts.nestingOptionsSeparator ? iOpts.nestingOptionsSeparator : iOpts.nestingOptionsSeparator || ',';
            this.maxReplaces = iOpts.maxReplaces ? iOpts.maxReplaces : 1000;
            this.alwaysFormat = iOpts.alwaysFormat !== undefined ? iOpts.alwaysFormat : false;
            this.resetRegExp();
        }
        reset() {
            if (this.options)
                this.init(this.options);
        }
        resetRegExp() {
            const regexpStr = `${ this.prefix }(.+?)${ this.suffix }`;
            this.regexp = new RegExp(regexpStr, 'g');
            const regexpUnescapeStr = `${ this.prefix }${ this.unescapePrefix }(.+?)${ this.unescapeSuffix }${ this.suffix }`;
            this.regexpUnescape = new RegExp(regexpUnescapeStr, 'g');
            const nestingRegexpStr = `${ this.nestingPrefix }(.+?)${ this.nestingSuffix }`;
            this.nestingRegexp = new RegExp(nestingRegexpStr, 'g');
        }
        interpolate(str, data, lng, options) {
            let match;
            let value;
            let replaces;
            const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};
            function regexSafe(val) {
                return val.replace(/\$/g, '$$$$');
            }
            const handleFormat = key => {
                if (key.indexOf(this.formatSeparator) < 0) {
                    const path = utils.getPathWithDefaults(data, defaultData, key);
                    return this.alwaysFormat ? this.format(path, undefined, lng) : path;
                }
                const p = key.split(this.formatSeparator);
                const k = p.shift().trim();
                const f = p.join(this.formatSeparator).trim();
                return this.format(utils.getPathWithDefaults(data, defaultData, k), f, lng, options);
            };
            this.resetRegExp();
            const missingInterpolationHandler = options && options.missingInterpolationHandler || this.options.missingInterpolationHandler;
            const skipOnVariables = options && options.interpolation && options.interpolation.skipOnVariables || this.options.interpolation.skipOnVariables;
            const todos = [
                {
                    regex: this.regexpUnescape,
                    safeValue: val => regexSafe(val)
                },
                {
                    regex: this.regexp,
                    safeValue: val => this.escapeValue ? regexSafe(this.escape(val)) : regexSafe(val)
                }
            ];
            todos.forEach(todo => {
                replaces = 0;
                while (match = todo.regex.exec(str)) {
                    value = handleFormat(match[1].trim());
                    if (value === undefined) {
                        if (typeof missingInterpolationHandler === 'function') {
                            const temp = missingInterpolationHandler(str, match, options);
                            value = typeof temp === 'string' ? temp : '';
                        } else if (skipOnVariables) {
                            value = match[0];
                            continue;
                        } else {
                            this.logger.warn(`missed to pass in variable ${ match[1] } for interpolating ${ str }`);
                            value = '';
                        }
                    } else if (typeof value !== 'string' && !this.useRawValueToEscape) {
                        value = utils.makeString(value);
                    }
                    str = str.replace(match[0], todo.safeValue(value));
                    todo.regex.lastIndex = 0;
                    replaces++;
                    if (replaces >= this.maxReplaces) {
                        break;
                    }
                }
            });
            return str;
        }
        nest(str, fc, options = {}) {
            let match;
            let value;
            let clonedOptions = { ...options };
            clonedOptions.applyPostProcessor = false;
            delete clonedOptions.defaultValue;
            function handleHasOptions(key, inheritedOptions) {
                const sep = this.nestingOptionsSeparator;
                if (key.indexOf(sep) < 0)
                    return key;
                const c = key.split(new RegExp(`${ sep }[ ]*{`));
                let optionsString = `{${ c[1] }`;
                key = c[0];
                optionsString = this.interpolate(optionsString, clonedOptions);
                optionsString = optionsString.replace(/'/g, '"');
                try {
                    clonedOptions = JSON.parse(optionsString);
                    if (inheritedOptions)
                        clonedOptions = {
                            ...inheritedOptions,
                            ...clonedOptions
                        };
                } catch (e) {
                    this.logger.warn(`failed parsing options string in nesting for key ${ key }`, e);
                    return `${ key }${ sep }${ optionsString }`;
                }
                delete clonedOptions.defaultValue;
                return key;
            }
            while (match = this.nestingRegexp.exec(str)) {
                let formatters = [];
                let doReduce = false;
                if (match[0].includes(this.formatSeparator) && !/{.*}/.test(match[1])) {
                    const r = match[1].split(this.formatSeparator).map(elem => elem.trim());
                    match[1] = r.shift();
                    formatters = r;
                    doReduce = true;
                }
                value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
                if (value && match[0] === str && typeof value !== 'string')
                    return value;
                if (typeof value !== 'string')
                    value = utils.makeString(value);
                if (!value) {
                    this.logger.warn(`missed to resolve ${ match[1] } for nesting ${ str }`);
                    value = '';
                }
                if (doReduce) {
                    value = formatters.reduce((v, f) => this.format(v, f, options.lng, options), value.trim());
                }
                str = str.replace(match[0], value);
                this.regexp.lastIndex = 0;
            }
            return str;
        }
    }
    return Interpolator;
});