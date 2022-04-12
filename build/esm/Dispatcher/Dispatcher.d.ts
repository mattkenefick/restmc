import { IDispatcherCallbackFunction, IDispatchData } from '../Interfaces';
import DispatcherEvent from './DispatcherEvent';
export default class Dispatcher {
    protected events: Record<string, DispatcherEvent>;
    dispatch(name: string, detail?: IDispatchData): boolean;
    hasEvent(eventName: string): boolean;
    off(eventName: string, callback?: IDispatcherCallbackFunction): void;
    on(eventName: string, callback: IDispatcherCallbackFunction): void;
    trigger(eventName: string, detail?: IDispatchData): boolean;
}
