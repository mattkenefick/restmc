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
const axios_1 = require("axios");
const Cache_js_1 = require("../Cache.js");
const Core_js_1 = require("../Core.js");
const RequestError_js_1 = require("./RequestError.js");
class Request extends Core_js_1.default {
    constructor(url = '', options = {}) {
        var _a;
        super();
        this.cacheOptions = {
            defaultTTL: 1000 * 60 * 5,
            enabled: true,
            maxSize: 100,
        };
        this.dataKey = 'data';
        this.headers = {};
        this.loading = false;
        this.method = 'GET';
        this.mode = 'cors';
        this.responseData = {};
        this.status = 0;
        this.withCredentials = true;
        this.dataKey = options.dataKey || this.dataKey;
        this.withCredentials = (_a = options.withCredentials) !== null && _a !== void 0 ? _a : true;
        this.url = url.replace(/\?$/, '').replace(/\?&/, '?');
    }
    generateCacheKey(params) {
        const { method = 'GET', url = '', data = '', headers = {} } = params;
        const serializedData = ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? JSON.stringify(data) : '';
        return [method.toUpperCase(), url, serializedData, headers['Accept'] || '', headers['Content-Type'] || '']
            .filter(Boolean)
            .join('|');
    }
    shouldUseCache(params) {
        var _a, _b;
        if (!this.cacheOptions.enabled || params.bypassCache)
            return false;
        if (((_a = params.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== 'GET')
            return false;
        const cacheControl = (_b = params.headers) === null || _b === void 0 ? void 0 : _b['Cache-Control'];
        const output = !(cacheControl === null || cacheControl === void 0 ? void 0 : cacheControl.includes('no-cache'));
        return output;
    }
    fetch(method = 'GET', body = {}, headers = {}, ttl) {
        const params = {};
        const requestEvent = {
            body,
            headers,
            method,
            params,
        };
        ttl = ttl || this.cacheOptions.defaultTTL;
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
        if (this.method === 'GET') {
            params.headers = Object.assign(Object.assign({}, params.headers), { 'Content-Type': null });
        }
        this.dispatch('fetch:before', { request: requestEvent });
        this.loading = true;
        this.dispatch('requesting', { request: requestEvent });
        return new Promise((resolve, reject) => {
            const cacheKey = this.generateCacheKey(params);
            const useCache = this.shouldUseCache(params);
            this.handleRequest(cacheKey, params, useCache, ttl)
                .then((response) => {
                this.response = response;
                this.beforeParse(response);
                this.parse(response);
                this.afterParse(response);
                this.afterFetch(response);
                this.afterAll(response);
                this.afterAny();
                resolve(this);
            })
                .catch((error) => {
                this.response = error.response;
                this.afterAllError(error);
                this.afterAny();
                reject(this);
            });
        });
    }
    handleRequest(cacheKey, params, useCache, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (useCache && Request.cachedResponses.has(cacheKey)) {
                const cachedResponse = Request.cachedResponses.get(cacheKey);
                this.dispatch('cache:hit', {
                    cacheKey: cacheKey,
                    response: cachedResponse,
                });
                return cachedResponse;
            }
            if (Request.pendingRequests.has(cacheKey)) {
                const pendingResponse = Request.pendingRequests.get(cacheKey);
                if (pendingResponse) {
                    this.dispatch('request:deduped', { cacheKey });
                    return pendingResponse;
                }
            }
            const requestPromise = (0, axios_1.default)(params)
                .then((response) => {
                if (useCache && response.status >= 200 && response.status < 300) {
                    Request.cachedResponses.set(cacheKey, response, ttl);
                    this.dispatch('cache:set', { cacheKey, response });
                }
                Request.pendingRequests.delete(cacheKey);
                return response;
            })
                .catch((error) => {
                Request.pendingRequests.delete(cacheKey);
                throw error;
            });
            Request.pendingRequests.set(cacheKey, requestPromise);
            this.dispatch('request:pending', { cacheKey });
            return requestPromise;
        });
    }
    xhrFetch(url, params) {
        let xhr = new XMLHttpRequest();
        xhr.open(params.method, url);
        for (let key in params.headers) {
            xhr.setRequestHeader(key, params.headers[key]);
        }
        xhr.withCredentials = this.withCredentials;
        return new Promise((resolve, reject) => {
            xhr.upload.onprogress = (e) => {
                const progressEvent = {
                    loaded: e.loaded,
                    total: e.total,
                    ratio: e.lengthComputable ? e.loaded / e.total : 1,
                };
                this.dispatch('progress', { progress: progressEvent });
            };
            xhr.onload = () => {
                const blob = new Blob([xhr.response], { type: 'application/json' });
                const response = new Response(xhr.response ? blob : null, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                });
                resolve(response);
            };
            xhr.onerror = () => reject({ request: xhr });
            xhr.send(params.body);
        });
    }
    static clearCache() {
        Request.cachedResponses = new Cache_js_1.default();
    }
    static getPendingRequests() {
        return Request.pendingRequests;
    }
    static removeCacheEntry(key) {
        Request.cachedResponses.delete(key);
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
exports.default = Request;
Request.cachedResponses = new Cache_js_1.default();
Request.pendingRequests = new Map();
//# sourceMappingURL=Request.js.map