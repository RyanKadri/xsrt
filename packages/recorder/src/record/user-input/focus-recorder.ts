import { RecordedFocusEvent } from "@xsrt/common";
import { injectable } from "inversify";
import { EventSource, RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class FocusRecorder implements UserInputRecorder<FocusEvent, RecordedFocusEvent> {

    readonly sources: EventSource[] = [
        { type: "focus", originator: "document" },
        { type: "blur", originator: "document" }
    ];

    handle(_: FocusEvent, { target }: RecordedEventContext ) {
        return {
            target: target !== undefined ? target.id : undefined,
        };
    }
}
