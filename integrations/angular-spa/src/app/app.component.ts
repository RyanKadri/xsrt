import { Component, Inject } from '@angular/core';
import { RecordingController } from '@xsrt/recorder';
import { XSRTToken } from '../xsrt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    @Inject(XSRTToken) private recordingController: RecordingController
  ) { }

  get recording() {
    return this.recordingController.isRecording();
  }

  navItems = [
    { display: 'TODOs', link: ['/todos'] },
    { display: 'Home', link: ['/home'] }
  ];

  startRecording() {
    this.recordingController.start();
  }

  stopRecording() {
    this.recordingController.stop();
  }
}
