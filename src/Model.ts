import ActiveRecord from './ActiveRecord';
import Collection from './Collection';
import Request from './Http/Request';
import { IAttributes, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces';

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
	public static hydrate<T>(attributes: IAttributes = {}, options: IAttributes = {}): Model {
		// Instantiate model
		const model = new this(options);

		// Add models to model
		model.set(attributes);

		// Set options to model
		model.setOptions(options);

		return model;
	}

	/**
	 * Use this if your relationships exist within a subkey of some type.
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
	 * becomes film/1/review. If you disable this feature, then the
	 * endpoint will be: /review
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
	 * List of relationships available
	 *
	 * @type object
	 */
	public relationships: object = {};

	/**
	 * Instance cache for relationships
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

		// Set datakey
		this.dataKey = undefined;

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
		this.dispatch('set:before', attributes);

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

		// Don't trigger event
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
				this,
			);
		}

		// Update any relationship caches that exist
		// Don't delete them, as to save object references
		for (key in attributes) {
			if (this.relationshipCache[key]) {
				this.relationshipCache[key].set(attributes[key]);
			}
		}

		// Trigger event
		this.dispatch('set', attributes);

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
	 * e.g. return this.hasOne('review', ModelContent);
	 *
	 * @param string relationshipName
	 * @param any relationshipClass
	 * @return ActiveRecord
	 */
	public hasOne(relationshipName: string, relationshipClass: any): Model | undefined {
		// Return cached relationship, if exists
		if (this.relationshipCache[relationshipName]) {
			return this.relationshipCache[relationshipName];
		}

		// Create new model using data from this object
		// e.g. new ModelContent(this.attr('review'))
		let content = this.getRelationship(relationshipName) || {};
		let model = new relationshipClass(content);

		// Reference this model as parent
		model.parent = this;

		// Use modified endpoints
		if (Model.useDescendingRelationships) {
			model.useModifiedEndpoint(this);
		}

		return (this.relationshipCache[relationshipName] = model);
	}

	/**
	 * Return multiple instances of related content
	 *
	 * @param string relationshipName
	 * @param any relationshipClass
	 * @return Collection
	 */
	public hasMany(relationshipName: string, relationshipClass: any): Collection<any> | undefined {
		// Return cached relationship, if exists
		if (this.relationshipCache[relationshipName]) {
			return this.relationshipCache[relationshipName];
		}

		const dataKey: string | undefined = new relationshipClass().dataKey;
		const content: Collection<any> | Model | undefined = this.getRelationship(relationshipName);
		const collection: any = relationshipClass.hydrate((dataKey && content ? content[dataKey] : null) || content);

		// Reference relationship parent
		collection.parent = this;

		// Use modified endpoints
		if (Model.useDescendingRelationships) {
			collection.useModifiedEndpoint(this);
		}

		return (this.relationshipCache[relationshipName] = collection);
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

		// Relationship is buried
		else {
			return (this.attr(Model.relationshipKey) || {})[relationshipName];
		}
	}

	// endregion
}
