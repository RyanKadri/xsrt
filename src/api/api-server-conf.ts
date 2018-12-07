import { ServerConfig, ServerInitializer } from "../common/server/express-server";
import { injectable } from "inversify";
import { Express } from 'express'
import bodyParser from "body-parser";
import cors from "cors";

@injectable()
export class ApiServerConfig implements ServerConfig {
    readonly port = 3001;
    readonly mongoUrl = `mongodb://localhost:27017/recordings`;
    readonly decorateUrl = `http://localhost:3002`;
    readonly assetDir = "/var/www/record-service.jane/assets";
}

@injectable()
export class ApiServerInitializer implements ServerInitializer {
    async initialize(app: Express) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json({ limit: '10mb', inflate: true })); //TODO - Let's think about security...
        app.use(cors())
        app.options('*', cors())
    }
}