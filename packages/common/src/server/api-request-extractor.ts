import { injectable } from "inversify";
import { MapTo } from "../utils/type-utils";
import { GetDeleteInjectionParam, PostPutInjectionParam, RequestParams } from "./route-types";

@injectable()
export class ApiRequestPartExtractor {

    extractQueryParams(paramMapping: InjectionParamMap, params: RequestParams<any>) {
        return this.extractRequestPart(paramMapping, params, "request-param");
    }

    extractRouteParams(paramMapping: InjectionParamMap, params: RequestParams<any>) {
        return this.extractRequestPart(paramMapping, params, "route-param");
    }

    extractHeaders(paramMapping: InjectionParamMap, params: RequestParams<any>) {
        return this.extractRequestPart(paramMapping, params, "header");
    }

    extractBody(paramMapping: InjectionParamMap, params: RequestParams<any>) {
        const bodyKey = Object.keys(paramMapping)
            .find(key => paramMapping[key].type === "body") || "";
        return params[bodyKey];
    }

    private extractRequestPart(
        paramMapping: InjectionParamMap,
        params: RequestParams<any>,
        partType: (PostPutInjectionParam<any> | GetDeleteInjectionParam)["type"]
    ) {
        return Object.entries(paramMapping)
            .reduce((acc, [key, def]) => {
                if (def.type === partType) {
                    acc[key] = params[key];
                }
                return acc;
            }, {} as RequestParams<any>);
    }

}

export type InjectionParamMap = MapTo<GetDeleteInjectionParam> | MapTo<PostPutInjectionParam<any>>;
