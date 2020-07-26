import { InjectionToken } from '@angular/core';
import { RecordingController, XSRTConfig } from '@xsrt/recorder';

export const xsrtConfig: XSRTConfig = {
  backendUrl: 'http://localhost:3001',
  debugMode: true,
  site: '69c1bc84-3de9-47ab-b937-bc0c7ce0c0c0'
};

export const XSRTToken = new InjectionToken<RecordingController>('xsrt_controller');
