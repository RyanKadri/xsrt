import { MapTo } from "../utils/type-utils";

export type RecordedKeyEvent = RecordedKeyUp | RecordedKeyDown;

export type RecordedUserInput = RecordedMouseEvent | RecordedScrollEvent | RecordedInputChangeEvent
                                 | RecordedFocusEvent | RecordedResize | RecordedKeyEvent | RecordedUnloadEvent;

export interface BaseUserInput {
    timestamp: number;
    type: string;
}

export type RecordedInputChannels = MapTo<RecordedUserInput[]>;

const keyup = "keyup";
const keydown = "keydown";

export interface RecordedInputChangeEvent extends BaseUserInput {
    type: "input" | "change";
    target: number;
    value: string | boolean;
}

export interface RecordedKeyUp extends BaseKeyEvent {
    type: typeof keyup;
}

export interface RecordedKeyDown extends BaseKeyEvent {
    type: typeof keydown;
}

interface BaseKeyEvent extends BaseUserInput {
    key: string;
}

export type RecordedMouseEvent = RecordedMouseMove | RecordedMouseButton;

export interface RecordedMouseMove extends BaseMouseEvent {
    type: "mousemove";
}

export interface RecordedMouseButton extends BaseMouseEvent {
    type: "mouseup" | "mousedown";
    button: number;
    buttonDown: boolean;
}

export interface BaseMouseEvent extends BaseUserInput {
    hovered?: number;
    x: number;
    y: number;
}

export interface RecordedResize extends BaseUserInput {
    type: "resize";
    height: number;
    width: number;
}

export interface RecordedScrollEvent extends BaseUserInput {
    type: "scroll";
    target: number | null;
    scrollX: number;
    scrollY: number;
}

export interface RecordedFocusEvent extends BaseUserInput {
    type: "focus" | "blur";
    target?: number;
}

export interface RecordedUnloadEvent extends BaseUserInput {
    type: "unload";
}

export interface RecordedNavigationEvent extends BaseUserInput {
    type: "soft-navigate";
    url: string;
    action: "popstate" | "replacestate" | "pushstate" | "hashchange";
}
