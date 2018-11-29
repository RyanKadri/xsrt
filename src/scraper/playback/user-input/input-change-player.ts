import { UserInputPlaybackHelper } from "./user-input-manager";
import { RecordedInputChangeEvent } from "../../record/user-input/input-event-recorder";
import { DomManager } from "../dom-manager";
import { injectable } from "inversify";

@injectable()
export class InputChangePlayer implements UserInputPlaybackHelper<RecordedInputChangeEvent> {

    readonly channels = ['input', 'change'];
    
    constructor(
        private domManager: DomManager
    ){}

    simulateInput(updates: RecordedInputChangeEvent[]) {
        const lastUpdate = updates[updates.length - 1];
        this.domManager.mutateElement(lastUpdate.target, (node) => {
            (node as HTMLInputElement).value = lastUpdate.value;
        })
    }
}