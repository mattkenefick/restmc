import { IAttributes, IDispatcher } from './Interfaces';
import Dispatcher from './Dispatcher/Dispatcher';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package RestMC
 * @project RestMC
 */
export default class Core extends Dispatcher implements IDispatcher {
	/**
	 * @param IAttributes options
	 */
	constructor(options: IAttributes = {}) {
		super();
		Object.assign(this, options);
	}
}
