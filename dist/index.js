"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var browser_headers_1 = require("browser-headers");
var impTransport = require("./transports/Transport");
var impCode = require("./Code");
var impInvoke = require("./invoke");
var impUnary = require("./unary");
var impClient = require("./client");
var grpc;
(function (grpc) {
    grpc.DefaultTransportFactory = impTransport.DefaultTransportFactory;
    grpc.WebsocketTransportFactory = impTransport.WebsocketTransportFactory;
    grpc.Code = impCode.Code;
    grpc.Metadata = browser_headers_1.BrowserHeaders;
    function client(methodDescriptor, props) {
        return impClient.client(methodDescriptor, props);
    }
    grpc.client = client;
    grpc.invoke = impInvoke.invoke;
    grpc.unary = impUnary.unary;
})(grpc = exports.grpc || (exports.grpc = {}));
//# sourceMappingURL=index.js.map