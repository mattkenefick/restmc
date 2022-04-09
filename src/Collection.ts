import ActiveRecord from './ActiveRecord';
import CollectionIterator from './CollectionIterator';
import Model from './Model';
import HttpRequest from './Http/Request';
import {
	IAttributes,
	IAxiosResponse,
	IAxiosSuccess,
	ICollectionMeta,
	IDispatcherEvent,
	IRequest,
	IModelRequestOptions,
	IModelRequestQueryParams,
	IPagination,
	ISortOptions,
} from './Interfaces';

/**
 * Union type
 */
type FetchResponse = Promise<Response | HttpRequest | null>;

/**
 * 'meta': {
 *     'pagination': {
 *         'total': 1938,
 *         'count': 15,
 *         'per_page': 15,
 *         'current_page': 1,
 *         'total_pages': 130,
 *         'links': {
 *             'next': 'http://api.sotw.com/v1/film?page=2'
 *         }
 *     }
 * }
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package RestMC
 * @project RestMC
 */
export default class Collection extends ActiveRecord<Collection> implements Iterable<Model> {
	/**
	 * This static function could be overridden globally depending on the
	 * structure of your API. By default, we assume it's within .meta
	 *
	 * @param Collection collection
	 * @return object
	 */
	public static paginator(collection: Collection): IPagination {
		return collection.meta.pagination;
	}

	/**
	 * Hydrate a collection full of models
	 *
	 * @param Model[] models
	 * @param object options
	 * @type Collection
	 */
	public static hydrate<T>(models: Model[] = [], options: object = {}): Collection {
		// Instantiate collection
		const collection = new this(options);

		// Add models to collection
		collection.add(models);

		// Add options to collection
		collection.options(options);

		return collection;
	}

	/**
	 * @todo In tests, make sure this doesn't cache
	 * @return number
	 */
	public get length(): number {
		return this.models.length;
	}

	/**
	 * @return string
	 */
	public get modelId(): string {
		return 'id';
	}

	/**
	 * @return IPagination
	 */
	public get pagination(): IPagination {
		return Collection.paginator(this);
	}

	/**
	 * This allows us to iterate through a list of subobjects
	 * when we use our ".at(x)" command. So if on the collection,
	 * we wanted to iterate and get:
	 *
	 *     .at(0).receiver.person
	 *
	 * We could set this property to be:
	 *
	 *     ['receiver', 'person']
	 *
	 * Which we could then call as:
	 *
	 *     at(0) === at(0).receiver.person
	 *
	 * It's sort of like a disguise for the at(x) call
	 *
	 * @type string[]
	 */
	public atRelationship: string[] = [];

	/**
	 * @type number
	 */
	public index: number = 0;

	/**
	 * Meta data associated with collection
	 *
	 * @type ICollectionMeta
	 */
	public meta: ICollectionMeta = {
		pagination: {
			count: 15,
			current_page: 1,
			links: {},
			per_page: 15,
			total: 0,
			total_pages: 1,
		},
	};

	/**
	 * Model object instantiated by this collection
	 * This should be replaced by subclass
	 *
	 * @type Model
	 */
	// @ts-ignore Because webpack attempts to autoload this
	public model: Model = Model;

	/**
	 * @type Model[]
	 */
	public models: Model[] = [];

	/**
	 * @type string
	 */
	protected sortKey: string = 'id';

	/**
	 * We specifically don't set models here because the Model doesn't exist
	 * until constructor is done. We must use hydrate for that. Don't add data.
	 *
	 * If we do it early, we won't get FilmModels, we'll get Models.
	 *
	 * @param IAttributes options
	 */
	constructor(options: IAttributes = {}) {
		super(options);

		// Set default data key
		this.dataKey = 'data';

		// Set options
		this.options(options);

		// Default builder
		this.builder.qp('limit', options.limit || this.limit).qp('page', options.page || this.page);

		// Custom options
		if (options.atRelationship) {
			this.atRelationship = options.atRelationship;
		}

		// Set endpoint, if not exists
		// The timeout is required because the property on model
		// won't exist until it's instantiated. Essentially a little
		// race condition here.
		// @critical, fix me. this won't work
		setTimeout(() => {
			if (!this.endpoint || this.endpoint === '') {
				// @ts-ignore (replace me)
				this.endpoint = new this.model().endpoint;
			}
		}, 1);
	}

