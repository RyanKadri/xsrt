import { injectable } from "inversify";
import { RecorderApiService } from "./api/recorder-api-service";
import { RecordingStateService } from "./api/recording-state-service";
import { RecorderContainer } from "./inversify.recorder";
import { RecorderOrchestrator } from "./recorder-orchestrator";
import { ScraperConfig, ScraperConfigToken } from "./scraper-config,";

@injectable()
export class RecorderInitializer {

    private recordingState = new RecordingStateService();
    private apiService?: RecorderApiService;
    private orchestrator?: RecorderOrchestrator;

    checkAutoStart(): boolean {
        const activeConfig = this.recordingState.fetchActiveConfig();
        const activeRecordingId = this.recordingState.fetchRecordingId();
        const pendingRecordChunk = this.recordingState.fetchPendingChunk();

        if(activeConfig && activeRecordingId) {
            this.initialize(activeConfig);

            if(pendingRecordChunk) {
                this.apiService!.postToBackend(pendingRecordChunk, activeRecordingId, activeConfig)
                    .then(() => this.recordingState.removePendingChunk());
            }
            return true;
        } else {
            return false;
        }
    }

    initialize(config: ScraperConfig) {
        RecorderContainer.bind(ScraperConfigToken).toConstantValue(config);
        this.orchestrator = RecorderContainer.get(RecorderOrchestrator);
        this.recordingState = RecorderContainer.get(RecordingStateService);
        this.apiService = RecorderContainer.get(RecorderApiService);
        
        this.recordingState.storeConfig(config);
        this.orchestrator.initialize();
    }

    async stop() {
        if(this.orchestrator) {
            await this.orchestrator.onStop(false);
            this.recordingState.closeRecording()
        } else {
            throw new Error('Trying to stop recorder before starting');
        }
    }
}