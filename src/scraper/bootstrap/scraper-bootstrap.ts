// import containerCSS from "!raw-loader!./container.css";
// import { formatPlayerTime } from "../../viewer/components/utils/format-utils";
// import { RecorderInitializer } from "../recorder-initializer";
// import { ScraperConfig } from "../scraper-config";
// import { DateManager } from "../utils/time-manager";
// import { hideNodeAttr } from "../utils/utils";
// import containerHTML from "./widget.html";

// const timeUpdateInterval = 500;
// const dateManager = new DateManager();
// (function bootstrapScraper() {

//     let timerId: number | undefined;
//     const containerId = "_recording-widget-container";
//     let recorder: RecorderInitializer;

//     cleanup();
//     const { startButton, debugCheckbox,
//          modeSelect, setupMode, recordingMode,
//          stopButton, elapsedTime } = buildWidget();
//     attachBehavior();

//     function attachBehavior() {
//         startButton.addEventListener("click", handleStart);
//         stopButton.addEventListener("click", handleStop);
//     }

//     async function handleStart() {
//         const debugMode = debugCheckbox.checked;
//         const output = modeSelect.value;

//         const config: ScraperConfig = {
//             debugMode,
//             backendUrl: "http://localhost:3001",
//             mutationsPerChunk: 1500,
//             inputsPerChunk: 1000
//         };

//         recorder = new RecorderInitializer();
//         if (output === "single-page" || output === "json") {
//             // TODO - Add this back
//             throw new Error("Page snapshots are temporarily being removed");
//             // const res = await scraper.takeDataSnapshot();
//             // if(output === 'single-page') {
//             //     outputStandaloneSnapshot(res);
//             // } else {
//             //     outputDataSnapshot(res, 'snapshot.json', config);
//             // }
//         } else if (output === "record") {
//             if (modeSelect.value === "record") {
//                 toggleDialogMode();
//                 timerId = startTimer();
//             }
//             recorder.initialize(config);
//         } else {
//             throw new Error("Unknown output format: " + output);
//         }
//     }

//     function handleStop() {
//         if (timerId !== undefined) {
//             recorder.stop();
//             clearInterval(timerId);
//             cleanup();
//         }
//     }

//     function startTimer() {
//         elapsedTime.textContent = formatPlayerTime(0);

//         const start = dateManager.now();
//         return window.setInterval(() => {
//             const now = dateManager.now();
//             elapsedTime.textContent = formatPlayerTime(now - start);
//         }, timeUpdateInterval);
//     }

//     function toggleDialogMode() {
//         setupMode.classList.add("hidden");
//         recordingMode.classList.remove("hidden");
//     }

//     function buildWidget() {
//         const container = document.createElement("div");
//         container.id = containerId;
//         container.appendChild(el("style", containerCSS));
//         container.setAttribute(hideNodeAttr, "true");
//         document.body.appendChild(container);

//         const shadow = container.attachShadow({ mode: "open" });
//         shadow.innerHTML = containerHTML;

//         return {
//             widgetContainer: container,
//             startButton: shadow.querySelector(".start-button") as HTMLButtonElement,
//             debugCheckbox: shadow.querySelector("#debug-checkbox") as HTMLInputElement,
//             modeSelect: shadow.querySelector(".export-type") as HTMLSelectElement,
//             setupMode: shadow.querySelector(".init-options") as HTMLElement,
//             recordingMode: shadow.querySelector(".recording-options") as HTMLElement,
//             stopButton: shadow.querySelector("#stop-button") as HTMLButtonElement,
//             elapsedTime: shadow.querySelector("#elapsed-time") as HTMLElement
//         };
//     }

//     function cleanup() {
//         const container = document.querySelector(`#${containerId}`);

//         if (container && container.parentElement) {
//             container.parentElement.removeChild(container);
//         }
//     }

//     function el(tagName: string, content: string): HTMLElement {
//         const thisEl = document.createElement(tagName);
//         thisEl.innerHTML = content;
//         return thisEl;
//     }
// })();
