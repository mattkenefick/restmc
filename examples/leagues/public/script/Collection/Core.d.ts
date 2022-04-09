import { Collection, IAttributes, Model } from 'restmc';
export default class CollectionCore<T extends Model> extends Collection<T> {
    baseUrl: string;
    options: IAttributes;
}
