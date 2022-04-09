import Model from './Core';
import ModelImage from './Image';
export default class ModelLeague extends Model {
    endpoint: string;
    get logo(): ModelImage;
    getAbbreviation(): string;
    getName(): string;
    getSlug(): string;
}
