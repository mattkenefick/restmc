import Model from './Core';

/**
 * @class Media
 * @package Model
 * @project ChalkySticks SDK Core
 */
export default class Media extends Model {
	/**
	 * Endpoint key
	 * e.g. https://api.chalkysticks.com/v3/media
	 *
	 * @type string
	 */
	public endpoint: string = 'media';

	/**
	 * List of fields available
	 *
	 * @type string[]
	 */
	public fields: string[] = ['id', 'type', 'url', 'group', 'subgroup', 'created_at', 'updated_at'];

	// region: Getters
	// ---------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getGroup(): string {
		return this.attr('group') as string;
	}

	/**
	 * @return string
	 */
	public getSubgroup(): string {
		return this.attr('subgroup') as string;
	}

	/**
	 * @return string
	 */
	public getType(): string {
		return this.attr('type') as string;
	}

	/**
	 * @return string
	 */
	public getUrl(): string {
		return this.attr('url') as string;
	}

	/**
	 * @return string
	 */
	public getCreatedAt(): string {
		return this.attr('created_at') as string;
	}

	/**
	 * @return string
	 */
	public getUpdatedAt(): string {
		return this.attr('updated_at') as string;
	}

	// endregion: Getters
}
