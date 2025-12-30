"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compactObjectHash = void 0;
function stableStringify(input) {
    if (input === null || typeof input !== 'object') {
        return JSON.stringify(input);
    }
    if (Array.isArray(input)) {
        return `[${input.map(stableStringify).join(',')}]`;
    }
    const keys = Object.keys(input).sort();
    const result = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(input[key])}`);
    return `{${result.join(',')}}`;
}
function hashString(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    const bytes = new Uint8Array(4);
    bytes[0] = (hash >> 24) & 0xff;
    bytes[1] = (hash >> 16) & 0xff;
    bytes[2] = (hash >> 8) & 0xff;
    bytes[3] = hash & 0xff;
    return bytesToBase64Url(bytes);
}
function bytesToBase64Url(bytes) {
    const base64 = bytesToBase64(bytes);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function bytesToBase64(bytes) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < bytes.length; i += 3) {
        const triplet = (bytes[i] << 16) |
            ((i + 1 < bytes.length ? bytes[i + 1] : 0) << 8) |
            (i + 2 < bytes.length ? bytes[i + 2] : 0);
        for (let j = 0; j < 4; j++) {
            if (i * 8 + j * 6 >= bytes.length * 8) {
                result += '=';
            }
            else {
                const index = (triplet >> (6 * (3 - j))) & 0x3f;
                result += chars[index];
            }
        }
    }
    return result;
}
function compactObjectHash(obj) {
    const stableString = stableStringify(obj);
    return hashString(stableString);
}
exports.compactObjectHash = compactObjectHash;
//# sourceMappingURL=Utility.js.map