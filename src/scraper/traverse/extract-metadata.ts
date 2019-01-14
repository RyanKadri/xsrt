import { DocumentMetadata } from "../types/types";

export const LocationSymbol = Symbol("Location");
export function extractMetadata(document: Document, location: Location): DocumentMetadata {
    return {
        docType: (document.doctype && document.doctype.name) || "html",
        url: extractUrlMetadata(location),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
    };
}

export function extractUrlMetadata(location: Location) {
    return {
        protocol: location.protocol,
        hostname: location.hostname,
        port: location.port,
        path: location.pathname
    };
}
