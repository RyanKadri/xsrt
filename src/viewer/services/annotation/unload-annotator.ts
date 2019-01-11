import { injectable } from "inversify";
import { RecordedUnloadEvent } from "../../../scraper/types/event-types";
import { InputAnnotator } from "./annotation-service";

@injectable()
export class UnloadAnnotator implements InputAnnotator<RecordedUnloadEvent> {
    readonly listen = "input";
    readonly type = "unload";

    annotate(_: RecordedUnloadEvent) {
        return {
            description: `The user unloaded the page`,
        };
    }
}
