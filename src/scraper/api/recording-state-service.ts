import { injectable } from "inversify";
import { Without } from "../../common/utils/type-utils";
import { ScraperConfig } from "../scraper-config";
import { RecordingChunk } from "../types/types";

const localStorageRecordingId = "xsrt.recording.id";
const localStorageRecordingStart = "xsrt.recording.start";
const localStorageScrapeConfig = "xsrt.recording.config";
const localStoragePendingChunk = "xsrt.recording.pendingChunk";

@injectable()
export class RecordingStateService {
    storeConfig(config: ScraperConfig): void {
        localStorage.setItem(localStorageScrapeConfig, JSON.stringify(config));
    }

    recordRecordingId(_id: string): void {
        localStorage.setItem(localStorageRecordingId, _id);
    }

    recordStartTime(startTime: number): void {
        localStorage.setItem(localStorageRecordingStart, `${startTime}`);
    }

    storePendingChunk(chunk: Without<RecordingChunk, "_id">) {
        localStorage.setItem(localStoragePendingChunk, JSON.stringify(chunk));
    }

    removePendingChunk(): void {
        localStorage.removeItem(localStoragePendingChunk);
    }

    fetchActiveConfig(): ScraperConfig {
        const config = localStorage.getItem(localStorageScrapeConfig);
        return config ? JSON.parse(config) : undefined;
    }

    fetchRecordingId(): string | undefined {
        const recordingId = localStorage.getItem(localStorageRecordingId);
        return recordingId ? recordingId : undefined;
    }

    fetchPendingChunk(): RecordingChunk | undefined {
        const pendingChunk = localStorage.getItem(localStoragePendingChunk);
        return pendingChunk ? JSON.parse(pendingChunk) : undefined;
    }

    fetchStartTime() {
        const startTime = localStorage.getItem(localStorageRecordingStart);
        return startTime ? parseInt(startTime, 10) : undefined;
    }

    closeRecording() {
        localStorage.removeItem(localStorageRecordingId);
        localStorage.removeItem(localStorageRecordingStart);
        localStorage.removeItem(localStorageScrapeConfig);
        localStorage.removeItem(localStoragePendingChunk);
    }

}

export interface RecordingInfo {
    _id: string;
    startTime: number;
}
