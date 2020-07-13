import { createHash } from "crypto";
import { mkdir, writeFile } from "fs";
import { injectable, inject } from "inversify";
import { join } from "path";
import { promisify } from "util";
import { Connection, Repository } from "typeorm";
import { AssetEntity, DBConnectionSymbol, Asset } from "../../../../common/src";

const mkdirFs = promisify(mkdir);
const writeFileFs = promisify(writeFile);

@injectable()
export class AssetStreamService {

  private assetRepo: Repository<AssetEntity>;
  constructor(
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.assetRepo = connection.getRepository(AssetEntity);
  }

  // Can we stream this? Is there a good way to use headers to avoid doing the hashing process all the time?
  async saveStream(asset: Asset, dataStream: Buffer, saveDir: string): Promise<AssetEntity> {
    // TODO - May need to watch for overwrite collisions here. Consider shortid?
    const url = new URL(asset.origUrl);
    const matches = url.pathname.match(/\/([^/]+)$/); // File name
    const baseName = matches ? matches[1] : "root";
    const hashStream = createHash("sha1");
    hashStream.update(dataStream);
    const hash = hashStream.digest("base64");

    const existingAsset = await this.assetRepo.findOne({ where: { hash }});
    if(!existingAsset) {
      await mkdirFs(saveDir, { recursive: true });
      const safeHash = hash.replace(/[\/+=-]/g, "_");
      const saveLocation = join(saveDir, `${safeHash}-${baseName}`);
      await writeFileFs(saveLocation, dataStream)
      return this.assetRepo.save({
        ...asset,
        hash,
        proxyPath: saveLocation
      })
    } else {
      return existingAsset;
    }

  }
}
