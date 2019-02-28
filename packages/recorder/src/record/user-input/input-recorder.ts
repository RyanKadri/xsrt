import { group, Interface, MapTo, RecordedInputChannels, RecordedUserInput, ScrapedElement } from "@xsrt/common";
import { inject, injectable, multiInject } from "inversify";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { TimeManager } from "../../utils/time-manager";
import { GlobalEventService } from "./global-event-service";

export const IUserInputRecorder = Symbol.for("IUserInputRecorder");

@injectable()
export class EventCallbackCreator {

    constructor(
        @inject(RecordingDomManager) private domWalker: Interface<RecordingDomManager>,
        @inject(TimeManager) private timeManager: Interface<TimeManager>
    ) { }

    createEventCb = (recorder: UserInputRecorder) =>
        (event: Event) => {
            const target = event.target && this.nodeIsManaged(event.target as Node)
                ? this.domWalker.fetchManagedNode(event.target as Node)
                : undefined;

            const context: RecordedEventContext = {
                target,
                time: this.timeManager.currentTime()
            };

            const res = recorder.handle(event, context);
            if (res) {
                return {
                    type: event.type,
                    target: context.target ? context.target.id : null,
                    timestamp: context.time,
                    ...res,
                } as RecordedUserInput;
            } else {
                return undefined;
            }
        }

    private nodeIsManaged(node: Node) {
        return !this.domWalker.isHidden(node)
             && this.domWalker.isManaged(node);
    }
}

@injectable()
export class CompleteInputRecorder {

    private events: RecordedInputChannels = {};
    private handlers: MapTo<UserInputRecorder> = {};
    private listenerIds: number[] = [];

    constructor(
        @multiInject(IUserInputRecorder) private recorders: UserInputRecorder<Event, RecordedUserInput>[],
        @inject(GlobalEventService) private globalEventService: Interface<GlobalEventService>,
        @inject(EventCallbackCreator) private eventCallbackCreator: Interface<EventCallbackCreator>
    ) {
        this.handlers = group(recorders, recorder => recorder.sources.map(source => source.type))
            .reduce((acc, el) => {
                acc[el.group] = el.items[0];
                return acc;
            }, {} as MapTo<UserInputRecorder>);
    }

    start() {
        this.recorders.forEach(recorder => {
            if (recorder.start) {
                recorder.start();
            }
        });
        Object.entries(this.handlers).forEach(([groupKey, recorder]) => {
            this.events[groupKey] = [];
            this.createEventHandler(groupKey, recorder.sources.find(source => source.type === groupKey)!);
            this.handlers[groupKey] = recorder;
        });
    }

    dump() {
        const events = this.events;
        this.events = Object.keys(this.events)
            .reduce((acc, key) => {
                acc[key] = [];
                return acc;
            }, { } as RecordedInputChannels);
        return events;
    }

    stop() {
        Object.values(this.handlers).forEach(rec => {
            if (rec.stop) {
                rec.stop();
            }
        });
        this.listenerIds.forEach(listener => {
            this.globalEventService.removeEventListener(listener);
        });
        return this.dump();
    }

    private createEventHandler = (groupName: string, source: EventSource) => {
        const recorder = this.handlers[groupName];
        const eventCb = this.eventCallbackCreator.createEventCb(recorder);
        const wrappedCb = (evt: Event) => {
            const res = eventCb(evt);
            if (res) {
                const channel = this.events[res.type || groupName] || [];
                channel.push(res);
                this.events[res.type || groupName] = channel;
            }
        };
        const id = this.globalEventService.addEventListener(groupName, wrappedCb, {
            capture: true,
            target: source.originator as any
        });
        this.listenerIds.push(id);
    }

}

export interface UserInputRecorder<EventType = Event, RecordedType = RecordedUserInput> {
    // A recorder can listen to multiple channels but two recorders cannot currently listen to the same channel
    sources: EventSource[];
    handle(event: EventType, context: RecordedEventContext): Partial<RecordedType> | null;
    start?(): void;
    stop?(): void;
}

export interface RecordedEventContext {
    time: number;
    target?: ScrapedElement;
}

export interface EventSource {
    type: string;
    originator: "document" | "window" | "synthetic";
}
