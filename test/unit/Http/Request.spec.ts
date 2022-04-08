import { expect } from 'chai';
import { Request } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Http
 * @project RestMC
 */
describe('Http/Request', () => {
	/**
	 * @return ModelUser
	 */
	function getRequest(attributes: any = {}): Request {
		return new Request('http://localhost:8080/v1/test?', attributes);
	}

	it('should remove trailing question marks', async () => {
		const request: Request = new getRequest();

		expect(request.url).to.equal('http://localhost:8080/v1/test');
	});

	it('should default data key to data', async () => {
		const request: Request = new getRequest();

		expect(request.dataKey).to.equal('data');
	});

	it('should accept a custom data key', async () => {
		const request: Request = new getRequest({ dataKey: 'myDataKey' });

		expect(request.dataKey).to.equal('myDataKey');
	});

	it('should allow a header to be set', async () => {
		const request: Request = new getRequest();
		request.setHeader('foo', 'bar');

		expect(request.headers.foo).to.equal('bar');
	});

	it('should allow multiple headers to be set', async () => {
		const request: Request = new getRequest();
		request.setHeaders({ foo: 'bar' });

		expect(request.headers.foo).to.equal('bar');
	});
});
