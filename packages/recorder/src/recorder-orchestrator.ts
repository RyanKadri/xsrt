import { LoggingService, PendingDiffChunk, PendingSnapshotChunk, pluck, RecordingChunk, ScraperConfig, ScraperConfigToken, SnapshotChunk, sortAsc, Without } from "@xsrt/common";
import { mergeMaps } from "@xsrt/common";
import { inject, injectable } from "inversify";
import { RecorderApiService } from "./api/recorder-api-service";
import { RecordingInfo, RecordingStateService } from "./api/recording-state-service";
import { chunkMutationLimit } from "./record/dom-changes/mutation-tracker";
import { Recorder } from "./recorder";
import { EventService } from "./utils/event-service";

const unloadEvent = "unload";

@injectable()
export class RecorderOrchestrator {

    constructor(
        private recorderApi: RecorderApiService,
        private recorderState: RecordingStateService,
        private recorder: Recorder,
        @inject(ScraperConfigToken) private config: ScraperConfig,
        private eventService: EventService,
        private logger: LoggingService
    ) { }

    private initInfoTask?: Promise<RecordingInfo>;
    private initInfo?: RecordingInfo;
    private initSnapshotTask?: Promise<Without<SnapshotChunk, "_id">>;
    private latestEnd = 0;

    private sentInitChunk = false;

    initialize() {
        this.logger.info("Something");
        this.recorder.record();
        this.initInfoTask = this.recorderApi.startRecording()
            .then(info => this.initInfo = info);

        // At the moment, this needs to run after the previous line so the event trackers can record unload events
        // It feels fragile though. Maybe there's a better (but not annoying way)
        window.addEventListener(unloadEvent, this.onUnload);
        this.initSnapshotTask = this.recorder.createSnapshotChunk();

        Promise.all([this.initSnapshotTask, this.initInfoTask])
            .then(([ optimized ]) => {
                    this.sentInitChunk = true;
                    this.reportChunk(optimized, false);
            }).then(() => {
                this.startCollectingDiffs();
            });

    }

    onUnload = () => {
        this.onStop(true);
    }

    onStop = async (isUnloading: boolean) => {

        if (isUnloading && !this.sentInitChunk) {
            // TODO - Potentially handle this by sending an unoptimized snapshot to the server and optimizing there.
            // Need to think about data constraints and access to underlying dom elements (for call reduction)
            this.reportErr(new Error(`Requested data was not ready by the time the page was closed`));
        }
        const leftovers = this.recorder.dumpDiff(isUnloading);

        if (!isUnloading) {
            const snapshot = await this.initSnapshotTask!;
            const initInfo = await this.initInfoTask;
            const chunk = this.sentInitChunk ? leftovers : this.mergeLeftovers(snapshot, leftovers);
            window.removeEventListener(unloadEvent, this.onUnload);
            await this.reportChunk(chunk, isUnloading);
            this.recorderApi.finalizeRecording(initInfo!._id, this.latestEnd);
        } else {
            this.reportChunk(leftovers, isUnloading);
        }
    }

    private startCollectingDiffs() {
        // TODO - requestIdleCallback maybe?
        this.eventService.addEventListener(chunkMutationLimit, () => {
            const diff = this.recorder.dumpDiff(false);
            this.reportChunk(diff, false);
        });
    }

    private mergeLeftovers(snapshot: PendingSnapshotChunk, diff: PendingDiffChunk): PendingSnapshotChunk {
        return {
            ...snapshot,
            changes: snapshot.changes.concat(diff.changes),
            inputs: mergeMaps(snapshot.inputs, diff.inputs, sortAsc(pluck("timestamp")))
        };
    }

    private reportChunk(chunk: Without<RecordingChunk, "_id">, unloading: boolean) {
        if (!this.initInfo) { throw new Error("Tried to report chunk but did not have required reporting metadata"); }

        if (!unloading) {
            this.latestEnd = Math.max(chunk.metadata.stopTime, this.latestEnd),
            this.recorderApi.postToBackend(chunk, this.initInfo._id, this.config.debugMode);
        } else {
            this.recorderState.savePendingChunk(chunk);
        }
    }

    private reportErr(err: Error) {
        this.logger.error(err);
    }
}
