import { constant, initializeApp, LocalStorageService, ScraperConfig, ScraperConfigToken as ConfigToken } from "../../common/src";
import { RecorderApiService } from "./api/recorder-api-service";
import { RecordingInfo, RecordingStateService } from "./api/recording-state-service";
import { diConfig } from "./di.recorder";
import { PatchService } from "./record/patch/patch-service";
import { RecorderOrchestrator } from "./recorder-orchestrator";

export class RecorderInitializer {

    private recordingState = new RecordingStateService(new LocalStorageService(localStorage));
    private apiService?: RecorderApiService;
    private orchestrator?: RecorderOrchestrator;
    private patchService?: PatchService;
    private _isRecording: boolean = false;
    private continued = false;
    private recordingInfo?: RecordingInfo;

    checkAutoStart(): boolean {
        const activeConfig = this.recordingState.fetchActiveConfig();
        const activeRecordingId = this.recordingState.fetchRecordingId();

        if (activeConfig && activeRecordingId) {
            this.continued = true;
            this.initialize(activeConfig);
            return true;
        } else {
            return false;
        }
    }

    // TODO - I made this async in refactor but didnt look at consequences yet
    async initialize(config: ScraperConfig) {
        const injector = await initializeApp([
            constant(ConfigToken, config),
            ...diConfig
        ]);

        this.orchestrator = injector.inject(RecorderOrchestrator);
        this.recordingState = injector.inject(RecordingStateService);
        this.apiService = injector.inject(RecorderApiService);
        this.patchService = injector.inject(PatchService);

        const pendingRecordChunk = this.recordingState.fetchPendingChunk();
        if (pendingRecordChunk) {
            const activeConfig = this.recordingState.fetchActiveConfig();
            const activeRecordingId = this.recordingState.fetchRecordingId();
            this.apiService.postToBackend(pendingRecordChunk as any, activeRecordingId!, activeConfig.debugMode)
                .then(() => this.recordingState.removePendingChunk());
        }

        this.recordingState.storeConfig(config);
        this.patchService.patchGlobals();
    }

    isRecording() {
        return this._isRecording;
    }

    async start() {
        if (!this.orchestrator) {
            throw new Error("You must initialize the recorder before trying to start recording");
        } else {
            this.recordingInfo = await this.orchestrator.initialize(this.continued);
            this._isRecording = true;
        }
    }

    stop = async () => {
        if (this.orchestrator && this.isRecording) {
            this._isRecording = false;
            await this.orchestrator.onStop(this.recordingInfo!, false);
            this.recordingState.closeRecording();
        } else {
            throw new Error("Trying to stop recorder before starting");
        }
    }
}
