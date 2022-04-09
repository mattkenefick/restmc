import CollectionCore from './Core';
import ModelLeague from '../Model/League';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Collection
 * @project RestMC
 */
export default class CollectionUser extends CollectionCore<ModelLeague> {
	/**
	 * @type ModelLeague
	 */
	public model: ModelLeague = new ModelLeague();
}
