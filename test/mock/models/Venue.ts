import CollectionMedia from '../collections/Media';
import CollectionVenueDetail from '../collections/VenueDetail';
import { Model } from '../../../src/index';

/**
 * Mock model representing a ChalkySticks venue. Used by the remote
 * test suite to exercise hasMany relationships over the live API
 * at https://api.chalkysticks.com/v3/venues.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Mock\Model
 * @project RestMC
 */
export default class ModelVenue extends Model {
	/**
	 * @type string
	 */
	public endpoint: string = 'venues';

	// region: Relationships
	// -------------------------------------------------------------------------

	/**
	 * Nested media collection, e.g. images attached to the venue.
	 *
	 * @return CollectionMedia
	 */
	public get media(): CollectionMedia {
		return this.hasMany('media', CollectionMedia);
	}

	/**
	 * Nested detail rows (keyed attributes like price_level, google-rating).
	 *
	 * @return CollectionVenueDetail
	 */
	public get details(): CollectionVenueDetail {
		return this.hasMany('details', CollectionVenueDetail);
	}

	/**
	 * Nested hours rows (same shape as details but under hours key).
	 *
	 * @return CollectionVenueDetail
	 */
	public get hours(): CollectionVenueDetail {
		return this.hasMany('hours', CollectionVenueDetail);
	}

	// endregion: Relationships

	// region: Getters
	// -------------------------------------------------------------------------

	/**
	 * @return string
	 */
	public getName(): string {
		return this.attr('name') as string;
	}

	/**
	 * @return string
	 */
	public getSlug(): string {
		return this.attr('slug') as string;
	}

	/**
	 * @return string
	 */
	public getCity(): string {
		return this.attr('city') as string;
	}

	// endregion: Getters
}
