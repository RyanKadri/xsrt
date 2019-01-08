import { injectable } from "inversify";
import { RecordedScrollEvent } from '../../types/event-types';
import { RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class ScrollRecorder implements UserInputRecorder<UIEvent, RecordedScrollEvent> {
    readonly channels = ['scroll'];
    readonly listen = 'document';

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