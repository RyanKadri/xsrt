import S3 from "aws-sdk/clients/s3";
import { injectable, inject } from "inversify";
import { AssetStorageService } from "./asset-storage-service";
import { IServerConfig } from "../../../../common-backend/src";
import { S3ClientSymbol } from "./s3-initializer";
import { ServerConfig } from "../../server/express-server";
import { AssetEntity } from "../../../../common/src";
import { IncomingHttpHeaders } from "http";

@injectable()
export class S3StorageService implements AssetStorageService {

  constructor(
    @inject(S3ClientSymbol) private s3: S3,
    @inject(IServerConfig) private config: Pick<ServerConfig, "assetBucket">
  ) { }

  // Can we stream this? Is there a good way to use headers to avoid doing the hashing process all the time?
  async saveAsset(data: Buffer, savePath: string, headers?: IncomingHttpHeaders): Promise<void> {
    await this.s3.putObject({
      Bucket: this.config.assetBucket!,
      Key: savePath, Body: data,
      ContentType: headers?.["content-type"]
    }).promise()
  }

  async fetchAsset(asset: AssetEntity): Promise<Buffer> {
    return this.s3.getObject({
      Bucket: this.config.assetBucket!,
      Key: asset.proxyPath
    }).promise().then(resp => {
      return resp.Body as Buffer
    })
  }
}
