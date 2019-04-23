import { initializeExpressApp, MongoInitializer, DecoratorQueueService, ElasticService } from "@xsrt/common-backend";
import { apiDiConfig } from "./di.api";

(async () => {
    await initializeExpressApp(apiDiConfig, [
        MongoInitializer,
        ElasticService,
        DecoratorQueueService,
    ]);
})();
