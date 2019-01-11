import { injectable } from "inversify";
import { RecordingOverview } from "../../../scraper/types/types";
import { SimpleState } from "./state";

@injectable()
export class RecordingState extends SimpleState<RecordingOverview, "_id"> {
    readonly id = "_id";
}
