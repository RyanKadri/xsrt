import { injectable, multiInject } from "inversify";
import { debounce } from "../../../common/utils/functional-utils";
import { RecordedMutation, RecordedMutationGroup } from "../../../scraper/record/dom-changes/mutation-recorder";
import { RecordedUserInput } from "../../../scraper/record/user-input/input-recorder";
import { UserInputGroup } from "../../components/utils/recording-data-utils";

const debounceTime = 500;

export const IInputAnnotator = Symbol('IInputAnnotator');

@injectable()
export class AnnotationService {

    constructor(
        @multiInject(IInputAnnotator) private annotators: InputAnnotator[]
    ) {}

    annotate(_: RecordedMutationGroup[], inputGroups: UserInputGroup[]): RecordingAnnotation[] {
        const annotationGroups: AnnotationGroup[] = this.annotators.map(annotator => {
            const inputs = inputGroups.filter(group => group.name === annotator.type && group.elements.length > 0)
            return {
                annotator,
                inputs: inputs.map(inp => inp.elements).flat()
            }
        }).filter(group => group.inputs.length > 0);

        const debouncedGroups: AnnotationGroup[] = annotationGroups.map(group => {
            return debounce(group.inputs, debounceTime, input => input.timestamp)
                .map(inputs => ({
                    annotator: group.annotator,
                    inputs
                }))
        }).flat();

        return debouncedGroups.map(group => {
            const annotation = group.annotator.annotate(group.inputs[0]);
            return {
                ...annotation,
                triggers: group.inputs.map(input => ({ type: 'input' as 'input', input })),
                startTime: group.inputs[0].timestamp
            }
        })
    }

}

interface AnnotationGroup {
    annotator: InputAnnotator;
    inputs: RecordedUserInput[];
}

export interface InputAnnotator<T extends RecordedUserInput = RecordedUserInput> {
    listen: 'input';
    type: string;
    shouldOverwrite(rec: InputCause, evt: T): boolean;
    annotate(inp: T): Pick<RecordingAnnotation, "description">
}

export interface RecordingAnnotation {
    description: string;
    triggers: AnnotationCause[];
    startTime: number
}

export type AnnotationCause = InputCause | MutationCause;

export interface InputCause {
    type: 'input';
    input: RecordedUserInput;
} 

export interface MutationCause {
    type: 'mutation';
    mutation: RecordedMutation
}