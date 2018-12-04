import { formatDate, formatDuration } from "./format-utils";

describe('format-utils', () => {
    describe('formatDate', () => {
        it('Formats a time in ms to the corresponding english locale format', () => {
            expect(formatDate(1543954498533)).toBe('12/4/2018');
        })
    })

    describe('formatDuration', () => {
        it('Formats a duration in milliseconds to mm:ss format', () => {
            expect(formatDuration(1000)).toBe('00:01');
            expect(formatDuration(61000)).toBe('01:01');
        })
    })
})