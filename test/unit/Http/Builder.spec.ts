import { expect } from 'chai';
import ModelUser from '../../mock/models/User.ts';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Http
 * @project RestMC
 */
describe('Http/Builder', () => {
	/**
	 * @return ModelUser
	 */
	function getUser(attributes: any = {}, options: any = {}): ModelUser {
		return new ModelUser(attributes, options);
	}

	it('should have an id of 1', async () => {
		const model: ModelUser = new getUser({ id: 1 });

		expect(model.b.id).to.equal('1');
	});

	it('should have an endpoint of /v1/user/1', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		const url: string = model.b.getUrl();

		expect(url).to.equal('/v1/user/1');
	});

	it('should have an base url of /v1', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		const url: string = model.b.getBaseUrl();

		expect(url).to.equal('/v1');
	});

	it('should have an endpoint of user', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		const endpoint: string = model.b.getEndpoint();

		expect(endpoint).to.equal('user');
	});

	// Do modified endpoints

	it('should not have query params', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		const queryParams: string = model.b.getQueryParamsAsString();

		expect(queryParams).to.equal('');
	});

	it('should have a query param', async () => {
		const model: ModelUser = new getUser({ id: 1 }, { qp: { sort: 'desc' } });
		const queryParams: string = model.b.getQueryParamsAsString();

		expect(queryParams).to.equal('sort=desc');
	});

	it('should have multiple sorted params', async () => {
		const model: ModelUser = new getUser({ id: 1 }, { qp: { sort: 'desc' } });
		model.setQueryParam('page', 1);
		model.setQueryParam('limit', 15);

		const queryParams: string = model.b.getQueryParamsAsString();

		expect(queryParams).to.equal('limit=15&page=1&sort=desc');
	});

	it('should can add a query param to builder', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		model.b.queryParam('limit', 15);

		expect(model.b.queryParams.limit).to.equal(15);
	});

	it('should can add a query param (qp) to builder', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		model.b.qp('limit', 15);

		expect(model.b.queryParams.limit).to.equal(15);
	});

	it('should can add a include', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		model.b.include('friends');

		expect(model.b.includes[0]).to.equal('friends');
	});

	it('should have includes on url', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		model.b.include('friends');

		const url: string = model.b.getUrl();

		expect(url).to.equal('/v1/user/1?include=friends');
	});

	it('should have includes on url under `relationships`', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		model.b.includeKey = 'relationships';
		model.b.include('friends');

		const url: string = model.b.getUrl();

		expect(url).to.equal('/v1/user/1?relationships=friends');
	});

	it('should have multiple includes on url', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		model.b.include('friends');
		model.b.include('media');

		const url: string = model.b.getUrl();

		expect(url).to.equal('/v1/user/1?include=friends,media');
	});

	it('should have multiple includes on url delimited by +', async () => {
		const model: ModelUser = new getUser({ id: 1 });
		model.b.includeJoinBy = '+';
		model.b.include('friends');
		model.b.include('media');

		const url: string = model.b.getUrl();

		expect(url).to.equal('/v1/user/1?include=friends+media');
	});
});
