import Model from './Core';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Model
 * @project RestMC
 */
export default class ModelLeague extends Model {
	/**
	 * @return string
	 */
	public getDark(): string {
		return this.attr('dark') as string;
	}

	/**
	 * @return string
	 */
	public getLight(): string {
		return this.attr('light') as string;
	}
}
