import { injectable } from "inversify";

/* istanbul ignore next */
@injectable()
export class TweakableConfigs {
  readonly regionIdleTime: number = 5000;
  readonly annotationEventDebounce: number = 500;
  readonly idealBuffer: number = 5000;
  readonly minSkippableRegion: number = 3000;
}
