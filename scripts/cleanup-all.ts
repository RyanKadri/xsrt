import { DatabaseInitializer } from "../packages/common-backend/src";
import { LoggingService, AssetEntity, ChunkEntity, RecordingEntity, TargetEntity } from "../packages/common/src";
import rimraf from "rimraf";
import dotenv from "dotenv";

(async function () {
  dotenv.load()
  const logger = new LoggingService({ debugMode: true });
  await cleanupDB(logger);
  await cleanupFS(logger);
})()

async function cleanupDB(logger: LoggingService) {
  const entityTypes = [ AssetEntity, ChunkEntity, RecordingEntity, TargetEntity ]
  const initializer = new DatabaseInitializer(logger);
  const [, connection] = await initializer.initialize();
  await Promise.all(entityTypes.map(type =>
    connection.manager.delete(type, { }))
  )
  logger.info("Cleared Database")
}

async function cleanupFS(logger) {
  if(process.env.STORAGE_LOCATION) {
    return new Promise((res, rej) => {
      rimraf(process.env.STORAGE_LOCATION, (err) => {
        if(err) {
          res()
        } else {
          rej(err)
        }
      })
    })
  }
}
