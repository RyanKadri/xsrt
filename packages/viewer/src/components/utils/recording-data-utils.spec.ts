import { eventsBetween } from "./recording-data-utils";

describe(eventsBetween.name, () => {
  it('Returns nothing when there are no events passed in', () => {
    const events = eventsBetween([], [], 0, 1000);
    expect(events).toEqual({ changes: [], inputs: [] })
  })
})
