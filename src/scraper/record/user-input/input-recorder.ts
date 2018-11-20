import { RecordedMouseEvent } from "./mouse-recorder";
import { RecordedScrollEvent } from "./scroll-recorder";
import { RecordedInputChannels, ScrapedElement } from "../../types/types";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { RecordedInputChangeEvent } from "./input-event-recorder";
import { TimeManager } from "../../utils/time-manager";
import { injectable, multiInject } from "inversify";
import { nodeIsHidden } from "../../utils/utils";

export const IUserInputRecorder = Symbol.for('IUserInputRecorder');

@injectable()
export class CompleteInputRecorder {

    private events: RecordedInputChannels = {};
    private handlers: {[ channel: string]: EventListener} = {};
    
    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager,
        @multiInject(IUserInputRecorder) private recorders: UserInputRecorder<Event, RecordedUserInput>[]
    ) { }
    
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
            const target = event.target && !nodeIsHidden(event.target as Node) 
                ? this.domWalker.fetchManagedNode(event.target as Node)
                : undefined;
                
            const context: RecordedEventContext = {
                target,
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