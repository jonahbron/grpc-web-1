"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metadata_1 = require("../metadata");
var debug_1 = require("../debug");
var detach_1 = require("../detach");
function xhrRequest(options) {
    options.debug && debug_1.debug("xhrRequest", options);
    return new XHR(options);
}
exports.default = xhrRequest;
var XHR = (function () {
    function XHR(transportOptions) {
        this.options = transportOptions;
    }
    XHR.prototype.onProgressEvent = function () {
        var _this = this;
        this.options.debug && debug_1.debug("XHR.onProgressEvent.length: ", this.xhr.response.length);
        var rawText = this.xhr.response.substr(this.index);
        this.index = this.xhr.response.length;
        var asArrayBuffer = stringToArrayBuffer(rawText);
        detach_1.default(function () {
            _this.options.onChunk(asArrayBuffer);
        });
    };
    XHR.prototype.onLoadEvent = function () {
        var _this = this;
        this.options.debug && debug_1.debug("XHR.onLoadEvent");
        detach_1.default(function () {
            _this.options.onEnd();
        });
    };
    XHR.prototype.onStateChange = function () {
        var _this = this;
        this.options.debug && debug_1.debug("XHR.onStateChange", this.xhr.readyState);
        if (this.xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            detach_1.default(function () {
                _this.options.onHeaders(new metadata_1.Metadata(_this.xhr.getAllResponseHeaders()), _this.xhr.status);
            });
        }
    };
    XHR.prototype.sendMessage = function (msgBytes) {
        this.xhr.send(msgBytes);
    };
    XHR.prototype.finishSend = function () {
    };
    XHR.prototype.start = function (metadata) {
        var _this = this;
        this.metadata = metadata;
        var xhr = new XMLHttpRequest();
        this.xhr = xhr;
        xhr.open("POST", this.options.url);
        xhr.responseType = "text";
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
        this.metadata.forEach(function (key, values) {
            xhr.setRequestHeader(key, values.join(", "));
        });
        xhr.addEventListener("readystatechange", this.onStateChange.bind(this));
        xhr.addEventListener("progress", this.onProgressEvent.bind(this));
        xhr.addEventListener("loadend", this.onLoadEvent.bind(this));
        xhr.addEventListener("error", function (err) {
            _this.options.debug && debug_1.debug("XHR.error", err);
            detach_1.default(function () {
                _this.options.onEnd(err.error);
            });
        });
    };
    XHR.prototype.cancel = function () {
        this.options.debug && debug_1.debug("XHR.abort");
        this.xhr.abort();
    };
    return XHR;
}());
function codePointAtPolyfill(str, index) {
    var code = str.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
        var surr = str.charCodeAt(index + 1);
        if (surr >= 0xdc00 && surr <= 0xdfff) {
            code = 0x10000 + ((code - 0xd800) << 10) + (surr - 0xdc00);
        }
    }
    return code;
}
function stringToArrayBuffer(str) {
    var asArray = new Uint8Array(str.length);
    var arrayIndex = 0;
    for (var i = 0; i < str.length; i++) {
        var codePoint = String.prototype.codePointAt ? str.codePointAt(i) : codePointAtPolyfill(str, i);
        asArray[arrayIndex++] = codePoint & 0xFF;
    }
    return asArray;
}
exports.stringToArrayBuffer = stringToArrayBuffer;
function detectXHRSupport() {
    return typeof XMLHttpRequest !== "undefined" && XMLHttpRequest.prototype.hasOwnProperty("overrideMimeType");
}
exports.detectXHRSupport = detectXHRSupport;
//# sourceMappingURL=xhr.js.map