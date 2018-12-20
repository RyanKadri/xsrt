import { injectable } from "inversify";
import { Browser, launch, LaunchOptions } from 'puppeteer';
import { ViewportSize } from "../../../viewer/bootstrap/bootstrap-screenshot";
import { DecoratorConfig } from "../../decorator-server-config";

@injectable()
export class ThumbnailCompiler {

    constructor(
        private decoratorConfig: DecoratorConfig
    ) {}

    private browser?: Browser;
    // TODO - Figure out issues related to rendering images in headless
    private readonly launchConfig: LaunchOptions = { headless: false }

    private async newPage() {
        if(!this.browser) {
            this.browser = await launch(this.launchConfig);
        } else {
            try {
                await this.browser.version()
            } catch(e) {
                this.browser = await launch(this.launchConfig);
            }
        }
        return await this.browser.newPage();
    }

    async createThumbnail(forRecording: string) {
        const page = await this.newPage();
        try {
            await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1");
            await page.goto(`${this.decoratorConfig.staticScreenshotUrl}?recording=${forRecording}`);
            await page.waitForFunction(`window['targetViewport']`, { polling: 100 });
    
            const targetViewport: ViewportSize = await page.evaluate(`window['targetViewport']`);
            await page.setViewport({ height: targetViewport.height, width: targetViewport.width });
            
            const fileName = `${forRecording}.png`
            const path = `${this.decoratorConfig.screenshotDir}/${fileName}`;
            await page.screenshot({ path });
            return fileName;
        } finally {
            page.close();
        }
    }

}