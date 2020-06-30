import { InjectionToken } from '@angular/core';
import { RecordingController, XSRTConfig } from '@xsrt/recorder';

export const xsrtConfig: XSRTConfig = {
  backendUrl: 'http://localhost:3001',
  debugMode: true,
  site: '5YUy1Tgxx'
};

export const XSRTToken = new InjectionToken<RecordingController>('xsrt_controller');
