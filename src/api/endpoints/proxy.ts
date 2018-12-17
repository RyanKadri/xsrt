import axios from 'axios';
import { createHash } from 'crypto';
import { Request, Response, Router } from "express";
import { createWriteStream, mkdir, rename, WriteStream } from "fs";
import { injectable } from "inversify";
import { join } from "path";
import { URL } from 'url';
import { promisify } from "util";
import { Asset, ProxiedAsset } from "../../common/db/asset";
import { RouteHandler } from "../../common/server/express-server";
import { ApiServerConfig } from "../api-server-conf";

const mkdirFs = promisify(mkdir)
const renameFs = promisify(rename)

@injectable()
export class AssetProxyHandler implements RouteHandler {

    constructor(
        private serverConfig: ApiServerConfig
    ) {}

    readonly base = "/api";

    decorateRouter(router: Router) {
        router.route('/proxy')
            .post(this.proxyAsset)

        router.route('/proxy/:assetId')
            .get(this.fetchAsset)
    }

    private fetchAsset = async (req: Request, resp: Response) => {   
        try {
            const res = await Asset.findById(req.params.assetId) as unknown as ProxiedAsset;
            res.headers.forEach(header => {
                resp.setHeader(header.name, header.value);
            })
            resp.download(res.content);
        } catch(e){
            resp.json({error: e})
        }
    }

    private proxyAsset = async (req: Request, resp: Response) => {
        const userAgent = req.header('user-agent');
        const urls: string[] = req.body.urls;
        try {
            const assets = await Promise.all(urls.map(url => this.proxySingleAsset(new URL(url), userAgent)))
            resp.json({assets: assets.map(asset => asset._id) });
        } catch (e) {
            console.error(e);
            resp.json({ error: e.message })
        }
    }

    private async proxySingleAsset(url: URL, userAgent = "") {
        const proxyRes = await axios.get(url.href, { responseType: 'stream', headers: { ['User-Agent']: userAgent } });
        const headers = Object.entries(proxyRes.headers)
            .map(([name, value]) => ({ name, value }));
        const dataStream: WriteStream = proxyRes.data;

        // TODO - May need to watch for overwrite collisions here. Consider shortid?
        const contentHash = "temp-";
        const matches = url.pathname.match(/\/([^/]+)$/);
        const baseName = matches ? matches[1] : "root";
        const saveDir = join(this.serverConfig.assetDir, url.hostname);
        const fileName = `${contentHash}-${baseName}`
        const savePath = join(saveDir, fileName);
        const hashStream = createHash('sha1');
        await mkdirFs(saveDir, { recursive: true });
        dataStream
            .pipe(createWriteStream(savePath));

        const hash = await new Promise<string>((resolve, reject) => {
            dataStream.on('end', () => {
                resolve(hashStream.digest('base64') as string)
            });
            dataStream.on('data', (chunk) => {
                hashStream.update(chunk);
            });
        
            dataStream.on('error', () => {
              reject()
            });
          });

        const safeHash = hash.replace(/[\/+=-]/g, '_');
        const renamed = join(saveDir, `${safeHash}-${baseName}`);
        await renameFs(savePath, renamed);

        const asset = new Asset({
            url,
            hash: contentHash,
            headers,
            content: renamed
        })
        return asset.save();
    }

}