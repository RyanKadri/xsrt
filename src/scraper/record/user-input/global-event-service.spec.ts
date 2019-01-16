import { noop } from "../../../common/utils/functional-utils";
import { GlobalEventService } from './global-event-service';

describe(GlobalEventService.name, () => {
    let docSpy: jasmine.SpyObj<Document>;
    let windowSpy: jasmine.SpyObj<Window>;
    let service: GlobalEventService;

    beforeEach(() => {
        docSpy = jasmine.createSpyObj<Document>("document", {
            addEventListener: undefined,
            removeEventListener: undefined
        });
        windowSpy = jasmine.createSpyObj<Window>("window", {
            addEventListener: undefined,
            removeEventListener: undefined
        });
        service = new GlobalEventService(docSpy, windowSpy);
    });

    it('Adds event listeners to the appropriate event source', () => {
        const cb = noop;
        service.addEventListener("change", cb, { capture: true });
        expect(docSpy.addEventListener).toHaveBeenCalledWith("change", cb, { capture:  true });

        service.addEventListener("input", cb, { capture: false, target: 'window' });
        expect(windowSpy.addEventListener).toHaveBeenCalledWith("input", cb, { capture: false })
    });

    it('Can remove attached event listeners based on an id returned by addEventListener', () => {
        const cb = noop;
        service.addEventListener("whatever", cb, { capture: true });
        const id = service.addEventListener("totes", cb, { capture: true });
        service.removeEventListener(id);
        expect(docSpy.removeEventListener).toHaveBeenCalledWith("totes", cb, { capture: true })
    })
})
