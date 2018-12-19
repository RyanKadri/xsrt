import { injectable } from "inversify";
import { RecordingStateService } from "../api/recording-state-service";

@injectable()
export class TimeManager {

    constructor(
        private recordingState: RecordingStateService
    ) {}

    private recordingStart?: number;
    private _sessionStart?: number;

    get sessionStart () {
        if(!this._sessionStart || !this.recordingStart) {
            throw new Error("TimeManager not yet started");
        }
        return this._sessionStart - this.recordingStart;
    }

    start() {
        const recordingStart = this.recordingState.fetchStartTime();

        if(recordingStart) {
            this.recordingStart = recordingStart;
            this._sessionStart = Date.now();
        } else {
            this.recordingStart = this._sessionStart = Date.now();
        }
    }

    currentTime() {
        return Date.now() - this.recordingStart!;
    }

    stop() {
        return this.currentTime();
    }
}