import { RecordedUnloadEvent } from "../../../../common/src";
import { injectable } from "inversify";
import { InputAnnotator } from "./annotation-service";

@injectable()
export class UnloadAnnotator implements InputAnnotator<RecordedUnloadEvent> {
  readonly listen = "input";
  readonly type = "unload";

  annotate(_: RecordedUnloadEvent) {
    return {
      description: `The user unloaded the page`,
    };
  }
}
