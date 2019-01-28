import { TimeManager } from "./time-manager";

describe(TimeManager.name, () => {
    const createDateManager = (time: number) => ({ now(){ return time } });
    const createRecordingState = (recordStart?: number | undefined) => ({ fetchStartTime() { return recordStart } })

    it('Throws an error if you try to get the recording start time before actually starting', () => {
        const timeManager = new TimeManager(createRecordingState(1), createDateManager(1) );
        expect(() => timeManager.fetchSessionStart()).toThrow();
    });

    it('Returns the elapsed time on stop', () => {
        const dateManager = createDateManager(3);
        const recordingState = createRecordingState(1);
        const timeManager = new TimeManager(recordingState, dateManager);
        timeManager.start();
        expect(timeManager.stop()).toEqual(2);
    });

    it('The session start is the difference between the overall recording start and the session start', () => {
        const dateManager = createDateManager(3);
        const recordingState = createRecordingState(1);
        const timeManager = new TimeManager(recordingState, dateManager);
        timeManager.start();
        expect(timeManager.fetchSessionStart()).toEqual(2);
    });

    it('Uses the current time as the recording start if the recordingState service does not have a start time', () => {
        const mutableTime = { time: 1 }
        const dateManager = { now() { return mutableTime.time } }
        const timeManager = new TimeManager(createRecordingState(), dateManager);
        timeManager.start();
        mutableTime.time = 2;
        expect(timeManager.currentTime()).toBe(1);
    })
})
