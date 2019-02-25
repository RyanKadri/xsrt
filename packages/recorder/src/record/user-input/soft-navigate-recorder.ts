import { DocumentSymbol, RecordedNavigationEvent } from "@xsrt/common";
import { inject, injectable } from "inversify";
import { PatchedEvent } from "./global-event-service";
import { EventSource, UserInputRecorder } from "./input-recorder";

@injectable()
export class PopStateRecorder implements UserInputRecorder<PopStateEvent | HashChangeEvent, RecordedNavigationEvent> {
    readonly sources: EventSource[] = [
        { type: "popstate", originator: "window" },
        { type: "hashchange", originator: "window" },
        { type: "pushstate", originator: "synthetic" },
        { type: "replacestate", originator: "synthetic" },
    ];

    constructor(
        @inject(DocumentSymbol) private document: Document
    ) { }

    handle(e: PopStateEvent | HashChangeEvent | PatchedEvent<string> ) {
        return {
            type: "soft-navigate" as "soft-navigate",
            url: e instanceof HashChangeEvent
                ? e.newURL
                : e instanceof PopStateEvent
                    ? this.document.location.href
                    : e.payload,
            action: e.type as RecordedNavigationEvent["action"]
        };
    }

}
