import { Collection, Model } from 'restmc';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Collection
 * @project RestMC
 */
export default class CollectionCore<T extends Model> extends Collection<T> {
	/**
	 * @type string
	 */
	public baseUrl: string = 'https://api.shortverse.com/v1';
}
