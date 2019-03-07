import { Channel, connect } from "amqplib";
import { inject, injectable } from "inversify";
import { ApiServerConfig } from "../../../api/src/api-server-conf";
import { RecordingChunk } from "../../../common/src";
import { NeedsInitialization } from "../server/express-server";
import { initSnapshotQueue, rawChunkQueue } from "./queue-metadata";

// This is outside the class because this: https://github.com/inversify/InversifyJS/issues/240
// does not seem to be working properly. This class is getting constructed twice.
let channel: Channel | undefined;

@injectable()
export class DecoratorQueueService implements NeedsInitialization {
    static diName = "queueService";

    constructor(
        @inject(ApiServerConfig) private config: Pick<ApiServerConfig, "rabbitHost">
    ) { }

    async initialize(): Promise<void> {
        const conn = await connect({ hostname: this.config.rabbitHost, username: "guest", password: "guest" });
        channel = await conn.createChannel();
        await channel.assertQueue(rawChunkQueue.name, { durable: true });
        await channel.assertQueue(initSnapshotQueue.name, { durable: true });
    }

    async postChunk(chunk: RecordingChunk): Promise<void> {
        channel!.sendToQueue(rawChunkQueue.name,
            Buffer.from(JSON.stringify({ _id: chunk._id }))
        );
    }

}
