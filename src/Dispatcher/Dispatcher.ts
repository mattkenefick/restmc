import { IDispatcherCallbackFunction, IDispatcherEventData } from '@/Interfaces';
import DispatcherEvent from './DispatcherEvent';

/**
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
	 * @param string eventName
	 * @param any eventData
	 */
	public dispatch(name: string, data: any = {}): void {
		const event: DispatcherEvent = this.events[name] as DispatcherEvent;
		const eventData: any = name === data.event?.name && data.eventData ? data.eventData : data;

		if (event) {
			event.fire({
				event: { name },
				eventData: eventData,
				target: this,
			});
		}
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
			event = new DispatcherEvent(eventName);
			this.events[eventName] = event;
		}

		event.registerCallback(callback);
	}

	/**
	 * Alias for dispatch
	 *
	 * @param string eventName
	 * @param any eventData
	 */
	public trigger(eventName: string, eventData: IDispatcherEventData): void {
		this.dispatch(eventName, eventData);
	}
}
