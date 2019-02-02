import { defaultConfig, ScraperConfig } from "@xsrt/common";
import { RecorderInitializer } from "./recorder-initializer";

export function startRecording(config: Partial<ScraperConfig>) {
    const initializer = new RecorderInitializer();
    initializer.initialize({ ...defaultConfig, ...config });
    return { stop: initializer.stop };
}
