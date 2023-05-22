import { IDispatcherCallbackFunction, IDispatchData } from '../Interfaces.js';
export default class DispatcherEvent {
    callbacks: IDispatcherCallbackFunction[];
    detail: IDispatchData;
    eventName: string;
    constructor(eventName: string, detail?: IDispatchData);
    clearCallbacks(): void;
    fire(detail: IDispatchData): number;
    hasCallback(callback: IDispatcherCallbackFunction): boolean;
    registerCallback(callback: IDispatcherCallbackFunction): void;
    unregisterCallback(callback: IDispatcherCallbackFunction): boolean;
}
