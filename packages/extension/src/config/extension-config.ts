import { ScraperConfig } from "../../../common/src";

export interface ExtensionConfig extends ScraperConfig {
    shouldInject: boolean;
}
