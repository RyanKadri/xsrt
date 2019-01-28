import { RecordedUnloadEvent } from "@xsrt/common";
import { injectable } from "inversify";
import { UserInputRecorder } from "./input-recorder";

@injectable()
export class UnloadRecorder implements UserInputRecorder<Event, RecordedUnloadEvent> {
    readonly channels = ["unload"];
    readonly listen = "window";

    handle(): Partial<RecordedUnloadEvent> {
        return {
            type: "unload" as "unload",
        };
    }
}
