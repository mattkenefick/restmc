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
        this.setOptions(options);
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
        data = this.cleanData(data);
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
exports.default = Collection;
//# sourceMappingURL=Collection.js.map