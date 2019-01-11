import { listenForCommands } from "./commands";
import { fetchConfig } from "./config";
import { bootstrapScraper } from "./page-bootstrap";

(async () => {
    listenForCommands();
    const config = await fetchConfig();
    if (config.shouldInject) {
        await bootstrapScraper();
    }
})();
