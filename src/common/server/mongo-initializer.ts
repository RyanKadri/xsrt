import { ServerInitializer, ServerConfig, IServerConfig } from "./express-server";
import { injectable, inject } from "inversify";
import { connect } from "mongoose";

@injectable()
export class MongoInitializer implements ServerInitializer {

    constructor(
        @inject(IServerConfig) private config: ServerConfig
    ) {}
    
    async initialize() {
        try {
            await connect(this.config.mongoUrl, { useNewUrlParser: true });
        } catch(e) {
            console.log(`Error connecting to Mongo ${e.message}`);
            throw e;
        }
    }
}