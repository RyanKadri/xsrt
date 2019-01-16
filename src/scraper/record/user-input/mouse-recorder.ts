import { inject, injectable } from "inversify";
import { ITweakableConfigs, TweakableConfigs } from "../../../viewer/services/tweakable-configs";
import { RecordedMouseEvent } from "../../types/event-types";
import { ScrapedElement } from "../../types/types";
import { RecordedEventContext, UserInputRecorder } from "./input-recorder";

@injectable()
export class MouseRecorder implements UserInputRecorder<MouseEvent, RecordedMouseEvent> {

    readonly channels = ["mouseup", "mousedown", "mousemove"];
    readonly listen = "document";

    private lastTime = -Infinity;
    private lastHovered?: ScrapedElement;

    constructor(
        @inject(ITweakableConfigs) private uxTweaks: Pick<TweakableConfigs, "mouseMoveDebounce">
    ) {}

    handle(evt: MouseEvent, { time, target }: RecordedEventContext): Partial<RecordedMouseEvent> | null {
        if (this.canIgnore(evt, time, target)) {
            return null;
        } else {
            this.lastHovered = target;
            this.lastTime = time;
        }
        return {
            x: evt.pageX,
            y: evt.pageY,
            hovered: this.lastHovered ? this.lastHovered.id : undefined,
            ...this.extras(evt)
        };
    }

    private canIgnore(evt: MouseEvent, time: number, target?: ScrapedElement) {
        return evt.type === "mousemove"
             && target === this.lastHovered
             && time - this.lastTime < this.uxTweaks.mouseMoveDebounce;
    }

    private extras(evt: MouseEvent): Partial<RecordedMouseEvent> {
        switch (evt.type) {
            case "mousedown":
            case "mouseup":
                return { button: evt.button, buttonDown: evt.type === "mousedown" };
            default:
                return {  };
        }
    }
}
