import { MenuActionCallback } from "./setup-ui";
import { StartRecording, StopRecording } from "../content/commands";

export const startRecording: MenuActionCallback = (_, tab, config) => { 
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

export const stopRecording: MenuActionCallback = (_, tab) => {
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