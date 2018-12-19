import { injectable, multiInject } from "inversify";
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
    
    annotateChanges(_: RecordedMutationGroup[], inputGroup: UserInputGroup[], annotations: RecordingAnnotation[] = []) {
        const newAnnotations = [...annotations];
        for(const annotator of this.annotators) {
            const annotationGroup = inputGroup.find(group => group.channel === annotator.type);
            const lastInput = annotationGroup && annotationGroup.updates[annotationGroup.updates.length - 1];
            if(lastInput) {
                let replaced = false;
                const annotationVal = annotator.annotate(lastInput);
                if(annotationVal) {
                    const newAnnotation: RecordingAnnotation = {
                        ...annotationVal,
                        cause: {
                            type: "input" as 'input',
                            input: lastInput
                        },
                        startTime: lastInput.timestamp
                    };
                    for(let i = 0; i < newAnnotations.length; i++) {
                        const oldAnnotation = newAnnotations[i];
                        if(oldAnnotation.cause !== undefined && oldAnnotation.cause.type === 'input'
                                && annotator.shouldOverwrite(oldAnnotation.cause, lastInput)) {
                            if(oldAnnotation.cause && oldAnnotation.cause.type === 'input' &&
                                (lastInput.timestamp - oldAnnotation.cause.input.timestamp) < debounceTime) {
                                newAnnotations[i] = newAnnotation;
                                replaced = true;
                            }
                        }
                    }
                    if(!replaced) {
                        newAnnotations.push(newAnnotation);
                    }
                }
            }
        }
        return newAnnotations;
    }

}

export interface InputAnnotator<T extends RecordedUserInput = RecordedUserInput> {
    listen: 'input';
    type: string;
    shouldOverwrite(rec: InputCause, evt: T): boolean;
    annotate(inp: T): Pick<RecordingAnnotation, "description"> | null
}

export interface RecordingAnnotation {
    description: string;
    cause?: AnnotationCause;
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