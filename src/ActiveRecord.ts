import {
	IAttributes,
	IAxiosResponse,
	IAxiosSuccess,
	ICachedResponse,
	ICachedResponses,
	IDispatcherCallbackFunction,
	IModelRequestOptions,
	IModelRequestQueryParams,
	IProgressEvent,
	IRequest,
	IRequestEvent,
} from './Interfaces';
import { AxiosResponse } from 'axios';
import Builder from './Http/Builder';
import Core from './Core';
import HttpRequest from './Http/Request';

/**
 * Union type
 */
type FetchResponse = Promise<HttpRequest>;

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package RestMC
 * @project RestMC
 */
export default class ActiveRecord<T> extends Core {
	/**
	 * @return Builder
	 */
	public get b(): Builder<T> {
		return this.builder;
	}

	/**
	 * It's a Model if it has an ID or explicitly identified by Model
	 *
	 * @return boolean
	 */
	protected get isModel(): boolean {
		return this.builder.id != '';
	}

	/**
	 * @type IAttributes
	 */
	public attributes: IAttributes = {};

	/**
	 * @type string
	 */
	public baseUrl: string = '/v1';

	/**
	 * Body for POST
	 *
	 * @type IAttributes
	 */
	public body: IAttributes;

	/**
	 * Applies a cache buster query param if FALSE
	 *
	 * @type boolean
	 */
	public cacheable: boolean = true;

	/**
	 * @type string
	 */
	public cid: string = '';

	/**
	 * https://api.example.com/v1/{endpoint}
	 *
	 * @type string
	 */
	public endpoint: string = '';

	/**
	 * Optional override for DELETEs
	 *
	 * https://api.example.com/v1/{endpointDelete}
	 *
	 * @type string | undefined
	 */
	public endpointDelete: string | undefined;

	/**
	 * Optional override for POSTs
	 *
	 * https://api.example.com/v1/{endpointPost}
	 *
	 * @type string | undefined
	 */
	public endpointPost: string | undefined;

	/**
	 * Optional override for PUTs
	 *
	 * https://api.example.com/v1/{endpointPut}
	 *
	 * @type string | undefined
	 */
	public endpointPut: string | undefined;

	/**
	 * @type boolean
	 */
	public hasFetched: boolean = false;

	/**
	 * @type boolean
	 */
	public hasLoaded: boolean = false;

	/**
	 * @type Record<string, null | number | string>
	 */
	public headers: Record<string, null | number | string> = {};

	/**
	 * @type string
	 */
	public id: string = '';

	/**
	 * @type number
	 */
	public limit: number = 30;

	/**
	 * @type boolean
	 */
	public loading: boolean = false;

	/**
	 * Meta data supplied by the server adjacent to datas
	 *
	 * @type IAttributes
	 */
	public meta: IAttributes = {};

	/**
	 * Where to position our modified endpoint (before or after)
	 *
	 * @type string
	 */
	public modifiedEndpointPosition: string = 'before';

	/**
	 * @type number
	 */
	public page: number = 1;

	/**
	 * Reference to parent object with a relationship is involved
	 * e.g. model.hasOne('review').parent === model
	 *
	 * @type ActiveRecord
	 */
	public parent: ActiveRecord<any> | undefined;

	/**
	 * @type HttpRequest
	 */
	public request?: HttpRequest;

	/**
	 * @type number
	 */
	public requestTime: number = -1;

	/**
	 * @type Builder
	 */
	protected builder: Builder<T>;

	/**
	 * @type string
	 */
	protected cidPrefix: string = 'c';

	/**
	 * The key that collection data exists on, e.g.
	 *
	 * {
	 *     data: [ .. ]
	 * }
	 *
	 * @type string
	 */
	protected dataKey: string | undefined = 'data';

	/**
	 * Saves fetch arguments from our last request:
	 *
	 *      body
	 *      headers
	 *      method
	 *      options
	 *      queryParams
	 *
	 * @type IAttributes
	 */
	protected lastRequest: any;

