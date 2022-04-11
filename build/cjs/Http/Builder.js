"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Builder {
    constructor(activeRecord) {
        this.id = '';
        this.includes = [];
        this.includeJoinBy = ',';
        this.includeKey = 'include';
        this.queryParams = {};
        this.activeRecord = activeRecord;
    }
    getUrl() {
        var _a, _b, _c;
        const baseUrl = this.getBaseUrl();
        const endpoint = this.getEndpoint();
        const queryParamStr = this.getQueryParamsAsString();
        const isModified = this.activeRecord.isUsingModifiedEndpoint();
        const modifiedBefore = isModified && this.activeRecord.modifiedEndpointPosition == 'before';
        const modifiedAfter = isModified && this.activeRecord.modifiedEndpointPosition == 'after';
        let urlBuilder = '';
        urlBuilder += baseUrl;
        urlBuilder += endpoint[0] === '/' ? endpoint : '/' + endpoint;
        if (isModified && modifiedAfter && ((_a = this.activeRecord) === null || _a === void 0 ? void 0 : _a.getReferencedEndpoint())) {
            urlBuilder += '/' + ((_c = (_b = this.activeRecord) === null || _b === void 0 ? void 0 : _b.getReferencedEndpoint()) === null || _c === void 0 ? void 0 : _c.id) || '';
        }
        else if (this.id !== '') {
            urlBuilder += '/' + this.id;
        }
        else if (!modifiedAfter && this.activeRecord.id !== '') {
            urlBuilder += '/' + this.activeRecord.id;
        }
        if (queryParamStr) {
            urlBuilder += '?' + queryParamStr;
        }
        urlBuilder = urlBuilder.replace(/([a-zA-Z0-9])\/\//g, '$1/');
        return urlBuilder;
    }
    getBaseUrl() {
        return this.activeRecord.baseUrl;
    }
    getEndpoint() {
        return this.activeRecord.isUsingModifiedEndpoint()
            ? this.activeRecord.getModifiedEndpoint()
            : this.activeRecord.getEndpoint();
    }
    getQueryParamsAsString() {
        let str = '';
        Object.entries(this.queryParams)
            .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
            .forEach((entry, index) => {
            const key = entry[0];
            const value = (entry[1] || '') + '';
            if (value != null && value != '') {
                str += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }
        });
        if (this.includeKey && this.includes.length) {
            str += '&' + this.includeKey + '=' + this.includes.join(this.includeJoinBy);
        }
        str = str.replace(/^&/, '');
        return str;
    }
    identifier(id) {
        this.id = id.toString();
        return this;
    }
    include(value) {
        this.includes.push(value);
        return this;
    }
    queryParam(key, value) {
        this.queryParams[key] = value;
        return this;
    }
    qp(key, value) {
        return this.queryParam(key, value);
    }
}
exports.default = Builder;
//# sourceMappingURL=Builder.js.map