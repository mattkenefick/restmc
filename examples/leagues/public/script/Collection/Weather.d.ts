import CollectionCore from './Core';
import ModelWeather from '../Model/Weather';
export default class CollectionUser extends CollectionCore<ModelWeather> {
    model: ModelWeather;
}
