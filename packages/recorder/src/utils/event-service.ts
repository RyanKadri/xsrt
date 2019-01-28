import { injectable } from "inversify";
import { chunkMutationLimit } from "../record/dom-changes/mutation-tracker";

@injectable()
export class EventService {
    private handlers = new Map<string, ListenerCallback<any, any>[]>();

    dispatch<T extends Event<any>>(evt: T) {
        const listeners = this.handlers.get(evt.type);
        if (listeners) {
            listeners.forEach(listener => listener(evt));
        }
    }

    addEventListener<E extends Event<any>>(type: E["type"], callback: ListenerCallback<E["payload"], E["type"]>) {
        const prevListeners = this.handlers.get(type);
        this.handlers.set(type, (prevListeners || []).concat(callback));
    }
}

export type ScrapeEvent = MutationLimitExceeded;

export interface MutationLimitExceeded {
    type: typeof chunkMutationLimit;
    payload: number;
}

export interface Event<P, T = string> {
    type: T;
    payload: P;
}

type ListenerCallback<P, T> = (event: Event<P, T>) => void;
