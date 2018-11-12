import { BaseUserInput } from "./input-recorder";
import { SimpleInputHandler } from "./simple-input-recorder";

export const mouseRecorder = new SimpleInputHandler<RecordedMouseEvent, MouseEvent>
    (['mousemove', 'mousedown', 'mouseup'], handleMouseMove)

function handleMouseMove(evt: MouseEvent) {
    return {
        timestamp: Date.now(),
        x: evt.x,
        y: evt.y,
        ...extras(evt)
    } as RecordedMouseEvent;
}

function extras(evt: MouseEvent): Partial<RecordedMouseEvent> {
    switch(evt.type) {
        case 'mousedown':
        case 'mouseup':
            return { type: 'mouse-button', button: evt.button, buttonDown: evt.type === 'mousedown' };
        default:
            return { type: evt.type as any };
    }
}

export type RecordedMouseEvent = RecordedMouseMove | RecordedMouseButton;

export interface RecordedMouseMove extends BaseMouseEvent {
    type: 'mousemove';
}

export interface RecordedMouseButton extends BaseMouseEvent {
    type: 'mouse-button';
    button: number;
    buttonDown: boolean;
}

export interface BaseMouseEvent extends BaseUserInput {
    x: number;
    y: number;
}