import { AxiosResponse } from 'axios';
import { IAttributes } from '../Interfaces.js';
import Cache from '../Cache.js';
import Core from '../Core.js';
export default class Request extends Core {
    static cachedResponses: Cache;
    private static pendingRequests;
    cacheOptions: {
        defaultTTL: number;
        enabled: boolean;
        maxSize: number;
    };
    dataKey: string;
    headers: Record<string, string>;
    loading: boolean;
    method: string;
    mode: string;
    request?: Promise<Request | Response | AxiosResponse<any>>;
    response?: AxiosResponse;
    responseData: IAttributes;
    status: number;
    url: string;
    withCredentials: boolean;
    constructor(url?: string, options?: Partial<IAttributes>);
    private generateCacheKey;
    private shouldUseCache;
    fetch(method: string | undefined, body: IAttributes | undefined, headers: IAttributes | undefined, ttl: number): Promise<Request>;
    private handleRequest;
    xhrFetch(url: string, params: any): any;
    static clearCache(): void;
    static getPendingRequests(): Map<string, Promise<AxiosResponse<any>>>;
    static removeCacheEntry(key: string): void;
    setHeader(header: string, value: string): any;
    setHeaders(headers: any): any;
    private beforeParse;
    private parse;
    private afterParse;
    private afterFetch;
    private afterAll;
    private afterAllError;
    private afterAny;
}
