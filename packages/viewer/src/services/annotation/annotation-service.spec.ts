import { RecordedResize } from '../../../scraper/types/event-types';
import { AnnotationService } from "./annotation-service";

describe(AnnotationService.name, () => {
    it('Breaks inputs into groups based on debounce time', () => {
        const service = new AnnotationService([ { 
            type: 'resize',
            listen: 'input' as 'input',
            debounceTime: 10,
            annotate() {
                return { description: 'something' }
            } 
        }], { annotationEventDebounce: 500 });
         
        const annotations = service.annotate({ 
            inputs: 
                [{ name: 'resize', elements: [
                    resizeWithTimestamp(1),
                    resizeWithTimestamp(2),
                    resizeWithTimestamp(22)
                ]}],
            changes: [] 
        });

        expect(annotations.length).toEqual(2)
    })
})

function resizeWithTimestamp(timestamp: number): RecordedResize {
    return { type: 'resize', timestamp, height: 1, width: 1 }
}