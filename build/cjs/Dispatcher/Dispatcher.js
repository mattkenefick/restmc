"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DispatcherEvent_js_1 = require("./DispatcherEvent.js");
class Dispatcher {
    constructor() {
        this.events = {};
    }
    dispatch(name, detail = {}) {
        const event = this.events[name];
        if (event) {
            event.fire(detail);
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
            event = new DispatcherEvent_js_1.default(eventName, {});
            this.events[eventName] = event;
        }
        event.registerCallback(callback);
    }
    once(eventName, callback) {
        const onceCallback = (event) => {
            callback(event);
            this.off(eventName, onceCallback);
        };
        this.on(eventName, onceCallback);
    }
    trigger(eventName, detail = {}) {
        return this.dispatch(eventName, detail);
    }
}
exports.default = Dispatcher;
//# sourceMappingURL=Dispatcher.js.map