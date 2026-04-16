import { Collection } from '../../../src/index';
import ModelContent from '../models/Content';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Collection
 * @project RestMC
 */
export default class CollectionContent extends Collection<ModelContent> {
	/**
	 * @type ModelContent
	 */
	public model: ModelContent = new ModelContent();
}
