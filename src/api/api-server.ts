import "reflect-metadata";
import { initializeApi } from "../common/server/api-initializer";
import { ExpressServer } from "../common/server/express-server";
import { apiDiConfig } from "./di.api";

(async () => {
    const diInjector = initializeApi(apiDiConfig);
    diInjector.inject(ExpressServer).start();
})();