	/**
	 * Function to call before a loading hook is triggered
	 *
	 * @type function | undefined
	 */
	protected loadingHookPre: IDispatcherCallbackFunction | undefined;

	/**
	 * Function to call after a loading hook is triggered
	 *
	 * @type function | undefined
	 */
	protected loadingHookPost: IDispatcherCallbackFunction | undefined;

	/**
	 * Reference to ActiveRecord we are using for our modified endpoint
	 *
	 * @type ActiveRecord<any>
	 */
	protected referenceForModifiedEndpoint: ActiveRecord<any> | undefined;

	/**
	 * We have a function called "runLast" that will execute the last request
	 * to be used primarily around authorization issues where new tokens
	 * are distributed. This key will prevent a recursion loop.
	 *
	 * @type number
	 */
	protected runLastAttempts: number = 0;

	/**
	 * How many times we're allowed to execute "runLast" before we quit the loop
	 *
	 * @type number
	 */
	protected runLastAttemptsMax: number = 2;

	/**
	 * @param IAttributes options
	 */
	constructor(options: IAttributes = {}) {
		super(options);

		// Set options on class
		Object.assign(this, options);

		// Set defaults
		this.body = {};
		this.cid = this.cidPrefix + Math.random().toString(36).substr(2, 5);
		this.parent = undefined;

		// Set default content type header
		this.setHeader('Content-Type', 'application/json; charset=utf8');

		// Setup URL builder
		this.builder = new Builder<T>(this);

		// Set options
		this.options(options);
	}

	/**
	 * e.g. model.attr('username');
	 *
	 * @param string key
	 * @return number | string | null
	 */
	public attr(key: string): string | number | null {
		return this.attributes[key];
	}

	/**
	 * Set data to our attributes object. It traditionally fires a 'set' event,
	 * but we can silence that by setting `trigger` to false.
	 *
	 * @param IAttributes attributes
	 * @param IAttributes options
	 * @param boolean trigger
	 * @return ActiveRecord
	 */
	public set(attributes: IAttributes = {}, options: IAttributes = {}, trigger: boolean = true): ActiveRecord<T> {
		// @ts-ignore
		let possibleSetters = Object.getOwnPropertyDescriptors(this.__proto__);

		// Set key/value relationship on `attributes`, but also on class if it's an intended root property
		// @todo I forget why we added the setters bit
		for (let key in attributes) {
			this.attributes[key] = attributes[key];

			// Check for setters
			if (possibleSetters && possibleSetters[key] && possibleSetters[key].set) {
				this[key] = attributes[key];
			}
		}

		// Check for ID
		if (attributes && attributes['id']) {
			this.id = attributes.id;
		}

		// Trigger
		if (trigger) {
			this.dispatch('set');
		}

		return this;
	}

	/**
	 * @param string key
	 * @return ActiveRecord
	 */
	public unset(key: string): ActiveRecord<T> {
		delete this.attributes[key];
		return this;
	}

	/**
	 * Accepts special options:
	 *
	 *  baseUrl
	 *  endpoint
	 *  headers
	 *  meta
	 *  params | qp | queryParams
	 *
	 * @param IAttributes options
	 * @return ActiveRecord
	 */
	public options(options: IAttributes = {}): ActiveRecord<T> {
		// Override baseUrl
		if (options.baseUrl) {
			this.baseUrl = options.baseUrl;
		}

		// Override endpoint
		if (options.endpoint) {
			this.setEndpoint(options.endpoint);
		}

		// Check options for headers
		if (options.headers) {
			this.setHeaders(options.headers);
		}

		// Set metadata
		if (options.meta) {
			// Increase count
			// mk: This is kind of wonky...
			if (options.merge) {
				if (options.meta.pagination.count && this.meta.pagination.count) {
					options.meta.pagination.count += this.meta.pagination.count;
				}
			}

			// Set
			this.meta = options.meta;
		}

		// Check options for params
		if (options.params || options.qp || options.queryParams) {
			this.setQueryParams(options.queryParams || options.qp || options.params);
		}

		return this;
	}

