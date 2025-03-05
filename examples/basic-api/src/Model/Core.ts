import { Model } from 'restmc';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Model
 * @project RestMC
 */
export default class ModelCore extends Model {
	/**
	 * @type string
	 */
	public baseUrl: string = 'https://api.chalkysticks.com/v1';

	/**
	 * @return string
	 */
	public getBaseUrl(): string {
		return 'https://example.com';
	}
}
