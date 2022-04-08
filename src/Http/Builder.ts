import { IDispatcherCallbackFunction, IDispatcherEventData } from '../Interfaces';
import ActiveRecord from '../ActiveRecord';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Http
 * @project RestMC
 */
export default class Builder<T> {
	/**
	 * @type string
	 */
	public id: string = '';

	/**
	 * Define a list of relationships to include
	 * e.g. media, tags
	 *
	 * @type string[]
	 */
	public includes: string[] = [];

	/**
	 * What to concatenate our includes with
	 *
	 * @type string
	 */
	public includeJoinBy: string = ',';

	/**
	 * Key that the server expects for defining relationships
	 *
	 * @type string
	 */
	public includeKey: string = 'include';

	/**
	 * @type object
	 */
	public queryParams: any = {};

	/**
	 * Reference to ActiveRecord (Model/Collection) we're building for
	 *
	 * @type ActiveRecord
	 */
	protected activeRecord: ActiveRecord<T>;

	/**
	 * @param ActiveRecord activeRecord
	 */
	constructor(activeRecord: ActiveRecord<T>) {
		this.activeRecord = activeRecord;
	}

	/**
	 * Requestable URL
	 *
	 * @return string
	 */
	public getUrl(): string {
		const baseUrl: string = this.getBaseUrl();
		const endpoint: string = this.getEndpoint();
		const queryParamStr: string = this.getQueryParamsAsString();
		const isModified: boolean = this.activeRecord.isUsingModifiedEndpoint();
		const modifiedBefore: boolean = isModified && this.activeRecord.modifiedEndpointPosition == 'before';
		const modifiedAfter: boolean = isModified && this.activeRecord.modifiedEndpointPosition == 'after';

		let urlBuilder = '';

		// Root API URI
		urlBuilder += baseUrl;

		// Enforce a preceded slash
		urlBuilder += endpoint[0] === '/' ? endpoint : '/' + endpoint;

		// If we are modifying after (base / x / modified), then use active record id at the end
		if (isModified && modifiedAfter && this.activeRecord?.getReferencedEndpoint()) {
			urlBuilder += '/' + this.activeRecord?.getReferencedEndpoint()?.id || '';
		}

		// Use the explicit ID set in this builder
		else if (this.id !== '') {
			urlBuilder += '/' + this.id;
		}

		// Use the ID from the Model/Collection host as long as
		// we don't want the modified endpoint last
		else if (!modifiedAfter && this.activeRecord.id !== '') {
			urlBuilder += '/' + this.activeRecord.id;
		}

		// Separate query string
		urlBuilder += '?' + queryParamStr;

		// Clean URL
		// mk: We tried split/join at first but that created errors
		// on "https://" and "//api.sotw.com..."
		urlBuilder = urlBuilder.replace(/([a-zA-Z0-9])\/\//g, '$1/');

		return urlBuilder;
	}

	/**
	 * @type string
	 */
	public getBaseUrl(): string {
		return this.activeRecord.baseUrl;
	}

	/**
	 * If we attach a model to modify the endpoint, this will distinguish
	 * between the two. An example of this would be if we attached
	 * a ModelFilm, then this might return
	 *
	 *      /film/1/my-endpoint
	 *
	 * as opposed to
	 *
	 *      /my-endpoint
	 *
	 *  @type string
	 */
	public getEndpoint(): string {
		return this.activeRecord.isUsingModifiedEndpoint()
			? this.activeRecord.getModifiedEndpoint()
			: this.activeRecord.endpoint;
	}

	/**
	 * There are alternate approaches to this logic, but this is
	 * written verbosely to allow for conditionals, modifications,
	 * and clarity.
	 *
	 * We don't force logic into one-liners.
	 *
	 * @type string
	 */
	public getQueryParamsAsString(): string {
		let str: string = '';

		// Combine query params
		for (let key in this.queryParams) {
			let value = this.queryParams[key];

			if (value != null && value != '') {
				str += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
			}
		}

		// Add includes
		if (this.includeKey && this.includes.length) {
			str += '&' + this.includeKey + '=' + this.includes.join(this.includeJoinBy);
		}

		return str;
	}

	/**
	 * @param string | number id
	 * @return Builder
	 */
	public identifier(id: string | number): Builder<T> {
		this.id = id.toString();
		return this;
	}

	/**
	 * Add an include
	 *
	 * @param string value
	 * @return Builder
	 */
	public include(value: string): Builder<T> {
		this.includes.push(value);
		return this;
	}

	/**
	 * Add a query parameter
	 *
	 * @param string key
	 * @param number | string value
	 * @return Builder
	 */
	public queryParam(key: string, value: number | string): Builder<T> {
		this.queryParams[key] = value;
		return this;
	}

	/**
	 * Alias for queryParam
	 *
	 * @param  string key
	 * @param  number | string value
	 * @return Builder
	 */
	public qp(key: string, value: number | string): Builder<T> {
		return this.queryParam(key, value);
	}
}
