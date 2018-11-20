export function extractMetadata(document: Document, location: Location, startTime: number): SnapshotMetadata {
    return { 
        docType: (document.doctype && document.doctype.name) || 'html',
        url: { 
            protocol: location.protocol,
            hostname: location.hostname,
            port: location.port,
            path: location.pathname
        },
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        startTime
    }
}

export interface SnapshotMetadata {
    startTime: number;
    docType: string;
    url: LocationMetadata;
    viewportHeight: number;
    viewportWidth: number;
    stopTime?: number;    
}

export interface LocationMetadata {
    protocol: string;
    hostname: string;
    port: string;
    path: string;
}