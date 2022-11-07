// The node-fetch module creates failures in things like NativeScript which
// would use a built-in version of "fetch". Do we need this?
import axios, { AxiosResponse } from 'axios';
import {
	IAttributes,
	IAxiosConfig,
	IAxiosError,
	IAxiosResponse,
	IAxiosSuccess,
	IDispatchData,
	IProgressEvent,
	IRequest,
	IRequestEvent,
	IResponse,
} from '../Interfaces';
import Cache from '../Cache';
import Core from '../Core';
import RequestError from './RequestError';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Http
 * @project RestMC
 */
export default class Request extends Core implements IRequest {
	/**
	 * Create a cache for previously sent requests.
	 *
	 * 11/07/22
	 * mk: This isn't completely hooked up yet. We're adding it now
	 * so we can add mock data requests that simulate cached entries
	 *
	 * @type Cache
	 */
	public static cachedResponses: Cache = new Cache();

	/**
	 * Represents the expected key to find our data on in remote responses.
	 * It's frequently found on 'data':
	 *
	 * {
	 *     "data": [ ... ]
	 * }
	 *
	 * @type string
	 */
	public dataKey: string = 'data';

	/**
	 * Do not set the 'Content-Type' here because it wont be
	 * overridden; which will break file uploads.
	 *
	 * @type string
	 */
	public headers: Record<string, string> = {};

	/**
	 * If this Request is currently loading
	 *
	 * @type boolean
	 */
	public loading: boolean = false;

	/**
	 * Method (get, post, patch, ...)
	 *
	 * @type string
	 */
	public method: string = 'get';

	/**
	 * Mode (cors, no-cors, same-origin, navigate)
	 *
	 * @type string
	 */
	public mode: string = 'cors';

	/**
	 * Last fetch
	 *
	 * @type Promise<Repsonse>
	 */
	public request?: Promise<Request | Response | AxiosResponse<any>>;

	/**
	 * Response from fetch
	 *
	 * @type Response
	 */
	public response?: IAxiosResponse | IAxiosSuccess;

	/**
	 * Parsed data from response
	 *
	 * @type object
	 */
	public responseData: IAttributes = {};

	/**
	 * @type string
	 */
	public url: string;

	/**
	 * @type boolean
	 */
	public withCredentials: boolean = true;

	/**
	 * @param string url
	 * @param IAttributes options
	 */
	constructor(url: string = '', options: IAttributes = {}) {
		super();

		// Set url and datakey
		this.dataKey = options.dataKey || this.dataKey;

		// Set withCredentials
		this.withCredentials = options.hasOwnProperty('withCredentials') ? options.withCredentials : true;

		// Set URL and remove common mistakes
		this.url = url;
		this.url = this.url.replace(/\?$/, '');
		this.url = this.url.replace(/\?&/, '?');
	}

