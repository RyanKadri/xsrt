import { RecordingDomManager } from "../../traverse/traverse-dom";
import { ScrapedHtmlElement } from "@xsrt/common";
import { TimeManager } from "../../utils/time-manager";
import { GlobalEventService } from "./global-event-service";
import { CompleteInputRecorder, EventCallbackCreator, UserInputRecorder } from "./input-recorder";

describe(CompleteInputRecorder.name, () => {
    it('Calls the provided start method for each listener if it exists', () => {
        const listeners: UserInputRecorder[] = [
            jasmine.createSpyObj<UserInputRecorder>("withStart", { start: undefined }),
            jasmine.createSpyObj<UserInputRecorder>("withoutStart", { handle: undefined })
        ];
        const eventService = jasmine.createSpyObj<GlobalEventService>("EventService", { addEventListener: undefined });
        const callbackCreator = jasmine.createSpyObj<EventCallbackCreator>("CallbackCreator", { createEventCb: undefined });

        const recorder = new CompleteInputRecorder(listeners, eventService, callbackCreator);
        recorder.start();
        expect(listeners[0].start).toHaveBeenCalled();
    })
});

describe(EventCallbackCreator.name, () => {
    const timeManager = jasmine.createSpyObj<TimeManager>("TimeManager", { currentTime: 123 });

    it('Provides underlying event handlers with a context consisting of the current time and event target', () => {
        const target = jasmine.createSpyObj<ScrapedHtmlElement>({ tagName: 'asd' });
        const domWalker = jasmine.createSpyObj<RecordingDomManager>("DomWalker", {
            isManaged: true,
            isHidden: false,
            fetchManagedNode: target
        });
        const creator = new EventCallbackCreator(domWalker, timeManager);
        const recorder = jasmine.createSpyObj<UserInputRecorder>("recorder", { handle: undefined });
        const cb = creator.createEventCb(recorder);
        const evt = { type: 'test', target: { test: "blah" } } as unknown as Event;
        cb(evt);
        expect(recorder.handle).toHaveBeenCalledWith(evt, { target, time: 123 })
    });

    it('Decorates the response with general info from the context and event', () => {
        const domWalker = jasmine.createSpyObj<RecordingDomManager>("DomWalker", {
            fetchManagedNode: undefined
        });
        const creator = new EventCallbackCreator(domWalker, timeManager);
        const recorder = jasmine.createSpyObj<UserInputRecorder>("recorder", { handle: { scrollY: 123, scrollX: 321 } });
        const cb = creator.createEventCb(recorder);
        const evt = { type: 'scroll' } as Event;
        const res = cb(evt);
        expect(res).toEqual({
            type: "scroll",
            target: null,
            timestamp: 123,
            scrollY: 123,
            scrollX: 321
        })
    })
})
