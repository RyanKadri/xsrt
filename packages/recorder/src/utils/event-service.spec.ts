import { noop } from "../../../common/src";
import { chunkMutationLimit } from "../record/dom-changes/mutation-tracker";
import { EventService, ScrapeEvent } from "./event-service";

describe(EventService.name, () => {
    const service = new EventService();
    it('Calls a supplied callback for each listener registered to the provided type', () => {
        let totalAmount = 0;
        const cb = ({ payload }: ScrapeEvent) => totalAmount = totalAmount + payload;
        service.addEventListener<ScrapeEvent>(chunkMutationLimit, cb);
        service.addEventListener<ScrapeEvent>(chunkMutationLimit, cb);
        service.addEventListener<ScrapeEvent>(chunkMutationLimit, cb);
        service.addEventListener("test", noop)
        service.dispatch({ type: chunkMutationLimit, payload: 2});
        expect(totalAmount).toBe(6);
    });

    it('Does not panic if no listeners exist', () => {
        service.dispatch({ type: 'whatever', payload: 1})
    })
})
