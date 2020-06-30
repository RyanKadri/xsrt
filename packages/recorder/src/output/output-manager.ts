import { ScraperConfig, SnapshotChunk, Without } from "../../../common/src";
import { toJson } from "../utils/dom-utils";
import { triggerDownload } from "./output-utils";

// function serializeToViewer(data: Without<SnapshotChunk, "_id">) {
//     return (template as any).replace(
//         "<!-- EMBEDDED_DATA_PLACEHOLDER -->",
//         `<script id="scraped-data" type="application/json">${ toJson(data) }</script>`);
// }

// // TODO - Does this ever need to support GZIP? If so, what will that look like?
// export async function outputStandaloneSnapshot(data: Without<SnapshotChunk, "_id">) {
//     const serialized = serializeToViewer(data);
//     triggerDownload(serialized, "text/html; charset=UTF-8", "snapshot.html");
// }

export async function outputDataSnapshot(data: Without<SnapshotChunk, "_id">, filename: string, config: ScraperConfig) {
    const serialized = toJson(data);
    triggerDownload(serialized, "application/json; charset=UTF-8", filename, !config.debugMode);
}
