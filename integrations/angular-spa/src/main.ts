import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { XSRT } from '@xsrt/recorder';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { xsrtConfig, XSRTToken } from './xsrt';

(async () => {
  const controller = await XSRT.initialize(xsrtConfig);

  if (environment.production) {
    enableProdMode();
  }

  platformBrowserDynamic([ { provide: XSRTToken, useValue: controller } ])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
})();
