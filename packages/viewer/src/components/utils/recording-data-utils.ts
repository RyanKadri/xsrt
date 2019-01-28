import { between, Group, pipe, pluck, RecordedMutationGroup, RecordedUserInput } from "@xsrt/common";

export function eventsBetween(
    changes: RecordedMutationGroup[], inputGroups: UserInputGroup[],
    fromTime: number, toTime: number
): RecordingEvents {
    const timeInRange = pipe(pluck("timestamp"), eventTime => between(eventTime, fromTime, toTime));

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
