/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../build/esm/ActiveRecord.js":
/*!***************************************!*\
  !*** ../../build/esm/ActiveRecord.js ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Builder_js_1 = __webpack_require__(/*! ./Http/Builder.js */ "../../build/esm/Http/Builder.js");
const Core_js_1 = __webpack_require__(/*! ./Core.js */ "../../build/esm/Core.js");
const form_data_1 = __webpack_require__(/*! form-data */ "../../node_modules/form-data/lib/browser.js");
const Request_js_1 = __webpack_require__(/*! ./Http/Request.js */ "../../build/esm/Http/Request.js");
class ActiveRecord extends Core_js_1.default {
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
        this.mockData = {};
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
        this.ttl = 0;
        Object.assign(this, options);
        this.body = {};
        this.cid = this.cidPrefix + Math.random().toString(36).substr(2, 5);
        this.parent = undefined;
        this.setHeader('Content-Type', 'application/json; charset=utf-8');
        this.builder = new Builder_js_1.default(this);
        this.setOptions(options);
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
    attr(key) {
        return this.attributes[key];
    }
    clone() {
        const instance = new this.constructor();
        instance.add(this.toJSON());
        instance.setOptions(this.options);
        instance.setHeaders(this.headers);
        instance.parent = this.parent;
        return instance;
    }
    hasAttributes() {
        return Object.keys(this.attributes).length > 0;
    }
    set(attributes = {}, options = {}, trigger = true) {
        const possibleSetters = Object.getOwnPropertyDescriptors(this.__proto__);
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
        const json = this.attributes;
        const possibleGetters = Object.keys(Object.getPrototypeOf(this));
        for (const key of possibleGetters) {
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
        const output = this._fetch(null, {}, 'DELETE', Object.assign(attributes || {}, this.attributes), this.headers);
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
        const url = this.builder.getUrl();
        const output = this._fetch(null, {}, 'POST', Object.assign(attributes || {}, this.attributes), this.headers);
        return output;
    }
    put(attributes) {
        const url = this.builder.getUrl();
        const output = this._fetch(null, {}, 'PUT', Object.assign(attributes || {}, this.attributes), this.headers);
        return output;
    }
    save(attributes = {}) {
        const method = this.id ? 'PUT' : 'POST';
        const output = this._fetch(null, {}, method, Object.assign(attributes || {}, this.attributes), this.headers);
        return output;
    }
    add(attributes) {
        return this.set(attributes);
    }
    reset() {
        this.attributes = {};
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
            const formData = new form_data_1.default();
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
            yield this.beforeFetch();
            this.setQueryParams(queryParams);
            this.setHeaders(headers);
            if (options && options.id) {
                this.builder.identifier(options.id);
            }
            const url = this.getUrlByMethod(method);
            const ttl = this.ttl || 0;
            this.ttl = 0;
            this.dispatch('requesting', { request: this.lastRequest });
            this.hasFetched = true;
            this.loading = true;
            const request = (this.request = new Request_js_1.default(url, {
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
            request.on('error', (e) => {
                this.loading = false;
                return this.dispatch('error', e.detail);
            });
            request.on('finish', (e) => this.dispatch('finish'));
            request.on('parse:after', (e) => this.FetchParseAfter(e, options || {}));
            request.on('progress', (e) => this.FetchProgress(e));
            return request.fetch(method, Object.assign(body || {}, this.body), Object.assign(headers || {}, this.headers), ttl);
        });
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
exports["default"] = ActiveRecord;
ActiveRecord.hooks = new Map();
//# sourceMappingURL=ActiveRecord.js.map

/***/ }),

/***/ "../../build/esm/Cache.js":
/*!********************************!*\
  !*** ../../build/esm/Cache.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class Cache {
    constructor() {
        this.storage = {};
    }
    delete(key) {
        if (this.storage[key]) {
            delete this.storage[key];
        }
    }
    get(key, keep = false) {
        const item = this.storage[key];
        let value;
        if (!item) {
            value = undefined;
        }
        else if (item.ttl === 0) {
            value = item.value;
            !keep && this.delete(key);
        }
        else if (this.isCachedItemHealthy(item)) {
            value = item.value;
        }
        return value;
    }
    exists(key) {
        return this.storage[key] !== undefined;
    }
    has(key) {
        return this.get(key, true) !== undefined;
    }
    set(key, value, ttl = 0, immutable = false) {
        const hasItem = this.has(key);
        const time = Date.now();
        if (hasItem && this.isImmutable(key)) {
            return false;
        }
        this.storage[key] = {
            immutable,
            time,
            ttl,
            value,
        };
        return true;
    }
    isCachedItemHealthy(item) {
        const now = Date.now();
        const then = item.time;
        const ttl = item.ttl;
        return then + ttl > now;
    }
    isImmutable(key) {
        const item = this.storage[key];
        return !!(item === null || item === void 0 ? void 0 : item.immutable);
    }
}
exports["default"] = Cache;
//# sourceMappingURL=Cache.js.map

/***/ }),

/***/ "../../build/esm/Collection.js":
/*!*************************************!*\
  !*** ../../build/esm/Collection.js ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const ActiveRecord_js_1 = __webpack_require__(/*! ./ActiveRecord.js */ "../../build/esm/ActiveRecord.js");
const CollectionIterator_js_1 = __webpack_require__(/*! ./CollectionIterator.js */ "../../build/esm/CollectionIterator.js");
const Model_js_1 = __webpack_require__(/*! ./Model.js */ "../../build/esm/Model.js");
class Collection extends ActiveRecord_js_1.default {
    constructor(options = {}) {
        super(options);
        this.atRelationship = [];
        this.meta = {
            pagination: {
                count: 15,
                current_page: 1,
                links: {},
                per_page: 15,
                total: 0,
                total_pages: 1,
            },
        };
        this.models = [];
        this.sortKey = 'id';
        this.iterator = new CollectionIterator_js_1.default(this);
        this.dataKey = 'data';
        this.setOptions(options);
        this.builder.qp('limit', options.limit || this.limit).qp('page', options.page || this.page);
        if (options.atRelationship) {
            this.atRelationship = options.atRelationship;
        }
    }
    static paginator(collection) {
        return collection.meta.pagination;
    }
    static hydrate(models = [], options = {}, trigger = true) {
        const collection = new this(options);
        if (models) {
            collection.add(models, {}, trigger);
        }
        collection.setOptions(options);
        return collection;
    }
    get isCollection() {
        return true;
    }
    get length() {
        return this.models.length;
    }
    get modelId() {
        return 'id';
    }
    get pagination() {
        return Collection.paginator(this);
    }
    toJSON() {
        return JSON.parse(JSON.stringify(this.models));
    }
    fetchNext(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = Object.assign({}, this.lastRequest.options);
            let qp = Object.assign({}, this.builder.queryParams, this.lastRequest.queryParams);
            qp.page = parseFloat(qp.page) + 1;
            options.merge = append;
            return yield this._fetch(options, qp, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
        });
    }
    fetchPrevious(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = Object.assign({}, this.lastRequest.options);
            let qp = Object.assign({}, this.builder.queryParams, this.lastRequest.queryParams);
            qp.page = Math.max(1, parseFloat(qp.page) - 1);
            options.merge = append;
            return yield this._fetch(options, qp, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
        });
    }
    getEndpoint() {
        return super.getEndpoint() || this.model.endpoint;
    }
    add(data, options = {}, trigger = true) {
        if (data == undefined) {
            return this;
        }
        const models = Array.isArray(data) ? data : [data];
        models.forEach((model) => {
            if (!(model instanceof Model_js_1.default)) {
                model = new this.model.constructor(model);
            }
            model.parent = this;
            model.headers = this.headers;
            if (this.referenceForModifiedEndpoint) {
                model.useModifiedEndpoint(this.referenceForModifiedEndpoint);
            }
            trigger && this.dispatch('add:before', { model });
            if (options.prepend) {
                this.models.unshift(model);
            }
            else {
                this.models.push(model);
            }
        });
        trigger && this.dispatch('change', { from: 'add' });
        trigger && this.dispatch('add');
        return this;
    }
    remove(model, trigger = true) {
        let i = 0;
        let ii = 0;
        const items = Array.isArray(model) ? model : [model];
        for (ii = 0; ii < items.length; ii++) {
            i = 0;
            while (i < this.models.length) {
                trigger && this.dispatch('remove:before', { model: this.models[i] });
                if (this.models[i] == items[ii]) {
                    this.models.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
        }
        trigger && this.dispatch('change', { from: 'remove' });
        trigger && this.dispatch('remove');
        return this;
    }
    set(model, options = {}, trigger = true) {
        if (!options || (options && options.merge != true)) {
            this.reset();
        }
        this.add(model, options, trigger);
        trigger && this.dispatch('set');
        return this;
    }
    clear() {
        return this.reset();
    }
    count() {
        return this.length;
    }
    delete(attributes = {}) {
        const url = this.builder.identifier(this.id || (attributes === null || attributes === void 0 ? void 0 : attributes.id) || '').getUrl();
        if (this.builder.id) {
            let model = this.findWhere(attributes);
            model && this.remove(model);
        }
        const body = null;
        const headers = this.headers;
        const method = 'DELETE';
        return this._fetch(null, {}, method, body, headers);
    }
    each(callback) {
        this.models.forEach(callback);
    }
    filter(predicate) {
        return this.models.filter(predicate);
    }
    map(...params) {
        return Array.prototype.map.apply(this.models, params);
    }
    push(model, options = {}) {
        this.add(model, options);
        return this;
    }
    pop() {
        const model = this.at(this.length - 1);
        return this.remove(model);
    }
    reset() {
        this.models = [];
        this.dispatch('change', { from: 'reset' });
        this.dispatch('reset');
        return this;
    }
    unshift(model, options = {}) {
        return this.add(model, Object.assign({ prepend: true }, options));
    }
    shift() {
        const model = this.at(0);
        return this.remove(model);
    }
    slice(...params) {
        return Array.prototype.slice.apply(this.models, params);
    }
    get(query) {
        if (query == null) {
            return void 0;
        }
        return this.where({ [this.modelId]: query instanceof Model_js_1.default ? query.id : query }, true);
    }
    has(obj) {
        return this.get(obj) != undefined;
    }
    at(index = 0) {
        if (index < 0) {
            index += this.length;
        }
        let item = this.models[index];
        if (this.atRelationship && this.atRelationship.length) {
            this.atRelationship.forEach((key) => (item = item[key]));
        }
        return item;
    }
    first() {
        return this.at(0);
    }
    last() {
        return this.at(this.length - 1);
    }
    where(json = {}, first = false, fullMatch = false) {
        const constructor = this.constructor;
        const filteredModels = [];
        this.models.forEach((model) => {
            const attributes = Object.keys(json);
            const intersection = attributes.filter((key) => {
                return (key in json &&
                    model.attr(key) == json[key]);
            });
            if (fullMatch && intersection.length == attributes.length) {
                filteredModels.push(model);
            }
            else if (!fullMatch && intersection.length) {
                filteredModels.push(model);
            }
        });
        const collection = constructor.hydrate(filteredModels, this.options, false);
        return first ? collection.first() : collection;
    }
    findWhere(attributes = {}) {
        return this.where(attributes, true);
    }
    findByCid(cid) {
        return this.findWhere({ cid });
    }
    sort(options = {}) {
        let key = this.sortKey;
        if (options !== null) {
            key = options.key || key;
        }
        this.models = this.models.sort((a, b) => {
            return options && options.reverse ? (a.attr(key) - b.attr(key)) * -1 : (a.attr(key) - b.attr(key)) * 1;
        });
        return this;
    }
    pluck(attribute) {
        return this.models.map((model) => model.attr(attribute));
    }
    values(filter) {
        return new CollectionIterator_js_1.default(this, CollectionIterator_js_1.default.ITERATOR_VALUES, filter);
    }
    keys(filter) {
        return new CollectionIterator_js_1.default(this, CollectionIterator_js_1.default.ITERATOR_KEYS, filter);
    }
    entries(filter) {
        return new CollectionIterator_js_1.default(this, CollectionIterator_js_1.default.ITERATOR_KEYSVALUES, filter);
    }
    next(filter) {
        const result = this.iterator.next(filter);
        return result.done ? undefined : result.value;
    }
    previous(filter) {
        const result = this.iterator.previous(filter);
        return result.done ? undefined : result.value;
    }
    index() {
        return this.iterator.index;
    }
    current(filter) {
        const result = this.iterator.current();
        if (!result.done && filter) {
            const model = result.value;
            const index = this.indexOf(model);
            if (filter(model, index)) {
                return model;
            }
            return undefined;
        }
        return result.done ? undefined : result.value;
    }
    resetIterator() {
        this.iterator = new CollectionIterator_js_1.default(this);
    }
    indexOf(model) {
        return this.models.indexOf(model);
    }
    [Symbol.iterator]() {
        return new CollectionIterator_js_1.default(this, CollectionIterator_js_1.default.ITERATOR_VALUES);
    }
}
exports["default"] = Collection;
//# sourceMappingURL=Collection.js.map

/***/ }),

