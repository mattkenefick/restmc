import Collection from './Collection';
import Model from './Model';
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
    } | undefined;
}
