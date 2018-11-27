import * as template from '../../viewer/index.html';
import { ScraperConfig } from "../scrape";
import { toJson } from '../utils/utils';
import { triggerDownload, compress } from './output-utils';
import { DedupedData } from '../types/types';
import axios, { } from 'axios';

function serializeToViewer(data: DedupedData) {
    return (template as any).replace(
        '<!-- EMBEDDED_DATA_PLACEHOLDER -->',
        `<script id="scraped-data" type="application/json">${ toJson(data) }</script>`);
}

// TODO - Does this ever need to support GZIP? If so, what will that look like?
export async function outputStandaloneSnapshot(data: DedupedData) {
    const serialized = serializeToViewer(data);
    triggerDownload(serialized, 'text/html; charset=UTF-8', 'snapshot.html');
}

export async function outputDataSnapshot(data: DedupedData, filename: string, config: ScraperConfig) {
    const serialized = toJson(data);
    triggerDownload(serialized, 'application/json; charset=UTF-8', filename, !config.debugMode);
}

export async function postToBackend(data: DedupedData, config: ScraperConfig) {
    const serialized = config.debugMode ? toJson(data): compress(toJson(data));
    const url = `${config.backendUrl}/api/recordings`;
    const res = await axios.post(url, serialized, {
        // Jury's out on whether this is idiomatic
        headers: Object.assign({}, 
            {'Content-Type': 'application/json'},
            !config.debugMode ? {'Content-Encoding': 'gzip'} : null
        )
    });
    return res.data._id;
}