import * as pako from 'pako';

export function triggerDownload(content: string, type: string, fileName: string, shouldCompress = false) {
    let out = shouldCompress ? pako.deflate(JSON.stringify(content)) : content;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([out], { encoding: shouldCompress ? 'gzip' : 'UTF-8', type } as BlobPropertyBag));
    link.target = '_blank';
    link.download = fileName;
    link.click();
}