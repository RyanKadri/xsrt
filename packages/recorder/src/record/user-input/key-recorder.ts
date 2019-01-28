import { RecordedKeyEvent } from "@xsrt/common";
import { injectable } from "inversify";
import { UserInputRecorder } from "./input-recorder";

@injectable()
export class KeystrokeRecorder implements UserInputRecorder<KeyboardEvent, RecordedKeyEvent> {
    readonly channels = ["keyup", "keydown"];
    readonly listen = "document";
    activeKeys = new Map<string, number>();

    handle(evt: KeyboardEvent) {
        return {
            key: evt.key
        } as Partial<RecordedKeyEvent>;
    }
}