/***/ "../../build/esm/CollectionIterator.js":
/*!*********************************************!*\
  !*** ../../build/esm/CollectionIterator.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class CollectionIterator {
    constructor(collection, kind = 0, filter = (model) => true) {
        this.index = 0;
        this.kind = CollectionIterator.ITERATOR_VALUES;
        this.collection = collection;
        this.index = 0;
        this.kind = kind;
        this.filter = filter;
    }
    next(filter) {
        const iteratorFilter = filter || this.filter;
        while (this.collection && this.index < this.collection.length) {
            const model = this.collection.at(this.index);
            this.index++;
            if (iteratorFilter(model, this.index - 1)) {
                return {
                    done: false,
                    value: this.getValue(model),
                };
            }
        }
        return {
            done: true,
            value: undefined,
        };
    }
    previous(filter) {
        const iteratorFilter = filter || this.filter;
        while (this.collection && this.index > 0) {
            this.index--;
            const model = this.collection.at(this.index);
            if (iteratorFilter(model, this.index)) {
                return {
                    done: false,
                    value: this.getValue(model),
                };
            }
        }
        return {
            done: true,
            value: undefined,
        };
    }
    current() {
        if (this.collection && this.index > 0 && this.index <= this.collection.length) {
            const model = this.collection.at(this.index - 1);
            if (this.filter(model, this.index - 1)) {
                return {
                    done: false,
                    value: this.getValue(model),
                };
            }
        }
        return {
            done: true,
            value: undefined,
        };
    }
    getValue(model) {
        if (this.kind === CollectionIterator.ITERATOR_VALUES) {
            return model;
        }
        else if (this.kind === CollectionIterator.ITERATOR_KEYS) {
            return this.collection.modelId;
        }
        else {
            return [this.collection.modelId, model];
        }
    }
    [Symbol.iterator]() {
        return this;
    }
}
exports["default"] = CollectionIterator;
CollectionIterator.ITERATOR_VALUES = 0;
CollectionIterator.ITERATOR_KEYS = 1;
CollectionIterator.ITERATOR_KEYSVALUES = 2;
//# sourceMappingURL=CollectionIterator.js.map

/***/ }),

/***/ "../../build/esm/Core.js":
/*!*******************************!*\
  !*** ../../build/esm/Core.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const Dispatcher_js_1 = __webpack_require__(/*! ./Dispatcher/Dispatcher.js */ "../../build/esm/Dispatcher/Dispatcher.js");
class Core extends Dispatcher_js_1.default {
    constructor(options = {}) {
        super();
        Object.assign(this, options);
    }
}
exports["default"] = Core;
//# sourceMappingURL=Core.js.map

/***/ }),

/***/ "../../build/esm/Dispatcher/Dispatcher.js":
/*!************************************************!*\
  !*** ../../build/esm/Dispatcher/Dispatcher.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const DispatcherEvent_js_1 = __webpack_require__(/*! ./DispatcherEvent.js */ "../../build/esm/Dispatcher/DispatcherEvent.js");
class Dispatcher {
    constructor() {
        this.events = {};
    }
    dispatch(name, detail = {}) {
        const event = this.events[name];
        if (event) {
            event.fire(detail);
            return true;
        }
        return false;
    }
    hasEvent(eventName) {
        return !!this.events[eventName];
    }
    off(eventName, callback) {
        const event = this.events[eventName];
        if (event && !callback) {
            event.clearCallbacks();
            delete this.events[eventName];
        }
        else if (event && callback && event.callbacks.indexOf(callback) > -1) {
            event.unregisterCallback(callback);
            if (event.callbacks.length === 0) {
                delete this.events[eventName];
            }
        }
    }
    on(eventName, callback) {
        let event = this.events[eventName];
        if (!event) {
            event = new DispatcherEvent_js_1.default(eventName, {});
            this.events[eventName] = event;
        }
        event.registerCallback(callback);
    }
    trigger(eventName, detail = {}) {
        return this.dispatch(eventName, detail);
    }
}
exports["default"] = Dispatcher;
//# sourceMappingURL=Dispatcher.js.map

/***/ }),

/***/ "../../build/esm/Dispatcher/DispatcherEvent.js":
/*!*****************************************************!*\
  !*** ../../build/esm/Dispatcher/DispatcherEvent.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class DispatcherEvent {
    constructor(eventName, detail = {}) {
        this.callbacks = [];
        this.detail = detail;
        this.eventName = eventName;
    }
    clearCallbacks() {
        this.callbacks = [];
    }
    fire(detail) {
        const callbacks = this.callbacks.slice(0);
        let fires = 0;
        const event = {
            detail: Object.assign({}, this.detail, detail),
            name: this.eventName,
        };
        callbacks.forEach((callback) => {
            callback(event);
            fires++;
        });
        return fires;
    }
    hasCallback(callback) {
        return !!this.callbacks.find((value) => value === callback);
    }
    registerCallback(callback) {
        this.callbacks.push(callback);
    }
    unregisterCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
            return true;
        }
        return false;
    }
}
exports["default"] = DispatcherEvent;
//# sourceMappingURL=DispatcherEvent.js.map

/***/ }),

/***/ "../../build/esm/Http/Builder.js":
/*!***************************************!*\
  !*** ../../build/esm/Http/Builder.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class Builder {
    constructor(activeRecord) {
        this.id = '';
        this.includes = [];
        this.includeJoinBy = ',';
        this.includeKey = 'include';
        this.queryParams = {};
        this.activeRecord = activeRecord;
    }
    getUrl() {
        var _a, _b, _c;
        const baseUrl = this.getBaseUrl();
        const endpoint = this.getEndpoint();
        const queryParamStr = this.getQueryParamsAsString();
        const isModified = this.activeRecord.isUsingModifiedEndpoint();
        const modifiedBefore = isModified && this.activeRecord.modifiedEndpointPosition == 'before';
        const modifiedAfter = isModified && this.activeRecord.modifiedEndpointPosition == 'after';
        let urlBuilder = '';
        urlBuilder += baseUrl;
        urlBuilder += endpoint[0] === '/' ? endpoint : '/' + endpoint;
        if (isModified && modifiedAfter && ((_a = this.activeRecord) === null || _a === void 0 ? void 0 : _a.getReferencedEndpoint())) {
            urlBuilder += '/' + ((_c = (_b = this.activeRecord) === null || _b === void 0 ? void 0 : _b.getReferencedEndpoint()) === null || _c === void 0 ? void 0 : _c.id) || 0;
        }
        else if (this.id !== '') {
            urlBuilder += '/' + this.id;
        }
        else if (!modifiedAfter && this.activeRecord.id !== '') {
            urlBuilder += '/' + this.activeRecord.id;
        }
        if (queryParamStr) {
            urlBuilder += '?' + queryParamStr;
        }
        urlBuilder = urlBuilder.replace(/([a-zA-Z0-9])\/\//g, '$1/');
        return urlBuilder;
    }
    getBaseUrl() {
        return this.activeRecord.baseUrl;
    }
    getEndpoint() {
        return this.activeRecord.isUsingModifiedEndpoint()
            ? this.activeRecord.getModifiedEndpoint()
            : this.activeRecord.getEndpoint();
    }
    getQueryParam(key) {
        return (this.queryParams[key] || '');
    }
    getQueryParams() {
        return this.queryParams;
    }
    getQueryParamsAsString() {
        let str = '';
        Object.entries(this.queryParams)
            .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
            .forEach((entry, index) => {
            const key = entry[0];
            const value = (entry[1] || '') + '';
            if (value != null && value != '') {
                str += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }
        });
        if (this.includeKey && this.includes.length) {
            str += '&' + this.includeKey + '=' + this.includes.join(this.includeJoinBy);
        }
        str = str.replace(/^&/, '');
        return str;
    }
    identifier(id) {
        this.id = id.toString();
        return this;
    }
    include(value) {
        this.includes.push(value);
        return this;
    }
    queryParam(key, value) {
        if (typeof this.queryParams !== 'object') {
            this.queryParams = {};
        }
        this.queryParams[key] = value;
        return this;
    }
    qp(key, value) {
        return this.queryParam(key, value);
    }
}
exports["default"] = Builder;
//# sourceMappingURL=Builder.js.map

/***/ }),

/***/ "../../build/esm/Http/Request.js":
/*!***************************************!*\
  !*** ../../build/esm/Http/Request.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const axios_1 = __webpack_require__(/*! axios */ "../../node_modules/axios/index.js");
