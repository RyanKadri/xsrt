import { Channel, connect } from "amqplib";
import { inject, injectable } from "inversify";
import { RecordingChunk, NeedsInitialization } from "@xsrt/common";
import { initSnapshotQueue, rawChunkQueue } from "./queue-metadata";
import { ServerConfig, IServerConfig } from "../server/express-server";

// This is outside the class because this: https://github.com/inversify/InversifyJS/issues/240
// does not seem to be working properly. This class is getting constructed twice.
let _channel: Channel | undefined;

@injectable()
export class DecoratorQueueService implements NeedsInitialization {
    static diName = "queueService";

    constructor(
        @inject(IServerConfig) private config: Pick<ServerConfig, "rabbitHost">
    ) { }

    async initialize(): Promise<void> {
        const conn = await connect({ hostname: this.config.rabbitHost, username: "guest", password: "guest" });
        _channel = await conn.createChannel();
        await this.channel.assertQueue(rawChunkQueue.name, { durable: true });
        await this.channel.assertQueue(initSnapshotQueue.name, { durable: true });
    }

    get channel() {
        if (_channel) {
            return _channel;
        } else {
            throw new Error("Expected the queue service to be initialized");
        }
    }

    async postChunk(chunk: RecordingChunk): Promise<void> {
        this.postMessage(rawChunkQueue.name, { _id: chunk._id });
    }

    async postMessage(toQueue: string, payload: any) {
        this.channel.sendToQueue(toQueue, Buffer.from(JSON.stringify(payload)));
    }

}
