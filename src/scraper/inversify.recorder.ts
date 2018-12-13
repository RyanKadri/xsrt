import { Container } from "inversify";
import 'reflect-metadata';
import { FocusRecorder } from './record/user-input/focus-recorder';
import { HtmlInputRecorder } from './record/user-input/input-event-recorder';
import { IUserInputRecorder } from './record/user-input/input-recorder';
import { KeystrokeRecorder } from "./record/user-input/key-recorder";
import { MouseRecorder } from './record/user-input/mouse-recorder';
import { ResizeRecorder } from './record/user-input/resize-recorder';
import { ScrollRecorder } from './record/user-input/scroll-recorder';

const RecorderContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });
RecorderContainer.bind(IUserInputRecorder).to(MouseRecorder);
RecorderContainer.bind(IUserInputRecorder).to(ScrollRecorder);
RecorderContainer.bind(IUserInputRecorder).to(HtmlInputRecorder);
RecorderContainer.bind(IUserInputRecorder).to(FocusRecorder);
RecorderContainer.bind(IUserInputRecorder).to(ResizeRecorder);
RecorderContainer.bind(IUserInputRecorder).to(KeystrokeRecorder);

export { RecorderContainer };