const Cache_js_1 = __webpack_require__(/*! ../Cache.js */ "../../build/esm/Cache.js");
const Core_js_1 = __webpack_require__(/*! ../Core.js */ "../../build/esm/Core.js");
const RequestError_js_1 = __webpack_require__(/*! ./RequestError.js */ "../../build/esm/Http/RequestError.js");
class Request extends Core_js_1.default {
    constructor(url = '', options = {}) {
        super();
        this.dataKey = 'data';
        this.headers = {};
        this.loading = false;
        this.method = 'get';
        this.mode = 'cors';
        this.responseData = {};
        this.status = 0;
        this.withCredentials = true;
        this.dataKey = options.dataKey || this.dataKey;
        this.withCredentials = options.hasOwnProperty('withCredentials') ? options.withCredentials : true;
        this.url = url;
        this.url = this.url.replace(/\?$/, '');
        this.url = this.url.replace(/\?&/, '?');
    }
    fetch(method = 'GET', body = {}, headers = {}, ttl = 0) {
        const params = {};
        const requestEvent = {
            body,
            headers,
            method,
            params,
        };
        this.method = (method || 'GET').toUpperCase();
        headers = Object.assign(this.headers, headers);
        params.data = body;
        params.headers = headers;
        params.method = this.method;
        params.redirect = 'follow';
        params.url = this.url;
        params.withCredentials = this.withCredentials;
        params.onUploadProgress = (event) => {
            const progressEvent = {
                loaded: event.loaded,
                ratio: event.loaded / event.total,
                total: event.total,
            };
            this.dispatch('progress', { progress: progressEvent });
        };
        this.dispatch('fetch:before', { request: requestEvent });
        this.loading = true;
        this.dispatch('requesting', { request: requestEvent });
        return new Promise((resolve, reject) => {
            let cacheKey = `${params.method}.${params.url}`;
            new Promise((resolveCacheLayer) => {
                if (Request.cachedResponses.has(cacheKey)) {
                    const result = Request.cachedResponses.get(cacheKey);
                    resolveCacheLayer(result);
                }
                else if (Request.cachedResponses.has('any')) {
                    const result = Request.cachedResponses.get('any');
                    resolveCacheLayer(result);
                }
                else {
                    resolveCacheLayer((0, axios_1.default)(params));
                }
            })
                .then((response) => {
                this.response = response;
                if (ttl > 0) {
                    Request.cachedResponses.set(cacheKey, response, ttl);
                }
                if (!this.response) {
                    return;
                }
                this.beforeParse(this.response);
                this.parse(this.response);
                this.afterParse(this.response);
                this.afterFetch(this.response);
                this.afterAll(this.response);
                this.afterAny();
                resolve(this);
                return response;
            })
                .catch((error) => {
                this.response = error.response;
                this.afterAllError(error);
                this.afterAny();
                reject(this);
                return error;
            });
        });
    }
    xhrFetch(url, params) {
        let self = this;
        let xhr = new XMLHttpRequest();
        xhr.open(params.method, url);
        for (let key in params.headers) {
            xhr.setRequestHeader(key, params.headers[key]);
        }
        const xhrSend = xhr.send;
        xhr.send = function () {
            const xhrArguments = arguments;
            return new Promise(function (resolve, reject) {
                xhr.upload.onprogress = function (e) {
                    const progressEvent = {
                        loaded: e.loaded,
                        ratio: 1,
                        total: e.total,
                    };
                    if (e.lengthComputable) {
                        progressEvent.ratio = e.loaded / e.total;
                    }
                    self.dispatch('progress', { progress: progressEvent });
                };
                xhr.onload = function () {
                    let blob = new Blob([xhr.response], { type: 'application/json' });
                    let init = {
                        status: xhr.status,
                        statusText: xhr.statusText,
                    };
                    let response = new Response(xhr.response ? blob : null, init);
                    resolve(response);
                };
                xhr.onerror = function () {
                    reject({ request: xhr });
                };
                xhrSend.apply(xhr, xhrArguments);
            });
        };
        xhr.withCredentials = this.withCredentials;
        return xhr.send(params.body);
    }
    setHeader(header, value) {
        this.headers[header] = value;
        return this;
    }
    setHeaders(headers) {
        this.headers = headers;
        return this;
    }
    beforeParse(response) {
        this.dispatch('parse:before', {
            request: this,
            response: response,
        });
    }
    parse(response) {
        this.dispatch('parse:parsing', {
            request: this,
            response: response,
        });
        if (response.status != 204) {
            this.responseData = response.data;
        }
        this.dispatch('parse', {
            request: this,
            response: response,
        });
    }
    afterParse(response) {
        var _a, _b;
        if (response.status >= 400 && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.status)) {
            const message = ((_b = response.data) === null || _b === void 0 ? void 0 : _b.message) || response.data || '';
            throw new RequestError_js_1.default(response.status, message);
        }
        this.dispatch('parse:after', {
            request: this,
            response: response,
        });
    }
    afterFetch(response) {
        this.dispatch('fetch', {
            request: this,
            response: response,
        });
        this.dispatch('fetch:after', {
            request: this,
            response: response,
        });
        this.loading = false;
    }
    afterAll(e) {
        var _a;
        if (e === undefined) {
            return;
        }
        const data = e.data;
        const status = e.status;
        const method = (((_a = e.config) === null || _a === void 0 ? void 0 : _a.method) || 'get').toLowerCase();
        this.status = status;
        this.dispatch('complete', {
            request: this,
            response: e,
        });
        this.dispatch('complete:' + method, {
            request: this,
            response: e,
        });
    }
    afterAllError(e) {
        var _a, _b;
        const data = e.message || 'Unknown error';
        const status = ((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) || 503;
        const method = (((_b = e.config) === null || _b === void 0 ? void 0 : _b.method) || 'get').toLowerCase();
        this.responseData = data;
        this.status = status;
        this.dispatch('error', {
            request: this,
            response: e,
        });
        this.dispatch('error:' + method, {
            request: this,
            response: e,
        });
    }
    afterAny() {
        this.dispatch('finish', { request: this });
    }
}
exports["default"] = Request;
Request.cachedResponses = new Cache_js_1.default();
//# sourceMappingURL=Request.js.map

/***/ }),

/***/ "../../build/esm/Http/RequestError.js":
/*!********************************************!*\
  !*** ../../build/esm/Http/RequestError.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class RequestError extends Error {
    constructor(status, text) {
        super(text);
        this.status = status;
        this.text = text;
    }
}
exports["default"] = RequestError;
//# sourceMappingURL=RequestError.js.map

/***/ }),

/***/ "../../build/esm/Model.js":
/*!********************************!*\
  !*** ../../build/esm/Model.js ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const ActiveRecord_js_1 = __webpack_require__(/*! ./ActiveRecord.js */ "../../build/esm/ActiveRecord.js");
class Model extends ActiveRecord_js_1.default {
    constructor(attributes = {}, options = {}) {
        super(options);
        this.relationshipCache = {};
        this.dataKey = undefined;
        this.set(attributes);
        this.setOptions(options);
    }
    static hydrate(attributes = {}, options = {}) {
        const model = new this(options);
        model.set(attributes);
        model.setOptions(options);
        return model;
    }
    get isModel() {
        return true;
    }
    set(attributes = {}) {
        let key;
        this.dispatch('set:before', { attributes });
        super.set(attributes, {}, false);
        if (this.dataKey && this.attributes[this.dataKey] && this.attributes[this.dataKey].length) {
            console.warn([
                'This model is incorrectly receiving data meant for a collection.',
                'We found an array on key: ',
                this.dataKey,
            ].join(' '), this);
        }
        for (key in attributes) {
            if (this.relationshipCache[key]) {
                this.relationshipCache[key].set(attributes[key]);
            }
        }
        this.dispatch('set', { attributes });
        return this;
    }
    fetch(options = {}, queryParams = {}) {
        const _super = Object.create(null, {
            fetch: { get: () => super.fetch }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.builder.identifier(options && options.id ? options.id : this.id);
            if (!(options && options.id) && !this.id) {
                console.warn('Fetching a model without an ID is likely incorrect behavior.', this, this.toJSON());
            }
            return yield _super.fetch.call(this, options, queryParams);
        });
    }
    hasOne(relationshipName, relationshipClass) {
        if (this.relationshipCache[relationshipName]) {
            return this.relationshipCache[relationshipName];
        }
        let content = this.getRelationship(relationshipName) || {};
        let model = new relationshipClass(content);
        model.parent = this;
        if (!model.id) {
            const camelRelationship = `${relationshipName}_id`;
            const underscoreRelationship = camelRelationship.replace(/[A-Z]/g, (x) => '_' + x.toLowerCase());
            const relationshipId = this.attr(camelRelationship) || this.attr(underscoreRelationship) || '';
            model.setId(relationshipId);
        }
        if (Model.useDescendingRelationships) {
            model.useModifiedEndpoint(this);
        }
        return (this.relationshipCache[relationshipName] = model);
    }
    hasMany(relationshipName, relationshipClass) {
        if (this.relationshipCache[relationshipName]) {
            return this.relationshipCache[relationshipName];
        }
        const dataKey = new relationshipClass().dataKey;
        const content = this.getRelationship(relationshipName);
        const collection = relationshipClass.hydrate((dataKey && content ? content[dataKey] : null) || content);
        collection.parent = this;
        if (Model.useDescendingRelationships) {
            collection.useModifiedEndpoint(this);
        }
        return (this.relationshipCache[relationshipName] = collection);
    }
    getRelationship(relationshipName) {
        if (Model.relationshipKey === null) {
            return this.attr(relationshipName);
        }
        else {
            return (this.attr(Model.relationshipKey) || {})[relationshipName];
        }
    }
}
exports["default"] = Model;
Model.relationshipKey = null;
Model.useDescendingRelationships = true;
//# sourceMappingURL=Model.js.map

/***/ }),

/***/ "../../build/esm/index.js":
/*!********************************!*\
  !*** ../../build/esm/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Request = exports.Model = exports.DispatcherEvent = exports.Dispatcher = exports.Core = exports.Collection = exports.Cache = exports.ActiveRecord = void 0;
var ActiveRecord_js_1 = __webpack_require__(/*! ./ActiveRecord.js */ "../../build/esm/ActiveRecord.js");
Object.defineProperty(exports, "ActiveRecord", ({ enumerable: true, get: function () { return ActiveRecord_js_1.default; } }));
var Cache_js_1 = __webpack_require__(/*! ./Cache.js */ "../../build/esm/Cache.js");
Object.defineProperty(exports, "Cache", ({ enumerable: true, get: function () { return Cache_js_1.default; } }));
var Collection_js_1 = __webpack_require__(/*! ./Collection.js */ "../../build/esm/Collection.js");
Object.defineProperty(exports, "Collection", ({ enumerable: true, get: function () { return Collection_js_1.default; } }));
var Core_js_1 = __webpack_require__(/*! ./Core.js */ "../../build/esm/Core.js");
Object.defineProperty(exports, "Core", ({ enumerable: true, get: function () { return Core_js_1.default; } }));
var Dispatcher_js_1 = __webpack_require__(/*! ./Dispatcher/Dispatcher.js */ "../../build/esm/Dispatcher/Dispatcher.js");
Object.defineProperty(exports, "Dispatcher", ({ enumerable: true, get: function () { return Dispatcher_js_1.default; } }));
var DispatcherEvent_js_1 = __webpack_require__(/*! ./Dispatcher/DispatcherEvent.js */ "../../build/esm/Dispatcher/DispatcherEvent.js");
Object.defineProperty(exports, "DispatcherEvent", ({ enumerable: true, get: function () { return DispatcherEvent_js_1.default; } }));
var Model_js_1 = __webpack_require__(/*! ./Model.js */ "../../build/esm/Model.js");
Object.defineProperty(exports, "Model", ({ enumerable: true, get: function () { return Model_js_1.default; } }));
var Request_js_1 = __webpack_require__(/*! ./Http/Request.js */ "../../build/esm/Http/Request.js");
Object.defineProperty(exports, "Request", ({ enumerable: true, get: function () { return Request_js_1.default; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./src/Collection/Core.ts":
/*!********************************!*\
  !*** ./src/Collection/Core.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const restmc_1 = __webpack_require__(/*! restmc */ "../../build/esm/index.js");
class CollectionCore extends restmc_1.Collection {
    baseUrl = 'https://api.chalkysticks.com/v1';
}
exports["default"] = CollectionCore;


/***/ }),

/***/ "./src/Collection/Venue.ts":
/*!*********************************!*\
  !*** ./src/Collection/Venue.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Core_1 = __importDefault(__webpack_require__(/*! ./Core */ "./src/Collection/Core.ts"));
