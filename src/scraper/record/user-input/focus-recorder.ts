import { injectable } from "inversify";
import { BaseUserInput, RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class FocusRecorder implements UserInputRecorder<FocusEvent, RecordedFocusEvent> {
    readonly channels = ['focus', 'blur'];
    readonly listen = 'document';

    handle(_: FocusEvent, { target }: RecordedEventContext ) {
        return {
            target: target !== undefined ? target.id : undefined,
        }
    }
}

export interface RecordedFocusEvent extends BaseUserInput {
    type: 'focus' | 'blur';
    target?: number;
}