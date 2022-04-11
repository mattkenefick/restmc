import { IAttributes, IDispatcher } from './Interfaces';
import Dispatcher from './Dispatcher/Dispatcher';
export default class Core extends Dispatcher implements IDispatcher {
    constructor(options?: IAttributes);
}
