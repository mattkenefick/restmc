import ActiveRecord from './ActiveRecord.js';
import Request from './Http/Request.js';
import { IAttributes, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces.js';
export default class Model extends ActiveRecord<Model> {
    static hydrate<T>(attributes?: IAttributes, options?: IAttributes): Model;
    static relationshipKey: string | null;
    static useDescendingRelationships: boolean;
    protected get isModel(): boolean;
    relationships: object;
    private relationshipCache;
    constructor(attributes?: IAttributes, options?: IAttributes);
    set(attributes?: IAttributes): Model;
    fetch(options?: IModelRequestOptions, queryParams?: IModelRequestQueryParams): Promise<Request>;
    hasOne<T>(relationshipName: string, relationshipClass: any): T;
    hasMany<T>(relationshipName: string, relationshipClass: any): T;
    protected getRelationship(relationshipName: string): any;
}
