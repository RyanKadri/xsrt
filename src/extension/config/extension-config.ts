import { ScraperConfig } from "../../scraper/config/scraper-config";

export interface ExtensionConfig extends ScraperConfig {
    shouldInject: boolean;
}
