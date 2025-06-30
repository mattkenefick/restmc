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
const ActiveRecord_js_1 = require("./ActiveRecord.js");
const CollectionIterator_js_1 = require("./CollectionIterator.js");
const Model_js_1 = require("./Model.js");
const Utility_js_1 = require("./Utility.js");
class Collection extends ActiveRecord_js_1.default {
    constructor(options = {}) {
        super(options);
        this.atRelationship = [];
        this._meta = {
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
        this.builder.qp('limit', options.limit || this.limit).qp('page', options.page || this.page);
        if (options.atRelationship) {
            this.atRelationship = options.atRelationship;
        }
    }
    static paginator(collection) {
        return collection._meta.pagination;
    }
    static hydrate(models = [], options = {}, trigger = true) {
        const collection = new this(options);
        collection.setOptions(options);
        if (models) {
            collection.add(models, {}, trigger);
        }
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
        return this.models.map((model) => {
            if (typeof model.toJSON === 'function') {
                return model.toJSON();
            }
            return model;
        });
    }
    nextPage(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasNext()) {
                return null;
            }
            return this.fetchNext(append);
        });
    }
    previousPage(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasPrevious()) {
                return null;
            }
            return this.fetchPrevious(append);
        });
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
    updateUniqueKey() {
        const ids = this.models.map((model) => model.id).join(',');
        let hash = (0, Utility_js_1.compactObjectHash)(JSON.stringify(this.attributes) + ids);
        if (this.useRandomUniqueKeySalt) {
            hash += Math.random().toString(36).substr(2, 5) + Date.now();
        }
        this.uniqueKey = hash;
    }
    add(data, options = {}, trigger = true) {
        if (data == null) {
            return this;
        }
        data = this.cleanData(data);
        const incomingItems = Array.isArray(data) ? data : [data];
        const newModels = [];
        for (const item of incomingItems) {
            let model;
            if (item.isModel) {
                model = item;
            }
            else {
                model = new this.model.constructor(item);
            }
            const params = {
                grandparent: this === null || this === void 0 ? void 0 : this.parent,
                model: model,
                parent: this,
            };
            model.parent = this;
            model.headers = this.headers;
            if (this.referenceForModifiedEndpoint) {
                model.useModifiedEndpoint(this.referenceForModifiedEndpoint, this.modifiedEndpointPosition);
            }
            trigger && this.dispatch('add:before', params);
            if (options.prepend) {
                this.models.unshift(model);
            }
            else {
                this.models.push(model);
            }
            trigger && this.dispatch('add:after', params);
            trigger &&
                setTimeout(() => {
                    this.dispatch('add:delayed', params);
                }, 1);
        }
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
        if (!attributes || !attributes.id) {
            throw new Error('No ID provided to delete');
        }
        this.builder.identifier((attributes === null || attributes === void 0 ? void 0 : attributes.id) || this.id || '');
        const model = this.findWhere({ id: attributes.id });
        model && this.remove(model);
        const body = undefined;
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
        return super.reset();
    }
    unshift(model, options = {}) {
        return this.add(model, Object.assign({ prepend: true }, options));
    }
    shift() {
        const model = this.at(0);
        return this.remove(model);
    }
    shuffle() {
        this.models = this.models.sort(() => Math.random() - 0.5);
        return this;
    }
    reverse() {
        this.models = this.models.reverse();
        return this;
    }
    slice(...params) {
        return Array.prototype.slice.apply(this.models, params);
    }
    unique() {
        this.models = this.models.filter((value, index, self) => self.indexOf(value) === index);
        return this;
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
    where(json = {}, first, fullMatch, inPlace) {
        const filterInPlace = typeof inPlace === 'boolean' ? inPlace : !!this.inPlaceWhere;
        const searchKeys = Object.keys(json);
        const searchKeyCount = searchKeys.length;
        const filteredModels = [];
        for (const model of this.models) {
            let matchCount = 0;
            for (let i = 0; i < searchKeyCount; i++) {
                const key = searchKeys[i];
                if (model.attr(key) == json[key]) {
                    matchCount++;
                }
            }
            const shouldInclude = fullMatch ? matchCount === searchKeyCount : matchCount > 0;
            if (shouldInclude) {
                filteredModels.push(model);
            }
        }
        if (first) {
            return filteredModels.length > 0 ? filteredModels[0] : null;
        }
        if (filterInPlace) {
            this.models = filteredModels;
            if (typeof this.dispatch === 'function') {
                this.dispatch('change', { from: 'where-in-place' });
                this.dispatch('filter');
            }
            return this;
        }
        const constructor = this.constructor;
        const collection = constructor.hydrate(filteredModels, Object.assign({ parent: this.parent }, this.options), false);
        return collection;
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
    hasNext() {
        var _a, _b, _c, _d, _e, _f, _g;
        if (((_b = (_a = this.pagination) === null || _a === void 0 ? void 0 : _a.links) === null || _b === void 0 ? void 0 : _b.next) !== undefined) {
            return true;
        }
        const currentPage = (_c = this.pagination) === null || _c === void 0 ? void 0 : _c.current_page;
        const totalPages = (_d = this.pagination) === null || _d === void 0 ? void 0 : _d.total_pages;
        if (typeof currentPage === 'number' && typeof totalPages === 'number') {
            return currentPage < totalPages;
        }
        const count = (_e = this.pagination) === null || _e === void 0 ? void 0 : _e.count;
        const total = (_f = this.pagination) === null || _f === void 0 ? void 0 : _f.total;
        const perPage = (_g = this.pagination) === null || _g === void 0 ? void 0 : _g.per_page;
        if (typeof count === 'number' && typeof total === 'number' && typeof perPage === 'number') {
            const itemsShown = ((currentPage || 1) - 1) * perPage + count;
            return itemsShown < total;
        }
        return false;
    }
    hasPrevious() {
        var _a, _b, _c, _d, _e;
        if (((_b = (_a = this.pagination) === null || _a === void 0 ? void 0 : _a.links) === null || _b === void 0 ? void 0 : _b.previous) !== undefined) {
            return true;
        }
        const currentPage = (_c = this.pagination) === null || _c === void 0 ? void 0 : _c.current_page;
        if (typeof currentPage === 'number') {
            return currentPage > 1;
        }
        const count = (_d = this.pagination) === null || _d === void 0 ? void 0 : _d.count;
        const perPage = (_e = this.pagination) === null || _e === void 0 ? void 0 : _e.per_page;
        if (typeof count === 'number' && typeof perPage === 'number') {
            return false;
        }
        return false;
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
exports.default = Collection;
//# sourceMappingURL=Collection.js.map