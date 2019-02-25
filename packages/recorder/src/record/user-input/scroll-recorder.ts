import { RecordedScrollEvent } from "@xsrt/common";
import { injectable } from "inversify";
import { EventSource, RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class ScrollRecorder implements UserInputRecorder<UIEvent, RecordedScrollEvent> {
    readonly sources: EventSource[] = [
        { type: "scroll", originator: "document" }
    ];

    handle(_: UIEvent, { target }: RecordedEventContext): Partial<RecordedScrollEvent> {
        const domElement = target ? target.domElement : undefined;
        if (target && !domElement) { throw new Error(`Could not read scroll pos from ${target}`); }
        return {
            target: target ? target.id : undefined,
            scrollX: domElement ? domElement.scrollLeft : window.scrollX,
            scrollY: domElement ? domElement.scrollTop : window.scrollY
        };
    }
}
