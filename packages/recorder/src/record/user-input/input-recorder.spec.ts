import { ScrapedHtmlElement } from "../../../../common/src";
import { CompleteInputRecorder, EventCallbackCreator, UserInputRecorder } from "./input-recorder";

describe(CompleteInputRecorder.name, () => {
  it('Calls the provided start method for each listener if it exists', () => {
    const listeners: UserInputRecorder[] = [
      { sources: [], start: jest.fn(), handle: jest.fn() },
      { sources: [], handle: jest.fn() }
    ];
    const eventService: ConstructorParameters<typeof CompleteInputRecorder>[1] = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    const callbackCreator: ConstructorParameters<typeof CompleteInputRecorder>[2] = {
      createEventCb: jest.fn()
    };

    const recorder = new CompleteInputRecorder(listeners, eventService, callbackCreator);
    recorder.start();
    expect(listeners[0].start).toHaveBeenCalled();
  })
});

describe(EventCallbackCreator.name, () => {
  const timeManager: ConstructorParameters<typeof EventCallbackCreator>[1] = {
    currentTime: jest.fn().mockReturnValue(123)
  };

  it('Provides underlying event handlers with a context consisting of the current time and event target', () => {
    const target: ScrapedHtmlElement = { tag: 'asd', attributes: [], children: [], id: 123, type: "element" };
    const domWalker: ConstructorParameters<typeof EventCallbackCreator>[0] = {
      isManaged: jest.fn(() => true),
      isHidden: jest.fn(() => false),
      fetchManagedNode: jest.fn((_: HTMLElement) => target) as any
    };
    const creator = new EventCallbackCreator(domWalker, timeManager);
    const recorder: UserInputRecorder = {
      handle: jest.fn(),
      sources: []
    };
    const cb = creator.createEventCb(recorder);
    const evt = { type: 'test', target: { test: "blah" } } as unknown as Event;
    cb(evt);
    expect(recorder.handle).toHaveBeenCalledWith(evt, { target, time: 123 })
  });

  it('Decorates the response with general info from the context and event', () => {
    const domWalker: ConstructorParameters<typeof EventCallbackCreator>[0] = {
      fetchManagedNode: jest.fn(),
      isHidden: jest.fn(),
      isManaged: jest.fn()
    };
    const creator = new EventCallbackCreator(domWalker, timeManager);
    const recorder: UserInputRecorder = { handle: jest.fn(() => ({ scrollY: 123, scrollX: 321 })), sources: [] };
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
