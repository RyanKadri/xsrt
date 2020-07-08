import { defineEndpoint, Type } from "../../../common/src";
import { DecoratorConfig } from "../decorator-server-config";

export const configEndpointMetadata = defineEndpoint({
    fetchConfig: {
        method: "get",
        url: "/config",
        response: Type<Partial<DecoratorConfig>>(),
        request: {
        }
    },
});
