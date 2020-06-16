import { assetEndpoint, AxiosSymbol } from "@xsrt/common";
import { Asset, downloadResponse, errorNotFound, IServerConfig, ProxiedAsset, RouteImplementation } from "@xsrt/common-backend";
import { AxiosStatic } from "axios";
import { inject, injectable } from "inversify";
import { join } from "path";
import { ApiServerConfig } from "../api-server-conf";
import { AssetStreamService } from "../services/asset-stream-service";

type AssetEndpointType = RouteImplementation<typeof assetEndpoint>;

@injectable()
export class AssetEndpoint implements AssetEndpointType {

    constructor(
        @inject(IServerConfig) private config: ApiServerConfig,
        private streamService: AssetStreamService,
        @inject(AxiosSymbol) private axios: AxiosStatic
    ) { }

    fetchAsset: AssetEndpointType["fetchAsset"] = async ({ assetId }) => {
        const assetDoc = await Asset.findById(assetId);
        if (assetDoc) {
            const proxyAsset = assetDoc.toObject() as ProxiedAsset;
            return downloadResponse(proxyAsset.content, proxyAsset.headers);
        } else {
            return errorNotFound(`Could not find asset ${assetId}`);
        }
    }

    createAsset: AssetEndpointType["createAsset"] = async ({ proxyReq, userAgent }) => {
        const assets = await Promise.all(
            proxyReq.urls.map(url =>
                this.proxySingleAsset(new URL(url), userAgent)
            )
        );
        return {
            assets: assets.map(asset =>
                "error" in asset
                    ? null
                    : asset._id
            )
        };
    }

    private proxySingleAsset = async (url: URL, userAgent = "") => {
        try {
            const proxyRes = await this.axios.get(url.href, {
                responseType: "stream",
                headers: { ["User-Agent"]: userAgent } // Retrieve asset as requester's user agent
            });

            const saveDir = join(this.config.assetDir, url.hostname);

            const res = await this.streamService.saveStream(proxyRes.data, saveDir, url);

            const headers = Object.entries(proxyRes.headers)
                .map(([name, value]) => ({ name, value }));

            const asset = new Asset({
                url,
                hash: res.hash,
                headers,
                content: res.path
            });
            return asset.save();
        } catch (e) {
            return {
                error: true,
            };
        }
    }
}
