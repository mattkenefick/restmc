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
	 * @param IDispatcherEventData eventData
	 * @return number
	 */
	public fire(eventData: IDispatcherEventData = {}): number {
		const callbacks = this.callbacks.slice(0);
		let fires: number = 0;

		callbacks.forEach((callback: IDispatcherCallbackFunction) => {
			callback(Object.assign({}, this.eventData, eventData));
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
	 * @param IDispatcherEventData callback
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
