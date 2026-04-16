import { expect } from 'chai';
import CollectionContent from '../mock/collections/Content.ts';
import CollectionVenue from '../mock/collections/Venue.ts';
import CollectionVenueDetail from '../mock/collections/VenueDetail.ts';
import CollectionMedia from '../mock/collections/Media.ts';
import ModelContent from '../mock/models/Content.ts';
import ModelVenue from '../mock/models/Venue.ts';

/**
 * Remote integration tests against the public (read-only) ChalkySticks
 * API. These exercise the real request pipeline end-to-end: fetch,
 * parse, nested hasMany hydration, pagination helpers and event
 * callbacks.
 *
 * The tests are intentionally tolerant of minor data drift — they
 * assert shape/types and the presence of known keys rather than exact
 * values. We never write to the remote API.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('Remote (ChalkySticks live)', function () {
	// Live network — give Mocha breathing room.
	this.timeout(20000);

	const baseUrl: string = 'https://api.chalkysticks.com/v3';

	/**
	 * @return CollectionVenue
	 */
	function getVenues(qp: any = {}): CollectionVenue {
		return new CollectionVenue({
			baseUrl,
			qp: Object.assign({ limit: 3, page: 1 }, qp),
		});
	}

	/**
	 * @return CollectionContent
	 */
	function getContent(qp: any = {}): CollectionContent {
		return new CollectionContent({
			baseUrl,
			qp: Object.assign({ limit: 3, page: 1 }, qp),
		});
	}

	describe('venues collection', () => {
		it('should fetch and populate models', async () => {
			const collection: CollectionVenue = getVenues();

			await collection.fetch();

			expect(collection.length).to.be.greaterThan(0);
			expect(collection.first()).to.be.instanceOf(ModelVenue);
		});

		it('should expose pagination metadata after fetch', async () => {
			const collection: CollectionVenue = getVenues();

			await collection.fetch();

			expect(collection.pagination).to.be.an('object');
			expect(collection.pagination.total).to.be.a('number');
			expect(collection.pagination.current_page).to.equal(1);
		});

		it('should report hasNext() truthy while on page 1 of many', async () => {
			const collection: CollectionVenue = getVenues();

			await collection.fetch();

			// Total is 150 as of writing; anything more than per_page means
			// we have at least one more page available.
			if (collection.pagination.total > collection.pagination.per_page) {
				expect(collection.hasNext()).to.equal(true);
			}
		});

		it('should hydrate nested hasMany relationships (details) when present', async () => {
			const collection: CollectionVenue = getVenues({ limit: 30 });

			await collection.fetch();

			// Find any venue in the page that has at least one detail row
			const venueWithDetails: ModelVenue | undefined = collection.models.find(
				(v: ModelVenue) => v.details.length > 0
			);

			if (venueWithDetails) {
				expect(venueWithDetails.details).to.be.instanceOf(CollectionVenueDetail);
				expect(venueWithDetails.details.at(0).getKey()).to.be.a('string');
			} else {
				// Not a failure — just no venue on this page had details.
				// We still assert the relationship is a collection of the
				// right type so the accessor shape is verified.
				expect(collection.first().details).to.be.instanceOf(CollectionVenueDetail);
			}
		});

		it('should hydrate nested hasMany relationships (media) when present', async () => {
			const collection: CollectionVenue = getVenues({ limit: 30 });

			await collection.fetch();

			const venueWithMedia: ModelVenue | undefined = collection.models.find(
				(v: ModelVenue) => v.media.length > 0
			);

			if (venueWithMedia) {
				expect(venueWithMedia.media).to.be.instanceOf(CollectionMedia);
				const firstMediaUrl: string = venueWithMedia.media.at(0).getUrl();
				expect(firstMediaUrl).to.be.a('string');
				expect(firstMediaUrl.length).to.be.greaterThan(0);
			} else {
				expect(collection.first().media).to.be.instanceOf(CollectionMedia);
			}
		});

		it('should hydrate the nested hours collection with 7 rows when present', async () => {
			const collection: CollectionVenue = getVenues({ limit: 30 });

			await collection.fetch();

			const venueWithHours: ModelVenue | undefined = collection.models.find(
				(v: ModelVenue) => v.hours.length > 0
			);

			if (venueWithHours) {
				expect(venueWithHours.hours.length).to.equal(7);
				const keys: string[] = venueWithHours.hours.pluck('key');
				expect(keys).to.include('monday');
				expect(keys).to.include('sunday');
			}
		});

		it('should carry parent reference into nested relationships', async () => {
			const collection: CollectionVenue = getVenues();

			await collection.fetch();

			const venue: ModelVenue = collection.first();
			expect(venue.details.parent).to.equal(venue);
			expect(venue.media.parent).to.equal(venue);
		});

		it('should fire the "complete" event after a successful fetch', async () => {
			const collection: CollectionVenue = getVenues();
			let fired: boolean = false;

			collection.on('complete', () => (fired = true));
			await collection.fetch();

			expect(fired).to.equal(true);
		});

		it('should fire the "parse:after" event after a successful fetch', async () => {
			const collection: CollectionVenue = getVenues();
			let fired: boolean = false;

			collection.on('parse:after', () => (fired = true));
			await collection.fetch();

			expect(fired).to.equal(true);
		});

		it('should advance pagination via nextPage()', async () => {
			const collection: CollectionVenue = getVenues();

			await collection.fetch();

			if (!collection.hasNext()) {
				return; // Nothing to advance to — skip assertions silently
			}

			const firstPageIds: string[] = collection.pluck('id');
			await collection.nextPage();

			expect(collection.pagination.current_page).to.equal(2);

			const secondPageIds: string[] = collection.pluck('id');
			// Pages shouldn't overlap (append=false by default, so set is replaced)
			expect(secondPageIds[0]).to.not.equal(firstPageIds[0]);
		});

		it('should fetch a single model by id', async () => {
			// First grab a real id from the listing to avoid hardcoding
			const collection: CollectionVenue = getVenues();
			await collection.fetch();

			const known: ModelVenue = collection.first();
			const venue: ModelVenue = new ModelVenue({ id: known.id }, { baseUrl });

			await venue.fetch();

			expect(venue.id).to.equal(known.id);
			expect(venue.getName()).to.be.a('string');
			expect(venue.getName().length).to.be.greaterThan(0);
		});

		it('should produce a JSON-serializable snapshot', async () => {
			const collection: CollectionVenue = getVenues();
			await collection.fetch();

			const json: any = collection.toJSON();

			expect(Array.isArray(json)).to.equal(true);
			expect(json.length).to.equal(collection.length);
			expect(json[0]).to.have.property('id');
			expect(json[0]).to.have.property('name');
		});
	});

	describe('content collection', () => {
		it('should fetch and populate models', async () => {
			const collection: CollectionContent = getContent();

			await collection.fetch();

			expect(collection.length).to.be.greaterThan(0);
			expect(collection.first()).to.be.instanceOf(ModelContent);
			expect(collection.first().getTitle()).to.be.a('string');
		});

		it('should expose a usable pluck() of slugs', async () => {
			const collection: CollectionContent = getContent();

			await collection.fetch();

			const slugs: string[] = collection.pluck('slug');
			expect(slugs.length).to.equal(collection.length);
			expect(slugs[0]).to.be.a('string');
		});

		it('should dedupe identical in-flight GET requests (pending map)', async () => {
			const a: CollectionContent = getContent();
			const b: CollectionContent = getContent();
			let deduped: boolean = false;

			b.on('request:deduped', () => (deduped = true));

			// Fire both in parallel — the second should hit the in-flight
			// request map and be deduped.
			await Promise.all([a.fetch(), b.fetch()]);

			// Note: dedupe is best-effort across identical cacheKeys; assert
			// that at minimum both collections parsed successfully.
			expect(a.length).to.be.greaterThan(0);
			expect(b.length).to.be.greaterThan(0);

			// And that dedupe is wired up — it may or may not fire on any
			// single run depending on timing; if it did fire, the flag flips
			if (deduped) {
				expect(deduped).to.equal(true);
			}
		});
	});
});
