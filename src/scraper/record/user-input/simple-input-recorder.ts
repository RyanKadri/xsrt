import { RecordedUserInput, UserInputRecorder } from "./input-recorder";
import { DomTraverser } from "../../traverse/traverse-dom";
import { ScrapedElement } from "../../types/types";

export class SimpleInputHandler<InputType extends RecordedUserInput, EventType extends Event = Event>
    implements UserInputRecorder<InputType> {
    
    private recordedEvents: InputType[] = [];

    constructor(
        private events: string[],
        public channel: string,
        private handler: (evt: EventType, managedEl?: ScrapedElement) => InputType,
        private domWalker: DomTraverser
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
        this.recordedEvents.push(this.handler(evt as EventType, this.domWalker.fetchManagedNode(evt.target as Node)));
    }
}