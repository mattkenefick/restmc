import { IAttributes, IDispatchData, IProgressEvent, IRequest, IRequestEvent, IResponse } from '../Interfaces.js';
import Core from '../Core.js';
import RequestError from '../Exception/Request.js';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Request
 * @project RestMC
 */
export default abstract class CoreRequest extends Core {
	/**
	 * Represents the expected key to find our data on in remote responses.
	 * It's frequently found on 'data':
	 *
	 * {
	 *     "data": [ ... ]
	 * }
	 *
	 * @type string
	 */
	public dataKey: string = 'data';

	/**
	 * Do not set the 'Content-Type' here because it wont be
	 * overridden; which will break file uploads.
	 *
	 * @type string
	 */
	public headers: Record<string, string> = {};

	/**
	 * If this Request is currently loading
	 *
	 * @type boolean
	 */
	public loading: boolean = false;

	/**
	 * Mode (cors, no-cors, same-origin, navigate)
	 *
	 * @type string
	 */
	public mode: string = 'cors';

	/**
	 * Response from socket
	 *
	 * @type IResponse
	 */
	public response?: IResponse;

	/**
	 * Parsed data from response
	 *
	 * @type object
	 */
	public responseData: IAttributes = {};

	/**
	 * @type number
	 */
	public status: number;

	/**
	 * @type string
	 */
	public url: string;

	/**
	 * @param string url
	 * @param IAttributes options
	 */
	constructor(url: string = '', options: IAttributes = {}) {
		super();

		// Set url and datakey
		this.dataKey = options.dataKey || this.dataKey;

		// Set URL and remove common mistakes
		this.url = url;
		this.url = this.url.replace(/\?$/, '');
		this.url = this.url.replace(/\?&/, '?');
	}

	/**
	 * Before parsing data
	 *
	 * @todo Check if we have valid JSON
	 * @todo Check if the request was an error
	 *
	 * @param IResponse response
	 * @return void
	 */
	protected beforeParse(response: IResponse): void {
		this.dispatch('parse:before', {
			request: this,
			response: response,
		});
	}

	/**
	 * Parse data
	 *
	 * @param IResponse response
	 * @return void
	 */
	protected parse(response: IResponse): void {
		// Trigger
		this.dispatch('parse:parsing', {
			request: this,
			response: response,
		});

		// Set data
		if (response.status != 204) {
			this.responseData = response.data;
		}

		// Trigger
		this.dispatch('parse', {
			request: this,
			response: response,
		});
	}

	/**
	 * @param IResponse response
	 * @return void
	 */
	protected afterParse(response: IResponse): void {
		// Check if we have a status in the JSON as well
		if (response.status >= 400 && response.data?.status) {
			const message: string = response.data?.message || response.data || '';

			throw new RequestError(response.status, message);
		}

		// Trigger
		this.dispatch('parse:after', {
			request: this,
			response: response,
		});
	}

	/**
	 * @param IResponse response
	 * @return void
	 */
	protected afterFetch(response: IResponse): void {
		const payload = {
			request: this,
			response: response,
		};

		this.dispatch('fetch', payload);
		this.dispatch('fetch:after', payload);
		this.loading = false;
	}

	/**
	 * @param IResponse response
	 * @return void
	 */
	protected afterAll(e: IResponse): void {
		if (e === undefined) {
			return;
		}

		const data: any = e.data;
		const status: number = e.status;
		const method: string = (e.config?.method || 'get').toLowerCase();

		// Set status
		this.status = status;

		// Check request
		this.dispatch('complete', {
			request: this,
			response: e,
		});

		this.dispatch('complete:' + method, {
			request: this,
			response: e,
		});
	}

	/**
	 * @param IResponse response
	 * @return void
	 */
	protected afterAllError(e: IResponse): void {
		const data: any = e.message || 'Unknown error';
		const status: number = e.response?.status || 503; // Default to 503 Service Unavailable
		const method: string = (e.config?.method || 'get').toLowerCase();
		const payload = {
			request: this,
			response: e,
		};

		// mk: Apparently, throw Error does same as dispatch 'error' which
		// causes duplicates when listening on('error' ...)
		// this.dispatch('error', e.data);
		this.responseData = data;

		// Set status
		this.status = status;

		this.dispatch('error', payload);
		this.dispatch('error:' + method, payload);
	}

	/**
	 * @param IAxiosSuccess response
	 * @return void
	 */
	protected afterAny(): void {
		this.dispatch('finish', { request: this });
	}
}
