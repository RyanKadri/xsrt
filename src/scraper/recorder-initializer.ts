import "reflect-metadata";
import { constant, initializeApp } from "../common/services/app-initializer";
import { LocalStorageService } from "../common/utils/local-storage.service";
import { RecorderApiService } from "./api/recorder-api-service";
import { RecordingStateService } from "./api/recording-state-service";
import { diConfig } from "./di.recorder";
import { RecorderOrchestrator } from "./recorder-orchestrator";
import { ScraperConfig, ScraperConfigToken as ConfigToken } from "./scraper-config";

export class RecorderInitializer {

    private recordingState = new RecordingStateService(new LocalStorageService(localStorage));
    private apiService?: RecorderApiService;
    private orchestrator?: RecorderOrchestrator;

    checkAutoStart(): boolean {
        const activeConfig = this.recordingState.fetchActiveConfig();
        const activeRecordingId = this.recordingState.fetchRecordingId();
        const pendingRecordChunk = this.recordingState.fetchPendingChunk();

        if (activeConfig && activeRecordingId) {
            this.initialize(activeConfig);

            if (pendingRecordChunk) {
                this.apiService!.postToBackend(pendingRecordChunk, activeRecordingId, activeConfig.debugMode)
                    .then(() => this.recordingState.removePendingChunk());
            }
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

        this.recordingState.storeConfig(config);
        this.orchestrator.initialize();
    }

    async stop() {
        if (this.orchestrator) {
            await this.orchestrator.onStop(false);
            this.recordingState.closeRecording();
        } else {
            throw new Error("Trying to stop recorder before starting");
        }
    }
}
