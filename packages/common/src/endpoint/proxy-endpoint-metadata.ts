import { defineEndpoint, RouteParamUnwrap, Type } from "./types";

export const assetApiSymbol = Symbol("AssetApiSymbol");
export const assetEndpoint = defineEndpoint({
  fetchAsset: {
    url: "/api/proxy/:assetId",
    method: "get",
    request: {
      assetId: new RouteParamUnwrap("assetId")
    },
    response: Type<any>()
  }
});