	/**
	 * @return object
	 */
	public toJSON(): object {
		return JSON.parse(JSON.stringify(this.models));
	}

	/**
	 * Fetch next page with last used set of options
	 *
	 * @param bool append
	 * @return Promise<HttpRequest>
	 */
	public async fetchNext(append: boolean = false): Promise<HttpRequest> {
		let options = Object.assign({}, this.lastRequest.options);
		let qp = Object.assign({}, this.builder.queryParams, this.lastRequest.queryParams);

		// Increase page number
		qp.page = parseFloat(qp.page) + 1;

		// Merge
		options.merge = append;

		// Fetch
		return await this._fetch(options, qp, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
	}

	/**
	 * Add or prepend Model(s) to our list. Set `prepend` = true on options
	 * if you'd like to prepend the models
	 *
	 * @param  Model[] | Model | object data
	 * @param  IAttributes options
	 * @return Collection
	 */
	public add(data: Model[] | Model | object, options: IAttributes = {}): Collection {
		if (data == undefined) {
			return this;
		}

		// Allow multiple or singles
		const models: any = Array.isArray(data) ? data : [data];

		// Iterate through supplied models
		models.forEach((model: Model) => {
			// Data supplied is an object that must be instantiated
			if (!(model instanceof Model)) {
				// @ts-ignore
				model = new this.model(model);
				model.parent = this;
				model.headers = this.headers;

				// Check the modified endpoint
				if (this.referenceForModifiedEndpoint) {
					model.useModifiedEndpoint(this.referenceForModifiedEndpoint);
				}
			}

			if (options.prepend) {
				this.models.unshift(model);
			}
			else {
				this.models.push(model);
			}
		});

		// Event for add
		this.dispatch('change', { from: 'add' });
		this.dispatch('add');

		return this;
	}

	/**
	 * Remove a model, a set of models, or an object
	 *
	 * @param  Model[] | Model | object model
	 * @return Collection
	 */
	public remove(model: Model[] | Model | object): Collection {
		let i: number = 0;
		let ii: number = 0;
		const items: any = Array.isArray(model) ? model : [model];

		// Take the first model in our list and iterate through our local
		// models. If we are successful, call recursive
		for (ii = 0; ii < items.length; ii++) {
			i = 0;
			while (i < this.models.length) {
				if (this.models[i] == items[ii]) {
					this.models.splice(i, 1);
				}
				else {
					++i;
				}
			}
		}

		// Event for add
		this.dispatch('change', { from: 'remove' });
		this.dispatch('remove');

		return this;
	}

	/**
	 * Reset and add new models
	 *
	 * @todo Review this
	 *
	 * @param  Model[] | Model | object model
	 * @param IAttributes options
	 * @return Collection
	 */
	public set(model: Model[] | Model | object, options: IAttributes = {}): Collection {
		if (!options || (options && options.merge != true)) {
			this.reset();
		}

		// Add model to list
		this.add(model);

		// Event for add
		this.dispatch('set');

		return this;
	}

	/**
	 * @return Collection
	 */
	public clear(): Collection {
		return this.reset();
	}

	/**
	 * @return number
	 */
	public count(): number {
		return this.length;
	}

	/**
	 * @param IAttributes attributes
	 */
	public delete(attributes: IAttributes = {}) {
		const url: string = this.builder.identifier(this.id || attributes?.id || '').getUrl();

		// Check for identifier
		if (this.builder.id) {
			let model: Model | undefined = this.findWhere(attributes);

			model && this.remove(model);
		}

		// Attributes
		const body: any = null;
		const headers: any = this.headers;
		const method: string = 'DELETE';

		return this._fetch(null, {}, method, body, headers);
	}

	/**
	 * @param Model[] | Model | object model
	 * @param object = {} options
	 * @return Collection
	 */
	public push(model: Model[] | Model | object, options: object = {}): Collection {
		this.add(model, options);

		return this;
	}

	/**
	 * @return Collection
	 */
	public pop(): Collection {
		const model: Model = this.at(this.length - 1);

		return this.remove(model);
	}

	/**
	 * @todo Might want to do more with this
	 * @return Collection
	 */
	public reset(): Collection {
		this.models = [];

		this.dispatch('change', { from: 'reset' });
		this.dispatch('reset');

		return this;
	}

	/**
	 * Add Model(s) to beginning of list
	 *
	 * @param  Model[] | Model | object model
	 * @param  IAttributes options
	 * @return Collection
	 */
	public unshift(model: Model[] | Model | object, options: IAttributes = {}): Collection {
		return this.add(model, Object.assign({ prepend: true }, options));
	}

	/**
	 * Remove first object
	 *
	 * @return Collection
	 */
	public shift(): Collection {
		const model: Model = this.at(0);

		return this.remove(model);
	}

	/**
	 * Cut up collection models
	 *
	 * @return Model[]
	 */
	public slice(...params: any): Model[] {
		return <Model[]>Array.prototype.slice.apply(this.models, params);
	}

	/**
	 * Get model by ID
	 *
	 * @param  string | number  id
	 * @return Model | undefined
	 */
	public get(query: Model | number | string): Model | undefined {
		if (query == null) {
			return void 0;
		}

		return this.where({ [this.modelId]: query instanceof Model ? query.id : query }, true) as Model;
	}

	/**
	 * Checks if we have an object or Model
	 *
	 * @param  Model | object  obj
	 * @return boolean
	 */
	public has(obj: Model | number | string): boolean {
		return this.get(obj) != undefined;
	}

	/**
	 * Get model at index
	 *
	 * @param  {number = 0} index
	 * @return Model
	 */
	public at(index: number = 0): Model {
		if (index < 0) {
			index += this.length;
		}

		// Get model
		let item: any = this.models[index];

		// Transform through
		if (this.atRelationship && this.atRelationship.length) {
			this.atRelationship.forEach((key) => (item = item[key]));
		}

		return item;
	}

	/**
	 * Get first item
	 *
	 * @return {Model}
	 */
	public first(): Model {
		return this.at(0);
	}

	/**
	 * @return Model
	 */
	public last(): Model {
		return this.at(this.length - 1);
	}

	/**
	 * @return Model | undefined
	 */
	public next(): Model | undefined {
		if (this.index + 1 >= this.length) {
			return undefined;
		}

		return this.at(++this.index);
	}

	/**
	 * @return Model
	 */
	public previous(): Model | undefined {
		if (this.index <= 0) {
			return undefined;
		}

		return this.at(--this.index);
	}

	/**
	 * @return Model
	 */
	public current() {
		return this.at(this.index);
	}

	/**
	 * Comparing hard object attributes to model attr
	 *
	 * @param  IAttributes attributes
	 * @param  boolean first
	 * @return Collection | Model
	 */
	public where(attributes: IAttributes = {}, first: boolean = false): Collection | Model | undefined {
		const constructor: any = this.constructor;
		const collection = new constructor();

		// @todo, this code sucks but I'm not spending all day here
		this.models.map((model: any) => {
			const intersection: string[] = Object.keys(model.attributes).filter(
				(k: string) => k in attributes && model.attr(k) == attributes[k],
			);

			if (intersection.length) {
				collection.add(model);
			}
		});

		return first ? collection.first() : collection;
	}

	/**
	 * @param  IAttributes attributes
	 * @return Model
	 */
	public findWhere(attributes: IAttributes = {}): Model | undefined {
		return this.where(attributes, true) as Model;
	}

	/**
	 * @param  string cid
	 * @return Model | undefined
	 */
	public findByCid(cid: string): Model | undefined {
		return this.findWhere({ cid });
	}

	/**
	 * Sorting models by key or in reverse
	 *
	 * We have a basic `sortKey` defined on the collection, but
	 * can also pass in an object with `key` and `reverse` on it
	 *
	 * @param  IAttributes options
	 * @return Collection
	 */
	public sort(options: IAttributes = {}): Collection {
		let key: string = this.sortKey;

		// Sort options
		if (options !== null) {
			key = options.key || key;
		}

		// Sort
		this.models = this.models.sort((a: any, b: any) => {
			return options && options.reverse ? (a.attr(key) - b.attr(key)) * -1 : (a.attr(key) - b.attr(key)) * 1;
		});

		return this;
	}

	/**
	 * Pull out an attribute from our models
	 *
	 * Example:
	 *     collection.pluck('name');
	 *
	 *     ['Ashley', 'Briana', 'Chloe', ...]
	 *
	 * @param  string attribute
	 * @return any
	 */
	public pluck(attribute: string): any {
		return this.models.map((model) => model.attr(attribute));
	}

	/**
	 * @param IAttributes attributes
	 * @return Collection
	 */
	public clone(attributes: IAttributes = {}) {
		// @ts-ignore
		const instance = new this.constructor();
		instance.add(this.toJSON());

		return instance;
	}

	/**
	 * Return an interator for values based on this collection
	 *
	 * @return CollectionIterator
	 */
	public values(): CollectionIterator {
		return new CollectionIterator(this, CollectionIterator.ITERATOR_VALUES);
	}

	/**
	 * Return an interator for keys based on this collection
	 *
	 * @return CollectionIterator
	 */
	public keys(attributes: IAttributes = {}): CollectionIterator {
		return new CollectionIterator(this, CollectionIterator.ITERATOR_KEYS);
	}

	/**
	 * Return an interator for entries (key + value) based on this collection
	 *
	 * @return CollectionIterator
	 */
	public entries(attributes: IAttributes = {}): CollectionIterator {
		return new CollectionIterator(this, CollectionIterator.ITERATOR_KEYSVALUES);
	}

	/**
	 * Override internal fetch so we can catch authorization
	 * errors and automatically attempt to refresh tokens
	 */
	protected _fetch(
		options: IModelRequestOptions | null = {},
		queryParams: IModelRequestQueryParams = {},
		method: string = 'get',
		body: IAttributes = {},
		headers: IAttributes = {},
	): any {
		const cacheKey: string = this.b.getUrl();

		// If our response is still loading, return a promise and add a subscriber
		if (this.isCachePending(cacheKey)) {
			return new Promise<any>((resolve, reject) => {
				this.addCacheSubscriber(cacheKey, resolve, reject, this);
			});
		}

		// Start cache processing while we wait for results from server (key, value, isComplete)
		this.cache(cacheKey, true);

		/*
		 * By omitting this, we are only using short-term cache to prevent thundering herd.
		 * We could enable this to have extended cache, but we'd need to be mindful about
		 * busting said cache.
		 * else if (this.isCached(cacheKey)) {
		 *     return new Promise((resolve: any, reject: any) =>
		 *     {
		 *         this.addCacheSubscriber(cacheKey, resolve, reject);
		 *     });
		 * }
		 */

		// Fetch from server
		return (
			super
				._fetch(options, queryParams, method, body, headers)

				// Send response to subscribers
				.then((request: HttpRequest) => {
					const data: any = request.responseData;
					const method: string = request.method || 'get';

					// Save actual cache response (key, value, isComplete)
					this.cache(cacheKey, request, true);

					// Send all of our subscribers the response through `resolve`
					this.getCache(cacheKey)?.subscribers?.forEach((subscriber: any) => {
						subscriber.collection.setAfterResponse(request);
						subscriber.collection.dispatch('complete', request);
						subscriber.collection.dispatch('complete:' + method, request);
						subscriber.resolve(request);
					});

					// Clear all listeners
					this.clearCacheSubscribers(cacheKey);

					return request;
				})

				// Send error to subscribers
				.catch((request: HttpRequest) => {
					// Error
					this.dispatch('error', request);

					// Save actual cache response (key, value, isComplete)
					this.cache(cacheKey, request, true);

					// Send all of our subscribers the response through `resolve`
					this.getCache(cacheKey)?.subscribers?.forEach((subscriber: any) => subscriber.reject(request));

					// Clear
					this.clearCacheSubscribers(cacheKey);

					throw request;
				})
		);
	}

	/**
	 * @type Iterator<any>
	 */
	// @ts-ignore
	[Symbol.iterator](): CollectionIterator {
		return new CollectionIterator(this, CollectionIterator.ITERATOR_VALUES);
	}
}
