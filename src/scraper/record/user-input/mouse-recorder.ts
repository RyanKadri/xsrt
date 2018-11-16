import { BaseUserInput } from "./input-recorder";

export function handleMouseMove(evt: MouseEvent): Partial<RecordedMouseEvent> {
    return {
        x: evt.x,
        y: evt.y,
        ...extras(evt)
    };
}

function extras(evt: MouseEvent): Partial<RecordedMouseEvent> {
    switch(evt.type) {
        case 'mousedown':
        case 'mouseup':
            return { button: evt.button, buttonDown: evt.type === 'mousedown' };
        default:
            return {  };
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
    x: number;
    y: number;
}