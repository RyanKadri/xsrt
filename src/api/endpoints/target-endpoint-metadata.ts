import { SiteTarget } from '../../common/db/targets';
import { defineRoute, RequestBodyUnwrap, RouteParamUnwrap } from './route';

export const singleTargetMetadata = defineRoute({
    url: '/targets/:targetId',
    get: {
        request: {
            targetId: new RouteParamUnwrap("targetId"),
        }
    },
    delete: {
        request: {
            targetId: new RouteParamUnwrap("targetId")
        }
    }
});

export const mutliTargetMetadata = defineRoute({
    url: "/targets",
    get: {
        request: {}
    },
    post: {
        request: {
            target: new RequestBodyUnwrap<Partial<SiteTarget>>()
        }
    }
})