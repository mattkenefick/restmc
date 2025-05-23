import ActiveRecord from './ActiveRecord.js';
import Collection from './Collection.js';
import Request from './Http/Request.js';
import { IAttributes, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces.js';

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
	 * Attempt to prevent circular relationship references
	 *
	 * @type boolean
	 */
	public circularProtection: boolean = true;

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
	public set(attributes: IAttributes = {}): this {
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
				this
			);
		}

		// Update any relationship caches that exist
		// Don't delete them, as to save object references
		// How does this work if it's a { data: { ... } }?
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
	 * e.g. return this.hasOne('review', ModelContent);
	 *
	 * @param string relationshipName
	 * @param any relationshipClass
	 * @return ActiveRecord
	 */
	public hasOne<T>(relationshipName: string, relationshipClass: any): T {
		// Temporary fix
		if (this.circularProtection) {
			let parent = this.parent;

			while (parent) {
				if (parent.endpoint === this.endpoint && parent.id === this.id) {
					return undefined as unknown as T;
				}

				parent = parent.parent;
			}
		}

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

		// If the content is empty, check to see if the parent has an "id"
		// that might be worth prefilling.
		// e.g. `relationshipName` == 'product', look for 'product_id'
		if (!model.id) {
			const camelRelationship: string = `${relationshipName}_id`;
			const underscoreRelationship: string = camelRelationship.replace(
				/[A-Z]/g,
				(x: string) => '_' + x.toLowerCase()
			);
			const relationshipId: string | number =
				this.attr(camelRelationship) || this.attr(underscoreRelationship) || '';

			model.setId(relationshipId as string);
		}

		// Use modified endpoints
		if (Model.useDescendingRelationships) {
			model.useModifiedEndpoint(this);
		}

		return (this.relationshipCache[relationshipName] = model) as T;
	}

	/**
	 * Return multiple instances of related content
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
		const models: any = (dataKey && content ? content[dataKey] : null) || content;

		// mk: Hydrating the models here then setting the modified endpoint
		// wont pass the modified endpoint down to the children.
		// const collection: any = relationshipClass.hydrate((dataKey && content ? content[dataKey] : null) || content);
		const collection: any = new relationshipClass({
			parent: this,
		});

		// Use modified endpoints
		if (Model.useDescendingRelationships) {
			collection.useModifiedEndpoint(this);
		}

		// Add models to new collection
		collection.add(models, {}, true);

		return (this.relationshipCache[relationshipName] = collection) as T;
	}

	/**
	 * Clear a relationship from the cache
	 *
	 * @param string relationshipName
	 * @return this
	 */
	public clearRelationship(relationshipName: string): this {
		if (this.relationshipCache[relationshipName]) {
			delete this.relationshipCache[relationshipName];
		}

		return this;
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
