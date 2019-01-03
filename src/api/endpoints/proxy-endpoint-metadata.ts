import { IServerConfig } from '../../common/server/express-server';
import { defineRoute, RequestBodyUnwrap, RequestHeader, RouteParamUnwrap } from './route';

export const multiAssetRoute = defineRoute({
    url: '/proxy',
    post: {
        request: {
            proxyReq: new RequestBodyUnwrap<{urls: string[]}>(),
            userAgent: new RequestHeader("user-agent"),
            config: IServerConfig
        }
    }
});

export const singleAssetRoute = defineRoute({
    url: "/proxy/:assetId",
    get: {
        request: {
            assetId: new RouteParamUnwrap("assetId")
        }
    }
})