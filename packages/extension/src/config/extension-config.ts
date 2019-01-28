import { ScraperConfig } from "@xsrt/common";

export interface ExtensionConfig extends ScraperConfig {
    shouldInject: boolean;
}
