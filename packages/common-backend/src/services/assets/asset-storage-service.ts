import { AssetEntity } from "../../../../common/src";

export const IAssetStorageService = Symbol("AssetStorage")

export interface AssetStorageService {
  fetchAsset(asset: AssetEntity): Promise<Buffer>;
  saveAsset(data: Buffer, savePath: string): Promise<void>
}
