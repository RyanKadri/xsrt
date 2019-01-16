import { ScrapedTextElement } from "../../types/types";
import { MouseRecorder } from './mouse-recorder';

describe(MouseRecorder.name, () => {
    it('Ignores quick successive mousemove events based on a configurable debounce', () => {
        const mouseRecorder = new MouseRecorder({ mouseMoveDebounce: 10 });
        const evt1 = mouseRecorder.handle(mockMouseMove(), { time: 2 });
        const evt2 = mouseRecorder.handle(mockMouseMove(), { time: 5 });
        const evt3 = mouseRecorder.handle(mockMouseMove(), { time: 13 });
        expect(evt1).not.toBeNull();
        expect(evt2).toBeNull();
        expect(evt3).not.toBeNull()
    });

    it('Returns mouse-related information for a mouse event', () => {
        const mouseRecorder = new MouseRecorder({ mouseMoveDebounce: 10 });
        const target: ScrapedTextElement = { type: 'text', id: 333, content: "asd" };
        const resp = mouseRecorder.handle(mockMouseDown(), { time: 2, target });
        expect(resp).toEqual({ x: 111, y: 222, button: 1, buttonDown: true, hovered: 333 })
    })
})

function mockMouseMove() {
    return { type: "mousemove", pageX: 123, pageY: 321 } as MouseEvent;
}

function mockMouseDown() {
    return { type: "mousedown", pageX: 111, pageY: 222, button: 1 } as MouseEvent
}
