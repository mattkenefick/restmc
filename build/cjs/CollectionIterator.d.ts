import Collection from './Collection';
export default class CollectionIterator<GenericModel> {
    static ITERATOR_VALUES: number;
    static ITERATOR_KEYS: number;
    static ITERATOR_KEYSVALUES: number;
    index: number;
    protected collection: Collection<any> | undefined;
    protected kind: number;
    constructor(collection: Collection<any>, kind?: number);
    next(): {
        done: boolean;
        value: any;
    } | undefined;
}