const Venue_1 = __importDefault(__webpack_require__(/*! ../Model/Venue */ "./src/Model/Venue.ts"));
class CollectionVenue extends Core_1.default {
    endpoint = 'venues';
    model = new Venue_1.default();
    async beforeFetch() {
        console.log('Set the token here');
    }
}
exports["default"] = CollectionVenue;


/***/ }),

/***/ "./src/Model/Core.ts":
/*!***************************!*\
  !*** ./src/Model/Core.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const restmc_1 = __webpack_require__(/*! restmc */ "../../build/esm/index.js");
class ModelCore extends restmc_1.Model {
    baseUrl = 'https://api.chalkysticks.com/v1';
}
exports["default"] = ModelCore;


/***/ }),

/***/ "./src/Model/Venue.ts":
/*!****************************!*\
  !*** ./src/Model/Venue.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Core_1 = __importDefault(__webpack_require__(/*! ./Core */ "./src/Model/Core.ts"));
class ModelVenue extends Core_1.default {
    endpoint = 'venues';
    getAddress() {
        return this.attr('address');
    }
    getName() {
        return this.attr('name');
    }
    getWebsite() {
        return this.attr('website');
    }
}
exports["default"] = ModelVenue;


/***/ }),

/***/ "./src/api-response.ts":
/*!*****************************!*\
  !*** ./src/api-response.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = {
    data: [
        {
            id: 1,
            created_at: '2016-02-10 17:34:40',
            name: 'Parlour',
            slug: 'parlour',
            status: 101,
            address: '250 W 86th St, New York, NY 10024, USA',
            city: 'New York',
            state: 'NY',
            country: 'US',
            zip: 10024,
            distance: null,
            type: 'bar',
            phone: '(212) 580-8923',
            phone_formatted: '(212) 580-8923',
            lat: 40.788383,
            lon: -73.977198,
            description: '',
            website: 'http://www.theparlour.com',
            notes: '',
            details: {
                data: [
                    {
                        id: 7095,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                    {
                        id: 7096,
                        group: 'details',
                        key: 'has-league',
                        value: 'Has League',
                    },
                    {
                        id: 7097,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 11,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/parlour-brian.jpg',
                        created_at: '2016-02-03 02:56:26',
                        updated_at: '2016-02-03 02:56:26',
                    },
                    {
                        id: 1055,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-1-1576-lg.jpg',
                        created_at: '2016-02-29 23:05:13',
                        updated_at: '2016-02-29 23:05:13',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 19,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.theparlour.com',
                    },
                ],
            },
        },
        {
            id: 2,
            created_at: '2016-02-10 17:34:40',
            name: 'Superfine',
            slug: 'superfine',
            status: 101,
            address: '126 Front St, Brooklyn, NY 11201, USA',
            city: 'Brooklyn',
            state: 'NY',
            country: 'US',
            zip: 11201,
            distance: null,
            type: 'bar',
            phone: '(646) 902-5859',
            phone_formatted: '(646) 902-5859',
            lat: 40.702237,
            lon: -73.987415,
            description: '',
            website: 'http://superfine.nyc',
            notes: '',
            details: {
                data: [
                    {
                        id: 24,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                    {
                        id: 25,
                        group: 'details',
                        key: '8-foot-table',
                        value: "8' Table",
                    },
                    {
                        id: 26,
                        group: 'details',
                        key: 'free-table',
                        value: 'Free Table',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 3,
                        type: 'image',
                        url: 'http://s3-media2.fl.yelpcdn.com/bphoto/MUZ_V8vO40rvw-4M8_mkkA/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                    {
                        id: 4,
                        type: 'image',
                        url: 'http://s3-media4.fl.yelpcdn.com/bphoto/N3bsGWlrUrbra7M_9Vt03Q/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                    {
                        id: 1081,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-2-347-lg.jpg',
                        created_at: '2016-03-01 07:57:48',
                        updated_at: '2016-03-01 07:57:48',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 23,
                        group: 'basic',
                        key: 'website',
                        value: 'http://superfine.nyc',
                    },
                ],
            },
        },
        {
            id: 3,
            created_at: '2016-02-10 17:34:40',
            name: 'Eastside Billiards',
            slug: 'eastside-billiards',
            status: 101,
            address: '163 E 86th St, New York, NY 10028, USA',
            city: 'New York',
            state: 'NY',
            country: 'US',
            zip: 10028,
            distance: null,
            type: 'hall',
            phone: '(212) 831-7665',
            phone_formatted: '(212) 831-7665',
            lat: 40.779365,
            lon: -73.954581,
            description: '',
            website: 'http://eastsidebilliards.com',
            notes: '',
            details: {
                data: [
                    {
                        id: 28,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                    {
                        id: 29,
                        group: 'details',
                        key: '7-foot-table',
                        value: "7' Table",
                    },
                    {
                        id: 30,
                        group: 'details',
                        key: 'ping-pong',
                        value: 'Ping Pong',
                    },
                    {
                        id: 31,
                        group: 'details',
                        key: 'gambling',
                        value: 'Gambling',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 5,
                        type: 'image',
                        url: 'http://s3-media1.fl.yelpcdn.com/bphoto/U2kYZvoY6RGPmppwylKYwg/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                    {
                        id: 6,
                        type: 'image',
                        url: 'http://s3-media3.fl.yelpcdn.com/bphoto/uKxiZOshELPhUbIWfZHKRA/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                    {
                        id: 17,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/3749-1524854784o-1.jpg',
                        created_at: '2016-02-03 03:10:59',
                        updated_at: '2016-02-03 03:10:59',
                    },
                    {
                        id: 18,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/419-1524847965o-2.jpg',
                        created_at: '2016-02-03 03:11:05',
                        updated_at: '2016-02-03 03:11:05',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 27,
                        group: 'basic',
                        key: 'website',
                        value: 'http://eastsidebilliards.com',
                    },
                ],
            },
        },
        {
            id: 4,
            created_at: '2018-08-08 17:00:10',
            name: 'Amsterdam Billiards',
            slug: 'amsterdam-billiards',
            status: 101,
            address: '110 E 11th St, New York, NY 10003, USA',
            city: 'New York',
            state: 'NY',
            country: 'US',
            zip: 10003,
            distance: null,
            type: 'hall',
            phone: '(212) 995-0333',
            phone_formatted: '(212) 995-0333',
            lat: 40.731709,
            lon: -73.989942,
            description: '',
            website: 'http://amsterdambilliards.com',
            notes: '',
            details: {
                data: [
                    {
                        id: 927,
                        group: 'details',
                        key: 'has-league',
                        value: 'Has League',
                    },
                    {
                        id: 928,
                        group: 'details',
                        key: '7-foot-table',
                        value: "7' Table",
                    },
                    {
                        id: 929,
                        group: 'details',
                        key: '8-foot-table',
                        value: "8' Table",
                    },
                    {
                        id: 930,
                        group: 'details',
                        key: '9-foot-table',
                        value: "9' Table",
                    },
                    {
                        id: 931,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                    {
                        id: 932,
                        group: 'details',
                        key: 'tournaments',
                        value: 'Hosts Tournaments',
                    },
                    {
                        id: 933,
                        group: 'details',
                        key: 'gambling',
                        value: 'Gambling',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 7,
                        type: 'image',
                        url: 'http://s3-media1.fl.yelpcdn.com/bphoto/ZSNxKE7O6YS--BYfHeek-Q/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                    {
                        id: 8,
                        type: 'image',
                        url: 'http://s3-media4.fl.yelpcdn.com/bphoto/w251WelnNUptW_lb7Vnhzg/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                    {
                        id: 6668,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-4-4742-lg.jpeg',
                        created_at: '2018-08-08 17:00:10',
                        updated_at: '2018-08-08 17:00:10',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 32,
                        group: 'basic',
                        key: 'website',
                        value: 'http://amsterdambilliards.com',
                    },
                ],
            },
        },
        {
            id: 5,
            created_at: '2016-02-10 17:34:40',
            name: 'American Trash',
            slug: 'american-trash',
            status: 101,
            address: '1471 1st Avenue, New York, NY 10075, USA',
            city: 'New York',
            state: 'NY',
            country: 'US',
            zip: 10075,
            distance: null,
            type: 'bar',
            phone: '(212) 988-9008',
            phone_formatted: '(212) 988-9008',
            lat: 40.770903,
            lon: -73.954067,
            description: '',
            website: 'http://americantrashnyc.com',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 9,
                        type: 'image',
                        url: 'http://s3-media1.fl.yelpcdn.com/bphoto/5pSwUDywt8A2b22z2ksIxA/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                    {
                        id: 10,
                        type: 'image',
                        url: 'http://s3-media1.fl.yelpcdn.com/bphoto/D60_lBGa_zKc6Nx-3sCmyg/o.jpg',
                        created_at: '2016-02-02 02:02:26',
                        updated_at: '-0001-11-30 00:00:00',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 33,
                        group: 'basic',
                        key: 'website',
                        value: 'http://americantrashnyc.com',
                    },
                ],
            },
        },
        {
            id: 6,
            created_at: '2016-02-10 17:34:40',
            name: "Breaker's Sports Bar",
            slug: 'breaker-s-sports-bar',
            status: 101,
            address: '1874 S Clack St, Abilene, TX 79605, USA',
            city: 'Abilene',
            state: 'TX',
            country: 'US',
            zip: 79605,
            distance: null,
            type: 'bar',
            phone: '3256922980',
            phone_formatted: '(325) 692-2980',
            lat: 32.426348,
            lon: -99.78848,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 55,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/7746-1366728221o.jpg',
                        created_at: '2016-02-04 23:06:26',
                        updated_at: '2016-02-04 23:06:26',
                    },
                    {
                        id: 56,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/1652-1366718025o-1.jpg',
                        created_at: '2016-02-04 23:06:35',
                        updated_at: '2016-02-04 23:06:35',
                    },
                    {
                        id: 57,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/4965-1366709949o-2.jpg',
                        created_at: '2016-02-04 23:06:45',
                        updated_at: '2016-02-04 23:06:45',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 7,
            created_at: '2016-03-21 21:45:36',
            name: 'Jack Rabbit Slims',
            slug: 'jack-rabbit-slims',
            status: 101,
            address: '833 US Hwy 80 E  Abilene, TX 79601',
            city: 'Abilene',
            state: 'TX',
            country: '',
            zip: 79601,
            distance: null,
            type: 'bar',
            phone: '3256775225',
            phone_formatted: '(325) 677-5225',
            lat: 32.448059,
            lon: -99.710365,
            description: '',
            website: 'http://jackrabbitslimsabilene.com/',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1483,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-7-8655-lg.jpg',
                        created_at: '2016-03-21 21:45:29',
                        updated_at: '2016-03-21 21:45:29',
                    },
                    {
                        id: 1484,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-7-1894-lg.jpg',
                        created_at: '2016-03-21 21:45:36',
                        updated_at: '2016-03-21 21:45:36',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2159,
                        group: 'basic',
                        key: 'website',
                        value: 'http://jackrabbitslimsabilene.com/',
                    },
                ],
            },
        },
        {
            id: 10,
            created_at: '2016-03-21 21:50:39',
            name: 'Guitars & Cadillacs',
            slug: 'guitars-cadillacs',
            status: 101,
            address: '3881 Vine St, Abilene, TX 79602, USA',
            city: 'Abilene',
            state: 'TX',
            country: 'US',
            zip: 79602,
            distance: null,
            type: 'bar',
            phone: '3256928077',
            phone_formatted: '(325) 692-8077',
            lat: 32.406463,
            lon: -99.744159,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1485,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-10-5260-lg.jpg',
                        created_at: '2016-03-21 21:50:39',
                        updated_at: '2016-03-21 21:50:39',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 13,
            created_at: '2016-03-04 17:35:25',
            name: 'Slix Billiards',
            slug: 'slix-billiards',
            status: 101,
            address: '3422 N 1st St, Abilene, TX 79603, USA',
            city: 'Abilene',
            state: 'TX',
            country: 'US',
            zip: 79603,
            distance: null,
            type: 'hall',
            phone: '3256735789',
            phone_formatted: '(325) 673-5789',
            lat: 32.452146,
            lon: -99.765183,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 253,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-13-1544-lg.jpg',
                        created_at: '2016-02-10 20:49:18',
                        updated_at: '2016-02-10 20:49:18',
                    },
                    {
                        id: 254,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-13-5040-lg.jpg',
                        created_at: '2016-02-10 20:49:22',
                        updated_at: '2016-02-10 20:49:22',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 118,
                        group: 'basic',
                        key: 'website',
                        value: '',
                    },
                ],
            },
        },
        {
            id: 14,
            created_at: '2016-03-21 21:53:50',
            name: 'The Bar-B-Que Barn',
            slug: 'the-bar-b-que-barn',
            status: 101,
            address: '602 Houston St, Buffalo Gap, TX 79508, USA',
            city: 'Buffalo Gap',
            state: 'TX',
            country: 'US',
            zip: 79508,
            distance: null,
            type: 'bar',
            phone: '3255723552',
            phone_formatted: '(325) 572-3552',
            lat: 32.275055,
            lon: -99.828203,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1486,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-14-5811-lg.jpg',
                        created_at: '2016-03-21 21:53:41',
                        updated_at: '2016-03-21 21:53:41',
                    },
                    {
                        id: 1487,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-14-1125-lg.png',
                        created_at: '2016-03-21 21:53:50',
                        updated_at: '2016-03-21 21:53:50',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 21,
            created_at: '2016-03-21 21:59:51',
            name: "Johnny J's",
            slug: 'johnny-j-s',
            status: 101,
            address: '2891 E Waterloo Rd, Akron, OH 44312, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44312,
            distance: null,
            type: 'bar',
            phone: '',
            phone_formatted: '',
            lat: 41.032165,
            lon: -81.423936,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [
                    {
                        id: 2161,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1488,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-21-1659-lg.jpg',
                        created_at: '2016-03-21 21:59:51',
                        updated_at: '2016-03-21 21:59:51',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2160,
                        group: 'basic',
                        key: 'website',
                        value: '',
                    },
                ],
            },
        },
        {
            id: 22,
            created_at: '2016-03-21 22:03:11',
            name: "Brubaker's Pub",
            slug: 'brubaker-s-pub',
            status: 101,
            address: '357 S Main St, Akron, OH 44311, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44311,
            distance: null,
            type: 'bar',
            phone: '3302537160',
            phone_formatted: '(330) 253-7160',
            lat: 41.076115,
            lon: -81.522399,
            description: '',
            website: 'https://www.facebook.com/BrubakersPub77',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1489,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-22-7315-lg.png',
                        created_at: '2016-03-21 22:02:35',
                        updated_at: '2016-03-21 22:02:35',
                    },
                    {
                        id: 1490,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-22-5899-lg.jpg',
                        created_at: '2016-03-21 22:03:11',
                        updated_at: '2016-03-21 22:03:11',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2162,
                        group: 'basic',
                        key: 'website',
                        value: 'https://www.facebook.com/BrubakersPub77',
                    },
                ],
            },
        },
        {
            id: 23,
            created_at: '2016-03-21 22:04:17',
            name: "Arnie's SRO",
            slug: 'arnie-s-sro',
            status: 101,
            address: '1682 W Market St, Akron, OH 44313, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44313,
            distance: null,
            type: 'bar',
            phone: '3308670154',
            phone_formatted: '(330) 867-0154',
            lat: 41.109273,
            lon: -81.570023,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1491,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-23-3928-lg.jpg',
                        created_at: '2016-03-21 22:04:17',
                        updated_at: '2016-03-21 22:04:17',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 24,
            created_at: '2016-03-21 22:06:14',
            name: "J. Dublin's Pour House",
            slug: 'j-dublin-s-pour-house',
            status: 101,
            address: '1954 Buchholzer Blvd, Akron, OH 44310, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44310,
            distance: null,
            type: 'bar',
            phone: '3306333000',
            phone_formatted: '(330) 633-3000',
            lat: 41.115914,
            lon: -81.471404,
            description: '',
            website: 'http://www.jdublins.com',
            notes: '',
            details: {
                data: [
                    {
                        id: 2164,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1492,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-24-1366-lg.jpg',
                        created_at: '2016-03-21 22:06:14',
                        updated_at: '2016-03-21 22:06:14',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2163,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.jdublins.com',
                    },
                ],
            },
        },
        {
            id: 25,
            created_at: '2016-03-21 22:08:36',
            name: 'Gone Country Bar',
            slug: 'gone-country-bar',
            status: 101,
            address: '370 Paul Williams St, Akron, OH 44311, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44311,
            distance: null,
            type: 'bar',
            phone: '3303890640',
            phone_formatted: '(330) 389-0640',
            lat: 41.076165,
            lon: -81.52327,
            description: '',
            website: 'https://www.facebook.com/akrongonecountrybar',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1493,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-25-5754-lg.png',
                        created_at: '2016-03-21 22:08:36',
                        updated_at: '2016-03-21 22:08:36',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2165,
                        group: 'basic',
                        key: 'website',
                        value: 'https://www.facebook.com/akrongonecountrybar',
                    },
                ],
            },
        },
        {
            id: 28,
            created_at: '2016-03-21 22:12:46',
            name: 'Fire & Ice Bar & Grill',
            slug: 'fire-ice-bar-grill',
            status: 101,
            address: '1941 Triplett Blvd, Akron, OH 44312, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44312,
            distance: null,
            type: 'bar',
            phone: '2346786172',
            phone_formatted: '(234) 678-6172',
            lat: 41.043797,
            lon: -81.457632,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [
                    {
                        id: 2167,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1494,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-28-6618-lg.png',
                        created_at: '2016-03-21 22:12:37',
                        updated_at: '2016-03-21 22:12:37',
                    },
                    {
                        id: 1495,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-28-7145-lg.png',
                        created_at: '2016-03-21 22:12:46',
                        updated_at: '2016-03-21 22:12:46',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2166,
                        group: 'basic',
                        key: 'website',
                        value: '',
                    },
                ],
            },
        },
        {
            id: 29,
            created_at: '2016-02-10 20:51:31',
            name: "Bill White's Akron Lanes (bowling)",
            slug: 'bill-white-s-akron-lanes-bowling-',
            status: 101,
            address: '2911 E Waterloo Rd, Akron, OH 44312, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44312,
            distance: null,
            type: 'hall',
            phone: '3306284822',
            phone_formatted: '(330) 628-4822',
            lat: 41.032106,
            lon: -81.422792,
            description: '',
            website: 'http://akronlanes.com/bowling/',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 255,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-29-1590-lg.jpg',
                        created_at: '2016-02-10 20:51:36',
                        updated_at: '2016-02-10 20:51:36',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 119,
                        group: 'basic',
                        key: 'website',
                        value: 'http://akronlanes.com/bowling/',
                    },
                ],
            },
        },
        {
            id: 31,
            created_at: '2016-03-21 22:14:44',
            name: 'Clubhouse Sports Bar & Grill',
            slug: 'clubhouse-sports-bar-grill',
            status: 101,
            address: '2970 6th St, Cuyahoga Falls, OH 44221, USA',
            city: 'Cuyahoga Falls',
            state: 'OH',
            country: 'US',
            zip: 44221,
            distance: null,
            type: 'bar',
            phone: '3309283837',
            phone_formatted: '(330) 928-3837',
            lat: 41.152447,
            lon: -81.490156,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1496,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-31-8881-lg.jpg',
                        created_at: '2016-03-21 22:14:44',
                        updated_at: '2016-03-21 22:14:44',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 33,
            created_at: '2016-02-10 20:54:07',
            name: "Max McQ's",
            slug: 'max-mcq-s',
            status: 101,
            address: '1562 Akron Peninsula Rd, Akron, OH 44313, USA',
            city: 'Akron',
            state: 'OH',
            country: 'US',
            zip: 44313,
            distance: null,
            type: 'bar',
            phone: '3309403400',
            phone_formatted: '(330) 940-3400',
            lat: 41.137113,
            lon: -81.548506,
            description: '',
            website: 'http://maxmcqs.com',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 256,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-33-6385-lg.jpg',
                        created_at: '2016-02-10 20:53:47',
                        updated_at: '2016-02-10 20:53:47',
                    },
                    {
                        id: 257,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-33-8295-lg.jpg',
                        created_at: '2016-02-10 20:53:52',
                        updated_at: '2016-02-10 20:53:52',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 120,
                        group: 'basic',
                        key: 'website',
                        value: 'http://maxmcqs.com',
                    },
                ],
            },
        },
        {
            id: 37,
            created_at: '2018-01-02 20:37:46',
            name: 'Cafe Hollywood',
            slug: 'cafe-hollywood',
            status: 101,
            address: '275 Lark St, Albany, NY 12210, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12210,
            distance: null,
            type: 'bar',
            phone: '5184729043',
            phone_formatted: '(518) 472-9043',
            lat: 42.653601,
            lon: -73.766767,
            description: '',
            website: 'http://cafehollywoodonlark.com/',
            notes: '',
            details: {
                data: [
                    {
                        id: 7815,
                        group: 'details',
                        key: '7-foot-table',
                        value: "7' Table",
                    },
                    {
                        id: 7816,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 166,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/5424-1292015005o.jpg',
                        created_at: '2016-02-05 19:51:39',
                        updated_at: '2016-02-05 19:51:39',
                    },
                    {
                        id: 6610,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-37-5855-lg.jpeg',
                        created_at: '2018-01-02 20:37:46',
                        updated_at: '2018-01-02 20:37:46',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 50,
                        group: 'basic',
                        key: 'website',
                        value: 'http://cafehollywoodonlark.com/',
                    },
                ],
            },
        },
        {
            id: 38,
            created_at: '2016-02-10 17:34:40',
            name: 'Thatcher St Pub',
            slug: 'thatcher-st-pub',
            status: 101,
            address: '16 Thacher St, Albany, NY 12207, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12207,
            distance: null,
            type: 'bar',
            phone: '5184639214',
            phone_formatted: '(518) 463-9214',
            lat: 42.661303,
            lon: -73.742973,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 169,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/4575-1291828737o.jpg',
                        created_at: '2016-02-05 19:54:44',
                        updated_at: '2016-02-05 19:54:44',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 39,
            created_at: '2016-08-04 14:51:08',
            name: "Bootlegger's On Broadway",
            slug: 'bootlegger-s-on-broadway',
            status: 101,
            address: '200 Broadway, Troy, NY 12180, USA',
            city: 'Troy',
            state: 'NY',
            country: 'US',
            zip: 12180,
            distance: null,
            type: 'bar',
            phone: '5188744475',
            phone_formatted: '(518) 874-4475',
            lat: 42.731624,
            lon: -73.691122,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [
                    {
                        id: 6478,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                    {
                        id: 6479,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 5504,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-39-6961-lg.jpeg',
                        created_at: '2016-08-04 14:51:07',
                        updated_at: '2016-08-04 14:51:07',
                    },
                    {
                        id: 5505,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-39-1874-lg.jpeg',
                        created_at: '2016-08-04 14:51:08',
                        updated_at: '2016-08-04 14:51:08',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 40,
            created_at: '2016-02-10 17:34:40',
            name: 'Hill Street Cafe',
            slug: 'hill-street-cafe',
            status: 101,
            address: '180 Madison Ave, Albany, NY 12202, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12202,
            distance: null,
            type: 'bar',
            phone: '5184623544',
            phone_formatted: '(518) 462-3544',
            lat: 42.646654,
            lon: -73.758057,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 162,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/2730-1292191525o.jpg',
                        created_at: '2016-02-05 19:48:42',
                        updated_at: '2016-02-05 19:48:42',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 41,
            created_at: '2016-02-10 17:34:40',
            name: 'Diamond Eight Billiards',
            slug: 'diamond-eight-billiards',
            status: 101,
            address: '9 Johnson Rd  Latham, NY 12110',
            city: 'Latham',
            state: 'NY',
            country: '',
            zip: 12110,
            distance: null,
            type: 'hall',
            phone: '5187868048',
            phone_formatted: '(518) 786-8048',
            lat: 42.762647,
            lon: -73.748802,
            description: '',
            website: 'http://diamondeight.com',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 258,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-41-533-lg.png',
                        created_at: '2016-02-10 20:55:52',
                        updated_at: '2016-02-10 20:55:52',
                    },
                    {
                        id: 259,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-41-3742-lg.jpg',
                        created_at: '2016-02-10 20:55:58',
                        updated_at: '2016-02-10 20:55:58',
                    },
                    {
                        id: 260,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-41-9953-lg.png',
                        created_at: '2016-02-10 20:56:20',
                        updated_at: '2016-02-10 20:56:20',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 121,
                        group: 'basic',
                        key: 'website',
                        value: 'http://diamondeight.com',
                    },
                ],
            },
        },
        {
            id: 42,
            created_at: '2018-01-02 20:36:37',
            name: 'Lionheart Pub',
            slug: 'lionheart-pub',
            status: 101,
            address: '448 Madison Ave, Albany, NY 12208, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12208,
            distance: null,
            type: 'bar',
            phone: '5184369530',
            phone_formatted: '(518) 436-9530',
            lat: 42.652522,
            lon: -73.768443,
            description: '',
            website: 'https://www.facebook.com/TheLionheartPubAlbany',
            notes: '',
            details: {
                data: [
                    {
                        id: 7814,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1497,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-42-1917-lg.jpg',
                        created_at: '2016-03-21 22:22:03',
                        updated_at: '2016-03-21 22:22:03',
                    },
                    {
                        id: 6608,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-42-40-lg.jpeg',
                        created_at: '2018-01-02 20:36:30',
                        updated_at: '2018-01-02 20:36:30',
                    },
                    {
                        id: 6609,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-42-1340-lg.jpeg',
                        created_at: '2018-01-02 20:36:37',
                        updated_at: '2018-01-02 20:36:37',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2168,
                        group: 'basic',
                        key: 'website',
                        value: 'https://www.facebook.com/TheLionheartPubAlbany',
                    },
                ],
            },
        },
        {
            id: 43,
            created_at: '2016-02-10 17:34:40',
            name: 'Oh Bar',
            slug: 'oh-bar',
            status: 101,
            address: '304 Lark St, Albany, NY 12210, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12210,
            distance: null,
            type: 'bar',
            phone: '5184639004',
            phone_formatted: '(518) 463-9004',
            lat: 42.65259,
            lon: -73.767317,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 167,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/3404-1291956386o.png',
                        created_at: '2016-02-05 19:52:37',
                        updated_at: '2016-02-05 19:52:37',
                    },
                    {
                        id: 168,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/9010-1291951048o.jpg',
                        created_at: '2016-02-05 19:52:42',
                        updated_at: '2016-02-05 19:52:42',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 44,
            created_at: '2016-03-21 22:24:21',
            name: 'The Hollow Bar + Kitchen',
            slug: 'the-hollow-bar-kitchen',
            status: 101,
            address: '79 N Pearl St, Albany, NY 12207, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12207,
            distance: null,
            type: 'bar',
            phone: '5184268550',
            phone_formatted: '(518) 426-8550',
            lat: 42.652367,
            lon: -73.750661,
            description: '',
            website: 'http://www.thehollowalbany.com',
            notes: '',
            details: {
                data: [
                    {
                        id: 2171,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1498,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-44-5333-lg.jpg',
                        created_at: '2016-03-21 22:24:21',
                        updated_at: '2016-03-21 22:24:21',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2170,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.thehollowalbany.com',
                    },
                ],
            },
        },
        {
            id: 46,
            created_at: '2016-02-10 17:34:40',
            name: 'Palais Royale',
            slug: 'palais-royale',
            status: 101,
            address: '164 Jefferson St, Albany, NY 12210, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12210,
            distance: null,
            type: 'bar',
            phone: '5184321970',
            phone_formatted: '(518) 432-1970',
            lat: 42.650504,
            lon: -73.76583,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 163,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/9455-1292102281o-1.jpg',
                        created_at: '2016-02-05 19:50:11',
                        updated_at: '2016-02-05 19:50:11',
                    },
                    {
                        id: 164,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/6757-1292097792o.jpg',
                        created_at: '2016-02-05 19:50:15',
                        updated_at: '2016-02-05 19:50:15',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 48,
            created_at: '2016-03-21 22:25:55',
            name: 'Ye Olde Tavern Sports Bar',
            slug: 'ye-olde-tavern-sports-bar',
            status: 101,
            address: '38 Jeanette St, Albany, NY 12209, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12209,
            distance: null,
            type: 'bar',
            phone: '',
            phone_formatted: '',
            lat: 42.640892,
            lon: -73.781118,
            description: '',
            website: 'https://www.facebook.com/YeOldeSportsBar',
            notes: '',
            details: {
                data: [
                    {
                        id: 2174,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1499,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-48-758-lg.jpg',
                        created_at: '2016-03-21 22:25:55',
                        updated_at: '2016-03-21 22:25:55',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2172,
                        group: 'basic',
                        key: 'website',
                        value: 'https://www.facebook.com/YeOldeSportsBar',
                    },
                ],
            },
        },
        {
            id: 50,
            created_at: '2016-03-21 22:27:45',
            name: 'Recovery Sports Grill',
            slug: 'recovery-sports-grill',
            status: 101,
            address: '241 Hoosick St, Troy, NY 12180, USA',
            city: 'Troy',
            state: 'NY',
            country: 'US',
            zip: 12180,
            distance: null,
            type: 'bar',
            phone: '5182721702',
            phone_formatted: '(518) 272-1702',
            lat: 42.739132,
            lon: -73.671537,
            description: '',
            website: 'http://recoverysportsgrill.com',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1500,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-50-6559-lg.jpg',
                        created_at: '2016-03-21 22:27:45',
                        updated_at: '2016-03-21 22:27:45',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2175,
                        group: 'basic',
                        key: 'website',
                        value: 'http://recoverysportsgrill.com',
                    },
                ],
            },
        },
        {
            id: 51,
            created_at: '2016-03-23 01:13:41',
            name: 'Elbo Room',
            slug: 'elbo-room',
            status: 101,
            address: '170 Delaware Ave, Albany, NY 12209, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12209,
            distance: null,
            type: 'bar',
            phone: '5182577300',
            phone_formatted: '(518) 257-7300',
            lat: 42.645257,
            lon: -73.771552,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1510,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-51-5620-lg.png',
                        created_at: '2016-03-23 01:13:41',
                        updated_at: '2016-03-23 01:13:41',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 53,
            created_at: '2016-02-10 17:34:40',
            name: "Iffy's Place",
            slug: 'iffy-s-place',
            status: 101,
            address: '234 Washington Ave, Albany, NY 12210, USA',
            city: 'Albany',
            state: 'NY',
            country: 'US',
            zip: 12210,
            distance: null,
            type: 'bar',
            phone: '',
            phone_formatted: '',
            lat: 42.657192,
            lon: -73.76458,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 165,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/2945-1292052896o.jpg',
                        created_at: '2016-02-05 19:51:01',
                        updated_at: '2016-02-05 19:51:01',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 56,
            created_at: '2016-03-23 01:07:15',
            name: 'My Place & Company-Schodack',
            slug: 'my-place-company-schodack',
            status: 101,
            address: '1640 Columbia Turnpike, Castleton-On-Hudson, NY 12033, USA',
            city: 'Castleton-On-Hudson',
            state: 'NY',
            country: 'US',
            zip: 12033,
            distance: null,
            type: 'bar',
            phone: '5184775555',
            phone_formatted: '(518) 477-5555',
            lat: 42.567089,
            lon: -73.684481,
            description: '',
            website: 'http://www.myplaceandcompany.com/',
            notes: '',
            details: {
                data: [
                    {
                        id: 2230,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1503,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-56-8707-lg.jpg',
                        created_at: '2016-03-23 01:07:10',
                        updated_at: '2016-03-23 01:07:10',
                    },
                    {
                        id: 1504,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-56-9251-lg.jpg',
                        created_at: '2016-03-23 01:07:15',
                        updated_at: '2016-03-23 01:07:15',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2229,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.myplaceandcompany.com/',
                    },
                ],
            },
        },
        {
            id: 57,
            created_at: '2016-03-23 01:09:43',
            name: 'La Cumbre Brewing Company',
            slug: 'la-cumbre-brewing-company',
            status: 101,
            address: '3313 Girard Blvd NE, Albuquerque, NM 87107, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87107,
            distance: null,
            type: 'bar',
            phone: '5058720225',
            phone_formatted: '(505) 872-0225',
            lat: 35.117807,
            lon: -106.614117,
            description: '',
            website: 'http://www.lacumbrebrewing.com',
            notes: '',
            details: {
                data: [
                    {
                        id: 2232,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                    {
                        id: 2233,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1505,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-57-976-lg.jpg',
                        created_at: '2016-03-23 01:09:39',
                        updated_at: '2016-03-23 01:09:39',
                    },
                    {
                        id: 1506,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-57-4481-lg.jpg',
                        created_at: '2016-03-23 01:09:43',
                        updated_at: '2016-03-23 01:09:43',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2231,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.lacumbrebrewing.com',
                    },
                ],
            },
        },
        {
            id: 59,
            created_at: '2016-03-23 01:12:39',
            name: "Billy's Long Bar",
            slug: 'billy-s-long-bar',
            status: 101,
            address: '4800 San Mateo Blvd NE, Albuquerque, NM 87109, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87109,
            distance: null,
            type: 'bar',
            phone: '5058890573',
            phone_formatted: '(505) 889-0573',
            lat: 35.136168,
            lon: -106.585852,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1507,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-59-9933-lg.jpg',
                        created_at: '2016-03-23 01:12:25',
                        updated_at: '2016-03-23 01:12:25',
                    },
                    {
                        id: 1508,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-59-9243-lg.jpg',
                        created_at: '2016-03-23 01:12:33',
                        updated_at: '2016-03-23 01:12:33',
                    },
                    {
                        id: 1509,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-59-9680-lg.jpg',
                        created_at: '2016-03-23 01:12:39',
                        updated_at: '2016-03-23 01:12:39',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 60,
            created_at: '2016-03-23 01:18:03',
            name: "Louie's Pub & Grill",
            slug: 'louie-s-pub-grill',
            status: 101,
            address: '5603 Menaul Blvd NE, Albuquerque, NM 87110, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87110,
            distance: null,
            type: 'bar',
            phone: '5058815333',
            phone_formatted: '(505) 881-5333',
            lat: 35.109188,
            lon: -106.581917,
            description: '',
            website: 'https://www.facebook.com/Louies-Pub-Grill-76273658863',
            notes: '',
            details: {
                data: [
                    {
                        id: 2235,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1511,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-60-3746-lg.jpg',
                        created_at: '2016-03-23 01:17:53',
                        updated_at: '2016-03-23 01:17:53',
                    },
                    {
                        id: 1512,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-60-8665-lg.jpg',
                        created_at: '2016-03-23 01:17:59',
                        updated_at: '2016-03-23 01:17:59',
                    },
                    {
                        id: 1513,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-60-1444-lg.jpg',
                        created_at: '2016-03-23 01:18:03',
                        updated_at: '2016-03-23 01:18:03',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2234,
                        group: 'basic',
                        key: 'website',
                        value: 'https://www.facebook.com/Louies-Pub-Grill-76273658863',
                    },
                ],
            },
        },
        {
            id: 61,
            created_at: '2016-03-23 01:19:30',
            name: 'Launchpad Night Club',
            slug: 'launchpad-night-club',
            status: 101,
            address: '618 Central Ave SW, Albuquerque, NM 87102, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87102,
            distance: null,
            type: 'bar',
            phone: '5057648887',
            phone_formatted: '(505) 764-8887',
            lat: 35.084667,
            lon: -106.654838,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1514,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-61-1567-lg.jpg',
                        created_at: '2016-03-23 01:19:30',
                        updated_at: '2016-03-23 01:19:30',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 62,
            created_at: '2016-03-23 01:20:36',
            name: 'Uptown Sports Bar',
            slug: 'uptown-sports-bar',
            status: 101,
            address: '6601 Uptown Blvd NE, Albuquerque, NM 87110, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87110,
            distance: null,
            type: 'bar',
            phone: '5058844714',
            phone_formatted: '(505) 884-4714',
            lat: 35.10377,
            lon: -106.570741,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1515,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-62-833-lg.jpg',
                        created_at: '2016-03-23 01:20:31',
                        updated_at: '2016-03-23 01:20:31',
                    },
                    {
                        id: 1516,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-62-8843-lg.jpg',
                        created_at: '2016-03-23 01:20:36',
                        updated_at: '2016-03-23 01:20:36',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 63,
            created_at: '2016-03-23 01:23:28',
            name: 'The Dirty Bourbon Dance Hall and Saloon',
            slug: 'the-dirty-bourbon-dance-hall-and-saloon',
            status: 101,
            address: '9800 Montgomery Blvd NE, Albuquerque, NM 87111, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87111,
            distance: null,
            type: 'bar',
            phone: '5052962726',
            phone_formatted: '(505) 296-2726',
            lat: 35.129813,
            lon: -106.532287,
            description: '',
            website: 'http://thedirtybourbon.com/',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1517,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-63-131-lg.jpg',
                        created_at: '2016-03-23 01:23:10',
                        updated_at: '2016-03-23 01:23:10',
                    },
                    {
                        id: 1518,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-63-2882-lg.png',
                        created_at: '2016-03-23 01:23:20',
                        updated_at: '2016-03-23 01:23:20',
                    },
                    {
                        id: 1519,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-63-1403-lg.png',
                        created_at: '2016-03-23 01:23:28',
                        updated_at: '2016-03-23 01:23:28',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2236,
                        group: 'basic',
                        key: 'website',
                        value: 'http://thedirtybourbon.com/',
                    },
                ],
            },
        },
        {
            id: 64,
            created_at: '2016-03-23 01:25:42',
            name: 'Fox & Hound Pub & Grill',
            slug: 'fox-hound-pub-grill',
            status: 101,
            address: '4301 The 25 Way NE, Albuquerque, NM 87109, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87109,
            distance: null,
            type: 'bar',
            phone: '5053449430',
            phone_formatted: '(505) 344-9430',
            lat: 35.144851,
            lon: -106.596298,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1520,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-64-2387-lg.jpg',
                        created_at: '2016-03-23 01:25:42',
                        updated_at: '2016-03-23 01:25:42',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 65,
            created_at: '2016-03-23 01:27:21',
            name: 'The Copper Lounge',
            slug: 'the-copper-lounge',
            status: 101,
            address: '1504 Central Ave SE, Albuquerque, NM 87106, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87106,
            distance: null,
            type: 'bar',
            phone: '5052427490',
            phone_formatted: '(505) 242-7490',
            lat: 35.081518,
            lon: -106.630001,
            description: '',
            website: 'http://www.thecopperlounge.com/',
            notes: '',
            details: {
                data: [
                    {
                        id: 2238,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1521,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-65-204-lg.jpg',
                        created_at: '2016-03-23 01:27:16',
                        updated_at: '2016-03-23 01:27:16',
                    },
                    {
                        id: 1522,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-65-7139-lg.jpg',
                        created_at: '2016-03-23 01:27:21',
                        updated_at: '2016-03-23 01:27:21',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2237,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.thecopperlounge.com/',
                    },
                ],
            },
        },
        {
            id: 69,
            created_at: '2016-03-23 01:31:25',
            name: 'Downtown Distillery',
            slug: 'downtown-distillery',
            status: 101,
            address: '406 Central Ave SW, Albuquerque, NM 87102, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87102,
            distance: null,
            type: 'bar',
            phone: '5057651534',
            phone_formatted: '(505) 765-1534',
            lat: 35.084293,
            lon: -106.651969,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [
                    {
                        id: 2240,
                        group: 'details',
                        key: 'ping-pong',
                        value: 'Ping Pong',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1523,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-69-3335-lg.jpg',
                        created_at: '2016-03-23 01:31:15',
                        updated_at: '2016-03-23 01:31:15',
                    },
                    {
                        id: 1524,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-69-1876-lg.jpg',
                        created_at: '2016-03-23 01:31:20',
                        updated_at: '2016-03-23 01:31:20',
                    },
                    {
                        id: 1525,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-69-6285-lg.jpg',
                        created_at: '2016-03-23 01:31:25',
                        updated_at: '2016-03-23 01:31:25',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2239,
                        group: 'basic',
                        key: 'website',
                        value: '',
                    },
                ],
            },
        },
        {
            id: 70,
            created_at: '2016-03-23 01:32:12',
            name: 'Sidelines Sports Grille & Bar',
            slug: 'sidelines-sports-grille-bar',
            status: 101,
            address: '9211 Coors Blvd NW, Albuquerque, NM 87114, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87114,
            distance: null,
            type: 'bar',
            phone: '5058974633',
            phone_formatted: '(505) 897-4633',
            lat: 35.182315,
            lon: -106.667886,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1526,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-70-8013-lg.jpg',
                        created_at: '2016-03-23 01:32:12',
                        updated_at: '2016-03-23 01:32:12',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 71,
            created_at: '2016-03-23 01:33:14',
            name: "Howie's Sports Page",
            slug: 'howie-s-sports-page',
            status: 101,
            address: '12500 Montgomery Blvd NE #133, Albuquerque, NM 87111, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87111,
            distance: null,
            type: 'bar',
            phone: '5052924263',
            phone_formatted: '(505) 292-4263',
            lat: 35.130078,
            lon: -106.499223,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 1527,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-71-1555-lg.jpg',
                        created_at: '2016-03-23 01:33:14',
                        updated_at: '2016-03-23 01:33:14',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 74,
            created_at: '2016-03-23 01:35:48',
            name: 'Spectators Sports Bar & Grill',
            slug: 'spectators-sports-bar-grill',
            status: 101,
            address: '5850 Eubank Blvd NE, Albuquerque, NM 87111, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87111,
            distance: null,
            type: 'bar',
            phone: '5052751166',
            phone_formatted: '(505) 275-1166',
            lat: 35.147197,
            lon: -106.526847,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [
                    {
                        id: 2242,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                    {
                        id: 2243,
                        group: 'details',
                        key: 'shuffleboard',
                        value: 'Shuffleboard',
                    },
                    {
                        id: 2244,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1528,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-74-6947-lg.png',
                        created_at: '2016-03-23 01:35:43',
                        updated_at: '2016-03-23 01:35:43',
                    },
                    {
                        id: 1529,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-74-7624-lg.png',
                        created_at: '2016-03-23 01:35:48',
                        updated_at: '2016-03-23 01:35:48',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2241,
                        group: 'basic',
                        key: 'website',
                        value: '',
                    },
                ],
            },
        },
        {
            id: 76,
            created_at: '2016-02-10 17:34:40',
            name: 'Billiard Palace',
            slug: 'billiard-palace',
            status: 101,
            address: '2288 Wyoming Blvd NE, Albuquerque, NM 87112, USA',
            city: 'Albuquerque',
            state: 'NM',
            country: 'US',
            zip: 87112,
            distance: null,
            type: 'hall',
            phone: '5053236800',
            phone_formatted: '(505) 323-6800',
            lat: 35.109383,
            lon: -106.550727,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 264,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-76-7589-lg.png',
                        created_at: '2016-02-10 21:03:37',
                        updated_at: '2016-02-10 21:03:37',
                    },
                    {
                        id: 265,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-76-7701-lg.jpg',
                        created_at: '2016-02-10 21:03:44',
                        updated_at: '2016-02-10 21:03:44',
                    },
                ],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 79,
            created_at: '2016-03-23 01:40:26',
            name: 'Rock It Grill',
            slug: 'rock-it-grill',
            status: 101,
            address: '1319 King St, Alexandria, VA 22314, USA',
            city: 'Alexandria',
            state: 'VA',
            country: 'US',
            zip: 22314,
            distance: null,
            type: 'bar',
            phone: '7037392274',
            phone_formatted: '(703) 739-2274',
            lat: 38.80627,
            lon: -77.054313,
            description: '',
            website: 'http://www.rockit-grill.com/',
            notes: '',
            details: {
                data: [
                    {
                        id: 2246,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1530,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-79-8492-lg.png',
                        created_at: '2016-03-23 01:40:22',
                        updated_at: '2016-03-23 01:40:22',
                    },
                    {
                        id: 1531,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-79-2842-lg.jpg',
                        created_at: '2016-03-23 01:40:26',
                        updated_at: '2016-03-23 01:40:26',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2245,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.rockit-grill.com/',
                    },
                ],
            },
        },
        {
            id: 80,
            created_at: '2016-05-03 15:47:10',
            name: 'Alley Cat',
            slug: 'alley-cat',
            status: 101,
            address: '2 S Whiting St, Alexandria, VA 22304, USA',
            city: 'Alexandria',
            state: 'VA',
            country: 'US',
            zip: 22304,
            distance: null,
            type: 'bar',
            phone: '7034610450',
            phone_formatted: '(703) 461-0450',
            lat: 38.813917,
            lon: -77.13617,
            description: '',
            website: 'http://www.alleycatalexandria.com/',
            notes: '',
            details: {
                data: [
                    {
                        id: 2274,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                    {
                        id: 2275,
                        group: 'details',
                        key: 'darts',
                        value: 'Darts',
                    },
                    {
                        id: 2276,
                        group: 'details',
                        key: 'foosball',
                        value: 'Foosball',
                    },
                ],
            },
            media: {
                data: [
                    {
                        id: 1553,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-80-7791-lg.jpg',
                        created_at: '2016-05-03 15:47:05',
                        updated_at: '2016-05-03 15:47:05',
                    },
                    {
                        id: 1554,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-80-5144-lg.jpg',
                        created_at: '2016-05-03 15:47:10',
                        updated_at: '2016-05-03 15:47:10',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 2273,
                        group: 'basic',
                        key: 'website',
                        value: 'http://www.alleycatalexandria.com/',
                    },
                ],
            },
        },
        {
            id: 81,
            created_at: '2016-02-10 17:34:40',
            name: 'Laughing Lizard Lounge',
            slug: 'laughing-lizard-lounge',
            status: 101,
            address: '1324 King St, Alexandria, VA 22314, USA',
            city: 'Alexandria',
            state: 'VA',
            country: 'US',
            zip: 22314,
            distance: null,
            type: 'bar',
            phone: '7038367885',
            phone_formatted: '(703) 836-7885',
            lat: 38.805804,
            lon: -77.054521,
            description: '',
            website: '',
            notes: '',
            details: {
                data: [
                    {
                        id: 6480,
                        group: 'details',
                        key: 'has-food',
                        value: 'Has Food',
                    },
                ],
            },
            media: {
                data: [],
            },
            meta: {
                data: [],
            },
        },
        {
            id: 83,
            created_at: '2016-02-10 17:34:40',
            name: 'Bungalow Sports Grill',
            slug: 'bungalow-sports-grill',
            status: 101,
            address: '7003-C Manchester Blvd  Alexandria, VA 22310',
            city: 'Alexandria',
            state: 'VA',
            country: '',
            zip: 22310,
            distance: null,
            type: 'hall',
            phone: '7039248730',
            phone_formatted: '(703) 924-8730',
            lat: 38.765335,
            lon: -77.154678,
            description: '',
            website: 'http://bungalowsportsgrill.com',
            notes: '',
            details: {
                data: [],
            },
            media: {
                data: [
                    {
                        id: 266,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-83-9219-lg.png',
                        created_at: '2016-02-10 21:05:40',
                        updated_at: '2016-02-10 21:05:40',
                    },
                    {
                        id: 267,
                        type: 'image',
                        url: 'https://chalkysticks-cms.s3.amazonaws.com/venue-photo-83-9328-lg.jpg',
                        created_at: '2016-02-10 21:05:48',
                        updated_at: '2016-02-10 21:05:48',
                    },
                ],
            },
            meta: {
                data: [
                    {
                        id: 124,
                        group: 'basic',
                        key: 'website',
                        value: 'http://bungalowsportsgrill.com',
                    },
                ],
            },
        },
    ],
    meta: {
        pagination: {
            total: 8154,
            count: 50,
            per_page: 50,
            current_page: 1,
            total_pages: 164,
            links: {
                next: 'http://api.chalkysticks.com/v1/venues?limit=30&page=2',
            },
        },
    },
};


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const Venue_1 = __importDefault(__webpack_require__(/*! ./Collection/Venue */ "./src/Collection/Venue.ts"));
const api_response_1 = __importDefault(__webpack_require__(/*! ./api-response */ "./src/api-response.ts"));
function addVenue(venueModel, parentElement) {
    const element = document.createElement('div');
    element.innerHTML = [`<h1>${venueModel.getName()}</h1>`].join('');
    parentElement.appendChild(element);
}
async function fetchVenues() {
    const parentElement = document.querySelector('#app');
    const venueCollection = Venue_1.default.hydrate(api_response_1.default.data);
    venueCollection.setOptions({
        withCredentials: false,
    });
    venueCollection.on('complete', (e) => {
        console.log('Received data: ', e);
    });
    console.log('Venue Collection', venueCollection);
    venueCollection.each((model) => addVenue(model, parentElement));
    venueCollection.on('add:before', (e) => {
        console.log('Before add', e);
    });
    const parlourItem = venueCollection.findWhere({ name: 'Parlour' });
    console.log('Parlour Item', parlourItem);
    const clonedParlourItem = parlourItem.clone();
    console.log(' -> Cloned Parlour', clonedParlourItem);
    const parlourItem2 = venueCollection.where({
        name: 'Parlour',
        website: 'http://superfine.nyc',
    });
    console.log('Superfine Collection', parlourItem2);
    const parlourItem3 = venueCollection.where({
        name: 'Parlour',
        website: 'http://superfine.nyc',
    }, false, true);
    console.log('Full Superfine Collection', parlourItem3);
    const response = await venueCollection.fetch();
    console.log('Fetch Response', response);
    console.log('\n\n');
    const clonedCollection = venueCollection.clone();
    console.log('Venue Collection', venueCollection);
    console.log(' -> Cloned Collection', clonedCollection);
    console.log('-----------------------------------------------------------');
    console.log('Testing iterator filters...');
    const iteratorFilter = (model, index) => {
        return model.getName().indexOf('Billiards') > 0;
    };
    let model;
    for (model of clonedCollection.values(iteratorFilter)) {
        console.log('Billards Places:', model.getName());
    }
    console.log('-----------------------------------------------------------');
    console.log('Using .next(...)');
    while ((model = clonedCollection.next(iteratorFilter))) {
        console.log('Next Iterator', clonedCollection.index(), model.getName());
    }
    console.log('-----------------------------------------------------------');
    console.log('Using .previous(...)');
    while ((model = clonedCollection.previous(iteratorFilter))) {
        console.log('Previous Iterator', clonedCollection.index(), model.getName());
    }
    console.log('-----------------------------------------------------------');
    console.log('Using .next(...)');
    while ((model = clonedCollection.next())) {
        console.log('Next All Iterator', clonedCollection.index(), model.getName());
    }
    console.log('-----------------------------------------------------------');
    console.log('Using .previous(...)');
    while ((model = clonedCollection.previous())) {
        console.log('Previous All Iterator', clonedCollection.index(), model.getName());
    }
}
fetchVenues();


