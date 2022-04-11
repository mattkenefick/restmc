import { IDispatcherCallbackFunction, IDispatcherEventData } from '../Interfaces';
export default class DispatcherEvent {
    callbacks: IDispatcherCallbackFunction[];
    eventData: IDispatcherEventData;
    eventName: string;
    constructor(eventName: string, eventData?: IDispatcherEventData);
    clearCallbacks(): void;
    fire(eventData?: IDispatcherEventData): number;
    hasCallback(callback: IDispatcherCallbackFunction): boolean;
    registerCallback(callback: IDispatcherCallbackFunction): void;
    unregisterCallback(callback: IDispatcherCallbackFunction): boolean;
}
