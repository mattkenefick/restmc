import { Collection } from '../../../src/index';
import ModelVenue from '../models/Venue';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Collection
 * @project RestMC
 */
export default class CollectionVenue extends Collection<ModelVenue> {
	/**
	 * @type ModelVenue
	 */
	public model: ModelVenue = new ModelVenue();
}
