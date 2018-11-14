import { BaseUserInput } from "./input-recorder";
import { ScrapedElement } from "../../types/types";

export function handleScroll(_: UIEvent, target?: ScrapedElement): RecordedScrollEvent {
    return {
        type: 'scroll' as 'scroll',
        target: target ? target.id : null,
        timestamp: Date.now(),
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