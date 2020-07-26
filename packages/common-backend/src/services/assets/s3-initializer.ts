import { injectable, inject } from "inversify";
import S3 from "aws-sdk/clients/s3"
import { NeedsInitialization, assertExists } from "../../../../common/src";
import { ServerConfig, IServerConfig } from "../../server/express-server";

export const S3ClientSymbol = Symbol("S3Client");

@injectable()
export class S3Initializer implements NeedsInitialization {

  constructor(
    @inject(IServerConfig) private config: Pick<ServerConfig, "assetBucket" | "awsRegion">
  ) {}

  async initialize(): Promise<[symbol, S3]> {
    const s3 = new S3({ region: this.config.awsRegion });
    const bucket = assertExists(this.config.assetBucket, "You must define an asset storage bucket")
    await s3.headBucket({ Bucket: bucket }).promise()
    console.log("Validated S3 storage bucket")
    return [ S3ClientSymbol, s3 ]
  }
}
