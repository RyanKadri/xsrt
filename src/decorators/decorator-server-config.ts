import bodyParser from "body-parser";
import cors from "cors";
import { Express } from "express";
import { injectable } from "inversify";
import { ServerConfig, ServerInitializer } from "../common/server/express-server";

@injectable()
export class DecoratorConfig implements ServerConfig {
    readonly port = parseInt(process.env.DECORATOR_PORT!, 10);
    readonly mongoUrl = `${process.env.MONGO_URL}`;
    // Note - This URL must contain the protocol or it will break headless chrome
    readonly staticScreenshotUrl = `http://localhost:3000/screenshot.html`;
    readonly screenshotDir = "/var/www/record-service.jane/screenshots";
}

@injectable()
export class ExpressInitializer implements ServerInitializer {

    async initialize(app: Express) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cors());
        app.options("*", cors());
    }

}