/***/ }),

/***/ "../../node_modules/axios/index.js":
/*!*****************************************!*\
  !*** ../../node_modules/axios/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "../../node_modules/axios/lib/axios.js");

/***/ }),

/***/ "../../node_modules/axios/lib/adapters/xhr.js":
/*!****************************************************!*\
  !*** ../../node_modules/axios/lib/adapters/xhr.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "../../node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "../../node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "../../node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "../../node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "../../node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "../../node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "../../node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "../../node_modules/axios/lib/axios.js":
/*!*********************************************!*\
  !*** ../../node_modules/axios/lib/axios.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "../../node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "../../node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "../../node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "../../node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "../../node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "../../node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "../../node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "../../node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "../../node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "../../node_modules/axios/lib/cancel/Cancel.js":
/*!*****************************************************!*\
  !*** ../../node_modules/axios/lib/cancel/Cancel.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "../../node_modules/axios/lib/cancel/CancelToken.js":
/*!**********************************************************!*\
  !*** ../../node_modules/axios/lib/cancel/CancelToken.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "../../node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "../../node_modules/axios/lib/cancel/isCancel.js":
/*!*******************************************************!*\
  !*** ../../node_modules/axios/lib/cancel/isCancel.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "../../node_modules/axios/lib/core/Axios.js":
/*!**************************************************!*\
  !*** ../../node_modules/axios/lib/core/Axios.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "../../node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "../../node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "../../node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "../../node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "../../node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "../../node_modules/axios/lib/core/InterceptorManager.js":
/*!***************************************************************!*\
  !*** ../../node_modules/axios/lib/core/InterceptorManager.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "../../node_modules/axios/lib/core/buildFullPath.js":
/*!**********************************************************!*\
  !*** ../../node_modules/axios/lib/core/buildFullPath.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "../../node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "../../node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "../../node_modules/axios/lib/core/createError.js":
/*!********************************************************!*\
  !*** ../../node_modules/axios/lib/core/createError.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "../../node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "../../node_modules/axios/lib/core/dispatchRequest.js":
/*!************************************************************!*\
  !*** ../../node_modules/axios/lib/core/dispatchRequest.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "../../node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "../../node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "../../node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "../../node_modules/axios/lib/core/enhanceError.js":
/*!*********************************************************!*\
  !*** ../../node_modules/axios/lib/core/enhanceError.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "../../node_modules/axios/lib/core/mergeConfig.js":
/*!********************************************************!*\
  !*** ../../node_modules/axios/lib/core/mergeConfig.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "../../node_modules/axios/lib/core/settle.js":
/*!***************************************************!*\
  !*** ../../node_modules/axios/lib/core/settle.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "../../node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "../../node_modules/axios/lib/core/transformData.js":
/*!**********************************************************!*\
  !*** ../../node_modules/axios/lib/core/transformData.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "../../node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "../../node_modules/axios/lib/defaults.js":
/*!************************************************!*\
  !*** ../../node_modules/axios/lib/defaults.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "../../node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "../../node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "../../node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "../../node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/bind.js":
/*!****************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/bind.js ***!
  \****************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/buildURL.js":
/*!********************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/buildURL.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/combineURLs.js":
/*!***********************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/combineURLs.js ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/cookies.js":
/*!*******************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/cookies.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*************************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/isAxiosError.js":
/*!************************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/isAxiosError.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***************************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/parseHeaders.js":
/*!************************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/parseHeaders.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/spread.js":
/*!******************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/spread.js ***!
  \******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "../../node_modules/axios/lib/helpers/validator.js":
/*!*********************************************************!*\
  !*** ../../node_modules/axios/lib/helpers/validator.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var pkg = __webpack_require__(/*! ./../../package.json */ "../../node_modules/axios/package.json");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  isOlderVersion: isOlderVersion,
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "../../node_modules/axios/lib/utils.js":
/*!*********************************************!*\
  !*** ../../node_modules/axios/lib/utils.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "../../node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "../../node_modules/form-data/lib/browser.js":
/*!***************************************************!*\
  !*** ../../node_modules/form-data/lib/browser.js ***!
  \***************************************************/
