import { injectable } from "inversify";

@injectable()
export class LocalStorageService {

    saveItem(key: string, val: string | number | boolean | object) {
        if (typeof val === "object") {
            // tslint:disable-next-line:ban
            localStorage.setItem(key, JSON.stringify(val));
        } else {
            // tslint:disable-next-line:ban
            localStorage.setItem(key, `${val}`);
        }
    }

    fetchItem(key: string, options?: { type: "string" }): string;
    fetchItem(key: string, options?: { type: "number" }): number;
    fetchItem(key: string, options?: { type: "boolean" }): boolean;
    fetchItem(key: string, options?: { type: "object" }): any;
    fetchItem(key: string, options: FetchOptions = { type: "string" }): any {
        // tslint:disable-next-line:ban
        const val = localStorage.getItem(key);
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
        // tslint:disable-next-line:ban
        localStorage.removeItem(key);
    }
}

interface FetchOptions {
    type: "string" | "number" | "object" | "boolean";
}

interface FetchOptionsWithDefault {
    writeBack: boolean;
}
