"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xhr;
function getXHR() {
    if (xhr !== undefined)
        return xhr;
    if (XMLHttpRequest) {
        xhr = new XMLHttpRequest();
        try {
            xhr.open("GET", "https://localhost");
        }
        catch (e) { }
    }
    return xhr;
}
function xhrSupportsResponseType(type) {
    var xhr = getXHR();
    if (!xhr) {
        return false;
    }
    try {
        xhr.responseType = type;
        return xhr.responseType === type;
    }
    catch (e) { }
    return false;
}
exports.xhrSupportsResponseType = xhrSupportsResponseType;
//# sourceMappingURL=xhrUtil.js.map