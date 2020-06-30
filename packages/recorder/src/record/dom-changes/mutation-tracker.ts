import { AddDescriptor, RecordedMutation, RecordedMutationGroup, ScraperConfig, ScraperConfigToken, treeReduce } from "../../../../common/src";
import { inject, injectable } from "inversify";
import { TimeManager } from "../../utils/time-manager";
import { GlobalEventService } from "../user-input/global-event-service";
import { MutationOptimizer } from "./mutation-optimizer";

export const chunkMutationLimit = "chunkMutationLimit";

@injectable()
export class MutationTracker {

    private mutations: RecordedMutationGroup[] = [];
    private numMutations = 0;

    constructor(
        private timeManager: TimeManager,
        private optimizer: MutationOptimizer,
        @inject(ScraperConfigToken) private config: ScraperConfig,
        private eventService: GlobalEventService
    ) { }

    record(mutations: RecordedMutation[]) {
        this.mutations.push({
            timestamp: this.timeManager.currentTime(),
            mutations: this.optimizer.optimizeMutationGroup(mutations)
        });

        this.numMutations += this.calcNumMutations(mutations);

        if (this.numMutations >= this.config.mutationsPerChunk) {
            this.eventService.fireSyntheticEvent({ type: chunkMutationLimit, payload: this.numMutations });
        }
    }

    dump() {
        const mutations = this.mutations;
        this.mutations = [];
        this.numMutations = 0;
        return mutations;
    }

    private calcNumMutations(mutations: RecordedMutation[]): number {
        return mutations.reduce((acc, el) => {
            switch (el.type) {
                case "attribute":
                case "change-text":
                    return acc + 1;
                case "children":
                    return acc + this.calcNumAdditions(el.additions) + el.removals.length;
            }
        }, 0);
    }

    private calcNumAdditions(additions: AddDescriptor[]) {
        return additions.reduce((sum, addition) => {
            const numNodes = treeReduce(
                addition.data,
                (totalNodes) => totalNodes + 1,
                addNode => addNode.type === "element" ? addNode.children : undefined,
                0
            );
            return sum + numNodes;
        }, 0);
    }
}
