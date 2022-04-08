import { expect } from 'chai';
import { DispatcherEvent } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Dispatcher
 * @project RestMC
 */
describe('Dispatcher DispatcherEvent', () => {
	/**
	 * @return Dispatcher
	 */
	function createDispatcherEvent(): DispatcherEvent {
		return new DispatcherEvent('myEvent', { foo: 'bar' });
	}

	it('should instantiate with a name and data', () => {
		const event: DispatcherEvent = createDispatcherEvent();

		expect(event.eventName).to.equal('myEvent');
		expect(event.eventData.foo).to.equal('bar');
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
});
