import { injectable } from "inversify";
import { UserInputGroup } from "../../viewer/components/utils/recording-data-utils";
import { RecordedMutationGroup } from "../record/dom-changes/mutation-recorder";
import { SnapshotChunk } from "../types/types";
import { DomManager } from "./dom-manager";
import { MutationManager } from "./mutation-manager";
import { UserInputPlaybackManager } from "./user-input/user-input-manager";

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

    initialize(document: Document, data: SnapshotChunk) {
        this.domManager.initialize(document);
        this.domManager.createInitialDocument(data);
    }
}