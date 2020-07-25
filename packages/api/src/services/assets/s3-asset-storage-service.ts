import S3 from "aws-sdk/clients/s3";
import { injectable, inject } from "inversify";
import { ApiServerConfig } from "../../api-server-conf";
import { AssetStorageService } from "./asset-storage-service";
import { S3ClientSymbol } from "../storage/s3-initializer";
import { IServerConfig } from "../../../../common-backend/src";

@injectable()
export class S3StorageService implements AssetStorageService {

  constructor(
    @inject(S3ClientSymbol) private s3: S3,
    @inject(IServerConfig) private config: Pick<ApiServerConfig, "assetBucket">
  ) { }

  // Can we stream this? Is there a good way to use headers to avoid doing the hashing process all the time?
  async saveAsset(data: Buffer, savePath: string): Promise<void> {
    await this.s3.putObject({
      Bucket: this.config.assetBucket!, Key: savePath, Body: data
    }).promise()
  }
}
