import { EndpointDefinition, InjectedProp, PayloadVerbDefinition, UrlVerbDefinition } from "../../../common/src";
import { Router } from "express";

export type RouterSetupFn = (router: Router) => void;

export type RouteImplementation<T extends EndpointDefinition> = {
    [ action in keyof T ]: MethodImplementation<T[action]>
};

export type MethodImplementation<Action extends (UrlVerbDefinition | PayloadVerbDefinition)> =
    (opts: {
        [param in keyof Action["request"]]: InjectedProp<Action["request"][param]>
    } & {
        [param in keyof Action["clientHeaders"]]: InjectedProp<Action["clientHeaders"][param]>
    }) => RouteResponse<Action["response"]["type"]> | Promise<RouteResponse<Action["response"]["type"]>>;

export type RouteResponse<C> = ExplicitResponse<C> | C;

export interface SuccessResponse<C> {
    type: "success";
    payload: C;
    headers?: ResponseHeader[];
}

export interface ErrorResponse {
    type: "error";
    code: number;
    message: string;
    headers: ResponseHeader[];
}

export interface BufferResponse {
    type: "buffer";
    data: Buffer;
    headers?: ResponseHeader[];
}

export class ExplicitResponse<C> {
    constructor(public response: SuccessResponse<C> | ErrorResponse | BufferResponse) {}
}

export interface ResponseHeader {
    name: string;
    value: string | string[];
}
