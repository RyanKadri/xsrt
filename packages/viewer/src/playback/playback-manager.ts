import { between, RecordedMutationGroup, SnapshotChunk } from "../../../common/src";
import { injectable } from "inversify";
import { eventsBetween, UserInputGroup } from "../components/utils/recording-data-utils";
import { DomManager } from "./dom-manager";
import { MutationManager } from "./mutation-manager";
import { UserInputPlaybackManager } from "./user-input/user-input-manager";

const pausedClass = "__app-icu-paused";

@injectable()
export class PlaybackManager {

    private lastSnapshot?: SnapshotChunk;

    constructor(
        private domManager: DomManager,
        private mutationManager: MutationManager,
        private userInputManager: UserInputPlaybackManager
    ) {}

    playUpdates(
        snapshots: SnapshotChunk[],
        allChanges: RecordedMutationGroup[],
        allInputs: UserInputGroup[],
        fromTime: number,
        toTime: number,
        doc: Document
    ) {
        const isRewind = fromTime > toTime;

        const newSnapshots = snapshots
            .filter(snapshot =>
                between(snapshot.metadata.startTime, isRewind ? 0 : fromTime, toTime)
            );

        const newestSnapshot = newSnapshots[snapshots.length - 1];

        const adjustedPrevTime = newestSnapshot
            ? newestSnapshot.metadata.startTime
            : fromTime;

        if (isRewind ||
            (newestSnapshot !== undefined && newestSnapshot !== this.lastSnapshot)) {
            this.reset(doc, newestSnapshot);
            this.lastSnapshot = newestSnapshot;
        }

        const { inputs, changes } = eventsBetween(
            allChanges, allInputs, adjustedPrevTime, toTime
        );

        this.mutationManager.applyChanges(changes);
        this.userInputManager.simulateUserInputs(inputs);
    }

    togglePause(shouldPause: boolean) {
        if (shouldPause) {
            this.domManager.mutateDocument(document => document.body.classList.add(pausedClass));
        } else {
            this.domManager.mutateDocument(document => document.body.classList.remove(pausedClass));
        }
    }

    reset(document: Document, data: SnapshotChunk) {
        this.domManager.initialize(document);
        this.domManager.createInitialDocument(data);
    }
}
