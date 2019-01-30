import { ExpressServer, initializeApi } from "@xsrt/common-backend";
import "reflect-metadata";
import { decoratorDiConfig } from "./di.decorators";

(async () => {
    const injector = initializeApi(decoratorDiConfig);
    await injector.inject(ExpressServer).start();
})();
