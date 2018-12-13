import { injectable } from "inversify";
import { DomManager } from "../../../scraper/playback/dom-manager";
import { RecordedInputChangeEvent } from "../../../scraper/record/user-input/input-event-recorder";
import { InputCause } from "../../components/viewer/viewer";
import { InputAnnotator } from "./annotation-service";

@injectable()
export class InputEventAnnotator implements InputAnnotator<RecordedInputChangeEvent> {
    readonly listen = 'input';
    readonly type = 'input';

    constructor(
        private domManager: DomManager
    ) { } 

    shouldOverwrite(cause: InputCause, evt: RecordedInputChangeEvent) {
        const type = this.domManager.queryElement(evt.target, (el) => (el as HTMLInputElement).type);
        return type !== 'checkbox' && cause.input.type === 'input' && cause.input.target === evt.target;
    }

    annotate(input: RecordedInputChangeEvent) {
        const type = this.domManager.queryElement(input.target, (el) => (el as HTMLInputElement).type);
        const description = this.formDescription(input.value, type);
        if(!description) {
            return null;
        } else {
            return {
                description,
            }
        }
    }

    private formDescription(value: string | boolean, type: string) {
        switch(type) {
            case 'checkbox':
                return `User ${ value ? 'checked' : 'unchecked' } a checkbox`;
            default: 
                return `User entered ${ value } in a form field`;
        }
    }
}