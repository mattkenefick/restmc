import CollectionCore from './Core';
import ModelVenue from '../Model/Venue';
export default class CollectionVenue extends CollectionCore<ModelVenue> {
    endpoint: string;
    model: ModelVenue;
}
