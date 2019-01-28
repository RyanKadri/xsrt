import { injectable } from "inversify";

@injectable()
export class RecorderTweaks {
    readonly mouseMoveDebounce: number = 100;
}
