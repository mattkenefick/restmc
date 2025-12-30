/**
 * Events dispatched during HTTP request lifecycle
 *
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Enum
 * @project RestMC
 */
export enum Request {
	Complete = 'complete',
	CompleteDelete = 'complete:delete',
	CompleteGet = 'complete:get',
	CompletePost = 'complete:post',
	CompletePut = 'complete:put',
	Dryrun = 'dryrun',
	Error = 'error',
	ErrorDelete = 'error:delete',
	ErrorGet = 'error:get',
	ErrorPost = 'error:post',
	ErrorPut = 'error:put',
	Fetch = 'fetch',
	FetchAfter = 'fetch:after',
	FetchBefore = 'fetch:before',
	Fetched = 'fetched',
	Finish = 'finish',
	Progress = 'progress',
	RequestDeduped = 'request:deduped',
	RequestPending = 'request:pending',
	Requesting = 'requesting',
	Success = 'success',
}
