import Axios from "axios";
import { inject, injectable } from "inversify";
import { RecordingApi, recordingEndpoint } from "../../api/endpoints/recordings-endpoint-metadata";
import { EndpointApi } from "../../common/server/route-types";
import { DeepPartial, Without } from "../../common/utils/type-utils";
import { compress } from "../output/output-utils";
import { ScraperConfig } from "../scraper-config";
import { extractUrlMetadata } from "../traverse/extract-metadata";
import { Recording, RecordingChunk } from "../types/types";
import { DateManager } from "../utils/time-manager";
import { toJson } from "../utils/utils";
import { RecordingInfo, RecordingStateService } from "./recording-state-service";

@injectable()
export class RecorderApiService {

    constructor(
        private recordingState: RecordingStateService,
        @inject(RecordingApi) private recordingApi: EndpointApi<typeof recordingEndpoint>,
        private dateManager: DateManager
    ) {}

    async startRecording(): Promise<RecordingInfo> {
        const currentRecording = this.recordingState.fetchRecordingId();
        let startTime = this.recordingState.fetchStartTime();

        if (currentRecording && startTime) {
            return {
                _id: currentRecording,
                startTime: this.dateManager.now() - startTime
            };
        } else {
            startTime = this.dateManager.now();
            this.recordingState.saveStartTime(startTime);
            const recording = await this.recordingApi.createRecording({
                recording: { url: extractUrlMetadata(location), startTime },
                // TODO - Some headers are specifically set. Not user-agent. Figure out how to ignore this in sig
                userAgent: "temp"
            });
            this.recordingState.saveRecordingId(recording._id);
            return {
                _id: recording._id,
                startTime: 0
            };
        }
    }

    async postToBackend(data: Without<RecordingChunk, "_id">, toRecording: string, config: ScraperConfig) {
        const serialized = config.debugMode ? toJson(data) : compress(toJson(data));
        const url = `${config.backendUrl}/api/recordings/${toRecording}/chunks`;
        const res = await Axios.post(url, serialized, {
            // Jury's out on whether this is idiomatic
            headers: Object.assign({},
                {"Content-Type": "application/json"},
                !config.debugMode ? {"Content-Encoding": "deflate"} : null
            )
        });
        return res.data._id;
    }

    async finalizeRecording(recordingId: string, config: ScraperConfig, stopTime: number) {
        const finalization: DeepPartial<Recording> = {
            finalized: true,
            metadata: {
                duration: stopTime
            }
        };
        await Axios.patch(`${config.backendUrl}/api/recordings/${recordingId}`, finalization);
    }
}
