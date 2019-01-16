import { inject, injectable } from "inversify";
import { LocalStorageSymbol } from "../../scraper/inversify.recorder.tokens";
import { Interface } from "./type-utils";

@injectable()
export class LocalStorageService {

    constructor(
        @inject(LocalStorageSymbol) private localStorage: Interface<Storage>
    ) { }

    saveItem(key: string, val: string | number | boolean | object) {
        if (typeof val === "object") {
            this.localStorage.setItem(key, JSON.stringify(val));
        } else {
            this.localStorage.setItem(key, `${val}`);
        }
    }

    fetchItem(key: string, options?: { type: "string" }): string | undefined;
    fetchItem(key: string, options?: { type: "number" }): number | undefined;
    fetchItem(key: string, options?: { type: "boolean" }): boolean | undefined;
    fetchItem(key: string, options?: { type: "object" }): any;
    fetchItem(key: string, options: FetchOptions = { type: "string" }): any {
        const val = this.localStorage.getItem(key);
        if (val === null) {
            return undefined;
        } else if (options.type === "object") {
            return JSON.parse(val);
        } else if (options.type === "number") {
            return parseInt(val, 10);
        } else if (options.type === "boolean") {
            return val.toLocaleLowerCase() === "true" ? true : false;
        } else {
            return val;
        }
    }

    fetchWithDefault<T extends object>(key: string, defaultVal: T, options?: { writeBack: boolean }): T;
    fetchWithDefault<T extends object | string | number | boolean>(
        key: string,
        defaultVal: T,
        options: FetchOptionsWithDefault = { writeBack: false }
    ): T {
        const val = this.fetchItem(key, { type: typeof defaultVal } as any);
        if (val !== undefined) {
            return val as T;
        } else {
            if (options.writeBack) {
                this.saveItem(key, defaultVal);
            }
            return defaultVal;
        }
    }

    removeItem(key: string) {
        this.localStorage.removeItem(key);
    }
}

interface FetchOptions {
    type: "string" | "number" | "object" | "boolean";
}

interface FetchOptionsWithDefault {
    writeBack: boolean;
}
