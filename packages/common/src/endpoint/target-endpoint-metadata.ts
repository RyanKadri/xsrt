import { SiteTarget } from "../types/types";
import { defineEndpoint, RequestBodyUnwrap, RouteParamUnwrap, Type } from "./types";

const singleTargetUrl = "/targets/:targetId";
const multiTargetUrl = "/targets";

export const siteTargetApiSymbol = Symbol("siteTargetApi");
export const siteTargetEndpoint = defineEndpoint({
    fetchSiteTarget: {
        method: "get",
        url: singleTargetUrl,
        request: {
            targetId: new RouteParamUnwrap("targetId"),
        },
        response: Type<SiteTarget>()
    },
    deleteSiteTarget: {
        method: "delete",
        url: singleTargetUrl,
        request: {
            targetId: new RouteParamUnwrap("targetId"),
        },
        response: Type<SiteTarget>()
    },
    filterTargets: {
        method: "get",
        url: multiTargetUrl,
        request: {},
        response: Type<SiteTarget[]>()
    },
    createSiteTarget: {
        method: "post",
        url: multiTargetUrl,
        request: {
            target: new RequestBodyUnwrap<Partial<SiteTarget>>()
        },
        response: Type<SiteTarget>()
    },
    updateSiteTarget: {
        method: "patch",
        url: singleTargetUrl,
        request: {
            targetId: new RouteParamUnwrap("targetId"),
            target: new RequestBodyUnwrap<Partial<SiteTarget>>()
        },
        response: Type<SiteTarget>()
    }
});
