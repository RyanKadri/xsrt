import { BaseUserInput } from "./input-recorder";
import { ScrapedElement } from "../../types/types";

export function handleInputChange(evt: Event, managedNode?: ScrapedElement): Partial<RecordedInputChangeEvent> {
    return {
        target: managedNode!.id,
        value: (evt.target as HTMLInputElement).value,
    }
}

export interface RecordedInputChangeEvent extends BaseUserInput {
    type: 'input' | 'change',
    target: number;
    value: string;   
}