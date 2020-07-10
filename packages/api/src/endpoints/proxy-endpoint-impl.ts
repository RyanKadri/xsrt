import { assetEndpoint, GotSymbol, AssetEntity, DBConnectionSymbol } from "../../../common/src";
import { downloadResponse, errorNotFound, IServerConfig, RouteImplementation } from "../../../common-backend/src";
import { Got } from "got";
import { inject, injectable } from "inversify";
import { join } from "path";
import { ApiServerConfig } from "../api-server-conf";
import { AssetStreamService } from "../services/asset-stream-service";
import { Connection, Repository } from "typeorm";

type AssetEndpointType = RouteImplementation<typeof assetEndpoint>;

@injectable()
export class AssetEndpoint implements AssetEndpointType {

  private assetRepo: Repository<AssetEntity>;

  constructor(
    @inject(IServerConfig) private config: ApiServerConfig,
    private streamService: AssetStreamService,
    @inject(GotSymbol) private got: Got,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.assetRepo = connection.getRepository(AssetEntity);
  }

  fetchAsset: AssetEndpointType["fetchAsset"] = async ({ assetId }) => {
    const asset = await this.assetRepo.findOne(assetId);
    if (asset) {
      return downloadResponse(asset.proxyPath, asset.headers);
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
          : asset.id
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
        .map(([name, value]) => ({ name, value: value as string }));

      return this.assetRepo.save({
        origUrl: url.toString(),
        hash: res.hash,
        headers,
        proxyPath: res.path
      })
    } catch (e) {
      return {
        error: true,
      };
    }
  }
}
