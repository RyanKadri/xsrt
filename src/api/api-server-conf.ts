import bodyParser from "body-parser";
import cors from "cors";
import { Express } from 'express';
import { injectable } from "inversify";
import { ServerConfig, ServerInitializer } from "../common/server/express-server";

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
        app.use((req, _, next) => {
            console.log(req);
            next();
        })
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json({ limit: '10mb', inflate: true })); //TODO - Let's think about security...
        app.use(bodyParser.text({ limit: '10mb' }))
        app.use(cors())
        app.options('*', cors())
    }
}