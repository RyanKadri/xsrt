import { injectable, multiInject } from "inversify";
import { RecordedUserInput } from "../../../types/event-types";

export const IInterpolationHelper = Symbol("InterpolationHelper");

@injectable()
export class UserInputInterpolator {

    private interpolators = new Map<string, InterpolationHelper>();
    constructor(
        @multiInject(IInterpolationHelper) interpolationHelpers: InterpolationHelper[]
    ) {
        interpolationHelpers.forEach(helper => {
            helper.channels.forEach(channel => {
                this.interpolators.set(channel, helper);
            });
        });
    }

    interpolate(channel: string, events: RecordedUserInput[]) {
        const interpolator = this.interpolators.get(channel);
        if (!interpolator || events.length <= 1) { return events; }

        const res: RecordedUserInput[] = [];
        for (let i = 0; i < events.length - 1; i++) {
            const first = events[i];
            const next = events[i + 1];
            const interpolated = interpolator.interpolate(first, next);
            res.push(first, ...interpolated, next);
        }
        return res;
    }
}

export interface InterpolationHelper<EventType = RecordedUserInput> {
    readonly channels: string[];
    interpolate(first: EventType, second: EventType): EventType[];
}
