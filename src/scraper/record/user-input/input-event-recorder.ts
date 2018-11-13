import { BaseUserInput } from "./input-recorder";
import { ScrapedElement } from "../../types/types";

export function handleInputChange(evt: Event, managedNode?: ScrapedElement): RecordedInputChangeEvent {
    return {
        type: evt.type as any,
        target: managedNode!.id,
        value: (evt.target as HTMLInputElement).value,
        timestamp: Date.now()
    }
}

export interface RecordedInputChangeEvent extends BaseUserInput {
    type: 'input' | 'change',
    target: number;
    value: string;   
}