import Model from './Core';
import ModelUser from './User';

/**
 * @class ModelWallet
 * @extends Model
 *
 * Represents a wallet that belongs to a user.
 */
export default class ModelWallet extends Model {
	/**
	 * The API endpoint for wallets.
	 * @type {string}
	 */
	public endpoint: string = 'wallets';

	/**
	 * Returns the owner of the wallet.
	 *
	 * @returns {ModelUser} The user who owns this wallet.
	 */
	public get owner(): ModelUser {
		return this.hasOne('user', ModelUser);
	}
}
