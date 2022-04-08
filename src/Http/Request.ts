// The node-fetch module creates failures in things like NativeScript which
// would use a built-in version of "fetch". Do we need this?
import axios, { AxiosResponse } from 'axios';
import {
	IAttributes,
	IAxiosConfig,
	IAxiosError,
	IAxiosResponse,
	IAxiosSuccess,
	IDispatcherEventData,
	IRequest,
} from '../Interfaces';
import Core from '../Core';
import RequestError from './RequestError';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Http
 * @project RestMC
 */
export default class Request extends Core implements IRequest {
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
	 * @param string url
	 * @param IAttributes options
	 */
	constructor(url: string = '', options: IAttributes = {}) {
		super();

		// Set url and datakey
		this.dataKey = options.dataKey || this.dataKey;

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
	 */
	public fetch(
		method: string = 'GET',
		body: IAttributes = {},
		headers: IAttributes = {},
	): Promise<Request | AxiosResponse<any>> {
		let params: any = {};

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
		params.withCredentials = true;
		params.onUploadProgress = (progressEvent: any) => {
			this.dispatch('progress', {
				loaded: progressEvent.loaded,
				ratio: progressEvent.loaded / progressEvent.total,
				total: progressEvent.total,
			});
		};

		// Event trigger
		this.dispatch('fetch:before', {
			body,
			headers,
			method,
			params,
		});

		// Is File?
		// @todo this is inaccurate and makes many requests (forgot password) think it's a file
		// var isFile =
		//     (!params.headers['Content-Type'] ||
		//         params.headers['Content-Type'].indexOf('multipart')) &&
		//     params.method.toLowerCase() === 'post';

		// Loading
		this.loading = true;

		// Events
		this.dispatch('requesting', {
			body,
			headers,
			method,
			params,
		});

		return new Promise((resolve, reject) => {
			axios(params)

				// @see https://axios-http.com/docs/res_schema
				// console.log(response.data);
				// console.log(response.status);
				// console.log(response.statusText);
				// console.log(response.headers);
				// console.log(response.config);
				.then((response: AxiosResponse<any>) => {
					this.response = response as IAxiosSuccess;

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
					this.response = error.response;

					this.afterAll(error);

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
					if (e.lengthComputable) {
						self.dispatch('progress', {
							loaded: e.loaded,
							ratio: e.loaded / e.total,
							total: e.total,
						});
					}
					else {
						self.dispatch('progress', {
							loaded: e.loaded,
							ratio: 1,
							total: e.total,
						});
					}
				};

				// xhr.onloadend = function(e: ProgressEvent) {
				//     const xhr: XMLHttpRequest = <XMLHttpRequest> e.currentTarget;
				//     var status = xhr.status;
				//     var json = JSON.parse(xhr.response);

				//     // Error
				//     if (status >= 400) {
				//         reject({
				//             status: status,
				//             statusText: json.status,
				//         });
				//         // throw new RequestError(status, json.status);
				//     }
				// }

				xhr.onload = function() {
					let blob = new Blob([xhr.response], { type: 'application/json' });
					let init = {
						status: xhr.status,
						statusText: xhr.statusText,
					};
					let response = new Response(xhr.response ? blob : null, init);

					// Resolved
					resolve(response);

					// if (xhr.status < 200 || xhr.status >= 300) {
					//     reject({ response });
					// }
					// else {
					//     resolve(response);
					// }
				};

				xhr.onerror = function() {
					reject({ request: xhr });
				};

				xhrSend.apply(xhr, xhrArguments);
			});
		};

		// Send cookies
		xhr.withCredentials = true;

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
	private beforeParse(response: IAxiosSuccess): IAxiosSuccess {
		this.log('before parse');

		// Trigger
		this.dispatch('parse:before', response);

		return response;
	}

	/**
	 * Parse data
	 *
	 * @param IAxiosSuccess response
	 */
	private parse(response: IAxiosSuccess): IAxiosSuccess {
		this.log('parse');

		// Trigger
		this.dispatch('parse:parsing', response);

		// Set data
		if (response.status != 204) {
			this.responseData = response.data;

			// this.data = await request.response.json();
		}

		// Trigger
		this.dispatch('parse', this.responseData);

		return response;
	}

	/**
	 * After data parsed
	 *
	 * @param IAxiosSuccess response
	 */
	private afterParse(response: IAxiosSuccess): IAxiosSuccess {
		this.log('after parse');

		// Check if we have a status in the JSON as well
		if (response.status >= 400 && response.data?.status) {
			const message: string = response.data?.message || response.data || '';

			throw new RequestError(response.status, message);
		}

		// Trigger
		this.dispatch('parse:after', response);

		return response;
	}

	/**
	 * @param IAxiosSuccess response
	 */
	private afterFetch(response: IAxiosSuccess): IAxiosSuccess {
		this.log('after fetch');

		// Trigger
		this.dispatch('fetch', response);

		// Trigger
		this.dispatch('fetch:after', response);

		// Not loading
		this.loading = false;

		return response;
	}

	/**
	 * @param IAxiosSuccess response
	 */
	private afterAll(e: IAxiosSuccess | IAxiosError): IAxiosSuccess | IAxiosError {
		function isError(e: any): e is IAxiosError {
			return 'name' in e;
		}

		const data: any = isError(e)
			? e.response?.data || e.message // IAxiosError
			: e.data; // IAxiosSuccess
		const status: number = isError(e)
			? e.response?.status // IAxiosError
			: e.status; // IAxiosSuccess
		const method: string = (e.config.method || 'get').toLowerCase();
		const event = e;

		// Log
		this.log('after all: ' + method + ' / ' + status);

		// Check request
		if (status < 400) {
			this.dispatch('complete', event);
			this.dispatch('complete:' + method, event);
		}
		else {
			// mk: Apparently, throw Error does same as dispatch 'error' which
			// causes duplicates when listening on('error' ...)
			// this.dispatch('error', e.data);
			this.responseData = data;
			this.dispatch('error', event);
			this.dispatch('error:' + method, event);
		}

		return e;
	}

	/**
	 * @param string msg
	 */
	private log(msg: string = ''): void {
		// console.log(' > ' + msg);
	}
}
