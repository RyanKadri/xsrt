export function escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(/\u00A0/, '&nbsp;')
         .replace(/\u200E/, '&lrm;')
}

export function toDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
    })
}

export function triggerDownload(content: any, type: string, fileName: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { encoding: 'UTF-8', type,  } as BlobPropertyBag));
    link.target = '_blank';
    link.download = fileName;
    link.click();
}