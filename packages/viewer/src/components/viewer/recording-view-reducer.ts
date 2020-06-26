import { convertMapToGroups, mergeGroups, pluck, Recording, SnapshotChunk, sortAsc } from "@xsrt/common";
import { RecordingViewAction, RecordingViewState } from "./recording-view";

const sortByTimestamp = sortAsc(pluck("timestamp"));
const sortSnapshot = sortAsc<SnapshotChunk>(snap => snap.metadata.startTime);

export function recordingViewReducer(state: RecordingViewState, action: RecordingViewAction): RecordingViewState {
    switch (action.type) {
        case "fetchChunks":
            return {
                ...state,
                requestedChunks: state.requestedChunks.concat(action.chunks.map(chunk => chunk._id))
            };
        case "receiveRecording":
            return { ...state, recording: action.recording };
        case "receiveChunk":
            const retrievedChunks = state.retrievedChunks.concat(action.chunk._id);
            return {
                ...state,
                snapshots: state.snapshots
                                .concat(action.chunk.type === "snapshot" ? action.chunk : [])
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
        .filter(chunk => !retrievedChunks.includes(chunk._id))
        .map(chunk => chunk.metadata.stopTime)
    );
    const maxReady = Math.max(...chunks
        .filter(chunk => retrievedChunks.includes(chunk._id))
        .map(chunk => chunk.metadata.stopTime)
        .filter(start => start < minStopNotFetched)
    );
    return maxReady;
}
