import { injectable, multiInject } from "inversify";
import { debounce } from "../../../common/utils/functional-utils";
import { RecordedMutation, RecordedUserInput } from '../../../scraper/types/types';
import { UserInputGroup } from "../../components/utils/recording-data-utils";

export const IInputAnnotator = Symbol('IInputAnnotator');

@injectable()
export class AnnotationService {

    static readonly defaultDebounce = 500;

    constructor(
        @multiInject(IInputAnnotator) private annotators: InputAnnotator[],
    ) {}

    annotate(inputGroups: UserInputGroup[]): RecordingAnnotation[] {
        const annotationGroups = this.annotators.reduce((acc, annotator) => {
            const inputGroup = inputGroups.find(group => group.name === annotator.type && group.elements.length > 0)
            if(inputGroup) {
                acc.push({
                    annotator,
                    inputs: inputGroup.elements
                })
            }
            return acc;
        }, [] as AnnotationGroup[]);

        const debouncedGroups: AnnotationGroup[] = annotationGroups.map(group => {
            const debounceTime = group.annotator.debounceTime || AnnotationService.defaultDebounce;
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
    annotate(inp: T): Pick<RecordingAnnotation, "description">
    debounceTime?: number
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