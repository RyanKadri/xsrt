import { LocalStorageService, RecordingChunk, ScraperConfig, PendingChunk } from "@xsrt/common";
import { injectable } from "inversify";

const localStorageRecordingId = "xsrt.recording.id";
const localStorageRecordingStart = "xsrt.recording.start";
const localStorageScrapeConfig = "xsrt.recording.config";
const localStoragePendingChunk = "xsrt.recording.pendingChunk";

/* istanbul ignore next */
@injectable()
export class RecordingStateService {

    constructor(
        private storageService: LocalStorageService
    ) {}

    storeConfig(config: ScraperConfig): void {
        this.storageService.saveItem(localStorageScrapeConfig, config);
    }

    saveRecordingId(_id: string): void {
        this.storageService.saveItem(localStorageRecordingId, _id);
    }

    saveStartTime(startTime: number): void {
        this.storageService.saveItem(localStorageRecordingStart, startTime);
    }

    savePendingChunk(chunk: PendingChunk) {
        this.storageService.saveItem(localStoragePendingChunk, chunk);
    }

    removePendingChunk(): void {
        this.storageService.removeItem(localStoragePendingChunk);
    }

    fetchActiveConfig(): ScraperConfig {
        return this.storageService.fetchItem(localStorageScrapeConfig, { type: "object" });
    }

    fetchRecordingId(): string | undefined {
        return this.storageService.fetchItem(localStorageRecordingId);
    }

    fetchPendingChunk(): RecordingChunk | undefined {
        return this.storageService.fetchItem(localStoragePendingChunk, { type: "object" });
    }

    fetchStartTime() {
        return this.storageService.fetchItem(localStorageRecordingStart, { type: "number" });
    }

    closeRecording() {
        this.storageService.removeItem(localStorageRecordingId);
        this.storageService.removeItem(localStorageRecordingStart);
        this.storageService.removeItem(localStorageScrapeConfig);
        this.storageService.removeItem(localStoragePendingChunk);
    }

}

export interface RecordingInfo {
    _id: string;
    startTime: number;
}
