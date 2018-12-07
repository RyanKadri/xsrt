import { setupMenu } from "./setup-ui";
import { serveConfig, loadConfig } from "./config";

(async function() {
  const config = await loadConfig();
  serveConfig(config);
  setupMenu(config);
})()