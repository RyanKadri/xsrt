import { inject, injectable } from "inversify";
import { RouteComponentProps } from "react-router";
import { recordingApiSymbol, recordingEndpoint } from "../../api/endpoints/recordings-endpoint-metadata";
import { EndpointApi } from "../../common/server/route-types";
import { Recording, RecordingOverview } from "../../scraper/types/types";
import { RecordingState } from "./state/recording-overview-state";
import { Resolver } from "./with-data";

@injectable()
export class RecordingApiService {

    /* istanbul ignore next */
    constructor(
        private overviewState: RecordingState,
        @inject(recordingApiSymbol) private recordingApi: EndpointApi<typeof recordingEndpoint>
    ) {}

    /* istanbul ignore next */
    async fetchRecordingData(recording: string): Promise<Recording> {
        return this.recordingApi.fetchRecording({ recordingId: recording });
    }

    /* istanbul ignore next */
    async fetchAvailableRecordings(siteId: string): Promise<RecordingOverview[]> {
        return this.recordingApi.filterRecordings({ site: siteId });
    }

    async deleteRecordings(selected: RecordingOverview[]): Promise<void> {
        if (selected.length === 1) {
            await this.recordingApi.deleteRecording({ recordingId: selected[0]._id });
        } else {
            await this.recordingApi.deleteMany({
                deleteRequest: { ids: selected.map(req => req._id) },
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
