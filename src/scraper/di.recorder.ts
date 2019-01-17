/* istanbul ignore file */
import Axios from "axios";
import { assetApiSymbol, assetEndpoint } from "../api/endpoints/proxy-endpoint-metadata";
import { recordingApiSymbol, recordingEndpoint } from "../api/endpoints/recordings-endpoint-metadata";
import { apiDef, constant, dependencyGroup } from "../common/services/app-initializer";
import { AxiosSymbol, DocumentSymbol, LocalStorageSymbol, LocationSymbol, WindowSymbol } from "./di.tokens";
import { FocusRecorder } from "./record/user-input/focus-recorder";
import { HtmlInputRecorder } from "./record/user-input/input-event-recorder";
import { IUserInputRecorder } from "./record/user-input/input-recorder";
import { KeystrokeRecorder } from "./record/user-input/key-recorder";
import { MouseRecorder } from "./record/user-input/mouse-recorder";
import { ResizeRecorder } from "./record/user-input/resize-recorder";
import { ScrollRecorder } from "./record/user-input/scroll-recorder";
import { UnloadRecorder } from "./record/user-input/unload-recorder";

export const diConfig = [
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
    apiDef(assetApiSymbol, assetEndpoint)
];
