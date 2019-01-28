import { assetApiSymbol, assetEndpoint, EndpointApi } from "@xsrt/common";
import { inject, injectable } from "inversify";
import { toDataUrl } from "../utils/dom-utils";

@injectable()
export class AssetResolver {

    constructor(
        @inject(assetApiSymbol) private assetApi: EndpointApi<typeof assetEndpoint>
    ) {}

    async resolveAssets(assets: string[]): Promise<string[]> {
        try {
            const res = await this.assetApi.createAsset({
                proxyReq: {
                    urls: assets.map(asset => this.resolveFullRequestUrl(asset))
                },
                userAgent: "temp",
            });
            return res.assets.map(asset => `/api/proxy/${asset}`);
        } catch (e) {
            // TODO - How do we want to handle the failing case? Falling back to old link is probably
            // not the best approach
            return Promise.all(
                assets.map(asset => fetch(asset)
                    .then(resp => resp.blob())
                    .then(blob => toDataUrl(blob))
                    .catch(() => asset)
                )
            );
        }
    }

    private resolveFullRequestUrl(forAsset: string) {
        const testLink = document.createElement("a");
        testLink.href = forAsset;
        return testLink.href;
    }
}
