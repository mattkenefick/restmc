import Model from './Core';
export default class ModelVenue extends Model {
    endpoint: string;
    getAddress(): string;
    getName(): string;
    getWebsite(): string;
}
