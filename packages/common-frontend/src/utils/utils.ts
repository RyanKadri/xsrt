async function toBlobUrl(dataUrl: string) {
    try {
        const blob = await (await fetch(dataUrl)).blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        return dataUrl;
    }
}

export async function dataUrlToBlob(url: string) {
    return url.startsWith("data:")
                ? toBlobUrl(url)
                : url;
}
