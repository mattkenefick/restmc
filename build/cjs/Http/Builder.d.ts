import ActiveRecord from '../ActiveRecord';
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
    getQueryParamsAsString(): string;
    identifier(id: string | number): Builder<T>;
    include(value: string): Builder<T>;
    queryParam(key: string, value: number | string): Builder<T>;
    qp(key: string, value: number | string): Builder<T>;
}
