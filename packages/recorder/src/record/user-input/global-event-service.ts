import { DocumentSymbol, Interface, WindowSymbol } from "@xsrt/common";
import { inject, injectable } from "inversify";

@injectable()
export class GlobalEventService {

    private listenerMap = new Map<number, ListenerInfo>();
    private syntheticEventListeners = new Map<string, Map<number, SyntheticEventListener>>();

    private currListener = 0;

    constructor(
        @inject(DocumentSymbol) private document: Interface<Document>,
        @inject(WindowSymbol) private window: Interface<Window>
    ) { }

    addEventListener(
        type: string, listener: SyntheticEventListener, options: { target: "synthetic"}
    ): number;
    addEventListener(
        type: string, listener: EventListener, options: { target: "window" | "document" } & Partial<AddListenerOptions>
    ): number;
    addEventListener(type: string, listener: EventListener | SyntheticEventListener, options: AddListenerOptions) {
        const capture = options.capture !== undefined ? options.capture : true;
        const target = options.target !== undefined ? options.target : "document";

        if (target === "window") {
            this.window.addEventListener(type, listener as EventListener, { capture });
        } else if (target === "document") {
            this.document.addEventListener(type, listener as EventListener, { capture });
        } else {
            const listeners = this.syntheticEventListeners.get(type)
                || new Map<number, SyntheticEventListener>();
            listeners.set(this.currListener, listener as SyntheticEventListener);
            this.syntheticEventListeners.set(type, listeners);
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
        if (!listener) {
            return;
        } else if (listener.target === "synthetic") {
            const listeners = this.syntheticEventListeners.get(listener.type);
            if (listeners) {
                listeners.delete(id);
            }
        } else {
            const target = listener.target === "window" ? this.window : this.document;
            target.removeEventListener(listener.type, listener.cb as EventListener, listener.options);
        }
        this.listenerMap.delete(id);
    }

    // TODO - Fire on next tick?
    fireSyntheticEvent(event: PatchedEvent<any>) {
        const listeners = this.syntheticEventListeners.get(event.type);
        if (listeners) {
            for (const cb of listeners.values()) {
                cb(event);
            }
        }
    }

}

export interface AddListenerOptions {
    capture?: boolean;
    target?: "document" | "window" | "synthetic";
}

interface ListenerInfo {
    type: string;
    options: AddEventListenerOptions;
    cb: EventListener | SyntheticEventListener<any>;
    target: "document" | "window" | "synthetic";
}

type SyntheticEventListener<T = any> = (e: PatchedEvent<T>) => void;

export interface PatchedEvent<T> {
    type: string;
    payload: T;
}
