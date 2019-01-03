import { IRoute, Request, Router } from 'express';
import { IRouterHandler } from 'express-serve-static-core';
import { interfaces } from 'inversify';
import { MapTo } from '../../common/utils/type-utils';

export const implement = <C, T extends RouteDefinition>(definition: T, implementations: RouteImplementation<C, T>) => {
    return (router: Router) => {
        const route = router.route(definition.url);
        const definitions = [ 
            [ definition.get, route.get.bind(route), implementations.get ],
            [ definition.delete, route.delete.bind(route), implementations.delete ],
            [ definition.post, route.post.bind(route), implementations.post ],
            [ definition.put, route.put.bind(route), implementations.put ]
        ]
        definitions.forEach(defPair => {
            const definition = defPair[0] as GetDeleteVerbDefinition | PostPutVerbDefinition;
            const route = defPair[1] as IRouterHandler<IRoute>;
            const implementation = defPair[2] as MethodImplementation<any, any, any>

            if(definition && implementation) {
                route(async (req, resp) => {
                    const injected = Object.entries(definition.request)
                        .reduce((acc, [ key, injector ]) => {
                            acc[key] = injector.read(req);
                            return acc;
                        }, {} as MapTo<any>)
                    const res = await implementation(injected);
                    if(res.headers) {
                        res.headers.forEach(({name, value}) => {
                            resp.setHeader(name, value);
                        })
                    }
                    if(res instanceof SuccessResponse) {
                        resp.json(res.payload);
                    } else if(res instanceof ErrorResponse){
                        resp.status(res.code).json({ error: res.message })
                    } else {
                        resp.download(res.data);
                    }
                })
            }
        })
    }
}

export const defineRoute = <T extends RouteDefinition>(def: T) => def;

export type RouterSetupFn = (router: Router) => void;

export type RouteImplementation<C, T extends RouteDefinition> = {
    get?: MethodImplementation<C, T, "get">,
    delete?: MethodImplementation<C, T, "delete">,
    post?: MethodImplementation<C, T, "post">,
    put?: MethodImplementation<C, T, "put">
}

export type MethodImplementation<C, T extends RouteDefinition & {[k in method]: GetDeleteVerbDefinition | PostPutVerbDefinition}, method extends keyof T> = 
    T[method] extends undefined ? undefined : (opts: {
        [param in keyof NonNullable<T[method]>["request"]]: InjectedProp<NonNullable<T[method]>["request"][param]>
    }) => RouteResponse<C> | Promise<RouteResponse<C>>

export type RouteResponse<C> = SuccessResponse<C> | ErrorResponse | DownloadResponse;

export type InjectedProp<T> = T extends RequestUnwrapper<infer U> ? U
    : T extends symbol ? any : T

export class SuccessResponse<C> {
    constructor(
        public payload: C,
        public headers?: ResponseHeader[]
    ) { }
}

export class ErrorResponse {
    constructor(
        public code: number,
        public message: string,
        public headers?: ResponseHeader[]
    ) { }
}

export class DownloadResponse {
    constructor(
        public data: any,
        public headers?: ResponseHeader[]
    ){ }
}

export interface ResponseHeader {
    name: string;
    value: string;
}

export interface RouteDefinition {
    readonly url: string;
    get?: GetDeleteVerbDefinition;
    delete?: GetDeleteVerbDefinition;
    post?: PostPutVerbDefinition;
    put?: PostPutVerbDefinition;
}

export interface GetDeleteVerbDefinition { 
    request: MapTo<GetDeleteInjectionParam>
}

export interface PostPutVerbDefinition { 
    request: MapTo<PostPutInjectionParam<any>>
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

    read(request: Request) {
        return request.params[this.param];
    }
}

export class RequestParamUnwrap implements RequestUnwrapper<string | undefined> {
    readonly type = 'request-param';

    constructor(
        private param: string
    ) {}

    read(request: Request) {
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