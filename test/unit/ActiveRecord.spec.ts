import { expect } from 'chai';
import { Model } from '../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('ActiveRecord', () => {
	it('should set a value', async () => {
		const record: Model = new Model();

		record.set({ foo: 'bar' });

		expect(record.attr('foo')).to.equal('bar');
		expect(record.attributes['foo']).to.equal('bar');
	});

	it('should upload a file', async () => {
		const record: Model = new Model();

		record.file('name', '');
	});
});
