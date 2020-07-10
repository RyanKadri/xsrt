import { convertMapToGroups, mergeGroups, pluck, Recording, SnapshotChunk, sortAsc } from "../../../../common/src";
import { RecordingViewAction, RecordingViewState } from "./recording-view";

const sortByTimestamp = sortAsc(pluck("timestamp"));
const sortSnapshot = sortAsc<SnapshotChunk>(snap => snap.startTime);

export function recordingViewReducer(state: RecordingViewState, action: RecordingViewAction): RecordingViewState {
    switch (action.type) {
        case "fetchChunks":
            return {
                ...state,
                requestedChunks: state.requestedChunks.concat(action.chunks.map(chunk => chunk.uuid))
            };
        case "receiveRecording":
            return { ...state, recording: action.recording };
        case "receiveChunk":
            const retrievedChunks = state.retrievedChunks.concat(action.chunk.uuid);
            return {
                ...state,
                snapshots: state.snapshots
                                .concat(action.chunk.chunkType === "snapshot" ? action.chunk as SnapshotChunk : [])
                                .sort(sortSnapshot),
                changes: state.changes
                              .concat(action.chunk.changes)
                              .sort(sortByTimestamp),
                inputs: mergeGroups(
                        state.inputs,
                        convertMapToGroups(action.chunk.inputs || {}),
                        sortByTimestamp
                ),
                retrievedChunks,
                bufferPos: calcBuffer(retrievedChunks, state.recording! )
            };
        case "annotateRecording":
            return {
                ...state,
                annotations: action.annotations,
                regions: action.regions
            };
    }
}

function calcBuffer(retrievedChunks: string[], recording: Recording) {
    const chunks = recording.chunks;
    const minStopNotFetched = Math.min(...chunks
        .filter(chunk => !retrievedChunks.includes(chunk.uuid))
        .map(chunk => chunk.endTime)
    );
    const maxReady = Math.max(...chunks
        .filter(chunk => retrievedChunks.includes(chunk.uuid))
        .map(chunk => chunk.endTime)
        .filter(start => start < minStopNotFetched)
    );
    return maxReady;
}
