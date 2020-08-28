import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";
import { bufferResponse, errorNotFound, RouteImplementation, AssetStorageService, IAssetStorageService } from "../../../common-backend/src";
import { assetEndpoint, AssetEntity, DBConnectionSymbol } from "../../../common/src";

type AssetEndpointType = RouteImplementation<typeof assetEndpoint>;

@injectable()
export class AssetEndpoint implements AssetEndpointType {

  private assetRepo: Repository<AssetEntity>;

  constructor(
    @inject(DBConnectionSymbol) connection: Connection,
    @inject(IAssetStorageService) private storageService: AssetStorageService
  ) {
    this.assetRepo = connection.getRepository(AssetEntity);
  }

  fetchAsset: AssetEndpointType["fetchAsset"] = async ({ assetId }) => {
    const asset = await this.assetRepo.findOne(assetId);
    if (asset) {
      // TODO - Streaming?
      const buffer = await this.storageService.fetchAsset(asset);
      return bufferResponse(buffer, asset.headers);
    } else {
      return errorNotFound(`Could not find asset ${assetId}`);
    }
  }

}
