import Axios from 'axios';
import { EndpointApi, EndpointDefinition, PayloadVerbDefinition, RequestBodyUnwrap, RequestParams, RequestParamUnwrap, RouteParamUnwrap, UrlVerbDefinition } from './route-types';


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