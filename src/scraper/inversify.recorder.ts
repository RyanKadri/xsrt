import Axios from "axios";
import { Container } from "inversify";
import { assetApiSymbol, assetEndpoint } from "../api/endpoints/proxy-endpoint-metadata";
import { recordingApiSymbol, recordingEndpoint } from "../api/endpoints/recordings-endpoint-metadata";
import { ApiCreationService } from "../common/server/create-api";
import { AxiosSymbol, DocumentSymbol, LocalStorageSymbol, LocationSymbol, WindowSymbol } from "./inversify.recorder.tokens";
import { FocusRecorder } from "./record/user-input/focus-recorder";
import { HtmlInputRecorder } from "./record/user-input/input-event-recorder";
import { IUserInputRecorder } from "./record/user-input/input-recorder";
import { KeystrokeRecorder } from "./record/user-input/key-recorder";
import { MouseRecorder } from "./record/user-input/mouse-recorder";
import { ResizeRecorder } from "./record/user-input/resize-recorder";
import { ScrollRecorder } from "./record/user-input/scroll-recorder";
import { UnloadRecorder } from "./record/user-input/unload-recorder";

const RecorderContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });
[
    { symbol: LocationSymbol, val: location },
    { symbol: DocumentSymbol, val: document },
    { symbol: WindowSymbol, val: window },
    { symbol: LocalStorageSymbol, val: localStorage },
    { symbol: AxiosSymbol, val: Axios }
].forEach(({ symbol, val }) => RecorderContainer.bind(symbol).toConstantValue(val));

[
    MouseRecorder, ScrollRecorder, HtmlInputRecorder,
    FocusRecorder, ResizeRecorder, KeystrokeRecorder,
    UnloadRecorder
].forEach(recorder => RecorderContainer.bind(IUserInputRecorder).to(recorder));

const apiCreator = RecorderContainer.get(ApiCreationService);

RecorderContainer.bind(recordingApiSymbol).toConstantValue(apiCreator.createApi(recordingEndpoint));
RecorderContainer.bind(assetApiSymbol).toConstantValue(apiCreator.createApi(assetEndpoint));

export { RecorderContainer };
