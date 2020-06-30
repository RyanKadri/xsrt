import { RecordedKeyEvent } from "../../../../common/src";
import { injectable } from "inversify";
import { EventSource, UserInputRecorder } from "./input-recorder";

@injectable()
export class KeystrokeRecorder implements UserInputRecorder<KeyboardEvent, RecordedKeyEvent> {
    readonly sources: EventSource[] = [
        { type: "keyup", originator: "document" },
        { type: "keydown", originator: "document" }
    ];

    activeKeys = new Map<string, number>();

    handle(evt: KeyboardEvent) {
        return {
            key: evt.key
        } as Partial<RecordedKeyEvent>;
    }
}
