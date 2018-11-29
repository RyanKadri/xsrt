import { RecordedMouseEvent } from "./mouse-recorder";
import { RecordedScrollEvent } from "./scroll-recorder";
import { RecordedInputChannels, ScrapedElement } from "../../types/types";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { RecordedInputChangeEvent } from "./input-event-recorder";
import { TimeManager } from "../../utils/time-manager";
import { injectable, multiInject } from "inversify";
import { nodeIsHidden } from "../../utils/utils";
import { RecordedFocusEvent } from "./focus-recorder";
import { group, pluck } from "@common/utils/functional-utils";

export const IUserInputRecorder = Symbol.for('IUserInputRecorder');

@injectable()
export class CompleteInputRecorder {

    private events: RecordedInputChannels = {};
    private handlers: {[ channel: string]: UserInputRecorder} = {};
    private listeners: { channel: string, listener: (e) => void }[] = [];
    
    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager,
        @multiInject(IUserInputRecorder) recorders: UserInputRecorder<Event, RecordedUserInput>[]
    ) { 
        this.handlers = group(recorders, pluck('channels'))
            .reduce((acc, el) => {
                acc[el.group] = el.items[0];
                return acc;
            }, {})
    }
    
    start() {
        Object.entries(this.handlers).forEach(([group, recorder]) => {
            this.events[group] = [];
            if(recorder.start) {
                recorder.start();
            }
            this.createEventHandler(group);
            this.handlers[group] = recorder;
        })
    }

    stop() {
        Object.values(this.handlers).forEach(rec => {
            if(rec.stop) {
                rec.stop();
            }
        });
        this.listeners.forEach(({channel, listener}) => {
            document.removeEventListener(channel, listener, { capture: true });
        })
        return this.events;
    }

    private createEventHandler = (group: string) => {
        const recorder = this.handlers[group];
        const handleEvent = (event: Event) => {
            const target = event.target && !nodeIsHidden(event.target as Node) 
                ? this.domWalker.fetchManagedNode(event.target as Node)
                : undefined;
                
            const context: RecordedEventContext = {
                target,
                time: this.timeManager.currentTime()
            }

            const res = recorder.handle(event, context);
            if(res) {
                this.events[group].push({
                    ...res,
                    type: event.type,
                    target: context.target ? context.target.id : undefined,
                    timestamp: context.time
                } as RecordedUserInput)
            }
        }
        document.addEventListener(group, handleEvent, { capture: true });
        this.listeners.push({ channel: group, listener: handleEvent })
    }
}

export type RecordedUserInput = RecordedMouseEvent | RecordedScrollEvent | RecordedInputChangeEvent | RecordedFocusEvent

export interface BaseUserInput {
    timestamp: number;
    type: string;
}

export interface UserInputRecorder<EventType = Event, RecordedType = RecordedUserInput> {
    // A recorder can listen to multiple channels but two recorders cannot currently listen to the same channel
    channels: string[];
    handle(event: EventType, context: RecordedEventContext): Partial<RecordedType> | null;
    start?();
    stop?(): void;
}

export interface RecordedEventContext {
    time: number;
    target?: ScrapedElement
}