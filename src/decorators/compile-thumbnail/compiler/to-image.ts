import { injectable } from "inversify";
import { launch, Browser } from 'puppeteer';
import { DecoratorConfig } from "../../decorator-server-config";

@injectable()
export class ThumbnailCompiler {

    constructor(
        private decoratorConfig: DecoratorConfig
    ) {}

    private browser?: Promise<Browser>;

    private async initialize() {
        if(!this.browser) {
            this.browser = launch({ headless: false });
        }
        return this.browser;
    }

    async createThumbnail(forRecording: string) {
        const browser = await this.initialize();
        const page = await browser.newPage();
        try {
            await page.goto(`${this.decoratorConfig.staticScreenshotUrl}?recording=${forRecording}`);
            const frame = (await page.frames())[0];
            await frame.waitFor(1000); //TODO - Play around with this timing stuff more. Times out on wait for network
    
            const targetViewport = await page.evaluate(`window['targetViewport']`);
            await page.setViewport({ height: targetViewport.height, width: targetViewport.width })
            
            const fileName = `${forRecording}.png`
            const path = `${this.decoratorConfig.screenshotDir}/${fileName}`;
            await page.screenshot({ path });
            return fileName;
        } finally {
            page.close();
        }
    }

}