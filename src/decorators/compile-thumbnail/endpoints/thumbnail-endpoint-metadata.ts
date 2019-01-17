import { defineEndpoint, RouteParamUnwrap, Type } from "../../../common/server/route-types";

export const thumbnailEndpointMetadata = defineEndpoint({
    compileThumbnail: {
        method: "post",
        url: "/thumbnails/:recordingId",
        response: Type<{success: boolean}>(),
        request: {
            recordingId: new RouteParamUnwrap("recordingId"),
        }
    },
    deleteThumbnail: {
        method: "delete",
        url: "/thumbnails/:recording",
        response: Type<{success: boolean}>(),
        request: {
            recordingId: new RouteParamUnwrap("recordingId")
        }
    }
});
