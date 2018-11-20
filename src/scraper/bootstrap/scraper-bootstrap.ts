import containerHTML from './widget.html';
import containerCSS from '!raw-loader!./container.css';
import { formatDuration } from "../../viewer/components/utils/format-utils";
import { outputStandaloneSnapshot, outputDataSnapshot } from "../output/output-manager";
import { AppContainer } from '../inversify.conf';
import { Scraper } from '../scrape';

(function bootstrapScraper() {

    const scraper = AppContainer.get(Scraper);
    let timerId: number | undefined;
    const containerId = '_recording-widget-container';

    cleanup();
    const { startButton, debugCheckbox,
         modeSelect, setupMode, recordingMode,
         stopButton, elapsedTime } = buildWidget();
    attachBehavior();

    function attachBehavior() {
        startButton.addEventListener('click', handleStart);
        stopButton.addEventListener('click', handleStop);
    }

    async function handleStart() {
        const debugMode = debugCheckbox.checked;
        const output = modeSelect.value;

        const config = {
            debugMode
        };

        if(output === 'single-page' || output === 'json') {
            const res = await scraper.takeDataSnapshot();
            if(output === 'single-page') {
                outputStandaloneSnapshot(res);
            } else {
                outputDataSnapshot(res, 'snapshot.json', config);
            }
        } else if(output === 'record') {
            if(modeSelect.value === 'record') {
                toggleMode();
                timerId = startTimer();
            }
            scraper.record(config).then(res => {
                outputDataSnapshot(res, 'recording.json', config);
            })
        } else {
            throw new Error('Unknown output format: ' + output)
        }
    }

    function handleStop() {
        if(timerId !== undefined) {
            scraper.stopRecording()
            clearInterval(timerId);
            cleanup();
        }
    }

    function startTimer() {
        elapsedTime.textContent = formatDuration(0);

        const start = Date.now();
        return window.setInterval(() => {
            const now = Date.now();
            elapsedTime.textContent = formatDuration(now - start);
        }, 500)
    }

    function toggleMode() {
        setupMode.classList.add('hidden');
        recordingMode.classList.remove('hidden');
    }
    
    function buildWidget() {
        const container = document.createElement('div');
        container.id = containerId;
        container.appendChild(el('style', containerCSS));
        container.setAttribute('screen-scrape-ignore', 'true'); //TODO - Ignore this too
        document.body.appendChild(container);
        
        const shadow = container.attachShadow({ mode: 'open' });
        shadow.innerHTML = containerHTML;

        return {
            widgetContainer: container,
            startButton: shadow.querySelector('.start-button') as HTMLButtonElement,
            debugCheckbox: shadow.querySelector('#debug-checkbox') as HTMLInputElement,
            modeSelect: shadow.querySelector('.export-type') as HTMLSelectElement,
            setupMode: shadow.querySelector('.init-options') as HTMLElement,
            recordingMode: shadow.querySelector('.recording-options') as HTMLElement,
            stopButton: shadow.querySelector('#stop-button') as HTMLButtonElement,
            elapsedTime: shadow.querySelector('#elapsed-time') as HTMLElement
        };
    }

    function cleanup() {
        const container = document.querySelector(`#${containerId}`);

        if(container && container.parentElement) {
            container.parentElement.removeChild(container);
        }
    }

    function el(tagName, content): HTMLElement {
        const thisEl = document.createElement(tagName);
        thisEl.innerHTML = content;
        return thisEl;
    }
})()