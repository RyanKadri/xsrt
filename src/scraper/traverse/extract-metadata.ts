export function extractMetadata(document: Document, location: Location, startTime: number): RecordingMetadata {
    return { 
        docType: (document.doctype && document.doctype.name) || 'html',
        url: location.href,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        startTime
    }
}

export interface RecordingMetadata {
    startTime: number;
    docType: string;
    url: string;
    viewportHeight: number;
    viewportWidth: number;
    stopTime?: number;    
}