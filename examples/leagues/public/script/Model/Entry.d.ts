import Model from './Core';
export default class ModelEntry extends Model {
    endpoint: string;
    getCategory(): string;
    getDescription(): string;
    getLink(): string;
    isHttps(): boolean;
}
