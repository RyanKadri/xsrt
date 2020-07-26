import { mkdir, writeFile } from "fs";
import { injectable, inject } from "inversify";
import { join, dirname } from "path";
import { promisify } from "util";
import { AssetStorageService } from "./asset-storage-service";
import { IServerConfig, ServerConfig } from "../../server/express-server";

const mkdirFs = promisify(mkdir);
const writeFileFs = promisify(writeFile);

@injectable()
export class FSStorageService implements AssetStorageService {

  constructor(
    @inject(IServerConfig) private config: ServerConfig
  ) { }

  // Can we stream this? Is there a good way to use headers to avoid doing the hashing process all the time?
  async saveAsset(data: Buffer, savePath: string): Promise<void> {
    const saveLocation = join(this.config.assetDir!, savePath);
    await mkdirFs(dirname(saveLocation), { recursive: true });
    await writeFileFs(saveLocation, data)
  }
}
