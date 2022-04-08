import CollectionUser from '../collections/User';
import { Model } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Model
 * @project RestMC
 */
export default class ModelLocation extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'location';

	// region: Getters
	// ---------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getCity(): string {
		return this.attr('city');
	}

	/**
	 * @return string
	 */
	public getState(): string {
		return this.attr('state');
	}

	// endregion: Getters
}
