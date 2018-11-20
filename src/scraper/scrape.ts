import { extractMetadata } from "./traverse/extract-metadata";
import { ScrapedHtmlElement, ScrapedData, DedupedData } from "./types/types";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { RecordingDomManager } from "./traverse/traverse-dom";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { TimeManager } from "./utils/time-manager";
import { optimize } from "./optimize/optimize";
import { injectable } from 'inversify';

@injectable()
export class Scraper implements Scraper {

    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager,
        private mutationRecorder: MutationRecorder,
        private inputRecorder: CompleteInputRecorder,
    ) {}
    private onStop: (() => void) | undefined;

    takeDataSnapshot(): Promise<DedupedData> {
        return optimize(this.syncSnapshot());
    }

    private syncSnapshot(): ScrapedData {
        return { 
            root: this.domWalker.traverseNode(document.documentElement!) as ScrapedHtmlElement,
            metadata: extractMetadata(document, location, this.timeManager.start()),
            changes: [],
            inputs: {}
        }
    }

    async record() {
        const initSnapshot = this.syncSnapshot();
        
        [this.timeManager, this.mutationRecorder, this.inputRecorder]
            .forEach(manager => manager.start());
        
        return new Promise<DedupedData>((resolve, reject) => {
            this.onStop = () => {
                optimize({ 
                    ...initSnapshot,
                    changes: this.mutationRecorder.stop(),
                    inputs: this.inputRecorder.stop(),
                    metadata: { 
                        ...initSnapshot.metadata,
                        stopTime: this.timeManager.stop()
                    },
                }).then(optimized => resolve(optimized))
                .catch(reject)
            }
        })
    }

    stopRecording() {
        if(this.onStop) {
            this.onStop();
        }
    }
    
}

export interface ScraperConfig {
    debugMode: boolean;
}

export interface Scraper {
    record(config: ScraperConfig): Promise<DedupedData>;
    takeDataSnapshot(): Promise<DedupedData>;
    stopRecording(): void;
}