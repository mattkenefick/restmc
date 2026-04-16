import { expect } from 'chai';
import CollectionUser from '../mock/collections/User.ts';
import ModelUser from '../mock/models/User.ts';

/**
 * Pure (no remote server) tests for Collection behavior. Exercises
 * hydration, mutation, sorting, pagination helpers and the iterator
 * protocol without depending on the mock Express server.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('Collection.Features', () => {
	const roster: any = [
		{ first_name: 'ashley', id: 1, score: 50 },
		{ first_name: 'briana', id: 2, score: 20 },
		{ first_name: 'charlotte', id: 3, score: 30 },
		{ first_name: 'danielle', id: 4, score: 40 },
	];

	/**
	 * @return CollectionUser
	 */
	function hydrate(): CollectionUser {
		return CollectionUser.hydrate(roster, {
			meta: {
				pagination: {
					count: 4,
					current_page: 2,
					per_page: 2,
					total: 10,
					total_pages: 5,
				},
			},
		}) as CollectionUser;
	}

	describe('hydrate()', () => {
		it('should populate models and pagination in one call', () => {
			const collection: CollectionUser = hydrate();

			expect(collection.length).to.equal(4);
			expect(collection.pagination.total).to.equal(10);
			expect(collection.pagination.current_page).to.equal(2);
		});
	});

	describe('add / push / unshift / prepend', () => {
		it('should add a plain object and wrap it in the declared model type', () => {
			const collection: CollectionUser = new CollectionUser();

			collection.add({ id: 1, first_name: 'matt' });

			expect(collection.length).to.equal(1);
			expect(collection.at(0)).to.be.instanceOf(ModelUser);
			expect(collection.at(0).getFirstName()).to.equal('matt');
		});

		it('should unshift to the start of the list', () => {
			const collection: CollectionUser = hydrate();

			collection.unshift({ id: 99, first_name: 'zeus' });

			expect(collection.at(0).attr('first_name')).to.equal('zeus');
			expect(collection.length).to.equal(5);
		});

		it('should push via push()', () => {
			const collection: CollectionUser = new CollectionUser();

			collection.push({ id: 1, first_name: 'matt' });
			collection.push({ id: 2, first_name: 'john' });

			expect(collection.length).to.equal(2);
			expect(collection.at(1).getFirstName()).to.equal('john');
		});

		it('should dispatch an "add" event', () => {
			const collection: CollectionUser = new CollectionUser();
			let fired: boolean = false;

			collection.on('add', () => (fired = true));
			collection.add({ id: 1 });

			expect(fired).to.equal(true);
		});
	});

	describe('remove / pop / shift / clear / reset', () => {
		it('should pop the last item', () => {
			const collection: CollectionUser = hydrate();

			collection.pop();

			expect(collection.length).to.equal(3);
			expect(collection.last().attr('first_name')).to.equal('charlotte');
		});

		it('should shift the first item', () => {
			const collection: CollectionUser = hydrate();

			collection.shift();

			expect(collection.length).to.equal(3);
			expect(collection.first().attr('first_name')).to.equal('briana');
		});

		it('should clear all models', () => {
			const collection: CollectionUser = hydrate();

			collection.clear();

			expect(collection.length).to.equal(0);
		});

		it('should remove a single model instance', () => {
			const collection: CollectionUser = hydrate();
			const target: ModelUser = collection.at(1);

			collection.remove(target);

			expect(collection.length).to.equal(3);
			expect(collection.has(target)).to.equal(false);
		});

		it('should remove an array of model instances', () => {
			const collection: CollectionUser = hydrate();

			collection.remove([collection.at(0), collection.at(2)]);

			expect(collection.length).to.equal(2);
		});
	});

	describe('mutation helpers', () => {
		it('should reverse the order of models', () => {
			const collection: CollectionUser = hydrate();

			collection.reverse();

			expect(collection.at(0).attr('first_name')).to.equal('danielle');
			expect(collection.last().attr('first_name')).to.equal('ashley');
		});

		it('should return a slice of models without mutating the source', () => {
			const collection: CollectionUser = hydrate();

			const subset: ModelUser[] = collection.slice(1, 3);

			expect(subset.length).to.equal(2);
			expect(collection.length).to.equal(4);
		});

		it('should filter duplicates from unique()', () => {
			const collection: CollectionUser = new CollectionUser();
			const user: ModelUser = new ModelUser({ id: 1 });

			collection.add(user);
			(collection.models as any).push(user);
			expect(collection.length).to.equal(2);

			collection.unique();

			expect(collection.length).to.equal(1);
		});

		it('should sort ascending by key', () => {
			const collection: CollectionUser = hydrate();

			collection.sort({ key: 'score' });

			expect(collection.at(0).attr('score')).to.equal(20);
			expect(collection.last().attr('score')).to.equal(50);
		});

		it('should sort descending when reverse=true', () => {
			const collection: CollectionUser = hydrate();

			collection.sort({ key: 'score', reverse: true });

			expect(collection.at(0).attr('score')).to.equal(50);
			expect(collection.last().attr('score')).to.equal(20);
		});

		it('should sort strings alphabetically via localeCompare', () => {
			const collection: CollectionUser = hydrate();

			collection.sort({ key: 'first_name' });

			expect(collection.pluck('first_name')).to.eql([
				'ashley',
				'briana',
				'charlotte',
				'danielle',
			]);
		});

		it('should sort strings case-insensitively', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ first_name: 'banana', id: 1 },
				{ first_name: 'Apple', id: 2 },
				{ first_name: 'cherry', id: 3 },
			]) as CollectionUser;

			collection.sort({ key: 'first_name' });

			expect(collection.pluck('first_name')).to.eql(['Apple', 'banana', 'cherry']);
		});

		it('should sort strings in reverse', () => {
			const collection: CollectionUser = hydrate();

			collection.sort({ key: 'first_name', reverse: true });

			expect(collection.at(0).attr('first_name')).to.equal('danielle');
			expect(collection.last().attr('first_name')).to.equal('ashley');
		});

		it('should sort ISO date strings chronologically', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ created_at: '2026-03-10', id: 1 },
				{ created_at: '2026-01-02', id: 2 },
				{ created_at: '2026-02-28', id: 3 },
			]) as CollectionUser;

			collection.sort({ key: 'created_at' });

			expect(collection.pluck('created_at')).to.eql([
				'2026-01-02',
				'2026-02-28',
				'2026-03-10',
			]);
		});

		it('should sort ISO datetime strings chronologically', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ created_at: '2026-04-16 02:10:13', id: 1 },
				{ created_at: '2026-04-15 23:48:24', id: 2 },
				{ created_at: '2026-04-16 01:00:00', id: 3 },
			]) as CollectionUser;

			collection.sort({ key: 'created_at' });

			const firstIds: any[] = collection.pluck('id');
			expect(firstIds).to.eql([2, 3, 1]);
		});

		it('should sort Date instances chronologically', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ at: new Date('2026-03-10T00:00:00Z'), id: 1 },
				{ at: new Date('2026-01-02T00:00:00Z'), id: 2 },
				{ at: new Date('2026-02-28T00:00:00Z'), id: 3 },
			]) as CollectionUser;

			collection.sort({ key: 'at' });

			expect(collection.pluck('id')).to.eql([2, 3, 1]);
		});

		it('should sort booleans with false before true', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ active: true, id: 1 },
				{ active: false, id: 2 },
				{ active: true, id: 3 },
				{ active: false, id: 4 },
			]) as CollectionUser;

			collection.sort({ key: 'active' });

			expect(collection.at(0).attr('active')).to.equal(false);
			expect(collection.last().attr('active')).to.equal(true);
		});

		it('should pin nullish values to the end in ascending sort', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ id: 1, score: 50 },
				{ id: 2, score: null },
				{ id: 3, score: 20 },
				{ id: 4, score: undefined },
				{ id: 5, score: 30 },
			]) as CollectionUser;

			collection.sort({ key: 'score' });

			// First three should be sorted scores ascending; last two nullish
			expect(collection.at(0).attr('score')).to.equal(20);
			expect(collection.at(1).attr('score')).to.equal(30);
			expect(collection.at(2).attr('score')).to.equal(50);
			expect(collection.at(3).attr('score') == null).to.equal(true);
			expect(collection.at(4).attr('score') == null).to.equal(true);
		});

		it('should keep nullish values pinned to the end even under reverse', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ id: 1, score: 50 },
				{ id: 2, score: null },
				{ id: 3, score: 20 },
			]) as CollectionUser;

			collection.sort({ key: 'score', reverse: true });

			expect(collection.at(0).attr('score')).to.equal(50);
			expect(collection.at(1).attr('score')).to.equal(20);
			expect(collection.at(2).attr('score')).to.equal(null);
		});

		it('should treat empty strings as nullish and pin them to the end', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ first_name: 'banana', id: 1 },
				{ first_name: '', id: 2 },
				{ first_name: 'apple', id: 3 },
			]) as CollectionUser;

			collection.sort({ key: 'first_name' });

			expect(collection.at(0).attr('first_name')).to.equal('apple');
			expect(collection.at(1).attr('first_name')).to.equal('banana');
			expect(collection.at(2).attr('first_name')).to.equal('');
		});

		it('should fall back to sortKey when no options are passed', () => {
			const collection: CollectionUser = CollectionUser.hydrate([
				{ id: 3 },
				{ id: 1 },
				{ id: 2 },
			]) as CollectionUser;

			collection.sort();

			expect(collection.pluck('id')).to.eql([1, 2, 3]);
		});
	});

	describe('lookup & query', () => {
		it('should pluck an attribute across models', () => {
			const collection: CollectionUser = hydrate();

			const names: string[] = collection.pluck('first_name');

			expect(names).to.eql(['ashley', 'briana', 'charlotte', 'danielle']);
		});

		it('should get(id) a specific model', () => {
			const collection: CollectionUser = hydrate();

			const model: any = collection.get(3);

			expect(model).to.not.be.undefined;
			expect(model.attr('first_name')).to.equal('charlotte');
		});

		it('should has() a model looked up by primitive id', () => {
			const collection: CollectionUser = hydrate();

			expect(collection.has(3)).to.equal(true);
			expect(collection.has(99)).to.equal(false);
		});

		it('should support negative indexes in at()', () => {
			const collection: CollectionUser = hydrate();

			expect(collection.at(-1).attr('first_name')).to.equal('danielle');
			expect(collection.at(-2).attr('first_name')).to.equal('charlotte');
		});

		it('should indexOf a model it contains and return -1 otherwise', () => {
			const collection: CollectionUser = hydrate();

			expect(collection.indexOf(collection.at(2))).to.equal(2);
			expect(collection.indexOf(new ModelUser())).to.equal(-1);
		});
	});

	describe('iteration', () => {
		it('should support for..of via Symbol.iterator', () => {
			const collection: CollectionUser = hydrate();
			const names: string[] = [];

			for (const model of collection) {
				names.push(model.attr('first_name') as string);
			}

			expect(names.length).to.equal(4);
			expect(names[0]).to.equal('ashley');
		});

		it('should expose each() as a simple forEach over models', () => {
			const collection: CollectionUser = hydrate();
			const names: string[] = [];

			collection.each((model: ModelUser) => names.push(model.attr('first_name') as string));

			expect(names.length).to.equal(4);
		});

		it('should map models through Array.prototype.map semantics', () => {
			const collection: CollectionUser = hydrate();

			const ids: any[] = collection.map((model: ModelUser) => model.id);

			expect(ids).to.eql(['1', '2', '3', '4']);
		});

		it('should resetIterator() so next() starts again from the first model', () => {
			const collection: CollectionUser = hydrate();

			collection.next();
			collection.next();
			collection.resetIterator();

			expect(collection.next()?.attr('first_name')).to.equal('ashley');
		});
	});

	describe('pagination helpers', () => {
		it('should report hasNext when current_page < total_pages', () => {
			const collection: CollectionUser = hydrate();

			expect(collection.hasNext()).to.equal(true);
		});

		it('should report hasPrevious when current_page > 1', () => {
			const collection: CollectionUser = hydrate();

			expect(collection.hasPrevious()).to.equal(true);
		});

		it('should report !hasNext on the last page', () => {
			const collection: CollectionUser = CollectionUser.hydrate([], {
				meta: {
					pagination: {
						count: 0,
						current_page: 5,
						per_page: 2,
						total: 10,
						total_pages: 5,
					},
				},
			}) as CollectionUser;

			expect(collection.hasNext()).to.equal(false);
		});

		it('should report !hasPrevious on the first page', () => {
			const collection: CollectionUser = CollectionUser.hydrate([], {
				meta: {
					pagination: {
						count: 0,
						current_page: 1,
						per_page: 2,
						total: 10,
						total_pages: 5,
					},
				},
			}) as CollectionUser;

			expect(collection.hasPrevious()).to.equal(false);
		});

		it('should resolve nextPage() to null when no next page exists', async () => {
			const collection: CollectionUser = CollectionUser.hydrate([], {
				meta: {
					pagination: {
						count: 0,
						current_page: 5,
						per_page: 2,
						total: 10,
						total_pages: 5,
					},
				},
			}) as CollectionUser;

			const result = await collection.nextPage();

			expect(result).to.equal(null);
		});

		it('should resolve previousPage() to null when on page 1', async () => {
			const collection: CollectionUser = CollectionUser.hydrate([], {
				meta: {
					pagination: {
						count: 0,
						current_page: 1,
						per_page: 2,
						total: 10,
						total_pages: 5,
					},
				},
			}) as CollectionUser;

			const result = await collection.previousPage();

			expect(result).to.equal(null);
		});
	});

	describe('toJSON()', () => {
		it('should return an array of plain attribute objects', () => {
			const collection: CollectionUser = hydrate();

			const json: any = collection.toJSON();

			expect(Array.isArray(json)).to.equal(true);
			expect(json.length).to.equal(4);
			expect(json[0].first_name).to.equal('ashley');
		});

		it('should work with JSON.stringify natively', () => {
			const collection: CollectionUser = hydrate();

			const serialized: string = JSON.stringify(collection);
			const parsed: any = JSON.parse(serialized);

			expect(Array.isArray(parsed)).to.equal(true);
			expect(parsed.length).to.equal(4);
		});
	});

	describe('clone()', () => {
		it('should produce a separate instance with equivalent data', () => {
			const collection: CollectionUser = hydrate();

			const clone: any = collection.clone();

			expect(clone).to.not.equal(collection);
			expect(clone.length).to.equal(collection.length);
			expect(clone.at(0).attr('first_name')).to.equal('ashley');
		});
	});

	describe('atRelationship', () => {
		it('should dive into a nested path when at() is called', () => {
			const collection: CollectionUser = new CollectionUser({ atRelationship: ['location'] });

			collection.add({ id: 1, location: { city: 'NY' } });

			const nested: any = collection.at(0);

			expect(nested.getCity()).to.equal('NY');
		});
	});
});
