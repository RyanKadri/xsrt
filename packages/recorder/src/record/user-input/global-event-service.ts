import { DocumentSymbol, Interface, WindowSymbol } from "@xsrt/common";
import { inject, injectable } from "inversify";

@injectable()
export class GlobalEventService {

    private listenerMap = new Map<number, ListenerInfo>();
    private currListener = 0;

    constructor(
        @inject(DocumentSymbol) private document: Interface<Document>,
        @inject(WindowSymbol) private window: Interface<Window>
    ) { }

    addEventListener(type: string, listener: EventListener, options: AddListenerOptions) {
        const capture = options.capture !== undefined ? options.capture : true;
        const target = options.target !== undefined ? options.target : "document";

        if (target === "window") {
            this.window.addEventListener(type, listener, { capture });
        } else {
            this.document.addEventListener(type, listener, { capture });
        }

        this.listenerMap.set(this.currListener, {
            type,
            target,
            cb: listener,
            options: { capture }
        });
        return this.currListener ++;
    }

    removeEventListener(id: number) {
        const listener = this.listenerMap.get(id);
        if (listener) {
            const target = listener.target === "window" ? this.window : this.document;
            target.removeEventListener(listener.type, listener.cb, listener.options);
        }
    }

}

export interface AddListenerOptions {
    capture?: boolean;
    target?: "document" | "window";
}

interface ListenerInfo {
    type: string;
    options: AddEventListenerOptions;
    cb: EventListener;
    target: "document" | "window";
}
