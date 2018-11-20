import { RecordedMouseEvent } from "../../record/user-input/mouse-recorder";
import { UserInputPlaybackHelper } from "./user-input-manager";
import { DomManager } from "../dom-utils";
import { reverseFind } from "../../utils/utils";
import mouseFragment from './mouse-fragment.html'

export const hoverReplacementClass = '__hover';

export class MouseEventPlayer implements UserInputPlaybackHelper<RecordedMouseEvent> {

    private mouse?: HTMLElement;
    private hovered = new Set<HTMLElement>();
    private movingTo?: RecordedMouseEvent;

    constructor(
        private domManager: DomManager,
    ) { }

    simulateInput(updates: RecordedMouseEvent[], upcoming: RecordedMouseEvent[], time: number) {
        const lastMove = reverseFind(updates, (update => update.type === 'mousemove'));
        const lastButton = reverseFind(updates, (update => update.type === 'mouseup' || update.type === 'mousedown'));

        const mouse = this.fetchMouseIndicator();

        if(upcoming.length > 0 && this.movingTo !== upcoming[0]) {
            this.movingTo = upcoming[0];
            mouse.style.transform = `translate(${this.movingTo.x}px, ${this.movingTo.y}px) translateZ(0)`;
            mouse.style.transition = `transform ${this.movingTo.timestamp - time}ms ease-in-out`
        }
        if(lastMove) {
            this.adjustHover(lastMove);
        }
        if (lastButton && lastButton.type === 'mouseup') {
            mouse.classList.remove('clicked');
        } else if(lastButton && lastButton.type === 'mousedown') {
            mouse.classList.add('clicked');
        }
    }
    
    // TODO - This adds some jankiness if the hover class gets applied too high up. 
    // Can we be smart about limiting where it gets applied?
    private adjustHover(update: RecordedMouseEvent) {
        this.domManager.mutateElement(update.hovered, (node) => {
            const toRemove = new Set(this.hovered);
            let curr: HTMLElement | null = node;
            while(curr) {
                curr.classList.add(hoverReplacementClass);
                this.hovered.add(curr);
                toRemove.delete(curr);
                curr = curr.parentElement;
            }
            toRemove.forEach((oldHover) => oldHover.classList.remove(hoverReplacementClass))
        })
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