"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Cache_1 = require("../Cache");
const Core_1 = require("../Core");
const RequestError_1 = require("./RequestError");
class Request extends Core_1.default {
    constructor(url = '', options = {}) {
        super();
        this.dataKey = 'data';
        this.headers = {};
        this.loading = false;
        this.method = 'get';
        this.mode = 'cors';
        this.responseData = {};
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
            new Promise((resolve) => {
                if (Request.cachedResponses.has(cacheKey)) {
                    const result = Request.cachedResponses.get(cacheKey);
                    resolve(result);
                }
                else if (Request.cachedResponses.has('any')) {
                    const result = Request.cachedResponses.get('any');
                    resolve(result);
                }
                else {
                    resolve((0, axios_1.default)(params));
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
            throw new RequestError_1.default(response.status, message);
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
Request.cachedResponses = new Cache_1.default();
//# sourceMappingURL=Request.js.map