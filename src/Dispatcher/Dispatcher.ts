import { IDispatcherCallbackFunction, IDispatchData } from '../Interfaces';
import DispatcherEvent from './DispatcherEvent';

/**
 * The Dispatcher is used as a superclass or mixin that provides the
 * functionality of an event system.
 *
 * Example:
 *
 *   class MyClass extends Dispatcher { ... }
 *
 *   const instance: MyClass = new MyClass;
 *
 *   instance.on('my-event', (e: IDispatcherEvent) => {
 *       console.log('Triggered event', e.name, 'with data', e.detail);
 *   });
 *
 *   instance.dispatch('my-event');
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Dispatcher
 * @project RestMC
 */
export default class Dispatcher {
	/**
	 * @type Record<String, DispatcherEvent>
	 */
	protected events: Record<string, DispatcherEvent> = {};

	/**
	 * If duplicate event is passed, will attempt to bubble the data rather
	 * than duplicating the event entirely.
	 *
	 * Returns true if there are any events to broadcast to
	 *
	 * @param string eventName
	 * @param IDispatchData dispatchData
	 * @return boolean
	 */
	public dispatch(name: string, detail: IDispatchData = {}): boolean {
		const event: DispatcherEvent = this.events[name] as DispatcherEvent;

		if (event) {
			event.fire(detail);
			return true;
		}

		return false;
	}

	/**
	 * Check if we have an event registered
	 *
	 * @return boolean
	 */
	public hasEvent(eventName: string): boolean {
		return !!this.events[eventName];
	}

	/**
	 * @param string eventName
	 * @param IDispatcherCallbackFunction callback
	 * @return void
	 */
	public off(eventName: string, callback?: IDispatcherCallbackFunction): void {
		const event: DispatcherEvent = this.events[eventName] as DispatcherEvent;

		// Clear all
		if (event && !callback) {
			event.clearCallbacks();
			delete this.events[eventName];
		}

		// Remove specific
		else if (event && callback && event.callbacks.indexOf(callback) > -1) {
			event.unregisterCallback(callback);

			if (event.callbacks.length === 0) {
				delete this.events[eventName];
			}
		}
	}

	/**
	 * @param string eventName
	 * @param IDispatcherCallbackFunction callback
	 * @return void
	 */
	public on(eventName: string, callback: IDispatcherCallbackFunction): void {
		let event = this.events[eventName];

		if (!event) {
			event = new DispatcherEvent(eventName, {});
			this.events[eventName] = event;
		}

		event.registerCallback(callback);
	}

	/**
	 * Alias for dispatch
	 *
	 * @param string eventName
	 * @param IDispatchData eventData
	 */
	public trigger(eventName: string, detail: IDispatchData = {}): boolean {
		return this.dispatch(eventName, detail);
	}
}
