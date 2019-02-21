import { Component } from '@angular/core';
import { RecordingController, startRecording } from '@xsrt/recorder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private controller: RecordingController;
  private recording = false;
  navItems = [
    { display: 'TODOs', link: ['/todos'] },
    { display: 'Home', link: ['/home'] }
  ];

  startRecording() {
    if (this.controller === undefined) {
      this.controller = startRecording({
        backendUrl: 'http://localhost:3001',
        debugMode: true,
        site: '-Ii56T2uN'
      });
      this.recording = true;
    }
  }

  stopRecording() {
    if (this.controller !== undefined) {
      this.controller.stop();
      this.recording = false;
    }
  }
}
