import { LoggingService, PendingChunk, ScraperConfig, ScraperConfigToken } from "../../common/src";
import { inject, injectable } from "inversify";
import { RecorderApiService } from "./api/recorder-api-service";
import { RecordingInfo, RecordingStateService } from "./api/recording-state-service";
import { chunkMutationLimit } from "./record/dom-changes/mutation-tracker";
import { GlobalEventService } from "./record/user-input/global-event-service";
import { Recorder } from "./recorder";

const unloadEvent = "unload";

@injectable()
export class RecorderOrchestrator {

    constructor(
        private recorderApi: RecorderApiService,
        private recorderState: RecordingStateService,
        private recorder: Recorder,
        @inject(ScraperConfigToken) private config: ScraperConfig,
        private eventService: GlobalEventService,
        private logger: LoggingService
    ) { }

    private unloadHandler?: number;
    private latestEnd = 0;

    async initialize(continued: boolean) {
        const initInfo = await this.recorderApi.startRecording(this.config.site);
        this.recorder.record();

        this.unloadHandler = this.eventService.addEventListener(unloadEvent,
            () => this.onUnload(initInfo),
            { target: "window" }
        );
        const initSnapshot = this.recorder.createSnapshotChunk(initInfo, !continued);

        this.reportChunk(initSnapshot, initInfo, false);
        this.startCollectingDiffs(initInfo);
        return initInfo;
    }

    onUnload = (recordingInfo: RecordingInfo) => {
        this.onStop(recordingInfo, true);
    }

    onStop = async (recordingInfo: RecordingInfo, isUnloading: boolean) => {
        if (!recordingInfo) {
            this.logger.warn("Recording stopped before initialization. Not saving");
            return;
        }
        const chunk = this.recorder.dumpDiff(recordingInfo, true);
        if (!isUnloading && this.unloadHandler) {
            this.eventService.removeEventListener(this.unloadHandler);
        }
        this.reportChunk(chunk, recordingInfo, isUnloading);
    }

    private startCollectingDiffs(initInfo: RecordingInfo) {
        // TODO - requestIdleCallback maybe?
        this.eventService.addEventListener(chunkMutationLimit, async () => {
            const diff = this.recorder.dumpDiff(initInfo, false);
            this.reportChunk(diff, initInfo, false);
        }, { target: "synthetic" });
    }

    private reportChunk(chunk: PendingChunk, initInfo: RecordingInfo, unloading: boolean) {
        if (!unloading) {
            this.latestEnd = Math.max(chunk.endTime, this.latestEnd),
            this.recorderApi.postToBackend(chunk, initInfo.uuid, this.config.debugMode);
        } else {
            this.recorderState.savePendingChunk(chunk);
        }
    }

}
