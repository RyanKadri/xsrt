import { RecordedMouseEvent, mouseRecorder } from "./mouse-recorder";
import { RecordedScrollEvent, scrollRecorder } from "./scroll-recorder";

export class CompleteInputRecorder implements UserInputRecorder<RecordedUserInput> {

    private recorders: UserInputRecorder<RecordedUserInput>[];
    
    constructor() {
        this.recorders = [
            mouseRecorder,
            scrollRecorder,
        ]
    }

    start() {
        this.recorders.forEach(rec => rec.start())    
    }

    stop() {
        return this.recorders.reduce((acc, rec) => acc.concat(rec.stop()), [] as RecordedUserInput[])
    }
}

export type RecordedUserInput = RecordedMouseEvent | RecordedScrollEvent

export interface BaseUserInput {
    timestamp: number;
    type: string;
}

export interface UserInputRecorder<InputType> {
    start();
    stop(): InputType[];
}