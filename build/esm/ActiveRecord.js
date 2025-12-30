"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utility_js_1 = require("./Utility.js");
const Builder_js_1 = require("./Http/Builder.js");
const Core_js_1 = require("./Core.js");
const Request_js_1 = require("./Http/Request.js");
const createFormData = () => {
    if (typeof window !== 'undefined' && window.FormData) {
        return new window.FormData();
    }
    else {
        const FormData = require('form-data');
        return new FormData();
    }
};
class ActiveRecord extends Core_js_1.default {
    constructor(options = {}) {
        super(options);
        this.baseUrl = '/v1';
        this.cacheable = true;
        this.cid = '';
        this.dataKey = 'data';
        this.endpoint = '';
        this.hasFetched = false;
        this.hasLoaded = false;
        this.id = '';
        this.limit = 30;
        this.loading = false;
        this.modifiedEndpointPosition = 'before';
        this.options = {
            dataKey: 'data',
            withCredentials: true,
        };
        this.dryRun = false;
        this.page = 1;
        this.requestTime = -1;
        this.timeCompleted = -1;
        this.timeParsed = -1;
        this.uniqueKey = '';
        this.updatesUniqueKey = true;
        this.updatesUniqueKeyDeep = true;
        this.useRandomUniqueKeySalt = false;
        this.cidPrefix = 'c';
        this.runLastAttempts = 0;
        this.runLastAttemptsMax = 2;
        this.token = '';
        this.ttl = 0;
        this.Handle_OnChange = this.Handle_OnChange.bind(this);
        Object.assign(this, options);
        this._meta = {};
        this.attributes = {};
        this.body = {};
        this.cid = this.cidPrefix + Math.random().toString(36).substr(2, 5);
        this.headers = {};
        this.mockData = {};
        this.parent = undefined;
        this.builder = new Builder_js_1.default(this);
        this.setOptions(options);
        this.attachChangeListeners();
        ActiveRecord.hook(`${this.constructor.name}.setup`, [this]);
    }
    static setHook(event = 'init', func) {
        const key = `${this.name}.${event}`;
        this.hooks.set(key, func);
    }
    static unsetHook(event = 'init') {
        const key = `${this.name}.${event}`;
        this.hooks.delete(key);
    }
    static hook(key = 'init', params = []) {
        const func = this.hooks.get(key);
        func && func(...params);
    }
    get b() {
        return this.builder;
    }
    get isModel() {
        return this.builder.id != '';
    }
    attachChangeListeners() {
        this.on('change', this.Handle_OnChange);
        this.on('fetched', this.Handle_OnChange);
    }
    detachChangeListeners() {
        this.off('change', this.Handle_OnChange);
        this.off('fetched', this.Handle_OnChange);
    }
    attr(key) {
        return this.attributes[key];
    }
    clone() {
        const instance = new this.constructor();
        instance.parent = this.parent;
        instance.setOptions(this.options);
        instance.setHeaders(this.headers);
        instance.add(this.toJSON());
        return instance;
    }
    hasAttributes() {
        return Object.keys(this.attributes).length > 0;
    }
    set(attributes = {}, options = {}, trigger = true) {
        const possibleSetters = Object.getOwnPropertyDescriptors(this.__proto__);
        attributes = this.cleanData(attributes);
        for (const key in attributes) {
            this.attributes[key] = attributes[key];
            if (possibleSetters && possibleSetters[key] && possibleSetters[key].set) {
                this[key] = attributes[key];
            }
        }
        if (attributes && attributes['id']) {
            this.setId(attributes.id);
        }
        if (trigger) {
            this.dispatch('set', { attributes });
            ActiveRecord.hook(`${this.constructor.name}.set`, [this, attributes]);
        }
        return this;
    }
    unset(key) {
        delete this.attributes[key];
        return this;
    }
    setOptions(options = {}) {
        this.options = Object.assign(this.options, options);
        if (options.cacheable !== undefined) {
            this.cacheable = options.cacheable;
        }
        if (options.baseUrl) {
            this.baseUrl = options.baseUrl;
        }
        if (options.endpoint) {
            this.setEndpoint(options.endpoint);
        }
        if (options.headers) {
            this.setHeaders(options.headers);
        }
        if (options.parent) {
            this.parent = options.parent;
        }
        if (options.meta) {
            if (options.merge) {
                if (options.meta.pagination.count && this._meta.pagination.count) {
                    options.meta.pagination.count += this._meta.pagination.count;
                }
            }
            this._meta = options.meta;
        }
        if (options.params || options.qp || options.queryParams) {
            this.setQueryParams(options.queryParams || options.qp || options.params);
        }
        return this;
    }
    toJSON(pathOrKey = new Set(), maxDepth = 5) {
        const path = pathOrKey instanceof Set ? pathOrKey : new Set();
        const refId = `${this.endpoint}.${this.id}`;
        const json = Object.assign({}, this.attributes);
        if (path.has(refId)) {
            return json;
        }
        if (path.size >= maxDepth) {
            return json;
        }
        if (typeof pathOrKey === 'string') {
            return Object.assign({}, this.attributes);
        }
        const currentPath = new Set(path);
        currentPath.add(refId);
        const possibleGetters = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        for (const key of possibleGetters) {
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
            if (descriptor === null || descriptor === void 0 ? void 0 : descriptor.get) {
                const value = this[key];
                if (value === null || value === void 0 ? void 0 : value.toJSON) {
                    if (this.isEmptyRelationship(value)) {
                        continue;
                    }
                    json[key] = value.toJSON(currentPath, maxDepth);
                }
            }
        }
        return json;
    }
    isEmptyRelationship(value) {
        if (value.models !== undefined) {
            return value.models.length === 0;
        }
        if (value.id !== undefined) {
            return !value.id && Object.keys(value.attributes || {}).length === 0;
        }
        return false;
    }
    disableUniqueKeys() {
        this.updatesUniqueKey = false;
        this.useRandomUniqueKeySalt = false;
        this.updatesUniqueKeyDeep = false;
        return this;
    }
    create(attributes) {
        return this.post(attributes);
    }
    delete(attributes = {}) {
        const method = 'DELETE';
        const payload = Object.assign({}, this.toJSON(), attributes);
        const output = this._fetch(null, {}, method, payload, this.headers);
        output.then((request) => {
            var _a;
            if (request.status < 200 || request.status > 299) {
                return;
            }
            if (this.hasParentCollection()) {
                (_a = this.parent) === null || _a === void 0 ? void 0 : _a.remove(this);
            }
        });
        return output;
    }
    post(attributes = {}) {
        const method = 'POST';
        const payload = Object.assign({}, this.toJSON(), attributes);
        const output = this._fetch(null, {}, method, payload, this.headers);
        return output;
    }
    put(attributes) {
        const method = 'PUT';
        const payload = Object.assign({}, this.toJSON(), attributes);
        const output = this._fetch(null, {}, method, payload, this.headers);
        return output;
    }
    save(attributes = {}) {
        const method = this.id ? 'PUT' : 'POST';
        const payload = Object.assign({}, this.toJSON(), attributes);
        const output = this._fetch(null, {}, method, payload, this.headers);
        return output;
    }
    add(attributes) {
        return this.set(attributes);
    }
    reset() {
        this.attributes = {};
        this.hasFetched = false;
        this.hasLoaded = false;
        this.loading = false;
        this.requestTime = -1;
        this.timeCompleted = -1;
        this.timeParsed = -1;
        this.uniqueKey = '';
        this.dispatch('reset');
        ActiveRecord.hook(`${this.constructor.name}.reset`, [this]);
        return this;
    }
    addLoadingHooks(view, preHook = undefined, postHook = undefined) {
        this.removeLoadingHooks();
        this.loadingHookPre = () => {
            var _a;
            return (preHook || ((_a = view === null || view === void 0 ? void 0 : view.loading) === null || _a === void 0 ? void 0 : _a.bind(view)) || function () { })();
        };
        this.loadingHookPost = () => {
            var _a;
            return (postHook || ((_a = view === null || view === void 0 ? void 0 : view.notloading) === null || _a === void 0 ? void 0 : _a.bind(view)) || function () { })();
        };
        this.loadingHookPost && this.on('complete', this.loadingHookPost);
        this.loadingHookPost && this.on('error', this.loadingHookPost);
        this.loadingHookPre && this.on('requesting', this.loadingHookPre);
        return this;
    }
    removeLoadingHooks() {
        this.loadingHookPost && this.off('complete', this.loadingHookPost);
        this.loadingHookPost && this.off('error', this.loadingHookPost);
        this.loadingHookPre && this.off('requesting', this.loadingHookPre);
        this.loadingHookPost = undefined;
        this.loadingHookPre = undefined;
        return this;
    }
    cache(ttl) {
        this.ttl = ttl;
        return this;
    }
    mock(data) {
        const self = this;
        function callback() {
            self.unsetMockData('any');
            self.off('finish', this);
        }
        this.on('finish', callback);
        this.setMockData('any', data);
        return this;
    }
    find(id, queryParams = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch({ id }, queryParams).then((request) => this);
        });
    }
    file(name, file, additionalFields = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.builder.identifier(this.id).getUrl();
            const formData = createFormData();
            if (file.hasOwnProperty('files') && file.files) {
                file = file.files[0];
            }
            if (file.hasOwnProperty('length')) {
                file = file[0];
            }
            this.unsetHeader('Content-Type');
            formData.append(name, file);
            if (additionalFields) {
                let key;
                for (key in additionalFields) {
                    const value = additionalFields[key];
                    if (Array.isArray(value)) {
                        value.forEach((item) => formData.append(key + '[]', item));
                    }
                    else {
                        formData.append(key, value);
                    }
                }
            }
            return this._fetch(null, {}, 'POST', formData).then((request) => {
                this.dispatch('file:complete');
                return request;
            });
        });
    }
    upload(name, file, additionalFields = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.file(name, file, additionalFields);
        });
    }
    fetch(options = {}, queryParams = {}, method = 'get', body = {}, headers = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._fetch(options, queryParams, method, body, headers);
        });
    }
    runLast() {
        if (++this.runLastAttempts >= this.runLastAttemptsMax) {
            console.warn('Run last attempts expired');
            setTimeout(() => {
                this.runLastAttempts = 0;
            }, 1000);
            return;
        }
        return this._fetch(this.lastRequest.options, this.lastRequest.queryParams, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
    }
    updateUniqueKey() {
        let hash = (0, Utility_js_1.compactObjectHash)(this.attributes);
        if (this.useRandomUniqueKeySalt) {
            hash += Math.random().toString(36).substr(2, 5) + Date.now();
        }
        this.uniqueKey = hash;
    }
    getUrlByMethod(method) {
        let url = '';
        const originalEndpoint = this.getEndpoint();
        if (method === 'delete' && this.endpointDelete) {
            this.endpoint = this.endpointDelete;
        }
        else if (method === 'put' && this.endpointPut) {
            this.endpoint = this.endpointPut;
        }
        else if (method === 'post' && this.endpointPost) {
            this.endpoint = this.endpointPost;
        }
        if (this.referenceForModifiedEndpoint) {
            this.useModifiedEndpoint(this.referenceForModifiedEndpoint, this.modifiedEndpointPosition);
        }
        url = this.builder.getUrl();
        this.endpoint = originalEndpoint;
        return url;
    }
    beforeFetch() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    cancelModifiedEndpoint() {
        this.referenceForModifiedEndpoint = undefined;
        return this;
    }
    isUsingModifiedEndpoint() {
        return !!this.referenceForModifiedEndpoint;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    getReferencedEndpoint() {
        return this.referenceForModifiedEndpoint;
    }
    getModifiedEndpoint() {
        const activeRecord = this.referenceForModifiedEndpoint;
        if (!activeRecord || (!activeRecord.id && this.modifiedEndpointPosition == 'before')) {
            console.warn('Modified ActiveRecord [`' +
                activeRecord.getEndpoint() +
                '.' +
                this.getEndpoint() +
                '] usually has an ID signature. [ar/this]', this);
            return this.getEndpoint();
        }
        return this.modifiedEndpointPosition == 'before'
            ? [activeRecord.getEndpoint(), activeRecord.id, this.getEndpoint()].join('/')
            : [this.getEndpoint(), this.id, activeRecord.getEndpoint()].join('/');
    }
    getQueryParam(key) {
        return this.builder.getQueryParam(key) || '';
    }
    getQueryParams() {
        return this.builder.getQueryParams() || {};
    }
    hasParent() {
        return !!this.parent;
    }
    hasParentCollection() {
        return this.hasParent() && this.parent.isCollection;
    }
    useModifiedEndpoint(activeRecord, position = 'before') {
        this.referenceForModifiedEndpoint = activeRecord;
        this.modifiedEndpointPosition = position;
        return this;
    }
    setBody(value) {
        this.body = value;
        return this;
    }
    getEndpoint() {
        return this.endpoint;
    }
    setEndpoint(endpoint) {
        this.referenceForModifiedEndpoint = undefined;
        this.endpoint = endpoint;
        return this;
    }
    setHeader(header, value) {
        this.headers[header] = value;
        return this;
    }
    setHeaders(headers) {
        for (const k in headers) {
            this.setHeader(k, headers[k]);
        }
        return this;
    }
    setId(id) {
        this.id = typeof id === 'number' ? id.toString() : id;
        this.b.identifier(this.id);
        return this;
    }
    unsetId() {
        this.id = '';
        return this;
    }
    unsetHeader(header) {
        this.setHeader(header, null);
        delete this.headers[header];
        return this;
    }
    setMockData(key = 'any', jsonData) {
        const response = {
            config: {},
            data: jsonData,
            headers: {},
            status: 200,
            statusText: 'OK',
        };
        Request_js_1.default.cachedResponses.set(key, response, 1000 * 9999);
        return this;
    }
    unsetMockData(key = 'any') {
        Request_js_1.default.cachedResponses.delete(key);
        return this;
    }
    setDryRun(enable = true) {
        this.dryRun = !!enable;
        return this;
    }
    setQueryParam(key, value) {
        this.builder.qp(key, value);
        return this;
    }
    setQueryParams(params) {
        for (const k in params) {
            this.setQueryParam(k, params[k]);
        }
        return this;
    }
    unsetQueryParam(param) {
        delete this.builder.queryParams[param];
        return this;
    }
    setToken(token) {
        this.token = token;
        this.setHeader('Authorization', 'Bearer ' + token);
        return this;
    }
    setAfterResponse(e, options = {}) {
        const request = e.detail.request;
        const response = e.detail.response;
        const method = request.method || 'get';
        const remoteJson = response.data;
        if (method.toLowerCase() === 'post' && !this.isModel) {
            this.add((this.dataKey ? remoteJson[this.dataKey] : remoteJson) || response.data);
        }
        else if (method.toLowerCase() === 'delete') {
        }
        else {
            const data = this.dataKey !== undefined ? remoteJson[this.dataKey] : remoteJson.responseData || response.data;
            this.set(data, options);
        }
        this.setOptions(Object.assign({}, options, { meta: remoteJson.meta }));
        this.dispatch('parse:after', e.detail);
    }
    _fetch(options = {}, queryParams = {}, method = 'get', body = {}, headers = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            method = method ? method.toLowerCase() : 'get';
            this.lastRequest = {
                body,
                headers,
                method,
                options,
                queryParams,
            };
            this.requestTime = Date.now();
            if (!this.cacheable) {
                this.builder.qp('cb', Date.now());
            }
            this.setQueryParams(queryParams);
            this.setHeaders(headers);
            if (options && options.id) {
                this.builder.identifier(options.id);
            }
            yield this.beforeFetch();
            const url = this.getUrlByMethod(method);
            const ttl = this.ttl || 0;
            this.loading = true;
            const request = (this.request = new Request_js_1.default(url, {
                cacheOptions: {
                    enabled: ttl > 0,
                    ttl: ttl,
                },
                dataKey: this.dataKey,
                dryRun: this.dryRun,
                withCredentials: this.options.withCredentials,
            }));
            this.request.method = method;
            request.on('complete:delete', (e) => {
                this.dispatch('complete:delete', e.detail);
                this.builder.identifier('');
            });
            request.on('complete:get', (e) => this.dispatch('complete:get', e.detail));
            request.on('complete:post', (e) => this.dispatch('complete:post', e.detail));
            request.on('complete:put', (e) => this.dispatch('complete:put', e.detail));
            request.on('complete', (e) => this.FetchComplete(e));
            request.on('error:delete', (e) => this.dispatch('error:delete', e.detail));
            request.on('error:get', (e) => this.dispatch('error:get', e.detail));
            request.on('error:post', (e) => this.dispatch('error:post', e.detail));
            request.on('error:put', (e) => this.dispatch('error:put', e.detail));
            request.on('error', (e) => {
                this.loading = false;
                return this.dispatch('error', e.detail);
            });
            request.on('finish', (e) => this.dispatch('finish'));
            request.on('parse:after', (e) => this.FetchParseAfter(e, options || {}));
            request.on('progress', (e) => this.FetchProgress(e));
            request.on('dryrun', (e) => this.dispatch('dryrun', e.detail));
            this.hasFetched = true;
            return request.fetch(method, Object.assign(body || {}, this.body), Object.assign(headers || {}, this.headers), ttl);
        });
    }
    cleanData(attributes = {}) {
        if (this.dataKey && typeof attributes === 'object' && !Array.isArray(attributes)) {
            const keys = Object.keys(attributes);
            if (keys.length === 1 && keys[0] === this.dataKey) {
                return attributes[this.dataKey];
            }
        }
        return attributes;
    }
    FetchComplete(e) {
        this.hasLoaded = true;
        this.loading = false;
        this.timeCompleted = Date.now();
        this.dispatch('complete', e.detail);
        this.dispatch('success', e.detail);
    }
    FetchProgress(e) {
        this.dispatch('progress', e.detail);
    }
    FetchParseAfter(e, options = {}) {
        var _a, _b;
        const code = ((_b = (_a = e.detail) === null || _a === void 0 ? void 0 : _a.response) === null || _b === void 0 ? void 0 : _b.status) || 0;
        if (code < 400) {
            this.setAfterResponse(e, options);
        }
        this.timeParsed = Date.now();
        this.dispatch('fetched', e.detail);
    }
    Handle_OnChange(e) {
        let parent = this.parent;
        this.updatesUniqueKey && this.updateUniqueKey();
        if (this.updatesUniqueKeyDeep) {
            while (parent && parent.updateUniqueKey) {
                parent.updateUniqueKey();
                parent = parent.parent;
            }
        }
    }
}
exports.default = ActiveRecord;
ActiveRecord.hooks = new Map();
//# sourceMappingURL=ActiveRecord.js.map