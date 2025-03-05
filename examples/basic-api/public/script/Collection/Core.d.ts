import { Collection, Model } from 'restmc';
export default class CollectionCore<T extends Model> extends Collection<T> {
    baseUrl: string;
    getBaseUrl(): string;
}
