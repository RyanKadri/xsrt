import { RecordingOverview } from "@xsrt/common";
import { injectable } from "inversify";
import { SimpleState } from "./state";

@injectable()
export class RecordingState extends SimpleState<RecordingOverview, "_id"> {
    readonly id = "_id";
}
