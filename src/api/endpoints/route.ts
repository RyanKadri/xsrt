import Axios from 'axios';
import { Request, Response, Router } from 'express';
import { interfaces } from 'inversify';
import { MapTo } from '../../common/utils/type-utils';

export const implement = <T extends EndpointDefinition>(endpointDef: T, implementations: RouteImplementation<T>) => {
    return (router: Router) => {
        const definitions = Object.entries(implementations)
        definitions.forEach(([key, impl]) => {
            const definition = endpointDef[key];
            const route = router[definition.method].bind(router);
            const implementation = impl;

            if(definition && implementation) {
                route(definition.url, async (req: Request, resp: Response) => {
                    const injected = Object.entries(definition.request)
                        .reduce((acc, [ key, injector ]) => {
                            acc[key] = injector.read(req);
                            return acc;
                        }, {} as MapTo<any>)
                    
                    try {
                        const res = await implementation(injected as any);
                        if(res instanceof ExplicitResponse) {
                            const response = res.response;
                            if(response.headers) {
                                response.headers.forEach(({name, value}) => {
                                    resp.setHeader(name, value);
                                })
                            }
                            if(response.type === 'success') {
                                resp.json(response.payload);
                            } else if(response.type === 'error'){
                                resp.status(response.code).json({ error: response.message })
                            } else if(response.type === 'download') {
                                resp.download(response.data);
                            }
                        } else {
                            resp.json(res);
                        }
                    } catch(e) {
                        resp.status(500).json({ error: e.message })
                    }
                })
            }
        })
    }
}

export const createApi = <T extends EndpointDefinition>(endpointDef: T) => {
    return Object.entries(endpointDef)
        .reduce((acc, [action, actionDef]) => {
            acc[action] = (params: RequestParams<typeof actionDef> = {}) => {
                const query = extractQueryParams(actionDef, params);
                const routeParam = extractRouteParams(actionDef, params);
                const body = extractBody(actionDef, params);
                const url = replaceRouteParams(actionDef.url, routeParam);
                if(actionDef.method === 'get' || actionDef.method === 'delete') {
                    const httpMethod = Axios[actionDef.method] as typeof Axios["get"];
                    return httpMethod(url, { params: query }).then(resp => resp.data)
                } else if(actionDef.method === 'patch' || actionDef.method === 'post' || actionDef.method === 'put') {
                    const httpMethod = Axios[actionDef.method] as typeof Axios["post"];
                    return httpMethod(url, body).then(resp => resp.data)
                } else {
                    throw new Error("Something went wrong");
                }
            };
            return acc;
        }, {} as EndpointApi<T>)
}

const extractQueryParams = (actionDef: PayloadVerbDefinition | UrlVerbDefinition, params: RequestParams<any>) => {
    return Object.entries(actionDef.request)
        .reduce((acc, [key, def]) => {
            if(def[key] instanceof RequestParamUnwrap) {
                acc[key] = params[key]
            }
            return acc;
        }, {} as RequestParams<any>)
}

const extractRouteParams = (actionDef: PayloadVerbDefinition | UrlVerbDefinition, params: RequestParams<any>) => {
    return Object.entries(actionDef.request)
        .reduce((acc, [key, def]) => {
            if(def[key] instanceof RouteParamUnwrap) {
                acc[key] = params[key]
            }
            return acc;
        }, {} as RequestParams<any>)
}

const extractBody = (actionDef: PayloadVerbDefinition | UrlVerbDefinition, params: RequestParams<any>) => {
    const bodyKey = Object.keys(actionDef.request)
        .find(key => actionDef.request[key] instanceof RequestBodyUnwrap) || ""
    return params[bodyKey];
}

const replaceRouteParams = (url: string, replacements: RequestParams<any>) => {
    return Object.entries(replacements)
        .reduce((acc, [key, val]) => {
            return acc.replace(key, val);
        }, `/api/${url}`)
}

export type EndpointApi<T extends EndpointDefinition> = {
    [action in keyof T]: PayloadApiMethod<T[action]>
}

