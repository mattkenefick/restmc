/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package Exception
 * @project RestMC
 */
export default class ExceptionRequest extends Error {
	/**
	 * @type number
	 */
	public status: number;

	/**
	 * @type string
	 */
	public text: string;

	/**
	 * @param number status
	 * @param string text
	 */
	constructor(status: number, text: string) {
		super(text);

		this.status = status;
		this.text = text;
	}
}
