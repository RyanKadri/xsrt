import { RecorderApiService } from './recorder-api-service';

describe(RecorderApiService.name, () => {
  const noopMock: any = jest.fn();
  it('Returns the current recording ID and relative start time if a recording session is in progress', async (done) => {
    const recordingState: ConstructorParameters<typeof RecorderApiService>[0] = {
      fetchRecordingId: jest.fn().mockReturnValue("abc"),
      fetchStartTime: jest.fn(() => 5),
      saveStartTime: jest.fn(),
      saveRecordingId: jest.fn(),
    };
    const service = new RecorderApiService(recordingState, noopMock, noopMock, { now() { return 10 } });
    const res = await service.startRecording("whatever");
    expect(res.uuid).toBe("abc");
    expect(res.startTime).toBe(5);
    done();
  });

  it('Starts a new recording if no active recording is present', async (done) => {
    const recordingState: ConstructorParameters<typeof RecorderApiService>[0] = {
      fetchRecordingId: jest.fn(() => undefined),
      fetchStartTime: jest.fn(() => undefined),
      saveStartTime: jest.fn(),
      saveRecordingId: jest.fn(),
    };
    const recordingApi: ConstructorParameters<typeof RecorderApiService>[1] = {
      createRecording: jest.fn(() => Promise.resolve({ uuid: "sdf" }))
    };
    const service = new RecorderApiService(recordingState, recordingApi, noopMock, { now() { return 10; } });
    const res = await service.startRecording("whatever");
    expect(res.uuid).toBe("sdf");
    expect(recordingState.saveRecordingId).toHaveBeenCalledWith("sdf");
    done();
  })

});
