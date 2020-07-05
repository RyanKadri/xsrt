import { DBConnectionSymbol, Recording, recordingEndpoint, UADetails, TargetEntity } from "../../../common/src";
import { errorInvalidCommand, errorNotFound, RouteImplementation } from "../../../common-backend/src";
import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";
import * as parser from "ua-parser-js";
import { RecordingService } from "../services/recording-service";

type RecordingEndpointType = RouteImplementation<typeof recordingEndpoint>;

@injectable()
export class RecordingEndpoint implements RecordingEndpointType {

  private targetRepo: Repository<TargetEntity>;
  constructor(
    private recordingService: RecordingService,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.targetRepo = connection.getRepository(TargetEntity);
   }

  fetchRecording: RecordingEndpointType["fetchRecording"] = async ({ recordingId }) => {
    const recording = this.recordingService.fetchRecording(recordingId);
    if (!recording) {
      return errorNotFound(`Could not find recording with ID ${recordingId}`);
    } else {
      return recording;
    }
  }

  deleteRecording: RecordingEndpointType["deleteRecording"] = async ({ recordingId }) => {
    await this.recordingService.deleteRecording(recordingId);
  }

  filterRecordings: RecordingEndpointType["filterRecordings"] = async ({ site }) => {
    if (!site) {
      return errorInvalidCommand("You must provide a site when filtering");
    }
    return this.recordingService.filterRecordings({ site });
  }

  createRecording: RecordingEndpointType["createRecording"] = async ({ recording: bodyData, userAgent }) => {
    const target = await this.targetRepo.findOne({ where: { customerId: bodyData.site } });
    if (!target) {
      return errorNotFound(`Site ${bodyData.site} does not exist`);
    }
    const ua = new parser.UAParser(userAgent || "");
    const uaDetails = extractUADetails(ua);
    const recordingData: Omit<Recording, "_id"> = {
      metadata: { site: target.id, startTime: bodyData.startTime, duration: 0, uaDetails },
      chunks: []
    };
    const res = await this.recordingService.createRecording(recordingData);
    return { id: res.id };
  }

  deleteMany: RecordingEndpointType["deleteMany"] = async ({ deleteRequest }) => {
    if (deleteRequest.ids && deleteRequest.ids.length > 0) {
      await this.recordingService.deleteRecordings(deleteRequest.ids);
      return { success: true };
    } else {
      return errorInvalidCommand(`Unsure how to process this deletion request`);
    }
  }
}

const extractUADetails = (ua: any): UADetails => {
  return {
    browser: ua.getBrowser(),
    os: ua.getOS(),
    device: ua.getDevice(),
  };
};

export interface RecordingFilterParams {
  site: string;
}
