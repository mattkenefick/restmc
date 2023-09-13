import { AxiosResponse } from 'axios';
import { IAttributes, IAxiosResponse, IAxiosSuccess, IRequest } from '../Interfaces.js';
import Cache from '../Cache.js';
import Core from '../Core.js';
export default class Request extends Core implements IRequest {
    static cachedResponses: Cache;
    dataKey: string;
    headers: Record<string, string>;
    loading: boolean;
    method: string;
    mode: string;
    request?: Promise<Request | Response | AxiosResponse<any>>;
    response?: IAxiosResponse | IAxiosSuccess;
    responseData: IAttributes;
    status: number;
    url: string;
    withCredentials: boolean;
    constructor(url?: string, options?: IAttributes);
    fetch(method?: string, body?: IAttributes, headers?: IAttributes, ttl?: number): Promise<Request>;
    xhrFetch(url: string, params: any): any;
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
