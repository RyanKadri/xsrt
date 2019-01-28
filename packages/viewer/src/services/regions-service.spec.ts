import { RegionService } from "./regions-service";

describe(`RegionsService`, () => {
    const service = new RegionService({ regionIdleTime: 10 })
    it('Creates a single idle region when there are no events', () => {
        const res = service.splitRegions({ changes: [], inputs: [] }, 100);
        expect(res).toEqual([{ type: 'idle', start: 0, end: 100 }])
    });

    it("Uses a configurable idle time to chunk a region into active and idle sections", () => {
        const res = service.splitRegions({ changes: [], inputs: [{ name: 'scroll', elements: [
            createScrollEvent(20),
            createScrollEvent(25),
            createScrollEvent(36),
            createScrollEvent(38)
        ] }] }, 40);
        expect(res).toEqual([
            { type: 'idle', start: 0, end: 20 },
            { type: 'action', start: 20, end: 25 },
            { type: 'idle', start: 25, end: 36 },
            { type: 'action', start: 36, end: 38 },
            { type: 'idle', start: 38, end: 40 }
        ])
    });

    it("Can start and end with an active region", () => {
        const res = service.splitRegions({ changes: [], inputs: [{ name: 'scroll', elements: [
            createScrollEvent(5),
            createScrollEvent(14),
            createScrollEvent(23),
        ] }] }, 23);
        expect(res).toEqual([
            { type: 'action', start: 0, end: 23 },
        ])
    });

    it("Can produce zero-length action regions (interactions handled elsewhere)", () => {
        const res = service.splitRegions({changes: [], inputs: [{ name: 'scroll', elements: [
            createScrollEvent(15)
        ] }] }, 30)
        expect(res).toEqual([
            { type: 'idle', start: 0, end: 15 },
            { type: 'action', start: 15, end: 15 },
            { type: 'idle', start: 15, end: 30 },
        ])
    })
})

function createScrollEvent(time: number) {
    return { type: 'scroll' as 'scroll', scrollY: 123, scrollX: 1, target: null, timestamp: time };
}
