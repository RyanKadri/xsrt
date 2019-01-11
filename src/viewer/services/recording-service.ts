import axios from "axios";
import { injectable } from "inversify";
import { RouteComponentProps } from "react-router";
import { Recording, RecordingOverview } from "../../scraper/types/types";
import { RecordingState } from "./state/recording-overview-state";
import { Resolver } from "./with-data";

@injectable()
export class RecordingApiService {

    constructor(
        private overviewState: RecordingState
    ) {}

    async fetchRecordingData(recording: string): Promise<Recording> {
        return axios.get(`/api/recordings/${recording}`)
            .then(resp => resp.data);
    }

    async fetchAvailableRecordings(id: string): Promise<RecordingOverview[]> {
        return axios.get(`/api/recordings?site=${id}`)
            .then(resp => resp.data);
    }

    async deleteRecordings(selected: RecordingOverview[]): Promise<void> {
        if (selected.length === 1) {
            await axios.delete(`/api/recordings/${selected[0]._id}`);
        } else {
            await axios.post("/api/recordings/delete-many", {
                ids: selected.map(req => req._id)
            });
        }
        this.overviewState.delete(selected);
    }
}

@injectable()
export class RecordingMetadataResolver implements Resolver<RecordingOverview> {

    constructor(
        private recordingService: RecordingApiService
    ) {}

    resolve(routeParams: RouteComponentProps<{siteId: string}>) {
        return this.recordingService.fetchAvailableRecordings(routeParams.match.params.siteId);
    }
}

@injectable()
export class RecordingResolver implements Resolver<Recording> {

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
