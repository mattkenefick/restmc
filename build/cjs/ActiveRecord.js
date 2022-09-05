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
const Builder_1 = require("./Http/Builder");
const Core_1 = require("./Core");
const form_data_1 = require("form-data");
const Request_1 = require("./Http/Request");
class ActiveRecord extends Core_1.default {
    constructor(options = {}) {
        super(options);
        this.attributes = {};
        this.baseUrl = '/v1';
        this.cacheable = true;
        this.cid = '';
        this.dataKey = 'data';
        this.endpoint = '';
        this.hasFetched = false;
        this.hasLoaded = false;
        this.headers = {};
        this.id = '';
        this.limit = 30;
        this.loading = false;
        this.meta = {};
        this.modifiedEndpointPosition = 'before';
        this.options = {
            dataKey: 'data',
            withCredentials: true,
        };
        this.page = 1;
        this.requestTime = -1;
        this.cidPrefix = 'c';
        this.runLastAttempts = 0;
        this.runLastAttemptsMax = 2;
        Object.assign(this, options);
        this.body = {};
        this.cid = this.cidPrefix + Math.random().toString(36).substr(2, 5);
        this.parent = undefined;
        this.setHeader('Content-Type', 'application/json; charset=utf8');
        this.builder = new Builder_1.default(this);
        this.setOptions(options);
    }
    get b() {
        return this.builder;
    }
    get isModel() {
        return this.builder.id != '';
    }
    attr(key) {
        return this.attributes[key];
    }
    hasAttributes() {
        return Object.keys(this.attributes).length > 0;
    }
    set(attributes = {}, options = {}, trigger = true) {
        let possibleSetters = Object.getOwnPropertyDescriptors(this.__proto__);
        for (let key in attributes) {
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
        }
        return this;
    }
    unset(key) {
        delete this.attributes[key];
        return this;
    }
    setOptions(options = {}) {
        this.options = Object.assign(this.options, options);
        if (options.baseUrl) {
            this.baseUrl = options.baseUrl;
        }
        if (options.endpoint) {
            this.setEndpoint(options.endpoint);
        }
        if (options.headers) {
            this.setHeaders(options.headers);
        }
        if (options.meta) {
            if (options.merge) {
                if (options.meta.pagination.count && this.meta.pagination.count) {
                    options.meta.pagination.count += this.meta.pagination.count;
                }
            }
            this.meta = options.meta;
        }
        if (options.params || options.qp || options.queryParams) {
            this.setQueryParams(options.queryParams || options.qp || options.params);
        }
        return this;
    }
    toJSON() {
        let json = this.attributes;
        let possibleGetters = Object.getOwnPropertyNames(this.__proto__);
        for (let key of possibleGetters) {
            if (json[key] && this[key] && this[key].toJSON) {
                json[key] = this[key].toJSON();
            }
        }
        return json;
    }
    create(attributes) {
        return this.post(attributes);
    }
    delete(attributes = {}) {
        const url = this.builder.identifier(this.id || (attributes === null || attributes === void 0 ? void 0 : attributes.id) || '').getUrl();
        return this._fetch(null, {}, 'DELETE', Object.assign(attributes || {}, this.attributes), this.headers);
    }
    post(attributes = {}) {
        const url = this.builder.getUrl();
        return this._fetch(null, {}, 'POST', Object.assign(attributes || {}, this.attributes), this.headers);
    }
    put(attributes) {
        const url = this.builder.getUrl();
        return this._fetch(null, {}, 'PUT', Object.assign(attributes || {}, this.attributes), this.headers);
    }
    save(attributes = {}) {
        const method = this.id ? 'PUT' : 'POST';
        return this._fetch(null, {}, method, Object.assign(attributes || {}, this.attributes), this.headers);
    }
    add(attributes) {
        return this.set(attributes);
    }
    reset() {
        this.attributes = {};
        this.dispatch('reset');
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
    find(id, queryParams = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch({ id }, queryParams).then((request) => this);
        });
    }
    file(name, file) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.builder.identifier(this.id).getUrl();
            const formData = new form_data_1.default();
            if (file instanceof HTMLInputElement) {
                file = file.files[0];
            }
            else if (file instanceof FileList) {
                file = file[0];
            }
            else if (file instanceof File) {
            }
            else {
                console.warn('File provided unacceptable type.');
            }
            this.unsetHeader('Content-Type');
            formData.append(name, file);
            return this._fetch(null, {}, 'POST', formData).then((request) => {
                this.dispatch('file:complete');
                return request;
            });
        });
    }
    upload(name, file) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.file(name, file);
        });
    }
    fetch(options = {}, queryParams = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._fetch(options, queryParams);
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
    getUrlByMethod(method) {
        let url = '';
        let originalEndpoint = this.getEndpoint();
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
    cancelModifiedEndpoint() {
        this.referenceForModifiedEndpoint = undefined;
        return this;
    }
    isUsingModifiedEndpoint() {
        return !!this.referenceForModifiedEndpoint;
    }
    getReferencedEndpoint() {
        return this.referenceForModifiedEndpoint;
    }
    getModifiedEndpoint() {
        const activeRecord = this.referenceForModifiedEndpoint;
        if (!activeRecord || (!activeRecord.id && this.modifiedEndpointPosition == 'before')) {
            console.warn('Modified ActiveRecord [`'
                + activeRecord.getEndpoint()
                + '.'
                + this.getEndpoint()
                + '] usually has an ID signature. [ar/this]', this);
            return this.getEndpoint();
        }
        return this.modifiedEndpointPosition == 'before'
            ? [activeRecord.getEndpoint(), activeRecord.id, this.getEndpoint()].join('/')
            : [this.getEndpoint(), this.id, activeRecord.getEndpoint()].join('/');
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
        for (let k in headers) {
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
    setQueryParam(key, value) {
        this.builder.qp(key, value);
        return this;
    }
    setQueryParams(params) {
        for (let k in params) {
            this.setQueryParam(k, params[k]);
        }
        return this;
    }
    unsetQueryParam(param) {
        delete this.builder.queryParams[param];
        return this;
    }
    setToken(token) {
        this.setHeader('Authorization', 'Bearer ' + token);
        return this;
    }
    setAfterResponse(e, options = {}) {
        const request = e.detail.request;
        const response = e.detail.response;
        let method = request.method || 'get';
        let remoteJson = response.data;
        if (method.toLowerCase() === 'post' && !this.isModel) {
            this.add((this.dataKey ? remoteJson[this.dataKey] : remoteJson) || response.data);
        }
        else if (method.toLowerCase() === 'delete') {
        }
        else {
            let data = this.dataKey !== undefined ? remoteJson[this.dataKey] : remoteJson.responseData || response.data;
            this.set(data, options);
        }
        this.setOptions(Object.assign({}, options, { meta: remoteJson.meta }));
        this.dispatch('parse:after', e.detail);
    }
    _fetch(options = {}, queryParams = {}, method = 'get', body = {}, headers = {}) {
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
        const url = this.getUrlByMethod(method);
        this.dispatch('requesting', { request: this.lastRequest });
        this.hasFetched = true;
        this.loading = true;
        let request = (this.request = new Request_1.default(url, {
            dataKey: this.dataKey,
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
        request.on('error', (e) => this.dispatch('error', e.detail));
        request.on('parse:after', (e) => this.FetchParseAfter(e, options || {}));
        request.on('progress', (e) => this.FetchProgress(e));
        return request.fetch(method, Object.assign(body || {}, this.body), Object.assign(headers || {}, this.headers));
    }
    cache(key, value, isComplete = false, ttl = 5000) {
        if (ActiveRecord.cachedResponses[key]) {
            ActiveRecord.cachedResponses[key].complete = isComplete;
            ActiveRecord.cachedResponses[key].time = Date.now();
            ActiveRecord.cachedResponses[key].value = value;
        }
        else {
            ActiveRecord.cachedResponses[key] = {
                complete: false,
                subscribers: [],
                time: Date.now(),
                ttl: ttl,
                value: value,
            };
        }
    }
    isCached(key) {
        return !!ActiveRecord.cachedResponses[key];
    }
    isCachePending(key) {
        return !!this.isCached(key) && (!this.getCache(key).complete || !!this.getCache(key).failed);
    }
    getCache(key) {
        return ActiveRecord.cachedResponses[key];
    }
    addCacheSubscriber(key, resolve, reject, collection) {
        const cache = this.getCache(key);
        cache.subscribers.push({
            collection,
            reject,
            resolve,
        });
    }
    clearCacheSubscribers(key) {
        const cache = this.getCache(key);
        cache.subscribers = [];
    }
    FetchComplete(e) {
        this.hasLoaded = true;
        this.loading = false;
        this.dispatch('complete', e.detail);
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
        this.dispatch('fetched', e.detail);
    }
}
exports.default = ActiveRecord;
ActiveRecord.cachedResponses = {};
//# sourceMappingURL=ActiveRecord.js.map