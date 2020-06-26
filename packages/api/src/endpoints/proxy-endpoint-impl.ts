import { assetEndpoint, GotSymbol } from "@xsrt/common";
import { Asset, downloadResponse, errorNotFound, IServerConfig, ProxiedAsset, RouteImplementation } from "@xsrt/common-backend";
import { Got } from "got";
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
        @inject(GotSymbol) private got: Got
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
            const resp = await this.got.get(url.href, {
                headers: { ["User-Agent"]: userAgent }, // Retrieve asset as requester's user agent
                responseType: "buffer"
            });

            const saveDir = join(this.config.assetDir, url.hostname);

            const res = await this.streamService.saveStream(resp.rawBody, saveDir, url);

            const headers = Object.entries(resp.headers as any)
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
