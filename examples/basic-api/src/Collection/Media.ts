import ModelMedia from '../Model/Media';
import CollectionCore from './Core';

/**
 * @class Media
 * @package Collection
 * @project ChalkySticks SDK Core
 */
export default class Media extends CollectionCore<ModelMedia> {
	/**
	 * @type ModelMedia
	 */
	public model: ModelMedia = new ModelMedia();

	/**
	 * @return ModelMedia[]
	 */
	public get images(): ModelMedia[] {
		return this.models.filter((media) => media.getType() === 'image');
	}

	/**
	 * @return ModelMedia | undefined
	 */
	public get primary(): ModelMedia | undefined {
		return this.models.at(0);
	}

	/**
	 * @return ModelMedia[]
	 */
	public get videos(): ModelMedia[] {
		return this.models.filter((media) => media.getType() === 'video');
	}
}
