import { expect } from 'chai';
import { Collection } from '../../src/index';
import CollectionUser from '../mock/collections/User.ts';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Dispatcher
 * @project RestMC
 */
describe('Collection', () => {
	const userCollection: CollectionUser = new CollectionUser();

	it('should not cache length getter', () => {
		// Not implemented
	});

	it('should absord the endpoint from model', () => {
		expect(userCollection.endpoint).to.equal('user');
	});
});
