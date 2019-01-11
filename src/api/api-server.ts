import "reflect-metadata";
import { ExpressServer } from "../common/server/express-server";
import { ApiContainer } from "./api-inversify";

(async () => {
    ApiContainer.get(ExpressServer).start();
})();
