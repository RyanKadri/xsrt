export const ScraperConfigToken = Symbol("ScraperConfig");
export interface ScraperConfig {
    debugMode: boolean;
    backendUrl: string;

    mutationsPerChunk: number;
    inputsPerChunk: number;
}