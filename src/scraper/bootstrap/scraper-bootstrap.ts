import { scraper } from "../scrape";
import containerHTML from './widget.html';
import widgetCSS from '!raw-loader!./widget.css';
import containerCSS from '!raw-loader!./container.css';
import { formatDuration } from "../../viewer/components/utils/format-utils";

const containerId = 'recording-widget-container';

(function bootstrapScraper() {
    cleanup();
    const shadow = buildWidget()
    attachBehavior(shadow);

    function attachBehavior(shadow: ShadowRoot) {
        shadow.querySelector('.start-button')!.addEventListener('click', () => {
            const debugMode = (shadow.querySelector('#debug-checkbox')! as HTMLInputElement).checked;
            const select = shadow.querySelector('.export-type') as HTMLSelectElement;
            scraper.scrape({
                output: select.value as any,
                debugMode
            });
            if(select.value === 'record') {
                toggleMode();
                const interval = startTimer();

                const stopButton = shadow.querySelector('#stop-button')!;
                stopButton.addEventListener('click', () => {
                    scraper.stopRecording()
                    clearInterval(interval);
                    cleanup();
                })
            }
        });
    }

    function startTimer() {
        const elapsedTime = shadow.querySelector('#elapsed-time')!;
        elapsedTime.textContent = formatDuration(0);

        const start = Date.now();
        return setInterval(() => {
            const now = Date.now();
            elapsedTime.textContent = formatDuration(now - start);
        }, 500)
    }

    function toggleMode() {
        shadow.querySelector('.init-options')!.classList.add('hidden');
        shadow.querySelector('.recording-options')!.classList.remove('hidden');
    }
    
    function buildWidget() {
        const container = document.createElement('div');
        container.id = containerId;
        container.appendChild(el('style', containerCSS));
        container.setAttribute('screen-scrape-ignore', 'true'); //TODO - Ignore this too
        document.body.appendChild(container);
        
        const shadow = container!.attachShadow({ mode: 'open' });
        shadow.innerHTML = containerHTML;
        shadow.appendChild(el('style', widgetCSS));

        return shadow;
    }

    function cleanup() {
        const existingContainer = document.querySelector(`#${containerId}`)
        if(existingContainer) {
            existingContainer.parentElement!.removeChild(existingContainer);
        }
    }

    function el(tagName, content): HTMLElement {
        const thisEl = document.createElement(tagName);
        thisEl.innerHTML = content;
        return thisEl;
    }
})()