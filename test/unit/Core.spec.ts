import { expect } from 'chai';
import { Core } from '../../src/index';

/**
 * Tests the small Core base class. Core extends Dispatcher and hands
 * out a "restmc" version string. Everything inheriting from Core picks
 * up the event system along with it.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit
 * @project RestMC
 */
describe('Core', () => {
	it('should expose a restmc version string', () => {
		const core: Core = new Core();

		expect(core.restmc).to.be.a('string');
		expect(core.restmc).to.match(/^\d+\.\d+\.\d+$/);
	});

	it('should merge options onto the instance at construction', () => {
		const core: any = new Core({ foo: 'bar', x: 10 });

		expect(core.foo).to.equal('bar');
		expect(core.x).to.equal(10);
	});

	it('should inherit dispatch/on/off/trigger from Dispatcher', () => {
		const core: Core = new Core();
		let fired: number = 0;

		core.on('ping', () => fired++);
		core.trigger('ping');
		core.dispatch('ping');

		expect(fired).to.equal(2);
	});
});
