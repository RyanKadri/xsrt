import { inject, injectable } from "inversify";
import { pluck, sortAsc } from "../common/utils/functional-utils";
import { Without } from "../common/utils/type-utils";
import { RecorderApiService } from "./api/recorder-api-service";
import { RecordingInfo, RecordingStateService } from "./api/recording-state-service";
import { mergeMaps } from "./record/user-input/input-utils";
import { Recorder } from "./recorder";
import { ScraperConfig, ScraperConfigToken } from "./scraper-config,";
import { PendingDiffChunk, PendingSnapshotChunk, RecordingChunk, SnapshotChunk } from "./types/types";

@injectable()
export class RecorderOrchestrator {

    constructor(
        private recorderApi: RecorderApiService,
        private recorderState: RecordingStateService,
        private recorder: Recorder,
        @inject(ScraperConfigToken) private config: ScraperConfig,
    ) { }

    private initInfoTask?: Promise<RecordingInfo>
    private initInfo?: RecordingInfo;
    private initSnapshotTask?: Promise<Without<SnapshotChunk, "_id">>
    private latestEnd = 0;

    private sentInitChunk = false;

    initialize() {
        window.addEventListener('beforeunload', () => {
            this.onStop(true);
        })

        this.recorder.record();
        this.initInfoTask = this.recorderApi.startRecording()
            .then(info => this.initInfo = info);

        this.initSnapshotTask = this.recorder.createSnapshotChunk()

        Promise.all([this.initSnapshotTask, this.initInfoTask])
            .then(([ optimized ]) => {
                    this.sentInitChunk = true;
                    this.reportChunk(optimized, false);
            })
    }

    onStop = async (isUnloading: boolean) => {

        if(isUnloading && !this.sentInitChunk) {
            // TODO - Potentially handle this by sending an unoptimized snapshot to the server and optimizing there.
            // Need to think about data constraints and access to underlying dom elements (for call reduction)
            this.reportErr(new Error(`Requested data was not ready by the time the page was closed`));
        }
        const leftovers = this.recorder.dumpDiff(isUnloading);

        if(!isUnloading) {
            const snapshot = await this.initSnapshotTask!;
            const initInfo = await this.initInfoTask;
            const chunk = this.sentInitChunk ? leftovers : this.mergeLeftovers(snapshot, leftovers)
            await this.reportChunk(chunk, isUnloading);
            this.recorderApi.finalizeRecording(initInfo!._id, this.config, this.latestEnd);
        } else {
            this.reportChunk(leftovers, isUnloading);
        }
    }

    private mergeLeftovers(snapshot: PendingSnapshotChunk, diff: PendingDiffChunk): PendingSnapshotChunk {
        return {
            ...snapshot,
            changes: snapshot.changes.concat(diff.changes),
            inputs: mergeMaps(snapshot.inputs, diff.inputs, sortAsc(pluck("timestamp")))
        }
    }

    private reportChunk(chunk: Without<RecordingChunk, "_id">, unloading: boolean) {
        if(!this.initInfo) throw new Error('Tried to report chunk but did not have required reporting metadata');

        if(!unloading) {
            this.latestEnd = Math.max(chunk.metadata.stopTime, this.latestEnd),
            this.recorderApi.postToBackend(chunk, this.initInfo._id, this.config);
        } else {
            this.recorderState.storePendingChunk(chunk)
        }
    }

    private reportErr(err: Error) {
        console.log(err);
    }
}