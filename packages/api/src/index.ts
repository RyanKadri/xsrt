import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { ElasticService, initializeExpressApp, DatabaseInitializer, RabbitInitializer, SQSInitializer } from "../../common-backend/src";
import { apiDiConfig } from "./di.api";

(async () => {
  await initializeExpressApp(apiDiConfig, [
    DatabaseInitializer,
    ElasticService,
    process.env.USE_SQS === "true" ? SQSInitializer : RabbitInitializer,
  ]);
})();
