import { BrowserHeaders } from "browser-headers";
import * as impTransport from "./transports/Transport";
import * as impCode from "./Code";
import * as impInvoke from "./invoke";
import * as impUnary from "./unary";
import * as impClient from "./client";
import * as impService from "./service";
import * as impMessage from "./message";
export declare namespace grpc {
    interface ProtobufMessageClass<T extends ProtobufMessage> extends impMessage.ProtobufMessageClass<T> {
    }
    interface ProtobufMessage extends impMessage.ProtobufMessage {
    }
    interface Transport extends impTransport.Transport {
    }
    interface TransportOptions extends impTransport.TransportOptions {
    }
    interface TransportConstructor extends impTransport.TransportConstructor {
    }
    const DefaultTransportFactory: typeof impTransport.DefaultTransportFactory;
    const WebsocketTransportFactory: typeof impTransport.WebsocketTransportFactory;
    interface UnaryMethodDefinition<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> extends impService.UnaryMethodDefinition<TRequest, TResponse> {
    }
    interface MethodDefinition<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> extends impService.MethodDefinition<TRequest, TResponse> {
    }
    interface ServiceDefinition extends impService.ServiceDefinition {
    }
    export import Code = impCode.Code;
    export import Metadata = BrowserHeaders;
    interface Client<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> extends impClient.Client<TRequest, TResponse> {
    }
    function client<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage, M extends MethodDefinition<TRequest, TResponse>>(methodDescriptor: M, props: ClientRpcOptions): Client<TRequest, TResponse>;
    interface ClientRpcOptions extends impClient.ClientRpcOptions {
    }
    const invoke: typeof impInvoke.invoke;
    interface Request extends impInvoke.Request {
    }
    interface InvokeRpcOptions<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> extends impInvoke.InvokeRpcOptions<TRequest, TResponse> {
    }
    const unary: typeof impUnary.unary;
    interface UnaryOutput<TResponse extends ProtobufMessage> extends impUnary.UnaryOutput<TResponse> {
    }
    interface UnaryRpcOptions<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> extends impUnary.UnaryRpcOptions<TRequest, TResponse> {
    }
}
