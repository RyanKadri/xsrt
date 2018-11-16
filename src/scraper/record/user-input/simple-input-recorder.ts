import { RecordedUserInput, UserInputRecorder } from "./input-recorder";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { ScrapedElement } from "../../types/types";
import { TimeManager } from "../../utils/time-manager";

export class SimpleInputHandler<InputType extends RecordedUserInput, EventType extends Event = Event>
    implements UserInputRecorder<InputType> {
    
    private recordedEvents: InputType[] = [];

    constructor(
        private events: string[],
        public channel: string,
        private handler: (evt: EventType, managedEl?: ScrapedElement) => Partial<InputType>,
        private domWalker: RecordingDomManager,
        private timeManager: TimeManager
    ) { }

    start() {
        this.events.forEach(evt => {
            document.addEventListener(evt, this.recordEvent, { capture: true });
        });
    }

    stop() {
        this.events.forEach(evt => {
            document.removeEventListener(evt, this.recordEvent, { capture: true })
        });
        const recorded = this.recordedEvents;
        this.recordedEvents = [];
        return recorded;
    }

    private recordEvent = (evt: Event) => {
        const recorded = this.handler(evt as EventType, this.domWalker.fetchManagedNode(evt.target as Node));
        this.recordedEvents.push({
            ...recorded as any,
            timestamp: this.timeManager.currentTime(),
            type: evt.type
        } as InputType);
    }
}