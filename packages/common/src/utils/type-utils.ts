export type StripArray<T> = T extends any[] ? T[0] : T;

export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Omit<T, K extends keyof any> = T extends any ? Pick<T, Exclude<keyof T, K>> : never;

export type DeepPartial<T> = {
    // tslint:disable-next-line:array-type
    [P in keyof T]?: T[P] extends Array<infer U>
      ? DeepPartial<U>[]
      : T[P] extends ReadonlyArray<infer U2>
        ? ReadonlyArray<DeepPartial<U2>>
        : DeepPartial<T[P]>
};

export interface MapTo<T> {
  [channel: string]: T;
}

export interface Group<T> {
  name: string;
  elements: T[];
}

export type Interface<T> = {
    [prop in keyof T]: T[prop];
};

export function assertExists<T>(ent: T | undefined | null, name = "entity"): T {
  if(ent === undefined || ent === null) {
    throw new Error(`Expected ${ name } to be defined but got ${ent}`)
  } else {
    return ent;
  }
}
