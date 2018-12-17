import { injectable } from "inversify";

@injectable()
export class TimeManager {

    private startTime?: number;

    start() {
        this.startTime = Date.now();
        return this.startTime;
    }

    currentTime() {
        return Date.now() - this.startTime!;
    }

    stop() {
        return this.currentTime();
    }
}