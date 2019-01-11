import { ExpressServer } from "../common/server/express-server";
import { DecoratorContainer } from "./inversify.decorators";

(async () => {
    await DecoratorContainer.get(ExpressServer).start();
})();
