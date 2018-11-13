import { RecordedMouseEvent, handleMouseMove } from "./mouse-recorder";
import { RecordedScrollEvent, handleScroll } from "./scroll-recorder";
import { RecordedInputChannels } from "../../types/types";
import { SimpleInputHandler } from "./simple-input-recorder";
import { DomTraverser } from "../../traverse/traverse-dom";
import { handleInputChange, RecordedInputChangeEvent } from "./input-event-recorder";

export class CompleteInputRecorder {

    private recorders: UserInputRecorder<RecordedUserInput>[];
    
    constructor(
        domWalker: DomTraverser,
    ) {
        this.recorders = [
            new SimpleInputHandler<RecordedMouseEvent, MouseEvent>
                (['mousemove', 'mousedown', 'mouseup'], 'mouse', handleMouseMove, domWalker),
            new SimpleInputHandler<RecordedScrollEvent, UIEvent>
                (['scroll'], 'scroll', handleScroll, domWalker),
            new SimpleInputHandler<RecordedInputChangeEvent>
                (['input', 'change'], 'input', handleInputChange, domWalker)
        ]
    }

    start() {
        this.recorders.forEach(rec => rec.start())    
    }

    stop() {
        return this.recorders.reduce((acc, rec) => {
            acc[rec.channel] = (acc[rec.channel] || []).concat(rec.stop());
            return acc;
        }, {} as RecordedInputChannels)
    }
}

export type RecordedUserInput = RecordedMouseEvent | RecordedScrollEvent | RecordedInputChangeEvent

export interface BaseUserInput {
    timestamp: number;
    type: string;
}

export interface UserInputRecorder<InputType> {
    channel: string;
    start();
    stop(): InputType[];
}