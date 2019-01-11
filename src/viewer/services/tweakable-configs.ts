export const ITweakableConfigs = Symbol("TweakableConfigs");
export class TweakableConfigs {
    readonly regionIdleTime: number = 5000;
    readonly annotationEventDebounce: number = 500;
    readonly idealBuffer: number = 5000;
    readonly mouseMoveDebounce: number = 100;
}