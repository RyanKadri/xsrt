export function extractInitMetadata(document: Document, location: Location, startTime: number): InitMetadata {
    const docType = (document.doctype && document.doctype.name) || 'html';
    const { protocol, hostname, port, pathname } = location;
    const viewportHeight = window.innerHeight, viewportWidth = window.innerWidth;
    return { 
        docType,
        url: { protocol, hostname, port, path: pathname },
        viewportHeight,
        viewportWidth,
        startTime
    }
}

export interface InitMetadata {
    startTime: number;
    docType: string;
    url: LocationMetadata;
    viewportHeight: number;
    viewportWidth: number;
}

export interface EndMetadata {
    stopTime: number;    
}

export type RecordingMetadata = InitMetadata & EndMetadata;

export interface LocationMetadata {
    protocol: string;
    hostname: string;
    port: string;
    path: string;
}