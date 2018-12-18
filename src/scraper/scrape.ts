import { injectable } from 'inversify';
import { Without } from "../common/utils/type-utils";
import { RecordingInfo, RecordingStateService } from './api/recording-state-service';
import { RecordingOptimizer } from "./optimize/optimize";
import { MutationRecorder } from "./record/dom-changes/mutation-recorder";
import { CompleteInputRecorder } from "./record/user-input/input-recorder";
import { extractMetadata } from "./traverse/extract-metadata";
import { RecordingDomManager } from "./traverse/traverse-dom";
import { DiffChunk, RecordingChunk, SnapshotChunk, UnoptimizedSnapshotChunk } from "./types/types";
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
    
    private lastRecording?: number;

    private initInfoTask?: Promise<RecordingInfo>
    private initInfo?: RecordingInfo;

    private initSnapshotTask?: Promise<Without<SnapshotChunk, "_id">>
    private initSnapshot?: Without<SnapshotChunk, "_id">;

    private sentInitChunk = false;
    private cb?: OnChunkCallback;

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
        this.cb = cb;
        this.initSnapshotTask = this.takeDataSnapshot()
            .then(snapshot => this.initSnapshot = snapshot);

        [this.timeManager, this.mutationRecorder, this.inputRecorder]
            .forEach(manager => manager.start());
        
        this.initInfoTask = this.recordingState.startRecording()
            .then(info => this.initInfo = info);
        
        Promise.all([this.initSnapshotTask, this.initInfoTask])
            .then(([ optimized, recordingInfo ]) => {
                if(!this.sentInitChunk) {
                    this.sentInitChunk = true;
                    this.sendSnapshotChunk(optimized, recordingInfo);
                }
            })

        window.addEventListener('beforeunload', () => {
            this.onStop!(true);
        })
    }

    async stopRecording() {
        if(this.onStop) {
            await this.onStop(false);
            this.recordingState.closeRecording()
        }
    }

    private sendSnapshotChunk(snapshot: Without<SnapshotChunk, "_id">, recordingInfo: RecordingInfo) {
        const stopTime = this.lastRecording = this.timeManager.currentTime();
        const chunk = {
            ...snapshot,
            changes: this.mutationRecorder.dump(),
            inputs: this.inputRecorder.dump(),
            metadata: { 
                ...snapshot.metadata,
                startTime: recordingInfo.startTime,
                stopTime
            },
        };
        this.cb!(undefined, chunk, { ...recordingInfo, unloading: false });
    }

    private onStop = async (isUnloading: boolean) => {
        const startTime = this.lastRecording!;
        const stopTime = this.lastRecording = this.timeManager.currentTime();
        const changes = this.mutationRecorder.stop();
        const inputs = this.inputRecorder.stop();
        const type = this.sentInitChunk ? 'diff' : 'snapshot';
        const baseChunk = {
            type,
            changes,
            inputs,
            metadata: {
                startTime,
                stopTime
            }
        };

        if(!isUnloading) {
            const info = await this.initInfoTask;
            const cbInfo = { ...info!, unloading: isUnloading };
            if(!this.sentInitChunk) {
                const snapshot = await this.initSnapshotTask!;
                this.cb!(undefined, { ...baseChunk, snapshot: snapshot.snapshot, assets: snapshot.assets } as SnapshotChunk, cbInfo);
            } else {
                this.cb!(undefined, baseChunk as DiffChunk, cbInfo);
            }
        } else {
            if(this.sentInitChunk && this.initInfo) {
                this.cb!(undefined, baseChunk as DiffChunk, { ...this.initInfo, unloading: isUnloading })
            } else if(this.initInfo && this.initSnapshot) {
                this.cb!(undefined, { 
                    ...baseChunk,
                    snapshot: this.initSnapshot.snapshot,
                    assets: this.initSnapshot.assets
                } as Without<SnapshotChunk, "_id">, { ...this.initInfo, unloading: isUnloading });
            } else {
                // TODO - Potentially handle this by sending an unoptimized snapshot to the server and optimizing there.
                // Need to think about data constraints and access to underlying dom elements (for call reduction)
                this.cb!(new Error(`Requested data was not ready by the time the page was closed`));
            }
        }
    }
}

export interface IScraper {
    record(cb: OnChunkCallback): void;
    takeDataSnapshot(): Promise<Without<SnapshotChunk, "_id">>;
    stopRecording(): void;
}

export interface OnChunkCallback {
    (err?: Error, chunk?: Without<RecordingChunk, "_id">, recordingInfo?: RecordingInfo & { unloading: boolean }): void
}