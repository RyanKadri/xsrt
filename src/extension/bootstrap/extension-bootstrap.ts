import { RecorderContainer } from "../../scraper/inversify.recorder";
import { finalizeRecording, postToBackend } from "../../scraper/output/output-manager";
import { Scraper } from "../../scraper/scrape";
import { ScraperConfig, ScraperConfigToken } from "../../scraper/scraper-config,";
import { CommandMessage } from "../content/commands";
import { ExtensionMessage, ExtensionMessageResponse } from "../content/site-channel-types";

const localStorageScrapeConfig = "app.icu.recording.config";

let scraper: Scraper;
let recordingId: string;
let sessionConfig: ScraperConfig;

const localStoredConfig = localStorage.getItem(localStorageScrapeConfig);
//TODO - Setting this to refer to other constant was causing issues with import reordering in VSCode.
const localRecordingId = localStorage.getItem('app.icu.recording.id');

if(localStoredConfig && localRecordingId) {
    const config = JSON.parse(localStoredConfig);
    recordingId = localRecordingId;
    startScraping(config);
}

window.addEventListener('message', async (message) => {
    if(message.source !== window || message.data.type !== ExtensionMessage.type) {
        return;
    } else {
        const request: ExtensionMessage<CommandMessage> = message.data;
        const command = request.payload;
        if(command.command === "startRecording") {
            localStorage.setItem(localStorageScrapeConfig, JSON.stringify(command.config))
            startScraping(command.config)
        } else if(command.command === 'stopRecording') {
            await scraper.stopRecording();
            localStorage.removeItem(localStorageScrapeConfig);
            finalizeRecording(recordingId, sessionConfig);
        }
        window.postMessage(new ExtensionMessageResponse(request.id), location.origin)
    }
}) 

function startScraping(config: ScraperConfig) {
    sessionConfig = config
    RecorderContainer.bind(ScraperConfigToken).toConstantValue(config);
    scraper = RecorderContainer.get(Scraper);
    scraper.record((err, chunk, recordingInfo) => {
        if(err) {
            console.log(err);
        } else {
            recordingId = recordingInfo!._id
            postToBackend(chunk!, recordingInfo!._id, config);
        }
    })
}

export type ExtensionRequest = StartScrapingRequest | StopScrapingRequest;

export interface StartScrapingRequest {
    type: 'startScraping';
    config: ScraperConfig;
}

export interface StopScrapingRequest {
    type: 'stopScraping';
}