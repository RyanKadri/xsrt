import { DBConnectionSymbol, LoggingService, NeedsInitialization, ChunkEntity, AssetEntity, RecordingEntity, TargetEntity } from "../../../common/src";
import { injectable } from "inversify";
import { Connection, createConnection } from "typeorm";

@injectable()
export class DatabaseInitializer implements NeedsInitialization {

  constructor(
    // @inject(IServerConfig) private config: ServerConfig,
    private logger: LoggingService
  ) { }

  async initialize(): Promise<[symbol, Connection]> {
    const connection = await createConnection({
      type: "postgres",
      host: process.env.DB_HOST ?? "localhost",
      port: parseInt(process.env.DB_PORT ?? "5432", 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: "xsrt",
      schema: "public",
      entities: [
        AssetEntity,
        ChunkEntity,
        RecordingEntity,
        TargetEntity
      ]
    })
    this.logger.info("Connected to database!");
    return [ DBConnectionSymbol, connection ]
  }
}
