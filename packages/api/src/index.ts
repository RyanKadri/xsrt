import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { ElasticService, initializeExpressApp, DatabaseInitializer, RabbitInitializer, SQSInitializer } from "../../common-backend/src";
import { apiDiConfig } from "./di.api";
import { S3Initializer } from "./services/storage/s3-initializer";
import { interfaces } from "inversify";
import { NeedsInitialization } from "../../common/src";

(async () => {
  const optionalInitializers = [
    process.env.USE_S3 === "true" ? S3Initializer : null
  ].filter(init => init !== null) as interfaces.Newable<NeedsInitialization>[]

  await initializeExpressApp(apiDiConfig, [
    DatabaseInitializer,
    ElasticService,
    process.env.USE_SQS === "true" ? SQSInitializer : RabbitInitializer,
    ...optionalInitializers
  ]);
})();
