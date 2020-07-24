import { DecoratorQueueService, ElasticService, initializeExpressApp, DatabaseInitializer } from "../../common-backend/src";
import dotenv from "dotenv";
import { apiDiConfig } from "./di.api";

(async () => {
  dotenv.config({ path: "../../.env" });
  await initializeExpressApp(apiDiConfig, [
    DatabaseInitializer,
    ElasticService,
    DecoratorQueueService,
  ]);
})();
