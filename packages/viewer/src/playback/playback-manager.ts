import { RecordedMutationGroup, SnapshotChunk } from "@xsrt/common";
import { injectable } from "inversify";
import { UserInputGroup } from "../components/utils/recording-data-utils";
import { DomManager } from "./dom-manager";
import { MutationManager } from "./mutation-manager";
import { UserInputPlaybackManager } from "./user-input/user-input-manager";

const pausedClass = "__app-icu-paused";

@injectable()
export class PlaybackManager {
    constructor(
        private domManager: DomManager,
        private mutationManager: MutationManager,
        private userInputManager: UserInputPlaybackManager
    ) {}

    play(changes: RecordedMutationGroup[], inputs: UserInputGroup[]) {
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

    initialize(document: Document, data: SnapshotChunk) {
        this.domManager.initialize(document);
        this.domManager.createInitialDocument(data);
    }
}
