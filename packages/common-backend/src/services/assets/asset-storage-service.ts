export const IAssetStorageService = Symbol("AssetStorage")

export interface AssetStorageService {
  saveAsset(data: Buffer, savePath: string): Promise<void>
}
