import { extractInitMetadata } from "./traverse/extract-metadata";
import { ScrapedHtmlElement, ScrapedData } from "./types/types";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { RecordingDomManager } from "./traverse/traverse-dom";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { outputStandaloneSnapshot, outputDataSnapshot } from "./output/output-manager";
import { TimeManager } from "./utils/time-manager";

export const scraper: Scraper = (function () {

    const domWalker = new RecordingDomManager();
    const timeManager = new TimeManager();
    const mutationRecorder = new MutationRecorder(domWalker, timeManager);
    const inputRecorder = new CompleteInputRecorder(domWalker, timeManager);
    let initSnapshot: ScrapedData;
    let initConfig: ScraperConfig;

    return {
        scrape,
        startRecording,
        stopRecording
    }

    async function scrape(config: ScraperConfig) {
        initConfig = config;
        const metadata = extractInitMetadata(document, location, timeManager.start());
        const root = domWalker.traverseNode(document.documentElement!) as ScrapedHtmlElement;
        initSnapshot = { root, metadata, changes: [], inputs: {}};

        switch(config.output) {
            case 'single-page':
                return outputStandaloneSnapshot(initSnapshot);
            case 'json':
                return outputDataSnapshot(initSnapshot, 'snapshot.json', config);    
            case 'record':
                return startRecording();
            default: 
                throw new Error('Unknown output format: ' + config.output)
        }
    }

    async function startRecording() {
        timeManager.start();
        mutationRecorder.start();
        inputRecorder.start();
    }

    async function stopRecording() {
        const stopTime = timeManager.stop();
        const changes = mutationRecorder.stop();
        const inputs = inputRecorder.stop();
        const metadata = { ...initSnapshot.metadata, stopTime }
        outputDataSnapshot({ ...initSnapshot, changes, inputs, metadata }, 'recording.json', initConfig);
    }
})()

export interface ScraperConfig {
    output: 'single-page' | 'json' | 'record' | 'stop';
    debugMode: boolean;
}

export interface Scraper {
    scrape(config: ScraperConfig): void;
    startRecording(): void;
    stopRecording(): void;
}