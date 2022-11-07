export default class Cache {
    private storage;
    delete(key: string): void;
    get(key: string, keep?: boolean): any;
    exists(key: string): boolean;
    has(key: string): boolean;
    set(key: string, value: any, ttl?: number, immutable?: boolean): boolean;
    private isCachedItemHealthy;
    private isImmutable;
}
