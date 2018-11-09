import { extractStyleInfo } from "./traverse/traverse-styles";
import { triggerDownload, toJson } from "./utils/utils";
import { serializeToViewer } from "./serialize/serialize";
import { Globals } from '../overrides';
import { extractMetadata, ScrapeMetadata } from "./traverse/extract-metadata";
import { ScrapedStyleRule, ScrapedHtmlElement } from "./types/types";
import { MutationRecorder, RecordedMutationGroup } from "./record/mutation-recorder";
import { DomTraverser } from "./traverse/traverse-dom";
import { dedupe } from "./dedupe/dedupe";

(window as Globals).scraper = (function() {

    const domWalker = new DomTraverser();
    const recorder = new MutationRecorder(domWalker);
    let initSnapshot: ScrapedData

    return {
        scrape,
        startRecording,
        stopRecording
    }

    async function scrape(config: ScraperConfig) {
        const metadata = extractMetadata(document, location);
        const root = domWalker.traverseNode(document.documentElement!) as ScrapedHtmlElement;
        const styles = extractStyleInfo(Array.from(document.styleSheets) as CSSStyleSheet[]);
        initSnapshot = { root, metadata, styles, changes: [] };
        
        if(config.output === 'single-page' || config.output === 'json') {
            const fullSnapshot = await dedupe(initSnapshot);
            if(config.output === 'single-page') {
                const serialized = serializeToViewer(fullSnapshot);
                triggerDownload(serialized, 'text/html; charset=UTF-8', 'snapshot.html');
            } else {
                const serialized = toJson(fullSnapshot);
                triggerDownload(serialized, 'application/json; charset=UTF-8', 'start-snapshot.json');
            }
        } else if(config.output === 'record') {
            startRecording();
        } else {
            throw new Error('Unknown output format: ' + config.output)
        }
    }

    async function startRecording() {
        recorder.start();
    }

    async function stopRecording() {
        const changes = recorder.stop();
        const full = await dedupe({... initSnapshot, changes})
        const serialized = toJson(full);
        triggerDownload(serialized, 'application/json; charset=UTF-8', 'recording.json');
    }
})()

export interface ScraperConfig {
    output: 'single-page' | 'json' | 'record' | 'stop';
} 

export interface Scraper {
    scrape(config: ScraperConfig): void;
    startRecording(): void;
    stopRecording(): void;
}

export interface ScrapedData {
    root: ScrapedHtmlElement;
    metadata: ScrapeMetadata;
    styles: ScrapedStyleRule[];
    changes: RecordedMutationGroup[];
}

export interface DedupedData extends ScrapedData {
    assets: string[];
}