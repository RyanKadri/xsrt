import { inject, injectable } from "inversify";
import { Browser, launch, LaunchOptions } from "puppeteer";
import { IServerConfig } from "../../../../common-backend/src";
import { ViewportSize } from "../../../../common/src";
import { DecoratorConfig } from "../../decorator-server-config";

// tslint:disable-next-line:max-line-length
const defaultUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1";

@injectable()
export class ThumbnailCompiler {

  constructor(
    @inject(IServerConfig) private decoratorConfig: DecoratorConfig
  ) { }

  private browser?: Browser;
  // TODO - Figure out issues related to rendering images in headless
  private readonly launchConfig: LaunchOptions = {
    headless: process.env.HEADLESS !== "false",
    executablePath: process.env.CHROME_EXECUTABLE,
    args: [
      "--no-sandbox"
    ]
  };

  private async newPage() {
    if (!this.browser) {
      this.browser = await launch(this.launchConfig);
    } else {
      try {
        await this.browser.version();
      } catch (e) {
        this.browser = await launch(this.launchConfig);
      }
    }
    return await this.browser.newPage();
  }

  async createThumbnail(forChunk: string) {
    const page = await this.newPage();
    try {
      await page.setUserAgent(defaultUA);

      // Note - This URL must contain the protocol or it will break headless chrome. Also keep this as
      // localhost because this currently assumes the decorator service will serve the screenshot static page
      await page.goto(`${this.decoratorConfig.frontendHost}/screenshot.html?chunk=${forChunk}`);
      await page.waitForFunction(`window['targetViewport']`, { polling: 100 });

      const targetViewport = await page.evaluate(`window['targetViewport']`) as ViewportSize;
      await page.setViewport({ height: targetViewport.height, width: targetViewport.width });
      const buffer = await page.screenshot({ encoding: "binary" });
      return buffer;
    } finally {
      page.close();
    }
  }

}
