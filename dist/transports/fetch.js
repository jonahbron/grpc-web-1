"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metadata_1 = require("../metadata");
var debug_1 = require("../debug");
var detach_1 = require("../detach");
function fetchRequest(options) {
    options.debug && debug_1.debug("fetchRequest", options);
    return new Fetch(options);
}
exports.default = fetchRequest;
var Fetch = (function () {
    function Fetch(transportOptions) {
        this.cancelled = false;
        this.controller = window.AbortController && new AbortController();
        this.options = transportOptions;
    }
    Fetch.prototype.pump = function (readerArg, res) {
        var _this = this;
        this.reader = readerArg;
        if (this.cancelled) {
            this.options.debug && debug_1.debug("Fetch.pump.cancel at first pump");
            this.reader.cancel();
            return;
        }
        this.reader.read()
            .then(function (result) {
            if (result.done) {
                detach_1.default(function () {
                    _this.options.onEnd();
                });
                return res;
            }
            detach_1.default(function () {
                _this.options.onChunk(result.value);
            });
            _this.pump(_this.reader, res);
            return;
        });
    };
    Fetch.prototype.send = function (msgBytes) {
        var _this = this;
        fetch(this.options.url, {
            headers: this.metadata.toHeaders(),
            method: "POST",
            body: msgBytes,
            credentials: "same-origin",
            signal: this.controller && this.controller.signal
        }).then(function (res) {
            _this.options.debug && debug_1.debug("Fetch.response", res);
            detach_1.default(function () {
                _this.options.onHeaders(new metadata_1.Metadata(res.headers), res.status);
            });
            if (res.body) {
                _this.pump(res.body.getReader(), res);
                return;
            }
            return res;
        }).catch(function (err) {
            if (_this.cancelled) {
                _this.options.debug && debug_1.debug("Fetch.catch - request cancelled");
                return;
            }
            _this.options.debug && debug_1.debug("Fetch.catch", err.message);
            detach_1.default(function () {
                _this.options.onEnd(err);
            });
        });
    };
    Fetch.prototype.sendMessage = function (msgBytes) {
        this.send(msgBytes);
    };
    Fetch.prototype.finishSend = function () {
    };
    Fetch.prototype.start = function (metadata) {
        this.metadata = metadata;
    };
    Fetch.prototype.cancel = function () {
        this.cancelled = true;
        if (this.reader) {
            this.options.debug && debug_1.debug("Fetch.abort.cancel");
            this.reader.cancel();
        }
        else {
            this.options.debug && debug_1.debug("Fetch.abort.cancel before reader");
        }
        if (this.controller) {
            this.controller.abort();
        }
    };
    return Fetch;
}());
function detectFetchSupport() {
    return typeof Response !== "undefined" && Response.prototype.hasOwnProperty("body") && typeof Headers === "function";
}
exports.detectFetchSupport = detectFetchSupport;
//# sourceMappingURL=fetch.js.map