import { listenCommands, loadConfig } from "./config";

(async function() {
  const config = await loadConfig();
  listenCommands(config);
})()