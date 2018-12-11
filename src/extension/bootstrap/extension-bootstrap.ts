import { RecorderContainer } from "../../scraper/inversify.recorder";
import { postToBackend } from "../../scraper/output/output-manager";
import { Scraper } from "../../scraper/scrape";
import { ScraperConfig, ScraperConfigToken } from "../../scraper/scraper-config,";
import { CommandMessage } from "../content/commands";
import { ExtensionMessage, ExtensionMessageResponse } from "../content/site-channel-types";

let scraper: Scraper;
window.addEventListener('message', (message) => {
    if(message.source !== window || message.data.type !== ExtensionMessage.type) {
        return;
    } else {
        const request: ExtensionMessage<CommandMessage> = message.data;
        const command = request.payload;
        if(command.command === "startRecording") {
            RecorderContainer.bind(ScraperConfigToken).toConstantValue(command.config);
            scraper = RecorderContainer.get(Scraper);
            scraper.record()
                .then(res => postToBackend(res, command.config));
        } else if(command.command === 'stopRecording') {
            scraper.stopRecording();
        }
        window.postMessage(new ExtensionMessageResponse(request.id), location.origin)
    }
}) 

export type ExtensionRequest = StartScrapingRequest | StopScrapingRequest;

export interface StartScrapingRequest {
    type: 'startScraping';
    config: ScraperConfig;
}

export interface StopScrapingRequest {
    type: 'stopScraping';
}