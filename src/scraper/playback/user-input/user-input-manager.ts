import { RecordedUserInput } from "../../record/user-input/input-recorder";
import { MouseEventPlayer } from "./mouse-input-player";
import { ScrollEventPlayer } from "./scroll-input-player";
import { DomManager } from "../dom-utils";
import { InputChangePlayer } from "./input-change-player";

export class UserInputPlaybackManager {

    private channelHandlers: ChannelHandlers;

    constructor(
        document: Document,
        domManager: DomManager
    ) {
        this.channelHandlers = {
            mouse: new MouseEventPlayer(document),
            scroll: new ScrollEventPlayer(domManager),
            input: new InputChangePlayer(domManager),
        }
    }

    simulateUserInputs(updates: UserInputSimulationRequest[]) {
        updates.forEach(update => {
            const handler = this.channelHandlers[update.channel]
            handler.simulateInput(update.updates, update.preview);
        })
    }

}

export interface UserInputSimulationRequest {
    channel: string;
    updates: RecordedUserInput[]; // New inputs since the last frame
    preview?: RecordedUserInput;  // The next upcoming input (used for animations)
}

export interface UserInputPlaybackHelper<InputType extends RecordedUserInput = RecordedUserInput> {
    simulateInput(input: InputType[], preview?: InputType): void;
}

type ChannelHandlers = {
    [channel: string]: UserInputPlaybackHelper
}