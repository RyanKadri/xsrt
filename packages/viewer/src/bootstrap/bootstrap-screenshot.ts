import { Interface, LoggingService, ViewportSize } from "@xsrt/common";
import { DomManager } from "../playback/dom-manager";

/* TODO - Data moves around pretty inefficiently in here. I think this would be more push-based and server-side rendered
 * but there's a good chunk of potential work that needs to be done before this decoration pipeline is
 * "production-ready"
 */
(async () => {
    const urlMatch = location.search.match(/recording=([a-zA-Z0-9_\-]+)/);
    if (urlMatch) {
        const domManager = new DomManager(createLogger());
        domManager.initialize(document);

        const initChunk = await fetch(`/api/thumbnails/${urlMatch[1]}/data`)
            .then(resp => resp.json());
        await domManager.createInitialDocument(initChunk);
        const { viewportHeight, viewportWidth } = initChunk.snapshot.documentMetadata;
        (window as WindowWithViewport).targetViewport = {
            height: viewportHeight,
            width: viewportWidth
        };

    }

    function createLogger(): Interface<LoggingService> {
        // tslint:disable:no-console
        return {
            debug: logToConsole(console.log),
            error: logToConsole(console.error),
            info: logToConsole(console.log),
            warn: logToConsole(console.warn)
        };
        // tslint:enable:no-console

        function logToConsole(logger: (message: any) => void) {
            return ((m: string) => logger(m)) as any;
        }
    }
})();

type WindowWithViewport = Window & {
    targetViewport: ViewportSize
};
