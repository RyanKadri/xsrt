import { assetApiSymbol, assetEndpoint, EndpointApi } from "../../../common/src";
import { inject, injectable } from "inversify";
import { AssetFallbackService } from "./asset-fallback-service";

@injectable()
export class AssetResolver {

    constructor(
        @inject(assetApiSymbol) private assetApi: EndpointApi<typeof assetEndpoint>,
        private fallbackService: AssetFallbackService
    ) {}

    async resolveAssets(assets: string[]): Promise<string[]> {
        const res = await this.assetApi.createAsset({
            proxyReq: {
                urls: assets
            }
        });

        return Promise.all(
            res.assets.map((asset, i) =>
                asset !== null
                ? `/api/proxy/${asset}`
                : this.fallbackService.fallback(assets[i], assets[i])
            )
        );
    }
}
