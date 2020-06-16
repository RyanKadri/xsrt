import { NeedsInitialization, RecordingChunk } from "@xsrt/common";
import { DecoratorQueueService } from "@xsrt/common-backend";
import { Channel, connect } from "amqplib";
import { inject, injectable, multiInject } from "inversify";
import { DecoratorConfig } from "../decorator-server-config";
import { IDecoratorConsumer } from "../di.decorators";

@injectable()
export class QueueConsumerService implements NeedsInitialization {

    private handlers = new Map<string, QueueMessageCallback<any>[]>();
    private chann: Channel | undefined;

    constructor(
        @inject(DecoratorConfig) private config: Pick<DecoratorConfig, "rabbitHost">,
        private queueService: DecoratorQueueService,
        @multiInject(IDecoratorConsumer) private listeners: DecoratorConsumer<any>[]
    ) { }

    async initialize() {
        const conn = await connect({ hostname: this.config.rabbitHost, username: "guest", password: "guest" });
        this.chann = await conn.createChannel();
        await Promise.all(
            this.listeners.map(listener => this.chann!.assertQueue(listener.topic, { durable: true }))
        );
        await Promise.all(
            this.listeners.map(listener =>
                this.registerListener(listener.topic, listener.handle.bind(listener))
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
            const responses = await Promise.all(
                callbacks.map(cb => cb(JSON.parse(value)))
            );
            responses.forEach(resp => {
                if (resp) { this.forwardResponse(resp); }
            });
            this.chann!.ack(msg);
        });
    }

    // TODO - Handle failures here
    private async forwardResponse(resp: QueueForwardRequest) {
        this.queueService.postMessage(resp.queue, resp.payload);
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

export type ChunkId = Pick<RecordingChunk, "_id">;
