import CollectionCore from './Core';
import ModelUser from '../Model/User';
export default class CollectionUser extends CollectionCore<ModelUser> {
    endpoint: string;
    model: ModelUser;
}
