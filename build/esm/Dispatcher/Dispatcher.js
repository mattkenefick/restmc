"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DispatcherEvent_1 = require("./DispatcherEvent");
class Dispatcher {
    constructor() {
        this.events = {};
    }
    dispatch(name, data = {}) {
        var _a;
        const event = this.events[name];
        const eventData = name === ((_a = data.event) === null || _a === void 0 ? void 0 : _a.name) && data.eventData ? data.eventData : data;
        if (event) {
            event.fire({
                event: { name },
                eventData: eventData,
                target: this,
            });
            return true;
        }
        return false;
    }
    hasEvent(eventName) {
        return !!this.events[eventName];
    }
    off(eventName, callback) {
        const event = this.events[eventName];
        if (event && !callback) {
            event.clearCallbacks();
            delete this.events[eventName];
        }
        else if (event && callback && event.callbacks.indexOf(callback) > -1) {
            event.unregisterCallback(callback);
            if (event.callbacks.length === 0) {
                delete this.events[eventName];
            }
        }
    }
    on(eventName, callback) {
        let event = this.events[eventName];
        if (!event) {
            event = new DispatcherEvent_1.default(eventName);
            this.events[eventName] = event;
        }
        event.registerCallback(callback);
    }
    trigger(eventName, eventData) {
        return this.dispatch(eventName, eventData);
    }
}
exports.default = Dispatcher;
//# sourceMappingURL=Dispatcher.js.map