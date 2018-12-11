import { injectable } from "inversify";
import { ScrapedElement } from "../../types/types";
import { BaseUserInput, RecordedEventContext, UserInputRecorder } from "./input-recorder";

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