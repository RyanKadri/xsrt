import { Container } from "inversify";
import { DomManager } from "../scraper/playback/dom-manager";
import { FocusPlayer } from "../scraper/playback/user-input/focus-player";
import { InputChangePlayer } from "../scraper/playback/user-input/input-change-player";
import { MouseInterpolationHelper } from "../scraper/playback/user-input/interpolation/mouse-interpolator";
import { IInterpolationHelper } from "../scraper/playback/user-input/interpolation/user-input-interpolator";
import { MouseEventPlayer } from "../scraper/playback/user-input/mouse-input-player";
import { ScrollEventPlayer } from "../scraper/playback/user-input/scroll-input-player";
import { IPlaybackHandler } from "../scraper/playback/user-input/user-input-manager";
import { IInputAnnotator } from "./services/annotation/annotation-service";
import { InputEventAnnotator } from "./services/annotation/input-annotator";
import { ResizeAnnotator } from "./services/annotation/resize-annotator";
import { UnloadAnnotator } from "./services/annotation/unload-annotator";
import { ITweakableConfigs, TweakableConfigs } from "./services/tweakable-configs";

const PlayerContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

// I do this because I want to access the DomManager from non-container parts of the app.
PlayerContainer.bind(DomManager).toConstantValue(new DomManager());

PlayerContainer.bind(IPlaybackHandler).to(MouseEventPlayer);
PlayerContainer.bind(IPlaybackHandler).to(ScrollEventPlayer);
PlayerContainer.bind(IPlaybackHandler).to(InputChangePlayer);
PlayerContainer.bind(IPlaybackHandler).to(FocusPlayer);

PlayerContainer.bind(IInterpolationHelper).to(MouseInterpolationHelper);

PlayerContainer.bind(IInputAnnotator).to(ResizeAnnotator);
PlayerContainer.bind(IInputAnnotator).to(InputEventAnnotator);
PlayerContainer.bind(IInputAnnotator).to(UnloadAnnotator);
PlayerContainer.bind(ITweakableConfigs).to(TweakableConfigs);

export { PlayerContainer };
