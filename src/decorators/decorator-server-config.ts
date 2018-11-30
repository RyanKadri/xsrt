import { injectable } from "inversify";
import { ServerInitializer, ServerConfig } from "@common/server/express-server";
import { Express } from 'express';
import bodyParser from "body-parser";
import cors from "cors";

@injectable()
export class DecoratorConfig implements ServerConfig {
    readonly port = 3002
    readonly mongoUrl = `mongodb://localhost:27017/recordings`;
    // Note - This URL must contain the protocol or it will break headless chrome
    readonly staticScreenshotUrl = `http://localhost:3000/screenshot.html`;
    readonly screenshotDir = '/var/www/record-service.jane/screenshots';
}

@injectable()
export class ExpressInitializer implements ServerInitializer {
    
    async initialize(app: Express) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(cors())
        app.options('*', cors())
    }
    
}