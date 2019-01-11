import { Request, Response, Router } from "express";
import { interfaces } from "inversify";
import { ApiContainer } from "../../api/api-inversify";
import { MapTo } from "../utils/type-utils";
import { HttpResponseCodes } from "./http-codes";
import { EndpointDefinition, ExplicitResponse, ResponseHeader, RouteImplementation } from "./route-types";

export const implement = <T extends EndpointDefinition>(
    endpointDef: T, implementations: RouteImplementation<T> | interfaces.Newable<RouteImplementation<T>>
) => {
    return (router: Router) => {
        const concreteImpl: RouteImplementation<T> = typeof implementations === "function"
            ? ApiContainer.get(implementations)
            : implementations;
        const definitions = Object.entries(endpointDef);
        definitions.forEach(([action, definition]) => {
            const route = router[definition.method].bind(router);
            const implementation = concreteImpl[action];

            if (definition && implementation) {
                route(definition.url, async (req: Request, resp: Response) => {
                    try {
                    const injected = Object.entries(definition.request)
                        .reduce((acc, [ prop, injector ]) => {
                            if (injector.read) {
                                acc[prop] = injector.read(req);
                            } else {
                                acc[prop] = ApiContainer.get(injector);
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
                        resp
                            .status(HttpResponseCodes.INTERNAL_SERVER_ERROR)
                            .json({ error: e.message });
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

export const errorNotFound = errorResponse.bind(undefined, HttpResponseCodes.CONTENT_NOT_FOUND);
export const errorInvalidCommand = errorResponse.bind(undefined, HttpResponseCodes.INVALID_COMMAND);

export const downloadResponse = (data: any, headers: ResponseHeader[]) => {
    return new ExplicitResponse<any>({ type: "download", data , headers });
};
