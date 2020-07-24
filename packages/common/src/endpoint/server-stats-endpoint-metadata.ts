import { defineEndpoint, Type } from "./types";

export const serverStatsSymbol = Symbol("chunkApi");
export const serverStatsMetadata = defineEndpoint({
  health: {
    method: "get",
    url: "/health",
    request: { },
    clientHeaders: {},
    response: Type<{ success: boolean }>()
  }
});
