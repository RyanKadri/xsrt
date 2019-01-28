import { RecordedResize } from "@xsrt/common";
import { injectable } from "inversify";
import { UserInputRecorder } from "./input-recorder";

@injectable()
export class ResizeRecorder implements UserInputRecorder<Event, RecordedResize> {
    readonly channels = ["resize"];
    readonly listen = "window";

    handle(evt: Event) {
        const window = evt.currentTarget as Window;
        return {
            type: "resize" as "resize",
            height: window.innerHeight,
            width: window.innerWidth
        };
    }
}
