import { DedupedData } from "../scraper/types/types";
import { RecordingMetadata } from "../scraper/traverse/extract-metadata";

export interface RecordingData extends DedupedData {
    site: number;
    metadata: RecordedMetadata;
    thumbnail?: string;
}

export interface RecordedMetadata extends RecordingMetadata {
    uaDetails: UADetails
}

export interface UADetails {
    browser: {
        name: string;
    };

    os: {
        name: string;
    }

    device: {
        vendor: string;
    }
}