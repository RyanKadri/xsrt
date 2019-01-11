import { ExtensionConfig } from "../config/extension-config";
import { RecordingStatus } from "../popup/popup-root";

export function loadConfig(): ExtensionConfig {
    return {
        shouldInject: true,
        backendUrl: "http://localhost:3001",
        debugMode: true,
        mutationsPerChunk: 1500,
        inputsPerChunk: 1000
    };
}

let recordedStatus: RecordingStatus | undefined;

export function listenCommands(config: ExtensionConfig) {
    chrome.runtime.onMessage.addListener((e: ExtensionBackgroundRequest, _, sendResponse) => {
        switch (e.request) {
          case "config":
            return sendResponse(config);
          case "fetchStatus":
            return sendResponse(recordedStatus);
          case "saveStatus":
            recordedStatus = e.status;
            return sendResponse(true);
          default:
        }
    });
}

export type ExtensionBackgroundRequest = ConfigRequest | FetchStatusRequest | SaveStatusRequest;

export class FetchStatusRequest {
    readonly request = "fetchStatus";
}

export class SaveStatusRequest {
    readonly request = "saveStatus";

    constructor(
        public status?: RecordingStatus
    ) {}
}

export class ConfigRequest {
    readonly request = "config";
}
