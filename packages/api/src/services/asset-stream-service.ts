import { createHash } from "crypto";
import { mkdir, rename, writeFile } from "fs";
import { injectable } from "inversify";
import { join } from "path";
import { promisify } from "util";

const mkdirFs = promisify(mkdir);
const renameFs = promisify(rename);
const writeFileFs = promisify(writeFile);

@injectable()
export class AssetStreamService {

    async saveStream(dataStream: Buffer, saveDir: string, url: URL) {
        // TODO - May need to watch for overwrite collisions here. Consider shortid?
        const contentHash = "temp-";
        const matches = url.pathname.match(/\/([^/]+)$/);
        const baseName = matches ? matches[1] : "root";
        const fileName = `${contentHash}-${baseName}`;
        const savePath = join(saveDir, fileName);
        const hashStream = createHash("sha1");
        await mkdirFs(saveDir, { recursive: true });

        await writeFileFs(savePath, dataStream)
        hashStream.update(dataStream);
        const hash = hashStream.digest("base64");
        const safeHash = hash.replace(/[\/+=-]/g, "_");
        const renamed = join(saveDir, `${safeHash}-${baseName}`);
        await renameFs(savePath, renamed);
        return { hash: contentHash, path: renamed };
    }
}
