import Collection from './Collection.js';
import Model from './Model.js';
export default class CollectionIterator<GenericModel extends Model> {
    static ITERATOR_VALUES: number;
    static ITERATOR_KEYS: number;
    static ITERATOR_KEYSVALUES: number;
    index: number;
    protected collection: Collection<GenericModel> | undefined;
    protected kind: number;
    protected filter: (model: GenericModel, index: number) => boolean;
    constructor(collection: Collection<GenericModel>, kind?: number, filter?: (model: GenericModel, index: number) => boolean);
    next(filter?: (model: GenericModel, index: number) => boolean): IteratorResult<any>;
    previous(filter?: (model: GenericModel, index: number) => boolean): IteratorResult<any>;
    current(): IteratorResult<any>;
    private getValue;
    [Symbol.iterator](): any;
}
