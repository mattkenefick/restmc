import Model from './Core';
import CollectionMedia from '../Collection/Media';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package BasicApi\Model
 * @project RestMC
 */
export default class ModelVenue extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'venues';

	/**
	 * @return CollectionMedia
	 */
	public get media(): CollectionMedia {
		return this.hasMany('media', CollectionMedia);
	}

	/**
	 * @return string
	 */
	public getAddress(): string {
		return this.attr('address') as string;
	}

	/**
	 * @return string
	 */
	public getName(): string {
		return this.attr('name') as string;
	}

	/**
	 * @return string
	 */
	public getWebsite(): string {
		return this.attr('website') as string;
	}
}
