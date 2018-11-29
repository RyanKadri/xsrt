import { injectable } from "inversify";
import { DedupedData, WithId } from "../../scraper/types/types";
import pako from "pako";
import { RecordingMetadata } from "../../scraper/traverse/extract-metadata";
import axios from "axios";

@injectable()
export class RecordingService {

    //TODO - This whole deflation part should be handled by native browser stuff on the receiving end.
    async fetchRecordingData(recording: string): Promise<DedupedData> {
        const embeddedSource = document.getElementById('scraped-data') as HTMLScriptElement;
        if(embeddedSource) {
            return JSON.parse(embeddedSource.innerText);
        } else {
            const data = await fetch(`/api/recordings/${recording}`);
            try {
                const text = await (await data.clone()).text();
                return JSON.parse(text)
            } catch(e) {
                const bin = new Uint8Array(await data.arrayBuffer());
                const inflated = pako.inflate(bin, { to: 'string' });
                return JSON.parse(inflated);
            }
        }
    }

    async fetchAvailableRecordings(): Promise<MetadataGroup[]> {
        return axios.get(`/api/recordings`)
            .then(resp => resp.data);
    }
}

export interface StoredMetadata extends WithId {
    metadata: RecordingMetadata
    thumbnail?: string;
}

export interface MetadataGroup {
    site: string;
    results: StoredMetadata[];
}