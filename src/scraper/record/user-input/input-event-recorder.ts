import { BaseUserInput, UserInputRecorder, RecordedEventContext } from "./input-recorder";
import { injectable } from "inversify";

@injectable()
export class HtmlInputRecorder implements UserInputRecorder<Event, RecordedInputChangeEvent> {
    readonly channel = 'input';
    readonly events = ['input', 'change'];
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