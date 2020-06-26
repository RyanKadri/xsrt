import { Interface, MapTo } from "../utils/type-utils";

// TODO - Figure out request typings. Can we avoid importing express?
export const defineEndpoint = <T extends EndpointDefinition>(def: T) => def;

export class RequestBodyUnwrap<T> implements RequestUnwrapper<T> {
    readonly type = "body";
    read(request: any) {
        return request.body as T;
    }
}

export type RequestParams<T extends PayloadVerbDefinition | UrlVerbDefinition> = {
    [param in keyof T["request"]]: InjectedProp<T["request"][param]>
};

export type InjectedProp<T> = T extends RequestUnwrapper<infer U> ? U
    : T extends symbol ? any : T;

export class RouteParamUnwrap implements RequestUnwrapper<string> {
    readonly type = "route-param";

    constructor(
        private param: string
    ) {}

    read(request: any): string {
        return request.params[this.param];
    }
}

export class RequestParamUnwrap implements RequestUnwrapper<string | undefined> {
    readonly type = "request-param";

    constructor(
        private param: string
    ) {}

    read(request: any): string | undefined {
        return request.query[this.param];
    }
}

export class RequestHeader implements RequestUnwrapper<string | undefined> {
    readonly type = "header";

    constructor(
        private header: string
    ) {}

    read(request: any): string | undefined {
        return request.header(this.header);
    }
}

export interface RequestUnwrapper<T> {
    read(request: Interface<any>): T;
}

export const Type = <T>(): TypePlaceholder<T> => ({});

export interface TypePlaceholder<T> {
    type?: T;
}

export interface EndpointDefinition {
    [ action: string ]: UrlVerbDefinition | PayloadVerbDefinition;
}

export interface ApiConfig {
  baseUrl: string;
}

export interface UrlVerbDefinition<T = any> {
    method: "get" | "delete";
    url: string;
    request: MapTo<GetDeleteInjectionParam>;
    clientHeaders?: MapTo<RequestHeader>;
    response: TypePlaceholder<T>;
}

export interface PayloadVerbDefinition<T = any> {
    method: "post" | "put" | "patch";
    url: string;
    request: MapTo<PostPutInjectionParam<any>>;
    clientHeaders?: MapTo<RequestHeader>;
    response: TypePlaceholder<T>;
}

export type GetDeleteInjectionParam = DefaultInjectionParam | RequestParamUnwrap;
export type PostPutInjectionParam<T> = DefaultInjectionParam | RequestBodyUnwrap<T>;

type DefaultInjectionParam = RouteParamUnwrap | RequestHeader;

export interface ApiMethodClientOptions {
    clientHeaders: MapTo<string>;
}

export type InjectionParamMap = MapTo<GetDeleteInjectionParam> | MapTo<PostPutInjectionParam<any>>;

export type EndpointApi<T extends EndpointDefinition> = {
    [action in keyof T]: PayloadApiMethod<T[action]>
};

export type PayloadApiMethod<T extends PayloadVerbDefinition | UrlVerbDefinition> =
    (params?: RequestParams<T>, clientOptions?: ApiMethodClientOptions ) => Promise<NonNullable<T["response"]["type"]>>;
