import { extractInitMetadata } from "./traverse/extract-metadata";
import { ScrapedHtmlElement, ScrapedData, DedupedData } from "./types/types";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { RecordingDomManager } from "./traverse/traverse-dom";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { TimeManager } from "./utils/time-manager";
import { optimize } from "./optimize/optimize";

export const scraper: Scraper = (function () {

    let onStop: (() => void) | undefined;

    const domWalker = new RecordingDomManager();
    const timeManager = new TimeManager();
    const mutationRecorder = new MutationRecorder(domWalker, timeManager);
    const inputRecorder = new CompleteInputRecorder(domWalker, timeManager);

    return {
        takeDataSnapshot,
        record,
        stopRecording
    }

    function takeDataSnapshot(): Promise<DedupedData> {
        return optimize(syncSnapshot());
    }

    function syncSnapshot(): ScrapedData {
        return { 
            root: domWalker.traverseNode(document.documentElement!) as ScrapedHtmlElement,
            metadata: extractInitMetadata(document, location, timeManager.start()),
            changes: [],
            inputs: {}
        }
    }

    async function record(config: ScraperConfig) {
        const initSnapshot = syncSnapshot();
        timeManager.start();
        mutationRecorder.start();
        inputRecorder.start();
        return new Promise<DedupedData>((resolve, reject) => {
            onStop = () => {
                const stopTime = timeManager.stop();
                const changes = mutationRecorder.stop();
                const inputs = inputRecorder.stop();
                const metadata = { ...initSnapshot.metadata, stopTime }
                optimize({ ...initSnapshot, changes, inputs, metadata })
                    .then(optimized => resolve(optimized))
                    .catch(reject)
            }
        })
    }

    function stopRecording() {
        if(onStop) {
            onStop();
        }
    }
    
})()

export interface ScraperConfig {
    debugMode: boolean;
}

export interface Scraper {
    record(config: ScraperConfig): Promise<DedupedData>;
    takeDataSnapshot(): Promise<DedupedData>;
    stopRecording(): void;
}