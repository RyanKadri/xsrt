import { constant, initializeApp, LocalStorageService, ScraperConfig, ScraperConfigToken as ConfigToken } from "@xsrt/common";
import { RecorderApiService } from "./api/recorder-api-service";
import { RecordingStateService } from "./api/recording-state-service";
import { diConfig } from "./di.recorder";
import { RecorderOrchestrator } from "./recorder-orchestrator";

export class RecorderInitializer {

    private recordingState = new RecordingStateService(new LocalStorageService(localStorage));
    private apiService?: RecorderApiService;
    private orchestrator?: RecorderOrchestrator;

    checkAutoStart(): boolean {
        const activeConfig = this.recordingState.fetchActiveConfig();
        const activeRecordingId = this.recordingState.fetchRecordingId();

        if (activeConfig && activeRecordingId) {
            this.initialize(activeConfig);

            return true;
        } else {
            return false;
        }
    }

    initialize(config: ScraperConfig) {
        const injector = initializeApp([
            constant(ConfigToken, config),
            ...diConfig
        ]);

        this.orchestrator = injector.inject(RecorderOrchestrator);
        this.recordingState = injector.inject(RecordingStateService);
        this.apiService = injector.inject(RecorderApiService);

        const pendingRecordChunk = this.recordingState.fetchPendingChunk();
        if (pendingRecordChunk) {
            const activeConfig = this.recordingState.fetchActiveConfig();
            const activeRecordingId = this.recordingState.fetchRecordingId();
            this.apiService.postToBackend(pendingRecordChunk as any, activeRecordingId!, activeConfig.debugMode)
                .then(() => this.recordingState.removePendingChunk());
        }

        this.recordingState.storeConfig(config);
        this.orchestrator.initialize();
    }

    stop = async () => {
        if (this.orchestrator) {
            await this.orchestrator.onStop(false);
            this.recordingState.closeRecording();
        } else {
            throw new Error("Trying to stop recorder before starting");
        }
    }
}
