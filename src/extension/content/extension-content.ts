import { fetchConfig } from "./config";
import { bootstrapScraper } from "./page-bootstrap";
import { listenForCommands } from "./commands";

(async function() {
    listenForCommands();
    const config = await fetchConfig();
    if(config.shouldInject) {
        await bootstrapScraper();
    }
})()

