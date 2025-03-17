import Model from './Core';
import ModelWallet from './Wallet';
export default class ModelUser extends Model {
    endpoint: string;
    get wallet(): ModelWallet;
}
