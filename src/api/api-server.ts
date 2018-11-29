import { ApiContainer } from "./api-inversify";
import { ExpressServer } from "../common/server/express-server";

(async function() {
    ApiContainer.get(ExpressServer).start();
})()
