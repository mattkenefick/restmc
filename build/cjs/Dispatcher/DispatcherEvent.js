"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DispatcherEvent {
    constructor(eventName, detail = {}) {
        this.callbacks = [];
        this.detail = detail;
        this.eventName = eventName;
    }
    clearCallbacks() {
        this.callbacks = [];
    }
    fire(detail) {
        const callbacks = this.callbacks.slice(0);
        let fires = 0;
        const event = {
            detail: Object.assign({}, this.detail, detail),
            name: this.eventName,
        };
        callbacks.forEach((callback) => {
            callback(event);
            fires++;
        });
        return fires;
    }
    hasCallback(callback) {
        return !!this.callbacks.find((value) => value === callback);
    }
    registerCallback(callback) {
        this.callbacks.push(callback);
    }
    unregisterCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
            return true;
        }
        return false;
    }
}
exports.default = DispatcherEvent;
//# sourceMappingURL=DispatcherEvent.js.map