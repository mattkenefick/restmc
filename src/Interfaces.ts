export interface IAttributes {
	[key: string]: any;
}

export interface IAxiosConfig {
	adapter?: any;
	data?: any;
	headers?: any;
	maxBodyLength?: number;
	maxContentLength?: number;
	method?: string;
	redirect?: string;
	timeout?: number;
	transformRequest?: any;
	transformResponse?: any;
	transitional?: any;
	url?: string;
	validateStatus?: any;
	withCredentials?: boolean;
	xsrfCookieName?: string;
	xsrfHeaderName?: string;
}

export interface IAxiosError {
	config: IAxiosConfig;
	isAxiosError: boolean;
	message?: string;
	request: XMLHttpRequest;
	response: IAxiosResponse;
}

export interface IAxiosSuccess extends IAxiosResponse {}

export interface IAxiosResponse extends IResponse {
	config?: any;
}

export interface ICachedItem {
	immutable: boolean;
	time: number;
	ttl: number;
	value: any;
}

export interface ICachedResponse {
	complete?: boolean;
	failed?: boolean;
	subscribers?: any[];
	time?: number;
	ttl?: number;
	value?: any;
}

export interface ICachedResponses {
	[key: string]: ICachedResponse;
}
export interface ICollectionChange {
	from: string;
}

export interface ICollectionMeta {
	pagination?: IPagination;
}

export interface IDispatchData {
	[key: string]: unknown;
}

export interface IDispatcher {
	dispatch: (eventName: string, detail?: IDispatchData) => any;
	off: (eventName: string, callback?: IDispatcherCallbackFunction) => any;
	on: (eventName: string, callback: IDispatcherCallbackFunction) => any;
	trigger: (eventName: string, detail?: IDispatchData) => boolean;
}

export interface IDispatcherCallbackFunction {
	(event: IDispatcherEvent): any;
}

export interface IDispatcherEvent {
	detail: IDispatchData | any;
	name: string;
}

export interface IFetchEvent {
	body: any;
	headers: any;
	method: string;
	params: any;
}

export interface IModelRequestOptions {
	id?: number | string;
	includes?: string[];
}

export interface IModelRequestQueryParams {
	[key: string]: any;
}

export interface IOptions {
	[key: string]: any;
}

export interface IPagination {
	total: number;
	count: number;
	per_page: number;
	current_page: number;
	total_pages: number;
	links?: any;
}

export interface IProgressEvent {
	loaded: number;
	ratio: number;
	total: number;
}

export interface IRequest {
	dataKey: string;
	headers: Record<string, string>;
	loading: boolean;
	method?: string;
	mode: string;
	request?: Promise<any>;
	response?: IAxiosResponse | IAxiosSuccess;
	responseData: IAttributes;
	status: number;
	url: string;
}

export interface IHttpRequest extends IRequest {
	method: string;
}

export interface IRequestResponse extends IResponse {}

export interface IRequestEvent {
	body: any;
	headers: any;
	method: string;
	params: any;
}

export interface IResponse {
	data?: any;
	headers: any;
	request: XMLHttpRequest;
	status: number;
	statusText: string;
}

export interface IResponseError {
	response: IRequestResponse;
}

export interface ISortOptions {
	[key: string]: unknown;
	reverse?: boolean;
}
