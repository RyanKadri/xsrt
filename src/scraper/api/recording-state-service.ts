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
        const startTime = localStorage.getItem(localStorageRecordingStart);
        if(currentRecording && startTime) {
            return {
                _id: currentRecording,
                startTime: Date.now() - parseInt(startTime)
            }
        } else {
            const startRecordingRequest: CreateRecordingRequest = { url: extractUrlMetadata(location), startTime: Date.now() }
            const res = await Axios.post(`${this.config.backendUrl}/api/recordings`, startRecordingRequest)
                .then(res => res.data)
            localStorage.setItem(localStorageRecordingId, res._id);
            localStorage.setItem(localStorageRecordingStart, `${startRecordingRequest.startTime}`);
            return {
                _id: res._id,
                startTime: 0
            }
        }
    }

    closeRecording() {
        localStorage.removeItem(localStorageRecordingId);
        localStorage.removeItem(localStorageRecordingStart)
    }
    
}

export interface RecordingInfo {
    _id: string;
    startTime: number;
}