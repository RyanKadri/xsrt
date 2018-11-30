import { Container } from "inversify";
import { IPlaybackHandler } from '../scraper/playback/user-input/user-input-manager';
import { MouseEventPlayer } from '../scraper/playback/user-input/mouse-input-player';
import { ScrollEventPlayer } from '../scraper/playback/user-input/scroll-input-player';
import { InputChangePlayer } from '../scraper/playback/user-input/input-change-player';
import { FocusPlayer } from '../scraper/playback/user-input/focus-player';
import { IInterpolationHelper } from '../scraper/playback/user-input/interpolation/user-input-interpolator';
import { MouseInterpolationHelper } from '../scraper/playback/user-input/interpolation/mouse-interpolator';
import { DomManager } from '../scraper/playback/dom-manager';

const PlayerContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

// I do this because I want to access the DomManager from non-container parts of the app.
PlayerContainer.bind(DomManager).toConstantValue(new DomManager())

PlayerContainer.bind(IPlaybackHandler).to(MouseEventPlayer);
PlayerContainer.bind(IPlaybackHandler).to(ScrollEventPlayer);
PlayerContainer.bind(IPlaybackHandler).to(InputChangePlayer);
PlayerContainer.bind(IPlaybackHandler).to(FocusPlayer);

PlayerContainer.bind(IInterpolationHelper).to(MouseInterpolationHelper);

export { PlayerContainer };