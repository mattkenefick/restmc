import { IAttributes, IDispatcher } from './Interfaces.js';
import Dispatcher from './Dispatcher/Dispatcher.js';
export default class Core extends Dispatcher implements IDispatcher {
    get restmc(): string;
    constructor(options?: IAttributes);
}
