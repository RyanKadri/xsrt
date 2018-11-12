import { BaseUserInput } from "./input-recorder";
import { SimpleInputHandler } from "./simple-input-recorder";

export const scrollRecorder = new SimpleInputHandler<RecordedScrollEvent, UIEvent>
    (['scroll'], handleScroll)

function handleScroll(_: UIEvent) {
    return {
        type: 'scroll' as 'scroll',
        timestamp: Date.now(),
        scrollX: window.scrollX,
        scrollY: window.scrollY
    };
}

export interface RecordedScrollEvent extends BaseUserInput {
    type: 'scroll';
    scrollX: number;
    scrollY: number;
}