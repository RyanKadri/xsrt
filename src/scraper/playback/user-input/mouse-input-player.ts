import { RecordedMouseEvent } from "../../record/user-input/mouse-recorder";
import { UserInputPlaybackHelper } from "./user-input-manager";

const mouseBaseColor = 'green';
const mouseLeftClickColor = 'red';

export class MouseEventPlayer implements UserInputPlaybackHelper<RecordedMouseEvent> {

    private mouseIndicator?: { mouse: HTMLElement, mover: HTMLElement };

    constructor(
        private document: Document
    ) { }

    simulateInput(updates: RecordedMouseEvent[], preview: RecordedMouseEvent) {
        const lastUpdate = updates[updates.length - 1];
        const { mouse, mover } = this.fetchMouseIndicator();

        mover.style.transform = `translate(${lastUpdate.x}px, ${lastUpdate.y}px)`
        if (lastUpdate.type === 'mouseup') {
            mouse.style.backgroundColor = mouseBaseColor;
            mouse.style.transform = '';
        } else if(lastUpdate.type === 'mousedown') {
            mouse.style.backgroundColor = mouseLeftClickColor;
            mouse.style.transform = 'scale(2)';
        }
    }
    
    private fetchMouseIndicator() {
        return this.mouseIndicator ? this.mouseIndicator : this.createMouseIndicator();
    }

    private createMouseIndicator() {
        const mover = this.document.createElement('div');
        const mouse = this.document.createElement('i');
        mouse.style.borderRadius = '4px';
        mouse.style.backgroundColor = mouseBaseColor;
        mouse.style.display = 'block';
        mouse.style.width = '8px';
        mouse.style.height = '8px';
        mouse.style.border = 'solid 1px white'

        mover.style.position = 'absolute';
        mover.style.width = '8px';
        mover.style.height = '8px';
        mover.style.top = '0px';
        mover.style.left = '0px';
        mover.style.zIndex = '99999';
        this.document.body.appendChild(mover);
        mover.appendChild(mouse);
        this.mouseIndicator = { mouse, mover };
        return this.mouseIndicator;
    }
}