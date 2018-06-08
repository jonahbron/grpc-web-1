"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metadata_1 = require("./metadata");
var ChunkParser_1 = require("./ChunkParser");
var Code_1 = require("./Code");
var debug_1 = require("./debug");
var detach_1 = require("./detach");
var Transport_1 = require("./transports/Transport");
var util_1 = require("./util");
function client(methodDescriptor, props) {
    return new GrpcClient(methodDescriptor, props);
}
exports.client = client;
var GrpcClient = (function () {
    function GrpcClient(methodDescriptor, props) {
        this.started = false;
        this.sentFirstMessage = false;
        this.completed = false;
        this.closed = false;
        this.finishedSending = false;
        this.onHeadersCallbacks = [];
        this.onMessageCallbacks = [];
        this.onEndCallbacks = [];
        this.parser = new ChunkParser_1.ChunkParser();
        this.methodDefinition = methodDescriptor;
        this.props = props;
        this.createTransport();
    }
    GrpcClient.prototype.createTransport = function () {
        var url = this.props.host + "/" + this.methodDefinition.service.serviceName + "/" + this.methodDefinition.methodName;
        var transportOptions = {
            methodDefinition: this.methodDefinition,
            debug: this.props.debug || false,
            url: url,
            onHeaders: this.onTransportHeaders.bind(this),
            onChunk: this.onTransportChunk.bind(this),
            onEnd: this.onTransportEnd.bind(this),
        };
        var transportConstructor = this.props.transport;
        if (transportConstructor) {
            var constructedTransport = transportConstructor(transportOptions);
            if (constructedTransport instanceof Error) {
                throw constructedTransport;
            }
            this.transport = constructedTransport;
        }
        else {
            var factoryTransport = Transport_1.DefaultTransportFactory(transportOptions);
            if (factoryTransport instanceof Error) {
                throw factoryTransport;
            }
            this.transport = factoryTransport;
        }
    };
    GrpcClient.prototype.onTransportHeaders = function (headers, status) {
        this.props.debug && debug_1.debug("onHeaders", headers, status);
        if (this.closed) {
            this.props.debug && debug_1.debug("grpc.onHeaders received after request was closed - ignoring");
            return;
        }
        if (status === 0) {
        }
        else {
            this.responseHeaders = headers;
            this.props.debug && debug_1.debug("onHeaders.responseHeaders", JSON.stringify(this.responseHeaders, null, 2));
            var code = Code_1.httpStatusToCode(status);
            this.props.debug && debug_1.debug("onHeaders.code", code);
            var gRPCMessage = headers.get("grpc-message") || [];
            this.props.debug && debug_1.debug("onHeaders.gRPCMessage", gRPCMessage);
            if (code !== Code_1.Code.OK) {
                var statusMessage = this.decodeGRPCStatus(gRPCMessage[0]);
                this.rawOnError(code, statusMessage);
                return;
            }
            this.rawOnHeaders(headers);
        }
    };
    GrpcClient.prototype.onTransportChunk = function (chunkBytes) {
        var _this = this;
        if (this.closed) {
            this.props.debug && debug_1.debug("grpc.onChunk received after request was closed - ignoring");
            return;
        }
        var data = [];
        try {
            data = this.parser.parse(chunkBytes);
        }
        catch (e) {
            this.props.debug && debug_1.debug("onChunk.parsing error", e, e.message);
            this.rawOnError(Code_1.Code.Internal, "parsing error: " + e.message);
            return;
        }
        data.forEach(function (d) {
            if (d.chunkType === ChunkParser_1.ChunkType.MESSAGE) {
                var deserialized = _this.methodDefinition.responseType.deserializeBinary(d.data);
                _this.rawOnMessage(deserialized);
            }
            else if (d.chunkType === ChunkParser_1.ChunkType.TRAILERS) {
                if (!_this.responseHeaders) {
                    _this.responseHeaders = new metadata_1.Metadata(d.trailers);
                    _this.rawOnHeaders(_this.responseHeaders);
                }
                else {
                    _this.responseTrailers = new metadata_1.Metadata(d.trailers);
                    _this.props.debug && debug_1.debug("onChunk.trailers", _this.responseTrailers);
                }
            }
        });
    };
    GrpcClient.prototype.onTransportEnd = function () {
        this.props.debug && debug_1.debug("grpc.onEnd");
        if (this.closed) {
            this.props.debug && debug_1.debug("grpc.onEnd received after request was closed - ignoring");
            return;
        }
        if (this.responseTrailers === undefined) {
            if (this.responseHeaders === undefined) {
                this.rawOnError(Code_1.Code.Unknown, "Response closed without headers");
                return;
            }
            var grpcStatus_1 = getStatusFromHeaders(this.responseHeaders);
            var grpcMessage_1 = this.responseHeaders.get("grpc-message");
            this.props.debug && debug_1.debug("grpc.headers only response ", grpcStatus_1, grpcMessage_1);
            if (grpcStatus_1 === null) {
                this.rawOnEnd(Code_1.Code.Unknown, "Response closed without grpc-status (Headers only)", this.responseHeaders);
                return;
            }
            var statusMessage_1 = this.decodeGRPCStatus(grpcMessage_1[0]);
            this.rawOnEnd(grpcStatus_1, statusMessage_1, this.responseHeaders);
            return;
        }
        var grpcStatus = getStatusFromHeaders(this.responseTrailers);
        if (grpcStatus === null) {
            this.rawOnError(Code_1.Code.Internal, "Response closed without grpc-status (Trailers provided)");
            return;
        }
        var grpcMessage = this.responseTrailers.get("grpc-message");
        var statusMessage = this.decodeGRPCStatus(grpcMessage[0]);
        this.rawOnEnd(grpcStatus, statusMessage, this.responseTrailers);
    };
    GrpcClient.prototype.decodeGRPCStatus = function (src) {
        if (src) {
            try {
                return decodeURIComponent(src);
            }
            catch (err) {
                return src;
            }
        }
        else {
            return "";
        }
    };
    GrpcClient.prototype.rawOnEnd = function (code, message, trailers) {
        this.props.debug && debug_1.debug("rawOnEnd", code, message, trailers);
        if (this.completed)
            return;
        this.completed = true;
        this.onEndCallbacks.forEach(function (callback) {
            detach_1.default(function () {
                callback(code, message, trailers);
            });
        });
    };
    GrpcClient.prototype.rawOnHeaders = function (headers) {
        this.props.debug && debug_1.debug("rawOnHeaders", headers);
        if (this.completed)
            return;
        this.onHeadersCallbacks.forEach(function (callback) {
            detach_1.default(function () {
                callback(headers);
            });
        });
    };
    GrpcClient.prototype.rawOnError = function (code, msg) {
        this.props.debug && debug_1.debug("rawOnError", code, msg);
        if (this.completed)
            return;
        this.completed = true;
        this.onEndCallbacks.forEach(function (callback) {
            detach_1.default(function () {
                callback(code, msg, new metadata_1.Metadata());
            });
        });
    };
    GrpcClient.prototype.rawOnMessage = function (res) {
        this.props.debug && debug_1.debug("rawOnMessage", res.toObject());
        if (this.completed)
            return;
        this.onMessageCallbacks.forEach(function (callback) {
            detach_1.default(function () {
                callback(res);
            });
        });
    };
    GrpcClient.prototype.onHeaders = function (callback) {
        this.onHeadersCallbacks.push(callback);
    };
    GrpcClient.prototype.onMessage = function (callback) {
        this.onMessageCallbacks.push(callback);
    };
    GrpcClient.prototype.onEnd = function (callback) {
        this.onEndCallbacks.push(callback);
    };
    GrpcClient.prototype.start = function (metadata) {
        if (this.started) {
            throw new Error("Client already started - cannot .start()");
        }
        this.started = true;
        var requestHeaders = new metadata_1.Metadata(metadata ? metadata : {});
        requestHeaders.set("content-type", "application/grpc-web+proto");
        requestHeaders.set("x-grpc-web", "1");
        this.transport.start(requestHeaders);
    };
    GrpcClient.prototype.send = function (msg) {
        if (!this.started) {
            throw new Error("Client not started - .start() must be called before .send()");
        }
        if (this.closed) {
            throw new Error("Client already closed - cannot .send()");
        }
        if (this.finishedSending) {
            throw new Error("Client already finished sending - cannot .send()");
        }
        if (!this.methodDefinition.requestStream && this.sentFirstMessage) {
            throw new Error("Message already sent for non-client-streaming method - cannot .send()");
        }
        this.sentFirstMessage = true;
        var msgBytes = util_1.frameRequest(msg);
        this.transport.sendMessage(msgBytes);
    };
    GrpcClient.prototype.finishSend = function () {
        if (!this.started) {
            throw new Error("Client not started - .finishSend() must be called before .close()");
        }
        if (this.closed) {
            throw new Error("Client already closed - cannot .send()");
        }
        if (this.finishedSending) {
            throw new Error("Client already finished sending - cannot .finishSend()");
        }
        this.finishedSending = true;
        this.transport.finishSend();
    };
    GrpcClient.prototype.close = function () {
        if (!this.started) {
            throw new Error("Client not started - .start() must be called before .close()");
        }
        if (!this.closed) {
            this.closed = true;
            this.props.debug && debug_1.debug("request.abort aborting request");
            this.transport.cancel();
        }
        else {
            throw new Error("Client already closed - cannot .close()");
        }
    };
    return GrpcClient;
}());
function getStatusFromHeaders(headers) {
    var fromHeaders = headers.get("grpc-status") || [];
    if (fromHeaders.length > 0) {
        try {
            var asString = fromHeaders[0];
            return parseInt(asString, 10);
        }
        catch (e) {
            return null;
        }
    }
    return null;
}
//# sourceMappingURL=client.js.map