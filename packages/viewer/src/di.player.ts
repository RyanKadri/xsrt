/* istanbul ignore file */
import { apiDef, chunkApiSymbol, chunkEndpointMetadata, constant, constantWithDeps, dependencyGroup, DIDefinition, GotSymbol, LocalStorageSymbol, LoggingService, recordingApiSymbol, recordingEndpoint, ScraperConfigToken, siteTargetApiSymbol, siteTargetEndpoint } from "@xsrt/common";
import got from "got";
import { DomManager } from "./playback/dom-manager";
import { FocusPlayer } from "./playback/user-input/focus-player";
import { InputChangePlayer } from "./playback/user-input/input-change-player";
import { MouseInterpolationHelper } from "./playback/user-input/interpolation/mouse-interpolator";
import { IInterpolationHelper } from "./playback/user-input/interpolation/user-input-interpolator";
import { MouseEventPlayer } from "./playback/user-input/mouse-input-player";
import { ScrollEventPlayer } from "./playback/user-input/scroll-input-player";
import { IPlaybackHandler } from "./playback/user-input/user-input-manager";
import { IInputAnnotator } from "./services/annotation/annotation-service";
import { InputEventAnnotator } from "./services/annotation/input-annotator";
import { ResizeAnnotator } from "./services/annotation/resize-annotator";
import { UnloadAnnotator } from "./services/annotation/unload-annotator";

export const diConfig: DIDefinition[] = [
    constant(ScraperConfigToken, { debugMode: false, backendUrl: process.env.API_SERVER }),
    constantWithDeps(DomManager, [LoggingService], (logger: LoggingService) => new DomManager(logger)),
    constant(GotSymbol, got),
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
