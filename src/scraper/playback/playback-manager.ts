import { DomManager } from "./dom-manager";
import { MutationManager } from "./mutation-manager";
import { UserInputPlaybackManager } from "./user-input/user-input-manager";
import { DedupedData } from "../types/types";
import { injectable } from "inversify";
import { pipe, pluck, between } from "@common/utils/functional-utils";

@injectable()
export class PlaybackManager {
    constructor(
        private domManager: DomManager,
        private mutationManager: MutationManager,
        private userInputManager: UserInputPlaybackManager
    ) {}

    play({ changes, inputs }: DedupedData, fromTime: number, toTime: number) {
        const timeInRange = pipe(pluck('timestamp'), between(fromTime, toTime)); 
        
        this.mutationManager.applyChanges(
            changes.filter(timeInRange)
        );
            
        const userInputs = Object.entries(inputs)
            .map(([channel, inputs]) => ({
                channel,
                updates: inputs.filter(timeInRange),
            })).filter(req => req.updates.length > 0);
        this.userInputManager.simulateUserInputs(userInputs);
    }

    initialize(document: Document, data: DedupedData) {
        this.domManager.initialize(document);
        this.domManager.serializeToDocument(data);
    }
}