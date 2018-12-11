import { injectable } from "inversify";
import { BaseUserInput, RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class HtmlInputRecorder implements UserInputRecorder<Event, RecordedInputChangeEvent> {
    readonly channels = ['input', 'change'];
    readonly listen = 'document';

    handle(evt: Event, { target }: RecordedEventContext) {
        if(!target) throw new Error('Could not replay input to undefined target');
        return {
            target: target.id,
            value: (evt.target as HTMLInputElement).value,
        }
    }
}

export interface RecordedInputChangeEvent extends BaseUserInput {
    type: 'input' | 'change',
    target: number;
    value: string;   
}