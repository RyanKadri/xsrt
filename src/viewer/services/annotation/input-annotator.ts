import { injectable } from "inversify";
import { RecordedInputChangeEvent } from "../../../scraper/record/user-input/input-event-recorder";
import { InputAnnotator } from "./annotation-service";

@injectable()
export class InputEventAnnotator implements InputAnnotator<RecordedInputChangeEvent> {
    readonly listen = 'input';
    readonly type = 'input';

    constructor(
    ) { } 

    // TODO - Improve this to not overwrite annotations for checkboxes. Depends on better domManager (across navs)
    shouldOverwrite() {
        return true;
    }

    annotate(input: RecordedInputChangeEvent) {
        const description = this.formDescription(input.value);
        if(!description) {
            return null;
        } else {
            return {
                description,
            }
        }
    }

    // TODO - Support checkboxes / other inputs after above work
    private formDescription(value: string | boolean) {
        return `User entered ${ value } in a form field`;
    }
}