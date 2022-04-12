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
const ActiveRecord_1 = require("./ActiveRecord");
const CollectionIterator_1 = require("./CollectionIterator");
const Model_1 = require("./Model");
class Collection extends ActiveRecord_1.default {
    constructor(options = {}) {
        super(options);
        this.atRelationship = [];
        this.index = 0;
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
    static hydrate(models = [], options = {}) {
        const collection = new this(options);
        collection.add(models);
        collection.setOptions(options);
        return collection;
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
    getEndpoint() {
        return super.getEndpoint() || this.model.endpoint;
    }
    add(data, options = {}) {
        if (data == undefined) {
            return this;
        }
        const models = Array.isArray(data) ? data : [data];
        models.forEach((model) => {
            if (!(model instanceof Model_1.default)) {
                model = new this.model.constructor(model);
                model.parent = this;
                model.headers = this.headers;
                if (this.referenceForModifiedEndpoint) {
                    model.useModifiedEndpoint(this.referenceForModifiedEndpoint);
                }
            }
            if (options.prepend) {
                this.models.unshift(model);
            }
            else {
                this.models.push(model);
            }
        });
        this.dispatch('change', { from: 'add' });
        this.dispatch('add');
        return this;
    }
    remove(model) {
        let i = 0;
        let ii = 0;
        const items = Array.isArray(model) ? model : [model];
        for (ii = 0; ii < items.length; ii++) {
            i = 0;
            while (i < this.models.length) {
                if (this.models[i] == items[ii]) {
                    this.models.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
        }
        this.dispatch('change', { from: 'remove' });
        this.dispatch('remove');
        return this;
    }
    set(model, options = {}) {
        if (!options || (options && options.merge != true)) {
            this.reset();
        }
        this.add(model);
        this.dispatch('set');
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
        return this.where({ [this.modelId]: query instanceof Model_1.default ? query.id : query }, true);
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
    next() {
        if (this.index + 1 >= this.length) {
            return undefined;
        }
        return this.at(++this.index);
    }
    previous() {
        if (this.index <= 0) {
            return undefined;
        }
        return this.at(--this.index);
    }
    current() {
        return this.at(this.index);
    }
    where(attributes = {}, first = false) {
        const constructor = this.constructor;
        const collection = new constructor();
        this.models.map((model) => {
            const intersection = Object.keys(model.attributes).filter((k) => k in attributes && model.attr(k) == attributes[k]);
            if (intersection.length) {
                collection.add(model);
            }
        });
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
    clone(attributes = {}) {
        const instance = new this.constructor();
        instance.add(this.toJSON());
        return instance;
    }
    values() {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_VALUES);
    }
    keys(attributes = {}) {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_KEYS);
    }
    entries(attributes = {}) {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_KEYSVALUES);
    }
    _fetch(options = {}, queryParams = {}, method = 'get', body = {}, headers = {}) {
        const cacheKey = this.b.getUrl();
        if (this.isCachePending(cacheKey)) {
            return new Promise((resolve, reject) => {
                this.addCacheSubscriber(cacheKey, resolve, reject, this);
            });
        }
        this.cache(cacheKey, true);
        return (super
            ._fetch(options, queryParams, method, body, headers)
            .then((request) => {
            var _a, _b, _c;
            const data = (_a = request.response) === null || _a === void 0 ? void 0 : _a.data;
            const method = request.method || 'get';
            this.cache(cacheKey, request, true);
            (_c = (_b = this.getCache(cacheKey)) === null || _b === void 0 ? void 0 : _b.subscribers) === null || _c === void 0 ? void 0 : _c.forEach((subscriber) => {
                subscriber.collection.setAfterResponse({
                    detail: {
                        request: request,
                        response: request.response,
                    },
                });
                subscriber.collection.dispatch('complete', {
                    request: request,
                    response: request.response,
                });
                subscriber.collection.dispatch('complete:' + method, {
                    request: request,
                    response: request.response,
                });
                subscriber.resolve(request);
            });
            this.clearCacheSubscribers(cacheKey);
            return request;
        })
            .catch((request) => {
            var _a, _b;
            this.dispatch('error', {
                request: request,
                response: request.response,
            });
            this.cache(cacheKey, request, true);
            (_b = (_a = this.getCache(cacheKey)) === null || _a === void 0 ? void 0 : _a.subscribers) === null || _b === void 0 ? void 0 : _b.forEach((subscriber) => subscriber.reject(request));
            this.clearCacheSubscribers(cacheKey);
            throw request;
        }));
    }
    [Symbol.iterator]() {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_VALUES);
    }
}
exports.default = Collection;
//# sourceMappingURL=Collection.js.map