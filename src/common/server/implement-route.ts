import { Request, Response, Router } from "express";
import { ApiContainer } from "../../api/api-inversify";
import { MapTo } from "../utils/type-utils";
import { EndpointDefinition, ExplicitResponse, ResponseHeader, RouteImplementation } from "./route-types";

export const implement = <T extends EndpointDefinition>(endpointDef: T, implementations: RouteImplementation<T>) => {
    return (router: Router) => {
        const definitions = Object.entries(implementations);
        definitions.forEach(([key, impl]) => {
            const definition = endpointDef[key];
            const route = router[definition.method].bind(router);
            const implementation = impl;

            if (definition && implementation) {
                route(definition.url, async (req: Request, resp: Response) => {
                    try {
                    const injected = Object.entries(definition.request)
                        .reduce((acc, [ key, injector ]) => {
                            if (injector.read) {
                                acc[key] = injector.read(req);
                            } else {
                                acc[key] = ApiContainer.get(injector);
                            }
                            return acc;
                        }, {} as MapTo<any>);

                    const res = await implementation(injected as any);
                    if (res instanceof ExplicitResponse) {
                            const response = res.response;
                            if (response.headers) {
                                response.headers.forEach(({name, value}) => {
                                    resp.setHeader(name, value);
                                });
                            }
                            if (response.type === "success") {
                                resp.json(response.payload);
                            } else if (response.type === "error") {
                                resp.status(response.code).json({ error: response.message });
                            } else if (response.type === "download") {
                                resp.download(response.data);
                            }
                        } else {
                            resp.json(res);
                        }
                    } catch (e) {
                        resp.status(500).json({ error: e.message });
                    }
                });
            }
        });
    };
};

export const successResponse = <C>(payload: C, headers: ResponseHeader[] = []) => {
    return new ExplicitResponse({ type: "success", payload, headers });
};

export const errorResponse = (code: number, message: string, headers: ResponseHeader[] = []) => {
    return new ExplicitResponse<any>({ type: "error", code, message, headers });
};

export const errorNotFound = errorResponse.bind(undefined, 404);
export const errorInvalidCommand = errorResponse.bind(undefined, 400);

export const downloadResponse = (data: any, headers: ResponseHeader[]) => {
    return new ExplicitResponse<any>({ type: "download", data , headers });
};
