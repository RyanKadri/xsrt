import { SiteTarget } from "../../common/db/targets";
import { defineEndpoint, RequestBodyUnwrap, RouteParamUnwrap, Type } from "../../common/server/route-types";

const singleTargetUrl = "/targets/:targetId";
const multiTargetUrl = "/targets";
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
    }
});
