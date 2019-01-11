import { injectable, multiInject } from "inversify";
import { debounce } from "../../../common/utils/functional-utils";
import { RecordedUserInput } from "../../../scraper/types/event-types";
import { RecordingEvents } from "../../components/utils/recording-data-utils";
import { TweakableConfigs } from "../tweakable-configs";

export const IInputAnnotator = Symbol("IInputAnnotator");

@injectable()
export class AnnotationService {

    constructor(
        @multiInject(IInputAnnotator) private annotators: InputAnnotator[],
        private uxTweaks: TweakableConfigs
    ) {}

    annotate(events: RecordingEvents): RecordingAnnotation[] {
        const inputGroups = events.inputs;
        const annotationGroups = this.annotators.reduce((acc, annotator) => {
            const inputGroup = inputGroups.find(group => group.name === annotator.type && group.elements.length > 0);
            if (inputGroup) {
                acc.push({
                    annotator,
                    inputs: inputGroup.elements
                });
            }
            return acc;
        }, [] as AnnotationGroup[]);

        const debouncedGroups: AnnotationGroup[] = annotationGroups.map(group => {
            const debounceTime = group.annotator.debounceTime || this.uxTweaks.annotationEventDebounce;
            return debounce(group.inputs, debounceTime, input => input.timestamp)
                .map(inputs => ({
                    annotator: group.annotator,
                    inputs
                }));
        }).flat();

        return debouncedGroups.map(group => {
            const lastInput = group.inputs[group.inputs.length - 1];
            const annotation = group.annotator.annotate(lastInput);
            return {
                ...annotation,
                triggers: group.inputs.map(input => ({ type: "input" as "input", cause: input })),
                startTime: lastInput.timestamp
            };
        });
    }

}

interface AnnotationGroup {
    annotator: InputAnnotator;
    inputs: RecordedUserInput[];
}

export interface InputAnnotator<T extends RecordedUserInput = RecordedUserInput> {
    listen: "input";
    type: string;
    annotate(inp: T): Pick<RecordingAnnotation, "description">;
    debounceTime?: number;
}

export interface RecordingAnnotation {
    description: string;
    triggers: AnnotationCause[];
    startTime: number;
}

export type AnnotationCause = InputCause;

export interface InputCause {
    type: "input";
    cause: RecordedUserInput;
}
