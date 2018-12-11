export function fetchTab() {
    return new Promise<chrome.tabs.Tab>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
            resolve(tabs[0])
        })
    });
}