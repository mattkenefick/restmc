import { expect } from 'chai';
import FilmModel from '../mock/models/FilmModel';
import FilmCollection from '../mock/collections/FilmCollection';
import { ActiveRecord, Collection, Model } from '../../src/index';

// -----------------------------------------------------------------------------

const items: any = [
	{
		name: 'Ashley',
		x: 1,
	},
	{
		name: 'Briana',
		x: 2,
	},
	{
		name: 'Charlotte',
		x: 3,
	},
	{
		name: 'Danielle',
		x: 4,
	},
	{
		name: 'Elizabeth',
		x: 5,
	},
	{
		name: 'Fallon',
		x: 6,
	},
];

const options = {
	meta: {
		pagination: {
			count: 15,
			current_page: 1,
			per_page: 15,
			total: 1938,
			total_pages: 130,
		},
	},
};

// -----------------------------------------------------------------------------

/**
 * Specific Collection Tests
 */
describe('Specific Collection Tests', () => {
	it('should hydrate with models by object', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		// Get attribute
		const resultA: number = collection.length;
		const resultB: FilmModel = <FilmModel>collection.at(0);

		expect(resultA).to.be.greaterThan(3);
		expect(resultB.cid[0]).to.equal('c');
	});

	it('should have metadata', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		expect(collection.pagination).to.be.a('object');
		expect(collection.pagination.count).to.equal(15);
	});

	it('should remove model on shift', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		collection.shift();

		expect(collection.length).to.equal(5);
		expect(collection.at(0).attr('name')).to.equal('Briana');
	});

	it('should remove model on multiple shifts', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		collection.shift();
		collection.shift();
		collection.shift();

		expect(collection.length).to.equal(3);
		expect(collection.at(0).attr('name')).to.equal('Danielle');
	});

	it('should remove model by specific item', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);
		const model: Model = collection.at(3);

		collection.remove(model);

		expect(collection.length).to.equal(5);
		expect(collection.at(3).attr('name')).to.equal('Elizabeth');
	});

	it('should remove set of models by specific items', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);
		const itemz: Model[] = [collection.at(2), collection.at(4)];

		collection.remove(itemz);

		expect(collection.length).to.equal(4);
		expect(collection.at(2).attr('name')).to.equal('Danielle');
		expect(collection.at(3).attr('name')).to.equal('Fallon');
	});

	it('should retrieve first item', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);
		const model: Model = collection.first();

		expect(model.attr('name')).to.equal('Ashley');
	});

	it('should retrieve last item', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);
		const model: Model = collection.last();

		expect(model.attr('name')).to.equal('Fallon');
	});

	it('should sort regular by key', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		// sort
		collection.sort({ key: 'x' });

		expect(collection.at(0).attr('name')).to.equal('Ashley');
	});

	it('should sort reverse by key', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		// sort
		collection.sort({
			key: 'x',
			reverse: true,
		});

		expect(collection.at(0).attr('name')).to.equal('Fallon');
	});

	it('should clone object, but have different instances', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);
		const newCollection: FilmCollection = collection.clone();

		expect(collection.length).to.equal(newCollection.length);
		expect(collection.at(0).attr('name')).to.equal(newCollection.at(0).attr('name'));
		expect(collection.at(0).cid).to.not.be.equal(collection.at(1).cid);
	});

	it('should pluck name attributes', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);
		let plucked = collection.pluck('name');

		expect(plucked[2]).to.equal('Charlotte');
	});

	it('should find first item', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		// sort
		const model: FilmModel = collection.findWhere({ name: 'Danielle' });

		expect(model.attr('name')).to.equal('Danielle');
	});

	it('should find items by where', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		// sort
		const newCollection: FilmCollection = collection.where({ name: 'Danielle' }).where({ x: 4 });

		expect(newCollection.at(0).attr('name')).to.equal('Danielle');
	});

	it('should find items by firstWhere', () => {
		const collection: FilmCollection = FilmCollection.hydrate(items, options);

		// sort
		const model: FilmModel = collection.findWhere({ name: 'Danielle' });

		expect(model.attr('name')).to.equal('Danielle');
	});
});