	/**
	 * Converts model to JSON object
	 *
	 * @return object
	 */
	public toJSON(): object {
		let json: any = this.attributes;

		// @todo is this code copasetic?
		// @ts-ignore
		let possibleGetters = Object.getOwnPropertyNames(this.__proto__);

		// Convert toJSON on subobjects so they stay in sync
		for (let key of possibleGetters) {
			// @ts-ignore
			if (json[key] && this[key] && this[key].toJSON) {
				// @ts-ignore
				json[key] = this[key].toJSON();
			}
		}

		return json;
	}

	// region: Actions
	// -------------------------------------------------------------------------

	/**
	 * @param IAttributes attributes
	 * @return FetchResponse
	 */
	public create(attributes: IAttributes): FetchResponse {
		return this.post(attributes);
	}

	/**
	 * @param IAttributes attributes
	 * @return FetchResponse
	 */
	public delete(attributes: IAttributes = {}): FetchResponse {
		const url: string = this.builder.identifier(this.id || attributes?.id || '').getUrl();

		return this._fetch(null, {}, 'DELETE', attributes, this.headers);
	}

	/**
	 * @param IAttributes attributes
	 * @return FetchResponse
	 */
	public post(attributes: IAttributes = {}): FetchResponse {
		const url: string = this.builder.getUrl();

		return this._fetch(null, {}, 'POST', attributes, this.headers);
	}

	/**
	 * @param IAttributes attributes
	 * @return FetchResponse
	 */
	public put(attributes: IAttributes): FetchResponse {
		const url: string = this.builder.getUrl();

		return this._fetch(null, {}, 'PUT', attributes, this.headers);
	}

	/**
	 * @param IAttributes attributes
	 * @return FetchResponse
	 */
	public save(attributes: IAttributes): FetchResponse {
		const method: string = this.id ? 'PUT' : 'POST';

		return this._fetch(null, {}, method, attributes, this.headers);
	}

	/**
	 * Interface for Collection
	 *
	 * @param IAttributes attributes
	 * @return ActiveRecord
	 */
	public add(attributes: IAttributes): ActiveRecord<T> {
		return this.set(attributes);
	}

	/**
	 * @return ActiveRecord
	 */
	public reset(): ActiveRecord<T> {
		this.attributes = {};

		// Event
		this.dispatch('reset');

		return this;
	}

	/**
	 * Add loading hooks on a collection for a view
	 *
	 * @param ViewBase view
	 * @param Function | undefined preHook
	 * @param Function | undefined postHook
	 * @return this
	 */
	public addLoadingHooks(
		view: any,
		preHook: IDispatcherCallbackFunction | undefined = undefined,
		postHook: IDispatcherCallbackFunction | undefined = undefined,
	): ActiveRecord<T> {
		// Remove existing hooks
		this.removeLoadingHooks();

		// Set preloading hook
		this.loadingHookPre = () => {
			return (preHook || view?.loading?.bind(view) || function() {})();
		};

		// Set postloading hook
		this.loadingHookPost = () => {
			return (postHook || view?.notloading?.bind(view) || function() {})();
		};

		// Set events
		this.loadingHookPost && this.on('complete', this.loadingHookPost);
		this.loadingHookPost && this.on('error', this.loadingHookPost);
		this.loadingHookPre && this.on('requesting', this.loadingHookPre);

		return this;
	}

	/**
	 * Remove loading hooks if we have them set
	 *
	 * @return ActiveRecord
	 */
	public removeLoadingHooks(): ActiveRecord<T> {
		// Remove posthook
		this.loadingHookPost && this.off('complete', this.loadingHookPost);
		this.loadingHookPost && this.off('error', this.loadingHookPost);
		this.loadingHookPre && this.off('requesting', this.loadingHookPre);

		// Unset
		this.loadingHookPost = undefined;
		this.loadingHookPre = undefined;

		return this;
	}

