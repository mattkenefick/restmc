import { configureServer } from '../mock/server/test';
import { expect } from 'chai';
import { Cache } from '../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('Cache', () => {
	it('should get an undefined item', async () => {
		const cache: Cache = new Cache();
		const item = cache.get('foo');

		expect(item).to.equal(undefined);
	});

	it('should not has an item', async () => {
		const cache: Cache = new Cache();
		const item = cache.has('foo');

		expect(item).to.equal(false);
	});

	it('should not exists an item', async () => {
		const cache: Cache = new Cache();
		const item = cache.exists('foo');

		expect(item).to.equal(false);
	});

	it('should successfully set a cached item', async () => {
		const cache: Cache = new Cache();
		cache.set('foo', 'bar', 1000);

		const value = cache.get('foo');

		expect(value).to.equal('bar');
		expect(cache.has('foo')).to.equal(true);
		expect(cache.exists('foo')).to.equal(true);
	});

	it('should successfully get an ephemeral cached item', async () => {
		const cache: Cache = new Cache();
		cache.set('foo', 'bar', 0);

		const value = cache.get('foo');

		expect(value).to.equal('bar');
		expect(cache.has('foo')).to.equal(false);
		expect(cache.exists('foo')).to.equal(false);
	});

	it('should successfully retain a cached item', async () => {
		return new Promise((resolve) => {
			const cache: Cache = new Cache();
			cache.set('foo', 'bar', 20);

			setTimeout(() => {
				const value = cache.get('foo');

				expect(value).to.equal('bar');
				expect(cache.has('foo')).to.equal(true);
				expect(cache.exists('foo')).to.equal(true);

				resolve();
			}, 10);
		});
	});

	it('should successfully expire a cached item', async () => {
		return new Promise((resolve) => {
			const cache: Cache = new Cache();
			cache.set('foo', 'bar', 10);

			setTimeout(() => {
				const value = cache.get('foo');

				expect(value).to.equal(undefined);
				expect(cache.has('foo')).to.equal(false);
				expect(cache.exists('foo')).to.equal(true);

				resolve();
			}, 20);
		});
	});

	it('should fail to overwrite existing item', async () => {
		const cache: Cache = new Cache();

		// Set immutable item
		cache.set('foo', 'bar', 10, true);

		// Attempt to overwrite item
		const didWrite = cache.set('foo', 'bizz', 0);
		const value = cache.get('foo');

		// Item should exist as normal with a failed write
		expect(didWrite).to.equal(false);
		expect(value).to.equal('bar');
	});

	it('should successful to overwrite existing item after expiration', async () => {
		return new Promise((resolve) => {
			// Write immutable item
			const cache: Cache = new Cache();
			cache.set('foo', 'bar', 10, true);

			// Wait and overwrite
			setTimeout(() => {
				// Attempt to overwrite item
				const didWrite = cache.set('foo', 'bizz', 10);
				const value = cache.get('foo');

				// Item should exist as normal with a failed write
				expect(didWrite).to.equal(true);
				expect(value).to.equal('bizz');

				resolve();
			}, 20);
		});
	});
});
