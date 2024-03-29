import { DateManager } from "../../../common/src";
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
    private initSession = false;

    fetchSessionStart() {
        if (!this._sessionStart || !this.recordingStart) {
            throw new Error("TimeManager not yet started");
        }
        if (!this.initSession) {
            return this._sessionStart - this.recordingStart;
        } else {
            return 0;
        }
    }

    start() {
        const recordingStart = this.recordingState.fetchStartTime();

        if (recordingStart) {
            this.recordingStart = recordingStart;
            this._sessionStart = this.dateManager.now();
        } else {
            this.recordingStart = this._sessionStart = this.dateManager.now();
            this.initSession = true;
        }
    }

    currentTime() {
        return this.dateManager.now() - this.recordingStart!;
    }

    stop() {
        return this.currentTime();
    }
}
