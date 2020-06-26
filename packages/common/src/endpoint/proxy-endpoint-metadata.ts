import { defineEndpoint, RequestBodyUnwrap, RequestHeader, RouteParamUnwrap, Type } from "./types";

export const assetApiSymbol = Symbol("AssetApiSymbol");
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
    url: "/proxy",
    method: "post",
    request: {
      proxyReq: new RequestBodyUnwrap<{ urls: string[] }>(),
    },
    clientHeaders: {
      userAgent: new RequestHeader("user-agent")
    },
    response: Type<{ assets: (string | null)[] }>()
  }
});
