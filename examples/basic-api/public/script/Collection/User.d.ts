import Collection from './Core';
import ModelUser from '../Model/User';
export default class User extends Collection {
    endpoint: string;
    model: ModelUser;
}
