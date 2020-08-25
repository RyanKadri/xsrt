import { RecordedInputChangeEvent } from "../../../../common/src";
import { injectable } from "inversify";
import { DomManager } from "../dom-manager";
import { UserInputPlaybackHelper } from "./user-input-manager";

@injectable()
export class InputChangePlayer implements UserInputPlaybackHelper<RecordedInputChangeEvent> {

  readonly channels = ["input", "change"];

  constructor(
    private domManager: DomManager
  ) { }

  simulateInput(updates: RecordedInputChangeEvent[]) {
    const lastUpdate = updates[updates.length - 1];
    this.domManager.mutateElement(lastUpdate.target, (node) => {
      if (!this.isInput(node)) {
        throw new Error("Expected an input element here");
      }
      if (node.type !== "checkbox" && typeof lastUpdate.value === "string") {
        node.value = lastUpdate.value;
      } else if (node.type === "checkbox" && typeof lastUpdate.value === "boolean") {
        node.checked = lastUpdate.value;
      } else {
        throw new Error("Something went wrong with the value types here...");
      }
    });
  }

  private isInput(el: HTMLElement): el is HTMLInputElement {
    return el.tagName === "INPUT";
  }
}
