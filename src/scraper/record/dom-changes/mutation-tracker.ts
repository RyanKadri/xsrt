import { injectable } from "inversify";
import { RecordedMutationGroup, RecordedMutation } from "./mutation-recorder";
import { TimeManager } from "../../utils/time-manager";
import { MutationOptimizer } from "./mutation-optimizer";

@injectable()
export class MutationTracker {

    private mutations: RecordedMutationGroup[] = [];
    constructor(
        private timeManager: TimeManager,
        private optimizer: MutationOptimizer
    ) {}

    record(mutations: RecordedMutation[]) {
        this.mutations.push({
            timestamp: this.timeManager.currentTime(),
            mutations: this.optimizer.optimizeMutationGroup(mutations)
        })
    }

    dump() {
        const mutations = this.mutations;
        this.mutations = [];
        return mutations;
    }
}