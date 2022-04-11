import ActiveRecord from './ActiveRecord';
import Collection from './Collection';
import Request from './Http/Request';
import { IAttributes, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces';
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
    hasMany(relationshipName: string, relationshipClass: any): Collection<any> | undefined;
    protected getRelationship(relationshipName: string): any;
}
