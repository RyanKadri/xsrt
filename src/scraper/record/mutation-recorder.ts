import { DomTraverser } from "../traverse/traverse-dom";
import { ScrapedElement } from "../types/types";

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

    private recordMutation = (mutations: MutationRecord[], observer: MutationObserver) => {
        this.mutations.push({
            timestamp: Date.now(),
            mutations: mutations.map(mutation => this.transformMutation(mutation))
        })
    }
    
    private transformMutation(mutation: MutationRecord): RecordedMutation {
        if(mutation.type === 'attributes') {
            const name = mutation.attributeName!;
            const val = (mutation.target as HTMLElement).getAttribute(name)!;
            return {
                type: 'attribute',
                name,
                val
            };
        } else if(mutation.type === 'characterData') {
            return {
                type: "change-text",
                update: mutation.target.textContent || ''
            }
        } else {
            if(mutation.removedNodes && mutation.removedNodes.length > 0) {
                return {
                    type: "remove-children",
                    id: Array.from(mutation.removedNodes)
                        .map(node => this.domWalker.traverseNode(node))
                        .map(node => node!.id)
                }
            } else {
                const parent = this.domWalker.traverseNode(mutation.target)!;
                const additions = Array.from(mutation.addedNodes)
                    .map(addition => {
                        const processed = this.domWalker.traverseNode(addition)!;
                        let before = mutation.nextSibling;
                        while(before && this.domWalker.isManaged(before)) {
                            before = before.nextSibling;
                        }
                        let beforeId: number | null = null;
                        if(before) {
                            beforeId = this.domWalker.traverseNode(before)!.id;
                        }
                        return {
                            before: beforeId,
                            data: processed
                        }
                    });
                return {
                    type: 'add-children',
                    parent: parent.id,
                    additions
                }
            }
        }
    }
}

export interface RecordedMutationGroup {
    timestamp: number;
    mutations: RecordedMutation[];
}

export type RecordedMutation = AttributeMutation | AddChildrenMutation | RemoveChildrenMutation | ChangeTextMutation;

export interface AttributeMutation {
    type: 'attribute',
    name: string;
    val: string;
}

export interface AddChildrenMutation {
    type: 'add-children';
    additions: AddDescriptor[];
    parent: number;
}

interface AddDescriptor {
    before: number | null;
    data: ScrapedElement;
}

export interface RemoveChildrenMutation {
    type: 'remove-children';
    id: number[];
}

export interface ChangeTextMutation {
    type: 'change-text';
    update: string;
}