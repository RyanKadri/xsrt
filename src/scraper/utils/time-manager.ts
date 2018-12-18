import { injectable } from "inversify";
import { RecordingStateService } from "../api/recording-state-service";

@injectable()
export class TimeManager {

    constructor(
        private recordingState: RecordingStateService
    ) {}

    private startTime?: number;

    start() {
        const startTime = this.recordingState.fetchStartTime();
        if(startTime) {
            this.startTime = startTime;
        } else {
            this.startTime = Date.now();
        }
        return this.startTime;
    }

    currentTime() {
        return Date.now() - this.startTime!;
    }

    stop() {
        return this.currentTime();
    }
}