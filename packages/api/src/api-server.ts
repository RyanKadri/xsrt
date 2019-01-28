import { ExpressServer, initializeApi } from "@xsrt/common";
import "reflect-metadata";
import { apiDiConfig } from "./di.api";

(async () => {
    const diInjector = initializeApi(apiDiConfig);
    diInjector.inject(ExpressServer).start();
})();
