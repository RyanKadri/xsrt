import { Component } from '@angular/core';
import { startRecording } from '@xsrt/recorder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private controller: any;

  startRecording() {
    if (this.controller === undefined) {
      this.controller = startRecording({
        backendUrl: 'http://localhost:3001',
        debugMode: true
      });
    }
  }

  stopRecording() {
    if (this.controller !== undefined) {
      this.controller.stop();
    }
  }
}
