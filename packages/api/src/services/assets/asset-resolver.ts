import { Got } from "got/dist/source";
import { inject, injectable } from "inversify";
import { join } from "path";
import { IServerConfig } from "../../../../common-backend/src";
import { Asset, GotSymbol, DBConnectionSymbol, AssetEntity } from "../../../../common/src";
import { ApiServerConfig } from "../../api-server-conf";
import { AssetStreamService } from "./asset-stream-service";
import { Connection, Repository } from "typeorm";

@injectable()
export class AssetResolver {

  private assetRepo: Repository<AssetEntity>;
  constructor(
    @inject(IServerConfig) private config: ApiServerConfig,
    private streamService: AssetStreamService,
    @inject(GotSymbol) private got: Got,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.assetRepo = connection.getRepository(AssetEntity)
  }

  async resolveAssets(rawAssets: Asset[], userAgent?: string) {
    const assets = await Promise.all(
      rawAssets.map(asset =>
        this.proxySingleAsset(asset, userAgent)
      )
    );
    return assets
  }

  private proxySingleAsset = async (asset: Asset, userAgent = "") => {
    try {
      const url = new URL(asset.origUrl);
      const resp = await this.got.get(url.href, {
        headers: { ["User-Agent"]: userAgent }, // Retrieve asset as requester's user agent
        responseType: "buffer"
      });

      const saveDir = join(this.config.assetDir, url.hostname);

      return this.streamService.saveStream(asset, resp.rawBody, saveDir);
    } catch (e) {
      const placeholderAsset = await this.assetRepo.findOne({ where: { origUrl: asset.origUrl, proxyPath: null } })
      return placeholderAsset
        ?? this.assetRepo.save(asset);
    }
  }
}
