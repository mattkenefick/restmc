/**
 * Events dispatched during collection operations
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Enum
 * @project RestMC
 */
export enum Collection {
	Add = 'add',
	AddAfter = 'add:after',
	AddBefore = 'add:before',
	AddDelayed = 'add:delayed',
	Change = 'change',
	Filter = 'filter',
	Remove = 'remove',
	RemoveBefore = 'remove:before',
	Set = 'set',
}
