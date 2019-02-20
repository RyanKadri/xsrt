import "reflect-metadata";
import { defaultConfig, ScraperConfig } from "@xsrt/common";
import { RecorderInitializer } from "./recorder-initializer";

export function startRecording(config: Pick<ScraperConfig, "site"> & Partial<ScraperConfig>): RecordingController {
    const initializer = new RecorderInitializer();
    initializer.initialize({ ...defaultConfig, ...config });
    return { stop: initializer.stop };
}

export type RecordingController = Pick<RecorderInitializer, "stop">;
