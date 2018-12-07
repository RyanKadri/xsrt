export function extractMetadata(document: Document, location: Location, startTime: number): RecordingMetadata {
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
        userAgent: navigator.userAgent,
        startTime
    }
}

export interface RecordingMetadata {
    startTime: number;
    docType: string;
    url: LocationMetadata;
    viewportHeight: number;
    viewportWidth: number;
    stopTime?: number;
    userAgent: string;
}

export interface LocationMetadata {
    protocol: string;
    hostname: string;
    port: string;
    path: string;
}