import { DecoratorQueueService, ElasticService, initializeExpressApp, MongoInitializer } from "@xsrt/common-backend";
import dotenv from "dotenv";
import { decoratorDiConfig } from "./di.decorators";
import { QueueConsumerService } from "./services/queue-consumer-service";

(async () => {
    dotenv.config({ path: "../../.env" });
    await initializeExpressApp(decoratorDiConfig, [
        MongoInitializer,
        ElasticService,
        DecoratorQueueService,
        QueueConsumerService,
    ]);
})();
