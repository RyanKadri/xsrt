import Axios from "axios";
import { inject, injectable } from "inversify";
import { CreateRecordingRequest } from "../../api/endpoints/recordings-endpoint-metadata";
import { DeepPartial, Without } from "../../common/utils/type-utils";
import { compress } from "../output/output-utils";
import { ScraperConfig, ScraperConfigToken } from "../scraper-config";
import { extractUrlMetadata } from "../traverse/extract-metadata";
import { Recording, RecordingChunk } from "../types/types";
import { toJson } from "../utils/utils";
import { RecordingInfo, RecordingStateService } from "./recording-state-service";

@injectable()
export class RecorderApiService {

    constructor(
        @inject(ScraperConfigToken) private config: ScraperConfig,
        private recordingState: RecordingStateService
    ) {}

    async startRecording(): Promise<RecordingInfo> {
        const currentRecording = this.recordingState.fetchRecordingId();
        let startTime = this.recordingState.fetchStartTime();

        if (currentRecording && startTime) {
            return {
                _id: currentRecording,
                startTime: Date.now() - startTime
            };
        } else {
            startTime = Date.now();
            this.recordingState.recordStartTime(startTime);
            const startRecordingRequest: CreateRecordingRequest = { url: extractUrlMetadata(location), startTime };
            const recording = await Axios.post(`${this.config.backendUrl}/api/recordings`, startRecordingRequest)
                .then(resp => resp.data);
            this.recordingState.recordRecordingId(recording._id);
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
