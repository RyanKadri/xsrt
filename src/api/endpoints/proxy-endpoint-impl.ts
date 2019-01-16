import axios from "axios";
import { createHash } from "crypto";
import { createWriteStream, mkdir, rename, WriteStream } from "fs";
import { inject } from "inversify";
import { join } from "path";
import { promisify } from "util";
import { Asset, ProxiedAsset } from "../../common/db/asset";
import { IServerConfig } from "../../common/server/express-server";
import { downloadResponse, errorNotFound, implement } from "../../common/server/implement-route";
import { RouteImplementation } from "../../common/server/route-types";
import { ApiServerConfig } from "../api-server-conf";
import { assetEndpoint } from "./proxy-endpoint-metadata";

const mkdirFs = promisify(mkdir);
const renameFs = promisify(rename);

type AssetEndpointType = RouteImplementation<typeof assetEndpoint>;
export class AssetEndpoint implements AssetEndpointType {

    constructor(
        @inject(IServerConfig) private config: ApiServerConfig
    ) { }

    fetchAsset: AssetEndpointType["fetchAsset"] = async ({ assetId }) => {
        const assetDoc = await Asset.findById(assetId);
        if (assetDoc) {
            const proxyAsset = assetDoc.toObject() as ProxiedAsset;
            return downloadResponse(proxyAsset.content, proxyAsset.headers);
        } else {
            return errorNotFound(`Could not find asset ${assetId}`);
        }
    }

    createAsset: AssetEndpointType["createAsset"] = async ({ proxyReq, userAgent }) => {
        const assets = await Promise.all(proxyReq.urls.map(url => this.proxySingleAsset(new URL(url), userAgent)));
        return {assets: assets.map(asset => asset._id) };
    }

    private proxySingleAsset = async (url: URL, userAgent = "") => {
        const proxyRes = await axios.get(url.href, { responseType: "stream", headers: { ["User-Agent"]: userAgent } });
        const headers = Object.entries(proxyRes.headers)
            .map(([name, value]) => ({ name, value }));
        const dataStream: WriteStream = proxyRes.data;

        // TODO - May need to watch for overwrite collisions here. Consider shortid?
        const contentHash = "temp-";
        const matches = url.pathname.match(/\/([^/]+)$/);
        const baseName = matches ? matches[1] : "root";
        const saveDir = join(this.config.assetDir, url.hostname);
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

        const asset = new Asset({
            url,
            hash: contentHash,
            headers,
            content: renamed
        });
        return asset.save();
    }
}

export const assetEndpointImpl = implement(assetEndpoint, AssetEndpoint);
