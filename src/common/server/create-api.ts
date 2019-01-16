import Axios from "axios";
import { mapDictionary } from "../utils/functional-utils";
import { ApiMethodClientOptions, EndpointDefinition, GetDeleteInjectionParam, PayloadVerbDefinition, PostPutInjectionParam, RequestBodyUnwrap, RequestParams, UrlVerbDefinition } from "./route-types";

export const createApi = <T extends EndpointDefinition>(endpointDef: T) => {
    return mapDictionary(endpointDef, (actionDef: UrlVerbDefinition | PayloadVerbDefinition) =>
        apiFromActionDef.bind(undefined, actionDef)
    );
};

export const apiFromActionDef = (
    actionDef: UrlVerbDefinition | PayloadVerbDefinition,
    params: RequestParams<typeof actionDef> = {},
    options: ApiMethodClientOptions = { clientHeaders: {}}
) => {
    const query = extractQueryParams(actionDef, params);
    const routeParam = extractRouteParams(actionDef, params);
    const body = extractBody(actionDef, params);
    const headers = extractHeaders(actionDef, params, options);
    const url = replaceRouteParams(actionDef.url, routeParam);
    if (actionDef.method === "get" || actionDef.method === "delete") {
        const httpMethod = Axios[actionDef.method] as typeof Axios["get"];
        return httpMethod(url, { params: query, headers }).then(resp => resp.data);
    } else if (actionDef.method === "patch" || actionDef.method === "post" || actionDef.method === "put") {
        const httpMethod = Axios[actionDef.method] as typeof Axios["post"];
        return httpMethod(url, body, { headers }).then(resp => resp.data);
    } else {
        throw new Error("Something went wrong");
    }
};

const extractRequestPart = (
    actionDef: PayloadVerbDefinition | UrlVerbDefinition,
    params: RequestParams<typeof actionDef>,
    partType: (PostPutInjectionParam<any> | GetDeleteInjectionParam)["type"]
) => {
    return Object.entries(actionDef.request)
        .reduce((acc, [key, def]) => {
            if (def[key].type === partType) {
                acc[key] = params[key];
            }
            return acc;
        }, {} as RequestParams<any>);
};
const extractQueryParams = (actionDef: PayloadVerbDefinition | UrlVerbDefinition, params: RequestParams<any>) => {
    return extractRequestPart(actionDef, params, "request-param");
};

const extractRouteParams = (actionDef: PayloadVerbDefinition | UrlVerbDefinition, params: RequestParams<any>) => {
    return extractRequestPart(actionDef, params, "route-param");
};

const extractHeaders = (
    actionDef: PayloadVerbDefinition | UrlVerbDefinition, params: RequestParams<any>, options: ApiMethodClientOptions
) => {
    const requiredHeaders = extractRequestPart(actionDef, params, "header");
    return {
        ...requiredHeaders,
        ...options.clientHeaders
    };
};

const extractBody = (actionDef: PayloadVerbDefinition | UrlVerbDefinition, params: RequestParams<any>) => {
    const bodyKey = Object.keys(actionDef.request)
        .find(key => actionDef.request[key] instanceof RequestBodyUnwrap) || "";
    return params[bodyKey];
};

const replaceRouteParams = (url: string, replacements: RequestParams<any>) => {
    return Object.entries(replacements)
        .reduce((acc, [key, val]) => {
            return acc.replace(key, val);
        }, `/api/${url}`);
};
