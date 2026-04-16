import {
	IAttributes,
	IDispatcherCallbackFunction,
	IDispatcherEvent,
	IModelRequestOptions,
	IModelRequestQueryParams,
	IResponse,
} from './Interfaces.js';
import { compactObjectHash } from './Utility.js';
import Builder from './Http/Builder.js';
import Collection from './Collection.js';
import Core from './Core.js';
import HttpRequest from './Http/Request.js';
// import FormData from 'form-data'; // @see https://github.com/form-data/form-data/issues/484

// This helper handles FormData for both Node.js and browser environments
const createFormData = () => {
	if (typeof window !== 'undefined' && window.FormData) {
		return new window.FormData();
	} else {
		const FormData = require('form-data');
		return new FormData();
	}
};

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package RestMC
 * @project RestMC
 */
export default class ActiveRecord<T> extends Core {
	/**
	 * Class hooks that allow us to trigger custom functionality
	 * on an instantiation level.
	 *
	 * Example:
	 *
	 *  MyCollection.setHook('init', instance => {
	 *      instance.setMockData(...);
	 *  });
	 *
	 * @type Map
	 */
	private static hooks = new Map<string, (...args: any[]) => any>();

	/**
	 * @param string event
	 * @param Function func
	 * @return void
	 */
	public static setHook(event: string = 'init', func: any): void {
		const key: string = `${this.name}.${event}`;
		this.hooks.set(key, func);
	}

	/**
	 * @param string event
	 * @return void
	 */
	public static unsetHook(event: string = 'init'): void {
		const key: string = `${this.name}.${event}`;
		this.hooks.delete(key);
	}

