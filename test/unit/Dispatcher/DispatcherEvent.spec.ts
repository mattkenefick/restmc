import { expect } from 'chai';
import { DispatcherEvent } from '../../../src/index';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Test\Unit\Dispatcher
 * @project RestMC
 */
describe('Dispatcher DispatcherEvent', () => {
	const event: DispatcherEvent = new DispatcherEvent('myEvent', { foo: 'bar' });

	it('should instantiate with a name and data', () => {
		expect(event.eventName).to.equal(name);
		expect(event.eventData).to.equal(data);
	});
});
