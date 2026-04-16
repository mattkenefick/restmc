import { Model } from '../../../src/index';

/**
 * Mock model representing a ChalkySticks content article.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Model
 * @project RestMC
 */
export default class ModelContent extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'content';

	// region: Getters
	// -------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getTitle(): string {
		return this.attr('title') as string;
	}

	/**
	 * @return string
	 */
	public getSlug(): string {
		return this.attr('slug') as string;
	}

	// endregion: Getters
}
