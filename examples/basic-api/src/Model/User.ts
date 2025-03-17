import Model from './Core';
import ModelWallet from './Wallet';

/**
 * @class ModelUser
 * @extends Model
 *
 * Represents a user that has a wallet.
 */
export default class ModelUser extends Model {
	/**
	 * The API endpoint for users.
	 * @type {string}
	 */
	public endpoint: string = 'users';

	/**
	 * Returns the wallet associated with the user.
	 *
	 * @returns {ModelWallet} The user's wallet.
	 */
	public get wallet(): ModelWallet {
		// Assuming hasOne sets up a one-to-one relationship.
		return this.hasOne('wallet', ModelWallet);
	}
}
