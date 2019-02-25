import { injectable } from "inversify";
import { GlobalEventService } from "../user-input/global-event-service";

@injectable()
export class PatchService {

    constructor(
        private eventService: GlobalEventService
    ) { }

    patchGlobals(): void {
        const oldPushState = history.pushState.bind(history);
        history.pushState = (data, title, url) => {
            this.eventService.fireSyntheticEvent({ type: "pushstate", payload: url });
            oldPushState(data, title, url);
        };
        const oldReplaceState = history.replaceState.bind(history);
        history.replaceState = (data, title, url) => {
            this.eventService.fireSyntheticEvent({ type: "replacestate", payload: url });
            oldReplaceState(data, title, url);
        };
    }

}
