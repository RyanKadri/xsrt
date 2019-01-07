import axios from 'axios';
import { createHash } from 'crypto';
import { createWriteStream, mkdir, rename, WriteStream } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { Asset, ProxiedAsset } from '../../common/db/asset';
import { ApiServerConfig } from '../api-server-conf';
import { assetEndpoint } from './proxy-endpoint-metadata';
import { downloadResponse, errorNotFound, implement, RouteImplementation } from './route';

const mkdirFs = promisify(mkdir)
const renameFs = promisify(rename)

export const assetEndpointImpl = implement(assetEndpoint, {
    fetchAsset: async ({ assetId }) => {
        const assetDoc = await Asset.findById(assetId);
        if(assetDoc) {
            const proxyAsset = assetDoc.toObject() as ProxiedAsset;
            return downloadResponse(proxyAsset.content, proxyAsset.headers);
        } else {
            return errorNotFound(`Could not find asset ${assetId}`);
        }
    },
    createAsset: async ({ proxyReq, userAgent, config }) => {
        const assets = await Promise.all(proxyReq.urls.map(url => proxySingleAsset(new URL(url), config, userAgent)))
        return {assets: assets.map(asset => asset._id) };
    }
} as RouteImplementation<typeof assetEndpoint>)

const proxySingleAsset = async (url: URL, config: ApiServerConfig, userAgent = "") => {
    const proxyRes = await axios.get(url.href, { responseType: 'stream', headers: { ['User-Agent']: userAgent } });
    const headers = Object.entries(proxyRes.headers)
        .map(([name, value]) => ({ name, value }));
    const dataStream: WriteStream = proxyRes.data;

    // TODO - May need to watch for overwrite collisions here. Consider shortid?
    const contentHash = "temp-";
    const matches = url.pathname.match(/\/([^/]+)$/);
    const baseName = matches ? matches[1] : "root";
    const saveDir = join(config.assetDir, url.hostname);
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