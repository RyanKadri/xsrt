import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { ElasticService, initializeExpressApp, DatabaseInitializer, SQSInitializer, RabbitInitializer, S3Initializer } from "../../common-backend/src";
import { decoratorDiConfig } from "./di.decorators";
import { MQConsumerService } from "./services/mq-consumer-service";
import { SQSConsumerService } from "./services/sqs-consumer-service";
import { interfaces } from "inversify";
import { NeedsInitialization } from "../../common/src";

(async () => {

  const optionalInitializers = [
    process.env.USE_S3 === "true" ? S3Initializer : null
  ].filter(init => init !== null) as interfaces.Newable<NeedsInitialization>[]


  await initializeExpressApp(decoratorDiConfig, [
    DatabaseInitializer,
    ElasticService,
    ...optionalInitializers,
    process.env.USE_SQS === "true" ? SQSInitializer : RabbitInitializer,
    process.env.USE_SQS === "true" ? SQSConsumerService : MQConsumerService,
  ]);
})();
