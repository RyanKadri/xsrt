import * as pako from "pako";

export function triggerDownload(content: string, type: string, fileName: string, shouldCompress = false) {
    const out = shouldCompress ? compress(content) : content;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([out], {
        type,
        encoding: shouldCompress ? "deflate" : "UTF-8"
    } as BlobPropertyBag));

    link.target = "_blank";
    link.download = fileName;
    link.click();
}

export function compress(data: string) {
    return pako.deflate(data);
}
