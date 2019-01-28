import { defaultConfig } from "./config/default-config";
import { ScraperConfig } from "./config/scraper-config";
import { RecorderInitializer } from "./recorder-initializer";

export function initializeRecording(config: Partial<ScraperConfig>) {
    const initializer = new RecorderInitializer();
    initializer.initialize({ ...defaultConfig, ...config });
}
