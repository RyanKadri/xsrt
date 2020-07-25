import { createHash } from "crypto";
import { Got } from "got/dist/source";
import { inject, injectable } from "inversify";
import { join } from "path";
import { Connection, Repository } from "typeorm";
import { Asset, AssetEntity, DBConnectionSymbol, GotSymbol } from "../../../../common/src";
import { IAssetStorageService, AssetStorageService } from "./asset-storage-service";

@injectable()
export class AssetResolver {

  private assetRepo: Repository<AssetEntity>;
  constructor(
    @inject(IAssetStorageService) private storageService: AssetStorageService,
    @inject(GotSymbol) private got: Got,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.assetRepo = connection.getRepository(AssetEntity)
  }

  async resolveAssets(rawAssets: Asset[], userAgent?: string) {
    const assets = await Promise.all(
      rawAssets.map(asset =>
        this.storeSingleAsset(asset, userAgent)
      )
    );
    return assets
  }

  private storeSingleAsset = async (asset: Asset, userAgent = "") => {
    try {
      const url = new URL(asset.origUrl);
      const resp = await this.got.get(url.href, {
        headers: { ["User-Agent"]: userAgent }, // Retrieve asset as requester's user agent
        responseType: "buffer"
      });

      // TODO - May need to watch for overwrite collisions here. Consider shortid?
      const matches = url.pathname.match(/\/([^/]+)$/); // File name
      const baseName = matches ? matches[1] : "root";
      const hashStream = createHash("sha1");
      hashStream.update(resp.rawBody);
      const hash = hashStream.digest("base64");

      const existingAsset = await this.assetRepo.findOne({ where: { hash }});
      if(!existingAsset) {
        const safeHash = hash.replace(/[\/+=-]/g, "_");
        const saveLocation = join(url.hostname, `${safeHash}-${baseName}`);
        await this.storageService.saveAsset(resp.rawBody, saveLocation);
        return this.assetRepo.save({
          ...asset,
          hash,
          proxyPath: saveLocation
        })
      } else {
        return existingAsset;
      }
    } catch (e) {
      const placeholderAsset = await this.assetRepo.findOne({ where: { origUrl: asset.origUrl, proxyPath: null } })
      return placeholderAsset
        ?? this.assetRepo.save(asset);
    }
  }
}
