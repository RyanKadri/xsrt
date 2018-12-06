import { injectable } from "inversify";
import { RouteHandler } from "../../common/server/express-server";
import { Router, Request, Response } from "express";
import { Asset, ProxiedAsset } from "../../common/db/asset";
import axios from 'axios';
import { mkdir, createWriteStream } from "fs";
import { promisify } from "util";
import { ApiServerConfig } from "../api-server-conf";
import { join } from "path";
import { URL } from 'url';

const mkdirFs = promisify(mkdir)

@injectable()
export class AssetProxyHandler implements RouteHandler {

    constructor(
        private serverConfig: ApiServerConfig
    ) {}

    readonly base = "/api";

    buildRouter() {
        const router = Router();

        router.route('/proxy')
            .post(this.proxyAsset)

        router.route('/proxy/:assetId')
            .get(this.fetchAsset)

        return router;
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

        // TODO - Apply streaming hash here
        // https://stackoverflow.com/questions/18658612/obtaining-the-hash-of-a-file-using-the-stream-capabilities-of-crypto-module-ie
        const contentHash = "temp-" // hash(proxyRes.data).replace(/[\/+=-]/g, '_');
        const matches = url.pathname.match(/\/([^/]+)$/);
        const baseName = matches ? matches[1] : "root";
        const saveDir = join(this.serverConfig.assetDir, url.hostname);
        const fileName = `${contentHash}-${baseName}`
        const savePath = join(saveDir, fileName);
        await mkdirFs(saveDir, { recursive: true });
        proxyRes.data.pipe(createWriteStream(savePath));
        await new Promise((resolve, reject) => {
            proxyRes.data.on('end', () => {
              resolve()
            })
        
            proxyRes.data.on('error', () => {
              reject()
            })
          })
        const asset = new Asset({
            url,
            hash: contentHash,
            headers,
            content: savePath
        })
        return asset.save();
    }

}