	/**
	 * Searches the remote server for an ID-based record
	 *
	 * @param number | string id
	 * @return Promise<ActiveRecord<T>>
	 */
	public async find(id: string | number, queryParams: IModelRequestQueryParams = {}): Promise<ActiveRecord<T>> {
		return await this.fetch({ id }, queryParams).then((request) => this);
	}

	/**
	 * Upload file
	 *
	 * @param string name
	 * @param HTMLInputElement | FileList | File file
	 * @return FetchResponse
	 */
	public async file(name: string, file: HTMLInputElement | FileList | File): FetchResponse {
		const url: string = this.builder.identifier(this.id).getUrl();

		// const files = event.target.files
		const formData = new FormData();

		// Get file
		if (file instanceof HTMLInputElement) {
			file = (file.files as FileList)[0];
		}
		else if (file instanceof FileList) {
			file = file[0];
		}
		else if (file instanceof File) {
			// Good
		}
		else {
			console.warn('File provided unacceptable type.');
		}

		// Set header
		this.unsetHeader('Content-Type');

		// Add files
		formData.append(name, file);

		// Set fetch
		return this._fetch(null, {}, 'POST', formData).then((request: any) => {
			this.dispatch('file:complete', this);
			return request;
		});
	}

	/**
	 * Alias for `file`
	 *
	 * @param string name
	 * @param HTMLInputElement | FileList | File file
	 * @return FetchResponse
	 */
	public async upload(name: string, file: HTMLInputElement | FileList | File): FetchResponse {
		return this.file(name, file);
	}

	/**
	 * NOTE: It is favored to use other methods
	 *
	 * @param  IModelRequestOptions options
	 * @param  IModelRequestQueryParams queryParams
	 * @return FetchResponse
	 */
	public async fetch(options: IModelRequestOptions = {}, queryParams: IModelRequestQueryParams = {}): FetchResponse {
		return await this._fetch(options, queryParams);
	}

	/**
	 * @return FetchResponse | void
	 */
	public runLast(): FetchResponse | void {
		// Check if we can do this
		if (++this.runLastAttempts >= this.runLastAttemptsMax) {
			console.warn('Run last attempts expired');

			setTimeout(() => {
				this.runLastAttempts = 0;
			}, 1000);

			return;
		}

		return this._fetch(
			this.lastRequest.options,
			this.lastRequest.queryParams,
			this.lastRequest.method,
			this.lastRequest.body,
			this.lastRequest.headers,
		);
	}

	// endregion: Actions

	// region: Get Params
	// -------------------------------------------------------------------------

	/**
	 * @param string method
	 * @return string
	 */
	public getUrlByMethod(method: string): string {
		let url: string = '';
		let originalEndpoint: string = this.endpoint;

		// Use a modified endpoint, if one exists
		if (method === 'delete' && this.endpointDelete) {
			this.endpoint = this.endpointDelete;
		}
		else if (method === 'put' && this.endpointPut) {
			this.endpoint = this.endpointPut;
		}
		else if (method === 'post' && this.endpointPost) {
			this.endpoint = this.endpointPost;
		}

		// Check if we're using modified
		if (this.referenceForModifiedEndpoint) {
			this.useModifiedEndpoint(this.referenceForModifiedEndpoint, this.modifiedEndpointPosition);
		}

		// Mark url
		url = this.builder.getUrl();

		// Reset endpoint in the class so we don't continually compound changes on it
		this.endpoint = originalEndpoint;

		// Query params
		return url;
	}

	// endregion: Get Params

	// region: Set Params
	// -------------------------------------------------------------------------

	/**
	 * We automatically assign modified endpoints through relationships
	 * like hasOne/hasMany, but sometimes we may not want to change that
	 * endpoint. This allows us to cancel the change.
	 *
	 * @return ActiveRecord
	 */
	public cancelModifiedEndpoint(): ActiveRecord<T> {
		this.referenceForModifiedEndpoint = undefined;

		return this;
	}

