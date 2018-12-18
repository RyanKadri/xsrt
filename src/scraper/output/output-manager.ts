import axios from 'axios';
import { DeepPartial, Without } from '../../common/utils/type-utils';
import * as template from '../../viewer/index.html';
import { ScraperConfig } from '../scraper-config,';
import { Recording, RecordingChunk, SnapshotChunk } from '../types/types';
import { toJson } from '../utils/utils';
import { compress, triggerDownload } from './output-utils';

function serializeToViewer(data: Without<SnapshotChunk, "_id">) {
    return (template as any).replace(
        '<!-- EMBEDDED_DATA_PLACEHOLDER -->',
        `<script id="scraped-data" type="application/json">${ toJson(data) }</script>`);
}  

// TODO - Does this ever need to support GZIP? If so, what will that look like?
export async function outputStandaloneSnapshot(data: Without<SnapshotChunk, "_id">) {
    const serialized = serializeToViewer(data);
    triggerDownload(serialized, 'text/html; charset=UTF-8', 'snapshot.html');
}

export async function outputDataSnapshot(data: Without<SnapshotChunk, "_id">, filename: string, config: ScraperConfig) {
    const serialized = toJson(data);
    triggerDownload(serialized, 'application/json; charset=UTF-8', filename, !config.debugMode);
}

export async function postToBackend(data: Without<RecordingChunk, "_id">, toRecording: string, config: ScraperConfig) {
    const serialized = config.debugMode ? toJson(data): compress(toJson(data));
    const url = `${config.backendUrl}/api/recordings/${toRecording}/chunks`;
    const res = await axios.post(url, serialized, {
        // Jury's out on whether this is idiomatic
        headers: Object.assign({}, 
            {'Content-Type': 'application/json'},
            !config.debugMode ? {'Content-Encoding': 'deflate'} : null
        )
    });
    return res.data._id;
}

export async function finalizeRecording(recordingId: string, config: ScraperConfig) {
    const finalization: DeepPartial<Recording> = { 
        finalized: true,
    }
    await axios.patch(`${config.backendUrl}/api/recordings/${recordingId}`, finalization)
}