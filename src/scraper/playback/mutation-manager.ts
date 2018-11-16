import { RecordedMutationGroup, AttributeMutation, ChangeTextMutation, OptimizedMutation, OptimizedChildrenMutation } from "../record/dom-changes/mutation-recorder";
import { DomManager } from "./dom-utils";

export class MutationManager {
    
    private usedMutations = new Set<OptimizedMutation>()
    constructor(private domManager: DomManager) { }

    applyChanges(changeGroup: RecordedMutationGroup[]) {
        changeGroup.forEach(group => {
            group.mutations.forEach(mutation => {
                if(this.usedMutations.has(mutation)) console.log(mutation)
                this.usedMutations.add(mutation);
                this.applyChange(mutation);
            })
        })
    }

    private applyChange(mutation: OptimizedMutation) {
        switch(mutation.type) {
            case 'attribute':
                return this.attributeChange(mutation, mutation.target);
            case 'change-text':
                return this.textChange(mutation, mutation.target);
            case 'children':
                if(mutation.removals && mutation.removals.length > 0) {
                    this.removeChildren(mutation, mutation.target);
                }
                if(mutation.additions && mutation.additions.length > 0) {
                    this.addChildren(mutation, mutation.target);
                }
                return;
            default: 
                return;
        }
    }

    private attributeChange(mutation: AttributeMutation, target: number) {
        if(mutation.val !== null) {
            this.domManager.setAttribute(target, mutation.name, mutation.val);
        } else {
            this.domManager.removeAttribute(target, mutation.name)
        }
    }

    private textChange(mutation: ChangeTextMutation, target: number) {
        this.domManager.updateText(target, mutation.update);
    }

    private removeChildren(mutation: OptimizedChildrenMutation, target: number) {
        (mutation.removals || []).forEach(removal => {
            this.domManager.removeChild(target, removal);
        })
    }

    private addChildren(mutation: OptimizedChildrenMutation, target: number) {
        (mutation.additions || []).forEach(add => {
            //TODO - The undefined namespace isn't quite right here
            this.domManager.serializeToElement(target, add.data, add.before);
        })
    }
}