import Model from './Core';
import ModelImage from './Image';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Model
 * @project RestMC
 */
export default class ModelLeague extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'leagues';

	// region: Relationships
	// ---------------------------------------------------------------------------

	public get logo(): ModelImage {
		return this.hasOne<ModelImage>('logos', ModelImage);
	}

	// endregion: Relationships

	// region: Getters
	// ---------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getAbbreviation(): string {
		return this.attr('abbr') as string;
	}

	/**
	 * @return string
	 */
	public getName(): string {
		return this.attr('name') as string;
	}

	/**
	 * @return string
	 */
	public getSlug(): string {
		return this.attr('slug') as string;
	}

	// endregion: Getters
}
