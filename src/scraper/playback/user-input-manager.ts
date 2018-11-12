import { RecordedUserInput } from "../record/user-input/input-recorder";
import { RecordedMouseEvent } from "../record/user-input/mouse-recorder";

export class UserInputPlaybackManager {

    private mouseIndicator?: HTMLElement;

    constructor(
        private document: Document
    ) { }

    simulateUserInputs(inputs: RecordedUserInput[]) {
        inputs.forEach(input => {
            this.handleInput(input)
        });
    }
    
    private handleInput(input: RecordedUserInput) {
        switch(input.type) {
            case 'mouse-button':
            case 'mousemove':
                return this.handleMouse(input)
        }
    }
    
    private handleMouse(input: RecordedMouseEvent) {
        const mouseIndicator = this.fetchMouseIndicator();
        if(input.type === 'mousemove') {
            mouseIndicator.style.transform = `translate(${input.x}px, ${input.y}px)`
        } else {
            
        }
    }

    private fetchMouseIndicator() {
        return this.mouseIndicator ? this.mouseIndicator : this.createMouseIndicator();
    }

    private createMouseIndicator() {
        const icon = this.document.createElement('i');
        icon.style.position = 'absolute';
        icon.style.borderRadius = '4px';
        icon.style.width = '8px';
        icon.style.height = '8px';
        icon.style.backgroundColor = 'red';
        icon.style.top = '0px';
        icon.style.left = '0px';
        icon.style.zIndex = '99999';
        this.document.body.appendChild(icon);
        this.mouseIndicator = icon;
        return icon;
    }
}