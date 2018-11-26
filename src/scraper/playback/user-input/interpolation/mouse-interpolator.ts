import { injectable } from "inversify";
import { RecordedMouseMove } from "../../../record/user-input/mouse-recorder";
import { InterpolationHelper } from "./user-input-interpolator";

@injectable()
export class MouseInterpolationHelper implements InterpolationHelper<RecordedMouseMove> {
    readonly channels = ['mousemove'];
    private readonly numBetween = 2;
    
    interpolate(first: RecordedMouseMove, second: RecordedMouseMove): RecordedMouseMove[] {
        const additional: RecordedMouseMove[] = [];
        const numSteps = this.numBetween + 1;
        const timeStep = (second.timestamp - first.timestamp) / numSteps;
        const xStep = (second.x - first.x) / numSteps;
        const yStep = (second.y - first.y) / numSteps;

        for(let i = 1; i <= this.numBetween; i++) {
            additional.push({
                type: 'mousemove',
                timestamp: first.timestamp + timeStep * i,
                x: first.x + xStep * i,
                y: first.y + yStep * i,
                hovered: i > numSteps / 2 ? first.hovered : second.hovered
            })
        }
        return additional;
    }
}