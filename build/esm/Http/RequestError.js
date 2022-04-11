"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestError extends Error {
    constructor(status, text) {
        super(text);
        this.status = status;
        this.text = text;
    }
}
exports.default = RequestError;
//# sourceMappingURL=RequestError.js.map