import { assetApiSymbol, assetEndpoint, EndpointApi } from "@xsrt/common";
import { inject, injectable } from "inversify";
import { AssetFallbackService } from "./asset-fallback-service";

@injectable()
export class AssetResolver {

    constructor(
        @inject(assetApiSymbol) private assetApi: EndpointApi<typeof assetEndpoint>,
        private fallbackService: AssetFallbackService
    ) {}

    async resolveAssets(assets: string[]): Promise<string[]> {
        const fullUrls = assets.map(asset => this.resolveFullRequestUrl(asset));
        const res = await this.assetApi.createAsset({
            proxyReq: {
                urls: fullUrls
            }
        });
        return Promise.all(
            res.assets.map((asset, i) =>
                asset !== null
                ? `/api/proxy/${asset}`
                : this.fallbackService.fallback(fullUrls[i], assets[i])
            )
        );
    }

    private resolveFullRequestUrl(forAsset: string) {
        const testLink = document.createElement("a");
        testLink.href = forAsset;
        return testLink.href;
    }
}
