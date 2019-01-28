import { DateManager } from "@xsrt/common";
import { inject, injectable } from "inversify";
import { RecordingStateService } from "../api/recording-state-service";

@injectable()
export class TimeManager {

    constructor(
        @inject(RecordingStateService) private recordingState: Pick<RecordingStateService, "fetchStartTime">,
        private dateManager: DateManager
    ) {}

    private recordingStart?: number;
    private _sessionStart?: number;

    fetchSessionStart() {
        if (!this._sessionStart || !this.recordingStart) {
            throw new Error("TimeManager not yet started");
        }
        return this._sessionStart - this.recordingStart;
    }

    start() {
        const recordingStart = this.recordingState.fetchStartTime();

        if (recordingStart) {
            this.recordingStart = recordingStart;
            this._sessionStart = this.dateManager.now();
        } else {
            this.recordingStart = this._sessionStart = this.dateManager.now();
        }
    }

    currentTime() {
        return this.dateManager.now() - this.recordingStart!;
    }

    stop() {
        return this.currentTime();
    }
}
