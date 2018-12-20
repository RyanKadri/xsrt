import { ExtensionMessage, ExtensionMessageResponse } from "./site-channel-types";

let messageId = 0;
const activeMessages = new Map<number, (resp: () => void) => void>();

export function postToSite(message: any) {
    return new Promise<any>((resolve) => {
        const id = messageId ++;
        window.postMessage(new ExtensionMessage(id, message), location.origin)
        activeMessages.set(id, resolve);
    })
}

window.addEventListener('message', (message) => {
    if(message.source !== window || message.data.type !== ExtensionMessageResponse.type) return;
    const data: ExtensionMessageResponse = message.data;
    const resolver = activeMessages.get(data.id);
    if(resolver) {
        activeMessages.delete(data.id);
        resolver(data.payload);
    } else {
        console.error('Expected resolver for id: ' + data.id);
    }
});