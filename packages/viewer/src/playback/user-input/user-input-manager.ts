import { Group, groupToMap, pluck, RecordedUserInput } from "@xsrt/common";
import { injectable, multiInject } from "inversify";
import { UserInputInterpolator } from "./interpolation/user-input-interpolator";

export const IPlaybackHandler = Symbol("IPlaybackHandler");

@injectable()
export class UserInputPlaybackManager {

    private channelHandlers: Map<string, UserInputPlaybackHelper[]>;

    constructor(
        private interpolationManager: UserInputInterpolator,
        @multiInject(IPlaybackHandler) channelHandlers: UserInputPlaybackHelper[]
    ) {
        this.channelHandlers = groupToMap(channelHandlers, pluck("channels"));
    }

    simulateUserInputs(groups: Group<RecordedUserInput>[]) {
        groups.forEach(group => {
            const handlers = this.channelHandlers.get(group.name) || [];
            const interpolatedUpdates = this.interpolationManager.interpolate(group.name, group.elements);
            handlers.forEach(handler => {
                handler.simulateInput(interpolatedUpdates);
            });
        });
    }

}

export interface UserInputPlaybackHelper<InputType extends RecordedUserInput = RecordedUserInput> {
    readonly channels: string[];
    simulateInput(input: InputType[]): void;
}
