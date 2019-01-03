import { injectable } from "inversify";
import { RecordedMouseEvent, ScrapedElement } from "../../types/types";
import { RecordedEventContext, UserInputRecorder } from "./input-recorder";

// TODO - Move debounce to more natural spot?
const debounceThresholdMs = 100;

@injectable()
export class MouseRecorder implements UserInputRecorder<MouseEvent, RecordedMouseEvent> {

    readonly channels = ['mouseup', 'mousedown', 'mousemove'];
    readonly listen = 'document';

    private lastTime = 0;
    private lastHovered?: ScrapedElement;

    handle(evt: MouseEvent, { time, target }: RecordedEventContext): Partial<RecordedMouseEvent> | null {
        if(evt.type === 'mousemove' && target === this.lastHovered && time - this.lastTime < debounceThresholdMs) {
            return null;
        } else {
            this.lastHovered = target;
            this.lastTime = time;
        }
        return {
            x: evt.pageX,
            y: evt.pageY,
            hovered: this.lastHovered ? this.lastHovered.id : undefined,
            ...this.extras(evt)
        };
    }
    
    private extras(evt: MouseEvent): Partial<RecordedMouseEvent> {
        switch(evt.type) {
            case 'mousedown':
            case 'mouseup':
                return { button: evt.button, buttonDown: evt.type === 'mousedown' };
            default:
                return {  };
        }
    }
}
