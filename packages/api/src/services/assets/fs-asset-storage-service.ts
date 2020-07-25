import { mkdir, writeFile } from "fs";
import { injectable } from "inversify";
import { join, dirname } from "path";
import { promisify } from "util";
import { ApiServerConfig } from "../../api-server-conf";
import { AssetStorageService } from "./asset-storage-service";

const mkdirFs = promisify(mkdir);
const writeFileFs = promisify(writeFile);

@injectable()
export class FSStorageService implements AssetStorageService {

  constructor(
    private config: ApiServerConfig
  ) { }

  // Can we stream this? Is there a good way to use headers to avoid doing the hashing process all the time?
  async saveAsset(data: Buffer, savePath: string): Promise<void> {
    const saveLocation = join(this.config.assetDir, savePath);
    await mkdirFs(dirname(saveLocation), { recursive: true });
    await writeFileFs(saveLocation, data)
  }
}
