import { DBConnectionSymbol, siteTargetEndpoint, TargetEntity } from "../../../common/src";
import { errorNotFound, RouteImplementation } from "../../../common-backend/src";
import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";
import { v4 } from "uuid";

type TargetEndpointType = RouteImplementation<typeof siteTargetEndpoint>;

@injectable()
export class TargetEndpoint implements TargetEndpointType {

  private targetRepo: Repository<TargetEntity>;

  constructor(
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.targetRepo = connection.getRepository(TargetEntity);
  }

  fetchSiteTarget: TargetEndpointType["fetchSiteTarget"] = async ({ targetId }) => {
    const target = await this.targetRepo.findOne({ where: { customerId: targetId }});
    if (target) {
      return target;
    } else {
      return errorNotFound(`Target ${targetId} not found`);
    }
  }

  deleteSiteTarget: TargetEndpointType["deleteSiteTarget"] = async ({ targetId }) => {
    const target = await this.targetRepo.delete({ customerId: targetId });
    if (target) {
      return ;
    } else {
      return errorNotFound(`Target ${targetId} not found`);
    }
  }

  filterTargets = async () => {
    // TODO - Add count in here
    const targets = await this.targetRepo.createQueryBuilder("t")
      .leftJoin("t.recordings", "r")
      .addSelect("COUNT(r.id)", "numRecordings")
      .groupBy("t.id")
      .getMany();
    return targets
  }

  createSiteTarget: TargetEndpointType["createSiteTarget"] = async ({ target }) => {
    return this.targetRepo.save({
      ...target,
      customerId: v4()
    });
  }

  updateSiteTarget: TargetEndpointType["updateSiteTarget"] = async ({ target: updates, targetId }) => {
    const target = await this.targetRepo.findOne({ where: { customerId: targetId }});
    return this.targetRepo.save({ ...target, ...updates });
  }
}
