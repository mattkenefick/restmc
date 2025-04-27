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
	public baseUrl: string = 'https://api.chalkysticks.com/v1';

	/**
	 * @return string
	 */
	public getBaseUrl(): string {
		return 'http://localhost:8000/v3';
	}
}
