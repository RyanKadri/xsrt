import { IServerConfig } from '../../common/server/express-server';
import { defineEndpoint, RequestBodyUnwrap, RequestHeader, RouteParamUnwrap, Type } from '../../common/server/route-types';

export const assetEndpoint = defineEndpoint({
    fetchAsset: {
        url: "/proxy/:assetId",
        method: "get",
        request: {
            assetId: new RouteParamUnwrap("assetId")
        },
        response: Type<any>()
    },
    createAsset: {
        url: '/proxy',
        method: "post",
        request: {
            proxyReq: new RequestBodyUnwrap<{urls: string[]}>(),
            userAgent: new RequestHeader("user-agent"),
            config: IServerConfig
        },
        response: Type<{ assets: string[]}>()
    }
});