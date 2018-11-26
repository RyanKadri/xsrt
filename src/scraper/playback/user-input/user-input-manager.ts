import { RecordedUserInput } from "../../record/user-input/input-recorder";
import { injectable, multiInject } from "inversify";
import { group, pluck } from "../../utils/utils";
import { UserInputInterpolator } from "./interpolation/user-input-interpolator";

export const IPlaybackHandler = Symbol('IPlaybackHandler');

@injectable()
export class UserInputPlaybackManager {

    private channelHandlers: ChannelHandlers;
    constructor(
        private interpolationManager: UserInputInterpolator,
        @multiInject(IPlaybackHandler) channelHandlers: UserInputPlaybackHelper[] 
    ) {
        this.channelHandlers = group(channelHandlers, pluck('channels'))
            .reduce((acc, {group, items}) => {
                acc[group] = items;
                return acc;
            }, {});
    }

    simulateUserInputs(updates: UserInputSimulationRequest[]) {
        updates.forEach(update => {
            const handlers = this.channelHandlers[update.channel]
            const interpolatedUpdates = this.interpolationManager.interpolate(update.channel, update.updates);
            handlers.forEach(handler => {
                handler.simulateInput(interpolatedUpdates);
            })
        })
    }

}

export interface UserInputSimulationRequest {
    channel: string;
    updates: RecordedUserInput[]; // New inputs since the last frame
    time: number;
}

export interface UserInputPlaybackHelper<InputType extends RecordedUserInput = RecordedUserInput> {
    readonly channels: string[];
    simulateInput(input: InputType[]): void;
}

type ChannelHandlers = {
    [channel: string]: UserInputPlaybackHelper[]
}