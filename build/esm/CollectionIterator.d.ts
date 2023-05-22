import Collection from './Collection.js';
import Model from './Model.js';
export default class CollectionIterator<GenericModel extends Model> {
    static ITERATOR_VALUES: number;
    static ITERATOR_KEYS: number;
    static ITERATOR_KEYSVALUES: number;
    index: number;
    protected collection: Collection<GenericModel> | undefined;
    protected kind: number;
    constructor(collection: Collection<GenericModel>, kind?: number);
    next(): {
        done: boolean;
        value: any;
    };
}
