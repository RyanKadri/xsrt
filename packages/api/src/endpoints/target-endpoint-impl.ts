import { DBConnectionSymbol, siteTargetEndpoint } from "@xsrt/common";
import { errorNotFound, RouteImplementation, TargetEntity } from "@xsrt/common-backend";
import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";

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
      return target;
    } else {
      return errorNotFound(`Target ${targetId} not found`);
    }
  }

  filterTargets = async () => {
    // TODO - Add count in here
    return this.targetRepo.find({ relations: ["recordings"] });
  }

  createSiteTarget: TargetEndpointType["createSiteTarget"] = async ({ target }) => {
    return this.targetRepo.save(target);
  }

  updateSiteTarget: TargetEndpointType["updateSiteTarget"] = async ({ target, targetId }) => {
    return this.targetRepo.update({ customerId: targetId }, target);
  }
}
