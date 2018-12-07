import { ExtensionConfig } from "../config/extension-config";
import { ExtensionBackgroundRequest } from "../content/config";

export function loadConfig(): ExtensionConfig {
    return { shouldInject: true, backendUrl: 'http://localhost:3001', debugMode: true };
}

export function serveConfig(config: ExtensionConfig) {
    chrome.runtime.onMessage.addListener((e: ExtensionBackgroundRequest, _, sendResponse) => {
        switch(e.request) {
          case 'config':
          default:
            return sendResponse(config)
        }
    })
}
