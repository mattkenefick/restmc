import CollectionCore from './Core';
import ModelVenue from '../Model/Venue';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Collection
 * @project RestMC
 */
export default class CollectionVenue extends CollectionCore<ModelVenue> {
	/**
	 * @type string
	 */
	public endpoint: string = 'venues';

	/**
	 * @type ModelVenue
	 */
	public model: ModelVenue = new ModelVenue();
}
