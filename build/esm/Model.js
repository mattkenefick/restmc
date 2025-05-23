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
class Model extends ActiveRecord_js_1.default {
    constructor(attributes = {}, options = {}) {
        super(options);
        this.circularProtection = true;
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
        if (this.circularProtection) {
            let parent = this.parent;
            while (parent) {
                if (parent.endpoint === this.endpoint && parent.id === this.id) {
                    return undefined;
                }
                parent = parent.parent;
            }
        }
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
        const models = (dataKey && content ? content[dataKey] : null) || content;
        const collection = new relationshipClass({
            parent: this,
        });
        if (Model.useDescendingRelationships) {
            collection.useModifiedEndpoint(this);
        }
        collection.add(models, {}, true);
        return (this.relationshipCache[relationshipName] = collection);
    }
    clearRelationship(relationshipName) {
        if (this.relationshipCache[relationshipName]) {
            delete this.relationshipCache[relationshipName];
        }
        return this;
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
exports.default = Model;
Model.relationshipKey = null;
Model.useDescendingRelationships = true;
//# sourceMappingURL=Model.js.map