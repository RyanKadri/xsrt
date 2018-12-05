import { injectable } from "inversify";
import { DedupedData, WithId } from "../../scraper/types/types";
import { RecordingMetadata } from "../../scraper/traverse/extract-metadata";
import axios from "axios";
import { Resolver } from "./with-data";
import { RouteComponentProps } from "react-router";

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

@injectable()
export class RecordingMetadataResolver implements Resolver {
    
    constructor(
        private recordingService: RecordingApiService
    ) {}
    
    resolve(routeParams: RouteComponentProps<{siteId: string}>) {
        return this.recordingService.fetchAvailableRecordings(routeParams.match.params.siteId);
    }
}

@injectable()
export class RecordingResolver implements Resolver {
    
    constructor(
        private recordingService: RecordingApiService
    ) {}
    
    resolve(routeParams: RouteComponentProps<{routeId: string}>) {
        return this.recordingService.fetchRecordingData(routeParams.match.params.routeId);
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