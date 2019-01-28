export async function toBlobUrl(dataUrl: string) {
    try {
        const blob = await (await fetch(dataUrl)).blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        return dataUrl;
    }
}
