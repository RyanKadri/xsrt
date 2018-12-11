import { ExtensionConfig } from "../config/extension-config";

export function fetchConfig() {
    return new Promise<ExtensionConfig>((resolve) => {
        chrome.runtime.sendMessage({ request: 'config' }, (config: ExtensionConfig) => {
            resolve(config);    
        });
    })
}