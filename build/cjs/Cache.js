"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cache {
    constructor() {
        this.storage = {};
    }
    delete(key) {
        if (this.storage[key]) {
            delete this.storage[key];
        }
    }
    get(key, keep = false) {
        const item = this.storage[key];
        let value;
        if (!item) {
            value = undefined;
        }
        else if (item.ttl === 0) {
            value = item.value;
            !keep && this.delete(key);
        }
        else if (this.isCachedItemHealthy(item)) {
            value = item.value;
        }
        return value;
    }
    exists(key) {
        return this.storage[key] !== undefined;
    }
    has(key) {
        return this.get(key, true) !== undefined;
    }
    set(key, value, ttl = 0, immutable = false) {
        const hasItem = this.has(key);
        const time = Date.now();
        if (hasItem && this.isImmutable(key)) {
            return false;
        }
        this.storage[key] = {
            immutable,
            time,
            ttl,
            value,
        };
        return true;
    }
    isCachedItemHealthy(item) {
        const now = Date.now();
        const then = item.time;
        const ttl = item.ttl;
        return then + ttl > now;
    }
    isImmutable(key) {
        const item = this.storage[key];
        return !!(item === null || item === void 0 ? void 0 : item.immutable);
    }
}
exports.default = Cache;
//# sourceMappingURL=Cache.js.map