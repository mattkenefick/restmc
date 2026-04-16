import { expect } from 'chai';
import { Dispatcher } from '../../../src/index';

/**
 * Coverage for the bits of Dispatcher that the existing spec didn't
 * touch: once(), trigger(), non-existent event dispatch return values,
 * and multi-callback firing semantics.
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Dispatcher
 * @project RestMC
 */
describe('Dispatcher/Dispatcher.Features', () => {
	it('should fire a once() listener exactly one time', () => {
		const dispatcher: Dispatcher = new Dispatcher();
		let calls: number = 0;

		dispatcher.once('my-event', () => calls++);

		dispatcher.dispatch('my-event');
		dispatcher.dispatch('my-event');
		dispatcher.dispatch('my-event');

		expect(calls).to.equal(1);
	});

	it('should alias trigger() to dispatch()', () => {
		const dispatcher: Dispatcher = new Dispatcher();
		let received: any;

		dispatcher.on('my-event', (e: any) => (received = e.detail));

		const didFire: boolean = dispatcher.trigger('my-event', { foo: 'bar' });

		expect(didFire).to.equal(true);
		expect(received.foo).to.equal('bar');
	});

	it('should return false when dispatching an unknown event', () => {
		const dispatcher: Dispatcher = new Dispatcher();

		expect(dispatcher.dispatch('nope')).to.equal(false);
	});

	it('should notify all subscribers for a given event', () => {
		const dispatcher: Dispatcher = new Dispatcher();
		let a: number = 0;
		let b: number = 0;

		dispatcher.on('my-event', () => a++);
		dispatcher.on('my-event', () => b++);

		dispatcher.dispatch('my-event');

		expect(a).to.equal(1);
		expect(b).to.equal(1);
	});

	it('should remove only the specified callback when off(name, cb) is used', () => {
		const dispatcher: Dispatcher = new Dispatcher();
		let aHits: number = 0;
		let bHits: number = 0;
		const a: () => void = () => aHits++;
		const b: () => void = () => bHits++;

		dispatcher.on('my-event', a);
		dispatcher.on('my-event', b);
		dispatcher.off('my-event', a);

		dispatcher.dispatch('my-event');

		expect(aHits).to.equal(0);
		expect(bHits).to.equal(1);
	});

	it('should tolerate off() on an event that was never registered', () => {
		const dispatcher: Dispatcher = new Dispatcher();

		// Should not throw
		dispatcher.off('ghost');

		expect(dispatcher.hasEvent('ghost')).to.equal(false);
	});
});
