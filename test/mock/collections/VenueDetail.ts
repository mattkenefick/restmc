import { Collection } from '../../../src/index';
import ModelVenueDetail from '../models/VenueDetail';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Collection
 * @project RestMC
 */
export default class CollectionVenueDetail extends Collection<ModelVenueDetail> {
	/**
	 * @type ModelVenueDetail
	 */
	public model: ModelVenueDetail = new ModelVenueDetail();
}
