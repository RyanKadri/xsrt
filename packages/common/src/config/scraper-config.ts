export const ScraperConfigToken = Symbol("ScraperConfig");
export interface ScraperConfig {
    debugMode: boolean;
    backendUrl: string;
    site: string;

    mutationsPerChunk: number;
    inputsPerChunk: number;
    clientFetchFallback: boolean;
}
