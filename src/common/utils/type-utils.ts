export type StripArray<T> = T extends Array<any> ? T[0] : T;

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Omit<T, K extends keyof any> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U2>
        ? ReadonlyArray<DeepPartial<U2>>
        : DeepPartial<T[P]>
};

export type MapTo<T> = {
  [channel: string]: T
}

export interface Group<T> {
  name: string;
  elements: T[];
}