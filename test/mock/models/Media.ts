import { Model } from '../../../src/index';

/**
 * Mock model representing a single media row nested inside a venue.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Model
 * @project RestMC
 */
export default class ModelMedia extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'media';

	// region: Getters
	// -------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getUrl(): string {
		return this.attr('url') as string;
	}

	/**
	 * @return string
	 */
	public getType(): string {
		return this.attr('type') as string;
	}

	// endregion: Getters
}
