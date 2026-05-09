import { expect } from 'chai';
import axios from 'axios';
import { Request } from '../../../src/index';

/**
 * Additional coverage for Http/Request. Focused on static cache
 * management, setHeaders behavior, option pass-through and dry-run
 * flag handling (so we never hit the network).
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Http
 * @project RestMC
 */
describe('Http/Request.Features', () => {
	afterEach(() => {
		// Keep the shared static cache clean between tests so they stay
		// isolated from each other.
		Request.clearCache();
	});

	it('should keep a shared cache across instances', () => {
		const a: Request = new Request('http://example.com/a');

		(Request as any).cachedResponses.set('shared-key', { status: 200 }, 9999);
		expect((Request as any).cachedResponses.has('shared-key')).to.equal(true);

		Request.removeCacheEntry('shared-key');
		expect((Request as any).cachedResponses.has('shared-key')).to.equal(false);
	});

	it('should clearCache() wipe previously cached responses', () => {
		(Request as any).cachedResponses.set('a', 1, 9999);
		(Request as any).cachedResponses.set('b', 2, 9999);

		Request.clearCache();

		expect((Request as any).cachedResponses.has('a')).to.equal(false);
		expect((Request as any).cachedResponses.has('b')).to.equal(false);
	});

	it('should expose getPendingRequests() as a Map', () => {
		const pending: any = Request.getPendingRequests();

		expect(pending).to.be.instanceOf(Map);
	});

	it('should accept a custom withCredentials via options', () => {
		const request: any = new Request('http://example.com', { withCredentials: false });

		expect(request.withCredentials).to.equal(false);
	});

	it('should default withCredentials to true', () => {
		const request: any = new Request('http://example.com');

		expect(request.withCredentials).to.equal(true);
	});

	it('should accept dryRun via options and store it as a boolean', () => {
		const request: any = new Request('http://example.com', { dryRun: true });

		expect(request.dryRun).to.equal(true);
	});

	it('should replace setHeaders fully (not merge)', () => {
		const request: Request = new Request('http://example.com');

		request.setHeader('A', '1');
		request.setHeaders({ B: '2' });

		expect(request.headers.A).to.be.undefined;
		expect(request.headers.B).to.equal('2');
	});

	it('should strip trailing question marks from url', () => {
		const request: Request = new Request('http://example.com/v1/test?');

		expect(request.url).to.equal('http://example.com/v1/test');
	});

	it('should strip ?& sequences from url', () => {
		const request: Request = new Request('http://example.com/v1/test?&foo=1');

		expect(request.url).to.equal('http://example.com/v1/test?foo=1');
	});

	it('should emit a dryrun event and resolve without a network call when dryRun=true', async () => {
		const request: any = new Request('http://example.com/never-hit', { dryRun: true });
		let dryRunDetail: any;

		request.on('dryrun', (e: any) => {
			dryRunDetail = e.detail;
		});

		await request.fetch('GET', {}, {}, 0);

		expect(dryRunDetail).to.be.an('object');
		expect(dryRunDetail.method).to.equal('GET');
		expect(dryRunDetail.url).to.equal('http://example.com/never-hit');
	});

	it('should return false when there is no active request to cancel', () => {
		const request: Request = new Request('http://example.com');

		expect(request.cancel()).to.equal(false);
	});

	it('should cancel an in-flight request', async () => {
		const originalAdapter = (axios.defaults as any).adapter;
		const request: Request = new Request('http://example.com/slow');
		let cancelReason = '';
		let didReject = false;

		(axios.defaults as any).adapter = (config: any) => {
			return new Promise((resolve, reject) => {
				config.cancelToken?.promise.then((cancel: any) => reject(cancel));

				setTimeout(() => {
					resolve({
						config,
						data: { data: { ok: true } },
						headers: {},
						status: 200,
						statusText: 'OK',
					});
				}, 50);
			});
		};

		request.on('cancel', (e: any) => {
			cancelReason = e.detail.reason;
		});

		try {
			const pending = request.fetch('GET', {}, {}, 0);

			expect(request.cancel('No longer needed')).to.equal(true);

			await pending;
		} catch (canceledRequest) {
			didReject = true;
			expect(canceledRequest).to.equal(request);
		} finally {
			(axios.defaults as any).adapter = originalAdapter;
		}

		expect(didReject).to.equal(true);
		expect(request.canceled).to.equal(true);
		expect(request.cancelReason).to.equal('No longer needed');
		expect(request.loading).to.equal(false);
		expect(request.status).to.equal(0);
		expect(cancelReason).to.equal('No longer needed');
	});
});
