"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Dispatcher_js_1 = __importDefault(require("./Dispatcher/Dispatcher.js"));
class Core extends Dispatcher_js_1.default {
    constructor(options = {}) {
        super();
        Object.assign(this, options);
    }
}
exports.default = Core;
//# sourceMappingURL=Core.js.map