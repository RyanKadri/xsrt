import axios from "axios";
import { injectable } from "inversify";
import { RouteComponentProps } from "react-router";
import { Recording, RecordingOverview } from "../../scraper/types/types";
import { Resolver } from "./with-data";

@injectable()
export class RecordingApiService {

    async fetchRecordingData(recording: string): Promise<Recording> {
        const data = await fetch(`/api/recordings/${recording}`);
        return await data.json();
    }

    async fetchAvailableRecordings(id: string): Promise<RecordingOverview[]> {
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

export interface MetadataGroup {
    site: string;
    results: RecordingOverview[];
}