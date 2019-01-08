import { between, pipe, pluck } from "../../../common/utils/functional-utils";
import { Group } from "../../../common/utils/type-utils";
import { RecordedUserInput } from '../../../scraper/types/event-types';
import { RecordedMutationGroup } from '../../../scraper/types/types';

export function eventsBetween(changes: RecordedMutationGroup[], inputGroups: UserInputGroup[], fromTime: number, toTime: number)
    : RecordingEvents {
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

export interface RecordingEvents {
    changes: RecordedMutationGroup[];
    inputs: UserInputGroup[];
}