	/**
	 * Determines if we should be using the modified endpoint
	 *
	 * @return bool
	 */
	public isUsingModifiedEndpoint(): boolean {
		return !!this.referenceForModifiedEndpoint;
	}

	/**
	 * The endpoint we are referencing for modified endpoints
	 *
	 * @return ActiveRecord<T> | undefined
	 */
	public getReferencedEndpoint(): ActiveRecord<T> | undefined {
		return this.referenceForModifiedEndpoint;
	}

	/**
	 * Build modified endpoint each time so we can use the ID
	 * as a reference. If we set it too early, the scalar value
	 * for `id` will be wrong
	 *
	 * @return string
	 */
	public getModifiedEndpoint(): string {
		const activeRecord: any = this.referenceForModifiedEndpoint;

		// Warnings
		if (!activeRecord || (!activeRecord.id && this.modifiedEndpointPosition == 'before')) {
			console.warn(
				'Modified ActiveRecord [`'
					+ activeRecord.endpoint
					+ '.'
					+ this.endpoint
					+ '] usually has an ID signature. [ar/this]',
				this,
			);

			return this.endpoint;
		}

		// Set modified endpoint
		// e.g. content / 1 / test
		// e.g. test / x / content
		return this.modifiedEndpointPosition == 'before'
			? [activeRecord.endpoint, activeRecord.id, this.endpoint].join('/')
			: [this.endpoint, this.id, activeRecord.endpoint].join('/');
	}

	/**
	 * Set specific endpoint override
	 *
	 * @param  ActiveRecord activeRecord
	 * @param  string position
	 * @return ActiveRecord
	 */
	public useModifiedEndpoint(activeRecord: ActiveRecord<any>, position: string = 'before'): ActiveRecord<T> {
		// @todo, we shouldn't actually mutate this
		// we should turn the endpoint that we actually use into a getter
		// then have a way of modifying that so we maintain the original class endpoint
		// this.setEndpoint(activeRecord.endpoint + '/' + activeRecord.id + '/' + this.endpoint);

		// Object we reference for modified
		this.referenceForModifiedEndpoint = activeRecord;
		this.modifiedEndpointPosition = position;

		return this;
	}

	/**
	 * @param IAttributes attributes
	 * @return ActiveRecord
	 */
	public setBody(value: IAttributes): ActiveRecord<T> {
		this.body = value;

		return this;
	}

	/**
	 * @param string endpoint
	 * @return ActiveRecord
	 */
	public setEndpoint(endpoint: string): ActiveRecord<T> {
		this.referenceForModifiedEndpoint = undefined;
		this.endpoint = endpoint;

		return this;
	}

	/**
	 * @param string header
	 * @param string value
	 * @return ActiveRecord
	 */
	public setHeader(header: string, value: string | null): ActiveRecord<T> {
		this.headers[header] = value;

		return this;
	}

	/**
	 * @param Record<string, string> headers
	 * @return ActiveRecord
	 */
	public setHeaders(headers: Record<string, string>): ActiveRecord<T> {
		for (let k in headers) {
			this.setHeader(k, headers[k]);
		}

		return this;
	}

	/**
	 * @param number | string id
	 * @return ActiveRecord
	 */
	public setId(id: number | string): ActiveRecord<T> {
		this.id = typeof id === 'number' ? id.toString() : id;

		return this;
	}

	/**
	 * @return ActiveRecord
	 */
	public unsetId(): ActiveRecord<T> {
		this.id = '';

		return this;
	}

	/**
	 * @param string header
	 * @return ActiveRecord
	 */
	public unsetHeader(header: string): ActiveRecord<T> {
		this.setHeader(header, null);
		delete this.headers[header];

		return this;
	}

	/**
	 * @param string key
	 * @param string value
	 * @return ActiveRecord
	 */
	public setQueryParam(key: string, value: string): ActiveRecord<T> {
		this.builder.qp(key, value);

		return this;
	}

