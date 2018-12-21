import { inject, injectable } from "inversify";
import { ScraperConfig, ScraperConfigToken } from "../../scraper-config,";
import { EventService } from "../../utils/event-service";
import { TimeManager } from "../../utils/time-manager";
import { treeReduce } from "../../utils/tree-utils";
import { MutationOptimizer } from "./mutation-optimizer";
import { AddDescriptor, RecordedMutation, RecordedMutationGroup } from "./mutation-recorder";

export const chunkMutationLimit = Symbol('chunkMutationLimit');

@injectable()
export class MutationTracker {

    private mutations: RecordedMutationGroup[] = [];
    private numMutations = 0;

    constructor(
        private timeManager: TimeManager,
        private optimizer: MutationOptimizer,
        @inject(ScraperConfigToken) private config: ScraperConfig,
        private eventService: EventService
    ) { }

    record(mutations: RecordedMutation[]) {
        this.mutations.push({
            timestamp: this.timeManager.currentTime(),
            mutations: this.optimizer.optimizeMutationGroup(mutations)
        })

        this.numMutations += this.calcNumMutations(mutations);

        if(this.numMutations >= this.config.mutationsPerChunk) {
            this.eventService.dispatch({ type: chunkMutationLimit, payload: this.numMutations })
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
            switch(el.type) {
                case 'attribute':
                case 'change-text':
                    return acc + 1;
                case 'children':
                    return acc + this.calcNumAdditions(el.additions) + el.removals.length
            }
        }, 0)
    }

    private calcNumAdditions(additions: AddDescriptor[]) {
        return additions.reduce((sum, addition) => {
            const numNodes = treeReduce(
                addition.data, 
                (numNodes) => numNodes + 1,
                addition => addition.type === 'element' ? addition.children : undefined, 
                0
            )
            return sum + numNodes
        }, 0)
    }
}
