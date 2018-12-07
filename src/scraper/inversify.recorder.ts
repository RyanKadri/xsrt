import 'reflect-metadata';
import { Container } from "inversify";
import { IUserInputRecorder } from './record/user-input/input-recorder';
import { MouseRecorder } from './record/user-input/mouse-recorder';
import { ScrollRecorder } from './record/user-input/scroll-recorder';
import { HtmlInputRecorder } from './record/user-input/input-event-recorder';
import { FocusRecorder } from './record/user-input/focus-recorder';

const RecorderContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });
RecorderContainer.bind(IUserInputRecorder).to(MouseRecorder);
RecorderContainer.bind(IUserInputRecorder).to(ScrollRecorder);
RecorderContainer.bind(IUserInputRecorder).to(HtmlInputRecorder);
RecorderContainer.bind(IUserInputRecorder).to(FocusRecorder);

export { RecorderContainer };