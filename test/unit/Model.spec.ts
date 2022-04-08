import { expect } from 'chai';
import CollectionUser from '../mock/collections/User.ts';
import ModelUser from '../mock/models/User.ts';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('Model', () => {
	function getModel(): ModelUser {
		return new ModelUser({ id: '1' }, { baseUrl: 'http://localhost:3000/v1' });
	}

	it('should have an endpoint', async () => {
		const userModel: ModelUser = getModel();

		expect(userModel.endpoint).to.equal('user');
	});

	it('should fetch a model remotely', async () => {
		const userModel: ModelUser = getModel();
		await userModel.fetch();

		expect(userModel.getFirstName()).to.equal('matt');
	});

	it('should have a hasMany relationship', async () => {
		const userModel: ModelUser = getModel();
		await userModel.fetch();

		expect(userModel.friends.length).to.be.greaterThan(0);
		expect(userModel.friends.at(0).getFirstName()).to.equal('john');
	});

	it('should have a hasOne relationship', async () => {
		const userModel: ModelUser = getModel();
		await userModel.fetch();

		expect(userModel.location.getCity()).to.equal('New York');
		expect(userModel.location.getState()).to.equal('NY');
	});
});
