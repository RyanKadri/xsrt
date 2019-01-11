import { injectable } from "inversify";

export const ITweakableConfigs = Symbol("TweakableConfigs");
@injectable()
export class TweakableConfigs {
    readonly regionIdleTime: number = 5000;
    readonly annotationEventDebounce: number = 500;
    readonly idealBuffer: number = 5000;
    readonly mouseMoveDebounce: number = 100;
    readonly minSkippableRegion: number = 3000;
}
