import { BaseUserInput, UserInputRecorder, RecordedEventContext } from "./input-recorder";
import { injectable } from "inversify";

@injectable()
export class ScrollRecorder implements UserInputRecorder<UIEvent, RecordedScrollEvent> {
    readonly channels = ['scroll'];

    handle(_: UIEvent, { target }: RecordedEventContext): Partial<RecordedScrollEvent> {
        const domElement = target ? target.domElement : undefined;
        if(target && !domElement) throw new Error(`Could not read scroll pos from ${target}`);
        return {
            target: target ? target.id : null,
            scrollX: domElement ? domElement.scrollLeft : window.scrollX,
            scrollY: domElement ? domElement.scrollTop : window.scrollY
        };
    }
}

export interface RecordedScrollEvent extends BaseUserInput {
    type: 'scroll';
    target: number | null;
    scrollX: number;
    scrollY: number;
}