import Model from './Core';
import ModelUser from './User';
export default class ModelWallet extends Model {
    endpoint: string;
    get owner(): ModelUser;
}
