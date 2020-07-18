import { noop } from "../../../../common/src";
import { GlobalEventService } from './global-event-service';

describe(GlobalEventService.name, () => {
  let document: ConstructorParameters<typeof GlobalEventService>[0];
  let window: ConstructorParameters<typeof GlobalEventService>[1];
  let service: GlobalEventService;

  beforeEach(() => {
    document = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    window = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    service = new GlobalEventService(document, window);
  });

  it('Adds event listeners to the appropriate event source', () => {
    const cb = noop;
    service.addEventListener("change", cb, { target: "document", capture: true });
    expect(document.addEventListener).toHaveBeenCalledWith("change", cb, { capture: true });

    service.addEventListener("input", cb, { capture: false, target: 'window' });
    expect(window.addEventListener).toHaveBeenCalledWith("input", cb, { capture: false })
  });

  it('Can remove attached event listeners based on an id returned by addEventListener', () => {
    const cb = noop;
    service.addEventListener("whatever", cb, { target: "document", capture: true });
    const id = service.addEventListener("totes", cb, { target: "document", capture: true });
    service.removeEventListener(id);
    expect(document.removeEventListener).toHaveBeenCalledWith("totes", cb, { capture: true })
  })
})
