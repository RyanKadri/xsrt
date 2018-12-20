import { groupToMap, pluck } from "@common/utils/functional-utils";
import { injectable, multiInject } from "inversify";
import { Group } from "../../../common/utils/type-utils";
import { RecordedUserInput } from "../../record/user-input/input-recorder";
import { UserInputInterpolator } from "./interpolation/user-input-interpolator";

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

    simulateUserInputs(groups: Group<RecordedUserInput>[]) {
        groups.forEach(group => {
            const handlers = this.channelHandlers.get(group.name) || [];
            const interpolatedUpdates = this.interpolationManager.interpolate(group.name, group.elements);
            handlers.forEach(handler => {
                handler.simulateInput(interpolatedUpdates);
            })
        })
    }

}

export interface UserInputPlaybackHelper<InputType extends RecordedUserInput = RecordedUserInput> {
    readonly channels: string[];
    simulateInput(input: InputType[]): void;
}
