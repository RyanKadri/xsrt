import { inject, injectable } from "inversify";
import { FetchSymbol } from "../di/di.tokens";
import { ApiConfig, ApiMethodClientOptions, EndpointDefinition, PayloadVerbDefinition, RequestParams, UrlVerbDefinition } from "../endpoint/types";
import { mapDictionary } from "../utils/functional-utils";
import { Interface } from "../utils/type-utils";
import { ApiRequestPartExtractor } from "./api-request-extractor";

@injectable()
export class ApiCreationService {

  constructor(
    @inject(FetchSymbol) private fetch: Window["fetch"],
    @inject(ApiRequestPartExtractor) private extractor: Interface<ApiRequestPartExtractor>
  ) { }

  createApi = <T extends EndpointDefinition>(endpointDef: T, apiConfig: ApiConfig) => {
    return mapDictionary(endpointDef, (actionDef: UrlVerbDefinition | PayloadVerbDefinition) =>
      this.apiFromActionDef.bind(undefined, actionDef, apiConfig)
    );
  }

  private apiFromActionDef = (
    actionDef: UrlVerbDefinition | PayloadVerbDefinition,
    apiConfig: ApiConfig,
    params: RequestParams<typeof actionDef> = {},
    options: ApiMethodClientOptions = { clientHeaders: {} }
  ) => {
    const requestMapping = actionDef.request;
    const query = this.extractor.extractQueryParams(requestMapping, params);
    const routeParam = this.extractor.extractRouteParams(requestMapping, params);
    const body = this.extractor.extractBody(requestMapping, params);
    const headers = {
      ...this.extractor.extractHeaders(requestMapping, params),
      ...options.clientHeaders
    };
    const url = this.replaceRouteParams(actionDef.url, routeParam, apiConfig);

    const queryParams = new URLSearchParams(query);
    if (actionDef.method === "get" || actionDef.method === "delete") {
      return this.fetch(url + "?" + queryParams, {
        method: actionDef.method,
        headers
      }).then(resp => resp.json());
    } else if (actionDef.method === "patch" || actionDef.method === "post" || actionDef.method === "put") {
      return this.fetch(url + "?" + queryParams, {
        method: actionDef.method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: typeof body === "string" ? body : JSON.stringify(body)
      }).then(resp => resp.json())
    } else {
      throw new Error("Something went wrong");
    }
  }

  private replaceRouteParams = (path: string, replacements: RequestParams<any>, apiConfig: ApiConfig) => {
    const baseUrl = apiConfig && apiConfig.baseUrl
      ? apiConfig.baseUrl
      : "";

    const initUrl = `${baseUrl}${path}`;
    return Object.entries(replacements)
      .reduce((acc, [key, val]) => {
        return acc.replace(new RegExp(`:${key}`, "g"), val);
      }, initUrl);
  }
}
