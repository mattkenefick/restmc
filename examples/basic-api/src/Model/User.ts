import Model from './Core';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Model
 * @project RestMC
 */
export default class User extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'user';

	/**
	 * @return string
	 */
	public getUsername(): void {
		return this.attr('username');
	}
}
