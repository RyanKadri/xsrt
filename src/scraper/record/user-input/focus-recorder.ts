import { injectable } from "inversify";
import { RecordedFocusEvent } from "../../types/event-types";
import { RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class FocusRecorder implements UserInputRecorder<FocusEvent, RecordedFocusEvent> {
    readonly channels = ["focus", "blur"];
    readonly listen = "document";

    handle(_: FocusEvent, { target }: RecordedEventContext ) {
        return {
            target: target !== undefined ? target.id : undefined,
        };
    }
}
