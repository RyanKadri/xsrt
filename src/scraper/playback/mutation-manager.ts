import { serializeToDocument, serializeToElement } from "./dom-utils";
import { RecordedMutationGroup, RecordedMutation, AttributeMutation, ChangeTextMutation, ChangeChildrenMutation } from "../record/dom-changes/mutation-recorder";
import { DedupedData } from "../types/types";

export class DocumentManager {
    
    private nodeMapping = new Map<number, Node>();
    private assets: string[] = [];
    constructor(private document: Document) {}

    async renderSnapshot(data: DedupedData) {
        this.assets = data.assets;
        this.nodeMapping = await serializeToDocument(data, this.document);
    }

    applyChanges(changeGroup: RecordedMutationGroup[]) {
        changeGroup.forEach(group => {
            group.mutations.forEach(mutation => {
                this.applyChange(mutation);
            })
        })
    }

    private applyChange(mutation: RecordedMutation) {
        const target = this.nodeMapping.get(mutation.target)!;
        switch(mutation.type) {
            case 'attribute':
                return this.attributeChange(mutation, target as HTMLElement);
            case 'change-text':
                return this.textChange(mutation, target);
            case 'children':
                if(mutation.removals && mutation.removals.length > 0) {
                    this.removeChildren(mutation, target as HTMLElement);
                }
                if(mutation.additions && mutation.additions.length > 0) {
                    this.addChildren(mutation, target as HTMLElement);
                }
                return;
            default: 
                return;
        }
    }

    private attributeChange(mutation: AttributeMutation, target: HTMLElement) {
        if(mutation.val !== null) {
            target.setAttribute(mutation.name, mutation.val);
        } else {
            target.removeAttribute(mutation.name)
        }
    }

    private textChange(mutation: ChangeTextMutation, target: Node) {
        target.textContent = mutation.update;
    }

    private removeChildren(mutation: ChangeChildrenMutation, target: HTMLElement) {
        mutation.removals.forEach(id => {
            target.removeChild(this.nodeMapping.get(id)!);
        })
    }

    private addChildren(mutation: ChangeChildrenMutation, target: HTMLElement) {
        mutation.additions.forEach(add => {
            //TODO - The undefined namespace isn't quite right here
            serializeToElement(target, add.data, this.nodeMapping, this.assets, undefined, add.before);
        })
    }
}