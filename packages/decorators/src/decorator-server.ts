import { initializeExpressApp, MongoInitializer, DecoratorQueueService, QueueConsumerService, ElasticService } from "@xsrt/common-backend";
import { decoratorDiConfig } from "./di.decorators";

(async () => {
    await initializeExpressApp(decoratorDiConfig, [
        MongoInitializer,
        ElasticService,
        DecoratorQueueService,
        QueueConsumerService,
    ]);
})();
