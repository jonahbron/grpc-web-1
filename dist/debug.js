"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debug() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (console.debug) {
        console.debug.apply(null, args);
    }
    else {
        console.log.apply(null, args);
    }
}
exports.debug = debug;
//# sourceMappingURL=debug.js.map