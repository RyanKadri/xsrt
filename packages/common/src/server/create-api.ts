import { AxiosStatic } from "axios";
import { inject, injectable } from "inversify";
import { ScraperConfig, ScraperConfigToken } from "../config/scraper-config";
import { AxiosSymbol } from "../di/di.tokens";
import { mapDictionary } from "../utils/functional-utils";
import { Interface } from "../utils/type-utils";
import { ApiRequestPartExtractor } from "./api-request-extractor";
import { ApiMethodClientOptions, EndpointDefinition, PayloadVerbDefinition, RequestParams, UrlVerbDefinition } from "./route-types";

@injectable()
export class ApiCreationService {

    constructor(
        @inject(AxiosSymbol) private Axios: Interface<AxiosStatic>,
        @inject(ApiRequestPartExtractor) private extractor: Interface<ApiRequestPartExtractor>,
        @inject(ScraperConfigToken) private config: Pick<ScraperConfig, "backendUrl">
    ) {}

    createApi = <T extends EndpointDefinition>(endpointDef: T) => {
        return mapDictionary(endpointDef, (actionDef: UrlVerbDefinition | PayloadVerbDefinition) =>
            this.apiFromActionDef.bind(undefined, actionDef)
        );
    }

    private apiFromActionDef = (
        actionDef: UrlVerbDefinition | PayloadVerbDefinition,
        params: RequestParams<typeof actionDef> = {},
        options: ApiMethodClientOptions = { clientHeaders: {}}
    ) => {
        const requestMapping = actionDef.request;
        const query = this.extractor.extractQueryParams(requestMapping, params);
        const routeParam = this.extractor.extractRouteParams(requestMapping, params);
        const body = this.extractor.extractBody(requestMapping, params);
        const headers = {
            ...this.extractor.extractHeaders(requestMapping, params),
            ...options.clientHeaders
        };
        const url = this.replaceRouteParams(actionDef.url, routeParam);
        if (actionDef.method === "get" || actionDef.method === "delete") {
            const httpMethod = this.Axios[actionDef.method] as AxiosStatic["get"];
            return httpMethod(url, { params: query, headers }).then(resp => resp.data);
        } else if (actionDef.method === "patch" || actionDef.method === "post" || actionDef.method === "put") {
            const httpMethod = this.Axios[actionDef.method] as AxiosStatic["post"];
            return httpMethod(url, body, { headers }).then(resp => resp.data);
        } else {
            throw new Error("Something went wrong");
        }
    }

    private replaceRouteParams = (url: string, replacements: RequestParams<any>) => {
        return Object.entries(replacements)
            .reduce((acc, [key, val]) => {
                return acc.replace(new RegExp(`:${key}`, "g"), val);
            }, `${this.config.backendUrl || ""}/api${url}`);
    }
}
