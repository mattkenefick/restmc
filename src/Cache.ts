import { ICachedItem } from './Interfaces';

/**
 * @author Matt Kenefick <matt@polymermallard.com>
 * @package RestMC
 * @project RestMC
 */
export default class Cache {
	/**
	 * @type Record<string, ICachedItem>
	 */
	private storage: Record<string, ICachedItem> = {};

	/**
	 * @param string key
	 * @return void
	 */
	public delete(key: string): void {
		if (this.storage[key]) {
			delete this.storage[key];
		}
	}

	/**
	 * Checks whether or not a cached item exists at all without
	 * regard to the TTL
	 *
	 * @param string key
	 * @return boolean
	 */
	public exists(key: string): boolean {
		return this.storage[key] !== undefined;
	}

	/**
	 * @param string key
	 * @param boolean keep
	 * @return any
	 */
	public get(key: string, keep: boolean = false): any {
		const item: ICachedItem = this.storage[key];
		let value: any;

		// Does item exist?
		if (!item) {
			value = undefined;
		}

		// Check if it's a 0 expiration (first-access)
		else if (item.ttl === 0) {
			value = item.value;

			// The .has() method calls .get() so we don't want to
			// destroy this object before we retrieve it
			!keep && this.delete(key);
		}

		// Check if it's healthy within the TTL
		else if (this.isHealthy(item)) {
			value = item.value;
		}

		return value;
	}

	/**
	 * Checks if we have a cached item within our TTL
	 *
	 * @param string key
	 * @return boolean
	 */
	public has(key: string): boolean {
		return this.get(key, true) !== undefined;
	}

	/**
	 * Returns false if trying to overwrite existing cache when
	 * overwrite is set to false
	 *
	 * @param string key
	 * @param any value
	 * @param number ttl
	 * @param boolean overwrite
	 * @return boolean
	 */
	public set(key: string, value: any, ttl: number = 0, immutable: boolean = false): boolean {
		const hasItem: boolean = this.has(key);
		const item: ICachedItem = this.storage[key];
		const time: number = Date.now();

		// Do not overwrite existing item
		if (hasItem && this.isImmutable(item)) {
			return false;
		}

		// Set cache
		this.storage[key] = {
			immutable,
			time,
			ttl,
			value,
		};

		return true;
	}

	/**
	 * @param ICachedItem item
	 * @return boolean
	 */
	private isHealthy(item: ICachedItem): boolean {
		const now: number = Date.now();
		const then: number = item.time;
		const ttl: number = item.ttl;

		return then + ttl > now;
	}

	/**
	 * @param ICachedItem item
	 * @return boolean
	 */
	private isImmutable(item: ICachedItem): boolean {
		return !!item?.immutable;
	}
}
