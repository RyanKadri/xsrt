import { RecordedResize } from "../../../../common/src";
import { injectable } from "inversify";
import { InputAnnotator } from "./annotation-service";

@injectable()
export class ResizeAnnotator implements InputAnnotator<RecordedResize> {
    readonly listen = "input";
    readonly type = "resize";

    annotate(resize: RecordedResize) {
        return {
            description: `User resized view to ${resize.width} x ${ resize.height }`,
        };
    }
}
