import { injectable } from 'inversify';
import { MapTo } from '../../../common/utils/type-utils';

export interface IState<T> {
    watch(criteria: (item: T) => boolean, cb: ListenerCallback<T>): number;
    unwatch(watchId: number): void;
    upsert(items: T[]): void;
    delete(items: T[]): void;
}

@injectable()
export abstract class SimpleState<T extends { [id in C]: string }, C extends keyof T> implements IState<T> {
    abstract readonly id: C;

    private data: MapTo<T> = {};
    private listeners: Listener<T>[] = [];
    
    watch(criteria: ListenerCriteria<T>, cb: ListenerCallback<T>) {
        return this.listeners.push({ criteria, callback: cb }) - 1;
    }

    unwatch() {
        this.listeners
    }

    upsert(items: T[]) {
        items.forEach(item => {
            const id = item[this.id]
            this.data[id] = item;
        });
        this.updateListeners()
    }

    delete(items: T[]) {
        const data: MapTo<T> = {};
        const badIds = new Set<string>(items.map(item => item[this.id]));
        Object.values(this.data)
            .forEach(item => {
                const itemId = item[this.id];
                if(!badIds.has(itemId)) {
                    data[itemId] = item;
                }
        })
        this.data = data;
        this.updateListeners();
    }

    private updateListeners() {
        const items = Object.values(this.data);
        this.listeners.forEach(listener => {
            listener.callback(items.filter(item => listener.criteria(item)))
        })
    }
}

interface Listener<T> {
    criteria: ListenerCriteria<T>;
    callback: ListenerCallback<T>;
}

type ListenerCriteria<T> = (item: T) => boolean;
type ListenerCallback<T> = (items: T[]) => void;