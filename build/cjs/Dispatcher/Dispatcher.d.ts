import { IDispatcherCallbackFunction, IDispatcherEventData } from '@/Interfaces';
import DispatcherEvent from './DispatcherEvent';
export default class Dispatcher {
    protected events: Record<string, DispatcherEvent>;
    dispatch(name: string, data?: any): boolean;
    hasEvent(eventName: string): boolean;
    off(eventName: string, callback?: IDispatcherCallbackFunction): void;
    on(eventName: string, callback: IDispatcherCallbackFunction): void;
    trigger(eventName: string, eventData: IDispatcherEventData): boolean;
}
