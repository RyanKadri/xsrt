import { DecoratorContainer } from "./inversify.decorators";
import { ExpressServer } from "../common/server/express-server";

(async function() {
    await DecoratorContainer.get(ExpressServer).start();
})()

