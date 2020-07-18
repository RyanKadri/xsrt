import { NoopLogger, ScrapedHtmlElement } from "../../../../common/src";
import { MutationTransformer } from './mutation-transformer';

describe(MutationTransformer.name, () => {
    it('Returns an empty array for mutations on non-managed nodes', () => {
        const domWalker: ConstructorParameters<typeof MutationTransformer>[0] = {
          fetchManagedNode: jest.fn(),
          isManaged: jest.fn(),
          traverseNode: jest.fn()
        };
        const logger = new NoopLogger();
        const tracker = new MutationTransformer(domWalker, logger);
        tracker.transformMutation({} as MutationRecord)
    });

    it('Converts mutationRecords for attributes', () => {
        const scrapedEl: Partial<ScrapedHtmlElement> = { id: 321 };
        const domEl = { getAttribute: jest.fn(() => "attr-val") } as unknown as HTMLElement;
        const mutation: Partial<MutationRecord> = {
            type: "attributes",
            attributeName: "attr-name",
            target: domEl
        };

        const domWalker: ConstructorParameters<typeof MutationTransformer>[0] = {
          fetchManagedNode: jest.fn(() => scrapedEl as any),
          isManaged: () => true,
          traverseNode: jest.fn()
        };

        const transformer = new MutationTransformer(domWalker, new NoopLogger());

        const transformed = transformer.transformMutation(mutation as any);

        expect(domEl.getAttribute).toHaveBeenCalledWith("attr-name");
        expect(transformed).toEqual([{
            type: "attribute",
            attribute: {
                name: "attr-name",
                value: "attr-val",
            },
            target: 321
        }])

    });
})
