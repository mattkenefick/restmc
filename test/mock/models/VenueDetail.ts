import { Model } from '../../../src/index';

/**
 * Mock model representing a single venue detail row (key/value pair
 * like { group: 'details', key: 'google-rating', value: '4.5' }).
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Model
 * @project RestMC
 */
export default class ModelVenueDetail extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'details';

	// region: Getters
	// -------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getKey(): string {
		return this.attr('key') as string;
	}

	/**
	 * @return string
	 */
	public getValue(): string {
		return this.attr('value') as string;
	}

	// endregion: Getters
}
