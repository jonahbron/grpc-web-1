"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("./client");
function invoke(methodDescriptor, props) {
    if (methodDescriptor.requestStream) {
        throw new Error(".invoke cannot be used with client-streaming methods. Use .client instead.");
    }
    var grpcClient = client_1.client(methodDescriptor, {
        host: props.host,
        transport: props.transport,
        debug: props.debug,
    });
    if (props.onHeaders) {
        grpcClient.onHeaders(props.onHeaders);
    }
    if (props.onMessage) {
        grpcClient.onMessage(props.onMessage);
    }
    if (props.onEnd) {
        grpcClient.onEnd(props.onEnd);
    }
    grpcClient.start(props.metadata);
    grpcClient.send(props.request);
    return {
        close: function () {
            grpcClient.close();
        }
    };
}
exports.invoke = invoke;
//# sourceMappingURL=invoke.js.map