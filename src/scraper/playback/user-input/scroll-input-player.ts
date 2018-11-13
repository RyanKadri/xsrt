import { RecordedScrollEvent } from "../../record/user-input/scroll-recorder";
import { UserInputPlaybackHelper } from "./user-input-manager";
import { DomManager } from "../dom-utils";

export class ScrollEventPlayer implements UserInputPlaybackHelper<RecordedScrollEvent> {

    constructor(
        private domManager: DomManager
    ){}

    simulateInput(updates: RecordedScrollEvent[]) {
        const lastUpdate = updates[updates.length - 1];
        if(lastUpdate.target) {
            this.domManager.mutateElement(lastUpdate.target, (node) => {
                node.scrollTop = lastUpdate.scrollY;
                node.scrollLeft = lastUpdate.scrollX;
            })
        } else {
            window.scroll(lastUpdate.scrollX, lastUpdate.scrollY);
        }
    }
}