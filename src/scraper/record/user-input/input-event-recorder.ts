import { BaseUserInput, UserInputRecorder, RecordedEventContext } from "./input-recorder";

export const inputRecorder: UserInputRecorder<Event, RecordedInputChangeEvent> = {
    channel: 'input',
    events: ['input', 'change'],
    handle: handleInputChange
}

export function handleInputChange(evt: Event, { target }: RecordedEventContext) {
    return {
        target: target!.id,
        value: (evt.target as HTMLInputElement).value,
    }
}

export interface RecordedInputChangeEvent extends BaseUserInput {
    type: 'input' | 'change',
    target: number;
    value: string;   
}