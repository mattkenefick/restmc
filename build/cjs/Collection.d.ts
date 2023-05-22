import ActiveRecord from './ActiveRecord.js';
import CollectionIterator from './CollectionIterator.js';
import HttpRequest from './Http/Request.js';
import Model from './Model.js';
import { IAttributes, ICollectionMeta, IPagination } from './Interfaces.js';
export default class Collection<GenericModel extends Model> extends ActiveRecord<Collection<GenericModel>> implements Iterable<GenericModel> {
    static paginator(collection: any): IPagination;
    static hydrate<T>(models?: Model[], options?: object): any;
    get length(): number;
    get modelId(): string;
    get pagination(): IPagination;
    atRelationship: string[];
    index: number;
    meta: ICollectionMeta;
    model: GenericModel;
    models: GenericModel[];
    protected sortKey: string;
    constructor(options?: IAttributes);
    toJSON(): object;
    fetchNext(append?: boolean): Promise<HttpRequest>;
    fetchPrevious(append?: boolean): Promise<HttpRequest>;
    getEndpoint(): string;
    add(data: GenericModel[] | GenericModel | object, options?: IAttributes): Collection<GenericModel>;
    remove(model: Model[] | Model | object): Collection<GenericModel>;
    set(model: Model[] | Model | object, options?: IAttributes): Collection<GenericModel>;
    clear(): Collection<GenericModel>;
    count(): number;
    delete(attributes?: IAttributes): Promise<HttpRequest>;
    each(callback: any): void;
    filter(predicate: any): GenericModel[];
    map(...params: any): any[];
    push(model: Model[] | Model | object, options?: object): Collection<GenericModel>;
    pop(): Collection<GenericModel>;
    reset(): Collection<GenericModel>;
    unshift(model: GenericModel[] | GenericModel | object, options?: IAttributes): Collection<GenericModel>;
    shift(): Collection<GenericModel>;
    slice(...params: any): Model[];
    get(query: GenericModel | number | string): Model | undefined;
    has(obj: GenericModel | number | string): boolean;
    at(index?: number): GenericModel;
    first(): GenericModel;
    last(): GenericModel;
    next(): GenericModel | undefined;
    previous(): GenericModel | undefined;
    current(): GenericModel;
    where(attributes?: IAttributes, first?: boolean): this | Collection<GenericModel> | GenericModel;
    findWhere(attributes?: IAttributes): GenericModel;
    findByCid(cid: string): GenericModel;
    sort(options?: IAttributes): Collection<GenericModel>;
    pluck(attribute: string): any;
    clone(attributes?: IAttributes): any;
    values(): CollectionIterator<GenericModel>;
    keys(attributes?: IAttributes): CollectionIterator<GenericModel>;
    entries(attributes?: IAttributes): CollectionIterator<GenericModel>;
    [Symbol.iterator](): any;
}
