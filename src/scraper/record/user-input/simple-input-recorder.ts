import { RecordedUserInput, UserInputRecorder } from "./input-recorder";

export class SimpleInputHandler<InputType extends RecordedUserInput, EventType extends Event = Event>
    implements UserInputRecorder<InputType> {
    
    private recordedEvents: InputType[] = [];

    constructor(
        private events: string[],
        private handler: (evt: EventType) => InputType,
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
        this.recordedEvents.push(this.handler(evt as EventType));
    }
}