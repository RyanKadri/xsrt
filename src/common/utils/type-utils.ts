export type StripArray<T> = T extends Array<any> ? T[0] : T;

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Omit<T, K extends keyof any> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;