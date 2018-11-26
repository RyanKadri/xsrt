import 'reflect-metadata';
import { Container } from "inversify";
import { Viewer, ViewerType } from '../viewer/components/viewer/viewer';
import { RecordingPlayer, PlayerType } from '../viewer/components/player/player';
import { IPlaybackHandler } from './playback/user-input/user-input-manager';
import { MouseEventPlayer } from './playback/user-input/mouse-input-player';
import { ScrollEventPlayer } from './playback/user-input/scroll-input-player';
import { InputChangePlayer } from './playback/user-input/input-change-player';
import { PlaybackManager } from './playback/playback-manager';
import { FocusPlayer } from './playback/user-input/focus-player';
import { IInterpolationHelper } from './playback/user-input/interpolation/user-input-interpolator';
import { MouseInterpolationHelper } from './playback/user-input/interpolation/mouse-interpolator';

const AppContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });
AppContainer.bind(IPlaybackHandler).to(MouseEventPlayer);
AppContainer.bind(IPlaybackHandler).to(ScrollEventPlayer);
AppContainer.bind(IPlaybackHandler).to(InputChangePlayer);
AppContainer.bind(IPlaybackHandler).to(FocusPlayer);

AppContainer.bind(IInterpolationHelper).to(MouseInterpolationHelper);

AppContainer.bind(PlayerType).toDynamicValue((ctx) => RecordingPlayer(ctx.container.get(PlaybackManager)));
AppContainer.bind(ViewerType).toDynamicValue((ctx) => Viewer(ctx.container.get(PlayerType)));

export { AppContainer };