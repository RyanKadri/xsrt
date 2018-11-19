import { BaseUserInput, UserInputRecorder, RecordedEventContext } from "./input-recorder";
import { ScrapedElement } from "../../types/types";

const debounceThresholdMs = 100;
export class MouseRecorder implements UserInputRecorder<MouseEvent, RecordedMouseEvent> {
    constructor(
    ) { }

    private lastTime = 0;
    private lastHovered?: ScrapedElement;
    readonly channel = 'mouse';
    readonly events = ['mouseup', 'mousedown', 'mousemove'];

    handle(evt: MouseEvent, { time, target }: RecordedEventContext): Partial<RecordedMouseEvent> | null {
        if(target === this.lastHovered && time - this.lastTime < debounceThresholdMs) {
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


export type RecordedMouseEvent = RecordedMouseMove | RecordedMouseButton;

export interface RecordedMouseMove extends BaseMouseEvent {
    type: 'mousemove';
}

export interface RecordedMouseButton extends BaseMouseEvent {
    type: 'mouseup' | 'mousedown';
    button: number;
    buttonDown: boolean;
}

export interface BaseMouseEvent extends BaseUserInput {
    hovered: number;
    x: number;
    y: number;
}