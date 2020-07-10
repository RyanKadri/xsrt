import { chunkApiSymbol, chunkEndpointMetadata, DateManager, EndpointApi, Interface, PendingChunk, recordingApiSymbol, recordingEndpoint } from "../../../common/src";
import { inject, injectable } from "inversify";
import { compress } from "../output/output-utils";
import { toJson } from "../utils/dom-utils";
import { RecordingInfo, RecordingStateService } from "./recording-state-service";

@injectable()
export class RecorderApiService {

  constructor(
    @inject(RecordingStateService) private recordingState: Interface<RecordingStateService>,
    @inject(recordingApiSymbol) private recordingApi: EndpointApi<typeof recordingEndpoint>,
    @inject(chunkApiSymbol) private chunkApi: EndpointApi<typeof chunkEndpointMetadata>,
    private dateManager: DateManager,
  ) { }

  async startRecording(site: string): Promise<RecordingInfo> {
    const currentRecording = this.recordingState.fetchRecordingId();
    let startTime = this.recordingState.fetchStartTime();

    if (currentRecording && startTime) {
      return {
        uuid: currentRecording,
        startTime: this.dateManager.now() - startTime,
      };
    } else {
      startTime = this.dateManager.now();
      this.recordingState.saveStartTime(startTime);
      const recording = await this.recordingApi.createRecording({
        recording: { site, startTime }
      });
      this.recordingState.saveRecordingId(recording.uuid);
      return {
        uuid: recording.uuid,
        startTime: 0
      };
    }
  }

  async postToBackend(data: PendingChunk, toRecording: string, debugMode: boolean) {
    const serialized = debugMode ? toJson(data) : compress(toJson(data));
    const res = await this.chunkApi.createChunk({ chunk: serialized as any, recordingId: toRecording },
      {
        clientHeaders: Object.assign({},
          { "Content-Type": "application/json" },
          !debugMode ? { "Content-Encoding": "deflate" } : null
        )
      }
    );
    return res.uuid;
  }

}
