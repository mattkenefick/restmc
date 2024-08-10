import ActiveRecord from './ActiveRecord.js';
import Collection from './Collection.js';
import { IAttributes, IOptions, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces.js';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package RestMC
 * @project RestMC
 */
export default class Model extends ActiveRecord<Model> {
	/**
	 * @param IAttributes attributes
	 * @param IAttributes options
	 * @return Model
	 */
	public static hydrate<T>(attributes: IAttributes = {}, options: IOptions = {}): Model {
		const model = new this(options);
		model.set(attributes);
		model.setOptions(options);
		return model;
	}

	/**
	 * ActiveRecord can define a root key for the data ingested. For models,
	 * we assume that there is no root key, such as { "data": { ... } }
	 *
	 * If our API uniformly uses a root key, then we can set this to
	 * a default value
	 */
	public static defaultDataKey: string | undefined = undefined;

	/**
	 * Use this if your relationships exist within a subkey of some type.
	 *
	 * For example:
	 *
	 * {
	 *     "id": 1,
	 *     "media": { ... },
	 * }
	 *
	 * versus
	 *
	 * {
	 *     "id": 1,
	 *     "relationships": {
	 *         "media": { ... }
	 *     },
	 * }
	 *
	 * @type string | null
	 */
	public static relationshipKey: string | null = null;

	/**
	 * For our relationships like hasOne, we assume that the resulting
	 * endpoint will consume the other endpoint.
	 *
	 *     film.hasOne('review', ModelReview)
	 *
	 * becomes film/1/review.
	 *
	 * If you disable this feature, then the endpoint will be: /review
	 *
	 * @type string | null
	 */
	public static useDescendingRelationships: boolean = true;

	/**
	 * Model if we provide a specific identifier
	 *
	 * @return boolean
	 */
	protected get isModel(): boolean {
		return true;
	}

	/**
	 * Instance cache for relationships. When using hasOne or hasMany,
	 * we save the instantiations to this object for faster access.
	 *
	 * @type IAttributes
	 */
	private relationshipCache: IAttributes = {};

	/**
	 * @param IAttributes attributes
	 * @param IAttributes options
	 */
	constructor(attributes: IAttributes = {}, options: IAttributes = {}) {
		super(options);

		// Set datakey to be undefined. The default of ActiveRecord is to
		// have this on "data", which is used for JSON outputs that look like:
		// { "data": { ... } }
		//
		// But for most models we use, we don't want this.
		// We want it to be on the root.
		this.dataKey = Model.defaultDataKey || undefined;

		// Set attributes
		this.set(attributes);

		// Set options
		this.setOptions(options);
	}

	/**
	 * @note Unsure if we should delete existing relationships
	 * or `set` on them. I think we have failures with the `set`
	 *
	 * @param IAttributes attributes
	 * @return Model
	 */
	public set(attributes: IAttributes = {}): Model {
		let key: string;

		// Trigger event
		this.dispatch('set:before', { attributes });

		// mk: 29, we disabled this because it breaks references
		// but we had previously enabled it for some reason.
		// What would that reason be?

		// This forces a reset of relationship caches
		// for (let key in hash) {
		//     // @ts-ignore
		//     if (this.relationshipCache[key]) {
		//         // @ts-ignore
		//         delete this.relationshipCache[key];
		//     }
		// }

		// Don't trigger event in superclass
		super.set(attributes, {}, false);

		// If we find an array of data on our dataKey, it's likely that
		// we accidentally received collection data on a model. We won't
		// stop it from happening, but we should raise an alert
		if (this.dataKey && this.attributes[this.dataKey] && this.attributes[this.dataKey].length) {
			console.warn(
				[
					'This model is incorrectly receiving data meant for a collection.',
					'We found an array on key: ',
					this.dataKey,
				].join(' '),
				this
			);
		}

		// Update any relationship caches that exist
		// Don't delete them, as to retain object references
		for (key in attributes) {
			if (this.relationshipCache[key]) {
				this.relationshipCache[key].set(attributes[key]);
			}
		}

		// Trigger event
		this.dispatch('set', { attributes });

		return this;
	}

	/**
	 * @param IModelRequestOptions options
	 * @param IModelRequestQueryParams queryParams
	 * @return Promise
	 */
	public async fetch(options: IModelRequestOptions = {}, queryParams: IModelRequestQueryParams = {}) {
		// Allow options to override the ID of our URL
		this.builder.identifier(options && options.id ? options.id : this.id);

		// Check if ID exists
		if (!(options && options.id) && !this.id) {
			console.warn('Fetching a model without an ID is likely incorrect behavior.', this, this.toJSON());
		}

		return await super.fetch(options, queryParams);
	}

	// region: Relationships
	// ------------------------------------------------------------------------

	/**
	 * Return singular instance of related content
	 * e.g. return this.hasOne<ModelContent>('review', ModelContent);
	 *
	 * @param string relationshipName
	 * @param any relationshipClass
	 * @return ActiveRecord
	 */
	public hasOne<T>(relationshipName: string, relationshipClass: T): T {
		// Return cached relationship, if exists
		if (this.relationshipCache[relationshipName]) {
			return this.relationshipCache[relationshipName];
		}

		// Create new model using data from this object
		// e.g. new ModelContent(this.attr('review'))
		let content = this.getRelationship(relationshipName) || {};

		// @ts-ignore
		let model = new relationshipClass(content);

		// Provide reference to this model as parent
		model.parent = this;

		// If the content is empty, check to see if the parent has an "id"
		// that might be worth prefilling.
		// e.g. `relationshipName` == 'product', look for 'product_id'
		if (!model.id) {
			// e.g. 'product_id', 'myTableName_id', etc
			const camelRelationship: string = `${relationshipName}_id`;

			// e.g. 'product_id', 'my_table_name_id', etc
			const underscoreRelationship: string = camelRelationship.replace(
				/[A-Z]/g,
				(x: string) => '_' + x.toLowerCase()
			);

			// Pick whichever one is first
			const relationshipId: string | number =
				this.attr(camelRelationship) || this.attr(underscoreRelationship) || '';

			// Change the ID of this model
			model.setId(relationshipId as string);
		}

		// Use modified endpoints for relationships if we want
		// something like `/film/1/review/2` rather than `/review/2`
		if (Model.useDescendingRelationships) {
			model.useModifiedEndpoint(this);
		}

		return (this.relationshipCache[relationshipName] = model) as T;
	}

	/**
	 * Return multiple instances of related content
	 * e.g. return this.hasMany<ModelContent>('review', ModelContent);
	 *
	 * @param string relationshipName
	 * @param any relationshipClass
	 * @return Collection
	 */
	public hasMany<T>(relationshipName: string, relationshipClass: any): T {
		// Return cached relationship, if exists
		if (this.relationshipCache[relationshipName]) {
			return this.relationshipCache[relationshipName];
		}

		const dataKey: string | undefined = new relationshipClass().dataKey;
		const content: Collection<any> | Model | undefined = this.getRelationship(relationshipName);
		const collection: any = relationshipClass.hydrate((dataKey && content ? content[dataKey] : null) || content);

		// Provide reference to this collection as parent
		collection.parent = this;

		// Use modified endpoints
		if (Model.useDescendingRelationships) {
			collection.useModifiedEndpoint(this);
		}

		return (this.relationshipCache[relationshipName] = collection) as T;
	}

	/**
	 * @param string relationshipName
	 * @return object
	 */
	protected getRelationship(relationshipName: string): any {
		// Relationship is on root
		if (Model.relationshipKey === null) {
			return this.attr(relationshipName);
		}

		// Relationship is buried somewhere, like
		// { "relationships": { "media": { ... } } }
		else {
			return (this.attr(Model.relationshipKey) || {})[relationshipName];
		}
	}

	// endregion
}
