import { join } from "path";
import { injectable } from "inversify";
import { createHash } from "crypto";
import { promisify } from "util";
import { mkdir, rename, WriteStream, createWriteStream } from "fs";

const mkdirFs = promisify(mkdir);
const renameFs = promisify(rename);

@injectable()
export class AssetStreamService {

    async saveStream(dataStream: WriteStream, saveDir: string, url: URL) {
        // TODO - May need to watch for overwrite collisions here. Consider shortid?
        const contentHash = "temp-";
        const matches = url.pathname.match(/\/([^/]+)$/);
        const baseName = matches ? matches[1] : "root";
        const fileName = `${contentHash}-${baseName}`;
        const savePath = join(saveDir, fileName);
        const hashStream = createHash("sha1");
        await mkdirFs(saveDir, { recursive: true });
        dataStream
            .pipe(createWriteStream(savePath));

        const hash = await new Promise<string>((resolve, reject) => {
            dataStream.on("end", () => {
                resolve(hashStream.digest("base64") as string);
            });
            dataStream.on("data", (chunk) => {
                hashStream.update(chunk);
            });

            dataStream.on("error", () => {
              reject();
            });
          });

        const safeHash = hash.replace(/[\/+=-]/g, "_");
        const renamed = join(saveDir, `${safeHash}-${baseName}`);
        await renameFs(savePath, renamed);
        return { hash: contentHash, path: renamed };
    }
}
