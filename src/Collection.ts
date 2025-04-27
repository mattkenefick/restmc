import ActiveRecord from './ActiveRecord.js';
import CollectionIterator from './CollectionIterator.js';
import HttpRequest from './Http/Request.js';
import Model from './Model.js';
import { compactObjectHash } from './Utility.js';
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
} from './Interfaces.js';

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
export default class Collection<GenericModel extends Model>
	extends ActiveRecord<Collection<GenericModel>>
	implements Iterable<GenericModel>
{
	/**
	 * This static function could be overridden globally depending on the
	 * structure of your API. By default, we assume it's within ._meta
	 *
	 * @param Collection collection
	 * @return object
	 */
	public static paginator(collection: any): IPagination {
		return collection._meta.pagination;
	}

	/**
	 * Hydrate a collection full of models
	 *
	 * @param Model[] models
	 * @param object options
	 * @param boolean trigger
	 * @type Collection
	 */
	public static hydrate<T>(models: Model[] | any = [], options: object = {}, trigger: boolean = true): any {
		// Instantiate collection
		const collection = new this(options);

		// Add models to collection
		if (models) {
			collection.add(models, {}, trigger);
		}

		// Add options to collection
		collection.setOptions(options);

		return collection;
	}

	/**
	 * @return boolean
	 */
	protected get isCollection(): boolean {
		return true;
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
	 * Meta data associated with collection
	 *
	 * @type ICollectionMeta
	 */
	public _meta: ICollectionMeta = {
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
	 * @type GenericModel
	 */
	public model!: GenericModel;

	/**
	 * @type GenericModel[]
	 */
	public models: GenericModel[] = [];

	/**
	 * @type string
	 */
	protected sortKey: string = 'id';

	/**
	 * @type CollectionIterator<GenericModel>
	 */
	private iterator: CollectionIterator<GenericModel>;

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

		// Setup basic class iterator
		this.iterator = new CollectionIterator(this);

		// Set default data key
		this.dataKey = 'data';

		// Set options
		this.setOptions(options);

		// Default builder
		this.builder.qp('limit', options.limit || this.limit).qp('page', options.page || this.page);

		// Custom options
		if (options.atRelationship) {
			this.atRelationship = options.atRelationship;
		}
	}

	/**
	 * @return object
	 */
	public toJSON(): object {
		return this.models.map((model) => {
			if (typeof model.toJSON === 'function') {
				return model.toJSON();
			}

			return model;
		});
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
	 * Fetch previous page with last used set of options
	 *
	 * @param bool append
	 * @return Promise<HttpRequest>
	 */
	public async fetchPrevious(append: boolean = false): Promise<HttpRequest> {
		let options = Object.assign({}, this.lastRequest.options);
		let qp = Object.assign({}, this.builder.queryParams, this.lastRequest.queryParams);

		// Decrease page number
		qp.page = Math.max(1, parseFloat(qp.page) - 1);

		// Merge
		options.merge = append;

		// Fetch
		return await this._fetch(options, qp, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
	}

	/**
	 * @return string
	 */
	public getEndpoint(): string {
		return super.getEndpoint() || this.model.endpoint;
	}

	/**
	 * Add or prepend Model(s) to our list. Set `prepend` = true on options
	 * if you'd like to prepend the models
	 *
	 * @param  Model[] | Model | object data
	 * @param  IAttributes options
	 * @param  boolean trigger
	 * @return Collection
	 */
	public add(data: GenericModel[] | GenericModel | object, options: IAttributes = {}, trigger: boolean = true): this {
		if (data == undefined) {
			return this;
		}

		// Ensure data is on correct key
		data = this.cleanData(data);

		// Allow multiple models/data or single
		const models: any = Array.isArray(data) ? data : [data];

		// Iterate through supplied models/data
		models.forEach((model: GenericModel) => {
			// Data supplied is an object that must be instantiated
			if (!(model instanceof Model)) {
				// @ts-ignore
				model = new this.model.constructor(model);
			}

			// Set references on model
			model.parent = this;
			model.headers = this.headers;

			// Check the modified endpoint
			if (this.referenceForModifiedEndpoint) {
				model.useModifiedEndpoint(this.referenceForModifiedEndpoint);
			}

			// Trigger event before adding it
			trigger && this.dispatch('add:before', { model });

			// Add to list
			if (options.prepend) {
				this.models.unshift(model);
			} else {
				this.models.push(model);
			}
		});

		// Event for add
		trigger && this.dispatch('change', { from: 'add' });
		trigger && this.dispatch('add');

		return this;
	}

	/**
	 * Remove a model, a set of models, or an object
	 *
	 * @param  Model[] | Model | object model
	 * @param  boolean trigger
	 * @return Collection
	 */
	public remove(model: Model[] | Model | object, trigger: boolean = true): this {
		let i: number = 0;
		let ii: number = 0;
		const items: any = Array.isArray(model) ? model : [model];

		// Take the first model in our list and iterate through our local
		// models. If we are successful, call recursive
		for (ii = 0; ii < items.length; ii++) {
			i = 0;

			while (i < this.models.length) {
				trigger && this.dispatch('remove:before', { model: this.models[i] });

				if (this.models[i] == items[ii]) {
					this.models.splice(i, 1);
				} else {
					++i;
				}
			}
		}

		// Event for add
		trigger && this.dispatch('change', { from: 'remove' });
		trigger && this.dispatch('remove');

		return this;
	}

	/**
	 * Reset and add new models
	 *
	 * @todo Review this
	 *
	 * @param  Model[] | Model | object model
	 * @param  IAttributes options
	 * @param  boolean trigger
	 * @return Collection
	 */
	public set(model: Model[] | Model | object, options: IAttributes = {}, trigger: boolean = true): this {
		if (!options || (options && options.merge != true)) {
			this.reset();
		}

		// Add model to list
		this.add(model, options, trigger);

		// Event for add
		trigger && this.dispatch('set');

		return this;
	}

	/**
	 * @return Collection
	 */
	public clear(): this {
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
	public delete(attributes: any = {}): Promise<HttpRequest> {
		if (!attributes || !attributes.id) {
			throw new Error('No ID provided to delete');
		}

		// Set builder identifier
		this.builder.identifier(attributes?.id || this.id || '');

		// Remove model from collection
		const model = this.findWhere({ id: attributes.id });
		model && this.remove(model);

		// Attributes
		const body = undefined;
		const headers = this.headers;
		const method = 'DELETE';

		return this._fetch(null, {}, method, body, headers);
	}

	/**
	 * Iterate over the models list
	 * @return void
	 */
	public each(callback: any): void {
		this.models.forEach(callback);
	}

	/**
	 * Filter through a models list
	 * @return void
	 */
	public filter(predicate: any): GenericModel[] {
		return this.models.filter(predicate);
	}

	/**
	 * @return Model[]
	 */
	public map(...params: any): any[] {
		return <Model[]>Array.prototype.map.apply(this.models, params);
	}

	/**
	 * @param Model[] | Model | object model
	 * @param object = {} options
	 * @return Collection
	 */
	public push(model: Model[] | Model | object, options: object = {}): Collection<GenericModel> {
		this.add(model, options);

		return this;
	}

	/**
	 * @return Collection
	 */
	public pop(): this {
		const model: GenericModel = this.at(this.length - 1);

		return this.remove(model);
	}

	/**
	 * @todo Might want to do more with this
	 * @return Collection
	 */
	public reset(): this {
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
	public unshift(model: GenericModel[] | GenericModel | object, options: IAttributes = {}): this {
		return this.add(model, Object.assign({ prepend: true }, options));
	}

	/**
	 * Remove first object
	 *
	 * @return Collection
	 */
	public shift(): this {
		const model: GenericModel = this.at(0);

		return this.remove(model);
	}

	/**
	 * @return Collection
	 */
	public shuffle(): this {
		this.models = this.models.sort(() => Math.random() - 0.5);

		return this;
	}

	/**
	 * @return this
	 */
	public reverse(): Collection<GenericModel> {
		this.models = this.models.reverse();

		return this;
	}

	/**
	 * Cut up collection models
	 *
	 * @return Model[]
	 */
	public slice(...params: any): GenericModel[] {
		return <GenericModel[]>Array.prototype.slice.apply(this.models, params);
	}

	/**
	 * @return Collection
	 */
	public unique(): this {
		this.models = this.models.filter((value, index, self) => self.indexOf(value) === index);

		return this;
	}

	/**
	 * Get model by ID
	 *
	 * @param  string | number  id
	 * @return Model | undefined
	 */
	public get(query: GenericModel | number | string): Model | undefined {
		if (query == null) {
			return void 0;
		}

		return this.where({ [this.modelId]: query instanceof Model ? query.id : query }, true) as GenericModel;
	}

	/**
	 * Checks if we have an object or Model
	 *
	 * @param  GenericModel | object  obj
	 * @return boolean
	 */
	public has(obj: GenericModel | number | string): boolean {
		return this.get(obj) != undefined;
	}

	/**
	 * Get model at index
	 *
	 * @param number index
	 * @return GenericModel
	 */
	public at(index: number = 0): GenericModel {
		if (index < 0) {
			index += this.length;
		}

		// Get model
		let item: any = this.models[index];

		// Transform through
		// mk: This doesn't look like it works yet?
		if (this.atRelationship && this.atRelationship.length) {
			this.atRelationship.forEach((key) => (item = item[key]));
		}

		return item;
	}

	/**
	 * Get first item
	 *
	 * @return GenericModel
	 */
	public first(): GenericModel {
		return this.at(0);
	}

	/**
	 * @return GenericModel
	 */
	public last(): GenericModel {
		return this.at(this.length - 1);
	}

	/**
	 * Comparing hard object attributes to model attr
	 *
	 * @param  IAttributes json
	 * @param  boolean first
	 * @param  boolean fullMatch
	 * @return Collection | Model
	 */
	public where(
		json: IAttributes = {},
		first: boolean = false,
		fullMatch: boolean = false
	): this | Collection<GenericModel> | GenericModel {
		const constructor: any = this.constructor;
		const filteredModels: any[] = [];

		this.models.forEach((model: GenericModel) => {
			// Get assigned attributes per model
			const attributes: string[] = Object.keys(json);

			// Find intersection of our model and what has been passed in
			const intersection: string[] = attributes.filter((key: string) => {
				return (
					// Exists in our search request
					key in json &&
					// The two values are equivalent
					model.attr(key) == json[key]
				);
			});

			// We have a full intersection
			if (fullMatch && intersection.length == attributes.length) {
				filteredModels.push(model);
			}

			// We have a partial intersection
			else if (!fullMatch && intersection.length) {
				filteredModels.push(model);
			}
		});

		// Hydrate from models
		const collection = constructor.hydrate(filteredModels, this.options, false);

		return first ? collection.first() : collection;
	}

	/**
	 * @param  IAttributes attributes
	 * @return Model
	 */
	public findWhere(attributes: IAttributes = {}): GenericModel {
		return this.where(attributes, true) as GenericModel;
	}

	/**
	 * @param  string cid
	 * @return Model | undefined
	 */
	public findByCid(cid: string): GenericModel {
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
	public sort(options: IAttributes = {}): Collection<GenericModel> {
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
	 * Return an iterator for values based on this collection
	 *
	 * @param filter Optional filter function
	 * @return CollectionIterator
	 */
	public values(filter?: (model: GenericModel, index: number) => boolean): CollectionIterator<GenericModel> {
		return new CollectionIterator<GenericModel>(this, CollectionIterator.ITERATOR_VALUES, filter);
	}

	/**
	 * Return an iterator for keys based on this collection
	 *
	 * @param filter Optional filter function
	 * @return CollectionIterator
	 */
	public keys(filter?: (model: GenericModel, index: number) => boolean): CollectionIterator<GenericModel> {
		return new CollectionIterator<GenericModel>(this, CollectionIterator.ITERATOR_KEYS, filter);
	}

	/**
	 * Return an iterator for entries (key + value) based on this collection
	 *
	 * @param filter Optional filter function
	 * @return CollectionIterator
	 */
	public entries(filter?: (model: GenericModel, index: number) => boolean): CollectionIterator<GenericModel> {
		return new CollectionIterator<GenericModel>(this, CollectionIterator.ITERATOR_KEYSVALUES, filter);
	}

	/**
	 * @param filter Optional filter function
	 * @return GenericModel | undefined
	 */
	public next(filter?: (model: GenericModel, index: number) => boolean): GenericModel | undefined {
		const result = this.iterator.next(filter);
		return result.done ? undefined : result.value;
	}

	/**
	 * @param filter Optional filter function
	 * @return GenericModel | undefined
	 */
	public previous(filter?: (model: GenericModel, index: number) => boolean): GenericModel | undefined {
		const result = this.iterator.previous(filter);
		return result.done ? undefined : result.value;
	}

	/**
	 * @return number
	 */
	public index(): number {
		return this.iterator.index;
	}

	/**
	 * @param filter Optional filter function
	 * @return GenericModel | undefined
	 */
	public current(filter?: (model: GenericModel, index: number) => boolean): GenericModel | undefined {
		const result = this.iterator.current();

		if (!result.done && filter) {
			const model = result.value;
			const index = this.indexOf(model);

			if (filter(model, index)) {
				return model;
			}

			return undefined;
		}

		return result.done ? undefined : result.value;
	}

	/**
	 * Reset the main iterator to the beginning of the collection
	 */
	public resetIterator(): void {
		this.iterator = new CollectionIterator<GenericModel>(this);
	}

	/**
	 * Find the index of a model in the collection
	 * @param model The model to find
	 * @return number The index of the model, or -1 if not found
	 */
	public indexOf(model: GenericModel): number {
		// Implement this method based on how you store models in your collection
		// This is a placeholder implementation
		return this.models.indexOf(model);
	}

	/**
	 * Used when iterating on the class itself, like
	 *
	 * for (const model of collection) { ...
	 *
	 * @type Iterator<any>
	 */
	[Symbol.iterator](): any {
		return new CollectionIterator<GenericModel>(this, CollectionIterator.ITERATOR_VALUES);
	}

	// region: Event Handlers
	// ---------------------------------------------------------------------------

	/**
	 * Handle change event
	 * @param IDispatcherEvent e
	 * @return void
	 */
	protected Handle_OnChange(e: IDispatcherEvent): void {
		const ids = this.models.map((model: any) => model.id).join(',');
		const hash =
			compactObjectHash(JSON.stringify(this.attributes) + ids) +
			Math.random().toString(36).substr(2, 5) +
			Date.now();

		this.uniqueKey = hash;
	}

	// endregion: Event Handlers
}
