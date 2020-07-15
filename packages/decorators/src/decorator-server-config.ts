import { assertExists } from "../../common/src";
import { ExpressConfigurator, ServerConfig } from "../../common-backend/src";
import bodyParser from "body-parser";
import cors from "cors";
import { Express } from "express";
import { injectable } from "inversify";

export const decoratorConfig: DecoratorConfig = {
    port: parseInt(process.env.DECORATOR_PORT!, 10),
    screenshotDir: `${process.env.STORAGE_LOCATION}/screenshots`,
    recordingHost: assertExists(process.env.API_HOST),
    rabbitHost: process.env.RABBIT_HOST || "localhost",
    elasticUrl: process.env.ELASTIC_HOST || "http://localhost:9200",
    proxyHost: assertExists(process.env.API_HOST)
}

export interface DecoratorConfig extends ServerConfig {
  port: number
  screenshotDir: string;
  recordingHost: string;
  rabbitHost: string;
  elasticUrl: string;
  proxyHost: string;
}

@injectable()
export class DecoratorExpressConfigurator implements ExpressConfigurator {

    async initialize(app: Express) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cors());
        app.options("*", cors());
    }

}
