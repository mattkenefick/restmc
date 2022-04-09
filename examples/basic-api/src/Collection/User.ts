import CollectionCore from './Core';
import ModelUser from '../Model/User';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Collection
 * @project RestMC
 */
export default class CollectionUser extends CollectionCore<ModelUser> {
	/**
	 * @type string
	 */
	public endpoint: string = 'user';

	/**
	 * @type ModelUser
	 */
	public model: ModelUser = new ModelUser();
}
