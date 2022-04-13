import { expect } from 'chai';
import { Collection } from '../../src/index';
import { configureServer } from '../mock/server/test';
import CollectionUser from '../mock/collections/User.ts';
import ModelUser from '../mock/models/User.ts';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Dispatcher
 * @project RestMC
 */
describe('Collection', () => {
	configureServer(before, after);

	function getCollection(options: any = {}): CollectionUser {
		return new CollectionUser(Object.assign(options, { baseUrl: 'http://localhost:3000/v1' }));
	}

	it('should absord the endpoint from model', () => {
		const userCollection: CollectionUser = getCollection();

		expect(userCollection.getEndpoint()).to.equal('user');
	});

	it('should use explicitly defined endpoint', () => {
		const userCollection: CollectionUser = getCollection({ endpoint: 'custom-endpoint' });

		expect(userCollection.getEndpoint()).to.equal('custom-endpoint');
	});

	it('should have withCredentials', () => {
		const userCollection: CollectionUser = getCollection();

		expect(userCollection.options.withCredentials).to.equal(true);
	});

	it('should not have withCredentials', () => {
		const userCollection: CollectionUser = getCollection({ withCredentials: false });

		expect(userCollection.options.withCredentials).to.equal(false);
	});

	it('should correctly handle empty firstWhere', async () => {
		const userCollection: CollectionUser = getCollection();
		const model: ModelUser = userCollection.findWhere({ foo: 'bar' });

		expect(model).to.equal(undefined);
	});

	it('should correctly handle empty where', async () => {
		const userCollection: CollectionUser = getCollection();
		const collection: CollectionUser = userCollection.where({ foo: 'bar' });

		expect(collection instanceof CollectionUser).to.equal(true);
		expect(collection.length).to.equal(0);
	});

	it('should correctly handle empty firstWhere', async () => {
		const userCollection: CollectionUser = getCollection();
		const model: ModelUser = userCollection.findWhere({ foo: 'bar' });

		expect(model).to.equal(undefined);
	});

	it('should fetch data and have 3 models', async () => {
		const userCollection: CollectionUser = getCollection();

		await userCollection.fetch();

		expect(userCollection.length).to.equal(3);
	});

	it('should be filterable (no results)', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		const models: ModelUser[] = userCollection.filter((userModel: typeof ModelUser) => userModel.id === 10);

		expect(models.length).to.equal(0);
	});

	it('should be filterable (one result)', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();
		const models: ModelUser[] = userCollection.filter((userModel: typeof ModelUser) => userModel.id == 1);
		expect(models.length).to.equal(1);
	});

	it('should be filterable (two results)', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		const models: ModelUser[] = userCollection.filter((userModel: typeof ModelUser) => userModel.id <= 2);

		expect(models.length).to.equal(2);
	});

	it('should not cache length getter', async () => {
		const userCollection: CollectionUser = getCollection();

		expect(userCollection.length).to.equal(0);
		await userCollection.fetch();
		expect(userCollection.length).to.equal(3);
	});

	it('should produce a JSON object', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		const json: object = userCollection.toJSON();

		expect(typeof json).to.equal('object');
		expect(json.length).to.be.greaterThan(0);
		expect(json[0].first_name).to.equal('matt');
	});

	it('should clear all models', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		expect(userCollection.length).to.be.greaterThan(0);
		userCollection.clear();

		expect(userCollection.length).to.equal(0);
	});

	it('should have a count() of 3', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		expect(userCollection.count()).to.equal(3);
	});

	it('should pop() an item from the end and have 2 left', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		expect(userCollection.count()).to.equal(3);
		userCollection.pop();
		expect(userCollection.count()).to.equal(2);
	});

	it('should shift() an item from the front and have 2 left', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		expect(userCollection.count()).to.equal(3);
		userCollection.shift();
		expect(userCollection.count()).to.equal(2);
	});

	it('should check if it has() a model', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();

		const model: ModelUser = userCollection.at(0);

		expect(userCollection.has(model)).to.equal(true);
	});

	it('should check if at() works', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();
		const model: ModelUser = userCollection.at(0);

		expect(model?.id).to.equal('1');
	});

	it('should check if first() works', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();
		const model: ModelUser = userCollection.first();

		expect(model?.id).to.equal('1');
	});

	it('should check if last() works', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();
		const model: ModelUser = userCollection.last();

		expect(model?.id).to.equal('3');
	});

	it('should check if current(), next(), previous() works', async () => {
		const userCollection: CollectionUser = getCollection();
		await userCollection.fetch();
		let model: ModelUser;

		model = userCollection.current();
		expect(model?.id).to.equal('1');

		model = userCollection.next();
		expect(model?.id).to.equal('2');

		model = userCollection.next();
		expect(model?.id).to.equal('3');

		model = userCollection.next();
		expect(model?.id).to.equal(undefined);

		model = userCollection.previous();
		expect(model?.id).to.equal('2');

		model = userCollection.previous();
		expect(model?.id).to.equal('1');

		model = userCollection.previous();
		expect(model?.id).to.equal(undefined);

		model = userCollection.current();
		expect(model?.id).to.equal('1');

		model = userCollection.next();
		expect(model?.id).to.equal('2');
	});
});
