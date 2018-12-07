export function bootstrapScraper() {
    const scriptNode = document.createElement('script');
    const url = chrome.extension.getURL('./bootstrap.bundle.js')
    scriptNode.src = url;
    return new Promise((resolve) => {
        document.body.appendChild(scriptNode);
        scriptNode.onload = () => {
            document.body.removeChild(scriptNode);
            resolve();
        }
    })
}