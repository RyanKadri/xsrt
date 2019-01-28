/* istanbul ignore file */
import { apiDef, assetApiSymbol, assetEndpoint, AxiosSymbol, chunkApiSymbol, chunkEndpointMetadata, constant, dependencyGroup, DIInitializer, DocumentSymbol, LocalStorageSymbol, LocationSymbol, recordingApiSymbol, recordingEndpoint, WindowSymbol } from "@xsrt/common";
import Axios from "axios";
import { FocusRecorder } from "./record/user-input/focus-recorder";
import { HtmlInputRecorder } from "./record/user-input/input-event-recorder";
import { IUserInputRecorder } from "./record/user-input/input-recorder";
import { KeystrokeRecorder } from "./record/user-input/key-recorder";
import { MouseRecorder } from "./record/user-input/mouse-recorder";
import { ResizeRecorder } from "./record/user-input/resize-recorder";
import { ScrollRecorder } from "./record/user-input/scroll-recorder";
import { UnloadRecorder } from "./record/user-input/unload-recorder";

export const diConfig: DIInitializer[] = [
    constant(LocationSymbol, location),
    constant(DocumentSymbol, document),
    constant(WindowSymbol, window),
    constant(LocalStorageSymbol, localStorage),
    constant(AxiosSymbol, Axios),
    dependencyGroup(IUserInputRecorder, [
        MouseRecorder, ScrollRecorder, HtmlInputRecorder,
        FocusRecorder, ResizeRecorder, KeystrokeRecorder,
        UnloadRecorder
    ]),
    apiDef(recordingApiSymbol, recordingEndpoint),
    apiDef(assetApiSymbol, assetEndpoint),
    apiDef(chunkApiSymbol, chunkEndpointMetadata),
];
