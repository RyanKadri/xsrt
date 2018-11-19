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
            mouse: new MouseEventPlayer(domManager),
            scroll: new ScrollEventPlayer(domManager, document),
            input: new InputChangePlayer(domManager),
        }
    }

    simulateUserInputs(updates: UserInputSimulationRequest[]) {
        updates.forEach(update => {
            const handler = this.channelHandlers[update.channel]
            handler.simulateInput(update.updates, update.upcoming, update.time);
        })
    }

}

export interface UserInputSimulationRequest {
    channel: string;
    updates: RecordedUserInput[]; // New inputs since the last frame
    upcoming: RecordedUserInput[];  // The next upcoming input (used for animations)
    time: number;
}

export interface UserInputPlaybackHelper<InputType extends RecordedUserInput = RecordedUserInput> {
    simulateInput(input: InputType[], upcoming: InputType[], time: number): void;
}

type ChannelHandlers = {
    [channel: string]: UserInputPlaybackHelper
}