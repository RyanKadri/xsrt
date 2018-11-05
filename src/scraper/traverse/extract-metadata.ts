export function extractMetadata(document: Document, location: Location): ScrapeMetadata {
    const docType = (document.doctype && document.doctype.name) || 'html';
    const timestamp = Date.now();
    const { protocol, hostname, port, pathname } = location;
    return { docType, timestamp, url: { protocol, hostname, port, path: pathname } }
}

export interface ScrapeMetadata {
    docType: string;
    timestamp: number;
    url: LocationMetadata;
}

export interface LocationMetadata {
    protocol: string;
    hostname: string;
    port: string;
    path: string;
}