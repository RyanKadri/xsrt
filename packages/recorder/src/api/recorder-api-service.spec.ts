import { EndpointApi, recordingEndpoint } from "../../../common/src";
import { RecorderApiService } from './recorder-api-service';
import { RecordingStateService } from "./recording-state-service";

describe(RecorderApiService.name, () => {
    const noopMock = jasmine.createSpyObj("temp", { temp: 1 });
    it('Returns the current recording ID and relative start time if a recording session is in progress', async (done) => {
        const recordingState = jasmine.createSpyObj<RecordingStateService>("RecordingStateService", {
            fetchRecordingId: "abc",
            fetchStartTime: 5,
        });
        const service = new RecorderApiService(recordingState, noopMock, noopMock, { now() { return 10 } });
        const res = await service.startRecording("whatever");
        expect(res._id).toBe("abc");
        expect(res.startTime).toBe(5);
        done();
    });

    it('Starts a new recording if no active recording is present', async (done) => {
        const recordingState = jasmine.createSpyObj<RecordingStateService>("RecordingStateService", {
            fetchRecordingId: undefined,
            fetchStartTime: undefined,
            saveStartTime: undefined,
            saveRecordingId: undefined
        });
        const recordingApi = jasmine.createSpyObj<EndpointApi<typeof recordingEndpoint>>("RecordingApi", {
            createRecording: Promise.resolve({_id: "sdf" })
        });
        const service = new RecorderApiService(recordingState, recordingApi, noopMock, { now() { return 10; } });
        const res = await service.startRecording("whatever");
        expect(res._id).toBe("sdf");
        expect(recordingState.saveRecordingId).toHaveBeenCalledWith("sdf");
        done();
    })

});
