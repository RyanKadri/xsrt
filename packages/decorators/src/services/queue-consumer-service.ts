import { NeedsInitialization } from "@xsrt/common-backend";
import { Channel, connect } from "amqplib";
import { inject, injectable } from "inversify";
import { DecoratorConfig } from "../decorator-server-config";
import { RawChunkProcessor } from "../consumer/raw-chunk-processor";
import { ScreenshotConsumer } from "../consumer/screenshot-consumer";

@injectable()
export class QueueConsumerService implements NeedsInitialization {

    private handlers = new Map<string, QueueMessageCallback<any>[]>();
    private chann: Channel | undefined;
    private listeners: DecoratorConsumer<any>[];

    constructor(
        @inject(DecoratorConfig) private config: Pick<DecoratorConfig, "rabbitHost">,
        // TODO - I would like to multiinject here but there seems to be an inversify bug here.
        chunkProcessor: RawChunkProcessor,
        screenshotConsumer: ScreenshotConsumer
    ) {
        this.listeners = [chunkProcessor, screenshotConsumer];
    }

    async initialize() {
        const conn = await connect({ hostname: this.config.rabbitHost, username: "guest", password: "guest" });
        this.chann = await conn.createChannel();
        await Promise.all(
            this.listeners.map(listener => this.chann!.assertQueue(listener.topic, { durable: true }))
        );
        await Promise.all(
            this.listeners.map(listener =>
                this.registerListener(listener.topic, listener.handle)
            )
        );
    }

    private async registerListener<T>(topic: string, handler: QueueMessageCallback<T>) {
        const oldCallbacks = this.handlers.get(topic);
        this.handlers.set(topic, (oldCallbacks || []).concat(handler));

        await this.chann!.consume(topic, async (msg) => {
            if (msg === null) { return; }
            const callbacks = this.handlers.get(topic) || [];
            const value = msg.content.toString();
            await Promise.all(
                callbacks.map(cb => cb(JSON.parse(value)))
            );
            this.chann!.ack(msg);
        });
    }
}

export type QueueMessageCallback<T> = (msg: T) => Promise<QueueForwardRequest | void>;

export interface DecoratorConsumer<T> {
    topic: string;
    handle: QueueMessageCallback<T>;
}

export interface QueueForwardRequest {
    queue: string;
    payload: any;
}
