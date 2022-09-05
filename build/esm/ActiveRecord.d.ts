import { IAttributes, ICachedResponse, ICachedResponses, IDispatcherCallbackFunction, IDispatcherEvent, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces';
import Builder from './Http/Builder';
import Core from './Core';
import HttpRequest from './Http/Request';
declare type FetchResponse = Promise<HttpRequest>;
export default class ActiveRecord<T> extends Core {
    get b(): Builder<T>;
    protected get isModel(): boolean;
    attributes: IAttributes;
    baseUrl: string;
    body: IAttributes;
    cacheable: boolean;
    cid: string;
    dataKey: string | undefined;
    endpoint: string;
    endpointDelete: string | undefined;
    endpointPost: string | undefined;
    endpointPut: string | undefined;
    hasFetched: boolean;
    hasLoaded: boolean;
    headers: Record<string, null | number | string>;
    id: string;
    limit: number;
    loading: boolean;
    meta: IAttributes;
    modifiedEndpointPosition: string;
    options: IAttributes;
    page: number;
    parent: ActiveRecord<any> | undefined;
    request?: HttpRequest;
    requestTime: number;
    protected builder: Builder<T>;
    protected cidPrefix: string;
    protected lastRequest: any;
    protected loadingHookPre: IDispatcherCallbackFunction | undefined;
    protected loadingHookPost: IDispatcherCallbackFunction | undefined;
    protected referenceForModifiedEndpoint: ActiveRecord<any> | undefined;
    protected runLastAttempts: number;
    protected runLastAttemptsMax: number;
    constructor(options?: IAttributes);
    attr(key: string): string | number | null;
    hasAttributes(): boolean;
    set(attributes?: IAttributes, options?: IAttributes, trigger?: boolean): ActiveRecord<T>;
    unset(key: string): ActiveRecord<T>;
    setOptions(options?: IAttributes): ActiveRecord<T>;
    toJSON(): object;
    create(attributes: IAttributes): FetchResponse;
    delete(attributes?: IAttributes): FetchResponse;
    post(attributes?: IAttributes): FetchResponse;
    put(attributes: IAttributes): FetchResponse;
    save(attributes?: IAttributes): FetchResponse;
    add(attributes: IAttributes): ActiveRecord<T>;
    reset(): ActiveRecord<T>;
    addLoadingHooks(view: any, preHook?: IDispatcherCallbackFunction | undefined, postHook?: IDispatcherCallbackFunction | undefined): ActiveRecord<T>;
    removeLoadingHooks(): ActiveRecord<T>;
    find(id: string | number, queryParams?: IModelRequestQueryParams): Promise<ActiveRecord<T>>;
    file(name: string, file: FileList | File): FetchResponse;
    upload(name: string, file: FileList | File): FetchResponse;
    fetch(options?: IModelRequestOptions, queryParams?: IModelRequestQueryParams): FetchResponse;
    runLast(): FetchResponse | void;
    getUrlByMethod(method: string): string;
    cancelModifiedEndpoint(): ActiveRecord<T>;
    isUsingModifiedEndpoint(): boolean;
    getReferencedEndpoint(): ActiveRecord<T> | undefined;
    getModifiedEndpoint(): string;
    useModifiedEndpoint(activeRecord: ActiveRecord<any>, position?: string): ActiveRecord<T>;
    setBody(value: IAttributes): ActiveRecord<T>;
    getEndpoint(): string;
    setEndpoint(endpoint: string): ActiveRecord<T>;
    setHeader(header: string, value: string | null): ActiveRecord<T>;
    setHeaders(headers: Record<string, string>): ActiveRecord<T>;
    setId(id: number | string): ActiveRecord<T>;
    unsetId(): ActiveRecord<T>;
    unsetHeader(header: string): ActiveRecord<T>;
    setQueryParam(key: string, value: string): ActiveRecord<T>;
    setQueryParams(params: Record<string, number | string>): ActiveRecord<T>;
    unsetQueryParam(param: string): ActiveRecord<T>;
    setToken(token: string): ActiveRecord<T>;
    setAfterResponse(e: IDispatcherEvent, options?: any): void;
    protected _fetch(options?: IModelRequestOptions | null, queryParams?: IModelRequestQueryParams, method?: string, body?: IAttributes, headers?: IAttributes): FetchResponse;
    protected static cachedResponses: ICachedResponses;
    protected cache(key: string, value: any, isComplete?: boolean, ttl?: number): void;
    protected isCached(key: string): boolean;
    protected isCachePending(key: string): boolean;
    protected getCache(key: string): ICachedResponse;
    protected addCacheSubscriber(key: string, resolve: any, reject: any, collection: any): void;
    protected clearCacheSubscribers(key: string): void;
    protected FetchComplete(e: IDispatcherEvent): void;
    protected FetchProgress(e: IDispatcherEvent): void;
    protected FetchParseAfter(e: IDispatcherEvent, options?: IAttributes): void;
}
export {};
