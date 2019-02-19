import { createStyles, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import { convertMapToGroups, Group, mergeGroups, pluck, RecordedMutationGroup, RecordedUserInput, Recording, RecordingChunk, SnapshotChunk, sortAsc } from "@xsrt/common";
import { withDependencies } from "@xsrt/common-frontend";
import React, { useEffect, useState } from "react";
import { DomPreviewService } from "../../playback/dom-preview-service";
import { AnnotationService, RecordingAnnotation } from "../../services/annotation/annotation-service";
import { ChunkApiService } from "../../services/chunk-api-service";
import { RecordingApiService } from "../../services/recording-service";
import { Region, RegionService } from "../../services/regions-service";
import { TweakableConfigs } from "../../services/viewer-tweaks";
import { topNavHeight } from "../app-root/top-nav/top-nav";
import { eventsBetween } from "../utils/recording-data-utils";
import { RecordingViewer } from "./recording-viewer";

const styles = (theme: Theme) => createStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        minHeight: 480,
        height: `calc(100vh - ${theme.spacing.unit * topNavHeight}px)`
    }
});

const initState: RecordingViewState = {
    recording: null,
    bufferPos: 0,
    requestedChunks: [],
    retrievedChunks: [],

    snapshots: [],
    changes: [],
    inputs: [],
    annotations: [],
    regions: []
};

// TODO - This data-passing pattern may need to be rethought if/when there's a standalone viewer
const _RecordingView = ({
    classes, uiTweaks, chunkService, previewService, annotationService, regionService, recordingService, recordingId
}: RecordingViewProps) => {

    const [state, setState] = useState(initState);
    const sortByTimestamp = sortAsc(pluck("timestamp"));
    const sortSnapshot = sortAsc<SnapshotChunk>(snap => snap.metadata.startTime);

    const processChunk = (chunk: RecordingChunk, recording: Recording) => {
        setState(oldState => {
            const snapshots = oldState.snapshots.concat(chunk.type === "snapshot" ? chunk : [])
                .sort(sortSnapshot);
            const changes = oldState.changes.concat(chunk.changes)
                .sort(sortByTimestamp);
            const inputs = mergeGroups(oldState.inputs, convertMapToGroups(chunk.inputs), sortByTimestamp);

            const retrievedChunks = oldState.retrievedChunks.concat(chunk._id);
            const bufferPos = calcBuffer(retrievedChunks, recording);

            const allEvents = eventsBetween(changes, inputs, 0, bufferPos);
            previewService.registerUpdate({
                changes,
                snapshots
            });

            return {
                ...oldState,
                snapshots,
                changes,
                inputs,
                annotations: annotationService.annotate(allEvents),
                retrievedChunks,
                bufferPos,
                regions: regionService.splitRegions(allEvents, bufferPos)
            };
        });
    };

    const updateBuffer = async (time = 0) => {
        if (state.recording !== null) {
            const chunksToGrab = state.recording.chunks.filter(chunk =>
                chunk.metadata.startTime - time < uiTweaks.idealBuffer
                    && !state.requestedChunks.includes(chunk._id)
            );

            setState(old => ({
                ...old,
                requestedChunks: old.requestedChunks.concat(chunksToGrab.map(chunk => chunk._id))
            }));

            chunksToGrab.forEach(async chunkShell => {
                const chunk = await chunkService.fetchChunk(chunkShell._id);
                processChunk(chunk, state.recording!);
            });
        }
    };

    useEffect(() => {
        updateBuffer();
    });

    useEffect(() => {
        recordingService.fetchRecordingData(recordingId)
            .then(recording => setState(old => ({ ...old, recording })));
    }, [recordingId]);

    return <div className={ classes.root }>
        { state.recording === null
            ? <Typography variant="body1">Loading</Typography>
            : <RecordingViewer
                changes={ state.changes }
                inputs={ state.inputs }
                snapshots={ state.snapshots }

                recordingMetadata={ state.recording.metadata }
                annotations={ state.annotations }
                regions={ state.regions }

                bufferPos={ state.bufferPos }
                onUpdateTime={ updateBuffer }
                duration={ calcEnd(state.recording) } />
        }
    </div>;

};

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

function calcEnd(recording: Recording) {
    return Math.max(
        ...recording.chunks.map(chunk => chunk.metadata.stopTime)
    );
}

export const RecordingView = withStyles(styles)(
    withDependencies(_RecordingView,
        {
            recordingService: RecordingApiService,
            chunkService: ChunkApiService,
            annotationService: AnnotationService,
            previewService: DomPreviewService,
            regionService: RegionService,
            uiTweaks: TweakableConfigs
        }
    )
);

interface RecordingViewProps extends WithStyles<typeof styles> {
    recordingId: string;
    chunkService: ChunkApiService;
    annotationService: AnnotationService;
    previewService: DomPreviewService;
    regionService: RegionService;
    recordingService: RecordingApiService;
    uiTweaks: TweakableConfigs;
}

interface RecordingViewState {
    recording: Recording | null;
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
    inputs: Group<RecordedUserInput>[];
    annotations: RecordingAnnotation[];
    regions: Region[];

    bufferPos: number;
    requestedChunks: string[];
    retrievedChunks: string[];
}
