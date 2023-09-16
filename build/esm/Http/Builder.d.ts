import ActiveRecord from '../ActiveRecord.js';
export default class Builder<T> {
    id: string;
    includes: string[];
    includeJoinBy: string;
    includeKey: string;
    queryParams: any;
    protected activeRecord: ActiveRecord<T>;
    constructor(activeRecord: ActiveRecord<T>);
    getUrl(): string;
    getBaseUrl(): string;
    getEndpoint(): string;
    getQueryParam(key: string): string;
    getQueryParams(): any;
    getQueryParamsAsString(): string;
    identifier(id: string | number): Builder<T>;
    include(value: string): Builder<T>;
    queryParam(key: string, value: number | string): Builder<T>;
    qp(key: string, value: number | string): Builder<T>;
}
