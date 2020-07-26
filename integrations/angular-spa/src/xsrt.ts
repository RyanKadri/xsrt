import { InjectionToken } from '@angular/core';
import { RecordingController, XSRTConfig } from '@xsrt/recorder';

export const xsrtConfig: XSRTConfig = {
  backendUrl: 'https://api.xsrt-app.com/api',
  debugMode: true,
  site: '54dacfaa-aff6-48d2-9ba3-52ced8998326'
};

export const XSRTToken = new InjectionToken<RecordingController>('xsrt_controller');
