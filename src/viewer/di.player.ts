/* istanbul ignore file */
import Axios from "axios";
import { chunkApiSymbol, chunkEndpointMetadata } from "../api/endpoints/chunk-endpoint-metadata";
import { recordingApiSymbol, recordingEndpoint } from "../api/endpoints/recordings-endpoint-metadata";
import { siteTargetApiSymbol, siteTargetEndpoint } from "../api/endpoints/target-endpoint-metadata";
import { apiDef, constant, constantWithDeps, dependencyGroup } from "../common/services/app-initializer";
import { LoggingService } from "../common/utils/log-service";
import { AxiosSymbol, LocalStorageSymbol } from "../scraper/di.tokens";
import { DomManager } from "../scraper/playback/dom-manager";
import { FocusPlayer } from "../scraper/playback/user-input/focus-player";
import { InputChangePlayer } from "../scraper/playback/user-input/input-change-player";
import { MouseInterpolationHelper } from "../scraper/playback/user-input/interpolation/mouse-interpolator";
import { IInterpolationHelper } from "../scraper/playback/user-input/interpolation/user-input-interpolator";
import { MouseEventPlayer } from "../scraper/playback/user-input/mouse-input-player";
import { ScrollEventPlayer } from "../scraper/playback/user-input/scroll-input-player";
import { IPlaybackHandler } from "../scraper/playback/user-input/user-input-manager";
import { ScraperConfigToken } from "../scraper/scraper-config";
import { IInputAnnotator } from "./services/annotation/annotation-service";
import { InputEventAnnotator } from "./services/annotation/input-annotator";
import { ResizeAnnotator } from "./services/annotation/resize-annotator";
import { UnloadAnnotator } from "./services/annotation/unload-annotator";

export const diConfig = [
    constant(ScraperConfigToken, { debugMode: false }),
    constantWithDeps(DomManager, [LoggingService], (logger: LoggingService) => new DomManager(logger)),
    constant(AxiosSymbol, Axios),
    constant(LocalStorageSymbol, localStorage),
    dependencyGroup(IInterpolationHelper, [ MouseInterpolationHelper ]),
    dependencyGroup(IPlaybackHandler, [
        MouseEventPlayer, ScrollEventPlayer, InputChangePlayer,
        FocusPlayer
    ]),
    dependencyGroup(IInputAnnotator, [
        ResizeAnnotator, InputEventAnnotator, UnloadAnnotator
    ]),
    apiDef(chunkApiSymbol, chunkEndpointMetadata),
    apiDef(siteTargetApiSymbol, siteTargetEndpoint),
    apiDef(recordingApiSymbol, recordingEndpoint)
];
