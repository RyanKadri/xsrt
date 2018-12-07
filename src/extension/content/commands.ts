import { postToSite } from "./site-channel";
import { ScraperConfig } from "../../scraper/scraper-config,";

export function listenForCommands() {
    chrome.runtime.onMessage.addListener((message: CommandMessage, _, sendResponse) => {
        if(message.command === 'startRecording' || message.command === 'stopRecording') {
            postToSite(message)
                .then(resp => sendResponse(resp));
        } else {
            throw new Error(`Unknown command: ${ (message as any).command }`)
        }
    });
}

export type CommandMessage = StartRecording | StopRecording;

export class StartRecording {
    command: 'startRecording' = 'startRecording';
    constructor(
        public config: ScraperConfig
    ){}
}

export class StopRecording {
    command: 'stopRecording' = 'stopRecording';
}