import 'reflect-metadata';
import { Container, interfaces } from "inversify";
import { ViewerComponent, IViewerComponent } from '../viewer/components/viewer/viewer';
import { PlayerComponent, IPlayerComponent } from '../viewer/components/viewer/player/player';
import { IPlaybackHandler } from './playback/user-input/user-input-manager';
import { MouseEventPlayer } from './playback/user-input/mouse-input-player';
import { ScrollEventPlayer } from './playback/user-input/scroll-input-player';
import { InputChangePlayer } from './playback/user-input/input-change-player';
import { PlaybackManager } from './playback/playback-manager';
import { FocusPlayer } from './playback/user-input/focus-player';
import { IInterpolationHelper } from './playback/user-input/interpolation/user-input-interpolator';
import { MouseInterpolationHelper } from './playback/user-input/interpolation/mouse-interpolator';
import { DashboardView, IDashboardView } from '../viewer/components/dashboard/dashboard';
import { RecordingService } from '../viewer/services/recording-service';
import { AppRoot, IAppRoot } from '../viewer/components/app-root/app-root';
import { DomManager } from './playback/dom-manager';

const AppContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

// I do this because I want to access the DomManager from non-container parts of the app.
AppContainer.bind(DomManager).toConstantValue(new DomManager())

AppContainer.bind(IPlaybackHandler).to(MouseEventPlayer);
AppContainer.bind(IPlaybackHandler).to(ScrollEventPlayer);
AppContainer.bind(IPlaybackHandler).to(InputChangePlayer);
AppContainer.bind(IPlaybackHandler).to(FocusPlayer);

AppContainer.bind(IInterpolationHelper).to(MouseInterpolationHelper);

bindComponent(IPlayerComponent, PlayerComponent, [PlaybackManager]);
bindComponent(IViewerComponent, ViewerComponent, [IPlayerComponent, RecordingService]);
bindComponent(IDashboardView, DashboardView, [RecordingService]);
bindComponent(IAppRoot, AppRoot, [IDashboardView, IViewerComponent]);

export { AppContainer };

function bindComponent(type: symbol, factory: ComponentFactory, deps: (symbol | interfaces.Newable<any>)[] ) {
    AppContainer.bind(type).toDynamicValue((ctx) => factory(...deps.map(dep => ctx.container.get(dep))));
}

type ComponentFactory = (...args) => (new (props?) => React.Component<any,any>)