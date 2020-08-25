import { InjectionToken } from '@angular/core';
import { RecordingController, XSRTConfig } from '@xsrt/recorder';

export const xsrtConfig: XSRTConfig = {
  backendUrl: 'https://api-dev.xsrt-app.com/api',
  debugMode: true,
  site: '4af5226a-e07c-4547-8eb5-0cf1b2692244'
};

export const XSRTToken = new InjectionToken<RecordingController>('xsrt_controller');
