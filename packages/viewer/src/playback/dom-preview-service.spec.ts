import { DeepPartial, SnapshotChunk } from "../../../common/src";
import { DomPreviewService, HtmlNodePreview } from './dom-preview-service';

describe(DomPreviewService.name, () => {

  let previewService: DomPreviewService;
  const attrType: "attribute" = "attribute";
  beforeEach(() => {
    previewService = new DomPreviewService();
  });

  it("Applies attribute changes to the starting state of an element to calculate a future state", () => {
    previewService.registerUpdate({
      snapshots: [baseSnapshot() as any], changes: [
        {
          timestamp: 15, mutations: [
            { type: attrType, target: 2, attribute: { name: "bar", value: "bcd" } },
            { type: attrType, target: 1, attribute: { name: "baz", value: "cde" } },
          ]
        }
      ]
    });
    const preview = previewService.previewNode(2, 16) as HtmlNodePreview;
    expect(preview).toEqual({ type: 'element', tag: "target", attributes: { foo: "abc", bar: "bcd" } })
  });

  it("Applies text changes to the starting state of textNodes for previews", () => {
    previewService.registerUpdate({
      snapshots: [baseSnapshot() as any], changes: [
        {
          timestamp: 15, mutations: [
            { type: "change-text", target: 3, update: "xyz" }
          ]
        },
        {
          timestamp: 17, mutations: [
            { type: "change-text", target: 3, update: "tooLate" }
          ]
        }
      ]
    });
    const preview = previewService.previewNode(3, 16);
    expect(preview).toEqual({ type: 'text', content: 'xyz' })
  });

  it("Can preview children created in a mutation after the initial snapshot", () => {
    previewService.registerUpdate({
      snapshots: [baseSnapshot() as any], changes: [
        {
          timestamp: 15, mutations: [
            {
              type: "children" as 'children', target: 1, additions: [{
                before: null, data: { type: 'element', id: 4, tag: 'added', attributes: [], children: [] }
              }]
            },
            { type: attrType, target: 4, attribute: { name: 'new', value: "attr" } }
          ]
        }
      ]
    });
    const preview = previewService.previewNode(4, 16);
    expect(preview).toEqual({ type: 'element', attributes: { new: "attr" }, tag: 'added' })
  })
})

function baseSnapshot(): DeepPartial<SnapshotChunk> {
  return {
    chunkType: "snapshot" as "snapshot",
    startTime: 12,
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
