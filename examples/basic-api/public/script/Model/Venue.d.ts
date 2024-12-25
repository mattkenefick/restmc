import Model from './Core';
import CollectionMedia from '../Collection/Media';
export default class ModelVenue extends Model {
    endpoint: string;
    get media(): CollectionMedia;
    getAddress(): string;
    getName(): string;
    getWebsite(): string;
}
