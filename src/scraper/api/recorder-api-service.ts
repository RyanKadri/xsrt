import { inject, injectable } from "inversify";
import { chunkApiSymbol, chunkEndpointMetadata } from "../../api/endpoints/chunk-endpoint-metadata";
import { recordingApiSymbol, recordingEndpoint } from "../../api/endpoints/recordings-endpoint-metadata";
import { EndpointApi } from "../../common/server/route-types";
import { Interface, Without } from "../../common/utils/type-utils";
import { LocationSymbol } from "../di.tokens";
import { compress } from "../output/output-utils";
import { extractUrlMetadata } from "../traverse/extract-metadata";
import { RecordingChunk } from "../types/types";
import { DateManager } from "../utils/time-manager";
import { toJson } from "../utils/utils";
import { RecordingInfo, RecordingStateService } from "./recording-state-service";

@injectable()
export class RecorderApiService {

    constructor(
        @inject(RecordingStateService) private recordingState: Interface<RecordingStateService>,
        @inject(recordingApiSymbol) private recordingApi: EndpointApi<typeof recordingEndpoint>,
        @inject(chunkApiSymbol) private chunkApi: EndpointApi<typeof chunkEndpointMetadata>,
        private dateManager: DateManager,
        @inject(LocationSymbol) private location: Interface<Location>
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
                recording: { url: extractUrlMetadata(this.location), startTime },
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

    async postToBackend(data: Without<RecordingChunk, "_id">, toRecording: string, debugMode: boolean) {
        const serialized = debugMode ? toJson(data) : compress(toJson(data));
        const res = await this.chunkApi.createChunk({ chunk: serialized as any, recordingId: toRecording },
            { clientHeaders: Object.assign({},
                {"Content-Type": "application/json"},
                !debugMode ? {"Content-Encoding": "deflate"} : null
            )}
        );
        return res._id;
    }

    async finalizeRecording(recordingId: string, stopTime: number) {
        await this.recordingApi.patchRecording({ recordingId, patchData: {
            finalized: true,
            metadata: {
                duration: stopTime
            }
        }});
    }
}
