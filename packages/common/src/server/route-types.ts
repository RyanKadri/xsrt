import { Request, Router } from "express";
import { Interface, MapTo } from "../utils/type-utils";

export type EndpointApi<T extends EndpointDefinition> = {
    [action in keyof T]: PayloadApiMethod<T[action]>
};

export type PayloadApiMethod<T extends PayloadVerbDefinition | UrlVerbDefinition> =
    (params?: RequestParams<T>, clientOptions?: ApiMethodClientOptions ) => Promise<NonNullable<T["response"]["type"]>>;

export interface ApiMethodClientOptions {
    clientHeaders: MapTo<string>;
}

export type RequestParams<T extends PayloadVerbDefinition | UrlVerbDefinition> = {
    [param in keyof T["request"]]: InjectedProp<T["request"][param]>
};

export const defineEndpoint = <T extends EndpointDefinition>(def: T) => def;

export interface TypePlaceholder<T> {
    type?: T;
}

export const Type = <T>(): TypePlaceholder<T> => ({});

export type RouterSetupFn = (router: Router) => void;

export type RouteImplementation<T extends EndpointDefinition> = {
    [ action in keyof T ]: MethodImplementation<T[action]>
};

export type MethodImplementation<Action extends (UrlVerbDefinition | PayloadVerbDefinition)> =
    (opts: {
        [param in keyof Action["request"]]: InjectedProp<Action["request"][param]>
    }) => RouteResponse<Action["response"]["type"]> | Promise<RouteResponse<Action["response"]["type"]>>;

export type RouteResponse<C> = ExplicitResponse<C> | C;

export type InjectedProp<T> = T extends RequestUnwrapper<infer U> ? U
    : T extends symbol ? any : T;

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

export interface DownloadResponse {
    type: "download";
    data: any;
    headers?: ResponseHeader[];
}

export class ExplicitResponse<C> {
    constructor(public response: SuccessResponse<C> | ErrorResponse | DownloadResponse) {}
}

export interface ResponseHeader {
    name: string;
    value: string;
}

export interface EndpointDefinition {
    [ action: string ]: UrlVerbDefinition | PayloadVerbDefinition;
}

export interface UrlVerbDefinition<T = any> {
    method: "get" | "delete";
    url: string;
    request: MapTo<GetDeleteInjectionParam>;
    response: TypePlaceholder<T>;
}

export interface PayloadVerbDefinition<T = any> {
    method: "post" | "put" | "patch";
    url: string;
    request: MapTo<PostPutInjectionParam<any>>;
    response: TypePlaceholder<T>;
}

export type GetDeleteInjectionParam = DefaultInjectionParam | RequestParamUnwrap;
export type PostPutInjectionParam<T> = DefaultInjectionParam | RequestBodyUnwrap<T>;

type DefaultInjectionParam = RouteParamUnwrap | RequestHeader;

export class RequestBodyUnwrap<T> implements RequestUnwrapper<T> {
    readonly type = "body";
    read(request: Request) {
        return request.body as T;
    }
}

export class RouteParamUnwrap implements RequestUnwrapper<string> {
    readonly type = "route-param";

    constructor(
        private param: string
    ) {}

    read(request: Request): string {
        return request.params[this.param];
    }
}

export class RequestParamUnwrap implements RequestUnwrapper<string | undefined> {
    readonly type = "request-param";

    constructor(
        private param: string
    ) {}

    read(request: Request): string | undefined {
        return request.query[this.param];
    }
}

export class RequestHeader implements RequestUnwrapper<string | undefined> {
    readonly type = "header";

    constructor(
        private header: string
    ) {}

    read(request: Request) {
        return request.header(this.header);
    }
}

export interface RequestUnwrapper<T> {
    read(request: Interface<Request>): T;
}
