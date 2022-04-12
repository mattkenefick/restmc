import { expect } from 'chai';
import { Dispatcher } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Dispatcher
 * @project RestMC
 */
describe('Dispatcher/Dispatcher', () => {
	/**
	 * @return Dispatcher
	 */
	function createDispatcher(): Dispatcher {
		return new Dispatcher();
	}

	it('should register an event by key', async () => {
		const dispatcher: Dispatcher = createDispatcher();

		dispatcher.on('my-event', () => {});

		expect(dispatcher.hasEvent('my-event')).to.equal(true);
	});

	it('should unregister an event by key', async () => {
		const dispatcher: Dispatcher = createDispatcher();

		dispatcher.on('my-event', () => expect(true).to.equal(true));
		dispatcher.off('my-event');

		expect(dispatcher.hasEvent('my-event')).to.equal(false);
	});

	it('should maintain event if there are multiple subscribers', async () => {
		const dispatcher: Dispatcher = createDispatcher();
		const callback: Function = () => {};

		dispatcher.on('my-event', callback);
		dispatcher.on('my-event', () => {});
		dispatcher.off('my-event', callback);

		expect(dispatcher.hasEvent('my-event')).to.equal(true);
	});

	it('should remove all event subscribers if callback not provided', async () => {
		const dispatcher: Dispatcher = createDispatcher();
		const callback: Function = () => {};

		dispatcher.on('my-event', callback);
		dispatcher.on('my-event', () => {});
		dispatcher.off('my-event');

		expect(dispatcher.hasEvent('my-event')).to.equal(false);
	});

	it('should trigger an event to subscribers', async () => {
		const dispatcher: Dispatcher = createDispatcher();

		// Event should fire
		dispatcher.on('my-event', (e: IDispatcherEvent) => {
			expect(e.name).to.equal('my-event');
			expect(e.detail.foo).to.equal('bar');
			expect(true).to.equal(true);
		});

		// Returns true if there are subscribers
		const didFire: boolean = dispatcher.dispatch('my-event', { foo: 'bar' });

		expect(didFire).to.equal(true);
	});
});
