import 'reflect-metadata';
import { Container } from "inversify";
import { IUserInputRecorder } from './record/user-input/input-recorder';
import { MouseRecorder } from './record/user-input/mouse-recorder';
import { ScrollRecorder } from './record/user-input/scroll-recorder';
import { HtmlInputRecorder } from './record/user-input/input-event-recorder';

const AppContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });
AppContainer.bind(IUserInputRecorder).to(MouseRecorder)
AppContainer.bind(IUserInputRecorder).to(ScrollRecorder)
AppContainer.bind(IUserInputRecorder).to(HtmlInputRecorder)

export { AppContainer };