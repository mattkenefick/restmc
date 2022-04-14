"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CollectionIterator {
    constructor(collection, kind = 0) {
        this.index = 0;
        this.kind = CollectionIterator.ITERATOR_VALUES;
        this.collection = collection;
        this.index = 0;
        this.kind = kind;
    }
    next() {
        if (!this.collection) {
            return {
                done: true,
                value: void 0,
            };
        }
        if (this.index < this.collection.length) {
            let value;
            const model = this.collection.at(this.index++);
            if (this.kind === CollectionIterator.ITERATOR_VALUES) {
                value = model;
            }
            else {
                value
                    = this.kind === CollectionIterator.ITERATOR_KEYS
                        ? (value = this.collection.modelId)
                        : (value = [this.collection.modelId, model]);
            }
            return {
                done: this.index - 1 === this.collection.length,
                value: value,
            };
        }
        this.collection = void 0;
        return {
            done: true,
            value: void 0,
        };
    }
}
exports.default = CollectionIterator;
CollectionIterator.ITERATOR_VALUES = 0;
CollectionIterator.ITERATOR_KEYS = 1;
CollectionIterator.ITERATOR_KEYSVALUES = 2;
//# sourceMappingURL=CollectionIterator.js.map