import { InjectionToken } from '@angular/core';
import { RecordingController, XSRTConfig } from '@xsrt/recorder';

export const xsrtConfig: XSRTConfig = {
  backendUrl: 'http://localhost:3001',
  debugMode: true,
  site: '-Ii56T2uN'
};

export const XSRTToken = new InjectionToken<RecordingController>('xsrt_controller');
