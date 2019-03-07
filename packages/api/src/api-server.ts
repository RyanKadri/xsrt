import { initializeExpressApp, MongoInitializer, DecoratorQueueService } from "@xsrt/common-backend";
import { apiDiConfig } from "./di.api";

(async () => {
    await initializeExpressApp(apiDiConfig, [
        MongoInitializer,
        DecoratorQueueService
    ]);
})();
