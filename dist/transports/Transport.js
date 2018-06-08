"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetch_1 = require("./fetch");
var xhr_1 = require("./xhr");
var mozXhr_1 = require("./mozXhr");
var websocket_1 = require("./websocket");
var selectedTransport;
function DefaultTransportFactory(transportOptions) {
    if (transportOptions.methodDefinition.requestStream) {
        return new Error("No transport available for client-streaming (requestStream) method");
    }
    if (!selectedTransport) {
        selectedTransport = detectTransport();
    }
    return selectedTransport(transportOptions);
}
exports.DefaultTransportFactory = DefaultTransportFactory;
function detectTransport() {
    if (fetch_1.detectFetchSupport()) {
        return fetch_1.default;
    }
    if (mozXhr_1.detectMozXHRSupport()) {
        return mozXhr_1.default;
    }
    if (xhr_1.detectXHRSupport()) {
        return xhr_1.default;
    }
    throw new Error("No suitable transport found for gRPC-Web.  If running in " +
        "Node, import and set the `transport` option to nodeHttpRequest");
}
function WebsocketTransportFactory(transportOptions) {
    return websocket_1.default(transportOptions);
}
exports.WebsocketTransportFactory = WebsocketTransportFactory;
//# sourceMappingURL=Transport.js.map