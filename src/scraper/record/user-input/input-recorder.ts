import { injectable, multiInject } from "inversify";
import { group, pluck } from '../../../common/utils/functional-utils';
import { MapTo } from "../../../common/utils/type-utils";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { RecordedInputChannels, RecordedUserInput } from '../../types/event-types';
import { ScrapedElement } from "../../types/types";
import { TimeManager } from "../../utils/time-manager";
import { nodeIsHidden } from "../../utils/utils";

export const IUserInputRecorder = Symbol.for('IUserInputRecorder');

@injectable()
export class CompleteInputRecorder {

    private events: RecordedInputChannels = {};
    private handlers: MapTo<UserInputRecorder> = {};
    private listeners: { channel: string, listener: (e: Event) => void }[] = [];
    
    constructor(
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager,
        @multiInject(IUserInputRecorder) recorders: UserInputRecorder<Event, RecordedUserInput>[]
    ) { 
        this.handlers = group(recorders, pluck('channels'))
            .reduce((acc, el) => {
                acc[el.group] = el.items[0];
                return acc;
            }, {} as MapTo<UserInputRecorder>)
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

    dump() {
        const events = this.events;
        this.events = Object.keys(this.events)
            .reduce((acc, key) => {
                acc[key] = [];
                return acc;
            }, { } as RecordedInputChannels)
        return events;
    }

    stop() {
        Object.values(this.handlers).forEach(rec => {
            if(rec.stop) {
                rec.stop();
            }
        });
        this.listeners.forEach(({channel, listener}) => {
            this.listenerTarget(this.handlers[channel]).removeEventListener(channel, listener, { capture: true });
        })
        return this.dump();
    }

    private createEventHandler = (group: string) => {
        const recorder = this.handlers[group];
        const handleEvent = (event: Event) => {
            const target = event.target && !nodeIsHidden(event.target as Node) && this.domWalker.isManaged(event.target as Node)
                ? this.domWalker.fetchManagedNode(event.target as Node)
                : undefined;
                
            const context: RecordedEventContext = {
                target,
                time: this.timeManager.currentTime()
            }

            const res = recorder.handle(event, context);
            if(res) {
                this.events[res.type || group].push({
                    type: event.type,
                    target: context.target ? context.target.id : undefined,
                    timestamp: context.time,
                    ...res,
                } as RecordedUserInput)
            }
        }
        
        this.listenerTarget(recorder).addEventListener(group, handleEvent, { capture: true });
        this.listeners.push({ channel: group, listener: handleEvent })
    }
    
    private listenerTarget(recorder: UserInputRecorder) {
        return recorder.listen === 'document' ? document : window;
    }
}

export interface UserInputRecorder<EventType = Event, RecordedType = RecordedUserInput> {
    // A recorder can listen to multiple channels but two recorders cannot currently listen to the same channel
    channels: string[];
    handle(event: EventType, context: RecordedEventContext): Partial<RecordedType> | null;
    listen: 'document' | 'window'
    start?(): void;
    stop?(): void;
}

export interface RecordedEventContext {
    time: number;
    target?: ScrapedElement
}