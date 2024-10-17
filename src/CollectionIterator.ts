import Collection from './Collection.js';
import Model from './Model.js';

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
	 * @type function
	 */
	protected filter!: (model: GenericModel, index: number) => boolean;

	/**
	 * @constructor
	 * @param Collection collection
	 * @param number kind
	 * @param any filter
	 */
	constructor(
		collection: Collection<GenericModel>,
		kind: number = 0,
		filter: (model: GenericModel, index: number) => boolean = (model: GenericModel) => true
	) {
		this.collection = collection;
		this.index = 0;
		this.kind = kind;
		this.filter = filter;
	}

	/**
	 * @return object
	 */
	public next(filter?: (model: GenericModel, index: number) => boolean): IteratorResult<any> {
		const iteratorFilter = filter || this.filter;

		while (this.collection && this.index < this.collection.length) {
			const model = this.collection.at(this.index);
			this.index++;

			if (iteratorFilter(model, this.index - 1)) {
				return {
					done: false,
					value: this.getValue(model),
				};
			}
		}

		return {
			done: true,
			value: undefined,
		};
	}

	/**
	 * @param function filter
	 * @return IteratorResult<any>
	 */
	public previous(filter?: (model: GenericModel, index: number) => boolean): IteratorResult<any> {
		const iteratorFilter = filter || this.filter;

		while (this.collection && this.index > 0) {
			this.index--;
			const model = this.collection.at(this.index);

			if (iteratorFilter(model, this.index)) {
				return {
					done: false,
					value: this.getValue(model),
				};
			}
		}

		return {
			done: true,
			value: undefined,
		};
	}

	/**
	 * @return IteratorResult<any>
	 */
	public current(): IteratorResult<any> {
		if (this.collection && this.index > 0 && this.index <= this.collection.length) {
			const model = this.collection.at(this.index - 1);

			if (this.filter(model, this.index - 1)) {
				return {
					done: false,
					value: this.getValue(model),
				};
			}
		}

		return {
			done: true,
			value: undefined,
		};
	}

	/**
	 * @param GenericModel model
	 * @return any
	 */
	private getValue(model: GenericModel): any {
		if (this.kind === CollectionIterator.ITERATOR_VALUES) {
			return model;
		} else if (this.kind === CollectionIterator.ITERATOR_KEYS) {
			return this.collection!.modelId;
		} else {
			return [this.collection!.modelId, model];
		}
	}

	/**
	 * @return this
	 */
	[Symbol.iterator](): any {
		return this;
	}
}
