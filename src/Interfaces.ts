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

export interface IAxiosResponse {
	config: IAxiosConfig;
	data?: any;
	headers: any;
	request: XMLHttpRequest;
	status: number;
	statusText: string;
}

export interface IRequestEvent extends IDispatcherEvent {
	target: IRequest;
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
	pagination: IPagination;
}

export interface IDispatcher {
	dispatch: (eventName: string, data?: any) => any;
	off: (eventName: string, callback?: any) => any;
	on: (eventName: string, callback: (data?: any) => void) => any;
	trigger: (eventName: string, data?: any) => any;
}

export interface IDispatcherCallbackFunction {
	(eventData?: Record<string, unknown>): any;
}

export interface IDispatcherEventEvent {
	name: string;
}

export interface IDispatcherEvent {
	eventData: any; // data set by dispatch('', ...)
	event: IDispatcherEventEvent;
	target: any; // class executing event
}

export interface IDispatcherEventData {
	[key: string]: unknown;
}

export interface IModelRequestOptions {
	id?: number | string;
	includes?: string[];
}

export interface IModelRequestQueryParams {
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
	headers: any;
	loading: boolean;
	mode: string;
	request?: Promise<any>;
	response?: IAxiosResponse | IAxiosSuccess;
	responseData: IAttributes;
	url: string;
}

export interface ISortOptions {
	[key: string]: unknown;
	reverse?: boolean;
}
