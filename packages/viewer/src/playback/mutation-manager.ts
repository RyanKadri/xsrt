import { AttributeMutation, ChangeTextMutation, OptimizedChildrenMutation, OptimizedMutation, RecordedMutationGroup } from "../../../common/src";
import { injectable } from "inversify";
import { DomManager } from "./dom-manager";

@injectable()
export class MutationManager {

    constructor(
        private domManager: DomManager
    ) { }

    applyChanges(changeGroup: RecordedMutationGroup[]) {
        changeGroup.forEach(group => {
            group.mutations.forEach(mutation => {
                this.applyChange(mutation);
            });
        });
    }

    private applyChange(mutation: OptimizedMutation) {
        switch (mutation.type) {
            case "attribute":
                return this.attributeChange(mutation, mutation.target);
            case "change-text":
                return this.textChange(mutation, mutation.target);
            case "children":
                if (mutation.removals && mutation.removals.length > 0) {
                    this.removeChildren(mutation, mutation.target);
                }
                if (mutation.additions && mutation.additions.length > 0) {
                    this.addChildren(mutation, mutation.target);
                }
                return;
            default:
                return;
        }
    }

    private attributeChange(mutation: AttributeMutation, target: number) {
        if (mutation.attribute.value !== null) {
            this.domManager.setAttribute(target, mutation.attribute);
        } else {
            this.domManager.removeAttribute(target, mutation.attribute.name);
        }
    }

    private textChange(mutation: ChangeTextMutation, target: number) {
        this.domManager.updateText(target, mutation.update);
    }

    private removeChildren(mutation: OptimizedChildrenMutation, target: number) {
        (mutation.removals || []).forEach(removal => {
            this.domManager.removeChild(target, removal);
        });
    }

    private addChildren(mutation: OptimizedChildrenMutation, target: number) {
        (mutation.additions || []).forEach(add => {
            // TODO - The undefined namespace isn't quite right here
            this.domManager.serializeToElement(target, add.data, add.before);
        });
    }
}