export interface PayloadApiMethod<T extends PayloadVerbDefinition | UrlVerbDefinition> {
    (params?: RequestParams<T>): Promise<NonNullable<T["response"]["type"]>>
}

export type RequestParams<T extends PayloadVerbDefinition | UrlVerbDefinition> = 
    { [param in keyof T["request"]]: InjectedProp<T["request"][param]> }

export const defineEndpoint = <T extends EndpointDefinition>(def: T) => def;

export interface TypePlaceholder<T> {
    type?: T
}

export const Type = <T>() : TypePlaceholder<T> => ({}) 

export type RouterSetupFn = (router: Router) => void;

export type RouteImplementation<T extends EndpointDefinition> = {
    [ action in keyof T ]: MethodImplementation<T[action]>
}

export type MethodImplementation<Action extends (UrlVerbDefinition | PayloadVerbDefinition)> = 
    (opts: {
        [param in keyof Action["request"]]: InjectedProp<Action["request"][param]>
    }) => RouteResponse<Action["response"]["type"]> | Promise<RouteResponse<Action["response"]["type"]>>

export type RouteResponse<C> = ExplicitResponse<C> | C;

export type InjectedProp<T> = T extends RequestUnwrapper<infer U> ? U
    : T extends symbol ? any : T


export interface SuccessResponse<C> {
    type: 'success';
    payload: C;
    headers?: ResponseHeader[];
}

export interface ErrorResponse {
    type: 'error';
    code: number;
    message: string;
    headers: ResponseHeader[]
}

export interface DownloadResponse {
    type: 'download'
    data: any,
    headers?: ResponseHeader[]
}

class ExplicitResponse<C> {
    constructor(public response: SuccessResponse<C> | ErrorResponse | DownloadResponse) {}
} 

export const successResponse = <C>(payload: C, headers: ResponseHeader[] = []) => {
    return new ExplicitResponse({ type: 'success', payload, headers })
}

export const errorResponse = (code: number, message: string, headers: ResponseHeader[] = []) => {
    return new ExplicitResponse<any>({ type: 'error', code, message, headers });
}

export const errorNotFound = errorResponse.bind(undefined, 404);
export const errorInvalidCommand = errorResponse.bind(undefined, 400);

export const downloadResponse = (data: any, headers: ResponseHeader[]) => {
    return new ExplicitResponse<any>({ type: 'download', data , headers })
}

export interface ResponseHeader {
    name: string;
    value: string;
}

export interface EndpointDefinition {
    [ action: string ] : UrlVerbDefinition | PayloadVerbDefinition
}

export interface UrlVerbDefinition<T = any> { 
    method: 'get' | 'delete';
    url: string
    request: MapTo<GetDeleteInjectionParam>;
    response: TypePlaceholder<T>
}

export interface PayloadVerbDefinition<T = any> { 
    method: 'post' | 'put' | 'patch';
    url: string;
    request: MapTo<PostPutInjectionParam<any>>;
    response: TypePlaceholder<T>
}

export type GetDeleteInjectionParam = RouteParamUnwrap | RequestParamUnwrap | RequestHeader | symbol | interfaces.Newable<any>;
export type PostPutInjectionParam<T> = RequestBodyUnwrap<T> | RouteParamUnwrap | RequestHeader | symbol | interfaces.Newable<any>;

export class RequestBodyUnwrap<T> implements RequestUnwrapper<T> {
    readonly type = 'body';
    read(request: Request) {
        return request.body as T;
    }
}

export class RouteParamUnwrap implements RequestUnwrapper<string> {
    readonly type = 'route-param';

    constructor(
        private param: string
    ) {}

    read(request: Request): string {
        return request.params[this.param];
    }
}

export class RequestParamUnwrap implements RequestUnwrapper<string | undefined> {
    readonly type = 'request-param';

    constructor(
        private param: string
    ) {}

    read(request: Request): string | undefined {
        return request.query[this.param];
    }
}

export class RequestHeader implements RequestUnwrapper<string | undefined> {
    readonly type = 'request-param';

    constructor(
        private header: string
    ) {}

    read(request: Request) {
        return request.header(this.header);
    }
}

interface RequestUnwrapper<T> {
    read(request: Request): T;
}