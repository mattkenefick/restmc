import { IAttributes, IDispatchData, IProgressEvent, IRequest, IRequestEvent, IResponse } from '../Interfaces.js';
import Cache from '../Cache.js';
import CoreRequest from './Core.js';
import RequestError from '../Exception/Request.js';

export default class SocketRequest {
	// @todo
}

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Request
 * @project RestMC
 */
// export default class SocketRequest extends CoreRequest implements IRequest {
// 	/**
// 	 * Create a cache for previously sent requests.
// 	 *
// 	 * 11/07/22
// 	 * mk: This isn't completely hooked up yet. We're adding it now
// 	 * so we can add mock data requests that simulate cached entries
// 	 *
// 	 * @type Cache
// 	 */
// 	public static cachedResponses: Cache = new Cache();

// 	/**
// 	 * Response from socket
// 	 *
// 	 * @type @todo
// 	 */
// 	public response?: IRequestResponse;

// 	/**
// 	 * @param string url
// 	 * @param IAttributes options
// 	 */
// 	constructor(url: string = '', options: IAttributes = {}) {
// 		super();

// 		// Set url and datakey
// 		this.dataKey = options.dataKey || this.dataKey;

// 		// Set URL and remove common mistakes
// 		this.url = url;
// 		this.url = this.url.replace(/\?$/, '');
// 		this.url = this.url.replace(/\?&/, '?');
// 	}

// 	/**
// 	 * Actually fetch the data
// 	 *
// 	 * @param string method
// 	 * @param IAttributes body
// 	 * @param IAttributes headers
// 	 * @param number ttl
// 	 * @return Promise<Request | AxiosResponse<any>>
// 	 */
// 	public fetch(
// 		method: string = 'GET',
// 		body: IAttributes = {},
// 		headers: IAttributes = {},
// 		ttl: number = 0
// 	): Promise<IRequest> {
// 		const params: IAttributes = {};
// 		const requestEvent: IRequestEvent = {
// 			body,
// 			headers,
// 			method,
// 			params,
// 		};

// 		// Set request method
// 		this.method = (method || 'GET').toUpperCase();

// 		// Event trigger
// 		this.dispatch('fetch:before', { request: requestEvent });
// 		this.dispatch('requesting', { request: requestEvent });

// 		// Loading
// 		this.loading = true;

// 		return new Promise((resolve, reject) => {
// 			let cacheKey = `${params.method}.${params.url}`;

// 			// Get cache OR fetch new
// 			new Promise((resolveCacheLayer) => {
// 				// Find cache
// 				if (SocketRequest.cachedResponses.has(cacheKey)) {
// 					const result = SocketRequest.cachedResponses.get(cacheKey);

// 					// console.log('💾 Cached Response: ', cacheKey);
// 					resolveCacheLayer(result);
// 				} else if (SocketRequest.cachedResponses.has('any')) {
// 					const result = SocketRequest.cachedResponses.get('any');

// 					// console.log('💿 Any Cached Response');
// 					resolveCacheLayer(result);
// 				} else {
// 					// console.log('🚦 Requesting remote');

// 					// @todo perform SOCKET.IO request
// 					resolveCacheLayer(axios(params));
// 				}
// 			})
// 				.then((response: IRequestResponse) => {
// 					this.response = response;

// 					// Set response to cache
// 					if (ttl > 0) {
// 						SocketRequest.cachedResponses.set(cacheKey, response, ttl);
// 					}

// 					// Nothing to report
// 					if (!this.response) {
// 						return;
// 					}

// 					this.beforeParse(this.response);
// 					this.parse(this.response);
// 					this.afterParse(this.response);
// 					this.afterFetch(this.response);
// 					this.afterAll(this.response);
// 					this.afterAny();

// 					resolve(this);

// 					return response;
// 				})

// 				// This will catch the potential error thrown by afterParse
// 				// that raises issues 400+ or missing responses
// 				.catch((error: IResponseError) => {
// 					this.response = error.response as IResponse;

// 					this.afterAllError(error);
// 					this.afterAny();

// 					reject(this);

// 					return error;
// 				});
// 		});
// 	}
// }
