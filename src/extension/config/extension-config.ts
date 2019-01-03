import { ScraperConfig } from "../../scraper/scraper-config";

export interface ExtensionConfig extends ScraperConfig {
    shouldInject: boolean;
}