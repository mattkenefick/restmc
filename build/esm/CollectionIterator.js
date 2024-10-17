"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = CollectionIterator;
CollectionIterator.ITERATOR_VALUES = 0;
CollectionIterator.ITERATOR_KEYS = 1;
CollectionIterator.ITERATOR_KEYSVALUES = 2;
//# sourceMappingURL=CollectionIterator.js.map