"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metadata_1 = require("../metadata");
var debug_1 = require("../debug");
var detach_1 = require("../detach");
var xhrUtil_1 = require("./xhrUtil");
function mozXhrRequest(options) {
    options.debug && debug_1.debug("mozXhrRequest", options);
    return new MozXHR(options);
}
exports.default = mozXhrRequest;
var MozXHR = (function () {
    function MozXHR(transportOptions) {
        this.options = transportOptions;
    }
    MozXHR.prototype.onProgressEvent = function () {
        var _this = this;
        var resp = this.xhr.response;
        this.options.debug && debug_1.debug("MozXHR.onProgressEvent: ", new Uint8Array(resp));
        detach_1.default(function () {
            _this.options.onChunk(new Uint8Array(resp));
        });
    };
    MozXHR.prototype.onLoadEvent = function () {
        var _this = this;
        this.options.debug && debug_1.debug("MozXHR.onLoadEvent");
        detach_1.default(function () {
            _this.options.onEnd();
        });
    };
    MozXHR.prototype.onStateChange = function () {
        var _this = this;
        this.options.debug && debug_1.debug("MozXHR.onStateChange", this.xhr.readyState);
        this.options.debug && debug_1.debug("MozXHR.XMLHttpRequest.HEADERS_RECEIVED", XMLHttpRequest.HEADERS_RECEIVED);
        if (this.xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            detach_1.default(function () {
                _this.options.onHeaders(new metadata_1.Metadata(_this.xhr.getAllResponseHeaders()), _this.xhr.status);
            });
        }
    };
    MozXHR.prototype.sendMessage = function (msgBytes) {
        this.options.debug && debug_1.debug("MozXHR.sendMessage");
        this.xhr.send(msgBytes);
    };
    MozXHR.prototype.finishSend = function () {
    };
    MozXHR.prototype.start = function (metadata) {
        var _this = this;
        this.options.debug && debug_1.debug("MozXHR.start");
        this.metadata = metadata;
        var xhr = new XMLHttpRequest();
        this.xhr = xhr;
        xhr.open("POST", this.options.url);
        xhr.responseType = "moz-chunked-arraybuffer";
        this.metadata.forEach(function (key, values) {
            xhr.setRequestHeader(key, values.join(", "));
        });
        xhr.addEventListener("readystatechange", this.onStateChange.bind(this));
        xhr.addEventListener("progress", this.onProgressEvent.bind(this));
        xhr.addEventListener("loadend", this.onLoadEvent.bind(this));
        xhr.addEventListener("error", function (err) {
            _this.options.debug && debug_1.debug("MozXHR.error", err);
            detach_1.default(function () {
                _this.options.onEnd(err.error);
            });
        });
    };
    MozXHR.prototype.cancel = function () {
        this.options.debug && debug_1.debug("MozXHR.cancel");
        this.xhr.abort();
    };
    return MozXHR;
}());
function detectMozXHRSupport() {
    return typeof XMLHttpRequest !== "undefined" && xhrUtil_1.xhrSupportsResponseType("moz-chunked-arraybuffer");
}
exports.detectMozXHRSupport = detectMozXHRSupport;
//# sourceMappingURL=mozXhr.js.map