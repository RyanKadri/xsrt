import { RecordedMouseEvent } from "../../record/user-input/mouse-recorder";
import { UserInputPlaybackHelper } from "./user-input-manager";
import { DomManager } from "../dom-utils";
import { reverseFind } from "../../utils/utils";
import mouseFragment from './mouse-fragment.html'
import { injectable } from "inversify";
import { PseudoClassManager } from "./pseudo-class-manager";

@injectable()
export class MouseEventPlayer implements UserInputPlaybackHelper<RecordedMouseEvent> {

    channels = ['mousemove', 'mouseup', 'mousedown'];
    private mouse?: HTMLElement;

    constructor(
        private domManager: DomManager,
        private pseudoClassManager: PseudoClassManager,
    ) { }

    simulateInput(updates: RecordedMouseEvent[]) {
        const lastMove = reverseFind(updates, (update => update.type === 'mousemove'));
        const lastButton = reverseFind(updates, (update => update.type === 'mouseup' || update.type === 'mousedown'));

        const mouse = this.fetchMouseIndicator();

        if(lastMove) {
            mouse.style.transform = `translate(${lastMove.x}px, ${lastMove.y}px) translateZ(0)`;
            if(lastMove.hovered) {
                this.pseudoClassManager.hoverTarget(lastMove.hovered);
            }
        }
        if (lastButton && lastButton.type === 'mouseup') {
            mouse.classList.remove('clicked');
            this.pseudoClassManager.removeActive()
        } else if(lastButton && lastButton.type === 'mousedown') {
            mouse.classList.add('clicked');
            if(lastButton.hovered) {
                this.pseudoClassManager.markActive(lastButton.hovered)
            }
        }
    }
    
    private fetchMouseIndicator() {
        return this.mouse ? this.mouse : this.createMouseIndicator();
    }

    private createMouseIndicator() {
        const { host } = this.domManager.insertExternalFragment(mouseFragment);
        this.mouse = host;
        return this.mouse;
    }
}