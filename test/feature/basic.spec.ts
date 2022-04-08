import { expect } from 'chai';
import FilmModel from '../mock/models/FilmModel';
import FilmCollection from '../mock/collections/FilmCollection';
import { ActiveRecord, Collection, Model } from '../../src/index';

/**
 * Tests Model / ActiveRecord
 */
describe('Basic Tests', () => {
	it('should hydrate with attributes', () => {
		const model: Model = new Model({
			foo: 'bar',
			x: 5,
		});

		// Get attribute
		const resultA: string = <string>model.attr('foo');
		const resultB: number = <number>model.attr('x');

		expect(resultA).to.equal('bar');
		expect(resultB).to.equal(5);
	});

	it('should set attribute', () => {
		const model: Model = new Model();

		// Set attribute
		model.set({ foo: 'bar' });

		// Get attribute
		const result: string = <string>model.attr('foo');

		expect(result).to.equal('bar');
	});

	it('should set multiple attributes', () => {
		const model: Model = new Model();

		// Set attribute
		model.set({
			foo: 'bar',
			x: 10,
		});

		// Get attribute
		const resultA: string = <string>model.attr('foo');
		const resultB: number = <number>model.attr('x');

		expect(resultA).to.equal('bar');
		expect(resultB).to.equal(10);
	});

	it('should unset attribute', () => {
		const model: Model = new Model();

		// Set attribute
		model.set({ foo: 'bar' });

		// Unset attribute
		model.unset('foo');

		// Get attribute
		const result: string = <string>model.attr('foo');

		expect(result).to.be.undefined;
	});

	it('should set header', () => {
		const model: Model = new Model();

		// Set header
		model.setHeader('foo', 'bar');

		// Get header
		const result: string = <string>model.headers.foo;

		expect(result).to.equal('bar');
	});

	it('should set multiple headers', () => {
		const model: Model = new Model();

		// Set header
		model.setHeaders({
			foo: 'bar',
			x: 10,
		});

		// Get header
		const resultA: string = <string>model.headers.foo;
		const resultB: number = <number>model.headers.x;

		expect(resultA).to.equal('bar');
		expect(resultB).to.equal(10);
	});

	it('should set query param', () => {
		const model: Model = new Model();

		// Set query param
		model.setQueryParam('foo', 'bar');

		// Get query param
		const result: string = <string>model.b.queryParams.foo;

		expect(result).to.equal('bar');
	});

	it('should set multiple query params', () => {
		const model: Model = new Model();

		// Set query param
		model.setQueryParams({
			foo: 'bar',
			x: 10,
		});

		// Get query param
		const resultA: string = <string>model.b.queryParams.foo;
		const resultB: number = <number>model.b.queryParams.x;

		expect(resultA).to.equal('bar');
		expect(resultB).to.equal(10);
	});

	it('should set query params by constructor (as params)', () => {
		const model: Model = new Model(null, {
			params: {
				foo: 'bar',
				x: 10,
			},
		});

		// Get query param
		const resultA: string = <string>model.b.queryParams.foo;
		const resultB: number = <number>model.b.queryParams.x;

		expect(resultA).to.equal('bar');
		expect(resultB).to.equal(10);
	});

	it('should set query params by constructor (as queryParams)', () => {
		const model: Model = new Model(null, {
			queryParams: {
				foo: 'bar',
				x: 10,
			},
		});

		// Get query param
		const resultA: string = <string>model.b.queryParams.foo;
		const resultB: number = <number>model.b.queryParams.x;

		expect(resultA).to.equal('bar');
		expect(resultB).to.equal(10);
	});

	it('should set query params by constructor (as qp)', () => {
		const model: Model = new Model(null, {
			qp: {
				foo: 'bar',
				x: 10,
			},
		});

		// Get query param
		const resultA: string = <string>model.b.queryParams.foo;
		const resultB: number = <number>model.b.queryParams.x;

		expect(resultA).to.equal('bar');
		expect(resultB).to.equal(10);
	});

	it('should remove empty query params from url', () => {
		const model: Model = new Model(null, {
			qp: {
				foo: 'bar',
				moderation: '',
			},
		});

		// Get query param
		const resultA: string = <string>model.b.getQueryParamsAsString();

		expect(resultA).to.equal('&foo=bar');
	});

	it('should return JSON object', () => {
		const model: Model = new Model();
		const obj: object = {
			foo: 'bar',
			x: 10,
		};

		// Set attributes
		model.set(obj);

		// Get attribute
		const result: object = <object>model.toJSON();

		expect(result).to.eql(obj);
	});
});
