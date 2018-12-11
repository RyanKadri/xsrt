import { ExtensionConfig } from "../config/extension-config";
import { StartRecording, StopRecording } from "../content/commands";

export const startRecording: MenuActionCallback = (tab, config) => { 
    const tabId = tab.id;
    if(tabId) {
        const command = new StartRecording(config);
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, command, () => {
                resolve();
            });
        })
    } else {
        return Promise.resolve();
    }
}

export const stopRecording: MenuActionCallback = (tab) => {
    const tabId = tab.id;
    if(tabId) {
        const command = new StopRecording();
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, command, () => {
                resolve();
            });
        })
    } else {
        return Promise.resolve();
    }
}

export type MenuActionCallback = (tab: chrome.tabs.Tab, config: ExtensionConfig) => Promise<void>