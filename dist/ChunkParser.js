"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metadata_1 = require("./metadata");
var HEADER_SIZE = 5;
var isAllowedControlChars = function (char) { return char === 0x9 || char === 0xa || char === 0xd; };
function isValidHeaderAscii(val) {
    return isAllowedControlChars(val) || (val >= 0x20 && val <= 0x7e);
}
function decodeASCII(input) {
    for (var i = 0; i !== input.length; ++i) {
        if (!isValidHeaderAscii(input[i])) {
            throw new Error("Metadata is not valid (printable) ASCII");
        }
    }
    return String.fromCharCode.apply(String, Array.prototype.slice.call(input));
}
exports.decodeASCII = decodeASCII;
function encodeASCII(input) {
    var encoded = new Uint8Array(input.length);
    for (var i = 0; i !== input.length; ++i) {
        var charCode = input.charCodeAt(i);
        if (!isValidHeaderAscii(charCode)) {
            throw new Error("Metadata contains invalid ASCII");
        }
        encoded[i] = charCode;
    }
    return encoded;
}
exports.encodeASCII = encodeASCII;
function isTrailerHeader(headerView) {
    return (headerView.getUint8(0) & 0x80) === 0x80;
}
function parseTrailerData(msgData) {
    return new metadata_1.Metadata(decodeASCII(msgData));
}
function readLengthFromHeader(headerView) {
    return headerView.getUint32(1, false);
}
function hasEnoughBytes(buffer, position, byteCount) {
    return buffer.byteLength - position >= byteCount;
}
function sliceUint8Array(buffer, from, to) {
    if (buffer.slice) {
        return buffer.slice(from, to);
    }
    var end = buffer.length;
    if (to !== undefined) {
        end = to;
    }
    var num = end - from;
    var array = new Uint8Array(num);
    var arrayIndex = 0;
    for (var i = from; i < end; i++) {
        array[arrayIndex++] = buffer[i];
    }
    return array;
}
var ChunkType;
(function (ChunkType) {
    ChunkType[ChunkType["MESSAGE"] = 1] = "MESSAGE";
    ChunkType[ChunkType["TRAILERS"] = 2] = "TRAILERS";
})(ChunkType = exports.ChunkType || (exports.ChunkType = {}));
var ChunkParser = (function () {
    function ChunkParser() {
        this.buffer = null;
        this.position = 0;
    }
    ChunkParser.prototype.parse = function (bytes, flush) {
        if (bytes.length === 0 && flush) {
            return [];
        }
        var chunkData = [];
        if (this.buffer == null) {
            this.buffer = bytes;
            this.position = 0;
        }
        else if (this.position === this.buffer.byteLength) {
            this.buffer = bytes;
            this.position = 0;
        }
        else {
            var remaining = this.buffer.byteLength - this.position;
            var newBuf = new Uint8Array(remaining + bytes.byteLength);
            var fromExisting = sliceUint8Array(this.buffer, this.position);
            newBuf.set(fromExisting, 0);
            var latestDataBuf = new Uint8Array(bytes);
            newBuf.set(latestDataBuf, remaining);
            this.buffer = newBuf;
            this.position = 0;
        }
        while (true) {
            if (!hasEnoughBytes(this.buffer, this.position, HEADER_SIZE)) {
                return chunkData;
            }
            var headerBuffer = sliceUint8Array(this.buffer, this.position, this.position + HEADER_SIZE);
            var headerView = new DataView(headerBuffer.buffer, headerBuffer.byteOffset, headerBuffer.byteLength);
            var msgLength = readLengthFromHeader(headerView);
            if (!hasEnoughBytes(this.buffer, this.position, HEADER_SIZE + msgLength)) {
                return chunkData;
            }
            var messageData = sliceUint8Array(this.buffer, this.position + HEADER_SIZE, this.position + HEADER_SIZE + msgLength);
            this.position += HEADER_SIZE + msgLength;
            if (isTrailerHeader(headerView)) {
                chunkData.push({ chunkType: ChunkType.TRAILERS, trailers: parseTrailerData(messageData) });
                return chunkData;
            }
            else {
                chunkData.push({ chunkType: ChunkType.MESSAGE, data: messageData });
            }
        }
    };
    return ChunkParser;
}());
exports.ChunkParser = ChunkParser;
//# sourceMappingURL=ChunkParser.js.map