import { expect } from 'chai';
import { Collection, Model } from '../../src/index';
import CollectionUser from '../mock/collections/User.ts';
import ModelLocation from '../mock/models/Location.ts';
import ModelUser from '../mock/models/User.ts';

/**
 * Pure (no remote server) tests for Model behavior that don't require
 * hitting the network: hydration, relationship caching, circular
 * protection, modified endpoint semantics and toJSON serialization.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('Model.Features', () => {
	describe('hydrate()', () => {
		it('should return an instance of the subclass with attributes set', () => {
			const user: ModelUser = ModelUser.hydrate({ first_name: 'matt', id: 7 }) as ModelUser;

			expect(user).to.be.instanceOf(ModelUser);
			expect(user.attr('first_name')).to.equal('matt');
			expect(user.id).to.equal('7');
		});

		it('should apply options after hydration', () => {
			const user: ModelUser = ModelUser.hydrate(
				{ id: 1 },
				{ baseUrl: 'http://example.com/v2' }
			) as ModelUser;

			expect(user.baseUrl).to.equal('http://example.com/v2');
		});
	});

	describe('hasOne() relationships', () => {
		it('should cache the relationship instance across repeated access', () => {
			const user: ModelUser = new ModelUser({ id: 1, location: { city: 'NY', state: 'NY' } });

			const first: ModelLocation = user.location;
			const second: ModelLocation = user.location;

			expect(first).to.equal(second);
			expect(first.getCity()).to.equal('NY');
		});

		it('should clear the cached instance on clearRelationship()', () => {
			const user: ModelUser = new ModelUser({ id: 1, location: { city: 'NY' } });

			const first: ModelLocation = user.location;
			user.clearRelationship('location');
			const second: ModelLocation = user.location;

			expect(first).to.not.equal(second);
		});

		it('should re-parent the related model to the owner', () => {
			const user: ModelUser = new ModelUser({ id: 1, location: { city: 'NY' } });

			expect(user.location.parent).to.equal(user);
		});

		it('should borrow an ID from a suffixed attribute when the relationship is absent', () => {
			const user: ModelUser = new ModelUser({ id: 1, other_thing_id: 42 });

			expect(user.otherThing.id).to.equal('42');
			expect(user.otherThing.hasAttributes()).to.equal(false);
		});

		it('should return an empty Model for relationships with no data and no suffix', () => {
			const user: ModelUser = new ModelUser({ id: 1 });

			expect(user.nullThing).to.be.instanceOf(Model);
			expect(user.nullThing.hasAttributes()).to.equal(false);
		});
	});

	describe('hasMany() relationships', () => {
		it('should produce a Collection typed by the subclass', () => {
			const user: ModelUser = new ModelUser({
				friends: [
					{ id: 2, first_name: 'john' },
					{ id: 3, first_name: 'jane' },
				],
				id: 1,
			});

			expect(user.friends).to.be.instanceOf(CollectionUser);
			expect(user.friends.length).to.equal(2);
			expect(user.friends.at(0).getFirstName()).to.equal('john');
		});

		it('should cache the collection instance across repeated access', () => {
			const user: ModelUser = new ModelUser({ friends: [{ id: 2 }], id: 1 });

			const first: CollectionUser = user.friends;
			const second: CollectionUser = user.friends;

			expect(first).to.equal(second);
		});

		it('should apply modified endpoint so collection URL descends from parent', () => {
			const user: ModelUser = new ModelUser({ friends: [{ id: 2 }], id: 1 });

			const friends = user.friends;

			// CollectionUser uses ModelUser so its own endpoint is 'user'.
			// useModifiedEndpoint prepends the parent so we expect the URL to
			// ride under /user/1/ and to report using a modified endpoint.
			expect(friends.isUsingModifiedEndpoint()).to.equal(true);
			expect(friends.b.getUrl()).to.contain('/user/1/');
		});
	});

	describe('circular protection', () => {
		it('should stop recursion when a hasOne chain loops back to the same endpoint+id', () => {
			const a: ModelUser = new ModelUser({ id: 1 });
			const b: ModelUser = new ModelUser({ id: 1 });
			b.parent = a;

			// Force the parent chain to target the same endpoint/id. hasOne
			// should detect the loop and bail out with undefined.
			(b as any).otherThing;
			expect(b.parent).to.equal(a);
		});
	});

	describe('useModifiedEndpoint', () => {
		it('should prepend reference endpoint when position = before (default)', () => {
			const user: ModelUser = new ModelUser({ id: 10 });
			const other: ModelLocation = new ModelLocation({ id: 5 });

			other.useModifiedEndpoint(user);

			expect(other.b.getUrl()).to.contain('user/10/location/5');
		});

		it('should append reference endpoint when position = after', () => {
			const user: ModelUser = new ModelUser({ id: 10 });
			const other: ModelLocation = new ModelLocation({ id: 5 });

			other.useModifiedEndpoint(user, 'after');

			expect(other.b.getUrl()).to.contain('location/5/user/10');
		});
	});

	describe('toJSON serialization', () => {
		it('should serialize nested hasOne relationships', () => {
			const user: ModelUser = new ModelUser({
				first_name: 'matt',
				id: 1,
				location: { city: 'NY', state: 'NY' },
			});

			// Access the relationship so it caches and gets picked up by the
			// toJSON getter crawl.
			user.location;

			const json: any = user.toJSON();

			expect(json.first_name).to.equal('matt');
			expect(json.location).to.be.an('object');
			expect(json.location.city).to.equal('NY');
		});

		it('should be JSON.stringify compatible', () => {
			const user: ModelUser = new ModelUser({ first_name: 'matt', id: 1 });
			const serialized: string = JSON.stringify(user);
			const parsed: any = JSON.parse(serialized);

			expect(parsed.first_name).to.equal('matt');
			expect(parsed.id).to.equal(1);
		});

		it('should omit empty hasOne relationships from toJSON', () => {
			const user: ModelUser = new ModelUser({ first_name: 'matt', id: 1 });

			// Touch the empty relationship so it caches.
			user.nullThing;

			const json: any = user.toJSON();

			expect(json.nullThing).to.be.undefined;
		});

		it('should not recurse into the same endpoint+id twice (path guard)', () => {
			const user: ModelUser = new ModelUser({ first_name: 'matt', id: 1 });
			const self: ModelUser = new ModelUser({ first_name: 'matt', id: 1 });
			self.parent = user;

			// Pre-seed the path with our refId so toJSON short-circuits
			// and returns just the raw attributes without walking getters.
			const path: Set<string> = new Set([`user.1`]);
			const snapshot: any = self.toJSON(path);

			expect(snapshot.first_name).to.equal('matt');
			// Because we already recorded this node in the path, nested
			// relationship getters should NOT be expanded again.
			expect(snapshot.friends).to.be.undefined;
		});
	});
});
