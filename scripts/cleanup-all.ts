import dotenv from "dotenv";
dotenv.config({ debug: true })
import { DatabaseInitializer, RabbitInitializer, rawChunkQueueInfo, elasticQueueInfo, initSnapshotQueueInfo } from "../packages/common-backend/src";
import { ApiServerConfig } from "../packages/api/src/api-server-conf"
import { LoggingService, AssetEntity, ChunkEntity, RecordingEntity, TargetEntity } from "../packages/common/src";
import rimraf from "rimraf";
import { existsSync } from "fs";

(async function () {
  const logger = new LoggingService({ debugMode: true });
  await cleanupDB(logger);
  await cleanupFS(logger);
  await clearQueues(logger)
})()

async function cleanupDB(logger: LoggingService) {
  const entityTypes = [ AssetEntity, ChunkEntity, RecordingEntity ]
  const initializer = new DatabaseInitializer(logger);
  const [, connection] = await initializer.initialize();
  await Promise.all(entityTypes.map(type =>
    connection.manager.delete(type, { }))
  )
  logger.info("Cleared Database")
}

async function cleanupFS(logger: LoggingService) {
  if(process.env.STORAGE_LOCATION && existsSync(process.env.STORAGE_LOCATION!)) {
    await new Promise((res, rej) => {
      rimraf(process.env.STORAGE_LOCATION!, (err) => {
        if(err) {
          res()
        } else {
          rej(err)
        }
      })
    });
    logger.info("Cleared storage files")
  } else {
    logger.warn("You don't have a storage directory. Skipping")
  }
}

async function clearQueues(logger: LoggingService) {
  const rabbitInit = new RabbitInitializer(new ApiServerConfig(), logger);
  const [, channel] = await rabbitInit.initialize()
  const queues = [ rawChunkQueueInfo, elasticQueueInfo, initSnapshotQueueInfo ];
  await Promise.all(queues.map(queue => {
    return channel.deleteQueue(queue.mq.name)
  }))
  logger.info("Cleared queues")
}
