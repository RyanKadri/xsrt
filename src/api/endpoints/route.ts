import { IRoute, Request, Router } from 'express';
import { IRouterHandler } from 'express-serve-static-core';
import { interfaces } from 'inversify';
import { MapTo } from '../../common/utils/type-utils';

export const implement = <T extends RouteDefinition>(definition: T, implementations: RouteImplementation<T>) => {
    return (router: Router) => {
        const route = router.route(definition.url);
        const definitions = [ 
            [ definition.get, route.get.bind(route), implementations.get ],
            [ definition.delete, route.delete.bind(route), implementations.delete ],
            [ definition.post, route.post.bind(route), implementations.post ],
            [ definition.put, route.put.bind(route), implementations.put ]
        ]
        definitions.forEach(defPair => {
            const definition = defPair[0] as UrlVerbDefinition | PayloadVerbDefinition;
            const route = defPair[1] as IRouterHandler<IRoute>;
            const implementation = defPair[2] as MethodImplementation<any, any>

            if(definition && implementation) {
                route(async (req, resp) => {
                    const injected = Object.entries(definition.request)
                        .reduce((acc, [ key, injector ]) => {
                            acc[key] = injector.read(req);
                            return acc;
                        }, {} as MapTo<any>)
                    
                    try {
                        const res = await implementation(injected);
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

export const createApi = () => {

}

export interface PayloadApiMethod<T extends PayloadVerbDefinition | UrlVerbDefinition> {
    (params: RequestParams<T>): Promise<RouteResponse<T["response"]["type"]>>
}

export type RequestParams<T extends PayloadVerbDefinition | UrlVerbDefinition> = 
    { [param in keyof T["request"]]: InjectedProp<T["request"][param]> }

export const defineRoute = <T extends RouteDefinition>(def: T) => def;

export interface TypePlaceholder<T> {
    type?: T
}

export const Type = <T>() : TypePlaceholder<T> => ({}) 

export type RouterSetupFn = (router: Router) => void;

export type RouteImplementation<T extends RouteDefinition> = {
    get?: MethodImplementation<T, "get">,
    delete?: MethodImplementation<T, "delete">,
    post?: MethodImplementation<T, "post">,
    put?: MethodImplementation<T, "put">,
    patch?: MethodImplementation<T, "patch">
}

export type MethodImplementation<T extends RouteDefinition & {[k in method]?: UrlVerbDefinition | PayloadVerbDefinition}, method extends keyof T> = 
    method extends undefined ? undefined : (opts: {
        [param in keyof NonNullable<T[method]>["request"]]: InjectedProp<NonNullable<T[method]>["request"][param]>
    }) => RouteResponse<NonNullable<T[method]>["response"]["type"]> | Promise<RouteResponse<NonNullable<T[method]>["response"]["type"]>>

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

export interface RouteDefinition {
    readonly url: string;
    get?: UrlVerbDefinition;
    delete?: UrlVerbDefinition;
    post?: PayloadVerbDefinition;
    put?: PayloadVerbDefinition;
    patch?: PayloadVerbDefinition;
}

export interface UrlVerbDefinition<T = any> { 
    request: MapTo<GetDeleteInjectionParam>;
    response: TypePlaceholder<T>
}

export interface PayloadVerbDefinition<T = any> { 
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