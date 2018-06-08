"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var https = require("https");
var url = require("url");
var metadata_1 = require("../metadata");
function nodeHttpRequest(options) {
    options.debug && console.log("nodeHttpRequest", options);
    return new NodeHttp(options);
}
exports.default = nodeHttpRequest;
var NodeHttp = (function () {
    function NodeHttp(transportOptions) {
        this.options = transportOptions;
    }
    NodeHttp.prototype.sendMessage = function (msgBytes) {
        this.request.write(toBuffer(msgBytes));
        this.request.end();
    };
    NodeHttp.prototype.finishSend = function () {
    };
    NodeHttp.prototype.responseCallback = function (response) {
        var _this = this;
        this.options.debug && console.log("NodeHttp.response", response.statusCode);
        var headers = filterHeadersForUndefined(response.headers);
        this.options.onHeaders(new metadata_1.Metadata(headers), response.statusCode);
        response.on("data", function (chunk) {
            _this.options.debug && console.log("NodeHttp.data", chunk);
            _this.options.onChunk(toArrayBuffer(chunk));
        });
        response.on("end", function () {
            _this.options.debug && console.log("NodeHttp.end");
            _this.options.onEnd();
        });
    };
    ;
    NodeHttp.prototype.start = function (metadata) {
        var _this = this;
        var headers = {};
        metadata.forEach(function (key, values) {
            headers[key] = values.join(", ");
        });
        var parsedUrl = url.parse(this.options.url);
        var httpOptions = {
            host: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port) : undefined,
            path: parsedUrl.path,
            headers: headers,
            method: "POST"
        };
        if (parsedUrl.protocol === "https:") {
            this.request = https.request(httpOptions, this.responseCallback.bind(this));
        }
        else {
            this.request = http.request(httpOptions, this.responseCallback.bind(this));
        }
        this.request.on("error", function (err) {
            _this.options.debug && console.log("NodeHttp.error", err);
            _this.options.onEnd(err);
        });
    };
    NodeHttp.prototype.cancel = function () {
        this.options.debug && console.log("NodeHttp.abort");
        this.request.abort();
    };
    return NodeHttp;
}());
function filterHeadersForUndefined(headers) {
    var filteredHeaders = {};
    for (var key in headers) {
        var value = headers[key];
        if (headers.hasOwnProperty(key)) {
            if (value !== undefined) {
                filteredHeaders[key] = value;
            }
        }
    }
    return filteredHeaders;
}
function toArrayBuffer(buf) {
    var view = new Uint8Array(buf.length);
    for (var i = 0; i < buf.length; i++) {
        view[i] = buf[i];
    }
    return view;
}
function toBuffer(ab) {
    var buf = new Buffer(ab.byteLength);
    for (var i = 0; i < buf.length; i++) {
        buf[i] = ab[i];
    }
    return buf;
}
function detectNodeHTTPSupport() {
    return typeof module !== "undefined" && module.exports;
}
exports.detectNodeHTTPSupport = detectNodeHTTPSupport;
//# sourceMappingURL=nodeHttp.js.map