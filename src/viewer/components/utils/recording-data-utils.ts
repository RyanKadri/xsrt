import { between, pipe, pluck } from "../../../common/utils/functional-utils";
import { Group } from "../../../common/utils/type-utils";
import { RecordedMutationGroup } from "../../../scraper/record/dom-changes/mutation-recorder";
import { RecordedUserInput } from "../../../scraper/record/user-input/input-recorder";

export function eventsBetween(changes: RecordedMutationGroup[], inputGroups: UserInputGroup[], fromTime: number, toTime: number)
    : { changes: RecordedMutationGroup[], inputs: UserInputGroup[]} {
    const timeInRange = pipe(pluck('timestamp'), between(fromTime, toTime)); 
        
    return {
        changes: changes.filter(timeInRange),
        inputs: inputGroups.map(group => ({
            name: group.name,
            elements: group.elements.filter(timeInRange)
        })).filter(group => group.elements.length > 0)
    };
}

export type UserInputGroup = Group<RecordedUserInput>;