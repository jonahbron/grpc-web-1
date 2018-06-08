"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metadata_1 = require("./metadata");
var client_1 = require("./client");
function unary(methodDescriptor, props) {
    if (methodDescriptor.responseStream) {
        throw new Error(".unary cannot be used with server-streaming methods. Use .invoke or .client instead.");
    }
    if (methodDescriptor.requestStream) {
        throw new Error(".unary cannot be used with client-streaming methods. Use .client instead.");
    }
    var responseHeaders = null;
    var responseMessage = null;
    var grpcClient = client_1.client(methodDescriptor, {
        host: props.host,
        transport: props.transport,
        debug: props.debug,
    });
    grpcClient.onHeaders(function (headers) {
        responseHeaders = headers;
    });
    grpcClient.onMessage(function (res) {
        responseMessage = res;
    });
    grpcClient.onEnd(function (status, statusMessage, trailers) {
        props.onEnd({
            status: status,
            statusMessage: statusMessage,
            headers: responseHeaders ? responseHeaders : new metadata_1.Metadata(),
            message: responseMessage,
            trailers: trailers
        });
    });
    grpcClient.start(props.metadata);
    grpcClient.send(props.request);
    return {
        close: function () {
            grpcClient.close();
        }
    };
}
exports.unary = unary;
//# sourceMappingURL=unary.js.map