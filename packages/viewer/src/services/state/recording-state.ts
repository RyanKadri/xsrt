import { Recording } from "@xsrt/common";
import { injectable } from "inversify";
import { SimpleState } from "./state";

@injectable()
export class RecordingState extends SimpleState<Recording, "_id"> {
    readonly id = "_id";
}
