import { defaultConfig, ScraperConfig } from "@xsrt/common";
import "reflect-metadata";
import { RecorderInitializer } from "./recorder-initializer";

export const XSRT = (() => {

    return {
        initialize,
        start,
    };

    function start(config: XSRTConfig) {
        const controller = initialize(config);
        controller.start();
        return controller;
    }

    function initialize(config: XSRTConfig): RecordingController {
        const initializer = new RecorderInitializer();
        initializer.initialize({ ...defaultConfig, ...config });
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