	/**
	 * @param Record<string, number | string> params
	 * @return ActiveRecord
	 */
	public setQueryParams(params: Record<string, number | string>): ActiveRecord<T> {
		for (let k in params) {
			this.setQueryParam(k, params[k] as unknown as string);
		}

		return this;
	}

	/**
	 * @param string param
	 * @return ActiveRecord
	 */
	public unsetQueryParam(param: string): ActiveRecord<T> {
		delete this.builder.queryParams[param];

		return this;
	}

	/**
	 * Override and set headers
	 *
	 * @param string token
	 * @return ActiveRecord
	 */
	public setToken(token: string): ActiveRecord<T> {
		this.setHeader('Authorization', 'Bearer ' + token);

		return this;
	}

	/**
	 * Function to call after setting a fetch
	 * This is useful if we're doing callbacks from cached promises
	 *
	 * @todo Have another look at this
	 */
	public setAfterResponse(request: HttpRequest, options: any = {}) {
		let method: string = request.method || 'get';
		let remoteJson: any = request.responseData;

		// If this isn't a model, try appending to
		if (method.toLowerCase() === 'post' && !this.isModel) {
			// "data" comes from axios
			// "data.data" is our default key on the API
			this.add((this.dataKey ? remoteJson[this.dataKey] : remoteJson) || request.responseData);
		}
		else if (method.toLowerCase() === 'delete') {
			// Intentionally empty
		}
		else {
			let data
				= this.dataKey !== undefined ? remoteJson[this.dataKey] : remoteJson.responseData || request.responseData;

			this.set(data, options);
		}

		// Set options
		this.options(Object.assign({}, options, { meta: remoteJson.meta }));

		// Events
		this.dispatch('parse:after', this);
	}

	// endregion: Set Params

	// @todo Update return
	protected _fetch(
		options: IModelRequestOptions | null = {},
		queryParams: IModelRequestQueryParams = {},
		method: string = 'get',
		body: IAttributes = {},
		headers: IAttributes = {},
	): FetchResponse {
		// Normalize method
		method = method ? method.toLowerCase() : 'get';

		// Save request params
		this.lastRequest = {
			body,
			headers,
			method,
			options,
			queryParams,
		};

		// Set last request time
		this.requestTime = Date.now();

		// Check cacheable
		if (!this.cacheable) {
			this.builder.qp('cb', Date.now());
		}

		// Check for query params
		this.setQueryParams(queryParams);

		// Check for headers
		this.setHeaders(headers);

		// Check for ID
		if (options && options.id) {
			this.builder.identifier(options.id);
		}

		// Query params
		const url: string = this.getUrlByMethod(method);

		// Events
		this.dispatch('requesting', this.lastRequest);

		// Has fetched
		this.hasFetched = true;

		// Set loading
		this.loading = true;

		// Setup request
		let request = (this.request = new HttpRequest(url, { dataKey: this.dataKey }));

		// note: this *should* be set by fetch as well, but
		// we have an issue right now we're working out
		this.request.method = method;

		// After parse
		request.on('complete:delete', (e: any) => {
			this.dispatch('complete:delete', e.target);

			// Remove possible identifiers if we deleted something
			this.builder.identifier('');
		});

		// The "e' bubbling up is an Event, where "e.target" == HttpRequest
		// I want to add a new solution for this, but will wait for now.
		request.on('complete:get', (e: any) => this.dispatch('complete:get', e.target));
		request.on('complete:post', (e: any) => this.dispatch('complete:post', e.target));
		request.on('complete:put', (e: any) => this.dispatch('complete:put', e.target));
		request.on('complete', (e: any) => this.FetchComplete(e.target as HttpRequest));
		request.on('error:delete', (e: any) => this.dispatch('error:delete', e.target));
		request.on('error:get', (e: any) => this.dispatch('error:get', e.target));
		request.on('error:post', (e: any) => this.dispatch('error:post', e.target));
		request.on('error:put', (e: any) => this.dispatch('error:put', e.target));
		request.on('error', (e: any) => this.dispatch('error', e.target));
		request.on('parse:after', (e: any) => this.FetchParseAfter(e.target as HttpRequest, options || {}));

		// This order make look wrong, but it's righ tbecause the event "e"
		// contains progress data, not a Request object
		request.on('progress', (e: any) => this.FetchProgress(e));

		// Request (method, body headers)
		// @ts-ignore
		return request.fetch(method, body || this.body, headers || this.headers);
	}

