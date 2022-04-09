import Model from './Core';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Model
 * @project RestMC
 */
export default class ModelUser extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'user';

	/**
	 * @return string
	 */
	public getUsername(): string {
		return this.attr('username') as string;
	}
}
