import { injectable } from "inversify";
import { RecordedResize } from "../../../scraper/record/user-input/resize-recorder";
import { InputAnnotator } from "./annotation-service";

@injectable()
export class ResizeAnnotator implements InputAnnotator<RecordedResize> {
    readonly listen = 'input';
    readonly type = 'resize';

    annotate(resize: RecordedResize) {
        return { 
            description: `User resized view to ${resize.width} x ${ resize.height }`,
        }
    }
}