import { injectable } from "inversify";
import { DedupedData, WithId } from "../../scraper/types/types";
import { RecordingMetadata } from "../../scraper/traverse/extract-metadata";
import axios from "axios";

@injectable()
export class RecordingApiService {

    //TODO - This whole deflation part should be handled by native browser stuff on the receiving end.
    async fetchRecordingData(recording: string): Promise<DedupedData> {
        const data = await fetch(`/api/recordings/${recording}`);
        return await data.json();
    }

    async fetchAvailableRecordings(id: string): Promise<Partial<DedupedData>[]> {
        return axios.get(`/api/recordings?site=${id}`)
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