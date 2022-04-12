import { IDispatcherCallbackFunction, IDispatcherEvent, IDispatchData } from '../Interfaces';

/**
 * The DispatcherEvent can be instantiated with data that's included
 * every time it fires in addition to ephemeral data per firing.
 *
 * Example:
 *
 *   const event: DispatcherEvent = new DispatcherEvent('my-event', { foo: 'bar' });
 *
 *   event.registerCallback((e: IDispatcherEvent) => {
 *       console.log('Triggered event', e.name, 'with data', e.detail);
 *   });
 *
 *   event.fire();
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Dispatcher
 * @project RestMC
 */
export default class DispatcherEvent {
	/**
	 * @type IDispatcherCallbackFunction[]
	 */
	public callbacks: IDispatcherCallbackFunction[];

	/**
	 * @type IDispatchData
	 */
	public detail: IDispatchData;

	/**
	 * @type string
	 */
	public eventName: string;

	/**
	 * @param string eventName
	 * @param IDispatchData dispatchData
	 */
	constructor(eventName: string, detail: IDispatchData = {}) {
		this.callbacks = [];
		this.detail = detail;
		this.eventName = eventName;
	}

	/**
	 * @return void
	 */
	public clearCallbacks(): void {
		this.callbacks = [];
	}

	/**
	 * @param IDispatcherEvent event
	 * @return number
	 */
	public fire(detail: IDispatchData): number {
		const callbacks = this.callbacks.slice(0);
		let fires: number = 0;
		const event: IDispatcherEvent = {
			detail: Object.assign({}, this.detail, detail),
			name: this.eventName,
		};

		callbacks.forEach((callback: IDispatcherCallbackFunction) => {
			callback(event);
			fires++;
		});

		return fires;
	}

	/**
	 * @param IDispatcherCallbackFunction callback
	 * @return boolean
	 */
	public hasCallback(callback: IDispatcherCallbackFunction): boolean {
		return !!this.callbacks.find((value: IDispatcherCallbackFunction) => value === callback);
	}

	/**
	 * @param IDispatchData callback
	 * @return void
	 */
	public registerCallback(callback: IDispatcherCallbackFunction): void {
		this.callbacks.push(callback);
	}

	/**
	 * @param IDispatcherCallbackFunction callback
	 * @return boolean
	 */
	public unregisterCallback(callback: IDispatcherCallbackFunction): boolean {
		const index = this.callbacks.indexOf(callback);

		if (index > -1) {
			this.callbacks.splice(index, 1);
			return true;
		}

		return false;
	}
}
