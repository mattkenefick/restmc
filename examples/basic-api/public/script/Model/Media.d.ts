import Model from './Core';
export default class Media extends Model {
    endpoint: string;
    fields: string[];
    getGroup(): string;
    getSubgroup(): string;
    getType(): string;
    getUrl(): string;
    getCreatedAt(): string;
    getUpdatedAt(): string;
}
