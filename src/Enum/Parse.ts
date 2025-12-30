/**
 * Events dispatched during response parsing
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Enum
 * @project RestMC
 */
export enum Parse {
	After = 'parse:after',
	Before = 'parse:before',
	Parse = 'parse',
	Parsing = 'parse:parsing',
}
