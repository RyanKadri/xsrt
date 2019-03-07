import { PendingDiffChunk, PendingSnapshotChunk } from "@xsrt/common";
import { injectable } from "inversify";
import { RecordingInfo } from "./api/recording-state-service";
import { RecordingOptimizer } from "./optimize/optimize";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { extractMetadata } from "./traverse/extract-metadata";
import { RecordingDomManager } from "./traverse/traverse-dom";
import { TimeManager } from "./utils/time-manager";

@injectable()
export class Recorder {
    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager,
        private mutationRecorder: MutationRecorder,
        private inputRecorder: CompleteInputRecorder,
        private optimizer: RecordingOptimizer
    ) {}

    private lastChunk?: number;

    createSnapshotChunk(recordingInfo: RecordingInfo, initChunk: boolean): PendingSnapshotChunk {
        this.lastChunk = this.timeManager.currentTime();
        return this.optimizer.optimize({
            type: "snapshot",
            recording: recordingInfo._id,
            snapshot: {
                root: this.domWalker.traverseNode(document.documentElement!),
                documentMetadata: extractMetadata(document, location)
            },
            metadata: {
                startTime: this.timeManager.fetchSessionStart(),
                stopTime: this.lastChunk
            },
            changes: [],
            inputs: {},
            initChunk
        });
    }

    async record() {
        [this.timeManager, this.mutationRecorder, this.inputRecorder]
            .forEach(manager => manager.start());
    }

    dumpDiff(recordingInfo: RecordingInfo, finalize: boolean): PendingDiffChunk {
        const startTime = this.lastChunk!;
        const stopTime = this.lastChunk = this.timeManager.currentTime();

        return this.optimizer.optimize({
            type: "diff" as "diff",
            assets: [],
            recording: recordingInfo._id,
            changes: finalize ? this.mutationRecorder.stop() : this.mutationRecorder.dump(),
            inputs: finalize ? this.inputRecorder.stop() : this.inputRecorder.dump(),
            metadata: {
                startTime,
                stopTime
            }
        });
    }

}