	/**
	 * Actually fetch the data
	 *
	 * @param string method
	 * @param IAttributes body
	 * @param IAttributes headers
	 * @param number ttl
	 * @return Promise<Request | AxiosResponse<any>>
	 */
	public fetch(
		method: string = 'GET',
		body: IAttributes = {},
		headers: IAttributes = {},
		ttl: number = 0,
	): Promise<Request | AxiosResponse<any>> {
		const params: IAttributes = {};
		const requestEvent: IRequestEvent = {
			body,
			headers,
			method,
			params,
		};

		// Set request method
		this.method = (method || 'GET').toUpperCase();

		// Combine headers
		headers = Object.assign(this.headers, headers);

		// Fetch params
		params.data = body;
		params.headers = headers;
		params.method = this.method;
		params.redirect = 'follow';
		params.url = this.url;
		params.withCredentials = this.withCredentials;
		params.onUploadProgress = (event: any) => {
			const progressEvent: IProgressEvent = {
				loaded: event.loaded,
				ratio: event.loaded / event.total,
				total: event.total,
			};

			this.dispatch('progress', { progress: progressEvent });
		};

		// Event trigger
		this.dispatch('fetch:before', { request: requestEvent });

		// Loading
		this.loading = true;

		// Events
		this.dispatch('requesting', { request: requestEvent });

		return new Promise((resolve, reject) => {
			let cacheKey = `${params.method}.${params.url}`;

			new Promise((resolve) => {
				// Find cache
				if (Request.cachedResponses.has(cacheKey)) {
					const result = Request.cachedResponses.get(cacheKey);
					console.log('💾 Cached Response: ', cacheKey);
					resolve(result);
				}
				else {
					console.log('🚦 Requesting remote');
					resolve(axios(params));
				}
			})

				// @see https://axios-http.com/docs/res_schema
				// console.log(response.data);
				// console.log(response.status);
				// console.log(response.statusText);
				// console.log(response.headers);
				// console.log(response.config);
				.then((response: AxiosResponse<any>) => {
					// @ts-ignore
					this.response = response;

					// Set response to cache
					if (ttl > 0) {
						Request.cachedResponses.set(cacheKey, response, ttl);
					}

					// Nothing to report
					if (!this.response) {
						return;
					}

					this.beforeParse(this.response);
					this.parse(this.response);
					this.afterParse(this.response);
					this.afterFetch(this.response);
					this.afterAll(this.response);

					resolve(this);

					return response;
				})

				// @see https://axios-http.com/docs/handling_errors
				// console.log(error.response?.data);
				// console.log(error.response?.status);
				// console.log(error.response?.headers);
				// console.log(error.request?);
				// console.log(error.message?);
				.catch((error: IAxiosError) => {
					this.response = error.response as IResponse;

					// Network Errors will not return a response
					// if (!this.response) {
					// 	return;
					// }

					this.afterAllError(error);

					reject(this);

					return error;
				});
		});
	}

	/**
	 * XHR Fetch
	 *
	 * Specifically for file uploaders
	 * I don't think we use this anymore.
	 *
	 * XMLHttpRequest
	 *     onabort: null
	 *     onerror: ƒ ()
	 *     onload: ƒ ()
	 *     onloadend: ƒ (e)
	 *     onloadstart: null
	 *     onprogress: ƒ (e)
	 *     onreadystatechange: null
	 *     ontimeout: null
	 *     readyState: 4
	 *     response: "{"id":262,"url":"https:\/\/static.sotw.com\/media\/film\/154\/5f2d54d1c26dc.jpg",
	 *     responseText: "{"id":262,"url":"https:\/\/static.sotw.com\/media\/film\/154\/5f2d54d1c26dc.jpg",
	 *     responseType: ""
	 *     responseURL: "https://api.sotw.com/v1/film/154/media?&mediaType=1&imageType=4&videoType=4&limit=15&page=1"
	 *     responseXML: null
	 *     send: ƒ ()
	 *     status: 200
	 *     statusText: "OK"
	 *     timeout: 0
	 *     upload: XMLHttpRequestUpload {onloadstart: null, onprogress: null, onabort: null, onerror: null, onload: null, …}
	 *     withCredentials: false
	 *
	 * Response
	 *     body: (...)
	 *     bodyUsed: false
	 *     headers: Headers {}
	 *     ok: true
	 *     redirected: false
	 *     status: 200
	 *     statusText: ""
	 *     type: "default"
	 *     url: ""
	 *
	 * @param  {string} url
	 * @param  {any} params
	 * @return {any}
	 */
	public xhrFetch(url: string, params: any): any {
		let self = this;
		let xhr = new XMLHttpRequest();

		// Open Request
		xhr.open(params.method, url);

		// Set Headers
		for (let key in params.headers) {
			xhr.setRequestHeader(key, params.headers[key]);
		}

		// Copy old `send`
		const xhrSend = xhr.send;

		// Create new `send`
		xhr.send = function() {
			const xhrArguments: any = arguments;

			return new Promise(function(resolve, reject) {
				xhr.upload.onprogress = function(e) {
					const progressEvent: IProgressEvent = {
						loaded: e.loaded,
						ratio: 1,
						total: e.total,
					};

					if (e.lengthComputable) {
						progressEvent.ratio = e.loaded / e.total;
					}

					self.dispatch('progress', { progress: progressEvent });
				};

				xhr.onload = function() {
					let blob = new Blob([xhr.response], { type: 'application/json' });
					let init = {
						status: xhr.status,
						statusText: xhr.statusText,
					};
					let response = new Response(xhr.response ? blob : null, init);

					resolve(response);
				};

				xhr.onerror = function() {
					reject({ request: xhr });
				};

				xhrSend.apply(xhr, xhrArguments);
			});
		};

		// Send cookies
		xhr.withCredentials = this.withCredentials;

		return xhr.send(params.body);
	}

