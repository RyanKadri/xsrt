import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { ElasticService, initializeExpressApp, DatabaseInitializer, SQSInitializer, RabbitInitializer } from "../../common-backend/src";
import { decoratorDiConfig } from "./di.decorators";
import { MQConsumerService } from "./services/mq-consumer-service";
import { SQSConsumerService } from "./services/sqs-consumer-service";

(async () => {
    await initializeExpressApp(decoratorDiConfig, [
        DatabaseInitializer,
        ElasticService,
        process.env.USE_SQS === "true" ? SQSInitializer : RabbitInitializer,
        process.env.USE_SQS === "true" ? SQSConsumerService : MQConsumerService,
    ]);
})();
