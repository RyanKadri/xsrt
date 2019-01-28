import { ScraperConfig } from "@xsrt/common";
import { postToSite } from "./site-channel";

export function listenForCommands() {
    chrome.runtime.onMessage.addListener((message: CommandMessage, _, sendResponse) => {
        if (message.command === "startRecording" || message.command === "stopRecording") {
            postToSite(message)
                .then(resp => sendResponse(resp));
        }
    });
}

export type CommandMessage = StartRecording | StopRecording | RecordingInfo;

export class StartRecording {
    readonly command = "startRecording";
    constructor(
        public config: ScraperConfig
    ) {}
}

export class StopRecording {
    readonly command = "stopRecording";
}

export class RecordingInfo {
    readonly command = "recordingInfo";
}
