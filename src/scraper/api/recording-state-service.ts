import Axios from "axios";
import { inject, injectable } from "inversify";
import { CreateRecordingRequest } from "../../api/endpoints/recordings";
import { ScraperConfig, ScraperConfigToken } from "../scraper-config,";
import { extractUrlMetadata } from "../traverse/extract-metadata";

const localStorageRecordingId = "app.icu.recording.id";
const localStorageRecordingStart = "app.icu.recording.start";

@injectable()
export class RecordingStateService {

    constructor(
        @inject(ScraperConfigToken) private config: ScraperConfig
    ) {}

    async startRecording(): Promise<RecordingInfo> {
        const currentRecording = localStorage.getItem(localStorageRecordingId);
        const startTime = this.fetchStartTime();
        if(currentRecording && startTime) {
            return {
                _id: currentRecording,
                startTime: Date.now() - startTime
            }
        } else {
            const startTime = Date.now()
            localStorage.setItem(localStorageRecordingStart, `${startTime}`);
            const startRecordingRequest: CreateRecordingRequest = { url: extractUrlMetadata(location), startTime }
            const res = await Axios.post(`${this.config.backendUrl}/api/recordings`, startRecordingRequest)
                .then(res => res.data)
            localStorage.setItem(localStorageRecordingId, res._id);
            return {
                _id: res._id,
                startTime: 0
            }
        }
    }

    fetchStartTime() {
        const startTime = localStorage.getItem(localStorageRecordingStart);
        return startTime ? parseInt(startTime) : undefined;
    }

    closeRecording() {
        localStorage.removeItem(localStorageRecordingId);
        localStorage.removeItem(localStorageRecordingStart)
    }

    storePendingChunk() {

    }
    
}

export interface RecordingInfo {
    _id: string;
    startTime: number;
}