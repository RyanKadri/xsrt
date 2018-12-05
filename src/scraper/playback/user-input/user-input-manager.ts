import { RecordedUserInput } from "../../record/user-input/input-recorder";
import { injectable, multiInject } from "inversify";
import { UserInputInterpolator } from "./interpolation/user-input-interpolator";
import { pluck, groupToMap } from "@common/utils/functional-utils";

export const IPlaybackHandler = Symbol('IPlaybackHandler');

@injectable()
export class UserInputPlaybackManager {

    private channelHandlers: Map<string, UserInputPlaybackHelper[]>;

    constructor(
        private interpolationManager: UserInputInterpolator,
        @multiInject(IPlaybackHandler) channelHandlers: UserInputPlaybackHelper[] 
    ) {
        this.channelHandlers = groupToMap(channelHandlers, pluck('channels'))
    }

    simulateUserInputs(updates: UserInputSimulationRequest[]) {
        updates.forEach(update => {
            const handlers = this.channelHandlers.get(update.channel) || [];
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
}

export interface UserInputPlaybackHelper<InputType extends RecordedUserInput = RecordedUserInput> {
    readonly channels: string[];
    simulateInput(input: InputType[]): void;
}
