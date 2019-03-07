import { initializeExpressApp, MongoInitializer, DecoratorQueueService } from "@xsrt/common-backend";
import { decoratorDiConfig } from "./di.decorators";
import { QueueConsumerService } from "./services/queue-consumer-service";

(async () => {
    await initializeExpressApp(decoratorDiConfig, [
        MongoInitializer,
        DecoratorQueueService,
        QueueConsumerService,
    ]);
})();