	/**
	 * @param string header
	 * @param string value
	 * @return self
	 */
	public setHeader(header: string, value: string): any {
		this.headers[header] = value;
		return this;
	}

	/**
	 * Override and set headers
	 *
	 * @param object headers
	 * @return self
	 */
	public setHeaders(headers: any): any {
		this.headers = headers;
		return this;
	}

	/**
	 * Before parsing data
	 *
	 * @todo Check if we have valid JSON
	 * @todo Check if the request was an error
	 *
	 * @param e IAxiosResponse
	 */
	private beforeParse(response: IAxiosSuccess): void {
		// Trigger
		this.dispatch('parse:before', {
			request: this,
			response: response,
		});
	}

	/**
	 * Parse data
	 *
	 * @param IAxiosSuccess response
	 * @return IAxiosSuccess
	 */
	private parse(response: IAxiosSuccess): void {
		// Trigger
		this.dispatch('parse:parsing', {
			request: this,
			response: response,
		});

		// Set data
		if (response.status != 204) {
			this.responseData = response.data;
		}

		// Trigger
		this.dispatch('parse', {
			request: this,
			response: response,
		});
	}

	/**
	 * @param IAxiosSuccess response
	 * @return void
	 */
	private afterParse(response: IAxiosSuccess): void {
		// Check if we have a status in the JSON as well
		if (response.status >= 400 && response.data?.status) {
			const message: string = response.data?.message || response.data || '';

			throw new RequestError(response.status, message);
		}

		// Trigger
		this.dispatch('parse:after', {
			request: this,
			response: response,
		});
	}

	/**
	 * @param IAxiosSuccess response
	 * @return void
	 */
	private afterFetch(response: IAxiosSuccess): void {
		// Trigger
		this.dispatch('fetch', {
			request: this,
			response: response,
		});

		this.dispatch('fetch:after', {
			request: this,
			response: response,
		});

		// Not loading
		this.loading = false;
	}

	/**
	 * @param IAxiosSuccess response
	 * @return void
	 */
	private afterAll(e: IAxiosSuccess): void {
		if (e === undefined) {
			return;
		}

		const data: any = e.data;
		const status: number = e.status;
		const method: string = (e.config?.method || 'get').toLowerCase();

		// Check request
		this.dispatch('complete', {
			request: this,
			response: e,
		});

		this.dispatch('complete:' + method, {
			request: this,
			response: e,
		});
	}

	/**
	 * @param IAxiosSuccess response
	 * @return void
	 */
	private afterAllError(e: IAxiosError): void {
		const data: any = e.message || 'Unknown error';
		const status: number = e.response?.status || 503; // Default to 503 Service Unavailable
		const method: string = (e.config?.method || 'get').toLowerCase();

		// mk: Apparently, throw Error does same as dispatch 'error' which
		// causes duplicates when listening on('error' ...)
		// this.dispatch('error', e.data);
		this.responseData = data;

		this.dispatch('error', {
			request: this,
			response: e,
		});

		this.dispatch('error:' + method, {
			request: this,
			response: e,
		});
	}
}
