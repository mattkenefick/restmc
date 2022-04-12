import { expect } from 'chai';
import { DispatcherEvent } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Dispatcher
 * @project RestMC
 */
describe('Dispatcher/DispatcherEvent', () => {
	/**
	 * @return Dispatcher
	 */
	function createDispatcherEvent(): DispatcherEvent {
		return new DispatcherEvent('my-event', { foo: 'bar' });
	}

	it('should instantiate with a name and data', () => {
		const event: DispatcherEvent = createDispatcherEvent();

		expect(event.eventName).to.equal('my-event');
		expect(event.detail.foo).to.equal('bar');
	});

	it('should register a callback', () => {
		const event: DispatcherEvent = createDispatcherEvent();

		event.registerCallback(() => {});
		expect(event.callbacks.length).to.equal(1);
	});

	it('should unregister a callback', () => {
		const event: DispatcherEvent = createDispatcherEvent();
		const callback: Function = () => {};

		event.registerCallback(callback);
		event.unregisterCallback(callback);

		expect(event.callbacks.length).to.equal(0);
	});

	it('should clear callbacks', () => {
		const event: DispatcherEvent = createDispatcherEvent();

		event.registerCallback(() => {});
		event.registerCallback(() => {});
		event.registerCallback(() => {});
		event.clearCallbacks();

		expect(event.callbacks.length).to.equal(0);
	});

	it('should fire 3 callbacks', () => {
		const event: DispatcherEvent = createDispatcherEvent();

		event.registerCallback(() => {});
		event.registerCallback(() => {});
		event.registerCallback(() => {});
		const fires: number = event.fire();

		expect(fires).to.equal(3);
	});

	it('should have name and detail in the registered callback', () => {
		const event: DispatcherEvent = createDispatcherEvent();

		event.registerCallback((e: IDispatcherEvent) => {
			expect(e.name).to.equal('my-event');
			expect(e.detail.foo).to.equal('bar');
		});

		const fires: number = event.fire();

		expect(fires).to.equal(1);
	});
});
