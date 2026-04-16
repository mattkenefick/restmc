import { expect } from 'chai';
import ModelUser from '../../mock/models/User.ts';
import ModelLocation from '../../mock/models/Location.ts';

/**
 * Additional coverage for Http/Builder. Focused on URL construction
 * edge cases, query param removal, alphabetical ordering and modified
 * endpoint behavior.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Http
 * @project RestMC
 */
describe('Http/Builder.Features', () => {
	it('should omit query params whose value is empty string', () => {
		const model: ModelUser = new ModelUser({ id: 1 }, { qp: { foo: 'bar', empty: '' } });

		expect(model.b.getQueryParamsAsString()).to.equal('foo=bar');
	});

	it('should URL-encode query param values', () => {
		const model: ModelUser = new ModelUser({ id: 1 }, { qp: { q: 'hello world & more' } });

		expect(model.b.getQueryParamsAsString()).to.contain('q=hello%20world');
		expect(model.b.getQueryParamsAsString()).to.contain('%26');
	});

	it('should sort query params alphabetically', () => {
		const model: ModelUser = new ModelUser({ id: 1 });

		model.setQueryParams({ zed: 'z', alpha: 'a', middle: 'm' });

		expect(model.b.getQueryParamsAsString()).to.equal('alpha=a&middle=m&zed=z');
	});

	it('should build a modified endpoint URL with position=before', () => {
		const user: ModelUser = new ModelUser({ id: 10 });
		const location: ModelLocation = new ModelLocation({ id: 5 });

		location.useModifiedEndpoint(user);

		expect(location.b.getUrl()).to.equal('/v1/user/10/location/5');
	});

	it('should build a modified endpoint URL with position=after', () => {
		const user: ModelUser = new ModelUser({ id: 10 });
		const location: ModelLocation = new ModelLocation({ id: 5 });

		location.useModifiedEndpoint(user, 'after');

		expect(location.b.getUrl()).to.equal('/v1/location/5/user/10');
	});

	it('should include both includes and regular query params', () => {
		const model: ModelUser = new ModelUser({ id: 1 });
		model.b.include('friends').include('media');
		model.setQueryParam('limit', '15');

		const url: string = model.b.getUrl();

		expect(url).to.contain('limit=15');
		expect(url).to.contain('include=friends,media');
	});

	it('should reflect identifier() setter on the builder', () => {
		const model: ModelUser = new ModelUser();

		model.b.identifier(77);

		expect(model.b.id).to.equal('77');
		expect(model.b.getUrl()).to.equal('/v1/user/77');
	});

	it('should return empty string for an unset query param via getQueryParam', () => {
		const model: ModelUser = new ModelUser();

		expect(model.b.getQueryParam('missing')).to.equal('');
	});

	it('should chain queryParam/qp fluently', () => {
		const model: ModelUser = new ModelUser();

		model.b.queryParam('a', 1).qp('b', 2).queryParam('c', 3);

		expect(model.b.queryParams).to.eql({ a: 1, b: 2, c: 3 });
	});

	it('should include the model endpoint in the URL when no identifier is set', () => {
		const model: ModelUser = new ModelUser();

		expect(model.b.getUrl()).to.equal('/v1/user');
	});
});
