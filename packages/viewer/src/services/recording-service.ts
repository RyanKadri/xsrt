import { EndpointApi, Recording, recordingApiSymbol, recordingEndpoint, RecordingOverview } from "@xsrt/common";
import { inject, injectable } from "inversify";

@injectable()
export class RecordingApiService {

    /* istanbul ignore next */
    constructor(
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
    }
}

export interface MetadataGroup {
    site: string;
    results: RecordingOverview[];
}
