import { NeedsInitialization } from "@xsrt/common-backend";
import { Channel, connect } from "amqplib";
import { inject, injectable } from "inversify";
import { ApiServerConfig } from "../api-server-conf";

@injectable()
export class DecoratorQueueService implements NeedsInitialization {

    private channel?: Channel;

    constructor(
        @inject(ApiServerConfig) private config: Pick<ApiServerConfig, "rabbitHost">
    ) { }

    async initialize(): Promise<void> {
        const conn = await connect({ hostname: this.config.rabbitHost, username: "guest", password: "guest" });
        this.channel = await conn.createChannel();
        await this.channel.assertQueue("FinalizedRecordings", { durable: true });
    }

    async postRecording(recordingId: string): Promise<void> {
        this.channel!.sendToQueue("FinalizedRecordings", Buffer.from(JSON.stringify({ id: recordingId })));
    }

}