	// region: Cache
	// -------------------------------------------------------------------------

	/**
	 * @type ICachedResponses
	 */
	protected static cachedResponses: ICachedResponses = {};

	/**
	 * Usage:
	 *
	 *     this.cache('foo', 'bar');
	 *
	 * @param string, key
	 * @param any value
	 * @param boolean isComplete
	 * @param number tll
	 *
	 * @return void
	 */
	protected cache(key: string, value: any, isComplete: boolean = false, ttl: number = 5000): void {
		// If exists, save only value as to not overwrite subscribers
		if (ActiveRecord.cachedResponses[key]) {
			ActiveRecord.cachedResponses[key].complete = isComplete;
			ActiveRecord.cachedResponses[key].time = Date.now();
			ActiveRecord.cachedResponses[key].value = value;
		}
		else {
			ActiveRecord.cachedResponses[key] = {
				complete: false,
				subscribers: [],
				time: Date.now(),
				ttl: ttl,
				value: value,
			};
		}
	}

	/**
	 * @param string key
	 * @return boolean
	 */
	protected isCached(key: string): boolean {
		return !!ActiveRecord.cachedResponses[key];

		/*
		 * return !!ActiveRecord.cachedResponses[key]
		 *     && (ActiveRecord.cachedResponses[key].time + ActiveRecord.cachedResponses[key].ttl) < Date.now();
		 */
	}

	/**
	 * @param string key
	 * @return boolean
	 */
	protected isCachePending(key: string): boolean {
		return !!this.isCached(key) && (!this.getCache(key).complete || !!this.getCache(key).failed);
	}

	/**
	 * @param string key
	 * @return ICachedResponse
	 */
	protected getCache(key: string): ICachedResponse {
		return ActiveRecord.cachedResponses[key];
	}

	/**
	 * Add subscriber
	 *
	 * @param string key
	 * @param any resolve
	 * @param any reject
	 * @param any collection
	 * @return void
	 */
	protected addCacheSubscriber(key: string, resolve: any, reject: any, collection: any): void {
		const cache: any = this.getCache(key);

		cache.subscribers.push({
			collection,
			reject,
			resolve,
		});
	}

	/**
	 * @param string key
	 * @return void
	 */
	protected clearCacheSubscribers(key: string): void {
		const cache: any = this.getCache(key);
		cache.subscribers = [];
	}

	// endregion: Cache

	// region: Http Events
	// ---------------------------------------------------------------------------

	/*
	 * Complete from fetch request
	 *
	 * @param HttpRequest request
	 * @return void
	 */
	protected FetchComplete(request: HttpRequest): void {
		this.hasLoaded = true;
		this.loading = false;
		this.dispatch('complete', request);
	}

	/**
	 * Progress from fetch request
	 *
	 * @param IProgressEvent progress
	 * @return void
	 */
	protected FetchProgress(progress: IProgressEvent): void {
		this.dispatch('progress', progress);
	}

	/**
	 * Overrideable fetch parse:after
	 *
	 * @param HttpRequest request
	 * @param IAttributes options
	 * @return void
	 */
	protected FetchParseAfter(request: HttpRequest, options: IAttributes = {}): void {
		const response: IAxiosResponse | IAxiosSuccess | undefined = request.response;
		const code: number = response ? response.status : 0;

		// Only set for acceptable responses
		if (code < 400) {
			this.setAfterResponse(request, options);
		}

		// Fetched event
		this.dispatch('fetched', request);
	}

	// endregion: Http Events
}
