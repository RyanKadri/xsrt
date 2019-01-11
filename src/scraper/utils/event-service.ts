import { injectable } from "inversify";
import { chunkMutationLimit } from "../record/dom-changes/mutation-tracker";

@injectable()
export class EventService {
    private handlers = new Map<symbol, ListenerCallback<any>[]>();

    dispatch(evt: ScrapeEvent) {
        const listeners = this.handlers.get(evt.type);
        if (listeners) {
            listeners.forEach(listener => listener(evt.payload));
        }
    }

    addEventListener<T extends ScrapeEvent>(type: T["type"], callback: ListenerCallback<T["payload"]>) {
        const prevListeners = this.handlers.get(type);
        this.handlers.set(type, (prevListeners || []).concat(callback));
    }
}

export type ScrapeEvent = MutationLimitExceeded;

export interface MutationLimitExceeded {
    type: typeof chunkMutationLimit;
    payload: number;
}

type ListenerCallback<T> = (payload: T) => void;
