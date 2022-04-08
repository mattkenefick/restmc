import CollectionUser from '../collections/User';
import { Model } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Model
 * @project RestMC
 */
export default class ModelUser extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'user';

	// region: Relationships
	// -------------------------------------------------------------------------

	public get friends(): CollectionUser {
		return this.hasMany('friends', CollectionUser);
	}

	// endregion: Relationships
}
