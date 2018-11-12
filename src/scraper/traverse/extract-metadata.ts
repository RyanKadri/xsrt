export function extractInitMetadata(document: Document, location: Location): InitMetadata {
    const docType = (document.doctype && document.doctype.name) || 'html';
    const startTime = Date.now();
    const { protocol, hostname, port, pathname } = location;
    const viewportHeight = window.innerHeight, viewportWidth = window.innerWidth;
    return { docType, startTime, url: { protocol, hostname, port, path: pathname }, viewportHeight, viewportWidth }
}

export function extractEndMetadata(): EndMetadata {
    return {
        endTime: Date.now()
    };
}

export interface InitMetadata {
    docType: string;
    startTime: number;
    url: LocationMetadata;
    viewportHeight: number;
    viewportWidth: number;
}

export interface EndMetadata {
    endTime: number;    
}

export type RecordingMetadata = InitMetadata & EndMetadata;

export interface LocationMetadata {
    protocol: string;
    hostname: string;
    port: string;
    path: string;
}