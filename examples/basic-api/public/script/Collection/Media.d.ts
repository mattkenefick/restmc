import ModelMedia from '../Model/Media';
import CollectionCore from './Core';
export default class Media extends CollectionCore<ModelMedia> {
    model: ModelMedia;
    get images(): ModelMedia[];
    get primary(): ModelMedia | undefined;
    get videos(): ModelMedia[];
}
