import "reflect-metadata";
import { initializeApi } from "../common/server/api-initializer";
import { ExpressServer } from "../common/server/express-server";
import { decoratorDiConfig } from "./di.decorators";

(async () => {
    const injector = initializeApi(decoratorDiConfig);
    await injector.inject(ExpressServer).start();
})();
