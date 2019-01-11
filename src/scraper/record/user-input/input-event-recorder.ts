import { injectable } from "inversify";
import { RecordedInputChangeEvent } from "../../types/event-types";
import { RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class HtmlInputRecorder implements UserInputRecorder<Event, RecordedInputChangeEvent> {
    readonly channels = ["input", "change"];
    readonly listen = "document";

    handle(evt: Event, { target }: RecordedEventContext) {
        if (!target) { throw new Error("Could not replay input to undefined target"); }
        const value = this.extractValue(evt.target as HTMLInputElement);
        return {
            target: target.id,
            value
        };
    }

    private extractValue(el: HTMLInputElement) {
        if (el.type === "checkbox") {
            return el.checked;
        } else {
            return el.value;
        }
    }
}
