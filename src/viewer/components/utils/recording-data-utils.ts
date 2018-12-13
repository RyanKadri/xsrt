import { between, pipe, pluck } from "../../../common/utils/functional-utils";
import { RecordedMutationGroup } from "../../../scraper/record/dom-changes/mutation-recorder";
import { RecordedUserInput } from "../../../scraper/record/user-input/input-recorder";
import { DedupedData } from "../../../scraper/types/types";

export function eventsBetween({ changes, inputs }: DedupedData, fromTime: number, toTime: number): { changes: RecordedMutationGroup[], inputs: UserInputGroup[]} {
    const timeInRange = pipe(pluck('timestamp'), between(fromTime, toTime)); 
        
    return {
        changes: changes.filter(timeInRange),
        inputs: Object.entries(inputs)
            .map(([channel, inputs]) => ({
                channel,
                updates: inputs.filter(timeInRange),
            })).filter(req => req.updates.length > 0)
    };
}

export interface UserInputGroup {
    channel: string,
    updates: RecordedUserInput[]
}