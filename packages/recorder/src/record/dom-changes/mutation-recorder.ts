import { flatten, RecordedMutation, RecordedMutationGroup } from "@xsrt/common";
import { injectable } from "inversify";
import { shouldTraverseNode } from "../../filter/filter-dom";
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
        if (this.running) { throw new Error("Recorder is already running"); }
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

    dump(): RecordedMutationGroup[] {
        return this.mutationTracker.dump();
    }

    stop(): RecordedMutationGroup[] {
        if (!this.running) { throw new Error("Recorder is already stopped"); }
        this.running = false;

        this.observer.disconnect();
        return this.dump();
    }

    private recordMutation = (mutations: MutationRecord[]) => {
        this.mutationTracker.record(
            flatten<RecordedMutation>(
                mutations
                    .filter(mutation => shouldTraverseNode(mutation.target))
                    .map(mutation => this.transformer.transformMutation(mutation)))
        );
    }

}
