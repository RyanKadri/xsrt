import { EndpointApi, Recording, recordingApiSymbol, recordingEndpoint, RecordingOverview } from "../../../common/src";
import { inject, injectable } from "inversify";
import { RecordingTableFilter } from "../components/dashboard/recording-table/recording-table-filter";

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
    async fetchAvailableRecordings(siteId: string, filter?: RecordingTableFilter): Promise<RecordingOverview[]> {
        const filtersWithDefaults: Partial<RecordingTableFilter> = {
            ...(filter || {})
        };
        return this.recordingApi.filterRecordings({ site: siteId, ...filtersWithDefaults } as any);
    }

    async deleteRecordings(selected: RecordingOverview[]): Promise<void> {
        if (selected.length === 1) {
            await this.recordingApi.deleteRecording({ recordingId: "" + selected[0].id });
        } else {
            await this.recordingApi.deleteMany({
                deleteRequest: { ids: selected.map(req => req.id) },
            });
        }
    }
}

export interface MetadataGroup {
    site: string;
    results: RecordingOverview[];
}
