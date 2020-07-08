import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { DecoratorQueueService, ElasticService, initializeExpressApp, MongoInitializer } from "../../common-backend/src";
import { decoratorDiConfig } from "./di.decorators";
import { QueueConsumerService } from "./services/queue-consumer-service";

(async () => {
    await initializeExpressApp(decoratorDiConfig, [
        MongoInitializer,
        ElasticService,
        DecoratorQueueService,
        QueueConsumerService,
    ]);
})();
