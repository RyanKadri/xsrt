/* istanbul ignore file */
import { apiDef, assetApiSymbol, assetEndpoint, chunkApiSymbol, chunkEndpointMetadata, constant, dependencyGroup, DIDefinition, DocumentSymbol, LocalStorageSymbol, LocationSymbol, recordingApiSymbol, recordingEndpoint, WindowSymbol, FetchSymbol, assertExists } from "../../common/src";
import { FocusRecorder } from "./record/user-input/focus-recorder";
import { HtmlInputRecorder } from "./record/user-input/input-event-recorder";
import { IUserInputRecorder } from "./record/user-input/input-recorder";
import { KeystrokeRecorder } from "./record/user-input/key-recorder";
import { MouseRecorder } from "./record/user-input/mouse-recorder";
import { ResizeRecorder } from "./record/user-input/resize-recorder";
import { ScrollRecorder } from "./record/user-input/scroll-recorder";
import { PopStateRecorder } from "./record/user-input/soft-navigate-recorder";
import { UnloadRecorder } from "./record/user-input/unload-recorder";

const baseUrl = assertExists(process.env.API_HOST, "API base URL");

export const diConfig: DIDefinition[] = [
    constant(LocationSymbol, location),
    constant(DocumentSymbol, document),
    constant(WindowSymbol, window),
    constant(FetchSymbol, window.fetch.bind(window)),
    constant(LocalStorageSymbol, localStorage),
    dependencyGroup(IUserInputRecorder, [
        MouseRecorder, ScrollRecorder, HtmlInputRecorder,
        FocusRecorder, ResizeRecorder, KeystrokeRecorder,
        UnloadRecorder, PopStateRecorder
    ]),
    apiDef(recordingApiSymbol, recordingEndpoint, { baseUrl }),
    apiDef(assetApiSymbol, assetEndpoint, { baseUrl }),
    apiDef(chunkApiSymbol, chunkEndpointMetadata, { baseUrl }),
];
