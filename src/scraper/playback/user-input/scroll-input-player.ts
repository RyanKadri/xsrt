import { injectable } from "inversify";
import { RecordedScrollEvent } from '../../types/event-types';
import { DomManager } from "../dom-manager";
import { UserInputPlaybackHelper } from "./user-input-manager";

@injectable()
export class ScrollEventPlayer implements UserInputPlaybackHelper<RecordedScrollEvent> {

    constructor(
        private domManager: DomManager,
    ){}

    channels = ['scroll'];

    simulateInput(updates: RecordedScrollEvent[]) {
        const lastUpdate = updates[updates.length - 1];
        if(lastUpdate.target) {
            this.domManager.mutateElement(lastUpdate.target, (node) => {
                node.scrollTop = lastUpdate.scrollY;
                node.scrollLeft = lastUpdate.scrollX;
            })
        } else {
            this.domManager.mutateDocument(document => {
                document.documentElement!.scroll(lastUpdate.scrollX, lastUpdate.scrollY);
            })
        }
    }
}