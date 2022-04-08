import { IDispatcherCallbackFunction, IDispatcherEventData } from '../Interfaces';

/**
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
	 * @type IDispatcherEventData
	 */
	public eventData: IDispatcherEventData;

	/**
	 * @type string
	 */
	public eventName: string;

	/**
	 * @param string eventName
	 * @param IDispatcherEventData eventData
	 */
	constructor(eventName: string, eventData: IDispatcherEventData = {}) {
		this.callbacks = [];
		this.eventData = eventData;
		this.eventName = eventName;
	}

	/**
	 * @return void
	 */
	public clearCallbacks(): void {
		this.callbacks = [];
	}

	/**
	 * @param IDispatcherEventData callback
	 * @return void
	 */
	public registerCallback(callback: IDispatcherCallbackFunction): void {
		this.callbacks.push(callback);
	}

	/**
	 * @param IDispatcherCallbackFunction callback
	 * @return void
	 */
	public unregisterCallback(callback: IDispatcherCallbackFunction): void {
		const index = this.callbacks.indexOf(callback);

		if (index > -1) {
			this.callbacks.splice(index, 1);
		}
	}

	/**
	 * @param IDispatcherEventData eventData
	 * @return void
	 */
	public fire(eventData: IDispatcherEventData = {}): void {
		const callbacks = this.callbacks.slice(0);

		callbacks.forEach((callback: IDispatcherCallbackFunction) => {
			callback(Object.assign({}, this.eventData, eventData));
		});
	}
}
