import { Without } from "../utils/type-utils";
import { ScraperConfig } from "./scraper-config";

export const defaultConfig: Without<ScraperConfig, "site"> = {
    backendUrl: "http://localhost:3001",
    debugMode: true,
    mutationsPerChunk: 1500,
    inputsPerChunk: 1000,
    clientFetchFallback: false
};
