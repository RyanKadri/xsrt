import { injectable } from "inversify";
import { Without } from "../common/utils/type-utils";
import { RecordingOptimizer } from "./optimize/optimize";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { extractMetadata } from "./traverse/extract-metadata";
import { RecordingDomManager } from "./traverse/traverse-dom";
import { PendingDiffChunk, SnapshotChunk, UnoptimizedSnapshotChunk } from "./types/types";
import { TimeManager } from "./utils/time-manager";

@injectable()
export class Recorder implements IScraper {
    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager,
        private mutationRecorder: MutationRecorder,
        private inputRecorder: CompleteInputRecorder,
        private optimizer: RecordingOptimizer,
    ) {}

    private lastChunk?: number;

    createSnapshotChunk(): Promise<Without<SnapshotChunk, "_id">> {
        return this.optimizer.optimize(this.syncSnapshot())
            .then(snapshot => {
                const stopTime = this.lastChunk = this.timeManager.currentTime();
                const startTime = this.timeManager.fetchSessionStart();
                const chunk = {
                    ...snapshot,
                    changes: this.mutationRecorder.dump(),
                    inputs: this.inputRecorder.dump(),
                    metadata: {
                        ...snapshot.metadata,
                        startTime,
                        stopTime
                    },
                };
                return chunk;
            });
    }

    private syncSnapshot(): Without<UnoptimizedSnapshotChunk, "_id"> {
        return {
            type: "snapshot",
            snapshot: {
                root: this.domWalker.traverseNode(document.documentElement!),
                documentMetadata: extractMetadata(document, location)
            },
            metadata: {
                startTime: this.timeManager.currentTime(),
                stopTime: this.timeManager.currentTime()
            },
            changes: [],
            inputs: {},
        };
    }

    async record() {
        [this.timeManager, this.mutationRecorder, this.inputRecorder]
            .forEach(manager => manager.start());
    }

    dumpDiff(finalize: boolean): PendingDiffChunk {
        const startTime = this.lastChunk!;
        const stopTime = this.lastChunk = this.timeManager.currentTime();

        const type = "diff";
        return {
            assets: [],
            type,
            changes: finalize ? this.mutationRecorder.stop() : this.mutationRecorder.dump(),
            inputs: finalize ? this.inputRecorder.stop() : this.inputRecorder.dump(),
            metadata: {
                startTime,
                stopTime
            }
        };
    }

}

export interface IScraper {
    record(): void;
    createSnapshotChunk(): Promise<Without<SnapshotChunk, "_id">>;
}
