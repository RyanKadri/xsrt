import { makeStyles, Theme, Typography } from "@material-ui/core";
import React, { useEffect, useReducer } from "react";
import { withDependencies } from "../../../../common-frontend/src";
import { Group, RecordedMutationGroup, RecordedUserInput, Recording, RecordingChunk, SnapshotChunk } from "../../../../common/src";
import { DomPreviewService } from "../../playback/dom-preview-service";
import { AnnotationService, RecordingAnnotation } from "../../services/annotation/annotation-service";
import { ChunkApiService } from "../../services/chunk-api-service";
import { RecordingApiService } from "../../services/recording-service";
import { Region, RegionService } from "../../services/regions-service";
import { TweakableConfigs } from "../../services/viewer-tweaks";
import { topNavHeight } from "../app-root/top-nav/top-nav";
import { eventsBetween } from "../utils/recording-data-utils";
import { recordingViewReducer } from "./recording-view-reducer";
import { RecordingViewer } from "./recording-viewer";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: 480,
    height: `calc(100vh - ${theme.spacing(1) * topNavHeight}px)`
  }
}));

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

interface Props {
  recordingId: string;
  chunkService: ChunkApiService;
  annotationService: AnnotationService;
  previewService: DomPreviewService;
  regionService: RegionService;
  recordingService: RecordingApiService;
  uiTweaks: TweakableConfigs;
}

export interface RecordingViewState {
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

// TODO - This data-passing pattern may need to be rethought if/when there's a standalone viewer
function _RecordingView({
  uiTweaks, chunkService, previewService, annotationService, regionService, recordingService, recordingId
}: Props) {
  const classes = useStyles();
  const [state, dispatch] = useReducer(recordingViewReducer, initState);

  const updateBuffer = async (time = 0) => {
    if (state.recording !== null) {
      const chunksToGrab = state.recording.chunks.filter(chunk =>
        chunk.startTime - time < uiTweaks.idealBuffer
        && !state.requestedChunks.includes(chunk.uuid)
      );

      dispatch({ type: "fetchChunks", chunks: chunksToGrab });

      chunksToGrab.forEach(async chunkShell => {
        const chunk = await chunkService.fetchChunk(chunkShell.uuid);
        dispatch({ type: "receiveChunk", chunk });
      });
    }
  };

  const calcEnd = (recording: Recording) => {
    return Math.max(
      ...recording.chunks.map(chunk => chunk.endTime)
    );
  };

  useEffect(() => {
    updateBuffer();
  }, [state.recording]);

  useEffect(() => {
    recordingService.fetchRecordingData(recordingId)
      .then(recording => dispatch({ type: "receiveRecording", recording }));
  }, [recordingId]);

  useEffect(() => {
    previewService.registerUpdate({
      changes: state.changes,
      snapshots: state.snapshots
    });
  }, [state.changes, state.snapshots]);

  useEffect(() => {
    const allEvents = eventsBetween(state.changes, state.inputs, 0, state.bufferPos);
    const annotations = annotationService.annotate(allEvents);
    const regions = regionService.splitRegions(allEvents, state.bufferPos);
    dispatch({ type: "annotateRecording", annotations, regions });
  }, [state.bufferPos]);

  return <div className={classes.root}>
    {state.recording === null
      ? <Typography variant="body1">Loading</Typography>
      : <RecordingViewer
        changes={state.changes}
        inputs={state.inputs}
        snapshots={state.snapshots}

        annotations={state.annotations}
        regions={state.regions}

        bufferPos={state.bufferPos}
        onUpdateTime={updateBuffer}
        duration={calcEnd(state.recording)} />
    }
  </div>;
}

export const RecordingView = withDependencies(_RecordingView,
  {
    recordingService: RecordingApiService,
    chunkService: ChunkApiService,
    annotationService: AnnotationService,
    previewService: DomPreviewService,
    regionService: RegionService,
    uiTweaks: TweakableConfigs
  }
);

export type RecordingViewAction = { type: "receiveChunk", chunk: RecordingChunk } |
{ type: "receiveRecording", recording: Recording } |
{ type: "fetchChunks", chunks: RecordingChunk[] } |
{ type: "annotateRecording", annotations: RecordingAnnotation[], regions: Region[] };
