import { ScrapedHtmlElement } from "@xsrt/common";
import { HtmlInputRecorder } from './input-event-recorder';

describe(HtmlInputRecorder.name, () => {
    it(`Uses checkbox "checked" value in place of value prop`, () => {
        const recorder = new HtmlInputRecorder();
        const managedTarget = { id: 123 } as ScrapedHtmlElement;
        const res = recorder.handle(mockCheckboxInput(), { time: 123, target: managedTarget });
        expect(res).toEqual({ target: 123, value: true })
    })
})

function mockCheckboxInput() {
    return {
        target: {
            type: 'checkbox',
            checked: true,
            value: "Whatever"
        } as HTMLInputElement
    } as unknown as Event;
}
