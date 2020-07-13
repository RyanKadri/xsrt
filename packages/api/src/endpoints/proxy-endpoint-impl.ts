import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";
import { downloadResponse, errorNotFound, RouteImplementation } from "../../../common-backend/src";
import { assetEndpoint, AssetEntity, DBConnectionSymbol } from "../../../common/src";

type AssetEndpointType = RouteImplementation<typeof assetEndpoint>;

@injectable()
export class AssetEndpoint implements AssetEndpointType {

  private assetRepo: Repository<AssetEntity>;

  constructor(
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.assetRepo = connection.getRepository(AssetEntity);
  }

  fetchAsset: AssetEndpointType["fetchAsset"] = async ({ assetId }) => {
    const asset = await this.assetRepo.findOne(assetId);
    if (asset) {
      return downloadResponse(asset.proxyPath, asset.headers);
    } else {
      return errorNotFound(`Could not find asset ${assetId}`);
    }
  }

}
