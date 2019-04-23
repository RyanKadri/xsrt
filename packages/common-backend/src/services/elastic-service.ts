import { NeedsInitialization, LoggingService } from "@xsrt/common";
import { Client } from "elasticsearch";
import { ServerConfig, IServerConfig } from "../server/express-server";
import { inject, injectable } from "inversify";
import { recordingRepo, ElasticRepo } from "./elastic-repos";

@injectable()
export class ElasticService implements NeedsInitialization {

    private _client: Client;

    constructor(
        private logger: LoggingService,
        @inject(IServerConfig) config: ServerConfig
    ) {
        this._client = new Client({
            host: config.elasticUrl
        });
    }

    async initialize() {
        const repos = [ recordingRepo ];
        for (const repo of repos) {
            await this.createRepoIfNeeded(repo);
        }
    }

    get client() {
        if (!this._client) {
            throw new Error("Expected elasticsearch client to be initialized");
        } else {
            return this._client;
        }
    }

    private async createRepoIfNeeded(repo: ElasticRepo) {
        try {
            await this._client.indices.create({ index: repo.index });
        } catch (e) {
            if (e.message.includes("resource_already_exists_exception")) {
                this.logger.info("Elastic index already exists. Not recreating");
            } else {
                throw e;
            }
        }
    }
}
