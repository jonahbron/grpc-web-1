import { Code } from "./Code";
import { TransportConstructor } from "./transports/Transport";
import { MethodDefinition } from "./service";
import { Metadata } from "./metadata";
import { ProtobufMessage } from "./message";
export interface Request {
    close: () => void;
}
export interface InvokeRpcOptions<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> {
    host: string;
    request: TRequest;
    metadata?: Metadata.ConstructorArg;
    onHeaders?: (headers: Metadata) => void;
    onMessage?: (res: TResponse) => void;
    onEnd: (code: Code, message: string, trailers: Metadata) => void;
    transport?: TransportConstructor;
    debug?: boolean;
}
export declare function invoke<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage, M extends MethodDefinition<TRequest, TResponse>>(methodDescriptor: M, props: InvokeRpcOptions<TRequest, TResponse>): Request;
