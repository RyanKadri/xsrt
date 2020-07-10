import { InjectionToken } from '@angular/core';
import { RecordingController, XSRTConfig } from '@xsrt/recorder';

export const xsrtConfig: XSRTConfig = {
  backendUrl: 'http://localhost:3001',
  debugMode: true,
  site: '69b1a973-6764-4067-bbe3-3dac072ace68'
};

export const XSRTToken = new InjectionToken<RecordingController>('xsrt_controller');
