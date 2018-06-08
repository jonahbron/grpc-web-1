import { Metadata } from "../metadata";
import { MethodDefinition } from "../service";
import { ProtobufMessage } from "../message";
export interface Transport {
    sendMessage(msgBytes: Uint8Array): void;
    finishSend(): void;
    cancel(): void;
    start(metadata: Metadata): void;
}
export interface TransportConstructor {
    (options: TransportOptions): Transport | Error;
}
export interface TransportOptions {
    methodDefinition: MethodDefinition<ProtobufMessage, ProtobufMessage>;
    debug: boolean;
    url: string;
    onHeaders: (headers: Metadata, status: number) => void;
    onChunk: (chunkBytes: Uint8Array, flush?: boolean) => void;
    onEnd: (err?: Error) => void;
}
export declare function DefaultTransportFactory(transportOptions: TransportOptions): Transport | Error;
export declare function WebsocketTransportFactory(transportOptions: TransportOptions): Transport | Error;
