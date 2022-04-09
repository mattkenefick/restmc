import Collection from './Core';
import ModelUser from '../Model/User';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Collection
 * @project RestMC
 */
export default class User extends Collection {
	/**
	 * @type string
	 */
	public endpoint: string = 'user';

	/**
	 * @type Model
	 */
	public model: ModelUser = ModelUser;
}
