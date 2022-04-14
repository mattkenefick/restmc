import Collection from './Collection';
import Model from './Model';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package RestMC
 * @project RestMC
 */
export default class CollectionIterator<GenericModel extends Model> {
	/**
	 * @type number
	 */
	public static ITERATOR_VALUES = 0;

	/**
	 * @type number
	 */
	public static ITERATOR_KEYS = 1;

	/**
	 * @type number
	 */
	public static ITERATOR_KEYSVALUES = 2;

	/**
	 * @type number
	 */
	public index: number = 0;

	/**
	 * @type Collection<any>
	 */
	protected collection: Collection<GenericModel> | undefined;

	/**
	 * @type number
	 */
	protected kind: number = CollectionIterator.ITERATOR_VALUES;

	/**
	 * @param Collection collection
	 * @param number kind
	 */
	constructor(collection: Collection<GenericModel>, kind: number = 0) {
		this.collection = collection;
		this.index = 0;
		this.kind = kind;
	}

	/**
	 * @return object
	 */
	public next() {
		if (!this.collection) {
			return {
				done: true,
				value: void 0,
			};
		}

		// Only continue iterating if the iterated collection is long enough.
		if (this.index < this.collection.length) {
			let value;

			const model: GenericModel = this.collection.at(++this.index);

			// Return model as value
			if (this.kind === CollectionIterator.ITERATOR_VALUES) {
				value = model;
			}
			else {
				value
					= this.kind === CollectionIterator.ITERATOR_KEYS
						? (value = this.collection.modelId)
						: (value = [this.collection.modelId, model]);
			}

			return {
				done: false,
				value: value,
			};
		}

		// Once exhausted, remove the reference to the collection so future
		// calls to the next method always return done.
		this.collection = void 0;

		return {
			done: true,
			value: void 0,
		};
	}
}
