import { extractStyleInfo } from "./traverse/traverse-styles";
import { triggerDownload, toJson } from "./utils/utils";
import { Globals } from '../overrides';
import { extractInitMetadata, RecordingMetadata, extractEndMetadata, InitMetadata } from "./traverse/extract-metadata";
import { ScrapedStyleRule, ScrapedHtmlElement } from "./types/types";
import { MutationRecorder, RecordedMutationGroup } from "./record/dom-changes/mutation-recorder";
import { DomTraverser } from "./traverse/traverse-dom";
import { dedupe } from "./dedupe/dedupe";
import { CompleteInputRecorder, RecordedUserInput } from "./record/user-input/input-recorder";
import { serializeToViewer } from "./output/output-manager";

(window as Globals).scraper = (function () {

    const domWalker = new DomTraverser();
    const mutationRecorder = new MutationRecorder(domWalker);
    const inputRecorder = new CompleteInputRecorder();
    let initSnapshot: ScrapedData

    return {
        scrape,
        startRecording,
        stopRecording
    }

    async function scrape(config: ScraperConfig) {
        const metadata = extractInitMetadata(document, location);
        const root = domWalker.traverseNode(document.documentElement!) as ScrapedHtmlElement;
        const styles = extractStyleInfo(Array.from(document.styleSheets) as CSSStyleSheet[]);
        initSnapshot = { root, metadata, styles, changes: [], inputs: []};

        if (config.output === 'single-page' || config.output === 'json') {
            const fullSnapshot = await dedupe(initSnapshot);
            if (config.output === 'single-page') {
                const serialized = serializeToViewer(fullSnapshot);
                triggerDownload(serialized, 'text/html; charset=UTF-8', 'snapshot.html');
            } else {
                const serialized = toJson(fullSnapshot);
                triggerDownload(serialized, 'application/json; charset=UTF-8', 'start-snapshot.json');
            }
        } else if (config.output === 'record') {
            startRecording();
        } else {
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
        const full = await dedupe({ ...initSnapshot, changes, inputs, metadata })
        const serialized = toJson(full);
        triggerDownload(serialized, 'application/json; charset=UTF-8', 'recording.json');
        domWalker.dump();
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
    metadata: InitMetadata;
    styles: ScrapedStyleRule[];
    changes: RecordedMutationGroup[];
    inputs: RecordedUserInput[];
}

export interface DedupedData extends ScrapedData {
    assets: string[];
    metadata: RecordingMetadata
}