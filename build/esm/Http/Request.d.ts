import { AxiosResponse } from 'axios';
import { IAttributes, IAxiosResponse, IAxiosSuccess, IRequest } from '../Interfaces';
import Core from '../Core';
export default class Request extends Core implements IRequest {
    dataKey: string;
    headers: Record<string, string>;
    loading: boolean;
    method: string;
    mode: string;
    request?: Promise<Request | Response | AxiosResponse<any>>;
    response?: IAxiosResponse | IAxiosSuccess;
    responseData: IAttributes;
    url: string;
    withCredentials: boolean;
    constructor(url?: string, options?: IAttributes);
    fetch(method?: string, body?: IAttributes, headers?: IAttributes): Promise<Request | AxiosResponse<any>>;
    xhrFetch(url: string, params: any): any;
    setHeader(header: string, value: string): any;
    setHeaders(headers: any): any;
    private beforeParse;
    private parse;
    private afterParse;
    private afterFetch;
    private afterAll;
    private log;
}
