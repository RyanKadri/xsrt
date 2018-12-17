import { injectable } from "inversify";
import { ScrapedElement } from "../../types/types";
import { MutationTracker } from "./mutation-tracker";
import { MutationTransformer } from "./mutation-transformer";

@injectable()
export class MutationRecorder {

    private observer: MutationObserver;
    private running = false;

    constructor(
        private mutationTracker: MutationTracker,
        private transformer: MutationTransformer
    ) {
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
        return this.mutationTracker.dump();
    }

    private recordMutation = (mutations: MutationRecord[]) => {
        this.mutationTracker.record(
            mutations.map(mutation => this.transformer.transformMutation(mutation)).flat(Infinity)
        )
    }
    
}

export interface RecordedMutationGroup {
    timestamp: number;
    mutations: OptimizedMutation[];
}

export type RecordedMutation = AttributeMutation | ChangeChildrenMutation | ChangeTextMutation;

export type OptimizedMutation = AttributeMutation | OptimizedChildrenMutation | ChangeTextMutation;

export interface BaseMutation {
    target: number;
}

export interface AttributeMutation extends BaseMutation {
    type: 'attribute',
    name: string;
    val: string;
}

export interface OptimizedChildrenMutation extends BaseMutation {
    type: 'children',
    additions?: AddDescriptor[];
    removals?: number[];
}

export interface ChangeChildrenMutation extends BaseMutation {
    type: 'children';
    additions: AddDescriptor[];
    removals: ScrapedElement[];
}

export interface AddDescriptor {
    before: number | null;
    data: ScrapedElement;
}

export interface ChangeTextMutation extends BaseMutation {
    type: 'change-text';
    update: string;
}