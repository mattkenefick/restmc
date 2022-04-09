import { Collection } from '../../../src/index';
import ModelUser from '../models/User';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Collection
 * @project RestMC
 */
export default class CollectionUser extends Collection<ModelUser> {
	/**
	 * @type ModelUser
	 */
	public model: ModelUser = new ModelUser();
}
