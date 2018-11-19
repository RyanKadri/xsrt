import { RecordedMouseEvent, MouseRecorder } from "./mouse-recorder";
import { RecordedScrollEvent, scrollRecorder } from "./scroll-recorder";
import { RecordedInputChannels, ScrapedElement } from "../../types/types";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { RecordedInputChangeEvent, inputRecorder } from "./input-event-recorder";
import { TimeManager } from "../../utils/time-manager";

export class CompleteInputRecorder {

    private recorders: UserInputRecorder<Event, RecordedUserInput>[];
    private events: RecordedInputChannels = {};
    private handlers: {[ channel: string]: EventListener} = {};
    
    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager
    ) {
        this.recorders = [
            new MouseRecorder(),
            scrollRecorder,
            inputRecorder,
        ]
    }

    start() {
        this.recorders.forEach(rec => {
            if(rec.start) {
                rec.start();
            }
            this.events[rec.channel] = [];
            const handler = this.createEventHandler(rec);
            this.handlers[rec.channel] = handler;

            rec.events.forEach(evt => {
                document.addEventListener(evt, handler, { capture: true });
            });
        })
    }

    stop() {
        this.recorders.forEach(rec => {
            if(rec.stop) {
                rec.stop();
            }
            rec.events.forEach(evt => {
                document.removeEventListener(evt, this.handlers[rec.channel], { capture: true });
            })
        })
        return this.events;
    }

    private createEventHandler = (rec: UserInputRecorder<Event, RecordedUserInput>) => {
        return (event: Event) => {
            const context: RecordedEventContext = {
                target: this.domWalker.fetchManagedNode(event.target as Node),
                time: this.timeManager.currentTime()
            }
            const res = rec.handle(event, context);
            if(res) {
                this.events[rec.channel].push({
                    ...res,
                    type: event.type,
                    target: context.target ? context.target.id : undefined,
                    timestamp: context.time
                } as RecordedUserInput)
            }
        }
    }
}

export type RecordedUserInput = RecordedMouseEvent | RecordedScrollEvent | RecordedInputChangeEvent

export interface BaseUserInput {
    timestamp: number;
    type: string;
}

export interface UserInputRecorder<EventType, RecordedType> {
    channel: string;
    events: string[];
    handle(event: EventType, context: RecordedEventContext): Partial<RecordedType> | null;
    start?();
    stop?(): void;
}

export interface RecordedEventContext {
    time: number;
    target?: ScrapedElement
}