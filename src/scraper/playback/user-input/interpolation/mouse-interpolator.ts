import { injectable } from "inversify";
import { RecordedMouseMove } from "../../../record/user-input/mouse-recorder";
import { InterpolationHelper } from "./user-input-interpolator";
import { interpolator, linear, flipHalfway } from "./interpolater";

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