import { Container } from "inversify";
import { assetApiSymbol, assetEndpoint } from "../api/endpoints/proxy-endpoint-metadata";
import { recordingApiSymbol, recordingEndpoint } from "../api/endpoints/recordings-endpoint-metadata";
import { createApi } from "../common/server/create-api";
import { DocumentSymbol, LocationSymbol, WindowSymbol } from "./inversify.recorder.tokens";
import { FocusRecorder } from "./record/user-input/focus-recorder";
import { HtmlInputRecorder } from "./record/user-input/input-event-recorder";
import { IUserInputRecorder } from "./record/user-input/input-recorder";
import { KeystrokeRecorder } from "./record/user-input/key-recorder";
import { MouseRecorder } from "./record/user-input/mouse-recorder";
import { ResizeRecorder } from "./record/user-input/resize-recorder";
import { ScrollRecorder } from "./record/user-input/scroll-recorder";
import { UnloadRecorder } from "./record/user-input/unload-recorder";

const RecorderContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });
RecorderContainer.bind(IUserInputRecorder).to(MouseRecorder);
RecorderContainer.bind(IUserInputRecorder).to(ScrollRecorder);
RecorderContainer.bind(IUserInputRecorder).to(HtmlInputRecorder);
RecorderContainer.bind(IUserInputRecorder).to(FocusRecorder);
RecorderContainer.bind(IUserInputRecorder).to(ResizeRecorder);
RecorderContainer.bind(IUserInputRecorder).to(KeystrokeRecorder);
RecorderContainer.bind(IUserInputRecorder).to(UnloadRecorder);

RecorderContainer.bind(recordingApiSymbol).toConstantValue(createApi(recordingEndpoint));
RecorderContainer.bind(assetApiSymbol).toConstantValue(createApi(assetEndpoint));

RecorderContainer.bind(LocationSymbol).toConstantValue(location);
RecorderContainer.bind(DocumentSymbol).toConstantValue(document);
RecorderContainer.bind(WindowSymbol).toConstantValue(window);
export { RecorderContainer };