	/**
	 * @param string event
	 * @param array params
	 * @return void
	 */
	public static hook(key: string = 'init', params: any = []): void {
		const func = this.hooks.get(key);

		func && func(...params);
	}

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
		return this.builder.id !== '';
	}

	/**
	 * @type IAttributes
	 */
	public attributes: IAttributes;

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
	 * The key that collection data exists on, e.g.
	 *
	 * {
	 *     data: [ .. ]
	 * }
	 *
	 * @type string
	 */
	public dataKey: string | undefined = 'data';

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
	public headers: Record<string, null | number | string>;

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
	 * Mock data responses to use
	 *
	 * @type IAttributes
	 */
	public mockData: IAttributes;

	/**
	 * Where to position our modified endpoint (before or after)
	 *
	 * @type string
	 */
	public modifiedEndpointPosition: string = 'before';

	/**
	 * @type IAttributes
	 */
	public options: IAttributes = {
		dataKey: 'data',
		withCredentials: true,
	};

	/**
	 * Enable dry-run to preview HTTP calls without side effects.
	 * Passed to HttpRequest to short-circuit actual axios calls.
	 */
	public dryRun: boolean = false;

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
	 * @type number
	 */
	public timeCompleted: number = -1;

	/**
	 * @type number
	 */
	public timeParsed: number = -1;

	/**
	 * @type string
	 */
	public uniqueKey: string = '';

	/**
	 * @type boolean
	 */
	public updatesUniqueKey: boolean = true;

	/**
	 * @type boolean
	 */
	public updatesUniqueKeyDeep: boolean = true;

	/**
	 * @type boolean
	 */
	public useRandomUniqueKeySalt: boolean = false;

	/**
	 * Meta data supplied by the server adjacent to datas
	 *
	 * @type IAttributes
	 */
	public _meta: IAttributes;

	/**
	 * @type Builder
	 */
	protected builder: Builder<T>;

	/**
	 * @type string
	 */
	protected cidPrefix: string = 'c';

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
	 * User provided token
	 *
	 * @return string
	 */
	protected token: string = '';

	/**
	 * Set by the .cache(ttl) method and is applied on the next _fetch call
	 *
	 * @type number
	 */
	protected ttl: number = 0;

	/**
	 * @param IAttributes options
	 */
	constructor(options: IAttributes = {}) {
		super(options);

		// Bindings
		this.Handle_OnChange = this.Handle_OnChange.bind(this);

		// Set options on class
		Object.assign(this, options);

		// Set defaults
		this._meta = {};
		this.attributes = {};
		this.body = {};
		this.cid = this.cidPrefix + Math.random().toString(36).substr(2, 5);
		this.headers = {};
		this.mockData = {};
		this.parent = undefined;

		// Setup URL builder
		this.builder = new Builder<T>(this);

		// Set options
		this.setOptions(options);

		// Listen for change events
		this.attachChangeListeners();

		// Hook
		ActiveRecord.hook(`${this.constructor.name}.setup`, [this]);
	}

	/**
	 * @return void
	 */
	public attachChangeListeners(): void {
		this.on('change', this.Handle_OnChange);
		this.on('fetched', this.Handle_OnChange);
	}

	/**
	 * @return void
	 */
	public detachChangeListeners(): void {
		this.off('change', this.Handle_OnChange);
		this.off('fetched', this.Handle_OnChange);
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
	 * Create a shallow clone of this record carrying its parent reference,
	 * options, headers, and serialized attributes.
	 *
	 * Note: lazy relationship caches (populated by `hasOne`/`hasMany` after
	 * fetch) are NOT copied to the clone. Relationships will be re-built
	 * lazily on the clone from the attributes available via `toJSON()`.
	 * If a relationship was fetched independently and was never persisted
	 * to attributes, the clone will not have that data — call
	 * `clone.hasOne(name)` / `clone.hasMany(name)` to rebuild as needed.
	 *
	 * @return ActiveRecord
	 */
	public clone() {
		const instance = new (this.constructor as new () => this)();

		instance.parent = this.parent;
		instance.setOptions(this.options);
		instance.setHeaders(this.headers);
		instance.add(this.toJSON());

		return instance;
	}

	/**
	 * @return boolean
	 */
	public hasAttributes(): boolean {
		return Object.keys(this.attributes).length > 0;
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
	public set(attributes: IAttributes = {}, _options: IAttributes = {}, trigger: boolean = true): this {
		const possibleSetters = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));

		// Check if we have a data key
		attributes = this.cleanData(attributes);

		/*
		 * Mirror each attribute onto `this.attributes`, AND invoke the
		 * matching class setter if one is defined on the prototype. The
		 * setter pass lets subclasses run validation, normalization, or
		 * derived-field logic when attributes are hydrated — e.g. a
		 * `set name(v)` that trims whitespace before storing.
		 */
		for (const key in attributes) {
			this.attributes[key] = attributes[key];

			// Check for setters — cast required because the property is
			// dynamic and not part of the ActiveRecord type signature
			if (possibleSetters && possibleSetters[key] && possibleSetters[key].set) {
				(this as any)[key] = attributes[key];
			}
		}

		// Check for ID
		if (attributes && attributes['id']) {
			this.setId(attributes.id);
		}

		// Trigger
		if (trigger) {
			this.dispatch('set', { attributes });

			// Hook
			ActiveRecord.hook(`${this.constructor.name}.set`, [this, attributes]);
		}

		return this;
	}

	/**
	 * @param string key
	 * @return ActiveRecord
	 */
	public unset(key: string): this {
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
	public setOptions(options: IAttributes = {}): this {
		this.options = Object.assign(this.options, options);

		// Set cacheable
		if (options.cacheable !== undefined) {
			this.cacheable = options.cacheable;
		}

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

		// Check options has explicit parent
		if (options.parent) {
			this.parent = options.parent;
		}

		// Set metadata
		if (options.meta) {
			/*
			 * Increase count
			 * mk: This is kind of wonky...
			 */
			if (options.merge) {
				if (options.meta.pagination.count && this._meta.pagination.count) {
					options.meta.pagination.count += this._meta.pagination.count;
				}
			}

			// Set
			this._meta = options.meta;
		}

		// Check options for params
		if (options.params || options.qp || options.queryParams) {
			this.setQueryParams(options.queryParams || options.qp || options.params);
		}

		return this;
	}

	/**
	 * Attempts to track stacks and prevent circular references in toJSON.
	 *
	 * IMPORTANT:
	 * JSON.stringify() calls toJSON(key: string), so we must tolerate a string first arg.
	 *
	 * @param Set<string> | string pathOrKey
	 * @param number maxDepth
	 * @return object
	 */
	public toJSON(pathOrKey: Set<string> | string = new Set(), maxDepth: number = 5): object {
		const path: Set<string> = pathOrKey instanceof Set ? pathOrKey : new Set();
		const refId = `${this.endpoint}.${this.id}`;
		const json: Record<string, any> = { ...this.attributes };

		// This exact object is already in our current path (ancestor)
		if (path.has(refId)) {
			return json;
		}

		// Hit depth limit
		if (path.size >= maxDepth) {
			return json;
		}

		// If called by JSON.stringify, just return attributes
		if (typeof pathOrKey === 'string') {
			return { ...this.attributes };
		}

		// Add self to current path
		const currentPath = new Set(path);
		currentPath.add(refId);

		const possibleGetters = Object.getOwnPropertyNames(Object.getPrototypeOf(this));

		for (const key of possibleGetters) {
			const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);

			if (descriptor?.get) {
				const value = (this as any)[key];

				if (value?.toJSON) {
					if (this.isEmptyRelationship(value)) {
						continue;
					}

					// Each child gets a COPY of the path, not a reference
					json[key] = value.toJSON(currentPath, maxDepth);
				}
			}
		}

		return json;
	}

	/**
	 * Check if a relationship is empty and shouldn't be serialized
	 *
	 * @param any value
	 * @return boolean
	 */
	protected isEmptyRelationship(value: any): boolean {
		if (value.models !== undefined) {
			return value.models.length === 0;
		}

		if (value.id !== undefined) {
			return !value.id && Object.keys(value.attributes || {}).length === 0;
		}

		return false;
	}

	/**
	 * @param boolean includeDeep
	 * @return this
	 */
	public disableUniqueKeys(): this {
		this.updatesUniqueKey = false;
		this.useRandomUniqueKeySalt = false;
		this.updatesUniqueKeyDeep = false;

		return this;
	}

	// region: Actions
	// ---------------------------------------------------------------------------

	/**
	 * @param IAttributes attributes
	 * @return Promise<HttpRequest>
	 */
	public create(attributes: IAttributes): Promise<HttpRequest> {
		return this.post(attributes);
	}

	/**
	 * @param IAttributes attributes
	 * @return Promise<HttpRequest>
	 */
	public delete(attributes: IAttributes = {}): Promise<HttpRequest> {
		const method: string = 'DELETE';
		const payload: IAttributes = Object.assign({}, this.toJSON(), attributes);
		const output: Promise<HttpRequest> = this._fetch(null, {}, method, payload, this.headers);

		// Check if it was successful
		output.then((request: HttpRequest) => {
			// Exit if we have an error
			if (request.status < 200 || request.status > 299) {
				return;
			}

			// Check if we have a parent collection, and if so, remove it
			if (this.hasParentCollection()) {
				(this.parent as Collection<any>)?.remove(this);
			}
		});

		return output;
	}

	/**
	 * @param IAttributes attributes
	 * @return Promise<HttpRequest>
	 */
	public post(attributes: IAttributes = {}): Promise<HttpRequest> {
		const method: string = 'POST';
		const payload: IAttributes = Object.assign({}, this.toJSON(), attributes);
		const output: Promise<HttpRequest> = this._fetch(null, {}, method, payload, this.headers);

		return output;
	}

	/**
	 * @param IAttributes attributes
	 * @return Promise<HttpRequest>
	 */
	public put(attributes: IAttributes): Promise<HttpRequest> {
		const method: string = 'PUT';
		const payload: IAttributes = Object.assign({}, this.toJSON(), attributes);
		const output: Promise<HttpRequest> = this._fetch(null, {}, method, payload, this.headers);

		return output;
	}

	/**
	 * @param IAttributes attributes
	 * @return Promise<HttpRequest>
	 */
	public save(attributes: IAttributes = {}): Promise<HttpRequest> {
		const method: string = this.id ? 'PUT' : 'POST';
		const payload: IAttributes = Object.assign({}, this.toJSON(), attributes);
		const output: Promise<HttpRequest> = this._fetch(null, {}, method, payload, this.headers);

		return output;
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
	public reset(): this {
		this.attributes = {};
		this.hasFetched = false;
		this.hasLoaded = false;
		this.loading = false;
		this.requestTime = -1;
		this.timeCompleted = -1;
		this.timeParsed = -1;
		this.uniqueKey = '';

		// Event
		this.dispatch('reset');

		// Hook
		ActiveRecord.hook(`${this.constructor.name}.reset`, [this]);

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
		postHook: IDispatcherCallbackFunction | undefined = undefined
	): ActiveRecord<T> {
		// Remove existing hooks
		this.removeLoadingHooks();

		// Set preloading hook
		this.loadingHookPre = () => {
			return (preHook || view?.loading?.bind(view) || function () {})();
		};

		// Set postloading hook
		this.loadingHookPost = () => {
			return (postHook || view?.notloading?.bind(view) || function () {})();
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
	 * Set ttl on next fetch
	 *
	 * Usage:
	 *
	 *     myCollection.cache(1000).fetch();
	 *
	 * @param number ttl
	 * @return this
	 */
	public cache(ttl: number): ActiveRecord<T> {
		this.ttl = ttl;
		return this;
	}

	/**
	 * Set mock data for one fetch call
	 *
	 * Example:
	 *
	 *  myCollection.mock({ ... }).fetch();
	 *
	 * @param object data
	 * @return ActiveRecord<T>
	 */
	public mock(data: any): ActiveRecord<T> {
		const self = this;

		/**
		 * Self-unsubscribing finish handler. References `callback` by name
		 * rather than `this` so the function reference matches what was
		 * passed to `on('finish', callback)` above.
		 *
		 * @return void
		 */
		function callback(): void {
			self.unsetMockData('any');
			self.off('finish', callback);
		}

		// On the next _fetch, this should be called regardless
		this.on('finish', callback);

		// Set temp mock data
		this.setMockData('any', data);

		return this;
	}

	/**
	 * Fetch a single record by ID from the remote server. This is a network
	 * operation — for in-memory lookup against a Collection's loaded models
	 * use `Collection.get(id)` or `Collection.findWhere(...)` instead.
	 *
	 * @param string | number id
	 * @param IModelRequestQueryParams queryParams
	 * @return Promise<ActiveRecord<T>>
	 */
	public async fetchById(
		id: string | number,
		queryParams: IModelRequestQueryParams = {}
	): Promise<ActiveRecord<T>> {
		return await this.fetch({ id }, queryParams).then((_request) => this);
	}

	/**
	 * Alias for `fetchById()`. The name `find` is ambiguous — it sounds like
	 * an in-memory lookup but actually performs a network request. New code
	 * should prefer `fetchById()`. Kept for backwards compatibility.
	 *
	 * @param string | number id
	 * @param IModelRequestQueryParams queryParams
	 * @return Promise<ActiveRecord<T>>
	 */
	public async find(id: string | number, queryParams: IModelRequestQueryParams = {}): Promise<ActiveRecord<T>> {
		return await this.fetchById(id, queryParams);
	}

	/**
	 * Upload file
	 *
	 * @param string name
	 * @param HTMLInputElement | FileList | File file
	 * @param Record<string, any> additionalFields
	 * @return Promise<HttpRequest>
	 */
	public async file(name: string, file: any, additionalFields: Record<string, any> = {}): Promise<HttpRequest> {
		// Side effect: ensure the builder targets this record's id
		this.builder.identifier(this.id);

		// Use our helper function instead of direct FormData instantiation
		const formData = createFormData();

		// HTMLInputElement
		if (file.hasOwnProperty('files') && file.files) {
			file = (file.files as any)[0];
		}

		// FileList
		if (file.hasOwnProperty('length')) {
			file = file[0];
		}

		// Set header
		this.unsetHeader('Content-Type');

		// Add files
		formData.append(name, file);

		// Add additional fields
		if (additionalFields) {
			let key: string;

			for (key in additionalFields) {
				const value: any = additionalFields[key];

				if (Array.isArray(value)) {
					value.forEach((item: number | string) => formData.append(key + '[]', item));
				} else {
					formData.append(key, value);
				}
			}
		}

		// Set fetch
		return this._fetch(null, {}, 'POST', formData).then((request: any) => {
			this.dispatch('file:complete');
			return request;
		});
	}

	/**
	 * Alias for `file`
	 *
	 * @param string name
	 * @param HTMLInputElement | FileList | File file
	 * @param Record<string, any> additionalFields
	 * @return Promise<HttpRequest>
	 */
	public async upload(name: string, file: any, additionalFields: Record<string, any> = {}): Promise<HttpRequest> {
		return this.file(name, file, additionalFields);
	}

	/**
	 * NOTE: It is preferred to use other methods
	 *
	 * Order of events:
	 *
	 * 	requesting
	 * 	beforeFetch()
	 * 	progress (potentially multiple times)
	 * 	parse:after
	 * 	complete
	 * 	complete:{method}
	 * 	finish
	 *
	 * @param  IModelRequestOptions options
	 * @param  IModelRequestQueryParams queryParams
	 * @return Promise<HttpRequest>
	 */
	public async fetch(
		options: IModelRequestOptions = {},
		queryParams: IModelRequestQueryParams = {},
		method: string = 'get',
		body: IAttributes = {},
		headers: IAttributes = {}
	): Promise<HttpRequest> {
		return await this._fetch(options, queryParams, method, body, headers);
	}

	/**
	 * Re-run the most recent fetch. No-op if no request has been made yet,
	 * or if the retry attempt limit has been reached (resets after 1s).
	 *
	 * @return Promise<HttpRequest> | void
	 */
	public runLast(): Promise<HttpRequest> | void {
		// Guard against being called before any fetch has happened
		if (!this.lastRequest) {
			console.warn('runLast() called but no previous request to replay');
			return;
		}

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
			this.lastRequest.headers
		);
	}

	/**
	 * @return void
	 */
	public updateUniqueKey(): void {
		let hash = compactObjectHash(this.attributes);

		if (this.useRandomUniqueKeySalt) {
			hash += Math.random().toString(36).substr(2, 5) + Date.now();
		}

		this.uniqueKey = hash;
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
		const originalEndpoint: string = this.getEndpoint();

		// Use a modified endpoint, if one exists
		if (method === 'delete' && this.endpointDelete) {
			this.endpoint = this.endpointDelete;
		} else if (method === 'put' && this.endpointPut) {
			this.endpoint = this.endpointPut;
		} else if (method === 'post' && this.endpointPost) {
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
	 * @return Promise<void>
	 */
	public async beforeFetch(): Promise<void> {
		// Do nothing
	}

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
	 * @return string
	 */
	public getBaseUrl(): string {
		return this.baseUrl;
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
		if (!activeRecord || (!activeRecord.id && this.modifiedEndpointPosition === 'before')) {
			console.warn(
				'Modified ActiveRecord [`' +
					activeRecord.getEndpoint() +
					'.' +
					this.getEndpoint() +
					'] usually has an ID signature. [ar/this]',
				this
			);

			return this.getEndpoint();
		}

		/*
		 * Set modified endpoint
		 * e.g. content / 1 / test
		 * e.g. test / x / contentf
		 */
		return this.modifiedEndpointPosition === 'before'
			? [activeRecord.getEndpoint(), activeRecord.id, this.getEndpoint()].join('/')
			: [this.getEndpoint(), this.id, activeRecord.getEndpoint()].join('/');
	}

	/**
	 * @param string key
	 * @return string
	 */
	public getQueryParam(key: string): string {
		return this.builder.getQueryParam(key) || '';
	}

	/**
	 * @return any
	 */
	public getQueryParams(): any {
		return this.builder.getQueryParams() || {};
	}

	/**
	 * @return boolean
	 */
	public hasParent(): boolean {
		return !!this.parent;
	}

	/**
	 * @return boolean
	 */
	public hasParentCollection(): boolean {
		return this.hasParent() && (this.parent as any).isCollection;
	}

	/**
	 * Set specific endpoint override
	 *
	 * @param  ActiveRecord activeRecord
	 * @param  string position
	 * @return ActiveRecord
	 */
	public useModifiedEndpoint(activeRecord: ActiveRecord<any>, position: string = 'before'): ActiveRecord<T> {
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
	 * @return string
	 */
	public getEndpoint(): string {
		return this.endpoint;
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
	 * Set a single request header. Accepts string, number, or null —
	 * matching the loose internal storage shape used by setHeaders().
	 *
	 * @param string header
	 * @param string | number | null value
	 * @return ActiveRecord
	 */
	public setHeader(header: string, value: null | number | string): ActiveRecord<T> {
		this.headers[header] = value;

		return this;
	}

	/**
	 * Replace all headers in one call. Accepts the same loose value shape
	 * as `setHeader` (string | number | null) — the underlying HTTP layer
	 * coerces non-string values when serializing the request.
	 *
	 * @param Record<string, null | number | string> headers
	 * @return ActiveRecord
	 */
	public setHeaders(headers: Record<string, null | number | string>): ActiveRecord<T> {
		for (const k in headers) {
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
		this.b.identifier(this.id);

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
	 * @param IAttributes jsonResponse
	 * @return ActiveRecord<T>
	 */
	public setMockData(key: string = 'any', jsonData: IAttributes): ActiveRecord<T> {
		const response = {
			config: {},
			data: jsonData,
			headers: {},
			status: 200,
			statusText: 'OK',
		};

		// Set cache to HttpRequest statically @danger
		HttpRequest.cachedResponses.set(key, response, 1000 * 9999);

		return this;
	}

	/**
	 * @param string key
	 * @return ActiveRecord<T>
	 */
	public unsetMockData(key: string = 'any'): ActiveRecord<T> {
		HttpRequest.cachedResponses.delete(key);
		return this;
	}

	/**
	 * Enable/disable dry-run mode for this instance.
	 *
	 * @param boolean enable
	 * @return this
	 */
	public setDryRun(enable: boolean = true): this {
		this.dryRun = !!enable;
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
		for (const k in params) {
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
		this.token = token;
		this.setHeader('Authorization', 'Bearer ' + token);

		return this;
	}

	/**
	 * Apply a fetched response to this record. Routes the parsed payload
	 * through `add()` for collection POST responses, no-ops for DELETE,
	 * and otherwise calls `set()` with the payload (unwrapping `dataKey`
	 * if defined). Useful when replaying cached promise resolutions.
	 *
	 * @param IDispatcherEvent e
	 * @param IAttributes options
	 * @return void
	 */
	public setAfterResponse(e: IDispatcherEvent, options: any = {}) {
		const request: HttpRequest = e.detail.request as HttpRequest;
		const response: IResponse = e.detail.response as IResponse;
		const method: string = request.method || 'get';
		const remoteJson: any = response.data;

		// If this isn't a model, try appending to
		if (method.toLowerCase() === 'post' && !this.isModel) {
			/*
			 * "data" comes from axios
			 * "data.data" is our default key on the API
			 */
			this.add((this.dataKey ? remoteJson[this.dataKey] : remoteJson) || response.data);
		} else if (method.toLowerCase() === 'delete') {
			// Intentionally empty
		} else {
			const data =
				this.dataKey !== undefined ? remoteJson[this.dataKey] : remoteJson.responseData || response.data;

			this.set(data, options);
		}

		// Set options
		this.setOptions(Object.assign({}, options, { meta: remoteJson.meta }));

		// Events
		this.dispatch('parse:after', e.detail);
	}

	// endregion: Set Params

	protected async _fetch(
		options: IModelRequestOptions | null = {},
		queryParams: IModelRequestQueryParams = {},
		method: string = 'get',
		body: IAttributes = {},
		headers: IAttributes = {}
	): Promise<HttpRequest> {
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

		// Run before fetch methods
		await this.beforeFetch();

		// Query params
		const url = this.getUrlByMethod(method);
		const ttl = this.ttl || 0;

		// Set loading
		this.loading = true;

		// Setup request
		const request = (this.request = new HttpRequest(url, {
			cacheOptions: {
				enabled: ttl > 0,
				ttl: ttl,
			},
			dataKey: this.dataKey,
			dryRun: this.dryRun,
			withCredentials: this.options.withCredentials,
		}));

		/*
		 * note: this *should* be set by fetch as well, but
		 * we have an issue right now we're working out
		 */
		this.request.method = method;

		// After parse
		request.on('complete:delete', (e: IDispatcherEvent) => {
			this.dispatch('complete:delete', e.detail);

			// Remove possible identifiers if we deleted something
			this.builder.identifier('');
		});

		/*
		 * The "e' bubbling up is an Event, where "e.target" == HttpRequest
		 * I want to add a new solution for this, but will wait for now.
		 */
		request.on('complete:get', (e: IDispatcherEvent) => this.dispatch('complete:get', e.detail));
		request.on('complete:post', (e: IDispatcherEvent) => this.dispatch('complete:post', e.detail));
		request.on('complete:put', (e: IDispatcherEvent) => this.dispatch('complete:put', e.detail));
		request.on('complete', (e: IDispatcherEvent) => this.FetchComplete(e));
		request.on('error:delete', (e: IDispatcherEvent) => this.dispatch('error:delete', e.detail));
		request.on('error:get', (e: IDispatcherEvent) => this.dispatch('error:get', e.detail));
		request.on('error:post', (e: IDispatcherEvent) => this.dispatch('error:post', e.detail));
		request.on('error:put', (e: IDispatcherEvent) => this.dispatch('error:put', e.detail));
		request.on('error', (e: IDispatcherEvent) => {
			this.loading = false;
			return this.dispatch('error', e.detail);
		});
		request.on('finish', (_e: IDispatcherEvent) => this.dispatch('finish'));
		request.on('parse:after', (e: IDispatcherEvent) => this.FetchParseAfter(e, options || {}));
		request.on('progress', (e: IDispatcherEvent) => this.FetchProgress(e));

		// Bubble dryrun details for external listeners
		request.on('dryrun', (e: IDispatcherEvent) => this.dispatch('dryrun', e.detail));

		// Has fetched
		this.hasFetched = true;

		// Pass through to the underlying HTTP request
		return request.fetch(
			method,
			Object.assign(body || {}, this.body),
			Object.assign(headers || {}, this.headers),
			ttl
		);
	}

	/**
	 * @param object IAttributes
	 * @return IAttributes
	 */
	protected cleanData(attributes: IAttributes = {}): IAttributes {
		if (this.dataKey && typeof attributes === 'object' && !Array.isArray(attributes)) {
			const keys = Object.keys(attributes);

			// If there's only one key that matches the data key, return that
			if (keys.length === 1 && keys[0] === this.dataKey) {
				return attributes[this.dataKey];
			}
		}

		return attributes;
	}

	// region: Http Events
	// -------------------------------------------------------------------------

	/*
	 * Complete from fetch request
	 *
	 * @param HttpRequest request
	 * @return void
	 */
	protected FetchComplete(e: IDispatcherEvent): void {
		this.hasLoaded = true;
		this.loading = false;
		this.timeCompleted = Date.now();
		this.dispatch('complete', e.detail);
		this.dispatch('success', e.detail);
	}

	/**
	 * Progress from fetch request
	 *
	 * @param IProgressEvent progress
	 * @return void
	 */
	protected FetchProgress(e: IDispatcherEvent): void {
		this.dispatch('progress', e.detail);
	}

	/**
	 * Overrideable fetch parse:after
	 *
	 * @param HttpRequest request
	 * @param IAttributes options
	 * @return void
	 */
	protected FetchParseAfter(e: IDispatcherEvent, options: IAttributes = {}): void {
		const code: number = e.detail?.response?.status || 0;

		// Only set for acceptable responses
		if (code < 400) {
			this.setAfterResponse(e, options);
		}

		// Time
		this.timeParsed = Date.now();

		// Fetched event
		this.dispatch('fetched', e.detail);
	}

	// endregion: Http Events

	// region: Event Handlers
	// ---------------------------------------------------------------------------

	/**
	 * Handle change event
	 * @param IDispatcherEvent e
	 * @return void
	 */
	protected Handle_OnChange(_e: IDispatcherEvent): void {
		let parent: any = this.parent;

		// Update this key
		this.updatesUniqueKey && this.updateUniqueKey();

		// Update keys on all parent ancestors (if it has updatekey method)
		if (this.updatesUniqueKeyDeep) {
			while (parent && parent.updateUniqueKey) {
				parent.updateUniqueKey();
				parent = parent.parent;
			}
		}
	}

	// endregion: Event Handlers
}
