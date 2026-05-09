import Cache from '../Cache.js';
import Core from '../Core.js';
import RequestError from './RequestError.js';
import axios, { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import { IAttributes, IDispatchData, IProgressEvent, IRequestEvent } from '../Interfaces.js';
import { compactObjectHash } from '../Utility.js';

/**
 * The node-fetch module creates failures in things like NativeScript which
 * would use a built-in version of "fetch". Do we need this?
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Http
 * @project RestMC
 */
export default class Request extends Core {
	/**
	 * Enable dry-run mode to inspect requests without sending them.
	 *
	 * When true, fetch() will emit a 'dryrun' event with the would-be
	 * axios params and resolve immediately without performing the request.
	 */
	public dryRun: boolean = false;

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
	 * Tracks in-flight requests to prevent duplicates
	 * Map of cache keys to promises
	 *
	 * @type Map
	 */
	private static pendingRequests: Map<string, Promise<AxiosResponse<any>>> = new Map();

	/**
	 * If the most recent request was canceled.
	 *
	 * @type boolean
	 */
	public canceled: boolean = false;

	/**
	 * Human-readable reason supplied to cancel().
	 *
	 * @type string
	 */
	public cancelReason: string = '';

	/**
	 * Cache configuration options
	 */
	public cacheOptions = {
		defaultTTL: 1000 * 60 * 5,
		enabled: true,
		maxSize: 100,
	};

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
	public method: string = 'GET';

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
	public response?: AxiosResponse;

	/**
	 * Parsed data from response
	 *
	 * @type object
	 */
	public responseData: IAttributes = {};

	/**
	 * @type number
	 */
	public status: number = 0;

	/**
	 * @type string
	 */
	public url: string;

	/**
	 * @type boolean
	 */
	public withCredentials: boolean = true;

	/**
	 * Axios cancellation handle for the active request.
	 *
	 * @type CancelTokenSource | undefined
	 */
	private cancelSource: CancelTokenSource | undefined;

	/**
	 * @param string url
	 * @param IAttributes options
	 */
	constructor(url: string = '', options: Partial<IAttributes> = {}) {
		super();

		this.cacheOptions = {
			...this.cacheOptions,
			...(options.cacheOptions || {}),
		};
		this.dataKey = options.dataKey || this.dataKey;
		this.withCredentials = options.withCredentials ?? true;

		// Pass-through for dry-run enablement (option carried by Core)
		if (typeof (options as any).dryRun === 'boolean') {
			this.dryRun = (options as any).dryRun;
		}

		this.url = url.replace(/\?$/, '').replace(/\?&/, '?');
	}

	/**
	 * Generate a unique cache key for a request.
	 *
	 * The Authorization header is hashed (not embedded in plaintext) and included
	 * so that two users hitting the same URL with different bearer tokens do not
	 * share a cache entry. Without this, User A's response could be served to
	 * User B from the in-memory cache.
	 *
	 * @param IAttributes params
	 * @return string
	 */
	private generateCacheKey(params: IAttributes): string {
		const { method = 'GET', url = '', data = '', headers = {} } = params;
		const serializedData = ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? JSON.stringify(data) : '';
		const authHash = headers['Authorization'] ? compactObjectHash(headers['Authorization']) : '';

		return [
			method.toUpperCase(),
			url,
			serializedData,
			headers['Accept'] || '',
			headers['Content-Type'] || '',
			authHash,
		]
			.filter(Boolean)
			.join('|');
	}

	/**
	 * Determine if the request should use cache
	 *
	 * @param IAttributes params
	 * @return boolean
	 */
	private shouldUseCache(params: IAttributes): boolean {
		if (!this.cacheOptions.enabled || params.bypassCache) return false;
		if (params.method?.toUpperCase() !== 'GET') return false;
		const cacheControl = params.headers?.['Cache-Control'];
		const output = !cacheControl?.includes('no-cache');

		return output;
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
		ttl: number
	): Promise<Request> {
		const params: IAttributes = {};
		const requestEvent: IRequestEvent = {
			body,
			headers,
			method,
			params,
		};

		this.canceled = false;
		this.cancelReason = '';
		this.cancelSource = undefined;

		// Set ttl
		if (typeof ttl !== 'number' || isNaN(ttl)) {
			ttl = this.cacheOptions.defaultTTL;
		}

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
			const cacheKey = this.generateCacheKey(params);
			const useCache = this.shouldUseCache(params);

			// Dry-run: emit details and resolve without network
			if (this.dryRun) {
				const dryRunDetail = {
					axios: params,
					body: params.data,
					cacheKey,
					headers: params.headers,
					method: params.method,
					request: requestEvent,
					url: params.url,
					useCache,
				};

				this.dispatch('dryrun', dryRunDetail as unknown as IDispatchData);
				this.loading = false;
				this.status = 0; // non-2xx so callers won't treat as success side-effect

				// Finish lifecycle for listeners that expect finish toggles
				this.afterAny();
				resolve(this);
				return;
			}

			this.handleRequest(cacheKey, params, useCache, ttl)
				.then((response: AxiosResponse<any>) => {
					this.response = response;
					this.beforeParse(response);
					this.parse(response);
					this.afterParse(response);
					this.afterFetch(response);
					this.afterAll(response);
					this.afterAny();
					resolve(this);
				})
				.catch((error: AxiosError<any>) => {
					this.response = error.response;

					if (axios.isCancel(error)) {
						this.afterCancel(error);
						this.afterAny();
						reject(this);
						return;
					}

					this.afterAllError(error);
					this.afterAny();
					reject(this);
				});
		});
	}

	/**
	 * Handle request logic, including caching and deduplication
	 *
	 * @param string cacheKey
	 * @param IAttributes params
	 * @param boolean useCache
	 * @param number ttl
	 * @return Promise<AxiosResponse<any>>
	 */
	private async handleRequest(
		cacheKey: string,
		params: IAttributes,
		useCache: boolean,
		ttl: number
	): Promise<AxiosResponse<any>> {
		// Mock fallback: ActiveRecord.mock() / setMockData('any', ...) parks
		// a one-shot response under the literal key 'any'. Real cache keys
		// are content hashes so they can never collide with this sentinel.
		// Honor it before the normal cache lookup so callers don't have to
		// know the generated key, and so it works regardless of useCache.
		if (Request.cachedResponses.has('any')) {
			const mockResponse = Request.cachedResponses.get('any');
			this.dispatch('cache:hit', {
				cacheKey: 'any',
				response: mockResponse,
			});

			return mockResponse;
		}

		if (useCache && Request.cachedResponses.has(cacheKey)) {
			const cachedResponse = Request.cachedResponses.get(cacheKey);
			this.dispatch('cache:hit', {
				cacheKey: cacheKey,
				response: cachedResponse,
			});

			return cachedResponse;
		}

		if (Request.pendingRequests.has(cacheKey)) {
			const pendingResponse = Request.pendingRequests.get(cacheKey);

			if (pendingResponse) {
				this.dispatch('request:deduped', { cacheKey });
				return pendingResponse;
			}
		}

		this.cancelSource = axios.CancelToken.source();
		params.cancelToken = this.cancelSource.token;

		const requestPromise = axios(params)
			.then((response) => {
				if (useCache && response.status >= 200 && response.status < 300) {
					Request.cachedResponses.set(cacheKey, response, ttl);
					this.dispatch('cache:set', { cacheKey, response });
				}

				this.cancelSource = undefined;
				Request.pendingRequests.delete(cacheKey);
				return response;
			})
			.catch((error) => {
				this.cancelSource = undefined;
				Request.pendingRequests.delete(cacheKey);
				throw error;
			});

		Request.pendingRequests.set(cacheKey, requestPromise);
		this.dispatch('request:pending', { cacheKey });

		return requestPromise;
	}

	/**
	 * Cancel the active HTTP request, if one exists.
	 *
	 * @param string reason
	 * @return boolean
	 */
	public cancel(reason: string = 'Request canceled'): boolean {
		if (!this.cancelSource || !this.loading) {
			return false;
		}

		this.canceled = true;
		this.cancelReason = reason;
		this.cancelSource.cancel(reason);

		return true;
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
		const xhr = new XMLHttpRequest();
		xhr.open(params.method, url);

		// Set Headers
		for (const key in params.headers) {
			xhr.setRequestHeader(key, params.headers[key]);
		}

		xhr.withCredentials = this.withCredentials;

		return new Promise((resolve, reject) => {
			xhr.upload.onprogress = (e) => {
				const progressEvent: IProgressEvent = {
					loaded: e.loaded,
					total: e.total,
					ratio: e.lengthComputable ? e.loaded / e.total : 1,
				};
				this.dispatch('progress', { progress: progressEvent });
			};

			xhr.onload = () => {
				const blob = new Blob([xhr.response], { type: 'application/json' });
				const response = new Response(xhr.response ? blob : null, {
					status: xhr.status,
					statusText: xhr.statusText,
				});
				resolve(response);
			};

			xhr.onerror = () => reject({ request: xhr });
			xhr.send(params.body);
		});
	}

	/**
	 * Clear all cached responses
	 *
	 * @return void
	 */
	public static clearCache(): void {
		Request.cachedResponses = new Cache();
	}

	/**
	 * Get all pending requests
	 *
	 * @return Map<string, Promise<AxiosResponse<any>>
	 */
	public static getPendingRequests(): Map<string, Promise<AxiosResponse<any>>> {
		return Request.pendingRequests;
	}

	/**
	 * Remove a specific cache entry
	 *
	 * @param string key
	 * @return void
	 */
	public static removeCacheEntry(key: string): void {
		Request.cachedResponses.delete(key);
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
	 * Before parsing data. Both JSON validity and HTTP error detection
	 * are handled by axios upstream — error responses reject the promise
	 * and never reach this hook, and JSON parsing happens in the axios
	 * adapter before the response object is built.
	 *
	 * @param response AxiosResponse<any>
	 */
	private beforeParse(response: AxiosResponse<any>): void {
		// Trigger
		this.dispatch('parse:before', {
			request: this,
			response: response,
		});
	}

	/**
	 * Parse data
	 *
	 * @param AxiosResponse<any> response
	 * @return AxiosResponse<any>
	 */
	private parse(response: AxiosResponse<any>): void {
		// Trigger
		this.dispatch('parse:parsing', {
			request: this,
			response: response,
		});

		// Set data
		if (response.status !== 204) {
			this.responseData = response.data;
		}

		// Trigger
		this.dispatch('parse', {
			request: this,
			response: response,
		});
	}

	/**
	 * @param AxiosResponse<any> response
	 * @return void
	 */
	private afterParse(response: AxiosResponse<any>): void {
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
	 * @param AxiosResponse<any> response
	 * @return void
	 */
	private afterFetch(response: AxiosResponse<any>): void {
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
	 * @param AxiosResponse<any> response
	 * @return void
	 */
	private afterAll(e: AxiosResponse<any>): void {
		if (e === undefined) {
			return;
		}

		const status: number = e.status;
		const method: string = (e.config?.method || 'get').toLowerCase();

		// Set status
		this.status = status;

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
	 * @param AxiosResponse<any> response
	 * @return void
	 */
	private afterAllError(e: AxiosError<any>): void {
		const data: any = e.message || 'Unknown error';
		const status: number = e.response?.status || 503; // Default to 503 Service Unavailable
		const method: string = (e.config?.method || 'get').toLowerCase();

		// mk: Apparently, throw Error does same as dispatch 'error' which
		// causes duplicates when listening on('error' ...)
		// this.dispatch('error', e.data);
		this.responseData = data;

		// Set status
		this.status = status;

		this.dispatch('error', {
			request: this,
			response: e,
		});

		this.dispatch('error:' + method, {
			request: this,
			response: e,
		});
	}

	/**
	 * @param AxiosError<any> e
	 * @return void
	 */
	private afterCancel(e: AxiosError<any>): void {
		const reason: string = (e as any).message || this.cancelReason || 'Request canceled';

		this.canceled = true;
		this.cancelReason = reason;
		this.loading = false;
		this.responseData = {
			canceled: true,
			message: reason,
		};
		this.status = 0;

		this.dispatch('cancel', {
			reason: reason,
			request: this,
			response: e,
		});
	}

	/**
	 * @param AxiosResponse<any> response
	 * @return void
	 */
	private afterAny(): void {
		this.dispatch('finish', { request: this });
	}
}
