import { expect } from 'chai';
import { ActiveRecord, Model } from '../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('ActiveRecord', () => {
	it('should set a value', () => {
		const record: Model = new Model();

		record.set({ foo: 'bar' });

		expect(record.attr('foo')).to.equal('bar');
		expect(record.attributes['foo']).to.equal('bar');
	});

	it('should upload a file without throwing', () => {
		const record: Model = new Model();

		record.file('name', '');
	});

	it('should assign a generated cid on construction', () => {
		const record: Model = new Model();

		expect(record.cid).to.be.a('string');
		expect(record.cid.charAt(0)).to.equal('c');
		expect(record.cid.length).to.be.greaterThan(1);
	});

	it('should coerce numeric ids to strings via setId', () => {
		const record: Model = new Model();

		record.setId(42);

		expect(record.id).to.equal('42');
		expect(record.b.id).to.equal('42');
	});

	it('should unset the id on unsetId', () => {
		const record: Model = new Model({ id: 7 });

		record.unsetId();

		expect(record.id).to.equal('');
	});

	it('should set and unset headers', () => {
		const record: Model = new Model();

		record.setHeader('X-Foo', 'bar');
		expect(record.headers['X-Foo']).to.equal('bar');

		record.unsetHeader('X-Foo');
		expect(record.headers['X-Foo']).to.be.undefined;
	});

	it('should attach Authorization header when setToken is called', () => {
		const record: Model = new Model();

		record.setToken('abc123');

		expect(record.headers['Authorization']).to.equal('Bearer abc123');
	});

	it('should unset a specific query param', () => {
		const record: Model = new Model(null, { qp: { foo: 'bar', baz: 'qux' } });

		record.unsetQueryParam('foo');

		expect(record.b.queryParams.foo).to.be.undefined;
		expect(record.b.queryParams.baz).to.equal('qux');
	});

	it('should merge setOptions with existing options', () => {
		const record: Model = new Model(null, { baseUrl: '/v1' });

		record.setOptions({ endpoint: 'custom' });

		expect(record.options.baseUrl).to.equal('/v1');
		expect(record.endpoint).to.equal('custom');
	});

	it('should clear relationship cache with reset()', () => {
		const record: Model = new Model({ foo: 'bar' });

		record.reset();

		expect(Object.keys(record.attributes).length).to.equal(0);
		expect(record.hasFetched).to.equal(false);
		expect(record.hasLoaded).to.equal(false);
	});

	it('should generate a stable uniqueKey when attributes change', () => {
		const a: Model = new Model({ foo: 'bar' });
		const b: Model = new Model({ foo: 'bar' });

		a.updateUniqueKey();
		b.updateUniqueKey();

		expect(a.uniqueKey).to.equal(b.uniqueKey);
		expect(a.uniqueKey.length).to.be.greaterThan(0);
	});

	it('should update uniqueKey reactively on change event (via Handle_OnChange)', () => {
		const record: Model = new Model();

		record.set({ foo: 'bar' });
		record.dispatch('change');
		const first: string = record.uniqueKey;

		record.set({ foo: 'baz' });
		record.dispatch('change');
		const second: string = record.uniqueKey;

		expect(first).to.not.equal(second);
	});

	it('should disable uniqueKey updates when disableUniqueKeys is called', () => {
		const record: Model = new Model();
		record.disableUniqueKeys();

		record.set({ foo: 'bar' });
		record.dispatch('change');

		expect(record.uniqueKey).to.equal('');
	});

	it('should toggle dryRun with setDryRun', () => {
		const record: Model = new Model();

		record.setDryRun(true);
		expect(record.dryRun).to.equal(true);

		record.setDryRun(false);
		expect(record.dryRun).to.equal(false);
	});

	it('should register and fire a class-level setup hook', () => {
		return new Promise<void>((resolve) => {
			class HookedModel extends Model {}

			ActiveRecord.setHook.call(HookedModel, 'setup', (instance: HookedModel) => {
				ActiveRecord.unsetHook.call(HookedModel, 'setup');
				expect(instance).to.be.instanceOf(HookedModel);
				resolve();
			});

			new HookedModel();
		});
	});

	it('should cancel modified endpoint on setEndpoint', () => {
		const record: Model = new Model();
		const other: Model = new Model({ id: 99 });
		other.endpoint = 'other';

		record.useModifiedEndpoint(other);
		expect(record.isUsingModifiedEndpoint()).to.equal(true);

		record.setEndpoint('override');
		expect(record.isUsingModifiedEndpoint()).to.equal(false);
		expect(record.endpoint).to.equal('override');
	});

	it('should cancelModifiedEndpoint() without changing the endpoint', () => {
		const record: Model = new Model();
		record.endpoint = 'primary';
		const other: Model = new Model({ id: 99 });
		other.endpoint = 'other';

		record.useModifiedEndpoint(other);
		record.cancelModifiedEndpoint();

		expect(record.isUsingModifiedEndpoint()).to.equal(false);
		expect(record.endpoint).to.equal('primary');
	});

	it('should report parent linkage via hasParent/hasParentCollection', () => {
		const record: Model = new Model();

		expect(record.hasParent()).to.equal(false);
		expect(record.hasParentCollection()).to.equal(false);
	});

	it('should store last ttl via cache(ttl) chainable', () => {
		const record: any = new Model();

		const chained: any = record.cache(500);

		expect(chained).to.equal(record);
		expect(record.ttl).to.equal(500);
	});

	it('should reflect body setter', () => {
		const record: Model = new Model();

		record.setBody({ foo: 'bar' });

		expect(record.body.foo).to.equal('bar');
	});

	it('should cancel the active request through cancelRequest', () => {
		const record: any = new Model();
		let cancelReason = '';

		record.loading = true;
		record.request = {
			cancel: (reason: string) => {
				cancelReason = reason;
				return true;
			},
		};

		expect(record.cancelRequest('User navigated away')).to.equal(true);
		expect(record.loading).to.equal(false);
		expect(cancelReason).to.equal('User navigated away');
	});

	it('should return false from cancelRequest when no request is active', () => {
		const record: Model = new Model();

		expect(record.cancelRequest()).to.equal(false);
	});

	it('should clone a Model into a separate instance with identical attributes', () => {
		const original: Model = new Model({ foo: 'bar', x: 10 });
		const cloned: any = original.clone();

		expect(cloned).to.not.equal(original);
		expect(cloned.attr('foo')).to.equal('bar');
		expect(cloned.attr('x')).to.equal(10);
	});
});
