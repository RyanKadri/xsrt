import { BaseUserInput, UserInputRecorder, RecordedEventContext } from "./input-recorder";

export const scrollRecorder: UserInputRecorder<UIEvent, RecordedScrollEvent> = {
    channel: 'scroll',
    events: ['scroll'],
    handle: handleScroll
}

export function handleScroll(_: UIEvent, { target }: RecordedEventContext): Partial<RecordedScrollEvent> {
    return {
        target: target ? target.id : null,
        scrollX: target ? target.domElement!.scrollLeft : window.scrollX,
        scrollY: target ? target.domElement!.scrollTop : window.scrollY
    };
}

export interface RecordedScrollEvent extends BaseUserInput {
    type: 'scroll';
    target: number | null;
    scrollX: number;
    scrollY: number;
}