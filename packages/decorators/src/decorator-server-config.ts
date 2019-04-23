import { ServerConfig, ExpressConfigurator } from "@xsrt/common-backend";
import bodyParser from "body-parser";
import cors from "cors";
import { Express } from "express";
import { injectable } from "inversify";

@injectable()
export class DecoratorConfig implements ServerConfig {
    readonly port = parseInt(process.env.DECORATOR_PORT!, 10);
    readonly mongoUrl = `${process.env.MONGO_URL}`;
    readonly screenshotDir = `${process.env.STORAGE_LOCATION}/screenshots`;
    readonly recordingHost = `${process.env.API_SERVER}`;
    readonly rabbitHost = process.env.RABBIT_HOST || "localhost";
    readonly elasticUrl = process.env.ELASTIC_HOST || "localhost:9200";
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