/***/ ((module) => {

/* eslint-env browser */
module.exports = typeof self == 'object' ? self.FormData : window.FormData;


/***/ }),

/***/ "../../node_modules/axios/package.json":
/*!*********************************************!*\
  !*** ../../node_modules/axios/package.json ***!
  \*********************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"axios","version":"0.21.4","description":"Promise based HTTP client for the browser and node.js","main":"index.js","scripts":{"test":"grunt test","start":"node ./sandbox/server.js","build":"NODE_ENV=production grunt build","preversion":"npm test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json","postversion":"git push && git push --tags","examples":"node ./examples/server.js","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","fix":"eslint --fix lib/**/*.js"},"repository":{"type":"git","url":"https://github.com/axios/axios.git"},"keywords":["xhr","http","ajax","promise","node"],"author":"Matt Zabriskie","license":"MIT","bugs":{"url":"https://github.com/axios/axios/issues"},"homepage":"https://axios-http.com","devDependencies":{"coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.3.0","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^23.0.0","grunt-karma":"^4.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^4.0.2","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^6.3.2","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^2.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^4.3.6","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.8","karma-webpack":"^4.0.2","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^8.2.1","sinon":"^4.5.0","terser-webpack-plugin":"^4.2.3","typescript":"^4.0.5","url-search-params":"^0.10.0","webpack":"^4.44.2","webpack-dev-server":"^3.11.0"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"jsdelivr":"dist/axios.min.js","unpkg":"dist/axios.min.js","typings":"./index.d.ts","dependencies":{"follow-redirects":"^1.14.0"},"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}]}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map