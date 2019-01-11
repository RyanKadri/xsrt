import { listenCommands, loadConfig } from "./config";

(async () => {
  const config = await loadConfig();
  listenCommands(config);
})();
