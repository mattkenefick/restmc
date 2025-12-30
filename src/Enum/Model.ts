/**
 * Events dispatched for model and active record state changes
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Enum
 * @project RestMC
 */
export enum Model {
	Change = 'change',
	FileComplete = 'file:complete',
	Reset = 'reset',
	Set = 'set',
	SetBefore = 'set:before',
}
