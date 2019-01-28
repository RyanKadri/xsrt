import { ScraperConfig } from "./scraper-config";

export const defaultConfig: ScraperConfig = {
    backendUrl: "http://localhost:3001",
    debugMode: true,
    mutationsPerChunk: 1500,
    inputsPerChunk: 1000
};
