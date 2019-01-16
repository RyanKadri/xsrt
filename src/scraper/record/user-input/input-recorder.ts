import { inject, injectable, multiInject } from "inversify";
import { group, pluck } from "../../../common/utils/functional-utils";
import { Interface, MapTo } from "../../../common/utils/type-utils";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { RecordedInputChannels, RecordedUserInput } from "../../types/event-types";
import { ScrapedElement } from "../../types/types";
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
        @multiInject(IUserInputRecorder) recorders: UserInputRecorder<Event, RecordedUserInput>[],
        @inject(GlobalEventService) private globalEventService: Interface<GlobalEventService>,
        @inject(EventCallbackCreator) private eventCallbackCreator: Interface<EventCallbackCreator>
    ) {
        this.handlers = group(recorders, pluck("channels"))
            .reduce((acc, el) => {
                acc[el.group] = el.items[0];
                return acc;
            }, {} as MapTo<UserInputRecorder>);
    }

    start() {
        Object.entries(this.handlers).forEach(([groupKey, recorder]) => {
            this.events[groupKey] = [];
            if (recorder.start) {
                recorder.start();
            }
            this.createEventHandler(groupKey);
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

    private createEventHandler = (groupName: string) => {
        const recorder = this.handlers[groupName];
        const eventCb = this.eventCallbackCreator.createEventCb(recorder);
        const wrappedCb = (evt: Event) => {
            const res = eventCb(evt);
            if (res) {
                this.events[res.type || groupName].push(res);
            }
        };
        const id = this.globalEventService.addEventListener(groupName, wrappedCb, { capture: true });
        this.listenerIds.push(id);
    }

}

export interface UserInputRecorder<EventType = Event, RecordedType = RecordedUserInput> {
    // A recorder can listen to multiple channels but two recorders cannot currently listen to the same channel
    channels: string[];
    handle(event: EventType, context: RecordedEventContext): Partial<RecordedType> | null;
    listen: "document" | "window";
    start?(): void;
    stop?(): void;
}

export interface RecordedEventContext {
    time: number;
    target?: ScrapedElement;
}
