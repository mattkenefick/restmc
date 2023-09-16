import { IAttributes, IDispatcherCallbackFunction, IDispatcherEvent, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces.js';
import Builder from './Http/Builder.js';
import Core from './Core.js';
import HttpRequest from './Http/Request.js';
export default class ActiveRecord<T> extends Core {
    private static hooks;
    static setHook(event: string | undefined, func: any): void;
    static unsetHook(event?: string): void;
    static hook(key?: string, params?: any): void;
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
    mockData: IAttributes;
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
    protected ttl: number;
    constructor(options?: IAttributes);
    attr(key: string): string | number | null;
    hasAttributes(): boolean;
    set(attributes?: IAttributes, options?: IAttributes, trigger?: boolean): ActiveRecord<T>;
    unset(key: string): ActiveRecord<T>;
    setOptions(options?: IAttributes): ActiveRecord<T>;
    toJSON(): object;
    create(attributes: IAttributes): Promise<HttpRequest>;
    delete(attributes?: IAttributes): Promise<HttpRequest>;
    post(attributes?: IAttributes): Promise<HttpRequest>;
    put(attributes: IAttributes): Promise<HttpRequest>;
    save(attributes?: IAttributes): Promise<HttpRequest>;
    add(attributes: IAttributes): ActiveRecord<T>;
    reset(): ActiveRecord<T>;
    addLoadingHooks(view: any, preHook?: IDispatcherCallbackFunction | undefined, postHook?: IDispatcherCallbackFunction | undefined): ActiveRecord<T>;
    removeLoadingHooks(): ActiveRecord<T>;
    cache(ttl: number): ActiveRecord<T>;
    mock(data: any): ActiveRecord<T>;
    find(id: string | number, queryParams?: IModelRequestQueryParams): Promise<ActiveRecord<T>>;
    file(name: string, file: any, additionalFields?: Record<string, any>): Promise<HttpRequest>;
    upload(name: string, file: any, additionalFields?: Record<string, any>): Promise<HttpRequest>;
    fetch(options?: IModelRequestOptions, queryParams?: IModelRequestQueryParams, method?: string, body?: IAttributes, headers?: IAttributes): Promise<HttpRequest>;
    runLast(): Promise<HttpRequest> | void;
    getUrlByMethod(method: string): string;
    cancelModifiedEndpoint(): ActiveRecord<T>;
    isUsingModifiedEndpoint(): boolean;
    getReferencedEndpoint(): ActiveRecord<T> | undefined;
    getModifiedEndpoint(): string;
    getQueryParam(key: string): string;
    getQueryParams(): any;
    hasParent(): boolean;
    hasParentCollection(): boolean;
    useModifiedEndpoint(activeRecord: ActiveRecord<any>, position?: string): ActiveRecord<T>;
    setBody(value: IAttributes): ActiveRecord<T>;
    getEndpoint(): string;
    setEndpoint(endpoint: string): ActiveRecord<T>;
    setHeader(header: string, value: string | null): ActiveRecord<T>;
    setHeaders(headers: Record<string, string>): ActiveRecord<T>;
    setId(id: number | string): ActiveRecord<T>;
    unsetId(): ActiveRecord<T>;
    unsetHeader(header: string): ActiveRecord<T>;
    setMockData(key: string | undefined, jsonData: IAttributes): ActiveRecord<T>;
    unsetMockData(key?: string): ActiveRecord<T>;
    setQueryParam(key: string, value: string): ActiveRecord<T>;
    setQueryParams(params: Record<string, number | string>): ActiveRecord<T>;
    unsetQueryParam(param: string): ActiveRecord<T>;
    setToken(token: string): ActiveRecord<T>;
    setAfterResponse(e: IDispatcherEvent, options?: any): void;
    protected _fetch(options?: IModelRequestOptions | null, queryParams?: IModelRequestQueryParams, method?: string, body?: IAttributes, headers?: IAttributes): Promise<HttpRequest>;
    protected FetchComplete(e: IDispatcherEvent): void;
    protected FetchProgress(e: IDispatcherEvent): void;
    protected FetchParseAfter(e: IDispatcherEvent, options?: IAttributes): void;
}
