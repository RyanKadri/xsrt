import { RecordedInputChangeEvent } from "../../../../common/src";
import { injectable } from "inversify";
import { EventSource, RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class HtmlInputRecorder implements UserInputRecorder<Event, RecordedInputChangeEvent> {

    readonly sources: EventSource[] = [
        { type: "input", originator: "document" },
        { type: "change", originator: "document" }
    ];

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
