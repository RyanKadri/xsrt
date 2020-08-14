import { assertExists } from "../../common/src";
import { ExpressConfigurator, ServerConfig } from "../../common-backend/src";
import bodyParser from "body-parser";
import cors from "cors";
import { Express } from "express";
import { injectable } from "inversify";

export const decoratorConfig: DecoratorConfig = {
  port: parseInt(process.env.DECORATOR_PORT || "8080", 10),
  assetDir: `${process.env.STORAGE_LOCATION}`,
  recordingHost: assertExists(process.env.API_HOST),
  rabbitHost: process.env.RABBIT_HOST || "localhost",
  elasticUrl: process.env.ELASTIC_HOST || "http://localhost:9200",
  proxyHost: assertExists(process.env.API_HOST),
  awsRegion: process.env.AWS_REGION,
  rawChunkUrl: process.env.RAW_CHUNK_QUEUE,
  elasticQueueUrl: process.env.ELASTIC_QUEUE,
  snapshotQueueUrl: process.env.SNAPSHOT_QUEUE,
  assetBucket: process.env.ASSET_BUCKET
}

export interface DecoratorConfig extends ServerConfig {
  port: number
  recordingHost: string;
  rabbitHost: string;
  elasticUrl: string;
  proxyHost: string;
}

@injectable()
export class DecoratorExpressConfigurator implements ExpressConfigurator {

  async initialize(app: Express) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors());
    app.options("*", cors());
  }

}
