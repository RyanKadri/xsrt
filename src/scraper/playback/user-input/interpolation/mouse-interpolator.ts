import { injectable } from "inversify";
import { RecordedMouseMove } from '../../../types/event-types';
import { flipHalfway, interpolator, linear } from "./interpolater";
import { InterpolationHelper } from "./user-input-interpolator";

@injectable()
export class MouseInterpolationHelper implements InterpolationHelper<RecordedMouseMove> {
    readonly channels = ['mousemove'];
    private readonly numBetween = 2;
    
    interpolate = interpolator<RecordedMouseMove>(this.numBetween, {
        x: linear,
        y: linear,
        timestamp: linear,
        hovered: flipHalfway
    });
}