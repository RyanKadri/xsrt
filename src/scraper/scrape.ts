import { injectable } from 'inversify';
import { Without } from "../common/utils/type-utils";
import { RecordingInfo, RecordingStateService } from './api/recording-state-service';
import { RecordingOptimizer } from "./optimize/optimize";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { extractMetadata } from "./traverse/extract-metadata";
import { RecordingDomManager } from "./traverse/traverse-dom";
import { RecordingChunk, SnapshotChunk, UnoptimizedSnapshotChunk } from "./types/types";
import { TimeManager } from "./utils/time-manager";

@injectable()
export class Scraper implements IScraper {

    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager,
        private mutationRecorder: MutationRecorder,
        private inputRecorder: CompleteInputRecorder,
        private optimizer: RecordingOptimizer,
        private recordingState: RecordingStateService
    ) {}
    private onStop: (() => Promise<void>) | undefined;
    private optimized?: Without<SnapshotChunk, "_id">;
    private recordingInfo?: RecordingInfo;

    takeDataSnapshot(): Promise<Without<SnapshotChunk, "_id">> {
        return this.optimizer.optimize(this.syncSnapshot());
    }

    private syncSnapshot(): Without<UnoptimizedSnapshotChunk, "_id"> {
        return { 
            type: 'snapshot',
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
        }
    }

    async record(cb: OnChunkCallback) {
        
        this.takeDataSnapshot()
            .then(optimized => this.optimized = optimized);

        [this.timeManager, this.mutationRecorder, this.inputRecorder]
            .forEach(manager => manager.start());
        
        this.recordingState.startRecording()
            .then(info => this.recordingInfo = info);
        
        this.onStop = async () => {
            if(this.optimized && this.recordingInfo) {
                const chunk = {
                    ...this.optimized,
                    changes: this.mutationRecorder.stop(),
                    inputs: this.inputRecorder.stop(),
                    metadata: { 
                        ...this.optimized.metadata,
                        startTime: this.recordingInfo.startTime,
                        stopTime: this.timeManager.stop()
                    },
                };
                cb(undefined, chunk, { ...this.recordingInfo });
            } else {
                // TODO - Potentially handle this by sending an unoptimized snapshot to the server and optimizing there.
                // Need to think about data constraints and access to underlying dom elements (for call reduction)
                cb(new Error(`Requested data was not ready by the time the page was closed`));
            }
        }

        window.addEventListener('beforeunload', () => {
            console.log("unload")
            this.onStop!();
        })
    }

    async stopRecording() {
        if(this.onStop) {
            await this.onStop();
            this.recordingState.closeRecording()
        }
    }
}

export interface IScraper {
    record(cb: OnChunkCallback): void;
    takeDataSnapshot(): Promise<Without<SnapshotChunk, "_id">>;
    stopRecording(): void;
}

export interface OnChunkCallback {
    (err?: Error, chunk?: Without<RecordingChunk, "_id">, recordingInfo?: RecordingInfo): void
}