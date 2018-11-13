import { extractStyleInfo } from "./traverse/traverse-styles";
import { extractInitMetadata, extractEndMetadata } from "./traverse/extract-metadata";
import { ScrapedHtmlElement, ScrapedData } from "./types/types";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { DomTraverser } from "./traverse/traverse-dom";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { outputStandaloneSnapshot, outputDataSnapshot } from "./output/output-manager";

export const scraper: Scraper = (function () {

    const domWalker = new DomTraverser();
    const mutationRecorder = new MutationRecorder(domWalker);
    const inputRecorder = new CompleteInputRecorder(domWalker);
    let initSnapshot: ScrapedData;
    let initConfig: ScraperConfig;

    return {
        scrape,
        startRecording,
        stopRecording
    }

    async function scrape(config: ScraperConfig) {
        initConfig = config;
        const metadata = extractInitMetadata(document, location);
        const root = domWalker.traverseNode(document.documentElement!) as ScrapedHtmlElement;
        const styles = extractStyleInfo(Array.from(document.styleSheets) as CSSStyleSheet[]);
        initSnapshot = { root, metadata, styles, changes: [], inputs: {}};

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
        mutationRecorder.start();
        inputRecorder.start();
    }

    async function stopRecording() {
        const changes = mutationRecorder.stop();
        const inputs = inputRecorder.stop();
        const metadata = { ...initSnapshot.metadata, ...extractEndMetadata() }
        outputDataSnapshot({ ...initSnapshot, changes, inputs, metadata }, 'recording.json', initConfig);
        domWalker.dump();
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