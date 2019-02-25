import { RecordedUnloadEvent } from "@xsrt/common";
import { injectable } from "inversify";
import { EventSource, UserInputRecorder } from "./input-recorder";

@injectable()
export class UnloadRecorder implements UserInputRecorder<Event, RecordedUnloadEvent> {
    readonly sources: EventSource[] = [
        { type: "unload", originator: "window" }
    ];

    handle(): Partial<RecordedUnloadEvent> {
        return {
            type: "unload" as "unload",
        };
    }
}
