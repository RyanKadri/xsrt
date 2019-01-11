import { injectable } from "inversify";
import { RecordedUnloadEvent } from "../../types/event-types";
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
