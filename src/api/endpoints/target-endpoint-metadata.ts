import { SiteTarget } from '../../common/db/targets';
import { defineRoute, RequestBodyUnwrap, RouteParamUnwrap, Type } from './route';

export const singleTargetMetadata = defineRoute({
    url: '/targets/:targetId',
    get: {
        request: {
            targetId: new RouteParamUnwrap("targetId"),
        },
        response: Type<SiteTarget>()
    },
    delete: {
        request: {
            targetId: new RouteParamUnwrap("targetId"),
        },
        response: Type<SiteTarget>()
    }
});

export const mutliTargetMetadata = defineRoute({
    url: "/targets",
    get: {
        request: {},
        response: Type<SiteTarget[]>()
    },
    post: {
        request: {
            target: new RequestBodyUnwrap<Partial<SiteTarget>>()
        },
        response: Type<SiteTarget>()
    }
})