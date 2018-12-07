import { injectable } from "inversify";
import { DedupedData, WithId } from "../../scraper/types/types";
import axios from "axios";
import { Resolver } from "./with-data";
import { RouteComponentProps } from "react-router";
import { RecordedMetadata } from "../../api/types";

@injectable()
export class RecordingApiService {

    async fetchRecordingData(recording: string): Promise<DedupedData> {
        const data = await fetch(`/api/recordings/${recording}`);
        return await data.json();
    }

    async fetchAvailableRecordings(id: string): Promise<StoredMetadata[]> {
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
    
    resolve(routeParams: RouteComponentProps<{recordingId: string}>) {
        return this.recordingService.fetchRecordingData(routeParams.match.params.recordingId);
    }
}

export interface StoredMetadata extends WithId {
    metadata: RecordedMetadata;
    _id: string;
    thumbnail?: string;
}

export interface MetadataGroup {
    site: string;
    results: StoredMetadata[];
}