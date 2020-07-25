import { Channel, connect } from "amqplib";
import { inject, injectable } from "inversify";
import { LoggingService, NeedsInitialization, RabbitChannelSymbol } from "../../../common/src";
import { IServerConfig, ServerConfig } from "../server/express-server";
import { initSnapshotQueueInfo, rawChunkQueueInfo, elasticQueueInfo } from "./queue-metadata";

@injectable()
export class RabbitInitializer implements NeedsInitialization {

  constructor(
    @inject(IServerConfig) private config: ServerConfig,
    private logger: LoggingService
  ) { }

  async initialize(): Promise<[symbol, Channel]> {
    const conn = await connect({ hostname: this.config.rabbitHost, username: "guest", password: "guest" });
    const channel = await conn.createChannel();
    await channel.assertQueue(elasticQueueInfo.mq.name, { durable: true })
    await channel.assertQueue(rawChunkQueueInfo.mq.name, { durable: true });
    await channel.assertQueue(initSnapshotQueueInfo.mq.name, { durable: true });
    this.logger.info("Connected to Rabbit!");
    return [ RabbitChannelSymbol, channel ]
  }
}
