import { Recording, recordingEndpoint, SiteTarget, UADetails, Without } from "@xsrt/common";
import { errorInvalidCommand, errorNotFound, RouteImplementation, Target } from "@xsrt/common-backend";
import { injectable } from "inversify";
import * as parser from "ua-parser-js";
import { errorNotAuthorized } from "../../../common-backend/src/server/request-handler";
import { RecordingService } from "../services/recording-service";

type RecordingEndpointType = RouteImplementation<typeof recordingEndpoint>;

@injectable()
export class RecordingEndpoint implements RecordingEndpointType {

    constructor(
        private recordingService: RecordingService
    ) { }

    fetchRecording: RecordingEndpointType["fetchRecording"] = async ({ recordingId }) => {
        const recording = this.recordingService.fetchRecording(recordingId);
        if (!recording) {
            return errorNotFound(`Could not find recording with ID ${recordingId}`);
        } else {
            return recording;
        }
    }

    deleteRecording: RecordingEndpointType["deleteRecording"] = async ({ recordingId }) => {
        const data = await this.recordingService.deleteRecording(recordingId);
        if (data) {
            return data;
        } else {
            return errorNotFound(`Recording ${recordingId} does not exist`);
        }
    }

    filterRecordings: RecordingEndpointType["filterRecordings"] = async ({ site }) => {
        if (!site) {
            return errorInvalidCommand("You must provide a site when filtering");
        }
        return this.recordingService.filterRecordings({ site });
    }

    createRecording: RecordingEndpointType["createRecording"] = async ({ recording: bodyData, userAgent, referer }) => {
        const siteDoc = await Target.findById(bodyData.site);
        if (!siteDoc) {
            return errorNotFound(`Site ${bodyData.site} does not exist`);
        } else {
            const site: SiteTarget = siteDoc.toObject();
            // TODO - Make this more secure.
            if (!site.wildcardUrl && (!referer || !site.urls.some(url => referer.includes(url)))) {
                return errorNotAuthorized(
                    "The origin of the recording you are trying to store is not in the list " +
                    "of whitelisted hosts for this site"
                );
            }
        }
        const ua = new parser.UAParser(userAgent || "");
        const uaDetails = extractUADetails(ua);
        const recordingData: Without<Recording, "_id"> = {
            metadata: { site: siteDoc._id, startTime: bodyData.startTime, duration: 0, uaDetails },
            chunks: []
        };
        const res = await this.recordingService.createRecording(recordingData);
        return { _id: res._id };
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
