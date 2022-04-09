import { Collection, Model } from 'restmc';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Collection
 * @project RestMC
 */
export default class Core extends Collection {
	/**
	 * @type string
	 */
	public baseUrl: string = 'https://api.shortverse.com/v1';
}
