export class TimeManager {

    private startTime?: number;
    private stopTime?: number;

    start() {
        this.startTime = Date.now();
        return this.startTime;
    }

    currentTime() {
        return Date.now() - this.startTime!;
    }

    stop() {
        this.stopTime = Date.now();
        return this.stopTime;
    }
}