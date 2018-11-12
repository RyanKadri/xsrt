import * as template from '../../viewer/index.html';
import { ScraperConfig } from "../scrape";
import { toJson } from '../utils/utils';
import { optimize } from '../optimize/optimize';
import { triggerDownload } from './output-utils';
import { ScrapedData, DedupedData } from '../types/types';

function serializeToViewer(data: DedupedData) {
    return (template as any).replace(
        '<!-- EMBEDDED_DATA_PLACEHOLDER -->',
        `<script id="scraped-data" type="application/json">${ toJson(data) }</script>`);
}

// TODO - Does this ever need to support GZIP? If so, what will that look like?
export async function outputStandaloneSnapshot(data: ScrapedData) {
    const fullSnapshot = await optimize(data);
    const serialized = serializeToViewer(fullSnapshot);
    triggerDownload(serialized, 'text/html; charset=UTF-8', 'snapshot.html');
}

export async function outputDataSnapshot(data: ScrapedData, filename: string, config: ScraperConfig) {
    const fullSnapshot = await optimize(data);
    const serialized = toJson(fullSnapshot);
    triggerDownload(serialized, 'application/json; charset=UTF-8', 'start-snapshot.json', !config.debugMode);
}