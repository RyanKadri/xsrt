import { RecordedFocusEvent } from "../../../../common/src";
import { injectable } from "inversify";
import { DomManager } from "../dom-manager";
import { PseudoClassManager } from "./pseudo-class-manager";
import { UserInputPlaybackHelper } from "./user-input-manager";

@injectable()
export class FocusPlayer implements UserInputPlaybackHelper<RecordedFocusEvent> {

  readonly channels = ["focus", "blur"];

  constructor(
    private domManager: DomManager,
    private pseudoClassManager: PseudoClassManager
  ) { }

  simulateInput(updates: RecordedFocusEvent[]) {
    const lastUpdate = updates[updates.length - 1];
    if (lastUpdate.target) {
      const target = lastUpdate.target;
      this.domManager.mutateElement(lastUpdate.target, (node) => {
        if (lastUpdate.type === "focus") {
          this.pseudoClassManager.applyFocus(target);
          node.focus();
        } else {
          this.pseudoClassManager.removeFocus();
          node.blur();
        }
      });
    }
  }
}
