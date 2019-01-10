import { injectable } from 'inversify';

@injectable()
export class TweakableConfigs {
    readonly regionIdleTime = 5000;
    readonly annotationEventDebounce = 500;
    readonly idealBuffer = 5000;
    readonly mouseMoveDebounce = 100;
}