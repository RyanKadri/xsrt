export function bootstrapScraper() {
    const scriptNode = document.createElement('script');
    scriptNode.src = 'https://record-service.jane/extension/bootstrap.bundle.js';
    return new Promise((resolve) => {
        document.body.appendChild(scriptNode);
        scriptNode.onload = () => {
            document.body.removeChild(scriptNode);
            resolve();
        }
    })
}