import { defaultConfig, ScraperConfig } from "@xsrt/common";
import "reflect-metadata";
import { RecorderInitializer } from "./recorder-initializer";

export const XSRT = (() => {

    return {
        initialize,
        start,
    };

    async function start(config: XSRTConfig) {
        const controller = await initialize(config);
        controller.start();
        return controller;
    }

    async function initialize(config: XSRTConfig): Promise<RecordingController> {
        const initializer = new RecorderInitializer();
        await initializer.initialize({ ...defaultConfig, ...config });
        return {
            start() {
                initializer.start();
            },
            stop() {
                return initializer.stop();
            },
            isRecording() {
                return initializer.isRecording();
            }
        };
    }
})();

export type XSRTConfig = Pick<ScraperConfig, "site"> & Partial<ScraperConfig>;

export interface RecordingController {
    start(): void;
    stop(): Promise<void>;
    isRecording(): boolean;
}
