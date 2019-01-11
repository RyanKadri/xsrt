import { RegionService } from "./regions-service";

describe(`RegionsService`, () => {
    it('Creates a single idle region when there are no events', () => {
        const service = new RegionService({ regionIdleTime: 100 })
        const res = service.splitRegions({ changes: [], inputs: [] }, 100);
        expect(res).toEqual([{ type: 'action', start: 0, end: 0}, { type: 'idle', start: 0, end: 100 }])
    })
})