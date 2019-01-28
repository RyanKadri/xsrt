import { DeepPartial, SnapshotChunk } from "@xsrt/common";
import { DomPreviewService, HtmlNodePreview } from './dom-preview-service';

describe(DomPreviewService.name, () => {

    let previewService: DomPreviewService;

    beforeEach(() => {
        previewService = new DomPreviewService();
    })
    it("Applies attribute changes to the starting state of an element to calculate a future state", () => {
        previewService.registerUpdate({ snapshots: [baseSnapshot() as any], changes: [
            { timestamp: 15, mutations: [
                { type: "attribute", target: 2, name: "bar", val: "bcd" },
                { type: "attribute", target: 1, name: "baz", val: "cde" },
            ]}
        ]});
        const preview = previewService.previewNode(2, 16) as HtmlNodePreview;
        expect(preview).toEqual({ type: 'element', tag: "target", attributes: { foo: "abc", bar: "bcd" } })
    });

    it("Applies text changes to the starting state of textNodes for previews", () => {
        previewService.registerUpdate({ snapshots: [baseSnapshot() as any], changes: [
            { timestamp: 15, mutations: [
                { type: "change-text", target: 3, update: "xyz" }
            ]},
            { timestamp: 17, mutations: [
                { type: "change-text", target: 3, update: "tooLate" }
            ]}
        ]});
        const preview = previewService.previewNode(3, 16);
        expect(preview).toEqual({ type: 'text', content: 'xyz' })
    });

    it("Can preview children created in a mutation after the initial snapshot", () => {
        previewService.registerUpdate({ snapshots: [baseSnapshot() as any], changes: [
            { timestamp: 15, mutations: [
                { type: "children" as 'children', target: 1, additions: [{
                    before: null, data: { type: 'element', id: 4, tag: 'added', attributes: [], children: [] }
                }] },
                { type: "attribute", target: 4, name: 'new', val: "attr" }
            ]}
        ]});
        const preview = previewService.previewNode(4, 16);
        expect(preview).toEqual({ type: 'element', attributes: { new: "attr" }, tag: 'added' })
    })
})

function baseSnapshot(): DeepPartial<SnapshotChunk> {
    return {
        type: "snapshot" as "snapshot",
        metadata: { startTime: 12 },
        snapshot: {
            root: {
                id: 1,
                tag: 'start',
                children: [
                    {
                        id: 2,
                        type: 'element' as 'element',
                        tag: "target",
                        children: [
                            { type: 'text', content: "asd", id: 3 }
                        ],
                        attributes: [{ name: "foo", value: "abc" }]
                    }
                ],
                type: 'element' as 'element'
            }
        }
    }
}
