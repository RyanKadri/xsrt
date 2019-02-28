import { LoggingService, ScrapedHtmlElement } from "@xsrt/common";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { MutationTransformer } from './mutation-transformer';

describe(MutationTransformer.name, () => {
    it('Returns an empty array for mutations on non-managed nodes', () => {
        const domWalker = jasmine.createSpyObj<RecordingDomManager>("domWalker", { fetchManagedNode: undefined });
        const logger = jasmine.createSpyObj<LoggingService>("logger", { info: undefined } );
        const tracker = new MutationTransformer(domWalker, logger);
        tracker.transformMutation({} as MutationRecord)
    });

    it('Converts mutationRecords for attributes', () => {
        const scrapedEl: Partial<ScrapedHtmlElement> = { id: 321 };
        const domEl = jasmine.createSpyObj<HTMLElement>("html", { getAttribute: "attr-val" });
        const mutation: Partial<MutationRecord> = {
            type: "attributes",
            attributeName: "attr-name",
            target: domEl
        };

        const domWalker = jasmine.createSpyObj<RecordingDomManager>("domWalker", { fetchManagedNode: scrapedEl as any });
        const logger = jasmine.createSpyObj<LoggingService>("logger", { info: undefined } );

        const transformer = new MutationTransformer(domWalker, logger);

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
