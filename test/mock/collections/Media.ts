import { Collection } from '../../../src/index';
import ModelMedia from '../models/Media';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Collection
 * @project RestMC
 */
export default class CollectionMedia extends Collection<ModelMedia> {
	/**
	 * @type ModelMedia
	 */
	public model: ModelMedia = new ModelMedia();
}
