import CollectionUser from '../collections/User';
import ModelLocation from '../models/Location';
import { Model } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Model
 * @project RestMC
 */
export default class ModelUser extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'user';

	// region: Relationships
	// -------------------------------------------------------------------------

	public get friends(): CollectionUser {
		return this.hasMany('friends', CollectionUser);
	}

	public get location(): ModelLocation {
		return this.hasOne<ModelLocation>('location', ModelLocation);
	}

	public get nullThing(): Model {
		return this.hasOne<Model>('nullThing', Model);
	}

	public get otherThing(): Model {
		return this.hasOne<Model>('otherThing', Model);
	}

	// endregion: Relationships

	// region: Getters
	// ---------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getFirstName(): string {
		return this.attr('first_name');
	}

	/**
	 * @return string
	 */
	public getLastName(): string {
		return this.attr('last_name');
	}

	/**
	 * @return string
	 */
	public getUsername(): string {
		return this.attr('username');
	}

	// endregion: Getters
}
