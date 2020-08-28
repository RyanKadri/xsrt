import { AssetEntity } from "../../../../common/src";
import { IncomingHttpHeaders } from "http";

export const IAssetStorageService = Symbol("AssetStorage")

export interface AssetStorageService {
  fetchAsset(asset: AssetEntity): Promise<Buffer>;
  saveAsset(data: Buffer, savePath: string, headers?: IncomingHttpHeaders): Promise<void>
}
