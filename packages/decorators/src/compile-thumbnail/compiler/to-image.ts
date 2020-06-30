import { ViewportSize } from "@xsrt/common";
import { mkdir as mkdirFS } from "fs";
import { injectable, inject } from "inversify";
import { Browser, launch, LaunchOptions } from "puppeteer";
import { promisify } from "util";
import { DecoratorConfig } from "../../decorator-server-config";
import { IServerConfig } from "@xsrt/common-backend";

const mkdir = promisify(mkdirFS);

// tslint:disable-next-line:max-line-length
const defaultUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1";

@injectable()
export class ThumbnailCompiler {

    constructor(
        @inject(IServerConfig) private decoratorConfig: DecoratorConfig
    ) {}

    private browser?: Browser;
    // TODO - Figure out issues related to rendering images in headless
    private readonly launchConfig: LaunchOptions = {
        headless: false
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
            const hostPart = `http://localhost:${this.decoratorConfig.port}`;
            const screenshotPage = `static/screenshot/index.html`;
            await page.goto(`${hostPart}/${screenshotPage}?chunk=${forChunk}`);
            await page.waitForFunction(`window['targetViewport']`, { polling: 100 });

            const targetViewport = await page.evaluate(`window['targetViewport']`) as ViewportSize;
            await page.setViewport({ height: targetViewport.height, width: targetViewport.width });
            try {
                await mkdir(this.decoratorConfig.screenshotDir);
            } catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
            const fileName = `${forChunk}.png`;
            const path = `${this.decoratorConfig.screenshotDir}/${fileName}`;
            await page.screenshot({ path });
            return fileName;
        } finally {
            page.close();
        }
    }

}
