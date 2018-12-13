import { injectable } from "inversify";
import { BaseUserInput, UserInputRecorder } from "./input-recorder";

const keyup = 'keyup';
const keydown = 'keydown';

@injectable()
export class KeystrokeRecorder implements UserInputRecorder<KeyboardEvent, RecordedKeyEvent> {
    readonly channels = [keyup, keydown];
    readonly listen = 'document';
    activeKeys = new Map<string, number>()

    handle(evt: KeyboardEvent) {
        return {
            key: evt.key
        } as Partial<RecordedKeyEvent>;
    }
}

export type RecordedKeyEvent = RecordedKeyUp | RecordedKeyDown;

export interface RecordedKeyUp extends BaseKeyEvent {
    type: typeof keyup
}

export interface RecordedKeyDown extends BaseKeyEvent {
    type: typeof keydown;
}

interface BaseKeyEvent extends BaseUserInput {
    key: string;
}