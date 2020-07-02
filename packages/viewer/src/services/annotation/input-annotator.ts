import { RecordedInputChangeEvent } from "../../../../common/src";
import { injectable } from "inversify";
import { DomPreviewService } from "../../playback/dom-preview-service";
import { InputAnnotator } from "./annotation-service";

@injectable()
export class InputEventAnnotator implements InputAnnotator<RecordedInputChangeEvent> {
    readonly listen = "input";
    readonly type = "input";

    constructor(
        private domPreviewService: DomPreviewService
    ) { }

    annotate(input: RecordedInputChangeEvent) {
        const preview = this.domPreviewService.previewNode(input.target, input.timestamp);
        if (preview.type !== "element") { throw new Error("The input event has recorded an invalid target"); }
        const description = this.formDescription(input.value, preview.attributes.type);
        return {
            description,
        };
    }

    private formDescription(value: string | boolean, type: string) {
        switch (type) {
            case "checkbox":
                return `User ${ value === true ? "checked" : "unchecked" } a checkbox`;
            default:
                return `User entered ${ value } in a form field`;
        }
    }
}
