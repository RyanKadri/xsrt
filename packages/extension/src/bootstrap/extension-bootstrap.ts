import "reflect-metadata";
import { ScraperConfig } from "@xsrt/common";
import { RecorderInitializer } from "@xsrt/recorder";
import { CommandMessage } from "../content/commands";
import { ExtensionMessage, ExtensionMessageResponse } from "../content/site-channel-types";

const recorder = new RecorderInitializer();
const autoStart = recorder.checkAutoStart();

window.addEventListener("message", async (message) => {
    if (message.source !== window || message.data.type !== ExtensionMessage.type) {
        return;
    } else {
        const request: ExtensionMessage<CommandMessage> = message.data;
        const command = request.payload;
        if (command.command === "startRecording") {
            if (!autoStart) {
                recorder.initialize(command.config);
            } else {
                throw new Error("Tried to start the recorder but it was already recording");
            }
        } else if (command.command === "stopRecording") {
            await recorder.stop();
        }
        window.postMessage(new ExtensionMessageResponse(request.id), location.origin);
    }
});

export type ExtensionRequest = StartScrapingRequest | StopScrapingRequest;

export interface StartScrapingRequest {
    type: "startScraping";
    config: ScraperConfig;
}

export interface StopScrapingRequest {
    type: "stopScraping";
}
