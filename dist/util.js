"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function frameRequest(request) {
    var bytes = request.serializeBinary();
    var frame = new ArrayBuffer(bytes.byteLength + 5);
    new DataView(frame, 1, 4).setUint32(0, bytes.length, false);
    new Uint8Array(frame, 5).set(bytes);
    return new Uint8Array(frame);
}
exports.frameRequest = frameRequest;
//# sourceMappingURL=util.js.map