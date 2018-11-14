import { DomTraverser } from "../../traverse/traverse-dom";
import { ScrapedElement } from "../../types/types";
import { shouldTraverseNode } from "../../filter/filter-dom";
import { optimizeMutationGroup } from "../../optimize/optimize-mutations";

export class MutationRecorder {

    private observer: MutationObserver;
    private mutations: RecordedMutationGroup[] = [];
    private running = false;

    constructor(private domWalker: DomTraverser) {
        this.observer = new MutationObserver(this.recordMutation);
    }

    start() {
        if(this.running) throw new Error('Recorder is already running');
        this.running = true;
        this.observer.observe(document.documentElement!, { 
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true 
        });
    }

    stop() {
        if(!this.running) throw new Error('Recorder is already stopped');
        this.running = false;

        this.observer.disconnect();
        const mutations = this.mutations;
        this.mutations = [];
        return mutations;
    }

    private recordMutation = (mutations: MutationRecord[]) => {
        console.log(mutations)
        this.mutations.push({
            timestamp: Date.now(),
            mutations: mutations
                .map(mutation => this.transformMutation(mutation)).flat(Infinity)
                .map(recorded => optimizeMutationGroup(recorded))
        })
    }
    
    private transformMutation(mutation: MutationRecord): RecordedMutation[] {
        if(!this.domWalker.isManaged(mutation.target)) console.log(mutation)
        const target = this.domWalker.fetchManagedNode(mutation.target)!.id;

        if(mutation.type === 'attributes') {
            return [this.attributeMutation(mutation, target)];
        } else if(mutation.type === 'characterData') {
            return [this.textMutation(mutation, target)];
        } else {
            const res: RecordedMutation[] = [];
            if(mutation.removedNodes && mutation.removedNodes.length > 0) {
                res.push(this.removeChildrenMutation(mutation, target));
            }
            if(mutation.addedNodes && mutation.addedNodes.length > 0) {
                res.push(this.addChildrenMutation(mutation, target));
            }
            return res;
        }
    }

    private attributeMutation(mutation: MutationRecord, target
        : number): AttributeMutation {
        const name = mutation.attributeName!;
        const val = (mutation.target as HTMLElement).getAttribute(name)!;
        return {
            type: 'attribute',
            target,
            name,
            val
        };
    }

    private textMutation(mutation: MutationRecord, target: number): ChangeTextMutation {
        return {
            type: "change-text",
            target,
            update: mutation.target.textContent || ''
        }
    }

    private removeChildrenMutation(mutation: MutationRecord, target: number): ChangeChildrenMutation {
        return {
            type: "children",
            target,
            removals: Array.from(mutation.removedNodes)
                .map(node => this.domWalker.fetchManagedNode(node))
                .map(node => node!.id),
            additions: []
        }
    }

    private addChildrenMutation(mutation: MutationRecord, target: number): ChangeChildrenMutation {
        const additions = Array.from(mutation.addedNodes)
            .filter(shouldTraverseNode)
            .map(addition => {
                const processed = this.domWalker.traverseNode(addition)!;
                let before: Node | null | undefined = processed.domElement;
                do {
                    before = before!.nextSibling;
                } while(before && !this.domWalker.isManaged(before));

                let beforeId: number | null = null;
                if(before) {
                    beforeId = this.domWalker.fetchManagedNode(before)!.id;
                }
                return {
                    before: beforeId,
                    data: processed
                }
            });
        return {
            type: 'children',
            target,
            additions,
            removals: []
        }
    }
}

export interface RecordedMutationGroup {
    timestamp: number;
    mutations: RecordedMutation[];
}

export type RecordedMutation = AttributeMutation | ChangeChildrenMutation | ChangeTextMutation;

export interface BaseMutation {
    target: number;
}

export interface AttributeMutation extends BaseMutation {
    type: 'attribute',
    name: string;
    val: string;
}

export interface ChangeChildrenMutation extends BaseMutation {
    type: 'children';
    additions: AddDescriptor[];
    removals: number[];

}

interface AddDescriptor {
    before: number | null;
    data: ScrapedElement;
}

export interface ChangeTextMutation extends BaseMutation {
    type: 'change-text';
    update: string;
}