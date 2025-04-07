"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJSONComprehensive = void 0;
function toJSONComprehensive(value, visited) {
    if (value === null || value === undefined || typeof value !== 'object') {
        return value;
    }
    if (!visited) {
        visited = new WeakSet();
    }
    if (visited.has(value)) {
        return '[Circular]';
    }
    visited.add(value);
    if (typeof value.toJSON === 'function') {
        const toJSONResult = value.toJSON();
        return toJSONComprehensive(toJSONResult, visited);
    }
    if (Array.isArray(value)) {
        return value.map((element) => toJSONComprehensive(element, visited));
    }
    const result = {};
    for (const [key, val] of Object.entries(value)) {
        result[key] = toJSONComprehensive(val, visited);
    }
    return result;
}
exports.toJSONComprehensive = toJSONComprehensive;
//# sourceMappingURL=Utility.js.map