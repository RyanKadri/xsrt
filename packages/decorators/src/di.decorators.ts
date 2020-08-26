/* istanbul ignore file */
import got from "got";
import unfetch from "isomorphic-unfetch";
import { ApiDefinition, FSStorageService, IAssetStorageService, IChunkSender, IExpressConfigurator, IServerConfig, RabbitChunkSender, S3StorageService, SQSChunkSender } from "../../common-backend/src";
import { apiDef, assetApiSymbol, assetEndpoint, constant, dependencyGroup, FetchSymbol, GotSymbol, implementationChoice } from "../../common/src";
import { ElasticConsumer } from "./consumer/elastic-consumer";
import { RawChunkProcessor } from "./consumer/raw-chunk-processor";
import { ScreenshotConsumer } from "./consumer/screenshot-consumer";
import { decoratorConfig, DecoratorExpressConfigurator } from "./decorator-server-config";

export const IDecoratorConsumer = Symbol("IKafkaListeners");

export const decoratorDiConfig: ApiDefinition[] = [
    constant(IServerConfig, decoratorConfig),
    constant(GotSymbol, got),
    constant(FetchSymbol, unfetch),
    implementationChoice(IChunkSender, (process.env.USE_SQS === "true" ? SQSChunkSender : RabbitChunkSender) as any),
    implementationChoice(IAssetStorageService, (process.env.USE_S3 === "true" ? S3StorageService : FSStorageService) as any),
    apiDef(assetApiSymbol, assetEndpoint, { baseUrl: decoratorConfig.proxyHost }),
    dependencyGroup(IExpressConfigurator, [
        DecoratorExpressConfigurator
    ]),
    dependencyGroup(IDecoratorConsumer, [
        RawChunkProcessor, ScreenshotConsumer, ElasticConsumer
    ]),
];
